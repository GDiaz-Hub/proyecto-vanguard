// src/data/factionIdentityCatalog.ts
import {
  CombatEquipableSkill,
  DefenseType,
  FactionId,
  HeroChassisSlot,
  ModuleTab,
  ReactorRoutingMode,
  TutorialScreenKey,
} from '../types/game';
import { GLOBAL_UI } from './themeConfig';

/**
 * 1. CONSTANTES GLOBALES DE BALANCE (CERO NÚMEROS MÁGICOS EN LAS VISTAS)
 */
export const GAME_BALANCE = {
  reactor: {
    baseMw: 112,
    mwPerLevel: 58,
    conductorTechMwPerLevel: 18,
    cygnusCapacityMultiplier: 1.15,
    skithidChassisMwMultiplier: 0.88,
    forgeBaseMw: 10,
    forgeMwPerLevel: 8,
    labBaseMw: 10,
    labMwPerLevel: 8,
    siloBaseMw: 6,
    siloMwPerLevel: 5,
    lowPowerChassisMwFactor: 0.55, // Modo Bajo Consumo reduce un 45% el gasto de MW de la pieza
    lowPowerChassisStatFactor: 0.72, // Modo Bajo Consumo reduce un 28% el stat de combate de esa pieza
  },
  citadel: {
    costGrowthFactor: 1.35,
    minDiscountFactor: 0.5,
    valariCostReductionPct: 15,
    valariScrapBonusMultiplier: 1.25,
    techCostReductionPerLevelPct: 5,
    maxTotalCostReductionPct: 45,
  },
  silo: {
    baseCapacity: 2500,
    capacityPerLevel: 1500,
    techBonusPctPerLevel: 20,
  },
  forge: {
    baseProgressStep: 15,
    skithidProgressStep: 20,
    industrialRoutingProgressStep: 19, // -20% tiempo de ciclo
    industrialCreditDiscountMultiplier: 0.9, // -10% coste en Créditos (₡)
    cygnusMaterialConservationChance: 0.25,
    chassisBaseCreditCostFactor: 240,
  },
  combat: {
    totalWaves: 3,
    belicoAtkMultiplier: 1.12, // +12% ATQ (Protocolo más exigente: 28 MW Libres)
    belicoDefMultiplier: 1.1, // +10% DEF
    orbitalLootMultiplier: 1.15, // +15% Botín y Créditos (20 MW Libres)
    finalWaveLootMultiplier: 1.4,
    counterFactionDamageBonus: 1.1, // +10% ventaja táctica moderada sobre la defensa objetivo
    weakFactionDamagePenalty: 0.95,
    valariReactiveArmorThreshold: 0.3, // Placas Reactivas activas mientras el Blindaje > 30%
    valariThornsReflectRatio: 0.15, // Devuelve 15% del daño absorbido por Blindaje
    valariShieldLockTurns: 2, // Sobrecarga Cinética: bloquea recarga de Escudos por 2 turnos
    skithidMaxAcidStacks: 3, // Máximo 3 cargas de Ácido Quirúrgico
    skithidAcidBleedPerStack: 0.06, // 6% de daño perforante por carga (hasta 18% con 3 cargas)
    skithidCorrosiveArmorMeltRatio: 0.06,
    skithidLifestealOnVulnerableRatio: 0.12, // 12% bio-drenaje de HP al golpear objetivos en Ruptura
    cygnusTurnShieldRegenRatio: 0.035, // Regenera +3.5% Escudo al inicio de su turno (si no tiene Sobrecarga)
    cygnusHighShieldDamageBonus: 1.1, // +10% daño mientras el Escudo supere el 50%
    cygnusIlluminatedTurns: 2, // Marcado Lumínico dura 2 turnos y reduce Evasión un 50%
  },
} as const;

/**
 * 2. NOMBRES TEMÁTICOS DEL MENÚ Y BASE POR FACCIÓN
 * Evita clichés de otros juegos (sin "Colmena" ni "Santuario").
 */
export interface FactionMenuLabelsConfig {
  hubLabel: string;
  hubSubtitle: string;
  directivesLabel: string;
  baseLabel: string;
  reactorSubLabel: string;
  forgeSubLabel: string;
  labSubLabel: string;
  siloSubLabel: string;
  heroLabel: string;
  combatLabel: string;
  mapLabel: string;
  mapSubLabel: string;
  bestiarySubLabel: string;
}

export const FACTION_MENU_LABELS: Record<FactionId, FactionMenuLabelsConfig> = {
  valari: {
    hubLabel: 'Sala de Guerra',
    hubSubtitle: 'Centro de Mando Balístico · Soberanía Valari',
    directivesLabel: 'Directivas e Hitos',
    baseLabel: 'Bastión de Hierro',
    reactorSubLabel: 'Horno Termonuclear',
    forgeSubLabel: 'Prensa de Forja',
    labSubLabel: 'Balística I+D',
    siloSubLabel: 'Silo Acorazado',
    heroLabel: 'Héroe y Equipamiento',
    combatLabel: 'Frente de Batalla',
    mapLabel: 'Mapa Estelar',
    mapSubLabel: 'Cartografía Orbital',
    bestiarySubLabel: 'Archivo de Hostiles',
  },
  skithid: {
    hubLabel: 'Cámara Sináptica',
    hubSubtitle: 'Conciencia Directora · El Enjambre Skithid',
    directivesLabel: 'Directivas e Hitos',
    baseLabel: 'El Enjambre',
    reactorSubLabel: 'Corazón Sináptico',
    forgeSubLabel: 'Biocámara Mutante',
    labSubLabel: 'Génesis Evolutiva',
    siloSubLabel: 'Fosa de Biomasa',
    heroLabel: 'Héroe y Equipamiento',
    combatLabel: 'Frente de Batalla',
    mapLabel: 'Mapa Estelar',
    mapSubLabel: 'Cartografía Orbital',
    bestiarySubLabel: 'Códice Xenobiológico',
  },
  cygnus: {
    hubLabel: 'Cámara de Mando',
    hubSubtitle: 'Sincronización Taquiónica · El Nexo Cygnus',
    directivesLabel: 'Directivas e Hitos',
    baseLabel: 'El Nexo',
    reactorSubLabel: 'Matriz Punto Cero',
    forgeSubLabel: 'Compilador Cuántico',
    labSubLabel: 'Nexo de Algoritmos',
    siloSubLabel: 'Bóveda de Fase',
    heroLabel: 'Héroe y Equipamiento',
    combatLabel: 'Frente de Batalla',
    mapLabel: 'Mapa Estelar',
    mapSubLabel: 'Cartografía Orbital',
    bestiarySubLabel: 'Registro de Amenazas',
  },
};

/**
 * 3. CATÁLOGO DE RECURSOS PRIMARIOS POR FACCIÓN
 */
export interface FactionResourceSpec {
  rawT1: { id: string; label: string };
  rawT2: { id: string; label: string };
  rawT3: { id: string; label: string };
  rawT4: { id: string; label: string };
  craftT2: { id: string; label: string };
  craftT3: { id: string; label: string };
  craftT4: { id: string; label: string };
  endgameT5: { id: string; label: string };
}

export const FACTION_RESOURCE_SPECS: Record<FactionId, FactionResourceSpec> = {
  valari: {
    rawT1: { id: 'valari_raw_t1_ferrita', label: 'Ferrita' },
    rawT2: { id: 'valari_raw_t2_titanio', label: 'Titanio' },
    rawT3: { id: 'valari_raw_t3_iridio', label: 'Iridio' },
    rawT4: { id: 'valari_raw_t4_neutronio', label: 'Neutronio' },
    craftT2: { id: 'valari_craft_t2_titanio', label: 'Aleación Balística' },
    craftT3: { id: 'valari_craft_t3_iridio', label: 'Lingote de Iridio' },
    craftT4: { id: 'valari_craft_t4_neutronio', label: 'Placa Neutrónica' },
    endgameT5: { id: 'valari_t5_materia_oscura', label: 'Materia Oscura' },
  },
  skithid: {
    rawT1: { id: 'skithid_raw_t1_quitina', label: 'Quitina' },
    rawT2: { id: 'skithid_raw_t2_espora', label: 'Espora Ácida' },
    rawT3: { id: 'skithid_raw_t3_tejido', label: 'Tejido Vivo' },
    rawT4: { id: 'skithid_raw_t4_glandula', label: 'Órgano Abisal' },
    craftT2: { id: 'skithid_craft_t2_enzima', label: 'Enzima Corrosiva' },
    craftT3: { id: 'skithid_craft_t3_caparazon', label: 'Caparazón Mutado' },
    craftT4: { id: 'skithid_craft_t4_glandula', label: 'Glándula Mutada' },
    endgameT5: { id: 'skithid_t5_plasma_corrosivo', label: 'Plasma Corrosivo' },
  },
  cygnus: {
    rawT1: { id: 'cygnus_raw_t1_silicio', label: 'Silicio' },
    rawT2: { id: 'cygnus_raw_t2_cromo', label: 'Cromo' },
    rawT3: { id: 'cygnus_raw_t3_foton', label: 'Fotones' },
    rawT4: { id: 'cygnus_raw_t4_taquion', label: 'Taquiones' },
    craftT2: { id: 'cygnus_craft_t2_cromo', label: 'Cristal de Cromo' },
    craftT3: { id: 'cygnus_craft_t3_fotones', label: 'Vector Fotónico' },
    craftT4: { id: 'cygnus_craft_t4_taquion', label: 'Matriz Taquiónica' },
    endgameT5: { id: 'cygnus_t5_nucleo_cuantico', label: 'Núcleo Cuántico' },
  },
};

/**
 * 4. IDENTIDAD DE DOCTRINAS ASIMÉTRICAS Y SINERGIAS TÁCTICAS
 * Sin referencias a "Humano" en Valari y enfocado en el Héroe individual y sus 5 Chasis.
 */
export interface FactionAsymmetricProfile {
  factionId: FactionId;
  doctrineTag: string;
  playstyleTitle: string;
  playstyleSummary: string;
  defenseShortName: string;
  role: string;
  focus: string;
  portraitFocusClass: string;
  counterTargetId: FactionId;
  counterTargetName: string;
  counterMechanicTitle: string;
  counterMechanicDescription: string;
  combatUniqueTraitTitle: string;
  combatUniqueTraitDescription: string;
  citadelUniqueTraitTitle: string;
  citadelUniqueTraitDescription: string;
}

export const FACTION_ASYMMETRIC_PROFILES: Record<FactionId, FactionAsymmetricProfile> = {
  valari: {
    factionId: 'valari',
    doctrineTag: 'DOCTRINA BALÍSTICA · SOBERANÍA VALARI',
    playstyleTitle: 'Vanguardia Acorazada y Fortificación Reactiva',
    playstyleSummary:
      'Ideal si prefieres resistir castigo sostenido con las Placas Reactivas de tu Héroe, bloquear la recarga de escudos rivales y ampliar el Bastión de Hierro a menor coste.',
    defenseShortName: 'Blindaje',
    role: 'Blindaje de Choque',
    focus: 'Sobrecarga y Contragolpe',
    portraitFocusClass: 'object-[center_4%]',
    counterTargetId: 'cygnus',
    counterTargetName: 'El Nexo Cygnus',
    counterMechanicTitle: 'Sobrecarga Cinética (Bloquea Recarga de Escudos)',
    counterMechanicDescription:
      'Tus impactos pesados desestabilizan los Escudos de Fase (+10% daño al escudo) y aplican Sobrecarga por 2 turnos, impidiendo que se regeneren.',
    combatUniqueTraitTitle: 'Placas Reactivas (>30% Blindaje · Reflejo 15%)',
    combatUniqueTraitDescription:
      'Mientras tu Blindaje supere el 30%, devuelves el 15% del daño mitigado. Usar Sellar Placas purga cualquier carga de Ácido recibida.',
    citadelUniqueTraitTitle: 'Ingeniería de Bastión (-15% Costes / +25% Desguace)',
    citadelUniqueTraitDescription:
      'Todas las ampliaciones del Bastión de Hierro e I+D cuestan -15% materiales y el Silo obtiene +25% Créditos al desguazar.',
  },
  skithid: {
    factionId: 'skithid',
    doctrineTag: 'ORGANISMO EVOLUTIVO · EL ENJAMBRE',
    playstyleTitle: 'Depredador Alfa y Neuro-Corrosión',
    playstyleSummary:
      'Ideal si prefieres controlar la iniciativa del turno (118 SPD), acumular cargas de ácido que filtran daño al HP y drenar vida en Ruptura.',
    defenseShortName: 'Evasión',
    role: 'Agilidad Sináptica',
    focus: 'Toxina Acumulativa y Drenaje',
    portraitFocusClass: 'object-[center_6%]',
    counterTargetId: 'valari',
    counterTargetName: 'Legión Valari',
    counterMechanicTitle: 'Ácido Quirúrgico (6% Filtración por Carga, Máx. 3)',
    counterMechanicDescription:
      'Cada impacto aplica 1 carga de Ácido (máx. 3) que filtra hasta un 18% del daño directo a la salud ignorando el Blindaje, salvo que el rival repare sus placas.',
    combatUniqueTraitTitle: 'Frenesí Depredador (+12% Bio-Drenaje en Ruptura)',
    combatUniqueTraitDescription:
      'Cuando quiebras la guardia de un enemigo (Ruptura), tus ataques drenan +12% del daño infligido como salud orgánica.',
    citadelUniqueTraitTitle: 'Simbiosis Metabólica (-12% MW Equipamiento / +25% Velocidad Síntesis)',
    citadelUniqueTraitDescription:
      'El Equipamiento biológico de tu Héroe consume menos MW del Corazón Sináptico y la Biocámara sintetiza compuestos un 25% más rápido.',
  },
  cygnus: {
    factionId: 'cygnus',
    doctrineTag: 'CONCIENCIA CUÁNTICA · EL NEXO',
    playstyleTitle: 'Armonía de Fase y Fijación Taquiónica',
    playstyleSummary:
      'Ideal si prefieres marcar objetivos ágiles para anular su evasión, mantener escudos altos para potenciar tu ataque y dominar la red de MW.',
    defenseShortName: 'Escudos',
    role: 'Barrera Cuántica',
    focus: 'Fijación Lumínica y Resonancia',
    portraitFocusClass: 'object-[center_4%]',
    counterTargetId: 'skithid',
    counterTargetName: 'Enjambre Skithid',
    counterMechanicTitle: 'Marcado Lumínico (-50% Evasión y +10% Precisión)',
    counterMechanicDescription:
      'Tus disparos aplican [FIJADO] por 2 turnos sobre objetivos escurridizos, reduciendo su Evasión a la mitad y aumentando +10% el daño subsiguiente.',
    combatUniqueTraitTitle: 'Resonancia de Fase (+6% Escudo/Turno y +10% ATQ)',
    combatUniqueTraitDescription:
      'Regenera +6% de Escudo cada turno (si no está en Sobrecarga) y otorga +10% de ataque mientras tu Escudo se mantenga sobre el 50%.',
    citadelUniqueTraitTitle: 'Flujo de Punto Cero (+15% MW Reactor / 25% Compilación Gratis)',
    citadelUniqueTraitDescription:
      'La Matriz Punto Cero genera +15% MW totales por nivel y el Compilador tiene 25% de probabilidad de no gastar materiales al fabricar.',
  },
};

