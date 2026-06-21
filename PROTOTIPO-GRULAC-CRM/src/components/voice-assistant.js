'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, MicOff, Loader2, Volume2, ExternalLink, X, AlertTriangle, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { interpretarComando } from '@/lib/voice-commands/interpreter'
import { ejecutarConsultaVoz } from '@/app/(dashboard)/voz/actions'

const ENTITY_ICONS = {
  pedidos_ventas: '🛒',
  factura: '🧾',
  movimientos_kardex: '📦',
  lote_produccion: '🏭',
  fichas_calidad: '🔬',
  bitacora_auditoria: '📋',
  despachos_logisticos: '🚚',
  devoluciones_qa: '↩️',
  catalogo_items: '📁',
  clientes: '🏢',
}

const SUGGESTIONS = [
  'ventas del mes pasado',
  'stock de queso mozzarella',
  'produccion de esta semana',
  'ultimos 10 movimientos del kardex',
  'fichas de calidad de hoy',
  'pedidos pendientes',
  'bitacora de ayer',
  'despachos en ruta',
  'facturas emitidas',
  'lotes proximos a vencer',
]

function formatDate(d) {
  if (!d) return '-'
  try { return new Date(d).toLocaleDateString('es-BO') } catch { return String(d) }
}

function formatDateTime(d) {
  if (!d) return '-'
  try { return new Date(d).toLocaleString('es-BO') } catch { return String(d) }
}

