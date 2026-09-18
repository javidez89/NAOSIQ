# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P23; vistas TE10, AU06

Caracteristica: HU-038 PWA offline y actualizacion

  @HU-038 @AC1 @pending_implementation
  Escenario: HU-038.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Borrador local no es hecho"
    Cuando se ejecuta el caso exitoso de la tarea P23
    Entonces Nota local se identifica pendiente y se revalida al reconectar.

  @HU-038 @AC2 @pending_implementation
  Escenario: HU-038.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Borrador local no es hecho"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P23
    Entonces Stock, pago, entrega o aprobacion offline no se confirman definitivamente.
