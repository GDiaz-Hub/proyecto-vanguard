export type FactionId = 'valari' | 'skithid' | 'cygnus';

export type ResourceTier = 1 | 2 | 3 | 4 | 5;

export type ResourceOrigin = 'raw' | 'crafted' | 'endgame';

export type DamageType = 'Kinetic' | 'Energy' | 'Corrosive';

export type DefenseType = 'Armor' | 'Evasion' | 'Shields';

export interface CombatResistances {
  kinetic: number;
  energy: number;
  corrosive: number;
}

export type CitadelSection =
  | 'reactor'
  | 'forja_instalacion'
  | 'laboratorio'
  | 'almacen';

export type ReactorRoutingMode = 'none' | 'industrial' | 'orbital' | 'belico';

export type CombatSpeed = 1 | 2 | 3;

export type ModuleTab =
  | 'hub'
  | 'directivas'
  | 'ciudadela_reactor'
  | 'ciudadela_forja'
  | 'ciudadela_laboratorio'
  | 'ciudadela_almacen'
  | 'comandante'
  | 'forja'
  | 'combate'
  | 'exploracion'
  | 'exploracion_hostiles'
  | 'facciones'
  | 'audio_lab';

export type TutorialScreenKey =
  | 'hub'
  | 'directivas'
  | 'ciudadela_reactor'
  | 'ciudadela_forja'
  | 'ciudadela_laboratorio'
  | 'ciudadela_almacen'
  | 'comandante'
  | 'exploracion'
  | 'exploracion_hostiles'
  | 'combate';

export type ResourceIconKey =
  | 'cuboid'
  | 'box'
  | 'diamond'
  | 'atom'
  | 'shield'
  | 'cylinder'
  | 'layers'
  | 'eclipse'
  | 'hexagon'
  | 'biohazard'
  | 'dna'
  | 'heart-pulse'
  | 'activity'
  | 'octagon'
  | 'brain-circuit'
  | 'radiation'
  | 'microchip'
  | 'circuit-board'
  | 'sparkles'
  | 'waves'
  | 'gem'
  | 'zap'
  | 'network'
  | 'orbit'
  | 'cpu'
  | 'database'
  | 'cog'
  | 'power'
  | 'hard-drive'
  | 'binary'
  | 'gauge'
  | 'cable'
  | 'disc';

export type StorageCategory =
  | 'Minerales'
  | 'Biomasa'
  | 'Componentes Tácticos'
  | 'Planos';

export type ItemQuality =
  | 'Común'
  | 'Refinado'
  | 'Superior'
  | 'Reliquia'
  | 'Cuántico';

export interface InventoryItem {
  id: string;
  name: string;
  tier: ResourceTier;
  quality: ItemQuality;
  itemType: StorageCategory;
  quantity: number;
  scrapCreditsValue: number;
  description: string;
  iconKey: ResourceIconKey;
}

export interface CitadelBuilding {
  id:
    | 'reactor_central'
    | 'matriz_ensamblaje'
    | 'laboratorio_tecnologico'
    | 'silo_logistico';
  title: string;
  codeName: string;
  description: string;
  level: number;
  maxLevel: number;
  summaryEffect: string;
  requiresReactorCap: boolean;
  baseFerritaCost: number;
  baseTitanioCost: number;
  baseCreditsCost: number;
  iconKey: ResourceIconKey;
}

export interface Technology {
  id: string;
  title: string;
  domain: string;
  level: number;
  maxLevel: number;
  requiredLabLevel: number;
  summaryEffect: string;
  baseFerritaCost: number;
  baseTitanioCost: number;
  baseCreditsCost: number;
  iconKey: ResourceIconKey;
}

export interface CitadelStorageItem {
  id: string;
  name: string;
  category: StorageCategory;
  quality: ItemQuality;
  tier: ResourceTier;
  unitVolume: number;
  scrapCreditsValue: number;
  description: string;
  iconKey: ResourceIconKey;
}

