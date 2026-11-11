// src/components/ForgeView.tsx
import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Blocks,
  CheckCircle2,
  Container,
  Cpu,
  Crosshair,
  Flame,
  Footprints,
  Hand,
  HardHat,
  Lock,
  Shield,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  CHASSIS_MK_LABELS,
  CHASSIS_SLOT_LABELS,
  FACTION_REACTOR_SKINS,
  FACTION_RESOURCE_SPECS,
  GAME_BALANCE,
} from '../data/factionIdentityCatalog';
import { MOCK_CREDITS, MOCK_FORGE_RECIPES } from '../data/mockState';
import { GLOBAL_UI, getFactionTheme } from '../data/themeConfig';
import {
  FactionId,
  HeroChassisItem,
  HeroChassisSlot,
  HeroLoadout,
  ReactorRoutingMode,
  ResourceIconKey,
} from '../types/game';
import { TutorialBeacon } from './OnboardingTutorialOverlay';
import { renderResourceCostIcon, renderSciFiIcon } from './ThemedIcon';

export type ActionCardStatus = 'available' | 'locked' | 'in_progress';

export interface ForgeCostPill {
  id: string;
  label: string;
  required: number;
  owned?: number;
}

export interface ForgeRecipeItem {
  id: string;
  name: string;
  tier: number;
  requiredForgeLevel: number;
  cycleSeconds: number;
  iconKey: ResourceIconKey;
  factionAffinity?: FactionId;
  outputResourceId?: string;
  outputAmount?: number;
  costs: ForgeCostPill[];
}

export interface FacilityHeaderProps {
  factionId?: FactionId;
  facilityKind?: 'forge' | 'lab' | 'silo';
  badgeSubtitle?: string;
  title: string;
  description?: string;
  level: number;
  maxLevel?: number;
  reactorLevel?: number;
  drawMw?: number;
  operationalEffect: string;
  upgradeCosts: ForgeCostPill[];
  canUpgrade: boolean;
  isCappedByReactor?: boolean;
  onUpgrade: () => void;
  upgradeTimer?: { endTime: number; durationSec?: number };
  nowTimestamp?: number;
  isTutorialActive?: boolean;
  beaconStepNumber?: 1 | 2 | 3;
  beaconLabel?: string;
}

export interface ActionCardProps {
  factionId?: FactionId;
  item: ForgeRecipeItem;
  status: ActionCardStatus;
  progressPercent?: number;
  canAfford: boolean;
  onAction: (item: ForgeRecipeItem) => void;
}

export interface ForgeViewProps {
  factionId?: FactionId;
  forgeLevel?: number;
  maxForgeLevel?: number;
  reactorLevel?: number;
  credits?: number;
  inventory?: Record<string, number>;
  upgradeCosts?: ForgeCostPill[];
  canUpgradeForge?: boolean;
  isCappedByReactor?: boolean;
  onUpgradeForge?: () => void;
  onCraftComplete?: (item: ForgeRecipeItem) => void;
  heroLoadout?: HeroLoadout;
  usedReactorMw?: number;
  maxReactorMw?: number;
  routingMode?: ReactorRoutingMode;
  onUpgradeChassisSlot?: (
    slot: HeroChassisSlot,
    costs: ForgeCostPill[],
    extraMw: number
  ) => void;
  upgradeTimer?: { endTime: number; durationSec?: number };
  nowTimestamp?: number;
  initialTab?: 'compuestos' | 'chasis';
  isTutorialActive?: boolean;
  forgeSpeedBonusPct?: number;
}

function renderMinimalIcon(iconKey: ResourceIconKey, className: string) {
  return renderSciFiIcon(iconKey, className);
}

function renderCostPillIcon(costId: string) {
  return renderResourceCostIcon(costId);
}

function renderSlotIcon(slot: HeroChassisSlot, className: string) {
  if (slot === 'weapon') return <Crosshair className={className} />;
  if (slot === 'chest') return <Shield className={className} />;
  if (slot === 'helmet') return <HardHat className={className} />;
  if (slot === 'gloves') return <Hand className={className} />;
  return <Footprints className={className} />;
}

