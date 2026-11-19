/**
 * ALCARAVAN — Portal Oficial del Contribuyente (Suite Tributaria Integral)
 * Inspirado en SATGUAICA (Guaicaipuro) con diseño Bento Grid estilo Apple.
 * Módulos: Mis Empresas (LOCAT), Mis Inmuebles, Mis Vehículos, Mis Publicidades, Tasas y Cuentas Bancarias.
 * Arquitectura SGB Silhouettes V3 (0ms Latencia, Offline-First, LocalForage).
 */
(function definePortalComercio(global) {
    "use strict";

    let activeContribuyente = null;
    let activeModule = 'grid'; // 'grid', 'empresas', 'inmuebles', 'vehiculos', 'publicidad', 'tasas', 'cuentas'
    let activeEmpresaTab = 'declarar'; // 'declarar', 'pagar', 'solvencia', 'historial'
    const TASA_MMAV = 56.50; // Bs. por TCMMV / MMAV (Art. 30 LOCAT)

    const MESES = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const Portal = {
        getActiveContribuyente: () => activeContribuyente,

        render: function(container) {
            const store = global.HaciendaStore;
            if (!store) {
                container.innerHTML = '<div class="p-12 text-center text-neutral-500 font-mono text-xs">Cargando sistema...</div>';
                return;
            }

            if (!activeContribuyente) {
                this.renderConsultaHero(container);
            } else {
                this.renderDashboardSuite(container);
            }
        },

        renderConsultaHero: function(container) {
            container.innerHTML = `
                <div class="max-w-4xl mx-auto space-y-16 py-12 sm:py-20 text-center animate-fade-in">
                    <!-- Apple Hero Headline -->
                    <div class="space-y-4">
                        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300 text-xs font-medium tracking-wide">
                            <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                            <span>Hacienda Digital · LOCAT 2026</span>
                        </div>
                        <h1 class="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white leading-tight">
                            Tributos.<br>
                            <span class="text-neutral-500">Hecho simple.</span>
                        </h1>
                        <p class="text-neutral-400 text-sm sm:text-base max-w-lg mx-auto font-normal leading-relaxed pt-2">
                            Autoliquidaciones mensuales, inmuebles, patentes de vehículos, publicidad comercial y solvencias oficiales con código QR.
                        </p>
                    </div>

                    <!-- Apple Search Capsule -->
                    <div class="max-w-md mx-auto space-y-4">
                        <div class="flex items-center bg-[#161618] border border-white/10 hover:border-white/20 focus-within:border-white/30 rounded-full p-1.5 shadow-2xl transition duration-200">
                            <select id="pc-rif-tipo" class="bg-transparent text-white font-medium text-xs px-3.5 py-2.5 outline-none border-r border-white/10 cursor-pointer">
                                <option value="J" class="bg-[#1c1c1e] text-white">J</option>
                                <option value="V" class="bg-[#1c1c1e] text-white">V</option>
                                <option value="G" class="bg-[#1c1c1e] text-white">G</option>
                                <option value="E" class="bg-[#1c1c1e] text-white">E</option>
                            </select>
                            <input type="text" id="pc-rif-numero" placeholder="RIF (ej. 30123456-7)" 
                                   onkeydown="if(event.key==='Enter') window.PortalComercio.ejecutarConsultaRif()"
                                   class="w-full bg-transparent text-white text-xs sm:text-sm font-mono px-3.5 py-2 outline-none placeholder:text-neutral-600">
                            <button onclick="window.PortalComercio.ejecutarConsultaRif()" 
                                    class="bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-full px-5 py-2.5 transition shrink-0 flex items-center gap-1.5 shadow-sm">
                                <span>Ingresar</span>
                                <i class="fas fa-arrow-right text-[10px]"></i>
                            </button>
                        </div>

                        <div>
                            <button onclick="window.PortalComercio.abrirModalInscripcion()" 
                                    class="text-neutral-500 hover:text-neutral-300 text-xs font-medium transition inline-flex items-center gap-1">
                                <span>¿Establecimiento no registrado? Solicitar censo municipal</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>

                    <!-- Bento Grid de Módulos Tributarios -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-left">
                        <div class="p-8 rounded-3xl bg-[#121214] border border-white/[0.06] space-y-3 hover:border-white/[0.12] transition">
                            <div class="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white text-sm">
                                <i class="fas fa-suitcase"></i>
                            </div>
                            <h3 class="text-sm font-semibold text-white">Mis Empresas (LOCAT)</h3>
                            <p class="text-xs text-neutral-400 leading-relaxed">
                                Autoliquidación mensual, cálculo de alícuotas, comprobantes bancarios y emisión de Solvencia Oficial QR.
                            </p>
                        </div>

                        <div class="p-8 rounded-3xl bg-[#121214] border border-white/[0.06] space-y-3 hover:border-white/[0.12] transition">
                            <div class="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white text-sm">
                                <i class="fas fa-building"></i>
                            </div>
                            <h3 class="text-sm font-semibold text-white">Inmuebles y Vehículos</h3>
                            <p class="text-xs text-neutral-400 leading-relaxed">
                                Control de derecho de frente, terrenos urbanos y patentes automotrices comerciales o particulares.
                            </p>
                        </div>

                        <div class="p-8 rounded-3xl bg-[#121214] border border-white/[0.06] space-y-3 hover:border-white/[0.12] transition">
                            <div class="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white text-sm">
                                <i class="fas fa-university"></i>
                            </div>
                            <h3 class="text-sm font-semibold text-white">Cuentas y Pagos</h3>
                            <p class="text-xs text-neutral-400 leading-relaxed">
                                Cuentas recaudadoras oficiales de la Alcaldía y conciliación electrónica a 0ms sin intermediarios.
                            </p>
                        </div>
                    </div>
                </div>

                ${this.renderModalInscripcion()}
            `;
        },

        renderDashboardSuite: function(container) {
            const store = global.HaciendaStore;
            const c = activeContribuyente;

            // Datos del contribuyente
            const patentes = (store.get('hacienda_patentes') || []).filter(p => String(p.contribuyente_id) === String(c.id));
            const declaraciones = (store.get('hacienda_declaraciones') || []).filter(d => String(d.contribuyente_id) === String(c.id));
            const declaracionesPendientes = declaraciones.filter(d => d.estado === 'pendiente');
            const totalDeudaBs = declaracionesPendientes.reduce((acc, d) => acc + Number(d.impuesto_determinado_bs || 0), 0);
            const esSolvente = declaracionesPendientes.length === 0;

            const inmuebles = (store.get('hacienda_inmuebles') || []).filter(i => String(i.contribuyente_id) === String(c.id));
            const vehiculos = (store.get('hacienda_vehiculos') || []).filter(v => String(v.contribuyente_id) === String(c.id));
            const publicidades = (store.get('hacienda_publicidad') || []).filter(p => String(p.contribuyente_id) === String(c.id));
            const pagos = (store.get('hacienda_pagos') || []).filter(p => String(p.contribuyente_id) === String(c.id));
            const cuentas = store.get('hacienda_cuentas') || [];

            container.innerHTML = `
                <div class="max-w-5xl mx-auto space-y-8 py-6">
                    <!-- Barra de Bienvenida y Tasa MMAV (Estilo SATGUAICA / Apple) -->
                    <div class="p-8 rounded-3xl bg-[#121214] border border-white/[0.08] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div class="space-y-2">
                            <div class="flex items-center gap-3">
                                <h2 class="text-xl sm:text-2xl font-semibold text-white tracking-tight">${c.razon_social}</h2>
                                ${esSolvente ? `
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        Solvente
                                    </span>
                                ` : `
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-medium">
                                        <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        ${declaracionesPendientes.length} por pagar
                                    </span>
                                `}
                            </div>
                            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400 font-mono">
                                <span>RIF: ${c.rif}</span>
                                <span class="text-neutral-600">·</span>
                                <span>${patentes.length} Empresa(s) registrada(s)</span>
                                <span class="text-neutral-600">·</span>
                                <span>${c.correo || 'Contribuyente Municipal'}</span>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 shrink-0">
                            <!-- Píldora Tasa MMAV (Art 30 LOCAT) -->
                            <div class="px-4 py-2 rounded-2xl bg-[#1c1c1e] border border-white/10 text-xs font-mono">
                                <span class="text-neutral-500 text-[10px] block uppercase font-sans">Tasa MMAV / TCMMV</span>
                                <span class="text-white font-bold">${TASA_MMAV.toFixed(2)} Bs.</span>
                            </div>

                            <button onclick="window.PortalComercio.cerrarConsulta()" 
                                    class="text-xs text-neutral-400 hover:text-white px-4 py-2.5 rounded-2xl border border-white/10 hover:border-white/20 transition">
                                Salir
                            </button>
                        </div>
                    </div>

                    <!-- Si el usuario está en el Menú Principal (Grid) o dentro de un Módulo -->
                    ${activeModule === 'grid' ? this.renderAppGrid(patentes, inmuebles, vehiculos, publicidades, pagos, esSolvente, declaracionesPendientes) : ''}
                    ${activeModule === 'empresas' ? this.renderModuloEmpresas(c, patentes[0], declaraciones, declaracionesPendientes, totalDeudaBs, esSolvente, pagos, cuentas) : ''}
                    ${activeModule === 'inmuebles' ? this.renderModuloInmuebles(inmuebles) : ''}
                    ${activeModule === 'vehiculos' ? this.renderModuloVehiculos(vehiculos) : ''}
                    ${activeModule === 'publicidad' ? this.renderModuloPublicidad(publicidades) : ''}
                    ${activeModule === 'tasas' ? this.renderModuloTasas(declaraciones, pagos) : ''}
                    ${activeModule === 'cuentas' ? this.renderModuloCuentas(cuentas) : ''}
                </div>

                ${this.renderModalInscripcion()}
            `;
        },

        renderAppGrid: function(patentes, inmuebles, vehiculos, publicidades, pagos, esSolvente, declaracionesPendientes) {
            return `
                <div class="space-y-6">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-medium uppercase tracking-wider text-neutral-500">Suite de Tributos Municipales</span>
                        <span class="text-xs text-neutral-600">Selecciona un área para gestionar</span>
                    </div>

                    <!-- Apple Bento Grid (6 Módulos de SATGUAICA) -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- 1. Mis Empresas (Actividades Económicas) -->
                        <div onclick="window.PortalComercio.navegarModulo('empresas')" 
                             class="p-8 rounded-3xl bg-[#121214] border border-white/[0.08] hover:border-white/20 transition cursor-pointer space-y-4 group relative overflow-hidden shadow-xl">
                            <div class="flex items-center justify-between">
                                <div class="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-lg">
                                    <i class="fas fa-suitcase"></i>
                                </div>
                                ${esSolvente ? `
                                    <span class="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Solvente</span>
                                ` : `
                                    <span class="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">${declaracionesPendientes.length} Pendiente(s)</span>
                                `}
                            </div>
                            <div class="space-y-1">
                                <h3 class="text-base font-semibold text-white group-hover:text-sky-300 transition">Mis Empresas</h3>
                                <p class="text-xs text-neutral-400 leading-relaxed">
                                    Patentes comerciales, autoliquidación mensual LOCAT, pago de tributos y Solvencia QR.
                                </p>
                            </div>
                            <div class="pt-2 text-xs text-neutral-500 font-mono flex items-center justify-between border-t border-white/5">
                                <span>${patentes.length} Patente(s)</span>
                                <span class="group-hover:translate-x-1 transition text-white">Gestionar →</span>
                            </div>
                        </div>

                        <!-- 2. Mis Inmuebles (Derecho de Frente) -->
                        <div onclick="window.PortalComercio.navegarModulo('inmuebles')" 
                             class="p-8 rounded-3xl bg-[#121214] border border-white/[0.08] hover:border-white/20 transition cursor-pointer space-y-4 group relative overflow-hidden shadow-xl">
                            <div class="flex items-center justify-between">
                                <div class="w-12 h-12 rounded-2xl bg-neutral-500/10 border border-neutral-500/20 text-neutral-300 flex items-center justify-center text-lg">
                                    <i class="fas fa-building"></i>
                                </div>
                                <span class="text-[10px] font-mono text-neutral-500">Catastro</span>
                            </div>
                            <div class="space-y-1">
                                <h3 class="text-base font-semibold text-white group-hover:text-neutral-200 transition">Mis Inmuebles</h3>
                                <p class="text-xs text-neutral-400 leading-relaxed">
                                    Registro de inmuebles urbanos, terrenos, locales comerciales y cálculo de derecho de frente.
                                </p>
                            </div>
                            <div class="pt-2 text-xs text-neutral-500 font-mono flex items-center justify-between border-t border-white/5">
                                <span>${inmuebles.length} Inmueble(s)</span>
                                <span class="group-hover:translate-x-1 transition text-white">Consultar →</span>
                            </div>
                        </div>

                        <!-- 3. Mis Vehículos (Patente Vehicular) -->
                        <div onclick="window.PortalComercio.navegarModulo('vehiculos')" 
                             class="p-8 rounded-3xl bg-[#121214] border border-white/[0.08] hover:border-white/20 transition cursor-pointer space-y-4 group relative overflow-hidden shadow-xl">
                            <div class="flex items-center justify-between">
                                <div class="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-lg">
                                    <i class="fas fa-car"></i>
                                </div>
                                <span class="text-[10px] font-mono text-neutral-500">Trimestres</span>
                            </div>
                            <div class="space-y-1">
                                <h3 class="text-base font-semibold text-white group-hover:text-rose-300 transition">Mis Vehículos</h3>
                                <p class="text-xs text-neutral-400 leading-relaxed">
                                    Registro automotriz comercial o particular, consulta de trimestres y pago de patentes.
                                </p>
                            </div>
                            <div class="pt-2 text-xs text-neutral-500 font-mono flex items-center justify-between border-t border-white/5">
                                <span>${vehiculos.length} Vehículo(s)</span>
                                <span class="group-hover:translate-x-1 transition text-white">Consultar →</span>
                            </div>
                        </div>

                        <!-- 4. Mis Publicidades (Propaganda Comercial) -->
                        <div onclick="window.PortalComercio.navegarModulo('publicidad')" 
                             class="p-8 rounded-3xl bg-[#121214] border border-white/[0.08] hover:border-white/20 transition cursor-pointer space-y-4 group relative overflow-hidden shadow-xl">
                            <div class="flex items-center justify-between">
                                <div class="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-lg">
                                    <i class="fas fa-object-group"></i>
                                </div>
                                <span class="text-[10px] font-mono text-neutral-500">Vallas y Avisos</span>
                            </div>
                            <div class="space-y-1">
                                <h3 class="text-base font-semibold text-white group-hover:text-purple-300 transition">Mis Publicidades</h3>
                                <p class="text-xs text-neutral-400 leading-relaxed">
                                    Registro de avisos luminosos, vallas publicitarias en fachada y metros cuadrados autorizados.
                                </p>
                            </div>
                            <div class="pt-2 text-xs text-neutral-500 font-mono flex items-center justify-between border-t border-white/5">
                                <span>${publicidades.length} Aviso(s)</span>
                                <span class="group-hover:translate-x-1 transition text-white">Consultar →</span>
                            </div>
                        </div>

                        <!-- 5. Gestión de Tasas y Multas -->
                        <div onclick="window.PortalComercio.navegarModulo('tasas')" 
                             class="p-8 rounded-3xl bg-[#121214] border border-white/[0.08] hover:border-white/20 transition cursor-pointer space-y-4 group relative overflow-hidden shadow-xl">
                            <div class="flex items-center justify-between">
                                <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
                                    <i class="fas fa-file-invoice"></i>
                                </div>
                                <span class="text-[10px] font-mono text-neutral-500">Historial</span>
                            </div>
                            <div class="space-y-1">
                                <h3 class="text-base font-semibold text-white group-hover:text-amber-300 transition">Tasas y Multas</h3>
                                <p class="text-xs text-neutral-400 leading-relaxed">
                                    Timbres fiscales, certificaciones administrativas, estado de cuenta y recibos correlativos.
                                </p>
                            </div>
                            <div class="pt-2 text-xs text-neutral-500 font-mono flex items-center justify-between border-t border-white/5">
                                <span>${pagos.length} Comprobante(s)</span>
                                <span class="group-hover:translate-x-1 transition text-white">Revisar →</span>
                            </div>
                        </div>

                        <!-- 6. Cuentas Bancarias Municipales -->
                        <div onclick="window.PortalComercio.navegarModulo('cuentas')" 
                             class="p-8 rounded-3xl bg-[#121214] border border-white/[0.08] hover:border-white/20 transition cursor-pointer space-y-4 group relative overflow-hidden shadow-xl">
                            <div class="flex items-center justify-between">
                                <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg">
                                    <i class="fas fa-university"></i>
                                </div>
                                <span class="text-[10px] font-mono text-neutral-500">Oficial</span>
                            </div>
                            <div class="space-y-1">
                                <h3 class="text-base font-semibold text-white group-hover:text-indigo-300 transition">Cuentas Bancarias</h3>
                                <p class="text-xs text-neutral-400 leading-relaxed">
                                    Datos bancarios del Banco de Venezuela y Banesco para realizar transferencias y pagos móviles.
                                </p>
                            </div>
                            <div class="pt-2 text-xs text-neutral-500 font-mono flex items-center justify-between border-t border-white/5">
                                <span>Cuentas Recaudadoras</span>
                                <span class="group-hover:translate-x-1 transition text-white">Ver Cuentas →</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderModuloEmpresas: function(c, patenteActiva, declaraciones, declaracionesPendientes, totalDeudaBs, esSolvente, pagos, cuentas) {
            const alicuota = patenteActiva ? Number(patenteActiva.alicuota || 0.01) : 0.01;
            const minimoTcmmv = patenteActiva ? Number(patenteActiva.minimo_tcmmv || 0.30) : 0.30;
            const minimoBs = minimoTcmmv * TASA_MMAV;

            return `
                <div class="space-y-8 animate-fade-in">
                    <!-- Breadcrumb de Regreso -->
                    <div class="flex items-center justify-between">
                        <button onclick="window.PortalComercio.navegarModulo('grid')" 
                                class="text-xs text-neutral-400 hover:text-white font-medium transition flex items-center gap-2">
                            <span>← Volver a la Suite</span>
                        </button>
                        <span class="text-xs font-mono text-neutral-500">Módulo: Mis Empresas / Actividades Económicas</span>
                    </div>

                    <!-- Apple Segmented Control para Empresas -->
                    <div class="flex justify-center">
                        <div class="inline-flex p-1 bg-[#161618] border border-white/10 rounded-full">
                            <button onclick="window.PortalComercio.cambiarEmpresaTab('declarar')" 
                                    class="px-5 py-2 rounded-full text-xs font-medium transition ${activeEmpresaTab === 'declarar' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'}">
                                Autoliquidar
                            </button>
                            <button onclick="window.PortalComercio.cambiarEmpresaTab('pagar')" 
                                    class="px-5 py-2 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${activeEmpresaTab === 'pagar' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'}">
                                <span>Pagar</span>
                                ${declaracionesPendientes.length > 0 ? `
                                    <span class="w-4 h-4 rounded-full ${activeEmpresaTab === 'pagar' ? 'bg-black text-white' : 'bg-white/20 text-white'} text-[9px] flex items-center justify-center font-bold">
                                        ${declaracionesPendientes.length}
                                    </span>
                                ` : ''}
                            </button>
                            <button onclick="window.PortalComercio.cambiarEmpresaTab('solvencia')" 
                                    class="px-5 py-2 rounded-full text-xs font-medium transition ${activeEmpresaTab === 'solvencia' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'}">
                                Solvencia QR
                            </button>
                            <button onclick="window.PortalComercio.cambiarEmpresaTab('historial')" 
                                    class="px-5 py-2 rounded-full text-xs font-medium transition ${activeEmpresaTab === 'historial' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'}">
                                Historial
                            </button>
                        </div>
                    </div>

                    <!-- Contenido del Tab Activo en Empresas -->
                    ${this.renderContenidoEmpresa(activeEmpresaTab, c, patenteActiva, alicuota, minimoTcmmv, minimoBs, declaraciones, declaracionesPendientes, totalDeudaBs, esSolvente, pagos, cuentas)}
                </div>
            `;
        },

        renderContenidoEmpresa: function(tab, c, patenteActiva, alicuota, minimoTcmmv, minimoBs, declaraciones, declaracionesPendientes, totalDeudaBs, esSolvente, pagos, cuentas) {
            if (tab === 'declarar') {
                return `
                    <div class="p-8 sm:p-10 rounded-3xl bg-[#121214] border border-white/[0.08] shadow-2xl space-y-8">
                        <div class="space-y-1">
                            <h3 class="text-lg font-semibold text-white">Autoliquidación Mensual (LOCAT)</h3>
                            <p class="text-xs text-neutral-400">
                                Alícuota aplicable: <strong class="text-white">${(alicuota * 100).toFixed(2)}%</strong> · Mínimo tributable: <strong class="text-white">${minimoTcmmv.toFixed(2)} MMAV (${minimoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.)</strong>
                            </p>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div class="space-y-1.5">
                                <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Mes a Declarar</label>
                                <select id="dec-mes" class="w-full bg-[#18181b] border border-white/10 text-white text-xs font-medium rounded-2xl px-4 py-3.5 outline-none focus:border-white/30 transition cursor-pointer">
                                    ${MESES.map((m, idx) => `<option value="${idx + 1}" ${new Date().getMonth() + 1 === (idx + 1) ? 'selected' : ''}>${m}</option>`).join('')}
                                </select>
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Año Fiscal</label>
                                <input type="number" id="dec-anio" value="${new Date().getFullYear()}" 
                                       class="w-full bg-[#18181b] border border-white/10 text-white text-xs font-mono font-medium rounded-2xl px-4 py-3.5 outline-none focus:border-white/30 transition">
                            </div>
                        </div>

                        <!-- Input Protagónico de Ventas -->
                        <div class="space-y-2 p-6 rounded-2xl bg-[#0a0a0c] border border-white/[0.06]">
                            <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Ingresos Brutos Facturados del Mes (Bs)</label>
                            <input type="number" step="0.01" id="dec-base-imponible" placeholder="0,00" 
                                   oninput="window.PortalComercio.calcularEnVivo(${alicuota}, ${minimoBs})"
                                   class="w-full bg-transparent text-white text-3xl sm:text-4xl font-semibold tracking-tight outline-none placeholder:text-neutral-700 font-mono">
                            <span class="text-[11px] text-neutral-500 block">Monto total facturado en el mes para el cálculo de la autoliquidación.</span>
                        </div>

                        <!-- Resumen Bento -->
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div class="p-5 rounded-2xl bg-[#161618] border border-white/5 space-y-1">
                                <span class="text-[11px] text-neutral-500 uppercase tracking-wider block font-medium">Por Alícuota</span>
                                <div id="calc-imp-alicuota" class="text-base font-semibold text-neutral-300 font-mono">0,00 Bs.</div>
                            </div>
                            <div class="p-5 rounded-2xl bg-[#161618] border border-white/5 space-y-1">
                                <span class="text-[11px] text-neutral-500 uppercase tracking-wider block font-medium">Mínimo MMAV</span>
                                <div id="calc-min-tributable" class="text-base font-semibold text-neutral-300 font-mono">${minimoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</div>
                            </div>
                            <div class="p-5 rounded-2xl bg-[#161618] border border-white/10 space-y-1">
                                <span class="text-[11px] text-white uppercase tracking-wider block font-semibold">Total Determinado</span>
                                <div id="calc-total-pagar" class="text-xl font-bold text-white font-mono">0,00 Bs.</div>
                            </div>
                        </div>

                        <div class="flex justify-end pt-2">
                            <button onclick="window.PortalComercio.presentarDeclaracion(${alicuota}, ${minimoBs})" 
                                    class="bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-full px-8 py-3.5 transition shadow-lg flex items-center gap-2">
                                <span>Presentar Declaración</span>
                                <i class="fas fa-arrow-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                `;
            } else if (tab === 'pagar') {
                return `
                    <div class="space-y-6">
                        <!-- Tarjetas de Cuentas Bancarias -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            ${cuentas.map(cta => `
                                <div class="p-6 rounded-3xl bg-gradient-to-br from-[#1c1c1e] to-[#121214] border border-white/10 shadow-xl space-y-4 relative group">
                                    <div class="flex items-center justify-between">
                                        <div class="text-xs font-bold text-white uppercase tracking-wider">${cta.banco || cta.banco_nombre}</div>
                                        <span class="text-[10px] text-neutral-400 font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/5">${cta.tipo || 'Corriente'}</span>
                                    </div>
                                    <div class="space-y-1">
                                        <div class="text-base font-mono font-bold text-white tracking-wider select-all">${cta.numero || cta.numero_cuenta}</div>
                                        <div class="text-xs text-neutral-400">${cta.concepto || 'Recaudación Tributaria Municipal'}</div>
                                    </div>
                                    <button onclick="window.PortalComercio.copiarAlPortapapeles('${cta.numero || cta.numero_cuenta}')" 
                                            class="w-full py-2 bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white text-xs font-medium rounded-xl transition flex items-center justify-center gap-1.5 border border-white/5">
                                        <i class="fas fa-copy text-[10px]"></i>
                                        <span>Copiar Número de Cuenta</span>
                                    </button>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Formulario de Consignación -->
                        <div class="p-8 sm:p-10 rounded-3xl bg-[#121214] border border-white/[0.08] shadow-2xl space-y-6">
                            <div class="space-y-1">
                                <h3 class="text-lg font-semibold text-white">Reportar Transferencia de Impuesto</h3>
                                <p class="text-xs text-neutral-400">Ingresa la referencia bancaria para su conciliación automática a 0ms.</p>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Declaración a Cancelar</label>
                                    <select id="pago-declaracion-id" class="w-full bg-[#18181b] border border-white/10 text-white text-xs font-medium rounded-2xl px-4 py-3 outline-none focus:border-white/30 transition">
                                        ${declaracionesPendientes.length === 0 ? `
                                            <option value="">No tienes declaraciones pendientes</option>
                                        ` : declaracionesPendientes.map(d => `
                                            <option value="${d.id}">${MESES[d.mes - 1]} ${d.anio} — ${Number(d.impuesto_determinado_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Banco de Origen (Tu Banco)</label>
                                    <input type="text" id="pago-banco-origen" placeholder="Ej: Banesco, Mercantil, BDV" 
                                           class="w-full bg-[#18181b] border border-white/10 text-white text-xs font-medium rounded-2xl px-4 py-3 outline-none focus:border-white/30 transition">
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Banco Receptor (Alcaldía)</label>
                                    <select id="pago-banco-destino" class="w-full bg-[#18181b] border border-white/10 text-white text-xs font-medium rounded-2xl px-4 py-3 outline-none focus:border-white/30 transition">
                                        ${cuentas.map(cta => `<option value="${cta.banco || cta.banco_nombre}">${cta.banco || cta.banco_nombre}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Número de Referencia Bancaria</label>
                                    <input type="text" id="pago-referencia" placeholder="Ej: 000987654321" 
                                           class="w-full bg-[#18181b] border border-white/10 text-white font-mono text-xs font-medium rounded-2xl px-4 py-3 outline-none focus:border-white/30 transition">
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Monto Pagado en Bs</label>
                                    <input type="number" step="0.01" id="pago-monto" placeholder="0,00" 
                                           class="w-full bg-[#18181b] border border-white/10 text-white font-mono text-xs font-medium rounded-2xl px-4 py-3 outline-none focus:border-white/30 transition">
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Fecha de Pago</label>
                                    <input type="date" id="pago-fecha" value="${new Date().toISOString().split('T')[0]}" 
                                           class="w-full bg-[#18181b] border border-white/10 text-white text-xs font-medium rounded-2xl px-4 py-3 outline-none focus:border-white/30 transition">
                                </div>
                            </div>

                            <div class="flex justify-end pt-2">
                                <button onclick="window.PortalComercio.guardarPago()" 
                                        class="bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-full px-8 py-3.5 transition shadow-lg flex items-center gap-2">
                                    <span>Consignar Pago</span>
                                    <i class="fas fa-check text-[10px]"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else if (tab === 'solvencia') {
                return `
                    <div class="max-w-2xl mx-auto space-y-6">
                        ${esSolvente ? `
                            <!-- Apple Wallet Pass Style Certificate -->
                            <div class="rounded-3xl bg-gradient-to-b from-[#1c1c1e] to-[#0a0a0c] border border-white/10 p-8 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
                                <div class="flex items-center justify-between border-b border-white/10 pb-6">
                                    <div class="space-y-0.5">
                                        <div class="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Alcaldía Municipal · Hacienda</div>
                                        <h3 class="text-base font-semibold text-white tracking-tight">Certificado de Solvencia</h3>
                                    </div>
                                    <div class="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                                        Activa (30 días)
                                    </div>
                                </div>

                                <div class="space-y-4 text-xs font-mono">
                                    <div class="flex justify-between border-b border-white/5 pb-2">
                                        <span class="text-neutral-500">Contribuyente</span>
                                        <span class="text-white font-semibold font-sans">${c.razon_social}</span>
                                    </div>
                                    <div class="flex justify-between border-b border-white/5 pb-2">
                                        <span class="text-neutral-500">RIF Fiscal</span>
                                        <span class="text-white font-semibold">${c.rif}</span>
                                    </div>
                                    <div class="flex justify-between border-b border-white/5 pb-2">
                                        <span class="text-neutral-500">Patente / Licencia</span>
                                        <span class="text-white">${patenteActiva ? patenteActiva.numero_patente : 'VIGENTE'}</span>
                                    </div>
                                    <div class="flex justify-between border-b border-white/5 pb-2">
                                        <span class="text-neutral-500">Fecha de Emisión</span>
                                        <span class="text-white">${new Date().toLocaleDateString('es-VE')}</span>
                                    </div>
                                </div>

                                <!-- QR Central Estilo Apple Pass -->
                                <div class="p-6 rounded-2xl bg-white flex flex-col items-center justify-center space-y-2 text-black text-center shadow-lg">
                                    <i class="fas fa-qrcode text-6xl"></i>
                                    <span class="text-[9px] font-mono font-bold tracking-widest uppercase text-neutral-700">Verificación Fiscal Oficial</span>
                                </div>

                                <div class="flex justify-center pt-2">
                                    <button onclick="window.print()" 
                                            class="bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-full px-8 py-3.5 transition shadow-lg flex items-center gap-2">
                                        <i class="fas fa-print text-xs"></i>
                                        <span>Imprimir Certificado</span>
                                    </button>
                                </div>
                            </div>
                        ` : `
                            <div class="p-8 rounded-3xl bg-[#121214] border border-rose-500/20 space-y-4 text-center">
                                <div class="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto text-lg">
                                    <i class="fas fa-lock"></i>
                                </div>
                                <div class="space-y-1">
                                    <h3 class="text-base font-semibold text-white">Solvencia Bloqueada</h3>
                                    <p class="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                                        Presentas un saldo pendiente de <strong class="text-white font-mono">${totalDeudaBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</strong> Liquida tus declaraciones para desbloquear tu certificado.
                                    </p>
                                </div>
                                <button onclick="window.PortalComercio.cambiarEmpresaTab('pagar')" 
                                        class="bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-full px-6 py-2.5 transition inline-flex items-center gap-1.5 shadow">
                                    <span>Ir a Pagar Deuda</span>
                                    <i class="fas fa-arrow-right text-[10px]"></i>
                                </button>
                            </div>
                        `}
                    </div>
                `;
            } else if (tab === 'historial') {
                return `
                    <div class="p-8 rounded-3xl bg-[#121214] border border-white/[0.08] shadow-2xl space-y-6">
                        <div class="flex items-center justify-between border-b border-white/5 pb-4">
                            <h3 class="text-base font-semibold text-white">Declaraciones y Pagos</h3>
                            <span class="text-xs font-mono text-neutral-500">${declaraciones.length} registros</span>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs font-mono">
                                <thead>
                                    <tr class="text-neutral-500 border-b border-white/5">
                                        <th class="py-3 px-2 font-normal">Período</th>
                                        <th class="py-3 px-2 text-right font-normal">Base Imponible</th>
                                        <th class="py-3 px-2 text-right font-normal">Monto Determinado</th>
                                        <th class="py-3 px-2 text-center font-normal">Estado</th>
                                        <th class="py-3 px-2 font-normal">Referencia</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/[0.04] text-neutral-300">
                                    ${declaraciones.length === 0 ? `
                                        <tr>
                                            <td colspan="5" class="py-8 text-center text-neutral-500 font-sans">
                                                No tienes declaraciones registradas aún.
                                            </td>
                                        </tr>
                                    ` : declaraciones.map(d => {
                                        const pago = pagos.find(p => String(p.declaracion_id) === String(d.id));
                                        return `
                                            <tr class="hover:bg-white/[0.02] transition">
                                                <td class="py-3 px-2 text-white font-sans font-medium">${MESES[d.mes - 1]} ${d.anio}</td>
                                                <td class="py-3 px-2 text-right text-neutral-400">${Number(d.base_imponible_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</td>
                                                <td class="py-3 px-2 text-right text-white font-semibold">${Number(d.impuesto_determinado_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</td>
                                                <td class="py-3 px-2 text-center">
                                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-medium ${d.estado === 'pagada' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}">
                                                        ${d.estado || 'pendiente'}
                                                    </span>
                                                </td>
                                                <td class="py-3 px-2 text-neutral-400">
                                                    ${pago ? `${pago.banco_destino} Ref: ${pago.referencia_bancaria}` : '—'}
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

        renderModuloInmuebles: function(inmuebles) {
            return `
                <div class="space-y-6 animate-fade-in">
                    <div class="flex items-center justify-between">
                        <button onclick="window.PortalComercio.navegarModulo('grid')" 
                                class="text-xs text-neutral-400 hover:text-white font-medium transition flex items-center gap-2">
                            <span>← Volver a la Suite</span>
                        </button>
                        <span class="text-xs font-mono text-neutral-500">Módulo: Mis Inmuebles / Catastro</span>
                    </div>

                    <div class="p-8 sm:p-10 rounded-3xl bg-[#121214] border border-white/[0.08] shadow-2xl space-y-6">
                        <div class="flex items-center justify-between border-b border-white/5 pb-4">
                            <div>
                                <h3 class="text-lg font-semibold text-white">Inmuebles Urbanos y Terrenos</h3>
                                <p class="text-xs text-neutral-400">Control catastral del derecho de frente inmobiliario municipal.</p>
                            </div>
                            <button onclick="window.PortalComercio.abrirModalInmueble()" 
                                    class="bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-full px-5 py-2 transition shadow">
                                + Registrar Inmueble
                            </button>
                        </div>

                        ${inmuebles.length === 0 ? `
                            <div class="py-12 text-center text-neutral-500 space-y-2">
                                <i class="fas fa-building text-3xl opacity-30"></i>
                                <div class="text-xs">No tienes inmuebles catastrados a tu nombre todavía.</div>
                            </div>
                        ` : `
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                ${inmuebles.map(inm => `
                                    <div class="p-6 rounded-2xl bg-[#18181b] border border-white/5 space-y-2">
                                        <div class="flex items-center justify-between">
                                            <span class="text-xs font-mono font-bold text-sky-400">${inm.numero_catastro}</span>
                                            <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/5 text-neutral-400">${inm.uso || 'Comercial'}</span>
                                        </div>
                                        <div class="text-sm font-semibold text-white">${inm.direccion}</div>
                                        <div class="text-xs text-neutral-400 font-mono">Valor Fiscal: ${Number(inm.valor_fiscal_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>

                ${this.renderModalNuevoInmueble()}
            `;
        },

        renderModuloVehiculos: function(vehiculos) {
            return `
                <div class="space-y-6 animate-fade-in">
                    <div class="flex items-center justify-between">
                        <button onclick="window.PortalComercio.navegarModulo('grid')" 
                                class="text-xs text-neutral-400 hover:text-white font-medium transition flex items-center gap-2">
                            <span>← Volver a la Suite</span>
                        </button>
                        <span class="text-xs font-mono text-neutral-500">Módulo: Mis Vehículos / Patente Automotriz</span>
                    </div>

                    <div class="p-8 sm:p-10 rounded-3xl bg-[#121214] border border-white/[0.08] shadow-2xl space-y-6">
                        <div class="flex items-center justify-between border-b border-white/5 pb-4">
                            <div>
                                <h3 class="text-lg font-semibold text-white">Vehículos Registrados</h3>
                                <p class="text-xs text-neutral-400">Patente automotriz para transporte de carga, comerciales o particulares.</p>
                            </div>
                            <button onclick="window.PortalComercio.abrirModalVehiculo()" 
                                    class="bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-full px-5 py-2 transition shadow">
                                + Registrar Vehículo
                            </button>
                        </div>

                        ${vehiculos.length === 0 ? `
                            <div class="py-12 text-center text-neutral-500 space-y-2">
                                <i class="fas fa-car text-3xl opacity-30"></i>
                                <div class="text-xs">No tienes vehículos registrados en tu cuenta.</div>
                            </div>
                        ` : `
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                ${vehiculos.map(v => `
                                    <div class="p-6 rounded-2xl bg-[#18181b] border border-white/5 space-y-2">
                                        <div class="flex items-center justify-between">
                                            <span class="text-sm font-mono font-bold text-white tracking-wider">${v.placa}</span>
                                            <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/5 text-neutral-400">${v.uso || 'Carga'}</span>
                                        </div>
                                        <div class="text-xs font-semibold text-neutral-300">${v.marca} ${v.modelo} (${v.anio})</div>
                                        <div class="text-[11px] text-emerald-400 font-mono">Estatus: ${v.estado || 'Al día'}</div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>

                ${this.renderModalNuevoVehiculo()}
            `;
        },

        renderModuloPublicidad: function(publicidades) {
            return `
                <div class="space-y-6 animate-fade-in">
                    <div class="flex items-center justify-between">
                        <button onclick="window.PortalComercio.navegarModulo('grid')" 
                                class="text-xs text-neutral-400 hover:text-white font-medium transition flex items-center gap-2">
                            <span>← Volver a la Suite</span>
                        </button>
                        <span class="text-xs font-mono text-neutral-500">Módulo: Propaganda y Publicidad Comercial</span>
                    </div>

                    <div class="p-8 sm:p-10 rounded-3xl bg-[#121214] border border-white/[0.08] shadow-2xl space-y-6">
                        <div class="flex items-center justify-between border-b border-white/5 pb-4">
                            <div>
                                <h3 class="text-lg font-semibold text-white">Avisos y Propaganda Comercial</h3>
                                <p class="text-xs text-neutral-400">Vallas, avisos luminosos y publicidad en vitrina conforme a la LOCAT.</p>
                            </div>
                            <button onclick="window.PortalComercio.abrirModalPublicidad()" 
                                    class="bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-full px-5 py-2 transition shadow">
                                + Registrar Aviso
                            </button>
                        </div>

                        ${publicidades.length === 0 ? `
                            <div class="py-12 text-center text-neutral-500 space-y-2">
                                <i class="fas fa-object-group text-3xl opacity-30"></i>
                                <div class="text-xs">No tienes publicidad comercial registrada aún.</div>
                            </div>
                        ` : `
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                ${publicidades.map(pub => `
                                    <div class="p-6 rounded-2xl bg-[#18181b] border border-white/5 space-y-2">
                                        <div class="flex items-center justify-between">
                                            <span class="text-xs font-bold text-white uppercase">${pub.tipo}</span>
                                            <span class="text-[10px] font-mono text-sky-400">${pub.metros_cuadrados} m²</span>
                                        </div>
                                        <div class="text-xs text-neutral-300">${pub.texto_aviso || 'Aviso en fachada'}</div>
                                        <div class="text-[11px] text-neutral-500">${pub.ubicacion || 'Local comercial'}</div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>

                ${this.renderModalNuevaPublicidad()}
            `;
        },

        renderModuloTasas: function(declaraciones, pagos) {
            return `
                <div class="space-y-6 animate-fade-in">
                    <div class="flex items-center justify-between">
                        <button onclick="window.PortalComercio.navegarModulo('grid')" 
                                class="text-xs text-neutral-400 hover:text-white font-medium transition flex items-center gap-2">
                            <span>← Volver a la Suite</span>
                        </button>
                        <span class="text-xs font-mono text-neutral-500">Módulo: Gestión de Tasas y Multas</span>
                    </div>

                    <div class="p-8 sm:p-10 rounded-3xl bg-[#121214] border border-white/[0.08] shadow-2xl space-y-6">
                        <div class="border-b border-white/5 pb-4">
                            <h3 class="text-lg font-semibold text-white">Historial de Recibos y Comprobantes</h3>
                            <p class="text-xs text-neutral-400">Registro de todas las transacciones consignadas ante la taquilla municipal.</p>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs font-mono">
                                <thead>
                                    <tr class="text-neutral-500 border-b border-white/5">
                                        <th class="py-3 px-2 font-normal">Recibo Nro</th>
                                        <th class="py-3 px-2 font-normal">Fecha</th>
                                        <th class="py-3 px-2 font-normal">Banco Receptor</th>
                                        <th class="py-3 px-2 font-normal">Referencia</th>
                                        <th class="py-3 px-2 text-right font-normal">Monto (Bs)</th>
                                        <th class="py-3 px-2 text-center font-normal">Estado</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/[0.04] text-neutral-300">
                                    ${pagos.length === 0 ? `
                                        <tr>
                                            <td colspan="6" class="py-8 text-center text-neutral-500 font-sans">
                                                No hay recibos registrados en tu historial.
                                            </td>
                                        </tr>
                                    ` : pagos.map(p => `
                                        <tr class="hover:bg-white/[0.02] transition">
                                            <td class="py-3 px-2 text-white font-bold">${p.numero_recibo || 'REC-2026'}</td>
                                            <td class="py-3 px-2 text-neutral-400">${p.fecha_pago}</td>
                                            <td class="py-3 px-2 text-neutral-300">${p.banco_destino}</td>
                                            <td class="py-3 px-2 text-sky-400">${p.referencia_bancaria}</td>
                                            <td class="py-3 px-2 text-right font-bold text-white">${Number(p.monto_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</td>
                                            <td class="py-3 px-2 text-center">
                                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-medium ${p.estado === 'conciliado' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}">
                                                    ${p.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        },

        renderModuloCuentas: function(cuentas) {
            return `
                <div class="space-y-6 animate-fade-in">
                    <div class="flex items-center justify-between">
                        <button onclick="window.PortalComercio.navegarModulo('grid')" 
                                class="text-xs text-neutral-400 hover:text-white font-medium transition flex items-center gap-2">
                            <span>← Volver a la Suite</span>
                        </button>
                        <span class="text-xs font-mono text-neutral-500">Módulo: Cuentas Bancarias Oficiales</span>
                    </div>

                    <div class="space-y-6">
                        <div class="p-8 sm:p-10 rounded-3xl bg-[#121214] border border-white/[0.08] shadow-2xl space-y-4">
                            <h3 class="text-lg font-semibold text-white">Cuentas Recaudadoras de la Alcaldía</h3>
                            <p class="text-xs text-neutral-400 max-w-xl">
                                Realiza tus pagos exclusivamente a las siguientes cuentas oficiales. Copia el número de cuenta y asegúrate de guardar el número de referencia para consignarlo en el portal.
                            </p>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                ${cuentas.map(cta => `
                                    <div class="p-6 rounded-3xl bg-gradient-to-br from-[#1c1c1e] to-[#121214] border border-white/10 shadow-xl space-y-4 relative group">
                                        <div class="flex items-center justify-between">
                                            <div class="text-xs font-bold text-white uppercase tracking-wider">${cta.banco || cta.banco_nombre}</div>
                                            <span class="text-[10px] text-neutral-400 font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/5">${cta.tipo || 'Corriente'}</span>
                                        </div>
                                        <div class="space-y-1">
                                            <div class="text-base font-mono font-bold text-white tracking-wider select-all">${cta.numero || cta.numero_cuenta}</div>
                                            <div class="text-xs text-neutral-400">${cta.concepto || 'Recaudación Tributaria Municipal'}</div>
                                        </div>
                                        <button onclick="window.PortalComercio.copiarAlPortapapeles('${cta.numero || cta.numero_cuenta}')" 
                                                class="w-full py-2.5 bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white text-xs font-medium rounded-xl transition flex items-center justify-center gap-1.5 border border-white/5">
                                            <i class="fas fa-copy text-[10px]"></i>
                                            <span>Copiar Número de Cuenta</span>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        navegarModulo: function(modulo) {
            activeModule = modulo;
            if (modulo === 'empresas') activeEmpresaTab = 'declarar';
            const container = document.getElementById('portal-main-content');
            if (container) this.render(container);
        },

        cambiarEmpresaTab: function(tab) {
            activeEmpresaTab = tab;
            const container = document.getElementById('portal-main-content');
            if (container) this.render(container);
        },

        ejecutarConsultaRif: function() {
            const tipo = document.getElementById('pc-rif-tipo').value;
            const numero = (document.getElementById('pc-rif-numero').value || '').trim().toUpperCase();

            if (!numero) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'warning', title: 'RIF Requerido', text: 'Ingresa el número de RIF del contribuyente.', confirmButtonColor: '#000000' });
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
                        text: `El RIF ${cleanRif} no se encuentra registrado en el Padrón Municipal. ¿Deseas solicitar la inscripción?`,
                        showCancelButton: true,
                        confirmButtonText: 'Inscribir Comercio',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#000000'
                    }).then(res => {
                        if (res.isConfirmed) {
                            this.abrirModalInscripcion(cleanRif);
                        }
                    });
                }
                return;
            }

            activeContribuyente = match;
            activeModule = 'grid'; // Abre la Suite Principal

            const container = document.getElementById('portal-main-content');
            if (container) this.render(container);
        },

        cerrarConsulta: function() {
            activeContribuyente = null;
            activeModule = 'grid';
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
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Monto inválido', text: 'Ingresa un monto de ventas válido.', confirmButtonColor: '#000000' });
                return;
            }

            const declaraciones = store.get('hacienda_declaraciones') || [];
            const yaExiste = declaraciones.some(d => String(d.contribuyente_id) === String(activeContribuyente.id) && d.mes === mes && d.anio === anio);
            if (yaExiste) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'warning', title: 'Período ya declarado', text: `Ya existe una declaración para ${MESES[mes - 1]} ${anio}.`, confirmButtonColor: '#000000' });
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
                tasa_bcv_aplicada: TASA_MMAV,
                estado: 'pendiente',
                fecha_declaracion: new Date().toISOString()
            };

            await store.set('hacienda_declaraciones', nuevaDeclaracion);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Declaración Registrada',
                    text: `Monto determinado: ${totalPagar.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs. Procede a reportar el pago.`,
                    confirmButtonColor: '#000000'
                });
            }

            this.cambiarEmpresaTab('pagar');
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
                        text: 'Selecciona la declaración, ingresa referencia y monto válido.',
                        confirmButtonColor: '#000000'
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
                    title: 'Comprobante Consignado',
                    text: 'El pago ha sido registrado y será conciliado por taquilla.',
                    confirmButtonColor: '#000000'
                });
            }

            this.cambiarEmpresaTab('historial');
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
            const codigoActividad = document.getElementById('ins-actividad').value;
            const telefono = document.getElementById('ins-telefono').value.trim();
            const correo = document.getElementById('ins-correo').value.trim();

            if (!numero || !razon) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Datos requeridos', text: 'Indica RIF y Razón Social.', confirmButtonColor: '#000000' });
                return;
            }

            const rifCompleto = tipo + '-' + numero.replace(/^[JVGE]-?/i, '');
            const contribuyenteId = Date.now();

            const nuevoContribuyente = {
                id: contribuyenteId,
                rif: rifCompleto,
                razon_social: razon,
                denominacion_comercial: razon,
                tipo_persona: tipo === 'V' ? 'natural' : 'juridica',
                correo: correo,
                telefono: telefono,
                direccion_fiscal: '',
                estado: 'activo'
            };

            await store.set('hacienda_contribuyentes', nuevoContribuyente);

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
            this.seleccionarRif(rifCompleto);
        },

        renderModalInscripcion: function() {
            const catalogo = global.CatalogoLocat ? global.CatalogoLocat.getAll() : [];

            return `
                <div id="modal-inscripcion-comercio" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden flex items-center justify-center p-4">
                    <div class="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-6">
                        <div class="flex items-center justify-between border-b border-white/5 pb-4">
                            <div class="space-y-0.5">
                                <h3 class="text-base font-semibold text-white">Inscripción en el Padrón Comercial</h3>
                                <p class="text-xs text-neutral-400">Registra tu comercio para autoliquidación y solvencias en línea.</p>
                            </div>
                            <button onclick="window.PortalComercio.cerrarModalInscripcion()" class="text-neutral-500 hover:text-white p-2">
                                <i class="fas fa-times text-sm"></i>
                            </button>
                        </div>

                        <div class="space-y-4 text-xs">
                            <div class="grid grid-cols-3 gap-3">
                                <div>
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase block mb-1">Tipo</label>
                                    <select id="ins-rif-tipo" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none focus:border-white/30">
                                        <option value="J">J</option>
                                        <option value="V">V</option>
                                        <option value="G">G</option>
                                        <option value="E">E</option>
                                    </select>
                                </div>
                                <div class="col-span-2">
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase block mb-1">Número de RIF</label>
                                    <input type="text" id="ins-rif-numero" placeholder="Ej: 30123456-7" class="w-full bg-[#18181b] border border-white/10 text-white font-mono rounded-xl px-3 py-2.5 outline-none focus:border-white/30">
                                </div>
                            </div>

                            <div>
                                <label class="text-[11px] font-medium text-neutral-400 uppercase block mb-1">Razón Social (Nombre Legal)</label>
                                <input type="text" id="ins-razon" placeholder="Ej: INVERSIONES GUIRIRI C.A." class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none focus:border-white/30">
                            </div>

                            <div>
                                <label class="text-[11px] font-medium text-neutral-400 uppercase block mb-1">Actividad Económica (LOCAT)</label>
                                <select id="ins-actividad" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none focus:border-white/30">
                                    ${catalogo.map(item => `
                                        <option value="${item.codigo}">[${item.codigo}] ${item.nombre} — ${(item.alicuota * 100).toFixed(2)}%</option>
                                    `).join('')}
                                </select>
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase block mb-1">Teléfono</label>
                                    <input type="text" id="ins-telefono" placeholder="0414-0000000" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none focus:border-white/30">
                                </div>
                                <div>
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase block mb-1">Correo Electrónico</label>
                                    <input type="email" id="ins-correo" placeholder="correo@comercio.com" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none focus:border-white/30">
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end gap-3 pt-2 border-t border-white/5">
                            <button onclick="window.PortalComercio.cerrarModalInscripcion()" class="px-5 py-2.5 text-xs text-neutral-400 hover:text-white rounded-full">Cancelar</button>
                            <button onclick="window.PortalComercio.guardarInscripcion()" class="bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-full px-6 py-2.5 transition">Registrar Comercio</button>
                        </div>
                    </div>
                </div>
            `;
        },

        // Modal para registrar Inmueble
        renderModalNuevoInmueble: function() {
            return `
                <div id="modal-nuevo-inmueble" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden flex items-center justify-center p-4">
                    <div class="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-4">
                        <div class="flex items-center justify-between border-b border-white/5 pb-3">
                            <h3 class="text-sm font-semibold text-white">Registrar Inmueble</h3>
                            <button onclick="window.PortalComercio.cerrarModalInmueble()" class="text-neutral-500 hover:text-white"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="space-y-3 text-xs">
                            <div>
                                <label class="text-[11px] text-neutral-400 block mb-1">Número de Catastro</label>
                                <input type="text" id="inm-catastro" placeholder="Ej: 01-02-03-0001" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none">
                            </div>
                            <div>
                                <label class="text-[11px] text-neutral-400 block mb-1">Dirección del Inmueble</label>
                                <textarea id="inm-direccion" rows="2" placeholder="Calle, número de local o parcela..." class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2 outline-none"></textarea>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="text-[11px] text-neutral-400 block mb-1">Uso</label>
                                    <select id="inm-uso" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none">
                                        <option value="Comercial">Comercial</option>
                                        <option value="Industrial">Industrial</option>
                                        <option value="Residencial">Residencial</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="text-[11px] text-neutral-400 block mb-1">Valor Fiscal (Bs)</label>
                                    <input type="number" step="0.01" id="inm-valor" placeholder="0.00" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none font-mono">
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-end gap-2 pt-2 border-t border-white/5">
                            <button onclick="window.PortalComercio.cerrarModalInmueble()" class="px-4 py-2 text-xs text-neutral-400">Cancelar</button>
                            <button onclick="window.PortalComercio.guardarInmueble()" class="bg-white text-black text-xs font-semibold rounded-full px-5 py-2">Guardar</button>
                        </div>
                    </div>
                </div>
            `;
        },

        abrirModalInmueble: function() {
            const m = document.getElementById('modal-nuevo-inmueble');
            if (m) m.classList.remove('hidden');
        },

        cerrarModalInmueble: function() {
            const m = document.getElementById('modal-nuevo-inmueble');
            if (m) m.classList.add('hidden');
        },

        guardarInmueble: async function() {
            const store = global.HaciendaStore;
            if (!store || !activeContribuyente) return;

            const catastro = document.getElementById('inm-catastro').value.trim();
            const direccion = document.getElementById('inm-direccion').value.trim();
            const uso = document.getElementById('inm-uso').value;
            const valor = parseFloat(document.getElementById('inm-valor').value || 0);

            if (!catastro || !direccion) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Datos requeridos', text: 'Indica catastro y dirección.', confirmButtonColor: '#000000' });
                return;
            }

            const nuevoInmueble = {
                id: Date.now(),
                contribuyente_id: activeContribuyente.id,
                numero_catastro: catastro,
                direccion: direccion,
                uso: uso,
                valor_fiscal_bs: valor,
                estado: 'activo'
            };

            await store.set('hacienda_inmuebles', nuevoInmueble);
            this.cerrarModalInmueble();
            this.navegarModulo('inmuebles');
        },

        // Modal para registrar Vehículo
        renderModalNuevoVehiculo: function() {
            return `
                <div id="modal-nuevo-vehiculo" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden flex items-center justify-center p-4">
                    <div class="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-4">
                        <div class="flex items-center justify-between border-b border-white/5 pb-3">
                            <h3 class="text-sm font-semibold text-white">Registrar Vehículo</h3>
                            <button onclick="window.PortalComercio.cerrarModalVehiculo()" class="text-neutral-500 hover:text-white"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="space-y-3 text-xs">
                            <div>
                                <label class="text-[11px] text-neutral-400 block mb-1">Placa</label>
                                <input type="text" id="veh-placa" placeholder="Ej: A12BC3D" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none uppercase font-mono">
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="text-[11px] text-neutral-400 block mb-1">Marca</label>
                                    <input type="text" id="veh-marca" placeholder="Ej: Chevrolet" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none">
                                </div>
                                <div>
                                    <label class="text-[11px] text-neutral-400 block mb-1">Modelo</label>
                                    <input type="text" id="veh-modelo" placeholder="Ej: Silverado" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none">
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="text-[11px] text-neutral-400 block mb-1">Año</label>
                                    <input type="number" id="veh-anio" value="2022" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none font-mono">
                                </div>
                                <div>
                                    <label class="text-[11px] text-neutral-400 block mb-1">Uso</label>
                                    <select id="veh-uso" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none">
                                        <option value="Carga">Carga / Reparto</option>
                                        <option value="Comercial">Comercial</option>
                                        <option value="Particular">Particular</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-end gap-2 pt-2 border-t border-white/5">
                            <button onclick="window.PortalComercio.cerrarModalVehiculo()" class="px-4 py-2 text-xs text-neutral-400">Cancelar</button>
                            <button onclick="window.PortalComercio.guardarVehiculo()" class="bg-white text-black text-xs font-semibold rounded-full px-5 py-2">Guardar</button>
                        </div>
                    </div>
                </div>
            `;
        },

        abrirModalVehiculo: function() {
            const m = document.getElementById('modal-nuevo-vehiculo');
            if (m) m.classList.remove('hidden');
        },

        cerrarModalVehiculo: function() {
            const m = document.getElementById('modal-nuevo-vehiculo');
            if (m) m.classList.add('hidden');
        },

        guardarVehiculo: async function() {
            const store = global.HaciendaStore;
            if (!store || !activeContribuyente) return;

            const placa = document.getElementById('veh-placa').value.trim().toUpperCase();
            const marca = document.getElementById('veh-marca').value.trim();
            const modelo = document.getElementById('veh-modelo').value.trim();
            const anio = parseInt(document.getElementById('veh-anio').value, 10);
            const uso = document.getElementById('veh-uso').value;

            if (!placa || !marca) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Datos requeridos', text: 'Indica placa y marca.', confirmButtonColor: '#000000' });
                return;
            }

            const nuevoVehiculo = {
                id: Date.now(),
                contribuyente_id: activeContribuyente.id,
                placa: placa,
                marca: marca,
                modelo: modelo,
                anio: anio,
                uso: uso,
                estado: 'activo'
            };

            await store.set('hacienda_vehiculos', nuevoVehiculo);
            this.cerrarModalVehiculo();
            this.navegarModulo('vehiculos');
        },

        // Modal para registrar Publicidad
        renderModalNuevaPublicidad: function() {
            return `
                <div id="modal-nueva-publicidad" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden flex items-center justify-center p-4">
                    <div class="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-4">
                        <div class="flex items-center justify-between border-b border-white/5 pb-3">
                            <h3 class="text-sm font-semibold text-white">Registrar Publicidad Comercial</h3>
                            <button onclick="window.PortalComercio.cerrarModalPublicidad()" class="text-neutral-500 hover:text-white"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="space-y-3 text-xs">
                            <div>
                                <label class="text-[11px] text-neutral-400 block mb-1">Tipo de Propaganda</label>
                                <select id="pub-tipo" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none">
                                    <option value="Aviso Luminoso">Aviso Luminoso en Fachada</option>
                                    <option value="Valla Publicitaria">Valla Publicitaria</option>
                                    <option value="Marquesina">Marquesina / Toldos</option>
                                    <option value="Aviso Pintado">Aviso Pintado en Pared</option>
                                </select>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="text-[11px] text-neutral-400 block mb-1">Área (m²)</label>
                                    <input type="number" step="0.1" id="pub-metros" placeholder="Ej: 3.5" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none font-mono">
                                </div>
                                <div>
                                    <label class="text-[11px] text-neutral-400 block mb-1">Ubicación</label>
                                    <input type="text" id="pub-ubicacion" placeholder="Ej: Fachada Principal" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none">
                                </div>
                            </div>
                            <div>
                                <label class="text-[11px] text-neutral-400 block mb-1">Texto o Leyenda del Aviso</label>
                                <input type="text" id="pub-texto" placeholder="Nombre comercial mostrado" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none">
                            </div>
                        </div>
                        <div class="flex justify-end gap-2 pt-2 border-t border-white/5">
                            <button onclick="window.PortalComercio.cerrarModalPublicidad()" class="px-4 py-2 text-xs text-neutral-400">Cancelar</button>
                            <button onclick="window.PortalComercio.guardarPublicidad()" class="bg-white text-black text-xs font-semibold rounded-full px-5 py-2">Guardar</button>
                        </div>
                    </div>
                </div>
            `;
        },

        abrirModalPublicidad: function() {
            const m = document.getElementById('modal-nueva-publicidad');
            if (m) m.classList.remove('hidden');
        },

        cerrarModalPublicidad: function() {
            const m = document.getElementById('modal-nueva-publicidad');
            if (m) m.classList.add('hidden');
        },

        guardarPublicidad: async function() {
            const store = global.HaciendaStore;
            if (!store || !activeContribuyente) return;

            const tipo = document.getElementById('pub-tipo').value;
            const metros = parseFloat(document.getElementById('pub-metros').value || 0);
            const ubicacion = document.getElementById('pub-ubicacion').value.trim();
            const texto = document.getElementById('pub-texto').value.trim();

            if (metros <= 0) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Datos requeridos', text: 'Indica los metros cuadrados.', confirmButtonColor: '#000000' });
                return;
            }

            const nuevaPub = {
                id: Date.now(),
                contribuyente_id: activeContribuyente.id,
                tipo: tipo,
                metros_cuadrados: metros,
                ubicacion: ubicacion,
                texto_aviso: texto,
                estado: 'activo'
            };

            await store.set('hacienda_publicidad', nuevaPub);
            this.cerrarModalPublicidad();
            this.navegarModulo('publicidad');
        },

        copiarAlPortapapeles: function(texto) {
            navigator.clipboard.writeText(texto).then(() => {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Copiado',
                        text: 'Número de cuenta copiado.',
                        timer: 1000,
                        showConfirmButton: false
                    });
                }
            });
        }
    };

    global.PortalComercio = Portal;
})(typeof window !== 'undefined' ? window : this);
