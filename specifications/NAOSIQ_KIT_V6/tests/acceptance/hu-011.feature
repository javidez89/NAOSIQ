# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P09; vistas CL03, CL04, CL05, CL06, AD03

Caracteristica: HU-011 Nueva solicitud

  @HU-011 @AC1 @pending_implementation
  Escenario: HU-011.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Solicitud no es custodia"
    Cuando se ejecuta el caso exitoso de la tarea P09
    Entonces Cliente envia solicitud y obtiene OT inicial con falla y contacto.

  @HU-011 @AC2 @pending_implementation
  Escenario: HU-011.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Solicitud no es custodia"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P09
    Entonces Sin recepcion fisica, no se obtiene voucher de custodia.
