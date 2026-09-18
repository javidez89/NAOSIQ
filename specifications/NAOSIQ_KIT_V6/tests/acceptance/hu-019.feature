# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P14; vistas CL10, CL11, CL25, AS07

Caracteristica: HU-019 Reportar pago

  @HU-019 @AC1 @pending_implementation
  Escenario: HU-019.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Reporte no es ingreso"
    Cuando se ejecuta el caso exitoso de la tarea P14
    Entonces Cliente recibe estado reportado y saldo sin cambio.

  @HU-019 @AC2 @pending_implementation
  Escenario: HU-019.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Reporte no es ingreso"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P14
    Entonces Adjuntar comprobante no emite voucher de pago ni reduce deuda.
