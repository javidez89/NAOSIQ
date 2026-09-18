# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P11; vistas TE07, TE06, AD09

Caracteristica: HU-017 Proceso tecnico

  @HU-017 @AC1 @pending_implementation
  Escenario: HU-017.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Transiciones permitidas"
    Cuando se ejecuta el caso exitoso de la tarea P11
    Entonces Estado/subestado cambia con motivo y actor, conservando historia.

  @HU-017 @AC2 @pending_implementation
  Escenario: HU-017.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Transiciones permitidas"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P11
    Entonces No se salta de recibido a entregado sin controles.
