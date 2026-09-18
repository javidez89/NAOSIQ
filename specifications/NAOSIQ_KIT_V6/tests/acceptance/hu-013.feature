# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P28; vistas VR01, VR02

Caracteristica: HU-013 Voucher de recepcion

  @HU-013 @AC1 @pending_implementation
  Escenario: HU-013.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Copia imprimible del equipo recibido"
    Cuando se ejecuta el caso exitoso de la tarea P28
    Entonces Cliente obtiene documento con la fecha y actor del evento real.

  @HU-013 @AC2 @pending_implementation
  Escenario: HU-013.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Copia imprimible del equipo recibido"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P28
    Entonces PDF falla: reintentar render conserva evento, fecha y numero sin nueva recepcion.
