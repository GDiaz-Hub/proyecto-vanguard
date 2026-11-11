// src/components/CombatView.tsx
import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Coins,
  FastForward,
  Flame,
  HeartPulse,
  LogOut,
  Package,
  Pause,
  Play,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sword,
  Zap,
} from 'lucide-react';
import { CombatSessionLoot } from '../context/GameContext';
import {
  CombatEnemy,
  CombatEquipableSkill,
  CombatFloatingEvent,
  CombatSpeed,
  CombatSquadUnit,
  CombatTurnPhase,
  CombatTurnQueueItem,
  DefenseType,
  FactionId,
  FactionInfo,
  PlayerCombatStatus,
} from '../types/game';
import { TutorialBeacon } from './OnboardingTutorialOverlay';
import { renderSciFiIcon } from './ThemedIcon';

export interface CombatStageProps {
  id?: string;
  arenaUrl?: string;
}

export type VisorHudVersion = 'puente' | 'casco' | 'reticula';

export interface CombatViewProps {
  stageConfig?: CombatStageProps;
  currentLocation?: string;
  playerName: string;
  characterLevel: number;
  currentFaction: FactionInfo;
  selectedEnemy: CombatEnemy & { level?: number; spriteUrl?: string };
  enemySquad: CombatSquadUnit[];
  selectedTargetId: string;
  onSelectTarget: (unitId: string) => void;
  currentWave: number;
  totalWaves: number;
  turnPhase: CombatTurnPhase;
  turnQueue: CombatTurnQueueItem[];
  turnCount: number;
  isAutoCombat: boolean;
  onToggleAutoCombat: () => void;
  combatSpeed?: CombatSpeed;
  onChangeCombatSpeed?: (speed: CombatSpeed) => void;
  playerHp: number;
  maxPlayerHp: number;
  playerDefense: number;
  maxPlayerDefense: number;
  playerBuffTurns: number;
  playerCombatStatus?: PlayerCombatStatus;
  equippedSkills: CombatEquipableSkill[];
  activeActorId: 'player' | string | null;
  hitTargetId: 'player' | string | null;
  floatingEvents: CombatFloatingEvent[];
  isCombatActive: boolean;
  onToggleCombat: () => void;
  onBasicAttack: () => void;
  onUseSkill: (slotIndex: 1 | 2 | 3 | 4) => void;
  onReturnToCitadel: () => void;
  sessionLoot?: CombatSessionLoot;
  onClearSessionLoot?: () => void;
  isTutorialActive?: boolean;
}

export const HERO_CB_SPRITES: Record<FactionId, string> = {
  valari: '/assets/unidades/hero-cb-valari.png',
  skithid: '/assets/unidades/hero-cb-skithid.png',
  cygnus: '/assets/unidades/hero-cb-cygnus.png',
};

const DEFAULT_STAGE: Required<CombatStageProps> = {
  id: 'PLN-VAL-01',
  arenaUrl: '/assets/arenas/PLN-VAL-01.jpg',
};

// Contorno negro nítido de 1px + sombra profunda multicapa para máxima legibilidad sobre fondos brillantes de la arena
const ARENA_TEXT_OUTLINE =
  '[paint-order:stroke_fill] [-webkit-text-stroke:2.5px_#000000] [text-shadow:0_1px_0_#000,0_-1px_0_#000,1px_0_0_#000,-1px_0_0_#000,1px_1px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,0_2px_6px_rgba(0,0,0,1),0_0_12px_rgba(0,0,0,0.95)]';

const DEFENSE_BAR_CONFIG: Record<
  DefenseType,
  {
    label: string;
    shortTag: string;
    fillClass: string;
    activeBorderClass: string;
    textClass: string;
  }
> = {
  Armor: {
    label: 'BLINDAJE',
    shortTag: 'BLINDAJE',
    fillClass: 'bg-slate-300 border-t border-white/85',
    activeBorderClass: 'border-slate-300/65',
    textClass: 'text-slate-100',
  },
  Evasion: {
    label: 'ESQUIVA',
    shortTag: 'ESQUIVA',
    fillClass: 'bg-emerald-400 border-t border-emerald-200/75',
    activeBorderClass: 'border-emerald-400/65',
    textClass: 'text-emerald-300',
  },
  Shields: {
    label: 'ESCUDO',
    shortTag: 'ESCUDO',
    fillClass: 'bg-cyan-400 border-t border-cyan-200/75',
    activeBorderClass: 'border-cyan-400/65',
    textClass: 'text-cyan-300',
  },
};

const FACTION_DOCK_THEMES: Record<
  FactionId,
  {
    dockBg: string;
    dockBorder: string;
    cardBg: string;
    iconBox: string;
    accentText: string;
    keyBadge: string;
    glowEffect: string;
    readyTag: string;
    ringColor: string;
    portraitBorder: string;
    slashColor: string;
    slashGlow: string;
    visorStroke: string;
    visorSecondaryStroke: string;
    visorBorderClass: string;
    visorName: string;
    topBarClass: string;
    activeBorderClass: string;
    segmentFillClass: string;
  }
> = {
  valari: {
    dockBg: 'bg-[#070b12]/92',
    dockBorder: 'border-amber-500/40 shadow-[0_12px_32px_rgba(0,0,0,0.92)]',
    cardBg:
      'bg-[#090d14]/95 border-amber-500/40 group-hover:border-amber-400/85 group-hover:bg-[#0d131d] group-hover:shadow-[0_0_16px_rgba(245,158,11,0.22)]',
    iconBox: 'bg-amber-950/60 border-amber-400/50 text-amber-300',
    accentText: 'text-amber-400',
    keyBadge: 'bg-[#05080f] border-amber-500/50 text-amber-300',
    glowEffect: 'bg-gradient-to-t from-amber-500/15 via-transparent to-white/5',
    readyTag: 'text-amber-300',
    ringColor: 'rgba(251, 191, 36, 0.55)',
    portraitBorder: 'border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)]',
    slashColor: 'from-amber-200 via-amber-400 to-transparent',
    slashGlow: 'rgba(251, 191, 36, 0.7)',
    visorStroke: '#F59E0B',
    visorSecondaryStroke: '#FBBF24',
    visorBorderClass: 'border-amber-500/50',
    visorName: 'VISOR BALÍSTICO VALARI',
    topBarClass: 'bg-amber-400',
    activeBorderClass: 'border-amber-500/55',
    segmentFillClass: 'bg-amber-500',
  },
  skithid: {
    dockBg: 'bg-[#060f0b]/92',
    dockBorder: 'border-emerald-500/40 shadow-[0_12px_32px_rgba(0,0,0,0.92)]',
    cardBg:
      'bg-[#090d14]/95 border-emerald-500/40 group-hover:border-emerald-400/85 group-hover:bg-[#0b1512] group-hover:shadow-[0_0_16px_rgba(16,185,129,0.22)]',
    iconBox: 'bg-emerald-950/60 border-emerald-400/50 text-emerald-300',
    accentText: 'text-emerald-400',
    keyBadge: 'bg-[#05080f] border-emerald-500/50 text-emerald-300',
    glowEffect: 'bg-gradient-to-t from-emerald-500/15 via-transparent to-white/5',
    readyTag: 'text-emerald-300',
    ringColor: 'rgba(52, 211, 153, 0.55)',
    portraitBorder: 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.45)]',
    slashColor: 'from-teal-100 via-emerald-400 to-transparent',
    slashGlow: 'rgba(52, 211, 153, 0.7)',
    visorStroke: '#10B981',
    visorSecondaryStroke: '#34D399',
    visorBorderClass: 'border-emerald-500/50',
    visorName: 'VISOR BIO-ÓPTICO SKITHID',
    topBarClass: 'bg-emerald-400',
    activeBorderClass: 'border-emerald-500/55',
    segmentFillClass: 'bg-emerald-500',
  },
  cygnus: {
    dockBg: 'bg-[#060c17]/92',
    dockBorder: 'border-sky-500/40 shadow-[0_12px_32px_rgba(0,0,0,0.92)]',
    cardBg:
      'bg-[#090d14]/95 border-sky-500/40 group-hover:border-sky-400/85 group-hover:bg-[#0b1320] group-hover:shadow-[0_0_16px_rgba(56,189,248,0.22)]',
    iconBox: 'bg-sky-950/60 border-sky-400/50 text-sky-300',
    accentText: 'text-sky-400',
    keyBadge: 'bg-[#05080f] border-sky-500/50 text-sky-300',
    glowEffect: 'bg-gradient-to-t from-sky-500/15 via-transparent to-white/5',
    readyTag: 'text-sky-300',
    ringColor: 'rgba(56, 189, 248, 0.55)',
    portraitBorder: 'border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.45)]',
    slashColor: 'from-cyan-100 via-sky-400 to-transparent',
    slashGlow: 'rgba(56, 189, 248, 0.7)',
    visorStroke: '#38BDF8',
    visorSecondaryStroke: '#7DD3FC',
    visorBorderClass: 'border-sky-500/50',
    visorName: 'VISOR CUÁNTICO CYGNUS',
    topBarClass: 'bg-sky-400',
    activeBorderClass: 'border-sky-500/55',
    segmentFillClass: 'bg-sky-500',
  },
};

