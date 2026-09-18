# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P12; vistas AD34, AD32, SU15

Caracteristica: HU-034 Documentos y plantillas

  @HU-034 @AC1 @pending_implementation
  Escenario: HU-034.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Snapshot versionado"
    Cuando se ejecuta el caso exitoso de la tarea P12
    Entonces Cambio de plantilla afecta nuevas emisiones; copia antigua conserva version.

  @HU-034 @AC2 @pending_implementation
  Escenario: HU-034.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Snapshot versionado"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P12
    Entonces Nueva descarga no toma importes editados para reescribir un recibo.
