# REGISTRO DE VERSIONES Y ACTUALIZACIONES — VANGUARD (INTERNO)

> **Ubicación y Privacidad**: Este documento reside exclusivamente en la raíz del proyecto (`/REGISTRO_VERSIONES_VANGUARD.md`) y **nunca** en `/public`, para que no sea expuesto públicamente por el servidor estático. Registra de forma estructurada cada versión del proyecto, las mejoras de rendimiento y los bugs corregidos antes de cada publicación o commit a GitHub.

---

## [v0.5.0] — 2026-11-11 · Balística Cinética Valari, Retratos Dedicados JPG y Auditoría Pre-Publicación

### Nuevas Características y Efectos de Combate
- **Rediseño Balístico Cinético de Tungsteno (Héroe Valari)**:
  - Reemplazo integral de los efectos anteriores de apariencia energética por balística electromagnética física (cañón de riel pesado a dos manos).
  - **Mapeo de píxeles exactos de la ranura del rifle (`getValariRifleRailMask`)**: Detección automática en caché (`OffscreenCanvas`) de la línea luminosa del guardamanos (`x: 154..178, y: 52..58`, `X = 0.5741..0.6556`, `Y = 0.1833` en `hero-cb-valari.png`) para animar la carga de inducción y el pulso de aceleración magnética hacia la bocacha.
  - **Venteo de Freno de Boca y Eyección de Casquillo**: Sustitución del destello esférico por 3 escapes direccionales en V, chispas rectas de fricción de tungsteno y eyección parabólica de casquillo/sabot giratorio desde la ventana extractora.
  - **Proyectiles Físicos Diferenciados**:
    - `[B] Golpe Básico`: Dardo perforante APFSDS de tungsteno gris-acero oscuro con punta incandescente por fricción hipersónica y cono Mach de aire comprimido.
    - `[1] Salva Pesada`: Sabot pesado principal acompañado de 4 sub-proyectiles de metralla de tungsteno hiperdenso a velocidad relativista, ondas sónicas Mach y desprendimiento de fragmentos poligonales de blindaje (`armor spalling`).
    - `[2] Conmoción`: Posta cinética contundente de cabeza chata con frente parabólico de aire comprimido y grietas quebradas de fractura mecánica al impactar.
  - **`[3] Sellar Placas` con Recorte de Silueta (`destination-in`)**: Barrido descendente desde la parte superior del casco hasta el suelo (`vertU: 0 -> 1`) con patrón de placas balísticas imbricadas en chevron (Blanco Incandescente `#FFFFFF` y Ámbar de Blindaje `#FBBF24` / `#F59E0B`), sin auras ni anillos externos fuera del cuerpo del héroe.
- **Sistema de Retratos Independientes en `.jpg` para Cola de Turnos y Dashboard**:
  - **Cola de Turnos (`/public/assets/turnos/*.jpg`)**: 29 archivos únicos de `128×128 px` (3 héroes `hero-{valari,skithid,cygnus}.jpg` + 26 hostiles) renderizados en contenedores ortogonales de `64×64 px` (`2x Retina`).
  - **Mando Central (`/public/assets/retratos-dashboard/*.jpg`)**: 3 retratos dedicados de `600×720 px` (relación `5:6`) para la tarjeta de Héroe del Dashboard.

### Optimizaciones de Rendimiento y Peso de Assets
- **Eliminación de Archivos Temporales y Duplicados**:
  - Eliminación de los retratos duplicados con nomenclatura de combate (`hero-cb-{valari,skithid,cygnus}.jpg`) en `/public/assets/turnos/`.
  - Eliminación del directorio temporal `/public/assets/aistudio/` (capturas de referencia de chat) para evitar que se empaquete en `dist/` o se suba al repositorio de GitHub (`49 MB` totales en `/public/assets`, 100% activos en uso).
- **Optimización de Inicialización de Encuentro en `GameContext.tsx`**:
  - Unificación del cálculo inicial de `buildWaveSquad` mediante `initialCombatWaveSquad` en el montaje de `GameProvider`, evitando ejecutar dos veces la generación aleatoria del escuadrón al iniciar la aplicación y garantizando sincronía exacta entre `enemySquad` y `turnOrderIds`.
- **Caché de Siluetas y Máscaras en Memoria (`CombatView.tsx`)**:
  - Los mapas de silueta y cañón/riel de Cygnus (`cygnusSpriteMaskCache`) y Valari (`valariRifleMaskCache`) se procesan una única vez por URL de sprite y se reutilizan en todos los fotogramas de `requestAnimationFrame` sin re-escanear `getImageData`.

### Bugs Corregidos
- **Limpieza en Desmontaje de Timers de Animación (`CombatView.tsx`)**:
  - Añadido `useEffect` de desmontaje para limpiar `valariTimersRef`, `skithidTimersRef` y `cygnusTimersRef` cuando el jugador sale del Frente de Batalla (`ESC` / `Salir`) en mitad de un ataque, previniendo actualizaciones de estado sobre un componente desmontado.
- **Acotamiento Estricto de Ratios y Radios en Canvas 2D (`CombatView.tsx`)**:
  - Acotamiento explícito `[0, 1]` de `mRatio` e `iRatio` y piso positivo (`Math.max(0.5, ...)`) en `createRadialGradient`, `arc` y `ellipse` dentro de `ValariBasicShotVfxCanvas`, previniendo cualquier `SyntaxError` o `IndexSizeError` en velocidades `x2`/`x3` o frames con delta de tiempo alto.
