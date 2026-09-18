# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P15; vistas AD15, AD16, AD28, TE06

Caracteristica: HU-027 Inventario y reservas

  @HU-027 @AC1 @pending_implementation
  Escenario: HU-027.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Stock transaccional"
    Cuando se ejecuta el caso exitoso de la tarea P15
    Entonces Un consumo vinculado a OT descuenta una vez.

  @HU-027 @AC2 @pending_implementation
  Escenario: HU-027.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Stock transaccional"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P15
    Entonces Carrera entre venta y reparacion por ultima unidad no genera stock negativo.
