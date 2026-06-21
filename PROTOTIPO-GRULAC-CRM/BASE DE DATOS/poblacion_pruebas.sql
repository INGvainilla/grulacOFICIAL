-- =====================================================================
-- SCRIPT DE POBLACIÓN DE DATOS DE PRUEBA (SEED DATA)
-- ERP GRULAC S.R.L. — Gestión: 1-2026
-- =====================================================================
-- NOTA: Este script NO elimina ni modifica las tablas 'usuarios', 'roles'
-- o 'empleados'. Se asume que dichas tablas ya contienen registros.
-- Las claves foráneas de usuarios se resuelven dinámicamente.
-- =====================================================================

-- =====================================================================
-- 0. MIGRACIÓN AUTOMÁTICA DE DISCREPANCIAS DE COLUMNAS
-- Ajusta las tablas creadas con el esquema inicial para que coincidan
-- con el código de la app CRM y el módulo de despacho/devolución.
-- =====================================================================
DO $$
BEGIN
    -- 1. Renombrar fecha_salida_ruta a fecha_despacho en despachos_logisticos
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='despachos_logisticos' AND column_name='fecha_salida_ruta'
    ) THEN
        ALTER TABLE despachos_logisticos RENAME COLUMN fecha_salida_ruta TO fecha_despacho;
    END IF;

    -- 2. Renombrar fecha_registro a created_at en devoluciones_qa
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='devoluciones_qa' AND column_name='fecha_registro'
    ) THEN
        ALTER TABLE devoluciones_qa RENAME COLUMN fecha_registro TO created_at;
    END IF;

    -- 3. Agregar observaciones a devoluciones_qa si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='devoluciones_qa' AND column_name='observaciones'
    ) THEN
        ALTER TABLE devoluciones_qa ADD COLUMN observaciones TEXT DEFAULT '';
    END IF;

    -- 4. Agregar id_pedido_reposicion a devoluciones_qa si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='devoluciones_qa' AND column_name='id_pedido_reposicion'
    ) THEN
        ALTER TABLE devoluciones_qa ADD COLUMN id_pedido_reposicion INTEGER REFERENCES pedidos_ventas(id_pedido) ON DELETE SET NULL;
    END IF;

    -- 5. Renombrar monto_total_bs a total_pedido en pedidos_ventas
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='pedidos_ventas' AND column_name='monto_total_bs'
    ) THEN
        ALTER TABLE pedidos_ventas RENAME COLUMN monto_total_bs TO total_pedido;
    END IF;
END $$;

-- =====================================================================
-- 1. LIMPIEZA ORDENADA DE DATOS ANTERIORES (Para evitar duplicados)
-- =====================================================================
DELETE FROM pagos_clientes;
DELETE FROM devoluciones_qa;
DELETE FROM despachos_logisticos;
DELETE FROM factura;
DELETE FROM detalle_pedidos;
DELETE FROM pedidos_ventas;
DELETE FROM clientes;
DELETE FROM movimientos_kardex;
DELETE FROM fichas_calidad;
DELETE FROM lote_produccion;
DELETE FROM ordenes_produccion;
DELETE FROM receta_ingredientes;
DELETE FROM recetas_bom;
DELETE FROM control_temperaturas;
DELETE FROM recepciones_leche;
DELETE FROM zonas_almacen;
DELETE FROM pagos_proveedores;
DELETE FROM detalle_compras;
DELETE FROM compras_insumos;
DELETE FROM proveedores;
DELETE FROM catalogo_items;
DELETE FROM respaldos_documentales;
DELETE FROM config_alertas;

-- =====================================================================
-- 2. DATOS MAESTROS DE INVENTARIO Y CATÁLOGO (catalogo_items)
-- =====================================================================
INSERT INTO catalogo_items (codigo_sku, nombre_producto, tipo_item, categoria, unidad_medida, precio_referencia, vida_util_dias, stock_minimo) VALUES
('MP-LECHE-001', 'Leche Cruda Pasteurizada', 'MATERIA_PRIMA', 'Lácteos', 'L', 3.50, 3, 1000.00),
('MP-CUAJO-001', 'Cuajo Líquido Coagulante', 'MATERIA_PRIMA', 'Aditivos', 'L', 120.00, 365, 5.00),
('MP-SAL-001', 'Sal Industrial Refinada', 'MATERIA_PRIMA', 'Aditivos', 'KG', 1.80, 730, 50.00),
('MP-CLORURO-001', 'Cloruro de Calcio', 'MATERIA_PRIMA', 'Aditivos', 'KG', 15.00, 365, 10.00),
('EQ-BOLSA-MOZ2K', 'Bolsa Termoencogible Mozzarella 2kg', 'EMPAQUE', 'Empaques', 'UNID', 0.60, 1000, 200.00),
('EQ-ETIQ-MOZ', 'Etiqueta Adhesiva Mozzarella Grulac', 'EMPAQUE', 'Empaques', 'UNID', 0.15, 1000, 500.00),
('PT-MOZ-BARRA-2K', 'Queso Mozzarella Barra 2kg', 'PRODUCTO_TERMINADO', 'Quesos Especiales', 'KG', 45.00, 60, 100.00),
('PT-FRE-TRAD-1K', 'Queso Fresco Tradicional 1kg', 'PRODUCTO_TERMINADO', 'Quesos Frescos', 'KG', 28.00, 15, 50.00);

