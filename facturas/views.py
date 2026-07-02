import json
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
# pyrefly: ignore [missing-import]
from .models import Producto, Cliente, Factura, DetalleFactura

def crear_factura_view(request):
    if request.method == 'POST':
        try:
            # Parseamos el JSON que nos envía JavaScript
            datos = json.loads(request.body)
            
            # 1. Aquí recibiremos los metadatos de la factura
            numero_factura = datos.get('invoice_number')
            emisor_name = datos.get('emisor_name')
            cobrar_a = datos.get('cobrar_a')  # Nombre o ID del cliente
            fecha_emision = datos.get('date_issued')
            fecha_vencimiento = datos.get('due_date')
            condicion_pago = datos.get('payment_terms')
            
            # 2. Aquí recibiremos el array de productos agregados a la tabla
            articulos = datos.get('articulos', [])

            # --- Lógica de prueba para ver en la consola de Django ---
            print("=== DATOS RECIBIDOS DESDE EL HTML ===")
            print(f"Factura: {numero_factura} | Emisor: {emisor_name} | Cliente: {cobrar_a}")
            print(f"Artículos recibidos: {len(articulos)}")
            
            # Respondemos un JSON de éxito al navegador
            return JsonResponse({
                'status': 'success', 
                'message': '¡Factura recibida correctamente en el backend!',
                'redirect_url': '/facturas/nueva/' # Temporal, luego apuntará a la vista final
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    # Si es GET, cargamos la página con los catálogos como antes
    context = {
        'productos': Producto.objects.all(),
        'clientes': Cliente.objects.all()
    }
    return render(request, 'layout/partials/single_page.html', context)