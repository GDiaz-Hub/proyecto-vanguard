// src/components/LaboratorioView.tsx
import React from 'react';
import {
  ArrowUpRight,
  Biohazard,
  Box,
  CircuitBoard,
  Coins,
  Cpu,
  Cuboid,
  Database,
  Flame,
  Gauge,
  Hexagon,
  Lock,
  Microchip,
  Zap,
} from 'lucide-react';
import {
  FACTION_RESOURCE_SPECS,
  GAME_BALANCE,
} from '../data/factionIdentityCatalog';
import { GLOBAL_UI, getFactionTheme } from '../data/themeConfig';
import { CitadelBuilding, FactionId, Technology } from '../types/game';
import { FacilityHeader, ForgeCostPill } from './ForgeView';
import { TutorialBeacon } from './OnboardingTutorialOverlay';

export function calculateScaledCosts(
  baseFerrita: number,
  baseTitanio: number,
  baseCredits: number,
  currentLevel: number,
  totalDiscountPct: number
): {
  ferritaCost: number;
  titanioCost: number;
  creditsCost: number;
} {
  const discountFactor = Math.max(
    GAME_BALANCE.citadel.minDiscountFactor,
    1 - totalDiscountPct / 100
  );
  const growth = Math.pow(
    GAME_BALANCE.citadel.costGrowthFactor,
    Math.max(0, currentLevel - 1)
  );

  return {
    ferritaCost: Math.max(1, Math.round(baseFerrita * growth * discountFactor)),
    titanioCost: Math.max(1, Math.round(baseTitanio * growth * discountFactor)),
    creditsCost: Math.max(
      50,
      Math.round(baseCredits * growth * discountFactor)
    ),
  };
}

const renderResourceIcon = (
  factionId: FactionId,
  slot: 't1' | 't2' | 'credits'
) => {
  if (slot === 'credits') {
    return <Coins className="w-4 h-4 text-amber-400 shrink-0" />;
  }
  if (factionId === 'skithid') {
    return slot === 't1' ? (
      <Hexagon className="w-4 h-4 text-[#F5F2EB] shrink-0" />
    ) : (
      <Biohazard className="w-4 h-4 text-emerald-400 shrink-0" />
    );
  }
  if (factionId === 'cygnus') {
    return slot === 't1' ? (
      <Microchip className="w-4 h-4 text-blue-400 shrink-0" />
    ) : (
      <CircuitBoard className="w-4 h-4 text-blue-300 shrink-0" />
    );
  }
  return slot === 't1' ? (
    <Cuboid className="w-4 h-4 text-amber-400 shrink-0" />
  ) : (
    <Box className="w-4 h-4 text-amber-300 shrink-0" />
  );
};

interface FactionLabIdentity {
  headerBadge: string;
  labName: string;
  labSubtitle: string;
  techOverrides: Record<
    string,
    {
      title: string;
      domain: string;
      description: string;
      formatCurrentBonus: (level: number) => string;
      formatNextBonus: (level: number) => string;
      icon: React.FC<{ className?: string }>;
    }
  >;
}

