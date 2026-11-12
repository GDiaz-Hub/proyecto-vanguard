// src/context/GameContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  CITADEL_STORAGE_CATALOG,
  FACTIONS,
  INITIAL_CITADEL_BUILDINGS,
  INITIAL_CITADEL_TECHNOLOGIES,
  INITIAL_LOADOUTS,
  getDefaultHeroLoadout,
} from '../data/gameData';
import {
  MOCK_COMBAT_LOGS,
  MOCK_CREDITS,
  MOCK_HERO_STATS,
  MOCK_INVENTORY,
} from '../data/mockState';
import { Planet, SECTORS_DATA, StarSector } from '../data/starMap.data';
import { FactionThemeTokens, getFactionTheme } from '../data/themeConfig';
import {
  ChassisQuality,
  CitadelBuilding,
  CitadelStorageItem,
  CombatEnemy,
  CombatEquipableSkill,
  CombatFloatingEvent,
  CombatSpeed,
  CombatSquadUnit,
  CombatTurnPhase,
  CombatTurnQueueItem,
  DefenseType,
  EnemyIntentType,
  FactionId,
  FactionInfo,
  HardSciFiAchievement,
  HeroChassisItem,
  HeroChassisSlot,
  HeroLoadout,
  ModuleTab,
  OperationalDirective,
  PlayerCombatStatus,
  ReactorRoutingMode,
  ResourceIconKey,
  ResourceTier,
  Technology,
  TutorialScreenKey,
} from '../types/game';

export interface CombatSessionLootItem {
  id: string;
  name: string;
  amount: number;
  iconKey: ResourceIconKey;
  tier: number;
}

export interface CombatSessionLoot {
  credits: number;
  wavesCleared: number;
  items: CombatSessionLootItem[];
}

export interface ActiveUpgradeTimer {
  targetId: string;
  targetTitle: string;
  targetLevel: number;
  startTime: number;
  endTime: number;
  durationSec: number;
}

export function getUpgradeDurationSeconds(
  currentLevel: number,
  routingMode: ReactorRoutingMode = 'none'
): number {
  const baseSec = Math.round(15 * Math.pow(1.85, Math.max(0, currentLevel - 1)));
  const factor = routingMode === 'industrial' ? 0.8 : 1.0;
  return Math.max(5, Math.round(baseSec * factor));
}

function computeLevelAndPctFromXp(
  totalXp: number,
  baseReq: number,
  exponent: number,
  maxLvl: number
): { level: number; pct: number; currentXpInLevel: number; requiredForNext: number } {
  let lvl = 1;
  let remaining = Math.max(0, Math.floor(totalXp));
  while (lvl < maxLvl) {
    const req = Math.round(baseReq * Math.pow(lvl, exponent));
    if (remaining >= req) {
      remaining -= req;
      lvl += 1;
    } else {
      return {
        level: lvl,
        pct: Math.min(99, Math.floor((remaining / Math.max(1, req)) * 100)),
        currentXpInLevel: remaining,
        requiredForNext: req,
      };
    }
  }
  return { level: maxLvl, pct: 100, currentXpInLevel: 0, requiredForNext: 0 };
}

import { ForgeCostPill, ForgeRecipeItem } from '../components/ForgeView';
import { calculateScaledCosts } from '../components/CiudadelaView';

import {
  CANONICAL_FACTION_UNITS,
  FACTION_RESOURCE_SPECS,
  FACTION_SKILL_LOADOUTS,
  GAME_BALANCE,
  HERO_PORTRAITS_CATALOG,
  OPERATIONAL_DIRECTIVES_CATALOG,
  PlanetHostileSpec,
  REACTOR_ROUTING_PROTOCOLS,
  UNIT_SPRITES_CATALOG,
  getBaseSpeedForFaction,
  getDefenseTypeForFaction,
  getPlanetHostilesRoster,
  getTurnPortraitForSpriteUrl,
} from '../data/factionIdentityCatalog';
import { playGameSfx } from '../utils/soundSynthesizer';

function getFactionAudioPrefix(fac: FactionId): 'val' | 'ski' | 'cyg' {
  if (fac === 'skithid') return 'ski';
  if (fac === 'cygnus') return 'cyg';
  return 'val';
}

function getDefenseImpactAudioCue(defType: DefenseType): string {
  if (defType === 'Shields') return 'hit_shield';
  if (defType === 'Evasion') return 'hit_evasion';
  return 'hit_armor';
}

const SAVE_STORAGE_KEY = 'vanguard_mvp_save_v5_beta';

function sanitizeFiniteInt(
  value: unknown,
  fallback: number,
  min = 0,
  max = 10_000_000
): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(num)));
}

function sanitizeInventoryMap(
  rawInv: unknown,
  fallback: Record<string, number>
): Record<string, number> {
  if (!rawInv || typeof rawInv !== 'object') return fallback;
  const cleaned: Record<string, number> = {};
  for (const [k, v] of Object.entries(rawInv as Record<string, unknown>)) {
    cleaned[k] = sanitizeFiniteInt(v, 0, 0, 999_999);
  }
  return cleaned;
}

export const HERO_PORTRAITS_MAP = HERO_PORTRAITS_CATALOG;
export { UNIT_SPRITES_CATALOG };

const DEFAULT_PREVIEW_ENEMY: CombatEnemy & { level?: number; spriteUrl?: string } = {
  id: 'mock_enemy',
  name: CANONICAL_FACTION_UNITS.cygnus[1].name,
  subtitle: 'Sector en Disputa // Nv. 2',
  faction: 'cygnus',
  threatLevel: 2,
  damageType: 'Energy',
  defenseType: 'Shields',
  resistances: { kinetic: 10, energy: 10, corrosive: 10 },
  maxHp: 320,
  maxShield: 210,
  regenerationPerTick: 0,
  attackDamage: 48,
  attackIntervalSeconds: 1.05,
  armorPercent: 0,
  evasionPercent: 0,
  rewardCredits: 95,
  rewardResourceId: FACTION_RESOURCE_SPECS.cygnus.rawT1.id,
  rewardAmount: 8,
  lore: 'Unidad táctica de patrulla.',
};

function computeEffectiveSlotStat(item: HeroChassisItem): number {
  const mult = item.lowPowerMode
    ? GAME_BALANCE.reactor.lowPowerChassisStatFactor
    : 1;
  return Math.max(1, Math.round(item.primaryStat.value * mult));
}

function computeEffectiveSlotMw(item: HeroChassisItem): number {
  const mult = item.lowPowerMode
    ? GAME_BALANCE.reactor.lowPowerChassisMwFactor
    : 1;
  return Math.max(4, Math.round(item.powerDrawMw * mult));
}

function computeLoadoutTotalMw(loadout: HeroLoadout): number {
  const slots: HeroChassisSlot[] = ['weapon', 'chest', 'helmet', 'gloves', 'boots'];
  return slots.reduce((sum, s) => sum + computeEffectiveSlotMw(loadout[s]), 0);
}

/**
 * Construye el escuadrón enemigo escalado progresivamente por Tier Planetario (Tier I a V)
 * y nivel real del planeta, garantizando que el jugador NUNCA luche contra su propia facción
 * en su Sector Natal y se sienta como un "Soldado Cúspide" en el Planeta Natal (1 enemigo en Tier I).
 */
function resolveSectorIdFromPlanetId(planetId: string): string {
  if (planetId.includes('SKI')) return 'SEC-SKI-01';
  if (planetId.includes('CYG')) return 'SEC-CYG-01';
  if (planetId.includes('ORI')) return 'SEC-NEU-WEST';
  if (planetId.includes('AET')) return 'SEC-NEU-EAST';
  if (planetId.includes('VESP') || planetId.includes('VES')) return 'SEC-NEU-01';
  return 'SEC-VAL-01';
}

function pickWeightedHostile(
  roster: PlanetHostileSpec[],
  waveNumber: number,
  slotIndex: number,
  excludeRareElite = false
): PlanetHostileSpec {
  // Mantiene el % estricto de la Amenaza Rara (3% base) sin inflarlo por oleada
  const weighted = roster.map((h) => {
    if (excludeRareElite && h.isRareElite) {
      return { hostile: h, weight: 0 };
    }
    let w = h.spawnChancePct;
    if (h.isRareElite) {
      return { hostile: h, weight: w };
    }
    if (waveNumber === 1 && h.unitClass === 'heavy') {
      w = Math.max(6, Math.round(w * 0.6));
    } else if (waveNumber === 3 && h.unitClass === 'heavy') {
      w = Math.round(w * 1.35);
    } else if (slotIndex === 1 && h.unitClass === 'light') {
      w = Math.round(w * 1.2);
    }
    return { hostile: h, weight: w };
  });

  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const item of weighted) {
    if (roll < item.weight) {
      return item.hostile;
    }
    roll -= item.weight;
  }
  return weighted[0].hostile;
}

function buildWaveSquad(
  planet: Planet | null,
  waveNumber: number,
  _playerFaction: FactionId,
  routingMode: ReactorRoutingMode = 'none',
  playerLevel = 1
): CombatSquadUnit[] {
  const planetId = planet?.id || 'PLN-VAL-01';
  const sectorId = resolveSectorIdFromPlanetId(planetId);
  const tier = planet?.tier ?? 1;
  const isStarterHomeworld =
    planetId.endsWith('-01') &&
    !planetId.includes('ORI') &&
    !planetId.includes('AET') &&
    !planetId.includes('VESP');
  const isStarterMoon =
    planetId.endsWith('-02') &&
    !planetId.includes('ORI') &&
    !planetId.includes('AET') &&
    !planetId.includes('VESP');

  let unitCount = 1;
  if (isStarterHomeworld) {
    unitCount = waveNumber === 2 ? 2 : 1;
  } else if (isStarterMoon) {
    unitCount = waveNumber === 1 ? 1 : 2;
  } else if (tier <= 3) {
    unitCount = 2;
  } else {
    unitCount = waveNumber === 1 ? 2 : 3;
  }

  const waveMultiplier = 1 + (waveNumber - 1) * 0.14;
  const baseLevel = planet?.enemyLevel ?? (tier === 1 ? 2 : tier * 7);
  const planetLootList = planet?.combatLoot || [];

  const roster = getPlanetHostilesRoster(
    planetId,
    sectorId,
    planetLootList,
    tier,
    baseLevel,
    routingMode
  );

  const units: CombatSquadUnit[] = [];
  let waveAlreadyHasRare = false;
  for (let i = 0; i < unitCount; i++) {
    const picked = pickWeightedHostile(roster, waveNumber, i, waveAlreadyHasRare);
    if (picked.isRareElite) {
      waveAlreadyHasRare = true;
    }
    const effectiveEnemyLevel = Math.max(
      1,
      picked.level + (waveNumber === 3 && !picked.isRareElite ? 1 : 0)
    );

    // Penalización por diferencia de nivel: si un jugador NV. 2 entra a un mundo NV. 7,
    // el enemigo aplica ventaja de nivel severa (+28% HP/DEF y +25% ATQ por nivel por encima de playerLevel + 1)
    const overLevelDelta = Math.max(0, effectiveEnemyLevel - (playerLevel + 1));
    const levelDisparityHpDefMult = 1 + overLevelDelta * 0.28;
    const levelDisparityAtkMult = 1 + overLevelDelta * 0.25;

    const maxHp = Math.round(
      picked.maxHp * waveMultiplier * levelDisparityHpDefMult
    );
    const maxDefense = Math.round(
      picked.maxDefense * waveMultiplier * levelDisparityHpDefMult
    );
    const attackDamage = Math.round(
      picked.attackDamage * waveMultiplier * levelDisparityAtkMult
    );

    const isHeavyOrRare =
      picked.unitClass === 'heavy' ||
      picked.unitClass === 'epic_boss' ||
      picked.isRareElite;

    const initialIntent: EnemyIntentType =
      isHeavyOrRare || (waveNumber >= 2 && i === 1) ? 'heavy' : 'attack';

    const primaryDrop = picked.lootDrops[0] || {
      id: 'valari_raw_t1_ferrita',
      name: 'Ferrita',
      amount: 5,
    };

    units.push({
      instanceId: `wave_${waveNumber}_unit_${i}_${Date.now()}`,
      unitKey: picked.unitKey,
      isRareElite: picked.isRareElite,
      spawnChancePct: picked.spawnChancePct,
      slotPosition: i as 0 | 1 | 2,
      name: picked.name,
      roleTitle: picked.roleTitle,
      faction: picked.factionStyle,
      defenseType: picked.defenseType,
      level: effectiveEnemyLevel,
      speed: picked.speed - i * 4,
      hp: maxHp,
      maxHp,
      defense: maxDefense,
      maxDefense,
      attackDamage,
      stunnedTurns: 0,
      brokenTurns: 0,
      corrosiveStacks: 0,
      shieldLockTurns: 0,
      illuminatedTurns: 0,
      intent: initialIntent,
      spriteUrl: picked.spriteUrl,
      portraitUrl: getTurnPortraitForSpriteUrl(picked.spriteUrl),
      rewardCredits: picked.rewardCredits,
      rewardResourceId: primaryDrop.id,
      rewardAmount: primaryDrop.amount + (waveNumber - 1),
    });
  }

  return units;
}

function buildInitialTurnOrder(
  squad: CombatSquadUnit[],
  playerFaction: FactionId
): ('player' | string)[] {
  const playerSpeed = getBaseSpeedForFaction(playerFaction) + 8;
  const entries: { id: 'player' | string; speed: number }[] = [
    { id: 'player', speed: playerSpeed },
    ...squad
      .filter((u) => u.hp > 0)
      .map((u) => ({ id: u.instanceId, speed: u.speed })),
  ];
  entries.sort((a, b) => b.speed - a.speed);
  return entries.map((e) => e.id);
}

function mapTabToTutorialScreenKey(tab: ModuleTab): TutorialScreenKey {
  if (tab === 'hub') return 'hub';
  if (tab === 'directivas') return 'directivas';
  if (tab === 'ciudadela_reactor') return 'ciudadela_reactor';
  if (tab === 'ciudadela_forja' || tab === 'forja') return 'ciudadela_forja';
  if (tab === 'ciudadela_laboratorio') return 'ciudadela_laboratorio';
  if (tab === 'ciudadela_almacen') return 'ciudadela_almacen';
  if (tab === 'comandante') return 'comandante';
  if (tab === 'exploracion') return 'exploracion';
  if (tab === 'exploracion_hostiles') return 'exploracion_hostiles';
  return 'combate';
}

interface GameContextValue {
  activeTab: ModuleTab;
  setActiveTab: (tab: ModuleTab) => void;
  factionId: FactionId;
  selectFaction: (id: FactionId, startWithTutorial?: boolean) => void;
  isSelectingFaction: boolean;
  openFactionSelector: () => void;

