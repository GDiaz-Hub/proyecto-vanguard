# BITÁCORA DE INTERCAMBIOS Y CO-DISEÑO — PROYECTO VANGUARD

> **PROPÓSITO DE ESTE DOCUMENTO:**
> Este archivo registra de forma cronológica, acumulativa y sin omisiones **cada intercambio entre el Usuario (Autor/Director del Proyecto) y la IA (Asistente de Ingeniería)** a partir de la sesión activa.
> - **No reemplaza ni modifica** a `/AUDITORIA_TRAZABILIDAD_VANGUARD.md`.
> - **No incluye bloques de código fuente** (el código reside en los archivos del repositorio), pero sí deja constancia exacta de:
>   1. **Qué pidió el usuario** y cuál fue su intención de diseño.
>   2. **De quién fue la idea** (Idea original del Usuario, Propuesta técnica de la IA o Co-diseño dirigido por el Usuario).
>   3. **En qué ayudó la IA**, qué diseñó desde cero a nivel algorítmico/técnico y en qué brindó soporte sobre la visión del usuario.
>   4. **Cuál fue el resultado final** y qué archivos del proyecto fueron creados o modificados.

---

## INSTRUCCIÓN RECOMENDADA PARA `SYSTEM INSTRUCTIONS`

Si deseas que la IA mantenga este registro de manera automática e infalible en cada respuesta futura, copia y pega el siguiente bloque en el apartado **System Instructions** de AI Studio:

> **REGLA OBLIGATORIA DE BITÁCORA DE INTERCAMBIOS (`BITACORA_INTERCAMBIOS_VANGUARD.md`):**
> En cada turno de conversación, sin excepción, debes actualizar el archivo `/BITACORA_INTERCAMBIOS_VANGUARD.md` (y su copia pública en `/public/BITACORA_INTERCAMBIOS_VANGUARD.md`) agregando una nueva entrada numerada al final del documento antes de dar por terminada tu respuesta.
> Nunca edites ni sobrescribas `/AUDITORIA_TRAZABILIDAD_VANGUARD.md` para este propósito.
> Cada entrada de la bitácora debe documentar sin omitir detalles y sin pegar bloques de código fuente:
> 1. **Pedido del Usuario:** Resumen fiel y completo de lo solicitado, corregido o cuestionado por el usuario en ese turno.
> 2. **Autoría y Origen de la Idea:** Especificar claramente qué definió el usuario como director creativo/funcional y qué propuso la IA.
> 3. **Aporte de la IA (Apoyo Técnico / Diseño desde Cero):** Explicar qué resolvió técnicamente la IA, qué algoritmos o efectos diseñó desde cero para materializar el pedido del usuario y cómo tradujo sus indicaciones visuales o mecánicas.
> 4. **Resultado y Archivos Referenciados:** Describir los cambios aplicados en la aplicación y listar las rutas de los archivos creados o modificados.

---

## REGISTRO CRONOLÓGICO DE INTERCAMBIOS

### Intercambio #1 — Auditoría Maestra de Trazabilidad y Procedencia del Proyecto
- **Fecha:** `2026-11-10`
- **Pedido del Usuario:**
  - El usuario solicitó realizar una auditoría forense y exhaustiva de todo el proyecto **Vanguard** desde su creación hasta el presente, clasificando todas las decisiones en 13 áreas (concepto, género, facciones, lore, geografía galáctica, héroes, enemigos, combate, economía, dirección artística, UI/UX, arquitectura técnica y descartes), distinguiendo rigurosamente qué ideas fueron del usuario y cuáles fueron propuestas de la IA, y exigiendo que el resultado quedara guardado en un documento Markdown descargable.
- **Autoría y Origen de la Idea:**
  - **100% iniciativa y estructura metodológica del Usuario:** El usuario definió la estructura completa de auditoría (Secciones A a H y las 13 áreas temáticas) y la regla estricta de no inventar atribuciones cuando el historial previo hubiera sido compactado.
- **Aporte de la IA (Apoyo Técnico / Investigación Forense):**
  - La IA inspeccionó la totalidad del código fuente (`src/data/factionIdentityCatalog.ts`, `src/data/starMap.data.ts`, `src/data/gameData.ts`, `src/types/game.ts`, `src/context/GameContext.tsx`, `src/components/CombatView.tsx`, etc.), cruzó las marcas de tiempo de ediciones manuales del usuario del `2026-11-09` y `2026-11-10`, detectó 7 contradicciones internas entre catálogos antiguos y nuevos, y redactó el documento maestro de auditoría.
  - Asimismo, la IA agregó un botón directo de exportación en el encabezado de la aplicación (`PersistentHeader.tsx`) para descargar el archivo `.md`.
- **Resultado y Archivos Referenciados:**
  - Creación del documento maestro de auditoría y habilitación de su descarga directa desde la interfaz.
  - **Archivos involucrados:** `/AUDITORIA_TRAZABILIDAD_VANGUARD.md`, `/public/AUDITORIA_TRAZABILIDAD_VANGUARD.md`, `/src/components/PersistentHeader.tsx`.

---

### Intercambio #2 — Integración con Google Workspace (`Google Drive`, `Google Docs` y `Google Forms`)
- **Fecha:** `2026-11-10`
- **Pedido del Usuario:**
  - El usuario solicitó conectar la aplicación con **Google Drive**, **Google Docs** y **Google Forms** aceptando los permisos OAuth correspondientes en la interfaz de AI Studio.
- **Autoría y Origen de la Idea:**
  - **Pedido directo del Usuario** para dotar al proyecto de exportación y sincronización real con su cuenta de Google Workspace.
- **Aporte de la IA (Diseño desde Cero e Implementación Técnica):**
  - La IA configuró el flujo OAuth 2.0 del lado del cliente (`Google Identity Services`) y diseñó desde cero los servicios de integración y el modal interactivo de Google Workspace que permite:
    1. Guardar el documento de auditoría directamente en **Google Drive** (`.md`).
    2. Crear un **Google Doc** nativo formateado en la cuenta del usuario.
    3. Generar un **Google Form** interactivo con las preguntas de atribución histórica pendientes.
- **Resultado y Archivos Referenciados:**
  - Integración funcional accesible desde el botón `WORKSPACE` en la barra superior.
  - **Archivos involucrados:** `/src/services/workspaceAuth.ts`, `/src/services/workspaceDriveDocsForms.ts`, `/src/components/GoogleWorkspaceModal.tsx`, `/src/components/PersistentHeader.tsx`, `/src/components/MainLayout.tsx`.

---

### Intercambio #3 — Consulta sobre Acceso al Historial del Menú de Versiones de AI Studio y Propuesta de Efectos de Combate para Valari
- **Fecha:** `2026-11-10`
- **Pedido del Usuario:**
  1. Preguntó si la IA tenía acceso directo a los datos del menú de versiones de Gemini AI Studio para recuperar conversaciones previas compactadas.
  2. Consultó si era posible crear efectos específicos de combate con las herramientas actuales (sin generar sprites externos de balas ni animaciones separadas), tomando como ejemplo al héroe **Valari (Rygart)**: que el disparo de energía ámbar con partículas salga milimétricamente desde la punta donde termina el cañón de su rifle y viaje hasta el enemigo en mira, cambiando además la física del personaje para que **ya no avance hacia adelante al disparar**, sino que haga un movimiento sutil hacia atrás de preparación/retroceso (más lento y corto que al esquivar) para dar sensación de apuntado y momentum de disparo. Adjuntó captura de la arena (`image_523a9145.png`).
- **Autoría y Origen de la Idea:**
  - **Idea original y dirección cinemática del Usuario:** El usuario concibió tanto la regla de que un tirador con rifle no debe abalanzarse hacia adelante como un combatiente cuerpo a cuerpo, como la idea de usar coordenadas milimétricas en la punta del rifle y diferenciar el movimiento de retroceso del disparo frente al de esquiva.
- **Aporte de la IA (Apoyo Técnico y Análisis de Viabilidad):**
  - La IA explicó con transparencia que el entorno de ejecución no tiene acceso a la base de datos interna del menú de versiones de AI Studio salvo que el usuario restaure o copie esos datos.
  - Respecto al combate, la IA confirmó la viabilidad técnica mediante un lienzo `HTML5 Canvas 2D` superpuesto a la arena y midió los píxeles reales del archivo `/public/assets/unidades/hero-cb-valari.png` (`270 × 300` px) para localizar la coordenada exacta donde termina la bocacha del rifle.
- **Resultado y Archivos Referenciados:**
  - Diagnóstico técnico y propuesta detallada previa a la autorización del usuario.
  - **Archivos inspeccionados:** `/public/assets/aistudio/image_523a9145.png`, `/public/assets/unidades/hero-cb-valari.png`, `/src/components/CombatView.tsx`.

---

### Intercambio #4 — Aprobación Condicional: Implementar Primero Solo el Disparo Básico de Valari, Sombra de Contorno Sutil y Reinicio del Botín por Incursión
- **Fecha:** `2026-11-10`
- **Pedido del Usuario:**
  - El usuario dio el visto bueno bajo una condición prudente: **implementar únicamente el Golpe Básico (`[B]`) y exclusivamente en el héroe Valari**, para evaluar primero la precisión y calidad visual antes de aplicarlo al resto de habilidades.
  - Solicitó además dos ajustes adicionales:
    1. **Sombra de contorno apenas perceptible alrededor de los sprites:** Reincorporar una sombra perimetral suave (sin borde duro) de unos `3px` a `5px` de grosor con ~`70%` de transparencia (`30%` de opacidad) para despegar sutilmente los personajes del fondo.
    2. **Reinicio del Botín de Incursión por run:** Corregir el contador de botín en la arena para que se reinicie en cada incursión y al salir del combate, en lugar de acumularse indefinidamente desde la primera pelea.
- **Autoría y Origen de la Idea:**
  - **100% dirección del Usuario** (alcance acotado de prueba en el golpe básico de Valari, especificación de grosor/transparencia de la sombra perimetral y regla de negocio del botín por incursión).
- **Aporte de la IA (Diseño Técnico del Efecto y Corrección de Estado):**
  - La IA midió sobre la matriz RGBA de `hero-cb-valari.png` la punta exacta del freno de boca del rifle (`X = 269/270 = 0.9963`, `Y = 58/300 = 0.1933`).
  - Diseñó desde cero el componente `ValariBasicShotVfxCanvas` en `CombatView.tsx` con ignición en bocacha, proyectil ámbar y chispas de impacto, junto con la secuencia física de apuntado y culatazo (`aim` → `kick` → `recover`) sustituyendo el avance frontal del héroe Valari.
  - Aplicó el filtro `drop-shadow-[0_0_4px_rgba(0,0,0,0.3)]` (`4px` de radio, `70%` de transparencia) en los sprites de la arena.
  - Corrigió `GameContext.tsx` para limpiar `combatSessionLoot` al iniciar o abandonar una incursión.
- **Resultado y Archivos Referenciados:**
  - Primer prototipo funcional del disparo básico de Valari, sombra sutil de `4px` y reinicio automático del botín por run.
  - **Archivos modificados:** `/src/components/CombatView.tsx`, `/src/context/GameContext.tsx`.

---

### Intercambio #5 — Corrección de Error de Orden de Hooks en `MainLayout.tsx`
- **Fecha:** `2026-11-10`
- **Pedido del Usuario:**
  - Reporte automático/manual de error en tiempo de ejecución: `React has detected a change in the order of Hooks called by MainShell` al pasar de la pantalla de selección de facción al layout principal.
