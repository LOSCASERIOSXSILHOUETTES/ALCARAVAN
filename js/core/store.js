/**
 * GUIRIRI SISTEMA HACIENDA V3 — Motor de Persistencia y Sincronización SGB
 * Ciclo Inquebrantable de Datos a 0ms: Front -> LocalForage -> Supabase -> Realtime -> LocalForage
 */
(function defineHaciendaStore(global) {
    "use strict";

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
            'id', 'banco', 'numero', 'tipo', 'concepto', 'saldo_inicial', 'estado', 'created_at', 'updated_at'
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

    const Store = {
        _localStore: null,
        _cache: {},

        init: async function() {
            if (typeof localforage !== 'undefined') {
                this._localStore = localforage.createInstance({
                    name: 'HaciendaMunicipal_SGB',
                    storeName: 'hacienda_store'
                });
            }

            // Precarga en memoria RAM para lecturas ultra rápidas
            for (const table of TABLES) {
                let data = [];
                if (this._localStore) {
                    try {
                        data = (await this._localStore.getItem(table)) || [];
                    } catch (e) {
                        data = [];
                    }
                }
                this._cache[table] = Array.isArray(data) ? data : [];
            }

            // Sembrar cuentas recaudadoras por defecto si está vacío
            if (!this._cache['hacienda_cuentas'] || this._cache['hacienda_cuentas'].length === 0) {
                const cuentasIniciales = [
                    { id: 1, banco: 'Banco de Venezuela', numero: '0102-0544-21-0000012345', tipo: 'Corriente', concepto: 'Recaudación Tributaria SATRIMG', saldo_inicial: 0.00, estado: 'activa' },
                    { id: 2, banco: 'Banesco', numero: '0134-0371-82-0000098765', tipo: 'Corriente', concepto: 'Ingresos Propios e Impuestos Locales', saldo_inicial: 0.00, estado: 'activa' }
                ];
                this._cache['hacienda_cuentas'] = cuentasIniciales;
                if (this._localStore) {
                    await this._localStore.setItem('hacienda_cuentas', cuentasIniciales);
                }
            }

            // Sembrar ramos de recaudación si está vacío
            if (!this._cache['hacienda_ramos_ingreso'] || this._cache['hacienda_ramos_ingreso'].length === 0) {
                const ramosIniciales = [
                    { id: 1, codigo: '3.01.02.01.00', nombre: 'Patente de Actividades Económicas (Comercio / Servicios)', descripcion: 'Impuesto sobre actividades económicas LOCAT' },
                    { id: 2, codigo: '3.01.03.01.00', nombre: 'Aseo Urbano y Domiciliario', descripcion: 'Tasa de servicio de recolección de desechos sólidos' },
                    { id: 3, codigo: '3.01.01.01.00', nombre: 'Impuesto sobre Inmuebles Urbanos (Derecho de Frente)', descripcion: 'Tributo inmobiliario y catastral' },
                    { id: 4, codigo: '3.01.05.01.00', nombre: 'Patente de Vehículos', descripcion: 'Impuesto sobre vehículos comerciales y particulares' },
                    { id: 5, codigo: '3.01.06.01.00', nombre: 'Tasas Administrativas y Certificaciones', descripcion: 'Solvencias, copias certificadas y trámites de taquilla' }
                ];
                this._cache['hacienda_ramos_ingreso'] = ramosIniciales;
                if (this._localStore) {
                    await this._localStore.setItem('hacienda_ramos_ingreso', ramosIniciales);
                }
            }

            console.log('[HaciendaStore] Inicializado a 0ms en LocalForage');

            console.log('[HaciendaStore] Inicializado a 0ms en LocalForage');
            this.initRealtime();
            this.syncPending();
            return true;
        },

        // Lectura síncrona a 0ms desde la caché local
        get: function(table) {
            return this._cache[table] ? [...this._cache[table]] : [];
        },

        // Guardar registro (Offline-First a 0ms)
        set: async function(table, record) {
            if (!TABLES.includes(table)) throw new Error('Tabla no autorizada: ' + table);
            if (!this._cache[table]) this._cache[table] = [];

            const isUpdate = record.id && this._cache[table].some(r => String(r.id) === String(record.id));
            if (!record.id) {
                record.id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
                    ? crypto.randomUUID()
                    : ('c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8));
            }

            record._sync_pending = true;
            record.updated_at = new Date().toISOString();
            if (!record.created_at) record.created_at = record.updated_at;

            if (isUpdate) {
                const idx = this._cache[table].findIndex(r => String(r.id) === String(record.id));
                this._cache[table][idx] = { ...this._cache[table][idx], ...record };
            } else {
                this._cache[table].push(record);
            }

            // Persistir localmente de inmediato
            if (this._localStore) {
                await this._localStore.setItem(table, this._cache[table]);
            }

            // Notificar a la interfaz a 0ms
            this.notify();

            // Sincronizar en segundo plano si hay red
            this._pushToSupabase(table, record);
            return record;
        },

        // Limpiar registro en local y remoto
        remove: async function(table, id) {
            if (!this._cache[table]) return;
            this._cache[table] = this._cache[table].filter(r => String(r.id) !== String(id));

            if (this._localStore) {
                await this._localStore.setItem(table, this._cache[table]);
            }
            this.notify();

            if (global.supabaseClient && navigator.onLine) {
                try {
                    await global.supabaseClient.from(table).delete().eq('id', id);
                } catch (e) {
                    console.warn('[HaciendaStore] Error al borrar en Supabase:', e);
                }
            }
        },

        // Filtrar campos según esquema para no enviar campos inventados a Supabase
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

        // Empujar a Supabase
        _pushToSupabase: async function(table, record) {
            if (!global.supabaseClient || !navigator.onLine) return;

            const cleanRecord = this._sanitize(table, record);
            const onConflict = TABLE_ON_CONFLICT[table] ? { onConflict: TABLE_ON_CONFLICT[table] } : undefined;

            try {
                const { error } = await global.supabaseClient.from(table).upsert(cleanRecord, onConflict);
                if (!error) {
                    // Quitar bandera _sync_pending
                    const cached = this._cache[table].find(r => String(r.id) === String(record.id));
                    if (cached) {
                        delete cached._sync_pending;
                        if (this._localStore) {
                            await this._localStore.setItem(table, this._cache[table]);
                        }
                    }
                } else {
                    console.warn('[HaciendaStore] Error de sincronización:', error.message);
                }
            } catch (err) {
                console.warn('[HaciendaStore] Error de red en sincronización:', err);
            }
        },

        // Sincronizar pendientes acumulados
        syncPending: async function() {
            if (!global.supabaseClient || !navigator.onLine) return;
            for (const table of TABLES) {
                const pending = (this._cache[table] || []).filter(r => r._sync_pending);
                for (const item of pending) {
                    await this._pushToSupabase(table, item);
                }
            }
        },

        // Descarga inicial / Re-sync desde Supabase
        pullAll: async function() {
            if (!global.supabaseClient || !navigator.onLine) return;
            for (const table of TABLES) {
                try {
                    const { data, error } = await global.supabaseClient.from(table).select('*');
                    if (!error && Array.isArray(data)) {
                        this._cache[table] = data;
                        if (this._localStore) {
                            await this._localStore.setItem(table, data);
                        }
                    }
                } catch (e) {}
            }
            this.notify();
        },

        // Notificación de reactividad a la vista
        notify: function() {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('hacienda-db-updated'));
            }
        },

        // Realtime Multi-Dispositivo
        initRealtime: function() {
            if (!global.supabaseClient) return;
            try {
                const channel = global.supabaseClient.channel('hacienda-realtime-all');
                for (const table of TABLES) {
                    channel.on('postgres_changes', { event: '*', schema: 'public', table: table }, async (payload) => {
                        const { eventType, new: newRec, old: oldRec } = payload;
                        if (!this._cache[table]) this._cache[table] = [];

                        if (eventType === 'INSERT' || eventType === 'UPDATE') {
                            const idx = this._cache[table].findIndex(r => String(r.id) === String(newRec.id));
                            if (idx >= 0) {
                                this._cache[table][idx] = newRec;
                            } else {
                                this._cache[table].push(newRec);
                            }
                        } else if (eventType === 'DELETE' && oldRec?.id) {
                            this._cache[table] = this._cache[table].filter(r => String(r.id) !== String(oldRec.id));
                        }

                        if (this._localStore) {
                            await this._localStore.setItem(table, this._cache[table]);
                        }
                        this.notify();
                    });
                }
                channel.subscribe();
            } catch (err) {
                console.warn('[HaciendaStore] Error al suscribir Realtime:', err);
            }
        }
    };

    global.HaciendaStore = Store;
})(typeof window !== 'undefined' ? window : this);
