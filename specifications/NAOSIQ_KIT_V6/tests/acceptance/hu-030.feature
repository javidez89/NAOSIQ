# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P11; vistas AD36

Caracteristica: HU-030 Reingreso y no reparable

  @HU-030 @AC1 @pending_implementation
  Escenario: HU-030.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Conservar la historia"
    Cuando se ejecuta el caso exitoso de la tarea P11
    Entonces Garantia genera nueva OT vinculada y resolucion conserva la original.

  @HU-030 @AC2 @pending_implementation
  Escenario: HU-030.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Conservar la historia"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P11
    Entonces No borrar trabajo/cobros originales para simular devolucion o cancelacion.
