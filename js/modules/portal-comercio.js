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
    let loginModo = 'rif'; // 'rif' o 'correo'

    async function hashClave(text) {
        if (!text) return '';
        if (global.HaciendaAuth && typeof global.HaciendaAuth.hashPassword === 'function') {
            return await global.HaciendaAuth.hashPassword(text);
        }
        if (!crypto || !crypto.subtle) {
            try { return btoa(unescape(encodeURIComponent(text))); } catch (_) { return btoa(text); }
        }
        const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function getTasaMMAV() {
        if (global.TasasBCV && typeof global.TasasBCV.getTCMMV === 'function') {
            return global.TasasBCV.getTCMMV();
        }
        return 1007.40;
    }

    function getTasasInfo() {
        if (global.TasasBCV && typeof global.TasasBCV.getTasas === 'function') {
            return global.TasasBCV.getTasas();
        }
        return {
            usd: 917.78,
            eur: 1007.40,
            tcmmv: 1007.40,
            cny: 126.76,
            jpy: 5.94,
            rub: 9.16,
            try: 26.60,
            fechaFormateada: new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
        };
    }

    const MESES = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const AVISOS_CARRUSEL = [
        {
            id: 'slide_1',
            tag: 'LOCAT 2026 · VIGENTE',
            titulo: 'Armonización Tributaria en San José de Guaribe',
            descripcion: 'Adecuación integral de licencias de actividades económicas y tabulador nacional de alícuotas. Autoliquidación en línea con 0ms de latencia.',
            btn_texto: 'Consultar RIF',
            btn_icono: 'fa-arrow-right',
            badge_bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
            gradient: 'from-sky-950/80 via-neutral-900/90 to-[#0e0e11]',
            icon: 'fa-landmark'
        },
        {
            id: 'slide_2',
            tag: 'CRONOGRAMA FISCAL',
            titulo: 'Declaración Mensual de Ingresos Brutos',
            descripcion: 'Declara tus ingresos del mes dentro de los primeros 15 días continuos. Cálculo automatizado según la Tasa de Mayor Valor (TCMMV) del Banco Central de Venezuela.',
            btn_texto: 'Ver Calendario Fiscal',
            btn_icono: 'fa-calendar-alt',
            badge_bg: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
            gradient: 'from-amber-950/80 via-neutral-900/90 to-[#0e0e11]',
            icon: 'fa-calendar-check'
        },
        {
            id: 'slide_3',
            tag: 'SOLVENCIAS DIGITALES QR',
            titulo: 'Certificados Tributarios al Instante',
            descripcion: 'Emisión inmediata de Solvencias Municipales Únicas con verificación criptográfica QR de 30 días continuos para trámites comerciales y bancarios.',
            btn_texto: 'Ver Normativa',
            btn_icono: 'fa-file-download',
            badge_bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
            gradient: 'from-indigo-950/80 via-neutral-900/90 to-[#0e0e11]',
            icon: 'fa-qrcode'
        }
    ];

    const ORDENANZAS_MUNICIPALES = [
        {
            id: 'ord_locat',
            numero: 'Gaceta Municipal N° Extraordinario 04-2024',
            titulo: 'Ordenanza sobre Actividades Económicas de Industria, Comercio y Servicios',
            categoria: 'ordenanzas',
            tipo_badge: 'LOCAT ARMONIZADA',
            badge_color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            fecha: 'Adecuación LOCAT 2026',
            resumen: 'Regula el impuesto sobre ingresos brutos, clasificador único de actividades económicas, alícuotas armonizadas (0.5% al 3%) y mínimos tributables en TCMMV.',
            paginas: '48 págs.',
            archivo_nombre: 'Ordenanza_Actividades_Economicas_Guaribe_LOCAT.pdf',
            articulos: [
                'Art. 15: Autoliquidación mensual obligatoria dentro de los primeros quince (15) días de cada mes calendario.',
                'Art. 22: Mínimo tributable expresado en la Moneda de Mayor Valor (TCMMV) fijada por el BCV.',
                'Art. 38: Solvencia municipal anual requerida para contrataciones y funcionamiento comercial.'
            ]
        },
        {
            id: 'ord_inmuebles',
            numero: 'Gaceta Municipal N° Ordinario 112',
            titulo: 'Ordenanza del Impuesto sobre Inmuebles Urbanos y Catastro Municipal',
            categoria: 'ordenanzas',
            tipo_badge: 'CATASTRO FISCAL',
            badge_color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            fecha: 'Vigente 2026',
            resumen: 'Establece las bases para la determinación del valor catastral del suelo y construcciones urbanas, alícuotas del Derecho de Frente y zonificación.',
            paginas: '32 págs.',
            archivo_nombre: 'Ordenanza_Inmuebles_Urbanos_Catastro_Guaribe.pdf',
            articulos: [
                'Art. 8: Obligación de inscripción en el Registro Catastral del Municipio.',
                'Art. 19: Pago trimestral o anual con descuento del 10% por pronto pago en enero.',
                'Art. 25: Tabulador de zonificación para Casco Central, sectores rurales y áreas comerciales.'
            ]
        },
        {
            id: 'ord_tasas',
            numero: 'Gaceta Municipal N° Ordinario 118',
            titulo: 'Ordenanza sobre Tasas Administrativas y Expedición de Certificaciones',
            categoria: 'tasas',
            tipo_badge: 'TRIBUTOS MENORES',
            badge_color: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
            fecha: 'Vigente 2026',
            resumen: 'Fija los costos por tramitación de solvencias, permisos de obras, copias certificadas, cartas de residencia fiscal y servicios de taquilla en TCMMV.',
            paginas: '20 págs.',
            archivo_nombre: 'Ordenanza_Tasas_Administrativas_Guaribe.pdf',
            articulos: [
                'Art. 5: Emisión de Solvencia Municipal Única a 0.10 TCMMV con validez reglamentaria de 30 días.',
                'Art. 12: Permisologías de ingeniería y conformidad de uso comercial.',
                'Art. 18: Exenciones para adultos mayores y personas en situación de vulnerabilidad.'
            ]
        },
        {
            id: 'ord_vehiculos',
            numero: 'Gaceta Municipal N° Ordinario 120',
            titulo: 'Ordenanza de Patente sobre Vehículos y Transporte Terrestre',
            categoria: 'ordenanzas',
            tipo_badge: 'PATENTE VEHICULAR',
            badge_color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            fecha: 'Vigente 2026',
            resumen: 'Regula el tributo a vehículos particulares, transporte de carga comercial, mototaxis y maquinaria pesada domiciliada en el municipio.',
            paginas: '24 págs.',
            archivo_nombre: 'Ordenanza_Patente_Vehiculos_Guaribe.pdf',
            articulos: [
                'Art. 7: Calcomanía y carnet de circulación tributaria anual.',
                'Art. 14: Escala de pago según capacidad de carga y uso comercial.',
                'Art. 20: Descuento del 15% por liquidación anticipada anual.'
            ]
        },
        {
            id: 'ord_aseo',
            numero: 'Gaceta Municipal N° Extraordinario 09',
            titulo: 'Tabulador de Tarifas del Servicio de Aseo Urbano y Domiciliario',
            categoria: 'tasas',
            tipo_badge: 'SERVICIOS PUBLICOS',
            badge_color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            fecha: 'Vigente 2026',
            resumen: 'Estructura tarifaria para recolección y disposición final de desechos sólidos comerciales, industriales, residenciales e institucionales.',
            paginas: '16 págs.',
            archivo_nombre: 'Tabulador_Aseo_Urbano_Guaribe.pdf',
            articulos: [
                'Art. 4: Tarifa comercial estratificada por metros cuadrados del establecimiento.',
                'Art. 9: Facturación conjunta en el entero mensual de actividades económicas.',
                'Art. 15: Normas de reciclaje y disposición segura para grandes generadores.'
            ]
        },
        {
            id: 'cal_fiscal_2026',
            numero: 'Resolución SATRIMG N° 001-2026',
            titulo: 'Calendario Fiscal de Obligaciones Tributarias Municipales 2026',
            categoria: 'calendario',
            tipo_badge: 'CALENDARIO OFICIAL',
            badge_color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            fecha: 'Ejercicio Fiscal 2026',
            resumen: 'Cronograma oficial de fechas límite de autoliquidación mensual, prórrogas reglamentarias y operativos especiales de recaudación parroquial.',
            paginas: '4 págs.',
            archivo_nombre: 'Calendario_Fiscal_Municipal_Guaribe_2026.pdf',
            articulos: [
                'Declaración Mensual: Del 1 al 15 de cada mes a través del portal 0ms.',
                'Cierre de Ejercicio: Liquidación definitiva anual el 31 de enero.',
                'Operativos Especiales: Segundo sábado de cada mes en plaza Bolívar de Guaribe.'
            ]
        }
    ];

    const POPUP_ACTIVO = {
        id: 'popup_guaribe_locat_2026',
        activo: true,
        badge: 'COMUNICADO OFICIAL · ALCALDÍA',
        titulo: 'Actualización y Empadronamiento Tributario LOCAT 2026',
        mensaje: 'La Alcaldía del Municipio San José de Guaribe y la Administración Tributaria Municipal informan a todos los comerciantes y contribuyentes que está activa la jornada especial de censo y adecuación de licencias de actividades económicas conforme a la Ley Orgánica de Armonización Tributaria (LOCAT). Realiza tu consulta o registro directamente desde este portal.',
        fecha: 'Ejercicio Fiscal 2026',
        enlace_texto: 'Descargar Ordenanza LOCAT en PDF',
        ordenanza_id: 'ord_locat'
    };

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

        _slideIndex: 0,
        _slideTimer: null,
        _categoriaOrdenanzas: 'todas',

        getCarruselSlides: function() {
            const store = global.HaciendaStore;
            if (store) {
                const slides = store.get('hacienda_carrusel') || [];
                const activos = slides.filter(s => s.activo !== false);
                if (activos.length > 0) {
                    return activos.sort((a, b) => (a.orden || 0) - (b.orden || 0));
                }
            }
            return AVISOS_CARRUSEL;
        },

        moveSlide: function(dir) {
            const slides = this.getCarruselSlides();
            if (slides.length === 0) return;
            this._slideIndex = (this._slideIndex + dir + slides.length) % slides.length;
            this.actualizarCarrusel();
        },

        goToSlide: function(idx) {
            this._slideIndex = idx;
            this.actualizarCarrusel();
        },

        actualizarCarrusel: function() {
            const track = document.getElementById('avisos-carousel-track');
            if (track) {
                track.style.transform = `translateX(-${this._slideIndex * 100}%)`;
            }
            const dots = document.querySelectorAll('.aviso-dot');
            dots.forEach((dot, idx) => {
                if (idx === this._slideIndex) {
                    dot.className = 'aviso-dot w-8 h-1.5 rounded-full bg-white transition-all duration-300';
                } else {
                    dot.className = 'aviso-dot w-2 h-1.5 rounded-full bg-white/30 hover:bg-white/60 transition-all duration-300';
                }
            });
        },

        iniciarCarrusel: function() {
            if (this._slideTimer) clearInterval(this._slideTimer);
            this._slideTimer = setInterval(() => {
                this.moveSlide(1);
            }, 7000);
        },

        ejecutarAccionSlide: function(enlace) {
            if (!enlace || enlace === '#buscador-rif') {
                const input = document.getElementById('pc-rif-numero');
                if (input) {
                    input.focus();
                    input.scrollIntoView({ behavior: 'smooth' });
                }
                return;
            }
            if (enlace.startsWith('modal:')) {
                const ordId = enlace.replace('modal:', '').trim();
                this.abrirDetalleOrdenanza(ordId);
                return;
            }
            if (enlace.startsWith('#')) {
                const target = document.querySelector(enlace);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            if (enlace.startsWith('http://') || enlace.startsWith('https://')) {
                window.open(enlace, '_blank');
                return;
            }
        },

        renderCarruselAvisos: function() {
            const slides = this.getCarruselSlides();
            if (!slides || slides.length === 0) return '';

            return `
                <div class="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl group bg-[#0e0e11]"
                     onmouseenter="if(window.PortalComercio._slideTimer) clearInterval(window.PortalComercio._slideTimer)"
                     onmouseleave="window.PortalComercio.iniciarCarrusel()">
                    <div id="avisos-carousel-track" class="flex transition-transform duration-700 ease-out" style="transform: translateX(0%);">
                        ${slides.map(slide => `
                            <div class="w-full flex-shrink-0 p-8 sm:p-12 relative flex flex-col justify-between min-h-[260px] bg-gradient-to-r ${slide.gradient || 'from-sky-950/80 via-neutral-900/90 to-[#0e0e11]'}">
                                <div class="absolute -right-6 -bottom-6 w-52 h-52 rounded-full bg-white/[0.03] blur-2xl pointer-events-none"></div>
                                <div class="space-y-4 max-w-2xl relative z-10 text-left">
                                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${slide.badge_bg || 'bg-sky-500/10 text-sky-400 border-sky-500/25'}">
                                        <i class="fas ${slide.icon || 'fa-landmark'} text-[10px]"></i>
                                        <span>${slide.tag || 'COMUNICADO'}</span>
                                    </div>
                                    <h2 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug drop-shadow-md">
                                        ${slide.titulo}
                                    </h2>
                                    <p class="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed">
                                        ${slide.descripcion || ''}
                                    </p>
                                </div>
                                <div class="pt-6 relative z-10 text-left">
                                    <button onclick="window.PortalComercio.ejecutarAccionSlide('${slide.btn_enlace || '#buscador-rif'}')"
                                            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition shadow-lg">
                                        <span>${slide.btn_texto || 'Ver Más'}</span>
                                        <i class="fas ${slide.btn_icono || 'fa-arrow-right'} text-[10px]"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Controles Flechas -->
                    ${slides.length > 1 ? `
                        <button onclick="window.PortalComercio.moveSlide(-1)" 
                                class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm border border-white/10 z-20">
                            <i class="fas fa-chevron-left text-xs"></i>
                        </button>
                        <button onclick="window.PortalComercio.moveSlide(1)" 
                                class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm border border-white/10 z-20">
                            <i class="fas fa-chevron-right text-xs"></i>
                        </button>
                    ` : ''}

                    <!-- Puntos Indicadores -->
                    ${slides.length > 1 ? `
                        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                            ${slides.map((_, idx) => `
                                <button onclick="window.PortalComercio.goToSlide(${idx})" 
                                        class="aviso-dot ${idx === 0 ? 'w-8 bg-white' : 'w-2 bg-white/30'} h-1.5 rounded-full transition-all duration-300"></button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        },

        filtrarOrdenanzas: function(cat) {
            this._categoriaOrdenanzas = cat;
            const container = document.getElementById('ordenanzas-grid-container');
            if (container) {
                container.innerHTML = this.generarTarjetasOrdenanzas();
            }
            const pills = document.querySelectorAll('.ord-filter-pill');
            pills.forEach(p => {
                const match = p.getAttribute('data-cat') === cat;
                p.className = match
                    ? 'ord-filter-pill px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black shadow-sm transition'
                    : 'ord-filter-pill px-4 py-1.5 rounded-full text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.06] transition';
            });
        },

        generarTarjetasOrdenanzas: function() {
            const cat = this._categoriaOrdenanzas;
            const list = cat === 'todas' ? ORDENANZAS_MUNICIPALES : ORDENANZAS_MUNICIPALES.filter(o => o.categoria === cat);

            return list.map(ord => `
                <div class="p-6 rounded-3xl bg-[#121216] border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between space-y-4 group">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${ord.badge_color}">
                                ${ord.tipo_badge}
                            </span>
                            <span class="text-[10px] font-mono text-neutral-500">${ord.paginas}</span>
                        </div>
                        <div class="space-y-1">
                            <span class="text-[11px] font-mono text-sky-400 font-semibold block">${ord.numero}</span>
                            <h3 class="text-sm font-bold text-white group-hover:text-sky-300 transition line-clamp-2 leading-snug">
                                ${ord.titulo}
                            </h3>
                        </div>
                        <p class="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                            ${ord.resumen}
                        </p>
                    </div>

                    <div class="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                        <button onclick="window.PortalComercio.abrirArticulado('${ord.id}')"
                                class="text-xs text-neutral-400 hover:text-white font-medium flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-white/5 transition">
                            <i class="fas fa-list-ul text-[10px] text-sky-400"></i>
                            <span>Artículos Clave</span>
                        </button>
                        <button onclick="window.PortalComercio.descargarOrdenanzaPDF('${ord.id}')"
                                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 text-xs font-semibold transition">
                            <i class="fas fa-file-pdf text-[10px]"></i>
                            <span>Descargar</span>
                        </button>
                    </div>
                </div>
            `).join('');
        },

        renderCentroOrdenanzas: function() {
            return `
                <div id="seccion-ordenanzas" class="pt-12 space-y-8 text-left max-w-5xl mx-auto">
                    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
                        <div>
                            <div class="inline-flex items-center gap-2 text-sky-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                                <i class="fas fa-balance-scale"></i>
                                <span>Marco Jurídico Oficial · San José de Guaribe</span>
                            </div>
                            <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Gacetas y Ordenanzas Municipales
                            </h2>
                            <p class="text-xs sm:text-sm text-neutral-400 mt-1">
                                Consulta y descarga los instrumentos legales que regulan los tributos, catastro y servicios del municipio.
                            </p>
                        </div>

                        <!-- Filtros por Categoría -->
                        <div class="flex items-center gap-1.5 bg-[#141418] p-1 rounded-full border border-white/10 shrink-0 self-start sm:self-auto">
                            <button onclick="window.PortalComercio.filtrarOrdenanzas('todas')" data-cat="todas"
                                    class="ord-filter-pill px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black shadow-sm transition">
                                Todas
                            </button>
                            <button onclick="window.PortalComercio.filtrarOrdenanzas('ordenanzas')" data-cat="ordenanzas"
                                    class="ord-filter-pill px-4 py-1.5 rounded-full text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.06] transition">
                                Ordenanzas
                            </button>
                            <button onclick="window.PortalComercio.filtrarOrdenanzas('tasas')" data-cat="tasas"
                                    class="ord-filter-pill px-4 py-1.5 rounded-full text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.06] transition">
                                Tasas y Aseo
                            </button>
                            <button onclick="window.PortalComercio.filtrarOrdenanzas('calendario')" data-cat="calendario"
                                    class="ord-filter-pill px-4 py-1.5 rounded-full text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.06] transition">
                                Calendario
                            </button>
                        </div>
                    </div>

                    <!-- Grid de Ordenanzas -->
                    <div id="ordenanzas-grid-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${this.generarTarjetasOrdenanzas()}
                    </div>
                </div>
            `;
        },

        renderModalArticulado: function() {
            return `
                <div id="modal-articulado-ordenanza" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden flex items-center justify-center p-4">
                    <div class="bg-[#141418] border border-white/10 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-left relative overflow-hidden">
                        <div class="flex items-start justify-between border-b border-white/10 pb-4">
                            <div>
                                <span id="modal-art-gaceta" class="text-[10px] font-mono text-sky-400 uppercase font-bold block mb-1">GACETA MUNICIPAL</span>
                                <h3 id="modal-art-titulo" class="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">Ordenanza Municipal</h3>
                            </div>
                            <button onclick="window.PortalComercio.cerrarModalArticulado()" class="text-neutral-400 hover:text-white p-2">
                                <i class="fas fa-times text-sm"></i>
                            </button>
                        </div>

                        <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            <div>
                                <h4 class="text-xs font-bold uppercase text-neutral-400 mb-1 font-mono">Exposición de Motivos</h4>
                                <p id="modal-art-resumen" class="text-xs text-neutral-300 leading-relaxed"></p>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold uppercase text-neutral-400 mb-2 font-mono">Disposiciones y Artículos Clave</h4>
                                <div id="modal-art-lista" class="space-y-2"></div>
                            </div>
                        </div>

                        <div class="pt-4 border-t border-white/10 flex justify-between items-center">
                            <span class="text-[10px] text-neutral-500 font-mono">Alcaldía de San José de Guaribe · SATRIMG</span>
                            <button id="modal-art-descargar-btn" class="px-5 py-2 rounded-full bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition flex items-center gap-2">
                                <i class="fas fa-file-pdf"></i>
                                <span>Descargar Documento Oficial</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        abrirArticulado: function(ordId) {
            const ord = ORDENANZAS_MUNICIPALES.find(o => o.id === ordId);
            if (!ord) return;

            const modal = document.getElementById('modal-articulado-ordenanza');
            if (!modal) return;

            document.getElementById('modal-art-gaceta').innerText = ord.numero;
            document.getElementById('modal-art-titulo').innerText = ord.titulo;
            document.getElementById('modal-art-resumen').innerText = ord.resumen;
            
            const lista = document.getElementById('modal-art-lista');
            if (lista) {
                lista.innerHTML = ord.articulos.map(art => `
                    <div class="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-neutral-200 leading-relaxed font-mono">
                        ${art}
                    </div>
                `).join('');
            }

            const dlBtn = document.getElementById('modal-art-descargar-btn');
            if (dlBtn) {
                dlBtn.onclick = () => this.descargarOrdenanzaPDF(ord.id);
            }

            modal.classList.remove('hidden');
        },

        cerrarModalArticulado: function() {
            const modal = document.getElementById('modal-articulado-ordenanza');
            if (modal) modal.classList.add('hidden');
        },

        descargarOrdenanzaPDF: function(ordId) {
            const ord = ORDENANZAS_MUNICIPALES.find(o => o.id === ordId);
            if (!ord) return;

            const jsPDF = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : null;
            if (!jsPDF) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'info',
                        title: ord.titulo,
                        html: `<div class="text-left text-xs space-y-2"><p><strong>Gaceta:</strong> ${ord.numero}</p><p>${ord.resumen}</p></div>`,
                        confirmButtonColor: '#000000'
                    });
                }
                return;
            }

            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
            
            // Membrete Oficial
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, 216, 28, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('REPÚBLICA BOLIVARIANA DE VENEZUELA', 108, 9, { align: 'center' });
            doc.setFontSize(9);
            doc.text('ESTADO BOLIVARIANO DE GUÁRICO · MUNICIPIO SAN JOSÉ DE GUARIBE', 108, 15, { align: 'center' });
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('ADMINISTRACIÓN TRIBUTARIA MUNICIPAL (SATRIMG)', 108, 21, { align: 'center' });

            // Barra dorada decorativa
            doc.setFillColor(217, 119, 6);
            doc.rect(0, 28, 216, 2, 'F');

            // Encabezado de Documento
            doc.setTextColor(30, 41, 59);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(ord.numero.toUpperCase(), 108, 38, { align: 'center' });

            doc.setFontSize(13);
            doc.setTextColor(2, 132, 199);
            const titleLines = doc.splitTextToSize(ord.titulo.toUpperCase(), 180);
            doc.text(titleLines, 108, 46, { align: 'center' });

            let y = 46 + (titleLines.length * 6) + 4;

            // Ficha Técnica
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(18, y, 180, 24, 3, 3, 'FD');

            doc.setFontSize(9);
            doc.setTextColor(71, 85, 105);
            doc.setFont('helvetica', 'bold');
            doc.text('Categoría:', 24, y + 7);
            doc.text('Fecha de Publicación:', 24, y + 14);
            doc.text('Ámbito Territorial:', 24, y + 21);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(15, 23, 42);
            doc.text(ord.tipo_badge, 75, y + 7);
            doc.text(ord.fecha, 75, y + 14);
            doc.text('Municipio San José de Guaribe, Estado Guárico', 75, y + 21);

            y += 32;

            // Resumen Normativo
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(15, 23, 42);
            doc.text('SÍNTESIS Y EXPOSICIÓN DE MOTIVOS:', 18, y);
            y += 6;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(51, 65, 85);
            const resLines = doc.splitTextToSize(ord.resumen, 180);
            doc.text(resLines, 18, y);
            y += (resLines.length * 5) + 6;

            // Artículos Destacados
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(15, 23, 42);
            doc.text('DISPOSICIONES Y ARTÍCULOS CLAVE:', 18, y);
            y += 6;

            ord.articulos.forEach(art => {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(30, 41, 59);
                const artLines = doc.splitTextToSize(`• ${art}`, 176);
                doc.text(artLines, 22, y);
                y += (artLines.length * 5) + 3;
            });

            // Sello y Validez
            y = Math.max(y + 10, 225);
            doc.setFillColor(241, 245, 249);
            doc.roundedRect(18, y, 180, 26, 2, 2, 'F');

            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            doc.text('DOCUMENTO PÚBLICO DE CONSULTA OFICIAL', 108, y + 6, { align: 'center' });
            doc.text('Administración Tributaria Municipal · Alcaldía de San José de Guaribe', 108, y + 12, { align: 'center' });
            doc.text(`Descargado el ${new Date().toLocaleDateString('es-VE')} a través del Sistema Alcaraván SGB V3`, 108, y + 18, { align: 'center' });
            doc.text('Ley Orgánica de Coordinación y Armonización Tributaria (LOCAT)', 108, y + 23, { align: 'center' });

            doc.save(ord.archivo_nombre || `${ord.id}.pdf`);
        },

        getPopupActivo: function() {
            const store = global.HaciendaStore;
            if (store) {
                const popups = store.get('hacienda_popups') || [];
                const activo = popups.find(p => p.activo && (p.destino === 'portal' || p.destino === 'ambos'));
                if (activo) return activo;
            }
            return POPUP_ACTIVO;
        },

        renderPopupOficial: function() {
            const popup = this.getPopupActivo();
            if (!popup || !popup.activo) return '';

            const esSoloImagen = popup.tipo === 'imagen' && popup.imagen_url;
            const tieneImagen = !!popup.imagen_url;

            return `
                <div id="modal-popup-oficial" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4">
                    <div class="bg-[#141418] border border-white/10 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 text-center relative overflow-hidden animate-fade-in">
                        <button onclick="window.PortalComercio.cerrarPopupOficial(false)" 
                                class="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 z-10 transition">
                            <i class="fas fa-times text-sm"></i>
                        </button>

                        ${tieneImagen ? `
                            <div class="rounded-2xl overflow-hidden border border-white/10 max-h-56 w-full bg-black/40">
                                <img src="${popup.imagen_url}" alt="Comunicado" class="w-full h-full object-cover">
                            </div>
                        ` : ''}

                        ${!esSoloImagen ? `
                            <div class="space-y-3">
                                ${!tieneImagen ? `
                                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 text-xl mx-auto shadow-lg">
                                        <i class="fas fa-bullhorn"></i>
                                    </div>
                                ` : ''}
                                <span class="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/25">
                                    ${popup.badge || 'COMUNICADO OFICIAL · ALCALDÍA'}
                                </span>
                                <h3 class="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                                    ${popup.titulo}
                                </h3>
                                ${popup.mensaje ? `
                                    <p class="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                                        ${popup.mensaje}
                                    </p>
                                ` : ''}
                            </div>
                        ` : `
                            <div class="space-y-1">
                                <h3 class="text-lg font-bold text-white tracking-tight">${popup.titulo}</h3>
                            </div>
                        `}

                        <div class="space-y-3 pt-2">
                            ${popup.ordenanza_id ? `
                                <button onclick="window.PortalComercio.descargarOrdenanzaPDF('${popup.ordenanza_id}'); window.PortalComercio.cerrarPopupOficial(false)"
                                        class="w-full py-3 px-6 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-lg flex items-center justify-center gap-2">
                                    <i class="fas fa-file-pdf"></i>
                                    <span>${popup.enlace_texto || 'Descargar Ordenanza en PDF'}</span>
                                </button>
                            ` : (popup.enlace_url ? `
                                <a href="${popup.enlace_url}" target="_blank" onclick="window.PortalComercio.cerrarPopupOficial(false)"
                                   class="w-full py-3 px-6 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-lg flex items-center justify-center gap-2 inline-block">
                                    <i class="fas fa-external-link-alt"></i>
                                    <span>Más Información / Enlace Oficial</span>
                                </a>
                            ` : '')}
                            <button onclick="window.PortalComercio.cerrarPopupOficial(true)"
                                    class="text-[11px] text-neutral-400 hover:text-white transition block mx-auto">
                                Entendido, no volver a mostrar hoy
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        cerrarPopupOficial: function(noMostrarHoy) {
            const modal = document.getElementById('modal-popup-oficial');
            if (modal) modal.classList.add('hidden');
            const popup = this.getPopupActivo();
            if (noMostrarHoy && popup && popup.id) {
                const hoy = new Date().toISOString().split('T')[0];
                localStorage.setItem(`alcaravan_popup_${popup.id}_visto`, hoy);
            }
        },

        verificarPopup: function() {
            const popup = this.getPopupActivo();
            if (!popup || !popup.activo) return;
            const hoy = new Date().toISOString().split('T')[0];
            const visto = localStorage.getItem(`alcaravan_popup_${popup.id}_visto`);
            if (visto !== hoy) {
                setTimeout(() => {
                    const modal = document.getElementById('modal-popup-oficial');
                    if (modal) modal.classList.remove('hidden');
                }, 1200);
            }
        },

        mostrarModalTasas: function() {
            const tasas = getTasasInfo();
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Tasas Oficiales BCV',
                    html: `
                        <div class="text-left text-xs space-y-2 p-2">
                            <div class="flex justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                                <span class="font-bold text-amber-900">TCMMV (LOCAT Art. 30):</span>
                                <span class="font-mono font-bold text-amber-900">${tasas.tcmmv.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span>
                            </div>
                            <div class="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                <span class="font-bold text-slate-700">Dólar (USD BCV):</span>
                                <span class="font-mono font-bold text-slate-900">${tasas.usd.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span>
                            </div>
                            <div class="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                <span class="font-bold text-slate-700">Euro (EUR BCV):</span>
                                <span class="font-mono font-bold text-slate-900">${tasas.eur.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span>
                            </div>
                            <div class="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                <span class="font-bold text-slate-700">Yuan (CNY BCV):</span>
                                <span class="font-mono font-bold text-slate-900">${tasas.cny.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span>
                            </div>
                        </div>
                    `,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#000000'
                });
            }
        },

        renderConsultaHero: function(container) {
            const tasas = getTasasInfo();
            container.innerHTML = `
                <div class="w-full max-w-md mx-auto text-center animate-fade-in py-2">
                    <!-- PORTAL DEL CONTRIBUYENTE -->
                    <div class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 font-mono mb-2">
                        PORTAL DEL CONTRIBUYENTE
                    </div>

                    <!-- Iniciar Sesión -->
                    <h1 class="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
                        Iniciar Sesión
                    </h1>

                    <!-- Subtitle -->
                    <p class="text-sm text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
                        Consulte su estado de cuenta, autoliquide patentes<br>y emita solvencias oficiales.
                    </p>

                    <!-- The Card -->
                    <div class="w-full max-w-[390px] mx-auto bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mt-8 text-left space-y-4">
                        <!-- Selector de Modo de Acceso Híbrido -->
                        <div class="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
                            <button id="pc-tab-rif" type="button" onclick="window.PortalComercio.cambiarLoginModo('rif')"
                                    class="flex-1 py-1.5 rounded-lg text-center font-medium transition ${loginModo === 'rif' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}">
                                Por RIF
                            </button>
                            <button id="pc-tab-correo" type="button" onclick="window.PortalComercio.cambiarLoginModo('correo')"
                                    class="flex-1 py-1.5 rounded-lg text-center font-medium transition ${loginModo === 'correo' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}">
                                Por Correo
                            </button>
                        </div>

                        <!-- Campo RIF -->
                        <div id="pc-box-rif" class="space-y-1 ${loginModo === 'rif' ? '' : 'hidden'}">
                            <label class="block text-xs font-medium text-slate-700">RIF o Cédula</label>
                            <div class="flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-slate-400 transition overflow-hidden">
                                <select id="pc-rif-tipo" class="bg-transparent text-slate-800 font-medium text-sm px-3 py-2.5 outline-none cursor-pointer border-r border-slate-200">
                                    <option value="J">J</option>
                                    <option value="V">V</option>
                                    <option value="G">G</option>
                                    <option value="E">E</option>
                                    <option value="C">C</option>
                                    <option value="P">P</option>
                                </select>
                                <input type="text" id="pc-rif-numero" placeholder="Ej: 123456789" 
                                       inputmode="numeric" pattern="[0-9]*" maxlength="10"
                                       oninput="if(window.HaciendaRIF) window.HaciendaRIF.handleInput(this, 'pc-rif-tipo')"
                                       onkeydown="if(event.key==='Enter') window.PortalComercio.ejecutarConsultaRif()"
                                       class="w-full bg-transparent text-slate-800 text-sm px-3 py-2.5 outline-none placeholder:text-slate-400 font-mono">
                            </div>
                        </div>

                        <!-- Campo Correo -->
                        <div id="pc-box-correo" class="space-y-1 ${loginModo === 'correo' ? '' : 'hidden'}">
                            <label class="block text-xs font-medium text-slate-700">Correo Electrónico Registrado</label>
                            <div class="flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-slate-400 transition overflow-hidden">
                                <input type="email" id="pc-login-correo" placeholder="correo@comercio.com"
                                       onkeydown="if(event.key==='Enter') window.PortalComercio.ejecutarConsultaRif()"
                                       class="w-full bg-transparent text-slate-800 text-sm px-3 py-2.5 outline-none placeholder:text-slate-400">
                            </div>
                        </div>

                        <!-- Campo Contraseña -->
                        <div class="space-y-1">
                            <div class="flex items-center justify-between">
                                <label class="block text-xs font-medium text-slate-700">Contraseña de Acceso</label>
                                <button type="button" onclick="window.PortalComercio.abrirRecuperarClave()" 
                                        class="text-[11px] text-slate-400 hover:text-black transition">
                                    ¿Olvidó su clave?
                                </button>
                            </div>
                            <div class="flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-slate-400 transition overflow-hidden px-3">
                                <input type="password" id="pc-login-clave" placeholder="••••••••"
                                       onkeydown="if(event.key==='Enter') window.PortalComercio.ejecutarConsultaRif()"
                                       class="w-full bg-transparent text-slate-800 text-sm py-2.5 outline-none placeholder:text-slate-400">
                                <button type="button" onclick="window.PortalComercio.toggleVerClave()" 
                                        class="text-slate-400 hover:text-slate-600 transition pl-2 text-xs" title="Mostrar u ocultar contraseña">
                                    <i id="pc-clave-eye" class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>

                        <button onclick="window.PortalComercio.ejecutarConsultaRif()" 
                                class="w-full bg-black hover:bg-neutral-800 text-white font-medium text-sm rounded-xl py-3 transition flex items-center justify-center gap-2 shadow-sm"
                                style="background-color: #000000 !important; color: #ffffff !important;">
                            <span style="color: #ffffff !important;">Ingresar</span>
                            <span style="color: #ffffff !important;">→</span>
                        </button>

                        <div class="text-center pt-1">
                            <button onclick="window.PortalComercio.abrirModalInscripcion()" 
                                    class="text-xs text-slate-500 hover:text-black transition">
                                ¿Comercio nuevo? Solicitar censo municipal
                            </button>
                        </div>
                    </div>

                    <!-- Footnote below the card -->
                    <div class="text-xs text-slate-400 text-center mt-6">
                        Atención presencial: Taquilla de Rentas Municipales · 8:00 AM a 4:00 PM
                    </div>
                </div>

                ${this.renderModalInscripcion()}
                ${this.renderModalRecuperarClave()}
                ${this.renderModalPrimerIngreso()}
                ${this.renderModalArticulado()}
                ${this.renderPopupOficial()}
            `;

            this.verificarPopup();
        },

        renderDashboardSuite: function(container) {
            const store = global.HaciendaStore;
            const c = activeContribuyente;
            const tasas = getTasasInfo();
            const tasaMmavActual = getTasaMMAV();

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
            const mockCtaIds = new Set(['cta_01', 'cta_02']);
            const mockCtaNums = new Set(['01020544210000012345', '01340371820000098765']);
            const cuentas = (store.get('hacienda_cuentas') || []).filter(cta => {
                if (cta.estado === 'inactiva') return false;
                const cleanNum = String(cta.numero || cta.numero_cuenta || '').replace(/\D/g, '');
                return !mockCtaIds.has(String(cta.id)) && !mockCtaNums.has(cleanNum);
            });

            container.innerHTML = `
                <div class="max-w-5xl mx-auto space-y-8 py-6">
                    <!-- Barra de Bienvenida y Tasa MMAV (Estilo SATGUAICA / Apple) -->
                    <div class="p-8 rounded-3xl bg-gradient-to-r from-[#121216] via-[#14141a] to-[#121216] border border-white/[0.08] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div class="space-y-2">
                            <div class="flex items-center gap-3">
                                <h2 class="text-xl sm:text-2xl font-semibold text-white tracking-tight">${c.razon_social}</h2>
                                ${esSolvente ? `
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium shadow-sm">
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        Solvente
                                    </span>
                                ` : `
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium shadow-sm">
                                        <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        ${declaracionesPendientes.length} por pagar
                                    </span>
                                `}
                            </div>
                            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400 font-mono">
                                <span>RIF: ${c.rif}</span>
                                <span class="text-neutral-600">·</span>
                                <span class="text-sky-300/80">${patentes.length} Empresa(s)</span>
                                <span class="text-neutral-600">·</span>
                                <span>${c.correo || 'Contribuyente Municipal'}</span>
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center gap-2.5 shrink-0">
                            <!-- Píldora Tasa TCMMV (Art 30 LOCAT) -->
                            <div class="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs font-mono shadow-sm">
                                <span class="text-amber-300 text-[10px] block uppercase font-sans font-semibold">TCMMV (LOCAT)</span>
                                <span data-tasa="tcmmv" class="text-white font-bold">${tasaMmavActual.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span>
                            </div>

                            <!-- Píldora Dólar BCV -->
                            <div class="px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono">
                                <span class="text-emerald-400 text-[10px] block uppercase font-sans font-semibold">USD BCV</span>
                                <span data-tasa="usd" class="text-white font-medium">${tasas.usd.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span>
                            </div>

                            <!-- Píldora Euro BCV -->
                            <div class="px-3.5 py-2 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs font-mono">
                                <span class="text-sky-400 text-[10px] block uppercase font-sans font-semibold">EUR BCV</span>
                                <span data-tasa="eur" class="text-white font-medium">${tasas.eur.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span>
                            </div>

                            <button onclick="window.PortalComercio.cerrarConsulta()" 
                                    class="text-xs text-neutral-400 hover:text-white px-4 py-2.5 rounded-2xl border border-white/10 hover:border-white/20 transition bg-white/[0.03]">
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
                             class="p-8 rounded-3xl bg-gradient-to-b from-sky-500/[0.08] to-[#111114] border border-sky-500/25 hover:border-sky-400/50 hover:shadow-[0_0_35px_rgba(56,189,248,0.15)] transition duration-300 cursor-pointer space-y-4 group relative overflow-hidden shadow-xl">
                            <div class="flex items-center justify-between">
                                <div class="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center text-lg shadow-sm">
                                    <i class="fas fa-suitcase"></i>
                                </div>
                                ${esSolvente ? `
                                    <span class="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm">Solvente</span>
                                ` : `
                                    <span class="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shadow-sm">${declaracionesPendientes.length} Pendiente(s)</span>
                                `}
                            </div>
                            <div class="space-y-1">
                                <h3 class="text-base font-semibold text-white group-hover:text-sky-300 transition">Mis Empresas</h3>
                                <p class="text-xs text-neutral-400 leading-relaxed">
                                    Patentes comerciales, autoliquidación mensual LOCAT, pago de tributos y Solvencia QR.
                                </p>
                            </div>
                            <div class="pt-2 text-xs text-neutral-500 font-mono flex items-center justify-between border-t border-white/5">
                                <span class="text-sky-400/80">${patentes.length} Patente(s)</span>
                                <span class="group-hover:translate-x-1 transition text-sky-300 font-medium">Gestionar →</span>
                            </div>
                        </div>

                        <!-- 2. Mis Inmuebles (Derecho de Frente) -->
                        <div onclick="window.PortalComercio.navegarModulo('inmuebles')" 
                             class="p-8 rounded-3xl bg-gradient-to-b from-purple-500/[0.08] to-[#111114] border border-purple-500/25 hover:border-purple-400/50 hover:shadow-[0_0_35px_rgba(168,85,247,0.15)] transition duration-300 cursor-pointer space-y-4 group relative overflow-hidden shadow-xl">
                            <div class="flex items-center justify-between">
                                <div class="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-lg shadow-sm">
                                    <i class="fas fa-building"></i>
                                </div>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">Catastro</span>
                            </div>
                            <div class="space-y-1">
                                <h3 class="text-base font-semibold text-white group-hover:text-purple-300 transition">Mis Inmuebles</h3>
                                <p class="text-xs text-neutral-400 leading-relaxed">
                                    Registro de inmuebles urbanos, terrenos, locales comerciales y cálculo de derecho de frente.
                                </p>
                            </div>
                            <div class="pt-2 text-xs text-neutral-500 font-mono flex items-center justify-between border-t border-white/5">
                                <span class="text-purple-400/80">${inmuebles.length} Inmueble(s)</span>
                                <span class="group-hover:translate-x-1 transition text-purple-300 font-medium">Consultar →</span>
                            </div>
                        </div>

                        <!-- 3. Mis Vehículos (Patente Vehicular) -->
                        <div onclick="window.PortalComercio.navegarModulo('vehiculos')" 
                             class="p-8 rounded-3xl bg-gradient-to-b from-emerald-500/[0.08] to-[#111114] border border-emerald-500/25 hover:border-emerald-400/50 hover:shadow-[0_0_35px_rgba(16,185,129,0.15)] transition duration-300 cursor-pointer space-y-4 group relative overflow-hidden shadow-xl">
                            <div class="flex items-center justify-between">
                                <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-lg shadow-sm">
                                    <i class="fas fa-car"></i>
                                </div>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Trimestres</span>
                            </div>
                            <div class="space-y-1">
                                <h3 class="text-base font-semibold text-white group-hover:text-emerald-300 transition">Mis Vehículos</h3>
                                <p class="text-xs text-neutral-400 leading-relaxed">
                                    Registro automotriz comercial o particular, consulta de trimestres y pago de patentes.
                                </p>
                            </div>
                            <div class="pt-2 text-xs text-neutral-500 font-mono flex items-center justify-between border-t border-white/5">
                                <span class="text-emerald-400/80">${vehiculos.length} Vehículo(s)</span>
                                <span class="group-hover:translate-x-1 transition text-emerald-300 font-medium">Consultar →</span>
                            </div>
                        </div>

                        <!-- 4. Mis Publicidades (Propaganda Comercial) -->
                        <div onclick="window.PortalComercio.navegarModulo('publicidad')" 
                             class="p-8 rounded-3xl bg-gradient-to-b from-amber-500/[0.08] to-[#111114] border border-amber-500/25 hover:border-amber-400/50 hover:shadow-[0_0_35px_rgba(245,158,11,0.15)] transition duration-300 cursor-pointer space-y-4 group relative overflow-hidden shadow-xl">
                            <div class="flex items-center justify-between">
                                <div class="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-lg shadow-sm">
                                    <i class="fas fa-object-group"></i>
                                </div>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">Vallas y Avisos</span>
                            </div>
                            <div class="space-y-1">
                                <h3 class="text-base font-semibold text-white group-hover:text-amber-300 transition">Mis Publicidades</h3>
                                <p class="text-xs text-neutral-400 leading-relaxed">
                                    Registro de avisos luminosos, vallas publicitarias en fachada y metros cuadrados autorizados.
                                </p>
                            </div>
                            <div class="pt-2 text-xs text-neutral-500 font-mono flex items-center justify-between border-t border-white/5">
                                <span class="text-amber-400/80">${publicidades.length} Aviso(s)</span>
                                <span class="group-hover:translate-x-1 transition text-amber-300 font-medium">Consultar →</span>
                            </div>
                        </div>

                        <!-- 5. Gestión de Tasas y Multas -->
                        <div onclick="window.PortalComercio.navegarModulo('tasas')" 
                             class="p-8 rounded-3xl bg-gradient-to-b from-rose-500/[0.08] to-[#111114] border border-rose-500/25 hover:border-rose-400/50 hover:shadow-[0_0_35px_rgba(244,63,94,0.15)] transition duration-300 cursor-pointer space-y-4 group relative overflow-hidden shadow-xl">
                            <div class="flex items-center justify-between">
                                <div class="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center text-lg shadow-sm">
                                    <i class="fas fa-file-invoice"></i>
                                </div>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">Historial</span>
                            </div>
                            <div class="space-y-1">
                                <h3 class="text-base font-semibold text-white group-hover:text-rose-300 transition">Tasas y Multas</h3>
                                <p class="text-xs text-neutral-400 leading-relaxed">
                                    Timbres fiscales, certificaciones administrativas, estado de cuenta y recibos correlativos.
                                </p>
                            </div>
                            <div class="pt-2 text-xs text-neutral-500 font-mono flex items-center justify-between border-t border-white/5">
                                <span class="text-rose-400/80">${pagos.length} Comprobante(s)</span>
                                <span class="group-hover:translate-x-1 transition text-rose-300 font-medium">Revisar →</span>
                            </div>
                        </div>

                        <!-- 6. Cuentas Bancarias Municipales -->
                        <div onclick="window.PortalComercio.navegarModulo('cuentas')" 
                             class="p-8 rounded-3xl bg-gradient-to-b from-teal-500/[0.08] to-[#111114] border border-teal-500/25 hover:border-teal-400/50 hover:shadow-[0_0_35px_rgba(20,184,166,0.15)] transition duration-300 cursor-pointer space-y-4 group relative overflow-hidden shadow-xl">
                            <div class="flex items-center justify-between">
                                <div class="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center text-lg shadow-sm">
                                    <i class="fas fa-university"></i>
                                </div>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">Oficial</span>
                            </div>
                            <div class="space-y-1">
                                <h3 class="text-base font-semibold text-white group-hover:text-teal-300 transition">Cuentas Bancarias</h3>
                                <p class="text-xs text-neutral-400 leading-relaxed">
                                    Datos bancarios del Banco de Venezuela y Banesco para realizar transferencias y pagos móviles.
                                </p>
                            </div>
                            <div class="pt-2 text-xs text-neutral-500 font-mono flex items-center justify-between border-t border-white/5">
                                <span class="text-teal-400/80">Cuentas Recaudadoras</span>
                                <span class="group-hover:translate-x-1 transition text-teal-300 font-medium">Ver Cuentas →</span>
                            </div>
                        </div>
                    </div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderModuloEmpresas: function(c, patenteActiva, declaraciones, declaracionesPendientes, totalDeudaBs, esSolvente, pagos, cuentas) {
            const alicuota = patenteActiva ? Number(patenteActiva.alicuota || 0.01) : 0.01;
            const minimoTcmmv = patenteActiva ? Number(patenteActiva.minimo_tcmmv || 0.30) : 0.30;
            const tasaActual = getTasaMMAV();
            const minimoBs = minimoTcmmv * tasaActual;

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
            const catalogo = global.CatalogoLocat ? global.CatalogoLocat.getAll() : [];
            const misPatentes = (global.HaciendaStore ? global.HaciendaStore.get('hacienda_patentes') : [])
                .filter(p => String(p.contribuyente_id) === String(c.id) && p.estado !== 'anulada' && p.estado !== 'suspendida');
            const pOficial = misPatentes[0] || patenteActiva;
            const tienePatente = misPatentes.length > 0 || (!!pOficial && !!pOficial.codigo_locat);

            const codPatente = pOficial ? (pOficial.codigo_locat || '') : '';
            const actividadSeleccionada = catalogo.find(item => item.codigo === codPatente) || (pOficial ? { codigo: pOficial.codigo_locat, alicuota: pOficial.alicuota, minimo_tcmmv: pOficial.minimo_tributable_tcmmv || 0.30, nombre: pOficial.descripcion_actividad } : null);
            const aliActual = pOficial ? Number(pOficial.alicuota || (actividadSeleccionada?.alicuota ?? 0.01)) : 0.01;
            const minTcmmvActual = pOficial ? Number(pOficial.minimo_tributable_tcmmv || pOficial.minimo_tcmmv || (actividadSeleccionada?.minimo_tcmmv ?? 0.30)) : 0.30;
            const tasaActual = getTasaMMAV();
            const minBsActual = minTcmmvActual * tasaActual;

            if (tab === 'declarar') {
                if (!tienePatente) {
                    return `
                        <div class="p-8 sm:p-10 rounded-3xl bg-[#121214] border border-amber-500/20 shadow-2xl space-y-6">
                            <div class="flex items-start gap-4">
                                <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                                    <i class="fas fa-file-signature text-xl"></i>
                                </div>
                                <div class="space-y-1.5 flex-1">
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono">Padrón Municipal</span>
                                        <span class="text-[11px] font-medium text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">Sin Licencia Comercial</span>
                                    </div>
                                    <h3 class="text-lg font-bold text-white">Comercio Registrado — Pendiente Asignación de Patente</h3>
                                    <p class="text-xs text-neutral-300 leading-relaxed">
                                        El contribuyente <strong class="text-white">${c.razon_social || c.nombre}</strong> (RIF: <strong class="text-white font-mono">${c.rif}</strong>) se encuentra válidamente registrado en el Padrón Municipal de Contribuyentes, pero aún no tiene emitida una <strong>Licencia de Actividades Económicas (Patente LOCAT)</strong> por parte de la Dirección de Administración Tributaria.
                                    </p>
                                </div>
                            </div>

                            <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                                <h4 class="text-xs font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
                                    <i class="fas fa-info-circle text-sky-400 text-xs"></i>
                                    ¿Por qué no puede autoliquidar todavía?
                                </h4>
                                <ul class="text-xs text-neutral-400 space-y-2 list-disc list-inside leading-relaxed">
                                    <li>La Administración Tributaria Municipal debe evaluar su Acta Constitutiva u objeto social para formalizar la asignación del código o ramo oficial del clasificador LOCAT (Gaceta Oficial).</li>
                                    <li>Una vez emitida su Licencia Comercial en taquilla o sistema administrativo, este módulo se habilitará automáticamente con la alícuota y mínimo tributable oficial para sus autoliquidaciones mensuales a 0ms.</li>
                                </ul>
                            </div>

                            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/5">
                                <div class="text-[11px] text-neutral-500 font-mono">
                                    Estado de Licencia: <span class="text-amber-400 font-bold">NO ASIGNADA / EN PROCESO</span>
                                </div>
                                <button onclick="window.PortalComercio.navegarModulo('grid')" 
                                        class="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-full px-6 py-2.5 transition flex items-center justify-center gap-2">
                                    <i class="fas fa-arrow-left text-xs"></i>
                                    <span>Volver a la Suite</span>
                                </button>
                            </div>
                        </div>
                    `;
                }

                return `
                    <div class="p-8 sm:p-10 rounded-3xl bg-[#121214] border border-white/[0.08] shadow-2xl space-y-8">
                        <div class="space-y-1">
                            <h3 class="text-lg font-semibold text-white">Autoliquidación Mensual (LOCAT)</h3>
                            <p id="dec-locat-info" class="text-xs text-neutral-400">
                                Alícuota aplicable: <strong class="text-white">${(aliActual * 100).toFixed(2)}%</strong> · Mínimo tributable: <strong class="text-white">${minTcmmvActual.toFixed(2)} MMAV (${minBsActual.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.)</strong>
                            </p>
                        </div>

                        <!-- Actividad Económica Oficial Bloqueada por Licencia -->
                        ${(function() {
                            const descOficial = pOficial?.descripcion_actividad || actividadSeleccionada?.nombre || 'Actividad Comercial';
                            const codOficial = pOficial?.codigo_locat || actividadSeleccionada?.codigo || 'COM-001';
                            const numPatenteOficial = pOficial?.numero_patente || 'VIGENTE';

                            if (misPatentes.length > 1) {
                                return `
                                    <div class="space-y-1.5">
                                        <div class="flex items-center justify-between">
                                            <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Seleccione la Patente a Autoliquidar</label>
                                            <span class="text-[11px] font-medium text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
                                                ${misPatentes.length} Licencias Aprobadas
                                            </span>
                                        </div>
                                        <select id="dec-actividad-locat" onchange="window.PortalComercio.cambiarActividadLocat()" 
                                                class="w-full bg-[#18181b] border border-white/10 text-white text-xs font-medium rounded-2xl px-4 py-3.5 outline-none focus:border-white/30 transition cursor-pointer">
                                            ${misPatentes.map((p, idx) => `
                                                <option value="${p.codigo_locat || 'COM-001'}" 
                                                        data-patente-id="${p.id}"
                                                        data-alicuota="${p.alicuota}" 
                                                        data-minimo="${p.minimo_tributable_tcmmv || p.minimo_tcmmv || 0.30}"
                                                        class="text-white"
                                                        ${idx === 0 ? 'selected' : ''}>
                                                    [${p.numero_patente || 'LICENCIA'}] [${p.codigo_locat || 'LOCAT'}] ${p.descripcion_actividad || 'Actividad Comercial'} — ${(Number(p.alicuota) * 100).toFixed(2)}% (Mín. ${Number(p.minimo_tributable_tcmmv || 0.30).toFixed(2)} MMAV)
                                                </option>
                                            `).join('')}
                                        </select>
                                    </div>
                                `;
                            }

                            return `
                                <div class="space-y-1.5">
                                    <div class="flex items-center justify-between">
                                        <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Actividad Económica Oficial (Licencia Municipal)</label>
                                        <span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                                            <i class="fas fa-lock text-[9px]"></i> Ramo Aprobado por Alcaldía
                                        </span>
                                    </div>
                                    <div class="p-4 rounded-2xl bg-[#18181b] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div class="space-y-0.5">
                                            <div class="flex items-center gap-2">
                                                <span class="text-xs font-mono font-bold text-sky-400">[${codOficial}]</span>
                                                <span class="text-xs font-semibold text-white">${descOficial}</span>
                                            </div>
                                            <p class="text-[11px] text-neutral-400 font-mono">
                                                Licencia N°: <span class="text-neutral-200 font-bold">${numPatenteOficial}</span> · Alícuota: <span class="text-neutral-200 font-bold">${(aliActual * 100).toFixed(2)}%</span> · Mínimo: <span class="text-neutral-200 font-bold">${minTcmmvActual.toFixed(2)} MMAV</span>
                                            </p>
                                        </div>
                                        <div class="shrink-0">
                                            <span class="text-xs font-mono text-neutral-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                                                Alícuota: <strong class="text-emerald-400 font-bold">${(aliActual * 100).toFixed(2)}%</strong>
                                            </span>
                                        </div>
                                    </div>
                                    <select id="dec-actividad-locat" class="hidden" style="display: none;">
                                        <option value="${codOficial}" 
                                                data-patente-id="${pOficial ? pOficial.id : ''}"
                                                data-alicuota="${aliActual}" 
                                                data-minimo="${minTcmmvActual}"
                                                selected>
                                            [${codOficial}] ${descOficial}
                                        </option>
                                    </select>
                                </div>
                            `;
                        })()}

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

                        <!-- Input Protagónico de Ventas (anti-autofill) -->
                        <div class="space-y-2 p-6 rounded-2xl bg-[#0a0a0c] border border-white/[0.06]">
                            <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Ingresos Brutos Facturados del Mes (Bs)</label>
                            <input type="number" step="0.01" id="dec-base-imponible" placeholder="0,00" 
                                   name="ingresos_facturados_monto_sin_autofill"
                                   autocomplete="off"
                                   data-lpignore="true"
                                   oninput="window.PortalComercio.calcularEnVivo()"
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
                                <div id="calc-min-tributable" class="text-base font-semibold text-neutral-300 font-mono">${minBsActual.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.</div>
                            </div>
                            <div class="p-5 rounded-2xl bg-[#161618] border border-white/10 space-y-1">
                                <span class="text-[11px] text-white uppercase tracking-wider block font-semibold">Total Determinado</span>
                                <div id="calc-total-pagar" class="text-xl font-bold text-white font-mono">${minBsActual.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.</div>
                            </div>
                        </div>

                        <div class="flex justify-end pt-2">
                            <button onclick="window.PortalComercio.presentarDeclaracion()" 
                                    class="bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-full px-8 py-3.5 transition shadow-lg flex items-center gap-2">
                                <span>Presentar Declaración</span>
                                <i class="fas fa-arrow-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                `;
            } else if (tab === 'pagar') {
                const mockMetodoIds = new Set(['met_pm_bdv', 'met_tr_bdv', 'met_tr_banesco', 'met_pos_taquilla']);
                const mockCtaIdsPagar = new Set(['cta_01', 'cta_02']);
                const metodosPago = (global.HaciendaStore ? global.HaciendaStore.get('hacienda_metodos_pago') : [])
                    .filter(m => m.activo !== false && !mockMetodoIds.has(String(m.id)) && !mockCtaIdsPagar.has(String(m.cuenta_id)));
                const cuentasList = cuentas || [];
                const cuentasMap = new Map(cuentasList.map(cta => [String(cta.id), cta]));

                return `
                    <div class="space-y-6">
                        <!-- Tarjetas de Métodos de Pago y Canales Oficiales -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            ${metodosPago.length > 0 ? metodosPago.map(m => {
                                const cta = m.cuenta_id ? cuentasMap.get(String(m.cuenta_id)) : null;
                                const isPagoMovil = m.canal === 'pago_movil';
                                const isTransferencia = m.canal === 'transferencia';
                                const isPuntoVenta = m.canal === 'punto_venta';

                                const badgeColor = isPagoMovil ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : isTransferencia ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                    : isPuntoVenta ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                                const canalLabel = isPagoMovil ? 'Pago Móvil C2P / P2P'
                                    : isTransferencia ? 'Transferencia Bancaria'
                                    : isPuntoVenta ? 'Punto de Venta Taquilla'
                                    : (m.canal || 'Canal de Pago').toUpperCase();

                                const numCuenta = cta ? (cta.numero || cta.numero_cuenta || '') : '';
                                const bancoNombre = cta ? (cta.banco || cta.banco_nombre || '') : (m.banco_origen_permitido || 'Bancario');
                                const tlf = m.telefono_pago_movil || '';
                                const doc = m.documento_pago_movil || (cta ? cta.rif_titular : 'G-20000163-9') || '';

                                return `
                                    <div class="p-6 rounded-3xl bg-gradient-to-br from-[#1c1c1e] to-[#121214] border border-white/10 shadow-xl space-y-4 relative group">
                                        <div class="flex items-center justify-between">
                                            <div class="text-xs font-bold text-white uppercase tracking-wider">${m.nombre}</div>
                                            <span class="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${badgeColor}">
                                                ${canalLabel}
                                            </span>
                                        </div>

                                        <div class="space-y-2 text-xs">
                                            ${isPagoMovil ? `
                                                <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5 font-mono">
                                                    <div class="flex justify-between items-center text-neutral-400">
                                                        <span>Banco:</span>
                                                        <span class="text-white font-bold">${bancoNombre}</span>
                                                    </div>
                                                    <div class="flex justify-between items-center text-neutral-400">
                                                        <span>Teléfono:</span>
                                                        <span class="text-white font-bold select-all">${tlf || 'No registrado'}</span>
                                                    </div>
                                                    <div class="flex justify-between items-center text-neutral-400">
                                                        <span>RIF / C.I.:</span>
                                                        <span class="text-white font-bold select-all">${doc || 'G-20000163-9'}</span>
                                                    </div>
                                                    ${cta ? `
                                                        <div class="flex justify-between items-center text-neutral-500 text-[11px] pt-1 border-t border-white/5">
                                                            <span>Cta. Afiliada:</span>
                                                            <span class="text-neutral-300">····${numCuenta.slice(-4)}</span>
                                                        </div>
                                                    ` : ''}
                                                </div>
                                                <div class="grid grid-cols-2 gap-2">
                                                    <button onclick="window.PortalComercio.copiarAlPortapapeles('${tlf}', 'Teléfono copiado.')" 
                                                            class="py-2 bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white text-[11px] font-medium rounded-xl transition flex items-center justify-center gap-1.5 border border-white/5">
                                                        <i class="fas fa-copy text-[10px]"></i>
                                                        <span>Copiar Teléfono</span>
                                                    </button>
                                                    <button onclick="window.PortalComercio.copiarAlPortapapeles('${doc}', 'RIF copiado.')" 
                                                            class="py-2 bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white text-[11px] font-medium rounded-xl transition flex items-center justify-center gap-1.5 border border-white/5">
                                                        <i class="fas fa-copy text-[10px]"></i>
                                                        <span>Copiar RIF</span>
                                                    </button>
                                                </div>
                                            ` : isTransferencia ? `
                                                <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5 font-mono">
                                                    <div class="flex justify-between items-center text-neutral-400">
                                                        <span>Banco:</span>
                                                        <span class="text-white font-bold">${bancoNombre}</span>
                                                    </div>
                                                    <div class="flex justify-between items-center text-neutral-400">
                                                        <span>N° Cuenta:</span>
                                                        <span class="text-white font-bold text-xs select-all">${numCuenta || 'No registrada'}</span>
                                                    </div>
                                                    <div class="flex justify-between items-center text-neutral-400">
                                                        <span>RIF / Titular:</span>
                                                        <span class="text-white font-bold select-all">${doc}</span>
                                                    </div>
                                                </div>
                                                <button onclick="window.PortalComercio.copiarAlPortapapeles('${numCuenta}', 'Número de cuenta copiado.')" 
                                                        class="w-full py-2 bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white text-xs font-medium rounded-xl transition flex items-center justify-center gap-1.5 border border-white/5">
                                                    <i class="fas fa-copy text-[10px]"></i>
                                                    <span>Copiar Número de Cuenta</span>
                                                </button>
                                            ` : isPuntoVenta ? `
                                                <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1 text-neutral-300">
                                                    <p class="font-medium">Disponible en Taquilla de Hacienda Municipal.</p>
                                                    <p class="text-[11px] text-neutral-400">Tarjetas de Débito y Crédito nacionales.</p>
                                                    ${cta ? `<p class="text-[11px] text-neutral-500 font-mono">Liquidación: ${cta.banco} (····${numCuenta.slice(-4)})</p>` : ''}
                                                </div>
                                                <div class="text-[11px] text-neutral-400 italic text-center py-1">
                                                    Presenta tu referencia o recibo de punto en taquilla.
                                                </div>
                                            ` : `
                                                <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-neutral-300">
                                                    <p>${m.instrucciones || 'Canal habilitado para recaudación tributaria municipal.'}</p>
                                                </div>
                                            `}
                                        </div>
                                    </div>
                                `;
                            }).join('') : (cuentasList.length === 0 ? `
                                <div class="col-span-full p-8 rounded-3xl bg-[#18181b] border border-amber-500/20 text-center space-y-2">
                                    <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-lg">
                                        <i class="fas fa-university"></i>
                                    </div>
                                    <h4 class="text-xs font-bold text-white uppercase tracking-wider">Sin Métodos de Pago Disponibles</h4>
                                    <p class="text-xs text-neutral-400 max-w-md mx-auto">
                                        No hay canales de pago activos registrados en la Tesorería Municipal en este momento. Comuníquese con la Dirección de Administración Tributaria.
                                    </p>
                                </div>
                            ` : cuentasList.map(cta => `
                                <div class="p-6 rounded-3xl bg-gradient-to-br from-[#1c1c1e] to-[#121214] border border-white/10 shadow-xl space-y-4 relative group">
                                    <div class="flex items-center justify-between">
                                        <div class="text-xs font-bold text-white uppercase tracking-wider">${cta.banco || cta.banco_nombre}</div>
                                        <span class="text-[10px] text-neutral-400 font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/5">${cta.tipo || 'Corriente'}</span>
                                    </div>
                                    <div class="space-y-1">
                                        <div class="text-base font-mono font-bold text-white tracking-wider select-all">${cta.numero || cta.numero_cuenta}</div>
                                        <div class="text-xs text-neutral-400">${cta.concepto || 'Recaudación Tributaria Municipal'}</div>
                                    </div>
                                    <button onclick="window.PortalComercio.copiarAlPortapapeles('${cta.numero || cta.numero_cuenta}', 'Número de cuenta copiado.')" 
                                            class="w-full py-2 bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white text-xs font-medium rounded-xl transition flex items-center justify-center gap-1.5 border border-white/5">
                                        <i class="fas fa-copy text-[10px]"></i>
                                        <span>Copiar Número de Cuenta</span>
                                    </button>
                                </div>
                            `).join(''))}
                        </div>

                        <!-- Formulario de Consignación -->
                        <div class="p-8 sm:p-10 rounded-3xl bg-[#121214] border border-white/[0.08] shadow-2xl space-y-6">
                            <div class="space-y-1">
                                <h3 class="text-lg font-semibold text-white">Reportar Pago de Impuesto Municipal</h3>
                                <p class="text-xs text-neutral-400">Selecciona el método de pago utilizado e ingresa la referencia bancaria para su verificación y conciliación en taquilla.</p>
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
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Método de Pago Empleado (Alcaldía)</label>
                                    <select id="pago-metodo-id" onchange="window.PortalComercio.alCambiarMetodoPago(this.value)" class="w-full bg-[#18181b] border border-white/10 text-white text-xs font-medium rounded-2xl px-4 py-3 outline-none focus:border-white/30 transition">
                                        ${metodosPago.length === 0 ? `
                                            <option value="" data-cuenta-id="">Transferencia Bancaria Tradicional</option>
                                        ` : metodosPago.map(m => {
                                            const cta = m.cuenta_id ? cuentasMap.get(String(m.cuenta_id)) : null;
                                            const ctaInfo = cta ? ` (${cta.banco} ····${(cta.numero || cta.numero_cuenta || '').slice(-4)})` : '';
                                            return `<option value="${m.id}" data-cuenta-id="${m.cuenta_id || ''}" data-canal="${m.canal || 'transferencia'}" data-banco="${cta ? (cta.banco || cta.banco_nombre) : ''}">
                                                ${m.nombre}${ctaInfo}
                                            </option>`;
                                        }).join('')}
                                    </select>
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Banco de Origen (Tu Banco)</label>
                                    <input type="text" id="pago-banco-origen" placeholder="Ej: Banesco, Mercantil, BDV, Provincial" 
                                           class="w-full bg-[#18181b] border border-white/10 text-white text-xs font-medium rounded-2xl px-4 py-3 outline-none focus:border-white/30 transition">
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Cuenta / Banco Receptor (Alcaldía)</label>
                                    <select id="pago-banco-destino" class="w-full bg-[#18181b] border border-white/10 text-white text-xs font-medium rounded-2xl px-4 py-3 outline-none focus:border-white/30 transition">
                                        ${cuentasList.length === 0 ? `
                                            <option value="">No hay cuentas activas registradas</option>
                                        ` : cuentasList.map(cta => `
                                            <option value="${cta.id}" data-banco-nombre="${cta.banco || cta.banco_nombre}">
                                                ${cta.banco || cta.banco_nombre} (${(cta.numero || cta.numero_cuenta || '').slice(-4)})
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Número de Referencia Bancaria / Comprobante</label>
                                    <input type="text" id="pago-referencia" placeholder="Ej: 000987654321" 
                                           class="w-full bg-[#18181b] border border-white/10 text-white font-mono text-xs font-medium rounded-2xl px-4 py-3 outline-none focus:border-white/30 transition">
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Monto Pagado en Bs</label>
                                    <input type="number" step="0.01" id="pago-monto" placeholder="0,00" 
                                           class="w-full bg-[#18181b] border border-white/10 text-white font-mono text-xs font-medium rounded-2xl px-4 py-3 outline-none focus:border-white/30 transition">
                                </div>
                                <div class="space-y-1.5 sm:col-span-2">
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
                                        <div class="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Alcaldía de San José de Guaribe · Administración Tributaria</div>
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
                                ${cuentas.length === 0 ? `
                                    <div class="col-span-full p-8 rounded-3xl bg-[#18181b] border border-amber-500/20 text-center space-y-2">
                                        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-lg">
                                            <i class="fas fa-university"></i>
                                        </div>
                                        <h4 class="text-xs font-bold text-white uppercase tracking-wider">Sin Cuentas Recaudadoras Disponibles</h4>
                                        <p class="text-xs text-neutral-400 max-w-md mx-auto">
                                            No hay cuentas bancarias activas registradas en la Tesorería Municipal en este momento. Comuníquese con la Dirección de Administración Tributaria.
                                        </p>
                                    </div>
                                ` : cuentas.map(cta => `
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

        cambiarLoginModo: function(modo) {
            loginModo = modo;
            const tabRif = document.getElementById('pc-tab-rif');
            const tabCorreo = document.getElementById('pc-tab-correo');
            const boxRif = document.getElementById('pc-box-rif');
            const boxCorreo = document.getElementById('pc-box-correo');

            if (tabRif && tabCorreo && boxRif && boxCorreo) {
                if (modo === 'rif') {
                    tabRif.className = 'flex-1 py-1.5 rounded-lg text-center font-medium transition bg-white text-black shadow-sm';
                    tabCorreo.className = 'flex-1 py-1.5 rounded-lg text-center font-medium transition text-slate-500 hover:text-black';
                    boxRif.classList.remove('hidden');
                    boxCorreo.classList.add('hidden');
                    const numInput = document.getElementById('pc-rif-numero');
                    if (numInput) numInput.focus();
                } else {
                    tabCorreo.className = 'flex-1 py-1.5 rounded-lg text-center font-medium transition bg-white text-black shadow-sm';
                    tabRif.className = 'flex-1 py-1.5 rounded-lg text-center font-medium transition text-slate-500 hover:text-black';
                    boxCorreo.classList.remove('hidden');
                    boxRif.classList.add('hidden');
                    const mailInput = document.getElementById('pc-login-correo');
                    if (mailInput) mailInput.focus();
                }
            }
        },

        toggleInputClave: function(inputId, iconId) {
            const input = document.getElementById(inputId);
            const icon = document.getElementById(iconId);
            if (!input) return;
            if (input.type === 'password') {
                input.type = 'text';
                if (icon) icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                if (icon) icon.className = 'fas fa-eye';
            }
        },

        toggleVerClave: function() {
            this.toggleInputClave('pc-login-clave', 'pc-clave-eye');
        },

        ejecutarConsultaRif: async function() {
            const store = global.HaciendaStore;
            if (!store) return;

            const contribuyentes = store.get('hacienda_contribuyentes') || [];
            let match = null;
            let displayIdentificador = '';

            if (loginModo === 'correo') {
                const correo = (document.getElementById('pc-login-correo')?.value || '').trim().toLowerCase();
                if (!correo || !correo.includes('@')) {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Correo Requerido',
                            text: 'Ingrese un correo electrónico válido registrado en el padrón municipal.',
                            confirmButtonColor: '#000000'
                        });
                    }
                    return;
                }
                displayIdentificador = correo;
                match = contribuyentes.find(c => String(c.correo || '').trim().toLowerCase() === correo);
                if (!match && typeof store.fetchSingleContribuyente === 'function') {
                    match = await store.fetchSingleContribuyente({ correo });
                }
            } else {
                const tipo = document.getElementById('pc-rif-tipo') ? document.getElementById('pc-rif-tipo').value : 'J';
                const rawNum = document.getElementById('pc-rif-numero') ? document.getElementById('pc-rif-numero').value : '';
                const rifHelper = global.HaciendaRIF;
                const parsed = rifHelper ? rifHelper.parse((tipo ? (tipo + '-') : '') + rawNum) : { tipo: tipo || 'J', numero: rawNum.replace(/\D/g, ''), full: (tipo || 'J') + '-' + rawNum.replace(/\D/g, '') };

                if (!parsed.numero) {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'warning',
                            title: 'RIF Requerido',
                            text: 'Ingresa el número de RIF del contribuyente (solo números).',
                            confirmButtonColor: '#000000'
                        });
                    }
                    return;
                }
                displayIdentificador = parsed.full;
                match = rifHelper ? rifHelper.findMatch(contribuyentes, parsed.tipo, parsed.numero) : contribuyentes.find(c => c.rif === parsed.full);
                if (!match && typeof store.fetchSingleContribuyente === 'function') {
                    match = await store.fetchSingleContribuyente({ rif: parsed.full });
                }
            }

            if (!match) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'info',
                        title: 'Comercio no Registrado',
                        text: `El identificador (${displayIdentificador}) no se encuentra registrado en el Padrón Municipal. ¿Deseas solicitar el censo comercial?`,
                        showCancelButton: true,
                        confirmButtonText: 'Inscribir Comercio',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#000000'
                    }).then(res => {
                        if (res.isConfirmed) {
                            this.abrirModalInscripcion(displayIdentificador);
                        }
                    });
                }
                return;
            }

            // Primer Ingreso: el contribuyente no tiene clave asignada en el padrón
            if (!match.clave) {
                this.abrirModalPrimerIngreso(match);
                return;
            }

            // Validar contraseña
            const claveInput = (document.getElementById('pc-login-clave')?.value || '').trim();
            if (!claveInput) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Contraseña Requerida',
                        text: 'Ingresa tu contraseña de acceso para iniciar sesión.',
                        confirmButtonColor: '#000000'
                    });
                }
                return;
            }

            const hashIngresado = await hashClave(claveInput);
            if (hashIngresado !== match.clave) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Contraseña Incorrecta',
                        text: 'La contraseña no coincide. Si la olvidó, use la opción "¿Olvidó su clave?" para restablecerla con la cédula del representante legal.',
                        confirmButtonColor: '#000000'
                    });
                }
                return;
            }

            activeContribuyente = match;
            activeModule = 'grid'; // Abre la Suite Principal

            // Sincronización quirúrgica exclusiva de este contribuyente
            if (store && typeof store.syncContribuyenteSurgical === 'function') {
                await store.syncContribuyenteSurgical(match.id);
            }

            const container = document.getElementById('portal-main-content');
            if (container) this.render(container);
        },

        seleccionarRif: function(rif) {
            const store = global.HaciendaStore;
            if (!store) return;

            const rifHelper = global.HaciendaRIF;
            const parsed = rifHelper ? rifHelper.parse(rif) : { tipo: 'J', numero: String(rif).replace(/\D/g, ''), full: String(rif) };
            const contribuyentes = store.get('hacienda_contribuyentes') || [];
            const match = rifHelper ? rifHelper.findMatch(contribuyentes, parsed.tipo, parsed.numero) : contribuyentes.find(c => c.rif === parsed.full);

            if (match) {
                activeContribuyente = match;
                activeModule = 'grid';
                const container = document.getElementById('portal-main-content');
                if (container) this.render(container);
            }
        },

        abrirModalPrimerIngreso: function(contribuyente) {
            const m = document.getElementById('modal-primer-ingreso');
            const hiddenId = document.getElementById('pi-contribuyente-id');
            const infoBox = document.getElementById('pi-comercio-info');
            if (hiddenId) hiddenId.value = contribuyente.id;
            if (infoBox) infoBox.textContent = `${contribuyente.razon_social} (${contribuyente.rif})`;
            if (m) m.classList.remove('hidden');
        },

        cerrarModalPrimerIngreso: function() {
            const m = document.getElementById('modal-primer-ingreso');
            if (m) m.classList.add('hidden');
        },

        guardarPrimerIngreso: async function() {
            const store = global.HaciendaStore;
            if (!store) return;

            const cId = document.getElementById('pi-contribuyente-id')?.value;
            const contribuyentes = store.get('hacienda_contribuyentes') || [];
            const c = contribuyentes.find(item => item.id == cId);
            if (!c) return;

            const numCed = (document.getElementById('pi-cedula-numero')?.value || '').replace(/\D/g, '');
            const clave = (document.getElementById('pi-clave')?.value || '').trim();
            const claveConfirm = (document.getElementById('pi-clave-confirm')?.value || '').trim();

            if (!numCed) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Cédula Requerida', text: 'Ingresa la cédula del representante legal para validar identidad.', confirmButtonColor: '#000000' });
                return;
            }

            const regCedulaDigits = String(c.representante_cedula || '').replace(/\D/g, '');
            if (regCedulaDigits && regCedulaDigits !== numCed) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'error', title: 'Validación Fallida', text: 'La cédula del representante legal no coincide con la registrada en el padrón municipal.', confirmButtonColor: '#000000' });
                return;
            }

            if (!clave || clave.length < 6) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Contraseña Corta', text: 'La contraseña debe tener al menos 6 caracteres.', confirmButtonColor: '#000000' });
                return;
            }

            if (clave !== claveConfirm) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Contraseñas no coinciden', text: 'La confirmación no coincide con la nueva contraseña.', confirmButtonColor: '#000000' });
                return;
            }

            const hash = await hashClave(clave);
            c.clave = hash;
            c.updated_at = new Date().toISOString();

            await store.set('hacienda_contribuyentes', c);

            this.cerrarModalPrimerIngreso();

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Contraseña Activada',
                    text: 'Su contraseña ha sido creada exitosamente. Bienvenido al Portal.',
                    confirmButtonColor: '#000000',
                    timer: 2000
                });
            }

            activeContribuyente = c;
            activeModule = 'grid';

            if (store && typeof store.syncContribuyenteSurgical === 'function') {
                await store.syncContribuyenteSurgical(c.id);
            }

            const container = document.getElementById('portal-main-content');
            if (container) this.render(container);
        },

        abrirRecuperarClave: function() {
            const m = document.getElementById('modal-recuperar-clave');
            if (m) m.classList.remove('hidden');
        },

        cerrarModalRecuperarClave: function() {
            const m = document.getElementById('modal-recuperar-clave');
            if (m) m.classList.add('hidden');
        },

        guardarRecuperarClave: async function() {
            const store = global.HaciendaStore;
            if (!store) return;

            const ident = (document.getElementById('rec-identificador')?.value || '').trim();
            const numCed = (document.getElementById('rec-cedula-numero')?.value || '').replace(/\D/g, '');
            const nuevaClave = (document.getElementById('rec-nueva-clave')?.value || '').trim();
            const confirmClave = (document.getElementById('rec-confirm-clave')?.value || '').trim();

            if (!ident) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Identificador Requerido', text: 'Ingrese el RIF o el Correo del comercio.', confirmButtonColor: '#000000' });
                return;
            }

            const contribuyentes = store.get('hacienda_contribuyentes') || [];
            const rifHelper = global.HaciendaRIF;
            const parsed = rifHelper ? rifHelper.parse(ident) : null;

            let match = contribuyentes.find(c => {
                if (String(c.correo || '').trim().toLowerCase() === ident.toLowerCase()) return true;
                if (parsed && parsed.numero) {
                    const matchDigits = String(c.rif || '').replace(/\D/g, '');
                    return matchDigits === parsed.numero;
                }
                return c.rif === ident;
            });

            if (!match && typeof store.fetchSingleContribuyente === 'function') {
                if (ident.includes('@')) {
                    match = await store.fetchSingleContribuyente({ correo: ident });
                } else {
                    match = await store.fetchSingleContribuyente({ rif: ident });
                }
            }

            if (!match) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'error', title: 'Comercio no encontrado', text: 'No existe ningún contribuyente registrado con ese RIF o Correo.', confirmButtonColor: '#000000' });
                return;
            }

            const regCedulaDigits = String(match.representante_cedula || '').replace(/\D/g, '');
            if (regCedulaDigits && regCedulaDigits !== numCed) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'error', title: 'Validación Fallida', text: 'La cédula del representante legal no coincide con los registros municipales.', confirmButtonColor: '#000000' });
                return;
            }

            if (!nuevaClave || nuevaClave.length < 6) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Contraseña Corta', text: 'La nueva contraseña debe tener al menos 6 caracteres.', confirmButtonColor: '#000000' });
                return;
            }

            if (nuevaClave !== confirmClave) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Contraseñas no coinciden', text: 'La contraseña y su confirmación no son iguales.', confirmButtonColor: '#000000' });
                return;
            }

            const hash = await hashClave(nuevaClave);
            match.clave = hash;
            match.updated_at = new Date().toISOString();

            await store.set('hacienda_contribuyentes', match);

            this.cerrarModalRecuperarClave();

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Contraseña Restablecida',
                    text: 'Su contraseña ha sido actualizada exitosamente. Ya puede iniciar sesión.',
                    confirmButtonColor: '#000000'
                });
            }
        },

        cerrarConsulta: function() {
            activeContribuyente = null;
            activeModule = 'grid';

            // Si estamos en el portal público, limpiar los datos del contribuyente anterior de la memoria y cache
            const store = global.HaciendaStore;
            if (store && typeof store.isPortal === 'function' && store.isPortal()) {
                const privateTables = [
                    'hacienda_contribuyentes',
                    'hacienda_declaraciones',
                    'hacienda_pagos',
                    'hacienda_solvencias',
                    'hacienda_patentes',
                    'hacienda_inmuebles',
                    'hacienda_vehiculos',
                    'hacienda_publicidad'
                ];
                privateTables.forEach(t => {
                    store._cache[t] = [];
                    if (store._localStore) {
                        store._localStore.removeItem(`tbl_${t}`).catch(() => {});
                    }
                });
            }

            const container = document.getElementById('portal-main-content');
            if (container) this.render(container);
        },

        cambiarActividadLocat: function() {
            const selectLocat = document.getElementById('dec-actividad-locat');
            if (!selectLocat) return;
            const opt = selectLocat.options[selectLocat.selectedIndex];
            const alicuota = parseFloat(opt?.dataset.alicuota || 0.01);
            const minTcmmv = parseFloat(opt?.dataset.minimo || 0.30);
            const tasaActual = getTasaMMAV();
            const minBs = minTcmmv * tasaActual;

            const infoEl = document.getElementById('dec-locat-info');
            if (infoEl) {
                infoEl.innerHTML = `Alícuota aplicable: <strong class="text-white">${(alicuota * 100).toFixed(2)}%</strong> · Mínimo tributable: <strong class="text-white">${minTcmmv.toFixed(2)} MMAV (${minBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.)</strong>`;
            }

            const minBox = document.getElementById('calc-min-tributable');
            if (minBox) {
                minBox.innerText = minBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Bs.';
            }

            this.calcularEnVivo();
        },

        calcularEnVivo: function(alicuotaParam, minimoBsParam) {
            const selectLocat = document.getElementById('dec-actividad-locat');
            let alicuota = alicuotaParam;
            let minimoBs = minimoBsParam;

            if (selectLocat && selectLocat.selectedIndex >= 0) {
                const opt = selectLocat.options[selectLocat.selectedIndex];
                alicuota = parseFloat(opt?.dataset.alicuota || alicuota || 0.01);
                const minTcmmv = parseFloat(opt?.dataset.minimo || 0.30);
                minimoBs = minTcmmv * getTasaMMAV();
            }
            if (!alicuota) alicuota = 0.01;
            if (!minimoBs) minimoBs = 0.30 * getTasaMMAV();

            const baseInput = document.getElementById('dec-base-imponible');
            const baseImponible = parseFloat(baseInput?.value || 0) || 0;
            const impAlicuota = baseImponible * alicuota;
            const totalPagar = Math.max(impAlicuota, minimoBs);

            const elImp = document.getElementById('calc-imp-alicuota');
            const elTot = document.getElementById('calc-total-pagar');

            if (elImp) elImp.innerText = impAlicuota.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Bs.';
            if (elTot) elTot.innerText = totalPagar.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Bs.';
        },

        presentarDeclaracion: async function() {
            const store = global.HaciendaStore;
            if (!store || !activeContribuyente) return;

            const mes = parseInt(document.getElementById('dec-mes').value, 10);
            const anio = parseInt(document.getElementById('dec-anio').value, 10);
            const baseImponible = parseFloat(document.getElementById('dec-base-imponible').value || 0);

            if (isNaN(baseImponible) || baseImponible < 0) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Monto inválido', text: 'Ingresa un monto de facturación válido.', confirmButtonColor: '#000000' });
                return;
            }

            const selectLocat = document.getElementById('dec-actividad-locat');
            let alicuota = 0.01;
            let minTcmmv = 0.30;
            let codigoLocat = 'COM-001';
            let descActividad = 'Venta al por menor de víveres, alimentos y abarrotes';
            let patenteIdFromSelect = null;
            if (selectLocat && selectLocat.selectedIndex >= 0) {
                const opt = selectLocat.options[selectLocat.selectedIndex];
                codigoLocat = opt.value;
                descActividad = opt.text.split('] ')[1]?.split(' —')[0] || opt.text;
                alicuota = parseFloat(opt.dataset.alicuota || 0.01);
                minTcmmv = parseFloat(opt.dataset.minimo || 0.30);
                patenteIdFromSelect = opt.dataset.patenteId || null;
            }
            const tasaActual = getTasaMMAV();
            const minimoBs = minTcmmv * tasaActual;
            const impAlicuota = baseImponible * alicuota;
            const totalPagar = Math.max(impAlicuota, minimoBs);

            const declaraciones = store.get('hacienda_declaraciones') || [];
            const yaExiste = declaraciones.some(d => String(d.contribuyente_id) === String(activeContribuyente.id) && d.mes === mes && d.anio === anio);
            if (yaExiste) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'warning', title: 'Período ya declarado', text: `Ya existe una declaración para ${MESES[mes - 1]} ${anio}.`, confirmButtonColor: '#000000' });
                }
                return;
            }

            const patentes = (store.get('hacienda_patentes') || []).filter(p => String(p.contribuyente_id) === String(activeContribuyente.id) && p.estado !== 'anulada' && p.estado !== 'suspendida');
            let p = (patenteIdFromSelect ? patentes.find(pat => String(pat.id) === String(patenteIdFromSelect)) : null) || patentes[0] || null;
            if (!p) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Sin Licencia Comercial',
                        text: 'Su comercio no tiene una Patente de Actividades Económicas emitida por la Alcaldía. Comuníquese con la Dirección de Administración Tributaria para formalizar la asignación de su ramo LOCAT.',
                        confirmButtonColor: '#000000'
                    });
                }
                return;
            }

            const nuevaDeclaracion = {
                id: Date.now(),
                contribuyente_id: activeContribuyente.id,
                patente_id: p.id,
                anio: anio,
                mes: mes,
                base_imponible_bs: baseImponible,
                alicuota_aplicada: alicuota,
                impuesto_alicuota_bs: impAlicuota,
                minimo_tributable_bs: minimoBs,
                impuesto_determinado_bs: totalPagar,
                tasa_bcv_aplicada: tasaActual,
                estado: 'pendiente',
                fecha_declaracion: new Date().toISOString()
            };

            await store.set('hacienda_declaraciones', nuevaDeclaracion);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Declaración Registrada',
                    text: `Monto determinado: ${totalPagar.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs. Procede a reportar el pago.`,
                    confirmButtonColor: '#000000'
                });
            }

            this.cambiarEmpresaTab('pagar');
        },

        alCambiarMetodoPago: function(metodoId) {
            const store = global.HaciendaStore;
            if (!store) return;
            const metodos = store.get('hacienda_metodos_pago') || [];
            const m = metodos.find(item => String(item.id) === String(metodoId));
            if (!m) return;

            const selectDestino = document.getElementById('pago-banco-destino');
            if (selectDestino && m.cuenta_id) {
                selectDestino.value = String(m.cuenta_id);
            }
        },

        guardarPago: async function() {
            const store = global.HaciendaStore;
            if (!store || !activeContribuyente) return;

            const decId = document.getElementById('pago-declaracion-id')?.value;
            const metodoSelect = document.getElementById('pago-metodo-id');
            const metodoId = metodoSelect ? metodoSelect.value : null;
            const optMetodo = metodoSelect && metodoSelect.selectedIndex >= 0 ? metodoSelect.options[metodoSelect.selectedIndex] : null;
            const cuentaIdDesdeMetodo = optMetodo?.dataset?.cuentaId ? parseInt(optMetodo.dataset.cuentaId, 10) : null;
            const canalMetodo = optMetodo?.dataset?.canal || 'transferencia';

            const bancoDestinoSelect = document.getElementById('pago-banco-destino');
            const optDestino = bancoDestinoSelect && bancoDestinoSelect.selectedIndex >= 0 ? bancoDestinoSelect.options[bancoDestinoSelect.selectedIndex] : null;
            const cuentaIdDesdeDestino = bancoDestinoSelect && bancoDestinoSelect.value ? parseInt(bancoDestinoSelect.value, 10) : null;
            const bancoDestinoNombre = optDestino?.dataset?.bancoNombre || (optDestino ? optDestino.text.trim() : 'Tesorería Municipal');

            const bancoOrigen = document.getElementById('pago-banco-origen')?.value.trim() || 'No especificado';
            const referencia = document.getElementById('pago-referencia')?.value.trim();
            const monto = parseFloat(document.getElementById('pago-monto')?.value || 0);
            const fecha = document.getElementById('pago-fecha')?.value;

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

            const metodos = store.get('hacienda_metodos_pago') || [];
            const metodoObj = metodos.find(m => String(m.id) === String(metodoId));
            const cuentaIdFinal = (metodoObj && metodoObj.cuenta_id) ? metodoObj.cuenta_id : (cuentaIdDesdeMetodo || cuentaIdDesdeDestino || null);

            const nuevoPago = {
                id: Date.now(),
                numero_recibo: 'REC-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4),
                contribuyente_id: activeContribuyente.id,
                declaracion_id: decId,
                metodo_pago_id: metodoObj ? metodoObj.id : (metodoId ? parseInt(metodoId, 10) : null),
                cuenta_id: cuentaIdFinal,
                banco_origen: bancoOrigen,
                banco_destino: bancoDestinoNombre,
                referencia_bancaria: referencia,
                fecha_pago: fecha,
                monto_bs: monto,
                metodo: canalMetodo,
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
                    const rifHelper = global.HaciendaRIF;
                    const parsed = rifHelper ? rifHelper.parse(rifInicial) : { tipo: 'J', numero: String(rifInicial).replace(/\D/g, '') };
                    const sel = document.getElementById('ins-rif-tipo');
                    const inp = document.getElementById('ins-rif-numero');
                    if (sel && parsed.tipo) sel.value = parsed.tipo;
                    if (inp) inp.value = parsed.numero;
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
            const rawNum = document.getElementById('ins-rif-numero').value;
            const rifHelper = global.HaciendaRIF;
            const parsed = rifHelper ? rifHelper.parse((tipo ? (tipo + '-') : '') + rawNum) : { tipo, numero: rawNum.replace(/\D/g, ''), full: tipo + '-' + rawNum.replace(/\D/g, '') };
            const razon = document.getElementById('ins-razon').value.trim();
            const codigoActividad = document.getElementById('ins-actividad').value;

            // Sanitizar Teléfono a solo dígitos numéricos
            const rawTel = document.getElementById('ins-telefono')?.value || '';
            const telefono = (global.HaciendaTelefono ? global.HaciendaTelefono.sanitizar(rawTel) : rawTel.replace(/\D/g, '')).trim();

            const correo = document.getElementById('ins-correo').value.trim();

            // Cédula y Representante Legal
            const repNombre = (document.getElementById('ins-rep-nombre')?.value || '').trim();
            const tipoCed = document.getElementById('ins-rep-cedula-tipo')?.value || 'V';
            const numCed = document.getElementById('ins-rep-cedula-numero')?.value || '';
            const cedHelper = global.HaciendaCedula;
            const parsedCedula = cedHelper 
                ? cedHelper.parse((tipoCed ? (tipoCed + '-') : '') + numCed) 
                : { tipo: tipoCed, numero: numCed.replace(/\D/g, ''), full: numCed ? (tipoCed + '-' + numCed.replace(/\D/g, '')) : '' };

            if (!parsed.numero || !razon) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Datos requeridos', text: 'Indica el número de RIF (solo números) y la Razón Social.', confirmButtonColor: '#000000' });
                return;
            }

            // Contraseña de acceso
            const clave = (document.getElementById('ins-clave')?.value || '').trim();
            const claveConfirm = (document.getElementById('ins-clave-confirm')?.value || '').trim();

            if (!clave || clave.length < 6) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Contraseña Requerida', text: 'La contraseña de acceso debe contener al menos 6 caracteres.', confirmButtonColor: '#000000' });
                return;
            }
            if (clave !== claveConfirm) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Contraseñas no coinciden', text: 'La contraseña y su confirmación no son iguales.', confirmButtonColor: '#000000' });
                return;
            }
            const hashClaveVal = await hashClave(clave);

            const rifCompleto = parsed.full;
            const contribuyenteId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
                ? crypto.randomUUID()
                : ('usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8));

            const nuevoContribuyente = {
                id: contribuyenteId,
                rif: rifCompleto,
                razon_social: razon,
                denominacion_comercial: razon,
                tipo_persona: tipo === 'V' ? 'natural' : 'juridica',
                correo: correo,
                telefono: telefono,
                direccion_fiscal: '',
                representante_legal: repNombre,
                representante_cedula: parsedCedula.full,
                clave: hashClaveVal,
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
                                        <option value="J">J (Jurídico)</option>
                                        <option value="V">V (Natural)</option>
                                        <option value="G">G (Gobierno)</option>
                                        <option value="E">E (Extranjero)</option>
                                        <option value="C">C (Comuna)</option>
                                        <option value="P">P (Pasaporte)</option>
                                    </select>
                                </div>
                                <div class="col-span-2">
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase block mb-1">Número de RIF (Solo Números)</label>
                                    <input type="text" id="ins-rif-numero" placeholder="Ej: 301234567" 
                                           inputmode="numeric" pattern="[0-9]*" maxlength="10"
                                           oninput="if(window.HaciendaRIF) window.HaciendaRIF.handleInput(this, 'ins-rif-tipo')"
                                           class="w-full bg-[#18181b] border border-white/10 text-white font-mono rounded-xl px-3 py-2.5 outline-none focus:border-white/30">
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
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase block mb-1">Teléfono (Solo Números)</label>
                                    <input type="tel" id="ins-telefono" placeholder="Solo números (ej: 04141234567)" 
                                           inputmode="numeric" pattern="[0-9]*" maxlength="11"
                                           oninput="if(window.HaciendaTelefono) window.HaciendaTelefono.handleInput(this); else this.value=this.value.replace(/\D/g, '')"
                                           class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none focus:border-white/30 font-mono text-xs">
                                </div>
                                <div>
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase block mb-1">Correo Electrónico</label>
                                    <input type="email" id="ins-correo" placeholder="correo@comercio.com" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none focus:border-white/30 text-xs">
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase block mb-1">Representante Legal</label>
                                    <input type="text" id="ins-rep-nombre" placeholder="Nombre y Apellido" class="w-full bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none focus:border-white/30 text-xs">
                                </div>
                                <div>
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase block mb-1">Cédula del Representante</label>
                                    <div class="grid grid-cols-3 gap-2">
                                        <select id="ins-rep-cedula-tipo" class="bg-[#18181b] border border-white/10 text-white rounded-xl px-2 py-2.5 text-xs outline-none focus:border-white/30">
                                            <option value="V">V</option>
                                            <option value="E">E</option>
                                            <option value="P">P</option>
                                        </select>
                                        <input type="text" id="ins-rep-cedula-numero" placeholder="Solo números" 
                                               inputmode="numeric" pattern="[0-9]*" maxlength="9"
                                               oninput="if(window.HaciendaCedula) window.HaciendaCedula.handleInput(this, 'ins-rep-cedula-tipo')"
                                               class="col-span-2 bg-[#18181b] border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs font-mono outline-none focus:border-white/30">
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase block mb-1">Contraseña de Acceso</label>
                                    <div class="flex items-center border border-white/10 rounded-xl bg-[#18181b] focus-within:border-white/30 transition overflow-hidden px-3">
                                        <input type="password" id="ins-clave" placeholder="Mínimo 6 caracteres" class="w-full bg-transparent text-white text-xs py-2.5 outline-none placeholder:text-neutral-500">
                                        <button type="button" onclick="window.PortalComercio.toggleInputClave('ins-clave', 'ins-clave-eye')" class="text-neutral-400 hover:text-white transition pl-2 text-xs" title="Mostrar u ocultar contraseña">
                                            <i id="ins-clave-eye" class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label class="text-[11px] font-medium text-neutral-400 uppercase block mb-1">Confirmar Contraseña</label>
                                    <div class="flex items-center border border-white/10 rounded-xl bg-[#18181b] focus-within:border-white/30 transition overflow-hidden px-3">
                                        <input type="password" id="ins-clave-confirm" placeholder="Repite la contraseña" class="w-full bg-transparent text-white text-xs py-2.5 outline-none placeholder:text-neutral-500">
                                        <button type="button" onclick="window.PortalComercio.toggleInputClave('ins-clave-confirm', 'ins-clave-confirm-eye')" class="text-neutral-400 hover:text-white transition pl-2 text-xs" title="Mostrar u ocultar contraseña">
                                            <i id="ins-clave-confirm-eye" class="fas fa-eye"></i>
                                        </button>
                                    </div>
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

        renderModalPrimerIngreso: function() {
            return `
                <div id="modal-primer-ingreso" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden flex items-center justify-center p-4">
                    <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-4 border border-slate-200">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 class="text-base font-bold text-black">Primer Ingreso al Portal</h3>
                                <p class="text-xs text-slate-500">Configure su contraseña segura de acceso</p>
                            </div>
                            <button onclick="window.PortalComercio.cerrarModalPrimerIngreso()" class="text-slate-400 hover:text-black p-1">
                                <i class="fas fa-times text-sm"></i>
                            </button>
                        </div>

                        <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 leading-relaxed">
                            <span id="pi-comercio-info" class="font-semibold block mb-1">Comercio</span>
                            Su comercio se encuentra registrado en el padrón municipal pero aún no tiene clave. Por su seguridad, confirme la Cédula del Representante Legal para activar su acceso.
                        </div>

                        <input type="hidden" id="pi-contribuyente-id">

                        <div class="space-y-3 text-xs">
                            <div>
                                <label class="text-[11px] font-medium text-slate-600 uppercase block mb-1">Cédula del Representante Legal (Solo Números)</label>
                                <div class="grid grid-cols-3 gap-2">
                                    <select id="pi-cedula-tipo" class="bg-white border border-slate-200 text-slate-800 rounded-xl px-2 py-2.5 text-xs outline-none focus:border-slate-400">
                                        <option value="V">V</option>
                                        <option value="E">E</option>
                                        <option value="P">P</option>
                                    </select>
                                    <input type="text" id="pi-cedula-numero" placeholder="Solo números (ej: 12345678)"
                                           inputmode="numeric" pattern="[0-9]*" maxlength="9"
                                           oninput="if(window.HaciendaCedula) window.HaciendaCedula.handleInput(this, 'pi-cedula-tipo')"
                                           class="col-span-2 bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono outline-none focus:border-slate-400">
                                </div>
                            </div>

                            <div>
                                <label class="text-[11px] font-medium text-slate-600 uppercase block mb-1">Nueva Contraseña (Mínimo 6 caracteres)</label>
                                <div class="flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-slate-400 transition overflow-hidden px-3">
                                    <input type="password" id="pi-clave" placeholder="••••••••" 
                                           class="w-full bg-transparent text-slate-800 text-xs py-2.5 outline-none placeholder:text-slate-400">
                                    <button type="button" onclick="window.PortalComercio.toggleInputClave('pi-clave', 'pi-clave-eye')" class="text-slate-400 hover:text-slate-600 transition pl-2 text-xs" title="Mostrar u ocultar contraseña">
                                        <i id="pi-clave-eye" class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label class="text-[11px] font-medium text-slate-600 uppercase block mb-1">Confirmar Nueva Contraseña</label>
                                <div class="flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-slate-400 transition overflow-hidden px-3">
                                    <input type="password" id="pi-clave-confirm" placeholder="••••••••" 
                                           class="w-full bg-transparent text-slate-800 text-xs py-2.5 outline-none placeholder:text-slate-400">
                                    <button type="button" onclick="window.PortalComercio.toggleInputClave('pi-clave-confirm', 'pi-clave-confirm-eye')" class="text-slate-400 hover:text-slate-600 transition pl-2 text-xs" title="Mostrar u ocultar contraseña">
                                        <i id="pi-clave-confirm-eye" class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button onclick="window.PortalComercio.cerrarModalPrimerIngreso()" class="px-4 py-2.5 text-xs text-slate-500 hover:text-black">Cancelar</button>
                            <button onclick="window.PortalComercio.guardarPrimerIngreso()" 
                                    class="bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl px-5 py-2.5 transition flex items-center justify-center gap-1.5 shadow-sm"
                                    style="background-color: #000000 !important; color: #ffffff !important;">
                                <span style="color: #ffffff !important;">Activar Acceso</span>
                                <span style="color: #ffffff !important;">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        renderModalRecuperarClave: function() {
            return `
                <div id="modal-recuperar-clave" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden flex items-center justify-center p-4">
                    <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-4 border border-slate-200">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 class="text-base font-bold text-black">Recuperación de Contraseña</h3>
                                <p class="text-xs text-slate-500">Validación de identidad municipal</p>
                            </div>
                            <button onclick="window.PortalComercio.cerrarModalRecuperarClave()" class="text-slate-400 hover:text-black p-1">
                                <i class="fas fa-times text-sm"></i>
                            </button>
                        </div>

                        <div class="space-y-3 text-xs">
                            <div>
                                <label class="text-[11px] font-medium text-slate-600 uppercase block mb-1">RIF del Comercio o Correo</label>
                                <input type="text" id="rec-identificador" placeholder="Ej: J-123456789 o correo@comercio.com" 
                                       class="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-slate-400 text-xs">
                            </div>

                            <div>
                                <label class="text-[11px] font-medium text-slate-600 uppercase block mb-1">Cédula del Representante Legal (Solo Números)</label>
                                <div class="grid grid-cols-3 gap-2">
                                    <select id="rec-cedula-tipo" class="bg-white border border-slate-200 text-slate-800 rounded-xl px-2 py-2.5 text-xs outline-none focus:border-slate-400">
                                        <option value="V">V</option>
                                        <option value="E">E</option>
                                        <option value="P">P</option>
                                    </select>
                                    <input type="text" id="rec-cedula-numero" placeholder="Solo números"
                                           inputmode="numeric" pattern="[0-9]*" maxlength="9"
                                           oninput="if(window.HaciendaCedula) window.HaciendaCedula.handleInput(this, 'rec-cedula-tipo')"
                                           class="col-span-2 bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono outline-none focus:border-slate-400">
                                </div>
                            </div>

                            <div>
                                <label class="text-[11px] font-medium text-slate-600 uppercase block mb-1">Nueva Contraseña (Mínimo 6 caracteres)</label>
                                <div class="flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-slate-400 transition overflow-hidden px-3">
                                    <input type="password" id="rec-nueva-clave" placeholder="••••••••" 
                                           class="w-full bg-transparent text-slate-800 text-xs py-2.5 outline-none placeholder:text-slate-400">
                                    <button type="button" onclick="window.PortalComercio.toggleInputClave('rec-nueva-clave', 'rec-nueva-clave-eye')" class="text-slate-400 hover:text-slate-600 transition pl-2 text-xs" title="Mostrar u ocultar contraseña">
                                        <i id="rec-nueva-clave-eye" class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label class="text-[11px] font-medium text-slate-600 uppercase block mb-1">Confirmar Nueva Contraseña</label>
                                <div class="flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-slate-400 transition overflow-hidden px-3">
                                    <input type="password" id="rec-confirm-clave" placeholder="••••••••" 
                                           class="w-full bg-transparent text-slate-800 text-xs py-2.5 outline-none placeholder:text-slate-400">
                                    <button type="button" onclick="window.PortalComercio.toggleInputClave('rec-confirm-clave', 'rec-confirm-clave-eye')" class="text-slate-400 hover:text-slate-600 transition pl-2 text-xs" title="Mostrar u ocultar contraseña">
                                        <i id="rec-confirm-clave-eye" class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button onclick="window.PortalComercio.cerrarModalRecuperarClave()" class="px-4 py-2.5 text-xs text-slate-500 hover:text-black">Cancelar</button>
                            <button onclick="window.PortalComercio.guardarRecuperarClave()" 
                                    class="bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl px-5 py-2.5 transition flex items-center justify-center gap-1.5 shadow-sm"
                                    style="background-color: #000000 !important; color: #ffffff !important;">
                                <span style="color: #ffffff !important;">Restablecer Clave</span>
                                <span style="color: #ffffff !important;">→</span>
                            </button>
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

        copiarAlPortapapeles: function(texto, label = 'Dato copiado.') {
            if (!texto) return;
            navigator.clipboard.writeText(texto).then(() => {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Copiado',
                        text: label,
                        timer: 1200,
                        showConfirmButton: false
                    });
                }
            });
        }
    };

    global.PortalComercio = Portal;
})(typeof window !== 'undefined' ? window : this);
