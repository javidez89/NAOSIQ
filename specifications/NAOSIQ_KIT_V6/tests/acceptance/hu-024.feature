# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P28; vistas VR04, CL19, AD32

Caracteristica: HU-024 Vista previa y descarga

  @HU-024 @AC1 @pending_implementation
  Escenario: HU-024.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Archivo autorizado"
    Cuando se ejecuta el caso exitoso de la tarea P28
    Entonces Descarga valida obtiene snapshot/version correctos en formato propuesto.

  @HU-024 @AC2 @pending_implementation
  Escenario: HU-024.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Archivo autorizado"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P28
    Entonces Enlace vencido pide reautorizar; otro cliente o tenant no descarga por cambiar ID.
