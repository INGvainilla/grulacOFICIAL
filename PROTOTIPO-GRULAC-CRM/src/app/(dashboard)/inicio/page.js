'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Beaker, Package, Truck, Users } from 'lucide-react'

export default function InicioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Panel de Control Operativo</h2>
        <p className="text-muted-foreground">Revisión general de planta y métricas en tiempo real.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Stock Kárdex Total" value="1,245 Kg" icon={Package} trend="+5%" type="good" />
        <MetricCard title="Produccion Activa (Tinas)" value="2 Lotes" icon={Beaker} trend="Estable" type="neutral" />
        <MetricCard title="Despachos Pendientes" value="4" icon={Truck} trend="-2" type="good" />
        <MetricCard title="Personal Conectado" value="15" icon={Users} trend="Turno A" type="neutral" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-zinc-900 border-border/50">
          <CardHeader>
            <CardTitle>Rendimiento Productivo (Últimos 7 días)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground border-dashed border-2 m-4 rounded-lg border-zinc-800">
            [Gráfico de Área: Litros Leche vs Kilos Queso]
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-zinc-900 border-border/50">
          <CardHeader>
            <CardTitle>Actividad Reciente (Auditoría)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem desc="QA aprobó Lote Mozzarella L-102" time="Hace 10 min" />
              <ActivityItem desc="1500L Ingreso Cisterna La Vía Láctea" time="Hace 45 min" />
              <ActivityItem desc="Factura F-001 Emitida" time="Hace 2 horas" />
              <ActivityItem desc="Ajuste Kárdex - Merma registrada" time="Hace 4 horas" />
            </div>
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
          {trend} desde ayer
        </p>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ desc, time }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-2 h-2 rounded-full bg-primary mt-1" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{desc}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}
