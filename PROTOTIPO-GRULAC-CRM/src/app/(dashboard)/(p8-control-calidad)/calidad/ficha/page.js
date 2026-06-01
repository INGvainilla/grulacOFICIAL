'use client'

import { useState, useEffect } from 'react'
import { registrarFichaQA, obtenerLotesPendientes, obtenerFichasHistoricas } from '@/lib/controllers/CTR_Calidad'
import { toast } from 'sonner'
import { Microscope, CheckCircle2, XCircle, Printer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function FichaCalidadPage() {
  const [lotes, setLotes] = useState([])
  const [fichasHistoricas, setFichasHistoricas] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPrintFicha, setShowPrintFicha] = useState(false)
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null)
  const [formData, setFormData] = useState({
    idLote: '',
    phFinal: '',
    salinidad: '',
    brix: '',
    humedad: '',
    temperaturaEvaluacion: '',
    textura: '',
    aspectoVisual: '',
    refContramuestra: '',
    observaciones: ''
  })
  const [dictamenPrevio, setDictamenPrevio] = useState(null)

  useEffect(() => {
    loadLotes()
  }, [])

  async function loadLotes() {
    const data = await obtenerLotesPendientes()
    setLotes(data || [])
    const hist = await obtenerFichasHistoricas()
    setFichasHistoricas(hist || [])
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Dictamen preliminar visual (semaforo)
  useEffect(() => {
    if (formData.phFinal) {
      const ph = parseFloat(formData.phFinal)
      if (ph >= 4.0 && ph <= 7.5) {
        setDictamenPrevio('Aprobado')
      } else {
        setDictamenPrevio('Rechazado')
      }
    } else {
      setDictamenPrevio(null)
    }
  }, [formData.phFinal])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const res = await registrarFichaQA(formData.idLote, formData)

    setIsLoading(false)

    if (res.success) {
      toast.success(res.message)
      setFormData({ idLote: '', phFinal: '', salinidad: '', brix: '', humedad: '', temperaturaEvaluacion: '', textura: '', aspectoVisual: '', refContramuestra: '', observaciones: '' })
      loadLotes()
    } else {
      toast.error(res.error || 'Error al registrar la ficha')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Registrar Ficha de Calidad</h2>
          <p className="text-muted-foreground">Analiza lotes terminados y emite dictamen de laboratorio (QA).</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-border/50 print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-indigo-400" />
            Inspección de Laboratorio
          </CardTitle>
          <CardDescription>
            Tome la contramuestra del lote seleccionado y complete las variables biométricas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="idLote">Seleccionar Lote Pendiente de QA</Label>
              <Select
                value={formData.idLote}
                onValueChange={(val) => setFormData({ ...formData, idLote: val })}
                required
              >
                <SelectTrigger id="idLote">
                  <SelectValue placeholder="Seleccione un lote..." />
                </SelectTrigger>
                <SelectContent>
                  {lotes.map(l => (
                    <SelectItem key={l.id_lote} value={l.id_lote.toString()}>
                      {l.codigo_lote} - {l.catalogo_items?.nombre_producto} ({l.cantidad_producida} {l.unidad_medida})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phFinal">pH Final</Label>
                <Input
                  type="number"
                  id="phFinal"
                  name="phFinal"
                  step="0.01"
                  min="0"
                  max="14"
                  required
                  value={formData.phFinal}
                  onChange={handleChange}
                  placeholder="Ej: 5.2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brix">Grados Brix</Label>
                <Input
                  type="number"
                  id="brix"
                  name="brix"
                  step="0.1"
                  value={formData.brix}
                  onChange={handleChange}
                  placeholder="Ej: 15.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="humedad">Humedad %</Label>
                <Input
                  type="number"
                  id="humedad"
                  name="humedad"
                  step="0.1"
                  value={formData.humedad}
                  onChange={handleChange}
                  placeholder="Ej: 40.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salinidad">Salinidad %</Label>
                <Input
                  type="number"
                  id="salinidad"
                  name="salinidad"
                  step="0.1"
                  value={formData.salinidad}
                  onChange={handleChange}
                  placeholder="Ej: 2.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="textura">Textura (Escala 1-10)</Label>
                <Input
                  type="number"
                  id="textura"
                  name="textura"
                  min="1"
                  max="10"
                  value={formData.textura}
                  onChange={handleChange}
                  placeholder="Ej: 7"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aspectoVisual">Aspecto Visual</Label>
                <Select
                  value={formData.aspectoVisual}
                  onValueChange={(val) => setFormData({ ...formData, aspectoVisual: val })}
                >
                  <SelectTrigger id="aspectoVisual">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Uniforme">Uniforme</SelectItem>
                    <SelectItem value="Ojos regulares">Ojos regulares</SelectItem>
                    <SelectItem value="Grietas superficiales">Grietas superficiales</SelectItem>
                    <SelectItem value="Deformaciones">Deformaciones</SelectItem>
                    <SelectItem value="Manchas">Manchas / Mohos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refContramuestra">Ref. Contramuestra</Label>
              <Input
                type="text"
                id="refContramuestra"
                name="refContramuestra"
                value={formData.refContramuestra}
                onChange={handleChange}
                placeholder="Ej: CM-2026-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones Técnicas / Microbiológicas</Label>
              <Textarea
                id="observaciones"
                name="observaciones"
                rows={3}
                value={formData.observaciones}
                onChange={handleChange}
                className="resize-none"
              />
            </div>

            {/* Panel Semáforo de Dictamen */}
            <div className={`p-4 rounded-lg flex items-center justify-between border ${!dictamenPrevio ? 'bg-zinc-950/50 border-zinc-800' : dictamenPrevio === 'Aprobado' ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-red-950/30 border-red-900/50'}`}>
              <div>
                <h4 className="text-sm font-medium text-zinc-300">Dictamen Preliminar</h4>
                <p className="text-xs text-zinc-500">Calculado en base a los parámetros ingresados</p>
              </div>
              {dictamenPrevio === 'Aprobado' && (
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-6 w-6" /> APROBADO
                </div>
              )}
              {dictamenPrevio === 'Rechazado' && (
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <XCircle className="h-6 w-6" /> NO CONFORME
                </div>
              )}
              {!dictamenPrevio && (
                <div className="text-zinc-500 text-sm">Esperando datos...</div>
              )}
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-border/50">
              <Button
                type="submit"
                disabled={isLoading || !formData.idLote || !formData.phFinal}
                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                <Microscope className="h-4 w-4" />
                {isLoading ? 'Registrando...' : 'Sellar Ficha de Laboratorio'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-border/50 mt-6 print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-indigo-400" />
            Historial de Fichas de Calidad
          </CardTitle>
          <CardDescription>
            Historial de análisis físico-químicos registrados en planta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow>
                  <TableHead>Lote</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Fecha Evaluación</TableHead>
                  <TableHead>Dictamen</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fichasHistoricas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-zinc-500">
                      No hay fichas registradas.
                    </TableCell>
                  </TableRow>
                ) : fichasHistoricas.map((ficha) => (
                  <TableRow key={ficha.id_ficha}>
                    <TableCell className="font-mono text-zinc-300">
                      {ficha.lote_produccion?.codigo_lote || `Lote #${ficha.id_lote}`}
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {ficha.lote_produccion?.catalogo_items?.nombre_producto || 'Producto Lácteo'}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {new Date(ficha.fecha_evaluacion).toLocaleString('es-BO')}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        ficha.dictamen_qa === 'Aprobado' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        ficha.dictamen_qa === 'Cuarentena' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }>
                        {ficha.dictamen_qa}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setFichaSeleccionada(ficha)
                          setShowPrintFicha(true)
                        }}
                        className="text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10 gap-1"
                      >
                        <Printer className="h-4 w-4" /> Ver Reporte
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          MODAL DE IMPRESIÓN: FICHA TÉCNICA DE CALIDAD (CU23)
          ===================================================== */}
      {showPrintFicha && fichaSeleccionada && (() => {
        let obsObj = {}
        try {
          obsObj = typeof fichaSeleccionada.observaciones_tecnicas === 'string' 
            ? JSON.parse(fichaSeleccionada.observaciones_tecnicas) 
            : (fichaSeleccionada.observaciones_tecnicas || {})
        } catch(e) {
          obsObj = { texto: fichaSeleccionada.observaciones_tecnicas }
        }

        return (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center print:bg-white print:static print:z-auto">
            {/* Controles del modal — ocultos al imprimir */}
            <div className="absolute top-4 right-4 flex gap-2 print:hidden">
              <Button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Printer className="w-4 h-4" /> Imprimir Ficha / PDF
              </Button>
              <Button variant="outline" onClick={() => {
                setShowPrintFicha(false)
                setFichaSeleccionada(null)
              }}>
                Cerrar
              </Button>
            </div>

            {/* Documento Imprimible: Ficha Técnica */}
            <div className="bg-white text-black w-[700px] max-h-[90vh] overflow-y-auto p-8 rounded-lg shadow-2xl print:shadow-none print:w-full print:max-h-none print:rounded-none print:p-10">
              {/* Cabecera Oficial */}
              <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-2xl font-bold tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                  GRULAC S.R.L.
                </h1>
                <p className="text-sm text-gray-600 mt-1">Laboratorio de Control de Calidad y Bioseguridad Láctea</p>
                <p className="text-xs text-gray-500">Reglamento Sanitario y Paramétrico de Producto Terminado</p>
                <div className="mt-3 inline-block px-4 py-1 border-2 border-black">
                  <span className="text-lg font-bold tracking-widest text-indigo-950" style={{ fontFamily: 'Courier New, monospace' }}>
                    FICHA DE CONTROL DE CALIDAD
                  </span>
                </div>
              </div>

              {/* Datos del Lote */}
              <div className="space-y-4 text-sm mb-6">
                <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded p-4">
                  <div>
                    <span className="font-bold">Lote Físico:</span>{' '}
                    <span style={{ fontFamily: 'Courier New, monospace' }} className="font-bold">
                      {fichaSeleccionada.lote_produccion?.codigo_lote || `Lote #${fichaSeleccionada.id_lote}`}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">Fecha Evaluación:</span>{' '}
                    {new Date(fichaSeleccionada.fecha_evaluacion).toLocaleString('es-BO')}
                  </div>
                  <div>
                    <span className="font-bold">Producto Terminado:</span>{' '}
                    {fichaSeleccionada.lote_produccion?.catalogo_items?.nombre_producto}
                  </div>
                  <div>
                    <span className="font-bold">Cantidad Producida:</span>{' '}
                    {fichaSeleccionada.lote_produccion?.cantidad_producida} {fichaSeleccionada.lote_produccion?.catalogo_items?.unidad_medida}
                  </div>
                  <div>
                    <span className="font-bold">Ingeniero QA (Firma):</span>{' '}
                    {fichaSeleccionada.usuarios?.email_corporativo || `Usuario #${fichaSeleccionada.id_ingeniero_qa}`}
                  </div>
                  <div>
                    <span className="font-bold">Ref. Contramuestra:</span>{' '}
                    {obsObj.ref_contramuestra || 'No especificada'}
                  </div>
                </div>
              </div>

              {/* Parámetros Fisicoquímicos y Organolépticos */}
              <h3 className="font-bold text-md mb-2 border-b pb-1 text-gray-800">VARIABLES BIOMÉTRICAS Y DE INOCUIDAD</h3>
              <table className="w-full border-collapse border border-gray-400 text-sm mb-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-3 py-2 text-left font-bold">Variable Evaluada</th>
                    <th className="border border-gray-400 px-3 py-2 text-center font-bold">Resultado</th>
                    <th className="border border-gray-400 px-3 py-2 text-center font-bold">Estándar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 px-3 py-2 font-semibold">pH Final (Crítico)</td>
                    <td className="border border-gray-400 px-3 py-2 text-center font-mono">{fichaSeleccionada.ph_final || '—'}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">4.0 - 7.5</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 px-3 py-2">Grados Brix</td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-mono">{fichaSeleccionada.grados_brix ? `${fichaSeleccionada.grados_brix} °Bx` : '—'}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">0.0 - 30.0 °Bx</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-2">Humedad %</td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-mono">{fichaSeleccionada.humedad_pct ? `${fichaSeleccionada.humedad_pct} %` : '—'}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">20.0 % - 70.0 %</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 px-3 py-2">Salinidad %</td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-mono">{fichaSeleccionada.salinidad ? `${fichaSeleccionada.salinidad} %` : '—'}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">0.0 % - 5.0 %</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">Textura (Escala 1-10)</td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-mono">{obsObj.textura || '—'} / 10</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">Aceptable ≥ 5</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">Aspecto Visual</td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-mono">{obsObj.aspecto_visual || 'Uniforme'}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">Conforme</td>
                  </tr>
                </tbody>
              </table>

              {/* Dictamen Final */}
              <div className="p-4 bg-gray-50 border border-gray-300 rounded mb-6 flex justify-between items-center">
                <div>
                  <span className="font-bold block text-sm">Dictamen de Calidad:</span>
                  <span className="text-xs text-gray-500">Evaluado en base a estándares sanitarios oficiales</span>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-extrabold px-3 py-1 border-2 ${
                    fichaSeleccionada.dictamen_qa === 'Aprobado' ? 'border-green-600 text-green-800 bg-green-50' :
                    fichaSeleccionada.dictamen_qa === 'Cuarentena' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                    'border-red-600 text-red-800 bg-red-50'
                  }`}>
                    {fichaSeleccionada.dictamen_qa?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Observaciones */}
              <div className="border border-gray-300 rounded p-3 mb-6 text-sm">
                <span className="font-bold block mb-1">Observaciones Técnicas:</span>
                <p className="text-gray-700 font-mono bg-gray-50 p-2 rounded min-h-[40px]">{obsObj.texto || 'Sin novedades registradas.'}</p>
              </div>

              {/* Firmas de Autorización */}
              <div className="grid grid-cols-2 gap-8 mt-12 pt-4">
                <div className="text-center">
                  <div className="border-t border-black pt-2 mx-6">
                    <p className="text-sm font-semibold">Ingeniero Evaluador QA</p>
                    <p className="text-xs text-gray-500">Firma Autorizada</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-black pt-2 mx-6">
                    <p className="text-sm font-semibold">Auxiliar de Laboratorio</p>
                    <p className="text-xs text-gray-500">Sello de Control</p>
                  </div>
                </div>
              </div>

              {/* Pie de Página */}
              <div className="mt-8 pt-3 border-t border-gray-300 text-center text-xs text-gray-400">
                <p>Este informe acredita la evaluación biosegura del lote para liberación o retención correspondiente.</p>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
