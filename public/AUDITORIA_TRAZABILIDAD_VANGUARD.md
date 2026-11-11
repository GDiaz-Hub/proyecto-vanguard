# AUDITORÍA HISTÓRICA, DE PROCEDENCIA Y TRAZABILIDAD MAESTRA — PROYECTO VANGUARD

> **PROPÓSITO DE ESTE DOCUMENTO (HANDOFF PARA OTRA IA / REGISTRO DE AUDITORÍA):**
> Este archivo consolida toda la trazabilidad histórica, arquitectónica, de diseño, narrativa y matemática del proyecto **VANGUARD** (`applet_id: f283f24b-42c1-4423-a873-ea5e3f7f857b`). Está diseñado para ser exportado y entregado a otra IA o herramienta de auditoría con referencias exactas a archivos, líneas de código, marcas de tiempo y estado de cada decisión.

---

## 0. MAPA DE FUENTES: ¿DÓNDE ESTÁ DOCUMENTADA CADA COSA EN EL PROYECTO?

Antes de este archivo, la documentación del proyecto no estaba en un único documento Markdown, sino **distribuida en comentarios de auditoría dentro del código fuente, catálogos maestros de datos y artefactos del sistema**:

1. **`/src/data/factionIdentityCatalog.ts` (2.519 líneas — Fuente Primaria de Verdad Activa)**:
   - **Líneas 1–73 (`GAME_BALANCE`)**: Todas las constantes matemáticas vigentes del juego (Reactor MW, costos exponenciales, Silo, Ciudadela, probabilidades de aparición rara `3%`/`6%`, velocidades `SPD` por facción, multiplicador de Ruptura `1.35x`, pasivas de facción).
   - **Líneas 74–283 (`FACTION_RESOURCE_THEMES` y `FACTION_IDENTITIES`)**: Notas de auditoría explícitas (*"Sin referencias a 'Humano' en Valari"*, *"Evita clichés de otros juegos (sin 'Colmena' ni 'Santuario')"*), nombres de bases (`Bastión de Hierro`, `El Enjambre`, `El Nexo`) y recursos temáticos.
   - **Líneas 285–570 (`HERO_CHASSIS_PROGRESSION`)**: Los 15 Chasis del Héroe (5 Tiers por cada una de las 3 facciones) con sus requisitos de desbloqueo y multiplicadores.
   - **Líneas 574–656 (`CANONICAL_FACTION_UNITS`)**: Las 9 unidades canónicas de las facciones (usadas como rivales en el Sector 04 — Corredor de Orión).
   - **Líneas 658–995 (`SECTOR_NEUTRAL_UNITS_CATALOG` y `EPIC_SECTOR_BOSSES`)**: Las unidades rebeldes, ferales, corruptas, precursoras y del vacío de los Sectores 1, 2, 3, 5 y 6 + los 3 Jefes Épicos.
   - **Líneas 996–1143 (`PLANET_ENEMY_VARIANTS`)**: Variantes de nombres y colores por cada uno de los 23 planetas.
   - **Líneas 1145–1347 (`EQUIPMENT_BLUEPRINTS_CATALOG`)**: Los 9 planos de equipamiento forjables (Tiers I, II y III por facción).
   - **Líneas 1349–1449 (`FACTION_SKILL_LOADOUTS`)**: Las 3 habilidades tácticas activas del Comandante por facción (`slotIndex: 1, 2, 3`).
   - **Líneas 1464–2437 (`FACTION_TUTORIALS`)**: Los manuales operativos de 5 pasos redactados con la voz de cada facción.
2. **`/src/data/starMap.data.ts` (563 líneas)**:
   - Geografía galáctica completa: los **6 Sectores** (`SEC-01` a `SEC-06`) y los **23 Planetas** (Tiers I a X), incluyendo lore planetario, peligros ambientales, bonos de conquista (`conquestBonus`) y recursos.
3. **`/src/data/gameData.ts` (1.210 líneas — Catálogo de Generación Intermedia)**:
   - Contiene las definiciones de las 3 facciones (`FACTIONS`), los 6 módulos de base (`INITIAL_MODULES`), las 8 directivas (`INITIAL_DIRECTIVES`), los ítems iniciales (`INITIAL_ITEMS`) y funciones de cálculo heredadas (algunas de las cuales presentan contradicciones con `factionIdentityCatalog.ts`, documentadas en la **Sección G**).
4. **`/src/types/game.ts` (371 líneas — Estratigrafía de Tipos V1 a V5)**:
   - Define el modelo de estado actual (`GameState`, `CombatState`, `CombatSquadUnit`, `CitadelState`, `LabTechLevels`) y conserva interfaces históricas de las primeras versiones (`CombatEnemy` en líneas 137–159 del antiguo combate por ticks y `VanguardSaveData` en líneas 355–370 con `professionXp`).
5. **`/src/context/GameContext.tsx` (3.074 líneas — Motor de Ejecución)**:
   - Clave de guardado `SAVE_STORAGE_KEY = 'vanguard_mvp_save_v5_beta'` (línea 144).
   - Regla de generación de escuadrones (`generateEnemySquad`, línea 215: *"garantizando que el jugador NUNCA luche contra su propia facción en su Sector Natal"*).
   - Motor de combate táctico por turnos en 3 oleadas, cálculo de daño, Ruptura de Defensa, pasivas de facción y ciclo de producción de base cada `1000ms`.
6. **`/src/components/CombatView.tsx` (1.236 líneas — Arena Táctica y Reglas Visuales)**:
   - Contiene todas las decisiones visuales y coreográficas solicitadas por el usuario el `2026-11-10` (arenas `.jpg` `1672 × 935`, escala nativa real de sprites `(naturalHeight / 935) * 100%`, planos de profundidad `zIndex` por carril Y, embestida frontal diferenciada por peso, sombra de piso solidaria sin `drop-shadow` en el sprite, `SECUENCIA DE TURNOS` inclinada `-skew-x-[16deg]` y `Botín de Incursión` plegado con notificación).
7. **`/.aistudio/artifacts/brain/f283f24b-42c1-4423-a873-ea5e3f7f857b/implementation_plan.md`**:
   - Plan técnico de la unificación de arenas `.jpg` y sprites de unidades en `/public/assets/unidades/` (`2026-11-10T20:24:25Z`).

---

## NOTA METODOLÓGICA SOBRE EL ALCANCE DE LAS FUENTES

1. **Sin historial de Git (`git log`)**: El directorio de trabajo (`/app/applet`) no contiene un repositorio `.git` inicializado.
2. **Compactación de conversaciones previas**: El historial conversacional directo disponible en la sesión activa abarca los registros detallados del **9 y 10 de noviembre de 2026 (`2026-11-09` y `2026-11-10`)**, incluyendo las ediciones manuales directas del usuario sobre los archivos del proyecto con marca de tiempo exacta, sus solicitudes de cambio, las capturas subidas y el documento `implementation_plan.md`. Los turnos de conversación anteriores al `2026-11-09` fueron compactados por la plataforma.
3. **Estratigrafía forense en el código fuente (Generaciones V1 a V5)**: Cuando una decisión proviene de las etapas V1–V4 (anteriores al `2026-11-09`) y el código demuestra que existió una directriz de diseño pero no conserva el mensaje literal del chat, se clasifica rigurosamente como **`procedencia no determinada (anterior al historial de sesión disponible; documentado en código)`** y se vincula en el **Apartado H** para confirmación del autor.

---

## A. CRONOLOGÍA GENERAL DEL PROYECTO

La evolución de **Vanguard** se reconstruye en **cinco grandes generaciones (V1 a V5)** verificables en la arquitectura del código y en el registro de actividad reciente:

### Fase 1 (Generaciones V1–V2 — Fecha exacta no disponible en historial activo)
- **Nacimiento como `"Vanguard Idle"`**: El proyecto se concibió originalmente como un *Idle RPG de ciencia ficción con gestión de base y combate automático por ticks* (`"Vanguard Idle"`, descripción original en `metadata.json`: `"Idle RPG - Que combina gestion de base y combate por turnos."`).
- **Motor original basado en ticks (`useTickEngine` y `useCombatEngine`)**: Existían hooks dedicados al ciclo continuo de ticks y combate pasivo (`CombatEnemy` con propiedades `regenerationPerTick` y `attackIntervalSeconds` en `src/types/game.ts:137-159`, y arreglo `COMBAT_ENEMIES: CombatEnemy[] = []` en `src/data/gameData.ts:1209`).
- **Progresión temprana**: El esquema original `VanguardSaveData` (`src/types/game.ts:355-370`) contemplaba `characterXp`, `professionXp` (`miner`, `armorer`), `completedDirectives` y `unlockedRecipes`.

### Fase 2 (Generaciones V3–V4 — Fecha exacta no disponible en historial activo)
- **Auditoría de identidad faccionaria y eliminación de clichés**:
  - Se estableció una regla estricta documentada en `src/data/factionIdentityCatalog.ts:75-76, 191, 1464`: **cero uso de la palabra `"Humano"` en Valari**, enfoque 100% en el **Héroe individual y sus 5 Chasis (Tiers I a V)**, y **rechazo de nombres genéricos de otros juegos** (*"Evita clichés de otros juegos (sin 'Colmena' ni 'Santuario')"*), adoptando **`Bastión de Hierro`** (Valari), **`El Enjambre`** (Skithid) y **`El Nexo`** (Cygnus).
  - Consolidación cromática de **Cygnus** en **Azul Eléctrico (`#3B82F6`)**, documentada en `src/components/CommanderView.tsx:101`.
- **Reinvención del sistema de combate (De Idle 1v1 por ticks a Escuadrones Tácticos por Turnos en 3 Oleadas)**:
  - Se reemplazó el combate pasivo por un motor táctico por turnos (`CombatTurnPhase`, `CombatSquadUnit`, `turnQueue` ordenada por Velocidad `SPD`, intención enemiga telegrafiada `intent: 'attack' | 'heavy' | 'fortify'`, mecánicas de Guardia y **Ruptura de Defensa** al quebrar la barra secundaria de Blindaje/Caparazón/Escudo).
- **Regla de no-fratricidio en el Sector Natal**:
  - Se separó `CANONICAL_FACTION_UNITS` de `SECTOR_NEUTRAL_UNITS_CATALOG` para garantizar que *"el jugador NUNCA luche contra su propia facción en su Sector Natal"* (`src/context/GameContext.tsx:215`), enfrentando en su lugar a autómatas rebeldes (Valari), fauna abisal feral (Skithid) o espectros corruptos (Cygnus).

