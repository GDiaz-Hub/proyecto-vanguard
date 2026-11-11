// src/utils/soundSynthesizer.ts
import { FactionId } from '../types/game';

export type SoundOptionKey = 'A' | 'B' | 'C';

export type SoundCategoryKey =
  | 'valari_combat'
  | 'skithid_combat'
  | 'cygnus_combat'
  | 'combat_impacts'
  | 'ui_citadel';

export interface SoundOptionSpec {
  key: SoundOptionKey;
  title: string;
  timbreDesc: string;
  waveformSummary: string;
  durationMs: number;
}

export interface SoundCueDefinition {
  id: string;
  category: SoundCategoryKey;
  factionId?: FactionId;
  codeTag: string;
  title: string;
  triggerMoment: string;
  gameplayPurpose: string;
  recommendedOption: SoundOptionKey;
  options: [SoundOptionSpec, SoundOptionSpec, SoundOptionSpec];
}

export const SOUND_CATEGORIES: {
  id: SoundCategoryKey;
  label: string;
  subtitle: string;
  accentClass: string;
  borderClass: string;
}[] = [
  {
    id: 'valari_combat',
    label: 'Legión Valari (Cinético)',
    subtitle: 'Artillería balística, pistones hidráulicos, impactos pesados y sellado de placas',
    accentClass: 'text-amber-300',
    borderClass: 'border-amber-400/35',
  },
  {
    id: 'skithid_combat',
    label: 'Enjambre Skithid (Corrosivo)',
    subtitle: 'Cortes de quitina, ebullición ácida, pulsos neurotóxicos y regeneración orgánica',
    accentClass: 'text-emerald-300',
    borderClass: 'border-emerald-400/35',
  },
  {
    id: 'cygnus_combat',
    label: 'El Nexo Cygnus (Energía)',
    subtitle: 'Haces fotónicos, colapso de fase, armónicos cristalinos y escudos cuánticos',
    accentClass: 'text-sky-300',
    borderClass: 'border-sky-400/35',
  },
  {
    id: 'combat_impacts',
    label: 'Impactos, Ruptura y Arena',
    subtitle: 'Reacción acústica según tipo de defensa (Blindaje, Escudo, Esquiva), Ruptura y alertas (!)',
    accentClass: 'text-rose-300',
    borderClass: 'border-rose-400/35',
  },
  {
    id: 'ui_citadel',
    label: 'Interfaz (UI), Reactor y Forja',
    subtitle: 'Botones tácticos, conmutación de protocolos MW, evolución de chasis y mapa estelar',
    accentClass: 'text-slate-200',
    borderClass: 'border-slate-300/30',
  },
];

