#!/usr/bin/env python3
"""
Script to update diagramaClases.mdj attributes to match BASE_DE_DATOS_OFICIAL.sql
Maps SQL columns → UML class attributes, updates model + views.
"""
import json
import copy
import hashlib
import base64
import random
import string
import re

MDJ_PATH = r"c:\Users\User\Documents\1-2026\c\proyecto-si1-grulac\DIAGRAMAS\diagramaClases.mdj"

# ──────────────────────────────────────────────────────────────
# MAPPING: SQL table name → UML class name in .mdj
# ──────────────────────────────────────────────────────────────
TABLE_TO_CLASS = {
    "roles": "ROLES",
    "empleados": "EMPLEADOS",
    "usuarios": "USUARIOS",
    "bitacora_auditoria": "BITACORA_AUDITORA",
    "catalogo_items": "CATALOGO_ITEMS",
    "proveedores": "PROVEEDORES",
    "compras_insumos": "COMPRAS_INSUMOS",
    "detalle_compras": "DETALLE_COMPRAS",
    "pagos_proveedores": "PAGOS_PROVEEDORES",
    "zonas_almacen": "ZONAS_ALMACEN",
    "control_temperaturas": "CONTROL_DE_TEMPERATURAS",
    "recepciones_leche": "RECEPCIONES_LECHE",
    "movimientos_kardex": "MOVIMIENTOS_KARDEX",
    "recetas_bom": "RECETAS_BOM",
    "receta_ingredientes": "RECETA_INGREDIENTES",
    "ordenes_produccion": "ORDENES_PRODUCCION",
    "lote_produccion": "LOTE_PRODUCCION",
    "fichas_calidad": "FICHA_CALIDAD",
    "clientes": "CLIENTE",
    "pedidos_ventas": "PEDIDOS_VENTAS",
    "detalle_pedidos": "DETALLE_PEDIDOS",
    "factura": "FACTURA",
    "despachos_logisticos": "DESPACHOS_LOGISTICOS",
    "devoluciones_qa": "DEVOLUCIONES",
    "respaldos_documentales": "RESPALDOS_DOCUMENTALES",
    "config_alertas": "CONFIG_ALERTAS",
}

# ──────────────────────────────────────────────────────────────
# SQL column → friendly UML attribute name
# Omit pure FK columns (shown as associations), keep the rest
# ──────────────────────────────────────────────────────────────
SQL_TYPE_MAP = {
    "SERIAL": "int",
    "INT": "int",
    "BIGINT": "long",
    "VARCHAR": "String",
    "TEXT": "String",
    "BOOLEAN": "boolean",
    "DECIMAL": "double",
    "DATE": "Date",
    "TIMESTAMPTZ": "DateTime",
    "UUID": "UUID",
    "JSONB": "JSON",
}

def col_to_uml_name(col):
    """Convert SQL column name to a clean UML attribute name."""
    parts = col.lower().split("_")
    return "_".join(p.capitalize() for p in parts)

def col_to_uml_type(type_str):
    """Convert SQL type string to UML type."""
    type_str = type_str.upper().strip()
    # Remove size specs like (10,2)
    base = re.split(r'[\(\s]', type_str)[0]
    return SQL_TYPE_MAP.get(base, "String")