### Fase 3 (Consolidación de Nombre, Género y Nomenclatura — `2026-11-09`)
- **`2026-11-09T19:38:12-08:00`**: Intervención directa del usuario en `src/data/factionIdentityCatalog.ts` renombrando la habilidad del `Autómata Fundición` de `'Martillo de Escoria'` a **`'Choque de Impacto'`** y la unidad ligera Skithid de `'Larva Feral'` a **`'Larva Abisal'`**.
- **`2026-11-09T20:05:17-08:00`**: Intervención directa del usuario en `src/data/factionIdentityCatalog.ts` renombrando la habilidad del `Espectro Cromo` (Cygnus) de `'Arco Crio-Fotónico'` a **`'Arco Disrruptor'`**.
- **`2026-11-09T20:55:51-08:00` a `20:59:59-08:00`**: Intervención directa del usuario en `metadata.json`, `index.html`, `src/components/PersistentHeader.tsx` y `src/components/FaccionesView.tsx` eliminando la palabra `"Idle"` del título oficial para bautizar el proyecto definitivamente como **`"Vanguard"`** y redefiniendo su descripción oficial a: **`"RPG de estrategia y combate táctico: mejorá tu base y equipo, y llevá a tu héroe a conquistar nuevos sectores."`**

### Fase 4 (Unificación de Activos Visuales Propios y Depuración — `2026-11-10`)
- **Unificación de Arenas de Combate (`1672 × 935` `.jpg`)**: A pedido del usuario, se eliminó el sistema de doble capa (`bg` cielo + `fg` suelo) en `CombatView.tsx` y `arenaConfigs.ts`, pasando a una imagen única `.jpg` por planeta en `/public/assets/arenas/`. El usuario cargó sus propias ilustraciones `.jpg` para los 16 planetas de los Sectores 1 a 4 (`PLN-VAL-01..04`, `PLN-SKI-01..04`, `PLN-CYG-01..04`, `PLN-ORI-01..04`).
- **Unificación de Sprites de Unidades y Héroes en `/public/assets/unidades/`**: A pedido del usuario, se centralizaron todos los sprites de enemigos y héroes de combate en `/public/assets/unidades/`, utilizando los archivos `.png` creados por el usuario con sus proporciones reales.
- **Limpieza integral del repositorio**: A solicitud explícita del usuario (*"cualquier archivo o imagen que no se este usando en todo el proyecto eliminala"*), se eliminaron 7 módulos de código obsoletos (`AudioLabView.tsx`, `CoreUI.tsx`, `useCombatEngine.ts`, `useTickEngine.ts`, `artEngine.ts`, `saveManager.ts`, `arenaConfigs.ts`) y 37 archivos de imágenes huérfanas.

### Fase 5 (Refinamiento Visual, Físico y de Balance en la Arena — `2026-11-10`)
- Ajustes iterativos dirigidos por el usuario con apoyo de capturas (`image_e0b0e254.png`, `image_e6c9c754.png`, `image_762e28aa.png`):
  1. Borde negro de `1px` (`WebkitTextStroke`) y sombra reforzada en los textos de la arena.
  2. Elevación de las etiquetas flotantes sobre las unidades, eliminación del anillo coloreado del suelo, eliminación del `drop-shadow` envolvente del sprite y creación de una sombra elíptica semitransparente en el piso que acompaña el movimiento de la unidad.
  3. Reemplazo de la animación enemiga de agrandarse (`scale-[1.08]`) por embestida frontal diferenciada por peso (`light`, `medium`, `heavy`, `elite/boss`).
  4. Renderizado de los sprites a su tamaño nativo real (reemplazando el alto fijo `h-[24%]` por escala proporcional al contenedor `935px`).
  5. Planos de profundidad (`zIndex` estricto por carril Y) para evitar que unidades traseras se superpongan sobre las delanteras al embestir.
  6. Rediseño de la `SECUENCIA DE TURNOS` con el mismo lenguaje geométrico inclinado (`-skew-x-[16deg]`) de la barra de habilidades.
  7. Reubicación del `Botín de Incursión` debajo de la secuencia de turnos, iniciando plegado por defecto y con punto de notificación pulsante al acumular botín.
  8. Reducción de la probabilidad de aparición del Élite Raro de `10%` (`18%` con Orbital) a **`3%`** (**`6%`** con Orbital).

---

## B. REGISTRO DETALLADO DE DECISIONES POR ÁREA (ÁREAS 1 A 13)

### ÁREA 1: Concepto original y evolución del juego

#### Decisión 1.1: Transición de `"Vanguard Idle"` a `"Vanguard"` (RPG de estrategia y combate táctico)
- **Origen:** Usuario (confirmado por edición directa del usuario en el código).
- **Idea original:** El proyecto se llamaba inicialmente `"Vanguard Idle"` y estaba descrito como `"Idle RPG - Que combina gestion de base y combate por turnos."`
- **Propuesta de IA:** La IA había mantenido el subtítulo `"IDLE"` en el encabezado persistente (`PersistentHeader.tsx`), en `FaccionesView.tsx`, en `index.html` y en `metadata.json`.
- **Intervención del usuario:** El `2026-11-09` entre las `20:55:51` y las `20:59:59`, el usuario editó manualmente `metadata.json`, `index.html`, `src/components/PersistentHeader.tsx` y `src/components/FaccionesView.tsx` para quitar `"Idle"` del nombre y cambiar la definición del juego a `"RPG de estrategia y combate táctico: mejorá tu base y equipo, y llevá a tu héroe a conquistar nuevos sectores."`
- **Evolución:** Pasó de ser un juego centrado en mecánicas pasivas/idle a un RPG táctico de conquista sectorial donde la gestión de la base alimenta la preparación del Héroe para incursiones tácticas por turnos.
- **Estado:** Vigente.
- **Evidencia:** Historial de edición directa del usuario del `2026-11-09T20:55:51-08:00` en `metadata.json` (líneas 2–3), `index.html` (líneas 6–12), `src/components/PersistentHeader.tsx` (línea 134) y `src/components/FaccionesView.tsx` (línea 48).
- **Fecha:** `2026-11-09`.

#### Decisión 1.2: Foco exclusivo en un único Héroe Comandante individual (sin gestión de tropas aliadas)
- **Origen:** Procedencia no determinada en su primera formulación (anterior al historial de sesión disponible; documentado en código como regla de auditoría), ratificada por el usuario en la descripción oficial del `2026-11-09`.
- **Idea original:** El jugador encarna a un único **Comandante/Héroe** que evoluciona a través de **5 Chasis (Tiers I a V)** y se enfrenta en solitario a escuadrones enemigos de 1 a 3 unidades.
- **Propuesta de IA:** La IA estructuró el catálogo `HERO_CHASSIS_PROGRESSION` (`src/data/factionIdentityCatalog.ts:285-566`) bajo el encabezado explícito: `// 2. PROGRESIÓN DEL HÉROE: LOS 5 CHASIS (AUDITORÍA: CERO "HUMANO", ENFOQUE 100% EN HÉROE INDIVIDUAL)`.
- **Intervención del usuario:** Confirmado por el texto del usuario en `metadata.json` (*"...llevá a tu héroe a conquistar nuevos sectores"*) y por la entrega de los sprites `hero-cb-valari.png`, `hero-cb-skithid.png` y `hero-cb-cygnus.png`.
- **Evolución:** Se consolidó la vista `CommanderView.tsx` con los 5 Chasis por facción y el combate de 1 Héroe vs Escuadrón enemigo (1 a 3 unidades por oleada).
- **Estado:** Vigente.
- **Evidencia:** `src/data/factionIdentityCatalog.ts` (líneas 75, 285–566), `src/components/CommanderView.tsx` (líneas 1–1123), `metadata.json` (línea 3).
- **Fecha:** Anterior al `2026-11-09` (ratificado el `2026-11-09` y `2026-11-10`).

---

### ÁREA 2: Género y experiencia de juego buscada

#### Decisión 2.1: Bucle dual de jugabilidad (Base Industrial en Tiempo Real + Incursión Táctica por Turnos)
- **Origen:** Procedencia no determinada (anterior al historial de sesión disponible; documentado en código), ratificado por el usuario el `2026-11-09`.
- **Idea original:** Combinar una base generadora de recursos en tiempo real (Reactor de MW, Módulos de Extracción, Silo, Laboratorio, Forja y Ciudadela) con incursiones planetarias de combate táctico por turnos.
- **Propuesta de IA:** Implementación de un ciclo de actualización de producción cada `1000ms` en `src/context/GameContext.tsx` acoplado a un simulador táctico por turnos en `CombatView.tsx`.
- **Intervención del usuario:** Validado y sintetizado por el usuario en la descripción oficial del proyecto (`"RPG de estrategia y combate táctico: mejorá tu base y equipo, y llevá a tu héroe a conquistar nuevos sectores"`).
- **Evolución:** En las versiones iniciales (V1–V2) el combate también era por ticks (`useCombatEngine.ts`); luego el combate se separó completamente del tick pasivo para volverse 100% táctico por turnos, mientras la base conservó su producción en tiempo real.
- **Estado:** Vigente.
- **Evidencia:** `src/context/GameContext.tsx` (líneas 540–2450), `src/components/MainLayout.tsx`.
- **Fecha:** Consolidado en `vanguard_mvp_save_v5_beta` y ratificado el `2026-11-09`.

---

### ÁREA 3: Facciones y sus diferencias

#### Decisión 3.1: Tríada de facciones jugables (Valari, Skithid, Cygnus) y sus nombres de Base libres de clichés
- **Origen:** Procedencia no determinada (anterior al historial de sesión disponible; documentado en código con nota de auditoría explícita).
- **Idea original:** Tres facciones asimétricas con identidades materiales, mecánicas, sonoras y cromáticas opuestas:
  1. **Valari (`Bastión de Hierro`)**: Industrial-militar pesada, termo-forja, blindaje balístico.
  2. **Skithid (`El Enjambre`)**: Bio-orgánica quitinosa, evolución genética, ácido corrosivo y regeneración.
  3. **Cygnus (`El Nexo`)**: Tecno-arcana cuántica, singularidades fotónicas y escudos de fase.
