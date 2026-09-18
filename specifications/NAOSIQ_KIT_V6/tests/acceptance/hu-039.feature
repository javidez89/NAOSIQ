# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P09; vistas TE12, CL04, AD05

Caracteristica: HU-039 Evidencias y subidas

  @HU-039 @AC1 @pending_implementation
  Escenario: HU-039.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Archivos seguros"
    Cuando se ejecuta el caso exitoso de la tarea P09
    Entonces Archivo permitido se valida y asocia al recurso correcto.

  @HU-039 @AC2 @pending_implementation
  Escenario: HU-039.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Archivos seguros"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P09
    Entonces MIME/tamano rechazado no pierde archivos ya subidos ni deja acceso publico.
