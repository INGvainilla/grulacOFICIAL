# Plan de Implementación: Botones de Reportes PDF/HTML Visibles e Históricos (Incluye Kárdex Dinámico)

Este plan aborda la solicitud del usuario para hacer visibles y accesibles los botones de "Generar Reporte PDF" o "Imprimir HTML" en el ERP, asegurando que no se muestren únicamente de forma transitoria tras registrar la acción, sino también de forma permanente para registros históricos directamente en las tablas y listas de las interfaces, e integrando la funcionalidad de reporte para el **Kárdex Dinámico**.

---

## Cambios Propuestos

### 1. [MODIFY] [CTR_Calidad.js](file:///c:/Users/User/Documents/1-2026/D/grulacOFICIAL/PROTOTIPO-GRULAC-CRM/src/lib/controllers/CTR_Calidad.js)
Añadir tres nuevas funciones de servidor para consultar los registros históricos de control de calidad desde Supabase:
*   `obtenerFichasHistoricas()`: Obtiene todas las Fichas de Calidad registradas ordenadas cronológicamente para el historial en la interfaz de Ficha de Calidad.
*   `obtenerLiberacionesHistoricas()`: Obtiene todos los lotes conformes con estado `Liberado_Comercial`.
*   `obtenerDisposicionesHistoricas()`: Obtiene todos los lotes no conformes con estado `Cuarentena_Rechazado` o `En_Reproceso`.

### 2. [MODIFY] [layout.js (Dashboard)](file:///c:/Users/User/Documents/1-2026/D/grulacOFICIAL/PROTOTIPO-GRULAC-CRM/src/app/(dashboard)/layout.js)
*   Asegurar que la barra lateral (`Sidebar`) y la barra superior (`Topbar`) estén envueltas en contenedores con la clase `print:hidden` para que no estorben ni se muestren en los reportes impresos o PDFs exportados por el navegador.
*   Añadir la clase `print:p-0` al elemento contenedor principal (`main`) para aprovechar el 100% de la hoja A4 al imprimir.

### 3. [MODIFY] [page.js (Acopio)](file:///c:/Users/User/Documents/1-2026/D/grulacOFICIAL/PROTOTIPO-GRULAC-CRM/src/app/(dashboard)/(p6-acopio-formulacion)/acopio/page.js)
*   **Botón Visión General:** En la tabla de recepciones de leche cruda, para todas las cisternas que ya han sido analizadas (estado diferente a `Pendiente`), agregar el botón `Ticket PDF` (icono de impresora) en la columna de Acciones.
*   **Modal de Ticket de Triage:** Implementar un modal dedicado (`showPrintTicket`) que renderice el **Ticket de Triage Lácteo Oficial (CU18)** con el formato oficial de la empresa (membrete GRULAC, parámetros fisicoquímicos detallados, dictamen y firmas del laboratorista y transportista).
*   **Acción de Impresión:** Vincular el botón "Imprimir / Guardar PDF" en el modal a la función nativa `window.print()`.

### 4. [MODIFY] [page.js (Ficha QA)](file:///c:/Users/User/Documents/1-2026/D/grulacOFICIAL/PROTOTIPO-GRULAC-CRM/src/app/(dashboard)/(p8-control-calidad)/calidad/ficha/page.js)
*   **Importar Función Histórica:** Importar `obtenerFichasHistoricas` desde el controlador.
*   **Tabla Histórica:** Añadir una nueva tarjeta (Card) debajo del formulario de laboratorio que contenga la tabla "Historial de Fichas de Calidad Registradas".
*   **Botón de Acción:** Añadir el botón "Ver Reporte" en cada fila.
*   **Modal de Ficha Técnica:** Implementar un modal imprimible (`showPrintFicha`) que renderice el informe detallado de laboratorio (pH, Brix, humedad, salinidad, textura, aspecto y referencia de contramuestras) con estilos de impresión optimizados y botón para `window.print()`.

