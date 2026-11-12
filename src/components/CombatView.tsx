// src/components/CombatView.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  onRestartIncursion?: () => void;
  onAdvanceNextPlanet?: () => void;
  nextPlanetName?: string | null;
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
    hudLineLeftClass: string;
    hudLineRightClass: string;
    hudNodeDotClass: string;
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
    hudLineLeftClass:
      'bg-gradient-to-l from-amber-400/85 via-amber-500/35 to-transparent shadow-[0_0_8px_rgba(245,158,11,0.35)]',
    hudLineRightClass:
      'bg-gradient-to-r from-amber-400/85 via-amber-500/35 to-transparent shadow-[0_0_8px_rgba(245,158,11,0.35)]',
    hudNodeDotClass: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
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
    hudLineLeftClass:
      'bg-gradient-to-l from-emerald-400/85 via-emerald-500/35 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.35)]',
    hudLineRightClass:
      'bg-gradient-to-r from-emerald-400/85 via-emerald-500/35 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.35)]',
    hudNodeDotClass: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
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
    hudLineLeftClass:
      'bg-gradient-to-l from-sky-400/85 via-sky-500/35 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.35)]',
    hudLineRightClass:
      'bg-gradient-to-r from-sky-400/85 via-sky-500/35 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.35)]',
    hudNodeDotClass: 'bg-sky-400 shadow-[0_0_8px_#38bdf8]',
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

type HeroActionKind = 'basic' | 'skill_1' | 'skill_2' | 'skill_3';
type ValariShotKind = HeroActionKind;

interface ValariShotSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  gravity: number;
}

interface ValariBasicShotTrigger {
  id: number;
  kind: ValariShotKind;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  heroLeft: number;
  heroTop: number;
  heroCenterX: number;
  heroTopY: number;
  heroBottomY: number;
  heroWidth: number;
  heroHeight: number;
  speedMultiplier: number;
  heroImg: HTMLImageElement | null;
}

interface SkithidActionTrigger {
  id: number;
  kind: HeroActionKind;
  heroLeft: number;
  heroTop: number;
  heroWidth: number;
  heroHeight: number;
  targetCenterX: number;
  targetCenterY: number;
  targetWidth: number;
  targetHeight: number;
  speedMultiplier: number;
  heroImg: HTMLImageElement | null;
}

interface CygnusActionTrigger {
  id: number;
  kind: HeroActionKind;
  heroLeft: number;
  heroTop: number;
  heroWidth: number;
  heroHeight: number;
  targetCenterX: number;
  targetCenterY: number;
  targetWidth: number;
  targetHeight: number;
  speedMultiplier: number;
  heroImg: HTMLImageElement | null;
  targetImg: HTMLImageElement | null;
}

/**
 * Coordenadas normalizadas medidas directamente sobre el buffer RGBA de `/assets/unidades/hero-cb-valari.png` (270x300 px):
 * - Línea recta de carga en el guardamanos del rifle: X = 155..177 (0.5741..0.6556), Y = 53..57 (centro exacto Y = 55/300 = 0.1833).
 * - Boca del freno de boca del rifle: X = 269/270 (0.9963), Y = 56.5/300 (0.1883).
 */
const VALARI_RIFLE_MUZZLE_X_RATIO = 0.9963;
const VALARI_RIFLE_MUZZLE_Y_RATIO = 0.1883;
const VALARI_RIFLE_RAIL_START_X_RATIO = 0.5741;
const VALARI_RIFLE_RAIL_END_X_RATIO = 0.6556;
const VALARI_RIFLE_RAIL_Y_RATIO = 0.1833;

/**
 * Coordenadas normalizadas medidas directamente sobre `/assets/unidades/hero-cb-cygnus.png` (248x300 px):
 * - Línea del cañón en el antebrazo extendido: X = 175..206 (0.7056..0.8306, centro X = 0.7685), Y = 64..69 (centro Y = 0.2217).
 * - Centro del haz de carga del antebrazo (emisor doble convergente de Haz Fotónico, separados verticalmente): X = 0.7685, Y = 0.2217 ± 0.028.
 * - Punta de la mano extendida (salida del haz lineal básico): X = 244/248 (0.9839), Y = 66.5/300 (0.2217).
 */
const CYGNUS_HAND_TIP_X_RATIO = 0.9839;
const CYGNUS_FOREARM_LINE_Y_RATIO = 0.2217;
const CYGNUS_GAUNTLET_EMITTER_X_RATIO = 0.7685;
const CYGNUS_GAUNTLET_SPLIT_Y_RATIO = 0.028;

/**
 * Máscaras de píxeles exactas extraídas directamente del sprite `hero-cb-skithid.png` (209x300 px):
 * Aísla únicamente los píxeles verdes bioluminiscentes de la Hoja Frontal y de la Hoja Lateral
 * (excluyendo las alas dorsales) para generar un glow orgánico y progresivo 100% alineado al arte del arma.
 */
let cachedSkithidBladeMasks: {
  front: HTMLCanvasElement;
  side: HTMLCanvasElement;
  natW: number;
  natH: number;
} | null = null;

function getSkithidBladeMasks(img: HTMLImageElement | null) {
  if (cachedSkithidBladeMasks) return cachedSkithidBladeMasks;
  if (!img || !img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
    return null;
  }

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = w;
  srcCanvas.height = h;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) return null;

  srcCtx.drawImage(img, 0, 0);
  let srcData: ImageData;
  try {
    srcData = srcCtx.getImageData(0, 0, w, h);
  } catch {
    return null;
  }

  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = w;
  frontCanvas.height = h;
  const frontCtx = frontCanvas.getContext('2d');

  const sideCanvas = document.createElement('canvas');
  sideCanvas.width = w;
  sideCanvas.height = h;
  const sideCtx = sideCanvas.getContext('2d');

  if (!frontCtx || !sideCtx) return null;

  const frontImgData = frontCtx.createImageData(w, h);
  const sideImgData = sideCtx.createImageData(w, h);
  const srcPx = srcData.data;
  const frontPx = frontImgData.data;
  const sidePx = sideImgData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = srcPx[idx];
      const g = srcPx[idx + 1];
      const a = srcPx[idx + 3];

      if (a <= 105 || g <= r + 22 || g <= 105) continue;

      // Intensidad proporcional a la luminancia verde del filo original
      const greenStrength = Math.min(1, (g - r) / 115);
      const outA = Math.min(255, Math.round(a * (0.45 + 0.55 * greenStrength)));

      // 1. Hoja Frontal Cruzada (aislada de las alas dorsales)
      const inFrontBlade =
        x >= 30 &&
        x <= 90 &&
        y >= 180 &&
        y <= 215 &&
        !(x < 58 && y < 204) &&
        !(x > 78 && y > 200) &&
        !(x > 64 && y > 208);

      if (inFrontBlade) {
        frontPx[idx] = 215;
        frontPx[idx + 1] = 255;
        frontPx[idx + 2] = 140;
        frontPx[idx + 3] = outA;
      }

      // 2. Hoja Lateral Derecha
      const inSideBlade = x >= 165 && x <= 200 && y >= 198 && y <= 268;
      if (inSideBlade) {
        sidePx[idx] = 215;
        sidePx[idx + 1] = 255;
        sidePx[idx + 2] = 140;
        sidePx[idx + 3] = outA;
      }
    }
  }

  frontCtx.putImageData(frontImgData, 0, 0);
  sideCtx.putImageData(sideImgData, 0, 0);

  cachedSkithidBladeMasks = {
    front: frontCanvas,
    side: sideCanvas,
    natW: w,
    natH: h,
  };
  return cachedSkithidBladeMasks;
}

/**
 * Máscara exacta de los píxeles de la ranura del riel acelerador electromagnético en el rifle de `hero-cb-valari.png` (270x300 px):
 * Aísla únicamente el conducto incandescente horizontal sobre el guardamanos del cañón de riel (x: 145..188, y: 51..64)
 * para animar la inducción magnética antes de disparar el proyectil de tungsteno.
 */
let cachedValariRailSlotMask: {
  canvas: HTMLCanvasElement;
  natW: number;
  natH: number;
} | null = null;

function getValariRifleRailMask(img: HTMLImageElement | null) {
  if (cachedValariRailSlotMask) return cachedValariRailSlotMask;
  if (!img || !img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
    return null;
  }

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = w;
  srcCanvas.height = h;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) return null;

  srcCtx.drawImage(img, 0, 0);
  let srcData: ImageData;
  try {
    srcData = srcCtx.getImageData(0, 0, w, h);
  } catch {
    return null;
  }

  const railCanvas = document.createElement('canvas');
  railCanvas.width = w;
  railCanvas.height = h;
  const railCtx = railCanvas.getContext('2d');
  if (!railCtx) return null;

  const outData = railCtx.createImageData(w, h);
  const srcPx = srcData.data;
  const outPx = outData.data;

  for (let y = 52; y <= 58; y++) {
    for (let x = 154; x <= 178; x++) {
      if (y < 0 || y >= h || x < 0 || x >= w) continue;
      const idx = (y * w + x) * 4;
      const r = srcPx[idx];
      const g = srcPx[idx + 1];
      const b = srcPx[idx + 2];
      const a = srcPx[idx + 3];

      if (a <= 150 || r <= 200 || g <= 70 || b >= 95) continue;

      const heatStrength = Math.min(1, (r - 170) / 85);
      const outA = Math.min(255, Math.round(a * (0.6 + 0.4 * heatStrength)));

      outPx[idx] = 255;
      outPx[idx + 1] = 242;
      outPx[idx + 2] = 175;
      outPx[idx + 3] = outA;
    }
  }

  railCtx.putImageData(outData, 0, 0);
  cachedValariRailSlotMask = {
    canvas: railCanvas,
    natW: w,
    natH: h,
  };
  return cachedValariRailSlotMask;
}

