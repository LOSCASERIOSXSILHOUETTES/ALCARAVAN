# ALCARAVAN — Sistema de Gestion Tributaria Municipal y Hacienda (GUIRIRI SGB V3)

Sistema integral de recaudacion municipal, administracion tributaria, padron de contribuyentes, licencias comerciales y emision automatizada de solvencias con codigo de seguridad QR. Desarrollado bajo la arquitectura **SGB Silhouettes V3 (0ms Latencia, Offline-First, LocalForage + Supabase Bi-Sync)** y adaptado estrictamente a la **Ley Organica de Coordinacion y Armonizacion de las Potestades Tributarias de los Estados y Municipios (LOCAT)**.

---

## Estructura de Rutas y Separacion de Interfaces

Para garantizar la privacidad institucional y facilitar la experiencia del usuario, el sistema divide la plataforma en dos entornos diferenciados:

1. **Portal del Contribuyente / Comercio (`index.html`):**
   - URL publica principal para compartir directamente a comerciantes y empresas.
   - Consulta instantanea por RIF o seleccion de comercio.
   - Semaforo fiscal de morosidad y descarga de Solvencia Municipal con QR si esta solvente.
   - Formulario de autoliquidacion de ingresos brutos mensual segun catalogo armonizado LOCAT.
   - Reporte de transferencias o pagos moviles a cuentas bancarias municipales.
   - Solicitud de censo comercial para nuevos establecimientos sin RUC.
   - Enlace discreto a "Acceso Funcionarios" en la barra superior.

2. **ERP de Hacienda Municipal (`admin.html`):**
   - Ruta especial interna para administradores, fiscales y personal de taquilla/tesoreria.
   - Pantalla de inicio de sesion seguro por usuario y clave de funcionario (`admin`, `cajero`).
   - Acceso a los 6 modulos completos de gestion tributaria, auditoria y conciliacion bancaria.

---

## Arquitectura y Stack Tecnologico

- **Frontend:** Single Page Application (SPA) pura con Vanilla JavaScript (ES6+), modularizada por dominios funcionales.
- **Estilos:** Tailwind CSS v2.2.19 (embebido localmente) y FontAwesome 6 Free.
- **Motor de Datos Local (0ms Latencia):** LocalForage con almacenamiento en IndexedDB (`HaciendaStore`).
- **Sincronizacion en la Nube (Opcional):** Supabase (PostgreSQL + Row Level Security + Realtime Multi-Dispositivo).
- **Extraccion de Extractos Bancarios:** PDF.js (Mozilla) con worker local para lectura de estados de cuenta bancarios en cliente.
- **Generacion de Documentos:** jsPDF + html2canvas para generacion e impresion de planillas, recibos y solvencias.
- **Alertas y Confirmaciones:** SweetAlert2 local.

---

## Hoja de Ruta (Roadmap) y Etapas de Construccion

El desarrollo de Alcaravan / Guiriri SGB V3 avanza de manera progresiva bajo las especificaciones funcionales de los 6 manuales tecnicos oficiales de Sistemas Tecnologicos Alcaravan S.A.:

### Etapa Actual: Etapa 1 — Registro, Identificacion Inmutable y Expediente Digital (Punto de Partida)
- **Identificador Maestro Inmutable (UUIDv4):**
  - Cada contribuyente y comercio se crea con un identificador unico inmutable (`crypto.randomUUID()`) generado en el momento del registro.
  - La arquitectura desacopla el expediente del RIF y de la Razon Social, garantizando que cambios de firma mercantil, correcciones tipograficas o traspasos no rompan enlaces ni huerfanen documentos.
- **Expediente Digital en la Nube (Google Apps Script + Google Drive):**
  - Cuenta de Google dedicada: `systemsatrimg` (`systemsatrimg@gmail.com`) para despliegue de Apps Script y almacenamiento de expedientes.
  - Almacenamiento institucional en cuenta de Google dedicada sin costo de servidores ni bases de datos de pago.
  - Generacion automatica de carpetas jerarquicas por UUID del contribuyente con subcarpetas tematicas:
    - `01_Expediente_Legal/` (Acta Constitutiva en PDF, RIF digitalizado, Poderes de Representacion).
    - `02_Inspeccion_Local/` (Las 4 fotos obligatorias del local: 2 frontales y 2 laterales segun Pagina 15 del Manual 1).
    - `03_Comprobantes_Pago/` (Vouchers y recibos de transferencias/pagos moviles).
    - `04_Solvencias_y_Licencias/` (Patentes comerciales y certificados de solvencia con QR).
- **Dimensionamiento de Capacidad (Caso de Estudio: San Jose de Guaribe):**
  - En municipios con padron de 200 a 450 comercios, el expediente completo inicial ronda 1,8 MB por comercio (con compresion Canvas en navegador).
  - Los 15 GB gratuitos de Google Drive rinden entre 8 y 10 anos de recaudacion continua sin saturar cuotas.
  - El limite de Google Apps Script (20.000 llamadas diarias) opera a menos del 0.3% de su capacidad.
- **Acceso Directo para la Administracion Tributaria:**
  - Vinculacion del enlace directo `drive_folder_url` en la ficha de cada contribuyente en `admin.html` para inspeccion en 1 clic.

### Proximas Etapas:
- **Etapa 2 — Autoliquidacion y Liquidacion de Actividades Economicas (Manuales 1 y 6):**
  - Monitoreo en tiempo real de tasas oficiales BCV (Dolar, Euro y Moneda de Mayor Valor TCMMV - Art. 30 LOCAT).
  - Comparativo automatico en vivo: max(Base * Alicuota, Minimo TCMMV en Bs.).
- **Etapa 3 — Gestion de Pagos, Caja y Conciliacion Smart Ledger V8 (Manual 1 - Pags 20 a 23):**
  - Consignacion de transferencias y conciliacion automatica contra extractos bancarios en PDF con pareo heuristico a 0ms.
- **Etapa 4 — Modulos Especiales: Inmuebles, Vehiculos y Tramites (Manuales 2, 3 y 4):**
  - Catastro municipal (derecho de frente), patentes de vehiculos (trimestres automotrices) y solicitudes de permisos.
- **Etapa 5 — Auditoria Fiscal y Emision de Solvencias Municipales QR (Manual 5):**
  - Bloqueo automatico por planillas pendientes y emision de solvencias unicas con verificacion QR.

---

## Modulos del ERP Interno (`admin.html`)

### 1. Padron de Contribuyentes (RUC)
- Registro y censo de personas naturales y juridicas del Municipio.
- Gestion de RIF, razon social, denominacion comercial, direccion fiscal, telefono, correo y representante legal.
- Carga de fotografia de fachada comercial mediante ImgBB con compresion Canvas en cliente y fallback local a 0ms.
- Busqueda reactiva instantanea y control de estado activo/inactivo.

### 2. Licencias y Patentes Comerciales (LOCAT)
- Catalogo oficial armonizado con alicuotas vigentes y minimos tributables expresados en Tipo de Cambio de la Moneda de Mayor Valor (**TCMMV / BCV**).
- Generacion de correlativos unicos por ano (`PAT-2026-0001`).
- Vinculacion de codigos de actividad economica por contribuyente para autoliquidacion mensual.

### 3. Autoliquidacion y Declaraciones Juradas Mensuales
- Calculo tributario automatico en tiempo real:
  - Impuesto por Alicuota = Base Imponible * Alicuota
  - Minimo Tributable en Bs. = Minimo TCMMV * Tasa BCV
  - Total Determinado a Pagar = max(Impuesto por Alicuota, Minimo Tributable Bs.)
- Generacion automatica de la planilla de autoliquidacion y cuenta por cobrar para entero en taquilla.

### 4. Taquilla de Recaudacion y Caja
- Entero y liquidacion de pagos: transferencias bancarias, punto de venta, biopago o efectivo.
- Emision de recibo oficial correlativo (`REC-2026-0001`).
- Auditoria visual de comprobantes bancarios adjuntos.
- HUD superior con metricas de recaudacion en vivo (Total Recaudado, Pagos Conciliados y Pendientes).

### 5. Conciliacion Bancaria y Smart Ledger V8
- Control diario y mensual de cuentas recaudadoras de la Hacienda Municipal.
- **Smart Ledger Bimembre:** Carga mensual rapida de extractos bancarios en PDF o texto plano:
  - Banco de Venezuela (BDV)
  - Banesco
  - BNC (Banco Nacional de Credito)
  - BBVA Provincial
  - Extractos Planos (TXT)
- **Pareo Heuristico a 0ms:** Algoritmo que cruza lineas de credito bancarias contra la tabla de pagos (`hacienda_pagos`) por monto exacto y referencia bancaria (tolerante a ceros a la izquierda y formatos C2P/Pago Movil).
- **Inyeccion Atomica:** Registro de dias de conciliacion, desgloses por movimiento, actualizacion automatica de pagos a `conciliado` y declaraciones a `pagada`.