- **Propuesta de IA / Regla documentada:** En `src/data/factionIdentityCatalog.ts:76` y `191` figura la directriz: *"Evita clichés de otros juegos (sin 'Colmena' ni 'Santuario')"* y *"Sin referencias a 'Humano' en Valari"*.
- **Intervención del usuario:** Aprobación y uso consistente de las 3 facciones en todos los activos personalizados (`valari-*`, `skithid-*`, `cygnus-*`).
- **Evolución:** Se mantuvieron las tres facciones como pilares de toda la experiencia (cambian el tema visual en `themeConfig.ts`, el sintetizador de audio en `soundSynthesizer.ts`, los nombres de las vistas en `MainLayout.tsx`, las habilidades del héroe y los tutoriales).
- **Estado:** Vigente.
- **Evidencia:** `src/data/factionIdentityCatalog.ts` (líneas 74–283), `src/data/gameData.ts` (líneas 133–254), `src/data/themeConfig.ts` (líneas 1–226).
- **Fecha:** Anterior al `2026-11-09` (vigente).

#### Decisión 3.2: Triángulo de Ventaja Táctica entre Facciones y Pasivas Asimétricas
- **Origen:** Procedencia no determinada (anterior al historial de sesión disponible; documentado en código).
- **Idea original:** Establecer un triángulo de contra-facción estilo piedra-papel-tijera entre tipos de defensa:
  - **Valari** (Blindaje) vence a **Cygnus** (Escudos).
  - **Skithid** (Caparazón/Biomasa) vence a **Valari** (Blindaje).
  - **Cygnus** (Escudo de Fase) vence a **Skithid** (Biomasa).
- **Propuesta de IA:** Parametrización en `GAME_BALANCE.combat` (`src/data/factionIdentityCatalog.ts:56-72`):
  - Bono de contra-facción: `+10%` de daño (`counterFactionDamageBonus: 1.1`).
  - **Pasiva Valari (`Placas Reactivas`)**: Mientras conserva `>30%` de Blindaje, refleja `15%` del daño mitigado como espinas térmicas (`valariThornsReflectRatio: 0.15`).
  - **Pasiva Skithid (`Toxina Ácida / Frenesí`)**: Aplica cargas de corrosión que filtran `6%` de daño directo a la Salud por carga (hasta 3 cargas = `18%`), ignorando defensas, y roba `+12%` de vida contra enemigos en `Ruptura`.
  - **Pasiva Cygnus (`Armonía de Fase`)**: Regenera `3.5%` de Escudo por turno (`cygnusTurnShieldRegenRatio: 0.035`) y otorga `+10%` ATQ mientras el Escudo supera el `50%`.
- **Intervención del usuario:** Mantenido sin objeciones en las pruebas de combate, aunque existen discrepancias textuales entre `gameData.ts` y `factionIdentityCatalog.ts` (documentadas en el **Apartado G**).
- **Evolución:** Los valores fueron ajustados hacia abajo en `GAME_BALANCE` sin actualizar los textos antiguos de `src/data/gameData.ts`.
- **Estado:** Contradictoria en textos descriptivos / Vigente en motor matemático (`GameContext.tsx`).
- **Evidencia:** `src/data/factionIdentityCatalog.ts` (líneas 56–72 y 218–283) vs `src/data/gameData.ts` (líneas 148–237).
- **Fecha:** Anterior al `2026-11-09`.

---

### ÁREA 4: Lore, historia y universo

#### Decisión 4.1: Prohibición del término `"Humano"` en Valari y universo post-colapso en el Borde Exterior
- **Origen:** Procedencia no determinada (anterior al historial de sesión disponible; documentado como regla de auditoría en código).
- **Idea original:** Evitar presentar a los Valari como la típica facción "Humana/Terrícola" genérica; definirlos como una estirpe de forjadores acorazados en mundos volcánicos y de alta gravedad (`Kaelen Prime`), enfrentados a la biomasa abisal de `Zergos` (Skithid), la red cuántica de `Aethelgard` (Cygnus) y los vestigios ancestrales de los **Precursores** en el `Cinturón de Aethel` y `La Falla de Vesper`.
- **Propuesta de IA:** Redacción de crónicas planetarias (`lore` en `starMap.data.ts`), descripciones de unidades en `BestiarioView.tsx` y manuales operativos por facción (`FACTION_TUTORIALS` en `src/data/factionIdentityCatalog.ts:1464-2437`).
- **Intervención del usuario:** Revisión y edición directa de nombres de unidades y habilidades en `src/data/factionIdentityCatalog.ts` el `2026-11-09`.
- **Evolución:** El lore de cada sector explica por qué el jugador combate en su propio sector natal (rebelión de máquinas en Valari, cepas ferales desconectadas en Skithid, espectros corruptos en Cygnus) antes de converger en el **Corredor de Orión** (donde luchan las 3 facciones entre sí por los restos de una mega-flota).
- **Estado:** Vigente.
- **Evidencia:** `src/data/factionIdentityCatalog.ts` (líneas 75, 285, 658–664, 1464), `src/data/starMap.data.ts` (líneas 40–550).
- **Fecha:** Anterior al `2026-11-09`.

---

### ÁREA 5: Geografía galáctica, sectores y planetas

#### Decisión 5.1: Arquitectura de 6 Sectores Galácticos y 23 Planetas (Tiers I a X)
- **Origen:** Procedencia no determinada (anterior al historial de sesión disponible; documentado en código), con validación visual del usuario mediante la entrega de las 16 arenas de los Sectores 1–4 el `2026-11-10`.
- **Idea original:** Organizar el Mapa Estelar (`src/data/starMap.data.ts`) en **6 sectores** con **23 planetas** en total:
  1. **Sector 01 — Forja de Kaelen** (Natal Valari, Tiers I–III, 4 planetas: `PLN-VAL-01` Kaelen Prime, `PLN-VAL-02` Ignis IV, `PLN-VAL-03` Ferrum-9, `PLN-VAL-04` Gólgota).
  2. **Sector 02 — Abismo de Zergos** (Natal Skithid, Tiers I–III, 4 planetas: `PLN-SKI-01` Zergos, `PLN-SKI-02` Espora-7, `PLN-SKI-03` Quitinia, `PLN-SKI-04` Fauces).
  3. **Sector 03 — Nexo de Aethelgard** (Natal Cygnus, Tiers I–III, 4 planetas: `PLN-CYG-01` Aethelgard, `PLN-CYG-02` Prisma, `PLN-CYG-03` Vórtice-3, `PLN-CYG-04` Cénit).
  4. **Sector 04 — Corredor de Orión** (Zona de Convergencia Neutral, Tiers IV–V, 4 planetas: `PLN-ORI-01` Paso de Orión, `PLN-ORI-02` Cementerio Acorazado, `PLN-ORI-03` Estación Érebo, `PLN-ORI-04` Trono de Hierro).
  5. **Sector 05 — Cinturón de Aethel** (Frontera de Cristales Precursores, Tiers VI–VII, 4 planetas: `PLN-AET-01` Reliquia-01, `PLN-AET-02` Resonancia, `PLN-AET-03` Fragmento Áureo, `PLN-AET-04` Bóveda del Arquitecto).
  6. **Sector 06 — La Falla de Vesper** (Singularidad Abisal Endgame, Tiers VIII–X, 3 planetas: `PLN-VES-01` Horizonte Quebrado, `PLN-VES-02` Ecos del Vacío, `PLN-VES-03` Núcleo de Vesper).
- **Propuesta de IA:** Implementación de nodos planetarios con estado de conquista (`0%` a `100%`, sumando `+25%` por incursión victoriosa), bono pasivo de producción al conquistar el `100%` del planeta (`conquestBonus`), y bloqueo de los Sectores 5 y 6 en `StarMapView.tsx:60-63` bajo el cartel `[ANOMALÍA LETAL DETECTADA]`.
- **Intervención del usuario:** El `2026-11-10` el usuario subió personalmente los 16 fondos de arena `.jpg` correspondientes a todos los planetas de los Sectores 1 a 4 (`PLN-VAL-01..04`, `PLN-SKI-01..04`, `PLN-CYG-01..04`, `PLN-ORI-01..04`), mientras que los 7 planetas de los Sectores 5 y 6 (`PLN-AET-01..04` y `PLN-VES-01..03`) conservan arenas `.jpg` ya presentes en `/public/assets/arenas/`.
- **Evolución:** Los Sectores 1–4 están completamente activos y jugables; los Sectores 5–6 tienen todos sus datos, enemigos, jefes épicos (`Arquitecto Primordial` y `Vesperion Abisal`) y arenas creadas, pero están bloqueados por código en la vista del Mapa Estelar (`StarMapView.tsx:60-63`).
- **Estado:** Vigente (Sectores 1–4 desbloqueables en juego; Sectores 5–6 definidos en datos pero bloqueados en UI).
- **Evidencia:** `src/data/starMap.data.ts` (líneas 1–563), `src/components/StarMapView.tsx` (líneas 54–65), `/public/assets/arenas/`.
- **Fecha:** Anterior al `2026-11-09`; activos `.jpg` de Sectores 1–4 actualizados por el usuario el `2026-11-10`.

---

### ÁREA 6: Campeones, héroes y personajes

#### Decisión 6.1: Evolución del Héroe a través de 5 Chasis por Facción (15 Chasis en total)
- **Origen:** Procedencia no determinada (anterior al historial de sesión disponible; documentado en código).
- **Idea original:** En lugar de cambiar de personaje, el Comandante evoluciona su propio cuerpo/armadura a través de **5 Tiers de Chasis** desbloqueados por Nivel del Comandante (`Nv. 1, 5, 10, 15, 20`) y Nivel del Laboratorio/Forja (`Nv. 1, 2, 4, 6, 8`):
  - **Valari**: `Tier I: Traje de Brecha MK-I` → `Tier II: Exoesqueleto Vanguardia` → `Tier III: Armadura Centurión` → `Tier IV: Chasis Titán de Asedio` → `Tier V: Avatar de la Forja`.
  - **Skithid**: `Tier I: Progenie de Asalto` → `Tier II: Acechador de Quitinia` → `Tier III: Devorador Alfa` → `Tier IV: Tirano de Guerra` → `Tier V: Avatar del Enjambre`.
  - **Cygnus**: `Tier I: Iniciado del Velo` → `Tier II: Tejedor de Fase` → `Tier III: Arconte Estelar` → `Tier IV: Serafín Cuántico` → `Tier V: Avatar del Nexo`.
