# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P04; vistas SU02, SU03, SU04

Caracteristica: HU-005 Crear comercio

  @HU-005 @AC1 @pending_implementation
  Escenario: HU-005.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Alta idempotente central"
    Cuando se ejecuta el caso exitoso de la tarea P04
    Entonces Dos intentos con la misma clave devuelven la misma organizacion.

  @HU-005 @AC2 @pending_implementation
  Escenario: HU-005.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Alta idempotente central"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P04
    Entonces Falla de invitacion permite reenviar sin duplicar el negocio.
