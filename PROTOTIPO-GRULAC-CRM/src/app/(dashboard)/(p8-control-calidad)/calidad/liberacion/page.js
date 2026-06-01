'use client'

import { useState, useEffect } from 'react'
import { liberarLote, obtenerFichasConformesParaLiberacion, obtenerLiberacionesHistoricas } from '@/lib/controllers/CTR_Calidad'
import { toast } from 'sonner'
import { CheckSquare, PackagePlus, Printer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function LiberacionPage() {
  const [fichas, setFichas] = useState([])
  const [liberacionesHistoricas, setLiberacionesHistoricas] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // =====================================================
  // ESTADO DE IMPRESIÓN: Certificado de Liberación
  // Se activa tras completar la liberación comercial de
  // un lote, permitiendo imprimir el documento oficial.
  // =====================================================
  const [showPrintCertificado, setShowPrintCertificado] = useState(false)
  const [loteLiberado, setLoteLiberado] = useState(null)

  useEffect(() => {
    loadFichas()
  }, [])

  async function loadFichas() {
    const data = await obtenerFichasConformesParaLiberacion()
    setFichas(data || [])
    const hist = await obtenerLiberacionesHistoricas()
    setLiberacionesHistoricas(hist || [])
  }

  const handleLiberar = async (ficha) => {
    if (!window.confirm(`¿Estás seguro de liberar comercialmente el lote ${ficha.lote_produccion?.codigo_lote}?`)) return
    
    setIsLoading(true)
    const res = await liberarLote(ficha.id_lote)
    setIsLoading(false)

    if (res.success) {
      toast.success(res.message)
      
      // =====================================================
      // Paso del Diagrama de Secuencia CU24:
      //   UI --> QA : Mostrar badge verde, nuevo stock y certificado
      //   QA -> UI  : Click "Imprimir Certificado"
      //   UI -> UI  : window.print()
      // =====================================================
      setLoteLiberado({
        codigoLote: ficha.lote_produccion?.codigo_lote,
        producto: ficha.lote_produccion?.catalogo_items?.nombre_producto,
        cantidad: ficha.lote_produccion?.cantidad_producida,
        unidad: ficha.lote_produccion?.catalogo_items?.unidad_medida || 'kg',
        fechaLiberacion: new Date().toLocaleString('es-BO')
      })
      setShowPrintCertificado(true)
      
      loadFichas() // remove from list
    } else {
      toast.error(res.error || 'Error al liberar lote')
    }
  }

  const handlePrintCertificado = () => {
    window.print()
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Liberar Lotes a Almacén</h2>
          <p className="text-muted-foreground">Revisa los lotes con dictamen conforme y libéralos al Kardex.</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-border/50 print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-indigo-400" />
            Lotes Conformes
          </CardTitle>
          <CardDescription>Lotes que aprobaron QA y están listos para despacho comercial.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow>
                  <TableHead>Lote Físico</TableHead>
                  <TableHead>Producto Terminado</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Dictamen QA</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fichas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-zinc-500">
                      No hay lotes conformes pendientes de liberación.
                    </TableCell>
                  </TableRow>
                ) : fichas.map((ficha) => (
                  <TableRow key={ficha.id_ficha}>
                    <TableCell className="font-mono text-zinc-300">
                      {ficha.lote_produccion?.codigo_lote}
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {ficha.lote_produccion?.catalogo_items?.nombre_producto}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {ficha.lote_produccion?.cantidad_producida} {ficha.lote_produccion?.catalogo_items?.unidad_medida}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
                        {ficha.dictamen_qa}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleLiberar(ficha)}
                        disabled={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                      >
                        <PackagePlus className="h-4 w-4" /> 
                        Liberar al Kardex
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-border/50 print:hidden mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-indigo-400" />
            Historial de Lotes Liberados
          </CardTitle>
          <CardDescription>Lotes que ya han sido transferidos formalmente al stock comercial.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow>
                  <TableHead>Lote Físico</TableHead>
                  <TableHead>Producto Terminado</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Fecha Liberación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liberacionesHistoricas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-zinc-500">
                      No hay lotes liberados registrados en el historial.
                    </TableCell>
                  </TableRow>
                ) : liberacionesHistoricas.map((ficha) => (
                  <TableRow key={ficha.id_ficha}>
                    <TableCell className="font-mono text-zinc-300">
                      {ficha.lote_produccion?.codigo_lote}
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {ficha.lote_produccion?.catalogo_items?.nombre_producto}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {ficha.lote_produccion?.cantidad_producida} {ficha.lote_produccion?.catalogo_items?.unidad_medida}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {new Date(ficha.lote_produccion?.fecha_liberacion || ficha.fecha_evaluacion).toLocaleString('es-BO')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setLoteLiberado({
                            codigoLote: ficha.lote_produccion?.codigo_lote,
                            producto: ficha.lote_produccion?.catalogo_items?.nombre_producto,
                            cantidad: ficha.lote_produccion?.cantidad_producida,
                            unidad: ficha.lote_produccion?.catalogo_items?.unidad_medida || 'kg',
                            fechaLiberacion: new Date(ficha.lote_produccion?.fecha_liberacion || ficha.fecha_evaluacion).toLocaleString('es-BO')
                          })
                          setShowPrintCertificado(true)
                        }}
                        className="text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10 gap-2"
                      >
                        <Printer className="h-4 w-4" /> Ver Certificado
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
          MODAL DE IMPRESIÓN: CERTIFICADO DE LIBERACIÓN COMERCIAL
          ===================================================== */}
      {showPrintCertificado && loteLiberado && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center print:bg-white print:static print:z-auto">
          {/* Controles del modal — ocultos al imprimir */}
          <div className="absolute top-4 right-4 flex gap-2 print:hidden">
            <Button onClick={handlePrintCertificado} className="bg-green-600 hover:bg-green-700 gap-2">
              <Printer className="w-4 h-4" /> Imprimir Certificado / PDF
            </Button>
            <Button variant="outline" onClick={() => setShowPrintCertificado(false)}>
              Cerrar
            </Button>
          </div>

          {/* Documento Imprimible: Certificado de Liberación */}
          <div className="bg-white text-black w-[700px] max-h-[90vh] overflow-y-auto p-8 rounded-lg shadow-2xl print:shadow-none print:w-full print:max-h-none print:rounded-none print:p-10">
            {/* Cabecera Oficial */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h1 className="text-2xl font-bold tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                GRULAC S.R.L.
              </h1>
              <p className="text-sm text-gray-600 mt-1">Departamento de Calidad e Inventario de Producto Terminado</p>
              <p className="text-xs text-gray-500">Comunidad Basilio, Carretera Biooceánico — Santa Cruz, Bolivia</p>
              <div className="mt-3 inline-block px-4 py-1 border-2 border-black">
                <span className="text-lg font-bold tracking-widest text-emerald-800" style={{ fontFamily: 'Courier New, monospace' }}>
                  CERTIFICADO DE LIBERACIÓN COMERCIAL
                </span>
              </div>
            </div>

            {/* Datos Técnicos de Liberación */}
            <div className="space-y-4 text-sm mb-6">
              <div className="p-4 bg-gray-50 border border-gray-300 rounded">
                <p className="mb-2">
                  Por el presente documento, el Departamento de Control de Calidad de <strong>GRULAC S.R.L.</strong> certifica que el lote descrito a continuación ha aprobado satisfactoriamente todos los análisis fisicoquímicos y biológicos correspondientes, declarándose <strong>APROBADO Y LIBERADO</strong> para su comercialización y distribución en almacenes centrales.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded p-4">
                <div>
                  <span className="font-bold">Código de Lote:</span>{' '}
                  <span style={{ fontFamily: 'Courier New, monospace' }} className="font-bold">{loteLiberado.codigoLote}</span>
                </div>
                <div>
                  <span className="font-bold">Fecha de Liberación:</span>{' '}
                  {loteLiberado.fechaLiberacion}
                </div>
                <div>
                  <span className="font-bold">Línea de Producto:</span>{' '}
                  {loteLiberado.producto}
                </div>
                <div>
                  <span className="font-bold">Volumen Neto Liberado:</span>{' '}
                  {loteLiberado.cantidad} {loteLiberado.unidad}
                </div>
                <div>
                  <span className="font-bold">Destino Kardex:</span>{' '}
                  Silo / Cámara de Frío de Producto Terminado
                </div>
                <div>
                  <span className="font-bold">Estado Legal:</span>{' '}
                  Apto para Consumo Humano (Acreditado SENASAG)
                </div>
              </div>
            </div>

            {/* Tabla de Acreditación de Calidad */}
            <table className="w-full border-collapse border border-gray-400 text-sm mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-3 py-2 text-left font-bold">Variable Evaluada</th>
                  <th className="border border-gray-400 px-3 py-2 text-center font-bold">Estado de Inspección</th>
                  <th className="border border-gray-400 px-3 py-2 text-center font-bold">Resultado Global</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-3 py-2">Parámetros Fisicoquímicos (pH, Brix)</td>
                  <td className="border border-gray-400 px-3 py-2 text-center">Conforme</td>
                  <td className="border border-gray-400 px-3 py-2 text-center text-green-700 font-bold">APROBADO</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 px-3 py-2">Aspecto Sensorial y Textura</td>
                  <td className="border border-gray-400 px-3 py-2 text-center">Conforme</td>
                  <td className="border border-gray-400 px-3 py-2 text-center text-green-700 font-bold">APROBADO</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2">Integridad de Empaque al Vacío</td>
                  <td className="border border-gray-400 px-3 py-2 text-center">Conforme</td>
                  <td className="border border-gray-400 px-3 py-2 text-center text-green-700 font-bold">APROBADO</td>
                </tr>
              </tbody>
            </table>

            {/* Firmas de Autorización */}
            <div className="grid grid-cols-2 gap-8 mt-12 pt-4">
              <div className="text-center">
                <div className="border-t border-black pt-2 mx-6">
                  <p className="text-sm font-semibold">Ing. Calidad</p>
                  <p className="text-xs text-gray-500">Evaluador Responsable</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-black pt-2 mx-6">
                  <p className="text-sm font-semibold">Jefe de Almacén</p>
                  <p className="text-xs text-gray-500">Recepción Física de Stock</p>
                </div>
              </div>
            </div>

            {/* Pie de Página */}
            <div className="mt-8 pt-3 border-t border-gray-300 text-center text-xs text-gray-400 font-sans">
              <p>Documento generado digitalmente por el Sistema GRULAC ERP. Certificado ID: LIB-{loteLiberado.codigoLote}</p>
              <p>El stock correspondiente ha sido incrementado formalmente en el Kardex Comercial de la empresa.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
