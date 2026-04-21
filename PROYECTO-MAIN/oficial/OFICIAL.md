Universidad Autónoma Gabriel René Moreno

FACULTAD DE INGENIERÍA EN CIENCIAS DE LA COMPUTACIÓN Y TELECOMUNICACIONES

Integrantes:

Docente: Msc. Ing. Angélica Garzón Cuéllar

Materia: Sistemas De Información I

Gestión: 1-2026

Grupo: 6

SANTA CRUZ - BOLIVIAÍNDICE DE CONTENIDO

1	PERFIL	1

1.1	INTRODUCCIÓN	1

1.2	ANTECEDENTE	2

1.3	JUSTIFICACIÓN	4

1.4	DESCRIPCIÓN DEL PROBLEMA	5

1.5	FORMULACIÓN DEL PROBLEMA	10

1.6	OBJETIVOS	11

1.6.1	Objetivo General	11

1.6.2	Objetivos Específicos	11

1.7	ALCANCE	12

1.7.1	Módulo de Gestión de Usuarios y Seguridad (RBAC)	12

1.7.2	Módulo de Gestión de Proveedores y Ganaderos	12

1.7.3	Módulo de Recepción de Leche Cruda e Inspección Triage	12

1.7.4	Módulo de Inventario de Insumos y Materias Primas	13

1.7.5	Módulo de Gestión de Recetas Lácteas (BOM - Formulación)	13

Módulo de Gestión de Lotes de Producción

Gestiona el historial de lo que se produjo físicamente, diferenciando la orden de producción (pedido interno) del lote terminado. Permite vincular fechas de fabricación, vencimiento y generar una relación trazable con los despachos comerciales.

1.7.6	Módulo de Producción en Planta por Lote	13

1.7.7	Módulo de Control de Calidad y Bioseguridad	14

1.7.8	Módulo de Inventario de Producto Terminado	14

1.7.9	Módulo de Gestión de Pedidos y Directorio Comercial (B2B / B2C)	14

1.7.10	Módulo de Despacho, Ventas y Logística Inversa	15

1.7.11	Módulo de Control Contable Financiero	15

1.7.12	Módulo de Reportes Analíticos Inteligentes	15

1.7.13	Módulo de Repositorio y Gestión Documental Cloud	16

1.7.14	Módulo de Motor Auditor Interno y Control de Trazabilidad Forense	16

1.7.15	Módulo de Automatización de Trabajos Asíncronos (Alertas y Hooks)	16

1.8	ENTREVISTA	17

2	ELEMENTOS DEL SISTEMA BASADO EN COMPUTADORAS	20

2.1	HARDWARE	20

2.1.1	Servidor	20

2.1.2	Cliente	20

2.1.3	Medios de Comunicación	21

2.1.4	Otros Dispositivos	21

2.2	SOFTWARE	22

2.2.1	Servidor	22

2.2.2	Cliente	22

2.2.3	Otro software adicional	22

2.3	DATOS	23

2.4	PROCESOS	23

2.5	GENTE / USUARIO	24

2.6	DOCUMENTO	24

3	TECNOLOGÍA PARA EL DESARROLLO DEL SOFTWARE	25

3.1	Estrategia para el desarrollo del Software	25

3.2	Metodología para el desarrollo del software	26

3.2.1	Características del PUDS	26

3.2.2	Fases del Ciclo de Vida adaptadas al Proyecto:	26

3.2.3	Plan de Iteraciones (Ciclos de Construcción):	27

3.2.4	Características de UML	27

3.2.5	Diagramas utilizados para el proyecto:	27

3.3	HERRAMIENTAS DE DESARROLLO	28

3.3.1	Software	28

3.3.2	Hardware	28

4	FACTIBILIDAD ECONÓMICA Y COSTOS DEL PROYECTO	30

4.1	Análisis de Costos de Desarrollo (Inversión Inicial)	30

4.1.1	Recursos Humanos	30

4.1.2	Hardware Crítico para Operación	30

4.1.3	Software y Servicios Cloud (Año 1)	31

4.1.4	Resumen de la Inversión Inicial	31

4.2	Análisis de Beneficios e Impacto Financiero	31

4.2.1	Beneficios Tangibles (Ahorro Anual Proyectado)	31

4.2.2	Beneficios Intangibles	32

4.3	Indicadores y Conclusión de Viabilidad	32

5	BENEFICIOS ESPERADOS	33

5.1	Beneficios Operacionales y de Gestión (Procesos en Planta)	33

5.2	Beneficios Estratégicos y de Inteligencia de Negocios	33

5.3	Beneficios para el Capital Humano y de Seguridad	34

5.4	Beneficios de Escalado Tecnológico	34

6	MARCO TEÓRICO	35

6.1	Marco Conceptual: Gestión e Industrialización Láctea	35

6.1.1	Trazabilidad Alimentaria	35

6.1.2	Sistemas de Información Industrial	35

6.2	Marco Metodológico: Ingeniería de Software	35

6.2.1	Proceso Unificado de Desarrollo de Software (PUDS)	35

6.3	Lenguaje Unificado de Modelado (UML 2.5)	36

6.3.1	Marco Tecnológico y de Infraestructura	36

6.3.2	Arquitectura de Capas y Single Page Applications (SPA)	36

6.3.3	Bases de Datos Relacionales y Propiedades ACID	36

6.3.4	Backend-as-a-Service (BaaS) y Seguridad a Nivel de Fila (RLS)	36

6.3.5	Entorno de Ejecución Asíncrono (Node.js)	36

7	CAPÍTULO 1: MÉTODO DE ISHIKAWA	37

7.1	IDENTIFICAR EL PROBLEMA	37

7.1.1	LISTA DE PROBLEMAS (Brainstorming)	37

7.1.2	DEPURAR PROBLEMAS	47

7.1.3	LISTA FINAL DE PROBLEMAS	49

7.1.4	PROPIETARIOS DE PROBLEMAS	53

7.1.5	ANÁLISIS DE PROBLEMAS	60

7.1.6	ESTIMACIÓN Y CUANTIFICACIÓN DE PROBLEMAS	63

7.1.7	ALTERNATIVAS DE CAMBIO	66

7.1.8	CONCLUSIÓN Y RECOMENDACIÓN	69

7.1.9	DIAGRAMA DE ISHIKAWA	71

IDENTIFICAR LAS PRINCIPALES CATEGORIAS	78

IDENTIFICAR LAS CAUSAS	78

8	CAPÍTULO 2: MODELO DE NEGOCIO	82

8.1	DIAGRAMA DE ACTIVIDADES	82

8.1.1	Diagrama de Actividades: Procesamiento Lácteo y Auditoría QA	83

8.1.2	Diagrama de Actividades: Pedidos, Despacho y Logística Comercial	85

8.1.3	Diagrama de Actividades: Recepción de Leche Cruda y Triage Bioquímico	86

9	CAPÍTULO 3: FLUJO DE TRABAJO - CAPTURA DE REQUISITOS	87

9.1	Identificar Actores y Casos de Uso	87

9.1.1	Actores	87

9.1.2	Casos de Uso (Lista Base)	88

9.2	Priorizar Casos de Uso	88

9.3	Especificación Detallada de Casos de Uso	92

9.3.1	CICLO 1: Arquitectura de Seguridad y Trazabilidad Base	92

9.3.2	CICLO 2: Catálogo de Reglas y Entidades Base	95

9.3.3	CICLO 3: Procesamiento Diario, Producción y Operativa Comercial	99

9.3.4	CICLO 4: Soporte Analítico, Cloud y Automatización	104

9.4	Estructurar Casos de Uso	109

9.4.1	Diagrama de Casos de Uso: CICLO #1	109

9.4.2	Diagrama de Casos de Uso: CICLO #2	109

9.4.3	Diagrama de Casos de Uso: CICLO #3	110

9.4.4	Diagrama de Casos de Uso: CICLO #4	110

10	CAPÍTULO 4: FLUJO DE TRABAJO - DISEÑO	111

10.1	Diseño de Arquitectura	111

11	FLUJO DE TRABAJO: DISEÑO	112

11.1	Diseño de Arquitectura	112

11.2	Diseño de datos	112

11.2.1	Diseño de datos lógico	112

11.3	Diseño de datos físico	112

ANEXOS	132

PERFIL

INTRODUCCIÓN

En la actualidad, la industria láctea exige altos estándares de control en sus procesos de producción, inventario y calidad. La gestión eficiente de estos procesos es fundamental para garantizar la inocuidad alimentaria, la trazabilidad de los lotes producidos y la rentabilidad de las operaciones. Sin embargo, muchas empresas del sector —especialmente aquellas en etapa de consolidación— aún dependen de métodos manuales y hojas de cálculo para administrar sus actividades diarias, lo cual genera inconsistencias, pérdidas económicas y dificultades en la toma de decisiones.

Grupo Lácteo S.R.L. — GRULAC S.R.L. — es una empresa de reciente creación dedicada a la producción de derivados lácteos. Desde su fundación, la empresa ha evidenciado la necesidad urgente de contar con una herramienta tecnológica que centralice y automatice la gestión de sus procesos productivos, de inventario, control de calidad y despacho.

El presente proyecto propone el desarrollo de un Sistema Integral de Gestión para GRULAC S.R.L., una solución de software que permitirá digitalizar y optimizar los procesos clave de la empresa, brindando visibilidad en tiempo real sobre el stock de materias primas e insumos, el estado de la producción por lote y el control de calidad, entre otros. El sistema será desarrollado con tecnologías modernas: Node.js con Express en el backend, Next.js en el frontend, PostgreSQL como base de datos relacional, y Supabase para autenticación, seguridad y almacenamiento de archivos.

ANTECEDENTE

GRULAC S.R.L. (Grupo Lácteo Sociedad de Responsabilidad Limitada) es una empresa privada de reciente creación, con aproximadamente seis meses de operación al momento de la elaboración del presente proyecto. La empresa surge como iniciativa de una asociación de ganaderos de la comunidad Basilio, ubicada sobre la carretera Biooceánico, quienes identificaron la necesidad de generar valor agregado a la producción lechera local y apoyar el crecimiento económico de las pequeñas colonias ganaderas de la región.

La empresa se encuentra orientada al rubro agroindustrial, específicamente a la elaboración y comercialización de derivados lácteos. Sus principales productos son:

Queso Mozzarella

Queso Cheddar

Dulce de Leche Repostero

Dulce de Leche Familiar

Actualmente la empresa no cuenta con un organigrama formal consolidado, dado que se encuentra en proceso de estructuración organizacional. El personal operativo está distribuido en múltiples áreas, entre ellas: producción, control de calidad, envasado y despacho.

Fortalezas identificadas

Producción con materia prima fresca proveniente de ganado local, garantizando insumos de calidad.

Respaldo de una asociación de ganaderos con acceso asegurado a leche cruda.

Demanda creciente del mercado para productos lácteos artesanales y frescos.

Personal técnico calificado en el área de control de calidad e ingeniería industrial.

Procesos en etapa de estandarización, con apertura a la implementación de tecnología.

Capacidad de escalar la producción al contar con proveedores estables de materia prima.

JUSTIFICACIÓN

La selección de GRULAC S.R.L. como caso de estudio para el desarrollo del presente proyecto responde a la identificación de necesidades tecnológicas concretas y urgentes que la empresa presenta en su operativa diaria. Se trata de una organización en pleno proceso de consolidación que actualmente gestiona todos sus procesos —producción, inventario, control de calidad y despacho— de forma manual, mediante hojas de cálculo en Microsoft Excel y registros físicos en formularios impresos.

Esta forma de trabajo, si bien ha permitido que la empresa funcione en sus primeros meses, presenta limitaciones evidentes: duplicidad de datos, falta de visibilidad del stock en tiempo real, imposibilidad de realizar trazabilidad de lotes de producción, y ausencia de alertas ante niveles mínimos de insumos, lo que ha derivado en situaciones críticas como producir para el día siguiente sin contar con reserva de producto terminado.

Se eligió este proyecto porque representa una oportunidad real de aplicar los conocimientos adquiridos en ingeniería de sistemas para resolver una problemática tangible en una empresa del sector productivo local. El desarrollo de un sistema integral no solo beneficiará directamente a GRULAC S.R.L., sino que servirá como modelo replicable para otras empresas del rubro agroindustrial en etapa de crecimiento.

Respecto al mantenimiento del sistema, el mismo estará a cargo del equipo de desarrollo durante el periodo del proyecto. Una vez concluido, se prevé la entrega de documentación técnica y funcional completa que permita a la empresa realizar un mantenimiento autónomo o contratar soporte técnico externo. La arquitectura del sistema, basada en tecnologías modernas y ampliamente documentadas (Node.js, Next.js, PostgreSQL, Supabase), garantiza la facilidad de mantenimiento y escalabilidad futura.

DESCRIPCIÓN DEL PROBLEMA

GRULAC S.R.L. es una empresa agroindustrial dedicada a la producción y comercialización de derivados lácteos, con aproximadamente seis meses de operación al momento de la elaboración del presente proyecto. La empresa surgió como iniciativa de una asociación de ganaderos de la comunidad Basilio, ubicada sobre la carretera Biooceánico, con el propósito de generar valor agregado a la producción lechera local y apoyar el crecimiento económico de las pequeñas colonias ganaderas de la región. Sus principales líneas de producción son Queso Mozzarella, Queso Cheddar, Dulce de Leche Repostero y Dulce de Leche Familiar.

1. Ausencia de un sistema de información integrado y centralizado A pesar de contar con personal técnico calificado y procesos en etapa de definición y estandarización, la empresa enfrenta una serie de problemas operativos críticos derivados, en su totalidad, de la ausencia de un sistema de información integrado. La gestión actual se apoya únicamente en registros manuales realizados en formularios físicos impresos y en hojas de cálculo de Microsoft Excel, lo cual genera inconsistencias, pérdidas económicas, dificultades en la toma de decisiones y riesgos operativos que afectan directamente la competitividad y sostenibilidad de la empresa. A continuación, se describen en detalle cada uno de los problemas identificados durante el proceso de relevamiento de información.

El problema más estructural que enfrenta GRULAC S.R.L. es la inexistencia de un sistema de información que integre y centralice los datos de todos sus procesos operativos. Actualmente, cada área de la empresa —producción, control de calidad, inventario y despacho— opera de forma aislada, sin ningún mecanismo que permita compartir, relacionar ni consolidar la información en tiempo real.

La información de una jornada de producción no se traduce automáticamente en una actualización del inventario de insumos, ni en el registro del lote de producto terminado, ni en la disponibilidad del dato para el área de despacho. Todo esto implica que cada trabajador debe trasladar manualmente los datos entre hojas de cálculo independientes, lo que multiplica el riesgo de errores, omisiones y duplicidades. La encargada de control de calidad confirmó durante la entrevista que el sistema actual “no es al 100% efectivo” y que existen errores derivados de la falta de automatización. Esta fragmentación de la información constituye la raíz del conjunto de problemas que se describen en los siguientes puntos.

2. Gestión manual e ineficiente del inventario de insumos y materias primas El inventario de materias primas e insumos de GRULAC S.R.L. no cuenta con un registro actualizado en tiempo real. El estado del stock solo se conoce en el momento en que se intenta producir, lo que genera situaciones críticas de desabastecimiento interno. Según lo declarado en la entrevista, en más de una ocasión el personal ha descubierto a última hora que no se contaba con los insumos necesarios para iniciar la producción del día, lo cual obliga a detener o reprogramar las actividades productivas.

La gestión del inventario está distribuida entre dos personas: la encargada de control de calidad y el encargado de envasado. Ambas manejan archivos de Excel independientes sin restricciones de acceso concurrente, lo que genera un escenario propicio para registros duplicados o inconsistentes. La entrada de datos es enteramente manual y posterior al proceso productivo, lo que introduce demoras entre el momento en que ocurre el hecho y el momento en que queda registrado.

3. Ausencia de control de stock en tiempo real y riesgo de desabastecimiento de producto terminado Además, no existen alertas automáticas de stock mínimo. En una empresa con producción diaria y demanda variable, la ausencia de este mecanismo resulta especialmente grave. La empresa no puede planificar sus compras con anticipación, lo que la expone a interrupciones productivas evitables y a costos adicionales derivados de adquisiciones de emergencia. Este problema fue identificado explícitamente durante la entrevista como uno de los más urgentes a resolver. El control de inventario de materias primas, insumos y producto terminado presenta deficiencias graves:

La situación del stock de producto terminado representa uno de los problemas de mayor impacto económico y comercial para GRULAC S.R.L. La empresa no cuenta con visibilidad en tiempo real sobre las existencias disponibles en su cámara de almacenamiento de producto terminado. El caso más representativo y documentado en la entrevista es el del Dulce de Leche Repostero: la demanda del producto superó la capacidad de almacenamiento disponible, al punto de que la empresa se vio obligada a producir para el día siguiente, literalmente sin reserva de producto.

Esta situación evidencia que, ante un incremento inesperado de la demanda, la empresa no tiene capacidad de respuesta inmediata, ya que no existe un sistema que anticipe el agotamiento del stock ni que genere alertas preventivas. Si en ese mismo escenario se hubiera presentado un segundo pedido simultáneo, la empresa habría sido incapaz de atenderlo, con el consecuente impacto en la relación con los clientes y en los ingresos de la organización.

4. Falta de Trazabilidad de Lotes desde la Producción hasta el Despacho La trazabilidad de lotes es una de las exigencias más importantes en la industria alimentaria, ya que permite identificar con precisión el origen, el proceso de elaboración y el destino final de cada unidad producida. En GRULAC S.R.L., esta trazabilidad aún no se ha logrado de forma completa. Si bien la empresa está comenzando a implementar el control por lote, este proceso está incompleto y no abarca la cadena productiva en su totalidad. El problema concreto radica en que, al tener múltiples tipos de queso (Mozzarella y Cheddar) en proceso de estandarización de recetas y procedimientos, los despachos se realizan de forma combinada, sin que sea posible identificar con certeza qué lote fue entregado a qué cliente. Esto impide actuar ante eventuales reclamos de calidad, realizar retiros selectivos de producto en caso de no conformidad, o cumplir con normativas alimentarias que exijan la identificación precisa del origen del producto.

5. Deficiencias en el registro y control del despacho y ventas Adicionalmente, la falta de control por lote en el despacho tiene implicaciones más allá de lo administrativo: en caso de detectarse un problema de calidad en un producto ya entregado, la empresa no tendría forma de identificar con precisión qué otros clientes recibieron producto del mismo lote ni cuándo fue producido, lo que imposibilita cualquier acción correctiva o preventiva. Esta situación representa un riesgo directo para la reputación sanitaria y comercial de GRULAC S.R.L.

El área de ventas y despacho de GRULAC S.R.L. opera sin un sistema de registro estructurado. No existe un historial de ventas que permita identificar a qué cliente se le despachó cada pedido, en qué fecha, a qué hora, en qué cantidad y de qué lote de producción provino el producto entregado. Esta ausencia de trazabilidad comercial representa un riesgo significativo tanto desde el punto de vista de la gestión empresarial como desde el cumplimiento de normativas de inocuidad alimentaria.

La dinámica operativa actual genera situaciones de alta vulnerabilidad: la empresa atiende pedidos sin tener certeza del stock disponible en la cámara de producto terminado. Como consecuencia directa, en reiteradas ocasiones los pedidos son procesados el día anterior a la fecha de entrega acordada con el cliente, eliminando cualquier margen de seguridad ante imprevistos de producción, cortes de suministro o fallas de equipos. Esta situación no solo pone en riesgo el cumplimiento de los compromisos comerciales, sino que también limita la capacidad de la empresa para aceptar nuevos pedidos de manera responsable.

Asimismo, no se cuenta con ningún sistema de registro de pagos ni control de cuentas por cobrar integrado con el inventario y la producción. Las ventas y los cobros se gestionan de forma separada, sin un hilo conductor que permita a la administración conocer en todo momento el estado financiero de sus operaciones comerciales.

6. Gestión documental basada en papel y ausencia de respaldo digital La totalidad de los registros de GRULAC S.R.L. se realiza actualmente en soporte físico. Los formularios de control de recepción de leche, elaboración de queso Mozzarella, elaboración de queso Cheddar, elaboración de Dulce de Leche Repostero, elaboración de Dulce de Leche Familiar, control de hilado, control de cuajada y control de calidad son completados a mano por los operarios durante o después del proceso productivo.

Este modelo de gestión documental presenta múltiples riesgos. En primer lugar, los formularios en papel son susceptibles a deterioro físico, pérdida o destrucción accidental, lo que podría implicar la pérdida irrecuperable de información histórica. En segundo lugar, los datos consignados en papel deben ser posteriormente transferidos a hojas de cálculo de Excel, lo que introduce una etapa intermedia de transcripción manual, propensa a errores de digitación, omisiones y demoras en la disponibilidad de la información para la toma de decisiones.

El ingreso tardío de datos a Excel agrava aún más la situación: cuando un jefe de producción o administrador necesita conocer el estado actual del inventario o el avance de producción del día, la información disponible en el sistema puede estar desactualizada por horas o incluso por jornadas completas. En una empresa donde la producción y el despacho ocurren en el mismo día, esta demora tiene consecuencias directas sobre la capacidad de respuesta operativa.

No existe una base de datos centralizada ni relacional que vincule los registros de producción con el inventario de insumos, el control de calidad y el despacho de producto terminado. Cada archivo de Excel funciona como una isla de información, desconectada del resto. Esta fragmentación hace imposible obtener indicadores integrados de gestión, realizar análisis de rendimiento productivo por lote o generar reportes consolidados que apoyen la toma de decisiones estratégicas.

La empresa tampoco dispone de un sistema de respaldo digital para sus registros históricos de producción. Según lo indicado en la entrevista, el historial de operaciones previo a diciembre de 2025 es prácticamente inexistente en formato digital, dado que en la etapa inicial la empresa se encontraba en fase de pruebas y no se priorizaba el registro sistemático. Esto impide a la empresa realizar análisis de tendencias, calcular rendimientos históricos por producto o comparar el desempeño entre periodos.

7. Impacto general y necesidad de intervención tecnológica El conjunto de problemas descritos en los puntos anteriores configura un escenario de alta vulnerabilidad operativa para GRULAC S.R.L. La empresa se encuentra en una etapa de crecimiento sostenido, con una demanda que supera su actual capacidad de respuesta, pero sin las herramientas tecnológicas necesarias para gestionarla de forma eficiente. La dependencia de registros manuales en papel y hojas de cálculo no integradas entre sí constituye el principal obstáculo para escalar las operaciones de manera ordenada, confiable y sostenible. Desde la perspectiva de los sistemas de información, los problemas identificados son sintomáticos de la ausencia de un sistema transaccional básico que centralice los datos operativos de la empresa. En la clasificación clásica de sistemas de información, GRULAC S.R.L. operaría actualmente por debajo del nivel de un Sistema de Procesamiento de Transacciones (TPS), ya que ni siquiera logra registrar de forma sistemática, confiable y oportuna las transacciones básicas de su actividad productiva. La implementación de un sistema digital integrado no solo corregiría los problemas actuales, sino que sentaría las bases para que la empresa pueda avanzar hacia niveles superiores de gestión informacional en el futuro. En conclusión, la problemática de GRULAC S.R.L. puede sintetizarse en seis dimensiones críticas interrelacionadas: (1) ausencia de un sistema de información integrado y centralizado, (2) gestión manual e ineficiente del inventario de insumos, (3) falta de control de stock en tiempo real sobre el producto terminado, (4) inexistencia de trazabilidad completa por lote desde producción hasta despacho, (5) deficiencias en el registro y control de ventas y despachos, y (6) gestión documental basada en papel sin respaldo digital. Cada una de estas dimensiones genera costos operativos evitables, riesgos comerciales y limitaciones para el crecimiento de la empresa. El desarrollo del Sistema Web propuesto en el presente proyecto busca dar respuesta integral a la totalidad de estos problemas.

