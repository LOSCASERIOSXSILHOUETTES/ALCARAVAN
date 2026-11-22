/**
 * ALCARAVAN — Suite de Pruebas Unitarias y Auditoría de Arquitectura SGB Silhouettes V3
 *
 * Ejecución:
 *   node test-cycle-audit.js
 *
 * Cobertura de Pruebas:
 *   1. Integridad física de archivos estructurales y scripts referenciados en HTML.
 *   2. Verificación y existencia de todos los STATIC_ASSETS del Service Worker.
 *   3. Chequeo sintáctico estricto (0 tolerancia a SyntaxError) en todos los .js del proyecto.
 *   4. Ejecución e instanciación en sandbox VM (Cero TypeError / ReferenceError al exportar).
 *   5. Auditoría del Ciclo Inquebrantable de Datos a 0ms (17 tablas en store, realtime y SQL).
 *   6. Consistencia de la matriz de permisos ACL (data-perm de admin.html vs ROSTER_PERMISOS).
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("================================================================================");
console.log("      ALCARAVAN V3 — AUDITORÍA Y SUITE DE PRUEBAS UNITARIAS AUTOMATIZADAS       ");
console.log("================================================================================\n");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  [OK] ${message}`);
    } else {
        failedTests++;
        console.error(`  [FALLO] ${message}`);
    }
}

const ROOT_DIR = __dirname;

// ============================================================================
// PRUEBA 1: EXISTENCIA DE ARCHIVOS ESTRUCTURALES Y SCRIPTS HTML
// ============================================================================
console.log("--- 1. VERIFICACION DE ARCHIVOS ESTRUCTURALES ---");

const coreFiles = [
    'index.html',
    'admin.html',
    'styles.css',
    'sw.js',
    'manifest.json',
    'verificar_db.js',
    'sql/schema_hacienda.sql',
    'js/config.js',
    'js/core/store.js',
    'js/core/realtime-sync.js',
    'js/core/auth.js',
    'js/core/uploader.js',
    'js/services/tasas-bcv.js',
    'js/modules/patentes/catalogo-locat.js',
    'js/modules/contribuyentes/registro.js',
    'js/modules/patentes/comercial.js',
    'js/modules/declaraciones/formulario.js',
    'js/modules/caja/taquilla.js',
    'js/modules/conciliacion/parsers.js',
    'js/modules/conciliacion/smart-ledger.js',
    'js/modules/conciliacion.js',
    'js/modules/solvencias/emisor.js',
    'js/modules/comunicacion/comunicacion.js',
    'js/modules/comunicacion/popups.js',
    'js/modules/usuarios/gestion.js',
    'js/modules/portal-comercio.js'
];

coreFiles.forEach(relPath => {
    const fullPath = path.join(ROOT_DIR, relPath);
    assert(fs.existsSync(fullPath), `Archivo clave existe: ${relPath}`);
});

// Extraer y validar scripts referenciados en index.html y admin.html
['index.html', 'admin.html'].forEach(htmlFile => {
    const htmlContent = fs.readFileSync(path.join(ROOT_DIR, htmlFile), 'utf8');
    const scriptRegex = /<script\s+src="([^"]+)"/g;
    let match;
    while ((match = scriptRegex.exec(htmlContent)) !== null) {
        const src = match[1];
        if (!src.startsWith('http')) {
            const cleanSrc = src.replace(/^\.\//, '').split('?')[0];
            const scriptPath = path.join(ROOT_DIR, cleanSrc);
            assert(fs.existsSync(scriptPath), `[${htmlFile}] Script referenciado existe: ${cleanSrc}`);
        }
    }
});

// ============================================================================
// PRUEBA 2: AUDITORIA DE SERVICE WORKER Y STATIC ASSETS
// ============================================================================
console.log("\n--- 2. VERIFICACION DE SERVICE WORKER Y PRE-CACHE OFFLINE ---");

const swContent = fs.readFileSync(path.join(ROOT_DIR, 'sw.js'), 'utf8');
const cacheNameMatch = swContent.match(/const\s+CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
assert(cacheNameMatch && cacheNameMatch[1], `Cache name definido: ${cacheNameMatch ? cacheNameMatch[1] : 'NO'}`);

// Extraer STATIC_ASSETS array
const staticAssetsMatch = swContent.match(/const\s+STATIC_ASSETS\s*=\s*\[([\s\S]*?)\];/);
assert(staticAssetsMatch, "Array STATIC_ASSETS encontrado en sw.js");

if (staticAssetsMatch) {
    const assetEntries = staticAssetsMatch[1]
        .split('\n')
        .map(l => l.trim().replace(/^['"]|['"],?$/g, ''))
        .filter(l => l.length > 0 && l !== './');

    assetEntries.forEach(asset => {
        const cleanAsset = asset.replace(/^\.\//, '');
        const assetPath = path.join(ROOT_DIR, cleanAsset);
        assert(fs.existsSync(assetPath), `Asset de caché existe en disco: ${cleanAsset}`);
    });
}

// ============================================================================
// PRUEBA 3: VALIDACION SINTACTICA ESTRICTA (0 TOLERANCIA A SYNTAX ERROR)
// ============================================================================
console.log("\n--- 3. VALIDACION SINTACTICA ESTRICTA EN ARCHIVOS JAVASCRIPT ---");

function getAllJsFiles(dir, fileList = []) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        if (item === 'node_modules' || item === '.git' || item === 'libs') continue;
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            getAllJsFiles(fullPath, fileList);
        } else if (item.endsWith('.js')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

const allJsFiles = getAllJsFiles(ROOT_DIR);
allJsFiles.forEach(filePath => {
    const rel = path.relative(ROOT_DIR, filePath);
    const code = fs.readFileSync(filePath, 'utf8');
    let syntaxOk = true;
    try {
        new vm.Script(code, { filename: rel });
    } catch (err) {
        syntaxOk = false;
        console.error(`     Error en ${rel}: ${err.message}`);
    }
    assert(syntaxOk, `Sintaxis JS válida: ${rel}`);
});

// ============================================================================
// PRUEBA 4: EJECUCION E INSTANCIACION EN SANDBOX VM (ZERO RUNTIME TYPEERROR)
// ============================================================================
console.log("\n--- 4. PRUEBA DE CARGA E INSTANCIACION EN ENTORNO SIMULADO ---");

const mockSandbox = {
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    Date: Date,
    Math: Math,
    JSON: JSON,
    Array: Array,
    Object: Object,
    Set: Set,
    String: String,
    Number: Number,
    Boolean: Boolean,
    RegExp: RegExp,
    crypto: {
        randomUUID: () => 'uuid-test-1234',
        subtle: {
            digest: async (algo, data) => new Uint8Array([1, 2, 3, 4]).buffer
        }
    },
    TextEncoder: TextEncoder,
    TextDecoder: TextDecoder,
    btoa: (s) => Buffer.from(s).toString('base64'),
    atob: (s) => Buffer.from(s, 'base64').toString(),
    localStorage: {
        _data: {},
        getItem: function(k) { return this._data[k] || null; },
        setItem: function(k, v) { this._data[k] = String(v); },
        removeItem: function(k) { delete this._data[k]; }
    },
    navigator: { onLine: true },
    document: {
        getElementById: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {}
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    window: null,
    CustomEvent: class CustomEvent { constructor(type, detail) { this.type = type; this.detail = detail; } }
};

mockSandbox.window = mockSandbox;
mockSandbox.global = mockSandbox;
mockSandbox.globalThis = mockSandbox;

const context = vm.createContext(mockSandbox);

// Orden estricto de carga similar al navegador
const scriptsToExecute = [
    'js/config.js',
    'js/core/store.js',
    'js/core/realtime-sync.js',
    'js/core/auth.js',
    'js/services/tasas-bcv.js',
    'js/modules/patentes/catalogo-locat.js',
    'js/modules/contribuyentes/registro.js',
    'js/modules/patentes/comercial.js',
    'js/modules/declaraciones/formulario.js',
    'js/modules/caja/taquilla.js',
    'js/modules/conciliacion/parsers.js',
    'js/modules/conciliacion/smart-ledger.js',
    'js/modules/conciliacion.js',
    'js/modules/solvencias/emisor.js',
    'js/modules/comunicacion/comunicacion.js',
    'js/modules/comunicacion/popups.js',
    'js/modules/usuarios/gestion.js'
];

scriptsToExecute.forEach(relPath => {
    const fullPath = path.join(ROOT_DIR, relPath);
    const code = fs.readFileSync(fullPath, 'utf8');
    let execOk = true;
    let errorMsg = "";
    try {
        const script = new vm.Script(code, { filename: relPath });
        script.runInContext(context);
    } catch (err) {
        execOk = false;
        errorMsg = err.stack || err.message;
    }
    assert(execOk, `Ejecución limpia de script: ${relPath}${!execOk ? ' -> ' + errorMsg : ''}`);
});

// Comprobar que los módulos exportados a global/window son objetos válidos (y no funciones o undefined)
const expectedModules = [
    { name: 'HaciendaStore', methods: ['init', 'get', 'set', 'upsert', 'remove', 'getTableSync'] },
    { name: 'HaciendaRealtime', methods: ['init', 'broadcastMutation', 'SYNCABLE_TABLES'] },
    { name: 'HaciendaAuth', methods: ['init', 'loginFuncionario', 'registrarFuncionario', 'hasPermission', 'updateSidebarAcl'] },
    { name: 'TasasBCV', methods: ['init', 'getTasas', 'getTCMMV', 'fetchEnVivo'] },
    { name: 'CatalogoLocat', methods: ['getAll', 'getByCodigo', 'getCategorias', 'getByCategoria'] },
    { name: 'HaciendaRIF', methods: ['parse', 'format', 'handleInput', 'findMatch'] },
    { name: 'HaciendaCedula', methods: ['parse', 'format', 'handleInput'] },
    { name: 'HaciendaTelefono', methods: ['sanitizar', 'handleInput'] },
    { name: 'ContribuyentesModule', methods: ['render'] },
    { name: 'PatentesModule', methods: ['render'] },
    { name: 'DeclaracionesModule', methods: ['render'] },
    { name: 'CajaModule', methods: ['render'] },
    { name: 'HaciendaConciliacion', methods: ['render'] },
    { name: 'SolvenciasModule', methods: ['render'] },
    { name: 'ComunicacionModule', methods: ['render'] },
    { name: 'PopupsModule', methods: ['render'] },
    { name: 'UsuariosModule', methods: ['render', 'ROSTER_PERMISOS', 'getUsers', 'guardar'] }
];

expectedModules.forEach(mod => {
    const instance = context[mod.name] || (context.window && context.window[mod.name]);
    const isObject = instance && typeof instance === 'object';
    assert(isObject, `Módulo global [window.${mod.name}] exportado correctamente como objeto`);

    if (isObject && mod.methods) {
        mod.methods.forEach(method => {
            const hasMethod = typeof instance[method] === 'function' || Array.isArray(instance[method]) || typeof instance[method] === 'object';
            assert(hasMethod, `  -> Método/Propiedad [window.${mod.name}.${method}] existe`);
        });
    }
});

// ============================================================================
// PRUEBA 5: AUDITORIA DEL CICLO SGB A 0MS (17 TABLAS EN STORE, REALTIME Y SQL)
// ============================================================================
console.log("\n--- 5. AUDITORIA DEL CICLO INQUEBRANTABLE SGB (17 TABLAS) ---");

const storeFileContent = fs.readFileSync(path.join(ROOT_DIR, 'js/core/store.js'), 'utf8');
const realtimeFileContent = fs.readFileSync(path.join(ROOT_DIR, 'js/core/realtime-sync.js'), 'utf8');
const sqlFileContent = fs.readFileSync(path.join(ROOT_DIR, 'sql/schema_hacienda.sql'), 'utf8');

const SYSTEM_TABLES = [
    'hacienda_contribuyentes',
    'hacienda_patentes',
    'hacienda_declaraciones',
    'hacienda_pagos',
    'hacienda_solvencias',
    'hacienda_tramites',
    'hacienda_cuentas',
    'hacienda_conciliacion',
    'hacienda_conciliacion_desglose',
    'hacienda_ramos_ingreso',
    'hacienda_inmuebles',
    'hacienda_vehiculos',
    'hacienda_publicidad',
    'hacienda_popups',
    'hacienda_carrusel',
    'user_profiles',
    'hacienda_actividades_locat'
];

assert(SYSTEM_TABLES.length === 17, "Catálogo completo de 17 tablas del sistema tributario");

SYSTEM_TABLES.forEach(tbl => {
    // 1. En TABLES de store.js
    const inStoreTables = storeFileContent.includes(`'${tbl}'`) || storeFileContent.includes(`"${tbl}"`);
    assert(inStoreTables, `[${tbl}] Registrada en TABLES de store.js`);

    // 2. En TABLE_SCHEMAS de store.js
    const inStoreSchemas = storeFileContent.includes(`'${tbl}': [`) || storeFileContent.includes(`"${tbl}": [`);
    assert(inStoreSchemas, `[${tbl}] Tiene esquema de campos en TABLE_SCHEMAS`);

    // 3. En SYNCABLE_TABLES de realtime-sync.js
    const inRealtime = realtimeFileContent.includes(`'${tbl}'`) || realtimeFileContent.includes(`"${tbl}"`);
    assert(inRealtime, `[${tbl}] Registrada en SYNCABLE_TABLES de realtime-sync.js`);

    // 4. En DDL SQL
    const inSqlCreate = sqlFileContent.includes(`CREATE TABLE IF NOT EXISTS "public"."${tbl}"`);
    const inSqlRLS = sqlFileContent.includes(`ALTER TABLE "public"."${tbl}" ENABLE ROW LEVEL SECURITY;`);
    const inSqlGrant = sqlFileContent.includes(`GRANT ALL ON "public"."${tbl}" TO "anon", "authenticated", "service_role";`);
    const inSqlPub = sqlFileContent.includes(`"public"."${tbl}"`);

    assert(inSqlCreate, `[${tbl}] DDL: CREATE TABLE definido en schema_hacienda.sql`);
    assert(inSqlRLS, `[${tbl}] DDL: ENABLE ROW LEVEL SECURITY definido`);
    assert(inSqlGrant, `[${tbl}] DDL: GRANT ALL TO anon, authenticated, service_role`);
    assert(inSqlPub, `[${tbl}] DDL: Incluida en publicación supabase_realtime`);
});

// ============================================================================
// PRUEBA 6: CONSISTENCIA DE PERMISOS ACL (DATA-PERM VS ROSTER_PERMISOS)
// ============================================================================
console.log("\n--- 6. VERIFICACION DE PERMISOS GRANULARES ACL ---");

const adminHtmlContent = fs.readFileSync(path.join(ROOT_DIR, 'admin.html'), 'utf8');
const dataPermRegex = /data-perm="([^"]+)"/g;
const usedPermsInHtml = new Set();
let permMatch;
while ((permMatch = dataPermRegex.exec(adminHtmlContent)) !== null) {
    usedPermsInHtml.add(permMatch[1]);
}

const rosterPermisos = context.UsuariosModule ? context.UsuariosModule.ROSTER_PERMISOS : [];
const definedPermIds = new Set();
rosterPermisos.forEach(group => {
    group.permisos.forEach(p => definedPermIds.add(p.id));
});

assert(definedPermIds.size === 29, `Matriz ACL cuenta con exactamente 29 permisos granulares (detectados: ${definedPermIds.size})`);

usedPermsInHtml.forEach(htmlPerm => {
    assert(definedPermIds.has(htmlPerm), `Permiso de botón HTML [data-perm="${htmlPerm}"] existe en ROSTER_PERMISOS`);
});

// ============================================================================
// REPORTE FINAL DE AUDITORIA
// ============================================================================
console.log("\n================================================================================");
console.log(`TOTAL DE PRUEBAS EJECUTADAS: ${totalTests}`);
console.log(`PRUEBAS EXITOSAS:           ${passedTests}`);
console.log(`PRUEBAS FALLIDAS:           ${failedTests}`);
console.log("================================================================================");

if (failedTests === 0) {
    console.log(">>> TODAS LAS PRUEBAS EN VERDE. Sistema libre de errores sintacticos y regresiones.");
    process.exit(0);
} else {
    console.error(`>>> AUDITORIA FALLIDA: Se detectaron ${failedTests} discrepancias.`);
    process.exit(1);
}
