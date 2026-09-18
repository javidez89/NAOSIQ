# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P01; vistas AU04

Caracteristica: HU-001 Base ejecutable

  @HU-001 @AC1 @pending_implementation
  Escenario: HU-001.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Foundation con comandos y errores visibles"
    Cuando se ejecuta el caso exitoso de la tarea P01
    Entonces El proyecto de ensayo ejecuta sus verificaciones y muestra un error recuperable en lugar de pagina blanca.

  @HU-001 @AC2 @pending_implementation
  Escenario: HU-001.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Foundation con comandos y errores visibles"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P01
    Entonces Falta variable obligatoria y el arranque falla con mensaje seguro, sin exponer secretos.