- **Propuesta de IA:** Creación de `HERO_CHASSIS_PROGRESSION` (`src/data/factionIdentityCatalog.ts:285-566`) con bonificaciones acumulativas de estadísticas (`+0%`, `+15%`, `+35%`, `+65%`, `+100%` en HP/Escudo/Ataque) y 6 ranuras de equipamiento en `CommanderView.tsx` (`weapon`, `helmet`, `chest`, `gloves`, `boots`, `relic`).
- **Intervención del usuario:** El `2026-11-10` el usuario solicitó unificar los sprites de combate de los héroes en `/public/assets/unidades/` (`hero-cb-valari.png`, `hero-cb-skithid.png`, `hero-cb-cygnus.png`), manteniendo los retratos de los 5 Tiers en `/public/assets/heroes/`.
- **Evolución:** Los 5 Tiers se visualizan en `CommanderView.tsx` con telemetría reactiva, mientras que en la arena (`CombatView.tsx`) el héroe utiliza el sprite de combate específico de su facción (`hero-cb-*.png`).
- **Estado:** Vigente.
- **Evidencia:** `src/data/factionIdentityCatalog.ts` (líneas 285–570), `src/components/CommanderView.tsx` (líneas 100–350), `public/assets/unidades/hero-cb-*.png`.
- **Fecha:** Sprites de combate actualizados el `2026-11-10`.

---

### ÁREA 7: Enemigos y unidades

#### Decisión 7.1: Separación entre Unidades Canónicas de Facción y Unidades Neutrales/Rebeldes por Sector
- **Origen:** Procedencia no determinada (anterior al historial de sesión disponible; documentado en código).
- **Idea original:** Evitar la incoherencia narrativa de que un Comandante Valari mate soldados leales Valari en su propio mundo natal.
- **Propuesta de IA:** Crear dos catálogos en `src/data/factionIdentityCatalog.ts`:
  1. `CANONICAL_FACTION_UNITS` (líneas 574–656): Unidades oficiales de cada facción (`Legionario Brecha`, `Dron VTOL`, `Baluarte Goliath`, `Piquero Kryll`, `Avispón Asedio`, `Baluarte Karkinos`, `Androide Prismático`, `Sonda Lumínica`, `Plataforma Fase`), que aparecen como enemigos rivales en el **Sector 04 (Corredor de Orión)**.
  2. `SECTOR_NEUTRAL_UNITS_CATALOG` (líneas 665–953): Unidades rebeldes o ferales para los sectores natales (`Dron Chatarra`, `Autómata Fundición`, `Coloso Escoria`, `Autómata Áureo` en Valari; `Larva Abisal`, `Escupidor Ácido`, `Bestia Quitinosa`, `Devorador Bioluminiscente` en Skithid; `Centinela Fracturado`, `Espectro Cromo`, `Gólem Prisma`, `Serafín Corrupto` en Cygnus).
- **Intervención del usuario:** El `2026-11-09` el usuario editó directamente `src/data/factionIdentityCatalog.ts` para cambiar nombres de unidades y habilidades dentro de este catálogo, y el `2026-11-10` proveyó los sprites `.png` definitivos para todas las unidades en `/public/assets/unidades/`.
- **Evolución:** El generador de escuadrones (`generateEnemySquad` en `src/context/GameContext.tsx:215-415`) selecciona las unidades según el sector del planeta y aplica variantes por planeta (`PLANET_ENEMY_VARIANTS` en `factionIdentityCatalog.ts:996-1143`).
- **Estado:** Vigente.
- **Evidencia:** `src/data/factionIdentityCatalog.ts` (líneas 574–1143), `src/context/GameContext.tsx` (líneas 215–415).
- **Fecha:** Renombramientos manuales del usuario el `2026-11-09`; sprites definitivos el `2026-11-10`.

#### Decisión 7.2: Renombramiento de `'Larva Feral'` a `'Larva Abisal'` y de habilidades enemigas (`'Choque de Impacto'` y `'Arco Disrruptor'`)
- **Origen:** Usuario (edición directa en código).
- **Idea original:** La IA había nombrado a la unidad ligera de Zergos `'Larva Feral'`, al ataque del `Autómata Fundición` `'Martillo de Escoria'`, y al ataque del `Espectro Cromo` `'Arco Crio-Fotónico'`.
- **Propuesta de IA:** Nombres iniciales redactados por la IA en `src/data/factionIdentityCatalog.ts`.
- **Intervención del usuario:**
  - El `2026-11-09T19:38:12-08:00`, el usuario cambió manualmente `'Martillo de Escoria'` por **`'Choque de Impacto'`** (línea 691) y `'Larva Feral'` por **`'Larva Abisal'`** (líneas 743 y 1035).
  - El `2026-11-09T20:05:17-08:00`, el usuario cambió manualmente `'Arco Crio-Fotónico'` por **`'Arco Disrruptor'`** (línea 817).
- **Evolución:** Los nuevos nombres quedaron activos en combate y en el Bestiario (aunque el archivo de imagen conserva el nombre `skithid-ligera-larva-feral.png`).
- **Estado:** Vigente.
- **Evidencia:** Eventos de edición de archivo del usuario del `2026-11-09T19:38:12-08:00` y `2026-11-09T20:05:17-08:00` en `src/data/factionIdentityCatalog.ts` (líneas 691, 743, 817, 1035).
- **Fecha:** `2026-11-09`.

#### Decisión 7.3: Reducción de la probabilidad de aparición del Enemigo Élite Raro de `10%` a `3%`
- **Origen:** Usuario.
- **Idea original:** En `GAME_BALANCE.combat` (`src/data/factionIdentityCatalog.ts:52-53`), la IA había configurado `rareSpawnChanceBase: 0.1` (`10%`) y `rareSpawnChanceWithOrbital: 0.18` (`18%` con Escáner Orbital).
- **Propuesta de IA:** Mantener `10% / 18%`.
- **Intervención del usuario:** El `2026-11-10` el usuario ordenó: *"ajusta el % de que salga el enemigo raro a un 5% me salio muchas veces y el sentido es que no salga casi nunca, capas que un 3% lo que veas mejor"*.
- **Evolución:** Se redujo `rareSpawnChanceBase` a **`0.03` (`3%`)** y `rareSpawnChanceWithOrbital` a **`0.06` (`6%`)**, actualizando también los textos de la interfaz en `CiudadelaView.tsx` y `BestiarioView.tsx`.
- **Estado:** Vigente.
- **Evidencia:** Solicitud #9 del usuario (`2026-11-10`); `src/data/factionIdentityCatalog.ts` (líneas 52–53), `src/components/CiudadelaView.tsx` (línea 48), `src/components/BestiarioView.tsx` (línea 489).
- **Fecha:** `2026-11-10`.

#### Decisión 7.4: Respeto del tamaño nativo real de cada sprite de unidad en la arena
- **Origen:** Usuario.
- **Idea original:** La IA forzaba a todas las unidades en `CombatView.tsx` a una altura porcentual fija (`h-[24%]`, con `h-[28%]` para jefes), haciendo que unidades ligeras, medias y pesadas se vieran prácticamente del mismo alto.
- **Propuesta de IA:** Contenedor de altura fija `h-[24%]` con `w-auto`.
- **Intervención del usuario:** El `2026-11-10` el usuario indicó: *"otra cosa que los sprites ocupen el tamaño que tienen porque se ven todos iguales y hice especificamente los sprites con su tamaño real."*
- **Evolución:** `CombatView.tsx` fue modificado para leer `e.currentTarget.naturalHeight` de cada `.png` al cargar y escalarlo exactamente en proporción al lienzo base de la arena (`(naturalHeight / 935) * 100%`), respetando las dimensiones reales con las que fueron diseñados los sprites (unidades ligeras de `179px–235px`, medias de `252px–277px`, pesadas de `307px–336px`).
- **Estado:** Vigente.
- **Evidencia:** Solicitud #7 del usuario (`2026-11-10`); `src/components/CombatView.tsx` (líneas 86–88, 639–652, 742–758).
- **Fecha:** `2026-11-10`.

---

### ÁREA 8: Combate y mecánicas

#### Decisión 8.1: Combate por Turnos en 3 Oleadas con Cola de Iniciativa (`SPD`), Intención Enemiga y Ruptura de Defensa
- **Origen:** Procedencia no determinada (anterior al historial de sesión disponible; documentado en código).
- **Idea original:** Reemplazar el antiguo combate pasivo por ticks (`useCombatEngine.ts`) por incursiones tácticas estructuradas en **3 oleadas por planeta**:
  - **Oleada 1 (Vanguardia)**: 1 a 2 unidades ligeras/medias.
  - **Oleada 2 (Escuadrón Táctico)**: 2 unidades combinadas.
  - **Oleada 3 (Bastión / Élite)**: 2 a 3 unidades lideradas por una unidad Pesada, un **Élite Raro** (`3%` base / `6%` con Orbital, que suelta planos y reliquias) o un **Jefe Épico**.
- **Propuesta de IA:** Implementación en `GameContext.tsx` de:
  - Velocidad base diferenciada por facción (`Valari: 96 SPD`, `Skithid: 106 SPD`, `Cygnus: 118 SPD`).
  - Sistema de **Doble Barra de Supervivencia**: Barra superior de Defensa (`Blindaje` / `Caparazón` / `Escudo`) y barra inferior de `Salud (HP)`.
  - Mecánica de **Ruptura (`defenseBroken`)**: Al vaciar la barra superior de un enemigo, entra en estado `RUPTURA` durante 1 turno, perdiendo su acción o quedando expuesto a `+35%` de daño crítico (`breakDamageMultiplier: 1.35`).
  - Telegrafía de intención enemiga (`intent: 'attack' | 'heavy' | 'fortify'`).
- **Intervención del usuario:** Validado y refinado visual y funcionalmente por el usuario a lo largo de las solicitudes del `2026-11-10`.
- **Evolución:** El hook antiguo `useCombatEngine.ts` quedó obsoleto y fue eliminado en la limpieza del `2026-11-10`.
- **Estado:** Vigente.
- **Evidencia:** `src/context/GameContext.tsx` (líneas 215–520, 740–1390), `src/data/factionIdentityCatalog.ts` (líneas 49–72).
- **Fecha:** Consolidado antes del `2026-11-09`; depurado el `2026-11-10`.

#### Decisión 8.2: Barra de Habilidades de 3 Ranuras Activas (`[1] Daño`, `[2] Control/Perforación`, `[3] Restauración`) + `[B] Golpe Básico` (y reducción desde 4 habilidades)
- **Origen:** Procedencia no determinada (anterior al historial de sesión disponible; documentado en código).
- **Idea original:** En una etapa previa del desarrollo existían **4 habilidades activas por facción** (la ranura `[4]` era un Buff de ataque por 2 turnos: `Sobremarcha` en Valari, `Frenesí` en Skithid y `Resonancia` en Cygnus). Posteriormente se simplificó la barra a `[B] Golpe Básico` + **3 habilidades tácticas (`[1]`, `[2]`, `[3]`)** + `[ESC] Salir`.
- **Propuesta de IA:** Definición de `FACTION_SKILL_LOADOUTS` en `src/data/factionIdentityCatalog.ts:1349-1449` con 3 habilidades por facción:
  - **Valari**: `[1] Salva Pesada` (CD 2), `[2] Conmoción` (CD 3, daña blindaje y aturde), `[3] Sellar Placas` (CD 3, restaura 40% Blindaje + Guardia).
  - **Skithid**: `[1] Zarpazo Voraz` (CD 2, aplica Ácido), `[2] Espina Neural` (CD 3, perfora y aturde), `[3] Muda Regenerativa` (CD 3, cura 35% Salud + Guardia).
  - **Cygnus**: `[1] Pulso Fotónico` (CD 2, `+50%` daño a Escudos), `[2] Singularidad` (CD 3, colapsa defensas y aturde), `[3] Armonía Cuántica` (CD 3, recarga 45% Escudo + Guardia).