export const SOUND_CUE_CATALOG: SoundCueDefinition[] = [
  // ============================================================================
  // 1. LEGIÓN VALARI
  // ============================================================================
  {
    id: 'val_basic',
    category: 'valari_combat',
    factionId: 'valari',
    codeTag: 'ATAQUE BÁSICO [ESPACIO]',
    title: 'Disparo de Cañón Automático Valari',
    triggerMoment: 'Al ejecutar el Ataque Básico (100% daño cinético) en turno del Héroe.',
    gameplayPurpose: 'Transmitir peso balístico y percusión mecánica contundente sin saturar el oído en combates largos.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Cañón Perforante Pesado',
        timbreDesc: 'Golpe grave de percusión balística con caída rápida de sub-bajos y chasquido metálico.',
        waveformSummary: 'Triangle 150→38 Hz + Ruido Paso-Banda 950 Hz',
        durationMs: 240,
      },
      {
        key: 'B',
        title: 'Ráfaga Doble de Munición Sólida',
        timbreDesc: 'Dos disparos mecánicos rápidos en sucesión (0 ms y 85 ms) estilo cañón rotatorio.',
        waveformSummary: '2x Sawtooth 180→45 Hz + Transiente corto',
        durationMs: 280,
      },
      {
        key: 'C',
        title: 'Martillo Balístico Seco',
        timbreDesc: 'Impacto neumático corto y sobrio, más contenido en agudos para sesiones prolongadas.',
        waveformSummary: 'Sine 130→32 Hz + Filtro Lowpass 520 Hz',
        durationMs: 190,
      },
    ],
  },
  {
    id: 'val_skill_1',
    category: 'valari_combat',
    factionId: 'valari',
    codeTag: 'HABILIDAD [1] · DAÑO 175%',
    title: 'Salva Pesada (+Sobrecarga de Escudos)',
    triggerMoment: 'Al lanzar [1] Salva Pesada y aplicar [SOBRECARGA] por 2 turnos.',
    gameplayPurpose: 'Diferenciar la habilidad principal con una detonación de artillería seguida de un pulso disruptor.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Obús Termobárico + Pulso Disruptor',
        timbreDesc: 'Detonación profunda de artillería seguida de una descarga magnética que bloquea escudos.',
        waveformSummary: 'Sub-Drop 190→28 Hz + Pulso FM 420→140 Hz',
        durationMs: 460,
      },
      {
        key: 'B',
        title: 'Bombardeo de Mortero de Asedio',
        timbreDesc: 'Silbido descendente corto seguido de una explosión sísmica de amplio espectro.',
        waveformSummary: 'Sweep 680→180 Hz + Explosión Ruido Lowpass',
        durationMs: 520,
      },
      {
        key: 'C',
        title: 'Cañonazo Magnético Railgun',
        timbreDesc: 'Disparo hiper-veloz con chasquido eléctrico agudo y retumbo metálico.',
        waveformSummary: 'Sawtooth 820→55 Hz + Chispa 1.8 kHz',
        durationMs: 380,
      },
    ],
  },
  {
    id: 'val_skill_2',
    category: 'valari_combat',
    factionId: 'valari',
    codeTag: 'HABILIDAD [2] · CONTROL',
    title: 'Conmoción (Aturdir + Cancelar Carga !)',
    triggerMoment: 'Al usar [2] Conmoción para suprimir el turno enemigo y exponer Ruptura.',
    gameplayPurpose: 'Dar feedback inmediato de interrupción física contundente que frena en seco al enemigo.',
    recommendedOption: 'C',
    options: [
      {
        key: 'A',
        title: 'Ariete Hidráulico Sísmico',
        timbreDesc: 'Choque de blindaje pesado con resonancia metálica grave que deja zumbido de aturdimiento.',
        waveformSummary: 'Impacto 140 Hz + Resonancia Metálica 280/415 Hz',
        durationMs: 410,
      },
      {
        key: 'B',
        title: 'Detonación Aturdidora de Onda Corta',
        timbreDesc: 'Estallido seco de conmoción seguido de una caída tonal descendente.',
        waveformSummary: 'Burst 1.2 kHz + Sine Drop 340→75 Hz',
        durationMs: 360,
      },
      {
        key: 'C',
        title: 'Choque de Escudo de Titanio',
        timbreDesc: 'Golpe doble de placas acorazadas con timbre industrial grave.',
        waveformSummary: 'Doble Square 115 Hz + Filtro 600 Hz',
        durationMs: 340,
      },
    ],
  },
  {
    id: 'val_skill_3',
    category: 'valari_combat',
    factionId: 'valari',
    codeTag: 'HABILIDAD [3] · RESTAURAR',
    title: 'Sellar Placas (+Defensa, +HP y Purga)',
    triggerMoment: 'Al usar [3] Sellar Placas para reparar Blindaje y purgar Ácido o estados.',
    gameplayPurpose: 'Evocar reparación mecánica real: pistones cerrándose, soldadura y despresurización.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Soldadura Térmica + Remache Neumático',
        timbreDesc: 'Siseo de válvula de purga seguido de dos cierres mecánicos firmes y tono ascendente.',
        waveformSummary: 'Ruido Válvula + 2x Clank 220/330 Hz + Chime 520 Hz',
        durationMs: 480,
      },
      {
        key: 'B',
        title: 'Prensa Hidráulica de Blindaje',
        timbreDesc: 'Compresión grave ascendente con bloqueo magnético final.',
        waveformSummary: 'Triangle 95→285 Hz + Lock 440 Hz',
        durationMs: 420,
      },
      {
        key: 'C',
        title: 'Purga de Vapor y Refuerzo',
        timbreDesc: 'Escape limpio de presión que barre estados negativos y activa escudo térmico.',
        waveformSummary: 'Bandpass Sweep 400→1600 Hz + Acorde Ámbar',
        durationMs: 440,
      },
    ],
  },
  {
    id: 'val_skill_4',
    category: 'valari_combat',
    factionId: 'valari',
    codeTag: 'HABILIDAD [4] · BUFF +35% ATQ',
    title: 'Sobremarcha (Turbina de Combate)',
    triggerMoment: 'Al activar [4] Sobremarcha (+35% ATQ y -25% daño recibido por 2 turnos).',
    gameplayPurpose: 'Sentir que el Horno Termonuclear del chasis entra en máxima potencia.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Ignición de Turbina Termonuclear',
        timbreDesc: 'Aceleración progresiva de reactor con armónicos cálidos de potencia industrial.',
        waveformSummary: 'Sawtooth Rise 85→340 Hz + Sub-Harmonic 170 Hz',
        durationMs: 540,
      },
      {
        key: 'B',
        title: 'Alerta Táctica + Carga de Pistones',
        timbreDesc: 'Doble pulso de sirena militar sobria seguido de presurización mecánica.',
        waveformSummary: '2x Pulse 580 Hz + Rise 120→290 Hz',
        durationMs: 490,
      },
      {
        key: 'C',
        title: 'Sobrecarga de Bobina Pesada',
        timbreDesc: 'Zumbido grave ascendente que culmina en un destello energético seco.',
        waveformSummary: 'FM 110→440 Hz + Burst final',
        durationMs: 450,
      },
    ],
  },

  // ============================================================================
  // 2. ENJAMBRE SKITHID
  // ============================================================================
  {
    id: 'ski_basic',
    category: 'skithid_combat',
    factionId: 'skithid',
    codeTag: 'ATAQUE BÁSICO [ESPACIO]',
    title: 'Zarpazo Quitinoso / Aguijón Rápido',
    triggerMoment: 'Al ejecutar el Ataque Básico Skithid de alta velocidad.',
    gameplayPurpose: 'Sonar veloz, afilado y orgánico, contrastando con la pesadez mecánica de Valari.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Corte de Guadaña + Siseo Ácido',
        timbreDesc: 'Rasgado veloz de alta frecuencia con una cola sutil de efervescencia orgánica.',
        waveformSummary: 'Bandpass Sweep 1800→320 Hz + FM Sizzle',
        durationMs: 210,
      },
      {
        key: 'B',
        title: 'Doble Aguijón Quitinoso',
        timbreDesc: 'Dos impactos punzantes ultrarrápidos como mandíbulas insectoides.',
        waveformSummary: '2x Triangle 620→140 Hz (0 ms / 65 ms)',
        durationMs: 230,
      },
      {
        key: 'C',
        title: 'Latigazo Tendinoso',
        timbreDesc: 'Chasquido elástico seco con resonancia biológica grave.',
        waveformSummary: 'Sine 480→65 Hz + Filtro Resonante Q=6',
        durationMs: 195,
      },
    ],
  },
  {
    id: 'ski_skill_1',
    category: 'skithid_combat',
    factionId: 'skithid',
    codeTag: 'HABILIDAD [1] · DAÑO 175%',
    title: 'Tajo Ácido (+2 Cargas de Ácido Perforante)',
    triggerMoment: 'Al lanzar [1] Tajo Ácido que funde blindaje y drena salud.',
    gameplayPurpose: 'Combinar un corte letal con el sonido inconfundible de ácido disolviendo blindaje.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Desgarro Bioplasmático + Ebullición',
        timbreDesc: 'Corte profundo seguido de burbujeo ácido modulado que corroe la armadura.',
        waveformSummary: 'Slash 1400→110 Hz + LFO Modulated Noise 650 Hz',
        durationMs: 470,
      },
      {
        key: 'B',
        title: 'Proyección de Enzima Presurizada',
        timbreDesc: 'Descarga líquida a alta presión con impacto viscoso corrosivo.',
        waveformSummary: 'FM 380→95 Hz + Bandpass Q=9 Burbujeo',
        durationMs: 440,
      },
      {
        key: 'C',
        title: 'Mordida de Mandíbula Abisal',
        timbreDesc: 'Cierre violento de quitina pesada con crujido estructural.',
        waveformSummary: 'Doble Crunch 260→55 Hz + Siseo agudo',
        durationMs: 390,
      },
    ],
  },
  {
    id: 'ski_skill_2',
    category: 'skithid_combat',
    factionId: 'skithid',
    codeTag: 'HABILIDAD [2] · CONTROL',
    title: 'Neurotoxina (Parálisis + Cancelar Carga !)',
    triggerMoment: 'Al usar [2] Neurotoxina para paralizar el sistema nervioso del objetivo.',
    gameplayPurpose: 'Transmitir parálisis sináptica y bloqueo biológico inmediato.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Inyección Neural + Vibración Sináptica',
        timbreDesc: 'Punzada aguda seguida de una ondulación hipnótica descendente que adormece al rival.',
        waveformSummary: 'Sting 1.5 kHz + Vibrato Sine 420→130 Hz',
        durationMs: 430,
      },
      {
        key: 'B',
        title: 'Esporas Paralizantes de Frecuencia',
        timbreDesc: 'Dispersión granulada con pulso grave que apaga los sistemas del enemigo.',
        waveformSummary: 'Filtered Noise + Sub Drop 210→45 Hz',
        durationMs: 410,
      },
      {
        key: 'C',
        title: 'Estridor Ultrasónico Depredador',
        timbreDesc: 'Pulso resonante bioluminiscente corto que desorienta instantáneamente.',
        waveformSummary: 'Dual Detuned Saw 780/795→190 Hz',
        durationMs: 370,
      },
    ],
  },
  {
    id: 'ski_skill_3',
    category: 'skithid_combat',
    factionId: 'skithid',
    codeTag: 'HABILIDAD [3] · RESTAURAR',
    title: 'Regeneración (+Esquiva, +HP y Muda)',
    triggerMoment: 'Al usar [3] Regeneración para restaurar biomasa y purgar Fijación Lumínica.',
    gameplayPurpose: 'Sonar como tejido vivo regenerándose y un latido cardíaco vigoroso.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Latido Metabólico + Síntesis Celular',
        timbreDesc: 'Doble pulso orgánico grave acompañado de un destello armónico bio-esmeralda.',
        waveformSummary: 'Heartbeat 65/95 Hz + Harmonic Rise 280→560 Hz',
        durationMs: 480,
      },
      {
        key: 'B',
        title: 'Muda de Quitina Fresca',
        timbreDesc: 'Desprendimiento rápido de caparazón dañado y endurecimiento cristalino.',
        waveformSummary: 'Sweep 320→980 Hz + Lock Orgánico',
        durationMs: 410,
      },
      {
        key: 'C',
        title: 'Pulso de Simbiosis Sináptica',
        timbreDesc: 'Onda cálida y envolvente de baja fatiga auditiva.',
        waveformSummary: 'Sine Chord 220/330/440 Hz con filtro suave',
        durationMs: 450,
      },
    ],
  },
  {
    id: 'ski_skill_4',
    category: 'skithid_combat',
    factionId: 'skithid',
    codeTag: 'HABILIDAD [4] · BUFF +35% ATQ',
    title: 'Frenesí (Hiper-Reflejos del Enjambre)',
    triggerMoment: 'Al activar [4] Frenesí para acelerar el metabolismo ofensivo por 2 turnos.',
    gameplayPurpose: 'Evocar aceleración biológica depredadora y vibración de élitros.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Aceleración Adrenalínica + Élitros',
        timbreDesc: 'Zumbido biológico que sube de tono con pulsación rápida de combate.',
        waveformSummary: 'AM Modulated Saw 140→520 Hz (Tremolo 18 Hz)',
        durationMs: 500,
      },
      {
        key: 'B',
        title: 'Resonancia de Mente Enjambre',
        timbreDesc: 'Acorde bio-eléctrico ascendente con textura orgánica.',
        waveformSummary: '3x Detuned Triangle 180→460 Hz',
        durationMs: 470,
      },
      {
        key: 'C',
        title: 'Descarga Sináptica de Caza',
        timbreDesc: 'Pulso seco y agresivo que marca el inicio del asalto.',
        waveformSummary: 'Sub Punch 90 Hz + Sweep 250→720 Hz',
        durationMs: 400,
      },
    ],
  },

  // ============================================================================
  // 3. EL NEXO CYGNUS
  // ============================================================================
  {
    id: 'cyg_basic',
    category: 'cygnus_combat',
    factionId: 'cygnus',
    codeTag: 'ATAQUE BÁSICO [ESPACIO]',
    title: 'Pulso de Lanza Fotónica',
    triggerMoment: 'Al ejecutar el Ataque Básico de energía pura de Cygnus.',
    gameplayPurpose: 'Sonar limpio, tecnológico y preciso como un colimador láser de alta gama.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Pulso Fotónico Colimado',
        timbreDesc: 'Disparo láser limpio con barrido descendente cristalino y cola armónica corta.',
        waveformSummary: 'Sine/Triangle 980→160 Hz + Armónico 1.9 kHz',
        durationMs: 220,
      },
      {
        key: 'B',
        title: 'Aguja Taquiónica de Fase',
        timbreDesc: 'Destello agudo ultrarrápido con resonancia de cristal cuántico.',
        waveformSummary: 'FM Bell 1320→240 Hz',
        durationMs: 190,
      },
      {
        key: 'C',
        title: 'Descarga de Plasma Suave',
        timbreDesc: 'Tono más grave y redondeado para máxima comodidad auditiva en auto-combate.',
        waveformSummary: 'Sine 540→95 Hz + Sub 110 Hz',
        durationMs: 230,
      },
    ],
  },
  {
    id: 'cyg_skill_1',
    category: 'cygnus_combat',
    factionId: 'cygnus',
    codeTag: 'HABILIDAD [1] · DAÑO 175%',
    title: 'Haz Fotónico (+Fijado Lumínico -50% Evasión)',
    triggerMoment: 'Al disparar [1] Haz Fotónico que ilumina al objetivo y anula su esquiva.',
    gameplayPurpose: 'Combinar el sonido de un haz convergente con un "Lock-On" (fijación de blanco) cristalino.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Haz Convergente + Telemetría Lock-On',
        timbreDesc: 'Carga prismática seguida de un haz energético y doble pitido cristalino de fijación.',
        waveformSummary: 'Beam 1100→180 Hz + 2x Lock Beep 1480/1760 Hz',
        durationMs: 480,
      },
      {
        key: 'B',
        title: 'Lanza de Singularidad Orbital',
        timbreDesc: 'Implosión gravitatoria breve seguida de una descarga de alta energía.',
        waveformSummary: 'Reverse Rise 140→880 Hz + Drop 60 Hz',
        durationMs: 510,
      },
      {
        key: 'C',
        title: 'Refracción de Prisma Cuántico',
        timbreDesc: 'Arpegio luminoso ultrarrápido que impacta como un rayo concentrado.',
        waveformSummary: 'Arp 660/880/1320 Hz + Impacto 140 Hz',
        durationMs: 430,
      },
    ],
  },
  {
    id: 'cyg_skill_2',
    category: 'cygnus_combat',
    factionId: 'cygnus',
    codeTag: 'HABILIDAD [2] · CONTROL',
    title: 'Prisión Fase (Desfase Temporal + Cancelar Carga !)',
    triggerMoment: 'Al usar [2] Prisión Fase para encerrar al enemigo en un bolsillo dimensional.',
    gameplayPurpose: 'Sentir que el tiempo y el espacio alrededor del enemigo se congelan.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Colapso Dimensional + Pausa de Fase',
        timbreDesc: 'Barrido gravitacional que desacelera el sonido hasta detenerlo en un cierre cristalino.',
        waveformSummary: 'Pitch Bend 640→65 Hz + Cierre Cristal 1240 Hz',
        durationMs: 450,
      },
      {
        key: 'B',
        title: 'Jaula Electromagnética de Nexo',
        timbreDesc: 'Tres sellos geométricos rápidos que bloquean el movimiento del objetivo.',
        waveformSummary: '3x Square 880/660/440 Hz con Reverb corta',
        durationMs: 400,
      },
      {
        key: 'C',
        title: 'Inversión de Punto Cero',
        timbreDesc: 'Vacío acústico grave seguido de un destello de contención.',
        waveformSummary: 'Sub Suck 160→42 Hz + Ping 1050 Hz',
        durationMs: 420,
      },
    ],
  },
  {
    id: 'cyg_skill_3',
    category: 'cygnus_combat',
    factionId: 'cygnus',
    codeTag: 'HABILIDAD [3] · RESTAURAR',
    title: 'Recarga (+Escudo Cuántico, +HP y Purga)',
    triggerMoment: 'Al usar [3] Recarga para restaurar la Barrera de Fase y limpiar Sobrecarga/Ácido.',
    gameplayPurpose: 'Transmitir la restauración limpia e inmediata de un escudo energético sci-fi.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Armónico Cristalino Ascendente',
        timbreDesc: 'Barrido luminoso de escudo recargándose con acorde final de estabilidad cuántica.',
        waveformSummary: 'Rise 240→960 Hz + Acorde 480/720/960 Hz',
        durationMs: 460,
      },
      {
        key: 'B',
        title: 'Recompilación de Matriz de Fase',
        timbreDesc: 'Secuencia rápida de nodos digitales que reconstruyen la barrera.',
        waveformSummary: '4x Sine Steps 320→480→640→880 Hz',
        durationMs: 420,
      },
      {
        key: 'C',
        title: 'Pulso de Inyección Taquiónica',
        timbreDesc: 'Onda suave de energía azulada sin frecuencias agudas brillantes.',
        waveformSummary: 'Triangle Rise 180→540 Hz',
        durationMs: 400,
      },
    ],
  },
  {
    id: 'cyg_skill_4',
    category: 'cygnus_combat',
    factionId: 'cygnus',
    codeTag: 'HABILIDAD [4] · BUFF +35% ATQ',
    title: 'Resonancia (Sincronización de Punto Cero)',
    triggerMoment: 'Al activar [4] Resonancia para sobrecargar armas y escudos por 2 turnos.',
    gameplayPurpose: 'Sonar como una singularidad armónica entrando en fase perfecta.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Sincronización de Coro Cuántico',
        timbreDesc: 'Acorde espacial expansivo con modulación armónica de alta tecnología.',
        waveformSummary: 'Detuned Sine/Triangle 260/390/520→780 Hz',
        durationMs: 520,
      },
      {
        key: 'B',
        title: 'Acelerador de Frecuencia Taquiónica',
        timbreDesc: 'Pulso rítmico ascendente que estabiliza la sobrecarga ofensiva.',
        waveformSummary: 'Sweep 190→760 Hz + Octava brillante',
        durationMs: 460,
      },
      {
        key: 'C',
        title: 'Convergencia de Anillos del Nexo',
        timbreDesc: 'Dos anillos magnéticos alineándose en un pulso profundo.',
        waveformSummary: 'Dual Pitch Lock 220→440 Hz + Sub 110 Hz',
        durationMs: 440,
      },
    ],
  },

  // ============================================================================
  // 4. IMPACTOS EN DEFENSA, RUPTURA Y FLUJO DE ARENA
  // ============================================================================
  {
    id: 'hit_armor',
    category: 'combat_impacts',
    codeTag: 'IMPACTO DEFENSA · BLINDAJE',
    title: 'Golpe Absorbido por Placas Acorazadas',
    triggerMoment: 'Cuando una unidad con Blindaje (Valari / Colosos) recibe daño en su barra de defensa.',
    gameplayPurpose: 'Diferenciar auditivamente que estás golpeando metal pesado y placas reactivas.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Choque Metálico Pesado',
        timbreDesc: 'Golpe contundente contra acero laminado con breve resonancia grave.',
        waveformSummary: 'Square/Noise 190 Hz + Ring 310 Hz',
        durationMs: 180,
      },
      {
        key: 'B',
        title: 'Rebote Balístico en Placa',
        timbreDesc: 'Impacto seco con un sutil ricochet metálico corto.',
        waveformSummary: 'Punch 150 Hz + Ping 1150→680 Hz',
        durationMs: 195,
      },
      {
        key: 'C',
        title: 'Impacto Acorazado Mate',
        timbreDesc: 'Golpe grave amortiguado, ideal para no fatigar en velocidades x2 y x3.',
        waveformSummary: 'Sine 125→42 Hz + Lowpass 450 Hz',
        durationMs: 150,
      },
    ],
  },
  {
    id: 'hit_shield',
    category: 'combat_impacts',
    codeTag: 'IMPACTO DEFENSA · ESCUDO',
    title: 'Golpe Absorbido por Escudo Cuántico',
    triggerMoment: 'Cuando una unidad con Escudos (Cygnus / Sondas) absorbe daño con su barrera.',
    gameplayPurpose: 'Hacer evidente que el golpe chocó contra un campo energético antes de tocar el HP.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Ondulación de Campo Energético',
        timbreDesc: 'Vibración electromagnética clara al dispersar la energía del impacto.',
        waveformSummary: 'FM Ripple 620→210 Hz + Sub 95 Hz',
        durationMs: 190,
      },
      {
        key: 'B',
        title: 'Chisporroteo de Fase',
        timbreDesc: 'Descarga estática corta sobre la cúpula de contención.',
        waveformSummary: 'Bandpass Noise 1.4 kHz + Sine 440→180 Hz',
        durationMs: 175,
      },
      {
        key: 'C',
        title: 'Absorción Cristalina Suave',
        timbreDesc: 'Tono vítreo corto y elegante al amortiguar el disparo.',
        waveformSummary: 'Triangle 780→260 Hz',
        durationMs: 160,
      },
    ],
  },
  {
    id: 'hit_evasion',
    category: 'combat_impacts',
    codeTag: 'IMPACTO DEFENSA · ESQUIVA',
    title: 'Maniobra de Esquiva / Roce Sináptico',
    triggerMoment: 'Cuando una unidad ágil (Skithid / Hostigadores) mitiga el golpe con su barra de Esquiva.',
    gameplayPurpose: 'Transmitir agilidad y desplazamiento de aire en lugar de un choque sólido.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Desplazamiento Rápido de Aire (Whoosh)',
        timbreDesc: 'Barrido aerodinámico corto que indica una finta veloz.',
        waveformSummary: 'Bandpass Noise Sweep 350→1200→280 Hz',
        durationMs: 170,
      },
      {
        key: 'B',
        title: 'Paso Sombra Bio-Eléctrico',
        timbreDesc: 'Deslizamiento orgánico con un pulso sináptico corto.',
        waveformSummary: 'Sine Glide 420→160 Hz + Air Noise',
        durationMs: 165,
      },
      {
        key: 'C',
        title: 'Finta Ultrasónica Corta',
        timbreDesc: 'Efecto ágil y minimalista para combates rápidos.',
        waveformSummary: 'Triangle 580→190 Hz (120 ms)',
        durationMs: 130,
      },
    ],
  },
  {
    id: 'guard_break',
    category: 'combat_impacts',
    codeTag: 'EVENTO CRÍTICO · ¡RUPTURA!',
    title: 'Quiebre Total de Defensa (¡Ruptura!)',
    triggerMoment: 'En el instante exacto en que la barra de Defensa llega a 0 y el objetivo queda expuesto (+50% daño).',
    gameplayPurpose: 'Momento clave del combate: debe sonar sumamente satisfactorio y avisar que es hora de lanzar la habilidad [1].',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Estallido de Colapso de Guardia',
        timbreDesc: 'Fractura energética y metálica contundente con caída grave que anuncia vulnerabilidad total.',
        waveformSummary: 'Shatter 1450/820 Hz + Sub Drop 180→35 Hz',
        durationMs: 520,
      },
      {
        key: 'B',
        title: 'Sobrecarga y Apagado de Escudo/Placa',
        timbreDesc: 'Despresurización descendente rápida con destello de impacto crítico.',
        waveformSummary: 'Sawtooth Power-Down 720→45 Hz + Punch',
        durationMs: 480,
      },
      {
        key: 'C',
        title: 'Pulso Táctico de Ruptura Confirmada',
        timbreDesc: 'Impacto seco seguido de un doble tono de alerta de ejecución disponible.',
        waveformSummary: 'Impact 110 Hz + 2x Ping 880/1175 Hz',
        durationMs: 440,
      },
    ],
  },
  {
    id: 'enemy_heavy_warn',
    category: 'combat_impacts',
    codeTag: 'TELEMETRÍA · CARGA PESADA (!)',
    title: 'Alerta de Ataque Pesado Enemigo (!)',
    triggerMoment: 'Cuando un enemigo prepara un Ataque Pesado (!) para su próximo turno.',
    gameplayPurpose: 'Avisar sutilmente al jugador para que use su habilidad [2] de Control e interrumpa el golpe.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Radar Táctico de Amenaza (Doble Pulso)',
        timbreDesc: 'Dos pulsos graves-medios de telemetría militar que alertan sin resultar estridentes.',
        waveformSummary: '2x Triangle 440→520 Hz con filtro suave',
        durationMs: 320,
      },
      {
        key: 'B',
        title: 'Carga de Condensador Hostil',
        timbreDesc: 'Tono ascendente corto que indica que el arma enemiga está acumulando energía.',
        waveformSummary: 'Sawtooth Rise 160→420 Hz',
        durationMs: 350,
      },
      {
        key: 'C',
        title: 'Alerta Grave de Asedio',
        timbreDesc: 'Un único pulso grave de advertencia táctica muy sobrio.',
        waveformSummary: 'Sine/Square 240 Hz (220 ms)',
        durationMs: 240,
      },
    ],
  },
  {
    id: 'wave_victory',
    category: 'combat_impacts',
    codeTag: 'FLUJO DE ARENA · VICTORIA',
    title: 'Oleada Despejada y Extracción de Botín',
    triggerMoment: 'Al derrotar al último enemigo de una oleada y recibir Créditos y Materiales.',
    gameplayPurpose: 'Recompensar el cierre de la oleada con una confirmación limpia de botín asegurado.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Confirmación Táctica de Sector Limpio',
        timbreDesc: 'Acorde sintético sobrio de 3 notas ascendentes estilo ciencia ficción dura.',
        waveformSummary: 'Arp Triangle 330 → 440 → 660 Hz',
        durationMs: 550,
      },
      {
        key: 'B',
        title: 'Transmisión de Botín Asegurado',
        timbreDesc: 'Doble pulso cristalino de telemetría con cierre cálido.',
        waveformSummary: 'Sine 480 → 720 Hz + Sub 120 Hz',
        durationMs: 460,
      },
      {
        key: 'C',
        title: 'Sello de Victoria Minimalista',
        timbreDesc: 'Un acorde corto y profundo que no interrumpe el ritmo en modo Auto IA.',
        waveformSummary: 'Chord 261/392/523 Hz (380 ms)',
        durationMs: 380,
      },
    ],
  },

  // ============================================================================
  // 5. INTERFAZ TÁCTICA (UI), REACTOR Y FORJA
  // ============================================================================
  {
    id: 'ui_click',
    category: 'ui_citadel',
    codeTag: 'UI · NAVEGACIÓN Y BOTONES',
    title: 'Click Táctico de Interfaz y Selección',
    triggerMoment: 'Al cambiar de pestaña en el menú lateral, seleccionar una pieza de chasis o elegir planeta.',
    gameplayPurpose: 'Dar respuesta física e inmediata a los botones Glass sin cansar el oído.',
    recommendedOption: 'C',
    options: [
      {
        key: 'A',
        title: 'Micro-Pulso Mecánico Mate',
        timbreDesc: 'Clic corto, cálido y preciso, inspirado en consolas de mando aeroespaciales.',
        waveformSummary: 'Sine 620→180 Hz (45 ms)',
        durationMs: 55,
      },
      {
        key: 'B',
        title: 'Clic Óptico Cristalino',
        timbreDesc: 'Toque ligeramente más brillante y cristalino.',
        waveformSummary: 'Triangle 1100→340 Hz (40 ms)',
        durationMs: 50,
      },
      {
        key: 'C',
        title: 'Relé Magnético Grave',
        timbreDesc: 'Conmutación ultra-suave de baja frecuencia, casi imperceptible pero táctil.',
        waveformSummary: 'Sine 340→95 Hz (50 ms)',
        durationMs: 60,
      },
    ],
  },
  {
    id: 'ui_reactor_protocol',
    category: 'ui_citadel',
    codeTag: 'REACTOR · PROTOCOLOS Y MW',
    title: 'Conmutación de Protocolo del Reactor / Modo Ahorro',
    triggerMoment: 'Al activar Protocolo Industrial/Orbital/Bélico o alternar Modo Ahorro en un Chasis.',
    gameplayPurpose: 'Hacer sentir el desvío real de Megavatios (MW) dentro del núcleo energético.',
    recommendedOption: 'A',
    options: [
      {
        key: 'A',
        title: 'Enclavamiento de Turbina y Red MW',
        timbreDesc: 'Cierre de disyuntor pesado seguido de un pulso ascendente de energía estabilizada.',
        waveformSummary: 'Clank 160 Hz + Power Hum 110→330 Hz',
        durationMs: 420,
      },
      {
        key: 'B',
        title: 'Sincronización de Condensadores',
        timbreDesc: 'Barrido electrónico limpio que confirma el cambio de ruta de potencia.',
        waveformSummary: 'Sine/Saw 220→550 Hz',
        durationMs: 360,
      },
      {
        key: 'C',
        title: 'Conmutador Industrial Seco',
        timbreDesc: 'Doble golpe de relé energético rápido y directo.',
        waveformSummary: '2x Pulse 180/360 Hz',
        durationMs: 280,
      },
    ],
  },
  {
    id: 'ui_forge_craft',
    category: 'ui_citadel',
    codeTag: 'FORJA · SÍNTESIS Y CHASIS',
    title: 'Síntesis de Material / Evolución de Chasis',
    triggerMoment: 'Al completar una aleación en la Forja o subir de nivel cualquiera de los 5 Chasis del Héroe.',
    gameplayPurpose: 'Celebrar la mejora permanente del equipamiento con sensación de forja industrial.',
    recommendedOption: 'B',
    options: [
      {
        key: 'A',
        title: 'Martillo de Ensamblaje + Sello Térmico',
        timbreDesc: 'Impacto de prensa de forja seguido de un siseo de enfriamiento y nota de mejora.',
        waveformSummary: 'Anvil 240/480 Hz + Steam Noise + Chime 660 Hz',
        durationMs: 520,
      },
      {
        key: 'B',
        title: 'Compilación de Materia Completada',
        timbreDesc: 'Secuencia ascendente de precisión que sella la nueva pieza.',
        waveformSummary: 'Arp 293 → 440 → 587 → 880 Hz',
        durationMs: 460,
      },
      {
        key: 'C',
        title: 'Calibración Pesada de Chasis',
        timbreDesc: 'Acoplamiento mecánico grave con confirmación de potencia.',
        waveformSummary: 'Sub Lock 110 Hz + Harmonic 440 Hz',
        durationMs: 410,
      },
    ],
  },
];