/**
 * 5. CATÁLOGO DE CONFIGURACIÓN DEL REACTOR CENTRAL POR FACCIÓN
 */
export interface FactionReactorSkinConfig {
  headerBadge: string;
  reactorTitle: string;
  reactorSubtitle: string;
  factionPassiveTitle: string;
  factionPassiveDesc: string;
  panelContainer: string;
  subCardContainer: string;
  accentText: string;
  accentTextBright: string;
  accentBorder: string;
  accentBarFill: string;
  topSubsystemLabel: string;
  bottomSubsystemLabel: string;
  forgeModuleName: string;
  labModuleName: string;
  siloModuleName: string;
  coreChamberBg: string;
  coreRingActiveBorder: string;
  coreNodeInteractive: string;
  coreActionPill: string;
  outputBadge: string;
  upgradeCtaBtn: string;
}

export const FACTION_REACTOR_SKINS: Record<FactionId, FactionReactorSkinConfig> = {
  valari: {
    headerBadge: 'BASTIÓN DE HIERRO · LEGIÓN VALARI',
    reactorTitle: 'Horno Termonuclear',
    reactorSubtitle:
      'Genera energía (MW) para alimentar tus instalaciones, protocolos y equipamiento.',
    factionPassiveTitle: 'Doctrina Valari · Ingeniería de Bastión',
    factionPassiveDesc:
      '-15% Coste de materiales al ampliar el Bastión de Hierro y +25% Créditos al desguazar en el Silo.',
    panelContainer: GLOBAL_UI.glass.panel,
    subCardContainer: GLOBAL_UI.glass.subcard,
    accentText: 'text-amber-300',
    accentTextBright: 'text-amber-200',
    accentBorder: 'border-amber-400/35',
    accentBarFill: 'bg-amber-400/90',
    topSubsystemLabel: 'Inyectores Balísticos de Plasma',
    bottomSubsystemLabel: 'Colector Termo-Hidráulico',
    forgeModuleName: 'Prensa de Forja',
    labModuleName: 'Balística I+D',
    siloModuleName: 'Silo Acorazado',
    coreChamberBg:
      'bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.09)_0%,rgba(18,25,38,0.45)_75%)]',
    coreRingActiveBorder: 'border-amber-400/50',
    coreNodeInteractive:
      'bg-[#131B28]/88 backdrop-blur-xl border border-amber-400/55 shadow-[0_0_24px_rgba(245,158,11,0.22),inset_0_0_16px_rgba(245,158,11,0.14)] hover:border-amber-300 hover:bg-amber-500/15',
    coreActionPill:
      'bg-amber-500/20 border border-amber-400/40 text-amber-100',
    outputBadge:
      'bg-[#182232]/65 backdrop-blur-md border border-amber-400/25 text-amber-200 rounded-xl',
    upgradeCtaBtn:
      'bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-md border border-amber-400/40 text-amber-100 shadow-sm',
  },
  skithid: {
    headerBadge: 'EL ENJAMBRE · ÓRGANO DE RESONANCIA SKITHID',
    reactorTitle: 'Corazón Sináptico',
    reactorSubtitle:
      'Genera energía bio-eléctrica (MW) para tus instalaciones, protocolos y equipamiento.',
    factionPassiveTitle: 'Doctrina Skithid · Simbiosis Metabólica',
    factionPassiveDesc:
      '-12% Consumo de MW en el Equipamiento del Héroe y +25% velocidad de síntesis en la Biocámara Mutante.',
    panelContainer: GLOBAL_UI.glass.panel,
    subCardContainer: GLOBAL_UI.glass.subcard,
    accentText: 'text-emerald-300',
    accentTextBright: 'text-emerald-200',
    accentBorder: 'border-emerald-400/35',
    accentBarFill: 'bg-emerald-400/90',
    topSubsystemLabel: 'Ganglios de Inyección',
    bottomSubsystemLabel: 'Nodo Neuronal',
    forgeModuleName: 'Biocámara Mutante',
    labModuleName: 'Génesis Evolutiva',
    siloModuleName: 'Fosa de Biomasa',
    coreChamberBg:
      'bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.09)_0%,rgba(18,25,38,0.45)_75%)]',
    coreRingActiveBorder: 'border-emerald-400/50',
    coreNodeInteractive:
      'bg-[#131B28]/88 backdrop-blur-xl border border-[#F5F2EB]/65 shadow-[0_0_24px_rgba(16,185,129,0.22),inset_0_0_16px_rgba(16,185,129,0.14)] hover:border-emerald-300 hover:bg-emerald-500/15',
    coreActionPill:
      'bg-emerald-500/20 border border-emerald-400/40 text-emerald-100',
    outputBadge:
      'bg-[#182232]/65 backdrop-blur-md border border-emerald-400/25 text-emerald-200 rounded-xl',
    upgradeCtaBtn:
      'bg-emerald-500/20 hover:bg-emerald-500/30 backdrop-blur-md border border-emerald-400/40 text-emerald-100 shadow-sm',
  },
  cygnus: {
    headerBadge: 'EL NEXO · SINGULARIDAD ARMÓNICA CYGNUS',
    reactorTitle: 'Matriz Punto Cero',
    reactorSubtitle:
      'Genera energía cuántica (MW) para alimentar tus instalaciones, protocolos y equipamiento.',
    factionPassiveTitle: 'Doctrina Cygnus · Flujo Cuántico',
    factionPassiveDesc:
      '+15% Capacidad total de MW generada por nivel del Reactor y 25% probabilidad de conservar insumos en Compilador.',
    panelContainer: GLOBAL_UI.glass.panel,
    subCardContainer: GLOBAL_UI.glass.subcard,
    accentText: 'text-blue-300',
    accentTextBright: 'text-blue-200',
    accentBorder: 'border-blue-400/35',
    accentBarFill: 'bg-blue-400/90',
    topSubsystemLabel: 'Colimadores de Fase',
    bottomSubsystemLabel: 'Anclaje Gravitacional',
    forgeModuleName: 'Compilador Cuántico',
    labModuleName: 'Nexo de Algoritmos',
    siloModuleName: 'Bóveda de Fase',
    coreChamberBg:
      'bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.09)_0%,rgba(18,25,38,0.45)_75%)]',
    coreRingActiveBorder: 'border-blue-400/50',
    coreNodeInteractive:
      'bg-[#131B28]/88 backdrop-blur-xl border border-blue-400/55 shadow-[0_0_24px_rgba(59,130,246,0.22),inset_0_0_16px_rgba(59,130,246,0.14)] hover:border-blue-300 hover:bg-blue-500/15',
    coreActionPill:
      'bg-blue-600/22 border border-blue-400/40 text-blue-100',
    outputBadge:
      'bg-[#182232]/65 backdrop-blur-md border border-blue-400/25 text-blue-200 rounded-xl',
    upgradeCtaBtn:
      'bg-blue-600/22 hover:bg-blue-600/32 backdrop-blur-md border border-blue-400/40 text-blue-100 shadow-sm',
  },
};

/**
 * 6. PROTOCOLOS DE ENRUTAMIENTO DEL REACTOR CENTRAL
 * Sin etiquetas en modo reposo ('none'). Exigen Reserva de MW Libres real; Protocolo Bélico es el más costoso (28 MW).
 */
export interface ReactorRoutingProtocolConfig {
  id: Exclude<ReactorRoutingMode, 'none'>;
  title: string;
  requiredReserveMw: number;
  shortTag: string;
  effectSummary: string;
  logLabel: string;
}

export const REACTOR_ROUTING_PROTOCOLS: ReactorRoutingProtocolConfig[] = [
  {
    id: 'industrial',
    title: 'Protocolo Industrial',
    requiredReserveMw: 15,
    shortTag: '-20% TIEMPO / -10% ₡',
    effectSummary:
      'Desvía 15 MW Libres para acelerar la síntesis en la Forja y reducir un 10% el coste en Créditos al evolucionar Chasis.',
    logLabel: 'Protocolo Industrial (-20% Tiempo / -10% ₡ · 15 MW)',
  },
  {
    id: 'orbital',
    title: 'Protocolo Orbital',
    requiredReserveMw: 20,
    shortTag: '+15% BOTÍN Y CRÉDITOS',
    effectSummary:
      'Desvía 20 MW Libres a los escáneres de extracción para obtener +15% materiales y Créditos en el Frente de Batalla.',
    logLabel: 'Protocolo Orbital (+15% Botín y Créditos · 20 MW)',
  },
  {
    id: 'belico',
    title: 'Protocolo Bélico',
    requiredReserveMw: 28,
    shortTag: '+12% ATQ / +10% DEF',
    effectSummary:
      'El protocolo más exigente (28 MW Libres). Sobrecarga las armas y defensas del Héroe en el Frente de Batalla.',
    logLabel: 'Protocolo Bélico (+12% ATQ / +10% DEF · 28 MW)',
  },
];

/**
 * 7. CATÁLOGO DE ETIQUETAS DE RANURAS Y GRADOS DE CHASIS
 */
export const CHASSIS_SLOT_LABELS: Record<HeroChassisSlot, string> = {
  weapon: 'Arma Principal',
  chest: 'Coraza Central',
  helmet: 'Casco / Cresta Sensorial',
  gloves: 'Guanteletes / Actuadores',
  boots: 'Botas / Apéndices de Tracción',
};

export const CHASSIS_MK_LABELS: Record<number, string> = {
  1: 'Mk-I',
  2: 'Mk-II',
  3: 'Mk-III',
  4: 'Mk-IV',
  5: 'Mk-V',
};

export const CHASSIS_ROMAN_NUMERALS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
};

/**
 * 8. CATÁLOGO DE RETRATOS DE DASHBOARD (600x720 .jpg), RETRATOS DE TURNOS (128x128 .jpg) Y SPRITES DE ARENA
 */
export const HERO_DASHBOARD_PORTRAITS_CATALOG: Record<FactionId, string> = {
  valari: '/assets/retratos-dashboard/hero-dashboard-valari.jpg',
  skithid: '/assets/retratos-dashboard/hero-dashboard-skithid.jpg',
  cygnus: '/assets/retratos-dashboard/hero-dashboard-cygnus.jpg',
};

export const HERO_PORTRAITS_CATALOG: Record<FactionId, string> = {
  valari: '/assets/turnos/hero-valari.jpg',
  skithid: '/assets/turnos/hero-skithid.jpg',
  cygnus: '/assets/turnos/hero-cygnus.jpg',
};

/**
 * Convierte cualquier ruta de sprite de combate (`/assets/unidades/<archivo>.png`)
 * a su versión separada de 128x128 px en formato .jpg para la Secuencia de Turnos (`/assets/turnos/<archivo>.jpg`).
 */
export function getTurnPortraitForSpriteUrl(spriteUrl?: string): string {
  if (!spriteUrl) return '/assets/turnos/hero-valari.jpg';
  if (spriteUrl.includes('/assets/turnos/')) {
    return spriteUrl
      .replace('hero-cb-', 'hero-')
      .replace(/\.(png|webp)$/i, '.jpg');
  }
  return spriteUrl
    .replace('/assets/unidades/', '/assets/turnos/')
    .replace('hero-cb-', 'hero-')
    .replace(/\.(png|webp)$/i, '.jpg');
}