-- =====================================================================
-- 3. PROVEEDORES (proveedores)
-- =====================================================================
INSERT INTO proveedores (ci_nit, razon_social, tipo_proveedor, telefono, direccion, colonia_origen, lead_time_dias, estado_reputacion) VALUES
('102938475', 'Ganadería El Prado de Colonia Okinawa', 'GANADERO', '78541299', 'Carretera Norte Km 45, Okinawa', 'Okinawa', 1, 'Activo'),
('564738291', 'Insumos Lácteos Bolivia S.R.L.', 'INSUMOS', '33458922', 'Parque Industrial PI-24, Santa Cruz', NULL, 3, 'Activo'),
('887766554', 'Servipack S.R.L. Envases', 'INSUMOS', '22417788', 'Av. Blanco Galindo Km 5, Cochabamba', NULL, 5, 'Activo');

-- =====================================================================
-- 4. ORDENES DE COMPRA DE INSUMOS (compras_insumos & detalle_compras)
-- =====================================================================
-- Compra 1: Insumos Químicos
INSERT INTO compras_insumos (id_proveedor, id_usuario_recibe, numero_factura_compra, estado_compra, monto_total_bs, fecha_compra) VALUES
(
  (SELECT id_proveedor FROM proveedores WHERE ci_nit = '564738291'),
  (COALESCE((SELECT id_usuario FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol IN ('Recepcionista', 'Jefe Produccion') LIMIT 1), (SELECT id_usuario FROM usuarios LIMIT 1))),
  'FC-90881',
  'Recibida',
  1950.00,
  NOW() - INTERVAL '10 days'
);

INSERT INTO detalle_compras (id_compra, id_item, cantidad, precio_unitario, lote_proveedor, fecha_vencimiento) VALUES
(
  (SELECT id_compra FROM compras_insumos WHERE numero_factura_compra = 'FC-90881' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'MP-CUAJO-001'),
  10.00,
  120.00,
  'L-CUAJO-XYZ',
  CURRENT_DATE + 365
),
(
  (SELECT id_compra FROM compras_insumos WHERE numero_factura_compra = 'FC-90881' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'MP-CLORURO-001'),
  50.00,
  15.00,
  'L-CLOR-442',
  CURRENT_DATE + 365
);

-- Compra 2: Envases y Etiquetas
INSERT INTO compras_insumos (id_proveedor, id_usuario_recibe, numero_factura_compra, estado_compra, monto_total_bs, fecha_compra) VALUES
(
  (SELECT id_proveedor FROM proveedores WHERE ci_nit = '887766554'),
  (COALESCE((SELECT id_usuario FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol IN ('Recepcionista', 'Jefe Produccion') LIMIT 1), (SELECT id_usuario FROM usuarios LIMIT 1))),
  'FC-2234',
  'Recibida',
  450.00,
  NOW() - INTERVAL '8 days'
);

INSERT INTO detalle_compras (id_compra, id_item, cantidad, precio_unitario, lote_proveedor, fecha_vencimiento) VALUES
(
  (SELECT id_compra FROM compras_insumos WHERE numero_factura_compra = 'FC-2234' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'EQ-BOLSA-MOZ2K'),
  500.00,
  0.60,
  'L-BAG-992',
  CURRENT_DATE + 1000
),
(
  (SELECT id_compra FROM compras_insumos WHERE numero_factura_compra = 'FC-2234' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'EQ-ETIQ-MOZ'),
  1000.00,
  0.15,
  'L-LBL-887',
  CURRENT_DATE + 1000
);

-- =====================================================================
-- 5. PAGOS A PROVEEDORES (pagos_proveedores)
-- =====================================================================
INSERT INTO pagos_proveedores (id_proveedor, id_compra, id_usuario_registra, monto_pagado_bs, metodo_pago, referencia_comprobante, fecha_pago) VALUES
(
  (SELECT id_proveedor FROM proveedores WHERE ci_nit = '564738291'),
  (SELECT id_compra FROM compras_insumos WHERE numero_factura_compra = 'FC-90881' LIMIT 1),
  (COALESCE((SELECT id_usuario FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = 'Asesor Comercial' LIMIT 1), (SELECT id_usuario FROM usuarios LIMIT 1))),
  1950.00,
  'Transferencia',
  'TR-BANCO-776152',
  NOW() - INTERVAL '9 days'
);

-- =====================================================================
-- 6. ZONAS DE ALMACÉN Y CONTROL DE TEMPERATURAS (zonas_almacen, control_temperaturas)
-- =====================================================================
INSERT INTO zonas_almacen (nombre_zona, tipo_zona, temperatura_minima, temperatura_maxima, estado_activo) VALUES
('Silo Principal de Leche A', 'Silo_Leche', 2.00, 6.00, true),
('Tina de Coagulación 1', 'Tina_Produccion', 30.00, 38.00, true),
('Cámara de Frío de Maduración', 'Camara_Frio', 2.00, 8.00, true),
('Almacén Seco de Insumos', 'Almacen_Seco', 15.00, 25.00, true),
('Zona de Embarque y Carga', 'Zona_Despacho', NULL, NULL, true);

