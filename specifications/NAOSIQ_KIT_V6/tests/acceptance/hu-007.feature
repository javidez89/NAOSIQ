# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P05; vistas SU09

Caracteristica: HU-007 URL central

  @HU-007 @AC1 @pending_implementation
  Escenario: HU-007.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Asignar URL sin colisiones"
    Cuando se ejecuta el caso exitoso de la tarea P05
    Entonces Cambio de slug conserva vinculos a documentos por ID estable.

  @HU-007 @AC2 @pending_implementation
  Escenario: HU-007.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Asignar URL sin colisiones"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P05
    Entonces Dos comercios intentan mismo slug y solo uno lo confirma.
