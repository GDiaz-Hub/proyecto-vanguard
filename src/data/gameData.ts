// src/data/gameData.ts
import {
  CitadelBuilding,
  CitadelStorageItem,
  CombatEnemy,
  CombatResistances,
  DamageType,
  DefenseType,
  FactionId,
  FactionInfo,
  HeroLoadout,
  ResourceItem,
  StarSector,
  Technology,
} from '../types/game';

export const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
  Kinetic: 'Cinético',
  Energy: 'Energía',
  Corrosive: 'Corrosivo',
};

export const DEFENSE_TYPE_LABELS: Record<DefenseType, string> = {
  Armor: 'Blindaje',
  Evasion: 'Evasión',
  Shields: 'Escudos',
};

export const DAMAGE_MECHANIC_DESCRIPTIONS: Record<DamageType, string> = {
  Kinetic: 'Impacto balístico concentrado de alta masa y penetración estructural.',
  Energy: 'Descargas fotónicas de alta cadencia y dispersión cuántica.',
  Corrosive: 'Compuestos químicos reactivos de degradación sostenida.',
};

export function getCombatAffinityMultiplier(
  damageType: DamageType,
  targetDefense: DefenseType
): number {
  if (damageType === 'Kinetic' && targetDefense === 'Shields') return 1.1;
  if (damageType === 'Corrosive' && targetDefense === 'Armor') return 1.1;
  if (damageType === 'Energy' && targetDefense === 'Evasion') return 1.1;
  return 1.0;
}

export function getSpecificResistancePercent(
  resistances: CombatResistances,
  incomingDamageType: DamageType
): number {
  if (incomingDamageType === 'Kinetic') return resistances.kinetic;
  if (incomingDamageType === 'Energy') return resistances.energy;
  return resistances.corrosive;
}

export function resolveCombatStrike({
  baseDamage,
  attackerDamageType,
  targetDefenseType,
  targetFlatArmor,
  targetArmorPercent,
  targetEvasionPercent,
  targetResistances,
  critChancePercent,
}: {
  baseDamage: number;
  attackerDamageType: DamageType;
  targetDefenseType: DefenseType;
  targetFlatArmor?: number;
  targetArmorPercent?: number;
  targetEvasionPercent: number;
  targetResistances: CombatResistances;
  critChancePercent: number;
}): {
  finalDamage: number;
  affinityMultiplier: number;
  isCrit: boolean;
  isEvaded: boolean;
  meltsArmor: boolean;
  destroysShields: boolean;
} {
  const affinityMultiplier = getCombatAffinityMultiplier(
    attackerDamageType,
    targetDefenseType
  );
  const roll = Math.random() * 100;
  // Los haces de Energía de Cygnus no pueden ser esquivados por Evasión
  const isEvaded =
    targetDefenseType === 'Evasion' &&
    attackerDamageType !== 'Energy' &&
    roll < targetEvasionPercent;

  if (isEvaded) {
    return {
      finalDamage: 0,
      affinityMultiplier,
      isCrit: false,
      isEvaded: true,
      meltsArmor: false,
      destroysShields: false,
    };
  }

  const isCrit = Math.random() * 100 < critChancePercent;
  const effectiveFlatArmor = targetFlatArmor ?? targetArmorPercent ?? 0;
  const mitigatedDamage =
    targetDefenseType === 'Armor'
      ? Math.max(0, baseDamage * affinityMultiplier - effectiveFlatArmor)
      : baseDamage * affinityMultiplier;

  const specificResistPct = getSpecificResistancePercent(
    targetResistances,
    attackerDamageType
  );

  const finalCalc = mitigatedDamage * (1 - specificResistPct / 100);
  const finalDamage = Math.max(
    Math.round(baseDamage * 0.25),
    Math.round(finalCalc * (isCrit ? 1.5 : 1.0))
  );

  return {
    finalDamage,
    affinityMultiplier,
    isCrit,
    isEvaded: false,
    meltsArmor: attackerDamageType === 'Corrosive' && targetDefenseType === 'Armor',
    destroysShields: attackerDamageType === 'Kinetic' && targetDefenseType === 'Shields',
  };
}

