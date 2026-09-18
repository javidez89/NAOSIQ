# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P06; vistas SU03, AD24

Caracteristica: HU-008 Onboarding reanudable

  @HU-008 @AC1 @pending_implementation
  Escenario: HU-008.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "No perder el alta incompleta"
    Cuando se ejecuta el caso exitoso de la tarea P06
    Entonces Volver al wizard recupera pasos confirmados y muestra lo pendiente.

  @HU-008 @AC2 @pending_implementation
  Escenario: HU-008.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "No perder el alta incompleta"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P06
    Entonces Precio sin aprobar no genera cargo real ni lo anuncia como tarifa.