function fmt(n) {
  return Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

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

export default function VoiceAssistant() {
  const [open, setOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [compatible, setCompatible] = useState(true)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) setCompatible(false)
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    setListening(false)
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { setError('E1'); return }

    setError(null)
    setTranscript('')
    setListening(true)

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-BO'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 3

    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1]
      const text = last[0].transcript
      setTranscript(text)

      if (last.isFinal) {
        recognition.stop()
        setListening(false)
        procesarComando(text)
      }
    }

    recognition.onerror = (event) => {
      setListening(false)
      if (event.error === 'not-allowed') setError('E2')
      else if (event.error === 'no-speech') setError('E6')
      else setError('E6')
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [])

  const procesarComando = async (texto) => {
    if (!texto.trim()) return
    setProcessing(true)
    setResult(null)
    setError(null)

    const parsed = interpretarComando(texto)
    if (!parsed.valido) {
      setError('E3')
      setProcessing(false)
      return
    }

    const r = await ejecutarConsultaVoz(parsed)
    if (!r.success) {
      if (r.error === 'comando_no_reconocido') setError('E3')
      else if (r.error === 'tabla_no_existe') setError('E5')
      else setError('E8')
      setProcessing(false)
      return
    }

    if (r.total === 0) {
      setError('E4')
      setProcessing(false)
      return
    }

    setResult(r)
    setProcessing(false)
    if (!open) setOpen(true)
  }

  const leerResultado = useCallback(() => {
    if (!result) return
    const synth = window.speechSynthesis
    if (!synth) return

    const { resumen, entityLabel, total } = result
    let texto = `Reporte de ${entityLabel}. Se encontraron ${total} registros. `

    if (resumen) {
      if (resumen.monto_total) texto += `Monto total: ${resumen.monto_total.toFixed(2)} bolivianos. `
      if (resumen.total_pedidos) texto += `Total de pedidos: ${resumen.total_pedidos}. `
      if (resumen.kilos_entrada) texto += `Kilos de entrada: ${resumen.kilos_entrada.toFixed(2)}. Kilos de salida: ${resumen.kilos_salida.toFixed(2)}. `
      if (resumen.total_lotes) texto += `Total de lotes: ${resumen.total_lotes}. `
      if (resumen.aprobadas !== undefined) texto += `Fichas aprobadas: ${resumen.aprobadas}. Rechazadas: ${resumen.rechazadas}. `
      if (resumen.total_facturas) texto += `Total de facturas: ${resumen.total_facturas}. `
      if (resumen.proximos_a_vencer) texto += `${resumen.proximos_a_vencer} lotes proximos a vencer. `
    }

    const utterance = new SpeechSynthesisUtterance(texto)
    utterance.lang = 'es-BO'
    utterance.rate = 0.9
    synth.speak(utterance)
  }, [result])

  useEffect(() => {
    return () => { stopListening() }
  }, [stopListening])

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'V') {
      e.preventDefault()
      if (listening) stopListening()
      else startListening()
    }
  }, [listening, startListening, stopListening])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!compatible) return null

  const columns = result?.data?.[0] ? Object.keys(result.data[0]).filter((k) => !k.startsWith('_')) : []

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={listening ? stopListening : startListening}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
          listening
            ? 'bg-red-600 scale-110 shadow-red-500/40 animate-pulse'
            : 'bg-primary hover:bg-primary/90'
        }`}
        title={listening ? 'Detener (Ctrl+Shift+V)' : 'Activar voz (Ctrl+Shift+V)'}
      >
        {listening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
      </button>

      {/* Indicador escuchando */}
      {listening && (
        <div className="fixed bottom-24 right-6 z-50 bg-background border border-border rounded-lg p-3 shadow-xl max-w-xs animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-sm font-medium">Escuchando...</span>
          </div>
          {transcript && <p className="text-xs text-muted-foreground italic">&quot;{transcript}&quot;</p>}
          <p className="text-[10px] text-muted-foreground mt-1">Presione el botón o Ctrl+Shift+V para detener</p>
        </div>
      )}

      {/* Modal de respuesta */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {result && <span>{ENTITY_ICONS[result.entity] || '📊'}</span>}
              {result ? result.entityLabel : 'Asistente de Voz'}
            </DialogTitle>
            <DialogDescription>
              {result && (
                <span>Comando: &quot;{result.data?.[0]?._comando || ''}&quot; — Interpretado con {result.confianza}% de confianza</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Procesando */}
          {processing && (
            <div className="flex items-center justify-center py-8 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm text-muted-foreground">Procesando consulta...</span>
            </div>
          )}

          {/* Errores */}
          {error === 'E1' && (
            <div className="flex flex-col items-center py-6 gap-2">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <p className="text-sm font-medium">Navegador no compatible</p>
              <p className="text-xs text-muted-foreground">Use Chrome o Edge para activar la voz.</p>
            </div>
          )}
          {error === 'E2' && (
            <div className="flex flex-col items-center py-6 gap-2">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <p className="text-sm font-medium">Permiso de micrófono denegado</p>
              <p className="text-xs text-muted-foreground">Active el micrófono en la configuración del navegador.</p>
            </div>
          )}
          {error === 'E3' && (
            <div className="flex flex-col items-center py-6 gap-2">
              <HelpCircle className="w-8 h-8 text-amber-500" />
              <p className="text-sm font-medium">No entendí el comando</p>
              <p className="text-xs text-muted-foreground">Intente con frases como:</p>
              <div className="flex flex-wrap gap-1.5 mt-2 justify-center max-w-md">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setOpen(false); procesarComando(s) }}
                    className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 border border-border transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {error === 'E4' && (
            <div className="flex flex-col items-center py-6 gap-2">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <p className="text-sm font-medium">Sin datos para el reporte</p>
              <p className="text-xs text-muted-foreground">No se encontraron registros en el período solicitado. Amplíe el rango de fechas.</p>
            </div>
          )}
          {error === 'E5' && (
            <div className="flex flex-col items-center py-6 gap-2">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <p className="text-sm font-medium">Acceso denegado</p>
              <p className="text-xs text-muted-foreground">No tienes permisos para consultar ese módulo.</p>
            </div>
          )}
          {error === 'E6' && (
            <div className="flex flex-col items-center py-6 gap-2">
              <MicOff className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm font-medium">No detecté voz</p>
              <p className="text-xs text-muted-foreground">Verifique su micrófono o intente nuevamente.</p>
              <Button size="sm" variant="outline" onClick={startListening}>Reintentar</Button>
            </div>
          )}

          {/* Resultados */}
          {result && result.data.length > 0 && (
            <div className="space-y-3">
              {/* Resumen */}
              {result.resumen && (
                <div className="bg-muted/30 rounded-lg p-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {Object.entries(result.resumen).filter(([k]) => k !== '_comando').map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</p>
                      <p className="font-semibold">{typeof v === 'number' ? (k.includes('monto') || k.includes('kilos') ? `${fmt(v)}` : v) : v}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tabla */}
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {result.entity === 'pedidos_ventas' && (
                        <>
                          <TableHead># Pedido</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Total Bs</TableHead>
                          <TableHead>Estado</TableHead>
                        </>
                      )}
                      {result.entity === 'factura' && (
                        <>
                          <TableHead># Factura</TableHead>
                          <TableHead>N°</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Total Bs</TableHead>
                          <TableHead>Estado</TableHead>
                        </>
                      )}
                      {result.entity === 'movimientos_kardex' && (
                        <>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Producto</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Kilos</TableHead>
                          <TableHead>Concepto</TableHead>
                        </>
                      )}
                      {result.entity === 'lote_produccion' && (
                        <>
                          <TableHead>Código</TableHead>
                          <TableHead>Producto</TableHead>
                          <TableHead>Kilos</TableHead>
                          <TableHead>F. Vence</TableHead>
                          <TableHead>Estado</TableHead>
                        </>
                      )}
                      {result.entity === 'fichas_calidad' && (
                        <>
                          <TableHead># Ficha</TableHead>
                          <TableHead>Lote</TableHead>
                          <TableHead>Producto</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Dictamen</TableHead>
                        </>
                      )}
                      {result.entity === 'bitacora_auditoria' && (
                        <>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Acción</TableHead>
                          <TableHead>Tabla</TableHead>
                          <TableHead>Usuario</TableHead>
                        </>
                      )}
                      {result.entity === 'catalogo_items' && (
                        <>
                          <TableHead>SKU</TableHead>
                          <TableHead>Producto</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Unidad</TableHead>
                        </>
                      )}
                      {result.entity === 'clientes' && (
                        <>
                          <TableHead>Cliente</TableHead>
                          <TableHead>NIT</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Ciudad</TableHead>
                        </>
                      )}
                      {result.entity === 'despachos_logisticos' && (
                        <>
                          <TableHead># Despacho</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Placa</TableHead>
                          <TableHead>Chofer</TableHead>
                          <TableHead>Fecha</TableHead>
                        </>
                      )}
                      {result.entity === 'devoluciones_qa' && (
                        <>
                          <TableHead># Dev</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Kilos</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.data.slice(0, 20).map((row, i) => (
                      <TableRow key={row.id_pedido || row.id_factura || row.id_log || row.id_lote || row.id_ficha || row.id_log || row.id_item || row.id_cliente || row.id_despacho || row.id_devolucion || i}>
                        {result.entity === 'pedidos_ventas' && (
                          <>
                            <TableCell className="font-medium">#{row.id_pedido}</TableCell>
                            <TableCell>{row.clientes?.razon_social || '-'}</TableCell>
                            <TableCell className="text-xs">{formatDate(row.fecha_reserva)}</TableCell>
                            <TableCell className="font-mono text-right">{fmt(row.total_pedido)}</TableCell>
                            <TableCell><Badge className={badgeEstado(row.estado_reserva)}>{row.estado_reserva}</Badge></TableCell>
                          </>
                        )}
                        {result.entity === 'factura' && (
                          <>
                            <TableCell className="font-medium">#{row.id_factura}</TableCell>
                            <TableCell className="font-mono">{row.numero_factura}</TableCell>
                            <TableCell>{row.pedidos_ventas?.clientes?.razon_social || '-'}</TableCell>
                            <TableCell className="font-mono text-right">{fmt(row.total_factura)}</TableCell>
                            <TableCell><Badge className={badgeEstado(row.estado)}>{row.estado}</Badge></TableCell>
                          </>
                        )}
                        {result.entity === 'movimientos_kardex' && (
                          <>
                            <TableCell className="text-xs">{formatDateTime(row.fecha_hora)}</TableCell>
                            <TableCell className="text-xs">{row.catalogo_items?.nombre_producto || '-'}</TableCell>
                            <TableCell><Badge className={row.tipo_operacion === 'OUT' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}>{row.tipo_operacion}</Badge></TableCell>
                            <TableCell className="font-mono text-right">{fmt(row.cantidad_kilos)}</TableCell>
                            <TableCell className="text-xs max-w-[150px] truncate">{row.concepto_operacion}</TableCell>
                          </>
                        )}
                        {result.entity === 'lote_produccion' && (
                          <>
                            <TableCell className="font-mono text-xs">{row.codigo_lote}</TableCell>
                            <TableCell className="text-xs">{row.catalogo_items?.nombre_producto || '-'}</TableCell>
                            <TableCell className="font-mono text-right">{fmt(row.cantidad_producida)}</TableCell>
                            <TableCell className="text-xs">{formatDate(row.fecha_vencimiento)}</TableCell>
                            <TableCell><Badge className={badgeEstado(row.estado)}>{row.estado}</Badge></TableCell>
                          </>
                        )}
                        {result.entity === 'fichas_calidad' && (
                          <>
                            <TableCell className="font-medium">#{row.id_ficha}</TableCell>
                            <TableCell className="font-mono text-xs">{row.lote_produccion?.codigo_lote || '-'}</TableCell>
                            <TableCell className="text-xs">{row.lote_produccion?.catalogo_items?.nombre_producto || '-'}</TableCell>
                            <TableCell className="text-xs">{formatDate(row.fecha_evaluacion)}</TableCell>
                            <TableCell><Badge className={row.dictamen_qa === 'Aprobado' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>{row.dictamen_qa}</Badge></TableCell>
                          </>
                        )}
                        {result.entity === 'bitacora_auditoria' && (
                          <>
                            <TableCell className="text-xs">{formatDateTime(row.fecha_hora)}</TableCell>
                            <TableCell><Badge variant="outline">{row.accion_sql}</Badge></TableCell>
                            <TableCell className="text-xs">{row.tabla_afectada}</TableCell>
                            <TableCell className="text-xs">{row.usuarios?.email_corporativo || '-'}</TableCell>
                          </>
                        )}
                        {result.entity === 'catalogo_items' && (
                          <>
                            <TableCell className="font-mono text-xs">{row.codigo_sku}</TableCell>
                            <TableCell>{row.nombre_producto}</TableCell>
                            <TableCell className="text-xs">{row.tipo_item}</TableCell>
                            <TableCell className="text-xs">{row.unidad_medida}</TableCell>
                          </>
                        )}
                        {result.entity === 'clientes' && (
                          <>
                            <TableCell>{row.razon_social}</TableCell>
                            <TableCell className="font-mono text-xs">{row.nit_facturacion || '-'}</TableCell>
                            <TableCell className="text-xs">{row.tipo_cliente}</TableCell>
                            <TableCell className="text-xs">{row.ciudad || '-'}</TableCell>
                          </>
                        )}
                        {result.entity === 'despachos_logisticos' && (
                          <>
                            <TableCell className="font-medium">#{row.id_despacho}</TableCell>
                            <TableCell className="text-xs">{row.pedidos_ventas?.clientes?.razon_social || '-'}</TableCell>
                            <TableCell>{row.placa_camion || '-'}</TableCell>
                            <TableCell className="text-xs">{row.nombre_chofer || '-'}</TableCell>
                            <TableCell className="text-xs">{formatDateTime(row.fecha_despacho)}</TableCell>
                          </>
                        )}
                        {result.entity === 'devoluciones_qa' && (
                          <>
                            <TableCell className="font-medium">#{row.id_devolucion}</TableCell>
                            <TableCell className="text-xs">{row.despachos_logisticos?.pedidos_ventas?.clientes?.razon_social || '-'}</TableCell>
                            <TableCell className="font-mono text-right">{fmt(row.kilos_devueltos)}</TableCell>
                            <TableCell><Badge className={badgeEstado(row.estado_devolucion)}>{row.estado_devolucion}</Badge></TableCell>
                            <TableCell className="text-xs">{formatDateTime(row.created_at)}</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Acciones */}
              <div className="flex justify-between items-center pt-1">
                <p className="text-xs text-muted-foreground">{result.total} registro(s) encontrados</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={leerResultado}>
                    <Volume2 className="w-3.5 h-3.5 mr-1" /> Leer resultado
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setOpen(false); setResult(null) }}>
                    <X className="w-3.5 h-3.5 mr-1" /> Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
