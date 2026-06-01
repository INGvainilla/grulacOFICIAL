'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { PlusCircle, FlaskConical, Truck, Printer } from 'lucide-react'

export default function AcopioPage() {
  const [recepciones, setRecepciones] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  // Modals
  const [showTicket, setShowTicket] = useState(false)
  const [showTriage, setShowTriage] = useState(false)
  const [recepcionSeleccionada, setRecepcionSeleccionada] = useState(null)
  const [showPrintTicket, setShowPrintTicket] = useState(false)
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null)

  const abrirVerTicket = (recepcion) => {
    setTicketSeleccionado(recepcion)
    setShowPrintTicket(true)
  }

  // Forms
  const [formTicket, setFormTicket] = useState({ id_proveedor: '', litros_recibidos: '', temperatura_celsius: '' })
  const [formTriage, setFormTriage] = useState({
    acidez_dornic: '', acidez_ph: '', celulas_somaticas: '', antibioticos: 'false',
    porcentaje_grasa: '', densidad: '', porcentaje_agua: '', punto_congelamiento: '',
    estado_triage: 'Aceptado', observaciones: ''
  })

  const fetchDatos = async () => {
    setLoading(true)
    const { data: rData, error: rError } = await supabase
      .from('recepciones_leche')
      .select('*, proveedores(razon_social), usuarios!recepciones_leche_id_laboratorista_fkey(email_corporativo)')
      .order('fecha_registro', { ascending: false })

    // Solo ganaderos activos
    const { data: pData } = await supabase.from('proveedores').select('*').eq('tipo_proveedor', 'GANADERO').neq('estado_reputacion', 'Suspendido')

    if (rError) toast.error('Error al cargar recepciones', { description: rError.message })
    else setRecepciones(rData || [])

    setProveedores(pData || [])
    setLoading(false)
  }

  useEffect(() => { fetchDatos() }, [])

  // ==========================================
  // CU17: Registrar Ticket Cisterna
  // ==========================================
  const handleRegistrarTicket = async () => {
    if (!formTicket.id_proveedor || !formTicket.litros_recibidos || !formTicket.temperatura_celsius) return
    setSaving(true)

    // Check Inhabilitado_Bacteriologico
    const prov = proveedores.find(p => p.id_proveedor.toString() === formTicket.id_proveedor)
    if (prov && prov.estado_reputacion === 'Inhabilitado_Bacteriologico') {
      toast.error('Ganadero Bloqueado', { description: 'El proveedor tiene prohibición por fallos bacteriológicos previos.' })
      setSaving(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    let idUsuario = 1
    if (user?.id) {
      const { data: usuario } = await supabase.from('usuarios').select('id_usuario').eq('auth_uid', user.id).single()
      if (usuario?.id_usuario) idUsuario = usuario.id_usuario
    }

    const { error } = await supabase.from('recepciones_leche').insert([{
      id_proveedor: formTicket.id_proveedor,
      id_laboratorista: idUsuario,
      litros_recibidos: parseFloat(formTicket.litros_recibidos),
      temperatura_celsius: parseFloat(formTicket.temperatura_celsius),
      estado_triage: 'Pendiente'
    }])

    if (error) {
      toast.error('Error al registrar ticket', { description: error.message })
    } else {
      // Auditoría: Registro de Cisterna
      await supabase.from('bitacora_auditoria').insert([{
        id_usuario: idUsuario,
        accion_sql: 'INSERT',
        tabla_afectada: 'recepciones_leche',
        registro_id: formTicket.id_proveedor,
        new_data: { accion: 'Llegada de Cisterna', proveedor: formTicket.id_proveedor, litros: formTicket.litros_recibidos, temp: formTicket.temperatura_celsius }
      }])

      toast.success('Ticket Registrado', { description: 'Cisterna en espera de análisis Triage.' })
      setShowTicket(false)
      setFormTicket({ id_proveedor: '', litros_recibidos: '', temperatura_celsius: '' })
      fetchDatos()
    }
    setSaving(false)
  }

  // ==========================================
  // CU18: Registrar Dictamen Triage
  // ==========================================
  const abrirTriage = (recepcion) => {
    setRecepcionSeleccionada(recepcion)
    setFormTriage({
      acidez_dornic: '', acidez_ph: '', celulas_somaticas: '', antibioticos: 'false',
      porcentaje_grasa: '', densidad: '', porcentaje_agua: '', punto_congelamiento: '',
      estado_triage: 'Aceptado', observaciones: ''
    })
    setShowTriage(true)
  }

  const handleTriage = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    let idUsuario = 1
    if (user?.id) {
      const { data: usuario } = await supabase.from('usuarios').select('id_usuario').eq('auth_uid', user.id).single()
      if (usuario?.id_usuario) idUsuario = usuario.id_usuario
    }

    // 1. Update Recepcion
    const { error: updError } = await supabase.from('recepciones_leche').update({
      acidez_dornic: parseFloat(formTriage.acidez_dornic) || null,
      acidez_ph: parseFloat(formTriage.acidez_ph) || null,
      celulas_somaticas: parseInt(formTriage.celulas_somaticas) || null,
      antibioticos: formTriage.antibioticos === 'true',
      porcentaje_grasa: parseFloat(formTriage.porcentaje_grasa) || null,
      densidad: parseFloat(formTriage.densidad) || null,
      porcentaje_agua: parseFloat(formTriage.porcentaje_agua) || null,
      punto_congelamiento: parseFloat(formTriage.punto_congelamiento) || null,
      estado_triage: formTriage.estado_triage,
      observaciones: formTriage.observaciones || null
    }).eq('id_recepcion', recepcionSeleccionada.id_recepcion)

    if (updError) {
      toast.error('Error al guardar Triage', { description: updError.message }); setSaving(false); return
    }

    // Si es Aceptado, ingresar a Kardex (Silo de Leche Cruda)
    if (formTriage.estado_triage === 'Aceptado') {
      // Find item "Leche Cruda" en catalogo
      const { data: itmData } = await supabase.from('catalogo_items').select('id_item').ilike('nombre_producto', '%leche cruda%').limit(1).single()

      if (itmData) {
        await supabase.from('movimientos_kardex').insert([{
          id_item: itmData.id_item,
          id_usuario: idUsuario,
          tipo_operacion: 'IN',
          cantidad_kilos: recepcionSeleccionada.litros_recibidos, // Asumiendo 1 L ~= 1 Kg para simplificar
          concepto_operacion: `Recepción Cisterna #${recepcionSeleccionada.id_recepcion}`
        }])
      }
    }

    // Si es rechazado por antibioticos, inhabilitar proveedor automaticamente
    if (formTriage.estado_triage === 'Rechazado_Antibioticos') {
      await supabase.from('proveedores').update({ estado_reputacion: 'Inhabilitado_Bacteriologico' }).eq('id_proveedor', recepcionSeleccionada.id_proveedor)
      toast.warning('Ganadero Inhabilitado', { description: 'Se ha suspendido al proveedor por presencia de antibióticos.' })
    }

    // Auditoría: Dictamen Triage
    await supabase.from('bitacora_auditoria').insert([{
      id_usuario: idUsuario,
      accion_sql: 'UPDATE',
      tabla_afectada: 'recepciones_leche',
      registro_id: recepcionSeleccionada.id_recepcion,
      new_data: { accion: 'Dictamen de Triage', estado: formTriage.estado_triage, obs: formTriage.observaciones, parametros: formTriage }
    }])

    toast.success('Dictamen Registrado', { description: `El estado final es: ${formTriage.estado_triage}` })
    setShowTriage(false)
    fetchDatos()
    setSaving(false)
  }

  const ESTADO_COLORS = {
    'Pendiente': 'bg-yellow-500/10 text-yellow-500',
    'Aceptado': 'bg-emerald-500/10 text-emerald-500',
    'Observado': 'bg-orange-500/10 text-orange-500',
    'Rechazado_Calidad': 'bg-red-500/10 text-red-500',
    'Rechazado_Antibioticos': 'bg-red-900/50 text-red-300'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Acopio y Triage</h2>
          <p className="text-muted-foreground">Registro de cisternas y evaluación de calidad (SENASAG).</p>
        </div>
        <Button onClick={() => setShowTicket(true)} className="bg-blue-600 hover:bg-blue-700">
          <Truck className="w-4 h-4 mr-2" /> Registrar Cisterna
        </Button>
      </div>

      <Card className="bg-zinc-900 border-border/50 print:hidden">
        <CardContent className="pt-6">
          <Table>
            <TableHeader className="bg-zinc-950/50">
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Ganadero</TableHead>
                <TableHead>Fecha Hora</TableHead>
                <TableHead>Volumen</TableHead>
                <TableHead>Temp. Llegada</TableHead>
                <TableHead>Dictamen QA</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center">Cargando...</TableCell></TableRow>
              ) : recepciones.map(r => (
                <TableRow key={r.id_recepcion}>
                  <TableCell className="font-mono">#{r.id_recepcion}</TableCell>
                  <TableCell className="font-semibold text-white">{r.proveedores?.razon_social}</TableCell>
                  <TableCell>{new Date(r.fecha_registro).toLocaleString()}</TableCell>
                  <TableCell>{r.litros_recibidos} L</TableCell>
                  <TableCell>{r.temperatura_celsius} °C</TableCell>
                  <TableCell><Badge className={ESTADO_COLORS[r.estado_triage] || ''}>{r.estado_triage}</Badge></TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    {r.estado_triage === 'Pendiente' ? (
                      <Button variant="outline" size="sm" onClick={() => abrirTriage(r)} className="text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/10">
                        <FlaskConical className="w-4 h-4 mr-1" /> Analizar Triage
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => abrirVerTicket(r)} className="text-blue-400 border-blue-500/30 hover:bg-blue-500/10 gap-1">
                        <Printer className="w-4 h-4" /> Ticket PDF
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL CU17: NUEVO TICKET */}
      <Dialog open={showTicket} onOpenChange={setShowTicket}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Ticket de Cisterna</DialogTitle>
            <DialogDescription>Ingreso físico a andén antes del Triage Bioquímico.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ganadero / Origen</Label>
              <Select value={formTicket.id_proveedor} onValueChange={(v) => setFormTicket({ ...formTicket, id_proveedor: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccione ganadero" /></SelectTrigger>
                <SelectContent>
                  {proveedores.map(p => <SelectItem key={p.id_proveedor} value={p.id_proveedor.toString()}>{p.razon_social}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Volumen (Litros)</Label>
                <Input type="number" value={formTicket.litros_recibidos} onChange={(e) => setFormTicket({ ...formTicket, litros_recibidos: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Temperatura (°C)</Label>
                <Input type="number" step="0.1" value={formTicket.temperatura_celsius} onChange={(e) => setFormTicket({ ...formTicket, temperatura_celsius: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTicket(false)}>Cancelar</Button>
            <Button onClick={handleRegistrarTicket} disabled={saving}>Registrar Ingreso</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL CU18: DICTAMEN TRIAGE */}
      <Dialog open={showTriage} onOpenChange={setShowTriage}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dictamen Triage Bioquímico</DialogTitle>
            <DialogDescription>Ticket #{recepcionSeleccionada?.id_recepcion} — {recepcionSeleccionada?.proveedores?.razon_social}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Acidez Dornic (°D)</Label>
                <Input type="number" step="0.1" value={formTriage.acidez_dornic} onChange={(e) => setFormTriage({ ...formTriage, acidez_dornic: e.target.value })} placeholder="Ej: 16" />
              </div>
              <div className="space-y-2">
                <Label>pH</Label>
                <Input type="number" step="0.01" value={formTriage.acidez_ph} onChange={(e) => setFormTriage({ ...formTriage, acidez_ph: e.target.value })} placeholder="Ej: 6.65" />
              </div>
              <div className="space-y-2">
                <Label>Porcentaje de Grasa (%)</Label>
                <Input type="number" step="0.1" value={formTriage.porcentaje_grasa} onChange={(e) => setFormTriage({ ...formTriage, porcentaje_grasa: e.target.value })} placeholder="Ej: 3.5" />
              </div>
              <div className="space-y-2">
                <Label>Densidad (g/ml)</Label>
                <Input type="number" step="0.001" value={formTriage.densidad} onChange={(e) => setFormTriage({ ...formTriage, densidad: e.target.value })} placeholder="Ej: 1.030" />
              </div>
              <div className="space-y-2">
                <Label>Agua Agregada (%)</Label>
                <Input type="number" step="0.1" value={formTriage.porcentaje_agua} onChange={(e) => setFormTriage({ ...formTriage, porcentaje_agua: e.target.value })} placeholder="Ideal: 0%" />
              </div>
              <div className="space-y-2">
                <Label>Células Somáticas</Label>
                <Input type="number" value={formTriage.celulas_somaticas} onChange={(e) => setFormTriage({ ...formTriage, celulas_somaticas: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2 p-4 border border-red-900/50 bg-red-950/20 rounded-md">
              <Label className="text-red-400 font-bold">Prueba de Antibióticos</Label>
              <Select value={formTriage.antibioticos} onValueChange={(v) => {
                const st = v === 'true' ? 'Rechazado_Antibioticos' : formTriage.estado_triage
                setFormTriage({ ...formTriage, antibioticos: v, estado_triage: st })
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Negativo (Limpio)</SelectItem>
                  <SelectItem value="true">Positivo (Rechazo Inmediato)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Un positivo inhabilitará permanentemente al proveedor según normativa SENASAG.</p>
            </div>

            <div className="space-y-2">
              <Label>Dictamen Final</Label>
              <Select value={formTriage.estado_triage} onValueChange={(v) => setFormTriage({ ...formTriage, estado_triage: v })} disabled={formTriage.antibioticos === 'true'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aceptado">Aceptado (Pasa a Silo)</SelectItem>
                  <SelectItem value="Observado">Observado (Castigo de precio)</SelectItem>
                  <SelectItem value="Rechazado_Calidad">Rechazado (Acidez/Agua)</SelectItem>
                  <SelectItem value="Rechazado_Antibioticos">Rechazado (Antibióticos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Input value={formTriage.observaciones} onChange={(e) => setFormTriage({ ...formTriage, observaciones: e.target.value })} />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTriage(false)}>Cancelar</Button>
            <Button onClick={handleTriage} disabled={saving} className={formTriage.estado_triage.includes('Rechazado') ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}>
              Guardar Dictamen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =====================================================
          MODAL DE IMPRESIÓN: TICKET BIOQUÍMICO DE TRIAGE (CU18)
          ===================================================== */}
      {showPrintTicket && ticketSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center print:bg-white print:static print:z-auto">
          {/* Controles del modal — ocultos al imprimir */}
          <div className="absolute top-4 right-4 flex gap-2 print:hidden">
            <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Printer className="w-4 h-4" /> Imprimir Ticket / PDF
            </Button>
            <Button variant="outline" onClick={() => {
              setShowPrintTicket(false)
              setTicketSeleccionado(null)
            }}>
              Cerrar
            </Button>
          </div>

          {/* Documento Imprimible: Ticket de Triage */}
          <div className="bg-white text-black w-[700px] max-h-[90vh] overflow-y-auto p-8 rounded-lg shadow-2xl print:shadow-none print:w-full print:max-h-none print:rounded-none print:p-10">
            {/* Cabecera Oficial */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h1 className="text-2xl font-bold tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                GRULAC S.R.L.
              </h1>
              <p className="text-sm text-gray-600 mt-1">Recepción Láctea e Inspección de Triage Sanitario</p>
              <p className="text-xs text-gray-500">Comunidad Basilio, Santa Cruz, Bolivia — Acreditación SENASAG</p>
              <div className="mt-3 inline-block px-4 py-1 border-2 border-black">
                <span className="text-lg font-bold tracking-widest text-blue-900" style={{ fontFamily: 'Courier New, monospace' }}>
                  TICKET BIOQUÍMICO DE CISTERNA
                </span>
              </div>
            </div>

            {/* Datos Generales de la Cisterna */}
            <div className="space-y-4 text-sm mb-6">
              <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded p-4">
                <div>
                  <span className="font-bold">Ticket ID:</span>{' '}
                  <span style={{ fontFamily: 'Courier New, monospace' }} className="font-bold">#{ticketSeleccionado.id_recepcion}</span>
                </div>
                <div>
                  <span className="font-bold">Fecha Registro:</span>{' '}
                  {new Date(ticketSeleccionado.fecha_registro).toLocaleString('es-BO')}
                </div>
                <div>
                  <span className="font-bold">Ganadero / Origen:</span>{' '}
                  {ticketSeleccionado.proveedores?.razon_social}
                </div>
                <div>
                  <span className="font-bold">Volumen Recibido:</span>{' '}
                  {ticketSeleccionado.litros_recibidos} L
                </div>
                <div>
                  <span className="font-bold">Temp. Llegada:</span>{' '}
                  {ticketSeleccionado.temperatura_celsius} °C
                </div>
                <div>
                  <span className="font-bold">Laboratorista:</span>{' '}
                  {ticketSeleccionado.usuarios?.email_corporativo || `User ID: ${ticketSeleccionado.id_laboratorista}`}
                </div>
              </div>
            </div>

            {/* Parámetros de Triage */}
            <h3 className="font-bold text-md mb-2 border-b pb-1 text-gray-800">ANÁLISIS DE LABORATORIO</h3>
            <table className="w-full border-collapse border border-gray-300 text-sm mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left font-bold">Parámetro Evaluado</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-bold">Valor Obtenido</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-bold">Límite Normativo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">Acidez Dornic</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono">{ticketSeleccionado.acidez_dornic ? `${ticketSeleccionado.acidez_dornic} °D` : '—'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">15.0 - 18.0 °D</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2">pH</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono">{ticketSeleccionado.acidez_ph || '—'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">6.6 - 6.8</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">Porcentaje de Grasa</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono">{ticketSeleccionado.porcentaje_grasa ? `${ticketSeleccionado.porcentaje_grasa} %` : '—'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">≥ 3.0 %</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2">Densidad</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono">{ticketSeleccionado.densidad ? `${ticketSeleccionado.densidad} g/ml` : '—'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">1.028 - 1.033 g/ml</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">Agua Agregada (Crioscopía)</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono">{ticketSeleccionado.porcentaje_agua ? `${ticketSeleccionado.porcentaje_agua} %` : '0 %'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">0 %</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2">Células Somáticas</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono">{ticketSeleccionado.celulas_somaticas || '—'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">≤ 400,000 /ml</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 font-bold text-red-600">Presencia de Antibióticos</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono font-bold text-red-600">
                    {ticketSeleccionado.antibioticos ? 'POSITIVO (RECHAZO)' : 'NEGATIVO (LIMPIO)'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-red-600">Debe ser Negativo</td>
                </tr>
              </tbody>
            </table>

            {/* Dictamen Final */}
            <div className="p-4 bg-gray-50 border border-gray-300 rounded mb-6 flex justify-between items-center">
              <div>
                <span className="font-bold block text-sm">Dictamen Sanitario:</span>
                <span className="text-xs text-gray-500">Evaluado según especificaciones de calidad</span>
              </div>
              <div className="text-right">
                <span className={`text-lg font-extrabold px-3 py-1 border-2 ${
                  ticketSeleccionado.estado_triage === 'Aceptado' ? 'border-green-600 text-green-800 bg-green-50' :
                  ticketSeleccionado.estado_triage === 'Observado' ? 'border-orange-500 text-orange-700 bg-orange-50' :
                  'border-red-600 text-red-800 bg-red-50'
                }`}>
                  {ticketSeleccionado.estado_triage?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Observaciones */}
            <div className="border border-gray-300 rounded p-3 mb-6 text-sm">
              <span className="font-bold block mb-1">Observaciones:</span>
              <p className="text-gray-700 font-mono bg-gray-50 p-2 rounded min-h-[40px]">{ticketSeleccionado.observaciones || 'Sin novedades registradas.'}</p>
            </div>

            {/* Firmas */}
            <div className="grid grid-cols-2 gap-8 mt-12 pt-4">
              <div className="text-center">
                <div className="border-t border-black pt-2 mx-6">
                  <p className="text-sm font-semibold">Responsable de Recepción</p>
                  <p className="text-xs text-gray-500">Laboratorio Lácteo</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-black pt-2 mx-6">
                  <p className="text-sm font-semibold">Conductor / Chofer Cisterna</p>
                  <p className="text-xs text-gray-500">Conformidad Ganadero</p>
                </div>
              </div>
            </div>

            {/* Pie de página */}
            <div className="mt-8 pt-3 border-t border-gray-300 text-center text-xs text-gray-400">
              <p>Documento oficial inmutable - Generado por el Módulo de Acopio del ERP de GRULAC S.R.L.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
