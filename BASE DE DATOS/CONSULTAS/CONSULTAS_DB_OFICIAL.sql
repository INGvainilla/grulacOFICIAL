--Consulta 1: ¿Cuáles son todos los proveedores que se encuentran en estado 'Aprobado'?
SELECT ci_nit, razon_social, estado_reputacion
FROM proveedores
WHERE estado_reputacion = 'Aprobado';

--Consulta 2: ¿Qué empleados tienen un documento de identidad (CI) que comienza con '4' o '9'?
SELECT id_empleado, nombre_completo, ci_documento
FROM empleados
WHERE ci_documento LIKE '4%' OR ci_documento LIKE '9%';

--Consulta 3: ¿Cuáles son las recetas activas que tienen un rendimiento estandarizado mayor al 10%?
SELECT id_receta, version_receta, rendimiento_esperado_pct
FROM recetas_bom
WHERE rendimiento_esperado_pct > 10.00 AND estado_activa = TRUE;

--Consulta 4: ¿Cuáles fueron las recepciones de leche cruda (Triage) cuya acidez (pH) excedió el nivel de 6.6?
SELECT id_recepcion, litros_recibidos, acidez_ph
FROM recepciones_leche
WHERE acidez_ph > 6.6;

--Consulta 5: ¿Qué insumos del inventario de catálogo no pertenecen a la categoría de PRODUCTO_TERMINADO ni INTERMEDIO?
SELECT codigo_sku, nombre_producto, stock_minimo
FROM catalogo_items
WHERE tipo_item IN ('MATERIA_PRIMA', 'INSUMO');

--Consulta 6: ¿Qué recepciones (triage químico) fueron efectuadas operativamente durante los últimos 7 días?
SELECT id_recepcion, fecha_registro, litros_recibidos
FROM recepciones_leche
WHERE fecha_registro >= CURRENT_DATE - INTERVAL '7 days';

--Consulta 7: ¿Cuáles son las facturas que fueron pagadas y emitidas durante el año fiscal 2026?
SELECT numero_factura, metodo_pago, total_factura, fecha_emision
FROM factura
WHERE EXTRACT(YEAR FROM fecha_emision) = 2026 AND estado = 'Pagado';

--Consulta 8: ¿Qué supermercado o cliente comercial incluye la palabra 'Maxi' dentro de su razón social?
SELECT nit_facturacion, razon_social, telefono
FROM clientes
WHERE razon_social ILIKE '%Maxi%';

--Consulta 9: ¿Cuáles son los reportes de despacho logístico donde la placa del camión térmico termina con 'AAA'?
SELECT id_despacho, placa_camion, fecha_salida_ruta
FROM despachos_logisticos
WHERE placa_camion LIKE '%AAA';

--Consulta 10: ¿Qué lotes terminados fueron generados y producidos exactamente en la fecha '2026-04-06'?
SELECT codigo_lote, cantidad_producida, estado
FROM lote_produccion
WHERE fecha_produccion = '2026-04-06';

--Consulta 11: ¿Cuál es el Nombre del Empleado cruzado con el tipo de Rol Informático que se le ha asignado?
SELECT e.nombre_completo, r.nombre_rol, u.email_corporativo
FROM usuarios u
INNER JOIN empleados e ON u.id_empleado = e.id_empleado
INNER JOIN roles r ON u.id_rol = r.id_rol;

--Consulta 12: (Trazabilidad B2B): ¿Qué cliente está atado a cada pedido y cuál fue el ejecutivo vendedor encargado de la transacción?
SELECT pv.id_pedido, c.razon_social AS Cliente, e.nombre_completo AS Asesor, pv.estado_reserva
FROM pedidos_ventas pv
INNER JOIN clientes c ON pv.id_cliente = c.id_cliente
INNER JOIN usuarios u ON pv.id_vendedor = u.id_usuario
INNER JOIN empleados e ON u.id_empleado = e.id_empleado;

--Consulta 13: ¿Qué ítems o SKU exigió exactamente el cliente dentro del cuerpo detallado de su pedido?
SELECT dp.id_pedido, c.codigo_sku, c.nombre_producto, dp.cantidad_pedida, dp.precio_unitario
FROM detalle_pedidos dp
INNER JOIN catalogo_items c ON dp.id_item = c.id_item;