export function getChassisUpgradeRequirements(
  factionId: FactionId,
  item: HeroChassisItem,
  inventory: Record<string, number>,
  credits: number,
  routingMode: ReactorRoutingMode = 'belico'
): {
  requiredForgeLevel: number;
  rawExtraMw: number;
  effectiveExtraMw: number;
  nextPrimaryStatValue: number;
  costs: ForgeCostPill[];
} {
  const nextTier = Math.min(5, item.level + 1);
  const requiredForgeLevel = item.level;
  const baseExtraMw = item.slot === 'weapon' || item.slot === 'chest' ? 18 : 12;
  const rawExtraMw = baseExtraMw + (item.level - 1) * 4;
  const effectiveExtraMw =
    factionId === 'skithid'
      ? Math.round(rawExtraMw * GAME_BALANCE.reactor.skithidChassisMwMultiplier)
      : rawExtraMw;

  const statBoost =
    item.primaryStat.type === 'damage'
      ? 18 + item.level * 8
      : item.primaryStat.type === 'shieldCapacity'
        ? 8 + item.level * 4
        : item.primaryStat.type === 'flatArmor'
          ? 8 + item.level * 4
          : 5 + item.level * 2;

  const nextPrimaryStatValue = item.primaryStat.value + statBoost;

  const creditDiscount =
    routingMode === 'industrial'
      ? GAME_BALANCE.forge.industrialCreditDiscountMultiplier
      : 1.0;
  const creditCost = Math.round(
    GAME_BALANCE.forge.chassisBaseCreditCostFactor *
      item.level *
      item.level *
      creditDiscount
  );

  const factionSpec =
    FACTION_RESOURCE_SPECS[factionId] || FACTION_RESOURCE_SPECS.valari;
  const costs: ForgeCostPill[] = [];

  if (nextTier === 2) {
    costs.push(
      {
        id: factionSpec.rawT1.id,
        label: factionSpec.rawT1.label,
        required: 16,
        owned: Math.floor(inventory[factionSpec.rawT1.id] || 0),
      },
      {
        id: factionSpec.craftT2.id,
        label: factionSpec.craftT2.label,
        required: 2,
        owned: Math.floor(inventory[factionSpec.craftT2.id] || 0),
      }
    );
  } else if (nextTier === 3) {
    costs.push(
      {
        id: factionSpec.craftT2.id,
        label: factionSpec.craftT2.label,
        required: 3,
        owned: Math.floor(inventory[factionSpec.craftT2.id] || 0),
      },
      {
        id: factionSpec.craftT3.id,
        label: factionSpec.craftT3.label,
        required: 2,
        owned: Math.floor(inventory[factionSpec.craftT3.id] || 0),
      }
    );
  } else {
    costs.push(
      {
        id: factionSpec.craftT3.id,
        label: factionSpec.craftT3.label,
        required: 3,
        owned: Math.floor(inventory[factionSpec.craftT3.id] || 0),
      },
      {
        id: factionSpec.craftT4.id,
        label: factionSpec.craftT4.label,
        required: 2,
        owned: Math.floor(inventory[factionSpec.craftT4.id] || 0),
      }
    );
  }

  costs.push({
    id: 'credits',
    label: 'Créditos',
    required: creditCost,
    owned: Math.floor(credits),
  });

  return {
    requiredForgeLevel,
    rawExtraMw,
    effectiveExtraMw,
    nextPrimaryStatValue,
    costs,
  };
}