const FACTION_LAB_IDENTITIES: Record<FactionId, FactionLabIdentity> = {
  valari: {
    headerBadge: 'DIVISIÓN CIENTÍFICA BALÍSTICA',
    labName: 'Laboratorio Balístico I+D',
    labSubtitle:
      'Optimización metalúrgica, compresión volumétrica de silos y redes de potencia pesada.',
    techOverrides: {
      tech_eficiencia_logistica: {
        title: 'Compresión Volumétrica',
        domain: 'Logística de Bastión',
        description:
          'Aumenta un +20% la capacidad máxima del Silo Logístico por nivel.',
        formatCurrentBonus: (lvl) => `+${lvl * 20}% Capacidad Silo`,
        formatNextBonus: (lvl) => `+${(lvl + 1) * 20}%`,
        icon: Database,
      },
      tech_procesamiento_datos: {
        title: 'Automatización de Hornos',
        domain: 'Cadencia de Fundición',
        description:
          'Acelera un +6% la velocidad de síntesis en la Matriz de Forja por nivel.',
        formatCurrentBonus: (lvl) => `+${lvl * 6}% Velocidad Forja`,
        formatNextBonus: (lvl) => `+${(lvl + 1) * 6}%`,
        icon: Flame,
      },
      tech_calibracion_forja: {
        title: 'Aleaciones de Choque',
        domain: 'Potencia de Equipamiento',
        description:
          'Aumenta +8% las estadísticas de combate del Equipamiento del Comandante por nivel.',
        formatCurrentBonus: (lvl) => `+${(lvl - 1) * 8}% Poder Equipamiento`,
        formatNextBonus: (lvl) => `+${lvl * 8}%`,
        icon: Gauge,
      },
      tech_red_energetica: {
        title: 'Conductores Termo-Hidráulicos',
        domain: 'Red del Reactor',
        description:
          'Aporta +18 MW al Reactor Central y -5% coste de obras en Ciudadela por nivel.',
        formatCurrentBonus: (lvl) =>
          `+${(lvl - 1) * 18} MW · -${lvl * 5}% Coste`,
        formatNextBonus: (lvl) => `+${lvl * 18} MW · -${(lvl + 1) * 5}%`,
        icon: Zap,
      },
    },
  },
  skithid: {
    headerBadge: 'CÁMARA DE BIOLOGÍA EVOLUTIVA',
    labName: 'Cámara de Génesis Evolutiva',
    labSubtitle:
      'Mutación sináptica, catálisis enzimática acelerada y expansión de tejidos de biomasa.',
    techOverrides: {
      tech_eficiencia_logistica: {
        title: 'Densidad de Biomasa',
        domain: 'Reservorio Orgánico',
        description:
          'Aumenta un +20% la capacidad máxima de la Cámara de Biomasa por nivel.',
        formatCurrentBonus: (lvl) => `+${lvl * 20}% Capacidad Silo`,
        formatNextBonus: (lvl) => `+${(lvl + 1) * 20}%`,
        icon: Database,
      },
      tech_procesamiento_datos: {
        title: 'Catálisis Enzimática',
        domain: 'Metabolismo Acelerado',
        description:
          'Acelera un +6% adicional la síntesis orgánica en la Biocámara por nivel.',
        formatCurrentBonus: (lvl) => `+${lvl * 6}% Velocidad Forja`,
        formatNextBonus: (lvl) => `+${(lvl + 1) * 6}%`,
        icon: Flame,
      },
      tech_calibracion_forja: {
        title: 'Hipertrofia Sináptica',
        domain: 'Evolución Celular',
        description:
          'Aumenta +8% la letalidad y evasión del Equipamiento biológico por nivel.',
        formatCurrentBonus: (lvl) => `+${(lvl - 1) * 8}% Poder Equipamiento`,
        formatNextBonus: (lvl) => `+${lvl * 8}%`,
        icon: Gauge,
      },
      tech_red_energetica: {
        title: 'Ganglios Superconductores',
        domain: 'Red Sináptica',
        description:
          'Aporta +18 MW al Corazón Sináptico y -5% coste en Ciudadela por nivel.',
        formatCurrentBonus: (lvl) =>
          `+${(lvl - 1) * 18} MW · -${lvl * 5}% Coste`,
        formatNextBonus: (lvl) => `+${lvl * 18} MW · -${(lvl + 1) * 5}%`,
        icon: Zap,
      },
    },
  },
  cygnus: {
    headerBadge: 'NÚCLEO DE COMPILACIÓN CUÁNTICA',
    labName: 'Nexo de Algoritmos Cuánticos',
    labSubtitle:
      'Simulación cuántica, calibración fotónica y superconductores de punto cero.',
    techOverrides: {
      tech_eficiencia_logistica: {
        title: 'Compresión Sub-Espacial',
        domain: 'Bóveda de Datos',
        description:
          'Aumenta un +20% la capacidad máxima de almacenamiento cuántico por nivel.',
        formatCurrentBonus: (lvl) => `+${lvl * 20}% Capacidad Silo`,
        formatNextBonus: (lvl) => `+${(lvl + 1) * 20}%`,
        icon: Database,
      },
      tech_procesamiento_datos: {
        title: 'Algoritmos de Síntesis',
        domain: 'Compilación Paralela',
        description:
          'Acelera un +6% la compilación de materia en la Forja por nivel.',
        formatCurrentBonus: (lvl) => `+${lvl * 6}% Velocidad Forja`,
        formatNextBonus: (lvl) => `+${(lvl + 1) * 6}%`,
        icon: Flame,
      },
      tech_calibracion_forja: {
        title: 'Armonía de Fase',
        domain: 'Sobrecarga de Escudos',
        description:
          'Aumenta +8% la potencia fotónica y escudos del Equipamiento por nivel.',
        formatCurrentBonus: (lvl) => `+${(lvl - 1) * 8}% Poder Equipamiento`,
        formatNextBonus: (lvl) => `+${lvl * 8}%`,
        icon: Gauge,
      },
      tech_red_energetica: {
        title: 'Conductores Cuánticos',
        domain: 'Matriz de Punto Cero',
        description:
          'Aporta +18 MW base al Reactor (+20 MW con pasiva Cygnus) y -5% coste en Ciudadela.',
        formatCurrentBonus: (lvl) =>
          `+${(lvl - 1) * 18} MW · -${lvl * 5}% Coste`,
        formatNextBonus: (lvl) => `+${lvl * 18} MW · -${(lvl + 1) * 5}%`,
        icon: Zap,
      },
    },
  },
};