### 6. Solvencias Municipales Automatizadas con QR
- **Auditoria de Deuda a 0ms:** Si el contribuyente tiene declaraciones juradas pendientes o impagas, el sistema bloquea automaticamente el tramite y despliega el desglose de la deuda.
- Emision de Solvencia Municipal con codigo QR de validacion oficial y vigencia reglamentaria de 30 dias.

---

## Puesta en Marcha

### 1. Ejecucion Local (Offline-First 100%)
No requiere configuracion de servidores ni dependencias externas:
1. Clonar el repositorio.
2. Para comerciantes: abrir `index.html`.
3. Para administradores y fiscales: abrir `admin.html` (credenciales: `admin` / `hacienda2026` o `cajero` / `caja2026`).
4. Todas las cuentas, catalogos y operaciones se persisten de inmediato en el navegador a traves de LocalForage a 0ms.

### 2. Sincronizacion con Supabase (Opcional)
Para sincronizar entre multiples dispositivos o usuarios concurrentes:
1. Crear un proyecto en Supabase.
2. Ejecutar el script `sql/schema_hacienda.sql` en el SQL Editor de Supabase.
3. Configurar las credenciales en `js/config.js`:
   ```javascript
   window.HACIENDA_CONFIG = {
       SUPABASE_URL: "https://tu-proyecto.supabase.co",
       SUPABASE_ANON_KEY: "tu-anon-key"
   };
   ```

---

## Bitacora de Decisiones y Cambios

### Version 3.10.8 — 22/11/2026
- **Selector Oficial de Banco Emisor (Origen) en Reporte de Pagos de Impuestos:**
  - **Reemplazo de Input de Texto Libre:** Se sustituyó el campo de texto libre `#pago-banco-origen` por un menú desplegable `<select>` pre-cargado con el catálogo oficial completo de la banca venezolana (SUDEBAN).
  - **Catálogo Nacional SUDEBAN Completo:** Incorporación de todos los bancos nacionales (Banco de Venezuela, Banesco, BNC, Mercantil, Provincial, Bancamiga, Banco del Tesoro, Bicentenario, BDT / BVC, BANFANB, Banplus, Banco Plaza, BFC, Bancaribe, Exterior, Caroní, 100% Banco, Activo, DelSur, Sofitasa, Bancrecer, Mi Banco, Bangente, N58 Banco Digital, etc.) con sus acrónimos y opción genérica.
  - **Validación Automatizada:** El contribuyente ya no tiene que tipear su banco manualmente, evitando discrepancias tipográficas en la conciliación bancaria y asegurando la selección del banco emisor al reportar la transferencia o pago móvil.

### Version 3.10.7 — 22/11/2026
- **Selector Interactivo de Actividades Económicas LOCAT (Modal con Buscador en Vivo y Tarjetas):**
  - **Sustitución del Dropdown Nativo:** Se reemplazó el tradicional selector desplegable `<select id="pat-locat-select">` (con más de 80 rubros económicos de la LOCAT) por un selector interactivo tipo modal (`SelectorActividadLocatModal`), homólogo al buscador de contribuyentes del padrón.
  - **Buscador en Tiempo Real:** Filtro instantáneo por código de actividad (ej. `COM-001`, `IND-002`, `RES-001`), nombre del ramo o palabras clave descriptivas.
  - **Filtro de Categorías por Pills:** Navegación segmentada por categorías armonizadas: Todas las Categorías, Comercio de Alimentos y Víveres, Ferretería y Bienes del Hogar, Restaurantes y Hospedaje, Licores y Diversión Nocturna, Servicios Técnicos y Personales, Salud, Educación y Asesoría, Industria, Agro y Construcción, Telecomunicaciones y Finanzas.
  - **Cuadrícula de Tarjetas y Paginación Dinámica:** Cards estructuradas con código oficial, categoría, denominación de la actividad, alícuota porcentual aplicable (%) y mínimo tributable en TCMMV, con paginación fluida a 0ms de latencia.
  - **Previsualización en Formulario:** Caja visual interactiva en el modal de otorgamiento de licencia que muestra la actividad seleccionada con opción de cambiar con un solo clic.

### Version 3.10.6 — 22/11/2026
- **Módulo Integral de Registro Vehicular (Patente sobre Vehículos y Transporte Terrestre) — Estándar Los Teques / SATGUAICA:**
  - **Inputs y Ficha Técnica Completa (Normativa INTT y Ordenanza Municipal):**
    - Incorporación de los mismos campos oficiales de la plataforma SATGUAICA (Los Teques / Guaicaipuro):
      1. **Placa / Matrícula:** Con validación alfanumérica sin espacios y auto-mayúsculas.
      2. **Tipo / Clase de Vehículo:** Automóvil, Camioneta/Pick-Up/SUV, Motocicleta, Minibús/Van, Autobús Colectivo, Camión 350, Camión 750, Gandola/Chuto, Volteo, Remolque/Batea, Maquinaria Especial.
      3. **Marca:** Selector con catálogo de marcas venezolanas (Chevrolet, Ford, Toyota, Fiat, Renault, Hyundai, Chery, Mitsubishi, Nissan, Jeep, Kia, Volkswagen, Honda, Mazda, Mack, Iveco, Bera, Empire Keeway, Motos Toro) e input dinámico para otras marcas.
      4. **Modelo:** Texto descriptivo (Silverado, Hilux, Aveo, Sbr, etc.).
      5. **Año de Fabricación:** Rango 1970 a 2026.
      6. **Color Oficial:** Blanco, Negro, Gris/Plata, Azul, Rojo, Verde, Beige/Arena, Dorado, Marrón, Amarillo, Naranja, Vinotinto, Multicolor.
      7. **Uso Oficial:** Particular/Privado, Carga Comercial/Reparto, Transporte Público, Transporte Escolar, Mototaxi, Institucional/Oficial.
      8. **Serial de Carrocería (NIV / VIN / Chasis):** Validación `serial-vehicle` alfanumérica en mayúsculas.
      9. **Serial de Motor:** Registro alfanumérico.
      10. **Capacidad de Puestos:** Número de pasajeros autorizados.
      11. **Capacidad de Carga (Ton):** Carga en toneladas con decimales.
      12. **Número de Ejes:** 2, 3, 4, 5+ ejes.
      13. **N° de Certificado de Registro / Título INTT:** Identificador del carnet de circulación.
  - **Portal del Contribuyente (`portal-comercio.js`):**
    - HUD con métricas de flota automotriz (Total Flota, Carga/Comercial, Particulares, Pasajeros).
    - Tarjetas vehiculares de diseño moderno con chapa automotriz venezolana, insignias por tipo y uso, ficha técnica con seriales y botones de acción (Editar y Desincorporar).
    - Modal espacioso `modal-nuevo-vehiculo` con soporte para creación y edición reactiva a 0ms.
  - **ERP Administrativo de Rentas (`comercial.js`):**
    - Conmutador de vistas en el módulo de Patentes (`PatentesModule`): Pestaña de **Actividades Económicas (LOCAT)** y Pestaña de **Patente sobre Vehículos**.
    - Buscador en vivo multi-criterio (por placa, RIF, razón social, marca o serial).
    - Modal de registro en ERP con asignación a cualquier contribuyente mediante `SelectorContribuyenteModal`.
  - **Esquema y Sincronización SGB:**
    - Actualizado `TABLE_SCHEMAS['hacienda_vehiculos']` en `js/core/store.js` y DDL en `sql/schema_hacienda.sql`.
    - Script SQL de `ALTER TABLE` generado para migración en consola Supabase.
    - Bump de Service Worker a `alcaravan-v3-cache-v3.10.6` con 355 pruebas automatizadas al 100% en verde.

