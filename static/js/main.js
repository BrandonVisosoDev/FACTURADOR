
  // =====================================================================
// ARCHIVO: main.js
// CONTROLADOR PRINCIPAL DE LA INTERFAZ DE FACTURACIÓN
// =====================================================================

// Esta variable global es el "corazón" de nuestros datos. 
// Aquí guardaremos los productos temporalmente antes de mandarlos a la base de datos.
let listaArticulos = [];
let contadorId = 1;


// =====================================================================
// PERSISTENCIA: Funciones para guardar y cargar datos del localStorage
// Los datos se mantienen aunque se recargue la página.
// =====================================================================

function guardarEnStorage() {
    localStorage.setItem('facturador_articulos', JSON.stringify(listaArticulos));
    localStorage.setItem('facturador_contadorId', contadorId);
    guardarCamposFormulario();
}

function cargarDeStorage() {
    const articulosGuardados = localStorage.getItem('facturador_articulos');
    const contadorGuardado = localStorage.getItem('facturador_contadorId');

    if (articulosGuardados) {
        listaArticulos = JSON.parse(articulosGuardados);
    }
    if (contadorGuardado) {
        contadorId = parseInt(contadorGuardado);
    }

    restaurarCamposFormulario();
}

// Guarda todos los campos de los formularios (factura y resumen)
function guardarCamposFormulario() {
    const campos = {};
    const ids = ['emisor_name', 'cobrar_a', 'enviar_a', 'invoice_number',
                 'date_issued', 'due_date', 'payment_terms',
                 'impuesto_cobrar', 'descuento_realizar'];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) campos[id] = el.value;
    });

    localStorage.setItem('facturador_campos', JSON.stringify(campos));
}

// Restaura los valores de los campos desde localStorage
function restaurarCamposFormulario() {
    const camposGuardados = localStorage.getItem('facturador_campos');
    if (!camposGuardados) return;

    const campos = JSON.parse(camposGuardados);
    Object.keys(campos).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = campos[id];
    });
}


// =====================================================================
// BLOQUE 1: LÓGICA DE LA TABLA DE PRODUCTOS (INTERFAZ VISUAL)
// Este bloque se encarga de leer lo que escribes, hacer las matemáticas
// y dibujar o esconder la tabla dinámicamente.
// =====================================================================

// Seleccionamos los elementos del HTML que vamos a manipular
const btnAgregar = document.getElementById('agregar_producto');
const tablaProductos = document.getElementById('tabla_productos');
const tbodyProductos = document.getElementById('productos_body');

// Cargamos datos guardados del localStorage (si existen) y redibujamos la tabla
cargarDeStorage();
renderizarTabla();

// Escuchamos cambios en los campos del formulario para guardarlos automáticamente
['emisor_name', 'cobrar_a', 'enviar_a', 'invoice_number',
 'date_issued', 'due_date', 'payment_terms',
 'impuesto_cobrar', 'descuento_realizar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', guardarCamposFormulario);
});

// 1.1 - Evento: ¿Qué pasa cuando le damos clic a "Agregar Producto"?
btnAgregar.addEventListener('click', function() {
    
    // Capturamos los valores que el usuario escribió en los inputs
    const nombre = document.getElementById('producto_name').value;
    const cantidad = parseFloat(document.getElementById('producto_cantidad').value);
    const precio = parseFloat(document.getElementById('producto_precio').value);
    const impuesto = parseFloat(document.getElementById('producto_impuesto').value) || 0;

    // Validación: Evitamos que agreguen filas vacías o con letras en vez de números
    if (!nombre || isNaN(cantidad) || isNaN(precio)) {
        alert("Por favor, llena al menos el nombre, cantidad y precio unitario.");
        return;
    }

    // Matemáticas: Calculamos el subtotal de este renglón
    const subtotalBase = cantidad * precio;
    const valorImpuesto = subtotalBase * (impuesto / 100);
    const subtotalFinal = subtotalBase + valorImpuesto;

    // Guardamos este nuevo producto en nuestra memoria (el Array global)
    listaArticulos.push({
        id: contadorId++, // Le asignamos su ID y le sumamos 1 para el siguiente
        nombre: nombre,
        cantidad: cantidad,
        precio: precio,
        impuesto: impuesto,
        subtotal: subtotalFinal
    });

    // Limpiamos los inputs del formulario para que queden listos para otro producto
    document.getElementById('producto_name').value = '';
    document.getElementById('producto_cantidad').value = '1';
    document.getElementById('producto_precio').value = '';
    document.getElementById('producto_impuesto').value = '0.00';

    // Llamamos a la función que redibuja la tabla con los datos actualizados
    renderizarTabla();

    // Guardamos en localStorage para que los datos sobrevivan recargas
    guardarEnStorage();
});