- **Cancelación Segura del Repliegue por Derrota y Eventos Flotantes (`GameContext.tsx`)**:
  - Reemplazo del `setTimeout` suelto en el repliegue por chasis crítico (`nextHp <= 0`) por `scheduleCombatTimer`, asegurando su cancelación si el usuario reinicia el encuentro o la partida antes de `950ms`.
  - Limpieza inmediata de `floatingEvents` (`setFloatingEvents([])`) dentro de `resetCombatEncounter`.
- **Guardia Anti-Bucle en `.onError` de Imágenes (`CombatView.tsx` y `CommandHubView.tsx`)**:
  - Incorporación de `dataset.fallbackApplied = 'true'` en los manejadores `onError` de retratos `.jpg` para impedir reintentos infinitos si el archivo de respaldo tampoco existiera.

---

## [v0.4.0] — 2026-11-11 · Rediseño HUD de Secuencia de Turnos, Líneas de Facción y Efectos Fotónicos Cygnus

### Nuevas Características y Mejoras Visuales
- **Módulo Ortogonal Unificado de Secuencia de Turnos + Botín de Incursión**:
  - Reemplazo de los marcos inclinados (`skew-x`) por un contenedor ortogonal limpio con retratos de `64×64 px` (`w-16 h-16`) y pestaña de `Botín de Incursión` anclada directamente a su base inferior.
  - Adición de líneas horizontales con degradado lineal del color de la facción activa (`hudLineLeftClass` / `hudLineRightClass`) que nacen de la lista de turnos y se desvanecen antes de tocar las barras de salud del jugador y del enemigo.
- **Ajuste Universal de la Marca de Fijación (`[B] Golpe Básico` Cygnus)**:
  - Posicionamiento calculado desde el borde superior del sprite enemigo (`enemyRect.top + clamp(height * 0.28, 30, 68)`), funcionando de forma uniforme tanto en unidades terrestres como en unidades ligeras/medias que levitan o vuelan.
- **Trayectoria 100% Horizontal y Origen en el Cañón del Antebrazo (`[1] Haz Fotónico` Cygnus)**:
  - Separación vertical (`±5.5 px`) de los dos nodos gemelos emergiendo desde el centro del haz de carga del antebrazo y manteniendo trayectoria estrictamente horizontal con núcleo blanco-dorado y envolvente violeta-cian.

### Bugs Corregidos
- **Corrección de `SyntaxError: Failed to execute 'addColorStop' on 'CanvasGradient': ... 'rgba(56, 189, 248, NaN)'`**:
  - Creación de los helpers `safeRatio` y `safeAlpha` en `CombatView.tsx` para impedir divisiones `0 / 0` cuando `elapsed >= FADE_END` en `drawForearmCannonGlow`, `renderCygnusFrame` y `CygnusPhasePrisonOverlayCanvas`.

---

## [v0.3.0] — 2026-11-11 · Efectos de Combate Skithid y Cygnus + Sombras Dinámicas de Suelo

### Nuevas Características
- **Reconstrucción Completa de Efectos de Combate Skithid (`SkithidCombatVfxCanvas`)**:
  - `[B]` Aguijón Quirinoso, `[1]` Ráfaga de Púas (3 proyectiles con dispersión), `[2]` Espora Neuro-Ácida (globo orgánico parabólico y nube tóxica) y `[3]` Muda Regenerativa.
- **Reconstrucción Completa de Efectos de Combate Cygnus (`CygnusCombatVfxCanvas`)**:
  - Mapeo real de los cristales luminosos del antebrazo (`getCygnusSpriteMasks`), `[2]` Prisión de Fase octaédrica persistente sobre el enemigo aturdido y `[3]` Recarga de Escudo con malla hexagonal recortada a la silueta real del héroe (`destination-in`).

### Bugs Corregidos
- **Eliminación de Círculos Oscuros Fijos bajo los Pies de las Unidades**:
  - Sustitución de las sombras circulares fijas en la arena por sombras elípticas suaves ancladas dentro del contenedor móvil de cada unidad para que acompañen los desplazamientos de embestida y retroceso.

---

## [v0.2.0] — 2026-11-10 · Escalado de Sprites Nativos 1:1 y Compresión de Assets para Despliegue

### Optimizaciones de Rendimiento y Peso de Assets
- **Reducción del Peso de `/public/assets` de `325 MB` a `~49 MB`**:
  - Conversión de los fondos de escenarios y módulos (`ciudadela`, `combate`, `facciones`, `planetas`) a `.webp` de alta calidad para cumplir con holgura el límite de `250 MB` de despliegue en Cloud Run, manteniendo los sprites de unidades en `.png` con transparencia intacta.
- **Escalado Proporcional Nativo de Unidades en `CombatView.tsx`**:
  - Eliminación del escalado forzado por CSS; cada unidad se renderiza respetando sus dimensiones nativas en píxeles (`naturalWidth` / `naturalHeight`).

---

## [v0.1.0] — 2026-11-08 a 2026-11-09 · Arquitectura Base Vanguard, Ciudadela, Mapa Galáctico y Audio

### Características Base
- Implementación de las 3 facciones jugables (**Valari**, **Skithid**, **Cygnus**), Mando Central, Mapa Galáctico de 3 sectores, Ciudadela (Reactor, Forja de Compuestos y Chasis, Laboratorio, Red de Sensores), Códice de Inteligencia, Directivas Operativas y motor de combate por turnos con persistencia en `localStorage` y sintetizador Web Audio API.
