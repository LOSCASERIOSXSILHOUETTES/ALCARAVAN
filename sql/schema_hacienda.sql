-- ============================================================================
-- SISTEMA TRIBUTARIO MUNICIPAL HACIENDA (ALCARAVAN / GUIIRIRI SGB V3)
-- Arquitectura SGB Silhouettes (0ms Latencia, Offline-First, Supabase Bi-Sync)
-- Normativa: Ley Orgánica de Coordinación y Armonización Tributaria (LOCAT)
-- Soporte Nativo: UUIDv4 Inmutable (crypto.randomUUID()) para Identidad y Google Drive
-- ============================================================================

-- 1. TABLA: hacienda_contribuyentes (Padrón / Registro Único de Contribuyentes)
CREATE TABLE IF NOT EXISTS "public"."hacienda_contribuyentes" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "rif" TEXT NOT NULL UNIQUE,
    "razon_social" TEXT NOT NULL,
    "denominacion_comercial" TEXT,
    "tipo_persona" TEXT NOT NULL DEFAULT 'juridica', -- 'juridica', 'natural'
    "correo" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion_fiscal" TEXT NOT NULL,
    "representante_legal" TEXT,
    "representante_cedula" TEXT,
    "acta_constitutiva_url" TEXT,
    "fotos_local" JSONB DEFAULT '[]'::jsonb,
    "estado" TEXT NOT NULL DEFAULT 'activo', -- 'activo', 'bloqueado', 'en_revision'
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: hacienda_patentes (Licencias de Actividades Económicas)
CREATE TABLE IF NOT EXISTS "public"."hacienda_patentes" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "numero_patente" TEXT NOT NULL UNIQUE,
    "contribuyente_id" TEXT NOT NULL REFERENCES "public"."hacienda_contribuyentes"("id") ON DELETE CASCADE,
    "tipo" TEXT NOT NULL DEFAULT 'comercial', -- 'comercial', 'industrial', 'servicios'
    "codigo_locat" TEXT,
    "descripcion_actividad" TEXT,
    "alicuota" NUMERIC(6,4) DEFAULT 0.0150, -- 1.50%
    "minimo_tributable_tcmmv" NUMERIC(10,2) DEFAULT 0.50, -- Mínimo en moneda de mayor valor
    "datos_especificos" JSONB DEFAULT '{}'::jsonb,
    "estado" TEXT NOT NULL DEFAULT 'activa', -- 'activa', 'suspendida', 'en_tramite'
    "fecha_emision" DATE DEFAULT CURRENT_DATE,
    "fecha_vencimiento" DATE,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: hacienda_declaraciones (Autoliquidaciones Mensuales de Ingresos Brutos)
CREATE TABLE IF NOT EXISTS "public"."hacienda_declaraciones" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "contribuyente_id" TEXT NOT NULL REFERENCES "public"."hacienda_contribuyentes"("id") ON DELETE CASCADE,
    "patente_id" TEXT NOT NULL REFERENCES "public"."hacienda_patentes"("id") ON DELETE CASCADE,
    "anio" INT NOT NULL,
    "mes" INT NOT NULL,
    "base_imponible_bs" NUMERIC(18,2) DEFAULT 0.00,
    "alicuota_aplicada" NUMERIC(6,4) DEFAULT 0.0000,
    "impuesto_alicuota_bs" NUMERIC(18,2) DEFAULT 0.00,
    "minimo_tributable_bs" NUMERIC(18,2) DEFAULT 0.00,
    "impuesto_determinado_bs" NUMERIC(18,2) DEFAULT 0.00,
    "tasa_bcv_aplicada" NUMERIC(12,4) DEFAULT 0.0000,
    "estado" TEXT NOT NULL DEFAULT 'declarada', -- 'borrador', 'declarada', 'liquidada', 'pagada'
    "fecha_declaracion" TIMESTAMPTZ DEFAULT NOW(),
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "hacienda_declaracion_unica" UNIQUE ("contribuyente_id", "patente_id", "anio", "mes")
);

