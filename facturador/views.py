
# Importamos render 
from django.shortcuts import render


# Aqui por ahorita solo regresamos la plantilla 1 para ver como quedo

def index(request):
    
    return render(request, 'facturador1.html')

 # Por el momento trabajaremos por vistas separadas

 # Renderizamos la plantilla 2

def factura(request):
    
    return render(request, 'facturador2.html')
    