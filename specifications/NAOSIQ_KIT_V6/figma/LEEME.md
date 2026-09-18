# Continuar el diseno en Figma

Este paquete NO contiene un archivo .fig ni un enlace a un documento nativo creado. Contiene vistas SVG con formas y texto, una referencia raster del lockup y un mapa de conexiones para reconstruir el prototipo.

Organizacion sugerida: 00 Marca; 01 Acceso; 02 Master; 03 Negocio; 04 Asesor; 05 Tecnico; 06 Cliente; 07 Vouchers; 08 Flujos.

Los SVG se encuentran en design/screens. Las dimensiones y posiciones de botones estan en design/screen-layouts.json. Los valores de color estan en color-values.json; validar la sintaxis del importador que utilice el equipo. connections.csv describe destino, modo, receptor y retorno.

La importacion no convierte los SVG automaticamente en Auto Layout, variantes, componentes o variables vinculadas; tampoco instala interacciones de prototipo. El texto hace referencia a Inter y puede requerir esa familia disponible. No se entregan fuentes.

Antes de publicar: sustituir logo de referencia por maestro oficial, comprobar componentes, contraste, estados, roles y reacciones en el archivo editable. El visor HTML es la referencia navegable externa de revision.