-- 4. TABLA: hacienda_pagos (Entero de Pagos, Taquilla y Conciliación Bancaria)
CREATE TABLE IF NOT EXISTS "public"."hacienda_pagos" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "numero_recibo" TEXT UNIQUE,
    "contribuyente_id" TEXT NOT NULL REFERENCES "public"."hacienda_contribuyentes"("id") ON DELETE CASCADE,
    "declaracion_id" TEXT REFERENCES "public"."hacienda_declaraciones"("id") ON DELETE SET NULL,
    "banco_origen" TEXT,
    "banco_destino" TEXT NOT NULL,
    "referencia_bancaria" TEXT NOT NULL,
    "fecha_pago" DATE NOT NULL,
    "monto_bs" NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    "comprobante_url" TEXT,
    "metodo" TEXT NOT NULL DEFAULT 'transferencia', -- 'transferencia', 'punto_venta', 'efectivo', 'pago_movil'
    "estado" TEXT NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'conciliado', 'rechazado'
    "verificado_por" TEXT,
    "fecha_verificacion" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: hacienda_solvencias (Solvencias Municipales Automatizadas con QR)
CREATE TABLE IF NOT EXISTS "public"."hacienda_solvencias" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "numero_solvencia" TEXT NOT NULL UNIQUE,
    "contribuyente_id" TEXT NOT NULL REFERENCES "public"."hacienda_contribuyentes"("id") ON DELETE CASCADE,
    "tipo" TEXT NOT NULL DEFAULT 'unica', -- 'unica', 'comercial', 'inmueble', 'vehiculo'
    "codigo_qr" TEXT NOT NULL,
    "fecha_emision" DATE DEFAULT CURRENT_DATE,
    "fecha_vencimiento" DATE NOT NULL,
    "emitido_por" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'valida', -- 'valida', 'vencida', 'anulada'
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: hacienda_tramites (Tasas Administrativas, Permisos y Solicitudes)
CREATE TABLE IF NOT EXISTS "public"."hacienda_tramites" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "numero_tramite" TEXT NOT NULL UNIQUE,
    "contribuyente_id" TEXT NOT NULL REFERENCES "public"."hacienda_contribuyentes"("id") ON DELETE CASCADE,
    "departamento" TEXT NOT NULL DEFAULT 'hacienda', -- 'hacienda', 'catastro', 'ingenieria', 'bomberos'
    "nombre_tramite" TEXT NOT NULL,
    "motivo" TEXT,
    "tasa_bs" NUMERIC(18,2) DEFAULT 0.00,
    "pago_id" TEXT REFERENCES "public"."hacienda_pagos"("id") ON DELETE SET NULL,
    "estado" TEXT NOT NULL DEFAULT 'iniciado', -- 'iniciado', 'en_revision', 'aprobado', 'rechazado'
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA: hacienda_cuentas (Cuentas Bancarias Recaudadoras del Municipio)
CREATE TABLE IF NOT EXISTS "public"."hacienda_cuentas" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "banco" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" TEXT DEFAULT 'Corriente',
    "concepto" TEXT,
    "saldo_inicial" NUMERIC(18,2) DEFAULT 0.00,
    "saldo_actual" NUMERIC(18,2) DEFAULT 0.00,
    "estado" TEXT DEFAULT 'activa',
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA: hacienda_ramos_ingreso (Clasificador Presupuestario de Ingresos Tributarios)
CREATE TABLE IF NOT EXISTS "public"."hacienda_ramos_ingreso" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "codigo" TEXT NOT NULL UNIQUE,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLA: hacienda_conciliacion (Cabecera Diaria de Pareo Bancario Smart Ledger V8)
CREATE TABLE IF NOT EXISTS "public"."hacienda_conciliacion" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "cuenta_id" TEXT REFERENCES "public"."hacienda_cuentas"("id") ON DELETE CASCADE,
    "fecha" DATE NOT NULL,
    "saldo_inicial" NUMERIC(18,2) DEFAULT 0.00,
    "total_ingresos" NUMERIC(18,2) DEFAULT 0.00,
    "total_egresos" NUMERIC(18,2) DEFAULT 0.00,
    "saldo_final" NUMERIC(18,2) DEFAULT 0.00,
    "estado" TEXT DEFAULT 'conciliado',
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABLA: hacienda_conciliacion_desglose (Líneas de Extractos Bancarios e Inyecciones)
CREATE TABLE IF NOT EXISTS "public"."hacienda_conciliacion_desglose" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "conciliacion_id" TEXT REFERENCES "public"."hacienda_conciliacion"("id") ON DELETE CASCADE,
    "cuenta_id" TEXT REFERENCES "public"."hacienda_cuentas"("id") ON DELETE SET NULL,
    "fecha" DATE NOT NULL,
    "tipo" TEXT NOT NULL, -- 'deposito', 'transferencia', 'debito', 'comision'
    "referencia" TEXT,
    "descripcion" TEXT,
    "monto" NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    "pago_id" TEXT REFERENCES "public"."hacienda_pagos"("id") ON DELETE SET NULL,
    "categoria" TEXT,
    "estado" TEXT DEFAULT 'conciliado',
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABLA: hacienda_inmuebles (Catastro Urbano y Rural / Derecho de Frente)
CREATE TABLE IF NOT EXISTS "public"."hacienda_inmuebles" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "contribuyente_id" TEXT NOT NULL REFERENCES "public"."hacienda_contribuyentes"("id") ON DELETE CASCADE,
    "numero_catastro" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "uso" TEXT DEFAULT 'comercial', -- 'comercial', 'residencial', 'industrial'
    "valor_fiscal_bs" NUMERIC(18,2) DEFAULT 0.00,
    "estado" TEXT DEFAULT 'activo',
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TABLA: hacienda_vehiculos (Registro de Vehículos y Transporte)
CREATE TABLE IF NOT EXISTS "public"."hacienda_vehiculos" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "contribuyente_id" TEXT NOT NULL REFERENCES "public"."hacienda_contribuyentes"("id") ON DELETE CASCADE,
    "placa" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "anio" INT,
    "uso" TEXT DEFAULT 'carga', -- 'carga', 'particular', 'transporte_publico'
    "estado" TEXT DEFAULT 'activo',
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 13. TABLA: hacienda_publicidad (Propaganda y Publicidad Comercial)
CREATE TABLE IF NOT EXISTS "public"."hacienda_publicidad" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "contribuyente_id" TEXT NOT NULL REFERENCES "public"."hacienda_contribuyentes"("id") ON DELETE CASCADE,
    "tipo" TEXT NOT NULL, -- 'valla', 'aviso_luminoso', 'pancarta', 'mural'
    "ubicacion" TEXT NOT NULL,
    "metros_cuadrados" NUMERIC(10,2) DEFAULT 0.00,
    "texto_aviso" TEXT,
    "estado" TEXT DEFAULT 'activo',
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 14. TABLA: hacienda_popups (Gestor de Comunicados y Popups Emergentes desde ERP)
CREATE TABLE IF NOT EXISTS "public"."hacienda_popups" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT,
    "tipo" TEXT DEFAULT 'mixto', -- 'imagen', 'texto', 'mixto'
    "imagen_url" TEXT,
    "enlace_url" TEXT,
    "destino" TEXT DEFAULT 'portal', -- 'portal', 'admin', 'ambos'
    "activo" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 15. TABLA: hacienda_carrusel (Slides y Avisos del Hero Carrusel de Portada)