FORMULACIÓN DEL PROBLEMA

El presente proyecto busca resolver la problemática operativa de GRULAC S.R.L. derivada de la ausencia de un sistema de información integrado. Los módulos que contemplará el sistema son: gestión de usuarios y roles, gestión de proveedores, recepción de leche cruda, gestión de insumos y materias primas, gestión de producción por lote, control de calidad, gestión de inventario de producto terminado, gestión de pedidos, gestión de despacho y ventas, reportes y análisis, y gestión de documentos. El desarrollo se realizará mediante Node.js con Express en el backend, Next.js en el frontend y PostgreSQL como base de datos relacional, con autenticación y almacenamiento gestionados a través de Supabase.

OBJETIVOS

Objetivo General

Desarrollar un Sistema de Información para la Gestión de Inventario, Producción y Despacho de Lácteos GRULAC S.R.L., que permita digitalizar, centralizar y optimizar los procesos de gestión de inventario de insumos y producto terminado, control de producción por lote, control de calidad, registro de pedidos y despacho de la empresa.

Objetivos Específicos

Recolectar los requisitos funcionales y no funcionales del sistema mediante entrevistas al personal operativo y administrativo de GRULAC S.R.L., observación directa de los procesos productivos y revisión de los formularios físicos utilizados actualmente.

Analizar los requisitos recolectados para identificar los procesos críticos de la empresa, definir los casos de uso por módulo y establecer las especificaciones funcionales y no funcionales que guiarán el diseño del sistema.

Diseñar la arquitectura del sistema y el modelo de base de datos relacional en PostgreSQL, garantizando la integridad referencial y la trazabilidad de los datos entre los módulos de producción, inventario, calidad, pedidos y despacho.

Implementar el sistema utilizando Node.js con Express en el backend y Next.js en el frontend, integrando Supabase para la gestión de autenticación, autorización por roles, almacenamiento de archivos y seguridad de acceso.

Implementar los módulos funcionales del sistema (gestión de usuarios, inventario, producción, control de calidad, pedidos y despacho), proporcionando una interfaz web intuitiva y responsiva para los operarios y administradores de GRULAC S.R.L.

Integrar alertas automáticas de stock mínimo para insumos y producto terminado, utilizando manejo de colas y notificaciones por correo electrónico para informar oportunamente al personal responsable.

Digitalizar y centralizar el almacenamiento de documentos, formularios de control y registros de producción mediante Supabase Storage, eliminando la dependencia de registros físicos en papel.

Realizar pruebas funcionales de cada módulo del sistema, gestionar el control de versiones mediante GitHub y desplegar la solución en infraestructura cloud, verificando el correcto funcionamiento integral del sistema.

ALCANCE

El Sistema de Información para la Gestión de Inventario, Producción y Despacho de Lácteos GRULAC S.R.L. abarcará en su totalidad la logística operativa, seguridad transaccional, y el registro documental técnico, estructurándose en un espectro ampliado y riguroso de 15 Módulos Funcionales (Arquitectura de Monolito ERP):

Módulo de Gestión de Usuarios y Seguridad (RBAC)

Permite registrar y gestionar a los usuarios del sistema, asignándoles roles diferenciados (Administrador, Supervisor de Producción, Encargado de Calidad, Operario y Encargado de Despacho). Esto garantiza, mediante políticas de seguridad, que cada persona acceda únicamente a las funcionalidades correspondientes a su puesto, mejorando el control interno de la planta y evitando la alteración accidental de los registros históricos. Datos principales:

ID Usuario

Nombre completo y Correo electrónico

Contraseña (encriptada)

Rol jerárquico y privilegios granulares

Estado (Activo/Inactivo) e histórico de sesiones

Módulo de Gestión de Proveedores y Ganaderos

Permite registrar y gestionar los proveedores fijos de insumos y los ganaderos (colonias lecheras) con los que trabaja GRULAC S.R.L. Registra el histórico de compras, facilita la planificación de reposición y controla los tiempos de entrega (que oscilan entre 3 y 5 días según entrevistas), además de permitir inhabilitar temporalmente a ganaderos con historial de incidentes de calidad. Datos principales:

ID Proveedor / Ganadero

Razón social / Colonia de origen

Insumos/Leche suministrados y cupos

Tiempo de entrega estimado (días)

Historial de incidentes y estado del proveedor

Módulo de Recepción de Leche Cruda e Inspección Triage

Gestiona el registro diario de la leche cruda acopiada desde las colonias ganaderas. Cada recepción queda vinculada al proveedor y actualiza automáticamente el inventario de materia prima. Constituye el punto de entrada a la cadena productiva con control in-situ: bloquea el vaciado si los parámetros rebasan umbrales letales de sanidad. Datos principales:

ID Recepción, Fecha y hora UTC

Proveedor / Colonia de origen

Volumen recibido (litros)

Análisis de calidad inicial (pH, acidez, temperatura, células somáticas, presencia de antibióticos)

Estado (Aceptada / Rechazada) y observaciones

Módulo de Inventario de Insumos y Materias Primas

Centraliza el control de los elementos químicos y materias primas (Cloruro de calcio, cuajo, etc.). Mantiene el stock actualizado en tiempo real descontando automáticamente el consumo en producción. Registra el Kardex y detecta umbrales críticos de desabastecimiento (equivalente a 3 días de producción) para generar un aviso automático de reposición. Datos principales:

ID Insumo / Código de producto

Cantidad y unidad de medida (kg / L / unidades)

Stock mínimo de alerta

Movimientos de Kardex IN/OUT (tipo, cantidad, fecha)

Estado (Disponible / Stock bajo / Sin stock)

Módulo de Gestión de Recetas Lácteas (BOM - Formulación)

Configura la fórmula estándar de cada línea de producto, listando insumos y proporciones base exactas por litro de leche procesada. Vincula directamente la receta al módulo de producción para automatizar el cálculo del costo e impedir el consumo excesivo de insumos y aditivos mediante rangos de tolerancia. Datos principales:

ID Receta (Ej: Queso Mozzarella de barra)

Arreglo de insumos asociados e ingredientes primarios

Porcentaje de mezcla estandarizado por 100L de leche

Tolerancias fisicoquímicas permitidas

Módulo de Gestión de Lotes de Producción

Gestiona el historial de lo que se produjo físicamente, diferenciando la orden de producción (pedido interno) del lote terminado. Permite vincular fechas de fabricación, vencimiento y generar una relación trazable con los despachos comerciales.

Módulo de Producción en Planta por Lote

Registra cada orden de producción asignando un número de lote único a la jornada productiva. Al registrar la orden, el sistema extrae automáticamente la cantidad de insumos consumidos del inventario de acuerdo a la receta (BOM). Documenta rendimientos en moldes fraccionarios para garantizar trazabilidad productiva total. Datos principales:

ID Lote / Número de lote unívoco y trazable

Producto elaborado (línea de producción) y presentación

Fecha, hora de inicio y fin de producción

Cantidad producida en bruto y neto (moldes / kilos)

Operario responsable y Estado del lote

Módulo de Control de Calidad y Bioseguridad

Almacena resultados de controles de calidad físico-químicos realizados sobre lotes terminados. Interconecta la decisión final al stock comercial: impide sistémicamente que un lote en "Cuarentena" o "Rechazado" aparezca en la lista elegible de Despachos, asegurando calidad al consumidor y previendo contramuestras. Datos principales:

ID Control QA y Lote vinculado

Parámetros evaluados (pH post-producción, Grados Brix, humedad)

Resultado de laboratorio (Conforme / No conforme / Cuarentena)

Responsable de laboratorio y observaciones técnicas

Módulo de Inventario de Producto Terminado

Controla el stock en la Cámara de Frío de GRULAC. Solo recibe ingresos de Lotes respaldados con estado "Conforme" por Calidad, y descuenta salidas originadas formalmente en Ventas. Emite alertas cuando un producto entra en stock mínimo, mitigando crisis operativas por desabastecimiento comercial. Datos principales:

ID Producto Terminado y Presentación (Ej: Dulce 5 kg)

Lote trazable de origen

Cantidad equivalente lograda en cámara fría (kilos y unidades)

Stock mínimo de alerta

Estado comercial (Disponible / Stock bajo / Agotado)

Módulo de Gestión de Pedidos y Directorio Comercial (B2B / B2C)

Combina la gestión del directorio de clientes (fijos/ocasionales, ubicación) con la recepción de pedidos anticipados. Digitaliza en sistema los flujos que actualmente ocurren aisladamente por WhatsApp. Valida el cruce del pedido contra el inventario libre en tiempo real, bloqueando compromisos inasumibles ("sobre-ventas"). Datos principales:

ID Pedido y Cliente (Razón Social/Región/Frecuencia)

Productos y cantidades solicitadas (Cheddar, Mozzarella, etc.)

Fecha de solicitud y fecha programada

Método de pago (Efectivo / Transferencia / QR)

Estado de progreso (Pendiente / Confirmado / Rechazado)

Módulo de Despacho, Ventas y Logística Inversa

Ejecuta la venta física deduciendo el producto terminado del stock. Identifica y empareja qué lotes exactos van a las manos del transportista. Incluye funcionalidad de reversión o "Devoluciones" en caso de incidentes reportados por consumidores, cerrando en un bucle lógico la trazabilidad integral de fábrica a cliente. Datos principales:

ID Despacho interactuando con el Pedido

Array de Lotes seleccionados y facturados en salida

Entregador/Chofer responsable

Eventuales rechazos (Motivo de devolución, producto retornado)

Estado (Transito al cliente / Devuelto total o parcial)

Módulo de Control Contable Financiero

Interfaz orientada a conciliar el valor económico en torno a los lotes. Vincula los recibos de entrega desde la Planta con la facturación final de la oficina comercial. Detalla pagos completados, cuentas por cobrar por despachos acreditados e ingresos fijos, garantizando salud financiera. Datos principales:

ID Transacción emparejada al ID de Venta

Monto de transacción y pagos recibidos

Deuda pendiente / balance contable de cliente

Estado resolutivo (Pagado íntegro / Impago / Conciliado ciudad)

Módulo de Reportes Analíticos Inteligentes

Genera inteligencia de negocios consolidada permitiendo a la Alta Gerencia tomar decisiones informadas en base a datos puros. Mitiga los tiempos ociosos que produce buscar tendencias en tablas aisladas en Excel y exhibe reportes históricos de rendimientos (porcentaje transformativo), inventarios críticos y proyecciones. Datos principales:

Filtros de período temporal (Desde Fecha - Hasta Fecha)

Cálculos estadísticos de Mermas y Eficiencia por Lote

Reportes de despacho según clientes estrella

Formatos exportables estandarizados (documento PDF, XLSX y MIME)

Módulo de Repositorio y Gestión Documental Cloud

Digitaliza documentación técnica probatoria, cargando fotos o PDF complementarios generados por laboratorios externos de SENASAG al respectivo Lote. Preserva esta metadata incrustada y blindada durante varios lustros conforme a periodos de retención legal sin depender del papel físico propenso a siniestros. Datos principales:

ID Documento metadata

Lote productivo foráneo o ID Carga vinculada

Tipo (PDF, imagen), Tamaño y Ruta (Bucket en Supabase Cloud)

Credenciales horarias (Timestamp de creación/subida)

Módulo de Motor Auditor Interno y Control de Trazabilidad Forense

Funcionalidad estricta y restrictiva que actúa entre bambalinas. Invocando lógicas a nivel base de datos (Triggers), secuestra y anota inmediatamente a quienes modifiquen o alteren cantidades históricas o fórmulas químicas en Lotes ya sellados. Garantiza que la trazabilidad sea íntegra, legal e "Inmutable". Datos principales:

Data pre-alteración (Representación JSON previa)

Estampa de temporalidad absoluta UTC

Usuario infractor e IP

Tabla/Registro directamente impactado (Ej: update en cantidad de insumo)

Módulo de Automatización de Trabajos Asíncronos (Alertas y Hooks)

Servicio inteligente desvinculado de la acción del operador de la planta. Encargado de cronometrar eventos preventivos automáticos, disparando notificaciones y correos de emergencia administrativa a gerencia al prever ruina de materia prima láctea por factores como stock ausente y cuarentenas biológicas peligrosas. Datos principales:

Scripts periódicos de revisión de Lotes maduros (Cron-jobs)

Textos informativos y prioridades del correo electrónico (Alta, Media)

Correos destino (Directores) y Listas de Evento Activador

ENTREVISTA

PERFIL DE PROYECTO

Entrevista para Obtención de Requisitos

Resumen de la Entrevista

PERFIL DE PROYECTO

Entrevista para Obtención de Requisitos

Resumen de la Entrevista

ELEMENTOS DEL SISTEMA BASADO EN COMPUTADORAS

Atendiendo a las necesidades de la infraestructura moderna y optimizando los costos de implementación para GRULAC S.R.L., la arquitectura del sistema no se apoyará en grandes y costosos servidores on-premise físicos dentro de la planta, sino que aprovechará el enfoque de "Plataforma como Servicio" (BaaS) y Cloud Computing.

HARDWARE

Comprende toda la capa física y tangible de la estructura en la que descansará y operará el entorno del sistema integral, fraccionado entre el hardware operado por el usuario en Bolivia y el hardware arrendado que corre el núcleo lógico.

Servidor

La infraestructura centralizada funcionará de manera distribuida garantizando la operatividad 24/7 sin dependencias eléctricas de la planta central en Basilio.

Servidor de Aplicaciones y Backend (Vercel Edge Nodes): Infraestructura hospedada en la Nube que provee capacidad de cómputo bajo demanda. Utiliza microprocesadores escalables dinámicamente que ejecutan el entorno Node.js, asignando memoria RAM y caché según la concurrencia de los requerimientos HTTP que ingresen desde la granja.

Servidor de Base de Datos Base (Supabase / AWS DBaaS): Instancias físicas alojadas en la red de Amazon Web Services (AWS) que sostienen nativamente a PostgreSQL. Su hardware intrínseco incluye procesadores multi-hilo (vCPUs), discos de estado sólido NVMe ultrarrápidos para evitar cuellos de botella al sumar Kardex, y memorias compartidas blindadas contra ataques de desconexión.

Cliente

Dispositivos físicos tangibles con los que directivos, jefes y operarios interactuarán de primera mano. Se categorizan bajo los principios de Thin-Clients (clientes ligeros), ya que el procesamiento real sucede en la nube.

Estaciones PC Gubernamentales y de Gerencia: Computadoras de oficina para áreas de Ventas y Jefatura. Conformadas por Hardware Estándar: Procesadores Core i3 / Ryzen 3 o superior, 4 GB a 8 GB DDR4 de Memoria RAM, y pantallas anchas (+15 pulgadas) que permitirán el despliegue holgado de las grandes y complejas tablas o "Datagrids" analíticos del almacén.

Dispositivos Industriales Portátiles (Uso en Planta): Tablets o Teléfonos asimilados (Android 10+ o iOS) portados por los ingenieros in situ. Para mitigar los altos niveles de humedad e inocuidad alimentaria (salpicaduras del lactosuero), los dispositivos operarán integrados con fundas protectoras impermeables, basando su interacción en pantallas capacitivas tolerantes a la manipulación por operarios enguantados.

Medios de Comunicación

Para interconectar sin fisuras la Fábrica y la Extracción de Leche Remota con la base de datos Global, se precisan enlaces vitales en la topología de red:

Red Interna (LAN/WLAN): Enrutadores Wi-Fi (Estándar 802.11 ac/ax) estratégicamente dispuestos para expandir la cobertura en salas frías y rincones de ebullición de acero inoxidable que normalmente aíslan frecuencias y dificultan la señal.

Punto de Conexión Banda Ancha (Gateway Híbrido): Contrato de Internet de Fibra Óptica Empresarial y/o acceso satelital alterno (por zona rural de Basilio) con una tasa de transmisión superior a 50 Mbps. La latencia debe sostener ráfagas cortas e inmediatas (RESTful Fetching) asegurando así envíos de actas en milisegundos.

Otros Dispositivos

Equipamiento electrónico de soporte productivo logístico:

Lectores Ópticos de Almacén: Escáneres manuales con protocolo Bluetooth o USB diseñados para decodificar Códigos QR o Código de Barras (SKU) al instante en que el Jefe de Despacho ingresa cada lote de queso a los camiones.

Impresoras de Etiquetado y Despacho: Impresoras matriciales y térmicas de papel adhesivo y resina habilitadas para estampar los Códigos Únicos de Lote que se pegarán encima de las envolturas al vacío, posibilitando una trazabilidad real e intransigente.

SOFTWARE

El conjunto sistemático y no tangible de programas informáticos que orquestarán las órdenes, algoritmos y reglas matemáticas restrictivas solicitadas por la Ing. Condori o el Ministerio de Salud (SENASAG).

Servidor

Elementos Lógicos Core e Invisibles al Usuario Comercial:

Motor de Base de Datos Transaccional: PostgreSQL 15, escogido no solo por su solidez de open-source, sino por su poder Relacional y soporte interno de funciones PL/pgSQL que impedirán inconsistencias contables si la Wi-Fi parpadea.

Backend Serverless y Entorno de Ejecución: Node.js LTS, manejando lógicas API REST e inyectando las reglas paramétricas. Estará acoplado a Supabase (GoTrue Auth y Storage) para asegurar tokenización JWT hermética y salvaguarda de fotocopias probatorias.

Sistemas Operativos Base Subyacentes: Contenedores ejecutando Distribuciones Linux estables que aíslan los ciclos de ejecución.

Cliente

Los aplicativos instalados de cara al usuario final en la fábrica GRULAC S.R.L.:

Navegadores Web (Web Browsers): Google Chrome, Mozilla Firefox o Microsoft Edge. Al ser una Arquitectura Web, no hay instalaciones ejecutable (.exe). Se precisa navegadores que destaquen en soporte nativo V8 Javascript (ES6) y Single Page Applications sin lag de refresco de pantalla.

Sistemas Operativos Visuales: Microsoft Windows 10/11 sobre equipos ofimáticos, Android 11+ sobre las tabletas industriales.

Otro software adicional

Control de Versiones y Despliegue CI/CD: Git, GitHub acoplados a Pipelines para posibilitar iteraciones constantes en la Tesis. Evitarán que caídas de sistema accidentales pasen al servidor Transaccional de Producción.

Diseño de Pruebas APIs y Diagramación: Herramientas informáticas auxiliares de ingeniería como Postman API, software de notación UML (como Mermaid y Visual Studio Code), esenciales para validar arquitectónicamente cada Endpoint.

Servicio de Mensajería SMTP/Notificaciones: Interfaces de Software 3rd Party como Resend o SendGrid para disparar proactivamente Alertas Automáticas (Ej. Stock de dulce repostero a CERO) sin intervención humana al buzón de correo.

DATOS

Representan la "Sangre Analítica", el insumo maestro del Monolito. En GRULAC S.R.L., no son meros "textos", son restricciones críticas almacenadas con ACID garantizado:

Tabulares Inmutables y Maestros: Censo de proveeduría lechera, Listado jerárquico de perfiles de usuario, Formulación científica indexada y estática (El Recetario Cheddar y sus cuotas).

Dinámicos Operacionales Altamente Volátiles: Flujo incesante diario de Muestras de ph Leche, Acidez, Temperatura, Registro Decimal de cada Horma de queso (ej. 4.90 Kg), Sumatorias y Stock en Bodega (Inventario). Todo resguardado y cifrado por seguridad de accesos cruzados (RLS).

Auditoría y LOBs (Large Objects): Registradas en Json y metadatos de bitácoras invisibles que acusan a ciberdelincuentes o alteraciones ilícitas; además, fotográfias biológicas archivadas en Storage (Documentos de respaldo y planillas de anexos escaneadas).

PROCESOS

Los flujos de la realidad mapeados al algoritmo y automatizados, destinados a eliminar la "gestión aislada y el desfasaje manual de tiempos".

El Triaje y Alta de Insumos Lácteos Base: Transformar el ingreso del volumen de leche (Lt) de la cisterna en Stock Central Validado, descontando automáticamente ante cualquier anomalía térmica evaluada.

El Flujo Central de Fabricación (Start to End Lote): Registrar formalmente el Inicio en caldero, deducir con exactitud las proporciones químicas invertidas del Kardex y finalizar auto-sumando en línea el "Porcentaje Real Global de Rendimiento" sin uso de calculadoras en papel de Excel.

Bifurcación de Calidad QA e Integridad: Bloqueo robótico que impide pasar a "Venta" cualquier lácteo si su nivel de Acidez (Ficha de Laboratorio) no fue refrendada positivamente al cierre del ciclo.

Comercialización y Consumo Logístico: Procedimiento centralizado para amarrar la Venta Monetaria del Cliente cruzando el des-alojamiento físico de Pallets o quesos por número de Identificador de Lotes en las cámaras o camiones despachados.

GENTE / USUARIO

La clasificación de actores orgánicos, definidos por Arquitectura basada en Roles de acceso (Restaurando el control que el esquema Excel antiguo violaba abriendo las celdas a todos).

Ingeniero Analista de Calidad (Lab): Facultados exclusivos (Rol Técnico Quality) para determinar las pruebas de Células Somáticas, pH y Aprobar Lotes defectuosos o sanos.

Operarios de Planta Industrial (Mano de Obra): Trabajadores ubicados directamente en los calderos o prensas, quienes retroalimentan al motor con la carga pesada al interactuar con las Tableta (Tapping de "Nuevo Molde Pesado" constante).

Administrador y Jefatura de Despachos/Ventas: Rol de visualización de inventarios, generación de Proformas comerciales con clientes recurrentes, encargados del área pecuniaria de la cadena láctea.

Gerencia (El Nivel Ejecutivo C-Level): Socio Administrativo con privilegios absolutos limitados a modo "Read-Only Gerencial", consumiendo la Información procesada como Dashboards e Informes Financieros Mensuales.

DOCUMENTO

Inyecciones y extrucciones informativas consolidadas orientadas a formalidad corporativa o respaldo legal, dejando obsoleto el apunte en hojas de cuaderno perecedero.

Reportes PDF Computables: Fichas Unitarias de Identidad por Lote con actas de Calidad unificadas (Kardex histórico de trazabilidad estricta y blindado frente a Impuestos o Fiscalización Sanitaria SIN/SENASAG).

Kardex y Análisis Agregados: Documentos tabulados exportados a placer para Excel bajo exigencias gerenciales o contabilidades externas a la compañía (balances parciales de stock finalizados por fecha).

Políticas y Manuales Informacionales Embebidos: Interfaces digitales tutoriales que sirvan como Guía Educativa al nuevo contratado industrial (Asegurando "Buenas Prácticas Lácteas"), logrando disminuir la temible curva de aprendizaje al rotar personal en GRULAC S.R.L.

TECNOLOGÍA PARA EL DESARROLLO DEL SOFTWARE

El éxito de la sistematización de GRULAC S.R.L. no reside únicamente en la codificación, sino en la selección estratégica de un ecosistema tecnológico que responda a las patologías operativas identificadas. En este capítulo se detalla la metodología de ingeniería de software aplicada, el marco de modelado visual y las herramientas físicas y lógicas que garantizan un sistema robusto, escalable y de alta disponibilidad para la industria láctea.

Estrategia para el desarrollo del Software

La estrategia de desarrollo adoptada para este proyecto se fundamenta en el paradigma de Arquitectura Cloud-Native bajo un enfoque de Monolito Modular. Esta decisión estratégica responde a la necesidad de centralizar la atomizada gestión de GRULAC en una única "fuente de verdad" sin incurrir en la complejidad excesiva de microservicios, dada la escala actual de la empresa.

