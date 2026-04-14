# Mapa de Relaciones — Base de Datos ERP GRULAC S.R.L.

> **Documento de referencia para StarUML (Diagrama de Clases / ER)**
> 26 Tablas · 30 Relaciones FK · 15 Módulos · 25 Casos de Uso
> Versión: 2.0 — Abril 2026

---

## Inventario Completo de Tablas (26)

| # | Tabla | Bloque | Módulo | CU que cubre |
|---|-------|--------|--------|-------------|
| 1 | `roles` | A - Seguridad | M01 | CU01 |
| 2 | `empleados` | A - Seguridad | M14 | CU02 |
| 3 | `usuarios` | A - Seguridad | M01 | CU03, CU04 |
| 4 | `bitacora_auditoria` | A - Seguridad | M14 | CU05 |
| 5 | `catalogo_items` | B - Datos Maestros | M04 | CU06 |
| 6 | `proveedores` | B - Datos Maestros | M02 | CU06 |
| 7 | `compras_insumos` | B - Datos Maestros | M05 | CU08 |
| 8 | `detalle_compras` | B - Datos Maestros | M05 | CU08 |
| 9 | `pagos_proveedores` | B - Datos Maestros | M05 | CU25 |
| 10 | `zonas_almacen` | C - Recepción | M03 | CU22 |
| 11 | `control_temperaturas` | C - Recepción | M03 | CU22 |
| 12 | `recepciones_leche` | C - Recepción | M03 | CU10 |
| 13 | `movimientos_kardex` | D - Inventario | M04/M08 | CU07, CU13 |
| 14 | `recetas_bom` | E - Producción | M06 | CU09 |
| 15 | `receta_ingredientes` | E - Producción | M06 | CU09 |
| 16 | `ordenes_produccion` | E - Producción | M06 | CU11 |
| 17 | `lote_produccion` | E - Producción | M07 | CU11, CU23, CU24 |
| 18 | `fichas_calidad` | E - Producción | M07 | CU12 |
| 19 | `clientes` | F - Comercial | M09 | CU06 |
| 20 | `pedidos_ventas` | F - Comercial | M09 | CU14 |
| 21 | `detalle_pedidos` | F - Comercial | M09 | CU14 |
| 22 | `factura` | F - Comercial | M10 | CU20 |
| 23 | `despachos_logisticos` | F - Comercial | M11 | CU15 |
| 24 | `devoluciones_qa` | F - Comercial | M11 | CU16, CU21 |
| 25 | `respaldos_documentales` | G - Soporte | M13 | CU18 |
| 26 | `config_alertas` | G - Soporte | M15 | CU19 |

---

## Diagrama ER Textual Completo (para StarUML)

