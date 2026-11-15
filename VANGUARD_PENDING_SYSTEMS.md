# INVENTARIO DE SISTEMAS PENDIENTES Y DESCONECTADOS — VANGUARD (`VANGUARD_PENDING_SYSTEMS.md`)

> **Propósito del documento:** Inventario técnico exhaustivo de sistemas incompletos, funcionalidades parciales, elementos visuales sin efecto real en el motor, mecánicas configuradas pero desconectadas, código legacy sin uso y propuestas documentadas aún no desarrolladas en **Project Vanguard** (`v0.5.0`).  
> **Criterio de clasificación:** Se diferencia estrictamente entre **(A) Hallazgos verificados en el código fuente actual** y **(B) Propuestas o ideas registradas en la bitácora que todavía no han sido desarrolladas**. Este documento guarda coherencia total con `VANGUARD_GAMEPLAY_MASTER.md` y `VANGUARD_BALANCE_CHANGELOG.md`.

---

## PARTE A: HALLAZGOS VERIFICADOS EN EL CÓDIGO FUENTE ACTUAL

### 1. SISTEMAS IMPLEMENTADOS PARCIALMENTE (`IMPLEMENTADO PARCIALMENTE`)

#### 1.1 Capacidad Volumétrica del Silo Estratégico sin Bloqueo Real de Inventario
- **Ubicación en código:**
  - `src/context/GameContext.tsx:2508-2517` (`siloMaxCapacity`)
  - `src/components/StorageView.tsx:218-246` (Cálculo visual de `totalVolumeUsed` y barra de ocupación)
  - `src/context/GameContext.tsx:1404-1427, 1785-1792` (Adición de botín en `awardDefeatedEnemiesLoot` y victoria de incursión)
  - `src/context/GameContext.tsx:2715-2739` (`completeForgeCraft`)
- **Qué está implementado:**
  - El edificio `Silo Estratégico` (`bld_silo_estrategico`) y la tecnología `Logística de Silo` (`tech_logistica_silo`) calculan `siloMaxCapacity = Math.round((2500 + siloLevel * 1500) * (1 + (siloTechLevel - 1) * 0.20))`.
  - `StorageView.tsx` calcula el volumen ocupado sumando `qty * unitVolume` de cada recurso y muestra una alerta visual si alcanza el `100%`.
- **Qué falta conectar:**
  - `GameContext.tsx` **nunca verifica `siloMaxCapacity`** al otorgar botín de combate, al reclamar Directivas Operativas ni al sintetizar compuestos en la Forja (`next[resId] = (next[resId] || 0) + qty` sin tope).
  - En consecuencia, mejorar el Silo Estratégico o investigar `Logística de Silo` consume MW, materiales y Créditos, pero **no desbloquea ni restringe ninguna capacidad real** en el juego.

#### 1.2 Barra de Síntesis de Compuestos en `ForgeView.tsx` con Estado Local No Persistente
- **Ubicación en código:**
  - `src/components/ForgeView.tsx:587-588, 647-669` (`activeCraftingId`, `craftingProgress`)
  - `src/context/GameContext.tsx:2715-2739` (`completeForgeCraft`)
- **Qué está implementado:**
  - Al pulsar `Sintetizar (+1)` en una receta de compuesto T2–T5, se anima una barra de progreso de `0%` a `100%` (avanzando `15%`, `20%` o `24%` cada `150ms`) y al llegar a `100%` invoca `completeForgeCraft`.
- **Qué falta o difiere del resto de la Ciudadela:**
  - Mientras los edificios y el Laboratorio usan temporizadores reales persistidos en `GameContext.tsx` (`activeBuildingUpgrades`, `activeTechResearches`), la síntesis de compuestos vive en un `useState` local de `ForgeView.tsx`.
  - Además, el parámetro `cycleSeconds` definido en cada receta de `MOCK_FORGE_RECIPES` (`mockState.ts:278-492`, ej. `10s`, `20s`, `35s`, `55s`) **no se utiliza** para calcular la duración real de la barra (~`0.75s–1.0s`). Si el jugador cambia de pestaña antes de que termine la barra, el proceso se cancela.

#### 1.3 Porcentaje de Control Territorial / Influencia de Sectores Estático
- **Ubicación en código:**
  - `src/data/starMap.data.ts:29-33, 498-502` (`influence: { valari: 36, skithid: 33, cygnus: 31 }`)
  - `src/data/gameData.ts:1032` (`control: 64 | 38 | 49 | 22`)
  - `src/context/GameContext.tsx:685-687, 1770` (`clearedPlanetIds`)
