# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P18; vistas AD18, AS06, TE09, CL13

Caracteristica: HU-031 Mensajes por audiencia

  @HU-031 @AC1 @pending_implementation
  Escenario: HU-031.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Nota interna nunca llega al cliente"
    Cuando se ejecuta el caso exitoso de la tarea P18
    Entonces Mensaje con client_message_id llega una vez al destinatario autorizado.

  @HU-031 @AC2 @pending_implementation
  Escenario: HU-031.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Nota interna nunca llega al cliente"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P18
    Entonces Intento de leer nota interna desde cliente se deniega sin filtrar texto.
