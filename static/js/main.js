
  // =====================================================================
// ARCHIVO: main.js
// CONTROLADOR PRINCIPAL DE LA INTERFAZ DE FACTURACIÓN
// =====================================================================

// Esta variable global es el "corazón" de nuestros datos. 
// Aquí guardaremos los productos temporalmente antes de mandarlos a la base de datos.
let listaArticulos = [];
let contadorId = 1;


// =====================================================================
// BLOQUE 1: LÓGICA DE LA TABLA DE PRODUCTOS (INTERFAZ VISUAL)
// Este bloque se encarga de leer lo que escribes, hacer las matemáticas
// y dibujar o esconder la tabla dinámicamente.
// =====================================================================

// Seleccionamos los elementos del HTML que vamos a manipular
const btnAgregar = document.getElementById('agregar_producto');
const tablaProductos = document.getElementById('tabla_productos');
const tbodyProductos = document.getElementById('productos_body');

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
}


// =====================================================================
// BLOQUE 2: ENVÍO DE DATOS A LA BASE DE DATOS (POST A DJANGO)
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
        
        // ¡Magia aquí! Le pasamos directamente la variable global que tiene la lista de la tabla
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
        } else {
            alert("Error al guardar: " + result.message);
        }
    } catch (error) {
        console.error("Hubo un error de red al intentar enviar:", error);
    }
}