- **Qué está implementado:**
  - Al ganar la Oleada 3 de un planeta, su `planet.id` se registra en `clearedPlanetIds` y se incrementa `sectorsClearedCount`.
- **Qué falta conectar:**
  - Los porcentajes de control o influencia faccionaria del sector son valores estáticos de configuración y no se recalculan cuando el jugador conquista planetas dentro del sector.

---

### 2. ELEMENTOS PRESENTES VISUALMENTE, PERO SIN FUNCIONALIDAD REAL (`PRESENTE VISUALMENTE, PERO SIN FUNCIONALIDAD REAL`)

| Elemento Visual / Atributo | Dónde se muestra al jugador | Qué afirma la UI / Tooltip | Estado Real en `GameContext.tsx` |
| :--- | :--- | :--- | :--- |
| **Probabilidad de Crítico (`critChance`)** en Arma Principal | `CommanderView.tsx:391-396` y `factionIdentityCatalog.ts:458, 503, 548` (`+8%` Valari, `+14%` Skithid, `+10%` Cygnus) | *"CRÍTICO +X%: Probabilidad de impacto crítico (+55% daño en Ruptura)"* | **Sin efecto.** No existe tirada de golpe crítico en `applyDamageToEnemyUnit`. El bono de `+55%` (`×1.55`) ocurre **siempre** que se ataca a un enemigo con `defense === 0` (Ruptura), sin depender de `critChance`. |
| **Suerte / Hallazgo (`reconLuck`)** en Casco Táctico | `CommanderView.tsx:398-410, 695-698, 966-973` (`+6%` Valari, `+8%` Skithid, `+10%` Cygnus) | *"SUERTE +X%: Aumenta hallazgo de botín y aparición de Élite Raro"* | **Sin efecto.** Ni `awardDefeatedEnemiesLoot` (`GameContext.tsx:1388`) ni `getPlanetHostilesRoster` (`factionIdentityCatalog.ts:1221`) leen `helmet.secondaryStat`. |
| **Precisión (`accuracy`)** en Guanteletes | `CommanderView.tsx:425-430` (`+tier * 4%`, de `+4%` a `+20%`) | *"PRECISIÓN +X%: Contrarresta la Evasión enemiga y suma daño directo"* | **Sin efecto.** Los enemigos no tienen tirada de evasión esquivable cuando el jugador los ataca (los ataques del jugador siempre impactan al `100%`), y el daño de guantes depende de `gloves.level * 10`, no de `accuracy`. |
| **Integridad (`+tier * 45 HP`)** en Coraza Central | `CommanderView.tsx:418-423` (`+45 HP` a `+225 HP`) | *"INTEGRIDAD +X HP: Refuerza la Salud estructural máxima del Comandante"* | **Desalineado.** En `GameContext.tsx:846`, la Coraza suma `chest.level * 135 HP` (`+135 HP` por nivel), no `tier * 45 HP`. |
| **Estabilidad / Iniciativa (`+level * 3 SPD`)** en Grebas y Botas | `CommanderView.tsx:432-436` (`+3 SPD` a `+15 SPD`) | *"+X SPD de Iniciativa en Cola de Turnos"* | **Sin efecto.** En `buildInitialTurnOrder` (`GameContext.tsx:375-376`), la velocidad del jugador es una constante fija por facción (`128` Skithid, `112` Cygnus, `102` Valari) y nunca suma `boots.level * 3`. |
| **Resistencias Base por Tipo (`baseResistances`)** | `src/data/gameData.ts:148, 185, 223` (`kinetic`, `energy`, `bio`) | Define porcentajes de resistencia cruzada (`35% / 15% / 20%`) en `FACTIONS` | **Sin efecto.** El motor de combate usa `hasCounterAdvantage` (`+10%` daño / `+25%` al escudo) y las pasivas de cada facción, ignorando `baseResistances`. |

---

### 3. MECÁNICAS CONFIGURADAS, PERO NO CONECTADAS (`CONFIGURADO, PERO NO CONECTADO`)

#### 3.1 Bloqueo Fijo (`hazardLocked = true`) de los Sectores 5 y 6 (End-Game Tiers VI a X)
- **Ubicación en código:**
  - `src/components/StarMapView.tsx:222-223`:
    ```ts
    const hazardLocked =
      sector.id === 'SEC-NEU-EAST' || sector.id === 'SEC-NEU-01';
    ```
  - `src/components/StarMapView.tsx:249-250` (impide la selección/despliegue en planetas de sectores con `hazardLocked`).
