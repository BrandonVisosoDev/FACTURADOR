from django.contrib import admin

# pyrefly: ignore [missing-import]
from .models import Cliente, Producto, Factura, DetalleFactura

# Configuración para ver los artículos dentro de la misma vista de la factura
class DetalleFacturaInline(admin.TabularInline):
    model = DetalleFactura
    extra = 1  # Te muestra un renglón vacío por defecto para agregar un artículo

@admin.register(Factura)
class FacturaAdmin(admin.ModelAdmin):
    list_display = ('numero_factura', 'cliente', 'fecha_emision', 'condicion_pago')
    search_fields = ('numero_factura', 'cliente__nombre')
    inlines = [DetalleFacturaInline]

# Registros simples para tus catálogos
admin.site.register(Cliente)
admin.site.register(Producto)