export const FACTIONS: Record<FactionId, FactionInfo> = {
  valari: {
    id: 'valari',
    name: 'La Legión Valari',
    shortName: 'Legión Valari',
    lore: 'Dinastía militarizada en exotrajes pesados. Especialistas en balística cinética, contragolpe de espinas y blindaje de asedio.',
    portraitPath: '/assets/valari.webp',
    portraitAlt: 'Valari Hero',
    colorHex: '#E8A849',
    accentTextClass: 'text-[#E8A849]',
    accentBorderClass: 'border-[#E8A849]',
    accentBgClass: 'bg-[#E8A849]',
    panelBgClass: 'bg-slate-900 border-slate-800',
    baseDamageType: 'Kinetic',
    baseDefenseType: 'Armor',
    strongAgainst: 'cygnus',
    weakAgainst: 'skithid',
    vulnerableToDamage: 'Corrosive',
    passives: [
      'Contragolpe Balístico: Devuelve 25% del daño bloqueado por Blindaje',
      'Munición Rompe-Fase: +25% Daño contra Escudos (Fuerte vs Cygnus)',
      'Ingeniería de Bastión: -15% Costes en Ciudadela y +25% Desguace',
    ],
    baseResistances: {
      kinetic: 20,
      energy: 15,
      corrosive: 15,
    },
    bonuses: {
      miningSpeed: 0,
      harvestSpeed: 0,
      compilationYield: 0,
      physicalAttack: 6,
      armor: 8,
      lifesteal: 0,
      evasion: 0,
      bioShield: 0,
      attackSpeed: 0,
      critChance: 5,
      citadelCostReduction: 15,
      citadelCycleSpeed: 0,
    },
  },
  skithid: {
    id: 'skithid',
    name: 'El Enjambre Skithid',
    shortName: 'Enjambre Skithid',
    lore: 'Organismo biológico con reflejos sinápticos ultrarrápidos. Derrite blindajes pesados con bio-ácido, esquiva golpes y drena vida.',
    portraitPath: '/assets/skithid.webp',
    portraitAlt: 'Skithid Hero',
    colorHex: '#2ECC71',
    accentTextClass: 'text-[#2ECC71]',
    accentBorderClass: 'border-[#2ECC71]',
    accentBgClass: 'bg-[#2ECC71]',
    panelBgClass: 'bg-slate-900 border-slate-800',
    baseDamageType: 'Corrosive',
    baseDefenseType: 'Evasion',
    strongAgainst: 'valari',
    weakAgainst: 'cygnus',
    vulnerableToDamage: 'Energy',
    passives: [
      'Bio-Corrosión y Drenaje: Filtra 12% daño directo a HP y roba 18% vida en Ruptura',
      'Secreción Perforante: +25% Daño contra Blindaje (Fuerte vs Valari)',
      'Simbiosis Metabólica: -12% MW en Chasis y +25% Velocidad en Forja',
    ],
    baseResistances: {
      kinetic: 15,
      energy: 15,
      corrosive: 20,
    },
    bonuses: {
      miningSpeed: 0,
      harvestSpeed: 0,
      compilationYield: 0,
      physicalAttack: 4,
      armor: 0,
      lifesteal: 18,
      evasion: 20,
      bioShield: 0,
      attackSpeed: 12,
      critChance: 6,
      citadelCostReduction: 0,
      citadelCycleSpeed: 25,
    },
  },
  cygnus: {
    id: 'cygnus',
    name: 'El Nexo Cygnus',
    shortName: 'Nexo Cygnus',
    lore: 'Conciencia sintética con matrices cuánticas. Regenera escudos cada turno, potencia su daño con escudos altos y anula la evasión.',
    portraitPath: '/assets/cygnus.webp',
    portraitAlt: 'Cygnus Hero',
    colorHex: '#3B82F6',
    accentTextClass: 'text-blue-400',
    accentBorderClass: 'border-blue-500/40',
    accentBgClass: 'bg-blue-600/20',
    panelBgClass: 'bg-slate-900 border-slate-800',
    baseDamageType: 'Energy',
    baseDefenseType: 'Shields',
    strongAgainst: 'skithid',
    weakAgainst: 'valari',
    vulnerableToDamage: 'Kinetic',
    passives: [
      'Resonancia de Fase: Regenera +10% Escudo/turno y +20% ATQ con Escudo >50%',
      'Colimación Infalible: Ignora Evasión e inflige +25% Daño vs Skithid',
      'Singularidad Cuántica: +20% MW en Reactor y 25% Compilación Gratis en Forja',
    ],
    baseResistances: {
      kinetic: 15,
      energy: 20,
      corrosive: 15,
    },
    bonuses: {
      miningSpeed: 0,
      harvestSpeed: 0,
      compilationYield: 25,
      physicalAttack: 0,
      armor: 0,
      lifesteal: 0,
      evasion: 0,
      bioShield: 30,
      attackSpeed: 6,
      critChance: 4,
      citadelCostReduction: 0,
      citadelCycleSpeed: 10,
    },
  },
};