export const UNIT_SPRITES_CATALOG: Record<string, string> = {
  // Sprites canónicos y de respaldo por facción
  valari_line: '/assets/unidades/valari-media-automata-fundicion.webp',
  valari_skirmisher: '/assets/unidades/valari-ligera-rastreador-escoria.webp',
  valari_heavy: '/assets/unidades/valari-pesada-perforadora-vulcano.webp',
  skithid_line: '/assets/unidades/skithid-media-mantis-abisal.webp',
  skithid_skirmisher: '/assets/unidades/skithid-ligera-larva-feral.webp',
  skithid_heavy: '/assets/unidades/skithid-pesada-behemoth-quitinoso.webp',
  cygnus_line: '/assets/unidades/cygnus-media-espectro-cromo.webp',
  cygnus_skirmisher: '/assets/unidades/cygnus-ligera-sonda-taquionica.webp',
  cygnus_heavy: '/assets/unidades/cygnus-pesada-monolito-null.webp',
  neutral_line: '/assets/unidades/orion-media-mercenario-orion.webp',
  neutral_skirmisher: '/assets/unidades/orion-ligera-corsario-vacio.webp',
  neutral_heavy: '/assets/unidades/orion-pesada-demoledor-orbital.webp',

  // Sector 1: Bastión de Vaelor (SEC-VAL-01)
  valari_ligera_rastreador_escoria:
    '/assets/unidades/valari-ligera-rastreador-escoria.webp',
  valari_media_automata_fundicion:
    '/assets/unidades/valari-media-automata-fundicion.webp',
  valari_pesada_perforadora_vulcano:
    '/assets/unidades/valari-pesada-perforadora-vulcano.webp',
  valari_elite_automata_aureo:
    '/assets/unidades/valari-elite-automata-aureo.webp',

  // Sector 2: Enjambre Progenitor (SEC-SKI-01)
  skithid_ligera_larva_feral:
    '/assets/unidades/skithid-ligera-larva-feral.webp',
  skithid_media_mantis_abisal:
    '/assets/unidades/skithid-media-mantis-abisal.webp',
  skithid_pesada_behemoth_quitinoso:
    '/assets/unidades/skithid-pesada-behemoth-quitinoso.webp',
  skithid_elite_matriarca_albina:
    '/assets/unidades/skithid-elite-matriarca-albina.webp',

  // Sector 3: Nexo de Caelum (SEC-CYG-01)
  cygnus_ligera_sonda_taquionica:
    '/assets/unidades/cygnus-ligera-sonda-taquionica.webp',
  cygnus_media_espectro_cromo:
    '/assets/unidades/cygnus-media-espectro-cromo.webp',
  cygnus_pesada_monolito_null:
    '/assets/unidades/cygnus-pesada-monolito-null.webp',
  cygnus_elite_oraculo_cero:
    '/assets/unidades/cygnus-elite-oraculo-cero.webp',

  // Sector 4: Corredor de Orión (SEC-NEU-WEST)
  orion_ligera_corsario_vacio:
    '/assets/unidades/orion-ligera-corsario-vacio.webp',
  orion_media_mercenario_orion:
    '/assets/unidades/orion-media-mercenario-orion.webp',
  orion_pesada_demoledor_orbital:
    '/assets/unidades/orion-pesada-demoledor-orbital.webp',
  orion_elite_corsario_elite:
    '/assets/unidades/orion-elite-corsario-elite.webp',

  // Sector 5: Cinturón de Aethel (SEC-NEU-EAST)
  aethel_ligera_acechador_biomineral:
    '/assets/unidades/aethel-ligera-acechador-biomineral.webp',
  aethel_media_vanguardia_cismatica:
    '/assets/unidades/aethel-media-vanguardia-cismatica.webp',
  aethel_pesada_coloso_neutronico:
    '/assets/unidades/aethel-pesada-coloso-neutronico.webp',
  aethel_elite_hidra_iridio:
    '/assets/unidades/aethel-elite-hidra-iridio.webp',

  // Sector 6: La Falla de Vesper (SEC-NEU-01) + Jefes Épicos
  vesper_ligera_vastago_abisal:
    '/assets/unidades/vesper-ligera-vastago-abisal.webp',
  vesper_media_custodio_precursor:
    '/assets/unidades/vesper-media-custodio-precursor.webp',
  vesper_pesada_heraldo_vesper:
    '/assets/unidades/vesper-pesada-heraldo-vesper.webp',
  vesper_elite_serafin_abisal:
    '/assets/unidades/vesper-elite-serafin-abisal.webp',
  vesper_jefe_arquitecto_primordial:
    '/assets/unidades/vesper-jefe-arquitecto-primordial.webp',
  vesper_jefe_vesperion_abisal:
    '/assets/unidades/vesper-jefe-vesperion-abisal.webp',
};

export interface SquadUnitTemplate {
  name: string;
  roleTitle: string;
  spriteKey: string;
  unitClass?: 'light' | 'medium' | 'heavy' | 'epic_boss';
  defenseType?: DefenseType;
  signatureAbilityLabel?: string;
  combatTraitNote?: string;
}

export const CANONICAL_FACTION_UNITS: Record<
  FactionId,
  [SquadUnitTemplate, SquadUnitTemplate, SquadUnitTemplate]
> = {
  valari: [
    {
      name: 'Legionario Brecha',
      roleTitle: 'CHOQUE MEDIO',
      spriteKey: 'valari_line',
      unitClass: 'medium',
      defenseType: 'Armor',
      signatureAbilityLabel: 'Fuego de Supresión Térmica',
    },
    {
      name: 'Dron VTOL',
      roleTitle: 'HOSTIGADOR LIGERO',
      spriteKey: 'valari_skirmisher',
      unitClass: 'light',
      defenseType: 'Evasion',
      signatureAbilityLabel: 'Ráfaga Cinética Veloz',
    },
    {
      name: 'Baluarte Goliath',
      roleTitle: 'ASEDIO PESADO',
      spriteKey: 'valari_heavy',
      unitClass: 'heavy',
      defenseType: 'Armor',
      signatureAbilityLabel: 'Mortero de Sobrecarga (!)',
    },
  ],
  skithid: [
    {
      name: 'Piquero Kryll',
      roleTitle: 'CHOQUE MEDIO',
      spriteKey: 'skithid_line',
      unitClass: 'medium',
      defenseType: 'Evasion',
      signatureAbilityLabel: 'Estocada Quitino-Ácida',
    },
    {
      name: 'Avispón Asedio',
      roleTitle: 'HOSTIGADOR LIGERO',
      spriteKey: 'skithid_skirmisher',
      unitClass: 'light',
      defenseType: 'Evasion',
      signatureAbilityLabel: 'Aguijón Neurotóxico Veloz',
    },
    {
      name: 'Baluarte Karkinos',
      roleTitle: 'ASEDIO PESADO',
      spriteKey: 'skithid_heavy',
      unitClass: 'heavy',
      defenseType: 'Armor',
      signatureAbilityLabel: 'Aplastamiento Biomineral (!)',
    },
  ],
  cygnus: [
    {
      name: 'Androide Prismático',
      roleTitle: 'CHOQUE MEDIO',
      spriteKey: 'cygnus_line',
      unitClass: 'medium',
      defenseType: 'Shields',
      signatureAbilityLabel: 'Pulso Colimador de Fase',
    },
    {
      name: 'Sonda Lumínica',
      roleTitle: 'HOSTIGADOR LIGERO',
      spriteKey: 'cygnus_skirmisher',
      unitClass: 'light',
      defenseType: 'Evasion',
      signatureAbilityLabel: 'Marcado Lumínico Rápido',
    },
    {
      name: 'Plataforma Fase',
      roleTitle: 'ASEDIO PESADO',
      spriteKey: 'cygnus_heavy',
      unitClass: 'heavy',
      defenseType: 'Shields',
      signatureAbilityLabel: 'Convergencia Taquiónica (!)',
    },
  ],
};

/**
 * 8B. CATÁLOGO DE UNIDADES NEUTRALES Y AUTÓCTONAS POR SECTOR GALÁCTICO
 * Cada sector posee su propio trío diferenciado (Unidad Ligera, Unidad Media de Choque y Unidad Pesada)
 * con nombres de máximo 2 palabras y tipo de defensa propio (Blindaje, Esquiva o Escudo) acorde a su anatomía.
 * Orden de tupla: [0: Unidad Media de Choque, 1: Unidad Ligera Hostigadora, 2: Unidad Pesada de Asedio]
 */
export interface SectorNeutralUnitSpec extends SquadUnitTemplate {
  unitClass: 'light' | 'medium' | 'heavy' | 'epic_boss';
  factionStyle: FactionId;
  defenseType: DefenseType;
  speedBonus: number;
  atkMultiplier: number;
  defMultiplier: number;
  hpMultiplier: number;
  signatureAbilityLabel: string;
  combatTraitNote: string;
}

export const SECTOR_NEUTRAL_UNITS_CATALOG: Record<
  string,
  [SectorNeutralUnitSpec, SectorNeutralUnitSpec, SectorNeutralUnitSpec]
> = {
  // 1. BASTIÓN DE VAELOR (Cuna Valari · Tiers I–III) — Maquinaria Minera y Autómatas de Escoria Rebeldes
  'SEC-VAL-01': [
    {
      name: 'Autómata Fundición',
      roleTitle: 'CHOQUE TÉRMICO (MEDIA)',
      spriteKey: 'valari_media_automata_fundicion',
      unitClass: 'medium',
      factionStyle: 'valari',
      defenseType: 'Armor',
      speedBonus: 0,
      atkMultiplier: 1.05,
      defMultiplier: 1.05,
      hpMultiplier: 1.0,
      signatureAbilityLabel: 'Choque de Impacto',
      combatTraitNote: 'Unidad media de choque industrial protegida por blindaje pesado de fundición.',
    },
    {
      name: 'Rastreador Escoria',
      roleTitle: 'HOSTIGADOR MINERO (LIGERA)',
      spriteKey: 'valari_ligera_rastreador_escoria',
      unitClass: 'light',
      factionStyle: 'valari',
      defenseType: 'Evasion',
      speedBonus: 14,
      atkMultiplier: 0.92,
      defMultiplier: 0.82,
      hpMultiplier: 0.85,
      signatureAbilityLabel: 'Láser de Corte Rápido',
      combatTraitNote: 'Unidad ligera de propulsión ágil que utiliza maniobras de esquiva y corte rápido.',
    },
    {
      name: 'Perforadora Vulcano',
      roleTitle: 'ASEDIO BASÁLTICO (PESADA)',
      spriteKey: 'valari_pesada_perforadora_vulcano',
      unitClass: 'heavy',
      factionStyle: 'valari',
      defenseType: 'Armor',
      speedBonus: -10,
      atkMultiplier: 1.28,
      defMultiplier: 1.35,
      hpMultiplier: 1.3,
      signatureAbilityLabel: 'Descarga Sísmica (!)',
      combatTraitNote: 'Unidad pesada acorazada que carga golpes de demolición capaces de sobrecargar defensas.',
    },
  ],

  // 2. ENJAMBRE PROGENITOR (Cuna Skithid · Tiers I–III) — Fauna Salvaje y Cepas Feral de Kryll Prime
  'SEC-SKI-01': [
    {
      name: 'Mantis Abisal',
      roleTitle: 'CHOQUE QUITINOSO (MEDIA)',
      spriteKey: 'skithid_media_mantis_abisal',
      unitClass: 'medium',
      factionStyle: 'skithid',
      defenseType: 'Evasion',
      speedBonus: 6,
      atkMultiplier: 1.08,
      defMultiplier: 1.0,
      hpMultiplier: 1.0,
      signatureAbilityLabel: 'Guadaña Doble Corrosiva',
      combatTraitNote: 'Depredador ágil de fosa que esquiva impactos y presiona con tajos corrosivos.',
    },
    {
      name: 'Larva Abisal',
      roleTitle: 'HOSTIGADOR ÁCIDO (LIGERA)',
      spriteKey: 'skithid_ligera_larva_feral',
      unitClass: 'light',
      factionStyle: 'skithid',
      defenseType: 'Evasion',
      speedBonus: 18,
      atkMultiplier: 0.95,
      defMultiplier: 0.8,
      hpMultiplier: 0.84,
      signatureAbilityLabel: 'Proyección de Espora Ácida',
      combatTraitNote: 'Criatura ligera hiper-veloz que depende de su esquiva sináptica e inyecta toxinas.',
    },
    {
      name: 'Behemoth Quitinoso',
      roleTitle: 'ASEDIO BIOLÓGICO (PESADA)',
      spriteKey: 'skithid_pesada_behemoth_quitinoso',
      unitClass: 'heavy',
      factionStyle: 'skithid',
      defenseType: 'Armor',
      speedBonus: -8,
      atkMultiplier: 1.3,
      defMultiplier: 1.32,
      hpMultiplier: 1.32,
      signatureAbilityLabel: 'Embestida Abisal (!)',
      combatTraitNote: 'Coloso salvaje recubierto en placas de blindaje quitinoso con embestida devastadora.',
    },
  ],

  // 3. NEXO DE CAELUM (Cuna Cygnus · Tiers I–III · Capital: Nodo Cero) — Sondas Errantes y Construcciones Corruptas
  'SEC-CYG-01': [
    {
      name: 'Espectro Cromo',
      roleTitle: 'CHOQUE DE FASE (MEDIA)',
      spriteKey: 'cygnus_media_espectro_cromo',
      unitClass: 'medium',
      factionStyle: 'cygnus',
      defenseType: 'Shields',
      speedBonus: 4,
      atkMultiplier: 1.06,
      defMultiplier: 1.08,
      hpMultiplier: 0.98,
      signatureAbilityLabel: 'Arco Disrruptor',
      combatTraitNote: 'Unidad media de choque cuántico protegida por barrera de escudos de fase.',
    },
    {
      name: 'Sonda Taquiónica',
      roleTitle: 'HOSTIGADOR LUMÍNICO (LIGERA)',
      spriteKey: 'cygnus_ligera_sonda_taquionica',
      unitClass: 'light',
      factionStyle: 'cygnus',
      defenseType: 'Evasion',
      speedBonus: 16,
      atkMultiplier: 0.94,
      defMultiplier: 0.85,
      hpMultiplier: 0.82,
      signatureAbilityLabel: 'Pulso de Fijación Null',
      combatTraitNote: 'Sonda autónoma de levitación veloz con alta esquiva que ilumina al objetivo.',
    },
    {
      name: 'Monolito Null',
      roleTitle: 'ASEDIO GEODÉSICO (PESADA)',
      spriteKey: 'cygnus_pesada_monolito_null',
      unitClass: 'heavy',
      factionStyle: 'cygnus',
      defenseType: 'Armor',
      speedBonus: -9,
      atkMultiplier: 1.28,
      defMultiplier: 1.38,
      hpMultiplier: 1.26,
      signatureAbilityLabel: 'Colapso de Fase (!)',
      combatTraitNote: 'Estructura pesada de contención en Nodo Cero revestida en blindaje denso de cromo.',
    },
  ],

  // 4. CORREDOR DE ORIÓN (Frontera Neutral Occidental · Tiers IV–V) — Corsarios y Mercenarios del Canal Exterior
  'SEC-NEU-WEST': [
    {
      name: 'Mercenario Orión',
      roleTitle: 'CHOQUE FRONTERIZO (MEDIA)',
      spriteKey: 'orion_media_mercenario_orion',
      unitClass: 'medium',
      factionStyle: 'valari',
      defenseType: 'Armor',
      speedBonus: 4,
      atkMultiplier: 1.1,
      defMultiplier: 1.1,
      hpMultiplier: 1.05,
      signatureAbilityLabel: 'Rifle Térmico de Asalto',
      combatTraitNote: 'Combatiente veterano del Corredor de Orión equipado con placas de blindaje compuesto.',
    },
    {
      name: 'Corsario Vacío',
      roleTitle: 'HOSTIGADOR ORBITAL (LIGERA)',
      spriteKey: 'orion_ligera_corsario_vacio',
      unitClass: 'light',
      factionStyle: 'cygnus',
      defenseType: 'Evasion',
      speedBonus: 16,
      atkMultiplier: 0.98,
      defMultiplier: 0.88,
      hpMultiplier: 0.88,
      signatureAbilityLabel: 'Carabina Magnética Veloz',
      combatTraitNote: 'Incursor ligero de alta velocidad y esquiva que hostiga las líneas de extracción.',
    },
    {
      name: 'Demoledor Orbital',
      roleTitle: 'ASEDIO CORREDOR (PESADA)',
      spriteKey: 'orion_pesada_demoledor_orbital',
      unitClass: 'heavy',
      factionStyle: 'valari',
      defenseType: 'Shields',
      speedBonus: -8,
      atkMultiplier: 1.32,
      defMultiplier: 1.35,
      hpMultiplier: 1.35,
      signatureAbilityLabel: 'Salva de Abordaje (!)',
      combatTraitNote: 'Exoesqueleto pesado de abordaje protegido por un generador de escudos orbitales.',
    },
  ],

  // 5. CINTURÓN DE AETHEL (Frontera Neutral Oriental · Tiers VI–VII) — Entidades Biominerales y Vanguardias Cismáticas
  'SEC-NEU-EAST': [
    {
      name: 'Vanguardia Cismática',
      roleTitle: 'CHOQUE HÍBRIDO (MEDIA)',
      spriteKey: 'aethel_media_vanguardia_cismatica',
      unitClass: 'medium',
      factionStyle: 'cygnus',
      defenseType: 'Shields',
      speedBonus: 6,
      atkMultiplier: 1.14,
      defMultiplier: 1.12,
      hpMultiplier: 1.08,
      signatureAbilityLabel: 'Lanza Cuántico-Térmica',
      combatTraitNote: 'Unidad de choque nacida en las cicatrices de Aethel protegida por escudos de fase.',
    },
    {
      name: 'Acechador Biomineral',
      roleTitle: 'HOSTIGADOR MUTADO (LIGERA)',
      spriteKey: 'aethel_ligera_acechador_biomineral',
      unitClass: 'light',
      factionStyle: 'skithid',
      defenseType: 'Evasion',
      speedBonus: 18,
      atkMultiplier: 1.02,
      defMultiplier: 0.9,
      hpMultiplier: 0.9,
      signatureAbilityLabel: 'Espora de Iridio Ácido',
      combatTraitNote: 'Depredador ligero de alta esquiva que metabolizó depósitos de Iridio.',
    },
    {
      name: 'Coloso Neutrónico',
      roleTitle: 'ASEDIO RADIANTE (PESADA)',
      spriteKey: 'aethel_pesada_coloso_neutronico',
      unitClass: 'heavy',
      factionStyle: 'valari',
      defenseType: 'Armor',
      speedBonus: -6,
      atkMultiplier: 1.36,
      defMultiplier: 1.4,
      hpMultiplier: 1.38,
      signatureAbilityLabel: 'Pulso de Núcleo Partido (!)',
      combatTraitNote: 'Coloso pesado revestido en blindaje de Neutronio de Punta Quebrada.',
    },
  ],

  // 6. LA FALLA DE VESPER (Centro de la Galaxia · Tiers VIII–X) — Guardianes Precursores y Anomalías del Horizonte
  'SEC-NEU-01': [
    {
      name: 'Custodio Precursor',
      roleTitle: 'CHOQUE PRECURSOR (MEDIA)',
      spriteKey: 'vesper_media_custodio_precursor',
      unitClass: 'medium',
      factionStyle: 'cygnus',
      defenseType: 'Shields',
      speedBonus: 8,
      atkMultiplier: 1.18,
      defMultiplier: 1.18,
      hpMultiplier: 1.15,
      signatureAbilityLabel: 'Convergencia de Anillos en X',
      combatTraitNote: 'Guardián ancestral del Arca de la Singularidad con barrera de escudos precursores.',
    },
    {
      name: 'Vástago Abisal',
      roleTitle: 'HOSTIGADOR ABISAL (LIGERA)',
      spriteKey: 'vesper_ligera_vastago_abisal',
      unitClass: 'light',
      factionStyle: 'skithid',
      defenseType: 'Evasion',
      speedBonus: 20,
      atkMultiplier: 1.08,
      defMultiplier: 0.95,
      hpMultiplier: 0.95,
      signatureAbilityLabel: 'Desgarro de Marea Gravitacional',
      combatTraitNote: 'Anomalía veloz de alta esquiva surgida en la Falla de Vesper.',
    },
    {
      name: 'Heraldo Vesper',
      roleTitle: 'ASEDIO GRAVITACIONAL (PESADA)',
      spriteKey: 'vesper_pesada_heraldo_vesper',
      unitClass: 'heavy',
      factionStyle: 'valari',
      defenseType: 'Armor',
      speedBonus: -5,
      atkMultiplier: 1.42,
      defMultiplier: 1.45,
      hpMultiplier: 1.42,
      signatureAbilityLabel: 'Colapso del Horizonte (!)',
      combatTraitNote: 'Titán acorazado en blindaje de Materia Oscura que custodia el núcleo galáctico.',
    },
  ],
};

