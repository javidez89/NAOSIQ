# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P08; vistas AD12, AD13, AD27, CL17, AS02

Caracteristica: HU-010 Clientes y equipos

  @HU-010 @AC1 @pending_implementation
  Escenario: HU-010.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Relacion contextual"
    Cuando se ejecuta el caso exitoso de la tarea P08
    Entonces Crear cliente y equipo conserva historial en el comercio correcto.

  @HU-010 @AC2 @pending_implementation
  Escenario: HU-010.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Relacion contextual"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P08
    Entonces Coincidencia de telefono no fusiona automaticamente ni revela otro cliente.
