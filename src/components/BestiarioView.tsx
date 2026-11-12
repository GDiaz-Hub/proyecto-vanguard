// src/components/BestiarioView.tsx
import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Compass,
  Crosshair,
  Eye,
  Lock,
  Radar,
  Sparkles,
  Swords,
} from 'lucide-react';
import {
  FACTION_MENU_LABELS,
  PlanetHostileSpec,
  getPlanetHostilesRoster,
} from '../data/factionIdentityCatalog';
import { DEFENSE_TYPE_LABELS } from '../data/gameData';
import { Planet, SECTORS_DATA, StarSector } from '../data/starMap.data';
import { GLOBAL_UI, getFactionTheme } from '../data/themeConfig';
import { FactionId, FactionInfo, ReactorRoutingMode } from '../types/game';
import { playGameSfx } from '../utils/soundSynthesizer';
import { TutorialBeacon } from './OnboardingTutorialOverlay';
import { renderResourceCostIcon } from './ThemedIcon';

export interface BestiarioViewProps {
  factionId: FactionId;
  currentFaction: FactionInfo;
  playerLevel: number;
  routingMode: ReactorRoutingMode;
  encounteredEnemyKeys: Record<string, boolean>;
  onNavigateToSector: (sector: StarSector, planet: Planet) => void;
  onOpenStarMap: () => void;
  isTutorialActive?: boolean;
}