La fundamentación técnica de esta estrategia se basa en tres pilares:

Garantía Transaccional (ACID): El uso de PostgreSQL asegura que cada gramo de insumo descontado y cada kilo de queso producido se registren con integridad absoluta, eliminando el riesgo de "datos fantasma" que ocurría en el esquema Excel.

Eficiencia en el Borde (Edge Computing): Al implementar Next.js, se garantiza que la lógica de renderizado se procese lo más cerca posible de la planta de Basilio, reduciendo la latencia y mejorando la experiencia de usuario en dispositivos móviles/tablets con internet rural.

Seguridad Blindada (BaaS): Delegar la autenticación y la seguridad a nivel de registros (RLS) a Supabase permite que el analista se enfoque en la lógica de negocio lácteo, garantizando que un operario de planta jamás tenga acceso a las tablas de costos financieros.

Metodología para el desarrollo del software

Para garantizar la calidad y el cumplimiento de los estrictos requisitos de trazabilidad alimentaria, se ha seleccionado el Proceso Unificado de Desarrollo de Software (PUDS) como marco metodológico principal, complementado con el estándar de modelado UML 2.5.

Características del PUDS

El PUDS es un proceso iterativo, incremental, dirigido por Casos de Uso y centrado en la arquitectura. Esta metodología permite mitigar riesgos técnicos de manera temprana, lo cual es crítico dado que GRULAC se encuentra en una etapa de consolidación dinámica.

Fases del Ciclo de Vida adaptadas al Proyecto:

Fase de Inicio (Inception): Enfocada en la elicitación de requisitos mediante las entrevistas a la Ing. Condori y el análisis sistémico de las planillas de producción. El hito fue la definición del alcance de los 23 módulos.

Fase de Elaboración (Elaboration): Etapa donde se diseña la "Línea Base de la Arquitectura". Aquí se realiza el modelado de datos normalizado para evitar redundancias y se definen los diagramas de secuencia para los flujos críticos de producción.

Fase de Construcción (Construction): Desarrollo de las funcionalidades por ciclos. Cada ciclo entrega un componente funcional testeable que resuelve un problema específico de la fábrica.

Fase de Transición (Transition): Despliegue del sistema completo, capacitación del personal en planta y migración de los datos históricos del Excel a la nueva base de datos relacional.

Plan de Iteraciones (Ciclos de Construcción):

Características de UML

UML (Unified Modeling Language) se emplea como el lenguaje estándar para visualizar, especificar, construir y documentar todos los artefactos del sistema informático.

Características principales de UML:

Lenguaje Semántico: Permite que no solo los programadores, sino también los analistas y supervisores de calidad entiendan el flujo del sistema antes de escribir código.

Independencia del Código: El diseño UML prevalece aunque se decida cambiar el framework en el futuro, protegiendo el conocimiento de negocio de la empresa.

Diagramas utilizados para el proyecto:

Para evitar el exceso de documentación y enfocarse en la agilidad arquitectónica, se ha seleccionado el siguiente subconjunto pragmático del estándar UML 2.5:

Diagramas de Casos de Uso: Para definir los límites del sistema y la interacción exacta de los 10 empleados de GRULAC con las funciones del software.

Diagramas de Actividad: Cruciales para modelar los flujos de negocio complejos (Ej. El proceso químico de elaboración del Queso Cheddar con sus múltiples agregados y puntos de control térmico).

Diagramas de Clases (Modelo de Dominio): Mapea las entidades del mundo real (Lotes, Pailas, Cisternas) a objetos digitales, sirviendo de plano maestro para la estructura de la base de datos.

Diagramas de Secuencia: Aplicados exclusivamente para las operaciones de alta sensibilidad como el "Cierre de Lote" o la "Validación de Calidad de Laboratorio", donde el orden temporal de las peticiones API es vital.

Diagramas de Despliegue: Para visualizar la arquitectura de red e infraestructura en la nube, incluyendo los puntos de acceso WiFi en planta y la oficina comercial central.

HERRAMIENTAS DE DESARROLLO

El arsenal de herramientas ha sido seleccionado bajo criterios de "Costo Cero de Licenciamiento" e "Industria 4.0".

Software

El entorno lógico se compone de herramientas Open Source que eliminan la dependencia de licencias comerciales restrictivas:

Hardware

La infraestructura física se divide en los equipos necesarios para el ciclo de vida completo:

Entorno de Desarrollo (Estación del Ingeniero): Se utiliza hardware de alto rendimiento (16GB RAM, SSD NVMe, CPU Multi-core) diseñado para soportar compilaciones rápidas del frontend y levantamiento de servicios backend locales.

Entorno de Producción (Servidores Cloud): El sistema corre sobre la red global de Vercel y Amazon Web Services (AWS), garantizando una disponibilidad del 99.9% y respaldos automáticos fuera de la zona geográfica de la planta.

Equipamiento Terminal (GRULAC):

PC Administrativas: Equipos con monitores de alta resolución para visualizar tableros analíticos complejos en las oficinas.

Dispositivos de Planta: Tabletas táctiles con carcasas de protección industrial (IP65 contra salpicaduras de leche y suero) para captura de datos en caliente.

Periféricos de Trazabilidad: Impresoras térmicas (Label Printers) para etiquetado de lotes y lectores QR inalámbricos para el despacho en camiones cisterna y pallets.

FACTIBILIDAD ECONÓMICA Y COSTOS DEL PROYECTO

La viabilidad económica del sistema para GRULAC S.R.L. se evalúa comparando la inversión inicial requerida frente a los ahorros operativos proyectados. Dado que la empresa actualmente sufre pérdidas por falta de stock y desorganización administrativa, la implementación del software se presenta no solo como una mejora técnica, sino como una inversión de alta rentabilidad.

Análisis de Costos de Desarrollo (Inversión Inicial)

La inversión inicial contempla los recursos humanos necesarios para el diseño y construcción del sistema, así como la infraestructura física y lógica mínima para su puesta en marcha.

Recursos Humanos

Aunque el proyecto se desarrolla en un marco académico, se cuantifica el esfuerzo según tarifas competitivas del mercado local boliviano para reflejar el valor real del activo de software.

Hardware Crítico para Operación

Hardware necesario para que el sistema interactúe con el personal en la planta de Basilio y las oficinas comerciales.

Software y Servicios Cloud (Año 1)

Costos de licenciamiento y servicios en la nube necesarios para la alta disponibilidad 24/7.

Resumen de la Inversión Inicial

Análisis de Beneficios e Impacto Financiero

Para justificar la inversión, se cuantifican los ahorros derivados de la eliminación de las ineficiencias identificadas en las entrevistas.

Beneficios Tangibles (Ahorro Anual Proyectado)

Beneficios Intangibles

Trazabilidad Garantizada: Capacidad de responder inmediatamente ante auditorías del SENASAG o reclamos de clientes institucionales (Hot Burger).

Profesionalización Institucional: Mejora de la imagen de GRULAC S.R.L. ante posibles inversores o socios ganaderos.

Toma de Decisiones Basada en Datos: Dashboards gerenciales que eliminan la incertidumbre en la planificación semanal de leche.

Indicadores y Conclusión de Viabilidad

El análisis financiero de los indicadores demuestra la solidez del proyecto:

Retorno sobre la Inversión (ROI) - Año 1:

Fórmula:

Cálculo:

Período de Recuperación (Payback):

El capital invertido se recuperará íntegramente en aproximadamente 10 meses y medio de operación del sistema, considerando únicamente los beneficios tangibles.

Conclusión Económica: El proyecto es altamente viable. El sistema se autofinancia antes de cumplirse el primer año de su implementación gracias a la drástica reducción de costos operativos y la recuperación de ventas perdidas. La inversión inicial de 41,630 Bs se compensa con creces por la seguridad sanitaria y operativa que un sistema digital blindado proporciona a GRULAC S.R.L.

BENEFICIOS ESPERADOS

La implementación de un sistema de información integrado en GRULAC S.R.L. no es solo un cambio tecnológico, sino una transformación profunda de su cultura organizacional. Al eliminar la dependencia de registros manuales y hojas de cálculo fragmentadas, la empresa alcanzará beneficios que impactarán directamente en su rentabilidad, prestigio y capacidad de escalamiento.

Beneficios Operacionales y de Gestión (Procesos en Planta)

Trazabilidad Extremo a Extremo: La empresa podrá conocer instantáneamente la historia completa de cada lote de queso o dulce de leche, desde el padrón del proveedor de leche cruda hasta el cliente institucional final (como Hot Burger). Esto es vital ante eventuales retiradas de producto o auditorías sanitarias.

Control de Inventario en Tiempo Real: El sistema eliminará las "sorpresas de stock" en las que se detiene la producción por falta de un insumo crítico (como cloruro de calcio o ácido láctico). La visibilidad del stock actual permite una planificación de compras proactiva y no reactiva.

Optimización del Rendimiento Lácteo: Al automatizar el cálculo del "Porcentaje de Rendimiento" entre los litros de leche recibidos y los kilos de queso producidos, la gerencia podrá detectar mermas inusuales o fallos en el proceso de hilado/paila de manera inmediata para ajustar las recetas en caliente.

Reducción Drástica de Errores Humanos: La validación de datos en el sistema impedirá que se registren pesos de molde físicamente imposibles o que se apruebe la salida de productos que no superaron las pruebas de acidez o pH en laboratorio.

Beneficios Estratégicos y de Inteligencia de Negocios

Dashboards de Visibilidad Gerencial: Los socios y administradores en la oficina comercial de Santa Cruz podrán monitorear en vivo lo que sucede en el Km 102 sin necesidad de esperar el envío manual del Excel semanal. Esto agiliza la toma de decisiones críticas sobre la apertura de nuevos mercados.

Consolidación de la Imagen Corporativa: Contar con reportes PDF profesionales, certificados de calidad por lote y recibos impresos generados digitalmente eleva el prestigio de GRULAC S.R.L. ante clientes de alto nivel y entidades financieras, facilitando el acceso a créditos de expansión.

Gestión Documental Centralizada: El repositorio digital de actas de recepción de leche y controles microbiológicos asegura que la información histórica sea inalterable y esté siempre disponible durante los próximos 5 años, eliminando el riesgo de pérdida o deterioro físico de los cuadernos de papel.

Beneficios para el Capital Humano y de Seguridad

Claridad en Roles y Responsabilidades: Gracias al sistema de accesos por roles (RBAC), cada operario sabrá exactamente qué información debe retroalimentar, reduciendo la confusión sobre quién es responsable de cada registro de calidad o inventario.

Disminución de la Carga Administrativa: El personal de planta podrá enfocarse en las labores productivas e industriales en lugar de gastar horas del día transcribiendo datos de hojas sucias a archivos de Excel, disminuyendo el estrés operativo y la probabilidad de errores por fatiga de digitación.

Auditoría y Transparencia: El sistema de "Logs" y disparadores (Triggers) registrará quién movió qué stock y cuándo, fomentando una cultura de responsabilidad y protegiendo al personal honesto ante malas praxis o pérdidas injustificadas de producto terminado en cámara de frío.

Beneficios de Escalado Tecnológico

Infraestructura de Grado Empresarial: Al basarse en una arquitectura de nube moderna, el sistema no tiene límites de crecimiento. Si GRULAC S.R.L. decide mañana duplicar su flota de proveedores o abrir una segunda planta de producción, el sistema podrá escalar horizontalmente sin necesidad de re-programación costosa, protegiendo así la inversión tecnológica realizada.

MARCO TEÓRICO

Marco Conceptual: Gestión e Industrialización Láctea

En este apartado se definen los pilares operativos que rigen la actividad de GRULAC S.R.L., traduciendo los requerimientos de planta a conceptos formales de administración y control de calidad.

Trazabilidad Alimentaria

Se define como la capacidad de encontrar y seguir el rastro a través de todas las etapas de producción, transformación y distribución de un alimento. Para este proyecto, el concepto se desglosa en dos sentidos:

Trazabilidad Descendente (Hacia atrás): Referente a la identificación del origen de la leche cruda, los proveedores y las condiciones de recepción (temperatura, acidez, ph).

Trazabilidad Ascendente (Hacia adelante): Referente a la localización del destino final de un lote de producto terminado en los canales de distribución o clientes institucionales.

Control de Inventarios y Gestión de Vida Útil (FEFO)

Dado el carácter perecedero de los derivados lácteos, el sistema se fundamenta en el principio FEFO (First Expired, First Out - lo primero que vence es lo primero que sale). Este concepto teórico es la base para el diseño algorítmico del módulo de almacén, garantizando la seguridad alimentaria y minimizando mermas económicas.

Sistemas de Información Industrial

El proyecto se enmarca dentro de la categoría de un Sistema de Procesamiento de Transacciones (TPS), cuya función científica es recolectar, procesar y almacenar los datos detallados de las transacciones rutinarias de la fábrica (recepción de leche, pesaje de moldes, resultados de laboratorio), permitiendo posteriormente la generación de reportes operativos e indicadores de rendimiento.

Marco Metodológico: Ingeniería de Software

Proceso Unificado de Desarrollo de Software (PUDS)

El PUDS es un proceso iterativo, incremental, centrado en la arquitectura y dirigido por casos de uso. De acuerdo con Jacobson et al., este marco metodológico permite gestionar la complejidad y el riesgo de manera estructurada, asegurando que cada iteración produzca una release ejecutable que se acerque a la meta final.

Iterativo e Incremental: El software no se construye de una sola vez, sino que crece mediante ciclos de realimentación.

Centrado en la Arquitectura: Prioriza las decisiones que definen la estructura global del sistema para garantizar su estabilidad a largo plazo.

Lenguaje Unificado de Modelado (UML 2.5)

Es el lenguaje estándar a nivel mundial para visualizar, especificar, construir y documentar los artefactos de un sistema de software. UML permite abstraer la realidad de la planta láctea en diagramas lógicos (Casos de Uso, Actividades, Clases) que sirven como plano para la implementación del código.

Marco Tecnológico y de Infraestructura

Sustento técnico de las herramientas seleccionadas para garantizar la robustez del sistema de GRULAC S.R.L.

Arquitectura de Capas y Single Page Applications (SPA)

El sistema utiliza una arquitectura SPA basada en Next.js, donde la interfaz de usuario se carga una sola vez y solo los datos fluyen dinámicamente entre el cliente y el servidor. Esto asegura una experiencia fluida, similar a una aplicación nativa, ideal para dispositivos en planta de producción.

Bases de Datos Relacionales y Propiedades ACID

El soporte de persistencia reside en PostgreSQL, un motor relacional que garantiza las propiedades ACID (Atomicidad, Consistencia, Aislamiento y Durabilidad). Estos conceptos teóricos son innegociables para el sistema, ya que aseguran que una transacción de venta o el descuento de stock de leche no se pierda ni se corrompa ante fallos eléctricos o de red.

Backend-as-a-Service (BaaS) y Seguridad a Nivel de Fila (RLS)

El uso de Supabase introduce el concepto de seguridad desacoplada, donde el control de accesos se gestiona directamente en la base de datos mediante políticas de RLS (Row-Level Security). Este enfoque de vanguardia asegura que la información sensible de costos y clientes sea inaccesible para roles no autorizados desde la propia capa de persistencia de datos.

Entorno de Ejecución Asíncrono (Node.js)

Basado en el motor V8 de Google vChrome, Node.js utiliza un modelo de E/S sin bloqueo y orientado a eventos. Teóricamente, esto permite que el sistema maneje múltiples peticiones simultáneas desde planta y administración con un consumo mínimo de recursos de CPU, optimizando la latencia de respuesta del servidor.

CAPÍTULO 1: MÉTODO DE ISHIKAWA

IDENTIFICAR EL PROBLEMA

LISTA DE PROBLEMAS (Brainstorming)

A través de la observación directa de las planillas de producción, el análisis de la estructura de datos del Excel operativo y el levantamiento de información con el personal de planta, se han identificado los siguientes problemas:

P01. Registro manual de recepción de leche cruda con campos incompletos. Fuente: Hoja "CONTROL DE LECHE" (154 filas × 19 columnas). Se observa que de las 154 filas registradas, aproximadamente el 60% de las filas tienen campos NULL en columnas críticas como PRODUCTOR, HORA LLEGADA y VOLUMEN DE LECHE. Ejemplo: las filas F2 a F6 (enero 08–12) solo registran la fecha y nada más. Las filas F8–F9 del 13 de enero registran parámetros de laboratorio pero sin identificación del productor ni volumen. Esto imposibilita la trazabilidad del origen de la materia prima.

P02. Ausencia de identificación del proveedor ganadero en las recepciones. Fuente: Hoja "CONTROL DE LECHE", columna PRODUCTOR. De 154 registros, solo las filas a partir del 06 de marzo (F123 en adelante) identifican al productor como "Valle Nuevo". Todos los registros anteriores (enero–febrero, ≈120 filas) tienen el campo PRODUCTOR como None. Se desconoce si la leche proviene de uno o varios productores de la comunidad Basilio.

P03. Múltiples muestras de laboratorio por recepción sin estructura relacional. Fuente: Hoja "CONTROL DE LECHE". Para una misma fecha se registran 2 a 6 filas con parámetros distintos (pH, grasa, densidad), pero sin un identificador que vincule estas muestras a un pailón o tanque específico. Ejemplo: el 14 de enero (F10–F12) tiene 3 filas de análisis para un volumen de 3,200 L sin distinguir si son muestras de la misma carga o de diferentes productores.

P04. Parámetros de calidad de leche fuera de rango sin alerta ni rechazo automático. Fuente: Hoja "CONTROL DE LECHE". Se detectan registros con valores fuera de los rangos establecidos en el encabezado:

Célula somáticas > 400,000: F72 muestra 1,285; F74 muestra 858; F83 muestra 1,244; F93 muestra 1,381; F97 muestra 1,408; F109 muestra 1,500 (múltiples registros excedidos).

% Grasa < 3%: F76 registra 2.37%; F79 registra 2.65%; F80 registra 0.40% (leche descremada).

%H2O > 8.5%: F42 registra 11.7% y F43 registra 9.36%.

Punto de congelamiento: F55 muestra 4.0 (anómalo vs. el rango esperado >52). El sistema actual no bloquea estas recepciones ni emite alerta; el rechazo se anota manualmente en la columna ESTADO como texto libre ("LECHE MUY ACIDA", "DESCREMANDO").

P05. Estados operativos de la recepción registrados como texto libre sin catálogo estandarizado. Fuente: Hoja "CONTROL DE LECHE", columna ESTADO. Se encontraron al menos 7 variantes de texto libre:

DESCREMANDO, DESCREMADA, LECHE DECREMADA, LECHE DESCREMADA, SE DESCREMO → 5 variantes para el mismo concepto.

TINA LLENA → indicación operativa, no un estado de calidad.

LECHE MUY ACIDA → rechazo por acidez.

NO HUBO LECHE → día sin operación. Esta falta de estandarización impide filtrar, reportar y analizar los estados de forma confiable.

P06. Inventario de insumos químicos gestionado con columnas dinámicas por fecha. Fuente: Hoja "INVENTARIO DINAMICO" (39 filas × 50 columnas). El stock diario se registra agregando una nueva columna por cada fecha (ej: "STOC DEL DIA 03/02/2026", "stock 04/02", "STOCK DEL 05", "STOCK 23", "STOCK25", "STOCK 26", "STOCK 27"). Esta estructura crece horizontalmente de forma indefinida, haciendo el archivo cada vez más difícil de manejar. Además, los nombres de las columnas son inconsistentes (mezclan español, abreviaciones y formatos de fecha diferentes).

P07. Stock negativo de insumos sin detección ni alerta. Fuente: Hoja "INVENTARIO DINAMICO". El insumo N°23 (MANTEQUILLA) presenta stock de -7.60, -41.20 y -58 kg en columnas consecutivas. El insumo N°16 (SUERO EN POLVO) tiene condición de stock mínimo registrada como -2. Estos valores negativos indican consumos no registrados, errores de digitación o falta de control de salidas, y ninguno genera una alerta en el sistema actual.

P08. Insumos de producción y de limpieza mezclados en un mismo catálogo sin diferenciación. Fuente: Hojas "INVENTARIO DINAMICO" e "Inventario". El catálogo agrupa 38 productos sin distinción de uso:

Producción: Fermento Hansen, Cuajo Albamax, Ácido Láctico, Azúcar, etc.

Limpieza/desinfección: Cloroclean, Hiprox 500, Solución Desinfectante 15%.

Laboratorio: Hidróxido de Sodio 0.11N, Alcohol Etílico 70%. Esto dificulta el cálculo de costos de producción por lote, ya que los consumos de limpieza se mezclan con los de manufactura.

P09. Fechas de vencimiento de insumos registradas en formatos heterogéneos. Fuente: Hoja "Inventario". Las fechas de expiración se encuentran en al menos 4 formatos distintos: 2026-04-16 (ISO), S/F (sin fecha), NO VISIBLE (etiqueta ilegible), 24 MESES (período relativo sin fecha base). El sistema no puede calcular automáticamente días restantes ni emitir alertas de próximo vencimiento.

P10. Recetas/fórmulas maestras registradas como valores estáticos sin vinculación al consumo real. Fuente: Hojas "Recetas" y "RECETA DE DULCE". Las fórmulas del Queso Cheddar (15 ingredientes, 100.35% total) y del Dulce de Leche (Repostero y Familiar) están digitadas como tablas fijas. Cuando se produce un lote, el operario debe consultar manualmente esta hoja, calcular las cantidades para el volumen del día y luego registrar lo que realmente usó en otra hoja ("Registro de cheddar" o "Registro Dulce"). No existe validación automática entre lo que la receta indica y lo que efectivamente se consumió.

P11. Registro de producción de Dulce de Leche con 49 columnas y datos mixtos. Fuente: Hoja "Registro Dulce" (33 filas × 49 columnas). Cada fila de producción registra: fecha, tipo, pH, acidez, 7 insumos, 7 controles de proceso (hora + grados Brix + presión general + presión entrada), producto obtenido, rendimiento, presentaciones y horarios. Los datos de grados Brix se registran como texto libre con barras ("48/49", "3,5 / 2,5"), lo cual impide cálculos automáticos. Ejemplo: F10 (11-sep-2025) muestra '50 / 51,2' y '3,5 / 2,5' en dos columnas diferentes del mismo control.

P12. Errores de digitación evidentes en registros de producción. Fuente: Hoja "Registro Dulce". La fila F23 (04-mar-2026) registra ALMIDÓN PERFECTAMYL = 3,480 kg y SORBATO = 175 kg para solo 120 litros de leche. Comparado con producciones similares (3.84 kg y 0.15 kg respectivamente), estos valores son 1,000x superiores, evidenciando un error de digitación de unidades (g vs kg) que no fue detectado ni corregido por el sistema actual.

P13. Numeración de lotes inconsistente entre líneas de producción. Fuente: Hojas "CUAJADA", "Registro de cheddar", "STOCK DLCH". Se detectaron al menos 4 formatos distintos:

Mozzarella dic-2025: 121225STM (DDMMYY + texto libre)

Mozzarella ene-2026: 801261100 (sin separadores claros), 90126, 13012026 (formatos variables)

Cheddar: 0202261200CHL (DDMMYYHHMM + CHL) — más estandarizado

Dulce: 1212250945FL / 2602260900RL (DDMMYYHHMM + FL/RL) La falta de un estándar único impide la trazabilidad cruzada entre productos y genera confusión en los registros de stock.

