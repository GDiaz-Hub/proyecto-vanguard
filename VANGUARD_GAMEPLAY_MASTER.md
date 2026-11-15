# AUDITORÍA TÉCNICA INTEGRAL — VANGUARD
## Documento Maestro de Gameplay, Sistemas y Balance (Estado Real Implementado)

> **Propósito del documento:** Fuente de referencia técnica oficial sobre el estado real e implementado del proyecto **Vanguard** (`v0.5.0` / `SAVE_STORAGE_KEY = 'vanguard_mvp_save_v5_beta'`).  
> **Criterio de auditoría:** Todo dato, fórmula, probabilidad, coste y estado de implementación aquí documentado proviene de la inspección directa del código fuente (`src/context/GameContext.tsx`, `src/data/factionIdentityCatalog.ts`, `src/data/gameData.ts`, `src/data/starMap.data.ts`, `src/data/mockState.ts`, `src/types/game.ts` y vistas en `src/components/`). No contiene propuestas de diseño ni reinterpretaciones.

---

## 1. RESUMEN GENERAL DEL GAMEPLAY

### Ciclo Completo de Juego (Estado Real desde el punto de vista del jugador)

1. **Ingreso y Selección de Facción (`IMPLEMENTADO Y FUNCIONAL`):**
   - Al iniciar sin partida previa en `localStorage['vanguard_mvp_save_v5_beta']` (o al pulsar `Cambiar Facción`), se despliega `FaccionesView.tsx` en modo selección obligatoria (`mandatorySelection`).
   - El jugador elige una de las **3 doctrinas jugables**: **La Soberanía Valari** (`valari`), **El Enjambre Skithid** (`skithid`) o **El Nexo Cygnus** (`cygnus`), e introduce su nombre de Comandante.
   - Al confirmar (`selectFaction` en `GameContext.tsx:2666-2694`), se inicializa (o recupera por facción desde `heroLoadoutsByFaction`) el equipamiento Mk-I de 5 piezas, `1,250 Créditos` iniciales (`MOCK_CREDITS`), inventario base T1–T5 (`getInitialInventory`) y se redirige al jugador a su planeta natal en `CombatView.tsx`.
   - También se activa automáticamente el tutorial interactivo de 9 pasos (`OnboardingTutorialOverlay.tsx`) si `localStorage['vanguard_tutorial_v1_done'] !== '1'`.

2. **Base o Ciudadela (`IMPLEMENTADO Y FUNCIONAL`):**
   - Accesible desde la navegación lateral (`CiudadelaView.tsx`, `ReactorCentral.tsx`, `ForgeView.tsx`, `LaboratorioView.tsx`, `StorageView.tsx`).
   - El **Reactor Central** (`buildings[0]`, niveles 1–20) gobierna tanto el nivel máximo permitido de los demás edificios (`forgeLevel <= reactorLevel`, `labLevel <= reactorLevel`, `siloLevel <= reactorLevel`) como el presupuesto energético global en **Megavatios (`MW`)**.
   - El jugador puede conmutar entre **3 Protocolos de Ruteo del Reactor** (`Industrial`, `Orbital`, `Bélico`) siempre que disponga de la reserva libre de MW requerida (`15 MW`, `20 MW` o `28 MW`, respectivamente).

3. **Gestión de Recursos (`IMPLEMENTADO PARCIALMENTE`):**
   - Existen **Créditos** (`credits`) y **21 recursos en `MOCK_RESOURCES`** (7 por facción: 4 materias primas `raw_t1` a `raw_t4`, 3 compuestos `craft_t2` a `craft_t4`, y 1 reliquia `t5`). Además, en `FACTION_RESOURCE_SPECS` (`factionIdentityCatalog.ts:297-382`) se definen los recursos activos de recolección y síntesis por facción.
   - En `StorageView.tsx` (Silo Estratégico), el jugador puede **Desguazar (`scrapResource`)** lotes de 10 unidades de recursos T1–T4 a cambio de Créditos (`+25%` para Valari).
   - **Limitación detectada:** El Silo calcula y muestra una barra de capacidad volumétrica (`siloMaxCapacity`), pero `GameContext.tsx` **nunca bloquea ni recorta** el botín de combate ni la síntesis de Forja cuando el inventario supera dicha capacidad.

4. **Construcción y Mejoras (`IMPLEMENTADO Y FUNCIONAL`):**
   - Mejorar edificios (`Reactor`, `Forja`, `Laboratorio`, `Silo`) o investigar tecnologías (`Red de Conductores`, `Aleación de Chasis`, `Logística de Silo`, `Sondeo Orbital`) consume recursos y Créditos de inmediato e inicia un **temporizador en tiempo real** (`activeBuildingUpgrades` y `activeTechResearches` en `GameContext.tsx:2520-2664`) de `6s` a `45s` (`-20%` con Protocolo Industrial). Al expirar, el nivel sube automáticamente.

5. **Equipamiento del Héroe (`IMPLEMENTADO Y FUNCIONAL` con estadísticas secundarias visuales):**
   - En `CommanderView.tsx` (*Héroe y Equipamiento*), el jugador inspecciona su esquema biométrico con las **5 ranuras del chasis**: Arma Principal (`weapon`), Coraza Central (`chest`), Casco Táctico (`helmet`), Guanteletes (`gloves`) y Grebas/Botas (`boots`).
   - En `ForgeView.tsx` (pestaña *2. Evolución de Equipamiento*), cada pieza puede evolucionarse de **Mk-I (Nv. 1) a Mk-V (Nv. 5)** consumiendo materiales, Créditos y presupuesto de MW del Reactor, y rodando una probabilidad de calidad (`Estándar`, `Calibrado`, `Sobrecargado`, `Soberano`).

6. **Selección de Planeta y Sector (`IMPLEMENTADO PARCIALMENTE`):**
   - En `StarMapView.tsx` (*Mapa Estelar*), existen **6 sectores y 23 planetas** definidos en `SECTORS_DATA` (`starMap.data.ts`).
   - **Sectores 1 a 4** (`Bastión de Vaelor`, `Enjambre Progenitor`, `Nexo de Caelum` y `Corredor de Orión`, con 16 planetas en total) son **100% accesibles y desplegables** según el requisito de nivel del planeta (`planet.minLevel`).
   - **Sectores 5 y 6** (`Cinturón de Aethel` y `La Falla de Vesper`, con 7 planetas de Tier VI–X) están **bloqueados por código fijo (`hazardLocked = true`)** en `StarMapView.tsx:222-223`, impidiendo el despliegue incluso si el jugador alcanza Nivel 34 o 50.

7. **Selección de Enemigos o Encuentros (`IMPLEMENTADO Y FUNCIONAL`):**
   - Cada planeta genera un padrón de **4 arquetipos hostiles** mediante `getPlanetHostilesRoster` (`factionIdentityCatalog.ts:1214-1357`): Ligera (`47%`), Media (`35%`), Pesada (`15%`) y Élite Raro / Jefe Épico (`3%`, o `6%` con Protocolo Orbital).
   - Al desplegar en un planeta, `buildWaveSquad` (`GameContext.tsx:274-370`) construye un escuadrón de 1 a 3 enemigos para cada una de las **3 oleadas por incursión** (`totalWaves = 3`).

8. **Combate (`IMPLEMENTADO Y FUNCIONAL`):**
   - Se ejecuta en `CombatView.tsx` bajo un motor **por turnos basado en Iniciativa (`SPD`)** a lo largo de **3 oleadas por incursión**.
   - El jugador dispone de **3 habilidades activas manuales** (`[1]` Ataque Básico, `[2]` Habilidad Especial de Ruptura/Estado con CD de 2 turnos, `[3]` Soporte/Restauración de Escudo y Salud con CD de 3 turnos), un botón de **Modo Automático (`AUTO`)**, selector de velocidad (`x1` / `x2`) y selección de objetivo haciendo clic sobre la unidad enemiga.

9. **Recompensas y Progresión (`IMPLEMENTADO PARCIALMENTE`):**
   - Cada enemigo derrotado otorga materiales del planeta, Créditos y XP inmediatamente (`awardDefeatedEnemiesLoot`, `GameContext.tsx:1388-1456`).
   - Al completar la Oleada 3 (`VICTORIA`), se otorga una bonificación de cierre de incursión (`+65%` del botín base del planeta, Créditos y XP) y se marca el planeta como despejado en `clearedPlanetIds`.
   - Existen dos curvas de experiencia: **Nivel de Héroe (`characterLevel`, Nv. 1–100)**, que escala HP, Defensa, Ataque y desbloquea planetas, y **Nivel de Desarrollo Operativo (`professionLevel`, Nv. 1–50)**, que sube al construir/investigar/forjar pero actualmente **no tiene ningún efecto mecánico conectado**.

10. **Retorno a la Base (`IMPLEMENTADO Y FUNCIONAL`):**
    - Tras una victoria o derrota (o pulsando `Retirarse`), el jugador puede reintentar la incursión, viajar a otro planeta o abrir cualquiera de las vistas de la Ciudadela conservando todo el botín y progreso en `localStorage`.

---

## 2. SISTEMA DE PERSONAJES JUGABLES

### 2.1 Reglas y Fórmulas Comunes a los Tres Héroes (`GameContext.tsx:764-872`)

- **Nivel inicial y límites:** Empieza en **Nivel 1** (`combatXp = 0`) con límite máximo en **Nivel 100** (`maxLevel = 100` en `computeLevelAndPctFromXp(combatXp, 140, 1.38, 100)`, `GameContext.tsx:765`).
- **Fórmula de Salud Máxima (`maxPlayerHp`, `GameContext.tsx:838-850`):**
  $$\text{maxPlayerHp} = \text{round}\Big(\big(620 + (\text{characterLevel} - 1) \times 18 + \text{round}(\text{chest.level} \times 135 \times f_{\text{chest}}) + \text{round}(\text{helmet.level} \times 65 \times f_{\text{helmet}}) + \text{round}(\text{boots.level} \times 55 \times f_{\text{boots}})\big) \times M_{\text{doctrina}}\Big)$$
  Donde:
  - $f_{\text{chest}} = 0.78$ si `chest.lowPowerMode` es `true`, de lo contrario $1.0$.
  - $f_{\text{helmet}} = 0.82$ si `helmet.lowPowerMode` es `true`, de lo contrario $1.0$.
  - $f_{\text{boots}} = 0.85$ si `boots.lowPowerMode` es `true`, de lo contrario $1.0$.
  - $M_{\text{doctrina}} = 1 + (\text{tech\_calibracion\_forja.level} - 1) \times 0.08$ (`1.00` a Nv. 1).
  - **En Nivel 1 (todo Mk-I sin modo bajo consumo ni mejoras de lab):** $620 + 0 + 135 + 65 + 55 = \mathbf{875\text{ HP}}$ para las tres facciones.