### Version 3.10.5 — 22/11/2026
- **Normalización de Campos y Renderizado Completo de Tarjetas de Métodos de Pago en Portal del Contribuyente:**
  - **Mapeo de Propiedades SGB en Tarjetas de Pago:** Se corrigió la discrepancia de nombres de atributos entre el almacén relacional (`hacienda_metodos_pago`: `tipo`, `telefono`, `identificacion`, `titular`, `banco`) y el módulo de visualización del portal (`portal-comercio.js`), donde se consultaban propiedades desalineadas (`m.canal`, `m.telefono_pago_movil`, `m.documento_pago_movil`).
  - **Visualización Integral de Pago Móvil y Transferencias:** Ahora las tarjetas en la pestaña "Pagar" despliegan inmediatamente todos los datos requeridos por el contribuyente: Nombre de Entidad Bancaria, Teléfono con botón "Copiar Teléfono", RIF / Cédula con botón "Copiar RIF", Número de Cuenta de 20 dígitos con botón "Copiar Cuenta", Nombre del Titular y las Instrucciones adicionales ("Indicar RIF en descripción").
  - **Fallback Robusto de Portapapeles:** Se reforzó `copiarAlPortapapeles` con respaldo síncrono mediante `document.execCommand('copy')` para garantizar copia exitosa tanto en conexiones HTTPS como HTTP o navegadores móviles sin permisos de portapapeles.
  - **Sincronización Bidireccional en Selectores:** Sincronizados los atributos `data-canal` y `data-banco` en el selector de consignación de pagos y en el módulo de Taquilla del ERP.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.10.5` con 355 pruebas automatizadas al 100% en verde.

### Version 3.10.4 — 22/11/2026
- **Corrección de Visibilidad Universal y Despliegue de Opciones en Select de RIF (`index.html`):**
  - **Resolución de Conflicto de Modo Oscuro del Sistema:** Se identificó que en navegadores basados en Chromium con tema oscuro del sistema operativo, los menús desplegables nativos de `<select>` renderizaban las opciones con texto oscuro sobre fondo oscuro o fondos transparentes al carecer de `color-scheme: light` explícito.
  - **Reset Universal de `select` y `option`:** Incorporada regla forzada en `styles.css` e `index.html` garantizando que todo `<select>` y sus `<option>` y `<optgroup>` mantengan fondo blanco puro (`#FFFFFF`), texto de alto contraste (`#0F172A`) y tipografía negrita legible en cualquier sistema operativo.
  - **Estructuración del Selector de RIF (`pc-rif-tipo`):** Eliminado el `overflow-hidden` del contenedor padre que provocaba recortes en el popup, añadido contenedor relativo con chevron personalizado y estilos inline blindados en cada opción (`J`, `V`, `G`, `E`, `C`, `P`).
  - Bump de Service Worker a `alcaravan-v3-cache-v3.10.4` con 355 pruebas automatizadas al 100% en verde.

### Version 3.10.3 — 22/11/2026
- **Erradicación Total de Semillas y Cuentas Bancarias Mockeadas (Limpieza Definitiva para Producción):**
  - **Eliminación de Siembra Automática en `store.js`:** Suprimido de raíz el bloque que inyectaba por defecto las cuentas de prueba `cta_01` (0102-0544-21-0000012345) y `cta_02` (0134-0371-82-0000098765), así como los métodos de pago mockeados asociados (`met_pm_bdv`, `met_tr_bdv`, etc.).
  - **Rutina de Purga Inmediata en Memoria y LocalForage:** En la inicialización del almacén (`store.init()`), se agregó una rutina automática que detecta y borra permanentemente cualquier cuenta o método mockeado remanente en el navegador del usuario, persistiendo la tabla limpia en `LocalForage`.
  - **Blindaje en Módulos de Cuentas, Métodos de Pago, Taquilla y Portal:** Modificados `HaciendaCuentas.getAll()`, `MetodosPagoModule.getAll()`, `taquilla.js`, `conciliacion.js` y `portal-comercio.js` para filtrar activamente cualquier residuo de prueba, garantizando que el modal de Cuentas Bancarias y el Portal del Contribuyente muestren exclusivamente las cuentas oficiales creadas por el usuario en el ERP.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.10.3` con 355 pruebas automatizadas al 100% en verde.

### Version 3.10.2 — 22/11/2026
- **Módulo ERP de Métodos de Pago Afiliados a Cuentas Bancarias y Tarjetas Interactivas en Portal:**
  - **Nueva Sección ERP "Métodos de Pago" (`MetodosPagoModule` - `js/modules/caja/metodos-pago.js`):**
    - Sección administrativa dedicada bajo la suite de Caja (`data-perm="caja_ver"`), accesible desde el sidebar con botón `#nav-metodos_pago`.
    - Permite registrar y configurar los canales oficiales de cobro de la Alcaldía: **Pago Móvil C2P / P2P**, **Transferencia Bancaria**, **Punto de Venta / Débito**, **Efectivo en Taquilla (Bs.)** y **Divisas Taquilla (USD)**.
    - Cada método de cobro se afilia directamente a una cuenta bancaria recaudadora oficial (`cuenta_id` en `hacienda_cuentas`).
    - Para Pago Móvil: configuración de teléfono, RIF/Cédula y banco receptor permitido.
    - Para Transferencia: vinculación automática con el número de cuenta de 20 dígitos y titular.
    - Filtros por canal y cuenta, switch reactivo de activación/desactivación y validación de borrado seguro (impide eliminar canales que tengan pagos registrados).
  - **Tarjetas Dinámicas e Interactivas de Pago en el Portal del Contribuyente (`portal-comercio.js`):**
    - La pestaña "Pagar" ahora lee en vivo a 0ms los métodos de pago activos de la Alcaldía (`hacienda_metodos_pago`), sustituyendo las tarjetas fijas/mockeadas.
    - Tarjetas estilo Apple con insignias por canal y botones de un solo toque: "Copiar Teléfono", "Copiar RIF", "Copiar Número de Cuenta".
    - El formulario de consignación de pagos incorpora el selector de método de pago empleado, auto-seleccionando y vinculando la cuenta receptora de la Alcaldía.
    - El registro de pago (`hacienda_pagos`) almacena ahora `metodo_pago_id` y `cuenta_id`.
  - **Caja de Taquilla y Conciliación Bancaria Refinada:**
    - En taquilla municipal (`taquilla.js`), el formulario modal permite elegir el canal oficial, auto-completando la modalidad y la cuenta destino.
    - En el motor de conciliación y pareo inteligente (`smart-ledger.js`), el auto-pareo con `hacienda_pagos` valida la correspondencia de `cuenta_id`, impidiendo cruces accidentales entre extractos de cuentas distintas.
  - **Ciclo Inquebrantable de Datos a 0ms (18 Tablas):**
    - Registro de la 18va tabla `hacienda_metodos_pago` y nuevas columnas `cuenta_id` y `metodo_pago_id` en `hacienda_pagos`.
    - Registro en `store.js` (`TABLES`, `TABLE_SCHEMAS`, `PUBLIC_PORTAL_TABLES`) y `realtime-sync.js` (`SYNCABLE_TABLES`, `PUBLIC_PORTAL_TABLES`).
    - Script DDL completo en `sql/schema_hacienda.sql`.
    - Bump de Service Worker a `alcaravan-v3-cache-v3.10.2` con 355 pruebas automatizadas al 100% en verde.

### Version 3.10.1 — 22/11/2026
- **Ampliación Integral del Catálogo SUDEBAN y Detección Automática Inteligente de Cuentas:**
  - **Catálogo Completo de 28 Entidades Bancarias Nacionales:** Inclusión de todos los bancos universales, públicos, privados y microfinancieros de Venezuela: BANFANB (`0177`), Banco Agrícola de Venezuela (`0166`), Banco Venezolano de Crédito / BDT (`0104`), BFC Banco Fondo Común (`0151`), Banco Caroní (`0128`), Banco Activo (`0171`), DelSur (`0157`), Banco Sofitasa (`0137`), Bancrecer (`0168`), Mi Banco (`0169`), Bangente (`0146`), N58 Banco Digital (`0178`), Instituto Municipal de Crédito Popular IMCP (`0601`), BID (`0173`) y BOD (`0116`).
  - **Soporte de "Otro Banco / Entidad Personalizada":** Opción abierta con input dinámico para registrar cualquier institución financiera o cooperativa sin restricciones.
  - **Auto-Detección Inteligente al Escribir o Pegar:** Al ingresar o pegar los 20 dígitos de una cuenta bancaria, el sistema analiza en vivo los primeros 4 dígitos y selecciona automáticamente la entidad bancaria correspondiente en el formulario.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.10.1` con 335 pruebas automatizadas en verde.

### Version 3.10.0 — 22/11/2026
- **Módulo ERP de Gestión de Cuentas Bancarias Recaudadoras y Reactividad en Portal:**
  - **Módulo Integral `HaciendaCuentas` (`js/modules/conciliacion/cuentas.js`):** Interfaz para administración de las cuentas bancarias oficiales de la Alcaldía con soporte para entidades bancarias nacionales según SUDEBAN (Banco de Venezuela, Banesco, BNC, Mercantil, Provincial, Banco del Tesoro, Bancamiga, etc.).
  - **Validación Bancaria Venezolana a 20 Dígitos:** Asignación automática del código bancario de 4 dígitos según la entidad seleccionada, formateador visual por bloques (`0000-0000-00-0000000000`), contador reactivo de dígitos y validación estricta de longitud.
  - **Operaciones Completas de Tesorería (CRUD):** Registro de nuevas cuentas, modificación de datos, alternador de estado operativo (`activa` / `inactiva`) y borrado seguro con validación de integridad referencial (impide eliminar cuentas con días de conciliación o movimientos bancarios históricos).
  - **Integración Directa en Conciliación y Caja:** Botón destacado "Cuentas Recaudadoras" incorporado tanto en la cabecera de **Conciliación Bancaria** como en **Caja y Recaudación**. Además, el formulario de entero de pagos en caja ahora alimenta dinámicamente el selector de bancos destino desde las cuentas activas de la base de datos, eliminando opciones estáticas en código.
  - **Desbloqueo de Sincronización en Portal del Contribuyente:** Inclusión de `hacienda_cuentas` y `hacienda_actividades_locat` en `PUBLIC_PORTAL_TABLES` tanto en `store.js` como en `realtime-sync.js`, permitiendo que el portal del comercio descargue y actualice en tiempo real (0ms) las tarjetas bancarias y selectores de consignación al momento que Tesorería realice cambios en el ERP.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.10.0` con 335 pruebas automatizadas en verde.