```
                    ┌──────────────────┐
                    │      roles       │
                    │──────────────────│
                    │ PK id_rol        │
                    │    nombre_rol    │
                    │    permisos_json │
                    └────────┬─────────┘
                             │ 1
                             │
                             │ *
                    ┌────────┴─────────┐
  ┌─────────────┐   │     usuarios     │
  │  empleados  │   │──────────────────│
  │─────────────│   │ PK id_usuario    │
  │ PK id_empl. │──*│ FK id_rol        │
  │    ci_doc   │ 1 │ FK id_empleado   │
  │    nombre   │   │    email_corp    │
  └─────────────┘   └──┬──┬──┬──┬──┬──┘
                       │  │  │  │  │
          ┌────────────┘  │  │  │  └─────────────────────┐
          │               │  │  │                        │
          ▼ *             │  │  │                        ▼ *
 ┌────────────────┐       │  │  │               ┌────────────────┐
 │   bitacora_    │       │  │  │               │  control_      │
 │   auditoria   │       │  │  │               │  temperaturas  │
 │────────────────│       │  │  │               │────────────────│
 │ PK id_log     │       │  │  │               │ PK id_registro │
 │ FK id_usuario │       │  │  │               │ FK id_usuario  │
 │    accion_sql │       │  │  │               │ FK id_zona     │
 │    old/new    │       │  │  │               └────────┬───────┘
 └────────────────┘       │  │  │                       │ *
                          │  │  │                       │
                          │  │  │                ┌──────┴───────┐
                          │  │  │                │zonas_almacen │
                          │  │  │                │──────────────│
                          │  │  │                │ PK id_zona   │
                          │  │  │                │   nombre     │
                          │  │  │                │   tipo_zona  │
                          │  │  │                └──────────────┘
                          │  │  │
     ┌────────────────────┘  │  └───────────────────┐
     ▼ *                     │                      ▼ *
┌──────────────────┐         │             ┌──────────────────┐
│ recepciones_     │         │             │   compras_       │
│ leche            │         │             │   insumos        │
│──────────────────│         │             │──────────────────│
│ PK id_recepcion  │         │             │ PK id_compra     │
│ FK id_proveedor  │──┐      │             │ FK id_proveedor  │──┐
│ FK id_laborat.   │  │      │             │ FK id_usuario_r. │  │
│    litros        │  │      │             │    estado_compra │  │
│    ph, temp,     │  │      │             └───────┬──────────┘  │
│    antibioticos  │  │      │                     │ 1           │
│    estado_triage │  │      │                     │             │
└──────────────────┘  │      │                     │ *           │
                      │      │            ┌────────┴─────────┐   │
                      │      │            │ detalle_compras  │   │
                      │      │            │──────────────────│   │
                      │      │            │ PK id_detalle_c. │   │
                      │      │            │ FK id_compra     │   │
                      │      │            │ FK id_item       │──┐│
                      │      │            │    cantidad      │  ││
                      │      │            │    precio_unit   │  ││
                      │      │            └──────────────────┘  ││
                      │      │                                  ││
                      ▼      ▼                                  ▼▼
               ┌──────────────────┐                   ┌──────────────┐
               │   proveedores    │                   │catalogo_items│
               │──────────────────│                   │──────────────│
               │ PK id_proveedor  │                   │ PK id_item   │
               │    ci_nit        │                   │   codigo_sku │
               │    tipo_prov.    │                   │   tipo_item  │
               │    estado_rep.   │                   │   stock_min  │
               └────────┬─────────┘                   └──────┬───────┘
                        │ 1                                  │ 1
                        │                                    │
                        │ *                                  │ *
               ┌────────┴─────────┐              ┌───────────┴────────┐
               │pagos_proveedores │              │ movimientos_kardex │
               │──────────────────│              │────────────────────│
               │ PK id_pago       │              │ PK id_movimiento   │
               │ FK id_proveedor  │              │ FK id_item         │
               │ FK id_usuario_r. │              │ FK id_lote         │──┐
               │    monto         │              │ FK id_orden_asoc.  │──┤
               └──────────────────┘              │ FK id_usuario      │  │
                                                 │    tipo_operacion  │  │
                                                 │    cantidad_kilos  │  │
                                                 └────────────────────┘  │
                                                                         │
             ┌───────────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────┐         ┌──────────────────────┐
│ recetas_bom      │         │ receta_ingredientes   │
│──────────────────│    1    │───────────────────────│
│ PK id_receta     │────────*│ PK id_detalle_receta  │
│ FK id_item_res.  │         │ FK id_receta          │
│    nombre_receta │         │ FK id_item_ingrediente│
│    base_litros   │         │    cantidad_por_base  │
│    rendimiento   │         │    es_obligatorio     │
└────────┬─────────┘         └───────────────────────┘
         │ 1
         │
         │ *
┌────────┴──────────────┐       ┌─────────────────────┐
│ ordenes_produccion    │       │ fichas_calidad       │
│───────────────────────│  1    │─────────────────────│
│ PK id_orden           │──────*│ PK id_ficha          │
│ FK id_jefe_produccion │       │ FK id_orden          │
│ FK id_receta          │       │ FK id_lote           │
│    litros_invertidos  │       │ FK id_ingeniero_qa   │
│    kilos_obtenidos    │       │    dictamen_qa       │
│    estado_lote        │       │    ph_final          │
└────────┬──────────────┘       │    salinidad         │
         │ 1                    │    grados_brix       │
         │                      └─────────────────────┘
         │ *
┌────────┴──────────────┐
│ lote_produccion       │
│───────────────────────│
│ PK id_lote            │
│ FK id_orden           │
│ FK id_item            │
│    codigo_lote (UNIQ) │
│    cantidad_producida │
│    fecha_fabricacion  │
│    fecha_vencimiento  │
│    estado             │
└────────┬──────────────┘
         │
         │ (referenciado por)
         │
    ┌────┴────────────────┐
    │                     │
    ▼                     ▼
movimientos_kardex    devoluciones_qa


┌─────────────┐      ┌──────────────────┐
│  clientes   │      │  pedidos_ventas  │
│─────────────│  1   │──────────────────│
│ PK id_cli.  │─────*│ PK id_pedido     │
│   nit_fact  │      │ FK id_cliente    │
│   razon_soc │      │ FK id_vendedor   │
│   tipo_cli  │      │   estado_reserva │
└─────────────┘      │   monto_total_bs │
                     └──┬───┬───────────┘
                        │   │
              ┌─────────┘   └──────────┐
              │ 1                    1 │
              │                        │
              │ *                    * │
     ┌────────┴────────┐    ┌──────────┴───────┐
     │detalle_pedidos  │    │    factura        │
     │─────────────────│    │──────────────────│
     │ PK id_detalle   │    │ PK id_factura    │
     │ FK id_pedido    │    │ FK id_pedido     │
     │ FK id_item      │    │   numero_factura │
     │   cantidad      │    │   total_factura  │
     │   precio_unit   │    │   estado         │
     └────────────────┘    └──────────────────┘

     ┌──────────────────┐
     │despachos_logist. │
     │──────────────────│
     │ PK id_despacho   │
     │ FK id_pedido     │──── pedidos_ventas
     │ FK id_encargado  │──── usuarios
     │   placa_camion   │
     │   temperatura    │
     └────────┬─────────┘
              │ 1
              │
              │ *
     ┌────────┴─────────┐
     │devoluciones_qa   │
     │──────────────────│
     │ PK id_devolucion │
     │ FK id_despacho   │
     │ FK id_lote       │──── lote_produccion
     │ FK id_asesor     │──── usuarios
     │   motivo_rechazo │
     │   kilos_devueltos│
     └──────────────────┘
```