INSERT INTO control_temperaturas (id_usuario, id_zona, zona_monitoreada, temperatura_celsius, fecha_hora) VALUES
(
  (SELECT id_usuario FROM usuarios LIMIT 1),
  (SELECT id_zona FROM zonas_almacen WHERE nombre_zona = 'Silo Principal de Leche A'),
  'Silo Principal de Leche A',
  3.80,
  NOW() - INTERVAL '1 hour'
),
(
  (SELECT id_usuario FROM usuarios LIMIT 1),
  (SELECT id_zona FROM zonas_almacen WHERE nombre_zona = 'Cámara de Frío de Maduración'),
  'Cámara de Frío de Maduración',
  4.20,
  NOW() - INTERVAL '30 minutes'
);

-- =====================================================================
-- 7. RECEPCIÓN Y ACOPIO DE LECHE (recepciones_leche)
-- =====================================================================
-- Recepción 1: Aceptado Estándar
INSERT INTO recepciones_leche (id_proveedor, id_laboratorista, litros_recibidos, acidez_dornic, acidez_ph, temperatura_celsius, celulas_somaticas, antibioticos, porcentaje_grasa, densidad, porcentaje_agua, punto_congelamiento, estado_triage, observaciones, fecha_registro) VALUES
(
  (SELECT id_proveedor FROM proveedores WHERE ci_nit = '102938475'),
  (COALESCE((SELECT id_usuario FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = 'Control Calidad QA' LIMIT 1), (SELECT id_usuario FROM usuarios LIMIT 1))),
  5000.00,
  16.00,
  6.60,
  4.20,
  150000,
  false,
  3.40,
  1.030,
  0.00,
  -0.530,
  'Aceptado',
  'Leche fresca en excelente estado higiénico y térmico.',
  NOW() - INTERVAL '5 days'
);

-- Recepción 2: Aceptado con Observación (Presencia leve de agua añadida)
INSERT INTO recepciones_leche (id_proveedor, id_laboratorista, litros_recibidos, acidez_dornic, acidez_ph, temperatura_celsius, celulas_somaticas, antibioticos, porcentaje_grasa, densidad, porcentaje_agua, punto_congelamiento, estado_triage, observaciones, fecha_registro) VALUES
(
  (SELECT id_proveedor FROM proveedores WHERE ci_nit = '102938475'),
  (COALESCE((SELECT id_usuario FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = 'Control Calidad QA' LIMIT 1), (SELECT id_usuario FROM usuarios LIMIT 1))),
  2500.00,
  14.50,
  6.75,
  5.10,
  280000,
  false,
  2.80,
  1.026,
  8.50,
  -0.490,
  'Observado',
  'Densidad por debajo de norma. Se autoriza recepción condicionada con penalización de precio.',
  NOW() - INTERVAL '3 days'
);

-- Recepción 3: Rechazado (Presencia de Antibióticos)
INSERT INTO recepciones_leche (id_proveedor, id_laboratorista, litros_recibidos, acidez_dornic, acidez_ph, temperatura_celsius, celulas_somaticas, antibioticos, porcentaje_grasa, densidad, porcentaje_agua, punto_congelamiento, estado_triage, observaciones, fecha_registro) VALUES
(
  (SELECT id_proveedor FROM proveedores WHERE ci_nit = '102938475'),
  (COALESCE((SELECT id_usuario FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = 'Control Calidad QA' LIMIT 1), (SELECT id_usuario FROM usuarios LIMIT 1))),
  3000.00,
  17.00,
  6.55,
  4.80,
  350000,
  true,
  3.20,
  1.029,
  0.00,
  -0.525,
  'Rechazado_Antibioticos',
  'Fuerte reacción en prueba rápida de Beta-lactámicos. Descarga denegada.',
  NOW() - INTERVAL '1 day'
);

-- =====================================================================
-- 8. RECETAS BOM E INGREDIENTES (recetas_bom, receta_ingredientes)
-- =====================================================================
INSERT INTO recetas_bom (id_item_resultado, nombre_receta, version_receta, base_litros_leche, rendimiento_esperado_pct, estado_activa) VALUES
(
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'PT-MOZ-BARRA-2K'),
  'Queso Mozzarella Barra 2kg',
  1,
  1000.00,
  11.00,
  true
),
(
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'PT-FRE-TRAD-1K'),
  'Queso Fresco Tradicional 1kg',
  1,
  1000.00,
  13.50,
  true
);