  // Tutorial contextual por pantalla (Just-in-Time)
  isTutorialActive: boolean;
  activeTutorialScreenKey: TutorialScreenKey;
  tutorialStepIndex: number;
  setTutorialStep: (stepIndex: number) => void;
  skipTutorial: () => void;
  disableAllTutorials: () => void;
  restartTutorial: () => void;

  usedReactorMw: number;
  maxReactorMw: number;
  reserveReactorMw: number;

  currentFaction: FactionInfo;
  theme: FactionThemeTokens;
  currentLocation: string;
  activePlanet: Planet | null;
  navigateToSector: (sector: StarSector, planet: Planet) => void;

  playerName: string;
  setPlayerName: (name: string) => void;
  characterLevel: number;
  professionLevel: number;
  heroXpPct: number;
  professionXpPct: number;
  heroLoadout: HeroLoadout;
  heroCombatStats: typeof MOCK_HERO_STATS;

  reactorRoutingMode: ReactorRoutingMode;
  setReactorRoutingMode: (mode: ReactorRoutingMode) => void;
  toggleChassisLowPower: (slot: HeroChassisSlot) => void;

  credits: number;
  inventory: Record<string, number>;
  buildings: CitadelBuilding[];
  technologies: Technology[];
  storageCatalog: CitadelStorageItem[];
  siloUsed: number;
  siloMaxCapacity: number;
  totalCitadelCostReductionPct: number;

  // Directivas Operativas, Aviso Toast y Logros Hard Sci-Fi
  directives: OperationalDirective[];
  claimDirective: (directiveId: string) => void;
  completedDirectiveToast: OperationalDirective | null;
  dismissDirectiveToast: () => void;
  achievements: HardSciFiAchievement[];

  // Navegación directa a pestaña específica de la Forja ('compuestos' | 'chasis')
  forgeInitialTab: 'compuestos' | 'chasis';
  openForgeTab: (tab: 'compuestos' | 'chasis') => void;

  // Botín acumulado en la sesión de combate y acciones al finalizar incursión (Oleada 3/3)
  combatSessionLoot: CombatSessionLoot;
  clearCombatSessionLoot: () => void;
  restartCurrentIncursion: () => void;
  advanceToNextPlanetIncursion: () => void;
  nextUnlockedPlanetName: string | null;

  selectedEnemy: CombatEnemy & { level?: number; spriteUrl?: string };
  enemySquad: CombatSquadUnit[];
  selectedTargetId: string;
  selectTarget: (unitId: string) => void;
  currentWave: number;
  totalWaves: number;
  turnPhase: CombatTurnPhase;
  turnQueue: CombatTurnQueueItem[];
  turnCount: number;
  isAutoCombat: boolean;
  toggleAutoCombat: () => void;
  combatSpeed: CombatSpeed;
  setCombatSpeed: (speed: CombatSpeed) => void;
  isCombatActive: boolean;
  toggleCombat: () => void;
  playerHp: number;
  maxPlayerHp: number;
  playerDefense: number;
  maxPlayerDefense: number;
  playerBuffTurns: number;
  playerCombatStatus: PlayerCombatStatus;
  equippedSkills: CombatEquipableSkill[];
  activeActorId: 'player' | string | null;
  hitTargetId: 'player' | string | null;
  floatingEvents: CombatFloatingEvent[];
  executeBasicAttack: () => void;
  executeSkill: (slotIndex: 1 | 2 | 3 | 4) => void;
  activityFeed: string[];