/**
 * 8C. JEFES ÉPICOS DEL CENTRO DE LA GALAXIA (LA FALLA DE VESPER · SECTOR C-08)
 * Se despliegan en la oleada final de los mundos del Núcleo Galáctico (Arca de la Singularidad y Horizonte de Vesper).
 */
export const GALACTIC_CORE_EPIC_BOSSES: Record<string, SectorNeutralUnitSpec> = {
  'PLN-VESP-02': {
    name: 'Arquitecto Primordial',
    roleTitle: 'JEFE ÉPICO PRECURSOR',
    spriteKey: 'vesper_jefe_arquitecto_primordial',
    unitClass: 'epic_boss',
    factionStyle: 'cygnus',
    defenseType: 'Shields',
    speedBonus: 6,
    atkMultiplier: 1.55,
    defMultiplier: 1.65,
    hpMultiplier: 1.75,
    signatureAbilityLabel: 'Protocolo de Génesis Cuántica (!)',
    combatTraitNote:
      'Jefe Épico del Arca de la Singularidad: superestructura consciente precursora que alterna sobrecarga de escudos y pulsos taquiónicos.',
  },
  'PLN-VESP-03': {
    name: 'Vesperion Abisal',
    roleTitle: 'JEFE ÉPICO DE LA SINGULARIDAD',
    spriteKey: 'vesper_jefe_vesperion_abisal',
    unitClass: 'epic_boss',
    factionStyle: 'skithid',
    defenseType: 'Armor',
    speedBonus: 8,
    atkMultiplier: 1.68,
    defMultiplier: 1.75,
    hpMultiplier: 1.9,
    signatureAbilityLabel: 'Singularidad Abrasiva de Vesper (!)',
    combatTraitNote:
      'Jefe Épico final del centro de la galaxia (Horizonte de Vesper): entidad colosal revestida en blindaje de Materia Oscura y Plasma Corrosivo.',
  },
};

/**
 * 8D. AMENAZAS RARAS / ÉLITE POR SECTOR Y GENERADOR DINÁMICO DE HOSTILES POR PLANETA
 * Nombres de máximo 2 palabras. Cada planeta posee 4 hostiles con % de aparición explícito:
 * - Unidad Ligera Hostigadora: 47% (45% con Protocolo Orbital)
 * - Unidad Media de Choque: 35% (34% con Protocolo Orbital)
 * - Unidad Pesada de Asedio: 15% (15% con Protocolo Orbital)
 * - Amenaza Rara / Élite del Sector: 3% (6% con Protocolo Orbital)
 */
export interface SectorRareUnitSpec extends SectorNeutralUnitSpec {
  isRareElite: true;
  bonusResourceDrop: { id: string; name: string; bonusQty: number };
}

export const SECTOR_RARE_UNITS_CATALOG: Record<string, SectorRareUnitSpec> = {
  'SEC-VAL-01': {
    name: 'Autómata Áureo',
    roleTitle: 'AMENAZA RARA · ÉLITE TÉRMICO',
    spriteKey: 'valari_elite_automata_aureo',
    unitClass: 'heavy',
    isRareElite: true,
    factionStyle: 'valari',
    defenseType: 'Armor',
    speedBonus: 4,
    atkMultiplier: 1.38,
    defMultiplier: 1.45,
    hpMultiplier: 1.42,
    signatureAbilityLabel: 'Ignición de Núcleo Áureo (!)',
    combatTraitNote:
      'Prototipo de fundición de alta pureza avistado raramente en el Bastión de Vaelor. Al ser destruido libera reservas concentradas de aleación.',
    bonusResourceDrop: {
      id: 'valari_craft_t2_titanio',
      name: 'Aleación Balística',
      bonusQty: 3,
    },
  },
  'SEC-SKI-01': {
    name: 'Matriarca Albina',
    roleTitle: 'AMENAZA RARA · CEPA ALFA',
    spriteKey: 'skithid_elite_matriarca_albina',
    unitClass: 'heavy',
    isRareElite: true,
    factionStyle: 'skithid',
    defenseType: 'Evasion',
    speedBonus: 14,
    atkMultiplier: 1.4,
    defMultiplier: 1.35,
    hpMultiplier: 1.38,
    signatureAbilityLabel: 'Eclosión Neuro-Corrosiva (!)',
    combatTraitNote:
      'Espécimen progenitor de quitina blanca pura con reflejos hiper-sinápticos. Su síntesis orgánica rinde enzimas refinadas.',
    bonusResourceDrop: {
      id: 'skithid_craft_t2_enzima',
      name: 'Enzima Corrosiva',
      bonusQty: 3,
    },
  },
  'SEC-CYG-01': {
    name: 'Oráculo Cero',
    roleTitle: 'AMENAZA RARA · NODO ÉLITE',
    spriteKey: 'cygnus_elite_oraculo_cero',
    unitClass: 'heavy',
    isRareElite: true,
    factionStyle: 'cygnus',
    defenseType: 'Shields',
    speedBonus: 10,
    atkMultiplier: 1.38,
    defMultiplier: 1.46,
    hpMultiplier: 1.36,
    signatureAbilityLabel: 'Convergencia de Punto Cero (!)',
    combatTraitNote:
      'Unidad de cálculo cuántico desfasada en las órbitas de Caelum. Su núcleo intacto contiene Cristales de Cromo compilados.',
    bonusResourceDrop: {
      id: 'cygnus_craft_t2_cromo',
      name: 'Cristal de Cromo',
      bonusQty: 3,
    },
  },
  'SEC-NEU-WEST': {
    name: 'Corsario Élite',
    roleTitle: 'AMENAZA RARA · CAZADOR ORIÓN',
    spriteKey: 'orion_elite_corsario_elite',
    unitClass: 'heavy',
    isRareElite: true,
    factionStyle: 'valari',
    defenseType: 'Shields',
    speedBonus: 8,
    atkMultiplier: 1.42,
    defMultiplier: 1.44,
    hpMultiplier: 1.42,
    signatureAbilityLabel: 'Bombardeo de Canal (!)',
    combatTraitNote:
      'Comandante mercenario de la flota pirata del Corredor de Orión que transporta lingotes y vectores robados.',
    bonusResourceDrop: {
      id: 'valari_craft_t3_iridio',
      name: 'Lingote de Iridio',
      bonusQty: 3,
    },
  },
  'SEC-NEU-EAST': {
    name: 'Hidra Iridio',
    roleTitle: 'AMENAZA RARA · MUTACIÓN AETHEL',
    spriteKey: 'aethel_elite_hidra_iridio',
    unitClass: 'heavy',
    isRareElite: true,
    factionStyle: 'skithid',
    defenseType: 'Armor',
    speedBonus: 8,
    atkMultiplier: 1.45,
    defMultiplier: 1.48,
    hpMultiplier: 1.46,
    signatureAbilityLabel: 'Fusión Quitinosa Radiante (!)',
    combatTraitNote:
      'Aberración biomineral surgida en las fracturas de Aethel que cristaliza placas neutrónicas y glándulas en su interior.',
    bonusResourceDrop: {
      id: 'skithid_craft_t4_glandula',
      name: 'Glándula Mutada',
      bonusQty: 2,
    },
  },
  'SEC-NEU-01': {
    name: 'Serafín Abisal',
    roleTitle: 'AMENAZA RARA · ANOMALÍA VESPER',
    spriteKey: 'vesper_elite_serafin_abisal',
    unitClass: 'epic_boss',
    isRareElite: true,
    factionStyle: 'cygnus',
    defenseType: 'Shields',
    speedBonus: 12,
    atkMultiplier: 1.52,
    defMultiplier: 1.55,
    hpMultiplier: 1.55,
    signatureAbilityLabel: 'Pulso del Horizonte (!)',
    combatTraitNote:
      'Entidad precursora del Horizonte de Vesper cuyo colapso libera reliquias cuánticas de Grado V.',
    bonusResourceDrop: {
      id: 'cygnus_t5_nucleo_cuantico',
      name: 'Núcleo Cuántico',
      bonusQty: 2,
    },
  },
};

export interface PlanetHostileSpec {
  unitKey: string;
  planetId: string;
  sectorId: string;
  name: string;
  roleTitle: string;
  unitClass: 'light' | 'medium' | 'heavy' | 'epic_boss';
  isRareElite: boolean;
  spawnChancePct: number;
  factionStyle: FactionId;
  defenseType: DefenseType;
  level: number;
  maxHp: number;
  maxDefense: number;
  attackDamage: number;
  speed: number;
  spriteUrl: string;
  signatureAbilityLabel: string;
  combatTraitNote: string;
  rewardCredits: number;
  lootDrops: { id: string; name: string; amount: number }[];
}

/**
 * Calcula el multiplicador real de poder de un enemigo según su nivel planetario (NV. 2 a NV. 65).
 * Garantiza que un enemigo NV. 7 sea verdaderamente letal frente a un jugador NV. 2.
 */
export function computeEnemyLevelScale(enemyLevel: number): number {
  const lvlDeltaFromStarter = Math.max(0, enemyLevel - 2);
  return (
    1 +
    lvlDeltaFromStarter * 0.28 +
    Math.pow(lvlDeltaFromStarter, 1.32) * 0.11
  );
}

