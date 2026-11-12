// src/components/StorageView.tsx
import React, { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import {
  FACTION_REACTOR_SKINS,
  FACTION_RESOURCE_SPECS,
  GAME_BALANCE,
} from '../data/factionIdentityCatalog';
import { getSiloSlotCount } from '../data/gameData';
import { GLOBAL_UI, getFactionTheme } from '../data/themeConfig';
import {
  CitadelBuilding,
  CitadelStorageItem,
  FactionId,
  ItemQuality,
  ResourceIconKey,
  StorageCategory,
} from '../types/game';
import { FacilityHeader, ForgeCostPill } from './ForgeView';
import { calculateScaledCosts } from './LaboratorioView';
import { TutorialBeacon } from './OnboardingTutorialOverlay';
import { renderSciFiIcon, ThemedIcon } from './ThemedIcon';

export interface StorageViewProps {
  factionId: FactionId;
  siloBuilding: CitadelBuilding;
  reactorLevel?: number;
  ownedFerrita?: number;
  ownedTitanio?: number;
  ownedCredits?: number;
  costReductionPct?: number;
  siloUpgradeTimer?: { endTime: number; durationSec?: number };
  nowTimestamp?: number;
  onUpgradeBuilding?: (buildingId: CitadelBuilding['id']) => void;
  storageCatalog: CitadelStorageItem[];
  inventory: Record<string, number>;
  siloUsed: number;
  siloMaxCapacity: number;
  onScrapItem: (itemId: string, amount: number) => void;
  isTutorialActive?: boolean;
}

const STORAGE_CATEGORIES: StorageCategory[] = [
  'Minerales',
  'Biomasa',
  'Componentes Tácticos',
  'Planos',
];

const QUALITY_BADGE_STYLES: Record<ItemQuality, string> = {
  Común: 'text-slate-300 border-white/10 bg-black/45',
  Refinado: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/35',
  Superior: 'text-sky-300 border-sky-500/30 bg-sky-950/35',
  Reliquia: 'text-amber-300 border-amber-500/30 bg-amber-950/35',
  Cuántico: 'text-purple-300 border-purple-500/30 bg-purple-950/35',
};

const ICON_COLOR_BY_TIER: Record<number, string> = {
  1: 'text-slate-300',
  2: 'text-emerald-400',
  3: 'text-blue-400',
  4: 'text-[#E8A849]',
  5: 'text-purple-400',
};

function renderSlotCenteredIcon(iconKey: ResourceIconKey, tier: number) {
  const colorClass = ICON_COLOR_BY_TIER[tier] || 'text-slate-300';
  const className = `w-3/4 h-3/4 object-contain m-auto absolute inset-0 p-1.5 ${colorClass}`;
  return renderSciFiIcon(iconKey, className);
}

export const StorageView: React.FC<StorageViewProps> = ({
  factionId,
  siloBuilding,
  reactorLevel = 1,
  ownedFerrita = 0,
  ownedTitanio = 0,
  ownedCredits = 0,
  costReductionPct = 0,
  siloUpgradeTimer,
  nowTimestamp = Date.now(),
  onUpgradeBuilding,
  storageCatalog,
  inventory,
  siloUsed,
  siloMaxCapacity,
  onScrapItem,
  isTutorialActive = false,
}) => {
  const [selectedStorageCategory, setSelectedStorageCategory] = useState<
    StorageCategory | 'Todas'
  >('Todas');
  const [selectedSlotItemId, setSelectedSlotItemId] = useState<string | null>(
    null
  );

  const siloLevel = siloBuilding.level;
  const isSiloMax = siloLevel >= siloBuilding.maxLevel;
  const isCappedByReactor =
    siloBuilding.requiresReactorCap && siloLevel >= reactorLevel;
  const theme = getFactionTheme(factionId);
  const skin = FACTION_REACTOR_SKINS[factionId] || FACTION_REACTOR_SKINS.valari;
  const resourceSpec =
    FACTION_RESOURCE_SPECS[factionId] || FACTION_RESOURCE_SPECS.valari;

  const siloDrawMw =
    GAME_BALANCE.reactor.siloBaseMw +
    (siloLevel - 1) * GAME_BALANCE.reactor.siloMwPerLevel;

  const siloScaledCosts = calculateScaledCosts(
    siloBuilding.baseFerritaCost,
    siloBuilding.baseTitanioCost,
    siloBuilding.baseCreditsCost,
    siloLevel,
    costReductionPct
  );

  const canAffordSilo =
    ownedFerrita >= siloScaledCosts.ferritaCost &&
    ownedTitanio >= siloScaledCosts.titanioCost &&
    ownedCredits >= siloScaledCosts.creditsCost;

  const canUpgradeSilo =
    !isSiloMax && !isCappedByReactor && !siloUpgradeTimer && canAffordSilo;

  const siloHeaderUpgradeCosts: ForgeCostPill[] = [
    {
      id: resourceSpec.rawT1.id,
      label: resourceSpec.rawT1.label,
      required: siloScaledCosts.ferritaCost,
      owned: ownedFerrita,
    },
    {
      id: resourceSpec.rawT2.id,
      label: resourceSpec.rawT2.label,
      required: siloScaledCosts.titanioCost,
      owned: ownedTitanio,
    },
    {
      id: 'credits',
      label: 'Créditos',
      required: siloScaledCosts.creditsCost,
      owned: ownedCredits,
    },
  ];

  const occupancyPercent = Math.min(
    100,
    Math.round((siloUsed / Math.max(1, siloMaxCapacity)) * 100)
  );

  const filteredCatalogItems = storageCatalog.filter(
    (item) =>
      selectedStorageCategory === 'Todas' ||
      item.category === selectedStorageCategory
  );
  const filledSlotItems = filteredCatalogItems.filter(
    (item) => Math.floor(inventory[item.id] || 0) > 0
  );
  const totalSlotsCount = getSiloSlotCount(siloLevel);
  const emptySlotsCount = Math.max(8, totalSlotsCount - filledSlotItems.length);

  const activePopupItem = selectedSlotItemId
    ? storageCatalog.find((item) => item.id === selectedSlotItemId) || null
    : null;
  const activePopupQuantity = activePopupItem
    ? Math.floor(inventory[activePopupItem.id] || 0)
    : 0;

  const scrapMultiplier =
    factionId === 'valari'
      ? GAME_BALANCE.citadel.valariScrapBonusMultiplier
      : 1.0;
  const effectiveUnitScrapValue = activePopupItem
    ? Math.round(activePopupItem.scrapCreditsValue * scrapMultiplier)
    : 0;

  return (
    <section className="w-full flex flex-col gap-5 select-none">
      {/* CABECERA UNIFICADA DEL SILO (MISMO PATRÓN QUE FORJA Y LABORATORIO, SIN VENTANA DESPLEGABLE REDUNDANTE) */}
      <FacilityHeader
        factionId={factionId}
        facilityKind="silo"
        title={skin.siloModuleName}
        description="Almacena materiales extraídos, compuestos de la Forja y convierte excedentes en Créditos (₡)."
        level={siloLevel}
        maxLevel={siloBuilding.maxLevel}
        reactorLevel={reactorLevel}
        drawMw={siloDrawMw}
        operationalEffect={`Capacidad ${siloMaxCapacity.toLocaleString('es-ES')} u. · ${totalSlotsCount} Ranuras`}
        upgradeCosts={siloHeaderUpgradeCosts}
        canUpgrade={canUpgradeSilo}
        isCappedByReactor={isCappedByReactor}
        upgradeTimer={siloUpgradeTimer}
        nowTimestamp={nowTimestamp}
        isTutorialActive={isTutorialActive}
        beaconStepNumber={3}
        beaconLabel="Ampliar Silo"
        onUpgrade={() => onUpgradeBuilding?.(siloBuilding.id)}
      />

      {/* PANEL PRINCIPAL DE VOLUMEN, FILTROS Y RANURAS DE INVENTARIO */}
      <div
        className={`relative p-5 flex flex-col gap-5 ${GLOBAL_UI.glass.panel}`}
      >
        {/* BARRA DE OCUPACIÓN Y CAPACIDAD */}
        <div
          className={`p-4 flex flex-col gap-2.5 ${GLOBAL_UI.glass.subcard}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-2.5">
              <span className="text-[13px] font-bold uppercase tracking-wider text-slate-200">
                Volumen Ocupado en Bóveda
              </span>
              <TutorialBeacon
                stepNumber={1}
                label="Volumen y Capacidad"
                isActive={isTutorialActive}
                factionId={factionId}
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-sm sm:text-base font-bold ${theme.accentText} tabular-nums`}
              >
                {siloUsed.toLocaleString('es-ES')} /{' '}
                {siloMaxCapacity.toLocaleString('es-ES')} u.
              </span>
              <span className="text-[13px] text-slate-300 font-semibold tabular-nums">
                ({occupancyPercent}%)
              </span>
            </div>
          </div>

          <div className="w-full h-3 rounded-full bg-black/60 border border-white/10 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                occupancyPercent >= 95
                  ? 'bg-rose-500/80'
                  : occupancyPercent >= 75
                    ? 'bg-amber-500/80'
                    : theme.barFill
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        {/* BARRA DE CATEGORÍAS Y RANURAS OCUPADAS */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(['Todas', ...STORAGE_CATEGORIES] as const).map((category) => {
              const isSelected = selectedStorageCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedStorageCategory(category)}
                  className={`min-h-[40px] px-4 py-2 rounded-xl text-[13px] font-display font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? `${theme.activeTabGlow}`
                      : 'bg-black/45 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all'
                  }`}
                >
                  {category}
                </button>
              );
            })}
            <TutorialBeacon
              stepNumber={2}
              label="Categorías y Desguace (₡)"
              isActive={isTutorialActive}
              factionId={factionId}
            />
          </div>
          <span className="text-[13px] font-mono font-semibold text-slate-300 tabular-nums">
            Ranuras Ocupadas:{' '}
            <strong className="text-white">{filledSlotItems.length}</strong> /{' '}
            {totalSlotsCount}
          </span>
        </div>

        {/* CUADRÍCULA DE RANURAS */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-3">
          {filledSlotItems.map((item) => {
            const quantity = Math.floor(inventory[item.id] || 0);
            const isSelected = selectedSlotItemId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                title={`${item.name} · Tier ${item.tier}`}
                onClick={() =>
                  setSelectedSlotItemId((prev) =>
                    prev === item.id ? null : item.id
                  )
                }
                className={`aspect-square relative bg-black/45 backdrop-blur-md border rounded-xl transition-all group cursor-pointer ${
                  isSelected
                    ? theme.selectedSlot
                    : 'border-white/12 hover:border-white/30'
                }`}
              >
                <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 left-1/2 -translate-x-1/2 z-30 px-2.5 py-1 rounded-md bg-slate-950/95 backdrop-blur-md border border-white/15 text-xs font-mono text-slate-100 whitespace-nowrap shadow-xl">
                  {item.name} · Tier {item.tier}
                </div>
                {renderSlotCenteredIcon(item.iconKey, item.tier)}
                <span className="absolute bottom-1 right-1.5 text-xs font-mono font-bold text-slate-100 drop-shadow-md tabular-nums">
                  {quantity}
                </span>
              </button>
            );
          })}
          {Array.from({ length: emptySlotsCount }).map((_, idx) => (
            <div
              key={`empty-slot-${idx}`}
              className="aspect-square relative bg-black/35 border border-white/5 rounded-xl flex items-center justify-center select-none opacity-65"
            >
              <span className="text-xs font-mono text-slate-500">Vacío</span>
            </div>
          ))}
        </div>

        {activePopupItem && activePopupQuantity > 0 && (
          <div
            role="dialog"
            className="fixed bottom-8 left-1/2 -translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-50 w-[92vw] max-w-md rounded-2xl bg-slate-950/92 backdrop-blur-xl border border-white/15 p-6 shadow-2xl flex flex-col gap-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <ThemedIcon
                  iconKey={activePopupItem.iconKey}
                  faction={factionId}
                  className="w-16 h-16 shrink-0"
                />
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-xl font-display font-bold text-slate-100">
                    {activePopupItem.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                    <span
                      className={`px-2.5 py-0.5 rounded border font-semibold ${
                        QUALITY_BADGE_STYLES[activePopupItem.quality]
                      }`}
                    >
                      {activePopupItem.quality}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded bg-black/45 border border-white/10 ${theme.accentText}`}
                    >
                      Tier {activePopupItem.tier}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-black/45 border border-white/10 text-slate-300">
                      {activePopupItem.category}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlotItemId(null)}
                className="p-1.5 rounded-lg bg-black/45 hover:bg-white/10 text-slate-400 hover:text-slate-100 border border-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[13px] sm:text-sm text-slate-300 leading-relaxed">
              {activePopupItem.description}
            </p>
            <div
              className={`grid grid-cols-2 gap-3 p-3.5 font-mono text-[13px] ${GLOBAL_UI.glass.subcard}`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-slate-400">
                  Cantidad en Ranura
                </span>
                <span className="text-base font-bold text-slate-100 tabular-nums">
                  {activePopupQuantity.toLocaleString('es-ES')} unidades
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-slate-400">
                  Valor de Desguace{' '}
                  {factionId === 'valari' ? '(+25% Valari)' : ''}
                </span>
                <span
                  className={`text-base font-bold ${theme.accentText} tabular-nums`}
                >
                  +{effectiveUnitScrapValue} ₡ / u.
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onScrapItem(activePopupItem.id, 1)}
                className="min-h-[46px] px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-200 border border-rose-500/35 text-[13px] font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Desguazar x1 (+{effectiveUnitScrapValue} ₡)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onScrapItem(activePopupItem.id, activePopupQuantity);
                  setSelectedSlotItemId(null);
                }}
                className={`min-h-[46px] px-4 py-2.5 rounded-xl ${theme.primaryButton} text-[13px] font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer`}
              >
                <Trash2
                  className={`w-4 h-4 shrink-0 ${theme.accentTextLight}`}
                />
                <span>
                  Desguazar Todo (+
                  {(
                    effectiveUnitScrapValue * activePopupQuantity
                  ).toLocaleString('es-ES')}{' '}
                  ₡)
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};