/**
 * GUIRIRI SISTEMA HACIENDA V3 — Smart Ledger V8 (Carga Mensual de Extractos Bancarios en PDF)
 * Refinería bimembre ("Lo del Banco" vs "Lo de Hacienda"), pareo inteligente con pagos de contribuyentes,
 * inyección a 0ms en LocalForage y Store.
 * Arquitectura SGB Silhouettes V3 (0ms Latencia, Offline-First)
 */
(function defineHaciendaSmartLedger(global) {
    "use strict";

    let slRawData = [];
    let slProcessedData = [];
    let slSaldoInicialMes = 0;

    function formatBs(num) {
        const val = Number(num) || 0;
        return val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Cargar "Lo de Hacienda" desde la base de datos local para el período y cuenta seleccionados (Sandbox)
    function loadSandboxData() {
        const slMes = document.getElementById('sl-mes-select');
        const slAnio = document.getElementById('sl-anio-input');
        const slCuenta = document.getElementById('sl-cuenta-select');

        const year = slAnio ? parseInt(slAnio.value, 10) : new Date().getFullYear();
        const month = slMes ? parseInt(slMes.value, 10) : (new Date().getMonth() + 1);
        const cuentaId = slCuenta ? slCuenta.value : 'all';

        if (!cuentaId || cuentaId === 'all') {
            slProcessedData = [];
            renderSlProcessed();
            return;
        }

        slProcessedData = [];
        const store = global.HaciendaStore;
        const allConcil = store ? store.get('hacienda_conciliacion') : [];
        const allDesglose = store ? store.get('hacienda_conciliacion_desglose') : [];
        const allPagos = store ? store.get('hacienda_pagos') : [];
        const allContrib = store ? store.get('hacienda_contribuyentes') : [];

        const daysInMonth = new Date(year, month, 0).getDate();
        let registrosCargados = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const fechaStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const concilDia = allConcil.find(c => c.fecha === fechaStr && String(c.cuenta_id) === String(cuentaId));

            let itemsDelDia = [];

            if (concilDia) {
                const desgloses = allDesglose.filter(dg => String(dg.conciliacion_id) === String(concilDia.id));
                desgloses.forEach(item => {
                    const esEntrada = item.tipo === 'ingreso';
                    const pagoAsoc = item.pago_id ? allPagos.find(p => String(p.id) === String(item.pago_id)) : null;
                    const contribAsoc = pagoAsoc ? allContrib.find(c => String(c.id) === String(pagoAsoc.contribuyente_id)) : null;

                    itemsDelDia.push({
                        id: 'db_' + item.id,
                        db_id: item.id,
                        rawId: null,
                        fecha: fechaStr,
                        referencia: item.referencia || '',
                        concepto: item.descripcion || (contribAsoc ? `${contribAsoc.razon_social} - Recibo #${pagoAsoc?.numero_recibo || ''}` : (esEntrada ? 'Recaudación Tributaria' : 'Comisión Bancaria')),
                        tipo: item.tipo,
                        ramo_id: item.categoria || 'Recaudación Tributaria',
                        pago_id: item.pago_id || null,
                        monto: parseFloat(item.monto) || 0,
                        esEntrada: esEntrada
                    });
                });
            }

            if (itemsDelDia.length > 0) {
                slProcessedData.push(...itemsDelDia);
                registrosCargados += itemsDelDia.length;
            }
        }

        renderSlProcessed();
    }

    const toggleMonthlyModal = (show) => {
        const modalMonthly = document.getElementById('hacienda-sl-modal');
        if (!modalMonthly) return;
        if (show) {
            modalMonthly.classList.remove('hidden');
            modalMonthly.classList.add('flex');

            const currentMonth = (global.HaciendaConciliacion && global.HaciendaConciliacion.getCurrentMonth) ? global.HaciendaConciliacion.getCurrentMonth() : (new Date().getMonth() + 1);
            const currentYear = (global.HaciendaConciliacion && global.HaciendaConciliacion.getCurrentYear) ? global.HaciendaConciliacion.getCurrentYear() : new Date().getFullYear();
            const currentCuentaId = (global.HaciendaConciliacion && global.HaciendaConciliacion.getCurrentCuentaId) ? global.HaciendaConciliacion.getCurrentCuentaId() : '';

            const slMes = document.getElementById('sl-mes-select');
            const slAnio = document.getElementById('sl-anio-input');
            const slCuenta = document.getElementById('sl-cuenta-select');
            if (slMes) slMes.value = currentMonth;
            if (slAnio) slAnio.value = currentYear;
            if (slCuenta && currentCuentaId) slCuenta.value = currentCuentaId;

            renderSlRaw();
            loadSandboxData();
        } else {
            modalMonthly.classList.add('hidden');
            modalMonthly.classList.remove('flex');
        }
    };

    async function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const parserType = document.getElementById('sl-parser-bank').value;
        if (global.Swal) {
            global.Swal.fire({
                title: 'Destripando extracto bancario...',
                html: 'Extrayendo créditos de recaudación y débitos...',
                allowOutsideClick: false,
                didOpen: () => global.Swal.showLoading()
            });
        }

        try {
            let dataResult = [];
            const parsers = global.HaciendaConcilParsers ? global.HaciendaConcilParsers.bankParsers : {};
            const adapter = global.HaciendaConcilParsers ? global.HaciendaConcilParsers.slUniversalAdapter : null;

            if (parserType === 'json') {
                const text = await file.text();
                dataResult = JSON.parse(text);
            } else if (parserType === 'txt') {
                const text = await file.text();
                dataResult = parsers.txt ? parsers.txt(text) : [];
            } else {
                if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
                    throw new Error("Debe seleccionar un archivo PDF de su banco.");
                }
                if (!global.pdfjsLib) throw new Error("Librería PDF.js no disponible.");

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await global.pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;

                if (parsers[parserType]) {
                    dataResult = await parsers[parserType](pdf);
                } else {
                    throw new Error("Parser no implementado para este banco.");
                }
            }

            slRawData = adapter ? adapter(dataResult) : dataResult;
            renderSlRaw();

            if (global.Swal) {
                global.Swal.fire({
                    icon: 'success',
                    title: '¡Extracto Analizado!',
                    text: `Se detectaron ${slRawData.length} movimientos en el PDF bancario. Ahora puedes pasarlos al panel de Hacienda.`,
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            console.error('[Hacienda SmartLedger] Error parseando extracto:', err);
            if (global.Swal) {
                global.Swal.fire({
                    icon: 'error',
                    title: 'Error de Lectura',
                    text: err.message || 'No se pudo procesar el archivo bancario.'
                });
            }
        } finally {
            e.target.value = '';
        }
    }

    // Renderizar Panel Izquierdo: Lo del Banco
    function renderSlRaw() {
        const tbody = document.getElementById('sl-raw-body');
        const countEl = document.getElementById('sl-raw-count');
        if (!tbody) return;

        if (countEl) countEl.textContent = `${slRawData.length} movimientos`;

        if (slRawData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-12 text-slate-500 font-sans text-xs">
                        <i class="fas fa-file-pdf text-3xl opacity-30 mb-2 block"></i>
                        Selecciona el banco y sube el archivo PDF para extraer las transferencias y depósitos.
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        slRawData.forEach((item, index) => {
            const rowClass = item.procesado ? 'opacity-35 bg-slate-950/40 line-through' : (item.selected ? 'bg-sky-950/20' : '');
            html += `
                <tr class="hover:bg-slate-800/40 transition-colors ${rowClass}">
                    <td class="p-1.5 text-center">
                        <input type="checkbox" ${item.selected ? 'checked' : ''} ${item.procesado ? 'disabled' : ''} onchange="window.HaciendaSmartLedger.toggleSlRawItem(${index}, this.checked)" class="rounded bg-slate-800 border-slate-700 text-sky-500 cursor-pointer">
                    </td>
                    <td class="p-1.5 font-bold text-slate-300 font-mono text-[11px]">${item.fecha}</td>
                    <td class="p-1.5 text-slate-400 truncate max-w-[70px] font-mono text-[11px]">${item.referencia}</td>
                    <td class="p-1.5 text-slate-300 truncate max-w-[140px] text-xs" title="${item.descripcion}">${item.descripcion}</td>
                    <td class="p-1.5 text-right text-rose-400 font-bold font-mono text-xs">${item.salida > 0 ? formatBs(item.salida) : '-'}</td>
                    <td class="p-1.5 text-right text-emerald-400 font-bold font-mono text-xs">${item.entrada > 0 ? formatBs(item.entrada) : '-'}</td>
                    <td class="p-1.5 text-right text-sky-400 font-mono text-xs">${item.saldo > 0 ? formatBs(item.saldo) : '-'}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }

    function toggleSlRawItem(index, isChecked) {
        if (slRawData[index]) {
            slRawData[index].selected = isChecked;
        }
    }

    function esComisionBancaria(descripcion) {
        const desc = String(descripcion || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase();
        if (!desc) return false;
        return (
            desc.includes('COMISION') ||
            desc.includes('MANTENIMIENTO') ||
            desc.includes('SERV.MTTO') ||
            desc.includes('DEBITO BANCARIO') ||
            desc.includes('EMISION ESTADO CUENTA') ||
            desc.includes('USO PUNTO DE VENTA') ||
            /\b(COM|COMIS|COMI|COBCOM|ITF|IGTF|IVA|POS)\b/.test(desc)
        );
    }

    // Pasar Selección de "Lo del Banco" a "Lo de Hacienda" con Auto-Matching
    function slMoveSelectedToRefinery() {
        const store = global.HaciendaStore;
        const pagos = store ? store.get('hacienda_pagos') : [];
        const contribuyentes = store ? store.get('hacienda_contribuyentes') : [];
        const verifHeuristica = global.HaciendaConcilParsers ? global.HaciendaConcilParsers.verificarMatchHeuristico : null;
        const slCuenta = document.getElementById('sl-cuenta-select');
        const currentCuentaId = slCuenta ? slCuenta.value : '';

        let emparejados = 0;
        let transferidos = 0;

        slRawData.forEach(rawItem => {
            if (!rawItem.procesado && rawItem.selected) {
                rawItem.procesado = true;
                const esEntrada = rawItem.entrada > 0;
                const tipo = esEntrada ? 'ingreso' : (esComisionBancaria(rawItem.descripcion) ? 'comision' : 'egreso');

                let matchedPagoId = null;
                let conceptoSugerido = rawItem.descripcion;
                let categoriaSugerida = esEntrada ? 'Recaudación Tributaria' : 'Comisión Bancaria';

                // Intentar Auto-Pareo con hacienda_pagos pendientes si es ingreso
                if (esEntrada && verifHeuristica) {
                    const match = pagos.find(p => {
                        if (p.estado === 'conciliado') return false;
                        if (p.cuenta_id && currentCuentaId && currentCuentaId !== 'all' && String(p.cuenta_id) !== String(currentCuentaId)) {
                            return false;
                        }
                        const v = verifHeuristica(rawItem, p);
                        return v.perfectMatch || (v.isMontoMatch && v.isRefMatch);
                    });

                    if (match) {
                        matchedPagoId = match.id;
                        emparejados++;
                        const contrib = contribuyentes.find(c => String(c.id) === String(match.contribuyente_id));
                        conceptoSugerido = `${contrib ? contrib.razon_social : 'Contribuyente'} · Recibo ${match.numero_recibo || ''} [AUTO-PAREADO]`;
                        categoriaSugerida = 'Actividades Económicas (LOCAT)';
                    }
                }

                slProcessedData.push({
                    id: 'proc_' + Math.random().toString(36).substr(2, 9),
                    rawId: rawItem.id,
                    fecha: rawItem.fecha,
                    referencia: rawItem.referencia === 'S/R' ? '' : rawItem.referencia,
                    concepto: conceptoSugerido,
                    tipo: tipo,
                    ramo_id: categoriaSugerida,
                    pago_id: matchedPagoId,
                    monto: esEntrada ? rawItem.entrada : rawItem.salida,
                    esEntrada: esEntrada,
                    selected: true
                });
                transferidos++;
            }
        });

        renderSlRaw();
        renderSlProcessed();

        if (global.Swal && transferidos > 0) {
            const Toast = global.Swal.mixin({ toast: true, position: 'bottom-end', showConfirmButton: false, timer: 2200 });
            Toast.fire({
                icon: 'success',
                title: `${transferidos} movimientos pasados a Hacienda (${emparejados} auto-pareados)`
            });
        }
    }

    // Renderizar Panel Derecho: Lo de Hacienda
    function renderSlProcessed() {
        const tbody = document.getElementById('sl-processed-body');
        const countEl = document.getElementById('sl-proc-count');
        const totIngEl = document.getElementById('sl-tot-ingresos');
        const totEgrEl = document.getElementById('sl-tot-egresos');
        if (!tbody) return;

        let totalIng = 0;
        let totalEgr = 0;

        if (countEl) countEl.textContent = `${slProcessedData.length} partidas`;

        if (slProcessedData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-12 text-slate-500 font-sans text-xs">
                        <i class="fas fa-layer-group text-3xl opacity-30 mb-2 block"></i>
                        No hay movimientos clasificados para Hacienda. Pasa partidas desde "Lo del Banco" o agrega manualmente.
                    </td>
                </tr>
            `;
            if (totIngEl) totIngEl.textContent = '0,00';
            if (totEgrEl) totEgrEl.textContent = '0,00';
            return;
        }

        const store = global.HaciendaStore;
        const ramos = store ? store.get('hacienda_ramos_ingreso') : [];

        let html = '';
        slProcessedData.forEach((item, index) => {
            const m = parseFloat(item.monto) || 0;
            if (item.tipo === 'ingreso') totalIng += m;
            else totalEgr += m;

            const isPareado = Boolean(item.pago_id);

            html += `
                <tr class="hover:bg-slate-800/40 transition-colors ${isPareado ? 'bg-emerald-950/20' : ''}" data-proc-idx="${index}">
                    <td class="p-1.5 text-center">
                        <input type="checkbox" ${item.selected ? 'checked' : ''} onchange="window.HaciendaSmartLedger.toggleSlProcItem(${index}, this.checked)" class="rounded bg-slate-800 border-slate-700 text-sky-500 cursor-pointer">
                    </td>
                    <td class="p-1 font-mono text-[11px] text-slate-300">
                        <input type="date" value="${item.fecha}" onchange="window.HaciendaSmartLedger.updateSlProcField(${index}, 'fecha', this.value)" class="bg-transparent border-none text-slate-200 outline-none w-24 cursor-pointer">
                    </td>
                    <td class="p-1">
                        <input type="text" value="${item.referencia}" placeholder="Ref..." onchange="window.HaciendaSmartLedger.updateSlProcField(${index}, 'referencia', this.value)" class="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-300 outline-none">
                    </td>
                    <td class="p-1">
                        <div class="flex items-center gap-1.5">
                            <input type="text" value="${item.concepto}" onchange="window.HaciendaSmartLedger.updateSlProcField(${index}, 'concepto', this.value)" class="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 outline-none">
                            ${isPareado ? `<span class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 whitespace-nowrap" title="Vinculado a contribuyente">Pareado</span>` : ''}
                        </div>
                    </td>
                    <td class="p-1">
                        <select onchange="window.HaciendaSmartLedger.updateSlProcField(${index}, 'tipo', this.value)" class="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-slate-300 outline-none font-bold">
                            <option value="ingreso" ${item.tipo === 'ingreso' ? 'selected' : ''}>Ingreso (+)</option>
                            <option value="comision" ${item.tipo === 'comision' ? 'selected' : ''}>Comisión (-)</option>
                            <option value="egreso" ${item.tipo === 'egreso' ? 'selected' : ''}>Egreso (-)</option>
                        </select>
                    </td>
                    <td class="p-1">
                        <select onchange="window.HaciendaSmartLedger.updateSlProcField(${index}, 'ramo_id', this.value)" class="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-slate-300 outline-none max-w-[130px] truncate">
                            <option value="Recaudación Tributaria" ${item.ramo_id === 'Recaudación Tributaria' ? 'selected' : ''}>Recaudación General</option>
                            ${ramos.map(r => `<option value="${r.nombre}" ${item.ramo_id === r.nombre ? 'selected' : ''}>${r.nombre}</option>`).join('')}
                            <option value="Comisiones Bancarias" ${item.ramo_id === 'Comisiones Bancarias' ? 'selected' : ''}>Comisiones Bancarias</option>
                        </select>
                    </td>
                    <td class="p-1">
                        <input type="number" step="0.01" value="${item.monto}" onchange="window.HaciendaSmartLedger.updateSlProcField(${index}, 'monto', this.value)" class="w-20 bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-right font-mono text-xs font-bold ${item.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'} outline-none">
                    </td>
                    <td class="p-1 text-center">
                        <button type="button" onclick="window.HaciendaSmartLedger.deleteSlProcRow(${index})" class="text-rose-400 hover:text-rose-300 text-xs p-1" title="Quitar de Hacienda">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        if (totIngEl) totIngEl.textContent = formatBs(totalIng);
        if (totEgrEl) totEgrEl.textContent = formatBs(totalEgr);
    }

    function toggleSlProcItem(index, isChecked) {
        if (slProcessedData[index]) {
            slProcessedData[index].selected = isChecked;
        }
    }

    function updateSlProcField(index, field, value) {
        if (!slProcessedData[index]) return;
        if (field === 'monto') {
            slProcessedData[index].monto = parseFloat(value) || 0;
            renderSlProcessed();
        } else {
            slProcessedData[index][field] = value;
        }
    }

    function deleteSlProcRow(index) {
        const item = slProcessedData[index];
        if (item && item.rawId) {
            const raw = slRawData.find(r => r.id === item.rawId);
            if (raw) raw.procesado = false;
        }
        slProcessedData.splice(index, 1);
        renderSlRaw();
        renderSlProcessed();
    }

    // Inyectar a LocalForage a 0ms (Guardado Atómico de la Conciliación)
    async function guardarSmartLedgerEnDB() {
        if (slProcessedData.length === 0) {
            if (global.Swal) global.Swal.fire({ icon: 'warning', title: 'Sin Movimientos', text: 'Pasa movimientos a "Lo de Hacienda" antes de inyectar.' });
            return;
        }

        const slCuenta = document.getElementById('sl-cuenta-select');
        const cuentaId = slCuenta ? slCuenta.value : '';
        if (!cuentaId) {
            if (global.Swal) global.Swal.fire({ icon: 'warning', title: 'Cuenta Requerida', text: 'Selecciona la cuenta bancaria de destino.' });
            return;
        }

        if (global.Swal) {
            const confirm = await global.Swal.fire({
                title: '¿Inyectar Conciliación?',
                text: `Se registrarán y conciliarán ${slProcessedData.length} partidas en la cuenta bancaria.`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#475569',
                confirmButtonText: 'Sí, inyectar ahora',
                cancelButtonText: 'Cancelar'
            });
            if (!confirm.isConfirmed) return;
        }

        try {
            const store = global.HaciendaStore;
            const allConcil = store ? store.get('hacienda_conciliacion') : [];
            const allDesglose = store ? store.get('hacienda_conciliacion_desglose') : [];
            const allPagos = store ? store.get('hacienda_pagos') : [];
            const allDecs = store ? store.get('hacienda_declaraciones') : [];

            // Agrupar por fecha
            const agrupadosPorFecha = new Map();
            slProcessedData.forEach(p => {
                if (!p.fecha) return;
                if (!agrupadosPorFecha.has(p.fecha)) agrupadosPorFecha.set(p.fecha, []);
                agrupadosPorFecha.get(p.fecha).push(p);
            });

            let pagosConciliadosTotal = 0;

            for (const [fecha, items] of agrupadosPorFecha.entries()) {
                let concilDia = allConcil.find(c => c.fecha === fecha && String(c.cuenta_id) === String(cuentaId));
                
                let totIng = items.filter(it => it.tipo === 'ingreso').reduce((sum, it) => sum + (parseFloat(it.monto) || 0), 0);
                let totEgr = items.filter(it => it.tipo !== 'ingreso').reduce((sum, it) => sum + (parseFloat(it.monto) || 0), 0);

                if (!concilDia) {
                    concilDia = {
                        id: Date.now() + Math.floor(Math.random() * 1000),
                        cuenta_id: parseInt(cuentaId, 10),
                        fecha: fecha,
                        saldo_inicial: 0,
                        total_ingresos: totIng,
                        total_egresos: totEgr,
                        saldo_final: totIng - totEgr,
                        estado: 'conciliado'
                    };
                    await store.set('hacienda_conciliacion', concilDia);
                } else {
                    // Purgar desgloses previos de este día para evitar duplicación
                    const viejos = allDesglose.filter(dg => String(dg.conciliacion_id) === String(concilDia.id));
                    for (const v of viejos) {
                        await store.remove('hacienda_conciliacion_desglose', v.id);
                    }
                    concilDia.total_ingresos = totIng;
                    concilDia.total_egresos = totEgr;
                    concilDia.saldo_final = (parseFloat(concilDia.saldo_inicial) || 0) + totIng - totEgr;
                    await store.set('hacienda_conciliacion', concilDia);
                }

                // Inyectar desgloses nuevos
                for (const item of items) {
                    const desgloseRecord = {
                        id: Date.now() + Math.floor(Math.random() * 10000),
                        conciliacion_id: concilDia.id,
                        cuenta_id: parseInt(cuentaId, 10),
                        fecha: item.fecha,
                        tipo: item.tipo,
                        referencia: item.referencia,
                        descripcion: item.concepto,
                        monto: parseFloat(item.monto) || 0,
                        pago_id: item.pago_id || null,
                        categoria: item.ramo_id || 'Recaudación Tributaria',
                        estado: 'conciliado'
                    };
                    await store.set('hacienda_conciliacion_desglose', desgloseRecord);

                    // Si el movimiento está vinculado a un pago de contribuyente, marcarlo conciliado
                    if (item.pago_id) {
                        const pago = allPagos.find(p => String(p.id) === String(item.pago_id));
                        if (pago) {
                            pago.estado = 'conciliado';
                            pago.fecha_verificacion = new Date().toISOString();
                            await store.set('hacienda_pagos', pago);
                            pagosConciliadosTotal++;

                            // Si tiene declaración asociada, actualizar a pagada
                            if (pago.declaracion_id) {
                                const dec = allDecs.find(d => String(d.id) === String(pago.declaracion_id));
                                if (dec) {
                                    dec.estado = 'pagada';
                                    await store.set('hacienda_declaraciones', dec);
                                }
                            }
                        }
                    }
                }
            }

            toggleMonthlyModal(false);
            slRawData = [];
            slProcessedData = [];

            if (global.HaciendaConciliacion && global.HaciendaConciliacion.refresh) {
                global.HaciendaConciliacion.refresh();
            }

            if (global.Swal) {
                global.Swal.fire({
                    icon: 'success',
                    title: '¡Conciliación Guardada!',
                    text: `Se registraron ${agrupadosPorFecha.size} días bancarios (${pagosConciliadosTotal} pagos de contribuyentes conciliados y habilitados para Solvencia).`,
                    timer: 2500,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            console.error('[Hacienda SmartLedger] Error inyectando:', err);
            if (global.Swal) {
                global.Swal.fire({
                    icon: 'error',
                    title: 'Error Inyectando',
                    text: err.message || 'Fallo al guardar la conciliación.'
                });
            }
        }
    }

    function bindEvents() {
        const inputUpload = document.getElementById('sl-file-upload');
        if (inputUpload) inputUpload.addEventListener('change', handleFileUpload);
    }

    global.HaciendaSmartLedger = {
        toggleMonthlyModal,
        renderSlRaw,
        renderSlProcessed,
        toggleSlRawItem,
        toggleSlProcItem,
        updateSlProcField,
        deleteSlProcRow,
        slMoveSelectedToRefinery,
        guardarSmartLedgerEnDB,
        bindEvents
    };

})(typeof window !== 'undefined' ? window : globalThis);
