/**
 * GUIRIRI SISTEMA HACIENDA V3 — Catálogo Armonizado LOCAT
 * Actividades Económicas y Alícuotas Oficiales de Venezuela.
 */
(function defineLocatCatalog(global) {
    "use strict";

    const CATALOGO = [
        { codigo: "COM-001", nombre: "Venta al por menor de víveres, alimentos y abarrotes", alicuota: 0.0100, minimo_tcmmv: 0.30 },
        { codigo: "COM-002", nombre: "Panaderías, pastelerías y reposterías", alicuota: 0.0125, minimo_tcmmv: 0.40 },
        { codigo: "COM-003", nombre: "Farmacias, expendios de medicinas y material médico", alicuota: 0.0100, minimo_tcmmv: 0.35 },
        { codigo: "COM-004", nombre: "Ferreterías, materiales de construcción y pinturas", alicuota: 0.0150, minimo_tcmmv: 0.50 },
        { codigo: "COM-005", nombre: "Venta de repuestos, lubricantes y accesorios para vehículos", alicuota: 0.0200, minimo_tcmmv: 0.60 },
        { codigo: "COM-006", nombre: "Venta de electrodomésticos, equipos de computación y celulares", alicuota: 0.0250, minimo_tcmmv: 0.80 },
        { codigo: "LIC-001", nombre: "Expendio de bebidas alcohólicas al detal (Licorerías)", alicuota: 0.0350, minimo_tcmmv: 1.50 },
        { codigo: "LIC-002", nombre: "Bares, discotecas, tascas y clubes nocturnos", alicuota: 0.0450, minimo_tcmmv: 2.00 },
        { codigo: "SER-001", nombre: "Restaurantes, fuentes de soda y venta de comida rápida", alicuota: 0.0175, minimo_tcmmv: 0.50 },
        { codigo: "SER-002", nombre: "Talleres mecánicos, latonería y pintura", alicuota: 0.0150, minimo_tcmmv: 0.45 },
        { codigo: "SER-003", nombre: "Servicios médicos, odontológicos y laboratorios privados", alicuota: 0.0120, minimo_tcmmv: 0.50 },
        { codigo: "SER-004", nombre: "Hoteles, posadas y servicios de hospedaje", alicuota: 0.0200, minimo_tcmmv: 1.00 },
        { codigo: "IND-001", nombre: "Industria agropecuaria, queseras y procesamiento de alimentos", alicuota: 0.0100, minimo_tcmmv: 0.50 },
        { codigo: "IND-002", nombre: "Fabricación de bloques, premix y derivados del cemento", alicuota: 0.0150, minimo_tcmmv: 0.80 },
        { codigo: "FIN-001", nombre: "Bancos comerciales, entidades financieras y casas de cambio", alicuota: 0.0500, minimo_tcmmv: 3.00 },
        { codigo: "TEL-001", nombre: "Empresas de telecomunicaciones e internet", alicuota: 0.0300, minimo_tcmmv: 2.50 }
    ];

    global.CatalogoLocat = {
        getAll: () => [...CATALOGO],
        getByCodigo: (codigo) => CATALOGO.find(item => item.codigo === codigo) || null
    };
})(typeof window !== 'undefined' ? window : this);
