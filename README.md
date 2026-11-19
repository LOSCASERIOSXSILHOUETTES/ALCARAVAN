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
