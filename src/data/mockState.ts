// src/data/mockState.ts
import { ForgeRecipeItem } from '../components/ForgeView';
import { CombatResistances } from '../types/game';

// 1. Inventario inicial de Nivel 1 en cero absoluto (el jugador comienza sin recursos ni créditos y debe extraerlos en el Frente de Batalla)
export const MOCK_INVENTORY: Record<string, number> = {
  // Valari Raw & Crafted
  valari_raw_t1_ferrita: 0,
  valari_raw_t2_titanio: 0,
  valari_raw_t3_iridio: 0,
  valari_raw_t4_neutronio: 0,
  valari_craft_t2_titanio: 0,
  valari_craft_t3_iridio: 0,
  valari_craft_t4_neutronio: 0,
  valari_t5_materia_oscura: 0,

  // Skithid Raw & Crafted
  skithid_raw_t1_quitina: 0,
  skithid_raw_t2_espora: 0,
  skithid_raw_t3_tejido: 0,
  skithid_raw_t4_glandula: 0,
  skithid_craft_t2_enzima: 0,
  skithid_craft_t3_caparazon: 0,
  skithid_craft_t4_glandula: 0,
  skithid_t5_plasma_corrosivo: 0,

  // Cygnus Raw & Crafted
  cygnus_raw_t1_silicio: 0,
  cygnus_raw_t2_cromo: 0,
  cygnus_raw_t3_foton: 0,
  cygnus_raw_t4_taquion: 0,
  cygnus_craft_t2_cromo: 0,
  cygnus_craft_t3_fotones: 0,
  cygnus_craft_t4_taquion: 0,
  cygnus_t5_nucleo_cuantico: 0,
};

export const MOCK_CREDITS = 0;

// 2. Estadísticas base de referencia
export const MOCK_HERO_STATS = {
  maxPlayerHp: 680,
  maxPlayerShield: 380,
  playerAttackDmg: 120,
  playerFlatArmor: 32,
  playerArmorPercent: 32,
  playerEvasionPercent: 15,
  weaponCritBonus: 10,
  reconLuck: 5,
  forgeSpeedBonusPct: 10,
  playerResistances: {
    kinetic: 20,
    energy: 15,
    corrosive: 15,
  } as CombatResistances,
};

// 3. Logs tácticos iniciales
export const MOCK_COMBAT_LOGS = [
  '[MANDO] Enlace neural sincronizado en Nivel 1. Inicia tu primera incursión en el Frente de Batalla para extraer recursos y créditos.',
  '[NAVEGACIÓN] Sector Natal (Tiers I–III) y Corredor de Orión (Tiers IV–V) habilitados.',
];

