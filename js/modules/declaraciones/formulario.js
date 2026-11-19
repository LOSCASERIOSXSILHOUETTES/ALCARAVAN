/**
 * GUIRIRI SISTEMA HACIENDA V3 — Módulo de Declaraciones Mensuales
 * Autoliquidación de Actividades Económicas según LOCAT y Tasa BCV.
 */
(function defineDeclaracionesModule(global) {
    "use strict";

    const Declaraciones = {
        render: function(container) {
            const declaraciones = global.HaciendaStore ? global.HaciendaStore.get('hacienda_declaraciones') : [];
            const patentes = global.HaciendaStore ? global.HaciendaStore.get('hacienda_patentes') : [];
            const contribuyentes = global.HaciendaStore ? global.HaciendaStore.get('hacienda_contribuyentes') : [];

            container.innerHTML = `
                <div class="space-y-6">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div>
                            <h2 class="text-xl font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-file-invoice-dollar text-emerald-400"></i>
                                Declaraciones Juradas de Ingresos Brutos
                            </h2>
                            <p class="text-xs text-slate-400 mt-1">
                                Autoliquidación mensual conforme a la LOCAT: alícuota sobre ingresos o mínimo tributable.
                            </p>
                        </div>
                        <button onclick="window.DeclaracionesModule.abrirModalDeclaracion()" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                            <i class="fas fa-plus"></i>
                            Nueva Declaración
                        </button>
                    </div>

                    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                    <tr>
                                        <th class="py-3 px-4 font-bold">Período</th>
                                        <th class="py-3 px-4 font-bold">Contribuyente / RIF</th>
                                        <th class="py-3 px-4 font-bold">N° Patente</th>
                                        <th class="py-3 px-4 font-bold text-right">Base Imponible (Bs.)</th>
                                        <th class="py-3 px-4 font-bold text-right">Impuesto Determinado</th>
                                        <th class="py-3 px-4 font-bold text-center">Estado</th>
                                        <th class="py-3 px-4 font-bold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/60 font-medium">
                                    ${this.generarFilasTabla(declaraciones, patentes, contribuyentes)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Modal Nueva Declaración -->
                <div id="modal-nueva-declaracion" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
                        <div class="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <i class="fas fa-calculator text-emerald-400"></i>
                                Autoliquidación Mensual de Actividades Económicas
                            </h3>
                            <button onclick="window.DeclaracionesModule.cerrarModalDeclaracion()" class="text-slate-400 hover:text-slate-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="form-declaracion" onsubmit="window.DeclaracionesModule.guardar(event)" class="p-6 space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Seleccionar Patente Comercial</label>
                                <select id="dec-patente-id" onchange="window.DeclaracionesModule.alCambiarPatente()" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-emerald-500">
                                    <option value="">Seleccione la patente a declarar...</option>
                                    ${patentes.map(p => {
                                        const c = contribuyentes.find(item => String(item.id) === String(p.contribuyente_id));
                                        return `<option value="${p.id}" data-alicuota="${p.alicuota}" data-minimo="${p.minimo_tributable_tcmmv}">
                                            ${p.numero_patente} - ${c ? c.razon_social : ''} (${p.descripcion_actividad})
                                        </option>`;
                                    }).join('')}
                                </select>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Año</label>
                                    <input type="number" id="dec-anio" required value="${new Date().getFullYear()}" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono outline-none">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Mes</label>
                                    <select id="dec-mes" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none">
                                        ${[...Array(12).keys()].map(i => `<option value="${i + 1}" ${i + 1 === (new Date().getMonth() + 1) ? 'selected' : ''}>Mes ${String(i + 1).padStart(2, '0')}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Tasa BCV (Bs. / TCMMV)</label>
                                    <input type="number" step="0.01" id="dec-tasa-bcv" oninput="window.DeclaracionesModule.calcularEnVivo()" required value="${(global.HACIENDA_CONFIG?.LOCAT?.TASA_BCV_DEFAULT || 56.50).toFixed(2)}" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono outline-none">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Alícuota Aplicada (%)</label>
                                    <input type="text" id="dec-alicuota-display" readonly class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 text-xs font-mono outline-none">
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Base Imponible (Ingresos Brutos del Mes en Bs.)</label>
                                <input type="number" step="0.01" id="dec-base-imponible" oninput="window.DeclaracionesModule.calcularEnVivo()" required placeholder="0.00" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-sm font-mono font-bold outline-none focus:border-emerald-500">
                            </div>
                            
                            <!-- Tarjeta de Cálculo Automático LOCAT -->
                            <div class="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
                                <div class="flex justify-between text-slate-400">
                                    <span>Impuesto por Alícuota:</span>
                                    <span id="calc-por-alicuota" class="font-mono text-slate-200 font-bold">0,00 Bs.</span>
                                </div>
                                <div class="flex justify-between text-slate-400">
                                    <span>Mínimo Tributable (LOCAT):</span>
                                    <span id="calc-minimo-bs" class="font-mono text-amber-400 font-bold">0,00 Bs.</span>
                                </div>
                                <div class="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                                    <span class="font-bold text-slate-200 uppercase">Monto Total a Pagar:</span>
                                    <span id="calc-total-pagar" class="font-black font-mono text-emerald-400 text-base">0,00 Bs.</span>
                                </div>
                            </div>

                            <div class="pt-4 flex justify-end gap-3 border-t border-slate-800">
                                <button type="button" onclick="window.DeclaracionesModule.cerrarModalDeclaracion()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl">Cancelar</button>
                                <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg">Presentar Declaración</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        },

        generarFilasTabla: function(declaraciones, patentes, contribuyentes) {
            if (!declaraciones || declaraciones.length === 0) {
                return `<tr><td colspan="7" class="py-8 text-center text-slate-500 italic">No hay declaraciones juradas presentadas aún.</td></tr>`;
            }

            return declaraciones.map(d => {
                const p = patentes.find(item => String(item.id) === String(d.patente_id));
                const c = contribuyentes.find(item => String(item.id) === String(d.contribuyente_id));
                const isPagada = d.estado === 'pagada';

                return `
                    <tr class="hover:bg-slate-800/40 transition">
                        <td class="py-3 px-4 font-mono font-bold text-slate-200">
                            ${String(d.mes).padStart(2, '0')}/${d.anio}
                        </td>
                        <td class="py-3 px-4">
                            <div class="font-bold text-slate-200">${c ? c.razon_social : 'ID: ' + d.contribuyente_id}</div>
                            <div class="text-[11px] font-mono text-slate-400">${c ? c.rif : ''}</div>
                        </td>
                        <td class="py-3 px-4 font-mono text-indigo-400">${p ? p.numero_patente : 'N/A'}</td>
                        <td class="py-3 px-4 text-right font-mono text-slate-300">
                            ${Number(d.base_imponible_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                            ${Number(d.impuesto_determinado_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isPagada ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
                                ${(d.estado || 'declarada').toUpperCase()}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-right space-x-2">
                            ${!isPagada ? `
                                <button onclick="window.DeclaracionesModule.pagarEnCaja(${d.id})" class="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-semibold transition" title="Pagar Declaración">
                                    <i class="fas fa-cash-register"></i> Pagar
                                </button>
                            ` : `
                                <span class="text-xs text-slate-500 font-bold"><i class="fas fa-check text-emerald-500"></i> Solvente</span>
                            `}
                        </td>
                    </tr>
                `;
            }).join('');
        },

        alCambiarPatente: function() {
            const select = document.getElementById('dec-patente-id');
            const opt = select.options[select.selectedIndex];
            if (!opt || !opt.dataset) return;

            const alicuota = parseFloat(opt.dataset.alicuota || 0);
            document.getElementById('dec-alicuota-display').value = (alicuota * 100).toFixed(2) + '%';
            this.calcularEnVivo();
        },

        calcularEnVivo: function() {
            const select = document.getElementById('dec-patente-id');
            const opt = select?.options[select.selectedIndex];
            if (!opt || !opt.dataset) return;

            const alicuota = parseFloat(opt.dataset.alicuota || 0);
            const minimoTcmmv = parseFloat(opt.dataset.minimo || 0);
            const tasaBcv = parseFloat(document.getElementById('dec-tasa-bcv')?.value || 56.50);
            const baseImponible = parseFloat(document.getElementById('dec-base-imponible')?.value || 0);

            const porAlicuota = baseImponible * alicuota;
            const minimoBs = minimoTcmmv * tasaBcv;
            const total = Math.max(porAlicuota, minimoBs);

            document.getElementById('calc-por-alicuota').innerText = porAlicuota.toLocaleString('es-VE', { minimumFractionDigits: 2 }) + ' Bs.';
            document.getElementById('calc-minimo-bs').innerText = minimoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 }) + ' Bs.';
            document.getElementById('calc-total-pagar').innerText = total.toLocaleString('es-VE', { minimumFractionDigits: 2 }) + ' Bs.';
        },

        abrirModalDeclaracion: function(patenteId = null) {
            if (patenteId) {
                const select = document.getElementById('dec-patente-id');
                if (select) {
                    select.value = patenteId;
                    this.alCambiarPatente();
                }
            }
            document.getElementById('modal-nueva-declaracion')?.classList.remove('hidden');
        },

        cerrarModalDeclaracion: function() {
            document.getElementById('modal-nueva-declaracion')?.classList.add('hidden');
            document.getElementById('form-declaracion')?.reset();
        },

        guardar: async function(e) {
            e.preventDefault();
            const patenteSelect = document.getElementById('dec-patente-id');
            const opt = patenteSelect.options[patenteSelect.selectedIndex];
            const patenteId = parseInt(patenteSelect.value, 10);

            const patentes = global.HaciendaStore ? global.HaciendaStore.get('hacienda_patentes') : [];
            const patente = patentes.find(p => String(p.id) === String(patenteId));
            if (!patente) { alert('Patente no encontrada'); return; }

            const alicuota = parseFloat(opt.dataset.alicuota || 0);
            const minimoTcmmv = parseFloat(opt.dataset.minimo || 0);
            const tasaBcv = parseFloat(document.getElementById('dec-tasa-bcv').value || 56.50);
            const baseImponible = parseFloat(document.getElementById('dec-base-imponible').value || 0);

            const porAlicuota = baseImponible * alicuota;
            const minimoBs = minimoTcmmv * tasaBcv;
            const total = Math.max(porAlicuota, minimoBs);

            const nuevaDeclaracion = {
                contribuyente_id: patente.contribuyente_id,
                patente_id: patenteId,
                anio: parseInt(document.getElementById('dec-anio').value, 10),
                mes: parseInt(document.getElementById('dec-mes').value, 10),
                base_imponible_bs: baseImponible,
                alicuota_aplicada: alicuota,
                impuesto_alicuota_bs: porAlicuota,
                minimo_tributable_bs: minimoBs,
                impuesto_determinado_bs: total,
                tasa_bcv_aplicada: tasaBcv,
                estado: 'declarada',
                fecha_declaracion: new Date().toISOString()
            };

            await global.HaciendaStore.set('hacienda_declaraciones', nuevaDeclaracion);
            this.cerrarModalDeclaracion();

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Declaración Presentada',
                    text: 'Liquidada por ' + total.toLocaleString('es-VE', { minimumFractionDigits: 2 }) + ' Bs.',
                    confirmButtonColor: '#059669',
                    timer: 1800,
                    showConfirmButton: false
                });
            }
        },

        pagarEnCaja: function(declaracionId) {
            if (global.App && global.App.switchTab) {
                global.App.switchTab('caja');
                setTimeout(() => {
                    if (global.CajaModule && global.CajaModule.abrirModalPago) {
                        global.CajaModule.abrirModalPago(declaracionId);
                    }
                }, 100);
            }
        }
    };

    global.DeclaracionesModule = Declaraciones;
})(typeof window !== 'undefined' ? window : this);
