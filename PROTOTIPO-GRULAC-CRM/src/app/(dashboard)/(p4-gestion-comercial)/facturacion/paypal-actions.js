'use server'

import { createClient } from '@/lib/supabase/server'

const PAYPAL_API = 'https://api-m.sandbox.paypal.com'

async function getAccessToken() {
  const auth = Buffer.from(`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Error al autenticar con PayPal')
  const data = await res.json()
  return data.access_token
}

export async function createPayPalOrder(idFactura) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  try {
    const { data: factura } = await supabase
      .from('factura')
      .select('id_factura, total_factura, numero_factura, pedidos_ventas!inner(clientes!inner(razon_social))')
      .eq('id_factura', idFactura)
      .single()

    if (!factura) return { success: false, error: 'Factura no encontrada' }
    if (factura.estado === 'Pagado') return { success: false, error: 'La factura ya está pagada' }

    const accessToken = await getAccessToken()

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: String(idFactura),
          description: `Factura N° ${factura.numero_factura} — ${factura.pedidos_ventas?.clientes?.razon_social || ''}`,
          amount: {
            currency_code: 'USD',
            value: Number(factura.total_factura).toFixed(2),
          },
        }],
      }),
    })

    const order = await res.json()
    if (!res.ok) throw new Error(order.message || 'Error al crear orden PayPal')

    return { success: true, orderId: order.id }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function capturePayPalOrder(idFactura, orderId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: u } = await supabase
    .from('usuarios')
    .select('id_usuario')
    .eq('auth_uid', user.id)
    .maybeSingle()
  if (!u) return { success: false, error: 'Usuario no vinculado' }

  try {
    const accessToken = await getAccessToken()

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const capture = await res.json()
    if (!res.ok) throw new Error(capture.message || 'Error al capturar pago PayPal')

    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id
    const status = capture.status === 'COMPLETED' ? 'Completado' : 'Fallido'

    if (status === 'Completado') {
      const { error: updateError } = await supabase
        .from('factura')
        .update({ estado: 'Pagado' })
        .eq('id_factura', idFactura)
      if (updateError) throw updateError

      await supabase.from('pagos_clientes').insert({
        id_factura: idFactura,
        monto_total: parseFloat(capture.purchase_units[0].payments.captures[0].amount.value),
        moneda: 'USD',
        estado: 'Completado',
        paypal_order_id: orderId,
        paypal_capture_id: captureId,
      })

      await supabase.from('bitacora_auditoria').insert({
        id_usuario: u.id_usuario,
        accion_sql: 'UPDATE',
        tabla_afectada: 'factura',
        registro_id: idFactura,
        new_data: { accion: 'Pago con PayPal completado', paypal_order_id: orderId, paypal_capture_id: captureId },
      })
    }

    return { success: true, status, captureId }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
