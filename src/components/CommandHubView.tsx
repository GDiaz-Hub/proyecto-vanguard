// src/components/CommandHubView.tsx
import React from 'react';
import {
  Blocks,
  Clock,
  Compass,
  Cpu,
  Crosshair,
  Database,
  Flame,
  Hexagon,
  Layers,
  MapPin,
  Shield,
  Sliders,
  Swords,
  Target,
  UserCheck,
  Zap,
} from 'lucide-react';
import {
  CHASSIS_MK_LABELS,
  CHASSIS_SLOT_LABELS,
  FACTION_ASYMMETRIC_PROFILES,
  FACTION_MENU_LABELS,
  FACTION_REACTOR_SKINS,
  FACTION_RESOURCE_SPECS,
  HERO_PORTRAITS_CATALOG,
  REACTOR_ROUTING_PROTOCOLS,
} from '../data/factionIdentityCatalog';
import { Planet } from '../data/starMap.data';
import { GLOBAL_UI, getFactionTheme } from '../data/themeConfig';
import {
  CitadelBuilding,
  FactionId,
  FactionInfo,
  HardSciFiAchievement,
  HeroChassisSlot,
  HeroLoadout,
  ModuleTab,
  OperationalDirective,
  ReactorRoutingMode,
} from '../types/game';
import { ActiveUpgradeTimer } from '../context/GameContext';
import { TutorialBeacon } from './OnboardingTutorialOverlay';
import { renderResourceCostIcon } from './ThemedIcon';

export interface CommandHubViewProps {
  factionId: FactionId;
  currentFaction: FactionInfo;
  playerName: string;
  characterLevel: number;
  heroLoadout: HeroLoadout;
  maxPlayerHp: number;
  maxPlayerDefense: number;
  playerAttackDmg: number;
  buildings: CitadelBuilding[];
  usedReactorMw: number;
  maxReactorMw: number;
  reserveReactorMw: number;
  routingMode: ReactorRoutingMode;
  inventory: Record<string, number>;
  activePlanet: Planet | null;
  currentLocation: string;
  directives: OperationalDirective[];
  achievements: HardSciFiAchievement[];
  activeBuildingUpgrades?: Record<string, ActiveUpgradeTimer>;
  nowTimestamp?: number;
  onClaimDirective: (directiveId: string) => void;
  onNavigateTab: (tab: ModuleTab) => void;
  onOpenForgeChassis?: () => void;
  isTutorialActive?: boolean;
}

const CHASSIS_SLOTS_ORDER: HeroChassisSlot[] = [
  'weapon',
  'chest',
  'helmet',
  'gloves',
  'boots',
];

