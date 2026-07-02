import json
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
# pyrefly: ignore [missing-import]
from .models import Producto, Cliente, Factura, DetalleFactura

# 1. Primera función (Para cargar la pantalla single_page y recibir datos por JS)
def crear_factura_view(request):
    if request.method == 'POST':
        try:
            datos = json.loads(request.body)
            # (Aquí procesaremos el guardado en el siguiente bloque)
            return JsonResponse({
                'status': 'success', 
                'message': '¡Factura recibida correctamente!'
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    # Si es GET, cargamos la vista maestra
    context = {
        'productos': Producto.objects.all(),
        'clientes': Cliente.objects.all()
    }
    return render(request, 'single_page.html', context)


# 2. SEGUNDA FUNCIÓN (¡Esta es la que te está faltando en el archivo!)
def ver_factura_view(request, factura_id):
    # Busca la factura por ID, si no existe lanza un error 404
    factura = get_object_or_404(Factura, id=factura_id)
    
    context = {
        'factura': factura
    }
    return render(request, 'layout/partials/factura.html', context)