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
            const cuentasBancarias = (global.HaciendaStore ? global.HaciendaStore.get('hacienda_cuentas') : [])
                .filter(c => c.estado !== 'inactiva');

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
                                    ${this.generarFilasTabla(pagos, contribuyentes)}
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
                                        return `<option value="${d.id}" data-monto="${d.impuesto_determinado_bs}" data-contribuyente="${d.contribuyente_id}">
                                            Mes ${d.mes}/${d.anio} - ${c ? c.razon_social : ''} (${Number(d.impuesto_determinado_bs).toLocaleString('es-VE')} Bs.)
                                        </option>`;
                                    }).join('')}
                                </select>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Banco Destino (Alcaldía)</label>
                                    <select id="pago-banco-destino" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none">
                                        ${cuentasBancarias.length === 0 ? `
                                            <option value="Banco de Venezuela - Cta Recaudadora">Banco de Venezuela (Cta. Recaudadora)</option>
                                        ` : cuentasBancarias.map(c => `
                                            <option value="${c.banco} (${c.numero ? c.numero.slice(-4) : ''})">
                                                ${c.banco} (${c.numero ? c.numero.slice(-4) : ''}) — ${c.concepto || 'Recaudación'}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Método de Pago</label>
                                    <select id="pago-metodo" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none">
                                        <option value="transferencia">Transferencia Bancaria</option>
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

        generarFilasTabla: function(pagos, contribuyentes) {
            if (!pagos || pagos.length === 0) {
                return `<tr><td colspan="7" class="py-8 text-center text-slate-500 italic">No hay pagos registrados en taquilla aún.</td></tr>`;
            }

            return pagos.map(p => {
                const c = contribuyentes.find(item => String(item.id) === String(p.contribuyente_id));
                const isConciliado = p.estado === 'conciliado';

                return `
                    <tr class="hover:bg-slate-800/40 transition">
                        <td class="py-3 px-4 font-mono font-bold text-amber-400">${p.numero_recibo || 'REC-PEND'}</td>
                        <td class="py-3 px-4">
                            <div class="font-bold text-slate-200">${c ? c.razon_social : 'ID: ' + p.contribuyente_id}</div>
                            <div class="text-[11px] font-mono text-slate-400">${c ? c.rif : ''}</div>
                        </td>
                        <td class="py-3 px-4 text-slate-300">
                            <div>${p.banco_destino}</div>
                            <div class="text-[11px] font-mono text-slate-500">Ref: ${p.referencia_bancaria}</div>
                        </td>
                        <td class="py-3 px-4 font-mono text-slate-300">${p.fecha_pago}</td>
                        <td class="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                            ${Number(p.monto_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isConciliado ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
                                ${(p.estado || 'pendiente').toUpperCase()}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-right space-x-2">
                            ${!isConciliado ? `
                                <button onclick="window.CajaModule.conciliarPago(${p.id})" class="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-semibold transition" title="Conciliar y Validar">
                                    <i class="fas fa-check"></i> Validar
                                </button>
                            ` : `
                                <button onclick="window.CajaModule.imprimirRecibo(${p.id})" class="px-2.5 py-1 bg-sky-600/20 hover:bg-sky-600/40 text-sky-400 border border-sky-500/30 rounded-lg text-[11px] font-semibold transition" title="Imprimir Recibo">
                                    <i class="fas fa-print"></i> Recibo
                                </button>
                            `}
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

                const nuevoPago = {
                    numero_recibo: numRecibo,
                    contribuyente_id: contribuyenteId,
                    declaracion_id: declaracionId,
                    banco_origen: 'Transferencia Bancaria',
                    banco_destino: document.getElementById('pago-banco-destino').value,
                    referencia_bancaria: document.getElementById('pago-referencia').value.trim(),
                    fecha_pago: document.getElementById('pago-fecha').value,
                    monto_bs: parseFloat(document.getElementById('pago-monto').value),
                    comprobante_url: compUrl,
                    metodo: document.getElementById('pago-metodo').value,
                    estado: 'conciliado', // Auto-conciliado en taquilla
                    verificado_por: 'Taquilla Hacienda',
                    fecha_verificacion: new Date().toISOString()
                };

                await global.HaciendaStore.set('hacienda_pagos', nuevoPago);

                // Actualizar estatus de la declaración a 'pagada'
                const declaraciones = global.HaciendaStore.get('hacienda_declaraciones');
                const dec = declaraciones.find(d => String(d.id) === String(declaracionId));
                if (dec) {
                    dec.estado = 'pagada';
                    await global.HaciendaStore.set('hacienda_declaraciones', dec);
                }

                this.cerrarModalPago();

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Pago Conciliado',
                        text: 'Recibo oficial emitido con éxito: ' + numRecibo,
                        confirmButtonColor: '#d97706',
                        timer: 2000,
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
            const pagos = global.HaciendaStore.get('hacienda_pagos');
            const pago = pagos.find(p => String(p.id) === String(pagoId));
            if (!pago) return;

            pago.estado = 'conciliado';
            pago.fecha_verificacion = new Date().toISOString();
            await global.HaciendaStore.set('hacienda_pagos', pago);

            // Actualizar declaración si existe
            if (pago.declaracion_id) {
                const declaraciones = global.HaciendaStore.get('hacienda_declaraciones');
                const dec = declaraciones.find(d => String(d.id) === String(pago.declaracion_id));
                if (dec) {
                    dec.estado = 'pagada';
                    await global.HaciendaStore.set('hacienda_declaraciones', dec);
                }
            }
        },

        imprimirRecibo: function(pagoId) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'info',
                    title: 'Recibo de Pago',
                    text: 'Recibo oficial disponible para impresión.',
                    confirmButtonColor: '#0284c7'
                });
            }
        }
    };

    global.CajaModule = Caja;
})(typeof window !== 'undefined' ? window : this);
