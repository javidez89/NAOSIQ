# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P17; vistas SU12, AD21, CL23

Caracteristica: HU-032 WhatsApp para todos

  @HU-032 @AC1 @pending_implementation
  Escenario: HU-032.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Abrir no equivale a enviar"
    Cuando se ejecuta el caso exitoso de la tarea P17
    Entonces Basico abre mensaje preconfigurado con datos permitidos.

  @HU-032 @AC2 @pending_implementation
  Escenario: HU-032.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Abrir no equivale a enviar"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P17
    Entonces Volver de WhatsApp no marca entregado/leido sin evidencia del proveedor.
