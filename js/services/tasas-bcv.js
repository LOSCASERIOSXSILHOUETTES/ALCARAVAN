/**
 * ALCARAVAN — Servicio Oficial de Tasas de Cambio BCV en Tiempo Real
 * Consulta la API pública del BCV / DolarApi con fallback local y caché persistente.
 * Provee la Tasa de la Moneda de Mayor Valor (TCMMV - Art. 30 LOCAT).
 */
(function defineTasasBCV(global) {
    "use strict";

    const STORAGE_KEY = "alcaravan_tasas_bcv_cache";

    // Valores de contingencia por si no hay conexión a internet
    const DEFAULT_TASAS = {
        usd: 917.78,
        eur: 1007.40,
        tcmmv: 1007.40, // Euro como moneda de mayor valor
        cny: 126.76,    // Yuan Chino aprox
        jpy: 5.94,      // Yen Japonés aprox
        rub: 9.16,      // Rublo Ruso aprox
        try: 26.60,     // Lira Turca aprox
        ptr: 60.00,
        fecha: new Date().toISOString(),
        fechaFormateada: new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }),
        cargadoEnVivo: false
    };

    let estadoActual = { ...DEFAULT_TASAS };

    // Intentar recuperar de caché local de inmediato
    try {
        const cache = localStorage.getItem(STORAGE_KEY);
        if (cache) {
            const parsed = JSON.parse(cache);
            if (parsed && parsed.usd && parsed.eur) {
                estadoActual = { ...parsed, cargadoEnVivo: false };
            }
        }
    } catch (e) {
        console.warn("[TasasBCV] Error leyendo caché local:", e);
    }

    const TasasBCV = {
        getTasas: function() {
            return { ...estadoActual };
        },

        getTCMMV: function() {
            return estadoActual.tcmmv || estadoActual.eur || DEFAULT_TASAS.tcmmv;
        },

        formatBs: function(val, decimales = 2) {
            const num = Number(val || 0);
            return num.toLocaleString('es-VE', {
                minimumFractionDigits: decimales,
                maximumFractionDigits: decimales
            });
        },

        fetchEnVivo: async function() {
            try {
                const [resUsd, resEur] = await Promise.all([
                    fetch("https://ve.dolarapi.com/v1/dolares", { cache: "no-store" }).then(r => r.json()),
                    fetch("https://ve.dolarapi.com/v1/euros", { cache: "no-store" }).then(r => r.json())
                ]);

                if (!Array.isArray(resUsd) || !Array.isArray(resEur)) {
                    throw new Error("Respuesta inválida de la API");
                }

                const usdOficial = resUsd.find(d => d.fuente === "oficial") || resUsd[0];
                const eurOficial = resEur.find(d => d.fuente === "oficial") || resEur[0];

                const usd = Number(usdOficial?.promedio || DEFAULT_TASAS.usd);
                const eur = Number(eurOficial?.promedio || DEFAULT_TASAS.eur);
                // Art. 30 LOCAT: La moneda de mayor valor publicada por el BCV
                const tcmmv = Math.max(usd, eur);

                // Relaciones cambiarias internacionales aproximadas contra USD
                const cny = Number((usd / 7.24).toFixed(2));
                const jpy = Number((usd / 154.5).toFixed(2));
                const rub = Number((usd / 100.2).toFixed(2));
                const tryRate = Number((usd / 34.5).toFixed(2));

                const rawFecha = usdOficial?.fechaActualizacion || new Date().toISOString();
                const fechaObj = new Date(rawFecha);
                const fechaFormateada = !isNaN(fechaObj.getTime())
                    ? fechaObj.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
                    : DEFAULT_TASAS.fechaFormateada;

                estadoActual = {
                    usd,
                    eur,
                    tcmmv,
                    cny,
                    jpy,
                    rub,
                    try: tryRate,
                    ptr: 60.00,
                    fecha: rawFecha,
                    fechaFormateada,
                    cargadoEnVivo: true
                };

                // Guardar en caché persistente
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoActual));
                } catch (e) {
                    console.warn("[TasasBCV] Error guardando caché:", e);
                }

                // Notificar reactivamente a la UI
                this.actualizarDOM();
                window.dispatchEvent(new CustomEvent('tasas-bcv-updated', { detail: estadoActual }));

                return estadoActual;
            } catch (err) {
                console.warn("[TasasBCV] Modo contingencia / offline activo:", err.message);
                this.actualizarDOM();
                return estadoActual;
            }
        },

        actualizarDOM: function() {
            const elements = document.querySelectorAll('[data-tasa]');
            elements.forEach(el => {
                const tipo = el.getAttribute('data-tasa');
                if (tipo === 'tcmmv') {
                    el.textContent = this.formatBs(estadoActual.tcmmv) + ' Bs.';
                } else if (tipo === 'usd') {
                    el.textContent = this.formatBs(estadoActual.usd) + ' Bs.';
                } else if (tipo === 'eur') {
                    el.textContent = this.formatBs(estadoActual.eur) + ' Bs.';
                } else if (tipo === 'cny') {
                    el.textContent = this.formatBs(estadoActual.cny) + ' Bs.';
                } else if (tipo === 'jpy') {
                    el.textContent = this.formatBs(estadoActual.jpy) + ' Bs.';
                } else if (tipo === 'rub') {
                    el.textContent = this.formatBs(estadoActual.rub) + ' Bs.';
                } else if (tipo === 'try') {
                    el.textContent = this.formatBs(estadoActual.try) + ' Bs.';
                } else if (tipo === 'fecha') {
                    el.textContent = estadoActual.fechaFormateada;
                }
            });
        },

        init: function() {
            // Actualizar DOM con caché de inmediato
            this.actualizarDOM();
            // Disparar consulta en vivo
            this.fetchEnVivo();
        }
    };

    global.TasasBCV = TasasBCV;

})(typeof window !== 'undefined' ? window : this);
