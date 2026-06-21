'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ClipboardList, RefreshCw, Search, Eye, EyeOff, FilterX, ChevronLeft, ChevronRight, FileText, UserCheck, Database, Printer, AlertCircle } from 'lucide-react'

import { obtenerLogs, obtenerTablasAfectadas, obtenerAccionesSQL, obtenerMetricas } from './actions'

const STORAGE_KEY = 'grulac_bitacora_filtros'

export default function BitacoraPage() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(25)
  const [tablas, setTablas] = useState([])
  const [acciones, setAcciones] = useState([])
  const [metricas, setMetricas] = useState({ total: 0, hoy: 0, logins: 0 })
  const [expandedId, setExpandedId] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [fechaError, setFechaError] = useState('')
  const supabase = createClient()
  const loadingRef = useRef(false)

  const [filtros, setFiltros] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        try { return JSON.parse(saved) } catch {}
      }
    }
    return { tabla_afectada: '', accion_sql: '', fecha_desde: '', fecha_hasta: '' }
  })
  const [usuarios, setUsuarios] = useState([])
  const [idUsuarioFiltro, setIdUsuarioFiltro] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('grulac_bitacora_usuario') || ''
    }
    return ''
  })

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filtros))
  }, [filtros])

  useEffect(() => {
    if (idUsuarioFiltro) sessionStorage.setItem('grulac_bitacora_usuario', idUsuarioFiltro)
    else sessionStorage.removeItem('grulac_bitacora_usuario')
  }, [idUsuarioFiltro])

  const fetchLogs = useCallback(async (p = page) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    const f = { ...filtros }
    if (idUsuarioFiltro) f.id_usuario = idUsuarioFiltro

    const result = await obtenerLogs(p, pageSize, f)
    if (result.success) {
      setLogs(result.logs)
      setTotal(result.total)
      setRetryCount(0)
    } else {
      if (retryCount < 1) {
        setRetryCount(prev => prev + 1)
        const retryResult = await obtenerLogs(p, pageSize, f)
        if (retryResult.success) {
          setLogs(retryResult.logs)
          setTotal(retryResult.total)
        } else {
          toast.error('Error al cargar bitácora', { description: result.error })
        }
      } else {
        toast.error('Error al cargar bitácora', { description: result.error })
      }
    }
    setLoading(false)
    loadingRef.current = false
  }, [filtros, idUsuarioFiltro, page, pageSize, retryCount])

  useEffect(() => {
    obtenerMetricas().then(setMetricas)
    obtenerTablasAfectadas().then(setTablas)
    obtenerAccionesSQL().then(setAcciones)
    supabase.from('usuarios').select('id_usuario, email_corporativo, empleados(nombre_completo)').order('id_usuario').then(({ data }) => setUsuarios(data || []))
  }, [])

  useEffect(() => {
    fetchLogs(page)
  }, [page])

  const validarFechas = (desde, hasta) => {
    if (desde && hasta && desde > hasta) {
      setFechaError('La fecha desde no puede ser posterior a la fecha hasta')
      return false
    }
    setFechaError('')
    return true
  }

  const handleBuscar = () => {
    if (filtros.fecha_desde && filtros.fecha_hasta && filtros.fecha_desde > filtros.fecha_hasta) {
      setFechaError('La fecha desde no puede ser posterior a la fecha hasta')
      return
    }
    setFechaError('')
    setPage(1)
    fetchLogs(1)
  }

  const handleLimpiar = () => {
    setFiltros({ tabla_afectada: '', accion_sql: '', fecha_desde: '', fecha_hasta: '' })
    setIdUsuarioFiltro('')
    setFechaError('')
    setPage(1)
  }

  const handlePrint = () => {
    window.print()
  }

  const totalPages = Math.ceil(total / pageSize)

  const getAccionBadge = (accion) => {
    const map = {
      'LOGIN': 'bg-green-500/10 text-green-500 border-green-500/20',
      'LOGOUT': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      'INSERT': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'UPDATE': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'DELETE': 'bg-red-500/10 text-red-500 border-red-500/20',
      'ACCESS_LOCKED': 'bg-red-500/10 text-red-500 border-red-500/20',
      'INVITE_USER': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'CAMBIO_PASSWORD': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      'ACTIVATE_ACCOUNT': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'RESET_PASSWORD': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    }
    return map[accion] || 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  }

  const formatJSON = (data) => {
    if (!data) return <span className="text-zinc-600 italic">Sin datos</span>
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      if (typeof parsed === 'string') return <span>{parsed}</span>
      return (
        <div className="space-y-1">
          {Object.entries(parsed).map(([key, val]) => (
            <div key={key} className="flex gap-2 text-xs">
              <span className="text-zinc-500 font-medium min-w-[120px]">{key}:</span>
              <span className="text-zinc-200">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
            </div>
          ))}
        </div>
      )
    } catch {
      return <span className="text-zinc-400">{String(data)}</span>
    }
  }

  const SkeletonRow = () => (
    <TableRow>
      {[1,2,3,4,5,6,7].map(i => (
        <TableCell key={i}>
          <div className="h-4 bg-zinc-800/50 rounded animate-pulse" style={{ width: i === 1 ? '30px' : i === 7 ? '40px' : `${60 + i * 10}px` }} />
        </TableCell>
      ))}
    </TableRow>
  )

  return (
    <>
      {/* Print-only header */}
      <div className="hidden print:block mb-6">
        <div className="text-center border-b border-zinc-700 pb-4 mb-4">
          <h1 className="text-2xl font-bold">GRULAC S.R.L.</h1>
          <p className="text-sm text-zinc-400">Sistema de Gestión ERP — Trazabilidad SENASAG</p>
        </div>
        <h2 className="text-xl font-bold mb-2">Reporte de Auditoría — Bitácora del Sistema</h2>
        <p className="text-xs text-zinc-500 mb-4">
          Generado: {new Date().toLocaleString('es-BO')} |
          Filtros: {filtros.tabla_afectada || 'Todas las tablas'} |
          {filtros.accion_sql || 'Todas las acciones'}
        </p>
        <div className="text-[8px] text-zinc-600 text-center italic mb-4 opacity-50 rotate-[-3deg] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none" style={{ fontSize: '60px', color: 'rgba(255,255,255,0.03)' }}>
          CONFIDENCIAL — TRAZABILIDAD SENASAG
        </div>
      </div>

      <div className="space-y-6 print:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-primary" />
              Bitácora de Auditoría
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Trazabilidad completa de todas las operaciones del sistema GRULAC ERP.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" />
              Exportar Reporte
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setPage(1); fetchLogs(1) }}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refrescar
            </Button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Database className="h-4 w-4" />
                Total Registros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metricas.total}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Eventos de Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metricas.hoy}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Inicios de Sesión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metricas.logins}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="print:hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
            <CardDescription>Refine los registros de la bitácora por tabla, acción, fecha o usuario.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label>Tabla Afectada</Label>
                <Select value={filtros.tabla_afectada} onValueChange={(v) => setFiltros({ ...filtros, tabla_afectada: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las tablas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las tablas</SelectItem>
                    {tablas.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Acción SQL</Label>
                <Select value={filtros.accion_sql} onValueChange={(v) => setFiltros({ ...filtros, accion_sql: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las acciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las acciones</SelectItem>
                    {acciones.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Usuario</Label>
                <Select value={idUsuarioFiltro} onValueChange={setIdUsuarioFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los usuarios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los usuarios</SelectItem>
                    {usuarios.map((u) => (
                      <SelectItem key={u.id_usuario} value={u.id_usuario.toString()}>
                        {u.empleados?.nombre_completo || u.email_corporativo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Fecha Desde</Label>
                <Input
                  type="date"
                  value={filtros.fecha_desde}
                  onChange={(e) => {
                    setFiltros({ ...filtros, fecha_desde: e.target.value })
                    validarFechas(e.target.value, filtros.fecha_hasta)
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label>Fecha Hasta</Label>
                <Input
                  type="date"
                  value={filtros.fecha_hasta}
                  onChange={(e) => {
                    setFiltros({ ...filtros, fecha_hasta: e.target.value })
                    validarFechas(filtros.fecha_desde, e.target.value)
                  }}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleBuscar} disabled={!!fechaError}>
                  <Search className="h-4 w-4 mr-1" />
                  Buscar
                </Button>
                <Button variant="outline" onClick={handleLimpiar}>
                  <FilterX className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              </div>
            </div>
            {fechaError && (
              <div className="flex items-center gap-2 mt-3 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {fechaError}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3 print:pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Registros de Auditoría</CardTitle>
                <CardDescription>
                  {total > 0
                    ? `Mostrando ${Math.min((page - 1) * pageSize + 1, total)}–${Math.min(page * pageSize, total)} de ${total} registros`
                    : 'No se encontraron registros'}
                </CardDescription>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2 print:hidden">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Pág. {page} / {totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-40">Fecha / Hora</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Tabla</TableHead>
                  <TableHead className="w-20">ID Reg.</TableHead>
                  <TableHead className="hidden md:table-cell">Descripción</TableHead>
                  <TableHead className="w-12 print:hidden"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      No se encontraron registros de auditoría para los filtros seleccionados.
                      <br />
                      <span className="text-xs">Intente limpiar los filtros o ampliar el rango de fechas.</span>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id_log} className="hover:bg-zinc-800/30">
                      <TableCell className="font-mono text-xs text-zinc-500">{log.id_log}</TableCell>
                      <TableCell className="text-xs text-zinc-400 whitespace-nowrap">
                        {new Date(log.fecha_hora).toLocaleString('es-BO', {
                          year: 'numeric', month: '2-digit', day: '2-digit',
                          hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{log.usuarios?.empleados?.nombre_completo || log.usuarios?.email_corporativo || <span className="text-zinc-600 italic">Sistema</span>}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`font-mono text-xs whitespace-nowrap ${getAccionBadge(log.accion_sql)}`}>
                          {log.accion_sql}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-zinc-300">{log.tabla_afectada}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-500">{log.registro_id || '—'}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-zinc-400 max-w-[250px] truncate">
                        {log.descripcion}
                      </TableCell>
                      <TableCell className="print:hidden">
                        <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === log.id_log ? null : log.id_log)}>
                          {expandedId === log.id_log ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {logs.map(log => expandedId === log.id_log && (
                  <TableRow key={`detail-${log.id_log}`} className="bg-zinc-900/50">
                    <TableCell colSpan={8} className="p-4 border-t border-zinc-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Información General</h4>
                          <div className="space-y-1">
                            <p><span className="text-zinc-500">ID Log:</span> <span className="font-mono">{log.id_log}</span></p>
                            <p><span className="text-zinc-500">Usuario:</span> {log.usuarios?.empleados?.nombre_completo || log.usuarios?.email_corporativo || 'Sistema'}</p>
                            <p><span className="text-zinc-500">Acción:</span> <Badge variant="outline" className={`font-mono ${getAccionBadge(log.accion_sql)}`}>{log.accion_sql}</Badge></p>
                            <p><span className="text-zinc-500">Tabla:</span> <span className="font-mono">{log.tabla_afectada}</span></p>
                            <p><span className="text-zinc-500">ID Registro:</span> <span className="font-mono">{log.registro_id || '—'}</span></p>
                            <p><span className="text-zinc-500">Fecha/Hora:</span> {new Date(log.fecha_hora).toLocaleString('es-BO')}</p>
                            {log.ip_address && <p><span className="text-zinc-500">IP:</span> <span className="font-mono">{log.ip_address}</span></p>}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Descripción Semántica</h4>
                          <p className="text-sm text-zinc-300">{log.descripcion}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">Datos Anteriores (old_data)</h4>
                          <div className="bg-black/30 p-3 rounded-md border border-zinc-800 max-h-40 overflow-y-auto">
                            {formatJSON(log.old_data)}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Datos Nuevos (new_data)</h4>
                          <div className="bg-black/30 p-3 rounded-md border border-zinc-800 max-h-40 overflow-y-auto">
                            {formatJSON(log.new_data)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