  upgradeBuilding: (buildingId: CitadelBuilding['id']) => void;
  researchTechnology: (techId: string) => void;
  activeBuildingUpgrades: Record<string, ActiveUpgradeTimer>;
  activeTechResearches: Record<string, ActiveUpgradeTimer>;
  nowTimestamp: number;
  scrapItem: (itemId: string, amount: number) => void;
  craftForgeItem: (item: ForgeRecipeItem) => void;
  upgradeHeroChassis: (
    slot: HeroChassisSlot,
    costs: ForgeCostPill[],
    rawExtraMw: number
  ) => void;
  encounteredEnemyKeys: Record<string, boolean>;
  resetGameProgress: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const savedState = useMemo(() => {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const [activeTab, setActiveTab] = useState<ModuleTab>('hub');
  const [forgeInitialTab, setForgeInitialTab] = useState<'compuestos' | 'chasis'>('compuestos');
  const [combatSessionLoot, setCombatSessionLoot] = useState<CombatSessionLoot>({
    credits: 0,
    wavesCleared: 0,
    items: [],
  });
  const [completedDirectiveToast, setCompletedDirectiveToast] =
    useState<OperationalDirective | null>(null);
  const [isSelectingFaction, setIsSelectingFaction] = useState<boolean>(true);
  const [tutorialsEnabled, setTutorialsEnabled] = useState<boolean>(true);
  const [visitedTutorialScreens, setVisitedTutorialScreens] = useState<
    Partial<Record<TutorialScreenKey, boolean>>
  >({});
  const [tutorialStepIndex, setTutorialStepIndex] = useState<number>(0);

  const [factionId, setFactionId] = useState<FactionId>(
    savedState?.factionId || 'valari'
  );
  const [reactorRoutingMode, setReactorRoutingModeState] =
    useState<ReactorRoutingMode>(savedState?.reactorRoutingMode || 'none');

  // Planeta inicial por defecto: Planeta Natal Tier I (planets[0]) de la facción
  const defaultSectorIdx =
    factionId === 'valari' ? 0 : factionId === 'skithid' ? 1 : 2;
  const defaultPlanet =
    SECTORS_DATA[defaultSectorIdx]?.planets[0] ||
    SECTORS_DATA[0]?.planets[0] ||
    null;

  const [activePlanet, setActivePlanet] = useState<Planet | null>(defaultPlanet);
  const [currentLocation, setCurrentLocation] = useState<string>(
    defaultPlanet ? defaultPlanet.name : 'Vaelor Prime'
  );
  const [playerName, setPlayerNameState] = useState<string>(
    savedState?.playerName || 'Comandante'
  );

  const setPlayerName = useCallback((nextName: string) => {
    const trimmed = nextName.trim().slice(0, 18);
    setPlayerNameState(trimmed.length > 0 ? trimmed : 'Comandante');
  }, []);

  const [credits, setCredits] = useState<number>(() =>
    sanitizeFiniteInt(savedState?.credits, MOCK_CREDITS, 0, 99_999_999)
  );
  const [inventory, setInventory] = useState<Record<string, number>>(() =>
    sanitizeInventoryMap(savedState?.inventory, MOCK_INVENTORY)
  );
  const [buildings, setBuildings] = useState<CitadelBuilding[]>(() => {
    if (!savedState?.buildings || !Array.isArray(savedState.buildings)) {
      return INITIAL_CITADEL_BUILDINGS;
    }
    return INITIAL_CITADEL_BUILDINGS.map((initB) => {
      const savedB = savedState.buildings.find(
        (b: CitadelBuilding) => b.id === initB.id
      );
      return savedB
        ? {
            ...initB,
            level: sanitizeFiniteInt(savedB.level, initB.level, 1, initB.maxLevel),
          }
        : initB;
    });
  });
  const [technologies, setTechnologies] = useState<Technology[]>(() => {
    if (!savedState?.technologies || !Array.isArray(savedState.technologies)) {
      return INITIAL_CITADEL_TECHNOLOGIES;
    }
    return INITIAL_CITADEL_TECHNOLOGIES.map((initT) => {
      const savedT = savedState.technologies.find(
        (t: Technology) => t.id === initT.id
      );
      return savedT
        ? {
            ...initT,
            level: sanitizeFiniteInt(savedT.level, initT.level, 0, initT.maxLevel),
          }
        : initT;
    });
  });
  const [heroLoadoutsByFaction, setHeroLoadoutsByFaction] = useState<
    Record<FactionId, HeroLoadout>
  >(() => {
    if (savedState?.heroLoadoutsByFaction) {
      const saved = savedState.heroLoadoutsByFaction as Record<
        FactionId,
        HeroLoadout
      >;
      // Normalizar antiguos guardados de Cygnus que tenían shieldCapacity inflado (80/25/20/20 -> 1712 Escudo en Nv.1)
      if (
        saved.cygnus &&
        saved.cygnus.chest?.level === 1 &&
        saved.cygnus.chest?.primaryStat?.value > 30
      ) {
        saved.cygnus = getDefaultHeroLoadout('cygnus');
      }
      return saved;
    }
    return {
      valari: getDefaultHeroLoadout('valari'),
      skithid: getDefaultHeroLoadout('skithid'),
      cygnus: getDefaultHeroLoadout('cygnus'),
    };
  });

  // Experiencia real acumulativa desde 0 en Nivel 1
  const [combatXp, setCombatXp] = useState<number>(() =>
    sanitizeFiniteInt(savedState?.combatXp, 0, 0, 99_999_999)
  );
  const [operationalXp, setOperationalXp] = useState<number>(() =>
    sanitizeFiniteInt(savedState?.operationalXp, 0, 0, 99_999_999)
  );

  // Temporizadores activos de construcción e investigación en tiempo real
  const [activeBuildingUpgrades, setActiveBuildingUpgrades] = useState<
    Record<string, ActiveUpgradeTimer>
  >(savedState?.activeBuildingUpgrades ?? {});
  const [activeTechResearches, setActiveTechResearches] = useState<
    Record<string, ActiveUpgradeTimer>
  >(savedState?.activeTechResearches ?? {});
  const [nowTimestamp, setNowTimestamp] = useState<number>(() => Date.now());

  // Contadores de telemetría real para Directivas Operativas y Logros Hard Sci-Fi
  const [wavesClearedCount, setWavesClearedCount] = useState<number>(() =>
    sanitizeFiniteInt(savedState?.wavesClearedCount, 0, 0, 9_999_999)
  );
  const [sectorsClearedCount, setSectorsClearedCount] = useState<number>(() =>
    sanitizeFiniteInt(savedState?.sectorsClearedCount, 0, 0, 9_999_999)
  );
  const [protocolActivatedCount, setProtocolActivatedCount] = useState<number>(() =>
    sanitizeFiniteInt(savedState?.protocolActivatedCount, 0, 0, 9_999_999)
  );
  const [craftedItemsCount, setCraftedItemsCount] = useState<number>(() =>
    sanitizeFiniteInt(savedState?.craftedItemsCount, 0, 0, 9_999_999)
  );
  const [orionDeployedCount, setOrionDeployedCount] = useState<number>(() =>
    sanitizeFiniteInt(savedState?.orionDeployedCount, 0, 0, 9_999_999)
  );
  const [claimedDirectives, setClaimedDirectives] = useState<Record<string, boolean>>(
    savedState?.claimedDirectives ?? {}
  );
  const [encounteredEnemyKeys, setEncounteredEnemyKeys] = useState<
    Record<string, boolean>
  >(savedState?.encounteredEnemyKeys ?? {});
  const [clearedPlanetIds, setClearedPlanetIds] = useState<
    Record<string, boolean>
  >(savedState?.clearedPlanetIds ?? {});

  const [combatSpeed, setCombatSpeed] = useState<CombatSpeed>(1);
  const combatSpeedRef = useRef<CombatSpeed>(combatSpeed);
  combatSpeedRef.current = combatSpeed;

  const [activityFeed, setActivityFeed] = useState<string[]>(MOCK_COMBAT_LOGS);

  useEffect(() => {
    try {
      localStorage.setItem(
        SAVE_STORAGE_KEY,
        JSON.stringify({
          factionId,
          playerName,
          reactorRoutingMode,
          credits,
          inventory,
          buildings,
          technologies,
          heroLoadoutsByFaction,
          combatXp,
          operationalXp,
          activeBuildingUpgrades,
          activeTechResearches,
          wavesClearedCount,
          sectorsClearedCount,
          protocolActivatedCount,
          craftedItemsCount,
          orionDeployedCount,
          claimedDirectives,
          encounteredEnemyKeys,
          clearedPlanetIds,
        })
      );
    } catch {
      // Ignorar errores de cuota
    }
  }, [
    factionId,
    playerName,
    reactorRoutingMode,
    credits,
    inventory,
    buildings,
    technologies,
    heroLoadoutsByFaction,
    combatXp,
    operationalXp,
    activeBuildingUpgrades,
    activeTechResearches,
    wavesClearedCount,
    sectorsClearedCount,
    protocolActivatedCount,
    craftedItemsCount,
    orionDeployedCount,
    claimedDirectives,
    encounteredEnemyKeys,
    clearedPlanetIds,
  ]);

  const currentFaction = FACTIONS[factionId];
  const theme = getFactionTheme(currentFaction.name);
  const heroLoadout = heroLoadoutsByFaction[factionId] || INITIAL_LOADOUTS[factionId];

  // suma de niveles de los 5 Chasis
  const sumChassisLevels = useMemo(
    () =>
      heroLoadout.weapon.level +
      heroLoadout.chest.level +
      heroLoadout.helmet.level +
      heroLoadout.gloves.level +
      heroLoadout.boots.level,
    [heroLoadout]
  );

  // Curva real de Nivel de Héroe y Rango Operativo (empieza en Nivel 1 con 0% XP)
  const heroProgression = useMemo(
    () => computeLevelAndPctFromXp(combatXp, 140, 1.38, 100),
    [combatXp]
  );
  const professionProgression = useMemo(
    () => computeLevelAndPctFromXp(operationalXp, 100, 1.35, 50),
    [operationalXp]
  );

  const characterLevel = heroProgression.level;
  const heroXpPct = heroProgression.pct;
  const professionLevel = professionProgression.level;
  const professionXpPct = professionProgression.pct;

  // Estadísticas reales de combate calculadas desde los 5 Chasis + Nivel de Héroe + Laboratorio + Protocolo Bélico
  const combatDoctrineTech = technologies.find(
    (t) => t.id === 'tech_calibracion_forja'
  );
  const doctrineMultiplier = combatDoctrineTech
    ? 1 + (combatDoctrineTech.level - 1) * 0.08
    : 1.0;

  const belicoAtkMultiplier =
    reactorRoutingMode === 'belico'
      ? GAME_BALANCE.combat.belicoAtkMultiplier
      : 1.0;
  const belicoDefMultiplier =
    reactorRoutingMode === 'belico'
      ? GAME_BALANCE.combat.belicoDefMultiplier
      : 1.0;

  // Cálculo unificado de MW del Reactor (idéntico en Sala de Guerra, Ciudadela y ReactorCentral)
  const { usedReactorMw, maxReactorMw, reserveReactorMw } = useMemo(() => {
    const reactorLvl = buildings[0]?.level || 1;
    const forgeLvl = buildings[1]?.level || 1;
    const labLvl = buildings[2]?.level || 1;
    const siloLvl = buildings[3]?.level || 1;
    const conductorTechLvl =
      technologies.find((t) => t.id === 'tech_red_energetica')?.level || 1;
    const conductorTechBonusMw =
      (conductorTechLvl - 1) * GAME_BALANCE.reactor.conductorTechMwPerLevel;

    const rawMaxMw =
      GAME_BALANCE.reactor.baseMw +
      (reactorLvl - 1) * GAME_BALANCE.reactor.mwPerLevel +
      conductorTechBonusMw;

    const facMaxMw =
      factionId === 'cygnus'
        ? Math.round(rawMaxMw * GAME_BALANCE.reactor.cygnusCapacityMultiplier)
        : Math.round(rawMaxMw);

    const buildingsMw =
      GAME_BALANCE.reactor.forgeBaseMw +
      (forgeLvl - 1) * GAME_BALANCE.reactor.forgeMwPerLevel +
      GAME_BALANCE.reactor.labBaseMw +
      (labLvl - 1) * GAME_BALANCE.reactor.labMwPerLevel +
      GAME_BALANCE.reactor.siloBaseMw +
      (siloLvl - 1) * GAME_BALANCE.reactor.siloMwPerLevel;

    const chassisRawMw = computeLoadoutTotalMw(heroLoadout);
    const chassisMw =
      factionId === 'skithid'
        ? Math.round(chassisRawMw * GAME_BALANCE.reactor.skithidChassisMwMultiplier)
        : chassisRawMw;

    const usedMw = buildingsMw + chassisMw;
    return {
      usedReactorMw: usedMw,
      maxReactorMw: facMaxMw,
      reserveReactorMw: Math.max(0, facMaxMw - usedMw),
    };
  }, [buildings, technologies, factionId, heroLoadout]);

  const maxPlayerHp = useMemo(() => {
    const chestFactor = heroLoadout.chest.lowPowerMode ? 0.78 : 1;
    const helmetFactor = heroLoadout.helmet.lowPowerMode ? 0.82 : 1;
    const bootsFactor = heroLoadout.boots.lowPowerMode ? 0.85 : 1;
    const heroLvlBonus = (characterLevel - 1) * 18;
    const base =
      620 +
      heroLvlBonus +
      Math.round(heroLoadout.chest.level * 135 * chestFactor) +
      Math.round(heroLoadout.helmet.level * 65 * helmetFactor) +
      Math.round(heroLoadout.boots.level * 55 * bootsFactor);
    return Math.round(base * doctrineMultiplier);
  }, [heroLoadout, doctrineMultiplier, characterLevel]);

  const maxPlayerDefense = useMemo(() => {
    const armorSum =
      computeEffectiveSlotStat(heroLoadout.chest) +
      computeEffectiveSlotStat(heroLoadout.helmet) +
      computeEffectiveSlotStat(heroLoadout.gloves) +
      computeEffectiveSlotStat(heroLoadout.boots);
    const factionBase =
      factionId === 'cygnus' ? 440 : factionId === 'valari' ? 400 : 360;
    const heroLvlBonus = (characterLevel - 1) * 10;
    const rawDef = factionBase + heroLvlBonus + armorSum * 9;
    return Math.round(rawDef * doctrineMultiplier * belicoDefMultiplier);
  }, [heroLoadout, factionId, doctrineMultiplier, belicoDefMultiplier, characterLevel]);

  const playerBaseAttackDmg = useMemo(() => {
    const weaponVal = computeEffectiveSlotStat(heroLoadout.weapon);
    const glovesFactor = heroLoadout.gloves.lowPowerMode ? 0.72 : 1;
    const glovesBonus = Math.round(heroLoadout.gloves.level * 10 * glovesFactor);
    const heroLvlBonus = (characterLevel - 1) * 2;
    const rawAtk = 46 + heroLvlBonus + weaponVal * 1.45 + glovesBonus;
    return Math.round(rawAtk * doctrineMultiplier * belicoAtkMultiplier);
  }, [heroLoadout, doctrineMultiplier, belicoAtkMultiplier, characterLevel]);

  const [playerHp, setPlayerHp] = useState<number>(maxPlayerHp);
  const [playerDefense, setPlayerDefense] = useState<number>(maxPlayerDefense);
  const [playerBuffTurns, setPlayerBuffTurns] = useState<number>(0);
  const [playerCorrosiveStacks, setPlayerCorrosiveStacks] = useState<number>(0);
  const [playerShieldLockTurns, setPlayerShieldLockTurns] = useState<number>(0);
  const [playerIlluminatedTurns, setPlayerIlluminatedTurns] = useState<number>(0);

  const playerCombatStatus: PlayerCombatStatus = useMemo(
    () => ({
      corrosiveStacks: playerCorrosiveStacks,
      shieldLockTurns: playerShieldLockTurns,
      illuminatedTurns: playerIlluminatedTurns,
      reactiveArmorActive:
        factionId === 'valari' &&
        playerDefense >
          maxPlayerDefense * GAME_BALANCE.combat.valariReactiveArmorThreshold,
      phaseResonanceActive:
        factionId === 'cygnus' && playerDefense > maxPlayerDefense * 0.5,
    }),
    [
      playerCorrosiveStacks,
      playerShieldLockTurns,
      playerIlluminatedTurns,
      factionId,
      playerDefense,
      maxPlayerDefense,
    ]
  );

  useEffect(() => {
    setPlayerHp((prev) => Math.min(maxPlayerHp, Math.max(prev, maxPlayerHp)));
  }, [maxPlayerHp]);

  useEffect(() => {
    setPlayerDefense((prev) =>
      Math.min(maxPlayerDefense, Math.max(prev, maxPlayerDefense))
    );
  }, [maxPlayerDefense]);

  const totalWaves = 3;
  const [currentWave, setCurrentWave] = useState<number>(1);
  const initialCombatWaveSquad = useMemo(
    () =>
      buildWaveSquad(defaultPlanet, 1, factionId, reactorRoutingMode, characterLevel),
    // Solo se calcula una vez para poblar el estado inicial sincronizado entre enemySquad y turnOrderIds
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [enemySquad, setEnemySquad] = useState<CombatSquadUnit[]>(
    () => initialCombatWaveSquad
  );
  const [turnOrderIds, setTurnOrderIds] = useState<('player' | string)[]>(() =>
    buildInitialTurnOrder(initialCombatWaveSquad, factionId)
  );
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [turnPhase, setTurnPhase] = useState<CombatTurnPhase>('PLAYER_TURN');
  const [turnCount, setTurnCount] = useState<number>(1);
  const [isAutoCombat, setIsAutoCombat] = useState<boolean>(false);
  const [isCombatActive, setIsCombatActive] = useState<boolean>(true);
  const [skillCooldowns, setSkillCooldowns] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
  });
  const [activeActorId, setActiveActorId] = useState<'player' | string | null>(
    null
  );
  const [hitTargetId, setHitTargetId] = useState<'player' | string | null>(null);
  const [floatingEvents, setFloatingEvents] = useState<CombatFloatingEvent[]>([]);
  const eventCounterRef = useRef<number>(0);

  const actionTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isResolvingRef = useRef<boolean>(false);
  const enemySquadRef = useRef<CombatSquadUnit[]>(enemySquad);
  const turnOrderIdsRef = useRef<('player' | string)[]>(turnOrderIds);
  const playerBuffTurnsRef = useRef<number>(playerBuffTurns);
  const playerCorrosiveStacksRef = useRef<number>(playerCorrosiveStacks);
  const playerShieldLockTurnsRef = useRef<number>(playerShieldLockTurns);
  const playerIlluminatedTurnsRef = useRef<number>(playerIlluminatedTurns);

  enemySquadRef.current = enemySquad;
  turnOrderIdsRef.current = turnOrderIds;
  playerBuffTurnsRef.current = playerBuffTurns;
  playerCorrosiveStacksRef.current = playerCorrosiveStacks;
  playerShieldLockTurnsRef.current = playerShieldLockTurns;
  playerIlluminatedTurnsRef.current = playerIlluminatedTurns;

  const pushLog = useCallback((message: string) => {
    setActivityFeed((prev) => [message, ...prev.slice(0, 29)]);
  }, []);

  const setReactorRoutingMode = useCallback(
    (mode: ReactorRoutingMode) => {
      playGameSfx('ui_reactor_protocol');
      setReactorRoutingModeState(mode);
      if (mode !== 'none') {
        setProtocolActivatedCount((prev) => prev + 1);
        const protocolCfg = REACTOR_ROUTING_PROTOCOLS.find((p) => p.id === mode);
        const label = protocolCfg ? protocolCfg.logLabel : mode;
        pushLog(`[REACTOR] Protocolo de Reserva activado: ${label}.`);
      } else {
        pushLog(`[REACTOR] Protocolos desactivados. Operando sin desvío de reserva.`);
      }
    },
    [pushLog]
  );

  // Regulador de Chasis (Modo Ahorro de MW): permite bajar el consumo de una pieza para liberar Reserva MW
  const toggleChassisLowPower = useCallback(
    (slot: HeroChassisSlot) => {
      playGameSfx('ui_reactor_protocol');
      setHeroLoadoutsByFaction((prev) => {
        const current = prev[factionId];
        const targetItem = current[slot];
        const nextLowPower = !targetItem.lowPowerMode;
        const updatedItem: HeroChassisItem = {
          ...targetItem,
          lowPowerMode: nextLowPower,
        };
        const updatedLoadout: HeroLoadout = {
          ...current,
          [slot]: updatedItem,
        };
        updatedLoadout.totalPowerDrawMw = computeLoadoutTotalMw(updatedLoadout);

        // Verificar si al restaurar una pieza al 100% la Reserva MW cae por debajo del protocolo activo
        const reactorLvl = buildings[0]?.level || 1;
        const forgeLvl = buildings[1]?.level || 1;
        const labLvl = buildings[2]?.level || 1;
        const siloLvl = buildings[3]?.level || 1;
        const conductorTechLvl =
          technologies.find((t) => t.id === 'tech_red_energetica')?.level || 1;

        const rawMaxMw =
          GAME_BALANCE.reactor.baseMw +
          (reactorLvl - 1) * GAME_BALANCE.reactor.mwPerLevel +
          (conductorTechLvl - 1) *
            GAME_BALANCE.reactor.conductorTechMwPerLevel;

        const totalMw =
          factionId === 'cygnus'
            ? Math.round(rawMaxMw * GAME_BALANCE.reactor.cygnusCapacityMultiplier)
            : rawMaxMw;

        const buildingsMw =
          GAME_BALANCE.reactor.forgeBaseMw +
          (forgeLvl - 1) * GAME_BALANCE.reactor.forgeMwPerLevel +
          GAME_BALANCE.reactor.labBaseMw +
          (labLvl - 1) * GAME_BALANCE.reactor.labMwPerLevel +
          GAME_BALANCE.reactor.siloBaseMw +
          (siloLvl - 1) * GAME_BALANCE.reactor.siloMwPerLevel;

        const chassisMw =
          factionId === 'skithid'
            ? Math.round(
                updatedLoadout.totalPowerDrawMw *
                  GAME_BALANCE.reactor.skithidChassisMwMultiplier
              )
            : updatedLoadout.totalPowerDrawMw;

        const nextReserveMw = Math.max(0, totalMw - (buildingsMw + chassisMw));

        if (reactorRoutingMode !== 'none') {
          const activeProto = REACTOR_ROUTING_PROTOCOLS.find(
            (p) => p.id === reactorRoutingMode
          );
          if (activeProto && nextReserveMw < activeProto.requiredReserveMw) {
            setReactorRoutingModeState('none');
            pushLog(
              `[REACTOR] Reserva insuficiente (${nextReserveMw} MW < ${activeProto.requiredReserveMw} MW). ${activeProto.title} desactivado automáticamente.`
            );
          }
        }

        pushLog(
          nextLowPower
            ? `[REGULADOR MW] ${targetItem.name} en Modo Ahorro (-45% consumo MW / -28% stat).`
            : `[REGULADOR MW] ${targetItem.name} restaurado a 100% de potencia nominal.`
        );

        return {
          ...prev,
          [factionId]: updatedLoadout,
        };
      });
    },
    [buildings, factionId, pushLog, reactorRoutingMode]
  );

  const clearCombatTimers = useCallback(() => {
    actionTimersRef.current.forEach((t) => clearTimeout(t));
    actionTimersRef.current = [];
    isResolvingRef.current = false;
    setActiveActorId(null);
    setHitTargetId(null);
  }, []);

  const scheduleCombatTimer = useCallback((fn: () => void, delayMs: number) => {
    const scaledDelay = Math.max(
      110,
      Math.round(delayMs / Math.max(1, combatSpeedRef.current))
    );
    const id = setTimeout(() => {
      actionTimersRef.current = actionTimersRef.current.filter((t) => t !== id);
      fn();
    }, scaledDelay);
    actionTimersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    return () => {
      actionTimersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    const aliveUnits = enemySquad.filter((u) => u.hp > 0);
    if (
      aliveUnits.length > 0 &&
      !aliveUnits.some((u) => u.instanceId === selectedTargetId)
    ) {
      setSelectedTargetId(aliveUnits[0].instanceId);
    }
  }, [enemySquad, selectedTargetId]);

  // Registrar enemigos avistados ÚNICAMENTE cuando el jugador entra de forma efectiva al Frente de Batalla (activeTab === 'combate')
  useEffect(() => {
    if (isSelectingFaction || activeTab !== 'combate') return;
    const keysToUnlock = enemySquad
      .filter((u) => u.hp > 0 && u.unitKey)
      .map((u) => u.unitKey as string);
    if (keysToUnlock.length === 0) return;

    setEncounteredEnemyKeys((prev) => {
      const hasNew = keysToUnlock.some((k) => !prev[k]);
      if (!hasNew) return prev;
      const next = { ...prev };
      keysToUnlock.forEach((k) => {
        next[k] = true;
      });
      return next;
    });
  }, [activeTab, enemySquad, isSelectingFaction]);

  const turnQueue: CombatTurnQueueItem[] = useMemo(() => {
    const playerSpeed =
      getBaseSpeedForFaction(factionId) + heroLoadout.boots.level * 3;
    const validIds = turnOrderIds.filter((id) => {
      if (id === 'player') return true;
      const unit = enemySquad.find((u) => u.instanceId === id);
      return Boolean(unit && unit.hp > 0);
    });

    const allLivingIds: ('player' | string)[] = [
      'player',
      ...enemySquad.filter((u) => u.hp > 0).map((u) => u.instanceId),
    ];
    allLivingIds.forEach((id) => {
      if (!validIds.includes(id)) validIds.push(id);
    });

    return validIds.map((id) => {
      if (id === 'player') {
        return {
          actorId: 'player',
          isPlayer: true,
          name: playerName,
          faction: factionId,
          speed: playerSpeed,
          portraitUrl: HERO_PORTRAITS_MAP[factionId],
          stunned: false,
          broken: false,
        };
      }
      const unit = enemySquad.find((u) => u.instanceId === id)!;
      return {
        actorId: unit.instanceId,
        isPlayer: false,
        name: unit.name,
        faction: unit.faction,
        speed: unit.speed,
        portraitUrl: getTurnPortraitForSpriteUrl(
          unit.portraitUrl || unit.spriteUrl || HERO_PORTRAITS_MAP[unit.faction]
        ),
        stunned: unit.stunnedTurns > 0,
        broken: unit.brokenTurns > 0,
        intent: unit.intent,
      };
    });
  }, [enemySquad, factionId, heroLoadout.boots.level, playerName, turnOrderIds]);

  const equippedSkills: CombatEquipableSkill[] = useMemo(() => {
    const base = FACTION_SKILL_LOADOUTS[factionId] || FACTION_SKILL_LOADOUTS.valari;
    return base.map((sk) => ({
      ...sk,
      currentCooldown: skillCooldowns[sk.slotIndex] || 0,
    }));
  }, [factionId, skillCooldowns]);

  const spawnFloatingEvent = useCallback(
    (
      targetId: 'player' | string,
      text: string,
      tone: CombatFloatingEvent['tone']
    ) => {
      eventCounterRef.current += 1;
      const id = `flt_${Date.now()}_${eventCounterRef.current}`;
      setFloatingEvents((prev) => [...prev.slice(-4), { id, targetId, text, tone }]);
      setTimeout(() => {
        setFloatingEvents((prev) => prev.filter((ev) => ev.id !== id));
      }, 1450);
    },
    []
  );

  const resetCombatEncounter = useCallback(
    (planet: Planet | null, facId: FactionId) => {
      clearCombatTimers();
      const initialSquad = buildWaveSquad(
        planet,
        1,
        facId,
        reactorRoutingMode,
        characterLevel
      );
      const initialOrder = buildInitialTurnOrder(initialSquad, facId);
      setCurrentWave(1);
      setEnemySquad(initialSquad);
      setTurnOrderIds(initialOrder);
      setSelectedTargetId(initialSquad[0]?.instanceId || '');
      setPlayerHp(maxPlayerHp);
      setPlayerDefense(maxPlayerDefense);
      setPlayerBuffTurns(0);
      setPlayerCorrosiveStacks(0);
      setPlayerShieldLockTurns(0);
      setPlayerIlluminatedTurns(0);
      setSkillCooldowns({ 1: 0, 2: 0, 3: 0 });
      setTurnPhase(initialOrder[0] === 'player' ? 'PLAYER_TURN' : 'ENEMY_TURN');
      setTurnCount(1);
      setFloatingEvents([]);
      setCombatSessionLoot({ credits: 0, wavesCleared: 0, items: [] });
    },
    [
      characterLevel,
      clearCombatTimers,
      maxPlayerDefense,
      maxPlayerHp,
      reactorRoutingMode,
    ]
  );

  const prevActiveTabRef = useRef<ModuleTab>(activeTab);
  useEffect(() => {
    if (prevActiveTabRef.current === 'combate' && activeTab !== 'combate') {
      resetCombatEncounter(activePlanet, factionId);
    }
    prevActiveTabRef.current = activeTab;
  }, [activeTab, activePlanet, factionId, resetCombatEncounter]);

  const openForgeTab = useCallback((tab: 'compuestos' | 'chasis') => {
    setForgeInitialTab(tab);
    setActiveTab('ciudadela_forja');
  }, []);

  const clearCombatSessionLoot = useCallback(() => {
    setCombatSessionLoot({ credits: 0, wavesCleared: 0, items: [] });
  }, []);

  const dismissDirectiveToast = useCallback(() => {
    setCompletedDirectiveToast(null);
  }, []);

  // Tutorial contextual por pantalla (aparece automáticamente en la primera visita a cada módulo si tutorialsEnabled es true)
  const activeTutorialScreenKey: TutorialScreenKey = useMemo(
    () => mapTabToTutorialScreenKey(activeTab),
    [activeTab]
  );

  const isTutorialActive = Boolean(
    tutorialsEnabled && !visitedTutorialScreens[activeTutorialScreenKey]
  );

  const selectFaction = (id: FactionId, startWithTutorial = true) => {
    setFactionId(id);
    setIsSelectingFaction(false);
    setReactorRoutingModeState('none');
    const secIdx = id === 'valari' ? 0 : id === 'skithid' ? 1 : 2;
    const starterPlanet =
      SECTORS_DATA[secIdx]?.planets[0] || SECTORS_DATA[0]?.planets[0] || activePlanet;
    if (starterPlanet) {
      setActivePlanet(starterPlanet);
      setCurrentLocation(starterPlanet.name);
    }
    resetCombatEncounter(starterPlanet, id);
    setVisitedTutorialScreens({});
    setTutorialsEnabled(startWithTutorial);
    setTutorialStepIndex(0);
    setActiveTab('hub');
    pushLog(`[DOCTRINA] Enlace táctico sincronizado con ${FACTIONS[id].name}.`);
  };

  const openFactionSelector = useCallback(() => {
    clearCombatTimers();
    setIsSelectingFaction(true);
  }, [clearCombatTimers]);

  const setTutorialStep = useCallback((stepIndex: number) => {
    setTutorialStepIndex(stepIndex);
  }, []);

  // Cierra la guía de la pantalla actual y la marca como vista
  const skipTutorial = useCallback(() => {
    setVisitedTutorialScreens((prev) => ({
      ...prev,
      [activeTutorialScreenKey]: true,
    }));
  }, [activeTutorialScreenKey]);

  const disableAllTutorials = useCallback(() => {
    setTutorialsEnabled(false);
  }, []);

  const restartTutorial = useCallback(() => {
    setTutorialsEnabled(true);
    setVisitedTutorialScreens((prev) => ({
      ...prev,
      [activeTutorialScreenKey]: false,
    }));
  }, [activeTutorialScreenKey]);

  const navigateToSector = useCallback((sector: StarSector, planet: Planet) => {
    playGameSfx('ui_click');
    setCurrentLocation(planet.name);
    setActivePlanet(planet);
    if (sector.id === 'SEC-NEU-WEST' || planet.id.includes('ORI')) {
      setOrionDeployedCount((prev) => prev + 1);
    }
    resetCombatEncounter(planet, factionId);
    setActiveTab('combate');
    pushLog(
      `[DESPLIEGUE] Incursión iniciada en ${planet.name} (Tier ${planet.tierRoman} · Amenaza: ${planet.threatLevel}).`
    );
  }, [factionId, pushLog, resetCombatEncounter]);

  const unlockedPlaytestPlanets = useMemo(() => {
    const homeSecId =
      factionId === 'valari'
        ? 'SEC-VAL-01'
        : factionId === 'skithid'
          ? 'SEC-SKI-01'
          : 'SEC-CYG-01';
    const allowedSectors = SECTORS_DATA.filter(
      (s) => s.id === homeSecId || s.id === 'SEC-NEU-WEST'
    );
    const list: { sector: StarSector; planet: Planet }[] = [];
    allowedSectors.forEach((sec) => {
      sec.planets.forEach((pl) => {
        list.push({ sector: sec, planet: pl });
      });
    });
    return list;
  }, [factionId]);

  const nextUnlockedPlanetEntry = useMemo(() => {
    if (unlockedPlaytestPlanets.length === 0) return null;
    const currentIdx = unlockedPlaytestPlanets.findIndex(
      (item) => item.planet.id === activePlanet?.id
    );
    if (currentIdx >= 0 && currentIdx + 1 < unlockedPlaytestPlanets.length) {
      return unlockedPlaytestPlanets[currentIdx + 1];
    }
    return unlockedPlaytestPlanets[0];
  }, [activePlanet?.id, unlockedPlaytestPlanets]);

  const nextUnlockedPlanetName = useMemo(() => {
    if (!nextUnlockedPlanetEntry) return null;
    return `${nextUnlockedPlanetEntry.planet.name} (Tier ${nextUnlockedPlanetEntry.planet.tierRoman})`;
  }, [nextUnlockedPlanetEntry]);

  const restartCurrentIncursion = useCallback(() => {
    playGameSfx('ui_click');
    resetCombatEncounter(activePlanet, factionId);
    pushLog(
      `[REINICIO TÁCTICO] Nueva incursión de 3 oleadas iniciada en ${
        activePlanet?.name || 'Sector'
      }.`
    );
  }, [activePlanet, factionId, pushLog, resetCombatEncounter]);

  const advanceToNextPlanetIncursion = useCallback(() => {
    if (!nextUnlockedPlanetEntry) return;
    navigateToSector(
      nextUnlockedPlanetEntry.sector,
      nextUnlockedPlanetEntry.planet
    );
  }, [navigateToSector, nextUnlockedPlanetEntry]);

  const selectTarget = (unitId: string) => {
    const unit = enemySquad.find((u) => u.instanceId === unitId);
    if (unit && unit.hp > 0) {
      playGameSfx('ui_click');
      setSelectedTargetId(unitId);
    }
  };

  const advanceTurnQueueAfterPlayer = useCallback(
    (
      updatedSquad: CombatSquadUnit[],
      overrideCdSlot?: number,
      overrideCdValue?: number,
      brokenUnitId?: string | null
    ) => {
      setSkillCooldowns((prev) => {
        const next: Record<number, number> = {};
        [1, 2, 3].forEach((slot) => {
          if (overrideCdSlot === slot && overrideCdValue !== undefined) {
            next[slot] = overrideCdValue;
          } else {
            next[slot] = Math.max(0, (prev[slot] || 0) - 1);
          }
        });
        return next;
      });

      const remainingAlive = updatedSquad.filter((u) => u.hp > 0);
      if (remainingAlive.length === 0) {
        playGameSfx('wave_victory', 180);
        const orbitalBonus =
          reactorRoutingMode === 'orbital'
            ? GAME_BALANCE.combat.orbitalLootMultiplier
            : 1.0;
        const isFinalWave = currentWave >= totalWaves;
        const completionMultiplier = isFinalWave
          ? GAME_BALANCE.combat.finalWaveLootMultiplier
          : 1.0;

        const waveCredits = Math.round(
          updatedSquad.reduce((sum, u) => sum + u.rewardCredits, 0) *
            orbitalBonus *
            completionMultiplier
        );

        const gainedByResId: Record<string, number> = {};
        updatedSquad.forEach((u) => {
          const qty = Math.round(
            u.rewardAmount * orbitalBonus * completionMultiplier
          );
          gainedByResId[u.rewardResourceId] =
            (gainedByResId[u.rewardResourceId] || 0) + qty;
        });

        // Garantizar extracción secundaria del planeta para que desde Nivel 1 con 0 recursos se obtengan ambos materiales del mundo (ej. Ferrita + Titanio)
        if (activePlanet && activePlanet.combatLoot.length > 1) {
          const secondaryLoot =
            activePlanet.combatLoot[currentWave % activePlanet.combatLoot.length];
          if (secondaryLoot && !gainedByResId[secondaryLoot.id]) {
            const secQty = Math.max(
              2,
              Math.round((3 + currentWave) * orbitalBonus * (isFinalWave ? 1.35 : 1))
            );
            gainedByResId[secondaryLoot.id] = secQty;
          }
        }

        const planetTier = activePlanet?.tier || 1;
        const gainedCombatXp = Math.round(
          (34 + planetTier * 14) * (isFinalWave ? 1.5 : 1)
        );
        setCombatXp((prev) => prev + gainedCombatXp);

        setWavesClearedCount((prev) => prev + 1);
        setCredits((prev) => prev + waveCredits);
        setInventory((prev) => {
          const next = { ...prev };
          Object.entries(gainedByResId).forEach(([resId, qty]) => {
            next[resId] = (next[resId] || 0) + qty;
          });
          return next;
        });

        setCombatSessionLoot((prev) => {
          const nextItems = [...prev.items];
          Object.entries(gainedByResId).forEach(([resId, qty]) => {
            const catItem = CITADEL_STORAGE_CATALOG.find((c) => c.id === resId);
            const existingIdx = nextItems.findIndex((i) => i.id === resId);
            if (existingIdx >= 0) {
              nextItems[existingIdx] = {
                ...nextItems[existingIdx],
                amount: nextItems[existingIdx].amount + qty,
              };
            } else {
              nextItems.push({
                id: resId,
                name: catItem?.name || resId,
                amount: qty,
                iconKey: catItem?.iconKey || 'cuboid',
                tier: catItem?.tier || 1,
              });
            }
          });
          return {
            credits: prev.credits + waveCredits,
            wavesCleared: prev.wavesCleared + 1,
            items: nextItems,
          };
        });

        if (isFinalWave) {
          setSectorsClearedCount((prev) => prev + 1);
          if (activePlanet?.id) {
            setClearedPlanetIds((prev) => ({
              ...prev,
              [activePlanet.id]: true,
            }));
          }
          pushLog(
            `[VICTORIA DE INCURSIÓN] Oleada 3/3 completada en ${
              activePlanet?.name || 'Sector'
            } (+${waveCredits} ₡, +${gainedCombatXp} XP Combate).`
          );
          spawnFloatingEvent('player', `¡SECTOR ASEGURADO! +${waveCredits} ₡`, 'buff');
          setPlayerHp((prev) =>
            Math.min(maxPlayerHp, prev + Math.round(maxPlayerHp * 0.18))
          );
          setPlayerDefense((prev) =>
            Math.min(maxPlayerDefense, prev + Math.round(maxPlayerDefense * 0.25))
          );
        } else {
          pushLog(
            `[OLEADA ${currentWave}/${totalWaves}] Escuadrón neutralizado (+${waveCredits} ₡, +${gainedCombatXp} XP).`
          );
        }

        setTurnPhase('WAVE_TRANSITION');
        return;
      }

      const aliveSet = new Set([
        'player',
        ...remainingAlive.map((u) => u.instanceId),
      ]);
      const cleaned = turnOrderIdsRef.current.filter((id) => aliveSet.has(id));
      let rotated =
        cleaned.length > 0
          ? [...cleaned.slice(1), cleaned[0]]
          : ['player', remainingAlive[0].instanceId];

      if (brokenUnitId && rotated.includes(brokenUnitId)) {
        rotated = [
          ...rotated.filter((id) => id !== brokenUnitId),
          brokenUnitId,
        ];
      }

      setTurnOrderIds(rotated);
      setTurnCount((prev) => prev + 1);
      setTurnPhase(rotated[0] === 'player' ? 'PLAYER_TURN' : 'ENEMY_TURN');
    },
    [
      activePlanet?.name,
      currentWave,
      maxPlayerDefense,
      maxPlayerHp,
      pushLog,
      reactorRoutingMode,
      spawnFloatingEvent,
      totalWaves,
    ]
  );

  const applyDamageToEnemyUnit = (
    unit: CombatSquadUnit,
    rawDamage: number,
    stunTurnsToAdd = 0,
    isHeavySkill = false
  ): {
    updated: CombatSquadUnit;
    absorbedByDef: number;
    dealtToHp: number;
    triggeredBreak: boolean;
    interruptedHeavy: boolean;
    wasComboCrit: boolean;
    wasCounterBonus: boolean;
    lifestealHealed: number;
    didEnemyEvade: boolean;
    appliedStateTag: string | null;
  } => {
    const isVulnerable = unit.brokenTurns > 0 || unit.stunnedTurns > 0;
    const isIlluminated = (unit.illuminatedTurns || 0) > 0;

    const enemySkithidEvadeChance =
      unit.defenseType === 'Evasion' && unit.defense > 0 && !isVulnerable
        ? isIlluminated
          ? 8
          : 16
        : 0;
    const didEnemyEvade =
      enemySkithidEvadeChance > 0 && Math.random() * 100 < enemySkithidEvadeChance;

    if (didEnemyEvade) {
      const nextIlluminated =
        factionId === 'cygnus'
          ? GAME_BALANCE.combat.cygnusIlluminatedTurns
          : unit.illuminatedTurns || 0;
      return {
        updated: {
          ...unit,
          illuminatedTurns: nextIlluminated,
        },
        absorbedByDef: 0,
        dealtToHp: 0,
        triggeredBreak: false,
        interruptedHeavy: false,
        wasComboCrit: false,
        wasCounterBonus: false,
        lifestealHealed: 0,
        didEnemyEvade: true,
        appliedStateTag: factionId === 'cygnus' ? 'FIJADO' : null,
      };
    }

    const hasConditionalSynergy =
      (factionId === 'valari' && unit.defenseType === 'Shields' && unit.defense > 0) ||
      (factionId === 'skithid' && unit.defenseType === 'Armor' && unit.defense > 0) ||
      (factionId === 'cygnus' && (isIlluminated || unit.defenseType === 'Evasion'));

    const counterMultiplier = hasConditionalSynergy
      ? GAME_BALANCE.combat.counterFactionDamageBonus
      : 1.0;

    const cygnusResonanceMultiplier =
      factionId === 'cygnus' && playerDefense > maxPlayerDefense * 0.5
        ? GAME_BALANCE.combat.cygnusHighShieldDamageBonus
        : 1.0;

    const interruptedHeavy = stunTurnsToAdd > 0 && unit.intent === 'heavy';
    const wasComboCrit =
      isVulnerable && (isHeavySkill || unit.brokenTurns > 0);

    const scaledBaseDamage = Math.round(
      rawDamage * counterMultiplier * cygnusResonanceMultiplier
    );

    const effectiveDamage = wasComboCrit
      ? Math.round(scaledBaseDamage * 1.55)
      : interruptedHeavy
        ? Math.round(scaledBaseDamage * 1.3)
        : scaledBaseDamage;

    let nextCorrosiveStacks = unit.corrosiveStacks || 0;
    let nextNeurotoxinTurns = unit.neurotoxinTurns || 0;
    let nextShieldLockTurns = unit.shieldLockTurns || 0;
    let nextIlluminatedTurns = unit.illuminatedTurns || 0;
    let appliedStateTag: string | null = null;

    if (factionId === 'skithid') {
      const addedStacks = isHeavySkill ? 2 : 1;
      nextCorrosiveStacks = Math.min(
        GAME_BALANCE.combat.skithidMaxAcidStacks,
        nextCorrosiveStacks + addedStacks
      );
      if (stunTurnsToAdd > 0) {
        nextNeurotoxinTurns = Math.max(nextNeurotoxinTurns, 2);
        appliedStateTag = 'NEUROTOXINA';
      } else {
        appliedStateTag = `ÁCIDO x${nextCorrosiveStacks}`;
      }
    } else if (factionId === 'valari' && (isHeavySkill || stunTurnsToAdd > 0)) {
      nextShieldLockTurns = Math.max(
        nextShieldLockTurns,
        GAME_BALANCE.combat.valariShieldLockTurns
      );
      appliedStateTag = 'SOBRECARGA';
    } else if (factionId === 'cygnus') {
      nextIlluminatedTurns = Math.max(
        nextIlluminatedTurns,
        GAME_BALANCE.combat.cygnusIlluminatedTurns
      );
      appliedStateTag = 'FIJADO';
    }

    const activeAcidRatio =
      factionId === 'skithid'
        ? nextCorrosiveStacks * GAME_BALANCE.combat.skithidAcidBleedPerStack
        : 0;
    const corrosiveBleedThrough =
      activeAcidRatio > 0 && unit.defense > 0
        ? Math.round(effectiveDamage * activeAcidRatio)
        : 0;

    const damageAgainstDefense = Math.max(0, effectiveDamage - corrosiveBleedThrough);

    const hadDefense = unit.defense > 0;
    const absorbedByDef = Math.min(unit.defense, damageAgainstDefense);
    const remainingDmg =
      Math.max(0, damageAgainstDefense - absorbedByDef) + corrosiveBleedThrough;
    const nextDefense = Math.max(0, unit.defense - absorbedByDef);
    const triggeredBreak =
      (hadDefense && nextDefense === 0) || interruptedHeavy;

    const finalHpDmg =
      triggeredBreak && remainingDmg > 0
        ? Math.round(remainingDmg * 1.35)
        : remainingDmg;
    const nextHp = Math.max(0, unit.hp - finalHpDmg);

    const lifestealHealed =
      factionId === 'skithid' && (isVulnerable || triggeredBreak)
        ? Math.max(
            10,
            Math.round(
              (absorbedByDef + finalHpDmg) *
                GAME_BALANCE.combat.skithidLifestealOnVulnerableRatio
            )
          )
        : 0;

    const nextStun =
      nextHp > 0 ? Math.max(unit.stunnedTurns, stunTurnsToAdd) : 0;
    const nextBroken =
      nextHp > 0 ? (triggeredBreak ? 2 : unit.brokenTurns) : 0;

    const nextIntent: EnemyIntentType =
      (triggeredBreak || stunTurnsToAdd > 0) && unit.intent === 'heavy'
        ? 'attack'
        : unit.intent;

    return {
      updated: {
        ...unit,
        defense: nextDefense,
        hp: nextHp,
        stunnedTurns: nextStun,
        brokenTurns: nextBroken,
        corrosiveStacks: nextHp > 0 ? nextCorrosiveStacks : 0,
        neurotoxinTurns: nextHp > 0 ? nextNeurotoxinTurns : 0,
        shieldLockTurns: nextHp > 0 ? nextShieldLockTurns : 0,
        illuminatedTurns: nextHp > 0 ? nextIlluminatedTurns : 0,
        intent: nextIntent,
      },
      absorbedByDef,
      dealtToHp: finalHpDmg,
      triggeredBreak,
      interruptedHeavy,
      wasComboCrit,
      wasCounterBonus: hasConditionalSynergy,
      lifestealHealed,
      didEnemyEvade: false,
      appliedStateTag,
    };
  };

  const executeBasicAttack = useCallback(() => {
    if (turnPhase !== 'PLAYER_TURN' || isResolvingRef.current) return;
    const aliveEnemies = enemySquadRef.current.filter((u) => u.hp > 0);
    if (aliveEnemies.length === 0) return;

    isResolvingRef.current = true;
    const target =
      aliveEnemies.find((u) => u.instanceId === selectedTargetId) ||
      aliveEnemies[0];
    const finalDmg = Math.round(
      playerBaseAttackDmg * (playerBuffTurnsRef.current > 0 ? 1.35 : 1)
    );

    setActiveActorId('player');
    setHitTargetId(target.instanceId);
    playGameSfx(`${getFactionAudioPrefix(factionId)}_basic`);
    scheduleCombatTimer(() => {
      setHitTargetId(null);
    }, 460);

    let brokenId: string | null = null;
    let totalLifesteal = 0;

    const nextSquad = enemySquadRef.current.map((u) => {
      if (u.instanceId !== target.instanceId) return u;
      const {
        updated,
        absorbedByDef,
        dealtToHp,
        triggeredBreak,
        wasComboCrit,
        lifestealHealed,
        didEnemyEvade,
        appliedStateTag,
      } = applyDamageToEnemyUnit(u, finalDmg, 0, false);

      totalLifesteal += lifestealHealed;
      const total = absorbedByDef + dealtToHp;

      if (didEnemyEvade) {
        playGameSfx('hit_evasion', 120);
        spawnFloatingEvent(
          u.instanceId,
          appliedStateTag ? `¡ESQUIVA! [${appliedStateTag}]` : '¡ESQUIVA!',
          'defense'
        );
      } else if (triggeredBreak) {
        brokenId = u.instanceId;
        playGameSfx('guard_break', 130);
        spawnFloatingEvent(
          u.instanceId,
          `¡RUPTURA! -${total}`,
          'control'
        );
      } else {
        playGameSfx(getDefenseImpactAudioCue(u.defenseType), 130, 0.58);
        if (wasComboCrit) {
          spawnFloatingEvent(
            u.instanceId,
            `¡CRÍTICO! -${total}`,
            'damage'
          );
        } else if (appliedStateTag) {
          spawnFloatingEvent(
            u.instanceId,
            `${appliedStateTag} · -${total}`,
            'damage'
          );
        } else if (dealtToHp > 0) {
          spawnFloatingEvent(
            u.instanceId,
            `-${total}`,
            'damage'
          );
        } else {
          spawnFloatingEvent(u.instanceId, `-${absorbedByDef} DEF`, 'defense');
        }
      }
      return updated;
    });

    if (totalLifesteal > 0) {
      setPlayerHp((prev) => Math.min(maxPlayerHp, prev + totalLifesteal));
      spawnFloatingEvent('player', `+${totalLifesteal} HP BIO-DRENAJE`, 'heal');
    }

    setEnemySquad(nextSquad);
    if (playerBuffTurnsRef.current > 0) {
      setPlayerBuffTurns((prev) => Math.max(0, prev - 1));
    }

    scheduleCombatTimer(() => {
      isResolvingRef.current = false;
      setActiveActorId(null);
      advanceTurnQueueAfterPlayer(nextSquad, undefined, undefined, brokenId);
    }, 900);
  }, [
    advanceTurnQueueAfterPlayer,
    factionId,
    maxPlayerDefense,
    maxPlayerHp,
    playerBaseAttackDmg,
    playerDefense,
    scheduleCombatTimer,
    selectedTargetId,
    spawnFloatingEvent,
    turnPhase,
  ]);

  const executeSkill = useCallback(
    (slotIndex: 1 | 2 | 3 | 4) => {
      if (turnPhase !== 'PLAYER_TURN' || isResolvingRef.current) return;
      const skill = equippedSkills.find((s) => s.slotIndex === slotIndex);
      if (!skill || skill.currentCooldown > 0) return;

      const aliveEnemies = enemySquadRef.current.filter((u) => u.hp > 0);
      if (aliveEnemies.length === 0) return;

      isResolvingRef.current = true;
      const target =
        aliveEnemies.find((u) => u.instanceId === selectedTargetId) ||
        aliveEnemies[0];

      const baseDmg =
        playerBaseAttackDmg * (playerBuffTurnsRef.current > 0 ? 1.35 : 1);
      setActiveActorId('player');
      playGameSfx(`${getFactionAudioPrefix(factionId)}_skill_${slotIndex}`);

      if (skill.role === 'damage') {
        const skillDmg = Math.round(baseDmg * 1.75);
        setHitTargetId(target.instanceId);
        scheduleCombatTimer(() => {
          setHitTargetId(null);
        }, 460);

        let brokenId: string | null = null;
        let totalLifesteal = 0;

        const nextSquad = enemySquadRef.current.map((u) => {
          if (u.instanceId !== target.instanceId) return u;
          const {
            updated,
            absorbedByDef,
            dealtToHp,
            triggeredBreak,
            wasComboCrit,
            lifestealHealed,
            didEnemyEvade,
            appliedStateTag,
          } = applyDamageToEnemyUnit(u, skillDmg, 0, true);
          totalLifesteal += lifestealHealed;
          const total = absorbedByDef + dealtToHp;

          if (didEnemyEvade) {
            playGameSfx('hit_evasion', 150);
            spawnFloatingEvent(
              u.instanceId,
              appliedStateTag ? `¡ESQUIVA! [${appliedStateTag}]` : '¡ESQUIVA!',
              'defense'
            );
          } else if (triggeredBreak) {
            brokenId = u.instanceId;
            playGameSfx('guard_break', 165);
            spawnFloatingEvent(u.instanceId, `¡RUPTURA! -${total}`, 'control');
          } else {
            playGameSfx(getDefenseImpactAudioCue(u.defenseType), 165, 0.55);
            if (wasComboCrit) {
              spawnFloatingEvent(
                u.instanceId,
                `¡EJECUCIÓN CRÍTICA! -${total}`,
                'damage'
              );
            } else if (appliedStateTag) {
              spawnFloatingEvent(
                u.instanceId,
                `¡${appliedStateTag}! -${total}`,
                'damage'
              );
            } else {
              spawnFloatingEvent(u.instanceId, `-${total}`, 'damage');
            }
          }
          return updated;
        });

        if (totalLifesteal > 0) {
          setPlayerHp((prev) => Math.min(maxPlayerHp, prev + totalLifesteal));
          spawnFloatingEvent('player', `+${totalLifesteal} HP BIO-DRENAJE`, 'heal');
        }

        setEnemySquad(nextSquad);
        pushLog(`[HABILIDAD] ${skill.name} impacta a ${target.name}.`);
        scheduleCombatTimer(() => {
          isResolvingRef.current = false;
          setActiveActorId(null);
          advanceTurnQueueAfterPlayer(
            nextSquad,
            slotIndex,
            skill.cooldownTurns,
            brokenId
          );
        }, 900);
        return;
      }

      if (skill.role === 'control') {
        const controlDmg = Math.round(baseDmg * 0.9);
        setHitTargetId(target.instanceId);
        scheduleCombatTimer(() => {
          setHitTargetId(null);
        }, 460);

        let brokenId: string | null = null;
        const nextSquad = enemySquadRef.current.map((u) => {
          if (u.instanceId !== target.instanceId) return u;
          const {
            updated,
            absorbedByDef,
            dealtToHp,
            triggeredBreak,
            interruptedHeavy,
          } = applyDamageToEnemyUnit(u, controlDmg, 1, false);
          if (triggeredBreak) {
            brokenId = u.instanceId;
            playGameSfx('guard_break', 160);
          } else {
            playGameSfx(getDefenseImpactAudioCue(u.defenseType), 160, 0.52);
          }
          spawnFloatingEvent(
            u.instanceId,
            interruptedHeavy
              ? `¡CARGA INTERRUMPIDA! -${absorbedByDef + dealtToHp}`
              : `SUPRIMIDO · -${absorbedByDef + dealtToHp}`,
            'control'
          );
          return updated;
        });

        setEnemySquad(nextSquad);
        pushLog(
          `[CONTROL] ${target.name} suprimido y expuesto a crítico por 1 turno.`
        );
        scheduleCombatTimer(() => {
          isResolvingRef.current = false;
          setActiveActorId(null);
          advanceTurnQueueAfterPlayer(
            nextSquad,
            slotIndex,
            skill.cooldownTurns,
            brokenId
          );
        }, 900);
        return;
      }

      if (skill.role === 'heal') {
        const restoredDef = Math.round(maxPlayerDefense * 0.45);
        const restoredHp = Math.round(maxPlayerHp * 0.25);
        const hadDebuffs =
          playerCorrosiveStacksRef.current > 0 ||
          playerShieldLockTurnsRef.current > 0 ||
          playerIlluminatedTurnsRef.current > 0;

        setPlayerCorrosiveStacks(0);
        setPlayerShieldLockTurns(0);
        setPlayerIlluminatedTurns(0);

        setPlayerDefense((prev) =>
          Math.min(maxPlayerDefense, prev + restoredDef)
        );
        setPlayerHp((prev) => Math.min(maxPlayerHp, prev + restoredHp));
        spawnFloatingEvent(
          'player',
          hadDebuffs
            ? `PURGADO · +${restoredDef} DEF / +${restoredHp} HP`
            : `+${restoredDef} DEF / +${restoredHp} HP`,
          'heal'
        );
        pushLog(
          `[SOPORTE] ${skill.name}: Defensa restaurada${
            hadDebuffs ? ' y estados adversos purgados' : ''
          }.`
        );
        scheduleCombatTimer(() => {
          isResolvingRef.current = false;
          setActiveActorId(null);
          advanceTurnQueueAfterPlayer(
            enemySquadRef.current,
            slotIndex,
            skill.cooldownTurns
          );
        }, 900);
        return;
      }
    },
    [
      advanceTurnQueueAfterPlayer,
      equippedSkills,
      maxPlayerDefense,
      maxPlayerHp,
      playerBaseAttackDmg,
      pushLog,
      scheduleCombatTimer,
      selectedTargetId,
      spawnFloatingEvent,
      turnPhase,
    ]
  );

  // Ejecución del turno enemigo (sólo cuando la vista de combate está activa)
  useEffect(() => {
    if (
      activeTab !== 'combate' ||
      !isCombatActive ||
      turnPhase !== 'ENEMY_TURN' ||
      isResolvingRef.current
    )
      return;

    isResolvingRef.current = true;

    scheduleCombatTimer(() => {
      const currentSquad = enemySquadRef.current;
      const aliveEnemies = currentSquad.filter((u) => u.hp > 0);
      if (aliveEnemies.length === 0) {
        isResolvingRef.current = false;
        setTurnPhase('WAVE_TRANSITION');
        return;
      }

      const aliveSet = new Set([
        'player',
        ...aliveEnemies.map((u) => u.instanceId),
      ]);
      const cleanedOrder = turnOrderIdsRef.current.filter((id) =>
        aliveSet.has(id)
      );
      const currentActorId = cleanedOrder[0];

      if (!currentActorId || currentActorId === 'player') {
        isResolvingRef.current = false;
        setTurnPhase('PLAYER_TURN');
        return;
      }

      const actingEnemy =
        aliveEnemies.find((u) => u.instanceId === currentActorId) ||
        aliveEnemies[0];

      setActiveActorId(actingEnemy.instanceId);

      if (actingEnemy.stunnedTurns > 0) {
        spawnFloatingEvent(
          actingEnemy.instanceId,
          (actingEnemy.neurotoxinTurns || 0) > 0
            ? 'NEUROTOXINA · SUPRIMIDO'
            : 'SUPRIMIDO',
          'control'
        );
        setEnemySquad((prev) =>
          prev.map((u) =>
            u.instanceId === actingEnemy.instanceId
              ? {
                  ...u,
                  stunnedTurns: Math.max(0, u.stunnedTurns - 1),
                  brokenTurns: Math.max(0, u.brokenTurns - 1),
                  neurotoxinTurns: Math.max(0, (u.neurotoxinTurns || 0) - 1),
                  shieldLockTurns: Math.max(0, (u.shieldLockTurns || 0) - 1),
                  illuminatedTurns: Math.max(0, (u.illuminatedTurns || 0) - 1),
                }
              : u
          )
        );
      } else if (actingEnemy.intent === 'fortify') {
        const isShieldLocked = (actingEnemy.shieldLockTurns || 0) > 0;
        if (isShieldLocked) {
          spawnFloatingEvent(
            actingEnemy.instanceId,
            '¡SOBRECARGA! 0 ESC',
            'control'
          );
          setEnemySquad((prev) =>
            prev.map((u) =>
              u.instanceId === actingEnemy.instanceId
                ? {
                    ...u,
                    shieldLockTurns: Math.max(0, (u.shieldLockTurns || 0) - 1),
                    illuminatedTurns: Math.max(0, (u.illuminatedTurns || 0) - 1),
                    intent: 'attack',
                  }
                : u
            )
          );
        } else {
          const recoveredDef = Math.round(actingEnemy.maxDefense * 0.4);
          spawnFloatingEvent(
            actingEnemy.instanceId,
            `+${recoveredDef} DEF`,
            'defense'
          );
          setEnemySquad((prev) =>
            prev.map((u) =>
              u.instanceId === actingEnemy.instanceId
                ? {
                    ...u,
                    defense: Math.min(u.maxDefense, u.defense + recoveredDef),
                    brokenTurns: 0,
                    corrosiveStacks: 0,
                    illuminatedTurns: Math.max(0, (u.illuminatedTurns || 0) - 1),
                    intent: 'attack',
                  }
                : u
            )
          );
        }
      } else {
        const isHeavyStrike = actingEnemy.intent === 'heavy';
        const enemyAudioPrefix = getFactionAudioPrefix(actingEnemy.faction);
        playGameSfx(
          isHeavyStrike ? `${enemyAudioPrefix}_skill_1` : `${enemyAudioPrefix}_basic`,
          0,
          0.62
        );
        const rawStrike = isHeavyStrike
          ? Math.round(actingEnemy.attackDamage * 1.55)
          : actingEnemy.attackDamage;

        const baseSkithidEvade =
          factionId === 'skithid'
            ? Math.min(36, 16 + heroLoadout.chest.level * 4)
            : 0;
        const effectiveEvadeChance =
          playerIlluminatedTurnsRef.current > 0
            ? Math.round(baseSkithidEvade * 0.5)
            : baseSkithidEvade;

        const didEvade =
          effectiveEvadeChance > 0 && Math.random() * 100 < effectiveEvadeChance;

        setHitTargetId('player');
        scheduleCombatTimer(() => {
          setHitTargetId(null);
        }, 460);

        let valariThornsDamage = 0;

        if (didEvade) {
          playGameSfx('hit_evasion', 135);
          const evasionFocusCost = Math.max(
            42,
            Math.round(rawStrike * 0.68)
          );
          setPlayerDefense((prevDef) => Math.max(0, prevDef - evasionFocusCost));
          if (actingEnemy.faction === 'cygnus') {
            setPlayerIlluminatedTurns(GAME_BALANCE.combat.cygnusIlluminatedTurns);
            spawnFloatingEvent(
              'player',
              `¡ESQUIVA! -${evasionFocusCost} ESQ [FIJADO]`,
              'defense'
            );
          } else {
            spawnFloatingEvent(
              'player',
              `¡ESQUIVA SINÁPTICA! -${evasionFocusCost} ESQ`,
              'defense'
            );
          }
        } else {
          playGameSfx(
            getDefenseImpactAudioCue(getDefenseTypeForFaction(factionId)),
            135,
            0.6
          );
          let nextPlayerAcidStacks = playerCorrosiveStacksRef.current;
          if (actingEnemy.faction === 'skithid') {
            nextPlayerAcidStacks = Math.min(
              GAME_BALANCE.combat.skithidMaxAcidStacks,
              nextPlayerAcidStacks + (isHeavyStrike ? 2 : 1)
            );
            setPlayerCorrosiveStacks(nextPlayerAcidStacks);
          } else if (actingEnemy.faction === 'valari' && isHeavyStrike) {
            setPlayerShieldLockTurns(GAME_BALANCE.combat.valariShieldLockTurns);
          } else if (actingEnemy.faction === 'cygnus') {
            setPlayerIlluminatedTurns(GAME_BALANCE.combat.cygnusIlluminatedTurns);
          }

          const valariFlatReduction =
            factionId === 'valari' ? 8 + heroLoadout.chest.level * 5 : 0;
          const mitigatedStrike = Math.max(18, rawStrike - valariFlatReduction);
          const incomingDmg =
            playerBuffTurnsRef.current > 0
              ? Math.round(mitigatedStrike * 0.75)
              : mitigatedStrike;

          const acidBleedRatio =
            actingEnemy.faction === 'skithid'
              ? nextPlayerAcidStacks * GAME_BALANCE.combat.skithidAcidBleedPerStack
              : 0;

          setPlayerDefense((prevDef) => {
            const acidDirectToHp =
              acidBleedRatio > 0 && prevDef > 0
                ? Math.round(incomingDmg * acidBleedRatio)
                : 0;
            const dmgAgainstDef = Math.max(0, incomingDmg - acidDirectToHp);
            const absorbed = Math.min(prevDef, dmgAgainstDef);
            const overflowToHp =
              Math.max(0, dmgAgainstDef - absorbed) + acidDirectToHp;
            const nextDef = Math.max(0, prevDef - absorbed);

            if (prevDef > 0 && nextDef === 0) {
              playGameSfx('guard_break', 180, 0.65);
            }

            if (
              factionId === 'valari' &&
              absorbed > 0 &&
              prevDef >
                maxPlayerDefense * GAME_BALANCE.combat.valariReactiveArmorThreshold
            ) {
              valariThornsDamage = Math.max(
                6,
                Math.round(absorbed * GAME_BALANCE.combat.valariThornsReflectRatio)
              );
            }

            if (overflowToHp > 0) {
              setPlayerHp((prevHp) => {
                const nextHp = prevHp - overflowToHp;
                if (nextHp <= 0) {
                  spawnFloatingEvent(
                    'player',
                    '¡CHASIS CRÍTICO! REPLIEGUE',
                    'control'
                  );
                  pushLog(
                    `[ALERTA CRÍTICA] Chasis superado en ${
                      activePlanet?.name || 'Sector'
                    }. Evoluciona tus Chasis en la Forja o activa Protocolo Bélico en el Reactor. Retornando al Mando Central.`
                  );
                  scheduleCombatTimer(() => {
                    resetCombatEncounter(activePlanet, factionId);
                    setActiveTab('hub');
                  }, 950);
                  return maxPlayerHp;
                }
                spawnFloatingEvent(
                  'player',
                  isHeavyStrike
                    ? `¡IMPACTO PESADO! -${incomingDmg}`
                    : acidDirectToHp > 0
                      ? `ÁCIDO x${nextPlayerAcidStacks} · -${incomingDmg}`
                      : `-${incomingDmg}`,
                  'damage'
                );
                return nextHp;
              });
            } else {
              spawnFloatingEvent('player', `-${absorbed} DEF`, 'defense');
            }
            return nextDef;
          });
        }

        setEnemySquad((prev) =>
          prev.map((u) => {
            if (u.instanceId !== actingEnemy.instanceId) return u;
            const reflectedHp =
              valariThornsDamage > 0 ? Math.max(1, u.hp - valariThornsDamage) : u.hp;
            if (valariThornsDamage > 0) {
              spawnFloatingEvent(
                u.instanceId,
                `¡PLACAS REACTIVAS! -${valariThornsDamage}`,
                'damage'
              );
            }
            const nextIntent: EnemyIntentType =
              u.defense === 0
                ? 'fortify'
                : u.intent === 'attack' && (u.slotPosition !== 0 || u.hp < u.maxHp * 0.72)
                  ? 'heavy'
                  : 'attack';
            if (nextIntent === 'heavy' && u.intent !== 'heavy') {
              playGameSfx('enemy_heavy_warn', 320, 0.65);
            }
            return {
              ...u,
              hp: reflectedHp,
              brokenTurns: Math.max(0, u.brokenTurns - 1),
              neurotoxinTurns: Math.max(0, (u.neurotoxinTurns || 0) - 1),
              shieldLockTurns: Math.max(0, (u.shieldLockTurns || 0) - 1),
              illuminatedTurns: Math.max(0, (u.illuminatedTurns || 0) - 1),
              intent: nextIntent,
            };
          })
        );
      }

      scheduleCombatTimer(() => {
        isResolvingRef.current = false;
        setActiveActorId(null);
        const rotated = [...cleanedOrder.slice(1), cleanedOrder[0]];
        setTurnOrderIds(rotated);
        setTurnCount((prev) => prev + 1);
        const isNextPlayer = rotated[0] === 'player';
        if (isNextPlayer) {
          const wasShieldLocked = playerShieldLockTurnsRef.current > 0;
          if (playerShieldLockTurnsRef.current > 0) {
            setPlayerShieldLockTurns((prev) => Math.max(0, prev - 1));
          }
          if (playerIlluminatedTurnsRef.current > 0) {
            setPlayerIlluminatedTurns((prev) => Math.max(0, prev - 1));
          }

          if (factionId === 'cygnus') {
            if (wasShieldLocked) {
              spawnFloatingEvent('player', 'SOBRECARGA · 0 ESC', 'control');
            } else {
              const shieldRegen = Math.round(
                maxPlayerDefense * GAME_BALANCE.combat.cygnusTurnShieldRegenRatio
              );
              setPlayerDefense((prev) => {
                if (prev < maxPlayerDefense) {
                  spawnFloatingEvent(
                    'player',
                    `+${shieldRegen} ESC FASE`,
                    'defense'
                  );
                }
                return Math.min(maxPlayerDefense, prev + shieldRegen);
              });
            }
          }
        }
        setTurnPhase(isNextPlayer ? 'PLAYER_TURN' : 'ENEMY_TURN');
      }, 850);
    }, 850);
  }, [
    activePlanet,
    activeTab,
    factionId,
    heroLoadout.chest.level,
    isCombatActive,
    maxPlayerDefense,
    maxPlayerHp,
    pushLog,
    resetCombatEncounter,
    scheduleCombatTimer,
    spawnFloatingEvent,
    turnCount,
    turnPhase,
  ]);

  useEffect(() => {
    if (!isCombatActive || turnPhase !== 'WAVE_TRANSITION') return;

    const timer = scheduleCombatTimer(() => {
      if (currentWave >= totalWaves) {
        // Al completar la última oleada (3/3), mostramos el panel de decisión en el Frente de Batalla (Volver a combatir, Avanzar al siguiente sector o Volver a la Base)
        isResolvingRef.current = false;
        setActiveActorId(null);
        setHitTargetId(null);
        setTurnPhase('INCURSION_COMPLETE');
        return;
      }

      const nextWave = currentWave + 1;
      const nextSquad = buildWaveSquad(
        activePlanet,
        nextWave,
        factionId,
        reactorRoutingMode,
        characterLevel
      );
      const nextOrder = buildInitialTurnOrder(nextSquad, factionId);
      isResolvingRef.current = false;
      setCurrentWave(nextWave);
      setEnemySquad(nextSquad);
      setTurnOrderIds(nextOrder);
      setSelectedTargetId(nextSquad[0]?.instanceId || '');
      setActiveActorId(null);
      setHitTargetId(null);
      setTurnCount((prev) => prev + 1);
      setTurnPhase(nextOrder[0] === 'player' ? 'PLAYER_TURN' : 'ENEMY_TURN');
    }, 1350);

    return () => clearTimeout(timer);
  }, [
    activePlanet,
    characterLevel,
    currentWave,
    factionId,
    isCombatActive,
    pushLog,
    reactorRoutingMode,
    resetCombatEncounter,
    scheduleCombatTimer,
    totalWaves,
    turnPhase,
  ]);

  // IA táctica del modo AUTO IA (sólo actúa cuando la pantalla de combate está visible)
  useEffect(() => {
    if (
      activeTab !== 'combate' ||
      !isCombatActive ||
      !isAutoCombat ||
      turnPhase !== 'PLAYER_TURN' ||
      activeActorId !== null ||
      isResolvingRef.current
    ) {
      return;
    }

    const scaledDelay = Math.max(220, Math.round(950 / combatSpeed));
    const timer = setTimeout(() => {
      if (isResolvingRef.current || turnPhase !== 'PLAYER_TURN') return;
      const defPct = playerDefense / maxPlayerDefense;
      const hpPct = playerHp / maxPlayerHp;

      const healSkill = equippedSkills.find(
        (s) => s.role === 'heal' && s.currentCooldown === 0
      );
      if (
        healSkill &&
        (defPct <= 0.45 ||
          hpPct <= 0.65 ||
          playerCorrosiveStacks >= 2 ||
          playerShieldLockTurns > 0)
      ) {
        executeSkill(healSkill.slotIndex);
        return;
      }

      const controlSkill = equippedSkills.find(
        (s) => s.role === 'control' && s.currentCooldown === 0
      );
      if (controlSkill) {
        executeSkill(controlSkill.slotIndex);
        return;
      }

      const dmgSkill = equippedSkills.find(
        (s) => s.role === 'damage' && s.currentCooldown === 0
      );
      if (dmgSkill) {
        executeSkill(dmgSkill.slotIndex);
        return;
      }

      executeBasicAttack();
    }, scaledDelay);

    return () => clearTimeout(timer);
  }, [
    activeActorId,
    activeTab,
    combatSpeed,
    equippedSkills,
    executeBasicAttack,
    executeSkill,
    isAutoCombat,
    isCombatActive,
    maxPlayerDefense,
    maxPlayerHp,
    playerBuffTurns,
    playerCorrosiveStacks,
    playerDefense,
    playerHp,
    playerShieldLockTurns,
    turnCount,
    turnPhase,
  ]);

  const totalCitadelCostReductionPct = useMemo(() => {
    const gridTech = technologies.find((t) => t.id === 'tech_red_energetica');
    const techDiscount = gridTech ? gridTech.level * 5 : 5;
    const valariBonus = factionId === 'valari' ? 15 : 0;
    return Math.min(45, techDiscount + valariBonus);
  }, [technologies, factionId]);

  const siloMaxCapacity = useMemo(() => {
    const silo = buildings.find((b) => b.id === 'silo_logistico');
    const siloLevel = silo ? silo.level : 1;
    const logisticsTech = technologies.find(
      (t) => t.id === 'tech_eficiencia_logistica'
    );
    const techBonusPct = logisticsTech ? logisticsTech.level * 20 : 0;
    const baseCap = 2500 + siloLevel * 1500;
    return Math.round(baseCap * (1 + techBonusPct / 100));
  }, [buildings, technologies]);

  const siloUsed = useMemo(() => {
    return Object.values(inventory).reduce(
      (sum, qty) => sum + Math.max(0, Math.floor(qty)),
      0
    );
  }, [inventory]);

  const getFactionRawResourceIds = useCallback((facId: FactionId) => {
    const spec = FACTION_RESOURCE_SPECS[facId] || FACTION_RESOURCE_SPECS.valari;
    return {
      t1Id: spec.rawT1.id,
      t1Label: spec.rawT1.label,
      t2Id: spec.rawT2.id,
      t2Label: spec.rawT2.label,
    };
  }, []);

  // Reloj en tiempo real (250ms) para completar ampliaciones de Instalaciones e Investigaciones I+D
  useEffect(() => {
    const hasActiveUpgrades =
      Object.keys(activeBuildingUpgrades).length > 0 ||
      Object.keys(activeTechResearches).length > 0;
    if (!hasActiveUpgrades) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setNowTimestamp(now);

      Object.values(activeBuildingUpgrades).forEach((timer) => {
        if (now >= timer.endTime) {
          setActiveBuildingUpgrades((prev) => {
            if (!prev[timer.targetId]) return prev;
            const next = { ...prev };
            delete next[timer.targetId];
            return next;
          });
          setBuildings((prev) =>
            prev.map((b) =>
              b.id === timer.targetId
                ? { ...b, level: Math.min(b.maxLevel, timer.targetLevel) }
                : b
            )
          );
          setOperationalXp((prev) => prev + 65 * timer.targetLevel);
          playGameSfx('ui_level_up');
          pushLog(
            `[BASE] Obra completada: ${timer.targetTitle} operativo en Nivel ${timer.targetLevel}.`
          );
        }
      });

      Object.values(activeTechResearches).forEach((timer) => {
        if (now >= timer.endTime) {
          setActiveTechResearches((prev) => {
            if (!prev[timer.targetId]) return prev;
            const next = { ...prev };
            delete next[timer.targetId];
            return next;
          });
          setTechnologies((prev) =>
            prev.map((t) =>
              t.id === timer.targetId
                ? { ...t, level: Math.min(t.maxLevel, timer.targetLevel) }
                : t
            )
          );
          setOperationalXp((prev) => prev + 55 * timer.targetLevel);
          playGameSfx('ui_level_up');
          pushLog(
            `[LABORATORIO] Investigación completada: ${timer.targetTitle} en Nivel ${timer.targetLevel}.`
          );
        }
      });
    }, 250);

    return () => clearInterval(interval);
  }, [activeBuildingUpgrades, activeTechResearches, pushLog]);

