# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P14; vistas AD31, AD11

Caracteristica: HU-020 Verificacion financiera

  @HU-020 @AC1 @pending_implementation
  Escenario: HU-020.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Aplicar dinero una vez"
    Cuando se ejecuta el caso exitoso de la tarea P14
    Entonces Admin confirma evidencia y se crea asignacion/recibo/operation unico.

  @HU-020 @AC2 @pending_implementation
  Escenario: HU-020.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Aplicar dinero una vez"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P14
    Entonces Dos aprobaciones simultaneas del mismo reporte no duplican dinero.
