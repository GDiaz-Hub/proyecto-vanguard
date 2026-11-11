# Vanguard Idle · Pulido Final Pre-Publicación y Catálogo de Unidades

Este plan consolida los ajustes visuales y de seguridad previos a publicar la versión de prueba: corrección del encuadre de retratos y etiquetas de origen en la Selección de Facción, restricción de sectores y mundos no disponibles en el Archivo de Hostiles con el mismo criterio del Mapa Estelar, claridad en las barras de experiencia del menú lateral y blindaje de persistencia local (`localStorage`).

## Revisión de Usuario y Decisiones Confirmadas

> [!IMPORTANT]
> Todas las decisiones de diseño y control pre-lanzamiento fueron confirmadas para cerrar el alcance sin añadir complejidad extra:

- **Decisión Confirmada 1 (Tarjetas de Selección de Facción)**: Encuadre de las ilustraciones 9:16 desde el borde superior del casco/antenas/corona (`object-position` calibrado al tramo `6%–8%` superior con altura de cabecera ampliada) para que nunca se recorte la cabeza de los héroes ni en 1920×1080 ni en 3440×1440, unificando además las tres etiquetas superiores bajo el formato **Sector · Mundo Natal** (`Bastión de Vaelor · Vaelor Prime`, `Enjambre Progenitor · Kryll Prime`, `Nexo de Caelum · Nodo Cero`).
- **Decisión Confirmada 2 (Sectores y Mundos Restringidos en el Archivo de Hostiles)**: Aplicar en el Archivo de Hostiles exactamente la misma regla de desbloqueo del Mapa Estelar (solo el Sector Natal de la facción activa + *Corredor de Orión* están habilitados en esta prueba). Los sectores y mundos fuera de la prueba se muestran con candado, insignia de **Acceso Restringido · Sector Bloqueado** y acción deshabilitada.
- **Decisión Confirmada 3 (Claridad de Menú Lateral y Seguridad de Persistencia)**:
  - Reemplazar el indicador entre paréntesis en la barra lateral por etiquetas explícitas de **Próximo Nivel** (`XP Combate · Próximo Nivel` y `Rango Operativo Nv. X · Próximo Nivel`).
  - Versionar el almacenamiento local y aplicar sanitización numérica (`anti-NaN` y límites mínimos en `0`) sobre recursos, créditos, salud, escudos y temporizadores.

---

## 1. Visión General y Objetivo del Cierre

- **Qué resuelve**: Elimina los últimos detalles visuales confusos o inconsistentes antes de compartir el enlace de prueba con jugadores externos y garantiza que el archivo de hostiles respete los límites de contenido de la beta.
- **Público y Contexto**: Jugadores de prueba que accederán mediante el enlace compartido de AI Studio en monitores Full HD (1920×1080) y Ultrawide (3440×1440).
- **Valor Principal**: Presentación impecable desde la primera pantalla de elección de facción, coherencia total entre Mapa Estelar y Códice de Hostiles, y estabilidad de guardado en navegador.

---

## 2. Experiencia de Usuario y Diseño Visual

### A. Selección de Facción (Encuadre de Retratos y Etiqueta Sector · Mundo Natal)
- **Problema actual**: Al renderizar los retratos verticales `9:16` dentro de un marco horizontal con `object-[50%_20%]`/`22%`/`15%`, el recorte superior cae justo sobre la frente, antenas o corona de los tres héroes. Además, solo Cygnus mostraba `Sector · Mundo Natal`, mientras Valari y Skithid mostraban nombres incompletos.
- **Solución visual**:
  - Ampliar ligeramente la ventana de retrato de cada tarjeta y fijar el punto focal vertical en la parte alta del casco/corona (`50% 6%` en Valari, `50% 5%` en Skithid, `50% 4%` en Cygnus) para que la cabeza completa, el visor luminoso, las hombreras y el pecho queden perfectamente encuadrados dentro de la tarjeta.
  - Estandarizar la etiqueta superior derecha en las tres tarjetas con el formato **`Sector · Mundo Natal`**:
    - **Legión Valari**: `Bastión de Vaelor · Vaelor Prime`
    - **Enjambre Skithid**: `Enjambre Progenitor · Kryll Prime`
    - **Nexo Cygnus**: `Nexo de Caelum · Nodo Cero`

### B. Archivo de Hostiles Sincronizado con el Mapa Estelar
- **Regla unificada de acceso en esta versión de prueba**:
  - **Habilitados**: El Sector Natal de la facción elegida (*Tiers I–III*) y el sector neutral **Corredor de Orión** (*Tiers IV–V*).
  - **Restringidos en esta prueba**: Los otros 2 sectores natales rivales, el **Cinturón de Aethel** (*Tiers VI–VII*) y **La Falla de Vesper** (*Tiers VIII–X*).