  const upgradeBuilding = (buildingId: CitadelBuilding['id']) => {
    const target = buildings.find((b) => b.id === buildingId);
    if (!target || target.level >= target.maxLevel) return;
    if (activeBuildingUpgrades[buildingId]) return;

    const { ferritaCost, titanioCost, creditsCost } = calculateScaledCosts(
      target.baseFerritaCost,
      target.baseTitanioCost,
      target.baseCreditsCost,
      target.level,
      totalCitadelCostReductionPct
    );

    const { t1Id, t2Id } = getFactionRawResourceIds(factionId);
    const ownedT1 = Math.floor(inventory[t1Id] || 0);
    const ownedT2 = Math.floor(inventory[t2Id] || 0);

    if (ownedT1 < ferritaCost || ownedT2 < titanioCost || credits < creditsCost) {
      return;
    }

    const durationSec = getUpgradeDurationSeconds(target.level, reactorRoutingMode);
    const now = Date.now();

    setInventory((prev) => ({
      ...prev,
      [t1Id]: Math.max(0, (prev[t1Id] || 0) - ferritaCost),
      [t2Id]: Math.max(0, (prev[t2Id] || 0) - titanioCost),
    }));
    setCredits((prev) => Math.max(0, prev - creditsCost));
    setNowTimestamp(now);
    setActiveBuildingUpgrades((prev) => ({
      ...prev,
      [buildingId]: {
        targetId: buildingId,
        targetTitle: target.title,
        targetLevel: target.level + 1,
        startTime: now,
        endTime: now + durationSec * 1000,
        durationSec,
      },
    }));
    playGameSfx('ui_forge_craft');
    pushLog(
      `[BASE] Ampliando ${target.title} a Nivel ${target.level + 1} (Tiempo estimado: ${durationSec}s).`
    );
  };