- **Intervención del usuario:** Aceptado y utilizado como modelo estético de referencia (`2026-11-10`: *"Dale el mismo tratamiento que la barra de habilidades a la lista de turnos"*).
- **Evolución:** Aunque la UI y `FACTION_SKILL_LOADOUTS` muestran 3 habilidades, `GameContext.tsx` (`slotIndex: 1 | 2 | 3 | 4`) y `soundSynthesizer.ts` conservan soporte residual para la 4.ª habilidad (documentado en el **Apartado G**).
- **Estado:** Vigente (con rastro técnico de la 4.ª habilidad en el código).
- **Evidencia:** `src/data/factionIdentityCatalog.ts` (líneas 1349–1449), `src/components/CombatView.tsx` (líneas 970–1065), `src/utils/soundSynthesizer.ts` (líneas 214, 383, 551).
- **Fecha:** Anterior al `2026-11-09`.

#### Decisión 8.3: Animación de golpe enemigo hacia adelante según peso de unidad y planos de profundidad (`zIndex`)
- **Origen:** Usuario.
- **Idea original:** La IA había programado que los enemigos, al atacar, simplemente se agrandaran en su sitio (`scale-[1.08]`) con un contorno rojo, y compartían un `zIndex` base que hacía que al animarse una unidad trasera se superpusiera por delante de una unidad más cercana a la cámara.
- **Propuesta de IA:** Escala simple `scale-[1.08]` y `zIndex: isAttacking ? 30 : 20`.
- **Intervención del usuario:**
  - En la solicitud #3 (`2026-11-10`): *"la animacion de golpe de los enemigos que no sea que se agrandan sino como la del heroe que hace hacia adelante un poco, variando las velocidades y el impacto segun si es unidad ligera, media o pesada, elite."*
  - En la solicitud #8 (`2026-11-10`, adjuntando `image_762e28aa.png`): *"dependiendo de donde se encuentre el sprite, me pasa que al atacar como que se superponen, todos deberian tener su plano asi en caso de que ataque no se monten encima del sprite que esta adelante o arriba. Por ejemplo el automata que esta mas atras al atacar su sprite aparece por adelante del que esta mas adelante."*
- **Evolución:**
  1. Se implementó una embestida frontal hacia la izquierda (`-translate-x`) con curva bezier, distancia y duración diferenciadas por clase de peso (`light`: rápida/ágil `150ms`; `medium`: táctica `210ms`; `heavy`: pesada y contundente `280ms`; `elite/boss`: embestida masiva `250ms`).
  2. Se asignó un plano de profundidad fijo por carril vertical (`planeZIndex = Math.round(unitPos.top)`, dando `z-18` al carril trasero `top: 18%`, `z-25` al central `top: 25%` y `z-31` al delantero `top: 31%`), inmutable durante el ataque.
- **Estado:** Vigente.
- **Evidencia:** Solicitudes #3 y #8 del usuario (`2026-11-10`); `src/components/CombatView.tsx` (líneas 685–708).
- **Fecha:** `2026-11-10`.

---

### ÁREA 9: Progresión, economía y recursos

#### Decisión 9.1: Economía de 6 Recursos (4 Básicos + 2 Refinados) con Nombres Temáticos por Facción
- **Origen:** Procedencia no determinada (anterior al historial de sesión disponible; documentado en código).
- **Idea original:** Mantener una estructura matemática unificada de 6 recursos (`credits`, `titanium`, `plasma`, `biomass`, `nanites`, `darkMatter`), pero renombrarlos dinámicamente según la facción elegida en `FACTION_RESOURCE_THEMES` (`src/data/factionIdentityCatalog.ts:81-162`):
  - **Valari**: `Créditos Imperiales`, `Titanio Bruto`, `Célula Térmica`, `Ración Sintética`, `Aleación Templada`, `Núcleo de Fusión`.
  - **Skithid**: `Biomasa Nexo`, `Quitina Densa`, `Icor Volátil`, `Biomasa Pura`, `Cepa Mutagénica`, `Esencia Abisal`.
  - **Cygnus**: `Fragmentos de Datos`, `Cristal Fotónico`, `Éter Cuántico`, `Flujo Neural`, `Red de Nanitos`, `Materia Oscura`.
- **Propuesta de IA:** Creación de `getFactionResourceMeta(faction, resourceKey)` y conversión en la Refinería/Forja (`20 Titanio + 10 Plasma → 1 Aleación/Nanito`).
- **Intervención del usuario:** Conservado como núcleo económico de la base.
- **Evolución:** Estable desde la generación V3–V4.
- **Estado:** Vigente.
- **Evidencia:** `src/data/factionIdentityCatalog.ts` (líneas 81–162), `src/components/PersistentHeader.tsx`, `src/components/StorageView.tsx`.
- **Fecha:** Anterior al `2026-11-09`.

#### Decisión 9.2: Reactor Central de Megavatios (MW) con Estados de Eficiencia y Sobrecarga Manual
- **Origen:** Procedencia no determinada (anterior al historial de sesión disponible; documentado en código).
- **Idea original:** Todos los módulos de extracción (`Mina de Titanio`, `Extractor de Plasma`, `Granja de Biomasa`, `Generador de Créditos`) consumen **Megavatios (MW)** generados por el `Reactor Central`.
- **Propuesta de IA:** Parametrización en `GAME_BALANCE.reactor` (`src/data/factionIdentityCatalog.ts:16-31`) y `ReactorCentral.tsx`:
  - Base `100 MW` + `45 MW` por nivel del Reactor + `18 MW` por nivel de la tecnología `Conductores`.
  - Tres estados energéticos: **Óptimo** (`<=80%` carga → `+5%` producción), **Estable** (`81–100%` → `100%`), y **Colapso Energético** (`>100%` → penalización del `-50%` a toda la producción).
  - Botón de **Sobrecarga Manual** (`+20%` producción durante `30s` con `60s` de enfriamiento).
- **Intervención del usuario:** Conservado sin cambios.
- **Evolución:** Estable.
- **Estado:** Vigente.
- **Evidencia:** `src/data/factionIdentityCatalog.ts` (líneas 16–31), `src/components/ReactorCentral.tsx` (líneas 1–1790).
- **Fecha:** Anterior al `2026-11-09`.

#### Decisión 9.3: Infraestructura de Ciudadela en 3 Pilares (`Defensa`, `Logística`, `Orbital`) y Árbol de Laboratorio en 3 Ramas (`Extracción`, `Combate`, `Energía`)
- **Origen:** Procedencia no determinada (anterior al historial de sesión disponible; documentado en código).
- **Idea original:**
  - **Ciudadela (`CiudadelaView.tsx`)**: 3 mega-estructuras hasta Nivel 10 (`Bastión/Caparazón/Escudo Planetario` para `+3%` HP/Escudo por nivel; `Red de Suministro` para `+5%` capacidad de Silo y `-2%` costo de mejora; `Escáner Orbital` para `+3%` botín de incursión y duplicar del `3%` al `6%` la aparición de Élites Raros).
  - **Laboratorio (`LaboratorioView.tsx`)**: 6 tecnologías distribuidas en 3 ramas (`Extracción`: Perforación / Automatización; `Combate`: Aleaciones / Balística; `Energía`: Conductores / Almacenamiento).
- **Propuesta de IA:** Implementación completa en `CiudadelaView.tsx`, `LaboratorioView.tsx` y `GameContext.tsx`.
- **Intervención del usuario:** Ajuste del bono del Escáner Orbital el `2026-11-10` para coincidir con el nuevo `3%` base (`6%` con Orbital) de aparición de enemigos raros.
- **Evolución:** Estable.
- **Estado:** Vigente.
- **Evidencia:** `src/components/CiudadelaView.tsx` (líneas 1–314), `src/components/LaboratorioView.tsx` (líneas 1–667).
- **Fecha:** Actualizado el `2026-11-10`.

---

### ÁREA 10: Dirección artística y diseño visual

#### Decisión 10.1: Unificación de las Arenas de Combate en un único archivo `.jpg` (`1672 × 935`) por planeta
- **Origen:** Usuario.
- **Idea original:** Anteriormente, `CombatView.tsx` y `src/data/arenaConfigs.ts` componían la arena mediante **dos capas separadas** (`bg` para el cielo/horizonte y `fg` para la plataforma del suelo) con recortes CSS y filtros dinámicos.
- **Propuesta de IA:** Sistema multicapa `arenaConfigs.ts` con `bg` y `fg`.
- **Intervención del usuario:** El `2026-11-10` el usuario ordenó eliminar la separación de cielo y suelo, usar una única imagen `.jpg` de `1672 × 935` por planeta en `/public/assets/arenas/` (nombradas por el ID del planeta: `PLN-VAL-01.jpg`, etc.) y subió sus 16 ilustraciones `.jpg` personalizadas para los planetas de los Sectores 1 a 4.
- **Evolución:** Se eliminó `src/data/arenaConfigs.ts` y las carpetas `/public/assets/arenas/bg/` y `/fg/`, renderizando la arena en un contenedor con relación de aspecto exacta `aspect-[1672/935]`.
- **Estado:** Vigente.
- **Evidencia:** `implementation_plan.md` (`2026-11-10`), `src/components/CombatView.tsx` (líneas 120–125, 290–305), `/public/assets/arenas/PLN-*.jpg`.
- **Fecha:** `2026-11-10`.

#### Decisión 10.2: Eliminación de círculos de suelo y sombras envolventes de sprites; creación de sombra proyectada en el piso
- **Origen:** Usuario.
- **Idea original:** La IA había colocado un anillo coloreado brillante debajo de cada unidad y un filtro `drop-shadow` negro intenso alrededor del contorno de cada sprite PNG. En un primer intento de corrección, la sombra del piso quedó demasiado opaca y permanecía fija cuando el sprite se movía al atacar.
- **Propuesta de IA:** Anillo de color + `drop-shadow` perimetral en el `<img>`.
- **Intervención del usuario:**
  - Solicitud #3 (`2026-11-10`): *"elimina el circulo que se les hace abajo, podes poder un efecto de sombra mejor"*.
  - Solicitud #6 (`2026-11-10`): *"la sombra debajo funciono bien, pero quita la sombra que envuelve los sprites, me los hace separar mucho del fondo como si no estuvieran ahi, y bajale la transparencia a la sombra del piso, fijate que al animar se ve un circulo negro debajo de los sprites."*
