/**
 * ALCARAVAN — Módulo de Comunicación Oficial y Portada (ERP)
 * Gestión Unificada de Carrusel Hero (Slides) y Popups Emergentes
 * Arquitectura SGB Silhouettes V3 (0ms Latencia, Offline-First, Supabase Bi-Sync)
 */
(function defineComunicacionModule(global) {
    "use strict";

    let currentSubTab = 'carrusel'; // 'carrusel' | 'popups'
    let slideEditandoId = null;
    let popupEditandoId = null;

    const COLOR_PRESETS = {
        'emerald': {
            label: 'Esmeralda (LOCAT / Verde)',
            badge_bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
            gradient: 'from-emerald-950/80 via-neutral-900/90 to-[#0e0e11]'
        },
        'sky': {
            label: 'Zafiro / Sky (Tributos / Azul)',
            badge_bg: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
            gradient: 'from-sky-950/80 via-neutral-900/90 to-[#0e0e11]'
        },
        'amber': {
            label: 'Ámbar (Calendario / Naranja)',
            badge_bg: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
            gradient: 'from-amber-950/80 via-neutral-900/90 to-[#0e0e11]'
        },
        'indigo': {
            label: 'Índigo / Morado (Solvencias QR)',
            badge_bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
            gradient: 'from-indigo-950/80 via-neutral-900/90 to-[#0e0e11]'
        },
        'rose': {
            label: 'Rosa / Carmesí (Urgente / Decretos)',
            badge_bg: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
            gradient: 'from-rose-950/80 via-neutral-900/90 to-[#0e0e11]'
        }
    };

    const SLIDES_DEFAULT = [
        {
            id: 'slide_locat_2026',
            tag: 'LOCAT 2026 · VIGENTE',
            titulo: 'Armonización Tributaria en San José de Guaribe',
            descripcion: 'Adecuación integral de licencias de actividades económicas y tabulador nacional de alícuotas. Autoliquidación en línea con 0ms de latencia.',
            btn_texto: 'Consultar RIF',
            btn_icono: 'fa-arrow-right',
            btn_enlace: '#buscador-rif',
            badge_bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
            gradient: 'from-sky-950/80 via-neutral-900/90 to-[#0e0e11]',
            icon: 'fa-landmark',
            activo: true,
            orden: 1
        },
        {
            id: 'slide_calendario_fiscal',
            tag: 'CRONOGRAMA FISCAL',
            titulo: 'Declaración Mensual de Ingresos Brutos',
            descripcion: 'Declara tus ingresos del mes dentro de los primeros 15 días continuos. Cálculo automatizado según la Tasa de Mayor Valor (TCMMV) del Banco Central de Venezuela.',
            btn_texto: 'Ver Calendario Fiscal',
            btn_icono: 'fa-calendar-alt',
            btn_enlace: 'modal:cal_fiscal_2026',
            badge_bg: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
            gradient: 'from-amber-950/80 via-neutral-900/90 to-[#0e0e11]',
            icon: 'fa-calendar-check',
            activo: true,
            orden: 2
        },
        {
            id: 'slide_solvencias_qr',
            tag: 'SOLVENCIAS DIGITALES QR',
            titulo: 'Certificado de Solvencia Municipal Inmediato',
            descripcion: 'Emisión automática de solvencias comerciales con código QR de verificación fiscal. Descarga tu solvencia en formato oficial sin colas ni esperas.',
            btn_texto: 'Consultar Estatus',
            btn_icono: 'fa-qrcode',
            btn_enlace: '#buscador-rif',
            badge_bg: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
            gradient: 'from-indigo-950/80 via-neutral-900/90 to-[#0e0e11]',
            icon: 'fa-stamp',
            activo: true,
            orden: 3
        }
    ];

    const Comunicacion = {
        setSubTab: function(sub) {
            currentSubTab = sub;
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        render: function(container) {
            const store = global.HaciendaStore;
            const carruselSlides = store ? (store.get('hacienda_carrusel') || []) : [];
            const popups = store ? (store.get('hacienda_popups') || []) : [];

            container.innerHTML = `
                <div class="space-y-6 animate-fade-in text-left">
                    <!-- Cabecera Principal y Switcher de Subpestañas -->
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div>
                            <div class="inline-flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                                <i class="fas fa-bullhorn"></i>
                                <span>Comunicación Oficial & Contenidos de Portada</span>
                            </div>
                            <h2 class="text-xl font-bold text-slate-100">Administrador de Avisos, Carrusel y Popups</h2>
                            <p class="text-xs text-slate-400 mt-1">Configura las campañas del carrusel superior y los anuncios emergentes que verán los contribuyentes.</p>
                        </div>

                        <!-- Selector de Subpestañas -->
                        <div class="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
                            <button onclick="window.ComunicacionModule.setSubTab('carrusel')" 
                                    class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${currentSubTab === 'carrusel' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}">
                                <i class="fas fa-images"></i>
                                <span>Carrusel Hero (${carruselSlides.length})</span>
                            </button>
                            <button onclick="window.ComunicacionModule.setSubTab('popups')" 
                                    class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${currentSubTab === 'popups' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}">
                                <i class="fas fa-window-restore"></i>
                                <span>Popups Oficiales (${popups.length})</span>
                            </button>
                        </div>
                    </div>

                    <!-- Contenedor del Submódulo Activo -->
                    <div id="comunicacion-subtab-container">
                        ${currentSubTab === 'carrusel' ? this.renderVistaCarrusel(carruselSlides) : this.renderVistaPopups(popups)}
                    </div>
                </div>

                <!-- Modal de Slide de Carrusel -->
                ${this.renderModalSlide()}

                <!-- Modal de Popups Oficiales -->
                ${this.renderModalPopup()}
            `;
        },

        /* =========================================================================
           SUBMÓDULO: CARRUSEL HERO
           ========================================================================= */
        renderVistaCarrusel: function(slides) {
            return `
                <div class="space-y-4 animate-fade-in">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                        <div class="text-xs text-slate-400 font-mono">
                            <span>Slides configurados: <strong>${slides.length}</strong></span>
                            <span class="mx-2">·</span>
                            <span>Rotación automática en portal: <strong class="text-emerald-400">7 segundos</strong></span>
                        </div>
                        <div class="flex items-center gap-2">
                            ${slides.length === 0 ? `
                                <button onclick="window.ComunicacionModule.cargarDefaultsSlide()" 
                                        class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-amber-500/30 transition flex items-center gap-2">
                                    <i class="fas fa-cloud-download-alt"></i>
                                    <span>Cargar Slides Oficiales LOCAT</span>
                                </button>
                            ` : ''}
                            <button onclick="window.ComunicacionModule.abrirModalNuevoSlide()" 
                                    class="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                                <i class="fas fa-plus"></i>
                                <span>Nuevo Slide de Carrusel</span>
                            </button>
                        </div>
                    </div>

                    <!-- Tabla de Slides -->
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                    <tr>
                                        <th class="py-3 px-4 font-bold text-center">Orden</th>
                                        <th class="py-3 px-4 font-bold">Estado</th>
                                        <th class="py-3 px-4 font-bold">Badge & Título</th>
                                        <th class="py-3 px-4 font-bold">Descripción</th>
                                        <th class="py-3 px-4 font-bold">Botón / Acción</th>
                                        <th class="py-3 px-4 font-bold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/60 text-slate-300">
                                    ${slides.length === 0 ? `
                                        <tr>
                                            <td colspan="6" class="py-12 text-center text-slate-500 italic">
                                                No hay slides registrados en la base de datos. Haz clic en "Cargar Slides Oficiales LOCAT" o en "Nuevo Slide de Carrusel".
                                            </td>
                                        </tr>
                                    ` : slides.sort((a, b) => (a.orden || 0) - (b.orden || 0)).map(s => `
                                        <tr class="hover:bg-slate-800/30 transition">
                                            <td class="py-3 px-4 text-center font-mono font-bold text-slate-400">
                                                #${s.orden || 1}
                                            </td>
                                            <td class="py-3 px-4">
                                                <button onclick="window.ComunicacionModule.toggleActivoSlide('${s.id}')" 
                                                        class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition flex items-center gap-1.5 ${s.activo !== false ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}">
                                                    <span class="w-1.5 h-1.5 rounded-full ${s.activo !== false ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}"></span>
                                                    <span>${s.activo !== false ? 'ACTIVO' : 'PAUSADO'}</span>
                                                </button>
                                            </td>
                                            <td class="py-3 px-4 max-w-xs">
                                                <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase mb-1 border ${s.badge_bg || 'bg-sky-500/10 text-sky-400 border-sky-500/25'}">
                                                    <i class="fas ${s.icon || 'fa-landmark'} text-[9px]"></i>
                                                    <span>${s.tag || 'AVISO'}</span>
                                                </div>
                                                <div class="font-bold text-slate-100 text-sm truncate">${s.titulo || 'Sin título'}</div>
                                            </td>
                                            <td class="py-3 px-4 max-w-sm">
                                                <div class="text-[11px] text-slate-400 line-clamp-2">${s.descripcion || 'Sin descripción'}</div>
                                            </td>
                                            <td class="py-3 px-4 font-mono text-[11px]">
                                                <span class="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-sky-400 inline-flex items-center gap-1.5">
                                                    <i class="fas ${s.btn_icono || 'fa-arrow-right'} text-[10px]"></i>
                                                    <span>${s.btn_texto || 'Ver'}</span>
                                                </span>
                                                <div class="text-[10px] text-slate-500 truncate max-w-[140px] mt-0.5" title="${s.btn_enlace || ''}">
                                                    ${s.btn_enlace || '#'}
                                                </div>
                                            </td>
                                            <td class="py-3 px-4 text-right space-x-2">
                                                <button onclick="window.ComunicacionModule.abrirModalEditarSlide('${s.id}')" 
                                                        class="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg transition" title="Editar">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button onclick="window.ComunicacionModule.eliminarSlide('${s.id}')" 
                                                        class="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition" title="Eliminar">
                                                    <i class="fas fa-trash"></i>
                                                </button>
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

        renderModalSlide: function() {
            return `
                <div id="modal-slide-form" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in text-left">
                        <div class="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <i class="fas fa-images text-sky-400"></i>
                                <span id="modal-slide-titulo-cabecera">Nuevo Slide de Carrusel</span>
                            </h3>
                            <button onclick="window.ComunicacionModule.cerrarModalSlide()" class="text-slate-400 hover:text-slate-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="form-slide" onsubmit="window.ComunicacionModule.guardarSlide(event)" class="p-6 space-y-4 text-xs">
                            <div class="grid grid-cols-3 gap-3">
                                <div class="col-span-2">
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Badge Superior (Tag) *</label>
                                    <input type="text" id="slide-tag" required placeholder="Ej: LOCAT 2026 · VIGENTE" 
                                           class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-sky-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Ícono Badge</label>
                                    <select id="slide-icon" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-sky-500">
                                        <option value="fa-landmark">Alcaldía / LOCAT</option>
                                        <option value="fa-calendar-check">Calendario Fiscal</option>
                                        <option value="fa-stamp">Solvencias QR</option>
                                        <option value="fa-bullhorn">Comunicado Oficial</option>
                                        <option value="fa-file-invoice">Declaraciones</option>
                                        <option value="fa-chart-line">Recaudación</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Título Principal *</label>
                                <input type="text" id="slide-titulo" required placeholder="Ej: Armonización Tributaria en San José de Guaribe" 
                                       class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-sky-500">
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Descripción Breve *</label>
                                <textarea id="slide-descripcion" required rows="2" placeholder="Resumen del aviso o campaña para el contribuyente..." 
                                          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-sky-500"></textarea>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Tema Visual / Color</label>
                                    <select id="slide-color-preset" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-sky-500">
                                        <option value="emerald">Esmeralda (LOCAT / Verde)</option>
                                        <option value="sky">Zafiro / Sky (Tributos / Azul)</option>
                                        <option value="amber">Ámbar (Calendario / Naranja)</option>
                                        <option value="indigo">Índigo (Solvencias QR)</option>
                                        <option value="rose">Rosa (Urgente / Decretos)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Orden de Presentación</label>
                                    <input type="number" id="slide-orden" value="1" min="1" max="99" 
                                           class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-sky-500">
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Texto del Botón</label>
                                    <input type="text" id="slide-btn-texto" placeholder="Ej: Consultar RIF" 
                                           class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-sky-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Ícono del Botón</label>
                                    <select id="slide-btn-icono" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-sky-500">
                                        <option value="fa-arrow-right">Flecha Derecha</option>
                                        <option value="fa-calendar-alt">Calendario</option>
                                        <option value="fa-qrcode">Código QR</option>
                                        <option value="fa-file-pdf">Documento PDF</option>
                                        <option value="fa-external-link-alt">Enlace Web</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Enlace / Acción del Botón</label>
                                <input type="text" id="slide-btn-enlace" placeholder="#buscador-rif | modal:ord_locat | https://..." 
                                       class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-sky-500 font-mono">
                                <p class="text-[10px] text-slate-500 mt-1">Usa '#buscador-rif' para bajar al buscador, 'modal:id_ordenanza' para abrir gaceta, o una URL externa.</p>
                            </div>

                            <div class="flex items-center gap-2 pt-2">
                                <input type="checkbox" id="slide-activo" checked class="w-4 h-4 rounded text-sky-600 bg-slate-950 border-slate-800">
                                <label for="slide-activo" class="text-xs font-bold text-slate-300 cursor-pointer">Slide activo en el carrusel</label>
                            </div>

                            <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button type="button" onclick="window.ComunicacionModule.cerrarModalSlide()" 
                                        class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition">
                                    Cancelar
                                </button>
                                <button type="submit" id="btn-guardar-slide" 
                                        class="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition shadow-lg">
                                    Guardar Slide
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        },

        abrirModalNuevoSlide: function() {
            slideEditandoId = null;
            document.getElementById('modal-slide-titulo-cabecera').innerText = 'Nuevo Slide de Carrusel';
            document.getElementById('form-slide').reset();
            document.getElementById('slide-activo').checked = true;
            document.getElementById('slide-btn-texto').value = 'Consultar RIF';
            document.getElementById('slide-btn-enlace').value = '#buscador-rif';
            document.getElementById('modal-slide-form').classList.remove('hidden');
        },

        abrirModalEditarSlide: function(id) {
            const store = global.HaciendaStore;
            const slides = store ? (store.get('hacienda_carrusel') || []) : [];
            const s = slides.find(item => String(item.id) === String(id));
            if (!s) return;

            slideEditandoId = s.id;
            document.getElementById('modal-slide-titulo-cabecera').innerText = 'Editar Slide de Carrusel';
            document.getElementById('slide-tag').value = s.tag || '';
            document.getElementById('slide-titulo').value = s.titulo || '';
            document.getElementById('slide-descripcion').value = s.descripcion || '';
            document.getElementById('slide-icon').value = s.icon || 'fa-landmark';
            document.getElementById('slide-btn-texto').value = s.btn_texto || 'Consultar RIF';
            document.getElementById('slide-btn-icono').value = s.btn_icono || 'fa-arrow-right';
            document.getElementById('slide-btn-enlace').value = s.btn_enlace || '#buscador-rif';
            document.getElementById('slide-orden').value = s.orden || 1;
            document.getElementById('slide-activo').checked = s.activo !== false;

            // Determinar preset por badge_bg
            let preset = 'sky';
            for (const [key, val] of Object.entries(COLOR_PRESETS)) {
                if (s.badge_bg === val.badge_bg) { preset = key; break; }
            }
            document.getElementById('slide-color-preset').value = preset;

            document.getElementById('modal-slide-form').classList.remove('hidden');
        },

        cerrarModalSlide: function() {
            document.getElementById('modal-slide-form').classList.add('hidden');
            slideEditandoId = null;
        },

        guardarSlide: async function(e) {
            e.preventDefault();
            const store = global.HaciendaStore;
            if (!store) return;

            const btn = document.getElementById('btn-guardar-slide');
            if (btn) { btn.disabled = true; btn.innerText = 'Guardando...'; }

            try {
                const tag = document.getElementById('slide-tag').value.trim();
                const titulo = document.getElementById('slide-titulo').value.trim();
                const descripcion = document.getElementById('slide-descripcion').value.trim();
                const icon = document.getElementById('slide-icon').value;
                const presetKey = document.getElementById('slide-color-preset').value;
                const orden = parseInt(document.getElementById('slide-orden').value, 10) || 1;
                const btn_texto = document.getElementById('slide-btn-texto').value.trim();
                const btn_icono = document.getElementById('slide-btn-icono').value;
                const btn_enlace = document.getElementById('slide-btn-enlace').value.trim() || '#buscador-rif';
                const activo = document.getElementById('slide-activo').checked;

                const preset = COLOR_PRESETS[presetKey] || COLOR_PRESETS.sky;

                const registro = {
                    id: slideEditandoId || undefined,
                    tag: tag,
                    titulo: titulo,
                    descripcion: descripcion,
                    icon: icon,
                    badge_bg: preset.badge_bg,
                    gradient: preset.gradient,
                    orden: orden,
                    btn_texto: btn_texto,
                    btn_icono: btn_icono,
                    btn_enlace: btn_enlace,
                    activo: activo,
                    updated_at: new Date().toISOString()
                };

                if (!slideEditandoId) {
                    registro.id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'slide_' + Date.now();
                    registro.created_at = new Date().toISOString();
                    await store.insert('hacienda_carrusel', registro);
                } else {
                    await store.update('hacienda_carrusel', registro);
                }

                this.cerrarModalSlide();
                const container = document.getElementById('app-main-content');
                if (container) this.render(container);

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Slide Guardado',
                        text: 'El carrusel de la portada se actualizó a 0ms.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            } catch (err) {
                console.error("[Comunicación] Error guardando slide:", err);
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'error', title: 'Error al Guardar', text: err.message });
                }
            } finally {
                if (btn) { btn.disabled = false; btn.innerText = 'Guardar Slide'; }
            }
        },

        toggleActivoSlide: async function(id) {
            const store = global.HaciendaStore;
            if (!store) return;
            const slides = store.get('hacienda_carrusel') || [];
            const s = slides.find(item => String(item.id) === String(id));
            if (!s) return;

            s.activo = !(s.activo !== false);
            s.updated_at = new Date().toISOString();
            await store.update('hacienda_carrusel', s);

            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        eliminarSlide: async function(id) {
            const store = global.HaciendaStore;
            if (!store) return;

            const confirmar = confirm("¿Deseas eliminar este slide del carrusel de portada?");
            if (!confirmar) return;

            await store.remove('hacienda_carrusel', id);
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        cargarDefaultsSlide: async function() {
            const store = global.HaciendaStore;
            if (!store) return;

            for (const slide of SLIDES_DEFAULT) {
                const registro = {
                    ...slide,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                await store.insert('hacienda_carrusel', registro);
            }

            const container = document.getElementById('app-main-content');
            if (container) this.render(container);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Slides Cargados',
                    text: 'Se sembraron los 3 slides oficiales de la LOCAT 2026.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        },

        /* =========================================================================
           SUBMÓDULO: POPUPS Y COMUNICADOS EMERGENTES
           ========================================================================= */
        renderVistaPopups: function(popups) {
            return `
                <div class="space-y-4 animate-fade-in">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                        <div class="text-xs text-slate-400 font-mono">
                            <span>Popups registrados: <strong>${popups.length}</strong></span>
                            <span class="mx-2">·</span>
                            <span>Modal emergente en portal: <strong class="text-pink-400">Activo</strong></span>
                        </div>
                        <button onclick="window.ComunicacionModule.abrirModalNuevoPopup()" 
                                class="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                            <i class="fas fa-plus"></i>
                            <span>Nuevo Popup Oficial</span>
                        </button>
                    </div>

                    <!-- Tabla de Popups -->
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                    <tr>
                                        <th class="py-3 px-4 font-bold">Estado</th>
                                        <th class="py-3 px-4 font-bold">Título / Mensaje</th>
                                        <th class="py-3 px-4 font-bold">Tipo & Destino</th>
                                        <th class="py-3 px-4 font-bold">Imagen / Enlace</th>
                                        <th class="py-3 px-4 font-bold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/60 text-slate-300">
                                    ${popups.length === 0 ? `
                                        <tr>
                                            <td colspan="5" class="py-12 text-center text-slate-500 italic">
                                                No hay popups registrados. Haz clic en "Nuevo Popup Oficial" para crear el primero.
                                            </td>
                                        </tr>
                                    ` : popups.map(p => `
                                        <tr class="hover:bg-slate-800/30 transition">
                                            <td class="py-3 px-4">
                                                <button onclick="window.ComunicacionModule.toggleActivoPopup('${p.id}')" 
                                                        class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition flex items-center gap-1.5 ${p.activo ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}">
                                                    <span class="w-1.5 h-1.5 rounded-full ${p.activo ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}"></span>
                                                    <span>${p.activo ? 'ACTIVO' : 'PAUSADO'}</span>
                                                </button>
                                            </td>
                                            <td class="py-3 px-4 max-w-xs">
                                                <div class="font-bold text-slate-100 text-sm truncate">${p.titulo || 'Sin título'}</div>
                                                <div class="text-[11px] text-slate-400 line-clamp-1">${p.mensaje || 'Sin texto descriptivo'}</div>
                                            </td>
                                            <td class="py-3 px-4 font-mono text-[11px]">
                                                <span class="px-2 py-0.5 rounded bg-slate-800 text-sky-400 uppercase font-semibold">${p.tipo || 'mixto'}</span>
                                                <span class="text-slate-500 ml-1">· ${p.destino || 'portal'}</span>
                                            </td>
                                            <td class="py-3 px-4 text-slate-400">
                                                <div class="flex items-center gap-2">
                                                    ${p.imagen_url ? `
                                                        <a href="${p.imagen_url}" target="_blank" class="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 shrink-0 block">
                                                            <img src="${p.imagen_url}" class="w-full h-full object-cover">
                                                        </a>
                                                    ` : `<span class="text-[10px] font-mono text-slate-600">Sin imagen</span>`}
                                                    ${p.enlace_url ? `
                                                        <a href="${p.enlace_url}" target="_blank" class="text-sky-400 hover:underline text-[11px] font-mono truncate max-w-[120px]" title="${p.enlace_url}">
                                                            <i class="fas fa-link text-[10px]"></i> Link
                                                        </a>
                                                    ` : ''}
                                                </div>
                                            </td>
                                            <td class="py-3 px-4 text-right space-x-2">
                                                <button onclick="window.ComunicacionModule.abrirModalEditarPopup('${p.id}')" 
                                                        class="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg transition" title="Editar">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button onclick="window.ComunicacionModule.eliminarPopup('${p.id}')" 
                                                        class="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition" title="Eliminar">
                                                    <i class="fas fa-trash"></i>
                                                </button>
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

        renderModalPopup: function() {
            return `
                <div id="modal-popup-form" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in text-left">
                        <div class="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <i class="fas fa-bullhorn text-pink-400"></i>
                                <span id="modal-popup-titulo-cabecera">Nuevo Popup Oficial</span>
                            </h3>
                            <button onclick="window.ComunicacionModule.cerrarModalPopup()" class="text-slate-400 hover:text-slate-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="form-popup" onsubmit="window.ComunicacionModule.guardarPopup(event)" class="p-6 space-y-4 text-xs">
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Título del Anuncio *</label>
                                <input type="text" id="pop-titulo" required placeholder="Ej: Jornada Especial de Adecuación LOCAT 2026" 
                                       class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-pink-500">
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Mensaje o Contenido Explicativo *</label>
                                <textarea id="pop-mensaje" required rows="3" placeholder="Redacta el texto del comunicado para los comerciantes..." 
                                          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-pink-500"></textarea>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Tipo de Formato</label>
                                    <select id="pop-tipo" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-pink-500">
                                        <option value="mixto">Mixto (Texto con Botón de Acción)</option>
                                        <option value="imagen">Solo Imagen / Volante</option>
                                        <option value="texto">Solo Texto / Notificación</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Destino</label>
                                    <select id="pop-destino" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-pink-500">
                                        <option value="portal">Portal del Comercio (Público)</option>
                                        <option value="admin">Panel ERP (Funcionarios)</option>
                                        <option value="ambos">Ambos</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">URL de Imagen / Volante (Opcional)</label>
                                <input type="url" id="pop-imagen" placeholder="https://ejemplo.com/volante.jpg" 
                                       class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-pink-500">
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Enlace de Acción / Redirección (Opcional)</label>
                                <input type="text" id="pop-enlace" placeholder="#seccion-ordenanzas o https://..." 
                                       class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-pink-500">
                            </div>

                            <div class="flex items-center gap-2 pt-2">
                                <input type="checkbox" id="pop-activo" checked class="w-4 h-4 rounded text-pink-600 bg-slate-950 border-slate-800">
                                <label for="pop-activo" class="text-xs font-bold text-slate-300 cursor-pointer">Activar inmediatamente al guardar</label>
                            </div>

                            <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button type="button" onclick="window.ComunicacionModule.cerrarModalPopup()" 
                                        class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition">
                                    Cancelar
                                </button>
                                <button type="submit" id="btn-guardar-popup" 
                                        class="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition shadow-lg">
                                    Guardar Popup
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        },

        abrirModalNuevoPopup: function() {
            popupEditandoId = null;
            document.getElementById('modal-popup-titulo-cabecera').innerText = 'Nuevo Popup Oficial';
            document.getElementById('form-popup').reset();
            document.getElementById('pop-activo').checked = true;
            document.getElementById('modal-popup-form').classList.remove('hidden');
        },

        abrirModalEditarPopup: function(id) {
            const store = global.HaciendaStore;
            const popups = store ? (store.get('hacienda_popups') || []) : [];
            const p = popups.find(item => String(item.id) === String(id));
            if (!p) return;

            popupEditandoId = p.id;
            document.getElementById('modal-popup-titulo-cabecera').innerText = 'Editar Popup Oficial';
            document.getElementById('pop-titulo').value = p.titulo || '';
            document.getElementById('pop-mensaje').value = p.mensaje || '';
            document.getElementById('pop-tipo').value = p.tipo || 'mixto';
            document.getElementById('pop-destino').value = p.destino || 'portal';
            document.getElementById('pop-imagen').value = p.imagen_url || '';
            document.getElementById('pop-enlace').value = p.enlace_url || '';
            document.getElementById('pop-activo').checked = p.activo !== false;

            document.getElementById('modal-popup-form').classList.remove('hidden');
        },

        cerrarModalPopup: function() {
            document.getElementById('modal-popup-form').classList.add('hidden');
            popupEditandoId = null;
        },

        guardarPopup: async function(e) {
            e.preventDefault();
            const store = global.HaciendaStore;
            if (!store) return;

            const btn = document.getElementById('btn-guardar-popup');
            if (btn) { btn.disabled = true; btn.innerText = 'Guardando...'; }

            try {
                const titulo = document.getElementById('pop-titulo').value.trim();
                const mensaje = document.getElementById('pop-mensaje').value.trim();
                const tipo = document.getElementById('pop-tipo').value;
                const destino = document.getElementById('pop-destino').value;
                const imagen = document.getElementById('pop-imagen').value.trim();
                const enlace = document.getElementById('pop-enlace').value.trim();
                const activo = document.getElementById('pop-activo').checked;

                const registro = {
                    id: popupEditandoId || undefined,
                    titulo: titulo,
                    mensaje: mensaje,
                    tipo: tipo,
                    destino: destino,
                    imagen_url: imagen,
                    enlace_url: enlace,
                    activo: activo,
                    updated_at: new Date().toISOString()
                };

                if (!popupEditandoId) {
                    registro.id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'pop_' + Date.now();
                    registro.created_at = new Date().toISOString();
                    await store.insert('hacienda_popups', registro);
                } else {
                    await store.update('hacienda_popups', registro);
                }

                this.cerrarModalPopup();
                const container = document.getElementById('app-main-content');
                if (container) this.render(container);

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Popup Guardado',
                        text: 'El anuncio se actualizó en vivo con 0ms de latencia.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            } catch (err) {
                console.error("[Comunicación] Error guardando popup:", err);
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'error', title: 'Error al Guardar', text: err.message });
                }
            } finally {
                if (btn) { btn.disabled = false; btn.innerText = 'Guardar Popup'; }
            }
        },

        toggleActivoPopup: async function(id) {
            const store = global.HaciendaStore;
            if (!store) return;
            const popups = store.get('hacienda_popups') || [];
            const p = popups.find(item => String(item.id) === String(id));
            if (!p) return;

            p.activo = !p.activo;
            p.updated_at = new Date().toISOString();
            await store.update('hacienda_popups', p);

            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        eliminarPopup: async function(id) {
            const store = global.HaciendaStore;
            if (!store) return;

            const confirmar = confirm("¿Deseas eliminar este comunicado oficial?");
            if (!confirmar) return;

            await store.remove('hacienda_popups', id);
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        // Aliases para retrocompatibilidad con llamadas a PopupsModule
        abrirModalNuevo: function() { this.abrirModalNuevoPopup(); },
        abrirModalEditar: function(id) { this.abrirModalEditarPopup(id); },
        cerrarModal: function() { this.cerrarModalPopup(); },
        guardar: function(e) { return this.guardarPopup(e); },
        toggleActivo: function(id) { return this.toggleActivoPopup(id); },
        eliminar: function(id) { return this.eliminarPopup(id); }
    };

    global.ComunicacionModule = Comunicacion;
    global.PopupsModule = Comunicacion;

})(typeof window !== 'undefined' ? window : this);