  const researchTechnology = (techId: string) => {
    const target = technologies.find((t) => t.id === techId);
    if (!target || target.level >= target.maxLevel) return;
    if (activeTechResearches[techId]) return;

    const { ferritaCost, titanioCost, creditsCost } = calculateScaledCosts(
      target.baseFerritaCost,
      target.baseTitanioCost,
      target.baseCreditsCost,
      target.level,
      totalCitadelCostReductionPct
    );

    const { t1Id, t2Id } = getFactionRawResourceIds(factionId);
    const ownedT1 = Math.floor(inventory[t1Id] || 0);
    const ownedT2 = Math.floor(inventory[t2Id] || 0);

    if (ownedT1 < ferritaCost || ownedT2 < titanioCost || credits < creditsCost) {
      return;
    }

    const durationSec = getUpgradeDurationSeconds(target.level, reactorRoutingMode);
    const now = Date.now();

    setInventory((prev) => ({
      ...prev,
      [t1Id]: Math.max(0, (prev[t1Id] || 0) - ferritaCost),
      [t2Id]: Math.max(0, (prev[t2Id] || 0) - titanioCost),
    }));
    setCredits((prev) => Math.max(0, prev - creditsCost));
    setNowTimestamp(now);
    setActiveTechResearches((prev) => ({
      ...prev,
      [techId]: {
        targetId: techId,
        targetTitle: target.title,
        targetLevel: target.level + 1,
        startTime: now,
        endTime: now + durationSec * 1000,
        durationSec,
      },
    }));
    playGameSfx('ui_forge_craft');
    pushLog(
      `[LABORATORIO] Investigando ${target.title} Nivel ${target.level + 1} (Tiempo estimado: ${durationSec}s).`
    );
  };