# ──────────────────────────────────────────────────────────────
# DESIRED attributes per class, derived from the SQL schema
# Format: list of (attr_name, type_str) — type is for display
# We exclude pure created_at/updated_at timestamps and pure FK id columns
# that are already represented by associations
# ──────────────────────────────────────────────────────────────
DESIRED_ATTRS = {
    "ROLES": [
        ("id_rol", "int"),
        ("nombre_rol", "String"),
        ("descripcion", "String"),
        ("permisos_json", "JSON"),
        ("estado_activo", "boolean"),
        ("created_at", "DateTime"),
        ("updated_at", "DateTime"),
    ],
    "EMPLEADOS": [
        ("id_empleado", "int"),
        ("ci_documento", "String"),
        ("nombre_completo", "String"),
        ("cargo", "String"),
        ("telefono", "String"),
        ("email_personal", "String"),
        ("estado_activo", "boolean"),
        ("fecha_ingreso", "Date"),
        ("created_at", "DateTime"),
        ("updated_at", "DateTime"),
    ],
    "USUARIOS": [
        ("id_usuario", "int"),
        ("auth_uid", "UUID"),
        ("id_rol", "int"),
        ("id_empleado", "int"),
        ("email_corporativo", "String"),
        ("estado_acceso", "boolean"),
        ("password_hash", "String"),
        ("ultimo_login", "DateTime"),
        ("intentos_fallidos", "int"),
        ("created_at", "DateTime"),
        ("updated_at", "DateTime"),
    ],
    "BITACORA_AUDITORA": [
        ("id_log", "int"),
        ("id_usuario", "int"),
        ("accion_sql", "String"),
        ("tabla_afectada", "String"),
        ("registro_id", "int"),
        ("ip_address", "String"),
        ("fecha_hora", "DateTime"),
        ("old_data", "JSON"),
        ("new_data", "JSON"),
    ],
    "CATALOGO_ITEMS": [
        ("id_item", "int"),
        ("codigo_sku", "String"),
        ("nombre_producto", "String"),
        ("tipo_item", "String"),
        ("categoria", "String"),
        ("unidad_medida", "String"),
        ("precio_referencia", "double"),
        ("vida_util_dias", "int"),
        ("stock_minimo", "double"),
        ("created_at", "DateTime"),
        ("updated_at", "DateTime"),
    ],
    "PROVEEDORES": [
        ("id_proveedor", "int"),
        ("ci_nit", "String"),
        ("razon_social", "String"),
        ("tipo_proveedor", "String"),
        ("telefono", "String"),
        ("direccion", "String"),
        ("colonia_origen", "String"),
        ("lead_time_dias", "int"),
        ("estado_reputacion", "String"),
        ("created_at", "DateTime"),
        ("updated_at", "DateTime"),
    ],
    "COMPRAS_INSUMOS": [
        ("id_compra", "int"),
        ("id_proveedor", "int"),
        ("id_usuario_recibe", "int"),
        ("numero_factura_compra", "String"),
        ("estado_compra", "String"),
        ("monto_total_bs", "double"),
        ("fecha_compra", "DateTime"),
    ],
    "DETALLE_COMPRAS": [
        ("id_detalle_compra", "int"),
        ("id_compra", "int"),
        ("id_item", "int"),
        ("cantidad", "double"),
        ("precio_unitario", "double"),
        ("lote_proveedor", "String"),
        ("fecha_vencimiento", "Date"),
    ],
    "PAGOS_PROVEEDORES": [
        ("id_pago", "int"),
        ("id_proveedor", "int"),
        ("id_compra", "int"),
        ("id_usuario_registra", "int"),
        ("monto_pagado_bs", "double"),
        ("metodo_pago", "String"),
        ("referencia_comprobante", "String"),
        ("fecha_pago", "DateTime"),
    ],
    "ZONAS_ALMACEN": [
        ("id_zona", "int"),
        ("nombre_zona", "String"),
        ("tipo_zona", "String"),
        ("temperatura_minima", "double"),
        ("temperatura_maxima", "double"),
        ("estado_activo", "boolean"),
    ],
    "CONTROL_DE_TEMPERATURAS": [
        ("id_registro", "int"),
        ("id_usuario", "int"),
        ("id_zona", "int"),
        ("zona_monitoreada", "String"),
        ("temperatura_celsius", "double"),
        ("fecha_hora", "DateTime"),
    ],
    "RECEPCIONES_LECHE": [
        ("id_recepcion", "int"),
        ("id_proveedor", "int"),
        ("id_laboratorista", "int"),
        ("litros_recibidos", "double"),
        ("acidez_dornic", "double"),
        ("acidez_ph", "double"),
        ("temperatura_celsius", "double"),
        ("celulas_somaticas", "int"),
        ("antibioticos", "boolean"),
        ("porcentaje_grasa", "double"),
        ("densidad", "double"),
        ("porcentaje_agua", "double"),
        ("punto_congelamiento", "double"),
        ("estado_triage", "String"),
        ("observaciones", "String"),
        ("fecha_registro", "DateTime"),
    ],
    "MOVIMIENTOS_KARDEX": [
        ("id_movimiento", "int"),
        ("id_item", "int"),
        ("id_lote", "int"),
        ("id_orden_asociada", "int"),
        ("id_compra_origen", "int"),
        ("id_usuario", "int"),
        ("tipo_operacion", "String"),
        ("cantidad_kilos", "double"),
        ("concepto_operacion", "String"),
        ("fecha_hora", "DateTime"),
    ],
    "RECETAS_BOM": [
        ("id_receta", "int"),
        ("id_item_resultado", "int"),
        ("nombre_receta", "String"),
        ("version_receta", "int"),
        ("base_litros_leche", "double"),
        ("rendimiento_esperado_pct", "double"),
        ("estado_activa", "boolean"),
        ("created_at", "DateTime"),
        ("updated_at", "DateTime"),
    ],
    "RECETA_INGREDIENTES": [
        ("id_detalle_receta", "int"),
        ("id_receta", "int"),
        ("id_item_ingrediente", "int"),
        ("cantidad_por_base", "double"),
        ("unidad_medida", "String"),
        ("es_obligatorio", "boolean"),
        ("tolerancia_pct", "double"),
        ("observaciones", "String"),
    ],
    "ORDENES_PRODUCCION": [
        ("id_orden", "int"),
        ("id_jefe_produccion", "int"),
        ("id_receta", "int"),
        ("litros_invertidos", "double"),
        ("kilos_obtenidos_brutos", "double"),
        ("rendimiento_real_pct", "double"),
        ("costo_operativo_bs", "double"),
        ("estado_lote", "String"),
        ("fecha_inicio", "DateTime"),
        ("fecha_cierre", "DateTime"),
        ("observaciones", "String"),
    ],
    "LOTE_PRODUCCION": [
        ("id_lote", "int"),
        ("id_orden", "int"),
        ("id_item", "int"),
        ("codigo_lote", "String"),
        ("cantidad_producida", "double"),
        ("unidad_medida", "String"),
        ("fecha_fabricacion", "Date"),
        ("fecha_vencimiento", "Date"),
        ("estado", "String"),
        ("observaciones", "String"),
        ("created_at", "DateTime"),
    ],
    "FICHA_CALIDAD": [
        ("id_ficha", "int"),
        ("id_orden", "int"),
        ("id_lote", "int"),
        ("id_ingeniero_qa", "int"),
        ("dictamen_qa", "String"),
        ("ph_final", "double"),
        ("salinidad", "double"),
        ("grados_brix", "double"),
        ("humedad_pct", "double"),
        ("temperatura_evaluacion", "double"),
        ("observaciones_tecnicas", "String"),
        ("fecha_evaluacion", "DateTime"),
    ],
    "CLIENTE": [
        ("id_cliente", "int"),
        ("nit_facturacion", "String"),
        ("razon_social", "String"),
        ("tipo_cliente", "String"),
        ("telefono", "String"),
        ("email", "String"),
        ("direccion", "String"),
        ("ciudad", "String"),
        ("created_at", "DateTime"),
        ("updated_at", "DateTime"),
    ],
    "PEDIDOS_VENTAS": [
        ("id_pedido", "int"),
        ("id_cliente", "int"),
        ("id_vendedor", "int"),
        ("estado_reserva", "String"),
        ("monto_total_bs", "double"),
        ("fecha_reserva", "DateTime"),
        ("fecha_entrega_programada", "Date"),
        ("metodo_pago", "String"),
        ("observaciones", "String"),
    ],
    "DETALLE_PEDIDOS": [
        ("id_detalle", "int"),
        ("id_pedido", "int"),
        ("id_item", "int"),
        ("cantidad_pedida", "double"),
        ("precio_unitario", "double"),
    ],
    "FACTURA": [
        ("id_factura", "int"),
        ("id_pedido", "int"),
        ("numero_factura", "String"),
        ("subtotal", "double"),
        ("impuesto", "double"),
        ("total_factura", "double"),
        ("metodo_pago", "String"),
        ("estado", "String"),
        ("fecha_emision", "DateTime"),
    ],
    "DESPACHOS_LOGISTICOS": [
        ("id_despacho", "int"),
        ("id_pedido", "int"),
        ("id_encargado", "int"),
        ("placa_camion", "String"),
        ("nombre_chofer", "String"),
        ("temperatura_salida", "double"),
        ("fecha_salida_ruta", "DateTime"),
        ("observaciones", "String"),
    ],
    "DEVOLUCIONES": [
        ("id_devolucion", "int"),
        ("id_despacho", "int"),
        ("id_lote", "int"),
        ("id_asesor", "int"),
        ("motivo_rechazo", "String"),
        ("kilos_devueltos", "double"),
        ("requiere_reposicion", "boolean"),
        ("estado_devolucion", "String"),
        ("fecha_registro", "DateTime"),
    ],
    "RESPALDOS_DOCUMENTALES": [
        ("id_documento", "int"),
        ("entidad_afectada", "String"),
        ("id_entidad", "int"),
        ("url_publica_storage", "String"),
        ("descripcion_archivo", "String"),
        ("tipo_archivo", "String"),
        ("tamanio_bytes", "long"),
        ("id_usuario_subida", "int"),
        ("fecha_subida", "DateTime"),
    ],
    "CONFIG_ALERTAS": [
        ("id_alerta", "int"),
        ("nombre_alerta", "String"),
        ("tipo_evento", "String"),
        ("umbral_valor", "double"),
        ("umbral_dias", "int"),
        ("emails_destino", "String"),
        ("prioridad", "String"),
        ("activa", "boolean"),
        ("cron_expresion", "String"),
        ("created_at", "DateTime"),
    ],
}