export const BestiarioView: React.FC<BestiarioViewProps> = ({
  factionId,
  currentFaction,
  playerLevel,
  routingMode,
  encounteredEnemyKeys,
  onNavigateToSector,
  onOpenStarMap,
  isTutorialActive = false,
}) => {
  const theme = getFactionTheme(currentFaction.name);
  const menuLabels =
    FACTION_MENU_LABELS[factionId] || FACTION_MENU_LABELS.valari;

  const [selectedSectorFilter, setSelectedSectorFilter] =
    useState<string>('ALL');
  const [selectedEntry, setSelectedEntry] = useState<{
    sector: StarSector;
    planet: Planet;
  } | null>(null);

  // Regla de Desbloqueo idéntica al Mapa Galáctico: Solo el Sector Natal de la facción elegida (Tiers I-III) y el Corredor de Orión (Tiers IV-V) están habilitados en esta prueba
  const isSectorUnlocked = (sector: StarSector): boolean => {
    if (sector.id === 'SEC-NEU-WEST') return true;
    return sector.faction.toLowerCase() === factionId;
  };

  // Construye el catálogo completo de planetas con sus 4 hostiles y estado de descubrimiento y desbloqueo de sector
  const allPlanetEntries = useMemo(() => {
    const list: {
      sector: StarSector;
      planet: Planet;
      hostiles: PlanetHostileSpec[];
      discoveredCount: number;
      isSectorAvailable: boolean;
    }[] = [];

    SECTORS_DATA.forEach((sec) => {
      const sectorAvailable =
        sec.id === 'SEC-NEU-WEST' || sec.faction.toLowerCase() === factionId;
      sec.planets.forEach((pln) => {
        const hostiles = getPlanetHostilesRoster(
          pln.id,
          sec.id,
          pln.combatLoot,
          pln.tier,
          pln.enemyLevel,
          routingMode
        );
        const discoveredCount = hostiles.filter((h) =>
          Boolean(encounteredEnemyKeys[h.unitKey])
        ).length;
        list.push({
          sector: sec,
          planet: pln,
          hostiles,
          discoveredCount,
          isSectorAvailable: sectorAvailable,
        });
      });
    });

    return list;
  }, [encounteredEnemyKeys, routingMode, factionId]);

  const unlockedPlanetEntries = useMemo(
    () => allPlanetEntries.filter((item) => item.isSectorAvailable),
    [allPlanetEntries]
  );

  const totalHostilesInGalaxy = unlockedPlanetEntries.length * 4;
  const totalDiscoveredInGalaxy = unlockedPlanetEntries.reduce(
    (sum, item) => sum + item.discoveredCount,
    0
  );

  const filteredPlanetEntries = useMemo(() => {
    if (selectedSectorFilter === 'ALL') return allPlanetEntries;
    return allPlanetEntries.filter(
      (entry) => entry.sector.id === selectedSectorFilter
    );
  }, [allPlanetEntries, selectedSectorFilter]);

  const activePlanetDetail = useMemo(() => {
    if (!selectedEntry) return null;
    const found =
      allPlanetEntries.find(
        (e) => e.planet.id === selectedEntry.planet.id
      ) || null;
    if (found && !found.isSectorAvailable) return null;
    return found;
  }, [allPlanetEntries, selectedEntry]);

  const renderDefenseBadgeColor = (defType: PlanetHostileSpec['defenseType']) => {
    if (defType === 'Armor')
      return 'bg-slate-800/90 border-slate-300/35 text-slate-200';
    if (defType === 'Evasion')
      return 'bg-emerald-950/75 border-emerald-400/45 text-emerald-200';
    return 'bg-cyan-950/75 border-cyan-400/45 text-cyan-200';
  };

  // ============================================================================
  // PANTALLA 2: EXPEDIENTE DE HOSTILES DEL PLANETA SELECCIONADO
  // ============================================================================
  if (activePlanetDetail) {
    const { sector, planet, hostiles, discoveredCount } = activePlanetDetail;
    const isPlanetUnlockedForDeploy = playerLevel >= planet.minLevel;

    return (
      <section
        aria-label={`Hostiles de ${planet.name}`}
        className="w-full flex flex-col gap-5 text-slate-200 select-none animate-in fade-in duration-250"
      >
        {/* BARRA SUPERIOR DE RETORNO Y CABECERA DEL PLANETA */}
        <header
          className={`p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${GLOBAL_UI.glass.panel}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              type="button"
              onClick={() => {
                playGameSfx('ui_click');
                setSelectedEntry(null);
              }}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-[#182232]/90 hover:bg-white/10 border border-slate-300/[0.18] text-[13px] font-mono font-bold text-slate-100 hover:text-white flex items-center gap-2 cursor-pointer transition-colors self-start sm:self-auto shrink-0"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Volver a Planetas</span>
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-300/[0.2] bg-[#090D15] shrink-0 shadow-md">
                <img
                  src={planet.image}
                  alt={planet.name}
                  className="w-full h-full object-cover contrast-[1.08] saturate-[1.08]"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-display font-bold text-white uppercase tracking-wide">
                    {planet.name} · Fauna y Fuerzas Hostiles
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono font-bold text-slate-100">
                    TIER {planet.tierRoman}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono font-bold ${theme.accentText}`}
                  >
                    AMENAZA NV. {planet.enemyLevel}
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    {sector.name}
                  </span>
                </div>
                <p className="text-[13px] sm:text-sm text-slate-300 mt-0.5">
                  {planet.type} · Aparición dinámica en el Frente de Batalla según probabilidad orbital (%).
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {routingMode === 'orbital' && (
              <div className="min-h-[42px] px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-400/45 font-mono text-xs text-emerald-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Protocolo Orbital Activo: Amenaza Rara 6% (+3%)</span>
              </div>
            )}

            <div
              className={`min-h-[42px] px-3.5 py-2 rounded-xl font-mono flex flex-col justify-center items-end ${GLOBAL_UI.glass.subcard}`}
            >
              <span className="text-[11px] uppercase tracking-wider text-slate-400 leading-none">
                Identificados en Órbita
              </span>
              <span className="text-sm font-bold text-white tabular-nums mt-0.5 leading-none">
                {discoveredCount} / {hostiles.length} Hostiles
              </span>
            </div>

            <button
              type="button"
              disabled={!isPlanetUnlockedForDeploy}
              onClick={() => onNavigateToSector(sector, planet)}
              className={`min-h-[42px] min-w-[186px] px-4 py-2 rounded-xl border font-display text-[13px] font-bold uppercase tracking-wider shrink-0 flex items-center justify-center gap-2 transition-all ${
                isPlanetUnlockedForDeploy
                  ? `${theme.primaryButton} cursor-pointer active:scale-95`
                  : 'bg-slate-900/80 border-white/10 text-slate-400 cursor-not-allowed opacity-75'
              }`}
              title={
                isPlanetUnlockedForDeploy
                  ? `Iniciar incursión en ${planet.name}`
                  : `Requiere Héroe Nivel ${planet.minLevel}`
              }
            >
              {isPlanetUnlockedForDeploy ? (
                <>
                  <Swords className="w-4 h-4 shrink-0" />
                  <span>Combatir en {planet.name}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Req. Héroe Nv. {planet.minLevel}</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* GRILLA DE LAS 4 TARJETAS DE ENEMIGOS DEL PLANETA */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">
          {hostiles.map((hostile, idx) => {
            const isDiscovered = Boolean(encounteredEnemyKeys[hostile.unitKey]);
            const classBadgeLabel = hostile.isRareElite
              ? 'AMENAZA RARA · ÉLITE'
              : hostile.unitClass === 'light'
                ? 'UNIDAD LIGERA'
                : hostile.unitClass === 'heavy'
                  ? 'UNIDAD PESADA'
                  : 'CHOQUE MEDIO';

            return (
              <article
                key={hostile.unitKey}
                className={`relative rounded-2xl overflow-hidden p-5 flex flex-col justify-between gap-4 border transition-all ${
                  hostile.isRareElite
                    ? 'bg-[#141A29]/92 border-amber-400/45 shadow-[0_12px_34px_rgba(245,158,11,0.12)]'
                    : 'bg-[#121926]/88 border-slate-300/[0.15] shadow-lg'
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                  {/* RETRATO / ARTE DEL ENEMIGO (BLOQUEADO EN NEGRO HASTA COMBATIRLO) */}
                  <div
                    className={`relative w-full sm:w-44 h-48 sm:h-auto rounded-xl overflow-hidden bg-[#080C14] border flex items-center justify-center shrink-0 ${
                      hostile.isRareElite
                        ? 'border-amber-400/45'
                        : 'border-slate-300/[0.16]'
                    }`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12)_0%,transparent_75%)] pointer-events-none" />
                    <img
                      src={hostile.spriteUrl}
                      alt={
                        isDiscovered
                          ? hostile.name
                          : 'Silueta de hostil no identificado'
                      }
                      className={`h-40 w-auto object-contain transition-all duration-500 select-none pointer-events-none ${
                        isDiscovered
                          ? 'brightness-100 contrast-105 drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]'
                          : 'brightness-0 contrast-200 opacity-85 drop-shadow-[0_0_14px_rgba(0,0,0,0.95)]'
                      }`}
                    />

                    {/* Badge de % de Aparición */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 font-mono">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                          hostile.isRareElite
                            ? 'bg-amber-950/90 border-amber-400/60 text-amber-200'
                            : 'bg-[#0B101A]/90 border-slate-300/25 text-slate-100'
                        }`}
                      >
                        {hostile.spawnChancePct}% APARICIÓN
                      </span>
                      {idx === 0 && (
                        <TutorialBeacon
                          stepNumber={2}
                          label="% Dinámico"
                          isActive={isTutorialActive}
                          factionId={factionId}
                        />
                      )}
                    </div>

                    {/* Estado de Identificación */}
                    <div className="absolute bottom-2.5 inset-x-2.5 flex justify-center">
                      {isDiscovered ? (
                        <span className="w-full py-1 px-2 rounded-lg bg-emerald-950/85 border border-emerald-400/45 text-[11px] font-mono font-bold text-emerald-200 text-center uppercase tracking-wider">
                          Identificado en Combate
                        </span>
                      ) : (
                        <span className="w-full py-1 px-2 rounded-lg bg-[#090D16]/92 border border-slate-300/20 text-[11px] font-mono font-bold text-slate-300 flex items-center justify-center gap-1 uppercase tracking-wider">
                          <Lock className="w-3 h-3 text-amber-300 shrink-0" />
                          <span>Enfréntalo para Desbloquear</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* DATOS TÁCTICOS Y TELEMETRÍA DEL HOSTIL */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${
                            hostile.isRareElite
                              ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                              : 'bg-white/5 border-white/10 text-slate-300'
                          }`}
                        >
                          {classBadgeLabel}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${renderDefenseBadgeColor(
                            hostile.defenseType
                          )}`}
                        >
                          {isDiscovered
                            ? `DEFENSA: ${DEFENSE_TYPE_LABELS[
                                hostile.defenseType
                              ].toUpperCase()}`
                            : 'DEFENSA: ???'}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-2 mt-0.5">
                        <h2 className="text-lg sm:text-xl font-display font-bold text-white uppercase tracking-wide truncate">
                          {isDiscovered
                            ? hostile.name
                            : 'Hostil No Identificado'}
                        </h2>
                        <span className="text-xs font-mono font-bold text-rose-300 shrink-0 tabular-nums">
                          NV. {hostile.level}
                        </span>
                      </div>

                      <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                        {isDiscovered
                          ? hostile.combatTraitNote
                          : 'Silueta no registrada por tus sensores tácticos. Despliega en este mundo y lucha contra esta unidad en el Frente de Batalla para desbloquear su expediente completo.'}
                      </p>
                    </div>

                    {/* ESTADÍSTICAS DEL ENEMIGO */}
                    <div className="grid grid-cols-4 gap-2 font-mono">
                      <div className="p-2.5 rounded-xl bg-[#162030]/85 border border-white/8 flex flex-col">
                        <span className="text-[11px] text-slate-400">SALUD</span>
                        <span className="text-xs sm:text-sm font-bold text-rose-200 tabular-nums">
                          {isDiscovered ? hostile.maxHp : '???'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#162030]/85 border border-white/8 flex flex-col">
                        <span className="text-[11px] text-slate-400 uppercase truncate">
                          {isDiscovered
                            ? DEFENSE_TYPE_LABELS[hostile.defenseType]
                            : 'DEFENSA'}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-cyan-200 tabular-nums">
                          {isDiscovered ? hostile.maxDefense : '???'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#162030]/85 border border-white/8 flex flex-col">
                        <span className="text-[11px] text-slate-400">ATAQUE</span>
                        <span className="text-xs sm:text-sm font-bold text-amber-200 tabular-nums">
                          {isDiscovered ? hostile.attackDamage : '???'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#162030]/85 border border-white/8 flex flex-col">
                        <span className="text-[11px] text-slate-400">VELOC.</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-100 tabular-nums">
                          {isDiscovered ? `${hostile.speed} SPD` : '???'}
                        </span>
                      </div>
                    </div>

                    {/* HABILIDAD TÁCTICA */}
                    <div className="px-3 py-2 rounded-xl bg-[#0E141F]/90 border border-slate-300/[0.12] flex items-center justify-between gap-2 text-xs font-mono">
                      <span className="text-slate-400 uppercase">
                        Patrón de Ataque:
                      </span>
                      <span className="font-bold text-slate-100 truncate">
                        {isDiscovered
                          ? hostile.signatureAbilityLabel
                          : 'Datos Bloqueados (Combatir para Analizar)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RECOMPENSAS Y BOTÍN QUE DROPEA ESTE ENEMIGO */}
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Recompensa al Derrotar:
                  </span>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="px-3 py-1 rounded-lg bg-amber-950/55 border border-amber-400/40 text-amber-200 font-bold tabular-nums">
                      +{hostile.rewardCredits} ₡
                    </span>
                    {hostile.lootDrops.map((drop) => (
                      <span
                        key={drop.id}
                        className="px-3 py-1 rounded-lg bg-[#162030]/90 border border-slate-300/[0.16] text-slate-100 font-semibold flex items-center gap-1.5"
                      >
                        {renderResourceCostIcon(drop.id)}
                        <span>
                          +{drop.amount} {drop.name}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  // ============================================================================
  // PANTALLA 1: TARJETAS DE PLANETAS DEL CÓDICE DE HOSTILES
  // ============================================================================
  return (
    <section
      aria-label={menuLabels.bestiarySubLabel}
      className="w-full flex flex-col gap-5 text-slate-200 select-none animate-in fade-in duration-300"
    >
      {/* CABECERA PRINCIPAL */}
      <header
        className={`p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${GLOBAL_UI.glass.panel}`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl bg-[#182232]/85 border ${theme.accentBorder} flex items-center justify-center shrink-0 shadow-md`}
          >
            <Radar className={`w-6 h-6 ${theme.accentText}`} />
          </div>
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100 uppercase tracking-wide">
                {menuLabels.bestiarySubLabel}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono font-bold text-slate-200">
                Planetas y % de Aparición
              </span>
              <TutorialBeacon
                stepNumber={1}
                label="Tarjetas de Planetas"
                isActive={isTutorialActive}
                factionId={factionId}
              />
            </div>
            <p className="text-[13px] sm:text-sm text-slate-300 mt-0.5">
              Selecciona un planeta para consultar los hostiles de su órbita, sus probabilidades de aparición (%) y su botín.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={`min-h-[42px] px-3.5 py-2 rounded-xl flex flex-col justify-center items-end font-mono ${GLOBAL_UI.glass.subcard}`}
          >
            <span className="text-[11px] uppercase tracking-wider text-slate-400 leading-none">
              Registro Galáctico
            </span>
            <span className="text-sm font-bold text-white tabular-nums mt-0.5 leading-none">
              {totalDiscoveredInGalaxy} / {totalHostilesInGalaxy} Hostiles Identificados
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenStarMap}
            className="min-h-[42px] min-w-[186px] px-4 py-2 rounded-xl bg-[#182232]/85 hover:bg-white/10 border border-slate-300/[0.16] text-[13px] font-display font-bold uppercase tracking-wider text-slate-100 hover:text-white shrink-0 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>Ir al Mapa Estelar</span>
          </button>
        </div>
      </header>

      {/* FILTRO POR SECTOR GALÁCTICO */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedSectorFilter('ALL')}
          className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            selectedSectorFilter === 'ALL'
              ? `${theme.activeNav}`
              : 'bg-[#121926]/80 border-slate-300/[0.14] text-slate-300 hover:text-white'
          }`}
        >
          Todos los Sectores ({unlockedPlanetEntries.length} Activos / {allPlanetEntries.length} Total)
        </button>
        {SECTORS_DATA.map((sec) => {
          const isSelected = selectedSectorFilter === sec.id;
          const sectorUnlocked = isSectorUnlocked(sec);
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setSelectedSectorFilter(sec.id)}
              className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? `${theme.activeNav}`
                  : sectorUnlocked
                    ? 'bg-[#121926]/80 border-slate-300/[0.14] text-slate-300 hover:text-white'
                    : 'bg-[#0E131D]/75 border-rose-500/25 text-slate-400 hover:text-slate-200'
              }`}
            >
              {!sectorUnlocked && (
                <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              )}
              <span>{sec.name}</span>
            </button>
          );
        })}
      </div>

      {/* GRILLA DE TARJETAS DE PLANETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
        {filteredPlanetEntries.map(
          ({ sector, planet, hostiles, discoveredCount, isSectorAvailable }) => {
            const progressPct = Math.round(
              (discoveredCount / Math.max(1, hostiles.length)) * 100
            );

            if (!isSectorAvailable) {
              return (
                <article
                  key={planet.id}
                  aria-disabled="true"
                  className="text-left rounded-2xl overflow-hidden bg-[#0E131E]/85 border border-rose-500/25 shadow-lg flex flex-col justify-between opacity-75 cursor-not-allowed select-none"
                >
                  <div>
                    <div className="relative h-36 w-full overflow-hidden border-b border-rose-500/20 bg-[#080B12]">
                      <img
                        src={planet.image}
                        alt={planet.name}
                        className="w-full h-full object-cover object-center grayscale contrast-125 brightness-50"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0E131E] via-[#0E131E]/55 to-transparent" />

                      <div className="absolute top-3 left-3.5 right-3.5 flex items-center justify-between gap-2 font-mono">
                        <span className="px-2.5 py-0.5 rounded-md bg-rose-950/90 border border-rose-500/50 text-xs font-bold text-rose-200 flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-rose-300 shrink-0" />
                          <span>ACCESO RESTRINGIDO</span>
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-[#0B101A]/90 border border-slate-300/[0.15] text-xs font-semibold text-slate-400">
                          {sector.name}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between gap-2">
                        <div>
                          <span className="text-xs font-mono text-slate-400 block truncate">
                            TIER {planet.tierRoman} · SECTOR CERRADO EN PRUEBA
                          </span>
                          <h2 className="text-lg font-display font-bold text-slate-300 uppercase tracking-wide truncate">
                            {planet.name}
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col gap-3">
                      <div className="p-3 rounded-xl bg-rose-950/25 border border-rose-500/25 text-xs font-mono text-slate-300 leading-relaxed">
                        <strong className="text-rose-200 block mb-0.5">
                          [CUARENTENA DE NAVEGACIÓN · SECTOR BLOQUEADO]
                        </strong>
                        Este mundo pertenece a un sector desactivado en la versión de prueba actual, en sintonía con el Mapa Galáctico.
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        {[0, 1, 2, 3].map((slotIdx) => (
                          <div
                            key={slotIdx}
                            className="px-2.5 py-1.5 rounded-lg border border-white/6 bg-[#121824]/70 font-mono text-xs text-slate-500 flex items-center justify-between gap-1.5"
                          >
                            <span className="truncate font-semibold flex items-center gap-1">
                              <Lock className="w-3 h-3 shrink-0 text-slate-500" />
                              <span>Clasificado</span>
                            </span>
                            <span className="text-[11px] font-bold">---</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-[#111723]/85 border-t border-white/6 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Expediente Bloqueado en esta Prueba</span>
                    </span>
                  </div>
                </article>
              );
            }

            return (
              <button
                key={planet.id}
                type="button"
                onClick={() => {
                  playGameSfx('ui_click');
                  setSelectedEntry({ sector, planet });
                }}
                className="group text-left rounded-2xl overflow-hidden bg-[#121926]/88 hover:bg-[#162032]/92 border border-slate-300/[0.15] hover:border-slate-200/35 shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* IMAGEN DEL PLANETA */}
                  <div className="relative h-36 w-full overflow-hidden border-b border-slate-300/[0.12] bg-[#090D15]">
                    <img
                      src={planet.image}
                      alt={planet.name}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 contrast-[1.08] saturate-[1.08]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121926] via-[#121926]/35 to-transparent" />

                    <div className="absolute top-3 left-3.5 right-3.5 flex items-center justify-between gap-2 font-mono">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#0B101A]/90 backdrop-blur-md border border-slate-300/[0.18] text-xs font-bold text-slate-100">
                        TIER {planet.tierRoman} · NV. {planet.enemyLevel}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-[#0B101A]/90 backdrop-blur-md border border-slate-300/[0.18] text-xs font-semibold text-slate-300">
                        {sector.name}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono text-slate-300 block truncate">
                          {planet.type}
                        </span>
                        <h2 className="text-lg font-display font-bold text-white uppercase tracking-wide truncate">
                          {planet.name}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* RESUMEN DE PROBABILIDADES Y DESCUBRIMIENTO */}
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 uppercase font-semibold">
                        Hostiles Registrados
                      </span>
                      <span
                        className={`font-bold tabular-nums ${
                          discoveredCount === hostiles.length
                            ? 'text-emerald-300'
                            : theme.accentText
                        }`}
                      >
                        {discoveredCount} / {hostiles.length} ({progressPct}%)
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#0B101A] border border-white/10 overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${theme.barFill}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* LISTA PREVIA DE LOS 4 HOSTILES DEL PLANETA */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {hostiles.map((h) => {
                        const unlocked = Boolean(encounteredEnemyKeys[h.unitKey]);
                        return (
                          <div
                            key={h.unitKey}
                            className={`px-2.5 py-1.5 rounded-lg border font-mono text-xs flex items-center justify-between gap-1.5 ${
                              h.isRareElite
                                ? 'bg-amber-950/35 border-amber-400/35 text-amber-200'
                                : 'bg-[#172132]/75 border-white/8 text-slate-200'
                            }`}
                          >
                            <span className="truncate font-semibold">
                              {unlocked ? h.name : '??? (Bloqueado)'}
                            </span>
                            <span className="text-[11px] font-bold opacity-90 shrink-0 tabular-nums">
                              {h.spawnChancePct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-[#162030]/75 border-t border-white/8 flex items-center justify-between text-xs font-mono text-slate-200 group-hover:text-white">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Eye className={`w-3.5 h-3.5 ${theme.accentText}`} />
                    <span>Abrir Expediente de Hostiles</span>
                  </span>
                  <Crosshair className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                </div>
              </button>
            );
          }
        )}
      </div>
    </section>
  );
};