-- Ingredientes para Mozzarella
INSERT INTO receta_ingredientes (id_receta, id_item_ingrediente, cantidad_por_base, unidad_medida, es_obligatorio, tolerancia_pct, observaciones) VALUES
(
  (SELECT id_receta FROM recetas_bom WHERE nombre_receta = 'Queso Mozzarella Barra 2kg' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'MP-LECHE-001'),
  1000.0000,
  'L',
  true,
  1.00,
  'Leche fluida entera'
),
(
  (SELECT id_receta FROM recetas_bom WHERE nombre_receta = 'Queso Mozzarella Barra 2kg' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'MP-CUAJO-001'),
  0.1500,
  'L',
  true,
  5.00,
  'Cuajo líquido'
),
(
  (SELECT id_receta FROM recetas_bom WHERE nombre_receta = 'Queso Mozzarella Barra 2kg' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'MP-SAL-001'),
  1.8000,
  'KG',
  true,
  5.00,
  'Sal refinada no yodada'
),
(
  (SELECT id_receta FROM recetas_bom WHERE nombre_receta = 'Queso Mozzarella Barra 2kg' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'MP-CLORURO-001'),
  0.2500,
  'KG',
  true,
  10.00,
  'Cloruro de calcio'
),
(
  (SELECT id_receta FROM recetas_bom WHERE nombre_receta = 'Queso Mozzarella Barra 2kg' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'EQ-BOLSA-MOZ2K'),
  55.0000,
  'UNID',
  true,
  0.00,
  'Bolsa protectora'
),
(
  (SELECT id_receta FROM recetas_bom WHERE nombre_receta = 'Queso Mozzarella Barra 2kg' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'EQ-ETIQ-MOZ'),
  55.0000,
  'UNID',
  true,
  0.00,
  'Etiqueta marca'
);

-- Ingredientes para Queso Fresco
INSERT INTO receta_ingredientes (id_receta, id_item_ingrediente, cantidad_por_base, unidad_medida, es_obligatorio, tolerancia_pct, observaciones) VALUES
(
  (SELECT id_receta FROM recetas_bom WHERE nombre_receta = 'Queso Fresco Tradicional 1kg' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'MP-LECHE-001'),
  1000.0000,
  'L',
  true,
  1.00,
  'Leche pasteurizada'
),
(
  (SELECT id_receta FROM recetas_bom WHERE nombre_receta = 'Queso Fresco Tradicional 1kg' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'MP-CUAJO-001'),
  0.1800,
  'L',
  true,
  5.00,
  'Cuajo líquido'
),
(
  (SELECT id_receta FROM recetas_bom WHERE nombre_receta = 'Queso Fresco Tradicional 1kg' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'MP-SAL-001'),
  2.2000,
  'KG',
  true,
  5.00,
  'Sal refinada'
),
(
  (SELECT id_receta FROM recetas_bom WHERE nombre_receta = 'Queso Fresco Tradicional 1kg' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'MP-CLORURO-001'),
  0.2000,
  'KG',
  true,
  10.00,
  'Cloruro de calcio'
);

-- =====================================================================
-- 9. ORDENES DE PRODUCCIÓN (ordenes_produccion)
-- =====================================================================
-- Orden 1: Mozzarella (Liberado_Comercial)
INSERT INTO ordenes_produccion (id_jefe_produccion, id_receta, litros_invertidos, kilos_obtenidos_brutos, rendimiento_real_pct, costo_operativo_bs, estado_lote, fecha_inicio, fecha_cierre, observaciones) VALUES
(
  (COALESCE((SELECT id_usuario FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = 'Jefe Produccion' LIMIT 1), (SELECT id_usuario FROM usuarios LIMIT 1))),
  (SELECT id_receta FROM recetas_bom WHERE nombre_receta = 'Queso Mozzarella Barra 2kg' LIMIT 1),
  3000.00,
  332.50,
  11.08,
  450.00,
  'Liberado_Comercial',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '4 days 22 hours',
  'Lote A - Producción limpia. Rendimiento superior al 11% esperado.'
);

-- Orden 2: Queso Fresco (Completado_Pendiente_QA)
INSERT INTO ordenes_produccion (id_jefe_produccion, id_receta, litros_invertidos, kilos_obtenidos_brutos, rendimiento_real_pct, costo_operativo_bs, estado_lote, fecha_inicio, fecha_cierre, observaciones) VALUES
(
  (COALESCE((SELECT id_usuario FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = 'Jefe Produccion' LIMIT 1), (SELECT id_usuario FROM usuarios LIMIT 1))),
  (SELECT id_receta FROM recetas_bom WHERE nombre_receta = 'Queso Fresco Tradicional 1kg' LIMIT 1),
  2000.00,
  260.00,
  13.00,
  320.00,
  'Completado_Pendiente_QA',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 days 23 hours',
  'Lote B - Temperatura en tina osciló entre 35 y 36 grados.'
);

-- Orden 3: Mozzarella (En_Proceso)
INSERT INTO ordenes_produccion (id_jefe_produccion, id_receta, litros_invertidos, kilos_obtenidos_brutos, rendimiento_real_pct, costo_operativo_bs, estado_lote, fecha_inicio, fecha_cierre, observaciones) VALUES
(
  (COALESCE((SELECT id_usuario FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = 'Jefe Produccion' LIMIT 1), (SELECT id_usuario FROM usuarios LIMIT 1))),
  (SELECT id_receta FROM recetas_bom WHERE nombre_receta = 'Queso Mozzarella Barra 2kg' LIMIT 1),
  4000.00,
  NULL,
  NULL,
  NULL,
  'En_Proceso',
  NOW() - INTERVAL '4 hours',
  NULL,
  'Lote C - En tinas de maduración y acidificación.'
);