### Version 3.9.9 — 22/11/2026
- **Manejo Estricto de Estado Sin Patente en Portal del Contribuyente y Bloqueo de Autoliquidación Huérfana:**
  - **Eliminación de Ramo por Defecto Arbitrario:** Se erradicó la asignación ficticia de `COM-001 Venta al por menor de víveres` y el badge "Ramo Aprobado por Alcaldía" cuando una empresa registrada en el padrón carece de una Patente de Industria y Comercio formalmente expedida por la Dirección de Administración Tributaria.
  - **Tarjeta Informativa Institucional para Empresas sin Licencia:** Cuando un contribuyente registrado en el padrón no posee patentes activas, el módulo de autoliquidación despliega un banner informativo elegante en tonos ámbar explicando claramente que su registro en el padrón está activo pero pendiente por la asignación de su ramo oficial LOCAT tras la evaluación del Acta Constitutiva por parte de Rentas Municipales.
  - **Candado Fiscal Anti-Creación Huérfana (`presentarDeclaracion`):** Se neutralizó la auto-generación de patentes temporales en cliente (`PAT-2026-XXXX`). Si el contribuyente no tiene licencia aprobada por la taquilla municipal, la presentación de la declaración se bloquea con advertencia formal, salvaguardando la exactitud y legalidad de la recaudación tributaria.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.9.9` con 330 pruebas automatizadas en verde.

### Version 3.9.8 — 22/11/2026
- **Selector Inteligente de Contribuyentes con Cards, Live Search y Paginación:**
  - **Componente Reutilizable `SelectorContribuyenteModal`:** Sustitución de los `<select>` estáticos con sobrecarga de DOM en el ERP por un modal interactivo con grid de tarjetas (cards) y paginación en bloques de 8 registros a 0ms, eliminando la congelación del navegador ante padrones de 15.000+ registros.
  - **Filtro Reactivo Multi-Criterio:** Buscador en vivo que filtra instantáneamente por RIF, Razón Social, Denominación Comercial o Cédula/Nombre del Representante Legal.
  - **Diseño de Cards Informativas:** Cada tarjeta exhibe RIF con badge formal, razón social, nombre de fantasía, representante con cédula, teléfono, estado y botón de selección en 1 clic.
  - **Integración en Módulos Clave:** Implementado en el modal de emisión de **Patentes Comerciales** (`PatentesModule`) y en el de **Solvencias Municipales** (`SolvenciasModule`) con tarjeta interactiva de estado seleccionado y botón "Cambiar".
  - Bump de Service Worker a `alcaravan-v3-cache-v3.9.8` con 330 pruebas unitarias automatizadas en verde.

### Version 3.9.7 — 22/11/2026
- **Blindaje Fiscal en Autoliquidación: Bloqueo de Ramo y Vinculación Estricta a Licencia Municipal:**
  - **Bloqueo de Actividad Económica por Licencia:** Sustitución del selector libre de 80 actividades por una tarjeta oficial de solo lectura que bloquea el ramo económico y la alícuota a la Patente de Industria y Comercio formalmente aprobada por los fiscales de la Alcaldía en `hacienda_patentes`.
  - **Prevención de Evasión Fiscal:** Neutralización de la posibilidad de que comercios con alícuotas más altas (licorerías, discotecas, mayoristas) seleccionen actividades de alícuotas reducidas (hortalizas, abarrotes) para defraudar al fisco municipal.
  - **Soporte de Múltiples Patentes Autorizadas:** Si un contribuyente posee más de una licencia legalmente emitida en el mismo RIF (ej. abasto y expendio de licores), el sistema despliega un selector restringido exclusivamente a sus licencias aprobadas, sin acceso al resto del catálogo nacional.
  - **Cálculo y Presentación Inmutables:** Los datos de cálculo (alícuota, mínimo MMAV y código LOCAT) se transmiten de forma inmutable a la liquidación y se asocian de forma atómica a la patente oficial del contribuyente.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.9.7`.

### Version 3.9.6 — 22/11/2026
- **Migración del Catálogo LOCAT a Base de Datos SGB y Desacoplamiento de Código Duro:**
  - **Tabla `hacienda_actividades_locat` (17ma Tabla del Sistema Tributario):** Creación del modelo relacional en `sql/schema_hacienda.sql` con campos `id`, `codigo`, `categoria`, `nombre`, `alicuota`, `minimo_tcmmv`, `activo`, `created_at` y `updated_at`, con RLS, política permisiva y publicación en `supabase_realtime`.
  - **Ciclo Inquebrantable de Datos a 0ms:** Registro en `TABLES` y `TABLE_SCHEMAS` de `js/core/store.js` y en `SYNCABLE_TABLES` / `PUBLIC_PORTAL_TABLES` de `js/core/realtime-sync.js`.
  - **Auto-Sembrado Dinámico y Sincronización:** Mecanismo de siembra automática en `HaciendaStore.init()` y método auxiliar `sembrarActividadesLocat()` a partir de las 66 actividades armonizadas si la tabla está vacía, con persistencia en LocalForage y batch sync hacia Supabase.
  - **Refactorización Reactiva de `catalogo-locat.js`:** Lectura desacoplada desde `HaciendaStore.get('hacienda_actividades_locat')`, permitiendo que cualquier cambio de alícuotas o creación de nuevos ramos en la base de datos se refleje en tiempo real en la autoliquidación del portal sin tocar código.
  - **Auditoría SGB de 17 Tablas:** Actualización de `test-cycle-audit.js` pasando las 324 pruebas automatizadas con 0 fallos.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.9.6`.

### Version 3.9.5 — 22/11/2026
- **Clasificador Nacional Ampliado LOCAT y Agrupación por Sectores:**
  - **Expansión a 66 Actividades Económicas Armonizadas:** Ampliación integral de `catalogo-locat.js` con todas las actividades comerciales, de servicios, industriales, salud, educación, licores, construcción y telecomunicaciones según la LOCAT y Gaceta Oficial N° 6.755.
  - **Agrupación Semántica por Optgroups:** Organización jerárquica en el selector de autoliquidación clasificada en 8 sectores económicos con etiquetas destacadas (`getCategorias()` y `getByCategoria()`), facilitando una búsqueda rápida y visual para el contribuyente.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.9.5` con 312 pruebas automatizadas en verde.

### Version 3.9.4 — 22/11/2026
- **Autoliquidación Dinámica LOCAT, Selector de Actividad Económica y Anti-Autofill:**
  - **Integración del Catálogo Armonizado LOCAT:** Selector interactivo de actividad económica en el módulo de autoliquidación del portal (`dec-actividad-locat`), permitiendo seleccionar entre las actividades del clasificador oficial (alícuotas del 1.00% al 5.00% y mínimos de 0.30 a 3.00 MMAV).
  - **Cálculo Tributario en Vivo:** Funciones reactivas `cambiarActividadLocat` y `calcularEnVivo` que recalculan instantáneamente el impuesto por alícuota y el mínimo en bolívares según la TCMMV oficial del día.
  - **Corrección de Formato Decimal de Moneda:** Normalización estricta de formato a dos decimales (`minimumFractionDigits: 2, maximumFractionDigits: 2`), eliminando la confusión visual de tres decimales en el mínimo tributable.
  - **Protección Anti-Autofill de Navegador:** Desactivación de autocompletado en el campo de facturación mensual (`autocomplete="off"`, `data-lpignore="true"`), evitando que administradores de contraseñas de navegadores inyecten números de cédula o claves guardadas en el campo de ventas.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.9.4` con 312 pruebas automatizadas en verde.

### Version 3.9.3 — 22/11/2026
- **Blindaje del Portal Público y Consultas Quirúrgicas Anti-Fuga de Datos:**
  - **Bloqueo de Descarga Masiva en Portal (`index.html`):** Restricción arquitectónica en `store.js` y `realtime-sync.js` que impide que el portal público descargue o sincronice el padrón municipal completo o tablas administrativas privadas (`user_profiles`, `hacienda_conciliacion`, `hacienda_cuentas`, desgloses bancarios).
  - **Búsqueda Quirúrgica Bajo Demanda (`fetchSingleContribuyente`):** Cuando un contribuyente consulta su RIF o correo en el portal, el sistema ejecuta una petición remota exacta y aislada a Supabase exclusivamente para su propio registro, sin exponer comercios de terceros.
  - **Sincronización Quirúrgica Post-Autenticación (`syncContribuyenteSurgical`):** Tras validar la contraseña, se descargan únicamente las declaraciones, pagos, solvencias y bienes del contribuyente activo (`contribuyente_id = active.id`).
  - **Purga de Memoria al Cerrar Sesión (`cerrarConsulta`):** Al salir del portal, se limpian inmediatamente de la memoria RAM y de LocalForage todos los registros del comercio consultado, garantizando cero rastros en equipos compartidos o cibercafés.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.9.3` con 312 pruebas automatizadas superadas al 100%.