- **Autoría y Origen de la Idea:**
  - **Detección del Usuario** durante la prueba de la aplicación.
- **Aporte de la IA (Depuración Técnica):**
  - La IA identificó que el hook `useState` del modal de Google Workspace (`isWorkspaceModalOpen`) había quedado declarado después del `return` condicional `if (isSelectingFaction)` en `MainShell`, violando las Reglas de Hooks de React. Movió la declaración al bloque superior incondicional del componente.
- **Resultado y Archivos Referenciados:**
  - Error de renderizado eliminado por completo.
  - **Archivos modificados:** `/src/components/MainLayout.tsx`.

---

### Intercambio #6 — Ajuste de Sombra Perimetral, Trayectoria 100% Recta, Estética de Riel Futurista y Extensión a los 4 Skills de Valari
- **Fecha:** `2026-11-10`
- **Pedido del Usuario:**
  - Tras probar en video (`20261111-0636-59.5667668_9547d4d1.mp4`) el disparo básico de Valari, el usuario indicó:
    1. **Sombra de sprites:** El tamaño (`4px`) quedó perfecto, pero necesitaba **apenas más visibilidad**.
    2. **Trayectoria 100% recta horizontal:** El disparo salía inclinado buscando la mitad de la altura del enemigo; pidió que salga en **trayectoria completamente recta horizontal**, sin preocuparse por bajarlo a la mitad del sprite enemigo.
    3. **Estética más futurista (Ámbar Incandescente + Azul de Riel):** Señaló que el primer efecto parecía un arma de fuego convencional y pidió algo más futurista que mantenga el color ámbar incandescente del rifle Valari combinado con un tono azul como si fuera acelerado por un riel magnético.
    4. **Generación de los demás efectos de habilidades de Valari:** Al comprobar que la calidad y precisión del efecto iban por el camino buscado, autorizó generar los efectos de las demás habilidades de Valari (`[1] Salva Pesada`, `[2] Conmoción`, `[3] Sellar Placas`) para poder compararlos en combate.
- **Autoría y Origen de la Idea:**
  - **Dirección creativa y visual del Usuario:** Fue idea del usuario fijar la trayectoria en línea recta horizontal, definir el concepto visual de "plasma ámbar incandescente acelerado por un riel azul" y aprobar el paso a las demás habilidades de Valari.
- **Aporte de la IA (Diseño Algorítmico desde Cero sobre las Directrices del Usuario):**
  - Incrementó la opacidad del `drop-shadow` de `4px` de `0.30` a `0.55` (`drop-shadow-[0_0_4px_rgba(0,0,0,0.55)]`), manteniendo intacto el radio de `4px`.
  - Fijó matemáticamente `endY = startY` en el canvas balístico para garantizar una trayectoria horizontal 100% recta desde la bocacha del rifle.
  - Diseñó los efectos para las 4 acciones de Valari (`[B] Golpe Básico`, `[1] Salva Pesada`, `[2] Conmoción` y `[3] Sellar Placas` como barrido vertical de inducción sobre el propio Comandante) incorporando anillos de aceleración y vaina azul de riel con núcleo ámbar.
- **Resultado y Archivos Referenciados:**
  - Los 4 skills de Valari quedaron operativos con trayectoria horizontal recta y sombra de `4px` más visible.
  - **Archivos modificados:** `/src/components/CombatView.tsx`.

---

### Intercambio #7 — Viraje de Valari hacia el Ámbar con Mayor Poder/Diferenciación y Tiempos de Carga/Retroceso, Diseño de Efectos para Skithid y Creación de esta Bitácora
- **Fecha:** `2026-11-10`
- **Pedido del Usuario:**
  1. **Bitácora obligatoria en un archivo `.md` nuevo (sin editar `AUDITORIA_TRAZABILIDAD_VANGUARD.md`):** Redactar cada intercambio entre ambos en un archivo `.md` nuevo, detallando qué pidió el usuario, si fue idea suya, en qué ayudó la IA, qué ideó desde cero o en qué dio apoyo técnico (sin pegar el código fuente), y redactar además una instrucción clara y directa para colocar en **System Instructions**.
  2. **Ajuste de colores, poder y tiempos en Valari:**
     - Virar los disparos de Valari **más hacia el color ámbar incandescente** de la energía de su rifle (estaban demasiado azules).
     - El efecto de recarga de blindaje (`[3] Sellar Placas`) quedó **aprobado** tal como estaba.
     - Darle **más sensación de poder y mayor diferenciación visual entre los 3 disparos ofensivos** (`[B] Golpe Básico`, `[1] Salva Pesada`, `[2] Conmoción`), sin que consista simplemente en hacer una línea más gruesa.
     - Hacer **perceptibles las variaciones en el tiempo de carga (apuntado) y en el tiempo/intensidad de retroceso** entre cada tipo de disparo (que antes eran casi imperceptibles).
  3. **Diseño e implementación de los efectos de combate del Héroe Skithid (adjuntando captura `image_a1fff987.png`):**
     - Como el Comandante Skithid es un sprite fijo con **dos hojas/guadañas bioluminiscentes**, iluminar milimétricamente el filo de sus armas antes del golpe para dar la ilusión de que está cargando el ataque.
     - Mantener el movimiento de avance frontal del sprite hacia adelante al atacar, pero representar los efectos de golpe **directamente sobre el sprite enemigo** (en lugar de una trayectoria de disparo):
       - **`[B] Golpe Básico`:** Carga en 1 hoja y **corte simple diagonal de 1 hoja** con el color verde bioluminiscente del arma sobre el enemigo.
       - **`[1] Tajo Ácido`:** Carga intensa en ambas hojas y **corte cruzado en `X`** con mayor efecto de salpicadura y corrosión ácida sobre el enemigo.
       - **`[2] Neurotoxina`:** Carga bio-eléctrica en los filos y **efecto de carga neurotóxica visible adherida al sprite enemigo** (anillos/arcos sinápticos que lo envuelven y paralizan).
       - **`[3] Regeneración`:** Concepto sobre el propio héroe similar al de Valari, pero compuesto por **líneas horizontales color esmeralda** (representando la recuperación de Esquiva Sináptica) combinadas con un **aura orgánica** que indica la curación de Salud (HP).
- **Autoría y Origen de la Idea:**
  - **Dirección creativa, conceptual y coreográfica del Usuario:**
    - El usuario definió la corrección cromática de Valari (predominio ámbar incandescente fiel al sprite del arma), aprobó `[3] Sellar Placas` y exigió diferenciación morfológica y temporal real entre los 3 disparos.
    - Para **Skithid**, el usuario ideó por completo la solución de diseño para animar un sprite cuerpo a cuerpo estático: iluminar milimétricamente los filos de sus dos hojas como pre-carga, desplazar el sprite hacia adelante y concentrar la manifestación visual del ataque directamente sobre el cuerpo del enemigo (corte simple para Básico, corte en `X` ácido para Tajo Ácido, carga visible en el enemigo para Neurotoxina, y líneas horizontales esmeralda + aura curativa para Regeneración).
- **Aporte de la IA (Apoyo Técnico, Medición de Píxeles y Diseño Procedural en Canvas):**
  1. **Creación de la Bitácora Independiente:** Creación de `/BITACORA_INTERCAMBIOS_VANGUARD.md` (y su espejo en `/public/BITACORA_INTERCAMBIOS_VANGUARD.md`) dejando intacto `/AUDITORIA_TRAZABILIDAD_VANGUARD.md`, e incluyendo la directriz exacta para `System Instructions`.
  2. **Reingeniería Cromática, Morfológica y Temporal de Valari en `CombatView.tsx`:**
     - **Paleta 85% Ámbar Incandescente + 15% Acento de Riel Azul:** Se invirtió la proporción cromática para que el plasma principal sea blanco-oro y ámbar solar fundido (`#FFFBEB` → `#FDE047` → `#F59E0B` → `#EA580C`), dejando el azul cian (`#38BDF8`) únicamente como finos anillos magnéticos de compresión en la bocacha y micro-arcos de aceleración.
     - **Tiempos de Carga y Retroceso Perceptibles:**
       - `[B] Golpe Básico`: Carga rápida de `60ms`, culatazo corto (`-translate-x-3`) de `100ms` y recuperación ágil en `240ms`.
       - `[2] Conmoción`: Carga media de `155ms` (`-translate-x-2`), culatazo intermedio (`-translate-x-5 -rotate-[1.35deg]`) de `150ms` y recuperación en `360ms`.
       - `[1] Salva Pesada`: Carga larga y tensa de **`260ms`** donde el tirador se afirma lentamente hacia atrás (`duration-200 -translate-x-3 -rotate-[0.8deg]`) mientras la boca del cañón acumula un vórtice incandescente creciente; en `t = 260ms` libera el disparo con un **culatazo pesado de `-translate-x-8 -translate-y-1 -rotate-[2.4deg]`** y una recuperación lenta de `440ms`.
     - **Diferenciación Morfológica entre los 3 Disparos de Valari:**
       - `[B] Golpe Básico`: Aguja balística de plasma ámbar limpia y veloz con 2 anillos en bocacha e impacto direccional.
       - `[1] Salva Pesada`: Ráfaga perforante hiper-energizada con 3 ondas de choque Mach en `V` (conos supersónicos ámbar-fuego a lo largo del disparo recto), lluvia de escoria fundida y detonación térmica en estrella de 8 puntas al impactar.
       - `[2] Conmoción`: Tren de **pulsos anulares concéntricos de resonancia** unidos por una onda helicoidal ámbar-eléctrica que al golpear despliega un campo de supresión geométrico sobre el enemigo.
  3. **Escaneo RGBA de `hero-cb-skithid.png` (`209 × 300` px) y Creación de `SkithidCombatVfxCanvas`:**
     - La IA escaneó píxel por píxel el archivo `/public/assets/unidades/hero-cb-skithid.png` para extraer las curvas exactas de las dos guadañas verdes:
       - **Filo 1 (Hoja Frontal Cruzada):** Curva de 5 nodos desde `(0.632, 0.623)` hasta `(0.163, 0.713)`.
       - **Filo 2 (Hoja Lateral Derecha):** Curva de 5 nodos desde `(0.837, 0.673)` pasando por `(0.928, 0.777)` hasta la punta inferior en `(0.828, 0.883)`.
     - Diseñó desde cero el motor `SkithidCombatVfxCanvas` con las 4 habilidades pedidas por el usuario:
       - **`[B] Golpe Básico`:** Iluminación milimétrica del filo de la Hoja 1 durante la pre-carga → embestida del sprite → **corte diagonal único** verde ácido/lima atravesando al enemigo con destello quitinoso.
       - **`[1] Tajo Ácido`:** Iluminación simultánea de **ambos filos** con burbujeo corrosivo → embestida agresiva → **doble corte cruzado en `X`** sobre el enemigo con explosión de gotas de ácido corrosivo y vapores verdes que disuelven la armadura.
       - **`[2] Neurotoxina`:** Destello bio-eléctrico en los filos → **carga neurotóxica adherida directamente sobre el sprite enemigo**, formando anillos bio-eléctricos constrictores, arcos sinápticos y esporas paralizantes sobre su cuerpo.
       - **`[3] Regeneración`:** **Aura bio-lumínica orgánica** envolviendo al Comandante Skithid (curación de HP) combinada con **líneas horizontales esmeralda de alta velocidad** que escanean y desfasan horizontalmente su silueta (recuperación de Esquiva Sináptica).