  const scrapItem = (itemId: string, amount: number) => {
    const catalogItem = CITADEL_STORAGE_CATALOG.find(
      (item) => item.id === itemId
    );
    const owned = Math.floor(inventory[itemId] || 0);
    const validAmount = Math.min(owned, Math.max(1, amount));
    if (!catalogItem || validAmount <= 0) return;

    const scrapMultiplier =
      factionId === 'valari'
        ? GAME_BALANCE.citadel.valariScrapBonusMultiplier
        : 1.0;
    const unitScrapCredits = Math.round(
      catalogItem.scrapCreditsValue * scrapMultiplier
    );
    const gainedCredits = validAmount * unitScrapCredits;

    setInventory((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) - validAmount),
    }));
    setCredits((prev) => prev + gainedCredits);
    playGameSfx('ui_click');
    pushLog(
      `[ALMACÉN] Desguazado x${validAmount} ${catalogItem.name} (+${gainedCredits.toLocaleString('es-ES')} ₡).`
    );
  };

  const craftForgeItem = (item: ForgeRecipeItem) => {
    const conserveMaterials =
      factionId === 'cygnus' &&
      Math.random() < GAME_BALANCE.forge.cygnusMaterialConservationChance;

    setInventory((prev) => {
      const next = { ...prev };
      if (!conserveMaterials) {
        item.costs.forEach((c) => {
          if (c.id !== 'credits') {
            next[c.id] = Math.max(0, (next[c.id] || 0) - c.required);
          }
        });
      }
      if (item.outputResourceId) {
        next[item.outputResourceId] =
          (next[item.outputResourceId] || 0) + (item.outputAmount || 1);
      }
      return next;
    });
    const creditCost =
      item.costs.find((c) => c.id === 'credits')?.required || 0;
    if (creditCost > 0) {
      setCredits((prev) => Math.max(0, prev - creditCost));
    }
    setCraftedItemsCount((prev) => prev + 1);
    setOperationalXp((prev) => prev + 38 * item.tier);
    playGameSfx('ui_forge_craft');
    pushLog(
      `[FORJA] Síntesis completada: +${item.outputAmount || 1} ${item.name}${
        conserveMaterials ? ' (¡Compilación Cuántica Cygnus conservó materiales!)' : ''
      }.`
    );
  };

  const upgradeHeroChassis = (
    slot: HeroChassisSlot,
    costs: ForgeCostPill[],
    rawExtraMw: number
  ) => {
    const currentLoadout = heroLoadoutsByFaction[factionId];
    const targetItem = currentLoadout[slot];
    if (!targetItem || targetItem.level >= 5) return;

    for (const c of costs) {
      if (c.id === 'credits') {
        if (credits < c.required) return;
      } else {
        if (Math.floor(inventory[c.id] || 0) < c.required) return;
      }
    }

    setInventory((prev) => {
      const next = { ...prev };
      costs.forEach((c) => {
        if (c.id !== 'credits') {
          next[c.id] = Math.max(0, (next[c.id] || 0) - c.required);
        }
      });
      return next;
    });
    const creditCost = costs.find((c) => c.id === 'credits')?.required || 0;
    if (creditCost > 0) {
      setCredits((prev) => Math.max(0, prev - creditCost));
    }

    const nextLevel = targetItem.level + 1;
    const nextTier = Math.min(5, nextLevel) as ResourceTier;
    const nextQuality: ChassisQuality =
      nextLevel === 2
        ? 'calibrated'
        : nextLevel === 3 || nextLevel === 4
          ? 'overcharged'
          : 'sovereign';

    const statBoost =
      targetItem.primaryStat.type === 'damage'
        ? 18 + targetItem.level * 8
        : targetItem.primaryStat.type === 'shieldCapacity'
          ? 8 + targetItem.level * 4
          : targetItem.primaryStat.type === 'flatArmor'
            ? 8 + targetItem.level * 4
            : 5 + targetItem.level * 2;

    const romanMap: Record<number, string> = {
      1: 'Mk-I',
      2: 'Mk-II',
      3: 'Mk-III',
      4: 'Mk-IV',
      5: 'Mk-V',
    };
    const updatedName = targetItem.name.replace(
      /Mk-[IVX]+/i,
      romanMap[nextLevel] || `Mk-${nextLevel}`
    );

    const updatedItem: HeroChassisItem = {
      ...targetItem,
      name: updatedName,
      level: nextLevel,
      tier: nextTier,
      quality: nextQuality,
      powerDrawMw: targetItem.powerDrawMw + rawExtraMw,
      primaryStat: {
        ...targetItem.primaryStat,
        value: targetItem.primaryStat.value + statBoost,
      },
    };

    setHeroLoadoutsByFaction((prev) => {
      const facLoadout = prev[factionId];
      const nextFacLoadout: HeroLoadout = {
        ...facLoadout,
        [slot]: updatedItem,
      };
      nextFacLoadout.totalPowerDrawMw = computeLoadoutTotalMw(nextFacLoadout);
      return {
        ...prev,
        [factionId]: nextFacLoadout,
      };
    });

    setCombatXp((prev) => prev + 48 * nextLevel);
    setOperationalXp((prev) => prev + 52 * nextLevel);
    playGameSfx('ui_forge_craft');
    pushLog(
      `[HÉROE] ${updatedName} evolucionado a Grado ${romanMap[nextLevel]} (+${statBoost} stat principal).`
    );
  };

  // Directivas Operativas guiadas con recompensas reclamables
  const directives: OperationalDirective[] = useMemo(() => {
    const chassisUpgraded = Math.max(0, sumChassisLevels - 5);
    const reactorLvl = buildings[0]?.level || 1;
    const isReactorUpgrading = Boolean(activeBuildingUpgrades['reactor_central']);
    const totalTechUpgrades = technologies.reduce(
      (sum, t) => sum + Math.max(0, t.level - 1),
      0
    );
    const isResearchingAny = Object.keys(activeTechResearches).length > 0;
    const allSlotsMk2Count = [
      heroLoadout.weapon.level,
      heroLoadout.chest.level,
      heroLoadout.helmet.level,
      heroLoadout.gloves.level,
      heroLoadout.boots.level,
    ].filter((lvl) => lvl >= 2).length;
    const encounteredSpeciesCount = Object.keys(encounteredEnemyKeys).filter(
      (k) => encounteredEnemyKeys[k]
    ).length;
    const clearedPlanetsCount = Object.keys(clearedPlanetIds).filter(
      (k) => clearedPlanetIds[k]
    ).length;

    return OPERATIONAL_DIRECTIVES_CATALOG.map((d) => {
      let isCompleted = false;
      if (d.id === 'dir_first_sortie') {
        isCompleted = wavesClearedCount >= 1;
      } else if (d.id === 'dir_upgrade_chassis') {
        isCompleted = chassisUpgraded >= 1;
      } else if (d.id === 'dir_reactor_protocol') {
        isCompleted =
          protocolActivatedCount >= 1 || reactorLvl >= 2 || isReactorUpgrading;
      } else if (d.id === 'dir_craft_alloy') {
        isCompleted = craftedItemsCount >= 1;
      } else if (d.id === 'dir_orion_frontier') {
        isCompleted =
          (activePlanet?.tier || 1) >= 2 ||
          clearedPlanetsCount >= 2 ||
          orionDeployedCount >= 1;
      } else if (d.id === 'dir_lab_research') {
        isCompleted = totalTechUpgrades >= 1 || isResearchingAny;
      } else if (d.id === 'dir_full_mk2_loadout') {
        isCompleted = allSlotsMk2Count >= 5;
      } else if (d.id === 'dir_orion_corridor_deploy') {
        isCompleted =
          orionDeployedCount >= 1 || Boolean(activePlanet?.id.includes('ORI'));
      } else if (d.id === 'dir_bestiary_hunter') {
        isCompleted = encounteredSpeciesCount >= 5;
      } else if (d.id === 'dir_playtest_mastery') {
        isCompleted = characterLevel >= 4 && clearedPlanetsCount >= 3;
      }
      return {
        ...d,
        isCompleted,
        isClaimed: Boolean(claimedDirectives[d.id]),
      };
    });
  }, [
    activeBuildingUpgrades,
    activePlanet?.id,
    activePlanet?.tier,
    activeTechResearches,
    buildings,
    characterLevel,
    claimedDirectives,
    clearedPlanetIds,
    craftedItemsCount,
    encounteredEnemyKeys,
    heroLoadout,
    orionDeployedCount,
    protocolActivatedCount,
    sumChassisLevels,
    technologies,
    wavesClearedCount,
  ]);

  const notifiedDirectivesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (isSelectingFaction) return;
    const newlyCompleted = directives.find(
      (d) =>
        d.isCompleted &&
        !d.isClaimed &&
        !notifiedDirectivesRef.current.has(d.id)
    );
    if (newlyCompleted) {
      notifiedDirectivesRef.current.add(newlyCompleted.id);
      setCompletedDirectiveToast(newlyCompleted);
      playGameSfx('ui_level_up');
      pushLog(
        `[MANDO CENTRAL] Directiva completada: ${newlyCompleted.code} — ${newlyCompleted.title} (+${newlyCompleted.rewardCredits} ₡ listos para reclamar).`
      );
    }
  }, [directives, isSelectingFaction, pushLog]);

  const claimDirective = useCallback(
    (directiveId: string) => {
      const target = directives.find((d) => d.id === directiveId);
      if (!target || !target.isCompleted || target.isClaimed) return;

      playGameSfx('ui_forge_craft');
      setClaimedDirectives((prev) => ({ ...prev, [directiveId]: true }));
      setCredits((prev) => prev + target.rewardCredits);
      setOperationalXp((prev) => prev + 30);
      setCompletedDirectiveToast((prev) =>
        prev?.id === directiveId ? null : prev
      );
      pushLog(
        `[DIRECTIVA CUMPLIDA] ${target.code} — ${target.title}: Recompensa transferida (+${target.rewardCredits} ₡).`
      );
    },
    [directives, pushLog]
  );

  // Hitos Operativos Hard Sci-Fi (Recorrido Completo de la Prueba)
  const achievements: HardSciFiAchievement[] = useMemo(() => {
    const chassisUpgraded = Math.max(0, sumChassisLevels - 5);
    const reactorLvl = buildings[0]?.level || 1;
    const protoOrReactor =
      protocolActivatedCount >= 1 ||
      reactorLvl >= 2 ||
      Boolean(activeBuildingUpgrades['reactor_central'])
        ? 1
        : 0;
    const totalTechUpgrades = technologies.reduce(
      (sum, t) => sum + Math.max(0, t.level - 1),
      0
    );
    const allSlotsMk2Count = [
      heroLoadout.weapon.level,
      heroLoadout.chest.level,
      heroLoadout.helmet.level,
      heroLoadout.gloves.level,
      heroLoadout.boots.level,
    ].filter((lvl) => lvl >= 2).length;
    const encounteredSpeciesCount = Object.keys(encounteredEnemyKeys).filter(
      (k) => encounteredEnemyKeys[k]
    ).length;
    const clearedPlanetsCount = Object.keys(clearedPlanetIds).filter(
      (k) => clearedPlanetIds[k]
    ).length;

    const coreMilestonesMet = [
      sectorsClearedCount >= 1,
      allSlotsMk2Count >= 5,
      orionDeployedCount >= 1,
      encounteredSpeciesCount >= 5,
      characterLevel >= 4,
    ].filter(Boolean).length;

    return [
      {
        id: 'ach_first_wave',
        code: 'REC-01',
        title: 'Bautismo Orbital',
        description: 'Neutraliza tu primera oleada hostil en el Frente de Batalla.',
        progress: Math.min(1, wavesClearedCount),
        target: 1,
        unlocked: wavesClearedCount >= 1,
        categoryLabel: 'COMBATE',
      },
      {
        id: 'ach_sector_clear',
        code: 'REC-02',
        title: 'Supremacía Planetaria',
        description: 'Completa una incursión entera (Oleada 3/3) en cualquier órbita.',
        progress: Math.min(1, sectorsClearedCount),
        target: 1,
        unlocked: sectorsClearedCount >= 1,
        categoryLabel: 'CONQUISTA',
      },
      {
        id: 'ach_mk2_chassis',
        code: 'REC-03',
        title: 'Ingeniería Grado II',
        description: 'Evoluciona al menos una pieza de tu Equipamiento a Grado Mk-II.',
        progress: Math.min(1, chassisUpgraded),
        target: 1,
        unlocked: chassisUpgraded >= 1,
        categoryLabel: 'INGENIERÍA',
      },
      {
        id: 'ach_reactor_overclock',
        code: 'REC-04',
        title: 'Enrutamiento de Reserva',
        description: 'Activa un Protocolo de Reserva en el Reactor o amplía el Núcleo a Nv. 2.',
        progress: protoOrReactor,
        target: 1,
        unlocked: protoOrReactor >= 1,
        categoryLabel: 'ENERGÍA',
      },
      {
        id: 'ach_industrial_research',
        code: 'REC-05',
        title: 'Complejo Científico-Industrial',
        description: 'Sintetiza compuestos en la Forja e investiga mejoras en el Laboratorio.',
        progress: Math.min(2, craftedItemsCount + totalTechUpgrades),
        target: 2,
        unlocked: craftedItemsCount + totalTechUpgrades >= 2,
        categoryLabel: 'DESARROLLO',
      },
      {
        id: 'ach_full_mk2_suit',
        code: 'REC-06',
        title: 'Equipamiento Sincronizado Mk-II',
        description: 'Evoluciona las 5 piezas de tu Héroe (Arma, Coraza, Casco, Guantes, Botas) a Mk-II.',
        progress: Math.min(5, allSlotsMk2Count),
        target: 5,
        unlocked: allSlotsMk2Count >= 5,
        categoryLabel: 'EQUIPAMIENTO',
      },
      {
        id: 'ach_orion_corridor',
        code: 'REC-07',
        title: 'Explorador de Sectores (Tiers I–V)',
        description: 'Asegura incursiones completas (3/3) en distintos planetas del Sector Natal y Orión.',
        progress: Math.min(8, Math.max(clearedPlanetsCount, orionDeployedCount > 0 ? 2 : 0)),
        target: 8,
        unlocked: clearedPlanetsCount >= 8,
        categoryLabel: 'CARTOGRAFÍA',
      },
      {
        id: 'ach_bestiary_codex',
        code: 'REC-08',
        title: 'Códice de Hostiles y Amenazas Raras',
        description: 'Enfrenta y registra las 8 especies hostiles disponibles en la prueba (incluyendo Élites).',
        progress: Math.min(8, encounteredSpeciesCount),
        target: 8,
        unlocked: encounteredSpeciesCount >= 8,
        categoryLabel: 'INTELIGENCIA',
      },
      {
        id: 'ach_master_commander',
        code: 'REC-09',
        title: 'Veteranía de Combate',
        description: 'Alcanza el Nivel 5 de Héroe mediante victorias tácticas y evolución de equipamiento.',
        progress: Math.min(5, characterLevel),
        target: 5,
        unlocked: characterLevel >= 5,
        categoryLabel: 'RANGO',
      },
      {
        id: 'ach_playtest_complete',
        code: 'REC-10',
        title: 'Fin del Recorrido de la Prueba',
        description: 'Completa los 5 hitos troncales de la demo: Incursión 3/3, 5 piezas Mk-II+, Salto a Orión, 5+ Hostiles y Héroe Nv. 4+.',
        progress: coreMilestonesMet,
        target: 5,
        unlocked: coreMilestonesMet >= 5,
        categoryLabel: 'HITO FINAL',
      },
    ];
  }, [
    activeBuildingUpgrades,
    buildings,
    characterLevel,
    clearedPlanetIds,
    craftedItemsCount,
    encounteredEnemyKeys,
    heroLoadout,
    orionDeployedCount,
    protocolActivatedCount,
    sectorsClearedCount,
    sumChassisLevels,
    technologies,
    wavesClearedCount,
  ]);

  const resetGameProgress = () => {
    try {
      localStorage.removeItem(SAVE_STORAGE_KEY);
    } catch {
      // ignore
    }
    setPlayerNameState('Comandante');
    setCredits(MOCK_CREDITS);
    setInventory(MOCK_INVENTORY);
    setBuildings(INITIAL_CITADEL_BUILDINGS);
    setTechnologies(INITIAL_CITADEL_TECHNOLOGIES);
    setReactorRoutingModeState('none');
    setHeroLoadoutsByFaction({
      valari: getDefaultHeroLoadout('valari'),
      skithid: getDefaultHeroLoadout('skithid'),
      cygnus: getDefaultHeroLoadout('cygnus'),
    });
    setCombatXp(0);
    setOperationalXp(0);
    setActiveBuildingUpgrades({});
    setActiveTechResearches({});
    setWavesClearedCount(0);
    setSectorsClearedCount(0);
    setProtocolActivatedCount(0);
    setCraftedItemsCount(0);
    setOrionDeployedCount(0);
    setClaimedDirectives({});
    notifiedDirectivesRef.current.clear();
    setCompletedDirectiveToast(null);
    setCombatSessionLoot({ credits: 0, wavesCleared: 0, items: [] });
    setEncounteredEnemyKeys({});
    setClearedPlanetIds({});
    setVisitedTutorialScreens({});
    setTutorialsEnabled(true);
    setTutorialStepIndex(0);
    setIsAutoCombat(false);
    setCombatSpeed(1);
    setActiveTab('hub');
    resetCombatEncounter(activePlanet, factionId);
    setIsSelectingFaction(true);
    setActivityFeed([
      '[SISTEMA] Progreso de partida reiniciado por completo a estado virgen (Nivel 1, 0 recursos, 0 hostiles identificados).',
    ]);
  };

  const toggleCombat = () => {
    clearCombatTimers();
    setIsCombatActive((prev) => !prev);
  };

  const toggleAutoCombat = () => {
    setIsAutoCombat((prev) => !prev);
  };

  const value: GameContextValue = {
    activeTab,
    setActiveTab,
    factionId,
    selectFaction,
    isSelectingFaction,
    openFactionSelector,
    isTutorialActive,
    activeTutorialScreenKey,
    tutorialStepIndex,
    setTutorialStep,
    skipTutorial,
    disableAllTutorials,
    restartTutorial,
    usedReactorMw,
    maxReactorMw,
    reserveReactorMw,
    currentFaction,
    theme,
    currentLocation,
    activePlanet,
    navigateToSector,
    playerName,
    setPlayerName,
    characterLevel,
    professionLevel,
    heroXpPct,
    professionXpPct,
    heroLoadout,
    heroCombatStats: {
      ...MOCK_HERO_STATS,
      maxPlayerHp,
      maxPlayerShield: maxPlayerDefense,
      playerAttackDmg: playerBaseAttackDmg,
    },
    reactorRoutingMode,
    setReactorRoutingMode,
    toggleChassisLowPower,
    credits,
    inventory,
    buildings,
    technologies,
    storageCatalog: CITADEL_STORAGE_CATALOG,
    siloUsed,
    siloMaxCapacity,
    totalCitadelCostReductionPct,
    directives,
    claimDirective,
    completedDirectiveToast,
    dismissDirectiveToast,
    achievements,
    forgeInitialTab,
    openForgeTab,
    combatSessionLoot,
    clearCombatSessionLoot,
    restartCurrentIncursion,
    advanceToNextPlanetIncursion,
    nextUnlockedPlanetName,
    encounteredEnemyKeys,
    selectedEnemy: DEFAULT_PREVIEW_ENEMY,
    enemySquad,
    selectedTargetId,
    selectTarget,
    currentWave,
    totalWaves,
    turnPhase,
    turnQueue,
    turnCount,
    isAutoCombat,
    toggleAutoCombat,
    combatSpeed,
    setCombatSpeed,
    isCombatActive,
    toggleCombat,
    playerHp,
    maxPlayerHp,
    playerDefense,
    maxPlayerDefense,
    playerBuffTurns,
    playerCombatStatus,
    equippedSkills,
    activeActorId,
    hitTargetId,
    floatingEvents,
    executeBasicAttack,
    executeSkill,
    activityFeed,
    upgradeBuilding,
    researchTechnology,
    activeBuildingUpgrades,
    activeTechResearches,
    nowTimestamp,
    scrapItem,
    craftForgeItem,
    upgradeHeroChassis,
    resetGameProgress,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export function useGameContext(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGameContext debe usarse dentro de un GameProvider');
  }
  return ctx;
}
