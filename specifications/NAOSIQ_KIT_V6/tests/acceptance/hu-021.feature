# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P14; vistas AS08, TE13

Caracteristica: HU-021 Efectivo y cambio

  @HU-021 @AC1 @pending_implementation
  Escenario: HU-021.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Caja delegada explicita"
    Cuando se ejecuta el caso exitoso de la tarea P14
    Entonces Cajero autorizado aplica importe correcto y calcula cambio sin sumarlo al ingreso.

  @HU-021 @AC2 @pending_implementation
  Escenario: HU-021.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Caja delegada explicita"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P14
    Entonces Asesor sin delegacion no confirma efectivo aunque el boton exista en la maqueta.
