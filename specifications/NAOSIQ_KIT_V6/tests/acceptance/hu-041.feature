# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P22; vistas SU13, SU14, SU11

Caracteristica: HU-041 Auditoria y soporte

  @HU-041 @AC1 @pending_implementation
  Escenario: HU-041.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Acciones rastreables"
    Cuando se ejecuta el caso exitoso de la tarea P22
    Entonces Soporte relaciona evento, operacion y documento con actor real.

  @HU-041 @AC2 @pending_implementation
  Escenario: HU-041.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Acciones rastreables"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P22
    Entonces Ninguna UI elimina trazas ni muestra secretos completos en logs.
