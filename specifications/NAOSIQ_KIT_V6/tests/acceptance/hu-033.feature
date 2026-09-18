# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P26; vistas AS01, AS10, AS12

Caracteristica: HU-033 Agenda y perfil Asesor

  @HU-033 @AC1 @pending_implementation
  Escenario: HU-033.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Atencion sin privilegios globales"
    Cuando se ejecuta el caso exitoso de la tarea P26
    Entonces Asesor organiza tareas del alcance y solicita permiso sin concederselo.

  @HU-033 @AC2 @pending_implementation
  Escenario: HU-033.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Atencion sin privilegios globales"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P26
    Entonces Cambiar preferencia del perfil no modifica rol ni delegacion.
