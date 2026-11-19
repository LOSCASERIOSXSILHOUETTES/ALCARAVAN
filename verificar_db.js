/**
 * ALCARAVAN — Verificador Rápido de Esquema y Tablas en Supabase
 * 
 * Uso:
 *   node verificar_db.js                                -> Audita todas las tablas y su accesibilidad
 *   node verificar_db.js hacienda_contribuyentes.rif    -> Verifica si la columna existe en la tabla
 *   node verificar_db.js rpc:nombre_rpc                 -> Verifica si la función RPC existe en Supabase
 *   node verificar_db.js hacienda_contribuyentes        -> Muestra columnas reales y estado de la tabla
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = "https://jsfxdyeridowlgmhnlrv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_k2qo91SV56OwCUc3uS-08A_YfOWPD67";

const target = process.argv[2] ? process.argv[2].trim() : null;

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
    'hacienda_popups'
];

async function verificarColumna(tabla, columna) {
    console.log(`\nVerificando existencia de [${columna}] en la tabla [${tabla}]...`);
    const url = `${SUPABASE_URL}/rest/v1/${tabla}?select=${columna}&limit=1`;
    try {
        const res = await fetch(url, {
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            console.log(`EXISTE EN SUPABASE: La columna "${columna}" existe en "${tabla}" (HTTP ${res.status}).`);
            if (data.length > 0) {
                console.log(`   Ejemplo de valor:`, data[0][columna]);
            }
        } else {
            const err = await res.json().catch(() => ({ message: res.statusText }));
            console.log(`NO EXISTE EN SUPABASE o no es accesible:`);
            console.log(`   Detalle: ${err.message || JSON.stringify(err)}`);
            console.log(`   Para agregarla, ejecuta: ALTER TABLE "public"."${tabla}" ADD COLUMN IF NOT EXISTS "${columna}" tipo;`);
        }
    } catch (err) {
        console.error('Error de red al consultar Supabase:', err.message);
    }
}

async function verificarRpc(rpcName) {
    console.log(`\nVerificando función RPC [${rpcName}]...`);
    const url = `${SUPABASE_URL}/rest/v1/rpc/${rpcName}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        if (res.status === 404) {
            console.log(`NO EXISTE EN SUPABASE (HTTP 404 Not Found): La función "${rpcName}" no está creada.`);
        } else {
            const body = await res.json().catch(() => null);
            console.log(`EXISTE EN SUPABASE (HTTP ${res.status}): La función está registrada.`);
            if (body && body.message) console.log(`   Mensaje: ${body.message}`);
        }
    } catch (err) {
        console.error('Error al probar RPC:', err.message);
    }
}

async function inspeccionarTabla(tabla) {
    console.log(`\nInspeccionando tabla [${tabla}]...`);
    const url = `${SUPABASE_URL}/rest/v1/${tabla}?select=*&limit=1`;
    try {
        const res = await fetch(url, {
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            console.log(`Tabla "${tabla}" EXISTE y es accesible.`);
            if (data.length > 0) {
                console.log(`Columnas detectadas:`);
                console.log(Object.keys(data[0]).map(c => `   - ${c}`).join('\n'));
            } else {
                console.log(`La tabla existe pero está vacía (0 registros).`);
            }
        } else {
            console.log(`La tabla "${tabla}" NO existe o da error HTTP ${res.status}.`);
        }
    } catch (err) {
        console.error('Error de red:', err.message);
    }
}

async function auditarTodo() {
    console.log('====================================================');
    console.log('ALCARAVAN — Diagnóstico Rápido de Base de Datos Supabase');
    console.log(`Proyecto: ${SUPABASE_URL}`);
    console.log('====================================================\n');

    for (const t of TABLES) {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${t}?select=count`, {
                headers: {
                    apikey: SUPABASE_ANON_KEY,
                    Prefer: 'count=exact'
                }
            });
            const range = res.headers.get('content-range');
            const total = range ? range.split('/')[1] : (res.ok ? 'OK' : 'ERR');
            console.log(`   ${t.padEnd(35, ' ')} : ${res.ok ? ' ' + total + ' registros' : ' HTTP ' + res.status + ' (Falta crear DDL)'}`);
        } catch (e) {
            console.log(`   ${t.padEnd(35, ' ')} : Error de conexión`);
        }
    }
    console.log('\nTip: Ejecuta "node verificar_db.js <tabla>.<columna>" para probar una columna.');
}

(async () => {
    if (!target) {
        await auditarTodo();
    } else if (target.startsWith('rpc:')) {
        await verificarRpc(target.replace('rpc:', ''));
    } else if (target.includes('.')) {
        const [t, c] = target.split('.');
        await verificarColumna(t, c);
    } else {
        await inspeccionarTabla(target);
    }
})();
