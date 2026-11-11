// src/data/themeConfig.ts
import { FactionId } from '../types/game';

export const GLOBAL_UI = {
  glass: {
    panel:
      'bg-[#121926]/72 backdrop-blur-xl border border-slate-300/[0.12] rounded-2xl shadow-[0_12px_32px_-8px_rgba(2,6,23,0.6)]',
    card:
      'bg-[#121926]/72 backdrop-blur-xl border border-slate-300/[0.12] rounded-2xl shadow-[0_10px_28px_-6px_rgba(2,6,23,0.55)]',
    subcard:
      'bg-[#182232]/58 backdrop-blur-md border border-slate-300/[0.09] rounded-xl',
    header:
      'bg-[#121926]/78 backdrop-blur-xl border-b border-slate-300/[0.12] shadow-[0_8px_24px_-6px_rgba(2,6,23,0.55)]',
    sidebar:
      'bg-[#121926]/72 backdrop-blur-xl border border-slate-300/[0.12] rounded-2xl shadow-[0_12px_32px_-8px_rgba(2,6,23,0.6)]',
    modal:
      'bg-[#141C2B]/90 backdrop-blur-2xl border border-slate-300/[0.16] rounded-2xl shadow-2xl',
    disabledButton:
      'bg-slate-800/40 border border-slate-300/[0.08] text-slate-400 cursor-not-allowed',
  },
  facilities: {
    reactor: {
      label: 'Reactor',
      colorHex: '#F59E0B',
      textClass: 'text-amber-300',
      badge: 'bg-[#182232]/65 border border-slate-300/[0.10] text-slate-200',
    },
    forge: {
      label: 'Forja',
      colorHex: '#06B6D4',
      textClass: 'text-cyan-300',
      badge: 'bg-[#182232]/65 border border-slate-300/[0.10] text-slate-200',
    },
    lab: {
      label: 'Laboratorio',
      colorHex: '#10B981',
      textClass: 'text-emerald-300',
      badge: 'bg-[#182232]/65 border border-slate-300/[0.10] text-slate-200',
    },
  },
  economy: {
    credits: {
      label: 'Créditos',
      symbol: '₡',
      colorHex: '#FBBF24',
      textClass: 'text-amber-300',
      iconClass: 'text-amber-300',
      pillBg: 'bg-[#182232]/65 border border-slate-300/[0.09]',
    },
    cargo: {
      label: 'Silo Logístico',
      colorHex: '#94A3B8',
      textClass: 'text-slate-100',
      mutedTextClass: 'text-slate-400',
      iconClass: 'text-slate-300',
      pillBg: 'bg-[#182232]/65 border border-slate-300/[0.09]',
    },
  },
  progression: {
    heroXp: {
      label: 'RANGO UNIVERSAL',
      colorHex: '#E2E8F0',
      textClass: 'text-slate-100',
      accentText: 'text-slate-200',
      barFill: 'bg-slate-300',
      track: 'bg-[#0E141F]/70 border border-slate-300/[0.10]',
    },
  },
} as const;

export interface FactionThemeTokens {
  factionId: FactionId;
  canonicalName: string;
  accentHex: string;
  accentText: string;
  accentTextLight: string;
  accentTextBright: string;
  accentBorder: string;
  accentBg: string;
  activeNav: string;
  activeTabGlow: string;
  primaryButton: string;
  progressButton: string;
  progressFill: string;
  barFill: string;
  activeCardBorder: string;
  selectedSlot: string;
  lineColor: string;
  lineActiveColor: string;
  bgImage: string;
  combatPalette: {
    damageClass: string;
    defenseClass: string;
    resKineticClass: string;
    resEnergyClass: string;
    resCorrosiveClass: string;
    bulletAccent: string;
  };
  chassisTelemetry: {
    resourceName: string;
    unit: string;
    description: string;
    accentClass: string;
    barFillClass: string;
  };
}

