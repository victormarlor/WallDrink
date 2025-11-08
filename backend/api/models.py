from django.contrib.auth.models import AbstractUser, Group, Permission
from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone
# from .fields import EncryptedEmailField, hash_email

class CustomUser(AbstractUser):
    # email = EncryptedEmailField(unique=True)
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)

    ROLE_CHOICES = [
        ('buyer', 'Comprador'),
        ('seller', 'Vendedor'),
        ('admin', 'Administrador'),
    ]
    
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='buyer')

    def __str__(self):
        return f"{self.username} ({self.role})"

    groups = models.ManyToManyField(Group, related_name="customuser_groups", blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name="customuser_permissions", blank=True)

class Shop(models.Model):
    owner = models.OneToOneField(get_user_model(), on_delete=models.CASCADE)  # ✅ Un usuario solo puede tener una tienda
    name = models.CharField(max_length=100)
    address = models.TextField(blank=True, null=True)
    postal_code = models.CharField(max_length=10, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    province = models.CharField(max_length=50, blank=True, null=True)
    country = models.CharField(max_length=50, blank=True, null=True)
    reference = models.TextField(blank=True, null=True)
    images = models.JSONField(default=list, blank=True)
    filters = models.JSONField(default=list, blank=True)
    main_image_index = models.IntegerField(default=0)

    def __str__(self):
        return self.name


class ShopImage(models.Model):
    shop = models.ForeignKey(Shop, related_name="shop_images", on_delete=models.CASCADE)  # ✅ Cambia related_name
    image = models.ImageField(upload_to="shop_images/")

    def __str__(self):
        return f"Imagen de {self.shop.name}"
    

class Product(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    min_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    auto_fluctuation = models.BooleanField(default=False)
    filters = models.JSONField(default=list, blank=True)  # ✅ Guardar etiquetas como lista JSON
    fluctuation_rules = models.JSONField(default=list, blank=True)  # ✅ Guardar reglas de fluctuación como lista JSON
    image = models.ImageField(upload_to="product_images/", blank=True, null=True)  # ✅ Guardar imagen

    def __str__(self):
        return self.name

class Order(models.Model):
    STATUS_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('finalizado', 'Finalizado'),
        ('cancelado', 'Cancelado'),
    ]

    cliente = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='pedidos', null=True, blank=True)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='pedidos')
    created_at = models.DateTimeField(auto_now_add=True)
    status_updated_at = models.DateTimeField(null=True, blank=True)  # Campo general para cambios de estado
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendiente')
    verification_code = models.CharField(max_length=10, unique=True)
    order_number = models.PositiveIntegerField()

    def __str__(self):
        return f"Pedido #{self.order_number} - {self.shop.name} - {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"


class SellerRequestEmailRecipient(models.Model):
    email = models.EmailField(unique=True)
    active = models.BooleanField(default=True)  # ✅ Por si quieres activar/desactivar sin borrar

    def __str__(self):
        return self.email