const ValariBasicShotVfxCanvas: React.FC<{
  shot: ValariBasicShotTrigger | null;
}> = ({ shot }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!shot) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : 1672;
    const height = parent ? parent.clientHeight : 935;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const {
      kind,
      startX,
      startY,
      endX,
      heroLeft,
      heroTop,
      heroWidth,
      heroHeight,
      speedMultiplier = 1,
      heroImg,
    } = shot;

    const speedScale = 1 / Math.pow(Math.max(1, speedMultiplier), 0.65);

    // Trayectoria 100% RECTA HORIZONTAL desde el freno de boca del cañón de riel Valari
    const endY = startY;
    const dx = endX - startX;
    const dist = Math.max(1, Math.abs(dx));

    // =========================================================================
    // HABILIDAD [3]: SELLAR PLACAS
    // Efecto recortado estrictamente a la silueta del héroe (sin auras externas),
    // recorriendo de arriba hacia el suelo con un patrón de placas balísticas
    // imbricadas en Blanco Incandescente y Ámbar de Blindaje.
    // =========================================================================
    if (kind === 'skill_3') {
      const TOTAL_ARMOR_MS = Math.round(780 * speedScale);
      const offW = Math.max(1, Math.round(heroWidth * dpr));
      const offH = Math.max(1, Math.round(heroHeight * dpr));
      const offCanvas = document.createElement('canvas');
      offCanvas.width = offW;
      offCanvas.height = offH;
      const offCtx = offCanvas.getContext('2d');

      // Precalcular malla de placas balísticas imbricadas (ladrillos biselados en chevron)
      // con coordenada normalizada vertU en [0..1] desde la parte superior del casco (0) hasta las botas en el suelo (1)
      const plateW = 15;
      const plateH = 8.5;
      const armorPlates: {
        cx: number;
        cy: number;
        vertU: number;
        rowIdx: number;
      }[] = [];

      for (let row = 0, y = 0; y <= heroHeight + plateH; row++, y += plateH) {
        const xOffset = row % 2 === 0 ? 0 : plateW * 0.5;
        for (let x = -plateW * 0.5 + xOffset; x <= heroWidth + plateW; x += plateW) {
          const ny = Math.max(0, Math.min(1, y / Math.max(1, heroHeight)));
          armorPlates.push({
            cx: x,
            cy: y,
            vertU: ny,
            rowIdx: row,
          });
        }
      }

      // Dibuja una placa de blindaje pesado con esquinas biseladas y muesca en chevron
      const traceBallisticPlate = (
        targetCtx: CanvasRenderingContext2D,
        cx: number,
        cy: number,
        w: number,
        h: number
      ) => {
        const hw = w * 0.46;
        const hh = h * 0.44;
        const bev = 2.1;
        const chev = 1.6;
        targetCtx.beginPath();
        targetCtx.moveTo(cx - hw + bev, cy - hh);
        targetCtx.lineTo(cx, cy - hh + chev);
        targetCtx.lineTo(cx + hw - bev, cy - hh);
        targetCtx.lineTo(cx + hw, cy - hh + bev);
        targetCtx.lineTo(cx + hw, cy + hh - bev);
        targetCtx.lineTo(cx + hw - bev, cy + hh);
        targetCtx.lineTo(cx, cy + hh + chev);
        targetCtx.lineTo(cx - hw + bev, cy + hh);
        targetCtx.lineTo(cx - hw, cy + hh - bev);
        targetCtx.lineTo(cx - hw, cy - hh + bev);
        targetCtx.closePath();
      };

      let rafId = 0;
      const t0 = performance.now();

      const renderArmorSealFrame = (now: number) => {
        const elapsed = Math.max(0, now - t0);
        const progress = Math.max(
          0,
          Math.min(1, elapsed / Math.max(1, TOTAL_ARMOR_MS))
        );
        // El frente de sellado baja desde arriba (u = -0.08) hasta el suelo (u = 1.18)
        const waveFrontU = -0.08 + progress * 1.26;
        const envFade =
          progress < 0.12
            ? progress / 0.12
            : progress > 0.82
              ? Math.max(0, 1 - (progress - 0.82) / 0.18)
              : 1;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        if (
          offCtx &&
          heroImg &&
          heroImg.complete &&
          heroImg.naturalWidth > 0
        ) {
          offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
          offCtx.clearRect(0, 0, heroWidth, heroHeight);
          offCtx.globalCompositeOperation = 'source-over';

          // 1. Baño interno vertical Blanco-Ámbar que acompaña el sellado desde el casco hasta el suelo
          const waveBandWidth = 0.24;
          const vertGrad = offCtx.createLinearGradient(0, 0, 0, heroHeight);
          const p0 = Math.max(0, Math.min(1, waveFrontU - waveBandWidth));
          const pMid = Math.max(0, Math.min(1, waveFrontU));
          const p1 = Math.max(0, Math.min(1, waveFrontU + waveBandWidth * 0.55));

          vertGrad.addColorStop(0, `rgba(217, 119, 6, ${0.1 * envFade})`);
          if (p0 > 0) {
            vertGrad.addColorStop(p0, `rgba(245, 158, 11, ${0.22 * envFade})`);
          }
          vertGrad.addColorStop(
            pMid,
            `rgba(255, 251, 235, ${0.78 * envFade})`
          );
          if (p1 < 1) {
            vertGrad.addColorStop(p1, 'rgba(245, 158, 11, 0)');
          }
          vertGrad.addColorStop(1, 'rgba(180, 83, 9, 0)');

          offCtx.fillStyle = vertGrad;
          offCtx.fillRect(0, 0, heroWidth, heroHeight);

          // 2. Malla de placas balísticas imbricadas activadas al paso del frente vertical
          armorPlates.forEach((plate) => {
            const distFromFront = waveFrontU - plate.vertU;
            // Todavía no llegó el frente desde arriba
            if (distFromFront < -0.08) return;

            let plateAlpha = 0;
            let isCrest = false;
            if (distFromFront >= -0.08 && distFromFront <= 0.09) {
              plateAlpha = (1 - Math.abs(distFromFront) / 0.09) * 0.98;
              isCrest = true;
            } else if (distFromFront > 0.09 && distFromFront < 0.5) {
              plateAlpha = (1 - (distFromFront - 0.09) / 0.41) * 0.62;
            }
            plateAlpha *= envFade;
            if (plateAlpha <= 0.03) return;

            traceBallisticPlate(offCtx, plate.cx, plate.cy, plateW, plateH);
            if (isCrest) {
              // Frente de sellado: Blanco incandescente con borde Ámbar brillante
              offCtx.fillStyle = `rgba(255, 251, 235, ${plateAlpha * 0.52})`;
              offCtx.fill();
              offCtx.strokeStyle = `rgba(255, 255, 255, ${plateAlpha})`;
              offCtx.lineWidth = 1.35;
              offCtx.stroke();
            } else {
              // Placa ya sellada: Ámbar de blindaje pesado con bisel superior blanco-dorado
              offCtx.fillStyle = `rgba(245, 158, 11, ${plateAlpha * 0.22})`;
              offCtx.fill();
              offCtx.strokeStyle = `rgba(251, 191, 36, ${plateAlpha})`;
              offCtx.lineWidth = 1.05;
              offCtx.stroke();
            }
          });

          // 3. Línea horizontal de soldadura/sellado estructural que desciende de arriba al suelo
          const crestY = heroHeight * waveFrontU;
          offCtx.save();
          const crestGrad = offCtx.createLinearGradient(0, crestY, heroWidth, crestY);
          crestGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
          crestGrad.addColorStop(0.2, `rgba(251, 191, 36, ${0.9 * envFade})`);
          crestGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.98 * envFade})`);
          crestGrad.addColorStop(0.8, `rgba(251, 191, 36, ${0.9 * envFade})`);
          crestGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          offCtx.strokeStyle = crestGrad;
          offCtx.lineWidth = 2.8;
          offCtx.beginPath();
          offCtx.moveTo(0, crestY);
          offCtx.lineTo(heroWidth, crestY);
          offCtx.stroke();
          offCtx.restore();

          // 4. Recortar estrictamente a la silueta real del sprite del héroe Valari (sin auras externas)
          offCtx.globalCompositeOperation = 'destination-in';
          offCtx.drawImage(heroImg, 0, 0, heroWidth, heroHeight);

          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.drawImage(offCanvas, heroLeft, heroTop, heroWidth, heroHeight);
          ctx.restore();
        }

        if (elapsed < TOTAL_ARMOR_MS) {
          rafId = requestAnimationFrame(renderArmorSealFrame);
        } else {
          ctx.clearRect(0, 0, width, height);
        }
      };

      rafId = requestAnimationFrame(renderArmorSealFrame);
      return () => cancelAnimationFrame(rafId);
    }

    // =========================================================================
    // MOTOR BALÍSTICO DE CAÑÓN DE RIEL DE TUNGSTENO HIPERDENSO ([B], [1], [2])
    // - Sin bolas de energía ni rayos láser ni espirales senoidales ni color azul.
    // - Pre-carga en la ranura electromagnética real del rifle (`hero-cb-valari.png`).
    // - Freno de boca antiblindaje con venteo lateral en V + eyección de casquillo metálico.
    // - [B] Básico: Dardo APFSDS de tungsteno hiperveloz con corte de aire comprimido.
    // - [1] Salva Pesada: Proyectil sabot pesado + ráfaga de metralla de tungsteno hiperdenso
    //   a velocidad relativista con ondas sónicas Mach y desprendimiento de blindaje (spalling).
    // - [2] Conmoción: Posta cinética contundente de tungsteno con frente de presión de aire
    //   y onda de choque mecánica/estructural al impactar.
    // =========================================================================
    const isHeavySkill = kind === 'skill_1';
    const isControlSkill = kind === 'skill_2';

    const CHARGE_MS = Math.round(
      (isHeavySkill ? 240 : isControlSkill ? 140 : 70) * speedScale
    );
    const FLIGHT_MS = Math.round(
      (isHeavySkill ? 68 : isControlSkill ? 78 : 52) * speedScale
    );
    const IMPACT_TIME = CHARGE_MS + FLIGHT_MS;
    const TOTAL_MS = Math.round(
      (isHeavySkill ? 720 : isControlSkill ? 610 : 420) * speedScale
    );

    const railSlotMask = getValariRifleRailMask(heroImg);

    // Sub-munición / metralla de tungsteno hiperdenso para Salva Pesada [1]
    const tungstenShrapnelCluster = isHeavySkill
      ? [
          { yOffset: 0, xLag: 0, scale: 1.35, isMainSabot: true },
          { yOffset: -5.5, xLag: 22, scale: 0.78, isMainSabot: false },
          { yOffset: 5.2, xLag: 30, scale: 0.78, isMainSabot: false },
          { yOffset: -10.5, xLag: 48, scale: 0.65, isMainSabot: false },
          { yOffset: 9.8, xLag: 56, scale: 0.65, isMainSabot: false },
        ]
      : [{ yOffset: 0, xLag: 0, scale: isControlSkill ? 1.22 : 1.0, isMainSabot: true }];

    // Ondas sónicas de aire comprimido (Conos Mach físicos, sin neón ni azul)
    const machAirRings = isHeavySkill
      ? [
          { xOffset: dist * 0.16, rx: 5, ry: 22 },
          { xOffset: dist * 0.44, rx: 6, ry: 26 },
          { xOffset: dist * 0.74, rx: 7, ry: 30 },
        ]
      : isControlSkill
        ? [
            { xOffset: dist * 0.22, rx: 6, ry: 20 },
            { xOffset: dist * 0.52, rx: 8, ry: 26 },
            { xOffset: dist * 0.82, rx: 10, ry: 32 },
          ]
        : [{ xOffset: 26, rx: 3.5, ry: 13 }];

    // Chispas rectas de fricción metálica en el freno de boca (Tungsteno al blanco-rojo / ámbar y acero)
    const muzzleSparksCount = isHeavySkill ? 26 : isControlSkill ? 16 : 12;
    const muzzleSparks: ValariShotSpark[] = Array.from(
      { length: muzzleSparksCount },
      (_, i) => {
        // Escapes laterales del freno de boca (ángulos de venteo de francotirador pesado)
        const ventAngle =
          i < 8
            ? (i % 2 === 0 ? -0.58 : 0.58) + (Math.random() - 0.5) * 0.18
            : (Math.random() - 0.5) * 0.45;
        const spd = (isHeavySkill ? 320 : 230) + Math.random() * 380;
        return {
          x: startX,
          y: startY,
          vx: Math.cos(ventAngle) * spd,
          vy: Math.sin(ventAngle) * spd,
          length: (isHeavySkill ? 12 : 8) + Math.random() * 12,
          size: 1.2 + Math.random() * 1.3,
          alpha: 1,
          decay: 3.4 + Math.random() * 2.2,
          color:
            i % 3 === 0
              ? '#FFFFFF'
              : i % 3 === 1
                ? '#FDE68A'
                : '#F59E0B',
          gravity: 240,
        };
      }
    );

    // Esquirlas balísticas y fragmentos de blindaje perforado en el impacto (Spalling metálico)
    const impactSparksCount = isHeavySkill ? 44 : isControlSkill ? 26 : 20;
    const impactSparks: ValariShotSpark[] = Array.from(
      { length: impactSparksCount },
      (_, i) => {
        // En Salva Pesada y Básico, parte de la metralla de tungsteno atraviesa de lado a lado (forward spalling)
        const isThroughPenetration =
          !isControlSkill && i < (isHeavySkill ? 18 : 7);
        const bounceAngle = isThroughPenetration
          ? (Math.random() - 0.5) * 0.52
          : Math.PI + (Math.random() - 0.5) * 1.55;
        const spd =
          (isHeavySkill ? 310 : 220) +
          Math.random() * (isHeavySkill ? 540 : 390);
        return {
          x: endX,
          y: endY + (isHeavySkill ? (Math.random() - 0.5) * 18 : 0),
          vx: Math.cos(bounceAngle) * spd,
          vy: Math.sin(bounceAngle) * spd - 45,
          length: (isHeavySkill ? 14 : 9) + Math.random() * 15,
          size: (isHeavySkill ? 1.6 : 1.3) + Math.random() * 1.5,
          alpha: 1,
          decay: 2.5 + Math.random() * 1.9,
          color:
            i % 4 === 0
              ? '#F8FAFC'
              : i % 4 === 1
                ? '#CBD5E1'
                : i % 2 === 0
                  ? '#FBBF24'
                  : '#EA580C',
          gravity: 440,
        };
      }
    );

    // Fragmentos sólidos poligonales de blindaje arrancado (Armor Spalling chunks)
    const armorShards = Array.from(
      { length: isHeavySkill ? 14 : isControlSkill ? 9 : 6 },
      (_, i) => {
        const forward = isHeavySkill && i < 6;
        const ang = forward
          ? (Math.random() - 0.5) * 0.65
          : Math.PI + (Math.random() - 0.5) * 1.4;
        const spd = 160 + Math.random() * 280;
        return {
          x: endX,
          y: endY + (Math.random() - 0.5) * 14,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 60,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 18,
          w: (isHeavySkill ? 5.5 : 4.0) + Math.random() * 4.5,
          h: (isHeavySkill ? 3.2 : 2.4) + Math.random() * 2.5,
          alpha: 1,
          hotEdge: i % 2 === 0,
        };
      }
    );

    // Dibuja un proyectil físico de tungsteno (dardo APFSDS con sabot o posta contundente)
    const drawTungstenProjectile = (
      px: number,
      py: number,
      scale: number,
      bluntHead: boolean
    ) => {
      ctx.save();
      ctx.translate(px, py);

      const len = (bluntHead ? 20 : 28) * scale;
      const halfThick = (bluntHead ? 3.4 : 2.3) * scale;

      // 1. Cono Mach de compresión de aire (ondas blancas/grises translúcidas pegadas a la punta)
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.55)';
      ctx.lineWidth = 1.3 * scale;
      ctx.beginPath();
      ctx.moveTo(-len * 0.95, -halfThick * 3.4);
      ctx.lineTo(len * 0.45, 0);
      ctx.lineTo(-len * 0.95, halfThick * 3.4);
      ctx.stroke();

      // 2. Cuerpo sólido de aleación de tungsteno (gris-acero oscuro con bisel especular superior)
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      if (bluntHead) {
        // Posta cinética de cabeza chata para Conmoción [2]
        ctx.moveTo(len * 0.4, -halfThick * 0.85);
        ctx.lineTo(len * 0.45, 0);
        ctx.lineTo(len * 0.4, halfThick * 0.85);
        ctx.lineTo(-len * 0.6, halfThick);
        ctx.lineTo(-len * 0.75, 0);
        ctx.lineTo(-len * 0.6, -halfThick);
      } else {
        // Dardo perforante APFSDS con aletas estabilizadoras traseras para [B] y [1]
        ctx.moveTo(len * 0.5, 0);
        ctx.lineTo(-len * 0.15, -halfThick);
        ctx.lineTo(-len * 0.65, -halfThick * 0.85);
        ctx.lineTo(-len * 0.85, -halfThick * 1.9);
        ctx.lineTo(-len * 0.72, 0);
        ctx.lineTo(-len * 0.85, halfThick * 1.9);
        ctx.lineTo(-len * 0.65, halfThick * 0.85);
        ctx.lineTo(-len * 0.15, halfThick);
      }
      ctx.closePath();
      ctx.fill();

      // 3. Arista especular metálica superior (acero bruñido)
      ctx.strokeStyle = '#F8FAFC';
      ctx.lineWidth = 1.15 * scale;
      ctx.beginPath();
      ctx.moveTo(-len * 0.65, -halfThick * 0.55);
      ctx.lineTo(len * 0.45, 0);
      ctx.stroke();

      // 4. Punta de penetración al rojo-blanco por fricción hipersónica
      const tipGrad = ctx.createLinearGradient(
        -len * 0.25,
        0,
        len * 0.5,
        0
      );
      tipGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
      tipGrad.addColorStop(0.55, 'rgba(251, 191, 36, 0.95)');
      tipGrad.addColorStop(1, 'rgba(255, 255, 255, 1)');
      ctx.fillStyle = tipGrad;
      ctx.beginPath();
      ctx.moveTo(len * 0.52, 0);
      ctx.lineTo(-len * 0.2, -halfThick * 0.95);
      ctx.lineTo(-len * 0.2, halfThick * 0.95);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    let rafId = 0;
    const t0 = performance.now();
    let lastNow = t0;

    const renderFrame = (now: number) => {
      const elapsed = Math.max(0, now - t0);
      const dt = Math.min(0.033, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

      // 1. PRE-CARGA Y ACELERACIÓN ELÉCTRICA EN LA LÍNEA RECTA DEL RIFLE (0ms -> CHARGE_MS)
      // Mapea exactamente la línea recta de luz del guardamanos (X: 0.5741..0.6556, Y: 0.1833) como en Cygnus
      const railFadeWindow = Math.round(110 * speedScale);
      if (elapsed <= CHARGE_MS + railFadeWindow) {
        const chargeP = Math.max(
          0,
          Math.min(1, elapsed / Math.max(1, CHARGE_MS))
        );
        const fadeOut =
          elapsed <= CHARGE_MS
            ? 1
            : Math.max(0, 1 - (elapsed - CHARGE_MS) / railFadeWindow);
        const smoothRail =
          Math.pow(Math.max(0, Math.sin(chargeP * Math.PI * 0.5)), 1.15) *
          Math.max(0, fadeOut);

        if (Number.isFinite(smoothRail) && smoothRail > 0.01) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';

          const slotFullStartX =
            heroLeft + heroWidth * VALARI_RIFLE_RAIL_START_X_RATIO;
          const slotFullEndX =
            heroLeft + heroWidth * VALARI_RIFLE_RAIL_END_X_RATIO;
          const slotSpanW = Math.max(1, slotFullEndX - slotFullStartX);
          const slotEndX =
            slotFullStartX + slotSpanW * Math.min(1, chargeP * 1.2);
          const slotY = heroTop + heroHeight * VALARI_RIFLE_RAIL_Y_RATIO;

          // 1A. Iluminación progresiva de la máscara de píxeles reales de la línea del rifle
          if (railSlotMask) {
            const revealP = Math.min(1, chargeP * 1.25);
            const leftClip = slotFullStartX - 6;
            const rightClip = slotFullStartX + slotSpanW * revealP + 8;
            ctx.save();
            ctx.beginPath();
            ctx.rect(
              leftClip,
              heroTop + heroHeight * 0.16,
              Math.max(1, rightClip - leftClip),
              heroHeight * 0.055
            );
            ctx.clip();

            ctx.filter = 'blur(5px)';
            ctx.globalAlpha = Math.min(1, smoothRail * 1.2);
            ctx.drawImage(
              railSlotMask.canvas,
              heroLeft,
              heroTop,
              heroWidth,
              heroHeight
            );

            ctx.filter = 'blur(2px)';
            ctx.globalAlpha = Math.min(1, smoothRail * 1.1);
            ctx.drawImage(
              railSlotMask.canvas,
              heroLeft,
              heroTop,
              heroWidth,
              heroHeight
            );

            ctx.filter = 'blur(0.4px) brightness(1.45)';
            ctx.globalAlpha = Math.min(1, smoothRail * 0.95);
            ctx.drawImage(
              railSlotMask.canvas,
              heroLeft,
              heroTop,
              heroWidth,
              heroHeight
            );
            ctx.restore();
            ctx.filter = 'none';
            ctx.globalAlpha = 1;
          }

          // 1B. Filamento recto de carga electromagnética sobre la línea del rifle
          const slotGrad = ctx.createLinearGradient(
            slotFullStartX,
            slotY,
            slotEndX,
            slotY
          );
          slotGrad.addColorStop(0, `rgba(245, 158, 11, ${0.45 * smoothRail})`);
          slotGrad.addColorStop(
            0.55,
            `rgba(251, 191, 36, ${0.95 * smoothRail})`
          );
          slotGrad.addColorStop(1, `rgba(255, 255, 255, ${0.98 * smoothRail})`);

          ctx.strokeStyle = slotGrad;
          ctx.lineWidth = (isHeavySkill ? 3.4 : 2.6) * smoothRail;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(slotFullStartX, slotY);
          ctx.lineTo(slotEndX, slotY);
          ctx.stroke();

          // 1C. Micro-arcos eléctricos de carga y bobinas de inducción sobre la línea recta del arma
          const arcSteps = 7;
          ctx.strokeStyle = `rgba(255, 251, 235, ${0.9 * smoothRail})`;
          ctx.lineWidth = 1.15 * smoothRail;
          ctx.beginPath();
          for (let s = 0; s <= arcSteps; s++) {
            const sr = s / arcSteps;
            const ax = slotFullStartX + (slotEndX - slotFullStartX) * sr;
            const jitter =
              s === 0 || s === arcSteps
                ? 0
                : Math.sin(s * 9.7 + elapsed * 0.085) *
                  (isHeavySkill ? 2.6 : 1.8) *
                  smoothRail;
            if (s === 0) ctx.moveTo(ax, slotY + jitter);
            else ctx.lineTo(ax, slotY + jitter);
          }
          ctx.stroke();

          // 1D. Pulso de aceleración magnética que viaja desde la línea de carga hasta la boca del cañón
          if (chargeP > 0.35) {
            const accelP = Math.min(1, (chargeP - 0.35) / 0.65);
            const pulseHeadX =
              slotFullEndX + (startX - slotFullEndX) * accelP;
            const pulseTailX =
              slotFullStartX + (slotFullEndX - slotFullStartX) * accelP * 0.7;
            const accelGrad = ctx.createLinearGradient(
              pulseTailX,
              slotY,
              pulseHeadX,
              startY
            );
            accelGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
            accelGrad.addColorStop(
              0.65,
              `rgba(251, 191, 36, ${0.85 * smoothRail})`
            );
            accelGrad.addColorStop(
              1,
              `rgba(255, 255, 255, ${0.98 * smoothRail})`
            );
            ctx.strokeStyle = accelGrad;
            ctx.lineWidth = (isHeavySkill ? 2.4 : 1.7) * smoothRail;
            ctx.beginPath();
            ctx.moveTo(pulseTailX, slotY);
            ctx.lineTo(pulseHeadX, startY);
            ctx.stroke();
          }

          ctx.restore();
        }
      }

      // 2. VENTEO BALÍSTICO EN FRENO DE BOCA, EYECCIÓN DE CASQUILLO Y ONDAS SÓNICAS (t >= CHARGE_MS)
      if (elapsed >= CHARGE_MS) {
        const muzzleElapsed = elapsed - CHARGE_MS;

        // 2A. Eyección física de casquillo/sabot metálico desde la ventana extractora del rifle
        if (muzzleElapsed < 380) {
          const tSec = muzzleElapsed / 1000;
          const ejectStartX = heroLeft + heroWidth * 0.51;
          const ejectStartY = heroTop + heroHeight * 0.188;
          const casingX = ejectStartX - 115 * tSec;
          const casingY = ejectStartY - 155 * tSec + 0.5 * 980 * tSec * tSec;
          const casingRot = -muzzleElapsed * 0.038;
          const casingAlpha = Math.max(0, 1 - muzzleElapsed / 380);

          ctx.save();
          ctx.translate(casingX, casingY);
          ctx.rotate(casingRot);
          ctx.globalAlpha = casingAlpha;
          ctx.fillStyle = '#F59E0B';
          ctx.fillRect(-4.5, -1.6, 9, 3.2);
          ctx.fillStyle = '#FEF3C7';
          ctx.fillRect(-4.5, -1.6, 9, 1.1);
          ctx.restore();
        }

        // 2B. Ondas sónicas de compresión de aire (anillos Mach físicos blanco-humo/ámbar pálido)
        machAirRings.forEach((ring) => {
          const ringTriggerTime = (ring.xOffset / dist) * FLIGHT_MS;
          const ringAge = muzzleElapsed - ringTriggerTime;
          const maxRingAge = isControlSkill ? 190 : 145;
          if (ringAge < -6 || ringAge > maxRingAge) return;
          const rAlpha =
            ringAge < 0
              ? (ringAge + 6) / 6
              : Math.max(0, 1 - ringAge / maxRingAge);
          const expand =
            1 + Math.max(0, ringAge / maxRingAge) * (isControlSkill ? 0.95 : 0.55);
          const rx = ring.rx * expand;
          const ry = ring.ry * expand;
          const ringX = startX + ring.xOffset;

          ctx.strokeStyle = `rgba(248, 250, 252, ${0.52 * rAlpha})`;
          ctx.lineWidth = (isHeavySkill ? 2.1 : 1.6) * rAlpha;
          ctx.beginPath();
          ctx.ellipse(ringX, startY, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        });

        // 2C. Escapes direccionales en V del freno de boca (sin esfera de plasma)
        const blastWindow = Math.max(1, isHeavySkill ? 115 : 85);
        if (muzzleElapsed < blastWindow) {
          const mRatio = Math.max(0, Math.min(1, 1 - muzzleElapsed / blastWindow));
          const scaleM = isHeavySkill ? 1.45 : isControlSkill ? 1.18 : 0.95;

          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.translate(startX, startY);

          // 1 Aguja frontal de fricción + 2 escapes laterales inclinados del freno de boca
          const brakeVents = [
            {
              rot: 0,
              len: 44 * scaleM * (0.65 + 0.35 * mRatio),
              w: 2.8 * scaleM * mRatio,
              coreColor: `rgba(255, 255, 255, ${0.98 * mRatio})`,
              midColor: `rgba(251, 191, 36, ${0.88 * mRatio})`,
            },
            {
              rot: -0.68,
              len: 26 * scaleM * mRatio,
              w: 2.4 * scaleM * mRatio,
              coreColor: `rgba(248, 250, 252, ${0.9 * mRatio})`,
              midColor: `rgba(245, 158, 11, ${0.75 * mRatio})`,
            },
            {
              rot: 0.68,
              len: 26 * scaleM * mRatio,
              w: 2.4 * scaleM * mRatio,
              coreColor: `rgba(248, 250, 252, ${0.9 * mRatio})`,
              midColor: `rgba(245, 158, 11, ${0.75 * mRatio})`,
            },
          ];

          brakeVents.forEach((vent) => {
            ctx.save();
            ctx.rotate(vent.rot);
            const vGrad = ctx.createLinearGradient(0, 0, vent.len, 0);
            vGrad.addColorStop(0, vent.coreColor);
            vGrad.addColorStop(0.55, vent.midColor);
            vGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
            ctx.fillStyle = vGrad;
            ctx.beginPath();
            ctx.moveTo(-2, -vent.w);
            ctx.lineTo(vent.len, 0);
            ctx.lineTo(-2, vent.w);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          });

          ctx.restore();
        }

        // Chispas de fricción de tungsteno en la boca del cañón
        if (muzzleElapsed < 220) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          muzzleSparks.forEach((sp) => {
            sp.x += sp.vx * dt;
            sp.y += sp.vy * dt;
            sp.vx *= 0.91;
            sp.vy = sp.vy * 0.91 + sp.gravity * dt;
            sp.alpha = Math.max(0, sp.alpha - sp.decay * dt);
            if (sp.alpha <= 0.02) return;

            const vMag = Math.max(1, Math.hypot(sp.vx, sp.vy));
            const tailX = sp.x - (sp.vx / vMag) * sp.length * sp.alpha;
            const tailY = sp.y - (sp.vy / vMag) * sp.length * sp.alpha;

            ctx.strokeStyle = sp.color;
            ctx.globalAlpha = sp.alpha;
            ctx.lineWidth = sp.size;
            ctx.lineCap = 'butt';
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(sp.x, sp.y);
            ctx.stroke();
          });
          ctx.restore();
        }
      }

      // 3. PROYECTILES FÍSICOS DE TUNGSTENO Y ESTELA DE CORTE DE AIRE (100% RECTA HORIZONTAL)
      const trailFadeWindow = isHeavySkill ? 165 : isControlSkill ? 140 : 95;
      if (elapsed >= CHARGE_MS && elapsed <= IMPACT_TIME + trailFadeWindow) {
        const flightP = Math.min(1, (elapsed - CHARGE_MS) / Math.max(1, FLIGHT_MS));
        const afterFade =
          elapsed > IMPACT_TIME
            ? Math.max(0, 1 - (elapsed - IMPACT_TIME) / trailFadeWindow)
            : 1;

        const leadX = startX + dx * flightP;

        tungstenShrapnelCluster.forEach((proj) => {
          const projX = Math.max(startX, leadX - proj.xLag);
          const projY = startY + proj.yOffset;
          if (projX <= startX + 2) return;

          const maxTrail = proj.isMainSabot
            ? isHeavySkill
              ? dist * 0.92
              : 240
            : 135;
          const trailLen = Math.min(projX - startX, maxTrail);
          const tailStartX = projX - trailLen;

          // 3A. Estela de vacío y vapor de aire comprimido (gris-blanco translúcido físico)
          const airWakeGrad = ctx.createLinearGradient(
            tailStartX,
            projY,
            projX,
            projY
          );
          airWakeGrad.addColorStop(0, 'rgba(148, 163, 184, 0)');
          airWakeGrad.addColorStop(
            0.55,
            `rgba(203, 213, 225, ${0.28 * afterFade * proj.scale})`
          );
          airWakeGrad.addColorStop(
            1,
            `rgba(248, 250, 252, ${0.55 * afterFade * proj.scale})`
          );
          ctx.strokeStyle = airWakeGrad;
          ctx.lineWidth = (proj.isMainSabot ? 4.2 : 2.2) * afterFade;
          ctx.lineCap = 'butt';
          ctx.beginPath();
          ctx.moveTo(tailStartX, projY);
          ctx.lineTo(projX, projY);
          ctx.stroke();

          // 3B. Trazadora fina de fricción térmica de tungsteno (Blanco-Acero -> Ámbar)
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const frictionGrad = ctx.createLinearGradient(
            tailStartX + trailLen * 0.2,
            projY,
            projX,
            projY
          );
          frictionGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
          frictionGrad.addColorStop(
            0.55,
            `rgba(245, 158, 11, ${0.82 * afterFade})`
          );
          frictionGrad.addColorStop(
            0.88,
            `rgba(254, 243, 199, ${0.95 * afterFade})`
          );
          frictionGrad.addColorStop(1, `rgba(255, 255, 255, ${afterFade})`);

          ctx.strokeStyle = frictionGrad;
          ctx.lineWidth =
            (proj.isMainSabot ? (isHeavySkill ? 2.4 : 1.75) : 1.25) * afterFade;
          ctx.beginPath();
          ctx.moveTo(tailStartX + trailLen * 0.2, projY);
          ctx.lineTo(projX, projY);
          ctx.stroke();
          ctx.restore();

          // 3C. Dibujar el proyectil sólido de tungsteno mientras está en vuelo
          if (elapsed <= IMPACT_TIME + 12 && projX <= endX + 8) {
            drawTungstenProjectile(
              projX,
              projY,
              proj.scale,
              isControlSkill
            );

            // En Conmoción [2]: Frente de onda parabólico de aire comprimido delante de la posta contundente
            if (isControlSkill && proj.isMainSabot) {
              ctx.strokeStyle = 'rgba(248, 250, 252, 0.85)';
              ctx.lineWidth = 2.2;
              ctx.beginPath();
              ctx.arc(projX + 6, projY, 15, -Math.PI * 0.42, Math.PI * 0.42);
              ctx.stroke();
            }
          }
        });
      }

      // 4. IMPACTO BALÍSTICO Y FRACTURA MECÁNICA SOBRE EL OBJETIVO
      if (elapsed >= IMPACT_TIME) {
        const impElapsed = elapsed - IMPACT_TIME;
        const impDuration = Math.max(1, isHeavySkill ? 250 : isControlSkill ? 220 : 145);

        if (impElapsed < impDuration) {
          const iRatio = Math.max(0, Math.min(1, 1 - impElapsed / impDuration));
          const impScale = isHeavySkill ? 1.55 : isControlSkill ? 1.3 : 1.0;

          ctx.save();
          ctx.globalCompositeOperation = 'lighter';

          // Chispazo seco de perforación cinética (corto y agudo, no bola difusa)
          const flashR = Math.max(0.5, (22 * iRatio + 8) * impScale);
          const impGrad = ctx.createRadialGradient(
            endX,
            endY,
            0,
            endX,
            endY,
            flashR
          );
          impGrad.addColorStop(0, `rgba(255, 255, 255, ${0.98 * iRatio})`);
          impGrad.addColorStop(0.45, `rgba(254, 240, 138, ${0.9 * iRatio})`);
          impGrad.addColorStop(0.8, `rgba(245, 158, 11, ${0.75 * iRatio})`);
          impGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
          ctx.fillStyle = impGrad;
          ctx.beginPath();
          ctx.arc(endX, endY, flashR, 0, Math.PI * 2);
          ctx.fill();

          // Onda de choque de aire comprimido (elipse vertical blanca-ámbar)
          const shockR = Math.max(0.5, (10 + (1 - iRatio) * 44) * impScale);
          ctx.strokeStyle = `rgba(248, 250, 252, ${0.85 * iRatio})`;
          ctx.lineWidth = Math.max(0.1, 2.2 * iRatio);
          ctx.beginPath();
          ctx.ellipse(
            endX,
            endY,
            Math.max(0.25, shockR * 0.48),
            shockR,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();

          // En Salva Pesada [1]: Ráfaga de penetración de metralla de tungsteno de lado a lado
          if (isHeavySkill) {
            tungstenShrapnelCluster.forEach((sub, sIdx) => {
              const streakY = endY + sub.yOffset * 1.45;
              const streakLen = (48 - sIdx * 5) * impScale * iRatio;
              ctx.strokeStyle =
                sIdx === 0
                  ? `rgba(255, 255, 255, ${0.98 * iRatio})`
                  : `rgba(251, 191, 36, ${0.92 * iRatio})`;
              ctx.lineWidth = (sIdx === 0 ? 2.8 : 1.8) * iRatio;
              ctx.beginPath();
              ctx.moveTo(endX - streakLen * 0.45, streakY);
              ctx.lineTo(endX + streakLen * 1.15, streakY);
              ctx.stroke();
            });
          }

          // En Conmoción [2]: Grietas angulares de fractura mecánica sobre el blindaje + doble anillo acústico
          if (isControlSkill) {
            const concR = (16 + (1 - iRatio) * 50) * impScale;
            ctx.strokeStyle = `rgba(251, 191, 36, ${0.88 * iRatio})`;
            ctx.lineWidth = 2.0 * iRatio;
            ctx.beginPath();
            ctx.ellipse(
              endX,
              endY,
              concR * 0.65,
              concR * 0.95,
              0,
              0,
              Math.PI * 2
            );
            ctx.stroke();

            // 5 líneas quebradas de fractura mecánica (impacto contundente)
            const crackAngles = [-0.85, -0.32, 0.18, 0.72, 2.65];
            ctx.strokeStyle = `rgba(255, 251, 235, ${0.92 * iRatio})`;
            ctx.lineWidth = 1.9 * iRatio;
            crackAngles.forEach((ang, cIdx) => {
              const r1 = 14 * impScale;
              const r2 = (28 + (cIdx % 2) * 8) * impScale;
              const midAng = ang + (cIdx % 2 === 0 ? 0.18 : -0.18);
              ctx.beginPath();
              ctx.moveTo(endX, endY);
              ctx.lineTo(
                endX + Math.cos(midAng) * r1,
                endY + Math.sin(midAng) * r1
              );
              ctx.lineTo(
                endX + Math.cos(ang) * r2,
                endY + Math.sin(ang) * r2
              );
              ctx.stroke();
            });
          }

          ctx.restore();
        }

        // Fragmentos sólidos poligonales de blindaje arrancado (Armor Spalling)
        armorShards.forEach((sh) => {
          sh.x += sh.vx * dt;
          sh.y += sh.vy * dt;
          sh.vy += 520 * dt;
          sh.rot += sh.vRot * dt;
          sh.alpha = Math.max(0, sh.alpha - 2.6 * dt);
          if (sh.alpha <= 0.02) return;

          ctx.save();
          ctx.translate(sh.x, sh.y);
          ctx.rotate(sh.rot);
          ctx.globalAlpha = sh.alpha;
          ctx.fillStyle = '#475569';
          ctx.fillRect(-sh.w * 0.5, -sh.h * 0.5, sh.w, sh.h);
          ctx.strokeStyle = sh.hotEdge ? '#FBBF24' : '#E2E8F0';
          ctx.lineWidth = 1;
          ctx.strokeRect(-sh.w * 0.5, -sh.h * 0.5, sh.w, sh.h);
          ctx.restore();
        });

        // Chispas balísticas lineales de impacto
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        impactSparks.forEach((sp) => {
          sp.x += sp.vx * dt;
          sp.y += sp.vy * dt;
          sp.vx *= 0.92;
          sp.vy = sp.vy * 0.92 + sp.gravity * dt;
          sp.alpha = Math.max(0, sp.alpha - sp.decay * dt);
          if (sp.alpha <= 0.02) return;

          const vMag = Math.max(1, Math.hypot(sp.vx, sp.vy));
          const tailX = sp.x - (sp.vx / vMag) * sp.length * sp.alpha;
          const tailY = sp.y - (sp.vy / vMag) * sp.length * sp.alpha;

          ctx.strokeStyle = sp.color;
          ctx.globalAlpha = sp.alpha;
          ctx.lineWidth = sp.size;
          ctx.lineCap = 'butt';
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(sp.x, sp.y);
          ctx.stroke();
        });
        ctx.restore();
      }

      if (elapsed < TOTAL_MS) {
        rafId = requestAnimationFrame(renderFrame);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [shot]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full z-25"
    />
  );
};

/**
 * MOTOR DE EFECTOS BIO-LUMÍNICOS SKITHID:
 * 1. Ilumina de forma orgánica y progresiva los píxeles reales de las 2 guadañas en `hero-cb-skithid.png` como pre-carga del golpe.
 * 2. Ejecuta los efectos de impacto a doble escala directamente sobre el sprite enemigo:
 *    - [B] Golpe Básico: Corte diagonal grande de 1 hoja con el verde ácido de las armas.
 *    - [1] Tajo Ácido: Corte cruzado en X de doble tamaño + salpicadura de gotas corrosivas y vapor ácido sobre el enemigo.
 *    - [2] Neurotoxina: Impacto bio-eléctrico inicial que deja una marca/tinte persistente de Neurotoxina en el sprite enemigo.
 *    - [3] Regeneración: Sin halo circular; únicamente líneas horizontales esmeralda acompañadas de vaivén y desfase horizontal milimétrico de velocidad.
 */
const SkithidCombatVfxCanvas: React.FC<{
  action: SkithidActionTrigger | null;
}> = ({ action }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!action) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : 1672;
    const height = parent ? parent.clientHeight : 935;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const {
      kind,
      heroLeft,
      heroTop,
      heroWidth,
      heroHeight,
      targetCenterX,
      targetCenterY,
      targetWidth,
      targetHeight,
      speedMultiplier = 1,
      heroImg,
    } = action;

    const speedScale = 1 / Math.pow(Math.max(1, speedMultiplier), 0.65);

    // HABILIDAD [3]: REGENERACIÓN (Sin halo circular; líneas horizontales esmeralda + desfase/estela horizontal milimétrica de velocidad)
    if (kind === 'skill_3') {
      const TOTAL_REGEN_MS = Math.round(640 * speedScale);
      const heroCenterX = heroLeft + heroWidth * 0.48;

      const synapticLines = Array.from({ length: 14 }, (_, i) => ({
        yRatio: 0.12 + (i / 13) * 0.78,
        phaseOffset: (i * 0.11) % 0.52,
        spanRatio: 0.68 + (i % 3) * 0.18,
        dir: i % 2 === 0 ? 1 : -1,
        thickness: i % 3 === 0 ? 2.8 : 2.1,
        color: i % 3 === 0 ? '#D9F99D' : i % 2 === 0 ? '#34D399' : '#10B981',
      }));

      let rafId = 0;
      const t0 = performance.now();

      const renderRegenFrame = (now: number) => {
        const elapsed = Math.max(0, now - t0);
        const progress = Math.max(0, Math.min(1, elapsed / Math.max(1, TOTAL_REGEN_MS)));
        const envAlpha =
          progress < 0.18
            ? progress / 0.18
            : Math.max(0, 1 - (progress - 0.18) / 0.82);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'lighter';

        // 1. Estela / desfase horizontal milimétrico del propio sprite acompañando las líneas de velocidad
        if (heroImg && heroImg.complete && heroImg.naturalWidth > 0) {
          const jitterX = Math.sin(elapsed * 0.055) * 6.5;
          ctx.save();
          ctx.globalAlpha = 0.24 * envAlpha;
          ctx.filter = 'blur(1.5px) hue-rotate(35deg) saturate(1.8)';
          ctx.drawImage(
            heroImg,
            heroLeft + jitterX,
            heroTop,
            heroWidth,
            heroHeight
          );
          ctx.drawImage(
            heroImg,
            heroLeft - jitterX * 0.85,
            heroTop,
            heroWidth,
            heroHeight
          );
          ctx.restore();
        }

        // 2. Líneas horizontales esmeralda de Esquiva Sináptica (sin halo circular)
        synapticLines.forEach((ln) => {
          const localP = (progress * 1.48 - ln.phaseOffset) / 0.62;
          if (localP <= 0 || localP >= 1) return;
          const lineFade = Math.sin(localP * Math.PI) * envAlpha;
          const yPos = heroTop + heroHeight * ln.yRatio;
          const fullW = heroWidth * ln.spanRatio;
          const sweepOffset = (localP - 0.5) * heroWidth * 0.52 * ln.dir;
          const xStart = heroCenterX - fullW * 0.5 + sweepOffset;
          const xEnd = heroCenterX + fullW * 0.5 + sweepOffset;

          const lGrad = ctx.createLinearGradient(xStart, yPos, xEnd, yPos);
          lGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
          lGrad.addColorStop(0.22, `rgba(52, 211, 153, ${0.88 * lineFade})`);
          lGrad.addColorStop(0.5, `rgba(236, 252, 203, ${0.98 * lineFade})`);
          lGrad.addColorStop(0.78, `rgba(52, 211, 153, ${0.88 * lineFade})`);
          lGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');

          ctx.strokeStyle = lGrad;
          ctx.lineWidth = ln.thickness;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(xStart, yPos);
          ctx.lineTo(xEnd, yPos);
          ctx.stroke();
        });

        ctx.globalAlpha = 1;

        if (elapsed < TOTAL_REGEN_MS) {
          rafId = requestAnimationFrame(renderRegenFrame);
        } else {
          ctx.clearRect(0, 0, width, height);
        }
      };

      rafId = requestAnimationFrame(renderRegenFrame);
      return () => cancelAnimationFrame(rafId);
    }

    // ATAQUES OFENSIVOS SKITHID ([B] Golpe Básico, [1] Tajo Ácido, [2] Neurotoxina)
    // Fase 1 (0 -> BLADE_CHARGE_MS): Glow progresivo sobre los píxeles exactos de las hojas en `hero-cb-skithid.png`.
    // Fase 2 (BLADE_CHARGE_MS -> TOTAL_MS): Efecto de corte al doble de tamaño o descarga neurotóxica sobre el enemigo.
    const isAcidXSlash = kind === 'skill_1';
    const isNeurotoxin = kind === 'skill_2';

    const BLADE_CHARGE_MS = Math.round(
      (isAcidXSlash ? 370 : isNeurotoxin ? 330 : 280) * speedScale
    );
    const HIT_DURATION_MS = Math.round(
      (isAcidXSlash ? 560 : isNeurotoxin ? 580 : 420) * speedScale
    );
    const TOTAL_MS = BLADE_CHARGE_MS + HIT_DURATION_MS;

    // Doble del tamaño anterior para que los cortes se visualicen con total contundencia sobre cualquier enemigo
    const slashRadius = Math.max(
      114,
      Math.max(targetWidth, targetHeight) * 0.98
    );

    const bladeMasks = getSkithidBladeMasks(heroImg);

    // Gotas de ácido / esporas bio-lumínicas sobre el enemigo (mayor escala)
    const dropletsCount = isAcidXSlash ? 42 : isNeurotoxin ? 28 : 22;
    const droplets = Array.from({ length: dropletsCount }, (_, i) => {
      const ang =
        isAcidXSlash || isNeurotoxin
          ? (i / dropletsCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.35
          : -Math.PI * 0.75 + (Math.random() - 0.5) * 1.45;
      const spd = (isAcidXSlash ? 185 : 145) + Math.random() * 270;
      return {
        x: targetCenterX + (Math.random() - 0.5) * targetWidth * 0.35,
        y: targetCenterY + (Math.random() - 0.5) * targetHeight * 0.35,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - (isAcidXSlash ? 55 : 25),
        r: (isAcidXSlash ? 3.2 : 2.4) + Math.random() * 2.8,
        alpha: 1,
        decay: isAcidXSlash ? 1.7 + Math.random() * 1.1 : 2.1 + Math.random() * 1.3,
        gravity: isAcidXSlash ? 360 : isNeurotoxin ? -35 : 250,
        color:
          i % 3 === 0
            ? '#ECFCCB'
            : i % 2 === 0
              ? '#A3E635'
              : isNeurotoxin
                ? '#2DD4BF'
                : '#22C55E',
      };
    });

    const drawProgressiveBladePixelGlow = (
      maskCanvas: HTMLCanvasElement,
      isFrontBlade: boolean,
      chargeP: number,
      fade: number,
      lungeAdvanceX: number
    ) => {
      // Curva progresiva suave (no instantánea): crece gradualmente de 0% a 100%
      const safeCharge = Math.max(0, Math.min(1, chargeP));
      const smoothGlow =
        Math.pow(Math.max(0, Math.sin(safeCharge * Math.PI * 0.5)), 1.45) *
        Math.max(0, fade);
      if (!Number.isFinite(smoothGlow) || smoothGlow <= 0.01) return;

      const drawX = heroLeft + lungeAdvanceX;
      const drawY = heroTop;

      ctx.save();
      // Recorte progresivo desde la empuñadura hacia la punta durante el inicio de la carga
      const revealP = Math.min(1, chargeP * 1.25);
      ctx.beginPath();
      if (isFrontBlade) {
        // La hoja frontal nace a la derecha (x ~ 0.44 * heroWidth) y se extiende hacia la punta izquierda (x ~ 0.12 * heroWidth)
        const rightEdge = drawX + heroWidth * 0.46;
        const leftEdge = drawX + heroWidth * (0.46 - 0.36 * revealP);
        ctx.rect(
          leftEdge - 14,
          drawY + heroHeight * 0.56,
          rightEdge - leftEdge + 28,
          heroHeight * 0.2
        );
      } else {
        // La hoja lateral nace arriba (y ~ 0.65 * heroHeight) y baja hasta la punta inferior (y ~ 0.90 * heroHeight)
        const topEdge = drawY + heroHeight * 0.64;
        const bottomEdge = drawY + heroHeight * (0.64 + 0.28 * revealP);
        ctx.rect(
          drawX + heroWidth * 0.74,
          topEdge - 12,
          heroWidth * 0.26,
          bottomEdge - topEdge + 24
        );
      }
      ctx.clip();

      // Capa 1: Halo de resplandor exterior difuso (bloom orgánico)
      ctx.filter = 'blur(8px)';
      ctx.globalAlpha = Math.min(1, smoothGlow * 1.15);
      ctx.drawImage(maskCanvas, drawX, drawY, heroWidth, heroHeight);

      // Capa 2: Glow intermedio verde-lima bioluminiscente
      ctx.filter = 'blur(3px)';
      ctx.globalAlpha = Math.min(1, smoothGlow * 1.05);
      ctx.drawImage(maskCanvas, drawX, drawY, heroWidth, heroHeight);

      // Capa 3: Núcleo incandescente sobre los píxeles exactos del filo
      ctx.filter = 'blur(0.6px) brightness(1.35)';
      ctx.globalAlpha = Math.min(1, smoothGlow * 0.92);
      ctx.drawImage(maskCanvas, drawX, drawY, heroWidth, heroHeight);

      ctx.restore();
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
    };

    const drawCrescentSlash = (
      cx: number,
      cy: number,
      angleRad: number,
      radius: number,
      slashProgress: number,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleRad);

      const currentLen = radius * (0.38 + 0.62 * Math.min(1, slashProgress * 1.55));
      const thickness = (isAcidXSlash ? 20.0 : 16.5) * alpha;

      // Halo exterior verde ácido de las guadañas Skithid (doble de escala)
      const slashGrad = ctx.createLinearGradient(-currentLen, 0, currentLen, 0);
      slashGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
      slashGrad.addColorStop(0.18, `rgba(34, 197, 94, ${0.9 * alpha})`);
      slashGrad.addColorStop(0.5, `rgba(163, 230, 53, ${0.98 * alpha})`);
      slashGrad.addColorStop(0.82, `rgba(34, 197, 94, ${0.9 * alpha})`);
      slashGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');

      ctx.fillStyle = slashGrad;
      ctx.beginPath();
      ctx.moveTo(-currentLen, 0);
      ctx.quadraticCurveTo(0, -thickness * 1.55, currentLen, 0);
      ctx.quadraticCurveTo(0, -thickness * 0.25, -currentLen, 0);
      ctx.closePath();
      ctx.fill();

      // Núcleo blanco-lima afilado del corte
      ctx.strokeStyle = `rgba(236, 252, 203, ${0.98 * alpha})`;
      ctx.lineWidth = 4.2 * alpha;
      ctx.beginPath();
      ctx.moveTo(-currentLen * 0.85, -thickness * 0.18);
      ctx.quadraticCurveTo(0, -thickness * 0.92, currentLen * 0.85, -thickness * 0.18);
      ctx.stroke();

      ctx.restore();
    };

    let rafId = 0;
    const t0 = performance.now();
    let lastNow = t0;

    const renderSkithidFrame = (now: number) => {
      const elapsed = Math.max(0, now - t0);
      const dt = Math.min(0.033, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      // 1. PRE-CARGA PROGRESIVA EN LOS PÍXELES REALES DE LAS HOJAS SKITHID
      const fadeOutWindow = Math.round(110 * speedScale);
      if (elapsed <= BLADE_CHARGE_MS + fadeOutWindow && bladeMasks) {
        const chargeP = Math.max(0, Math.min(1, elapsed / Math.max(1, BLADE_CHARGE_MS)));
        const bladeFade =
          elapsed <= BLADE_CHARGE_MS
            ? 1
            : Math.max(0, 1 - (elapsed - BLADE_CHARGE_MS) / fadeOutWindow);
        const lungeOffset =
          elapsed > BLADE_CHARGE_MS
            ? Math.min(1, (elapsed - BLADE_CHARGE_MS) / Math.max(1, 90 * speedScale)) *
              (isAcidXSlash ? 56 : 44)
            : 0;

        // En Básico [B] carga progresivamente la hoja frontal; en [1] y [2] cargan ambas hojas
        drawProgressiveBladePixelGlow(
          bladeMasks.front,
          true,
          chargeP,
          bladeFade,
          lungeOffset
        );
        if (isAcidXSlash || isNeurotoxin) {
          drawProgressiveBladePixelGlow(
            bladeMasks.side,
            false,
            chargeP,
            bladeFade,
            lungeOffset
          );
        }
      }

      // 2. EFECTOS DE IMPACTO A DOBLE DE TAMAÑO SOBRE EL SPRITE ENEMIGO (t >= BLADE_CHARGE_MS)
      if (elapsed >= BLADE_CHARGE_MS) {
        const hitElapsed = elapsed - BLADE_CHARGE_MS;
        const hitP = Math.min(1, hitElapsed / Math.max(1, HIT_DURATION_MS));
        const hitAlpha =
          hitP < 0.15 ? hitP / 0.15 : Math.max(0, 1 - (hitP - 0.15) / 0.85);

        if (kind === 'basic') {
          // [B] GOLPE BÁSICO: Corte diagonal de 1 hoja al doble de tamaño
          drawCrescentSlash(
            targetCenterX,
            targetCenterY,
            -0.66,
            slashRadius * 1.18,
            hitP,
            hitAlpha
          );
        } else if (isAcidXSlash) {
          // [1] TAJO ÁCIDO: Doble corte cruzado en X al doble de tamaño + salpicadura ácida
          drawCrescentSlash(
            targetCenterX,
            targetCenterY,
            -0.7,
            slashRadius * 1.32,
            hitP,
            hitAlpha
          );
          const secondDelay = Math.round(45 * speedScale);
          if (hitElapsed >= secondDelay) {
            const secondP = Math.min(
              1,
              (hitElapsed - secondDelay) /
                Math.max(1, HIT_DURATION_MS - secondDelay)
            );
            const secondAlpha =
              secondP < 0.15
                ? secondP / 0.15
                : Math.max(0, 1 - (secondP - 0.15) / 0.85);
            drawCrescentSlash(
              targetCenterX,
              targetCenterY,
              0.7,
              slashRadius * 1.32,
              secondP,
              secondAlpha
            );
          }

          // Neblina de corrosión ácida hirviendo sobre el enemigo
          const acidGlow = ctx.createRadialGradient(
            targetCenterX,
            targetCenterY,
            6,
            targetCenterX,
            targetCenterY,
            slashRadius * 1.15
          );
          acidGlow.addColorStop(0, `rgba(217, 249, 157, ${0.58 * hitAlpha})`);
          acidGlow.addColorStop(0.5, `rgba(132, 204, 22, ${0.44 * hitAlpha})`);
          acidGlow.addColorStop(1, 'rgba(16, 185, 129, 0)');
          ctx.fillStyle = acidGlow;
          ctx.beginPath();
          ctx.arc(targetCenterX, targetCenterY, slashRadius * 1.15, 0, Math.PI * 2);
          ctx.fill();
        } else if (isNeurotoxin) {
          // [2] NEUROTOXINA: Inyección bio-eléctrica de gran escala sobre el enemigo
          const pulse = 0.88 + 0.12 * Math.sin(hitElapsed * 0.045);
          const neuroGrad = ctx.createRadialGradient(
            targetCenterX,
            targetCenterY,
            4,
            targetCenterX,
            targetCenterY,
            slashRadius * 1.12
          );
          neuroGrad.addColorStop(0, `rgba(236, 252, 203, ${0.75 * hitAlpha})`);
          neuroGrad.addColorStop(0.45, `rgba(45, 212, 191, ${0.55 * hitAlpha})`);
          neuroGrad.addColorStop(0.8, `rgba(16, 185, 129, ${0.3 * hitAlpha})`);
          neuroGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
          ctx.fillStyle = neuroGrad;
          ctx.beginPath();
          ctx.ellipse(
            targetCenterX,
            targetCenterY,
            Math.max(70, targetWidth * 0.65) * pulse,
            Math.max(60, targetHeight * 0.65) * pulse,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // 3 Anillos constrictores neurotóxicos grandes que se adhieren al enemigo
          [-0.26, 0, 0.26].forEach((yOff, rIdx) => {
            const ringY = targetCenterY + yOff * Math.max(90, targetHeight);
            const squeeze = 1 - 0.25 * Math.sin(hitP * Math.PI);
            const rx =
              Math.max(65, targetWidth * 0.56) *
              (1 - Math.abs(yOff) * 0.35) *
              squeeze;
            ctx.strokeStyle =
              rIdx === 1
                ? `rgba(163, 230, 53, ${0.96 * hitAlpha})`
                : `rgba(45, 212, 191, ${0.9 * hitAlpha})`;
            ctx.lineWidth = 3.2 * hitAlpha;
            ctx.beginPath();
            ctx.ellipse(targetCenterX, ringY, rx, 13, 0, 0, Math.PI * 2);
            ctx.stroke();
          });
        }

        // Gotas de ácido / esporas sobre el objetivo
        droplets.forEach((dr) => {
          dr.x += dr.vx * dt;
          dr.y += dr.vy * dt;
          dr.vx *= 0.92;
          dr.vy = dr.vy * 0.92 + dr.gravity * dt;
          dr.alpha = Math.max(0, dr.alpha - dr.decay * dt);
          if (dr.alpha <= 0.02) return;

          ctx.fillStyle = dr.color;
          ctx.globalAlpha = dr.alpha * hitAlpha;
          ctx.beginPath();
          ctx.arc(dr.x, dr.y, dr.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      if (elapsed < TOTAL_MS) {
        rafId = requestAnimationFrame(renderSkithidFrame);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    rafId = requestAnimationFrame(renderSkithidFrame);
    return () => cancelAnimationFrame(rafId);
  }, [action]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full z-25"
    />
  );
};

/**
 * Máscara exacta de los píxeles de la línea del cañón sobre el antebrazo extendido de `hero-cb-cygnus.png` (248x300 px):
 * Aísla únicamente el conducto fotónico azul del antebrazo (x: 170..212, y: 62..72) para animar su glow progresivo de carga.
 */
let cachedCygnusForearmMask: {
  canvas: HTMLCanvasElement;
  natW: number;
  natH: number;
} | null = null;

function getCygnusForearmMask(img: HTMLImageElement | null) {
  if (cachedCygnusForearmMask) return cachedCygnusForearmMask;
  if (!img || !img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
    return null;
  }

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = w;
  srcCanvas.height = h;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) return null;

  srcCtx.drawImage(img, 0, 0);
  let srcData: ImageData;
  try {
    srcData = srcCtx.getImageData(0, 0, w, h);
  } catch {
    return null;
  }

  const forearmCanvas = document.createElement('canvas');
  forearmCanvas.width = w;
  forearmCanvas.height = h;
  const forearmCtx = forearmCanvas.getContext('2d');
  if (!forearmCtx) return null;

  const outData = forearmCtx.createImageData(w, h);
  const srcPx = srcData.data;
  const outPx = outData.data;

  for (let y = 61; y <= 73; y++) {
    for (let x = 168; x <= 214; x++) {
      if (y < 0 || y >= h || x < 0 || x >= w) continue;
      const idx = (y * w + x) * 4;
      const r = srcPx[idx];
      const b = srcPx[idx + 2];
      const a = srcPx[idx + 3];

      if (a <= 100 || b <= r + 32 || b <= 130) continue;

      const blueStrength = Math.min(1, (b - r) / 110);
      const outA = Math.min(255, Math.round(a * (0.5 + 0.5 * blueStrength)));

      outPx[idx] = 186;
      outPx[idx + 1] = 230;
      outPx[idx + 2] = 255;
      outPx[idx + 3] = outA;
    }
  }

  forearmCtx.putImageData(outData, 0, 0);
  cachedCygnusForearmMask = {
    canvas: forearmCanvas,
    natW: w,
    natH: h,
  };
  return cachedCygnusForearmMask;
}

/**
 * MOTOR DE EFECTOS FOTÓNICOS Y DE FASE CYGNUS:
 * 1. Fase de carga: Ilumina de forma progresiva la línea del cañón sobre el antebrazo extendido (`LINEA DE CARGA DE ATAQUES`).
 * 2. [B] Golpe Básico: Haz lineal fotónico de precisión quirúrgica desde la mano extendida (sin superar el grosor del antebrazo).
 * 3. [1] Haz Fotónico: Dos puntos emisores centrados en el guante del héroe que disparan dos haces finos convergentes hacia un único punto focal sobre el enemigo, desplegando la mira holográfica Cygnus (`FIJADO`).
 * 4. [2] Prisión de Fase: Líneas verticales de arriba hacia abajo que contienen al enemigo en su posición mientras su sprite vibra horizontalmente en un intento minúsculo de resistir.
 * 5. [3] Recarga: Escudo hexagonal diminuto recortado estrictamente a la silueta del sprite del héroe (`hero-cb-cygnus.png`), recorriendo con un pulso azul eléctrico desde la parte superior derecha hasta la parte inferior izquierda.
 */
const CygnusCombatVfxCanvas: React.FC<{
  action: CygnusActionTrigger | null;
}> = ({ action }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!action) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : 1672;
    const height = parent ? parent.clientHeight : 935;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const {
      kind,
      heroLeft,
      heroTop,
      heroWidth,
      heroHeight,
      targetCenterX,
      targetCenterY,
      targetWidth,
      targetHeight,
      speedMultiplier = 1,
      heroImg,
      targetImg,
    } = action;

    const speedScale = 1 / Math.pow(Math.max(1, speedMultiplier), 0.65);

    // =========================================================================
    // HABILIDAD [3]: RECARGA (Escudo hexagonal diminuto en la silueta del héroe
    // con pulso azul eléctrico desde arriba-derecha hasta abajo-izquierda)
    // =========================================================================
    if (kind === 'skill_3') {
      const TOTAL_SHIELD_MS = Math.round(780 * speedScale);
      const offW = Math.max(1, Math.round(heroWidth * dpr));
      const offH = Math.max(1, Math.round(heroHeight * dpr));
      const offCanvas = document.createElement('canvas');
      offCanvas.width = offW;
      offCanvas.height = offH;
      const offCtx = offCanvas.getContext('2d');

      // Precalcular malla de hexágonos diminutos (radio ~5.5px) en coordenadas locales del sprite del héroe
      const hexR = 5.6;
      const hexDx = hexR * 1.5;
      const hexDy = hexR * Math.sqrt(3);
      const hexCells: {
        cx: number;
        cy: number;
        // Proyección normalizada u en [0..1] desde Arriba-Derecha (x=heroWidth, y=0 -> u=0) hasta Abajo-Izquierda (x=0, y=heroHeight -> u=1)
        diagU: number;
      }[] = [];

      for (let col = 0, x = 0; x <= heroWidth + hexR; col++, x += hexDx) {
        const yOffset = col % 2 === 0 ? 0 : hexDy * 0.5;
        for (let y = yOffset; y <= heroHeight + hexR; y += hexDy) {
          const nx = 1 - Math.max(0, Math.min(1, x / Math.max(1, heroWidth)));
          const ny = Math.max(0, Math.min(1, y / Math.max(1, heroHeight)));
          const diagU = (nx + ny) * 0.5;
          hexCells.push({ cx: x, cy: y, diagU });
        }
      }

      const traceMiniHex = (
        targetCtx: CanvasRenderingContext2D,
        cx: number,
        cy: number,
        r: number
      ) => {
        targetCtx.beginPath();
        for (let s = 0; s < 6; s++) {
          const ang = (s * Math.PI) / 3;
          const vx = cx + Math.cos(ang) * r;
          const vy = cy + Math.sin(ang) * r;
          if (s === 0) targetCtx.moveTo(vx, vy);
          else targetCtx.lineTo(vx, vy);
        }
        targetCtx.closePath();
      };

      let rafId = 0;
      const t0 = performance.now();

      const renderShieldFrame = (now: number) => {
        const elapsed = Math.max(0, now - t0);
        const progress = Math.max(0, Math.min(1, elapsed / Math.max(1, TOTAL_SHIELD_MS)));
        // El frente del pulso viaja desde u = -0.08 (arriba-derecha) hasta u = 1.18 (abajo-izquierda)
        const waveFrontU = -0.08 + progress * 1.26;
        const envFade =
          progress < 0.12
            ? progress / 0.12
            : progress > 0.82
              ? Math.max(0, 1 - (progress - 0.82) / 0.18)
              : 1;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        if (
          offCtx &&
          heroImg &&
          heroImg.complete &&
          heroImg.naturalWidth > 0
        ) {
          offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
          offCtx.clearRect(0, 0, heroWidth, heroHeight);
          offCtx.globalCompositeOperation = 'source-over';

          // 1. Gradiente diagonal de energía azul eléctrica (desde arriba-derecha hacia abajo-izquierda)
          const waveBandWidth = 0.24;
          const diagGrad = offCtx.createLinearGradient(
            heroWidth,
            0,
            0,
            heroHeight
          );
          const p0 = Math.max(0, Math.min(1, waveFrontU - waveBandWidth));
          const pMid = Math.max(0, Math.min(1, waveFrontU));
          const p1 = Math.max(0, Math.min(1, waveFrontU + waveBandWidth * 0.65));

          diagGrad.addColorStop(0, `rgba(37, 99, 235, ${0.12 * envFade})`);
          if (p0 > 0) {
            diagGrad.addColorStop(p0, `rgba(56, 189, 248, ${0.18 * envFade})`);
          }
          diagGrad.addColorStop(
            pMid,
            `rgba(186, 230, 253, ${0.72 * envFade})`
          );
          if (p1 < 1) {
            diagGrad.addColorStop(p1, 'rgba(37, 99, 235, 0)');
          }
          diagGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');

          offCtx.fillStyle = diagGrad;
          offCtx.fillRect(0, 0, heroWidth, heroHeight);

          // 2. Malla de escudo hexagonal diminuto activada al paso del pulso diagonal
          hexCells.forEach((cell) => {
            const distFromFront = waveFrontU - cell.diagU;
            // Aún no llegó el frente del pulso desde arriba-derecha
            if (distFromFront < -0.09) return;
            // Brillo máximo justo en el frente de onda + estela de recomposición detrás del frente
            let cellAlpha = 0;
            let isCrest = false;
            if (distFromFront >= -0.09 && distFromFront <= 0.09) {
              cellAlpha = (1 - Math.abs(distFromFront) / 0.09) * 0.98;
              isCrest = true;
            } else if (distFromFront > 0.09 && distFromFront < 0.48) {
              cellAlpha = (1 - (distFromFront - 0.09) / 0.39) * 0.55;
            }
            cellAlpha *= envFade;
            if (cellAlpha <= 0.03) return;

            traceMiniHex(offCtx, cell.cx, cell.cy, hexR * 0.88);
            if (isCrest) {
              offCtx.fillStyle = `rgba(186, 230, 253, ${cellAlpha * 0.42})`;
              offCtx.fill();
              offCtx.strokeStyle = `rgba(224, 242, 254, ${cellAlpha})`;
              offCtx.lineWidth = 1.25;
              offCtx.stroke();
            } else {
              offCtx.strokeStyle = `rgba(56, 189, 248, ${cellAlpha})`;
              offCtx.lineWidth = 0.95;
              offCtx.stroke();
            }
          });

          // 3. Línea de cresta eléctrica diagonal perpendicular al recorrido (Arriba-Derecha -> Abajo-Izquierda)
          const crestX = heroWidth * (1 - waveFrontU);
          const crestY = heroHeight * waveFrontU;
          offCtx.save();
          offCtx.translate(crestX, crestY);
          offCtx.rotate(Math.PI * 0.25);
          const crestGrad = offCtx.createLinearGradient(0, -heroHeight, 0, heroHeight);
          crestGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
          crestGrad.addColorStop(0.5, `rgba(224, 242, 254, ${0.95 * envFade})`);
          crestGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          offCtx.strokeStyle = crestGrad;
          offCtx.lineWidth = 2.6;
          offCtx.beginPath();
          offCtx.moveTo(-heroWidth, 0);
          offCtx.lineTo(heroWidth, 0);
          offCtx.stroke();
          offCtx.restore();

          // 4. Recortar estrictamente a la silueta real del sprite del héroe Cygnus (destination-in)
          offCtx.globalCompositeOperation = 'destination-in';
          offCtx.drawImage(heroImg, 0, 0, heroWidth, heroHeight);

          // Volcar la malla hexagonal recortada sobre el lienzo principal de la arena
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.drawImage(offCanvas, heroLeft, heroTop, heroWidth, heroHeight);
          ctx.restore();
        }

        if (elapsed < TOTAL_SHIELD_MS) {
          rafId = requestAnimationFrame(renderShieldFrame);
        } else {
          ctx.clearRect(0, 0, width, height);
        }
      };

      rafId = requestAnimationFrame(renderShieldFrame);
      return () => cancelAnimationFrame(rafId);
    }

    // =========================================================================
    // ATAQUES FOTÓNICOS Y DE CONTROL CYGNUS ([B] Básico, [1] Haz Fotónico, [2] Prisión de Fase)
    // =========================================================================
    const isConvergentSkill = kind === 'skill_1';
    const isPhasePrisonSkill = kind === 'skill_2';

    const FOREARM_CHARGE_MS = Math.round(
      (isConvergentSkill ? 280 : isPhasePrisonSkill ? 240 : 210) * speedScale
    );
    const BEAM_FLIGHT_MS = Math.round(
      (isConvergentSkill ? 115 : isPhasePrisonSkill ? 95 : 80) * speedScale
    );
    const IMPACT_TIME = FOREARM_CHARGE_MS + BEAM_FLIGHT_MS;
    const POST_HIT_MS = Math.round(
      (isPhasePrisonSkill ? 560 : isConvergentSkill ? 460 : 280) * speedScale
    );
    const TOTAL_MS = IMPACT_TIME + POST_HIT_MS;

    const forearmMask = getCygnusForearmMask(heroImg);

    // Coordenadas exactas del antebrazo, centro del haz de carga y punta de la mano extendida
    const startX = heroLeft + heroWidth * CYGNUS_HAND_TIP_X_RATIO;
    const startY = heroTop + heroHeight * CYGNUS_FOREARM_LINE_Y_RATIO;
    const gauntletX = heroLeft + heroWidth * CYGNUS_GAUNTLET_EMITTER_X_RATIO;
    const gauntletUpperY =
      startY - heroHeight * CYGNUS_GAUNTLET_SPLIT_Y_RATIO;
    const gauntletLowerY =
      startY + heroHeight * CYGNUS_GAUNTLET_SPLIT_Y_RATIO;

    // Tanto en Básico [B] como en Haz Fotónico [1], la trayectoria se mantiene 100% horizontal (endY = startY)
    // En Haz Fotónico [1] los 2 puntos separados verticalmente en el centro del haz de carga del antebrazo convergen en (endX, startY)
    const endX = targetCenterX;
    const endY = startY;

    // Líneas verticales para Prisión de Fase [2] (de arriba hacia abajo conteniendo al enemigo)
    const verticalPhaseLines = Array.from({ length: 11 }, (_, i) => ({
      xRatio: -0.42 + (i / 10) * 0.84,
      phaseOffset: (i * 0.08) % 0.36,
      heightRatio: 0.78 + (i % 3) * 0.1,
      thickness: i === 5 || i % 3 === 0 ? 2.4 : 1.7,
    }));

    const drawForearmCannonGlow = (
      chargeP: number,
      fade: number,
      recoilOffsetX: number
    ) => {
      const safeCharge = Math.max(0, Math.min(1, chargeP));
      const smoothGlow =
        Math.pow(Math.max(0, Math.sin(safeCharge * Math.PI * 0.5)), 1.35) *
        Math.max(0, fade);
      if (!Number.isFinite(smoothGlow) || smoothGlow <= 0.01) return;

      const drawX = heroLeft + recoilOffsetX;
      const drawY = heroTop;

      // 1. Si la máscara de píxeles del antebrazo está disponible, iluminar progresivamente de codo a muñeca
      if (forearmMask) {
        ctx.save();
        const revealP = Math.min(1, chargeP * 1.25);
        const leftClip = drawX + heroWidth * 0.68;
        const rightClip = drawX + heroWidth * (0.68 + 0.2 * revealP);
        ctx.beginPath();
        ctx.rect(
          leftClip - 8,
          drawY + heroHeight * 0.16,
          rightClip - leftClip + 18,
          heroHeight * 0.12
        );
        ctx.clip();

        ctx.filter = 'blur(6px)';
        ctx.globalAlpha = Math.min(1, smoothGlow * 1.2);
        ctx.drawImage(forearmMask.canvas, drawX, drawY, heroWidth, heroHeight);

        ctx.filter = 'blur(2.2px)';
        ctx.globalAlpha = Math.min(1, smoothGlow * 1.1);
        ctx.drawImage(forearmMask.canvas, drawX, drawY, heroWidth, heroHeight);

        ctx.filter = 'blur(0.4px) brightness(1.45)';
        ctx.globalAlpha = Math.min(1, smoothGlow * 0.95);
        ctx.drawImage(forearmMask.canvas, drawX, drawY, heroWidth, heroHeight);

        ctx.restore();
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
      }

      // 2. Filamento energético de refuerzo exactamente sobre la línea del cañón del antebrazo (0.706..0.831 en X, 0.2217 en Y)
      const lineStartX = drawX + heroWidth * 0.706;
      const lineEndX =
        lineStartX +
        heroWidth * 0.125 * Math.min(1, chargeP * 1.2);
      const lineY = drawY + heroHeight * CYGNUS_FOREARM_LINE_Y_RATIO;

      const fGrad = ctx.createLinearGradient(
        lineStartX,
        lineY,
        lineEndX,
        lineY
      );
      fGrad.addColorStop(0, `rgba(56, 189, 248, ${0.35 * smoothGlow})`);
      fGrad.addColorStop(0.5, `rgba(125, 211, 252, ${0.95 * smoothGlow})`);
      fGrad.addColorStop(1, `rgba(255, 255, 255, ${0.98 * smoothGlow})`);

      ctx.strokeStyle = fGrad;
      ctx.lineWidth = (isConvergentSkill ? 3.8 : 3.2) * smoothGlow;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lineStartX, lineY);
      ctx.lineTo(lineEndX, lineY);
      ctx.stroke();

      // 3. En Haz Fotónico [1]: encender los DOS puntos separados verticalmente sobre el centro del haz de carga del antebrazo
      if (isConvergentSkill) {
        const gx = gauntletX + recoilOffsetX;

        // Puente armónico vertical entre ambos nodos emisores del antebrazo
        const bridgeGrad = ctx.createLinearGradient(
          gx,
          gauntletUpperY - 3,
          gx,
          gauntletLowerY + 3
        );
        bridgeGrad.addColorStop(0, `rgba(56, 189, 248, ${0.85 * smoothGlow})`);
        bridgeGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.95 * smoothGlow})`);
        bridgeGrad.addColorStop(1, `rgba(129, 140, 248, ${0.85 * smoothGlow})`);
        ctx.strokeStyle = bridgeGrad;
        ctx.lineWidth = 2.0 * smoothGlow;
        ctx.beginPath();
        ctx.moveTo(gx, gauntletUpperY);
        ctx.lineTo(gx, gauntletLowerY);
        ctx.stroke();

        // Anillo elíptico de lente convergente en el centro del antebrazo
        ctx.strokeStyle = `rgba(165, 180, 252, ${0.75 * smoothGlow})`;
        ctx.lineWidth = 1.4 * smoothGlow;
        ctx.beginPath();
        ctx.ellipse(
          gx,
          startY,
          4.5 * smoothGlow,
          (gauntletLowerY - startY) * 1.25,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();

        [gauntletUpperY, gauntletLowerY].forEach((gy, nIdx) => {
          const nodeR = 6.2 * smoothGlow;
          const nGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, nodeR * 2.1);
          nGrad.addColorStop(0, `rgba(255, 255, 255, ${0.98 * smoothGlow})`);
          nGrad.addColorStop(
            0.42,
            nIdx === 0
              ? `rgba(56, 189, 248, ${0.95 * smoothGlow})`
              : `rgba(129, 140, 248, ${0.95 * smoothGlow})`
          );
          nGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');
          ctx.fillStyle = nGrad;
          ctx.beginPath();
          ctx.arc(gx, gy, nodeR * 2.1, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // En Básico [B] y Prisión de Fase [2]: nodo compacto en la punta de la mano extendida (sin superar el tamaño del brazo)
        const tipX = startX + recoilOffsetX;
        const nodeR = 5.0 * smoothGlow;
        const nGrad = ctx.createRadialGradient(
          tipX,
          startY,
          0,
          tipX,
          startY,
          nodeR * 2
        );
        nGrad.addColorStop(0, `rgba(255, 255, 255, ${0.96 * smoothGlow})`);
        nGrad.addColorStop(0.45, `rgba(56, 189, 248, ${0.88 * smoothGlow})`);
        nGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');
        ctx.fillStyle = nGrad;
        ctx.beginPath();
        ctx.arc(tipX, startY, nodeR * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawHolographicDiamondSight = (
      cx: number,
      cy: number,
      size: number,
      alpha: number,
      rotOffset = 0
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotOffset);

      // Relleno interior romboidal azul-violeta translúcido (tecnología Cygnus como en la guía)
      ctx.fillStyle = `rgba(99, 102, 241, ${0.26 * alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.76);
      ctx.lineTo(size * 0.76, 0);
      ctx.lineTo(0, size * 0.76);
      ctx.lineTo(-size * 0.76, 0);
      ctx.closePath();
      ctx.fill();

      // Rombo exterior cian holográfico nítido
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.96 * alpha})`;
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.stroke();

      // Rombo interior secundario
      ctx.strokeStyle = `rgba(165, 180, 252, ${0.85 * alpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.68);
      ctx.lineTo(size * 0.68, 0);
      ctx.lineTo(0, size * 0.68);
      ctx.lineTo(-size * 0.68, 0);
      ctx.closePath();
      ctx.stroke();

      // 4 Muecas de calibración en los vértices del rombo
      const tick = size * 0.22;
      ctx.strokeStyle = `rgba(224, 242, 254, ${0.92 * alpha})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(-tick * 0.5, -size - 3);
      ctx.lineTo(0, -size - 6);
      ctx.lineTo(tick * 0.5, -size - 3);
      ctx.moveTo(-tick * 0.5, size + 3);
      ctx.lineTo(0, size + 6);
      ctx.lineTo(tick * 0.5, size + 3);
      ctx.stroke();

      // Punto focal central
      ctx.fillStyle = `rgba(224, 242, 254, ${0.95 * alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    let rafId = 0;
    const t0 = performance.now();

    const renderCygnusFrame = (now: number) => {
      const elapsed = Math.max(0, now - t0);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      // 1. PRE-CARGA PROGRESIVA EN LA LÍNEA DEL ANTEBRAZO EXTENDIDO
      const forearmFadeWindow = Math.round(130 * speedScale);
      if (elapsed <= FOREARM_CHARGE_MS + forearmFadeWindow) {
        const chargeP = Math.max(
          0,
          Math.min(1, elapsed / Math.max(1, FOREARM_CHARGE_MS))
        );
        const fade =
          elapsed <= FOREARM_CHARGE_MS
            ? 1
            : Math.max(0, 1 - (elapsed - FOREARM_CHARGE_MS) / forearmFadeWindow);
        const recoilX =
          elapsed > FOREARM_CHARGE_MS
            ? -Math.min(
                1,
                (elapsed - FOREARM_CHARGE_MS) / Math.max(1, 70 * speedScale)
              ) * (isConvergentSkill ? 8 : 5)
            : 0;

        drawForearmCannonGlow(chargeP, fade, recoilX);
      }

      // 2. FASE DE DISPARO / PROYECCIÓN (t >= FOREARM_CHARGE_MS)
      if (elapsed >= FOREARM_CHARGE_MS) {
        const activeElapsed = elapsed - FOREARM_CHARGE_MS;
        const flightP = Math.min(1, activeElapsed / Math.max(1, BEAM_FLIGHT_MS));
        const beamFadeWindow = isConvergentSkill ? 250 : 150;
        const beamAlpha =
          elapsed <= IMPACT_TIME
            ? 1
            : Math.max(0, 1 - (elapsed - IMPACT_TIME) / beamFadeWindow);

        if (kind === 'basic' && beamAlpha > 0.02) {
          // ===================================================================
          // [B] GOLPE BÁSICO: Haz lineal fotónico de precisión (fino y quirúrgico,
          // saliendo en línea recta desde la mano extendida sin superar el brazo)
          // ===================================================================
          const currX = startX + (endX - startX) * flightP;
          const tailX =
            elapsed > IMPACT_TIME
              ? startX +
                (endX - startX) *
                  Math.min(1, (elapsed - IMPACT_TIME) / beamFadeWindow) *
                  0.65
              : startX;

          // Capa exterior cian-cobalto contenida (4.4px máx)
          const outerGrad = ctx.createLinearGradient(tailX, startY, currX, startY);
          outerGrad.addColorStop(0, 'rgba(37, 99, 235, 0)');
          outerGrad.addColorStop(0.25, `rgba(14, 165, 233, ${0.75 * beamAlpha})`);
          outerGrad.addColorStop(1, `rgba(56, 189, 248, ${0.95 * beamAlpha})`);
          ctx.strokeStyle = outerGrad;
          ctx.lineWidth = 4.4 * beamAlpha;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(tailX, startY);
          ctx.lineTo(currX, startY);
          ctx.stroke();

          // Núcleo láser fotónico blanco-celeste (1.6px)
          const coreGrad = ctx.createLinearGradient(tailX, startY, currX, startY);
          coreGrad.addColorStop(0, 'rgba(186, 230, 253, 0)');
          coreGrad.addColorStop(0.3, `rgba(224, 242, 254, ${0.95 * beamAlpha})`);
          coreGrad.addColorStop(1, `rgba(255, 255, 255, ${beamAlpha})`);
          ctx.strokeStyle = coreGrad;
          ctx.lineWidth = 1.75 * beamAlpha;
          ctx.beginPath();
          ctx.moveTo(tailX, startY);
          ctx.lineTo(currX, startY);
          ctx.stroke();
        } else if (isConvergentSkill && beamAlpha > 0.02) {
          // ===================================================================
          // [1] HAZ FOTÓNICO: Dos puntos separados verticalmente en el centro del
          // haz de carga del antebrazo que convergen con trayectoria 100% horizontal
          // (endY = startY), destacados con interferencia cuántica y anillos focales
          // ===================================================================
          const currX = gauntletX + (endX - gauntletX) * flightP;
          const halfSpread = (gauntletLowerY - startY) * (1 - flightP * 0.96);

          // 1. Eje armónico central cian-violeta para diferenciar claramente del golpe básico
          const axisGrad = ctx.createLinearGradient(gauntletX, startY, currX, startY);
          axisGrad.addColorStop(0, `rgba(99, 102, 241, ${0.35 * beamAlpha})`);
          axisGrad.addColorStop(0.55, `rgba(56, 189, 248, ${0.55 * beamAlpha})`);
          axisGrad.addColorStop(1, `rgba(224, 242, 254, ${0.85 * beamAlpha})`);
          ctx.strokeStyle = axisGrad;
          ctx.lineWidth = 2.1 * beamAlpha;
          ctx.beginPath();
          ctx.moveTo(gauntletX, startY);
          ctx.lineTo(currX, startY);
          ctx.stroke();

          // 2. Onda de interferencia cuántica trenzada entre los dos haces convergentes
          const waveSteps = 24;
          const phaseShift = activeElapsed * 0.035;
          ctx.strokeStyle = `rgba(165, 180, 252, ${0.72 * beamAlpha})`;
          ctx.lineWidth = 1.35 * beamAlpha;
          ctx.beginPath();
          for (let s = 0; s <= waveSteps; s++) {
            const u = s / waveSteps;
            const wx = gauntletX + (currX - gauntletX) * u;
            const envelope = (1 - u * flightP) * (gauntletLowerY - startY) * 0.82;
            const wy = startY + Math.sin(u * Math.PI * 5 - phaseShift) * envelope;
            if (s === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          ctx.stroke();

          // 3. Los DOS haces principales que surgen de los 2 puntos del centro del antebrazo y convergen en (endX, startY)
          [gauntletUpperY, gauntletLowerY].forEach((originY, bIdx) => {
            const currY = originY + (endY - originY) * flightP;

            // Halo exterior energético de cada haz convergente (4.2px)
            const bGrad = ctx.createLinearGradient(
              gauntletX,
              originY,
              currX,
              currY
            );
            bGrad.addColorStop(
              0,
              bIdx === 0
                ? `rgba(56, 189, 248, ${0.92 * beamAlpha})`
                : `rgba(129, 140, 248, ${0.92 * beamAlpha})`
            );
            bGrad.addColorStop(0.55, `rgba(56, 189, 248, ${0.96 * beamAlpha})`);
            bGrad.addColorStop(1, `rgba(255, 255, 255, ${0.99 * beamAlpha})`);

            ctx.strokeStyle = bGrad;
            ctx.lineWidth = 4.2 * beamAlpha;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(gauntletX, originY);
            ctx.lineTo(currX, currY);
            ctx.stroke();

            // Filamento central blanco-celeste de alta densidad (1.65px)
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.98 * beamAlpha})`;
            ctx.lineWidth = 1.65 * beamAlpha;
            ctx.beginPath();
            ctx.moveTo(gauntletX, originY);
            ctx.lineTo(currX, currY);
            ctx.stroke();

            // Nodo emisor activo en el centro del haz de carga del antebrazo
            const emGrad = ctx.createRadialGradient(
              gauntletX,
              originY,
              0,
              gauntletX,
              originY,
              7.5 * beamAlpha
            );
            emGrad.addColorStop(0, `rgba(255, 255, 255, ${0.98 * beamAlpha})`);
            emGrad.addColorStop(
              0.45,
              bIdx === 0
                ? `rgba(56, 189, 248, ${0.92 * beamAlpha})`
                : `rgba(129, 140, 248, ${0.92 * beamAlpha})`
            );
            emGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');
            ctx.fillStyle = emGrad;
            ctx.beginPath();
            ctx.arc(gauntletX, originY, 7.5 * beamAlpha, 0, Math.PI * 2);
            ctx.fill();
          });

          // 4. Anillos elípticos de compresión fotónica a lo largo del recorrido horizontal
          [0.24, 0.52, 0.78].forEach((ringT, rIdx) => {
            if (flightP < ringT) return;
            const rx = gauntletX + (endX - gauntletX) * ringT;
            const ryRadius = Math.max(
              3.5,
              (gauntletLowerY - startY) * (1 - ringT * 0.85)
            );
            ctx.strokeStyle =
              rIdx % 2 === 0
                ? `rgba(56, 189, 248, ${0.78 * beamAlpha})`
                : `rgba(165, 180, 252, ${0.78 * beamAlpha})`;
            ctx.lineWidth = 1.45 * beamAlpha;
            ctx.beginPath();
            ctx.ellipse(rx, startY, 3.2, ryRadius, 0, 0, Math.PI * 2);
            ctx.stroke();
          });

          // Destello en la punta convergente durante el vuelo
          if (halfSpread >= 0) {
            ctx.fillStyle = `rgba(224, 242, 254, ${0.95 * beamAlpha})`;
            ctx.beginPath();
            ctx.arc(currX, startY, 4.2 * beamAlpha, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (isPhasePrisonSkill && beamAlpha > 0.02) {
          // ===================================================================
          // [2] PRISIÓN DE FASE: Pulso fino de enlace desde la mano hacia el enemigo
          // ===================================================================
          const currX = startX + (endX - startX) * flightP;
          const pGrad = ctx.createLinearGradient(startX, startY, currX, startY);
          pGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
          pGrad.addColorStop(0.5, `rgba(99, 102, 241, ${0.72 * beamAlpha})`);
          pGrad.addColorStop(1, `rgba(186, 230, 253, ${0.9 * beamAlpha})`);
          ctx.strokeStyle = pGrad;
          ctx.lineWidth = 2.6 * beamAlpha;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(currX, startY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // 3. EFECTO EN EL OBJETIVO AL TERMINAR EL RECORRIDO (t >= IMPACT_TIME)
      if (elapsed >= IMPACT_TIME) {
        const hitElapsed = elapsed - IMPACT_TIME;
        const hitP = Math.min(1, hitElapsed / Math.max(1, POST_HIT_MS));
        const hitAlpha =
          hitP < 0.15 ? hitP / 0.15 : Math.max(0, 1 - (hitP - 0.15) / 0.85);

        if (kind === 'basic') {
          // Impacto quirúrgico de precisión fotónica (destello romboidal limpio)
          const r = 18 * hitAlpha + 6;
          const impGrad = ctx.createRadialGradient(endX, endY, 0, endX, endY, r * 1.6);
          impGrad.addColorStop(0, `rgba(255, 255, 255, ${0.98 * hitAlpha})`);
          impGrad.addColorStop(0.45, `rgba(56, 189, 248, ${0.88 * hitAlpha})`);
          impGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');
          ctx.fillStyle = impGrad;
          ctx.beginPath();
          ctx.arc(endX, endY, r * 1.6, 0, Math.PI * 2);
          ctx.fill();

          // Destello de 4 puntas de precisión
          const crossLen = 22 * hitAlpha;
          ctx.strokeStyle = `rgba(224, 242, 254, ${0.95 * hitAlpha})`;
          ctx.lineWidth = 2.0 * hitAlpha;
          ctx.beginPath();
          ctx.moveTo(endX - crossLen, endY);
          ctx.lineTo(endX + crossLen, endY);
          ctx.moveTo(endX, endY - crossLen);
          ctx.lineTo(endX, endY + crossLen);
          ctx.stroke();
        } else if (isConvergentSkill) {
          // Convergencia de los 2 haces en el punto focal horizontal (endX, startY) + pulso prismático y calibración de mira
          const convR = 28 * hitAlpha + 10;
          const convGrad = ctx.createRadialGradient(
            endX,
            endY,
            0,
            endX,
            endY,
            convR * 1.65
          );
          convGrad.addColorStop(0, `rgba(255, 255, 255, ${0.99 * hitAlpha})`);
          convGrad.addColorStop(0.35, `rgba(56, 189, 248, ${0.94 * hitAlpha})`);
          convGrad.addColorStop(0.7, `rgba(129, 140, 248, ${0.68 * hitAlpha})`);
          convGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');
          ctx.fillStyle = convGrad;
          ctx.beginPath();
          ctx.arc(endX, endY, convR * 1.65, 0, Math.PI * 2);
          ctx.fill();

          // Destello horizontal y vertical de convergencia cuántica
          const flareX = 36 * hitAlpha;
          const flareY = 24 * hitAlpha;
          ctx.strokeStyle = `rgba(224, 242, 254, ${0.96 * hitAlpha})`;
          ctx.lineWidth = 2.3 * hitAlpha;
          ctx.beginPath();
          ctx.moveTo(endX - flareX, endY);
          ctx.lineTo(endX + flareX, endY);
          ctx.moveTo(endX, endY - flareY);
          ctx.lineTo(endX, endY + flareY);
          ctx.stroke();

          // Mira romboidal holográfica que se calibra en el punto de convergencia
          const sightScale = 1 + (1 - Math.min(1, hitP * 2.2)) * 0.48;
          drawHolographicDiamondSight(
            endX,
            endY,
            26 * sightScale,
            hitAlpha
          );
        } else if (isPhasePrisonSkill) {
          // ===================================================================
          // [2] PRISIÓN DE FASE: Líneas verticales de arriba hacia abajo +
          // micro-desfase horizontal del enemigo mostrando su intento de resistir
          // ===================================================================
          const enemyTop = targetCenterY - targetHeight * 0.48;
          const enemyLeft = targetCenterX - targetWidth * 0.5;

          // Estela minúscula horizontal del sprite enemigo intentando resistir la contención
          if (
            targetImg &&
            targetImg.complete &&
            targetImg.naturalWidth > 0
          ) {
            const resistJitterX = Math.sin(hitElapsed * 0.065) * 4.0;
            ctx.save();
            ctx.globalAlpha = 0.25 * hitAlpha;
            ctx.filter = 'blur(1px) saturate(0.35) hue-rotate(15deg)';
            // Invertido en X igual que el sprite enemigo en la arena (scale-x-[-1])
            ctx.translate(enemyLeft + targetWidth + resistJitterX, enemyTop);
            ctx.scale(-1, 1);
            ctx.drawImage(targetImg, 0, 0, targetWidth, targetHeight);
            ctx.restore();
          }

          // Líneas verticales de contención que caen de arriba hacia abajo sobre el enemigo
          verticalPhaseLines.forEach((vln) => {
            const localP = (hitP * 1.45 - vln.phaseOffset) / 0.68;
            if (localP <= 0 || localP >= 1) return;
            const lineAlpha = Math.sin(localP * Math.PI) * hitAlpha;
            const xPos = targetCenterX + vln.xRatio * targetWidth * 0.86;
            const spanH = targetHeight * vln.heightRatio;
            // Desplazamiento vertical de arriba hacia abajo
            const sweepY = (localP - 0.5) * targetHeight * 0.38;
            const yStart = targetCenterY - spanH * 0.5 + sweepY;
            const yEnd = targetCenterY + spanH * 0.5 + sweepY;

            const vGrad = ctx.createLinearGradient(xPos, yStart, xPos, yEnd);
            vGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
            vGrad.addColorStop(0.22, `rgba(56, 189, 248, ${0.88 * lineAlpha})`);
            vGrad.addColorStop(0.5, `rgba(224, 242, 254, ${0.98 * lineAlpha})`);
            vGrad.addColorStop(0.78, `rgba(129, 140, 248, ${0.88 * lineAlpha})`);
            vGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');

            ctx.strokeStyle = vGrad;
            ctx.lineWidth = vln.thickness;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(xPos, yStart);
            ctx.lineTo(xPos, yEnd);
            ctx.stroke();
          });
        }
      }

      if (elapsed < TOTAL_MS) {
        rafId = requestAnimationFrame(renderCygnusFrame);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    rafId = requestAnimationFrame(renderCygnusFrame);
    return () => cancelAnimationFrame(rafId);
  }, [action]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full z-25"
    />
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
  onRestartIncursion,
  onAdvanceNextPlanet,
  nextPlanetName,
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

  // Referencias DOM para medir al subpíxel las armas del Héroe y el cuerpo del enemigo en mira
  const arenaCanvasContainerRef = useRef<HTMLDivElement | null>(null);
  const heroSpriteImgRef = useRef<HTMLImageElement | null>(null);
  const enemySpriteImgRefs = useRef<Record<string, HTMLImageElement | null>>({});

  // Estado de los efectos de riel balístico de Valari y su cinemática de apuntado/retroceso diferenciada por disparo
  const [valariBasicShot, setValariBasicShot] = useState<ValariBasicShotTrigger | null>(null);
  const [valariRecoilStage, setValariRecoilStage] = useState<
    | 'idle'
    | 'aim_basic'
    | 'aim_control'
    | 'aim_heavy'
    | 'kick_basic'
    | 'kick_control'
    | 'kick_heavy'
    | 'recover_basic'
    | 'recover_control'
    | 'recover_heavy'
  >('idle');

  // Estado de los efectos bio-lumínicos de Skithid (carga progresiva en filos + cortes dobles + esquiva sináptica)
  const [skithidActionVfx, setSkithidActionVfx] = useState<SkithidActionTrigger | null>(null);
  const [skithidLungeStage, setSkithidLungeStage] = useState<
    | 'idle'
    | 'charge_blade'
    | 'lunge_basic'
    | 'lunge_heavy'
    | 'recover'
    | 'synaptic_evade'
  >('idle');

  // Estado de los efectos fotónicos y de fase de Cygnus (carga en antebrazo, haz lineal, haz convergente, prisión de fase y recarga hexagonal)
  const [cygnusActionVfx, setCygnusActionVfx] = useState<CygnusActionTrigger | null>(null);
  const [cygnusStanceStage, setCygnusStanceStage] = useState<
    'idle' | 'charge_forearm' | 'fire_pulse' | 'recover'
  >('idle');

  const pendingPlayerActionRef = useRef<HeroActionKind | null>(null);
  const hasTriggeredPlayerTurnVfxRef = useRef<boolean>(false);
  const valariTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const skithidTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cygnusTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const shotCounterRef = useRef<number>(0);

  const clearValariStageTimers = useCallback(() => {
    valariTimersRef.current.forEach((t) => clearTimeout(t));
    valariTimersRef.current = [];
  }, []);

  const clearSkithidStageTimers = useCallback(() => {
    skithidTimersRef.current.forEach((t) => clearTimeout(t));
    skithidTimersRef.current = [];
  }, []);

  const clearCygnusStageTimers = useCallback(() => {
    cygnusTimersRef.current.forEach((t) => clearTimeout(t));
    cygnusTimersRef.current = [];
  }, []);

  // Limpieza segura de todos los timers de etapas de animación al desmontar CombatView (evita fugas de memoria al salir con ESC)
  useEffect(() => {
    return () => {
      clearValariStageTimers();
      clearSkithidStageTimers();
      clearCygnusStageTimers();
    };
  }, [clearValariStageTimers, clearSkithidStageTimers, clearCygnusStageTimers]);

  const triggerValariShotVfx = useCallback(
    (kind: ValariShotKind, targetUnitId: string | null) => {
      if (currentFaction.id !== 'valari') return;
      const arenaEl = arenaCanvasContainerRef.current;
      const heroEl = heroSpriteImgRef.current;
      if (!arenaEl || !heroEl) return;

      clearValariStageTimers();

      const arenaRect = arenaEl.getBoundingClientRect();
      const heroRect = heroEl.getBoundingClientRect();
      const speedScale = 1 / Math.pow(Math.max(1, combatSpeed), 0.65);

      // Punto exacto donde termina el cañón del rifle en hero-cb-valari.png
      const startX =
        heroRect.left -
        arenaRect.left +
        heroRect.width * VALARI_RIFLE_MUZZLE_X_RATIO;
      const startY =
        heroRect.top -
        arenaRect.top +
        heroRect.height * VALARI_RIFLE_MUZZLE_Y_RATIO;

      const heroLeft = heroRect.left - arenaRect.left;
      const heroTop = heroRect.top - arenaRect.top;
      const heroCenterX = heroLeft + heroRect.width * 0.46;
      const heroTopY = heroTop;
      const heroBottomY = heroTopY + heroRect.height;

      if (kind === 'skill_3') {
        shotCounterRef.current += 1;
        setValariBasicShot({
          id: shotCounterRef.current,
          kind: 'skill_3',
          startX,
          startY,
          endX: startX,
          endY: startY,
          heroLeft,
          heroTop,
          heroCenterX,
          heroTopY,
          heroBottomY,
          heroWidth: heroRect.width,
          heroHeight: heroRect.height,
          speedMultiplier: combatSpeed,
          heroImg: heroEl,
        });
        return;
      }

      const targetEl = targetUnitId
        ? enemySpriteImgRefs.current[targetUnitId]
        : null;
      const targetRect = targetEl ? targetEl.getBoundingClientRect() : null;

      // Posición horizontal del enemigo en mira, manteniendo la altura 100% recta (endY = startY)
      const endX = targetRect
        ? targetRect.left - arenaRect.left + targetRect.width * 0.44
        : startX + arenaRect.width * 0.48;

      shotCounterRef.current += 1;
      setValariBasicShot({
        id: shotCounterRef.current,
        kind,
        startX,
        startY,
        endX,
        endY: startY,
        heroLeft,
        heroTop,
        heroCenterX,
        heroTopY,
        heroBottomY,
        heroWidth: heroRect.width,
        heroHeight: heroRect.height,
        speedMultiplier: combatSpeed,
        heroImg: heroEl,
      });

      // Tiempos de carga (apuntado) y retroceso escalados según la velocidad de combate (x1, x2, x3)
      const chargeDelay = Math.round(
        (kind === 'skill_1' ? 240 : kind === 'skill_2' ? 140 : 70) * speedScale
      );
      const kickHold = Math.round(
        (kind === 'skill_1' ? 195 : kind === 'skill_2' ? 150 : 100) * speedScale
      );
      const recoverHold = Math.round(
        (kind === 'skill_1' ? 440 : kind === 'skill_2' ? 340 : 220) * speedScale
      );

      const aimStage =
        kind === 'skill_1'
          ? 'aim_heavy'
          : kind === 'skill_2'
            ? 'aim_control'
            : 'aim_basic';
      const kickStage =
        kind === 'skill_1'
          ? 'kick_heavy'
          : kind === 'skill_2'
            ? 'kick_control'
            : 'kick_basic';
      const recoverStage =
        kind === 'skill_1'
          ? 'recover_heavy'
          : kind === 'skill_2'
            ? 'recover_control'
            : 'recover_basic';

      setValariRecoilStage(aimStage);
      const tKick = setTimeout(() => {
        setValariRecoilStage(kickStage);
      }, chargeDelay);
      const tRecover = setTimeout(() => {
        setValariRecoilStage(recoverStage);
      }, chargeDelay + kickHold);
      const tIdle = setTimeout(() => {
        setValariRecoilStage('idle');
      }, chargeDelay + kickHold + recoverHold);

      valariTimersRef.current = [tKick, tRecover, tIdle];
    },
    [clearValariStageTimers, combatSpeed, currentFaction.id]
  );

  const triggerSkithidActionVfx = useCallback(
    (kind: HeroActionKind, targetUnitId: string | null) => {
      if (currentFaction.id !== 'skithid') return;
      const arenaEl = arenaCanvasContainerRef.current;
      const heroEl = heroSpriteImgRef.current;
      if (!arenaEl || !heroEl) return;

      clearSkithidStageTimers();

      const arenaRect = arenaEl.getBoundingClientRect();
      const heroRect = heroEl.getBoundingClientRect();
      const speedScale = 1 / Math.pow(Math.max(1, combatSpeed), 0.65);

      const heroLeft = heroRect.left - arenaRect.left;
      const heroTop = heroRect.top - arenaRect.top;

      const targetEl = targetUnitId
        ? enemySpriteImgRefs.current[targetUnitId]
        : null;
      const targetRect = targetEl ? targetEl.getBoundingClientRect() : null;

      const targetCenterX = targetRect
        ? targetRect.left - arenaRect.left + targetRect.width * 0.48
        : heroLeft + arenaRect.width * 0.52;
      const targetCenterY = targetRect
        ? targetRect.top - arenaRect.top + targetRect.height * 0.52
        : heroTop + heroRect.height * 0.55;
      const targetWidth = targetRect ? targetRect.width : 140;
      const targetHeight = targetRect ? targetRect.height : 140;

      shotCounterRef.current += 1;
      setSkithidActionVfx({
        id: shotCounterRef.current,
        kind,
        heroLeft,
        heroTop,
        heroWidth: heroRect.width,
        heroHeight: heroRect.height,
        targetCenterX,
        targetCenterY,
        targetWidth,
        targetHeight,
        speedMultiplier: combatSpeed,
        heroImg: heroEl,
      });

      if (kind === 'skill_3') {
        // [3] Regeneración: Vaivén horizontal milimétrico + desvanecimiento rápido de velocidad en el lugar
        setSkithidLungeStage('synaptic_evade');
        const tEndEvade = setTimeout(() => {
          setSkithidLungeStage('idle');
        }, Math.round(640 * speedScale));
        skithidTimersRef.current = [tEndEvade];
        return;
      }

      // Primero ilumina progresivamente los píxeles de las guadañas y luego embiste hacia adelante
      const bladeChargeMs = Math.round(
        (kind === 'skill_1' ? 370 : kind === 'skill_2' ? 330 : 280) * speedScale
      );
      const lungeHoldMs = Math.round(185 * speedScale);
      const recoverHoldMs = Math.round(230 * speedScale);
      const lungeType = kind === 'skill_1' ? 'lunge_heavy' : 'lunge_basic';

      setSkithidLungeStage('charge_blade');
      const tLunge = setTimeout(() => {
        setSkithidLungeStage(lungeType);
      }, bladeChargeMs);
      const tRecover = setTimeout(() => {
        setSkithidLungeStage('recover');
      }, bladeChargeMs + lungeHoldMs);
      const tIdle = setTimeout(() => {
        setSkithidLungeStage('idle');
      }, bladeChargeMs + lungeHoldMs + recoverHoldMs);

      skithidTimersRef.current = [tLunge, tRecover, tIdle];
    },
    [clearSkithidStageTimers, combatSpeed, currentFaction.id]
  );

  const triggerCygnusActionVfx = useCallback(
    (kind: HeroActionKind, targetUnitId: string | null) => {
      if (currentFaction.id !== 'cygnus') return;
      const arenaEl = arenaCanvasContainerRef.current;
      const heroEl = heroSpriteImgRef.current;
      if (!arenaEl || !heroEl) return;

      clearCygnusStageTimers();

      const arenaRect = arenaEl.getBoundingClientRect();
      const heroRect = heroEl.getBoundingClientRect();
      const speedScale = 1 / Math.pow(Math.max(1, combatSpeed), 0.65);

      const heroLeft = heroRect.left - arenaRect.left;
      const heroTop = heroRect.top - arenaRect.top;

      const targetEl = targetUnitId
        ? enemySpriteImgRefs.current[targetUnitId]
        : null;
      const targetRect = targetEl ? targetEl.getBoundingClientRect() : null;

      const targetCenterX = targetRect
        ? targetRect.left - arenaRect.left + targetRect.width * 0.48
        : heroLeft + arenaRect.width * 0.52;
      const targetCenterY = targetRect
        ? targetRect.top - arenaRect.top + targetRect.height * 0.48
        : heroTop + heroRect.height * CYGNUS_FOREARM_LINE_Y_RATIO;
      const targetWidth = targetRect ? targetRect.width : 140;
      const targetHeight = targetRect ? targetRect.height : 140;

      shotCounterRef.current += 1;
      setCygnusActionVfx({
        id: shotCounterRef.current,
        kind,
        heroLeft,
        heroTop,
        heroWidth: heroRect.width,
        heroHeight: heroRect.height,
        targetCenterX,
        targetCenterY,
        targetWidth,
        targetHeight,
        speedMultiplier: combatSpeed,
        heroImg: heroEl,
        targetImg: targetEl,
      });

      if (kind === 'skill_3') {
        setCygnusStanceStage('idle');
        return;
      }

      const forearmChargeMs = Math.round(
        (kind === 'skill_1' ? 280 : kind === 'skill_2' ? 240 : 210) * speedScale
      );
      const fireHoldMs = Math.round(145 * speedScale);
      const recoverHoldMs = Math.round(210 * speedScale);

      setCygnusStanceStage('charge_forearm');
      const tFire = setTimeout(() => {
        setCygnusStanceStage('fire_pulse');
      }, forearmChargeMs);
      const tRecover = setTimeout(() => {
        setCygnusStanceStage('recover');
      }, forearmChargeMs + fireHoldMs);
      const tIdle = setTimeout(() => {
        setCygnusStanceStage('idle');
      }, forearmChargeMs + fireHoldMs + recoverHoldMs);

      cygnusTimersRef.current = [tFire, tRecover, tIdle];
    },
    [clearCygnusStageTimers, combatSpeed, currentFaction.id]
  );

  const handleBasicAttackTrigger = useCallback(() => {
    pendingPlayerActionRef.current = 'basic';
    onBasicAttack();
  }, [onBasicAttack]);

  const handleSkillTrigger = useCallback(
    (slotIndex: 1 | 2 | 3 | 4) => {
      pendingPlayerActionRef.current =
        slotIndex === 1
          ? 'skill_1'
          : slotIndex === 2
            ? 'skill_2'
            : slotIndex === 3
              ? 'skill_3'
              : 'basic';
      onUseSkill(slotIndex);
    },
    [onUseSkill]
  );

  // Detectar acción de Valari, Skithid o Cygnus EXACTAMENTE UNA VEZ por turno del jugador
  useEffect(() => {
    if (activeActorId !== 'player') {
      hasTriggeredPlayerTurnVfxRef.current = false;
      pendingPlayerActionRef.current = null;
      return;
    }

    if (hasTriggeredPlayerTurnVfxRef.current) {
      return;
    }

    hasTriggeredPlayerTurnVfxRef.current = true;

    if (hitTargetId === null) {
      // Habilidad [3] de soporte/restauración sobre el propio Comandante
      if (currentFaction.id === 'valari') {
        triggerValariShotVfx('skill_3', null);
      } else if (currentFaction.id === 'skithid') {
        triggerSkithidActionVfx('skill_3', null);
      } else {
        triggerCygnusActionVfx('skill_3', null);
      }
      pendingPlayerActionRef.current = null;
    } else if (hitTargetId !== 'player') {
      let resolvedKind: HeroActionKind = 'basic';
      if (pendingPlayerActionRef.current) {
        resolvedKind = pendingPlayerActionRef.current;
      } else if (isAutoCombat) {
        // En AUTO IA, la habilidad recién ejecutada acaba de entrar en cooldown máximo
        const ctrlSkill = equippedSkills.find((s) => s.slotIndex === 2);
        const dmgSkill = equippedSkills.find((s) => s.slotIndex === 1);
        if (
          ctrlSkill &&
          ctrlSkill.currentCooldown === ctrlSkill.cooldownTurns &&
          ctrlSkill.cooldownTurns > 0
        ) {
          resolvedKind = 'skill_2';
        } else if (
          dmgSkill &&
          dmgSkill.currentCooldown === dmgSkill.cooldownTurns &&
          dmgSkill.cooldownTurns > 0
        ) {
          resolvedKind = 'skill_1';
        } else {
          resolvedKind = 'basic';
        }
      }
      if (currentFaction.id === 'valari') {
        triggerValariShotVfx(resolvedKind, hitTargetId);
      } else if (currentFaction.id === 'skithid') {
        triggerSkithidActionVfx(resolvedKind, hitTargetId);
      } else {
        triggerCygnusActionVfx(resolvedKind, hitTargetId);
      }
      pendingPlayerActionRef.current = null;
    }
  }, [
    activeActorId,
    currentFaction.id,
    equippedSkills,
    hitTargetId,
    isAutoCombat,
    triggerCygnusActionVfx,
    triggerSkithidActionVfx,
    triggerValariShotVfx,
  ]);

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
        handleBasicAttackTrigger();
      } else if (e.key === '1') {
        handleSkillTrigger(1);
      } else if (e.key === '2') {
        handleSkillTrigger(2);
      } else if (e.key === '3') {
        handleSkillTrigger(3);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleBasicAttackTrigger,
    handleSkillTrigger,
    isPlayerTurnReady,
    onReturnToCitadel,
    onToggleAutoCombat,
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
        <div
          ref={arenaCanvasContainerRef}
          className="relative isolate w-full aspect-[1672/935] bg-[#070a10] border border-white/12 rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
            <img
              src={activeStage.arenaUrl}
              alt="Escenario Táctico de la Arena"
              className="w-full h-full object-fill select-none pointer-events-none block"
              draggable={false}
            />
          </div>

          {/* CAPA BALÍSTICA DE PRECISIÓN VALARI */}
          {currentFaction.id === 'valari' && (
            <ValariBasicShotVfxCanvas shot={valariBasicShot} />
          )}

          {/* CAPA BIO-LUMÍNICA DE FILOS Y CORTES SKITHID */}
          {currentFaction.id === 'skithid' && (
            <SkithidCombatVfxCanvas action={skithidActionVfx} />
          )}

          {/* CAPA FOTÓNICA Y DE FASE CYGNUS */}
          {currentFaction.id === 'cygnus' && (
            <CygnusCombatVfxCanvas action={cygnusActionVfx} />
          )}

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

              {isPlayerSupportCast &&
                currentFaction.id !== 'valari' &&
                currentFaction.id !== 'skithid' &&
                currentFaction.id !== 'cygnus' && (
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
                  currentFaction.id === 'valari'
                    ? valariRecoilStage === 'aim_heavy'
                      ? 'duration-200 ease-out -translate-x-3 translate-y-[1px] -rotate-[0.8deg]'
                      : valariRecoilStage === 'aim_control'
                        ? 'duration-125 ease-out -translate-x-2 translate-y-[0.5px] -rotate-[0.45deg]'
                        : valariRecoilStage === 'aim_basic'
                          ? 'duration-55 ease-out -translate-x-1 translate-y-[0.5px] -rotate-[0.25deg]'
                          : valariRecoilStage === 'kick_heavy'
                            ? 'duration-90 ease-out -translate-x-8 -translate-y-1 -rotate-[2.4deg]'
                            : valariRecoilStage === 'kick_control'
                              ? 'duration-80 ease-out -translate-x-5 -translate-y-0.5 -rotate-[1.35deg]'
                              : valariRecoilStage === 'kick_basic'
                                ? 'duration-65 ease-out -translate-x-3 -translate-y-0.5 -rotate-[0.8deg]'
                                : valariRecoilStage === 'recover_heavy'
                                  ? 'duration-420 ease-out translate-x-0 translate-y-0 rotate-0'
                                  : valariRecoilStage === 'recover_control'
                                    ? 'duration-310 ease-out translate-x-0 translate-y-0 rotate-0'
                                    : valariRecoilStage === 'recover_basic'
                                      ? 'duration-210 ease-out translate-x-0 translate-y-0 rotate-0'
                                      : isPlayerHit
                                        ? 'duration-150 ease-out -translate-x-7 translate-y-0.5 brightness-115'
                                        : 'duration-200 ease-out'
                    : currentFaction.id === 'skithid'
                      ? skithidLungeStage === 'synaptic_evade'
                        ? 'animate-skithid-synaptic-evade'
                        : skithidLungeStage === 'charge_blade'
                          ? 'duration-240 ease-out -translate-x-2.5 translate-y-0.5'
                          : skithidLungeStage === 'lunge_heavy'
                            ? 'duration-140 ease-out translate-x-16 -translate-y-1.5'
                            : skithidLungeStage === 'lunge_basic'
                              ? 'duration-130 ease-out translate-x-12 -translate-y-1'
                              : skithidLungeStage === 'recover'
                                ? 'duration-240 ease-out translate-x-0 translate-y-0'
                                : isPlayerHit
                                  ? actingEnemyMotion.playerHitReactionClass
                                  : 'duration-200 ease-out'
                      : cygnusStanceStage === 'charge_forearm'
                        ? 'duration-200 ease-out translate-x-1'
                        : cygnusStanceStage === 'fire_pulse'
                          ? 'duration-90 ease-out -translate-x-2.5 -rotate-[0.45deg]'
                          : cygnusStanceStage === 'recover'
                            ? 'duration-210 ease-out translate-x-0 rotate-0'
                            : isPlayerHit
                              ? actingEnemyMotion.playerHitReactionClass
                              : 'duration-200 ease-out'
                }`}
              >
                {/* Sombra suave en el suelo que acompaña el movimiento de los pies (sin círculo oscuro fijo) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-[82%] h-4 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.48)_0%,rgba(0,0,0,0.22)_48%,transparent_75%)] blur-[4px] z-0"
                />
                <img
                  ref={heroSpriteImgRef}
                  src={playerSpriteSrc}
                  alt={playerName}
                  className="relative z-10 w-auto h-auto max-h-[420px] object-contain select-none pointer-events-none block drop-shadow-[0_0_4px_rgba(0,0,0,0.55)]"
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
              const isCygnusPhaseTrapped =
                !isDead &&
                currentFaction.id === 'cygnus' &&
                unit.stunnedTurns > 0;
              const isCygnusIlluminated =
                !isDead && (unit.illuminatedTurns || 0) > 0;
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
                        ) : (unit.neurotoxinTurns || 0) > 0 ? (
                          <span className="px-1 py-0.2 rounded bg-emerald-950/95 border border-lime-400/80 font-mono text-[9px] font-bold text-lime-300 shadow-[0_2px_6px_rgba(34,197,94,0.45)]">
                            NEUROTOXINA
                          </span>
                        ) : isCygnusPhaseTrapped ? (
                          <span className="px-1 py-0.2 rounded bg-sky-950/95 border border-sky-400/80 font-mono text-[9px] font-bold text-sky-200 shadow-[0_2px_6px_rgba(56,189,248,0.45)]">
                            PRISIÓN DE FASE
                          </span>
                        ) : unit.stunnedTurns > 0 ? (
                          <span className="px-1 py-0.2 rounded bg-black/90 border border-amber-400/75 font-mono text-[9px] font-bold text-amber-300 shadow-[0_2px_4px_#000]">
                            SUPRIMIDO
                          </span>
                        ) : isCygnusIlluminated ? (
                          <span className="px-1 py-0.2 rounded bg-indigo-950/95 border border-sky-400/80 font-mono text-[9px] font-bold text-sky-200 shadow-[0_2px_6px_rgba(56,189,248,0.45)]">
                            FIJADO
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

                  {isHit &&
                    currentFaction.id !== 'valari' &&
                    currentFaction.id !== 'skithid' &&
                    currentFaction.id !== 'cygnus' && (
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

                  {/* Movimiento de ataque hacia adelante (sin agrandarse), o micro-vibración horizontal si está en Prisión de Fase Cygnus */}
                  <div
                    className={`w-auto h-auto flex items-end justify-center relative z-10 transition-transform ${
                      isCygnusPhaseTrapped
                        ? 'animate-cygnus-phase-resist'
                        : isActing
                          ? `${unitMotion.durationClass} ${unitMotion.lungeTransformClass}`
                          : isHit
                            ? 'duration-150 ease-out translate-x-3.5 brightness-125'
                            : 'duration-200 ease-out'
                    }`}
                  >
                    {/* Sombra suave en el suelo que acompaña el movimiento de los pies (sin círculo oscuro fijo) */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-[82%] h-4 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.48)_0%,rgba(0,0,0,0.22)_48%,transparent_75%)] blur-[4px] z-0"
                    />
                    <img
                      ref={(el) => {
                        enemySpriteImgRefs.current[unit.instanceId] = el;
                      }}
                      src={unitSprite}
                      alt={unit.name}
                      className={`relative z-10 w-auto h-auto max-h-[420px] object-contain select-none scale-x-[-1] pointer-events-none block transition-all duration-300 ${
                        isCygnusPhaseTrapped
                          ? 'opacity-72 saturate-[0.38] brightness-110 hue-rotate-[15deg] drop-shadow-[0_0_8px_rgba(56,189,248,0.65)]'
                          : !isDead &&
                              ((unit.neurotoxinTurns || 0) > 0 ||
                                (currentFaction.id === 'skithid' && unit.stunnedTurns > 0))
                            ? 'sepia-[0.26] hue-rotate-[66deg] saturate-[1.55] drop-shadow-[0_0_8px_rgba(34,197,94,0.68)]'
                            : !isDead &&
                                currentFaction.id === 'skithid' &&
                                (unit.corrosiveStacks || 0) > 0
                              ? 'sepia-[0.14] hue-rotate-[60deg] saturate-[1.28] drop-shadow-[0_0_5px_rgba(132,204,22,0.45)]'
                              : 'drop-shadow-[0_0_4px_rgba(0,0,0,0.55)]'
                      }`}
                      draggable={false}
                    />

                    {/* MARCA / DoT PERSISTENTE EN EL SPRITE ENEMIGO MIENTRAS DURE LA NEUROTOXINA */}
                    {!isDead &&
                      ((unit.neurotoxinTurns || 0) > 0 ||
                        (currentFaction.id === 'skithid' && unit.stunnedTurns > 0)) && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center animate-neurotoxin-pulse"
                        >
                          <div className="relative w-[78%] h-[68%] flex flex-col items-center justify-around">
                            <div className="w-full h-3.5 rounded-[100%] border-2 border-lime-400/80 bg-emerald-500/15 shadow-[0_0_12px_rgba(163,230,53,0.75)]" />
                            <div className="w-[84%] h-3 rounded-[100%] border-2 border-teal-300/80 bg-teal-400/15 shadow-[0_0_12px_rgba(45,212,191,0.75)]" />
                            <span className="w-2.5 h-2.5 rounded-full bg-lime-300 shadow-[0_0_10px_#a3e635]" />
                          </div>
                        </div>
                      )}

                    {/* MIRA HOLOGRÁFICA CYGNUS PERSISTENTE MIENTRAS EL ENEMIGO ESTÉ FIJADO (ANCLADA DESDE EL EXTREMO SUPERIOR DEL SPRITE) */}
                    {isCygnusIlluminated && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-25 flex items-center justify-center animate-cygnus-target-lock"
                      >
                        <svg
                          viewBox="0 0 64 64"
                          className="w-14 h-14 sm:w-16 sm:h-16 overflow-visible drop-shadow-[0_0_10px_rgba(56,189,248,0.85)]"
                        >
                          {/* Relleno interior romboidal azul-violeta translúcido */}
                          <polygon
                            points="32,12 52,32 32,52 12,32"
                            fill="rgba(99, 102, 241, 0.28)"
                            stroke="rgba(165, 180, 252, 0.85)"
                            strokeWidth="1.3"
                          />
                          {/* Rombo exterior cian holográfico principal */}
                          <polygon
                            points="32,6 58,32 32,58 6,32"
                            fill="none"
                            stroke="#38BDF8"
                            strokeWidth="1.9"
                          />
                          {/* Muecas de calibración en vértices superior e inferior */}
                          <polyline
                            points="27,4 32,0 37,4"
                            fill="none"
                            stroke="#E0F2FE"
                            strokeWidth="1.4"
                          />
                          <polyline
                            points="27,60 32,64 37,60"
                            fill="none"
                            stroke="#E0F2FE"
                            strokeWidth="1.4"
                          />
                          {/* Punto focal central */}
                          <circle cx="32" cy="32" r="2.2" fill="#E0F2FE" />
                        </svg>
                      </div>
                    )}

                    {/* LÍNEAS VERTICALES DE CONTENCIÓN PERSISTENTES MIENTRAS EL ENEMIGO ESTÉ EN PRISIÓN DE FASE CYGNUS */}
                    {isCygnusPhaseTrapped && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-[8%] inset-y-[4%] z-22 flex items-stretch justify-between"
                      >
                        {[0, 1, 2, 3, 4, 5, 6].map((lineIdx) => (
                          <span
                            key={lineIdx}
                            className={`w-[2px] h-full rounded-full bg-gradient-to-b from-transparent via-sky-300/90 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.85)] ${
                              lineIdx % 2 === 0 ? 'opacity-95' : 'opacity-65 scale-y-90'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* =================================================================
              CAPA 25: HUD SUPERIOR
              - Barras superiores a izquierda y derecha.
              - Centro: Módulo ortogonal unificado de Secuencia de Turnos (ranuras 64x64px sin bordes internos sobrantes)
                con el Botín de Incursión anclado directamente a su borde inferior como extensión natural,
                y líneas futuristas con gradiente lineal del color de facción hacia ambos lados.
             ================================================================= */}
          <div className="absolute top-0 inset-x-0 w-full pointer-events-none z-25">
            <div className="relative z-25 w-full px-6 pt-4 pb-5 flex items-start justify-between gap-2 bg-gradient-to-b from-[#04070e]/90 via-[#04070e]/45 to-transparent">
              {/* IZQUIERDA: HÉROE (BARRAS SUPERIORES + DEBUFFS/BUFFS) */}
              <div
                className={`w-[34%] max-w-[430px] shrink-0 flex flex-col gap-1.5 ${
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

              {/* LÍNEA FUTURISTA IZQUIERDA: SALE DESDE SECUENCIA DE TURNOS Y SE DESVANECE ANTES DE TOCAR LA BARRA DEL JUGADOR */}
              <div
                aria-hidden="true"
                className="hidden md:flex flex-1 items-center justify-end pl-5 pr-0 pt-[38px] pointer-events-none select-none"
              >
                <div className={`w-full h-[1.5px] rounded-full ${theme.hudLineLeftClass}`} />
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme.hudNodeDotClass}`} />
              </div>

              {/* CENTRO: MÓDULO ORTOGONAL UNIFICADO (SECUENCIA DE TURNOS 64x64px + BOTÍN DE INCURSIÓN ANCLADO AL BORDE INFERIOR) */}
              <div className="relative flex flex-col items-center gap-1 pointer-events-auto shrink-0">
                <span
                  className={`font-mono text-[10px] font-extrabold uppercase tracking-[0.22em] ${theme.readyTag} ${ARENA_TEXT_OUTLINE}`}
                >
                  SECUENCIA DE TURNOS
                </span>

                {/* Contenedor ortogonal unificado sin bordes inclinados */}
                <div className="relative flex flex-col items-stretch rounded-xl bg-[#060a12]/95 border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.92)]">
                  {/* Parte superior: retratos 64x64px (w-16 h-16) ocupando todo el espacio sin borde interior sobrante */}
                  <div className="flex items-center justify-center gap-2.5 px-3 py-2">
                    {turnQueue.map((item, idx) => {
                      const isCurrentTurn = idx === 0;
                      const isTargetedEnemy =
                        !item.isPlayer && item.actorId === activeTargetUnit?.instanceId;

                      const slotBorderClass = item.isPlayer
                        ? isCurrentTurn
                          ? `${theme.portraitBorder}`
                          : 'border-emerald-500/45'
                        : isCurrentTurn
                          ? 'border-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.45)]'
                          : isTargetedEnemy
                            ? 'border-rose-400/80 hover:border-rose-300'
                            : 'border-white/20 hover:border-rose-400/60';

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
                            className={`relative z-10 w-16 h-16 p-0 rounded-lg border bg-[#070b12] overflow-visible transition-all duration-200 shrink-0 group ${slotBorderClass} ${
                              isCurrentTurn ? 'opacity-100' : 'opacity-90 hover:opacity-100'
                            } ${item.isPlayer ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}
                          >
                            {/* El retrato independiente de 128x128px (/assets/turnos/*.jpg) ocupa el 100% de los 64x64px sin recorte ni inversión CSS */}
                            <div className="relative w-full h-full rounded-[7px] overflow-hidden bg-[#070b12]">
                              <img
                                src={item.portraitUrl}
                                alt={item.name}
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  if (target.dataset.fallbackApplied) return;
                                  target.dataset.fallbackApplied = 'true';
                                  if (target.src.endsWith('.jpg')) {
                                    target.src = target.src.replace(/\.jpg$/, '.png');
                                  }
                                }}
                                className={`w-full h-full object-cover object-center select-none pointer-events-none ${
                                  item.stunned || item.broken ? 'grayscale opacity-50' : ''
                                }`}
                                draggable={false}
                              />

                              {/* Barra superior de facción / hostil integrada al filo superior */}
                              <div
                                className={`pointer-events-none absolute top-0 inset-x-0 h-[2.5px] z-20 ${topAccentBarClass}`}
                              />

                              {/* Indicador de 5 segmentos integrado en la base de los 64x64px */}
                              <div className="pointer-events-none absolute bottom-0 inset-x-0 pt-2 pb-1 px-1.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-20 grid grid-cols-5 gap-[2px]">
                                {[0, 1, 2, 3, 4].map((seg) => (
                                  <div
                                    key={seg}
                                    className={`h-[3px] rounded-[1px] ${
                                      isCurrentTurn ? bottomSegBarClass : 'bg-white/25'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Insignia de intención o número de turno en esquina superior derecha */}
                            {!item.isPlayer &&
                            !item.stunned &&
                            !item.broken &&
                            item.intent === 'heavy' ? (
                              <span className="absolute -top-1.5 -right-1.5 z-30 px-1.5 py-0.5 rounded bg-amber-500 border border-black text-black font-mono text-[10px] font-black leading-none shadow-[0_2px_6px_#000]">
                                !
                              </span>
                            ) : !item.isPlayer &&
                              !item.stunned &&
                              !item.broken &&
                              item.intent === 'fortify' ? (
                              <span className="absolute -top-1.5 -right-1.5 z-30 p-0.5 rounded bg-cyan-400 border border-black text-black flex items-center justify-center shadow-[0_2px_6px_#000]">
                                <Shield className="w-2.5 h-2.5" />
                              </span>
                            ) : (
                              <span
                                className={`absolute -top-1.5 -right-1.5 z-30 px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold leading-none shadow ${
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
                              <div className="h-9 w-[1px] bg-white/15" />
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Parte inferior: BOTÍN DE INCURSIÓN anclado directamente al borde del contenedor de Secuencia de Turnos */}
                  <div className="relative z-30 flex items-center justify-between border-t border-white/15 bg-[#04070d]/95 rounded-b-xl px-2.5 py-1">
                    <button
                      type="button"
                      onClick={() => setIsLootPanelCollapsed(!isLootPanelCollapsed)}
                      title={
                        isLootPanelCollapsed
                          ? 'Mostrar detalle de Botín de Incursión'
                          : 'Ocultar detalle de Botín de Incursión'
                      }
                      className="flex-1 flex items-center justify-center gap-2 py-0.5 cursor-pointer group active:scale-[0.99] transition-transform"
                    >
                      <div className="relative flex items-center justify-center">
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

                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-200 group-hover:text-white whitespace-nowrap">
                        Botín de Incursión
                      </span>

                      {hasLootInfo && (
                        <span className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-400/50 font-mono text-[10px] font-extrabold text-amber-300 tabular-nums">
                          <span>+{(sessionLoot?.credits || 0).toLocaleString('es-ES')} ₡</span>
                          {totalLootItemsCount > 0 && (
                            <span className={`${theme.readyTag}`}>· +{totalLootItemsCount}</span>
                          )}
                        </span>
                      )}

                      <div className="text-slate-400 group-hover:text-white transition-colors">
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
                        className="ml-1.5 p-1 rounded bg-white/5 border border-white/15 hover:border-white/35 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}

                    {/* Desplegable flotante de Botín de Incursión */}
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
                </div>

                <TutorialBeacon
                  stepNumber={1}
                  label="VISOR Y COLA DE TURNOS"
                  isActive={isTutorialActive}
                  factionId={currentFaction.id}
                />
              </div>

              {/* LÍNEA FUTURISTA DERECHA: SALE DESDE SECUENCIA DE TURNOS Y SE DESVANECE ANTES DE TOCAR LA BARRA ENEMIGA */}
              <div
                aria-hidden="true"
                className="hidden md:flex flex-1 items-center justify-start pl-0 pr-5 pt-[38px] pointer-events-none select-none"
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme.hudNodeDotClass}`} />
                <div className={`w-full h-[1.5px] rounded-full ${theme.hudLineRightClass}`} />
              </div>

              {/* DERECHA: OBJETIVO ACTIVO (BARRAS SUPERIORES + DEBUFFS) */}
              {activeTargetUnit && (
                <div
                  className={`w-[34%] max-w-[430px] shrink-0 flex flex-col items-end gap-1.5 ${
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
                    (activeTargetUnit.neurotoxinTurns || 0) > 0 ||
                    (activeTargetUnit.corrosiveStacks || 0) > 0 ||
                    (activeTargetUnit.shieldLockTurns || 0) > 0 ||
                    (activeTargetUnit.illuminatedTurns || 0) > 0) && (
                    <div className="flex flex-wrap items-center justify-end gap-1.5 pr-1 pt-0.5">
                      {activeTargetUnit.brokenTurns > 0 && (
                        <span className="px-2 py-0.5 rounded bg-amber-950/90 border border-amber-400/65 font-mono text-[11px] font-bold text-amber-300 tracking-wider shadow">
                          GUARDIA EN RUPTURA ({activeTargetUnit.brokenTurns}T)
                        </span>
                      )}
                      {(activeTargetUnit.neurotoxinTurns || 0) > 0 && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/95 border border-lime-400/75 font-mono text-[11px] font-bold text-lime-300 tracking-wider shadow">
                          NEUROTOXINA ({activeTargetUnit.neurotoxinTurns}T)
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
                  onClick={handleBasicAttackTrigger}
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
                      onClick={() => handleSkillTrigger(skill.slotIndex)}
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

        {/* PANEL DE DECISIÓN TÁCTICA AL COMPLETAR INCURSIÓN (OLEADA 3/3) */}
        {turnPhase === 'INCURSION_COMPLETE' && (
          <div className="absolute inset-0 z-50 bg-[#05080f]/82 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div
              className={`w-full max-w-xl bg-[#0a101b]/95 border-2 ${theme.dockBorder} rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.95)] flex flex-col gap-5`}
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex flex-col gap-1">
                  <span
                    className={`text-xs font-mono font-bold uppercase tracking-widest ${theme.accentText}`}
                  >
                    INCURSIÓN COMPLETADA · OLEADA {totalWaves}/{totalWaves} ASEGURADA
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white uppercase tracking-wide">
                    {currentLocation || 'Sector Asegurado'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    El perímetro hostil ha sido neutralizado. Selecciona la siguiente orden operativa para tu Comandante.
                  </p>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold shrink-0 ${theme.iconBox}`}
                >
                  VICTORIA TÁCTICA
                </div>
              </div>

              {/* Resumen del Botín Extraído en esta Incursión */}
              {sessionLoot && (sessionLoot.credits > 0 || sessionLoot.items.length > 0) && (
                <div className="bg-[#060a12]/90 border border-white/10 rounded-xl p-3.5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 uppercase tracking-wider font-semibold">
                      Botín Extraído en la Incursión
                    </span>
                    <span className="text-amber-300 font-bold flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5" />
                      +{sessionLoot.credits.toLocaleString('es-ES')} ₡
                    </span>
                  </div>
                  {sessionLoot.items.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
                      {sessionLoot.items.map((item) => (
                        <div
                          key={item.id}
                          className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5 text-xs font-mono text-slate-200"
                        >
                          {renderSciFiIcon(item.iconKey, 'w-3.5 h-3.5 text-slate-300')}
                          <span>{item.name}</span>
                          <span className="font-bold text-emerald-300">+{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3 Opciones de Decisión Post-Combate */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onRestartIncursion) {
                      onRestartIncursion();
                    }
                  }}
                  className="flex flex-col items-start justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/35 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-white font-display font-bold text-xs uppercase tracking-wider">
                    <RotateCcw className="w-4 h-4 text-slate-300 group-hover:rotate-[-45deg] transition-transform shrink-0" />
                    <span>Repetir Sector</span>
                  </div>
                  <span className="mt-2 text-[11px] font-mono text-slate-300 leading-snug">
                    Reiniciar Oleada 1/3 en {currentLocation || 'este mundo'}
                  </span>
                </button>

                {onAdvanceNextPlanet && nextPlanetName && (
                  <button
                    type="button"
                    onClick={onAdvanceNextPlanet}
                    className={`flex flex-col items-start justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer group ${theme.cardBg} hover:brightness-125`}
                  >
                    <div className="flex items-center gap-2 text-white font-display font-bold text-xs uppercase tracking-wider">
                      <FastForward className={`w-4 h-4 shrink-0 ${theme.accentText}`} />
                      <span>Siguiente Sector</span>
                    </div>
                    <span className={`mt-2 text-[11px] font-mono font-semibold leading-snug ${theme.accentText}`}>
                      Avanzar a {nextPlanetName}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onReturnToCitadel}
                  className="flex flex-col items-start justify-between p-3.5 rounded-xl bg-rose-950/35 hover:bg-rose-950/60 border border-rose-500/40 hover:border-rose-400/75 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-rose-100 font-display font-bold text-xs uppercase tracking-wider">
                    <LogOut className="w-4 h-4 text-rose-300 shrink-0" />
                    <span>Volver a la Base</span>
                  </div>
                  <span className="mt-2 text-[11px] font-mono text-rose-200/90 leading-snug">
                    Retornar al Mando Central e Instalaciones
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};