CREATE TABLE IF NOT EXISTS "public"."hacienda_carrusel" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "tag" TEXT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "btn_texto" TEXT,
    "btn_icono" TEXT,
    "btn_enlace" TEXT,
    "badge_bg" TEXT,
    "gradient" TEXT,
    "icon" TEXT,
    "imagen_url" TEXT,
    "activo" BOOLEAN DEFAULT true,
    "orden" INTEGER DEFAULT 1,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ACTIVACION DE ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
-- ============================================================================

ALTER TABLE "public"."hacienda_contribuyentes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hacienda_patentes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hacienda_declaraciones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hacienda_pagos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hacienda_solvencias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hacienda_tramites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hacienda_cuentas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hacienda_ramos_ingreso" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hacienda_conciliacion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hacienda_conciliacion_desglose" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hacienda_inmuebles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hacienda_vehiculos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hacienda_publicidad" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hacienda_popups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hacienda_carrusel" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITICAS PERMISIVAS (ARQUITECTURA SGB 0MS OFFLINE-FIRST)
-- ============================================================================

DROP POLICY IF EXISTS "Permisivo hacienda_contribuyentes" ON "public"."hacienda_contribuyentes";
CREATE POLICY "Permisivo hacienda_contribuyentes" ON "public"."hacienda_contribuyentes" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permisivo hacienda_patentes" ON "public"."hacienda_patentes";
CREATE POLICY "Permisivo hacienda_patentes" ON "public"."hacienda_patentes" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permisivo hacienda_declaraciones" ON "public"."hacienda_declaraciones";
CREATE POLICY "Permisivo hacienda_declaraciones" ON "public"."hacienda_declaraciones" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permisivo hacienda_pagos" ON "public"."hacienda_pagos";
CREATE POLICY "Permisivo hacienda_pagos" ON "public"."hacienda_pagos" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permisivo hacienda_solvencias" ON "public"."hacienda_solvencias";
CREATE POLICY "Permisivo hacienda_solvencias" ON "public"."hacienda_solvencias" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permisivo hacienda_tramites" ON "public"."hacienda_tramites";
CREATE POLICY "Permisivo hacienda_tramites" ON "public"."hacienda_tramites" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permisivo hacienda_cuentas" ON "public"."hacienda_cuentas";
CREATE POLICY "Permisivo hacienda_cuentas" ON "public"."hacienda_cuentas" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permisivo hacienda_ramos_ingreso" ON "public"."hacienda_ramos_ingreso";
CREATE POLICY "Permisivo hacienda_ramos_ingreso" ON "public"."hacienda_ramos_ingreso" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permisivo hacienda_conciliacion" ON "public"."hacienda_conciliacion";
CREATE POLICY "Permisivo hacienda_conciliacion" ON "public"."hacienda_conciliacion" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permisivo hacienda_conciliacion_desglose" ON "public"."hacienda_conciliacion_desglose";
CREATE POLICY "Permisivo hacienda_conciliacion_desglose" ON "public"."hacienda_conciliacion_desglose" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permisivo hacienda_inmuebles" ON "public"."hacienda_inmuebles";
CREATE POLICY "Permisivo hacienda_inmuebles" ON "public"."hacienda_inmuebles" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permisivo hacienda_vehiculos" ON "public"."hacienda_vehiculos";
CREATE POLICY "Permisivo hacienda_vehiculos" ON "public"."hacienda_vehiculos" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permisivo hacienda_publicidad" ON "public"."hacienda_publicidad";
CREATE POLICY "Permisivo hacienda_publicidad" ON "public"."hacienda_publicidad" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permisivo hacienda_popups" ON "public"."hacienda_popups";
CREATE POLICY "Permisivo hacienda_popups" ON "public"."hacienda_popups" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permisivo hacienda_carrusel" ON "public"."hacienda_carrusel";
CREATE POLICY "Permisivo hacienda_carrusel" ON "public"."hacienda_carrusel" FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- OTORGAR PRIVILEGIOS COMPLETOS A LOS ROLES DE SUPABASE
-- ============================================================================