- **Fórmula de Defensa / Escudo Máximo (`maxPlayerDefense`, `GameContext.tsx:852-863`):**
  $$\text{maxPlayerDefense} = \text{round}\Big(\big(\text{factionBase} + (\text{characterLevel} - 1) \times 10 + \text{armorSum} \times 9\big) \times M_{\text{doctrina}} \times M_{\text{belicoDef}}\Big)$$
  Donde:
  - $\text{factionBase} = 400$ (`valari`), $360$ (`skithid`), $440$ (`cygnus`).
  - $\text{armorSum} = \sum_{s \in \{\text{chest, helmet, gloves, boots}\}} \text{computeEffectiveSlotStat}(s)$.
  - $\text{computeEffectiveSlotStat}(s) = \text{round}\big(\text{primaryStat.value} \times Q_{\text{mult}}(s.\text{quality}) \times (0.72 \text{ si lowPowerMode})\big)$ (`GameContext.tsx:73-77`).
  - $M_{\text{belicoDef}} = 1.10$ si `reactorRoutingMode === 'belico'`, o $1.00$ en otro modo.
- **Fórmula de Daño de Ataque Base (`playerBaseAttackDmg`, `GameContext.tsx:865-872`):**
  $$\text{playerBaseAttackDmg} = \text{round}\Big(\big(46 + (\text{characterLevel} - 1) \times 2 + \text{weaponVal} \times 1.45 + \text{round}(\text{gloves.level} \times 10 \times f_{\text{gloves}})\big) \times M_{\text{doctrina}} \times M_{\text{belicoAtk}}\Big)$$
  Donde:
  - $\text{weaponVal} = \text{computeEffectiveSlotStat}(\text{weapon})$.
  - $f_{\text{gloves}} = 0.72$ si `gloves.lowPowerMode` es `true`, de lo contrario $1.0$.
  - $M_{\text{belicoAtk}} = 1.12$ si `reactorRoutingMode === 'belico'`, o $1.00$ en otro modo.
- **Velocidad / Iniciativa en Cola de Turnos (`buildInitialTurnOrder`, `GameContext.tsx:372-383`):**
  - El héroe tiene velocidad fija por facción: **Skithid = `128 SPD`**, **Cygnus = `112 SPD`**, **Valari = `102 SPD`**.
  - **Nota de auditoría:** Aunque el tooltip de las botas en `CommanderView.tsx:435` dice `+{item.level * 3} SPD de Iniciativa en Cola de Turnos`, `buildInitialTurnOrder` (`GameContext.tsx:376`) **no suma** el nivel de las botas a `playerSpeed`.
- **Precisión (`accuracy`), Crítico (`critChance`) y Hallazgo (`reconLuck`):**
  - **PRESENTE VISUALMENTE, PERO SIN FUNCIONALIDAD REAL.** Aparecen en las tarjetas de `CommanderView.tsx` y en `weapon.secondaryStat` / `helmet.secondaryStat`, pero no intervienen en ninguna fórmula de `GameContext.tsx`.

---

### 2.2 Héroe 1: Comandante de La Soberanía Valari (`valari`)

- **Facción:** La Soberanía Valari (`FACTIONS.valari`, `gameData.ts:135-171`).
- **Tipo de Daño y Mitigación Nativa:** Daño `Kinetic` (Cinético) / Mitigación `Armor` (Blindaje Plano).
- **Ventaja Doctrinal (Piedra-Papel-Tijera):** Fuerte contra **Cygnus** (`+10%` daño total y `+25%` daño a la barra de defensa/escudo), débil contra **Skithid**.
- **Estadísticas Iniciales en Nivel 1 (Equipamiento Mk-I Estándar):**
  - **Vida Máxima (`maxPlayerHp`):** `875 HP`.
  - **Defensa / Blindaje Máximo (`maxPlayerDefense`):** $\text{factionBase } (400) + \text{armorSum } (16+6+5+5 = 32) \times 9 = 688$ (`757 DEF` con Protocolo Bélico activo por defecto al iniciar).
  - **Daño Base (`playerBaseAttackDmg`):** $46 + 38 \times 1.45 + 10 = 111.1 \rightarrow 111$ (`124 ATQ` con Protocolo Bélico activo por defecto).
  - **Iniciativa (`SPD`):** `102 SPD`.
- **Escalado por Nivel de Héroe (`characterLevel`):**
  - `+18 HP` base por nivel (`× doctrineMultiplier`).
  - `+10 DEF` base por nivel (`× doctrineMultiplier × belicoDefMultiplier`).
  - `+2 ATQ` base por nivel (`× doctrineMultiplier × belicoAtkMultiplier`).
- **Pasivas Reales Implementadas:**
  1. **Blindaje Reactivo (`reactiveArmorActive`, `GameContext.tsx:886-889, 2116-2122`):** Mientras `playerDefense > maxPlayerDefense * 0.50` (`valariReactiveArmorThreshold = 0.5`), reduce todo el daño recibido por enemigos en un **`15%`** (`incomingDamageMultiplier = 0.85`).
  2. **Ingeniería Pesada en Ciudadela (`GameContext.tsx:2503-2506`):** `-15%` al coste de materiales y Créditos en todas las mejoras de edificios e investigaciones (`valariCostReductionPct = 15`).
  3. **Desguace Industrial (`GameContext.tsx:2701-2704`):** `+25%` Créditos obtenidos al desguazar materiales en el Silo (`valariScrapBonusMultiplier = 1.25`).

---

### 2.3 Héroe 2: Comandante de El Enjambre Skithid (`skithid`)

- **Facción:** El Enjambre Skithid (`FACTIONS.skithid`, `gameData.ts:173-209`).
- **Tipo de Daño y Mitigación Nativa:** Daño `Bio` (Bio-Ácido) / Mitigación `Evasion` (Agilidad Sináptica + Caparazón).
- **Ventaja Doctrinal:** Fuerte contra **Valari** (`+10%` daño total y `+25%` daño a la defensa), débil contra **Cygnus**.
- **Estadísticas Iniciales en Nivel 1 (Equipamiento Mk-I Estándar):**
  - **Vida Máxima (`maxPlayerHp`):** `875 HP`.
  - **Defensa / Caparazón Máximo (`maxPlayerDefense`):** $\text{factionBase } (360) + \text{armorSum } (12+5+5+6 = 28) \times 9 = 612$ (`673 DEF` con Protocolo Bélico activo por defecto).
  - **Daño Base (`playerBaseAttackDmg`):** $46 + 42 \times 1.45 + 10 = 116.9 \rightarrow 117$ (`131 ATQ` con Protocolo Bélico activo por defecto).
  - **Iniciativa (`SPD`):** `128 SPD` (actúa siempre primero salvo contra enemigos de nivel muy alto).
- **Escalado por Nivel de Héroe (`characterLevel`):** `+18 HP`, `+10 DEF`, `+2 ATQ` base por nivel.
- **Pasivas Reales Implementadas:**
  1. **Evasión Sináptica Real en Combate (`GameContext.tsx:2125-2139`):** Cada vez que un enemigo ataca a un jugador Skithid, si el jugador no está bajo el estado `Telémetro Activo` (`playerIlluminatedTurns === 0`), tiene un **`22%` de probabilidad (`skithidBaseEvasionChance = 0.22`) de esquivar por completo el ataque (`0` daño a Defensa y `0` daño a HP)**. Si el enemigo aplicó `Telémetro Activo`, la probabilidad de evasión se reduce en `-15%` (`22% - 15% = 7%`). *Nota: El valor de `evasion` de las piezas de armadura incrementa `maxPlayerDefense` (`armorSum * 9`), pero no altera el `22%` fijo de esquiva.*
  2. **Toxina Corrosiva Acumulable (`GameContext.tsx:1577-1595, 1939-1942`):** La habilidad `[2] Espora Ácida` aplica `+1` carga corrosiva al objetivo (máx. `3` cargas). Por cada carga activa en el objetivo, **`6%` del daño total atraviesa directamente el escudo/blindaje hacia la Salud (HP)** (`6% / 12% / 18%`). Además, al inicio del turno de cada enemigo infectado (`GameContext.tsx:2077-2104`), sufre daño directo al HP igual a $\max(6, \text{round}(\text{maxHp} \times 0.04 \times \text{corrosiveStacks}))$.
  3. **Sinapsis Eficiente en Ciudadela (`GameContext.tsx:826-828`, `ForgeView.tsx:641-642`):** `-12%` consumo de MW en las 5 piezas del chasis (`skithidChassisMwMultiplier = 0.88`) y mayor velocidad base de síntesis en Forja (`+20%` progreso por tick frente a `+15%` base).

---

### 2.4 Héroe 3: Comandante de El Nexo Cygnus (`cygnus`)

- **Facción:** El Nexo Cygnus (`FACTIONS.cygnus`, `gameData.ts:211-247`).
- **Tipo de Daño y Mitigación Nativa:** Daño `Energy` (Cuántico-Fotónico) / Mitigación `Shields` (Escudo de Fase).
- **Ventaja Doctrinal:** Fuerte contra **Skithid** (`+10%` daño total y `+25%` daño a la defensa), débil contra **Valari**.
- **Estadísticas Iniciales en Nivel 1 (Equipamiento Mk-I Estándar):**
  - **Vida Máxima (`maxPlayerHp`):** `875 HP`.
  - **Defensa / Escudo Máximo (`maxPlayerDefense`):** $\text{factionBase } (440) + \text{armorSum } (14+5+3+3 = 25) \times 9 = 665$ (`732 ESC` con Protocolo Bélico activo por defecto).
  - **Daño Base (`playerBaseAttackDmg`):** $46 + 40 \times 1.45 + 10 = 114$ (`128 ATQ` con Protocolo Bélico activo por defecto).
  - **Iniciativa (`SPD`):** `112 SPD`.
- **Escalado por Nivel de Héroe (`characterLevel`):** `+18 HP`, `+10 DEF`, `+2 ATQ` base por nivel.
- **Pasivas Reales Implementadas:**
  1. **Resonancia de Fase (`phaseResonanceActive`, `GameContext.tsx:890-891, 1599-1603`):** Mientras `playerDefense > maxPlayerDefense * 0.50`, todos los ataques del Comandante Cygnus infligen **`+12%` de daño adicional** (`cygnusResonanceDamageBonus = 1.12`).
  2. **Recarga Armónica por Ronda (`GameContext.tsx:2343-2361`):** Al finalizar el último turno de cada ronda completa de la cola de iniciativa (`nextIdx === 0`), si el Comandante Cygnus no sufre `Bloqueo de Fase` (`playerShieldLockTurns === 0`) y tiene `playerDefense < maxPlayerDefense`, regenera automáticamente **`+3.5%` de su escudo máximo** (`Math.max(8, Math.round(maxPlayerDefense * 0.035))`).
  3. **Superconductividad y Conservación en Ciudadela (`GameContext.tsx:811-814, 2722-2725`):** `+15%` a la capacidad máxima de MW del Reactor Central (`cygnusCapacityMultiplier = 1.15`) y **`25%` de probabilidad de no consumir materiales ni Créditos** al completar una síntesis de compuestos en la Forja (`cygnusMaterialConservationChance = 0.25`).