// 1.2 - Función: Dibuja las filas de la tabla en el HTML
function renderizarTabla() {
    // Vaciamos la tabla actual para no duplicar datos
    tbodyProductos.innerHTML = '';

    // Lógica de visualización: Si no hay productos, escondemos toda la tabla
    if (listaArticulos.length === 0) {
        tablaProductos.style.display = 'none';
        return;
    }

    // Si sí hay productos, nos aseguramos de que la tabla sea visible
    tablaProductos.style.display = 'table';

    // Recorremos nuestra memoria de artículos y creamos un <tr> por cada uno
    listaArticulos.forEach((articulo, index) => {
        const fila = document.createElement('tr');
        
        // Armamos el HTML interno de la fila (el toFixed(2) fuerza a que tenga 2 decimales)
        fila.innerHTML = `
            <td>${articulo.id}</td>
            <td>${articulo.nombre}</td>
            <td>${articulo.cantidad}</td>
            <td>$${articulo.precio.toFixed(2)}</td>
            <td>${articulo.impuesto.toFixed(2)}%</td>
            <td>$${articulo.subtotal.toFixed(2)}</td>
            <td><button type="button" class="remove-item" onclick="eliminarFila(${index})">Eliminar</button></td>
        `;
        
        // Inyectamos la fila dentro del <tbody>
        tbodyProductos.appendChild(fila);
    });
}

// 1.3 - Función: Borra un producto específico de la memoria y la tabla
function eliminarFila(index) {
    // .splice elimina 1 elemento de nuestro Array 'listaArticulos' basándose en su posición (index)
    listaArticulos.splice(index, 1);
    
    // Como la memoria cambió, volvemos a dibujar la tabla
    // (Si eliminamos el último, la función automáticamente esconderá la tabla)
    renderizarTabla();

    // Actualizamos el localStorage
    guardarEnStorage();
}

// =====================================================================
// BLOQUE 2: LÓGICA DEL RESUMEN (TABLA + TARJETAS DE TOTALES)
// Al dar clic en "Mostrar Resumen", leemos los productos de listaArticulos,
// aplicamos el impuesto global y el descuento del formulario de resumen,
// y llenamos la tabla y las tarjetas con los cálculos.
// =====================================================================

const btnMostrarResumen = document.getElementById('btn-mostrar-resumen');
const resumenTabla = document.getElementById('resumen-tabla');
const resumenBody = document.getElementById('resumen-body');