const SKILL_SYNERGY_HINTS: Record<CombatEquipableSkill['role'], string> = {
  damage: 'Sinergia: Causa ¡EJECUCIÓN! (+55% daño crítico) en Ruptura y aplica estado de facción.',
  control: 'Sinergia: Suprime el turno del objetivo y cancela cargas de Ataque Pesado (!).',
  heal: 'Counterplay: Restaura Defensa/HP y purga todas las cargas de Ácido, Sobrecarga o Fijación.',
  buff: 'Táctica: Sobrecarga armas (+35% ATQ), refuerza defensa y reduce daño recibido por 2 turnos.',
};

function getEnemySlotCoordinates(
  slotPosition: 0 | 1 | 2,
  totalUnits: number
): {
  rightPct: number;
  bottomPct: number;
  heightClass: string;
  zIndex: number;
  labelOffsetTopPx: number;
} {
  if (totalUnits === 1) {
    return {
      rightPct: 24,
      bottomPct: 18.5,
      heightClass: 'h-[24%]',
      zIndex: 22,
      labelOffsetTopPx: 22,
    };
  }
  if (totalUnits === 2) {
    if (slotPosition === 0) {
      return {
        rightPct: 31,
        bottomPct: 17.5,
        heightClass: 'h-[23.5%]',
        zIndex: 23,
        labelOffsetTopPx: 20,
      };
    }
    return {
      rightPct: 14.5,
      bottomPct: 21.5,
      heightClass: 'h-[20.5%]',
      zIndex: 21,
      labelOffsetTopPx: 28,
    };
  }
  if (slotPosition === 0) {
    return {
      rightPct: 33,
      bottomPct: 18,
      heightClass: 'h-[23.5%]',
      zIndex: 23,
      labelOffsetTopPx: 20,
    };
  }
  if (slotPosition === 1) {
    return {
      rightPct: 20.5,
      bottomPct: 23,
      heightClass: 'h-[19.5%]',
      zIndex: 21,
      labelOffsetTopPx: 30,
    };
  }
  return {
    rightPct: 11.5,
    bottomPct: 15,
    heightClass: 'h-[20.5%]',
    zIndex: 24,
    labelOffsetTopPx: 18,
  };
}

/**
 * Perfil cinemático de embestida e impacto según clase de unidad (Ligera, Media, Pesada, Élite/Jefe).
 * Nunca agranda el sprite (sin scale-up); desplaza hacia adelante como el Héroe variando velocidad y contundencia.
 */
function getEnemyAttackMotionProfile(unit?: CombatSquadUnit): {
  durationClass: string;
  lungeTransformClass: string;
  playerHitReactionClass: string;
  burstScaleClass: string;
  auraClass: string;
} {
  if (!unit) {
    return {
      durationClass: 'duration-175 ease-out',
      lungeTransformClass: '-translate-x-14 -translate-y-1',
      playerHitReactionClass: 'duration-150 -translate-x-3.5 brightness-125',
      burstScaleClass: 'scale-100',
      auraClass: 'w-10 h-10 bg-rose-500/35',
    };
  }

  const sig = `${unit.unitKey || ''} ${unit.roleTitle || ''} ${unit.spriteUrl || ''}`.toLowerCase();
  const isEliteOrBoss =
    Boolean(unit.isRareElite) ||
    sig.includes('elite') ||
    sig.includes('élite') ||
    sig.includes('jefe');

  if (isEliteOrBoss) {
    return {
      durationClass: 'duration-200 ease-out',
      lungeTransformClass: '-translate-x-16 -translate-y-1',
      playerHitReactionClass: 'duration-200 -translate-x-6 -translate-y-0.5 brightness-150',
      burstScaleClass: 'scale-135',
      auraClass: 'w-14 h-14 bg-amber-500/45',
    };
  }

  if (sig.includes('ligera')) {
    return {
      durationClass: 'duration-100 ease-out',
      lungeTransformClass: '-translate-x-18 -translate-y-1.5',
      playerHitReactionClass: 'duration-100 -translate-x-2.5 brightness-125',
      burstScaleClass: 'scale-90',
      auraClass: 'w-8 h-8 bg-rose-400/30',
    };
  }

  if (sig.includes('pesada')) {
    return {
      durationClass: 'duration-260 ease-in-out',
      lungeTransformClass: '-translate-x-10 translate-y-0.5',
      playerHitReactionClass: 'duration-220 -translate-x-5 translate-y-0.5 brightness-135',
      burstScaleClass: 'scale-125',
      auraClass: 'w-12 h-12 bg-rose-600/45',
    };
  }

  // Unidad Media (estándar táctico igual al Héroe)
  return {
    durationClass: 'duration-175 ease-out',
    lungeTransformClass: '-translate-x-14 -translate-y-1',
    playerHitReactionClass: 'duration-150 -translate-x-3.5 brightness-125',
    burstScaleClass: 'scale-100',
    auraClass: 'w-10 h-10 bg-rose-500/35',
  };
}

interface SlantedSegmentedBar5Props {
  current: number;
  max: number;
  fillClass: string;
  activeBorderClass: string;
  heightClass?: string;
  reverse?: boolean;
}

const SlantedSegmentedBar5: React.FC<SlantedSegmentedBar5Props> = ({
  current,
  max,
  fillClass,
  activeBorderClass,
  heightClass = 'h-2.5',
  reverse = false,
}) => {
  const safeMax = Math.max(1, max);
  const ratio = Math.max(0, Math.min(1, current / safeMax));
  const [ghostRatio, setGhostRatio] = useState<number>(ratio);

  useEffect(() => {
    if (ratio < ghostRatio) {
      const timer = setTimeout(() => {
        setGhostRatio(ratio);
      }, 500);
      return () => clearTimeout(timer);
    }
    setGhostRatio(ratio);
  }, [ratio, ghostRatio]);

  const segments = [0, 1, 2, 3, 4];

  return (
    <div className="w-full grid grid-cols-5 gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
      {segments.map((segIdx) => {
        const logicalIdx = reverse ? 4 - segIdx : segIdx;
        const segStart = logicalIdx * 0.2;
        const segFillPct = Math.max(0, Math.min(100, ((ratio - segStart) / 0.2) * 100));
        const segGhostPct = Math.max(
          segFillPct,
          Math.min(100, ((ghostRatio - segStart) / 0.2) * 100)
        );
        const hasFill = segFillPct > 0;

        return (
          <div
            key={segIdx}
            className={`relative ${heightClass} -skew-x-[18deg] bg-[#06090f]/95 border overflow-hidden p-[1px] transition-colors duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.95),0_0_2px_#000] ${
              hasFill ? activeBorderClass : 'border-white/25'
            }`}
          >
            <div
              className={`absolute inset-y-[1px] ${
                reverse ? 'right-[1px]' : 'left-[1px]'
              } bg-white/30 transition-all duration-500 ease-out`}
              style={{ width: `${segGhostPct}%` }}
            />
            <div
              className={`relative z-10 h-full transition-all duration-200 ease-out ${
                reverse ? 'ml-auto' : 'mr-auto'
              } ${fillClass}`}
              style={{ width: `${segFillPct}%` }}
            />
          </div>
        );
      })}
    </div>
  );
};

