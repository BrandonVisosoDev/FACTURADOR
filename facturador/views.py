
# Importamos render 
from django.shortcuts import render


# Aqui por ahorita solo regresamos la plantilla para ver como quedo

def index(request):
    
    return render(request, 'facturador1.html')
    