- **Contenido completamente configurado que queda inaccesible:**
  1. **Sector 5 (`SEC-NEU-EAST` · *Cinturón de Aethel*, Nv. 34):** 4 planetas (`PLN-AET-01` a `PLN-AET-04`, Tiers VI–VII, niveles enemigos 38 a 50) y 4 enemigos exclusivos (`Parásito Taquiónico de Aethel`, `Quimera Biomineral de Iridio`, `Coloso de Contención Neutrónica`, `Heraldo de la Fisura de Aethel`).
  2. **Sector 6 (`SEC-NEU-01` · *La Falla de Vesper*, Nv. 50):** 3 planetas (`PLN-VESP-01` a `PLN-VESP-03`, Tiers VIII–X, niveles enemigos 54, 60 y 65), 4 enemigos de sector y los **2 Jefes Épicos del Núcleo Galáctico** (`El Arquitecto Primordial` en `PLN-VESP-02` y `Vesperion, Devorador del Abismo` en `PLN-VESP-03`).
  3. **Impacto en la economía:** Todas las zonas de farmeo regular de materias primas **Tier 4** (`Neutronio`, `Órgano Abisal`, `Taquiones`) y **Reliquias Tier 5** (`Materia Oscura`, `Plasma Corrosivo`, `Núcleo Cuántico`) están en los Sectores 5 y 6. Con `hazardLocked = true`, el jugador solo puede obtener `8` unidades de `rawT4` mediante la directiva única `DIR-09` o `1` compuesto T4 al derrotar al Élite Raro de Orión (`3%` / `6%` prob.).

#### 3.2 Nivel de Desarrollo Operativo (`professionLevel`, Niveles 1 a 50)
- **Ubicación en código:**
  - `src/context/GameContext.tsx:650-652, 768-776` (`operationalXp`, `professionLevel`, `professionXpPct`)
  - `src/components/PersistentHeader.tsx` (barra de progreso superior)
- **Estado:**
  - Todas las acciones industriales de la Ciudadela (mejorar edificios, investigar tecnologías, sintetizar compuestos, evolucionar chasis y desguazar materiales) otorgan `operationalXp` y suben `professionLevel` de 1 a 50.
  - Sin embargo, **ninguna fórmula de producción, descuento, velocidad ni desbloqueo consulta `professionLevel`**.

#### 3.3 Habilidad `[4]` (Definitiva) y Estado `playerBuffTurns`
- **Ubicación en código:**
  - `src/context/GameContext.tsx:876, 1564` (`playerBuffTurns`, `buffMult = playerBuffTurns > 0 ? 1.25 : 1`)
  - `src/components/CombatView.tsx:419-456` (rama de efectos de sonido `skillIdx === 4` en Web Audio API)
- **Estado:**
  - `setPlayerBuffTurns` solo se invoca con `0` al reiniciar el combate; no existe botón `[4]` en `CombatView.tsx` ni función que active `playerBuffTurns > 0`.

#### 3.4 Modo de Bajo Consumo por Ranura (`lowPowerMode`)
- **Ubicación en código:**
  - `src/types/game.ts:154` (`lowPowerMode?: boolean`)
  - `src/context/GameContext.tsx:76-82, 839-841, 867` (penaliza estadísticas y reduce consumo de MW un `-35%` si `item.lowPowerMode === true`)
- **Estado:**
  - La lógica matemática en `GameContext.tsx` está implementada, pero **no existe ningún botón o interruptor en `CommanderView.tsx`, `ForgeView.tsx` ni `ReactorCentral.tsx`** que permita al jugador activar o desactivar `lowPowerMode` en una pieza del chasis.

#### 3.5 Unidades Canónicas de Facción (`CANONICAL_FACTION_UNITS`)
- **Ubicación en código:**
  - `src/data/factionIdentityCatalog.ts:597-679` (9 unidades: `Baluarte de Asedio`, `Artillero de Riel`, `Incursor Cinético`, `Acechador de Quitina`, `Escupidor de Ácido`, `Coloso Biomineral`, ` Arconte de Fase`, `Tejedor Fotónico`, `Monolito Null`).
- **Estado:**
  - Están definidas con retratos e iconos propios, pero `getPlanetHostilesRoster` utiliza `SECTOR_NEUTRAL_UNITS_CATALOG` para los 6 sectores. `CANONICAL_FACTION_UNITS` solo se emplea para `DEFAULT_PREVIEW_ENEMY` (`factionIdentityCatalog.ts:1360`).

---

### 4. CONTRADICCIONES DE TEXTO Y CÓDIGO LEGACY MUERTO