### 5. [MODIFY] [page.js (Liberación)](file:///c:/Users/User/Documents/1-2026/D/grulacOFICIAL/PROTOTIPO-GRULAC-CRM/src/app/(dashboard)/(p8-control-calidad)/calidad/liberacion/page.js)
*   **Importar Función Histórica:** Importar `obtenerLiberacionesHistoricas` desde el controlador.
*   **Tabla Histórica:** Añadir una nueva tarjeta (Card) debajo de la tabla de lotes conformes llamada "Historial de Lotes Liberados a Almacén".
*   **Reuso del Modal:** Vincular el botón "Ver Certificado" de la tabla de historial al modal imprimible de Certificado de Liberación Comercial existente (`showPrintCertificado`), rellenándolo dinámicamente con los datos de la fila histórica seleccionada.

### 6. [MODIFY] [page.js (Disposición)](file:///c:/Users/User/Documents/1-2026/D/grulacOFICIAL/PROTOTIPO-GRULAC-CRM/src/app/(dashboard)/(p8-control-calidad)/calidad/disposicion/page.js)
*   **Importar Función Histórica:** Importar `obtenerDisposicionesHistoricas` desde el controlador.
*   **Tabla Histórica:** Añadir una tarjeta (Card) con la tabla "Historial de Acciones Restrictivas y Disposiciones" debajo del formulario principal.
*   **Reuso del Modal:** Vincular el botón "Ver Acta" al modal imprimible de Acta de Disposición y Retención de Bioseguridad existente (`showPrintActa`), parseando el campo `observaciones` en JSON para recuperar la justificación técnica, instrucciones de reproceso y fechas de la retención.

### 7. [MODIFY] [page.js (Kárdex Dinámico)](file:///c:/Users/User/Documents/1-2026/D/grulacOFICIAL/PROTOTIPO-GRULAC-CRM/src/app/(dashboard)/(p3-gestion-inventario)/kardex/page.js)
*   **Botón de Reporte:** Añadir un botón "Generar Reporte Kárdex" (icono de impresora) en el encabezado principal de la página, visible para exportar/imprimir los datos actualmente filtrados en la interfaz.
*   **Modal de Reporte de Kárdex:** Crear un modal de impresión estructurado (`showPrintKardex`) que muestre un documento oficial en blanco y negro (estilo corporativo premium):
    *   Logotipo/Membrete de GRULAC S.R.L.
    *   Detalles de los filtros aplicados (Rango de fechas, SKU/Ítem).
    *   Resumen numérico: Total de Ingresos (IN), Total de Egresos (OUT), Ajustes, y el Balance Neto Resultante.
    *   Una tabla compacta optimizada para impresión con los movimientos filtrados y el balance acumulado correspondiente.
    *   Sección de firmas para el Jefe de Inventario/Almacén y la Gerencia de Operaciones.
*   **Acción de Impresión:** Vincular el botón de impresión dentro del modal a `window.print()`.

---

## Plan de Verificación

1.  **Validación de Compilación:** Ejecutar la compilación del Next.js para certificar la ausencia de errores de importación o sintaxis.
2.  **Pruebas de Flujo Visual:**
    *   Ir al panel de Acopio y validar que todas las cisternas procesadas tengan un botón "Ticket PDF" visible y que al hacer click abra el modal de impresión.
    *   Ir a Ficha de Calidad y verificar la grilla de historial de fichas con su botón para imprimir la ficha técnica.
    *   Ir a Liberación y Disposición para validar que se listen los lotes procesados históricamente con su opción de reimpresión respectiva.
    *   Ir al Kárdex Dinámico, filtrar por algún producto o fecha, y verificar que el botón "Generar Reporte Kárdex" abra el modal estructurado mostrando únicamente las operaciones filtradas con su resumen e imprimible limpio.
3.  **Comportamiento de Impresión:** Probar que al abrir cualquier modal e imprimir, el diseño del reporte se visualice correctamente en blanco y negro (estilo oficial) ocultando los elementos del dashboard ERP (`print:hidden`).
