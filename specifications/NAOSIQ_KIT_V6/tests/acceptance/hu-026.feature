# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P27; vistas AD31, AS08, CL11

Caracteristica: HU-026 Resultado financiero incierto

  @HU-026 @AC1 @pending_implementation
  Escenario: HU-026.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "No duplicar tras timeout"
    Cuando se ejecuta el caso exitoso de la tarea P27
    Entonces Consultar misma clave despues del commit devuelve pago confirmado original.

  @HU-026 @AC2 @pending_implementation
  Escenario: HU-026.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "No duplicar tras timeout"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P27
    Entonces Timeout no crea REJECTED ni solicita pagar de nuevo sin reconciliar.
