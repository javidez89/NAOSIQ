# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P19; vistas SU06, SU16, SU07, SU17, SU08, AD23

Caracteristica: HU-036 Planes y ciclo SaaS

  @HU-036 @AC1 @pending_implementation
  Escenario: HU-036.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Facturar un ciclo una vez"
    Cuando se ejecuta el caso exitoso de la tarea P19
    Entonces Job con politica de ensayo crea un solo cargo por periodo.

  @HU-036 @AC2 @pending_implementation
  Escenario: HU-036.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Facturar un ciclo una vez"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P19
    Entonces Reintentar job o pago cliente al negocio no paga ni duplica mensualidad.