---

### 2.5 Habilidades de Combate del Jugador (`GameContext.tsx:1886-2055`, `CombatView.tsx:995-1028`)

| Tecla | Nombre por Facción (Valari / Skithid / Cygnus) | Función Real Implementada | Tipo | Multiplicador / Efecto Exacto | Duración | Cooldown | Coste | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`[1]`** | `Disparo de Riel` / `Zarpazo Quitinizado` / `Pulso Colimado` | Ataque directo al enemigo seleccionado. | Activa ofensiva | `skillMultiplier = 1.0`. Daño a defensa/escudo normal; `12%` de filtración base a HP si el enemigo conserva escudo. | Instantáneo | `0` turnos | Sin coste | **IMPLEMENTADO Y FUNCIONAL** |
| **`[2]`** | `Salva Perforante` / `Espora Ácida` / `Lanza Fotónica` | Ataque especializado con demolición de defensas (`×1.6` al escudo enemigo) y aplicación de estado por doctrina. | Activa ofensiva + Estado | `skillMultiplier = 1.42`, `shieldDamageFactor = 1.6` (más `+25%` si hay ventaja doctrinal).<br>• **Valari:** Aplica `2 turnos` de `Telémetro Activo` (`illuminatedTurns = 2`, reduce evasión enemiga un `15%`).<br>• **Skithid:** Aplica `+1` carga de `Ácido Corrosivo` (máx. `3`, `4%` HP máx./turno + `6%` penetración/carga).<br>• **Cygnus:** Aplica `1 turno` de `Bloqueo de Fase` (`shieldLockTurns = 1`, impide recarga de escudo). | Estado: 1 a 2 turnos (ácido permanente) | **`2` turnos** (`skill2Cd = 2`) | Sin coste | **IMPLEMENTADO Y FUNCIONAL** |
| **`[3]`** | `Sellar Placas` / `Regeneración Celular` / `Recarga Armónica` | Restauración táctica inmediata y purga de estados negativos. | Activa defensiva / curación | Restaura **`+45%` de Defensa/Escudo máximo** (`round(maxPlayerDefense * 0.45)`) y **`+25%` de Salud máxima** (`round(maxPlayerHp * 0.25)`). Purga todas las cargas de ácido (`corrosiveStacks = 0`), bloqueo (`shieldLockTurns = 0`) y telémetro (`illuminatedTurns = 0`). | Instantáneo | **`3` turnos** (`skill3Cd = 3`) | Sin coste | **IMPLEMENTADO Y FUNCIONAL** |
| **`[4]`** | *(Habilidad Definitiva Legacy)* | Audio sintetizado y variable `playerBuffTurns` presentes en código, pero **sin botón en UI ni invocación activa**. | Desconectada | En `CombatView.tsx:419-456` existe audio para `skillIdx === 4` y en `GameContext.tsx:876, 1564` `playerBuffTurns > 0` daría `×1.25` daño, pero nunca se asigna un valor `> 0`. | N/A | N/A | N/A | **CONFIGURADO, PERO NO CONECTADO** |

---

## 3. SISTEMA DE ENEMIGOS

### 3.1 Reglas Globales de Generación, Escalado y Comportamiento (`factionIdentityCatalog.ts:685-1357`, `GameContext.tsx:274-370`)

1. **Catálogo Activo vs Catálogo Legacy:**
   - El juego utiliza **exclusivamente** `getPlanetHostilesRoster(planet, playerFactionId, routingMode)` en `src/data/factionIdentityCatalog.ts:1214-1357`, alimentado por `SECTOR_NEUTRAL_UNITS_CATALOG` (18 unidades regulares en 6 sectores), `SECTOR_RARE_UNITS_CATALOG` (6 Élites Raros, 1 por sector) y `GALACTIC_CORE_EPIC_BOSSES` (2 Jefes Épicos en `PLN-VESP-02` y `PLN-VESP-03`).
   - El arreglo `BESTIARY_HOSTILES` y la función `scaleHostileToPlanet` en `src/data/gameData.ts:523-928` son **código legacy sin uso en combate ni en el Bestiario actual**.
   - El arreglo `CANONICAL_FACTION_UNITS` (9 unidades de facción en `factionIdentityCatalog.ts:597-679`) solo se usa como plantilla de reserva para `DEFAULT_PREVIEW_ENEMY` (`factionIdentityCatalog.ts:1360`).

2. **Fórmula Exacta de Escalado por Nivel del Planeta (`computeEnemyLevelScale`, `factionIdentityCatalog.ts:1186-1193`):**
   Sea $L_p = \max(1, \text{planet.enemyLevel})$ y $\Delta L = \max(0, L_p - 2)$:
   $$\text{levelScale}(L_p) = 1 + 0.28 \times \Delta L + 0.11 \times (\Delta L)^{1.32}$$
   Las estadísticas base por categoría antes de multiplicar por `levelScale` y por los multiplicadores propios de cada unidad (`hpMultiplier`, `defMultiplier`, `atkMultiplier`) son (`factionIdentityCatalog.ts:1236-1256`):
   - **Ligera (`Light`):** Base `380 HP`, `195 DEF`, `98 ATQ`.
   - **Media (`Medium`):** Base `470 HP`, `255 DEF`, `114 ATQ`.
   - **Pesada (`Heavy`):** Base `590 HP`, `330 DEF`, `136 ATQ`.
   - **Élite Raro / Jefe Épico (`Rare Elite`):** Base `690 HP`, `390 DEF`, `152 ATQ`.

   $$\text{HP}_{\text{roster}} = \text{round}(B_{\text{HP}} \times \text{spec.hpMultiplier} \times \text{levelScale}(L_p))$$
   $$\text{DEF}_{\text{roster}} = \text{round}(B_{\text{DEF}} \times \text{spec.defMultiplier} \times \text{levelScale}(L_p))$$
   $$\text{ATQ}_{\text{roster}} = \text{round}(B_{\text{ATQ}} \times \text{spec.atkMultiplier} \times \text{levelScale}(L_p))$$

3. **Multiplicadores Adicionales al Instanciar cada Oleada (`buildWaveSquad`, `GameContext.tsx:274-370`):**
   Al entrar en combate en la oleada $W \in \{1, 2, 3\}$:
   - **Multiplicador de Oleada (`waveMultiplier`):** $M_W = 1 + (W - 1) \times 0.14$ (`1.00` en Oleada 1, `1.14` en Oleada 2, `1.28` en Oleada 3).
   - **Variación por Ranura (`slotVariance`):** Según la posición $i \in \{0, 1, 2\}$ en el escuadrón: `0.95` (pos 0), `1.0` (pos 1), `1.06` (pos 2).
   - **Atenuación en Planeta Natal y Primera Luna (`earlyPlanetDampener`, `GameContext.tsx:303-312`):**
     - En `PLN-VAL-01`, `PLN-SKI-01`, `PLN-CYG-01`: `hpDampener = 0.56`, `defDampener = 0.54`, `atkDampener = 0.62`.
     - En `PLN-VAL-02`, `PLN-SKI-02`, `PLN-CYG-02`: `hpDampener = 0.78`, `defDampener = 0.76`, `atkDampener = 0.82`.
     - En el resto de planetas: `1.0`.
   - **Penalización por Desnivel del Jugador (`overLevelDelta`, `GameContext.tsx:318-325`):**
     Si el nivel del enemigo $L_e$ supera `playerLevel + 1`, sea $\Delta_{\text{over}} = \max(0, L_e - (\text{playerLevel} + 1))$:
     - $M_{\text{overSurv}} = 1 + 0.28 \times \Delta_{\text{over}}$ (`+28%` HP y DEF por cada nivel de exceso).
     - $M_{\text{overAtk}} = 1 + 0.25 \times \Delta_{\text{over}}$ (`+25%` ATQ por cada nivel de exceso).
   - **Iniciativa Enemiga (`SPD`, `GameContext.tsx:327-335`):**
     - Base por clase: Ligera = `116`, Media = `104`, Pesada = `90`, Élite Raro = `124`.
     - $\text{SPD} = \text{baseSpeed} + \min(18, \text{floor}(L_e / 3)) - i \times 3$.

4. **Probabilidades de Aparición (`spawnChancePct`, `factionIdentityCatalog.ts:1221-1226`):**
   - **Modo Bélico o Industrial:** Ligera `47%`, Media `35%`, Pesada `15%`, Élite Raro `3%`.
   - **Modo Orbital (`Protocolo de Sondeo Orbital`):** Ligera `45%`, Media `34%`, Pesada `15%`, Élite Raro `6%` (duplica la probabilidad de Élite Raro).
   - En `buildWaveSquad` (`GameContext.tsx:277-281`), el Élite Raro solo puede aparecer en la **Oleada 3 (oleada final)**.

5. **Comportamiento de Combate Enemigo (`executeEnemyUnitTurn`, `GameContext.tsx:2065-2320`):**
   Cada enemigo ejecuta en su turno una tirada `specialRoll = Math.random()`:
   - **Si es `Rare Elite` y `specialRoll < 0.35` (`35%` prob.):** Ejecuta **`SOBRECARGA DE ÉLITE`** (`×1.25` daño de ataque + aplica el efecto de estado de su doctrina: Ácido si `Bio`, Bloqueo de Fase si `Energy`, Telémetro si `Kinetic`).
   - **Si no es Élite (o no activó sobrecarga) y `specialRoll < 0.28` (`28%` prob.):**
     - **Categoría `Heavy`:** Ejecuta **`BALUARTE DEFENSIVO`**, restaurando `+22%` de su `maxDefense` en lugar de atacar.
     - **Categoría `Medium`:** Ejecuta **`PULSO DE ESTADO`** (`×0.90` daño + aplica estado doctrinal al jugador).
     - **Categoría `Light`:** Ejecuta **`RÁFAGA RÁPIDA`** (`×1.18` daño).
   - **Resto de casos (`72%` en normales / `65%` en Élites):** Ataque estándar (`×1.0` daño).

---

### 3.2 Catálogo Completo de los 26 Enemigos Activos por Sector (`factionIdentityCatalog.ts:685-1159`)

