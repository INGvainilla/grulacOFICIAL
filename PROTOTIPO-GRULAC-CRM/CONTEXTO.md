# Contexto del Proyecto: PROTOTIPO GRULAC CRM

Este documento sirve como "memoria caché" para que la IA (Gemini) entienda rápidamente el estado, la arquitectura y el propósito de este proyecto al retomar el trabajo.

## 1. Resumen General
**PROTOTIPO-GRULAC-CRM** es un sistema tipo ERP/CRM diseñado para una empresa del rubro lácteo (se evidencian términos como *Acopio de Leche*, *Insumos*, *Cuajo*, *Cloruro de Calcio*, etc.). El objetivo del sistema es manejar todo el flujo operativo: desde la recolección de materia prima, gestión de inventarios, compras a proveedores, ventas a clientes, hasta la administración de usuarios y roles.

## 2. Stack Tecnológico
*   **Framework Frontend:** Next.js 16.2.4 (App Router).
*   **Librería UI:** React 19.
*   **Estilos:** Tailwind CSS v4.
*   **Componentes UI:** Shadcn UI, Lucide React (iconos), Sonner (notificaciones toast).
*   **Backend / Base de Datos / Auth:** Supabase. Se utiliza `@supabase/ssr` y `@supabase/supabase-js` para interactuar con la base de datos PostgreSQL y la autenticación.
*   **Tema:** Por defecto utiliza un diseño oscuro (Dark Mode) con detalles en tonos esmeralda (Emerald) y zinc.

## 3. Arquitectura de Rutas (`src/app/`)
El proyecto está estructurado utilizando los *Route Groups* de Next.js para organizar lógicamente los módulos de la aplicación, principalmente dentro del entorno autenticado `(dashboard)`:

*   **`login/` / `recuperar-acceso/` / `actualizar-contrasena/`**: Flujos de autenticación de usuarios.
*   **`(dashboard)/`**: Layout principal para usuarios logueados. Contiene los siguientes submódulos:
    *   **`(p2-gestion-usuario)/`**: Gestión de `empleados`, `roles`, y `perfil` del usuario actual.
    *   **`(p3-gestion-inventario)/`**: 
        *   `catalogo`: Maestro de ítems (Materias primas, insumos, productos terminados, empaques).
        *   `kardex`: Control de movimientos (Entradas/Salidas/Saldos) en almacén.
    *   **`(p4-gestion-comercial)/`**: Gestión de `clientes` y presumiblemente ventas.
    *   **`(p5-gestion-proveedores-compras)/`**: Gestión de `proveedores` y registro de `compras`.
    *   **`(p6-acopio-formulacion)/`**: 
        *   `acopio`: Registro de recolección de leche o materia prima principal.
        *   `recetas`: Formulación para la creación de productos terminados.
    *   **`inicio/`**: Dashboard principal o landing interno.

## 4. Patrones de Desarrollo Identificados
1.  **Componentes de Cliente (`'use client'`):** La mayoría de las páginas de los módulos usan `'use client'` para manejar estados de formularios, modales y llamadas directas a Supabase usando el cliente de navegador (`createClient` desde `src/lib/supabase/client.js`).
2.  **Bitácora de Auditoría:** Existe un patrón establecido donde, después de realizar operaciones DML (INSERT, UPDATE) críticas (ej. crear un ítem en el catálogo), se registra la acción en la tabla `bitacora_auditoria` guardando el ID del usuario, la acción SQL, la tabla afectada y el ID del registro.
3.  **UI/UX:** Se hace uso extensivo de los componentes de Shadcn (`Card`, `Table`, `Dialog`, `Badge`, `Button`, `Input`, `Select`). Las validaciones de formularios se hacen de forma manual en el estado y muestran mensajes de error debajo de los inputs.
4.  **Kardex Integrado:** Al crear elementos (como en el catálogo), si se define un "stock inicial", el sistema automáticamente genera un movimiento tipo 'IN' en la tabla `movimientos_kardex`.

## 5. Notas para la IA (Tú)
*   **Al escribir código:** Respeta estrictamente la sintaxis de Next.js App Router y Tailwind v4.
*   **Al interactuar con BD:** Utiliza el cliente de Supabase ya configurado. Recuerda siempre registrar las acciones de inserción o actualización importantes en `bitacora_auditoria` si estás modificando módulos core.
*   **Estética:** Mantén el estilo "Premium" y "Dark" solicitado en los prompts del sistema, usando colores coherentes (`zinc-900`, `emerald-600` para acciones primarias, etc.).
*   **No inventar rutas:** Todo el trabajo modular debe ceñirse a la estructura existente (P2 a P6).