P14. Hoja de CUAJADA con 70 columnas y estructura difícil de mantener. Fuente: Hoja "CUAJADA" (353 filas × 70 columnas). Las columnas 25 a 67 registran el peso individual de cada molde prensado (hasta 43 moldes por lote). Esta estructura "plana" obliga a tener columnas vacías en los lotes con menos moldes. El peso total de cuajada se calcula con una fórmula Excel que referencia todas estas columnas, generando errores #DIV/0! cuando hay filas vacías (F29, F35, F37, F39, F42, F43, F46–F48).

P15. Datos de control de proceso de cuajada con formatos mixtos e inconsistentes. Fuente: Hoja "CUAJADA". Campos que deberían ser numéricos contienen texto:

pH inicial: '6,53/32,2' (F2), '664/664' (F13) — mezcla pH con temperatura.

Temperatura: '36,1/35,5' (F13), 335.5 (F15) — error evidente, imposible 335°C.

Horarios con errores de formato: '12;10' (F14), '10:37/11::13' (F38), '12:334' (F38).

Masa CaCl2: alternan entre gramos enteros (532, 500) y decimales (0.44, 0.49) sin consistencia en la unidad de medida.

Hora de vaciado: 12.05 en F40 (formato numérico en vez de hora).

P16. Registros de producción con campos vacíos en datos esenciales. Fuente: Hojas "Registro de cheddar" y "CUAJADA". El registro de cheddar presenta:

PESO TOTAL en blanco para 15 de 27 lotes registrados (F7–F12, F15, F17–F22, F25, F30).

TEMPERATURA vacía para 12 lotes.

HORA INICIAL/FINAL vacías para 10 lotes. Sin estos datos no se puede calcular el rendimiento real (kg producidos / kg insumos), el tiempo de producción ni los costos energéticos.

P17. Control de stock de producto terminado desconectado de la producción. Fuente: Hojas "STOCK DLCH" y "STOCK QCHL". El stock de cámara fría se registra en hojas separadas de los registros de producción. No existe un vínculo automático: cuando se termina un lote de producción, alguien debe ir manualmente a la hoja de STOCK y agregar una fila. El lote 2502261330CHL aparece en STOCK QCHL marcado como "LOTE VENDIDO" en texto libre (no hay campo booleano ni fecha de venta).

P18. Despachos registrados de forma rudimentaria sin control de inventario. Fuente: Hojas "STOCK DLCH" y "STOCK QCHL". Los despachos se registran en una mini-tabla dentro de la misma hoja de stock:

Dulce: Solo 1 despacho registrado (27-feb-2026, 6 unidades de 250g del lote 1301261200FL).

Cheddar: 2 despachos el 06-mar-2026 (37 uds del lote 2502261330CHL + 9 uds del lote 2502260930CHL). No se registra: cliente destino, factura asociada, responsable del despacho, medio de transporte ni temperatura de salida. La resta del stock no es automática.

P19. Proceso de hilado de Mozzarella sin vinculación al lote de cuajada. Fuente: Hoja "HILADO" (201 filas × 3 columnas). Solo se registra FECHA y PESO HILADO (g). No existe campo de LOTE que vincule el hilado a la cuajada de origen. Un mismo día puede tener 5–10 filas de pesos individuales (cada molde hilado) sin saber de qué tina provienen. Ejemplo: 22-dic-2025 tiene pesos de 1100, 550, 550, 500, 720 gramos sin una referencia cruzada.

P20. Hojas "dinámicas" que replican datos con fórmulas frágiles. Fuente: Hojas "REGISTRO DULCE DINAMICO", "Registro chedar dinamico", "HILADO DINAMICO", "CUAJADA DINAMICO". Estas 4 hojas son versiones calculadas de las hojas originales, usando fórmulas que referencian celdas de las hojas base. Cuando se insertan o eliminan filas en las hojas base, las fórmulas se rompen generando errores #REF!. Esto duplica la información y crea una fuente permanente de inconsistencias.

P21. Ausencia de registro de costos unitarios por lote. Fuente: Todas las hojas de producción. Ninguna hoja registra el costo de los insumos consumidos. Se registra la cantidad de cada ingrediente (kg/L) pero no su precio. Esto impide calcular el costo de producción por lote, el margen por producto y la rentabilidad por línea de producción. La gerencia no tiene visibilidad del costo real de un kilo de Queso Cheddar versus un kilo de Dulce de Leche.

P22. Sin historial digital consolidado antes de diciembre 2025. Fuente: Hoja "Registro Dulce". Los registros de Dulce de Leche comienzan en agosto 2025 y tienen un vacío de 4 meses (octubre 2025 a enero 2026). Los registros de Cuajada comienzan en diciembre 2025. No existe un repositorio digital de los primeros meses de operación de la empresa (mayo–noviembre 2025), lo que impide la construcción de líneas base para KPIs.

P23. Rendimiento del proceso calculado de forma inconsistente. Fuente: Hoja "Registro Dulce", columna "Rendimiento". El rendimiento se calcula como Producto Obtenido / Leche utilizada. Sin embargo:

F23 (04-mar-2026): registra 85 kg obtenidos de 120 L de leche = 70.8% de rendimiento, cuando los rendimientos normales del Dulce de Leche son 32–46%.

F9 (10-sep-2025): registra 125 kg de 250 L = 50%, pero sin ningún control de proceso (todos los controles en blanco). Un rendimiento del 70.8% es físicamente improbable e indica error en el volumen de leche registrado (probablemente 220 L en vez de 120 L).

P24. Sobrecarga de roles: una persona gestiona calidad, inventario, compras y despacho. Fuente: Perfil del proyecto y observación directa. La Ingeniera de Control de Calidad (responsable del laboratorio) también es quien mantiene las 18 hojas de Excel, registra las recepciones de leche, controla el inventario de insumos, gestiona las compras y coordina los despachos. Esta concentración de responsabilidades genera un cuello de botella humano y un riesgo de persona-dependencia crítico.

P25. Sin acceso concurrente a los datos operativos. Fuente: Estructura del archivo Excel. Todo el sistema de información opera sobre un único archivo Excel (.xlsx) que no soporta edición concurrente segura. Si el supervisor de producción necesita registrar un lote de cuajada mientras la ingeniera de calidad actualiza el inventario, uno de los dos debe esperar o trabajar en una copia, lo que genera versiones en conflicto.

P26. Planta aislada geográficamente sin conectividad con la oficina comercial. Fuente: Perfil del proyecto. La planta de producción se ubica en el km 102 de la carretera Biooceánica (comunidad Basilio), mientras que la línea comercial opera desde la ciudad. No existe un canal digital en tiempo real para que el equipo de ventas consulte el stock disponible antes de comprometer un pedido con el cliente.

P27. Múltiples presentaciones por lote sin control de equivalencia. Fuente: Hojas "STOCK DLCH" y "Registro Dulce". Un mismo lote de Dulce de Leche se envasa en hasta 3 presentaciones (Balde 5 kg, Balde 1 kg, Envases 250 g). El registro de producción (F13, 17-sep) muestra "11" en Balde 5kg, "4" en Balde 1kg y "175" en Envases 250g del mismo lote. Sin embargo, la hoja de STOCK no siempre desglosa por presentación, y no existe un mecanismo para verificar que la suma de presentaciones coincida con el peso total producido (11×5 + 4×1 + 175×0.25 = 55+4+43.75 = 102.75 kg ✓, pero esta validación no es automática).

P28. Datos de hoja "BALANCE PRINCIPAL" y "RESUMEN CAMARA 2" no vinculados a los datos fuente. Fuente: Hojas de resumen del Excel. Estas hojas contienen consolidados gerenciales que dependen de fórmulas que referencian las hojas de producción y stock. Si una fórmula se rompe o un dato fuente cambia, los resúmenes no se actualizan de forma confiable, generando decisiones basadas en información desactualizada.

P29. Tiempos de proceso no registrados consistentemente para análisis de eficiencia. Fuente: Hojas "Registro Dulce" y "Registro de cheddar". En "Registro Dulce", las columnas Hora Mezclado, Hora Cocción y Hora Final están frecuentemente vacías (9 de 17 registros sin Hora Final). En "Registro de cheddar", las columnas HORA INICIAL y HORA FINAL están vacías en 10 de 27 lotes. Sin estos datos, es imposible calcular tiempos de ciclo, identificar cuellos de botella en producción o estimar capacidad de planta.

P30. Información de "REGISTRO DE ENVASADO" sin estructura clara. Fuente: Hoja "REGISTRO DE ENVASADO". Esta hoja existe en el archivo pero su estructura no permite un mapeo claro a los lotes de producción. El peso final registrado en envasado no se cruza automáticamente contra el peso declarado en las hojas de producción, perdiendo la oportunidad de controlar mermas de envasado.

Problemas identificados desde el Perfil del Proyecto y las Entrevistas

P31. Desfase temporal de 2 a 8 horas entre el hecho productivo y su registro digital. Fuente: Entrevista N°2, Pregunta 10. Textualmente: "Se hace un inventario por día y registro en papel. Luego mi Supervisor de Producción es el encargado de pasarlo transcribiendo cada uno a Excel, cuantificando suma de semana y actualizando recién el stock ahí." Este desfase significa que durante la jornada productiva (07:30–17:00), los datos disponibles en Excel son del día anterior o incluso de la semana pasada. En una empresa donde la producción y el despacho ocurren el mismo día, esta demora invalida cualquier consulta de stock en tiempo real.

P32. Gestión de pedidos comerciales a través de WhatsApp sin registro estructurado. Fuente: Entrevista N°2, Pregunta 2. Textualmente: "Tenemos un grupo de WhatsApp. Nos piden normalmente fines de semana o entre semana para despachar obligatoriamente los días Martes y Viernes." No existe un sistema de pedidos formal. Los requerimientos de clientes como Hot Burger llegan como mensajes de texto sin confirmación de stock, sin número de orden, sin fecha compromiso registrada y sin validación contra el inventario disponible. Si un mensaje se pierde en el chat, el pedido se pierde.

P33. Ausencia de control de pagos, cuentas por cobrar e integración financiera. Fuente: Perfil, sección "Descripción del Problema" punto 5. Textualmente: "No se cuenta con ningún sistema de registro de pagos ni control de cuentas por cobrar integrado con el inventario y la producción. Las ventas y los cobros se gestionan de forma separada." Los métodos de pago son transferencia, QR y efectivo (Entrevista N°2, P5). No se lleva un estado de cuenta por cliente. La gerencia no puede saber en todo momento cuánto le deben los clientes ni cruzar cobros con despachos específicos.

P34. Producción bajo presión "día a día" sin margen de seguridad ni planificación. Fuente: Entrevista N°1, Pregunta 5. Textualmente: "Con el dulce de leche repostero se produce para el día siguiente; no se tiene reserva de producto. La demanda superó la capacidad de almacenamiento actual." La empresa opera sin un buffer de seguridad. Si ocurre un imprevisto (falla de caldera, leche rechazada, corte eléctrico), no puede atender los pedidos comprometidos del día siguiente. Este modelo reactivo es insostenible conforme la empresa escale.

P35. Devoluciones de producto sin protocolo formal ni trazabilidad al lote de origen. Fuente: Entrevista N°2, Pregunta 6. Textualmente: "El cliente notifica al área comercial y esta deriva el caso a Planta, cruzamos información con la contramuestra del laboratorio. Usualmente eligen reposición de nuevo producto o reintegro. Tuvimos unas 3 a 4 veces este problema históricamente." No existe un formulario de devolución, ni un registro digital de la queja, ni un campo que vincule la devolución al lote de producción para análisis de causa raíz. Si el problema es de inocuidad (contaminación), la empresa no podría identificar qué otros clientes recibieron producto del mismo lote.

P36. Separación física entre Planta y Línea Comercial sin integración de datos. Fuente: Entrevista N°2, Pregunta 3 y 9. La Planta emite un "Recibo de Entrega" manual. La Factura legal la emite la "Línea Comercial" (oficinas de Santa Cruz, horario 08:00–18:00). No hay cruce entre el recibo de planta y la factura comercial. Si el área comercial desconoce el estado del inventario en planta, puede comprometer pedidos que no se pueden cumplir, o dejar de vender stock que sí está disponible.

P37. Compras de insumos planificadas manualmente con "códigos de producto" sin sistema. Fuente: Entrevista N°2, Pregunta 7. Textualmente: "Hacemos la solicitud de compras mediante Códigos de Producto exacto cada Viernes/Sábado. Tenemos un mínimo guardado para amortiguar los 3 a 5 días que tarda en llegar desde la ciudad." No existe un sistema de requisiciones ni alertas automáticas. El "mínimo guardado" es un juicio subjetivo, no un cálculo basado en consumo promedio y lead time de reposición. La hoja "INVENTARIO DINAMICO" muestra insumos con stock negativo (-58 kg de mantequilla), evidenciando que este método falla.

P38. Ausencia de organigrama formal, misión, visión y estructura organizacional documentada. Fuente: Perfil, sección "Antecedente". Textualmente: "Actualmente la empresa no cuenta con un organigrama formal consolidado, dado que se encuentra en proceso de estructuración organizacional." Esto implica que los roles y responsabilidades no están definidos formalmente. La Entrevista N°2 (P8) identifica 10 personas en total, pero la distribución real de funciones difiere del organigrama ideal: una sola persona (Ing. de Calidad) centraliza calidad + inventario + compras + coordinación de despacho.

P39. Sin control de acceso, roles ni permisos sobre los datos operativos. Fuente: Perfil, Alcance módulo 1 (RBAC). El archivo Excel no tiene restricciones de acceso. Cualquier persona que tenga acceso al archivo puede modificar cualquier dato histórico — incluidos precios, pesos, parámetros de calidad y registros de producción — sin dejar rastro. No existe log de auditoría ni versionado. Un error accidental (borrar una fila, sobreescribir una fórmula) puede corromper meses de información sin posibilidad de recuperación.

P40. Incumplimiento potencial de normativa SENASAG por falta de trazabilidad completa. Fuente: Perfil, sección "Descripción del Problema" punto 4. SENASAG (Servicio Nacional de Sanidad Agropecuaria e Inocuidad Alimentaria) exige trazabilidad completa desde la materia prima hasta el consumidor final. El estado actual de GRULAC no permite: (a) rastrear un lote de producto terminado hasta la leche de origen en menos de 2 horas (requisito de retiro de mercado), (b) identificar qué clientes recibieron producto de un lote específico, (c) demostrar mediante registros digitales que los parámetros de calidad fueron verificados en cada recepción. Ante una inspección sanitaria, la empresa tendría dificultades para demostrar cumplimiento.

Estadísticas del Brainstorming: Se identificaron 40 problemas brutos a partir de 3 fuentes: (1) análisis de 18 hojas de cálculo con 1,500+ registros operativos, (2) dos entrevistas con personal de planta, y (3) observación directa de los procesos productivos y documentos internos.

DEPURAR PROBLEMAS

Se aplican las reglas de depuración sistemática para transformar la lista cruda en problemas accionables:

Regla 1: Fusión de Duplicados

Regla 2: Reclasificación Síntoma → Causa

Regla 3: Exclusión por Alcance

Regla 4: Reformulación de Problemas Vagos

LISTA FINAL DE PROBLEMAS

Tras el proceso de depuración, los 40 problemas brutos se consolidan en 15 problemas nucleares clasificados por dimensión:

Estadísticas de la Depuración

Distribución por Dimensión

Conclusión de la depuración: El 67% de los problemas son de prioridad Alta, lo cual confirma que la empresa opera en un estado de riesgo permanente. La dimensión más afectada es DIM-CON (Control y Trazabilidad) con 5 de 15 problemas, seguida de DIM-INF (Información) con 4 de 15. Esto refleja que GRULAC no solo tiene un problema tecnológico (falta de software), sino un problema sistémico de gobernanza de datos y control de procesos que el sistema debe resolver de forma integral.

PROPIETARIOS DE PROBLEMAS

Áreas Funcionales de GRULAC S.R.L.

Tabla de Propietarios y Problemas

Análisis de Patrones

1. Áreas que GENERAN más problemas:

2. Áreas que SUFREN más problemas:

3. Cuello de Botella Identificado:

La Ing. de Control de Calidad aparece como responsable en 6 de 15 problemas generados y simultáneamente como víctima de 6 problemas (incluido PF-12, la sobrecarga directa). Este hallazgo confirma que la concentración de funciones en una sola persona es el principal factor de riesgo operativo de GRULAC S.R.L. El sistema de información debe liberar a esta persona de las tareas de digitación (estimado 3-4 horas/día) para que pueda enfocarse en su función principal: la supervisión de calidad e inocuidad alimentaria.

4. Problema Huérfano:

El problema PF-11 (sin costeo por lote) no tiene un "dueño" natural que lo genere — nadie en la empresa ha tenido nunca la función de costear la producción. Es un problema organizacional cuya responsabilidad recae en la gerencia y que el sistema deberá resolver habilitando la captura automática de costos vinculados a cada lote.

5. Brecha Planta–Ciudad:

Los problemas PF-13 y PF-14 revelan una fractura operativa entre la Planta (km 102, Basilio) y la Línea Comercial (Santa Cruz). Los pedidos viajan por WhatsApp (informal, sin validación), el recibo de entrega no se cruza con la factura, y los cobros se gestionan por separado. El sistema debe actuar como puente digital entre ambas ubicaciones, unificando pedidos, stock, despacho y cobranza en una sola plataforma accesible desde ambos puntos.

6. Riesgo Legal Transversal:

PF-15 es el problema con mayor potencial de daño irreversible. Un reclamo de inocuidad ante SENASAG sin poder demostrar trazabilidad completa podría resultar en sanciones, cierre temporal o pérdida de la certificación sanitaria. Este problema afecta a TODAS las áreas y es el principal argumento de urgencia para la implementación del sistema.

Matriz Cruzada: Problema × Área Funcional

Leyenda:

ANÁLISIS DE PROBLEMAS

PF-01 Sin sistema de información integrado

CAPA 1: Problemas directos de la ausencia de sistema

PF-02 Recepción de leche sin integridad

PF-03 Inventario inmanejable y compras manuales

PF-05 Datos de producción formatos mixtos

PF-06 Estructura de datos no normalizada

PF-10 Fórmulas frágiles hojas dinámicas

PF-12 Sobrecarga operativa persona-dependencia

CAPA 2: Problemas derivados

PF-04 Recetas sin vínculo al consumo real

PF-07 Numeración de lotes inconsistente

PF-08 Stock desconectado producción/despacho

PF-09 Hilado sin trazabilidad a cuajada

PF-11 Sin costeo por lote

PF-13 Pedidos por WhatsApp sin planificación

PF-14 Control financiero desintegrado

NODO TERMINAL

PF-15 Riesgo SENASAG sin auditoría digital

Lectura del Grafo

ESTIMACIÓN Y CUANTIFICACIÓN DE PROBLEMAS

Síntesis: Los problemas de mayor gravedad porcentual son aquellos con 100% de afectación — es decir, problemas que afectan la totalidad de los registros o procesos involucrados (PF-01, PF-07, PF-09, PF-10, PF-13, PF-15). Estos 6 problemas representan un riesgo sistémico que solo puede resolverse con la implementación de un sistema de información integral.

ALTERNATIVAS DE CAMBIO

Se presentan tres alternativas para resolver la problemática diagnosticada, evaluadas en función de su cobertura sobre los 15 problemas identificados, su viabilidad técnica y su sostenibilidad a largo plazo:

Alternativa A: Mantener el Status Quo con Mejoras Incrementales en Excel

Alternativa B: Adquirir un Software ERP Genérico del Mercado

Alternativa C: Desarrollo del Sistema Integral a Medida (Propuesta del Proyecto)

Tabla Comparativa de Alternativas

CONCLUSIÓN Y RECOMENDACIÓN

Conclusión

El diagnóstico situacional de GRULAC S.R.L. mediante el Método de Ishikawa ha revelado un escenario de vulnerabilidad operativa sistémica que se sintetiza en los siguientes hallazgos:

Magnitud del problema: Se identificaron 40 problemas brutos que, tras un proceso riguroso de depuración (fusión de duplicados, reclasificación de síntomas, exclusión por alcance y reformulación), se consolidaron en 15 problemas nucleares. El 67% (10 de 15) tienen prioridad Alta con impacto Crítico y urgencia Inmediata.

Raíz única: El análisis del grafo dirigido demuestra que los 15 problemas se derivan directa o indirectamente de una sola causa raíz: PF-01 — la ausencia de un sistema de información integrado. Este problema estructura toda la cascada causal que termina en el nodo más peligroso: PF-15 — riesgo de incumplimiento SENASAG.

Afectación sistémica: La cuantificación revela que 6 de los 15 problemas tienen una afectación del 100% sobre los procesos involucrados (PF-01, PF-07, PF-09, PF-10, PF-13, PF-15), lo cual indica que no se trata de deficiencias parciales sino de vacíos totales en la gestión de la información. El 60% del tiempo administrativo se destina a transcripción manual, el 55% de los registros carecen de datos esenciales, y el 100% de los pedidos se gestionan informalmente.

Cuello de botella humano: La Ingeniera de Control de Calidad genera 6/15 problemas y sufre 6/15 problemas simultáneamente. Dedica un estimado del 40–45% de su jornada laboral a tareas de digitación manual que el sistema eliminaría, restándole tiempo a su función principal: la supervisión de calidad e inocuidad alimentaria.

Brecha geográfica: La desconexión entre Planta (km 102, Basilio) y Línea Comercial (Santa Cruz) genera problemas de pedidos (PF-13), facturación (PF-14) y riesgo legal (PF-15) que solo un sistema accesible desde internet puede resolver.

Riesgo sanitario: PF-15 es el problema con mayor potencial de daño irreversible. La empresa no puede demostrar trazabilidad completa ni registros de calidad verificables ante una inspección de SENASAG, lo que representa un riesgo directo de sanción, cierre temporal o pérdida de certificación.

Recomendación

Se recomienda adoptar la Alternativa C: Desarrollo del Sistema Integral a Medida, por las siguientes razones:

Es la única alternativa con cobertura del 100% de los problemas identificados. La Alternativa A (Excel mejorado) solo cubre el 20% y la Alternativa B (ERP genérico) el 33%.

Está diseñado específicamente para la industria láctea artesanal, integrando módulos que un ERP genérico no ofrece: recepción de leche con parámetros SENASAG, recetas con descuento automático de insumos, trazabilidad de moldes/hilado, y control FEFO para productos perecederos.

Resuelve la brecha Planta–Ciudad al ser un sistema web accesible desde cualquier dispositivo con internet, permitiendo que la Línea Comercial consulte stock en tiempo real y registre pedidos que se reflejan instantáneamente en planta.

El código fuente queda como propiedad de GRULAC S.R.L., eliminando la dependencia de un proveedor externo y permitiendo la adaptación futura a nuevas líneas de producción o regulaciones.

Mitiga el riesgo SENASAG al implementar trazabilidad completa lote→cliente con log de auditoría inmutable (Triggers de PostgreSQL), cumpliendo los requisitos de rastreo que la normativa sanitaria boliviana exige.

Libera al personal calificado de tareas de digitación, devolviendo a la Ingeniera de Calidad ~3.5 horas diarias para actividades de supervisión, control de procesos y mejora continua

.

Decisión final: Se procede con el desarrollo del Sistema de Información para la Gestión de Inventario, Producción y Despacho de Lácteos GRULAC S.R.L. bajo la Alternativa C, utilizando el stack tecnológico Node.js + Next.js + PostgreSQL + Supabase, con la metodología PUDS y documentación UML 2.5.

DIAGRAMA DE ISHIKAWA

Identificar las Principales Categorías

EFECTO CENTRAL: "Gestión operativa ineficiente y riesgo sanitario en GRULAC S.R.L. por ausencia de un sistema de información integrado que centralice los procesos de recepción, producción, inventario, despacho y control de calidad."

