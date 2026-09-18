# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P20; vistas SU18, CL15, AD23

Caracteristica: HU-037 Suspension y cortesia

  @HU-037 @AC1 @pending_implementation
  Escenario: HU-037.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Control de acceso por servidor"
    Cuando se ejecuta el caso exitoso de la tarea P20
    Entonces Impago tras gracia aprobada restringe operaciones y deja pago/soporte.

  @HU-037 @AC2 @pending_implementation
  Escenario: HU-037.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Control de acceso por servidor"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P20
    Entonces Peticion directa no elude suspension; cortesia no se suma a ingresos.
