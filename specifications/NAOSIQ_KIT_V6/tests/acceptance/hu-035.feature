# language: es
# Especificacion pendiente de step definitions y ejecucion.
# Tarea P14; vistas AD20

Caracteristica: HU-035 Medios de pago negocio

  @HU-035 @AC1 @pending_implementation
  Escenario: HU-035.AC1
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Cuentas del comercio correcto"
    Cuando se ejecuta el caso exitoso de la tarea P14
    Entonces Configurar Bre-B/Nequi/transferencia/efectivo muestra instrucciones propias.

  @HU-035 @AC2 @pending_implementation
  Escenario: HU-035.AC2
    Dado un entorno de prueba aislado con comercios A y B y roles autorizados
    Y el alcance de "Cuentas del comercio correcto"
    Cuando se ejecuta el caso negativo o de excepcion de la tarea P14
    Entonces Cuenta receptora de otro comercio o SaaS no aparece en cobro de OT.