### Version 3.9.2 — 22/11/2026
- **Visibilidad de Contraseñas (Ojito) y Corrección de Contraste en Botones de Acción:**
  - **Alternador Universal de Contraseñas (`toggleInputClave`):** Integración de botones interactivos con icono de ojo (`fa-eye` / `fa-eye-slash`) en todos los campos de contraseña: modal de Primer Ingreso (`pi-clave`, `pi-clave-confirm`), modal de Recuperación de Clave (`rec-nueva-clave`, `rec-confirm-clave`) e Inscripción de Comercio (`ins-clave`, `ins-clave-confirm`).
  - **Corrección de Contraste en Botones Negros:** Ajuste en `styles.css` y adición de estilos de alta prioridad para garantizar que los botones de fondo negro (`bg-black`, `bg-neutral-900`) mantengan siempre su texto en blanco puro (`#FFFFFF !important`), resolviendo el problema donde el tema claro pintaba el texto del botón en negro.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.9.2` con 312 pruebas automatizadas en verde.

### Version 3.9.1 — 22/11/2026
- **Blanqueo de Contraseña a Estado "Primer Ingreso" para Autogestión del Contribuyente:**
  - **Función de Blanqueo (`blanquearClaveContribuyente`):** Permite a los administradores borrar la contraseña asignada de un comercio para regresarlo al estado de Primer Ingreso.
  - **Disparador en Modal de Clave y Modal de Edición:** Disponible tanto desde el diálogo de "Clave" como dentro de la ventana de modificación de datos del contribuyente.
  - **Experiencia de Usuario en Portal:** Cuando el comerciante ingresa al portal público (`index.html`) tras el blanqueo, el sistema detecta la ausencia de clave y activa automáticamente el flujo de **Primer Ingreso**, solicitándole validar la Cédula del Representante Legal registrada y establecer su propia contraseña personalmente.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.9.1` con 312 pruebas automatizadas en verde.

### Version 3.9.0 — 22/11/2026
- **Edicion Integral de Contribuyentes Protegida por Matriz ACL (`contribuyentes_editar`):**
  - **Boton de Accion "Editar" en Padrón RUC:** Integrado en la columna de acciones de cada comercio para funcionarios con permisos correspondientes.
  - **Modal Completo de Modificacion:** Permite actualizar RIF, Razón Social, Denominación Comercial, Tipo de Persona, Correo, Teléfono sanitizado, Dirección Fiscal, Representante Legal, Cédula del Representante, Estado del Contribuyente (`activo`, `en_revision`, `bloqueado`) y Fotografía de Fachada.
  - **Protección Criptográfica y de Permisos:** Verificación estricta del permiso granular `contribuyentes_editar` vía `HaciendaAuth.hasPermission('contribuyentes_editar')`, bloqueando cualquier intento no autorizado.
  - **Persistencia Inmediata:** Actualización atómica en LocalForage a 0ms y sincronización inmediata con Supabase.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.9.0` con 312 pruebas unitarias automatizadas superadas al 100%.

### Version 3.8.9 — 22/11/2026
- **Asignacion Administrativa de Contraseñas a Contribuyentes en Panel ERP:**
  - **Accion Directa en Padrón RUC:** Boton "Clave" en cada fila de la tabla de contribuyentes con indicador visual de estado (llave verde si tiene clave, gris si esta pendiente de primer ingreso).
  - **Modal de Gestion de Clave:** Permite a los administradores asignar o restablecer la contraseña de acceso al portal de cualquier comercio, con generador automatico de claves seguras en 1 clic (`GuaribeXXXX!`).
  - **Registro de Nuevos Contribuyentes:** Campo opcional de contraseña incorporado en el formulario de registro del ERP (`modal-registro-contribuyente`), permitiendo registrar al comercio con su clave lista o dejarlo para que la cree en su primer ingreso.
  - Encriptacion mediante hash SHA-256 antes de persistir en `HaciendaStore` y sincronizar con Supabase.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.8.9` con 312 pruebas automatizadas en verde.

### Version 3.8.8 — 22/11/2026
- **Autenticacion Hibrida Segura para el Portal del Contribuyente (RIF / Correo + Clave):**
  - Soporte de acceso dual: inicio de sesion por **RIF + Contraseña** o por **Correo Electronico + Contraseña**.
  - Selector de pestaña minimalista ("Por RIF" / "Por Correo") integrado en la tarjeta de acceso sin alterar la estetica limpia de la referencia visual.
  - Campo de contraseña con alternancia para mostrar/ocultar clave (`fa-eye` / `fa-eye-slash`).
  - Encriptacion mediante hash SHA-256 (`crypto.subtle`) para almacenamiento seguro offline y sincronizacion remota.
  - **Primer Ingreso al Portal:** Activacion guiada de clave para comercios existentes validando la Cedula del Representante Legal en modal exclusivo.
  - **Recuperacion de Contraseña:** Enlace "¿Olvido su clave?" con verificacion de Cedula del Representante Legal contra el padron municipal.
  - **Censo Municipal:** Exigencia obligatoria de creacion y confirmacion de clave (minimo 6 caracteres) al inscribir un nuevo comercio.
  - Registro del campo `clave` en `TABLE_SCHEMAS['hacienda_contribuyentes']` (`js/core/store.js`) y `sql/schema_hacienda.sql`.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.8.8` con 312 pruebas automatizadas en verde.

### Version 3.8.7 — 22/11/2026
- **Fidelidad Pixel-Perfect al Mockup Oficial del Portal del Contribuyente:**
  - Header minimalista exacto: Emblema "A" negro, texto "Alcaravan | San Jose de Guaribe", tasa interactiva "TCMMV BCV: 1.009,07 Bs. v" y boton contorneado "Funcionarios".
  - Pantalla de inicio de sesion exactamente como en la referencia visual:
    - Etiqueta superior monoespaciada `PORTAL DEL CONTRIBUYENTE`.
    - Titulo `Iniciar Sesion` en negro puro con subtitulo de dos lineas.
    - Tarjeta blanca compacta (390px) con label `RIF o Cedula`.
    - Campo unificado `J v | Ej: 123456789`.
    - Boton solido negro `Ingresar ->`.
    - Enlace centrado `¿Comercio nuevo? Solicitar censo municipal`.
    - Leyenda inferior `Atencion presencial: Taquilla de Rentas Municipales · 8:00 AM a 4:00 PM`.
  - Footer de dos extremos: `Alcaldia de San Jose de Guaribe · SATRIMG` y `Marco Legal LOCAT` con apertura directa de la ordenanza.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.8.7`.