const ImpactBurstVfx: React.FC<{
  isEnemyTarget: boolean;
  slashColor: string;
  slashGlow: string;
  scaleClass?: string;
}> = ({ isEnemyTarget, slashColor, slashGlow, scaleClass = 'scale-100' }) => {
  const glowColor = isEnemyTarget ? slashGlow : 'rgba(244,63,94,0.75)';
  const beamGradient = isEnemyTarget
    ? slashColor
    : 'from-rose-200 via-rose-500 to-transparent';

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-25">
      <div
        className={`relative w-24 h-24 flex items-center justify-center animate-impact-burst ${scaleClass}`}
      >
        <div
          className={`absolute w-16 h-16 rounded-full border ${
            isEnemyTarget ? 'border-white/70' : 'border-rose-400/75'
          }`}
          style={{
            boxShadow: `0 0 18px ${glowColor}`,
          }}
        />
        <div
          className={`absolute w-24 h-1 -rotate-35 rounded-full bg-gradient-to-r ${beamGradient}`}
        />
      </div>
    </div>
  );
};

function renderSkillIcon(role: CombatEquipableSkill['role']) {
  const cls = 'w-4 h-4 shrink-0';
  if (role === 'damage') return <Flame className={cls} />;
  if (role === 'control') return <ShieldAlert className={cls} />;
  if (role === 'heal') return <HeartPulse className={cls} />;
  return <Zap className={cls} />;
}