export const FacilityHeader: React.FC<FacilityHeaderProps> = ({
  factionId = 'valari',
  facilityKind = 'forge',
  badgeSubtitle,
  title,
  description = 'Sintetiza compuestos tácticos y evoluciona el Equipamiento del Comandante dentro del límite de MW del Reactor.',
  level,
  maxLevel = 20,
  reactorLevel,
  drawMw,
  operationalEffect,
  upgradeCosts,
  canUpgrade,
  isCappedByReactor = false,
  onUpgrade,
  upgradeTimer,
  nowTimestamp = Date.now(),
  isTutorialActive = false,
  beaconStepNumber = 3,
  beaconLabel = 'Ampliar Instalación',
}) => {
  const isMax = level >= maxLevel;
  const isUpgrading = Boolean(
    upgradeTimer && upgradeTimer.endTime > nowTimestamp
  );
  const remainingSec =
    isUpgrading && upgradeTimer
      ? Math.max(1, Math.ceil((upgradeTimer.endTime - nowTimestamp) / 1000))
      : 0;
  const theme = getFactionTheme(factionId);

  const HeaderIcon =
    facilityKind === 'lab'
      ? Cpu
      : facilityKind === 'silo'
        ? Container
        : Blocks;

  return (
    <header
      className={`w-full p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${GLOBAL_UI.glass.panel}`}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div
          className={`relative w-12 h-12 rounded-xl bg-[#182232]/80 border ${theme.accentBorder} flex items-center justify-center shrink-0 shadow-md`}
        >
          <HeaderIcon className={`w-6 h-6 ${theme.accentText}`} />
          <span
            className={`absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded bg-black/90 border border-white/20 text-xs font-mono font-bold ${theme.accentText} leading-none tabular-nums`}
          >
            Nv.{level}
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          {badgeSubtitle && (
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300 mb-0.5">
              <span className="font-bold uppercase tracking-wider">
                {badgeSubtitle}
              </span>
              {drawMw !== undefined && (
                <>
                  <span className="text-slate-600">·</span>
                  <span>Consumo: {drawMw} MW</span>
                </>
              )}
              {reactorLevel !== undefined && !isMax && (
                <>
                  <span className="text-slate-600">·</span>
                  <span
                    className={
                      isCappedByReactor
                        ? 'text-amber-200 font-semibold'
                        : 'text-slate-300'
                    }
                  >
                    Techo Reactor: Nv.{reactorLevel}
                  </span>
                </>
              )}
            </div>
          )}
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100 uppercase tracking-wide">
              {title} · Nivel {level}
            </h1>
            <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[13px] font-mono font-semibold text-slate-200">
              {operationalEffect}
            </span>
          </div>
          <p className="text-[13px] sm:text-sm text-slate-300 mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* ZONA CENTRALIZADA DE MEJORA DE INSTALACIÓN (SIEMPRE EN EL MISMO LUGAR PARA FORJA, LABORATORIO Y SILO) */}
      <div className="flex flex-wrap items-center gap-2.5 xl:justify-end shrink-0">
        <TutorialBeacon
          stepNumber={beaconStepNumber}
          label={beaconLabel}
          isActive={isTutorialActive}
          factionId={factionId}
        />
        {!isMax &&
          upgradeCosts.map((cost) => {
            const hasEnough =
              cost.owned === undefined || cost.owned >= cost.required;
            return (
              <div
                key={cost.id}
                title={cost.label}
                className={`px-3.5 py-2 rounded-xl border font-mono text-[13px] flex items-center gap-2 tabular-nums ${
                  hasEnough
                    ? 'bg-black/45 border-white/12 text-slate-200'
                    : 'bg-rose-950/40 border-rose-500/35 text-rose-200'
                }`}
              >
                {renderCostPillIcon(cost.id)}
                <span className="text-slate-300">{cost.label}:</span>
                <span className="font-bold text-white">
                  {cost.owned !== undefined
                    ? `${cost.owned.toLocaleString('es-ES')} / `
                    : ''}
                  {cost.required.toLocaleString('es-ES')}
                </span>
              </div>
            );
          })}
        <button
          type="button"
          disabled={!canUpgrade || isMax || isUpgrading || isCappedByReactor}
          onClick={onUpgrade}
          className={`min-h-[42px] px-4 py-2 rounded-xl text-[13px] font-display font-bold uppercase tracking-wider shrink-0 flex items-center gap-2 ${
            isUpgrading
              ? 'bg-amber-950/60 border border-amber-400/50 text-amber-200 cursor-wait'
              : canUpgrade && !isMax && !isCappedByReactor
                ? `${theme.primaryButton} ring-2 ring-emerald-400/80 shadow-[0_0_22px_rgba(16,185,129,0.45)] transition-all cursor-pointer`
                : GLOBAL_UI.glass.disabledButton
          }`}
        >
          {canUpgrade && !isMax && !isUpgrading && !isCappedByReactor && (
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping shrink-0" />
          )}
          {isCappedByReactor && !isMax && !isUpgrading && (
            <Lock className="w-4 h-4 shrink-0 text-amber-300" />
          )}
          <span>
            {isMax
              ? 'Nivel Máximo'
              : isUpgrading
                ? `Ampliando... (${remainingSec}s)`
                : isCappedByReactor
                  ? `Req. Reactor Nv.${level + 1}`
                  : `Ampliar a Nv.${level + 1}`}
          </span>
        </button>
      </div>
    </header>
  );
};

