# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P04; vistas SU05, SU19

Caracteristica: HU-006 Control total auditado

  @HU-006 @AC1 @pending_implementation
  Escenario: HU-006.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Super Usuario opera cualquier comercio"
    Cuando se ejecuta el caso exitoso de la tarea P04
    Entonces Entrada muestra negocio, actor real y motivo; cambios tienen evento auditable.

  @HU-006 @AC2 @pending_implementation
  Escenario: HU-006.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Super Usuario opera cualquier comercio"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P04
    Entonces Administrador de comercio no puede abrir control global ni elevarse.
