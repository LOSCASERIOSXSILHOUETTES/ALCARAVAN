/**
 * GUIRIRI SISTEMA HACIENDA V3 — Motor de Persistencia y Sincronización SGB
 * Ciclo Inquebrantable de Datos a 0ms: Front -> LocalForage -> Supabase -> Realtime -> LocalForage
 * 
 * Basado fielmente en el motor SGB Silhouettes de SACCFAG V3:
 * - 0ms de latencia en lectura y escritura con LocalForage
 * - Paginación inteligente por bloques de 1000 registros (Anti-Truncamiento)
 * - Fusión no destructiva de cambios pendientes locales (_sync_pending)
 * - Difusión Realtime multi-dispositivo y multi-pestaña (<50ms)
 * - Throttling secuencial anti-ráfagas (máx 4.5 req/s)
 */
(function defineHaciendaStore(global) {
    "use strict";

    const DB_NAME = "hacienda_municipal_sgb_db";
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
        'hacienda_publicidad'
    ];

    const TABLE_SCHEMAS = {
        'hacienda_contribuyentes': [
            'id', 'rif', 'razon_social', 'denominacion_comercial', 'tipo_persona',
            'correo', 'telefono', 'direccion_fiscal', 'representante_legal',
            'representante_cedula', 'acta_constitutiva_url', 'fotos_local',
            'estado', 'created_at', 'updated_at'
        ],
        'hacienda_patentes': [
            'id', 'numero_patente', 'contribuyente_id', 'tipo', 'codigo_locat',
            'descripcion_actividad', 'alicuota', 'minimo_tributable_tcmmv',
            'datos_especificos', 'estado', 'fecha_emision', 'fecha_vencimiento',
            'created_at', 'updated_at'
        ],
        'hacienda_declaraciones': [
            'id', 'contribuyente_id', 'patente_id', 'anio', 'mes',
            'base_imponible_bs', 'alicuota_aplicada', 'impuesto_alicuota_bs',
            'minimo_tributable_bs', 'impuesto_determinado_bs', 'tasa_bcv_aplicada',
            'estado', 'fecha_declaracion', 'created_at', 'updated_at'
        ],
        'hacienda_pagos': [
            'id', 'numero_recibo', 'contribuyente_id', 'declaracion_id',
            'banco_origen', 'banco_destino', 'referencia_bancaria', 'fecha_pago',
            'monto_bs', 'comprobante_url', 'metodo', 'estado', 'verificado_por',
            'fecha_verificacion', 'created_at', 'updated_at'
        ],
        'hacienda_solvencias': [
            'id', 'numero_solvencia', 'contribuyente_id', 'tipo', 'codigo_qr',
            'fecha_emision', 'fecha_vencimiento', 'emitido_por', 'estado', 'created_at'
        ],
        'hacienda_tramites': [
            'id', 'numero_tramite', 'contribuyente_id', 'departamento',
            'nombre_tramite', 'motivo', 'tasa_bs', 'pago_id', 'estado',
            'created_at', 'updated_at'
        ],
        'hacienda_cuentas': [
            'id', 'banco', 'numero', 'tipo', 'concepto', 'saldo_inicial', 'saldo_actual', 'estado', 'created_at', 'updated_at'
        ],
        'hacienda_conciliacion': [
            'id', 'cuenta_id', 'fecha', 'saldo_inicial', 'total_ingresos', 'total_egresos', 'saldo_final', 'estado', 'created_at', 'updated_at'
        ],
        'hacienda_conciliacion_desglose': [
            'id', 'conciliacion_id', 'cuenta_id', 'fecha', 'tipo', 'referencia', 'descripcion', 'monto', 'pago_id', 'categoria', 'estado', 'created_at', 'updated_at'
        ],
        'hacienda_ramos_ingreso': [
            'id', 'codigo', 'nombre', 'descripcion', 'activo', 'created_at', 'updated_at'
        ],
        'hacienda_inmuebles': [
            'id', 'contribuyente_id', 'numero_catastro', 'direccion', 'uso', 'valor_fiscal_bs', 'estado', 'created_at', 'updated_at'
        ],
        'hacienda_vehiculos': [
            'id', 'contribuyente_id', 'placa', 'marca', 'modelo', 'anio', 'uso', 'estado', 'created_at', 'updated_at'
        ],
        'hacienda_publicidad': [
            'id', 'contribuyente_id', 'tipo', 'ubicacion', 'metros_cuadrados', 'texto_aviso', 'estado', 'created_at', 'updated_at'
        ]
    };

    const TABLE_ON_CONFLICT = {
        'hacienda_declaraciones': 'contribuyente_id,patente_id,anio,mes'
    };

    function generateUUID() {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Motor Oficial de Normalización de RIF Venezolano (SGB Silhouettes)
     * Soporta los 6 prefijos oficiales del SENIAT: V, J, G, E, C, P
     * Normaliza la parte numérica a SOLO DÍGITOS (0-9)
     */
    const RIF_TIPOS = [
        { code: 'V', label: 'V - Natural Venezolano' },
        { code: 'J', label: 'J - Jurídico / Comercio' },
        { code: 'G', label: 'G - Gubernamental / Estado' },
        { code: 'E', label: 'E - Natural Extranjero' },
        { code: 'C', label: 'C - Consejo Comunal / Comuna' },
        { code: 'P', label: 'P - Pasaporte' }
    ];

    const RIFUtils = {
        TIPOS: RIF_TIPOS,

        // Parsea y extrae { tipo, numero, full }
        parse: function(input) {
            if (!input) return { tipo: 'J', numero: '', full: '' };
            let str = String(input).trim().toUpperCase();
            let tipo = 'J';

            const m = str.match(/^([VJGE CP])[-_\s]*(.*)$/i);
            if (m) {
                tipo = m[1].toUpperCase();
                str = m[2];
            }
            const numero = str.replace(/\D/g, '');
            const validTipo = ['V', 'J', 'G', 'E', 'C', 'P'].includes(tipo) ? tipo : 'J';
            return {
                tipo: validTipo,
                numero: numero,
                full: numero ? `${validTipo}-${numero}` : ''
            };
        },

        // Genera RIF canónico (ej: J-123456780)
        format: function(tipo, numero) {
            const parsed = this.parse((tipo ? (tipo + '-') : '') + (numero || ''));
            return parsed.full;
        },

        // Handler en vivo para inputs numéricos: limpia caracteres y detecta letras pegadas
        handleInput: function(inputEl, selectElId) {
            if (!inputEl) return;
            const rawVal = inputEl.value;
            const parsed = this.parse(rawVal);

            if (selectElId) {
                const sel = typeof selectElId === 'string' ? document.getElementById(selectElId) : selectElId;
                if (sel && /^[VJGE CP]/i.test(rawVal.trim())) {
                    sel.value = parsed.tipo;
                }
            }
            inputEl.value = parsed.numero;
        },

        // Búsqueda tolerante en colección de contribuyentes
        findMatch: function(contribuyentes, tipo, numero) {
            if (!Array.isArray(contribuyentes)) return null;
            const nBuscado = String(numero || '').replace(/\D/g, '');
            if (!nBuscado) return null;
            const tBuscado = String(tipo || '').toUpperCase().trim();

            // 1. Coincidencia exacta de tipo y número
            const exacto = contribuyentes.find(c => {
                if (!c || !c.rif) return false;
                const p = this.parse(c.rif);
                return p.tipo === tBuscado && p.numero === nBuscado;
            });
            if (exacto) return exacto;

            // 2. Coincidencia por número puro
            return contribuyentes.find(c => {
                if (!c || !c.rif) return false;
                const cNum = String(c.rif).replace(/\D/g, '');
                return cNum === nBuscado;
            });
        }
    };

    global.HaciendaRIF = RIFUtils;

    const Store = {
        _localStore: null,
        _cache: {},
        _syncQueue: Promise.resolve(),
        _lastNetworkCallTime: 0,

        init: async function() {
            if (typeof localforage !== 'undefined') {
                this._localStore = localforage.createInstance({
                    name: DB_NAME,
                    storeName: 'hacienda_entities'
                });
            } else {
                console.warn('[HaciendaStore] localforage no disponible, usando fallback en memoria');
            }

            // Precarga en memoria RAM para lecturas ultra rápidas a 0ms
            for (const table of TABLES) {
                let data = [];
                if (this._localStore) {
                    try {
                        data = (await this._localStore.getItem(`tbl_${table}`)) || [];
                    } catch (e) {
                        data = [];
                    }
                }
                this._cache[table] = Array.isArray(data) ? data : [];
            }

            // Sembrar cuentas recaudadoras por defecto si está vacío
            if (!this._cache['hacienda_cuentas'] || this._cache['hacienda_cuentas'].length === 0) {
                const cuentasIniciales = [
                    { id: 'cta_01', banco: 'Banco de Venezuela', numero: '0102-0544-21-0000012345', tipo: 'Corriente', concepto: 'Recaudación Tributaria SATRIMG', saldo_inicial: 0.00, saldo_actual: 0.00, estado: 'activa' },
                    { id: 'cta_02', banco: 'Banesco', numero: '0134-0371-82-0000098765', tipo: 'Corriente', concepto: 'Ingresos Propios e Impuestos Locales', saldo_inicial: 0.00, saldo_actual: 0.00, estado: 'activa' }
                ];
                this._cache['hacienda_cuentas'] = cuentasIniciales;
                if (this._localStore) {
                    await this._localStore.setItem('tbl_hacienda_cuentas', cuentasIniciales);
                }
            }

            // Sembrar ramos de recaudación si está vacío
            if (!this._cache['hacienda_ramos_ingreso'] || this._cache['hacienda_ramos_ingreso'].length === 0) {
                const ramosIniciales = [
                    { id: 'ramo_01', codigo: '3.01.02.01.00', nombre: 'Patente de Actividades Económicas (Comercio / Servicios)', descripcion: 'Impuesto sobre actividades económicas LOCAT', activo: true },
                    { id: 'ramo_02', codigo: '3.01.03.01.00', nombre: 'Aseo Urbano y Domiciliario', descripcion: 'Tasa de servicio de recolección de desechos sólidos', activo: true },
                    { id: 'ramo_03', codigo: '3.01.01.01.00', nombre: 'Impuesto sobre Inmuebles Urbanos (Derecho de Frente)', descripcion: 'Tributo inmobiliario y catastral', activo: true },
                    { id: 'ramo_04', codigo: '3.01.05.01.00', nombre: 'Patente de Vehículos', descripcion: 'Impuesto sobre vehículos comerciales y particulares', activo: true },
                    { id: 'ramo_05', codigo: '3.01.06.01.00', nombre: 'Tasas Administrativas y Certificaciones', descripcion: 'Solvencias, copias certificadas y trámites de taquilla', activo: true }
                ];
                this._cache['hacienda_ramos_ingreso'] = ramosIniciales;
                if (this._localStore) {
                    await this._localStore.setItem('tbl_hacienda_ramos_ingreso', ramosIniciales);
                }
            }

            console.log('[HaciendaStore] Inicializado a 0ms en LocalForage');
            this.syncPendingAll();
            return true;
        },

        // Lectura síncrona a 0ms desde la caché local
        get: function(table) {
            return this._cache[table] ? [...this._cache[table]] : [];
        },

        // Guardar o actualizar registro (Offline-First a 0ms)
        set: async function(table, record) {
            if (!TABLES.includes(table)) throw new Error('Tabla no autorizada: ' + table);
            if (!this._cache[table]) this._cache[table] = [];

            if (!record.id) {
                record.id = generateUUID();
            }

            const isUpdate = this._cache[table].some(r => String(r.id) === String(record.id));
            record._sync_pending = true;
            record.updated_at = new Date().toISOString();
            if (!record.created_at) record.created_at = record.updated_at;

            if (isUpdate) {
                const idx = this._cache[table].findIndex(r => String(r.id) === String(record.id));
                this._cache[table][idx] = { ...this._cache[table][idx], ...record };
            } else {
                this._cache[table].unshift(record);
            }

            // Persistir localmente a 0ms
            if (this._localStore) {
                await this._localStore.setItem(`tbl_${table}`, this._cache[table]);
            }

            // Notificar a la interfaz de inmediato
            this.notify(table, isUpdate ? 'update' : 'insert', record);

            // Sincronizar en segundo plano si hay red
            this.syncRecord(table, record);
            return record;
        },

        // Guardar lote de registros a 0ms
        setBatch: async function(table, records) {
            if (!TABLES.includes(table) || !Array.isArray(records) || records.length === 0) return [];
            if (!this._cache[table]) this._cache[table] = [];

            const processed = [];
            const now = new Date().toISOString();

            for (const item of records) {
                const rec = { ...item };
                if (!rec.id) rec.id = generateUUID();
                rec._sync_pending = true;
                rec.updated_at = now;
                if (!rec.created_at) rec.created_at = now;

                const idx = this._cache[table].findIndex(r => String(r.id) === String(rec.id));
                if (idx >= 0) {
                    this._cache[table][idx] = { ...this._cache[table][idx], ...rec };
                } else {
                    this._cache[table].unshift(rec);
                }
                processed.push(rec);
            }

            if (this._localStore) {
                await this._localStore.setItem(`tbl_${table}`, this._cache[table]);
            }

            this.notify(table, 'batch', processed);

            if (global.supabaseClient && navigator.onLine) {
                this.syncRecordsBatch(table, processed).catch(err => {
                    console.warn(`[HaciendaStore] Error en batch sync de ${table}:`, err);
                });
            }

            return processed;
        },

        // Eliminar registro
        remove: async function(table, id) {
            if (!this._cache[table]) return;
            this._cache[table] = this._cache[table].filter(r => String(r.id) !== String(id));

            if (this._localStore) {
                await this._localStore.setItem(`tbl_${table}`, this._cache[table]);
            }
            this.notify(table, 'delete', { id });

            if (global.supabaseClient && navigator.onLine) {
                try {
                    await global.supabaseClient.from(table).delete().eq('id', id);
                    if (typeof global.broadcastMutation === 'function') {
                        global.broadcastMutation(table, 'DELETE', { id });
                    }
                } catch (e) {
                    console.warn('[HaciendaStore] Error al borrar en Supabase:', e);
                }
            }
        },

        // Sanitizar según whitelist estricta
        _sanitize: function(table, record) {
            const schema = TABLE_SCHEMAS[table] || [];
            const clean = {};
            for (const key of schema) {
                if (record[key] !== undefined) {
                    clean[key] = record[key];
                }
            }
            return clean;
        },

        // Control de ráfagas (Throttling anti-429: máx 4.5 req/s)
        async _throttleCall() {
            const minInterval = 220; // 220ms
            const now = Date.now();
            const elapsed = now - this._lastNetworkCallTime;
            if (elapsed < minInterval) {
                await new Promise(r => setTimeout(r, minInterval - elapsed));
            }
            this._lastNetworkCallTime = Date.now();
        },

        // Enviar registro individual a Supabase
        syncRecord: async function(table, record) {
            if (!global.supabaseClient || !navigator.onLine) return;

            this._syncQueue = this._syncQueue.then(async () => {
                await this._throttleCall();
                const cleanRecord = this._sanitize(table, record);
                const upsertOptions = TABLE_ON_CONFLICT[table] ? { onConflict: TABLE_ON_CONFLICT[table] } : {};

                try {
                    const { data, error } = await global.supabaseClient.from(table).upsert(cleanRecord, upsertOptions).select();
                    if (!error) {
                        const saved = (data && data[0]) ? data[0] : cleanRecord;
                        const cached = this._cache[table].find(r => String(r.id) === String(record.id));
                        if (cached) {
                            delete cached._sync_pending;
                            if (this._localStore) {
                                await this._localStore.setItem(`tbl_${table}`, this._cache[table]);
                            }
                        }

                        // Broadcast a otras pestañas/dispositivos
                        if (typeof global.broadcastMutation === 'function') {
                            global.broadcastMutation(table, 'UPSERT', saved);
                        }
                    } else {
                        console.warn(`[HaciendaStore] Error al sincronizar ${table}:`, error.message);
                    }
                } catch (err) {
                    console.warn(`[HaciendaStore] Excepción de red en ${table}:`, err);
                }
            });

            return this._syncQueue;
        },

        // Sincronizar en lote
        syncRecordsBatch: async function(table, records) {
            if (!global.supabaseClient || !records || records.length === 0) return;
            const cleanArray = records.map(r => this._sanitize(table, r));
            const upsertOptions = TABLE_ON_CONFLICT[table] ? { onConflict: TABLE_ON_CONFLICT[table] } : {};

            try {
                const { data, error } = await global.supabaseClient.from(table).upsert(cleanArray, upsertOptions).select();
                if (!error) {
                    const savedRecords = data || cleanArray;
                    for (const saved of savedRecords) {
                        const cached = this._cache[table].find(r => String(r.id) === String(saved.id));
                        if (cached) {
                            delete cached._sync_pending;
                        }
                    }
                    if (this._localStore) {
                        await this._localStore.setItem(`tbl_${table}`, this._cache[table]);
                    }

                    if (typeof global.broadcastMutation === 'function') {
                        global.broadcastMutation(table, 'UPSERT_BATCH', { count: savedRecords.length });
                    }
                } else {
                    console.warn(`[HaciendaStore] Error en batch upsert para ${table}, reintentando uno a uno:`, error.message);
                    for (const r of records) {
                        this.syncRecord(table, r).catch(() => {});
                    }
                }
            } catch (err) {
                console.warn(`[HaciendaStore] Excepción en syncRecordsBatch para ${table}:`, err);
                for (const r of records) {
                    this.syncRecord(table, r).catch(() => {});
                }
            }
        },

        // Sincronizar todos los pendientes acumulados
        syncPendingAll: async function() {
            if (!global.supabaseClient || !navigator.onLine) return;
            for (const table of TABLES) {
                const pending = (this._cache[table] || []).filter(r => r._sync_pending);
                for (const item of pending) {
                    await this.syncRecord(table, item);
                }
            }
        },

        // Descarga fresca paginada (1000 en 1000) con fusión de pendientes
        downloadFreshFromSupabase: async function(table) {
            if (!global.supabaseClient || !navigator.onLine) return;
            try {
                const PAGE_SIZE = 1000;
                let allRemote = [];
                let page = 0;
                let keepFetching = true;

                while (keepFetching) {
                    const from = page * PAGE_SIZE;
                    const to = (page + 1) * PAGE_SIZE - 1;
                    const { data, error } = await global.supabaseClient.from(table).select('*').range(from, to);
                    if (error) {
                        console.warn(`[HaciendaStore] Error en página ${page} de ${table}:`, error.message);
                        break;
                    }
                    if (Array.isArray(data) && data.length > 0) {
                        allRemote = allRemote.concat(data);
                        if (data.length < PAGE_SIZE) {
                            keepFetching = false;
                        } else {
                            page++;
                        }
                    } else {
                        keepFetching = false;
                    }
                }

                if (Array.isArray(allRemote)) {
                    const localList = this._cache[table] || [];
                    const pendingMap = new Map();
                    for (const item of localList) {
                        if (item._sync_pending && item.id) {
                            pendingMap.set(String(item.id), item);
                        }
                    }

                    // Mergear respetando cambios locales pendientes
                    const merged = allRemote.map(rem => {
                        const remId = String(rem.id);
                        return pendingMap.has(remId) ? pendingMap.get(remId) : rem;
                    });

                    // Añadir pendientes que no existen aún en remoto
                    for (const [pendId, pendItem] of pendingMap.entries()) {
                        if (!merged.some(m => String(m.id) === pendId)) {
                            merged.unshift(pendItem);
                        }
                    }

                    this._cache[table] = merged;
                    if (this._localStore) {
                        await this._localStore.setItem(`tbl_${table}`, merged);
                    }

                    this.notify(table, 'refresh', { count: merged.length });
                }
            } catch (err) {
                console.warn(`[HaciendaStore] Error descargando ${table}:`, err);
            }
        },

        // Descargar todas las tablas en paralelo
        pullAll: async function() {
            if (!global.supabaseClient || !navigator.onLine) return;
            for (const table of TABLES) {
                await this.downloadFreshFromSupabase(table);
            }
        },

        // Notificación de reactividad a la vista
        notify: function(table, action, record) {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                const detail = { table, action, record, timestamp: Date.now() };
                window.dispatchEvent(new CustomEvent('hacienda-db-updated', { detail }));
                window.dispatchEvent(new CustomEvent('saccfag-db-updated', { detail }));
            }
        }
    };

    global.HaciendaStore = Store;
})(typeof window !== 'undefined' ? window : this);
