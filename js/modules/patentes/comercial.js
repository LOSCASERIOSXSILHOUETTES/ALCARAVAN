/**
 * GUIRIRI SISTEMA HACIENDA V3 — Módulo de Patentes y Licencias (LOCAT)
 * Registro de licencias comerciales y patente automotriz sobre vehículos.
 */
(function definePatentesModule(global) {
    "use strict";

    let subVistaActiva = 'comercial'; // 'comercial', 'vehiculos' o 'tasas'
    let filtroVehiculoTexto = '';
    let filtroLocatTexto = '';
    let filtroLocatCategoria = 'todas';
    let filtroTarifaRamo = 'todos';

    const Patentes = {
        subVista: 'comercial',

        cambiarSubVista: function(vista) {
            subVistaActiva = vista;
            this.subVista = vista;
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        render: function(container) {
            const patentes = global.HaciendaStore ? global.HaciendaStore.get('hacienda_patentes') : [];
            const vehiculos = global.HaciendaStore ? global.HaciendaStore.get('hacienda_vehiculos') : [];
            const contribuyentes = global.HaciendaStore ? global.HaciendaStore.get('hacienda_contribuyentes') : [];
            const actividadesLocat = global.HaciendaStore ? global.HaciendaStore.get('hacienda_actividades_locat') : [];
            const ramosIngreso = global.HaciendaStore ? global.HaciendaStore.get('hacienda_ramos_ingreso') : [];
            const tarifasOrdenanza = global.HaciendaStore ? global.HaciendaStore.get('hacienda_tarifas_ordenanza') : [];

            const vehiculosFiltrados = vehiculos.filter(v => {
                if (!filtroVehiculoTexto) return true;
                const txt = filtroVehiculoTexto.toLowerCase();
                const c = contribuyentes.find(item => String(item.id) === String(v.contribuyente_id));
                const rif = c ? c.rif.toLowerCase() : '';
                const rs = c ? c.razon_social.toLowerCase() : '';
                return (v.placa && v.placa.toLowerCase().includes(txt)) ||
                       (v.marca && v.marca.toLowerCase().includes(txt)) ||
                       (v.modelo && v.modelo.toLowerCase().includes(txt)) ||
                       (v.serial_carroceria && v.serial_carroceria.toLowerCase().includes(txt)) ||
                       rif.includes(txt) || rs.includes(txt);
            });

            container.innerHTML = `
                <div class="space-y-6">
                    <!-- Cabecera del Módulo con Conmutador de Vistas -->
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <h2 class="text-xl font-black text-slate-100 flex items-center gap-2">
                                    <i class="fas fa-certificate text-indigo-400"></i>
                                    <span>Licencias y Patentes Municipales</span>
                                </h2>
                            </div>
                            <!-- Pestañas de Sub-Vistas -->
                            <div class="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                                <button onclick="window.PatentesModule.cambiarSubVista('comercial')" 
                                        class="px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${subVistaActiva === 'comercial' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}">
                                    <i class="fas fa-store text-xs"></i>
                                    <span>Actividades Económicas (LOCAT)</span>
                                    <span class="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-mono">${patentes.length}</span>
                                </button>
                                <button onclick="window.PatentesModule.cambiarSubVista('vehiculos')" 
                                        class="px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${subVistaActiva === 'vehiculos' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}">
                                    <i class="fas fa-car text-xs"></i>
                                    <span>Patente sobre Vehículos</span>
                                    <span class="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-mono">${vehiculos.length}</span>
                                </button>
                                <button onclick="window.PatentesModule.cambiarSubVista('tasas')" 
                                        class="px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${subVistaActiva === 'tasas' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}">
                                    <i class="fas fa-sliders-h text-xs"></i>
                                    <span>Tasas y Tarifas LOCAT</span>
                                    <span class="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-mono">${actividadesLocat.length}</span>
                                </button>
                            </div>
                        </div>

                        ${subVistaActiva === 'comercial' ? `
                            <button onclick="window.PatentesModule.abrirModalPatente()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                                <i class="fas fa-plus"></i>
                                <span>Nueva Licencia / Patente</span>
                            </button>
                        ` : subVistaActiva === 'vehiculos' ? `
                            <button onclick="window.PatentesModule.abrirModalVehiculo()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                                <i class="fas fa-plus"></i>
                                <span>Registrar Vehículo</span>
                            </button>
                        ` : `
                            <div class="flex flex-wrap items-center gap-2">
                                <button onclick="window.PatentesModule.abrirModalTarifa()" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                                    <i class="fas fa-plus"></i>
                                    <span>Nueva Tarifa Multi-Ramo</span>
                                </button>
                                <button onclick="window.PatentesModule.abrirModalRamo()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-2">
                                    <i class="fas fa-folder-plus text-amber-400"></i>
                                    <span>Nuevo Ramo</span>
                                </button>
                                <button onclick="window.PatentesModule.abrirModalActividadLocat()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                                    <i class="fas fa-plus"></i>
                                    <span>Nueva Actividad LOCAT</span>
                                </button>
                            </div>
                        `}
                    </div>

                    ${subVistaActiva === 'comercial' ? `
                        <!-- TABLA: PATENTES COMERCIALES -->
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                            <div class="overflow-x-auto">
                                <table class="w-full text-left text-xs">
                                    <thead class="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                        <tr>
                                            <th class="py-3 px-4 font-bold">N° Patente</th>
                                            <th class="py-3 px-4 font-bold">Contribuyente (RIF)</th>
                                            <th class="py-3 px-4 font-bold">Actividad / Ramo LOCAT</th>
                                            <th class="py-3 px-4 font-bold text-center">Alícuota</th>
                                            <th class="py-3 px-4 font-bold text-center">Mínimo (TCMMV)</th>
                                            <th class="py-3 px-4 font-bold">Estado</th>
                                            <th class="py-3 px-4 font-bold text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-800/60 font-medium">
                                        ${this.generarFilasTabla(patentes, contribuyentes)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ` : subVistaActiva === 'vehiculos' ? `
                        <!-- SECCIÓN: VEHÍCULOS MUNICIPALES (SATGUAICA / LOS TEQUES) -->
                        <div class="space-y-4">
                            <!-- Buscador en Vivo -->
                            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                                <div class="flex items-center gap-3 w-full sm:w-auto">
                                    <div class="relative w-full sm:w-80">
                                        <i class="fas fa-search absolute left-3.5 top-3 text-slate-500 text-xs"></i>
                                        <input type="text" placeholder="Buscar por placa, RIF, marca o serial..." 
                                               value="${filtroVehiculoTexto}"
                                               oninput="window.PatentesModule.filtrarVehiculos(this.value)"
                                               class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-indigo-500 transition">
                                    </div>
                                </div>
                                <span class="text-xs font-mono text-slate-400">${vehiculosFiltrados.length} vehículo(s) listado(s)</span>
                            </div>

                            <!-- Tabla de Vehículos -->
                            <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                <div class="overflow-x-auto">
                                    <table class="w-full text-left text-xs">
                                        <thead class="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                            <tr>
                                                <th class="py-3 px-4 font-bold">Placa</th>
                                                <th class="py-3 px-4 font-bold">Contribuyente / Titular</th>
                                                <th class="py-3 px-4 font-bold">Tipo / Clase</th>
                                                <th class="py-3 px-4 font-bold">Marca y Modelo</th>
                                                <th class="py-3 px-4 font-bold">Uso Oficial</th>
                                                <th class="py-3 px-4 font-bold">Serial Carrocería (NIV)</th>
                                                <th class="py-3 px-4 font-bold">Estado</th>
                                                <th class="py-3 px-4 font-bold text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-slate-800/60 font-medium">
                                            ${this.generarFilasVehiculos(vehiculosFiltrados, contribuyentes)}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <!-- SECCIÓN: CONFIGURACIÓN DE TASAS, ALÍCUOTAS LOCAT Y RAMOS DE INGRESO -->
                        ${this.renderVistaTasas(actividadesLocat, ramosIngreso, tarifasOrdenanza)}
                    `}
                </div>

                <!-- Modal Nueva Patente Comercial -->
                <div id="modal-nueva-patente" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
                        <div class="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <i class="fas fa-file-contract text-indigo-400"></i>
                                Otorgar Licencia de Actividades Económicas
                            </h3>
                            <button onclick="window.PatentesModule.cerrarModalPatente()" class="text-slate-400 hover:text-slate-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="form-patente" onsubmit="window.PatentesModule.guardar(event)" class="p-6 space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Contribuyente / Comercio</label>
                                <input type="hidden" id="pat-contribuyente-id" required>
                                <div id="pat-contribuyente-box" onclick="window.PatentesModule.abrirSelector()" 
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
                                <label class="block text-xs font-bold text-slate-400 mb-1">Actividad Económica (Clasificador Armonizado LOCAT)</label>
                                <input type="hidden" id="pat-locat-codigo" required>
                                <input type="hidden" id="pat-locat-descripcion">
                                <div id="pat-actividad-box" onclick="window.PatentesModule.abrirSelectorActividad()" 
                                     class="p-3 bg-slate-950 border border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl cursor-pointer transition flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs shrink-0">
                                            <i class="fas fa-tags"></i>
                                        </div>
                                        <div>
                                            <p class="text-xs font-bold text-slate-200">Seleccionar Actividad Económica</p>
                                            <p class="text-[10px] text-slate-500">Haga clic para abrir el catálogo con tarjetas, categorías y buscador</p>
                                        </div>
                                    </div>
                                    <button type="button" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-lg transition shrink-0">
                                        Buscar
                                    </button>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Alícuota Aplicable (%)</label>
                                    <input type="number" step="0.0001" id="pat-alicuota" required readonly class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs font-mono outline-none">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-1">Mínimo Tributable (TCMMV)</label>
                                    <input type="number" step="0.01" id="pat-minimo" required readonly class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs font-mono outline-none">
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Número de Patente / Licencia</label>
                                <input type="text" id="pat-numero" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono outline-none focus:border-indigo-500">
                            </div>
                            <div class="pt-4 flex justify-end gap-3 border-t border-slate-800">
                                <button type="button" onclick="window.PatentesModule.cerrarModalPatente()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl">Cancelar</button>
                                <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg">Emitir Licencia</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Modal Registrar / Editar Vehículo en ERP (Los Teques / SATGUAICA) -->
                ${this.renderModalVehiculoERP()}

                <!-- Modales de Configuración de Tasas, Alícuotas LOCAT y Ramos -->
                ${this.renderModalesTasas()}
            `;
        },

        renderModalVehiculoERP: function() {
            const anioActual = new Date().getFullYear();
            const listaAnios = [];
            for (let a = anioActual; a >= 1970; a--) {
                listaAnios.push(a);
            }

            return `
                <div id="modal-vehiculo-erp" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div class="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                            <div>
                                <span class="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block">Patente Automotriz Municipal</span>
                                <h3 id="erp-veh-modal-titulo" class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                    <i class="fas fa-car text-indigo-400"></i>
                                    <span>Registrar Vehículo en Padrón</span>
                                </h3>
                            </div>
                            <button onclick="window.PatentesModule.cerrarModalVehiculo()" class="text-slate-400 hover:text-slate-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <form id="form-vehiculo-erp" onsubmit="window.PatentesModule.guardarVehiculo(event)" class="p-6 space-y-4 overflow-y-auto text-xs">
                            <input type="hidden" id="erp-veh-id" value="">

                            <!-- Contribuyente Propietario -->
                            <div>
                                <label class="block text-xs font-bold text-slate-400 mb-1">Contribuyente Titular / Propietario <span class="text-rose-400">*</span></label>
                                <input type="hidden" id="erp-veh-contribuyente-id" required>
                                <div id="erp-veh-contribuyente-box" onclick="window.PatentesModule.abrirSelectorVehiculo()" 
                                     class="p-3 bg-slate-950 border border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl cursor-pointer transition flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">
                                            <i class="fas fa-search"></i>
                                        </div>
                                        <div>
                                            <p class="text-xs font-bold text-slate-200">Seleccionar Contribuyente</p>
                                            <p class="text-[10px] text-slate-500">Haga clic para asociar la placa a un contribuyente del padrón</p>
                                        </div>
                                    </div>
                                    <button type="button" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-lg transition">
                                        Buscar
                                    </button>
                                </div>
                            </div>

                            <!-- Bloque 1: Identificación y Marca -->
                            <div class="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                                <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">1. Datos de Identificación y Marca</span>
                                
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-400 mb-1">Placa / Matrícula <span class="text-rose-400">*</span></label>
                                        <input type="text" id="erp-veh-placa" required placeholder="Ej: AB123CD" maxlength="10"
                                               oninput="this.value = this.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')"
                                               class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold uppercase outline-none focus:border-indigo-500">
                                    </div>

                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-400 mb-1">Tipo / Clase <span class="text-rose-400">*</span></label>
                                        <select id="erp-veh-tipo" onchange="window.PatentesModule.alCambiarTipoVehiculo()" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-indigo-500 cursor-pointer">
                                            <option value="automovil">Automóvil (Sedán / Coupé / Hatchback)</option>
                                            <option value="camioneta">Camioneta (Pick-Up / SUV / Rústico 4x4)</option>
                                            <option value="moto">Motocicleta / Moto</option>
                                            <option value="minibus">Minibús / Van / Pasajeros</option>
                                            <option value="autobus">Autobús Colectivo</option>
                                            <option value="camion_350">Camión 350 (Carga Liviana)</option>
                                            <option value="camion_750">Camión 750 (Carga Pesada)</option>
                                            <option value="gandola">Gandola / Chuto / Tractocamión</option>
                                            <option value="volteo">Camión de Volteo</option>
                                            <option value="remolque">Remolque / Batea / Plataforma</option>
                                            <option value="maquinaria">Maquinaria Especial / Agrícola</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-400 mb-1">Marca <span class="text-rose-400">*</span></label>
                                        <select id="erp-veh-marca" onchange="window.PatentesModule.alCambiarMarcaVehiculo()" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-indigo-500 cursor-pointer">
                                            <option value="Chevrolet">Chevrolet</option>
                                        </select>
                                        <input type="text" id="erp-veh-marca-otra" placeholder="Especifique marca" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none mt-1 hidden focus:border-indigo-500 uppercase">
                                    </div>
                                </div>

                                <div>
                                    <label class="block text-[11px] font-bold text-slate-400 mb-1">Clasificación Tributaria (Cilindrada / Peso - Ordenanza)</label>
                                    <select id="erp-veh-subtipo-fiscal" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-indigo-300 text-[11px] font-medium outline-none focus:border-indigo-500 cursor-pointer">
                                        <option value="">Cargando clasificaciones...</option>
                                    </select>
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-400 mb-1">Modelo <span class="text-rose-400">*</span></label>
                                        <select id="erp-veh-modelo-select" onchange="window.PatentesModule.alCambiarModeloVehiculo()" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-indigo-500 cursor-pointer">
                                            <option value="OTRO">Otro modelo...</option>
                                        </select>
                                        <input type="text" id="erp-veh-modelo" placeholder="Especifique modelo"
                                               class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none mt-1 hidden focus:border-indigo-500">
                                    </div>

                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-400 mb-1">Año de Fabricación</label>
                                        <select id="erp-veh-anio" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono outline-none focus:border-indigo-500 cursor-pointer">
                                            ${listaAnios.map(a => `<option value="${a}">${a}</option>`).join('')}
                                        </select>
                                    </div>

                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-400 mb-1">Color Oficial</label>
                                        <select id="erp-veh-color" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-indigo-500 cursor-pointer">
                                            <option value="Blanco">Blanco</option>
                                            <option value="Negro">Negro</option>
                                            <option value="Gris">Gris / Plata</option>
                                            <option value="Azul">Azul</option>
                                            <option value="Rojo">Rojo</option>
                                            <option value="Verde">Verde</option>
                                            <option value="Beige">Beige / Arena</option>
                                            <option value="Dorado">Dorado</option>
                                            <option value="Marrón">Marrón</option>
                                            <option value="Amarillo">Amarillo</option>
                                            <option value="Naranja">Naranja</option>
                                            <option value="Vinotinto">Vinotinto</option>
                                            <option value="Multicolor">Multicolor / Otro</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Bloque 2: Uso y Destino -->
                            <div class="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                                <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">2. Uso y Destino Operativo</span>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-400 mb-1">Uso / Servicio Autorizado</label>
                                        <select id="erp-veh-uso" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-indigo-500 cursor-pointer">
                                            <option value="particular">Particular / Privado</option>
                                            <option value="carga">Carga Comercial / Reparto y Distribución</option>
                                            <option value="transporte_publico">Transporte Público de Pasajeros</option>
                                            <option value="transporte_escolar">Transporte Escolar / Turístico</option>
                                            <option value="mototaxi">Mototaxi / Reparto Domiciliario</option>
                                            <option value="oficial">Institucional / Oficial</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-400 mb-1">Estado en Padrón</label>
                                        <select id="erp-veh-estado" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-indigo-500 cursor-pointer">
                                            <option value="activo">Activo / En Circulación</option>
                                            <option value="en_tramite">En Trámite de Registro</option>
                                            <option value="desincorporado">Desincorporado / Fuera de Servicio</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Bloque 3: Seriales y Ficha Técnica INTT -->
                            <div class="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                                <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">3. Seriales y Ficha Técnica (INTT)</span>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-400 mb-1">Serial Carrocería / NIV / VIN</label>
                                        <input type="text" id="erp-veh-carroceria" placeholder="Ej: 8A1BC123456789012"
                                               oninput="this.value = this.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')"
                                               class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono outline-none focus:border-indigo-500">
                                    </div>

                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-400 mb-1">Serial de Motor</label>
                                        <input type="text" id="erp-veh-motor" placeholder="Ej: 4G63-123456"
                                               oninput="this.value = this.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')"
                                               class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono outline-none focus:border-indigo-500">
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-400 mb-1">Puestos</label>
                                        <input type="number" id="erp-veh-puestos" min="1" max="90" value="5"
                                               class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono outline-none focus:border-indigo-500">
                                    </div>

                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-400 mb-1">Carga (Ton)</label>
                                        <input type="number" id="erp-veh-carga" min="0" step="0.01" value="0.00"
                                               class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono outline-none focus:border-indigo-500">
                                    </div>

                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-400 mb-1">N° Ejes</label>
                                        <select id="erp-veh-ejes" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono outline-none focus:border-indigo-500">
                                            <option value="2">2 Ejes</option>
                                            <option value="3">3 Ejes</option>
                                            <option value="4">4 Ejes</option>
                                            <option value="5">5+ Ejes</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-400 mb-1">Título INTT</label>
                                        <input type="text" id="erp-veh-titulo" placeholder="Ej: 12345678"
                                               class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono outline-none focus:border-indigo-500">
                                    </div>
                                </div>
                            </div>

                            <div class="pt-4 flex justify-end gap-3 border-t border-slate-800">
                                <button type="button" onclick="window.PatentesModule.cerrarModalVehiculo()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl">Cancelar</button>
                                <button type="submit" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg">Guardar Vehículo</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        },

        generarFilasTabla: function(patentes, contribuyentes) {
            if (!patentes || patentes.length === 0) {
                return `<tr><td colspan="7" class="py-8 text-center text-slate-500 italic">No hay licencias o patentes emitidas en el sistema.</td></tr>`;
            }

            return patentes.map(p => {
                const c = contribuyentes.find(item => String(item.id) === String(p.contribuyente_id));
                return `
                    <tr class="hover:bg-slate-800/40 transition">
                        <td class="py-3 px-4 font-mono font-bold text-indigo-400">${p.numero_patente}</td>
                        <td class="py-3 px-4">
                            <div class="font-bold text-slate-200">${c ? c.razon_social : 'ID: ' + p.contribuyente_id}</div>
                            <div class="text-[11px] font-mono text-slate-400">${c ? c.rif : ''}</div>
                        </td>
                        <td class="py-3 px-4 text-slate-300 max-w-xs truncate">
                            <span class="font-mono text-xs text-sky-400">[${p.codigo_locat || 'LOCAT'}]</span> ${p.descripcion_actividad || ''}
                        </td>
                        <td class="py-3 px-4 text-center font-mono font-bold text-slate-200">
                            ${((p.alicuota || 0) * 100).toFixed(2)}%
                        </td>
                        <td class="py-3 px-4 text-center font-mono text-amber-400">
                            ${Number(p.minimo_tributable_tcmmv || 0).toFixed(2)} TCMMV
                        </td>
                        <td class="py-3 px-4">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${p.estado === 'activa' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-slate-300'}">
                                ${(p.estado || 'activa').toUpperCase()}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-right space-x-2">
                            <button onclick="window.PatentesModule.declararMesRapido(${p.id})" class="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-semibold transition" title="Declarar Ingresos">
                                <i class="fas fa-file-invoice-dollar"></i> Declarar
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        },

        generarFilasVehiculos: function(vehiculos, contribuyentes) {
            if (!vehiculos || vehiculos.length === 0) {
                return `<tr><td colspan="8" class="py-8 text-center text-slate-500 italic">No hay vehículos registrados en el padrón municipal. Presione "Registrar Vehículo" para agregar uno.</td></tr>`;
            }

            const mapTipoLabel = {
                'automovil': 'Automóvil',
                'camioneta': 'Camioneta',
                'moto': 'Motocicleta',
                'minibus': 'Minibús',
                'autobus': 'Autobús',
                'camion_350': 'Camión 350',
                'camion_750': 'Camión 750',
                'gandola': 'Gandola',
                'volteo': 'Volteo',
                'remolque': 'Remolque',
                'maquinaria': 'Maquinaria'
            };

            const mapUsoLabel = {
                'particular': 'Particular',
                'carga': 'Carga Comercial',
                'transporte_publico': 'Transp. Público',
                'transporte_escolar': 'Transp. Escolar',
                'mototaxi': 'Mototaxi',
                'oficial': 'Oficial'
            };

            return vehiculos.map(v => {
                const c = contribuyentes.find(item => String(item.id) === String(v.contribuyente_id));
                const esActivo = (v.estado || 'activo') === 'activo';

                return `
                    <tr class="hover:bg-slate-800/40 transition">
                        <td class="py-3 px-4">
                            <div class="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 font-mono font-bold text-xs text-white tracking-wider inline-block">
                                ${v.placa}
                            </div>
                        </td>
                        <td class="py-3 px-4">
                            <div class="font-bold text-slate-200">${c ? c.razon_social : 'ID: ' + v.contribuyente_id}</div>
                            <div class="text-[11px] font-mono text-slate-400">${c ? c.rif : ''}</div>
                        </td>
                        <td class="py-3 px-4 text-slate-300">
                            ${mapTipoLabel[v.tipo] || v.tipo || 'Automóvil'}
                        </td>
                        <td class="py-3 px-4 text-slate-300">
                            <div class="font-medium text-slate-200">${v.marca} ${v.modelo}</div>
                            <div class="text-[10px] text-slate-500">${v.anio || 'S/A'} · ${v.color || 'Sin color'}</div>
                        </td>
                        <td class="py-3 px-4">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${v.uso === 'carga' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-slate-800 text-slate-300 border border-slate-700'}">
                                ${mapUsoLabel[v.uso] || v.uso || 'Particular'}
                            </span>
                        </td>
                        <td class="py-3 px-4 font-mono text-[11px] text-slate-400 select-all">
                            ${v.serial_carroceria || '—'}
                        </td>
                        <td class="py-3 px-4">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${esActivo ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
                                ${(v.estado || 'activo').toUpperCase()}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-right space-x-2">
                            <button onclick="window.PatentesModule.abrirModalVehiculo('${v.id}')" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] transition" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="window.PatentesModule.eliminarVehiculo('${v.id}')" class="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-[11px] transition" title="Desincorporar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        },

        filtrarVehiculos: function(txt) {
            filtroVehiculoTexto = txt.trim();
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        alCambiarActividad: function() {
            const select = document.getElementById('pat-locat-select');
            if (!select) return;
            const opt = select.options[select.selectedIndex];
            if (!opt || !opt.dataset) return;

            const alicuota = parseFloat(opt.dataset.alicuota || 0);
            const minimo = parseFloat(opt.dataset.minimo || 0);

            document.getElementById('pat-alicuota').value = (alicuota * 100).toFixed(2);
            document.getElementById('pat-minimo').value = minimo.toFixed(2);
        },

        abrirSelectorActividad: function() {
            if (global.SelectorActividadLocatModal) {
                global.SelectorActividadLocatModal.abrir({
                    onSelect: (act) => this.setActividad(act)
                });
            }
        },

        setActividad: function(act) {
            if (!act) return;
            const inputCodigo = document.getElementById('pat-locat-codigo');
            const inputDesc = document.getElementById('pat-locat-descripcion');
            const inputAlicuota = document.getElementById('pat-alicuota');
            const inputMinimo = document.getElementById('pat-minimo');

            if (inputCodigo) inputCodigo.value = act.codigo;
            if (inputDesc) inputDesc.value = act.nombre;
            if (inputAlicuota) inputAlicuota.value = (parseFloat(act.alicuota || 0) * 100).toFixed(2);
            if (inputMinimo) inputMinimo.value = parseFloat(act.minimo_tcmmv || 0).toFixed(2);

            const box = document.getElementById('pat-actividad-box');
            if (box) {
                box.className = "p-3 bg-slate-950 border border-indigo-500/40 rounded-xl flex items-center justify-between";
                box.innerHTML = `
                    <div class="flex items-center gap-3 pr-2">
                        <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0">
                            <i class="fas fa-check"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="text-xs font-mono font-bold text-indigo-400">[${act.codigo}]</span>
                                <span class="text-xs font-bold text-slate-100 truncate">${act.nombre}</span>
                            </div>
                            <p class="text-[10px] text-slate-400">
                                ${act.categoria ? act.categoria + ' · ' : ''}Alícuota: <span class="text-emerald-400 font-mono font-bold">${(parseFloat(act.alicuota || 0) * 100).toFixed(2)}%</span> · Mín: <span class="text-amber-400 font-mono font-bold">${parseFloat(act.minimo_tcmmv || 0).toFixed(2)} TCMMV</span>
                            </p>
                        </div>
                    </div>
                    <button type="button" onclick="window.PatentesModule.abrirSelectorActividad()" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition shrink-0">
                        Cambiar
                    </button>
                `;
            }
        },

        resetActividadBox: function() {
            const inputCodigo = document.getElementById('pat-locat-codigo');
            const inputDesc = document.getElementById('pat-locat-descripcion');
            const inputAlicuota = document.getElementById('pat-alicuota');
            const inputMinimo = document.getElementById('pat-minimo');
            if (inputCodigo) inputCodigo.value = '';
            if (inputDesc) inputDesc.value = '';
            if (inputAlicuota) inputAlicuota.value = '';
            if (inputMinimo) inputMinimo.value = '';

            const box = document.getElementById('pat-actividad-box');
            if (box) {
                box.className = "p-3 bg-slate-950 border border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl cursor-pointer transition flex items-center justify-between";
                box.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs shrink-0">
                            <i class="fas fa-tags"></i>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-200">Seleccionar Actividad Económica</p>
                            <p class="text-[10px] text-slate-500">Haga clic para abrir el catálogo con tarjetas, categorías y buscador</p>
                        </div>
                    </div>
                    <button type="button" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-lg transition shrink-0">
                        Buscar
                    </button>
                `;
            }
        },

        abrirSelector: function() {
            if (global.SelectorContribuyenteModal) {
                global.SelectorContribuyenteModal.abrir({
                    onSelect: (c) => this.setContribuyente(c)
                });
            }
        },

        abrirSelectorVehiculo: function() {
            if (global.SelectorContribuyenteModal) {
                global.SelectorContribuyenteModal.abrir({
                    onSelect: (c) => this.setContribuyenteVehiculo(c)
                });
            }
        },

        setContribuyente: function(c) {
            if (!c) return;
            const inputId = document.getElementById('pat-contribuyente-id');
            if (inputId) inputId.value = c.id;

            const box = document.getElementById('pat-contribuyente-box');
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
                    <button type="button" onclick="window.PatentesModule.abrirSelector()" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition">
                        Cambiar
                    </button>
                `;
            }
        },

        setContribuyenteVehiculo: function(c) {
            if (!c) return;
            const inputId = document.getElementById('erp-veh-contribuyente-id');
            if (inputId) inputId.value = c.id;

            const box = document.getElementById('erp-veh-contribuyente-box');
            if (box) {
                box.className = "p-3 bg-slate-950 border border-indigo-500/40 rounded-xl flex items-center justify-between";
                box.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                            <i class="fas fa-check"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-mono font-bold text-indigo-400">[${c.rif}]</span>
                                <span class="text-xs font-bold text-slate-100">${c.razon_social}</span>
                            </div>
                            <p class="text-[10px] text-slate-400">${c.denominacion_comercial ? c.denominacion_comercial + ' · ' : ''}Rep: ${c.representante_legal || 'N/A'}</p>
                        </div>
                    </div>
                    <button type="button" onclick="window.PatentesModule.abrirSelectorVehiculo()" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition">
                        Cambiar
                    </button>
                `;
            }
        },

        resetContribuyenteBox: function() {
            const inputId = document.getElementById('pat-contribuyente-id');
            if (inputId) inputId.value = '';

            const box = document.getElementById('pat-contribuyente-box');
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
        },

        resetContribuyenteVehiculoBox: function() {
            const inputId = document.getElementById('erp-veh-contribuyente-id');
            if (inputId) inputId.value = '';

            const box = document.getElementById('erp-veh-contribuyente-box');
            if (box) {
                box.className = "p-3 bg-slate-950 border border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl cursor-pointer transition flex items-center justify-between";
                box.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">
                            <i class="fas fa-search"></i>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-200">Seleccionar Contribuyente</p>
                            <p class="text-[10px] text-slate-500">Haga clic para asociar la placa a un contribuyente del padrón</p>
                        </div>
                    </div>
                    <button type="button" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-lg transition">
                        Buscar
                    </button>
                `;
            }
        },

        abrirModalPatente: function(contribuyenteId = null) {
            const patentes = global.HaciendaStore ? global.HaciendaStore.get('hacienda_patentes') : [];
            const nextCorrelativo = 'PAT-' + new Date().getFullYear() + '-' + String(patentes.length + 1).padStart(4, '0');
            
            const numInput = document.getElementById('pat-numero');
            if (numInput) numInput.value = nextCorrelativo;

            this.resetActividadBox();

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

            document.getElementById('modal-nueva-patente')?.classList.remove('hidden');
        },

        cerrarModalPatente: function() {
            document.getElementById('modal-nueva-patente')?.classList.add('hidden');
            document.getElementById('form-patente')?.reset();
            this.resetContribuyenteBox();
            this.resetActividadBox();
        },

        abrirModalVehiculo: function(vehiculoId = null) {
            const modal = document.getElementById('modal-vehiculo-erp');
            if (!modal) return;

            const inputId = document.getElementById('erp-veh-id');
            const inputPlaca = document.getElementById('erp-veh-placa');
            const selectTipo = document.getElementById('erp-veh-tipo');
            const selectMarca = document.getElementById('erp-veh-marca');
            const inputModelo = document.getElementById('erp-veh-modelo');
            const selectAnio = document.getElementById('erp-veh-anio');
            const selectColor = document.getElementById('erp-veh-color');
            const selectUso = document.getElementById('erp-veh-uso');
            const selectEstado = document.getElementById('erp-veh-estado');
            const inputCarroceria = document.getElementById('erp-veh-carroceria');
            const inputMotor = document.getElementById('erp-veh-motor');
            const inputPuestos = document.getElementById('erp-veh-puestos');
            const inputCarga = document.getElementById('erp-veh-carga');
            const selectEjes = document.getElementById('erp-veh-ejes');
            const inputTitulo = document.getElementById('erp-veh-titulo');
            const tituloEl = document.getElementById('erp-veh-modal-titulo');

            if (vehiculoId) {
                const store = global.HaciendaStore;
                const vehiculos = store ? (store.get('hacienda_vehiculos') || []) : [];
                const contribuyentes = store ? (store.get('hacienda_contribuyentes') || []) : [];
                const v = vehiculos.find(item => String(item.id) === String(vehiculoId));

                if (v) {
                    if (inputId) inputId.value = v.id;
                    if (inputPlaca) inputPlaca.value = v.placa || '';
                    if (global.HaciendaVehiculosCatalogo) {
                        global.HaciendaVehiculosCatalogo.cargarValores(this._vehiculoCfg, v);
                    } else {
                        if (selectTipo) selectTipo.value = v.tipo || 'automovil';
                        if (selectMarca) selectMarca.value = v.marca || 'Chevrolet';
                        if (inputModelo) inputModelo.value = v.modelo || '';
                    }
                    if (selectAnio) selectAnio.value = String(v.anio || new Date().getFullYear());
                    if (selectColor) selectColor.value = v.color || 'Blanco';
                    if (selectUso) selectUso.value = v.uso || 'particular';
                    if (selectEstado) selectEstado.value = v.estado || 'activo';
                    if (inputCarroceria) inputCarroceria.value = v.serial_carroceria || '';
                    if (inputMotor) inputMotor.value = v.serial_motor || '';
                    if (inputPuestos) inputPuestos.value = v.capacidad_puestos || 5;
                    if (inputCarga) inputCarga.value = Number(v.capacidad_carga || 0).toFixed(2);
                    if (selectEjes) selectEjes.value = String(v.numero_ejes || 2);
                    if (inputTitulo) inputTitulo.value = v.numero_titulo || '';

                    const c = contribuyentes.find(item => String(item.id) === String(v.contribuyente_id));
                    if (c) this.setContribuyenteVehiculo(c);

                    if (tituloEl) tituloEl.innerHTML = `<i class="fas fa-edit text-indigo-400"></i><span>Editar Vehículo (${v.placa})</span>`;
                }
            } else {
                if (inputId) inputId.value = '';
                if (inputPlaca) inputPlaca.value = '';
                if (global.HaciendaVehiculosCatalogo) {
                    global.HaciendaVehiculosCatalogo.cargarValores(this._vehiculoCfg, null);
                } else {
                    if (selectTipo) selectTipo.value = 'automovil';
                    if (selectMarca) selectMarca.value = 'Chevrolet';
                    if (inputModelo) inputModelo.value = '';
                }
                if (selectAnio) selectAnio.value = String(new Date().getFullYear());
                if (selectColor) selectColor.value = 'Blanco';
                if (selectUso) selectUso.value = 'particular';
                if (selectEstado) selectEstado.value = 'activo';
                if (inputCarroceria) inputCarroceria.value = '';
                if (inputMotor) inputMotor.value = '';
                if (inputPuestos) inputPuestos.value = '5';
                if (inputCarga) inputCarga.value = '0.00';
                if (selectEjes) selectEjes.value = '2';
                if (inputTitulo) inputTitulo.value = '';
                this.resetContribuyenteVehiculoBox();

                if (tituloEl) tituloEl.innerHTML = `<i class="fas fa-car text-indigo-400"></i><span>Registrar Vehículo en Padrón</span>`;
            }

            modal.classList.remove('hidden');
        },

        _vehiculoCfg: {
            tipoId: 'erp-veh-tipo',
            subtipoId: 'erp-veh-subtipo-fiscal',
            marcaSelectId: 'erp-veh-marca',
            marcaOtraId: 'erp-veh-marca-otra',
            modeloSelectId: 'erp-veh-modelo-select',
            modeloOtroId: 'erp-veh-modelo',
            puestosId: 'erp-veh-puestos',
            usoId: 'erp-veh-uso'
        },

        alCambiarTipoVehiculo: function() {
            if (global.HaciendaVehiculosCatalogo) {
                global.HaciendaVehiculosCatalogo.alCambiarTipo(this._vehiculoCfg, false);
            }
        },

        alCambiarMarcaVehiculo: function() {
            if (global.HaciendaVehiculosCatalogo) {
                global.HaciendaVehiculosCatalogo.alCambiarMarca(this._vehiculoCfg);
            }
        },

        alCambiarModeloVehiculo: function() {
            if (global.HaciendaVehiculosCatalogo) {
                global.HaciendaVehiculosCatalogo.alCambiarModelo(this._vehiculoCfg);
            }
        },

        cerrarModalVehiculo: function() {
            const modal = document.getElementById('modal-vehiculo-erp');
            if (modal) modal.classList.add('hidden');
            const form = document.getElementById('form-vehiculo-erp');
            if (form) form.reset();
            this.resetContribuyenteVehiculoBox();
        },

        guardarVehiculo: async function(e) {
            if (e && e.preventDefault) e.preventDefault();
            const store = global.HaciendaStore;
            if (!store) return;

            const contribId = document.getElementById('erp-veh-contribuyente-id')?.value;
            if (!contribId) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debe seleccionar un contribuyente para asociar el vehículo.', confirmButtonColor: '#4f46e5' });
                }
                return;
            }

            const idExistente = document.getElementById('erp-veh-id')?.value;
            const placa = document.getElementById('erp-veh-placa')?.value.trim().toUpperCase() || '';
            const tipo = document.getElementById('erp-veh-tipo')?.value || 'automovil';
            const valoresCat = global.HaciendaVehiculosCatalogo
                ? global.HaciendaVehiculosCatalogo.obtenerValores(this._vehiculoCfg)
                : { marca: document.getElementById('erp-veh-marca')?.value || 'Chevrolet', modelo: document.getElementById('erp-veh-modelo')?.value.trim() || '' };
            const marca = valoresCat.marca;
            const modelo = valoresCat.modelo;
            const anio = parseInt(document.getElementById('erp-veh-anio')?.value || new Date().getFullYear(), 10);
            const color = document.getElementById('erp-veh-color')?.value || 'Blanco';
            const uso = document.getElementById('erp-veh-uso')?.value || 'particular';
            const estado = document.getElementById('erp-veh-estado')?.value || 'activo';
            const serialCarroceria = document.getElementById('erp-veh-carroceria')?.value.trim().toUpperCase() || '';
            const serialMotor = document.getElementById('erp-veh-motor')?.value.trim().toUpperCase() || '';
            const puestos = parseInt(document.getElementById('erp-veh-puestos')?.value || 5, 10);
            const carga = parseFloat(document.getElementById('erp-veh-carga')?.value || 0);
            const ejes = parseInt(document.getElementById('erp-veh-ejes')?.value || 2, 10);
            const titulo = document.getElementById('erp-veh-titulo')?.value.trim().toUpperCase() || '';

            if (!placa || placa.length < 4) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'warning', title: 'Placa requerida', text: 'Ingrese una placa válida.', confirmButtonColor: '#4f46e5' });
                }
                return;
            }

            const vehiculos = store.get('hacienda_vehiculos') || [];
            const anterior = idExistente ? vehiculos.find(v => String(v.id) === String(idExistente)) : null;

            const placaDuplicada = vehiculos.find(v => String(v.placa).toUpperCase() === placa && String(v.id) !== String(idExistente));
            if (placaDuplicada) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'error', title: 'Placa duplicada', text: `La placa ${placa} ya está registrada en el sistema.`, confirmButtonColor: '#4f46e5' });
                }
                return;
            }

            const idFinal = idExistente || ('veh_' + Date.now());

            const vehiculoObj = {
                id: idFinal,
                contribuyente_id: contribId,
                placa: placa,
                tipo: tipo,
                marca: marca,
                modelo: modelo,
                anio: anio,
                color: color,
                uso: uso,
                serial_carroceria: serialCarroceria,
                serial_motor: serialMotor,
                capacidad_puestos: puestos,
                capacidad_carga: carga,
                numero_ejes: ejes,
                numero_titulo: titulo,
                estado: estado,
                created_at: anterior ? (anterior.created_at || new Date().toISOString()) : new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await store.set('hacienda_vehiculos', vehiculoObj);
            this.cerrarModalVehiculo();

            const container = document.getElementById('app-main-content');
            if (container) this.render(container);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: idExistente ? 'Vehículo Actualizado' : 'Vehículo Registrado',
                    text: `La placa ${placa} (${marca} ${modelo}) ha sido guardada en el padrón.`,
                    confirmButtonColor: '#4f46e5',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        },

        eliminarVehiculo: async function(vehiculoId) {
            const store = global.HaciendaStore;
            if (!store || !vehiculoId) return;

            const vehiculos = store.get('hacienda_vehiculos') || [];
            const v = vehiculos.find(item => String(item.id) === String(vehiculoId));
            if (!v) return;

            const confirmar = typeof Swal !== 'undefined' ? await Swal.fire({
                title: '¿Desincorporar Vehículo?',
                text: `¿Desea desincorporar el vehículo ${v.placa} (${v.marca} ${v.modelo}) del padrón municipal?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#e11d48',
                cancelButtonColor: '#334155',
                confirmButtonText: 'Sí, desincorporar',
                cancelButtonText: 'Cancelar'
            }) : { isConfirmed: confirm(`¿Desincorporar vehículo ${v.placa}?`) };

            if (confirmar.isConfirmed) {
                await store.remove('hacienda_vehiculos', vehiculoId);
                const container = document.getElementById('app-main-content');
                if (container) this.render(container);

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Vehículo Retirado',
                        text: `La placa ${v.placa} ha sido desincorporada.`,
                        confirmButtonColor: '#4f46e5',
                        timer: 1800,
                        showConfirmButton: false
                    });
                }
            }
        },

        guardar: async function(e) {
            e.preventDefault();
            const contribId = document.getElementById('pat-contribuyente-id')?.value;
            if (!contribId) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debe seleccionar un contribuyente.', confirmButtonColor: '#0284c7' });
                }
                return;
            }

            const codigoLocat = document.getElementById('pat-locat-codigo')?.value || document.getElementById('pat-locat-select')?.value;
            let descripcionActividad = document.getElementById('pat-locat-descripcion')?.value;
            if (!descripcionActividad) {
                const locatSelect = document.getElementById('pat-locat-select');
                if (locatSelect && locatSelect.selectedIndex >= 0) {
                    const opt = locatSelect.options[locatSelect.selectedIndex];
                    descripcionActividad = opt ? (opt.text.split('] ')[1]?.split(' (')[0] || opt.text) : '';
                }
            }

            if (!codigoLocat) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debe seleccionar una actividad económica del clasificador LOCAT.', confirmButtonColor: '#4f46e5' });
                }
                return;
            }

            const nuevaPatente = {
                numero_patente: document.getElementById('pat-numero').value.trim(),
                contribuyente_id: contribId,
                tipo: 'comercial',
                codigo_locat: codigoLocat,
                descripcion_actividad: descripcionActividad || codigoLocat,
                alicuota: parseFloat(document.getElementById('pat-alicuota').value) / 100,
                minimo_tributable_tcmmv: parseFloat(document.getElementById('pat-minimo').value),
                estado: 'activa',
                fecha_emision: new Date().toISOString().split('T')[0]
            };

            await global.HaciendaStore.set('hacienda_patentes', nuevaPatente);
            this.cerrarModalPatente();

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Licencia Emitida',
                    text: 'Patente comercial registrada con éxito.',
                    confirmButtonColor: '#4f46e5',
                    timer: 1800,
                    showConfirmButton: false
                });
            }
        },

        // =====================================================================
        // MÓDULO DE CONFIGURACIÓN DE TASAS, ALÍCUOTAS LOCAT Y RAMOS DE INGRESO
        // =====================================================================

        renderVistaTasas: function(actividadesLocat, ramosIngreso, tarifasOrdenanza) {
            const lista = Array.isArray(actividadesLocat) ? actividadesLocat : [];
            const categorias = [...new Set(lista.map(a => a.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b));
            const filtradas = this._filtrarListaLocat(lista);
            const ramos = Array.isArray(ramosIngreso) ? ramosIngreso : [];
            const tarifas = Array.isArray(tarifasOrdenanza) ? tarifasOrdenanza : [];
            const tarifasFiltradas = tarifas.filter(t => filtroTarifaRamo === 'todos' || t.ramo === filtroTarifaRamo);

            const mapRamoLabel = {
                'vehiculos': 'Vehículos',
                'aseo': 'Aseo Urbano',
                'inmuebles': 'Catastro / Inmuebles',
                'publicidad': 'Publicidad',
                'espectaculos': 'Espectáculos',
                'tramites': 'Trámites / Solvencias'
            };
            const mapUnidadLabel = {
                'tcmmv_fijo': 'TCMMV (Fijo)',
                'tcmmv_m2': 'TCMMV / m2',
                'porcentaje': '% Sobre Base',
                'ut': 'U.T. (Unid. Trib.)'
            };

            return `
                <div class="space-y-6">
                    <!-- Bloque 1: Clasificador de Actividades Económicas LOCAT -->
                    <div class="space-y-4">
                        <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                            <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
                                <div class="relative w-full sm:w-80">
                                    <i class="fas fa-search absolute left-3.5 top-3 text-slate-500 text-xs"></i>
                                    <input type="text" placeholder="Buscar código (COM-001), actividad o categoría..."
                                           value="${filtroLocatTexto}"
                                           oninput="window.PatentesModule.filtrarTasasLocat(this.value, null)"
                                           class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-indigo-500 transition">
                                </div>
                                <select onchange="window.PatentesModule.filtrarTasasLocat(null, this.value)"
                                        class="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 cursor-pointer">
                                    <option value="todas" ${filtroLocatCategoria === 'todas' ? 'selected' : ''}>Todas las Categorías</option>
                                    ${categorias.map(c => `<option value="${c}" ${filtroLocatCategoria === c ? 'selected' : ''}>${c}</option>`).join('')}
                                </select>
                            </div>
                            <span id="contador-tasas-locat" class="text-xs font-mono text-slate-400">${filtradas.length} actividad(es) LOCAT</span>
                        </div>

                        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                            <div class="overflow-x-auto max-h-[520px] overflow-y-auto">
                                <table class="w-full text-left text-xs">
                                    <thead class="bg-slate-950/95 text-slate-400 uppercase tracking-wider border-b border-slate-800 sticky top-0 z-10">
                                        <tr>
                                            <th class="py-3 px-4 font-bold">Código</th>
                                            <th class="py-3 px-4 font-bold">Categoría</th>
                                            <th class="py-3 px-4 font-bold">Actividad Económica / Ramo</th>
                                            <th class="py-3 px-4 font-bold text-center">Alícuota (%)</th>
                                            <th class="py-3 px-4 font-bold text-center">Mínimo (TCMMV)</th>
                                            <th class="py-3 px-4 font-bold text-center">Estado</th>
                                            <th class="py-3 px-4 font-bold text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tbody-tasas-locat" class="divide-y divide-slate-800/60 font-medium">
                                        ${this.generarFilasTasasLocat(filtradas)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Bloque 2: Tarifario Multi-Ramo por Ordenanza (Vehículos, Aseo, Catastro, Publicidad, Espectáculos, Trámites) -->
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div class="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                    <i class="fas fa-balance-scale text-emerald-400"></i>
                                    <span>Tarifario Multi-Ramo por Ordenanza Municipal (Multi-Alcaldía)</span>
                                </h3>
                                <p class="text-[11px] text-slate-400">Configura tarifas y porcentajes de Vehículos, Aseo Urbano, Catastro/Inmuebles, Publicidad, Espectáculos y Trámites</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <select onchange="window.PatentesModule.filtrarTarifasPorRamo(this.value)"
                                        class="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer">
                                    <option value="todos" ${filtroTarifaRamo === 'todos' ? 'selected' : ''}>Todos los Ramos</option>
                                    <option value="vehiculos" ${filtroTarifaRamo === 'vehiculos' ? 'selected' : ''}>Vehículos (Motos / Carros / Carga)</option>
                                    <option value="aseo" ${filtroTarifaRamo === 'aseo' ? 'selected' : ''}>Aseo Urbano y Domiciliario</option>
                                    <option value="inmuebles" ${filtroTarifaRamo === 'inmuebles' ? 'selected' : ''}>Catastro / Inmuebles</option>
                                    <option value="publicidad" ${filtroTarifaRamo === 'publicidad' ? 'selected' : ''}>Publicidad y Propaganda</option>
                                    <option value="espectaculos" ${filtroTarifaRamo === 'espectaculos' ? 'selected' : ''}>Espectáculos Públicos</option>
                                    <option value="tramites" ${filtroTarifaRamo === 'tramites' ? 'selected' : ''}>Trámites y Solvencias</option>
                                </select>
                                <span class="text-xs font-mono text-slate-400">${tarifasFiltradas.length} tarifa(s)</span>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                    <tr>
                                        <th class="py-3 px-4 font-bold">Ramo</th>
                                        <th class="py-3 px-4 font-bold">Código</th>
                                        <th class="py-3 px-4 font-bold">Concepto / Categoría</th>
                                        <th class="py-3 px-4 font-bold text-center">Tarifa / Valor</th>
                                        <th class="py-3 px-4 font-bold text-center">Unidad</th>
                                        <th class="py-3 px-4 font-bold text-center">Cobro</th>
                                        <th class="py-3 px-4 font-bold text-center">Estado</th>
                                        <th class="py-3 px-4 font-bold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/60 font-medium">
                                    ${tarifasFiltradas.length === 0 ? `
                                        <tr><td colspan="8" class="py-8 text-center text-slate-500 italic">No hay tarifas para este ramo. Presione "Nueva Tarifa Multi-Ramo".</td></tr>
                                    ` : tarifasFiltradas.map(t => {
                                        const activo = t.activo !== false;
                                        return `
                                            <tr class="hover:bg-slate-800/40 transition ${!activo ? 'opacity-50' : ''}">
                                                <td class="py-3 px-4 whitespace-nowrap">
                                                    <span class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">${mapRamoLabel[t.ramo] || t.ramo}</span>
                                                </td>
                                                <td class="py-3 px-4 font-mono font-bold text-slate-300 whitespace-nowrap">${t.codigo}</td>
                                                <td class="py-3 px-4">
                                                    <div class="font-bold text-slate-200">${t.nombre}</div>
                                                    ${t.descripcion ? `<div class="text-[10px] text-slate-400">${t.descripcion}</div>` : ''}
                                                </td>
                                                <td class="py-3 px-4 text-center font-mono font-bold text-amber-400">${Number(t.valor || 0).toFixed(2)}</td>
                                                <td class="py-3 px-4 text-center text-slate-300 whitespace-nowrap">${mapUnidadLabel[t.unidad_calculo] || t.unidad_calculo}</td>
                                                <td class="py-3 px-4 text-center uppercase text-[10px] font-mono text-sky-400">${t.periodicidad || 'anual'}</td>
                                                <td class="py-3 px-4 text-center">
                                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${activo ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
                                                        ${activo ? 'ACTIVA' : 'INACTIVA'}
                                                    </span>
                                                </td>
                                                <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                                                    <button onclick="window.PatentesModule.abrirModalTarifa('${t.id}')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] transition" title="Editar Tarifa">
                                                        <i class="fas fa-edit"></i> Editar
                                                    </button>
                                                    <button onclick="window.PatentesModule.toggleEstadoTarifa('${t.id}')" class="px-2.5 py-1 ${activo ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'} rounded-lg text-[11px] transition" title="${activo ? 'Desactivar' : 'Activar'}">
                                                        <i class="fas ${activo ? 'fa-ban' : 'fa-check'}"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Bloque 3: Ramos de Ingreso y Tasas Municipales -->
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div class="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                    <i class="fas fa-coins text-amber-400"></i>
                                    <span>Ramos de Ingreso y Tasas Municipales (ONAPRE / Ordenanzas)</span>
                                </h3>
                                <p class="text-[11px] text-slate-400">Catálogo de conceptos recaudadores (Patentes, Aseo Urbano, Catastro, Vehículos, Espectáculos, Tasas)</p>
                            </div>
                            <span class="text-xs font-mono text-slate-400">${ramos.length} ramo(s)</span>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                    <tr>
                                        <th class="py-3 px-4 font-bold">Código Contable</th>
                                        <th class="py-3 px-4 font-bold">Nombre del Ramo / Tasa</th>
                                        <th class="py-3 px-4 font-bold">Descripción / Ordenanza</th>
                                        <th class="py-3 px-4 font-bold text-center">Estado</th>
                                        <th class="py-3 px-4 font-bold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/60 font-medium">
                                    ${ramos.length === 0 ? `
                                        <tr><td colspan="5" class="py-8 text-center text-slate-500 italic">No hay ramos registrados. Presione "Nuevo Ramo / Tasa" para crear uno.</td></tr>
                                    ` : ramos.map(r => {
                                        const activo = r.activo !== false;
                                        return `
                                            <tr class="hover:bg-slate-800/40 transition">
                                                <td class="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">${r.codigo || '—'}</td>
                                                <td class="py-3 px-4 font-bold text-slate-200">${r.nombre || ''}</td>
                                                <td class="py-3 px-4 text-slate-400 max-w-md truncate" title="${r.descripcion || ''}">${r.descripcion || '—'}</td>
                                                <td class="py-3 px-4 text-center">
                                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${activo ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
                                                        ${activo ? 'ACTIVO' : 'INACTIVO'}
                                                    </span>
                                                </td>
                                                <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                                                    <button onclick="window.PatentesModule.abrirModalRamo('${r.id}')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] transition" title="Editar Ramo">
                                                        <i class="fas fa-edit"></i> Editar
                                                    </button>
                                                    <button onclick="window.PatentesModule.toggleEstadoRamo('${r.id}')" class="px-2.5 py-1 ${activo ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'} rounded-lg text-[11px] transition" title="${activo ? 'Desactivar' : 'Activar'}">
                                                        <i class="fas ${activo ? 'fa-ban' : 'fa-check'}"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        },

        _filtrarListaLocat: function(lista) {
            return (lista || []).filter(a => {
                if (filtroLocatCategoria !== 'todas' && a.categoria !== filtroLocatCategoria) return false;
                if (!filtroLocatTexto) return true;
                const q = filtroLocatTexto.toLowerCase();
                return (a.codigo && a.codigo.toLowerCase().includes(q)) ||
                       (a.nombre && a.nombre.toLowerCase().includes(q)) ||
                       (a.categoria && a.categoria.toLowerCase().includes(q));
            }).sort((a, b) => String(a.codigo || '').localeCompare(String(b.codigo || '')));
        },

        generarFilasTasasLocat: function(items) {
            if (!items || items.length === 0) {
                return `<tr><td colspan="7" class="py-8 text-center text-slate-500 italic">No se encontraron actividades LOCAT con ese filtro.</td></tr>`;
            }
            return items.map(a => {
                const activo = a.activo !== false;
                return `
                    <tr class="hover:bg-slate-800/40 transition ${!activo ? 'opacity-50' : ''}">
                        <td class="py-3 px-4 font-mono font-bold text-indigo-400 whitespace-nowrap">${a.codigo}</td>
                        <td class="py-3 px-4 text-slate-400 whitespace-nowrap">${a.categoria || 'General'}</td>
                        <td class="py-3 px-4 text-slate-200 max-w-md">${a.nombre}</td>
                        <td class="py-3 px-4 text-center font-mono font-bold text-emerald-400">${(Number(a.alicuota || 0) * 100).toFixed(2)}%</td>
                        <td class="py-3 px-4 text-center font-mono font-bold text-amber-400">${Number(a.minimo_tcmmv || 0).toFixed(2)} TCMMV</td>
                        <td class="py-3 px-4 text-center">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${activo ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
                                ${activo ? 'ACTIVA' : 'INACTIVA'}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                            <button onclick="window.PatentesModule.abrirModalActividadLocat('${a.id}')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] transition" title="Editar Alícuota y Mínimo">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button onclick="window.PatentesModule.toggleEstadoActividadLocat('${a.id}')" class="px-2.5 py-1 ${activo ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'} rounded-lg text-[11px] transition" title="${activo ? 'Desactivar' : 'Activar'}">
                                <i class="fas ${activo ? 'fa-ban' : 'fa-check'}"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        },

        filtrarTasasLocat: function(texto, categoria) {
            if (texto !== null && texto !== undefined) filtroLocatTexto = String(texto).trim();
            if (categoria !== null && categoria !== undefined) filtroLocatCategoria = categoria;

            const lista = global.HaciendaStore ? global.HaciendaStore.get('hacienda_actividades_locat') : [];
            const filtradas = this._filtrarListaLocat(lista);
            const tbody = document.getElementById('tbody-tasas-locat');
            const cont = document.getElementById('contador-tasas-locat');
            if (tbody) tbody.innerHTML = this.generarFilasTasasLocat(filtradas);
            if (cont) cont.textContent = `${filtradas.length} actividad(es) LOCAT`;
        },

        renderModalesTasas: function() {
            return `
                <!-- Modal Actividad Económica LOCAT -->
                <div id="modal-actividad-locat" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                        <div class="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 id="modal-locat-titulo" class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <i class="fas fa-sliders-h text-indigo-400"></i>
                                <span>Configurar Actividad y Tasa LOCAT</span>
                            </h3>
                            <button type="button" onclick="window.PatentesModule.cerrarModalActividadLocat()" class="text-slate-400 hover:text-slate-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="form-actividad-locat" onsubmit="window.PatentesModule.guardarActividadLocat(event)" class="p-6 space-y-4 text-xs">
                            <input type="hidden" id="locat-edit-id" value="">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-400 mb-1">Código LOCAT <span class="text-rose-400">*</span></label>
                                    <input type="text" id="locat-edit-codigo" required placeholder="Ej: COM-024"
                                           oninput="this.value = this.value.toUpperCase().trim()"
                                           class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold outline-none focus:border-indigo-500">
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-400 mb-1">Categoría <span class="text-rose-400">*</span></label>
                                    <input type="text" id="locat-edit-categoria" required placeholder="Ej: Comercio de Alimentos y Víveres"
                                           class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-indigo-500">
                                </div>
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-slate-400 mb-1">Descripción de la Actividad Económica <span class="text-rose-400">*</span></label>
                                <textarea id="locat-edit-nombre" rows="2" required placeholder="Descripción oficial según ordenanza..."
                                          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"></textarea>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-400 mb-1">Alícuota Mensual (%) <span class="text-rose-400">*</span></label>
                                    <input type="number" id="locat-edit-alicuota" step="0.01" min="0" max="100" required placeholder="Ej: 1.50"
                                           class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold outline-none focus:border-indigo-500">
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-400 mb-1">Mínimo Tributable (TCMMV) <span class="text-rose-400">*</span></label>
                                    <input type="number" id="locat-edit-minimo" step="0.01" min="0" required placeholder="Ej: 0.50"
                                           class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold outline-none focus:border-indigo-500">
                                </div>
                            </div>
                            <div class="pt-3 flex justify-end gap-3 border-t border-slate-800">
                                <button type="button" onclick="window.PatentesModule.cerrarModalActividadLocat()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl">Cancelar</button>
                                <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Modal Ramo de Ingreso / Tasa Municipal -->
                <div id="modal-ramo-ingreso" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                        <div class="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 id="modal-ramo-titulo" class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <i class="fas fa-coins text-amber-400"></i>
                                <span>Configurar Ramo de Ingreso / Tasa</span>
                            </h3>
                            <button type="button" onclick="window.PatentesModule.cerrarModalRamo()" class="text-slate-400 hover:text-slate-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="form-ramo-ingreso" onsubmit="window.PatentesModule.guardarRamo(event)" class="p-6 space-y-4 text-xs">
                            <input type="hidden" id="ramo-edit-id" value="">
                            <div>
                                <label class="block text-[11px] font-bold text-slate-400 mb-1">Código Presupuestario / Contable <span class="text-rose-400">*</span></label>
                                <input type="text" id="ramo-edit-codigo" required placeholder="Ej: 3.01.03.01.00"
                                       class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold outline-none focus:border-indigo-500">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-slate-400 mb-1">Nombre del Ramo o Tasa <span class="text-rose-400">*</span></label>
                                <input type="text" id="ramo-edit-nombre" required placeholder="Ej: Tasa de Aseo Urbano y Domiciliario"
                                       class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold outline-none focus:border-indigo-500">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-slate-400 mb-1">Descripción / Base Legal (Ordenanza)</label>
                                <textarea id="ramo-edit-descripcion" rows="2" placeholder="Ej: Tarifa aplicable según Ordenanza de Aseo Urbano vigente..."
                                          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"></textarea>
                            </div>
                            <div class="pt-3 flex justify-end gap-3 border-t border-slate-800">
                                <button type="button" onclick="window.PatentesModule.cerrarModalRamo()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl">Cancelar</button>
                                <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg">Guardar Ramo</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Modal Tarifa Multi-Ramo por Ordenanza -->
                <div id="modal-tarifa-ordenanza" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                        <div class="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 id="modal-tarifa-titulo" class="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <i class="fas fa-balance-scale text-emerald-400"></i>
                                <span>Configurar Tarifa por Ordenanza</span>
                            </h3>
                            <button type="button" onclick="window.PatentesModule.cerrarModalTarifa()" class="text-slate-400 hover:text-slate-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="form-tarifa-ordenanza" onsubmit="window.PatentesModule.guardarTarifa(event)" class="p-6 space-y-4 text-xs">
                            <input type="hidden" id="tarifa-edit-id" value="">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-400 mb-1">Ramo Municipal <span class="text-rose-400">*</span></label>
                                    <select id="tarifa-edit-ramo" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500 cursor-pointer">
                                        <option value="vehiculos">Vehículos (Motos / Carros / Carga)</option>
                                        <option value="aseo">Aseo Urbano y Domiciliario</option>
                                        <option value="inmuebles">Catastro / Inmuebles</option>
                                        <option value="publicidad">Publicidad y Propaganda</option>
                                        <option value="espectaculos">Espectáculos Públicos</option>
                                        <option value="tramites">Trámites y Solvencias</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-400 mb-1">Código Interno <span class="text-rose-400">*</span></label>
                                    <input type="text" id="tarifa-edit-codigo" required placeholder="Ej: VEH-MOTO-200"
                                           oninput="this.value = this.value.toUpperCase().trim()"
                                           class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold outline-none focus:border-emerald-500">
                                </div>
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-slate-400 mb-1">Nombre del Concepto / Categoría <span class="text-rose-400">*</span></label>
                                <input type="text" id="tarifa-edit-nombre" required placeholder="Ej: Motos y Motonetas hasta 200 C.C."
                                       class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold outline-none focus:border-emerald-500">
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-400 mb-1">Unidad de Cálculo</label>
                                    <select id="tarifa-edit-unidad" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500 cursor-pointer">
                                        <option value="tcmmv_fijo">TCMMV (Fijo)</option>
                                        <option value="tcmmv_m2">TCMMV / m2</option>
                                        <option value="porcentaje">% Sobre Base</option>
                                        <option value="ut">U.T. (Unid. Trib.)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-400 mb-1">Valor / Porcentaje <span class="text-rose-400">*</span></label>
                                    <input type="number" id="tarifa-edit-valor" step="0.01" min="0" required placeholder="Ej: 3.00"
                                           class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold outline-none focus:border-emerald-500">
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-400 mb-1">Periodicidad</label>
                                    <select id="tarifa-edit-periodicidad" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500 cursor-pointer">
                                        <option value="mensual">Mensual</option>
                                        <option value="trimestral">Trimestral</option>
                                        <option value="anual">Anual</option>
                                        <option value="unico">Pago Único</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-slate-400 mb-1">Base Legal / Observaciones</label>
                                <textarea id="tarifa-edit-descripcion" rows="2" placeholder="Ej: Según Art. X de la Ordenanza vigente..."
                                          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"></textarea>
                            </div>
                            <div class="pt-3 flex justify-end gap-3 border-t border-slate-800">
                                <button type="button" onclick="window.PatentesModule.cerrarModalTarifa()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl">Cancelar</button>
                                <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg">Guardar Tarifa</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        },

        filtrarTarifasPorRamo: function(ramo) {
            filtroTarifaRamo = ramo || 'todos';
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        abrirModalTarifa: function(id = null) {
            const modal = document.getElementById('modal-tarifa-ordenanza');
            if (!modal) return;
            const lista = global.HaciendaStore ? global.HaciendaStore.get('hacienda_tarifas_ordenanza') : [];
            const item = id ? lista.find(t => String(t.id) === String(id)) : null;

            document.getElementById('tarifa-edit-id').value = item ? item.id : '';
            document.getElementById('tarifa-edit-ramo').value = item ? (item.ramo || 'vehiculos') : (filtroTarifaRamo !== 'todos' ? filtroTarifaRamo : 'vehiculos');
            document.getElementById('tarifa-edit-codigo').value = item ? (item.codigo || '') : '';
            document.getElementById('tarifa-edit-nombre').value = item ? (item.nombre || '') : '';
            document.getElementById('tarifa-edit-unidad').value = item ? (item.unidad_calculo || 'tcmmv_fijo') : 'tcmmv_fijo';
            document.getElementById('tarifa-edit-valor').value = item ? Number(item.valor || 0).toFixed(2) : '';
            document.getElementById('tarifa-edit-periodicidad').value = item ? (item.periodicidad || 'anual') : 'anual';
            document.getElementById('tarifa-edit-descripcion').value = item ? (item.descripcion || '') : '';
            document.getElementById('modal-tarifa-titulo').innerHTML = `<i class="fas fa-balance-scale text-emerald-400"></i><span>${item ? 'Editar Tarifa (' + item.codigo + ')' : 'Nueva Tarifa Multi-Ramo'}</span>`;

            modal.classList.remove('hidden');
        },

        cerrarModalTarifa: function() {
            const modal = document.getElementById('modal-tarifa-ordenanza');
            if (modal) modal.classList.add('hidden');
        },

        guardarTarifa: async function(e) {
            if (e && e.preventDefault) e.preventDefault();
            const store = global.HaciendaStore;
            if (!store) return;

            const idExistente = document.getElementById('tarifa-edit-id')?.value;
            const ramo = document.getElementById('tarifa-edit-ramo')?.value || 'vehiculos';
            const codigo = document.getElementById('tarifa-edit-codigo')?.value.trim().toUpperCase();
            const nombre = document.getElementById('tarifa-edit-nombre')?.value.trim();
            const unidad_calculo = document.getElementById('tarifa-edit-unidad')?.value || 'tcmmv_fijo';
            const valor = parseFloat(document.getElementById('tarifa-edit-valor')?.value || 0);
            const periodicidad = document.getElementById('tarifa-edit-periodicidad')?.value || 'anual';
            const descripcion = document.getElementById('tarifa-edit-descripcion')?.value.trim();

            if (!codigo || !nombre) return;

            const lista = store.get('hacienda_tarifas_ordenanza') || [];
            const anterior = idExistente ? lista.find(t => String(t.id) === String(idExistente)) : null;

            const obj = {
                id: idExistente || ('tar_' + Date.now()),
                ramo,
                codigo,
                nombre,
                unidad_calculo,
                valor: Number(valor.toFixed(4)),
                periodicidad,
                descripcion,
                activo: anterior ? (anterior.activo !== false) : true,
                created_at: anterior ? (anterior.created_at || new Date().toISOString()) : new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await store.set('hacienda_tarifas_ordenanza', obj);
            this.cerrarModalTarifa();
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);

            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'success', title: 'Tarifa Guardada', text: `${codigo} actualizada correctamente.`, confirmButtonColor: '#10b981', timer: 1800, showConfirmButton: false });
            }
        },

        toggleEstadoTarifa: async function(id) {
            const store = global.HaciendaStore;
            if (!store) return;
            const lista = store.get('hacienda_tarifas_ordenanza') || [];
            const item = lista.find(t => String(t.id) === String(id));
            if (!item) return;

            await store.set('hacienda_tarifas_ordenanza', {
                ...item,
                activo: item.activo === false,
                updated_at: new Date().toISOString()
            });
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        abrirModalActividadLocat: function(id = null) {
            const modal = document.getElementById('modal-actividad-locat');
            if (!modal) return;
            const lista = global.HaciendaStore ? global.HaciendaStore.get('hacienda_actividades_locat') : [];
            const item = id ? lista.find(a => String(a.id) === String(id)) : null;

            document.getElementById('locat-edit-id').value = item ? item.id : '';
            document.getElementById('locat-edit-codigo').value = item ? (item.codigo || '') : '';
            document.getElementById('locat-edit-categoria').value = item ? (item.categoria || '') : '';
            document.getElementById('locat-edit-nombre').value = item ? (item.nombre || '') : '';
            document.getElementById('locat-edit-alicuota').value = item ? (Number(item.alicuota || 0) * 100).toFixed(2) : '';
            document.getElementById('locat-edit-minimo').value = item ? Number(item.minimo_tcmmv || 0).toFixed(2) : '';
            document.getElementById('modal-locat-titulo').innerHTML = `<i class="fas fa-sliders-h text-indigo-400"></i><span>${item ? 'Editar Tasa LOCAT (' + item.codigo + ')' : 'Nueva Actividad Económica LOCAT'}</span>`;

            modal.classList.remove('hidden');
        },

        cerrarModalActividadLocat: function() {
            const modal = document.getElementById('modal-actividad-locat');
            if (modal) modal.classList.add('hidden');
        },

        guardarActividadLocat: async function(e) {
            if (e && e.preventDefault) e.preventDefault();
            const store = global.HaciendaStore;
            if (!store) return;

            const idExistente = document.getElementById('locat-edit-id')?.value;
            const codigo = document.getElementById('locat-edit-codigo')?.value.trim().toUpperCase();
            const categoria = document.getElementById('locat-edit-categoria')?.value.trim();
            const nombre = document.getElementById('locat-edit-nombre')?.value.trim();
            const alicuotaPct = parseFloat(document.getElementById('locat-edit-alicuota')?.value || 0);
            const minimoTcmmv = parseFloat(document.getElementById('locat-edit-minimo')?.value || 0);

            if (!codigo || !categoria || !nombre) return;

            const lista = store.get('hacienda_actividades_locat') || [];
            const anterior = idExistente ? lista.find(a => String(a.id) === String(idExistente)) : null;

            const obj = {
                id: idExistente || ('locat_' + Date.now()),
                codigo: codigo,
                categoria: categoria,
                nombre: nombre,
                alicuota: Number((alicuotaPct / 100).toFixed(6)),
                minimo_tcmmv: Number(minimoTcmmv.toFixed(2)),
                activo: anterior ? (anterior.activo !== false) : true,
                created_at: anterior ? (anterior.created_at || new Date().toISOString()) : new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await store.set('hacienda_actividades_locat', obj);
            this.cerrarModalActividadLocat();
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);

            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'success', title: 'Tasa Actualizada', text: `${codigo} guardada (${alicuotaPct.toFixed(2)}% · ${minimoTcmmv.toFixed(2)} TCMMV).`, confirmButtonColor: '#4f46e5', timer: 1800, showConfirmButton: false });
            }
        },

        toggleEstadoActividadLocat: async function(id) {
            const store = global.HaciendaStore;
            if (!store) return;
            const lista = store.get('hacienda_actividades_locat') || [];
            const item = lista.find(a => String(a.id) === String(id));
            if (!item) return;

            await store.set('hacienda_actividades_locat', {
                ...item,
                activo: item.activo === false,
                updated_at: new Date().toISOString()
            });
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        abrirModalRamo: function(id = null) {
            const modal = document.getElementById('modal-ramo-ingreso');
            if (!modal) return;
            const lista = global.HaciendaStore ? global.HaciendaStore.get('hacienda_ramos_ingreso') : [];
            const item = id ? lista.find(r => String(r.id) === String(id)) : null;

            document.getElementById('ramo-edit-id').value = item ? item.id : '';
            document.getElementById('ramo-edit-codigo').value = item ? (item.codigo || '') : '';
            document.getElementById('ramo-edit-nombre').value = item ? (item.nombre || '') : '';
            document.getElementById('ramo-edit-descripcion').value = item ? (item.descripcion || '') : '';
            document.getElementById('modal-ramo-titulo').innerHTML = `<i class="fas fa-coins text-amber-400"></i><span>${item ? 'Editar Ramo (' + item.codigo + ')' : 'Nuevo Ramo de Ingreso / Tasa'}</span>`;

            modal.classList.remove('hidden');
        },

        cerrarModalRamo: function() {
            const modal = document.getElementById('modal-ramo-ingreso');
            if (modal) modal.classList.add('hidden');
        },

        guardarRamo: async function(e) {
            if (e && e.preventDefault) e.preventDefault();
            const store = global.HaciendaStore;
            if (!store) return;

            const idExistente = document.getElementById('ramo-edit-id')?.value;
            const codigo = document.getElementById('ramo-edit-codigo')?.value.trim();
            const nombre = document.getElementById('ramo-edit-nombre')?.value.trim();
            const descripcion = document.getElementById('ramo-edit-descripcion')?.value.trim();

            if (!codigo || !nombre) return;

            const lista = store.get('hacienda_ramos_ingreso') || [];
            const anterior = idExistente ? lista.find(r => String(r.id) === String(idExistente)) : null;

            const obj = {
                id: idExistente || ('ramo_' + Date.now()),
                codigo: codigo,
                nombre: nombre,
                descripcion: descripcion,
                activo: anterior ? (anterior.activo !== false) : true,
                created_at: anterior ? (anterior.created_at || new Date().toISOString()) : new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await store.set('hacienda_ramos_ingreso', obj);
            this.cerrarModalRamo();
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);

            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'success', title: 'Ramo Guardado', text: `${nombre} registrado en el catálogo.`, confirmButtonColor: '#4f46e5', timer: 1800, showConfirmButton: false });
            }
        },

        toggleEstadoRamo: async function(id) {
            const store = global.HaciendaStore;
            if (!store) return;
            const lista = store.get('hacienda_ramos_ingreso') || [];
            const item = lista.find(r => String(r.id) === String(id));
            if (!item) return;

            await store.set('hacienda_ramos_ingreso', {
                ...item,
                activo: item.activo === false,
                updated_at: new Date().toISOString()
            });
            const container = document.getElementById('app-main-content');
            if (container) this.render(container);
        },

        declararMesRapido: function(patenteId) {
            if (global.App && global.App.switchTab) {
                global.App.switchTab('declaraciones');
                setTimeout(() => {
                    if (global.DeclaracionesModule && global.DeclaracionesModule.abrirModalDeclaracion) {
                        global.DeclaracionesModule.abrirModalDeclaracion(patenteId);
                    }
                }, 100);
            }
        }
    };

    global.PatentesModule = Patentes;
})(typeof window !== 'undefined' ? window : this);