export interface LaboratorioViewProps {
  factionId: FactionId;
  labBuilding: CitadelBuilding;
  reactorLevel: number;
  technologies: Technology[];
  ownedFerrita: number;
  ownedTitanio: number;
  ownedCredits: number;
  costReductionPct: number;
  siloUsed: number;
  siloMaxCapacity: number;
  labUpgradeTimer?: { endTime: number; durationSec?: number };
  activeTechResearches?: Record<
    string,
    { endTime: number; durationSec?: number }
  >;
  nowTimestamp?: number;
  onUpgradeBuilding: (buildingId: CitadelBuilding['id']) => void;
  onResearchTechnology: (techId: string) => void;
  isTutorialActive?: boolean;
}

export const LaboratorioView: React.FC<LaboratorioViewProps> = ({
  factionId,
  labBuilding,
  reactorLevel,
  technologies,
  ownedFerrita,
  ownedTitanio,
  ownedCredits,
  costReductionPct,
  labUpgradeTimer,
  activeTechResearches = {},
  nowTimestamp = Date.now(),
  onUpgradeBuilding,
  onResearchTechnology,
  isTutorialActive = false,
}) => {
  const theme = getFactionTheme(factionId);
  const identity =
    FACTION_LAB_IDENTITIES[factionId] || FACTION_LAB_IDENTITIES.valari;
  const resourceSpec =
    FACTION_RESOURCE_SPECS[factionId] || FACTION_RESOURCE_SPECS.valari;
  const labLevel = labBuilding.level;
  const isLabMaxLevel = labLevel >= labBuilding.maxLevel;
  const isLabCappedByReactor =
    labBuilding.requiresReactorCap && labLevel >= reactorLevel;

  const t1Label = resourceSpec.rawT1.label;
  const t2Label = resourceSpec.rawT2.label;

  const labScaledCosts = calculateScaledCosts(
    labBuilding.baseFerritaCost,
    labBuilding.baseTitanioCost,
    labBuilding.baseCreditsCost,
    labLevel,
    costReductionPct
  );

  const canAffordLab =
    ownedFerrita >= labScaledCosts.ferritaCost &&
    ownedTitanio >= labScaledCosts.titanioCost &&
    ownedCredits >= labScaledCosts.creditsCost;

  const canUpgradeLab =
    !isLabMaxLevel &&
    !isLabCappedByReactor &&
    !labUpgradeTimer &&
    canAffordLab;
  const labDrawMw =
    GAME_BALANCE.reactor.labBaseMw +
    (labLevel - 1) * GAME_BALANCE.reactor.labMwPerLevel;

  const labHeaderUpgradeCosts: ForgeCostPill[] = [
    {
      id: resourceSpec.rawT1.id,
      label: t1Label,
      required: labScaledCosts.ferritaCost,
      owned: ownedFerrita,
    },
    {
      id: resourceSpec.rawT2.id,
      label: t2Label,
      required: labScaledCosts.titanioCost,
      owned: ownedTitanio,
    },
    {
      id: 'credits',
      label: 'Créditos',
      required: labScaledCosts.creditsCost,
      owned: ownedCredits,
    },
  ];

  // Bonos acumulados actuales para mostrar en la barra de resumen superior
  const siloTech = technologies.find(
    (t) => t.id === 'tech_eficiencia_logistica'
  );
  const speedTech = technologies.find(
    (t) => t.id === 'tech_procesamiento_datos'
  );
  const chassisTech = technologies.find(
    (t) => t.id === 'tech_calibracion_forja'
  );
  const gridTech = technologies.find((t) => t.id === 'tech_red_energetica');

  const totalSiloBonusPct =
    (siloTech ? siloTech.level : 1) * GAME_BALANCE.silo.techBonusPctPerLevel;
  const totalForgeSpeedPct = (speedTech ? speedTech.level : 1) * 6;
  const totalChassisPowerPct = chassisTech ? (chassisTech.level - 1) * 8 : 0;
  const totalGridBonusMw = gridTech
    ? (gridTech.level - 1) * GAME_BALANCE.reactor.conductorTechMwPerLevel
    : 0;

  return (
    <section className="w-full flex flex-col gap-5 text-slate-200 select-none">
      {/* CABECERA UNIFICADA DEL LABORATORIO (MISMO PATRÓN QUE FORJA Y SILO) */}
      <FacilityHeader
        factionId={factionId}
        facilityKind="lab"
        badgeSubtitle={identity.headerBadge}
        title={identity.labName}
        description={identity.labSubtitle}
        level={labLevel}
        maxLevel={labBuilding.maxLevel}
        reactorLevel={reactorLevel}
        drawMw={labDrawMw}
        operationalEffect={`Autoriza Investigación I+D hasta Rango Nv.${labLevel}`}
        upgradeCosts={labHeaderUpgradeCosts}
        canUpgrade={canUpgradeLab}
        isCappedByReactor={isLabCappedByReactor}
        upgradeTimer={labUpgradeTimer}
        nowTimestamp={nowTimestamp}
        isTutorialActive={isTutorialActive}
        beaconStepNumber={1}
        beaconLabel="Ampliar Laboratorio"
        onUpgrade={() => onUpgradeBuilding(labBuilding.id)}
      />

      {/* TIRA DE BONIFICACIONES CIENTÍFICAS ACTIVAS */}
      <div
        className={`p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${GLOBAL_UI.glass.panel}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-mono font-bold uppercase tracking-wider text-slate-300">
            Bonificaciones Científicas Activas en la Ciudadela
          </span>
          <TutorialBeacon
            stepNumber={3}
            label="Bonos Activos"
            isActive={isTutorialActive}
            factionId={factionId}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div
            className={`px-4 py-2 flex items-center justify-between gap-3 ${GLOBAL_UI.glass.subcard}`}
          >
            <span className="text-xs text-slate-300">Capacidad Silo</span>
            <span className="text-sm font-bold text-white tabular-nums">
              +{totalSiloBonusPct}%
            </span>
          </div>
          <div
            className={`px-4 py-2 flex items-center justify-between gap-3 ${GLOBAL_UI.glass.subcard}`}
          >
            <span className="text-xs text-slate-300">Cadencia Forja</span>
            <span className="text-sm font-bold text-white tabular-nums">
              +{totalForgeSpeedPct}%
            </span>
          </div>
          <div
            className={`px-4 py-2 flex items-center justify-between gap-3 ${GLOBAL_UI.glass.subcard}`}
          >
            <span className="text-xs text-slate-300">Poder Equipamiento</span>
            <span
              className={`text-sm font-bold tabular-nums ${theme.accentText}`}
            >
              +{totalChassisPowerPct}%
            </span>
          </div>
          <div
            className={`px-4 py-2 flex items-center justify-between gap-3 ${GLOBAL_UI.glass.subcard}`}
          >
            <span className="text-xs text-slate-300">Red / Ahorro</span>
            <span
              className={`text-sm font-bold tabular-nums ${theme.accentText}`}
            >
              +{totalGridBonusMw} MW · -{costReductionPct}%
            </span>
          </div>
        </div>
      </div>

      {/* MATRIZ A ANCHO COMPLETO DE LAS 4 TECNOLOGÍAS DE FACCIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        {technologies.map((tech, idx) => {
          const override = identity.techOverrides[tech.id];
          const TechIcon = override ? override.icon : Cpu;
          const displayTitle = override ? override.title : tech.title;
          const displayDomain = override ? override.domain : tech.domain;
          const displayDesc = override
            ? override.description
            : tech.summaryEffect;

          const isMaxLevel = tech.level >= tech.maxLevel;
          const requiredLab = Math.max(tech.requiredLabLevel, tech.level + 1);
          const meetsLabRequirement = labLevel >= requiredLab;

          const { ferritaCost, titanioCost, creditsCost } =
            calculateScaledCosts(
              tech.baseFerritaCost,
              tech.baseTitanioCost,
              tech.baseCreditsCost,
              tech.level,
              costReductionPct
            );

          const hasFerrita = ownedFerrita >= ferritaCost;
          const hasTitanio = ownedTitanio >= titanioCost;
          const hasCredits = ownedCredits >= creditsCost;
          const hasAllResources = hasFerrita && hasTitanio && hasCredits;
          const activeTechTimer = activeTechResearches[tech.id];
          const isResearching = Boolean(
            activeTechTimer && activeTechTimer.endTime > nowTimestamp
          );
          const researchRemainingSec =
            isResearching && activeTechTimer
              ? Math.max(
                  1,
                  Math.ceil((activeTechTimer.endTime - nowTimestamp) / 1000)
                )
              : 0;

          const canResearch =
            !isMaxLevel &&
            !isResearching &&
            meetsLabRequirement &&
            hasAllResources;

          return (
            <article
              key={tech.id}
              className={`relative p-5 flex flex-col justify-between gap-4 transition-all hover:border-white/20 ${GLOBAL_UI.glass.panel}`}
            >
              {idx === 0 && (
                <div className="absolute -top-3 right-4 z-30">
                  <TutorialBeacon
                    stepNumber={2}
                    label="Proyectos de Investigación"
                    isActive={isTutorialActive}
                    factionId={factionId}
                  />
                </div>
              )}
              <div className="flex flex-col gap-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl bg-black/50 border ${theme.accentBorder} flex items-center justify-center shrink-0 shadow-md`}
                    >
                      <TechIcon className={`w-6 h-6 ${theme.accentText}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                        {displayDomain}
                      </span>
                      <h2 className="text-base sm:text-lg font-display font-bold text-white leading-snug">
                        {displayTitle}
                      </h2>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-lg bg-black/50 border border-white/10 text-[13px] font-mono font-bold ${theme.accentText} tabular-nums shrink-0`}
                  >
                    Nv. {tech.level} / {tech.maxLevel}
                  </span>
                </div>

                <p className="text-[13px] sm:text-sm text-slate-300 leading-relaxed">
                  {displayDesc}
                </p>

                {/* PROGRESIÓN DE EFECTO ACTIVO */}
                {override && (
                  <div
                    className={`px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[13px] font-mono ${GLOBAL_UI.glass.subcard}`}
                  >
                    <span className="text-slate-300">
                      Efecto Actual:{' '}
                      <strong className="text-white font-bold">
                        {override.formatCurrentBonus(tech.level)}
                      </strong>
                    </span>
                    {!isMaxLevel && (
                      <span className={`font-bold ${theme.accentText}`}>
                        Próximo: {override.formatNextBonus(tech.level)}
                      </span>
                    )}
                  </div>
                )}

                {/* REQUISITO Y COSTES COMPACTOS */}
                <div className="flex flex-col gap-2.5 pt-2.5 border-t border-white/10">
                  <div className="flex items-center justify-between text-[13px] font-mono">
                    <span className="text-slate-300">Requisito I+D</span>
                    <span
                      className={
                        meetsLabRequirement
                          ? 'text-emerald-300 font-semibold'
                          : 'text-amber-200 font-semibold'
                      }
                    >
                      Laboratorio Nv. {requiredLab} (Actual: Nv. {labLevel})
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 font-mono text-[13px]">
                    <div
                      className={`p-3 rounded-xl border flex flex-col gap-1 ${
                        hasFerrita
                          ? 'bg-black/45 border-white/10'
                          : 'bg-rose-950/30 border-rose-500/35'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs uppercase text-slate-300 font-semibold">
                        <span>{t1Label}</span>
                        {renderResourceIcon(factionId, 't1')}
                      </div>
                      <span
                        className={`font-bold tabular-nums ${
                          hasFerrita ? 'text-white' : 'text-rose-300'
                        }`}
                      >
                        {ownedFerrita.toLocaleString('es-ES')} /{' '}
                        {ferritaCost.toLocaleString('es-ES')}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-xl border flex flex-col gap-1 ${
                        hasTitanio
                          ? 'bg-black/45 border-white/10'
                          : 'bg-rose-950/30 border-rose-500/35'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs uppercase text-slate-300 font-semibold">
                        <span>{t2Label}</span>
                        {renderResourceIcon(factionId, 't2')}
                      </div>
                      <span
                        className={`font-bold tabular-nums ${
                          hasTitanio ? 'text-white' : 'text-rose-300'
                        }`}
                      >
                        {ownedTitanio.toLocaleString('es-ES')} /{' '}
                        {titanioCost.toLocaleString('es-ES')}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-xl border flex flex-col gap-1 ${
                        hasCredits
                          ? 'bg-black/45 border-white/10'
                          : 'bg-rose-950/30 border-rose-500/35'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs uppercase text-slate-300 font-semibold">
                        <span>Créditos</span>
                        {renderResourceIcon(factionId, 'credits')}
                      </div>
                      <span
                        className={`font-bold tabular-nums ${
                          hasCredits ? 'text-amber-300' : 'text-rose-300'
                        }`}
                      >
                        {creditsCost.toLocaleString('es-ES')} ₡
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={!canResearch}
                onClick={() => onResearchTechnology(tech.id)}
                className={`w-full py-3 px-4 rounded-xl text-[13px] font-display font-bold uppercase tracking-wider border flex items-center justify-center gap-2 transition-all ${
                  isResearching
                    ? 'bg-amber-950/60 border-amber-400/50 text-amber-200 cursor-wait'
                    : canResearch
                      ? `${theme.primaryButton} ring-2 ring-emerald-400/80 shadow-[0_0_24px_rgba(16,185,129,0.45)] cursor-pointer active:scale-[0.99]`
                      : GLOBAL_UI.glass.disabledButton
                }`}
              >
                {isMaxLevel ? (
                  <span>Investigación Completa</span>
                ) : isResearching ? (
                  <span>Investigando... ({researchRemainingSec}s)</span>
                ) : !meetsLabRequirement ? (
                  <>
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Requiere Laboratorio Nivel {requiredLab}</span>
                  </>
                ) : !hasAllResources ? (
                  <>
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Recursos Insuficientes</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping shrink-0" />
                    <ArrowUpRight className="w-4 h-4 shrink-0" />
                    <span>Investigar Nivel {tech.level + 1}</span>
                  </>
                )}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
};