export function getPlanetHostilesRoster(
  planetId: string,
  sectorId: string,
  planetLoot: { id: string; name: string }[],
  planetTier: number,
  planetEnemyLevel: number,
  routingMode: ReactorRoutingMode = 'none'
): PlanetHostileSpec[] {
  const neutralTuple =
    SECTOR_NEUTRAL_UNITS_CATALOG[sectorId] ||
    SECTOR_NEUTRAL_UNITS_CATALOG['SEC-VAL-01'];

  // Orden en el Códice: 1. Ligera (47%), 2. Media (35%), 3. Pesada (15%), 4. Rara / Jefe Épico (3%)
  const lightSpec = neutralTuple[1];
  const mediumSpec = neutralTuple[0];
  const heavySpec = neutralTuple[2];
  const epicBossOverride = GALACTIC_CORE_EPIC_BOSSES[planetId];
  const rareSpec: SectorNeutralUnitSpec =
    epicBossOverride ||
    SECTOR_RARE_UNITS_CATALOG[sectorId] ||
    SECTOR_RARE_UNITS_CATALOG['SEC-VAL-01'];

  const isOrbitalActive = routingMode === 'orbital';
  const specsWithChances: {
    spec: SectorNeutralUnitSpec;
    isRare: boolean;
    chance: number;
  }[] = [
    { spec: lightSpec, isRare: false, chance: isOrbitalActive ? 45 : 47 },
    { spec: mediumSpec, isRare: false, chance: isOrbitalActive ? 34 : 35 },
    { spec: heavySpec, isRare: false, chance: 15 },
    { spec: rareSpec, isRare: true, chance: isOrbitalActive ? 6 : 3 },
  ];

  const levelScale = computeEnemyLevelScale(planetEnemyLevel);

  return specsWithChances.map(({ spec, isRare, chance }, idx) => {
    const isHeavyOrRare =
      spec.unitClass === 'heavy' || spec.unitClass === 'epic_boss' || isRare;
    const isLight = spec.unitClass === 'light' && !isRare;

    const rawBaseHp = isRare
      ? 690
      : isHeavyOrRare
        ? 590
        : isLight
          ? 380
          : 470;
    const rawBaseDef = isRare
      ? 390
      : isHeavyOrRare
        ? 330
        : isLight
          ? 195
          : 255;
    const rawBaseAtk = isRare
      ? 152
      : isHeavyOrRare
        ? 136
        : isLight
          ? 98
          : 114;

    const unitLevel = Math.max(
      1,
      planetEnemyLevel + (isRare ? 2 : isHeavyOrRare ? 1 : 0)
    );

    const maxHp = Math.round(rawBaseHp * spec.hpMultiplier * levelScale);
    const maxDefense = Math.round(rawBaseDef * spec.defMultiplier * levelScale);
    const attackDamage = Math.round(rawBaseAtk * spec.atkMultiplier * levelScale);
    const speed =
      getBaseSpeedForFaction(spec.factionStyle) + spec.speedBonus;

    // Balance de Créditos: las incursiones iniciales otorgan créditos moderados (~24-42 ₡ por unidad)
    const baseCreditValue = isRare
      ? 68
      : isHeavyOrRare
        ? 38
        : isLight
          ? 22
          : 28;
    const creditScale = 1 + (planetTier - 1) * 0.42;
    const rewardCredits = Math.round(baseCreditValue * creditScale);

    const primaryLoot =
      planetLoot[idx % Math.max(1, planetLoot.length)] ||
      planetLoot[0] || {
        id: 'valari_raw_t1_ferrita',
        name: 'Ferrita',
      };
    const baseLootQty =
      planetTier === 1 ? 5 : planetTier === 2 ? 4 : planetTier === 3 ? 3 : 2;

    const lootDrops: { id: string; name: string; amount: number }[] = [
      {
        id: primaryLoot.id,
        name: primaryLoot.name,
        amount: isRare ? baseLootQty + 4 : isHeavyOrRare ? baseLootQty + 2 : baseLootQty,
      },
    ];

    if (isRare) {
      const rareCatalogEntry =
        SECTOR_RARE_UNITS_CATALOG[sectorId] ||
        SECTOR_RARE_UNITS_CATALOG['SEC-VAL-01'];
      const secondaryPlanetLoot =
        planetLoot.length > 1 ? planetLoot[1] : rareCatalogEntry.bonusResourceDrop;
      if (secondaryPlanetLoot.id !== primaryLoot.id) {
        lootDrops.push({
          id: secondaryPlanetLoot.id,
          name: secondaryPlanetLoot.name,
          amount: Math.max(2, Math.round(baseLootQty * 0.8)),
        });
      }
      if (
        !lootDrops.some((d) => d.id === rareCatalogEntry.bonusResourceDrop.id)
      ) {
        lootDrops.push({
          id: rareCatalogEntry.bonusResourceDrop.id,
          name: rareCatalogEntry.bonusResourceDrop.name,
          amount: rareCatalogEntry.bonusResourceDrop.bonusQty,
        });
      }
    } else if (isHeavyOrRare && planetLoot.length > 1) {
      const secLoot = planetLoot[1];
      if (secLoot.id !== primaryLoot.id) {
        lootDrops.push({
          id: secLoot.id,
          name: secLoot.name,
          amount: Math.max(2, Math.round(baseLootQty * 0.6)),
        });
      }
    }

    const spriteUrl =
      UNIT_SPRITES_CATALOG[spec.spriteKey] ||
      `/assets/unidades/hero-cb-${spec.factionStyle}.webp`;

    return {
      unitKey: `${planetId}__${spec.name}`,
      planetId,
      sectorId,
      name: spec.name,
      roleTitle: spec.roleTitle,
      unitClass: spec.unitClass,
      isRareElite: isRare,
      spawnChancePct: chance,
      factionStyle: spec.factionStyle,
      defenseType: spec.defenseType,
      level: unitLevel,
      maxHp,
      maxDefense,
      attackDamage,
      speed,
      spriteUrl,
      signatureAbilityLabel: spec.signatureAbilityLabel,
      combatTraitNote: spec.combatTraitNote,
      rewardCredits,
      lootDrops,
    };
  });
}

export const NEUTRAL_FRONTIER_UNITS: [
  SquadUnitTemplate,
  SquadUnitTemplate,
  SquadUnitTemplate,
] = [
  SECTOR_NEUTRAL_UNITS_CATALOG['SEC-VAL-01'][0],
  SECTOR_NEUTRAL_UNITS_CATALOG['SEC-VAL-01'][1],
  SECTOR_NEUTRAL_UNITS_CATALOG['SEC-VAL-01'][2],
];

/**
 * 9. CATÁLOGO DE HABILIDADES DE COMBATE POR FACCIÓN
 */
export const FACTION_SKILL_LOADOUTS: Record<
  FactionId,
  Omit<CombatEquipableSkill, 'currentCooldown'>[]
> = {
  valari: [
    {
      id: 'val_skill_1',
      slotIndex: 1,
      name: 'Salva Pesada',
      role: 'damage',
      roleLabel: 'DAÑO',
      cooldownTurns: 2,
      description:
        'Artillería cinética (175% daño; aplica [SOBRECARGA] por 2T impidiendo que el objetivo recargue Escudos).',
    },
    {
      id: 'val_skill_2',
      slotIndex: 2,
      name: 'Conmoción',
      role: 'control',
      roleLabel: 'CONTROL',
      cooldownTurns: 3,
      description:
        'Impacto cinético (90% daño) que aturde 1 turno, interrumpe Cargas Pesadas (!) y expone Ruptura.',
    },
    {
      id: 'val_skill_3',
      slotIndex: 3,
      name: 'Sellar Placas',
      role: 'heal',
      roleLabel: 'RESTAURAR',
      cooldownTurns: 3,
      description:
        'Restaura +45% de Placas, +25% HP y PURGA todas las cargas de Ácido o estados negativos.',
    },
  ],
  skithid: [
    {
      id: 'ski_skill_1',
      slotIndex: 1,
      name: 'Tajo Ácido',
      role: 'damage',
      roleLabel: 'DAÑO',
      cooldownTurns: 2,
      description:
        'Tajo bioplasmático (175% daño; aplica 2 cargas de [ÁCIDO] que filtran hasta 18% de daño directo al HP).',
    },
    {
      id: 'ski_skill_2',
      slotIndex: 2,
      name: 'Neurotoxina',
      role: 'control',
      roleLabel: 'CONTROL',
      cooldownTurns: 3,
      description:
        'Veneno neural (90% daño) que paraliza 1 turno, interrumpe Cargas Pesadas (!) y aplica 1 carga de Ácido.',
    },
    {
      id: 'ski_skill_3',
      slotIndex: 3,
      name: 'Regeneración',
      role: 'heal',
      roleLabel: 'RESTAURAR',
      cooldownTurns: 3,
      description:
        'Recupera +45% de Esquiva Sináptica, +25% HP y PURGA el Marcado Lumínico u otros estados.',
    },
  ],
  cygnus: [
    {
      id: 'cyg_skill_1',
      slotIndex: 1,
      name: 'Haz Fotónico',
      role: 'damage',
      roleLabel: 'DAÑO',
      cooldownTurns: 2,
      description:
        'Haz convergente (175% daño; aplica [FIJADO] por 2T reduciendo un 50% la Evasión enemiga y +10% ATQ con Escudo >50%).',
    },
    {
      id: 'cyg_skill_2',
      slotIndex: 2,
      name: 'Prisión Fase',
      role: 'control',
      roleLabel: 'CONTROL',
      cooldownTurns: 3,
      description:
        'Desfasa al enemigo (90% daño), bloquea su turno, interrumpe Cargas Pesadas (!) y aplica [FIJADO].',
    },
    {
      id: 'cyg_skill_3',
      slotIndex: 3,
      name: 'Recarga',
      role: 'heal',
      roleLabel: 'RESTAURAR',
      cooldownTurns: 3,
      description:
        'Restaura +45% de Escudo Cuántico, +25% HP y PURGA la Sobrecarga Cinética o cargas de Ácido.',
    },
  ],
};

export function getDefenseTypeForFaction(facId: FactionId): DefenseType {
  if (facId === 'valari') return 'Armor';
  if (facId === 'skithid') return 'Evasion';
  return 'Shields';
}

export function getBaseSpeedForFaction(facId: FactionId): number {
  if (facId === 'skithid') return 118;
  if (facId === 'cygnus') return 106;
  return 96;
}

/**
 * 10. LÁMINAS DE PRESENTACIÓN DE FACCIONES (AUDITORÍA: CERO "HUMANO", ENFOQUE 100% EN HÉROE INDIVIDUAL)
 */
export interface FactionShowcasePillar {
  label: string;
  title: string;
  summary: string;
}

export interface FactionShowcaseCardConfig {
  factionId: FactionId;
  kicker: string;
  archetypeTitle: string;
  quote: string;
  fantasyPitch: string;
  signatureStyleLabel: string;
  homeworldLabel: string;
  pillars: [FactionShowcasePillar, FactionShowcasePillar, FactionShowcasePillar];
}

export const FACTION_SHOWCASE_CARDS: Record<FactionId, FactionShowcaseCardConfig> = {
  valari: {
    factionId: 'valari',
    kicker: '',
    archetypeTitle: 'El Muro de Hierro Inquebrantable',
    quote:
      '«Donde otros retroceden ante el fuego orbital, mi coraza avanza entre el acero incandescente.»',
    fantasyPitch:
      'Encarna a un Héroe acorazado e implacable. Tu doctrina consiste en absorber el castigo enemigo con tu Equipamiento de titanio, devolver el impacto con placas reactivas y aplastar sus defensas con salvas balísticas.',
    signatureStyleLabel: 'Fortificación Reactiva y Fuego de Supresión',
    homeworldLabel: 'Bastión de Vaelor · Vaelor Prime',
    pillars: [
      {
        label: 'En el Frente',
        title: 'Placas Reactivas y Sobrecarga',
        summary:
          'Tu blindaje refleja daño al atacante mientras resiste firme, y tus disparos pesados bloquean la recarga de los escudos rivales.',
      },
      {
        label: 'En el Bastión',
        title: 'Horno Termonuclear de Asedio',
        summary:
          'Ingeniería robusta que amplía instalaciones con menor gasto de materiales y obtiene +25% Créditos al desguazar en el Silo.',
      },
      {
        label: 'Tu Identidad',
        title: 'Vanguardia Implacable',
        summary:
          'Pensado para quienes disfrutan ser un bastión individual imposible de derribar que domina el desgaste táctico.',
      },
    ],
  },
  skithid: {
    factionId: 'skithid',
    kicker: '',
    archetypeTitle: 'La Marea Viva que Devora el Acero',
    quote:
      '«El blindaje más grueso de la galaxia no sirve de nada cuando el ácido ya corre por dentro de sus juntas.»',
    fantasyPitch:
      'Encarna al Depredador Alfa del Enjambre. Tu doctrina se basa en golpear primero gracias a tus reflejos sinápticos, esquivar represalias y derretir la coraza enemiga desde adentro antes de drenar su vitalidad.',
    signatureStyleLabel: 'Velocidad Letal, Toxina Acumulativa y Bio-Drenaje',
    homeworldLabel: 'Enjambre Progenitor · Kryll Prime',
    pillars: [
      {
        label: 'En el Frente',
        title: 'Ácido Quirúrgico y Frenesí',
        summary:
          'Inyectas toxinas que atraviesan la armadura directo a la salud, y devoras vitalidad cuando rompes la guardia de tu presa.',
      },
      {
        label: 'En el Enjambre',
        title: 'Biocámara de Mutación Rápida',
        summary:
          'Tu Equipamiento orgánico exige menos energía del Corazón Sináptico y tus compuestos biológicos se sintetizan a gran velocidad.',
      },
      {
        label: 'Tu Identidad',
        title: 'Depredador Alfa',
        summary:
          'Pensado para quienes buscan duelos rápidos, agresivos y letales donde la iniciativa y el veneno deciden el combate.',
      },
    ],
  },
  cygnus: {
    factionId: 'cygnus',
    kicker: '',
    archetypeTitle: 'Precisión Luminosa del Espacio-Tiempo',
    quote:
      '«No puedes esquivar un haz de luz que ya ha calculado tu posición futura antes de que decidas moverte.»',
    fantasyPitch:
      'Encarna a un Arquitecto Cuántico del Nexo. Tu doctrina domina la energía pura: barreras de fase que se regeneran cada turno y haces taquiónicos que iluminan y anulan a cualquier objetivo escurridizo.',
    signatureStyleLabel: 'Escudos Autorregenerativos y Fijación de Precisión',
    homeworldLabel: 'Nexo de Caelum · Nodo Cero',
    pillars: [
      {
        label: 'En el Frente',
        title: 'Marcado Lumínico y Resonancia',
        summary:
          'Tus disparos fijan al enemigo anulando su agilidad, mientras tus escudos cuánticos potencian tu ataque y se recargan cada turno.',
      },
      {
        label: 'En el Nexo',
        title: 'Matriz de Punto Cero',
        summary:
          'Generación superior de Megavatios para alimentar tu Equipamiento de fase y compilación cuántica capaz de conservar recursos.',
      },
      {
        label: 'Tu Identidad',
        title: 'Arquitecto del Vacío',
        summary:
          'Pensado para estrategas que prefieren el control técnico, la eficiencia energética y la precisión quirúrgica.',
      },
    ],
  },
};

