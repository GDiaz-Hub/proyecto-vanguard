# REGISTRO HISTÓRICO DE BALANCE — VANGUARD (`VANGUARD_BALANCE_CHANGELOG.md`)

> **Propósito del documento:** Registro técnico e histórico de todas las modificaciones verificables de estadísticas, fórmulas, probabilidades, costes, tiempos y parámetros de balance en **Project Vanguard**, junto con la fotografía exacta de referencia actual (`v0.5.0`) y la plantilla estandarizada para registrar futuros ajustes.  
> **Regla de trazabilidad:** Solo se incluyen cambios respaldados por evidencia directa en el repositorio (`src/context/GameContext.tsx`, `src/data/factionIdentityCatalog.ts`, `src/data/gameData.ts`, `BITACORA_INTERCAMBIOS_VANGUARD.md`, `AUDITORIA_TRAZABILIDAD_VANGUARD.md` y `REGISTRO_VERSIONES_VANGUARD.md`). No se inventan ajustes previos no verificables.

---

## 1. HISTORIAL VERIFICADO DE MODIFICACIONES DE BALANCE

### [BAL-007] Normalización del Escudo Inicial Cygnus Mk-I y Migración Automática de Partidas
- **Fecha / Versión:** `2026-11-11` (`v0.3.0` / `SAVE_STORAGE_KEY = 'vanguard_mvp_save_v5_beta'`)
- **Fuentes de verificación:**
  - `BITACORA_INTERCAMBIOS_VANGUARD.md` (Entrada `#13`)
  - `REGISTRO_VERSIONES_VANGUARD.md` (`v0.3.0`)
  - `src/context/GameContext.tsx:629-636` (guardia de migración en `heroLoadoutsByFaction`)
  - `src/data/factionIdentityCatalog.ts:539-593` (`getDefaultHeroLoadout('cygnus')`)
- **Parámetros modificados (Antes → Después):**
  - **Coraza Central Cygnus Mk-I (`chest.primaryStat.value`):** `80` → **`14`** (`shieldCapacity`).
  - **Casco, Guantes y Botas Cygnus Mk-I (`helmet/gloves/boots.primaryStat.value`):** `25 / 20 / 20` (suma `145`) → **`5 / 3 / 3`** (suma total `25`).
  - **Defensa / Escudo Máximo Inicial en Nivel 1 (`maxPlayerDefense` sin Protocolo Bélico):**
    - **Antes:** $440 + 145 \times 9 = \mathbf{1,745\text{ ESC}}$ (`1,712 ESC` según configuración previa en partidas guardadas).
    - **Después:** $440 + 25 \times 9 = \mathbf{665\text{ ESC}}$ (`732 ESC` con Protocolo Bélico `+10%`), quedando alineado con **Valari (`688 BLI` / `757 BLI`)** y **Skithid (`612 DEF` / `673 DEF`)**.
- **Motivo técnico:** Evitar que el Comandante Cygnus comenzara en Nivel 1 con casi el triple de defensa que las otras dos doctrinas y migrar automáticamente las partidas guardadas en `localStorage` cuyo `cygnus.chest.level === 1` tuviera `primaryStat.value > 25`.

---

### [BAL-006] Expansión de Directivas Operativas, Hitos y Recompensas de Progresión
- **Fecha / Versión:** `2026-11-11` (`v0.3.0`)
- **Fuentes de verificación:**
  - `BITACORA_INTERCAMBIOS_VANGUARD.md` (Entrada `#12`)
  - `src/context/GameContext.tsx:2862-3045` (`directives` y `achievements`)
