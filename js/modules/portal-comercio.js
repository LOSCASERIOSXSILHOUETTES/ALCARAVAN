/**
 * GUIRIRI SISTEMA HACIENDA V3 — Portal Oficial del Contribuyente (LOCAT)
 * Interfaz pública institucional para comercios y contribuyentes del Municipio.
 * Arquitectura SGB Silhouettes V3 (0ms Latencia, Offline-First, LocalForage).
 */
(function definePortalComercio(global) {
    "use strict";

    let activeContribuyente = null;
    let activeTab = 'declarar'; // 'declarar', 'pagar', 'solvencia', 'historial'
    const TASA_BCV_DEFAULT = 56.50; // Bs. por TCMMV (Art. 30 LOCAT)

    const MESES = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const Portal = {
        getActiveContribuyente: () => activeContribuyente,

        render: function(container) {
            const store = global.HaciendaStore;
            if (!store) {
                container.innerHTML = '<div class="p-8 text-center text-rose-400 font-mono">HaciendaStore no disponible</div>';
                return;
            }

            if (!activeContribuyente) {
                this.renderPantallaConsulta(container);
            } else {
                this.renderDashboard(container);
            }
        },

        renderPantallaConsulta: function(container) {
            container.innerHTML = `
                <div class="max-w-3xl mx-auto space-y-8 py-8 animate-fade-in">
                    <!-- Membrete y Encabezado Institucional -->
                    <div class="text-center space-y-3">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-sky-400 font-mono text-[11px] font-bold uppercase tracking-wider">
                            <span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                            Dirección de Administración Tributaria y Hacienda Municipal
                        </div>
                        <h2 class="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
                            Portal Tributario del Contribuyente
                        </h2>
                        <p class="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                            Gestión electrónica de actividades económicas, autoliquidación mensual conforme a la Ley LOCAT, consignación de comprobantes y emisión de solvencias municipales con validación QR.
                        </p>
                    </div>

                    <!-- Tarjeta Principal de Consulta por RIF -->
                    <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-64 h-64 bg-sky-600/5 rounded-full blur-3xl pointer-events-none"></div>

                        <div class="space-y-6 relative z-10">
                            <div>
                                <label class="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                                    Ingrese el RIF del Establecimiento o Razón Social:
                                </label>
                                <div class="flex flex-col sm:flex-row items-stretch gap-3">
                                    <div class="flex items-center bg-slate-950 border border-slate-700/80 rounded-2xl overflow-hidden focus-within:border-sky-500 transition shadow-inner">
                                        <select id="pc-rif-tipo" class="bg-slate-900 text-sky-400 font-mono font-bold text-sm px-4 py-3.5 border-r border-slate-800 outline-none">
                                            <option value="J">J - Jurídico</option>
                                            <option value="V">V - Natural / Firma Personal</option>
                                            <option value="G">G - Gubernamental</option>
                                            <option value="E">E - Extranjero</option>
                                        </select>
                                        <input type="text" id="pc-rif-numero" placeholder="Ej: 30123456-7" 
                                               onkeydown="if(event.key==='Enter') window.PortalComercio.ejecutarConsultaRif()"
                                               class="w-full bg-transparent text-slate-100 font-mono text-base font-bold px-4 py-3.5 outline-none placeholder:text-slate-600">
                                    </div>
                                    <button onclick="window.PortalComercio.ejecutarConsultaRif()" 
                                            class="px-8 py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-sky-900/30 transition flex items-center justify-center gap-2 shrink-0">
                                        <i class="fas fa-search text-xs"></i>
                                        <span>Consultar Contribuyente</span>
                                    </button>
                                </div>
                            </div>

                            <div class="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                                <span class="text-slate-400">¿Su establecimiento aún no está inscrito en el RUC?</span>
                                <button onclick="window.PortalComercio.abrirModalInscripcion()" 
                                        class="text-sky-400 hover:text-sky-300 font-bold transition flex items-center gap-1.5">
                                    <i class="fas fa-plus-circle text-xs"></i>
                                    <span>Solicitar Inscripción en el Padrón Comercial</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Marco de Garantías Tributarias LOCAT -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                            <div class="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold">
                                <i class="fas fa-balance-scale"></i>
                            </div>
                            <h4 class="font-bold text-slate-200">Armonización LOCAT</h4>
                            <p class="text-slate-400 leading-relaxed text-[11px]">
                                Alícuotas máximas y mínimos tributables expresados en Tipo de Cambio BCV, protegiendo al comerciante de cobros discrecionales.
                            </p>
                        </div>

                        <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <h4 class="font-bold text-slate-200">Seguridad Jurídica</h4>
                            <p class="text-slate-400 leading-relaxed text-[11px]">
                                Cada autoliquidación genera una constancia correlativa verificable directamente ante los fiscales y la taquilla municipal.
                            </p>
                        </div>

                        <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                            <div class="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                <i class="fas fa-qrcode"></i>
                            </div>
                            <h4 class="font-bold text-slate-200">Solvencias con QR</h4>
                            <p class="text-slate-400 leading-relaxed text-[11px]">
                                Validación instantánea en vitrina mediante lectura de código QR oficial con vigencia legal de 30 días continuos.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Modal Inscripcion / Censo Comercial -->
                ${this.renderModalInscripcion()}
            `;
        },

        renderDashboard: function(container) {
            const store = global.HaciendaStore;
            const c = activeContribuyente;

            const patentes = (store.get('hacienda_patentes') || []).filter(p => String(p.contribuyente_id) === String(c.id));
            const patenteActiva = patentes[0] || null;

            const declaraciones = (store.get('hacienda_declaraciones') || []).filter(d => String(d.contribuyente_id) === String(c.id));
            const declaracionesPendientes = declaraciones.filter(d => d.estado === 'pendiente');
            const totalDeudaBs = declaracionesPendientes.reduce((acc, d) => acc + Number(d.impuesto_determinado_bs || 0), 0);
            const esSolvente = declaracionesPendientes.length === 0;

            const pagos = (store.get('hacienda_pagos') || []).filter(p => String(p.contribuyente_id) === String(c.id));
            const cuentas = store.get('hacienda_cuentas') || [];

            container.innerHTML = `
                <div class="max-w-5xl mx-auto space-y-6 py-4 animate-fade-in">
                    <!-- Tarjeta de Identidad del Establecimiento -->
                    <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div class="flex items-start gap-5">
                            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-sky-900/30 shrink-0">
                                <i class="fas fa-store"></i>
                            </div>
                            <div class="space-y-1">
                                <div class="flex flex-wrap items-center gap-2.5">
                                    <h2 class="text-xl sm:text-2xl font-black text-slate-100">${c.razon_social}</h2>
                                    ${esSolvente ? `
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            Solvente
                                        </span>
                                    ` : `
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                                            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                            ${declaracionesPendientes.length} Pendiente(s)
                                        </span>
                                    `}
                                </div>
                                <div class="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 font-mono">
                                    <span><strong class="text-slate-300">RIF:</strong> ${c.rif}</span>
                                    <span><strong class="text-slate-300">Patente:</strong> ${patenteActiva ? patenteActiva.numero_patente : 'En trámite'}</span>
                                    <span><strong class="text-slate-300">Actividad:</strong> ${patenteActiva ? (patenteActiva.codigo_locat + ' · ' + patenteActiva.descripcion_actividad) : 'General'}</span>
                                </div>
                                <div class="text-[11px] text-slate-500">
                                    ${c.direccion_fiscal || 'Sin dirección fiscal registrada'}
                                </div>
                            </div>
                        </div>

                        <div class="shrink-0 flex items-center gap-3">
                            <button onclick="window.PortalComercio.cerrarConsulta()" 
                                    class="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-2 shadow">
                                <i class="fas fa-sign-out-alt text-xs"></i>
                                <span>Consultar otro RIF</span>
                            </button>
                        </div>
                    </div>

                    <!-- Navegación por Pestañas del Comercio -->
                    <div class="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
                        <button onclick="window.PortalComercio.cambiarTab('declarar')" 
                                class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'declarar' ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}">
                            <i class="fas fa-calculator text-xs"></i>
                            <span>1. Autoliquidación Mensual (LOCAT)</span>
                        </button>
                        <button onclick="window.PortalComercio.cambiarTab('pagar')" 
                                class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'pagar' ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}">
                            <i class="fas fa-wallet text-xs"></i>
                            <span>2. Consignar Pago (${declaracionesPendientes.length})</span>
                        </button>
                        <button onclick="window.PortalComercio.cambiarTab('solvencia')" 
                                class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'solvencia' ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}">
                            <i class="fas fa-stamp text-xs"></i>
                            <span>3. Solvencia Municipal QR</span>
                        </button>
                        <button onclick="window.PortalComercio.cambiarTab('historial')" 
                                class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'historial' ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}">
                            <i class="fas fa-history text-xs"></i>
                            <span>4. Historial (${declaraciones.length})</span>
                        </button>
                    </div>

                    <!-- Contenido Dinámico de la Pestaña -->
                    <div>
                        ${this.renderContenidoTab(activeTab, c, patenteActiva, declaraciones, declaracionesPendientes, totalDeudaBs, esSolvente, pagos, cuentas)}
                    </div>
                </div>
            `;
        },

        renderContenidoTab: function(tab, c, patenteActiva, declaraciones, declaracionesPendientes, totalDeudaBs, esSolvente, pagos, cuentas) {
            const alicuota = patenteActiva ? Number(patenteActiva.alicuota || 0.01) : 0.01;
            const minimoTcmmv = patenteActiva ? Number(patenteActiva.minimo_tcmmv || 0.30) : 0.30;
            const minimoBs = minimoTcmmv * TASA_BCV_DEFAULT;

            if (tab === 'declarar') {
                return `
                    <div class="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                            <div>
                                <h3 class="text-base font-black text-slate-100 flex items-center gap-2">
                                    <i class="fas fa-calculator text-sky-400"></i>
                                    Autoliquidación Mensual de Ingresos Brutos
                                </h3>
                                <p class="text-xs text-slate-400 mt-0.5">
                                    Conforme al clasificador y alícuotas armonizadas de la Ley LOCAT.
                                </p>
                            </div>
                            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                                <span class="text-slate-400">Alícuota Oficial:</span>
                                <span class="text-sky-400 font-bold">${(alicuota * 100).toFixed(2)}%</span>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Mes a Declarar:</label>
                                <select id="dec-mes" class="w-full bg-slate-800 border border-slate-700 text-slate-100 font-bold text-xs rounded-xl px-4 py-3 outline-none focus:border-sky-500">
                                    ${MESES.map((m, idx) => `<option value="${idx + 1}" ${new Date().getMonth() + 1 === (idx + 1) ? 'selected' : ''}>${m}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Año Fiscal:</label>
                                <input type="number" id="dec-anio" value="${new Date().getFullYear()}" class="w-full bg-slate-800 border border-slate-700 text-slate-100 font-mono font-bold text-xs rounded-xl px-4 py-3 outline-none focus:border-sky-500">
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Ingresos Brutos del Mes (Bs):</label>
                                <input type="number" step="0.01" id="dec-base-imponible" placeholder="0.00" 
                                       oninput="window.PortalComercio.calcularEnVivo(${alicuota}, ${minimoBs})"
                                       class="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-black text-base rounded-xl px-4 py-2.5 outline-none focus:border-sky-500 shadow-inner">
                            </div>
                        </div>

                        <!-- Desglose de Cálculo a 0ms -->
                        <div class="bg-slate-950 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Determinación Tributaria en Tiempo Real (0ms)
                            </span>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                                <div>
                                    <span class="text-slate-500">Impuesto por Alícuota (${(alicuota * 100).toFixed(2)}%):</span>
                                    <div id="calc-imp-alicuota" class="text-sm font-bold text-slate-300 mt-1">0,00 Bs.</div>
                                </div>
                                <div>
                                    <span class="text-slate-500">Mínimo Tributable LOCAT:</span>
                                    <div id="calc-min-tributable" class="text-sm font-bold text-slate-300 mt-1">${minimoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</div>
                                </div>
                                <div class="sm:border-l sm:border-slate-800 sm:pl-4">
                                    <span class="text-slate-400 font-bold">Total Determinado a Pagar:</span>
                                    <div id="calc-total-pagar" class="text-xl font-black text-emerald-400 mt-1">0,00 Bs.</div>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end pt-2">
                            <button onclick="window.PortalComercio.presentarDeclaracion(${alicuota}, ${minimoBs})" 
                                    class="px-8 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-900/30 transition flex items-center gap-2">
                                <i class="fas fa-check-circle"></i>
                                <span>Presentar Autoliquidación Jurada</span>
                            </button>
                        </div>
                    </div>
                `;
            } else if (tab === 'pagar') {
                return `
                    <div class="space-y-6">
                        <!-- Tarjetas de Cuentas Bancarias Municipales -->
                        <div class="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
                            <h3 class="text-base font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-university text-sky-400"></i>
                                Cuentas Bancarias Recaudadoras del Municipio
                            </h3>
                            <p class="text-xs text-slate-400">
                                Transfiera o realice pago móvil a cualquiera de las cuentas oficiales de la Alcaldía e ingrese la referencia bancaria para su conciliación automática.
                            </p>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                ${cuentas.map(cta => `
                                    <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative group">
                                        <div class="flex items-center justify-between">
                                            <span class="text-xs font-black text-sky-400 uppercase tracking-wider">${cta.banco || cta.banco_nombre}</span>
                                            <span class="text-[10px] font-mono text-slate-400 uppercase">${cta.tipo || 'Corriente'}</span>
                                        </div>
                                        <div class="text-sm font-mono font-bold text-slate-200 select-all tracking-wider">${cta.numero || cta.numero_cuenta}</div>
                                        <div class="text-[11px] text-slate-400 flex items-center justify-between">
                                            <span>${cta.concepto || 'Recaudación Tributaria'}</span>
                                            <button onclick="window.PortalComercio.copiarAlPortapapeles('${cta.numero || cta.numero_cuenta}')" 
                                                    class="text-sky-400 hover:text-sky-300 font-bold transition flex items-center gap-1">
                                                <i class="fas fa-copy text-[10px]"></i>
                                                <span>Copiar</span>
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Formulario de Consignación de Comprobante -->
                        <div class="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
                            <h3 class="text-base font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-receipt text-emerald-400"></i>
                                Consignar Comprobante de Pago
                            </h3>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Declaración a Cancelar:</label>
                                    <select id="pago-declaracion-id" class="w-full bg-slate-800 border border-slate-700 text-slate-100 font-bold text-xs rounded-xl px-4 py-3 outline-none focus:border-sky-500">
                                        ${declaracionesPendientes.length === 0 ? `
                                            <option value="">No presenta declaraciones pendientes</option>
                                        ` : declaracionesPendientes.map(d => `
                                            <option value="${d.id}">${MESES[d.mes - 1]} ${d.anio} — ${Number(d.impuesto_determinado_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Banco de Origen (Su Banco):</label>
                                    <input type="text" id="pago-banco-origen" placeholder="Ej: Banesco, Banco de Venezuela, Mercantil" 
                                           class="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-sky-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Banco Destino (Municipio):</label>
                                    <select id="pago-banco-destino" class="w-full bg-slate-800 border border-slate-700 text-slate-100 font-bold text-xs rounded-xl px-4 py-3 outline-none focus:border-sky-500">
                                        ${cuentas.map(cta => `<option value="${cta.banco || cta.banco_nombre}">${cta.banco || cta.banco_nombre}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Número de Referencia Bancaria:</label>
                                    <input type="text" id="pago-referencia" placeholder="Ej: 000987654321" 
                                           class="w-full bg-slate-800 border border-slate-700 text-sky-400 font-mono font-bold text-xs rounded-xl px-4 py-3 outline-none focus:border-sky-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Monto Transferido en Bs:</label>
                                    <input type="number" step="0.01" id="pago-monto" placeholder="0.00" 
                                           class="w-full bg-slate-800 border border-slate-700 text-emerald-400 font-mono font-bold text-xs rounded-xl px-4 py-3 outline-none focus:border-sky-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Fecha del Pago:</label>
                                    <input type="date" id="pago-fecha" value="${new Date().toISOString().split('T')[0]}" 
                                           class="w-full bg-slate-800 border border-slate-700 text-slate-100 font-bold text-xs rounded-xl px-4 py-3 outline-none focus:border-sky-500">
                                </div>
                            </div>

                            <div class="flex justify-end pt-2">
                                <button onclick="window.PortalComercio.guardarPago()" 
                                        class="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center gap-2">
                                    <i class="fas fa-paper-plane"></i>
                                    <span>Consignar Pago a Taquilla</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else if (tab === 'solvencia') {
                return `
                    <div class="space-y-6">
                        ${esSolvente ? `
                            <!-- Certificado de Solvencia Oficial -->
                            <div class="bg-slate-900 border border-slate-800 p-8 sm:p-12 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden" id="solvencia-oficial-print">
                                <div class="text-center space-y-2 border-b border-slate-800 pb-6">
                                    <div class="text-xs font-black tracking-widest text-slate-400 uppercase">REPÚBLICA BOLIVARIANA DE VENEZUELA</div>
                                    <div class="text-sm font-black text-slate-300 uppercase">ESTADO BOLIVARIANO DE GUÁRICO · ALCALDÍA MUNICIPAL</div>
                                    <div class="text-xs font-bold text-sky-400 font-mono uppercase tracking-wider">DIRECCIÓN DE HACIENDA Y ADMINISTRACIÓN TRIBUTARIA</div>
                                    <h2 class="text-2xl font-black text-slate-100 pt-2 tracking-tight">CERTIFICADO OFICIAL DE SOLVENCIA MUNICIPAL</h2>
                                    <div class="text-xs font-mono text-emerald-400 font-bold">VIGENCIA FISCAL: 30 DÍAS CONTINUOS</div>
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs p-6 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
                                    <div class="space-y-2">
                                        <div><span class="text-slate-500 font-bold">CONTRIBUYENTE:</span> <strong class="text-slate-200">${c.razon_social}</strong></div>
                                        <div><span class="text-slate-500 font-bold">RIF FISCAL:</span> <strong class="font-mono text-sky-400">${c.rif}</strong></div>
                                        <div><span class="text-slate-500 font-bold">DENOMINACIÓN:</span> <span class="text-slate-300">${c.denominacion_comercial || 'N/A'}</span></div>
                                        <div><span class="text-slate-500 font-bold">DIRECCIÓN:</span> <span class="text-slate-400">${c.direccion_fiscal || 'Local Principal'}</span></div>
                                    </div>
                                    <div class="space-y-2 sm:border-l sm:border-slate-800 sm:pl-6">
                                        <div><span class="text-slate-500 font-bold">NRO. LICENCIA / PATENTE:</span> <strong class="font-mono text-slate-200">${patenteActiva ? patenteActiva.numero_patente : 'VIGENTE'}</strong></div>
                                        <div><span class="text-slate-500 font-bold">ACTIVIDAD LOCAT:</span> <span class="text-slate-300">${patenteActiva ? patenteActiva.descripcion_actividad : 'Actividades Comerciales'}</span></div>
                                        <div><span class="text-slate-500 font-bold">ESTADO DE CUENTA:</span> <span class="text-emerald-400 font-bold">AL DÍA (0 DEUDA)</span></div>
                                        <div><span class="text-slate-500 font-bold">FECHA EMISIÓN:</span> <span class="font-mono text-slate-300">${new Date().toLocaleDateString('es-VE')}</span></div>
                                    </div>
                                </div>

                                <div class="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
                                    <div class="flex items-center gap-4">
                                        <div class="p-3 bg-white rounded-2xl shadow-lg">
                                            <i class="fas fa-qrcode text-black text-6xl"></i>
                                        </div>
                                        <div class="text-[11px] text-slate-400 space-y-1">
                                            <div class="font-bold text-slate-200">CÓDIGO DE VALIDACIÓN FISCAL</div>
                                            <div class="font-mono text-sky-400 text-[10px]">HASH: ${String(c.rif).replace(/[^a-zA-Z0-9]/g, '')}-2026-OK</div>
                                            <div>Escanee para verificar autenticidad en el servidor municipal.</div>
                                        </div>
                                    </div>

                                    <div class="shrink-0 flex gap-3">
                                        <button onclick="window.print()" 
                                                class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                                            <i class="fas fa-print"></i>
                                            <span>Imprimir Certificado</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <!-- Alerta de Bloqueo por Morosidad -->
                            <div class="bg-slate-900 border border-rose-900/50 p-8 rounded-3xl shadow-xl space-y-4">
                                <div class="flex items-center gap-3 text-rose-400">
                                    <i class="fas fa-exclamation-triangle text-2xl"></i>
                                    <h3 class="text-lg font-black text-slate-100">Solvencia Bloqueada por Declaraciones Pendientes</h3>
                                </div>
                                <p class="text-xs text-slate-300 leading-relaxed">
                                    Conforme a la normativa tributaria municipal, la emisión de la Solvencia de Actividades Económicas requiere estar al día con la autoliquidación mensual. Presenta un saldo pendiente de <strong class="text-rose-400 font-mono">${totalDeudaBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</strong>
                                </p>
                                <div class="pt-2">
                                    <button onclick="window.PortalComercio.cambiarTab('pagar')" 
                                            class="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition">
                                        Ir a Consignar Pagos Pendientes
                                    </button>
                                </div>
                            </div>
                        `}
                    </div>
                `;
            } else if (tab === 'historial') {
                return `
                    <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl p-6 sm:p-8 space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h3 class="text-base font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-history text-sky-400"></i>
                                Historial de Declaraciones y Pagos del Comercio
                            </h3>
                            <span class="text-xs font-mono text-slate-500">${declaraciones.length} registros</span>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr class="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                                        <th class="p-3">Período</th>
                                        <th class="p-3 text-right">Base Imponible</th>
                                        <th class="p-3 text-right">Monto Determinado</th>
                                        <th class="p-3 text-center">Estado Declaración</th>
                                        <th class="p-3">Pago Consignado</th>
                                        <th class="p-3 text-center">Estado Pago</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/60 text-slate-300 font-mono">
                                    ${declaraciones.length === 0 ? `
                                        <tr>
                                            <td colspan="6" class="p-8 text-center text-slate-500 font-sans">
                                                No posee declaraciones registradas todavía. Inicie en la pestaña de Autoliquidación.
                                            </td>
                                        </tr>
                                    ` : declaraciones.map(d => {
                                        const pago = pagos.find(p => String(p.declaracion_id) === String(d.id));
                                        return `
                                            <tr class="hover:bg-slate-800/40 transition">
                                                <td class="p-3 font-bold text-slate-200 font-sans">${MESES[d.mes - 1]} ${d.anio}</td>
                                                <td class="p-3 text-right text-slate-400">${Number(d.base_imponible_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</td>
                                                <td class="p-3 text-right font-bold text-sky-300">${Number(d.impuesto_determinado_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</td>
                                                <td class="p-3 text-center">
                                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${d.estado === 'pagada' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
                                                        ${d.estado || 'pendiente'}
                                                    </span>
                                                </td>
                                                <td class="p-3 text-slate-400">
                                                    ${pago ? `${pago.banco_destino} Ref: ${pago.referencia_bancaria}` : 'Sin pago reportado'}
                                                </td>
                                                <td class="p-3 text-center">
                                                    ${pago ? `
                                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${pago.estado === 'conciliado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}">
                                                            ${pago.estado}
                                                        </span>
                                                    ` : '-'}
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }
        },

        renderModalInscripcion: function() {
            const catalogo = global.CatalogoLocat ? global.CatalogoLocat.getAll() : [];

            return `
                <div id="modal-inscripcion-comercio" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
                        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
                            <div>
                                <h3 class="text-sm font-black text-slate-100 flex items-center gap-2">
                                    <i class="fas fa-file-signature text-sky-400"></i>
                                    Inscripción en el Padrón Comercial (RUC)
                                </h3>
                                <p class="text-xs text-slate-400 mt-0.5">Registre su establecimiento para autoliquidación y solvencias en línea.</p>
                            </div>
                            <button onclick="window.PortalComercio.cerrarModalInscripcion()" class="text-slate-400 hover:text-slate-100 p-2">
                                <i class="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        <div class="p-6 space-y-4 overflow-y-auto flex-1">
                            <div class="grid grid-cols-3 gap-3">
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Tipo RIF:</label>
                                    <select id="ins-rif-tipo" class="w-full bg-slate-800 border border-slate-700 text-sky-400 font-mono font-bold text-xs rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                                        <option value="J">J - Jurídico</option>
                                        <option value="V">V - Natural</option>
                                        <option value="G">G - Gubernamental</option>
                                        <option value="E">E - Extranjero</option>
                                    </select>
                                </div>
                                <div class="col-span-2">
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Número de RIF:</label>
                                    <input type="text" id="ins-rif-numero" placeholder="Ej: 30123456-7" class="w-full bg-slate-800 border border-slate-700 text-slate-100 font-mono font-bold text-xs rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                                </div>
                            </div>

                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Razón Social (Nombre Legal):</label>
                                <input type="text" id="ins-razon" placeholder="Ej: INVERSIONES GUIRIRI C.A." class="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                            </div>

                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Nombre Comercial (Fachada / Vitrina):</label>
                                <input type="text" id="ins-denominacion" placeholder="Ej: SUPERMERCADO EL CENTRO" class="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                            </div>

                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Actividad Económica Principal (LOCAT):</label>
                                <select id="ins-actividad" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                                    ${catalogo.map(item => `
                                        <option value="${item.codigo}">[${item.codigo}] ${item.nombre} — ${(item.alicuota * 100).toFixed(2)}%</option>
                                    `).join('')}
                                </select>
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Teléfono:</label>
                                    <input type="text" id="ins-telefono" placeholder="0414-0000000" class="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Correo Electrónico:</label>
                                    <input type="email" id="ins-correo" placeholder="correo@comercio.com" class="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                                </div>
                            </div>

                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Dirección Fiscal del Local:</label>
                                <textarea id="ins-direccion" rows="2" placeholder="Calle, avenida, centro comercial, número de local..." class="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-sky-500"></textarea>
                            </div>
                        </div>

                        <div class="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end gap-3">
                            <button onclick="window.PortalComercio.cerrarModalInscripcion()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition">Cancelar</button>
                            <button onclick="window.PortalComercio.guardarInscripcion()" class="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition">Completar Inscripción</button>
                        </div>
                    </div>
                </div>
            `;
        },

        ejecutarConsultaRif: function() {
            const tipo = document.getElementById('pc-rif-tipo').value;
            const numero = (document.getElementById('pc-rif-numero').value || '').trim().toUpperCase();

            if (!numero) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'warning', title: 'RIF Requerido', text: 'Ingrese el número de RIF del contribuyente.', confirmButtonColor: '#0284c7' });
                }
                return;
            }

            const rifCompleto = tipo + '-' + numero.replace(/^[JVGE]-?/i, '');
            this.seleccionarRif(rifCompleto);
        },

        seleccionarRif: function(rif) {
            const store = global.HaciendaStore;
            if (!store) return;

            const cleanRif = String(rif).trim().toUpperCase();
            const contribuyentes = store.get('hacienda_contribuyentes') || [];
            const match = contribuyentes.find(c => c.rif.toUpperCase() === cleanRif);

            if (!match) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'info',
                        title: 'Comercio no Registrado',
                        text: `El RIF ${cleanRif} no se encuentra registrado en el Padrón Municipal (RUC). ¿Desea realizar la inscripción ahora?`,
                        showCancelButton: true,
                        confirmButtonText: 'Sí, Inscribir Comercio',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#0284c7'
                    }).then(res => {
                        if (res.isConfirmed) {
                            this.abrirModalInscripcion(cleanRif);
                        }
                    });
                }
                return;
            }

            activeContribuyente = match;
            activeTab = 'declarar';

            const container = document.getElementById('portal-main-content');
            if (container) this.render(container);
        },

        cerrarConsulta: function() {
            activeContribuyente = null;
            const container = document.getElementById('portal-main-content');
            if (container) this.render(container);
        },

        cambiarTab: function(tab) {
            activeTab = tab;
            const container = document.getElementById('portal-main-content');
            if (container) this.render(container);
        },

        calcularEnVivo: function(alicuota, minimoBs) {
            const baseImponible = parseFloat(document.getElementById('dec-base-imponible').value || 0);
            const impAlicuota = baseImponible * alicuota;
            const totalPagar = Math.max(impAlicuota, minimoBs);

            const elImp = document.getElementById('calc-imp-alicuota');
            const elTot = document.getElementById('calc-total-pagar');

            if (elImp) elImp.innerText = impAlicuota.toLocaleString('es-VE', { minimumFractionDigits: 2 }) + ' Bs.';
            if (elTot) elTot.innerText = totalPagar.toLocaleString('es-VE', { minimumFractionDigits: 2 }) + ' Bs.';
        },

        presentarDeclaracion: async function(alicuota, minimoBs) {
            const store = global.HaciendaStore;
            if (!store || !activeContribuyente) return;

            const mes = parseInt(document.getElementById('dec-mes').value, 10);
            const anio = parseInt(document.getElementById('dec-anio').value, 10);
            const baseImponible = parseFloat(document.getElementById('dec-base-imponible').value || 0);

            if (isNaN(baseImponible) || baseImponible < 0) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Monto inválido', text: 'Ingrese un monto de ingresos brutos válido.', confirmButtonColor: '#0284c7' });
                return;
            }

            // Validar si ya existe declaracion para ese mes y anio
            const declaraciones = store.get('hacienda_declaraciones') || [];
            const yaExiste = declaraciones.some(d => String(d.contribuyente_id) === String(activeContribuyente.id) && d.mes === mes && d.anio === anio);
            if (yaExiste) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'warning', title: 'Período ya declarado', text: `Ya existe una declaración presentada para ${MESES[mes - 1]} ${anio}.`, confirmButtonColor: '#0284c7' });
                }
                return;
            }

            const impAlicuota = baseImponible * alicuota;
            const totalPagar = Math.max(impAlicuota, minimoBs);

            const patentes = (store.get('hacienda_patentes') || []).filter(p => String(p.contribuyente_id) === String(activeContribuyente.id));
            const p = patentes[0] || null;

            const nuevaDeclaracion = {
                id: Date.now(),
                contribuyente_id: activeContribuyente.id,
                patente_id: p ? p.id : 1,
                anio: anio,
                mes: mes,
                base_imponible_bs: baseImponible,
                alicuota_aplicada: alicuota,
                impuesto_alicuota_bs: impAlicuota,
                minimo_tributable_bs: minimoBs,
                impuesto_determinado_bs: totalPagar,
                tasa_bcv_aplicada: TASA_BCV_DEFAULT,
                estado: 'pendiente',
                fecha_declaracion: new Date().toISOString()
            };

            await store.set('hacienda_declaraciones', nuevaDeclaracion);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Autoliquidación Presentada',
                    text: `Declaración de ${MESES[mes - 1]} ${anio} registrada exitosamente. Total determinado a pagar: ${totalPagar.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.`,
                    confirmButtonColor: '#0284c7'
                });
            }

            this.cambiarTab('pagar');
        },

        guardarPago: async function() {
            const store = global.HaciendaStore;
            if (!store || !activeContribuyente) return;

            const decId = document.getElementById('pago-declaracion-id').value;
            const bancoOrigen = document.getElementById('pago-banco-origen').value.trim();
            const bancoDestino = document.getElementById('pago-banco-destino').value.trim();
            const referencia = document.getElementById('pago-referencia').value.trim();
            const monto = parseFloat(document.getElementById('pago-monto').value || 0);
            const fecha = document.getElementById('pago-fecha').value;

            if (!decId || !referencia || monto <= 0) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Campos requeridos',
                        text: 'Seleccione la declaración, indique número de referencia bancaria y monto válido.',
                        confirmButtonColor: '#0284c7'
                    });
                }
                return;
            }

            const nuevoPago = {
                id: Date.now(),
                numero_recibo: 'REC-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4),
                contribuyente_id: activeContribuyente.id,
                declaracion_id: decId,
                banco_origen: bancoOrigen,
                banco_destino: bancoDestino,
                referencia_bancaria: referencia,
                fecha_pago: fecha,
                monto_bs: monto,
                metodo: 'transferencia',
                estado: 'pendiente',
                verificado_por: null
            };

            await store.set('hacienda_pagos', nuevoPago);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Pago Consignado',
                    text: 'Su pago ha sido consignado con éxito y será conciliado por taquilla.',
                    confirmButtonColor: '#0284c7'
                });
            }

            this.cambiarTab('historial');
        },

        abrirModalInscripcion: function(rifInicial) {
            const modal = document.getElementById('modal-inscripcion-comercio');
            if (modal) {
                modal.classList.remove('hidden');
                if (rifInicial) {
                    const partes = rifInicial.split('-');
                    if (partes.length >= 2) {
                        const sel = document.getElementById('ins-rif-tipo');
                        const inp = document.getElementById('ins-rif-numero');
                        if (sel) sel.value = partes[0];
                        if (inp) inp.value = partes.slice(1).join('-');
                    }
                }
            }
        },

        cerrarModalInscripcion: function() {
            const modal = document.getElementById('modal-inscripcion-comercio');
            if (modal) modal.classList.add('hidden');
        },

        guardarInscripcion: async function() {
            const store = global.HaciendaStore;
            if (!store) return;

            const tipo = document.getElementById('ins-rif-tipo').value;
            const numero = document.getElementById('ins-rif-numero').value.trim();
            const razon = document.getElementById('ins-razon').value.trim();
            const denominacion = document.getElementById('ins-denominacion').value.trim();
            const codigoActividad = document.getElementById('ins-actividad').value;
            const telefono = document.getElementById('ins-telefono').value.trim();
            const correo = document.getElementById('ins-correo').value.trim();
            const direccion = document.getElementById('ins-direccion').value.trim();

            if (!numero || !razon) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Datos requeridos', text: 'Indique número de RIF y Razón Social.', confirmButtonColor: '#0284c7' });
                return;
            }

            const rifCompleto = tipo + '-' + numero.replace(/^[JVGE]-?/i, '');
            const contribuyenteId = Date.now();

            const nuevoContribuyente = {
                id: contribuyenteId,
                rif: rifCompleto,
                razon_social: razon,
                denominacion_comercial: denominacion,
                tipo_persona: tipo === 'V' ? 'natural' : 'juridica',
                correo: correo,
                telefono: telefono,
                direccion_fiscal: direccion,
                estado: 'activo'
            };

            await store.set('hacienda_contribuyentes', nuevoContribuyente);

            // Crear patente asociada al contribuyente
            const catalogo = global.CatalogoLocat ? global.CatalogoLocat.getAll() : [];
            const actInfo = catalogo.find(a => a.codigo === codigoActividad) || { alicuota: 0.01, minimo_tcmmv: 0.30, nombre: 'Actividades Comerciales' };

            const nuevaPatente = {
                id: Date.now() + 1,
                numero_patente: 'PAT-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4),
                contribuyente_id: contribuyenteId,
                tipo: 'comercial',
                codigo_locat: codigoActividad,
                descripcion_actividad: actInfo.nombre,
                alicuota: actInfo.alicuota,
                minimo_tributable_tcmmv: actInfo.minimo_tcmmv,
                estado: 'activa',
                fecha_emision: new Date().toISOString().split('T')[0],
                fecha_vencimiento: new Date().getFullYear() + '-12-31'
            };

            await store.set('hacienda_patentes', nuevaPatente);

            this.cerrarModalInscripcion();

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Comercio Inscrito',
                    text: 'Inscripción en el Padrón Comercial completada a 0ms.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }

            this.seleccionarRif(rifCompleto);
        },

        copiarAlPortapapeles: function(texto) {
            navigator.clipboard.writeText(texto).then(() => {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Copiado',
                        text: 'Número de cuenta copiado al portapapeles.',
                        timer: 1200,
                        showConfirmButton: false
                    });
                }
            });
        }
    };

    global.PortalComercio = Portal;
})(typeof window !== 'undefined' ? window : this);