- **Resultado y Archivos Referenciados:**
  - Creación de esta bitácora independiente y actualización integral de los efectos de combate de Valari y Skithid en la arena táctica.
  - **Archivos creados/modificados:** `/BITACORA_INTERCAMBIOS_VANGUARD.md`, `/public/BITACORA_INTERCAMBIOS_VANGUARD.md`, `/src/components/CombatView.tsx`, `/src/components/PersistentHeader.tsx`.

---

### Intercambio #8 — Eliminación de Google Workspace y del Botón Visible de Bitácora, Saneamiento de Errores y Creación del Sistema de Comentarios para Usuarios de Prueba
- **Fecha:** `2026-11-10`
- **Pedido del Usuario:**
  1. **Solucionar cualquier error activo en la aplicación** y explicar qué función cumplían los dos botones del encabezado (`Bitácora .MD` y `Workspace`) y si eran visibles para los usuarios de prueba.
  2. **Retirar Google Workspace del proyecto:** El usuario explicó que había incluido Workspace pensando que serviría para guardar sus propias cosas del proyecto, pero al ver que está orientado a que cada visitante conecte su propia cuenta de Google, pidió retirarlo por completo de la aplicación.
  3. **Ocultar el botón de `Bitácora .MD` en la interfaz web:** Indicó que la bitácora es exclusivamente para el desarrollo interno del proyecto y que, al tener acceso directo a los archivos del repositorio, no quiere que los usuarios de prueba vean ni descarguen ese archivo desde el encabezado.
  4. **Crear un botón destacado de `Comentarios` en el encabezado (`PersistentHeader.tsx`):** Reemplazar el espacio y resaltado visual que tenía `Workspace` por un botón mediante el cual los usuarios de prueba puedan dejar comentarios, sugerencias o reportes sobre el juego.
- **Autoría y Origen de la Idea:**
  - **100% decisión funcional, de privacidad de desarrollo y de experiencia de usuario del Usuario:** El usuario definió retirar la integración OAuth de Workspace, eliminar el acceso público a la bitácora en la barra superior para mantenerla como documento interno de ingeniería y transformar ese espacio destacado del header en un canal directo de feedback para testers.
- **Aporte de la IA (Apoyo Técnico, Desprovisionamiento OAuth y Diseño del Buzón Full-Stack de Comentarios):**
  1. **Saneamiento de Runtime y Desprovisionamiento de Google Workspace:**
     - Se revocaron los 18 permisos OAuth de Google Drive, Docs y Forms de la configuración del applet y se eliminaron los módulos `/src/components/GoogleWorkspaceModal.tsx`, `/src/services/workspaceAuth.ts` y `/src/services/workspaceDriveDocsForms.ts` (lo cual también eliminó la inicialización en caliente de Firebase Auth y cualquier desajuste de hooks tras recargas parciales).
     - Se verificó que la totalidad de los componentes en `src/components/` respeten estrictamente el orden incondicional de Hooks de React.
  2. **Ocultación del Botón de Bitácora en la UI conservando el Archivo Interno:**
     - Se eliminó el botón `Bitácora .MD` de `PersistentHeader.tsx` para que ningún usuario de prueba lo vea en la web, manteniendo intacta la actualización automática del archivo `/BITACORA_INTERCAMBIOS_VANGUARD.md` en la raíz del proyecto en cada turno.
  3. **Diseño desde Cero del Sistema de Comentarios para Usuarios de Prueba (`FeedbackModal.tsx` + `server.ts`):**
     - **Botón Resaltado `Comentarios` en el Header:** Ubicado en `PersistentHeader.tsx` con estética destacada en azul cian (`bg-sky-950/60 border-sky-400/50`) e ícono `MessageSquarePlus`.
     - **Modal Interactivo de Feedback (`FeedbackModal.tsx`):** Permite a cualquier usuario de prueba (sin necesidad de iniciar sesión ni aceptar permisos externos) registrar su nombre o alias, elegir la categoría (`Combate y Efectos`, `Balance y Economía`, `Interfaz / Usabilidad`, `Reporte de Error` o `Idea / Sugerencia`), calificar de 1 a 5 estrellas y escribir su comentario, adjuntando automáticamente qué facción, nivel de héroe y sector estaba probando.
     - **Persistencia en Servidor y en Archivos del Proyecto (`server.ts`):** Se implementó un servidor Express + Vite en `server.ts` con los endpoints `GET /api/feedback`, `POST /api/feedback` y `DELETE /api/feedback/:id` que guarda cada comentario recibido tanto en `/COMENTARIOS_USUARIOS_VANGUARD.json` como en un documento Markdown legible `/COMENTARIOS_USUARIOS_VANGUARD.md` dentro de los archivos del proyecto (con respaldo automático en `localStorage` del navegador).
- **Resultado y Archivos Referenciados:**
  - Interfaz limpia para usuarios de prueba sin botones internos de desarrollo ni popups de Google Workspace, y nuevo sistema de comentarios activo en el header y sincronizado con los archivos del proyecto.
  - **Archivos eliminados:** `/src/components/GoogleWorkspaceModal.tsx`, `/src/services/workspaceAuth.ts`, `/src/services/workspaceDriveDocsForms.ts`.
  - **Archivos creados/modificados:** `/server.ts`, `/src/components/FeedbackModal.tsx`, `/src/components/PersistentHeader.tsx`, `/src/components/MainLayout.tsx`, `/package.json`, `/tsconfig.json`, `/BITACORA_INTERCAMBIOS_VANGUARD.md`, `/public/BITACORA_INTERCAMBIOS_VANGUARD.md`.

---

### Entrada #9 — Corrección de Efectos de Combate Skithid (Glow Progresivo de Hojas, Escala 2x de Cortes, Tinte/Marca Persistente de Neurotoxina, Regeneración sin Halo y Sincronización con Velocidad / Auto IA)
1. **ID, Fecha y Área:** `Entrada #9` · `2026-11-10` · Área: Combate Táctico y Efectos Visuales (`Skithid` / Sincronización de Velocidad y `AUTO IA`).
2. **Intención del Usuario:**
   - Reemplazar los trazos vectoriales desalineados de carga de las hojas del Skithid por un efecto de resplandor más lento y progresivo alineado a las armas reales: *"mi idea como estaba en mi mente era algo mas como un efecto de glow, un poco mas progresivo y no instantaneo"*.
   - Duplicar el tamaño de los cortes sobre los enemigos y dejar un efecto/marca o tinte verde persistente durante la duración de Neurotoxina: *"tal vez el doble del tamaño en los cortes y en el caso de neurotoxina me referia a mas en dejar un dot visible en el sprite enemigo por lo que dure ese efecto, tal vez hasta teñir de verde no en exageracion el sprite afectado o dejarle minimamente una marca"*.
   - Retirar el halo circular de Regeneración dejando únicamente las líneas horizontales acompañadas de un movimiento horizontal milimétrico y desvanecimiento en el lugar: *"preferiria que no tuviera el halo circular que se le agrego y solo queden las lineas y agregar un movimiento casi en el lugar del sprite acompañando las lineas [...] como un desvanecimiento y movimiento en el lugar como horizontal de va y viene pero milimetros"*.
   - Corregir los fallos visuales al cambiar la velocidad de combate (`x1`/`x2`/`x3`) o activar el modo automático (`AUTO IA`).
3. **Idea o Propuesta Aportada por la IA:**
   - Extracción de máscaras de píxeles RGBA directamente desde `hero-cb-skithid.png` (`getSkithidBladeMasks`) para iluminar la silueta exacta de la hoja frontal y lateral con triple pase de desenfoque (`blur`) y recorte progresivo desde la empuñadura hacia la punta, eliminando los trazos vectoriales `SKITHID_FRONT_BLADE_CURVE`.
   - Corrección del disparador de turno (`hasTriggeredPlayerTurnVfxRef`) que provocaba que al limpiarse `hitTargetId` a mitad del turno (`460ms`) se disparara por error la animación de `skill_3` (`Regeneración`) interrumpiendo los ataques, además de escalar las duraciones según `combatSpeed`.
4. **Aceptación, Cambios o Rechazos del Usuario:**
   - El usuario rechazó en las capturas previas (`image_fd063479.png` e `image_3de7a1a3.png`) el trazo tipo pluma vectorial sobre la hoja frontal, la rapidez excesiva de la carga, el tamaño pequeño de los cortes en enemigos, la ausencia de marca persistente en Neurotoxina y el halo circular de Regeneración.
5. **Resultado y Estado:** `Implementado y verificado en compilación`.
6. **Archivos Afectados:**
   - `src/components/CombatView.tsx`: Extracción de máscaras de píxeles reales para el glow progresivo de hojas Skithid, duplicación de `slashRadius` en cortes enemigos, eliminación del halo circular en `skill_3`, estela/vaivén horizontal en Regeneración, tinte verde y marca persistente de Neurotoxina sobre enemigos afectados, y bloqueo de re-disparo erróneo a mitad de turno en `x1`/`x2`/`x3` y `AUTO IA`.
   - `src/index.css`: Adición de las animaciones `skithidSynapticEvade` (vaivén horizontal milimétrico con desvanecimiento) y `neurotoxinMarkPulse`.
   - `src/types/game.ts`: Adición del campo opcional `neurotoxinTurns` en `CombatSquadUnit`.
   - `src/context/GameContext.tsx`: Asignación y decremento por turno de `neurotoxinTurns` al aplicar Neurotoxina con Skithid.
7. **Fuente de Atribución:** Mensaje directo del usuario del `2026-11-10` acompañado de las capturas `image_fd063479.png`, `image_3de7a1a3.png` y el video `20261111-0722-48.1067751_86ecd7ec.mp4`.

---

### Entrada #10 — Legibilidad del Nivel del Héroe con Color de Facción y Renombrado a `XP de Desarrollo` en Barra Lateral
1. **ID, Fecha y Área:** `Entrada #10` · `2026-11-10` · Área: Interfaz de Usuario (`MainLayout` / Tarjeta de Perfil y Barras de Progresión).
2. **Intención del Usuario:**
   - Mejorar la legibilidad del indicador de nivel del comandante aplicando el color de la facción activa y suprimiendo la palabra redundante `"Héroe"`: *"el nivel del heroe como vez acá esta poco legible, pásalo a color de la facción seleccionada, a fin de que se pueda leer y quita el titulo de héroe, se sobreentiende"*.
   - Cambiar la etiqueta `"Rango Operativo"` por `"XP Operativa"` o `"XP de Desarrollo"`, dejando asentado revisar a futuro su explicación en el tutorial y su uso mecánico en la base: *"ponele XP Operativa o XP de Desarrollo. dejo a criterio este aspecto para considerar que es mas descriptivo [...] y para futura revision, no ahora, para que se expliquen en el tutorial que signfica la XP de desarrollo"*.
3. **Idea o Propuesta Aportada por la IA:**
   - Selección de la opción `"XP de Desarrollo · Nv. {professionLevel}"` (propuesta dentro de las dos alternativas dadas por el usuario) por describir de forma directa el vínculo con instalaciones/tecnologías y evitar el salto de línea en la tarjeta lateral.