/**
 * 11. TUTORIALES CONTEXTUALES POR PANTALLA (JUST-IN-TIME) CON BALIZAS NUMERADAS [1], [2], [3]
 * Se muestran únicamente la primera vez que el jugador entra a cada módulo, sin forzar un tour lineal ni dejarlo encerrado en la Arena.
 */
export interface ContextualScreenTutorial {
  screenKey: TutorialScreenKey;
  badgeLabel: string;
  title: string;
  whereToLook: string;
  narrativeIntro: string;
  beacons: [
    { number: 1; label: string; description: string },
    { number: 2; label: string; description: string },
    { number: 3; label: string; description: string },
  ];
}

export const FACTION_CONTEXTUAL_TUTORIALS: Record<
  FactionId,
  Record<TutorialScreenKey, ContextualScreenTutorial>
> = {
  valari: {
    hub: {
      screenKey: 'hub',
      badgeLabel: 'GUÍA DE PANTALLA · SALA DE GUERRA',
      title: 'Tu Centro de Mando Estratégico',
      whereToLook: 'Los bloques marcados con [1], [2] y [3]',
      narrativeIntro:
        'Bienvenido a la Sala de Guerra de la Legión Valari. Desde esta vista supervisas a tu Héroe, el planeta asignado en el Frente de Batalla y las instalaciones de tu Bastión.',
      beacons: [
        {
          number: 1,
          label: 'Estado del Héroe y Equipamiento',
          description:
            'Consulta tu Nivel actual y el grado Mk de tu Equipamiento. Puedes hacer clic sobre el nombre "Comandante" en el menú lateral para personalizar tu nombre.',
        },
        {
          number: 2,
          label: 'Frente de Batalla Activo',
          description:
            'Revisa el planeta fijado (Vaelor Prime · Tier I) y entra al Frente de Batalla para extraer tus primeros recursos y créditos.',
        },
        {
          number: 3,
          label: 'Instalaciones del Bastión',
          description:
            'Supervisa el nivel y estado de construcción de tu Horno Termonuclear, Prensa de Forja, Balística I+D y Silo.',
        },
      ],
    },
    directivas: {
      screenKey: 'directivas',
      badgeLabel: 'GUÍA DE PANTALLA · DIRECTIVAS E HITOS',
      title: 'Misiones Guiadas y Logros de Campaña',
      whereToLook: 'Directivas Operativas [1], Recompensas [2] y Registros de Hitos [3]',
      narrativeIntro:
        'Las Directivas Operativas te guían paso a paso desde Nivel 1 y te recompensan con Créditos (₡) al completar objetivos reales en el Frente y en la Base.',
      beacons: [
        {
          number: 1,
          label: 'Directivas Operativas Guiadas',
          description:
            'Sigue estas misiones en orden para aprender el flujo completo entre combate, forja y reactor.',
        },
        {
          number: 2,
          label: 'Reclamar Recompensas en Créditos',
          description:
            'Cuando completes una directiva, pulsa el botón verde para recibir sus Créditos (₡) al instante.',
        },
        {
          number: 3,
          label: 'Registros de Hitos (Logros)',
          description:
            'Rastrea tu progreso a largo plazo en combate, industria y exploración estelar.',
        },
      ],
    },
    ciudadela_reactor: {
      screenKey: 'ciudadela_reactor',
      badgeLabel: 'GUÍA DE PANTALLA · HORNO TERMONUCLEAR',
      title: 'Energía de Red y Protocolos del Reactor',
      whereToLook: 'Indicadores [1] Distribución, [2] Cámara Central y [3] Protocolos',
      narrativeIntro:
        'El Horno Termonuclear alimenta tus instalaciones y el Equipamiento de tu Héroe. Si dejas energía libre en la red, puedes encender un Protocolo para obtener ventajas.',
      beacons: [
        {
          number: 1,
          label: 'Balance de Red y Regulador de Equipamiento',
          description:
            'En los primeros niveles puedes poner 1 o 2 piezas de tu Equipamiento en modo Ahorro para liberar Megavatios (MW) y activar un Protocolo.',
        },
        {
          number: 2,
          label: 'Cámara del Horno Termonuclear',
          description:
            'Subir de nivel el Reactor genera más MW y te permite mejorar el resto de instalaciones de tu base al siguiente nivel.',
        },
        {
          number: 3,
          label: 'Protocolos (Industrial 15 MW · Orbital 20 MW · Bélico 28 MW)',
          description:
            'Activa el protocolo que necesites según tu objetivo: fabricar más barato, obtener más botín o potenciar tu ataque y defensa.',
        },
      ],
    },
    ciudadela_forja: {
      screenKey: 'ciudadela_forja',
      badgeLabel: 'GUÍA DE PANTALLA · PRENSA DE FORJA',
      title: 'Mejorar tu Equipamiento y Fabricar Aleaciones',
      whereToLook: 'Pestañas superiores [1], Recetas y Equipamiento [2] y Nivel de Forja [3]',
      narrativeIntro:
        'Aquí refinas los minerales extraídos en combate y mejoras el Equipamiento de tu Héroe (Arma, Coraza, Casco, Guanteletes y Botas) de Mk-I hasta Mk-V.',
      beacons: [
        {
          number: 1,
          label: 'Pestañas: Compuestos y Equipamiento',
          description:
            'Alterna entre fundir minerales en aleaciones avanzadas o mejorar directamente el Equipamiento de tu Héroe.',
        },
        {
          number: 2,
          label: 'Evolución Mk-I a Mk-V',
          description:
            'Cada mejora de pieza sube las estadísticas y el Nivel de tu Héroe, aumentando también su consumo de MW en el Reactor.',
        },
        {
          number: 3,
          label: 'Ampliar Nivel de la Prensa',
          description:
            'Mejora la instalación para desbloquear recetas de mayor Tier. Con el Protocolo Industrial activo ahorras un 20% de tiempo y 10% de Créditos.',
        },
      ],
    },
    ciudadela_laboratorio: {
      screenKey: 'ciudadela_laboratorio',
      badgeLabel: 'GUÍA DE PANTALLA · BALÍSTICA I+D',
      title: 'Investigaciones Permanentes',
      whereToLook: 'Módulo de I+D [1], Proyectos [2] y Bonificaciones Activas [3]',
      narrativeIntro:
        'Las tecnologías investigadas en Balística I+D mejoran de forma permanente la energía de tu Reactor, la capacidad de tu Silo y el poder de tu Héroe.',
      beacons: [
        {
          number: 1,
          label: 'Módulo de Laboratorio',
          description:
            'Sube de nivel esta instalación para poder investigar rangos superiores en cada proyecto.',
        },
        {
          number: 2,
          label: 'Proyectos de Investigación',
          description:
            'Invierte minerales y Créditos en Conductores (+15 MW al Reactor) o Aleaciones de Choque (+8% poder de Chasis).',
        },
        {
          number: 3,
          label: 'Bonificaciones Acumuladas',
          description:
            'Consulta en la esquina superior derecha el resumen total de mejoras científicas activas en tu Bastión.',
        },
      ],
    },
    ciudadela_almacen: {
      screenKey: 'ciudadela_almacen',
      badgeLabel: 'GUÍA DE PANTALLA · SILO ACORAZADO',
      title: 'Inventario de Recursos y Desguace por Créditos',
      whereToLook: 'Capacidad de Volumen [1], Filtros y Ranuras [2] y Ampliar Silo [3]',
      narrativeIntro:
        'El Silo Acorazado guarda todos los minerales y componentes que recolectas. Gracias a la doctrina Valari, obtienes un +25% extra de Créditos (₡) al reciclar excedentes.',
      beacons: [
        {
          number: 1,
          label: 'Volumen y Ocupación del Silo',
          description:
            'Vigila el espacio ocupado para no perder botín tras tus incursiones en el Frente de Batalla.',
        },
        {
          number: 2,
          label: 'Filtros y Desguace de Materiales',
          description:
            'Haz clic sobre cualquier recurso almacenado para ver su detalle o desguazarlo a cambio de Créditos (₡) inmediatos.',
        },
        {
          number: 3,
          label: 'Ampliar Silo Acorazado',
          description:
            'Usa este botón para subir de nivel el Silo y aumentar tanto el volumen máximo como el número de ranuras.',
        },
      ],
    },
    comandante: {
      screenKey: 'comandante',
      badgeLabel: 'GUÍA DE PANTALLA · HÉROE Y CHASIS',
      title: 'Expediente del Héroe y Esquema de Chasis',
      whereToLook: 'Telemetría Global [1], Esquema Central [2] y 5 Piezas de Chasis [3]',
      narrativeIntro:
        'En esta pantalla inspeccionas las 5 piezas equipadas de tu Héroe y cómo se conectan con su blindaje y armamento.',
      beacons: [
        {
          number: 1,
          label: 'Telemetría Global de Combate',
          description:
            'Revisa tu Salud, Blindaje y Ataque totales. Mientras tu Blindaje supere el 30% en combate, devuelves un 15% del daño recibido.',
        },
        {
          number: 2,
          label: 'Esquema Biométrico y Consumo MW',
          description:
            'Pasa el cursor o selecciona cualquier pieza para iluminar su zona en el Héroe y ver la carga total de MW.',
        },
        {
          number: 3,
          label: 'Las 5 Piezas del Chasis',
          description:
            'Selecciona una pieza para fijarla o pulsa "Evolucionar Chasis en Forja" arriba a la derecha para mejorar su grado Mk.',
        },
      ],
    },
    exploracion: {
      screenKey: 'exploracion',
      badgeLabel: 'GUÍA DE PANTALLA · MAPA ESTELAR',
      title: 'Navegación por Sectores (Tier I a Tier V)',
      whereToLook: 'Mapa de Sectores [1], Órbitas Planetarias [2] y Regiones Bloqueadas [3]',
      narrativeIntro:
        'El Mapa Estelar organiza los planetas de menor a mayor dificultad desde TIER I hasta TIER V.',
      beacons: [
        {
          number: 1,
          label: 'Bastión de Vaelor (Tiers I a III)',
          description:
            'Haz clic en tu sector natal para ver sus órbitas. Empieza en Vaelor Prime (Tier I · Nv. 1) para recolectar Ferrita y Titanio.',
        },
        {
          number: 2,
          label: 'Corredor de Orión (Tiers IV a V)',
          description:
            'Cuando mejores tu equipo a Mk-II y Mk-III, viaja a este sector en disputa para obtener recursos de Tier IV y V.',
        },
        {
          number: 3,
          label: 'Sectores con Anomalía Letal',
          description:
            'Los sectores exteriores muestran alerta roja de interferencia gravitacional y se desbloquearán en futuras expansiones.',
        },
      ],
    },
    exploracion_hostiles: {
      screenKey: 'exploracion_hostiles',
      badgeLabel: 'GUÍA DE PANTALLA · ARCHIVO DE HOSTILES',
      title: 'Dossier Planetario y Amenazas Raras',
      whereToLook: 'Mundos del Sector [1], Dossier de Hostiles [2] y Amenaza Rara [3]',
      narrativeIntro:
        'El Archivo de Hostiles cataloga las 4 unidades que habitan cada planeta (Ligera, Media, Pesada y Rara) junto con su porcentaje de aparición y botín.',
      beacons: [
        {
          number: 1,
          label: 'Tarjetas de Planetas y Progreso',
          description:
            'Selecciona cualquier mundo para abrir el expediente de sus 4 amenazas locales y ver cuántas has identificado.',
        },
        {
          number: 2,
          label: 'Siluetas Bloqueadas y Desbloqueo en Combate',
          description:
            'Los enemigos aparecen en silueta negra hasta que los enfrentas personalmente en el Frente de Batalla.',
        },
        {
          number: 3,
          label: 'Amenaza Rara (3% · 6% con Protocolo Orbital)',
          description:
            'Cada planeta oculta un enemigo raro de élite con recompensas multiplicadas de materiales y Créditos (₡).',
        },
      ],
    },
    combate: {
      screenKey: 'combate',
      badgeLabel: 'GUÍA DE PANTALLA · FRENTE DE BATALLA',
      title: 'Combate por Turnos y Uso de Habilidades',
      whereToLook: 'Cola de Turnos y Barras [1], Habilidades [2] y Velocidad [3]',
      narrativeIntro:
        'En los planetas de Tier I te enfrentas a patrullas individuales para dominar tus habilidades. En Tiers superiores combatirás contra escuadrones completos.',
      beacons: [
        {
          number: 1,
          label: 'Barras de Defensa y Cola de Turnos',
          description:
            'Haz clic sobre un enemigo para fijarlo como objetivo. Al vaciar su barra superior de defensa le causas Ruptura (+50% daño crítico recibido).',
        },
        {
          number: 2,
          label: 'Habilidades [B, 1, 2, 3]',
          description:
            '[1] Salva Pesada impide que el enemigo recargue escudos; [2] Conmoción cancela sus ataques cargados (!); [3] Sellar Placas repara tu blindaje y limpia el ácido.',
        },
        {
          number: 3,
          label: 'Velocidad (x1 / x2 / x3) y Auto IA',
          description:
            'Acelera los combates a x2 o x3 en la barra superior o activa el piloto automático cuando quieras recolectar recursos más rápido.',
        },
      ],
    },
  },
  skithid: {
    hub: {
      screenKey: 'hub',
      badgeLabel: 'GUÍA DE PANTALLA · CÁMARA SINÁPTICA',
      title: 'Centro de Mando de El Enjambre',
      whereToLook: 'Los bloques marcados con [1], [2] y [3]',
      narrativeIntro:
        'Bienvenido a la Cámara Sináptica. Desde aquí supervisas la evolución de tu Héroe Skithid, el planeta activo de caza y los órganos de El Enjambre.',
      beacons: [
        {
          number: 1,
          label: 'Estado del Héroe y Equipamiento',
          description:
            'Empiezas en Nivel 1 con la mayor Velocidad de iniciativa (118 SPD). Haz clic en "Comandante" en el menú lateral para elegir tu propio nombre.',
        },
        {
          number: 2,
          label: 'Frente de Batalla Activo',
          description:
            'Revisa el planeta fijado (Kryll Prime · Tier I) y salta al Frente de Batalla para cosechar tu primera Quitina y Esporas.',
        },
        {
          number: 3,
          label: 'Órganos de El Enjambre',
          description:
            'Supervisa el nivel y tiempos de evolución del Corazón Sináptico, Biocámara, Génesis Evolutiva y Fosa.',
        },
      ],
    },
    directivas: {
      screenKey: 'directivas',
      badgeLabel: 'GUÍA DE PANTALLA · DIRECTIVAS E HITOS',
      title: 'Misiones Guiadas y Logros Evolutivos',
      whereToLook: 'Directivas Operativas [1], Recompensas [2] y Registros de Hitos [3]',
      narrativeIntro:
        'Completa las Directivas Operativas para guiar la expansión de El Enjambre desde Nivel 1 y obtener Créditos (₡).',
      beacons: [
        {
          number: 1,
          label: 'Directivas Operativas Guiadas',
          description:
            'Cada directiva te conduce al módulo exacto que necesitas para avanzar.',
        },
        {
          number: 2,
          label: 'Reclamar Recompensas',
          description:
            'Recoge los Créditos (₡) de cada misión completada para financiar tus mutaciones.',
        },
        {
          number: 3,
          label: 'Registros de Hitos (Logros)',
          description:
            'Consulta tus hitos permanentes de caza, síntesis y expansión galáctica.',
        },
      ],
    },
    ciudadela_reactor: {
      screenKey: 'ciudadela_reactor',
      badgeLabel: 'GUÍA DE PANTALLA · CORAZÓN SINÁPTICO',
      title: 'Red Bio-Eléctrica y Protocolos de Reserva',
      whereToLook: 'Indicadores [1] Distribución, [2] Órgano Central y [3] Protocolos',
      narrativeIntro:
        'El Corazón Sináptico alimenta a todo El Enjambre. Tu Equipamiento consume un 12% menos de MW por doctrina, y la energía libre te permite activar Protocolos.',
      beacons: [
        {
          number: 1,
          label: 'Regulador de Equipamiento (Modo Ahorro)',
          description:
            'En niveles bajos puedes poner 1 o 2 piezas en Ahorro para liberar los MW necesarios y encender un Protocolo.',
        },
        {
          number: 2,
          label: 'Corazón Sináptico Central',
          description:
            'Subir de nivel este órgano central genera más MW y desbloquea el siguiente nivel para tus demás instalaciones.',
        },
        {
          number: 3,
          label: 'Protocolos (Industrial 15 MW · Orbital 20 MW · Bélico 28 MW)',
          description:
            'Elige qué ventaja activar con tus MW Libres: síntesis más rápida, más botín o mayor potencia de ataque y defensa.',
        },
      ],
    },
    ciudadela_forja: {
      screenKey: 'ciudadela_forja',
      badgeLabel: 'GUÍA DE PANTALLA · BIOCÁMARA MUTANTE',
      title: 'Mutar tu Equipamiento y Destilar Enzimas',
      whereToLook: 'Pestañas superiores [1], Recetas y Equipamiento [2] y Nivel de Biocámara [3]',
      narrativeIntro:
        'En la Biocámara Mutante usas Quitina y Esporas Ácidas para evolucionar el Equipamiento de tu Héroe un 25% más rápido gracias a tu doctrina.',
      beacons: [
        {
          number: 1,
          label: 'Pestañas: Compuestos y Equipamiento',
          description:
            'Alterna entre destilar compuestos biológicos (Enzimas y Caparazones) o evolucionar el Equipamiento de tu Héroe.',
        },
        {
          number: 2,
          label: 'Evolución Mk-I a Mk-V',
          description:
            'Mejorar cada pieza incrementa el Nivel de tu Héroe, su daño corrosivo y su Esquiva Sináptica.',
        },
        {
          number: 3,
          label: 'Ampliar Biocámara Mutante',
          description:
            'Sube de nivel la instalación para desbloquear recetas de Tier superior.',
        },
      ],
    },
    ciudadela_laboratorio: {
      screenKey: 'ciudadela_laboratorio',
      badgeLabel: 'GUÍA DE PANTALLA · GÉNESIS EVOLUTIVA',
      title: 'Mejoras Genéticas Permanentes',
      whereToLook: 'Módulo de Génesis [1], Cepas [2] y Bonificaciones Activas [3]',
      narrativeIntro:
        'En Génesis Evolutiva desbloqueas mejoras permanentes para la producción de MW, la capacidad de la Fosa de Biomasa y el poder de tu Héroe.',
      beacons: [
        {
          number: 1,
          label: 'Módulo de Génesis Evolutiva',
          description:
            'Amplía este órgano para habilitar niveles superiores de investigación genética.',
        },
        {
          number: 2,
          label: 'Proyectos de Evolución',
          description:
            'Investiga Ganglios Superconductores (+15 MW al Reactor) e Hipertrofia Sináptica (+8% poder de Chasis).',
        },
        {
          number: 3,
          label: 'Bonificaciones Acumuladas',
          description:
            'Revisa arriba a la derecha todas las mejoras pasivas que ya están activas en El Enjambre.',
        },
      ],
    },
    ciudadela_almacen: {
      screenKey: 'ciudadela_almacen',
      badgeLabel: 'GUÍA DE PANTALLA · FOSA DE BIOMASA',
      title: 'Reserva Orgánica y Reciclaje por Créditos',
      whereToLook: 'Volumen de Biomasa [1], Categorías y Ranuras [2] y Ampliar Fosa [3]',
      narrativeIntro:
        'La Fosa de Biomasa conserva la Quitina, Esporas y órganos recolectados en combate para usarlos en la Biocámara o reciclarlos por Créditos (₡).',
      beacons: [
        {
          number: 1,
          label: 'Volumen y Capacidad',
          description:
            'Comprueba cuánto espacio libre tienes antes de lanzar nuevas incursiones planetarias.',
        },
        {
          number: 2,
          label: 'Categorías y Desguace',
          description:
            'Selecciona cualquier recurso en las ranuras para inspeccionarlo o convertir excedentes en Créditos (₡).',
        },
        {
          number: 3,
          label: 'Ampliar Fosa de Biomasa',
          description:
            'Mejora el nivel de la Fosa para ampliar su capacidad máxima y desbloquear más ranuras.',
        },
      ],
    },
    comandante: {
      screenKey: 'comandante',
      badgeLabel: 'GUÍA DE PANTALLA · HÉROE Y CHASIS',
      title: 'Anatomía del Héroe y Esquema Bio-Eléctrico',
      whereToLook: 'Telemetría Global [1], Esquema Central [2] y 5 Piezas de Chasis [3]',
      narrativeIntro:
        'Aquí revisas los atributos de combate de tu Héroe Skithid y el consumo reducido (-12% MW) de sus 5 piezas orgánicas.',
      beacons: [
        {
          number: 1,
          label: 'Telemetría Global y Evasión',
          description:
            'Consulta tu Salud, Esquiva y Ataque. Además de tu barra verde de guardia, tienes probabilidad de esquivar ataques por completo.',
        },
        {
          number: 2,
          label: 'Esquema Biométrico y Tensión MW',
          description:
            'Selecciona cualquier pieza para iluminar su zona anatómica en el Héroe y verificar el uso de energía.',
        },
        {
          number: 3,
          label: 'Las 5 Piezas Bio-Orgánicas',
          description:
            'Inspecciona cada pieza equipada o pulsa "Evolucionar Chasis en Forja" para subir su grado Mk.',
        },
      ],
    },
    exploracion: {
      screenKey: 'exploracion',
      badgeLabel: 'GUÍA DE PANTALLA · MAPA ESTELAR',
      title: 'Caza por Sectores (Tier I a Tier V)',
      whereToLook: 'Sectores Activos [1], Órbitas Planetarias [2] y Regiones Bloqueadas [3]',
      narrativeIntro:
        'Los planetas se ordenan de menor a mayor amenaza desde TIER I hasta TIER V.',
      beacons: [
        {
          number: 1,
          label: 'Sector Progenitor (Tiers I a III)',
          description:
            'Empieza en Kryll Prime (Tier I · Nv. 1) recolectando Quitina y Esporas Ácidas antes de avanzar a los mundos de Tier II y III.',
        },
        {
          number: 2,
          label: 'Corredor de Orión (Tiers IV a V)',
          description:
            'Sector neutral en disputa donde podrás extraer recursos avanzados de Tier IV y V.',
        },
        {
          number: 3,
          label: 'Sectores con Anomalía Letal',
          description:
            'Las regiones exteriores están bloqueadas por tormentas gravitacionales y se abrirán en próximas actualizaciones.',
        },
      ],
    },
    exploracion_hostiles: {
      screenKey: 'exploracion_hostiles',
      badgeLabel: 'GUÍA DE PANTALLA · CÓDICE XENOBIOLÓGICO',
      title: 'Especies por Planeta y Cepas Raras',
      whereToLook: 'Mundos de Caza [1], Expediente de Presas [2] y Especie Rara [3]',
      narrativeIntro:
        'El Códice Xenobiológico registra las 4 unidades presentes en cada mundo junto a su probabilidad de aparición y biomasa extraíble.',
      beacons: [
        {
          number: 1,
          label: 'Selección de Mundo',
          description:
            'Haz clic en cualquier planeta para inspeccionar su ecosistema de unidades ligeras, medias, pesadas y raras.',
        },
        {
          number: 2,
          label: 'Identificación en el Frente',
          description:
            'Las presas permanecen en silueta oscura hasta que tu Héroe las enfrenta en el Frente de Batalla.',
        },
        {
          number: 3,
          label: 'Amenaza Rara de Élite',
          description:
            'Las cepas raras tienen un 3% de aparición base (6% con Protocolo Orbital) y entregan gran cantidad de recursos.',
        },
      ],
    },
    combate: {
      screenKey: 'combate',
      badgeLabel: 'GUÍA DE PANTALLA · FRENTE DE BATALLA',
      title: 'Ácido Acumulativo, Drenaje y Velocidad',
      whereToLook: 'Cola de Turnos y Barras [1], Habilidades [2] y Velocidad [3]',
      narrativeIntro:
        'Tu Héroe Skithid suele actuar primero gracias a su alta velocidad. Acumula cargas de ácido para atravesar el blindaje rival y recupera vida al romper su guardia.',
      beacons: [
        {
          number: 1,
          label: 'Cargas de [ÁCIDO x1..3] y Cola de Turnos',
          description:
            'Cada impacto aplica Ácido (máx. 3 cargas) que filtra hasta un 18% de daño directo a la salud enemiga ignorando su blindaje.',
        },
        {
          number: 2,
          label: 'Habilidades [B, 1, 2, 3]',
          description:
            '[1] Tajo Ácido aplica 2 cargas de veneno; [2] Neurotoxina cancela ataques cargados (!); [3] Regeneración cura y limpia estados negativos.',
        },
        {
          number: 3,
          label: 'Velocidad (x1 / x2 / x3) y Auto IA',
          description:
            'Usa los controles superiores para acelerar el ritmo de los turnos a x2 o x3.',
        },
      ],
    },
  },
  cygnus: {
    hub: {
      screenKey: 'hub',
      badgeLabel: 'GUÍA DE PANTALLA · CÁMARA DE MANDO',
      title: 'Sincronización Estratégica de El Nexo',
      whereToLook: 'Los bloques marcados con [1], [2] y [3]',
      narrativeIntro:
        'Bienvenido a la Cámara de Mando de El Nexo Cygnus. Aquí supervisas a tu Héroe, el mundo activo de incursión y las instalaciones cuánticas.',
      beacons: [
        {
          number: 1,
          label: 'Estado del Héroe y Equipamiento',
          description:
            'Empiezas en Nivel 1 con Escudos de Fase autorregenerativos. Haz clic en "Comandante" en el menú lateral para personalizar tu nombre.',
        },
        {
          number: 2,
          label: 'Frente de Batalla Activo',
          description:
            'Revisa el planeta capital fijado (Nodo Cero · Tier I) y salta al Frente de Batalla para extraer Silicio y Cromo.',
        },
        {
          number: 3,
          label: 'Instalaciones de El Nexo',
          description:
            'Supervisa el nivel y tiempos de compilación de tu Matriz Punto Cero, Compilador, Nexo de Algoritmos y Bóveda.',
        },
      ],
    },
    directivas: {
      screenKey: 'directivas',
      badgeLabel: 'GUÍA DE PANTALLA · DIRECTIVAS E HITOS',
      title: 'Directivas Operativas y Hitos Cuánticos',
      whereToLook: 'Directivas Operativas [1], Recompensas [2] y Registros de Hitos [3]',
      narrativeIntro:
        'Las Directivas Operativas estructuran tu progresión desde Nivel 1 y te otorgan Créditos (₡) al cumplir objetivos clave.',
      beacons: [
        {
          number: 1,
          label: 'Directivas Operativas Guiadas',
          description:
            'Sigue las directivas activas para orientar tus primeras incursiones y mejoras.',
        },
        {
          number: 2,
          label: 'Reclamar Recompensas',
          description:
            'Pulsa sobre las directivas completadas para transferir sus Créditos (₡) a tu cuenta.',
        },
        {
          number: 3,
          label: 'Registros de Hitos (Logros)',
          description:
            'Verifica el avance de tus logros técnicos, militares y de cartografía.',
        },
      ],
    },
    ciudadela_reactor: {
      screenKey: 'ciudadela_reactor',
      badgeLabel: 'GUÍA DE PANTALLA · MATRIZ PUNTO CERO',
      title: 'Flujo de Punto Cero y Protocolos de Reserva',
      whereToLook: 'Indicadores [1] Distribución, [2] Matriz Central y [3] Protocolos',
      narrativeIntro:
        'Tu Matriz Punto Cero genera un +15% adicional de Megavatios (MW) por nivel. Usa tus MW Libres para encender Protocolos de bonificación.',
      beacons: [
        {
          number: 1,
          label: 'Regulador de Equipamiento (Modo Ahorro)',
          description:
            'Si necesitas liberar MW en los primeros niveles, pon 1 o 2 piezas de tu Equipamiento en modo Ahorro para activar un Protocolo.',
        },
        {
          number: 2,
          label: 'Esfera de Singularidad Central',
          description:
            'Mejorar la Matriz Punto Cero aumenta tu producción de MW y eleva el límite de nivel para tus demás instalaciones.',
        },
        {
          number: 3,
          label: 'Protocolos (Industrial 15 MW · Orbital 20 MW · Bélico 28 MW)',
          description:
            'Elige qué protocolo activar con tus MW Libres: compilación más rápida, más botín o mayor potencia de combate.',
        },
      ],
    },
    ciudadela_forja: {
      screenKey: 'ciudadela_forja',
      badgeLabel: 'GUÍA DE PANTALLA · COMPILADOR CUÁNTICO',
      title: 'Evolucionar tu Equipamiento y Compilar Cristales',
      whereToLook: 'Pestañas superiores [1], Recetas y Equipamiento [2] y Nivel de Compilador [3]',
      narrativeIntro:
        'En el Compilador Cuántico procesas Silicio y Cromo para mejorar tu Equipamiento, con un 25% de probabilidad pasiva de no gastar materiales al fabricar compuestos.',
      beacons: [
        {
          number: 1,
          label: 'Pestañas: Compuestos y Equipamiento',
          description:
            'Alterna entre compilar Cristales de Cromo y Vectores Fotónicos o mejorar el Equipamiento de tu Héroe.',
        },
        {
          number: 2,
          label: 'Evolución Mk-I a Mk-V',
          description:
            'Cada mejora de grado Mk aumenta tus Escudos de Fase, tu ataque energético y el Nivel de tu Héroe.',
        },
        {
          number: 3,
          label: 'Ampliar Compilador Cuántico',
          description:
            'Sube de nivel la instalación para desbloquear recetas y evoluciones de mayor Tier.',
        },
      ],
    },
    ciudadela_laboratorio: {
      screenKey: 'ciudadela_laboratorio',
      badgeLabel: 'GUÍA DE PANTALLA · NEXO DE ALGORITMOS',
      title: 'Investigaciones Cuánticas Permanentes',
      whereToLook: 'Módulo del Nexo [1], Algoritmos [2] y Bonificaciones Activas [3]',
      narrativeIntro:
        'El Nexo de Algoritmos mejora de forma permanente la generación de MW, la capacidad de la Bóveda de Fase y la potencia de tu Equipamiento.',
      beacons: [
        {
          number: 1,
          label: 'Módulo del Nexo de Algoritmos',
          description:
            'Sube el nivel de esta instalación para desbloquear nuevos rangos en los 4 proyectos científicos.',
        },
        {
          number: 2,
          label: 'Proyectos de Investigación',
          description:
            'Investiga Conductores Cuánticos (+15 MW base al Reactor) y Armonía de Fase (+8% poder de Equipamiento).',
        },
        {
          number: 3,
          label: 'Bonificaciones Acumuladas',
          description:
            'Consulta en la barra superior el total de bonos científicos activos.',
        },
      ],
    },
    ciudadela_almacen: {
      screenKey: 'ciudadela_almacen',
      badgeLabel: 'GUÍA DE PANTALLA · BÓVEDA DE FASE',
      title: 'Almacenamiento Cuántico y Conversión en Créditos',
      whereToLook: 'Volumen de Bóveda [1], Categorías y Ranuras [2] y Ampliar Bóveda [3]',
      narrativeIntro:
        'La Bóveda de Fase almacena el Silicio, Cromo y Fotones recolectados en tus despliegues, permitiéndote reciclar excedentes por Créditos (₡).',
      beacons: [
        {
          number: 1,
          label: 'Volumen y Capacidad',
          description:
            'Supervisa el volumen ocupado para asegurar espacio antes de viajar al Mapa Estelar.',
        },
        {
          number: 2,
          label: 'Filtros y Desguace por Créditos',
          description:
            'Haz clic en cualquier material almacenado para ver sus detalles o desguazar unidades a cambio de Créditos (₡).',
        },
        {
          number: 3,
          label: 'Ampliar Bóveda de Fase',
          description:
            'Sube de nivel la Bóveda para incrementar la capacidad máxima y las ranuras disponibles.',
        },
      ],
    },
    comandante: {
      screenKey: 'comandante',
      badgeLabel: 'GUÍA DE PANTALLA · HÉROE Y EQUIPAMIENTO',
      title: 'Expediente del Héroe y Escudos de Fase',
      whereToLook: 'Telemetría Global [1], Esquema Central [2] y Equipamiento [3]',
      narrativeIntro:
        'Inspecciona las estadísticas de tu Héroe Cygnus y el estado energético de su Equipamiento cuántico.',
      beacons: [
        {
          number: 1,
          label: 'Telemetría Global y Escudos',
          description:
            'Tu Escudo se regenera cada turno y te otorga +10% de Ataque mientras se mantenga por encima del 50%.',
        },
        {
          number: 2,
          label: 'Esquema Biométrico y Coherencia MW',
          description:
            'Selecciona cualquier pieza para iluminar su posición en el Héroe y revisar el presupuesto de MW.',
        },
        {
          number: 3,
          label: 'Piezas de Equipamiento',
          description:
            'Haz clic en una pieza para inspeccionarla o pulsa "Evolucionar Equipamiento en Forja" para subir su grado Mk.',
        },
      ],
    },
    exploracion: {
      screenKey: 'exploracion',
      badgeLabel: 'GUÍA DE PANTALLA · MAPA ESTELAR',
      title: 'Cartografía por Sectores (Tier I a Tier V)',
      whereToLook: 'Sectores Activos [1], Órbitas Tier I–V [2] y Regiones Bloqueadas [3]',
      narrativeIntro:
        'Explora desde tu sector natal en TIER I hasta la frontera en disputa en TIER V.',
      beacons: [
        {
          number: 1,
          label: 'Nexo de Caelum (Tiers I a III)',
          description:
            'Empieza en Nodo Cero (Tier I · Nv. 1) para recolectar Silicio y Cromo.',
        },
        {
          number: 2,
          label: 'Corredor de Orión (Tiers IV a V)',
          description:
            'Sector neutral en disputa donde obtendrás materiales avanzados de Tier IV y V.',
        },
        {
          number: 3,
          label: 'Sectores con Anomalía Letal',
          description:
            'Los sectores exteriores muestran alerta roja de señal corrupta y se desbloquearán en futuras expansiones.',
        },
      ],
    },
    combate: {
      screenKey: 'combate',
      badgeLabel: 'GUÍA DE PANTALLA · FRENTE DE BATALLA',
      title: 'Marcado Lumínico, Escudos y Velocidad',
      whereToLook: 'Cola de Turnos y Barras [1], Habilidades [2] y Velocidad [3]',
      narrativeIntro:
        'Tus disparos fijan a los enemigos ágiles para reducir su evasión y tu barra azul de Escudo se recarga automáticamente al inicio de tu turno.',
      beacons: [
        {
          number: 1,
          label: 'Escudo de Fase y Estado [FIJADO]',
          description:
            'Al golpear aplicas [FIJADO] por 2 turnos, reduciendo a la mitad la Evasión del objetivo.',
        },
        {
          number: 2,
          label: 'Habilidades [B, 1, 2, 3]',
          description:
            '[1] Haz Fotónico inflige gran daño y fija al rival; [2] Prisión Fase cancela ataques cargados (!); [3] Recarga restaura tu escudo y limpia estados negativos.',
        },
        {
          number: 3,
          label: 'Velocidad (x1 / x2 / x3) y Auto IA',
          description:
            'Cambia la velocidad del combate en la esquina superior derecha para jugar a tu propio ritmo.',
        },
      ],
    },
    exploracion_hostiles: {
      screenKey: 'exploracion_hostiles',
      badgeLabel: 'REGISTRO DE AMENAZAS · CÓDICE DE HOSTILES',
      title: 'Telemetría de Hostiles y Probabilidad de Aparición',
      whereToLook: 'Tarjetas de Mundo [1], Frecuencia de Aparición [2] y Siluetas Bloqueadas [3]',
      narrativeIntro:
        'Consulta los expedientes de inteligencia de cada órbita para conocer las probabilidades de aparición (%) y el botín extraíble de cada amenaza.',
      beacons: [
        {
          number: 1,
          label: 'Expedientes por Planeta',
          description:
            'Selecciona cualquier mundo para abrir el desglose de unidades ligeras, medias, pesadas y amenazas raras que habitan su órbita.',
        },
        {
          number: 2,
          label: '% de Aparición y Amenazas Raras',
          description:
            'Cada enemigo aparece dinámicamente según su porcentaje. Activar el Protocolo Orbital en el Reactor incrementa la aparición de enemigos raros.',
        },
        {
          number: 3,
          label: 'Identificación en Combate',
          description:
            'Los hostiles desconocidos permanecen en silueta negra hasta que te enfrentes a ellos en el Frente de Batalla.',
        },
      ],
    },
  },
};

