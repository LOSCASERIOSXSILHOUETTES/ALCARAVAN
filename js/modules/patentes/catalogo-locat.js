/**
 * GUIRIRI SISTEMA HACIENDA V3 — Catálogo Armonizado LOCAT
 * Clasificador Nacional Ampliado de Actividades Económicas y Alícuotas Oficiales de Venezuela.
 * Adaptado a la Ley Orgánica de Coordinación y Armonización Tributaria (LOCAT) y Gaceta Oficial N° 6.755.
 */
(function defineLocatCatalog(global) {
    "use strict";

    const CATALOGO = [
        // ==========================================
        // 1. COMERCIO AL POR MENOR Y MAYOR (ALIMENTOS Y BÁSICOS)
        // ==========================================
        { codigo: "COM-001", categoria: "Comercio de Alimentos y Víveres", nombre: "Venta al por menor de víveres, alimentos secos y abarrotes", alicuota: 0.0100, minimo_tcmmv: 0.30 },
        { codigo: "COM-002", categoria: "Comercio de Alimentos y Víveres", nombre: "Supermercados, minimarkets e hipermercados", alicuota: 0.0125, minimo_tcmmv: 0.60 },
        { codigo: "COM-003", categoria: "Comercio de Alimentos y Víveres", nombre: "Carnicerías, charcuterías y expendio de carnes de aves y porcinos", alicuota: 0.0100, minimo_tcmmv: 0.35 },
        { codigo: "COM-004", categoria: "Comercio de Alimentos y Víveres", nombre: "Pescaderías y venta de mariscos y especies marinas", alicuota: 0.0100, minimo_tcmmv: 0.30 },
        { codigo: "COM-005", categoria: "Comercio de Alimentos y Víveres", nombre: "Fruterías, verdulerías y venta de hortalizas", alicuota: 0.0080, minimo_tcmmv: 0.25 },
        { codigo: "COM-006", categoria: "Comercio de Alimentos y Víveres", nombre: "Panaderías, pastelerías y reposterías", alicuota: 0.0125, minimo_tcmmv: 0.40 },
        { codigo: "COM-007", categoria: "Comercio de Alimentos y Víveres", nombre: "Farmacias, droguerías y expendios de medicinas y material médico", alicuota: 0.0100, minimo_tcmmv: 0.35 },
        { codigo: "COM-008", categoria: "Comercio de Alimentos y Víveres", nombre: "Distribución y venta al mayor de víveres y alimentos no perecederos", alicuota: 0.0150, minimo_tcmmv: 0.80 },

        // ==========================================
        // 2. COMERCIO GENERAL, FERRETERÍA Y HOGAR
        // ==========================================
        { codigo: "COM-009", categoria: "Ferretería, Repuestos y Bienes del Hogar", nombre: "Ferreterías, materiales de construcción, pinturas y griferías", alicuota: 0.0150, minimo_tcmmv: 0.50 },
        { codigo: "COM-010", categoria: "Ferretería, Repuestos y Bienes del Hogar", nombre: "Venta de repuestos, autopartes, accesorios y lubricantes para vehículos", alicuota: 0.0200, minimo_tcmmv: 0.60 },
        { codigo: "COM-011", categoria: "Ferretería, Repuestos y Bienes del Hogar", nombre: "Venta de electrodomésticos, línea blanca y línea marrón", alicuota: 0.0250, minimo_tcmmv: 0.80 },
        { codigo: "COM-012", categoria: "Ferretería, Repuestos y Bienes del Hogar", nombre: "Equipos de computación, celulares, electrónica y accesorios digitales", alicuota: 0.0200, minimo_tcmmv: 0.60 },
        { codigo: "COM-013", categoria: "Ferretería, Repuestos y Bienes del Hogar", nombre: "Mueblerías, colchonerías y artículos de decoración para el hogar", alicuota: 0.0175, minimo_tcmmv: 0.60 },
        { codigo: "COM-014", categoria: "Ferretería, Repuestos y Bienes del Hogar", nombre: "Tiendas de ropa, textiles, telas, mercerías y lencería", alicuota: 0.0150, minimo_tcmmv: 0.40 },
        { codigo: "COM-015", categoria: "Ferretería, Repuestos y Bienes del Hogar", nombre: "Zapaterías, calzado, marroquinería y artículos de cuero", alicuota: 0.0150, minimo_tcmmv: 0.40 },
        { codigo: "COM-016", categoria: "Ferretería, Repuestos y Bienes del Hogar", nombre: "Papelerías, librerías, artículos de oficina y quincallas", alicuota: 0.0100, minimo_tcmmv: 0.30 },
        { codigo: "COM-017", categoria: "Ferretería, Repuestos y Bienes del Hogar", nombre: "Jugueterías, piñaterías y artículos para celebraciones", alicuota: 0.0150, minimo_tcmmv: 0.40 },
        { codigo: "COM-018", categoria: "Ferretería, Repuestos y Bienes del Hogar", nombre: "Joyerías, platerías, relojerías y fantasías finas", alicuota: 0.0250, minimo_tcmmv: 1.00 },
        { codigo: "COM-019", categoria: "Ferretería, Repuestos y Bienes del Hogar", nombre: "Cosméticos, perfumerías y productos de belleza y cuidado personal", alicuota: 0.0175, minimo_tcmmv: 0.45 },
        { codigo: "COM-020", categoria: "Ferretería, Repuestos y Bienes del Hogar", nombre: "Floristerías, viveros y artículos de botánica y jardinería", alicuota: 0.0100, minimo_tcmmv: 0.30 },
        { codigo: "COM-021", categoria: "Ferretería, Repuestos y Bienes del Hogar", nombre: "Agropecuarias, alimentos concentrados, semillas y fertilizantes", alicuota: 0.0100, minimo_tcmmv: 0.50 },
        { codigo: "COM-022", categoria: "Ferretería, Repuestos y Bienes del Hogar", nombre: "Tiendas de mascotas, acuarios y productos para animales domésticos", alicuota: 0.0150, minimo_tcmmv: 0.40 },
        { codigo: "COM-023", categoria: "Ferretería, Repuestos y Bienes del Hogar", nombre: "Ópticas, examen visual y venta de cristales y monturas", alicuota: 0.0125, minimo_tcmmv: 0.40 },

        // ==========================================
        // 3. RESTAURANTES, ALIMENTOS PREPARADOS Y HOSPEDAJE
        // ==========================================
        { codigo: "RES-001", categoria: "Restaurantes y Hospedaje", nombre: "Restaurantes, mesones, tascas-restaurante y comida a la carta", alicuota: 0.0175, minimo_tcmmv: 0.50 },
        { codigo: "RES-002", categoria: "Restaurantes y Hospedaje", nombre: "Pizzerías, hamburgueserías y locales de comida rápida", alicuota: 0.0150, minimo_tcmmv: 0.45 },
        { codigo: "RES-003", categoria: "Restaurantes y Hospedaje", nombre: "Fuentes de soda, cafeterías, luncherías y areperas", alicuota: 0.0125, minimo_tcmmv: 0.35 },
        { codigo: "RES-004", categoria: "Restaurantes y Hospedaje", nombre: "Heladerías, paleterías y venta de postres y dulces", alicuota: 0.0125, minimo_tcmmv: 0.35 },
        { codigo: "RES-005", categoria: "Restaurantes y Hospedaje", nombre: "Servicios de catering, banquetes y preparación de comida para eventos", alicuota: 0.0150, minimo_tcmmv: 0.50 },
        { codigo: "RES-006", categoria: "Restaurantes y Hospedaje", nombre: "Hoteles, posadas, hostales y servicios de hospedaje turístico", alicuota: 0.0200, minimo_tcmmv: 1.00 },

        // ==========================================
        // 4. LICORES, TABACO Y ENTRETENIMIENTO NOCTURNO
        // ==========================================
        { codigo: "LIC-001", categoria: "Licores y Diversión Nocturna", nombre: "Expendio de bebidas alcohólicas al detal en envase cerrado (Licorerías)", alicuota: 0.0350, minimo_tcmmv: 1.50 },
        { codigo: "LIC-002", categoria: "Licores y Diversión Nocturna", nombre: "Distribución y venta al mayor de cerveza y licores", alicuota: 0.0400, minimo_tcmmv: 2.50 },
        { codigo: "LIC-003", categoria: "Licores y Diversión Nocturna", nombre: "Bares, tascas, cervecerías y expendio de alcohol en envase abierto", alicuota: 0.0400, minimo_tcmmv: 1.80 },
        { codigo: "LIC-004", categoria: "Licores y Diversión Nocturna", nombre: "Discotecas, clubes nocturnos, lounges y salones de baile", alicuota: 0.0450, minimo_tcmmv: 2.00 },
        { codigo: "LIC-005", categoria: "Licores y Diversión Nocturna", nombre: "Centros hípicos, agencias de loterías y apuestas lícitas", alicuota: 0.0450, minimo_tcmmv: 2.00 },
        { codigo: "LIC-006", categoria: "Licores y Diversión Nocturna", nombre: "Billares, salas de pool, bowling y salones recreativos", alicuota: 0.0300, minimo_tcmmv: 1.00 },

        // ==========================================
        // 5. SERVICIOS MECÁNICOS, MANTENIMIENTO Y PERSONALES
        // ==========================================
        { codigo: "SER-001", categoria: "Servicios Técnicos y Personales", nombre: "Talleres mecánicos automotrices, electromecánica y suspensión", alicuota: 0.0150, minimo_tcmmv: 0.45 },
        { codigo: "SER-002", categoria: "Servicios Técnicos y Personales", nombre: "Latonería, pintura y chapa automotriz", alicuota: 0.0150, minimo_tcmmv: 0.45 },
        { codigo: "SER-003", categoria: "Servicios Técnicos y Personales", nombre: "Autolavados, lubricentros y servicios de lavado y engrase", alicuota: 0.0150, minimo_tcmmv: 0.40 },
        { codigo: "SER-004", categoria: "Servicios Técnicos y Personales", nombre: "Caucheras, vulcanizadoras y alineación y balanceo", alicuota: 0.0125, minimo_tcmmv: 0.35 },
        { codigo: "SER-005", categoria: "Servicios Técnicos y Personales", nombre: "Talleres de herrería, metalmecánica, soldadura y forja", alicuota: 0.0125, minimo_tcmmv: 0.40 },
        { codigo: "SER-006", categoria: "Servicios Técnicos y Personales", nombre: "Carpinterías, ebanisterías y tapicerías de muebles y autos", alicuota: 0.0125, minimo_tcmmv: 0.35 },
        { codigo: "SER-007", categoria: "Servicios Técnicos y Personales", nombre: "Reparación de electrodomésticos, refrigeración y aire acondicionado", alicuota: 0.0125, minimo_tcmmv: 0.35 },
        { codigo: "SER-008", categoria: "Servicios Técnicos y Personales", nombre: "Servicios de cerrajería residencial y automotriz", alicuota: 0.0100, minimo_tcmmv: 0.25 },
        { codigo: "SER-009", categoria: "Servicios Técnicos y Personales", nombre: "Tintorerías, lavanderías y planchadurías comerciales", alicuota: 0.0125, minimo_tcmmv: 0.35 },
        { codigo: "SER-010", categoria: "Servicios Técnicos y Personales", nombre: "Peluquerías, barberías, estéticas y salones de belleza", alicuota: 0.0125, minimo_tcmmv: 0.35 },
        { codigo: "SER-011", categoria: "Servicios Técnicos y Personales", nombre: "Spa, masajes, tratamientos estéticos y cuidado de la piel", alicuota: 0.0175, minimo_tcmmv: 0.50 },
        { codigo: "SER-012", categoria: "Servicios Técnicos y Personales", nombre: "Gimnasios, academias de artes marciales y centros de entrenamiento", alicuota: 0.0125, minimo_tcmmv: 0.40 },
        { codigo: "SER-013", categoria: "Servicios Técnicos y Personales", nombre: "Agencias de festejos, alquiler de mobiliario, toldos y sonido", alicuota: 0.0150, minimo_tcmmv: 0.40 },
        { codigo: "SER-014", categoria: "Servicios Técnicos y Personales", nombre: "Servicios funerarios, salas de velación y traslados fúnebres", alicuota: 0.0125, minimo_tcmmv: 0.60 },
        { codigo: "SER-015", categoria: "Servicios Técnicos y Personales", nombre: "Empresas de transporte terrestre de carga, mudanzas y fletes", alicuota: 0.0150, minimo_tcmmv: 0.70 },
        { codigo: "SER-016", categoria: "Servicios Técnicos y Personales", nombre: "Empresas de encomiendas, casilleros, paquetería y mensajería", alicuota: 0.0150, minimo_tcmmv: 0.50 },
        { codigo: "SER-017", categoria: "Servicios Técnicos y Personales", nombre: "Estacionamientos comerciales públicos y garajes de custodia", alicuota: 0.0125, minimo_tcmmv: 0.40 },

        // ==========================================
        // 6. SALUD, EDUCACIÓN Y SERVICIOS PROFESIONALES
        // ==========================================
        { codigo: "SAL-001", categoria: "Salud, Educación y Asesoría", nombre: "Clínicas, policlínicas, maternidades y centros de hospitalización privados", alicuota: 0.0120, minimo_tcmmv: 1.00 },
        { codigo: "SAL-002", categoria: "Salud, Educación y Asesoría", nombre: "Laboratorios de bioanálisis, citología, radiología y diagnóstico médico", alicuota: 0.0120, minimo_tcmmv: 0.50 },
        { codigo: "SAL-003", categoria: "Salud, Educación y Asesoría", nombre: "Consultorios médicos, policonsultorios y clínicas odontológicas", alicuota: 0.0100, minimo_tcmmv: 0.35 },
        { codigo: "SAL-004", categoria: "Salud, Educación y Asesoría", nombre: "Clínicas y consultorios veterinarios para pequeños y grandes animales", alicuota: 0.0120, minimo_tcmmv: 0.35 },
        { codigo: "EDU-001", categoria: "Salud, Educación y Asesoría", nombre: "Colegios privados, institutos de educación básica y media diversificada", alicuota: 0.0080, minimo_tcmmv: 0.50 },
        { codigo: "EDU-002", categoria: "Salud, Educación y Asesoría", nombre: "Guarderías, maternales y preescolares privados", alicuota: 0.0080, minimo_tcmmv: 0.30 },
        { codigo: "EDU-003", categoria: "Salud, Educación y Asesoría", nombre: "Academias de idiomas, computación, música y formación técnica", alicuota: 0.0100, minimo_tcmmv: 0.40 },
        { codigo: "PRO-001", categoria: "Salud, Educación y Asesoría", nombre: "Bufetes de abogados, asesoría jurídica y consultorías legales", alicuota: 0.0150, minimo_tcmmv: 0.50 },
        { codigo: "PRO-002", categoria: "Salud, Educación y Asesoría", nombre: "Firmas de contadores públicos, auditoría contable y gestión fiscal", alicuota: 0.0150, minimo_tcmmv: 0.50 },
        { codigo: "PRO-003", categoria: "Salud, Educación y Asesoría", nombre: "Oficinas de arquitectura, ingeniería, cálculo y topografía", alicuota: 0.0150, minimo_tcmmv: 0.60 },
        { codigo: "PRO-004", categoria: "Salud, Educación y Asesoría", nombre: "Agencias de publicidad, diseño gráfico, marketing y creación de contenido", alicuota: 0.0150, minimo_tcmmv: 0.50 },
        { codigo: "PRO-005", categoria: "Salud, Educación y Asesoría", nombre: "Inmobiliarias, corretaje de bienes raíces y administración de condominios", alicuota: 0.0175, minimo_tcmmv: 0.60 },
        { codigo: "PRO-006", categoria: "Salud, Educación y Asesoría", nombre: "Empresas de vigilancia privada, seguridad industrial y custodia", alicuota: 0.0175, minimo_tcmmv: 0.80 },

        // ==========================================
        // 7. INDUSTRIA, AGRO, MANUFACTURA Y CONSTRUCCIÓN
        // ==========================================
        { codigo: "IND-001", categoria: "Industria, Agro y Construcción", nombre: "Industria quesera, láctea y procesamiento artesanal e industrial de leche", alicuota: 0.0100, minimo_tcmmv: 0.50 },
        { codigo: "IND-002", categoria: "Industria, Agro y Construcción", nombre: "Fábricas de embutidos, chacinados y beneficio de animales", alicuota: 0.0125, minimo_tcmmv: 0.60 },
        { codigo: "IND-003", categoria: "Industria, Agro y Construcción", nombre: "Torrefactoras de café, procesamiento de cacao, cereales y granos", alicuota: 0.0100, minimo_tcmmv: 0.50 },
        { codigo: "IND-004", categoria: "Industria, Agro y Construcción", nombre: "Fábricas de hielo y plantas envasadoras de agua purificada", alicuota: 0.0125, minimo_tcmmv: 0.40 },
        { codigo: "IND-005", categoria: "Industria, Agro y Construcción", nombre: "Fabricación de bloques, premix, tubos de cemento y derivados", alicuota: 0.0150, minimo_tcmmv: 0.80 },
        { codigo: "IND-006", categoria: "Industria, Agro y Construcción", nombre: "Empresas constructoras y contratistas de obras civiles e infraestructura", alicuota: 0.0200, minimo_tcmmv: 1.00 },
        { codigo: "IND-007", categoria: "Industria, Agro y Construcción", nombre: "Explotación de canteras, areneras y extracción de agregados", alicuota: 0.0250, minimo_tcmmv: 1.50 },
        { codigo: "IND-008", categoria: "Industria, Agro y Construcción", nombre: "Confección textil industrial, uniformes corporativos y calzado", alicuota: 0.0100, minimo_tcmmv: 0.40 },
        { codigo: "IND-009", categoria: "Industria, Agro y Construcción", nombre: "Imprentas, litografías, tipografías y gigantografías comerciales", alicuota: 0.0125, minimo_tcmmv: 0.45 },

        // ==========================================
        // 8. TELECOMUNICACIONES, TECNOLOGÍA Y FINANZAS
        // ==========================================
        { codigo: "TEL-001", categoria: "Telecomunicaciones y Finanzas", nombre: "Empresas proveedoras de internet (ISP / Fibra óptica / Inalámbrico)", alicuota: 0.0300, minimo_tcmmv: 2.50 },
        { codigo: "TEL-002", categoria: "Telecomunicaciones y Finanzas", nombre: "Operadoras de televisión por suscripción, cable y satelital", alicuota: 0.0300, minimo_tcmmv: 2.00 },
        { codigo: "TEL-003", categoria: "Telecomunicaciones y Finanzas", nombre: "Operadoras de telefonía fija, móvil y transmisión de datos", alicuota: 0.0300, minimo_tcmmv: 3.00 },
        { codigo: "FIN-001", categoria: "Telecomunicaciones y Finanzas", nombre: "Bancos comerciales, universales y entidades financieras", alicuota: 0.0500, minimo_tcmmv: 3.00 },
        { codigo: "FIN-002", categoria: "Telecomunicaciones y Finanzas", nombre: "Casas de cambio, remesadoras y corresponsales cambiarios", alicuota: 0.0450, minimo_tcmmv: 2.50 },
        { codigo: "FIN-003", categoria: "Telecomunicaciones y Finanzas", nombre: "Compañías de seguros, reaseguros y sociedades de corretaje", alicuota: 0.0300, minimo_tcmmv: 2.00 }
    ];

    function getItems() {
        const store = (typeof window !== 'undefined' && window.HaciendaStore) || global.HaciendaStore;
        if (store && typeof store.get === 'function') {
            const dbItems = store.get('hacienda_actividades_locat');
            if (Array.isArray(dbItems) && dbItems.length > 0) {
                return dbItems.filter(i => i.activo !== false);
            }
        }
        return CATALOGO;
    }

    global.CatalogoLocat = {
        SEEDS: CATALOGO,
        getAll: () => [...getItems()],
        getByCodigo: (codigo) => getItems().find(item => item.codigo === codigo) || null,
        getCategorias: () => [...new Set(getItems().map(i => i.categoria))],
        getByCategoria: (cat) => getItems().filter(i => i.categoria === cat)
    };

    // =========================================================================
    // MODAL INTERACTIVO DE SELECCIÓN CON BUSCADOR Y TARJETAS (LOCAT)
    // =========================================================================
    let _locatModalCallback = null;
    let _locatModalPagina = 1;
    const _locatModalPorPagina = 8;
    let _locatModalQuery = '';
    let _locatModalCategoria = 'todas';

    const SelectorActividadLocatModal = {
        abrir: function(options) {
            _locatModalCallback = (options && typeof options.onSelect === 'function') ? options.onSelect : null;
            _locatModalPagina = 1;
            _locatModalQuery = (options && options.initialQuery) ? String(options.initialQuery).trim() : '';
            _locatModalCategoria = (options && options.categoria) ? options.categoria : 'todas';

            let modalEl = document.getElementById('modal-selector-actividad-locat');
            if (!modalEl) {
                this.crearEstructura();
                modalEl = document.getElementById('modal-selector-actividad-locat');
            }

            const inputBuscar = document.getElementById('sel-locat-buscar');
            if (inputBuscar) {
                inputBuscar.value = _locatModalQuery;
            }

            modalEl.classList.remove('hidden');
            this.renderizarCategorias();
            this.renderizar();
            setTimeout(() => {
                if (inputBuscar) inputBuscar.focus();
            }, 100);
        },

        cerrar: function() {
            const modalEl = document.getElementById('modal-selector-actividad-locat');
            if (modalEl) modalEl.classList.add('hidden');
            _locatModalCallback = null;
        },

        seleccionar: function(codigo) {
            const item = global.CatalogoLocat.getByCodigo(codigo);
            if (item && typeof _locatModalCallback === 'function') {
                _locatModalCallback(item);
            }
            this.cerrar();
        },

        filtrar: function(texto) {
            _locatModalQuery = String(texto || '').trim().toLowerCase();
            _locatModalPagina = 1;
            this.renderizar();
        },

        filtrarCategoria: function(cat) {
            _locatModalCategoria = cat;
            _locatModalPagina = 1;
            this.renderizarCategorias();
            this.renderizar();
        },

        cambiarPagina: function(p) {
            _locatModalPagina = p;
            this.renderizar();
        },

        crearEstructura: function() {
            if (typeof document === 'undefined') return;
            const div = document.createElement('div');
            div.id = 'modal-selector-actividad-locat';
            div.className = 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 hidden';
            div.innerHTML = `
                <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
                    <!-- Cabecera -->
                    <div class="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60 shrink-0">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                <i class="fas fa-briefcase text-base"></i>
                            </div>
                            <div>
                                <h3 class="text-base font-bold text-slate-100 flex items-center gap-2">
                                    Clasificador Armonizado LOCAT
                                </h3>
                                <p class="text-xs text-slate-400">Gaceta Oficial N° 6.755 · Seleccione la actividad económica y alícuota aplicable</p>
                            </div>
                        </div>
                        <button type="button" onclick="window.SelectorActividadLocatModal.cerrar()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition">
                            <i class="fas fa-times text-xs"></i>
                        </button>
                    </div>

                    <!-- Buscador y Categorias -->
                    <div class="p-5 border-b border-slate-800/80 bg-slate-900/50 space-y-3 shrink-0">
                        <div class="flex flex-col sm:flex-row gap-3 items-center justify-between">
                            <div class="relative w-full">
                                <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                                <input type="text" id="sel-locat-buscar" oninput="window.SelectorActividadLocatModal.filtrar(this.value)" 
                                       placeholder="Buscar por código (ej: COM-001, IND-002), actividad o palabra clave..." 
                                       class="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 transition">
                            </div>
                            <span id="sel-locat-contador" class="shrink-0 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                                Cargando...
                            </span>
                        </div>

                        <!-- Filtros de Categorias (Pills horizontales) -->
                        <div id="sel-locat-categorias" class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                            <!-- Inyectado dinámicamente -->
                        </div>
                    </div>

                    <!-- Contenedor Grid de Cards -->
                    <div id="sel-locat-grid" class="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Inyectado dinámicamente -->
                    </div>

                    <!-- Paginación -->
                    <div class="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
                        <button type="button" id="sel-locat-prev" onclick="window.SelectorActividadLocatModal.cambiarPagina(_locatModalPagina - 1)" 
                                class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold transition disabled:opacity-40 disabled:cursor-not-allowed">
                            <i class="fas fa-chevron-left mr-1"></i> Anterior
                        </button>
                        <span id="sel-locat-pag-info" class="text-xs font-mono text-slate-400">
                            Página 1 de 1
                        </span>
                        <button type="button" id="sel-locat-next" onclick="window.SelectorActividadLocatModal.cambiarPagina(_locatModalPagina + 1)" 
                                class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold transition disabled:opacity-40 disabled:cursor-not-allowed">
                            Siguiente <i class="fas fa-chevron-right ml-1"></i>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(div);
        },

        renderizarCategorias: function() {
            const cont = document.getElementById('sel-locat-categorias');
            if (!cont) return;
            const cats = ['todas', ...global.CatalogoLocat.getCategorias()];
            cont.innerHTML = cats.map(cat => {
                const esActiva = _locatModalCategoria === cat;
                const label = cat === 'todas' ? 'Todas las Categorías' : cat;
                return `
                    <button type="button" onclick="window.SelectorActividadLocatModal.filtrarCategoria('${cat}')" 
                            class="px-3 py-1 rounded-xl text-[11px] whitespace-nowrap transition border ${esActiva ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 font-medium'}">
                        ${label}
                    </button>
                `;
            }).join('');
        },

        renderizar: function() {
            if (typeof document === 'undefined') return;
            const grid = document.getElementById('sel-locat-grid');
            const contador = document.getElementById('sel-locat-contador');
            const pagInfo = document.getElementById('sel-locat-pag-info');
            const btnPrev = document.getElementById('sel-locat-prev');
            const btnNext = document.getElementById('sel-locat-next');
            if (!grid) return;

            let list = global.CatalogoLocat.getAll();

            // Filtrar por categoria
            if (_locatModalCategoria && _locatModalCategoria !== 'todas') {
                list = list.filter(i => i.categoria === _locatModalCategoria);
            }

            // Filtrar por texto
            if (_locatModalQuery) {
                list = list.filter(a => {
                    const cod = String(a.codigo || '').toLowerCase();
                    const nom = String(a.nombre || '').toLowerCase();
                    const cat = String(a.categoria || '').toLowerCase();
                    return cod.includes(_locatModalQuery) || nom.includes(_locatModalQuery) || cat.includes(_locatModalQuery);
                });
            }

            const total = list.length;
            const totalPaginas = Math.ceil(total / _locatModalPorPagina) || 1;
            if (_locatModalPagina > totalPaginas) _locatModalPagina = totalPaginas;
            if (_locatModalPagina < 1) _locatModalPagina = 1;

            const inicio = (_locatModalPagina - 1) * _locatModalPorPagina;
            const fin = inicio + _locatModalPorPagina;
            const paginaItems = list.slice(inicio, fin);

            if (contador) contador.innerText = `${total} actividad(es)`;
            if (pagInfo) pagInfo.innerText = `Página ${_locatModalPagina} de ${totalPaginas}`;
            if (btnPrev) btnPrev.disabled = (_locatModalPagina <= 1);
            if (btnNext) btnNext.disabled = (_locatModalPagina >= totalPaginas);

            if (paginaItems.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full py-12 text-center text-slate-500">
                        <i class="fas fa-tags text-3xl mb-2 block"></i>
                        <p class="text-xs">No se encontraron actividades económicas con ese criterio.</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = paginaItems.map(a => `
                <div onclick="window.SelectorActividadLocatModal.seleccionar('${a.codigo}')" 
                     class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/40 transition cursor-pointer flex flex-col justify-between gap-3 group shadow-sm">
                    <div class="space-y-2">
                        <div class="flex items-center justify-between gap-2">
                            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-bold">
                                ${a.codigo}
                            </span>
                            <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 truncate max-w-[200px]" title="${a.categoria}">
                                ${a.categoria}
                            </span>
                        </div>
                        <h4 class="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition line-clamp-2 leading-snug">
                            ${a.nombre}
                        </h4>
                        <div class="flex items-center gap-2 pt-1">
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold">
                                <i class="fas fa-percentage text-[9px]"></i> ${(a.alicuota * 100).toFixed(2)}%
                            </span>
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[11px] font-bold">
                                <i class="fas fa-coins text-[9px]"></i> ${a.minimo_tcmmv.toFixed(2)} TCMMV
                            </span>
                        </div>
                    </div>
                    <div class="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                        <span class="text-[10px] text-slate-500">Mínimo tributable mensual</span>
                        <span class="text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition flex items-center gap-1">
                            Seleccionar <i class="fas fa-arrow-right text-[10px]"></i>
                        </span>
                    </div>
                </div>
            `).join('');
        }
    };

    global.SelectorActividadLocatModal = SelectorActividadLocatModal;

    // Auto-sembrado en HaciendaStore si ya esta inicializado y la tabla esta vacia
    const store = (typeof window !== 'undefined' && window.HaciendaStore) || global.HaciendaStore;
    if (store && typeof store.sembrarActividadesLocat === 'function') {
        store.sembrarActividadesLocat(CATALOGO);
    }
})(typeof window !== 'undefined' ? window : this);
