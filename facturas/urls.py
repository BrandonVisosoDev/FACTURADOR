from django.urls import path
# pyrefly: ignore [missing-import]
from . import views

app_name = 'facturas'

urlpatterns = [
    # Esta única ruta cargará tu single_page.html
    path('nueva/', views.crear_factura_view, name='crear_factura'),
    
    # Ruta para ver la factura final generada
    path('ver/<int:factura_id>/', views.ver_factura_view, name='ver_factura'),
]