# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P29; vistas catalogo completo

Caracteristica: HU-043 Cobertura de controles UX

  @HU-043 @AC1 @pending_implementation
  Escenario: HU-043.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Cada accion tiene exito, error y recuperacion"
    Cuando se ejecuta el caso exitoso de la tarea P29
    Entonces Las 363 acciones del catalogo conservan IDs y contrato de resultados.

  @HU-043 @AC2 @pending_implementation
  Escenario: HU-043.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Cada accion tiene exito, error y recuperacion"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P29
    Entonces Ningun destino compartido concede otro rol; los pendientes de implementacion son explicitos.