export const RESOURCES: Record<string, ResourceItem> = {
  valari_raw_t1_ferrita: {
    id: 'valari_raw_t1_ferrita',
    name: 'Ferrita',
    factionAffinity: 'valari',
    origin: 'raw',
    storageCategory: 'Minerales',
    category: 'Materia Prima Valari',
    tier: 1,
    valueCredits: 8,
    description: 'Mineral ferromagnético base recuperado de restos bélicos.',
    iconKey: 'cuboid',
  },
  valari_raw_t2_titanio: {
    id: 'valari_raw_t2_titanio',
    name: 'Titanio',
    factionAffinity: 'valari',
    origin: 'raw',
    storageCategory: 'Minerales',
    category: 'Materia Prima Valari',
    tier: 2,
    valueCredits: 22,
    description: 'Vetas metálicas de alta resistencia térmica.',
    iconKey: 'box',
  },
  valari_raw_t3_iridio: {
    id: 'valari_raw_t3_iridio',
    name: 'Iridio',
    factionAffinity: 'valari',
    origin: 'raw',
    storageCategory: 'Minerales',
    category: 'Materia Prima Valari',
    tier: 3,
    valueCredits: 65,
    description: 'Nódulos cristalinos densos para hornos orbitales.',
    iconKey: 'diamond',
  },
  valari_raw_t4_neutronio: {
    id: 'valari_raw_t4_neutronio',
    name: 'Neutronio',
    factionAffinity: 'valari',
    origin: 'raw',
    storageCategory: 'Minerales',
    category: 'Materia Prima Valari',
    tier: 4,
    valueCredits: 160,
    description: 'Esquirlas hiperdensas para blindajes de grado 4.',
    iconKey: 'atom',
  },
  valari_craft_t2_titanio: {
    id: 'valari_craft_t2_titanio',
    name: 'Aleación Balística',
    factionAffinity: 'valari',
    origin: 'crafted',
    storageCategory: 'Componentes Tácticos',
    category: 'Metalurgia Valari',
    tier: 2,
    valueCredits: 55,
    description: 'Aleación militar forjada a partir de Ferrita y Titanio.',
    iconKey: 'shield',
  },
  valari_craft_t3_iridio: {
    id: 'valari_craft_t3_iridio',
    name: 'Lingote de Iridio',
    factionAffinity: 'valari',
    origin: 'crafted',
    storageCategory: 'Componentes Tácticos',
    category: 'Metalurgia Valari',
    tier: 3,
    valueCredits: 145,
    description: 'Lingote refinado en hornos orbitales.',
    iconKey: 'cylinder',
  },
  valari_craft_t4_neutronio: {
    id: 'valari_craft_t4_neutronio',
    name: 'Placa Neutrónica',
    factionAffinity: 'valari',
    origin: 'crafted',
    storageCategory: 'Componentes Tácticos',
    category: 'Metalurgia Valari',
    tier: 4,
    valueCredits: 380,
    description: 'Blindaje estructural laminado pesado.',
    iconKey: 'layers',
  },
  valari_t5_materia_oscura: {
    id: 'valari_t5_materia_oscura',
    name: 'Materia Oscura',
    factionAffinity: 'valari',
    origin: 'endgame',
    storageCategory: 'Planos',
    category: 'Metalurgia Valari',
    tier: 5,
    valueCredits: 900,
    description: 'Reliquia Endgame obtenible en sectores hostiles.',
    iconKey: 'eclipse',
  },
  skithid_raw_t1_quitina: {
    id: 'skithid_raw_t1_quitina',
    name: 'Quitina',
    factionAffinity: 'skithid',
    origin: 'raw',
    storageCategory: 'Biomasa',
    category: 'Biomasa Bruta Skithid',
    tier: 1,
    valueCredits: 8,
    description: 'Tejido exoesquelético endurecido.',
    iconKey: 'hexagon',
  },
  skithid_raw_t2_espora: {
    id: 'skithid_raw_t2_espora',
    name: 'Espora Ácida',
    factionAffinity: 'skithid',
    origin: 'raw',
    storageCategory: 'Biomasa',
    category: 'Biomasa Bruta Skithid',
    tier: 2,
    valueCredits: 22,
    description: 'Vesícula orgánica corrosiva.',
    iconKey: 'biohazard',
  },
  skithid_raw_t3_tejido: {
    id: 'skithid_raw_t3_tejido',
    name: 'Tejido Vivo',
    factionAffinity: 'skithid',
    origin: 'raw',
    storageCategory: 'Biomasa',
    category: 'Biomasa Bruta Skithid',
    tier: 3,
    valueCredits: 65,
    description: 'Biomasa neuronal auto-adaptativa.',
    iconKey: 'dna',
  },
  skithid_raw_t4_glandula: {
    id: 'skithid_raw_t4_glandula',
    name: 'Órgano Abisal',
    factionAffinity: 'skithid',
    origin: 'raw',
    storageCategory: 'Biomasa',
    category: 'Biomasa Bruta Skithid',
    tier: 4,
    valueCredits: 160,
    description: 'Glándula de alta reactividad bioquímica.',
    iconKey: 'heart-pulse',
  },
  skithid_craft_t2_enzima: {
    id: 'skithid_craft_t2_enzima',
    name: 'Enzima Corrosiva',
    factionAffinity: 'skithid',
    origin: 'crafted',
    storageCategory: 'Componentes Tácticos',
    category: 'Bio-Mutación Skithid',
    tier: 2,
    valueCredits: 55,
    description: 'Catalizador bio-ácido sintetizado.',
    iconKey: 'activity',
  },
  skithid_craft_t3_caparazon: {
    id: 'skithid_craft_t3_caparazon',
    name: 'Caparazón Mutado',
    factionAffinity: 'skithid',
    origin: 'crafted',
    storageCategory: 'Componentes Tácticos',
    category: 'Bio-Mutación Skithid',
    tier: 3,
    valueCredits: 145,
    description: 'Placa quitinosa de alta flexibilidad evasiva.',
    iconKey: 'octagon',
  },
  skithid_craft_t4_glandula: {
    id: 'skithid_craft_t4_glandula',
    name: 'Glándula Mutada',
    factionAffinity: 'skithid',
    origin: 'crafted',
    storageCategory: 'Componentes Tácticos',
    category: 'Bio-Mutación Skithid',
    tier: 4,
    valueCredits: 380,
    description: 'Núcleo orgánico bioeléctrico de grado 4.',
    iconKey: 'brain-circuit',
  },
  skithid_t5_plasma_corrosivo: {
    id: 'skithid_t5_plasma_corrosivo',
    name: 'Plasma Corrosivo',
    factionAffinity: 'skithid',
    origin: 'endgame',
    storageCategory: 'Planos',
    category: 'Bio-Mutación Skithid',
    tier: 5,
    valueCredits: 900,
    description: 'Sustancia reactiva de grado 5.',
    iconKey: 'radiation',
  },
  cygnus_raw_t1_silicio: {
    id: 'cygnus_raw_t1_silicio',
    name: 'Silicio',
    factionAffinity: 'cygnus',
    origin: 'raw',
    storageCategory: 'Minerales',
    category: 'Datos Crudos Cygnus',
    tier: 1,
    valueCredits: 8,
    description: 'Substrato puro para matrices lógicas.',
    iconKey: 'microchip',
  },
  cygnus_raw_t2_cromo: {
    id: 'cygnus_raw_t2_cromo',
    name: 'Cromo',
    factionAffinity: 'cygnus',
    origin: 'raw',
    storageCategory: 'Minerales',
    category: 'Datos Crudos Cygnus',
    tier: 2,
    valueCredits: 22,
    description: 'Conductor cuántico de fotones.',
    iconKey: 'circuit-board',
  },
  cygnus_raw_t3_foton: {
    id: 'cygnus_raw_t3_foton',
    name: 'Fotones',
    factionAffinity: 'cygnus',
    origin: 'raw',
    storageCategory: 'Minerales',
    category: 'Datos Crudos Cygnus',
    tier: 3,
    valueCredits: 65,
    description: 'Condensado lumínico para cañones de energía.',
    iconKey: 'sparkles',
  },
  cygnus_raw_t4_taquion: {
    id: 'cygnus_raw_t4_taquion',
    name: 'Taquiones',
    factionAffinity: 'cygnus',
    origin: 'raw',
    storageCategory: 'Minerales',
    category: 'Datos Crudos Cygnus',
    tier: 4,
    valueCredits: 160,
    description: 'Partículas superlumínicas.',
    iconKey: 'waves',
  },
  cygnus_craft_t2_cromo: {
    id: 'cygnus_craft_t2_cromo',
    name: 'Cristal de Cromo',
    factionAffinity: 'cygnus',
    origin: 'crafted',
    storageCategory: 'Componentes Tácticos',
    category: 'Compilación Cygnus',
    tier: 2,
    valueCredits: 55,
    description: 'Red geodésica sintetizada en la Forja.',
    iconKey: 'gem',
  },
  cygnus_craft_t3_fotones: {
    id: 'cygnus_craft_t3_fotones',
    name: 'Vector Fotónico',
    factionAffinity: 'cygnus',
    origin: 'crafted',
    storageCategory: 'Componentes Tácticos',
    category: 'Compilación Cygnus',
    tier: 3,
    valueCredits: 145,
    description: 'Módulo de emisión de alta frecuencia.',
    iconKey: 'zap',
  },
  cygnus_craft_t4_taquion: {
    id: 'cygnus_craft_t4_taquion',
    name: 'Matriz Taquiónica',
    factionAffinity: 'cygnus',
    origin: 'crafted',
    storageCategory: 'Componentes Tácticos',
    category: 'Compilación Cygnus',
    tier: 4,
    valueCredits: 380,
    description: 'Red cuántica estabilizada en fase.',
    iconKey: 'network',
  },
  cygnus_t5_nucleo_cuantico: {
    id: 'cygnus_t5_nucleo_cuantico',
    name: 'Núcleo Cuántico',
    factionAffinity: 'cygnus',
    origin: 'endgame',
    storageCategory: 'Planos',
    category: 'Compilación Cygnus',
    tier: 5,
    valueCredits: 900,
    description: 'Esfera lógica cuántica de grado 5.',
    iconKey: 'orbit',
  },
};

