# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P02; vistas AU02, AD25

Caracteristica: HU-002 Tenant y membresias

  @HU-002 @AC1 @pending_implementation
  Escenario: HU-002.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Aislar todos los recursos por comercio"
    Cuando se ejecuta el caso exitoso de la tarea P02
    Entonces Usuario de A consulta solo recursos de A con membresia activa.

  @HU-002 @AC2 @pending_implementation
  Escenario: HU-002.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Aislar todos los recursos por comercio"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P02
    Entonces Solicitar OT/documento de B devuelve denegacion y no revela su contenido.