# Standard CRUD operations for all classes
STANDARD_OPERATIONS = [
    "crear()",
    "leer()",
    "actualizar()",
    "eliminar()",
]

# ──────────────────────────────────────────────────────────────
# ID generator — makes StarUML-compatible base64 IDs
# ──────────────────────────────────────────────────────────────
_used_ids = set()

def generate_id():
    """Generate a unique StarUML-compatible ID."""
    while True:
        # Generate random bytes and base64 encode
        raw = ''.join(random.choices(string.ascii_letters + string.digits + '+/=', k=20))
        new_id = "AAAAAAGe" + raw[:12] + "="
        if new_id not in _used_ids:
            _used_ids.add(new_id)
            return new_id

def collect_all_ids(obj):
    """Collect all existing _id values to avoid collisions."""
    if isinstance(obj, dict):
        if "_id" in obj:
            _used_ids.add(obj["_id"])
        for v in obj.values():
            collect_all_ids(v)
    elif isinstance(obj, list):
        for item in obj:
            collect_all_ids(item)

# ──────────────────────────────────────────────────────────────
# MAIN LOGIC
# ──────────────────────────────────────────────────────────────
def find_class_by_name(model_elements, class_name):
    """Find a UMLClass element by name in the model's ownedElements."""
    for el in model_elements:
        if el.get("_type") == "UMLClass" and el.get("name") == class_name:
            return el
    return None

