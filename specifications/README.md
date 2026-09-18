# Especificaciones del producto

Esta carpeta reúne dentro del repositorio las fuentes documentales utilizadas
para construir y verificar la aplicación.

## NAOSIQ V6

`NAOSIQ_KIT_V6` es una copia íntegra y verificable del paquete recibido. Contiene
prompts, PDF, contratos, pantallas, recorridos, escenarios y recursos de identidad.
Su punto de entrada es [`NAOSIQ_KIT_V6/START_HERE.md`](NAOSIQ_KIT_V6/START_HERE.md)
y su índice normativo es
[`NAOSIQ_KIT_V6/SPEC_INDEX.md`](NAOSIQ_KIT_V6/SPEC_INDEX.md).

La carpeta no es una segunda aplicación. El visor HTML del kit es una referencia
navegable con datos ficticios y no guarda información de negocio.

## Límites del repositorio

- `src`, `supabase`, `public` y `scripts` contienen la aplicación ejecutable.
- `tests` contiene la verificación automatizada de la implementación.
- `docs` y `reports` documentan arquitectura, cobertura y evidencia generada.
- `specifications/NAOSIQ_KIT_V6` conserva la especificación de origen.
- `.local`, `.env.local`, `.next`, `node_modules` y `reports/local` son artefactos
  privados o generados y permanecen fuera de Git.

La copia externa `D:\NAOSIQ\NAOSIQ_KIT_V6` se conserva temporalmente como respaldo.
Cuando la versión del repositorio haya sido revisada y publicada, puede archivarse
sin afectar la ejecución local.
