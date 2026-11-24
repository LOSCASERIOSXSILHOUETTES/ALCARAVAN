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
        'Dayun': ['DY 150', 'DY 200'],
        'Ducati': ['Monster', 'Multistrada', 'Scrambler', 'Panigale'],
        'Enfield': ['Classic 350', 'Himalayan', 'Meteor 350', 'Hunter 350'],
        'FYM': ['FY 150', 'FY 200'],
        'Gilera': ['SMX 200', 'VC 150', 'Runner'],
        'Haojin': ['Águila 150', 'Halcón 150', 'HJ 125', 'HJ 150'],
        'Haojue': ['HJ 125', 'HJ 150', 'HJ-200AT', 'HJ Cool 150', 'KA 150'],
        'Harley Davidson': ['Sportster', 'Softail', 'Street Glide', 'Road King'],
        'Honda': ['CGL 125', 'XR 150L', 'XR 190', 'CB 190R', 'CRF 250', 'CBR', 'Africa Twin'],
        'Husqvarna': ['Svartpilen 200', 'Svartpilen 401', 'FE 350'],
        'Hyosung': ['GT 250', 'Aquila 250', 'GD 250'],
        'Jialing': ['JL 125', 'JL 150', 'JH 150'],
        'Jincheng': ['JC 125', 'JC 150', 'AX 100'],
        'Jonway': ['YY 150', 'Adventure 150'],
        'Kawasaki': ['Ninja 400', 'Z400', 'KLR 650', 'KLX 150', 'Versys 650'],
        'KTM': ['Duke 200', 'Duke 390', 'Adventure 390', 'EXC'],
        'Kymco': ['Agility 125', 'Agility 150', 'Like 150', 'AK 550'],
        'Lifan': ['LF 150', 'LF 200', 'KPR 200'],
        'LML': ['Star 150', 'Star 200'],
        'Loncin': ['CR1 150', 'LX 150', 'LX 200', 'Voge 300'],
        'Malaguti': ['Madison', 'Phantom', 'Dune 125'],
        'MD Haojin': ['Águila 150', 'Halcón 150', 'Trepador 150', 'Cardenal'],
        'Moto Morini': ['X-Cape 650', 'Seiemmezzo'],
        'Piaggio': ['Liberty', 'Beverly', 'MP3'],
        'QJ Motor': ['SRV 300', 'SRK 400', 'SRT 550'],
        'Qingqi': ['QM 150', 'QM 200GY'],
        'Qipai': ['QP 150', 'QP 200'],
        'Senke': ['SK 150', 'SK 200', 'Raptor'],
        'Shineray': ['XY 150', 'XY 200', 'XY 250'],
        'Skygo': ['SG 150', 'SG 200', 'Executivo'],
        'Sukida': ['SK 150', 'SK 200'],
        'Sumo': ['SM 150', 'SM 200'],
        'Suzuki': ['GN 125', 'AX 100', 'EN 125', 'Gixxer 150', 'V-Strom 650', 'DR 650'],
        'Traxx': ['Star 50', 'Sky 125', 'JH 150'],
        'Triumph': ['Bonneville', 'Tiger 900', 'Street Triple'],
        'TVS': ['Apache RTR 160', 'Apache RTR 200', 'Raider 125', 'HLX 150'],
        'UM (United Motors)': ['Renegade', 'DSR 200', 'Xtreet', 'Max 150'],
        'Verucci': ['VR 150', 'VR 200'],
        'Vespa': ['Primavera', 'Sprint', 'GTS 300'],
        'Voge': ['300R', '300DS', '500DS', '650DSX'],
        'Wangye': ['WY 150'],
        'Xingfu': ['XF 125', 'XF 150'],
        'Yamaha': ['YBR 125', 'YBR 125ED', 'FZ 150 / FZ-S', 'XTZ 125', 'XTZ 250', 'MT-03', 'MT-07', 'BWS 125', 'Crux'],
        'Znen': ['ZN 150'],
        'Zongshen': ['ZS 150', 'ZS 200', 'RX3 250'],
        'Zontes': ['U 155', 'G1 155', 'T 310', '350T'],
        'Zukida': ['ZK 150']
    };

    const MARCAS_AUTOMOVIL = {
        'Alfa Romeo': ['147', '156', 'Giulia', 'MiTo'],
        'Audi': ['A3', 'A4', 'A6'],
        'Baic': ['D20', 'U5', 'X25'],
        'BMW': ['Serie 3', 'Serie 5', 'Serie 1'],
        'Buick': ['Century', 'LeSabre', 'Regal'],
        'BYD': ['F3', 'Dolphin', 'Seagull', 'Qin'],
        'Cadillac': ['CTS', 'DeVille', 'STS'],
        'Chana': ['Benni', 'Star'],
        'Changan': ['Alsvin', 'Benni', 'Eado'],
        'Changhe': ['Ideal', 'Freedom'],
        'Chery': ['Orinoco', 'Arauca', 'X1', 'QQ', 'Cowin'],
        'Chevrolet': ['Aveo', 'Aveo LT', 'Optra', 'Spark', 'Corsa', 'Cruze', 'Chevy C2', 'Malibu', 'Cavalier', 'Century', 'Lumina', 'Esteem', 'Swift', 'Cobalt'],
        'Chrysler': ['Neon', 'Stratus', 'Sebring', 'PT Cruiser'],
        'Citroen': ['C3', 'C4', 'Xsara', 'C-Elysée'],
        'Dacia': ['Logan', 'Sandero'],
        'Daewoo': ['Lanos', 'Nubira', 'Cielo', 'Matiz', 'Espero', 'Leganza', 'Racer'],
        'Daihatsu': ['Charade', 'Sirion', 'Applause'],
        'Dodge': ['Neon', 'Brisa', 'Caliber', 'Dart', 'Spirit', 'Forza'],
        'Fiat': ['Palio', 'Siena', 'Siena Fire 1.4L', 'Uno', 'SpaceFox', 'Cronos', 'Mobi', 'Tempra', 'Premio'],
        'Ford': ['Fiesta', 'Fiesta 1.6', 'Focus', 'Fusion', 'Ka', 'Laser', 'Festiva', 'Fairmont', 'Fairlane', 'Mustang', 'Zephyr', 'Del Rey', 'Corcel 2', 'Sierra 280 GT', 'Sierra 300 CSI', 'Granada', 'LTD', 'Maverick'],
        'GAC': ['GA4', 'GA6'],
        'Geely': ['CK', 'MK', 'Emgrand', 'GC6'],
        'Hafei': ['Lobo', 'Saibao', 'Minyi'],
        'Haima': ['Haima 2', 'Haima 3', 'M3'],
        'Honda': ['Civic', 'Accord', 'City', 'Fit'],
        'Hyundai': ['Accent', 'Getz', 'Elantra', 'Sonata', 'Excel', 'i10'],
        'IKCO': ['Samand', 'Soren', 'Dena'],
        'Infiniti': ['Q50', 'G35', 'G37'],
        'JAC': ['J3', 'J4', 'J5', 'J7'],
        'Kaiyi': ['E5', 'Showjet'],
        'Kia': ['Rio', 'Picanto', 'Cerato', 'Optima', 'Spectra', 'Sephia'],
        'Lada': ['2105', '2107', 'Samara', 'Granta', 'Vesta'],
        'Lexus': ['IS', 'ES', 'GS'],
        'Lincoln': ['Town Car', 'MKZ', 'Continental'],
        'Mazda': ['Mazda 3', 'Mazda 6', 'Mazda 2', 'Allegro', '626', '323'],
        'Mercedes-Benz': ['Clase C', 'Clase E', 'Clase A'],
        'Mercury': ['Tracer', 'Grand Marquis', 'Milan'],
        'MG': ['MG 3', 'MG 5', 'MG GT', 'MG 6'],
        'Mini': ['Cooper', 'One', 'Clubman'],
        'Mitsubishi': ['Lancer', 'Signo', 'Touring', 'Mirage', 'Galant', 'Eclipse'],
        'Nissan': ['Sentra', 'Tiida', 'Versa', 'Almera', 'Sunny', 'Altima', 'March'],
        'Peugeot': ['206', '207', '208', '307', '308', '407'],
        'Plymouth': ['Neon', 'Breeze', 'Acclaim'],
        'Pontiac': ['Sunfire', 'Grand Am', 'G5'],
        'Porsche': ['911', 'Panamera', 'Boxster'],
        'Renault': ['Logan', 'Symbol', 'Twingo', 'Clio', 'Megane', 'Megane II', 'Sandero', 'Scala'],
        'Rover': ['25', '45', '75'],
        'Saic Wuling': ['Sunshine', 'Confero'],
        'Saipa': ['Saina', 'Tiba'],
        'Saturn': ['S-Series', 'Ion', 'Aura'],
        'Seat': ['Ibiza', 'León', 'Córdoba', 'Toledo'],
        'Skoda': ['Fabia', 'Octavia', 'Rapid'],
        'Subaru': ['Impreza', 'Legacy', 'WRX'],
        'Suzuki': ['Swift', 'Alto', 'Baleno', 'Celerio', 'Dzire'],
        'Toyota': ['Corolla', 'Corolla GLI 1.8', 'Corolla XEI', 'Corolla Cross', 'Yaris', 'Yaris Hatchback', 'Starlet XL', 'Camry', 'Paseo', 'Crown'],
        'Venirauto': ['Turpial LX', 'Centauro'],
        'Volkswagen': ['Gol', 'Fox', 'SpaceFox', 'Bora', 'Jetta', 'Golf', 'Polo', 'Vento', 'Parati', 'Escarabajo / Sedán']
    };

    const MARCAS_CAMIONETA = {
        'ARO': ['ARO 10', 'ARO 24'],
        'Baic': ['X35', 'X55', 'BJ40'],
        'Cadillac': ['Escalade', 'SRX', 'XT5'],
        'Changan': ['Hunter', 'CS35', 'CS55', 'CS75'],
        'Chery': ['Tiggo', 'Tiggo 2', 'Tiggo 4', 'Tiggo 7', 'Tiggo 8', 'Grand Tiger', 'X1'],
        'Chevrolet': ['Silverado', 'Cheyenne', 'Blazer', 'Grand Blazer', 'Tahoe', 'TrailBlazer', 'Luv D-Max', 'Vitara', 'Grand Vitara', 'Tracker', 'Captiva', 'Orlando', 'Avalanche', 'Colorado', 'C10'],
        'Daihatsu': ['Terios', 'Feroza', 'Rocky'],
        'DFSK': ['Glory 580', 'Glory 500', 'K01'],
        'Dodge': ['RAM 1500', 'RAM 2500', 'Durango', 'Journey', 'Dakota', 'Nitro'],
        'Dongfeng': ['Rich', 'S30', 'AX7', 'T5 Evo'],
        'Ford': ['Explorer', 'EcoSport', 'Escape', 'Expedition', 'Bronco', 'Ranger', 'F-150', 'F-250', 'Edge', 'Sport Trac', 'SuperCab'],
        'GAC': ['GS3', 'GS4', 'GS8'],
        'Geely': ['Coolray', 'Azkarra', 'Tugella', 'GX3'],
        'GMC': ['Sierra', 'Yukon', 'Jimmy', 'Acadia', 'Envoy'],
        'Great Wall': ['Wingle', 'Hover', 'Haval H6', 'Poer'],
        'Haima': ['S5', 'S7', '7X'],
        'Honda': ['CR-V', 'Pilot', 'HR-V'],
        'Hummer': ['H2', 'H3', 'H1'],
        'Hyundai': ['Tucson', 'Santa Fe', 'Creta', 'Kona', 'Terracan'],
        'Infiniti': ['QX50', 'QX60', 'QX80', 'FX35'],
        'Isuzu': ['D-Max', 'Trooper', 'Rodeo', 'Caribe'],
        'JAC': ['T6', 'T8', 'S2', 'S3', 'S4'],
        'Jeep': ['Cherokee', 'Cherokee XJ', 'Cherokee Sport', 'Grand Cherokee', 'Grand Cherokee ZJ', 'Wagoneer', 'Wrangler', 'Compass', 'Renegade', 'CJ-7', 'Comanche'],
        'Jetour': ['X70', 'X90', 'Dashing', 'T2'],
        'JMC': ['Vigus', 'Boarding', 'Grand Avenue'],
        'Kaiyi': ['X3', 'X3 Pro'],
        'Kia': ['Sportage', 'Sorento', 'Seltos', 'Carnival', 'Mohave'],
        'Lada': ['Niva'],
        'Land Rover': ['Defender', 'Discovery', 'Range Rover', 'Freelander'],
        'Lexus': ['LX 570', 'GX 460', 'RX 350'],
        'Lincoln': ['Navigator', 'Aviator', 'MKX'],
        'Mazda': ['BT-50', 'CX-5', 'CX-9', 'CX-30', 'B2200', 'B2600'],
        'Mercury': ['Mountaineer', 'Mariner'],
        'MG': ['ZS', 'HS', 'RX5'],
        'Mini': ['Countryman'],
        'Mitsubishi': ['Montero', 'Montero Dakar', 'Montero Sport', 'L200', 'Outlander', 'ASX', 'Nativa'],
        'Nissan': ['Frontier', 'Pathfinder', 'X-Trail', 'Qashqai', 'Patrol', 'Murano', 'Kicks', 'D21'],
        'Porsche': ['Cayenne', 'Macan'],
        'Ssangyong': ['Korando', 'Rexton', 'Actyon', 'Kyron', 'Tivoli'],
        'Subaru': ['Forester', 'XV / Crosstrek', 'Outback'],
        'Suzuki': ['Grand Vitara', 'Vitara', 'Jimny', 'XL7', 'SX4'],
        'Toyota': ['Hilux', 'Hilux 4x2', 'Hilux 4x4', 'Fortuner', '4Runner', '4Runner SR5', 'Land Cruiser', 'Merú', 'Prado', 'Autana', 'Machito', 'Terios', 'Tundra', 'Tacoma', 'Yaris Cross'],
        'Volkswagen': ['Amarok', 'Tiguan', 'Touareg', 'T-Cross'],
        'Willys': ['CJ-5', 'CJ-7', 'Wagon'],
        'Zhongxing': ['Grand Tiger', 'Admiral'],
        'Zotye': ['Nomada', 'Hunter'],
        'ZXAuto': ['Grand Tiger', 'Terralord']
    };

    const MARCAS_TRANSPORTE = {
        'Blue Bird': ['All American', 'Vision', 'Microbús Escolar'],
        'Chana': ['Minivan', 'Star Bus'],
        'Chevrolet': ['Chevy Van', 'Chevy Van C30', 'Express Van', 'Super Carry', 'NKR Bus'],
        'Dongfeng': ['Minivan', 'DFA6700'],
        'Encava': ['E-NT610', 'E-NT900', 'E-3100', 'E-3200', 'E-600', 'Autobús Urbano', 'Buseta'],
        'Ford': ['Econoline', 'Club Wagon', 'E-350', 'Minibús', 'Colectivo'],
        'Hafei': ['Minyi Van'],
        'Hino': ['FC Bus', 'AK Bus'],
        'Hyundai': ['H1 Panel / Van', 'County', 'H100'],
        'Iveco': ['Daily Minibús', 'Daily Escolar', 'Eurocargo Bus'],
        'JAC': ['Sunray', 'HK6700'],
        'Marcopolo': ['Senior', 'Volare', 'Paradiso', 'Torino'],
        'Mercedes-Benz': ['Sprinter', 'LO 915', 'OF 1721'],
        'Saic Wuling': ['Van / Minivan'],
        'Toyota': ['Coaster', 'Hiace'],
        'Yutong': ['ZK6752', 'ZK6852', 'ZK6896', 'ZK6118', 'ZK6122', 'Bus Urbano']
    };

    const MARCAS_CARGA = {
        'Bateas Gerlap': ['Batea 3 Ejes', 'Plataforma'],
        'Bateas JM': ['Batea 2 Ejes', 'Batea 3 Ejes', 'Remolque'],
        'Bateas San Cristóbal': ['Batea 2 Ejes', 'Batea 3 Ejes', 'Plataforma', 'Lowboy'],
        'Chevrolet': ['NPR', 'NKR', 'NHR', 'FVR', 'Kodiak', 'C30', 'Cheyenne Carga', 'Silverado 3500', 'Plataforma', 'Cava', 'Furgón'],
        'Dongfeng': ['Duolika', 'Captain', 'Kingrun'],
        'Dorsey': ['Batea', 'Plataforma', 'Furgón'],
        'Ebro': ['L-60', 'L-80', 'M-100'],
        'Ford': ['F-350', 'F-350 4x2', 'F-350 4x4', 'Cargo 1721', 'Cargo 815', 'F-600', 'F-750', 'Ford-8000', 'Plataforma', 'Cava', 'Estaca', 'Furgón', 'Volteo'],
        'Foton': ['Aumark', 'Auman'],
        'Freightliner': ['M2 106', 'Columbia', 'Cascadia', 'FLD 120'],
        'Fruehauf': ['Batea', 'Plataforma', 'Furgón', 'Cisterna'],
        'GMC': ['TopKick', 'C6500', 'C7500', 'C8500'],
        'Great Dane': ['Furgón', 'Refrigerado', 'Plataforma'],
        'Hino': ['Serie 300', 'Serie 500', 'Serie 700', 'Dutro'],
        'International': ['4300 DuraStar', '7600 WorkStar', '9200i', 'ProStar'],
        'Isuzu': ['ELF 300', 'ELF 400', 'Forward'],
        'Iveco': ['Daily', 'Eurocargo', 'Stralis', 'Trakker', 'Tector', 'Cavallino'],
        'JAC': ['HFC1040', 'HFC1061', 'Gallop'],
        'JMC': ['Carrying', 'Conquer', 'N720'],
        'Kamaz': ['5320', '65115', '6520'],
        'Kenworth': ['T800', 'T680', 'W900'],
        'Mack': ['Granite', 'Vision', 'Pinnacle', 'CH613', 'R600', 'Chuto', 'Volteo'],
        'Mitsubishi': ['Canter', 'Fuso', 'FV', 'Plataforma', 'Cava'],
        'Pegaso': ['Troner', 'Tecno', '1223'],
        'Remyveca': ['Batea', 'Remolque', 'Tanque / Cisterna'],
        'Sinotruk': ['Howo A7', 'Howo T7H', 'Volteo 6x4'],
        'Volvo': ['FH', 'FM', 'VM', 'NL12'],
        'Wabash National': ['Furgón', 'Plataforma']
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
