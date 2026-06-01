'use client'

import { useState, useEffect } from 'react'
import { enviarDisposicion, obtenerLotesNoConformes, obtenerDisposicionesHistoricas } from '@/lib/controllers/CTR_Calidad'
import { toast } from 'sonner'
import { ShieldAlert, AlertOctagon, Printer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function DisposicionPage() {
  const [lotes, setLotes] = useState([])
  const [disposicionesHistoricas, setDisposicionesHistoricas] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    idLote: '',
    tipoDisposicion: 'Cuarentena',
    justificacion: '',
    instruccionesReproceso: ''
  })

  // =====================================================
  // ESTADO DE IMPRESIÓN: Acta de Disposición / Incidencia
  // Se activa tras registrar una disposición restrictiva
  // (Cuarentena, Reproceso, Rechazado) para generar
  // el reporte físico de bioseguridad / SENASAG.
  // =====================================================
  const [showPrintActa, setShowPrintActa] = useState(false)
  const [actaDisposicion, setActaDisposicion] = useState(null)

  useEffect(() => {
    loadLotes()
  }, [])

  async function loadLotes() {
    const data = await obtenerLotesNoConformes()
    setLotes(data || [])
    const hist = await obtenerDisposicionesHistoricas()
    setDisposicionesHistoricas(hist || [])
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const loteSeleccionado = lotes.find(f => f.id_lote.toString() === formData.idLote)

    const res = await enviarDisposicion(formData.idLote, formData.tipoDisposicion, formData.justificacion, formData.instruccionesReproceso)

    setIsLoading(false)

    if (res.success) {
      toast.success(res.message)

      // =====================================================
      // Paso del Diagrama de Secuencia CU25:
      //   UI --> QA : Mostrar badge rojo, estado y acta
      //   QA -> UI  : Click "Imprimir Acta"
      //   UI -> UI  : window.print() (Acta Incidencia SENASAG)
      // =====================================================
      setActaDisposicion({
        codigoLote: loteSeleccionado?.lote_produccion?.codigo_lote,
        producto: loteSeleccionado?.lote_produccion?.catalogo_items?.nombre_producto || 'Lácteo Terminado',
        dictamenQa: loteSeleccionado?.dictamen_qa || 'No Conforme',
        tipo: formData.tipoDisposicion,
        justificacion: formData.justificacion,
        instrucciones: formData.instruccionesReproceso,
        fechaRegistro: new Date().toLocaleString('es-BO')
      })
      setShowPrintActa(true)

      setFormData({ idLote: '', tipoDisposicion: 'Cuarentena', justificacion: '', instruccionesReproceso: '' })
      loadLotes() 
    } else {
      toast.error(res.error || 'Error al procesar disposición')
    }
  }

  const handlePrintActa = () => {
    window.print()
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Disposición de Lotes No Conformes</h2>
          <p className="text-muted-foreground">Envía a cuarentena, rechazo o reproceso aquellos lotes que fallaron en el control de calidad.</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-border/50 print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <ShieldAlert className="h-5 w-5" />
            Acción Restrictiva
          </CardTitle>
          <CardDescription>
            Determine el flujo alterno para el lote observado según el protocolo de bioseguridad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="idLote">Seleccionar Lote Observado</Label>
                <Select 
                  value={formData.idLote} 
                  onValueChange={(val) => setFormData({ ...formData, idLote: val })}
                  required
                >
                  <SelectTrigger id="idLote">
                    <SelectValue placeholder="Seleccione un lote no conforme..." />
                  </SelectTrigger>
                  <SelectContent>
                    {lotes.map(f => (
                      <SelectItem key={f.id_lote} value={f.id_lote.toString()}>
                        {f.lote_produccion?.codigo_lote} - Dictamen QA: {f.dictamen_qa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoDisposicion">Tipo de Disposición</Label>
                <Select 
                  value={formData.tipoDisposicion} 
                  onValueChange={(val) => setFormData({ ...formData, tipoDisposicion: val })}
                  required
                >
                  <SelectTrigger id="tipoDisposicion">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cuarentena">Aislar en Cuarentena</SelectItem>
                    <SelectItem value="Reprocesar">Enviar a Reproceso</SelectItem>
                    <SelectItem value="Rechazado">Rechazo Total / Destrucción</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="justificacion">Justificación Técnica e Instrucciones</Label>
              <Textarea
                id="justificacion"
                name="justificacion"
                rows={4}
                required
                value={formData.justificacion}
                onChange={handleChange}
                placeholder="Justifique la decisión e indique las medidas correctivas si corresponde..."
                className="resize-none"
              />
            </div>

            {formData.tipoDisposicion === 'Reprocesar' && (
              <div className="space-y-2 p-4 border border-zinc-800 bg-zinc-950/50 rounded-lg">
                <Label htmlFor="instruccionesReproceso" className="text-zinc-300">
                  Instrucciones de Reproceso (para Jefe de Producción)
                </Label>
                <Textarea
                  id="instruccionesReproceso"
                  name="instruccionesReproceso"
                  rows={3}
                  value={formData.instruccionesReproceso}
                  onChange={handleChange}
                  placeholder="Instrucciones específicas para el reproceso del lote..."
                  className="mt-2 resize-none"
                />
                <p className="mt-2 text-xs text-zinc-500">*Se notificará automáticamente al Jefe de Producción.</p>
              </div>
            )}

            <div className="flex items-center justify-end pt-4 border-t border-border/50">
              <Button
                type="submit"
                disabled={isLoading || !formData.idLote || !formData.justificacion}
                variant="destructive"
                className="gap-2"
              >
                <AlertOctagon className="h-4 w-4" />
                {isLoading ? 'Procesando...' : 'Confirmar Disposición Restrictiva'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-border/50 print:hidden mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <ShieldAlert className="h-5 w-5" />
            Historial de Disposiciones
          </CardTitle>
          <CardDescription>
            Historial de lotes no conformes con acción restrictiva decretada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow>
                  <TableHead>Lote Físico</TableHead>
                  <TableHead>Producto Terminado</TableHead>
                  <TableHead>Estado Lote</TableHead>
                  <TableHead>Dictamen QA</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disposicionesHistoricas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-zinc-500">
                      No hay registros de disposición en el historial.
                    </TableCell>
                  </TableRow>
                ) : disposicionesHistoricas.map((ficha) => {
                  let obs = {}
                  try {
                    obs = JSON.parse(ficha.lote_produccion?.observaciones || '{}')
                  } catch (e) {
                    obs = {}
                  }

                  return (
                    <TableRow key={ficha.id_ficha}>
                      <TableCell className="font-mono text-zinc-300">
                        {ficha.lote_produccion?.codigo_lote}
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {ficha.lote_produccion?.catalogo_items?.nombre_producto}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          ficha.lote_produccion?.estado === 'En_Reproceso' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }>
                          {ficha.lote_produccion?.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {ficha.dictamen_qa}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActaDisposicion({
                              codigoLote: ficha.lote_produccion?.codigo_lote,
                              producto: ficha.lote_produccion?.catalogo_items?.nombre_producto || 'Lácteo Terminado',
                              dictamenQa: ficha.dictamen_qa || 'No Conforme',
                              tipo: obs.tipo_disposicion || 'Cuarentena',
                              justificacion: obs.justificacion_disposicion || 'No especificada',
                              instrucciones: obs.instrucciones_reproceso || '',
                              fechaRegistro: new Date(obs.fecha_disposicion || ficha.fecha_evaluacion).toLocaleString('es-BO')
                            })
                            setShowPrintActa(true)
                          }}
                          className="text-red-400 border-red-500/30 hover:bg-red-500/10 gap-2"
                        >
                          <Printer className="h-4 w-4" /> Ver Acta / PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          MODAL DE IMPRESIÓN: ACTA DE DISPOSICIÓN / RETENCIÓN (SENASAG)
          ===================================================== */}
      {showPrintActa && actaDisposicion && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center print:bg-white print:static print:z-auto">
          {/* Controles del modal — ocultos al imprimir */}
          <div className="absolute top-4 right-4 flex gap-2 print:hidden">
            <Button onClick={handlePrintActa} className="bg-red-600 hover:bg-red-700 gap-2">
              <Printer className="w-4 h-4" /> Imprimir Acta / PDF
            </Button>
            <Button variant="outline" onClick={() => setShowPrintActa(false)}>
              Cerrar
            </Button>
          </div>

          {/* Documento Imprimible: Acta de Incidencia / Disposición */}
          <div className="bg-white text-black w-[700px] max-h-[90vh] overflow-y-auto p-8 rounded-lg shadow-2xl print:shadow-none print:w-full print:max-h-none print:rounded-none print:p-10">
            {/* Cabecera Oficial */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h1 className="text-2xl font-bold tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                GRULAC S.R.L.
              </h1>
              <p className="text-sm text-gray-600 mt-1">Departamento de Calidad y Bioseguridad Alimentaria</p>
              <p className="text-xs text-gray-500">Reglamento Sanitario Interno (Cruce con Normativas SENASAG)</p>
              <div className="mt-3 inline-block px-4 py-1 border-2 border-red-600 bg-red-50 text-red-800">
                <span className="text-lg font-bold tracking-widest" style={{ fontFamily: 'Courier New, monospace' }}>
                  ACTA DE RETENCIÓN Y DISPOSICIÓN
                </span>
              </div>
            </div>

            {/* Datos del Acta */}
            <div className="space-y-4 text-sm mb-6">
              <div className="p-3 bg-red-50/50 border border-red-300 rounded text-red-950">
                <p>
                  <strong>ATENCIÓN:</strong> El lote descrito a continuación ha sido detectado fuera de estándares biológicos/fisicoquímicos y queda retenido en bodega restrictiva. Se prohíbe terminantemente su despacho comercial o mezcla con stock liberado.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded p-4">
                <div>
                  <span className="font-bold">Código de Lote Retenido:</span>{' '}
                  <span style={{ fontFamily: 'Courier New, monospace' }} className="font-bold">{actaDisposicion.codigoLote}</span>
                </div>
                <div>
                  <span className="font-bold">Fecha de Registro:</span>{' '}
                  {actaDisposicion.fechaRegistro}
                </div>
                <div>
                  <span className="font-bold">Producto Afectado:</span>{' '}
                  {actaDisposicion.producto}
                </div>
                <div>
                  <span className="font-bold">Dictamen QA Original:</span>{' '}
                  <span className="text-red-600 font-bold">{actaDisposicion.dictamenQa}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-red-800">Disposición Decretada:</span>{' '}
                  <strong className="underline uppercase">{actaDisposicion.tipo}</strong>
                </div>
              </div>
            </div>

            {/* Justificación Técnica */}
            <div className="border border-gray-300 rounded p-3 mb-6 text-sm">
              <h3 className="font-bold mb-1 text-red-900">JUSTIFICACIÓN TÉCNICA E INCIDENCIA</h3>
              <p className="whitespace-pre-wrap font-mono text-gray-700 bg-gray-50 p-2 border rounded border-gray-200">
                {actaDisposicion.justificacion}
              </p>
            </div>

            {/* Instrucciones de Reproceso (si corresponde) */}
            {actaDisposicion.tipo === 'Reprocesar' && actaDisposicion.instrucciones && (
              <div className="border border-yellow-300 rounded p-3 mb-6 text-sm bg-yellow-50/30">
                <h3 className="font-bold mb-1 text-yellow-900">INSTRUCCIONES DE REPROCESO DE PLANTA</h3>
                <p className="whitespace-pre-wrap font-mono text-gray-700">
                  {actaDisposicion.instrucciones}
                </p>
              </div>
            )}

            {/* Firmas de Responsabilidad */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-4">
              <div className="text-center">
                <div className="border-t border-black pt-2 mx-2">
                  <p className="text-xs font-semibold">Ing. Calidad</p>
                  <p className="text-[10px] text-gray-500">Autor de Retención</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-black pt-2 mx-2">
                  <p className="text-xs font-semibold">Jefe de Producción</p>
                  <p className="text-[10px] text-gray-500">Notificado / Ejecutor</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-black pt-2 mx-2">
                  <p className="text-xs font-semibold">Inspector Sanitario</p>
                  <p className="text-[10px] text-gray-500">Fiscalizador Externo</p>
                </div>
              </div>
            </div>

            {/* Pie de Página */}
            <div className="mt-8 pt-3 border-t border-gray-300 text-center text-xs text-gray-400">
              <p>Documento oficial emitido bajo el Manual de Inocuidad Láctea GRULAC S.R.L.</p>
              <p>Copia archivada automáticamente en la Bitácora Auditora de Calidad.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
