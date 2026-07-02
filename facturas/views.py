import json
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
# pyrefly: ignore [missing-import]
from .models import Producto, Cliente, Factura, DetalleFactura

from datetime import datetime

# 1. Primera función (Para cargar la pantalla single_page y recibir datos por JS)
def crear_factura_view(request):
    if request.method == 'POST':
        try:
            datos = json.loads(request.body)
            
            # 1. Manejo del Cliente
            cliente_nombre = datos.get('cobrar_a', '').strip()
            if not cliente_nombre:
                cliente_nombre = 'Cliente Mostrador'
            cliente, _ = Cliente.objects.get_or_create(nombre=cliente_nombre)
            
            # 2. Fechas
            fecha_emision = datos.get('date_issued')
            if not fecha_emision:
                fecha_emision = datetime.now().date()
            
            fecha_venc = datos.get('due_date')
            if not fecha_venc:
                fecha_venc = None
                
            # 3. Crear la Factura Principal
            factura = Factura.objects.create(
                numero_factura=datos.get('invoice_number', f"F-{datetime.now().strftime('%Y%m%d%H%M%S')}"),
                emisor_name=datos.get('emisor_name', 'EDELYX'),
                cliente=cliente,
                fecha_emision=fecha_emision,
                fecha_vencimiento=fecha_venc,
                condicion_pago=datos.get('payment_terms', ''),
                porcentaje_impuesto=datos.get('impuesto_global', 0.0),
                descuento_global=datos.get('descuento_global', 0.0)
            )
            
            # 4. Crear los Detalles (Artículos)
            articulos = datos.get('articulos', [])
            for art in articulos:
                nombre_prod = art.get('nombre', 'Producto Desconocido').strip()
                precio = float(art.get('precio', 0.0))
                impuesto = float(art.get('impuesto', 0.0))
                cantidad = int(art.get('cantidad', 1))
                
                # Buscamos o creamos el producto en el catálogo
                producto, _ = Producto.objects.get_or_create(
                    nombre=nombre_prod,
                    defaults={
                        'precio_base': precio,
                        'impuesto_porcentaje': impuesto
                    }
                )
                
                # Congelamos el precio en la factura
                DetalleFactura.objects.create(
                    factura=factura,
                    producto=producto,
                    cantidad=cantidad,
                    precio_unitario_historico=precio,
                    impuesto_historico=impuesto
                )

            return JsonResponse({
                'status': 'success', 
                'message': '¡Factura generada y guardada correctamente!',
                'factura_id': factura.id
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    # Si es GET, cargamos la vista maestra
    context = {
        'productos': Producto.objects.all(),
        'clientes': Cliente.objects.all()
    }
    return render(request, 'single_page.html', context)


# 2. SEGUNDA FUNCIÓN (Ver factura guardada)
def ver_factura_view(request, factura_id):
    # Busca la factura por ID, si no existe lanza un error 404
    factura = get_object_or_404(Factura, id=factura_id)
    
    context = {
        'factura': factura
    }
    return render(request, 'layout/partials/factura.html', context)


# 3. TERCERA FUNCIÓN (Previsualización e impresión de factura sin guardarla)
def imprimir_preview_view(request):
    if request.method == 'POST':
        try:
            datos_str = request.POST.get('factura_data', '{}')
            datos = json.loads(datos_str)
            
            # Simulamos el objeto factura
            class MockDetalle:
                def __init__(self, prod_name, cant, precio, sub):
                    self.producto = type('Prod', (), {'nombre': prod_name})()
                    self.cantidad = cant
                    self.precio_unitario = precio
                    self.subtotal = sub

            articulos = datos.get('articulos', [])
            detalles_mock = []
            subtotal_total = 0
            
            for art in articulos:
                cant = int(art.get('cantidad', 1))
                precio = float(art.get('precio', 0.0))
                sub = cant * precio
                subtotal_total += sub
                detalles_mock.append(MockDetalle(
                    art.get('nombre', 'Producto'), cant, precio, sub
                ))
            
            porcentaje_impuesto = float(datos.get('impuesto_global', 0.0))
            descuento = float(datos.get('descuento_global', 0.0))
            total_impuestos = subtotal_total * (porcentaje_impuesto / 100)
            
            class MockQuerySet:
                def __init__(self, items):
                    self.items = items
                def all(self): return self.items
                def count(self): return len(self.items)

            fecha_emision = datos.get('date_issued')
            if not fecha_emision:
                fecha_emision = datetime.now().date()
            else:
                fecha_emision = datetime.strptime(fecha_emision, '%Y-%m-%d').date()

            factura_mock = {
                'numero_factura': datos.get('invoice_number', 'PREVIEW'),
                'fecha_emision': fecha_emision,
                'condicion_pago': datos.get('payment_terms', ''),
                'cliente': type('Cli', (), {'nombre': datos.get('cobrar_a', 'Cliente')})(),
                'detallefactura_set': MockQuerySet(detalles_mock),
                'porcentaje_impuesto': porcentaje_impuesto,
                'descuento': descuento,
                'subtotal': subtotal_total,
                'total_impuestos': total_impuestos,
                'total': subtotal_total + total_impuestos - descuento
            }
            
            context = {
                'factura': factura_mock,
                'es_impresion': True
            }
            return render(request, 'layout/partials/factura.html', context)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)