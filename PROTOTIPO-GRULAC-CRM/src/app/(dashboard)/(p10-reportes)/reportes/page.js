'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { BarChart3, Mic, MicOff, Loader2, Volume2, ShoppingCart, Receipt, History, Package, FlaskConical, ClipboardList, Truck, Undo2, Building2, AlertTriangle, HelpCircle, TrendingUp, TrendingDown, Calendar, Search } from 'lucide-react'
import { interpretarComando } from '@/lib/voice-commands/interpreter'
import { ejecutarConsultaVoz } from '../../voz/actions'

const REPORTS = [
  { id: 'pedidos_ventas', label: 'Ventas y Pedidos', icon: ShoppingCart, color: 'text-blue-500', desc: 'Pedidos, montos y estados' },
  { id: 'factura', label: 'Facturación', icon: Receipt, color: 'text-green-500', desc: 'Facturas emitidas y pagos' },
  { id: 'movimientos_kardex', label: 'Kardex / Stock', icon: History, color: 'text-cyan-500', desc: 'Movimientos y existencias' },
  { id: 'lote_produccion', label: 'Lotes Producidos', icon: Package, color: 'text-amber-500', desc: 'Producción y vencimientos' },
  { id: 'fichas_calidad', label: 'Control de Calidad', icon: FlaskConical, color: 'text-purple-500', desc: 'Fichas y dictámenes QA' },
  { id: 'bitacora_auditoria', label: 'Bitácora', icon: ClipboardList, color: 'text-zinc-500', desc: 'Registro de auditoría' },
  { id: 'despachos_logisticos', label: 'Despachos', icon: Truck, color: 'text-orange-500', desc: 'Envíos y entregas' },
  { id: 'devoluciones_qa', label: 'Devoluciones', icon: Undo2, color: 'text-red-500', desc: 'Logística inversa' },
  { id: 'clientes', label: 'Clientes', icon: Building2, color: 'text-indigo-500', desc: 'Cartera de clientes' },
]

const QUICK_FILTERS = [
  { label: 'Hoy', timeLabel: 'hoy' },
  { label: 'Ayer', timeLabel: 'ayer' },
  { label: 'Esta Semana', timeLabel: 'esta semana' },
  { label: 'Este Mes', timeLabel: 'este mes' },
  { label: 'Mes Pasado', timeLabel: 'mes pasado' },
]

const SUGGESTIONS = [
  'ventas del mes pasado',
  'stock de queso mozzarella',
  'produccion de esta semana',
  'pedidos pendientes',
  'fichas de calidad de hoy',
  'bitacora de ayer',
  'despachos en ruta',
  'facturas emitidas',
  'lotes proximos a vencer',
  'clientes registrados',
]

const badgeEstado = (estado) => {
  const map = {
    Pendiente: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Confirmado: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    En_Despacho: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    Entregado_Completo: 'bg-green-500/10 text-green-500 border-green-500/20',
    Cancelado: 'bg-red-500/10 text-red-500 border-red-500/20',
    Emitida: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Pagado: 'bg-green-500/10 text-green-500 border-green-500/20',
    Anulada: 'bg-red-500/10 text-red-500 border-red-500/20',
    Registrada: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Procesada: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Cerrada: 'bg-green-500/10 text-green-500 border-green-500/20',
    Liberado_Comercial: 'bg-green-500/10 text-green-500 border-green-500/20',
    Pendiente_QA: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Cuarentena_Rechazado: 'bg-red-500/10 text-red-500 border-red-500/20',
    Agotado: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  }
  return map[estado] || 'bg-zinc-500/10 text-zinc-400'
}

const fmt = (n) => Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-BO') : '-'
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('es-BO') : '-'

const ENTITY_ICONS = {
  pedidos_ventas: ShoppingCart, factura: Receipt, movimientos_kardex: History,
  lote_produccion: Package, fichas_calidad: FlaskConical, bitacora_auditoria: ClipboardList,
  despachos_logisticos: Truck, devoluciones_qa: Undo2, catalogo_items: Package, clientes: Building2,
}

