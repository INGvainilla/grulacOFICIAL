-- =====================================================
-- CU07 - Agregar permiso 'respaldos' a roles
-- =====================================================
-- Cada integrante ejecuta esto UNA SOLA VEZ en su SQL Editor.
-- El bucket y las subidas funcionan sin políticas RLS
-- porque el código usa el admin client (service_role).
-- =====================================================

UPDATE roles
SET permisos_json = jsonb_set(permisos_json, '{modulos}', (permisos_json->'modulos') || '["respaldos"]'::jsonb)
WHERE nombre_rol IN ('Jefe Produccion', 'Control Calidad QA')
  AND NOT (permisos_json->'modulos' @> '["respaldos"]');
