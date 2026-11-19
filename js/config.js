/**
-- ============================================================================
-- GUIRIRI SISTEMA HACIENDA V3 — Configuración Centralizada
-- Arquitectura SGB Silhouettes (0ms Latencia, Offline-First)
-- ============================================================================
*/
(function defineHaciendaConfig(global) {
    "use strict";

    var DEFAULT_URL = "https://ixkhrgxnmvfoteifkrko.supabase.co";
    var DEFAULT_ANON_KEY = "sb_publishable_fQjxtJ_edbl3u52Ky8P8ig_JXxlBuLQ";
    var DEFAULT_IMGBB_KEY = "d6e8b23c91a0c8b2a1a8c5e6f3b2d1c0"; // Fallback demo key

    global.HACIENDA_CONFIG = Object.freeze({
        APP_NAME: "Hacienda Municipal SGB",
        VERSION: "1.0.0",
        SUPABASE_URL: DEFAULT_URL,
        SUPABASE_ANON_KEY: DEFAULT_ANON_KEY,
        IMGBB_API_KEY: DEFAULT_IMGBB_KEY,
        // Configuración de la Ley Orgánica de Armonización Tributaria (LOCAT)
        LOCAT: {
            MONEDA_MAYOR_VALOR: "EUR", // O USD según fijación BCV
            TASA_BCV_DEFAULT: 56.50, // Bs por unidad monetaria de mayor valor
            DIAS_VENCIMIENTO_DECLARACION: 15 // Del 1 al 15 de cada mes
        }
    });

    // Conectividad
    global._haciendaOnline = (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') ? navigator.onLine : true;
})(typeof window !== 'undefined' ? window : this);