// ============================================================================
// MOTOR DE SÍNTESIS PROCEDURAL WEB AUDIO API (CERO ARCHIVOS EXTERNOS REQUERIDOS)
// ============================================================================
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      sharedAudioCtx = new AudioCtxClass();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

function createNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const frameCount = Math.max(1, Math.floor(sampleRate * durationSec));
  const buffer = ctx.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function playToneSweep(
  ctx: AudioContext,
  master: GainNode,
  params: {
    type: OscillatorType;
    startFreq: number;
    endFreq: number;
    startTime: number;
    duration: number;
    peakGain: number;
    filterFreq?: number;
  }
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = params.type;
  osc.frequency.setValueAtTime(Math.max(20, params.startFreq), params.startTime);
  osc.frequency.exponentialRampToValueAtTime(
    Math.max(20, params.endFreq),
    params.startTime + params.duration
  );

  gain.gain.setValueAtTime(0.0001, params.startTime);
  gain.gain.linearRampToValueAtTime(params.peakGain, params.startTime + Math.min(0.015, params.duration * 0.2));
  gain.gain.exponentialRampToValueAtTime(0.0001, params.startTime + params.duration);

  if (params.filterFreq) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(params.filterFreq, params.startTime);
    osc.connect(filter);
    filter.connect(gain);
  } else {
    osc.connect(gain);
  }

  gain.connect(master);
  osc.start(params.startTime);
  osc.stop(params.startTime + params.duration + 0.02);
}

