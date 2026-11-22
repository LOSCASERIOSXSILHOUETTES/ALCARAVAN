/**
 * GUIRIRI SISTEMA HACIENDA V3 — Módulo de Patentes y Licencias (LOCAT)
 * Registro de licencias comerciales y patente automotriz sobre vehículos.
 */
(function definePatentesModule(global) {
    "use strict";

    let subVistaActiva = 'comercial'; // 'comercial' o 'vehiculos'
    let filtroVehiculoTexto = '';

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
                            <div class="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
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
                            </div>
                        </div>

                        ${subVistaActiva === 'comercial' ? `
                            <button onclick="window.PatentesModule.abrirModalPatente()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                                <i class="fas fa-plus"></i>
                                <span>Nueva Licencia / Patente</span>
                            </button>
                        ` : `
                            <button onclick="window.PatentesModule.abrirModalVehiculo()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                                <i class="fas fa-plus"></i>
                                <span>Registrar Vehículo</span>
                            </button>
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
                    ` : `
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
                                <label class="block text-xs font-bold text-slate-400 mb-1">Actividad Económica (Clasificador LOCAT)</label>
                                <select id="pat-locat-select" onchange="window.PatentesModule.alCambiarActividad()" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs outline-none focus:border-indigo-500">
                                    <option value="">Seleccione una actividad del clasificador...</option>
                                    ${(global.CatalogoLocat ? global.CatalogoLocat.getAll() : []).map(a => `
                                        <option value="${a.codigo}" data-alicuota="${a.alicuota}" data-minimo="${a.minimo_tcmmv}">
                                            [${a.codigo}] ${a.nombre} (${(a.alicuota * 100).toFixed(2)}%)
                                        </option>
                                    `).join('')}
                                </select>
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
                                        <select id="erp-veh-tipo" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-indigo-500 cursor-pointer">
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
                                        <select id="erp-veh-marca" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-indigo-500 cursor-pointer">
                                            <option value="Chevrolet">Chevrolet</option>
                                            <option value="Ford">Ford</option>
                                            <option value="Toyota">Toyota</option>
                                            <option value="Fiat">Fiat</option>
                                            <option value="Renault">Renault</option>
                                            <option value="Hyundai">Hyundai</option>
                                            <option value="Chery">Chery</option>
                                            <option value="Mitsubishi">Mitsubishi</option>
                                            <option value="Nissan">Nissan</option>
                                            <option value="Jeep">Jeep</option>
                                            <option value="Kia">Kia</option>
                                            <option value="Volkswagen">Volkswagen</option>
                                            <option value="Honda">Honda</option>
                                            <option value="Mazda">Mazda</option>
                                            <option value="Mack">Mack</option>
                                            <option value="Iveco">Iveco</option>
                                            <option value="Bera">Bera</option>
                                            <option value="Empire Keeway">Empire Keeway</option>
                                            <option value="Motos Toro">Motos Toro</option>
                                            <option value="Otra">Otra Marca</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-400 mb-1">Modelo <span class="text-rose-400">*</span></label>
                                        <input type="text" id="erp-veh-modelo" required placeholder="Ej: Silverado / Hilux / Aveo"
                                               class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-indigo-500">
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
            const opt = select.options[select.selectedIndex];
            if (!opt || !opt.dataset) return;

            const alicuota = parseFloat(opt.dataset.alicuota || 0);
            const minimo = parseFloat(opt.dataset.minimo || 0);

            document.getElementById('pat-alicuota').value = (alicuota * 100).toFixed(2);
            document.getElementById('pat-minimo').value = minimo.toFixed(2);
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
                    if (selectTipo) selectTipo.value = v.tipo || 'automovil';
                    if (selectMarca) selectMarca.value = v.marca || 'Chevrolet';
                    if (inputModelo) inputModelo.value = v.modelo || '';
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
                if (selectTipo) selectTipo.value = 'automovil';
                if (selectMarca) selectMarca.value = 'Chevrolet';
                if (inputModelo) inputModelo.value = '';
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
            const marca = document.getElementById('erp-veh-marca')?.value || 'Chevrolet';
            const modelo = document.getElementById('erp-veh-modelo')?.value.trim() || '';
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

            const locatSelect = document.getElementById('pat-locat-select');
            const opt = locatSelect.options[locatSelect.selectedIndex];

            const nuevaPatente = {
                numero_patente: document.getElementById('pat-numero').value.trim(),
                contribuyente_id: contribId,
                tipo: 'comercial',
                codigo_locat: locatSelect.value,
                descripcion_actividad: opt.text.split('] ')[1]?.split(' (')[0] || opt.text,
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