4. **Aceptación, Cambios o Rechazos del Usuario:**
   - El usuario corrigió la baja legibilidad y redundancia de `"Héroe Nv. 1"` y el nombre poco claro de `"Rango Operativo"` mostrados en su captura adjunta.
5. **Resultado y Estado:** `Implementado y verificado en compilación` (queda registrada como **pendiente para futura revisión** la explicación de `XP de Desarrollo` en el tutorial y la revisión de su impacto mecánico en la base).
6. **Archivos Afectados:**
   - `src/components/MainLayout.tsx`: Eliminación del prefijo `"Héroe"`, aplicación de `theme.accentText` a `Nv. {characterLevel}` y cambio de etiqueta a `XP de Desarrollo · Nv. {professionLevel}`.
7. **Fuente de Atribución:** Mensaje directo del usuario del `2026-11-10` con captura de la tarjeta de perfil lateral.

---

### Entrada #11 — Nuevo Estándar de Registro de Bitácora en Ubicación Privada (Corrección a Entradas #1, #7 y #8 sobre `/public`)
1. **ID, Fecha y Área:** `Entrada #11` · `2026-11-10` · Área: Gobernanza del Proyecto, Trazabilidad y Privacidad de Documentación Interna.
2. **Intención del Usuario:**
   - Establecer un protocolo estricto de 7 puntos para `BITACORA_INTERCAMBIOS_VANGUARD.md`, prohibiendo reescribir entradas previas, prohibiendo atribuir ideas sin fuente explícita y ordenando mantener la bitácora únicamente en ubicación privada fuera de `/public`: *"Guarda el archivo en una ubicación privada, nunca en /public. Después de actualizarlo, verifica que la entrada quedó guardada y reporta su número"*.
3. **Idea o Propuesta Aportada por la IA:**
   - Ninguna en la definición de la regla (100% definida por el usuario); ejecución técnica de la limpieza de archivos públicos y actualización de `server.ts` para no replicar archivos `.md` en `/public`.
4. **Aceptación, Cambios o Rechazos del Usuario:**
   - **Corrección a Entradas #1, #7 y #8:** El usuario revocó la práctica previa de mantener copias espejo de los documentos `.md` dentro de `/public/`.
5. **Resultado y Estado:** `Implementado y verificado`.
6. **Archivos Afectados:**
   - `public/BITACORA_INTERCAMBIOS_VANGUARD.md`: Eliminado para que la bitácora nunca sea servida públicamente.
   - `public/AUDITORIA_TRAZABILIDAD_VANGUARD.md`: Eliminado de `/public` (se conserva únicamente `/AUDITORIA_TRAZABILIDAD_VANGUARD.md` en la raíz privada sin modificaciones).
   - `server.ts`: Eliminada la escritura espejo en `/public/COMENTARIOS_USUARIOS_VANGUARD.md`, manteniendo únicamente los archivos privados en la raíz del proyecto.
   - `BITACORA_INTERCAMBIOS_VANGUARD.md`: Adición de las Entradas `#9`, `#10` y `#11` al final del archivo.
7. **Fuente de Atribución:** Mensaje directo del usuario del `2026-11-10`.

---

### Entrada #12 — Diagnóstico Exacto en Forja, Auditoría de Encabezados de Instalaciones, Relleno Valari y Estadísticas en Héroe, Menú Lateral Colapsado, Recorrido Completo en Directivas/Hitos y Panel de Decisión Post-Incursión (3/3)
1. **ID, Fecha y Área:** `Entrada #12` · `2026-11-11` · Área: Instalaciones (`Forja`, `Reactor`, `Laboratorio`, `Almacén`), `Héroe y Equipamiento`, `Menú Lateral`, `Directivas e Hitos` y `Frente de Batalla`.
2. **Intención del Usuario:**
   - Aprobar el resultado final de los efectos del héroe Skithid: *"Los cambios en el heroe skid fueron perfectos, se consigio representar la idea que tenia en mente"*.
   - Corregir el diagnóstico de los botones deshabilitados en la Forja para distinguir ordenadamente entre nivel de instalación, reserva de MW, materiales brutos vs compuestos sintetizados y créditos: *"en este caso avisa que faltan materiales pero la realidad que lo que faltan son creditos [...] aclarar materiales insuficientes, si falta algo que se craftea la ayuda de sintetiza materiales en la forja y en el caso de creditos creditos insuficientes"*.
   - Auditar y simplificar los encabezados de las 4 instalaciones (quitando el supertítulo superior, resumiendo la descripción técnica y centrando verticalmente el icono con los botones derechos): *"Todos los titulos de instalaciones deben ser auditados para eliminar texto que no suma a la explicacion [...] "Sintetiza compuestos y evoluciona el equipamiento, dentro del limite del reactor" esto se aplica a todos los titulos [...] el icono de la instalacion que sale a la izquierda no parece estar centrado con respecto a los botones de la derecha"*.
   - Corregir el color interior de las tarjetas seleccionadas/hover en Héroe y Equipamiento para Valari, explicar el beneficio de cada estadística secundaria (`CRÍTICO`, `PRECISIÓN`, `SUERTE`, `INTEGRIDAD`, `ESTABILIDAD`) y dejar asentado en bitácora para evaluar mañana dividir `Héroe y Equipamiento` en 4 columnas o 2 pestañas: *"en valari el relleno de la seleccion cuando pasas por encima el mouse no cambia a un color dentro de la paleta de colores de la faccion [...] y dejemos asentado en la bitacora para ver mañana si dividimos mejor esta seccion en 4 columnas [...] o una segunda pestaña como en la forja"*.
   - Asegurar que al iniciar, reiniciar la partida o cambiar de facción el menú lateral vuelva a la Sala de Guerra con los submenús colapsados.
   - Ampliar `Directivas e Hitos` para cubrir todo el recorrido jugable de la prueba (nivel de héroe, mejora completa de equipamiento, sectores y planetas disponibles, avistamiento de todas las especies y élites raros en el archivo de hostiles, e hito final `"Fin del Recorrido de la Prueba"`).
   - Evitar que al completar la Oleada 3/3 el juego expulse automáticamente al jugador al Mando Central, mostrando un panel en la arena con tres opciones: repetir el sector actual, avanzar al siguiente sector o volver a la base.
3. **Idea o Propuesta Aportada por la IA:**
   - Implementación técnica de la prioridad de validación en `ForgeView.tsx` y `LaboratorioView.tsx` (`Nivel de Instalación -> Reserva MW -> Compuesto de Forja vs Material Bruto -> Créditos Insuficientes`).
   - Estructuración de 10 Directivas Operativas (`DIR-01` a `DIR-10`) y 10 Hitos de Prueba (`REC-01` a `REC-10`) conectados a `clearedPlanetIds`, `encounteredEnemyKeys`, `sumChassisLevels` y `characterLevel`, culminando en `REC-10 · Fin del Recorrido de la Prueba`.
   - Adición del estado de fase `'INCURSION_COMPLETE'` en el motor de turnos para presentar el modal táctico en la arena al finalizar la Oleada 3/3 sin forzar la salida al Hub.
4. **Aceptación, Cambios o Rechazos del Usuario:**
   - El usuario aprobó íntegramente los efectos de combate del héroe Skithid implementados en la Entrada #9 y solicitó estos 6 ajustes de cierre de jornada, posponiendo para la sesión de mañana la decisión sobre reestructurar `CommanderView` en 4 columnas o 2 pestañas.
5. **Resultado y Estado:** `Implementado y verificado` (queda registrado como **pendiente para revisión mañana** evaluar la división de `Héroe y Equipamiento` en 4 columnas con panel derecho de estadísticas detalladas o en 2 pestañas al estilo Forja).
6. **Archivos Afectados:**
   - `src/components/ForgeView.tsx`: Diagnóstico exacto de botones deshabilitados en Pestañas 1 y 2 (`Materiales Insuficientes`, `Materiales Insuficientes · Sintetiza en Forja`, `Créditos Insuficientes`), eliminación de supertítulo superior, descripción resumida y centrado vertical del icono en `FacilityHeader`.
   - `src/components/ReactorCentral.tsx`: Simplificación del encabezado del Reactor y centrado vertical del icono con los indicadores derechos.
   - `src/components/LaboratorioView.tsx`: Resumido de descripciones por facción y distinción entre `Materiales Insuficientes` y `Créditos Insuficientes`.
   - `src/components/StorageView.tsx`: Limpieza del supertítulo en el encabezado del Almacén.
   - `src/components/CommanderView.tsx`: Corrección del relleno interior ámbar (`bg-amber-950/40`) en tarjetas Valari al pasar el cursor o fijar pieza, y adición de explicaciones (`benefitHint`) para `CRÍTICO`, `PRECISIÓN`, `SUERTE`, `INTEGRIDAD` y `ESTABILIDAD`.
   - `src/data/factionIdentityCatalog.ts`: Resumido de `reactorSubtitle` en las 3 facciones y ampliación de `OPERATIONAL_DIRECTIVES_CATALOG` a 10 directivas de recorrido completo.
   - `src/types/game.ts`: Adición de `'INCURSION_COMPLETE'` en `CombatTurnPhase`.
   - `src/context/GameContext.tsx`: Seguimiento de `clearedPlanetIds`, transición a `'INCURSION_COMPLETE'` en Oleada 3/3, funciones `restartCurrentIncursion` y `advanceToNextPlanetIncursion`, reinicio a `'hub'` en `resetGameProgress`, y ampliación a 10 Directivas y 10 Hitos hasta `Fin del Recorrido de la Prueba`.
   - `src/components/MainLayout.tsx`: Submenús laterales (`isCitadelMenuOpen` e `isMapMenuOpen`) colapsados por defecto al iniciar, reiniciar o cambiar de facción, y conexión de acciones post-incursión con `CombatView`.
   - `src/components/CombatView.tsx`: Modal táctico al completar la Oleada 3/3 con resumen de botín y las 3 opciones (`Repetir Sector`, `Siguiente Sector`, `Volver a la Base`).
   - `BITACORA_INTERCAMBIOS_VANGUARD.md`: Registro de la Entrada `#12`.
7. **Fuente de Atribución:** Mensaje directo del usuario del `2026-11-11` acompañado de las capturas `image_186e7a97.png`, `image_fe3b892a.png`, `image_f41049fb.png` e `image_70d90308.png`.

---

### Entrada #13 — Optimización del Tamaño de Compilación para Publicación (< 250 MB)
1. **ID, Fecha y Área:** `Entrada #13` · `2026-11-11` · Área: Empaquetado de Producción, Activos Estáticos y Dependencias (`package.json`, `public/assets`, `dist`).
2. **Intención del Usuario:**
   - Reducir el peso de la compilación de producción por debajo del límite de publicación de 250 MB manteniendo intactas todas las funciones y el comportamiento del juego: *"Publishing failed because the app's production build is larger than the 250 MB limit. Reduce the size of the production build so that it is well under 250 MB [...] Keep all existing features and behavior of the app unchanged"*.
