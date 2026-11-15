// src/components/CommanderView.tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Activity,
  Check,
  Clover,
  Cpu,
  Crosshair,
  Footprints,
  Hand,
  HardHat,
  HeartPulse,
  Hexagon,
  Pencil,
  Shield,
} from 'lucide-react';
import { useGameContext } from '../context/GameContext';
import {
  CHASSIS_ROMAN_NUMERALS,
  GAME_BALANCE,
} from '../data/factionIdentityCatalog';
import { GLOBAL_UI, getFactionTheme } from '../data/themeConfig';
import {
  ChassisQuality,
  FactionId,
  FactionInfo,
  HeroChassisItem,
  HeroChassisSlot,
  HeroLoadout,
} from '../types/game';
import { TutorialBeacon } from './OnboardingTutorialOverlay';

export interface CommanderViewProps {
  playerName: string;
  characterLevel: number;
  currentFaction: FactionInfo;
  heroLoadout: HeroLoadout;
  reactorLevel?: number;
  maxPlayerHp?: number;
  maxPlayerDefense?: number;
  playerAttackDmg?: number;
  onEquipSlot?: (slot: HeroChassisSlot) => void;
  onOpenForge?: () => void;
  isTutorialActive?: boolean;
}

interface FactionLimiterConfig {
  label: string;
  unit: string;
  maxCapacity: number;
  accent: string;
  bar: string;
  lineColor: string;
  lineActiveColor: string;
  glowColor: string;
  highlightCardClass: string;
  pinnedCardClass: string;
}

interface JointAnchor {
  /**
   * Coordenadas (0..100%) medidas directamente sobre el recuadro del sprite,
   * usando exactamente el mismo sistema de coordenadas que slotMasks.
   */
  spriteX: number;
  spriteY: number;
  /** Lado hacia donde conecta con la columna de tarjetas */
  targetSide: 'left' | 'right';
  /** Altura en el borde lateral del viewport central que coincide con la tarjeta */
  targetY: number;
}

interface FactionPedestalCalibration {
  /**
   * Ajuste vertical exacto (en px) del recuadro del sprite para compensar el margen
   * transparente interno de cada PNG (Valari 7.8%, Cygnus 3.8%, Skithid 1.1%)
   * y alinear las suelas/garras de las 3 facciones sobre el mismo plano de la base.
   */
  spriteMarginBottomPx: number;
  /** Posición X real (0..100% del recuadro del sprite) del centro de apoyo de cada pie */
  leftFootX: number;
  rightFootX: number;
  /** Altura exacta (en px desde la base del recuadro del sprite) donde apoya cada pie */
  leftFootBottomPx: number;
  rightFootBottomPx: number;
  footShadowWidthPct: number;
}

interface FactionBlueprintLayout {
  leftTopSlot: HeroChassisSlot;
  leftMidSlot: HeroChassisSlot;
  rightTopSlot: HeroChassisSlot;
  rightMidSlot: HeroChassisSlot;
  rightBotSlot: HeroChassisSlot;
  pedestal: FactionPedestalCalibration;
  callouts: Record<HeroChassisSlot, JointAnchor>;
  /** Máscaras de foco suave difuminado (radial-gradient) calibradas al sprite PNG de cada facción */
  slotMasks: Record<HeroChassisSlot, string>;
}

// Telemetría reactiva de chasis con Cygnus consolidado en Azul Eléctrico
const FACTION_LIMITERS: Record<FactionId, FactionLimiterConfig> = {
  valari: {
    label: 'ESTRÉS ESTRUCTURAL',
    unit: 't',
    maxCapacity: 100,
    accent: 'text-amber-400',
    bar: 'bg-amber-400',
    lineColor: 'rgba(245, 158, 11, 0.35)',
    lineActiveColor: '#FBBF24',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    highlightCardClass:
      'border-amber-400/90 ring-1 ring-amber-400/50 shadow-[0_0_24px_rgba(245,158,11,0.32)] bg-amber-950/40 -translate-y-0.5',
    pinnedCardClass:
      'border-amber-400/75 ring-1 ring-amber-400/35 shadow-[0_0_18px_rgba(245,158,11,0.24)] bg-amber-950/30',
  },
  skithid: {
    label: 'TENSIÓN SINÁPTICA',
    unit: 'µS',
    maxCapacity: 100,
    accent: 'text-emerald-400',
    bar: 'bg-emerald-400',
    lineColor: 'rgba(16, 185, 129, 0.35)',
    lineActiveColor: '#34D399',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    highlightCardClass:
      'border-emerald-400/90 ring-1 ring-emerald-400/50 shadow-[0_0_24px_rgba(16,185,129,0.32)] bg-emerald-950/40 -translate-y-0.5',
    pinnedCardClass:
      'border-emerald-400/75 ring-1 ring-emerald-400/35 shadow-[0_0_18px_rgba(16,185,129,0.24)] bg-emerald-950/30',
  },
  cygnus: {
    label: 'COHERENCIA DE FASE',
    unit: 'Q-Flux',
    maxCapacity: 100,
    accent: 'text-blue-400',
    bar: 'bg-blue-500',
    lineColor: 'rgba(59, 130, 246, 0.35)',
    lineActiveColor: '#60A5FA',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    highlightCardClass:
      'border-sky-400/90 ring-1 ring-sky-400/50 shadow-[0_0_24px_rgba(56,189,248,0.32)] bg-sky-950/40 -translate-y-0.5',
    pinnedCardClass:
      'border-sky-400/75 ring-1 ring-sky-400/35 shadow-[0_0_18px_rgba(56,189,248,0.24)] bg-sky-950/30',
  },
};