--Consulta 14: ¿Cuál es el reporte contable final uniendo la Tabla Factura con sus respectivos Pedidos y Clientes?
SELECT f.numero_factura, cli.nit_facturacion, cli.razon_social, f.total_factura, f.estado
FROM factura f
INNER JOIN pedidos_ventas pv ON f.id_pedido = pv.id_pedido
INNER JOIN clientes cli ON pv.id_cliente = cli.id_cliente;

--Consulta 15: (Trazabilidad de Planta): ¿Qué laboratorista o ingeniero fue el encargado de recibir la leche cruda de cada proveedor agropecuario?
SELECT rl.fecha_registro, p.razon_social AS ProveedorGanadero, rl.litros_recibidos, emp.nombre_completo AS Ing_Triage
FROM recepciones_leche rl
INNER JOIN proveedores p ON rl.id_proveedor = p.id_proveedor
INNER JOIN usuarios u ON rl.id_laboratorista = u.id_usuario
INNER JOIN empleados emp ON u.id_empleado = emp.id_empleado;

--Consulta 16: ¿A cuánto asciende el número total de cuentas de usuario agrupadas por su estado actual de acceso al sistema?
SELECT estado_acceso, COUNT(id_usuario) AS Total_Cuentas
FROM usuarios
GROUP BY estado_acceso;

--Consulta 17: ¿Cuál es el monto de inyección de dinero en Ventas separando su estatus operativo entre reservas liquidadas y pendientes?

SELECT estado_reserva, SUM(monto_total_bs) AS Monto_Generado_BS
FROM pedidos_ventas
GROUP BY estado_reserva;


--Consulta 18: (Consolidado Acopiador): ¿Cuántos litros de leche cruda nos ha entregado cada proveedor en total a lo largo del tiempo?

SELECT p.razon_social, SUM(rl.litros_recibidos) AS Total_Litros_Acopiados
FROM recepciones_leche rl
INNER JOIN proveedores p ON rl.id_proveedor = p.id_proveedor
GROUP BY p.razon_social;


Consulta 19: ¿Cuál es el total general de movimientos volumétricos en el KARDEX separando las Entradas (IN) de las Salidas logísticas (OUT)?

SELECT tipo_operacion, SUM(cantidad_kilos) AS Total_Kg_Movidos, COUNT(*) AS Numero_Registros
FROM movimientos_kardex
GROUP BY tipo_operacion;


--Consulta 20: ¿A cuánto asciende el ingreso total y los impuestos retenidos de las Facturas clasificadas según su método y forma de pago?

SELECT metodo_pago, SUM(total_factura) AS Flujo_Caja, SUM(impuesto) AS Impuestos_Deducciones
FROM factura
GROUP BY metodo_pago;


--Consulta 21: ¿Quiénes son nuestros Proveedores Estrella agropecuarios que nos han vendido más de 3000 Litros de Leche cruda en el historial?

SELECT p.razon_social, SUM(rl.litros_recibidos) AS Total_Leche
FROM recepciones_leche rl
INNER JOIN proveedores p ON rl.id_proveedor = p.id_proveedor
GROUP BY p.razon_social
HAVING SUM(rl.litros_recibidos) > 3000.00;


Consulta 22: ¿Qué órdenes de producción en las tinas de cuajada demandaron y requirieron una inversión de leche superior a los 1000 litros métricos?

SELECT id_orden, SUM(litros_invertidos) AS Litros_Superiores
FROM ordenes_produccion
GROUP BY id_orden
HAVING SUM(litros_invertidos) >= 1000;


--Consulta 23: ¿Cuáles Ítems del catálogo (Insumos) cuentan con SALIDAS (OUT) sumadas que rebasen los 50 kilos en su desgaste industrial o comercial?

