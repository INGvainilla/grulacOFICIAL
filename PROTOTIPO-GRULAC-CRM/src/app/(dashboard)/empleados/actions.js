'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function inviteEmpleadoAction(formData) {
  try {
    const supabaseAdmin = createAdminClient()

    const email = formData.email_corporativo.trim()
    const ci_documento = formData.ci_documento.trim()
    
    // Paso 1: Verificar duplicidad de CI primero (antes de Auth)
    const { data: existingCI, error: checkError } = await supabaseAdmin
      .from('empleados')
      .select('id_empleado')
      .eq('ci_documento', ci_documento)
      .maybeSingle()

    if (existingCI) {
      return { error: 'Peligro: Este CI/DNI ya pertenece a otro trabajador en la base de datos.' }
    }

    // Paso 2: Invitar al usuario via Supabase Auth (Crea la cuenta y manda el email)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        nombre: formData.nombre_completo.trim()
      },
      // Hacemos que el link del correo los lleve a definir su contraseña
      redirectTo: 'http://localhost:3000/actualizar-contrasena'
    })

    if (authError) {
      // Manejar error común si el email ya existe en auth
      if (authError.message.includes('already exists') || authError.status === 422) {
        return { error: 'Este correo corporativo ya ha sido invitado o registrado previamente.' }
      }
      return { error: `Error de Autenticación: ${authError.message}` }
    }

    const authUid = authData.user.id

    // Paso 3: Insertar en la tabla public.empleados
    const { data: newEmp, error: empError } = await supabaseAdmin
      .from('empleados')
      .insert([{
        ci_documento: ci_documento,
        nombre_completo: formData.nombre_completo.trim(),
        cargo: formData.cargo.trim() || null,
        telefono: formData.telefono.trim() || null,
        email_personal: email, // Poblamos este dato también para RRHH
      }])
      .select()
      .single()

    if (empError) {
      // Si falla la BD, en un sistema real deberíamos borrar el usuario Auth recién creado (compensación)
      await supabaseAdmin.auth.admin.deleteUser(authUid)
      return { error: `Error DB (Empleados): ${empError.message}` }
    }

    // Paso 4: Insertar en public.usuarios vinculando el auth_uid
    const { error: usrError } = await supabaseAdmin
      .from('usuarios')
      .insert([{
        auth_uid: authUid,
        id_empleado: newEmp.id_empleado,
        id_rol: parseInt(formData.id_rol),
        email_corporativo: email,
        estado_acceso: true,
        intentos_fallidos: 0,
      }])

    if (usrError) {
      // Compensación manual si falla
      await supabaseAdmin.from('empleados').delete().eq('id_empleado', newEmp.id_empleado)
      await supabaseAdmin.auth.admin.deleteUser(authUid)
      return { error: `Error DB (Usuarios): ${usrError.message}` }
    }

    return { success: true }
  } catch (err) {
    console.error('Server Action Error (inviteEmpleado):', err)
    return { error: 'Error interno del servidor al procesar la invitación.' }
  }
}