Este efecto sintetiza los 15 problemas nucleares identificados en las secciones anteriores y corresponde directamente al problema raíz PF-01, desde el cual se derivan todos los demás problemas según el grafo dirigido de la sección 1.5.

Para estructurar las dimensiones del problema central, se identifican las 6 principales categorías correspondientes a la metodología M (6M):

Métodos (Procesos y Procedimientos)

Maquinaria (Tecnología e Infraestructura)

Mano de Obra (Personal y Roles)

Materiales (Datos e Insumos de Información)

Medición (Control, Trazabilidad y Métricas)

Entorno Organizacional (Contexto y Entorno Regulador)

1. MÉTODOS (Procesos y Procedimientos)

2. MAQUINARIA (Tecnología e Infraestructura)

3. MANO DE OBRA (Personal y Roles)

4. MATERIALES (Datos e Insumos de Información)

5. MEDICIÓN (Control, Trazabilidad y Métricas)

6. ENTORNO ORGANIZACIONAL

Diagrama de Ishikawa (Espina de Pescado)

IDENTIFICAR LAS PRINCIPALES CATEGORIAS

IDENTIFICAR LAS CAUSAS

Analizar y Discutir el Diagrama

Síntesis y Discusión del Diagrama

El Diagrama de Ishikawa de GRULAC S.R.L. revela que las 29 causas identificadas se distribuyen de forma equilibrada entre las 6 categorías:

Hallazgo principal: Las 29 causas convergen en un único efecto central: la gestión operativa ineficiente por ausencia de un sistema de información integrado. Las categorías con mayor concentración de causas críticas son Métodos y Medición, lo que indica que GRULAC no solo carece de herramientas (Maquinaria), sino que además no tiene procesos definidos (Métodos) ni capacidad de medir su desempeño (Medición). Esta tríada — sin herramientas + sin procesos + sin métricas — configura un escenario donde la implementación del sistema no solo debe proveer software, sino también imponer estructura operativa a través de formularios obligatorios, validaciones automáticas, workflows secuenciales y alertas proactivas.

Vinculación con la solución: Cada una de las 29 causas tiene un módulo del sistema asignado (columna "Módulo del Sistema" en la tabla anterior). Los 15 módulos funcionales del alcance del proyecto cubren la totalidad de las causas identificadas, confirmando que la arquitectura propuesta responde directamente al diagnóstico Ishikawa. No existen causas huérfanas sin solución tecnológica dentro del alcance.

CAPÍTULO 2: MODELO DE NEGOCIO

DIAGRAMA DE ACTIVIDADES

# CAPÍTULO 2: MODELO DE NEGOCIO — Diagramas de Actividad de la Empresa (SITUACIÓN ACTUAL / AS-IS)

> **Nota Metodológica:** Los siguientes diagramas modelan los procesos **exactos que la empresa ejecuta HOY en día sin un sistema ERP**. Reflejan explícitamente el uso de múltiples planillas de Excel no conectadas, comunicación informal por WhatsApp, y decisiones basadas puramente en la intuición de los operarios. Esto evidencia gráficamente las fallas diagnosticadas en el Método Ishikawa que justifican el desarrollo del nuevo software.

---

## Diagrama 1: Recepción Orgánica de Leche Cruda (Proceso Manual Actual)

**Herramientas Actuales:** Hoja de Excel "CONTROL DE LECHE", Cuaderno a mano.  
**Problema Evidenciado:** Pérdida de datos (60% de recepciones anónimas), incapacidad de frenar contaminación (no hay cruce automático).

```plantuml
@startuml DA01_AS_IS_Recepcion
title Situación Actual: Recepción de Leche Cruda (Procedimiento Manual)
skinparam backgroundColor #FEFEFE

|Ganadero Proveedor|
|Ing. Industrial (Recepción)|
|Base de Datos Excel (Aislada)|

|Ganadero Proveedor|
start
:Llega Cisterna al km 102;
:Entrega remito de recolección;

|Ing. Industrial (Recepción)|
:Toma muestras físicas de la leche;
:Realiza pruebas manuales de laboratorio\n(pH, Células Somáticas, Antibióticos);
:Escribe resultados en cuaderno borrador;

if (¿Es evidente adulteración letal?) then (SI — Visual)
  :Rechaza cisterna informalmente\n(Acuerdo verbal);
  stop
else (NO — Parece normal)
  :Ordena vaciar leche\nal silo de planta;
  
  :Abre Hoja de Excel\n"CONTROL DE LECHE";
  
  fork
    :Registra volumen de litros;
  fork again
    :Registra resultados de\npruebas (texto libre);
    note right
      Falla Actual: Se registran textos
      como "DESCREMANDO" sin estándar,
      ni alertas si hay >400k células.
    end note
  fork again
    :¿Registrar nombre del proveedor?;
    if (¿Anota proveedor?) then (NO)
      :Deja campo PRODUCTOR en blanco;
      note right
        Falla Actual: Genera 60%
        de filas anónimas (PF-02).
      end note
    else (SI)
      :Escribe nombre en texto libre;
    endif
  end fork
  
  |Base de Datos Excel (Aislada)|
  :Archivo "CONTROL DE LECHE.xlsx"
  Guardado localmente;
  
  |Ing. Industrial (Recepción)|
  :Fin del turno;
  stop
endif
@enduml
```

---

## Diagrama 2: Procesamiento Lácteo y Consumo de Insumos (Proceso Manual Actual)

**Herramientas Actuales:** Hojas Excel "CUAJADA" y "Registro de cheddar".  
**Problema Evidenciado:** Desconexión total entre el inventario y la producción. No hay deducción automática de sal, cuajo ni mantequilla.

```plantuml
@startuml DA02_AS_IS_Produccion
title Situación Actual: Producción de Queso (Procedimiento Manual)
skinparam backgroundColor #FEFEFE

|Jefe de Producción|
|Administrador (Fin de Semana)|
|Base de Datos Excel (Aislada)|

|Jefe de Producción|
start
:Decide empíricamente qué queso fabricar;
:Añade leche y fermentos a la tina\n(Fórmula de memoria o ficha de papel);
:Elabora el queso;

:Abre Hoja Excel "CUAJADA";
:Registra código de lote\n(Texto libre/Diferentes formatos);
note right
  Falla Actual: Formatos caóticos
  como "121225STM" o "801261100" (PF-07)
end note

:Pesa quesos y anota en Excel\n(A veces olvida poner Peso Total);

|Base de Datos Excel (Aislada)|
:Archivo guardado (No está en red);

|Jefe de Producción|
:Lleva los quesos físicamente\na Cámara Fría;
stop

|Administrador (Fin de Semana)|
start
:Llega el viernes de auditoría;
:Visita la bodega para \ncontar insumos restantes;
:Abre Hoja "INVENTARIO DINAMICO";
:Resta mentalmente lo que "cree"\nque el Jefe de Producción usó;
note right
  Falla Actual: Al no cruzar recetas (BOM)
  con inventario diario, se generan
  cuadratura con stock en NEGATIVO
  (Ej: -58 kg Mantequilla).
end note
stop
@enduml
```

---

## Diagrama 3: Control de Calidad y Traspaso Inseguro (Proceso Manual Actual)

**Problema Evidenciado:** El ingeniero de calidad corre "detrás" del producto. Un producto puede venderse antes de ser analizado, arriesgando la certificación SENASAG (PF-15).

```plantuml
@startuml DA03_AS_IS_QA
title Situación Actual: Calidad QA (Procedimiento Manual)
skinparam backgroundColor #FEFEFE

|Jefe de Producción|
|Encargado de Despacho|
|Ingeniero de Calidad (QA)|

|Jefe de Producción|
start
:Termina producción de lote;
:Guarda queso en Cámara Fría;
:Avisa verbalmente que "ya hay queso";

fork
  |Encargado de Despacho|
  :Ve queso físico disponible
  en la cámara de frío;
  if (¿Aparece un pedido de cliente?) then (SI)
    :Despacha el queso Inmediatamente;
    note left
      Falla Actual: Se expide
      producto a la calle SIN 
      dictamen oficial de laboratorio.
      (Riesgo SENASAG directo)
    end note
    stop
  else (NO)
    :Queso esperando;
  endif
  
fork again
  |Ingeniero de Calidad (QA)|
  :Al día siguiente extrae\nuna contramuestra del queso;
  :Realiza análisis Básico;
  :Imprime ficha y la firma a mano;
  :Archiva papel en un archivador (Kardex físico);
  
  if (¿El queso estaba malogrado?) then (SI)
    :Avisa al despacho\n"No vendan el lote X";
    |Encargado de Despacho|
    if (¿El lote ya salió en camión?) then (SI)
      :¡Problema Comercial!\n(Genera devolución tardía);
    else (NO)
      :Aparta queso físicamente;
    endif
  else (NO — Estaba bien)
  endif
  stop
end fork
@enduml
```

---

## Diagrama 4: Pedidos y Despacho Informal (Proceso Manual Actual)

**Herramientas Actuales:** WhatsApp Corporativo, Hojas "STOCK DLCH" y "STOCK QCHL".  
**Problema Evidenciado:** Pedidos cruzados, ventas sin inventario físico disponible y nula asignación de lotes a clientes específicos (PF-13, PF-14).

```plantuml
@startuml DA04_AS_IS_Ventas
title Situación Actual: Ventas y Despacho (Procedimiento Manual)
skinparam backgroundColor #FEFEFE

|Cliente|
|Asesor Comercial (Oficina)|
|Encargado de Despacho (Planta)|

|Cliente|
start
:Envía mensaje de WhatsApp\n"Necesito 20kg de Cheddar";

|Asesor Comercial (Oficina)|
:Lee WhatsApp;
:Asume que hay stock\n(No tiene visibilidad real de la cámara);
:Confirma pedagógicamente al cliente;
:Reenvía pedido por WhatsApp a Planta;

|Encargado de Despacho (Planta)|
:Lee grupo de WhatsApp;
:Entra a Cámara Fría;
:Busca quesos visualmente;

if (¿Hay 20kg de cheddar?) then (NO)
  :Escribe al Asesor:\n"No alcanza el cheddar";
  |Asesor Comercial (Oficina)|
  :Avisa al cliente que\nno podrá entregarle todo;
  :Pierde venta parcial (Fricción B2B);
  stop
else (SI — Hay Queso)
  |Encargado de Despacho (Planta)|
  :Prepara el producto;
  :Toma cualquier queso\n(El que esté más al frente);
  note right
    Falla Actual: NO se aplica 
    estrategia FEFO. Quesos viejos 
    se quedan al fondo y caducan.
  end note
  
  :Entrega a chofer;
  
  :Abre Excel "STOCK QCHL";
  :Registra 'salida' precaria;
  note right
    Falla Actual: No anota qué Lote
    específico se llevó el Cliente X, 
    imposibilitando rastreos futuros.
  end note
  stop
endif
@enduml
```

---

## Diagrama 5: Inventario Caótico y Compras Empíricas (Proceso Manual Actual)

**Problema Evidenciado:** Las 50+ columnas del Excel que crecen horizontalmente destruyen la escalabilidad y provocan quiebres de stock continuos (PF-03, PF-06).

```plantuml
@startuml DA05_AS_IS_Inventario
title Situación Actual: Control de Inventario y Compras (Procedimiento Manual)
skinparam backgroundColor #FEFEFE

|Administrador (Planta)|
|Jefe de Producción|
|Proveedor de Insumos|

|Administrador (Planta)|
start
:Al final de la jornada laboral;
:Abre el "INVENTARIO DINAMICO.xlsx";
:Selecciona la última columna de la derecha;
:Inserta nueva columna a la derecha\n(Ej: "STOCK DEL DIA 03/02");
note right
  Falla Actual: Hoja insostenible de 
  60 columnas horizontales, imposibilitando 
  hacer consultas, filtros o gráficos históricos.
end note

|Jefe de Producción|
:Grita desde la sala de tinas:\n"¡Nos quedamos sin Cuajo y hay poca sal!";

|Administrador (Planta)|
:Busca 'Cuajo' visualmente en Excel;
:Revisa compras de la semana pasada\n(Para intentar adivinar cuánto usarán);
:Decide comprar "A ojo" basado\nen intuición;

:Llama al proveedor por teléfono;
:Realiza pedido informal;

|Proveedor de Insumos|
:Envía mercadería (3-5 días);

|Administrador (Planta)|
:Recibe cajas;
:Anota en un papel\nlas fechas de vencimiento;
:Añade unidades al Excel (Si no olvida);
stop
@enduml
```



# CAPÍTULO 3: FLUJO DE TRABAJO Y CAPTURA DE REQUISITOS

Este capítulo traduce el modelo de negocio diagnosticado (Capítulo 2) en los componentes funcionales que construirán el Sistema ERP. Todo el análisis está sustentado en el comportamiento anómalo detectado en la auditoría del registro histórico (Excel) y la necesidad de dar un cumplimiento forense estricto a la normativa del SENASAG.

## 3.1 Identificación de Actores del Sistema

Acorde a la metodología de modelado de sistemas (UML), los actores no solo representan a los usuarios humanos directos que inician sesión, sino también a *agentes sistémicos automatizados* y *entidades externas* que desencadenan eventos dentro de la fábrica. 

Bajo esta premisa, la arquitectura contempla **9 actores clave** clasificados en tres dimensiones:

### A) Actores Internos (Operadores de Planta y Ciudad)

Poseen acceso directo a la plataforma (tabla: `usuarios` vinculado a `roles`) operando bajo un modelo de Control de Acceso Basado en Roles (RBAC estricto):

1. **Administrador General / Gerencia Técnica:** 
   - *Rol Sistémico:* Control panóptico sobre el ecosistema completo.
   - *Impacto en Vida Real:* Gestiona el catálogo maestro (`catalogo_items`), autoriza compras de insumos basadas en sugerencias automáticas, aprueba pagos (`pagos_proveedores`) y maneja la jerarquía de empleados. Es el receptor final de correos de alerta crítica (ej. quiebres de stock o recepciones con antibióticos).

2. **Ing. Industrial (Receptor / Laboratorista):** 
   - *Rol Sistémico:* Guardián del kilómetro cero (Planta km 102).
   - *Impacto en Vida Real:* Recibe cisternas físicas. Su obligación es teclear el volumen real ingresado y ejecutar el triage bioquímico (pH, acidez Dornic, células somáticas). El sistema le otorga la potestad de rechazar cisternas perjudiciales bloqueando el acopio, afectando el historial transaccional del ganadero en tiempo real.

3. **Jefe de Producción (Tinas y Proceso):**
   - *Rol Sistémico:* Orquestador del núcleo manufacturero.
   - *Impacto en Vida Real:* Quien decide aperturar lotes de Cuajada, Cheddar o Dulce (`ordenes_produccion`). El sistema le permite seleccionar la receta (BOM) y automáticamente deduce stock del hilo productivo. Su deber es asentar los parámetros de fabricación (horarios de cloruro y cuajo) e ingresar los kilogramos brutos obtenidos de la molienda/cuajado para justificar mermas técnicas.

4. **Ingeniero de Calidad (QA):**
   - *Rol Sistémico:* Barrera de sanidad irrevocable (Filtro SENASAG).
   - *Impacto en Vida Real:* Es un actor restrictivo que NUNCA produce ni vende. Su única labor es tomar muestras cruzadas a los quesos terminados. Si aprueba una ficha de calidad (`fichas_calidad`), el sistema desbloquea automáticamente el lote. Si decreta un defecto subsanable (ej. falta sal), detona el flujo inverso ordenando el reproceso en tina.

5. **Encargado de Almacén y Despacho:**
   - *Rol Sistémico:* Custodio de las áreas logísticas y control de termodinámica.
   - *Impacto en Vida Real:* Realiza la captura de temperatura ambiental y opera el lector en zona de despacho. Acata las recomendaciones **FEFO** (Primero en caducar, primero en salir) del sistema y ancla físicamente el código de lote (`lote_produccion`) al camión de ruta (`despachos_logisticos`), cerrando la trazabilidad.

6. **Asesor Comercial (Oficina Ciudad / Vendedor):**
   - *Rol Sistémico:* Frontera de ingresos B2B/B2C.
   - *Impacto en Vida Real:* Basado a distancia (ciudad). No manipula queso, pero sí visualiza el *Stock Disponible Virtual*. Si un cliente emite demanda, acciona *Reservas Preventivas* (para no estrellarse contra otra venta). Carga pedidos, factura e inicia la logística inversa ante eventuales reclamos y `devoluciones_qa`.

### B) Actores Externos (Entidades de Negocio)

Existen en el sistema como registros transaccionales; no teclean ni tienen login, pero originan y cierran la cadena causal.

7. **Proveedor (Ganadero de Leche / Insumos Agrarios):** 
   - *Relación Sistémica:* Origen físico de la materia.
   - *Impacto en Vida Real:* Suministra la materia prima (`proveedores`). Cuenta con un estado de riesgo algorítmico ('Activo', 'Observado', 'Inhabilitado'); si su leche da positivo a trazas contaminantes o dilución por agua, el sistema restringe cualquier negocio futuro con este actor.

8. **Cliente Final (Supermercado / Distribuidor Mayorista):**
   - *Relación Sistémica:* Fin logístico y validador comercial.
   - *Impacto en Vida Real:* El detonante de los pedidos (`clientes`). En el peor escenario de la vida real, es quien formula un reclamo por queso hinchado. Este actor obliga al sistema a retrazar inversamente la vía: Cliente → Camión → Lote → Receta → Cisterna origen (Protocolo Epidemológico).



---

## 3.2 Lista de Casos de Uso Primarios (Granularidad Atómica)

Derivados estrictamente del bloque de alcance del proyecto y refinados tras la revisión del Ciclo 1, se enuncian unificados y formalizados los **32 Casos de Uso** directos que sostendrán el flujo del ERP agroindustrial, desglosados bajo estricta separación de responsabilidades:

- **CU01**: Iniciar Sesión en Plataforma
- **CU02**: Cerrar Sesión Activa
- **CU03**: Registrar Nuevo Empleado
- **CU04**: Inhabilitar Empleado (Dar de baja lógica)
- **CU05**: Asignar/Modificar Roles y Permisos
- **CU06**: Consultar Bitácora de Auditoría
- **CU07**: Respaldar Fichas a Storage Externo
- **CU08**: Registrar Nuevo Producto/Insumo en Catálogo
- **CU09**: Consultar Kardex Dinámico (Historial)
- **CU10**: Registrar Ajuste Manual o Merma Aislada
- **CU11**: Configurar Alertas de Stock Mínimo
- **CU12**: Registrar Proveedor/Ganadero
- **CU13**: Inhabilitar Proveedor (Bloqueo)
- **CU14**: Elaborar Orden de Compra de Insumos
- **CU15**: Registrar Recepción Física de Insumos
- **CU16**: Registrar Pago a Proveedor
- **CU17**: Registrar Ticket de Ingreso de Cisterna (Volumen)
- **CU18**: Registrar Dictamen de Triage Bioquímico (Aceptación/Rechazo)
- **CU19**: Registrar Receta Base (Ingeniería BOM)
- **CU20**: Aperturar Orden de Producción
- **CU21**: Registrar Parámetros Físicos (Mermas, Tiempos, Temperatura)
- **CU22**: Codificar Lote Físico Terminado
- **CU23**: Registrar Ficha de Control de Calidad
- **CU24**: Aprobar/Liberar Lote a Almacén
- **CU25**: Enviar Lote a Cuarentena/Reproceso
- **CU26**: Registrar Cliente Comercial (B2B/B2C)
- **CU27**: Generar Pedido de Venta (Reserva de stock)
- **CU28**: Emitir Factura Comercial
- **CU29**: Ejecutar Despacho Físico (Descontar de Kardex por FEFO)
- **CU30**: Registrar Devolución de Queso (Logística Inversa)
- **CU31**: Cambiar Contraseña Propia
- **CU32**: Recuperar Contraseña Olvidada (Reset vía email)

## 3.3 Priorización y Planificación de Iteraciones (Ciclos RUP)

Siguiendo estrictamente las directrices del **Proceso Unificado de Desarrollo de Software (Jacobson, Booch, Rumbaugh)**, la construcción del modelo priorizó la mitigación de riesgos arquitectónicos (Architecture-Centric). El flujo de trabajo divide los 32 Casos de Uso Atómicos en **4 Iteraciones Incrementales**:

### Ciclo #1 Iteración — Arquitectura Base y Riesgo Estructural (Incepción)
**Justificación (RUP):** Mitiga el riesgo fundacional. Sin seguridad básica (incluyendo la gestión integral de credenciales) y Catálogos de Datos Maestros abstractos, no existe base de datos operativa.
- **Actores Implicados:** Administrador General, Asesor Comercial.
- **R.F (Casos de Uso a implementar):**
  - **CU01**: Iniciar Sesión en Plataforma (Prioridad: Alta)
  - **CU02**: Cerrar Sesión Activa (Prioridad: Alta)
  - **CU03**: Registrar Nuevo Empleado (Prioridad: Alta)
  - **CU04**: Inhabilitar Empleado (Prioridad: Alta)
  - **CU05**: Asignar/Modificar Roles y Permisos (Prioridad: Alta)
  - **CU08**: Registrar Nuevo Producto/Insumo en Catálogo (Prioridad: Alta)
  - **CU09**: Consultar Kardex Dinámico (Prioridad: Alta)
  - **CU12**: Registrar Proveedor/Ganadero (Prioridad: Alta)
  - **CU26**: Registrar Cliente Comercial B2B/B2C (Prioridad: Alta)
  - **CU31**: Cambiar Contraseña Propia (Prioridad: Alta)
  - **CU32**: Recuperar Contraseña Olvidada (Prioridad: Alta)

### Ciclo #2 Iteración — Dominio Logístico y Reglas SCM (Elaboración Temprana)
**Justificación (RUP):** Control estricto de la entrada física, configurando pre-requisitos de manufactura como las fórmulas BOM y validando recepciones de la calle.
- **Actores Implicados:** Ing. Industrial (Receptor), Jefe de Producción, Proveedor.
- **R.F (Casos de Uso a implementar):**
  - **CU13**: Inhabilitar Proveedor (Prioridad: Media)
  - **CU14**: Elaborar Orden de Compra de Insumos (Prioridad: Alta)
  - **CU15**: Registrar Recepción Física de Insumos (Prioridad: Alta)
  - **CU16**: Registrar Pago a Proveedor (Prioridad: Baja)
  - **CU17**: Registrar Ticket de Ingreso de Cisterna (Prioridad: Alta)
  - **CU18**: Registrar Dictamen de Triage Bioquímico (Prioridad: Alta)
  - **CU19**: Registrar Receta Base BOM (Prioridad: Alta)

### Ciclo #3 Iteración — Núcleo Manufacturero y QA (Construcción)
**Justificación (RUP):** La "lógica pesada" (Core Business). Creación de lotes de queso, cálculo y castigo de mermas, y los dictámenes irrefutables de calidad.
- **Actores Implicados:** Jefe de Producción, Ingeniero de Calidad (QA).
- **R.F (Casos de Uso a implementar):**
  - **CU10**: Registrar Ajuste Manual o Merma Aislada (Prioridad: Media)
  - **CU11**: Configurar Alertas de Stock Mínimo (Prioridad: Baja)
  - **CU20**: Aperturar Orden de Producción (Prioridad: Alta)
  - **CU21**: Registrar Parámetros Físicos Tiempos/Temperaturas (Prioridad: Alta)
  - **CU22**: Codificar Lote Físico Terminado (Prioridad: Alta)
  - **CU23**: Registrar Ficha de Control de Calidad (Prioridad: Alta)
  - **CU24**: Aprobar/Liberar Lote a Almacén (Prioridad: Alta)
  - **CU25**: Enviar Lote a Cuarentena/Reproceso (Prioridad: Alta)