export const INITIAL_CITADEL_BUILDINGS: CitadelBuilding[] = [
  {
    id: 'reactor_central',
    title: 'Reactor Central',
    codeName: 'Núcleo Energético',
    description:
      'Generador termonuclear principal. Suministra megavatios (MW) y establece el nivel máximo para las demás instalaciones.',
    level: 1,
    maxLevel: 20,
    summaryEffect: 'Límite de energía: 150 MW · Techo operativo de la base',
    requiresReactorCap: false,
    baseFerritaCost: 14,
    baseTitanioCost: 6,
    baseCreditsCost: 320,
    iconKey: 'power',
  },
  {
    id: 'matriz_ensamblaje',
    title: 'Matriz de Forja',
    codeName: 'Ensamblaje Industrial',
    description:
      'Complejo automatizado de fundición y síntesis. Desbloquea la manufactura de tiers superiores.',
    level: 1,
    maxLevel: 20,
    summaryEffect: 'Habilita manufactura de Tiers superiores',
    requiresReactorCap: true,
    baseFerritaCost: 12,
    baseTitanioCost: 5,
    baseCreditsCost: 240,
    iconKey: 'cog',
  },
  {
    id: 'laboratorio_tecnologico',
    title: 'Laboratorio',
    codeName: 'División I+D',
    description:
      'Centro de desarrollo tecnológico. Optimiza costes y eficiencia operativa.',
    level: 1,
    maxLevel: 20,
    summaryEffect: 'Permite descifrar planos e investigar mejoras',
    requiresReactorCap: true,
    baseFerritaCost: 14,
    baseTitanioCost: 6,
    baseCreditsCost: 260,
    iconKey: 'cpu',
  },
  {
    id: 'silo_logistico',
    title: 'Silo Logístico',
    codeName: 'Bóveda Central',
    description:
      'Bóveda orbital de almacenamiento. Define la capacidad volumétrica y ranuras activas.',
    level: 1,
    maxLevel: 20,
    summaryEffect: 'Define capacidad máxima de materiales de la base',
    requiresReactorCap: true,
    baseFerritaCost: 10,
    baseTitanioCost: 4,
    baseCreditsCost: 190,
    iconKey: 'database',
  },
];