-- =====================================================================
-- 10. LOTES FÍSICOS TERMINADOS (lote_produccion)
-- =====================================================================
-- Lote de Orden 1
INSERT INTO lote_produccion (id_orden, id_item, codigo_lote, cantidad_producida, unidad_medida, fecha_fabricacion, fecha_vencimiento, estado, observaciones) VALUES
(
  (SELECT id_orden FROM ordenes_produccion WHERE observaciones LIKE '%Lote A%' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'PT-MOZ-BARRA-2K'),
  'L-MOZ-260616-01',
  332.50,
  'KG',
  CURRENT_DATE - 5,
  CURRENT_DATE + 55,
  'Liberado_Comercial',
  'Lote A - Codificado y etiquetado.'
);

-- Lote de Orden 2
INSERT INTO lote_produccion (id_orden, id_item, codigo_lote, cantidad_producida, unidad_medida, fecha_fabricacion, fecha_vencimiento, estado, observaciones) VALUES
(
  (SELECT id_orden FROM ordenes_produccion WHERE observaciones LIKE '%Lote B%' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'PT-FRE-TRAD-1K'),
  'L-FRE-260618-02',
  260.00,
  'KG',
  CURRENT_DATE - 3,
  CURRENT_DATE + 12,
  'Pendiente_QA',
  'Lote B - Almacenado en cámara fría esperando liberación.'
);

-- =====================================================================
-- 11. FICHAS DE CONTROL DE CALIDAD (fichas_calidad)
-- =====================================================================
-- Ficha Lote 1 (Aprobado)
INSERT INTO fichas_calidad (id_orden, id_lote, id_ingeniero_qa, dictamen_qa, ph_final, salinidad, grados_brix, humedad_pct, temperatura_evaluacion, observaciones_tecnicas, fecha_evaluacion) VALUES
(
  (SELECT id_orden FROM ordenes_produccion WHERE observaciones LIKE '%Lote A%' LIMIT 1),
  (SELECT id_lote FROM lote_produccion WHERE codigo_lote = 'L-MOZ-260616-01' LIMIT 1),
  (COALESCE((SELECT id_usuario FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = 'Control Calidad QA' LIMIT 1), (SELECT id_usuario FROM usuarios LIMIT 1))),
  'Aprobado',
  5.25,
  1.50,
  NULL,
  44.50,
  4.50,
  'Humedad ideal para hilado. Firmeza y coloración correctas. Aprobado para venta.',
  NOW() - INTERVAL '4 days'
);

-- Ficha Lote 2 (Cuarentena)
INSERT INTO fichas_calidad (id_orden, id_lote, id_ingeniero_qa, dictamen_qa, ph_final, salinidad, grados_brix, humedad_pct, temperatura_evaluacion, observaciones_tecnicas, fecha_evaluacion) VALUES
(
  (SELECT id_orden FROM ordenes_produccion WHERE observaciones LIKE '%Lote B%' LIMIT 1),
  (SELECT id_lote FROM lote_produccion WHERE codigo_lote = 'L-FRE-260618-02' LIMIT 1),
  (COALESCE((SELECT id_usuario FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = 'Control Calidad QA' LIMIT 1), (SELECT id_usuario FROM usuarios LIMIT 1))),
  'Cuarentena',
  6.10,
  1.10,
  NULL,
  52.00,
  6.00,
  'pH elevado y retención excesiva de suero. En observación bacteriológica.',
  NOW() - INTERVAL '2 days'
);

-- =====================================================================
-- 12. MOVIMIENTOS KARDEX (movimientos_kardex)
-- =====================================================================
-- Ingreso Leche Cruda
INSERT INTO movimientos_kardex (id_item, id_usuario, tipo_operacion, cantidad_kilos, concepto_operacion, fecha_hora) VALUES
(
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'MP-LECHE-001'),
  (SELECT id_usuario FROM usuarios LIMIT 1),
  'IN',
  5000.00,
  'Ingreso Leche Cruda por Acopio Triage #1',
  NOW() - INTERVAL '5 days'
);

-- Ingreso de Cuajo y Cloruro
INSERT INTO movimientos_kardex (id_item, id_compra_origen, id_usuario, tipo_operacion, cantidad_kilos, concepto_operacion, fecha_hora) VALUES
(
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'MP-CUAJO-001'),
  (SELECT id_compra FROM compras_insumos WHERE numero_factura_compra = 'FC-90881' LIMIT 1),
  (SELECT id_usuario FROM usuarios LIMIT 1),
  'IN',
  10.00,
  'Ingreso Cuajo Líquido Factura FC-90881',
  NOW() - INTERVAL '10 days'
),
(
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'MP-CLORURO-001'),
  (SELECT id_compra FROM compras_insumos WHERE numero_factura_compra = 'FC-90881' LIMIT 1),
  (SELECT id_usuario FROM usuarios LIMIT 1),
  'IN',
  50.00,
  'Ingreso Cloruro Calcio Factura FC-90881',
  NOW() - INTERVAL '10 days'
);

