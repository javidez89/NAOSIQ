# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P26; vistas AS04, AD14, AD09, TE01, TE02

Caracteristica: HU-014 Derivacion y asignacion

  @HU-014 @AC1 @pending_implementation
  Escenario: HU-014.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Pasar contexto al tecnico"
    Cuando se ejecuta el caso exitoso de la tarea P26
    Entonces Tecnico asignado recibe falla, fotos y condiciones del equipo.

  @HU-014 @AC2 @pending_implementation
  Escenario: HU-014.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Pasar contexto al tecnico"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P26
    Entonces Asesor no adquiere permisos tecnicos por abrir un componente compartido.
