# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P27; vistas AU03, AU05

Caracteristica: HU-004 Revocacion y sesion

  @HU-004 @AC1 @pending_implementation
  Escenario: HU-004.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Reautenticar sin repetir mutaciones"
    Cuando se ejecuta el caso exitoso de la tarea P27
    Entonces Tras reingresar, se recupera el ultimo borrador confirmado de la misma identidad.

  @HU-004 @AC2 @pending_implementation
  Escenario: HU-004.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Reautenticar sin repetir mutaciones"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P27
    Entonces Reingreso con otra cuenta no recupera datos ni reproduce un pago de la anterior.
