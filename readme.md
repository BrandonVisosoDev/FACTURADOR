# 🧾 Facturador - Sistema de Gestión de Facturas

![Estado del Proyecto](https://img.shields.io/badge/Estado-Finalizado-success?style=for-the-badge)
![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-blue?style=for-the-badge)

**Facturador** es una aplicación web moderna diseñada para la gestión, cálculo y emisión de facturas. Este módulo permite a los usuarios agregar productos dinámicamente, calcular subtotales, aplicar impuestos y descuentos, y visualizar un resumen en tiempo real, manteniendo la persistencia de los datos para una experiencia de usuario fluida y segura.

---

## 🚀 Tecnologías Utilizadas

Este proyecto fue desarrollado utilizando un stack robusto y moderno, asegurando un rendimiento óptimo y un mantenimiento sencillo:

- **Backend:** Python, Django (Arquitectura de Plantillas y Vistas)
- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Almacenamiento Local:** Web Storage API (`localStorage`)
- **Base de Datos:** SQLite (Configuración por defecto de Django)

---

## 🛠️ Resolución de Problemas (Método STAR)

Durante el desarrollo de este proyecto, nos enfrentamos a diversos desafíos técnicos que fueron abordados de manera metodológica para garantizar la estabilidad de la aplicación.

### Caso de Estudio: Optimización de Arquitectura y Persistencia de Datos

**S (Situación):**
El módulo de facturación experimentaba errores críticos en la interfaz. El archivo JavaScript principal se cargaba y ejecutaba múltiples veces, causando colisiones en el DOM y bloqueando los botones interactivos. Además, cualquier recarga accidental del navegador provocaba la pérdida total de los productos ingresados y los datos del formulario, degradando severamente la experiencia del usuario.

**T (Tarea):**
El objetivo principal fue reestructurar el sistema de plantillas de Django para evitar la carga duplicada de scripts, optimizar la selección de elementos y diseñar un sistema de persistencia en el lado del cliente (Frontend) para resguardar la información temporal de la factura antes de ser procesada por el servidor.

**A (Acción):**
1. **Refactorización de Plantillas:** Se aislaron los "partials" (productos, resumen, formulario), eliminando la herencia redundante de plantillas para convertirlos en componentes puros inyectados en una única vista maestra (`single_page.html`). Esto eliminó la recursividad y múltiples cargas de cabeceras.
2. **Correcciones UI:** Se estandarizaron identificadores únicos (`ID`) para las tablas dinámicas y se sanearon extensiones de archivos estáticos corruptos.
3. **Persistencia Dinámica:** Se implementó una capa lógica con JavaScript moderno:
   - Captura de eventos en tiempo real para todos los campos del formulario.
   - Implementación de `localStorage` para guardar en memoria el estado de la lista de artículos, contadores y valores del formulario.
   - Algoritmo de autogeneración de resúmenes (cálculo de impuestos, subtotales y totales) al detectar datos almacenados tras una recarga de página.
   - Implementación de un botón "Limpiar Todo" seguro, que resetea la interfaz y la memoria local preservando la integridad secuencial de la base de datos futura.

**R (Resultado):**
Se logró una aplicación de facturación altamente reactiva y estable. La interfaz carga eficientemente sin conflictos de JavaScript. Los usuarios ahora pueden interactuar con el formulario, calcular totales dinámicamente y, en caso de recargar la página, recuperar automáticamente todo su progreso. Todo esto sin realizar peticiones innecesarias al servidor, optimizando drásticamente la velocidad y usabilidad del sistema.

---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE.md](LICENSE.md) para más detalles.
