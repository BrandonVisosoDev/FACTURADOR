
# Importamos render 
from django.shortcuts import render


# Ahora si renderizamos la principal

def index(request):
    return render(request, 'single_page.html')

# Renderizamos el diseño de factura para ver si quedo bien

def factura(request):
    return render(request, 'layout/partials/factura.html')    
    