export interface FactionInfo {
  id: FactionId;
  name: string;
  shortName: string;
  lore: string;
  portraitPath: string;
  portraitAlt: string;
  colorHex: string;
  accentTextClass: string;
  accentBorderClass: string;
  accentBgClass: string;
  panelBgClass: string;
  baseDamageType: DamageType;
  baseDefenseType: DefenseType;
  strongAgainst: FactionId;
  weakAgainst: FactionId;
  vulnerableToDamage: DamageType;
  passives: string[];
  baseResistances: CombatResistances;
  bonuses: {
    miningSpeed: number;
    harvestSpeed: number;
    compilationYield: number;
    physicalAttack: number;
    armor: number;
    lifesteal: number;
    evasion: number;
    bioShield: number;
    attackSpeed: number;
    critChance: number;
    citadelCostReduction: number;
    citadelCycleSpeed: number;
  };
}

export interface ResourceItem {
  id: string;
  name: string;
  factionAffinity: FactionId;
  origin: ResourceOrigin;
  storageCategory: StorageCategory;
  category:
    | 'Materia Prima Valari'
    | 'Metalurgia Valari'
    | 'Biomasa Bruta Skithid'
    | 'Bio-Mutación Skithid'
    | 'Datos Crudos Cygnus'
    | 'Compilación Cygnus';
  tier: ResourceTier;
  valueCredits: number;
  description: string;
  iconKey: ResourceIconKey;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  factionAffinity: FactionId;
  category: 'Metalurgia' | 'Bio-Mutación' | 'Forja Cuántica';
  outputResourceId: string;
  outputAmount: number;
  baseCycleSeconds: number;
  creditsCost: number;
  ingredients: { resourceId: string; amount: number }[];
  description: string;
  iconKey: ResourceIconKey;
}

export interface CombatEnemy {
  id: string;
  name: string;
  subtitle: string;
  faction: FactionId;
  threatLevel: number;
  damageType: DamageType;
  defenseType: DefenseType;
  resistances: CombatResistances;
  maxHp: number;
  maxShield: number;
  regenerationPerTick: number;
  attackDamage: number;
  attackIntervalSeconds: number;
  armorPercent: number;
  evasionPercent: number;
  rewardCredits: number;
  rewardResourceId: string;
  rewardAmount: number;
  lore: string;
}

export interface StarSector {
  id: string;
  name: string;
  coordinates: string;
  controllingFaction: FactionId;
  targetFactionAffinity: FactionId;
  enemyId: string;
  tier: 5;
  hazardLevel: number;
  hazardDamageType: DamageType;
  enemyDefenseType: DefenseType;
  requiredResistanceType: DamageType;
  requiredResistanceValue: number;
  jumpFuelCost: number;
  cycleTimeSeconds: number;
  creditReward: number;
  resourceDropId: string;
  resourceDropAmount: number;
  discovered: boolean;
  description: string;
}

export interface VanguardSaveData {
  version: number;
  playerName: string;
  factionId: FactionId;
  currentLocation?: string;
  credits: number;
  inventory: Record<string, number>;
  characterXp: number;
  professionXp: number;
  buildingLevels?: Record<string, number>;
  technologyLevels?: Record<string, number>;
  lastSaveTime: number;
}

export type HeroChassisSlot =
  | 'weapon'
  | 'chest'
  | 'helmet'
  | 'gloves'
  | 'boots';

export type ChassisQuality =
  | 'standard'
  | 'calibrated'
  | 'overcharged'
  | 'sovereign';

export interface HeroChassisItem {
  id: string;
  name: string;
  slot: HeroChassisSlot;
  tier: ResourceTier;
  quality: ChassisQuality;
  level: number;
  /** Si el jugador regula la pieza en Modo Bajo Consumo en el Reactor para liberar MW */
  lowPowerMode?: boolean;
  primaryStat: {
    type: 'damage' | 'flatArmor' | 'evasion' | 'shieldCapacity';
    value: number;
  };
  secondaryStat?: {
    type: 'critChance' | 'accuracy' | 'reconLuck' | 'attackSpeed';
    value: number;
  };
  powerDrawMw: number;
  specialAffix?: string;
}