SELECT ci.nombre_producto, SUM(mk.cantidad_kilos) as Total_Desgaste_Kg
FROM movimientos_kardex mk
INNER JOIN catalogo_items ci ON mk.id_item = ci.id_item
WHERE mk.tipo_operacion = 'OUT'
GROUP BY ci.nombre_producto
HAVING SUM(mk.cantidad_kilos) > 50;


--Consulta 24: (Clientes Leales): ¿Qué cuentas empresariales realizaron al menos un (1) pedido que de forma individual haya superado los 3000 Bs?

SELECT c.razon_social, COUNT(p.id_pedido) AS Pedidos_Grandes
FROM clientes c
INNER JOIN pedidos_ventas p ON c.id_cliente = p.id_cliente
WHERE p.monto_total_bs > 3000.00
GROUP BY c.razon_social
HAVING COUNT(p.id_pedido) >= 1;


--Consulta 25: ¿Qué recetas y formulaciones BOM de producción estandarizadas exigen de forma activa más de tres (3) sustancias o ingredientes diferentes?

SELECT id_receta, COUNT(id_item_ingrediente) AS Sustancias_Formuladas
FROM receta_ingredientes
GROUP BY id_receta
HAVING COUNT(id_item_ingrediente) > 3;


--Consulta 26: ¿Cuál de todas las órdenes de producción experimentó el máximo consumo de materia prima basándose lógicamente en su mayor inversión?

SELECT id_orden, kilos_obtenidos_brutos, litros_invertidos
FROM ordenes_produccion
WHERE litros_invertidos = (SELECT MAX(litros_invertidos) FROM ordenes_produccion);

--Consulta 27: ¿Qué Empleados de planta NUNCA han generado un apunte o acción dentro de la tabla Bitácora de Auditoría del sistema transaccional (Subconsulta lógica inversa NOT IN)?
SELECT id_empleado, nombre_completo
FROM empleados
WHERE id_empleado NOT IN (
SELECT u.id_empleado FROM usuarios u
INNER JOIN bitacora_auditoria b ON u.id_usuario = b.id_usuario
);

--Consulta 28: (Subquery Sanitaria Láctea): ¿Qué Proveedor despachó la cisterna de leche reportando las temperaturas más elevadas o críticas detectadas durante el Triage?
SELECT p.ci_nit, p.razon_social
FROM proveedores p
WHERE p.id_proveedor = (SELECT id_proveedor FROM recepciones_leche WHERE temperatura_celsius = (SELECT MAX(temperatura_celsius) FROM recepciones_leche) LIMIT 1);

--Consulta 29: (Trazabilidad hacia Atrás): ¿Qué Lotes Físicos Empacados derivan rastreablemente de una receta o fórmula industrial que lleve la palabra 'Mozzarella'?
SELECT l.codigo_lote, l.fecha_produccion, l.observaciones
FROM lote_produccion l
WHERE l.id_orden IN (SELECT o.id_orden FROM ordenes_produccion o
INNER JOIN recetas_bom rb ON o.id_receta = rb.id_receta
INNER JOIN catalogo_items ci ON rb.id_item_resultado = ci.id_item
WHERE ci.nombre_producto ILIKE '%Mozzarella%'
);

--Consulta 30: ¿Cuál es el cálculo neto del Stock Final o Saldo Transaccional en las Bodegas (Entradas IN sumadas, frente a las Salidas OUT restadas) de cada código SKU?
SELECT ci.codigo_sku, ci.nombre_producto,
COALESCE((SELECT SUM(cantidad_kilos) FROM movimientos_kardex WHERE id_item = ci.id_item AND tipo_operacion = 'IN'), 0) AS kilos_entrados,
COALESCE((SELECT SUM(cantidad_kilos) FROM movimientos_kardex WHERE id_item = ci.id_item AND tipo_operacion = 'OUT'), 0) AS kilos_despachados,
(COALESCE((SELECT SUM(cantidad_kilos) FROM movimientos_kardex WHERE id_item = ci.id_item AND tipo_operacion = 'IN'), 0) - COALESCE((SELECT SUM(cantidad_kilos) FROM movimientos_kardex WHERE id_item = ci.id_item AND tipo_operacion = 'OUT'), 0)) AS STOCK_FINAL
FROM catalogo_items ci;