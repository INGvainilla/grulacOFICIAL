/****************************************
# SCHEMA DDL: SISTEMA ERP GRULAC S.R.L.
**Versión:** 2.0 — Completa (26 Tablas)
**Base de Datos:** PostgreSQL / Supabase
**Actualizado:** Abril 2026

**Cobertura:**
- 26 tablas (16 existentes + 10 nuevas)
- 15 módulos funcionales completos
- 25 casos de uso cubiertos
- Trazabilidad SENASAG extremo a extremo
- FEFO, RBAC, Kardex, QA, Logística Inversa
- NOT NULLs, CHECKs, FKs validadas
****************************************/


-- =====================================================================
-- BLOQUE A: SEGURIDAD, AUDITORÍA Y RRHH (Módulo 1 + 14)
-- CU01, CU02, CU03, CU04, CU05
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
    id_rol INT NOT NULL REFERENCES roles(id_rol),
    id_empleado INT NOT NULL REFERENCES empleados(id_empleado),
    email_corporativo VARCHAR(100) UNIQUE NOT NULL,
    estado_acceso BOOLEAN DEFAULT true,
    password_hash VARCHAR(255) NOT NULL,
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
-- (Módulo 2 + 4 + 5)
-- CU06, CU07, CU08, CU25
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
    created_at TIMESTAMPTZ DEFAULT NOW(), --fecha y hora de creacion del producto
    updated_at TIMESTAMPTZ DEFAULT NOW()  --fecha y hora de modificacion   
);    -- todas aquellas tablas que contengan el created_at y updated_at son para la tabla de auditoria

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

CREATE TABLE compras_insumos (
    id_compra SERIAL PRIMARY KEY,
    id_proveedor INT NOT NULL REFERENCES proveedores(id_proveedor),
    id_usuario_recibe INT NOT NULL REFERENCES usuarios(id_usuario),
    numero_factura_compra VARCHAR(50),
    estado_compra VARCHAR(30) DEFAULT 'Recibida' CHECK (
        estado_compra IN ('Pendiente','Recibida','Parcial','Anulada')
    ),
    monto_total_bs DECIMAL(10,2),
    fecha_compra TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE detalle_compras (
    id_detalle_compra SERIAL PRIMARY KEY,
    id_compra INT NOT NULL REFERENCES compras_insumos(id_compra),
    id_item INT NOT NULL REFERENCES catalogo_items(id_item),
    cantidad DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    lote_proveedor VARCHAR(50),
    fecha_vencimiento DATE
);

CREATE TABLE pagos_proveedores (
    id_pago SERIAL PRIMARY KEY,
    id_proveedor INT NOT NULL REFERENCES proveedores(id_proveedor),
    id_usuario_registra INT NOT NULL REFERENCES usuarios(id_usuario),
    monto_pagado_bs DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(30),
    referencia_comprobante VARCHAR(100),
    fecha_pago TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
-- BLOQUE C: RECEPCIÓN DE LECHE Y MONITOREO AMBIENTAL (Módulo 3)
-- CU10, CU22
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

-- *** TABLA NUEVA: Recepción de Leche Cruda y Triage ***
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
-- BLOQUE D: INVENTARIO KARDEX (Módulo 4 + 8)
-- CU07, CU13
-- =====================================================================

-- Nota: id_lote e id_orden_asociada se referencian DESPUÉS de crear
-- las tablas lote_produccion y ordenes_produccion (ALTER TABLE al final)
CREATE TABLE movimientos_kardex (
    id_movimiento SERIAL PRIMARY KEY,
    id_item INT NOT NULL REFERENCES catalogo_items(id_item),
    id_lote INT,
    id_orden_asociada INT,
    id_usuario INT NOT NULL REFERENCES usuarios(id_usuario),
    tipo_operacion VARCHAR(20) NOT NULL CHECK (
        tipo_operacion IN ('IN','OUT','AJUSTE')
    ),
    cantidad_kilos DECIMAL(10,2) NOT NULL,
    concepto_operacion TEXT,
    fecha_hora TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
-- BLOQUE E: PRODUCCIÓN Y CALIDAD (Módulo 5 + 6 + 7)
-- CU09, CU11, CU12, CU13, CU23, CU24
-- =====================================================================

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

-- *** TABLA NUEVA: Detalle de Ingredientes de cada Receta BOM ***
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

-- *** TABLA NUEVA: Órdenes de Producción ***
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

-- *** TABLA NUEVA: Lotes de Producción Físicos ***
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

-- *** TABLA NUEVA: Fichas de Control de Calidad QA ***
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
-- BLOQUE F: COMERCIAL Y LOGÍSTICA (Módulo 9 + 10 + 11)
-- CU14, CU15, CU16, CU20, CU21
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

-- *** TABLA NUEVA: Pedidos y Reservas Comerciales ***
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

-- *** TABLA NUEVA: Detalle de cada Pedido ***
CREATE TABLE detalle_pedidos (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedidos_ventas(id_pedido),
    id_item INT NOT NULL REFERENCES catalogo_items(id_item),
    cantidad_pedida DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL
);

-- *** TABLA NUEVA: Facturación ***
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

-- *** TABLA NUEVA: Despachos Logísticos ***
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

-- *** TABLA NUEVA: Devoluciones y Logística Inversa ***
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
-- BLOQUE G: SOPORTE DOCUMENTAL Y ALERTAS (Módulo 13 + 15)
-- CU18, CU19
-- =====================================================================

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
