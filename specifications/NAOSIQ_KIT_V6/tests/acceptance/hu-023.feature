# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P28; vistas VR03, CL18, CL12

Caracteristica: HU-023 Voucher de pago

  @HU-023 @AC1 @pending_implementation
  Escenario: HU-023.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Voucher del recibo existente"
    Cuando se ejecuta el caso exitoso de la tarea P28
    Entonces Pago final confirmado permite consultar mismo recibo y saldo al emitir.

  @HU-023 @AC2 @pending_implementation
  Escenario: HU-023.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Voucher del recibo existente"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P28
    Entonces Reimprimir o pedir otro formato no crea una asignacion ni ingreso extra.