export const INITIAL_CITADEL_TECHNOLOGIES: Technology[] = [
  {
    id: 'tech_eficiencia_logistica',
    title: 'Eficiencia Logística',
    domain: 'Compresión de Carga',
    level: 1,
    maxLevel: 15,
    requiredLabLevel: 1,
    summaryEffect: '+15% capacidad del Silo por nivel',
    baseFerritaCost: 10,
    baseTitanioCost: 4,
    baseCreditsCost: 160,
    iconKey: 'hard-drive',
  },
  {
    id: 'tech_procesamiento_datos',
    title: 'Procesamiento Datos',
    domain: 'Algoritmos de Síntesis',
    level: 1,
    maxLevel: 15,
    requiredLabLevel: 1,
    summaryEffect: '+6% velocidad en Forja por nivel',
    baseFerritaCost: 14,
    baseTitanioCost: 6,
    baseCreditsCost: 210,
    iconKey: 'binary',
  },
  {
    id: 'tech_calibracion_forja',
    title: 'Calibración Industrial',
    domain: 'Metalurgia de Precisión',
    level: 1,
    maxLevel: 15,
    requiredLabLevel: 2,
    summaryEffect: '-4% coste de materiales en Forja por nivel',
    baseFerritaCost: 22,
    baseTitanioCost: 9,
    baseCreditsCost: 280,
    iconKey: 'gauge',
  },
  {
    id: 'tech_red_energetica',
    title: 'Conductores Cuánticos',
    domain: 'Distribución Eléctrica',
    level: 1,
    maxLevel: 15,
    requiredLabLevel: 3,
    summaryEffect: '-5% coste de ampliación en la base',
    baseFerritaCost: 30,
    baseTitanioCost: 12,
    baseCreditsCost: 360,
    iconKey: 'cable',
  },
];

