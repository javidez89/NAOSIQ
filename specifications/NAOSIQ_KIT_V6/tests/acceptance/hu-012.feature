# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P09; vistas AS03, AD05, TE11

Caracteristica: HU-012 Recepcion con evidencia

  @HU-012 @AC1 @pending_implementation
  Escenario: HU-012.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Confirmar custodia real"
    Cuando se ejecuta el caso exitoso de la tarea P09
    Entonces Personal autorizado confirma estado fisico/accesorios y evento unico.

  @HU-012 @AC2 @pending_implementation
  Escenario: HU-012.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Confirmar custodia real"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P09
    Entonces Usuario sin permiso o version obsoleta no confirma; datos se mantienen para revisar.