export const CommandHubView: React.FC<CommandHubViewProps> = ({
  factionId,
  currentFaction,
  playerName,
  characterLevel,
  heroLoadout,
  maxPlayerHp,
  maxPlayerDefense,
  playerAttackDmg,
  buildings,
  usedReactorMw,
  maxReactorMw,
  reserveReactorMw,
  routingMode,
  inventory,
  activePlanet,
  currentLocation,
  directives,
  achievements,
  activeBuildingUpgrades = {},
  nowTimestamp = Date.now(),
  onNavigateTab,
  onOpenForgeChassis,
  isTutorialActive = false,
}) => {
  const theme = getFactionTheme(currentFaction.name);
  const menuLabels =
    FACTION_MENU_LABELS[factionId] || FACTION_MENU_LABELS.valari;
  const profile =
    FACTION_ASYMMETRIC_PROFILES[factionId] ||
    FACTION_ASYMMETRIC_PROFILES.valari;
  const reactorSkin =
    FACTION_REACTOR_SKINS[factionId] || FACTION_REACTOR_SKINS.valari;
  const resSpec =
    FACTION_RESOURCE_SPECS[factionId] || FACTION_RESOURCE_SPECS.valari;

  const activeProtocolMeta =
    routingMode !== 'none'
      ? REACTOR_ROUTING_PROTOCOLS.find((p) => p.id === routingMode)
      : null;

  const reactorBuilding = buildings[0];
  const forgeBuilding = buildings[1];
  const labBuilding = buildings[2];
  const siloBuilding = buildings[3];

  const readyToClaimCount = directives.filter(
    (d) => d.isCompleted && !d.isClaimed
  ).length;
  const unlockedAchievementsCount = achievements.filter(
    (a) => a.unlocked
  ).length;

  const renderFactionIcon = (cls = 'w-5 h-5') => {
    if (factionId === 'valari') return <Shield className={cls} />;
    if (factionId === 'skithid') return <Hexagon className={cls} />;
    return <Cpu className={cls} />;
  };

  return (
    <section
      aria-label={menuLabels.hubLabel}
      className="w-full flex flex-col gap-5 text-slate-200 select-none animate-in fade-in duration-300"
    >
      {/* CABECERA DE LA SALA DE GUERRA */}
      <header
        className={`p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${GLOBAL_UI.glass.panel}`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl bg-[#182232]/80 border ${theme.accentBorder} flex items-center justify-center shrink-0 shadow-md`}
          >
            {renderFactionIcon(`w-6 h-6 ${theme.accentText}`)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
              {menuLabels.hubSubtitle}
            </span>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100 uppercase tracking-wide">
              {menuLabels.hubLabel} · Visión Estratégica
            </h1>
            <p className="text-[13px] sm:text-sm text-slate-300 mt-0.5">
              Supervisa tu Equipamiento y coordina el despliegue entre{' '}
              <strong className="text-slate-100">{menuLabels.baseLabel}</strong>{' '}
              y el{' '}
              <strong className="text-slate-100">
                {menuLabels.combatLabel}
              </strong>
              .
            </p>
          </div>
        </div>

        {/* TELEMETRÍA RÁPIDA DE CABECERA */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`px-4 py-2.5 flex flex-col items-end font-mono ${GLOBAL_UI.glass.subcard}`}
          >
            <span className="text-xs uppercase tracking-wider text-slate-400">
              Red de {reactorSkin.reactorTitle}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-white tabular-nums">
                {usedReactorMw} / {maxReactorMw} MW
              </span>
              <span
                className={`text-[13px] font-bold ${theme.accentText} tabular-nums`}
              >
                ({reserveReactorMw} Libres)
              </span>
            </div>
          </div>

          {activeProtocolMeta && (
            <div
              className={`px-4 py-2.5 flex flex-col items-end font-mono ${GLOBAL_UI.glass.subcard}`}
            >
              <span className="text-xs uppercase tracking-wider text-slate-400">
                Protocolo Activo
              </span>
              <span className={`text-sm font-bold ${theme.accentText}`}>
                {activeProtocolMeta.title} ({activeProtocolMeta.shortTag})
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => onNavigateTab('directivas')}
            className={`px-4 py-2.5 rounded-xl border text-left flex items-center gap-3 font-mono transition-all cursor-pointer ${
              readyToClaimCount > 0
                ? 'bg-emerald-950/50 border-emerald-400/50 hover:bg-emerald-950/70 shadow-[0_0_16px_rgba(16,185,129,0.2)]'
                : 'bg-[#141C2B]/80 border-slate-300/[0.14] hover:border-white/25'
            }`}
          >
            <Target
              className={`w-4 h-4 shrink-0 ${
                readyToClaimCount > 0
                  ? 'text-emerald-400 animate-pulse'
                  : theme.accentText
              }`}
            />
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-slate-300">
                {menuLabels.directivesLabel}
              </span>
              <span className="text-[13px] font-bold text-slate-100">
                {readyToClaimCount > 0
                  ? `${readyToClaimCount} Recompensa Lista`
                  : `${unlockedAchievementsCount}/${achievements.length} Hitos`}
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* GRILLA PRINCIPAL DE 12 COLUMNAS: 6 COLS HÉROE Y CHASIS · 6 COLS FRENTE Y DOMINIO */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* =================================================================
            COLUMNA 1 (6 COLS): ESTADO DEL HÉROE Y SUS 5 CHASIS [BALIZA 1]
           ================================================================= */}
        <div
          className={`xl:col-span-6 p-5 flex flex-col justify-between gap-5 relative ${GLOBAL_UI.glass.panel}`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <UserCheck className={`w-5 h-5 ${theme.accentText}`} />
                <h2 className="text-[15px] sm:text-base font-display font-bold uppercase tracking-wider text-slate-100">
                  {menuLabels.heroLabel}
                </h2>
              </div>
              <TutorialBeacon
                stepNumber={1}
                label="Héroe y Equipamiento"
                isActive={isTutorialActive}
                factionId={factionId}
              />
            </div>

            {/* TARJETA VISUAL DEL HÉROE */}
            <div className="relative rounded-xl overflow-hidden border border-slate-300/[0.14] bg-[#0D131E] p-4 flex items-center gap-4">
              <div
                className={`relative w-24 h-28 rounded-xl overflow-hidden bg-[#080C14] border ${theme.accentBorder} shrink-0 shadow-[0_6px_18px_rgba(0,0,0,0.75)]`}
              >
                <img
                  src={
                    currentFaction.portraitPath ||
                    HERO_PORTRAITS_CATALOG[factionId]
                  }
                  alt={`Retrato de ${currentFaction.name}`}
                  className={`w-full h-full object-cover ${
                    factionId === 'valari'
                      ? 'object-[50%_7%]'
                      : factionId === 'skithid'
                        ? 'object-[50%_5%]'
                        : 'object-[50%_3%]'
                  } select-none pointer-events-none`}
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/15 bg-gradient-to-t from-[#080C14]/70 via-transparent to-[#080C14]/20" />
              </div>

              <div className="flex flex-col gap-2 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base sm:text-lg font-display font-bold text-white truncate">
                    {playerName}
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-lg bg-white/5 border border-white/10 font-mono text-[13px] font-bold ${theme.accentText} tabular-nums`}
                  >
                    NV. {characterLevel} / 100
                  </span>
                </div>
                <span className="text-[13px] font-mono font-medium text-slate-300">
                  {profile.playstyleTitle}
                </span>

                {/* ATRIBUTOS CLAVE DE COMBATE */}
                <div className="grid grid-cols-3 gap-2.5 pt-1 font-mono">
                  <div className="px-3 py-2 rounded-lg bg-[#141C2B]/80 border border-white/8 flex flex-col">
                    <span className="text-xs text-slate-300">SALUD</span>
                    <span className="text-sm sm:text-base font-bold text-rose-200 tabular-nums">
                      {maxPlayerHp}
                    </span>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-[#141C2B]/80 border border-white/8 flex flex-col">
                    <span className="text-xs text-slate-300 uppercase">
                      {profile.defenseShortName}
                    </span>
                    <span
                      className={`text-sm sm:text-base font-bold ${theme.accentText} tabular-nums`}
                    >
                      {maxPlayerDefense}
                    </span>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-[#141C2B]/80 border border-white/8 flex flex-col">
                    <span className="text-xs text-slate-300">ATAQUE</span>
                    <span className="text-sm sm:text-base font-bold text-slate-100 tabular-nums">
                      {playerAttackDmg}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ESTADO DEL EQUIPAMIENTO DEL HÉROE */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[13px] font-mono text-slate-300">
                <span className="uppercase tracking-wider font-bold">
                  Equipamiento del Héroe
                </span>
                <span>Grado y Consumo</span>
              </div>

              <div className="flex flex-col gap-2">
                {CHASSIS_SLOTS_ORDER.map((slot) => {
                  const item = heroLoadout[slot];
                  const mkLabel =
                    CHASSIS_MK_LABELS[item.level] || `Mk-${item.level}`;
                  const isLowPower = Boolean(item.lowPowerMode);
                  const effectiveMw = isLowPower
                    ? Math.max(4, Math.round(item.powerDrawMw * 0.55))
                    : item.powerDrawMw;

                  return (
                    <div
                      key={slot}
                      className={`px-3.5 py-2.5 flex items-center justify-between gap-3 ${GLOBAL_UI.glass.subcard}`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-100 truncate">
                          {item.name}
                        </span>
                        <span className="text-xs font-mono text-slate-300">
                          {CHASSIS_SLOT_LABELS[slot]}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 font-mono">
                        {isLowPower && (
                          <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-400/40 text-xs font-semibold text-amber-200">
                            Ahorro
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded bg-black/45 border border-white/10 text-[13px] font-bold ${theme.accentText}`}
                        >
                          {mkLabel}
                        </span>
                        <span className="text-[13px] font-bold text-slate-200 tabular-nums w-15 text-right">
                          {effectiveMw} MW
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab('comandante')}
              className="py-3 px-4 rounded-xl bg-[#182232]/80 hover:bg-white/10 border border-slate-300/[0.15] text-[13px] font-display font-bold uppercase tracking-wider text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Ver Equipamiento</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (onOpenForgeChassis) onOpenForgeChassis();
                else onNavigateTab('ciudadela_forja');
              }}
              className={`py-3 px-4 rounded-xl border text-[13px] font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${theme.primaryButton}`}
            >
              <Blocks className="w-4 h-4 shrink-0" />
              <span>Evolucionar Mk</span>
            </button>
          </div>
        </div>

        {/* =================================================================
            COLUMNA 2 (6 COLS): FRENTE DE BATALLA ACTIVO + INSTALACIONES DE LA BASE [BALIZA 2]
           ================================================================= */}
        <div
          className={`xl:col-span-6 p-5 flex flex-col justify-between gap-5 relative ${GLOBAL_UI.glass.panel}`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Crosshair className={`w-5 h-5 ${theme.accentText}`} />
                <h2 className="text-[15px] sm:text-base font-display font-bold uppercase tracking-wider text-slate-100">
                  Frente de Batalla e Instalaciones
                </h2>
              </div>
              <TutorialBeacon
                stepNumber={2}
                label="Frente y Base"
                isActive={isTutorialActive}
                factionId={factionId}
              />
            </div>

            {/* TARJETA DEL PLANETA FIJADO EN EL FRENTE DE BATALLA */}
            {activePlanet && (
              <div className="rounded-xl overflow-hidden border border-slate-300/[0.15] bg-[#0E131D]/95 flex flex-col shadow-lg">
                <div className="relative h-32 w-full overflow-hidden border-b border-slate-300/[0.12]">
                  <img
                    src={activePlanet.image}
                    alt={activePlanet.name}
                    className="w-full h-full object-cover object-right saturate-[0.84] brightness-[0.9] contrast-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0E131D]/95 via-[#0E131D]/50 to-transparent" />
                  <div className="absolute top-3 left-3.5 flex items-center gap-2 font-mono">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#141C2B]/90 backdrop-blur-md border border-slate-300/[0.18] text-xs font-bold text-slate-100">
                      TIER {activePlanet.tierRoman}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md bg-[#141C2B]/90 backdrop-blur-md border border-slate-300/[0.15] text-xs font-bold ${theme.accentText}`}
                    >
                      AMENAZA NV. {activePlanet.enemyLevel}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex flex-col">
                    <span className="text-xs font-mono text-slate-300 truncate flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {activePlanet.type}
                    </span>
                    <h3 className="text-lg font-display font-bold text-slate-100 truncate">
                      {activePlanet.name || currentLocation}
                    </h3>
                  </div>
                </div>

                <div className="p-3.5 bg-[#141C2B]/65 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                    Botín Extraíble en este Mundo
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activePlanet.combatLoot.map((loot) => (
                      <span
                        key={loot.id}
                        className="px-3 py-1 rounded-lg bg-[#0E131D]/90 border border-slate-300/[0.14] text-[13px] font-mono text-slate-200 flex items-center gap-1.5"
                      >
                        {renderResourceCostIcon(loot.id)}
                        <span>{loot.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RESUMEN DE INSTALACIONES DE LA BASE */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[13px] font-mono text-slate-300">
                <span className="uppercase tracking-wider font-bold">
                  Instalaciones de {menuLabels.baseLabel}
                </span>
                <span>Nivel Operativo</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'reactor_central',
                    label: menuLabels.reactorSubLabel,
                    lvl: reactorBuilding.level,
                    tab: 'ciudadela_reactor' as ModuleTab,
                    icon: Zap,
                  },
                  {
                    id: 'matriz_ensamblaje',
                    label: menuLabels.forgeSubLabel,
                    lvl: forgeBuilding.level,
                    tab: 'ciudadela_forja' as ModuleTab,
                    icon: Flame,
                  },
                  {
                    id: 'laboratorio_tecnologico',
                    label: menuLabels.labSubLabel,
                    lvl: labBuilding.level,
                    tab: 'ciudadela_laboratorio' as ModuleTab,
                    icon: Sliders,
                  },
                  {
                    id: 'silo_logistico',
                    label: menuLabels.siloSubLabel,
                    lvl: siloBuilding.level,
                    tab: 'ciudadela_almacen' as ModuleTab,
                    icon: Database,
                  },
                ].map((inst) => {
                  const Icon = inst.icon;
                  const activeTimer = activeBuildingUpgrades[inst.id];
                  const remainingSec = activeTimer
                    ? Math.max(
                        0,
                        Math.ceil((activeTimer.endTime - nowTimestamp) / 1000)
                      )
                    : 0;

                  return (
                    <button
                      key={inst.label}
                      type="button"
                      onClick={() => onNavigateTab(inst.tab)}
                      className={`p-3.5 text-left flex flex-col justify-between gap-1.5 hover:border-white/25 transition-colors cursor-pointer ${GLOBAL_UI.glass.subcard}`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-4 h-4 ${theme.accentText}`} />
                        {remainingSec > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-400/40 text-xs font-mono font-bold text-amber-200 flex items-center gap-1 tabular-nums">
                            <Clock className="w-3 h-3 animate-spin" />
                            {remainingSec}s
                          </span>
                        ) : (
                          <span className="text-[13px] font-mono font-bold text-white tabular-nums">
                            Nv. {inst.lvl}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-slate-100 truncate">
                        {inst.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RESERVAS CLAVE EN SILO */}
            <div
              className={`p-3.5 flex flex-col gap-2.5 ${GLOBAL_UI.glass.subcard}`}
            >
              <div className="flex items-center justify-between text-[13px] font-mono text-slate-300">
                <span className="uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Layers className={`w-4 h-4 ${theme.accentText}`} />
                  Reservas de Facción en Silo
                </span>
                <span>Stock Actual</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 font-mono text-[13px]">
                {[resSpec.rawT1, resSpec.rawT2, resSpec.craftT2].map((res) => (
                  <div
                    key={res.id}
                    className="p-3 rounded-lg bg-[#121926]/85 border border-white/8 flex flex-col gap-0.5"
                  >
                    <span
                      className="text-xs text-slate-300 truncate"
                      title={res.label}
                    >
                      {res.label}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-100 tabular-nums">
                      {Math.floor(inventory[res.id] || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ACCIONES RÁPIDAS DE DESPLIEGUE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab('combate')}
              className={`py-3 px-4 rounded-xl border text-[13px] font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${theme.primaryButton}`}
            >
              <Swords className="w-4 h-4 shrink-0" />
              <span>Ir al {menuLabels.combatLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('exploracion')}
              className="py-3 px-4 rounded-xl bg-[#182232]/80 hover:bg-white/10 border border-slate-300/[0.15] text-[13px] font-display font-bold uppercase tracking-wider text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>Abrir {menuLabels.mapLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