---

## Catálogo Completo de Relaciones FK (30)

### Formato: `[Tabla Hija] --(FK)--> [Tabla Padre] | Cardinalidad | Significado`

| # | Tabla Hija | Columna FK | Tabla Padre | Card. | Significado |
|---|-----------|-----------|-------------|-------|-------------|
| **BLOQUE A: Seguridad** | | | | | |
| 1 | `usuarios` | `id_rol` | `roles` | N:1 | Cada usuario tiene UN rol |
| 2 | `usuarios` | `id_empleado` | `empleados` | 1:1 | Cada usuario ES un empleado |
| 3 | `bitacora_auditoria` | `id_usuario` | `usuarios` | N:1 | Quién ejecutó la acción |
| **BLOQUE B: Datos Maestros** | | | | | |
| 4 | `compras_insumos` | `id_proveedor` | `proveedores` | N:1 | A quién se le compró |
| 5 | `compras_insumos` | `id_usuario_recibe` | `usuarios` | N:1 | Quién recibió la compra |
| 6 | `detalle_compras` | `id_compra` | `compras_insumos` | N:1 | Líneas de una compra |
| 7 | `detalle_compras` | `id_item` | `catalogo_items` | N:1 | Qué item se compró |
| 8 | `pagos_proveedores` | `id_proveedor` | `proveedores` | N:1 | A quién se le pagó |
| 9 | `pagos_proveedores` | `id_usuario_registra` | `usuarios` | N:1 | Quién registró el pago |
| **BLOQUE C: Recepción** | | | | | |
| 10 | `control_temperaturas` | `id_usuario` | `usuarios` | N:1 | Quién midió la temperatura |
| 11 | `control_temperaturas` | `id_zona` | `zonas_almacen` | N:1 | En qué zona se midió |
| 12 | `recepciones_leche` | `id_proveedor` | `proveedores` | N:1 | Ganadero que trajo la leche |
| 13 | `recepciones_leche` | `id_laboratorista` | `usuarios` | N:1 | Ingeniero que hizo el triage |
| **BLOQUE D: Inventario** | | | | | |
| 14 | `movimientos_kardex` | `id_item` | `catalogo_items` | N:1 | Qué item se movió |
| 15 | `movimientos_kardex` | `id_usuario` | `usuarios` | N:1 | Quién registró el movimiento |
| 16 | `movimientos_kardex` | `id_lote` | `lote_produccion` | N:1 | Lote físico asociado (si aplica) |
| 17 | `movimientos_kardex` | `id_orden_asociada` | `ordenes_produccion` | N:1 | Orden que originó el movimiento |
| **BLOQUE E: Producción y Calidad** | | | | | |
| 18 | `recetas_bom` | `id_item_resultado` | `catalogo_items` | N:1 | Producto que genera la receta |
| 19 | `receta_ingredientes` | `id_receta` | `recetas_bom` | N:1 | Ingredientes de una receta |
| 20 | `receta_ingredientes` | `id_item_ingrediente` | `catalogo_items` | N:1 | Qué insumo es el ingrediente |
| 21 | `ordenes_produccion` | `id_jefe_produccion` | `usuarios` | N:1 | Quién dirige la producción |
| 22 | `ordenes_produccion` | `id_receta` | `recetas_bom` | N:1 | Receta BOM usada |
| 23 | `lote_produccion` | `id_orden` | `ordenes_produccion` | N:1 | Orden que generó el lote |
| 24 | `lote_produccion` | `id_item` | `catalogo_items` | N:1 | Producto terminado del lote |
| 25 | `fichas_calidad` | `id_orden` | `ordenes_produccion` | N:1 | Orden evaluada |
| 26 | `fichas_calidad` | `id_lote` | `lote_produccion` | N:1 | Lote específico evaluado |
| 27 | `fichas_calidad` | `id_ingeniero_qa` | `usuarios` | N:1 | Ingeniero que evaluó |
| **BLOQUE F: Comercial y Logística** | | | | | |
| 28 | `pedidos_ventas` | `id_cliente` | `clientes` | N:1 | Cliente que compra |
| 29 | `pedidos_ventas` | `id_vendedor` | `usuarios` | N:1 | Asesor que vendió |
| 30 | `detalle_pedidos` | `id_pedido` | `pedidos_ventas` | N:1 | Líneas de un pedido |
| 31 | `detalle_pedidos` | `id_item` | `catalogo_items` | N:1 | Producto pedido |
| 32 | `factura` | `id_pedido` | `pedidos_ventas` | N:1 | Pedido facturado |
| 33 | `despachos_logisticos` | `id_pedido` | `pedidos_ventas` | N:1 | Pedido despachado |
| 34 | `despachos_logisticos` | `id_encargado` | `usuarios` | N:1 | Encargado del despacho |
| 35 | `devoluciones_qa` | `id_despacho` | `despachos_logisticos` | N:1 | Despacho devuelto |
| 36 | `devoluciones_qa` | `id_lote` | `lote_produccion` | N:1 | Lote específico devuelto |
| 37 | `devoluciones_qa` | `id_asesor` | `usuarios` | N:1 | Asesor que registró |
| **BLOQUE G: Soporte** | | | | | |
| 38 | `respaldos_documentales` | `id_usuario_subida` | `usuarios` | N:1 | Quién subió el archivo |

