from django.urls import path
# pyrefly: ignore [missing-import]
from . import views

app_name = 'facturas'

urlpatterns = [
    path('nueva/', views.crear_factura_view, name='crear_factura'),
    path('ver/<int:factura_id>/', views.ver_factura_view, name='ver_factura'),
]