// Coordenadas sincronizadas en el mismo espacio 0..100% del sprite + calibración matemática de apoyo en base
const FACTION_LAYOUTS: Record<FactionId, FactionBlueprintLayout> = {
  valari: {
    leftTopSlot: 'chest',
    leftMidSlot: 'gloves',
    rightTopSlot: 'helmet',
    rightMidSlot: 'weapon',
    rightBotSlot: 'boots',
    pedestal: {
      // En hero-valari.png las botas terminan a 36.5px (izq) y 40.0px (der) del borde inferior del box:
      // bajamos -21px para que ambas botas pisen a 15.5px y 19.0px (centro exacto de la base de 6px..34px)
      spriteMarginBottomPx: -21,
      leftFootX: 16.5,
      rightFootX: 79,
      leftFootBottomPx: 35,
      rightFootBottomPx: 39,
      footShadowWidthPct: 18,
    },
    callouts: {
      chest: {
        spriteX: 28,
        spriteY: 29,
        targetSide: 'left',
        targetY: 13,
      },
      gloves: {
        spriteX: 24,
        spriteY: 33,
        targetSide: 'left',
        targetY: 57,
      },
      helmet: {
        spriteX: 48,
        spriteY: 16,
        targetSide: 'right',
        targetY: 13,
      },
      weapon: {
        spriteX: 74,
        spriteY: 26,
        targetSide: 'right',
        targetY: 57,
      },
      boots: {
        spriteX: 74,
        spriteY: 77,
        targetSide: 'right',
        targetY: 91,
      },
    },
    slotMasks: {
      helmet:
        'radial-gradient(ellipse 17% 13% at 43% 16%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.5) 72%, rgba(0,0,0,0) 100%)',
      chest:
        'radial-gradient(ellipse 23% 17% at 35% 30%, rgba(0,0,0,1) 48%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0) 100%)',
      gloves:
        'radial-gradient(ellipse 14% 12% at 41% 31%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%), radial-gradient(ellipse 14% 13% at 66% 32%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%), radial-gradient(ellipse 13% 12% at 24% 33%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
      weapon:
        'radial-gradient(ellipse 36% 10% at 66% 26%, rgba(0,0,0,1) 52%, rgba(0,0,0,0.5) 78%, rgba(0,0,0,0) 100%)',
      boots:
        'radial-gradient(ellipse 20% 24% at 24% 77%, rgba(0,0,0,1) 48%, rgba(0,0,0,0) 100%), radial-gradient(ellipse 22% 24% at 72% 77%, rgba(0,0,0,1) 48%, rgba(0,0,0,0) 100%)',
    },
  },
  skithid: {
    leftTopSlot: 'chest',
    leftMidSlot: 'gloves',
    rightTopSlot: 'helmet',
    rightMidSlot: 'weapon',
    rightBotSlot: 'boots',
    pedestal: {
      // Bajamos -6px para que la base completa de las 3 falanges entre en el eje central del disco
      // y las puntas delanteras curvas (a 9.1px y 14.5px) se aferren al plano sin recortarse
      spriteMarginBottomPx: -6,
      leftFootX: 27,
      rightFootX: 74,
      leftFootBottomPx: 18,
      rightFootBottomPx: 22,
      footShadowWidthPct: 18,
    },
    callouts: {
      chest: {
        spriteX: 38,
        spriteY: 29,
        targetSide: 'left',
        targetY: 13,
      },
      gloves: {
        spriteX: 24,
        spriteY: 43,
        targetSide: 'left',
        targetY: 57,
      },
      helmet: {
        spriteX: 57,
        spriteY: 14,
        targetSide: 'right',
        targetY: 13,
      },
      weapon: {
        spriteX: 83,
        spriteY: 65,
        targetSide: 'right',
        targetY: 57,
      },
      boots: {
        spriteX: 66,
        spriteY: 83,
        targetSide: 'right',
        targetY: 91,
      },
    },
    slotMasks: {
      helmet:
        'radial-gradient(ellipse 25% 15% at 50% 13%, rgba(0,0,0,1) 48%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0) 100%)',
      chest:
        'radial-gradient(ellipse 24% 16% at 48% 30%, rgba(0,0,0,1) 48%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0) 100%)',
      gloves:
        'radial-gradient(ellipse 14% 15% at 24% 43%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%), radial-gradient(ellipse 14% 15% at 73% 47%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)',
      weapon:
        'radial-gradient(ellipse 24% 18% at 35% 60%, rgba(0,0,0,1) 48%, rgba(0,0,0,0) 100%), radial-gradient(ellipse 18% 22% at 83% 68%, rgba(0,0,0,1) 48%, rgba(0,0,0,0) 100%)',
      boots:
        'radial-gradient(ellipse 19% 22% at 29% 83%, rgba(0,0,0,1) 48%, rgba(0,0,0,0) 100%), radial-gradient(ellipse 19% 22% at 64% 83%, rgba(0,0,0,1) 48%, rgba(0,0,0,0) 100%)',
    },
  },
  cygnus: {
    leftTopSlot: 'chest',
    leftMidSlot: 'gloves',
    rightTopSlot: 'helmet',
    rightMidSlot: 'weapon',
    rightBotSlot: 'boots',
    pedestal: {
      // Bajamos -12px (-3px extra) para que también la bota trasera en perspectiva asiente en el centro del disco
      spriteMarginBottomPx: -12,
      leftFootX: 21,
      rightFootX: 67,
      leftFootBottomPx: 22,
      rightFootBottomPx: 32,
      footShadowWidthPct: 16,
    },
    callouts: {
      chest: {
        spriteX: 35,
        spriteY: 29,
        targetSide: 'left',
        targetY: 13,
      },
      gloves: {
        spriteX: 18,
        spriteY: 43,
        targetSide: 'left',
        targetY: 57,
      },
      helmet: {
        spriteX: 52,
        spriteY: 14,
        targetSide: 'right',
        targetY: 13,
      },
      weapon: {
        spriteX: 76,
        spriteY: 25,
        targetSide: 'right',
        targetY: 57,
      },
      boots: {
        spriteX: 65,
        spriteY: 79,
        targetSide: 'right',
        targetY: 91,
      },
    },
    slotMasks: {
      helmet:
        'radial-gradient(ellipse 19% 14% at 46% 13%, rgba(0,0,0,1) 48%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0) 100%)',
      chest:
        'radial-gradient(ellipse 23% 17% at 44% 30%, rgba(0,0,0,1) 48%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0) 100%)',
      gloves:
        'radial-gradient(ellipse 14% 16% at 17% 43%, rgba(0,0,0,1) 48%, rgba(0,0,0,0) 100%), radial-gradient(ellipse 13% 11% at 90% 23%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)',
      weapon:
        'radial-gradient(ellipse 25% 11% at 75% 24%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.45) 78%, rgba(0,0,0,0) 100%)',
      boots:
        'radial-gradient(ellipse 19% 24% at 25% 79%, rgba(0,0,0,1) 48%, rgba(0,0,0,0) 100%), radial-gradient(ellipse 19% 24% at 63% 79%, rgba(0,0,0,1) 48%, rgba(0,0,0,0) 100%)',
    },
  },
};