#### Sector 1: Bastión de Vaelor (`SEC-VAL-01` · Planetas `PLN-VAL-01` a `PLN-VAL-04`, Niveles 2, 7, 14, 20)
| Nombre (`id` interno) | Categoría | Doctrina (`damageType` / `defenseType`) | Mult. Base (`HP` / `DEF` / `ATQ`) | Stats Base Nv.2 (`PLN-VAL-01` Roster) | Stats Reales Nv.2 en Oleada 1 (con atenuador natal) | Botín garantizado (Élite) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Dron Perforador Sísmico** (`valari-ligera-dron-perforador`) | `Light` (47%/45%) | `Kinetic` / `Armor` | `0.95` / `0.95` / `1.00` | `361 HP` · `185 DEF` · `98 ATQ` · `116 SPD` | `192 HP` · `95 DEF` · `58 ATQ` | Botín estándar del planeta |
| **Gólem de Escoria Basáltica** (`valari-media-golem-escoria`) | `Medium` (35%/34%) | `Kinetic` / `Armor` | `1.12` / `1.18` / `1.08` | `526 HP` · `301 DEF` · `123 ATQ` · `104 SPD` | `280 HP` · `154 DEF` · `72 ATQ` | Botín estándar del planeta |
| **Autómata Triturador MK-0** (`valari-pesada-triturador-mk0`) | `Heavy` (15%) | `Kinetic` / `Armor` | `1.38` / `1.45` / `1.22` | `814 HP` · `479 DEF` · `166 ATQ` · `90 SPD` | `433 HP` · `246 DEF` · `98 ATQ` | Botín estándar del planeta |
| **Devorador de Vetas Alfa** (`valari-elite-devorador-alfa`) | `Rare Elite` (3%/6%) | `Kinetic` / `Armor` | `1.65` / `1.65` / `1.42` | `1139 HP` · `644 DEF` · `216 ATQ` · `124 SPD` | Oleada 3: `775 HP` · `423 DEF` · `163 ATQ` | `+1 Lingote de Iridio` (`valari_craft_t3_iridio`) o `+1 Placa Neutrónica` si `tier >= 3` |

#### Sector 2: Enjambre Progenitor (`SEC-SKI-01` · Planetas `PLN-SKI-01` a `PLN-SKI-04`, Niveles 2, 7, 14, 20)
| Nombre (`id` interno) | Categoría | Doctrina (`damageType` / `defenseType`) | Mult. Base (`HP` / `DEF` / `ATQ`) | Stats Base Nv.2 (`PLN-SKI-01` Roster) | Stats Reales Nv.2 en Oleada 1 (con atenuador natal) | Botín garantizado (Élite) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Larva Segadora de Quitina** (`skithid-ligera-larva-segadora`) | `Light` (47%/45%) | `Bio` / `Evasion` | `0.90` / `0.85` / `1.06` | `342 HP` · `166 DEF` · `104 ATQ` · `116 SPD` | `182 HP` · `85 DEF` · `61 ATQ` | Botín estándar del planeta |
| **Acechador de Esporas Ácidas** (`skithid-media-acechador-esporas`) | `Medium` (35%/34%) | `Bio` / `Evasion` | `1.06` / `1.05` / `1.15` | `498 HP` · `268 DEF` · `131 ATQ` · `104 SPD` | `265 HP` · `137 DEF` · `77 ATQ` | Botín estándar del planeta |
| **Behemoth de Caparazón Fósil** (`skithid-pesada-behemoth-fosil`) | `Heavy` (15%) | `Bio` / `Armor` | `1.42` / `1.35` / `1.24` | `838 HP` · `446 DEF` · `169 ATQ` · `90 SPD` | `446 HP` · `229 DEF` · `100 ATQ` | Botín estándar del planeta |
| **Matriarca Venenosa de Kryll** (`skithid-elite-matriarca-kryll`) | `Rare Elite` (3%/6%) | `Bio` / `Evasion` | `1.58` / `1.52` / `1.48` | `1090 HP` · `593 DEF` · `225 ATQ` · `124 SPD` | Oleada 3: `742 HP` · `389 DEF` · `170 ATQ` | `+1 Caparazón Mutado` (`skithid_craft_t3_caparazon`) o `+1 Glándula Mutada` si `tier >= 3` |

#### Sector 3: Nexo de Caelum (`SEC-CYG-01` · Planetas `PLN-CYG-01` a `PLN-CYG-04`, Niveles 2, 7, 14, 20)
| Nombre (`id` interno) | Categoría | Doctrina (`damageType` / `defenseType`) | Mult. Base (`HP` / `DEF` / `ATQ`) | Stats Base Nv.2 (`PLN-CYG-01` Roster) | Stats Reales Nv.2 en Oleada 1 (con atenuador natal) | Botín garantizado (Élite) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Centinela Refractor Null** (`cygnus-ligera-centinela-null`) | `Light` (47%/45%) | `Energy` / `Shields` | `0.88` / `1.05` / `1.04` | `334 HP` · `205 DEF` · `102 ATQ` · `116 SPD` | `178 HP` · `105 DEF` · `60 ATQ` | Botín estándar del planeta |
| **Espectro de Cromo Colimado** (`cygnus-media-espectro-cromo`) | `Medium` (35%/34%) | `Energy` / `Shields` | `1.04` / `1.22` / `1.14` | `489 HP` · `311 DEF` · `130 ATQ` · `104 SPD` | `260 HP` · `160 DEF` · `77 ATQ` | Botín estándar del planeta |
| **Monolito de Contención Fase-IV** (`cygnus-pesada-monolito-fase4`) | `Heavy` (15%) | `Energy` / `Shields` | `1.28` / `1.52` / `1.20` | `755 HP` · `502 DEF` · `163 ATQ` · `90 SPD` | `402 HP` · `258 DEF` · `96 ATQ` | Botín estándar del planeta |
| **Arconte de Fase Descontrolado** (`cygnus-elite-arconte-descontrolado`) | `Rare Elite` (3%/6%) | `Energy` / `Shields` | `1.52` / `1.75` / `1.45` | `1049 HP` · `683 DEF` · `220 ATQ` · `124 SPD` | Oleada 3: `714 HP` · `449 DEF` · `166 ATQ` | `+1 Vector Fotónico` (`cygnus_craft_t3_fotones`) o `+1 Matriz Taquiónica` si `tier >= 3` |

#### Sector 4: Corredor de Orión (`SEC-NEU-WEST` · Planetas `PLN-ORI-01` a `PLN-ORI-04`, Niveles 24, 28, 32, 36)
| Nombre (`id` interno) | Categoría | Doctrina (`damageType` / `defenseType`) | Mult. Base (`HP` / `DEF` / `ATQ`) | Stats en `PLN-ORI-01` (Nv. 24, `levelScale = 13.66`) | Botín garantizado (Élite) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Merodeador de Chatarrería Orbital** (`orion-ligera-merodeador-orbital`) | `Light` (47%/45%) | `Kinetic` / `Evasion` | `0.96` / `0.95` / `1.05` | `4,983 HP` · `2,531 DEF` · `1,406 ATQ` · `124 SPD` | Botín estándar del planeta |
| **Corsario de Plasma Acorazado** (`orion-media-corsario-plasma`) | `Medium` (35%/34%) | `Energy` / `Armor` | `1.12` / `1.15` / `1.14` | `7,191 HP` · `4,006 DEF` · `1,775 ATQ` · `112 SPD` | Botín estándar del planeta |
| **Demoledor de Asedio Mercenario** (`orion-pesada-demoledor-mercenario`) | `Heavy` (15%) | `Kinetic` / `Shields` | `1.38` / `1.42` / `1.25` | `11,122 HP` · `6,398 DEF` · `2,322 ATQ` · `98 SPD` | Botín estándar del planeta |
| **Señor de la Guerra del Vórtice** (`orion-elite-senor-vortice`) | `Rare Elite` (3%/6%) | `Energy` / `Armor` | `1.68` / `1.68` / `1.48` | `15,835 HP` · `8,950 DEF` · `3,073 ATQ` · `132 SPD` | `+1` Compuesto T4 de la facción del jugador (`Placa Neutrónica` / `Glándula Mutada` / `Matriz Taquiónica`) |

#### Sector 5: Cinturón de Aethel (`SEC-NEU-EAST` · Planetas `PLN-AET-01` a `PLN-AET-04`, Niveles 38, 42, 46, 50 — **SECTOR BLOQUEADO POR `hazardLocked` EN UI**)
| Nombre (`id` interno) | Categoría | Doctrina (`damageType` / `defenseType`) | Mult. Base (`HP` / `DEF` / `ATQ`) | Stats en `PLN-AET-01` (Nv. 38, `levelScale = 23.59`) | Botín garantizado (Élite) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **parásito Taquiónico de Aethel** (`aethel-ligera-parasito-taquionico`) | `Light` | `Bio` / `Shields` | `0.98` / `1.02` / `1.08` | `8,785 HP` · `4,692 DEF` · `2,497 ATQ` | Botín estándar del planeta |
| **Quimera Biomineral de Iridio** (`aethel-media-quimera-iridio`) | `Medium` | `Bio` / `Armor` | `1.18` / `1.22` / `1.16` | `13,083 HP` · `7,339 DEF` · `3,119 ATQ` | Botín estándar del planeta |
| **Coloso de Contención Neutrónica** (`aethel-pesada-coloso-neutronico`) | `Heavy` | `Kinetic` / `Shields` | `1.44` / `1.48` / `1.28` | `20,042 HP` · `11,512 DEF` · `4,107 ATQ` | Botín estándar del planeta |
| **Heraldo de la Fisura de Aethel** (`aethel-elite-heraldo-fisura`) | `Rare Elite` | `Bio` / `Shields` | `1.74` / `1.72` / `1.52` | `28,322 HP` · `15,824 DEF` · `5,450 ATQ` | `+1` Compuesto T4 de la facción del jugador |

#### Sector 6: La Falla de Vesper (`SEC-NEU-01` · Planetas `PLN-VESP-01` a `PLN-VESP-03`, Niveles 54, 60, 65 — **SECTOR BLOQUEADO POR `hazardLocked` EN UI**)
| Nombre (`id` interno) | Categoría / Planeta | Doctrina (`damageType` / `defenseType`) | Mult. Base (`HP` / `DEF` / `ATQ`) | Stats Calculados por Roster | Botín garantizado (Élite / Jefe) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Espectro del Horizonte de Sucesos** (`vesper-ligera-espectro-horizonte`) | `Light` (Todos) | `Energy` / `Evasion` | `1.02` / `1.06` / `1.12` | Nv.54 (`scale = 35.80`): `13,876 HP` · `7,400 DEF` · `3,929 ATQ` | Botín estándar del planeta |
| **Guardia Precursor de Singularidad** (`vesper-media-guardia-precursor`) | `Medium` (Todos) | `Energy` / `Shields` | `1.22` / `1.28` / `1.20` | Nv.54: `20,528 HP` · `11,685 DEF` · `4,898 ATQ` | Botín estándar del planeta |
| **Acorazado Gravitacional Abisal** (`vesper-pesada-acorazado-abisal`) | `Heavy` (Todos) | `Kinetic` / `Armor` | `1.50` / `1.55` / `1.32` | Nv.54: `31,683 HP` · `18,312 DEF` · `6,427 ATQ` | Botín estándar del planeta |
| **Soberano del Vórtice de Vesper** (`vesper-elite-soberano-vortice`) | `Rare Elite` (`PLN-VESP-01`, Nv.54) | `Energy` / `Shields` | `1.82` / `1.85` / `1.58` | Nv.54: `44,958 HP` · `25,830 DEF` · `8,598 ATQ` | `+1` Reliquia T5 de la facción del jugador |
| **El Arquitecto Primordial** (`boss_arquitecto_primordial`) | `Rare Elite` / Jefe Épico (`PLN-VESP-02`, Nv.60) | `Energy` / `Shields` | `1.95` / `1.95` / `1.62` | Nv.60 (`scale = 40.64`): `54,681 HP` · `30,907 DEF` · `10,007 ATQ` | `+1` Reliquia T5 de la facción del jugador (`Materia Oscura` / `Plasma Corrosivo` / `Núcleo Cuántico`) |
| **Vesperion, Devorador del Abismo** (`boss_vesperion_abisal`) | `Rare Elite` / Jefe Épico (`PLN-VESP-03`, Nv.65) | `Bio` / `Armor` | `2.15` / `2.10` / `1.72` | Nv.65 (`scale = 44.78`): `66,429 HP` · `36,675 DEF` · `11,707 ATQ` | `+1` Reliquia T5 de la facción del jugador (`Materia Oscura` / `Plasma Corrosivo` / `Núcleo Cuántico`) |