export interface HeroLoadout {
  weapon: HeroChassisItem;
  chest: HeroChassisItem;
  helmet: HeroChassisItem;
  gloves: HeroChassisItem;
  boots: HeroChassisItem;
  totalPowerDrawMw: number;
}

export type CombatSkillRole = 'damage' | 'control' | 'heal' | 'buff';

export interface CombatEquipableSkill {
  id: string;
  slotIndex: 1 | 2 | 3 | 4;
  name: string;
  role: CombatSkillRole;
  roleLabel: string;
  cooldownTurns: number;
  currentCooldown: number;
  description: string;
}

export type EnemyIntentType = 'attack' | 'heavy' | 'fortify';

export interface CombatSquadUnit {
  instanceId: string;
  /** Clave canónica de especie/amenaza para el Códice de Hostiles */
  unitKey?: string;
  isRareElite?: boolean;
  spawnChancePct?: number;
  /** 0 = Vanguardia frontal, 1 = Flanco superior, 2 = Flanco inferior */
  slotPosition: 0 | 1 | 2;
  /** Nombre corto definiendo el rol/tipo de enemigo */
  name: string;
  roleTitle: string;
  faction: FactionId;
  defenseType: DefenseType;
  level: number;
  speed: number;
  hp: number;
  maxHp: number;
  /** Valor actual de la barra superior segmentada (Placas Valari / Esquiva Skithid / Escudo Cygnus) */
  defense: number;
  maxDefense: number;
  attackDamage: number;
  stunnedTurns: number;
  /** Turnos restantes en estado de RUPTURA (defensa quebrada -> +50% daño crítico recibido) */
  brokenTurns: number;
  /** Cargas de Ácido Quirúrgico Skithid (0..3 -> cada carga filtra 6% de daño directo a HP ignorando blindaje) */
  corrosiveStacks?: number;
  /** Turnos de Sobrecarga Cinética Valari (impide recargar escudos/defensa) */
  shieldLockTurns?: number;
  /** Turnos de Marcado Lumínico Cygnus (reduce evasión a la mitad y recibe +10% daño de precisión) */
  illuminatedTurns?: number;
  /** Intención táctica que ejecutará en su próximo turno */
  intent: EnemyIntentType;
  spriteUrl?: string;
  /** Ruta opcional para miniatura dedicada en la barra de turnos superior */
  portraitUrl?: string;
  rewardCredits: number;
  rewardResourceId: string;
  rewardAmount: number;
}

export interface PlayerCombatStatus {
  corrosiveStacks: number;
  shieldLockTurns: number;
  illuminatedTurns: number;
  reactiveArmorActive: boolean;
  phaseResonanceActive: boolean;
}

export interface CombatTurnQueueItem {
  actorId: 'player' | string;
  isPlayer: boolean;
  name: string;
  faction: FactionId;
  speed: number;
  portraitUrl: string;
  stunned: boolean;
  broken: boolean;
  intent?: EnemyIntentType;
}

export type CombatTurnPhase = 'PLAYER_TURN' | 'ENEMY_TURN' | 'WAVE_TRANSITION';

export interface CombatFloatingEvent {
  id: string;
  targetId: 'player' | string;
  text: string;
  tone: 'damage' | 'defense' | 'heal' | 'control' | 'buff';
}

export interface OperationalDirective {
  id: string;
  code: string;
  title: string;
  description: string;
  targetTab: ModuleTab;
  actionLabel: string;
  rewardCredits: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface HardSciFiAchievement {
  id: string;
  code: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  unlocked: boolean;
  categoryLabel: string;
}