### Version 3.8.6 — 22/11/2026
- **Depuracion Radical de Ruido Visual en Portada (Clean Login Minimalista):**
  - Eliminacion de las 3 barras superiores apiladas en el portal publico: fuera topbar con clima/reloj y fuera ticker tape en movimiento continuo.
  - Navbar minimalista sobrio: Unicamente logo institucional Alcaravan + Alcaldia de San Jose de Guaribe a la izquierda y boton discreto de "Acceso Funcionarios" a la derecha.
  - Tarjeta de inicio de sesion ultra limpia, centrada y sin sobrecarga:
    - Retiro de todas las pildoras redundantes, badges de latencia, textos de ayuda y labels duplicadas dentro y fuera de la tarjeta.
    - Diseño centrado verticalmente: Emblema institucional, titulo "Portal del Contribuyente", selector `J/V/G/E/C/P`, campo de RIF con foco directo, boton "Ingresar al Portal" y enlace simple a censo municipal.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.8.6`.

### Version 3.8.5 — 22/11/2026
- **Simplificacion del Landing del Portal (`index.html`) y Pantalla de Inicio de Sesion Directa:**
  - Rediseño enfocado en usabilidad para comerciantes y adultos mayores: eliminacion de la sobrecarga visual inicial en el primer viewport.
  - Pantalla principal (Bloque 1) dedicada exclusivamente al Inicio de Sesion / Consulta de RIF:
    - Tarjeta centralizada de autogestion con alta legibilidad y contraste.
    - Selector desplegable de documento (`J`, `V`, `G`, `E`, `C`, `P`) y campo de texto numérico de gran tamaño con sanitizacion en tiempo real (`HaciendaRIF.handleInput`).
    - Boton de ingreso de alto impacto visual con degradado morado corporativo SGB (`#4F46E5` -> `#7C3AED`).
    - Enlace directo a solicitud de censo comercial para negocios no registrados y caja de asistencia presencial en Taquilla Municipal (Plaza Bolivar).
    - Boton indicador para desplazamiento suave hacia el contenido informativo secundario.
  - Reubicacion del contenido secundario (Bloque 2, abajo del fold):
    - Mesa de Cambio Oficial BCV (TCMMV para LOCAT Art. 30, Dolar USD, Euro EUR, Yuan CNY).
    - Carrusel de comunicados y avisos institucionales.
    - Bento Grid de modulos y servicios tributarios municipales.
    - Centro oficial de descarga de Gacetas y Ordenanzas en PDF.
  - Identidad visual corporativa SACCFAG V3 (SGB Light):
    - Fondo institucional suave `#F8FAFC`, tarjetas blancas `#FFFFFF`, bordes `#E2E8F0` y tipografias de alto contraste `#0F172A` y `#475569`.
    - Adaptacion de navbar, topbar y ticker tape a la estetica clara corporativa.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.8.5` con 312 pruebas unitarias automatizadas superadas al 100%.

### Version 3.8.4 — 21/11/2026
- **Sanitizacion Estricta de Telefonos y Cedulas + Identidad Cromatica SGB Light:**
  - Sanitizacion universal de telefonos a digitos puros (`replace(/\D/g, '')`) en registro y portal.
  - Selector de documento (`V`, `E`, `P`) para cedula del representante legal.
  - Portabilidad del motor de estilos `styles.css` con acentos morados e indigo de SACCFAG V3.

### Version 3.7.0 — 19/11/2026
- **Transicion a "Administracion Tributaria", Carrusel de Avisos, Centro de Ordenanzas Descargables y Popups Oficiales:**
  - **Renombramiento Oficial:** Sustitucion formal del termino arcaico "Hacienda" por **"Administracion Tributaria"** (SATRIMG / Direccion de Administracion Tributaria Municipal) en toda la interfaz de usuario, headers, modales y panel administrativo.
  - **Top Bar Institucional San Jose de Guaribe:** Barra superior con reloj y fecha oficial en vivo y widget de clima local (`29°C · Guaribe`).
  - **Carrusel Oficial de Avisos y Campanas:** Banner interactivo deslizable con controles laterales, dots alargados estilo Apple y auto-play pausable con campanas de armonizacion LOCAT, cronograma fiscal y solvencias digitales QR.
  - **Centro de Descargas de Ordenanzas y Gacetas Municipales:** Catalogo descargable en PDF de instrumentos legales de San Jose de Guaribe (Actividades Economicas LOCAT, Inmuebles Urbanos y Catastro, Tasas Administrativas, Patente de Vehiculos, Tabulador de Aseo Urbano y Calendario Fiscal 2026).
  - **Generador de PDF Oficial a 0ms:** Renderizado cliente con jsPDF de gacetas y ordenanzas oficiales maquetadas con membrete institucional, exposicion de motivos, ficha tecnica y articulos clave.
  - **Visor de Articulado:** Modal rapido para consultar en linea las disposiciones principales sin descargar el archivo.
  - **Motor de Popups Oficiales:** Modal emergente para decretos y comunicados del Alcalde con persistencia en `localStorage` (control de no volver a mostrar en el dia).
  - Bump de Service Worker a `alcaravan-v3-cache-v3.7.0`.

### Version 3.6.1 — 19/11/2026
- **Normalizacion Estricta de RIF y Entradas Numericas Puras:**
  - **Selector Oficial de Prefijo:** Despliegue de los 6 tipos de RIF formales de Venezuela: `V` (Natural Venezolano), `J` (Juridico / Comercial), `G` (Gubernamental), `E` (Natural Extranjero), `C` (Consejo Comunal / Comuna) y `P` (Pasaporte).
  - **Input Numerico Exclusivo:** El campo de texto de RIF solo acepta digitos numericos (`0-9`), sanitizando en tiempo real cualquier guion, espacio o letra (`replace(/\D/g, '')`).
  - **Auto-Deteccion Inteligente al Pegar:** Si el usuario copia y pega un RIF completo (ej. `J-40862362-5`), el sistema detecta automaticamente la letra para setear el `<select>` y coloca exclusivamente los numeros en el input.
  - **Motor Global `window.HaciendaRIF`:** Utilidad centralizada en `js/core/store.js` para parseo, formateo canonico (`J-123456789`) y busqueda tolerante tanto por coincidencia exacta como por numero puro.
  - **Integracion Completa:** Aplicado en Portal del Comercio (Hero y Modal de Censo/Inscripcion), Panel Administrativo (Modal de Registro y Filtro de Busqueda en tiempo real) y Autenticacion (`loginContribuyente`).
  - Bump de Service Worker a `alcaravan-v3-cache-v3.6.1`.

### Version 3.6.0 — 19/11/2026
- **Porte de Supabase Utils, Realtime Multi-Dispositivo y Bi-Sync Paginado (SACCFAG V3):**
  - **Instancia Supabase Activa:** Vinculacion al nuevo proyecto `https://jsfxdyeridowlgmhnlrv.supabase.co` con clave publicable `sb_publishable_k2qo91SV56OwCUc3uS-08A_YfOWPD67`.
  - **Diagnostico de Base de Datos (`verificar_db.js`):** Script CLI de verificacion remota columna por columna y deteccion de tablas 404.
  - **Motor Realtime Multi-Dispositivo (`js/core/realtime-sync.js`):** Canal `hacienda-live-channel` con difusion instantanea `<50ms` mediante `broadcastMutation` (`db_mutation`) y escucha de eventos `postgres_changes` en las 13 tablas con refresco debounceado.
  - **Descarga Paginada Anti-Truncamiento:** Metodo `downloadFreshFromSupabase` en bloques de 1000 registros con preservacion y fusion no destructiva de cambios locales offline (`_sync_pending`).
  - **Throttling Secuencial Anti-429:** Limitador de tasa (máx 4.5 req/s) en cola FIFO en `js/core/store.js`.
  - **Soporte Nativo UUIDv4:** Actualizacion de `sql/schema_hacienda.sql` en todas las 13 tablas con claves primarias y foraneas `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text` compatibles con identificadores inmutables de cliente.
  - **Indicador Visual de Sync:** Badge reactivo `#sync-status-badge` en navbar de `index.html` y `admin.html` (Modo Local vs Supabase En Vivo).
  - Bump de Service Worker a `alcaravan-v3-cache-v3.6.0`.

### Version 3.4.4 — 19/11/2026
- **Estandarizacion de Identificadores Maestros Inmutables (UUIDv4) y Hoja de Ruta:**
  - Migracion del generador de ID cliente a UUIDv4 (`crypto.randomUUID()`) en `store.js` y `portal-comercio.js` para desacoplar expedientes de datos mutables (RIF y Razon Social).
  - Documentacion exhaustiva de la Hoja de Ruta (Roadmap) y diseno del arbol documental en Google Drive / Google Apps Script con cuenta dedicada `systemsatrimg` (`systemsatrimg@gmail.com`).
  - Dimensionamiento de infraestructura y cuotas gratuitas validado para municipios tipo San Jose de Guaribe.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.5.1`.

### Version 3.8.4 — 19/11/2026
- **Sanitizacion Estricta de Telefonos y Cedula del Representante con Selector:**
  - Creacion de los servicios auxiliares universales `HaciendaCedula` y `HaciendaTelefono` en `js/core/store.js`.
  - Normalizador de cedulas de identidad con selector de tipo (`V` - Venezolano, `E` - Extranjero, `P` - Pasaporte) y campo de numero con sanitizacion numerica en tiempo real (`0-9`).
  - Sanitizacion de telefonos sin guiones, parentesis ni caracteres especiales (`replace(/\D/g, '')`) tanto en `oninput` como al persistir en base de datos.
  - Implementacion sincronizada en el modal de registro de contribuyentes del ERP (`js/modules/contribuyentes/registro.js`) y en la solicitud de censo comercial del portal (`js/modules/portal-comercio.js`).
  - Bump de Service Worker a `alcaravan-v3-cache-v3.8.4` y 312 pruebas automaticas en verde.

### Version 3.8.3 — 19/11/2026
- **Adopcion Oficial de la Identidad Visual SACCFAG V3 (Tema SGB Silhouettes Light & Corporate):**
  - Reemplazo del tema negro obsidian por la paleta grafica oficial de SACCFAG V3: Fondo claro descansado (`#F8FAFC`), tarjetas y superficies en blanco puro (`#FFFFFF`), bordes sutiles (`#E2E8F0`) y tipografia corporativa de alto contraste en slate oscuro (`#0F172A`).
  - Incorporacion de `styles.css` con acentos morados e indigo SGB (`#7C3AED` / `#4F46E5`), gradiente violeta oficial (`linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)`) y efectos de resplandor (`glow-morado`) en botones primarios, badges de estado y selector activo del sidebar.
  - Formulario e inputs con estilo institucional: fondo blanco, bordes `#CBD5E1` y foco morado interactivo.
  - Activacion por defecto de `class="sgb-light"` en `admin.html` e `index.html` con persistencia en `localStorage`.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.8.3` con inclusion de `styles.css` en la cache offline.

### Version 3.8.2 — 19/11/2026
- **Cache-Busting forzoso para Scripts de Modulos y Normalizacion de Alias en Auth:**
  - Adicion de parametro de version `?v=3.8.2` a la inclusion de `gestion.js` en `admin.html` para purgar scripts obsoletos retenidos en la cache del navegador.
  - Normalizacion automatica de alias (`admin`, `satrimg`) hacia la credencial institucional `systemsatrimg@gmail.com` antes de invocar la API de Supabase Auth para evitar errores HTTP 400 por formato no email.
  - Pase directo de contingencia hacia el baul offline sin interrupciones en caso de credenciales maestras de arranque.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.8.2`.

