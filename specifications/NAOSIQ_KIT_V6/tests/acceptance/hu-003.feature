# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P03; vistas AU01, CL02

Caracteristica: HU-003 Google y retorno

  @HU-003 @AC1 @pending_implementation
  Escenario: HU-003.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Identidad sin autoasignacion de roles"
    Cuando se ejecuta el caso exitoso de la tarea P03
    Entonces Login valido retorna al contexto autorizado y conserva el destino seguro.

  @HU-003 @AC2 @pending_implementation
  Escenario: HU-003.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Identidad sin autoasignacion de roles"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P03
    Entonces Callback manipulado o destino externo no crea rol ni redirige a un sitio no permitido.
