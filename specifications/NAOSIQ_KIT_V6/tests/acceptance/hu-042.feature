# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P31; vistas AD33, CL14

Caracteristica: HU-042 Privacidad y condiciones

  @HU-042 @AC1 @pending_implementation
  Escenario: HU-042.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Politicas aprobadas"
    Cuando se ejecuta el caso exitoso de la tarea P31
    Entonces Piloto muestra condiciones versionadas y preferencias registradas.

  @HU-042 @AC2 @pending_implementation
  Escenario: HU-042.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Politicas aprobadas"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P31
    Entonces No se activa borrado irreversible o plazo de garantia inventado.