const QUALITY_LABELS: Record<ChassisQuality, string> = {
  standard: 'Estándar',
  calibrated: 'Calibrado',
  overcharged: 'Sobrecargado',
  sovereign: 'Soberano',
};

const QUALITY_BADGE_CLASSES: Record<ChassisQuality, string> = {
  standard: 'text-slate-300 border-white/10 bg-black/50',
  calibrated: 'text-sky-300 border-sky-500/40 bg-sky-950/60',
  overcharged: 'text-purple-300 border-purple-500/40 bg-purple-950/60',
  sovereign:
    'text-amber-300 border-amber-500/50 bg-amber-950/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
};

// Etiquetas directas sin repetir 5 veces la palabra "CHASIS DE"
const SLOT_LABELS: Record<HeroChassisSlot, string> = {
  weapon: 'ARMA PRINCIPAL',
  gloves: 'GUANTELETES',
  helmet: 'CASCO TÁCTICO',
  chest: 'CORAZA CENTRAL',
  boots: 'GREBAS Y BOTAS',
};

const ROMAN_TIERS: Record<number, string> = CHASSIS_ROMAN_NUMERALS;

function formatCompactItemName(item: HeroChassisItem): string {
  const cleaned = item.name
    .replace(/\s*Mk-[IVX]+/i, '')
    .replace('Guanteletes de Actuador', 'Actuadores')
    .replace('Botas de Anclaje Magnético', 'Botas Magnéticas')
    .replace('Servo-Coraza Bastión', 'Servo-Coraza')
    .replace('Casco de Sensores Tácticos', 'Sensores Tácticos')
    .replace('Cresta Sensorial Bio-Óptica', 'Cresta Sensorial')
    .replace('Apéndices Elásticos de Tracción', 'Apéndices Tracción')
    .replace('Corona de Refracción Cuántica', 'Corona Cuántica')
    .replace('Propulsores Gravitacionales', 'Propulsores Grav.')
    .trim();
  const roman = ROMAN_TIERS[item.tier] || String(item.tier);
  return `${cleaned} ${roman}`;
}

function getPrimaryStatInfo(item: HeroChassisItem): { label: string; value: string } {
  const { type, value } = item.primaryStat;
  if (type === 'damage') return { label: 'DAÑO BASE', value: `${value}` };
  if (type === 'flatArmor') return { label: 'BLINDAJE', value: `+${value}` };
  if (type === 'evasion') return { label: 'EVASIÓN', value: `${value}%` };
  return { label: 'ESCUDO', value: `+${value}` };
}

// Atributo secundario útil por ranura con explicación de su bono táctico
function getSecondaryStatInfo(item: HeroChassisItem): {
  label: string;
  value: string;
  benefitHint: string;
} {
  if (item.secondaryStat) {
    const { type, value } = item.secondaryStat;
    if (type === 'critChance') {
      return {
        label: 'CRÍTICO',
        value: `+${value}%`,
        benefitHint: 'Probabilidad de impacto crítico (+55% daño en Ruptura)',
      };
    }
    if (type === 'accuracy') {
      return {
        label: 'PRECISIÓN',
        value: `+${value}%`,
        benefitHint: 'Contrarresta la Evasión enemiga y potencia el Ataque',
      };
    }
    if (type === 'reconLuck') {
      return {
        label: 'SUERTE',
        value: `+${value}%`,
        benefitHint: 'Aumenta hallazgo de botín y aparición de Élite Raro',
      };
    }
    return {
      label: 'CADENCIA',
      value: `+${value}%`,
      benefitHint: 'Incrementa el multiplicador de daño por ciclo de arma',
    };
  }
  if (item.slot === 'chest') {
    return {
      label: 'INTEGRIDAD',
      value: `+${item.tier * 45} HP`,
      benefitHint: 'Refuerza la Salud estructural máxima del Comandante',
    };
  }
  if (item.slot === 'gloves') {
    return {
      label: 'PRECISIÓN',
      value: `+${item.tier * 4}%`,
      benefitHint: 'Contrarresta la Evasión enemiga y suma daño directo',
    };
  }
  return {
    label: 'ESTABILIDAD',
    value: `+${item.tier * 6}%`,
    benefitHint: `+${item.level * 3} SPD de Iniciativa en Cola de Turnos`,
  };
}

