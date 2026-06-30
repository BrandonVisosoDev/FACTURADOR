
# Importamos render 
from django.shortcuts import render


# Ahora si renderizamos la principal

def index(request):
    return render(request, 'single_page.html')
    