- **Parámetros modificados (Antes → Después):**
  - **Directivas Operativas (`DIR-*`):** Ampliadas de `4` directivas iniciales a **`10` Directivas Operativas (`DIR-01` a `DIR-10`)** escalonadas a lo largo de la campaña.
  - **Recompensas agregadas:**
    - `DIR-01` (*3 oleadas superadas*): `+350 Cr`, `+18 rawT1`.
    - `DIR-02` (*Forja Nv. 2*): `+400 Cr`, `+12 rawT2`.
    - `DIR-03` (*Protocolo de Reactor activado*): `+300 Cr`, `+15 rawT1`.
    - `DIR-04` (*2 compuestos sintetizados*): `+480 Cr`, `+10 rawT2`.
    - `DIR-05` (*1 pieza evolucionada a Mk-II+*): `+600 Cr`, `+2 craftT2`.
    - `DIR-06` (*1 planeta conquistado*): `+750 Cr`, `+10 rawT3`.
    - `DIR-07` (*Laboratorio Nv. 2 e investigación Nv. 2+*): `+900 Cr`, `+2 craftT3`.
    - `DIR-08` (*15 oleadas superadas*): `+1,200 Cr`, `+14 rawT3`.
    - `DIR-09` (*Despliegue en Corredor de Orión*): `+1,600 Cr`, `+8 rawT4`.
    - `DIR-10` (*5 piezas en Mk-II+ / suma de niveles >= 10*): `+2,500 Cr`, `+2 craftT4`.
  - **Hitos de Telemetría (`REC-*`):** Ampliados de `4` a **`10` Hitos (`REC-01` a `REC-10`)**.

---

### [BAL-005] Ajuste de Probabilidad de Aparición de Élites Raros y Jefes Épicos
- **Fecha / Versión:** `2026-11-10` (`v0.2.0`)
- **Fuentes de verificación:**
  - `BITACORA_INTERCAMBIOS_VANGUARD.md` (Entrada `#3`)
  - `AUDITORIA_TRAZABILIDAD_VANGUARD.md` (Sección `7.3`)
  - `src/data/factionIdentityCatalog.ts:1221-1226` (`getPlanetHostilesRoster`)
- **Parámetros modificados (Antes → Después):**
  - **Probabilidad de aparición de `Rare Elite` / `Jefe Épico` (`rareChance`):**
    - **Modo Estándar (Bélico / Industrial):** `10%` → **`3%`**.
    - **Modo Protocolo de Sondeo Orbital (`routingMode === 'orbital'`):** `18%` → **`6%`** (duplica la probabilidad base).
  - **Redistribución de probabilidades del resto del padrón planetario:**
    - **Unidad Ligera (`Light`):** **`47%`** (`45%` en modo Orbital).
    - **Unidad Media (`Medium`):** **`35%`** (`34%` en modo Orbital).
    - **Unidad Pesada (`Heavy`):** **`15%`** (`15%` en modo Orbital).

---

### [BAL-004] Transición del Motor de Combate y Reajuste de Multiplicadores Doctrinales
- **Fecha / Versión:** Evolución de `v0.1.0` (`src/data/gameData.ts`) a `v0.2.0–v0.5.0` (`src/data/factionIdentityCatalog.ts` y `src/context/GameContext.tsx`)
- **Fuentes de verificación:**
  - Comparación estratigráfica entre el motor legacy en `src/data/gameData.ts:54-128` (`resolveCombatStrike`) y el motor en vivo en `src/data/factionIdentityCatalog.ts:53-71` (`GAME_BALANCE.combat`) + `src/context/GameContext.tsx:1544-2361`.
