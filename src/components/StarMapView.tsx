// src/components/StarMapView.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Compass,
  Crosshair,
  FileText,
  MapPin,
  Radio,
  ShieldAlert,
  Swords,
  X,
  Zap,
} from 'lucide-react';
import { Planet, SECTORS_DATA, StarSector } from '../data/starMap.data';
import { FactionInfo } from '../types/game';
import { getFactionTheme } from '../data/themeConfig';
import { renderResourceCostIcon } from './ThemedIcon';
import { TutorialBeacon } from './OnboardingTutorialOverlay';

export interface StarMapViewProps {
  currentLocation?: string;
  currentFaction?: FactionInfo;
  playerLevel?: number;
  onNavigateToSector?: (sector: StarSector, planet: Planet) => void;
  onReturnToCitadel?: () => void;
  isTutorialActive?: boolean;
}

// Rutas estelares que conectan los 6 sectores en la Vista Galáctica General
const SECTOR_JUMP_LINKS: [string, string][] = [
  ['SEC-VAL-01', 'SEC-NEU-WEST'],
  ['SEC-VAL-01', 'SEC-NEU-01'],
  ['SEC-VAL-01', 'SEC-NEU-EAST'],
  ['SEC-CYG-01', 'SEC-NEU-WEST'],
  ['SEC-CYG-01', 'SEC-NEU-01'],
  ['SEC-SKI-01', 'SEC-NEU-EAST'],
  ['SEC-SKI-01', 'SEC-NEU-01'],
  ['SEC-NEU-WEST', 'SEC-NEU-01'],
  ['SEC-NEU-EAST', 'SEC-NEU-01'],
];