---

## 4. FÓRMULAS DE COMBATE Y BALANCE

> **Archivo y función donde se ejecutan:**
> - Ataque del jugador al enemigo: `applyDamageToEnemyUnit` en `src/context/GameContext.tsx:1544-1695`.
> - Ataque del enemigo al jugador: `executeEnemyUnitTurn` en `src/context/GameContext.tsx:2065-2320`.
> - Constantes de balance: `GAME_BALANCE.combat` en `src/data/factionIdentityCatalog.ts:53-71`.

### 4.1 Fórmula Exacta: Ataque del Jugador hacia un Enemigo (`applyDamageToEnemyUnit`)

1. **Verificación de Ventaja Doctrinal (`hasCounterAdvantage`, `GameContext.tsx:1553-1556`):**
   - Valari (`Kinetic`) vence a `Shields` (Cygnus).
   - Skithid (`Bio`) vence a `Armor` (Valari).
   - Cygnus (`Energy`) vence a `Evasion` (Skithid).
   - Si aplica: $M_{\text{counter}} = 1.10$ (`counterFactionDamageBonus`), si no: $1.00$.

2. **Multiplicador de Resonancia de Fase Cygnus (`cygnusResonanceMult`, `GameContext.tsx:1599-1603`):**
   - Si `factionId === 'cygnus'` y `playerDefense > maxPlayerDefense * 0.50`: $M_{\text{resonancia}} = 1.12$, si no: $1.00$.

3. **Cálculo del Daño Total de Impacto (`rawDmg`, `GameContext.tsx:1605-1607`):**
   $$\text{rawDmg} = \max\Big(8,\ \text{round}\big(\text{playerBaseAttackDmg} \times M_{\text{skill}} \times M_{\text{counter}} \times M_{\text{resonancia}}\big)\Big)$$
   Donde $M_{\text{skill}} = 1.00$ para Habilidad `[1]` o $1.42$ para Habilidad `[2]`.

4. **Resolución según el Estado de Defensa del Enemigo (`targetUnit.defense`):**
   - **Caso A: El enemigo tiene Defensa/Escudo activo (`targetUnit.defense > 0`, `GameContext.tsx:1611-1632`):**
     - Factor de demolición de escudo:
       $$F_{\text{shield}} = (\text{isGuardBreakSkill} ? 1.60 : 1.00) \times (\text{hasCounterAdvantage} ? 1.25 : 1.00)$$
     - Daño absorbido por la barra de Defensa:
       $$\text{defDmg} = \min\big(\text{targetUnit.defense},\ \text{round}(\text{rawDmg} \times F_{\text{shield}})\big)$$
     - Filtración base + ácida a la Salud (`bleedRatio`):
       $$\text{bleedRatio} = 0.12 + (\text{factionId} === \text{'skithid'} ? \text{nextCorrosive} \times 0.06 : 0)$$
       *(Con Habilidad `[1]` es `12%`; con Skithid y 1–3 cargas de ácido sube a `18% / 24% / 30%`).*
     - **Si el golpe NO rompe toda la defensa (`overflowRaw <= 0`):**
       $$\text{hpDmg} = \max\big(2,\ \text{round}(\text{rawDmg} \times \text{bleedRatio})\big)$$
     - **Si el golpe ROMPE la defensa en ese impacto (`newDef === 0` y `overflowRaw > 0`):**
       $$\text{overflowRaw} = \max\big(0,\ \text{round}(\text{rawDmg} \times F_{\text{shield}}) - \text{targetUnit.defense}\big)$$
       $$\text{hpDmg} = \text{round}(\text{overflowRaw} \times 1.35) + \text{round}(\text{rawDmg} \times \text{bleedRatio})$$
   - **Caso B: El enemigo ya tenía la Defensa rota (`targetUnit.defense === 0`, `GameContext.tsx:1633-1638`):**
     - El enemigo se encuentra en estado **`VULNERABLE`** y recibe el multiplicador de **Ruptura Crítica (`×1.55`)**:
       $$\text{defDmg} = 0, \qquad \text{hpDmg} = \text{round}(\text{rawDmg} \times 1.55)$$

#### Ejemplo Numérico Real (Héroe Valari Nv. 1 con Protocolo Bélico contra Centinela Refractor Null Nv. 2 en `PLN-CYG-01`, Oleada 1):
- Variables: `playerBaseAttackDmg = 124`, `hasCounterAdvantage = true` (`Kinetic` vs `Shields`), `targetUnit.defense = 105`, `targetUnit.hp = 178`.
- Jugador usa Habilidad `[2] Salva Perforante` ($M_{\text{skill}} = 1.42$, $\text{isGuardBreakSkill} = \text{true}$):
  1. $\text{rawDmg} = \text{round}(124 \times 1.42 \times 1.10 \times 1.0) = \text{round}(193.688) = \mathbf{194}$.
  2. $F_{\text{shield}} = 1.60 \times 1.25 = \mathbf{2.00}$.
  3. Daño potencial al escudo: $\text{round}(194 \times 2.00) = 388$.
  4. Como el enemigo tiene `105 DEF`: $\text{defDmg} = \mathbf{105}$ (`newDef = 0`, ¡Ruptura!), y $\text{overflowRaw} = 388 - 105 = \mathbf{283}$.
  5. $\text{hpDmg} = \text{round}(283 \times 1.35) + \text{round}(194 \times 0.12) = 382 + 23 = \mathbf{405\text{ daño a HP}}$, eliminando instantáneamente al enemigo (`178 HP`).

---

### 4.2 Fórmula Exacta: Ataque del Enemigo hacia el Jugador (`executeEnemyUnitTurn`)

1. **Chequeo de Evasión Sináptica (Solo Jugador Skithid, `GameContext.tsx:2125-2139`):**
   - $P_{\text{evasion}} = \max(0,\ 0.22 - (\text{playerIlluminatedTurns} > 0 ? 0.15 : 0))$.
   - Si `Math.random() < P_evasion`, el ataque falla por completo (`defLoss = 0`, `hpLoss = 0`).

2. **Mitigación por Blindaje Reactivo (Solo Jugador Valari, `GameContext.tsx:2116-2122`):**
   - Si `factionId === 'valari'` y `playerDefense > maxPlayerDefense * 0.50`: $M_{\text{mitigacion}} = 0.85$ (`-15%` daño recibido), de lo contrario $1.00$.

3. **Daño Bruto del Enemigo (`rawEnemyAtk`, `GameContext.tsx:2192-2197`):**
   $$\text{rawEnemyAtk} = \max\Big(6,\ \text{round}(\text{actingEnemy.attack} \times M_{\text{accion}} \times M_{\text{mitigacion}})\Big)$$
   Donde $M_{\text{accion}} = 1.00$ (estándar), $1.18$ (`Ráfaga Rápida` Light), $0.90$ (`Pulso de Estado` Medium) o $1.25$ (`Sobrecarga de Élite`).

4. **Distribución entre Defensa (`playerDefense`) y Salud (`playerHp`, `GameContext.tsx:2218-2236`):**
   - Filtración hacia el HP del jugador mientras tenga Defensa:
     $$\text{enemyBleedRatio} = 0.12 + \text{nextCorrosive} \times 0.06$$
   - **Si `playerDefense > 0`:**
     $$\text{defLoss} = \min(\text{playerDefense},\ \text{rawEnemyAtk})$$
     $$\text{overflow} = \max(0,\ \text{rawEnemyAtk} - \text{playerDefense})$$
     $$\text{hpLoss} = \text{overflow} > 0\ ?\ \text{round}(\text{overflow} \times 1.25) + \text{round}(\text{rawEnemyAtk} \times \text{enemyBleedRatio})\ :\ \max\big(2,\ \text{round}(\text{rawEnemyAtk} \times \text{enemyBleedRatio})\big)$$
   - **Si `playerDefense === 0` (Defensa del jugador rota):**
     $$\text{defLoss} = 0, \qquad \text{hpLoss} = \text{round}(\text{rawEnemyAtk} \times 1.35)$$

---

## 5. ESCALADO Y PROGRESIÓN

### 5.1 Curvas Exactas de Experiencia (`computeLevelAndPctFromXp`, `GameContext.tsx:88-111`)

La función `computeLevelAndPctFromXp(totalXp, baseStep, exponent, maxLevel)` itera nivel por nivel acumulando el requisito de XP para pasar del nivel $L$ al nivel $L+1$:
$$\text{XP}_{\text{nivel}}(L \rightarrow L+1) = \text{round}\big(\text{baseStep} \times L^{\text{exponent}}\big)$$

1. **Nivel de Héroe / Rango de Combate (`characterLevel`, Nv. 1 a 100):**
   - Parámetros (`GameContext.tsx:765`): `baseStep = 140`, `exponent = 1.38`, `maxLevel = 100`.
   - **Ejemplos exactos de XP requerida:**
     - **Nv. 1 → Nv. 2:** `140 XP` (Total acumulado: `140 XP`).
     - **Nv. 2 → Nv. 3:** $\text{round}(140 \times 2^{1.38}) = \mathbf{365\text{ XP}}$ (Total acumulado: `505 XP`).
     - **Nv. 4 → Nv. 5** *(Requisito para desbloquear la primera luna `PLN-*-02`)*: Total acumulado = `140 + 365 + 638 + 948 =` **`2,091 XP`**.
     - **Nv. 10 → Nv. 11:** $\text{round}(140 \times 10^{1.38}) = \mathbf{3,358\text{ XP}}$ (Total acumulado para llegar a Nv. 11, requisito del 3.er planeta `PLN-*-03`: **`14,804 XP`**).
     - **Nv. 19 → Nv. 20** *(Requisito para desbloquear el Sector 4 `Corredor de Orión`)*: Total acumulado = **`64,536 XP`**.