export const CITADEL_STORAGE_CATALOG: CitadelStorageItem[] = [
  {
    id: 'valari_raw_t1_ferrita',
    name: 'Ferrita',
    category: 'Minerales',
    quality: 'Común',
    tier: 1,
    unitVolume: 1,
    scrapCreditsValue: 8,
    description: 'Mineral ferromagnético base.',
    iconKey: 'cuboid',
  },
  {
    id: 'valari_raw_t2_titanio',
    name: 'Titanio',
    category: 'Minerales',
    quality: 'Refinado',
    tier: 2,
    unitVolume: 1,
    scrapCreditsValue: 22,
    description: 'Metal de alta resistencia térmica.',
    iconKey: 'box',
  },
  {
    id: 'valari_raw_t3_iridio',
    name: 'Iridio',
    category: 'Minerales',
    quality: 'Superior',
    tier: 3,
    unitVolume: 1,
    scrapCreditsValue: 65,
    description: 'Nódulos cristalinos de alta densidad.',
    iconKey: 'diamond',
  },
  {
    id: 'valari_raw_t4_neutronio',
    name: 'Neutronio',
    category: 'Minerales',
    quality: 'Reliquia',
    tier: 4,
    unitVolume: 1,
    scrapCreditsValue: 160,
    description: 'Materia degenerada hiperdensa.',
    iconKey: 'atom',
  },
  {
    id: 'cygnus_raw_t1_silicio',
    name: 'Silicio',
    category: 'Minerales',
    quality: 'Común',
    tier: 1,
    unitVolume: 1,
    scrapCreditsValue: 8,
    description: 'Substrato cristalino puro.',
    iconKey: 'microchip',
  },
  {
    id: 'cygnus_raw_t2_cromo',
    name: 'Cromo',
    category: 'Minerales',
    quality: 'Refinado',
    tier: 2,
    unitVolume: 1,
    scrapCreditsValue: 22,
    description: 'Filamento conductor cuántico.',
    iconKey: 'circuit-board',
  },
  {
    id: 'cygnus_raw_t3_foton',
    name: 'Fotones',
    category: 'Minerales',
    quality: 'Superior',
    tier: 3,
    unitVolume: 1,
    scrapCreditsValue: 65,
    description: 'Plasma lumínico estabilizado.',
    iconKey: 'sparkles',
  },
  {
    id: 'cygnus_raw_t4_taquion',
    name: 'Taquiones',
    category: 'Minerales',
    quality: 'Reliquia',
    tier: 4,
    unitVolume: 1,
    scrapCreditsValue: 160,
    description: 'Partículas superlumínicas.',
    iconKey: 'waves',
  },
  {
    id: 'skithid_raw_t1_quitina',
    name: 'Quitina',
    category: 'Biomasa',
    quality: 'Común',
    tier: 1,
    unitVolume: 1,
    scrapCreditsValue: 8,
    description: 'Placa exoesquelética orgánica.',
    iconKey: 'hexagon',
  },
  {
    id: 'skithid_raw_t2_espora',
    name: 'Espora Ácida',
    category: 'Biomasa',
    quality: 'Refinado',
    tier: 2,
    unitVolume: 1,
    scrapCreditsValue: 22,
    description: 'Vesícula reactiva corrosiva.',
    iconKey: 'biohazard',
  },
  {
    id: 'skithid_raw_t3_tejido',
    name: 'Tejido Vivo',
    category: 'Biomasa',
    quality: 'Superior',
    tier: 3,
    unitVolume: 1,
    scrapCreditsValue: 65,
    description: 'Biomasa celular elástica.',
    iconKey: 'dna',
  },
  {
    id: 'skithid_raw_t4_glandula',
    name: 'Órgano Abisal',
    category: 'Biomasa',
    quality: 'Reliquia',
    tier: 4,
    unitVolume: 1,
    scrapCreditsValue: 160,
    description: 'Glándula biológica primaria.',
    iconKey: 'heart-pulse',
  },
  {
    id: 'valari_craft_t2_titanio',
    name: 'Aleación Balística',
    category: 'Componentes Tácticos',
    quality: 'Refinado',
    tier: 2,
    unitVolume: 2,
    scrapCreditsValue: 55,
    description: 'Compuesto forjado Ferrita-Titanio.',
    iconKey: 'shield',
  },
  {
    id: 'valari_craft_t3_iridio',
    name: 'Lingote de Iridio',
    category: 'Componentes Tácticos',
    quality: 'Superior',
    tier: 3,
    unitVolume: 2,
    scrapCreditsValue: 145,
    description: 'Lingote purificado de inducción.',
    iconKey: 'cylinder',
  },
  {
    id: 'valari_craft_t4_neutronio',
    name: 'Placa Neutrónica',
    category: 'Componentes Tácticos',
    quality: 'Reliquia',
    tier: 4,
    unitVolume: 3,
    scrapCreditsValue: 380,
    description: 'Lámina blindada ultradensa.',
    iconKey: 'layers',
  },
  {
    id: 'skithid_craft_t2_enzima',
    name: 'Enzima Corrosiva',
    category: 'Componentes Tácticos',
    quality: 'Refinado',
    tier: 2,
    unitVolume: 2,
    scrapCreditsValue: 55,
    description: 'Catalizador bio-ácido.',
    iconKey: 'activity',
  },
  {
    id: 'skithid_craft_t3_caparazon',
    name: 'Caparazón Mutado',
    category: 'Componentes Tácticos',
    quality: 'Superior',
    tier: 3,
    unitVolume: 2,
    scrapCreditsValue: 145,
    description: 'Quitina flexible de absorción cinética.',
    iconKey: 'octagon',
  },
  {
    id: 'skithid_craft_t4_glandula',
    name: 'Glándula Mutada',
    category: 'Componentes Tácticos',
    quality: 'Reliquia',
    tier: 4,
    unitVolume: 3,
    scrapCreditsValue: 380,
    description: 'Órgano de alta reactividad.',
    iconKey: 'brain-circuit',
  },
  {
    id: 'cygnus_craft_t2_cromo',
    name: 'Cristal de Cromo',
    category: 'Componentes Tácticos',
    quality: 'Refinado',
    tier: 2,
    unitVolume: 2,
    scrapCreditsValue: 55,
    description: 'Red cristalina cuántica.',
    iconKey: 'gem',
  },
  {
    id: 'cygnus_craft_t3_fotones',
    name: 'Vector Fotónico',
    category: 'Componentes Tácticos',
    quality: 'Superior',
    tier: 3,
    unitVolume: 2,
    scrapCreditsValue: 145,
    description: 'Módulo emisor de energía.',
    iconKey: 'zap',
  },
  {
    id: 'cygnus_craft_t4_taquion',
    name: 'Matriz Taquiónica',
    category: 'Componentes Tácticos',
    quality: 'Reliquia',
    tier: 4,
    unitVolume: 3,
    scrapCreditsValue: 380,
    description: 'Red cuántica estabilizada.',
    iconKey: 'network',
  },
  {
    id: 'valari_t5_materia_oscura',
    name: 'Materia Oscura',
    category: 'Planos',
    quality: 'Cuántico',
    tier: 5,
    unitVolume: 5,
    scrapCreditsValue: 900,
    description: 'Reliquia de Grado 5.',
    iconKey: 'eclipse',
  },
  {
    id: 'skithid_t5_plasma_corrosivo',
    name: 'Plasma Corrosivo',
    category: 'Planos',
    quality: 'Cuántico',
    tier: 5,
    unitVolume: 5,
    scrapCreditsValue: 900,
    description: 'Plasma bio-reactivo de Grado 5.',
    iconKey: 'radiation',
  },
  {
    id: 'cygnus_t5_nucleo_cuantico',
    name: 'Núcleo Cuántico',
    category: 'Planos',
    quality: 'Cuántico',
    tier: 5,
    unitVolume: 5,
    scrapCreditsValue: 900,
    description: 'Matriz cuántica de Grado 5.',
    iconKey: 'orbit',
  },
];

