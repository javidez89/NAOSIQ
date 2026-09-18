# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P31; vistas VR04

Caracteristica: HU-044 Piloto operativo e impresora

  @HU-044 @AC1 @pending_implementation
  Escenario: HU-044.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Validacion en entorno real autorizado"
    Cuando se ejecuta el caso exitoso de la tarea P31
    Entonces Se prueba restore y salida fisica Carta/A4/80mm segun decision del piloto.

  @HU-044 @AC2 @pending_implementation
  Escenario: HU-044.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Validacion en entorno real autorizado"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P31
    Entonces Sin evidencia de hardware no se declara compatibilidad certificada ni go-live completo.
