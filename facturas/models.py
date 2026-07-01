from django.db import models

from django.db import models

# ==========================================
# 1. CATÁLOGOS (Para autocompletar después)
# ==========================================

class Cliente(models.Model):
    nombre = models.CharField(max_length=150, verbose_name="Nombre / Razón Social")
    email = models.EmailField(blank=True, null=True, verbose_name="Correo Electrónico")
    direccion = models.CharField(max_length=255, blank=True, null=True, verbose_name="Dirección de Envío")
    creado_el = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    nombre = models.CharField(max_length=255, verbose_name="Nombre del Artículo")
    precio_base = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Precio Unitario Base")
    impuesto_porcentaje = models.DecimalField(max_digits=5, decimal_places=2, default=16.00, verbose_name="Impuesto %")
    
    def __str__(self):
        return f"{self.nombre} - ${self.precio_base}"


# ==========================================
# 2. TRANSACCIONES (La factura)
# ==========================================

class Factura(models.Model):
    numero_factura = models.CharField(max_length=20, unique=True, verbose_name="Número de Factura")
    emisor_name = models.CharField(max_length=150, verbose_name="Emisor") # Si manejas varias razones sociales
    
    # Relación: Una factura pertenece a UN cliente
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='facturas')
    
    fecha_emision = models.DateField(verbose_name="Fecha de Emisión")
    fecha_vencimiento = models.DateField(blank=True, null=True, verbose_name="Fecha de Vencimiento")
    condicion_pago = models.CharField(max_length=100, blank=True, null=True, verbose_name="Condición de Pago")
    
    terminos_condiciones = models.TextField(default="El pago debe realizarse dentro de los 15 días...")
    descuento_global = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="Descuento ($)")
    
    creado_el = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Factura {self.numero_factura} - {self.cliente.nombre}"


class DetalleFactura(models.Model):
    # Relación: Este renglón pertenece a UNA factura
    factura = models.ForeignKey(Factura, on_delete=models.CASCADE, related_name='detalles')
    
    # Relación: Este renglón es de UN producto
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    
    cantidad = models.PositiveIntegerField(default=1)
    
    # ¡SÚPER IMPORTANTE! Congelar el precio. 
    # Si mañana subes el precio del producto en el catálogo, tus facturas viejas no deben alterarse.
    precio_unitario_historico = models.DecimalField(max_digits=12, decimal_places=2)
    impuesto_historico = models.DecimalField(max_digits=5, decimal_places=2)

    @property # property indica que es una propiedad, no un campo de la base de datos
    def subtotal(self):
        return self.cantidad * self.precio_unitario_historico

    def __str__(self):
        return f"{self.cantidad}x {self.producto.nombre} en Factura {self.factura.numero_factura}"