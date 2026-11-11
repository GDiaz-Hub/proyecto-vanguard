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

*(El contenido íntegro de las Secciones A a I se encuentra sincronizado con `/AUDITORIA_TRAZABILIDAD_VANGUARD.md` en la raíz del proyecto).*
