export interface Planet {
  id: string;
  name: string;
  type: string;
  tier: number;
  tierRoman: string; // I a X
  enemyLevel: number;
  threatLevel: 'Baja' | 'Moderada' | 'Peligro Crítico' | 'Zona en Guerra';
  /** Jerarquía visual de importancia en el lienzo del sector (1° Dominante -> 4° Satélite Menor) */
  visualRank: 1 | 2 | 3 | 4;
  lore: string; // Reseña táctica y existencial del mundo dentro del canon de Project Vanguard
  combatLoot: { id: string; name: string }[];
  image: string;
  minLevel: number;
  /** Coordenadas calibradas al milímetro (0-100%) sobre la ilustración 16:9 de cada sector */
  sectorCoords: { x: number; y: number };
}

export interface StarSector {
  id: string;
  name: string;
  designation: string;
  status: 'Bastión Seguro' | 'Sector en Disputa' | 'Espacio Neutral';
  faction: 'VALARI' | 'SKITHID' | 'CYGNUS' | 'NEUTRAL';
  coordinates: { x: number; y: number };
  /** Lienzo astrofotográfico 16:9 exclusivo para la región interior del sector */
  sectorImage: string;
  minLevel: number;
  influence?: {
    valari: number;
    skithid: number;
    cygnus: number;
  };
  planets: Planet[];
}

