/**
 * GUIRIRI SISTEMA HACIENDA V3 — Portal del Comerciante / Contribuyente
 * Interfaz pública de autogestión para comercios y empresas del Municipio.
 * Permite consultar RUC, autoliquidar LOCAT, reportar pagos y descargar solvencias QR.
 * Arquitectura SGB Silhouettes V3 (0ms Latencia, Offline-First, LocalForage).
 */
(function definePortalComercio(global) {
    "use strict";

    let activeContribuyente = null;
    let activeTab = 'solvencia'; // 'solvencia', 'declarar', 'pagar', 'historial'
    const TASA_BCV_DEFAULT = 56.50; // Bs. por TCMMV

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

            // Si no hay contribuyente seleccionado, mostrar pantalla de bienvenida y selector de RIF
            if (!activeContribuyente) {
                this.renderPantallaIdentificacion(container);
                return;
            }

            // Si hay contribuyente seleccionado, mostrar su dashboard de autogestión
            this.renderDashboardComercio(container);
        },

        renderPantallaIdentificacion: function(container) {
            const store = global.HaciendaStore;
            const contribuyentes = store.get('hacienda_contribuyentes') || [];

            container.innerHTML = `
                <div class="max-w-4xl mx-auto space-y-8 py-6">
                    <!-- Banner de Bienvenida -->
                    <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div class="max-w-2xl space-y-3 relative z-10">
                            <span class="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono font-bold text-xs uppercase tracking-wider">
                                Portal Tributario del Contribuyente
                            </span>
                            <h2 class="text-3xl font-black text-slate-100 tracking-tight">
                                Autogestión de Licencias, Declaraciones y Solvencias Municipales
                            </h2>
                            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                Plataforma en línea para comercios y empresas del Municipio. Autoliquide sus ingresos brutos conforme a la ley LOCAT, reporte transferencias bancarias y descargue su Solvencia Municipal con código de seguridad QR a 0ms.
                            </p>
                        </div>
                    </div>

                    <!-- Tarjeta de Ingreso por RIF -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Formulario de Consulta / Acceso -->
                        <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
                            <div>
                                <h3 class="text-base font-black text-slate-100 flex items-center gap-2">
                                    <i class="fas fa-search text-sky-400"></i>
                                    Consultar mi Comercio por RIF
                                </h3>
                                <p class="text-xs text-slate-400 mt-1">
                                    Ingrese el RIF fiscal de su empresa o establecimiento comercial (incluyendo la letra J, V, G o E).
                                </p>

                                <div class="mt-4 space-y-3">
                                    <div>
                                        <label class="text-[11px] font-bold text-slate-400 uppercase block mb-1">RIF del Contribuyente:</label>
                                        <input type="text" id="pc-rif-input" placeholder="Ej: J-30123456-7" 
                                               class="w-full bg-slate-800 border border-slate-700 text-slate-100 font-mono text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-sky-500 uppercase">
                                    </div>
                                    <button onclick="window.PortalComercio.buscarPorRif()" 
                                            class="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-900/30 transition flex items-center justify-center gap-2">
                                        <i class="fas fa-sign-in-alt"></i>
                                        <span>Ingresar a mi Portal Comercial</span>
                                    </button>
                                </div>
                            </div>

                            <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                <span class="text-slate-400">¿Nuevo comercio sin RUC?</span>
                                <button onclick="window.PortalComercio.abrirModalPrecenso()" 
                                        class="text-sky-400 hover:text-sky-300 font-bold transition">
                                    Solicitar Censo Comercial
                                </button>
                            </div>
                        </div>

                        <!-- Comercios Registrados / Acceso Rápido -->
                        <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                            <h3 class="text-base font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-store text-emerald-400"></i>
                                Comercios Disponibles en el Municipio
                            </h3>
                            <p class="text-xs text-slate-400">
                                Haga clic en cualquiera de los comercios censados para acceder de inmediato en modo autoservicio:
                            </p>

                            <div class="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                ${contribuyentes.map(c => `
                                    <button onclick="window.PortalComercio.seleccionarRif('${c.rif}')" 
                                            class="w-full text-left p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 transition flex items-center justify-between group">
                                        <div>
                                            <div class="text-xs font-black text-slate-200 group-hover:text-sky-400 transition">
                                                ${c.razon_social}
                                            </div>
                                            <div class="text-[11px] font-mono text-slate-400">
                                                RIF: ${c.rif} | ${c.denominacion_comercial || 'Comercio'}
                                            </div>
                                        </div>
                                        <i class="fas fa-arrow-right text-slate-600 group-hover:text-sky-400 transition text-xs"></i>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Beneficios y Marco Legal LOCAT -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                        <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
                            <div class="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                                <i class="fas fa-calculator text-sm"></i>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-slate-200 uppercase">Armonización LOCAT</h4>
                                <p class="text-[11px] text-slate-400 mt-0.5">Alícuotas oficiales y cálculo de mínimos tributables en Tipo de Cambio BCV a 0ms.</p>
                            </div>
                        </div>

                        <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
                            <div class="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                <i class="fas fa-qrcode text-sm"></i>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-slate-200 uppercase">Solvencia Inmediata</h4>
                                <p class="text-[11px] text-slate-400 mt-0.5">Descarga tu solvencia con QR para colocar en la vitrina al confirmar el pago en banco.</p>
                            </div>
                        </div>

                        <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
                            <div class="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                                <i class="fas fa-file-invoice-dollar text-sm"></i>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-slate-200 uppercase">Reporte de Pagos</h4>
                                <p class="text-[11px] text-slate-400 mt-0.5">Adjunta tu referencia bancaria y comprobante para conciliación automática por taquilla.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Precenso / Registro -->
                <div id="modal-precenso-comercio" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
                            <h3 class="text-sm font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-clipboard-check text-sky-400"></i>
                                Solicitud de Censo Comercial (RUC)
                            </h3>
                            <button onclick="window.PortalComercio.cerrarModalPrecenso()" class="text-slate-400 hover:text-slate-100 p-2">
                                <i class="fas fa-times text-lg"></i>
                            </button>
                        </div>
                        <div class="p-6 space-y-4">
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1">RIF Fiscal:</label>
                                <input type="text" id="precenso-rif" placeholder="J-00000000-0" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500 uppercase">
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Razón Social:</label>
                                <input type="text" id="precenso-razon" placeholder="Nombre legal de la empresa" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Nombre Comercial / Denominación:</label>
                                <input type="text" id="precenso-denominacion" placeholder="Nombre en fachada o vitrina" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Teléfono:</label>
                                    <input type="text" id="precenso-telefono" placeholder="0414-0000000" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Correo Electrónico:</label>
                                    <input type="email" id="precenso-correo" placeholder="correo@empresa.com" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                                </div>
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Dirección Fiscal del Local:</label>
                                <textarea id="precenso-direccion" rows="2" placeholder="Calle, avenida, centro comercial, número de local" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-sky-500"></textarea>
                            </div>
                        </div>
                        <div class="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end gap-3">
                            <button onclick="window.PortalComercio.cerrarModalPrecenso()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition">Cancelar</button>
                            <button onclick="window.PortalComercio.guardarPrecenso()" class="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition">Registrar Comercio</button>
                        </div>
                    </div>
                </div>
            `;
        },

        renderDashboardComercio: function(container) {
            const store = global.HaciendaStore;
            const c = activeContribuyente;

            // Datos de patentes del contribuyente
            const patentes = (store.get('hacienda_patentes') || []).filter(p => String(p.contribuyente_id) === String(c.id));
            const patenteActiva = patentes[0] || null;

            // Declaraciones del contribuyente
            const declaraciones = (store.get('hacienda_declaraciones') || []).filter(d => String(d.contribuyente_id) === String(c.id));
            const declaracionesPendientes = declaraciones.filter(d => d.estado === 'pendiente');
            const totalDeudaBs = declaracionesPendientes.reduce((acc, d) => acc + Number(d.impuesto_determinado_bs || 0), 0);
            const esSolvente = declaracionesPendientes.length === 0;

            // Pagos del contribuyente
            const pagos = (store.get('hacienda_pagos') || []).filter(p => String(p.contribuyente_id) === String(c.id));
            const cuentas = store.get('hacienda_cuentas') || [];

            container.innerHTML = `
                <div class="max-w-5xl mx-auto space-y-6 py-4">
                    <!-- Cabecera del Comercio Activo -->
                    <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div class="flex items-center gap-4">
                            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                                <i class="fas fa-store"></i>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h2 class="text-lg font-black text-slate-100">${c.razon_social}</h2>
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.estado === 'activo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}">
                                        ${c.estado || 'Activo'}
                                    </span>
                                </div>
                                <div class="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-x-4 gap-y-1">
                                    <span><strong class="text-slate-300">RIF:</strong> ${c.rif}</span>
                                    <span><strong class="text-slate-300">Patente:</strong> ${patenteActiva ? patenteActiva.numero_patente : 'En trámite'}</span>
                                    <span><strong class="text-slate-300">Actividad:</strong> ${patenteActiva ? patenteActiva.descripcion_actividad : 'Sin asignar'}</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <button onclick="window.PortalComercio.cerrarSesion()" 
                                    class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-2">
                                <i class="fas fa-sign-out-alt text-xs"></i>
                                <span>Cambiar Comercio</span>
                            </button>
                        </div>
                    </div>

                    <!-- Navegacion por Tabs del Portal del Comercio -->
                    <div class="flex items-center gap-2 border-b border-slate-800 pb-2">
                        <button onclick="window.PortalComercio.cambiarTab('solvencia')" 
                                class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === 'solvencia' ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}">
                            <i class="fas fa-stamp"></i>
                            <span>1. Estado y Solvencia QR</span>
                        </button>
                        <button onclick="window.PortalComercio.cambiarTab('declarar')" 
                                class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === 'declarar' ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}">
                            <i class="fas fa-calculator"></i>
                            <span>2. Autoliquidación LOCAT</span>
                        </button>
                        <button onclick="window.PortalComercio.cambiarTab('pagar')" 
                                class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === 'pagar' ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}">
                            <i class="fas fa-file-invoice-dollar"></i>
                            <span>3. Reportar Pago</span>
                        </button>
                        <button onclick="window.PortalComercio.cambiarTab('historial')" 
                                class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === 'historial' ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}">
                            <i class="fas fa-history"></i>
                            <span>4. Mis Trámites (${declaraciones.length})</span>
                        </button>
                    </div>

                    <!-- Contenido del Tab Activo -->
                    <div id="portal-tab-content">
                        ${this.renderTabContent(activeTab, c, patenteActiva, declaraciones, declaracionesPendientes, totalDeudaBs, esSolvente, pagos, cuentas)}
                    </div>
                </div>
            `;
        },

        renderTabContent: function(tab, c, patenteActiva, declaraciones, declaracionesPendientes, totalDeudaBs, esSolvente, pagos, cuentas) {
            if (tab === 'solvencia') {
                return `
                    <div class="space-y-6">
                        <!-- Semáforo de Solvencia -->
                        <div class="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div class="space-y-2 text-center md:text-left">
                                <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${esSolvente ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
                                    ${esSolvente ? 'ESTADO FISCAL: SOLVENTE' : 'ESTADO FISCAL: MOROSO / PENDIENTE'}
                                </span>
                                <h3 class="text-2xl font-black text-slate-100">
                                    ${esSolvente ? 'Su comercio se encuentra al día con el Municipio' : `Presenta ${declaracionesPendientes.length} declaración(es) pendiente(s)`}
                                </h3>
                                <p class="text-xs text-slate-400 max-w-xl">
                                    ${esSolvente 
                                        ? 'Puede emitir e imprimir su Solvencia Municipal Oficial con código de verificación QR para ser colocada en la vitrina de su establecimiento.' 
                                        : `El sistema requiere el pago de ${totalDeudaBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs. para poder desbloquear su Solvencia Municipal.`}
                                </p>
                            </div>

                            <div class="shrink-0">
                                ${esSolvente ? `
                                    <button onclick="window.PortalComercio.verSolvenciaOficial()" 
                                            class="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center gap-2">
                                        <i class="fas fa-qrcode text-base"></i>
                                        <span>Descargar Solvencia Municipal QR</span>
                                    </button>
                                ` : `
                                    <button onclick="window.PortalComercio.cambiarTab('pagar')" 
                                            class="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-900/30 transition flex items-center gap-2">
                                        <i class="fas fa-wallet text-base"></i>
                                        <span>Reportar Pago de Deuda</span>
                                    </button>
                                `}
                            </div>
                        </div>

                        ${!esSolvente ? `
                            <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                <div class="p-4 border-b border-slate-800 bg-slate-950/40">
                                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Declaraciones Pendientes por Liquidar
                                    </h4>
                                </div>
                                <div class="overflow-x-auto">
                                    <table class="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr class="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                                                <th class="p-3">Período</th>
                                                <th class="p-3 text-right">Base Imponible</th>
                                                <th class="p-3 text-right">Alícuota</th>
                                                <th class="p-3 text-right">Monto a Pagar (Bs)</th>
                                                <th class="p-3 text-center">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-slate-800/60 text-slate-300">
                                            ${declaracionesPendientes.map(d => `
                                                <tr class="hover:bg-slate-800/40 transition">
                                                    <td class="p-3 font-bold font-mono text-slate-200">${MESES[d.mes - 1]} ${d.anio}</td>
                                                    <td class="p-3 text-right font-mono text-slate-400">${Number(d.base_imponible_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</td>
                                                    <td class="p-3 text-right font-mono text-slate-400">${(Number(d.alicuota_aplicada || 0) * 100).toFixed(2)}%</td>
                                                    <td class="p-3 text-right font-mono font-bold text-rose-400">${Number(d.impuesto_determinado_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</td>
                                                    <td class="p-3 text-center">
                                                        <button onclick="window.PortalComercio.pagarDeclaracionDirecta('${d.id}')" 
                                                                class="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] rounded-lg transition">
                                                            Pagar
                                                        </button>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            } else if (tab === 'declarar') {
                const alicuota = patenteActiva ? Number(patenteActiva.alicuota || 0.01) : 0.01;
                const minimoTcmmv = patenteActiva ? Number(patenteActiva.minimo_tcmmv || 0.30) : 0.30;

                return `
                    <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
                        <div>
                            <h3 class="text-base font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-calculator text-sky-400"></i>
                                Autoliquidación Mensual de Actividades Económicas (LOCAT)
                            </h3>
                            <p class="text-xs text-slate-400 mt-1">
                                Declare los ingresos brutos facturados durante el mes correspondiente. El sistema calculará el impuesto en tiempo real comparando la alícuota oficial contra el mínimo tributable BCV.
                            </p>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                            <div>
                                <span class="text-[11px] font-bold text-slate-400 uppercase">Actividad:</span>
                                <div class="text-xs font-bold text-slate-200 mt-0.5">${patenteActiva ? patenteActiva.descripcion_actividad : 'Comercio General'}</div>
                            </div>
                            <div>
                                <span class="text-[11px] font-bold text-slate-400 uppercase">Alícuota Armonizada:</span>
                                <div class="text-xs font-mono font-bold text-sky-400 mt-0.5">${(alicuota * 100).toFixed(2)}%</div>
                            </div>
                            <div>
                                <span class="text-[11px] font-bold text-slate-400 uppercase">Mínimo Tributable (LOCAT):</span>
                                <div class="text-xs font-mono font-bold text-amber-400 mt-0.5">${minimoTcmmv.toFixed(2)} TCMMV (${(minimoTcmmv * TASA_BCV_DEFAULT).toFixed(2)} Bs.)</div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Mes a Declarar:</label>
                                <select id="dec-mes" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                                    ${MESES.map((m, idx) => `<option value="${idx + 1}" ${new Date().getMonth() + 1 === (idx + 1) ? 'selected' : ''}>${m}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Año:</label>
                                <input type="number" id="dec-anio" value="${new Date().getFullYear()}" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500 font-mono">
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Base Imponible (Ingresos Brutos Bs):</label>
                                <input type="number" step="0.01" id="dec-base-imponible" placeholder="0.00" 
                                       oninput="window.PortalComercio.calcularEnVivo()" 
                                       class="w-full bg-slate-800 border border-slate-700 text-emerald-400 text-sm font-mono font-black rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                            </div>
                        </div>

                        <!-- Resumen del Cálculo a 0ms -->
                        <div class="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Resultado del Cálculo Tributario (0ms)</h4>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                                <div>
                                    <span class="text-slate-400">Impuesto por Alícuota:</span>
                                    <div id="calc-imp-alicuota" class="text-sm font-bold text-slate-200 mt-1">0.00 Bs.</div>
                                </div>
                                <div>
                                    <span class="text-slate-400">Mínimo Tributable BCV:</span>
                                    <div id="calc-min-tributable" class="text-sm font-bold text-slate-200 mt-1">${(minimoTcmmv * TASA_BCV_DEFAULT).toFixed(2)} Bs.</div>
                                </div>
                                <div>
                                    <span class="text-slate-400">Total a Pagar Determinado:</span>
                                    <div id="calc-total-pagar" class="text-base font-black text-emerald-400 mt-1">0.00 Bs.</div>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end">
                            <button onclick="window.PortalComercio.presentarDeclaracion()" 
                                    class="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                                <i class="fas fa-check-circle"></i>
                                <span>Presentar Autoliquidación</span>
                            </button>
                        </div>
                    </div>
                `;
            } else if (tab === 'pagar') {
                return `
                    <div class="space-y-6">
                        <!-- Cuentas Bancarias Municipales -->
                        <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                            <h3 class="text-base font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-university text-sky-400"></i>
                                Cuentas Recaudadoras Oficiales del Municipio
                            </h3>
                            <p class="text-xs text-slate-400">
                                Realice su transferencia bancaria o pago móvil a cualquiera de las siguientes cuentas e ingrese los datos del comprobante a continuación:
                            </p>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                ${cuentas.map(cta => `
                                    <div class="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                                        <div class="text-xs font-black text-sky-400">${cta.banco || cta.banco_nombre || 'Banco'}</div>
                                        <div class="text-xs font-mono font-bold text-slate-200">${cta.numero || cta.numero_cuenta || '0000'}</div>
                                        <div class="text-[11px] text-slate-400">${cta.concepto || 'Recaudación Tributaria'}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Formulario de Reporte de Pago -->
                        <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                            <h3 class="text-base font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-receipt text-emerald-400"></i>
                                Formulario de Reporte de Pago
                            </h3>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Declaración a Cancelar:</label>
                                    <select id="pago-declaracion-id" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                                        ${declaracionesPendientes.length === 0 ? `
                                            <option value="">No tiene declaraciones pendientes</option>
                                        ` : declaracionesPendientes.map(d => `
                                            <option value="${d.id}">${MESES[d.mes - 1]} ${d.anio} — ${Number(d.impuesto_determinado_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Banco Origen:</label>
                                    <input type="text" id="pago-banco-origen" placeholder="Ej: Banesco, Mercantil, BDV" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Banco Destino (Municipio):</label>
                                    <select id="pago-banco-destino" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                                        ${cuentas.map(cta => `<option value="${cta.banco || cta.banco_nombre}">${cta.banco || cta.banco_nombre}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Número de Referencia Bancaria:</label>
                                    <input type="text" id="pago-referencia" placeholder="Ej: 00987654321" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Monto Pagado en Bs:</label>
                                    <input type="number" step="0.01" id="pago-monto" placeholder="0.00" class="w-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-mono font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Fecha de la Transferencia:</label>
                                    <input type="date" id="pago-fecha" value="${new Date().toISOString().split('T')[0]}" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                                </div>
                            </div>

                            <div class="flex justify-end pt-2">
                                <button onclick="window.PortalComercio.guardarPago()" 
                                        class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                                    <i class="fas fa-paper-plane"></i>
                                    <span>Registrar y Reportar Pago</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else if (tab === 'historial') {
                return `
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-6">
                        <h3 class="text-base font-black text-slate-100 flex items-center gap-2">
                            <i class="fas fa-history text-sky-400"></i>
                            Historial de Declaraciones y Pagos del Comercio
                        </h3>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr class="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                                        <th class="p-3">Período</th>
                                        <th class="p-3 text-right">Base Imponible</th>
                                        <th class="p-3 text-right">Monto Determinado</th>
                                        <th class="p-3 text-center">Estado Declaración</th>
                                        <th class="p-3">Pago / Referencia</th>
                                        <th class="p-3 text-center">Estado Pago</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/60 text-slate-300">
                                    ${declaraciones.length === 0 ? `
                                        <tr>
                                            <td colspan="6" class="p-8 text-center text-slate-500 font-mono">
                                                No posee declaraciones registradas todavía.
                                            </td>
                                        </tr>
                                    ` : declaraciones.map(d => {
                                        const pago = pagos.find(p => String(p.declaracion_id) === String(d.id));
                                        return `
                                            <tr class="hover:bg-slate-800/40 transition">
                                                <td class="p-3 font-bold font-mono text-slate-200">${MESES[d.mes - 1]} ${d.anio}</td>
                                                <td class="p-3 text-right font-mono text-slate-400">${Number(d.base_imponible_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</td>
                                                <td class="p-3 text-right font-mono font-bold text-sky-300">${Number(d.impuesto_determinado_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</td>
                                                <td class="p-3 text-center">
                                                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${d.estado === 'pagada' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
                                                        ${d.estado || 'pendiente'}
                                                    </span>
                                                </td>
                                                <td class="p-3 font-mono text-slate-400">
                                                    ${pago ? `${pago.banco_destino || 'Banco'} Ref: ${pago.referencia_bancaria}` : 'Sin pago reportado'}
                                                </td>
                                                <td class="p-3 text-center">
                                                    ${pago ? `
                                                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${pago.estado === 'conciliado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}">
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

        buscarPorRif: function() {
            const input = document.getElementById('pc-rif-input');
            if (!input || !input.value.trim()) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'warning', title: 'RIF Requerido', text: 'Ingrese el RIF del comercio.', confirmButtonColor: '#0284c7' });
                }
                return;
            }
            this.seleccionarRif(input.value.trim());
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
                        icon: 'error',
                        title: 'Comercio no encontrado',
                        text: `No existe ningún contribuyente registrado con el RIF ${cleanRif}. ¿Desea solicitar el censo comercial?`,
                        showCancelButton: true,
                        confirmButtonText: 'Solicitar Censo',
                        cancelButtonText: 'Cerrar',
                        confirmButtonColor: '#0284c7'
                    }).then(res => {
                        if (res.isConfirmed) this.abrirModalPrecenso();
                    });
                }
                return;
            }

            activeContribuyente = match;
            activeTab = 'solvencia';

            const container = document.getElementById('portal-main-content');
            if (container) this.render(container);
        },

        cerrarSesion: function() {
            activeContribuyente = null;
            const container = document.getElementById('portal-main-content');
            if (container) this.render(container);
        },

        cambiarTab: function(tab) {
            activeTab = tab;
            const container = document.getElementById('portal-main-content');
            if (container) this.render(container);
        },

        calcularEnVivo: function() {
            const store = global.HaciendaStore;
            if (!store || !activeContribuyente) return;

            const patentes = (store.get('hacienda_patentes') || []).filter(p => String(p.contribuyente_id) === String(activeContribuyente.id));
            const p = patentes[0] || null;

            const alicuota = p ? Number(p.alicuota || 0.01) : 0.01;
            const minimoTcmmv = p ? Number(p.minimo_tcmmv || 0.30) : 0.30;
            const baseImponible = parseFloat(document.getElementById('dec-base-imponible').value || 0);

            const impAlicuota = baseImponible * alicuota;
            const minTributable = minimoTcmmv * TASA_BCV_DEFAULT;
            const totalPagar = Math.max(impAlicuota, minTributable);

            const elImp = document.getElementById('calc-imp-alicuota');
            const elMin = document.getElementById('calc-min-tributable');
            const elTot = document.getElementById('calc-total-pagar');

            if (elImp) elImp.innerText = impAlicuota.toLocaleString('es-VE', { minimumFractionDigits: 2 }) + ' Bs.';
            if (elMin) elMin.innerText = minTributable.toLocaleString('es-VE', { minimumFractionDigits: 2 }) + ' Bs.';
            if (elTot) elTot.innerText = totalPagar.toLocaleString('es-VE', { minimumFractionDigits: 2 }) + ' Bs.';
        },

        presentarDeclaracion: async function() {
            const store = global.HaciendaStore;
            if (!store || !activeContribuyente) return;

            const patentes = (store.get('hacienda_patentes') || []).filter(p => String(p.contribuyente_id) === String(activeContribuyente.id));
            const p = patentes[0] || null;

            const mes = parseInt(document.getElementById('dec-mes').value, 10);
            const anio = parseInt(document.getElementById('dec-anio').value, 10);
            const baseImponible = parseFloat(document.getElementById('dec-base-imponible').value || 0);

            if (isNaN(baseImponible) || baseImponible < 0) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Monto inválido', text: 'Ingrese una base imponible válida.', confirmButtonColor: '#0284c7' });
                return;
            }

            const alicuota = p ? Number(p.alicuota || 0.01) : 0.01;
            const minimoTcmmv = p ? Number(p.minimo_tcmmv || 0.30) : 0.30;
            const impAlicuota = baseImponible * alicuota;
            const minTributable = minimoTcmmv * TASA_BCV_DEFAULT;
            const totalPagar = Math.max(impAlicuota, minTributable);

            const nuevaDeclaracion = {
                id: Date.now(),
                contribuyente_id: activeContribuyente.id,
                patente_id: p ? p.id : 1,
                anio: anio,
                mes: mes,
                base_imponible_bs: baseImponible,
                alicuota_aplicada: alicuota,
                impuesto_alicuota_bs: impAlicuota,
                minimo_tributable_bs: minTributable,
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
                    text: `Declaración de ${MESES[mes - 1]} ${anio} registrada exitosamente. Monto determinado: ${totalPagar.toFixed(2)} Bs.`,
                    confirmButtonColor: '#0284c7'
                });
            }

            this.cambiarTab('pagar');
        },

        pagarDeclaracionDirecta: function(decId) {
            this.cambiarTab('pagar');
            setTimeout(() => {
                const sel = document.getElementById('pago-declaracion-id');
                if (sel) sel.value = decId;
            }, 100);
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
                        text: 'Seleccione la declaración, indique referencia bancaria y monto válido.',
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
                    title: 'Pago Reportado',
                    text: 'Su pago ha sido recibido y enviado a Taquilla para conciliación bancaria.',
                    confirmButtonColor: '#0284c7'
                });
            }

            this.cambiarTab('historial');
        },

        verSolvenciaOficial: function() {
            if (!activeContribuyente) return;
            const c = activeContribuyente;

            // Generar o desplegar la Solvencia Municipal Oficial
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'SOLVENCIA MUNICIPAL OFICIAL',
                    html: `
                        <div class="text-left font-mono text-xs space-y-2 p-3 bg-slate-950 text-slate-200 rounded-xl border border-slate-800">
                            <div class="text-center font-bold text-sky-400">ALCALDÍA MUNICIPAL — HACIENDA</div>
                            <div class="text-center text-[10px] text-slate-400">CERTIFICADO DE SOLVENCIA TRIBUTARIA</div>
                            <hr class="border-slate-800 my-2">
                            <div><strong>RUC / RIF:</strong> ${c.rif}</div>
                            <div><strong>RAZÓN SOCIAL:</strong> ${c.razon_social}</div>
                            <div><strong>DENOMINACIÓN:</strong> ${c.denominacion_comercial || 'N/A'}</div>
                            <div><strong>ESTADO:</strong> <span class="text-emerald-400 font-bold">SOLVENTE HASTA 30 DÍAS</span></div>
                            <div><strong>FECHA EMISIÓN:</strong> ${new Date().toLocaleDateString('es-VE')}</div>
                            <div class="text-center py-4">
                                <div class="inline-block p-2 bg-white rounded-lg">
                                    <i class="fas fa-qrcode text-black text-6xl"></i>
                                </div>
                                <div class="text-[9px] text-slate-500 mt-1">QR DE SEGURIDAD FISCAL — VALIDACIÓN EN LÍNEA</div>
                            </div>
                        </div>
                    `,
                    confirmButtonText: 'Imprimir Solvencia',
                    showCancelButton: true,
                    cancelButtonText: 'Cerrar',
                    confirmButtonColor: '#0284c7'
                }).then(res => {
                    if (res.isConfirmed) window.print();
                });
            }
        },

        abrirModalPrecenso: function() {
            const modal = document.getElementById('modal-precenso-comercio');
            if (modal) modal.classList.remove('hidden');
        },

        cerrarModalPrecenso: function() {
            const modal = document.getElementById('modal-precenso-comercio');
            if (modal) modal.classList.add('hidden');
        },

        guardarPrecenso: async function() {
            const store = global.HaciendaStore;
            if (!store) return;

            const rif = document.getElementById('precenso-rif').value.trim().toUpperCase();
            const razon = document.getElementById('precenso-razon').value.trim();
            const denominacion = document.getElementById('precenso-denominacion').value.trim();
            const telefono = document.getElementById('precenso-telefono').value.trim();
            const correo = document.getElementById('precenso-correo').value.trim();
            const direccion = document.getElementById('precenso-direccion').value.trim();

            if (!rif || !razon) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Datos requeridos', text: 'Indique RIF y Razón Social.', confirmButtonColor: '#0284c7' });
                return;
            }

            const nuevoContribuyente = {
                id: Date.now(),
                rif: rif,
                razon_social: razon,
                denominacion_comercial: denominacion,
                tipo_persona: 'juridica',
                correo: correo,
                telefono: telefono,
                direccion_fiscal: direccion,
                estado: 'activo'
            };

            await store.set('hacienda_contribuyentes', nuevoContribuyente);
            this.cerrarModalPrecenso();

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Comercio Registrado',
                    text: 'Registro comercial completado a 0ms.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }

            this.seleccionarRif(rif);
        }
    };

    global.PortalComercio = Portal;
})(typeof window !== 'undefined' ? window : this);