- **Comportamiento en la interfaz del Archivo de Hostiles**:
  - Los botones de filtro de sectores restringidos muestran un icono de candado.
  - Las tarjetas de mundos pertenecientes a sectores restringidos se presentan atenuadas, con borde e insignia ámbar/roja **`ACCESO RESTRINGIDO · SECTOR BLOQUEADO EN ESTA PRUEBA`**, ocultando sus detalles internos e impidiendo abrir su expediente hasta futuras versiones, idéntico al tratamiento del Mapa Galáctico.
  - El contador superior de *Hostiles Identificados* contabiliza los hostiles de los sectores habilitados para la facción actual (32 hostiles en los 8 mundos accesibles de la partida) para que el jugador pueda alcanzar el 100% real en la prueba.

### C. Claridad en las Barras de Progreso del Menú Lateral
- Debajo de `Héroe Nv. X`, las dos barras de experiencia dejan de mostrar un número de nivel distinto entre paréntesis:
  - Barra 1: **`XP Combate · Próximo Nivel`** con su porcentaje a la derecha (`45%`).
  - Barra 2: **`Rango Operativo Nv. X · Próximo Nv.`** con su porcentaje a la derecha (`17%`).

---

## 3. Decisiones de Producto y Seguridad Pre-Publicación

- **Decisión 1: Persistencia Local Segura y Versionada (`localStorage`)**
  - *Enfoque elegido*: Incorporar validación defensiva (`Number.isFinite`, pisos en `0` y techos válidos) al hidratar y guardar el estado de la partida, junto con una firma de versión de esquema para descartar estados corruptos sin bloquear la carga de la aplicación.
  - *Por qué*: Al ser una aplicación 100% cliente sin backend externo, no existe riesgo de filtración de claves ni ataques a servidores; el único vector de fallo para un tester es un estado local malformado o un valor `NaN` tras múltiples sesiones.
- **Decisión 2: Coherencia de Alcance en la Prueba (8 Mundos Jugables por Partida)**
  - *Enfoque elegido*: Sincronizar la función de validación de sectores entre el Mapa Estelar y el Archivo de Hostiles.
  - *Por qué*: Evita que los jugadores vean o intenten inspeccionar planetas de Tiers VI–X o de cunas rivales que están expresamente cerrados en el mapa galáctico durante esta primera prueba.

---

## 4. Arquitectura Técnica y Flujo de Datos

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   ESTADO GLOBAL Y SANITIZACIÓN DE GUARDADO                 │
│  • Validación anti-NaN en Créditos, Inventario, Niveles, MW y Combate      │
│  • Regla única de Sector Activo: Sector Natal de Facción + Corredor Orión  │
└───────────────┬─────────────────────────────┬──────────────────────────────┘
                │                             │
                ▼                             ▼
