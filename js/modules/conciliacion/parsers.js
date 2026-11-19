/**
 * GUIRIRI SISTEMA HACIENDA V3 — Extractores y Parsers Bancarios (Motor V8)
 * Soporta extractos en PDF de Banco de Venezuela, Banesco, BNC, Provincial, BOD, TXT y JSON.
 * Arquitectura SGB Silhouettes V3 (0ms Latencia, Offline-First)
 */
(function defineHaciendaConcilParsers(global) {
    "use strict";

    const MESES = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const utilsParser = {
        esMonto: (str) => /^[+-]?[\d\.,]+[\.,][\d]{2}[+-]?$/.test(str ? str.trim() : ''),
        esReferencia: (str) => /^\d{6,}$/.test(str ? str.trim() : '') && !str.includes(","),
        parseMonto: (str) => {
            if (!str) return 0.0;
            let s = str.trim().replace(/[+-]/g, '');
            let match = s.match(/^(.*?)([\.,])(\d{2})$/);
            if (match) {
                let integerPart = match[1].replace(/[\.,]/g, '');
                return parseFloat(integerPart + '.' + match[3]);
            }
            return 0.0;
        }
    };

    /**
     * Match Heurístico entre un movimiento de crédito del banco y un pago de contribuyente
     */
    function verificarMatchHeuristico(creditoBanco, pagoHacienda) {
        if (!creditoBanco || !pagoHacienda) {
            return { isMontoMatch: false, isFechaMatch: false, isRefMatch: false, perfectMatch: false };
        }

        const mntBanco = Math.abs(parseFloat(creditoBanco.entrada || creditoBanco.monto || 0));
        const mntPago = Math.abs(parseFloat(pagoHacienda.monto_bs || 0));
        const isMontoMatch = Math.abs(mntBanco - mntPago) < 0.01;

        const isFechaMatch = creditoBanco.fecha === pagoHacienda.fecha_pago;

        let isRefMatch = false;
        const refBanco = String(creditoBanco.referencia || creditoBanco.descripcion || '').replace(/\D/g, '');
        const refPago = String(pagoHacienda.referencia_bancaria || '').replace(/\D/g, '');
        if (refBanco && refPago) {
            const cleanBanco = refBanco.replace(/^0+/, '');
            const cleanPago = refPago.replace(/^0+/, '');
            if (cleanBanco.length >= 4 && cleanPago.length >= 4) {
                isRefMatch = cleanBanco.includes(cleanPago) || cleanPago.includes(cleanBanco);
            }
        }

        const perfectMatch = isMontoMatch && isRefMatch;
        return { isMontoMatch, isFechaMatch, isRefMatch, perfectMatch };
    }

    const bankParsers = {
        banesco: async (pdf) => {
            let transaccionesFinales = [], rawTransactions = [], periodoEncontrado = "", lastSaldo = null;
            const page1 = await pdf.getPage(1);
            const content1 = await page1.getTextContent();
            const items1 = content1.items;

            for (let k = 0; k < items1.length; k++) {
                if (items1[k].str.includes("SALDO MES ANTERIOR")) {
                    for (let j = 1; j <= 10; j++) {
                        if (items1[k + j] && utilsParser.esMonto(items1[k + j].str)) {
                            lastSaldo = utilsParser.parseMonto(items1[k + j].str);
                            break;
                        }
                    }
                }
                if (lastSaldo !== null) break;
            }

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const textoPagina = content.items.map(item => item.str).join(" ");
                const matchPeriodo = textoPagina.match(/Per[ií]odo[:\s]+(\d{2}-\d{4})/i);
                if (matchPeriodo && !periodoEncontrado) periodoEncontrado = matchPeriodo[1].replace("-", "/");

                let rows = {};
                content.items.forEach(item => {
                    const y = Math.round(item.transform[5]);
                    if (!rows[y]) rows[y] = [];
                    rows[y].push({ str: item.str.trim(), x: item.transform[4] });
                });

                let sortedY = Object.keys(rows).sort((a, b) => b - a);
                sortedY.forEach(y => {
                    let items = rows[y].sort((a, b) => a.x - b.x);
                    const lastItem = items[items.length - 1];
                    if (!lastItem || !utilsParser.esMonto(lastItem.str)) return;

                    let saldoVal = utilsParser.parseMonto(lastItem.str);
                    let movItem = null, movIndex = -1;
                    for (let k = items.length - 2; k >= 0; k--) {
                        if (utilsParser.esMonto(items[k].str)) { movItem = items[k]; movIndex = k; break; }
                    }
                    if (!movItem) return;

                    let itemsDesc = items.slice(0, movIndex).filter(it => it.str.trim().length > 0);
                    let dia = "", ref = "", descTokens = [];
                    const patronBasura = /CALLE\s|AV\.|AVENIDA\s|EDIFICIO|APTO\.|PISO\s|SECTOR|URB\.|RIF:\s*[JVEG]-|No\.\s*de|Banesco al d[íi]a|Otros D[ée]bitos|Cheques Pagados|Dep[óo]sitos|Otros Cr[ée]ditos|Monto Total|Concepto|Per[ií]odo|0134\*{5,}\d{4}/i;

                    itemsDesc.forEach((item) => {
                        let txt = item.str.trim();
                        if (!txt || patronBasura.test(txt) || utilsParser.esMonto(txt)) return;
                        if (/^\d+$/.test(txt)) {
                            if (!dia && txt.length <= 2) {
                                let num = parseInt(txt, 10);
                                if (num >= 1 && num <= 31) { dia = txt.padStart(2, '0'); return; }
                            }
                            if (!ref && utilsParser.esReferencia(txt)) { ref = txt; return; }
                            if (!dia) return;
                        } else if (!ref && utilsParser.esReferencia(txt)) {
                            ref = txt; return;
                        }
                        descTokens.push(txt);
                    });

                    let descFinal = descTokens.join(" ").trim();
                    if ((dia || ref) && descFinal && !descFinal.includes("SALDO MES ANTERIOR")) {
                        rawTransactions.push({ dia, ref: ref || "S/R", desc: descFinal, montoStr: movItem.str, saldoVal });
                    }
                });
            }

            rawTransactions.forEach((t) => {
                let debito = "0,00", credito = "0,00", esCargo = true;
                if (lastSaldo !== null) {
                    let diff = t.saldoVal - lastSaldo;
                    if (diff < -0.009) esCargo = true;
                    else if (diff > 0.009) esCargo = false;
                } else {
                    if (["TRF REC", "DEPOSITO", "CREDITO", "PAGO RECIBIDO"].some(kw => t.desc.includes(kw))) esCargo = false;
                }
                if (esCargo) debito = t.montoStr; else credito = t.montoStr;
                lastSaldo = t.saldoVal;
                let fechaFull = (t.dia && periodoEncontrado) ? `${t.dia}/${periodoEncontrado}` : "01/01/2026";

                transaccionesFinales.push({
                    fecha: fechaFull,
                    referencia: t.ref,
                    descripcion: t.desc,
                    debito: debito,
                    credito: credito,
                    saldo: t.saldoVal.toString()
                });
            });
            return transaccionesFinales;
        },

        bdv: async (pdf) => {
            let data = [];
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();
                const rowMap = {};
                for (const item of content.items) {
                    if (!item.str.trim()) continue;
                    const y = Math.round(item.transform[5]);
                    const key = Object.keys(rowMap).find(k => Math.abs(parseInt(k) - y) <= 6);
                    const rowKey = key ?? y;
                    if (!rowMap[rowKey]) rowMap[rowKey] = [];
                    rowMap[rowKey].push({ str: item.str.trim(), x: item.transform[4], y });
                }

                const sortedRows = Object.keys(rowMap).sort((a, b) => b - a).map(k => ({ y: parseInt(k), items: rowMap[k].sort((a, b) => a.x - b.x) }));
                const mainRows = [];
                for (let i = 0; i < sortedRows.length; i++) {
                    const row = sortedRows[i];
                    const rowText = row.items.map(it => it.str).join(' ');
                    const hasDate = /\d{2}\/\d{2}\/\d{4}/.test(rowText);
                    const hasMov = /\b(ND|NC|SI)\b/.test(rowText);

                    if (hasDate && hasMov) {
                        let extraDesc = '';
                        let j = i + 1;
                        while (j < sortedRows.length) {
                            const nextRow = sortedRows[j];
                            if (row.y - nextRow.y > 30) break;
                            const nextText = nextRow.items.map(it => it.str).join(' ');
                            if (/\d{2}\/\d{2}\/\d{4}/.test(nextText) || /\b(ND|NC|SI)\b/.test(nextText)) break;
                            extraDesc += ' ' + nextText.trim();
                            i = j;
                            j++;
                        }
                        mainRows.push({ row, extraDesc: extraDesc.trim() });
                    }
                }

                for (const { row, extraDesc } of mainRows) {
                    const items = row.items;
                    const rowText = items.map(it => it.str).join(' ');
                    const fechaMatch = rowText.match(/(\d{2}\/\d{2}\/\d{4})/);
                    if (!fechaMatch) continue;
                    const fecha = fechaMatch[1];

                    const movMatch = rowText.match(/\b(ND|NC|SI)\b/);
                    if (!movMatch) continue;
                    const mov = movMatch[1];
                    if (mov === 'SI') continue;

                    const allMontos = items.filter(it => /^-?[\d\.]+,\d{2}$/.test(it.str));
                    let deb = '0,00', cred = '0,00', sal = '0,00';
                    if (allMontos.length >= 3) {
                        sal = allMontos[allMontos.length - 1].str.replace('-', '');
                        cred = allMontos[allMontos.length - 2].str.replace('-', '');
                        deb = allMontos[allMontos.length - 3].str.replace('-', '');
                    } else if (allMontos.length === 2) {
                        sal = allMontos[allMontos.length - 1].str.replace('-', '');
                        if (mov === 'ND') deb = allMontos[0].str.replace('-', '');
                        else cred = allMontos[0].str.replace('-', '');
                    } else if (allMontos.length === 1) {
                        sal = allMontos[0].str.replace('-', '');
                    }

                    const refItem = items.find(it => /^\d{10,}$/.test(it.str));
                    const ref = refItem ? refItem.str : 'S/R';

                    const refX = refItem ? refItem.x : -1;
                    const fechaX = items.find(it => it.str === fecha)?.x ?? 9999;
                    const movX = items.find(it => it.str === mov)?.x ?? 9999;
                    const descItems = items.filter(it => {
                        if (it.x <= refX + 5) return false;
                        if (it.x >= Math.min(fechaX, movX) - 5) return false;
                        if (/^-?[\d\.]+,\d{2}$/.test(it.str)) return false;
                        if (it.str === mov || it.str === fecha) return false;
                        return true;
                    });
                    let desc = descItems.map(it => it.str).join(' ').trim();
                    if (extraDesc) desc = (desc + ' ' + extraDesc).trim();

                    data.push({
                        fecha,
                        referencia: ref,
                        descripcion: desc || 'Sin descripción',
                        debito: deb === '-0,00' ? '0,00' : deb,
                        credito: cred === '-0,00' ? '0,00' : cred,
                        saldo: sal
                    });
                }
            }
            return data;
        },

        bnc: async (pdf) => {
            let data = [];
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();
                const rowMap = {};
                for (const item of content.items) {
                    if (!item.str.trim()) continue;
                    const y = Math.round(item.transform[5]);
                    const key = Object.keys(rowMap).find(k => Math.abs(parseInt(k) - y) <= 4);
                    const rowKey = key ?? y;
                    if (!rowMap[rowKey]) rowMap[rowKey] = [];
                    rowMap[rowKey].push({ str: item.str.trim(), x: item.transform[4] });
                }
                const sortedRows = Object.keys(rowMap).sort((a, b) => b - a).map(k => ({ items: rowMap[k].sort((a, b) => a.x - b.x) }));
                const mainRows = [];
                for (let i = 0; i < sortedRows.length; i++) {
                    const row = sortedRows[i];
                    if (/^\d{2}\/\d{2}\/\d{4}$/.test(row.items[0]?.str)) {
                        let extraDesc = '';
                        let j = i + 1;
                        while (j < sortedRows.length) {
                            const nextRow = sortedRows[j];
                            if (/^\d{2}\/\d{2}\/\d{4}$/.test(nextRow.items[0]?.str) || /Totales/i.test(nextRow.items[0]?.str)) break;
                            extraDesc += ' ' + nextRow.items.map(it => it.str).join(' ');
                            i = j;
                            j++;
                        }
                        mainRows.push({ row, extraDesc: extraDesc.trim() });
                    }
                }
                for (const { row, extraDesc } of mainRows) {
                    const items = row.items;
                    const fecha = items[0].str;
                    const allMontos = items.filter(it => /^[+-]?[\d\.]+,\d{2}$/.test(it.str));
                    if (allMontos.length >= 3) {
                        let sal = allMontos[allMontos.length - 1].str.replace(/[+-]/g, '');
                        let cred = allMontos[allMontos.length - 2].str.replace('+', '');
                        let deb = allMontos[allMontos.length - 3].str.replace('-', '');
                        const mIndex = items.indexOf(allMontos[allMontos.length - 3]);
                        let ref = (mIndex > 0 && /^\d{2,}$/.test(items[mIndex - 1].str)) ? items[mIndex - 1].str : 'S/R';
                        let descItems = items.slice(1, mIndex).filter(it => !/^\d{3}$/.test(it.str) && it.str !== ref);
                        let desc = (descItems.map(it => it.str).join(' ') + ' ' + extraDesc).trim();
                        data.push({ fecha, referencia: ref, descripcion: desc || 'Sin descripción', debito: deb, credito: cred, saldo: sal });
                    }
                }
            }
            return data;
        },

        provincial: async (pdf) => {
            let data = [];
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();
                const rowMap = {};
                for (const item of content.items) {
                    if (!item.str.trim()) continue;
                    const y = Math.round(item.transform[5]);
                    const key = Object.keys(rowMap).find(k => Math.abs(parseInt(k) - y) <= 4);
                    const rowKey = key ?? y;
                    if (!rowMap[rowKey]) rowMap[rowKey] = [];
                    rowMap[rowKey].push({ str: item.str.trim(), x: item.transform[4] });
                }
                const sortedRows = Object.keys(rowMap).sort((a, b) => b - a).map(k => ({ items: rowMap[k].sort((a, b) => a.x - b.x) }));
                for (const row of sortedRows) {
                    const rowText = row.items.map(it => it.str).join(' ');
                    const matchF = rowText.match(/(\d{2}\/\d{2}\/\d{4})/);
                    if (matchF) {
                        const montos = row.items.filter(it => utilsParser.esMonto(it.str));
                        if (montos.length >= 2) {
                            let deb = '0,00', cred = '0,00';
                            if (rowText.toLowerCase().includes('abono') || rowText.toLowerCase().includes('credito') || rowText.toLowerCase().includes('pago movil')) {
                                cred = montos[0].str;
                            } else {
                                deb = montos[0].str;
                            }
                            const refM = rowText.match(/\b\d{6,}\b/);
                            data.push({
                                fecha: matchF[1],
                                referencia: refM ? refM[0] : 'S/R',
                                descripcion: rowText.replace(matchF[1], '').slice(0, 70).trim(),
                                debito: deb,
                                credito: cred,
                                saldo: montos[montos.length - 1].str
                            });
                        }
                    }
                }
            }
            return data;
        },

        txt: (text) => {
            const lines = text.split('\n');
            const data = [];
            const dateRegex = /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b|\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/;

            lines.forEach(rawLine => {
                const line = rawLine.trim();
                if (!line) return;
                const dateMatch = line.match(dateRegex);
                if (!dateMatch) return;

                let fecha = '';
                if (dateMatch[1] && dateMatch[2] && dateMatch[3]) {
                    const dia = String(dateMatch[1]).padStart(2, '0');
                    const mes = String(dateMatch[2]).padStart(2, '0');
                    let anio = dateMatch[3];
                    if (anio.length === 2) anio = `20${anio}`;
                    fecha = `${anio}-${mes}-${dia}`;
                } else if (dateMatch[4] && dateMatch[5] && dateMatch[6]) {
                    fecha = `${dateMatch[4]}-${String(dateMatch[5]).padStart(2, '0')}-${String(dateMatch[6]).padStart(2, '0')}`;
                }

                const words = line.split(/\s+|\t+/);
                const numerosEncontrados = [];
                words.forEach(w => {
                    const clean = w.replace(/[^\d.,]/g, '');
                    if (clean && utilsParser.esMonto(clean)) {
                        numerosEncontrados.push(clean);
                    }
                });

                if (numerosEncontrados.length > 0) {
                    const montoStr = numerosEncontrados[numerosEncontrados.length - 1];
                    let debito = "0,00", credito = "0,00";
                    const lower = line.toLowerCase();
                    if (lower.includes('deposito') || lower.includes('credito') || lower.includes('abono') || lower.includes('transferencia recibida') || lower.includes('pago movil')) {
                        credito = montoStr;
                    } else {
                        debito = montoStr;
                    }

                    const refMatch = line.match(/\b\d{6,12}\b/);
                    data.push({
                        fecha,
                        referencia: refMatch ? refMatch[0] : 'S/R',
                        descripcion: line.slice(0, 80),
                        debito,
                        credito,
                        saldo: '0,00'
                    });
                }
            });
            return data;
        }
    };

    function slUniversalAdapter(data) {
        let rawArray = Array.isArray(data) ? data : (data.days || data.registros || []);
        const getSafeISODate = (rawStr) => {
            if (!rawStr) return "S/F";
            const m = rawStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
            if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
            const iso = rawStr.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
            if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
            return rawStr;
        };

        const cleanMonto = (str) => {
            if (typeof str === 'number') return str;
            return parseFloat(String(str).replace(/\./g, '').replace(',', '.')) || 0;
        };

        return rawArray.map(item => {
            let entradaVal = cleanMonto(item.credito || item.abono || item.entrada || 0);
            let salidaVal = cleanMonto(item.debito || item.cargo || item.salida || 0);
            let saldoVal = cleanMonto(item.saldo || 0);

            return {
                id: 'raw_' + Math.random().toString(36).substr(2, 9),
                fecha: getSafeISODate(item.fecha),
                referencia: item.referencia || 'S/R',
                descripcion: item.descripcion || item.desc || 'Sin descripción',
                entrada: entradaVal,
                salida: salidaVal,
                saldo: saldoVal,
                selected: true,
                procesado: false
            };
        }).filter(item => (item.entrada > 0 || item.salida > 0) && item.fecha !== 'SALDO INICIAL');
    }

    // Exportar al ámbito global
    global.HaciendaConcilParsers = {
        utilsParser,
        verificarMatchHeuristico,
        bankParsers,
        slUniversalAdapter
    };

})(typeof window !== 'undefined' ? window : globalThis);