export function getSiloMaxCapacity(
  siloLevel: number,
  logisticsTechLevel: number
): number {
  const baseCap = 1200 + siloLevel * 800;
  const techMultiplier = 1 + logisticsTechLevel * 0.15;
  return Math.round(baseCap * techMultiplier);
}

export function getSiloSlotCount(siloLevel: number): number {
  return 24 + siloLevel * 4;
}

export function getCharacterLevelInfo(characterXp = 0): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPct: number;
} {
  const level = Math.max(1, Math.floor(Math.sqrt(characterXp / 80)) + 1);
  const currentThreshold = Math.pow(level - 1, 2) * 80;
  const nextThreshold = Math.pow(level, 2) * 80;
  const currentLevelXp = Math.max(0, characterXp - currentThreshold);
  const nextLevelXp = Math.max(1, nextThreshold - currentThreshold);
  const progressPct = Math.min(
    100,
    Math.round((currentLevelXp / nextLevelXp) * 100)
  );

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progressPct,
  };
}

export function getProfessionLevelInfo(professionXp = 0): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPct: number;
} {
  const level = Math.max(1, Math.floor(Math.sqrt(professionXp / 120)) + 1);
  const currentThreshold = Math.pow(level - 1, 2) * 120;
  const nextThreshold = Math.pow(level, 2) * 120;
  const currentLevelXp = Math.max(0, professionXp - currentThreshold);
  const nextLevelXp = Math.max(1, nextThreshold - currentThreshold);
  const progressPct = Math.min(
    100,
    Math.round((currentLevelXp / nextLevelXp) * 100)
  );

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progressPct,
  };
}

