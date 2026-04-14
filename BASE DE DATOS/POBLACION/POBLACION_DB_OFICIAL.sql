-- 1. MAESTROS GLOBALES (Roles, Empleados, Proveedores, Clientes, Catálogo)
INSERT INTO roles (nombre_rol, permisos_json) VALUES
('Control Calidad QA', '{"modulos":["fichas_calidad", "recepcion", "hilado"]}'),
('Jefe Produccion', '{"modulos":["ordenes_produccion", "cuajada", "kardex"]}'),
('Administrador', '{"modulos":["ALL"]}');

INSERT INTO empleados (ci_documento, nombre_completo, cargo, telefono) VALUES
('4532168', 'Ing. Rodrigo Salinas (Laboratorista)', '78901234'),
('9821345', 'Lic. Carmen Telles (QA Hilado)', '71023456'),
('2349081', 'Roberto Suarez (Jefe de Tinas)', '76543210');

INSERT INTO proveedores (ci_nit, razon_social, tipo_proveedor, estado_reputacion) VALUES
('11092837', 'Granja Lechera La Vía Láctea', 'Aprobado'),
('55908210', 'Acopiadora San Pedro del Norte', 'Aprobado'),
('88992211', 'Química Industrial BOLIVIA', 'Aprobado');

INSERT INTO clientes (nit_facturacion, razon_social, telefono) VALUES
('449012301', 'Supermercado Hipermaxi S.A.', '33445566'),
('112233400', 'Agencia Quesera El Buen Gusto', '33669988');

INSERT INTO catalogo_items (codigo_sku, nombre_producto, tipo_item, unidad_medida, stock_minimo) VALUES
('RM-LCH-001', 'Leche Cruda Fresca', 'MATERIA_PRIMA', 'Litros', 1000.00),
('IN-CUAJ-01', 'Cuajo Líquido Industrial', 'INSUMO', 'Litros', 5.00),
('IN-SAL-001', 'Sal Fina Yodada', 'INSUMO', 'Kilogramos', 20.00),
('IN-FERM-01', 'Fermento Láctico Termófilo', 'INSUMO', 'Unidades', 10.00),
('PT-MOZ-001', 'Queso Mozzarella (Barra 1Kg)', 'PRODUCTO', 'Kilogramos', 100.00),
('INT-CUA-01', 'Masa Cuajada Fermentada', 'PRODUCTO', 'Kilogramos', 0.00);

-- 2. USUARIOS Y AUDITORÍA
INSERT INTO usuarios (id_rol, id_empleado, email_corporativo, password_hash, estado_acceso) VALUES
(1, 1, 'rsalinas_lab@grulac.com', '$2a$12$SecureHashLab...', TRUE),
(1, 2, 'ctelles_qa@grulac.com', '$2a$12$SecureHashQA...', TRUE),
(2, 3, 'rsuarez_prod@grulac.com', '$2a$12$SecureHashProd...', TRUE);

INSERT INTO bitacora_auditoria (id_usuario, accion_sql, tabla_afectada, fecha_hora) VALUES
(3, 'INSERT', 'catalogo_items', '2026-04-06 05:00:00');

-- FLUJOS DE LOS 25 CASOS DE USO NUEVOS

-- 3A. RECEPCIÓN DE LA LECHE Y QA
INSERT INTO recepciones_leche (id_proveedor, id_laboratorista, litros_recibidos, temperatura_celsius, acidez_ph, estado_triage, fecha_registro) VALUES
(1, 1, 3500.00, 3.8, 6.70, 'Aceptado', '2026-04-06 05:30:00'),
(2, 1, 2100.00, 4.1, 6.65, 'Aceptado', '2026-04-06 06:15:00');

INSERT INTO movimientos_kardex (id_item, id_orden_asociada, id_usuario, tipo_operacion, cantidad_kilos, concepto_operacion) VALUES
(1, NULL, 1, 'IN', 3500.00, 'Triage Inicial - Cisterna Via Lactea'),
(1, NULL, 1, 'IN', 2100.00, 'Triage Inicial - Cisterna San Pedro');

-- 3B. COMPRA DE INSUMOS SECUNDARIOS (CU08) Y PAGO (CU25)
INSERT INTO compras_insumos (id_proveedor, id_usuario_recibe, monto_total_bs, fecha_compra) VALUES
(3, 3, 2500.00, '2026-04-01 10:00:00');