export const CombatView: React.FC<CombatViewProps> = ({
  stageConfig,
  currentLocation,
  playerName,
  characterLevel,
  currentFaction,
  enemySquad,
  selectedTargetId,
  onSelectTarget,
  currentWave,
  totalWaves,
  turnPhase,
  turnQueue,
  turnCount,
  isAutoCombat,
  onToggleAutoCombat,
  combatSpeed = 1,
  onChangeCombatSpeed,
  playerHp,
  maxPlayerHp,
  playerDefense,
  maxPlayerDefense,
  playerCombatStatus,
  equippedSkills,
  activeActorId,
  hitTargetId,
  floatingEvents,
  isCombatActive,
  onToggleCombat,
  onBasicAttack,
  onUseSkill,
  onReturnToCitadel,
  sessionLoot,
  onClearSessionLoot,
  isTutorialActive = false,
}) => {
  // Arranca compacto (cerrado) debajo de la Secuencia de Turnos con indicador de notificación cuando hay botín
  const [isLootPanelCollapsed, setIsLootPanelCollapsed] = useState<boolean>(true);

  const activeStage = {
    arenaUrl: stageConfig?.arenaUrl || DEFAULT_STAGE.arenaUrl,
  };

  const theme = FACTION_DOCK_THEMES[currentFaction.id] || FACTION_DOCK_THEMES.valari;
  const playerSpriteSrc = HERO_CB_SPRITES[currentFaction.id] || HERO_CB_SPRITES.valari;
  const playerDefConfig =
    DEFENSE_BAR_CONFIG[currentFaction.baseDefenseType] || DEFENSE_BAR_CONFIG.Armor;

  const activeTargetUnit: CombatSquadUnit | undefined =
    enemySquad.find((u) => u.instanceId === selectedTargetId) ||
    enemySquad.find((u) => u.hp > 0) ||
    enemySquad[0];

  const targetDefConfig = activeTargetUnit
    ? DEFENSE_BAR_CONFIG[activeTargetUnit.defenseType]
    : DEFENSE_BAR_CONFIG.Shields;

  const isPlayerTurnReady =
    isCombatActive &&
    turnPhase === 'PLAYER_TURN' &&
    !isAutoCombat &&
    activeActorId === null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'Escape') {
        onReturnToCitadel();
        return;
      }
      if (e.key.toLowerCase() === 'a') {
        onToggleAutoCombat();
        return;
      }
      if (!isPlayerTurnReady) return;

      if (e.key === ' ' || e.key.toLowerCase() === 'b') {
        e.preventDefault();
        onBasicAttack();
      } else if (e.key === '1') {
        onUseSkill(1);
      } else if (e.key === '2') {
        onUseSkill(2);
      } else if (e.key === '3') {
        onUseSkill(3);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlayerTurnReady,
    onBasicAttack,
    onReturnToCitadel,
    onToggleAutoCombat,
    onUseSkill,
  ]);

  const playerFloatingEvents = floatingEvents.filter((ev) => ev.targetId === 'player');
  const isPlayerHit = hitTargetId === 'player';
  const isPlayerSupportCast = activeActorId === 'player' && hitTargetId === null;
  const isActiveTargetHit = Boolean(
    activeTargetUnit && hitTargetId === activeTargetUnit.instanceId
  );

  // Unidad enemiga que está ejecutando su ataque actualmente (para graduar el impacto sobre el Héroe)
  const actingEnemyUnit =
    activeActorId && activeActorId !== 'player'
      ? enemySquad.find((u) => u.instanceId === activeActorId)
      : undefined;
  const actingEnemyMotion = getEnemyAttackMotionProfile(actingEnemyUnit);

  const hasLootInfo = Boolean(
    sessionLoot && (sessionLoot.credits > 0 || sessionLoot.items.length > 0)
  );
  const totalLootItemsCount =
    sessionLoot?.items.reduce((acc, item) => acc + item.amount, 0) || 0;

  const cleanLocationLabel = (currentLocation || 'SECTOR PRIMARIO · VAELOR PRIME').replace(
    /\s*\/\/\s*/g,
    ' · '
  );

  return (
    <section
      aria-label="Frente de Batalla Táctico"
      className="relative isolate z-10 w-full flex flex-col items-center select-none"
    >
      {/* CONTENEDOR COMPARTIDO PARA QUE EL HEADER Y LA ARENA MIDAN EXACTAMENTE EL MISMO ANCHO */}
      <div
        style={{
          maxWidth: 'min(1560px, calc((100vh - 185px) * 1672 / 935))',
        }}
        className="w-full mx-auto flex flex-col gap-2.5"
      >
        {/* 1. BARRA SUPERIOR DE LA ARENA (MISMO ANCHO EXACTO QUE LA ARENA) */}
        <header className="w-full bg-[#0b1019]/90 backdrop-blur-xl border border-white/12 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-xl shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-bold tracking-wider uppercase text-slate-100 truncate">
              {cleanLocationLabel}
            </span>
            <span className="text-slate-600">·</span>
            <span
              className={`font-mono text-xs font-bold uppercase tracking-wider ${theme.accentText}`}
            >
              OLEADA {currentWave} / {totalWaves}
            </span>
            <span className="hidden md:inline text-slate-600">·</span>
            <span className="hidden md:inline font-mono text-xs text-slate-400 tabular-nums">
              TURNO #{turnCount}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TutorialBeacon
              stepNumber={3}
              label="VELOCIDAD Y AUTO IA"
              isActive={isTutorialActive}
              factionId={currentFaction.id}
            />

            {/* Selector de velocidad de combate x1 / x2 / x3 */}
            {onChangeCombatSpeed && (
              <div className="flex items-center rounded-lg bg-slate-950/90 border border-white/12 p-0.5 font-mono text-xs">
                <FastForward className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1 shrink-0" />
                {([1, 2, 3] as CombatSpeed[]).map((spd) => {
                  const isSelected = combatSpeed === spd;
                  return (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => onChangeCombatSpeed(spd)}
                      title={`Velocidad de combate x${spd}`}
                      className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                        isSelected
                          ? `${theme.iconBox} shadow-sm`
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      x{spd}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={onToggleAutoCombat}
              className={`px-3 py-1 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isAutoCombat
                  ? 'bg-amber-950/55 border-amber-400/55 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900/75 border-white/12 text-slate-300 hover:text-white hover:border-white/25'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AUTO IA: {isAutoCombat ? 'ACTIVO' : 'MANUAL'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleCombat}
              className={`px-3 py-1 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isCombatActive
                  ? 'bg-slate-900/80 border-white/15 text-slate-200 hover:bg-slate-800/80'
                  : 'bg-emerald-950/55 border-emerald-500/45 text-emerald-300 hover:bg-emerald-900/45'
              }`}
            >
              {isCombatActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isCombatActive ? 'PAUSAR' : 'REANUDAR'}</span>
            </button>
          </div>
        </header>

        {/* 2. LIENZO DE LA ARENA */}
        <div className="relative isolate w-full aspect-[1672/935] bg-[#070a10] border border-white/12 rounded-2xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
            <img
              src={activeStage.arenaUrl}
              alt="Escenario Táctico de la Arena"
              className="w-full h-full object-fill select-none pointer-events-none block"
              draggable={false}
            />
          </div>

          {/* CAPA 20: COMBATIENTES EN LA PLATAFORMA (TAMAÑO REAL DE CADA SPRITE) */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* HÉROE (JUGADOR): NOMBRE DEL COMANDANTE Y BARRAS INCLINADAS DE 5 SEGMENTOS SOBRE LA CABEZA */}
            <div className="absolute bottom-[18.5%] left-[24%] -translate-x-1/2 flex items-end justify-center">
              {/* ETIQUETA Y BARRAS DE VIDA/DEFENSA SOBRE LA CABEZA DEL COMANDANTE */}
              <div
                style={{ bottom: 'calc(100% + 14px)' }}
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-30 whitespace-nowrap drop-shadow-[0_3px_8px_rgba(0,0,0,0.95)]"
              >
                <div className="flex items-center gap-1.5 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-black shadow-[0_0_6px_#10b981]" />
                  <span
                    className={`font-display text-xs font-extrabold uppercase tracking-wider text-white ${ARENA_TEXT_OUTLINE}`}
                  >
                    {playerName}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-extrabold ${theme.readyTag} ${ARENA_TEXT_OUTLINE}`}
                  >
                    NV.{characterLevel}
                  </span>
                </div>

                {/* Barras segmentadas inclinadas compactas sobre el Héroe */}
                <div className="w-28 opacity-95 flex flex-col items-center gap-1">
                  <div className="w-[90%]">
                    <SlantedSegmentedBar5
                      current={playerDefense}
                      max={maxPlayerDefense}
                      fillClass={playerDefConfig.fillClass}
                      activeBorderClass={playerDefConfig.activeBorderClass}
                      heightClass="h-1.5"
                    />
                  </div>
                  <div className="w-full">
                    <SlantedSegmentedBar5
                      current={playerHp}
                      max={maxPlayerHp}
                      fillClass="bg-rose-600 border-t border-rose-400/50"
                      activeBorderClass="border-rose-500/55"
                      heightClass="h-2"
                    />
                  </div>
                </div>
              </div>

              {isPlayerSupportCast && (
                <div className="pointer-events-none absolute inset-x-[-14%] bottom-0 h-full flex items-end justify-center z-25">
                  <div className="w-full h-[80%] rounded-t-full border-t border-emerald-400/60 bg-gradient-to-t from-emerald-500/20 to-transparent animate-aura-pulse" />
                </div>
              )}

              {isPlayerHit && (
                <ImpactBurstVfx
                  isEnemyTarget={false}
                  slashColor={theme.slashColor}
                  slashGlow={theme.slashGlow}
                  scaleClass={actingEnemyMotion.burstScaleClass}
                />
              )}

              {/* TEXTOS FLOTANTES DE DAÑO / CURACIÓN DEL HÉROE */}
              {playerFloatingEvents.length > 0 && (
                <div
                  style={{ bottom: 'calc(100% + 72px)' }}
                  className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-35 pointer-events-none"
                >
                  {playerFloatingEvents.map((ev) => (
                    <span
                      key={ev.id}
                      className={`animate-combat-float font-damage text-sm sm:text-[15px] font-black tracking-wider uppercase whitespace-nowrap [paint-order:stroke_fill] [-webkit-text-stroke:2.5px_#000000] ${
                        ev.tone === 'heal'
                          ? 'text-emerald-300 [text-shadow:0_1px_0_#000,0_-1px_0_#000,1px_0_0_#000,-1px_0_0_#000,0_2px_6px_#000,0_0_14px_rgba(16,185,129,0.85)]'
                          : ev.tone === 'buff'
                            ? 'text-amber-300 [text-shadow:0_1px_0_#000,0_-1px_0_#000,1px_0_0_#000,-1px_0_0_#000,0_2px_6px_#000,0_0_14px_rgba(245,158,11,0.85)]'
                            : ev.tone === 'defense'
                              ? 'text-cyan-200 [text-shadow:0_1px_0_#000,0_-1px_0_#000,1px_0_0_#000,-1px_0_0_#000,0_2px_6px_#000,0_0_14px_rgba(34,211,238,0.85)]'
                              : 'text-rose-300 [text-shadow:0_1px_0_#000,0_-1px_0_#000,1px_0_0_#000,-1px_0_0_#000,0_2px_6px_#000,0_0_14px_rgba(244,63,94,0.9)]'
                      }`}
                    >
                      {ev.text}
                    </span>
                  ))}
                </div>
              )}

              <div
                className={`w-auto h-auto flex items-end justify-center relative z-10 transition-transform ${
                  activeActorId === 'player' && hitTargetId !== null
                    ? 'duration-175 ease-out translate-x-14 -translate-y-1'
                    : isPlayerHit
                      ? actingEnemyMotion.playerHitReactionClass
                      : 'duration-200 ease-out'
                }`}
              >
                {/* Sombra suave en el suelo que acompaña el movimiento de los pies (sin círculo oscuro fijo) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-[82%] h-4 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.18)_48%,transparent_75%)] blur-[4px] z-0"
                />
                <img
                  src={playerSpriteSrc}
                  alt={playerName}
                  className="relative z-10 w-auto h-auto max-h-[420px] object-contain select-none pointer-events-none block"
                  draggable={false}
                />
              </div>
            </div>

            {/* ESCUADRÓN ENEMIGO (1 A 3 UNIDADES) RESPETANDO EL TAMAÑO REAL DE CADA SPRITE */}
            {enemySquad.map((unit) => {
              const isDead = unit.hp <= 0;
              const isTargeted = activeTargetUnit?.instanceId === unit.instanceId;
              const isActing = activeActorId === unit.instanceId;
              const isHit = hitTargetId === unit.instanceId;
              const coords = getEnemySlotCoordinates(unit.slotPosition, enemySquad.length);
              const unitSprite =
                unit.spriteUrl || HERO_CB_SPRITES[unit.faction] || HERO_CB_SPRITES.cygnus;
              const unitEvents = floatingEvents.filter(
                (ev) => ev.targetId === unit.instanceId
              );
              const hasActiveFloatingHit = unitEvents.length > 0;
              const unitDefCfg =
                DEFENSE_BAR_CONFIG[unit.defenseType] || DEFENSE_BAR_CONFIG.Armor;
              const unitMotion = getEnemyAttackMotionProfile(unit);

              return (
                <div
                  key={unit.instanceId}
                  onClick={() => !isDead && onSelectTarget(unit.instanceId)}
                  style={{
                    right: `${coords.rightPct}%`,
                    bottom: `${coords.bottomPct}%`,
                    zIndex: coords.zIndex,
                  }}
                  className={`absolute translate-x-1/2 flex flex-col items-center justify-end transition-opacity duration-200 ${
                    isDead
                      ? 'opacity-15 grayscale pointer-events-none'
                      : 'pointer-events-auto cursor-pointer group'
                  }`}
                >
                  {/* NOMBRE ENEMIGO + BARRAS SEGMENTADAS INCLINADAS ELEVADAS SOBRE LA CABEZA */}
                  {!isDead && (
                    <div
                      style={{ bottom: 'calc(100% + 14px)' }}
                      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-30 whitespace-nowrap transition-all duration-150 drop-shadow-[0_3px_8px_rgba(0,0,0,0.95)] ${
                        isTargeted
                          ? 'scale-100 opacity-100'
                          : 'scale-95 opacity-95 group-hover:opacity-100 group-hover:scale-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 px-1">
                        {isTargeted && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 ring-1 ring-black shadow-[0_0_6px_#f43f5e]" />
                        )}
                        <span
                          className={`font-display text-xs font-extrabold uppercase tracking-wider ${ARENA_TEXT_OUTLINE} ${
                            isTargeted ? 'text-white' : 'text-slate-100'
                          }`}
                        >
                          {unit.name}
                        </span>
                        <span
                          className={`font-mono text-[11px] font-extrabold text-rose-300 ${ARENA_TEXT_OUTLINE}`}
                        >
                          NV.{unit.level}
                        </span>

                        {unit.brokenTurns > 0 ? (
                          <span className="px-1 py-0.2 rounded bg-black/90 border border-amber-400/75 font-mono text-[9px] font-bold text-amber-300 shadow-[0_2px_4px_#000]">
                            RUPTURA
                          </span>
                        ) : unit.stunnedTurns > 0 ? (
                          <span className="px-1 py-0.2 rounded bg-black/90 border border-amber-400/75 font-mono text-[9px] font-bold text-amber-300 shadow-[0_2px_4px_#000]">
                            SUPRIMIDO
                          </span>
                        ) : unit.intent === 'heavy' ? (
                          <span className="px-1 py-0.2 rounded bg-amber-500 border border-black/80 text-black font-mono text-[9px] font-black flex items-center gap-0.5 shadow-[0_2px_6px_#000]">
                            <AlertTriangle className="w-2.5 h-2.5" />!
                          </span>
                        ) : null}
                      </div>

                      {/* Barras inclinadas de 5 segmentos siguiendo el diseño de las barras superiores */}
                      <div className="w-26 flex flex-col items-center gap-1">
                        <div className="w-[90%]">
                          <SlantedSegmentedBar5
                            current={unit.defense}
                            max={unit.maxDefense}
                            fillClass={unitDefCfg.fillClass}
                            activeBorderClass={unitDefCfg.activeBorderClass}
                            heightClass="h-1.5"
                            reverse
                          />
                        </div>
                        <div className="w-full">
                          <SlantedSegmentedBar5
                            current={unit.hp}
                            max={unit.maxHp}
                            fillClass="bg-rose-600 border-t border-rose-400/50"
                            activeBorderClass="border-rose-500/55"
                            heightClass="h-2"
                            reverse
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {isHit && (
                    <ImpactBurstVfx
                      isEnemyTarget
                      slashColor={theme.slashColor}
                      slashGlow={theme.slashGlow}
                    />
                  )}

                  {/* TEXTOS FLOTANTES DE DAÑO SOBRE EL ENEMIGO */}
                  {hasActiveFloatingHit && (
                    <div
                      style={{ bottom: 'calc(100% + 72px)' }}
                      className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-35 pointer-events-none"
                    >
                      {unitEvents.map((ev) => {
                        const isCritOrBreak =
                          ev.text.includes('CRÍTICO') ||
                          ev.text.includes('EJECUCIÓN') ||
                          ev.text.includes('RUPTURA');
                        return (
                          <span
                            key={ev.id}
                            className={`animate-combat-float font-damage font-black tracking-wider uppercase whitespace-nowrap [paint-order:stroke_fill] [-webkit-text-stroke:2.5px_#000000] ${
                              isCritOrBreak ? 'text-base sm:text-[17px]' : 'text-sm sm:text-[15px]'
                            } ${
                              ev.tone === 'control'
                                ? 'text-amber-300 [text-shadow:0_1px_0_#000,0_-1px_0_#000,1px_0_0_#000,-1px_0_0_#000,0_2px_6px_#000,0_0_16px_rgba(245,158,11,0.9)]'
                                : ev.tone === 'defense'
                                  ? 'text-cyan-200 [text-shadow:0_1px_0_#000,0_-1px_0_#000,1px_0_0_#000,-1px_0_0_#000,0_2px_6px_#000,0_0_14px_rgba(34,211,238,0.85)]'
                                  : 'text-rose-300 [text-shadow:0_1px_0_#000,0_-1px_0_#000,1px_0_0_#000,-1px_0_0_#000,0_2px_6px_#000,0_0_16px_rgba(244,63,94,0.95)]'
                            }`}
                          >
                            {ev.text}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Movimiento de ataque hacia adelante (sin agrandarse), graduado según clase Ligera / Media / Pesada / Élite */}
                  <div
                    className={`w-auto h-auto flex items-end justify-center relative z-10 transition-transform ${
                      isActing
                        ? `${unitMotion.durationClass} ${unitMotion.lungeTransformClass}`
                        : isHit
                          ? 'duration-150 ease-out translate-x-3.5 brightness-125'
                          : 'duration-200 ease-out'
                    }`}
                  >
                    {/* Sombra suave en el suelo que acompaña el movimiento de los pies (sin círculo oscuro fijo) */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-[82%] h-4 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.18)_48%,transparent_75%)] blur-[4px] z-0"
                    />
                    <img
                      src={unitSprite}
                      alt={unit.name}
                      className="relative z-10 w-auto h-auto max-h-[420px] object-contain select-none scale-x-[-1] pointer-events-none block"
                      draggable={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* =================================================================
              CAPA 25: HUD SUPERIOR
              - Barras inclinadas superiores con textos perfilados a 1px negro + sombra profunda.
              - Centro: Secuencia de Turnos con el mismo tratamiento visual y geométrico del Dock de Habilidades,
                seguido debajo por el Botín de Incursión compacto con icono de notificación.
             ================================================================= */}
          <div className="absolute top-0 inset-x-0 w-full pointer-events-none z-25">
            <div className="relative z-25 w-full px-6 pt-4 pb-5 flex items-start justify-between gap-3 bg-gradient-to-b from-[#04070e]/90 via-[#04070e]/45 to-transparent">
              {/* IZQUIERDA: HÉROE (BARRAS SUPERIORES + DEBUFFS/BUFFS) */}
              <div
                className={`w-[36%] max-w-[450px] flex flex-col gap-1.5 ${
                  isPlayerHit ? 'animate-hud-jolt' : ''
                }`}
              >
                <div className="flex items-baseline justify-between pl-2 pr-0.5 gap-2">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span
                      className={`text-sm sm:text-[15px] font-display font-extrabold tracking-wider uppercase text-white ${ARENA_TEXT_OUTLINE} whitespace-nowrap`}
                    >
                      {playerName}
                    </span>
                    <span
                      className={`font-mono text-xs font-extrabold ${theme.readyTag} ${ARENA_TEXT_OUTLINE} shrink-0`}
                    >
                      NV. {characterLevel}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 font-mono text-xs font-extrabold tabular-nums ${ARENA_TEXT_OUTLINE} shrink-0`}
                  >
                    <span className={playerDefConfig.textClass}>
                      {playerDefConfig.label} {playerDefense}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-white">SALUD {playerHp}</span>
                  </div>
                </div>

                <div className="w-[88%] ml-2">
                  <SlantedSegmentedBar5
                    current={playerDefense}
                    max={maxPlayerDefense}
                    fillClass={playerDefConfig.fillClass}
                    activeBorderClass={playerDefConfig.activeBorderClass}
                    heightClass="h-2.5"
                  />
                </div>

                <div className="w-full">
                  <SlantedSegmentedBar5
                    current={playerHp}
                    max={maxPlayerHp}
                    fillClass="bg-rose-600 border-t border-rose-400/45"
                    activeBorderClass="border-rose-500/45"
                    heightClass="h-3"
                  />
                </div>

                {/* BUFFS Y PENALIZACIONES DEL HÉROE (SIEMPRE VISIBLES ARRIBA PARA LECTURA RÁPIDA) */}
                {playerCombatStatus && (
                  <div className="flex flex-wrap items-center gap-1.5 pl-1 pt-0.5">
                    {playerCombatStatus.reactiveArmorActive && (
                      <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-300/55 font-mono text-[11px] font-bold text-slate-200 tracking-wider shadow">
                        PLACAS REACTIVAS 15%
                      </span>
                    )}
                    {playerCombatStatus.phaseResonanceActive && (
                      <span className="px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-400/55 font-mono text-[11px] font-bold text-cyan-200 tracking-wider shadow">
                        RESONANCIA +10% ATAQUE
                      </span>
                    )}
                    {playerCombatStatus.corrosiveStacks > 0 && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-400/55 font-mono text-[11px] font-bold text-emerald-300 tracking-wider shadow">
                        ÁCIDO x{playerCombatStatus.corrosiveStacks} (-
                        {playerCombatStatus.corrosiveStacks * 6}% BLINDAJE)
                      </span>
                    )}
                    {playerCombatStatus.shieldLockTurns > 0 && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/90 border border-amber-400/55 font-mono text-[11px] font-bold text-amber-300 tracking-wider shadow">
                        SOBRECARGA ESCUDO ({playerCombatStatus.shieldLockTurns}T)
                      </span>
                    )}
                    {playerCombatStatus.illuminatedTurns > 0 && (
                      <span className="px-2 py-0.5 rounded bg-violet-950/90 border border-violet-400/55 font-mono text-[11px] font-bold text-violet-300 tracking-wider shadow">
                        FIJADO -50% ESQUIVA ({playerCombatStatus.illuminatedTurns}T)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* CENTRO: SECUENCIA DE TURNOS (MISMO TRATAMIENTO QUE LA BARRA DE HABILIDADES) + BOTÍN DE INCURSIÓN DEBAJO */}
              <div className="relative flex flex-col items-center gap-1.5 pointer-events-auto pt-0.5 shrink-0">
                <span
                  className={`font-mono text-[10px] font-extrabold uppercase tracking-[0.22em] ${theme.readyTag} ${ARENA_TEXT_OUTLINE}`}
                >
                  SECUENCIA DE TURNOS
                </span>

                {/* Contenedor de la Lista de Turnos con marco inclinado idéntico al Dock de Habilidades */}
                <div className="relative flex items-center gap-2 px-3.5 py-1.5">
                  <div className="pointer-events-none absolute inset-0 -skew-x-[16deg] bg-[#060a12]/94 border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.92)]" />

                  {turnQueue.map((item, idx) => {
                    const isCurrentTurn = idx === 0;
                    const isTargetedEnemy =
                      !item.isPlayer && item.actorId === activeTargetUnit?.instanceId;

                    const slotCardFrameClass = item.isPlayer
                      ? isCurrentTurn
                        ? `${theme.cardBg} ${theme.portraitBorder}`
                        : 'bg-[#090d14]/95 border-emerald-500/45'
                      : isCurrentTurn
                        ? 'bg-[#090d14]/95 border-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.45)]'
                        : isTargetedEnemy
                          ? 'bg-[#090d14]/95 border-rose-400/80 hover:border-rose-300'
                          : 'bg-[#090d14]/90 border-white/20 hover:border-rose-400/60';

                    const topAccentBarClass = item.isPlayer
                      ? theme.topBarClass
                      : item.broken
                        ? 'bg-amber-400'
                        : 'bg-rose-500';

                    const bottomSegBarClass = item.isPlayer
                      ? theme.segmentFillClass
                      : item.broken
                        ? 'bg-amber-400/85'
                        : 'bg-rose-600/85';

                    return (
                      <React.Fragment key={item.actorId}>
                        <button
                          type="button"
                          onClick={() => !item.isPlayer && onSelectTarget(item.actorId)}
                          title={
                            item.isPlayer
                              ? `${item.name} (Velocidad ${item.speed})`
                              : `${item.name} (Velocidad ${item.speed}) · ${
                                  item.broken
                                    ? 'Guardia en Ruptura (+50% daño crítico)'
                                    : item.intent === 'heavy'
                                      ? 'Preparando Ataque Pesado (!)'
                                      : item.intent === 'fortify'
                                        ? 'Preparando Recarga de Defensa'
                                        : 'Ataque Estándar'
                                }`
                          }
                          className={`relative z-10 flex items-center justify-center p-1.5 transition-transform duration-200 shrink-0 group ${
                            isCurrentTurn
                              ? 'w-[54px] h-[54px]'
                              : 'w-[46px] h-[46px] opacity-90 hover:opacity-100'
                          } ${item.isPlayer ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}
                        >
                          {/* Capa geométrica inclinada (-skew-x-[16deg]) idéntica a las ranuras del Dock de Habilidades */}
                          <div
                            className={`pointer-events-none absolute inset-0 -skew-x-[16deg] border flex flex-col justify-between p-[1px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.85)] transition-all ${slotCardFrameClass}`}
                          >
                            <div className={`w-full h-[2.5px] shrink-0 ${topAccentBarClass}`} />
                            <div className="w-full grid grid-cols-5 gap-[2px] px-1 pb-[2px] shrink-0">
                              {[0, 1, 2, 3, 4].map((seg) => (
                                <div
                                  key={seg}
                                  className={`h-[3px] ${
                                    isCurrentTurn ? bottomSegBarClass : 'bg-white/20'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Retrato interior 100% nítido sin distorsión por skew */}
                          <div className="relative z-10 w-full h-full overflow-hidden border border-white/15 bg-[#070b12]">
                            <img
                              src={item.portraitUrl}
                              alt={item.name}
                              className={`w-full h-full object-cover object-[50%_10%] select-none pointer-events-none ${
                                item.isPlayer
                                  ? 'scale-[1.35]'
                                  : 'scale-x-[-1.42] scale-y-[1.42]'
                              } ${item.stunned || item.broken ? 'grayscale opacity-50' : ''}`}
                              draggable={false}
                            />
                          </div>

                          {/* Insignia de intención o turno en esquina superior derecha (ortogonal igual que [B], [1], [2], [3]) */}
                          {!item.isPlayer &&
                          !item.stunned &&
                          !item.broken &&
                          item.intent === 'heavy' ? (
                            <span className="absolute -top-1 -right-1 z-20 px-1 py-0.5 bg-amber-500 border border-black text-black font-mono text-[10px] font-black leading-none shadow-[0_2px_6px_#000]">
                              !
                            </span>
                          ) : !item.isPlayer &&
                            !item.stunned &&
                            !item.broken &&
                            item.intent === 'fortify' ? (
                            <span className="absolute -top-1 -right-1 z-20 p-0.5 bg-cyan-400 border border-black text-black flex items-center justify-center shadow-[0_2px_6px_#000]">
                              <Shield className="w-2.5 h-2.5" />
                            </span>
                          ) : (
                            <span
                              className={`absolute -top-1 -right-1 z-20 px-1 py-0.5 border text-[9px] font-mono font-bold leading-none shadow ${
                                item.isPlayer
                                  ? theme.keyBadge
                                  : 'bg-[#05080f] border-rose-500/60 text-rose-300'
                              }`}
                            >
                              {idx + 1}
                            </span>
                          )}
                        </button>

                        {idx === 0 && turnQueue.length > 1 && (
                          <div className="relative z-10 flex items-center gap-0.5 mx-0.5">
                            <div className="h-8 w-[1px] bg-white/15 -skew-x-[16deg]" />
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* BOTÍN DE INCURSIÓN DEBAJO DE LA LISTA DE TURNOS (ARRANCA COMPACTO CON ICONO DE NOTIFICACIÓN) */}
                <div className="relative z-30 flex flex-col items-center">
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      onClick={() => setIsLootPanelCollapsed(!isLootPanelCollapsed)}
                      title={
                        isLootPanelCollapsed
                          ? 'Mostrar detalle de Botín de Incursión'
                          : 'Ocultar detalle de Botín de Incursión'
                      }
                      className="relative flex items-center gap-2 px-3.5 py-1 cursor-pointer group active:scale-95 transition-transform"
                    >
                      {/* Fondo inclinado estilo Dock de Habilidades */}
                      <div
                        className={`pointer-events-none absolute inset-0 -skew-x-[16deg] bg-[#060a12]/92 border transition-all shadow-[0_6px_18px_rgba(0,0,0,0.85)] ${
                          hasLootInfo
                            ? `${theme.visorBorderClass} group-hover:border-white/50`
                            : 'border-white/15 group-hover:border-white/30'
                        }`}
                      />

                      {/* Icono de paquete + punto/insignia de notificación cuando hay recursos */}
                      <div className="relative z-10 flex items-center justify-center">
                        <Package
                          className={`w-3.5 h-3.5 shrink-0 ${
                            hasLootInfo ? theme.accentText : 'text-slate-400'
                          }`}
                        />
                        {hasLootInfo && (
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 ring-1 ring-black" />
                          </span>
                        )}
                      </div>

                      <span className="relative z-10 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-200 group-hover:text-white whitespace-nowrap">
                        Botín de Incursión
                      </span>

                      {/* Badge compacto de notificación cuando hay créditos o materiales */}
                      {hasLootInfo && (
                        <span className="relative z-10 flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-400/50 font-mono text-[10px] font-extrabold text-amber-300 tabular-nums">
                          <span>+{(sessionLoot?.credits || 0).toLocaleString('es-ES')} ₡</span>
                          {totalLootItemsCount > 0 && (
                            <span className={`${theme.readyTag}`}>· +{totalLootItemsCount}</span>
                          )}
                        </span>
                      )}

                      <div className="relative z-10 text-slate-400 group-hover:text-white transition-colors">
                        {isLootPanelCollapsed ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronUp className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </button>

                    {hasLootInfo && onClearSessionLoot && !isLootPanelCollapsed && (
                      <button
                        type="button"
                        onClick={onClearSessionLoot}
                        title="Limpiar contador de sesión"
                        className="ml-1.5 p-1 rounded bg-[#060a12]/90 border border-white/15 hover:border-white/35 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Desplegable flotante de Botín de Incursión (sólo se abre cuando el jugador lo solicita) */}
                  {!isLootPanelCollapsed && (
                    <div className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 w-64 rounded-xl bg-[#070b12]/95 backdrop-blur-md border border-white/20 shadow-[0_14px_34px_rgba(0,0,0,0.95)] p-2.5 flex flex-col gap-2 font-mono text-xs z-40">
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/55 border border-white/10">
                        <span className="text-[11px] text-slate-300 flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          Créditos extraídos
                        </span>
                        <span className="text-xs font-bold text-amber-300 tabular-nums">
                          +{(sessionLoot?.credits || 0).toLocaleString('es-ES')} ₡
                        </span>
                      </div>

                      {sessionLoot && sessionLoot.items.length > 0 ? (
                        <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-0.5">
                          {sessionLoot.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-black/55 border border-white/10"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                  {renderSciFiIcon(item.iconKey, `w-3.5 h-3.5 ${theme.accentText}`)}
                                </div>
                                <span
                                  className="text-[11px] text-slate-200 truncate"
                                  title={item.name}
                                >
                                  {item.name}
                                </span>
                              </div>
                              <span
                                className={`text-xs font-bold tabular-nums shrink-0 ${theme.accentText}`}
                              >
                                +{item.amount}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 text-center py-1 leading-snug">
                          Neutraliza la oleada actual para registrar recursos extraídos.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <TutorialBeacon
                  stepNumber={1}
                  label="VISOR Y COLA DE TURNOS"
                  isActive={isTutorialActive}
                  factionId={currentFaction.id}
                />
              </div>

              {/* DERECHA: OBJETIVO ACTIVO (BARRAS SUPERIORES + DEBUFFS) */}
              {activeTargetUnit && (
                <div
                  className={`w-[36%] max-w-[450px] flex flex-col items-end gap-1.5 ${
                    isActiveTargetHit ? 'animate-hud-jolt' : ''
                  }`}
                >
                  <div className="w-full flex items-baseline justify-between flex-row-reverse pr-2 pl-0.5 gap-2">
                    <div className="flex items-baseline gap-2 flex-row-reverse min-w-0">
                      <span
                        className={`text-sm sm:text-[15px] font-display font-extrabold tracking-wider uppercase text-white ${ARENA_TEXT_OUTLINE} whitespace-nowrap`}
                      >
                        {activeTargetUnit.name}
                      </span>
                      <span
                        className={`font-mono text-xs font-extrabold text-rose-300 ${ARENA_TEXT_OUTLINE} shrink-0`}
                      >
                        NV. {activeTargetUnit.level}
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 font-mono text-xs font-extrabold tabular-nums ${ARENA_TEXT_OUTLINE} shrink-0`}
                    >
                      <span className="text-white">SALUD {activeTargetUnit.hp}</span>
                      <span className="text-slate-300">·</span>
                      <span className={targetDefConfig.textClass}>
                        {targetDefConfig.label} {activeTargetUnit.defense}
                      </span>
                    </div>
                  </div>

                  <div className="w-[88%] mr-2">
                    <SlantedSegmentedBar5
                      current={activeTargetUnit.defense}
                      max={activeTargetUnit.maxDefense}
                      fillClass={targetDefConfig.fillClass}
                      activeBorderClass={targetDefConfig.activeBorderClass}
                      heightClass="h-2.5"
                      reverse
                    />
                  </div>

                  <div className="w-full">
                    <SlantedSegmentedBar5
                      current={activeTargetUnit.hp}
                      max={activeTargetUnit.maxHp}
                      fillClass="bg-rose-600 border-t border-rose-400/45"
                      activeBorderClass="border-rose-500/45"
                      heightClass="h-3"
                      reverse
                    />
                  </div>

                  {/* DEBUFFS Y ESTADOS DEL OBJETIVO ACTIVO (SIEMPRE VISIBLES ARRIBA) */}
                  {(activeTargetUnit.brokenTurns > 0 ||
                    activeTargetUnit.stunnedTurns > 0 ||
                    (activeTargetUnit.corrosiveStacks || 0) > 0 ||
                    (activeTargetUnit.shieldLockTurns || 0) > 0 ||
                    (activeTargetUnit.illuminatedTurns || 0) > 0) && (
                    <div className="flex flex-wrap items-center justify-end gap-1.5 pr-1 pt-0.5">
                      {activeTargetUnit.brokenTurns > 0 && (
                        <span className="px-2 py-0.5 rounded bg-amber-950/90 border border-amber-400/65 font-mono text-[11px] font-bold text-amber-300 tracking-wider shadow">
                          GUARDIA EN RUPTURA ({activeTargetUnit.brokenTurns}T)
                        </span>
                      )}
                      {activeTargetUnit.stunnedTurns > 0 && (
                        <span className="px-2 py-0.5 rounded bg-amber-950/90 border border-amber-400/65 font-mono text-[11px] font-bold text-amber-300 tracking-wider shadow">
                          SUPRIMIDO ({activeTargetUnit.stunnedTurns}T)
                        </span>
                      )}
                      {(activeTargetUnit.corrosiveStacks || 0) > 0 && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-400/55 font-mono text-[11px] font-bold text-emerald-300 tracking-wider shadow">
                          ÁCIDO x{activeTargetUnit.corrosiveStacks} (
                          {(activeTargetUnit.corrosiveStacks || 0) * 6}% PERFORACIÓN)
                        </span>
                      )}
                      {(activeTargetUnit.shieldLockTurns || 0) > 0 && (
                        <span className="px-2 py-0.5 rounded bg-amber-950/90 border border-amber-400/55 font-mono text-[11px] font-bold text-amber-300 tracking-wider shadow">
                          SOBRECARGA ESCUDO ({activeTargetUnit.shieldLockTurns}T)
                        </span>
                      )}
                      {(activeTargetUnit.illuminatedTurns || 0) > 0 && (
                        <span className="px-2 py-0.5 rounded bg-violet-950/90 border border-violet-400/55 font-mono text-[11px] font-bold text-violet-300 tracking-wider shadow">
                          FIJADO -50% ESQUIVA ({activeTargetUnit.illuminatedTurns}T)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* =================================================================
              CAPA 30: DOCK DE HABILIDADES CON TEXTO 100% NÍTIDO (CERO DESENFOQUE POR SKEW)
              - La inclinación (-skew-x-[16deg]) se aplica ÚNICAMENTE a las capas de fondo/borde
                mientras que los textos e iconos se renderizan sin transformaciones (0 skew)
                logrando nitidez subpíxel perfecta.
             ================================================================= */}
          <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 pointer-events-none z-30 w-full max-w-fit px-3 flex flex-col items-center gap-1.5">
            <TutorialBeacon
              stepNumber={2}
              label="DOCK DE HABILIDADES [B, 1-3]"
              isActive={isTutorialActive}
              factionId={currentFaction.id}
            />
            <div className="relative flex items-center gap-2 sm:gap-2.5 pointer-events-auto px-4 py-2">
              {/* Marco exterior inclinado (sólo fondo y borde, sin deformar los hijos) */}
              <div className="pointer-events-none absolute inset-0 -skew-x-[16deg] bg-[#060a12]/94 border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.92)]" />

              {/* GOLPE BÁSICO */}
              <div className="relative z-10 group">
                <div className="pointer-events-none opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-68 p-3.5 bg-[#070b12]/96 border border-white/20 shadow-[0_14px_34px_rgba(0,0,0,0.95)] z-40">
                  <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-white/10">
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-white">
                      Golpe Básico
                    </span>
                    <span className={`font-mono text-[11px] font-bold ${theme.accentText}`}>
                      SIN CD · [B]
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Disparo o embestida estándar con el armamento principal equipado (100% ATQ).
                  </p>
                  <p className="mt-1.5 text-[11px] font-mono text-slate-400">
                    Desgasta segmentos de defensa sin consumir enfriamientos.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!isPlayerTurnReady}
                  onClick={onBasicAttack}
                  className={`relative min-w-[166px] h-[56px] flex items-center justify-start px-3.5 pr-8 transition-transform ${
                    isPlayerTurnReady
                      ? 'cursor-pointer active:scale-95'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {/* Capa geométrica inclinada (-skew-x-[16deg]) aislada del texto */}
                  <div
                    className={`pointer-events-none absolute inset-0 -skew-x-[16deg] border flex flex-col justify-between p-[1px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.85)] transition-all ${
                      isPlayerTurnReady
                        ? theme.cardBg
                        : 'bg-[#090d14]/80 border-white/12'
                    }`}
                  >
                    <div
                      className={`w-full h-[2.5px] shrink-0 ${
                        isPlayerTurnReady ? theme.topBarClass : 'bg-white/20'
                      }`}
                    />
                    <div className="w-full grid grid-cols-5 gap-[2px] px-1 pb-[2px] shrink-0">
                      {[0, 1, 2, 3, 4].map((seg) => (
                        <div
                          key={seg}
                          className={`h-[3px] ${
                            isPlayerTurnReady ? theme.segmentFillClass : 'bg-white/15'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Contenido del botón 100% ortogonal (nitidez subpíxel nativa) */}
                  <div className="relative z-10 flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 border flex items-center justify-center shrink-0 ${theme.iconBox}`}
                    >
                      <Sword className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-start min-w-0 gap-0.5">
                      <span className="text-xs sm:text-[13px] font-display font-bold tracking-wider text-white uppercase whitespace-nowrap">
                        Golpe Básico
                      </span>
                      <span className="text-[11px] font-mono text-slate-300 font-bold whitespace-nowrap">
                        100% ATAQUE
                      </span>
                    </div>
                  </div>

                  <span
                    className={`absolute top-1.5 right-2.5 z-10 px-1.5 py-0.5 border text-[10px] font-mono font-bold leading-none ${theme.keyBadge}`}
                  >
                    B
                  </span>
                </button>
              </div>

              <div className="relative z-10 h-10 w-[1px] bg-white/15 -skew-x-[16deg] mx-0.5" />

              {/* 3 RANURAS DE HABILIDADES TÁCTICAS ([1] DAÑO, [2] CONTROL, [3] RESTAURAR) */}
              {equippedSkills.map((skill) => {
                const isOnCooldown = skill.currentCooldown > 0;
                const canTrigger = isPlayerTurnReady && !isOnCooldown;
                const readyRatio =
                  skill.cooldownTurns > 0
                    ? Math.max(
                        0,
                        Math.min(
                          1,
                          (skill.cooldownTurns - skill.currentCooldown) / skill.cooldownTurns
                        )
                      )
                    : 1;
                const filledSegments = isOnCooldown ? Math.floor(readyRatio * 5) : 5;

                return (
                  <div key={skill.id} className="relative z-10 group">
                    <div className="pointer-events-none opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-72 p-3.5 bg-[#070b12]/96 border border-white/20 shadow-[0_14px_34px_rgba(0,0,0,0.95)] z-40">
                      <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-white/10">
                        <span className="font-display text-xs font-bold uppercase tracking-wider text-white">
                          {skill.name}
                        </span>
                        <span className={`font-mono text-[11px] font-bold ${theme.accentText}`}>
                          {skill.roleLabel} · CD {skill.cooldownTurns}T
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {skill.description}
                      </p>
                      <p className="mt-1.5 pt-1.5 border-t border-white/10 text-[11px] font-mono text-slate-400 leading-snug">
                        {SKILL_SYNERGY_HINTS[skill.role]}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={!canTrigger}
                      onClick={() => onUseSkill(skill.slotIndex)}
                      className={`relative min-w-[176px] h-[56px] flex items-center justify-start px-3.5 pr-8 transition-transform ${
                        canTrigger
                          ? 'cursor-pointer active:scale-95'
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                    >
                      {/* Capa geométrica inclinada (-skew-x-[16deg]) aislada del texto */}
                      <div
                        className={`pointer-events-none absolute inset-0 -skew-x-[16deg] border flex flex-col justify-between p-[1px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.85)] transition-all ${
                          canTrigger
                            ? theme.cardBg
                            : 'bg-[#090d14]/80 border-white/12'
                        }`}
                      >
                        <div
                          className={`w-full h-[2.5px] shrink-0 ${
                            canTrigger
                              ? theme.topBarClass
                              : isOnCooldown
                                ? 'bg-amber-500/60'
                                : 'bg-white/20'
                          }`}
                        />
                        <div className="w-full grid grid-cols-5 gap-[2px] px-1 pb-[2px] shrink-0">
                          {[0, 1, 2, 3, 4].map((seg) => (
                            <div
                              key={seg}
                              className={`h-[3px] transition-colors duration-200 ${
                                seg < filledSegments
                                  ? isOnCooldown
                                    ? 'bg-amber-400/80'
                                    : theme.segmentFillClass
                                  : 'bg-white/12'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Contenido del botón 100% ortogonal (nitidez subpíxel nativa) */}
                      <div className="relative z-10 flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 border flex items-center justify-center shrink-0 ${
                            isOnCooldown
                              ? 'bg-slate-900/80 border-white/15 text-slate-400'
                              : theme.iconBox
                          }`}
                        >
                          {renderSkillIcon(skill.role)}
                        </div>

                        <div className="flex flex-col items-start min-w-0 gap-0.5">
                          <span className="text-xs sm:text-[13px] font-display font-bold tracking-wider text-white uppercase whitespace-nowrap">
                            {skill.name}
                          </span>
                          <span
                            className={`text-[11px] font-mono font-bold whitespace-nowrap tabular-nums ${
                              isOnCooldown ? 'text-amber-300' : theme.readyTag
                            }`}
                          >
                            {isOnCooldown
                              ? `RECARGA: ${skill.currentCooldown}T`
                              : skill.roleLabel}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`absolute top-1.5 right-2.5 z-10 px-1.5 py-0.5 border text-[10px] font-mono font-bold leading-none ${theme.keyBadge}`}
                      >
                        {skill.slotIndex}
                      </span>
                    </button>
                  </div>
                );
              })}

              <div className="relative z-10 h-10 w-[1px] bg-white/15 -skew-x-[16deg] mx-0.5" />

              {/* BOTÓN SALIR */}
              <button
                type="button"
                onClick={onReturnToCitadel}
                title="Evacuar arena táctica y regresar al Mando Central"
                className="relative z-10 min-w-[128px] h-[56px] flex items-center justify-start px-3.5 pr-9 group cursor-pointer active:scale-95 transition-transform"
              >
                <div className="pointer-events-none absolute inset-0 -skew-x-[16deg] bg-[#090d14]/95 group-hover:bg-rose-950/60 border border-rose-500/45 group-hover:border-rose-400/85 flex flex-col justify-between p-[1px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.85)] transition-all">
                  <div className="w-full h-[2.5px] bg-rose-500 shrink-0" />
                  <div className="w-full grid grid-cols-5 gap-[2px] px-1 pb-[2px] shrink-0">
                    {[0, 1, 2, 3, 4].map((seg) => (
                      <div key={seg} className="h-[3px] bg-rose-600/80" />
                    ))}
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-2.5">
                  <LogOut className="w-4 h-4 text-rose-400 group-hover:-translate-x-0.5 transition-transform shrink-0" />
                  <div className="flex flex-col items-start min-w-0 gap-0.5">
                    <span className="text-xs sm:text-[13px] font-display font-bold tracking-widest text-rose-100 uppercase whitespace-nowrap">
                      SALIR
                    </span>
                    <span className="text-[10px] font-mono text-rose-400 font-bold whitespace-nowrap">
                      MANDO
                    </span>
                  </div>
                </div>
                <span className="absolute top-1.5 right-2.5 z-10 px-1.5 py-0.5 bg-[#05080f] border border-rose-500/50 text-[10px] font-mono font-bold text-rose-300 leading-none">
                  ESC
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};