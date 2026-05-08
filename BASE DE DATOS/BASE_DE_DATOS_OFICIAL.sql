-- =====================================================
-- SCHEMA COMPLETO ERP GRULAC S.R.L. — 26 TABLAS
-- Base: NuevaBase (Ciclo 1) + Tablas Oficiales Faltantes
-- PostgreSQL / Supabase — Gestión: 1-2026
-- =====================================================


-- =====================================================================
-- BLOQUE A: SEGURIDAD, AUDITORÍA Y RRHH
-- CU01, CU02, CU03, CU04, CU05, CU31, CU32, CU33, CU34
-- =====================================================================

CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(255),
    permisos_json JSONB NOT NULL DEFAULT '{}',
    estado_activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE empleados (
    id_empleado SERIAL PRIMARY KEY,
    ci_documento VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    cargo VARCHAR(100),
    telefono VARCHAR(20),
    email_personal VARCHAR(100),
    estado_activo BOOLEAN DEFAULT true,
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    -- VINCULACIÓN CON SUPABASE AUTH (Crucial para que el código Next.js funcione)
    auth_uid UUID UNIQUE,

    id_rol INT NOT NULL REFERENCES roles(id_rol),
    id_empleado INT NOT NULL REFERENCES empleados(id_empleado),
    email_corporativo VARCHAR(100) UNIQUE NOT NULL,
    estado_acceso BOOLEAN DEFAULT true,

    -- SEGURIDAD ADICIONAL (Para CU01, CU04, CU31)
    password_hash VARCHAR(255), -- Hash para validación manual (nullable para flujo de invitación)
    ultimo_login TIMESTAMPTZ,
    intentos_fallidos INT DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bitacora_auditoria (
    id_log SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario),
    accion_sql VARCHAR(50) NOT NULL,
    tabla_afectada VARCHAR(50) NOT NULL,
    registro_id INT,
    ip_address VARCHAR(45),
    fecha_hora TIMESTAMPTZ DEFAULT NOW(),
    old_data JSONB,
    new_data JSONB
);


-- =====================================================================
-- BLOQUE B: DATOS MAESTROS — Catálogo, Proveedores, Compras
-- CU08, CU09, CU12, CU13, CU14, CU15, CU16
-- =====================================================================

CREATE TABLE catalogo_items (
    id_item SERIAL PRIMARY KEY,
    codigo_sku VARCHAR(50) UNIQUE NOT NULL,
    nombre_producto VARCHAR(150) NOT NULL,
    tipo_item VARCHAR(50) NOT NULL CHECK (
        tipo_item IN ('MATERIA_PRIMA','INSUMO','PRODUCTO_TERMINADO','EMPAQUE')
    ),
    categoria VARCHAR(50),
    unidad_medida VARCHAR(20) NOT NULL,
    precio_referencia DECIMAL(10,2) DEFAULT 0,
    vida_util_dias INT,
    stock_minimo DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(), -- fecha y hora de creación del producto
    updated_at TIMESTAMPTZ DEFAULT NOW()  -- fecha y hora de modificación
);    -- todas aquellas tablas que contengan created_at y updated_at son para la bitácora de auditoría

CREATE TABLE proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    ci_nit VARCHAR(50) UNIQUE NOT NULL,
    razon_social VARCHAR(150) NOT NULL,
    tipo_proveedor VARCHAR(30) NOT NULL CHECK (
        tipo_proveedor IN ('GANADERO','INSUMOS','SERVICIOS')
    ),
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    colonia_origen VARCHAR(100),
    lead_time_dias INT DEFAULT 3,
    estado_reputacion VARCHAR(50) DEFAULT 'Activo' CHECK (
        estado_reputacion IN ('Activo','Observado','Inhabilitado_Bacteriologico','Suspendido')
    ),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CU14: Elaborar Orden de Compra de Insumos