2. **Nivel de Desarrollo Operativo (`professionLevel`, Nv. 1 a 50):**
   - Parámetros (`GameContext.tsx:769`): `baseStep = 100`, `exponent = 1.35`, `maxLevel = 50`.
   - Fuentes de `operationalXp`: Construir edificios (`+45 * targetLevel XP`), investigar tecnologías (`+55 * targetLevel XP`), sintetizar compuestos (`+35 * tier XP`), evolucionar chasis (`+65 * nextLevel XP`) y desguazar en el Silo (`+15 XP`).
   - **Estado:** **CONFIGURADO, PERO NO CONECTADO** a beneficios mecánicos (solo se muestra en `PersistentHeader.tsx`).

3. **XP de Combate Otorgada (`awardDefeatedEnemiesLoot`, `GameContext.tsx:1430-1434`, y Cierre de Incursión `GameContext.tsx:1803-1806`):**
   - **Por cada enemigo derrotado:**
     $$\text{xpGain} = \text{round}\big((28 + L_p \times 7 + T_p \times 12) \times M_{\text{clase}}\big)$$
     Donde $M_{\text{clase}} = 1.0$ (`Light`), $1.35$ (`Medium`), $1.85$ (`Heavy`), $3.20$ (`Rare Elite`).
   - **Al completar la Oleada 3 (Victoria de Incursión):**
     $$\text{completionXp} = \text{round}(45 + L_p \times 11 + T_p \times 18)$$

---

## 6. EQUIPAMIENTO Y COMPONENTES DEL HÉROE

### 6.1 Las 5 Piezas del Chasis por Facción (`getDefaultHeroLoadout`, `factionIdentityCatalog.ts:449-594`)

Todas las piezas inician en **Mk-I (`level = 1`, `tier = 1`, `quality = 'standard'`)** y pueden evolucionarse en la Forja hasta **Mk-V (`level = 5`, `tier = 5`)**.

| Ranura (`slot`) | Nombre (Valari / Skithid / Cygnus) | Estadística Primaria (`primaryStat`) | Valor Base Mk-I (Val / Ski / Cyg) | Incremento por Nivel (`ForgeView.tsx:158-165`) |Valores Mk-I → Mk-II → Mk-III → Mk-IV → Mk-V (Base sin calidad) | Consumo MW Base Mk-I (Val / Ski / Cyg) | Incremento MW por Nivel (`rawExtraMw`) | Efecto Real en `GameContext.tsx` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`weapon`** | Cañón de Riel "Vaelor" / Aguijón Bio-eléctrico / Lanza Fotónica de Fase | `damage` | `38` / `42` / `40` | `+(18 + L*8)` (`+26, +34, +42, +50`) | • Val: `38 → 64 → 98 → 140 → 190`<br>• Ski: `42 → 68 → 102 → 144 → 194`<br>• Cyg: `40 → 66 → 100 → 142 → 192` | `20` / `18` / `22` MW | `+18, +22, +26, +30` MW | Suma `weaponVal * 1.45` al Ataque Base. |
| **`chest`** | Servo-Coraza Bastión / Caparazón Quitinizado / Manto de Fase Armónico | `flatArmor` / `evasion` / `shieldCapacity` | `16` / `12` / `14` | • Val/Cyg: `+(8 + L*4)` (`+12, +16, +20, +24`)<br>• Ski: `+(5 + L*2)` (`+7, +9, +11, +13`) | • Val: `16 → 28 → 44 → 64 → 88`<br>• Ski: `12 → 19 → 28 → 39 → 52`<br>• Cyg: `14 → 26 → 42 → 62 → 86` | `16` / `14` / `18` MW | `+18, +22, +26, +30` MW | Suma `stat * 9` a `maxPlayerDefense` y `level * 135` a `maxPlayerHp`. |
| **`helmet`** | Casco de Sensores Tácticos / Cresta Sensorial Bio-Óptica / Corona de Refracción Cuántica | `flatArmor` / `evasion` / `shieldCapacity` | `6` / `5` / `5` | • Val/Cyg: `+12, +16, +20, +24`<br>• Ski: `+7, +9, +11, +13` | • Val: `6 → 18 → 34 → 54 → 78`<br>• Ski: `5 → 12 → 21 → 32 → 45`<br>• Cyg: `5 → 17 → 33 → 53 → 77` | `8` / `8` / `9` MW | `+12, +16, +20, +24` MW | Suma `stat * 9` a `maxPlayerDefense` y `level * 65` a `maxPlayerHp`. |
| **`gloves`** | Guanteletes de Actuador / Garras Segadoras / Manipuladores de Campo | `flatArmor` / `evasion` / `shieldCapacity` | `5` / `5` / `3` | • Val/Cyg: `+12, +16, +20, +24`<br>• Ski: `+7, +9, +11, +13` | • Val: `5 → 17 → 33 → 53 → 77`<br>• Ski: `5 → 12 → 21 → 32 → 45`<br>• Cyg: `3 → 15 → 31 → 51 → 75` | `8` / `7` / `8` MW | `+12, +16, +20, +24` MW | Suma `stat * 9` a `maxPlayerDefense` y `level * 10` a `playerBaseAttackDmg`. |
| **`boots`** | Botas de Anclaje Magnético / Apéndices Elásticos de Tracción / Propulsores Gravitacionales | `flatArmor` / `evasion` / `shieldCapacity` | `5` / `6` / `3` | • Val/Cyg: `+12, +16, +20, +24`<br>• Ski: `+7, +9, +11, +13` | • Val: `5 → 17 → 33 → 53 → 77`<br>• Ski: `6 → 13 → 22 → 33 → 46`<br>• Cyg: `3 → 15 → 31 → 51 → 75` | `8` / `8` / `9` MW | `+12, +16, +20, +24` MW | Suma `stat * 9` a `maxPlayerDefense` y `level * 55` a `maxPlayerHp`. *(No suma SPD en combate).* |

### 6.2 Costes y Requisitos de Evolución (`getChassisUpgradeRequirements`, `ForgeView.tsx:136-245`)

- **Requisito de Nivel de Forja:** `forgeLevel >= item.level` (Nv. 1 para subir a Mk-II, Nv. 2 para Mk-III, Nv. 3 para Mk-IV, Nv. 4 para Mk-V).
- **Coste en Créditos:** $\text{round}(140 \times L^2 \times (0.90 \text{ si Protocolo Industrial}))$:
  - **Mk-I → Mk-II (`L=1`):** `140 Cr` (`126 Cr` en Industrial).
  - **Mk-II → Mk-III (`L=2`):** `560 Cr` (`504 Cr` en Industrial).
  - **Mk-III → Mk-IV (`L=3`):** `1,260 Cr` (`1,134 Cr` en Industrial).
  - **Mk-IV → Mk-V (`L=4`):** `2,240 Cr` (`2,016 Cr` en Industrial).
- **Coste en Materiales de la Facción (`ForgeView.tsx:184-229`):**
  - **Mk-I → Mk-II:** `16x` Materia Prima T1 (`rawT1`) + `2x` Compuesto T2 (`craftT2`).
  - **Mk-II → Mk-III:** `3x` Compuesto T2 (`craftT2`) + `2x` Compuesto T3 (`craftT3`).
  - **Mk-III → Mk-IV y Mk-IV → Mk-V:** `3x` Compuesto T3 (`craftT3`) + `2x` Compuesto T4 (`craftT4`).

### 6.3 Calidades de Fabricación (`upgradeChassisSlot`, `GameContext.tsx:2741-2805` y `CHASSIS_QUALITY_MULTIPLIERS`)

Cada vez que una pieza evoluciona en la Forja, se lanza `roll = Math.random()` (`GameContext.tsx:2764-2771`):
- **Soberano (`sovereign`):** `10%` de probabilidad (`roll > 0.90` o garantizado al alcanzar `Mk-V` / `nextLevel >= 5`). Multiplicador real: **`×1.32` (`+32%`)** sobre `primaryStat.value`.
- **Sobrecargado (`overcharged`):** `22%` de probabilidad (`0.68 < roll <= 0.90`). Multiplicador real: **`×1.18` (`+18%`)** sobre `primaryStat.value`.
- **Calibrado (`calibrated`):** `68%` de probabilidad (`roll <= 0.68`). Multiplicador real: **`×1.08` (`+8%`)** sobre `primaryStat.value`.
- **Estándar (`standard`):** Calidad inicial de fábrica en Mk-I (`100%`). Multiplicador real: **`×1.00`**.
- **Regla de no-degradación (`GameContext.tsx:2772-2775`):** Al evolucionar una pieza, su calidad nunca baja; se conserva `Math.max(rank(item.quality), rank(rolledQuality))`.

---

## 7. SISTEMAS DE LA BASE / CITADEL

### 7.1 Instalaciones de la Ciudadela (`INITIAL_BUILDINGS`, `gameData.ts:435-483` y `GameContext.tsx:796-836, 2499-2593`)

Todos los edificios tienen **Nivel Máximo 20 (`maxLevel = 20`)**. Ningún módulo secundario (`Forja`, `Laboratorio`, `Silo`) puede superar el nivel actual del `Reactor Central` (`b.level >= reactorLevel`).

| Instalación (`id`) | Estado | Consumo / Generación MW (`GAME_BALANCE.reactor`) | Coste de Mejora del Nivel $L$ al $L+1$ (`GameContext.tsx:2530-2548`) | Duración de Mejora (`getUpgradeDurationSeconds`, `GameContext.tsx:130-137`) | Efecto Real al Subir de Nivel |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Reactor Central** (`bld_reactor_central`) | **IMPLEMENTADO Y FUNCIONAL** | **Genera:** $112 + (L-1) \times 58\text{ MW}$ (`+15%` total si es Cygnus) | • `20 * L` de `rawT1`<br>• `10 * L` de `rawT2`<br>• `160 * L` Créditos<br>*(Valari: `-15%` en todo)* | $\min(45,\ 6 + L \times 4)\text{ seg}$ (`-20%` en modo Industrial). Ej. Nv.1→2: `10s` (`8s` Ind). | Sube el tope de nivel de Forja, Lab y Silo, y añade `+58 MW` (`+66.7 MW` en Cygnus) al presupuesto energético. |
| **Forja de Chasis** (`bld_forja_chasis`) | **IMPLEMENTADO Y FUNCIONAL** | **Consume:** $10 + (L-1) \times 8\text{ MW}$ (`10 MW` a Nv.1) | • `15 * L` de `rawT1`<br>• `8 * L` de `rawT2`<br>• `120 * L` Créditos<br>*(Valari: `-15%`)* | $\min(45,\ 6 + L \times 4)\text{ seg}$ (`-20%` en modo Industrial). | Desbloquea recetas de síntesis T2–T5 (`requiredForgeLevel <= forgeLevel`) y permite evolucionar chasis hasta `Mk-(L+1)` (tope Mk-V en Forja Nv.4). |
| **Laboratorio Doctrinal** (`bld_laboratorio_doctrinal`) | **IMPLEMENTADO Y FUNCIONAL** | **Consume:** $10 + (L-1) \times 8\text{ MW}$ (`10 MW` a Nv.1) | • `14 * L` de `rawT1`<br>• `9 * L` de `rawT2`<br>• `130 * L` Créditos<br>*(Valari: `-15%`)* | $\min(45,\ 6 + L \times 4)\text{ seg}$ (`-20%` en modo Industrial). | Desbloquea el tope de nivel de las 4 tecnologías (`tech.level < labLevel`). |
| **Silo Estratégico** (`bld_silo_estrategico`) | **IMPLEMENTADO PARCIALMENTE** | **Consume:** $6 + (L-1) \times 5\text{ MW}$ (`6 MW` a Nv.1) | • `12 * L` de `rawT1`<br>• `6 * L` de `rawT2`<br>• `100 * L` Créditos<br>*(Valari: `-15%`)* | $\min(45,\ 6 + L \times 4)\text{ seg}$ (`-20%` en modo Industrial). | Incrementa `siloMaxCapacity` en `+1,500 m³` base por nivel (`(2500 + L * 1500) * (1 + (tech_logistica_silo - 1) * 0.20)`), pero el juego **no impone dicho límite** al recolectar ni fabricar. |