- **Parámetros modificados (Motor Legacy `gameData.ts` → Motor Activo `GameContext.tsx`):**
  1. **Estructura del encuentro:** De combate automático 1v1 por intervalos de segundos (`attackIntervalSeconds: 2.2s–2.8s`) → **Combate por turnos con Cola de Iniciativa (`SPD`), escuadrones de 1 a 3 enemigos y `3` oleadas por incursión (`totalWaves = 3`)**.
  2. **Bonificación de daño por Ventaja Doctrinal (`counterFactionDamageBonus`):**
     - `gameData.ts:80`: `×1.15` (`+15%`) → `factionIdentityCatalog.ts:62`: **`×1.10` (`+10%`)** al daño bruto + **`×1.25` (`+25%`)** al daño contra la barra de Defensa/Escudo (`GameContext.tsx:1572`).
  3. **Penetración de Ácido Skithid al HP (`skithidAcidBleedPerStack`):**
     - `gameData.ts:99`: `25%` fijo (`0.25`) → `factionIdentityCatalog.ts:63`: **`6%` por carga acumulable hasta 3 cargas (`6% / 12% / 18%`)**, sumado al **`12%` de filtración base** (`baseShieldBleedRatio = 0.12`), más **`4%` del HP máximo por carga al inicio del turno enemigo**.
  4. **Multiplicador de Ruptura de Defensa (`vulnerabilityDamageBonus`):**
     - `gameData.ts:88`: `×1.50` (`+50%`) → `GameContext.tsx:1609, 1635`: **`×1.35` (`+35%`)** sobre el daño excedente en el golpe que quiebra la defensa y **`×1.55` (`+55%`)** en todos los impactos posteriores mientras `targetUnit.defense === 0`.
  5. **Regeneración de Escudo Cygnus por Ronda (`cygnusTurnShieldRegenRatio`):**
     - `gameData.ts:226` (`10%`) / `factionIdentityCatalog.ts:272` (`6%`) → `factionIdentityCatalog.ts:67` y `GameContext.tsx:2346`: **`3.5%` (`0.035`, mínimo `+8 ESC`)** al cierre de cada ronda de iniciativa si no está bajo `Bloqueo de Fase`.
  6. **Mitigación de Blindaje Reactivo Valari (`valariReactiveArmorMitigation`):**
     - `factionIdentityCatalog.ts:212` (texto descriptivo `-18%`) → `factionIdentityCatalog.ts:65` y `GameContext.tsx:2120`: **`-15%` de daño recibido (`×0.85`)** mientras `playerDefense > 50%`.
  7. **Evasión Base Skithid (`skithidBaseEvasionChance`):**
     - `gameData.ts:62-75` (basada en suma porcentual de equipo hasta `75%`) → `factionIdentityCatalog.ts:68` y `GameContext.tsx:2126-2129`: **`22%` fijo de esquiva total (`0` daño)**, reducido en `-15%` (a **`7%`**) si el jugador está iluminado por `Telémetro Activo`.

---

### [BAL-003] Reajuste de Curvas de Experiencia (Héroe y Desarrollo Operativo)
- **Fecha / Versión:** Evolución de `src/data/gameData.ts:948-994` a `src/context/GameContext.tsx:88-111, 764-771`
- **Fuentes de verificación:**
  - `src/data/gameData.ts:948-994` (`computeLevelProgress`, `computeOperationalLevelProgress`)
  - `src/context/GameContext.tsx:88-111, 764-771` (`computeLevelAndPctFromXp`)
- **Parámetros modificados (Antes → Después):**
  - **Nivel de Héroe (`characterLevel`):**
    - **Antes (`gameData.ts`):** Curva raíz cuadrada $\text{floor}(\sqrt{\text{xp} / 80}) + 1$ con tope en **Nivel 50**.
    - **Después (`GameContext.tsx`):** Curva exponencial acumulativa $\text{XP}(L \rightarrow L+1) = \text{round}(140 \times L^{1.38})$ con tope en **Nivel 100**.
  - **Nivel de Desarrollo Operativo (`professionLevel`):**
    - **Antes (`gameData.ts`):** Curva raíz cuadrada $\text{floor}(\sqrt{\text{xp} / 120}) + 1$ con tope en **Nivel 50**.
    - **Después (`GameContext.tsx`):** Curva exponencial acumulativa $\text{XP}(L \rightarrow L+1) = \text{round}(100 \times L^{1.35})$ con tope en **Nivel 50**.

---

### [BAL-002] Reescalado de Enemigos por Nivel y Penalización por Desnivel
- **Fecha / Versión:** Evolución de `src/data/gameData.ts:887-928` a `src/data/factionIdentityCatalog.ts:1186-1256` y `src/context/GameContext.tsx:274-370`
- **Fuentes de verificación:**
  - `src/data/gameData.ts:887-928` (`scaleHostileToPlanet`)
  - `src/data/factionIdentityCatalog.ts:1186-1256` (`computeEnemyLevelScale`, `getPlanetHostilesRoster`)
  - `src/context/GameContext.tsx:274-370` (`buildWaveSquad`)