3. **Idea o Propuesta Aportada por la IA:**
   - Diagnóstico del origen del exceso de peso:
     1. El directorio `/public/assets/aistudio/` contenía `80 MB` de videos `.mp4` y capturas adjuntadas en el chat que no formaban parte del juego y se duplicaban dentro de `/dist/assets/aistudio/` (`160 MB` combinados).
     2. Los fondos `.jpg` de sectores y galaxia (`public/assets/backgrounds/sectors/*.jpg` y `galaxy-vanguard-16x9.jpg`) estaban codificados internamente como PNG sin comprimir (`~20 MB`), reduciéndose a `~3 MB` al recodificarlos como JPEG reales de alta calidad (`85%`) sin tocar ningún sprite de unidad ni coordenadas de máscara.
     3. Eliminación de 6 dependencias no utilizadas en `package.json` (`firebase`, `@google/genai`, `motion`, `dotenv`, `autoprefixer`, `esbuild`), podando `175` paquetes de `node_modules` (`~200 MB` menos).
4. **Aceptación, Cambios o Rechazos del Usuario:**
   - Solicitud directa de optimización para desbloquear la publicación de la aplicación.
5. **Resultado y Estado:** `Implementado y verificado en compilación`.
6. **Archivos Afectados:**
   - `public/assets/aistudio/`: Directorio eliminado (`-80 MB` en `public/` y `-80 MB` en `dist/`).
   - `public/assets/backgrounds/sectors/*.jpg`, `public/assets/backgrounds/galaxy-vanguard-16x9.jpg`, `public/assets/arenas/*.jpg`: Optimización a formato JPEG real (`85%` calidad) conservando dimensiones y rutas exactas (`public/assets` reducido de `148 MB` a `48 MB`).
   - `package.json`: Eliminación de dependencias sin uso (`firebase`, `@google/genai`, `motion`, `dotenv`, `autoprefixer`, `esbuild`).
   - `BITACORA_INTERCAMBIOS_VANGUARD.md`: Registro de la Entrada `#13`.
7. **Fuente de Atribución:** Solicitud de publicación del usuario del `2026-11-11`.

---

### Entrada #14 — Corrección de Reinicio de Hostiles, Unificación Global de Cabeceras, Reencuadre de Héroe/Planetas y Análisis de Menú Lateral
1. **ID, Fecha y Área:** `Entrada #14` · `2026-11-11` · Área: Persistencia de Progreso (`GameContext`), Jerarquía Visual de Cabeceras (`ForgeView`, `ReactorCentral`, `CommandHubView`, `DirectivesView`, `BestiarioView`, `CommanderView`), Retratos en Sala de Guerra y Arquitectura del Menú Lateral.
2. **Intención del Usuario:**
   - Corregir el fallo por el cual al pulsar `Reiniciar` seguían apareciendo enemigos marcados como `"Identificado en Combate"` en el Archivo de Hostiles: *"Revisar, porque a pesar de reiniciar el progreso, que aclaro debería borrar todo progreso como si nunca hubiéramos jugado, pero veo que a pesar de eso me marca que identifique enemigos, dejo captura."*
   - Unificar la jerarquía visual y las dimensiones de botones/píldoras en todas las cabeceras de pantalla e instalaciones: *"Revisar que se repete el cambio en los headers paso captura y necesito que el componente cumpla las mismas características en cada pantalla [...] ejemplo, si el botón de mejora de silo tiene determinadas dimensiones, respetar un mismo estilo y diseño para que sea fácil para los usuarios entender que no es un botón diferente es lo mismo pero en su sección."*
   - Analizar y presentar opciones sobre por qué `Frente de Batalla` y `Mapa Estelar` están separados en el menú lateral: *"tengo la necesidad de entender el motivo por el cual tenemos Frente de Batalla y mapa estelar y su sub menu separados, me explico, si bien es util ir a combatir directo, el jugador nunca selecciono don desplegar, necesito opciones y comentarios sobre si relamente esta bien estructurado el menu en ese sentido."*
   - Mejorar el encuadre del retrato del Héroe en `Sala de Guerra` sin generar nuevas imágenes por IA (facilitando medidas en px por si el usuario desea crear un retrato dedicado) y mejorar la nitidez/contraste de las vistas de planetas: *"el tamaño del encuadro del Heroe y su ilustracion, no permiten ver sus detalles, analizar de encuadrar mejor la ilustracion original, a fin de evitar generar mas contenido por IA o en todo caso tomo las medidas en px y genero un retrato acorde. Por le lado de la vista de los planetas, hay forma de mejorar la calidad de como se ven los planetas"*.
3. **Idea o Propuesta Aportada por la IA:**
   - **Causa raíz del bug de hostiles identificados tras reiniciar:** `GameContext.tsx` pregenera la `enemySquad` de la Oleada 1 en cuanto el jugador elige facción (estando todavía en `activeTab === 'hub'`). El `useEffect` que registra `encounteredEnemyKeys` solo comprobaba `if (isSelectingFaction) return;`, por lo que marcaba inmediatamente como avistados a los 1–3 enemigos de esa primera oleada antes de entrar a combatir. Se corrigió añadiendo `if (isSelectingFaction || activeTab !== 'combate') return;` y limpiando también nombre, auto-combate y bitácora en `resetGameProgress`.
   - **Estandarización de cabeceras y botones de mejora:** Se definió un estándar único para todas las pantallas e instalaciones: bloque izquierdo con icono `w-12 h-12 rounded-xl`, fila de título (`h1` + insignia de nivel/techo en línea, sin supertítulos arriba) y descripción breve de 1 línea debajo; bloque derecho con píldoras de coste/telemetría de `min-h-[42px] px-3.5 py-2 rounded-xl` y botones principales de acción/mejora de `min-h-[42px] min-w-[186px] px-4 py-2 rounded-xl`. Además, el botón de mejora del Reactor (`Ampliar a Nv.X`) y sus costes se integraron directamente en la cabecera derecha de `ReactorCentral.tsx` igual que en Forja, Laboratorio y Silo.
   - **Reencuadre de Héroe y nitidez de Planetas:** En `CommandHubView.tsx` se amplió el marco del retrato a `w-28 h-32 sm:w-32 sm:h-36` y se aplicó un encuadre de busto/cabeza y hombros (`scale-[1.78]` / `scale-[1.85]` / `scale-[1.75]` con `origin-[50%_10%]`) sobre la ilustración original `941×1672` para apreciar el rostro y armadura superior sin generar nuevos activos por IA. En las tarjetas de planetas de `CommandHubView.tsx` y `BestiarioView.tsx` se eliminó la desaturación (`saturate-[0.88]`) y se aplicó `contrast-[1.08] saturate-[1.08]` para realzar nitidez. Se documentaron las medidas recomendadas en píxeles (`600×720 px` para retratos y `800×360 px` o `1024×450 px` para banners planetarios).
   - **Opciones arquitectónicas para el menú lateral (`Mapa Estelar` vs `Frente de Batalla`):** Se elaboraron 3 alternativas claras (Opción A recomendada: fusionar el despliegue dentro de `Operaciones Orbitales / Mapa Estelar` o situar `Mapa Estelar` antes de `Frente de Batalla`; Opción B: invertir el orden en el menú para que `Mapa Estelar` anteceda a `Frente de Batalla`; Opción C: mantener el acceso directo pero renombrándolo dinámicamente con el planeta activo).
4. **Aceptación, Cambios o Rechazos del Usuario:**
   - Cambios de código implementados directamente según el pedido del usuario; las opciones sobre la estructura del menú lateral y las medidas en píxeles para activos propios quedan presentadas para decisión del usuario.
5. **Resultado y Estado:** `Implementado y verificado` (a la espera de que el usuario elija cuál de las opciones de menú lateral prefiere aplicar).
6. **Archivos Afectados:**
   - `src/context/GameContext.tsx`: Restricción de registro de `encounteredEnemyKeys` exclusivamente a `activeTab === 'combate'` y limpieza integral en `resetGameProgress`.
   - `src/components/ForgeView.tsx`: Estandarización de dimensiones en `FacilityHeader` (`min-h-[42px]` en píldoras de coste y `min-h-[42px] min-w-[186px]` en botón de mejora).
   - `src/components/ReactorCentral.tsx`: Unificación de la cabecera del Reactor con `FacilityHeader`, integrando en la derecha las píldoras de coste y el botón `Ampliar a Nv.X` con las mismas dimensiones que Silo, Forja y Laboratorio.
   - `src/components/CommandHubView.tsx`: Unificación de cabecera de `Sala de Guerra`, reencuadre cercano de busto para el retrato del Héroe y mejora de contraste en el banner planetario.
   - `src/components/DirectivesView.tsx`: Unificación de cabecera de `Directivas e Hitos` (eliminación de supertítulo superior y estandarización de píldoras derechas).
   - `src/components/BestiarioView.tsx`: Unificación de cabeceras principal y de detalle de planeta, y mejora de contraste en las imágenes de planetas.
   - `src/components/CommanderView.tsx`: Unificación de cabecera de `Héroe y Equipamiento` con icono `w-12 h-12`, insignia `Nv.` en línea y botón estandarizado `min-h-[42px] min-w-[186px]`.
   - `BITACORA_INTERCAMBIOS_VANGUARD.md`: Registro de la Entrada `#14`.
7. **Fuente de Atribución:** Mensaje directo del usuario del `2026-11-11` acompañado de 11 capturas de referencia.

---

### Entrada #15 — Ejecución de Opción A en Menú Lateral y Sistema Completo de Efectos de Combate del Héroe Cygnus
1. **ID, Fecha y Área:** `Entrada #15` · `2026-11-11` · Área: Arquitectura de Navegación Lateral (`MainLayout.tsx`) y Efectos Visuales de Combate del Héroe Cygnus (`CombatView.tsx`, `index.css`).
2. **Intención del Usuario:**
   - Aplicar la **Opción A** propuesta en la entrada anterior para el menú lateral: *"Ejecutemos la opcion A y tenes permitido generar, los efectos del heroe cygnus en combate."*
   - Diseñar e implementar los efectos de combate del héroe **Cygnus**:
     1. **Fase de Carga en Antebrazo (`LINEA DE CARGA DE ATAQUES`):** *"El diparo debe salir desde el brazo extendido, en este caso no buscamos un disparo de energia que supere el tamaño del brazo, me explico, si ves el brazo del heroe, tiene una linea que representa el cañon de esta sobre el antebrazo, es lo que deberiamos animar como con el heroe skid un brillo o glow, mostrando la fase de carga."*
     2. **`[B] Golpe Básico`:** *"Golpe basico, haz lineal fotónico de precision."*
     3. **`[1] Haz Fotónico` + Estado `Fijado`:** *"Se aclara que es un haz convergente, para no generar un haz gigantesco, opino que podemos generar dos puntos centrados en el guante del heroe y que convergan a la hora de terminar su recorrido. Aplica efecto fijado, por lo que el enemigo deberia quedar con una marca holografica ejemplificando que el heroe lo tiene en la mira. tecnologia Cygnus, propongo una mira no muy grande, dejo un ejemplo de forma y la guia respecto a la linea en el brazo que deberia brillar, pero dejo libertad para los efectos."*
     4. **`[2] Prisión de Fase`:** *"Propongo tener de referencia el efecto de regeneracion del skid donde utilizamos lineas horizontales y un movimiento minusculo para ejemplificar que el enemigo esta en un estado contenido por una fuerza mayor que impide su movimiento y digamos en vez de lineas horizontales verticales de arriba hacia abajo dando a entender que lo dejamos fijo en esa posision por mas que visualmente se mueva hacia los costados como mostrando su intento de resistir, se puede llegar a agregar un pequeño efecto de transparencia o descolor, para mostrar que es un estado alterado."*
     5. **`[3] Recarga`:** *"similar efecto al Valari, pero respetando la silueta del sprite del heroe, en este caso necesitamos ejemplificar que el escudo no necesariamente visible en el sprite, fue recompuesto, propongo generar un efecto de escudo hexagonal diminuto, que carga y da un pulso azul electrico desde la parte superior derecha del sprite, hasta la parte inferior izquierda"*.