export const ActionCard: React.FC<ActionCardProps> = ({
  factionId = 'valari',
  item,
  status,
  progressPercent = 0,
  canAfford,
  onAction,
}) => {
  const theme = getFactionTheme(factionId);

  if (status === 'locked') {
    return (
      <article
        className={`p-6 flex flex-col justify-between gap-4 min-h-[240px] select-none ${GLOBAL_UI.glass.panel}`}
      >
        <div className="flex flex-col items-center justify-center gap-3 flex-1">
          <div className="relative w-16 h-16 rounded-xl bg-black/45 border border-white/10 flex items-center justify-center">
            {renderMinimalIcon(
              item.iconKey,
              'w-9 h-9 text-slate-600 brightness-50 contrast-200'
            )}
            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-black/80 border border-white/10 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
          <span className="text-base font-display font-semibold text-slate-300 text-center">
            {item.name}
          </span>
          <span className="px-3 py-1 rounded-lg bg-black/45 border border-white/10 text-[13px] font-mono text-slate-300">
            Requiere Forja Nivel {item.requiredForgeLevel}
          </span>
        </div>
        <button
          type="button"
          disabled
          className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-[13px] font-display font-bold uppercase ${GLOBAL_UI.glass.disabledButton}`}
        >
          Bloqueado
        </button>
      </article>
    );
  }

  const isInProgress = status === 'in_progress';

  return (
    <article
      className={`p-5 flex flex-col justify-between gap-4 min-h-[240px] transition-all ${GLOBAL_UI.glass.panel} ${
        isInProgress
          ? `${theme.activeCardBorder} animate-pulse`
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
            {renderMinimalIcon(item.iconKey, `w-6 h-6 ${theme.accentText}`)}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <h2 className="text-base font-display font-bold text-slate-100 leading-snug">
              {item.name}
            </h2>
            <span className="text-[13px] font-mono text-slate-300 tabular-nums">
              Tier {item.tier} · Produce x{item.outputAmount || 1} ·{' '}
              {item.cycleSeconds}s
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Requisitos de Síntesis
        </span>
        <div className="flex flex-wrap gap-2">
          {item.costs.map((cost) => {
            const enough =
              cost.owned === undefined || cost.owned >= cost.required;
            return (
              <div
                key={cost.id}
                title={cost.label}
                className={`flex items-center gap-1.5 bg-black/45 rounded-lg px-3 py-1.5 text-[13px] font-mono tabular-nums border ${
                  enough
                    ? 'text-slate-200 border-white/10'
                    : 'text-rose-200 border-rose-500/40'
                }`}
              >
                {renderCostPillIcon(cost.id)}
                <span>{cost.label}:</span>
                <span className="font-bold text-white">
                  {cost.owned !== undefined ? `${cost.owned}/` : ''}
                  {cost.required}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isInProgress ? (
        <button
          type="button"
          className={`relative w-full min-h-[44px] py-2 rounded-xl font-mono font-bold text-[13px] uppercase transition-all duration-300 ${theme.progressButton} overflow-hidden cursor-default`}
        >
          <div
            className={`absolute inset-y-0 left-0 ${theme.progressFill} transition-all duration-150 ease-linear`}
            style={{ width: `${Math.min(100, Math.round(progressPercent))}%` }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2 tabular-nums">
            Sintetizando...{' '}
            <span className={theme.accentTextBright}>
              {Math.min(100, Math.round(progressPercent))}%
            </span>
          </span>
        </button>
      ) : (
        <button
          type="button"
          disabled={!canAfford}
          onClick={() => onAction(item)}
          className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-[13px] font-display font-bold uppercase tracking-wider ${
            canAfford
              ? `${theme.primaryButton} transition-colors cursor-pointer`
              : GLOBAL_UI.glass.disabledButton
          }`}
        >
          {canAfford
            ? `Sintetizar (+${item.outputAmount || 1})`
            : 'Materiales Insuficientes'}
        </button>
      )}
    </article>
  );
};

export const ForgeView: React.FC<ForgeViewProps> = ({
  factionId = 'valari',
  forgeLevel: externalForgeLevel,
  maxForgeLevel = 20,
  reactorLevel = 1,
  credits: externalCredits = MOCK_CREDITS,
  inventory: externalInventory = {},
  upgradeCosts: externalUpgradeCosts,
  canUpgradeForge: externalCanUpgrade,
  isCappedByReactor: externalIsCapped,
  onUpgradeForge,
  onCraftComplete,
  heroLoadout,
  usedReactorMw = 96,
  maxReactorMw = GAME_BALANCE.reactor.baseMw,
  routingMode = 'belico',
  onUpgradeChassisSlot,
  upgradeTimer,
  nowTimestamp = Date.now(),
  initialTab = 'compuestos',
  isTutorialActive = false,
  forgeSpeedBonusPct = 0,
}) => {
  const [forgeTab, setForgeTab] = useState<'compuestos' | 'chasis'>(initialTab);
  const [localForgeLevel, setLocalForgeLevel] = useState<number>(1);
  const [activeCraftingId, setActiveCraftingId] = useState<string | null>(null);
  const [craftingProgress, setCraftingProgress] = useState<number>(0);

  useEffect(() => {
    setForgeTab(initialTab);
  }, [initialTab]);

  const theme = getFactionTheme(factionId);
  const skin = FACTION_REACTOR_SKINS[factionId] || FACTION_REACTOR_SKINS.valari;
  const resourceSpec =
    FACTION_RESOURCE_SPECS[factionId] || FACTION_RESOURCE_SPECS.valari;
  const currentLevel = externalForgeLevel ?? localForgeLevel;
  const unlockedTier = Math.min(5, currentLevel + 1);
  const forgeDrawMw =
    GAME_BALANCE.reactor.forgeBaseMw +
    (currentLevel - 1) * GAME_BALANCE.reactor.forgeMwPerLevel;

  const facilityTitle = skin.forgeModuleName;

  const resolvedUpgradeCosts: ForgeCostPill[] = externalUpgradeCosts ?? [
    {
      id: resourceSpec.rawT1.id,
      label: resourceSpec.rawT1.label,
      required: 15 * currentLevel,
      owned: Math.floor(externalInventory[resourceSpec.rawT1.id] || 0),
    },
    {
      id: resourceSpec.rawT2.id,
      label: resourceSpec.rawT2.label,
      required: 8 * currentLevel,
      owned: Math.floor(externalInventory[resourceSpec.rawT2.id] || 0),
    },
    {
      id: 'credits',
      label: 'Créditos',
      required: 120 * currentLevel,
      owned: externalCredits,
    },
  ];
  const isCapped = externalIsCapped ?? currentLevel >= reactorLevel;
  const canUpgrade =
    externalCanUpgrade ??
    (!isCapped &&
      resolvedUpgradeCosts.every(
        (c) => c.owned === undefined || c.owned >= c.required
      ));

  const factionRecipes = MOCK_FORGE_RECIPES.filter(
    (r) => !r.factionAffinity || r.factionAffinity === factionId
  );

  const baseStepIncrement =
    routingMode === 'industrial'
      ? GAME_BALANCE.forge.industrialRoutingProgressStep
      : factionId === 'skithid'
        ? GAME_BALANCE.forge.skithidProgressStep
        : GAME_BALANCE.forge.baseProgressStep;
  const stepIncrement =
    baseStepIncrement * (1 + Math.max(0, forgeSpeedBonusPct) / 100);

  useEffect(() => {
    if (!activeCraftingId) return;
    const timer = window.setInterval(
      () => setCraftingProgress((prev) => Math.min(100, prev + stepIncrement)),
      150
    );
    return () => window.clearInterval(timer);
  }, [activeCraftingId, stepIncrement]);

  useEffect(() => {
    if (!activeCraftingId || craftingProgress < 100) return;
    const completedItem = MOCK_FORGE_RECIPES.find(
      (r) => r.id === activeCraftingId
    );
    setActiveCraftingId(null);
    setCraftingProgress(0);
    if (completedItem && onCraftComplete) onCraftComplete(completedItem);
  }, [activeCraftingId, craftingProgress, onCraftComplete]);

  const handleStartCraft = (item: ForgeRecipeItem) => {
    setActiveCraftingId(item.id);
    setCraftingProgress(0);
  };

  const reserveMw = Math.max(0, maxReactorMw - usedReactorMw);

  return (
    <section className="w-full flex flex-col gap-5 select-none">
      <FacilityHeader
        factionId={factionId}
        facilityKind="forge"
        badgeSubtitle="División de Manufactura y Equipamiento"
        title={facilityTitle}
        level={currentLevel}
        maxLevel={maxForgeLevel}
        reactorLevel={reactorLevel}
        drawMw={forgeDrawMw}
        operationalEffect={`Habilita Síntesis y Equipamiento hasta Tier ${unlockedTier}`}
        upgradeCosts={resolvedUpgradeCosts}
        canUpgrade={canUpgrade}
        isCappedByReactor={isCapped}
        upgradeTimer={upgradeTimer}
        nowTimestamp={nowTimestamp}
        isTutorialActive={isTutorialActive}
        beaconStepNumber={3}
        beaconLabel="Ampliar Forja"
        onUpgrade={() => {
          if (onUpgradeForge) onUpgradeForge();
          else setLocalForgeLevel((lvl) => Math.min(maxForgeLevel, lvl + 1));
        }}
      />

      {/* BARRA DE PESTAÑAS INTERNAS: SÍNTESIS DE COMPUESTOS VS EVOLUCIÓN DE EQUIPAMIENTO */}
      <div
        className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${GLOBAL_UI.glass.panel}`}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setForgeTab('compuestos')}
            className={`px-4 py-2.5 rounded-xl text-[13px] font-display font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              forgeTab === 'compuestos'
                ? theme.activeTabGlow
                : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Flame className="w-4 h-4 shrink-0" />
            <span>1. Síntesis de Compuestos (T2–T5)</span>
          </button>

          <button
            type="button"
            onClick={() => setForgeTab('chasis')}
            className={`px-4 py-2.5 rounded-xl text-[13px] font-display font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              forgeTab === 'chasis'
                ? theme.activeTabGlow
                : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Wrench className="w-4 h-4 shrink-0" />
            <span>2. Evolución de Equipamiento</span>
          </button>

          <TutorialBeacon
            stepNumber={1}
            label="Pestañas: Compuestos y Equipamiento"
            isActive={isTutorialActive}
            factionId={factionId}
          />
        </div>

        {/* INDICADOR DE PRESUPUESTO DE MW EN EL REACTOR */}
        <div className="flex flex-wrap items-center gap-2">
          <TutorialBeacon
            stepNumber={2}
            label="Recetas y Evolución Mk"
            isActive={isTutorialActive}
            factionId={factionId}
          />
          <div
            className={`px-4 py-2 flex items-center gap-3 font-mono text-[13px] ${GLOBAL_UI.glass.subcard}`}
          >
            <Zap className={`w-4 h-4 ${theme.accentText} shrink-0`} />
            <span className="text-slate-300">Reserva del Reactor:</span>
            <span className={`font-bold tabular-nums ${theme.accentText}`}>
              {reserveMw} MW Libres
            </span>
            <span className="text-slate-400">
              ({usedReactorMw}/{maxReactorMw} MW)
            </span>
          </div>
        </div>
      </div>

      {/* PESTAÑA 1: SÍNTESIS DE COMPUESTOS */}
      {forgeTab === 'compuestos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
          {factionRecipes.map((recipe) => {
            const isLocked = recipe.requiredForgeLevel > currentLevel;
            const isInProgress = activeCraftingId === recipe.id;
            const hydratedCosts: ForgeCostPill[] = recipe.costs.map((cost) => ({
              ...cost,
              owned:
                cost.id === 'credits'
                  ? Math.floor(externalCredits)
                  : Math.floor(externalInventory[cost.id] || 0),
            }));
            const canAfford = hydratedCosts.every(
              (c) => c.owned === undefined || c.owned >= c.required
            );
            const cardStatus: ActionCardStatus = isLocked
              ? 'locked'
              : isInProgress
                ? 'in_progress'
                : 'available';

            return (
              <ActionCard
                key={recipe.id}
                factionId={factionId}
                item={{ ...recipe, costs: hydratedCosts }}
                status={cardStatus}
                progressPercent={isInProgress ? craftingProgress : 0}
                canAfford={canAfford}
                onAction={handleStartCraft}
              />
            );
          })}
        </div>
      )}

      {/* PESTAÑA 2: EVOLUCIÓN DE LOS 5 CHASIS DEL COMANDANTE */}
      {forgeTab === 'chasis' && heroLoadout && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
          {(
            ['weapon', 'chest', 'helmet', 'gloves', 'boots'] as HeroChassisSlot[]
          ).map((slotKey) => {
            const item = heroLoadout[slotKey];
            const isMaxSlot = item.level >= 5;
            const req = getChassisUpgradeRequirements(
              factionId,
              item,
              externalInventory,
              externalCredits,
              routingMode
            );

            const meetsForgeLevel = currentLevel >= req.requiredForgeLevel;
            const meetsMwBudget = reserveMw >= req.effectiveExtraMw;
            const meetsResources = req.costs.every(
              (c) => (c.owned ?? 0) >= c.required
            );
            const canEvolve =
              !isMaxSlot && meetsForgeLevel && meetsMwBudget && meetsResources;

            const statTypeLabel =
              item.primaryStat.type === 'damage'
                ? 'Daño Base'
                : item.primaryStat.type === 'flatArmor'
                  ? 'Blindaje Plano'
                  : item.primaryStat.type === 'evasion'
                    ? 'Evasión Sináptica'
                    : 'Escudo Cuántico';

            return (
              <article
                key={slotKey}
                className={`p-5 flex flex-col justify-between gap-4 ${GLOBAL_UI.glass.panel}`}
              >
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                        {renderSlotIcon(slotKey, `w-5 h-5 ${theme.accentText}`)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                          {CHASSIS_SLOT_LABELS[slotKey]}
                        </span>
                        <h3 className="text-base font-display font-bold text-white leading-snug">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg bg-black/60 border border-white/10 text-[13px] font-mono font-bold ${theme.accentText} shrink-0`}
                    >
                      {CHASSIS_MK_LABELS[item.level] || `Nv.${item.level}`}
                    </span>
                  </div>

                  {/* COMPARATIVA DE ESTADÍSTICA Y CONSUMO DE MW */}
                  <div className="grid grid-cols-2 gap-3 font-mono text-[13px]">
                    <div
                      className={`p-3.5 flex flex-col gap-1 ${GLOBAL_UI.glass.subcard}`}
                    >
                      <span className="text-xs text-slate-300">
                        {statTypeLabel}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-white tabular-nums">
                        {item.primaryStat.value}
                        {!isMaxSlot && (
                          <strong className={`ml-1.5 ${theme.accentText}`}>
                            → {req.nextPrimaryStatValue}
                          </strong>
                        )}
                      </span>
                    </div>

                    <div
                      className={`p-3.5 flex flex-col gap-1 ${GLOBAL_UI.glass.subcard}`}
                    >
                      <span className="text-xs text-slate-300">
                        Demanda Reactor
                      </span>
                      <span
                        className={`text-sm sm:text-base font-bold tabular-nums ${
                          meetsMwBudget ? 'text-white' : 'text-rose-300'
                        }`}
                      >
                        {item.powerDrawMw} MW
                        {!isMaxSlot && (
                          <strong
                            className={`ml-1 ${
                              meetsMwBudget
                                ? 'text-emerald-300'
                                : 'text-rose-300'
                            }`}
                          >
                            (+{req.effectiveExtraMw} MW)
                          </strong>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* MATERIALES REQUERIDOS */}
                  {!isMaxSlot && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[13px] font-mono">
                        <span className="text-slate-300 uppercase font-semibold">
                          Costes de Evolución
                        </span>
                        <span
                          className={
                            meetsForgeLevel
                              ? 'text-emerald-300 font-semibold'
                              : 'text-rose-300 font-bold'
                          }
                        >
                          Req. Forja Nv.{req.requiredForgeLevel}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {req.costs.map((c) => {
                          const ok = (c.owned ?? 0) >= c.required;
                          return (
                            <div
                              key={c.id}
                              className={`px-3.5 py-2 flex items-center justify-between text-[13px] font-mono tabular-nums ${GLOBAL_UI.glass.subcard}`}
                            >
                              <div className="flex items-center gap-2">
                                {renderCostPillIcon(c.id)}
                                <span className="text-slate-200">
                                  {c.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 font-bold">
                                <span
                                  className={
                                    ok ? 'text-white' : 'text-rose-300'
                                  }
                                >
                                  {(c.owned ?? 0).toLocaleString('es-ES')}
                                </span>
                                <span className="text-slate-500">/</span>
                                <span className="text-slate-200">
                                  {c.required.toLocaleString('es-ES')}
                                </span>
                                {ok ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Lock className="w-4 h-4 text-rose-400" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTÓN DE EVOLUCIÓN DE CHASIS */}
                <button
                  type="button"
                  disabled={!canEvolve}
                  onClick={() =>
                    onUpgradeChassisSlot?.(slotKey, req.costs, req.rawExtraMw)
                  }
                  className={`w-full py-3 px-4 rounded-xl text-[13px] font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    canEvolve
                      ? `${theme.primaryButton} ring-2 ring-emerald-400/80 shadow-[0_0_24px_rgba(16,185,129,0.45)] cursor-pointer`
                      : GLOBAL_UI.glass.disabledButton
                  }`}
                >
                  {isMaxSlot ? (
                    <span>Equipamiento en Grado Soberano (Mk-V)</span>
                  ) : !meetsForgeLevel ? (
                    <>
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>
                        Requiere {facilityTitle} Nivel {req.requiredForgeLevel}
                      </span>
                    </>
                  ) : !meetsMwBudget ? (
                    <>
                      <Zap className="w-4 h-4 text-rose-300 shrink-0" />
                      <span>
                        Faltan +{req.effectiveExtraMw - reserveMw} MW en Reactor
                        Central
                      </span>
                    </>
                  ) : !meetsResources ? (
                    <>
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>Sintetiza Compuestos en Pestaña 1</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping shrink-0" />
                      <ArrowUpRight className="w-4 h-4 shrink-0" />
                      <span>
                        Evolucionar a {CHASSIS_MK_LABELS[item.level + 1]} (+
                        {req.effectiveExtraMw} MW)
                      </span>
                    </>
                  )}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
export const ForjaView = ForgeView;