export const FACTION_THEMES: Record<string, FactionThemeTokens> = {
  'La Legión Valari': {
    factionId: 'valari',
    canonicalName: 'La Legión Valari',
    accentHex: '#E8A849',
    accentText: 'text-amber-300',
    accentTextLight: 'text-amber-200/90',
    accentTextBright: 'text-amber-100',
    accentBorder: 'border-amber-400/35',
    accentBg: 'bg-amber-500/15',
    activeNav: 'bg-amber-500/12 border-amber-400/30 text-amber-200 shadow-sm',
    activeTabGlow: 'bg-amber-500/15 backdrop-blur-sm border border-amber-400/35 text-amber-200 shadow-sm',
    primaryButton: 'bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-md border border-amber-400/40 text-amber-100 shadow-sm',
    progressButton: 'bg-amber-950/25 backdrop-blur-sm border border-amber-400/35 text-amber-200',
    progressFill: 'bg-amber-500/20',
    barFill: 'bg-amber-400/90',
    activeCardBorder: 'border-amber-400/45 shadow-[0_0_16px_rgba(245,158,11,0.10)]',
    selectedSlot: 'border-amber-400/50 ring-1 ring-amber-400/35',
    lineColor: 'rgba(245, 158, 11, 0.40)',
    lineActiveColor: '#FBBF24',
    bgImage: '/assets/backgrounds/bg-faction-valari.png',
    combatPalette: {
      damageClass: 'text-amber-300',
      defenseClass: 'text-slate-200',
      resKineticClass: 'text-amber-200 font-bold',
      resEnergyClass: 'text-slate-300',
      resCorrosiveClass: 'text-slate-300',
      bulletAccent: 'text-amber-300',
    },
    chassisTelemetry: {
      resourceName: 'ESTRÉS ESTRUCTURAL',
      unit: 't',
      description: 'Límite cinético y absorción mecánica de actuadores hidráulicos.',
      accentClass: 'text-amber-300',
      barFillClass: 'bg-amber-400/90',
    },
  },
  'El Enjambre Skithid': {
    factionId: 'skithid',
    canonicalName: 'El Enjambre Skithid',
    accentHex: '#2ECC71',
    accentText: 'text-emerald-300',
    accentTextLight: 'text-emerald-200/90',
    accentTextBright: 'text-emerald-100',
    accentBorder: 'border-emerald-400/35',
    accentBg: 'bg-emerald-500/15',
    activeNav: 'bg-emerald-500/12 border-emerald-400/30 text-emerald-200 shadow-sm',
    activeTabGlow: 'bg-emerald-500/15 backdrop-blur-sm border border-emerald-400/35 text-emerald-200 shadow-sm',
    primaryButton: 'bg-emerald-500/20 hover:bg-emerald-500/30 backdrop-blur-md border border-emerald-400/40 text-emerald-100 shadow-sm',
    progressButton: 'bg-emerald-950/25 backdrop-blur-sm border border-emerald-400/35 text-emerald-200',
    progressFill: 'bg-emerald-500/20',
    barFill: 'bg-emerald-400/90',
    activeCardBorder: 'border-emerald-400/45 shadow-[0_0_16px_rgba(16,185,129,0.10)]',
    selectedSlot: 'border-emerald-400/50 ring-1 ring-emerald-400/35',
    lineColor: 'rgba(16, 185, 129, 0.40)',
    lineActiveColor: '#34D399',
    bgImage: '/assets/backgrounds/bg-faction-skithid.png',
    combatPalette: {
      damageClass: 'text-emerald-300',
      defenseClass: 'text-teal-200',
      resKineticClass: 'text-slate-300',
      resEnergyClass: 'text-slate-300',
      resCorrosiveClass: 'text-emerald-200 font-bold',
      bulletAccent: 'text-emerald-300',
    },
    chassisTelemetry: {
      resourceName: 'TENSIÓN SINÁPTICA',
      unit: 'µS',
      description: 'Umbral neuroquímico y conducción bioplasmática del tejido.',
      accentClass: 'text-emerald-300',
      barFillClass: 'bg-emerald-400/90',
    },
  },
  'El Nexo Cygnus': {
    factionId: 'cygnus',
    canonicalName: 'El Nexo Cygnus',
    accentHex: '#3B82F6',
    accentText: 'text-blue-300',
    accentTextLight: 'text-blue-200',
    accentTextBright: 'text-blue-100',
    accentBorder: 'border-blue-400/35',
    accentBg: 'bg-blue-600/15',
    activeNav: 'bg-blue-600/15 border-blue-400/30 text-blue-200 shadow-sm',
    activeTabGlow: 'bg-blue-600/18 backdrop-blur-sm border border-blue-400/35 text-blue-200 shadow-sm',
    primaryButton: 'bg-blue-600/22 hover:bg-blue-600/32 backdrop-blur-md border border-blue-400/40 text-blue-100 shadow-sm',
    progressButton: 'bg-blue-950/30 backdrop-blur-sm border border-blue-400/35 text-blue-200',
    progressFill: 'bg-blue-500/25',
    barFill: 'bg-blue-400/90',
    activeCardBorder: 'border-blue-400/45 shadow-[0_0_16px_rgba(59,130,246,0.12)]',
    selectedSlot: 'border-blue-400/50 ring-1 ring-blue-400/35',
    lineColor: 'rgba(59, 130, 246, 0.40)',
    lineActiveColor: '#60A5FA',
    bgImage: '/assets/backgrounds/bg-faction-cygnus.png',
    combatPalette: {
      damageClass: 'text-blue-300',
      defenseClass: 'text-sky-200',
      resKineticClass: 'text-slate-300',
      resEnergyClass: 'text-blue-200 font-bold',
      resCorrosiveClass: 'text-slate-300',
      bulletAccent: 'text-blue-300',
    },
    chassisTelemetry: {
      resourceName: 'COHERENCIA DE FASE',
      unit: 'Q-Flux',
      description: 'Estabilidad de contención cuántica y resonancia de escudos.',
      accentClass: 'text-blue-300',
      barFillClass: 'bg-blue-400/90',
    },
  },
};

export function getFactionTheme(factionIdentifier?: string): FactionThemeTokens {
  if (!factionIdentifier) return FACTION_THEMES['La Legión Valari'];

  const normalized = factionIdentifier.toLowerCase().trim();
  if (normalized.includes('skithid')) return FACTION_THEMES['El Enjambre Skithid'];
  if (normalized.includes('cygnus')) return FACTION_THEMES['El Nexo Cygnus'];
  return FACTION_THEMES['La Legión Valari'];
}