/**
 * GUIRIRI SISTEMA HACIENDA V3 — Módulo de Cuentas Bancarias Recaudadoras
 * Gestión integral de cuentas bancarias oficiales de la Alcaldía para recepción de tributos y conciliación.
 * Arquitectura SGB Silhouettes V3 (0ms Latencia, Offline-First, LocalForage + Supabase Bi-Sync).
 */
(function defineCuentasBancariasModule(global) {
    "use strict";

    // Catálogo oficial completo de entidades bancarias nacionales (SUDEBAN / República Bolivariana de Venezuela)
    const BANCOS_VENEZUELA = [
        { codigo: '0102', nombre: 'Banco de Venezuela', corto: 'BDV', badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
        { codigo: '0134', nombre: 'Banesco Banco Universal', corto: 'Banesco', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
        { codigo: '0191', nombre: 'Banco Nacional de Crédito BNC', corto: 'BNC', badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
        { codigo: '0105', nombre: 'Mercantil Banco', corto: 'Mercantil', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        { codigo: '0108', nombre: 'BBVA Banco Provincial', corto: 'Provincial', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
        { codigo: '0163', nombre: 'Banco del Tesoro', corto: 'Tesoro', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
        { codigo: '0172', nombre: 'Bancamiga Banco Universal', corto: 'Bancamiga', badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
        { codigo: '0175', nombre: 'Banco Digital de los Trabajadores (BDT / Bicentenario)', corto: 'BDT', badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20' },
        { codigo: '0177', nombre: 'Banco de la Fuerza Armada Nacional Bolivariana (BANFANB)', corto: 'BANFANB', badgeColor: 'bg-emerald-600/10 text-emerald-300 border-emerald-600/20' },
        { codigo: '0166', nombre: 'Banco Agrícola de Venezuela', corto: 'BAV', badgeColor: 'bg-lime-500/10 text-lime-400 border-lime-500/20' },
        { codigo: '0104', nombre: 'Banco Venezolano de Crédito (BVC)', corto: 'BVC', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
        { codigo: '0174', nombre: 'Banplus Banco Universal', corto: 'Banplus', badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
        { codigo: '0138', nombre: 'Banco Plaza', corto: 'Plaza', badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
        { codigo: '0151', nombre: 'BFC Banco Fondo Común', corto: 'BFC', badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
        { codigo: '0114', nombre: 'Bancaribe', corto: 'Bancaribe', badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
        { codigo: '0115', nombre: 'Banco Exterior', corto: 'Exterior', badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
        { codigo: '0128', nombre: 'Banco Caroní', corto: 'Caroní', badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
        { codigo: '0156', nombre: '100% Banco', corto: '100% Banco', badgeColor: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20' },
        { codigo: '0171', nombre: 'Banco Activo', corto: 'Activo', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
        { codigo: '0157', nombre: 'DelSur Banco Universal', corto: 'DelSur', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
        { codigo: '0137', nombre: 'Banco Sofitasa', corto: 'Sofitasa', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        { codigo: '0168', nombre: 'Bancrecer Banco Microfinanciero', corto: 'Bancrecer', badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
        { codigo: '0169', nombre: 'R4 Banco Microfinanciero (Mi Banco)', corto: 'R4 / Mi Banco', badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
        { codigo: '0146', nombre: 'Bangente', corto: 'Bangente', badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
        { codigo: '0178', nombre: 'N58 Banco Digital', corto: 'N58', badgeColor: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' },
        { codigo: '0601', nombre: 'Instituto Municipal de Crédito Popular (IMCP)', corto: 'IMCP', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
        { codigo: '0173', nombre: 'Banco Internacional de Desarrollo', corto: 'BID', badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
        { codigo: '0116', nombre: 'Banco Occidental de Descuento (BOD)', corto: 'BOD', badgeColor: 'bg-green-500/10 text-green-400 border-green-500/20' },
        { codigo: '0000', nombre: 'Otro Banco / Entidad Financiera', corto: 'Otro', badgeColor: 'bg-slate-800 text-slate-300 border-slate-700' }
    ];

    function formatNumeroCuenta(num) {
        if (!num) return '';
        const digits = String(num).replace(/\D/g, '');
        if (digits.length !== 20) return num;
        return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 10)}-${digits.slice(10, 20)}`;
    }

    const HaciendaCuentas = {
        BANCOS: BANCOS_VENEZUELA,

        // Cuentas activas disponibles para el público
        getCuentasActivas: function() {
            const store = global.HaciendaStore;
            if (!store) return [];
            return (store.get('hacienda_cuentas') || []).filter(c => c.estado !== 'inactiva');
        },

        // Todas las cuentas (activas e inactivas, filtrando cualquier mock residual)
        getAll: function() {
            const store = global.HaciendaStore;
            const cuentas = store ? (store.get('hacienda_cuentas') || []) : [];
            const mockIds = new Set(['cta_01', 'cta_02']);
            const mockNums = new Set(['01020544210000012345', '01340371820000098765']);
            return cuentas.filter(c => {
                const cleanNum = String(c.numero || '').replace(/\D/g, '');
                return !mockIds.has(String(c.id)) && !mockNums.has(cleanNum);
            });
        },

        // Abre el modal principal de gestión de cuentas
        abrirModalGestion: function() {
            // Purgar de inmediato de store si hubiese cuentas mockeadas en memoria
            const store = global.HaciendaStore;
            if (store && Array.isArray(store._cache?.['hacienda_cuentas'])) {
                const mockIds = new Set(['cta_01', 'cta_02']);
                const mockNums = new Set(['01020544210000012345', '01340371820000098765']);
                const prev = store._cache['hacienda_cuentas'];
                const limpias = prev.filter(c => {
                    const cleanNum = String(c.numero || '').replace(/\D/g, '');
                    return !mockIds.has(String(c.id)) && !mockNums.has(cleanNum);
                });
                if (limpias.length !== prev.length) {
                    store._cache['hacienda_cuentas'] = limpias;
                    if (store._localStore) store._localStore.setItem('tbl_hacienda_cuentas', limpias);
                }
            }

            let modal = document.getElementById('modal-gestion-cuentas-bancarias');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'modal-gestion-cuentas-bancarias';
                modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in';
                document.body.appendChild(modal);
            }
            this.renderModalGestionContenido();
            modal.classList.remove('hidden');
        },

        cerrarModalGestion: function() {
            const modal = document.getElementById('modal-gestion-cuentas-bancarias');
            if (modal) modal.classList.add('hidden');
        },

        renderModalGestionContenido: function() {
            const modal = document.getElementById('modal-gestion-cuentas-bancarias');
            if (!modal) return;

            const cuentas = this.getAll();
            const totalSaldo = cuentas.reduce((acc, c) => acc + Number(c.saldo_actual || 0), 0);
            const activasCount = cuentas.filter(c => c.estado !== 'inactiva').length;

            modal.innerHTML = `
                <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                    <!-- Cabecera -->
                    <div class="flex items-start justify-between border-b border-slate-800 pb-5">
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] font-mono uppercase tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
                                    Tesorería y Hacienda Municipal
                                </span>
                                <span class="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                                    ${activasCount} de ${cuentas.length} Activas
                                </span>
                            </div>
                            <h3 class="text-xl font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-university text-sky-400"></i>
                                Cuentas Bancarias Recaudadoras
                            </h3>
                            <p class="text-xs text-slate-400 max-w-2xl leading-relaxed">
                                Administre las cuentas oficiales donde los contribuyentes realizan sus transferencias bancarias. Los cambios se actualizan en tiempo real (0ms) en el Portal del Contribuyente y en la Conciliación Bancaria.
                            </p>
                        </div>
                        <button onclick="window.HaciendaCuentas.cerrarModalGestion()" 
                                class="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition">
                            <i class="fas fa-times text-base"></i>
                        </button>
                    </div>

                    <!-- Resumen Superior y Botón Nueva Cuenta -->
                    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 text-lg">
                                <i class="fas fa-wallet"></i>
                            </div>
                            <div>
                                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Consolidado en Bancos</span>
                                <span class="text-lg font-black font-mono text-sky-400">${totalSaldo.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span>
                            </div>
                        </div>
                        <button onclick="window.HaciendaCuentas.abrirModalForm()" 
                                class="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-900/30 transition flex items-center justify-center gap-2">
                            <i class="fas fa-plus text-xs"></i>
                            <span>Registrar Nueva Cuenta</span>
                        </button>
                    </div>

                    <!-- Grid de Tarjetas de Cuentas -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <span>Cuentas Registradas en el Sistema</span>
                            <span class="text-[11px] font-mono text-slate-500">${cuentas.length} registros</span>
                        </div>

                        ${cuentas.length === 0 ? `
                            <div class="p-12 text-center text-slate-500 bg-slate-950/40 border border-slate-800/60 rounded-2xl space-y-3">
                                <i class="fas fa-landmark text-4xl opacity-30"></i>
                                <div class="text-xs font-medium">No hay cuentas bancarias registradas en la Tesorería.</div>
                                <p class="text-[11px] text-slate-500 max-w-md mx-auto">
                                    Presione "Registrar Nueva Cuenta" para agregar la cuenta oficial de la Alcaldía donde los contribuyentes realizarán sus pagos.
                                </p>
                            </div>
                        ` : `
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${cuentas.map(c => {
                                    const bancoInfo = BANCOS_VENEZUELA.find(b => b.nombre.toLowerCase() === (c.banco || '').toLowerCase()) ||
                                                      BANCOS_VENEZUELA.find(b => (c.numero || '').replace(/\D/g, '').startsWith(b.codigo)) ||
                                                      { nombre: c.banco, corto: c.banco, badgeColor: 'bg-slate-800 text-slate-300 border-slate-700' };
                                    const numFormateado = formatNumeroCuenta(c.numero);
                                    const esActiva = c.estado !== 'inactiva';

                                    return `
                                        <div class="p-5 rounded-2xl bg-slate-950 border ${esActiva ? 'border-slate-800 hover:border-slate-700' : 'border-rose-950/40 opacity-75'} shadow-lg space-y-4 transition">
                                            <div class="flex items-start justify-between gap-2">
                                                <div class="space-y-1">
                                                    <div class="flex items-center gap-2 flex-wrap">
                                                        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${bancoInfo.badgeColor}">
                                                            ${bancoInfo.corto || c.banco}
                                                        </span>
                                                        <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                                            ${c.tipo || 'Corriente'}
                                                        </span>
                                                    </div>
                                                    <h4 class="text-sm font-bold text-white tracking-wide">${c.banco}</h4>
                                                </div>
                                                <span class="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${esActiva ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}">
                                                    ${esActiva ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </div>

                                            <div class="space-y-1 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                                                <div class="flex items-center justify-between">
                                                    <span class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Número de Cuenta</span>
                                                    <button onclick="window.HaciendaCuentas.copiarAlPortapapeles('${c.numero}')" 
                                                            title="Copiar número"
                                                            class="text-[10px] text-slate-400 hover:text-sky-400 transition flex items-center gap-1 font-mono">
                                                        <i class="fas fa-copy text-[9px]"></i>
                                                        <span>Copiar</span>
                                                    </button>
                                                </div>
                                                <div class="text-xs font-mono font-bold text-slate-200 tracking-wider select-all">
                                                    ${numFormateado}
                                                </div>
                                                <div class="text-[11px] text-slate-400 pt-1 line-clamp-1">
                                                    ${c.concepto || 'Recaudación Tributaria Municipal'}
                                                </div>
                                            </div>

                                            <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                                                <div>
                                                    <span class="text-[10px] text-slate-500 block uppercase font-mono">Saldo Actual</span>
                                                    <span class="font-mono font-bold text-slate-200">${Number(c.saldo_actual || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span>
                                                </div>
                                                <div class="flex items-center gap-1.5">
                                                    <button onclick="window.HaciendaCuentas.toggleEstado('${c.id}')" 
                                                            title="${esActiva ? 'Desactivar cuenta' : 'Activar cuenta'}"
                                                            class="p-2 rounded-lg ${esActiva ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800' : 'text-emerald-400 hover:bg-emerald-500/10'} transition text-xs">
                                                        <i class="fas ${esActiva ? 'fa-eye-slash' : 'fa-eye'}"></i>
                                                    </button>
                                                    <button onclick="window.HaciendaCuentas.abrirModalForm('${c.id}')" 
                                                            class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-lg border border-slate-700 transition flex items-center gap-1">
                                                        <i class="fas fa-edit text-[10px]"></i>
                                                        <span>Editar</span>
                                                    </button>
                                                    <button onclick="window.HaciendaCuentas.eliminarCuenta('${c.id}')" 
                                                            title="Eliminar cuenta"
                                                            class="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition text-xs">
                                                        <i class="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `}
                    </div>

                    <!-- Pie -->
                    <div class="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-500">
                        <span class="flex items-center gap-1.5">
                            <i class="fas fa-shield-alt text-emerald-400"></i>
                            Sincronización segura con Supabase a 0ms
                        </span>
                        <button onclick="window.HaciendaCuentas.cerrarModalGestion()" 
                                class="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition">
                            Cerrar
                        </button>
                    </div>
                </div>
            `;
        },

        // Abre el formulario para Crear o Editar una cuenta
        abrirModalForm: function(cuentaId) {
            let formModal = document.getElementById('modal-form-cuenta-bancaria');
            if (!formModal) {
                formModal = document.createElement('div');
                formModal.id = 'modal-form-cuenta-bancaria';
                formModal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in';
                document.body.appendChild(formModal);
            }

            const cuentas = this.getAll();
            const cuenta = cuentaId ? cuentas.find(c => String(c.id) === String(cuentaId)) : null;
            const esEdicion = !!cuenta;

            const bancoDefault = cuenta ? cuenta.banco : 'Banco de Venezuela';
            const numRaw = cuenta ? String(cuenta.numero || '').replace(/\D/g, '') : '0102';
            const tipoDefault = cuenta ? (cuenta.tipo || 'Corriente') : 'Corriente';
            const conceptoDefault = cuenta ? (cuenta.concepto || '') : 'Recaudación Tributaria SATRIMG';
            const saldoIniDefault = cuenta ? Number(cuenta.saldo_inicial || 0) : 0.00;
            const estadoDefault = cuenta ? (cuenta.estado || 'activa') : 'activa';

            formModal.innerHTML = `
                <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div class="space-y-0.5">
                            <span class="text-[10px] font-mono uppercase tracking-widest text-sky-400">
                                ${esEdicion ? 'Actualización de Datos' : 'Registro Oficial'}
                            </span>
                            <h3 class="text-lg font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-university text-sky-400"></i>
                                ${esEdicion ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Recaudadora'}
                            </h3>
                        </div>
                        <button onclick="window.HaciendaCuentas.cerrarModalForm()" 
                                class="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition">
                            <i class="fas fa-times text-base"></i>
                        </button>
                    </div>

                    <form id="form-cuenta-bancaria" onsubmit="window.HaciendaCuentas.guardarCuenta(event, '${cuenta ? cuenta.id : ''}')" class="space-y-4">
                        <!-- Entidad Bancaria -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Entidad Bancaria</label>
                            <select id="cta-banco" onchange="window.HaciendaCuentas.onBancoChange(this.value)" 
                                    class="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition cursor-pointer">
                                ${BANCOS_VENEZUELA.map(b => `
                                    <option value="${b.nombre}" data-codigo="${b.codigo}" ${b.nombre.toLowerCase() === bancoDefault.toLowerCase() ? 'selected' : ''}>
                                        ${b.codigo !== '0000' ? `[${b.codigo}] ` : ''}${b.nombre} ${b.corto ? `(${b.corto})` : ''}
                                    </option>
                                `).join('')}
                            </select>
                            <div id="cta-banco-personalizado-box" class="space-y-1.5 hidden pt-1">
                                <label class="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">Nombre de la Entidad Bancaria Personalizada</label>
                                <input type="text" id="cta-banco-personalizado" placeholder="Ej: Banco Agrícola / Banco Cooperativo" 
                                       class="w-full bg-slate-950 border border-sky-500/40 text-slate-100 text-xs font-bold rounded-xl px-4 py-2.5 outline-none focus:border-sky-400 transition">
                            </div>
                        </div>

                        <!-- Número de Cuenta (20 Dígitos) -->
                        <div class="space-y-1.5">
                            <div class="flex items-center justify-between">
                                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Número de Cuenta (20 Dígitos)</label>
                                <span id="cta-digits-counter" class="text-[11px] font-mono text-slate-500 font-bold">20 / 20</span>
                            </div>
                            <input type="text" id="cta-numero" required maxlength="24"
                                   value="${formatNumeroCuenta(numRaw)}"
                                   oninput="window.HaciendaCuentas.onNumeroInput(this)"
                                   placeholder="0102-0000-00-0000000000"
                                   class="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono font-bold rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition tracking-wider">
                            <span class="text-[11px] text-slate-500 block">Formato bancario venezolano: 4 banco + 4 agencia + 2 control + 10 cuenta.</span>
                        </div>

                        <!-- Tipo de Cuenta y Estado -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tipo de Cuenta</label>
                                <select id="cta-tipo" class="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition cursor-pointer">
                                    <option value="Corriente" ${tipoDefault === 'Corriente' ? 'selected' : ''}>Cuenta Corriente</option>
                                    <option value="Ahorro" ${tipoDefault === 'Ahorro' ? 'selected' : ''}>Cuenta de Ahorro</option>
                                </select>
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Estado Operativo</label>
                                <select id="cta-estado" class="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition cursor-pointer">
                                    <option value="activa" ${estadoDefault === 'activa' ? 'selected' : ''}>Activa (Visible en Portal)</option>
                                    <option value="inactiva" ${estadoDefault === 'inactiva' ? 'selected' : ''}>Inactiva (Oculta en Portal)</option>
                                </select>
                            </div>
                        </div>

                        <!-- Concepto / Destino Institucional -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Concepto o Destino Institucional</label>
                            <input type="text" id="cta-concepto" required
                                   value="${conceptoDefault}"
                                   placeholder="Ej: Recaudación Tributaria SATRIMG / Ingresos Propios"
                                   class="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-medium rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition">
                            <span class="text-[11px] text-slate-500 block">Texto descriptivo que orienta al comerciante sobre el uso de la cuenta.</span>
                        </div>

                        <!-- Saldo Inicial -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Saldo Inicial en Libros (Bs.)</label>
                            <input type="number" step="0.01" id="cta-saldo-inicial"
                                   value="${saldoIniDefault}"
                                   class="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono font-bold rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition">
                        </div>

                        <!-- Botones de Acción -->
                        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                            <button type="button" onclick="window.HaciendaCuentas.cerrarModalForm()" 
                                    class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition">
                                Cancelar
                            </button>
                            <button type="submit" 
                                    class="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-900/30 transition flex items-center gap-2">
                                <i class="fas fa-save text-xs"></i>
                                <span>${esEdicion ? 'Actualizar Cuenta' : 'Guardar Cuenta'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            `;
            formModal.classList.remove('hidden');
            this.actualizarDigitosContador();
        },

        cerrarModalForm: function() {
            const formModal = document.getElementById('modal-form-cuenta-bancaria');
            if (formModal) formModal.classList.add('hidden');
        },

        onBancoChange: function(bancoNombre) {
            const banco = BANCOS_VENEZUELA.find(b => b.nombre === bancoNombre);
            const inputNum = document.getElementById('cta-numero');
            const customBox = document.getElementById('cta-banco-personalizado-box');
            if (customBox) {
                if (bancoNombre === 'Otro Banco / Entidad Financiera') {
                    customBox.classList.remove('hidden');
                } else {
                    customBox.classList.add('hidden');
                }
            }
            if (!banco || !inputNum) return;

            if (banco.codigo !== '0000') {
                let digits = inputNum.value.replace(/\D/g, '');
                if (digits.length <= 4) {
                    digits = banco.codigo;
                } else {
                    digits = banco.codigo + digits.slice(4);
                }
                inputNum.value = formatNumeroCuenta(digits);
            }
            this.actualizarDigitosContador();
        },

        onNumeroInput: function(input) {
            const digits = input.value.replace(/\D/g, '').slice(0, 20);
            input.value = formatNumeroCuenta(digits);
            this.actualizarDigitosContador();

            // Detección automática inteligente del banco por los primeros 4 dígitos
            if (digits.length >= 4) {
                const cod = digits.slice(0, 4);
                const bancoDetectado = BANCOS_VENEZUELA.find(b => b.codigo === cod);
                const selectBanco = document.getElementById('cta-banco');
                const customBox = document.getElementById('cta-banco-personalizado-box');
                if (bancoDetectado && selectBanco && selectBanco.value !== bancoDetectado.nombre) {
                    selectBanco.value = bancoDetectado.nombre;
                    if (customBox) customBox.classList.add('hidden');
                }
            }
        },

        actualizarDigitosContador: function() {
            const inputNum = document.getElementById('cta-numero');
            const counter = document.getElementById('cta-digits-counter');
            if (!inputNum || !counter) return;

            const digits = inputNum.value.replace(/\D/g, '');
            counter.innerText = `${digits.length} / 20`;
            if (digits.length === 20) {
                counter.className = 'text-[11px] font-mono text-emerald-400 font-bold';
            } else {
                counter.className = 'text-[11px] font-mono text-amber-400 font-bold';
            }
        },

        // Guardar cuenta en store con ciclo inquebrantable a 0ms
        guardarCuenta: async function(e, cuentaId) {
            if (e && e.preventDefault) e.preventDefault();
            const store = global.HaciendaStore;
            if (!store) return;

            let banco = document.getElementById('cta-banco').value;
            if (banco === 'Otro Banco / Entidad Financiera') {
                const customNombre = document.getElementById('cta-banco-personalizado')?.value.trim();
                if (customNombre) {
                    banco = customNombre;
                } else {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Nombre de Banco Requerido',
                            text: 'Especifique el nombre de la entidad bancaria personalizada.',
                            confirmButtonColor: '#0284c7'
                        });
                    }
                    return;
                }
            }

            const rawNumero = document.getElementById('cta-numero').value;
            const digits = rawNumero.replace(/\D/g, '');
            const tipo = document.getElementById('cta-tipo').value;
            const estado = document.getElementById('cta-estado').value;
            const concepto = document.getElementById('cta-concepto').value.trim();
            const saldoInicial = parseFloat(document.getElementById('cta-saldo-inicial').value || 0) || 0;

            if (digits.length !== 20) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Número Incompleto',
                        text: `El número de cuenta bancaria debe contener exactamente 20 dígitos (ingresados: ${digits.length}).`,
                        confirmButtonColor: '#0284c7'
                    });
                }
                return;
            }

            if (!concepto) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Concepto Requerido',
                        text: 'Ingresa una descripción o concepto institucional para la cuenta.',
                        confirmButtonColor: '#0284c7'
                    });
                }
                return;
            }

            const id = cuentaId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'cta_' + Date.now());
            const cuentas = this.getAll();
            const anterior = cuentaId ? cuentas.find(c => String(c.id) === String(cuentaId)) : null;

            const cuentaObj = {
                id: id,
                banco: banco,
                numero: formatNumeroCuenta(digits),
                tipo: tipo,
                concepto: concepto,
                saldo_inicial: saldoInicial,
                saldo_actual: anterior ? (anterior.saldo_actual || saldoInicial) : saldoInicial,
                estado: estado,
                created_at: anterior ? (anterior.created_at || new Date().toISOString()) : new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await store.set('hacienda_cuentas', cuentaObj);

            this.cerrarModalForm();
            this.renderModalGestionContenido();

            // Refrescar vistas activas en el ERP si están montadas
            if (global.HaciendaConciliacion && typeof global.HaciendaConciliacion.render === 'function') {
                const cMain = document.getElementById('app-main-content');
                if (cMain && window.App && window.App.currentTab === 'conciliacion') {
                    global.HaciendaConciliacion.render(cMain);
                }
            }
            if (global.CajaModule && typeof global.CajaModule.render === 'function') {
                const cMain = document.getElementById('app-main-content');
                if (cMain && window.App && window.App.currentTab === 'caja') {
                    global.CajaModule.render(cMain);
                }
            }

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: cuentaId ? 'Cuenta Actualizada' : 'Cuenta Registrada',
                    text: `La cuenta de ${banco} (${formatNumeroCuenta(digits).slice(-4)}) ha sido guardada satisfactoriamente.`,
                    confirmButtonColor: '#0284c7'
                });
            }
        },

        // Alternar estado activo / inactivo
        toggleEstado: async function(cuentaId) {
            const store = global.HaciendaStore;
            if (!store || !cuentaId) return;

            const cuentas = this.getAll();
            const c = cuentas.find(item => String(item.id) === String(cuentaId));
            if (!c) return;

            const nuevoEstado = (c.estado === 'inactiva') ? 'activa' : 'inactiva';
            const actualizado = {
                ...c,
                estado: nuevoEstado,
                updated_at: new Date().toISOString()
            };

            await store.set('hacienda_cuentas', actualizado);
            this.renderModalGestionContenido();

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'info',
                    title: nuevoEstado === 'activa' ? 'Cuenta Activada' : 'Cuenta Inactivada',
                    text: nuevoEstado === 'activa' 
                        ? 'La cuenta ahora es visible en el portal para recepción de pagos.' 
                        : 'La cuenta ha sido ocultada del portal público.',
                    confirmButtonColor: '#0284c7'
                });
            }
        },

        // Eliminar cuenta bancaria previa comprobación de integridad
        eliminarCuenta: async function(cuentaId) {
            const store = global.HaciendaStore;
            if (!store || !cuentaId) return;

            const cuentas = this.getAll();
            const c = cuentas.find(item => String(item.id) === String(cuentaId));
            if (!c) return;

            // Verificar integridad referencial en conciliaciones y desgloses
            const conciliaciones = store.get('hacienda_conciliacion') || [];
            const desgloses = store.get('hacienda_conciliacion_desglose') || [];

            const tieneMovimientos = conciliaciones.some(con => String(con.cuenta_id) === String(cuentaId)) ||
                                     desgloses.some(d => String(d.cuenta_id) === String(cuentaId));

            if (tieneMovimientos) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Cuenta con Movimientos',
                        text: 'Esta cuenta posee días de conciliación o movimientos bancarios registrados. Para preservar la trazabilidad contable no puede eliminarse; puede marcarla como "Inactiva" para ocultarla del portal del comerciante.',
                        confirmButtonColor: '#0284c7'
                    });
                }
                return;
            }

            if (typeof Swal !== 'undefined') {
                const res = await Swal.fire({
                    icon: 'question',
                    title: '¿Eliminar Cuenta Bancaria?',
                    text: `¿Confirma que desea eliminar la cuenta de ${c.banco} (${c.numero})? Esta acción no se puede deshacer.`,
                    showCancelButton: true,
                    confirmButtonText: 'Sí, Eliminar',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#e11d48',
                    cancelButtonColor: '#64748b'
                });
                if (!res.isConfirmed) return;
            }

            await store.remove('hacienda_cuentas', cuentaId);
            this.renderModalGestionContenido();

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Cuenta Eliminada',
                    text: 'La cuenta ha sido eliminada permanentemente del sistema.',
                    confirmButtonColor: '#0284c7'
                });
            }
        },

        copiarAlPortapapeles: function(texto) {
            if (!texto) return;
            const digits = String(texto).replace(/\D/g, '');
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(digits).then(() => {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'Número de cuenta copiado',
                            showConfirmButton: false,
                            timer: 2000
                        });
                    }
                });
            }
        }
    };

    global.HaciendaCuentas = HaciendaCuentas;
})(typeof window !== 'undefined' ? window : this);
