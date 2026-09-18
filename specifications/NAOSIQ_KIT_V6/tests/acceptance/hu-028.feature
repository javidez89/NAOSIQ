# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P16; vistas AD17, AD29, AD30, AS11

Caracteristica: HU-028 Venta asistida

  @HU-028 @AC1 @pending_implementation
  Escenario: HU-028.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Reutilizar dinero e inventario"
    Cuando se ejecuta el caso exitoso de la tarea P16
    Entonces Venta valida registra items, pago y movimiento vinculado.

  @HU-028 @AC2 @pending_implementation
  Escenario: HU-028.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Reutilizar dinero e inventario"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P16
    Entonces Cancelar venta no oculta dinero ni devuelve stock sin evento autorizado.
