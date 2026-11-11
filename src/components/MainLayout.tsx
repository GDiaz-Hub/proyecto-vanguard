// src/components/MainLayout.tsx
import React, { useRef, useState } from 'react';
import {
  Blocks,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Coins,
  Compass,
  Container,
  Cpu,
  Crosshair,
  GripHorizontal,
  Hexagon,
  LayoutDashboard,
  MapPin,
  Pencil,
  Radar,
  Shield,
  Target,
  Terminal,
  UserCheck,
  X,
  Zap,
} from 'lucide-react';
import { GameProvider, useGameContext } from '../context/GameContext';
import { FACTION_MENU_LABELS } from '../data/factionIdentityCatalog';
import { GLOBAL_UI } from '../data/themeConfig';
import { CitadelSection, FactionId, ModuleTab } from '../types/game';
import {
  getGlobalAudioMuted,
  playGameSfx,
  setGlobalAudioMuted,
} from '../utils/soundSynthesizer';
import { BestiarioView } from './BestiarioView';
import { CiudadelaView } from './CiudadelaView';
import { CombatView } from './CombatView';
import { CommandHubView } from './CommandHubView';
import { CommanderView } from './CommanderView';
import { DirectivesView } from './DirectivesView';
import { FaccionesView } from './FaccionesView';
import { ForgeView } from './ForgeView';
import { OnboardingTutorialOverlay } from './OnboardingTutorialOverlay';
import { PersistentHeader } from './PersistentHeader';
import { StarMapView } from './StarMapView';
import { GoogleWorkspaceModal } from './GoogleWorkspaceModal';