-- Ingreso Bolsas y Etiquetas
INSERT INTO movimientos_kardex (id_item, id_compra_origen, id_usuario, tipo_operacion, cantidad_kilos, concepto_operacion, fecha_hora) VALUES
(
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'EQ-BOLSA-MOZ2K'),
  (SELECT id_compra FROM compras_insumos WHERE numero_factura_compra = 'FC-2234' LIMIT 1),
  (SELECT id_usuario FROM usuarios LIMIT 1),
  'IN',
  500.00,
  'Ingreso Bolsas 2kg Factura FC-2234',
  NOW() - INTERVAL '8 days'
),
(
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'EQ-ETIQ-MOZ'),
  (SELECT id_compra FROM compras_insumos WHERE numero_factura_compra = 'FC-2234' LIMIT 1),
  (SELECT id_usuario FROM usuarios LIMIT 1),
  'IN',
  1000.00,
  'Ingreso Etiquetas Factura FC-2234',
  NOW() - INTERVAL '8 days'
);

-- Consumo Materia Prima para Mozzarella Orden 1
INSERT INTO movimientos_kardex (id_item, id_orden_asociada, id_usuario, tipo_operacion, cantidad_kilos, concepto_operacion, fecha_hora) VALUES
(
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'MP-LECHE-001'),
  (SELECT id_orden FROM ordenes_produccion WHERE observaciones LIKE '%Lote A%' LIMIT 1),
  (SELECT id_usuario FROM usuarios LIMIT 1),
  'OUT',
  3000.00,
  'Consumo Leche Cruda Orden Prod #1',
  NOW() - INTERVAL '5 days'
),
(
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'MP-CUAJO-001'),
  (SELECT id_orden FROM ordenes_produccion WHERE observaciones LIKE '%Lote A%' LIMIT 1),
  (SELECT id_usuario FROM usuarios LIMIT 1),
  'OUT',
  0.45,
  'Consumo Cuajo Líquido Orden Prod #1',
  NOW() - INTERVAL '5 days'
),
(
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'MP-CLORURO-001'),
  (SELECT id_orden FROM ordenes_produccion WHERE observaciones LIKE '%Lote A%' LIMIT 1),
  (SELECT id_usuario FROM usuarios LIMIT 1),
  'OUT',
  0.75,
  'Consumo Cloruro Calcio Orden Prod #1',
  NOW() - INTERVAL '5 days'
),
(
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'EQ-BOLSA-MOZ2K'),
  (SELECT id_orden FROM ordenes_produccion WHERE observaciones LIKE '%Lote A%' LIMIT 1),
  (SELECT id_usuario FROM usuarios LIMIT 1),
  'OUT',
  166.00,
  'Consumo Bolsas 2kg Empaque Orden Prod #1',
  NOW() - INTERVAL '4 days 22 hours'
);

-- Ingreso Producto Terminado Aprobado
INSERT INTO movimientos_kardex (id_item, id_lote, id_orden_asociada, id_usuario, tipo_operacion, cantidad_kilos, concepto_operacion, fecha_hora) VALUES
(
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'PT-MOZ-BARRA-2K'),
  (SELECT id_lote FROM lote_produccion WHERE codigo_lote = 'L-MOZ-260616-01' LIMIT 1),
  (SELECT id_orden FROM ordenes_produccion WHERE observaciones LIKE '%Lote A%' LIMIT 1),
  (SELECT id_usuario FROM usuarios LIMIT 1),
  'IN',
  332.50,
  'Entrada de Mozzarella Barra Aprobada L-MOZ-260616-01',
  NOW() - INTERVAL '4 days 22 hours'
);

-- =====================================================================
-- 13. CLIENTES (clientes)
-- =====================================================================
INSERT INTO clientes (nit_facturacion, razon_social, tipo_cliente, telefono, email, direccion, ciudad) VALUES
('22334455', 'Supermercados Fidalga S.A.', 'B2B', '33524111', 'compras@fidalga.com', 'Av. Banzer y 3er Anillo, Santa Cruz', 'Santa Cruz'),
('66778899', 'Hipermaxi S.A.', 'B2B', '33425500', 'abastecimiento@hipermaxi.com', 'Av. Cristo Redentor y 4to Anillo, Santa Cruz', 'Santa Cruz'),
('12123434', 'Pizzería Bella Italia', 'B2C', '72145533', 'contacto@bellaitalia.com', 'Calle Sucre Nro 231, Santa Cruz', 'Santa Cruz');