### 7.2 Tecnologías del Laboratorio (`INITIAL_TECHNOLOGIES`, `gameData.ts:489-517` y `GameContext.tsx:2595-2664`)

Todas las tecnologías inician en **Nivel 1**, tienen **Nivel Máximo 10 (`maxLevel = 10`)**, requieren `tech.level < labLevel` para subir al siguiente nivel, cuestan **`10 * L` de `rawT1` + `6 * L` de `rawT2` + `110 * L` Créditos** (`-15%` Valari) y tardan $\min(45,\ 6 + L \times 4)\text{ seg}$.

| ID (`name`) | Efecto Real Verificado en Código | Estado |
| :--- | :--- | :--- |
| `tech_red_energetica` (**Red de Conductores**) | Suma **`+18 MW` por nivel por encima de 1** (`(level - 1) * 18 MW`, antes del `+15%` de Cygnus) a la capacidad máxima del Reactor (`GameContext.tsx:801-809`). | **IMPLEMENTADO Y FUNCIONAL** |
| `tech_calibracion_forja` (**Aleación de Chasis**) | En `GameContext.tsx:780-784`, multiplica **`maxPlayerHp`**, **`maxPlayerDefense`** y **`playerBaseAttackDmg`** por $1 + (\text{level} - 1) \times 0.08$ (**`+8%` estadísticas de combate por nivel**). En `LaboratorioView.tsx:207-212` también acelera el paso de síntesis de la Forja en **`+10%` por nivel** (`forgeSpeedBonusPct = (level - 1) * 10`). | **IMPLEMENTADO Y FUNCIONAL** |
| `tech_logistica_silo` (**Logística de Silo**) | Incrementa el número visual `siloMaxCapacity` en **`+20%` por nivel por encima de 1** (`GameContext.tsx:2512`), sin bloqueo real de inventario. | **IMPLEMENTADO PARCIALMENTE** |
| `tech_sensores_orbitales` (**Sondeo Orbital**) | Incrementa la cantidad de materiales obtenida por cada enemigo derrotado y por completar una incursión en **`+12%` por nivel por encima de 1** (`1 + (level - 1) * 0.12`, `GameContext.tsx:1395-1398, 1775-1778`). | **IMPLEMENTADO Y FUNCIONAL** |

---

## 8. RECURSOS, ECONOMÍA Y FABRICACIÓN

### 8.1 Catálogo de Recursos y Recetas de Síntesis (`MOCK_FORGE_RECIPES`, `mockState.ts:272-502`)

Al iniciar partida (`getInitialInventory`, `GameContext.tsx:68-71`), el jugador recibe **25 unidades de `raw_t1`**, **14 unidades de `raw_t2`** y **1 unidad de los demás recursos**.

