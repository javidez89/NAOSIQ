# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P13; vistas CL18, AD11

Caracteristica: HU-022 Abonos y saldos

  @HU-022 @AC1 @pending_implementation
  Escenario: HU-022.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Libro de movimientos"
    Cuando se ejecuta el caso exitoso de la tarea P13
    Entonces 350000 total menos 100000 confirmado da 250000 pendiente; pago final deja cero.

  @HU-022 @AC2 @pending_implementation
  Escenario: HU-022.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Libro de movimientos"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P13
    Entonces Reporte pendiente o rechazo no modifica el saldo; sobrepago queda bloqueado D07.
