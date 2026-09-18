# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P07; vistas CL01, AD19, CL20, CL21, CL22, CL23, CL26

Caracteristica: HU-009 Publicacion y pagina

  @HU-009 @AC1 @pending_implementation
  Escenario: HU-009.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Micrositio aislado"
    Cuando se ejecuta el caso exitoso de la tarea P07
    Entonces Publicar version aprobada muestra solo datos publicables del negocio.

  @HU-009 @AC2 @pending_implementation
  Escenario: HU-009.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Micrositio aislado"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P07
    Entonces Consulta por OT correlativa sin autenticacion no revela cliente, fotos o saldo.
