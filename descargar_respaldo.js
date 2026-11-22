/**
 * ALCARAVAN — Descargador Automático de Respaldo Completo de Supabase
 * Guarda snapshots en backup_supabase_completo/
 */
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = "https://jsfxdyeridowlgmhnlrv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_k2qo91SV56OwCUc3uS-08A_YfOWPD67";

const TABLES = [
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

async function descargarTodo() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'backup_supabase_completo', `snapshot_${timestamp}`);
    fs.mkdirSync(backupDir, { recursive: true });

    console.log(`[Backup] Iniciando respaldo en: ${backupDir}`);

    for (const tbl of TABLES) {
        try {
            const url = `${SUPABASE_URL}/rest/v1/${tbl}?select=*`;
            const res = await fetch(url, {
                headers: {
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                fs.writeFileSync(path.join(backupDir, `${tbl}.json`), JSON.stringify(data, null, 2), 'utf8');
                console.log(`  [OK] ${tbl}: ${data.length} registros respaldados`);
            } else {
                console.warn(`  [AVISO] ${tbl}: Estado HTTP ${res.status}`);
            }
        } catch (err) {
            console.error(`  [ERROR] Fallo respaldando ${tbl}:`, err.message);
        }
    }
    console.log(`[Backup] Respaldo finalizado con éxito.\n`);
}

descargarTodo();