┌───────────────────────────────────┐ ┌──────────────────────────────────────┐
│   SELECCIÓN DE FACCIÓN Y SIDEBAR  │ │  MAPA ESTELAR Y ARCHIVO DE HOSTILES  │
│  • Retrato 9:16 encuadrado desde  │ │  • Sectores habilitados: acceso a    │
│    borde superior del casco       │ │    expediente de 4 hostiles y %      │
│  • Etiqueta: Sector · Mundo Natal │ │  • Sectores desactivados: tarjeta    │
│  • Sidebar: "XP · Próximo Nivel"  │ │    con candado y Acceso Restringido  │
└───────────────────────────────────┘ └──────────────────────────────────────┘
```

---

## 5. Referencia Completa de Sprites de Unidades (Sectores Habilitados)

Para facilitar la creación y subida de los artes definitivos, esta tabla resume las **3 unidades de Héroe** y las **16 unidades hostiles** (4 por sector) que participan en los 4 sectores habilitados de la prueba:

| Categoría / Sector | Nombre de Unidad | Rol y % Aparición | Defensa Base | Ataque / Habilidad Firma | Descripción Visual para el Sprite |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Héroe Comandante** | **Héroe Legión Valari** | Jugador (`valari`) | Blindaje | `Salva Pesada` / `Conmoción` / `Sellar Placas` | Comandante acorazado en titanio pesado y placas reactivas con rifle balístico e iluminación ámbar. |
| **Héroe Comandante** | **Héroe Enjambre Skithid** | Jugador (`skithid`) | Esquiva | `Tajo Ácido` / `Neurotoxina` / `Regeneración` | Depredador alfa bio-orgánico de quitina marfil, alas translúcidas y guadañas esmeralda. |
| **Héroe Comandante** | **Héroe Nexo Cygnus** | Jugador (`cygnus`) | Escudos | `Haz Fotónico` / `Prisión Fase` / `Recarga` | Arquitecto cuántico de cromo blanco, obsidiana y arcos de energía azul eléctrico. |
| **1. Bastión de Vaelor** *(Vaelor Prime, Aureus Profundo, Cinder-IV, Baluarte de Hierro)* | **Rastreador Escoria** | Ligera (`42%`) | Esquiva | `Láser de Corte Rápido` | Dron o unidad ligera minera de propulsión ágil con cortadores láser térmicos. |
| **1. Bastión de Vaelor** | **Autómata Fundición** | Media (`33%`) | Blindaje | `Martillo de Escoria` | Autómata bípedo industrial protegido por blindaje pesado de fundición y núcleo ámbar. |
| **1. Bastión de Vaelor** | **Perforadora Vulcano** | Pesada (`15%`) | Blindaje | `Descarga Sísmica (!)` | Máquina pesada acorazada de demolición basáltica con cañón o taladro sísmico. |
| **1. Bastión de Vaelor** | **Autómata Áureo** | Élite Rara (`10% / 18%`) | Blindaje | `Ignición de Núcleo Áureo (!)` | Prototipo élite de fundición recubierto en aleación dorada radiante de alta pureza. |
| **2. Enjambre Progenitor** *(Kryll Prime, Luna Estridulatoria, Crisálida de Kael, Nido del Karkinos)* | **Larva Feral** | Ligera (`42%`) | Esquiva | `Proyección de Espora Ácida` | Criatura ligera hiper-veloz de quitina clara con sacos bioluminiscentes de ácido. |
| **2. Enjambre Progenitor** | **Mantis Abisal** | Media (`33%`) | Esquiva | `Guadaña Doble Corrosiva` | Depredador insectoide ágil de fosa con guadañas dobles impregnadas en toxina verde. |
| **2. Enjambre Progenitor** | **Behemoth Quitinoso** | Pesada (`15%`) | Blindaje | `Embestida Abisal (!)` | Coloso salvaje de asedio recubierto por gruesas placas de quitina marfil y obsidiana. |
| **2. Enjambre Progenitor** | **Matriarca Albina** | Élite Rara (`10% / 18%`) | Esquiva | `Eclosión Neuro-Corrosiva (!)` | Cepa progenitora alfa de quitina blanca pura y reflejos hiper-sinápticos esmeralda. |
| **3. Nexo de Caelum** *(Nodo Cero, Esfera de Silicio Null, Meridiano de Cromo, Horizonte de Coherencia)* | **Sonda Taquiónica** | Ligera (`42%`) | Esquiva | `Pulso de Fijación Null` | Sonda autónoma flotante de cromo espejo y lentes cian que iluminan al objetivo. |
| **3. Nexo de Caelum** | **Espectro Cromo** | Media (`33%`) | Escudos | `Arco Crio-Fotónico` | Unidad media de choque cuántico protegida por barrera hexagonal de escudos de fase. |
| **3. Nexo de Caelum** | **Monolito Null** | Pesada (`15%`) | Blindaje | `Colapso de Fase (!)` | Estructura geodésica pesada de contención revestida en blindaje denso de cromo y obsidiana. |
| **3. Nexo de Caelum** | **Oráculo Cero** | Élite Rara (`10% / 18%`) | Escudos | `Convergencia de Punto Cero (!)` | Unidad élite de cálculo cuántico suspendida entre anillos superconductores en "X". |
| **4. Corredor de Orión** *(Ferrum-Cryo 88, Pena Fracturada, Vórtice de Orión, Bastión Silente)* | **Corsario Vacío** | Ligera (`42%`) | Esquiva | `Carabina Magnética Veloz` | Incursor espacial ligero de alta velocidad y esquiva con propulsores y carabina magnética. |
| **4. Corredor de Orión** | **Mercenario Orión** | Media (`33%`) | Blindaje | `Rifle Térmico de Asalto` | Combatiente veterano fronterizo con placas de blindaje compuesto y rifle térmico. |
| **4. Corredor de Orión** | **Demoledor Orbital** | Pesada (`15%`) | Escudos | `Salva de Abordaje (!)` | Exoesqueleto pesado de abordaje protegido por generador de escudos orbitales. |
| **4. Corredor de Orión** | **Corsario Élite** | Élite Rara (`10% / 18%`) | Escudos | `Bombardeo de Canal (!)` | Comandante mercenario pirata del Corredor de Orión con armadura pesada y escudos de asalto. |
