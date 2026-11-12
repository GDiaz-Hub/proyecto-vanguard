// src/components/ReactorCentral.tsx
import React, { useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Biohazard,
  Box,
  CheckCircle2,
  CircuitBoard,
  Coins,
  Compass,
  Cpu,
  Crosshair,
  Cuboid,
  Database,
  Flame,
  Gauge,
  Hexagon,
  Layers,
  Lock,
  Microchip,
  Power,
  Shield,
  Sliders,
  UserCheck,
  Zap,
} from 'lucide-react';
import {
  CHASSIS_MK_LABELS,
  CHASSIS_SLOT_LABELS,
  FACTION_REACTOR_SKINS,
  GAME_BALANCE,
  REACTOR_ROUTING_PROTOCOLS,
} from '../data/factionIdentityCatalog';
import { getFactionTheme } from '../data/themeConfig';
import {
  FactionId,
  HeroChassisSlot,
  HeroLoadout,
  ReactorRoutingMode,
} from '../types/game';
import { TutorialBeacon } from './OnboardingTutorialOverlay';

export interface ReactorCostRequirement {
  id: string;
  label: string;
  required: number;
  owned: number;
}

export interface ReactorCentralProps {
  factionId?: FactionId;
  reactorLevel?: number;
  maxReactorLevel?: number;
  forgeLevel?: number;
  labLevel?: number;
  siloLevel?: number;
  commanderBaseMw?: number;
  conductorTechBonusMw?: number;
  heroLoadout?: HeroLoadout;
  onToggleChassisLowPower?: (slot: HeroChassisSlot) => void;
  routingMode?: ReactorRoutingMode;
  onChangeRoutingMode?: (mode: ReactorRoutingMode) => void;
  upgradeCosts?: ReactorCostRequirement[];
  canUpgrade?: boolean;
  onUpgrade?: () => void;
  upgradeTimer?: { startTime?: number; endTime: number; durationSec?: number };
  nowTimestamp?: number;
  isTutorialActive?: boolean;
}

const CHASSIS_SLOTS: HeroChassisSlot[] = [
  'weapon',
  'chest',
  'helmet',
  'gloves',
  'boots',
];

const renderStorageResourceIcon = (costId: string) => {
  const id = costId.toLowerCase();
  if (id.includes('ferrita')) {
    return <Cuboid className="w-4 h-4 text-amber-400 shrink-0" />;
  }
  if (id.includes('titanio')) {
    return <Box className="w-4 h-4 text-amber-300 shrink-0" />;
  }
  if (id.includes('quitina')) {
    return <Hexagon className="w-4 h-4 text-[#F5F2EB] shrink-0" />;
  }
  if (id.includes('espora')) {
    return <Biohazard className="w-4 h-4 text-emerald-400 shrink-0" />;
  }
  if (id.includes('silicio')) {
    return <Microchip className="w-4 h-4 text-blue-400 shrink-0" />;
  }
  if (id.includes('cromo')) {
    return <CircuitBoard className="w-4 h-4 text-blue-300 shrink-0" />;
  }
  return <Coins className="w-4 h-4 text-amber-400 shrink-0" />;
};

const getProtocolIcon = (id: Exclude<ReactorRoutingMode, 'none'>) => {
  if (id === 'industrial') return Flame;
  if (id === 'orbital') return Compass;
  return Crosshair;
};