-- =====================================================================
-- 14. PEDIDOS DE VENTAS Y DETALLES (pedidos_ventas, detalle_pedidos)
-- =====================================================================
-- Pedido 1: Hipermaxi S.A. (En Despacho)
INSERT INTO pedidos_ventas (id_cliente, id_vendedor, estado_reserva, total_pedido, fecha_reserva, fecha_entrega_programada, metodo_pago, observaciones) VALUES
(
  (SELECT id_cliente FROM clientes WHERE nit_facturacion = '66778899' LIMIT 1),
  (COALESCE((SELECT id_usuario FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = 'Asesor Comercial' LIMIT 1), (SELECT id_usuario FROM usuarios LIMIT 1))),
  'En_Despacho',
  6750.00,
  NOW() - INTERVAL '2 days',
  CURRENT_DATE + 1,
  'Transferencia',
  'Enviar por la mañana con camión refrigerado. Solicita factura.'
);

INSERT INTO detalle_pedidos (id_pedido, id_item, cantidad_pedida, precio_unitario) VALUES
(
  (SELECT id_pedido FROM pedidos_ventas WHERE estado_reserva = 'En_Despacho' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'PT-MOZ-BARRA-2K'),
  150.00,
  45.00
);

-- Pedido 2: Bella Italia (Entregado Completo)
INSERT INTO pedidos_ventas (id_cliente, id_vendedor, estado_reserva, total_pedido, fecha_reserva, fecha_entrega_programada, metodo_pago, observaciones) VALUES
(
  (SELECT id_cliente FROM clientes WHERE nit_facturacion = '12123434' LIMIT 1),
  (COALESCE((SELECT id_usuario FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = 'Asesor Comercial' LIMIT 1), (SELECT id_usuario FROM usuarios LIMIT 1))),
  'Entregado_Completo',
  2250.00,
  NOW() - INTERVAL '3 days',
  CURRENT_DATE - 1,
  'QR',
  'Pide entrega ágil. Factura emitida y pagada mediante pasarela.'
);

INSERT INTO detalle_pedidos (id_pedido, id_item, cantidad_pedida, precio_unitario) VALUES
(
  (SELECT id_pedido FROM pedidos_ventas WHERE estado_reserva = 'Entregado_Completo' LIMIT 1),
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'PT-MOZ-BARRA-2K'),
  50.00,
  45.00
);

-- =====================================================================
-- 15. EMISIÓN DE FACTURAS (factura)
-- =====================================================================
-- Factura Hipermaxi
INSERT INTO factura (id_pedido, numero_factura, subtotal, impuesto, total_factura, metodo_pago, estado, fecha_emision) VALUES
(
  (SELECT id_pedido FROM pedidos_ventas WHERE estado_reserva = 'En_Despacho' LIMIT 1),
  'FAC-2026-0001',
  5872.50,
  877.50,
  6750.00,
  'Transferencia',
  'Emitida',
  NOW() - INTERVAL '2 days'
);

-- Factura Bella Italia
INSERT INTO factura (id_pedido, numero_factura, subtotal, impuesto, total_factura, metodo_pago, estado, fecha_emision) VALUES
(
  (SELECT id_pedido FROM pedidos_ventas WHERE estado_reserva = 'Entregado_Completo' LIMIT 1),
  'FAC-2026-0002',
  1957.50,
  292.50,
  2250.00,
  'QR',
  'Pagado',
  NOW() - INTERVAL '3 days'
);

-- =====================================================================
-- 16. DETALLES DE PAGO CLIENTES (pagos_clientes - CU28 PayPal Sandbox)
-- =====================================================================
INSERT INTO pagos_clientes (id_factura, monto_total, moneda, estado, paypal_order_id, paypal_capture_id, created_at, updated_at) VALUES
(
  (SELECT id_factura FROM factura WHERE numero_factura = 'FAC-2026-0002' LIMIT 1),
  2250.00,
  'USD',
  'Completado',
  'PAYPAL-ORD-554433221',
  'PAYPAL-CAP-998877665',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

-- =====================================================================
-- 17. DESPACHOS LOGÍSTICOS FEFO (despachos_logisticos - CU29)
-- =====================================================================
-- Despacho 1 (Bella Italia - Entregado)
INSERT INTO despachos_logisticos (id_pedido, id_encargado, placa_camion, nombre_chofer, temperatura_salida, fecha_despacho, observaciones) VALUES
(
  (SELECT id_pedido FROM pedidos_ventas WHERE estado_reserva = 'Entregado_Completo' LIMIT 1),
  (COALESCE((SELECT id_usuario FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = 'Almacenero' LIMIT 1), (SELECT id_usuario FROM usuarios LIMIT 1))),
  '2938-LKB',
  'Mario Gomez Sandoval',
  4.80,
  NOW() - INTERVAL '3 days',
  'Entregado en puerta. Cadena de frío controlada.'
);

-- Despacho 2 (Hipermaxi - En tránsito)
INSERT INTO despachos_logisticos (id_pedido, id_encargado, placa_camion, nombre_chofer, temperatura_salida, fecha_despacho, observaciones) VALUES
(
  (SELECT id_pedido FROM pedidos_ventas WHERE estado_reserva = 'En_Despacho' LIMIT 1),
  (COALESCE((SELECT id_usuario FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = 'Almacenero' LIMIT 1), (SELECT id_usuario FROM usuarios LIMIT 1))),
  '3844-XZY',
  'Carlos Miranda Flores',
  5.20,
  NOW() - INTERVAL '1 day',
  'Enviado en camión isotérmico Nro 3.'
);

-- Consumo de inventario real (Kardex OUT) por el despacho finalizado
INSERT INTO movimientos_kardex (id_item, id_lote, id_usuario, tipo_operacion, cantidad_kilos, concepto_operacion, fecha_hora) VALUES
(
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'PT-MOZ-BARRA-2K'),
  (SELECT id_lote FROM lote_produccion WHERE codigo_lote = 'L-MOZ-260616-01' LIMIT 1),
  (SELECT id_usuario FROM usuarios LIMIT 1),
  'OUT',
  50.00,
  'Despacho físico Pedido #2 (Bella Italia)',
  NOW() - INTERVAL '3 days'
);

