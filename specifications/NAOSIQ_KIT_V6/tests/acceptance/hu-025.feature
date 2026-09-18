# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P28; vistas VR04

Caracteristica: HU-025 Cancelacion de impresion

  @HU-025 @AC1 @pending_implementation
  Escenario: HU-025.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Dialogo no demuestra salida fisica"
    Cuando se ejecuta el caso exitoso de la tarea P28
    Entonces Al cerrar dialogo se conserva voucher y saldo.

  @HU-025 @AC2 @pending_implementation
  Escenario: HU-025.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Dialogo no demuestra salida fisica"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P28
    Entonces afterprint no se registra como papel impreso ni cancela la operacion.