| Facción | Tier | Recurso Producido (`outputResourceId`) | Nivel Forja Req. | Duración Visual (`ForgeView.tsx`) | Costes de Receta (`costs`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Valari** | **T2** | `valari_craft_t2_titanio` (*Aleación Balística*) | Nv. 1 | ~1.0s (`15%/150ms`) | `10x Ferrita` (`valari_raw_t1_ferrita`) + `6x Titanio` (`valari_raw_t2_titanio`) + `40 Cr` |
| **Valari** | **T3** | `valari_craft_t3_iridio` (*Lingote de Iridio*) | Nv. 2 | ~1.0s | `8x Iridio` (`valari_raw_t3_iridio`) + `2x Aleación Balística` + `95 Cr` |
| **Valari** | **T4** | `valari_craft_t4_neutronio` (*Placa Neutrónica*) | Nv. 3 | ~1.0s | `6x Neutronio` (`valari_raw_t4_neutronio`) + `2x Lingote de Iridio` + `210 Cr` |
| **Valari** | **T5** | `valari_t5_materia_oscura` (*Núcleo de Materia Oscura*) | Nv. 4 | ~1.0s | `2x Placa Neutrónica` + `12x Iridio` + `480 Cr` |
| **Skithid** | **T2** | `skithid_craft_t2_enzima` (*Enzima Corrosiva*) | Nv. 1 | ~0.75s (`20%/150ms`) | `10x Quitina` (`skithid_raw_t1_quitina`) + `6x Espora Ácida` (`skithid_raw_t2_espora`) + `40 Cr` |
| **Skithid** | **T3** | `skithid_craft_t3_caparazon` (*Caparazón Mutado*) | Nv. 2 | ~0.75s | `8x Tejido Vivo` (`skithid_raw_t3_tejido`) + `2x Enzima Corrosiva` + `95 Cr` |
| **Skithid** | **T4** | `skithid_craft_t4_glandula` (*Glándula Mutada*) | Nv. 3 | ~0.75s | `6x Órgano Abisal` (`skithid_raw_t4_glandula`) + `2x Caparazón Mutado` + `210 Cr` |
| **Skithid** | **T5** | `skithid_t5_plasma_corrosivo` (*Cepa de Plasma Corrosivo*) | Nv. 4 | ~0.75s | `2x Glándula Mutada` + `12x Tejido Vivo` + `480 Cr` |
| **Cygnus** | **T2** | `cygnus_craft_t2_cromo` (*Cristal de Cromo*) | Nv. 1 | ~1.0s (`25%` gratis) | `10x Silicio` (`cygnus_raw_t1_silicio`) + `6x Cromo` (`cygnus_raw_t2_cromo`) + `40 Cr` |
| **Cygnus** | **T3** | `cygnus_craft_t3_fotones` (*Vector Fotónico*) | Nv. 2 | ~1.0s (`25%` gratis) | `8x Fotones` (`cygnus_raw_t3_foton`) + `2x Cristal de Cromo` + `95 Cr` |
| **Cygnus** | **T4** | `cygnus_craft_t4_taquion` (*Matriz Taquiónica*) | Nv. 3 | ~1.0s (`25%` gratis) | `6x Taquiones` (`cygnus_raw_t4_taquion`) + `2x Vector Fotónico` + `210 Cr` |
| **Cygnus** | **T5** | `cygnus_t5_nucleo_cuantico` (*Singularidad de Núcleo Cuántico*) | Nv. 4 | ~1.0s (`25%` gratis) | `2x Matriz Taquiónica` + `12x Fotones` + `480 Cr` |

### 8.2 Fórmulas de Botín de Combate (`awardDefeatedEnemiesLoot`, `GameContext.tsx:1388-1456`)

- **Por cada enemigo abatido:**
  - Cantidad base por cada recurso en `planet.combatLoot`:
    $$\text{baseQty} = \max\Big(2,\ \text{round}\big((4 + \text{planet.tier} \times 2.5) \times M_{\text{clase}} \times M_{\text{orbital}} \times M_{\text{sensores}}\big)\Big)$$
    Donde:
    - $M_{\text{clase}} = 1.0$ (`Light`), $1.35$ (`Medium`), $1.85$ (`Heavy`), $3.20$ (`Rare Elite`).
    - $M_{\text{orbital}} = 1.15$ si `reactorRoutingMode === 'orbital'`, de lo contrario $1.0$.
    - $M_{\text{sensores}} = 1 + (\text{tech\_sensores\_orbitales.level} - 1) \times 0.12$.
    - Si el recurso en `planet.combatLoot` contiene `_craft_`, recibe la mitad: $\max(1, \text{round}(\text{baseQty} \times 0.5))$.
  - Además, si el enemigo derrotado es `Rare Elite`, garantiza `+1` unidad de `guaranteedDropId` (Compuesto T3/T4 o Reliquia T5).
  - **Créditos por enemigo abatido:**
    $$\text{creditGain} = \text{round}\big((24 + \text{planet.tier} \times 14 + \text{planet.enemyLevel} \times 2) \times M_{\text{clase}} \times M_{\text{orbital}}\big)$$
- **Bonificación Adicional al Completar las 3 Oleadas (`GameContext.tsx:1772-1806`):**
  - Recursos extra: $\text{round}(\text{baseQty}_{\text{planeta}} \times 0.65)$ por cada recurso en `planet.combatLoot`.
  - Créditos extra: $\text{round}((38 + \text{planet.tier} \times 18 + \text{planet.enemyLevel} \times 3) \times M_{\text{orbital}})$.

---

## 9. MAPA ESTELAR, SECTORES Y PLANETAS (`src/data/starMap.data.ts`)

| Sector (`id`) | Estado en UI (`StarMapView.tsx`) | Nivel Mín. Sector | Planetas (`id` · Nombre · Tier · Nivel Enemigo · Nivel Mín. Héroe · Botín) |
| :--- | :--- | :--- | :--- |
| **1. Bastión de Vaelor** (`SEC-VAL-01`) | **IMPLEMENTADO Y FUNCIONAL** | Nv. 1 | • `PLN-VAL-01` **Vaelor Prime** (Tier I · Enemigo Nv. 2 · Req. Nv. 1): Ferrita, Titanio<br>• `PLN-VAL-02` **Aureus Profundo** (Tier I · Enemigo Nv. 7 · Req. Nv. 5): Ferrita, Titanio<br>• `PLN-VAL-03` **Cinder-IV** (Tier II · Enemigo Nv. 14 · Req. Nv. 11): Titanio, Aleación Balística<br>• `PLN-VAL-04` **Baluarte de Hierro** (Tier III · Enemigo Nv. 20 · Req. Nv. 17): Iridio, Lingote de Iridio |
| **2. Enjambre Progenitor** (`SEC-SKI-01`) | **IMPLEMENTADO Y FUNCIONAL** | Nv. 1 | • `PLN-SKI-01` **Kryll Prime** (Tier I · Enemigo Nv. 2 · Req. Nv. 1): Quitina, Espora Ácida<br>• `PLN-SKI-02` **Luna Estridulatoria** (Tier I · Enemigo Nv. 7 · Req. Nv. 5): Quitina, Espora Ácida<br>• `PLN-SKI-03` **Crisálida de Kael** (Tier II · Enemigo Nv. 14 · Req. Nv. 11): Espora Ácida, Enzima Corrosiva<br>• `PLN-SKI-04` **Nido del Karkinos** (Tier III · Enemigo Nv. 20 · Req. Nv. 17): Tejido Vivo, Caparazón Mutado |
| **3. Nexo de Caelum** (`SEC-CYG-01`) | **IMPLEMENTADO Y FUNCIONAL** | Nv. 1 | • `PLN-CYG-01` **Nodo Cero** (Tier I · Enemigo Nv. 2 · Req. Nv. 1): Silicio, Cromo<br>• `PLN-CYG-02` **Esfera de Silicio Null** (Tier I · Enemigo Nv. 7 · Req. Nv. 5): Silicio, Cromo<br>• `PLN-CYG-03` **Meridiano de Cromo** (Tier II · Enemigo Nv. 14 · Req. Nv. 11): Cromo, Cristal de Cromo<br>• `PLN-CYG-04` **Horizonte de Coherencia** (Tier III · Enemigo Nv. 20 · Req. Nv. 17): Fotones, Vector Fotónico |
| **4. Corredor de Orión** (`SEC-NEU-WEST`) | **IMPLEMENTADO Y FUNCIONAL** | Nv. 20 | • `PLN-ORI-01` **Ferrum-Cryo 88** (Tier IV · Enemigo Nv. 24 · Req. Nv. 20): Titanio, Cromo, Aleación Balística<br>• `PLN-ORI-02` **Pena Fracturada** (Tier IV · Enemigo Nv. 28 · Req. Nv. 24): Espora Ácida, Cristal de Cromo, Enzima Corrosiva<br>• `PLN-ORI-03` **Vórtice de Orión** (Tier V · Enemigo Nv. 32 · Req. Nv. 28): Iridio, Fotones, Tejido Vivo<br>• `PLN-ORI-04` **Bastión Silente** (Tier V · Enemigo Nv. 36 · Req. Nv. 32): Lingote de Iridio, Vector Fotónico, Caparazón Mutado |
| **5. Cinturón de Aethel** (`SEC-NEU-EAST`) | **CONFIGURADO, PERO BLOQUEADO (`hazardLocked`)** | Nv. 34 | • `PLN-AET-01` **Aethel Biomineral** (Tier VI · Enemigo Nv. 38 · Req. Nv. 34): Tejido Vivo, Iridio, Caparazón Mutado<br>• `PLN-AET-02` **Relicario de Aethel** (Tier VI · Enemigo Nv. 42 · Req. Nv. 38): Fotones, Lingote de Iridio, Vector Fotónico<br>• `PLN-AET-03` **Punta Quebrada** (Tier VII · Enemigo Nv. 46 · Req. Nv. 42): Neutronio, Órgano Abisal, Glándula Mutada<br>• `PLN-AET-04` **Umbral de Taquiones** (Tier VII · Enemigo Nv. 50 · Req. Nv. 46): Taquiones, Neutronio, Matriz Taquiónica |
| **6. La Falla de Vesper** (`SEC-NEU-01`) | **CONFIGURADO, PERO BLOQUEADO (`hazardLocked`)** | Nv. 50 | • `PLN-VESP-01` **Vesper Ignis** (Tier VIII · Enemigo Nv. 54 · Req. Nv. 50): Neutronio, Órgano Abisal, Placa Neutrónica<br>• `PLN-VESP-02` **Arca de la Singularidad** (Tier IX · Enemigo Nv. 60 · Req. Nv. 56 · Jefe `El Arquitecto Primordial`): Matriz Taquiónica, Placa Neutrónica, Glándula Mutada<br>• `PLN-VESP-03` **Horizonte de Vesper** (Tier X · Enemigo Nv. 65 · Req. Nv. 60 · Jefe `Vesperion, Devorador del Abismo`): Materia Oscura, Plasma Corrosivo, Núcleo Cuántico |

---

## 10. ESTADO REAL DE LOS SISTEMAS

| Sistema / Subsistema | Clasificación Oficial | Ubicación en Código | Observaciones Técnicas |
| :--- | :--- | :--- | :--- |
| Selección de Facción, Persistencia por Facción y Reseteo | **IMPLEMENTADO Y FUNCIONAL** | `FaccionesView.tsx`, `GameContext.tsx:2666-2694, 3047-3099` | Guarda y restaura `heroLoadoutsByFaction` en `localStorage['vanguard_mvp_save_v5_beta']`. |
| Combate por Turnos de 3 Oleadas, Iniciativa SPD y Ruptura | **IMPLEMENTADO Y FUNCIONAL** | `CombatView.tsx`, `GameContext.tsx:1544-2362` | Incluye habilidades `[1]`, `[2]`, `[3]`, modo `AUTO`, velocidad `x1`/`x2`, desnivel de nivel y estados alterados. |
| Efectos Balísticos/Láser/Bio y Glow de Arma en Combate | **IMPLEMENTADO Y FUNCIONAL** | `CombatView.tsx:120-415` | Proyectiles cinéticos de tungsteno y barrido ámbar-blanco en Valari; haz continuo y pulso en brazo en Cygnus; ácido en Skithid. |
| Reactor Central, Presupuesto MW y 3 Protocolos de Ruteo | **IMPLEMENTADO Y FUNCIONAL** | `ReactorCentral.tsx`, `GameContext.tsx:796-836, 2807-2841` | Calcula MW de edificios + chasis y aplica bonos reales de modo `Industrial`, `Orbital` y `Bélico`. |
| Temporizadores Reales de Construcción e Investigación | **IMPLEMENTADO Y FUNCIONAL** | `GameContext.tsx:2520-2664` | Persisten en `localStorage` y completan automáticamente al llegar `nowTimestamp >= timer.endTime`. |
| Síntesis de Compuestos T2–T5 y Evolución de Chasis Mk-I a Mk-V | **IMPLEMENTADO Y FUNCIONAL** | `ForgeView.tsx`, `GameContext.tsx:2715-2805` | Consume recursos/créditos, aplica pasiva Cygnus (`25%` ahorro) y rueda calidades (`Calibrado`, `Sobrecargado`, `Soberano`). |
| Directivas Operativas (`DIR-01` a `DIR-10`) e Hitos (`REC-01` a `REC-10`) | **IMPLEMENTADO Y FUNCIONAL** | `DirectivesView.tsx`, `GameContext.tsx:2862-3045` | 10 directivas reclamables con recompensas reales y 10 logros atados a telemetría real. |
| Bestiario / Códice de Amenazas con Telemetría Desbloqueable | **IMPLEMENTADO Y FUNCIONAL** | `BestiarioView.tsx`, `GameContext.tsx:682-684` | Registra cada unidad enfrentada en `encounteredEnemyKeys` y desbloquea sus estadísticas reales. |
| Sectores 5 (`Cinturón de Aethel`) y 6 (`La Falla de Vesper`) | **CONFIGURADO, PERO NO CONECTADO** | `StarMapView.tsx:222-223`, `starMap.data.ts:398-562` | Tienen planetas, enemigos y 2 Jefes Épicos configurados, pero están bloqueados con `hazardLocked: true`. |
| Límite de Capacidad Volumétrica del Silo Estratégico | **IMPLEMENTADO PARCIALMENTE** | `StorageView.tsx`, `GameContext.tsx:2508-2517` | Calcula `siloMaxCapacity` y muestra la barra, pero nunca bloquea la entrada de nuevos materiales. |
| Nivel de Desarrollo Operativo (`professionLevel` 1–50) | **CONFIGURADO, PERO NO CONECTADO** | `GameContext.tsx:768-776`, `PersistentHeader.tsx` | Sube de nivel con `operationalXp`, pero ninguna fórmula ni requisito lee `professionLevel`. |
| Estadísticas Secundarias (`critChance`, `accuracy`, `reconLuck`, `+SPD` en botas) | **PRESENTE VISUALMENTE, PERO SIN FUNCIONALIDAD REAL** | `CommanderView.tsx:384-437, 966-973` | Se muestran en tarjetas de equipamiento y telemetría, pero el motor de combate no las consulta. |

---

## 11. PROBLEMAS, INCONSISTENCIAS Y RIESGOS DETECTADOS

1. **Bloqueo Fijo (`hazardLocked = true`) de los Sectores End-Game 5 y 6 (`StarMapView.tsx:222-223`):**
   - Impide obtener en combate los recursos crudos T4 (`valari_raw_t4_neutronio`, `skithid_raw_t4_glandula`, `cygnus_raw_t4_taquion`) y las Reliquias T5, salvo a través de las contadas unidades otorgadas por Directivas (`DIR-09`, `DIR-10`) o el `3%/6%` de probabilidad de Élite Raro en el Sector 4.
2. **Atributos Secundarios de Equipamiento sin Conexión al Motor (`CommanderView.tsx:384-437`):**
   - `critChance` (Arma), `reconLuck` (Casco), `accuracy` (Guantes), `integrity +HP` (Coraza en tooltip) y `+SPD` (Botas en tooltip) se presentan al jugador con descripciones tácticas detalladas, pero `GameContext.tsx` no los aplica en las fórmulas de daño, salud, iniciativa ni botín.
3. **Discrepancia entre Textos Descriptivos y Constantes Reales (`factionIdentityCatalog.ts` vs `gameData.ts`):**
   - `FACTIONS.cygnus.passiveEffect` (`gameData.ts:226`) dice *"Regenera 10% de Escudo por ciclo"*, `FACTION_ASYMMETRIC_PROFILES.cygnus.combatRuleSummary` (`factionIdentityCatalog.ts:272`) dice *"+6% Escudo por turno"*, pero el motor real aplica **`3.5%` por ronda** (`GAME_BALANCE.combat.cygnusTurnShieldRegenRatio = 0.035`).
   - `FACTION_ASYMMETRIC_PROFILES.valari.combatRuleSummary` (`factionIdentityCatalog.ts:212`) dice *"Blindaje Reactivo (-18% daño recibido con Defensa > 50%)"*, mientras que `GAME_BALANCE.combat.valariReactiveArmorMitigation` aplica **`-15%` (`0.85`)**.
4. **Progreso de Síntesis Local en `ForgeView.tsx` (`ForgeView.tsx:587-588, 647-669`):**
   - A diferencia de las mejoras de edificios e investigaciones (que usan temporizadores globales persistentes en `GameContext.tsx`), la barra de síntesis de compuestos usa `useState` local en `ForgeView.tsx` y solo descuenta materiales al llegar al `100%`. Si el jugador cambia de vista durante el segundo que dura la barra, la síntesis se cancela sin efecto.
5. **Código Legacy Duplicado en `src/data/gameData.ts` y `src/data/mockState.ts`:**
   - Funciones como `resolveCombatStrike`, `calculateTotalPlayerStats`, `scaleHostileToPlanet`, `computeLevelProgress`, `computeSiloMaxCapacity` y el catálogo `BESTIARY_HOSTILES` en `gameData.ts` ya fueron reemplazados por `GameContext.tsx` y `factionIdentityCatalog.ts`, quedando como código muerto que puede inducir a error si se edita creyendo que altera el juego en vivo.