3. **Idea o Propuesta Aportada por la IA:**
   - **Menú Lateral (Opción A):** Unificación del despliegue bajo el grupo desplegable `Mapa Estelar` con el orden lógico `1. Cartografía Galáctica -> 2. Frente de Batalla · [Planeta Activo] -> 3. Archivo de Hostiles`.
   - **Extracción de máscara de píxeles del antebrazo Cygnus (`getCygnusForearmMask`):** Escaneo directo del buffer RGBA de `hero-cb-cygnus.png` (`248×300 px`) aislando la línea azul del cañón del antebrazo (`X: 175..206`, `Y: 64..69`, centro `Y = 0.2217`) para iluminarla progresivamente de codo a muñeca con triple capa de glow antes de cada disparo.
   - **Implementación técnica de las 4 habilidades en `CygnusCombatVfxCanvas` y estados persistentes:**
     - `[B] Golpe Básico`: Haz lineal fotónico de precisión (`4.4px` halo exterior / `1.75px` núcleo blanco-celeste) saliendo recto desde la punta de la mano extendida (`X = 0.9839, Y = 0.2217`) sin superar jamás el grosor del antebrazo.
     - `[1] Haz Fotónico`: Dos nodos emisores simétricos en el guantelete (`X = 0.935, Y = 0.2217 ± 0.025`) que disparan dos haces finos convergentes hacia un único punto focal sobre el enemigo y dejan activa una **mira holográfica romboidal Cygnus** (`SVG` cian/violeta compacto) mientras dure el estado `FIJADO` (`illuminatedTurns > 0`).
     - `[2] Prisión de Fase`: Líneas verticales fotónicas descendiendo de arriba hacia abajo sobre el enemigo acompañadas de micro-vibración horizontal (`animate-cygnus-phase-resist`, `±2.5px`), ligera transparencia y desaturación (`opacity-72 saturate-[0.38]`) mientras dure la contención (`stunnedTurns > 0`).
     - `[3] Recarga`: Malla de hexágonos diminutos (`radio 5.6px`) recortada estrictamente a la silueta real de `hero-cb-cygnus.png` (`destination-in`), recorrida por un pulso diagonal azul eléctrico desde la esquina superior derecha (`Punto de partida`) hasta la esquina inferior izquierda (`Punto de fin`).
4. **Aceptación, Cambios o Rechazos del Usuario:**
   - El usuario aprobó y seleccionó la **Opción A** propuesta en la Entrada `#14` para estructurar el menú lateral y definió la dirección visual detallada de los 4 efectos del héroe Cygnus mediante sus bocetos guía.
5. **Resultado y Estado:** `Implementado y verificado`.
6. **Archivos Afectados:**
   - `src/components/MainLayout.tsx`: Implementación de la Opción A en el menú lateral (`Cartografía -> Frente de Batalla · [Planeta] -> Archivo de Hostiles`).
   - `src/components/CombatView.tsx`: Adición de `getCygnusForearmMask`, `CygnusCombatVfxCanvas`, `triggerCygnusActionVfx`, postura de disparo Cygnus, mira holográfica romboidal persistente (`FIJADO`) y líneas verticales + temblor horizontal de resistencia + transparencia en `Prisión de Fase`.
   - `src/index.css`: Adición de las animaciones `@keyframes cygnusPhaseResist` y `@keyframes cygnusTargetLockPulse`.
   - `BITACORA_INTERCAMBIOS_VANGUARD.md`: Registro de la Entrada `#15`.
7. **Fuente de Atribución:** Mensaje directo del usuario del `2026-11-11` acompañado de las capturas guía `image_09e0cf3f.png`, `image_668b3314.png`, `image_17851afa.png` e `image_1099a35c.png`.

---

### Entrada #16 — Ajuste de Posición de Mira Holográfica Cygnus, Trayectoria Horizontal y Origen en Antebrazo de Haz Fotónico, y Rediseño Ortogonal de Secuencia de Turnos (`64×64 px`) con Botín Anclado y Líneas de Gradiente de Facción
1. **ID, Fecha y Área:** `Entrada #16` · `2026-11-11` · Área: Efectos de Combate Cygnus y HUD Superior de Arena (`src/components/CombatView.tsx`).
2. **Intención del Usuario:**
   - Aprobar el resultado del efecto de `Recarga de Escudo [3]`, `Prisión de Fase [2]` y `Golpe Básico [B]` del héroe Cygnus: *"El resultado del efecto de recarga de escudo esta perfecto, sigue lo que tenia imaginado. En el caso del golpe básico, el efecto esta perfecto"*.
   - Corregir la posición vertical de la marca holográfica `FIJADO` sobre los enemigos tomando como punto de partida el extremo superior del sprite para que funcione correctamente tanto en unidades que levitan/vuelan (`Sonda Taquiónica`) como en unidades terrestres sin configurar sprite por sprite: *"la marca que se coloca sobre los enemigos debe ser pulida. Para ser exactos no su forma sino su posición, como se ve en la imagen, disponemos de unidades ligeras o medias que levitan o vuelan [...] si eso podría solucionarse tomando como punto de partida el extremo superior del sprite enemigo y desde ese punto darle unas coordenadas un poco mas abajo del mismo, con eso busco que tampoco configuremos sprite por sprite el efecto sino buscar un punto medio que sirva como base"*.
   - Mantener la trayectoria 100% horizontal en `Haz Fotónico [1]`, hacer que los dos puntos emisores surjan desde el centro del haz de carga del antebrazo separados verticalmente (y no desde la punta de los dedos) y destacar visualmente la habilidad por sobre el ataque básico: *"el Haz fotónico que consta de 2 líneas de efecto, se dirige hacia el punto de mira, perdiendo su trayectoria horizontal como pedí. Por otro lado los dos puntos deben surgir desde el mismo efecto de carga no desde la punta de los dedos del héroe, guiándote por el centro del haz de carga del antebrazo respetando que no estén centrados en el mismo punto, sino que separados de forma vertical, como están actualmente y aprovechar para destacar mas el efecto de esta habilidad por sobre el ataque básico."*
   - Rediseñar el módulo superior de `Secuencia de Turnos` y `Botín de Incursión`: agrandar las ranuras de retrato a `64×64 px` ocupando todo el espacio sin el borde interior sobrante, eliminar los bordes inclinados, anclar `Botín de Incursión` al borde inferior del contenedor de `Secuencia de Turnos` como extensión de la misma interfaz, añadir a ambos lados una sutil línea del color de la facción que termine en gradiente lineal antes de tocar las barras de salud, e informar la resolución exacta de los retratos: *"agrandar los espacios para que sean de 64x64px, la imagen debería ocupar todo el lugar sin ese borde extra que se ve en la imagen. También el botón de botín de incursión debería estar anclado al borde del contenedor de secuencia de turnos como una extensión de esta interfaz y sacar los bordes inclinados de estos elementos para mejorar como se visualizan y dime exactamente cual seria la resolución de las imágenes en ese lugar para poder producirlas de mi lado. Para agregar un detalle futurista entre secuencia de turnos y las barras de salud del jugador y de los enemigos, saliendo desde secuencia de turnos a ambos lados agregar una sutil línea del color de la facción que termine antes de tocar las barras de salud en un gradiente lineal."*
3. **Idea o Propuesta Aportada por la IA:**
   - **Anclaje superior de la marca `FIJADO` (`top-[25%] -translate-y-1/2`):** Al medir las cajas opacas de todos los PNG en `public/assets/unidades/`, las unidades flotantes como `Sonda Taquiónica` concentran sus píxeles opacos entre `1%` y `43%` desde el borde superior (centro en `22%`–`25%`). Anclar la mira holográfica al `25%` desde el extremo superior del sprite la ubica en pleno casco de unidades voladoras y en el torso superior de unidades terrestres, coincidiendo además con la cota horizontal del brazo del héroe (`22.17%`).
   - **Diferenciación visual y trayectoria horizontal de `Haz Fotónico [1]`:** Se fijó `CYGNUS_GAUNTLET_EMITTER_X_RATIO = 0.7685` (centro exacto de la franja de carga del antebrazo `0.706..0.831`) con separación vertical `±0.028` y `endY = startY` para preservar una trayectoria 100% horizontal. Para destacarlo frente a `Golpe Básico [B]`, se añadieron dos lentes emisores cian/índigo unidos por un puente armónico en el centro del antebrazo, una onda sinusoidal de interferencia cuántica trenzada entre los dos haces convergentes y 3 anillos elípticos de compresión fotónica a lo largo del recorrido horizontal.
   - **Especificación técnica de resolución para retratos de `Secuencia de Turnos`:** Ranura física en pantalla de **`64 × 64 px`** (relación `1:1`; resolución recomendada de producción **`64 × 64 px`** o **`128 × 128 px`** `@2x` para pantallas Retina/2K/4K).
4. **Aceptación, Cambios o Rechazos del Usuario:**
   - El usuario aprobó los efectos de `Recarga [3]`, `Prisión de Fase [2]` y `Golpe Básico [B]` de la Entrada `#15`, y solicitó estos ajustes sobre la posición de la marca `FIJADO`, la trayectoria/origen de `Haz Fotónico [1]` y el rediseño ortogonal de `Secuencia de Turnos` + `Botín de Incursión`.
5. **Resultado y Estado:** `Implementado y verificado`.
6. **Archivos Afectados:**
   - `src/components/CombatView.tsx`: Anclaje superior (`top-[25%]`) de la mira holográfica `FIJADO`, origen en el centro del haz de carga del antebrazo (`X = 0.7685`) y trayectoria horizontal (`endY = startY`) con interferencia cuántica y anillos focales en `Haz Fotónico [1]`, ranuras ortogonales de `64×64 px` (`w-16 h-16`) sin bordes internos sobrantes en `Secuencia de Turnos`, anclaje inferior integrado de `Botín de Incursión` y líneas laterales con gradiente lineal del color de facción.
   - `BITACORA_INTERCAMBIOS_VANGUARD.md`: Registro de la Entrada `#16`.
7. **Fuente de Atribución:** Mensaje directo del usuario del `2026-11-11` acompañado de las capturas `image_bfb7e0a2.png` e `image_1d53a94a.png`.

---

### Entrada #17 — Corrección de Error de Ejecución en `CanvasGradient.addColorStop` (`rgba(..., NaN)`) en Animaciones de Combate
1. **ID, Fecha y Área:** `Entrada #17` · `2026-11-11` · Área: Motor de Animación Canvas de Combate (`src/components/CombatView.tsx`).
2. **Intención del Usuario:**
   - Solucionar el error de ejecución reportado en consola al disparar efectos de combate: *"Fix the errors in the app: SyntaxError: Failed to execute 'addColorStop' on 'CanvasGradient': The value provided ('rgba(56, 189, 248, NaN)') could not be parsed as a color. at drawForearmCannonGlow"*.