- **Evolución:** Se eliminó por completo el `drop-shadow` del `<img />` de los sprites (integrándolos limpiamente con el fondo `.jpg`) y se colocó una sombra radial suave (`rgba(0,0,0,0.42)` con `blur-[4px]`) **dentro del contenedor animado** de cada unidad para que se desplace solidariamente con los pies del personaje al embestir.
- **Estado:** Vigente.
- **Evidencia:** Solicitudes #3 y #6 del usuario (`2026-11-10`); `src/components/CombatView.tsx` (líneas 632–638 y 734–740).
- **Fecha:** `2026-11-10`.

#### Decisión 10.3: Consolidación de la paleta de Cygnus en Azul Eléctrico (`#3B82F6`)
- **Origen:** Procedencia no determinada (anterior al historial de sesión disponible; documentado en código).
- **Idea original:** Diferenciar claramente las paletas de las tres facciones: **Valari** en Ámbar/Naranja de Forja (`#F59E0B`), **Skithid** en Verde Bio-lumínico (`#10B981`), y **Cygnus** consolidado en Azul Eléctrico (`#3B82F6`).
- **Propuesta de IA:** Configuración en `src/data/themeConfig.ts` y nota de auditoría en `src/components/CommanderView.tsx:101`: `// 2. CONFIGURACIÓN VISUAL DE FACCIONES (Paleta estricta de Auditoría) / Telemetría reactiva de chasis con Cygnus consolidado en Azul Eléctrico`.
- **Intervención del usuario:** Confirmado por el arte de los sprites y arenas de Cygnus (`PLN-CYG-01..04.jpg` y `cygnus-*.png`).
- **Evolución:** Estable en toda la interfaz.
- **Estado:** Vigente.
- **Evidencia:** `src/components/CommanderView.tsx` (línea 101), `src/data/themeConfig.ts` (líneas 1–226).
- **Fecha:** Anterior al `2026-11-09`.

---

### ÁREA 11: Interfaz y experiencia de usuario (UI/UX)

#### Decisión 11.1: Legibilidad de textos en la arena (borde negro de `1px` + sombra reforzada) y posición de nombres sobre las unidades
- **Origen:** Usuario.
- **Idea original:** Los nombres y niveles de las unidades y del Comandante en la arena tenían poca legibilidad sobre fondos industriales iluminados con lava o luces de neón, y las etiquetas flotaban demasiado pegadas a las cabezas de los sprites.
- **Propuesta de IA:** Texto blanco simple con `drop-shadow` ligero y posición `-top-10`.
- **Intervención del usuario:**
  - Solicitud #2 (`2026-11-10`, adjuntando `image_e0b0e254.png`): *"neceistamos un poco mas de legibilidad de los textos en la arena, sobretodo los nombres y niveles de los enemigos y comandante, tal vez un poco mas de sombra o darles 1px de borde negro o algo asi."*
  - Solicitud #3 (`2026-11-10`, adjuntando `image_e6c9c754.png`): *"Fijate de que los nombres de las unidades este un poco mas encima"*.
- **Evolución:** Se aplicó `WebkitTextStroke: '1px #000000'`, `paintOrder: 'stroke fill'` y triple sombra negra (`0 2px 4px rgba(0,0,0,0.98), 0 0 8px rgba(0,0,0,0.9)`) tanto en el HUD superior como en las etiquetas flotantes, y se elevaron las etiquetas a `-top-14` con un contenedor de fondo oscuro translúcido (`bg-slate-950/75`).
- **Estado:** Vigente.
- **Evidencia:** Solicitudes #2 y #3 del usuario (`2026-11-10`); `src/components/CombatView.tsx` (líneas 318–390, 565–605, 709–733).
- **Fecha:** `2026-11-10`.

#### Decisión 11.2: Rediseño de la `SECUENCIA DE TURNOS` con la estética de la Barra de Habilidades y reubicación del `Botín de Incursión`
- **Origen:** Usuario.
- **Idea original:** La lista de turnos era un recuadro pequeño simple, y el panel de `Botín de Incursión` estaba ubicado a la derecha debajo de la barra de vida enemiga y comenzaba desplegado, ocupando espacio visual sobre la ilustración de la arena.
- **Propuesta de IA:** En un primer ajuste, la IA movió el Botín debajo de la lista de turnos pero mantuvo la lista de turnos con bordes rectos.
- **Intervención del usuario:**
  - Solicitud #3 (`2026-11-10`): *"El botin de incursion ponelo debajo de la lista de turnos y que arranque sin estar plegado, pero con un icono de notificacion cuando tenga info, asi no molesta visualmente."*
  - Solicitud #4 (`2026-11-10`): *"Dale el mismo tratamiento que la barra de habilidades a la lista de turnos"*.
- **Evolución:**
  1. La `SECUENCIA DE TURNOS` adoptó exactamente el mismo paralelogramo inclinado (`-skew-x-[16deg]`), borde superior iluminado por facción, acento lateral y contra-inclinación interna (`skew-x-[16deg]`) que la barra inferior de habilidades.
  2. El `Botín de Incursión` se ubicó justo debajo de la `SECUENCIA DE TURNOS`, iniciando contraído (`isLootOpen = false`), con estética inclinada `-skew-x-[16deg]` haciendo juego, y mostrando un indicador pulsante ámbar con contador cuando hay botín acumulado.
- **Estado:** Vigente.
- **Evidencia:** Solicitudes #3 y #4 del usuario (`2026-11-10`); `src/components/CombatView.tsx` (líneas 81, 412–530).
- **Fecha:** `2026-11-10`.

---

### ÁREA 12: Desarrollo técnico y arquitectura del juego

#### Decisión 12.1: Arquitectura React 19 + TypeScript + Tailwind CSS v4 + Estado Centralizado (`GameContext`) y Audio Procedural (`Web Audio API`)
- **Origen:** Propuesta de IA validada en la evolución del proyecto.
- **Idea original:** Construir una SPA sin dependencias de backend externas para el estado de juego, con persistencia local (`localStorage` bajo la clave `vanguard_mvp_save_v5_beta`) y efectos de sonido generados en tiempo real sin archivos `.mp3` externos.
- **Propuesta de IA:**
  - `src/context/GameContext.tsx` (3.074 líneas) como motor unificado de estado, ticks de producción, combate por turnos, directivas, forja y guardado automático.
  - `src/utils/soundSynthesizer.ts` (2.335 líneas) como sintetizador procedural Web Audio API con perfiles acústicos diferenciados para Valari (percusión metálica e industrial), Skithid (resonancias orgánicas y fluidas) y Cygnus (frecuencias cristalinas y armónicos cuánticos).
- **Intervención del usuario:** En la solicitud #1 del `2026-11-10`, el usuario ordenó eliminar todos los módulos técnicos y vistas de prueba que habían quedado huérfanos de iteraciones anteriores.
- **Evolución:** Se depuró el árbol de código eliminando `AudioLabView.tsx`, `CoreUI.tsx`, `useCombatEngine.ts`, `useTickEngine.ts`, `artEngine.ts`, `saveManager.ts` y `arenaConfigs.ts`.
- **Estado:** Vigente.
- **Evidencia:** Solicitud #1 del usuario (`2026-11-10`); `src/context/GameContext.tsx`, `src/utils/soundSynthesizer.ts`.
- **Fecha:** Depuración ejecutada el `2026-11-10`.

---

### ÁREA 13: Decisiones descartadas y motivos de descarte

1. **Subtítulo y posicionamiento como juego `"Idle"` (`"Vanguard Idle"`)**
   - **Origen del descarte:** Usuario (`2026-11-09`).
   - **Motivo:** El juego evolucionó hacia un RPG de estrategia y combate táctico activo; el término `"Idle"` ya no representaba la experiencia real buscada.
   - **Evidencia:** Ediciones del usuario en `metadata.json`, `index.html`, `PersistentHeader.tsx` y `FaccionesView.tsx` el `2026-11-09`.

2. **Combate pasivo automático basado en ticks (`useCombatEngine.ts`, `regenerationPerTick`, `attackIntervalSeconds`)**
   - **Origen del descarte:** Procedencia no determinada (anterior al `2026-11-09`), culminado con la eliminación física del archivo por orden del usuario el `2026-11-10`.
   - **Motivo:** Reemplazado por el combate táctico por turnos en 3 oleadas con cola de velocidad (`SPD`), habilidades con enfriamiento y Ruptura de Defensa.
   - **Evidencia:** Eliminación de `src/hooks/useCombatEngine.ts` y restos de la interfaz `CombatEnemy` en `src/types/game.ts:137-159`.

3. **Arenas divididas en dos capas (`bg` cielo + `fg` plataforma) y configuración `arenaConfigs.ts`**
   - **Origen del descarte:** Usuario (`2026-11-10`).
   - **Motivo:** Reemplazado por ilustraciones completas `.jpg` de `1672 × 935` por planeta provistas por el usuario para lograr cohesión visual total entre el suelo y el horizonte.
   - **Evidencia:** `implementation_plan.md` y eliminación de `src/data/arenaConfigs.ts` y `/public/assets/arenas/bg` y `/fg`.