function renderSlotIcon(slot: HeroChassisSlot, accentClass: string) {
  const iconClass = `w-5 h-5 ${accentClass} shrink-0`;
  if (slot === 'weapon') return <Crosshair className={iconClass} />;
  if (slot === 'gloves') return <Hand className={iconClass} />;
  if (slot === 'helmet') return <HardHat className={iconClass} />;
  if (slot === 'chest') return <Shield className={iconClass} />;
  return <Footprints className={iconClass} />;
}

interface BlueprintChassisCardProps {
  item: HeroChassisItem;
  unit: string;
  accentClass: string;
  highlightCardClass: string;
  pinnedCardClass: string;
  isHighlighted: boolean;
  isPinned: boolean;
  onHover: (slot: HeroChassisSlot | null) => void;
  onSelect: (slot: HeroChassisSlot) => void;
  beaconNode?: React.ReactNode;
}

const BlueprintChassisCard: React.FC<BlueprintChassisCardProps> = ({
  item,
  unit,
  accentClass,
  highlightCardClass,
  pinnedCardClass,
  isHighlighted,
  isPinned,
  onHover,
  onSelect,
  beaconNode,
}) => {
  const primary = getPrimaryStatInfo(item);
  const secondary = getSecondaryStatInfo(item);
  const qualityBadgeClass = QUALITY_BADGE_CLASSES[item.quality];

  return (
    <div
      onClick={() => onSelect(item.slot)}
      onMouseEnter={() => onHover(item.slot)}
      onMouseLeave={() => onHover(null)}
      title={`${secondary.label} (${secondary.value}): ${secondary.benefitHint}`}
      className={`relative h-[188px] backdrop-blur-xl border rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all duration-200 select-none cursor-pointer ${
        isHighlighted
          ? highlightCardClass
          : isPinned
            ? pinnedCardClass
            : 'bg-[#121926]/72 border-slate-300/[0.12] hover:border-slate-300/25'
      }`}
    >
      {beaconNode && (
        <div className="absolute -top-3 right-4 z-30">{beaconNode}</div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#182232]/70 border border-slate-300/[0.12] flex items-center justify-center shrink-0">
            {renderSlotIcon(item.slot, accentClass)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 leading-tight">
              {SLOT_LABELS[item.slot]} · NV. {item.level}
            </span>
            <h3 className="text-base sm:text-lg font-black font-display text-slate-100 tracking-wide mt-0.5">
              {formatCompactItemName(item)}
            </h3>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-lg border text-xs font-bold font-mono uppercase tracking-wider shrink-0 ${qualityBadgeClass}`}
        >
          {QUALITY_LABELS[item.quality]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 font-mono">
        <div className="rounded-xl bg-[#182232]/58 border border-slate-300/[0.09] px-3.5 py-2.5 flex flex-col justify-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 leading-none">
            {primary.label}
          </span>
          <span className="text-base font-black text-slate-100 tabular-nums mt-1.5 leading-none">
            {primary.value}
          </span>
        </div>
        <div
          title={secondary.benefitHint}
          className="rounded-xl bg-[#182232]/58 border border-slate-300/[0.09] px-3.5 py-2.5 flex flex-col justify-center"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 leading-none">
            {secondary.label}
          </span>
          <span className={`text-base font-black ${accentClass} tabular-nums mt-1.5 leading-none`}>
            {secondary.value}
          </span>
        </div>
      </div>

      <div className="pt-2.5 border-t border-slate-300/[0.10] flex items-center justify-between gap-2 text-xs font-mono text-slate-300 tabular-nums">
        <span className="shrink-0">
          Carga: <strong className="text-slate-100 font-bold">{item.powerDrawMw} {unit}</strong>
        </span>
        <span className="text-[11px] text-slate-400 truncate" title={secondary.benefitHint}>
          {secondary.benefitHint}
        </span>
      </div>
    </div>
  );
};

interface SpriteBoxBounds {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
}

export const CommanderView: React.FC<CommanderViewProps> = ({
  playerName,
  characterLevel,
  currentFaction,
  heroLoadout,
  reactorLevel = 1,
  maxPlayerHp,
  maxPlayerDefense,
  playerAttackDmg,
  onEquipSlot,
  onOpenForge,
  isTutorialActive = false,
}) => {
  const { setPlayerName } = useGameContext();
  const [hoveredSlot, setHoveredSlot] = useState<HeroChassisSlot | null>(null);
  const [pinnedSlot, setPinnedSlot] = useState<HeroChassisSlot | null>(null);
  const [isHeroHovered, setIsHeroHovered] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameDraft, setNameDraft] = useState<string>(playerName || 'Comandante');

  const handleSaveName = () => {
    setPlayerName(nameDraft);
    setIsEditingName(false);
  };

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const spriteBoxRef = useRef<HTMLDivElement | null>(null);
  const [spriteBounds, setSpriteBounds] = useState<SpriteBoxBounds>({
    leftPct: 20,
    topPct: 10,
    widthPct: 60,
    heightPct: 86,
  });

  // Medición reactiva para mapear el 0..100% del recuadro del sprite al 0..100% del SVG
  const updateSpriteBounds = () => {
    const vp = viewportRef.current;
    const sb = spriteBoxRef.current;
    if (!vp || !sb) return;

    const vpRect = vp.getBoundingClientRect();
    const sbRect = sb.getBoundingClientRect();
    if (vpRect.width <= 0 || vpRect.height <= 0) return;

    setSpriteBounds({
      leftPct: ((sbRect.left - vpRect.left) / vpRect.width) * 100,
      topPct: ((sbRect.top - vpRect.top) / vpRect.height) * 100,
      widthPct: (sbRect.width / vpRect.width) * 100,
      heightPct: (sbRect.height / vpRect.height) * 100,
    });
  };

  useLayoutEffect(() => {
    updateSpriteBounds();
  }, [currentFaction.id]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const observer = new ResizeObserver(() => {
      updateSpriteBounds();
    });
    observer.observe(vp);
    window.addEventListener('resize', updateSpriteBounds);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSpriteBounds);
    };
  }, []);

  const activeSlot: HeroChassisSlot | null = hoveredSlot ?? pinnedSlot;

  const limiter = FACTION_LIMITERS[currentFaction.id] || FACTION_LIMITERS.valari;
  const layout = FACTION_LAYOUTS[currentFaction.id] || FACTION_LAYOUTS.valari;
  const callouts = layout.callouts;
  const pedestal = layout.pedestal;

  const allChassisItems = [
    heroLoadout.weapon,
    heroLoadout.chest,
    heroLoadout.helmet,
    heroLoadout.gloves,
    heroLoadout.boots,
  ];
  const armorPieces = [
    heroLoadout.chest,
    heroLoadout.helmet,
    heroLoadout.gloves,
    heroLoadout.boots,
  ];

  const rawChassisMw =
    heroLoadout.totalPowerDrawMw ||
    allChassisItems.reduce((sum, item) => sum + (item.powerDrawMw || 0), 0);
  // Pasiva Skithid: -12% consumo de MW en los 5 Chasis del Comandante
  const currentLoad =
    currentFaction.id === 'skithid'
      ? Math.round(rawChassisMw * GAME_BALANCE.reactor.skithidChassisMwMultiplier)
      : rawChassisMw;

  // Capacidad real del Reactor Central sincronizada con GAME_BALANCE
  const baseReactorMw =
    GAME_BALANCE.reactor.baseMw + (reactorLevel - 1) * GAME_BALANCE.reactor.mwPerLevel;
  const effectiveMaxCapacity =
    currentFaction.id === 'cygnus'
      ? Math.round(baseReactorMw * GAME_BALANCE.reactor.cygnusCapacityMultiplier)
      : baseReactorMw;
  const loadPercentage = Math.min(
    100,
    Math.round((currentLoad / Math.max(1, effectiveMaxCapacity)) * 100)
  );
  const factionTheme = getFactionTheme(currentFaction.name);

  const sumPrimaryStat = (statType: 'damage' | 'flatArmor' | 'evasion' | 'shieldCapacity') =>
    armorPieces.reduce(
      (sum, piece) => sum + (piece.primaryStat.type === statType ? piece.primaryStat.value : 0),
      0
    );

  const baseHealth = maxPlayerHp ?? 120 + characterLevel * 15;
  const cycleDamage =
    playerAttackDmg ??
    Math.round(
      (heroLoadout.weapon.primaryStat.value + characterLevel * 2) *
        (1 + currentFaction.bonuses.physicalAttack / 100)
    );

  const totalFlatArmor = sumPrimaryStat('flatArmor') + currentFaction.bonuses.armor;
  const totalEvasion = sumPrimaryStat('evasion') + currentFaction.bonuses.evasion;
  const totalShields = maxPlayerDefense ?? sumPrimaryStat('shieldCapacity') + characterLevel * 8;

  const nativeMitigationLabel =
    currentFaction.baseDefenseType === 'Armor'
      ? `${maxPlayerDefense ?? totalFlatArmor} BLI`
      : currentFaction.baseDefenseType === 'Evasion'
        ? `${totalEvasion}% EVA`
        : `${totalShields} ESC`;

  const reconLuck =
    heroLoadout.helmet.secondaryStat?.type === 'reconLuck'
      ? heroLoadout.helmet.secondaryStat.value
      : 0;
  const heroSpriteSrc = `/assets/unidades/hero-${currentFaction.id}.webp`;

  const handleSelectSlot = (slot: HeroChassisSlot) => {
    setPinnedSlot((prev) => (prev === slot ? null : slot));
    onEquipSlot?.(slot);
  };

  // Renderizado de las 5 líneas conectoras convirtiendo las coordenadas del sprite al SVG
  const renderCalloutLines = () => {
    return (Object.keys(callouts) as HeroChassisSlot[]).map((slotKey) => {
      const anchor = callouts[slotKey];
      const isTargeted = activeSlot === slotKey;
      const isAnySlotTargeted = activeSlot !== null;

      const strokeColor =
        isTargeted || isHeroHovered ? limiter.lineActiveColor : limiter.lineColor;
      const strokeWidth = isTargeted ? 2.2 : isHeroHovered ? 1.5 : 1.15;
      const opacity = isTargeted
        ? 1
        : isHeroHovered
          ? 0.75
          : isAnySlotTargeted
            ? 0.35
            : 0.65;

      // Convertimos el (spriteX%, spriteY%) del sprite al (0..100) del contenedor SVG
      const endX = spriteBounds.leftPct + (anchor.spriteX / 100) * spriteBounds.widthPct;
      const endY = spriteBounds.topPct + (anchor.spriteY / 100) * spriteBounds.heightPct;

      const edgeX = anchor.targetSide === 'left' ? 0 : 100;
      const elbowX =
        anchor.targetSide === 'left'
          ? Math.min(14, endX * 0.45)
          : Math.max(86, 100 - (100 - endX) * 0.45);
      const points = `${edgeX},${anchor.targetY} ${elbowX},${anchor.targetY} ${endX},${endY}`;

      return (
        <polyline
          key={slotKey}
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={isTargeted ? 'none' : '3 3'}
          vectorEffect="non-scaling-stroke"
          style={{
            opacity,
            filter: isTargeted ? `drop-shadow(0 0 6px ${limiter.lineActiveColor})` : 'none',
          }}
          className="transition-all duration-200"
        />
      );
    });
  };

  // Cálculo de la máscara de foco suave para la capa a color (z-20)
  const activeMaskStyle: React.CSSProperties = (() => {
    if (isHeroHovered) {
      return {
        opacity: 1,
        filter: `drop-shadow(0 0 18px ${limiter.glowColor})`,
      };
    }
    if (activeSlot) {
      const maskGradient = layout.slotMasks[activeSlot];
      return {
        opacity: 1,
        WebkitMaskImage: maskGradient,
        maskImage: maskGradient,
        filter: `drop-shadow(0 0 14px ${limiter.glowColor})`,
      };
    }
    return {
      opacity: 0,
      pointerEvents: 'none',
    };
  })();

  const isEmitterHighlighted = activeSlot !== null || isHeroHovered;

  return (
    <section className="w-full flex flex-col gap-4 select-none">
      {/* 1. CABECERA UNIFICADA DE HÉROE Y EQUIPAMIENTO */}
      <header
        className={`p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 ${GLOBAL_UI.glass.panel}`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-12 h-12 rounded-xl bg-[#182232]/85 border ${factionTheme.accentBorder} flex items-center justify-center shrink-0 shadow-md`}
          >
            <Shield className={`w-6 h-6 ${factionTheme.accentText}`} />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-display font-bold text-slate-200 uppercase">
                    HÉROE Y EQUIPAMIENTO ·
                  </span>
                  <input
                    type="text"
                    value={nameDraft}
                    maxLength={22}
                    autoFocus
                    onChange={(e) => setNameDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') {
                        setNameDraft(playerName);
                        setIsEditingName(false);
                      }
                    }}
                    onBlur={handleSaveName}
                    className="w-44 px-2.5 py-1 rounded-lg bg-[#090d14] border border-white/25 text-sm font-display font-bold text-white focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSaveName();
                    }}
                    className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 hover:text-white cursor-pointer"
                    title="Guardar nombre de Comandante"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setNameDraft(playerName);
                    setIsEditingName(true);
                  }}
                  title="Haz clic para personalizar tu nombre de Comandante"
                  className="group flex items-center gap-2 text-left cursor-pointer"
                >
                  <h1 className="text-xl sm:text-2xl font-display font-bold tracking-wide text-slate-100 group-hover:text-white uppercase">
                    HÉROE Y EQUIPAMIENTO · {playerName}
                  </h1>
                  <Pencil className="w-3.5 h-3.5 text-slate-400 opacity-65 group-hover:opacity-100 group-hover:text-white transition-opacity shrink-0" />
                </button>
              )}

              <span
                className={`px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono font-bold uppercase tabular-nums ${limiter.accent}`}
              >
                Nv. {characterLevel}
              </span>
            </div>

            <p className="text-[13px] sm:text-sm text-slate-300 mt-0.5">
              Inspecciona las piezas activas de tu chasis y el balance de atributos de combate.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={`min-h-[42px] px-3.5 py-2 rounded-xl font-mono flex flex-col justify-center items-end ${GLOBAL_UI.glass.subcard}`}
          >
            <span className="text-[11px] uppercase tracking-wider text-slate-400 leading-none">
              Rango de Combate
            </span>
            <span className={`text-sm font-bold tabular-nums mt-0.5 leading-none ${limiter.accent}`}>
              Nivel {characterLevel}
            </span>
          </div>

          {onOpenForge && (
            <button
              type="button"
              onClick={onOpenForge}
              className={`min-h-[42px] min-w-[186px] px-4 py-2 rounded-xl text-[13px] font-display font-bold uppercase tracking-wider shrink-0 flex items-center justify-center gap-2 transition-colors cursor-pointer ${factionTheme.primaryButton}`}
            >
              <span>Evolucionar en Forja →</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. PANEL RECTANGULAR PRINCIPAL */}
      <div className={`relative w-full p-6 lg:p-7 overflow-x-auto ${GLOBAL_UI.glass.panel}`}>
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-20 min-w-[820px] xl:min-w-0 grid grid-cols-12 gap-6 items-stretch">
          {/* COLUMNA IZQUIERDA */}
          <div className="col-span-4 flex flex-col gap-5">
            <BlueprintChassisCard
              item={heroLoadout[layout.leftTopSlot]}
              unit={limiter.unit}
              accentClass={limiter.accent}
              highlightCardClass={limiter.highlightCardClass}
              pinnedCardClass={limiter.pinnedCardClass}
              isHighlighted={activeSlot === layout.leftTopSlot}
              isPinned={pinnedSlot === layout.leftTopSlot}
              onHover={setHoveredSlot}
              onSelect={handleSelectSlot}
            />
            <BlueprintChassisCard
              item={heroLoadout[layout.leftMidSlot]}
              unit={limiter.unit}
              accentClass={limiter.accent}
              highlightCardClass={limiter.highlightCardClass}
              pinnedCardClass={limiter.pinnedCardClass}
              isHighlighted={activeSlot === layout.leftMidSlot}
              isPinned={pinnedSlot === layout.leftMidSlot}
              onHover={setHoveredSlot}
              onSelect={handleSelectSlot}
            />

            <div className="relative h-[188px] bg-[#121926]/72 backdrop-blur-xl border border-slate-300/[0.12] rounded-2xl p-5 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-300/[0.10] pb-2.5">
                <span className="text-[13px] font-bold font-mono uppercase tracking-widest text-slate-200 flex items-center gap-2">
                  <Activity className={`w-4 h-4 ${limiter.accent}`} />
                  <span>TELEMETRÍA GLOBAL</span>
                </span>
                <div className="flex items-center gap-2">
                  <TutorialBeacon
                    stepNumber={1}
                    label="Telemetría"
                    isActive={isTutorialActive}
                    factionId={currentFaction.id}
                  />
                  <span className="text-xs font-mono font-bold text-slate-300">MITIGACIÓN MÁX. 75%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="rounded-xl bg-[#182232]/58 border border-slate-300/[0.09] px-3.5 py-2 flex flex-col justify-center">
                  <span className="text-xs uppercase text-slate-300 flex items-center gap-1.5 font-bold">
                    <HeartPulse className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span>Salud</span>
                  </span>
                  <span className="text-base font-black text-slate-100 tabular-nums mt-1 leading-none">
                    {baseHealth} HP
                  </span>
                </div>
                <div className="rounded-xl bg-[#182232]/58 border border-slate-300/[0.09] px-3.5 py-2 flex flex-col justify-center">
                  <span className="text-xs uppercase text-slate-300 flex items-center gap-1.5 font-bold">
                    <Shield className={`w-3.5 h-3.5 ${limiter.accent} shrink-0`} />
                    <span>Defensa</span>
                  </span>
                  <span className="text-base font-black text-slate-100 tabular-nums mt-1 leading-none">
                    {nativeMitigationLabel}
                  </span>
                </div>
                <div className="rounded-xl bg-[#182232]/58 border border-slate-300/[0.09] px-3.5 py-2 flex flex-col justify-center">
                  <span className="text-xs uppercase text-slate-300 flex items-center gap-1.5 font-bold">
                    <Crosshair className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                    <span>Ataque</span>
                  </span>
                  <span className="text-base font-black text-slate-100 tabular-nums mt-1 leading-none">
                    {cycleDamage} DMG
                  </span>
                </div>
                <div className="rounded-xl bg-[#182232]/58 border border-slate-300/[0.09] px-3.5 py-2 flex flex-col justify-center">
                  <span className="text-xs uppercase text-slate-300 flex items-center gap-1.5 font-bold">
                    <Clover className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Hallazgo</span>
                  </span>
                  <span className="text-base font-black text-amber-200 tabular-nums mt-1 leading-none">
                    +{reconLuck}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA CENTRAL (604px sincronizados con 3 tarjetas de 188px + 2 gaps de 20px) */}
          <div className="col-span-4 flex flex-col justify-between items-center h-[604px] px-2 relative">
            <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#182232]/65 border border-slate-300/[0.10] text-xs font-mono text-slate-300 font-bold uppercase tracking-widest shrink-0">
              <span>ESQUEMA BIOMÉTRICO // EQUIPAMIENTO</span>
              <div className="flex items-center gap-2">
                <TutorialBeacon
                  stepNumber={2}
                  label="Esquema y MW"
                  isActive={isTutorialActive}
                  factionId={currentFaction.id}
                />
                <span className={limiter.accent}>REACTOR NV.{reactorLevel}</span>
              </div>
            </div>

            <div
              ref={viewportRef}
              className="relative flex-1 w-full flex items-center justify-center"
            >
              {/* 1. GENERADOR DE HOLOGRAMAS EN PERSPECTIVA (z-10, DETRÁS DE LOS PIES DEL HÉROE) */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-[6px] flex flex-col items-center justify-end z-10 transition-all duration-300"
              >
                {/* Bruma atmosférica ascendente suave */}
                <div
                  className="w-[78%] h-14 transition-opacity duration-300 -mb-3"
                  style={{
                    background: `radial-gradient(ellipse 65% 90% at 50% 100%, ${limiter.lineActiveColor} 0%, transparent 75%)`,
                    opacity: isEmitterHighlighted ? 0.14 : 0.07,
                  }}
                />

                {/* Disco de suelo holográfico sobrio (w-[84%] h-7 = 28px de superficie en perspectiva) */}
                <div className="relative w-[84%] h-7 flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-[100%] bg-gradient-to-b from-[#162032]/90 via-[#0f1726]/95 to-[#090d16] border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.9)]"
                    style={{
                      WebkitMaskImage:
                        'linear-gradient(to right, transparent 1%, rgba(0,0,0,0.9) 12%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.9) 88%, transparent 99%)',
                      maskImage:
                        'linear-gradient(to right, transparent 1%, rgba(0,0,0,0.9) 12%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.9) 88%, transparent 99%)',
                    }}
                  />

                  <div
                    className="w-[82%] h-[68%] rounded-[100%] border border-white/10 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(ellipse at center, ${limiter.lineActiveColor} 0%, transparent 74%)`,
                      opacity: isEmitterHighlighted ? 0.26 : 0.13,
                    }}
                  />

                  <div
                    className="absolute top-[46%] w-[68%] h-[1px] rounded-full transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(to right, transparent, ${limiter.lineActiveColor}, transparent)`,
                      opacity: isEmitterHighlighted ? 0.55 : 0.28,
                    }}
                  />
                </div>
              </div>

              {/* CAPA MEDIA (z-15): LÍNEAS DE CONEXIÓN POR DEBAJO DE LA CAPA ILUMINADA A COLOR */}
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none z-15"
              >
                {renderCalloutLines()}
              </svg>

              {/* CONTENEDOR DEL HÉROE (POR DELANTE DE LA BASE z-20, ALINEADO AL PLANO DE APOYO) */}
              <div className="relative flex items-end justify-center w-full h-full z-20">
                <div
                  ref={spriteBoxRef}
                  onMouseEnter={() => setIsHeroHovered(true)}
                  onMouseLeave={() => setIsHeroHovered(false)}
                  onClick={() => setPinnedSlot(null)}
                  style={{ marginBottom: `${pedestal.spriteMarginBottomPx}px` }}
                  className="relative h-[348px] aspect-[3/4] flex items-end justify-center cursor-pointer"
                >
                  <div
                    className="pointer-events-none absolute h-1.5 rounded-[100%] bg-black/45 blur-[2.5px] z-10"
                    style={{
                      left: `${pedestal.leftFootX}%`,
                      bottom: `${pedestal.leftFootBottomPx}px`,
                      width: `${pedestal.footShadowWidthPct}%`,
                      transform: 'translateX(-50%)',
                    }}
                  />
                  <div
                    className="pointer-events-none absolute h-1.5 rounded-[100%] bg-black/45 blur-[2.5px] z-10"
                    style={{
                      left: `${pedestal.rightFootX}%`,
                      bottom: `${pedestal.rightFootBottomPx}px`,
                      width: `${pedestal.footShadowWidthPct}%`,
                      transform: 'translateX(-50%)',
                    }}
                  />

                  <img
                    src={heroSpriteSrc}
                    alt={`Holograma base de ${playerName}`}
                    onLoad={updateSpriteBounds}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== window.location.origin + currentFaction.portraitPath) {
                        target.src = currentFaction.portraitPath;
                      }
                    }}
                    style={{
                      filter:
                        'grayscale(100%) brightness(75%) opacity(56%) drop-shadow(0 4px 6px rgba(0,0,0,0.45))',
                    }}
                    className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none z-20 transition-opacity duration-300"
                  />

                  <img
                    src={heroSpriteSrc}
                    alt={`Iluminación anatómica de ${playerName}`}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== window.location.origin + currentFaction.portraitPath) {
                        target.src = currentFaction.portraitPath;
                      }
                    }}
                    style={activeMaskStyle}
                    className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none z-30 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Base de Carga sincronizada con el Reactor Central */}
            <div className="w-full bg-[#121926]/72 backdrop-blur-xl border border-slate-300/[0.12] rounded-2xl p-4.5 flex flex-col gap-2.5 shadow-lg shrink-0">
              <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-black tabular-nums">
                <span className={`uppercase tracking-wider ${limiter.accent}`}>
                  {limiter.label}
                </span>
                <span className="text-slate-100">
                  {currentLoad} / {effectiveMaxCapacity} MW ({limiter.unit})
                </span>
              </div>
              <div className="h-3 rounded-full bg-[#0E141F]/80 border border-slate-300/[0.10] overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${limiter.bar}`}
                  style={{ width: `${loadPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
                <span>
                  {currentFaction.id === 'skithid'
                    ? 'SINAPSIS EFICIENTE (-12% MW)'
                    : 'PRESUPUESTO DE REACTOR CENTRAL'}
                </span>
                <span className="tabular-nums text-slate-200">{loadPercentage}% EQUIPAMIENTO</span>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="col-span-4 flex flex-col gap-5">
            <BlueprintChassisCard
              item={heroLoadout[layout.rightTopSlot]}
              unit={limiter.unit}
              accentClass={limiter.accent}
              highlightCardClass={limiter.highlightCardClass}
              pinnedCardClass={limiter.pinnedCardClass}
              isHighlighted={activeSlot === layout.rightTopSlot}
              isPinned={pinnedSlot === layout.rightTopSlot}
              onHover={setHoveredSlot}
              onSelect={handleSelectSlot}
              beaconNode={
                <TutorialBeacon
                  stepNumber={3}
                  label="Piezas de Equipamiento"
                  isActive={isTutorialActive}
                  factionId={currentFaction.id}
                />
              }
            />
            <BlueprintChassisCard
              item={heroLoadout[layout.rightMidSlot]}
              unit={limiter.unit}
              accentClass={limiter.accent}
              highlightCardClass={limiter.highlightCardClass}
              pinnedCardClass={limiter.pinnedCardClass}
              isHighlighted={activeSlot === layout.rightMidSlot}
              isPinned={pinnedSlot === layout.rightMidSlot}
              onHover={setHoveredSlot}
              onSelect={handleSelectSlot}
            />
            <BlueprintChassisCard
              item={heroLoadout[layout.rightBotSlot]}
              unit={limiter.unit}
              accentClass={limiter.accent}
              highlightCardClass={limiter.highlightCardClass}
              pinnedCardClass={limiter.pinnedCardClass}
              isHighlighted={activeSlot === layout.rightBotSlot}
              isPinned={pinnedSlot === layout.rightBotSlot}
              onHover={setHoveredSlot}
              onSelect={handleSelectSlot}
            />
          </div>
        </div>
      </div>
    </section>
  );
};