// 4. Catálogo Completo de Recetas de Forja para las 3 Facciones (T2 a T5)
export const MOCK_FORGE_RECIPES: (ForgeRecipeItem & { factionAffinity?: 'valari' | 'skithid' | 'cygnus' })[] = [
  // ================= VALARI (T2 - T5) =================
  {
    id: 'forge_valari_t2_aleacion',
    name: 'Aleación Balística',
    tier: 2,
    requiredForgeLevel: 1,
    cycleSeconds: 2,
    iconKey: 'shield',
    factionAffinity: 'valari',
    outputResourceId: 'valari_craft_t2_titanio',
    outputAmount: 2,
    costs: [
      { id: 'valari_raw_t1_ferrita', label: 'Ferrita', required: 12 },
      { id: 'valari_raw_t2_titanio', label: 'Titanio', required: 6 },
      { id: 'credits', label: 'Créditos', required: 80 },
    ],
  },
  {
    id: 'forge_valari_t3_iridio',
    name: 'Lingote de Iridio',
    tier: 3,
    requiredForgeLevel: 2,
    cycleSeconds: 3,
    iconKey: 'cylinder',
    factionAffinity: 'valari',
    outputResourceId: 'valari_craft_t3_iridio',
    outputAmount: 2,
    costs: [
      { id: 'valari_raw_t2_titanio', label: 'Titanio', required: 10 },
      { id: 'valari_raw_t3_iridio', label: 'Iridio', required: 5 },
      { id: 'credits', label: 'Créditos', required: 180 },
    ],
  },
  {
    id: 'forge_valari_t4_neutronio',
    name: 'Placa Neutrónica',
    tier: 4,
    requiredForgeLevel: 3,
    cycleSeconds: 4,
    iconKey: 'layers',
    factionAffinity: 'valari',
    outputResourceId: 'valari_craft_t4_neutronio',
    outputAmount: 1,
    costs: [
      { id: 'valari_raw_t3_iridio', label: 'Iridio', required: 8 },
      { id: 'valari_raw_t4_neutronio', label: 'Neutronio', required: 4 },
      { id: 'credits', label: 'Créditos', required: 360 },
    ],
  },
  {
    id: 'forge_valari_t5_singularidad',
    name: 'Materia Oscura',
    tier: 5,
    requiredForgeLevel: 4,
    cycleSeconds: 5,
    iconKey: 'eclipse',
    factionAffinity: 'valari',
    outputResourceId: 'valari_t5_materia_oscura',
    outputAmount: 1,
    costs: [
      { id: 'valari_craft_t4_neutronio', label: 'Placa Neutrónica', required: 2 },
      { id: 'valari_raw_t4_neutronio', label: 'Neutronio', required: 6 },
      { id: 'credits', label: 'Créditos', required: 650 },
    ],
  },

  // ================= SKITHID (T2 - T5) =================
  {
    id: 'forge_skithid_t2_enzima',
    name: 'Enzima Corrosiva',
    tier: 2,
    requiredForgeLevel: 1,
    cycleSeconds: 2,
    iconKey: 'activity',
    factionAffinity: 'skithid',
    outputResourceId: 'skithid_craft_t2_enzima',
    outputAmount: 2,
    costs: [
      { id: 'skithid_raw_t1_quitina', label: 'Quitina', required: 12 },
      { id: 'skithid_raw_t2_espora', label: 'Espora Ácida', required: 6 },
      { id: 'credits', label: 'Créditos', required: 80 },
    ],
  },
  {
    id: 'forge_skithid_t3_caparazon',
    name: 'Caparazón Mutado',
    tier: 3,
    requiredForgeLevel: 2,
    cycleSeconds: 3,
    iconKey: 'octagon',
    factionAffinity: 'skithid',
    outputResourceId: 'skithid_craft_t3_caparazon',
    outputAmount: 2,
    costs: [
      { id: 'skithid_raw_t2_espora', label: 'Espora Ácida', required: 10 },
      { id: 'skithid_raw_t3_tejido', label: 'Tejido Vivo', required: 5 },
      { id: 'credits', label: 'Créditos', required: 180 },
    ],
  },
  {
    id: 'forge_skithid_t4_glandula',
    name: 'Glándula Mutada',
    tier: 4,
    requiredForgeLevel: 3,
    cycleSeconds: 4,
    iconKey: 'brain-circuit',
    factionAffinity: 'skithid',
    outputResourceId: 'skithid_craft_t4_glandula',
    outputAmount: 1,
    costs: [
      { id: 'skithid_raw_t3_tejido', label: 'Tejido Vivo', required: 8 },
      { id: 'skithid_raw_t4_glandula', label: 'Órgano Abisal', required: 4 },
      { id: 'credits', label: 'Créditos', required: 360 },
    ],
  },
  {
    id: 'forge_skithid_t5_plasma',
    name: 'Plasma Corrosivo',
    tier: 5,
    requiredForgeLevel: 4,
    cycleSeconds: 5,
    iconKey: 'radiation',
    factionAffinity: 'skithid',
    outputResourceId: 'skithid_t5_plasma_corrosivo',
    outputAmount: 1,
    costs: [
      { id: 'skithid_craft_t4_glandula', label: 'Glándula Mutada', required: 2 },
      { id: 'skithid_raw_t4_glandula', label: 'Órgano Abisal', required: 6 },
      { id: 'credits', label: 'Créditos', required: 650 },
    ],
  },

  // ================= CYGNUS (T2 - T5) =================
  {
    id: 'forge_cygnus_t2_cromo',
    name: 'Cristal de Cromo',
    tier: 2,
    requiredForgeLevel: 1,
    cycleSeconds: 2,
    iconKey: 'gem',
    factionAffinity: 'cygnus',
    outputResourceId: 'cygnus_craft_t2_cromo',
    outputAmount: 2,
    costs: [
      { id: 'cygnus_raw_t1_silicio', label: 'Silicio', required: 12 },
      { id: 'cygnus_raw_t2_cromo', label: 'Cromo', required: 6 },
      { id: 'credits', label: 'Créditos', required: 80 },
    ],
  },
  {
    id: 'forge_cygnus_t3_foton',
    name: 'Vector Fotónico',
    tier: 3,
    requiredForgeLevel: 2,
    cycleSeconds: 3,
    iconKey: 'zap',
    factionAffinity: 'cygnus',
    outputResourceId: 'cygnus_craft_t3_fotones',
    outputAmount: 2,
    costs: [
      { id: 'cygnus_raw_t2_cromo', label: 'Cromo', required: 10 },
      { id: 'cygnus_raw_t3_foton', label: 'Fotones', required: 5 },
      { id: 'credits', label: 'Créditos', required: 180 },
    ],
  },
  {
    id: 'forge_cygnus_t4_taquion',
    name: 'Matriz Taquiónica',
    tier: 4,
    requiredForgeLevel: 3,
    cycleSeconds: 4,
    iconKey: 'network',
    factionAffinity: 'cygnus',
    outputResourceId: 'cygnus_craft_t4_taquion',
    outputAmount: 1,
    costs: [
      { id: 'cygnus_raw_t3_foton', label: 'Fotones', required: 8 },
      { id: 'cygnus_raw_t4_taquion', label: 'Taquiones', required: 4 },
      { id: 'credits', label: 'Créditos', required: 360 },
    ],
  },
  {
    id: 'forge_cygnus_t5_nucleo',
    name: 'Núcleo Cuántico',
    tier: 5,
    requiredForgeLevel: 4,
    cycleSeconds: 5,
    iconKey: 'orbit',
    factionAffinity: 'cygnus',
    outputResourceId: 'cygnus_t5_nucleo_cuantico',
    outputAmount: 1,
    costs: [
      { id: 'cygnus_craft_t4_taquion', label: 'Matriz Taquiónica', required: 2 },
      { id: 'cygnus_raw_t4_taquion', label: 'Taquiones', required: 6 },
      { id: 'credits', label: 'Créditos', required: 650 },
    ],
  },
];