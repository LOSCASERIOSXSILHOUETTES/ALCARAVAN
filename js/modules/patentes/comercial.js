/**
 * GUIRIRI SISTEMA HACIENDA V3 — Módulo de Patentes y Licencias (LOCAT)
 * Registro, asignación de actividades económicas y emisión de patentes.
 */
(function definePatentesModule(global) {
    "use strict";

    const Patentes = {
        render: function(container) {
            const patentes = global.HaciendaStore ? global.HaciendaStore.get('hacienda_patentes') : [];
            const contribuyentes = global.HaciendaStore ? global.HaciendaStore.get('hacienda_contribuyentes') : [];

            container.innerHTML = `
                <div class="space-y-6">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div>
                            <h2 class="text-xl font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-certificate text-indigo-400"></i>
                                Licencias y Patentes Municipales
                            </h2>
                            <p class="text-xs text-slate-400 mt-1">
                                Gestión de Patentes de Industria y Comercio, Catastro y Vehículos armonizadas bajo la LOCAT.
                            </p>
                        </div>
                        <button onclick="window.PatentesModule.abrirModalPatente()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                            <i class="fas fa-plus"></i>
                            Nueva Licencia / Patente
                        </button>
                    </div>

                    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                    <tr>
                                        <th class="py-3 px-4 font-bold">N° Patente</th>
                                        <th class="py-3 px-4 font-bold">Contribuyente (RIF)</th>
                                        <th class="py-3 px-4 font-bold">Actividad / Ramo LOCAT</th>
                                        <th class="py-3 px-4 font-bold text-center">Alícuota</th>
                                        <th class="py-3 px-4 font-bold text-center">Mínimo (TCMMV)</th>
                                        <th class="py-3 px-4 font-bold">Estado</th>
                                        <th class="py-3 px-4 font-bold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/60 font-medium">
                                    ${this.generarFilasTabla(patentes, contribuyentes)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Modal Nueva Patente -->
                <div id="modal-nueva-patente" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
                        <div class="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <i class="fas fa-file-contract text-indigo-400"></i>
                                Otorgar Licencia de Actividades Económicas
                            </h3>
                            <button onclick="window.PatentesModule.cerrarModalPatente()" class="text-slate-400 hover:text-slate-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="form-patente" onsubmit="window.PatentesModule.guardar(event)" class="p-6 space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Seleccionar Contribuyente</label>
                                <select id="pat-contribuyente-id" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-indigo-500">
                                    <option value="">Seleccione el contribuyente...</option>
                                    ${contribuyentes.map(c => `<option value="${c.id}">${c.rif} - ${c.razon_social}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Actividad Económica (Clasificador LOCAT)</label>
                                <select id="pat-locat-select" onchange="window.PatentesModule.alCambiarActividad()" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-indigo-500">
                                    <option value="">Seleccione una actividad del clasificador...</option>
                                    ${(global.CatalogoLocat ? global.CatalogoLocat.getAll() : []).map(a => `
                                        <option value="${a.codigo}" data-alicuota="${a.alicuota}" data-minimo="${a.minimo_tcmmv}">
                                            [${a.codigo}] ${a.nombre} (${(a.alicuota * 100).toFixed(2)}%)
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Alícuota Aplicable (%)</label>
                                    <input type="number" step="0.0001" id="pat-alicuota" required readonly class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs font-mono outline-none">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Mínimo Tributable (TCMMV)</label>
                                    <input type="number" step="0.01" id="pat-minimo" required readonly class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs font-mono outline-none">
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Número de Patente / Licencia</label>
                                <input type="text" id="pat-numero" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono outline-none focus:border-indigo-500">
                            </div>
                            <div class="pt-4 flex justify-end gap-3 border-t border-slate-800">
                                <button type="button" onclick="window.PatentesModule.cerrarModalPatente()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl">Cancelar</button>
                                <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg">Emitir Licencia</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        },

        generarFilasTabla: function(patentes, contribuyentes) {
            if (!patentes || patentes.length === 0) {
                return `<tr><td colspan="7" class="py-8 text-center text-slate-500 italic">No hay licencias o patentes emitidas en el sistema.</td></tr>`;
            }

            return patentes.map(p => {
                const c = contribuyentes.find(item => String(item.id) === String(p.contribuyente_id));
                return `
                    <tr class="hover:bg-slate-800/40 transition">
                        <td class="py-3 px-4 font-mono font-bold text-indigo-400">${p.numero_patente}</td>
                        <td class="py-3 px-4">
                            <div class="font-bold text-slate-200">${c ? c.razon_social : 'ID: ' + p.contribuyente_id}</div>
                            <div class="text-[11px] font-mono text-slate-400">${c ? c.rif : ''}</div>
                        </td>
                        <td class="py-3 px-4 text-slate-300 max-w-xs truncate">
                            <span class="font-mono text-xs text-sky-400">[${p.codigo_locat || 'LOCAT'}]</span> ${p.descripcion_actividad || ''}
                        </td>
                        <td class="py-3 px-4 text-center font-mono font-bold text-slate-200">
                            ${((p.alicuota || 0) * 100).toFixed(2)}%
                        </td>
                        <td class="py-3 px-4 text-center font-mono text-amber-400">
                            ${Number(p.minimo_tributable_tcmmv || 0).toFixed(2)} TCMMV
                        </td>
                        <td class="py-3 px-4">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${p.estado === 'activa' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-slate-300'}">
                                ${(p.estado || 'activa').toUpperCase()}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-right space-x-2">
                            <button onclick="window.PatentesModule.declararMesRapido(${p.id})" class="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-semibold transition" title="Declarar Ingresos">
                                <i class="fas fa-file-invoice-dollar"></i> Declarar
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        },

        alCambiarActividad: function() {
            const select = document.getElementById('pat-locat-select');
            const opt = select.options[select.selectedIndex];
            if (!opt || !opt.dataset) return;

            const alicuota = parseFloat(opt.dataset.alicuota || 0);
            const minimo = parseFloat(opt.dataset.minimo || 0);

            document.getElementById('pat-alicuota').value = (alicuota * 100).toFixed(2);
            document.getElementById('pat-minimo').value = minimo.toFixed(2);
        },

        abrirModalPatente: function(contribuyenteId = null) {
            const patentes = global.HaciendaStore ? global.HaciendaStore.get('hacienda_patentes') : [];
            const nextCorrelativo = 'PAT-' + new Date().getFullYear() + '-' + String(patentes.length + 1).padStart(4, '0');
            
            const numInput = document.getElementById('pat-numero');
            if (numInput) numInput.value = nextCorrelativo;

            if (contribuyenteId) {
                const cSelect = document.getElementById('pat-contribuyente-id');
                if (cSelect) cSelect.value = contribuyenteId;
            }

            document.getElementById('modal-nueva-patente')?.classList.remove('hidden');
        },

        cerrarModalPatente: function() {
            document.getElementById('modal-nueva-patente')?.classList.add('hidden');
            document.getElementById('form-patente')?.reset();
        },

        guardar: async function(e) {
            e.preventDefault();
            const locatSelect = document.getElementById('pat-locat-select');
            const opt = locatSelect.options[locatSelect.selectedIndex];

            const nuevaPatente = {
                numero_patente: document.getElementById('pat-numero').value.trim(),
                contribuyente_id: parseInt(document.getElementById('pat-contribuyente-id').value, 10),
                tipo: 'comercial',
                codigo_locat: locatSelect.value,
                descripcion_actividad: opt.text.split('] ')[1]?.split(' (')[0] || opt.text,
                alicuota: parseFloat(document.getElementById('pat-alicuota').value) / 100,
                minimo_tributable_tcmmv: parseFloat(document.getElementById('pat-minimo').value),
                estado: 'activa',
                fecha_emision: new Date().toISOString().split('T')[0]
            };

            await global.HaciendaStore.set('hacienda_patentes', nuevaPatente);
            this.cerrarModalPatente();

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Licencia Emitida',
                    text: 'Patente comercial registrada con éxito.',
                    confirmButtonColor: '#4f46e5',
                    timer: 1800,
                    showConfirmButton: false
                });
            }
        },

        declararMesRapido: function(patenteId) {
            if (global.App && global.App.switchTab) {
                global.App.switchTab('declaraciones');
                setTimeout(() => {
                    if (global.DeclaracionesModule && global.DeclaracionesModule.abrirModalDeclaracion) {
                        global.DeclaracionesModule.abrirModalDeclaracion(patenteId);
                    }
                }, 100);
            }
        }
    };

    global.PatentesModule = Patentes;
})(typeof window !== 'undefined' ? window : this);
