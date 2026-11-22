/**
 * GUIRIRI SISTEMA HACIENDA V3 — Módulo de Métodos de Pago y Canales de Recaudación
 * Gestión de canales oficiales (Pago Móvil, Transferencias, Puntos de Venta, Taquilla)
 * afiliados directamente a las Cuentas Bancarias Recaudadoras del Municipio.
 * Arquitectura SGB Silhouettes V3 (0ms Latencia, Offline-First, LocalForage + Supabase Bi-Sync).
 */
(function defineMetodosPagoModule(global) {
    "use strict";

    let filtroTipo = 'all';
    let filtroCuenta = 'all';

    const CANALES = [
        { id: 'pago_movil', label: 'Pago Móvil', icon: 'fa-mobile-alt', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
        { id: 'transferencia', label: 'Transferencia Bancaria', icon: 'fa-exchange-alt', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
        { id: 'punto_venta', label: 'Punto de Venta / Tarjeta', icon: 'fa-credit-card', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
        { id: 'efectivo', label: 'Efectivo en Taquilla', icon: 'fa-money-bill-wave', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
    ];

    const MetodosPagoModule = {
        CANALES: CANALES,

        getAll: function() {
            const store = global.HaciendaStore;
            return store ? (store.get('hacienda_metodos_pago') || []) : [];
        },

        getActivos: function() {
            return this.getAll().filter(m => m.activo !== false);
        },

        render: function(container) {
            const store = global.HaciendaStore;
            if (!store) {
                container.innerHTML = '<div class="p-8 text-center text-rose-400 font-mono">HaciendaStore no disponible</div>';
                return;
            }

            const metodos = this.getAll();
            const cuentas = store.get('hacienda_cuentas') || [];

            // Filtrado reactivo
            const metodosFiltrados = metodos.filter(m => {
                if (filtroTipo !== 'all' && m.tipo !== filtroTipo) return false;
                if (filtroCuenta !== 'all' && String(m.cuenta_id) !== String(filtroCuenta)) return false;
                return true;
            }).sort((a, b) => (Number(a.orden || 99) - Number(b.orden || 99)));

            const totalActivos = metodos.filter(m => m.activo !== false).length;
            const pmActivos = metodos.filter(m => m.tipo === 'pago_movil' && m.activo !== false).length;
            const trActivas = metodos.filter(m => m.tipo === 'transferencia' && m.activo !== false).length;
            const posActivos = metodos.filter(m => (m.tipo === 'punto_venta' || m.tipo === 'efectivo') && m.activo !== false).length;

            container.innerHTML = `
                <div class="space-y-6 animate-fade-in">
                    <!-- Cabecera Principal y Botones de Acción -->
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                                    Canales de Recaudación Tributaria
                                </span>
                                <span class="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                                    ${totalActivos} Activos
                                </span>
                            </div>
                            <h2 class="text-xl font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-wallet text-emerald-400"></i>
                                Métodos de Pago y Canales de Cobro
                            </h2>
                            <p class="text-xs text-slate-400 max-w-2xl leading-relaxed">
                                Configure los canales donde los contribuyentes realizan sus pagos (Pago Móvil, Transferencias, Puntos de Venta), afiliados directamente a las cuentas bancarias recaudadoras.
                            </p>
                        </div>
                        <div class="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
                            <button onclick="window.HaciendaCuentas && window.HaciendaCuentas.abrirModalGestion()" 
                                    class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs rounded-xl border border-slate-700 hover:border-sky-500/40 shadow-lg transition flex items-center gap-2">
                                <i class="fas fa-university text-xs"></i>
                                <span>Cuentas Bancarias (${cuentas.length})</span>
                            </button>
                            <button onclick="window.MetodosPagoModule.abrirModalForm()" 
                                    class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center gap-2">
                                <i class="fas fa-plus text-xs"></i>
                                <span>Nuevo Método de Pago</span>
                            </button>
                        </div>
                    </div>

                    <!-- HUD Cards Bento -->
                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
                            <div>
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Canales</span>
                                <div class="text-2xl font-black font-mono text-slate-100 mt-1">${metodos.length}</div>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xl">
                                <i class="fas fa-network-wired"></i>
                            </div>
                        </div>

                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
                            <div>
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Pago Móvil</span>
                                <div class="text-2xl font-black font-mono text-purple-400 mt-1">${pmActivos} activos</div>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xl">
                                <i class="fas fa-mobile-alt"></i>
                            </div>
                        </div>

                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
                            <div>
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Transferencias</span>
                                <div class="text-2xl font-black font-mono text-sky-400 mt-1">${trActivas} activas</div>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 text-xl">
                                <i class="fas fa-exchange-alt"></i>
                            </div>
                        </div>

                        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
                            <div>
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Punto de Venta / Caja</span>
                                <div class="text-2xl font-black font-mono text-emerald-400 mt-1">${posActivos} activos</div>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
                                <i class="fas fa-cash-register"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Barra de Filtros -->
                    <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                        <div class="flex flex-wrap items-center gap-3">
                            <div class="flex items-center gap-2">
                                <label class="text-xs font-bold text-slate-400 uppercase">Canal:</label>
                                <select onchange="window.MetodosPagoModule.filtrarPorTipo(this.value)" 
                                        class="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-emerald-500">
                                    <option value="all" ${filtroTipo === 'all' ? 'selected' : ''}>Todos los Canales</option>
                                    <option value="pago_movil" ${filtroTipo === 'pago_movil' ? 'selected' : ''}>Pago Móvil</option>
                                    <option value="transferencia" ${filtroTipo === 'transferencia' ? 'selected' : ''}>Transferencia Bancaria</option>
                                    <option value="punto_venta" ${filtroTipo === 'punto_venta' ? 'selected' : ''}>Punto de Venta / Tarjeta</option>
                                    <option value="efectivo" ${filtroTipo === 'efectivo' ? 'selected' : ''}>Efectivo en Taquilla</option>
                                </select>
                            </div>

                            <div class="flex items-center gap-2">
                                <label class="text-xs font-bold text-slate-400 uppercase">Cuenta Destino:</label>
                                <select onchange="window.MetodosPagoModule.filtrarPorCuenta(this.value)" 
                                        class="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-emerald-500">
                                    <option value="all" ${filtroCuenta === 'all' ? 'selected' : ''}>Todas las Cuentas</option>
                                    ${cuentas.map(c => `
                                        <option value="${c.id}" ${String(c.id) === String(filtroCuenta) ? 'selected' : ''}>
                                            ${c.banco} (${(c.numero || '').slice(-4)})
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>

                        <span class="text-xs font-mono text-slate-500 font-bold">${metodosFiltrados.length} canales listados</span>
                    </div>

                    <!-- Grid de Tarjetas de Métodos de Pago -->
                    ${metodosFiltrados.length === 0 ? `
                        <div class="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
                            <i class="fas fa-wallet text-4xl opacity-30"></i>
                            <div class="text-sm font-bold text-slate-300">No se encontraron métodos de pago</div>
                            <p class="text-xs text-slate-500 max-w-md mx-auto">
                                Presione "Nuevo Método de Pago" para crear un canal de cobro afiliado a una cuenta bancaria.
                            </p>
                        </div>
                    ` : `
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${metodosFiltrados.map(m => {
                                const canalInfo = CANALES.find(c => c.id === m.tipo) || CANALES[1];
                                const cuentaAsoc = cuentas.find(c => String(c.id) === String(m.cuenta_id));
                                const esActivo = m.activo !== false;

                                return `
                                    <div class="p-6 rounded-3xl bg-slate-900 border ${esActivo ? 'border-slate-800 hover:border-slate-700' : 'border-rose-950/40 opacity-70'} shadow-xl space-y-4 transition flex flex-col justify-between">
                                        <div class="space-y-3">
                                            <!-- Encabezado de la Tarjeta -->
                                            <div class="flex items-start justify-between gap-2">
                                                <div class="space-y-1">
                                                    <span class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${canalInfo.color}">
                                                        <i class="fas ${canalInfo.icon} text-[9px]"></i>
                                                        ${canalInfo.label}
                                                    </span>
                                                    <h3 class="text-sm font-black text-white tracking-wide leading-snug">${m.nombre}</h3>
                                                </div>
                                                <span class="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${esActivo ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}">
                                                    ${esActivo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>

                                            <!-- Datos Clave del Método de Pago -->
                                            <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                                                <div class="flex items-center justify-between">
                                                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Entidad</span>
                                                    <span class="font-bold text-slate-200">${m.banco || (cuentaAsoc ? cuentaAsoc.banco : 'No asignado')}</span>
                                                </div>

                                                ${m.tipo === 'pago_movil' ? `
                                                    <div class="flex items-center justify-between">
                                                        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Teléfono PM</span>
                                                        <span class="font-mono font-bold text-purple-400 select-all">${m.telefono || 'Sin teléfono'}</span>
                                                    </div>
                                                ` : ''}

                                                ${m.tipo === 'transferencia' ? `
                                                    <div class="space-y-0.5">
                                                        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cuenta Receptora</span>
                                                        <span class="font-mono font-bold text-sky-400 block select-all text-[11px]">
                                                            ${cuentaAsoc ? cuentaAsoc.numero : (m.numero || 'Sin cuenta asignada')}
                                                        </span>
                                                    </div>
                                                ` : ''}

                                                ${m.identificacion ? `
                                                    <div class="flex items-center justify-between">
                                                        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RIF / Cédula</span>
                                                        <span class="font-mono font-bold text-slate-300 select-all">${m.identificacion}</span>
                                                    </div>
                                                ` : ''}

                                                ${m.titular ? `
                                                    <div class="flex items-center justify-between">
                                                        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Titular</span>
                                                        <span class="text-slate-300 truncate max-w-[150px] text-right font-medium" title="${m.titular}">${m.titular}</span>
                                                    </div>
                                                ` : ''}
                                            </div>

                                            <!-- Vínculo con Cuenta Bancaria -->
                                            <div class="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-[11px]">
                                                <span class="text-slate-400 flex items-center gap-1.5">
                                                    <i class="fas fa-university text-sky-400 text-xs"></i>
                                                    <span>Cuenta Contable:</span>
                                                </span>
                                                <span class="font-mono font-bold text-slate-200 truncate max-w-[140px]">
                                                    ${cuentaAsoc ? `${cuentaAsoc.banco} (${cuentaAsoc.numero.slice(-4)})` : 'Sin Afiliación'}
                                                </span>
                                            </div>

                                            ${m.instrucciones ? `
                                                <p class="text-[11px] text-slate-400 italic line-clamp-2 px-1">
                                                    "${m.instrucciones}"
                                                </p>
                                            ` : ''}
                                        </div>

                                        <!-- Acciones Inferiores -->
                                        <div class="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                                            <button onclick="window.MetodosPagoModule.toggleEstado('${m.id}')" 
                                                    class="px-2.5 py-1.5 rounded-lg ${esActivo ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800' : 'text-emerald-400 hover:bg-emerald-500/10'} transition font-medium flex items-center gap-1 text-[11px]">
                                                <i class="fas ${esActivo ? 'fa-eye-slash' : 'fa-eye'}"></i>
                                                <span>${esActivo ? 'Ocultar' : 'Activar'}</span>
                                            </button>
                                            <div class="flex items-center gap-1">
                                                <button onclick="window.MetodosPagoModule.abrirModalForm('${m.id}')" 
                                                        class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-lg border border-slate-700 transition flex items-center gap-1">
                                                    <i class="fas fa-edit text-[10px]"></i>
                                                    <span>Editar</span>
                                                </button>
                                                <button onclick="window.MetodosPagoModule.eliminarMetodo('${m.id}')" 
                                                        title="Eliminar método"
                                                        class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition text-xs">
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
            `;
        },

        filtrarPorTipo: function(val) {
            filtroTipo = val;
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        filtrarPorCuenta: function(val) {
            filtroCuenta = val;
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        // Abre el modal para Crear o Editar un Método de Pago
        abrirModalForm: function(metodoId) {
            let modal = document.getElementById('modal-form-metodo-pago');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'modal-form-metodo-pago';
                modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in';
                document.body.appendChild(modal);
            }

            const store = global.HaciendaStore;
            const cuentas = store ? (store.get('hacienda_cuentas') || []).filter(c => c.estado !== 'inactiva') : [];
            const metodos = this.getAll();
            const metodo = metodoId ? metodos.find(m => String(m.id) === String(metodoId)) : null;
            const esEdicion = !!metodo;

            const tipoDefault = metodo ? metodo.tipo : 'pago_movil';
            const cuentaIdDefault = metodo ? metodo.cuenta_id : (cuentas[0] ? cuentas[0].id : '');
            const nombreDefault = metodo ? metodo.nombre : 'Pago Móvil Banco de Venezuela';
            const telefonoDefault = metodo ? (metodo.telefono || '') : '0412-';
            const rifDefault = metodo ? (metodo.identificacion || '') : 'G-20000123-4';
            const titularDefault = metodo ? (metodo.titular || '') : 'Alcaldía del Municipio San José de Guaribe';
            const instruccionesDefault = metodo ? (metodo.instrucciones || '') : 'Indicar el número de RIF del comercio en la descripción.';
            const ordenDefault = metodo ? (metodo.orden || 1) : 1;
            const activoDefault = metodo ? (metodo.activo !== false) : true;

            modal.innerHTML = `
                <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div class="space-y-0.5">
                            <span class="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                                ${esEdicion ? 'Actualización de Canal' : 'Configuración de Canal Oficial'}
                            </span>
                            <h3 class="text-lg font-black text-slate-100 flex items-center gap-2">
                                <i class="fas fa-wallet text-emerald-400"></i>
                                ${esEdicion ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
                            </h3>
                        </div>
                        <button onclick="window.MetodosPagoModule.cerrarModalForm()" 
                                class="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition">
                            <i class="fas fa-times text-base"></i>
                        </button>
                    </div>

                    <form id="form-metodo-pago" onsubmit="window.MetodosPagoModule.guardarMetodo(event, '${metodo ? metodo.id : ''}')" class="space-y-4">
                        <!-- Canal / Tipo de Método -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tipo de Canal / Instrumento</label>
                            <select id="mp-tipo" onchange="window.MetodosPagoModule.onTipoChange(this.value)" 
                                    class="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition cursor-pointer">
                                <option value="pago_movil" ${tipoDefault === 'pago_movil' ? 'selected' : ''}>Pago Móvil Interbancario (P2P / C2P)</option>
                                <option value="transferencia" ${tipoDefault === 'transferencia' ? 'selected' : ''}>Transferencia Bancaria Nacional</option>
                                <option value="punto_venta" ${tipoDefault === 'punto_venta' ? 'selected' : ''}>Punto de Venta / Tarjeta de Débito</option>
                                <option value="efectivo" ${tipoDefault === 'efectivo' ? 'selected' : ''}>Efectivo en Taquilla</option>
                            </select>
                        </div>

                        <!-- Cuenta Bancaria Destino Afiliada -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cuenta Bancaria Destino (Afiliación Contable)</label>
                            <select id="mp-cuenta-id" onchange="window.MetodosPagoModule.onCuentaChange(this.value)" required
                                    class="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition cursor-pointer">
                                ${cuentas.length === 0 ? `
                                    <option value="">No hay cuentas bancarias registradas</option>
                                ` : cuentas.map(c => `
                                    <option value="${c.id}" data-banco="${c.banco}" data-numero="${c.numero}" ${String(c.id) === String(cuentaIdDefault) ? 'selected' : ''}>
                                        ${c.banco} — ${c.numero} (${c.concepto || 'Recaudación'})
                                    </option>
                                `).join('')}
                            </select>
                            <span class="text-[11px] text-slate-500 block">Toda recaudación recibida por este canal se conciliará automáticamente contra los extractos de esta cuenta.</span>
                        </div>

                        <!-- Nombre / Etiqueta del Método -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nombre Visible para el Contribuyente</label>
                            <input type="text" id="mp-nombre" required
                                   value="${nombreDefault}"
                                   placeholder="Ej: Pago Móvil Banco de Venezuela"
                                   class="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition">
                        </div>

                        <!-- Bloque Específico para Pago Móvil -->
                        <div id="mp-box-pago-movil" class="space-y-3 ${tipoDefault === 'pago_movil' ? '' : 'hidden'} p-4 rounded-2xl bg-purple-500/5 border border-purple-500/15">
                            <span class="text-[11px] font-bold text-purple-400 uppercase tracking-wider block flex items-center gap-1.5">
                                <i class="fas fa-mobile-alt"></i>
                                Datos Requeridos para Pago Móvil
                            </span>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div class="space-y-1">
                                    <label class="text-[11px] font-bold text-slate-400 block">Número de Teléfono</label>
                                    <input type="text" id="mp-telefono" placeholder="Ej: 0412-1234567"
                                           value="${telefonoDefault}"
                                           class="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono font-bold rounded-xl px-3 py-2 outline-none focus:border-purple-500">
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[11px] font-bold text-slate-400 block">RIF / Cédula del Titular</label>
                                    <input type="text" id="mp-identificacion" placeholder="Ej: G-20000123-4"
                                           value="${rifDefault}"
                                           class="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono font-bold rounded-xl px-3 py-2 outline-none focus:border-purple-500">
                                </div>
                            </div>
                        </div>

                        <!-- Titular de la Cuenta / Razón Social -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nombre del Titular Institucional</label>
                            <input type="text" id="mp-titular" required
                                   value="${titularDefault}"
                                   placeholder="Ej: Alcaldía del Municipio San José de Guaribe"
                                   class="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-medium rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition">
                        </div>

                        <!-- Instrucciones y Orden -->
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div class="sm:col-span-2 space-y-1.5">
                                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Instrucciones Adicionales</label>
                                <input type="text" id="mp-instrucciones"
                                       value="${instruccionesDefault}"
                                       placeholder="Ej: Indicar el número de RIF en el concepto"
                                       class="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-medium rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition">
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Orden</label>
                                <input type="number" id="mp-orden" min="1" max="99"
                                       value="${ordenDefault}"
                                       class="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono font-bold rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition">
                            </div>
                        </div>

                        <!-- Estado -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Estado</label>
                            <select id="mp-activo" class="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition cursor-pointer">
                                <option value="true" ${activoDefault ? 'selected' : ''}>Activo (Visible en Portal del Comerciante)</option>
                                <option value="false" ${!activoDefault ? 'selected' : ''}>Inactivo (Oculto en Portal)</option>
                            </select>
                        </div>

                        <!-- Botones -->
                        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                            <button type="button" onclick="window.MetodosPagoModule.cerrarModalForm()" 
                                    class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition">
                                Cancelar
                            </button>
                            <button type="submit" 
                                    class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center gap-2">
                                <i class="fas fa-save text-xs"></i>
                                <span>${esEdicion ? 'Actualizar Método' : 'Guardar Método'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            `;
            modal.classList.remove('hidden');
        },

        cerrarModalForm: function() {
            const modal = document.getElementById('modal-form-metodo-pago');
            if (modal) modal.classList.add('hidden');
        },

        onTipoChange: function(tipo) {
            const boxPm = document.getElementById('mp-box-pago-movil');
            const inputNombre = document.getElementById('mp-nombre');
            const selectCuenta = document.getElementById('mp-cuenta-id');
            const optCuenta = selectCuenta ? selectCuenta.options[selectCuenta.selectedIndex] : null;
            const banco = optCuenta ? (optCuenta.dataset.banco || '') : '';

            if (boxPm) {
                if (tipo === 'pago_movil') {
                    boxPm.classList.remove('hidden');
                } else {
                    boxPm.classList.add('hidden');
                }
            }

            if (inputNombre && banco) {
                const mapNombres = {
                    'pago_movil': `Pago Móvil ${banco}`,
                    'transferencia': `Transferencia Bancaria ${banco}`,
                    'punto_venta': `Punto de Venta ${banco} (Taquilla)`,
                    'efectivo': 'Efectivo en Taquilla Central'
                };
                if (mapNombres[tipo]) inputNombre.value = mapNombres[tipo];
            }
        },

        onCuentaChange: function(cuentaId) {
            const selectCuenta = document.getElementById('mp-cuenta-id');
            const optCuenta = selectCuenta ? selectCuenta.options[selectCuenta.selectedIndex] : null;
            const banco = optCuenta ? (optCuenta.dataset.banco || '') : '';
            const tipo = document.getElementById('mp-tipo')?.value || 'pago_movil';
            const inputNombre = document.getElementById('mp-nombre');

            if (inputNombre && banco) {
                const mapNombres = {
                    'pago_movil': `Pago Móvil ${banco}`,
                    'transferencia': `Transferencia Bancaria ${banco}`,
                    'punto_venta': `Punto de Venta ${banco} (Taquilla)`,
                    'efectivo': 'Efectivo en Taquilla Central'
                };
                if (mapNombres[tipo]) inputNombre.value = mapNombres[tipo];
            }
        },

        // Guardar método en store con ciclo inquebrantable a 0ms
        guardarMetodo: async function(e, metodoId) {
            if (e && e.preventDefault) e.preventDefault();
            const store = global.HaciendaStore;
            if (!store) return;

            const tipo = document.getElementById('mp-tipo').value;
            const cuentaId = document.getElementById('mp-cuenta-id').value;
            const nombre = document.getElementById('mp-nombre').value.trim();
            const telefono = document.getElementById('mp-telefono')?.value.trim() || '';
            const identificacion = document.getElementById('mp-identificacion')?.value.trim() || '';
            const titular = document.getElementById('mp-titular').value.trim();
            const instrucciones = document.getElementById('mp-instrucciones').value.trim();
            const orden = parseInt(document.getElementById('mp-orden').value || 1, 10);
            const activo = document.getElementById('mp-activo').value === 'true';

            if (!nombre) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'warning', title: 'Nombre requerido', text: 'Ingrese un nombre descriptivo para el método de pago.', confirmButtonColor: '#059669' });
                }
                return;
            }

            const cuentas = store.get('hacienda_cuentas') || [];
            const cAsoc = cuentas.find(c => String(c.id) === String(cuentaId));
            const banco = cAsoc ? cAsoc.banco : '';

            const id = metodoId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'met_' + Date.now());
            const metodos = this.getAll();
            const anterior = metodoId ? metodos.find(m => String(m.id) === String(metodoId)) : null;

            const metodoObj = {
                id: id,
                cuenta_id: cuentaId,
                tipo: tipo,
                nombre: nombre,
                banco: banco,
                telefono: telefono,
                identificacion: identificacion,
                titular: titular,
                instrucciones: instrucciones,
                activo: activo,
                orden: orden,
                created_at: anterior ? (anterior.created_at || new Date().toISOString()) : new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await store.set('hacienda_metodos_pago', metodoObj);

            this.cerrarModalForm();
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: metodoId ? 'Método Actualizado' : 'Método Registrado',
                    text: `El canal "${nombre}" ha sido guardado exitosamente.`,
                    confirmButtonColor: '#059669'
                });
            }
        },

        toggleEstado: async function(metodoId) {
            const store = global.HaciendaStore;
            if (!store || !metodoId) return;

            const metodos = this.getAll();
            const m = metodos.find(item => String(item.id) === String(metodoId));
            if (!m) return;

            const nuevoActivo = !(m.activo !== false);
            const actualizado = {
                ...m,
                activo: nuevoActivo,
                updated_at: new Date().toISOString()
            };

            await store.set('hacienda_metodos_pago', actualizado);
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'info',
                    title: nuevoActivo ? 'Canal Activado' : 'Canal Ocultado',
                    text: nuevoActivo 
                        ? `El método "${m.nombre}" ahora es visible en el portal del comerciante.` 
                        : `El método "${m.nombre}" ha sido ocultado del portal público.`,
                    confirmButtonColor: '#059669'
                });
            }
        },

        eliminarMetodo: async function(metodoId) {
            const store = global.HaciendaStore;
            if (!store || !metodoId) return;

            const metodos = this.getAll();
            const m = metodos.find(item => String(item.id) === String(metodoId));
            if (!m) return;

            // Verificar si hay pagos asociados
            const pagos = store.get('hacienda_pagos') || [];
            const tienePagos = pagos.some(p => String(p.metodo_pago_id) === String(metodoId));

            if (tienePagos) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Método con Pagos Asociados',
                        text: 'Este canal posee reportes de pago registrados en la recaudación. Para preservar la trazabilidad no puede eliminarse; puede marcarlo como "Inactivo" para ocultarlo del portal.',
                        confirmButtonColor: '#059669'
                    });
                }
                return;
            }

            if (typeof Swal !== 'undefined') {
                const res = await Swal.fire({
                    icon: 'question',
                    title: '¿Eliminar Método de Pago?',
                    text: `¿Confirma que desea eliminar el canal "${m.nombre}"? Esta acción no se puede deshacer.`,
                    showCancelButton: true,
                    confirmButtonText: 'Sí, Eliminar',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#e11d48',
                    cancelButtonColor: '#64748b'
                });
                if (!res.isConfirmed) return;
            }

            await store.remove('hacienda_metodos_pago', metodoId);
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Método Eliminado',
                    text: 'El canal de recaudación ha sido eliminado permanentemente.',
                    confirmButtonColor: '#059669'
                });
            }
        },

        abrirModal: function(metodoId) { return this.abrirModalForm(metodoId); },
        cerrarModal: function() { return this.cerrarModalForm(); },
        guardar: function(e, metodoId) { return this.guardarMetodo(e, metodoId); },
        toggleActivo: function(metodoId) { return this.toggleEstado(metodoId); },
        eliminar: function(metodoId) { return this.eliminarMetodo(metodoId); }
    };

    global.MetodosPagoModule = MetodosPagoModule;
})(typeof window !== 'undefined' ? window : this);