> **Total: 38 Foreign Keys** que formalizan 38 relaciones UML.

---

## Cardinalidades en Notación StarUML

Para cada relación, en StarUML se dibuja una **Asociación Dirigida** (flecha) desde la tabla hija (muchos) hacia la tabla padre (uno). A continuación la notación:

### Relaciones 1:N (Un padre → Muchos hijos)

```
roles ──────────────< usuarios           (1 rol tiene N usuarios)
empleados ──────────< usuarios           (1 empleado tiene 1 usuario, pero 1:1)
usuarios ───────────< bitacora_auditoria (1 usuario genera N logs)
usuarios ───────────< compras_insumos    (1 usuario recibe N compras)
usuarios ───────────< recepciones_leche  (1 usuario hace N recepciones)
usuarios ───────────< ordenes_produccion (1 jefe crea N órdenes)
usuarios ───────────< fichas_calidad     (1 ingeniero crea N fichas)
usuarios ───────────< pedidos_ventas     (1 vendedor crea N pedidos)
usuarios ───────────< despachos_logist.  (1 encargado hace N despachos)
usuarios ───────────< devoluciones_qa    (1 asesor registra N devoluciones)
usuarios ───────────< control_temperaturas
usuarios ───────────< pagos_proveedores
usuarios ───────────< movimientos_kardex

proveedores ────────< recepciones_leche  (1 ganadero entrega N cisternas)
proveedores ────────< compras_insumos    (1 proveedor recibe N compras)
proveedores ────────< pagos_proveedores  (1 proveedor recibe N pagos)

catalogo_items ─────< movimientos_kardex (1 item tiene N movimientos)
catalogo_items ─────< receta_ingredientes(1 item aparece en N recetas)
catalogo_items ─────< recetas_bom        (1 item es resultado de N recetas)
catalogo_items ─────< lote_produccion    (1 item se fabrica en N lotes)
catalogo_items ─────< detalle_compras    (1 item se compra en N líneas)
catalogo_items ─────< detalle_pedidos    (1 item se pide en N líneas)

recetas_bom ────────< receta_ingredientes(1 receta tiene N ingredientes)
recetas_bom ────────< ordenes_produccion (1 receta se usa en N órdenes)

ordenes_produccion ─< lote_produccion    (1 orden genera N lotes)
ordenes_produccion ─< fichas_calidad     (1 orden recibe N fichas QA)
ordenes_produccion ─< movimientos_kardex (1 orden genera N movimientos)

lote_produccion ────< movimientos_kardex (1 lote tiene N movimientos)
lote_produccion ────< fichas_calidad     (1 lote tiene N fichas)
lote_produccion ────< devoluciones_qa    (1 lote puede tener N devoluciones)

clientes ───────────< pedidos_ventas     (1 cliente hace N pedidos)

pedidos_ventas ─────< detalle_pedidos    (1 pedido tiene N líneas)
pedidos_ventas ─────< factura            (1 pedido genera 1 factura, 1:1 lógico)
pedidos_ventas ─────< despachos_logist.  (1 pedido tiene 1 despacho, 1:1 lógico)

despachos_logisticos< devoluciones_qa    (1 despacho genera N devoluciones)

zonas_almacen ──────< control_temperaturas
```