3. **Idea o Propuesta Aportada por la IA:**
   - Diagnóstico de la causa raíz: En el primer fotograma de `requestAnimationFrame(cb)`, la marca de tiempo `now` suministrada por el navegador corresponde al inicio del ciclo de barrido vertical (vsync) y puede ser unos microsegundos menor que el `t0 = performance.now()` capturado dentro del `useEffect`. Eso producía un `elapsed = now - t0` levemente negativo, haciendo que `Math.sin(chargeP * Math.PI * 0.5)` fuera negativo y que `Math.pow(negativo, 1.35)` devolviera `NaN` en `drawForearmCannonGlow` y `drawProgressiveBladePixelGlow`.
   - Corrección aplicada: Se acotó `elapsed = Math.max(0, now - t0)` y `chargeP = Math.max(0, Math.min(1, ...))` en los 6 bucles `requestAnimationFrame` de `CombatView.tsx`, y se añadió validación `Number.isFinite(smoothGlow)` antes de construir cualquier `CanvasGradient`.
4. **Aceptación, Cambios o Rechazos del Usuario:**
   - Solicitud directa de corrección del error detectado en tiempo de ejecución.
5. **Resultado y Estado:** `Implementado y verificado en compilación`.
6. **Archivos Afectados:**
   - `src/components/CombatView.tsx`: Acotación de `elapsed >= 0`, `chargeP` en `[0, 1]` y protección contra `NaN` en `drawForearmCannonGlow`, `drawProgressiveBladePixelGlow` y todos los bucles `requestAnimationFrame`.
   - `BITACORA_INTERCAMBIOS_VANGUARD.md`: Registro de la Entrada `#17`.
7. **Fuente de Atribución:** Traza de error reportada por el usuario el `2026-11-11`.

---

### Entrada #18 — Separación de Archivos de Imagen (`128×128 px`) para la Secuencia de Turnos (`/public/assets/turnos/`) y para los Retratos de Héroe del Dashboard (`/public/assets/retratos-dashboard/`)
1. **ID, Fecha y Área:** `Entrada #18` · `2026-11-11` · Área: Activos Gráficos Independientes (`public/assets/turnos/`, `public/assets/retratos-dashboard/`), `Secuencia de Turnos` (`CombatView.tsx`, `GameContext.tsx`) y `Sala de Guerra` (`CommandHubView.tsx`, `factionIdentityCatalog.ts`).
2. **Intención del Usuario:**
   - Separar los archivos de imagen que se usan en la `Secuencia de Turnos` y en el retrato del héroe en el dashboard inicial (`Sala de Guerra`) respecto de los sprites de combate y de las ilustraciones de selección de facción, para que el usuario pueda reemplazarlos directamente por sus propias versiones de `128×128 px`: *"Cambia las imágenes de los turnos por versiones separadas de las que estas usando actualmente para que pueda usar mis propias imágenes de 128x128 y lo mismo para el retrato de los heroes en el dashboard del inicio así subo mi version."*
3. **Idea o Propuesta Aportada por la IA:**
   - Creación de dos directorios dedicados con archivos `128×128 px` independientes:
     1. `/public/assets/turnos/`: 32 archivos PNG de `128×128 px` (`hero-cb-valari.png`, `hero-cb-skithid.png`, `hero-cb-cygnus.png` y las 26 unidades enemigas) desacoplados de `/public/assets/unidades/`, eliminando el zoom/inversión por CSS (`scale-[1.32]` / `scale-x-[-1.36]`) en `CombatView.tsx` para que cualquier imagen `128×128 px` que suba el usuario se muestre `1:1` tal cual fue diseñada.
     2. `/public/assets/retratos-dashboard/`: 3 archivos PNG de `128×128 px` (`hero-dashboard-valari.png`, `hero-dashboard-skithid.png`, `hero-dashboard-cygnus.png`) desacoplados de `/public/assets/{valari,skithid,cygnus}.png`, ajustando el contenedor de `CommandHubView.tsx` a proporción cuadrada `1:1` (`128×128 px`) sin `scale` por CSS.
4. **Aceptación, Cambios o Rechazos del Usuario:**
   - Solicitud directa del usuario para poder subir sus propios activos de `128×128 px` sin afectar los sprites de combate de la arena ni la pantalla de selección de facción.
5. **Resultado y Estado:** `Implementado y verificado en compilación`.
6. **Archivos Afectados:**
   - `public/assets/turnos/*.png`: Creación de las 32 imágenes independientes de `128×128 px` para la `Secuencia de Turnos`.
   - `public/assets/retratos-dashboard/hero-dashboard-{valari,skithid,cygnus}.png`: Creación de los 3 retratos independientes de `128×128 px` para la `Sala de Guerra`.
   - `src/data/factionIdentityCatalog.ts`: Adición de `HERO_DASHBOARD_PORTRAITS_CATALOG`, actualización de `HERO_PORTRAITS_CATALOG` hacia `/assets/turnos/` y función `getTurnPortraitForSpriteUrl`.
   - `src/context/GameContext.tsx`: Asignación de `portraitUrl` mediante `getTurnPortraitForSpriteUrl` (`/assets/turnos/*.png`) en la generación de oleadas y en `turnQueue`.
   - `src/components/CombatView.tsx`: Renderizado `1:1` (`object-cover object-center`, sin `scale` ni `scale-x-[-1]`) de las imágenes de `/assets/turnos/` en las ranuras de `Secuencia de Turnos`.
   - `src/components/CommandHubView.tsx`: Uso de `HERO_DASHBOARD_PORTRAITS_CATALOG[factionId]` en contenedor `1:1` (`w-28 h-28 sm:w-32 sm:h-32`) sin zoom CSS.
   - `BITACORA_INTERCAMBIOS_VANGUARD.md`: Registro de la Entrada `#18`.
7. **Fuente de Atribución:** Mensaje directo del usuario del `2026-11-11`.

---

### Entrada #19 — Corrección a Entrada #18: Resolución `600×720 px` (`5:6`) para los Retratos de Héroes del Dashboard (`Sala de Guerra`)
1. **ID, Fecha y Área:** `Entrada #19` · `2026-11-11` · Área: Retratos de Héroe del Dashboard (`public/assets/retratos-dashboard/` y `src/components/CommandHubView.tsx`).
2. **Intención del Usuario:**
   - Aclarar que los retratos independientes de los héroes en el dashboard inicial (`Sala de Guerra`) deben mantenerse en la medida vertical **`600×720 px`** (mientras que los de la secuencia de turnos permanecen en `128×128 px`): *"Nono, la imagen de los heroes en el dashboar era la que correspondia, tendria que haberte dicho las medidas. ahi te paso 600x720"*.
3. **Idea o Propuesta Aportada por la IA:**
   - Regeneración de los 3 archivos independientes `/public/assets/retratos-dashboard/hero-dashboard-{valari,skithid,cygnus}.png` a **`600×720 px`** exactos (proporción `5:6`) a partir de las ilustraciones originales de facción y ajuste del marco en `CommandHubView.tsx` a proporción `5:6` (`w-28 h-[134px] sm:w-32 sm:h-[154px] aspect-[5/6]`) sin escalado CSS para que el usuario pueda reemplazarlos directamente por sus versiones de `600×720 px`.
4. **Aceptación, Cambios o Rechazos del Usuario:**
   - **Corrección parcial a la Entrada #18:** El usuario corrigió la dimensión aplicada a los retratos del dashboard (`600×720 px` en lugar de `128×128 px`), manteniendo `128×128 px` para las imágenes de los turnos (`/public/assets/turnos/`).
5. **Resultado y Estado:** `Implementado y verificado en compilación`.
6. **Archivos Afectados:**
   - `public/assets/retratos-dashboard/hero-dashboard-{valari,skithid,cygnus}.png`: Regenerados a **`600×720 px`** (`5:6`).
   - `src/components/CommandHubView.tsx`: Restauración de la proporción vertical `5:6` (`w-28 h-[134px] sm:w-32 sm:h-[154px] aspect-[5/6]`) para alojar las imágenes de `600×720 px` sin recorte ni zoom CSS.
   - `src/data/factionIdentityCatalog.ts`: Actualización del comentario técnico de `HERO_DASHBOARD_PORTRAITS_CATALOG` (`600×720 px`).
   - `BITACORA_INTERCAMBIOS_VANGUARD.md`: Registro de la Entrada `#19` con referencia a la Entrada `#18`.
7. **Fuente de Atribución:** Mensaje directo del usuario del `2026-11-11`.

---

### Entrada #20 — Conversión a Formato `.jpg` de las Imágenes de Turnos (`128×128 px`) y de los Retratos de Héroes del Dashboard (`600×720 px`) (Complemento a Entradas #18 y #19)
1. **ID, Fecha y Área:** `Entrada #20` · `2026-11-11` · Área: Formato de Activos Gráficos (`public/assets/turnos/*.jpg`, `public/assets/retratos-dashboard/*.jpg`, `src/data/factionIdentityCatalog.ts`, `src/components/CommandHubView.tsx` y `src/components/CombatView.tsx`).
2. **Intención del Usuario:**
   - Especificar que las imágenes que subirá para los turnos y para los retratos de héroe en el dashboard están en formato `.jpg`: *"y las imagenes son jpg"*.
3. **Idea o Propuesta Aportada por la IA:**
   - Conversión de los 32 archivos de `/public/assets/turnos/` (`128×128 px`) y de los 3 archivos de `/public/assets/retratos-dashboard/` (`600×720 px`) al formato `.jpg` (eliminando los `.png` duplicados en esas dos carpetas), actualización de las rutas en `factionIdentityCatalog.ts` a `.jpg` y adición de un `onError` de respaldo en `CommandHubView.tsx` y `CombatView.tsx` por si alguna imagen se sube en `.png`.
4. **Aceptación, Cambios o Rechazos del Usuario:**
   - Complemento y corrección de extensión de archivo sobre las Entradas `#18` y `#19`.
5. **Resultado y Estado:** `Implementado y verificado en compilación`.
6. **Archivos Afectados:**
   - `public/assets/turnos/*.jpg`: 32 archivos convertidos a `.jpg` (`128×128 px`).
   - `public/assets/retratos-dashboard/hero-dashboard-{valari,skithid,cygnus}.jpg`: 3 archivos convertidos a `.jpg` (`600×720 px`).
   - `src/data/factionIdentityCatalog.ts`: Actualización de `HERO_DASHBOARD_PORTRAITS_CATALOG`, `HERO_PORTRAITS_CATALOG` y `getTurnPortraitForSpriteUrl` a `.jpg`.
   - `src/components/CommandHubView.tsx` y `src/components/CombatView.tsx`: Rutas primarias `.jpg` con respaldo automático a `.png`.
   - `BITACORA_INTERCAMBIOS_VANGUARD.md`: Registro de la Entrada `#20`.
7. **Fuente de Atribución:** Mensaje directo del usuario del `2026-11-11`.

---