// Sincronizar guía de exploracion_hostiles en Valari y Skithid
FACTION_CONTEXTUAL_TUTORIALS.valari.exploracion_hostiles =
  FACTION_CONTEXTUAL_TUTORIALS.cygnus.exploracion_hostiles;
FACTION_CONTEXTUAL_TUTORIALS.skithid.exploracion_hostiles =
  FACTION_CONTEXTUAL_TUTORIALS.cygnus.exploracion_hostiles;

/**
 * 12. DIRECTIVAS OPERATIVAS GUIADAS Y LOGROS HARD SCI-FI (SALA DE GUERRA)
 */
export interface DirectiveTemplate {
  id: string;
  code: string;
  title: string;
  description: string;
  targetTab: ModuleTab;
  actionLabel: string;
  rewardCredits: number;
}

export const OPERATIONAL_DIRECTIVES_CATALOG: DirectiveTemplate[] = [
  {
    id: 'dir_first_sortie',
    code: 'DIR-01 · RECONOCIMIENTO ORBITAL',
    title: 'Asegura una Oleada en el Frente de Batalla',
    description:
      'Despliega en tu mundo inicial de Tier I y neutraliza al menos 1 oleada hostil para extraer tus primeros materiales y créditos.',
    targetTab: 'combate',
    actionLabel: 'Ir al Frente de Batalla',
    rewardCredits: 80,
  },
  {
    id: 'dir_upgrade_chassis',
    code: 'DIR-02 · CALIBRACIÓN DE EQUIPAMIENTO',
    title: 'Evoluciona cualquier pieza de tu Héroe a Grado Mk-II',
    description:
      'Usa los materiales recolectados en la Forja para subir de nivel tu Arma o Coraza.',
    targetTab: 'ciudadela_forja',
    actionLabel: 'Abrir Forja de Equipamiento',
    rewardCredits: 110,
  },
  {
    id: 'dir_reactor_protocol',
    code: 'DIR-03 · GESTIÓN DE RESERVA MW',
    title: 'Activa un Protocolo de Reserva o Amplía el Reactor a Nv. 2',
    description:
      'Libera MW con el Regulador de Equipamiento para encender un Protocolo (Industrial, Orbital o Bélico) o amplía el Reactor.',
    targetTab: 'ciudadela_reactor',
    actionLabel: 'Inspeccionar Reactor',
    rewardCredits: 130,
  },
  {
    id: 'dir_craft_alloy',
    code: 'DIR-04 · SÍNTESIS INDUSTRIAL',
    title: 'Sintetiza un Compuesto Refinado de Tier II en la Forja',
    description:
      'Refina tus recursos brutos en Aleación Balística, Enzima Corrosiva o Cristal de Cromo para desbloquear evoluciones superiores.',
    targetTab: 'ciudadela_forja',
    actionLabel: 'Sintetizar Compuesto',
    rewardCredits: 150,
  },
  {
    id: 'dir_orion_frontier',
    code: 'DIR-05 · EXPANSIÓN DEL SECTOR NATAL',
    title: 'Explora y despliega en un mundo de Tier II o III de tu Sector',
    description:
      'Abre el Mapa Estelar, selecciona una órbita superior de tu sector natal y ejecuta un despliegue táctico.',
    targetTab: 'exploracion',
    actionLabel: 'Abrir Mapa Estelar',
    rewardCredits: 180,
  },
  {
    id: 'dir_lab_research',
    code: 'DIR-06 · AVANCE CIENTÍFICO',
    title: 'Investiga al menos 1 Mejora Tecnológica en el Laboratorio',
    description:
      'Invierte materiales y créditos en el Laboratorio para desbloquear bonificaciones permanentes de MW, capacidad o combate.',
    targetTab: 'ciudadela_laboratorio',
    actionLabel: 'Abrir Laboratorio',
    rewardCredits: 210,
  },
  {
    id: 'dir_full_mk2_loadout',
    code: 'DIR-07 · SINCRONIZACIÓN DE CHASIS COMPLETO',
    title: 'Evoluciona las 5 piezas de tu Héroe a Grado Mk-II o superior',
    description:
      'Mejora Arma, Coraza, Casco, Guanteletes y Botas a Mk-II en la Forja para alcanzar el Nivel 2 completo del Héroe.',
    targetTab: 'comandante',
    actionLabel: 'Inspeccionar Equipamiento',
    rewardCredits: 260,
  },
  {
    id: 'dir_orion_corridor_deploy',
    code: 'DIR-08 · INCURSIÓN EN EL CORREDOR DE ORIÓN',
    title: 'Despliega en el Sector Neutral Corredor de Orión (Tier IV–V)',
    description:
      'Viaja al Corredor de Orión en el Mapa Estelar para enfrentar mercenarios y extraer recursos de Tier IV y V.',
    targetTab: 'exploracion',
    actionLabel: 'Viajar al Corredor de Orión',
    rewardCredits: 320,
  },
  {
    id: 'dir_bestiary_hunter',
    code: 'DIR-09 · REGISTRO DE INTELIGENCIA HOSTIL',
    title: 'Registra al menos 5 Especies Hostiles en el Códice de Amenazas',
    description:
      'Combate en distintos planetas para identificar unidades ligeras, medias, pesadas y Amenazas Raras de Élite en el archivo.',
    targetTab: 'exploracion_hostiles',
    actionLabel: 'Ver Archivo de Hostiles',
    rewardCredits: 380,
  },
  {
    id: 'dir_playtest_mastery',
    code: 'DIR-10 · CULMINACIÓN DEL RECORRIDO DE PRUEBA',
    title: 'Alcanza Nivel 4+ de Héroe y explora al menos 6 Planetas',
    description:
      'Evoluciona tu equipamiento a grados superiores y recorre los mundos del Sector Natal y del Corredor de Orión.',
    targetTab: 'directivas',
    actionLabel: 'Ver Hitos de Prueba',
    rewardCredits: 550,
  },
];

