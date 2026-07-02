# Changelog & Solución de Errores - Facturador

Este documento detalla todos los cambios, refactorizaciones y soluciones implementadas hasta la fecha en el módulo de facturación del proyecto.

## 1. Correcciones de Arquitectura de Plantillas (Django)

Se detectó que el archivo `main.js` se estaba cargando y ejecutando múltiples veces en la misma página, lo cual provocaba errores de `TypeError` (al no encontrar elementos del DOM) y `SyntaxError` (por re-declaración de variables). Esto causaba que los botones de la interfaz dejaran de funcionar.

**Solución aplicada:**
- El problema provenía de que los "partials" (`products.html`, `summary.html`, `invoice_form.html`) incluían las etiquetas `{% extends 'layout/partials/header.html' %}` y `{% block content %}`.
- Al ser inyectados mediante `{% include %}` dentro de `single_page.html` (que a su vez ya extendía de `header.html`), Django imprimía todo el HTML base, incluyendo las cabeceras (`<head>`) y los scripts, de forma recursiva.
- **Acción:** Se eliminaron las etiquetas `extends` y `block` de todos los partials para convertirlos en componentes puros, manteniendo `single_page.html` como la única vista maestra.

## 2. Archivos Estáticos (CSS y HTML)

- **Error de tipografía (404):** El archivo de estilos base fue nombrado por error como `normalize.cc`. Fue renombrado exitosamente mediante consola a `normalize.css`.
- **Falta de ID en Tabla:** La tabla de productos en `products.html` solo contaba con una clase, pero JavaScript la buscaba por su ID. Se añadió el atributo `id="tabla_productos"`.

## 3. Lógica y Dinámica con JavaScript (`main.js`)

Se refactorizó el archivo `main.js` para limpiar código duplicado (se borró una función `enviarFactura()` simulada) e implementar nuevas funcionalidades:

### Lógica del Resumen (Tabla y Tarjetas)
- Se limpió el diseño de la tabla en `summary.html`, removiendo columnas innecesarias y el `<tfoot>` redundante, dejando las columnas: ID, Cantidad, Precio Unitario y Monto.
- Se implementó la función `generarResumen()` en `main.js`. Al hacer clic en "Mostrar Resumen", el script:
  - Lee los artículos agregados.
  - Lee el descuento y el impuesto global desde los campos del formulario.
  - Genera dinámicamente las filas de la tabla inferior calculando el monto por artículo.
  - Calcula el **Subtotal**, los **Impuestos** y el **Total** final.
  - Actualiza las tarjetas visuales de totales (Tarjetas de color).

### Persistencia de Datos (LocalStorage)
Para mejorar la experiencia del usuario y evitar pérdida de datos ante recargas accidentales del navegador, se implementó un sistema de persistencia usando `localStorage`:
- **`listaArticulos` y `contadorId`:** Se guardan en memoria cada vez que se agrega o elimina un producto.
- **Campos del Formulario:** Se añadió un *listener* a cada input (emisor, cliente, fechas, impuestos, descuentos) que guarda automáticamente cualquier cambio escrito.
- **Estado del Resumen:** Al generar el resumen, se guarda una bandera `facturador_resumen_visible = 'true'`. Si el usuario recarga la página, el script detecta la bandera y los artículos guardados, y regenera el resumen automáticamente sin tener que volver a presionar el botón.

### Botón "Limpiar Todo"
- Se le dio vida al botón de "Limpiar Todo" (`#btn-limpiar`).
- Al hacer clic, pide confirmación al usuario.
- Vacía por completo la lista de artículos, esconde y vacía ambas tablas, resetea a cero todas las tarjetas de totales y limpia todos los inputs del formulario.
- Resetea el almacenamiento de `localStorage` para reflejar una interfaz limpia, **pero preserva el `contadorId`** para no romper la secuencia de la base de datos futura.

---
*Fin de los cambios documentados hasta el momento.*