### Entrada #21 — Depuración de Duplicados de Héroe (`hero-cb-*.jpg`) en `/public/assets/turnos/` (Corrección sobre Entradas #18 y #20)
1. **ID, Fecha y Área:** `Entrada #21` · `2026-11-11` · Área: Organización de Activos Gráficos (`public/assets/turnos/` y `src/data/factionIdentityCatalog.ts`).
2. **Intención del Usuario:**
   - Eliminar los archivos duplicados de héroes con prefijo de combate (`hero-cb-valari.jpg`, `hero-cb-skithid.jpg`, `hero-cb-cygnus.jpg`) dentro de `/public/assets/turnos/` para dejar únicamente un archivo por héroe (`hero-valari.jpg`, `hero-skithid.jpg`, `hero-cygnus.jpg`) junto con los retratos de unidades enemigas de la cola de turnos: *"Tengo 2 tipos de datos aca en los turnos, en esta carpeta solo quiero retratos para la cola de turnos, no los de combate, organiza esto y en caso de que sean copias solo deja las que corresponda. Mira bien que en los heroes tengo 2 tipos de fotos no se porque."*
3. **Idea o Propuesta Aportada por la IA:**
   - Explicación del origen del duplicado (al convertir inicialmente todos los `.png` de `/public/assets/unidades/`, se habían copiado tanto los sprites `hero-*.png` como los sprites de combate `hero-cb-*.png`), eliminación de `hero-cb-valari.jpg`, `hero-cb-skithid.jpg` y `hero-cb-cygnus.jpg` de `/public/assets/turnos/`, y unificación de `HERO_PORTRAITS_CATALOG` y `getTurnPortraitForSpriteUrl` hacia `/assets/turnos/hero-{valari,skithid,cygnus}.jpg`.
4. **Aceptación, Cambios o Rechazos del Usuario:**
   - Corrección solicitada por el usuario con captura adjunta (`image_716ce9d3.png`).
5. **Resultado y Estado:** `Implementado y verificado en compilación`.
6. **Archivos Afectados:**
   - `public/assets/turnos/hero-cb-{valari,skithid,cygnus}.jpg`: Eliminados por ser copias duplicadas con nomenclatura de sprite de combate (`-cb-`). Quedan únicamente `hero-valari.jpg`, `hero-skithid.jpg` y `hero-cygnus.jpg` (más los 26 retratos de hostiles, totalizando 29 archivos únicos en `/public/assets/turnos/`).
   - `src/data/factionIdentityCatalog.ts`: Actualización de `HERO_PORTRAITS_CATALOG` y `getTurnPortraitForSpriteUrl` para apuntar a `/assets/turnos/hero-{valari,skithid,cygnus}.jpg`.
   - `BITACORA_INTERCAMBIOS_VANGUARD.md`: Registro de la Entrada `#21` con referencia a las Entradas `#18` y `#20`.
7. **Fuente de Atribución:** Mensaje directo del usuario y captura adjunta (`image_716ce9d3.png`) del `2026-11-11`.

---

### Entrada #22 — Rediseño Balístico Cinético de Tungsteno del Héroe Valari, Mapeo de Carga/Aceleración en el Rifle y Nuevo Efecto de `Sellar Placas`
1. **ID, Fecha y Área:** `Entrada #22` · `2026-11-11` · Área: Motor de Efectos Visuales de Combate Valari (`src/components/CombatView.tsx`).
2. **Intención del Usuario:**
   - Reemplazar los efectos anteriores del héroe Valari (que parecían disparos de energía/plasma) por proyectiles físicos cinéticos de tungsteno hiperdenso acelerados por cañón de riel: *"veo los disparos muy a efecto de energia y no a una bala de tugsteno o metal similar acelerada... Daño Cinético. No usan pólvora común; emplean aceleradores electromagnéticos (cañones de riel) que disparan metralla y tungsteno hiperdenso a velocidades relativistas para colapsar escudos enemigos por saturación física masiva."*
   - Mapear la línea recta iluminada del guardamanos del rifle para la fase de carga y aceleración: *"podes mapear el arma del heroe para generar un efecto de glow electico como de carga y aceleracion en la parte donde tiene un poco de luz. Fijate que es una linea recta como en el brazo del cygnus."*
   - Rediseñar `[3] Sellar Placas` siguiendo la técnica de recorte de silueta de Cygnus pero de arriba hacia el suelo, con otro patrón y en tonos blanco con ámbar sin auras externas: *"en el caso de sellar placas, me gusto mucho como quedo el cygnus con su efecto, pero te propongo que en este caso hagas el mismo efecto con un patron diferente desde la parte superior del heroe hasta el suelo, sin auras solo el efecto de que la armadura recobro blindaje, podria ser algo blanco con ambar, para que se entienda."*
3. **Idea o Propuesta Aportada por la IA:**
   - **Mapeo exacto de la línea del rifle (`getValariRifleRailMask`)**: Extracción de los píxeles exactos de la ranura iluminada del rifle en `hero-cb-valari.png` (`x: 154..178, y: 52..58`, `X = 0.5741..0.6556`, `Y = 0.1833`) con glow progresivo, micro-arcos eléctricos de carga y pulso de aceleración magnética hacia la bocacha.
   - **Proyectiles físicos de tungsteno y balística de cañón de riel (cero esferas de energía, cero ondas senoidales, cero azul)**:
     - Freno de boca con venteo lateral en V, chispas rectas de fricción metálica y eyección parabólica de casquillo/sabot giratorio.
     - `[B] Golpe Básico`: Dardo perforante APFSDS de tungsteno gris-acero oscuro con filo especular y punta incandescente por fricción hipersónica + cono Mach de aire comprimido.
     - `[1] Salva Pesada`: Proyectil sabot pesado acompañado por una ráfaga cerrada de 4 sub-proyectiles / metralla de tungsteno hiperdenso a velocidad relativista con ondas sónicas Mach y desprendimiento de fragmentos poligonales de blindaje (`armor spalling`).
     - `[2] Conmoción`: Posta cinética contundente de cabeza chata con frente parabólico de aire comprimido y grietas quebradas de fractura mecánica al impactar.
   - **`[3] Sellar Placas`**: Malla de placas balísticas imbricadas (ladrillos biselados en chevron) recortada estrictamente a la silueta real del sprite (`destination-in`, sin auras externas), descendiendo desde la parte superior del casco hasta el suelo en Blanco Incandescente (`#FFFFFF` / `#FFFBEB`) y Ámbar de Blindaje (`#FBBF24` / `#F59E0B`).
4. **Aceptación, Cambios o Rechazos del Usuario:**
   - Implementación directa de las especificaciones y la referencia visual del rifle enviadas por el usuario.
5. **Resultado y Estado:** `Implementado y verificado en compilación`.
6. **Archivos Afectados:**
   - `src/components/CombatView.tsx`: Implementación de `getValariRifleRailMask`, rediseño completo de `ValariBasicShotVfxCanvas` (`[B]`, `[1]`, `[2]` y `[3] Sellar Placas`) y actualización de `triggerValariShotVfx`.
   - `BITACORA_INTERCAMBIOS_VANGUARD.md`: Registro de la Entrada `#22`.
7. **Fuente de Atribución:** Dos mensajes directos del usuario y recorte de referencia del rifle (`image.png`) del `2026-11-11`.

---

### Entrada #23 — Auditoría Integral Pre-Publicación (Bugs, Fugas de Timers, Canvas 2D y Assets) y Creación del Registro Privado de Versiones (`REGISTRO_VERSIONES_VANGUARD.md`)
1. **ID, Fecha y Área:** `Entrada #23` · `2026-11-11` · Área: Auditoría de Código, Optimización de Rendimiento, Higiene de Assets y Control de Versiones (`src/components/CombatView.tsx`, `src/context/GameContext.tsx`, `src/components/CommandHubView.tsx`, `REGISTRO_VERSIONES_VANGUARD.md`).
2. **Intención del Usuario:**
   - Auditar todo el proyecto antes de publicar y enviar un commit a GitHub para corregir posibles bugs y aplicar optimizaciones: *"Audita antes de volver a publicar y mandar un commit a git hub, por posibles bugs, optimizaciones... Tenes que auditar todo para corregir posibles bugs y optimizaciones."*
   - Crear un archivo privado de versiones en la raíz del proyecto (nunca en `/public`) donde se registre cada cambio importante respecto al rendimiento y bugs corregidos: *"crea tambien un archivo con versiones que voy a ir solicitando que se aclare cada cambio importante respecto al rendimiento y bugs corregidos, para ir generando un archivo de actualizaciones. no lo dejes en public al archivo asi solo tengo acceso yo desde la raiz del proyecto."*
3. **Idea o Propuesta Aportada por la IA:**
   - **Auditoría y corrección de bugs y optimizaciones**:
     1. `src/components/CombatView.tsx`: Añadido `useEffect` de desmontaje para limpiar `valariTimersRef`, `skithidTimersRef` y `cygnusTimersRef` al salir del combate (`ESC` / `Salir`); acotamiento explícito `[0, 1]` de `mRatio` e `iRatio` y radios mínimos positivos (`Math.max(0.5, ...)`) en gradientes radiales, arcos y elipses de `ValariBasicShotVfxCanvas`; y guardia `dataset.fallbackApplied` en `onError` de los retratos de la cola de turnos.
     2. `src/context/GameContext.tsx`: Eliminación de la llamada duplicada a `buildWaveSquad` en el montaje inicial mediante `initialCombatWaveSquad` (garantizando que `enemySquad` y `turnOrderIds` partan del mismo escuadrón generado y evitando doble cómputo inicial); registro del timer de repliegue por derrota (`950ms`) dentro de `scheduleCombatTimer` para cancelación limpia; y vaciado inmediato de `floatingEvents` en `resetCombatEncounter`.
     3. `src/components/CommandHubView.tsx`: Guardia `dataset.fallbackApplied` en `onError` del retrato del héroe del dashboard.
     4. Higiene de `/public/assets`: Eliminación de la carpeta temporal `/public/assets/aistudio/` (capturas adjuntas del chat) para que no se incluyan archivos innecesarios en el build ni en el commit de GitHub, verificando que las 74 rutas estáticas en `src/` y los 29 retratos en `/public/assets/turnos/*.jpg` existen con 0 enlaces rotos (`49 MB` totales).
   - **Creación de `/REGISTRO_VERSIONES_VANGUARD.md`**: Archivo privado en la raíz del proyecto (fuera de `/public`) estructurado por versiones (`v0.1.0` a `v0.5.0`) detallando nuevas funciones, mejoras de rendimiento y bugs corregidos.
4. **Aceptación, Cambios o Rechazos del Usuario:**
   - Solicitud directa del usuario en sus dos últimos mensajes.
5. **Resultado y Estado:** `Implementado y verificado en compilación y linter`.
6. **Archivos Afectados:**
   - `src/components/CombatView.tsx`: Limpieza de timers en desmontaje, protección de radios/ratios en Canvas 2D de Valari y guardia en `onError` de retratos de turnos.
   - `src/context/GameContext.tsx`: Optimización del estado inicial de oleada sin doble ejecución de `buildWaveSquad`, limpieza de `floatingEvents` al reiniciar encuentro y uso de `scheduleCombatTimer` en repliegue por derrota.
   - `src/components/CommandHubView.tsx`: Guardia anti-bucle en `onError` del retrato del héroe.
   - `public/assets/aistudio/`: Directorio temporal eliminado para mantener limpio el repositorio antes del commit.
   - `REGISTRO_VERSIONES_VANGUARD.md`: Nuevo archivo privado en la raíz del proyecto con el historial de versiones, rendimiento y bugs corregidos.
   - `BITACORA_INTERCAMBIOS_VANGUARD.md`: Registro de la Entrada `#23`.
7. **Fuente de Atribución:** Dos mensajes directos del usuario del `2026-11-11`.
