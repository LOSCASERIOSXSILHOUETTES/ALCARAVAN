/**
 * ALCARAVAN — Módulo de Gestión de Popups y Comunicados Oficiales (ERP)
 * Arquitectura SGB Silhouettes V3 (0ms Latencia, Offline-First, Supabase Bi-Sync)
 */
(function definePopupsModule(global) {
    "use strict";

    let popupEditandoId = null;

    const Popups = {
        render: function(container) {
            const store = global.HaciendaStore;
            const popups = store ? (store.get('hacienda_popups') || []) : [];

            container.innerHTML = `
                <div class="space-y-6 animate-fade-in">
                    <!-- Cabecera y Botón de Creación -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div>
                            <div class="inline-flex items-center gap-2 text-pink-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                                <i class="fas fa-bullhorn"></i>
                                <span>Comunicación Oficial · Portal Ciudadano</span>
                            </div>
                            <h2 class="text-xl font-bold text-slate-100">Gestión de Popups y Anuncios Emergentes</h2>
                            <p class="text-xs text-slate-400 mt-1">Configura los avisos, decretos y campañas que se desplegarán a los usuarios en el portal.</p>
                        </div>
                        <button onclick="window.PopupsModule.abrirModalNuevo()" 
                                class="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 shrink-0">
                            <i class="fas fa-plus"></i>
                            <span>Nuevo Popup Oficial</span>
                        </button>
                    </div>

                    <!-- Tabla de Popups -->
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div class="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                            <span>Total anuncios configurados: <strong>${popups.length}</strong></span>
                            <span>Sincronización en vivo: <strong class="text-emerald-400">Activa</strong></span>
                        </div>
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
                                                <button onclick="window.PopupsModule.toggleActivo('${p.id}')" 
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
                                                <button onclick="window.PopupsModule.abrirModalEditar('${p.id}')" 
                                                        class="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg transition" title="Editar">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button onclick="window.PopupsModule.eliminar('${p.id}')" 
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

                <!-- Modal Creación / Edición -->
                <div id="modal-popup-form" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in text-left">
                        <div class="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <i class="fas fa-bullhorn text-pink-400"></i>
                                <span id="modal-popup-titulo-cabecera">Nuevo Popup Oficial</span>
                            </h3>
                            <button onclick="window.PopupsModule.cerrarModal()" class="text-slate-400 hover:text-slate-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="form-popup" onsubmit="window.PopupsModule.guardar(event)" class="p-6 space-y-4 text-xs">
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
                                <button type="button" onclick="window.PopupsModule.cerrarModal()" 
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

        abrirModalNuevo: function() {
            popupEditandoId = null;
            document.getElementById('modal-popup-titulo-cabecera').innerText = 'Nuevo Popup Oficial';
            document.getElementById('form-popup').reset();
            document.getElementById('pop-activo').checked = true;
            document.getElementById('modal-popup-form').classList.remove('hidden');
        },

        abrirModalEditar: function(id) {
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

        cerrarModal: function() {
            document.getElementById('modal-popup-form').classList.add('hidden');
            popupEditandoId = null;
        },

        guardar: async function(e) {
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

                await store.set('hacienda_popups', registro);
                this.cerrarModal();

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: popupEditandoId ? 'Popup Actualizado' : 'Popup Creado',
                        text: 'El anuncio ha sido guardado y sincronizado en tiempo real.',
                        timer: 1600,
                        showConfirmButton: false
                    });
                }

                const container = document.getElementById('app-main-content');
                if (container) this.render(container);
            } catch (err) {
                alert('Error al guardar: ' + err.message);
            } finally {
                if (btn) { btn.disabled = false; btn.innerText = 'Guardar Popup'; }
            }
        },

        toggleActivo: async function(id) {
            const store = global.HaciendaStore;
            if (!store) return;

            const popups = store.get('hacienda_popups') || [];
            const p = popups.find(item => String(item.id) === String(id));
            if (!p) return;

            p.activo = !p.activo;
            p.updated_at = new Date().toISOString();
            await store.set('hacienda_popups', p);

            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        eliminar: async function(id) {
            if (typeof Swal !== 'undefined') {
                const conf = await Swal.fire({
                    title: '¿Eliminar popup?',
                    text: 'Esta acción no se puede deshacer.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#e11d48'
                });
                if (!conf.isConfirmed) return;
            }

            const store = global.HaciendaStore;
            if (store) {
                await store.remove('hacienda_popups', id);
                const container = document.getElementById('app-main-content');
                if (container) this.render(container);
            }
        }
    };

    global.PopupsModule = Popups;
})(typeof window !== 'undefined' ? window : this);
