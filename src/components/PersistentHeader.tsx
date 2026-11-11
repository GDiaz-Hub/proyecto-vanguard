// src/components/PersistentHeader.tsx
import React, { useEffect, useState } from 'react';
import {
  Blocks,
  Box,
  Cloud,
  Coins,
  Compass,
  Cpu,
  Orbit,
  RotateCcw,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { GLOBAL_UI, getFactionTheme } from '../data/themeConfig';
import { ReactorRoutingMode } from '../types/game';

export interface PersistentHeaderProps {
  playerName?: string;
  factionName?: string;
  credits: number;
  cargoUsed: number;
  cargoCapacity: number;
  reactorLevel: number;
  forgeLevel: number;
  labLevel: number;
  routingMode?: ReactorRoutingMode;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetGame?: () => void;
  onOpenFactionSelector?: () => void;
  onRestartTutorial?: () => void;
  isTutorialActive?: boolean;
  onOpenWorkspaceModal?: () => void;
}

const ROUTING_LABELS: Record<
  Exclude<ReactorRoutingMode, 'none'>,
  { short: string; badgeClass: string }
> = {
  belico: {
    short: 'BÉLICO',
    badgeClass: 'text-rose-200 border-rose-400/35 bg-rose-950/50',
  },
  industrial: {
    short: 'INDUSTRIAL',
    badgeClass: 'text-amber-200 border-amber-400/35 bg-amber-950/50',
  },
  orbital: {
    short: 'ORBITAL',
    badgeClass: 'text-sky-200 border-sky-400/35 bg-sky-950/50',
  },
};

export const PersistentHeader: React.FC<PersistentHeaderProps> = ({
  factionName,
  credits,
  cargoUsed,
  cargoCapacity,
  reactorLevel,
  forgeLevel,
  labLevel,
  routingMode = 'none',
  isMuted,
  onToggleMute,
  onResetGame,
  onOpenFactionSelector,
  onRestartTutorial,
  isTutorialActive,
  onOpenWorkspaceModal,
}) => {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolledDown(y > 24);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isCompact = isScrolledDown && !isHeaderHovered && !confirmingReset;

  const theme = getFactionTheme(factionName);
  const occupancyPct = Math.min(
    100,
    Math.round((cargoUsed / Math.max(1, cargoCapacity)) * 100)
  );
  const routingMeta =
    routingMode && routingMode !== 'none' ? ROUTING_LABELS[routingMode] : null;

  return (
    <header
      onMouseEnter={() => setIsHeaderHovered(true)}
      onMouseLeave={() => setIsHeaderHovered(false)}
      className={`sticky top-0 z-40 w-full transition-all duration-200 select-none ${
        isCompact
          ? 'bg-[#090E17]/95 backdrop-blur-2xl border-b border-white/10 shadow-[0_6px_24px_rgba(0,0,0,0.85)]'
          : GLOBAL_UI.glass.header
      }`}
    >
      <div
        className={`w-full max-w-[2560px] mx-auto px-4 lg:px-7 flex flex-wrap items-center justify-between gap-3 transition-all duration-200 ${
          isCompact ? 'py-1.5' : 'py-2.5'
        }`}
      >
        {/* IZQUIERDA: Marca del juego + Ícono dinámico reactivo a la facción */}
        <div className="flex flex-row items-center gap-3 shrink-0">
          <div
            className={`rounded-xl bg-black/45 border border-white/10 shrink-0 shadow-md transition-all duration-200 ${
              isCompact ? 'p-1.5' : 'p-2'
            }`}
          >
            <Orbit
              className={`${
                isCompact ? 'w-4 h-4' : 'w-5 h-5'
              } ${theme.accentText} shrink-0 transition-all duration-200`}
            />
          </div>
          <span
            className={`font-display font-bold tracking-wider text-slate-100 whitespace-nowrap transition-all duration-200 ${
              isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
            }`}
          >
            Vanguard
          </span>
        </div>

        {/* CENTRO: Instalaciones Industriales Globales */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {/* Pastilla: Reactor Central */}
          <div
            className={`flex items-center gap-2 rounded-xl font-mono shadow-sm tabular-nums transition-all duration-200 ${
              isCompact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-[13px]'
            } ${GLOBAL_UI.facilities.reactor.badge}`}
          >
            <Zap
              className={`w-4 h-4 shrink-0 ${GLOBAL_UI.facilities.reactor.textClass}`}
            />
            <span className="text-slate-300 font-medium">
              {GLOBAL_UI.facilities.reactor.label}
            </span>
            <span className="text-white font-bold tracking-wide">
              Nv.{reactorLevel}
            </span>
            {routingMeta && (
              <span
                className={`ml-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${routingMeta.badgeClass}`}
                title="Protocolo activo de desvío energético del Reactor Central"
              >
                {routingMeta.short}
              </span>
            )}
          </div>

          {/* Pastilla: Forja */}
          <div
            className={`flex items-center gap-2 rounded-xl font-mono shadow-sm tabular-nums transition-all duration-200 ${
              isCompact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-[13px]'
            } ${GLOBAL_UI.facilities.forge.badge}`}
          >
            <Blocks
              className={`w-4 h-4 shrink-0 ${GLOBAL_UI.facilities.forge.textClass}`}
            />
            <span className="text-slate-300 font-medium">
              {GLOBAL_UI.facilities.forge.label}
            </span>
            <span className="text-white font-bold tracking-wide">
              Nv.{forgeLevel}
            </span>
          </div>

          {/* Pastilla: Laboratorio */}
          <div
            className={`flex items-center gap-2 rounded-xl font-mono shadow-sm tabular-nums transition-all duration-200 ${
              isCompact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-[13px]'
            } ${GLOBAL_UI.facilities.lab.badge}`}
          >
            <Cpu
              className={`w-4 h-4 shrink-0 ${GLOBAL_UI.facilities.lab.textClass}`}
            />
            <span className="text-slate-300 font-medium">
              {GLOBAL_UI.facilities.lab.label}
            </span>
            <span className="text-white font-bold tracking-wide">
              Nv.{labLevel}
            </span>
          </div>
        </div>

        {/* DERECHA: Economía, Silo, Audio y Reinicio de Partida */}
        <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
          {/* Créditos Globales */}
          <div
            title={GLOBAL_UI.economy.credits.label}
            className={`flex items-center gap-2 rounded-xl font-mono shrink-0 whitespace-nowrap shadow-sm tabular-nums transition-all duration-200 ${
              isCompact ? 'px-3 py-1 text-xs' : 'px-3.5 py-1.5 text-[13px]'
            } ${GLOBAL_UI.economy.credits.pillBg}`}
          >
            <Coins
              className={`w-4 h-4 shrink-0 ${GLOBAL_UI.economy.credits.iconClass}`}
            />
            <span className="text-slate-100 font-bold text-sm">
              {Math.floor(credits).toLocaleString('es-ES')}
            </span>
            <span className={`font-bold ${GLOBAL_UI.economy.credits.textClass}`}>
              {GLOBAL_UI.economy.credits.symbol}
            </span>
          </div>

          {/* Capacidad del Silo Logístico */}
          <div
            title={GLOBAL_UI.economy.cargo.label}
            className={`flex items-center gap-2 rounded-xl font-mono shrink-0 whitespace-nowrap shadow-sm tabular-nums transition-all duration-200 ${
              isCompact ? 'px-3 py-1 text-xs' : 'px-3.5 py-1.5 text-[13px]'
            } ${GLOBAL_UI.economy.cargo.pillBg}`}
          >
            <Box
              className={`w-4 h-4 shrink-0 ${GLOBAL_UI.economy.cargo.iconClass}`}
            />
            <span
              className={`font-bold text-sm ${GLOBAL_UI.economy.cargo.textClass}`}
            >
              {Math.floor(cargoUsed).toLocaleString('es-ES')} /{' '}
              {cargoCapacity.toLocaleString('es-ES')}
            </span>
            <span className="text-xs text-slate-300">({occupancyPct}%)</span>
          </div>

          {/* Enlace Google Workspace (Drive, Docs, Forms) */}
          {onOpenWorkspaceModal && (
            <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5 shadow-sm">
              <button
                type="button"
                onClick={onOpenWorkspaceModal}
                className={`rounded-lg hover:bg-sky-500/20 text-sky-300 hover:text-white transition-colors flex items-center gap-1.5 text-[13px] font-mono font-semibold cursor-pointer whitespace-nowrap ${
                  isCompact ? 'px-2 py-1' : 'px-2.5 py-1.5'
                }`}
                title="Enlace Google Workspace: Respaldo en Drive, Informes en Docs y Forms"
              >
                <Cloud className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                {!isCompact && <span className="hidden sm:inline">Workspace</span>}
              </button>
            </div>
          )}

          {/* Control Táctil de Audio */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5 shadow-sm">
            <button
              type="button"
              onClick={onToggleMute}
              className={`rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer ${
                isCompact ? 'p-1' : 'p-1.5'
              }`}
              title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-slate-300" />
              )}
            </button>
          </div>

          {/* Botón rápido de Guía Contextual */}
          {onRestartTutorial && (
            <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5 shadow-sm">
              <button
                type="button"
                onClick={onRestartTutorial}
                className={`rounded-lg transition-colors flex items-center gap-1.5 text-[13px] font-mono font-semibold cursor-pointer whitespace-nowrap ${
                  isCompact ? 'px-2 py-1' : 'px-2.5 py-1.5'
                } ${
                  isTutorialActive
                    ? `${theme.accentText} bg-white/10`
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Mostrar u ocultar la guía contextual e indicadores [1-3] de la pantalla actual"
              >
                <Compass className="w-3.5 h-3.5 shrink-0" />
                {!isCompact && <span className="hidden sm:inline">Guía</span>}
              </button>
            </div>
          )}

          {/* Botón para volver al Selector Inicial de Facciones */}
          {onOpenFactionSelector && (
            <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5 shadow-sm">
              <button
                type="button"
                onClick={onOpenFactionSelector}
                className={`rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-[13px] font-mono font-semibold cursor-pointer whitespace-nowrap ${
                  isCompact ? 'px-2 py-1' : 'px-2.5 py-1.5'
                }`}
                title="Volver a la pantalla inicial de selección de facciones"
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                {!isCompact && (
                  <span className="hidden sm:inline">Facciones</span>
                )}
              </button>
            </div>
          )}

          {/* Botón Reiniciar Partida con confirmación inline */}
          {onResetGame && (
            <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5 shadow-sm">
              {!confirmingReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmingReset(true)}
                  className={`rounded-lg hover:bg-rose-500/15 text-slate-300 hover:text-rose-200 transition-colors flex items-center gap-1.5 text-[13px] font-mono font-semibold cursor-pointer whitespace-nowrap ${
                    isCompact ? 'px-2 py-1' : 'px-2.5 py-1.5'
                  }`}
                  title="Reiniciar todo el progreso y volver a elegir facción"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  {!isCompact && (
                    <span className="hidden sm:inline">Reiniciar</span>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-1 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      onResetGame();
                      setConfirmingReset(false);
                    }}
                    className="px-2.5 py-1 rounded-md bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    ¿Confirmar?
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingReset(false)}
                    className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};