export const ReactorCentral: React.FC<ReactorCentralProps> = ({
  factionId = 'valari',
  reactorLevel = 1,
  maxReactorLevel = 20,
  forgeLevel = 1,
  labLevel = 1,
  siloLevel = 1,
  commanderBaseMw = 80,
  conductorTechBonusMw = 0,
  heroLoadout,
  onToggleChassisLowPower,
  routingMode = 'none',
  onChangeRoutingMode,
  upgradeCosts = [],
  canUpgrade = true,
  onUpgrade,
  upgradeTimer,
  nowTimestamp = Date.now(),
  isTutorialActive = false,
}) => {
  const skin = FACTION_REACTOR_SKINS[factionId] || FACTION_REACTOR_SKINS.valari;
  const [isIgnitingUpgrade, setIsIgnitingUpgrade] = useState<boolean>(false);

  const isMaxLevel = reactorLevel >= maxReactorLevel;
  const isUpgrading = Boolean(
    upgradeTimer && upgradeTimer.endTime > nowTimestamp
  );
  const upgradeRemainingSec =
    isUpgrading && upgradeTimer
      ? Math.max(1, Math.ceil((upgradeTimer.endTime - nowTimestamp) / 1000))
      : 0;
  const totalDurationMs = upgradeTimer?.durationSec
    ? upgradeTimer.durationSec * 1000
    : upgradeTimer?.startTime
      ? Math.max(1000, upgradeTimer.endTime - upgradeTimer.startTime)
      : 15000;
  const upgradeProgressPct =
    isUpgrading && upgradeTimer
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              ((totalDurationMs - (upgradeTimer.endTime - nowTimestamp)) /
                Math.max(1, totalDurationMs)) *
                100
            )
          )
        )
      : 0;

  // Potencia suministrada por el Reactor (+15% pasiva para Cygnus, +bono de Laboratorio)
  const cygnusMultiplier =
    factionId === 'cygnus'
      ? GAME_BALANCE.reactor.cygnusCapacityMultiplier
      : 1.0;
  const rawCapacity =
    GAME_BALANCE.reactor.baseMw +
    (reactorLevel - 1) * GAME_BALANCE.reactor.mwPerLevel +
    conductorTechBonusMw;
  const rawNextCapacity =
    GAME_BALANCE.reactor.baseMw +
    reactorLevel * GAME_BALANCE.reactor.mwPerLevel +
    conductorTechBonusMw;

  const totalCapacityMw = Math.round(rawCapacity * cygnusMultiplier);
  const nextLevelCapacityMw = Math.round(rawNextCapacity * cygnusMultiplier);
  const mwDelta = nextLevelCapacityMw - totalCapacityMw;

  // Pasiva canónica Skithid: -12% Consumo en Núcleo en los 5 Chasis
  const commanderEffectiveMw =
    factionId === 'skithid'
      ? Math.round(
          commanderBaseMw * GAME_BALANCE.reactor.skithidChassisMwMultiplier
        )
      : commanderBaseMw;

  // Consumo operativo de las 3 instalaciones dependientes
  const forgeMw =
    GAME_BALANCE.reactor.forgeBaseMw +
    (forgeLevel - 1) * GAME_BALANCE.reactor.forgeMwPerLevel;
  const labMw =
    GAME_BALANCE.reactor.labBaseMw +
    (labLevel - 1) * GAME_BALANCE.reactor.labMwPerLevel;
  const siloMw =
    GAME_BALANCE.reactor.siloBaseMw +
    (siloLevel - 1) * GAME_BALANCE.reactor.siloMwPerLevel;
  const citadelModulesMw = forgeMw + labMw + siloMw;

  const totalUsedMw = commanderEffectiveMw + citadelModulesMw;
  const reserveMw = Math.max(0, totalCapacityMw - totalUsedMw);
  const loadPercentage = Math.min(
    100,
    Math.round((totalUsedMw / Math.max(1, totalCapacityMw)) * 100)
  );

  const activeProtocolCfg =
    routingMode !== 'none'
      ? REACTOR_ROUTING_PROTOCOLS.find((p) => p.id === routingMode)
      : null;

  const handleTriggerUpgrade = () => {
    if (!canUpgrade || isMaxLevel || isUpgrading) return;
    setIsIgnitingUpgrade(true);
    setTimeout(() => setIsIgnitingUpgrade(false), 650);
    if (onUpgrade) {
      onUpgrade();
    }
  };

  const dependentInstallations = [
    {
      id: 'forja',
      name: skin.forgeModuleName,
      role: 'Manufactura y Equipamiento',
      level: forgeLevel,
      drawMw: forgeMw,
      icon: Flame,
    },
    {
      id: 'laboratorio',
      name: skin.labModuleName,
      role: 'Investigación I+D',
      level: labLevel,
      drawMw: labMw,
      icon: Sliders,
    },
    {
      id: 'silo',
      name: skin.siloModuleName,
      role: 'Almacenamiento',
      level: siloLevel,
      drawMw: siloMw,
      icon: Database,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-5 text-slate-200 select-none">
      {/* CABECERA UNIFICADA DEL REACTOR CENTRAL (IDÉNTICA JERARQUÍA VISUAL Y BOTÓN QUE FORJA, LABORATORIO Y SILO) */}
      <header
        className={`w-full p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${skin.panelContainer}`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`relative w-12 h-12 rounded-xl bg-[#182232]/80 border ${skin.accentBorder} flex items-center justify-center shrink-0 shadow-md`}
          >
            <Zap className={`w-6 h-6 ${skin.accentText}`} />
            <span
              className={`absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded bg-black/90 border border-white/20 text-xs font-mono font-bold ${skin.accentText} leading-none tabular-nums`}
            >
              Nv.{reactorLevel}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100 uppercase tracking-wide leading-tight">
                {skin.reactorTitle} · Nivel {reactorLevel}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono font-semibold text-slate-200">
                Techo de Instalaciones Nv.{reactorLevel}
              </span>
              <span className="text-xs font-mono text-slate-400 tabular-nums">
                Red: <strong className="text-white">{totalUsedMw} / {totalCapacityMw} MW</strong>{' '}
                <span className={`${skin.accentText} font-semibold`}>
                  ({reserveMw} MW Libres)
                </span>
              </span>
            </div>
            <p className="text-[13px] sm:text-sm text-slate-300 mt-1 leading-snug">
              {skin.reactorSubtitle}
            </p>
          </div>
        </div>

        {/* COSTES Y BOTÓN DE MEJORA ESTANDARIZADO (MISMA POSICIÓN Y TAMAÑO QUE FORJA, LAB Y SILO) */}
        <div className="flex flex-wrap items-center gap-2.5 xl:justify-end shrink-0">
          {!isMaxLevel &&
            upgradeCosts.map((cost) => {
              const hasEnough = cost.owned >= cost.required;
              return (
                <div
                  key={cost.id}
                  title={cost.label}
                  className={`min-h-[42px] px-3.5 py-2 rounded-xl border font-mono text-[13px] flex items-center gap-2 tabular-nums ${
                    hasEnough
                      ? 'bg-black/45 border-white/12 text-slate-200'
                      : 'bg-rose-950/40 border-rose-500/35 text-rose-200'
                  }`}
                >
                  {renderStorageResourceIcon(cost.id)}
                  <span className="text-slate-300">{cost.label}:</span>
                  <span className="font-bold text-white">
                    {cost.owned.toLocaleString('es-ES')} /{' '}
                    {cost.required.toLocaleString('es-ES')}
                  </span>
                </div>
              );
            })}

          <button
            type="button"
            disabled={!canUpgrade || isMaxLevel || isUpgrading}
            onClick={handleTriggerUpgrade}
            className={`min-h-[42px] min-w-[186px] px-4 py-2 rounded-xl text-[13px] font-display font-bold uppercase tracking-wider shrink-0 flex items-center justify-center gap-2 ${
              isUpgrading
                ? 'bg-amber-950/60 border border-amber-400/50 text-amber-200 cursor-wait'
                : canUpgrade && !isMaxLevel
                  ? `${getFactionTheme(factionId).primaryButton} ring-2 ring-emerald-400/80 shadow-[0_0_22px_rgba(16,185,129,0.45)] transition-all cursor-pointer`
                  : 'bg-[#121824]/85 text-slate-500 border border-white/8 cursor-not-allowed'
            }`}
          >
            {canUpgrade && !isMaxLevel && !isUpgrading && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping shrink-0" />
            )}
            <span>
              {isMaxLevel
                ? 'Nivel Máximo'
                : isUpgrading
                  ? `Ampliando... (${upgradeRemainingSec}s)`
                  : `Ampliar a Nv.${reactorLevel + 1}`}
            </span>
          </button>
        </div>
      </header>

      {/* GRILLA DE 3 COLUMNAS SIMÉTRICAS E IGUALADAS EN ALTURA (items-stretch) */}
      <div className="grid grid-cols-1 xl:grid-cols-[11fr_10fr_11fr] gap-5 items-stretch">
        {/* =================================================================
            COLUMNA IZQUIERDA: DISTRIBUCIÓN Y REGULADOR DE EQUIPAMIENTO [BALIZA 1]
           ================================================================= */}
        <div
          className={`p-5 flex flex-col justify-start gap-4 h-full ${skin.panelContainer}`}
        >
          <div className="flex flex-col gap-4 justify-start">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <Activity className={`w-5 h-5 ${skin.accentText}`} />
                  <h2 className="text-[15px] sm:text-base font-display font-bold text-slate-100 uppercase tracking-wider">
                    Distribución de Red
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <TutorialBeacon
                    stepNumber={1}
                    label="Red y Regulador"
                    isActive={isTutorialActive}
                    factionId={factionId}
                  />
                  <span
                    className={`text-[13px] font-mono font-bold px-3 py-1 rounded-lg bg-white/5 border border-white/10 ${skin.accentText} tabular-nums`}
                  >
                    {reserveMw} MW LIBRES
                  </span>
                </div>
              </div>

              {/* BARRA GENERAL DE USO DE POTENCIA */}
              <div
                className={`p-4 flex flex-col gap-3 ${skin.subCardContainer}`}
              >
                <div className="flex items-center justify-between text-[13px] font-mono">
                  <span className="uppercase tracking-wider text-slate-200 font-semibold">
                    Consumo / Capacidad
                  </span>
                  <span className="font-bold text-white tabular-nums">
                    {loadPercentage}% ({totalUsedMw} / {totalCapacityMw} MW)
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-[#0E141F]/80 border border-slate-300/[0.12] overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${skin.accentBarFill}`}
                    style={{ width: `${loadPercentage}%` }}
                  />
                </div>

                {/* DESGLOSE EQUIPAMIENTO VS CIUDADELA */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-[#141C2B]/70 border border-slate-300/[0.10] flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                      <UserCheck
                        className={`w-4 h-4 ${skin.accentText} shrink-0`}
                      />
                      <span>Equipamiento Héroe</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm sm:text-base font-mono font-bold text-slate-100 tabular-nums">
                        {commanderEffectiveMw} MW
                      </span>
                      {factionId === 'skithid' && (
                        <span className="text-xs font-mono font-semibold text-emerald-300">
                          -12% Pasiva
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141C2B]/70 border border-slate-300/[0.10] flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                      <Layers
                        className={`w-4 h-4 ${skin.accentText} shrink-0`}
                      />
                      <span>Instalaciones</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm sm:text-base font-mono font-bold text-slate-100 tabular-nums">
                        {citadelModulesMw} MW
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        3 Nodos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* REGULADOR TÁCTICO DE EQUIPAMIENTO */}
            {heroLoadout && onToggleChassisLowPower && (
              <div
                className={`p-4 flex flex-col gap-3 ${skin.subCardContainer}`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[13px] font-mono font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${skin.accentBarFill}`}
                      />
                      <span>Regulador de Equipamiento (Liberar MW)</span>
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Atenuar pieza libera MW
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-300 leading-relaxed">
                    En niveles iniciales, pon 1 o 2 piezas en{' '}
                    <strong className="text-slate-100 font-semibold">
                      Modo Ahorro (-45% MW / -28% Stat)
                    </strong>{' '}
                    para reunir los MW Libres que exigen los Protocolos.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 pt-1">
                  {CHASSIS_SLOTS.map((slot) => {
                    const piece = heroLoadout[slot];
                    const isLowPower = Boolean(piece.lowPowerMode);
                    const fullMw = piece.powerDrawMw;
                    const lowMw = Math.max(
                      4,
                      Math.round(
                        fullMw * GAME_BALANCE.reactor.lowPowerChassisMwFactor
                      )
                    );
                    const savedMw = fullMw - lowMw;
                    const mkLabel =
                      CHASSIS_MK_LABELS[piece.level] || `Mk-${piece.level}`;

                    return (
                      <div
                        key={slot}
                        className="px-3.5 py-2.5 rounded-xl bg-[#121926]/85 border border-slate-300/[0.12] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`px-2 py-0.5 rounded bg-black/50 border border-white/10 text-xs font-mono font-bold ${skin.accentText}`}
                          >
                            {mkLabel}
                          </span>
                          <span className="text-[13px] sm:text-sm font-medium text-slate-100 truncate">
                            {CHASSIS_SLOT_LABELS[slot]}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onToggleChassisLowPower(slot)}
                          className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                            isLowPower
                              ? 'bg-amber-950/60 border-amber-400/50 text-amber-200'
                              : 'bg-white/5 hover:bg-white/10 border-white/15 text-slate-200'
                          }`}
                          title={
                            isLowPower
                              ? `Restaurar a Potencia Plena (${fullMw} MW)`
                              : `Atenuar a Bajo Consumo para liberar +${savedMw} MW`
                          }
                        >
                          <Power className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {isLowPower
                              ? `AHORRO (${lowMw} MW · +${savedMw} Libres)`
                              : `PLENA (${fullMw} MW)`}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =================================================================
            COLUMNA CENTRAL PROTAGONISTA: NÚCLEO CENTRAL + TECHO OPERATIVO SIMÉTRICO
           ================================================================= */}
        <div
          className={`h-full p-5 flex flex-col justify-start items-center gap-4 relative overflow-hidden ${skin.panelContainer} ${skin.coreChamberBg}`}
        >
          {/* Retícula técnica sutil de fondo */}
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Título Superior de Cámara */}
          <div className="relative z-10 w-full flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              {factionId === 'skithid' ? (
                <Hexagon className={`w-4 h-4 ${skin.accentText}`} />
              ) : factionId === 'cygnus' ? (
                <Cpu className={`w-4 h-4 ${skin.accentText}`} />
              ) : (
                <Shield className={`w-4 h-4 ${skin.accentText}`} />
              )}
              <span className="text-[13px] sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
                Cámara de Confinamiento
              </span>
            </div>

            <TutorialBeacon
              stepNumber={2}
              label="Núcleo Central"
              isActive={isTutorialActive}
              factionId={factionId}
            />
          </div>

          {/* ESTRUCTURA PROTAGONISTA DEL NÚCLEO (380px DE ANCHO × 340px DE ALTO) */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[380px] mx-auto">
            {/* SUBSISTEMA SUPERIOR */}
            <div className="w-full rounded-t-xl px-4 py-2 bg-[#182232]/85 border border-slate-300/[0.16] border-b-0 flex items-center justify-between gap-2">
              <span
                className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${skin.accentBarFill}`}
              />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200 text-center truncate">
                {skin.topSubsystemLabel}
              </span>
              <span
                className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${skin.accentBarFill}`}
              />
            </div>

            {/* 1. REACTOR SKITHID PROTAGONISTA CON CAPARAZÓN DE QUITINA COMPLETO Y PULSOS BIO-ELÉCTRICOS */}
            {factionId === 'skithid' && (
              <div className="relative w-full h-[335px] flex items-center justify-center overflow-hidden border border-emerald-400/30 bg-[#101923]/80 shadow-[inset_0_0_50px_rgba(16,185,129,0.12)]">
                <svg
                  viewBox="0 0 340 350"
                  className="pointer-events-none absolute inset-0 w-full h-full scale-[1.04]"
                  fill="none"
                >
                  <defs>
                    <linearGradient
                      id="skt-ivory-chitin"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#F5F2EB" />
                      <stop offset="55%" stopColor="#DFD9CA" />
                      <stop offset="100%" stopColor="#B8B09F" />
                    </linearGradient>
                    <linearGradient
                      id="skt-chitin-dark"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#E6E0D0" />
                      <stop offset="60%" stopColor="#C2B9A5" />
                      <stop offset="100%" stopColor="#8C8270" />
                    </linearGradient>
                    <linearGradient
                      id="skt-emerald-flow"
                      x1="50%"
                      y1="0%"
                      x2="50%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="rgba(46, 204, 113, 0.85)" />
                      <stop offset="50%" stopColor="rgba(16, 185, 129, 0.35)" />
                      <stop
                        offset="100%"
                        stopColor="rgba(46, 204, 113, 0.85)"
                      />
                    </linearGradient>
                  </defs>

                  <polygon
                    points="170,16 294,86 294,264 170,334 46,264 46,86"
                    stroke="rgba(46, 204, 113, 0.28)"
                    strokeWidth="1.8"
                    fill="rgba(2, 24, 19, 0.38)"
                  />
                  <polygon
                    points="170,36 272,96 272,254 170,314 68,254 68,96"
                    stroke="rgba(245, 242, 235, 0.22)"
                    strokeWidth="1.1"
                    strokeDasharray="6 4"
                    fill="none"
                  />

                  {/* Onda de resonancia metabólica sutil */}
                  <circle
                    cx="170"
                    cy="175"
                    r="68"
                    stroke="rgba(52, 211, 153, 0.45)"
                    strokeWidth="1.5"
                    fill="none"
                  >
                    <animate
                      attributeName="r"
                      values="64;118"
                      dur="3.4s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.5;0"
                      dur="3.4s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Conducto central con flujo bio-eléctrico animado */}
                  <line
                    x1="170"
                    y1="0"
                    x2="170"
                    y2="350"
                    stroke="url(#skt-emerald-flow)"
                    strokeWidth="10"
                  />
                  <line
                    x1="170"
                    y1="0"
                    x2="170"
                    y2="350"
                    stroke="#A7F3D0"
                    strokeWidth="2.5"
                    strokeDasharray="10 14"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="48;0"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </line>

                  {/* Nervios sinápticos diagonales con impulsos neuronales */}
                  <path
                    d="M 66 0 C 88 44, 112 72, 130 90 M 274 0 C 252 44, 228 72, 210 90"
                    stroke="rgba(46, 204, 113, 0.55)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 66 0 C 88 44, 112 72, 130 90 M 274 0 C 252 44, 228 72, 210 90"
                    stroke="#6EE7B7"
                    strokeWidth="2"
                    strokeDasharray="8 18"
                    strokeLinecap="round"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="52;0"
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                  </path>

                  <path
                    d="M 66 350 C 88 306, 112 278, 130 260 M 274 350 C 252 306, 228 278, 210 260"
                    stroke="rgba(46, 204, 113, 0.55)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 66 350 C 88 306, 112 278, 130 260 M 274 350 C 252 306, 228 278, 210 260"
                    stroke="#6EE7B7"
                    strokeWidth="2"
                    strokeDasharray="8 18"
                    strokeLinecap="round"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="0;52"
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Costillas y Placas Laterales de Quitina Marfil (Restauradas) */}
                  {/* Placas de quitina superiores-laterales */}
                  <polygon
                    points="34,82 88,62 96,134 52,152 26,118"
                    fill="url(#skt-ivory-chitin)"
                    stroke="#181715"
                    strokeWidth="2"
                  />
                  <polygon
                    points="306,82 252,62 244,134 288,152 314,118"
                    fill="url(#skt-ivory-chitin)"
                    stroke="#181715"
                    strokeWidth="2"
                  />
                  {/* Placas de quitina inferiores-laterales */}
                  <polygon
                    points="34,268 88,288 96,216 52,198 26,232"
                    fill="url(#skt-chitin-dark)"
                    stroke="#181715"
                    strokeWidth="2"
                  />
                  <polygon
                    points="306,268 252,288 244,216 288,198 314,232"
                    fill="url(#skt-chitin-dark)"
                    stroke="#181715"
                    strokeWidth="2"
                  />
                  {/* Quelíceros / Costillas internas de quitina abrazando el órgano */}
                  <path
                    d="M 56,162 L 98,150 L 92,175 L 98,200 L 56,188 Z"
                    fill="url(#skt-ivory-chitin)"
                    stroke="#181715"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M 284,162 L 242,150 L 248,175 L 242,200 L 284,188 Z"
                    fill="url(#skt-ivory-chitin)"
                    stroke="#181715"
                    strokeWidth="1.8"
                  />
                  {/* Poros bioluminiscentes incrustados en las placas de quitina */}
                  {[
                    { cx: 64, cy: 104, dur: '2.8s' },
                    { cx: 276, cy: 104, dur: '2.8s' },
                    { cx: 64, cy: 246, dur: '3.2s' },
                    { cx: 276, cy: 246, dur: '3.2s' },
                    { cx: 74, cy: 175, dur: '2.2s' },
                    { cx: 266, cy: 175, dur: '2.2s' },
                  ].map((pore, idx) => (
                    <circle
                      key={`chitin-pore-${idx}`}
                      cx={pore.cx}
                      cy={pore.cy}
                      r="3.2"
                      fill="#10B981"
                      stroke="#052E16"
                      strokeWidth="1"
                    >
                      <animate
                        attributeName="fill"
                        values="#10B981;#6EE7B7;#10B981"
                        dur={pore.dur}
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}

                  {/* Coronas de quitina dorsal y ventral */}
                  <path
                    d="M 96 44 L 170 18 L 244 44 L 222 68 L 170 50 L 118 68 Z"
                    fill="url(#skt-ivory-chitin)"
                    stroke="#181715"
                    strokeWidth="2.2"
                  />
                  <path
                    d="M 96 306 L 170 332 L 244 306 L 222 282 L 170 300 L 118 282 Z"
                    fill="url(#skt-ivory-chitin)"
                    stroke="#181715"
                    strokeWidth="2.2"
                  />
                </svg>

                {/* Membrana orgánica central con latido biorrítmico sutil */}
                <div className="relative w-46 h-58 rounded-[50%/60%] bg-slate-950/85 border-2 border-emerald-400/80 shadow-[0_0_45px_rgba(46,204,113,0.45),inset_0_0_28px_rgba(46,204,113,0.35)] flex items-center justify-center overflow-hidden z-10 animate-[pulse_3.4s_ease-in-out_infinite]">
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 50%, rgba(46, 204, 113, 0.36) 0%, rgba(6, 78, 59, 0.68) 65%, rgba(2, 24, 19, 0.95) 100%)',
                    }}
                  />
                  <div className="pointer-events-none absolute inset-3 rounded-[50%/60%] border border-dashed border-emerald-300/50" />
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20">
                  <div
                    className={`pointer-events-none absolute w-46 h-46 rounded-full border border-dashed ${skin.coreRingActiveBorder} animate-spin`}
                    style={{ animationDuration: '18s' }}
                  />
                  <div
                    className="pointer-events-none absolute w-38 h-38 rounded-full border border-dotted border-emerald-200/35 animate-spin"
                    style={{
                      animationDuration: '26s',
                      animationDirection: 'reverse',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleTriggerUpgrade}
                    disabled={!canUpgrade || isMaxLevel || isUpgrading}
                    className={`group relative w-34 h-34 rounded-full flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                      isIgnitingUpgrade ? 'scale-110 brightness-125' : ''
                    } ${
                      isUpgrading
                        ? 'cursor-wait ring-2 ring-amber-400/90 bg-slate-950/90 shadow-[0_0_32px_rgba(245,158,11,0.5)]'
                        : canUpgrade && !isMaxLevel
                          ? 'cursor-pointer ring-2 ring-emerald-300/90 shadow-[0_0_40px_rgba(16,185,129,0.75)] ' +
                            skin.coreNodeInteractive
                          : 'cursor-not-allowed bg-slate-950/90 border-2 border-white/20 opacity-85'
                    }`}
                  >
                    {canUpgrade && !isMaxLevel && !isUpgrading && (
                      <span className="pointer-events-none absolute -inset-2 rounded-full border-2 border-emerald-400/70 animate-ping opacity-40" />
                    )}
                    <Zap className={`w-5 h-5 ${skin.accentTextBright}`} />
                    <span className="text-2xl font-mono font-black text-white tracking-tight leading-none">
                      LVL {reactorLevel}
                    </span>
                    <span
                      className={`mt-1 px-3 py-0.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isUpgrading
                          ? 'bg-amber-500/25 text-amber-200 border border-amber-400/60 animate-pulse'
                          : canUpgrade && !isMaxLevel
                            ? `${skin.coreActionPill} shadow-[0_0_14px_rgba(16,185,129,0.65)] animate-pulse`
                            : 'bg-slate-800 text-slate-300 border border-white/10'
                      }`}
                    >
                      {isMaxLevel ? (
                        'MÁXIMO'
                      ) : isUpgrading ? (
                        `OBRA ${upgradeRemainingSec}s`
                      ) : canUpgrade ? (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          MEJORAR
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-0.5" />
                          SIN MAT.
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. REACTOR VALARI PROTAGONISTA CON FLUJO DE PLASMA Y VENTILACIÓN TÉRMICA VIVA */}
            {factionId === 'valari' && (
              <div className="relative w-full h-[335px] flex items-center justify-center overflow-hidden border border-amber-400/30 bg-[#101923]/80 shadow-[inset_0_0_50px_rgba(245,158,11,0.12)]">
                <svg
                  viewBox="0 0 340 350"
                  className="pointer-events-none absolute inset-0 w-full h-full scale-[1.04]"
                  fill="none"
                >
                  <defs>
                    <linearGradient
                      id="val-titanium-plate"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#3F3F46" />
                      <stop offset="50%" stopColor="#27272A" />
                      <stop offset="100%" stopColor="#18181B" />
                    </linearGradient>
                    <linearGradient
                      id="val-amber-plasma"
                      x1="50%"
                      y1="0%"
                      x2="50%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="50%" stopColor="#FBBF24" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                  </defs>

                  <polygon
                    points="76,12 264,12 326,74 326,276 264,338 76,338 14,276 14,74"
                    stroke="rgba(232, 168, 73, 0.36)"
                    strokeWidth="2"
                    fill="rgba(15, 23, 42, 0.58)"
                  />

                  {/* Onda de calor termobárica sutil */}
                  <circle
                    cx="170"
                    cy="175"
                    r="66"
                    stroke="rgba(251, 191, 36, 0.4)"
                    strokeWidth="1.5"
                    fill="none"
                  >
                    <animate
                      attributeName="r"
                      values="64;118"
                      dur="3.6s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.45;0"
                      dur="3.6s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {[
                    { x1: 24, y1: 30, x2: 106, y2: 112 },
                    { x1: 316, y1: 30, x2: 234, y2: 112 },
                    { x1: 24, y1: 320, x2: 106, y2: 238 },
                    { x1: 316, y1: 320, x2: 234, y2: 238 },
                  ].map((piston, idx) => (
                    <g key={`piston-${idx}`}>
                      <line
                        x1={piston.x1}
                        y1={piston.y1}
                        x2={piston.x2}
                        y2={piston.y2}
                        stroke="#52525B"
                        strokeWidth="15"
                        strokeLinecap="butt"
                      />
                      <line
                        x1={piston.x1}
                        y1={piston.y1}
                        x2={piston.x2}
                        y2={piston.y2}
                        stroke="#FBBF24"
                        strokeWidth="3.5"
                        strokeDasharray="8 10"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="36;0"
                          dur="1.8s"
                          repeatCount="indefinite"
                        />
                      </line>
                    </g>
                  ))}

                  <rect
                    x="150"
                    y="0"
                    width="40"
                    height="350"
                    fill="url(#val-amber-plasma)"
                    opacity="0.38"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.28;0.48;0.28"
                      dur="2.8s"
                      repeatCount="indefinite"
                    />
                  </rect>
                  <line
                    x1="170"
                    y1="0"
                    x2="170"
                    y2="350"
                    stroke="#FEF3C7"
                    strokeWidth="4"
                    strokeDasharray="14 10"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="48;0"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </line>

                  {/* Escudos térmicos superiores e inferiores adicionales */}
                  <polygon
                    points="118,20 222,20 206,46 134,46"
                    fill="url(#val-titanium-plate)"
                    stroke="#F59E0B"
                    strokeWidth="1.6"
                  />
                  <polygon
                    points="118,330 222,330 206,304 134,304"
                    fill="url(#val-titanium-plate)"
                    stroke="#F59E0B"
                    strokeWidth="1.6"
                  />

                  <polygon
                    points="42,72 104,54 104,296 42,278"
                    fill="url(#val-titanium-plate)"
                    stroke="#E8A849"
                    strokeWidth="1.8"
                  />
                  <polygon
                    points="298,72 236,54 236,296 298,278"
                    fill="url(#val-titanium-plate)"
                    stroke="#E8A849"
                    strokeWidth="1.8"
                  />

                  {[90, 130, 170, 210, 250].map((yPos, idx) => (
                    <g key={`vent-${idx}`}>
                      <rect
                        x="56"
                        y={yPos}
                        width="32"
                        height="8.5"
                        rx="2"
                        fill="#F59E0B"
                        opacity="0.85"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.45;1;0.45"
                          dur={`${2.0 + idx * 0.25}s`}
                          repeatCount="indefinite"
                        />
                      </rect>
                      <rect
                        x="252"
                        y={yPos}
                        width="32"
                        height="8.5"
                        rx="2"
                        fill="#F59E0B"
                        opacity="0.85"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.45;1;0.45"
                          dur={`${2.0 + idx * 0.25}s`}
                          repeatCount="indefinite"
                        />
                      </rect>
                    </g>
                  ))}
                </svg>

                <div className="relative w-46 h-46 rounded-2xl rotate-45 bg-slate-950/90 border-2 border-amber-400/85 shadow-[0_0_45px_rgba(245,158,11,0.48),inset_0_0_28px_rgba(245,158,11,0.38)] flex items-center justify-center z-10 animate-[pulse_3.6s_ease-in-out_infinite]" />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20">
                  <div
                    className={`pointer-events-none absolute w-46 h-46 rounded-full border border-dashed ${skin.coreRingActiveBorder} animate-spin`}
                    style={{ animationDuration: '18s' }}
                  />
                  <div
                    className="pointer-events-none absolute w-38 h-38 rounded-full border border-dotted border-amber-200/35 animate-spin"
                    style={{
                      animationDuration: '28s',
                      animationDirection: 'reverse',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleTriggerUpgrade}
                    disabled={!canUpgrade || isMaxLevel || isUpgrading}
                    className={`group relative w-34 h-34 rounded-full flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                      isIgnitingUpgrade ? 'scale-110 brightness-125' : ''
                    } ${
                      isUpgrading
                        ? 'cursor-wait ring-2 ring-amber-400/90 bg-slate-950/90 shadow-[0_0_32px_rgba(245,158,11,0.5)]'
                        : canUpgrade && !isMaxLevel
                          ? 'cursor-pointer ring-2 ring-amber-300/90 shadow-[0_0_40px_rgba(245,158,11,0.75)] ' +
                            skin.coreNodeInteractive
                          : 'cursor-not-allowed bg-slate-950/90 border-2 border-white/20 opacity-85'
                    }`}
                  >
                    {canUpgrade && !isMaxLevel && !isUpgrading && (
                      <span className="pointer-events-none absolute -inset-2 rounded-full border-2 border-amber-400/70 animate-ping opacity-40" />
                    )}
                    <Zap className={`w-5 h-5 ${skin.accentTextBright}`} />
                    <span className="text-2xl font-mono font-black text-white tracking-tight leading-none">
                      LVL {reactorLevel}
                    </span>
                    <span
                      className={`mt-1 px-3 py-0.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isUpgrading
                          ? 'bg-amber-500/25 text-amber-200 border border-amber-400/60 animate-pulse'
                          : canUpgrade && !isMaxLevel
                            ? `${skin.coreActionPill} shadow-[0_0_14px_rgba(245,158,11,0.65)] animate-pulse`
                            : 'bg-slate-800 text-slate-300 border border-white/10'
                      }`}
                    >
                      {isMaxLevel ? (
                        'MÁXIMO'
                      ) : isUpgrading ? (
                        `OBRA ${upgradeRemainingSec}s`
                      ) : canUpgrade ? (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          MEJORAR
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-0.5" />
                          SIN MAT.
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. REACTOR CYGNUS PROTAGONISTA CON FRAGMENTOS CRIO-CRISTALINOS FLOTANTES Y SINGULARIDAD */}
            {factionId === 'cygnus' && (
              <div className="relative w-full h-[335px] flex items-center justify-center overflow-hidden border border-blue-400/30 bg-[#101923]/80 shadow-[inset_0_0_50px_rgba(59,130,246,0.14)]">
                <svg
                  viewBox="0 0 340 350"
                  className="pointer-events-none absolute inset-0 w-full h-full scale-[1.04]"
                  fill="none"
                >
                  <defs>
                    <linearGradient
                      id="cyg-chrome-alloy"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#F8FAFC" />
                      <stop offset="50%" stopColor="#94A3B8" />
                      <stop offset="100%" stopColor="#334155" />
                    </linearGradient>
                    <linearGradient
                      id="cyg-crystal-shard"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#BAE6FD" />
                      <stop offset="55%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                    <linearGradient
                      id="cyg-photon-beam"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#60A5FA" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>

                  <polygon
                    points="170,10 322,175 170,340 18,175"
                    stroke="rgba(59, 130, 246, 0.42)"
                    strokeWidth="1.8"
                    fill="rgba(15, 23, 42, 0.48)"
                  />
                  <polygon
                    points="170,36 294,175 170,314 46,175"
                    stroke="rgba(148, 163, 184, 0.28)"
                    strokeWidth="1.2"
                    strokeDasharray="5 5"
                    fill="none"
                  />

                  {/* Onda cuántica concéntrica de Punto Cero */}
                  <circle
                    cx="170"
                    cy="175"
                    r="62"
                    stroke="rgba(96, 165, 250, 0.5)"
                    strokeWidth="1.6"
                    fill="none"
                  >
                    <animate
                      attributeName="r"
                      values="60;122"
                      dur="3.2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.55;0"
                      dur="3.2s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  <line
                    x1="170"
                    y1="0"
                    x2="170"
                    y2="350"
                    stroke="#3B82F6"
                    strokeWidth="5"
                    opacity="0.7"
                  />
                  <line
                    x1="170"
                    y1="0"
                    x2="170"
                    y2="350"
                    stroke="#BAE6FD"
                    strokeWidth="2.2"
                    strokeDasharray="10 14"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="48;0"
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                  </line>

                  <line
                    x1="0"
                    y1="175"
                    x2="340"
                    y2="175"
                    stroke="#3B82F6"
                    strokeWidth="5"
                    opacity="0.7"
                  />
                  <line
                    x1="0"
                    y1="175"
                    x2="340"
                    y2="175"
                    stroke="#BAE6FD"
                    strokeWidth="2.2"
                    strokeDasharray="10 14"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="48;0"
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                  </line>

                  <line
                    x1="48"
                    y1="53"
                    x2="292"
                    y2="297"
                    stroke="url(#cyg-photon-beam)"
                    strokeWidth="3"
                  />
                  <line
                    x1="292"
                    y1="53"
                    x2="48"
                    y2="297"
                    stroke="url(#cyg-photon-beam)"
                    strokeWidth="3"
                  />

                  <ellipse
                    cx="170"
                    cy="175"
                    rx="126"
                    ry="58"
                    transform="rotate(-28 170 175)"
                    stroke="#60A5FA"
                    strokeWidth="2.2"
                    strokeDasharray="10 6"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="32;0"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  </ellipse>
                  <ellipse
                    cx="170"
                    cy="175"
                    rx="126"
                    ry="58"
                    transform="rotate(28 170 175)"
                    stroke="#3B82F6"
                    strokeWidth="2.2"
                    strokeDasharray="10 6"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="0;32"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  </ellipse>

                  {/* FRAGMENTOS FLOTANTES DE CROMO Y CRIO-CRISTAL ALREDEDOR DEL NEXO (RESTAURADOS) */}
                  {/* 4 Fragmentos Prismáticos Mayores en los cuadrantes orbitales */}
                  {[
                    {
                      pts: '56,48 92,36 82,78 46,72',
                      inner: '64,52 84,44 76,70',
                      dur: '3.2s',
                      dy: '0,-4;0,4;0,-4',
                    },
                    {
                      pts: '284,48 248,36 258,78 294,72',
                      inner: '276,52 256,44 264,70',
                      dur: '2.9s',
                      dy: '0,4;0,-4;0,4',
                    },
                    {
                      pts: '56,302 92,314 82,272 46,278',
                      inner: '64,298 84,306 76,280',
                      dur: '3.5s',
                      dy: '0,4;0,-4;0,4',
                    },
                    {
                      pts: '284,302 248,314 258,272 294,278',
                      inner: '276,298 256,306 264,280',
                      dur: '3.1s',
                      dy: '0,-4;0,4;0,-4',
                    },
                  ].map((frag, idx) => (
                    <g key={`cyg-frag-major-${idx}`}>
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values={frag.dy}
                        dur={frag.dur}
                        repeatCount="indefinite"
                      />
                      <polygon
                        points={frag.pts}
                        fill="url(#cyg-chrome-alloy)"
                        stroke="#60A5FA"
                        strokeWidth="1.8"
                      />
                      <polygon
                        points={frag.inner}
                        fill="url(#cyg-crystal-shard)"
                        opacity="0.85"
                      />
                    </g>
                  ))}

                  {/* 4 Fragmentos Cristales Cardinales en los Vértices del Diamante */}
                  <polygon
                    points="170,12 186,32 170,48 154,32"
                    fill="url(#cyg-crystal-shard)"
                    stroke="#E0F2FE"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="170,338 186,318 170,302 154,318"
                    fill="url(#cyg-crystal-shard)"
                    stroke="#E0F2FE"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="18,175 38,159 54,175 38,191"
                    fill="url(#cyg-crystal-shard)"
                    stroke="#E0F2FE"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="322,175 302,159 286,175 302,191"
                    fill="url(#cyg-crystal-shard)"
                    stroke="#E0F2FE"
                    strokeWidth="1.5"
                  />

                  {/* 4 Micro-esquirlas de fase suspendidas */}
                  {[
                    { pts: '32,122 48,114 44,132', dur: '2.4s' },
                    { pts: '308,122 292,114 296,132', dur: '2.7s' },
                    { pts: '32,228 48,236 44,218', dur: '2.9s' },
                    { pts: '308,228 292,236 296,218', dur: '2.5s' },
                  ].map((sh, idx) => (
                    <polygon
                      key={`cyg-micro-shard-${idx}`}
                      points={sh.pts}
                      fill="#7DD3FC"
                      stroke="#E0F2FE"
                      strokeWidth="1"
                    >
                      <animate
                        attributeName="opacity"
                        values="0.45;1;0.45"
                        dur={sh.dur}
                        repeatCount="indefinite"
                      />
                    </polygon>
                  ))}
                </svg>

                <div className="relative w-46 h-46 rounded-full bg-slate-950/90 border-2 border-blue-400/85 shadow-[0_0_48px_rgba(59,130,246,0.55),inset_0_0_32px_rgba(59,130,246,0.45)] flex items-center justify-center z-10">
                  <div
                    className="pointer-events-none absolute inset-3 rounded-full border border-dashed border-blue-300/65 animate-spin"
                    style={{ animationDuration: '12s' }}
                  />
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20">
                  <div
                    className={`pointer-events-none absolute w-46 h-46 rounded-full border border-dashed ${skin.coreRingActiveBorder} animate-spin`}
                    style={{ animationDuration: '16s' }}
                  />
                  <div
                    className="pointer-events-none absolute w-38 h-38 rounded-full border border-dotted border-sky-200/40 animate-spin"
                    style={{
                      animationDuration: '24s',
                      animationDirection: 'reverse',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleTriggerUpgrade}
                    disabled={!canUpgrade || isMaxLevel || isUpgrading}
                    className={`group relative w-34 h-34 rounded-full flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                      isIgnitingUpgrade ? 'scale-110 brightness-125' : ''
                    } ${
                      isUpgrading
                        ? 'cursor-wait ring-2 ring-amber-400/90 bg-slate-950/90 shadow-[0_0_32px_rgba(245,158,11,0.5)]'
                        : canUpgrade && !isMaxLevel
                          ? 'cursor-pointer ring-2 ring-sky-300/90 shadow-[0_0_40px_rgba(56,189,248,0.75)] ' +
                            skin.coreNodeInteractive
                          : 'cursor-not-allowed bg-slate-950/90 border-2 border-white/20 opacity-85'
                    }`}
                  >
                    {canUpgrade && !isMaxLevel && !isUpgrading && (
                      <span className="pointer-events-none absolute -inset-2 rounded-full border-2 border-sky-400/70 animate-ping opacity-40" />
                    )}
                    <Zap className={`w-5 h-5 ${skin.accentTextBright}`} />
                    <span className="text-2xl font-mono font-black text-white tracking-tight leading-none">
                      LVL {reactorLevel}
                    </span>
                    <span
                      className={`mt-1 px-3 py-0.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isUpgrading
                          ? 'bg-amber-500/25 text-amber-200 border border-amber-400/60 animate-pulse'
                          : canUpgrade && !isMaxLevel
                            ? `${skin.coreActionPill} shadow-[0_0_14px_rgba(56,189,248,0.65)] animate-pulse`
                            : 'bg-slate-800 text-slate-300 border border-white/10'
                      }`}
                    >
                      {isMaxLevel ? (
                        'MÁXIMO'
                      ) : isUpgrading ? (
                        `OBRA ${upgradeRemainingSec}s`
                      ) : canUpgrade ? (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          MEJORAR
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-0.5" />
                          SIN MAT.
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* SUBSISTEMA INFERIOR */}
            <div className="w-full rounded-b-xl px-4 py-2 bg-[#182232]/85 border border-slate-300/[0.16] border-t-0 flex items-center justify-between gap-2">
              <span
                className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${skin.accentBarFill}`}
              />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200 text-center truncate">
                {skin.bottomSubsystemLabel}
              </span>
              <span
                className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${skin.accentBarFill}`}
              />
            </div>

            {/* CAUDAL NOMINAL AL PIE DEL NÚCLEO */}
            <div
              className={`w-full mt-2.5 py-2 px-4 flex items-center justify-between font-mono ${skin.outputBadge}`}
            >
              <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold">
                Potencia Suministrada
              </span>
              <span className="text-sm sm:text-base font-bold tracking-wider tabular-nums">
                {totalCapacityMw} MW
              </span>
            </div>
          </div>

          {/* TECHO OPERATIVO DE INSTALACIONES SINCRONIZADO (DENTRO DE SUBCARD UNIFORME PARA IGUALAR LAS 3 COLUMNAS) */}
          <div
            className={`relative z-10 w-full p-4 flex flex-col gap-2.5 ${skin.subCardContainer}`}
          >
            <div className="flex items-center justify-between border-b border-white/8 pb-2">
              <span className="text-xs sm:text-[13px] font-mono font-bold uppercase tracking-wider text-slate-200">
                Techo Operativo de Instalaciones
              </span>
              <span className="text-xs font-mono text-slate-300">
                Límite:{' '}
                <strong className="text-white">Nv. {reactorLevel}</strong>
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {dependentInstallations.map((inst) => {
                const Icon = inst.icon;
                const isAtReactorCap = inst.level >= reactorLevel;
                return (
                  <div
                    key={inst.id}
                    className="px-3 py-2 rounded-xl bg-[#121926]/85 border border-slate-300/[0.12] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                        <Icon className={`w-3.5 h-3.5 ${skin.accentText}`} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-bold text-slate-100 truncate">
                          {inst.name}
                        </span>
                        <span className="text-xs font-mono text-slate-400 truncate">
                          {inst.role} · {inst.drawMw} MW
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 font-mono">
                      <span className="text-xs font-bold text-white tabular-nums">
                        Nv. {inst.level}{' '}
                        <span className="text-slate-400">/ {reactorLevel}</span>
                      </span>
                      {isAtReactorCap ? (
                        <span
                          className="text-[11px] text-slate-400"
                          title={`Sube el Reactor a Nivel ${reactorLevel + 1} para seguir ampliando esta instalación`}
                        >
                          Req. Reactor Nv.{reactorLevel + 1}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-300">
                          Ampliable
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =================================================================
            COLUMNA DERECHA: PROTOCOLOS DE RESERVA Y AMPLIACIÓN [BALIZA 3]
           ================================================================= */}
        <div
          className={`p-5 flex flex-col justify-start gap-4 h-full ${skin.panelContainer}`}
        >
          <div className="flex flex-col gap-4">
            {/* SECCIÓN 1: SELECTOR DE PROTOCOLOS */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <Gauge className={`w-5 h-5 ${skin.accentText}`} />
                  <h2 className="text-[15px] sm:text-base font-display font-bold text-slate-100 uppercase tracking-wider">
                    Protocolos de Reserva
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <TutorialBeacon
                    stepNumber={3}
                    label="Protocolos MW"
                    isActive={isTutorialActive}
                    factionId={factionId}
                  />
                  {activeProtocolCfg && (
                    <button
                      type="button"
                      onClick={() => onChangeRoutingMode?.('none')}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-400/40 text-xs font-mono font-semibold text-rose-200 cursor-pointer transition-colors"
                      title="Apagar el protocolo activo"
                    >
                      Apagar Bono
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {REACTOR_ROUTING_PROTOCOLS.map((proto) => {
                  const Icon = getProtocolIcon(proto.id);
                  const isSelected = routingMode === proto.id;
                  const hasEnoughReserveMw =
                    reserveMw >= proto.requiredReserveMw;
                  const missingMw = Math.max(
                    0,
                    proto.requiredReserveMw - reserveMw
                  );
                  const theme = getFactionTheme(factionId);

                  return (
                    <button
                      key={proto.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          onChangeRoutingMode?.('none');
                        } else if (hasEnoughReserveMw) {
                          onChangeRoutingMode?.(proto.id);
                        }
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? `${theme.activeNav} cursor-pointer`
                          : hasEnoughReserveMw
                            ? 'bg-[#182232]/70 border-slate-300/[0.14] hover:bg-slate-800/75 hover:border-slate-300/25 text-slate-200 cursor-pointer'
                            : 'bg-[#121926]/65 border-white/8 opacity-85 cursor-not-allowed'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? `bg-[#121926]/80 ${skin.accentBorder} ${skin.accentText}`
                            : hasEnoughReserveMw
                              ? 'bg-[#121926]/70 border-slate-300/[0.14] text-slate-200'
                              : 'bg-black/45 border-white/10 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                            {proto.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-xs font-semibold border ${
                              isSelected
                                ? `bg-black/45 ${skin.accentBorder} ${skin.accentText}`
                                : hasEnoughReserveMw
                                  ? 'bg-emerald-950/50 border-emerald-500/35 text-emerald-200'
                                  : 'bg-rose-950/55 border-rose-500/35 text-rose-200'
                            }`}
                          >
                            {isSelected
                              ? `ACTIVO · ${proto.requiredReserveMw} MW`
                              : hasEnoughReserveMw
                                ? `REQ. ${proto.requiredReserveMw} MW LIBRES`
                                : `Faltan ${missingMw} MW Libres`}
                          </span>
                        </div>
                        <span
                          className={`text-[13px] font-mono font-semibold ${
                            isSelected ? skin.accentText : 'text-slate-200'
                          }`}
                        >
                          {proto.shortTag}
                        </span>
                        <p className="text-[13px] text-slate-300 leading-relaxed">
                          {proto.effectSummary}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN 2: REQUISITOS DE AMPLIACIÓN DEL NÚCLEO CENTRAL */}
            <div className="border-t border-white/10 pt-3.5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-mono font-bold uppercase tracking-wider text-slate-300">
                  Costes de Ampliación (
                  {isMaxLevel ? 'MÁX' : `Nv.${reactorLevel} → Nv.${reactorLevel + 1}`}
                  )
                </span>
                <span
                  className={`text-[13px] font-mono font-bold ${skin.accentText}`}
                >
                  +{mwDelta} MW · Límite Nv.
                  {Math.min(maxReactorLevel, reactorLevel + 1)}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {upgradeCosts.map((cost) => {
                  const hasEnough = cost.owned >= cost.required;
                  return (
                    <div
                      key={cost.id}
                      className={`px-4 py-2.5 flex items-center justify-between transition-colors ${skin.subCardContainer}`}
                    >
                      <div className="flex items-center gap-2.5">
                        {renderStorageResourceIcon(cost.id)}
                        <span className="text-[13px] sm:text-sm font-semibold text-slate-100 uppercase tracking-wide">
                          {cost.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-mono font-bold tabular-nums">
                        <div>
                          <span
                            className={
                              hasEnough ? 'text-white' : 'text-rose-300'
                            }
                          >
                            {cost.owned.toLocaleString('es-ES')}
                          </span>
                          <span className="text-slate-500 mx-1">/</span>
                          <span className="text-slate-200">
                            {cost.required.toLocaleString('es-ES')}
                          </span>
                        </div>
                        {hasEnough ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                className={`p-4 flex flex-col gap-3 ${skin.subCardContainer}`}
              >
                <div className="flex items-center justify-between gap-2 text-[13px] font-mono">
                  <span className="text-slate-200">
                    {isMaxLevel
                      ? 'Núcleo en Nivel Máximo.'
                      : isUpgrading
                        ? `Ampliando Reactor a Nivel ${reactorLevel + 1}... (${upgradeRemainingSec}s restantes)`
                        : canUpgrade
                          ? '¡Materiales listos! Pulsa abajo o en el núcleo central para ampliar.'
                          : 'Reúne los materiales listados arriba para ampliar el Reactor.'}
                  </span>
                  {isUpgrading && (
                    <span className="font-bold text-amber-200 tabular-nums">
                      {upgradeProgressPct}%
                    </span>
                  )}
                </div>
                {isUpgrading && (
                  <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${skin.accentBarFill}`}
                      style={{ width: `${upgradeProgressPct}%` }}
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleTriggerUpgrade}
                  disabled={!canUpgrade || isMaxLevel || isUpgrading}
                  className={`w-full py-2.5 px-4 rounded-xl font-display text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isUpgrading
                      ? 'bg-amber-950/60 border border-amber-400/50 text-amber-200 cursor-wait'
                      : canUpgrade && !isMaxLevel
                        ? `${skin.upgradeCtaBtn} cursor-pointer active:scale-[0.99]`
                        : 'bg-slate-900/80 border border-white/10 text-slate-400 cursor-not-allowed opacity-75'
                  }`}
                >
                  {isMaxLevel ? (
                    <span>Nivel Máximo Alcanzado</span>
                  ) : isUpgrading ? (
                    <span>Ampliación en Curso ({upgradeRemainingSec}s)</span>
                  ) : canUpgrade ? (
                    <>
                      <ArrowUpRight className="w-4 h-4 shrink-0" />
                      <span>
                        Ampliar {skin.reactorTitle} a Nv. {reactorLevel + 1}
                      </span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>Materiales Insuficientes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};