CREATE TABLE compras_insumos (
    id_compra SERIAL PRIMARY KEY,
    id_proveedor INT NOT NULL REFERENCES proveedores(id_proveedor),
    id_usuario_recibe INT NOT NULL REFERENCES usuarios(id_usuario),
    numero_factura_compra VARCHAR(50),
    estado_compra VARCHAR(30) DEFAULT 'Pendiente' CHECK (
        estado_compra IN ('Pendiente','Recibida','Parcial','Anulada')
    ),
    monto_total_bs DECIMAL(10,2),
    fecha_compra TIMESTAMPTZ DEFAULT NOW()
);

-- CU14 / CU15: Detalle de los ítems de cada orden de compra
CREATE TABLE detalle_compras (
    id_detalle_compra SERIAL PRIMARY KEY,
    id_compra INT NOT NULL REFERENCES compras_insumos(id_compra),
    id_item INT NOT NULL REFERENCES catalogo_items(id_item),
    cantidad DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    lote_proveedor VARCHAR(50),
    fecha_vencimiento DATE
);

-- CU16: Registrar Pago a Proveedor
CREATE TABLE pagos_proveedores (
    id_pago SERIAL PRIMARY KEY,
    id_proveedor INT NOT NULL REFERENCES proveedores(id_proveedor),
    id_compra INT REFERENCES compras_insumos(id_compra), -- CU16: vincula el pago a la compra específica que se está cancelando
    id_usuario_registra INT NOT NULL REFERENCES usuarios(id_usuario),
    monto_pagado_bs DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(30),
    referencia_comprobante VARCHAR(100),
    fecha_pago TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
-- BLOQUE C: RECEPCIÓN DE LECHE Y MONITOREO AMBIENTAL
-- CU17, CU18
-- =====================================================================

CREATE TABLE zonas_almacen (
    id_zona SERIAL PRIMARY KEY,
    nombre_zona VARCHAR(100) NOT NULL,
    tipo_zona VARCHAR(50) CHECK (
        tipo_zona IN ('Camara_Frio','Almacen_Seco','Silo_Leche','Tina_Produccion','Zona_Despacho')
    ),
    temperatura_minima DECIMAL(5,2),
    temperatura_maxima DECIMAL(5,2),
    estado_activo BOOLEAN DEFAULT true
);

CREATE TABLE control_temperaturas (
    id_registro SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuarios(id_usuario),
    id_zona INT REFERENCES zonas_almacen(id_zona),
    zona_monitoreada VARCHAR(100),
    temperatura_celsius DECIMAL(5,2) NOT NULL,
    fecha_hora TIMESTAMPTZ DEFAULT NOW()
);

-- CU17 + CU18: Ticket de ingreso de cisterna y Triage Bioquímico
CREATE TABLE recepciones_leche (
    id_recepcion SERIAL PRIMARY KEY,
    id_proveedor INT NOT NULL REFERENCES proveedores(id_proveedor),
    id_laboratorista INT NOT NULL REFERENCES usuarios(id_usuario),
    litros_recibidos DECIMAL(10,2) NOT NULL,
    acidez_dornic DECIMAL(5,2),
    acidez_ph DECIMAL(4,2),
    temperatura_celsius DECIMAL(5,2),
    celulas_somaticas INT,
    antibioticos BOOLEAN DEFAULT false,
    porcentaje_grasa DECIMAL(5,2),
    densidad DECIMAL(5,2),
    porcentaje_agua DECIMAL(5,2),
    punto_congelamiento DECIMAL(5,2),
    estado_triage VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (
        estado_triage IN ('Pendiente','Aceptado','Rechazado_Calidad','Rechazado_Antibioticos','Observado')
    ),
    observaciones TEXT,
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
-- BLOQUE D: INVENTARIO KARDEX
-- CU09, CU10, CU11
-- =====================================================================

-- Nota: id_lote e id_orden_asociada se referencian DESPUÉS de crear
-- lote_produccion y ordenes_produccion (las FKs son deferidas)
CREATE TABLE movimientos_kardex (
    id_movimiento SERIAL PRIMARY KEY,
    id_item INT NOT NULL REFERENCES catalogo_items(id_item),
    id_lote INT,           -- FK diferida, se agrega con ALTER TABLE al final
    id_orden_asociada INT, -- FK diferida → ordenes_produccion (producción)
    id_compra_origen INT,  -- FK diferida → compras_insumos (CU15: trazabilidad de recepción de insumos)
    id_usuario INT NOT NULL REFERENCES usuarios(id_usuario),
    tipo_operacion VARCHAR(20) NOT NULL CHECK (
        tipo_operacion IN ('IN','OUT','AJUSTE')
    ),
    cantidad_kilos DECIMAL(10,2) NOT NULL,
    concepto_operacion TEXT,
    fecha_hora TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
-- BLOQUE E: PRODUCCIÓN Y CONTROL DE CALIDAD
-- CU19, CU20, CU21, CU22, CU23, CU24, CU25
-- =====================================================================

-- CU19: Registrar Receta Base BOM
CREATE TABLE recetas_bom (
    id_receta SERIAL PRIMARY KEY,
    id_item_resultado INT NOT NULL REFERENCES catalogo_items(id_item),
    nombre_receta VARCHAR(150) NOT NULL,
    version_receta INT DEFAULT 1,
    base_litros_leche DECIMAL(10,2),
    rendimiento_esperado_pct DECIMAL(5,2),
    estado_activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CU19: Detalle de ingredientes de cada receta BOM
CREATE TABLE receta_ingredientes (
    id_detalle_receta SERIAL PRIMARY KEY,
    id_receta INT NOT NULL REFERENCES recetas_bom(id_receta),
    id_item_ingrediente INT NOT NULL REFERENCES catalogo_items(id_item),
    cantidad_por_base DECIMAL(10,4) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL,
    es_obligatorio BOOLEAN DEFAULT true,
    tolerancia_pct DECIMAL(5,2) DEFAULT 5.00,
    observaciones VARCHAR(255)
);

-- CU20 + CU21: Aperturar y registrar parámetros de una orden de producción
CREATE TABLE ordenes_produccion (
    id_orden SERIAL PRIMARY KEY,
    id_jefe_produccion INT NOT NULL REFERENCES usuarios(id_usuario),
    id_receta INT NOT NULL REFERENCES recetas_bom(id_receta),
    litros_invertidos DECIMAL(10,2) NOT NULL,
    kilos_obtenidos_brutos DECIMAL(10,2),
    rendimiento_real_pct DECIMAL(5,2),
    costo_operativo_bs DECIMAL(10,2),
    estado_lote VARCHAR(50) NOT NULL DEFAULT 'En_Preparacion' CHECK (
        estado_lote IN (
            'En_Preparacion','En_Proceso','Completado_Pendiente_QA',
            'Completado','Cuarentena_En_Reproceso','Abortado',
            'Liberado_Comercial'
        )
    ),
    fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
    fecha_cierre TIMESTAMPTZ,
    observaciones TEXT
);

-- CU22: Codificar Lote Físico Terminado
CREATE TABLE lote_produccion (
    id_lote SERIAL PRIMARY KEY,
    id_orden INT NOT NULL REFERENCES ordenes_produccion(id_orden),
    id_item INT NOT NULL REFERENCES catalogo_items(id_item),
    codigo_lote VARCHAR(50) UNIQUE NOT NULL,
    cantidad_producida DECIMAL(10,2) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL,
    fecha_fabricacion DATE DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente_QA' CHECK (
        estado IN (
            'Pendiente_QA','Liberado_Comercial','Cuarentena_Rechazado',
            'En_Reproceso','Despachado','Agotado'
        )
    ),
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CU23 + CU24 + CU25: Ficha de Control de Calidad QA
CREATE TABLE fichas_calidad (
    id_ficha SERIAL PRIMARY KEY,
    id_orden INT NOT NULL REFERENCES ordenes_produccion(id_orden),
    id_lote INT REFERENCES lote_produccion(id_lote),
    id_ingeniero_qa INT NOT NULL REFERENCES usuarios(id_usuario),
    dictamen_qa VARCHAR(50) NOT NULL CHECK (
        dictamen_qa IN ('Aprobado','Rechazado','Reprocesar','Cuarentena')
    ),
    ph_final DECIMAL(4,2),
    salinidad DECIMAL(4,2),
    grados_brix DECIMAL(5,2),
    humedad_pct DECIMAL(5,2),
    temperatura_evaluacion DECIMAL(5,2),
    observaciones_tecnicas TEXT,
    fecha_evaluacion TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
-- BLOQUE F: COMERCIAL Y LOGÍSTICA
-- CU26, CU27, CU28, CU29, CU30
-- =====================================================================

CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    nit_facturacion VARCHAR(50) UNIQUE,
    razon_social VARCHAR(150) NOT NULL,
    tipo_cliente VARCHAR(20) DEFAULT 'B2B' CHECK (
        tipo_cliente IN ('B2B','B2C')
    ),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CU27: Generar Pedido de Venta / Reserva de stock
CREATE TABLE pedidos_ventas (
    id_pedido SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL REFERENCES clientes(id_cliente),
    id_vendedor INT NOT NULL REFERENCES usuarios(id_usuario),
    estado_reserva VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (
        estado_reserva IN (
            'Pendiente','Confirmado','Parcial','Rechazado_Stock',
            'En_Despacho','Entregado_Completo','Cancelado'
        )
    ),
    monto_total_bs DECIMAL(10,2),
    fecha_reserva TIMESTAMPTZ DEFAULT NOW(),
    fecha_entrega_programada DATE,
    metodo_pago VARCHAR(30) CHECK (
        metodo_pago IN ('Efectivo','Transferencia','QR','Credito')
    ),
    observaciones TEXT
);

-- CU27: Detalle de cada pedido
CREATE TABLE detalle_pedidos (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedidos_ventas(id_pedido),
    id_item INT NOT NULL REFERENCES catalogo_items(id_item),
    cantidad_pedida DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL
);

-- CU28: Emitir Factura Comercial
CREATE TABLE factura (
    id_factura SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedidos_ventas(id_pedido),
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    impuesto DECIMAL(10,2) DEFAULT 0,
    total_factura DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50),
    estado VARCHAR(50) NOT NULL DEFAULT 'Emitida' CHECK (
        estado IN ('Emitida','Pagado','Parcial','Anulada')
    ),
    fecha_emision TIMESTAMPTZ DEFAULT NOW()
);

-- CU29: Ejecutar Despacho Físico por FEFO
CREATE TABLE despachos_logisticos (
    id_despacho SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedidos_ventas(id_pedido),
    id_encargado INT NOT NULL REFERENCES usuarios(id_usuario),
    placa_camion VARCHAR(20),
    nombre_chofer VARCHAR(100),
    temperatura_salida DECIMAL(5,2),
    fecha_salida_ruta TIMESTAMPTZ DEFAULT NOW(),
    observaciones TEXT
);

-- CU30: Registrar Devolución de Queso (Logística Inversa)
CREATE TABLE devoluciones_qa (
    id_devolucion SERIAL PRIMARY KEY,
    id_despacho INT NOT NULL REFERENCES despachos_logisticos(id_despacho),
    id_lote INT REFERENCES lote_produccion(id_lote),
    id_asesor INT NOT NULL REFERENCES usuarios(id_usuario),
    motivo_rechazo TEXT NOT NULL,
    kilos_devueltos DECIMAL(10,2) NOT NULL,
    requiere_reposicion BOOLEAN DEFAULT false,
    estado_devolucion VARCHAR(30) DEFAULT 'Registrada' CHECK (
        estado_devolucion IN ('Registrada','Procesada','Cerrada')
    ),
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
-- BLOQUE G: SOPORTE DOCUMENTAL Y ALERTAS
-- CU06, CU07
-- =====================================================================

-- CU07: Respaldar Fichas a Storage Externo
CREATE TABLE respaldos_documentales (
    id_documento SERIAL PRIMARY KEY,
    entidad_afectada VARCHAR(50) NOT NULL,
    id_entidad INT NOT NULL,
    url_publica_storage TEXT NOT NULL,
    descripcion_archivo VARCHAR(150),
    tipo_archivo VARCHAR(20) CHECK (
        tipo_archivo IN ('PDF','IMG','XLSX','OTRO')
    ),
    tamanio_bytes BIGINT,
    id_usuario_subida INT REFERENCES usuarios(id_usuario),
    fecha_subida TIMESTAMPTZ DEFAULT NOW()
);

-- CU11: Configurar Alertas de Stock Mínimo y otros eventos
CREATE TABLE config_alertas (
    id_alerta SERIAL PRIMARY KEY,
    nombre_alerta VARCHAR(100) NOT NULL,
    tipo_evento VARCHAR(50) NOT NULL CHECK (
        tipo_evento IN ('STOCK_MINIMO','LOTE_PROXIMO_VENCER','CUARENTENA_ACTIVA','PAGO_VENCIDO','TEMPERATURA_FUERA_RANGO')
    ),
    umbral_valor DECIMAL(10,2),
    umbral_dias INT,
    emails_destino TEXT NOT NULL,
    prioridad VARCHAR(20) DEFAULT 'Media' CHECK (
        prioridad IN ('Alta','Media','Baja')
    ),
    activa BOOLEAN DEFAULT true,
    cron_expresion VARCHAR(50) DEFAULT '0 7 * * *',
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
-- BLOQUE H: FOREIGN KEYS DIFERIDAS
-- Se agregan después de crear todas las tablas para evitar
-- referencias circulares entre movimientos_kardex, lote_produccion
-- y ordenes_produccion
-- =====================================================================

ALTER TABLE movimientos_kardex
    ADD CONSTRAINT fk_kardex_lote
    FOREIGN KEY (id_lote) REFERENCES lote_produccion(id_lote);

ALTER TABLE movimientos_kardex
    ADD CONSTRAINT fk_kardex_orden
    FOREIGN KEY (id_orden_asociada) REFERENCES ordenes_produccion(id_orden);

-- CU15: Trazabilidad de movimientos de Kardex originados por una recepción de insumos comprados
ALTER TABLE movimientos_kardex
    ADD CONSTRAINT fk_kardex_compra_origen
    FOREIGN KEY (id_compra_origen) REFERENCES compras_insumos(id_compra);
    


INSERT INTO roles (nombre_rol, descripcion, permisos_json) VALUES
  ('Administrador', 'Acceso total al sistema ERP', '{"modulos": ["ALL"]}'),
  ('Jefe Produccion', 'Control de órdenes, recetas y kardex', '{"modulos": ["produccion","kardex","catalogo"]}'),
  ('Control Calidad QA', 'Fichas de calidad, recepción, laboratorio', '{"modulos": ["calidad","recepcion"]}'),
  ('Recepcionista', 'Acopio de leche y triage bioquímico', '{"modulos": ["recepcion","compras"]}'),
  ('Almacenero', 'Despacho, temperaturas y kardex', '{"modulos": ["almacen","kardex","despacho"]}'),
  ('Asesor Comercial', 'Ventas, compras, clientes, pedidos y facturación', '{"modulos": ["ventas","clientes","pedidos","compras","proveedores"]}')
ON CONFLICT (nombre_rol) DO NOTHING;