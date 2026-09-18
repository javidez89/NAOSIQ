# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P10; vistas AD06, TE04, TE05

Caracteristica: HU-015 Diagnostico

  @HU-015 @AC1 @pending_implementation
  Escenario: HU-015.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Hallazgos y propuesta"
    Cuando se ejecuta el caso exitoso de la tarea P10
    Entonces Tecnico asignado guarda hallazgos y evidencia con version.

  @HU-015 @AC2 @pending_implementation
  Escenario: HU-015.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Hallazgos y propuesta"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P10
    Entonces Otro miembro sin alcance no altera el diagnostico ni ve notas protegidas.
