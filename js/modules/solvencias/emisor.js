/**
 * GUIRIRI SISTEMA HACIENDA V3 — Módulo de Solvencias Municipales
 * Validación automática de deuda a 0ms y emisión de Solvencia con QR.
 */
(function defineSolvenciasModule(global) {
    "use strict";

    const Solvencias = {
        render: function(container) {
            const solvencias = global.HaciendaStore ? global.HaciendaStore.get('hacienda_solvencias') : [];
            const contribuyentes = global.HaciendaStore ? global.HaciendaStore.get('hacienda_contribuyentes') : [];

            container.innerHTML = `
                <div class="space-y-6">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div>
                            <h2 class="text-xl font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-stamp text-sky-400"></i>
                                Solvencias Municipales Automatizadas
                            </h2>
                            <p class="text-xs text-slate-400 mt-1">
                                Emisión de Solvencias Únicas, Comerciales y de Inmuebles con verificación de solvencia fiscal en línea.
                            </p>
                        </div>
                        <button onclick="window.SolvenciasModule.abrirModalSolvencia()" class="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                            <i class="fas fa-plus"></i>
                            Solicitar Solvencia
                        </button>
                    </div>

                    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                    <tr>
                                        <th class="py-3 px-4 font-bold">N° Solvencia</th>
                                        <th class="py-3 px-4 font-bold">Contribuyente (RIF)</th>
                                        <th class="py-3 px-4 font-bold">Tipo</th>
                                        <th class="py-3 px-4 font-bold">Emisión</th>
                                        <th class="py-3 px-4 font-bold">Vencimiento</th>
                                        <th class="py-3 px-4 font-bold text-center">Estado</th>
                                        <th class="py-3 px-4 font-bold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/60 font-medium">
                                    ${this.generarFilasTabla(solvencias, contribuyentes)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Modal Emitir Solvencia -->
                <div id="modal-emitir-solvencia" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                        <div class="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <i class="fas fa-certificate text-sky-400"></i>
                                Trámite de Solvencia Municipal
                            </h3>
                            <button onclick="window.SolvenciasModule.cerrarModalSolvencia()" class="text-slate-400 hover:text-slate-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="form-solvencia" onsubmit="window.SolvenciasModule.guardar(event)" class="p-6 space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Contribuyente / Comercio Solicitante</label>
                                <input type="hidden" id="solv-contribuyente-id" required>
                                <div id="solv-contribuyente-box" onclick="window.SolvenciasModule.abrirSelector()" 
                                     class="p-3 bg-slate-950 border border-dashed border-slate-800 hover:border-sky-500/60 rounded-xl cursor-pointer transition flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-xs">
                                            <i class="fas fa-search"></i>
                                        </div>
                                        <div>
                                            <p class="text-xs font-bold text-slate-200">Seleccionar Contribuyente</p>
                                            <p class="text-[10px] text-slate-500">Haga clic para abrir el catálogo con tarjetas y buscador</p>
                                        </div>
                                    </div>
                                    <button type="button" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-lg transition">
                                        Buscar
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Tipo de Solvencia</label>
                                <select id="solv-tipo" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-sky-500">
                                    <option value="unica">Solvencia Única Municipal</option>
                                    <option value="comercial">Solvencia de Actividades Económicas</option>
                                    <option value="inmueble">Solvencia Inmobiliaria (Derecho de Frente)</option>
                                    <option value="vehiculo">Solvencia Vehicular</option>
                                </select>
                            </div>

                            <!-- Panel de Verificación de Deuda a 0ms -->
                            <div id="panel-auditoria-deuda" class="p-4 rounded-xl border text-xs hidden"></div>

                            <div class="pt-4 flex justify-end gap-3 border-t border-slate-800">
                                <button type="button" onclick="window.SolvenciasModule.cerrarModalSolvencia()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl">Cancelar</button>
                                <button type="submit" id="btn-emitir-solvencia" class="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg">Emitir Solvencia Oficial</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        },

        generarFilasTabla: function(solvencias, contribuyentes) {
            if (!solvencias || solvencias.length === 0) {
                return `<tr><td colspan="7" class="py-8 text-center text-slate-500 italic">No hay solvencias emitidas en el período actual.</td></tr>`;
            }

            return solvencias.map(s => {
                const c = contribuyentes.find(item => String(item.id) === String(s.contribuyente_id));
                return `
                    <tr class="hover:bg-slate-800/40 transition">
                        <td class="py-3 px-4 font-mono font-bold text-sky-400">${s.numero_solvencia}</td>
                        <td class="py-3 px-4">
                            <div class="font-bold text-slate-200">${c ? c.razon_social : 'ID: ' + s.contribuyente_id}</div>
                            <div class="text-[11px] font-mono text-slate-400">${c ? c.rif : ''}</div>
                        </td>
                        <td class="py-3 px-4 uppercase text-slate-300 font-semibold text-[11px]">${s.tipo}</td>
                        <td class="py-3 px-4 font-mono text-slate-300">${s.fecha_emision}</td>
                        <td class="py-3 px-4 font-mono text-amber-400">${s.fecha_vencimiento}</td>
                        <td class="py-3 px-4 text-center">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                VÁLIDA
                            </span>
                        </td>
                        <td class="py-3 px-4 text-right">
                            <button onclick="window.SolvenciasModule.imprimirSolvencia(${s.id})" class="px-2.5 py-1 bg-sky-600/20 hover:bg-sky-600/40 text-sky-400 border border-sky-500/30 rounded-lg text-[11px] font-semibold transition">
                                <i class="fas fa-qrcode"></i> Ver QR / PDF
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        },

        abrirSelector: function() {
            if (global.SelectorContribuyenteModal) {
                global.SelectorContribuyenteModal.abrir({
                    onSelect: (c) => this.setContribuyente(c)
                });
            }
        },

        setContribuyente: function(c) {
            if (!c) return;
            const inputId = document.getElementById('solv-contribuyente-id');
            if (inputId) inputId.value = c.id;

            const box = document.getElementById('solv-contribuyente-box');
            if (box) {
                box.className = "p-3 bg-slate-950 border border-sky-500/40 rounded-xl flex items-center justify-between";
                box.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                            <i class="fas fa-check"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-mono font-bold text-sky-400">[${c.rif}]</span>
                                <span class="text-xs font-bold text-slate-100">${c.razon_social}</span>
                            </div>
                            <p class="text-[10px] text-slate-400">${c.denominacion_comercial ? c.denominacion_comercial + ' · ' : ''}Rep: ${c.representante_legal || 'N/A'}</p>
                        </div>
                    </div>
                    <button type="button" onclick="window.SolvenciasModule.abrirSelector()" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition">
                        Cambiar
                    </button>
                `;
            }

            this.verificarEstadoDeuda();
        },

        resetContribuyenteBox: function() {
            const inputId = document.getElementById('solv-contribuyente-id');
            if (inputId) inputId.value = '';

            const box = document.getElementById('solv-contribuyente-box');
            if (box) {
                box.className = "p-3 bg-slate-950 border border-dashed border-slate-800 hover:border-sky-500/60 rounded-xl cursor-pointer transition flex items-center justify-between";
                box.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-xs">
                            <i class="fas fa-search"></i>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-200">Seleccionar Contribuyente</p>
                            <p class="text-[10px] text-slate-500">Haga clic para abrir el catálogo con tarjetas y buscador</p>
                        </div>
                    </div>
                    <button type="button" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-lg transition">
                        Buscar
                    </button>
                `;
            }

            const panel = document.getElementById('panel-auditoria-deuda');
            if (panel) panel.classList.add('hidden');
        },

        verificarEstadoDeuda: function() {
            const cId = document.getElementById('solv-contribuyente-id')?.value;
            const panel = document.getElementById('panel-auditoria-deuda');
            const btn = document.getElementById('btn-emitir-solvencia');
            if (!cId || !panel) return;

            panel.classList.remove('hidden');

            const declaraciones = global.HaciendaStore ? global.HaciendaStore.get('hacienda_declaraciones') : [];
            const pendientes = declaraciones.filter(d => String(d.contribuyente_id) === String(cId) && d.estado !== 'pagada');

            if (pendientes.length > 0) {
                const totalDeuda = pendientes.reduce((acc, d) => acc + Number(d.impuesto_determinado_bs || 0), 0);
                panel.className = 'p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs space-y-2';
                panel.innerHTML = `
                    <div class="font-bold flex items-center gap-2 text-rose-400">
                        <i class="fas fa-exclamation-triangle"></i>
                        TRÁMITE BLOQUEADO: Contribuyente en Mora Tributaria
                    </div>
                    <p class="text-rose-200">
                        Posee <b>${pendientes.length}</b> declaración(es) pendiente(s) por un monto total de:
                        <b class="font-mono text-rose-300">${totalDeuda.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</b>
                    </p>
                    <p class="text-[11px] text-rose-300/80">
                        Debe enterar el pago en taquilla antes de poder emitir la solvencia municipal.
                    </p>
                `;
                if (btn) btn.disabled = true;
            } else {
                panel.className = 'p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs space-y-1';
                panel.innerHTML = `
                    <div class="font-bold flex items-center gap-2 text-emerald-400">
                        <i class="fas fa-check-circle"></i>
                        ESTADO DE CUENTA SOLVENTE
                    </div>
                    <p class="text-emerald-200">
                        El contribuyente no presenta deudas fiscales vencidas en el sistema. Aprobado para emisión inmediata.
                    </p>
                `;
                if (btn) btn.disabled = false;
            }
        },

        abrirModalSolvencia: function(contribuyenteId = null) {
            if (contribuyenteId) {
                const store = global.HaciendaStore;
                const contribuyentes = store ? store.get('hacienda_contribuyentes') : [];
                const c = contribuyentes.find(item => String(item.id) === String(contribuyenteId));
                if (c) {
                    this.setContribuyente(c);
                } else {
                    this.resetContribuyenteBox();
                }
            } else {
                this.resetContribuyenteBox();
            }

            document.getElementById('modal-emitir-solvencia')?.classList.remove('hidden');
        },

        cerrarModalSolvencia: function() {
            document.getElementById('modal-emitir-solvencia')?.classList.add('hidden');
            document.getElementById('form-solvencia')?.reset();
            this.resetContribuyenteBox();
        },

        guardar: async function(e) {
            e.preventDefault();
            const contribuyenteId = document.getElementById('solv-contribuyente-id')?.value;
            if (!contribuyenteId) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debe seleccionar un contribuyente.', confirmButtonColor: '#0284c7' });
                }
                return;
            }
            const tipo = document.getElementById('solv-tipo').value;

            const solvencias = global.HaciendaStore ? global.HaciendaStore.get('hacienda_solvencias') : [];
            const numSolvencia = 'SOLV-' + new Date().getFullYear() + '-' + String(solvencias.length + 1).padStart(5, '0');

            const hoy = new Date();
            const vencimiento = new Date();
            vencimiento.setDate(hoy.getDate() + 30); // 30 días de vigencia

            const nuevaSolvencia = {
                numero_solvencia: numSolvencia,
                contribuyente_id: contribuyenteId,
                tipo: tipo,
                codigo_qr: 'HACIENDA-VERIF:' + numSolvencia + ':CID-' + contribuyenteId,
                fecha_emision: hoy.toISOString().split('T')[0],
                fecha_vencimiento: vencimiento.toISOString().split('T')[0],
                emitido_por: 'Dirección de Hacienda Municipal',
                estado: 'valida'
            };

            await global.HaciendaStore.set('hacienda_solvencias', nuevaSolvencia);
            this.cerrarModalSolvencia();

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Solvencia Emitida',
                    text: 'Solvencia oficial generada: ' + numSolvencia,
                    confirmButtonColor: '#0284c7',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        },

        imprimirSolvencia: function(id) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'info',
                    title: 'Solvencia Municipal Oficial',
                    text: 'Documento oficial con código QR generado listo para su descarga.',
                    confirmButtonColor: '#0284c7'
                });
            }
        }
    };

    global.SolvenciasModule = Solvencias;
})(typeof window !== 'undefined' ? window : this);