### Version 3.8.1 — 19/11/2026
- **Suite Automatizada de Pruebas Unitarias y Auditoria SGB (`test-cycle-audit.js`):**
  - Implementacion de 303 pruebas automaticas ejecutables con `node test-cycle-audit.js` o `npm test`.
  - Validacion sintactica estricta con compilacion VM (cero tolerancia a `SyntaxError`).
  - Verificacion de ejecucion en sandbox simulado (previene errores de tipo como `TypeError: X is not a function`).
  - Auditoria del ciclo sagrado de datos a 0ms para las 16 tablas del sistema tributario (`store.js`, `realtime-sync.js`, `schema_hacienda.sql`).
  - Auditoria de consistencia en la matriz de permisos ACL (29 permisos granulares validados contra atributos `data-perm` del HTML).
  - Verificacion de integridad fisica de todos los archivos referenciados en HTML y assets de Service Worker.

### Version 3.8.0 — 19/11/2026
- **Sistema de Usuarios Registrados en Supabase y Control de Acceso Granular (ACL) estilo SACCFAG V3:**
  - Registro de la 16ta tabla `user_profiles` en `js/core/store.js` (`TABLES`, `TABLE_SCHEMAS`, `TABLE_ON_CONFLICT`), `js/core/realtime-sync.js` (`SYNCABLE_TABLES`) y `sql/schema_hacienda.sql`.
  - Capa de autenticacion de funcionarios dual (`js/core/auth.js`) sincronizada con Supabase Auth (`signInWithPassword`, `signUp`, `signOut`) y baul seguro offline SHA-256 (`hacienda_vault_users`) para acceso instantaneo a 0ms sin internet.
  - Matriz de permisos granulares ACL (24 permisos agrupados en 8 areas clave: Padron RUC, Licencias LOCAT, Declaraciones, Caja, Conciliacion, Solvencias QR, Comunicacion/Portada y Administracion).
  - Modulo administrativo completo `js/modules/usuarios/gestion.js` (`window.UsuariosModule`): alta de funcionarios, edicion de datos, activacion/pausa de cuentas y asignacion visual de permisos mediante checkboxes interactivos.
  - Menu lateral del ERP reactivo con atributos `data-perm` en cada enlace de navegacion (`updateSidebarAcl()`), ocultando las secciones no autorizadas segun el perfil del funcionario activo.
  - Modal unificado de Iniciar Sesion / Registro en `admin.html` con alternador de modos, revelado de contrasena con icono de ojo y boton de autocompletado maestro.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.8.0`.

### Version 3.4.3 — 19/11/2026
- **Integracion en Vivo de Tasas Oficiales BCV (DolarApi / BCV API):**
  - Creacion del servicio modular cliente `js/services/tasas-bcv.js` (`window.TasasBCV`).
  - Consulta en tiempo real de Dolar Oficial BCV (`/v1/dolares`) y Euro Oficial BCV (`/v1/euros`).
  - Determinacion automatica de la Moneda de Mayor Valor (**TCMMV / MMAV**) conforme al Art. 30 de la LOCAT.
  - Actualizacion reactiva sin recarga en ticker tape, píldoras superiores, Bento cards de Hero y autoliquidacion de patentes.
  - Cache local persistente para funcionamiento offline continuo si se pierde la conexion.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.5.0`.

### Version 3.7.2 — 19/11/2026
- **Carrusel Hero Configurable Dinamicamente desde el ERP Administrativo (`admin.html`):**
  - Creacion del modulo unificado `js/modules/comunicacion/comunicacion.js` (`ComunicacionModule`) que gestiona tanto el **Carrusel Hero de Portada** como los **Popups Emergentes** en un solo panel con selector de subpestanas.
  - CRUD completo para slides de portada: titulo, badge / tag, descripcion, seleccion de paleta de color y gradiente (Esmeralda LOCAT, Zafiro Tributos, Ambar Calendario, Indigo Solvencias, Rosa Decretos), icono FontAwesome, orden numerico y switch de activo/pausado.
  - Ruteador de acciones de boton configurables: scroll al buscador RIF (`#buscador-rif`), apertura de ordenanza en modal (`modal:id_ordenanza`) o enlaces externos.
  - Registro de la 15ta tabla `hacienda_carrusel` en `store.js` (`TABLE_SCHEMAS`), `realtime-sync.js` (`SYNCABLE_TABLES`) y `sql/schema_hacienda.sql`.
  - Consumo dinamico en `js/modules/portal-comercio.js`: lectura a 0ms desde LocalForage con fallback elegante a los slides iniciales de la LOCAT 2026 si la base de datos esta en frio.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.7.2`.

### Version 3.7.1 — 19/11/2026
- **Gestion Dinamica de Popups Oficiales desde el ERP (`admin.html`):**
  - Implementacion del modulo administrativo `js/modules/comunicacion/popups.js` (`PopupsModule`) en el panel ERP de funcionarios.
  - Capacidad de crear, editar, pausar/activar con switch reactivo y eliminar comunicados y popups oficiales para el portal.
  - Soporte de tipos de anuncio: solo texto, imagen con texto (mixto) y banners graficos completos, con enlaces externos o vinculacion a ordenanzas.
  - Registro de la 14ta tabla `hacienda_popups` en `store.js` (`TABLE_SCHEMAS`), `realtime-sync.js` (`SYNCABLE_TABLES`) y `sql/schema_hacienda.sql`.
  - Consumo dinamico en `js/modules/portal-comercio.js`: lectura directa a 0ms desde LocalForage con filtrado por destino (`portal`, `ambos`) y control de visualizacion diaria (`localStorage`).
  - Bump de Service Worker a `alcaravan-v3-cache-v3.7.1`.

### Version 3.8.7 — 22/11/2026
- **Fidelidad Pixel-Perfect al Mockup Oficial del Portal del Contribuyente:**
  - Header minimalista exacto: Emblema "A" negro, texto "Alcaravan | San Jose de Guaribe", tasa interactiva "TCMMV BCV: 1.009,07 Bs. v" y boton contorneado "Funcionarios".
  - Pantalla de inicio de sesion exactamente como en la referencia visual:
    - Etiqueta superior monoespaciada `PORTAL DEL CONTRIBUYENTE`.
    - Titulo `Iniciar Sesion` en negro puro con subtitulo de dos lineas.
    - Tarjeta blanca compacta (390px) con label `RIF o Cedula`.
    - Campo unificado `J v | Ej: 123456789`.
    - Boton solido negro `Ingresar ->`.
    - Enlace centrado `¿Comercio nuevo? Solicitar censo municipal`.
    - Leyenda inferior `Atencion presencial: Taquilla de Rentas Municipales · 8:00 AM a 4:00 PM`.
  - Footer de dos extremos: `Alcaldia de San Jose de Guaribe · SATRIMG` y `Marco Legal LOCAT` con apertura directa de la ordenanza.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.8.7`.