export const StarMapView: React.FC<StarMapViewProps> = ({
  currentLocation,
  currentFaction,
  playerLevel = 1,
  onNavigateToSector,
  isTutorialActive = false,
}) => {
  const [zoomedSectorId, setZoomedSectorId] = useState<string | null>(null);
  const [hoveredSectorId, setHoveredSectorId] = useState<string | null>(null);
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);
  const [anomalyNoticeSectorId, setAnomalyNoticeSectorId] = useState<string | null>(null);

  const playerTheme = getFactionTheme(currentFaction?.name || 'La Legión Valari');
  const playerFactionId = currentFaction?.id || 'valari';

  // Regla de Desbloqueo: Solo el Sector Natal de la facción elegida (Tiers I-III) y el Corredor de Orión (Tiers IV-V) están desbloqueados
  const isSectorUnlocked = (sector: StarSector): boolean => {
    if (sector.id === 'SEC-NEU-WEST') return true;
    return sector.faction.toLowerCase() === playerFactionId;
  };

  const zoomedSector = useMemo(
    () => SECTORS_DATA.find((s) => s.id === zoomedSectorId) || null,
    [zoomedSectorId]
  );

  const selectedPlanet = useMemo(() => {
    if (!zoomedSector || !selectedPlanetId) return null;
    return zoomedSector.planets.find((p) => p.id === selectedPlanetId) || null;
  }, [zoomedSector, selectedPlanetId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPlanetId) {
          setSelectedPlanetId(null);
        } else if (zoomedSectorId) {
          setZoomedSectorId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPlanetId, zoomedSectorId]);

  const getBeaconTheme = (sector: StarSector, unlocked: boolean) => {
    if (!unlocked) {
      return {
        coreGlow:
          'bg-rose-600 border-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.95)]',
        ringOuter: 'border-rose-500/65',
        accentText: 'text-rose-400',
        lineStroke: 'rgba(244, 63, 94, 0.35)',
      };
    }
    if (sector.faction === 'VALARI') {
      return {
        coreGlow: 'bg-amber-400 border-amber-100 shadow-[0_0_16px_rgba(245,158,11,0.9)]',
        ringOuter: 'border-amber-400/50',
        accentText: 'text-amber-300',
        lineStroke: 'rgba(251, 191, 36, 0.42)',
      };
    }
    if (sector.faction === 'SKITHID') {
      return {
        coreGlow: 'bg-emerald-400 border-emerald-100 shadow-[0_0_16px_rgba(16,185,129,0.9)]',
        ringOuter: 'border-emerald-400/50',
        accentText: 'text-emerald-300',
        lineStroke: 'rgba(52, 211, 153, 0.42)',
      };
    }
    if (sector.faction === 'CYGNUS') {
      return {
        coreGlow: 'bg-blue-500 border-blue-100 shadow-[0_0_16px_rgba(59,130,246,0.95)]',
        ringOuter: 'border-blue-400/55',
        accentText: 'text-blue-400',
        lineStroke: 'rgba(96, 165, 250, 0.45)',
      };
    }
    if (sector.status === 'Sector en Disputa') {
      return {
        coreGlow: 'bg-rose-500 border-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.95)]',
        ringOuter: 'border-rose-400/60',
        accentText: 'text-rose-300',
        lineStroke: 'rgba(244, 63, 94, 0.48)',
      };
    }
    return {
      coreGlow: 'bg-indigo-400 border-indigo-100 shadow-[0_0_16px_rgba(129,140,248,0.85)]',
      ringOuter: 'border-indigo-400/45',
      accentText: 'text-indigo-300',
      lineStroke: 'rgba(129, 140, 248, 0.38)',
    };
  };

  const getEnemyLevelStyle = (enemyLvl: number) => {
    const diff = enemyLvl - playerLevel;
    if (diff >= 10) {
      return {
        badge: 'bg-rose-950/85 border-rose-500/50 text-rose-300',
        dot: 'bg-rose-500 border-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.85)]',
        text: 'text-rose-300',
      };
    }
    if (diff >= 3) {
      return {
        badge: 'bg-amber-950/85 border-amber-500/50 text-amber-300',
        dot: 'bg-amber-400 border-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.85)]',
        text: 'text-amber-300',
      };
    }
    return {
      badge: 'bg-emerald-950/85 border-emerald-500/45 text-emerald-300',
      dot: 'bg-emerald-400 border-emerald-100 shadow-[0_0_12px_rgba(52,211,153,0.85)]',
      text: 'text-emerald-300',
    };
  };

  const handleSelectSector = (sector: StarSector) => {
    if (!isSectorUnlocked(sector)) {
      setHoveredSectorId(sector.id);
      setAnomalyNoticeSectorId(sector.id);
      setTimeout(() => {
        setAnomalyNoticeSectorId((prev) => (prev === sector.id ? null : prev));
      }, 2600);
      return;
    }
    setZoomedSectorId(sector.id);
    setHoveredSectorId(null);
    setSelectedPlanetId(null);
  };

  const handleBackToGalaxy = () => {
    setSelectedPlanetId(null);
    setZoomedSectorId(null);
  };

  const activeSectorBeacon = zoomedSector
    ? getBeaconTheme(zoomedSector, true)
    : null;

  return (
    <section
      aria-label="Cartografía del Mapa Estelar"
      className="relative isolate z-10 w-full flex flex-col items-center select-none animate-in fade-in duration-300"
    >
      {/* CONTENEDOR MAESTRO COMPARTIDO */}
      <div
        style={{
          maxWidth: 'min(1560px, calc((100vh - 165px) * 16 / 9))',
        }}
        className="w-full mx-auto flex flex-col gap-2"
      >
        {/* 1. BARRA SUPERIOR TÁCTICA DE NAVEGACIÓN (2 FILAS SIN TRUNCADO, MISMO ANCHO QUE EL MAPA) */}
        <header className="w-full bg-[#0E131D]/92 backdrop-blur-xl border border-slate-300/[0.14] rounded-xl px-4 py-2.5 flex flex-col gap-2 shadow-xl shrink-0">
          {/* Fila 1: Estado de Cartografía y Sector Activo (100% legible sin truncado) */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {zoomedSector ? (
                <button
                  type="button"
                  onClick={handleBackToGalaxy}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/15 hover:border-white/30 font-mono text-[11px] font-bold text-slate-100 flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>VISTA GALÁCTICA</span>
                  <span className="ml-0.5 px-1 py-0.2 rounded bg-black/60 border border-white/10 text-[9px] text-slate-400">
                    ESC
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Compass className={`w-4 h-4 ${playerTheme.accentText} shrink-0`} />
                  <span className="font-mono text-xs font-bold tracking-wider uppercase text-slate-100">
                    MAPA ESTELAR · CARTOGRAFÍA
                  </span>
                  <TutorialBeacon
                    stepNumber={1}
                    label="SECTORES TIER I-V"
                    isActive={isTutorialActive}
                    factionId={playerFactionId}
                  />
                </div>
              )}

              <span className="text-slate-600">·</span>

              {zoomedSector ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`font-mono text-xs font-bold uppercase tracking-wider ${playerTheme.accentText}`}
                  >
                    {zoomedSector.name}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="font-mono text-xs text-slate-300">
                    {zoomedSector.planets.length} órbitas (Tiers{' '}
                    {zoomedSector.planets[0]?.tierRoman}–
                    {zoomedSector.planets[zoomedSector.planets.length - 1]?.tierRoman})
                  </span>
                  <TutorialBeacon
                    stepNumber={2}
                    label="ÓRBITAS PLANETARIAS"
                    isActive={isTutorialActive}
                    factionId={playerFactionId}
                  />
                </div>
              ) : (
                <span className="font-mono text-xs text-slate-300">
                  Sector Natal (Tiers I–III) + Corredor de Orión (Tiers IV–V) activos
                </span>
              )}
            </div>

            <TutorialBeacon
              stepNumber={3}
              label="ANOMALÍAS BLOQUEADAS"
              isActive={isTutorialActive && !zoomedSector}
              factionId={playerFactionId}
            />
          </div>

          {/* Fila 2: Botonera de los 6 sectores distribuida a todo el ancho del mapa */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 pt-1.5 border-t border-white/8">
            {SECTORS_DATA.map((sec) => {
              const unlocked = isSectorUnlocked(sec);
              const isCurrent = zoomedSectorId === sec.id;
              const b = getBeaconTheme(sec, unlocked);

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleSelectSector(sec)}
                  title={
                    unlocked
                      ? `Entrar a ${sec.name}`
                      : `[ANOMALÍA LETAL DETECTADA] ${sec.name} bloqueado por interferencia gravitacional`
                  }
                  className={`w-full px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                    !unlocked
                      ? 'bg-rose-950/35 text-rose-200/90 border border-rose-500/30 hover:border-rose-400/50'
                      : isCurrent
                        ? 'bg-slate-800/95 text-white border border-white/25 shadow-sm'
                        : 'bg-black/45 text-slate-200 hover:text-white border border-white/10 hover:border-white/25'
                  }`}
                >
                  {unlocked ? (
                    <span className={`w-2 h-2 rounded-full shrink-0 ${b.coreGlow}`} />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-300 shrink-0 animate-glitch-danger" />
                  )}
                  <span className="leading-tight">{sec.name}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* 2. LIENZO 16:9 COMPLETO */}
        <div
          onClick={() => {
            if (selectedPlanetId) {
              setSelectedPlanetId(null);
            }
          }}
          className="relative isolate w-full aspect-[16/9] rounded-2xl bg-[#04070e] border border-white/10 overflow-hidden shadow-2xl"
        >
          {/* CAPA 0: FONDO 16:9 */}
          {!zoomedSector ? (
            <div
              key="galaxy-overview-canvas"
              className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 animate-in fade-in duration-500"
            >
              <img
                src="/assets/backgrounds/galaxy-vanguard-16x9.jpg"
                alt="Mapa Estelar General de la Galaxia Vanguard"
                className="w-full h-full object-cover object-center select-none pointer-events-none saturate-[0.76] brightness-[0.84] contrast-[1.06]"
                draggable={false}
              />
            </div>
          ) : (
            <div
              key={`sector-interior-${zoomedSector.id}`}
              className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 animate-in fade-in zoom-in-95 duration-500"
            >
              <img
                src={zoomedSector.sectorImage}
                alt={`Región estelar de ${zoomedSector.name}`}
                className="w-full h-full object-cover object-center select-none pointer-events-none saturate-[0.76] brightness-[0.84] contrast-[1.06]"
                draggable={false}
              />
            </div>
          )}

          {/* CAPA 5: FILTRO ÓPTICO PERMANENTE */}
          <div className="pointer-events-none absolute inset-0 z-5 overflow-hidden">
            <div className="absolute inset-0 bg-[#050912]/22 mix-blend-multiply" />
            <div
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, rgba(0,0,0,0.22) 1px, rgba(0,0,0,0.22) 3px)',
              }}
              className="absolute inset-0 opacity-75"
            />
            <svg className="absolute inset-0 w-full h-full opacity-[0.055] mix-blend-overlay">
              <filter id="vanguard-star-grain">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.82"
                  numOctaves="3"
                  stitchTiles="stitch"
                />
              </filter>
              <rect width="100%" height="100%" filter="url(#vanguard-star-grain)" />
            </svg>
          </div>

          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_85px_rgba(3,6,12,0.92)] z-5" />

          {/* CAPA 8: LÍNEAS VECTORIALES DE SALTO */}
          {!zoomedSector ? (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 w-full h-full overflow-visible z-8"
            >
              <g className="opacity-60">
                {SECTOR_JUMP_LINKS.map(([fromId, toId]) => {
                  const fromSec = SECTORS_DATA.find((s) => s.id === fromId);
                  const toSec = SECTORS_DATA.find((s) => s.id === toId);
                  if (!fromSec || !toSec) return null;
                  const bothUnlocked =
                    isSectorUnlocked(fromSec) && isSectorUnlocked(toSec);
                  return (
                    <line
                      key={`${fromId}-${toId}`}
                      x1={fromSec.coordinates.x}
                      y1={fromSec.coordinates.y}
                      x2={toSec.coordinates.x}
                      y2={toSec.coordinates.y}
                      stroke={
                        bothUnlocked
                          ? 'rgba(56, 189, 248, 0.42)'
                          : 'rgba(244, 63, 94, 0.24)'
                      }
                      strokeWidth={bothUnlocked ? '0.18' : '0.13'}
                      strokeDasharray="0.8 0.6"
                    />
                  );
                })}
              </g>
            </svg>
          ) : (
            <>
              {activeSectorBeacon && (
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 w-full h-full overflow-visible z-8"
                >
                  {zoomedSector.planets.map((planet, idx) => {
                    if (idx === 0) return null;
                    const prev = zoomedSector.planets[idx - 1];
                    return (
                      <line
                        key={`chain-${planet.id}`}
                        x1={prev.sectorCoords.x}
                        y1={prev.sectorCoords.y}
                        x2={planet.sectorCoords.x}
                        y2={planet.sectorCoords.y}
                        stroke={activeSectorBeacon.lineStroke}
                        strokeWidth="0.18"
                        strokeDasharray="0.8 0.55"
                      />
                    );
                  })}
                </svg>
              )}

              <div className="pointer-events-none absolute top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#070b12]/90 backdrop-blur-md border border-white/15 flex items-center gap-2 shadow-xl z-20">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-200 whitespace-nowrap">
                  {zoomedSector.designation}
                </span>
              </div>
            </>
          )}

          {/* AVISO FLOTANTE CUANDO EL JUGADOR HACE CLIC EN UN SECTOR CON ANOMALÍA LETAL */}
          {anomalyNoticeSectorId && !zoomedSector && (
            <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-rose-950/95 backdrop-blur-xl border border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.45)] flex items-center gap-2.5 z-40 animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-glitch-danger" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-200">
                [ANOMALÍA LETAL DETECTADA // SEÑAL CORRUPTA — TIERS VI–X]
              </span>
            </div>
          )}

          {/* CAPA 10: NODOS DE LOS 6 SECTORES */}
          {!zoomedSector && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              {SECTORS_DATA.map((sector) => {
                const { x: screenX, y: screenY } = sector.coordinates;
                const unlocked = isSectorUnlocked(sector);
                const isHovered = hoveredSectorId === sector.id;
                const beacon = getBeaconTheme(sector, unlocked);

                const minTier = sector.planets[0]?.tierRoman || 'I';
                const maxTier =
                  sector.planets[sector.planets.length - 1]?.tierRoman || 'III';
                const minPlanetLvl = Math.min(...sector.planets.map((p) => p.enemyLevel));
                const maxPlanetLvl = Math.max(...sector.planets.map((p) => p.enemyLevel));
                const showTooltipBelow = screenY < 34;

                return (
                  <div
                    key={sector.id}
                    style={{ left: `${screenX}%`, top: `${screenY}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                  >
                    <div
                      onMouseEnter={() => setHoveredSectorId(sector.id)}
                      onMouseLeave={() => setHoveredSectorId(null)}
                      className="relative flex flex-col items-center group"
                    >
                      {/* Tooltip Emergente del Sector */}
                      {isHovered && (
                        <div
                          className={`pointer-events-none absolute ${
                            showTooltipBelow
                              ? 'top-[calc(100%+10px)]'
                              : 'bottom-[calc(100%+10px)]'
                          } left-1/2 -translate-x-1/2 w-72 p-3.5 rounded-xl bg-[#0E131D]/95 backdrop-blur-2xl border ${
                            unlocked ? 'border-slate-300/[0.16]' : 'border-rose-500/50'
                          } shadow-[0_16px_40px_rgba(0,0,0,0.92)] z-40 animate-in fade-in duration-150`}
                        >
                          <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-300/[0.12]">
                            <span className="font-display text-[13px] font-bold uppercase tracking-wider text-slate-100">
                              {sector.name}
                            </span>
                            <span
                              className={`font-mono text-[10px] font-bold ${beacon.accentText}`}
                            >
                              {unlocked
                                ? `TIER ${minTier}–${maxTier} · NV. ${minPlanetLvl}–${maxPlanetLvl}`
                                : 'TIER VI–X'}
                            </span>
                          </div>

                          {unlocked ? (
                            <>
                              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-2">
                                <span>{sector.status}</span>
                                <span className="text-slate-400">
                                  {sector.planets.length} Órbitas
                                </span>
                              </div>

                              {sector.influence && (
                                <div className="mb-2 pt-1.5 border-t border-white/10 flex flex-col gap-1">
                                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                    <span className="flex items-center gap-1 text-rose-300 font-bold">
                                      <Swords className="w-3 h-3" /> Disputa Activa
                                    </span>
                                    <span>
                                      V {sector.influence.valari}% · S{' '}
                                      {sector.influence.skithid}% · C{' '}
                                      {sector.influence.cygnus}%
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full flex overflow-hidden bg-slate-900 border border-white/10">
                                    <div
                                      style={{ width: `${sector.influence.valari}%` }}
                                      className="h-full bg-amber-400"
                                    />
                                    <div
                                      style={{ width: `${sector.influence.skithid}%` }}
                                      className="h-full bg-emerald-400"
                                    />
                                    <div
                                      style={{ width: `${sector.influence.cygnus}%` }}
                                      className="h-full bg-blue-500"
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] font-mono text-slate-400">
                                <span>Click para abrir órbitas</span>
                                <span className={beacon.accentText}>ENTRAR →</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                                <Radio className="w-3.5 h-3.5 animate-pulse" />
                                <span>ANOMALÍA LETAL DETECTADA // SEÑAL CORRUPTA</span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                Tormenta gravitacional de alta densidad bloquea el salto hiperespacial hacia este sector (Tiers VI–X).
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSector(sector);
                        }}
                        className="flex flex-col items-center cursor-pointer focus:outline-none"
                      >
                        <div className="relative flex items-center justify-center">
                          <span
                            className={`absolute w-13 h-13 rounded-full border border-dashed ${beacon.ringOuter} ${
                              unlocked
                                ? 'opacity-0 group-hover:opacity-80'
                                : 'opacity-65 animate-pulse'
                            } transition-opacity duration-300`}
                          />
                          {unlocked ? (
                            <div className="w-9 h-9 rounded-full bg-[#070b12]/85 border border-white/25 group-hover:border-white/60 group-hover:scale-110 flex items-center justify-center transition-all duration-300 shadow-2xl">
                              <div
                                className={`w-3.5 h-3.5 rounded-full border ${beacon.coreGlow}`}
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-rose-950/85 border border-rose-500/60 group-hover:border-rose-400 flex items-center justify-center transition-all duration-300 shadow-[0_0_18px_rgba(244,63,94,0.65)] animate-glitch-danger">
                              <AlertTriangle className="w-4 h-4 text-rose-300" />
                            </div>
                          )}
                        </div>

                        <div
                          className={`mt-1.5 px-3 py-1 rounded-lg backdrop-blur-md border flex items-center gap-2 shadow-2xl transition-all ${
                            unlocked
                              ? 'bg-[#070b12]/90 border-white/15 group-hover:border-white/35'
                              : 'bg-rose-950/75 border-rose-500/35 group-hover:border-rose-400/60'
                          }`}
                        >
                          <span
                            className={`font-display text-[13px] font-bold tracking-wide whitespace-nowrap ${
                              unlocked
                                ? 'text-slate-100 group-hover:text-white'
                                : 'text-rose-200'
                            }`}
                          >
                            {sector.name}
                          </span>
                          <span
                            className={`font-mono text-xs font-bold ${beacon.accentText}`}
                          >
                            {unlocked ? `Tier ${minTier}-${maxTier}` : 'ANOMALÍA'}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CAPA 20: DOTS PLANETARIOS EN LA REGIÓN INTERIOR DEL SECTOR */}
          {zoomedSector && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              {zoomedSector.planets.map((planet) => {
                const { x: screenX, y: screenY } = planet.sectorCoords;
                const isSelected = planet.id === selectedPlanetId;
                const isCurrentPlayerLoc = Boolean(
                  currentLocation && currentLocation.includes(planet.name)
                );
                const lvlStyle = getEnemyLevelStyle(planet.enemyLevel);

                return (
                  <div
                    key={planet.id}
                    style={{ left: `${screenX}%`, top: `${screenY}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-all duration-500 animate-in fade-in zoom-in-95"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlanetId(isSelected ? null : planet.id);
                      }}
                      className="group relative flex items-center justify-center cursor-pointer focus:outline-none"
                    >
                      <div className="relative flex items-center justify-center">
                        {isSelected && (
                          <span className="absolute w-11 h-11 rounded-full border border-white/60 bg-white/5 animate-pulse" />
                        )}
                        <div
                          className={`w-6.5 h-6.5 rounded-full flex items-center justify-center border transition-all duration-200 ${
                            isSelected
                              ? 'bg-[#0b1019]/90 border-white scale-115 shadow-[0_0_16px_rgba(255,255,255,0.5)]'
                              : 'bg-[#070b12]/75 border-white/30 group-hover:border-white/75 group-hover:scale-110 shadow-lg'
                          }`}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full border ${lvlStyle.dot}`} />
                        </div>

                        {isCurrentPlayerLoc && (
                          <span
                            title="Ubicación actual del Héroe"
                            className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#070b12] border border-amber-400 flex items-center justify-center shadow"
                          >
                            <MapPin className="w-2 h-2 text-amber-400" />
                          </span>
                        )}
                      </div>

                      {/* Etiqueta táctica flotante con TIER I-V (sin RANGO redundante) */}
                      <div
                        className={`
                          absolute left-1/2 -translate-x-1/2 ${
                            screenY > 80 ? 'bottom-[calc(100%+10px)]' : 'top-[calc(100%+10px)]'
                          }
                          px-3 py-1 rounded-lg backdrop-blur-md border transition-all flex flex-col items-center shadow-xl z-20 ${
                            isSelected
                              ? 'bg-[#0b1019]/95 border-white/55 scale-105'
                              : 'bg-[#070b12]/90 border-white/15 group-hover:border-white/35'
                          }
                        `}
                      >
                        <span className="font-display text-xs font-bold tracking-wide text-slate-100 whitespace-nowrap">
                          {planet.name}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-xs mt-0.5 whitespace-nowrap">
                          <span className="text-slate-300 font-semibold">
                            TIER {planet.tierRoman}
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className={`font-bold ${lvlStyle.text}`}>
                            NV. {planet.enemyLevel}
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* CAPA 30: CARD TÁCTICA EMERGENTE DEL PLANETA SELECCIONADO */}
          {zoomedSector && selectedPlanet && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                left:
                  selectedPlanet.sectorCoords.x > 52
                    ? `calc(${selectedPlanet.sectorCoords.x}% - 385px)`
                    : `calc(${selectedPlanet.sectorCoords.x}% + 34px)`,
                top: `${Math.max(7, Math.min(34, selectedPlanet.sectorCoords.y - 18))}%`,
              }}
              className="absolute z-30 w-[368px] rounded-2xl bg-[#0E131D]/95 backdrop-blur-2xl border border-slate-300/[0.16] shadow-[0_24px_60px_rgba(2,5,12,0.92)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="relative w-full h-32 bg-[#080C14] overflow-hidden border-b border-slate-300/[0.12]">
                <img
                  src={selectedPlanet.image}
                  alt={selectedPlanet.name}
                  className="w-full h-full object-cover object-right saturate-[0.84] brightness-[0.9] contrast-[1.05]"
                />
                <div
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(to bottom, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, rgba(0,0,0,0.18) 1px, rgba(0,0,0,0.18) 3px)',
                  }}
                  className="pointer-events-none absolute inset-0 opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0E131D]/92 via-[#0E131D]/35 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0E131D] via-[#0E131D]/55 to-transparent pointer-events-none" />

                <div className="absolute top-2.5 left-3.5 flex items-center gap-1.5 font-mono z-10">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#141C2B]/90 backdrop-blur-md border border-slate-300/[0.18] text-xs font-bold text-slate-100">
                    TIER {selectedPlanet.tierRoman}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md backdrop-blur-md border text-xs font-bold ${
                      getEnemyLevelStyle(selectedPlanet.enemyLevel).badge
                    }`}
                  >
                    NV. {selectedPlanet.enemyLevel}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPlanetId(null)}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-[#141C2B]/90 hover:bg-[#1E293B] border border-slate-300/[0.16] hover:border-white/35 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors z-10"
                  title="Cerrar ficha planetaria (ESC)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="absolute bottom-2.5 left-3.5 right-14 flex flex-col z-10">
                  <h3 className="text-base font-display font-bold text-slate-100 tracking-wide truncate drop-shadow">
                    {selectedPlanet.name}
                  </h3>
                  <span className="text-xs font-mono text-slate-300 truncate">
                    {selectedPlanet.type}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-3">
                <div className="rounded-xl bg-[#141C2B]/78 border border-slate-300/[0.12] p-3 flex flex-col gap-1.5 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                      <FileText className={`w-3.5 h-3.5 ${playerTheme.accentText}`} />
                      Amenaza Orbital
                    </span>
                    <span className="text-amber-200 font-bold">
                      {selectedPlanet.threatLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedPlanet.lore}
                  </p>
                </div>

                <div className="rounded-xl bg-[#141C2B]/78 border border-slate-300/[0.12] p-3 flex flex-col gap-2 font-mono">
                  <span className="text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    <Zap className={`w-3.5 h-3.5 ${playerTheme.accentText}`} />
                    Materiales Extraíbles (Tier {selectedPlanet.tierRoman})
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {selectedPlanet.combatLoot.map((lootItem, idx) => (
                      <div
                        key={lootItem.id}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0E131D]/90 border border-slate-300/[0.12] text-xs font-medium text-slate-200 min-w-0 ${
                          selectedPlanet.combatLoot.length === 3 && idx === 2
                            ? 'col-span-2'
                            : ''
                        }`}
                        title={lootItem.name}
                      >
                        <span className="shrink-0">
                          {renderResourceCostIcon(lootItem.id)}
                        </span>
                        <span className="truncate">{lootItem.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onNavigateToSector && onNavigateToSector(zoomedSector, selectedPlanet)
                  }
                  className={`w-full min-h-[42px] px-4 py-2 rounded-xl border text-[13px] font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${playerTheme.primaryButton}`}
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>DESPLEGAR EN {selectedPlanet.name}</span>
                </button>
              </div>
            </div>
          )}

          {/* CAPA 25: INDICADOR TÁCTICO INFERIOR Y LEYENDA DE DIFICULTAD */}
          <div className="pointer-events-none absolute bottom-3 inset-x-4 flex items-end justify-between gap-3 z-25">
            {zoomedSector &&
            zoomedSector.status === 'Sector en Disputa' &&
            zoomedSector.influence ? (
              <div className="pointer-events-auto w-80 rounded-xl bg-[#070b12]/90 backdrop-blur-xl border border-white/12 p-3 flex flex-col gap-1.5 font-mono shadow-2xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-rose-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-rose-400" /> Disputa Territorial
                  </span>
                  <span className="text-slate-300">
                    V {zoomedSector.influence.valari}% · S {zoomedSector.influence.skithid}% · C{' '}
                    {zoomedSector.influence.cygnus}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full flex overflow-hidden bg-slate-900 border border-white/10">
                  <div
                    style={{ width: `${zoomedSector.influence.valari}%` }}
                    className="h-full bg-amber-400"
                  />
                  <div
                    style={{ width: `${zoomedSector.influence.skithid}%` }}
                    className="h-full bg-emerald-400"
                  />
                  <div
                    style={{ width: `${zoomedSector.influence.cygnus}%` }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#070b12]/85 backdrop-blur-md border border-white/10 font-mono text-xs text-slate-300 shadow-xl">
                <Crosshair className={`w-3.5 h-3.5 ${playerTheme.accentText}`} />
                <span>
                  {zoomedSector
                    ? 'Haz clic en cualquier órbita planetaria (Tier I a V) para abrir su ficha táctica y desplegar'
                    : 'Sector Natal (Tiers I–III) y Corredor de Orión (Tiers IV–V) habilitados · Resto bajo Anomalía Letal'}
                </span>
              </div>
            )}

            {/* Derecha: Leyenda de Dificultad */}
            <div className="hidden lg:flex items-center gap-3.5 px-3.5 py-1.5 rounded-xl bg-[#070b12]/85 backdrop-blur-md border border-white/10 font-mono text-xs text-slate-300 shadow-xl">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Nivel Adecuado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Exigente
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Anomalía / Crítico
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};