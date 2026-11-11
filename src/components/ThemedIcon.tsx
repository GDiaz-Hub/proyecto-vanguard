// src/components/ThemedIcon.tsx
import React from 'react';
import {
  Activity, Atom, Binary, Biohazard, Box, BrainCircuit, Cable,
  CircuitBoard, Cog, Coins, Cpu, Cuboid, Cylinder, Database, Diamond,
  Disc, Dna, Eclipse, Gauge, Gem, HardDrive, HeartPulse, Hexagon,
  Layers, Microchip, Network, Octagon, Orbit, Power, Radiation,
  Shield, Sparkles, Waves, Zap
} from 'lucide-react';
import { FactionId, ResourceIconKey } from '../types/game';
import { getFactionTheme } from '../data/themeConfig';

interface ThemedIconProps {
  iconKey?: ResourceIconKey;
  faction?: FactionId;
  className?: string;
}

export function renderSciFiIcon(iconKey: ResourceIconKey | undefined, className: string): React.ReactNode {
  switch (iconKey) {
    case 'cuboid': return <Cuboid className={className} />;
    case 'box': return <Box className={className} />;
    case 'diamond': return <Diamond className={className} />;
    case 'atom': return <Atom className={className} />;
    case 'shield': return <Shield className={className} />;
    case 'cylinder': return <Cylinder className={className} />;
    case 'layers': return <Layers className={className} />;
    case 'eclipse': return <Eclipse className={className} />;
    case 'hexagon': return <Hexagon className={className} />;
    case 'biohazard': return <Biohazard className={className} />;
    case 'dna': return <Dna className={className} />;
    case 'heart-pulse': return <HeartPulse className={className} />;
    case 'activity': return <Activity className={className} />;
    case 'octagon': return <Octagon className={className} />;
    case 'brain-circuit': return <BrainCircuit className={className} />;
    case 'radiation': return <Radiation className={className} />;
    case 'microchip': return <Microchip className={className} />;
    case 'circuit-board': return <CircuitBoard className={className} />;
    case 'sparkles': return <Sparkles className={className} />;
    case 'waves': return <Waves className={className} />;
    case 'gem': return <Gem className={className} />;
    case 'zap': return <Zap className={className} />;
    case 'network': return <Network className={className} />;
    case 'orbit': return <Orbit className={className} />;
    case 'cpu': return <Cpu className={className} />;
    case 'database': return <Database className={className} />;
    case 'cog': return <Cog className={className} />;
    case 'power': return <Power className={className} />;
    case 'hard-drive': return <HardDrive className={className} />;
    case 'binary': return <Binary className={className} />;
    case 'gauge': return <Gauge className={className} />;
    case 'cable': return <Cable className={className} />;
    case 'disc': return <Disc className={className} />;
    default: return <Hexagon className={className} />;
  }
}

// Mantenemos los colores fijos porque los materiales/planos tienen tier visual fijo (independiente de la facción).
export function renderResourceCostIcon(costId: string): React.ReactNode {
  switch (costId) {
    case 'credits': return <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    case 'ferrita':
    case 'valari_raw_t1_ferrita': return <Cuboid className="w-3.5 h-3.5 text-amber-400/90 shrink-0" />;
    case 'titanio':
    case 'valari_raw_t2_titanio': return <Box className="w-3.5 h-3.5 text-slate-300 shrink-0" />;
    case 'valari_raw_t3_iridio': return <Diamond className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
    case 'valari_raw_t4_neutronio': return <Atom className="w-3.5 h-3.5 text-amber-200 shrink-0" />;
    case 'valari_craft_t2_titanio': return <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    case 'valari_craft_t3_iridio': return <Cylinder className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
    case 'valari_craft_t4_neutronio': return <Layers className="w-3.5 h-3.5 text-amber-200 shrink-0" />;
    case 'valari_t5_materia_oscura': return <Eclipse className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    case 'skithid_raw_t1_quitina': return <Hexagon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    case 'skithid_raw_t2_espora': return <Biohazard className="w-3.5 h-3.5 text-emerald-300 shrink-0" />;
    case 'skithid_raw_t3_tejido': return <Dna className="w-3.5 h-3.5 text-emerald-300 shrink-0" />;
    case 'skithid_raw_t4_glandula': return <HeartPulse className="w-3.5 h-3.5 text-emerald-200 shrink-0" />;
    case 'skithid_craft_t2_enzima': return <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    case 'skithid_craft_t3_caparazon': return <Octagon className="w-3.5 h-3.5 text-emerald-300 shrink-0" />;
    case 'skithid_craft_t4_glandula': return <BrainCircuit className="w-3.5 h-3.5 text-emerald-200 shrink-0" />;
    case 'skithid_t5_plasma_corrosivo': return <Radiation className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    case 'cygnus_raw_t1_silicio': return <Microchip className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    case 'cygnus_raw_t2_cromo': return <CircuitBoard className="w-3.5 h-3.5 text-cyan-300 shrink-0" />;
    case 'cygnus_raw_t3_foton': return <Sparkles className="w-3.5 h-3.5 text-cyan-200 shrink-0" />;
    case 'cygnus_raw_t4_taquion': return <Waves className="w-3.5 h-3.5 text-cyan-100 shrink-0" />;
    case 'cygnus_craft_t2_cromo': return <Gem className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    case 'cygnus_craft_t3_fotones': return <Zap className="w-3.5 h-3.5 text-cyan-300 shrink-0" />;
    case 'cygnus_craft_t4_taquion': return <Network className="w-3.5 h-3.5 text-cyan-200 shrink-0" />;
    case 'cygnus_t5_nucleo_cuantico': return <Orbit className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    default: return <Cuboid className="w-3.5 h-3.5 text-slate-300 shrink-0" />;
  }
}

export const ThemedIcon: React.FC<ThemedIconProps> = ({
  iconKey = 'hexagon',
  faction = 'valari',
  className = 'w-12 h-12',
}) => {
  const theme = getFactionTheme(faction);

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl border bg-black/40 ${theme.accentBorder} hover:border-white/50 transition-colors duration-200 select-none shrink-0 ${className}`}
    >
      {renderSciFiIcon(iconKey, `w-5 h-5 ${theme.accentText} shrink-0`)}
    </div>
  );
};