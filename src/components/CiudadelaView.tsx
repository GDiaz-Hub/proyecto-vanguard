// src/components/CiudadelaView.tsx
import React from 'react';
import {
  FACTION_RESOURCE_SPECS,
  GAME_BALANCE,
} from '../data/factionIdentityCatalog';
import {
  CitadelBuilding,
  CitadelSection,
  CitadelStorageItem,
  FactionId,
  HeroChassisSlot,
  HeroLoadout,
  ReactorRoutingMode,
  Technology,
} from '../types/game';
import { ActiveUpgradeTimer } from '../context/GameContext';
import { ForgeCostPill, ForgeRecipeItem, ForgeView } from './ForgeView';
import { LaboratorioView, calculateScaledCosts } from './LaboratorioView';
import { ReactorCentral } from './ReactorCentral';
import { StorageView } from './StorageView';

export { calculateScaledCosts };

export interface CiudadelaViewProps {
  activeSection: CitadelSection;
  factionId: FactionId;
  buildings: CitadelBuilding[];
  technologies: Technology[];
  storageCatalog: CitadelStorageItem[];
  inventory: Record<string, number>;
  credits: number;
  costReductionPct: number;
  siloUsed: number;
  siloMaxCapacity: number;
  heroLoadout?: HeroLoadout;
  routingMode?: ReactorRoutingMode;
  activeBuildingUpgrades?: Record<string, ActiveUpgradeTimer>;
  activeTechResearches?: Record<string, ActiveUpgradeTimer>;
  nowTimestamp?: number;
  onChangeRoutingMode?: (mode: ReactorRoutingMode) => void;
  onToggleChassisLowPower?: (slot: HeroChassisSlot) => void;
  onUpgradeBuilding: (buildingId: CitadelBuilding['id']) => void;
  onResearchTechnology: (techId: string) => void;
  onScrapItem: (itemId: string, amount: number) => void;
  onCraftForgeItem?: (item: ForgeRecipeItem) => void;
  onUpgradeChassisSlot?: (
    slot: HeroChassisSlot,
    costs: ForgeCostPill[],
    extraMw: number
  ) => void;
  forgeInitialTab?: 'compuestos' | 'chasis';
  isTutorialActive?: boolean;
}

