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
        'hacienda_publicidad',
        'hacienda_popups',
        'hacienda_carrusel',
        'user_profiles',
        'hacienda_actividades_locat',
        'hacienda_metodos_pago'
    ];

    const TABLE_SCHEMAS = {
        'hacienda_contribuyentes': [
            'id', 'rif', 'razon_social', 'denominacion_comercial', 'tipo_persona',
            'correo', 'telefono', 'direccion_fiscal', 'representante_legal',
            'representante_cedula', 'acta_constitutiva_url', 'fotos_local',
            'estado', 'clave', 'created_at', 'updated_at'
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
            'monto_bs', 'comprobante_url', 'metodo', 'cuenta_id', 'metodo_pago_id',
            'estado', 'verificado_por', 'fecha_verificacion', 'created_at', 'updated_at'
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
        ],
        'hacienda_popups': [
            'id', 'titulo', 'mensaje', 'tipo', 'imagen_url', 'enlace_url', 'destino', 'activo', 'created_at', 'updated_at'
        ],
        'hacienda_carrusel': [
            'id', 'tag', 'titulo', 'descripcion', 'btn_texto', 'btn_icono', 'btn_enlace',
            'badge_bg', 'gradient', 'icon', 'imagen_url', 'activo', 'orden', 'created_at', 'updated_at'
        ],
        'user_profiles': [
            'user_id', 'email', 'nombre', 'cargo', 'rol', 'permisos', 'activo', 'created_at', 'updated_at'
        ],
        'hacienda_actividades_locat': [
            'id', 'codigo', 'categoria', 'nombre', 'alicuota', 'minimo_tcmmv', 'activo', 'created_at', 'updated_at'
        ],
        'hacienda_metodos_pago': [
            'id', 'cuenta_id', 'tipo', 'nombre', 'banco', 'telefono', 'identificacion', 'titular', 'instrucciones', 'activo', 'orden', 'created_at', 'updated_at'
        ]
    };

    const TABLE_ON_CONFLICT = {
        'hacienda_declaraciones': 'contribuyente_id,patente_id,anio,mes',
        'user_profiles': 'user_id'
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

    // Normalizador y validador universal de Cédulas de Identidad
    const CEDULA_TIPOS = [
        { code: 'V', label: 'V - Venezolano' },
        { code: 'E', label: 'E - Extranjero' },
        { code: 'P', label: 'P - Pasaporte' }
    ];

    const CedulaUtils = {
        TIPOS: CEDULA_TIPOS,

        parse: function(input) {
            if (!input) return { tipo: 'V', numero: '', full: '' };
            let str = String(input).trim().toUpperCase();
            let tipo = 'V';

            const m = str.match(/^([VEP])[-_\s]*(.*)$/i);
            if (m) {
                tipo = m[1].toUpperCase();
                str = m[2];
            }
            const numero = str.replace(/\D/g, '');
            const validTipo = ['V', 'E', 'P'].includes(tipo) ? tipo : 'V';
            return {
                tipo: validTipo,
                numero: numero,
                full: numero ? `${validTipo}-${numero}` : ''
            };
        },

        format: function(tipo, numero) {
            const parsed = this.parse((tipo ? (tipo + '-') : '') + (numero || ''));
            return parsed.full;
        },

        handleInput: function(inputEl, selectElId) {
            if (!inputEl) return;
            const rawVal = inputEl.value;
            const parsed = this.parse(rawVal);

            if (selectElId) {
                const sel = typeof selectElId === 'string' ? document.getElementById(selectElId) : selectElId;
                if (sel && /^[VEP]/i.test(rawVal.trim())) {
                    sel.value = parsed.tipo;
                }
            }
            inputEl.value = parsed.numero;
        }
    };

    global.HaciendaCedula = CedulaUtils;

    // Sanitizador y validador universal de Teléfonos
    const TelefonoUtils = {
        sanitizar: function(input) {
            return String(input || '').replace(/\D/g, '').trim();
        },

        handleInput: function(inputEl) {
            if (!inputEl) return;
            inputEl.value = inputEl.value.replace(/\D/g, '');
        }
    };

    global.HaciendaTelefono = TelefonoUtils;

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

            // Purgar de memoria y LocalForage cualquier cuenta bancaria mockeada residual de prueba
            const mockCuentasIds = new Set(['cta_01', 'cta_02']);
            const mockCuentasNums = new Set(['01020544210000012345', '01340371820000098765']);
            if (Array.isArray(this._cache['hacienda_cuentas'])) {
                const cuentasLimpias = this._cache['hacienda_cuentas'].filter(c => {
                    const cleanNum = String(c.numero || '').replace(/\D/g, '');
                    return !mockCuentasIds.has(String(c.id)) && !mockCuentasNums.has(cleanNum);
                });
                if (cuentasLimpias.length !== this._cache['hacienda_cuentas'].length) {
                    this._cache['hacienda_cuentas'] = cuentasLimpias;
                    if (this._localStore) {
                        await this._localStore.setItem('tbl_hacienda_cuentas', cuentasLimpias);
                    }
                }
            }

            // Purgar de memoria y LocalForage cualquier método de pago mockeado residual
            const mockMetodosIds = new Set(['met_pm_bdv', 'met_tr_bdv', 'met_tr_banesco', 'met_pos_taquilla']);
            if (Array.isArray(this._cache['hacienda_metodos_pago'])) {
                const metodosLimpios = this._cache['hacienda_metodos_pago'].filter(m => {
                    return !mockMetodosIds.has(String(m.id)) && !mockCuentasIds.has(String(m.cuenta_id));
                });
                if (metodosLimpios.length !== this._cache['hacienda_metodos_pago'].length) {
                    this._cache['hacienda_metodos_pago'] = metodosLimpios;
                    if (this._localStore) {
                        await this._localStore.setItem('tbl_hacienda_metodos_pago', metodosLimpios);
                    }
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

            // Sembrar popup oficial inicial si está vacío
            if (!this._cache['hacienda_popups'] || this._cache['hacienda_popups'].length === 0) {
                const popupsIniciales = [
                    {
                        id: 'pop_guaribe_locat_01',
                        titulo: 'Censo y Empadronamiento Tributario LOCAT 2026',
                        mensaje: 'La Alcaldía del Municipio San José de Guaribe y la Administración Tributaria Municipal informan que se encuentra abierta la jornada especial de censo y adecuación de licencias comerciales. Ponte al día con tu municipio sin sanciones.',
                        tipo: 'mixto',
                        imagen_url: '',
                        enlace_url: '#seccion-ordenanzas',
                        destino: 'portal',
                        activo: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ];
                this._cache['hacienda_popups'] = popupsIniciales;
                if (this._localStore) {
                    await this._localStore.setItem('tbl_hacienda_popups', popupsIniciales);
                }
            }

            // Sembrar Superadmin inicial en user_profiles si está vacío
            if (!this._cache['user_profiles'] || this._cache['user_profiles'].length === 0) {
                const superAdmin = {
                    user_id: 'usr_superadmin_satrimg_001',
                    email: 'systemsatrimg@gmail.com',
                    nombre: 'Administrador General SATRIMG',
                    cargo: 'Superintendente Tributario Municipal',
                    rol: 'admin',
                    permisos: {
                        admin: true,
                        admin_todo: true,
                        admin_usuarios: true
                    },
                    activo: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                this._cache['user_profiles'] = [superAdmin];
                if (this._localStore) {
                    await this._localStore.setItem('tbl_user_profiles', [superAdmin]);
                }
            }

            // Sembrar catálogo de actividades LOCAT si está vacío
            if (!this._cache['hacienda_actividades_locat'] || this._cache['hacienda_actividades_locat'].length === 0) {
                const locatMod = (typeof window !== 'undefined' && window.CatalogoLocat) || global.CatalogoLocat;
                if (locatMod && Array.isArray(locatMod.SEEDS)) {
                    await this.sembrarActividadesLocat(locatMod.SEEDS);
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

        getTableSync: function(table) {
            return this.get(table);
        },

        sembrarActividadesLocat: async function(semillas) {
            if (!semillas || !Array.isArray(semillas) || semillas.length === 0) return;
            if (this._cache['hacienda_actividades_locat'] && this._cache['hacienda_actividades_locat'].length > 0) {
                return;
            }
            const ahora = new Date().toISOString();
            const actividadesIniciales = semillas.map(s => ({
                id: s.id || ('locat_' + String(s.codigo).toLowerCase().replace(/[^a-z0-9]/g, '_')),
                codigo: s.codigo,
                categoria: s.categoria,
                nombre: s.nombre,
                alicuota: Number(s.alicuota) || 0.0100,
                minimo_tcmmv: Number(s.minimo_tcmmv) || 0.30,
                activo: s.activo !== false,
                created_at: s.created_at || ahora,
                updated_at: s.updated_at || ahora
            }));
            this._cache['hacienda_actividades_locat'] = actividadesIniciales;
            if (this._localStore) {
                try {
                    await this._localStore.setItem('tbl_hacienda_actividades_locat', actividadesIniciales);
                } catch (e) {}
            }
            if (typeof window !== 'undefined' && window.supabaseClient && navigator.onLine) {
                this.syncRecordsBatch('hacienda_actividades_locat', actividadesIniciales).catch(() => {});
            }
        },

        // Guardar o actualizar registro (Offline-First a 0ms)
        set: async function(table, record) {
            if (!TABLES.includes(table)) throw new Error('Tabla no autorizada: ' + table);
            if (!this._cache[table]) this._cache[table] = [];

            const pkCol = (table === 'user_profiles') ? 'user_id' : 'id';
            if (table === 'user_profiles') {
                if (!record.user_id && !record.id) record.user_id = generateUUID();
                record.user_id = record.user_id || record.id;
                record.id = record.user_id;
            } else if (!record.id) {
                record.id = generateUUID();
            }

            const recId = record[pkCol] || record.id;
            const isUpdate = this._cache[table].some(r => String(r[pkCol] || r.id) === String(recId));
            record._sync_pending = true;
            record.updated_at = new Date().toISOString();
            if (!record.created_at) record.created_at = record.updated_at;

            if (isUpdate) {
                const idx = this._cache[table].findIndex(r => String(r[pkCol] || r.id) === String(recId));
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

        upsert: function(table, record) {
            return this.set(table, record);
        },

        insert: function(table, record) {
            return this.set(table, record);
        },

        update: function(table, record) {
            return this.set(table, record);
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
            const pkCol = (table === 'user_profiles') ? 'user_id' : 'id';
            this._cache[table] = this._cache[table].filter(r => String(r[pkCol] || r.id) !== String(id));

            if (this._localStore) {
                await this._localStore.setItem(`tbl_${table}`, this._cache[table]);
            }
            this.notify(table, 'delete', { [pkCol]: id, id });

            if (global.supabaseClient && navigator.onLine) {
                try {
                    await global.supabaseClient.from(table).delete().eq(pkCol, id);
                    if (typeof global.broadcastMutation === 'function') {
                        global.broadcastMutation(table, 'DELETE', { [pkCol]: id, id });
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
                        const pkCol = (table === 'user_profiles') ? 'user_id' : 'id';
                        const recId = record[pkCol] || record.id;
                        const cached = this._cache[table].find(r => String(r[pkCol] || r.id) === String(recId));
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

        // Detectar si el contexto actual es el Portal Público del Contribuyente
        isPortal: function() {
            return typeof window !== 'undefined' && (
                window.HACIENDA_CONTEXT === 'portal' ||
                document.getElementById('portal-main-content') !== null ||
                (window.location && typeof window.location.pathname === 'string' && (window.location.pathname.endsWith('index.html') || (!window.location.pathname.includes('admin') && !window.location.pathname.includes('admin.html'))))
            );
        },

        // Descarga fresca paginada (1000 en 1000) con fusión de pendientes
        downloadFreshFromSupabase: async function(table) {
            if (!global.supabaseClient || !navigator.onLine) return;
            // En el portal público, bloquear descargas masivas de tablas privadas/administrativas
            if (this.isPortal()) {
                const PUBLIC_PORTAL_TABLES = ['hacienda_popups', 'hacienda_carrusel', 'hacienda_actividades_locat', 'hacienda_cuentas', 'hacienda_metodos_pago'];
                if (!PUBLIC_PORTAL_TABLES.includes(table)) {
                    return;
                }
            }
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

        // Sincronización quirúrgica: descarga ÚNICAMENTE los registros de un contribuyente específico
        syncContribuyenteSurgical: async function(contribuyenteId) {
            if (!global.supabaseClient || !navigator.onLine || !contribuyenteId) return;
            const tablesToSync = [
                'hacienda_declaraciones',
                'hacienda_pagos',
                'hacienda_solvencias',
                'hacienda_patentes',
                'hacienda_inmuebles',
                'hacienda_vehiculos',
                'hacienda_publicidad'
            ];
            for (const tbl of tablesToSync) {
                try {
                    const { data, error } = await global.supabaseClient
                        .from(tbl)
                        .select('*')
                        .eq('contribuyente_id', contribuyenteId);
                    if (!error && Array.isArray(data)) {
                        const current = this._cache[tbl] || [];
                        const otherRecords = current.filter(r => String(r.contribuyente_id) !== String(contribuyenteId));
                        const merged = otherRecords.concat(data);
                        this._cache[tbl] = merged;
                        if (this._localStore) {
                            await this._localStore.setItem(`tbl_${tbl}`, merged);
                        }
                        this.notify(tbl, 'refresh', { count: data.length });
                    }
                } catch (e) {
                    console.warn(`[HaciendaStore] Error en sincronización quirúrgica de ${tbl}:`, e);
                }
            }
        },

        // Búsqueda remota puntual quirúrgica de un contribuyente por RIF o Correo
        fetchSingleContribuyente: async function(params) {
            if (!global.supabaseClient || !navigator.onLine || !params) return null;
            try {
                let query = global.supabaseClient.from('hacienda_contribuyentes').select('*');
                if (params.correo) {
                    query = query.ilike('correo', String(params.correo).trim());
                } else if (params.rif) {
                    const cleanRif = String(params.rif).trim();
                    const numOnly = cleanRif.replace(/\D/g, '');
                    if (numOnly) {
                        query = query.or(`rif.eq.${cleanRif},rif.ilike.%${numOnly}%`);
                    } else {
                        query = query.eq('rif', cleanRif);
                    }
                } else {
                    return null;
                }

                const { data, error } = await query.limit(1);
                if (!error && Array.isArray(data) && data.length > 0) {
                    const c = data[0];
                    const list = this._cache['hacienda_contribuyentes'] || [];
                    const filtered = list.filter(item => String(item.id) !== String(c.id));
                    filtered.push(c);
                    this._cache['hacienda_contribuyentes'] = filtered;
                    if (this._localStore) {
                        await this._localStore.setItem('tbl_hacienda_contribuyentes', filtered);
                    }
                    return c;
                }
            } catch (err) {
                console.warn('[HaciendaStore] Error en fetchSingleContribuyente:', err);
            }
            return null;
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
