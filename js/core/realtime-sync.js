/**
 * ALCARAVAN — Motor de Tiempo Real Multi-Dispositivo (Supabase Realtime)
 * Arquitectura SGB Silhouettes V3 (0ms Latencia, Broadcast + Postgres Changes)
 */
(function defineHaciendaRealtime(global) {
    "use strict";

    let channel = null;
    let debounceTimer = null;
    const pendingTables = new Set();

    const SYNCABLE_TABLES = new Set([
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
        'user_profiles'
    ]);

    function isPortal() {
        return typeof window !== 'undefined' && (
            window.HACIENDA_CONTEXT === 'portal' ||
            document.getElementById('portal-main-content') !== null ||
            (window.location && typeof window.location.pathname === 'string' && (window.location.pathname.endsWith('index.html') || (!window.location.pathname.includes('admin') && !window.location.pathname.includes('admin.html'))))
        );
    }

    function queueTableRefresh(table) {
        if (!table || !SYNCABLE_TABLES.has(table)) return;

        // En el portal público, bloquear recargas masivas de tablas privadas/administrativas
        if (isPortal()) {
            const PUBLIC_PORTAL_TABLES = new Set(['hacienda_popups', 'hacienda_carrusel']);
            if (!PUBLIC_PORTAL_TABLES.has(table)) {
                // Si el contribuyente tiene su sesión abierta, sincronizar solo sus registros de forma quirúrgica
                const activeC = global.PortalComercio && typeof global.PortalComercio.getActiveContribuyente === 'function'
                    ? global.PortalComercio.getActiveContribuyente()
                    : null;
                if (activeC && activeC.id) {
                    if (global.HaciendaStore && typeof global.HaciendaStore.syncContribuyenteSurgical === 'function') {
                        global.HaciendaStore.syncContribuyenteSurgical(activeC.id).catch(() => {});
                    }
                }
                return;
            }
        }

        pendingTables.add(table);

        // Tablas interconectadas que deben refrescar juntas
        if (table === 'hacienda_pagos') {
            pendingTables.add('hacienda_declaraciones');
            pendingTables.add('hacienda_solvencias');
        }
        if (table === 'hacienda_declaraciones') {
            pendingTables.add('hacienda_pagos');
            pendingTables.add('hacienda_solvencias');
        }
        if (table === 'hacienda_conciliacion_desglose') {
            pendingTables.add('hacienda_conciliacion');
            pendingTables.add('hacienda_pagos');
        }

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const tablesToFetch = Array.from(pendingTables);
            pendingTables.clear();

            for (const tbl of tablesToFetch) {
                if (global.HaciendaStore && typeof global.HaciendaStore.downloadFreshFromSupabase === 'function') {
                    try {
                        await global.HaciendaStore.downloadFreshFromSupabase(tbl);
                    } catch (e) {
                        console.warn(`[Hacienda Realtime] Error descargando ${tbl}:`, e);
                    }
                }
            }
        }, 250);
    }

    function initRealtime() {
        if (!global.supabaseClient || !navigator.onLine) return;
        if (channel) return;

        try {
            channel = global.supabaseClient.channel('hacienda-live-channel', {
                config: {
                    broadcast: { ack: false, self: false }
                }
            })
            // 1. Escuchar eventos broadcast directos entre dispositivos (<50ms)
            .on(
                'broadcast',
                { event: 'db_mutation' },
                (msg) => {
                    const payload = msg && msg.payload;
                    if (payload && payload.table) {
                        console.log(`[Hacienda Realtime Broadcast] Recibido ${payload.action || 'MUTATION'} en ${payload.table}`);
                        queueTableRefresh(payload.table);
                    }
                }
            )
            // 2. Escuchar cambios de PostgreSQL en Supabase
            .on(
                'postgres_changes',
                { event: '*', schema: 'public' },
                (payload) => {
                    const table = payload.table;
                    if (!SYNCABLE_TABLES.has(table)) return;

                    console.log(`[Hacienda Realtime] Evento recibido: ${payload.eventType} en ${table}`);
                    queueTableRefresh(table);
                }
            )
            .subscribe((status) => {
                console.log(`[Hacienda Realtime] Estado canal: ${status}`);
                actualizarBadge(status);
            });

        } catch (e) {
            console.warn('[Hacienda Realtime] Error iniciando canal:', e);
        }
    }

    function actualizarBadge(status) {
        const badge = document.getElementById('sync-status-badge');
        if (badge) {
            if (status === 'SUBSCRIBED') {
                badge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm';
                badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span><span>Supabase En Vivo</span>';
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                badge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5';
                badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span>Modo Local (0ms)</span>';
            }
        }
    }

    /**
     * Emite un broadcast rápido a los otros dispositivos suscritos
     */
    function broadcastMutation(table, action, record) {
        if (!channel || typeof channel.send !== 'function') return;
        try {
            channel.send({
                type: 'broadcast',
                event: 'db_mutation',
                payload: {
                    table: table,
                    action: action || 'UPDATE',
                    id: record ? record.id : undefined
                }
            });
        } catch (e) {
            // Ignorar silenciosamente si el canal no está listo
        }
    }

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('online', () => {
            if (channel) {
                try { global.supabaseClient.removeChannel(channel); } catch(_) {}
                channel = null;
            }
            initRealtime();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && (!channel || (channel.state && channel.state !== 'joined'))) {
                if (channel && global.supabaseClient) { 
                    try { global.supabaseClient.removeChannel(channel); } catch(_) {} 
                    channel = null; 
                }
                if (!isPortal()) {
                    ['hacienda_contribuyentes', 'hacienda_declaraciones', 'hacienda_pagos', 'hacienda_solvencias'].forEach(t => queueTableRefresh(t));
                }
                initRealtime();
            }
        });
    }

    global.broadcastMutation = broadcastMutation;
    global.HaciendaRealtime = {
        init: initRealtime,
        broadcastMutation: broadcastMutation,
        SYNCABLE_TABLES: SYNCABLE_TABLES
    };

})(typeof window !== 'undefined' ? window : this);