### Ciclo #4 Iteración — Integración Comercial y Automatización (Transición)
**Justificación (RUP):** Frontera exterior del software. Salidas y ventas, así como automatismos de seguridad y reporte final.
- **Actores Implicados:** Asesor Comercial, Encargado de Despacho, Cliente, Administrador General.
- **R.F (Casos de Uso a implementar):**
  - **CU06**: Consultar Bitácora de Auditoría (Prioridad: Alta)
  - **CU07**: Respaldar Fichas a Storage Externo (Prioridad: Media)
  - **CU27**: Generar Pedido de Venta / Reserva (Prioridad: Alta)
  - **CU28**: Emitir Factura Comercial (Prioridad: Alta)
  - **CU29**: Ejecutar Despacho Físico por FEFO (Prioridad: Alta)
  - **CU30**: Registrar Devolución de Queso (Prioridad: Alta)

## 3.4 Especificación Detallada de Casos de Uso

A continuación se presenta el detalle formal de los Casos de Uso del sistema, documentando sus diagramas específicos, flujos lógicos, condiciones y reglas de negocio. 

### CICLO 1: Arquitectura de Seguridad y Trazabilidad Base

#### CU01: Iniciar Sesión en Plataforma (Autenticación)

**A. Estructura del Modelo de CU (Diagrama Específico)**
```plantuml
@startuml
left to right direction
actor "Usuario Autenticado" as UsuarioBase
rectangle "Sistema ERP GRULAC" {
  usecase "CU01: Iniciar Sesión" as CU01
  usecase "Validar Credenciales (DB)" as Validar
  usecase "Bloquear Acceso (3 Intentos)" as Bloquear
}
UsuarioBase --> CU01
CU01 ..> Validar : <<include>>
CU01 <.. Bloquear : <<extend>>
@enduml
```

**B. Ficha de Especificación del Caso de Uso**
- **1. CASO DE USO:** CU01 - Iniciar Sesión en Plataforma.
- **2. PROPÓSITO:** Restringir y asegurar el acceso al ERP, autenticando la identidad del personal.
- **3. DESCRIPCIÓN:** Permite que un empleado validado de la fábrica ingrese sus credenciales corporativas, para que el sistema le asigne un token de sesión (JWT) y lo redirija al panel correspondiente según su Nivel de Rol.
- **4. ACTORES:** Tablas de BD (`usuarios`, `roles`, `bitacora_auditoria`).
- **5. ACTOR INICIADOR:** Usuario Autenticado (Cualquier empleado de GRULAC).
- **6. PRECONDICIÓN:** El usuario iniciador debe existir físicamente en la tabla `usuarios` y tener su estado lógico como "Activo".
- **7. FLUJO PRINCIPAL (Camino Feliz):**
  1. El actor ingresa a la ruta base de GRULAC ERP.
  2. El sistema despliega el formulario de Iniciar Sesión.
  3. El actor introduce su ID corporativo (email) y Contraseña, enviando la petición.
  4. El sistema encripta la contraseña, conecta con la BD y verifica la coincidencia del hash.
  5. El sistema detecta coincidencia, extrae el perfil de permisos.
  6. El sistema registra automáticamente en la tabla `bitacora_auditoria` la fecha, hora e IP del ingreso (acción: `LOGIN`).
  7. El sistema actualiza el campo `ultimo_login` del registro del usuario.
  8. El sistema redirige al actor al panel de control correspondiente a su cargo industrial.
- **8. POST CONDICIÓN:** El usuario queda logueado, con su `id_usuario` amarrado en la sesión activa temporalmente, habilitándolo para firmar transacciones hasta que la sesión expire. La bitácora conserva el registro inmutable de la hora y fecha del ingreso.
- **9. EXCEPCIONES (Flujo Secundario):**
  - *E1: Credenciales Inválidas.* (Paso 4 falla). El sistema detiene el flujo, limpia el password, incrementa el contador `intentos_fallidos` y notifica "Credenciales incorrectas", regresando al paso 2.
  - *E2: Empleado Inhabilitado.* (Precondición falla). El sistema halla credenciales correctas, pero nota que el empleado ha sido vetado o despedido. Detiene el acceso con la alerta: "Usted no está autorizado por Gerencia".
  - *E3: Múltiples Fallos (3 intentos).* Tras fallar E1 repetidamente, se ejecuta el caso `<<extend>> Bloquear Acceso`: se bloquea el input por 5 a 15 minutos, se registra la IP sospechosa en bitácora y se habilita visualmente el enlace "¿Olvidó su contraseña?" que redirige al CU32.
- **10. NOTA TÉCNICA:** La autenticación es propia del sistema (email + password_hash contra la tabla `usuarios`). No se utiliza OAuth ni inicio de sesión con proveedores externos (Google, Facebook, etc.). El email corporativo se usa exclusivamente como identificador de la cuenta, no como proveedor de autenticación.

**C. Prototipo UI (Directriz para Generador)**
*Prompt a ingresar textual en tu IA de mockups (Google/Uizard/Figma):*
> "Diseñar un Layout de Iniciar Sesión para uso Web/Desktop de estilo corporativo moderno, para el uso interno de una industria láctea. Debe utilizar la estética 'Glassmorphism' (paneles levemente transparentes emulando vidrio). Dividir la pantalla en 50/50: La mitad izquierda muestra una fotografía elegante, desaturada y nítida de maduración de quesos o un campo tambero limpio. La mitad derecha aloja el formulario de ingreso encajado en un panel blanco limpio. Los elementos obligatorios son: Logo 'GRULAC S.R.L', Gran encabezado 'Acceso Operativo ERP', Campo de texto redondeado 'Email Corporativo', Campo protegido por puntos para 'Contraseña', un gran Botón de acción (accent color oscuro o azul industrial) que ordene 'AUTENTICAR', y debajo del botón un enlace discreto '¿Olvidó su contraseña?' que dirija al flujo de recuperación (CU32). No incluir botón para crear cuentas de usuario; las cuentas son creadas exclusivamente por el Administrador (CU03)."

#### CU02: Cerrar Sesión Activa

**A. Estructura del Modelo de CU (Diagrama Específico)**
```plantuml
@startuml
left to right direction
actor "Usuario Autenticado" as UsuarioBase
rectangle "Sistema ERP GRULAC" {
  usecase "CU02: Cerrar Sesión" as CU02
  usecase "Destruir Token JWT" as Destruir
}
UsuarioBase --> CU02
CU02 ..> Destruir : <<include>>
@enduml
```

**B. Ficha de Especificación del Caso de Uso**
- **1. CASO DE USO:** CU02 - Cerrar Sesión Activa.
- **2. PROPÓSITO:** Revocar el acceso temporal del usuario al sistema para prevenir manipulaciones no autorizadas en su terminal.
- **3. DESCRIPCIÓN:** Permite que cualquier empleado finalice su jornada en el ERP, ejecutando una destrucción inmediata de su sesión en memoria corporativa para que ninguna transacción futura lleve su firma.
- **4. ACTORES:** Tablas de BD (`usuarios`, `bitacora_auditoria`).
- **5. ACTOR INICIADOR:** Usuario Autenticado (Cualquiera).
- **6. PRECONDICIÓN:** El usuario debe tener un Token JWT vivo verificado en el navegador (Debe haber ejecutado el CU01).
- **7. FLUJO PRINCIPAL (Camino Feliz):**
  1. El actor despliega el menú de su Perfil en la esquina superior derecha del ERP.
  2. El actor hace clic en la opción "Cerrar Sesión / Salir".
  3. El sistema intercepta el clic y solicita una pequeña confirmación "¿Desea abandonar el área de trabajo?".
  4. El actor confirma "Sí, salir".
  5. El sistema registra en la tabla `bitacora_auditoria` la fecha, hora e IP de la salida (acción: `LOGOUT`), cerrando el par de trazabilidad iniciado en el CU01.
  6. El sistema purga la caché del navegador y destruye el Token JWT.
  7. El sistema redirige automáticamente al navegador a la pantalla del CU01 (Login).
- **8. POST CONDICIÓN:** La terminal queda bloqueada asépticamente; ninguna ruta interna del sistema es accesible sin volver a inyectar credenciales. La bitácora conserva un registro completo de entrada (LOGIN) y salida (LOGOUT) con sus respectivas fechas y horas.
- **9. EXCEPCIONES (Flujo Secundario):**
  - *E1: Destrucción por Inactividad (Timeout).* Si el usuario olvida cerrar sesión y abandona la computadora, el sistema no espera el clic: hace un auto-logout tras 15 minutos exactos de inactividad sensorial (mouse/teclado), saltando directamente a los pasos 5, 6 y 7 para asegurar la computadora. La bitácora registra la acción como `LOGOUT_TIMEOUT`.

**C. Prototipo UI (Directriz para Generador)**
*Prompt a ingresar textual en tu IA:*
> "Diseñar la cabecera (Navbar Top) de un sistema ERP. Esquina superior derecha: Un avatar circular de usuario con el nombre 'Roberto - Jefe de Planta'. Al darle clic a ese avatar, se debe desplegar un pequeño menú flotante blanco con iconos muy limpios. Las opciones del menú deben ser: 'Mi Perfil', 'Configuraciones' y 'Cerrar Sesión'. Esta última opción ('Cerrar Sesión') debe estar resaltada sutilmente en texto rojo con un icono de puerta de salida. Todo el diseño debe ser puramente utilitario, plano (flat) y minimalista extremo."

#### CU03: Registrar Nuevo Empleado

**A. Estructura del Modelo de CU (Diagrama Específico)**
```plantuml
@startuml
left to right direction
actor "Administrador General" as Admin
rectangle "Sistema ERP GRULAC - Submódulo RRHH" {
  usecase "CU03: Registrar Empleado" as CU03
  usecase "Validar Duplicidad de DNI" as Validar
}
Admin --> CU03
CU03 ..> Validar : <<include>>
@enduml
```

**B. Ficha de Especificación del Caso de Uso**
- **1. CASO DE USO:** CU03 - Registrar Nuevo Empleado.
- **2. PROPÓSITO:** Instanciar formalmente a un operador industrial en el ecosistema insertando atómicamente sus credenciales básicas.
- **3. DESCRIPCIÓN:** Permite al Administrador inyectar los datos duros (DNI, Nombre, Correo) de un nuevo contrato a la base de datos maestra para que luego adquiera un Rol. No involucra manejo de bajas ni asignación de jerarquía directa.
- **4. ACTORES:** Tablas de BD (`usuarios`).
- **5. ACTOR INICIADOR:** Administrador General.
- **6. PRECONDICIÓN:** El Administrador debe estar logueado y posicionado en la pantalla de Maestros de Organización.
- **7. FLUJO PRINCIPAL (Camino Feliz):**
  1. El Administrador oprime el botón "+ Añadir Trabajador".
  2. El sistema despliega un formulario modal solicitando los Datos Personales (DNI, Nombre, Correo).
  3. El Administrador teclea los datos y presiona "Crear Identidad y Guardar".
  4. El sistema contrasta el disco duro (BD) para garantizar la regla de negocio de unicidad de DNI (No pueden existir trabajadores clonados).
  5. El sistema dispara la consulta `INSERT INTO usuarios` inyectando un hash de contraseña genérica por defecto (Ej: `grulac123`).
  6. El sistema notifica "El empleado se guardó con éxito" y cierra el modal visual.
- **8. POST CONDICIÓN:** El empleado existe permanentemente en Disco (Persistido) y está a la espera de que el Administrador dispare el **CU05** (Asignar Rol y Permisos). Toda la transacción queda inmutablemente respaldada de forma automática en la Bitácora de Auditoría por seguridad.
- **9. EXCEPCIONES (Flujo Secundario):**
  - *E1: Conflicto de DNI (Duplicidad).* Si el DNI provisto ya pertenece a un trabajador existente, la base de datos aborta violentamente la inserción (Por UNIQUE CONSTRAINT). El sistema atrapa el error y arroja a la Interfaz: "Peligro: Este DNI ya pertenece a otro trabajador".
  - *E2: Campos Obligatorios Vacíos.* Si el usuario deja en blanco cualquier campo marcado como NOT NULL (DNI, Nombre), el sistema bloquea el botón de guardado, resalta el campo vacío con borde rojo y muestra el mensaje inline: "Este campo es obligatorio". No se ejecuta ninguna petición al servidor hasta que se corrijan todos los campos.

**C. Prototipo UI (Directriz para Generador)**
*Prompt a ingresar textual en tu IA:*
> "Diseño de Ventana Modal central posada sobre un fondo en modo overlay oscuro. La ventana modal es de color fondo blanco puro, con bordes de curva ligera. El título es: 'Alta de Identidad Corporativa'. Se ven inputs de texto muy claros para: 'Documento Nacional (DNI)', 'Nombre Completo del Colaborador' y 'Correo Corporativo (Opcional)'. La parte de abajo tiene solo dos botones anchos: Un botón gris pálido para 'Cancelar', y a su derecha un botón principal grande de color azul fuerte industrial para 'Guardar Empleado'. No agregar menús laterales, la concentración es solo el pequeño recuadro centrado de Alta de Personal."
#### CU04: Inhabilitar Empleado (Baja Lógica)

**A. Estructura del Modelo de CU (Diagrama Específico)**
```plantuml
@startuml
left to right direction
actor "Administrador General" as Admin
rectangle "Sistema ERP GRULAC - Submódulo RRHH" {
  usecase "CU04: Inhabilitar Empleado" as CU04
  usecase "Destruir Token de Inmediato" as DestruirToken
}
Admin --> CU04
CU04 ..> DestruirToken : <<include>>
@enduml
```

**B. Ficha de Especificación del Caso de Uso**
- **1. CASO DE USO:** CU04 - Inhabilitar Empleado (Baja Lógica).
- **2. PROPÓSITO:** Retirar el acceso al sistema a un operador despedido o suspendido sin afectar los registros históricos donde su firma aparece (Kardex, Recepciones, Calidad).
- **3. DESCRIPCIÓN:** Permite al Administrador localizar un empleado en la grilla y cambiar su estado a "Inactivo" (`UPDATE estado = FALSE`), forzando de inmediato la pérdida de su conexión activa en cualquier navegador.
- **4. ACTORES:** Tablas de BD (`usuarios`).
- **5. ACTOR INICIADOR:** Administrador General.
- **6. PRECONDICIÓN:** El Administrador debe estar logueado; el empleado objetivo debe existir y su estatus actual debe ser "Activo".
- **7. FLUJO PRINCIPAL (Camino Feliz):**
  1. El Administrador ubica al trabajador en la tabla de Personal y hace clic en el botón de acción "Dar de Baja".
  2. El sistema despliega un mensaje crítico de advertencia: "¿Está seguro de revocar el acceso a este operador?".
  3. El Administrador teclea su propia contraseña de Admin como confirmación y presiona "Proceder".
  4. El sistema ejecuta el *Soft-Delete* cambiando la bandera lógica del usuario a falsa.
  5. El sistema lanza un disparador interno (Include) que rastrea si ese empleado estaba conectado e invalida instantáneamente su Token de sesión (JWT) en memoria.
  6. El sistema actualiza la lista, mostrando al empleado con un chip color rojo "Inactivo".
- **8. POST CONDICIÓN:** El ex-empleado ya no puede hacer Login (Falla la Precondición del CU01), pero los movimientos pasados en Kardex firmados por él siguen intactos y auditables. Toda la transacción queda inmutablemente respaldada de forma automática en la Bitácora de Auditoría por seguridad.
- **9. EXCEPCIONES (Flujo Secundario):**
  - *E1: Autodestrucción Bloqueada.* Si el Administrador intenta darse de baja a sí mismo y es el único Administrador con `id_rol = 1` vivo en la empresa, el sistema detiene la transacción por seguridad arquitectónica para evitar bloquear el ERP entero cediendo acéfalo.

**C. Prototipo UI (Directriz para Generador)**
*Prompt a ingresar textual en tu IA:*
> "Diseño de un Pop-up (Alert Box) de estilo Material Design. Fondo oscuro desenfocado. En el centro un rectángulo blanco limpio. Arriba un ícono grande de advertencia en color naranja o rojo oscuro. Título de la alerta en negrita: 'Confirmación Crítica: Baja de Personal'. Subtítulo en texto gris: 'Está a punto de revocar todos los privilegios del operador operativo. Escriba su pin maestro para continuar'. Debajo un campo de texto simple para 'Pin de Administrador' y dos botones al final: Botón izquierdo gris que diga 'Cancelar' y un botón derecho masivo color rojo sangre que diga 'Revocar Acceso'."

#### CU05: Asignar o Modificar Roles y Permisos

**A. Estructura del Modelo de CU (Diagrama Específico)**
```plantuml
@startuml
left to right direction
actor "Administrador General" as Admin
rectangle "Sistema ERP GRULAC - Submódulo RRHH" {
  usecase "CU05: Asignar Rol" as CU05
}
Admin --> CU05
@enduml
```

**B. Ficha de Especificación del Caso de Uso**
- **1. CASO DE USO:** CU05 - Asignar o Modificar Roles y Permisos.
- **2. PROPÓSITO:** Delimitar las fronteras de poder informático de un usuario, enlazándolo con un Perfil de Autorización (Jefe de Producción, QA, Recepcionista).
- **3. DESCRIPCIÓN:** Permite al Administrador seleccionar a un trabajador base y amarrarlo a un `id_rol` maestro que rige qué pestañas del software podrá ver y qué tablas podrá editar.
- **4. ACTORES:** Tablas de BD (`usuarios`, `roles`).
- **5. ACTOR INICIADOR:** Administrador General.
- **6. PRECONDICIÓN:** El trabajador objetivo ya debe existir como entidad (Haber ejecutado CU03) y estar activo.
- **7. FLUJO PRINCIPAL (Camino Feliz):**
  1. El Administrador hace clic en "Asignar Puesto" junto al nombre de un trabajador sin rol asignado en la cuadrícula (DataGrid).
  2. El sistema despliega una lista (Dropdown select) obtenida dinámicamente de la tabla de catálogo `roles`.
  3. El Administrador escoge la opción "Ingeniero de Calidad (QA)" y presiona Guardar.
  4. El sistema ejecuta el `UPDATE usuarios SET id_rol = X WHERE id_usuario = Y`.
  5. El sistema notifica éxito y actualiza la columna "Cargo" en la grilla principal.
- **8. POST CONDICIÓN:** El trabajador ya cuenta con credenciales especializadas conectadas. Al iniciar su próximo Login (CU01), su menú lateral adaptará opciones exclusivas del módulo de Calidad. Toda la transacción queda inmutablemente respaldada de forma automática en la Bitácora de Auditoría por seguridad.
- **9. EXCEPCIONES (Flujo Secundario):**
  - *E1: Transición Ilegal de Permisos (Incompatibilidad).* La lógica del ERP no permite que un "Jefe de Producción" sea cambiado bruscamente a "Ingeniero de QA" si el trabajador en cuestión tiene Órdenes de Producción (Lotes) actualmente abiertas a su nombre. El sistema exige cerrar los lotes en la tina antes del cambio de oficina bloqueando la operación.

**C. Prototipo UI (Directriz para Generador)**
*Prompt a ingresar textual en tu IA:*
> "Pantalla de escritorio (Dashboard) dividida con enfoque en un panel lateral deslizante (Drawer derecho). En el fondo oscuro y borroso se ve un DataGrid corporativo. El panel lateral de la derecha es blanco, limpio y ocupa exactamente el 30% del ancho de la pantalla. Título superior del panel: 'Configuración de Puesto Operativo'. Información mostrada: Foto corporativa pequeña y nombre del operario. Luego un Subtítulo 'Escoja el Departamento y Rango' acompañado de un selector desplegable inmenso con diseño moderno (estilo dropdown select) que exhibe las opciones (Recepción, Producción, Calidad, Almacén). Botón primario azul sólido bajo el combo que diga 'Guardar Configuración'."
#### CU08: Registrar Nuevo Producto/Insumo (Catálogo)

**A. Estructura del Modelo de CU (Diagrama Específico)**
```plantuml
@startuml
left to right direction
actor "Administrador General" as Admin
rectangle "Sistema ERP GRULAC - Submódulo WMS" {
  usecase "CU08: Configurar Catálogo" as CU08
  usecase "Categorizar Ítem (Subfamilia)" as Categoria
}
Admin --> CU08
CU08 ..> Categoria : <<include>>
@enduml
```

**B. Ficha de Especificación del Caso de Uso**
- **1. CASO DE USO:** CU08 - Registrar Nuevo Producto/Insumo en Catálogo.
- **2. PROPÓSITO:** Poblar la base de datos central con las identidades de lo que la empresa maneja (leche, sal, empaques, quesos), para que puedan contar con un Kardex transaccional físico.
- **3. DESCRIPCIÓN:** El sistema permite al Admin instanciar conceptos estáticos (ej. "Cheddar 500g" o "Cuajo Químico") definiendo si es Insumo o Producto Final, su unidad de medida y precio o costo referencial. No añade cantidades físicas, solo la identidad organizativa.
- **4. ACTORES:** Tablas de BD (`catalogo_items`).
- **5. ACTOR INICIADOR:** Administrador General.
- **6. PRECONDICIÓN:** Administrador Autenticado.
- **7. FLUJO PRINCIPAL (Camino Feliz):**
  1. El actor ingresa a "WMS Almacén" -> "Catálogo Maestro".
  2. Presiona el botón flotante "+ Crear Nueva Identidad de Ítem".
  3. Despliega un modal. El actor escoge una Categoría obligatoria: "Insumo Químico".
  4. Ingresa el nombre "Cloruro de Calcio industrial", unidad "Litros", y costo base.
  5. Presiona "Guardar en Sistema Central".
  6. El sistema formatea los textos evitando dobles espacios en blanco e inserta en la tabla master `catalogo_items`.
  7. El listado de catálogo se actualiza reflejando el nuevo ítem con "Stock 0.00" por defecto.
- **8. POST CONDICIÓN:** El Ítem existe contablemente. A partir de ahora puede ser objeto de una Orden de Compra o registrado como merma en la línea de producción. Toda la transacción queda inmutablemente respaldada de forma automática en la Bitácora de Auditoría por seguridad.
- **9. EXCEPCIONES (Flujo Secundario):**
  - *E1: Falta de Categorización Restrictiva.* Si el actor omite clasificar si es Producto Vendible o Insumo de Producción, el software lanza alerta y niega la creación, puesto que afecta el comportamiento de las tablas de ventas posteriores.
  - *E2: Campos Obligatorios Vacíos.* Si el usuario deja en blanco cualquier campo marcado como NOT NULL (nombre, SKU, unidad de medida), el sistema bloquea el botón de guardado, resalta el campo vacío con borde rojo y muestra el mensaje inline: "Este campo es obligatorio".

**C. Prototipo UI (Directriz para Generador)**
*Prompt a ingresar textual en tu IA:*
> "Pantalla de gestión de Catálogos de Inventario Corporativo. Diseño de formulario superpuesto centrado dividido en dos columnas exactas. Lado Izquierdo: Un 'Image upload placeholder' gris claro (recuadro punteado para subir fotos del producto) y justo debajo un menú dropdown para 'Tipo de Ítem (Insumo / Producto Final)'. Lado derecho: Text fields con placeholders muy finos para 'Nombre del Código', 'Descripción técnica comercial', y selectores diminutos a lado derecho para 'Unidad de Medida (KG/LT/UN)'. Estilo general tipo SaaS ultra limpio con bordes muy redondeados y sombras difusas. Botón Guardar en esquina inferior derecha en color azul oscuro."