export default function ReportesPage() {
  const [compatible, setCompatible] = useState(true)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [activeEntity, setActiveEntity] = useState(null)
  const recognitionRef = useRef(null)
  const [lastCommand, setLastCommand] = useState('')
  const [timeFilter, setTimeFilter] = useState('')

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) setCompatible(false)
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) { try { recognitionRef.current.stop() } catch {}; recognitionRef.current = null }
    setListening(false)
  }, [])

  const procesarTexto = useCallback(async (texto) => {
    if (!texto.trim()) return
    setProcessing(true)
    setResult(null)
    setError(null)
    setLastCommand(texto)

    let cmd = texto
    if (timeFilter && !texto.toLowerCase().includes(timeFilter)) {
      cmd = `${texto} ${timeFilter}`
    }
    setTranscript(cmd)

    const parsed = interpretarComando(cmd)
    if (!parsed.valido) { setError('E3'); setProcessing(false); return }

    const r = await ejecutarConsultaVoz(parsed)
    if (!r.success) {
      if (r.error === 'tabla_no_existe') setError('E5')
      else setError('E3')
      setProcessing(false)
      return
    }
    if (r.total === 0) { setError('E4'); setProcessing(false); return }

    setResult(r)
    setActiveEntity(r.entity)
    setProcessing(false)
  }, [timeFilter])

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { toast.error('Navegador no compatible'); return }
    setError(null)
    setTranscript('')
    setListening(true)
    const recognition = new SR()
    recognition.lang = 'es-BO'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.onresult = (e) => {
      const last = e.results[e.results.length - 1]
      setTranscript(last[0].transcript)
      if (last.isFinal) { recognition.stop(); setListening(false); procesarTexto(last[0].transcript) }
    }
    recognition.onerror = (e) => {
      setListening(false)
      if (e.error === 'not-allowed') toast.error('Permiso de micrófono denegado')
      else toast.error('No detecté voz. Intente nuevamente.')
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
  }, [procesarTexto])

  const reporteClick = (id) => {
    setActiveEntity(id)
    const labels = { pedidos_ventas: 'ventas', factura: 'facturas', movimientos_kardex: 'kardex', lote_produccion: 'lotes', fichas_calidad: 'fichas de calidad', bitacora_auditoria: 'bitacora', despachos_logisticos: 'despachos', devoluciones_qa: 'devoluciones', clientes: 'clientes' }
    const cmd = timeFilter ? `${labels[id]} ${timeFilter}` : `mostrar ${labels[id]}`
    procesarTexto(cmd)
  }

  const leerResultado = () => {
    if (!result) return
    const synth = window.speechSynthesis
    if (!synth) return
    const { resumen, entityLabel, total } = result
    let texto = `Reporte de ${entityLabel}. Se encontraron ${total} registros. `
    if (resumen) {
      if (resumen.monto_total) texto += `Monto total: ${resumen.monto_total.toFixed(2)} bolivianos. `
      if (resumen.total_pedidos) texto += `Total de pedidos: ${resumen.total_pedidos}. `
      if (resumen.kilos_entrada) texto += `Kilos entrada: ${resumen.kilos_entrada.toFixed(2)}. Kilos salida: ${resumen.kilos_salida.toFixed(2)}. `
      if (resumen.total_lotes) texto += `Total lotes: ${resumen.total_lotes}. `
      if (resumen.aprobadas !== undefined) texto += `Aprobadas: ${resumen.aprobadas}. Rechazadas: ${resumen.rechazadas}. `
      if (resumen.total_facturas) texto += `Total facturas: ${resumen.total_facturas}. `
      if (resumen.proximos_a_vencer) texto += `${resumen.proximos_a_vencer} lotes próximos a vencer. `
    }
    const utterance = new SpeechSynthesisUtterance(texto)
    utterance.lang = 'es-BO'
    utterance.rate = 0.9
    synth.speak(utterance)
  }

  useEffect(() => () => stopListening(), [stopListening])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Reportes e Indicadores</h1>
      </div>

      {/* Barra de voz + filtro temporal */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[250px] space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Comando de voz o texto</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder='Ej: "ventas del mes pasado" o presione el micrófono...'
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') procesarTexto(transcript) }}
                    className="pr-10"
                  />
                  {listening && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                  )}
                </div>
                <Button
                  variant={listening ? 'destructive' : 'default'}
                  size="icon"
                  onClick={listening ? stopListening : startListening}
                  disabled={!compatible}
                  title={listening ? 'Detener' : 'Activar micrófono'}
                >
                  {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button variant="secondary" size="icon" onClick={() => procesarTexto(transcript)} disabled={!transcript.trim() || processing}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              {!compatible && <p className="text-xs text-amber-500">Use Chrome o Edge para comandos de voz.</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Filtro rápido</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Sin filtro" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin filtro</SelectItem>
                  {QUICK_FILTERS.map((f) => <SelectItem key={f.timeLabel} value={f.timeLabel}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sugerencias */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {SUGGESTIONS.slice(0, 5).map((s) => (
              <button key={s} type="button" onClick={() => { setTranscript(s); procesarTexto(s) }}
                className="text-xs px-2 py-1 rounded-md bg-muted/50 hover:bg-muted border border-border transition-colors">
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cards de reportes rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {REPORTS.map((r) => (
          <button key={r.id} type="button" onClick={() => reporteClick(r.id)}
            className={`text-left border rounded-lg p-3 transition-all hover:border-primary/50 hover:shadow-sm ${activeEntity === r.id ? 'ring-2 ring-primary border-primary' : ''}`}>
            <r.icon className={`w-5 h-5 mb-1 ${r.color}`} />
            <p className="text-sm font-medium">{r.label}</p>
            <p className="text-[10px] text-muted-foreground">{r.desc}</p>
          </button>
        ))}
      </div>

      {/* Estado de carga */}
      {processing && (
        <Card>
          <CardContent className="flex items-center justify-center py-8 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm text-muted-foreground">Consultando...</span>
          </CardContent>
        </Card>
      )}

      {/* Error E3: comando no reconocido */}
      {error === 'E3' && !processing && (
        <Card>
          <CardContent className="flex flex-col items-center py-6 gap-2">
            <HelpCircle className="w-8 h-8 text-amber-500" />
            <p className="text-sm font-medium">No entendí el comando</p>
            <p className="text-xs text-muted-foreground">Intente con:</p>
            <div className="flex flex-wrap gap-1.5 mt-1 justify-center max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => { setTranscript(s); procesarTexto(s) }}
                  className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 border border-border">
                  {s}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error E4: sin datos */}
      {error === 'E4' && !processing && (
        <Card>
          <CardContent className="flex flex-col items-center py-6 gap-1">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <p className="text-sm font-medium">Sin datos</p>
            <p className="text-xs text-muted-foreground">No hay registros para el filtro seleccionado. Amplíe el rango de fechas.</p>
          </CardContent>
        </Card>
      )}

      {/* Error E5: sin permisos / tabla no existe */}
      {error === 'E5' && !processing && (
        <Card>
          <CardContent className="flex flex-col items-center py-6 gap-1">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <p className="text-sm font-medium">No disponible</p>
            <p className="text-xs text-muted-foreground">El módulo no está disponible o no tiene permisos para acceder.</p>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {result && !processing && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {(() => { const Icon = ENTITY_ICONS[result.entity]; return Icon ? <Icon className="w-5 h-5" /> : null })()}
                <CardTitle className="text-lg">{result.entityLabel}</CardTitle>
                <CardDescription>{result.total} registro(s) — {result.confianza}% confianza</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={leerResultado}>
                  <Volume2 className="w-3.5 h-3.5 mr-1" /> Leer
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setResult(null); setError(null) }}>
                  Limpiar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.resumen && (
              <div className="bg-muted/30 rounded-lg p-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {Object.entries(result.resumen).map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</p>
                    <p className="font-semibold">{typeof v === 'number' ? (k.includes('monto') || k.includes('kilos') ? `${fmt(v)}` : v) : v}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    {result.entity === 'pedidos_ventas' && <><TableHead>#</TableHead><TableHead>Cliente</TableHead><TableHead>Fecha</TableHead><TableHead>Total Bs</TableHead><TableHead>Estado</TableHead></>}
                    {result.entity === 'factura' && <><TableHead>#</TableHead><TableHead>N° Factura</TableHead><TableHead>Cliente</TableHead><TableHead>Total Bs</TableHead><TableHead>Estado</TableHead></>}
                    {result.entity === 'movimientos_kardex' && <><TableHead>Fecha</TableHead><TableHead>Producto</TableHead><TableHead>Tipo</TableHead><TableHead>Kilos</TableHead></>}
                    {result.entity === 'lote_produccion' && <><TableHead>Código</TableHead><TableHead>Producto</TableHead><TableHead>Kilos</TableHead><TableHead>Vence</TableHead><TableHead>Estado</TableHead></>}
                    {result.entity === 'fichas_calidad' && <><TableHead>#</TableHead><TableHead>Lote</TableHead><TableHead>Producto</TableHead><TableHead>Fecha</TableHead><TableHead>Dictamen</TableHead></>}
                    {result.entity === 'bitacora_auditoria' && <><TableHead>Fecha</TableHead><TableHead>Acción</TableHead><TableHead>Tabla</TableHead><TableHead>Usuario</TableHead></>}
                    {result.entity === 'despachos_logisticos' && <><TableHead>#</TableHead><TableHead>Cliente</TableHead><TableHead>Placa</TableHead><TableHead>Chofer</TableHead><TableHead>Fecha</TableHead></>}
                    {result.entity === 'devoluciones_qa' && <><TableHead>#</TableHead><TableHead>Cliente</TableHead><TableHead>Kilos</TableHead><TableHead>Estado</TableHead><TableHead>Fecha</TableHead></>}
                    {result.entity === 'clientes' && <><TableHead>Cliente</TableHead><TableHead>NIT</TableHead><TableHead>Tipo</TableHead><TableHead>Ciudad</TableHead></>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.data.slice(0, 20).map((row, i) => (
                    <TableRow key={row.id_pedido || row.id_factura || row.id_log || row.id_lote || row.id_ficha || row.id_despacho || row.id_devolucion || row.id_cliente || i}>
                      {result.entity === 'pedidos_ventas' && (
                        <><TableCell className="font-medium">#{row.id_pedido}</TableCell><TableCell>{row.clientes?.razon_social || '-'}</TableCell><TableCell className="text-xs">{fmtDate(row.fecha_reserva)}</TableCell><TableCell className="font-mono text-right">{fmt(row.total_pedido)}</TableCell><TableCell><Badge className={badgeEstado(row.estado_reserva)}>{row.estado_reserva}</Badge></TableCell></>
                      )}
                      {result.entity === 'factura' && (
                        <><TableCell className="font-medium">#{row.id_factura}</TableCell><TableCell className="font-mono">{row.numero_factura}</TableCell><TableCell>{row.pedidos_ventas?.clientes?.razon_social || '-'}</TableCell><TableCell className="font-mono text-right">{fmt(row.total_factura)}</TableCell><TableCell><Badge className={badgeEstado(row.estado)}>{row.estado}</Badge></TableCell></>
                      )}
                      {result.entity === 'movimientos_kardex' && (
                        <><TableCell className="text-xs">{fmtDateTime(row.fecha_hora)}</TableCell><TableCell className="text-xs">{row.catalogo_items?.nombre_producto || '-'}</TableCell><TableCell><Badge className={row.tipo_operacion === 'OUT' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}>{row.tipo_operacion}</Badge></TableCell><TableCell className="font-mono text-right">{fmt(row.cantidad_kilos)}</TableCell></>
                      )}
                      {result.entity === 'lote_produccion' && (
                        <><TableCell className="font-mono text-xs">{row.codigo_lote}</TableCell><TableCell className="text-xs">{row.catalogo_items?.nombre_producto || '-'}</TableCell><TableCell className="font-mono text-right">{fmt(row.cantidad_producida)}</TableCell><TableCell className="text-xs">{fmtDate(row.fecha_vencimiento)}</TableCell><TableCell><Badge className={badgeEstado(row.estado)}>{row.estado}</Badge></TableCell></>
                      )}
                      {result.entity === 'fichas_calidad' && (
                        <><TableCell className="font-medium">#{row.id_ficha}</TableCell><TableCell className="font-mono text-xs">{row.lote_produccion?.codigo_lote || '-'}</TableCell><TableCell className="text-xs">{row.lote_produccion?.catalogo_items?.nombre_producto || '-'}</TableCell><TableCell className="text-xs">{fmtDate(row.fecha_evaluacion)}</TableCell><TableCell><Badge className={row.dictamen_qa === 'Aprobado' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>{row.dictamen_qa}</Badge></TableCell></>
                      )}
                      {result.entity === 'bitacora_auditoria' && (
                        <><TableCell className="text-xs">{fmtDateTime(row.fecha_hora)}</TableCell><TableCell><Badge variant="outline">{row.accion_sql}</Badge></TableCell><TableCell className="text-xs">{row.tabla_afectada}</TableCell><TableCell className="text-xs">{row.usuarios?.email_corporativo || '-'}</TableCell></>
                      )}
                      {result.entity === 'despachos_logisticos' && (
                        <><TableCell className="font-medium">#{row.id_despacho}</TableCell><TableCell className="text-xs">{row.pedidos_ventas?.clientes?.razon_social || '-'}</TableCell><TableCell>{row.placa_camion || '-'}</TableCell><TableCell className="text-xs">{row.nombre_chofer || '-'}</TableCell><TableCell className="text-xs">{fmtDateTime(row.fecha_despacho)}</TableCell></>
                      )}
                      {result.entity === 'devoluciones_qa' && (
                        <><TableCell className="font-medium">#{row.id_devolucion}</TableCell><TableCell className="text-xs">{row.despachos_logisticos?.pedidos_ventas?.clientes?.razon_social || '-'}</TableCell><TableCell className="font-mono text-right">{fmt(row.kilos_devueltos)}</TableCell><TableCell><Badge className={badgeEstado(row.estado_devolucion)}>{row.estado_devolucion}</Badge></TableCell><TableCell className="text-xs">{fmtDateTime(row.created_at)}</TableCell></>
                      )}
                      {result.entity === 'clientes' && (
                        <><TableCell>{row.razon_social}</TableCell><TableCell className="font-mono text-xs">{row.nit_facturacion || '-'}</TableCell><TableCell className="text-xs">{row.tipo_cliente}</TableCell><TableCell className="text-xs">{row.ciudad || '-'}</TableCell></>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado inicial sin consultas */}
      {!result && !processing && !error && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 gap-2 text-muted-foreground">
            <BarChart3 className="w-12 h-12 opacity-20" />
            <p className="text-sm">Seleccione un reporte rápido arriba</p>
            <p className="text-xs">o escriba/pronuncie un comando en la barra de voz</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
