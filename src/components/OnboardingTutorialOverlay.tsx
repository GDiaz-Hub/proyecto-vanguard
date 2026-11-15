// src/components/OnboardingTutorialOverlay.tsx
import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  RotateCcw,
  SkipForward,
} from 'lucide-react';
import { FACTION_CONTEXTUAL_TUTORIALS } from '../data/factionIdentityCatalog';
import { FACTIONS } from '../data/gameData';
import { GLOBAL_UI, getFactionTheme } from '../data/themeConfig';
import { FactionId, TutorialScreenKey } from '../types/game';

/**
 * Baliza visual numerada [1], [2], [3] que se muestra directamente sobre el elemento de la UI
 * explicado cuando la guía contextual de esa pantalla está activa.
 */
export const TutorialBeacon: React.FC<{
  stepNumber: 1 | 2 | 3;
  label: string;
  isActive?: boolean;
  factionId?: FactionId;
  className?: string;
}> = ({ stepNumber, label, isActive = false, factionId = 'valari', className = '' }) => {
  if (!isActive) return null;

  const badgeTone =
    factionId === 'valari'
      ? 'bg-amber-500 text-slate-950 border-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.75)]'
      : factionId === 'skithid'
        ? 'bg-emerald-400 text-slate-950 border-emerald-100 shadow-[0_0_16px_rgba(16,185,129,0.75)]'
        : 'bg-sky-400 text-slate-950 border-sky-100 shadow-[0_0_16px_rgba(56,189,248,0.75)]';

  const pillBorder =
    factionId === 'valari'
      ? 'border-amber-400/60 text-amber-200'
      : factionId === 'skithid'
        ? 'border-emerald-400/60 text-emerald-200'
        : 'border-sky-400/60 text-sky-200';

  return (
    <div
      className={`pointer-events-none inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0B101A]/92 backdrop-blur-md border ${pillBorder} shadow-lg z-30 animate-beacon-pulse ${className}`}
    >
      <span
        className={`w-4 h-4 rounded-full border font-mono text-[10px] font-black flex items-center justify-center shrink-0 ${badgeTone}`}
      >
        {stepNumber}
      </span>
      <span className="font-mono text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};

export interface OnboardingTutorialOverlayProps {
  factionId: FactionId;
  screenKey: TutorialScreenKey;
  onDismissScreenTutorial: () => void;
  onDisableAllTutorials: () => void;
  onReturnToFactionSelect: () => void;
}

export const OnboardingTutorialOverlay: React.FC<OnboardingTutorialOverlayProps> = ({
  factionId,
  screenKey,
  onDismissScreenTutorial,
  onDisableAllTutorials,
  onReturnToFactionSelect,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const factionTutorials =
    FACTION_CONTEXTUAL_TUTORIALS[factionId] || FACTION_CONTEXTUAL_TUTORIALS.valari;
  const activeGuide = factionTutorials[screenKey] || factionTutorials.hub;
  const factionInfo = FACTIONS[factionId];
  const theme = getFactionTheme(factionInfo.name);

  const badgeTone =
    factionId === 'valari'
      ? 'bg-amber-500 text-slate-950 border-amber-200'
      : factionId === 'skithid'
        ? 'bg-emerald-400 text-slate-950 border-emerald-100'
        : 'bg-sky-400 text-slate-950 border-sky-100';

  if (isMinimized) {
    return (
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[92vw] select-none animate-in fade-in duration-200">
        <div
          className={`${GLOBAL_UI.glass.panel} px-5 py-3 flex items-center gap-4 border ${theme.accentBorder} shadow-[0_18px_48px_rgba(0,0,0,0.85)]`}
        >
          <span className={`text-xs font-mono font-bold uppercase tracking-wider ${theme.accentText}`}>
            {activeGuide.badgeLabel}
          </span>
          <span className="text-sm font-display font-bold text-slate-100 hidden sm:inline">
            {activeGuide.title}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-mono font-bold text-slate-100 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Ver Indicadores [1-3]</span>
            </button>
            <button
              type="button"
              onClick={onDismissScreenTutorial}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-400/40 text-xs font-mono font-bold text-emerald-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Entendido</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside
      aria-label="Guía Contextual de Pantalla"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-[1080px] select-none animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-[#111824]/94 backdrop-blur-2xl border ${theme.accentBorder} shadow-[0_24px_64px_rgba(0,0,0,0.92)] p-5 sm:p-6 flex flex-col gap-4`}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.accentHex}, transparent)`,
          }}
        />

        {/* CABECERA CONTEXTUAL */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-300/[0.12]">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`text-xs font-mono font-bold uppercase tracking-wider ${theme.accentText}`}
            >
              {activeGuide.badgeLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReturnToFactionSelect}
              className="px-3 py-1.5 rounded-lg bg-[#182232]/85 hover:bg-white/10 border border-slate-300/[0.14] text-xs font-mono font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
              title="Volver al selector de facciones a pantalla completa"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Cambiar Facción</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="px-2.5 py-1.5 rounded-lg bg-[#182232]/85 hover:bg-white/10 border border-slate-300/[0.14] text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
              title="Minimizar para observar la pantalla con las balizas [1], [2] y [3]"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Minimizar</span>
            </button>

            <button
              type="button"
              onClick={onDisableAllTutorials}
              className="px-3 py-1.5 rounded-lg bg-rose-950/45 hover:bg-rose-900/60 border border-rose-400/35 text-xs font-mono font-bold text-rose-200 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
              title="Desactivar todas las guías contextuales del resto de pantallas"
            >
              <SkipForward className="w-3.5 h-3.5 shrink-0" />
              <span>Desactivar Guías</span>
            </button>
          </div>
        </div>

        {/* CUERPO PRINCIPAL CON LAS 3 BALIZAS NUMERADAS [1], [2], [3] */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-100 tracking-wide leading-snug">
              {activeGuide.title}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              {activeGuide.narrativeIntro}
            </p>

            <div className="mt-1 flex items-center gap-2 text-xs font-mono text-slate-300">
              <Eye className={`w-4 h-4 shrink-0 ${theme.accentText}`} />
              <span>
                <strong className="text-slate-100">Puntos Clave:</strong> {activeGuide.whereToLook}
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 gap-2.5">
            {activeGuide.beacons.map((b) => (
              <div
                key={b.number}
                className="px-4 py-2.5 rounded-xl bg-[#182232]/80 border border-slate-300/[0.12] flex items-start gap-3"
              >
                <span
                  className={`w-5 h-5 rounded-full border font-mono text-xs font-black flex items-center justify-center shrink-0 mt-0.5 ${badgeTone}`}
                >
                  {b.number}
                </span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wide">
                    {b.label}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PIE DEL MANUAL TÁCTICO */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-300/[0.10]">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Compass className={`w-4 h-4 ${theme.accentText} shrink-0`} />
            <span>
              Reabre este informe cuando lo necesites desde el botón &ldquo;Guía&rdquo; en la barra superior.
            </span>
          </div>

          <button
            type="button"
            onClick={onDismissScreenTutorial}
            className={`ml-auto px-6 py-2.5 rounded-xl border text-xs sm:text-sm font-display font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer active:scale-95 whitespace-nowrap ${theme.primaryButton}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Entendido</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