- **Parámetros modificados (Antes → Después):**
  - **Escalado por nivel del planeta:**
    - **Antes (`gameData.ts`):** Lineal por encima de Nv. 5 (`1 + (L - 5) * 0.22` en HP/DEF y `1 + (L - 5) * 0.16` en ATQ).
    - **Después (`factionIdentityCatalog.ts`):** Polinómico desde Nv. 2: $\text{levelScale} = 1 + 0.28 \times (L - 2) + 0.11 \times (L - 2)^{1.32}$.
  - **Atenuador de planetas iniciales (`earlyPlanetDampener`, `GameContext.tsx:303-312`):**
    - Añadido factor de reducción en Planetas Natales (`-01`: `0.56 HP`, `0.54 DEF`, `0.62 ATQ`) y Primeras Lunas (`-02`: `0.78 HP`, `0.76 DEF`, `0.82 ATQ`) para suavizar la curva en Nivel 1–7.
  - **Penalización por incursión en planetas de nivel superior (`overLevelDelta`, `GameContext.tsx:318-325`):**
    - Añadido multiplicador por cada nivel que el enemigo supere a `playerLevel + 1`: **`+28%` HP y DEF** y **`+25%` ATQ** por nivel de diferencia.

---

### [BAL-001] Reajuste de Capacidad Visual del Silo Estratégico
- **Fecha / Versión:** Evolución de `src/data/gameData.ts:935-942` a `src/context/GameContext.tsx:2508-2517`
- **Fuentes de verificación:**
  - `src/data/gameData.ts:935-942` (`computeSiloMaxCapacity`)
  - `src/context/GameContext.tsx:2508-2517` (`siloMaxCapacity`)
- **Parámetros modificados (Antes → Después):**
  - **Antes (`gameData.ts`):** $\text{round}((1200 + \text{siloLevel} \times 800) \times (1 + (\text{techLevel} - 1) \times 0.15))$ (`2,000 m³` a Nv. 1).
  - **Después (`GameContext.tsx`):** $\text{round}((2500 + \text{siloLevel} \times 1500) \times (1 + (\text{techLevel} - 1) \times 0.20))$ (`4,000 m³` a Nv. 1).

---

## 2. LÍNEA BASE OFICIAL DE PARÁMETROS (`v0.5.0` — ESTADO ACTUAL EN VIVO)

Esta tabla resume los parámetros activos en `GAME_BALANCE` (`src/data/factionIdentityCatalog.ts:17-72`) y `src/context/GameContext.tsx` como punto de partida para cualquier ajuste futuro:

