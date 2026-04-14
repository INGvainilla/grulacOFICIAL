# ABORDAJE TÉCNICO Y EJECUCIÓN EN LA BASE DE DATOS (NUEVO DIAGRAMA DE CLASES)

A continuación, se detalla sistemáticamente cómo el esquema relacional en PostgreSQL soluciona paso a paso los problemas detectados en el Método Ishikawa, estructurando el avance modularmente desde las tablas maestras.

---

# *ESLABÓN 1: Seguridad Analítica, Gobernanza y Trazabilidad Forense*

- **PF-12**
    
    Sobrecarga operativa, persona-dependencia y ausencia de gobernanza: Una sola persona gestiona calidad + inventario + compras + despacho + mantenimiento del Excel (3-4 hrs/día de digitación). Sin organigrama formal, sin misión/visión documentada, sin definición formal de roles. Si esta persona se ausenta, la operación informativa se paraliza. *(P24+P25+P38)*
    
- **Solución Transaccional: Arquitectura RBAC (`roles` y `usuarios`)**
    
    > Descongestión del personal distribuyendo el trabajo orgánicamente a nivel de Base de Datos. Aislamos los flujos autorizados mediante un esquema JSON (`permisos_json`). Cuando los operadores inicien su tablet, el Backend forzará su límite. El 'Laboratorista' solo verá Triage, y el 'Jefe de Producción' jamás cruzará datos de ventas, forzando gobernanza inquebrantable.
    > 

```sql
-- 1. Capturamos la identidad del empleado real.
INSERT INTO empleados (ci_documento, nombre_completo, telefono) 
VALUES ('9821345', 'Lic. Carmen Telles (QA Hilado)', '71023456');

-- 2. Declaramos la frontera y permisos aislando la ruta en JSON.
INSERT INTO roles (nombre_rol, permisos_json) 
VALUES ('Control Calidad QA', '{"modulos":["fichas_calidad", "recepcion", "hilado"]}');

-- 3. Entrelazamos a la Licenciada con su Rol, habilitando su ecosistema seguro.
INSERT INTO usuarios (id_rol, id_empleado, email_corporativo, password_hash, estado_acceso) 
VALUES (1, 1, 'ctelles_qa@grulac.com', '$2a$12$SecureHashQA...', TRUE);
```

- **PF-15**
    
    Riesgo de incumplimiento normativo SENASAG y ausencia de auditoría digital: Sin trazabilidad completa lote→cliente, sin registros de parámetros verificados, sin log de quién modificó un dato y cuándo. Ante una inspección sanitaria, la empresa no puede rastrear alteraciones al histórico. *(P35+P39+P40)*
    
- **Solución Transaccional: Disparador Sanitario Forense Inteligente (Triggers `fn_auditar_tabla()`)**
    
    > Extirpamos el error e impunidad del Excel. Como SENASAG castiga severamente la alteración médica, el sistema activa un Vigilante en Base de Datos (Trigger Nativo PL/pgSQL) acoplado estructuralmente a la inserción/borrado. Nadie inserta, modifica o borra un parámetro sin que el software expulse una matriz JSON a la Bitácora de sombras para evitar sabotajes.
    > 

```sql
-- (ACCIÓN CENSURABLE DEL HUMANO): El jefe intenta alterar el catálogo comercial 
UPDATE catalogo_items SET nombre_producto = 'Leche Adulterada' WHERE id_item = 1;

-- (REACCIÓN ROBÓTICA DE LA BD): El trigger fn_auditar_tabla() se activa automáticamente
-- en cuestión de nanosegundos protegiendo a la empresa grabando este registro en Bitácora de Auditoría:
-- EXTRACCIÓN REAL JSON: 
-- id_usuario: 3 (Roberto Suarez) | accion_sql: 'UPDATE' | tabla: 'catalogo_items' 
-- old_data: {"nombre_producto": "Leche Cruda Fresca", "stock_minimo": 1000}
-- new_data: {"nombre_producto": "Leche Adulterada", "stock_minimo": 1000}
```