4. **Círculos coloreados bajo los pies de las unidades y sombra envolvente (`drop-shadow`) alrededor de los sprites**
   - **Origen del descarte:** Usuario (`2026-11-10`, solicitudes #3 y #6).
   - **Motivo:** El `drop-shadow` perimetral despegaba artificialmente los sprites del fondo, y el círculo de color en el suelo desentonaba con el arte de la arena.
   - **Evidencia:** `src/components/CombatView.tsx` (líneas 632–652, 734–758).

5. **Animación de ataque enemigo por agrandamiento (`scale-[1.08]`) y tamaño uniforme (`h-[24%]`) de los sprites**
   - **Origen del descarte:** Usuario (`2026-11-10`, solicitudes #3 y #7).
   - **Motivo:** Agrandar el sprite se veía estático e irreal frente a la embestida del héroe, y forzar `h-[24%]` destruía las proporciones reales con las que el usuario había dibujado cada clase de unidad (ligera, media, pesada).
   - **Evidencia:** `src/components/CombatView.tsx` (líneas 639–708).

6. **Generador de arte procedural en canvas (`src/utils/artEngine.ts`) y Vista de Laboratorio de Audio (`src/components/AudioLabView.tsx`)**
   - **Origen del descarte:** Usuario (`2026-11-10`, solicitud #1).
   - **Motivo:** Archivos de etapas tempranas de prototipado que habían dejado de utilizarse cuando el proyecto incorporó arte propio y audio integrado.
   - **Evidencia:** Solicitud #1 del usuario (`2026-11-10`).

7. **Referencias a `"Humano"` en Valari y nombres de bases clichés (`"La Colmena"`, `"El Santuario"`)**
   - **Origen del descarte:** Procedencia no determinada (regla de auditoría previa al `2026-11-09` documentada en código).
   - **Motivo:** Evitar clichés de otras franquicias de ciencia ficción, adoptando `Bastión de Hierro`, `El Enjambre` y `El Nexo`.
   - **Evidencia:** Comentarios explícitos en `src/data/factionIdentityCatalog.ts` (líneas 75–76, 191, 285, 1464).

---

## C. IDEAS ORIGINALES DEL USUARIO IDENTIFICADAS MEDIANTE EVIDENCIA

1. **Bautismo definitivo del juego como `"Vanguard"` (eliminando `"Idle"`) y definición conceptual del proyecto**:
   - *"RPG de estrategia y combate táctico: mejorá tu base y equipo, y llevá a tu héroe a conquistar nuevos sectores."* (Edición manual del usuario del `2026-11-09` en `metadata.json`, `index.html`, `PersistentHeader.tsx` y `FaccionesView.tsx`).
2. **Nomenclatura específica de unidades y habilidades enemigas**:
   - Cambio de `'Larva Feral'` a **`'Larva Abisal'`** (`2026-11-09T19:38:12-08:00` en `src/data/factionIdentityCatalog.ts`).
   - Cambio de `'Martillo de Escoria'` a **`'Choque de Impacto'`** (`2026-11-09T19:38:12-08:00` en `src/data/factionIdentityCatalog.ts`).
   - Cambio de `'Arco Crio-Fotónico'` a **`'Arco Disrruptor'`** (`2026-11-09T20:05:17-08:00` en `src/data/factionIdentityCatalog.ts`).
3. **Creación artística y provisión de los sprites de unidades y héroes con escala real**:
   - Diseño y subida de los sprites `.png` en `/public/assets/unidades/` con dimensiones en píxeles deliberadamente diferenciadas por rol y peso (*"hice especificamente los sprites con su tamaño real"*).
4. **Creación artística y unificación de las arenas planetarias en formato `.jpg` (`1672 × 935`)**:
   - Decisión de descartar el sistema de cielo/suelo dividido y subida de las 16 arenas `.jpg` de los Sectores 1 a 4 en `/public/assets/arenas/`.
5. **Dirección visual y coreográfica del combate en la arena (`2026-11-10`)**:
   - Legibilidad mediante borde negro de `1px` y sombra en nombres y niveles.
   - Mayor separación vertical de los nombres flotantes sobre las unidades.
   - Eliminación de los círculos coloreados bajo las unidades y eliminación de la sombra perimetral (`drop-shadow`) que despegaba a los sprites del fondo.
   - Sombra de piso suave y semitransparente que se mueve con la unidad.
   - Animación de ataque enemiga mediante avance frontal con velocidades e impacto variables según peso (`ligera`, `media`, `pesada`, `élite`).
   - Sistema de planos de profundidad independientes para que las unidades de atrás nunca se superpongan sobre las de adelante al atacar.
6. **Diseño espacial del HUD superior de combate (`2026-11-10`)**:
   - Aplicar el mismo diseño geométrico de la barra de habilidades a la `SECUENCIA DE TURNOS`.
   - Ubicar el `Botín de Incursión` debajo de la `SECUENCIA DE TURNOS`, plegado por defecto y con icono de notificación cuando acumula botín.
7. **Filosofía de rareza del Enemigo Élite Raro (`3%`)**:
   - Decisión de diseño de que el enemigo raro sea verdaderamente excepcional (*"el sentido es que no salga casi nunca, capas que un 3%"*), bajándolo del `10%` original al `3%`.
8. **Higiene y depuración de código y activos huérfanos**:
   - Orden directa de auditar y eliminar todo archivo o imagen no utilizada en el proyecto (`2026-11-10`).

---

## D. PROPUESTAS ORIGINALES DE LA IA

1. **Parametrización matemática en `GAME_BALANCE` (`src/data/factionIdentityCatalog.ts:10-73`)**: Fórmulas polinómicas/exponenciales de costos (`1.52^nivel`), tiempos de construcción, capacidad de Silo y producción del Reactor.
2. **Sintetizador de Audio Procedural (`src/utils/soundSynthesizer.ts`)**: Generación mediante osciladores y filtros Web Audio API de toda la banda sonora y efectos de combate por facción.
3. **Textos largos de crónicas planetarias (`lore` en `starMap.data.ts`) y manuales tácticos de 5 pasos por facción (`FACTION_TUTORIALS` en `src/data/factionIdentityCatalog.ts:1464-2437`)**.
4. **Propuestas visuales de la IA en la arena que luego fueron corregidas por el usuario**:
   - Usar anillos coloreados debajo de las unidades (rechazado por el usuario).
   - Aplicar `drop-shadow` alrededor de la silueta de los sprites (rechazado por el usuario).
   - Animar el ataque enemigo agrandando el sprite con `scale-[1.08]` (rechazado por el usuario).
   - Forzar todos los sprites a una altura uniforme `h-[24%]` (rechazado por el usuario).
   - Probabilidad inicial del `10%` (`18%` con Orbital) para el enemigo raro (modificado por el usuario a `3%` / `6%`).

---

## E. RESUMEN DE DECISIONES ACEPTADAS, MODIFICADAS Y RECHAZADAS

| Categoría | Decisión / Elemento | Origen | Estado Final |
| :--- | :--- | :--- | :--- |
| **Aceptada / Vigente** | Cambio de nombre de `"Vanguard Idle"` a **`"Vanguard"`** y nueva descripción de RPG táctico | Usuario (`2026-11-09`) | **Vigente** |
| **Aceptada / Vigente** | Renombramiento a `'Larva Abisal'`, `'Choque de Impacto'` y `'Arco Disrruptor'` | Usuario (`2026-11-09`) | **Vigente** |
| **Aceptada / Vigente** | Arenas `.jpg` unificadas (`1672 × 935`) en `/public/assets/arenas/` | Usuario (`2026-11-10`) | **Vigente** |
| **Aceptada / Vigente** | Sprites propios en `/public/assets/unidades/` renderizados a su tamaño nativo real | Usuario (`2026-11-10`) | **Vigente** |
| **Aceptada / Vigente** | Embestida frontal enemiga por peso (`light`, `medium`, `heavy`, `elite`) y planos `zIndex` por carril | Usuario (`2026-11-10`) | **Vigente** |
| **Aceptada / Vigente** | `SECUENCIA DE TURNOS` con estilo de la barra de habilidades y `Botín de Incursión` plegado debajo con notificación | Usuario (`2026-11-10`) | **Vigente** |
| **Modificada** | Probabilidad de aparición del Élite Raro: de `10%` (`18%` con Orbital) a **`3%`** (**`6%`** con Orbital) | Propuesta IA → Modificada por Usuario (`2026-11-10`) | **Modificada (Vigente)** |
| **Modificada** | Sombra en la arena: de círculo coloreado + `drop-shadow` en sprite a sombra elíptica suave solo en el piso que acompaña al sprite | Propuesta IA → Corregida por Usuario (`2026-11-10`) | **Modificada (Vigente)** |
| **Rechazada / Descartada** | Nombre `"Vanguard Idle"` y combate pasivo por ticks (`useCombatEngine.ts`) | Etapa temprana → Descartado por Usuario | **Descartada** |
| **Rechazada / Descartada** | Arenas divididas en dos capas (`bg` cielo + `fg` suelo en `arenaConfigs.ts`) | Propuesta IA → Descartada por Usuario (`2026-11-10`) | **Descartada** |
| **Rechazada / Descartada** | Término `"Humano"` en Valari y nombres `"Colmena"` / `"Santuario"` | Regla de auditoría previa | **Descartada** |

---

## F. ELEMENTOS QUE CAMBIARON DURANTE EL DESARROLLO (TRAZABILIDAD EVOLUTIVA)

1. **Identidad del Proyecto**: `"Vanguard Idle"` (Idle RPG por ticks) ➔ **`"Vanguard"`** (RPG de estrategia y combate táctico por turnos).
2. **Esquema de Guardado (`localStorage`)**: Pasó por 5 revisiones hasta llegar a `vanguard_mvp_save_v5_beta` (`src/context/GameContext.tsx:144`), dejando atrás la estructura `VanguardSaveData` (`src/types/game.ts:355-370`) que tenía `professionXp` (`miner`, `armorer`).
3. **Motor de Combate**: De peleas 1v1 automáticas por intervalo de segundos (`attackIntervalSeconds`, `regenerationPerTick`) ➔ a incursiones tácticas de **3 oleadas** contra escuadrones de 1 a 3 unidades con cola de iniciativa por `SPD`, barras dobles de Defensa/Salud y estado de `Ruptura`.
4. **Barra de Habilidades del Héroe**: De **4 habilidades** (incluyendo un 4.º botón de Buff de Ataque: `Sobremarcha` / `Frenesí` / `Resonancia`) ➔ a **3 habilidades tácticas** (`[1] Daño`, `[2] Control`, `[3] Restauración`) acompañadas por `[B] Golpe Básico` y `[ESC] Salir`.
5. **Enemigos del Sector Natal**: De enfrentar a las unidades canónicas de las facciones desde el inicio ➔ a crear el catálogo `SECTOR_NEUTRAL_UNITS_CATALOG` (rebeldes, ferales y corruptos) para los Sectores 1–3 y reservar el choque entre las 3 facciones canónicas para el **Sector 04 (Corredor de Orión)**.
6. **Composición Visual de la Arena**: De fondos multicapa (`bg` + `fg`) con sprites escalados uniformemente a `h-[24%]` y `drop-shadow` ➔ a ilustraciones únicas `.jpg` (`1672 × 935`) con sprites en su resolución nativa real, planos de profundidad `zIndex` por carril y sombra proyectada en el piso.

---

## G. CONTRADICCIONES ENTRE DOCUMENTOS, CATÁLOGOS Y CÓDIGO

La inspección cruzada de todos los archivos del proyecto reveló **7 contradicciones o desfasajes técnicos internos** entre archivos antiguos (`src/data/gameData.ts`, `src/types/game.ts`) y los catálogos activos (`src/data/factionIdentityCatalog.ts`, `src/context/GameContext.tsx`):

### 1. Contradicción en los porcentajes de las Pasivas de Facción (`gameData.ts` vs `factionIdentityCatalog.ts`)
- **En `src/data/gameData.ts` (líneas 148–237)**:
  - **Valari**: Dice `"Devuelve 25% del daño bloqueado por Blindaje"` y `"+25% Daño contra Escudos (Cygnus)"`.
  - **Skithid**: Dice `"Filtra 12% daño directo a HP y roba 18% vida en Ruptura"` y `"+25% Daño contra Blindaje (Valari)"`.
  - **Cygnus**: Dice `"Regenera +10% Escudo/turno y +20% ATQ con Escudo >50%"`, `"+25% Daño contra Biomasa (Skithid)"` y `"+20% MW en Reactor"`.
- **En `src/data/factionIdentityCatalog.ts` (`GAME_BALANCE` líneas 56–72 y `FACTION_IDENTITIES` líneas 218–283)**:
  - El bono de contra-facción real es **`+10%`** (`counterFactionDamageBonus: 1.1`), no `+25%`.
  - **Valari**: Refleja **`15%`** (`valariThornsReflectRatio: 0.15`), no `25%`.
  - **Skithid**: Filtra **`6%` por carga (máx 18%)** y roba **`+12%`** de vida en Ruptura (`skithidLifestealOnBreakRatio: 0.12`), no `18%`.
  - **Cygnus**: El texto de `FACTION_IDENTITIES` (línea 272) dice `"+6% Escudo/Turno"`, el de `gameData.ts` dice `"+10% Escudo/turno"`, pero la constante matemática real en `GAME_BALANCE.combat.cygnusTurnShieldRegenRatio` (línea 68) es **`0.035` (`3.5%` por turno)**. Además, el bono al Reactor en `FACTION_IDENTITIES` (línea 275) dice `"+15% MW Reactor"` frente al `"+20% MW"` de `gameData.ts`.

### 2. Contradicción en la fórmula de Capacidad del Silo (`gameData.ts` vs `GameContext.tsx`)
- **En `src/data/gameData.ts` (líneas 621 y 935–942)**: La función `getSiloMaxCapacity` calcula `baseCap = 1200 + siloLevel * 800` con un bono de laboratorio de `+15%` por nivel.
- **En `src/context/GameContext.tsx` (líneas 2418–2427) y `GAME_BALANCE.silo` (`factionIdentityCatalog.ts:40-43`)**: El juego calcula en realidad `baseCap = 2500 + siloLevel * 1500` con un bono de laboratorio de **`+20%`** por nivel (`storageTechBonusPerLevel: 0.2`).

### 3. Contradicción en los Megavatios otorgados por la tecnología `Conductores` (`+15 MW` vs `+18 MW`)
- **En los tutoriales de `src/data/factionIdentityCatalog.ts` (líneas 1731, 2013, 2295)**: El texto indica `(+15 MW al Reactor)`.
- **En `GAME_BALANCE.reactor.conductorTechMwPerLevel` (línea 20) y `src/components/LaboratorioView.tsx` (líneas 141, 186, 231)**: Otorga realmente **`+18 MW` por nivel**.

### 4. Habilidad 4 fantasma (`Sobremarcha` / `Frenesí` / `Resonancia`)
- `FACTION_SKILL_LOADOUTS` (`src/data/factionIdentityCatalog.ts:1349-1449`) solo define **3 habilidades (`slotIndex: 1, 2, 3`)** y `CombatView.tsx` solo muestra 3 habilidades más el Golpe Básico `[B]`.
- Sin embargo, `GameContext.tsx` (línea 502: `executeSkill(slotIndex: 1 | 2 | 3 | 4)`), `CombatView.tsx` (listener de teclado para `Digit4`) y `soundSynthesizer.ts` (líneas 214, 383, 551) conservan la lógica y el sonido de una 4.ª habilidad de Buff (`+35% ATQ por 2 turnos`).

### 5. Desfasaje entre el nombre visible `'Larva Abisal'` y el identificador de su archivo de imagen
- Tras la edición del usuario del `2026-11-09`, la unidad se llama `'Larva Abisal'` en pantalla (`src/data/factionIdentityCatalog.ts:743, 1035`), pero su clave interna (`spriteKey: 'skithid_ligera_larva_feral'`) y el archivo en `/public/assets/unidades/skithid-ligera-larva-feral.png` conservan el nombre antiguo `larva-feral`.

### 6. Sectores 5 (`Cinturón de Aethel`) y 6 (`La Falla de Vesper`) completos en datos y activos pero bloqueados en UI
- `starMap.data.ts` y `factionIdentityCatalog.ts` tienen definidos los 7 planetas de los Sectores 5 y 6 (Tiers VI a X), sus unidades Precursoras y del Vacío, sus 2 Jefes Épicos (`Arquitecto Primordial` y `Vesperion Abisal`) y sus 7 arenas `.jpg` en `/public/assets/arenas/`.
- Sin embargo, `src/components/StarMapView.tsx` (líneas 60–63) tiene una restricción fija que impide seleccionar cualquier sector que no sea el Sector Natal del jugador o el `Corredor de Orión` (`SEC-04`), mostrando `[ANOMALÍA LETAL DETECTADA]`.

### 7. Código muerto e interfaces heredadas en `src/types/game.ts` y `src/data/gameData.ts`
- En `src/types/game.ts` permanecen las interfaces obsoletas `CombatEnemy` (líneas 137–159, del antiguo combate por ticks) y `VanguardSaveData` (líneas 355–370, con `professionXp: { miner, armorer }`).
- En `src/data/gameData.ts` permanece `export const COMBAT_ENEMIES: CombatEnemy[] = [];` (línea 1209).

---

## H. INFORMACIÓN FALTANTE Y PREGUNTAS PARA COMPLETAR LA ATRIBUCIÓN PRE-COMPACTACIÓN (ETAPAS V1–V4)

1. **Origen de las 3 Facciones (`Valari`, `Skithid`, `Cygnus`) y sus nombres de base (`Bastión de Hierro`, `El Enjambre`, `El Nexo`)**:
   - ¿Fueron definidos desde el comienzo por el usuario los nombres `Valari`, `Skithid` y `Cygnus` y la prohibición de usar la palabra `"Humano"`, `"Colmena"` y `"Santuario"`, o alguno de esos nombres fue sugerido inicialmente por la IA y ajustado por el usuario?
2. **Transición del combate de las versiones tempranas (de ticks pasivos a combate táctico por turnos en 3 oleadas con Ruptura)**:
   - ¿El paso del sistema pasivo original al sistema de escuadrones por turnos con barra doble (Defensa + Salud) y estado de `Ruptura` fue una directriz del usuario, o una propuesta de la IA aprobada por el usuario?
3. **Geografía Galáctica (los 6 Sectores y los 23 Planetas) y la regla de no luchar contra la propia facción en el Sector Natal**:
   - ¿Los nombres de los sectores (`Kaelen`, `Zergos`, `Aethelgard`, `Corredor de Orión`, `Cinturón de Aethel`, `La Falla de Vesper`) y la decisión de poner rebeldes/ferales en el sector natal fueron concebidos por el usuario o propuestos por la IA?
4. **Progresión de los 5 Chasis del Héroe y eliminación de la 4.ª Habilidad (Buff)**:
   - ¿Solicitó el usuario que el progreso del Comandante se basara en 5 Chasis por facción y que la barra de habilidades tuviera 3 habilidades activas en lugar de 4?
5. **Resolución de las contradicciones detectadas en el Apartado G**:
   - ¿Se deben unificar los textos de `gameData.ts` con los valores reales de `GAME_BALANCE` y habilitar el desbloqueo progresivo de los Sectores 5 y 6 al conquistar el Corredor de Orión?

---

## I. ÍNDICE COMPLETO DE ARCHIVOS Y ACTIVOS DEL PROYECTO

### 1. Configuración y Metadatos
- `/metadata.json`
- `/index.html`
- `/package.json`

### 2. Modelos de Datos y Catálogos
- `/src/types/game.ts` (371 líneas)
- `/src/data/factionIdentityCatalog.ts` (2.519 líneas)
- `/src/data/starMap.data.ts` (563 líneas)
- `/src/data/gameData.ts` (1.210 líneas)
- `/src/data/mockState.ts` (263 líneas)
- `/src/data/themeConfig.ts` (226 líneas)

### 3. Motor de Estado, Audio y Vistas
- `/src/context/GameContext.tsx` (3.074 líneas)
- `/src/utils/soundSynthesizer.ts` (2.335 líneas)
- `/src/components/MainLayout.tsx` (1.004 líneas)
- `/src/components/PersistentHeader.tsx` (336 líneas)
- `/src/components/CommandHubView.tsx` (613 líneas)
- `/src/components/ReactorCentral.tsx` (1.790 líneas)
- `/src/components/ForgeView.tsx` (996 líneas)
- `/src/components/LaboratorioView.tsx` (667 líneas)
- `/src/components/StorageView.tsx` (428 líneas)
- `/src/components/CiudadelaView.tsx` (314 líneas)
- `/src/components/CommanderView.tsx` (1.123 líneas)
- `/src/components/StarMapView.tsx` (865 líneas)
- `/src/components/CombatView.tsx` (1.236 líneas)
- `/src/components/BestiarioView.tsx` (554 líneas)
- `/src/components/FaccionesView.tsx` (197 líneas)
- `/src/components/DirectivesView.tsx` (319 líneas)

### 4. Activos Gráficos en `/public/assets/`
- `/public/assets/arenas/` (`PLN-VAL-01..04.jpg`, `PLN-SKI-01..04.jpg`, `PLN-CYG-01..04.jpg`, `PLN-ORI-01..04.jpg`, `PLN-AET-01..04.jpg`, `PLN-VES-01..03.jpg`)
- `/public/assets/unidades/` (29 archivos `.png`: 26 unidades enemigas + `hero-cb-valari.png`, `hero-cb-skithid.png`, `hero-cb-cygnus.png`)
- `/public/assets/heroes/` (15 retratos de Chasis Tiers I a V)
- `/public/assets/factions/`, `/public/assets/planets/`, `/public/assets/sectors/`, `/public/assets/command/`, `/public/assets/citadel/`, `/public/assets/forja/`, `/public/assets/lab/`, `/public/assets/reactor/`, `/public/assets/storage/`, `/public/assets/directive/`