#### CU09: Consultar Kardex Dinámico (Historial)

**A. Estructura del Modelo de CU (Diagrama Específico)**
```plantuml
@startuml
left to right direction
actor "Asesor Comercial" as Ventas
actor "Jefe de Producción" as Produccion
rectangle "Sistema ERP GRULAC - Submódulo WMS" {
  usecase "CU09: Consultar Kardex" as CU09
  usecase "Filtrar por Lotes/Fechas" as Filtros
}
Ventas --> CU09
Produccion --> CU09
CU09 ..> Filtros : <<extend>>
@enduml
```

**B. Ficha de Especificación del Caso de Uso**
- **1. CASO DE USO:** CU09 - Consultar Kardex Dinámico (Historial de Movimientos).
- **2. PROPÓSITO:** Proveer al staff corporativo visibilidad en tiempo real del saldo contable y volumen en bodega.
- **3. DESCRIPCIÓN:** Permite a múltiples ramas operativas consultar la inmensa tabla de la verdad (`movimientos_kardex`), procesando las sumatorias al vuelo (Entradas - Salidas) para deducir el "Stock Real Dinámico".
- **4. ACTORES:** Tablas de BD (`movimientos_kardex`, `catalogo_items`).
- **5. ACTOR INICIADOR:** Asesor Comercial, Jefe de Producción.
- **6. PRECONDICIÓN:** Usuario logueado con rol validado. El ítem consultado debe haber sido creado previamente (CU08).
- **7. FLUJO PRINCIPAL (Camino Feliz):**
  1. El actor ingresa al módulo "Inventario y Kárdex Diario".
  2. El sistema carga la sumatoria maestra y muestra la columna de "Disponible Físico" de todos los productos.
  3. El actor selecciona "Quesillo Criollo 5kg" y presiona "Auditar Movimientos".
  4. El sistema interroga las tablas `movimientos_kardex` filtrando por el ID, extrayendo las fechas en las que el Jefe de Planta inyectó cuajadas terminadas y las fechas en las que Ventas descontó por facturación.
  5. El sistema dibuja el historial gráfico e imprime en pantalla el "Libro de entradas y salidas".
- **8. POST CONDICIÓN:** Ninguna alteración es causada (Read Only). El usuario adquiere visibilidad de la bodega de fábrica real sin tener que caminar al sitio físico.
- **9. EXCEPCIONES (Flujo Secundario):**
  - *E1: Kardex Pálido (Inexistente).* Si un Asesor Comercial hace clic para expandir un ítem cuya existencia es puramente nominal (creado pero jamás comprado ni producido), el DataGrid arroja de inmediato la excepción limpiamente gráfica: "No existen transacciones trazables para este código base en la fábrica de toda la historia".

**C. Prototipo UI (Directriz para Generador)**
*Prompt a ingresar textual en tu IA:*
> "Dashboard de analítica avanzada para el control de Almacén. En la parte alta superior un buscador masivo (Search bar con icono lupa) y selectores de rangos de fechas de esquina a esquina. En el medio superior de la pantalla, una gráfica estadística muy elegante de curvas tenues que suben y bajan representando el flujo de Stock 'Ingresos vs Egresos' del mes. Inmediatamente debajo de la gráfica, hay una tabla de 'Libro Mayor Kárdex' enseñando 4 columnas clave: 'Día y Hora', 'Operador Trazable', 'Tipo (Ingreso texto verde / Egreso texto rojo)', y el 'Balance Dinámico Acumulado en Kilogramos'. Todo con tipografía estilo 'Inter' o 'Roboto', sensación de software corporativo caro."

#### CU12: Registrar Proveedor/Ganadero (Master Data)

**A. Estructura del Modelo de CU (Diagrama Específico)**
```plantuml
@startuml
left to right direction
actor "Administrador General" as Admin
actor "Asesor Comercial" as Ventas
rectangle "Sistema ERP GRULAC - Submódulo SCM" {
  usecase "CU12: Registrar Proveedor" as CU12
  usecase "Verificar Clínica/NIT" as Validar
}
Admin --> CU12
Ventas --> CU12
CU12 ..> Validar : <<include>>
@enduml
```

**B. Ficha de Especificación del Caso de Uso**
- **1. CASO DE USO:** CU12 - Registrar Proveedor/Ganadero.
- **2. PROPÓSITO:** Alimentar la base de datos maestra con los orígenes físicos de la materia prima (Tamberos locales o empresas químicas) para trazar la genealogía sanitaria del Kilómetro Cero.
- **3. DESCRIPCIÓN:** Permite al personal administrativo asociar un Nombre, NIT y zona de acopio a una entidad externa. Sin este registro previo, ninguna cisterna de leche ajena podrá ingresar al módulo de Acopio.
- **4. ACTORES:** Tablas de BD (`proveedores`).
- **5. ACTOR INICIADOR:** Administrador General o Asesor Comercial (Área de Compras).
- **6. PRECONDICIÓN:** Usuario logueado con autorización para inyectar *Master Data*.
- **7. FLUJO PRINCIPAL (Camino Feliz):**
  1. El actor ingresa al módulo "Compras y Ganaderos" -> "Maestro Proveedores".
  2. Presiona "+ Dar de Alta Ganadero".
  3. Despliega un formulario y teclea: Tipo (Productor de Leche / Insumos), NIT o CI, Razón Social, Teléfono, y Ruta Asignada.
  4. El actor pulsa "Guardar Proveedor".
  5. El sistema escanea la tabla `proveedores` buscando duplicidad estricta de NIT/CI.
  6. El sistema aprueba el `INSERT` y le estampa automáticamente el estado algorítmico `'Activo'` (Apto para negocios).
  7. El listado de proveedores se recarga con la nueva información.
- **8. POST CONDICIÓN:** El Proveedor obtiene un `id_proveedor` válido, logrando que el Encargado de Recepción (CU17) pueda seleccionar su nombre oficial cuando su camión llegue a la fábrica. Toda la transacción queda inmutablemente respaldada de forma automática en la Bitácora de Auditoría por seguridad.
- **9. EXCEPCIONES (Flujo Secundario):**
  - *E1: Conflicto de Identidad Única.* Si el sistema detecta que el NIT proveído o el código de ruta ya pertenece a un ganadero preexistente, aborta la creación impidiendo silenciosamente la corrupción de historiales contables.
  - *E2: Campos Obligatorios Vacíos.* Si el usuario deja en blanco cualquier campo marcado como NOT NULL (NIT, Razón Social, Tipo Proveedor), el sistema bloquea el botón de guardado, resalta el campo vacío con borde rojo y muestra el mensaje inline: "Este campo es obligatorio".

**C. Prototipo UI (Directriz para Generador)**
*Prompt a ingresar textual en tu IA:*
> "Dashboard de gestión en estilo moderno SaaS. La pantalla se divide asimétricamente: a la izquierda una lista lateral esbelta (sidebar interior) con viñetas que muestran nombres de proveedores agrícolas. A la derecha, llenando el espacio principal con fondo inmaculado, un formulario muy limpio titulado 'Datos del Ganadero/Empresa'. Campos grandes y legibles: 'Razón Social / Nombre', 'NIT / Carnet de Identidad', 'Tipo de Suministro (Leche cruda / Insumos secos)', y un campo amplio para 'Dirección o Ruta de Acopio'. Dos botones estilo Material UI redondeados abajo a la derecha: 'Descartar' en gris inactivo y 'Registrar Origen' en verde esmeralda corporativo."

#### CU26: Registrar Cliente Comercial (B2B/B2C)

**A. Estructura del Modelo de CU (Diagrama Específico)**
```plantuml
@startuml
left to right direction
actor "Asesor Comercial" as Ventas
rectangle "Sistema ERP GRULAC - Submódulo CRM" {
  usecase "CU26: Registrar Cliente" as CU26
  usecase "Asignar Nivel Precio" as Categoria
}
Ventas --> CU26
CU26 ..> Categoria : <<include>>
@enduml
```

**B. Ficha de Especificación del Caso de Uso**
- **1. CASO DE USO:** CU26 - Registrar Cliente Comercial B2B/B2C.
- **2. PROPÓSITO:** Constituir el catálogo de destinos comerciales de facturación (Supermercados, Distribuidores o Mayoristas Detallistas) para poder despachar la producción a su nombre.
- **3. DESCRIPCIÓN:** Permite al Asesor de Ventas capturar atómicamente la Razón Social y NIT de un nuevo comprador, clasificándolo según su envergadura para que el sistema asocie reglas tributarias o topes de crédito.
- **4. ACTORES:** Tablas de BD (`clientes`).
- **5. ACTOR INICIADOR:** Asesor Comercial.
- **6. PRECONDICIÓN:** Usuario de Ventas logueado y posicionado en la pestaña de CRM.
- **7. FLUJO PRINCIPAL (Camino Feliz):**
  1. El actor ingresa a "Cartera de Clientes" (Módulo Comercial).
  2. Presiona en "Agregar Comprador".
  3. Despliega la ventana modal orientada a Contabilidad y teclea: NIT, Razón Social, y clasifica el Nivel de Compra (Mayorista / Minorista).
  4. Presiona "Integrar Cliente".
  5. El sistema escanea duplicidad de Documentos de Identidad Tributaria.
  6. El sistema aprueba el `INSERT` en la tabla maestra `clientes`.
  7. El sistema despliega el mensaje de éxito ("Cliente apto para despachos") y refresca el DataGrid del CRM mostrando el registro en primera fila.
- **8. POST CONDICIÓN:** El cliente queda habilitado irrevocablemente en BD como llave primaria (ID). El Asesor Comercial ya puede utilizar su nombre como palanca para el levantamiento de Pedidos y descarte de Kárdex. Toda la transacción queda inmutablemente respaldada de forma automática en la Bitácora de Auditoría por seguridad.
- **9. EXCEPCIONES (Flujo Secundario):**
  - *E1: Registro Centralizado (Duplicado).* El sistema detecta que otra sucursal ya registró a ese NIT (ej: Supermercados FIDALGA). Interrumpe la inserción con un cartel restrictivo forzando al usuario a utilizar el contacto ya existente para salvar la consistencia financiera general.
  - *E2: Campos Obligatorios Vacíos.* Si el usuario deja en blanco cualquier campo marcado como NOT NULL (NIT, Razón Social), el sistema bloquea el botón de guardado, resalta el campo vacío con borde rojo y muestra el mensaje inline: "Este campo es obligatorio".

**C. Prototipo UI (Directriz para Generador)**
*Prompt a ingresar textual en tu IA:*
> "Pantalla de tipo CRM (Customer Relationship Management) moderna. Estética brillante y oxigenada empleando blancos puros y acentos azules claros. Existe una tabla central sobresaliente con 4 columnas principales y tipografía clara: 'ID Cuenta', 'Razón Social - NIT', 'Categoría (Aquí usar etiquetas flotantes amarillas o verdes para mostrar Retail / Mayorista)', y 'Total Vuelto Mensual (bs)'. Superpuesto al centro de la pantalla, se despliega un panel flotante para 'Registro de Nuevo Cliente'. Cajas de texto finas acompañadas de iconos tenues a la izquierda (un edificio corporativo para Razón social, una tarjeta ID para NIT). Abajo a la derecha, un único botón de confirmación: 'Confirmar y Guardar'."

#### CU31: Cambiar Contraseña Propia

**A. Estructura del Modelo de CU (Diagrama Específico)**
```plantuml
@startuml
left to right direction
actor "Usuario Autenticado" as Actor
rectangle "Sistema ERP GRULAC - Seguridad" {
  usecase "CU31: Cambiar Contraseña" as CU31
  usecase "Validar Contraseña Segura" as ValidarPass
}
Actor --> CU31
CU31 ..> ValidarPass : <<include>>
@enduml
```

**B. Ficha de Especificación del Caso de Uso**
- **1. CASO DE USO:** CU31 - Cambiar Contraseña Propia.
- **2. PROPÓSITO:** Permitir que cualquier usuario autenticado actualice su contraseña de forma autónoma desde su perfil, sin intervención del Administrador.
- **3. DESCRIPCIÓN:** El usuario accede a la configuración de su perfil y despliega una ventana modal donde debe ingresar su contraseña actual (para verificar identidad), seguida de la nueva contraseña y su confirmación. El sistema valida políticas de seguridad y actualiza el hash en la tabla `usuarios`.
- **4. ACTORES:** Tablas de BD (`usuarios`, `bitacora_auditoria`).
- **5. ACTOR INICIADOR:** Usuario Autenticado (Cualquier empleado de GRULAC).
- **6. PRECONDICIÓN:** El usuario debe estar logueado con sesión activa (CU01 ejecutado).
- **7. FLUJO PRINCIPAL (Camino Feliz):**
  1. El actor accede a "Mi Perfil" desde el menú de la esquina superior derecha.
  2. El actor hace clic en "Cambiar Contraseña".
  3. El sistema despliega una ventana modal con tres campos: "Contraseña Actual", "Nueva Contraseña" y "Confirmar Nueva Contraseña".
  4. El actor llena los tres campos y presiona "Guardar".
  5. El sistema verifica que la contraseña actual coincida con el hash almacenado en BD.
  6. El sistema valida que la nueva contraseña cumpla las políticas de seguridad: mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número, y que NO sea idéntica a la contraseña anterior.
  7. El sistema genera un nuevo hash (`bcrypt`) y ejecuta `UPDATE usuarios SET password_hash = $nuevo_hash`.
  8. El sistema registra el evento en `bitacora_auditoria` (acción: `CAMBIO_PASSWORD`).
  9. El sistema muestra un toast de éxito: "Su contraseña ha sido actualizada correctamente".
- **8. POST CONDICIÓN:** El hash anterior es irrecuperable. La próxima vez que el usuario ejecute el CU01 (Login), deberá usar la nueva contraseña.
- **9. EXCEPCIONES (Flujo Secundario):**
  - *E1: Contraseña Actual Incorrecta.* El sistema detecta que el hash enviado no coincide con el almacenado. Muestra: "Su contraseña actual es incorrecta" y no permite continuar.
  - *E2: Política de Seguridad Incumplida.* La nueva contraseña no cumple los requisitos (falta mayúscula, minúscula, número o longitud insuficiente). El sistema resalta el campo con borde rojo e indica qué requisito falta.
  - *E3: Confirmación No Coincide.* "Nueva Contraseña" y "Confirmar" difieren. El sistema muestra: "Las contraseñas no coinciden".
  - *E4: Contraseña Repetida.* Si la nueva contraseña es idéntica a la actual, el sistema la rechaza: "La nueva contraseña no puede ser igual a la anterior".

**C. Prototipo UI (Directriz para Generador)**
*Prompt a ingresar textual en tu IA:*
> "Ventana modal centrada sobre fondo overlay oscuro. Fondo blanco puro con bordes redondeados. Título: 'Actualizar Contraseña'. Tres campos de texto protegidos (tipo password con ojito toggle): 'Contraseña Actual', 'Nueva Contraseña' y 'Confirmar Nueva Contraseña'. Debajo de 'Nueva Contraseña', un pequeño listado visual de requisitos tipo checklist que se van marcando en verde: '✓ Mínimo 8 caracteres', '✓ Una mayúscula', '✓ Una minúscula', '✓ Un número'. Dos botones: 'Cancelar' gris y 'Guardar Contraseña' azul industrial."

#### CU32: Recuperar Contraseña Olvidada

**A. Estructura del Modelo de CU (Diagrama Específico)**
```plantuml
@startuml
left to right direction
actor "Usuario No Autenticado" as Actor
rectangle "Sistema ERP GRULAC - Seguridad" {
  usecase "CU32: Recuperar Contraseña" as CU32
  usecase "Enviar Token por Email" as EnviarToken
  usecase "Validar Token Temporal" as ValidarToken
}
Actor --> CU32
CU32 ..> EnviarToken : <<include>>
CU32 ..> ValidarToken : <<include>>
@enduml
```

**B. Ficha de Especificación del Caso de Uso**
- **1. CASO DE USO:** CU32 - Recuperar Contraseña Olvidada.
- **2. PROPÓSITO:** Permitir que un usuario que olvidó sus credenciales pueda restablecer su contraseña de forma segura, sin necesidad de contactar al Administrador.
- **3. DESCRIPCIÓN:** El usuario accede al enlace "¿Olvidó su contraseña?" desde la pantalla de Login (CU01). Ingresa su email corporativo y el sistema le envía un token temporal (de un solo uso, con expiración de 5 minutos) a su correo electrónico registrado. Al hacer clic en el enlace del correo, se despliega la pantalla para establecer una nueva contraseña.
- **4. ACTORES:** Tablas de BD (`usuarios`, `bitacora_auditoria`), Servicio de Email (SMTP/Supabase Auth).
- **5. ACTOR INICIADOR:** Usuario No Autenticado (el que olvidó su clave).
- **6. PRECONDICIÓN:** El email corporativo debe existir en la tabla `usuarios` y el estado del usuario debe ser `Activo`.
- **7. FLUJO PRINCIPAL (Camino Feliz):**
  1. El actor hace clic en "¿Olvidó su contraseña?" desde la pantalla de Login.
  2. El sistema despliega un formulario simple pidiendo el "Email Corporativo".
  3. El actor ingresa su email y presiona "Enviar Enlace de Recuperación".
  4. El sistema verifica que el email exista en la tabla `usuarios` y que el estado sea Activo.
  5. El sistema genera un token criptográfico de un solo uso con expiración de 5 minutos.
  6. El sistema envía un correo electrónico al email corporativo con un enlace seguro que contiene el token.
  7. El sistema muestra en pantalla: "Hemos enviado un enlace de recuperación a su correo corporativo. El enlace expira en 5 minutos".
  8. El actor abre su correo, hace clic en el enlace.
  9. El sistema valida el token (existencia, no expirado, no usado).
  10. El sistema despliega un formulario con dos campos: "Nueva Contraseña" y "Confirmar Nueva Contraseña".
  11. El actor ingresa su nueva contraseña (cumpliendo políticas de seguridad del CU31).
  12. El sistema actualiza el hash en BD, invalida el token usado, resetea el contador `intentos_fallidos` a 0.
  13. El sistema registra en `bitacora_auditoria` (acción: `RESET_PASSWORD`).
  14. El sistema redirige al CU01 (Login) con mensaje: "Contraseña restablecida. Inicie sesión con su nueva clave".
- **8. POST CONDICIÓN:** El usuario recupera el acceso a su cuenta. El token usado queda invalidado permanentemente. La bitácora registra el evento para auditoría.
- **9. EXCEPCIONES (Flujo Secundario):**
  - *E1: Email No Registrado.* El sistema detecta que el email no existe en `usuarios`. Por seguridad, NO revela esta información al actor. Muestra el mismo mensaje genérico del paso 7 para evitar enumeración de cuentas.
  - *E2: Usuario Inhabilitado.* El email existe pero el estado es inactivo. El sistema responde con el mismo mensaje genérico sin enviar correo.
  - *E3: Token Expirado.* Si el actor hace clic en el enlace después de 5 minutos, el sistema muestra: "El enlace ha expirado. Solicite uno nuevo" y redirige al paso 1.
  - *E4: Token Ya Usado.* Si el actor intenta reutilizar un enlace ya consumido, el sistema lo rechaza: "Este enlace ya fue utilizado".

**C. Prototipo UI (Directriz para Generador)**
*Prompt a ingresar textual en tu IA:*
> "Pantalla de recuperación de acceso con el mismo layout 50/50 del Login. Sobre la mitad derecha: Logo GRULAC S.R.L. pequeño arriba. Encabezado: 'Recuperar Acceso'. Subtítulo tenue: 'Ingrese su email corporativo y le enviaremos un enlace seguro'. Un solo campo de texto redondeado: 'Email Corporativo'. Botón principal azul industrial: 'Enviar Enlace de Recuperación'. Debajo, un enlace discreto: 'Volver al Inicio de Sesión'. Todo minimalista y limpio."

## 7.5. Estructurar caso de uso
### 7.5.1. Ciclo #1

```plantuml
@startuml UC_Ciclo1
left to right direction
skinparam packageStyle rectangle

actor "Administrador General\n(from CU3)" as Admin
actor "Usuario autenticado\n(from CU1)" as Usuario
actor "Asesor Comercial\n(from CU9)" as Asesor
actor "Jefe de Produccion\n(from CU9)" as JefeProd

usecase "Registrar Empleado\n(from CU3)" as CU3
usecase "Validar Duplicado de DNI\n(from CU3)" as V_DNI
usecase "Inhabilitar Empleado\n(from CU4)" as CU4
usecase "Destruir Token de Inmediato\n(from CU4)" as D_Token_Inm
usecase "Asignar Rol\n(from CU5)" as CU5
usecase "Configurar Catalogo\n(from CU8)" as CU8
usecase "Categoria Item-Subfamilia\n(from CU8)" as C_Item

usecase "Iniciar sesion\n(from CU1)" as CU1
usecase "Validar Credenciales\n(from CU1)" as V_Cred
usecase "bloquear Acceso\n(from CU1)" as B_Acceso
usecase "Cerrar Sesion\n(from CU2)" as CU2
usecase "Destruir token JWT\n(from CU2)" as D_Token_JWT
usecase "Cambiar Contrasena\n(from CU31)" as CU31
usecase "Validar Contrasena Segura\n(from CU31)" as V_Pass
usecase "Recuperar Contrasena\n(from CU32)" as CU32
usecase "Enviar Token por Email\n(from CU32)" as E_Token
usecase "Validar Token Temporal\n(from CU32)" as V_Token

usecase "Consultar Kardex\n(from CU9)" as CU9
usecase "Filtrar por Lotes-Fechas\n(from CU9)" as F_Lotes
usecase "Registrar Cliente\n(from CU26)" as CU26
usecase "Asignar nivel precio\n(from CU26)" as A_Precio
usecase "Registrar Proveedor\n(from CU12)" as CU12
usecase "Verificar Clínica-NIT\n(from CU12)" as V_Nit

Admin --> CU3
Admin --> CU4
Admin --> CU5
Admin --> CU8
CU3 .> V_DNI : <<include>>
CU4 .> D_Token_Inm : <<include>>
CU8 .> C_Item : <<include>>

Admin -right-|> Usuario
Asesor -up-|> Usuario
JefeProd -up-|> Usuario

Usuario --> CU1
Usuario --> CU2
Usuario --> CU31
CU1 .> V_Cred : <<include>>
CU1 <. B_Acceso : <<extend>>
CU2 .> D_Token_JWT : <<include>>
CU31 .> V_Pass : <<include>>

actor "Usuario No Autenticado\n(from CU32)" as NoAuth
NoAuth --> CU32
CU32 .> E_Token : <<include>>
CU32 .> V_Token : <<include>>

Asesor --> CU9
Asesor --> CU26
Asesor --> CU12
CU9 <. F_Lotes : <<extend>>
CU26 .> A_Precio : <<include>>

JefeProd --> CU9
JefeProd --> CU12
CU12 .> V_Nit : <<include>>

@enduml
```

# 8. CAPITULO 4: FLUJO DE TRABAJO: ANALISIS

## 8.1. Análisis de Arquitectura

### 8.1.1. Identificar Paquetes

A continuación, se describen los paquetes arquitectónicos fundamentales identificados para el Ciclo 1 del sistema, agrupando los casos de uso por áreas lógicas de responsabilidad funcional:

```plantuml
@startuml Paquetes_Ciclo1_Arquitectura
skinparam packageStyle folder
skinparam backgroundColor transparent

package "seguridad" as P1
package "Gestion de Usuario" as P2
package "Gestion de inventario" as P3
package "Gestion de Comercial" as P4

@enduml
```