function playNoiseBurst(
  ctx: AudioContext,
  master: GainNode,
  params: {
    startTime: number;
    duration: number;
    filterType: BiquadFilterType;
    startFreq: number;
    endFreq: number;
    q?: number;
    peakGain: number;
  }
) {
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, params.duration + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = params.filterType;
  filter.Q.setValueAtTime(params.q ?? 2.5, params.startTime);
  filter.frequency.setValueAtTime(Math.max(40, params.startFreq), params.startTime);
  filter.frequency.exponentialRampToValueAtTime(
    Math.max(40, params.endFreq),
    params.startTime + params.duration
  );

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, params.startTime);
  gain.gain.linearRampToValueAtTime(params.peakGain, params.startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, params.startTime + params.duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  noise.start(params.startTime);
  noise.stop(params.startTime + params.duration + 0.02);
}

/**
 * Reproduce en tiempo real cualquiera de las 24 señales × 3 opciones (A, B, C)
 */
export function playSynthesizedSound(
  cueId: string,
  option: SoundOptionKey = 'A',
  volume = 0.75
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + 0.01;
  const master = ctx.createGain();
  master.gain.setValueAtTime(Math.max(0.05, Math.min(1, volume)), now);
  master.connect(ctx.destination);

  switch (cueId) {
    // -------------------------------------------------------------------------
    // VALARI
    // -------------------------------------------------------------------------
    case 'val_basic': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 165,
          endFreq: 36,
          startTime: now,
          duration: 0.22,
          peakGain: 0.55,
        });
        playNoiseBurst(ctx, master, {
          startTime: now,
          duration: 0.14,
          filterType: 'bandpass',
          startFreq: 1100,
          endFreq: 320,
          q: 2.2,
          peakGain: 0.35,
        });
      } else if (option === 'B') {
        [0, 0.085].forEach((offset) => {
          playToneSweep(ctx, master, {
            type: 'sawtooth',
            startFreq: 190,
            endFreq: 44,
            startTime: now + offset,
            duration: 0.14,
            peakGain: 0.42,
            filterFreq: 900,
          });
          playNoiseBurst(ctx, master, {
            startTime: now + offset,
            duration: 0.09,
            filterType: 'bandpass',
            startFreq: 1300,
            endFreq: 450,
            q: 3,
            peakGain: 0.28,
          });
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 135,
          endFreq: 32,
          startTime: now,
          duration: 0.18,
          peakGain: 0.58,
          filterFreq: 520,
        });
        playNoiseBurst(ctx, master, {
          startTime: now,
          duration: 0.08,
          filterType: 'lowpass',
          startFreq: 680,
          endFreq: 180,
          peakGain: 0.25,
        });
      }
      break;
    }

    case 'val_skill_1': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'sawtooth',
          startFreq: 195,
          endFreq: 28,
          startTime: now,
          duration: 0.42,
          peakGain: 0.55,
          filterFreq: 750,
        });
        playNoiseBurst(ctx, master, {
          startTime: now,
          duration: 0.32,
          filterType: 'lowpass',
          startFreq: 1400,
          endFreq: 140,
          peakGain: 0.42,
        });
        // Pulso disruptor de escudos
        playToneSweep(ctx, master, {
          type: 'square',
          startFreq: 440,
          endFreq: 135,
          startTime: now + 0.14,
          duration: 0.26,
          peakGain: 0.26,
          filterFreq: 1100,
        });
      } else if (option === 'B') {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 680,
          endFreq: 160,
          startTime: now,
          duration: 0.14,
          peakGain: 0.25,
        });
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 150,
          endFreq: 25,
          startTime: now + 0.12,
          duration: 0.38,
          peakGain: 0.6,
        });
        playNoiseBurst(ctx, master, {
          startTime: now + 0.12,
          duration: 0.35,
          filterType: 'lowpass',
          startFreq: 1100,
          endFreq: 110,
          peakGain: 0.45,
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'sawtooth',
          startFreq: 860,
          endFreq: 52,
          startTime: now,
          duration: 0.34,
          peakGain: 0.48,
        });
        playNoiseBurst(ctx, master, {
          startTime: now,
          duration: 0.2,
          filterType: 'bandpass',
          startFreq: 2200,
          endFreq: 480,
          q: 3.5,
          peakGain: 0.36,
        });
      }
      break;
    }

    case 'val_skill_2': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 145,
          endFreq: 38,
          startTime: now,
          duration: 0.35,
          peakGain: 0.55,
        });
        playToneSweep(ctx, master, {
          type: 'square',
          startFreq: 290,
          endFreq: 185,
          startTime: now + 0.02,
          duration: 0.28,
          peakGain: 0.25,
          filterFreq: 850,
        });
      } else if (option === 'B') {
        playNoiseBurst(ctx, master, {
          startTime: now,
          duration: 0.15,
          filterType: 'bandpass',
          startFreq: 1400,
          endFreq: 500,
          q: 4,
          peakGain: 0.4,
        });
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 340,
          endFreq: 70,
          startTime: now + 0.04,
          duration: 0.3,
          peakGain: 0.48,
        });
      } else {
        [0, 0.09].forEach((off, idx) => {
          playToneSweep(ctx, master, {
            type: 'square',
            startFreq: idx === 0 ? 125 : 98,
            endFreq: 42,
            startTime: now + off,
            duration: 0.2,
            peakGain: 0.4,
            filterFreq: 580,
          });
        });
      }
      break;
    }

    case 'val_skill_3': {
      if (option === 'A') {
        playNoiseBurst(ctx, master, {
          startTime: now,
          duration: 0.16,
          filterType: 'bandpass',
          startFreq: 900,
          endFreq: 1800,
          q: 3,
          peakGain: 0.25,
        });
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 220,
          endFreq: 330,
          startTime: now + 0.12,
          duration: 0.14,
          peakGain: 0.38,
        });
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 330,
          endFreq: 520,
          startTime: now + 0.24,
          duration: 0.22,
          peakGain: 0.4,
        });
      } else if (option === 'B') {
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 95,
          endFreq: 290,
          startTime: now,
          duration: 0.28,
          peakGain: 0.45,
        });
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 440,
          endFreq: 440,
          startTime: now + 0.26,
          duration: 0.14,
          peakGain: 0.32,
        });
      } else {
        playNoiseBurst(ctx, master, {
          startTime: now,
          duration: 0.28,
          filterType: 'bandpass',
          startFreq: 420,
          endFreq: 1650,
          q: 4,
          peakGain: 0.3,
        });
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 260,
          endFreq: 390,
          startTime: now + 0.14,
          duration: 0.25,
          peakGain: 0.35,
        });
      }
      break;
    }

    case 'val_skill_4': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'sawtooth',
          startFreq: 85,
          endFreq: 340,
          startTime: now,
          duration: 0.48,
          peakGain: 0.38,
          filterFreq: 950,
        });
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 170,
          endFreq: 510,
          startTime: now + 0.08,
          duration: 0.42,
          peakGain: 0.3,
        });
      } else if (option === 'B') {
        [0, 0.14].forEach((off) => {
          playToneSweep(ctx, master, {
            type: 'triangle',
            startFreq: 560,
            endFreq: 620,
            startTime: now + off,
            duration: 0.1,
            peakGain: 0.32,
          });
        });
        playToneSweep(ctx, master, {
          type: 'sawtooth',
          startFreq: 120,
          endFreq: 295,
          startTime: now + 0.22,
          duration: 0.26,
          peakGain: 0.38,
          filterFreq: 800,
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'square',
          startFreq: 110,
          endFreq: 440,
          startTime: now,
          duration: 0.4,
          peakGain: 0.3,
          filterFreq: 900,
        });
      }
      break;
    }

    // -------------------------------------------------------------------------
    // SKITHID
    // -------------------------------------------------------------------------
    case 'ski_basic': {
      if (option === 'A') {
        playNoiseBurst(ctx, master, {
          startTime: now,
          duration: 0.16,
          filterType: 'bandpass',
          startFreq: 1950,
          endFreq: 340,
          q: 4.5,
          peakGain: 0.42,
        });
        playToneSweep(ctx, master, {
          type: 'sawtooth',
          startFreq: 540,
          endFreq: 95,
          startTime: now,
          duration: 0.17,
          peakGain: 0.34,
          filterFreq: 1400,
        });
      } else if (option === 'B') {
        [0, 0.065].forEach((off) => {
          playToneSweep(ctx, master, {
            type: 'triangle',
            startFreq: 640,
            endFreq: 135,
            startTime: now + off,
            duration: 0.12,
            peakGain: 0.38,
          });
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 490,
          endFreq: 62,
          startTime: now,
          duration: 0.18,
          peakGain: 0.48,
        });
        playNoiseBurst(ctx, master, {
          startTime: now,
          duration: 0.11,
          filterType: 'highpass',
          startFreq: 900,
          endFreq: 300,
          peakGain: 0.22,
        });
      }
      break;
    }

    case 'ski_skill_1': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'sawtooth',
          startFreq: 1250,
          endFreq: 95,
          startTime: now,
          duration: 0.26,
          peakGain: 0.42,
          filterFreq: 1800,
        });
        // Burbujeo ácido
        [0.1, 0.18, 0.26, 0.34].forEach((off, i) => {
          playToneSweep(ctx, master, {
            type: 'sine',
            startFreq: 320 + i * 95,
            endFreq: 580 + i * 70,
            startTime: now + off,
            duration: 0.09,
            peakGain: 0.26,
          });
        });
        playNoiseBurst(ctx, master, {
          startTime: now + 0.06,
          duration: 0.36,
          filterType: 'bandpass',
          startFreq: 1200,
          endFreq: 520,
          q: 6,
          peakGain: 0.32,
        });
      } else if (option === 'B') {
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 390,
          endFreq: 88,
          startTime: now,
          duration: 0.32,
          peakGain: 0.45,
        });
        playNoiseBurst(ctx, master, {
          startTime: now,
          duration: 0.38,
          filterType: 'bandpass',
          startFreq: 1600,
          endFreq: 420,
          q: 8,
          peakGain: 0.4,
        });
      } else {
        [0, 0.11].forEach((off) => {
          playToneSweep(ctx, master, {
            type: 'sawtooth',
            startFreq: 280,
            endFreq: 52,
            startTime: now + off,
            duration: 0.2,
            peakGain: 0.44,
            filterFreq: 900,
          });
        });
      }
      break;
    }

    case 'ski_skill_2': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 1480,
          endFreq: 260,
          startTime: now,
          duration: 0.14,
          peakGain: 0.35,
        });
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 420,
          endFreq: 125,
          startTime: now + 0.1,
          duration: 0.32,
          peakGain: 0.4,
        });
      } else if (option === 'B') {
        playNoiseBurst(ctx, master, {
          startTime: now,
          duration: 0.26,
          filterType: 'bandpass',
          startFreq: 1100,
          endFreq: 340,
          q: 5,
          peakGain: 0.32,
        });
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 210,
          endFreq: 44,
          startTime: now + 0.08,
          duration: 0.3,
          peakGain: 0.48,
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'sawtooth',
          startFreq: 790,
          endFreq: 185,
          startTime: now,
          duration: 0.34,
          peakGain: 0.34,
          filterFreq: 1500,
        });
      }
      break;
    }

    case 'ski_skill_3': {
      if (option === 'A') {
        // Latido doble + ascenso celular
        [0, 0.14].forEach((off, i) => {
          playToneSweep(ctx, master, {
            type: 'sine',
            startFreq: i === 0 ? 85 : 115,
            endFreq: 45,
            startTime: now + off,
            duration: 0.14,
            peakGain: 0.52,
          });
        });
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 280,
          endFreq: 560,
          startTime: now + 0.18,
          duration: 0.28,
          peakGain: 0.34,
        });
      } else if (option === 'B') {
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 310,
          endFreq: 920,
          startTime: now,
          duration: 0.34,
          peakGain: 0.36,
        });
      } else {
        [220, 330, 440].forEach((freq, idx) => {
          playToneSweep(ctx, master, {
            type: 'sine',
            startFreq: freq,
            endFreq: freq * 1.12,
            startTime: now + idx * 0.05,
            duration: 0.34,
            peakGain: 0.22,
          });
        });
      }
      break;
    }

    case 'ski_skill_4': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'sawtooth',
          startFreq: 145,
          endFreq: 520,
          startTime: now,
          duration: 0.44,
          peakGain: 0.35,
          filterFreq: 1300,
        });
        playNoiseBurst(ctx, master, {
          startTime: now + 0.08,
          duration: 0.32,
          filterType: 'bandpass',
          startFreq: 650,
          endFreq: 1450,
          q: 4,
          peakGain: 0.26,
        });
      } else if (option === 'B') {
        [180, 270, 360].forEach((f) => {
          playToneSweep(ctx, master, {
            type: 'triangle',
            startFreq: f,
            endFreq: f * 1.8,
            startTime: now,
            duration: 0.42,
            peakGain: 0.22,
          });
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 95,
          endFreq: 42,
          startTime: now,
          duration: 0.18,
          peakGain: 0.52,
        });
        playToneSweep(ctx, master, {
          type: 'sawtooth',
          startFreq: 240,
          endFreq: 720,
          startTime: now + 0.08,
          duration: 0.3,
          peakGain: 0.34,
          filterFreq: 1400,
        });
      }
      break;
    }

    // -------------------------------------------------------------------------
    // CYGNUS
    // -------------------------------------------------------------------------
    case 'cyg_basic': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 980,
          endFreq: 165,
          startTime: now,
          duration: 0.2,
          peakGain: 0.42,
        });
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 1960,
          endFreq: 420,
          startTime: now,
          duration: 0.14,
          peakGain: 0.2,
        });
      } else if (option === 'B') {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 1350,
          endFreq: 240,
          startTime: now,
          duration: 0.17,
          peakGain: 0.4,
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 540,
          endFreq: 95,
          startTime: now,
          duration: 0.21,
          peakGain: 0.48,
        });
      }
      break;
    }

    case 'cyg_skill_1': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'sawtooth',
          startFreq: 1120,
          endFreq: 175,
          startTime: now,
          duration: 0.34,
          peakGain: 0.38,
          filterFreq: 2200,
        });
        // Doble pitido Lock-On de Fijación Lumínica
        [0.22, 0.32].forEach((off, idx) => {
          playToneSweep(ctx, master, {
            type: 'sine',
            startFreq: idx === 0 ? 1480 : 1760,
            endFreq: idx === 0 ? 1480 : 1760,
            startTime: now + off,
            duration: 0.08,
            peakGain: 0.3,
          });
        });
      } else if (option === 'B') {
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 140,
          endFreq: 880,
          startTime: now,
          duration: 0.22,
          peakGain: 0.38,
        });
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 680,
          endFreq: 55,
          startTime: now + 0.2,
          duration: 0.28,
          peakGain: 0.52,
        });
      } else {
        [660, 880, 1320].forEach((freq, i) => {
          playToneSweep(ctx, master, {
            type: 'triangle',
            startFreq: freq,
            endFreq: freq * 0.7,
            startTime: now + i * 0.055,
            duration: 0.18,
            peakGain: 0.3,
          });
        });
      }
      break;
    }

    case 'cyg_skill_2': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 640,
          endFreq: 62,
          startTime: now,
          duration: 0.36,
          peakGain: 0.48,
        });
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 1240,
          endFreq: 620,
          startTime: now + 0.24,
          duration: 0.16,
          peakGain: 0.3,
        });
      } else if (option === 'B') {
        [880, 660, 440].forEach((f, idx) => {
          playToneSweep(ctx, master, {
            type: 'square',
            startFreq: f,
            endFreq: f * 0.85,
            startTime: now + idx * 0.09,
            duration: 0.12,
            peakGain: 0.25,
            filterFreq: 1400,
          });
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 170,
          endFreq: 40,
          startTime: now,
          duration: 0.26,
          peakGain: 0.55,
        });
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 1050,
          endFreq: 1050,
          startTime: now + 0.22,
          duration: 0.15,
          peakGain: 0.28,
        });
      }
      break;
    }

    case 'cyg_skill_3': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 240,
          endFreq: 960,
          startTime: now,
          duration: 0.34,
          peakGain: 0.38,
        });
        [480, 720, 960].forEach((f) => {
          playToneSweep(ctx, master, {
            type: 'sine',
            startFreq: f,
            endFreq: f,
            startTime: now + 0.2,
            duration: 0.22,
            peakGain: 0.18,
          });
        });
      } else if (option === 'B') {
        [320, 480, 640, 880].forEach((f, idx) => {
          playToneSweep(ctx, master, {
            type: 'sine',
            startFreq: f,
            endFreq: f * 1.05,
            startTime: now + idx * 0.075,
            duration: 0.11,
            peakGain: 0.32,
          });
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 180,
          endFreq: 540,
          startTime: now,
          duration: 0.38,
          peakGain: 0.42,
        });
      }
      break;
    }

    case 'cyg_skill_4': {
      if (option === 'A') {
        [260, 390, 520].forEach((f) => {
          playToneSweep(ctx, master, {
            type: 'triangle',
            startFreq: f,
            endFreq: f * 1.5,
            startTime: now,
            duration: 0.46,
            peakGain: 0.24,
          });
        });
      } else if (option === 'B') {
        playToneSweep(ctx, master, {
          type: 'sawtooth',
          startFreq: 190,
          endFreq: 760,
          startTime: now,
          duration: 0.42,
          peakGain: 0.32,
          filterFreq: 1600,
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 220,
          endFreq: 440,
          startTime: now,
          duration: 0.38,
          peakGain: 0.42,
        });
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 110,
          endFreq: 220,
          startTime: now,
          duration: 0.38,
          peakGain: 0.35,
        });
      }
      break;
    }

    // -------------------------------------------------------------------------
    // IMPACTOS, RUPTURA Y ARENA
    // -------------------------------------------------------------------------
    case 'hit_armor': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'square',
          startFreq: 195,
          endFreq: 58,
          startTime: now,
          duration: 0.15,
          peakGain: 0.42,
          filterFreq: 680,
        });
        playNoiseBurst(ctx, master, {
          startTime: now,
          duration: 0.1,
          filterType: 'bandpass',
          startFreq: 850,
          endFreq: 310,
          q: 3,
          peakGain: 0.32,
        });
      } else if (option === 'B') {
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 150,
          endFreq: 48,
          startTime: now,
          duration: 0.12,
          peakGain: 0.45,
        });
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 1150,
          endFreq: 640,
          startTime: now + 0.03,
          duration: 0.12,
          peakGain: 0.25,
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 125,
          endFreq: 40,
          startTime: now,
          duration: 0.14,
          peakGain: 0.52,
          filterFreq: 450,
        });
      }
      break;
    }

    case 'hit_shield': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 640,
          endFreq: 210,
          startTime: now,
          duration: 0.17,
          peakGain: 0.4,
        });
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 320,
          endFreq: 95,
          startTime: now,
          duration: 0.17,
          peakGain: 0.3,
        });
      } else if (option === 'B') {
        playNoiseBurst(ctx, master, {
          startTime: now,
          duration: 0.14,
          filterType: 'bandpass',
          startFreq: 1450,
          endFreq: 620,
          q: 4.5,
          peakGain: 0.35,
        });
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 440,
          endFreq: 180,
          startTime: now,
          duration: 0.15,
          peakGain: 0.32,
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 780,
          endFreq: 260,
          startTime: now,
          duration: 0.15,
          peakGain: 0.38,
        });
      }
      break;
    }

    case 'hit_evasion': {
      if (option === 'A') {
        playNoiseBurst(ctx, master, {
          startTime: now,
          duration: 0.16,
          filterType: 'bandpass',
          startFreq: 380,
          endFreq: 1250,
          q: 3.5,
          peakGain: 0.36,
        });
      } else if (option === 'B') {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 420,
          endFreq: 155,
          startTime: now,
          duration: 0.15,
          peakGain: 0.34,
        });
        playNoiseBurst(ctx, master, {
          startTime: now,
          duration: 0.12,
          filterType: 'highpass',
          startFreq: 900,
          endFreq: 400,
          peakGain: 0.2,
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 580,
          endFreq: 190,
          startTime: now,
          duration: 0.12,
          peakGain: 0.35,
        });
      }
      break;
    }

    case 'guard_break': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'sawtooth',
          startFreq: 185,
          endFreq: 34,
          startTime: now,
          duration: 0.45,
          peakGain: 0.55,
          filterFreq: 950,
        });
        [1420, 980, 640].forEach((f, idx) => {
          playToneSweep(ctx, master, {
            type: 'triangle',
            startFreq: f,
            endFreq: f * 0.55,
            startTime: now + idx * 0.045,
            duration: 0.18,
            peakGain: 0.32,
          });
        });
        playNoiseBurst(ctx, master, {
          startTime: now,
          duration: 0.28,
          filterType: 'bandpass',
          startFreq: 1600,
          endFreq: 320,
          q: 2.5,
          peakGain: 0.38,
        });
      } else if (option === 'B') {
        playToneSweep(ctx, master, {
          type: 'sawtooth',
          startFreq: 720,
          endFreq: 42,
          startTime: now,
          duration: 0.44,
          peakGain: 0.48,
          filterFreq: 1400,
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 120,
          endFreq: 38,
          startTime: now,
          duration: 0.22,
          peakGain: 0.52,
        });
        [0.14, 0.24].forEach((off, idx) => {
          playToneSweep(ctx, master, {
            type: 'triangle',
            startFreq: idx === 0 ? 880 : 1175,
            endFreq: idx === 0 ? 880 : 1175,
            startTime: now + off,
            duration: 0.12,
            peakGain: 0.32,
          });
        });
      }
      break;
    }

    case 'enemy_heavy_warn': {
      if (option === 'A') {
        [0, 0.14].forEach((off) => {
          playToneSweep(ctx, master, {
            type: 'triangle',
            startFreq: 440,
            endFreq: 520,
            startTime: now + off,
            duration: 0.11,
            peakGain: 0.34,
          });
        });
      } else if (option === 'B') {
        playToneSweep(ctx, master, {
          type: 'sawtooth',
          startFreq: 160,
          endFreq: 420,
          startTime: now,
          duration: 0.32,
          peakGain: 0.3,
          filterFreq: 950,
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'square',
          startFreq: 240,
          endFreq: 220,
          startTime: now,
          duration: 0.22,
          peakGain: 0.28,
          filterFreq: 600,
        });
      }
      break;
    }

    case 'wave_victory': {
      if (option === 'A') {
        [330, 440, 660].forEach((f, idx) => {
          playToneSweep(ctx, master, {
            type: 'triangle',
            startFreq: f,
            endFreq: f,
            startTime: now + idx * 0.11,
            duration: 0.24,
            peakGain: 0.34,
          });
        });
      } else if (option === 'B') {
        [480, 720].forEach((f, idx) => {
          playToneSweep(ctx, master, {
            type: 'sine',
            startFreq: f,
            endFreq: f,
            startTime: now + idx * 0.13,
            duration: 0.24,
            peakGain: 0.36,
          });
        });
      } else {
        [261.6, 392, 523.2].forEach((f) => {
          playToneSweep(ctx, master, {
            type: 'sine',
            startFreq: f,
            endFreq: f,
            startTime: now,
            duration: 0.35,
            peakGain: 0.22,
          });
        });
      }
      break;
    }

    // -------------------------------------------------------------------------
    // UI, REACTOR Y FORJA
    // -------------------------------------------------------------------------
    case 'ui_click': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 620,
          endFreq: 180,
          startTime: now,
          duration: 0.045,
          peakGain: 0.32,
        });
      } else if (option === 'B') {
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 1100,
          endFreq: 340,
          startTime: now,
          duration: 0.04,
          peakGain: 0.28,
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 340,
          endFreq: 95,
          startTime: now,
          duration: 0.05,
          peakGain: 0.36,
        });
      }
      break;
    }

    case 'ui_reactor_protocol': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'square',
          startFreq: 160,
          endFreq: 75,
          startTime: now,
          duration: 0.1,
          peakGain: 0.35,
          filterFreq: 550,
        });
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 110,
          endFreq: 330,
          startTime: now + 0.08,
          duration: 0.3,
          peakGain: 0.36,
        });
      } else if (option === 'B') {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 220,
          endFreq: 550,
          startTime: now,
          duration: 0.32,
          peakGain: 0.36,
        });
      } else {
        [180, 360].forEach((f, idx) => {
          playToneSweep(ctx, master, {
            type: 'triangle',
            startFreq: f,
            endFreq: f,
            startTime: now + idx * 0.09,
            duration: 0.1,
            peakGain: 0.35,
          });
        });
      }
      break;
    }

    case 'ui_forge_craft': {
      if (option === 'A') {
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 240,
          endFreq: 68,
          startTime: now,
          duration: 0.2,
          peakGain: 0.48,
        });
        playNoiseBurst(ctx, master, {
          startTime: now + 0.08,
          duration: 0.22,
          filterType: 'bandpass',
          startFreq: 1200,
          endFreq: 2400,
          q: 3,
          peakGain: 0.25,
        });
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 660,
          endFreq: 660,
          startTime: now + 0.22,
          duration: 0.24,
          peakGain: 0.32,
        });
      } else if (option === 'B') {
        [293.6, 440, 587.3, 880].forEach((f, idx) => {
          playToneSweep(ctx, master, {
            type: 'triangle',
            startFreq: f,
            endFreq: f,
            startTime: now + idx * 0.08,
            duration: 0.16,
            peakGain: 0.28,
          });
        });
      } else {
        playToneSweep(ctx, master, {
          type: 'sine',
          startFreq: 110,
          endFreq: 55,
          startTime: now,
          duration: 0.2,
          peakGain: 0.5,
        });
        playToneSweep(ctx, master, {
          type: 'triangle',
          startFreq: 440,
          endFreq: 440,
          startTime: now + 0.14,
          duration: 0.22,
          peakGain: 0.34,
        });
      }
      break;
    }

    default: {
      playToneSweep(ctx, master, {
        type: 'sine',
        startFreq: 440,
        endFreq: 220,
        startTime: now,
        duration: 0.15,
        peakGain: 0.3,
      });
    }
  }
}

