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

### Version 3.4.3 — 19/11/2026
- **Integracion en Vivo de Tasas Oficiales BCV (DolarApi / BCV API):**
  - Creacion del servicio modular cliente `js/services/tasas-bcv.js` (`window.TasasBCV`).
  - Consulta en tiempo real de Dolar Oficial BCV (`/v1/dolares`) y Euro Oficial BCV (`/v1/euros`).
  - Determinacion automatica de la Moneda de Mayor Valor (**TCMMV / MMAV**) conforme al Art. 30 de la LOCAT.
  - Actualizacion reactiva sin recarga en ticker tape, píldoras superiores, Bento cards de Hero y autoliquidacion de patentes.
  - Cache local persistente para funcionamiento offline continuo si se pierde la conexion.
  - Bump de Service Worker a `alcaravan-v3-cache-v3.5.0`.

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
