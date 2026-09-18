# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P10; vistas AD07, AD08, AD26, CL09, AS05

Caracteristica: HU-016 Cotizacion versionada

  @HU-016 @AC1 @pending_implementation
  Escenario: HU-016.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Aprobar exactamente lo publicado"
    Cuando se ejecuta el caso exitoso de la tarea P10
    Entonces Cliente acepta version vigente y queda evidencia fechada.

  @HU-016 @AC2 @pending_implementation
  Escenario: HU-016.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Aprobar exactamente lo publicado"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P10
    Entonces Version vencida/reemplazada o cliente ajeno no se puede aprobar.