- **Seguridad**: Este paquete comprende los mecanismos fundamentales de protección y control de acceso al sistema ERP. Su propósito es validar las credenciales del personal administrativo y operativo para autorizar su ingreso (iniciar sesión) o revocar el acceso a su terminal de forma segura (cerrar sesión), protegiendo así la integridad de los datos de la fábrica.

- **Gestión de Usuario**: Administra el ciclo de vida organizativo del personal dentro de la plataforma. Involucra la creación de las identidades de nuevos trabajadores, su eventual baja lógica (inhabilitación para denegar el acceso) y la asignación de permisos operativos (roles), delimitando exactamente qué operaciones y vistas puede utilizar cada empleado según su jerarquía en la empresa.

- **Gestión de Inventario (WMS)**: Encargado de la estructuración técnica del almacén de la planta. Permite a los administradores registrar y tipificar de manera estandarizada los insumos, materias primas y productos finales en el catálogo maestro. Además, otorga visibilidad analítica constante mediante el Kardex, permitiendo auditar el historial de ingresos y egresos de mercadería en tiempo real.

- **Gestión Comercial y Proveedores**: Enfocado en la administración del directorio de las entidades fundamentales que originan y terminan el ciclo de negocio. Agrupa los casos de uso para dar de alta formalmente en el sistema a los ganaderos o proveedores (origen de la leche) y a los clientes comerciales (destino de los quesos), información indispensable para la posterior facturación y logística.

### 8.1.2. Relacionar paquetes y casos de uso

Esta sección establece la trazabilidad entre los paquetes arquitectónicos y los Casos de Uso específicos del Ciclo 1:

```plantuml
@startuml Paquetes_CU
left to right direction
skinparam packageStyle folder
skinparam backgroundColor transparent

package "SEGURIDAD" as P1
usecase "Iniciar sesion\n(from CU1)" as CU1
usecase "Cerrar Sesion\n(from CU2)" as CU2
usecase "Cambiar Contrasena\n(from CU31)" as CU31
usecase "Recuperar Contrasena\n(from CU32)" as CU32
P1 ..> CU1 : <<trace>>
P1 ..> CU2 : <<trace>>
P1 ..> CU31 : <<trace>>
P1 ..> CU32 : <<trace>>

package "Gestion de Usuario" as P2
usecase "Asignar Rol\n(from CU5)" as CU5
usecase "Registrar Empleado\n(from CU3)" as CU3
usecase "Inhabilitar Empleado\n(from CU4)" as CU4
P2 ..> CU5 : <<trace>>
P2 ..> CU3 : <<trace>>
P2 ..> CU4 : <<trace>>

package "Gestion de Inventario" as P3
usecase "Configurar Catalogo\n(from CU8)" as CU8
usecase "Consultar Kardex\n(from CU9)" as CU9
P3 ..> CU8 : <<trace>>
P3 ..> CU9 : <<trace>>

package "Gestion Comercial" as P4
usecase "Registrar Cliente\n(from CU26)" as CU26
usecase "Registrar Proveedor\n(from CU12)" as CU12
P4 ..> CU26 : <<trace>>
P4 ..> CU12 : <<trace>>

@enduml
```

### 8.1.3. Dependencias de Paquetes Arquitectónicos

A continuación se esquematiza el acoplamiento y las dependencias lógicas direccionadas entre estos módulos (Ciclo 1):

```plantuml
@startuml Paquetes_Dependencias
skinparam packageStyle folder
skinparam backgroundColor transparent
top to bottom direction

package "Gestion Comercial" as P4
package "Gestion de Inventario" as P3
package "SEGURIDAD" as P1
package "Gestion de Usuario" as P2

P4 ..> P1 : <<use>>
P3 ..> P1 : <<use>>
P1 ..> P2 : <<import>>

@enduml
```

## 8.2. Diagramas de Comunicación

A continuación se presentan los diagramas de comunicación bajo el patrón arquitectónico MVC, mapeados a los elementos de Análisis: Frontera (IU), Control (CTR) y Entidad (CE).

### CU01: Iniciar Sesión en Plataforma
```plantuml
@startuml DCom_CU01
left to right direction
skinparam backgroundColor transparent
actor "Usuario" as Actor
boundary "IU_Login" as IU
control "CTR_Auth" as CTR
entity "CE_Usuario" as ENT
entity "CE_Bitacora" as ENT2
Actor --> IU : 1: Ingresar email y password
IU --> CTR : 2: login(email, password)
CTR --> ENT : 3: select_where(email)
ENT --> CTR : 4: Datos y Hash
CTR --> ENT2 : 5: insert(LOGIN)
CTR --> IU : 6: Redirigir a Home
@enduml
```

### CU02: Cerrar Sesión Activa
```plantuml
@startuml DCom_CU02
left to right direction
skinparam backgroundColor transparent
actor "Usuario" as Actor
boundary "IU_Dashboard" as IU
control "CTR_Auth" as CTR
entity "CE_Bitacora" as ENT2
Actor --> IU : 1: Clic 'Cerrar Sesión'
IU --> CTR : 2: logout()
CTR --> CTR : 3: destruirToken()
CTR --> ENT2 : 4: insert(LOGOUT)
CTR --> IU : 5: Redirigir a Login
@enduml
```

### CU03: Registrar Nuevo Empleado
```plantuml
@startuml DCom_CU03
left to right direction
skinparam backgroundColor transparent
actor "Admin" as Actor
boundary "IU_RRHH" as IU
control "CTR_Usuario" as CTR
entity "CE_Usuario" as ENT
entity "CE_Bitacora" as ENT2
Actor --> IU : 1: Llenar formulario
IU --> CTR : 2: registrarEmpleado(datos)
CTR --> ENT : 3: check_dni()
CTR --> ENT : 4: insert(usuario)
ENT ..> ENT2 : 4.1: <<trigger DB>> insert(audit)
ENT --> CTR : 5: Ok BD
CTR --> IU : 6: Mensaje de éxito
@enduml
```

### CU04: Inhabilitar Empleado
```plantuml
@startuml DCom_CU04
left to right direction
skinparam backgroundColor transparent
actor "Admin" as Actor
boundary "IU_RRHH" as IU
control "CTR_Usuario" as CTR
entity "CE_Usuario" as ENT
entity "CE_Bitacora" as ENT2
Actor --> IU : 1: Clic 'Inhabilitar'
IU --> CTR : 2: darDeBaja(id)
CTR --> ENT : 3: update(is_active=false)
ENT ..> ENT2 : 3.1: <<trigger DB>> insert(audit)
ENT --> CTR : 4: Confirmación BD
CTR --> IU : 5: Actualizar lista visual
@enduml
```

### CU05: Asignar/Modificar Roles
```plantuml
@startuml DCom_CU05
left to right direction
skinparam backgroundColor transparent
actor "Admin" as Actor
boundary "IU_Permisos" as IU
control "CTR_Rol" as CTR
entity "CE_Usuario" as ENT1
entity "CE_Bitacora" as ENT2
Actor --> IU : 1: Seleccionar nuevo rol
IU --> CTR : 2: asignarNuevoRol(id, rol)
CTR --> ENT1 : 3: update(id_rol)
ENT1 ..> ENT2 : 3.1: <<trigger DB>> insert(audit)
ENT1 --> CTR : 4: OK
CTR --> IU : 5: Notificar Exito
@enduml
```

### CU08: Registrar Nuevo Producto/Insumo en Catálogo
```plantuml
@startuml DCom_CU08
left to right direction
skinparam backgroundColor transparent
actor "Admin/WMS" as Actor
boundary "IU_Catalogo" as IU
control "CTR_Inventario" as CTR
entity "CE_Catalogo_Items" as ENT
entity "CE_Bitacora" as ENT2
Actor --> IU : 1: Crear Ítem
IU --> CTR : 2: registrarCatalogo(Item)
CTR --> ENT : 3: check_codigo()
CTR --> ENT : 4: insert(Item)
ENT ..> ENT2 : 4.1: <<trigger DB>> insert(audit)
ENT --> CTR : 5: ID generado
CTR --> IU : 6: Refrescar catálogo
@enduml
```

### CU09: Consultar Kardex Dinámico
```plantuml
@startuml DCom_CU09
left to right direction
skinparam backgroundColor transparent
actor "Operador" as Actor
boundary "IU_Kardex" as IU
control "CTR_Kardex" as CTR
entity "CE_Kardex" as ENT
Actor --> IU : 1: Filtrar fechas/producto
IU --> CTR : 2: consultarMovimientos()
CTR --> ENT : 3: select_where()
ENT --> CTR : 4: Array de registros
CTR --> IU : 5: Renderizar Gráfica
@enduml
```

### CU12: Registrar Proveedor/Ganadero
```plantuml
@startuml DCom_CU12
left to right direction
skinparam backgroundColor transparent
actor "Compras" as Actor
boundary "IU_Proveedores" as IU
control "CTR_Proveedor" as CTR
entity "CE_Proveedor" as ENT
entity "CE_Bitacora" as ENT2
Actor --> IU : 1: Ingresar datos
IU --> CTR : 2: guardarProveedor()
CTR --> ENT : 3: checkNit()
CTR --> ENT : 4: insert(Proveedor)
ENT ..> ENT2 : 4.1: <<trigger DB>> insert(audit)
ENT --> CTR : 5: Confirmación BD
CTR --> IU : 6: Mostrar éxito
@enduml
```

### CU26: Registrar Cliente Comercial
```plantuml
@startuml DCom_CU26
left to right direction
skinparam backgroundColor transparent
actor "Vendedor" as Actor
boundary "IU_Clientes" as IU
control "CTR_Cliente" as CTR
entity "CE_Cliente" as ENT
entity "CE_Bitacora" as ENT2
Actor --> IU : 1: Registrar Datos
IU --> CTR : 2: registrarClienteNuevo()
CTR --> ENT : 3: check_nit()
CTR --> ENT : 4: insert(Cliente)
ENT ..> ENT2 : 4.1: <<trigger DB>> insert(audit)
ENT --> CTR : 5: OK
CTR --> IU : 6: Añadir a Cartera
@enduml
```

### CU31: Cambiar Contraseña Propia
```plantuml
@startuml DCom_CU31
left to right direction
skinparam backgroundColor transparent
actor "Usuario Autenticado" as Actor
boundary "IU_Perfil" as IU
control "CTR_Password" as CTR
entity "CE_Usuario" as ENT1
entity "CE_Bitacora" as ENT2
Actor --> IU : 1: Clic 'Cambiar Contraseña'
IU --> CTR : 2: cambiarPassword(actual, nueva)
CTR --> ENT1 : 3: verificarHashActual()
CTR --> CTR : 4: validarPoliticaSeguridad()
CTR --> ENT1 : 5: update(password_hash)
CTR --> ENT2 : 6: insert(CAMBIO_PASSWORD)
CTR --> IU : 7: Toast de éxito
@enduml
```

### CU32: Recuperar Contraseña Olvidada
```plantuml
@startuml DCom_CU32
left to right direction
skinparam backgroundColor transparent
actor "Usuario No Autenticado" as Actor
boundary "IU_Recovery" as IU
control "CTR_Recovery" as CTR
entity "CE_Usuario" as ENT1
entity "CE_Bitacora" as ENT2
Actor --> IU : 1: Ingresar email corporativo
IU --> CTR : 2: solicitarReset(email)
CTR --> ENT1 : 3: verificarEmailExiste()
CTR --> CTR : 4: generarTokenTemporal(5min)
CTR --> IU : 5: Enviar email con enlace
Actor --> IU : 6: Clic en enlace del correo
IU --> CTR : 7: validarToken(token)
CTR --> CTR : 8: validarNuevaPassword()
CTR --> ENT1 : 9: update(password_hash)
CTR --> ENT2 : 10: insert(RESET_PASSWORD)
CTR --> IU : 11: Redirigir a Login
@enduml
```

## 8.3. Análisis de Clases

A continuación se presentan los Diagramas de Clases de Análisis (MVC), los cuales definen de manera estática los prototipos de atributos y métodos abstractos para todas las fronteras, controladores y entidades del Ciclo 1.

### CU01: Iniciar Sesión en Plataforma
```plantuml
@startuml DClases_CU01
allowmixing
left to right direction
skinparam classAttributeIconSize 0
skinparam backgroundColor transparent
actor "Usuario" as Actor

class "IU_Login" as IU <<Boundary>> {
  + email : String
  + password : String
  --
  + tomarDatos()
  + validarFormulario()
  + enviarSolicitudLogin()
  + mostrarError(mensaje)
  + mostrarHome()
}

class "CTR_Auth" as CTR <<Control>> {
  --
  + login(email, password)
  + validarCredenciales()
  + generarTokenJWT()
  + registrarIngresoBitacora()
}

class "CE_Usuario" as ENT <<Entity>> {
  - id_usuario : Integer
  - email : String
  - password_hash : String
  - full_name : String
  - is_active : Boolean
  - id_rol : Integer
}

class "CE_Bitacora" as ENT2 <<Entity>> {
  - accion_sql : String
  - fecha_hora : DateTime
}

Actor --> IU
IU --> CTR
CTR --> ENT
CTR --> ENT2
@enduml
```

### CU02: Cerrar Sesión Activa
```plantuml
@startuml DClases_CU02
allowmixing
left to right direction
skinparam classAttributeIconSize 0
skinparam backgroundColor transparent
actor "Usuario Autenticado" as Actor

class "IU_Dashboard" as IU <<Boundary>> {
  --
  + clicCerrarSesion()
  + mostrarAlertaConfirmacion()
  + redirigirLogin()
}

class "CTR_Auth" as CTR <<Control>> {
  --
  + logout()
  + destruirToken()
  + limpiarCache()
  + registrarSalidaBitacora()
}

class "CE_Bitacora" as ENT2 <<Entity>> {
  - accion_sql : String
  - fecha_hora : DateTime
}

Actor --> IU
IU --> CTR
CTR --> ENT2
@enduml
```

### CU03: Registrar Nuevo Empleado
```plantuml
@startuml DClases_CU03
allowmixing
left to right direction
skinparam classAttributeIconSize 0
skinparam backgroundColor transparent
actor "Administrador" as Actor

class "IU_RRHH" as IU <<Boundary>> {
  + dni : String
  + fullName : String
  + email : String
  --
  + abrirFormularioNuevo()
  + capturarDatosEntrada()
  + mostrarMensajeExito()
}

class "CTR_Usuario" as CTR <<Control>> {
  --
  + registrarEmpleado(datos)
  + verificarDuplicidadDNI()
  + generarPasswordDefault()
  + guardarUsuario()
}

class "CE_Usuario" as ENT <<Entity>> {
  - id_usuario : Integer
  - dni : String
  - email : String
  - full_name : String
  - is_active : Boolean
}

class "CE_Bitacora" as ENT2 <<Entity>> {
  - accion_sql : String
  - fecha_hora : DateTime
}

Actor --> IU
IU --> CTR
CTR --> ENT
ENT ..> ENT2 : <<trigger>>
@enduml
```

### CU04: Inhabilitar Empleado
```plantuml
@startuml DClases_CU04
allowmixing
left to right direction
skinparam classAttributeIconSize 0
skinparam backgroundColor transparent
actor "Administrador" as Actor

class "IU_RRHH" as IU <<Boundary>> {
  + idEmpleadoSeleccionado : Integer
  --
  + seleccionarFila()
  + confirmarBajaLogica()
  + actualizarGrillaVisual()
}

class "CTR_Usuario" as CTR <<Control>> {
  --
  + darDeBaja(id_empleado)
  + destruirTokensActivos()
  + actualizarEstadoUsuario()
}

class "CE_Usuario" as ENT <<Entity>> {
  - id_usuario : Integer
  - is_active : Boolean
}

class "CE_Bitacora" as ENT2 <<Entity>> {
  - accion_sql : String
  - fecha_hora : DateTime
}

Actor --> IU
IU --> CTR
CTR --> ENT
ENT ..> ENT2 : <<trigger>>
@enduml
```

### CU05: Asignar/Modificar Roles y Permisos
```plantuml
@startuml DClases_CU05
allowmixing
left to right direction
skinparam classAttributeIconSize 0
skinparam backgroundColor transparent
actor "Administrador" as Actor

class "IU_Permisos" as IU <<Boundary>> {
  + idEmpleado : Integer
  + idRolNuevo : Integer
  --
  + seleccionarRolCombo()
  + enviarCambioRol()
  + mostrarNotificacion()
}

class "CTR_Rol" as CTR <<Control>> {
  --
  + asignarNuevoRol(idEmp, idRol)
  + verificarCompatibilidad()
}

class "CE_Usuario" as ENT1 <<Entity>> {
  - id_usuario : Integer
  - id_rol : Integer
}

class "CE_Bitacora" as ENT2 <<Entity>> {
  - accion_sql : String
  - fecha_hora : DateTime
}

Actor --> IU
IU --> CTR
CTR --> ENT1
ENT1 ..> ENT2 : <<trigger>>
@enduml
```

### CU08: Registrar Nuevo Producto/Insumo en Catálogo
```plantuml
@startuml DClases_CU08
allowmixing
left to right direction
skinparam classAttributeIconSize 0
skinparam backgroundColor transparent
actor "Administrador" as Actor

class "IU_Catalogo" as IU <<Boundary>> {
  + codigo : String
  + nombreItem : String
  + tipoCategoria : String
  + unidadMedida : String
  --
  + llenarFormItem()
  + validarCamposVacios()
  + enviarGuardado()
}

class "CTR_Inventario" as CTR <<Control>> {
  --
  + registrarCatalogo(ItemDto)
  + verificarCodigoUnico()
  + insertarItemBase()
}

class "CE_Catalogo_Items" as ENT <<Entity>> {
  - id_item : Integer
  - codigo_ref : String
  - nombre_articulo : String
  - categoria : String
  - unidad_medida : String
}

class "CE_Bitacora" as ENT2 <<Entity>> {
  - accion_sql : String
  - fecha_hora : DateTime
}

Actor --> IU
IU --> CTR
CTR --> ENT
ENT ..> ENT2 : <<trigger>>
@enduml
```

### CU09: Consultar Kardex Dinámico
```plantuml
@startuml DClases_CU09
allowmixing
left to right direction
skinparam classAttributeIconSize 0
skinparam backgroundColor transparent
actor "Operador" as Actor

class "IU_Kardex" as IU <<Boundary>> {
  + idProducto : Integer
  + fechaInicio : Date
  + fechaFin : Date
  --
  + seleccionarFiltros()
  + dibujarTablaMayor()
  + graficarCurvaStock()
}

class "CTR_Kardex" as CTR <<Control>> {
  --
  + consultarMovimientos(filtros)
  + computarStockDinamico()
  + devolverArregloKardex()
}

class "CE_Kardex_Movimientos" as ENT <<Entity>> {
  - id_movimiento : Integer
  - id_item : Integer
  - tipo_transaccion : String
  - cantidad : Decimal
  - fecha_registro : DateTime
}

Actor --> IU
IU --> CTR
CTR --> ENT
@enduml
```

### CU12: Registrar Proveedor/Ganadero
```plantuml
@startuml DClases_CU12
allowmixing
left to right direction
skinparam classAttributeIconSize 0
skinparam backgroundColor transparent
actor "Area Compras" as Actor

class "IU_Proveedores" as IU <<Boundary>> {
  + nitCi : String
  + razonSocial : String
  + zonaAcopio : String
  --
  + ingresarDatosGanadero()
  + limpiarFormulario()
  + mandarPeticionCrear()
}

class "CTR_Proveedor" as CTR <<Control>> {
  --
  + guardarProveedor(datos)
  + validarNitUnico()
}

class "CE_Proveedor" as ENT <<Entity>> {
  - id_proveedor : Integer
  - nit_ci : String
  - razon_social : String
  - clasificacion : String
  - ruta_acopio : String
  - is_activo : Boolean
}

class "CE_Bitacora" as ENT2 <<Entity>> {
  - accion_sql : String
  - fecha_hora : DateTime
}

Actor --> IU
IU --> CTR
CTR --> ENT
ENT ..> ENT2 : <<trigger>>
@enduml
```

### CU26: Registrar Cliente Comercial
```plantuml
@startuml DClases_CU26
allowmixing
left to right direction
skinparam classAttributeIconSize 0
skinparam backgroundColor transparent
actor "Vendedor" as Actor

class "IU_Clientes" as IU <<Boundary>> {
  + nitFacturacion : String
  + nombreCliente : String
  + tipoCliente : String
  --
  + ingresarDatosCRM()
  + enviarAprobacionCliente()
}

class "CTR_Cliente" as CTR <<Control>> {
  --
  + registrarClienteNuevo()
  + verificarHistorial()
  + asignarPerfilPrecios()
}

class "CE_Cliente" as ENT <<Entity>> {
  - id_cliente : Integer
  - nit_ci : String
  - razon_social : String
  - tipo_mercado : String
}

class "CE_Bitacora" as ENT2 <<Entity>> {
  - accion_sql : String
  - fecha_hora : DateTime
}

Actor --> IU
IU --> CTR
CTR --> ENT
ENT ..> ENT2 : <<trigger>>
@enduml
```


### CU31: Cambiar Contraseña Propia
```plantuml
@startuml DClases_CU31
allowmixing
left to right direction
skinparam classAttributeIconSize 0
skinparam backgroundColor transparent
actor "Usuario Autenticado" as Actor

class "IU_Perfil" as IU <<Boundary>> {
  + passwordActual : String
  + passwordNueva : String
  + passwordConfirm : String
  --
  + abrirModalCambio()
  + validarCamposVacios()
  + mostrarChecklist()
  + enviarCambio()
  + mostrarToastExito()
}

class "CTR_Password" as CTR <<Control>> {
  --
  + cambiarPassword(actual, nueva)
  + verificarHashActual()
  + validarPoliticaSeguridad()
  + generarNuevoHash()
  + registrarEnBitacora()
}

class "CE_Usuario" as ENT1 <<Entity>> {
  - id_usuario : Integer
  - password_hash : String
  - updated_at : DateTime
}

class "CE_Bitacora" as ENT2 <<Entity>> {
  - id_log : Integer
  - accion_sql : String
  - fecha_hora : DateTime
}

Actor --> IU
IU --> CTR
CTR --> ENT1
CTR --> ENT2
@enduml
```

### CU32: Recuperar Contraseña Olvidada
```plantuml
@startuml DClases_CU32
allowmixing
left to right direction
skinparam classAttributeIconSize 0
skinparam backgroundColor transparent
actor "Usuario No Autenticado" as Actor

class "IU_Recovery" as IU <<Boundary>> {
  + emailCorporativo : String
  + nuevaPassword : String
  + confirmarPassword : String
  --
  + mostrarFormEmail()
  + enviarSolicitud()
  + mostrarMensajeGenerico()
  + mostrarFormNuevaClave()
}

class "CTR_Recovery" as CTR <<Control>> {
  --
  + solicitarReset(email)
  + verificarEmailExiste()
  + generarTokenTemporal()
  + enviarCorreoConEnlace()
  + validarToken(token)
  + actualizarPasswordHash()
  + registrarEnBitacora()
}

class "CE_Usuario" as ENT1 <<Entity>> {
  - id_usuario : Integer
  - email_corporativo : String
  - password_hash : String
  - intentos_fallidos : Integer
}

class "CE_Bitacora" as ENT2 <<Entity>> {
  - id_log : Integer
  - accion_sql : String
  - fecha_hora : DateTime
}

Actor --> IU
IU --> CTR
CTR --> ENT1
CTR --> ENT2
@enduml
```


ANEXOS

CONTROL DE HILADO PARA LA MOZZARELLA

FICHA RECEPCIÓN DE LA LECHE

PLANILLA DE LA ELABORACION DE LA CUAJADA

LOTE

QUESO PRENSADO

PLANILLA

FIN