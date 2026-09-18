# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P21; vistas SU01, SU20, AD01, AD22

Caracteristica: HU-040 Dashboards y exportes

  @HU-040 @AC1 @pending_implementation
  Escenario: HU-040.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Metricas sin doble conteo"
    Cuando se ejecuta el caso exitoso de la tarea P21
    Entonces Cobros netos consideran abonos una vez y muestran fecha del dato.

  @HU-040 @AC2 @pending_implementation
  Escenario: HU-040.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Metricas sin doble conteo"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P21
    Entonces Datos parciales no parecen cero real ni se mezclan en exporte cross-tenant.