-- =====================================================================
-- 18. DEVOLUCIONES QA / LOGÍSTICA INVERSA (devoluciones_qa - CU30)
-- =====================================================================
INSERT INTO devoluciones_qa (id_despacho, id_lote, id_asesor, motivo_rechazo, kilos_devueltos, requiere_reposicion, estado_devolucion, created_at, observaciones, id_pedido_reposicion) VALUES
(
  (SELECT id_despacho FROM despachos_logisticos WHERE placa_camion = '2938-LKB' LIMIT 1),
  (SELECT id_lote FROM lote_produccion WHERE codigo_lote = 'L-MOZ-260616-01' LIMIT 1),
  (COALESCE((SELECT id_usuario FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre_rol = 'Asesor Comercial' LIMIT 1), (SELECT id_usuario FROM usuarios LIMIT 1))),
  'Bolsa rota durante estiba del camión. Pérdida total del sellado al vacío.',
  5.00,
  true,
  'Procesada',
  NOW() - INTERVAL '2 days',
  'Devolución registrada en el almacén de destino.',
  NULL
);

-- Retorno físico al Kardex como ajuste para reprocesar o merma (OUT definitivo)
INSERT INTO movimientos_kardex (id_item, id_lote, id_usuario, tipo_operacion, cantidad_kilos, concepto_operacion, fecha_hora) VALUES
(
  (SELECT id_item FROM catalogo_items WHERE codigo_sku = 'PT-MOZ-BARRA-2K'),
  (SELECT id_lote FROM lote_produccion WHERE codigo_lote = 'L-MOZ-260616-01' LIMIT 1),
  (SELECT id_usuario FROM usuarios LIMIT 1),
  'AJUSTE',
  -5.00,
  'Devolución de mercancía dañada en ruta - Pedido #2',
  NOW() - INTERVAL '2 days'
);

-- =====================================================================
-- 19. RESPALDOS DOCUMENTALES EN STORAGE (respaldos_documentales - CU07)
-- =====================================================================
INSERT INTO respaldos_documentales (entidad_afectada, id_entidad, url_publica_storage, descripcion_archivo, tipo_archivo, tamanio_bytes, id_usuario_subida, fecha_subida) VALUES
(
  'FichasCalidad',
  (SELECT id_ficha FROM fichas_calidad WHERE dictamen_qa = 'Aprobado' LIMIT 1),
  'https://supabase.co/storage/v1/object/public/respaldos/fichas/ficha_lote_moz_01.pdf',
  'Ficha firmada digitalmente de liberación de lote L-MOZ-260616-01',
  'PDF',
  102450,
  (SELECT id_usuario FROM usuarios LIMIT 1),
  NOW() - INTERVAL '4 days'
),
(
  'FichasCalidad',
  (SELECT id_ficha FROM fichas_calidad WHERE dictamen_qa = 'Cuarentena' LIMIT 1),
  'https://supabase.co/storage/v1/object/public/respaldos/fichas/ficha_lote_fre_02.pdf',
  'Certificado observador de lote en cuarentena L-FRE-260618-02',
  'PDF',
  98740,
  (SELECT id_usuario FROM usuarios LIMIT 1),
  NOW() - INTERVAL '2 days'
);

-- =====================================================================
-- 20. CONFIGURACIÓN DE ALERTAS (config_alertas - CU11)
-- =====================================================================
INSERT INTO config_alertas (nombre_alerta, tipo_evento, umbral_valor, umbral_dias, emails_destino, prioridad, activa, cron_expresion) VALUES
('Stock Mínimo Leche Cruda', 'STOCK_MINIMO', 1000.00, NULL, 'jefe.produccion@grulac.com,almacen@grulac.com', 'Alta', true, '*/30 * * * *'),
('Lotes por Vencer - Alerta 10 días', 'LOTE_PROXIMO_VENCER', NULL, 10, 'calidad@grulac.com,comercial@grulac.com', 'Media', true, '0 8 * * *'),
('Alerta Cuarentena Activa', 'CUARENTENA_ACTIVA', NULL, NULL, 'jefe.produccion@grulac.com,calidad@grulac.com', 'Alta', true, '0 9 * * *'),
('Temperatura Crítica en Silo Leche', 'TEMPERATURA_FUERA_RANGO', 6.00, NULL, 'jefe.produccion@grulac.com,almacen@grulac.com', 'Alta', true, '*/15 * * * *');
