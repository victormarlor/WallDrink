from rest_framework import serializers
from .models import Shop, ShopImage, Product, Order, OrderItem
from decimal import Decimal
from django.contrib.auth import get_user_model
import random
import string

# 🖼️ Imágenes de la tienda
class ShopImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopImage
        fields = ['id', 'image']

# 🏪 Tienda completa (para vistas internas y detalle)
class ShopSerializer(serializers.ModelSerializer):
    images = ShopImageSerializer(many=True, source='shop_images', read_only=True)
    owner = serializers.ReadOnlyField(source='owner.id')  # ✅ Añadido

    class Meta:
        model = Shop
        fields = [
            'id', 'name', 'address', 'postal_code', 'city', 'province', 'country',
            'reference', 'owner', 'images', 'filters', 'main_image_index'
        ]

    def update(self, instance, validated_data):
        request = self.context.get("request")
        images_data = request.FILES.getlist("images[]") if request else []

        if images_data:
            ShopImage.objects.filter(shop=instance).delete()
            for image_data in images_data:
                ShopImage.objects.create(shop=instance, image=image_data)

        filters_data = request.data.getlist("filters[]", None)
        if filters_data is not None:
            instance.filters = filters_data

        instance.reference = validated_data.get("reference", "")
        if 'main_image_index' in validated_data:
            instance.main_image_index = validated_data['main_image_index']

        instance.save()
        return instance

# 🏪 Tienda reducida para anidar en productos públicos
class ShopBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = ['id', 'name', 'address', 'city', 'province']

class ProductSerializer(serializers.ModelSerializer):
    shop = ShopBasicSerializer(read_only=True)
    shop_id = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(),
        write_only=True,
        required=False
    )
    filters = serializers.JSONField()
    fluctuation_rules = serializers.JSONField()

    class Meta:
        model = Product
        fields = "__all__"

    def create(self, validated_data):
        print("📥 Datos que llegan al serializer (create):", validated_data)

        shop = validated_data.pop("shop_id", None)
        if shop:
            print("✅ Asignando tienda:", shop)
            validated_data["shop"] = shop
        else:
            print("⚠️ No se recibió shop_id")

        return super().create(validated_data)

    def validate_filters(self, value):
        print("🧪 validate_filters() recibió:", value)
        if len(value) > 5:
            print("❌ Demasiados filtros")
            raise serializers.ValidationError("No se pueden agregar más de 5 etiquetas.")
        return value

    def validate(self, data):
        print("🧪 validate() recibido:", data)

        required_fields = ["name", "description", "price", "stock"]
        for field in required_fields:
            if not data.get(field):
                print(f"❌ Campo faltante: {field}")
                raise serializers.ValidationError({field: "Este campo es obligatorio."})

        request = self.context.get("request")
        if request and request.method == "POST":
            print("📦 request.FILES:", request.FILES)
            if "image" not in request.FILES:
                print("❌ No hay imagen en el request")
                raise serializers.ValidationError({"image": "Debe subir una imagen del producto."})

        return data

# ✅ Solo lectura (para GET de pedidos)
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['product', 'quantity', 'unit_price']

# ✅ Solo escritura (para POST de pedidos)
class OrderItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity', 'unit_price']

# 🧾 Crear pedido
class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemWriteSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'cliente', 'shop', 'status', 'verification_code', 'created_at', 'items']
        read_only_fields = ['status', 'verification_code', 'created_at', 'order_number']

    def validate_cliente(self, value):
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = validated_data.get('cliente', None)
        shop = validated_data['shop']

        last_order = Order.objects.filter(shop=shop).order_by('order_number').last()
        next_order_number = last_order.order_number + 1 if last_order else 1
        verification_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

        order = Order.objects.create(
            cliente=user,
            shop=shop,
            verification_code=verification_code,
            order_number=next_order_number
        )

        for item in items_data:
            OrderItem.objects.create(
                order=order,
                product=item['product'],
                quantity=item['quantity'],
                unit_price=Decimal(item['unit_price'])
            )

        return order

# 🧾 Leer pedido
User = get_user_model()

class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]

class OrderReadSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    shop = ShopSerializer(read_only=True)
    cliente = SimpleUserSerializer(read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'cliente', 'shop', 'status',
            'verification_code', 'created_at', 'status_updated_at',
            'items', 'total_price'
        ]

    def get_total_price(self, obj):
        return sum(item.unit_price * item.quantity for item in obj.items.all())