function generarResumen() {
    // 2.1 - Validación: ¿Hay productos agregados?
    if (listaArticulos.length === 0) {
        alert("Primero agrega al menos un producto a la tabla.");
        return;
    }

    // 2.2 - Leemos el impuesto global y el descuento del formulario de resumen
    const impuestoGlobal = parseFloat(document.getElementById('impuesto_cobrar').value) || 0;
    const descuento = parseFloat(document.getElementById('descuento_realizar').value) || 0;

    // 2.3 - Vaciamos la tabla del resumen y la hacemos visible
    resumenBody.innerHTML = '';
    resumenTabla.style.display = 'table';

    // 2.4 - Recorremos los productos y llenamos la tabla
    let subtotal = 0;

    listaArticulos.forEach((articulo) => {
        const monto = articulo.cantidad * articulo.precio; // Sin impuesto del producto
        subtotal += monto;

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${articulo.id}</td>
            <td>${articulo.cantidad}</td>
            <td>$${articulo.precio.toFixed(2)}</td>
            <td>$${monto.toFixed(2)}</td>
        `;
        resumenBody.appendChild(fila);
    });

    // 2.5 - Cálculos finales con el impuesto GLOBAL (no el del producto)
    const totalImpuestos = subtotal * (impuestoGlobal / 100);
    const total = subtotal + totalImpuestos - descuento;

    // 2.6 - Actualizamos las tarjetas visuales
    document.getElementById('total-sub').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('total-imp').textContent = `$${totalImpuestos.toFixed(2)}`;
    document.getElementById('total-amount').textContent = `$${total.toFixed(2)}`;

    // 2.7 - Persistencia: Marcamos que el resumen está visible
    localStorage.setItem('facturador_resumen_visible', 'true');
}

btnMostrarResumen.addEventListener('click', generarResumen);

// Si el resumen estaba visible antes de recargar la página y hay artículos, lo volvemos a generar
if (localStorage.getItem('facturador_resumen_visible') === 'true' && listaArticulos.length > 0) {
    generarResumen();
}


// =====================================================================
// BLOQUE 3: BOTÓN "LIMPIAR TODO"
// Resetea toda la plantilla (formularios, tablas, tarjetas) pero NO
// reinicia el contadorId, ya que los IDs se guardarán en la BD.
// =====================================================================

const btnLimpiar = document.getElementById('btn-limpiar');

btnLimpiar.addEventListener('click', function() {

    // Confirmamos con el usuario antes de borrar todo
    if (!confirm('¿Estás seguro de que deseas limpiar toda la factura?')) return;

    // Vaciamos la lista de artículos (pero NO el contadorId)
    listaArticulos = [];

    // Limpiamos los campos del formulario de factura
    ['emisor_name', 'cobrar_a', 'enviar_a', 'invoice_number',
     'date_issued', 'due_date', 'payment_terms'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    // Reseteamos los campos del formulario de resumen a sus valores por defecto
    document.getElementById('impuesto_cobrar').value = '0.00';
    document.getElementById('descuento_realizar').value = '0.00';

    // Limpiamos los campos de producto
    document.getElementById('producto_name').value = '';
    document.getElementById('producto_cantidad').value = '1';
    document.getElementById('producto_precio').value = '';
    document.getElementById('producto_impuesto').value = '0.00';

    // Redibujamos la tabla de productos (quedará vacía y se esconderá)
    renderizarTabla();

    // Limpiamos la tabla del resumen
    resumenBody.innerHTML = '';
    resumenTabla.style.display = 'none';

    // Reseteamos las tarjetas de totales
    document.getElementById('total-sub').textContent = '0.00';
    document.getElementById('total-imp').textContent = '0.00';
    document.getElementById('total-amount').textContent = '0.00';

    // Persistencia: Marcamos que el resumen ya no está visible
    localStorage.setItem('facturador_resumen_visible', 'false');

    // Guardamos el estado limpio en localStorage (preservando contadorId)
    guardarEnStorage();
});


// =====================================================================
// BLOQUE 3: ENVÍO DE DATOS A LA BASE DE DATOS (POST A DJANGO)
// Este bloque empaqueta toda la pantalla en formato JSON y lo envía.
// =====================================================================

async function enviarFactura() {
    // 2.1 - Recolectamos la metadata (los datos del emisor, cliente, fechas)
    const data = {
        emisor_name: document.getElementById('emisor_name')?.value,
        cobrar_a: document.getElementById('cobrar_a')?.value,
        invoice_number: document.getElementById('invoice_number')?.value,
        date_issued: document.getElementById('date_issued')?.value,
        due_date: document.getElementById('due_date')?.value,
        payment_terms: document.getElementById('payment_terms')?.value,
        impuesto_global: document.getElementById('impuesto_cobrar')?.value,
        descuento_global: document.getElementById('descuento_realizar')?.value,
        articulos: listaArticulos
    };

    // 2.2 - Seguridad: Django exige este token para evitar ataques (Cross-Site Request Forgery)
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    try {
        // 2.3 - Usamos la API 'fetch' para enviar todo a la URL de Django por detrás
        // Nota: Asegúrate de que Django esté inyectando bien la URL en el archivo que llama a la función, 
        // o reemplazaremos esta ruta por "/facturas/nueva/" si te da problemas el template tag.
        const response = await fetch("/facturas/nueva/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify(data) // Convertimos nuestro objeto Javascript a texto JSON
        });

        const result = await response.json();
        
        // 2.4 - Evaluamos la respuesta de Django
        if (result.status === 'success') {
            alert(result.message);
            console.log("Éxito:", result);
            // Aquí en un futuro agregaremos: window.location.href = result.redirect_url;
            window.location.href = '/facturas/ver/' + result.factura_id + '/';
        } else {
            alert("Error al guardar: " + result.message);
        }
    } catch (error) {
        console.error("Hubo un error de red al intentar enviar:", error);
    }
}

// Vinculamos el botón de Generar Factura
const btnGenerar = document.getElementById('btn-generar');
if (btnGenerar) {
    btnGenerar.addEventListener('click', enviarFactura);
}

// Vinculamos el botón de Imprimir
const btnImprimir = document.getElementById('btn-imprimir');
if (btnImprimir) {
    btnImprimir.addEventListener('click', function() {
        if (listaArticulos.length === 0) {
            alert("Agrega al menos un producto antes de imprimir.");
            return;
        }

        const data = {
            emisor_name: document.getElementById('emisor_name')?.value,
            cobrar_a: document.getElementById('cobrar_a')?.value,
            invoice_number: document.getElementById('invoice_number')?.value,
            date_issued: document.getElementById('date_issued')?.value,
            due_date: document.getElementById('due_date')?.value,
            payment_terms: document.getElementById('payment_terms')?.value,
            impuesto_global: document.getElementById('impuesto_cobrar')?.value,
            descuento_global: document.getElementById('descuento_realizar')?.value,
            articulos: listaArticulos
        };

        // Creamos un formulario dinámico para hacer un POST a una nueva pestaña
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/facturas/imprimir_preview/';
        form.target = '_blank';

        // Agregamos el token CSRF
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrfmiddlewaretoken';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        // Agregamos los datos en JSON
        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'factura_data';
        dataInput.value = JSON.stringify(data);
        form.appendChild(dataInput);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    });
}