def find_class_view(diagram_views, class_model_id):
    """Find the UMLClassView in diagram ownedViews that references a given model ID."""
    for view in diagram_views:
        if view.get("_type") == "UMLClassView":
            model_ref = view.get("model", {})
            if model_ref.get("$ref") == class_model_id:
                return view
    return None

def find_attr_compartment_view(class_view):
    """Find the UMLAttributeCompartmentView within a class view."""
    for sv in class_view.get("subViews", []):
        if sv.get("_type") == "UMLAttributeCompartmentView":
            return sv
    return None

def find_op_compartment_view(class_view):
    """Find the UMLOperationCompartmentView within a class view."""
    for sv in class_view.get("subViews", []):
        if sv.get("_type") == "UMLOperationCompartmentView":
            return sv
    return None

def make_attribute(parent_id, attr_name, attr_type):
    """Create a UMLAttribute model element."""
    attr_id = generate_id()
    return {
        "_type": "UMLAttribute",
        "_id": attr_id,
        "_parent": {"$ref": parent_id},
        "name": col_to_uml_name(attr_name),
        "type": attr_type,
    }

def make_attribute_view(parent_view_id, model_ref_id, display_text, left, top, width):
    """Create a UMLAttributeView element for the diagram."""
    view_id = generate_id()
    return {
        "_type": "UMLAttributeView",
        "_id": view_id,
        "_parent": {"$ref": parent_view_id},
        "model": {"$ref": model_ref_id},
        "font": "Arial;13;0",
        "left": left,
        "top": top,
        "width": width,
        "height": 13,
        "text": "+" + display_text,
        "horizontalAlignment": 0,
    }

def make_operation(parent_id, op_name):
    """Create a UMLOperation model element."""
    op_id = generate_id()
    return {
        "_type": "UMLOperation",
        "_id": op_id,
        "_parent": {"$ref": parent_id},
        "name": op_name,
    }

def make_operation_view(parent_view_id, model_ref_id, display_text, left, top, width):
    """Create a UMLOperationView element for the diagram."""
    view_id = generate_id()
    return {
        "_type": "UMLOperationView",
        "_id": view_id,
        "_parent": {"$ref": parent_view_id},
        "model": {"$ref": model_ref_id},
        "font": "Arial;13;0",
        "left": left,
        "top": top,
        "width": width,
        "height": 13,
        "text": "+" + display_text,
        "horizontalAlignment": 0,
    }