### Version 3.8.6 — 22/11/2026
- **Depuracion Radical de Ruido Visual en Portada (Clean Login Minimalista):**
  - Eliminacion de las 3 barras superiores apiladas en el portal publico: fuera topbar con clima/reloj y fuera ticker tape en movimiento continuo.
  - Navbar minimalista sobrio: Unicamente logo institucional Alcaravan + Alcaldia de San Jose de Guaribe a la izquierda y boton discreto de "Acceso Funcionarios" a la derecha.
  - Tarjeta de inicio de sesion ultra limpia, centrada y sin sobrecarga:
    - Retiro de todas las pildoras redundantes, badges de latencia, textos de ayuda y labels duplicadas dentro y fuera de la tarjeta.
    - Diseño centrado verticalmente: Emblema institucional, titulo "Portal del Contribuyente", selector `J/V/G/E/C/P`, campo de RIF con foco directo, boton "Ingresar al Portal" y enlace simple a censo municipal.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.8.6`.

### Version 3.8.5 — 22/11/2026
- **Simplificacion del Landing del Portal (`index.html`) y Pantalla de Inicio de Sesion Directa:**
  - Rediseño enfocado en usabilidad para comerciantes y adultos mayores: eliminacion de la sobrecarga visual inicial en el primer viewport.
  - Pantalla principal (Bloque 1) dedicada exclusivamente al Inicio de Sesion / Consulta de RIF:
    - Tarjeta centralizada de autogestion con alta legibilidad y contraste.
    - Selector desplegable de documento (`J`, `V`, `G`, `E`, `C`, `P`) y campo de texto numérico de gran tamaño con sanitizacion en tiempo real (`HaciendaRIF.handleInput`).
    - Boton de ingreso de alto impacto visual con degradado morado corporativo SGB (`#4F46E5` -> `#7C3AED`).
    - Enlace directo a solicitud de censo comercial para negocios no registrados y caja de asistencia presencial en Taquilla Municipal (Plaza Bolivar).
    - Boton indicador para desplazamiento suave hacia el contenido informativo secundario.
  - Reubicacion del contenido secundario (Bloque 2, abajo del fold):
    - Mesa de Cambio Oficial BCV (TCMMV para LOCAT Art. 30, Dolar USD, Euro EUR, Yuan CNY).
    - Carrusel de comunicados y avisos institucionales.
    - Bento Grid de modulos y servicios tributarios municipales.
    - Centro oficial de descarga de Gacetas y Ordenanzas en PDF.
  - Identidad visual corporativa SACCFAG V3 (SGB Light):
    - Fondo institucional suave `#F8FAFC`, tarjetas blancas `#FFFFFF`, bordes `#E2E8F0` y tipografias de alto contraste `#0F172A` y `#475569`.
    - Adaptacion de navbar, topbar y ticker tape a la estetica clara corporativa.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.8.5` con 312 pruebas unitarias automatizadas superadas al 100%.

### Version 3.8.4 — 21/11/2026
- **Sanitizacion Estricta de Telefonos y Cedulas + Identidad Cromatica SGB Light:**
  - Sanitizacion universal de telefonos a digitos puros (`replace(/\D/g, '')`) en registro y portal.
  - Selector de documento (`V`, `E`, `P`) para cedula del representante legal.
  - Portabilidad del motor de estilos `styles.css` con acentos morados e indigo de SACCFAG V3.

### Version 3.7.0 — 19/11/2026
- **Modernizacion Institucional del Portal (`index.html`) y Reemplazo de Terminologia:**
  - Sustitucion del termino colonial "Hacienda" por la denominacion legal moderna: **"Administracion Tributaria"** / **"SATRIMG"**.
  - Incorporacion de barra institucional superior con reloj y fecha oficial venezolana en vivo (`actualizarReloj()`) y widget de clima local para San Jose de Guaribe.
  - Hero Carrusel de Avisos y Campanas Oficiales con transicion automatica e interactiva (Jornada LOCAT 2026, Calendario de Declaraciones y Solvencias QR).
  - Centro Oficial de Descarga de Gacetas y Ordenanzas Municipales con visor de articulos clave y generador instantaneo de PDF institucional al vuelo con jsPDF.
  - Normalizador universal de RIF (`window.HaciendaRIF`) con sanitizacion numerica estricta (`0-9`), selector de tipo (`V`, `J`, `G`, `E`, `C`, `P`) y busqueda tolerante multi-formato.

### Version 3.4.2 — 19/11/2026
- **Carrusel / Ticker Tape Financiero de Divisas BCV y Pulido Visual Apple Fintech:**
  - Implementacion de carrusel ticker horizontal infinito en la cabecera con animacion continua fluida y pausa al hover (Dolar USD, Euro EUR, Yuan CNY, Yen JPY, Rublo RUB, Lira Turca TRY, Petro PTR y Moneda de Mayor Valor TCMMV - Art. 30 LOCAT).
  - Ambient glow mesh multicolor (aurora de zafiro, esmeralda e indigo con efecto vidrio frosted y bordes difuminados por mascara de gradiente).
  - Carrusel Bento en el Hero con tarjetas de tasas oficiales y variaciones porcentuales.
  - Personalizacion cromatica de los 6 modulos Bento Grid (Cyan para Empresas, Purpura para Catastro/Inmuebles, Esmeralda para Vehiculos, Ambar para Publicidad, Coral para Tasas y Teal para Cuentas Bancarias).
  - Bump de Service Worker a `alcaravan-v3-cache-v3.4.0`.

### Version 3.4.1 — 19/11/2026
- **Depuracion de Terminologia Tecnica e Institucionalizacion de la UI:**
  - Eliminacion de jerga de desarrollo ("0ms", "SGB", etc.) de todas las vistas, modales, footers y alertas de cara al comerciante y funcionario.
  - Textos institucionales sobrios adaptados al marco de la LOCAT y administracion tributaria municipal.
  - Auto-recarga y reemplazo forzoso en Service Worker PWA (`alcaravan-v3-cache-v3.3.0`) para desestimar versiones obsoletas cacheadas en el navegador.

### Version 3.4.0 — 19/11/2026
- **Suite Tributaria Apple Bento Grid para el Contribuyente (`index.html`):**
  - Rediseño minimalista Obsidian Apple (#000000 puro, radial glow, SF Pro typography, tarjetas Bento y micro-interacciones a 0ms).
  - Eliminacion total de datos semilla/mock: operacion 100% limpia para produccion real.
  - Implementacion de la suite de 6 areas tributarias basada en la arquitectura SATGUAICA:
    1. *Mis Empresas:* Autoliquidacion LOCAT en vivo, declaracion mensual, reporte de pago y Solvencia QR estilo Apple Wallet.
    2. *Mis Inmuebles:* Consulta de catastro urbano y derecho de frente municipal con registro interactivo.
    3. *Mis Vehiculos:* Control de patentes automotrices y liquidacion de trimestres con registro por placa.
    4. *Mis Publicidades:* Fiscalizacion de vallas, avisos comerciales y toldos en fachada.
    5. *Tasas y Multas:* Historial consolidado de comprobantes, recibos y sanciones.
    6. *Cuentas Bancarias:* Tarjetas bancarias oficiales con copiado de datos bancarios en un toque.
  - Nuevas tablas y esquemas registrados en `HaciendaStore`: `hacienda_inmuebles`, `hacienda_vehiculos` y `hacienda_publicidad`.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.2.0`.

### Version 3.3.0 — 19/11/2026
- **Motor Service Worker PWA Offline-First y Manifest:**
  - Creacion del motor `sw.js` con cache versionada (`alcaravan-v3-cache-v3.1.0`), precaching de assets criticos (librerias, fuentes, modulos) y estrategia Stale-While-Revalidate / Network-First.
  - Creacion de `manifest.json` para instalacion como aplicacion PWA nativa en dispositivos moviles y de escritorio.
  - Registro de Service Worker en `index.html` y `admin.html`.

### Version 3.2.0 — 19/11/2026
- **Bifurcacion de Interfaces (Portal del Comerciante vs ERP Municipal):**
  - Creacion del portal publico `index.html` con modulo `js/modules/portal-comercio.js` para autogestion de comercios (consulta RIF, estado fiscal, declaracion LOCAT en vivo, reporte de pagos y solvencias QR).
  - Creacion de `admin.html` como ruta especial para funcionarios de Hacienda con autenticacion por rol (`admin`, `cajero`).
  - Siembra de comercios y patentes de demostracion en `js/core/store.js` para acceso rapido con 1 clic.

### Version 3.1.0 — 19/11/2026
- **Integracion de Conciliacion Bancaria y Smart Ledger V8:**
  - Creacion de tablas `hacienda_cuentas`, `hacienda_conciliacion`, `hacienda_conciliacion_desglose` y `hacienda_ramos_ingreso` con esquemas en `js/core/store.js` y DDL en `sql/schema_hacienda.sql`.
  - Implementacion de parsers bancarios en `js/modules/conciliacion/parsers.js` para PDF de Banco de Venezuela, Banesco, BNC, Provincial y TXT.
  - Implementacion del controlador bimembre Smart Ledger en `js/modules/conciliacion/smart-ledger.js` con pareo heuristico a 0ms.
  - Modulo de vista principal en `js/modules/conciliacion.js` con HUD de saldos, filtros por cuenta/mes/ano, tabla de conciliaciones diarias y modales de desglose e ingreso manual.
  - Integracion del boton de navegacion y orquestador en `index.html`.
  - Configuracion del repositorio GitHub oficial `https://github.com/LOSCASERIOSXSILHOUETTES/ALCARAVAN` con protocolo de arquitectura SGB, `AGENTS.md` y `README.md`.

### Version 3.0.0 — 14/11/2026
- Arquitectura inicial SGB Silhouettes V3 adaptada a los 6 manuales tecnicos de Alcaravan / GUIIRIRI.
- Implementacion de Padron RUC, Licencias LOCAT, Declaraciones Juradas, Taquilla de Caja y Solvencias con QR.
