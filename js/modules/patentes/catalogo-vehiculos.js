/**
 * ALCARAVAN / GUIRIRI SISTEMA — Catálogo Oficial de Vehículos (Basado en SATGUAICA)
 * Clasificaciones fiscales por CC/Kg, Marcas filtradas por Tipo y Modelos dinámicos por Marca.
 * Compartido entre Portal del Contribuyente y Módulo ERP Municipal.
 */
(function (global) {
    'use strict';

    const CLASIFICACIONES_SATGUAICA = {
        moto: [
            'MOTOS, MOTOCICLETAS Y MOTONETAS HASTA 200 C.C',
            'MOTOS, MOTOCICLETAS Y MOTONETAS DE 201 A 400 C.C',
            'MOTOS, MOTOCICLETAS Y MOTONETAS DE 401 C.C O MÁS'
        ],
        automovil: [
            'VEHÍCULOS DE USO PARTICULAR HASTA 350 Kg',
            'VEHÍCULOS DE USO PARTICULAR DE 351 HASTA 500 Kg',
            'VEHÍCULOS DE USO PARTICULAR DE 501 HASTA 1.000 Kg',
            'VEHÍCULOS DE USO PARTICULAR DE 1.001 HASTA 2.000 Kg',
            'VEHÍCULOS DE USO PARTICULAR MÁS DE 2.000 Kg'
        ],
        camioneta: [
            'VEHÍCULOS DE USO PARTICULAR DE 1.001 HASTA 2.000 Kg',
            'VEHÍCULOS DE USO PARTICULAR MÁS DE 2.000 Kg',
            'TRANSPORTE DE CARGA LIVIANA HASTA 8.000 Kg'
        ],
        minibus: [
            'TRANSPORTE DE PASAJEROS HASTA 1.250 Kg',
            'TRANSPORTE DE PASAJEROS DE 1.251 Kg A 2.700 Kg',
            'TRANSPORTE DE PASAJEROS 2.701 A 4.600 Kg',
            'TRANSPORTE ESCOLAR DE 501 HASTA 1.000 Kg',
            'TRANSPORTE ESCOLAR DE 1.001 HASTA 2.000 Kg',
            'TRANSPORTE ESCOLAR MÁS DE 2.001 Kg'
        ],
        autobus: [
            'TRANSPORTE DE PASAJEROS 2.701 A 4.600 Kg',
            'TRANSPORTE DE PASAJEROS 4.601 A 7.200 Kg',
            'TRANSPORTE ESCOLAR MÁS DE 2.001 Kg'
        ],
        camion_350: [
            'TRANSPORTE DE CARGA LIVIANA HASTA 8.000 Kg'
        ],
        camion_750: [
            'TRANSPORTE DE CARGA LIVIANA HASTA 8.000 Kg',
            'TRANSPORTE DE CARGA PESADA GANDOLA, REMOLQUES Y SIMILARES DE 8.001 A 15.000 Kg'
        ],
        gandola: [
            'TRANSPORTE DE CARGA PESADA GANDOLA, REMOLQUES Y SIMILARES DE 15.001 A 21.000 Kg',
            'TRANSPORTE DE CARGA PESADA GANDOLA, REMOLQUES Y SIMILARES DE 21.001 A 27.000 Kg',
            'TRANSPORTE DE CARGA PESADA GANDOLA, REMOLQUES Y SIMILARES DE 27.001 A 33.000 Kg',
            'TRANSPORTE DE CARGA PESADA GANDOLA, REMOLQUES Y SIMILARES MÁS DE 33.001 Kg'
        ],
        volteo: [
            'TRANSPORTE DE CARGA LIVIANA HASTA 8.000 Kg',
            'TRANSPORTE DE CARGA PESADA GANDOLA, REMOLQUES Y SIMILARES DE 8.001 A 15.000 Kg',
            'TRANSPORTE DE CARGA PESADA GANDOLA, REMOLQUES Y SIMILARES DE 15.001 A 21.000 Kg'
        ],
        remolque: [
            'TRANSPORTE DE CARGA PESADA GANDOLA, REMOLQUES Y SIMILARES DE 8.001 A 15.000 Kg',
            'TRANSPORTE DE CARGA PESADA GANDOLA, REMOLQUES Y SIMILARES DE 15.001 A 21.000 Kg',
            'TRANSPORTE DE CARGA PESADA GANDOLA, REMOLQUES Y SIMILARES DE 21.001 A 27.000 Kg',
            'TRANSPORTE DE CARGA PESADA GANDOLA, REMOLQUES Y SIMILARES DE 27.001 A 33.000 Kg',
            'TRANSPORTE DE CARGA PESADA GANDOLA, REMOLQUES Y SIMILARES MÁS DE 33.001 Kg'
        ],
        maquinaria: [
            'VEHÍCULOS ESPECIALES HASTA 1.000 Kg',
            'VEHÍCULOS ESPECIALES DE 1.001 a 2.000 Kg',
            'VEHÍCULOS ESPECIALES DE 2.001 O MÁS'
        ]
    };

    const MARCAS_MOTO = {
        'Bera': ['SBR 150', 'BR 150', 'BRF 150', 'BWS 150', 'BR 200', 'BR 200-2', 'Kavak 150', 'Cobra', 'Corvette', 'León 150', 'León 200', 'Milan', 'Runner', 'Merú', 'New León BR 200'],
        'Empire Keeway': ['Horse 150', 'Horse II 150', 'New Horse 150', 'EK Express 150', 'EK Express II 150', 'Owen 150', 'TX 150', 'TX 200', 'TX SM 200', 'RK 200', 'RKV 200', 'Speed 150', 'Speed 200', 'Outlook 150', 'New Outlook II', 'Superlight 200', 'Matrix 150', 'Matrix II 150', 'Matrix Elegance', 'Arsenal 150', 'Supershadow'],
        'Motos Toro': ['Jaguar 150', 'Jaguar TR 150', 'New Jaguar 150', 'Rex 150', 'León 200', 'Toro 150'],
        'AVA': ['AVA 150', 'AVA Jaguar', 'AVA Tigre'],
        'Bajaj': ['Pulsar NS 160', 'Pulsar NS 200', 'Pulsar 250', 'Pulsar N160', 'Boxer 150', 'Dominar 400'],
        'Benelli': ['TNT 150', 'TNT 25', 'TRK 251', 'TRK 502', 'Leoncino'],
        'CFMoto': ['NK 250', 'NK 400', 'MT 650', '450SR'],
        'Ducati': ['Monster', 'Multistrada', 'Scrambler', 'Panigale'],
        'Haojin': ['Águila 150', 'Halcón 150', 'HJ 125', 'HJ 150'],
        'Haojue': ['HJ 125', 'HJ 150', 'HJ-200AT', 'HJ Cool 150', 'KA 150'],
        'Harley Davidson': ['Sportster', 'Softail', 'Street Glide', 'Road King'],
        'Honda': ['CGL 125', 'XR 150L', 'XR 190', 'CB 190R', 'CRF 250', 'CBR', 'Africa Twin'],
        'Husqvarna': ['Svartpilen 200', 'Svartpilen 401', 'FE 350'],
        'Kawasaki': ['Ninja 400', 'Z400', 'KLR 650', 'KLX 150', 'Versys 650'],
        'KTM': ['Duke 200', 'Duke 390', 'Adventure 390', 'EXC'],
        'Kymco': ['Agility 125', 'Agility 150', 'Like 150', 'AK 550'],
        'Loncin': ['CR1 150', 'LX 150', 'LX 200', 'Voge 300'],
        'MD Haojin': ['Águila 150', 'Halcón 150', 'Trepador 150', 'Cardenal'],
        'Piaggio': ['Liberty', 'Beverly', 'MP3'],
        'QJ Motor': ['SRV 300', 'SRK 400', 'SRT 550'],
        'Qingqi': ['QM 150', 'QM 200GY'],
        'Senke': ['SK 150', 'SK 200', 'Raptor'],
        'Shineray': ['XY 150', 'XY 200', 'XY 250'],
        'Skygo': ['SG 150', 'SG 200', 'Executivo'],
        'Sukida': ['SK 150', 'SK 200'],
        'Suzuki': ['GN 125', 'AX 100', 'EN 125', 'Gixxer 150', 'V-Strom 650', 'DR 650'],
        'Triumph': ['Bonneville', 'Tiger 900', 'Street Triple'],
        'TVS': ['Apache RTR 160', 'Apache RTR 200', 'Raider 125', 'HLX 150'],
        'UM': ['Renegade', 'DSR 200', 'Xtreet'],
        'Vespa': ['Primavera', 'Sprint', 'GTS 300'],
        'Voge': ['300R', '300DS', '500DS', '650DSX'],
        'Yamaha': ['YBR 125', 'YBR 125ED', 'FZ 150 / FZ-S', 'XTZ 125', 'XTZ 250', 'MT-03', 'MT-07', 'BWS 125', 'Crux'],
        'Zongshen': ['ZS 150', 'ZS 200', 'RX3 250'],
        'Zontes': ['U 155', 'G1 155', 'T 310', '350T']
    };

    const MARCAS_AUTOMOVIL = {
        'Chevrolet': ['Aveo', 'Aveo LT', 'Optra', 'Spark', 'Corsa', 'Cruze', 'Chevy C2', 'Malibu', 'Cavalier', 'Century', 'Lumina', 'Esteem', 'Swift', 'Cobalt'],
        'Ford': ['Fiesta', 'Fiesta 1.6', 'Focus', 'Fusion', 'Ka', 'Laser', 'Festiva', 'Fairmont', 'Fairlane', 'Mustang', 'Zephyr', 'Del Rey', 'Corcel 2', 'Sierra 280 GT', 'Sierra 300 CSI', 'Granada', 'LTD', 'Maverick'],
        'Toyota': ['Corolla', 'Corolla GLI 1.8', 'Corolla XEI', 'Corolla Cross', 'Yaris', 'Yaris Hatchback', 'Starlet XL', 'Camry', 'Paseo', 'Crown'],
        'Chery': ['Orinoco', 'Arauca', 'X1', 'QQ', 'Cowin'],
        'Hyundai': ['Accent', 'Getz', 'Elantra', 'Sonata', 'Excel', 'i10'],
        'Kia': ['Rio', 'Picanto', 'Cerato', 'Optima', 'Spectra', 'Sephia'],
        'Fiat': ['Palio', 'Siena', 'Siena Fire 1.4L', 'Uno', 'SpaceFox', 'Cronos', 'Mobi', 'Tempra', 'Premio'],
        'Renault': ['Logan', 'Symbol', 'Twingo', 'Clio', 'Megane', 'Megane II', 'Sandero', 'Scala'],
        'Mitsubishi': ['Lancer', 'Signo', 'Touring', 'Mirage', 'Galant', 'Eclipse'],
        'Nissan': ['Sentra', 'Tiida', 'Versa', 'Almera', 'Sunny', 'Altima', 'March'],
        'Volkswagen': ['Gol', 'Fox', 'SpaceFox', 'Bora', 'Jetta', 'Golf', 'Polo', 'Vento', 'Parati', 'Escarabajo / Sedán'],
        'Honda': ['Civic', 'Accord', 'City', 'Fit'],
        'Mazda': ['Mazda 3', 'Mazda 6', 'Mazda 2', 'Allegro', '626', '323'],
        'Suzuki': ['Swift', 'Alto', 'Baleno', 'Celerio', 'Dzire'],
        'Daewoo': ['Lanos', 'Nubira', 'Cielo', 'Matiz', 'Espero', 'Leganza', 'Racer'],
        'Dodge': ['Neon', 'Brisa', 'Caliber', 'Dart', 'Spirit', 'Forza'],
        'Chrysler': ['Neon', 'Stratus', 'Sebring', 'PT Cruiser'],
        'Peugeot': ['206', '207', '208', '307', '308', '407'],
        'Citroen': ['C3', 'C4', 'Xsara', 'C-Elysée'],
        'Venirauto': ['Turpial LX', 'Centauro'],
        'BYD': ['F3', 'Dolphin', 'Seagull', 'Qin'],
        'Changan': ['Alsvin', 'Benni', 'Eado'],
        'JAC': ['J3', 'J4', 'J5', 'J7'],
        'IKCO': ['Samand', 'Soren', 'Dena'],
        'Saipa': ['Saina', 'Tiba'],
        'BMW': ['Serie 3', 'Serie 5', 'Serie 1'],
        'Mercedes-Benz': ['Clase C', 'Clase E', 'Clase A'],
        'Audi': ['A3', 'A4', 'A6']
    };

    const MARCAS_CAMIONETA = {
        'Toyota': ['Hilux', 'Hilux 4x2', 'Hilux 4x4', 'Fortuner', '4Runner', '4Runner SR5', 'Land Cruiser', 'Merú', 'Prado', 'Autana', 'Machito', 'Terios', 'Tundra', 'Tacoma', 'Yaris Cross'],
        'Chevrolet': ['Silverado', 'Cheyenne', 'Blazer', 'Grand Blazer', 'Tahoe', 'TrailBlazer', 'Luv D-Max', 'Vitara', 'Grand Vitara', 'Tracker', 'Captiva', 'Orlando', 'Avalanche', 'Colorado', 'C10'],
        'Ford': ['Explorer', 'EcoSport', 'Escape', 'Expedition', 'Bronco', 'Ranger', 'F-150', 'F-250', 'Edge', 'Sport Trac', 'SuperCab'],
        'Jeep': ['Cherokee', 'Cherokee XJ', 'Cherokee Sport', 'Grand Cherokee', 'Grand Cherokee ZJ', 'Wagoneer', 'Wrangler', 'Compass', 'Renegade', 'CJ-7', 'Comanche'],
        'Mitsubishi': ['Montero', 'Montero Dakar', 'Montero Sport', 'L200', 'Outlander', 'ASX', 'Nativa'],
        'Nissan': ['Frontier', 'Pathfinder', 'X-Trail', 'Qashqai', 'Patrol', 'Murano', 'Kicks', 'D21'],
        'Hyundai': ['Tucson', 'Santa Fe', 'Creta', 'Kona', 'Terracan'],
        'Kia': ['Sportage', 'Sorento', 'Seltos', 'Carnival', 'Mohave'],
        'Chery': ['Tiggo', 'Tiggo 2', 'Tiggo 4', 'Tiggo 7', 'Tiggo 8', 'Grand Tiger', 'X1'],
        'Great Wall': ['Wingle', 'Hover', 'Haval H6', 'Poer'],
        'Dongfeng': ['Rich', 'S30', 'AX7', 'T5 Evo'],
        'JAC': ['T6', 'T8', 'S2', 'S3', 'S4'],
        'Jetour': ['X70', 'X90', 'Dashing', 'T2'],
        'Suzuki': ['Grand Vitara', 'Vitara', 'Jimny', 'XL7', 'SX4'],
        'Dodge': ['RAM 1500', 'RAM 2500', 'Durango', 'Journey', 'Dakota', 'Nitro'],
        'Land Rover': ['Defender', 'Discovery', 'Range Rover', 'Freelander'],
        'Mazda': ['BT-50', 'CX-5', 'CX-9', 'CX-30', 'B2200', 'B2600'],
        'Volkswagen': ['Amarok', 'Tiguan', 'Touareg', 'T-Cross'],
        'Honda': ['CR-V', 'Pilot', 'HR-V'],
        'Isuzu': ['D-Max', 'Trooper', 'Rodeo', 'Caribe'],
        'Zotye': ['Nomada', 'Hunter'],
        'DFSK': ['Glory 580', 'Glory 500', 'K01'],
        'Changan': ['Hunter', 'CS35', 'CS55', 'CS75']
    };

    const MARCAS_TRANSPORTE = {
        'Encava': ['E-NT610', 'E-NT900', 'E-3100', 'E-3200', 'E-600', 'Autobús Urbano', 'Buseta'],
        'Yutong': ['ZK6752', 'ZK6852', 'ZK6896', 'ZK6118', 'ZK6122', 'Bus Urbano'],
        'Blue Bird': ['All American', 'Vision', 'Microbús Escolar'],
        'Ford': ['Econoline', 'Club Wagon', 'E-350', 'Minibús', 'Colectivo'],
        'Chevrolet': ['Chevy Van', 'Chevy Van C30', 'Express Van', 'Super Carry', 'NKR Bus'],
        'Iveco': ['Daily Minibús', 'Daily Escolar', 'Eurocargo Bus'],
        'Mercedes-Benz': ['Sprinter', 'LO 915', 'OF 1721'],
        'Hyundai': ['H1 Panel / Van', 'County', 'H100'],
        'Toyota': ['Coaster', 'Hiace'],
        'JAC': ['Sunray', 'HK6700'],
        'Hino': ['FC Bus', 'AK Bus'],
        'Dongfeng': ['Minivan', 'DFA6700']
    };

    const MARCAS_CARGA = {
        'Ford': ['F-350', 'F-350 4x2', 'F-350 4x4', 'Cargo 1721', 'Cargo 815', 'F-600', 'F-750', 'Ford-8000', 'Plataforma', 'Cava', 'Estaca', 'Furgón', 'Volteo'],
        'Chevrolet': ['NPR', 'NKR', 'NHR', 'FVR', 'Kodiak', 'C30', 'Cheyenne Carga', 'Silverado 3500', 'Plataforma', 'Cava', 'Furgón'],
        'Mack': ['Granite', 'Vision', 'Pinnacle', 'CH613', 'R600', 'Chuto', 'Volteo'],
        'Iveco': ['Daily', 'Eurocargo', 'Stralis', 'Trakker', 'Tector', 'Cavallino'],
        'Mitsubishi': ['Canter', 'Fuso', 'FV', 'Plataforma', 'Cava'],
        'Hino': ['Serie 300', 'Serie 500', 'Serie 700', 'Dutro'],
        'Freightliner': ['M2 106', 'Columbia', 'Cascadia', 'FLD 120'],
        'International': ['4300 DuraStar', '7600 WorkStar', '9200i', 'ProStar'],
        'Kenworth': ['T800', 'T680', 'W900'],
        'JAC': ['HFC1040', 'HFC1061', 'Gallop'],
        'Foton': ['Aumark', 'Auman'],
        'Sinotruk': ['Howo A7', 'Howo T7H', 'Volteo 6x4'],
        'Dongfeng': ['Duolika', 'Captain', 'Kingrun'],
        'Isuzu': ['ELF 300', 'ELF 400', 'Forward'],
        'Bateas San Cristóbal': ['Batea 2 Ejes', 'Batea 3 Ejes', 'Plataforma', 'Lowboy'],
        'Bateas JM': ['Batea 2 Ejes', 'Batea 3 Ejes', 'Remolque'],
        'Bateas Gerlap': ['Batea 3 Ejes', 'Plataforma'],
        'Remyveca': ['Batea', 'Remolque', 'Tanque / Cisterna']
    };

    const MARCAS_MAQUINARIA = {
        'Caterpillar': ['Retroexcavadora 416', 'Excavadora 320', 'Cargador Frontal', 'Motoniveladora', 'Tractor D6'],
        'John Deere': ['Tractor Agrícola', 'Retroexcavadora 310', 'Cosechadora'],
        'JCB': ['Retroexcavadora 3CX', 'Manipulador Telescópico'],
        'Komatsu': ['Excavadora PC200', 'Tractor D65', 'Cargador WA'],
        'Case': ['Retroexcavadora 580', 'Minicargador'],
        'Tiuna': ['Vehículo Táctico / Especial'],
        'Volvo': ['Cargador L90', 'Excavadora EC210']
    };

    function getCatalogoPorTipo(tipo) {
        if (tipo === 'moto') return MARCAS_MOTO;
        if (tipo === 'automovil') return MARCAS_AUTOMOVIL;
        if (tipo === 'camioneta') return MARCAS_CAMIONETA;
        if (tipo === 'minibus' || tipo === 'autobus') return MARCAS_TRANSPORTE;
        if (['camion_350', 'camion_750', 'gandola', 'volteo', 'remolque'].includes(tipo)) return MARCAS_CARGA;
        if (tipo === 'maquinaria') return MARCAS_MAQUINARIA;
        return MARCAS_AUTOMOVIL;
    }

    function getClasificacionesPorTipo(tipo) {
        return CLASIFICACIONES_SATGUAICA[tipo] || CLASIFICACIONES_SATGUAICA.automovil;
    }

    function poblarSelect(selectEl, opciones, valorPreferido = null, incluirOtro = null) {
        if (!selectEl) return '';
        let html = opciones.map(op => `<option value="${op}">${op}</option>`).join('');
        if (incluirOtro) {
            html += `<option value="${incluirOtro.value}">${incluirOtro.label}</option>`;
        }
        selectEl.innerHTML = html;

        if (valorPreferido && opciones.includes(valorPreferido)) {
            selectEl.value = valorPreferido;
        } else if (valorPreferido && incluirOtro && valorPreferido === incluirOtro.value) {
            selectEl.value = incluirOtro.value;
        } else if (selectEl.options.length > 0) {
            selectEl.selectedIndex = 0;
        }
        return selectEl.value;
    }

    const CatalogoVehiculos = {
        CLASIFICACIONES_SATGUAICA,
        getCatalogoPorTipo,
        getClasificacionesPorTipo,

        /**
         * Actualiza los selectores en cascada al cambiar el Tipo de Vehículo.
         */
        alCambiarTipo: function (cfg, esCargaInicial = false) {
            const tipoEl = document.getElementById(cfg.tipoId);
            const subtipoEl = document.getElementById(cfg.subtipoId);
            const marcaEl = document.getElementById(cfg.marcaSelectId);
            const marcaOtraEl = document.getElementById(cfg.marcaOtraId);
            const puestosEl = document.getElementById(cfg.puestosId);
            const usoEl = document.getElementById(cfg.usoId);

            if (!tipoEl) return;
            const tipo = tipoEl.value || 'automovil';

            // 1. Actualizar Clasificación Fiscal CC / Kg (SATGUAICA)
            if (subtipoEl) {
                const clasifs = getClasificacionesPorTipo(tipo);
                poblarSelect(subtipoEl, clasifs);
            }

            // 2. Actualizar Marcas filtradas por Tipo
            if (marcaEl) {
                const catalogo = getCatalogoPorTipo(tipo);
                const marcas = Object.keys(catalogo).sort((a, b) => a.localeCompare(b));
                poblarSelect(marcaEl, marcas, null, { value: 'OTRA', label: 'Otra Marca...' });
                if (marcaOtraEl) {
                    marcaOtraEl.classList.add('hidden');
                    marcaOtraEl.value = '';
                }
            }

            // 3. Actualizar Modelos de la marca seleccionada
            this.alCambiarMarca(cfg);

            // 4. Sugerir puestos y uso por defecto si el usuario está creando uno nuevo
            if (!esCargaInicial) {
                if (puestosEl) {
                    if (tipo === 'moto') puestosEl.value = '2';
                    else if (tipo === 'minibus') puestosEl.value = '24';
                    else if (tipo === 'autobus') puestosEl.value = '48';
                    else if (['camion_350', 'camion_750', 'gandola', 'volteo'].includes(tipo)) puestosEl.value = '3';
                    else if (tipo === 'remolque' || tipo === 'maquinaria') puestosEl.value = '1';
                    else puestosEl.value = '5';
                }
                if (usoEl) {
                    if (['camion_350', 'camion_750', 'gandola', 'volteo', 'remolque'].includes(tipo)) {
                        usoEl.value = 'carga';
                    } else if (tipo === 'minibus' || tipo === 'autobus') {
                        usoEl.value = 'transporte_publico';
                    } else if (tipo === 'automovil' || tipo === 'camioneta' || tipo === 'moto') {
                        if (usoEl.value === 'carga' || usoEl.value === 'transporte_publico') {
                            usoEl.value = 'particular';
                        }
                    }
                }
            }
        },

        /**
         * Actualiza el selector de Modelos al cambiar la Marca.
         */
        alCambiarMarca: function (cfg) {
            const tipoEl = document.getElementById(cfg.tipoId);
            const marcaEl = document.getElementById(cfg.marcaSelectId);
            const marcaOtraEl = document.getElementById(cfg.marcaOtraId);
            const modeloEl = document.getElementById(cfg.modeloSelectId);
            const modeloOtroEl = document.getElementById(cfg.modeloOtroId);

            if (!tipoEl || !marcaEl) return;
            const tipo = tipoEl.value || 'automovil';
            const marca = marcaEl.value;

            if (marcaOtraEl) {
                if (marca === 'OTRA') {
                    marcaOtraEl.classList.remove('hidden');
                } else {
                    marcaOtraEl.classList.add('hidden');
                    marcaOtraEl.value = '';
                }
            }

            if (modeloEl) {
                const catalogo = getCatalogoPorTipo(tipo);
                const modelos = catalogo[marca] || [];
                if (marca === 'OTRA' || modelos.length === 0) {
                    poblarSelect(modeloEl, [], 'OTRO', { value: 'OTRO', label: 'Escribir modelo manualmente...' });
                    if (modeloOtroEl) modeloOtroEl.classList.remove('hidden');
                } else {
                    poblarSelect(modeloEl, modelos, null, { value: 'OTRO', label: 'Otro modelo...' });
                    if (modeloOtroEl) {
                        modeloOtroEl.classList.add('hidden');
                        modeloOtroEl.value = '';
                    }
                }
            }
        },

        /**
         * Muestra u oculta el campo de texto libre cuando se elige "Otro modelo...".
         */
        alCambiarModelo: function (cfg) {
            const modeloEl = document.getElementById(cfg.modeloSelectId);
            const modeloOtroEl = document.getElementById(cfg.modeloOtroId);
            if (!modeloEl || !modeloOtroEl) return;

            if (modeloEl.value === 'OTRO') {
                modeloOtroEl.classList.remove('hidden');
                modeloOtroEl.focus();
            } else {
                modeloOtroEl.classList.add('hidden');
                modeloOtroEl.value = '';
            }
        },

        /**
         * Carga los valores de un vehículo existente o resetea los selectores para uno nuevo.
         */
        cargarValores: function (cfg, vehiculo = null) {
            const tipoEl = document.getElementById(cfg.tipoId);
            const marcaEl = document.getElementById(cfg.marcaSelectId);
            const marcaOtraEl = document.getElementById(cfg.marcaOtraId);
            const modeloEl = document.getElementById(cfg.modeloSelectId);
            const modeloOtroEl = document.getElementById(cfg.modeloOtroId);

            if (!tipoEl) return;

            const tipo = (vehiculo && vehiculo.tipo) ? vehiculo.tipo : 'automovil';
            tipoEl.value = tipo;
            this.alCambiarTipo(cfg, !!vehiculo);

            if (!vehiculo) return;

            const catalogo = getCatalogoPorTipo(tipo);
            const marcas = Object.keys(catalogo);
            const marcaGuardada = (vehiculo.marca || '').trim();

            if (marcaEl) {
                const matchMarca = marcas.find(m => m.toLowerCase() === marcaGuardada.toLowerCase());
                if (matchMarca) {
                    marcaEl.value = matchMarca;
                    if (marcaOtraEl) {
                        marcaOtraEl.classList.add('hidden');
                        marcaOtraEl.value = '';
                    }
                } else if (marcaGuardada) {
                    marcaEl.value = 'OTRA';
                    if (marcaOtraEl) {
                        marcaOtraEl.classList.remove('hidden');
                        marcaOtraEl.value = marcaGuardada;
                    }
                }
            }

            this.alCambiarMarca(cfg);

            const modeloGuardado = (vehiculo.modelo || '').trim();
            if (modeloEl && modeloGuardado) {
                const modelosDisponibles = catalogo[marcaEl?.value] || [];
                const matchModelo = modelosDisponibles.find(mod => mod.toLowerCase() === modeloGuardado.toLowerCase());
                if (matchModelo) {
                    modeloEl.value = matchModelo;
                    if (modeloOtroEl) {
                        modeloOtroEl.classList.add('hidden');
                        modeloOtroEl.value = '';
                    }
                } else {
                    modeloEl.value = 'OTRO';
                    if (modeloOtroEl) {
                        modeloOtroEl.classList.remove('hidden');
                        modeloOtroEl.value = modeloGuardado;
                    }
                }
            }
        },

        /**
         * Obtiene Marca y Modelo finales para guardar en Store/Supabase.
         */
        obtenerValores: function (cfg) {
            const marcaSel = document.getElementById(cfg.marcaSelectId)?.value || '';
            const marcaOtra = document.getElementById(cfg.marcaOtraId)?.value.trim() || '';
            const marca = marcaSel === 'OTRA' ? (marcaOtra || 'Otra Marca') : marcaSel;

            const modeloSel = document.getElementById(cfg.modeloSelectId)?.value || '';
            const modeloOtro = document.getElementById(cfg.modeloOtroId)?.value.trim() || '';
            const modelo = modeloSel === 'OTRO' ? modeloOtro : modeloSel;

            return { marca, modelo };
        }
    };

    global.HaciendaVehiculosCatalogo = CatalogoVehiculos;
})(typeof window !== 'undefined' ? window : this);