INSERT INTO detalle_compras (id_compra, id_item, cantidad, precio_unitario) VALUES
(1, 2, 10.00, 80.00), -- 10Lts Cuajo a 80Bs
(1, 3, 100.00, 17.00); -- 100Kg Sal a 17Bs

INSERT INTO pagos_proveedores (id_proveedor, id_usuario_registra, monto_pagado_bs, fecha_pago) VALUES
(3, 3, 2500.00, '2026-04-01 11:00:00');

-- 3C. CONTROL DE TEMPERATURAS (CU22)
INSERT INTO control_temperaturas (id_usuario, zona_monitoreada, temperatura_celsius, fecha_hora) VALUES
(1, 'Cuarto Frío A - Maduración', 4.2, '2026-04-06 10:00:00'),
(2, 'Tina de Pasteurización B', 72.0, '2026-04-06 11:30:00');

-- 4. FORMULACIÓN BOM PARA MOZZARELLA
INSERT INTO recetas_bom (id_item_resultado, nombre_receta, version_receta, rendimiento_esperado_pct, estado_activa) VALUES
(5, \'Mozzarella Barra 1Kg\', 1, 11.50, TRUE);

INSERT INTO receta_ingredientes (id_receta, id_item_ingrediente, cantidad_kgs_necesaria) VALUES
(1, 1, 1000.00), -- 1000 Litros Leche
(1, 2, 0.045), -- 45 ml de Cuajo
(1, 3, 14.500), -- 14.5 Kg de Sal
(1, 4, 3.000); -- 3 Unidades Fermento

-- 5. ELABORACIÓN Y PRODUCCIÓN
INSERT INTO ordenes_produccion (id_jefe_produccion, id_receta, costo_operativo_bs, litros_invertidos, kilos_obtenidos_brutos, estado_orden, fecha_inicio, fecha_cierre) VALUES
(3, 1, 450.00, 1500.00, 172.50, 'Completado', '2026-04-06 08:00:00', '2026-04-06 14:00:00');

INSERT INTO lote_produccion (id_orden, id_item, codigo_lote, cantidad_producida, unidad_medida, estado, observaciones) VALUES
(1, 5, 'LOTE-MOZ-060426-A', 172.50, 'Kilogramos', 'Liberado_Comercial', 'Procedimiento térmico correcto. Excelente textura.');

INSERT INTO movimientos_kardex (id_item, id_orden_asociada, id_usuario, tipo_operacion, cantidad_kilos, concepto_operacion) VALUES
(1, 1, 3, 'OUT', 1500.00, 'Consumo en Tina para LOTE-MOZ-060426-A'),
(5, 1, 3, 'IN', 172.50, 'Ingreso Almacén Final Queso Mozzarella');

-- 6. CONTROL HILADO / QA FICHAS
INSERT INTO fichas_calidad (id_orden, id_ingeniero_qa, dictamen_qa, ph_final, salinidad, observaciones_tecnicas, fecha_evaluacion) VALUES
(1, 2, 'Aprobado', 5.15, 1.85, 'Prueba de hilado a 75°C superada. Formación de piel brillante.', '2026-04-06 14:15:00');

-- Respaldos Nube (CU18)
INSERT INTO respaldos_documentales (entidad_afectada, id_entidad, url_publica_storage, descripcion_archivo) VALUES
('fichas_calidad', 1, 'https://supabase.grulac/storage/v1/pdf/acta_qa_lote1.pdf', 'Ficha QA firmada digitalmente');

-- 7. VENTAS Y LOGÍSTICA

INSERT INTO pedidos_ventas (id_cliente, id_vendedor, estado_reserva, monto_total_bs) VALUES
(1, 3, 'Aprobado Despacho', 3850.00);

INSERT INTO detalle_pedidos (id_pedido, id_item, cantidad_pedida, precio_unitario) VALUES
(1, 5, 50.00, 77.00);

INSERT INTO factura (id_pedido, numero_factura, subtotal, impuesto, total_factura, metodo_pago, estado) VALUES
(1, 'F-00101-26', 3349.50, 500.50, 3850.00, 'Transferencia', 'Pagado');

INSERT INTO despachos_logisticos (id_pedido, id_encargado, placa_camion, fecha_salida_ruta) VALUES
(1, 3, '3322-AAA', '2026-04-06 16:30:00');

-- Merma Comercial en Transporte (CU16)
INSERT INTO devoluciones_qa (id_despacho, id_asesor, motivo_rechazo, kilos_devueltos, requiere_reposicion_caliente) VALUES
(1, 3, '1 Barra de mozzarella perdió el vacío por aplastamiento en camión.', 1.00, TRUE);

