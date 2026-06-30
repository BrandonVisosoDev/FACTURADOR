
from django.contrib import admin
from django.urls import path
# pyrefly: ignore [missing-import]
from . import views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
    path('factura/', views.factura, name='factura'),
    path('resumen/', views.resumen, name='resumen'),
]
