/**
 * ALCARAVAN — Forwarder de Compatibilidad: PopupsModule -> ComunicacionModule
 */
(function(global) {
    "use strict";
    if (global.ComunicacionModule) {
        global.PopupsModule = global.ComunicacionModule;
    }
})(typeof window !== 'undefined' ? window : this);
