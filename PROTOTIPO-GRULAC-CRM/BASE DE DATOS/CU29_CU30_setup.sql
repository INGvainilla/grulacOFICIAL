-- =============================================================
-- CU29: Despachos Logísticos (FEFO)
-- CU30: Devoluciones QA
-- Ejecutar en SQL Editor de Supabase (una sola vez)
-- =============================================================

-- 1. Crear tabla despachos_logisticos
CREATE TABLE IF NOT EXISTS despachos_logisticos (
  id_despacho SERIAL PRIMARY KEY,
  id_pedido INTEGER NOT NULL REFERENCES pedidos_ventas(id_pedido) ON DELETE RESTRICT,
  id_encargado INTEGER REFERENCES usuarios(id_usuario),
  placa_camion VARCHAR(20) NOT NULL DEFAULT '',
  nombre_chofer VARCHAR(150) NOT NULL DEFAULT '',
  temperatura_salida DECIMAL(5,2),
  observaciones TEXT DEFAULT '',
  fecha_despacho TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear tabla devoluciones_qa (depende de despachos_logisticos)
CREATE TABLE IF NOT EXISTS devoluciones_qa (
  id_devolucion SERIAL PRIMARY KEY,
  id_despacho INTEGER NOT NULL REFERENCES despachos_logisticos(id_despacho) ON DELETE RESTRICT,
  id_lote INTEGER REFERENCES lote_produccion(id_lote) ON DELETE SET NULL,
  id_asesor INTEGER NOT NULL REFERENCES usuarios(id_usuario),
  motivo_rechazo TEXT NOT NULL,
  kilos_devueltos DECIMAL(10,2) NOT NULL CHECK (kilos_devueltos > 0),
  requiere_reposicion BOOLEAN NOT NULL DEFAULT false,
  id_pedido_reposicion INTEGER REFERENCES pedidos_ventas(id_pedido) ON DELETE SET NULL,
  estado_devolucion VARCHAR(20) NOT NULL DEFAULT 'Registrada' CHECK (estado_devolucion IN ('Registrada','Procesada','Cerrada')),
  observaciones TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar RLS (opcional pero recomendado)
ALTER TABLE despachos_logisticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE devoluciones_qa ENABLE ROW LEVEL SECURITY;

-- 4. Políticas básicas para que la app pueda leer/insertar/actualizar
CREATE POLICY "Lectura anónima despachos" ON despachos_logisticos
  FOR SELECT USING (true);
CREATE POLICY "Inserción autenticada despachos" ON despachos_logisticos
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización autenticada despachos" ON despachos_logisticos
  FOR UPDATE USING (true);

CREATE POLICY "Lectura anónima devoluciones" ON devoluciones_qa
  FOR SELECT USING (true);
CREATE POLICY "Inserción autenticada devoluciones" ON devoluciones_qa
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización autenticada devoluciones" ON devoluciones_qa
  FOR UPDATE USING (true);