#### 4.1 Textos de Interfaz que Contradicen los Valores Reales de `GAME_BALANCE`
1. **Regeneración de Escudo Cygnus:**
   - `src/data/gameData.ts:226` (`FACTIONS.cygnus.passiveEffect`): dice **`10%`** por ciclo.
   - `src/data/factionIdentityCatalog.ts:272` (`FACTION_ASYMMETRIC_PROFILES.cygnus.combatRuleSummary`): dice **`+6%`** por turno.
   - **Valor real en motor (`GameContext.tsx:2346`):** **`3.5%`** por ronda completa.
2. **Mitigación de Blindaje Reactivo Valari:**
   - `src/data/factionIdentityCatalog.ts:212` (`FACTION_ASYMMETRIC_PROFILES.valari.combatRuleSummary`): dice **`-18%`** daño recibido con Defensa > 50%.
   - **Valor real en motor (`GameContext.tsx:2120`):** **`-15%`** (`×0.85`).

#### 4.2 Funciones y Catálogos Legacy No Utilizados en `src/data/gameData.ts`
Las siguientes funciones exportadas en `src/data/gameData.ts` pertenecen a iteraciones previas (`v0.1.0–v0.2.0`) y **no son invocadas por ningún componente activo**:
- `resolveCombatStrike` (`gameData.ts:54-128`)
- `calculateTotalPlayerStats` (`gameData.ts:253-328`)
- `BESTIARY_HOSTILES` (`gameData.ts:523-881`)
- `scaleHostileToPlanet` (`gameData.ts:887-928`)
- `computeSiloMaxCapacity` (`gameData.ts:935-942`)
- `computeLevelProgress` y `computeOperationalLevelProgress` (`gameData.ts:948-994`)
- `STAR_MAP_SECTORS` (`gameData.ts:1022-1198` — reemplazado por `SECTORS_DATA` en `src/data/starMap.data.ts`)

---

## PARTE B: PROPUESTAS E IDEAS DOCUMENTADAS AÚN NO DESARROLLADAS

> Las siguientes ideas fueron registradas en `BITACORA_INTERCAMBIOS_VANGUARD.md` durante sesiones previas como propuestas de la IA o tareas futuras, pero **no están implementadas en el código**:

1. **Explicación en Tutorial y Efecto Mecánico para la Barra de `XP de Desarrollo` (`professionLevel`):**
   - **Origen:** `BITACORA_INTERCAMBIOS_VANGUARD.md` (Entrada `#10`, `2026-11-11`).
   - **Descripción de la idea:** Explicar dentro del tutorial interactivo (`OnboardingTutorialOverlay.tsx`) para qué sirve la segunda barra de experiencia del encabezado (`XP de Desarrollo` / `professionLevel`) y conectarla a una bonificación pasiva industrial o de Ciudadela por nivel (ej. reducción adicional de tiempos de construcción o mayor capacidad/eficiencia de módulos).
   - **Estado actual:** **NO IMPLEMENTADO** (pendiente de decisión de diseño).

2. **Reorganización de Layout en `CommanderView.tsx` (Esquema de 4 Columnas o 2 Pestañas Internas):**
   - **Origen:** `BITACORA_INTERCAMBIOS_VANGUARD.md` (Entrada `#12`, `2026-11-11`).
   - **Descripción de la idea:** Se evaluó reorganizar `CommanderView.tsx` en 4 columnas o 2 pestañas para separar el Esquema Biométrico de la Telemetría Global. El usuario solicitó mantener el diseño clásico de 3 columnas (`Izquierda: 2 tarjetas + Telemetría`, `Centro: Holograma`, `Derecha: 3 tarjetas`), por lo que la propuesta fue descartada.
   - **Estado actual:** **DESCARTADO POR EL USUARIO** (se conserva el layout de 3 columnas).

3. **Apertura y Condiciones de Desbloqueo de los Sectores 5 (`Cinturón de Aethel`) y 6 (`La Falla de Vesper`):**
   - **Origen:** Configuración existente en `src/data/starMap.data.ts:398-562` y `src/components/StarMapView.tsx:222-223`.
   - **Descripción:** Los datos de planetas, botín T4–T5, unidades hostiles y los 2 Jefes Épicos ya existen en el código, pero falta definir e implementar la condición de progresión que reemplace el bloqueo estático `hazardLocked = true` (por ejemplo, derrotar al Élite Raro de Orión o completar `PLN-ORI-04` más un requisito de nivel/tecnología).
   - **Estado actual:** **CONFIGURADO EN DATOS, PENDIENTE DE DESBLOQUEO EN JUEGO**.
