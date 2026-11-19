/**
 * GUIRIRI SISTEMA HACIENDA V3 — Módulo de Contribuyentes (RUC)
 * Registro, perfiles y padrón tributario a 0ms.
 */
(function defineContribuyentesModule(global) {
    "use strict";

    const Contribuyentes = {
        render: function(container) {
            const contribuyentes = global.HaciendaStore ? global.HaciendaStore.get('hacienda_contribuyentes') : [];
            const isFuncionario = global.HaciendaAuth ? global.HaciendaAuth.isFuncionario() : true;

            container.innerHTML = `
                <div class="space-y-6">
                    <!-- Cabecera -->
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div>
                            <h2 class="text-xl font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-id-card text-sky-400"></i>
                                Padrón de Contribuyentes (RUC)
                            </h2>
                            <p class="text-xs text-slate-400 mt-1">
                                Registro Único de Contribuyentes, comercios y empresas del Municipio.
                            </p>
                        </div>
                        <button onclick="window.ContribuyentesModule.abrirModalRegistro()" class="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                            <i class="fas fa-plus"></i>
                            Nuevo Contribuyente
                        </button>
                    </div>

                    <!-- Buscador -->
                    <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                        <i class="fas fa-search text-slate-500"></i>
                        <input type="text" id="busqueda-contribuyente" oninput="window.ContribuyentesModule.filtrarTabla()" placeholder="Buscar por RIF, Razón Social o Denominación Comercial..." class="w-full bg-transparent text-slate-200 text-sm outline-none placeholder-slate-500">
                    </div>

                    <!-- Tabla de Contribuyentes -->
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                    <tr>
                                        <th class="py-3 px-4 font-bold">RIF</th>
                                        <th class="py-3 px-4 font-bold">Razón Social / Comercio</th>
                                        <th class="py-3 px-4 font-bold">Contacto</th>
                                        <th class="py-3 px-4 font-bold">Representante</th>
                                        <th class="py-3 px-4 font-bold">Estado</th>
                                        <th class="py-3 px-4 font-bold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="tabla-contribuyentes-body" class="divide-y divide-slate-800/60 font-medium">
                                    ${this.generarFilasTabla(contribuyentes)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Modal de Registro -->
                <div id="modal-registro-contribuyente" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                        <div class="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <i class="fas fa-user-plus text-sky-400"></i>
                                Registro de Contribuyente
                            </h3>
                            <button onclick="window.ContribuyentesModule.cerrarModalRegistro()" class="text-slate-400 hover:text-slate-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="form-contribuyente" onsubmit="window.ContribuyentesModule.guardar(event)" class="p-6 space-y-4">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">RIF (Ej: J-40862362-5)</label>
                                    <input type="text" id="c-rif" required placeholder="J-12345678-9" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500 uppercase">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Tipo de Persona</label>
                                    <select id="c-tipo" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                                        <option value="juridica">Persona Jurídica (Empresa/Comercio)</option>
                                        <option value="natural">Persona Natural (Firma Personal)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Razón Social</label>
                                <input type="text" id="c-razon" required placeholder="Nombre legal de la empresa" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Denominación Comercial (Nombre de Fantasía)</label>
                                <input type="text" id="c-fantasia" placeholder="Ej: Supermercado El Ahorro" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Correo Electrónico</label>
                                    <input type="email" id="c-correo" required placeholder="contacto@empresa.com" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Teléfono</label>
                                    <input type="tel" id="c-telefono" placeholder="0414-1234567" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Dirección Fiscal / Ubicación</label>
                                <textarea id="c-direccion" required rows="2" placeholder="Calle, local, punto de referencia en el municipio..." class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500"></textarea>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Representante Legal</label>
                                    <input type="text" id="c-rep-nombre" placeholder="Nombre y Apellido" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Cédula del Representante</label>
                                    <input type="text" id="c-rep-cedula" placeholder="V-12345678" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Foto del Local / Fachada Comercial</label>
                                <input type="file" id="c-foto" accept="image/*" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500">
                            </div>
                            <div class="pt-4 flex justify-end gap-3 border-t border-slate-800">
                                <button type="button" onclick="window.ContribuyentesModule.cerrarModalRegistro()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl">Cancelar</button>
                                <button type="submit" id="btn-guardar-contribuyente" class="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg">Registrar Contribuyente</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        },

        generarFilasTabla: function(lista) {
            if (!lista || lista.length === 0) {
                return `<tr><td colspan="6" class="py-8 text-center text-slate-500 italic">No hay contribuyentes registrados en el padrón municipal.</td></tr>`;
            }

            return lista.map(c => `
                <tr class="hover:bg-slate-800/40 transition">
                    <td class="py-3 px-4 font-mono font-bold text-sky-400">${c.rif || 'N/A'}</td>
                    <td class="py-3 px-4">
                        <div class="font-bold text-slate-200">${c.razon_social || ''}</div>
                        ${c.denominacion_comercial ? `<div class="text-[11px] text-slate-400">${c.denominacion_comercial}</div>` : ''}
                    </td>
                    <td class="py-3 px-4 text-slate-300">
                        <div>${c.correo || ''}</div>
                        <div class="text-[11px] text-slate-500">${c.telefono || ''}</div>
                    </td>
                    <td class="py-3 px-4 text-slate-300">
                        <div>${c.representante_legal || 'No asignado'}</div>
                        <div class="text-[11px] text-slate-500">${c.representante_cedula || ''}</div>
                    </td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${c.estado === 'activo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
                            ${(c.estado || 'activo').toUpperCase()}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-right space-x-2">
                        <button onclick="window.ContribuyentesModule.asignarPatenteRapida(${c.id})" class="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 rounded-lg text-[11px] font-semibold transition" title="Emitir Patente Comercial">
                            <i class="fas fa-certificate"></i> Patente
                        </button>
                    </td>
                </tr>
            `).join('');
        },

        filtrarTabla: function() {
            const query = (document.getElementById('busqueda-contribuyente')?.value || '').toLowerCase();
            const contribuyentes = global.HaciendaStore ? global.HaciendaStore.get('hacienda_contribuyentes') : [];
            const filtrados = contribuyentes.filter(c => 
                (c.rif && c.rif.toLowerCase().includes(query)) ||
                (c.razon_social && c.razon_social.toLowerCase().includes(query)) ||
                (c.denominacion_comercial && c.denominacion_comercial.toLowerCase().includes(query))
            );
            const tbody = document.getElementById('tabla-contribuyentes-body');
            if (tbody) tbody.innerHTML = this.generarFilasTabla(filtrados);
        },

        abrirModalRegistro: function() {
            document.getElementById('modal-registro-contribuyente')?.classList.remove('hidden');
        },

        cerrarModalRegistro: function() {
            document.getElementById('modal-registro-contribuyente')?.classList.add('hidden');
            document.getElementById('form-contribuyente')?.reset();
        },

        guardar: async function(e) {
            e.preventDefault();
            const btn = document.getElementById('btn-guardar-contribuyente');
            if (btn) { btn.disabled = true; btn.innerText = 'Guardando...'; }

            try {
                let fotoUrl = null;
                const fileInput = document.getElementById('c-foto');
                if (fileInput?.files?.length > 0 && global.HaciendaUploader) {
                    fotoUrl = await global.HaciendaUploader.subirAImgBB(fileInput.files[0]);
                }

                const nuevo = {
                    rif: document.getElementById('c-rif').value.trim().toUpperCase(),
                    tipo_persona: document.getElementById('c-tipo').value,
                    razon_social: document.getElementById('c-razon').value.trim(),
                    denominacion_comercial: document.getElementById('c-fantasia').value.trim(),
                    correo: document.getElementById('c-correo').value.trim(),
                    telefono: document.getElementById('c-telefono').value.trim(),
                    direccion_fiscal: document.getElementById('c-direccion').value.trim(),
                    representante_legal: document.getElementById('c-rep-nombre').value.trim(),
                    representante_cedula: document.getElementById('c-rep-cedula').value.trim(),
                    fotos_local: fotoUrl ? [fotoUrl] : [],
                    estado: 'activo'
                };

                await global.HaciendaStore.set('hacienda_contribuyentes', nuevo);
                this.cerrarModalRegistro();

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Contribuyente Registrado',
                        text: 'Registrado con éxito en el Padrón Municipal.',
                        confirmButtonColor: '#0284c7',
                        timer: 1800,
                        showConfirmButton: false
                    });
                }
            } catch (err) {
                alert('Error al registrar: ' + err.message);
            } finally {
                if (btn) { btn.disabled = false; btn.innerText = 'Registrar Contribuyente'; }
            }
        },

        asignarPatenteRapida: function(contribuyenteId) {
            if (global.App && global.App.switchTab) {
                global.App.switchTab('patentes');
                setTimeout(() => {
                    if (global.PatentesModule && global.PatentesModule.abrirModalPatente) {
                        global.PatentesModule.abrirModalPatente(contribuyenteId);
                    }
                }, 100);
            }
        }
    };

    global.ContribuyentesModule = Contribuyentes;
})(typeof window !== 'undefined' ? window : this);
