-- 1. Liberación Automática del Lote (Módulo de Calidad QA)

--Este Trigger actúa sobre la tabla "fichas_calidad". Una vez que el Ingeniero de Calidad inserta o actualiza el resultado de su prueba de laboratorio, el disparador reacciona automáticamente. Si el dictamen es 'Aprobado', el sistema libera comercialmente el registro en la tabla "lote_produccion" y finaliza la orden en "ordenes_produccion". Si es 'Rechazado', los manda a cuarentena. Evita que un operario deba actualizar manualmente los estados.

CREATE OR REPLACE FUNCTION fn_qa_libera_lote()

RETURNS TRIGGER AS $$

BEGIN

IF NEW.dictamen_qa = 'Aprobado' THEN

UPDATE lote_produccion SET estado = 'Liberado_Comercial' WHERE id_orden = NEW.id_orden;

UPDATE ordenes_produccion SET estado_orden = 'Completado' WHERE id_orden = NEW.id_orden;

ELSIF NEW.dictamen_qa = 'Rechazado' THEN

UPDATE lote_produccion SET estado = 'Cuarentena_Rechazado' WHERE id_orden = NEW.id_orden;

UPDATE ordenes_produccion SET estado_orden = 'Abortado' WHERE id_orden = NEW.id_orden;

END IF;

RETURN NEW;

END;

$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_qa_automatizador_lotes

AFTER INSERT OR UPDATE ON fichas_calidad

FOR EACH ROW

EXECUTE FUNCTION fn_qa_libera_lote();

--2. Registro Inmutable de Auditoría en Operaciones Sensibles

--Este conjunto de Triggers asegura el principio de no-repudio en el sistema. Actúan silenciosamente detrás de tablas críticas operativas como "pedidos_ventas" y recursos humanos como "usuarios". Si alguien intenta eliminar (DELETE) o modificar (UPDATE) una fila, el Trigger captura la información antigua y la nueva, guardándola de forma inmutable en formato JSON dentro de la estricta tabla de monitoreo "bitacora_auditoria".

CREATE OR REPLACE FUNCTION fn_auditar_tabla() RETURNS TRIGGER AS $$ DECLARE v_user_id INT := 1; -- En Supabase idealmente usar: auth.uid() v_registro_id INT; v_ip_address VARCHAR := current_setting('request.headers', true)::json->>'x-forwarded-for'; BEGIN -- Intentamos extraer el ID de la fila afectada (asumiendo primera columna PK) EXECUTE 'SELECT .' || (SELECT a.attname FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey) WHERE i.indrelid = TG_RELID AND i.indisprimary) INTO v_registro_id USING COALESCE(NEW, OLD);

IF TG_OP = 'DELETE' THEN INSERT INTO bitacora_auditoria(id_usuario, accion_sql, tabla_afectada, registro_id, ip_address, old_data, new_data) VALUES (v_user_id, 'DELETE', TG_TABLE_NAME, v_registro_id, v_ip_address, row_to_json(OLD), NULL); RETURN OLD; ELSIF TG_OP = 'UPDATE' THEN INSERT INTO bitacora_auditoria(id_usuario, accion_sql, tabla_afectada, registro_id, ip_address, old_data, new_data) VALUES (v_user_id, 'UPDATE', TG_TABLE_NAME, v_registro_id, v_ip_address, row_to_json(OLD), row_to_json(NEW)); RETURN NEW; END IF; RETURN NULL; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auditoria_pedidos

AFTER UPDATE OR DELETE ON pedidos_ventas

FOR EACH ROW EXECUTE FUNCTION fn_auditar_tabla();

CREATE TRIGGER trg_auditoria_usuarios

AFTER UPDATE OR DELETE ON usuarios

FOR EACH ROW EXECUTE FUNCTION fn_auditar_tabla();

--Freno Matemático de Inventario (Integridad de Kardex Físico)
--Un Trigger de tipo PRE-Inserción (BEFORE INSERT) diseñado para blindar la tabla "movimientos_kardex". Cuando se trata de efectuar una Salida de almacén (tipo de operación 'OUT'), el disparador calcula el stock volumétrico del ítem sumando todas sus ENTRADAS históricas y restando las SALIDAS previas. Si la cantidad solicitada para el despacho supera el Stock Real del almacén, el Trigger aborta la operación y lanza un mensaje explícito de 'RAISE EXCEPTION' al backend, impidiendo stocks negativos.

CREATE OR REPLACE FUNCTION fn_bloqueo_stock_negativo()

RETURNS TRIGGER AS $$

DECLARE

stock_actual DECIMAL(10,2);

BEGIN

IF NEW.tipo_operacion = 'OUT' THEN

-- SUMA lógica previa de entradas menos salidas

SELECT

(COALESCE((SELECT SUM(cantidad_kilos) FROM movimientos_kardex WHERE id_item = NEW.id_item AND tipo_operacion = 'IN'), 0) -

COALESCE((SELECT SUM(cantidad_kilos) FROM movimientos_kardex WHERE id_item = NEW.id_item AND tipo_operacion = 'OUT'), 0))

INTO stock_actual;

-- Condición de Frenado Abrupto ante Stock Negativo

IF NEW.cantidad_kilos > stock_actual THEN

RAISE EXCEPTION 'FRENO KARDEX ABORTADO: Insuficiente inventario para el SKU ID %. Intentas despachar % Kg pero sólo hay en almacén % Kg.', NEW.id_item, NEW.cantidad_kilos, stock_actual;

END IF;

END IF;

RETURN NEW;

END;

$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kardex_stock

BEFORE INSERT ON movimientos_kardex

FOR EACH ROW

EXECUTE FUNCTION fn_bloqueo_stock_negativo();