export const CiudadelaView: React.FC<CiudadelaViewProps> = ({
  activeSection,
  factionId,
  buildings,
  technologies,
  storageCatalog,
  inventory,
  credits,
  costReductionPct,
  siloUsed,
  siloMaxCapacity,
  heroLoadout,
  routingMode = 'none',
  activeBuildingUpgrades = {},
  activeTechResearches = {},
  nowTimestamp = Date.now(),
  onChangeRoutingMode,
  onToggleChassisLowPower,
  onUpgradeBuilding,
  onResearchTechnology,
  onScrapItem,
  onCraftForgeItem,
  onUpgradeChassisSlot,
  forgeInitialTab = 'compuestos',
  isTutorialActive = false,
}) => {
  const reactorBuilding =
    buildings.find((b) => b.id === 'reactor_central') || buildings[0];
  const forgeBuilding =
    buildings.find((b) => b.id === 'matriz_ensamblaje') || buildings[1];
  const labBuilding =
    buildings.find((b) => b.id === 'laboratorio_tecnologico') || buildings[2];
  const siloBuilding =
    buildings.find((b) => b.id === 'silo_logistico') || buildings[3];

  const reactorLevel = reactorBuilding.level;

  // Tecnología #3: Conductores Cuánticos / Sinápticos (+18 MW por nivel a partir de nivel 2)
  const gridTech = technologies.find((t) => t.id === 'tech_red_energetica');
  const conductorTechBonusMw = gridTech
    ? (gridTech.level - 1) * GAME_BALANCE.reactor.conductorTechMwPerLevel
    : 0;

  // Cálculo de MW reales para el presupuesto de Chasis
  const cygnusMultiplier =
    factionId === 'cygnus'
      ? GAME_BALANCE.reactor.cygnusCapacityMultiplier
      : 1.0;
  const maxReactorMw = Math.round(
    (GAME_BALANCE.reactor.baseMw +
      (reactorLevel - 1) * GAME_BALANCE.reactor.mwPerLevel +
      conductorTechBonusMw) *
      cygnusMultiplier
  );

  const commanderBaseMw = heroLoadout ? heroLoadout.totalPowerDrawMw : 80;
  const commanderEffectiveMw =
    factionId === 'skithid'
      ? Math.round(
          commanderBaseMw * GAME_BALANCE.reactor.skithidChassisMwMultiplier
        )
      : commanderBaseMw;

  const forgeMw =
    GAME_BALANCE.reactor.forgeBaseMw +
    (forgeBuilding.level - 1) * GAME_BALANCE.reactor.forgeMwPerLevel;
  const labMw =
    GAME_BALANCE.reactor.labBaseMw +
    (labBuilding.level - 1) * GAME_BALANCE.reactor.labMwPerLevel;
  const siloMw =
    GAME_BALANCE.reactor.siloBaseMw +
    (siloBuilding.level - 1) * GAME_BALANCE.reactor.siloMwPerLevel;
  const usedReactorMw = commanderEffectiveMw + forgeMw + labMw + siloMw;

  const resourceSpec =
    FACTION_RESOURCE_SPECS[factionId] || FACTION_RESOURCE_SPECS.valari;

  const ownedFerrita = Math.floor(inventory[resourceSpec.rawT1.id] || 0);
  const ownedTitanio = Math.floor(inventory[resourceSpec.rawT2.id] || 0);
  const ownedCredits = Math.floor(credits);

  return (
    <section className="w-full flex flex-col gap-6">
      {activeSection === 'reactor' &&
        (() => {
          const reactorScaled = calculateScaledCosts(
            reactorBuilding.baseFerritaCost,
            reactorBuilding.baseTitanioCost,
            reactorBuilding.baseCreditsCost,
            reactorBuilding.level,
            costReductionPct
          );
          const canUpgradeReactor =
            reactorBuilding.level < reactorBuilding.maxLevel &&
            !activeBuildingUpgrades['reactor_central'] &&
            ownedFerrita >= reactorScaled.ferritaCost &&
            ownedTitanio >= reactorScaled.titanioCost &&
            ownedCredits >= reactorScaled.creditsCost;

          return (
            <ReactorCentral
              factionId={factionId}
              reactorLevel={reactorBuilding.level}
              maxReactorLevel={reactorBuilding.maxLevel}
              forgeLevel={forgeBuilding.level}
              labLevel={labBuilding.level}
              siloLevel={siloBuilding.level}
              commanderBaseMw={commanderBaseMw}
              conductorTechBonusMw={conductorTechBonusMw}
              heroLoadout={heroLoadout}
              onToggleChassisLowPower={onToggleChassisLowPower}
              routingMode={routingMode}
              onChangeRoutingMode={onChangeRoutingMode}
              upgradeCosts={[
                {
                  id: resourceSpec.rawT1.id,
                  label: resourceSpec.rawT1.label,
                  required: reactorScaled.ferritaCost,
                  owned: ownedFerrita,
                },
                {
                  id: resourceSpec.rawT2.id,
                  label: resourceSpec.rawT2.label,
                  required: reactorScaled.titanioCost,
                  owned: ownedTitanio,
                },
                {
                  id: 'credits',
                  label: 'Créditos',
                  required: reactorScaled.creditsCost,
                  owned: ownedCredits,
                },
              ]}
              canUpgrade={canUpgradeReactor}
              upgradeTimer={activeBuildingUpgrades['reactor_central']}
              nowTimestamp={nowTimestamp}
              onUpgrade={() => onUpgradeBuilding('reactor_central')}
              isTutorialActive={isTutorialActive}
            />
          );
        })()}

      {activeSection === 'forja_instalacion' &&
        (() => {
          const forgeScaled = calculateScaledCosts(
            forgeBuilding.baseFerritaCost,
            forgeBuilding.baseTitanioCost,
            forgeBuilding.baseCreditsCost,
            forgeBuilding.level,
            costReductionPct
          );
          const isCappedByReactor =
            forgeBuilding.requiresReactorCap &&
            forgeBuilding.level >= reactorLevel;
          const canUpgradeForge =
            forgeBuilding.level < forgeBuilding.maxLevel &&
            !isCappedByReactor &&
            !activeBuildingUpgrades['matriz_ensamblaje'] &&
            ownedFerrita >= forgeScaled.ferritaCost &&
            ownedTitanio >= forgeScaled.titanioCost &&
            ownedCredits >= forgeScaled.creditsCost;

          const forgeSpeedTech = technologies.find(
            (t) => t.id === 'tech_procesamiento_datos'
          );
          const forgeSpeedBonusPct = forgeSpeedTech
            ? forgeSpeedTech.level * 6
            : 0;

          return (
            <ForgeView
              factionId={factionId}
              forgeLevel={forgeBuilding.level}
              maxForgeLevel={forgeBuilding.maxLevel}
              reactorLevel={reactorLevel}
              credits={ownedCredits}
              inventory={inventory}
              heroLoadout={heroLoadout}
              usedReactorMw={usedReactorMw}
              maxReactorMw={maxReactorMw}
              routingMode={routingMode}
              forgeSpeedBonusPct={forgeSpeedBonusPct}
              upgradeCosts={[
                {
                  id: resourceSpec.rawT1.id,
                  label: resourceSpec.rawT1.label,
                  required: forgeScaled.ferritaCost,
                  owned: ownedFerrita,
                },
                {
                  id: resourceSpec.rawT2.id,
                  label: resourceSpec.rawT2.label,
                  required: forgeScaled.titanioCost,
                  owned: ownedTitanio,
                },
                {
                  id: 'credits',
                  label: 'Créditos',
                  required: forgeScaled.creditsCost,
                  owned: ownedCredits,
                },
              ]}
              canUpgradeForge={canUpgradeForge}
              isCappedByReactor={isCappedByReactor}
              upgradeTimer={activeBuildingUpgrades['matriz_ensamblaje']}
              nowTimestamp={nowTimestamp}
              onUpgradeForge={() => onUpgradeBuilding('matriz_ensamblaje')}
              onCraftComplete={onCraftForgeItem}
              onUpgradeChassisSlot={onUpgradeChassisSlot}
              initialTab={forgeInitialTab}
              isTutorialActive={isTutorialActive}
            />
          );
        })()}

      {activeSection === 'laboratorio' && (
        <LaboratorioView
          factionId={factionId}
          labBuilding={labBuilding}
          reactorLevel={reactorLevel}
          technologies={technologies}
          ownedFerrita={ownedFerrita}
          ownedTitanio={ownedTitanio}
          ownedCredits={ownedCredits}
          costReductionPct={costReductionPct}
          siloUsed={siloUsed}
          siloMaxCapacity={siloMaxCapacity}
          labUpgradeTimer={activeBuildingUpgrades['laboratorio_tecnologico']}
          activeTechResearches={activeTechResearches}
          nowTimestamp={nowTimestamp}
          onUpgradeBuilding={onUpgradeBuilding}
          onResearchTechnology={onResearchTechnology}
          isTutorialActive={isTutorialActive}
        />
      )}

      {activeSection === 'almacen' && (
        <StorageView
          factionId={factionId}
          siloBuilding={siloBuilding}
          reactorLevel={reactorLevel}
          ownedFerrita={ownedFerrita}
          ownedTitanio={ownedTitanio}
          ownedCredits={ownedCredits}
          costReductionPct={costReductionPct}
          siloUpgradeTimer={activeBuildingUpgrades['silo_logistico']}
          nowTimestamp={nowTimestamp}
          onUpgradeBuilding={onUpgradeBuilding}
          storageCatalog={storageCatalog}
          inventory={inventory}
          siloUsed={siloUsed}
          siloMaxCapacity={siloMaxCapacity}
          onScrapItem={onScrapItem}
          isTutorialActive={isTutorialActive}
        />
      )}
    </section>
  );
};