### Relaciones 1:1 (Lógicas, no físicas)

```
empleados ─────1:1── usuarios
    → Un empleado puede tener MÁXIMO una cuenta de usuario
    → En StarUML: multiplicidad 0..1 en ambos extremos

pedidos_ventas ─1:1── factura
    → Un pedido genera EXACTAMENTE una factura
    → En StarUML: multiplicidad 1 en ambos extremos

pedidos_ventas ─1:1── despachos_logisticos
    → Un pedido tiene EXACTAMENTE un despacho
    → En StarUML: multiplicidad 0..1 en despacho (puede no haberse despachado aún)
```

---

## Cadena de Trazabilidad Completa (SENASAG)

La siguiente cadena representa la trazabilidad extremo a extremo que el sistema garantiza.  
**Es la ruta forense** que SENASAG puede seguir desde un producto defectuoso hasta la cisterna de leche original:

```
devoluciones_qa → despachos_logisticos → pedidos_ventas → detalle_pedidos
       │                                                        │
       ▼                                                        ▼
  lote_produccion ← movimientos_kardex → catalogo_items
       │
       ▼
  ordenes_produccion → recetas_bom → receta_ingredientes → catalogo_items
       │
       ▼
  fichas_calidad (dictamen QA)
       │
       ▼
  movimientos_kardex (egreso de leche) → recepciones_leche → proveedores
                                                │
                                                ▼
                                         (datos del triage:
                                          pH, antibióticos,
                                          células somáticas)
```

**Ejemplo narrativo:**

> *"El supermercado Hipermaxi devolvió 5 kg de queso mozzarella (devoluciones_qa.id=45). El sistema traza: despacho #123 → pedido #78 → lote LOTE-MOZ-060426-A → orden de producción #33 → receta BOM mozzarella v3 → la leche usada vino de la recepción #201 → proveedor 'Estancia Valle Nuevo' (CI: 4567890). El triage de esa cisterna mostró pH=6.12 (bajo). Resultado: proveedor marcado como 'Observado'."*

---

## Tabla Pivot: Entidad `usuarios` (Hub Central)

