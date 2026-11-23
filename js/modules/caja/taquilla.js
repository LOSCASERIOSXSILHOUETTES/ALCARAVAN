/**
 * GUIRIRI SISTEMA HACIENDA V3 — Módulo de Caja, Taquilla y Recaudación
 * Entero de transferencias, validación fiscal y emisión de recibos.
 */
(function defineCajaModule(global) {
    "use strict";

    const Caja = {
        render: function(container) {
            const pagos = global.HaciendaStore ? global.HaciendaStore.get('hacienda_pagos') : [];
            const contribuyentes = global.HaciendaStore ? global.HaciendaStore.get('hacienda_contribuyentes') : [];
            const declaraciones = global.HaciendaStore ? global.HaciendaStore.get('hacienda_declaraciones') : [];
            const mockCtaIds = new Set(['cta_01', 'cta_02']);
            const mockCtaNums = new Set(['01020544210000012345', '01340371820000098765']);
            const cuentasBancarias = (global.HaciendaStore ? global.HaciendaStore.get('hacienda_cuentas') : [])
                .filter(c => c.estado !== 'inactiva' && !mockCtaIds.has(String(c.id)) && !mockCtaNums.has(String(c.numero || '').replace(/\D/g, '')));
            const mockMetodoIds = new Set(['met_pm_bdv', 'met_tr_bdv', 'met_tr_banesco', 'met_pos_taquilla']);
            const metodosPago = (global.HaciendaStore ? global.HaciendaStore.get('hacienda_metodos_pago') : [])
                .filter(m => m.activo !== false && !mockMetodoIds.has(String(m.id)) && !mockCtaIds.has(String(m.cuenta_id)));

            const totalRecaudado = pagos
                .filter(p => p.estado === 'conciliado')
                .reduce((acc, p) => acc + Number(p.monto_bs || 0), 0);

            container.innerHTML = `
                <div class="space-y-6">
                    <!-- HUD Recaudación -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                            <div>
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Recaudado (Caja)</span>
                                <div class="text-2xl font-black font-mono text-emerald-400 mt-1">
                                    ${totalRecaudado.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
                                </div>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
                                <i class="fas fa-coins"></i>
                            </div>
                        </div>

                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                            <div>
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Pagos Conciliados</span>
                                <div class="text-2xl font-black font-mono text-slate-100 mt-1">
                                    ${pagos.filter(p => p.estado === 'conciliado').length}
                                </div>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 text-xl">
                                <i class="fas fa-receipt"></i>
                            </div>
                        </div>

                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                            <div>
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendientes por Conciliar</span>
                                <div class="text-2xl font-black font-mono text-amber-400 mt-1">
                                    ${pagos.filter(p => p.estado === 'pendiente').length}
                                </div>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl">
                                <i class="fas fa-clock"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Cabecera y Tabla -->
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div>
                            <h2 class="text-xl font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-cash-register text-amber-400"></i>
                                Taquilla de Recaudación y Pagos
                            </h2>
                            <p class="text-xs text-slate-400 mt-1">
                                Registro de enteros bancarios, conciliación de caja y emisión de recibos oficiales.
                            </p>
                        </div>
                        <div class="flex items-center gap-2.5">
                            <button onclick="window.HaciendaCuentas && window.HaciendaCuentas.abrirModalGestion()" 
                                    class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs rounded-xl border border-slate-700 hover:border-sky-500/40 shadow-lg transition flex items-center gap-2">
                                <i class="fas fa-university text-xs"></i>
                                <span>Cuentas Recaudadoras</span>
                            </button>
                            <button onclick="window.CajaModule.abrirModalPago()" class="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                                <i class="fas fa-plus"></i>
                                <span>Enterar Pago</span>
                            </button>
                        </div>
                    </div>

                    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                    <tr>
                                        <th class="py-3 px-4 font-bold">N° Recibo</th>
                                        <th class="py-3 px-4 font-bold">Contribuyente (RIF)</th>
                                        <th class="py-3 px-4 font-bold">Banco Destino / Ref.</th>
                                        <th class="py-3 px-4 font-bold">Fecha</th>
                                        <th class="py-3 px-4 font-bold text-right">Monto (Bs.)</th>
                                        <th class="py-3 px-4 font-bold text-center">Estado</th>
                                        <th class="py-3 px-4 font-bold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/60 font-medium">
                                    ${this.generarFilasTabla(pagos, contribuyentes, declaraciones)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Modal Enterar Pago -->
                <div id="modal-enterar-pago" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
                        <div class="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <i class="fas fa-hand-holding-usd text-amber-400"></i>
                                Entero de Pago Municipal
                            </h3>
                            <button onclick="window.CajaModule.cerrarModalPago()" class="text-slate-400 hover:text-slate-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="form-pago" onsubmit="window.CajaModule.guardar(event)" class="p-6 space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Declaración a Cancelar</label>
                                <select id="pago-declaracion-id" onchange="window.CajaModule.alSeleccionarDeclaracion()" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-amber-500">
                                    <option value="">Seleccione la declaración pendiente...</option>
                                    ${declaraciones.filter(d => d.estado !== 'pagada').map(d => {
                                        const c = contribuyentes.find(item => String(item.id) === String(d.contribuyente_id));
                                        const saldo = d.saldo_pendiente_bs != null ? Number(d.saldo_pendiente_bs) : Number(d.impuesto_determinado_bs || 0);
                                        const esParcial = d.estado === 'parcial' || (d.monto_pagado_bs && Number(d.monto_pagado_bs) > 0);
                                        const txtInfo = esParcial 
                                            ? ` [Saldo Restante: ${saldo.toLocaleString('es-VE')} Bs · Abonado: ${Number(d.monto_pagado_bs).toLocaleString('es-VE')} Bs]`
                                            : ` (${saldo.toLocaleString('es-VE')} Bs.)`;
                                        return `<option value="${d.id}" data-monto="${saldo}" data-contribuyente="${d.contribuyente_id}">
                                            Mes ${d.mes}/${d.anio} - ${c ? c.razon_social : ''}${txtInfo}
                                        </option>`;
                                    }).join('')}
                                </select>
                            </div>
                            <div class="mb-4">
                                <label class="block text-xs font-bold text-slate-400 mb-1">Método de Pago Oficial (Alcaldía)</label>
                                <select id="pago-metodo-id" onchange="window.CajaModule.alSeleccionarMetodoPago(this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-amber-500">
                                    <option value="">Seleccione canal de cobro...</option>
                                    ${metodosPago.map(m => {
                                        const cta = cuentasBancarias.find(c => String(c.id) === String(m.cuenta_id));
                                        const ctaInfo = cta ? ` (${cta.banco} ····${(cta.numero || cta.numero_cuenta || '').slice(-4)})` : '';
                                        return `<option value="${m.id}" data-cuenta-id="${m.cuenta_id || ''}" data-canal="${m.canal || 'transferencia'}">${m.nombre}${ctaInfo}</option>`;
                                    }).join('')}
                                </select>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Banco Destino (Alcaldía)</label>
                                    <select id="pago-banco-destino" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none">
                                        ${cuentasBancarias.length === 0 ? `
                                            <option value="Banco de Venezuela - Cta Recaudadora" data-cuenta-id="">Banco de Venezuela (Cta. Recaudadora)</option>
                                        ` : cuentasBancarias.map(c => `
                                            <option value="${c.banco} (${c.numero ? c.numero.slice(-4) : ''})" data-cuenta-id="${c.id}">
                                                ${c.banco} (${c.numero ? c.numero.slice(-4) : ''}) — ${c.concepto || 'Recaudación'}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Modalidad de Pago</label>
                                    <select id="pago-metodo" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none">
                                        <option value="transferencia">Transferencia Bancaria</option>
                                        <option value="pago_movil">Pago Móvil C2P / P2P</option>
                                        <option value="punto_venta">Punto de Venta / Tarjeta</option>
                                        <option value="biopago">BioPago BDV</option>
                                        <option value="efectivo">Efectivo en Taquilla</option>
                                    </select>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">N° de Referencia Bancaria</label>
                                    <input type="text" id="pago-referencia" required placeholder="Ej: 00481239" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono outline-none focus:border-amber-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Fecha del Pago</label>
                                    <input type="date" id="pago-fecha" required value="${new Date().toISOString().split('T')[0]}" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono outline-none">
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Monto a Enterar (Bs.)</label>
                                <input type="number" step="0.01" id="pago-monto" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-base font-mono font-bold outline-none focus:border-amber-500">
                                <p class="text-[11px] text-slate-400 mt-1">Si ingresas un monto menor a la deuda, el sistema lo registrará automáticamente como Abono Parcial manteniendo la mora por la diferencia.</p>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Comprobante de Pago (ImgBB / Offline)</label>
                                <input type="file" id="pago-comprobante" accept="image/*" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-500">
                            </div>
                            <div class="pt-4 flex justify-end gap-3 border-t border-slate-800">
                                <button type="button" onclick="window.CajaModule.cerrarModalPago()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl">Cancelar</button>
                                <button type="submit" id="btn-guardar-pago" class="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg">Confirmar y Emitir Recibo</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        },

        generarFilasTabla: function(pagos, contribuyentes, declaraciones) {
            if (!pagos || pagos.length === 0) {
                return `<tr><td colspan="7" class="py-8 text-center text-slate-500 italic">No hay pagos registrados en taquilla aún.</td></tr>`;
            }

            return pagos.map(p => {
                const c = contribuyentes.find(item => String(item.id) === String(p.contribuyente_id));
                const d = declaraciones ? declaraciones.find(item => String(item.id) === String(p.declaracion_id)) : null;
                const isConciliado = p.estado === 'conciliado';
                const isRechazado = p.estado === 'rechazado';
                const isAbono = p.tipo_pago === 'abono';

                const montoDeclarado = d ? Number((d.saldo_pendiente_bs != null ? d.saldo_pendiente_bs : d.impuesto_determinado_bs) || 0) : 0;
                const montoReportado = Number(p.monto_bs || 0);
                const isIncompleto = d && montoReportado < montoDeclarado && p.estado === 'pendiente';
                const faltante = Math.max(0, montoDeclarado - montoReportado);

                return `
                    <tr class="hover:bg-slate-800/40 transition">
                        <td class="py-3 px-4 font-mono font-bold text-amber-400">
                            ${p.numero_recibo || 'REC-PEND'}
                            ${isAbono ? `<span class="block text-[9px] font-sans text-amber-300 font-semibold">[ABONO]</span>` : ''}
                        </td>
                        <td class="py-3 px-4">
                            <div class="font-bold text-slate-200">${c ? c.razon_social : 'ID: ' + p.contribuyente_id}</div>
                            <div class="text-[11px] font-mono text-slate-400">${c ? c.rif : ''}</div>
                        </td>
                        <td class="py-3 px-4 text-slate-300">
                            <div>${p.banco_destino}</div>
                            <div class="text-[11px] font-mono text-slate-500">Ref: ${p.referencia_bancaria}</div>
                            ${p.banco_origen ? `<div class="text-[10px] text-slate-400">Origen: ${p.banco_origen}</div>` : ''}
                        </td>
                        <td class="py-3 px-4 font-mono text-slate-300">${p.fecha_pago}</td>
                        <td class="py-3 px-4 text-right">
                            <div class="font-mono font-bold ${isRechazado ? 'text-rose-400 line-through' : (isAbono ? 'text-amber-400' : 'text-emerald-400')}">
                                ${montoReportado.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
                            </div>
                            ${d && p.estado === 'pendiente' ? `
                                <div class="text-[10px] text-slate-400 font-mono" title="Monto de la declaración">
                                    Total: ${Number(d.impuesto_determinado_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
                                </div>
                            ` : ''}
                        </td>
                        <td class="py-3 px-4 text-center">
                            ${isConciliado ? `
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isAbono ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}">
                                    ${isAbono ? 'ABONO CONCILIADO' : 'CONCILIADO'}
                                </span>
                            ` : isRechazado ? `
                                <div>
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                        RECHAZADO
                                    </span>
                                    <div class="text-[10px] text-rose-400 italic mt-0.5 max-w-[140px] truncate mx-auto" title="${p.motivo_rechazo || ''}">
                                        ${p.motivo_rechazo || 'Pago no admitido'}
                                    </div>
                                </div>
                            ` : `
                                <div>
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        PENDIENTE
                                    </span>
                                    ${isIncompleto ? `
                                        <div class="text-[10px] font-bold text-amber-300 mt-1" title="Monto inferior a la declaración">
                                            Incompleto (-${faltante.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.)
                                        </div>
                                    ` : ''}
                                </div>
                            `}
                        </td>
                        <td class="py-3 px-4 text-right">
                            <div class="flex items-center justify-end gap-1.5 flex-wrap">
                                ${isConciliado ? `
                                    <button onclick="window.CajaModule.imprimirRecibo(${p.id})" class="px-2.5 py-1 bg-sky-600/20 hover:bg-sky-600/40 text-sky-400 border border-sky-500/30 rounded-lg text-[11px] font-semibold transition" title="Imprimir Recibo">
                                        <i class="fas fa-print"></i> Recibo
                                    </button>
                                ` : isRechazado ? `
                                    <button onclick="window.CajaModule.verMotivoRechazo(${p.id})" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg text-[11px] font-medium transition" title="Ver Detalle del Rechazo">
                                        Ver Motivo
                                    </button>
                                ` : `
                                    ${isIncompleto ? `
                                        <button onclick="window.CajaModule.abonarPago(${p.id})" class="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-semibold transition flex items-center gap-1" title="Aceptar como abono parcial (Mantiene la deuda en mora)">
                                            <i class="fas fa-coins text-[10px]"></i> Abonar
                                        </button>
                                    ` : `
                                        <button onclick="window.CajaModule.conciliarPago(${p.id})" class="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-semibold transition flex items-center gap-1" title="Conciliar y Validar Pago Completo">
                                            <i class="fas fa-check text-[10px]"></i> Validar
                                        </button>
                                    `}
                                    <button onclick="window.CajaModule.rechazarPago(${p.id})" class="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-lg text-[11px] font-semibold transition flex items-center gap-1" title="Rechazar Pago Incompleto o Falso">
                                        <i class="fas fa-times text-[10px]"></i> Rechazar
                                    </button>
                                `}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        },

        alSeleccionarDeclaracion: function() {
            const select = document.getElementById('pago-declaracion-id');
            const opt = select.options[select.selectedIndex];
            if (!opt || !opt.dataset) return;

            const monto = parseFloat(opt.dataset.monto || 0);
            document.getElementById('pago-monto').value = monto.toFixed(2);
        },

        alSeleccionarMetodoPago: function(metodoId) {
            const store = global.HaciendaStore;
            if (!store) return;
            const metodos = store.get('hacienda_metodos_pago') || [];
            const m = metodos.find(item => String(item.id) === String(metodoId));
            if (!m) return;

            const selectMetodo = document.getElementById('pago-metodo');
            const canalTipo = m.tipo || m.canal;
            if (selectMetodo && canalTipo) {
                if (canalTipo === 'pago_movil') selectMetodo.value = 'pago_movil';
                else if (canalTipo === 'transferencia') selectMetodo.value = 'transferencia';
                else if (canalTipo === 'punto_venta') selectMetodo.value = 'punto_venta';
                else if (canalTipo === 'efectivo' || canalTipo === 'efectivo_bs') selectMetodo.value = 'efectivo';
            }

            if (m.cuenta_id) {
                const selectDestino = document.getElementById('pago-banco-destino');
                if (selectDestino) {
                    for (let i = 0; i < selectDestino.options.length; i++) {
                        if (String(selectDestino.options[i].dataset?.cuentaId) === String(m.cuenta_id)) {
                            selectDestino.selectedIndex = i;
                            break;
                        }
                    }
                }
            }
        },

        abrirModalPago: function(declaracionId = null) {
            if (declaracionId) {
                const select = document.getElementById('pago-declaracion-id');
                if (select) {
                    select.value = declaracionId;
                    this.alSeleccionarDeclaracion();
                }
            }
            document.getElementById('modal-enterar-pago')?.classList.remove('hidden');
        },

        cerrarModalPago: function() {
            document.getElementById('modal-enterar-pago')?.classList.add('hidden');
            document.getElementById('form-pago')?.reset();
        },

        guardar: async function(e) {
            e.preventDefault();
            const btn = document.getElementById('btn-guardar-pago');
            if (btn) { btn.disabled = true; btn.innerText = 'Procesando...'; }

            try {
                const decSelect = document.getElementById('pago-declaracion-id');
                const opt = decSelect.options[decSelect.selectedIndex];
                const declaracionId = parseInt(decSelect.value, 10);
                const contribuyenteId = parseInt(opt.dataset.contribuyente, 10);

                let compUrl = null;
                const fileInput = document.getElementById('pago-comprobante');
                if (fileInput?.files?.length > 0 && global.HaciendaUploader) {
                    compUrl = await global.HaciendaUploader.subirAImgBB(fileInput.files[0]);
                }

                const pagos = global.HaciendaStore ? global.HaciendaStore.get('hacienda_pagos') : [];
                const numRecibo = 'REC-' + new Date().getFullYear() + '-' + String(pagos.length + 1).padStart(5, '0');

                const metodoId = document.getElementById('pago-metodo-id')?.value;
                const metodos = global.HaciendaStore ? (global.HaciendaStore.get('hacienda_metodos_pago') || []) : [];
                const metodoObj = metodos.find(m => String(m.id) === String(metodoId));

                const selectDestino = document.getElementById('pago-banco-destino');
                const optDestino = selectDestino && selectDestino.selectedIndex >= 0 ? selectDestino.options[selectDestino.selectedIndex] : null;
                const cuentaIdDestino = optDestino?.dataset?.cuentaId ? parseInt(optDestino.dataset.cuentaId, 10) : null;
                const cuentaIdFinal = (metodoObj && metodoObj.cuenta_id) ? metodoObj.cuenta_id : (cuentaIdDestino || null);

                const montoIngresado = parseFloat(document.getElementById('pago-monto').value);
                const declaraciones = global.HaciendaStore ? (global.HaciendaStore.get('hacienda_declaraciones') || []) : [];
                const dec = declaraciones.find(d => String(d.id) === String(declaracionId));

                const totalDec = dec ? Number(dec.impuesto_determinado_bs || 0) : montoIngresado;
                const saldoActual = dec ? Number(dec.saldo_pendiente_bs != null ? dec.saldo_pendiente_bs : totalDec) : totalDec;
                const esAbono = montoIngresado < saldoActual;
                const nuevoSaldo = Math.max(0, saldoActual - montoIngresado);

                const nuevoPago = {
                    numero_recibo: numRecibo,
                    contribuyente_id: contribuyenteId,
                    declaracion_id: declaracionId,
                    metodo_pago_id: metodoObj ? metodoObj.id : (metodoId ? parseInt(metodoId, 10) : null),
                    cuenta_id: cuentaIdFinal,
                    banco_origen: 'Taquilla / Transferencia',
                    banco_destino: document.getElementById('pago-banco-destino').value,
                    referencia_bancaria: document.getElementById('pago-referencia').value.trim(),
                    fecha_pago: document.getElementById('pago-fecha').value,
                    monto_bs: montoIngresado,
                    comprobante_url: compUrl,
                    metodo: document.getElementById('pago-metodo').value,
                    tipo_pago: esAbono ? 'abono' : 'total',
                    estado: 'conciliado', // Auto-conciliado en taquilla
                    verificado_por: 'Taquilla Hacienda',
                    fecha_verificacion: new Date().toISOString()
                };

                await global.HaciendaStore.set('hacienda_pagos', nuevoPago);

                // Actualizar estatus de la declaración
                if (dec) {
                    dec.monto_pagado_bs = Number((Number(dec.monto_pagado_bs || 0) + montoIngresado).toFixed(2));
                    dec.saldo_pendiente_bs = Number(nuevoSaldo.toFixed(2));
                    dec.estado = nuevoSaldo <= 0 ? 'pagada' : 'parcial';
                    await global.HaciendaStore.set('hacienda_declaraciones', dec);
                }

                this.cerrarModalPago();
                const container = document.getElementById('app-main-content');
                if (container) this.render(container);

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: esAbono ? 'Abono Parcial Registrado' : 'Pago Total Conciliado',
                        text: esAbono 
                            ? `Se enteró un abono de ${montoIngresado.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs. Saldo pendiente: ${nuevoSaldo.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.` 
                            : `Recibo oficial emitido con éxito: ${numRecibo}`,
                        confirmButtonColor: '#d97706',
                        timer: 2400,
                        showConfirmButton: false
                    });
                }
            } catch (err) {
                alert('Error al registrar pago: ' + err.message);
            } finally {
                if (btn) { btn.disabled = false; btn.innerText = 'Confirmar y Emitir Recibo'; }
            }
        },

        conciliarPago: async function(pagoId) {
            const store = global.HaciendaStore;
            if (!store) return;
            const pagos = store.get('hacienda_pagos') || [];
            const pago = pagos.find(p => String(p.id) === String(pagoId));
            if (!pago) return;

            pago.estado = 'conciliado';
            pago.tipo_pago = 'total';
            pago.fecha_verificacion = new Date().toISOString();
            pago.verificado_por = 'Taquilla Hacienda';
            await store.set('hacienda_pagos', pago);

            // Actualizar declaración a pagada y saldo 0
            if (pago.declaracion_id) {
                const declaraciones = store.get('hacienda_declaraciones') || [];
                const dec = declaraciones.find(d => String(d.id) === String(pago.declaracion_id));
                if (dec) {
                    dec.monto_pagado_bs = Number(dec.impuesto_determinado_bs || pago.monto_bs || 0);
                    dec.saldo_pendiente_bs = 0;
                    dec.estado = 'pagada';
                    await store.set('hacienda_declaraciones', dec);
                }
            }

            const container = document.getElementById('app-main-content');
            if (container) this.render(container);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Pago Conciliado',
                    text: 'Pago validado en su totalidad y declaración saldada.',
                    confirmButtonColor: '#059669',
                    timer: 1800,
                    showConfirmButton: false
                });
            }
        },

        abonarPago: async function(pagoId) {
            const store = global.HaciendaStore;
            if (!store) return;
            const pagos = store.get('hacienda_pagos') || [];
            const pago = pagos.find(p => String(p.id) === String(pagoId));
            if (!pago) return;

            const declaraciones = store.get('hacienda_declaraciones') || [];
            const dec = declaraciones.find(d => String(d.id) === String(pago.declaracion_id));

            const montoPago = Number(pago.monto_bs || 0);
            const totalDec = dec ? Number(dec.impuesto_determinado_bs || 0) : montoPago;
            const saldoActual = dec ? Number(dec.saldo_pendiente_bs != null ? dec.saldo_pendiente_bs : totalDec) : totalDec;
            const nuevoSaldo = Math.max(0, saldoActual - montoPago);

            if (typeof Swal !== 'undefined') {
                const result = await Swal.fire({
                    title: 'Aceptar Abono Parcial',
                    html: `
                        <div class="text-left text-xs space-y-2 text-slate-300">
                            <p>El contribuyente reportó un pago por <b class="text-emerald-400 font-mono">${montoPago.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</b></p>
                            <p>Deuda total de la declaración: <b class="text-slate-100 font-mono">${totalDec.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</b></p>
                            <div class="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
                                <b>Saldo restante tras el abono:</b> <span class="font-mono font-bold text-amber-200">${nuevoSaldo.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span>
                                <p class="text-[11px] mt-1 text-amber-400/80">Nota: La declaración quedará en estado <b>PARCIAL</b> y el comercio seguirá en <b>MORA</b> hasta cancelar la totalidad. No se emitirá Solvencia Municipal.</p>
                            </div>
                        </div>
                    `,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#d97706',
                    cancelButtonColor: '#334155',
                    confirmButtonText: 'Sí, Registrar Abono',
                    cancelButtonText: 'Cancelar'
                });

                if (!result.isConfirmed) return;
            }

            pago.estado = 'conciliado';
            pago.tipo_pago = 'abono';
            pago.fecha_verificacion = new Date().toISOString();
            pago.verificado_por = 'Taquilla Hacienda';
            await store.set('hacienda_pagos', pago);

            if (dec) {
                dec.monto_pagado_bs = Number((Number(dec.monto_pagado_bs || 0) + montoPago).toFixed(2));
                dec.saldo_pendiente_bs = Number(nuevoSaldo.toFixed(2));
                dec.estado = nuevoSaldo <= 0 ? 'pagada' : 'parcial';
                await store.set('hacienda_declaraciones', dec);
            }

            const container = document.getElementById('app-main-content');
            if (container) this.render(container);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Abono Procesado',
                    text: `Se registraron ${montoPago.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs. Restan ${nuevoSaldo.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.`,
                    confirmButtonColor: '#d97706',
                    timer: 2200,
                    showConfirmButton: false
                });
            }
        },

        rechazarPago: async function(pagoId) {
            const store = global.HaciendaStore;
            if (!store) return;
            const pagos = store.get('hacienda_pagos') || [];
            const pago = pagos.find(p => String(p.id) === String(pagoId));
            if (!pago) return;

            let motivo = 'Transferencia no recibida en la cuenta bancaria de la Alcaldía.';

            if (typeof Swal !== 'undefined') {
                const { value: formValues } = await Swal.fire({
                    title: 'Rechazar Pago Reportado',
                    html: `
                        <div class="text-left text-xs space-y-3 text-slate-300">
                            <p class="text-slate-400">Indica el motivo por el cual se rechaza el pago (el contribuyente verá esta razón en su portal):</p>
                            <div>
                                <label class="block text-[11px] font-bold text-slate-400 mb-1">Motivo predeterminado:</label>
                                <select id="swal-motivo-rapido" onchange="document.getElementById('swal-motivo-texto').value = this.value" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none">
                                    <option value="Transferencia no recibida en la cuenta bancaria de la Alcaldía.">Transferencia no recibida en banco (Comprobante no válido o pago falso)</option>
                                    <option value="Monto transferido es insuficiente o pago incompleto no autorizado.">Monto insuficiente / pago incompleto</option>
                                    <option value="Número de referencia bancaria inválido o duplicado.">Número de referencia inválido o duplicado</option>
                                    <option value="Banco emisor o datos no corresponden con el extracto bancario.">Datos no concuerdan con el extracto bancario</option>
                                    <option value="">Otro motivo personalizado...</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-slate-400 mb-1">Detalle del motivo:</label>
                                <textarea id="swal-motivo-texto" rows="3" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 outline-none focus:border-rose-500" placeholder="Escriba el motivo detallado del rechazo...">Transferencia no recibida en la cuenta bancaria de la Alcaldía.</textarea>
                            </div>
                        </div>
                    `,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#e11d48',
                    cancelButtonColor: '#334155',
                    confirmButtonText: 'Rechazar Pago',
                    cancelButtonText: 'Cancelar',
                    preConfirm: () => {
                        const m = document.getElementById('swal-motivo-texto')?.value.trim();
                        if (!m) {
                            Swal.showValidationMessage('Debe ingresar un motivo de rechazo.');
                            return false;
                        }
                        return m;
                    }
                });

                if (!formValues) return;
                motivo = formValues;
            }

            pago.estado = 'rechazado';
            pago.motivo_rechazo = motivo;
            pago.fecha_verificacion = new Date().toISOString();
            pago.verificado_por = 'Taquilla Hacienda';
            await store.set('hacienda_pagos', pago);

            const container = document.getElementById('app-main-content');
            if (container) this.render(container);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'info',
                    title: 'Pago Rechazado',
                    text: 'El pago ha sido marcado como rechazado y el contribuyente fue notificado en su portal.',
                    confirmButtonColor: '#e11d48',
                    timer: 2200,
                    showConfirmButton: false
                });
            }
        },

        verMotivoRechazo: function(pagoId) {
            const store = global.HaciendaStore;
            const pagos = store ? (store.get('hacienda_pagos') || []) : [];
            const pago = pagos.find(p => String(p.id) === String(pagoId));
            if (!pago) return;

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Detalle de Pago Rechazado',
                    html: `
                        <div class="text-left text-xs space-y-2 text-slate-300">
                            <p><b>N° Recibo / Ref:</b> <span class="font-mono text-slate-100">${pago.numero_recibo || ''} (${pago.referencia_bancaria})</span></p>
                            <p><b>Monto Reportado:</b> <span class="font-mono text-rose-400 font-bold">${Number(pago.monto_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span></p>
                            <p><b>Fecha de Rechazo:</b> <span class="font-mono text-slate-400">${pago.fecha_verificacion ? new Date(pago.fecha_verificacion).toLocaleString('es-VE') : 'N/A'}</span></p>
                            <div class="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300">
                                <b>Motivo del Rechazo:</b>
                                <p class="mt-1 font-sans text-xs">${pago.motivo_rechazo || 'Comprobante no válido o pago no recibido en la cuenta bancaria de la Alcaldía.'}</p>
                            </div>
                        </div>
                    `,
                    confirmButtonColor: '#e11d48'
                });
            }
        },

        imprimirRecibo: function(pagoId) {
            const store = global.HaciendaStore;
            const pagos = store ? (store.get('hacienda_pagos') || []) : [];
            const pago = pagos.find(p => String(p.id) === String(pagoId));
            const tipoLabel = pago && pago.tipo_pago === 'abono' ? 'Abono Parcial' : 'Cancelación Total';

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'info',
                    title: 'Recibo Oficial de Pago',
                    html: `
                        <div class="text-left text-xs space-y-2 text-slate-300 font-sans">
                            <p><b>N° Recibo:</b> <span class="font-mono text-amber-400 font-bold">${pago ? pago.numero_recibo : 'REC-PEND'}</span></p>
                            <p><b>Modalidad:</b> <span class="font-semibold text-slate-100">${tipoLabel}</span></p>
                            <p><b>Monto:</b> <span class="font-mono text-emerald-400 font-bold">${Number(pago ? pago.monto_bs : 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span></p>
                            <p><b>Referencia:</b> <span class="font-mono text-slate-300">${pago ? pago.referencia_bancaria : ''}</span></p>
                            <p><b>Destino:</b> <span class="text-slate-300">${pago ? pago.banco_destino : ''}</span></p>
                        </div>
                    `,
                    confirmButtonColor: '#0284c7'
                });
            }
        }
    };

    global.CajaModule = Caja;
})(typeof window !== 'undefined' ? window : this);
