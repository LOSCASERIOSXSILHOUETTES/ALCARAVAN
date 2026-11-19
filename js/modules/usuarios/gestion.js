/**
 * ALCARAVAN — Módulo de Gestión de Usuarios y Matriz de Permisos ACL
 * Arquitectura SGB Silhouettes V3 (0ms Latencia, Offline-First, Supabase Bi-Sync)
 */
(function defineUsuariosModule(global) {
    "use strict";

    const ROSTER_PERMISOS = [
        {
            grupo: "Padrón de Contribuyentes (RUC)",
            icon: "fa-id-card",
            permisos: [
                { id: "contribuyentes_ver", nombre: "Ver Contribuyentes", desc: "Consultar lista de comercios, RUC y expedientes." },
                { id: "contribuyentes_crear", nombre: "Registrar Comercio", desc: "Crear nuevos contribuyentes y solicitudes de censo." },
                { id: "contribuyentes_editar", nombre: "Modificar Datos", desc: "Editar razón social, representante, dirección fiscal y fotos." },
                { id: "contribuyentes_eliminar", nombre: "Dar de Baja", desc: "Eliminar comercios del padrón municipal." }
            ]
        },
        {
            grupo: "Licencias y Patentes (LOCAT)",
            icon: "fa-certificate",
            permisos: [
                { id: "patentes_ver", nombre: "Ver Licencias", desc: "Consultar patentes activas y actividades comerciales." },
                { id: "patentes_crear", nombre: "Emitir Licencia", desc: "Asignar ramos de actividad económica y alícuotas LOCAT." },
                { id: "patentes_editar", nombre: "Renovar / Modificar", desc: "Renovaciones anuales y cambio de código de actividad." },
                { id: "patentes_eliminar", nombre: "Revocar Licencia", desc: "Anular o suspender licencias comerciales otorgadas." }
            ]
        },
        {
            grupo: "Autoliquidaciones & Declaraciones",
            icon: "fa-file-invoice-dollar",
            permisos: [
                { id: "declaraciones_ver", nombre: "Ver Declaraciones", desc: "Consultar declaraciones juradas de ingresos brutos." },
                { id: "declaraciones_crear", nombre: "Registrar Declaración", desc: "Cargar autoliquidación mensual del contribuyente." },
                { id: "declaraciones_aprobar", nombre: "Validar y Liquidar", desc: "Aprobar cálculo de impuesto determinado a tasa BCV." },
                { id: "declaraciones_eliminar", nombre: "Anular Declaración", desc: "Revertir o anular declaraciones registradas con error." }
            ]
        },
        {
            grupo: "Taquilla de Recaudación y Caja",
            icon: "fa-cash-register",
            permisos: [
                { id: "caja_ver", nombre: "Ver Taquilla de Caja", desc: "Consultar ingresos de taquilla y recibos emitidos." },
                { id: "caja_cobrar", nombre: "Registrar Cobros", desc: "Emitir recibos de pago en Bs., divisas o transferencias." },
                { id: "caja_anular", nombre: "Anular Recibos", desc: "Anular recibos de cobro de taquilla emitidos." },
                { id: "caja_cierre", nombre: "Cierre de Caja", desc: "Generar arqueos diarios y reportes de recaudación." }
            ]
        },
        {
            grupo: "Conciliación Bancaria y Smart Ledger",
            icon: "fa-balance-scale",
            permisos: [
                { id: "conciliacion_ver", nombre: "Ver Conciliación", desc: "Consultar libros mayores y balances de cuentas recaudadoras." },
                { id: "conciliacion_cargar", nombre: "Cargar Extractos", desc: "Importar estados de cuenta en PDF o archivos TXT." },
                { id: "conciliacion_parear", nombre: "Ejecutar Smart Ledger", desc: "Emparejar automáticamente pagos reportados contra extractos." },
                { id: "conciliacion_eliminar", nombre: "Eliminar Registros", desc: "Eliminar registros o desgloses bancarios erróneos." }
            ]
        },
        {
            grupo: "Solvencias Municipales Automatizadas con QR",
            icon: "fa-stamp",
            permisos: [
                { id: "solvencias_ver", nombre: "Ver Solvencias", desc: "Consultar certificados emitidos y código de verificación QR." },
                { id: "solvencias_emitir", nombre: "Emitir Solvencia Oficial", desc: "Generar y firmar digitalmente solvencias fiscales." },
                { id: "solvencias_anular", nombre: "Revocar Solvencia", desc: "Anular certificados de solvencia vigentes." }
            ]
        },
        {
            grupo: "Comunicación Oficial y Portada",
            icon: "fa-bullhorn",
            permisos: [
                { id: "comunicacion_ver", nombre: "Ver Comunicación", desc: "Consultar panel de carrusel hero y popups de portada." },
                { id: "comunicacion_carrusel", nombre: "Administrar Carrusel", desc: "Crear, editar y ordenar slides de la portada." },
                { id: "comunicacion_popups", nombre: "Administrar Popups", desc: "Configurar comunicados, decretos y volantes emergentes." },
                { id: "comunicacion_eliminar", nombre: "Eliminar Avisos", desc: "Suprimir campañas o comunicados de la portada." }
            ]
        },
        {
            grupo: "Administración & Seguridad",
            icon: "fa-user-shield",
            permisos: [
                { id: "admin_usuarios", nombre: "Gestión de Usuarios", desc: "Crear funcionarios, modificar perfiles y asignar permisos ACL." },
                { id: "admin_todo", nombre: "Acceso Maestro (Superadmin)", desc: "Pase irrestricto a todas las funcionalidades del sistema." }
            ]
        }
    ];

    let currentSearch = "";
    let currentRoleFilter = "todos";
    let currentStatusFilter = "todos";
    let usuarioEditandoId = null;

    function safeParsePerms(perms) {
        if (!perms) return {};
        if (typeof perms === 'object' && !Array.isArray(perms)) return perms;
        try { return JSON.parse(perms); } catch (_) { return {}; }
    }

    const Usuarios = {
        ROSTER_PERMISOS: ROSTER_PERMISOS,

        getUsers: function() {
            const store = global.HaciendaStore;
            return store ? (store.get('user_profiles') || []) : [];
        },

        render: function(container) {
            if (!container) return;

            // Verificar si el usuario en sesión tiene permiso de administración
            const auth = global.HaciendaAuth;
            const canManage = auth && (auth.hasPermission('admin_usuarios') || auth.hasPermission('admin_todo'));

            if (!canManage) {
                container.innerHTML = `
                    <div class="max-w-md mx-auto py-16 text-center text-left">
                        <div class="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl mb-4 shadow-lg shadow-rose-500/5">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h2 class="text-base sm:text-lg font-black text-white tracking-tight">Área Restringida</h2>
                        <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                            Solo el personal con perfil de <strong class="text-white">Administrador</strong> o permiso <code class="bg-slate-800 text-sky-400 px-1.5 py-0.5 rounded text-[11px]">admin_usuarios</code> puede acceder a la gestión de cuentas y permisos.
                        </p>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="space-y-6 animate-fade-in text-left">
                    <!-- Header y Botón Nuevo -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div>
                            <div class="inline-flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                                <i class="fas fa-user-shield"></i>
                                <span>Control de Acceso y Seguridad (ACL)</span>
                            </div>
                            <h2 class="text-xl font-bold text-slate-100">Gestión de Usuarios y Permisos</h2>
                            <p class="text-xs text-slate-400 mt-1">Cuentas institucionales, roles y matriz de permisos por módulo tributario.</p>
                        </div>
                        <button onclick="window.UsuariosModule.abrirModalNuevo()" 
                                class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 shrink-0">
                            <i class="fas fa-user-plus"></i>
                            <span>Nuevo Usuario</span>
                        </button>
                    </div>

                    <!-- KPIs de Usuarios -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                            <div class="text-[10px] font-mono uppercase text-slate-400 font-bold">Total Funcionarios</div>
                            <div id="kpi-total-usuarios" class="text-2xl font-black text-white mt-1">0</div>
                            <div class="text-[10px] text-slate-500 mt-0.5">En el padrón de usuarios</div>
                        </div>
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                            <div class="text-[10px] font-mono uppercase text-amber-400 font-bold">Administradores</div>
                            <div id="kpi-admin-usuarios" class="text-2xl font-black text-amber-400 mt-1">0</div>
                            <div class="text-[10px] text-slate-500 mt-0.5">Control total del sistema</div>
                        </div>
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                            <div class="text-[10px] font-mono uppercase text-emerald-400 font-bold">Activos</div>
                            <div id="kpi-activos-usuarios" class="text-2xl font-black text-emerald-400 mt-1">0</div>
                            <div class="text-[10px] text-slate-500 mt-0.5">Habilitados para ingresar</div>
                        </div>
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                            <div class="text-[10px] font-mono uppercase text-sky-400 font-bold">Operadores / Caja</div>
                            <div id="kpi-operadores-usuarios" class="text-2xl font-black text-sky-400 mt-1">0</div>
                            <div class="text-[10px] text-slate-500 mt-0.5">Con permisos de taquilla</div>
                        </div>
                    </div>

                    <!-- Filtros y Búsqueda -->
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                        <div class="relative w-full sm:w-80">
                            <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                            <input type="text" id="usr-search-input" placeholder="Buscar por nombre, correo o cargo..." 
                                   oninput="window.UsuariosModule.filtrarBusqueda(this.value)"
                                   class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500">
                        </div>
                        <div class="flex items-center gap-2 w-full sm:w-auto">
                            <select id="usr-filter-rol" onchange="window.UsuariosModule.filtrarRol(this.value)" 
                                    class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-amber-500">
                                <option value="todos">Todos los Roles</option>
                                <option value="admin">Administrador</option>
                                <option value="fiscal">Fiscal Tributario</option>
                                <option value="auditor">Auditor</option>
                                <option value="cajero">Cajero / Taquilla</option>
                                <option value="operador">Operador</option>
                            </select>
                            <select id="usr-filter-status" onchange="window.UsuariosModule.filtrarEstado(this.value)" 
                                    class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-amber-500">
                                <option value="todos">Todos los Estados</option>
                                <option value="activo">Solo Activos</option>
                                <option value="inactivo">Solo Pausados</option>
                            </select>
                        </div>
                    </div>

                    <!-- Tabla de Usuarios -->
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div id="usuarios-table-container">
                            ${this.renderTablaUsuarios()}
                        </div>
                    </div>
                </div>

                <!-- Modal de Creación / Edición de Usuario -->
                ${this.renderModalUsuario()}
            `;

            this.actualizarKPIs();
        },

        actualizarKPIs: function() {
            const users = this.getUsers();
            const elTotal = document.getElementById('kpi-total-usuarios');
            const elAdmin = document.getElementById('kpi-admin-usuarios');
            const elActivos = document.getElementById('kpi-activos-usuarios');
            const elOp = document.getElementById('kpi-operadores-usuarios');

            if (elTotal) elTotal.innerText = users.length;
            if (elAdmin) elAdmin.innerText = users.filter(u => (u.rol || '').toLowerCase().includes('admin')).length;
            if (elActivos) elActivos.innerText = users.filter(u => u.activo !== false).length;
            if (elOp) elOp.innerText = users.filter(u => (u.rol || '').toLowerCase().includes('caj') || (u.rol || '').toLowerCase().includes('oper')).length;
        },

        renderTablaUsuarios: function() {
            let users = this.getUsers();

            if (currentSearch) {
                const q = currentSearch.toLowerCase();
                users = users.filter(u => 
                    (u.nombre || '').toLowerCase().includes(q) ||
                    (u.email || '').toLowerCase().includes(q) ||
                    (u.cargo || '').toLowerCase().includes(q)
                );
            }

            if (currentRoleFilter !== 'todos') {
                users = users.filter(u => (u.rol || '').toLowerCase() === currentRoleFilter);
            }

            if (currentStatusFilter !== 'todos') {
                const reqActivo = currentStatusFilter === 'activo';
                users = users.filter(u => (u.activo !== false) === reqActivo);
            }

            if (users.length === 0) {
                return `
                    <div class="p-12 text-center text-slate-500 italic text-xs">
                        No se encontraron usuarios registrados con los criterios seleccionados.
                    </div>
                `;
            }

            return `
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                            <tr>
                                <th class="py-3 px-4 font-bold">Funcionario</th>
                                <th class="py-3 px-4 font-bold">Cargo</th>
                                <th class="py-3 px-4 font-bold">Rol Principal</th>
                                <th class="py-3 px-4 font-bold">Permisos ACL</th>
                                <th class="py-3 px-4 font-bold">Estado</th>
                                <th class="py-3 px-4 font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/60 text-slate-300">
                            ${users.map(u => {
                                const perms = safeParsePerms(u.permisos);
                                const numPerms = Object.values(perms).filter(Boolean).length;
                                const esAdmin = (u.rol || '').toLowerCase().includes('admin');
                                const initial = (u.nombre || u.email || 'U').charAt(0).toUpperCase();

                                return `
                                    <tr class="hover:bg-slate-800/30 transition">
                                        <td class="py-3 px-4">
                                            <div class="flex items-center gap-3">
                                                <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-sky-500/20 border border-amber-500/30 text-amber-300 font-black flex items-center justify-center shrink-0">
                                                    ${initial}
                                                </div>
                                                <div>
                                                    <div class="font-bold text-slate-100 text-sm">${u.nombre || 'Sin nombre'}</div>
                                                    <div class="text-[11px] text-slate-400 font-mono">${u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="py-3 px-4 text-slate-300 font-medium">
                                            ${u.cargo || 'Funcionario'}
                                        </td>
                                        <td class="py-3 px-4">
                                            <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                                                esAdmin ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                                                u.rol === 'fiscal' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                                                u.rol === 'auditor' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' :
                                                u.rol === 'cajero' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                                                'bg-slate-800 text-slate-400 border border-slate-700'
                                            }">
                                                ${u.rol || 'recaudador'}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 font-mono text-[11px]">
                                            ${esAdmin ? `
                                                <span class="text-amber-400 font-bold">Acceso Total</span>
                                            ` : `
                                                <span class="text-sky-400 font-semibold">${numPerms} permisos activos</span>
                                            `}
                                        </td>
                                        <td class="py-3 px-4">
                                            <button onclick="window.UsuariosModule.toggleActivo('${u.user_id || u.id}')" 
                                                    class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition flex items-center gap-1.5 ${
                                                        u.activo !== false ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                                                    }">
                                                <span class="w-1.5 h-1.5 rounded-full ${u.activo !== false ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}"></span>
                                                <span>${u.activo !== false ? 'ACTIVO' : 'PAUSADO'}</span>
                                            </button>
                                        </td>
                                        <td class="py-3 px-4 text-right space-x-2">
                                            <button onclick="window.UsuariosModule.abrirModalEditar('${u.user_id || u.id}')" 
                                                    class="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg transition" title="Editar Permisos">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="window.UsuariosModule.eliminar('${u.user_id || u.id}')" 
                                                    class="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition" title="Eliminar Usuario">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        },

        renderModalUsuario: function() {
            return `
                <div id="modal-usuario-form" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in text-left max-h-[90vh] flex flex-col">
                        <!-- Cabecera -->
                        <div class="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                            <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <i class="fas fa-user-shield text-amber-400"></i>
                                <span id="modal-usuario-titulo">Nuevo Funcionario</span>
                            </h3>
                            <button onclick="window.UsuariosModule.cerrarModal()" class="text-slate-400 hover:text-slate-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <!-- Formulario con scroll -->
                        <form id="form-usuario" onsubmit="window.UsuariosModule.guardar(event)" class="p-6 space-y-5 text-xs overflow-y-auto flex-1">
                            <!-- Datos Personales -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Nombre y Apellido *</label>
                                    <input type="text" id="usr-nombre" required placeholder="Lcdo. Pedro Pérez" 
                                           class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Correo Institucional *</label>
                                    <input type="email" id="usr-email" required placeholder="funcionario@satrimg.gob.ve" 
                                           class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500 font-mono">
                                </div>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Contraseña <span id="usr-pass-note" class="text-slate-500 font-normal"></span></label>
                                    <input type="password" id="usr-password" placeholder="••••••••" 
                                           class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500 font-mono">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Cargo / Departamento</label>
                                    <input type="text" id="usr-cargo" placeholder="Ej: Recaudación / Fiscalización" 
                                           class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Rol de Acceso</label>
                                    <select id="usr-rol" onchange="window.UsuariosModule.aplicarPresetRol(this.value)" 
                                            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500">
                                        <option value="recaudador">Recaudador / Taquilla</option>
                                        <option value="fiscal">Fiscal de Rentas</option>
                                        <option value="auditor">Auditor Interno</option>
                                        <option value="admin">Administrador General</option>
                                        <option value="operador">Operador de Censo</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Matriz de Permisos Granulares ACL -->
                            <div class="pt-2 border-t border-slate-800 space-y-4">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <h4 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Matriz de Permisos Específicos</h4>
                                        <p class="text-[11px] text-slate-400">Selecciona o desmarca los accesos a cada herramienta del sistema.</p>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <button type="button" onclick="window.UsuariosModule.marcarTodos(true)" class="text-[11px] text-sky-400 hover:underline">Marcar Todos</button>
                                        <span class="text-slate-600">·</span>
                                        <button type="button" onclick="window.UsuariosModule.marcarTodos(false)" class="text-[11px] text-slate-400 hover:underline">Desmarcar</button>
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    ${ROSTER_PERMISOS.map(grupo => `
                                        <div class="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                                            <div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                                                <span class="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                                                    <i class="fas ${grupo.icon} text-amber-400 text-[11px]"></i>
                                                    <span>${grupo.grupo}</span>
                                                </span>
                                            </div>
                                            <div class="space-y-1.5 pt-1">
                                                ${grupo.permisos.map(p => `
                                                    <label class="flex items-start gap-2 cursor-pointer hover:text-white transition">
                                                        <input type="checkbox" id="perm_${p.id}" data-perm="${p.id}" class="usr-perm-check mt-0.5 rounded text-amber-500 bg-slate-900 border-slate-700">
                                                        <div>
                                                            <div class="font-semibold text-slate-200 text-[11px] leading-tight">${p.nombre}</div>
                                                            <div class="text-[10px] text-slate-500 leading-tight">${p.desc}</div>
                                                        </div>
                                                    </label>
                                                `).join('')}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="flex items-center gap-2 pt-2 border-t border-slate-800">
                                <input type="checkbox" id="usr-activo" checked class="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-800">
                                <label for="usr-activo" class="text-xs font-bold text-slate-300 cursor-pointer">Usuario activo (Habilitado para iniciar sesión)</label>
                            </div>

                            <div class="flex justify-end gap-3 pt-4 border-t border-slate-800 shrink-0">
                                <button type="button" onclick="window.UsuariosModule.cerrarModal()" 
                                        class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition">
                                    Cancelar
                                </button>
                                <button type="submit" id="btn-guardar-usuario" 
                                        class="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition shadow-lg">
                                    Guardar Funcionario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        },

        abrirModalNuevo: function() {
            usuarioEditandoId = null;
            document.getElementById('modal-usuario-titulo').innerText = 'Nuevo Funcionario';
            document.getElementById('form-usuario').reset();
            document.getElementById('usr-email').disabled = false;
            document.getElementById('usr-password').required = true;
            document.getElementById('usr-pass-note').innerText = '*';
            document.getElementById('usr-activo').checked = true;
            this.aplicarPresetRol('recaudador');
            document.getElementById('modal-usuario-form').classList.remove('hidden');
        },

        abrirModalEditar: function(userId) {
            const users = this.getUsers();
            const u = users.find(item => String(item.user_id || item.id) === String(userId));
            if (!u) return;

            usuarioEditandoId = u.user_id || u.id;
            document.getElementById('modal-usuario-titulo').innerText = 'Editar Funcionario y Permisos';
            document.getElementById('usr-nombre').value = u.nombre || '';
            document.getElementById('usr-email').value = u.email || '';
            document.getElementById('usr-email').disabled = true;
            document.getElementById('usr-password').value = '';
            document.getElementById('usr-password').required = false;
            document.getElementById('usr-pass-note').innerText = '(Dejar en blanco para conservar actual)';
            document.getElementById('usr-cargo').value = u.cargo || '';
            document.getElementById('usr-rol').value = u.rol || 'recaudador';
            document.getElementById('usr-activo').checked = u.activo !== false;

            const perms = safeParsePerms(u.permisos);
            document.querySelectorAll('.usr-perm-check').forEach(chk => {
                const permId = chk.getAttribute('data-perm');
                chk.checked = perms[permId] === true;
            });

            document.getElementById('modal-usuario-form').classList.remove('hidden');
        },

        cerrarModal: function() {
            document.getElementById('modal-usuario-form').classList.add('hidden');
            usuarioEditandoId = null;
        },

        marcarTodos: function(marcar) {
            document.querySelectorAll('.usr-perm-check').forEach(chk => {
                chk.checked = !!marcar;
            });
        },

        aplicarPresetRol: function(rol) {
            this.marcarTodos(false);
            const r = (rol || '').toLowerCase();

            if (r === 'admin') {
                this.marcarTodos(true);
            } else if (r === 'fiscal') {
                const fiscalPerms = ['contribuyentes_ver', 'contribuyentes_editar', 'patentes_ver', 'patentes_crear', 'patentes_editar', 'declaraciones_ver', 'declaraciones_aprobar', 'solvencias_ver', 'solvencias_emitir', 'conciliacion_ver'];
                fiscalPerms.forEach(p => {
                    const chk = document.getElementById('perm_' + p);
                    if (chk) chk.checked = true;
                });
            } else if (r === 'auditor') {
                document.querySelectorAll('.usr-perm-check').forEach(chk => {
                    const p = chk.getAttribute('data-perm');
                    if (p.endsWith('_ver') || p === 'caja_cierre') chk.checked = true;
                });
            } else if (r === 'cajero' || r === 'recaudador') {
                const cajaPerms = ['caja_ver', 'caja_cobrar', 'caja_cierre', 'declaraciones_ver', 'contribuyentes_ver', 'solvencias_ver'];
                cajaPerms.forEach(p => {
                    const chk = document.getElementById('perm_' + p);
                    if (chk) chk.checked = true;
                });
            } else if (r === 'operador') {
                const opPerms = ['contribuyentes_ver', 'contribuyentes_crear', 'patentes_ver', 'declaraciones_ver', 'solvencias_ver'];
                opPerms.forEach(p => {
                    const chk = document.getElementById('perm_' + p);
                    if (chk) chk.checked = true;
                });
            }
        },

        guardar: async function(e) {
            e.preventDefault();
            const store = global.HaciendaStore;
            if (!store) return;

            const btn = document.getElementById('btn-guardar-usuario');
            if (btn) { btn.disabled = true; btn.innerText = 'Guardando...'; }

            try {
                const nombre = document.getElementById('usr-nombre').value.trim();
                const email = document.getElementById('usr-email').value.trim().toLowerCase();
                const password = document.getElementById('usr-password').value.trim();
                const cargo = document.getElementById('usr-cargo').value.trim();
                const rol = document.getElementById('usr-rol').value;
                const activo = document.getElementById('usr-activo').checked;

                const perms = {};
                document.querySelectorAll('.usr-perm-check').forEach(chk => {
                    const permId = chk.getAttribute('data-perm');
                    if (chk.checked) perms[permId] = true;
                });

                if (rol === 'admin') {
                    perms.admin_todo = true;
                    perms.admin_usuarios = true;
                }

                if (!usuarioEditandoId) {
                    // Creación
                    const res = await global.HaciendaAuth.registrarFuncionario(email, password, {
                        nombre, cargo, rol, permisos: perms
                    });
                    if (!res.success) throw new Error(res.message);
                } else {
                    // Edición
                    const users = this.getUsers();
                    const existing = users.find(u => String(u.user_id || u.id) === String(usuarioEditandoId));
                    const updated = {
                        ...(existing || {}),
                        user_id: usuarioEditandoId,
                        nombre: nombre,
                        cargo: cargo,
                        rol: rol,
                        permisos: perms,
                        activo: activo,
                        updated_at: new Date().toISOString()
                    };

                    await store.upsert('user_profiles', updated);

                    // Si proporcionó nueva contraseña en la edición, actualizar en el baúl
                    if (password) {
                        const auth = global.HaciendaAuth;
                        if (auth) {
                            await global.HaciendaAuth.registrarFuncionario(email, password, updated);
                        }
                    }
                }

                this.cerrarModal();
                const container = document.getElementById('app-main-content');
                if (container) this.render(container);

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: usuarioEditandoId ? 'Funcionario Actualizado' : 'Funcionario Creado',
                        text: 'El perfil y sus permisos se sincronizaron a 0ms con Supabase.',
                        timer: 1600,
                        showConfirmButton: false
                    });
                }
            } catch (err) {
                console.error("[UsuariosModule] Error al guardar usuario:", err);
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'error', title: 'Error al Guardar', text: err.message });
                }
            } finally {
                if (btn) { btn.disabled = false; btn.innerText = 'Guardar Funcionario'; }
            }
        },

        toggleActivo: async function(userId) {
            const store = global.HaciendaStore;
            if (!store) return;
            const users = this.getUsers();
            const u = users.find(item => String(item.user_id || item.id) === String(userId));
            if (!u) return;

            u.activo = u.activo === false ? true : false;
            u.updated_at = new Date().toISOString();
            await store.upsert('user_profiles', u);

            const tableCont = document.getElementById('usuarios-table-container');
            if (tableCont) tableCont.innerHTML = this.renderTablaUsuarios();
            this.actualizarKPIs();
        },

        eliminar: async function(userId) {
            const store = global.HaciendaStore;
            if (!store) return;

            const currentUser = global.HaciendaAuth?.getUser();
            if (currentUser && (String(currentUser.id) === String(userId) || currentUser.email === 'systemsatrimg@gmail.com' && String(userId).includes('superadmin'))) {
                alert("No puedes eliminar la cuenta de administración activa.");
                return;
            }

            const conf = confirm("¿Deseas eliminar este usuario y revocar todos sus accesos al ERP?");
            if (!conf) return;

            await store.remove('user_profiles', userId);

            const tableCont = document.getElementById('usuarios-table-container');
            if (tableCont) tableCont.innerHTML = this.renderTablaUsuarios();
            this.actualizarKPIs();
        },

        filtrarBusqueda: function(val) {
            currentSearch = val || "";
            const tableCont = document.getElementById('usuarios-table-container');
            if (tableCont) tableCont.innerHTML = this.renderTablaUsuarios();
        },

        filtrarRol: function(val) {
            currentRoleFilter = val || "todos";
            const tableCont = document.getElementById('usuarios-table-container');
            if (tableCont) tableCont.innerHTML = this.renderTablaUsuarios();
        },

        filtrarEstado: function(val) {
            currentStatusFilter = val || "todos";
            const tableCont = document.getElementById('usuarios-table-container');
            if (tableCont) tableCont.innerHTML = this.renderTablaUsuarios();
        }
    };

    global.UsuariosModule = Usuarios;

})(typeof window !== 'undefined' ? window : this);
