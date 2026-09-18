# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P11; vistas AD10, TE08

Caracteristica: HU-018 QA y cierre

  @HU-018 @AC1 @pending_implementation
  Escenario: HU-018.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Prueba antes de completar"
    Cuando se ejecuta el caso exitoso de la tarea P11
    Entonces Pruebas obligatorias aprobadas permiten cerrar tecnicamente.

  @HU-018 @AC2 @pending_implementation
  Escenario: HU-018.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Prueba antes de completar"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P11
    Entonces QA fallido no indica completado ni pagado; vuelve a reparacion.
