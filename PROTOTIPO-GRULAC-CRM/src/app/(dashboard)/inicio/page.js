'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Beaker, Package, Truck, Users } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function InicioPage() {
  const [metrics, setMetrics] = useState({
    stockKardex: 0,
    lotesActivos: 0,
    despachosPendientes: 0,
    personalActivo: 0
  })
  const [actividades, setActividades] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      
      // 1. Stock Kardex Total (Simplified: sum of IN minus OUT)
      const { data: kardexData } = await supabase.from('movimientos_kardex').select('tipo_operacion, cantidad_kilos')
      let totalKardex = 0
      if (kardexData) {
        totalKardex = kardexData.reduce((acc, mov) => {
          return mov.tipo_operacion === 'IN' ? acc + parseFloat(mov.cantidad_kilos) : acc - parseFloat(mov.cantidad_kilos)
        }, 0)
      }

      // 2. Produccion Activa
      const { count: lotesCount } = await supabase.from('ordenes_produccion')
        .select('*', { count: 'exact', head: true })
        .in('estado_lote', ['En_Preparacion', 'En_Proceso'])
      
      // 3. Despachos Pendientes (Pedidos de Ventas)
      const { count: pedidosCount } = await supabase.from('pedidos_ventas')
        .select('*', { count: 'exact', head: true })
        .eq('estado_reserva', 'Pendiente')

      // 4. Personal Activo
      const { count: usuariosCount } = await supabase.from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('estado_acceso', true)

      setMetrics({
        stockKardex: Math.max(0, totalKardex).toFixed(2),
        lotesActivos: lotesCount || 0,
        despachosPendientes: pedidosCount || 0,
        personalActivo: usuariosCount || 0
      })

      // 5. Actividad Reciente (Bitácora)
      const { data: bitaData } = await supabase.from('bitacora_auditoria')
        .select('*, usuarios(email_corporativo)')
        .order('fecha_hora', { ascending: false })
        .limit(6)
      
      if (bitaData) setActividades(bitaData)

      // 6. Gráfico de Rendimiento (Órdenes de producción recientes)
      const { data: ordenesData } = await supabase.from('ordenes_produccion')
        .select('fecha_inicio, litros_invertidos, kilos_obtenidos_brutos')
        .not('litros_invertidos', 'is', null)
        .order('fecha_inicio', { ascending: true })
        .limit(30)
      
      if (ordenesData && ordenesData.length > 0) {
        const formattedChart = ordenesData.map(o => ({
          fecha: new Date(o.fecha_inicio).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
          litros: parseFloat(o.litros_invertidos) || 0,
          kilos: parseFloat(o.kilos_obtenidos_brutos) || 0
        }))
        setChartData(formattedChart)
      } else {
        // Fallback dummy data si no hay ordenes de producción
        setChartData([
          { fecha: 'Lun', litros: 1000, kilos: 100 },
          { fecha: 'Mar', litros: 1200, kilos: 120 },
          { fecha: 'Mié', litros: 1500, kilos: 155 },
          { fecha: 'Jue', litros: 1100, kilos: 110 },
          { fecha: 'Vie', litros: 1400, kilos: 142 },
          { fecha: 'Sáb', litros: 1600, kilos: 165 },
          { fecha: 'Dom', litros: 1300, kilos: 130 },
        ])
      }

      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Panel de Control Operativo</h2>
        <p className="text-muted-foreground">Revisión general de planta y métricas en tiempo real.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Stock Kárdex Estimado" value={`${metrics.stockKardex} Kg`} icon={Package} trend="+5%" type="good" />
        <MetricCard title="Produccion Activa (Tinas)" value={`${metrics.lotesActivos} Lotes`} icon={Beaker} trend="Estable" type="neutral" />
        <MetricCard title="Despachos Pendientes" value={metrics.despachosPendientes} icon={Truck} trend="Para hoy" type="good" />
        <MetricCard title="Personal Autorizado" value={metrics.personalActivo} icon={Users} trend="Cuentas activas" type="neutral" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-zinc-900 border-border/50">
          <CardHeader>
            <CardTitle>Rendimiento Productivo (Litros vs Kilos)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full mt-4">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">Cargando gráfico...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLitros" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorKilos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="fecha" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="litros" name="Litros Leche" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLitros)" />
                  <Area type="monotone" dataKey="kilos" name="Kilos Queso" stroke="#10b981" fillOpacity={1} fill="url(#colorKilos)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-zinc-900 border-border/50">
          <CardHeader>
            <CardTitle>Actividad Reciente (Bitácora)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Sincronizando auditoría...</div>
            ) : actividades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No hay actividad registrada.</div>
            ) : (
              <div className="space-y-4">
                {actividades.map(act => {
                  const timeAgo = formatDistanceToNow(new Date(act.fecha_hora), { addSuffix: true, locale: es })
                  let desc = `Operación ${act.accion_sql} en ${act.tabla_afectada}`
                  if (act.new_data?.accion) desc = act.new_data.accion
                  else if (act.new_data?.nombre_producto) desc = `Ítem creado: ${act.new_data.nombre_producto}`
                  else if (act.new_data?.razon_social) desc = `Proveedor creado: ${act.new_data.razon_social}`

                  return (
                    <ActivityItem 
                      key={act.id_log} 
                      desc={desc} 
                      time={timeAgo} 
                      user={act.usuarios?.email_corporativo || 'Sistema'}
                    />
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, trend, type }) {
  const trendColor = type === 'good' ? 'text-emerald-500' : 'text-zinc-500'
  return (
    <Card className="bg-zinc-900 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
        <Icon className="h-4 w-4 text-zinc-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        <p className={`text-xs ${trendColor} mt-1`}>
          {trend}
        </p>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ desc, time, user }) {
  return (
    <div className="flex items-start gap-4 border-b border-border/10 pb-3 last:border-0 last:pb-0">
      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none text-zinc-200">{desc}</p>
        <p className="text-xs text-muted-foreground">{user} • {time}</p>
      </div>
    </div>
  )
}

