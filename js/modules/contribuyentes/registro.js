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
                                    <label class="block text-xs font-bold text-slate-400 mb-1">RIF Fiscal</label>
                                    <div class="grid grid-cols-3 gap-2">
                                        <select id="c-rif-tipo" class="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                                            <option value="J">J (Jurídico)</option>
                                            <option value="V">V (Natural)</option>
                                            <option value="G">G (Gobierno)</option>
                                            <option value="E">E (Extranjero)</option>
                                            <option value="C">C (Comuna)</option>
                                            <option value="P">P (Pasaporte)</option>
                                        </select>
                                        <input type="text" id="c-rif-numero" required placeholder="Solo números (ej: 123456789)" 
                                               inputmode="numeric" pattern="[0-9]*" maxlength="10"
                                               oninput="if(window.HaciendaRIF) window.HaciendaRIF.handleInput(this, 'c-rif-tipo')"
                                               class="col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono outline-none focus:border-sky-500">
                                    </div>
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
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Teléfono (Solo Números)</label>
                                    <input type="tel" id="c-telefono" placeholder="Solo números (ej: 04141234567)" 
                                           inputmode="numeric" pattern="[0-9]*" maxlength="11"
                                           oninput="if(window.HaciendaTelefono) window.HaciendaTelefono.handleInput(this); else this.value=this.value.replace(/\D/g, '')"
                                           class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono outline-none focus:border-sky-500">
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
                                    <div class="grid grid-cols-3 gap-2">
                                        <select id="c-rep-cedula-tipo" class="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                                            <option value="V">V (Venezolano)</option>
                                            <option value="E">E (Extranjero)</option>
                                            <option value="P">P (Pasaporte)</option>
                                        </select>
                                        <input type="text" id="c-rep-cedula-numero" placeholder="Solo números (ej: 12345678)" 
                                               inputmode="numeric" pattern="[0-9]*" maxlength="9"
                                               oninput="if(window.HaciendaCedula) window.HaciendaCedula.handleInput(this, 'c-rep-cedula-tipo')"
                                               class="col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono outline-none focus:border-sky-500">
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Foto del Local / Fachada Comercial</label>
                                <input type="file" id="c-foto" accept="image/*" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Contraseña para Portal del Contribuyente (Opcional)</label>
                                <div class="relative">
                                    <input type="text" id="c-clave" placeholder="Si se deja vacía, el comerciante la crea en su primer ingreso" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono outline-none focus:border-sky-500 pr-20">
                                    <button type="button" onclick="document.getElementById('c-clave').value = 'Guaribe' + Math.floor(1000 + Math.random() * 9000) + '!'" class="absolute right-2 top-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-sky-400 font-bold rounded-lg transition">
                                        Generar
                                    </button>
                                </div>
                            </div>
                            <div class="pt-4 flex justify-end gap-3 border-t border-slate-800">
                                <button type="button" onclick="window.ContribuyentesModule.cerrarModalRegistro()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl">Cancelar</button>
                                <button type="submit" id="btn-guardar-contribuyente" class="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg">Registrar Contribuyente</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Modal de Edición de Contribuyente -->
                <div id="modal-editar-contribuyente" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                        <div class="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <i class="fas fa-edit text-sky-400"></i>
                                Modificar Datos del Contribuyente
                            </h3>
                            <button onclick="window.ContribuyentesModule.cerrarModalEditar()" class="text-slate-400 hover:text-slate-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="form-editar-contribuyente" onsubmit="window.ContribuyentesModule.guardarEdicion(event)" class="p-6 space-y-4">
                            <input type="hidden" id="edit-c-id">

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">RIF Fiscal</label>
                                    <div class="grid grid-cols-3 gap-2">
                                        <select id="edit-c-rif-tipo" class="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                                            <option value="J">J (Jurídico)</option>
                                            <option value="V">V (Natural)</option>
                                            <option value="G">G (Gobierno)</option>
                                            <option value="E">E (Extranjero)</option>
                                            <option value="C">C (Comuna)</option>
                                            <option value="P">P (Pasaporte)</option>
                                        </select>
                                        <input type="text" id="edit-c-rif-numero" required placeholder="Solo números" 
                                               inputmode="numeric" pattern="[0-9]*" maxlength="10"
                                               oninput="if(window.HaciendaRIF) window.HaciendaRIF.handleInput(this, 'edit-c-rif-tipo')"
                                               class="col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono outline-none focus:border-sky-500">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Tipo de Persona</label>
                                    <select id="edit-c-tipo" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                                        <option value="juridica">Persona Jurídica (Empresa/Comercio)</option>
                                        <option value="natural">Persona Natural (Firma Personal)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Razón Social</label>
                                <input type="text" id="edit-c-razon" required placeholder="Nombre legal de la empresa" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Denominación Comercial (Nombre de Fantasía)</label>
                                <input type="text" id="edit-c-fantasia" placeholder="Ej: Supermercado El Ahorro" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Correo Electrónico</label>
                                    <input type="email" id="edit-c-correo" required placeholder="contacto@empresa.com" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Teléfono (Solo Números)</label>
                                    <input type="tel" id="edit-c-telefono" placeholder="Solo números (ej: 04141234567)" 
                                           inputmode="numeric" pattern="[0-9]*" maxlength="11"
                                           oninput="if(window.HaciendaTelefono) window.HaciendaTelefono.handleInput(this); else this.value=this.value.replace(/\D/g, '')"
                                           class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono outline-none focus:border-sky-500">
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Dirección Fiscal / Ubicación</label>
                                <textarea id="edit-c-direccion" required rows="2" placeholder="Calle, local, punto de referencia en el municipio..." class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500"></textarea>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Representante Legal</label>
                                    <input type="text" id="edit-c-rep-nombre" placeholder="Nombre y Apellido" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Cédula del Representante</label>
                                    <div class="grid grid-cols-3 gap-2">
                                        <select id="edit-c-rep-cedula-tipo" class="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                                            <option value="V">V (Venezolano)</option>
                                            <option value="E">E (Extranjero)</option>
                                            <option value="P">P (Pasaporte)</option>
                                        </select>
                                        <input type="text" id="edit-c-rep-cedula-numero" placeholder="Solo números (ej: 12345678)" 
                                               inputmode="numeric" pattern="[0-9]*" maxlength="9"
                                               oninput="if(window.HaciendaCedula) window.HaciendaCedula.handleInput(this, 'edit-c-rep-cedula-tipo')"
                                               class="col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono outline-none focus:border-sky-500">
                                    </div>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Estado en Padrón</label>
                                    <select id="edit-c-estado" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                                        <option value="activo">Activo</option>
                                        <option value="en_revision">En Revisión</option>
                                        <option value="bloqueado">Bloqueado</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Actualizar Foto del Local (Opcional)</label>
                                    <input type="file" id="edit-c-foto" accept="image/*" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500">
                                </div>
                            </div>
                            <div class="pt-4 flex justify-end gap-3 border-t border-slate-800">
                                <button type="button" onclick="window.ContribuyentesModule.cerrarModalEditar()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl">Cancelar</button>
                                <button type="submit" id="btn-actualizar-contribuyente" class="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg">Guardar Cambios</button>
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
                        <div class="flex items-center gap-1.5">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${c.estado === 'activo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
                                ${(c.estado || 'activo').toUpperCase()}
                            </span>
                            ${c.clave 
                                ? `<span title="Clave configurada" class="text-emerald-400 text-xs"><i class="fas fa-key"></i></span>` 
                                : `<span title="Sin clave establecida" class="text-slate-600 text-xs"><i class="fas fa-key"></i></span>`}
                        </div>
                    </td>
                    <td class="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button onclick="window.ContribuyentesModule.abrirModalEditar('${c.id}')" class="px-2.5 py-1 bg-sky-600/20 hover:bg-sky-600/40 text-sky-400 border border-sky-500/30 rounded-lg text-[11px] font-semibold transition" title="Modificar Datos del Contribuyente">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button onclick="window.ContribuyentesModule.asignarPatenteRapida('${c.id}')" class="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 rounded-lg text-[11px] font-semibold transition" title="Emitir Patente Comercial">
                            <i class="fas fa-certificate"></i> Patente
                        </button>
                        <button onclick="window.ContribuyentesModule.asignarClaveContribuyente('${c.id}')" class="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-semibold transition" title="Asignar o Cambiar Contraseña del Contribuyente">
                            <i class="fas fa-key"></i> Clave
                        </button>
                    </td>
                </tr>
            `).join('');
        },

        filtrarTabla: function() {
            const rawQuery = (document.getElementById('busqueda-contribuyente')?.value || '').toLowerCase().trim();
            const queryDigits = rawQuery.replace(/\D/g, '');
            const contribuyentes = global.HaciendaStore ? global.HaciendaStore.get('hacienda_contribuyentes') : [];
            const filtrados = contribuyentes.filter(c => {
                if (!c) return false;
                const cRif = (c.rif || '').toLowerCase();
                const cDigits = cRif.replace(/\D/g, '');
                const cRazon = (c.razon_social || '').toLowerCase();
                const cFantasia = (c.denominacion_comercial || '').toLowerCase();

                const matchRif = cRif.includes(rawQuery) || (queryDigits && cDigits.includes(queryDigits));
                const matchTexto = cRazon.includes(rawQuery) || cFantasia.includes(rawQuery);
                return matchRif || matchTexto;
            });
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

                const tipoRif = document.getElementById('c-rif-tipo')?.value || 'J';
                const numRif = document.getElementById('c-rif-numero')?.value || '';
                const rifHelper = global.HaciendaRIF;
                const parsedRif = rifHelper ? rifHelper.parse((tipoRif ? (tipoRif + '-') : '') + numRif) : { tipo: tipoRif, numero: numRif.replace(/\D/g, ''), full: tipoRif + '-' + numRif.replace(/\D/g, '') };

                if (!parsedRif.numero) {
                    throw new Error('El número de RIF es obligatorio y solo debe contener dígitos numéricos.');
                }

                // Sanitizar Teléfono a solo números
                const rawTel = document.getElementById('c-telefono')?.value || '';
                const telSanitizado = (global.HaciendaTelefono ? global.HaciendaTelefono.sanitizar(rawTel) : rawTel.replace(/\D/g, '')).trim();

                // Normalizar Cédula del Representante (Tipo + Solo Números)
                const tipoCed = document.getElementById('c-rep-cedula-tipo')?.value || 'V';
                const numCed = document.getElementById('c-rep-cedula-numero')?.value || '';
                const cedHelper = global.HaciendaCedula;
                const parsedCedula = cedHelper 
                    ? cedHelper.parse((tipoCed ? (tipoCed + '-') : '') + numCed) 
                    : { tipo: tipoCed, numero: numCed.replace(/\D/g, ''), full: numCed ? (tipoCed + '-' + numCed.replace(/\D/g, '')) : '' };

                const rawClave = (document.getElementById('c-clave')?.value || '').trim();
                let hashClave = null;
                if (rawClave) {
                    if (rawClave.length < 6) {
                        throw new Error('La contraseña debe tener al menos 6 caracteres.');
                    }
                    if (global.HaciendaAuth && typeof global.HaciendaAuth.hashPassword === 'function') {
                        hashClave = await global.HaciendaAuth.hashPassword(rawClave);
                    } else {
                        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawClave));
                        hashClave = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
                    }
                }

                const nuevo = {
                    rif: parsedRif.full,
                    tipo_persona: document.getElementById('c-tipo').value,
                    razon_social: document.getElementById('c-razon').value.trim(),
                    denominacion_comercial: document.getElementById('c-fantasia').value.trim(),
                    correo: document.getElementById('c-correo').value.trim(),
                    telefono: telSanitizado,
                    direccion_fiscal: document.getElementById('c-direccion').value.trim(),
                    representante_legal: document.getElementById('c-rep-nombre').value.trim(),
                    representante_cedula: parsedCedula.full,
                    fotos_local: fotoUrl ? [fotoUrl] : [],
                    clave: hashClave,
                    estado: 'activo'
                };

                await global.HaciendaStore.set('hacienda_contribuyentes', nuevo);
                this.cerrarModalRegistro();

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Contribuyente Registrado',
                        html: rawClave ? `
                            <div class="text-xs space-y-2 text-slate-300">
                                <p>Registrado con éxito en el Padrón Municipal.</p>
                                <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-sky-400 font-mono font-bold select-all">
                                    Clave asignada: ${rawClave}
                                </div>
                            </div>
                        ` : 'Registrado con éxito en el Padrón Municipal.',
                        confirmButtonColor: '#0284c7'
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
        },

        asignarClaveContribuyente: async function(id) {
            const store = global.HaciendaStore;
            if (!store) return;
            const contribuyentes = store.get('hacienda_contribuyentes') || [];
            const c = contribuyentes.find(item => String(item.id) === String(id));
            if (!c) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'error', title: 'No encontrado', text: 'Contribuyente no encontrado en el padrón.', confirmButtonColor: '#0284c7' });
                return;
            }

            const estadoClave = c.clave 
                ? '<span class="text-emerald-400 font-semibold">Configurada</span>' 
                : '<span class="text-amber-400 font-semibold">Sin clave (Pendiente de primer ingreso)</span>';

            const claveSugerida = 'Guaribe' + Math.floor(1000 + Math.random() * 9000) + '!';

            if (typeof Swal === 'undefined') {
                const manual = prompt(`Asignar contraseña a ${c.razon_social} (${c.rif}):`, claveSugerida);
                if (!manual || manual.length < 6) return;
                let hash = null;
                if (global.HaciendaAuth && typeof global.HaciendaAuth.hashPassword === 'function') {
                    hash = await global.HaciendaAuth.hashPassword(manual.trim());
                } else {
                    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(manual.trim()));
                    hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
                }
                c.clave = hash;
                c.updated_at = new Date().toISOString();
                await store.set('hacienda_contribuyentes', c);
                alert('Contraseña actualizada con éxito: ' + manual.trim());
                this.filtrarTabla();
                return;
            }

            const { value: formValues } = await Swal.fire({
                title: 'Seguridad del Contribuyente',
                html: `
                    <div class="text-left text-xs space-y-3 p-1">
                        <div class="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
                            <div class="font-bold text-slate-100">${c.razon_social}</div>
                            <div class="text-slate-400 font-mono text-[11px]">${c.rif} · Rep: ${c.representante_legal || 'N/A'}</div>
                            <div class="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">Estado actual: ${estadoClave}</div>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-300 mb-1">Nueva Contraseña de Acceso:</label>
                            <div class="relative">
                                <input id="swal-nueva-clave" type="text" class="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-sky-500 pr-20" value="${claveSugerida}">
                                <button type="button" onclick="document.getElementById('swal-nueva-clave').value = 'Guaribe' + Math.floor(1000 + Math.random() * 9000) + '!'" class="absolute right-2 top-1.5 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] text-sky-400 font-bold rounded-lg transition">
                                    Generar
                                </button>
                            </div>
                        </div>

                        <div class="text-[11px] text-slate-400 italic">
                            Nota: Esta clave le permitirá al comercio iniciar sesión en el portal municipal para autoliquidar patentes y emitir solvencias.
                        </div>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Guardar Contraseña',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#0284c7',
                cancelButtonColor: '#475569',
                preConfirm: () => {
                    const pass = document.getElementById('swal-nueva-clave')?.value.trim();
                    if (!pass || pass.length < 6) {
                        Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres.');
                        return false;
                    }
                    return pass;
                }
            });

            if (formValues) {
                let hash = null;
                if (global.HaciendaAuth && typeof global.HaciendaAuth.hashPassword === 'function') {
                    hash = await global.HaciendaAuth.hashPassword(formValues);
                } else {
                    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(formValues));
                    hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
                }

                c.clave = hash;
                c.updated_at = new Date().toISOString();
                await store.set('hacienda_contribuyentes', c);

                this.filtrarTabla();

                Swal.fire({
                    icon: 'success',
                    title: 'Contraseña Asignada',
                    html: `
                        <div class="text-xs space-y-2 text-slate-300">
                            <p>Se actualizó la contraseña para <strong>${c.razon_social}</strong>.</p>
                            <div class="bg-slate-900 border border-slate-800 p-3 rounded-xl font-mono text-sm text-sky-400 select-all font-bold">
                                ${formValues}
                            </div>
                            <p class="text-[11px] text-slate-400">Entregue o comunique esta contraseña al representante legal del comercio.</p>
                        </div>
                    `,
                    confirmButtonColor: '#0284c7',
                    confirmButtonText: 'Listo'
                });
            }
        },

        abrirModalEditar: function(id) {
            if (global.HaciendaAuth && !global.HaciendaAuth.hasPermission('contribuyentes_editar')) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Acceso Denegado',
                        text: 'Su usuario no posee el permiso "contribuyentes_editar" para modificar datos del contribuyente.',
                        confirmButtonColor: '#0284c7'
                    });
                } else {
                    alert('Acceso Denegado: Su usuario no posee el permiso "contribuyentes_editar".');
                }
                return;
            }

            const store = global.HaciendaStore;
            if (!store) return;
            const contribuyentes = store.get('hacienda_contribuyentes') || [];
            const c = contribuyentes.find(item => String(item.id) === String(id));
            if (!c) return;

            document.getElementById('edit-c-id').value = c.id;

            const rifHelper = global.HaciendaRIF;
            const parsedRif = rifHelper ? rifHelper.parse(c.rif || '') : { tipo: 'J', numero: String(c.rif || '').replace(/\D/g, '') };
            document.getElementById('edit-c-rif-tipo').value = parsedRif.tipo || 'J';
            document.getElementById('edit-c-rif-numero').value = parsedRif.numero || '';

            document.getElementById('edit-c-tipo').value = c.tipo_persona || 'juridica';
            document.getElementById('edit-c-razon').value = c.razon_social || '';
            document.getElementById('edit-c-fantasia').value = c.denominacion_comercial || '';
            document.getElementById('edit-c-correo').value = c.correo || '';
            document.getElementById('edit-c-telefono').value = c.telefono || '';
            document.getElementById('edit-c-direccion').value = c.direccion_fiscal || '';
            document.getElementById('edit-c-rep-nombre').value = c.representante_legal || '';

            const cedHelper = global.HaciendaCedula;
            const parsedCed = cedHelper ? cedHelper.parse(c.representante_cedula || '') : { tipo: 'V', numero: String(c.representante_cedula || '').replace(/\D/g, '') };
            document.getElementById('edit-c-rep-cedula-tipo').value = parsedCed.tipo || 'V';
            document.getElementById('edit-c-rep-cedula-numero').value = parsedCed.numero || '';

            document.getElementById('edit-c-estado').value = c.estado || 'activo';

            document.getElementById('modal-editar-contribuyente')?.classList.remove('hidden');
        },

        cerrarModalEditar: function() {
            document.getElementById('modal-editar-contribuyente')?.classList.add('hidden');
            document.getElementById('form-editar-contribuyente')?.reset();
        },

        guardarEdicion: async function(e) {
            e.preventDefault();
            if (global.HaciendaAuth && !global.HaciendaAuth.hasPermission('contribuyentes_editar')) {
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'error', title: 'Acceso Denegado', text: 'Permiso insuficiente para modificar contribuyentes.', confirmButtonColor: '#0284c7' });
                return;
            }

            const btn = document.getElementById('btn-actualizar-contribuyente');
            if (btn) { btn.disabled = true; btn.innerText = 'Actualizando...'; }

            try {
                const store = global.HaciendaStore;
                if (!store) return;
                const id = document.getElementById('edit-c-id').value;
                const contribuyentes = store.get('hacienda_contribuyentes') || [];
                const c = contribuyentes.find(item => String(item.id) === String(id));
                if (!c) throw new Error('Contribuyente no encontrado en el padrón.');

                let fotoUrl = null;
                const fileInput = document.getElementById('edit-c-foto');
                if (fileInput?.files?.length > 0 && global.HaciendaUploader) {
                    fotoUrl = await global.HaciendaUploader.subirAImgBB(fileInput.files[0]);
                }

                const tipoRif = document.getElementById('edit-c-rif-tipo')?.value || 'J';
                const numRif = document.getElementById('edit-c-rif-numero')?.value || '';
                const rifHelper = global.HaciendaRIF;
                const parsedRif = rifHelper ? rifHelper.parse((tipoRif ? (tipoRif + '-') : '') + numRif) : { tipo: tipoRif, numero: numRif.replace(/\D/g, ''), full: tipoRif + '-' + numRif.replace(/\D/g, '') };

                if (!parsedRif.numero) {
                    throw new Error('El número de RIF es obligatorio y solo debe contener dígitos numéricos.');
                }

                const rawTel = document.getElementById('edit-c-telefono')?.value || '';
                const telSanitizado = (global.HaciendaTelefono ? global.HaciendaTelefono.sanitizar(rawTel) : rawTel.replace(/\D/g, '')).trim();

                const tipoCed = document.getElementById('edit-c-rep-cedula-tipo')?.value || 'V';
                const numCed = document.getElementById('edit-c-rep-cedula-numero')?.value || '';
                const cedHelper = global.HaciendaCedula;
                const parsedCedula = cedHelper 
                    ? cedHelper.parse((tipoCed ? (tipoCed + '-') : '') + numCed) 
                    : { tipo: tipoCed, numero: numCed.replace(/\D/g, ''), full: numCed ? (tipoCed + '-' + numCed.replace(/\D/g, '')) : '' };

                c.rif = parsedRif.full;
                c.tipo_persona = document.getElementById('edit-c-tipo').value;
                c.razon_social = document.getElementById('edit-c-razon').value.trim();
                c.denominacion_comercial = document.getElementById('edit-c-fantasia').value.trim();
                c.correo = document.getElementById('edit-c-correo').value.trim();
                c.telefono = telSanitizado;
                c.direccion_fiscal = document.getElementById('edit-c-direccion').value.trim();
                c.representante_legal = document.getElementById('edit-c-rep-nombre').value.trim();
                c.representante_cedula = parsedCedula.full;
                c.estado = document.getElementById('edit-c-estado').value;
                if (fotoUrl) {
                    c.fotos_local = [fotoUrl];
                }
                c.updated_at = new Date().toISOString();

                await store.set('hacienda_contribuyentes', c);
                this.cerrarModalEditar();
                this.filtrarTabla();

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Contribuyente Actualizado',
                        text: `Los datos de ${c.razon_social} han sido modificados exitosamente.`,
                        confirmButtonColor: '#0284c7',
                        timer: 2000
                    });
                }
            } catch (err) {
                alert('Error al actualizar: ' + err.message);
            } finally {
                if (btn) { btn.disabled = false; btn.innerText = 'Guardar Cambios'; }
            }
        }
    };

    global.ContribuyentesModule = Contribuyentes;
})(typeof window !== 'undefined' ? window : this);