GRANT ALL ON "public"."hacienda_contribuyentes" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."hacienda_patentes" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."hacienda_declaraciones" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."hacienda_pagos" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."hacienda_solvencias" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."hacienda_tramites" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."hacienda_cuentas" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."hacienda_ramos_ingreso" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."hacienda_conciliacion" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."hacienda_conciliacion_desglose" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."hacienda_inmuebles" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."hacienda_vehiculos" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."hacienda_publicidad" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."hacienda_popups" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."hacienda_carrusel" TO "anon", "authenticated", "service_role";

-- ============================================================================
-- PUBLICACION PARA SUPABASE REALTIME (POSTGRES CHANGES)
-- ============================================================================
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE 
            "public"."hacienda_contribuyentes",
            "public"."hacienda_patentes",
            "public"."hacienda_declaraciones",
            "public"."hacienda_pagos",
            "public"."hacienda_solvencias",
            "public"."hacienda_tramites",
            "public"."hacienda_cuentas",
            "public"."hacienda_ramos_ingreso",
            "public"."hacienda_conciliacion",
            "public"."hacienda_conciliacion_desglose",
            "public"."hacienda_inmuebles",
            "public"."hacienda_vehiculos",
            "public"."hacienda_publicidad",
            "public"."hacienda_popups",
            "public"."hacienda_carrusel";
    EXCEPTION WHEN duplicate_object THEN
        -- Ya estaban agregadas a la publicacion
    END;
END $$;
