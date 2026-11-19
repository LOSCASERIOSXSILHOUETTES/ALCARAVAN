/**
 * GUIRIRI SISTEMA HACIENDA V3 — Módulo Principal de Conciliación Bancaria
 * Control Diario y Mensual de Cuentas Recaudadoras de Hacienda Municipal.
 * Enlace con Smart Ledger (Banesco, BDV, BNC, Provincial, TXT).
 * Arquitectura SGB Silhouettes V3 (0ms Latencia, Offline-First, LocalForage).
 */
(function defineConciliacionModule(global) {
    "use strict";

    let currentCuentaId = 'all';
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth() + 1; // 1 - 12
    let activeDetalleDiaId = null;

    const MESES = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const Conciliacion = {
        getCurrentMonth: () => currentMonth,
        getCurrentYear: () => currentYear,
        getCurrentCuentaId: () => currentCuentaId,

        render: function(container) {
            const store = global.HaciendaStore;
            if (!store) {
                container.innerHTML = '<div class="p-8 text-center text-rose-400 font-mono">HaciendaStore no disponible</div>';
                return;
            }

            const cuentas = store.get('hacienda_cuentas') || [];
            const conciliaciones = store.get('hacienda_conciliacion') || [];
            const desgloses = store.get('hacienda_conciliacion_desglose') || [];
            const ramos = store.get('hacienda_ramos_ingreso') || [];

            // Filtrado de conciliaciones por cuenta, mes y anio
            const itemsFiltrados = conciliaciones.filter(c => {
                if (currentCuentaId !== 'all' && String(c.cuenta_id) !== String(currentCuentaId)) {
                    return false;
                }
                if (c.fecha) {
                    const partes = c.fecha.split('-');
                    if (partes.length === 3) {
                        const anio = parseInt(partes[0], 10);
                        const mes = parseInt(partes[1], 10);
                        if (anio !== currentYear || mes !== currentMonth) return false;
                    }
                }
                return true;
            }).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

            // Calculos KPI del mes filtrado
            let totalIngresosMes = 0;
            let totalEgresosMes = 0;
            let saldoActualBanco = 0;

            itemsFiltrados.forEach(c => {
                totalIngresosMes += Number(c.total_ingresos || 0);
                totalEgresosMes += Number(c.total_egresos || 0);
            });

            // Saldo actual total en todas las cuentas o cuenta seleccionada
            if (currentCuentaId === 'all') {
                saldoActualBanco = cuentas.reduce((acc, c) => acc + Number(c.saldo_actual || 0), 0);
            } else {
                const cAct = cuentas.find(c => String(c.id) === String(currentCuentaId));
                saldoActualBanco = cAct ? Number(cAct.saldo_actual || 0) : 0;
            }

            const diasConciliados = itemsFiltrados.length;

            container.innerHTML = `
                <div class="space-y-6">
                    <!-- Cabecera Principal y HUD -->
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div>
                            <h2 class="text-xl font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-balance-scale text-sky-400"></i>
                                Conciliación Bancaria y Recaudación
                            </h2>
                            <p class="text-xs text-slate-400 mt-1">
                                Control de extractos bancarios, pareo automático de transferencias de contribuyentes y cierre diario de caja.
                            </p>
                        </div>
                        <div class="flex items-center gap-3 w-full sm:w-auto">
                            <button onclick="window.HaciendaSmartLedger && window.HaciendaSmartLedger.abrirModal()" 
                                    class="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2">
                                <i class="fas fa-file-invoice text-sm"></i>
                                <span>Carga Mensual Rápida (Smart Ledger PDF)</span>
                            </button>
                            <button onclick="window.HaciendaConciliacion.abrirModalNuevoDia()" 
                                    class="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                                <i class="fas fa-plus text-xs"></i>
                                <span>Nuevo Día</span>
                            </button>
                        </div>
                    </div>

                    <!-- HUD Cards -->
                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                            <div>
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Bancos Disp.</span>
                                <div class="text-2xl font-black font-mono text-sky-400 mt-1">
                                    ${saldoActualBanco.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
                                </div>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 text-xl">
                                <i class="fas fa-university"></i>
                            </div>
                        </div>

                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                            <div>
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingresos Conciliados (Mes)</span>
                                <div class="text-2xl font-black font-mono text-emerald-400 mt-1">
                                    ${totalIngresosMes.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
                                </div>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
                                <i class="fas fa-arrow-down"></i>
                            </div>
                        </div>

                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                            <div>
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Comisiones / Débitos (Mes)</span>
                                <div class="text-2xl font-black font-mono text-rose-400 mt-1">
                                    ${totalEgresosMes.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
                                </div>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-xl">
                                <i class="fas fa-arrow-up"></i>
                            </div>
                        </div>

                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                            <div>
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Días Conciliados</span>
                                <div class="text-2xl font-black font-mono text-slate-100 mt-1">
                                    ${diasConciliados} días
                                </div>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xl">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Barra de Filtros (Cuentas, Mes, Anio) -->
                    <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                        <div class="flex flex-wrap items-center gap-3">
                            <!-- Selector de Cuenta -->
                            <div class="flex items-center gap-2">
                                <label class="text-xs font-bold text-slate-400 uppercase">Cuenta:</label>
                                <select onchange="window.HaciendaConciliacion.cambiarCuenta(this.value)" 
                                        class="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-sky-500">
                                    <option value="all" ${currentCuentaId === 'all' ? 'selected' : ''}>Todas las Cuentas</option>
                                    ${cuentas.map(c => `
                                        <option value="${c.id}" ${String(c.id) === String(currentCuentaId) ? 'selected' : ''}>
                                            ${c.banco_nombre || c.banco || 'Banco'} (${(c.numero_cuenta || c.numero || '0000').slice(-4)})
                                        </option>
                                    `).join('')}
                                </select>
                            </div>

                            <!-- Selector de Mes -->
                            <div class="flex items-center gap-2">
                                <label class="text-xs font-bold text-slate-400 uppercase">Mes:</label>
                                <select onchange="window.HaciendaConciliacion.cambiarMes(this.value)" 
                                        class="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-sky-500">
                                    ${MESES.map((m, idx) => `
                                        <option value="${idx + 1}" ${currentMonth === (idx + 1) ? 'selected' : ''}>${m}</option>
                                    `).join('')}
                                </select>
                            </div>

                            <!-- Input de Anio -->
                            <div class="flex items-center gap-2">
                                <label class="text-xs font-bold text-slate-400 uppercase">Año:</label>
                                <input type="number" value="${currentYear}" min="2020" max="2030" 
                                       onchange="window.HaciendaConciliacion.cambiarAnio(this.value)"
                                       class="w-20 bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-sky-500 font-mono">
                            </div>
                        </div>

                        <div class="flex items-center gap-2">
                            <button onclick="window.HaciendaConciliacion.exportarReporte()" 
                                    class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2">
                                <i class="fas fa-print text-xs"></i>
                                <span>Imprimir Resumen</span>
                            </button>
                        </div>
                    </div>

                    <!-- Tabla de Dias Conciliados -->
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <i class="fas fa-list-alt text-sky-400"></i>
                                Registro Diario de Conciliaciones (${MESES[currentMonth - 1]} ${currentYear})
                            </h3>
                            <span class="text-xs font-mono text-slate-500">${itemsFiltrados.length} registros</span>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr class="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                                        <th class="p-3.5">Fecha</th>
                                        <th class="p-3.5">Cuenta Bancaria</th>
                                        <th class="p-3.5 text-right">Saldo Inicial</th>
                                        <th class="p-3.5 text-right">Ingresos / Depósitos</th>
                                        <th class="p-3.5 text-right">Comisiones / Débitos</th>
                                        <th class="p-3.5 text-right">Saldo Final Banco</th>
                                        <th class="p-3.5 text-center">Movimientos</th>
                                        <th class="p-3.5 text-center">Estado</th>
                                        <th class="p-3.5 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/60">
                                    ${itemsFiltrados.length === 0 ? `
                                        <tr>
                                            <td colspan="9" class="p-12 text-center text-slate-500 font-mono">
                                                <i class="fas fa-folder-open text-3xl mb-3 block opacity-30"></i>
                                                No hay registros de conciliación bancaria para este período y cuenta.<br>
                                                Use "Carga Mensual Rápida (Smart Ledger PDF)" para procesar el extracto bancario automáticamente.
                                            </td>
                                        </tr>
                                    ` : itemsFiltrados.map(c => {
                                        const cta = cuentas.find(ct => String(ct.id) === String(c.cuenta_id));
                                        const movCount = desgloses.filter(d => String(d.conciliacion_id) === String(c.id)).length;
                                        const diff = Math.abs((Number(c.saldo_inicial || 0) + Number(c.total_ingresos || 0) - Number(c.total_egresos || 0)) - Number(c.saldo_final || 0));
                                        const esCuadrado = diff < 0.05;

                                        return `
                                            <tr class="hover:bg-slate-800/40 border-b border-slate-800/60 transition">
                                                <td class="p-3.5 font-mono font-bold text-slate-200">${c.fecha}</td>
                                                <td class="p-3.5 text-slate-300 font-medium">
                                                    ${cta ? `${cta.banco_nombre || cta.banco || 'Banco'} (${(cta.numero_cuenta || cta.numero || '0000').slice(-4)})` : 'Cuenta ID ' + c.cuenta_id}
                                                </td>
                                                <td class="p-3.5 text-right font-mono text-slate-400">
                                                    ${Number(c.saldo_inicial || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td class="p-3.5 text-right font-mono font-bold text-emerald-400">
                                                    +${Number(c.total_ingresos || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td class="p-3.5 text-right font-mono font-bold text-rose-400">
                                                    -${Number(c.total_egresos || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td class="p-3.5 text-right font-mono font-black text-sky-300">
                                                    ${Number(c.saldo_final || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td class="p-3.5 text-center font-mono">
                                                    <span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                                                        ${movCount} movs
                                                    </span>
                                                </td>
                                                <td class="p-3.5 text-center">
                                                    ${esCuadrado ? `
                                                        <span class="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                                                            Cuadrado
                                                        </span>
                                                    ` : `
                                                        <span class="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase" title="Diferencia: ${diff.toFixed(2)} Bs.">
                                                            Diferencia
                                                        </span>
                                                    `}
                                                </td>
                                                <td class="p-3.5 text-center">
                                                    <div class="flex items-center justify-center gap-1.5">
                                                        <button onclick="window.HaciendaConciliacion.verDetalleDia('${c.id}')" 
                                                                title="Ver Desglose de Movimientos" 
                                                                class="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition">
                                                            <i class="fas fa-search text-xs"></i>
                                                        </button>
                                                        <button onclick="window.HaciendaConciliacion.eliminarDia('${c.id}')" 
                                                                title="Eliminar Registro Diario" 
                                                                class="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition">
                                                            <i class="fas fa-trash-alt text-xs"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Modal Smart Ledger (Carga Mensual Rapida) -->
                    ${this.renderSmartLedgerModal(cuentas)}

                    <!-- Modal Detalle Desglose del Dia -->
                    <div id="hacienda-detalle-dia-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
                                <div>
                                    <h3 class="text-sm font-black text-slate-100 flex items-center gap-2">
                                        <i class="fas fa-list-ul text-sky-400"></i>
                                        Desglose de Movimientos del Día
                                    </h3>
                                    <p id="hacienda-detalle-dia-subtitulo" class="text-xs text-slate-400 mt-0.5"></p>
                                </div>
                                <button onclick="window.HaciendaConciliacion.cerrarModalDetalle()" class="text-slate-400 hover:text-slate-100 p-2">
                                    <i class="fas fa-times text-lg"></i>
                                </button>
                            </div>
                            <div class="flex-1 overflow-y-auto p-6">
                                <div id="hacienda-detalle-dia-contenido"></div>
                            </div>
                            <div class="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
                                <button onclick="window.HaciendaConciliacion.cerrarModalDetalle()" 
                                        class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition">
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Modal Registrar Dia Manual -->
                    <div id="hacienda-nuevo-dia-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
                                <h3 class="text-sm font-black text-slate-100 flex items-center gap-2">
                                    <i class="fas fa-calendar-plus text-sky-400"></i>
                                    Registrar Día de Conciliación
                                </h3>
                                <button onclick="window.HaciendaConciliacion.cerrarModalNuevoDia()" class="text-slate-400 hover:text-slate-100 p-2">
                                    <i class="fas fa-times text-lg"></i>
                                </button>
                            </div>
                            <div class="p-6 space-y-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Cuenta Bancaria:</label>
                                    <select id="nd-cuenta-id" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                                        ${cuentas.map(c => `<option value="${c.id}">${c.banco_nombre || c.banco || 'Banco'} (${c.numero_cuenta || c.numero || '0000'})</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Fecha (Día a Conciliar):</label>
                                    <input type="date" id="nd-fecha" value="${new Date().toISOString().split('T')[0]}" 
                                           class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500">
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Saldo Inicial (Bs):</label>
                                        <input type="number" step="0.01" id="nd-saldo-inicial" value="0.00" 
                                               class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500 font-mono">
                                    </div>
                                    <div>
                                        <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Saldo Final (Bs):</label>
                                        <input type="number" step="0.01" id="nd-saldo-final" value="0.00" 
                                               class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500 font-mono">
                                    </div>
                                </div>
                            </div>
                            <div class="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end gap-3">
                                <button onclick="window.HaciendaConciliacion.cerrarModalNuevoDia()" 
                                        class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition">
                                    Cancelar
                                </button>
                                <button onclick="window.HaciendaConciliacion.guardarNuevoDia()" 
                                        class="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition">
                                    Guardar Día
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderSmartLedgerModal: function(cuentas) {
            return `
                <div id="hacienda-sl-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
                        <!-- Modal Header -->
                        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
                            <div>
                                <h3 class="text-sm font-black text-slate-100 flex items-center gap-2">
                                    <i class="fas fa-file-invoice text-emerald-400"></i>
                                    Smart Ledger V8 — Carga y Pareo de Extractos Bancarios
                                </h3>
                                <p class="text-xs text-slate-400 mt-0.5">
                                    Procese estados de cuenta PDF/TXT de Banesco, BDV, BNC y Provincial con pareo heurístico a pagos de contribuyentes.
                                </p>
                            </div>
                            <button onclick="window.HaciendaSmartLedger && window.HaciendaSmartLedger.cerrarModal()" class="text-slate-400 hover:text-slate-100 p-2">
                                <i class="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        <!-- Parametros de Carga -->
                        <div class="p-6 border-b border-slate-800 bg-slate-900/60 grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Cuenta Recaudadora:</label>
                                <select id="sl-cuenta-select" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-emerald-500">
                                    ${cuentas.map(c => `<option value="${c.id}">${c.banco_nombre || c.banco || 'Banco'} (${(c.numero_cuenta || c.numero || '0000').slice(-4)})</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Mes a Conciliar:</label>
                                <select id="sl-mes-select" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-emerald-500">
                                    ${MESES.map((m, idx) => `<option value="${idx + 1}" ${currentMonth === (idx + 1) ? 'selected' : ''}>${m}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Año:</label>
                                <input type="number" id="sl-anio-input" value="${currentYear}" min="2020" max="2030" 
                                       class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-emerald-500 font-mono">
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase block mb-1.5">Parser / Formato Bancario:</label>
                                <select id="sl-parser-bank" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-emerald-500">
                                    <option value="banesco">Banesco (PDF)</option>
                                    <option value="bdv">Banco de Venezuela (PDF)</option>
                                    <option value="bnc">BNC Banco Nacional de Crédito (PDF)</option>
                                    <option value="provincial">BBVA Provincial (PDF)</option>
                                    <option value="txt">Extracto Plano (TXT)</option>
                                </select>
                            </div>
                        </div>

                        <!-- Dropzone Archivo -->
                        <div class="px-6 py-4 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div class="flex items-center gap-3 w-full sm:w-auto">
                                <label for="sl-file-upload" class="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-2">
                                    <i class="fas fa-file-pdf text-emerald-400"></i>
                                    <span>Seleccionar PDF o TXT Bancario</span>
                                </label>
                                <input type="file" id="sl-file-upload" accept=".pdf,.txt,.json" class="hidden" 
                                       onchange="window.HaciendaSmartLedger && window.HaciendaSmartLedger.procesarArchivo(this.files[0])">
                                <span class="text-xs text-slate-400">Arrastre o seleccione el extracto bancario descargado de la banca en línea.</span>
                            </div>
                        </div>

                        <!-- Area Bimembre: Lo del Banco vs Lo de Hacienda -->
                        <div class="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Lado Izquierdo: Lo del Banco -->
                            <div class="bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                                <div class="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                                    <span class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                        <i class="fas fa-university text-sky-400"></i>
                                        1. Lo del Banco (Líneas Extraídas)
                                    </span>
                                    <span id="sl-raw-count" class="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">0 filas</span>
                                </div>
                                <div class="flex-1 overflow-x-auto max-h-[380px]">
                                    <table class="w-full text-left border-collapse text-[11px]">
                                        <thead>
                                            <tr class="bg-slate-900 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                                                <th class="p-2.5">Fecha</th>
                                                <th class="p-2.5">Referencia</th>
                                                <th class="p-2.5">Descripción</th>
                                                <th class="p-2.5 text-right">Monto (Bs)</th>
                                            </tr>
                                        </thead>
                                        <tbody id="sl-raw-body" class="divide-y divide-slate-800/40 text-slate-300">
                                            <tr>
                                                <td colspan="4" class="p-8 text-center text-slate-500 font-mono">
                                                    Seleccione un extracto para iniciar el análisis.
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- Lado Derecho: Lo de Hacienda (Pareo y Ramo) -->
                            <div class="bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                                <div class="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                                    <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                        <i class="fas fa-link text-emerald-400"></i>
                                        2. Lo de Hacienda (Pareo y Clasificación)
                                    </span>
                                    <span id="sl-proc-count" class="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400">0 ítems</span>
                                </div>
                                <div class="flex-1 overflow-x-auto max-h-[380px]">
                                    <table class="w-full text-left border-collapse text-[11px]">
                                        <thead>
                                            <tr class="bg-slate-900 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                                                <th class="p-2.5">Ref / Fecha</th>
                                                <th class="p-2.5">Contribuyente / Pago</th>
                                                <th class="p-2.5">Ramo de Ingreso</th>
                                                <th class="p-2.5 text-center">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody id="sl-processed-body" class="divide-y divide-slate-800/40 text-slate-300">
                                            <tr>
                                                <td colspan="4" class="p-8 text-center text-slate-500 font-mono">
                                                    Esperando procesamiento...
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- Footer con Totales y Boton Inyectar -->
                        <div class="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div class="flex items-center gap-6 text-xs font-mono">
                                <div>
                                    <span class="text-slate-400">Total Ingresos:</span>
                                    <span id="sl-tot-ingresos" class="font-bold text-emerald-400 ml-1">0.00 Bs.</span>
                                </div>
                                <div>
                                    <span class="text-slate-400">Total Comisiones:</span>
                                    <span id="sl-tot-egresos" class="font-bold text-rose-400 ml-1">0.00 Bs.</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-3 w-full sm:w-auto">
                                <button onclick="window.HaciendaSmartLedger && window.HaciendaSmartLedger.cerrarModal()" 
                                        class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition">
                                    Cancelar
                                </button>
                                <button onclick="window.HaciendaSmartLedger && window.HaciendaSmartLedger.inyectarConciliacion()" 
                                        class="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2">
                                    <i class="fas fa-check-double text-xs"></i>
                                    <span>Inyectar Conciliación a Hacienda</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        cambiarCuenta: function(cuentaId) {
            currentCuentaId = cuentaId;
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        cambiarMes: function(mes) {
            currentMonth = parseInt(mes, 10);
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        cambiarAnio: function(anio) {
            currentYear = parseInt(anio, 10);
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        verDetalleDia: function(conciliacionId) {
            const store = global.HaciendaStore;
            if (!store) return;

            const conciliaciones = store.get('hacienda_conciliacion') || [];
            const desgloses = store.get('hacienda_conciliacion_desglose') || [];
            const cuentas = store.get('hacienda_cuentas') || [];
            const ramos = store.get('hacienda_ramos_ingreso') || [];

            const dia = conciliaciones.find(c => String(c.id) === String(conciliacionId));
            if (!dia) return;

            const cta = cuentas.find(c => String(c.id) === String(dia.cuenta_id));
            const items = desgloses.filter(d => String(d.conciliacion_id) === String(conciliacionId));

            const subtitulo = document.getElementById('hacienda-detalle-dia-subtitulo');
            if (subtitulo) {
                const nombreBanco = cta ? (cta.banco_nombre || cta.banco || 'Banco') : 'N/A';
                subtitulo.innerText = `Fecha: ${dia.fecha} | Cuenta: ${nombreBanco} | Inicial: ${Number(dia.saldo_inicial||0).toFixed(2)} Bs. | Final: ${Number(dia.saldo_final||0).toFixed(2)} Bs.`;
            }

            const contenido = document.getElementById('hacienda-detalle-dia-contenido');
            if (contenido) {
                contenido.innerHTML = `
                    <div class="space-y-4">
                        <div class="overflow-x-auto border border-slate-800 rounded-xl">
                            <table class="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr class="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                                        <th class="p-3">Tipo</th>
                                        <th class="p-3">Referencia</th>
                                        <th class="p-3">Descripción</th>
                                        <th class="p-3">Ramo Presupuestario</th>
                                        <th class="p-3 text-right">Monto (Bs)</th>
                                        <th class="p-3 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/40 text-slate-300">
                                    ${items.length === 0 ? `
                                        <tr>
                                            <td colspan="6" class="p-8 text-center text-slate-500 font-mono">
                                                No hay movimientos detallados asociados a este día.
                                            </td>
                                        </tr>
                                    ` : items.map(it => {
                                        const esIngreso = it.tipo === 'ingreso' || it.monto > 0;
                                        const ramo = ramos.find(r => r.codigo === it.ramo_codigo);
                                        return `
                                            <tr class="hover:bg-slate-800/30 transition">
                                                <td class="p-3">
                                                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${esIngreso ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
                                                        ${esIngreso ? 'Ingreso' : 'Comisión/Gasto'}
                                                    </span>
                                                </td>
                                                <td class="p-3 font-mono font-bold text-sky-400">${it.referencia || 'N/A'}</td>
                                                <td class="p-3">${it.descripcion || 'Sin concepto'}</td>
                                                <td class="p-3 text-slate-400">${ramo ? ramo.denominacion : (it.ramo_codigo || 'General')}</td>
                                                <td class="p-3 text-right font-mono font-bold ${esIngreso ? 'text-emerald-400' : 'text-rose-400'}">
                                                    ${Number(it.monto || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td class="p-3 text-center">
                                                    <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                                                        ${it.estado || 'conciliado'}
                                                    </span>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }

            const modal = document.getElementById('hacienda-detalle-dia-modal');
            if (modal) modal.classList.remove('hidden');
        },

        cerrarModalDetalle: function() {
            const modal = document.getElementById('hacienda-detalle-dia-modal');
            if (modal) modal.classList.add('hidden');
        },

        abrirModalNuevoDia: function() {
            const modal = document.getElementById('hacienda-nuevo-dia-modal');
            if (modal) modal.classList.remove('hidden');
        },

        cerrarModalNuevoDia: function() {
            const modal = document.getElementById('hacienda-nuevo-dia-modal');
            if (modal) modal.classList.add('hidden');
        },

        guardarNuevoDia: async function() {
            const store = global.HaciendaStore;
            if (!store) return;

            const cuentaId = document.getElementById('nd-cuenta-id').value;
            const fecha = document.getElementById('nd-fecha').value;
            const saldoInicial = parseFloat(document.getElementById('nd-saldo-inicial').value || 0);
            const saldoFinal = parseFloat(document.getElementById('nd-saldo-final').value || 0);

            if (!fecha || !cuentaId) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Campos requeridos',
                        text: 'Seleccione fecha y cuenta bancaria.',
                        confirmButtonColor: '#0284c7'
                    });
                }
                return;
            }

            const nuevoRegistro = {
                id: Date.now(),
                cuenta_id: cuentaId,
                fecha: fecha,
                saldo_inicial: saldoInicial,
                total_ingresos: 0,
                total_egresos: 0,
                saldo_final: saldoFinal,
                estado: 'conciliado'
            };

            await store.set('hacienda_conciliacion', nuevoRegistro);
            this.cerrarModalNuevoDia();

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Día registrado',
                    text: 'Registro de conciliación guardado exitosamente.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }

            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        eliminarDia: async function(diaId) {
            const store = global.HaciendaStore;
            if (!store) return;

            const confirmar = typeof Swal !== 'undefined' ? await Swal.fire({
                icon: 'warning',
                title: '¿Eliminar día de conciliación?',
                text: 'Se eliminará el registro diario y todos sus movimientos asociados.',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#334155',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }) : { isConfirmed: true };

            if (!confirmar.isConfirmed) return;

            // Purgar desgloses asociados
            const desgloses = store.get('hacienda_conciliacion_desglose') || [];
            const hijos = desgloses.filter(d => String(d.conciliacion_id) === String(diaId));
            for (const h of hijos) {
                await store.remove('hacienda_conciliacion_desglose', h.id);
            }

            // Purgar registro padre
            await store.remove('hacienda_conciliacion', diaId);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'Día de conciliación purgado satisfactoriamente.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }

            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        exportarReporte: function() {
            window.print();
        }
    };

    global.HaciendaConciliacion = Conciliacion;
})(typeof window !== 'undefined' ? window : this);
