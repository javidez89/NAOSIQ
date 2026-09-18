# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P11; vistas AD35, AS09, CL24

Caracteristica: HU-029 Entrega del equipo

  @HU-029 @AC1 @pending_implementation
  Escenario: HU-029.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Custodia separada de dinero"
    Cuando se ejecuta el caso exitoso de la tarea P11
    Entonces Con habilitacion y receptor verificados se guarda constancia de entrega.

  @HU-029 @AC2 @pending_implementation
  Escenario: HU-029.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Custodia separada de dinero"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P11
    Entonces Saldo o QA pendiente bloquean entrega salvo excepcion aprobada; pago no marca entregado solo.