// ============================================================================
// MAPA OFICIAL DE PRODUCCIÓN APROBADO POR EL USUARIO (24 ACTIVOS / 0 DESCARTADOS)
// ============================================================================
export const APPROVED_PRODUCTION_SOUND_MAP: Record<string, SoundOptionKey> = {
  val_basic: 'A', // Cañón Perforante Pesado
  val_skill_1: 'A', // Obús Termobárico + Pulso Disruptor
  val_skill_2: 'C', // Choque de Escudo de Titanio
  val_skill_3: 'A', // Soldadura Térmica + Remache Neumático
  val_skill_4: 'A', // Ignición de Turbina Termonuclear
  ski_basic: 'A', // Corte de Guadaña + Siseo Ácido
  ski_skill_1: 'A', // Desgarro Bioplasmático + Ebullición
  ski_skill_2: 'A', // Inyección Neural + Vibración Sináptica
  ski_skill_3: 'A', // Latido Metabólico + Síntesis Celular
  ski_skill_4: 'A', // Aceleración Adrenalínica + Élitros
  cyg_basic: 'A', // Pulso Fotónico Colimado
  cyg_skill_1: 'A', // Haz Convergente + Telemetría Lock-On
  cyg_skill_2: 'A', // Colapso Dimensional + Pausa de Fase
  cyg_skill_3: 'A', // Armónico Cristalino Ascendente
  cyg_skill_4: 'A', // Sincronización de Coro Cuántico
  hit_armor: 'A', // Choque Metálico Pesado
  hit_shield: 'A', // Ondulación de Campo Energético
  hit_evasion: 'A', // Desplazamiento Rápido de Aire (Whoosh)
  guard_break: 'A', // Estallido de Colapso de Guardia
  enemy_heavy_warn: 'A', // Radar Táctico de Amenaza (Doble Pulso)
  wave_victory: 'A', // Confirmación Táctica de Sector Limpio
  ui_click: 'C', // Relé Magnético Grave
  ui_reactor_protocol: 'A', // Enclavamiento de Turbina y Red MW
  ui_forge_craft: 'B', // Compilación de Materia Completada
};

const MUTE_STORAGE_KEY = 'vanguard_audio_muted_v1';
let globalAudioMuted = false;

if (typeof window !== 'undefined') {
  try {
    globalAudioMuted = localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
  } catch {
    globalAudioMuted = false;
  }
}

export function getGlobalAudioMuted(): boolean {
  return globalAudioMuted;
}

export function setGlobalAudioMuted(muted: boolean): void {
  globalAudioMuted = muted;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, muted ? 'true' : 'false');
    } catch {
      // Ignore storage error
    }
  }
}

/**
 * Reproduce el sonido de juego aprobado (respetando el estado global de silencio y un delay opcional)
 */
export function playGameSfx(
  cueId: keyof typeof APPROVED_PRODUCTION_SOUND_MAP | string,
  delayMs = 0,
  volume = 0.72
): void {
  if (globalAudioMuted) return;
  const option: SoundOptionKey = APPROVED_PRODUCTION_SOUND_MAP[cueId] || 'A';

  if (delayMs > 0) {
    setTimeout(() => {
      if (!globalAudioMuted) {
        playSynthesizedSound(cueId, option, volume);
      }
    }, delayMs);
  } else {
    playSynthesizedSound(cueId, option, volume);
  }
}