export const SECTORS_DATA: StarSector[] = [
  // =========================================================================================
  // 1. BASTIÓN DE VAELOR — LA SOBERANÍA VALARI (Brazo Inferior Izquierdo Ámbar/Oro Militar)
  // =========================================================================================
  {
    id: 'SEC-VAL-01',
    name: 'Bastión de Vaelor',
    designation: 'Sector S-01 · La Soberanía Valari',
    status: 'Bastión Seguro',
    faction: 'VALARI',
    coordinates: { x: 26, y: 73 },
    sectorImage: '/assets/backgrounds/sectors/sector-valari.jpg',
    minLevel: 1,
    planets: [
      {
        id: 'PLN-VAL-01',
        name: 'Vaelor Prime',
        type: 'Mundo Natal en Contención Tectónica',
        tier: 1,
        tierRoman: 'I',
        enemyLevel: 2,
        threatLevel: 'Baja',
        visualRank: 1,
        lore: 'Cuna de la Soberanía tras su colapso ecológico. Su lado nocturno brilla con redes geométricas de complejos mineros mientras un anillo orbital estabiliza su corteza basáltica.',
        combatLoot: [
          { id: 'valari_raw_t1_ferrita', name: 'Ferrita' },
          { id: 'valari_raw_t2_titanio', name: 'Titanio' },
        ],
        image: '/assets/planets/cards/PLN-VAL-01.jpg',
        minLevel: 1,
        sectorCoords: { x: 15.5, y: 25 },
      },
      {
        id: 'PLN-VAL-02',
        name: 'Aureus Profundo',
        type: 'Luna Fracturada de Extracción Mineral',
        tier: 1,
        tierRoman: 'I',
        enemyLevel: 7,
        threatLevel: 'Baja',
        visualRank: 4,
        lore: 'Satélite minero sometido a perforación intensiva cuya órbita deja una estela incandescente de polvo de ferrita y escombros metálicos.',
        combatLoot: [
          { id: 'valari_raw_t1_ferrita', name: 'Ferrita' },
          { id: 'valari_raw_t2_titanio', name: 'Titanio' },
        ],
        image: '/assets/planets/cards/PLN-VAL-02.jpg',
        minLevel: 5,
        sectorCoords: { x: 28.5, y: 24.5 },
      },
      {
        id: 'PLN-VAL-03',
        name: 'Cinder-IV',
        type: 'Planetoide Volcánico de Fundición',
        tier: 2,
        tierRoman: 'II',
        enemyLevel: 14,
        threatLevel: 'Moderada',
        visualRank: 3,
        lore: 'Mundo geológicamente hiperactivo surcado por ríos tectónicos de magma dorado que alimentan las prensas térmicas de Aleación Balística.',
        combatLoot: [
          { id: 'valari_raw_t2_titanio', name: 'Titanio' },
          { id: 'valari_craft_t2_titanio', name: 'Aleación Balística' },
        ],
        image: '/assets/planets/cards/PLN-VAL-03.jpg',
        minLevel: 11,
        sectorCoords: { x: 44.5, y: 49.5 },
      },
      {
        id: 'PLN-VAL-04',
        name: 'Baluarte de Hierro',
        type: 'Mundo Acorazado de Blindaje Plano',
        tier: 3,
        tierRoman: 'III',
        enemyLevel: 20,
        threatLevel: 'Peligro Crítico',
        visualRank: 2,
        lore: 'Fortaleza planetaria de alta gravedad recubierta íntegramente por placas macizas de titanio oscuro e iridio sin escudos de energía, fiel a la doctrina de Blindaje Plano Valari.',
        combatLoot: [
          { id: 'valari_raw_t3_iridio', name: 'Iridio' },
          { id: 'valari_craft_t3_iridio', name: 'Lingote de Iridio' },
        ],
        image: '/assets/planets/cards/PLN-VAL-04.jpg',
        minLevel: 17,
        sectorCoords: { x: 80.5, y: 74.5 },
      },
    ],
  },

  // =========================================================================================
  // 2. COLMENA PROGENITORA — EL ENJAMBRE SKITHID (Brazo Derecho Verde Esmeralda/Quitina Marfil)
  // =========================================================================================
  {
    id: 'SEC-SKI-01',
    name: 'Enjambre Progenitor',
    designation: 'Sector NE-04 · El Enjambre Skithid',
    status: 'Bastión Seguro',
    faction: 'SKITHID',
    coordinates: { x: 80, y: 38 },
    sectorImage: '/assets/backgrounds/sectors/sector-skithid.jpg',
    minLevel: 1,
    planets: [
      {
        id: 'PLN-SKI-01',
        name: 'Kryll Prime',
        type: 'Biósfera Natal de Quitina Marfil',
        tier: 1,
        tierRoman: 'I',
        enemyLevel: 2,
        threatLevel: 'Baja',
        visualRank: 1,
        lore: 'Cuna biomineralizada cuya corteza de quitina color hueso/marfil está surcada por venas tectónicas verde esmeralda y coronada por una aurora bio-eléctrica.',
        combatLoot: [
          { id: 'skithid_raw_t1_quitina', name: 'Quitina' },
          { id: 'skithid_raw_t2_espora', name: 'Espora Ácida' },
        ],
        image: '/assets/planets/cards/PLN-SKI-01.jpg',
        minLevel: 1,
        sectorCoords: { x: 69.5, y: 20.5 },
      },
      {
        id: 'PLN-SKI-02',
        name: 'Luna Estridulatoria',
        type: 'Satélite de Resonancia Sub-Sónica',
        tier: 1,
        tierRoman: 'I',
        enemyLevel: 7,
        threatLevel: 'Baja',
        visualRank: 4,
        lore: 'Satélite de quitina blanca que emite ondas concéntricas en el vacío, sincronizando mediante el Telar Químico-Estridulatorio a todas las castas del sector.',
        combatLoot: [
          { id: 'skithid_raw_t1_quitina', name: 'Quitina' },
          { id: 'skithid_raw_t2_espora', name: 'Espora Ácida' },
        ],
        image: '/assets/planets/cards/PLN-SKI-02.jpg',
        minLevel: 5,
        sectorCoords: { x: 58, y: 20 },
      },
      {
        id: 'PLN-SKI-03',
        name: 'Crisálida de Kael',
        type: 'Planetoide de Corrientes Biocatalíticas',
        tier: 2,
        tierRoman: 'II',
        enemyLevel: 14,
        threatLevel: 'Moderada',
        visualRank: 3,
        lore: 'Planetoide de tejido oscuro rodeado por espirales orbitales de esporas y corrientes biocatalíticas esmeralda donde se destilan Enzimas Corrosivas puras.',
        combatLoot: [
          { id: 'skithid_raw_t2_espora', name: 'Espora Ácida' },
          { id: 'skithid_craft_t2_enzima', name: 'Enzima Corrosiva' },
        ],
        image: '/assets/planets/cards/PLN-SKI-03.jpg',
        minLevel: 11,
        sectorCoords: { x: 58, y: 45.5 },
      },
      {
        id: 'PLN-SKI-04',
        name: 'Nido del Karkinos',
        type: 'Mundo Anillado de Quitina y Bio-Polvo',
        tier: 3,
        tierRoman: 'III',
        enemyLevel: 20,
        threatLevel: 'Peligro Crítico',
        visualRank: 2,
        lore: 'Mundo acorazado con bandas de quitina marfil y obsidiana, ceñido por un denso anillo planetario de polvo bioluminiscente esmeralda y cristales orgánicos.',
        combatLoot: [
          { id: 'skithid_raw_t3_tejido', name: 'Tejido Vivo' },
          { id: 'skithid_craft_t3_caparazon', name: 'Caparazón Mutado' },
        ],
        image: '/assets/planets/cards/PLN-SKI-04.jpg',
        minLevel: 17,
        sectorCoords: { x: 77, y: 69 },
      },
    ],
  },

  // =========================================================================================
  // 3. NEXO DE CAELUM — EL NEXO CYGNUS (Arco Superior Izquierdo Azul Eléctrico/Cian/Obsidiana)
  // =========================================================================================
  {
    id: 'SEC-CYG-01',
    name: 'Nexo de Caelum',
    designation: 'Sector NW-02 · El Nexo Cygnus',
    status: 'Bastión Seguro',
    faction: 'CYGNUS',
    coordinates: { x: 29, y: 24 },
    sectorImage: '/assets/backgrounds/sectors/sector-cygnus.jpg',
    minLevel: 1,
    planets: [
      {
        id: 'PLN-CYG-01',
        name: 'Nodo Cero',
        type: 'Mundo Capital de Obsidiana y Crio-Cristal',
        tier: 1,
        tierRoman: 'I',
        enemyLevel: 2,
        threatLevel: 'Baja',
        visualRank: 1,
        lore: 'Capital de la Soberanía Cygnus: mundo hiper-frío de obsidiana mate y glaciares criogénicos cian, estabilizado en órbita por dos anillos superconductores de titanio blanco y oro cruzados en "X".',
        combatLoot: [
          { id: 'cygnus_raw_t1_silicio', name: 'Silicio' },
          { id: 'cygnus_raw_t2_cromo', name: 'Cromo' },
        ],
        image: '/assets/planets/cards/PLN-CYG-01.jpg',
        minLevel: 1,
        sectorCoords: { x: 22.5, y: 27 },
      },
      {
        id: 'PLN-CYG-02',
        name: 'Esfera de Silicio Null',
        type: 'Luna de Cromo Espejo y Compilación',
        tier: 1,
        tierRoman: 'I',
        enemyLevel: 7,
        threatLevel: 'Baja',
        visualRank: 4,
        lore: 'Satélite de cromo espejo y silicio puro que refleja un destello estelar cian constante mientras compila matrices lógicas a cero absoluto.',
        combatLoot: [
          { id: 'cygnus_raw_t1_silicio', name: 'Silicio' },
          { id: 'cygnus_raw_t2_cromo', name: 'Cromo' },
        ],
        image: '/assets/planets/cards/PLN-CYG-02.jpg',
        minLevel: 5,
        sectorCoords: { x: 38, y: 28 },
      },
      {
        id: 'PLN-CYG-03',
        name: 'Meridiano de Cromo',
        type: 'Planetoide Colimador Ecuatorial',
        tier: 2,
        tierRoman: 'II',
        enemyLevel: 14,
        threatLevel: 'Moderada',
        visualRank: 3,
        lore: 'Planetoide de titanio blanco pulido bisecado en su ecuador por un haz colimador de plasma azul eléctrico que sintetiza Cristales de Cromo sin disipación térmica.',
        combatLoot: [
          { id: 'cygnus_raw_t2_cromo', name: 'Cromo' },
          { id: 'cygnus_craft_t2_cromo', name: 'Cristal de Cromo' },
        ],
        image: '/assets/planets/cards/PLN-CYG-03.jpg',
        minLevel: 11,
        sectorCoords: { x: 17, y: 62.5 },
      },
      {
        id: 'PLN-CYG-04',
        name: 'Horizonte de Coherencia',
        type: 'Mundo Nodal bajo Escudo de Fase',
        tier: 3,
        tierRoman: 'III',
        enemyLevel: 20,
        threatLevel: 'Peligro Crítico',
        visualRank: 2,
        lore: 'Núcleo sintético de obsidiana protegido por una esfera geodésica hexagonal de Escudos de Fase azul eléctrico, tecnología exclusiva de la doctrina Cygnus.',
        combatLoot: [
          { id: 'cygnus_raw_t3_foton', name: 'Fotones' },
          { id: 'cygnus_craft_t3_fotones', name: 'Vector Fotónico' },
        ],
        image: '/assets/planets/cards/PLN-CYG-04.jpg',
        minLevel: 17,
        sectorCoords: { x: 78, y: 21 },
      },
    ],
  },

  // =========================================================================================
  // 4. CORREDOR DE ORIÓN — FRENTE DE CHOQUE OCCIDENTAL (Canal Interior Violeta/Turquesa)
  // =========================================================================================
  {
    id: 'SEC-NEU-WEST',
    name: 'Corredor de Orión',
    designation: 'Sector W-03 · Frente de Choque Occidental',
    status: 'Espacio Neutral',
    faction: 'NEUTRAL',
    coordinates: { x: 34, y: 48 },
    sectorImage: '/assets/backgrounds/sectors/sector-orion.jpg',
    minLevel: 20,
    planets: [
      {
        id: 'PLN-ORI-01',
        name: 'Ferrum-Cryo 88',
        type: 'Mundo de Choque Térmico Valari-Cygnus',
        tier: 4,
        tierRoman: 'IV',
        enemyLevel: 24,
        threatLevel: 'Moderada',
        visualRank: 2,
        lore: 'Planeta dividido por la guerra doctrinal: su hemisferio sur arde con fracturas de fundición Valari mientras el hemisferio norte permanece congelado por glaciares criogénicos Cygnus.',
        combatLoot: [
          { id: 'valari_raw_t2_titanio', name: 'Titanio' },
          { id: 'cygnus_raw_t2_cromo', name: 'Cromo' },
          { id: 'valari_craft_t2_titanio', name: 'Aleación Balística' },
        ],
        image: '/assets/planets/cards/PLN-ORI-01.jpg',
        minLevel: 20,
        sectorCoords: { x: 23, y: 71 },
      },
      {
        id: 'PLN-ORI-02',
        name: 'Pena Fracturada',
        type: 'Luna Disputada en el Canal Exterior',
        tier: 4,
        tierRoman: 'IV',
        enemyLevel: 28,
        threatLevel: 'Moderada',
        visualRank: 4,
        lore: 'Luna de corteza clara cicatrizada por grietas térmicas ámbar donde chocan patrullas de extracción de las tres doctrinas.',
        combatLoot: [
          { id: 'skithid_raw_t2_espora', name: 'Espora Ácida' },
          { id: 'cygnus_craft_t2_cromo', name: 'Cristal de Cromo' },
          { id: 'skithid_craft_t2_enzima', name: 'Enzima Corrosiva' },
        ],
        image: '/assets/planets/cards/PLN-ORI-02.jpg',
        minLevel: 24,
        sectorCoords: { x: 19.5, y: 18 },
      },
      {
        id: 'PLN-ORI-03',
        name: 'Vórtice de Orión',
        type: 'Planetoide en Tormenta de Escombros',
        tier: 5,
        tierRoman: 'V',
        enemyLevel: 32,
        threatLevel: 'Peligro Crítico',
        visualRank: 3,
        lore: 'Núcleo planetario agrietado en cian y violeta rodeado por un cinturón de asteroides electrizados donde convergen Iridio, Fotones y Tejido Vivo.',
        combatLoot: [
          { id: 'valari_raw_t3_iridio', name: 'Iridio' },
          { id: 'cygnus_raw_t3_foton', name: 'Fotones' },
          { id: 'skithid_raw_t3_tejido', name: 'Tejido Vivo' },
        ],
        image: '/assets/planets/cards/PLN-ORI-03.jpg',
        minLevel: 28,
        sectorCoords: { x: 40.5, y: 40.5 },
      },
      {
        id: 'PLN-ORI-04',
        name: 'Bastión Silente',
        type: 'Mundo Forja en Cuarentena Cuántica',
        tier: 5,
        tierRoman: 'V',
        enemyLevel: 36,
        threatLevel: 'Zona en Guerra',
        visualRank: 1,
        lore: 'Antiguo mundo forja Valari de basalto y magma ámbar cercado en órbita por un anillo de contención hexagonal azul eléctrico desplegado por el Nexo Cygnus.',
        combatLoot: [
          { id: 'valari_craft_t3_iridio', name: 'Lingote de Iridio' },
          { id: 'cygnus_craft_t3_fotones', name: 'Vector Fotónico' },
          { id: 'skithid_craft_t3_caparazon', name: 'Caparazón Mutado' },
        ],
        image: '/assets/planets/cards/PLN-ORI-04.jpg',
        minLevel: 32,
        sectorCoords: { x: 71.5, y: 45.5 },
      },
    ],
  },

  // =========================================================================================
  // 5. CINTURÓN DE AETHEL — FRENTE DE PURIFICACIÓN ORIENTAL (Curva Inferior Derecha Violeta/Magenta)
  // =========================================================================================
  {
    id: 'SEC-NEU-EAST',
    name: 'Cinturón de Aethel',
    designation: 'Sector E-05 · Frente de Purificación Oriental',
    status: 'Espacio Neutral',
    faction: 'NEUTRAL',
    coordinates: { x: 64, y: 71 },
    sectorImage: '/assets/backgrounds/sectors/sector-aethel.jpg',
    minLevel: 34,
    planets: [
      {
        id: 'PLN-AET-01',
        name: 'Aethel Biomineral',
        type: 'Mundo en Purificación Quitinosa',
        tier: 6,
        tierRoman: 'VI',
        enemyLevel: 38,
        threatLevel: 'Peligro Crítico',
        visualRank: 3,
        lore: 'Mundo mineral recubierto por placas de quitina marfil y profundas fisuras bioluminiscentes esmeralda mientras el Enjambre metaboliza sus depósitos de Iridio.',
        combatLoot: [
          { id: 'skithid_raw_t3_tejido', name: 'Tejido Vivo' },
          { id: 'valari_raw_t3_iridio', name: 'Iridio' },
          { id: 'skithid_craft_t3_caparazon', name: 'Caparazón Mutado' },
        ],
        image: '/assets/planets/cards/PLN-AET-01.jpg',
        minLevel: 34,
        sectorCoords: { x: 78.5, y: 72 },
      },
      {
        id: 'PLN-AET-02',
        name: 'Relicario de Aethel',
        type: 'Luna de Cicatrices Cuántico-Térmicas',
        tier: 6,
        tierRoman: 'VI',
        enemyLevel: 42,
        threatLevel: 'Peligro Crítico',
        visualRank: 4,
        lore: 'Pequeño satélite fracturado por grietas doradas y cian tras décadas de enfrentamientos entre flotas de asedio Valari y colimadores Cygnus.',
        combatLoot: [
          { id: 'cygnus_raw_t3_foton', name: 'Fotones' },
          { id: 'valari_craft_t3_iridio', name: 'Lingote de Iridio' },
          { id: 'cygnus_craft_t3_fotones', name: 'Vector Fotónico' },
        ],
        image: '/assets/planets/cards/PLN-AET-02.jpg',
        minLevel: 38,
        sectorCoords: { x: 19, y: 72.5 },
      },
      {
        id: 'PLN-AET-03',
        name: 'Punta Quebrada',
        type: 'Planeta Partido de Núcleo Neutrónico',
        tier: 7,
        tierRoman: 'VII',
        enemyLevel: 46,
        threatLevel: 'Zona en Guerra',
        visualRank: 1,
        lore: 'Mundo colosal partido en dos hemisferios separados por una nube de escombros gravitacionales, dejando expuesto su radiante núcleo de Neutronio ámbar-violeta.',
        combatLoot: [
          { id: 'valari_raw_t4_neutronio', name: 'Neutronio' },
          { id: 'skithid_raw_t4_glandula', name: 'Órgano Abisal' },
          { id: 'skithid_craft_t4_glandula', name: 'Glándula Mutada' },
        ],
        image: '/assets/planets/cards/PLN-AET-03.jpg',
        minLevel: 42,
        sectorCoords: { x: 64.5, y: 48 },
      },
      {
        id: 'PLN-AET-04',
        name: 'Umbral de Taquiones',
        type: 'Mundo de Contención al Borde del Abismo',
        tier: 7,
        tierRoman: 'VII',
        enemyLevel: 50,
        threatLevel: 'Zona en Guerra',
        visualRank: 2,
        lore: 'Mundo de obsidiana ceñido por dos anillos orbitales cruzados de luz azul y magenta que cosechan Taquiones en la frontera del núcleo galáctico.',
        combatLoot: [
          { id: 'cygnus_raw_t4_taquion', name: 'Taquiones' },
          { id: 'valari_raw_t4_neutronio', name: 'Neutronio' },
          { id: 'cygnus_craft_t4_taquion', name: 'Matriz Taquiónica' },
        ],
        image: '/assets/planets/cards/PLN-AET-04.jpg',
        minLevel: 46,
        sectorCoords: { x: 35.5, y: 26 },
      },
    ],
  },

  // =========================================================================================
  // 6. LA FALLA DE VESPER — LA GRAN SINGULARIDAD CENTRAL (Núcleo Galáctico End-Game)
  // =========================================================================================
  {
    id: 'SEC-NEU-01',
    name: 'La Falla de Vesper',
    designation: 'Sector C-08 · La Gran Singularidad Central',
    status: 'Sector en Disputa',
    faction: 'NEUTRAL',
    coordinates: { x: 50, y: 49 },
    sectorImage: '/assets/backgrounds/sectors/sector-vesper.jpg',
    minLevel: 50,
    influence: {
      valari: 36,
      skithid: 33,
      cygnus: 31,
    },
    planets: [
      {
        id: 'PLN-VESP-01',
        name: 'Vesper Ignis',
        type: 'Mundo en Desgarro de Marea Gravitacional',
        tier: 8,
        tierRoman: 'VIII',
        enemyLevel: 54,
        threatLevel: 'Peligro Crítico',
        visualRank: 3,
        lore: 'Planeta basáltico al borde del vórtice cuya corteza incandescente es arrancada hacia el agujero negro en una larga estela dorada de Neutronio y escombros.',
        combatLoot: [
          { id: 'valari_raw_t4_neutronio', name: 'Neutronio' },
          { id: 'skithid_raw_t4_glandula', name: 'Órgano Abisal' },
          { id: 'valari_craft_t4_neutronio', name: 'Placa Neutrónica' },
        ],
        image: '/assets/planets/cards/PLN-VESP-01.jpg',
        minLevel: 50,
        sectorCoords: { x: 23, y: 76.5 },
      },
      {
        id: 'PLN-VESP-02',
        name: 'Arca de la Singularidad',
        type: 'Mundo Precursor de Anillos en X',
        tier: 9,
        tierRoman: 'IX',
        enemyLevel: 60,
        threatLevel: 'Zona en Guerra',
        visualRank: 2,
        lore: 'Mundo ancestral de obsidiana estabilizado por dos anillos precursores cruzados en "X" de luz cian donde despertó la primera conciencia cuántica.',
        combatLoot: [
          { id: 'cygnus_craft_t4_taquion', name: 'Matriz Taquiónica' },
          { id: 'valari_craft_t4_neutronio', name: 'Placa Neutrónica' },
          { id: 'skithid_craft_t4_glandula', name: 'Glándula Mutada' },
        ],
        image: '/assets/planets/cards/PLN-VESP-02.jpg',
        minLevel: 56,
        sectorCoords: { x: 76.5, y: 22 },
      },
      {
        id: 'PLN-VESP-03',
        name: 'Horizonte de Vesper',
        type: 'Epicentro del Colapso Gravitacional',
        tier: 10,
        tierRoman: 'X',
        enemyLevel: 65,
        threatLevel: 'Zona en Guerra',
        visualRank: 1,
        lore: 'El horizonte de sucesos de la Gran Singularidad en el centro exacto de la galaxia. Quien controle sus reliquias de Grado V decidirá el destino existencial del cosmos.',
        combatLoot: [
          { id: 'valari_t5_materia_oscura', name: 'Materia Oscura' },
          { id: 'skithid_t5_plasma_corrosivo', name: 'Plasma Corrosivo' },
          { id: 'cygnus_t5_nucleo_cuantico', name: 'Núcleo Cuántico' },
        ],
        image: '/assets/planets/cards/PLN-VESP-03.jpg',
        minLevel: 60,
        sectorCoords: { x: 50, y: 48.5 },
      },
    ],
  },
];