def update_class(model_elements, diagram_views, class_name, desired_attrs):
    """Update a single class's attributes and operations to match SQL schema."""
    class_el = find_class_by_name(model_elements, class_name)
    if class_el is None:
        print(f"  [WARN] Class '{class_name}' not found in model, skipping.")
        return

    class_id = class_el["_id"]
    class_view = find_class_view(diagram_views, class_id)
    if class_view is None:
        print(f"  [WARN] ClassView for '{class_name}' not found, skipping.")
        return

    attr_compartment_view = find_attr_compartment_view(class_view)
    op_compartment_view = find_op_compartment_view(class_view)

    # Get position info from the class view
    left = class_view.get("left", 0)
    # Use a reasonable width
    width = max(class_view.get("width", 120), 160)

    # ─── Update model attributes ───
    new_model_attrs = []
    for (col_name, col_type) in desired_attrs:
        new_model_attrs.append(make_attribute(class_id, col_name, col_type))

    class_el["attributes"] = new_model_attrs

    # ─── Update model operations (CRUD) ───
    new_model_ops = []
    for op_name in STANDARD_OPERATIONS:
        new_model_ops.append(make_operation(class_id, op_name))
    class_el["operations"] = new_model_ops

    # ─── Update attribute views ───
    if attr_compartment_view is not None:
        attr_compartment_id = attr_compartment_view["_id"]
        new_attr_views = []
        name_compartment_height = 25  # Name compartment is typically 25px
        class_top = class_view.get("top", 0)
        attr_start_top = class_top + name_compartment_height + 5

        for i, attr_model in enumerate(new_model_attrs):
            display_name = attr_model["name"]
            if attr_model.get("type"):
                display_name = f"{attr_model['name']}: {attr_model['type']}"
            av = make_attribute_view(
                attr_compartment_id,
                attr_model["_id"],
                display_name,
                left + 5,
                attr_start_top + (i * 15),
                width - 10,
            )
            new_attr_views.append(av)

        attr_compartment_view["subViews"] = new_attr_views
        # Update compartment dimensions
        attr_height = max(len(new_attr_views) * 15 + 5, 10)
        attr_compartment_view["left"] = left
        attr_compartment_view["top"] = class_top + name_compartment_height
        attr_compartment_view["width"] = width
        attr_compartment_view["height"] = attr_height
    else:
        attr_height = 10

    # ─── Update operation views ───
    if op_compartment_view is not None:
        op_compartment_id = op_compartment_view["_id"]
        new_op_views = []
        class_top = class_view.get("top", 0)
        op_start_top = class_top + 25 + attr_height + 5

        for i, op_model in enumerate(new_model_ops):
            display_name = op_model["name"]
            ov = make_operation_view(
                op_compartment_id,
                op_model["_id"],
                display_name,
                left + 5,
                op_start_top + (i * 15),
                width - 10,
            )
            new_op_views.append(ov)

        op_compartment_view["subViews"] = new_op_views
        op_height = max(len(new_op_views) * 15 + 5, 10)
        op_compartment_view["left"] = left
        op_compartment_view["top"] = class_top + 25 + attr_height
        op_compartment_view["width"] = width
        op_compartment_view["height"] = op_height
    else:
        op_height = 10

    # ─── Update class view total height and width ───
    total_height = 25 + attr_height + op_height
    class_view["height"] = total_height
    class_view["width"] = width

    # Update name compartment width
    for sv in class_view.get("subViews", []):
        if sv.get("_type") == "UMLNameCompartmentView":
            sv["width"] = width
            sv["left"] = left

    print(f"  [OK] {class_name}: {len(desired_attrs)} attrs + {len(STANDARD_OPERATIONS)} ops")


def main():
    print("=" * 60)
    print("Updating diagramaClases.mdj from SQL schema...")
    print("=" * 60)

    # Load the .mdj file
    with open(MDJ_PATH, "r", encoding="utf-8") as f:
        project = json.load(f)

    # Collect all existing IDs to avoid collisions
    collect_all_ids(project)
    print(f"Collected {len(_used_ids)} existing IDs")

    # Navigate to Model > ownedElements (where classes live)
    model = project["ownedElements"][0]  # UMLModel
    model_elements = model["ownedElements"]

    # Find the class diagram (first UMLClassDiagram)
    diagram = None
    for el in model_elements:
        if el.get("_type") == "UMLClassDiagram":
            diagram = el
            break

    if diagram is None:
        print("ERROR: No UMLClassDiagram found!")
        return

    diagram_views = diagram["ownedViews"]

    print(f"\nFound {len(model_elements)} model elements, {len(diagram_views)} diagram views\n")

    # Process each class
    for class_name, attrs in DESIRED_ATTRS.items():
        update_class(model_elements, diagram_views, class_name, attrs)

    # Save the updated file
    with open(MDJ_PATH, "w", encoding="utf-8") as f:
        json.dump(project, f, indent="\t", ensure_ascii=False)

    print(f"\n{'=' * 60}")
    print(f"[OK] Updated {MDJ_PATH}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