| Categoría | Parámetro / Constante | Valor Actual en Vivo | Ubicación Exacta |
| :--- | :--- | :--- | :--- |
| **Reactor Central** | Capacidad Base Nv. 1 (`baseMw`) | `112 MW` | `factionIdentityCatalog.ts:19` |
| **Reactor Central** | Incremento por Nivel de Reactor (`mwPerLevel`) | `+58 MW / nivel` | `factionIdentityCatalog.ts:20` |
| **Reactor Central** | Bono `Red de Conductores` (`conductorTechMwPerLevel`) | `+18 MW / nivel` (sobre Nv. 1) | `factionIdentityCatalog.ts:21` |
| **Reactor Central** | Multiplicador de Capacidad Cygnus (`cygnusCapacityMultiplier`) | `×1.15` (`+15%`) | `factionIdentityCatalog.ts:22` |
| **Reactor Central** | Multiplicador Consumo Chasis Skithid (`skithidChassisMwMultiplier`) | `×0.88` (`-12%`) | `factionIdentityCatalog.ts:23` |
| **Reactor Central** | Consumo Edificios (`Forja` / `Lab` / `Silo`) | `10 + 8(L-1)` / `10 + 8(L-1)` / `6 + 5(L-1)` MW | `factionIdentityCatalog.ts:24-29` |
| **Reactor Central** | Reserva requerida por Protocolo (`Industrial` / `Orbital` / `Bélico`) | `15 MW` / `20 MW` / `28 MW` | `factionIdentityCatalog.ts:30-32` |
| **Ciudadela / Forja** | Reducción de Costes Valari (`valariCostReductionPct`) | `-15%` (Edificios y Lab) | `factionIdentityCatalog.ts:36` |
| **Ciudadela / Silo** | Bono de Créditos por Desguace Valari (`valariScrapBonusMultiplier`) | `×1.25` (`+25%`) | `factionIdentityCatalog.ts:37` |
| **Ciudadela / Forja** | Probabilidad de Ahorro de Materiales Cygnus (`cygnusMaterialConservationChance`) | `25%` (`0.25`) | `factionIdentityCatalog.ts:43` |
| **Ciudadela / Forja** | Paso de Progreso de Síntesis (`Base` / `Skithid` / `Industrial`) | `15%` / `20%` / `24%` cada `150ms` | `factionIdentityCatalog.ts:44-46` |
| **Ciudadela / Forja** | Coste en Créditos Evolución Chasis (`chassisBaseCreditCostFactor`) | `140 * L²` (`×0.90` en Industrial) | `factionIdentityCatalog.ts:47-48` |
| **Ciudadela /Forja** | Multiplicadores de Calidad (`Estándar` / `Calibrado` / `Sobrecargado` / `Soberano`) | `×1.00` / `×1.08` / `×1.18` / `×1.32` | `factionIdentityCatalog.ts:50` |
| **Combate** | Oleadas por Incursión (`totalWaves`) y Escalado por Oleada | `3 oleadas` (`×1.00`, `×1.14`, `×1.28`) | `GameContext.tsx:296, 913` |
| **Combate** | Protocolo Bélico (`belicoAtkMultiplier` / `belicoDefMultiplier`) | `×1.12` (`+12% ATQ`) / `×1.10` (`+10% DEF`) | `factionIdentityCatalog.ts:54-55` |
| **Combate** | Protocolo Orbital (`orbitalLootMultiplier` / `rareChance`) | `×1.15` (`+15%` botín y Cr) / `6%` Élite (vs `3%` base) | `factionIdentityCatalog.ts:56, 1226` |
| **Combate** | Habilidad `[1]` / Habilidad `[2]` / Habilidad `[3]` | `×1.00` (CD 0) / `×1.42` y `×1.60` al escudo (CD 2) / `+45% DEF` y `+25% HP` (CD 3) | `GameContext.tsx:1886-2020` |
| **Combate** | Ruptura de Defensa (Golpe de Quiebre / Objetivo Vulnerable) | `×1.35` excedente / `×1.55` daño directo a HP | `GameContext.tsx:1609, 1635` |

---

## 3. PLANTILLA PARA REGISTRAR FUTURAS MODIFICACIONES DE BALANCE

> Copiar y añadir al principio de la **Sección 1** cada vez que se modifique cualquier parámetro de balance, fórmula, coste, probabilidad o tiempo en el proyecto:

```markdown
### [BAL-XXX] Título descriptivo del ajuste de balance
- **Fecha / Versión:** `YYYY-MM-DD` (`vX.Y.Z`)
- **Autor / Solicitud:** Referencia a entrada en `BITACORA_INTERCAMBIOS_VANGUARD.md` (ej. Entrada `#XX`)
- **Archivos y funciones modificadas:**
  - `ruta/al/archivo.ts:linea-inicio-fin` (`nombreFuncionOConstante`)
- **Parámetros modificados (Antes → Después):**
  - **[Nombre del parámetro / estadística / fórmula]:** `Valor o fórmula anterior` → **`Nuevo valor o fórmula`**
- **Impacto numérico esperado:**
  - Ejemplo concreto del cambio (ej. TTK en Nivel X, coste acumulado de Mk-I a Mk-V, etc.).
- **Estado de verificación:** `Implementado / Verificado en compilación y ejecución`
```