const MainShell: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    factionId,
    selectFaction,
    isSelectingFaction,
    openFactionSelector,
    isTutorialActive,
    activeTutorialScreenKey,
    skipTutorial,
    disableAllTutorials,
    restartTutorial,
    usedReactorMw,
    maxReactorMw,
    reserveReactorMw,
    currentFaction,
    theme,
    currentLocation,
    activePlanet,
    navigateToSector,
    playerName,
    setPlayerName,
    characterLevel,
    professionLevel,
    heroXpPct,
    professionXpPct,
    heroLoadout,
    heroCombatStats,
    credits,
    inventory,
    buildings,
    technologies,
    storageCatalog,
    siloUsed,
    siloMaxCapacity,
    totalCitadelCostReductionPct,
    activeBuildingUpgrades,
    activeTechResearches,
    nowTimestamp,
    directives,
    claimDirective,
    completedDirectiveToast,
    dismissDirectiveToast,
    achievements,
    forgeInitialTab,
    openForgeTab,
    combatSessionLoot,
    clearCombatSessionLoot,
    encounteredEnemyKeys,
    selectedEnemy,
    enemySquad,
    selectedTargetId,
    selectTarget,
    currentWave,
    totalWaves,
    turnPhase,
    turnQueue,
    turnCount,
    isAutoCombat,
    toggleAutoCombat,
    combatSpeed,
    setCombatSpeed,
    isCombatActive,
    toggleCombat,
    playerHp,
    maxPlayerHp,
    playerDefense,
    maxPlayerDefense,
    playerBuffTurns,
    playerCombatStatus,
    equippedSkills,
    activeActorId,
    hitTargetId,
    floatingEvents,
    executeBasicAttack,
    executeSkill,
    activityFeed,
    reactorRoutingMode,
    setReactorRoutingMode,
    toggleChassisLowPower,
    upgradeBuilding,
    researchTechnology,
    scrapItem,
    craftForgeItem,
    upgradeHeroChassis,
    resetGameProgress,
  } = useGameContext();

  const [isCitadelMenuOpen, setIsCitadelMenuOpen] = useState<boolean>(true);
  const [isMapMenuOpen, setIsMapMenuOpen] = useState<boolean>(true);
  const [isEditingCommanderName, setIsEditingCommanderName] =
    useState<boolean>(false);
  const [commanderNameDraft, setCommanderNameDraft] =
    useState<string>(playerName);
  const [isLogOpen, setIsLogOpen] = useState<boolean>(false);
  const [logDimensions, setLogDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 440,
    height: 230,
  });
  const isResizingLogRef = useRef<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => getGlobalAudioMuted());

  const handleStartLogResize = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingLogRef.current = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = logDimensions.width;
    const startH = logDimensions.height;

    const handleMouseMove = (moveEv: MouseEvent) => {
      if (!isResizingLogRef.current) return;
      const deltaX = startX - moveEv.clientX;
      const deltaY = startY - moveEv.clientY;
      setLogDimensions({
        width: Math.max(340, Math.min(780, startW + deltaX)),
        height: Math.max(150, Math.min(500, startH + deltaY)),
      });
    };

    const handleMouseUp = () => {
      isResizingLogRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setGlobalAudioMuted(nextMuted);
    if (!nextMuted) {
      playGameSfx('ui_click');
    }
  };

  const handleGlobalUiClickCapture = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const buttonEl = target.closest('button');
    if (!buttonEl || (buttonEl as HTMLButtonElement).disabled) return;
    playGameSfx('ui_click', 0, 0.55);
  };

  // Pantalla inicial de Selección de Facciones a pantalla completa centrada
  if (isSelectingFaction) {
    return (
      <div onClickCapture={handleGlobalUiClickCapture}>
        <FaccionesView
          factionId={factionId}
          currentFaction={currentFaction}
          onSelectFaction={selectFaction}
        />
      </div>
    );
  }

  const menuLabels =
    FACTION_MENU_LABELS[factionId] || FACTION_MENU_LABELS.valari;
  const readyDirectivesCount = directives.filter(
    (d) => d.isCompleted && !d.isClaimed
  ).length;
  const planetOnlyName =
    activePlanet?.name ||
    currentLocation.split('·').pop()?.trim() ||
    currentLocation;

  const handleSaveCommanderName = () => {
    setPlayerName(commanderNameDraft);
    setIsEditingCommanderName(false);
    playGameSfx('ui_click');
  };

  const isCitadelTabActive =
    activeTab === 'ciudadela_reactor' ||
    activeTab === 'ciudadela_forja' ||
    activeTab === 'ciudadela_laboratorio' ||
    activeTab === 'ciudadela_almacen';

  const isMapTabActive =
    activeTab === 'exploracion' || activeTab === 'exploracion_hostiles';

  const currentCitadelSection: CitadelSection =
    activeTab === 'ciudadela_forja'
      ? 'forja_instalacion'
      : activeTab === 'ciudadela_laboratorio'
        ? 'laboratorio'
        : activeTab === 'ciudadela_almacen'
          ? 'almacen'
          : 'reactor';

  const renderFactionEmblemIcon = (facId: FactionId) => {
    if (facId === 'valari')
      return <Shield className="w-6 h-6 text-amber-300 shrink-0" />;
    if (facId === 'skithid')
      return <Hexagon className="w-6 h-6 text-emerald-300 shrink-0" />;
    return <Cpu className="w-6 h-6 text-blue-400 shrink-0" />;
  };

  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  return (
    <div
      onClickCapture={handleGlobalUiClickCapture}
      className="min-h-screen relative isolate text-slate-200 flex flex-col font-sans select-none"
    >
      <div className="fixed inset-0 z-[-1] bg-[#0E141F] overflow-hidden pointer-events-none">
        <img
          src={theme.bgImage || '/assets/backgrounds/bg-faction-valari.png'}
          alt=""
          className="w-full h-full object-cover opacity-50 saturate-[0.82] brightness-[0.88] transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E141F]/90 via-[#0E141F]/40 to-[#0E141F]/65 pointer-events-none" />
      </div>

      <PersistentHeader
        playerName={playerName}
        factionName={currentFaction.name}
        credits={credits}
        cargoUsed={siloUsed}
        cargoCapacity={siloMaxCapacity}
        reactorLevel={buildings[0].level}
        forgeLevel={buildings[1].level}
        labLevel={buildings[2].level}
        routingMode={reactorRoutingMode}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onResetGame={resetGameProgress}
        onOpenFactionSelector={openFactionSelector}
        onRestartTutorial={restartTutorial}
        isTutorialActive={isTutorialActive}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
      />

      <GoogleWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        factionId={factionId}
        playerName={playerName}
        currentSaveJson={JSON.stringify(
          {
            playerName,
            factionId,
            credits,
            characterLevel,
            buildings,
            inventory,
            heroLoadout,
            timestamp: Date.now(),
          },
          null,
          2
        )}
      />

      <div className="flex-1 w-full max-w-[2560px] mx-auto px-4 lg:px-7 py-5 flex flex-col lg:flex-row gap-5 items-start">
        {/* SIDEBAR IZQUIERDO ALINEADO AL PIXEL CON LAS VISTAS DE LA DERECHA */}
        <aside className="w-full lg:w-72 xl:w-76 2xl:w-80 shrink-0 flex flex-col gap-4">
          {/* TARJETA PERFIL */}
          <div
            className={`${GLOBAL_UI.glass.sidebar} p-4 flex flex-col gap-3.5`}
          >
            <div
              className={`flex flex-col gap-3 p-3.5 ${GLOBAL_UI.glass.subcard}`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#121926]/80 border border-slate-300/[0.14] flex items-center justify-center shrink-0 shadow-md">
                  {renderFactionEmblemIcon(factionId)}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  {isEditingCommanderName ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={commanderNameDraft}
                        maxLength={18}
                        autoFocus
                        onChange={(e) => setCommanderNameDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveCommanderName();
                          if (e.key === 'Escape') {
                            setCommanderNameDraft(playerName);
                            setIsEditingCommanderName(false);
                          }
                        }}
                        placeholder="Comandante"
                        className="w-full min-w-0 px-2 py-1 rounded-lg bg-[#090e17] border border-white/25 text-sm font-display font-bold text-white focus:outline-none focus:border-white/50"
                      />
                      <button
                        type="button"
                        onClick={handleSaveCommanderName}
                        title="Guardar nombre"
                        className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30 cursor-pointer shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCommanderNameDraft(playerName);
                        setIsEditingCommanderName(true);
                      }}
                      title="Haz clic para personalizar tu nombre de Comandante"
                      className="group flex items-center gap-1.5 text-left cursor-pointer w-fit max-w-full"
                    >
                      <span className="text-base font-display font-bold text-slate-100 group-hover:text-white tracking-wide leading-tight truncate">
                        {playerName}
                      </span>
                      <Pencil className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 group-hover:text-slate-200 transition-opacity shrink-0" />
                    </button>
                  )}
                  <span className="text-[13px] font-mono font-semibold text-slate-300 tabular-nums leading-snug mt-0.5">
                    Héroe <strong className="text-white">Nv. {characterLevel}</strong>
                  </span>
                </div>
              </div>

              {/* BARRAS DE PROGRESO */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex justify-between text-[13px] font-mono font-semibold text-slate-200 tabular-nums">
                  <span className="text-slate-300">
                    XP Combate · Próximo Nivel
                  </span>
                  <span className="text-white font-bold">{heroXpPct}%</span>
                </div>
                <div
                  className={`h-2 rounded-full overflow-hidden p-0.5 ${GLOBAL_UI.progression.heroXp.track}`}
                >
                  <div
                    className={`h-full rounded-full ${GLOBAL_UI.progression.heroXp.barFill}`}
                    style={{ width: `${heroXpPct}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-300/[0.10]">
                <div className="flex justify-between text-[13px] font-mono font-semibold text-slate-200 tabular-nums">
                  <span className="text-slate-300">
                    Rango Operativo Nv. {professionLevel} · Próx. Nv.
                  </span>
                  <span className={`font-bold ${theme.accentText}`}>
                    {professionXpPct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#0E141F]/70 border border-slate-300/[0.10] overflow-hidden p-0.5">
                  <div
                    className={`h-full ${theme.barFill} rounded-full`}
                    style={{ width: `${professionXpPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div
              className={`flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-mono text-slate-300 ${GLOBAL_UI.glass.subcard}`}
            >
              <MapPin
                className={`w-4 h-4 ${theme.accentText} shrink-0`}
              />
              <div className="flex flex-col min-w-0 leading-snug">
                <span className="text-xs uppercase tracking-wider text-slate-400">
                  Frente Asignado
                </span>
                <strong className="text-slate-100 font-semibold truncate">
                  {planetOnlyName}
                </strong>
              </div>
            </div>
          </div>

          {/* NAVEGACIÓN TEMÁTICA POR FACCIÓN */}
          <div className={`${GLOBAL_UI.glass.sidebar} p-3.5 flex flex-col`}>
            <nav
              aria-label="Módulos del Juego"
              className="flex flex-col gap-1.5"
            >
              <div className="px-3 py-1.5 text-xs uppercase tracking-widest text-slate-400 font-mono font-bold">
                Mando Operativo
              </div>

              {/* 1. PANTALLA GENERAL DE MANDO */}
              <button
                type="button"
                onClick={() => setActiveTab('hub')}
                className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                  activeTab === 'hub'
                    ? theme.activeNav
                    : 'bg-transparent text-slate-200 border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <LayoutDashboard
                    className={`w-5 h-5 shrink-0 ${
                      activeTab === 'hub' ? theme.accentText : 'text-slate-400'
                    }`}
                  />
                  <span className="text-sm font-display">
                    {menuLabels.hubLabel}
                  </span>
                </span>
              </button>

              {/* 2. BASE TEMÁTICA POR FACCIÓN (Bastión de Hierro / El Enjambre / El Nexo) */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsCitadelMenuOpen(!isCitadelMenuOpen);
                    if (!isCitadelTabActive) setActiveTab('ciudadela_reactor');
                  }}
                  className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                    isCitadelTabActive
                      ? theme.activeNav
                      : 'bg-transparent text-slate-200 border-transparent hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Building2
                      className={`w-5 h-5 shrink-0 ${
                        isCitadelTabActive ? theme.accentText : 'text-slate-400'
                      }`}
                    />
                    <span className="text-sm font-display">
                      {menuLabels.baseLabel}
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isCitadelMenuOpen ? 'rotate-180' : ''
                    } ${isCitadelTabActive ? theme.accentText : 'text-slate-400'}`}
                  />
                </button>

                {isCitadelMenuOpen && (
                  <div className="pl-3.5 ml-3.5 border-l border-white/15 flex flex-col gap-1 py-1">
                    {[
                      {
                        id: 'ciudadela_reactor' as ModuleTab,
                        label: menuLabels.reactorSubLabel,
                        icon: Zap,
                      },
                      {
                        id: 'ciudadela_forja' as ModuleTab,
                        label: menuLabels.forgeSubLabel,
                        icon: Blocks,
                      },
                      {
                        id: 'ciudadela_laboratorio' as ModuleTab,
                        label: menuLabels.labSubLabel,
                        icon: Cpu,
                      },
                      {
                        id: 'ciudadela_almacen' as ModuleTab,
                        label: menuLabels.siloSubLabel,
                        icon: Container,
                      },
                    ].map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setActiveTab(sub.id)}
                          className={`w-full min-h-[38px] flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium border transition-all duration-150 cursor-pointer ${
                            isSubActive
                              ? theme.activeNav
                              : 'bg-transparent text-slate-300 border-transparent hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <SubIcon
                              className={`w-4 h-4 shrink-0 ${
                                isSubActive
                                  ? theme.accentText
                                  : 'text-slate-400'
                              }`}
                            />
                            <span>{sub.label}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3 y 4. HÉROE Y CHASIS, FRENTE DE BATALLA */}
              {[
                {
                  id: 'comandante' as ModuleTab,
                  label: menuLabels.heroLabel,
                  icon: UserCheck,
                },
                {
                  id: 'combate' as ModuleTab,
                  label: menuLabels.combatLabel,
                  icon: Crosshair,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? theme.activeNav
                        : 'bg-transparent text-slate-200 border-transparent hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 shrink-0 ${
                          isActive ? theme.accentText : 'text-slate-400'
                        }`}
                      />
                      <span className="text-sm font-display">{item.label}</span>
                    </span>
                  </button>
                );
              })}

              {/* 5. MAPA ESTELAR + SUBMENÚ HIJO (CARTOGRAFÍA ORBITAL Y ARCHIVO DE HOSTILES) */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsMapMenuOpen(!isMapMenuOpen);
                    if (!isMapTabActive) setActiveTab('exploracion');
                  }}
                  className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                    isMapTabActive
                      ? theme.activeNav
                      : 'bg-transparent text-slate-200 border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Compass
                      className={`w-5 h-5 shrink-0 ${
                        isMapTabActive ? theme.accentText : 'text-slate-400'
                      }`}
                    />
                    <span className="text-sm font-display">
                      {menuLabels.mapLabel}
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isMapMenuOpen ? 'rotate-180' : ''
                    } ${isMapTabActive ? theme.accentText : 'text-slate-400'}`}
                  />
                </button>

                {isMapMenuOpen && (
                  <div className="pl-3.5 ml-3.5 border-l border-white/15 flex flex-col gap-1 py-1">
                    {[
                      {
                        id: 'exploracion' as ModuleTab,
                        label: menuLabels.mapSubLabel,
                        icon: Compass,
                      },
                      {
                        id: 'exploracion_hostiles' as ModuleTab,
                        label: menuLabels.bestiarySubLabel,
                        icon: Radar,
                      },
                    ].map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setActiveTab(sub.id)}
                          className={`w-full min-h-[38px] flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium border transition-all duration-150 cursor-pointer ${
                            isSubActive
                              ? theme.activeNav
                              : 'bg-transparent text-slate-300 border-transparent hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <SubIcon
                              className={`w-4 h-4 shrink-0 ${
                                isSubActive ? theme.accentText : 'text-slate-400'
                              }`}
                            />
                            <span>{sub.label}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 6. DIRECTIVAS E HITOS (ÚLTIMO MENÚ) */}
              <button
                type="button"
                onClick={() => setActiveTab('directivas')}
                className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                  activeTab === 'directivas'
                    ? theme.activeNav
                    : 'bg-transparent text-slate-200 border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Target
                    className={`w-5 h-5 shrink-0 ${
                      activeTab === 'directivas'
                        ? theme.accentText
                        : readyDirectivesCount > 0
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                    }`}
                  />
                  <span className="text-sm font-display">
                    {menuLabels.directivesLabel}
                  </span>
                </span>
                {readyDirectivesCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/60 font-mono text-xs font-bold text-emerald-200 animate-pulse tabular-nums">
                    {readyDirectivesCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </aside>

        {/* MAIN VIEWS */}
        <main
          className={`flex-1 min-w-0 w-full flex flex-col ${
            isTutorialActive ? 'pb-64' : 'pb-8'
          }`}
        >
          {activeTab === 'hub' && (
            <CommandHubView
              factionId={factionId}
              currentFaction={currentFaction}
              playerName={playerName}
              characterLevel={characterLevel}
              heroLoadout={heroLoadout}
              maxPlayerHp={maxPlayerHp}
              maxPlayerDefense={maxPlayerDefense}
              playerAttackDmg={heroCombatStats.playerAttackDmg}
              buildings={buildings}
              usedReactorMw={usedReactorMw}
              maxReactorMw={maxReactorMw}
              reserveReactorMw={reserveReactorMw}
              routingMode={reactorRoutingMode}
              inventory={inventory}
              activePlanet={activePlanet}
              currentLocation={planetOnlyName}
              directives={directives}
              onClaimDirective={claimDirective}
              achievements={achievements}
              activeBuildingUpgrades={activeBuildingUpgrades}
              nowTimestamp={nowTimestamp}
              onNavigateTab={setActiveTab}
              onOpenForgeChassis={() => openForgeTab('chasis')}
              isTutorialActive={isTutorialActive}
            />
          )}

          {activeTab === 'directivas' && (
            <DirectivesView
              factionId={factionId}
              currentFaction={currentFaction}
              directives={directives}
              achievements={achievements}
              onClaimDirective={claimDirective}
              onNavigateTab={setActiveTab}
              onOpenForgeChassis={() => openForgeTab('chasis')}
              isTutorialActive={isTutorialActive}
            />
          )}

          {isCitadelTabActive && (
            <CiudadelaView
              activeSection={currentCitadelSection}
              factionId={factionId}
              buildings={buildings}
              technologies={technologies}
              storageCatalog={storageCatalog}
              inventory={inventory}
              credits={credits}
              costReductionPct={totalCitadelCostReductionPct}
              siloUsed={siloUsed}
              siloMaxCapacity={siloMaxCapacity}
              heroLoadout={heroLoadout}
              routingMode={reactorRoutingMode}
              activeBuildingUpgrades={activeBuildingUpgrades}
              activeTechResearches={activeTechResearches}
              nowTimestamp={nowTimestamp}
              onChangeRoutingMode={setReactorRoutingMode}
              onToggleChassisLowPower={toggleChassisLowPower}
              onUpgradeBuilding={upgradeBuilding}
              onResearchTechnology={researchTechnology}
              onScrapItem={scrapItem}
              onCraftForgeItem={craftForgeItem}
              onUpgradeChassisSlot={upgradeHeroChassis}
              forgeInitialTab={forgeInitialTab}
              isTutorialActive={isTutorialActive}
            />
          )}

          {activeTab === 'comandante' && (
            <CommanderView
              playerName={playerName}
              characterLevel={characterLevel}
              currentFaction={currentFaction}
              heroLoadout={heroLoadout}
              reactorLevel={buildings[0].level}
              maxPlayerHp={maxPlayerHp}
              maxPlayerDefense={maxPlayerDefense}
              playerAttackDmg={heroCombatStats.playerAttackDmg}
              onOpenForge={() => openForgeTab('chasis')}
              isTutorialActive={isTutorialActive}
            />
          )}

          {activeTab === 'forja' && (
            <ForgeView
              factionId={factionId}
              forgeLevel={buildings[1].level}
              credits={credits}
              inventory={inventory}
              heroLoadout={heroLoadout}
              routingMode={reactorRoutingMode}
              upgradeTimer={activeBuildingUpgrades['matriz_ensamblaje']}
              nowTimestamp={nowTimestamp}
              onUpgradeForge={() => upgradeBuilding('matriz_ensamblaje')}
              onCraftComplete={craftForgeItem}
              onUpgradeChassisSlot={upgradeHeroChassis}
              initialTab={forgeInitialTab}
              isTutorialActive={isTutorialActive}
            />
          )}

          {activeTab === 'combate' && (
            <CombatView
              stageConfig={{
                id: activePlanet?.id || 'PLN-VAL-01',
                arenaUrl: `/assets/arenas/${activePlanet?.id || 'PLN-VAL-01'}.jpg`,
              }}
              currentLocation={planetOnlyName}
              playerName={playerName}
              characterLevel={characterLevel}
              currentFaction={currentFaction}
              selectedEnemy={selectedEnemy}
              enemySquad={enemySquad}
              selectedTargetId={selectedTargetId}
              onSelectTarget={selectTarget}
              currentWave={currentWave}
              totalWaves={totalWaves}
              turnPhase={turnPhase}
              turnQueue={turnQueue}
              turnCount={turnCount}
              isAutoCombat={isAutoCombat}
              onToggleAutoCombat={toggleAutoCombat}
              combatSpeed={combatSpeed}
              onChangeCombatSpeed={setCombatSpeed}
              playerHp={playerHp}
              maxPlayerHp={maxPlayerHp}
              playerDefense={playerDefense}
              maxPlayerDefense={maxPlayerDefense}
              playerBuffTurns={playerBuffTurns}
              playerCombatStatus={playerCombatStatus}
              equippedSkills={equippedSkills}
              activeActorId={activeActorId}
              hitTargetId={hitTargetId}
              floatingEvents={floatingEvents}
              isCombatActive={isCombatActive}
              onToggleCombat={toggleCombat}
              onBasicAttack={executeBasicAttack}
              onUseSkill={executeSkill}
              onReturnToCitadel={() => setActiveTab('hub')}
              sessionLoot={combatSessionLoot}
              onClearSessionLoot={clearCombatSessionLoot}
              isTutorialActive={isTutorialActive}
            />
          )}

          {activeTab === 'exploracion' && (
            <StarMapView
              currentLocation={planetOnlyName}
              currentFaction={currentFaction}
              playerLevel={characterLevel}
              onNavigateToSector={navigateToSector}
              isTutorialActive={isTutorialActive}
            />
          )}

          {activeTab === 'exploracion_hostiles' && (
            <BestiarioView
              factionId={factionId}
              currentFaction={currentFaction}
              playerLevel={characterLevel}
              routingMode={reactorRoutingMode}
              encounteredEnemyKeys={encounteredEnemyKeys}
              onNavigateToSector={navigateToSector}
              onOpenStarMap={() => setActiveTab('exploracion')}
              isTutorialActive={isTutorialActive}
            />
          )}
        </main>
      </div>

      {/* GUÍA CONTEXTUAL POR PANTALLA (JUST-IN-TIME) */}
      {isTutorialActive && (
        <OnboardingTutorialOverlay
          factionId={factionId}
          screenKey={activeTutorialScreenKey}
          onDismissScreenTutorial={skipTutorial}
          onDisableAllTutorials={disableAllTutorials}
          onReturnToFactionSelect={openFactionSelector}
        />
      )}

      {/* AVISO FLOTANTE (TOAST) AL COMPLETAR UNA DIRECTIVA DEL CENTRO DE MANDO */}
      {completedDirectiveToast && (
        <div className="fixed top-20 right-6 z-50 w-[92vw] max-w-md rounded-2xl bg-[#09121e]/95 backdrop-blur-2xl border-2 border-emerald-400/75 shadow-[0_14px_45px_rgba(16,185,129,0.35)] p-4 flex flex-col gap-3 animate-in fade-in duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-300">
                  MANDO CENTRAL · {completedDirectiveToast.code}
                </span>
                <h4 className="text-sm font-display font-bold text-white leading-snug">
                  ¡Misión Completada! {completedDirectiveToast.title}
                </h4>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissDirectiveToast}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('directivas');
                dismissDirectiveToast();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-[13px] font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              Ver en {menuLabels.directivesLabel}
            </button>
            <button
              type="button"
              onClick={() => claimDirective(completedDirectiveToast.id)}
              className="px-4 py-1.5 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-400/70 font-mono text-[13px] font-bold text-emerald-100 hover:text-white flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5 text-amber-300" />
              <span>Reclamar +{completedDirectiveToast.rewardCredits} ₡</span>
            </button>
          </div>
        </div>
      )}

      {/* REGISTRO FLOTANTE ESCALABLE QUE SE ABRE HACIA ARRIBA */}
      <div className="fixed bottom-12 right-6 z-40 flex flex-col items-end justify-end">
        {!isLogOpen ? (
          <button
            onClick={() => setIsLogOpen(true)}
            className={`w-13 h-13 rounded-2xl bg-slate-950/85 hover:bg-slate-900/95 backdrop-blur-xl border border-white/15 hover:border-white/30 shadow-2xl flex items-center justify-center ${theme.accentText} transition-all cursor-pointer`}
            title="Abrir Consola de Registros"
          >
            <Terminal className="w-5 h-5" />
          </button>
        ) : (
          <div
            style={{
              width: `min(92vw, ${logDimensions.width}px)`,
              maxHeight: 'calc(100vh - 130px)',
            }}
            className="relative origin-bottom-right rounded-2xl bg-slate-950/92 backdrop-blur-2xl border border-white/18 shadow-[0_14px_45px_rgba(0,0,0,0.92)] flex flex-col overflow-hidden"
          >
            {/* Tirador de escalado libre en la esquina superior izquierda */}
            <div
              onMouseDown={handleStartLogResize}
              title="Arrastra hacia arriba/izquierda para escalar libremente el tamaño de la consola"
              className="px-3.5 py-2.5 flex items-center justify-between border-b border-white/10 bg-black/55 cursor-nwse-resize select-none shrink-0"
            >
              <div className="flex items-center gap-2">
                <GripHorizontal className="w-4 h-4 text-slate-400" />
                <Terminal className={`w-4 h-4 ${theme.accentText}`} />
                <span className="text-[13px] uppercase font-mono font-bold text-slate-100">
                  Log Visual
                </span>
              </div>

              <div
                onMouseDown={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5"
              >
                {(
                  [
                    { label: 'S', w: 380, h: 160 },
                    { label: 'M', w: 480, h: 240 },
                    { label: 'L', w: 620, h: 340 },
                  ] as const
                ).map((preset) => {
                  const isCurrentSize =
                    Math.abs(logDimensions.width - preset.w) < 35 &&
                    Math.abs(logDimensions.height - preset.h) < 35;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        setLogDimensions({ width: preset.w, height: preset.h })
                      }
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        isCurrentSize
                          ? `bg-white/15 border-white/30 ${theme.accentText}`
                          : 'bg-black/40 border-white/10 text-slate-300 hover:text-white'
                      }`}
                      title={`Tamaño ${preset.label}`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setIsLogOpen(false)}
                  className="ml-1 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div
              style={{
                height: `min(${logDimensions.height}px, calc(100vh - 180px))`,
              }}
              className="bg-black/55 p-3.5 overflow-y-auto flex flex-col"
            >
              {activityFeed.map((entry, idx) => (
                <div
                  key={idx}
                  className="text-[13px] font-mono text-slate-200 py-1.5 border-b border-white/5 leading-relaxed"
                >
                  &gt; {entry}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const MainLayout: React.FC = () => (
  <GameProvider>
    <MainShell />
  </GameProvider>
);