La tabla `usuarios` es el **hub central** del esquema. Participa como FK en **13 tablas diferentes**, actuando como el actor humano registrado en cada operación:

| Tabla que referencia a usuarios | Columna FK | Rol del usuario |
|-------------------------------|-----------|----------------|
| `bitacora_auditoria` | `id_usuario` | Ejecutor de la acción |
| `compras_insumos` | `id_usuario_recibe` | Receptor de insumos |
| `pagos_proveedores` | `id_usuario_registra` | Registrador de pagos |
| `control_temperaturas` | `id_usuario` | Medidor de temperatura |
| `recepciones_leche` | `id_laboratorista` | Ing. de triage |
| `movimientos_kardex` | `id_usuario` | Registrador de movimiento |
| `ordenes_produccion` | `id_jefe_produccion` | Jefe de producción |
| `fichas_calidad` | `id_ingeniero_qa` | Ingeniero de calidad |
| `pedidos_ventas` | `id_vendedor` | Asesor comercial |
| `despachos_logisticos` | `id_encargado` | Encargado de despacho |
| `devoluciones_qa` | `id_asesor` | Asesor que registra devolución |
| `respaldos_documentales` | `id_usuario_subida` | Subidor de archivo |
| *(relacionado vía empleados)* | — | Identidad física/CI |

---

## Tabla Pivot: Entidad `catalogo_items` (Catálogo Maestro)

La tabla `catalogo_items` actúa como el **segundo hub** del esquema, representando todo lo que se compra, produce, almacena y vende:

| Tabla que lo referencia | Columna FK | Rol del item |
|------------------------|-----------|-------------|
| `detalle_compras` | `id_item` | Item comprado al proveedor |
| `movimientos_kardex` | `id_item` | Item que entró/salió del almacén |
| `recetas_bom` | `id_item_resultado` | Producto terminado de la receta |
| `receta_ingredientes` | `id_item_ingrediente` | Ingrediente de la receta |
| `lote_produccion` | `id_item` | Producto fabricado en el lote |
| `detalle_pedidos` | `id_item` | Producto vendido al cliente |

> **Los 4 tipos de item** (`MATERIA_PRIMA`, `INSUMO`, `PRODUCTO_TERMINADO`, `EMPAQUE`) conviven en la misma tabla pero se diferencian por CHECK constraint. Esto habilita un Kardex unificado para **todo** lo que entra y sale de GRULAC.

---

## Guía Rápida de Creación en StarUML

### Paso 1: Crear las 26 clases
Crear cada tabla como una **Clase UML** con:
- Nombre = nombre de la tabla
- Atributos = columnas (marcar PK con «PK», FK con «FK»)
- Estereotipo = `«table»`

### Paso 2: Dibujar las 38 relaciones
Para cada FK en la tabla de catálogo:
1. Crear **Asociación** de la clase hija → clase padre
2. Poner multiplicidad `*` en el extremo de la hija
3. Poner multiplicidad `1` en el extremo del padre
4. Nombrar la asociación con el nombre de la FK

### Paso 3: Estereotipos de las relaciones
- **Composición (diamante negro)** para: `detalle_pedidos→pedidos_ventas`, `detalle_compras→compras_insumos`, `receta_ingredientes→recetas_bom`
  → Si el padre se elimina, los hijos no tienen sentido
- **Agregación (diamante blanco)** para: `movimientos_kardex→catalogo_items`, `lote_produccion→ordenes_produccion`
  → Los hijos pueden existir lógicamente sin el padre
- **Asociación simple (línea)** para el resto

### Paso 4: Agrupar en Paquetes
- **Paquete "Seguridad"**: roles, empleados, usuarios, bitacora
- **Paquete "Maestros"**: catalogo_items, proveedores, compras_insumos, detalle_compras, pagos
- **Paquete "Recepción"**: zonas_almacen, control_temperaturas, recepciones_leche
- **Paquete "Producción"**: recetas_bom, receta_ingredientes, ordenes_produccion, lote_produccion, fichas_calidad
- **Paquete "Comercial"**: clientes, pedidos_ventas, detalle_pedidos, factura, despachos_logisticos, devoluciones_qa
- **Paquete "Soporte"**: respaldos_documentales, config_alertas
