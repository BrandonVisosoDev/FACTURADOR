
  async function enviarFactura() {
    // 1. Recolectamos datos de invoice_form.html
    const data = {
      emisor_name: document.getElementById('emisor_name')?.value,
      cobrar_a: document.getElementById('cobrar_a')?.value,
      invoice_number: document.getElementById('invoice_number')?.value,
      date_issued: document.getElementById('date_issued')?.value,
      due_date: document.getElementById('due_date')?.value,
      payment_terms: document.getElementById('payment_terms')?.value,
      
      // 2. Simulamos un array de artículos por ahora (luego se leerá de la tabla dinámica)
      articulos: [
        { producto_id: 1, cantidad: 2 },
        { producto_id: 2, cantidad: 1 }
      ]
    };

    // Obtener el token CSRF que Django exige por seguridad
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // 3. Enviamos los datos usando Fetch API
    const response = await fetch("{% url 'facturas:crear_factura' %}", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (result.status === 'success') {
      alert(result.message);
      console.log("Datos confirmados por el backend:", result);
    } else {
      alert("Error: " + result.message);
    }
  }
