export const ENTITIES = [
  {
    id: 'pedidos_ventas',
    keywords: ['venta', 'pedido', 'pedidos', 'ventas', 'reserva', 'orden de compra'],
    label: 'Pedidos y Ventas',
    icon: 'ShoppingCart',
    tables: ['pedidos_ventas', 'clientes'],
  },
  {
    id: 'factura',
    keywords: ['factura', 'facturas', 'facturado', 'facturacion'],
    label: 'Facturas Emitidas',
    icon: 'Receipt',
    tables: ['factura', 'pedidos_ventas', 'clientes'],
  },
  {
    id: 'movimientos_kardex',
    keywords: ['stock', 'inventario', 'kardex', 'existencia', 'almacen'],
    label: 'Kardex / Stock',
    icon: 'History',
    tables: ['movimientos_kardex', 'catalogo_items'],
  },
  {
    id: 'lote_produccion',
    keywords: ['lote', 'lotes', 'produccion', 'fabricacion', 'producido'],
    label: 'Lotes de Producción',
    icon: 'Package',
    tables: ['lote_produccion', 'catalogo_items'],
  },
  {
    id: 'fichas_calidad',
    keywords: ['ficha', 'fichas', 'calidad', 'laboratorio', 'qa', 'control calidad'],
    label: 'Fichas de Calidad',
    icon: 'FlaskConical',
    tables: ['fichas_calidad', 'lote_produccion'],
  },
  {
    id: 'bitacora_auditoria',
    keywords: ['bitacora', 'auditoria', 'bitácora', 'log', 'registro'],
    label: 'Bitácora de Auditoría',
    icon: 'ClipboardList',
    tables: ['bitacora_auditoria', 'usuarios'],
  },
  {
    id: 'despachos_logisticos',
    keywords: ['despacho', 'despachos', 'ruta', 'transporte', 'entrega'],
    label: 'Despachos',
    icon: 'Truck',
    tables: ['despachos_logisticos', 'pedidos_ventas', 'clientes'],
  },
  {
    id: 'devoluciones_qa',
    keywords: ['devolucion', 'devoluciones', 'logistica inversa', 'vuelta'],
    label: 'Devoluciones',
    icon: 'Undo2',
    tables: ['devoluciones_qa', 'despachos_logisticos', 'pedidos_ventas', 'clientes'],
  },
  {
    id: 'catalogo_items',
    keywords: ['catalogo', 'producto', 'productos', 'articulo', 'articulos', 'item', 'items'],
    label: 'Catálogo de Productos',
    icon: 'Package',
    tables: ['catalogo_items'],
  },
  {
    id: 'clientes',
    keywords: ['cliente', 'clientes', 'cartera'],
    label: 'Clientes',
    icon: 'Building2',
    tables: ['clientes'],
  },
]

export const TIME_PATTERNS = [
  { regex: /este mes/i, label: 'este mes', buildFilter: () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { gte: start.toISOString(), lte: now.toISOString() }
  }},
  { regex: /mes pasado/i, label: 'mes pasado', buildFilter: () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    return { gte: start.toISOString(), lte: end.toISOString() }
  }},
  { regex: /esta semana/i, label: 'esta semana', buildFilter: () => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const start = new Date(now.setDate(diff))
    start.setHours(0, 0, 0, 0)
    return { gte: start.toISOString(), lte: new Date().toISOString() }
  }},
  { regex: /semana pasada/i, label: 'semana pasada', buildFilter: () => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day - 6 + (day === 0 ? -6 : 1)
    const start = new Date(now.setDate(diff))
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return { gte: start.toISOString(), lte: end.toISOString() }
  }},
  { regex: /hoy/i, label: 'hoy', buildFilter: () => {
    const start = new Date(); start.setHours(0, 0, 0, 0)
    return { gte: start.toISOString(), lte: new Date().toISOString() }
  }},
  { regex: /ayer/i, label: 'ayer', buildFilter: () => {
    const now = new Date()
    const start = new Date(now); start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0)
    const end = new Date(now); end.setDate(end.getDate() - 1); end.setHours(23, 59, 59, 999)
    return { gte: start.toISOString(), lte: end.toISOString() }
  }},
  { regex: /este año/i, label: 'este año', buildFilter: () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    return { gte: start.toISOString(), lte: now.toISOString() }
  }},
  { regex: /ultimos?\s+(\d+)\s+(dias|días)/i, label: 'últimos N días', buildFilter: (matches) => {
    const n = parseInt(matches[1]) || 7
    const start = new Date(); start.setDate(start.getDate() - n)
    return { gte: start.toISOString(), lte: new Date().toISOString() }
  }},
]

export const STATE_WORDS = {
  pedidos_ventas: {
    keywords: ['pendiente', 'confirmado', 'en despacho', 'entregado', 'cancelado'],
    map: { pendiente: 'Pendiente', confirmado: 'Confirmado', 'en despacho': 'En_Despacho', entregado: 'Entregado_Completo', cancelado: 'Cancelado' },
    column: 'estado_reserva',
  },
  lote_produccion: {
    keywords: ['liberado', 'pendiente qa', 'cuarentena', 'rechazado', 'agotado', 'en reproceso'],
    map: { liberado: 'Liberado_Comercial', 'pendiente qa': 'Pendiente_QA', cuarentena: 'Cuarentena_Rechazado', rechazado: 'Cuarentena_Rechazado', agotado: 'Agotado', 'en reproceso': 'En_Reproceso' },
    column: 'estado',
  },
  factura: {
    keywords: ['emitida', 'pagado', 'anulada', 'parcial'],
    map: { emitida: 'Emitida', pagado: 'Pagado', anulada: 'Anulada', parcial: 'Parcial' },
    column: 'estado',
  },
}

export const AGG_WORDS = {
  count: ['cuantos', 'cuantas', 'cuanto', 'cuantos hay', 'total de'],
  sum: ['total', 'suma', 'monto', 'importe'],
  detail: ['mostrar', 'lista', 'cuales', 'cuales son', 'dame', 'ver'],
}