export const INITIAL_LOADOUTS: Record<FactionId, HeroLoadout> = {
  valari: {
    weapon: {
      id: 'valari_chassis_weapon_t1',
      name: 'Fusil Balístico Mk-I',
      slot: 'weapon',
      tier: 1,
      quality: 'standard',
      level: 1,
      primaryStat: { type: 'damage', value: 25 },
      secondaryStat: { type: 'critChance', value: 5 },
      powerDrawMw: 20,
    },
    chest: {
      id: 'valari_chassis_chest_t1',
      name: 'Servo-Coraza Bastión Mk-I',
      slot: 'chest',
      tier: 1,
      quality: 'standard',
      level: 1,
      primaryStat: { type: 'flatArmor', value: 12 },
      powerDrawMw: 25,
    },
    helmet: {
      id: 'valari_chassis_helmet_t1',
      name: 'Casco de Sensores Tácticos Mk-I',
      slot: 'helmet',
      tier: 1,
      quality: 'standard',
      level: 1,
      primaryStat: { type: 'flatArmor', value: 4 },
      secondaryStat: { type: 'reconLuck', value: 5 },
      powerDrawMw: 15,
    },
    gloves: {
      id: 'valari_chassis_gloves_t1',
      name: 'Guanteletes de Actuador Mk-I',
      slot: 'gloves',
      tier: 1,
      quality: 'standard',
      level: 1,
      primaryStat: { type: 'flatArmor', value: 3 },
      secondaryStat: { type: 'accuracy', value: 85 },
      powerDrawMw: 10,
    },
    boots: {
      id: 'valari_chassis_boots_t1',
      name: 'Botas de Anclaje Magnético Mk-I',
      slot: 'boots',
      tier: 1,
      quality: 'standard',
      level: 1,
      primaryStat: { type: 'flatArmor', value: 3 },
      powerDrawMw: 10,
    },
    totalPowerDrawMw: 80,
  },
  skithid: {
    weapon: {
      id: 'skithid_chassis_weapon_t1',
      name: 'Guadañas de Bioplasma Mk-I',
      slot: 'weapon',
      tier: 1,
      quality: 'standard',
      level: 1,
      primaryStat: { type: 'damage', value: 25 },
      secondaryStat: { type: 'critChance', value: 5 },
      powerDrawMw: 20,
    },
    chest: {
      id: 'skithid_chassis_chest_t1',
      name: 'Cutícula Sináptica Mk-I',
      slot: 'chest',
      tier: 1,
      quality: 'standard',
      level: 1,
      primaryStat: { type: 'evasion', value: 15 },
      powerDrawMw: 25,
    },
    helmet: {
      id: 'skithid_chassis_helmet_t1',
      name: 'Cresta Sensorial Bio-Óptica Mk-I',
      slot: 'helmet',
      tier: 1,
      quality: 'standard',
      level: 1,
      primaryStat: { type: 'evasion', value: 4 },
      secondaryStat: { type: 'reconLuck', value: 5 },
      powerDrawMw: 15,
    },
    gloves: {
      id: 'skithid_chassis_gloves_t1',
      name: 'Fibras Neuromusculares Mk-I',
      slot: 'gloves',
      tier: 1,
      quality: 'standard',
      level: 1,
      primaryStat: { type: 'evasion', value: 3 },
      secondaryStat: { type: 'accuracy', value: 85 },
      powerDrawMw: 10,
    },
    boots: {
      id: 'skithid_chassis_boots_t1',
      name: 'Apéndices Elásticos de Tracción Mk-I',
      slot: 'boots',
      tier: 1,
      quality: 'standard',
      level: 1,
      primaryStat: { type: 'evasion', value: 3 },
      powerDrawMw: 10,
    },
    totalPowerDrawMw: 80,
  },
  cygnus: {
    weapon: {
      id: 'cygnus_chassis_weapon_t1',
      name: 'Cañón Lineal Integrado Mk-I',
      slot: 'weapon',
      tier: 1,
      quality: 'standard',
      level: 1,
      primaryStat: { type: 'damage', value: 25 },
      secondaryStat: { type: 'critChance', value: 5 },
      powerDrawMw: 20,
    },
    chest: {
      id: 'cygnus_chassis_chest_t1',
      name: 'Manto de Singularidad Mk-I',
      slot: 'chest',
      tier: 1,
      quality: 'standard',
      level: 1,
      primaryStat: { type: 'shieldCapacity', value: 14 },
      powerDrawMw: 25,
    },
    helmet: {
      id: 'cygnus_chassis_helmet_t1',
      name: 'Corona Angular Mk-I',
      slot: 'helmet',
      tier: 1,
      quality: 'standard',
      level: 1,
      primaryStat: { type: 'shieldCapacity', value: 5 },
      secondaryStat: { type: 'reconLuck', value: 5 },
      powerDrawMw: 15,
    },
    gloves: {
      id: 'cygnus_chassis_gloves_t1',
      name: 'Enlazadores de Flujo Mk-I',
      slot: 'gloves',
      tier: 1,
      quality: 'standard',
      level: 1,
      primaryStat: { type: 'shieldCapacity', value: 3 },
      secondaryStat: { type: 'accuracy', value: 85 },
      powerDrawMw: 10,
    },
    boots: {
      id: 'cygnus_chassis_boots_t1',
      name: 'Propulsores Gravitacionales Mk-I',
      slot: 'boots',
      tier: 1,
      quality: 'standard',
      level: 1,
      primaryStat: { type: 'shieldCapacity', value: 3 },
      powerDrawMw: 10,
    },
    totalPowerDrawMw: 80,
  },
};

export function getDefaultHeroLoadout(factionId: FactionId): HeroLoadout {
  const baseLoadout = INITIAL_LOADOUTS[factionId] || INITIAL_LOADOUTS.valari;
  return {
    weapon: {
      ...baseLoadout.weapon,
      primaryStat: { ...baseLoadout.weapon.primaryStat },
      ...(baseLoadout.weapon.secondaryStat
        ? { secondaryStat: { ...baseLoadout.weapon.secondaryStat } }
        : {}),
    },
    chest: {
      ...baseLoadout.chest,
      primaryStat: { ...baseLoadout.chest.primaryStat },
      ...(baseLoadout.chest.secondaryStat
        ? { secondaryStat: { ...baseLoadout.chest.secondaryStat } }
        : {}),
    },
    helmet: {
      ...baseLoadout.helmet,
      primaryStat: { ...baseLoadout.helmet.primaryStat },
      ...(baseLoadout.helmet.secondaryStat
        ? { secondaryStat: { ...baseLoadout.helmet.secondaryStat } }
        : {}),
    },
    gloves: {
      ...baseLoadout.gloves,
      primaryStat: { ...baseLoadout.gloves.primaryStat },
      ...(baseLoadout.gloves.secondaryStat
        ? { secondaryStat: { ...baseLoadout.gloves.secondaryStat } }
        : {}),
    },
    boots: {
      ...baseLoadout.boots,
      primaryStat: { ...baseLoadout.boots.primaryStat },
      ...(baseLoadout.boots.secondaryStat
        ? { secondaryStat: { ...baseLoadout.boots.secondaryStat } }
        : {}),
    },
    totalPowerDrawMw: baseLoadout.totalPowerDrawMw,
  };
}

export const COMBAT_ENEMIES: CombatEnemy[] = [];
export const STAR_SECTORS: StarSector[] = [];