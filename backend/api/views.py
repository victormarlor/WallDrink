from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import viewsets, permissions, serializers, status
from django.contrib.auth import get_user_model
from django.core.mail import send_mail, EmailMultiAlternatives
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator, PasswordResetTokenGenerator
from django.conf import settings
from urllib.parse import quote, unquote
from rest_framework.generics import RetrieveAPIView
from .models import Shop, Product, Order
from .serializers import ShopSerializer, ProductSerializer, OrderReadSerializer
from .serializers import OrderCreateSerializer as OrderCreateSerializerClass
from .serializers import OrderReadSerializer
import logging
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
import json
from django.utils import timezone

# backend/api/views.py
@api_view(['POST'])
def register(request):
    from django.contrib.auth import get_user_model
    from django.core.validators import validate_email
    from django.core.exceptions import ValidationError

    User = get_user_model()
    print("📥 Datos recibidos en /register:", request.data)

    try:
        username = request.data.get("username", "").strip()
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "")

        # Verifica campos obligatorios
        if not username or not email or not password:
            return Response({"error": "Todos los campos son obligatorios."}, status=400)

        # Valida formato de email
        try:
            validate_email(email)
        except ValidationError:
            return Response({"error": "Correo electrónico no válido."}, status=400)

        # Verifica longitud mínima de contraseña
        if len(password) < 8:
            return Response({"error": "La contraseña debe tener al menos 8 caracteres."}, status=400)

        # Verifica unicidad de username y email
        if User.objects.filter(username=username).exists():
            return Response({"error": "El nombre de usuario ya está en uso."}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({"error": "El correo electrónico ya está registrado."}, status=400)

        # Crear usuario inactivo
        user = User.objects.create_user(username=username, email=email, password=password)
        user.is_active = False
        user.role = 'buyer'
        user.save()

        # Enviar correo de activación
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        activation_link = f"http://localhost:5173/activate/{uid}/{quote(token)}"

        send_mail(
            "Activa tu cuenta",
            f"Hola {username}, haz clic en el siguiente enlace para activar tu cuenta: {activation_link}",
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )

        return Response({"message": "Usuario registrado. Revisa tu correo para activar la cuenta."})

    except Exception as e:
        import traceback
        print("💥 ERROR en register():", e)
        traceback.print_exc()
        return Response({"error": "Error interno al registrar usuario."}, status=500)


    except Exception as e:
        import traceback
        print("💥 ERROR en register():", e)
        traceback.print_exc()
        return Response({"error": "Error interno al registrar usuario"}, status=500)


    except Exception as e:
        import traceback
        print("💥 ERROR en register():", e)
        traceback.print_exc()
        return Response({"error": "Error interno al registrar usuario"}, status=500)



@api_view(['GET'])
def activate_account(request, uidb64, token):
    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)

        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({"message": "Cuenta activada correctamente"})
        else:
            return Response({"error": "Token inválido o expirado"}, status=400)

    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({"error": "Token inválido"}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_authentication(request):
    """Verifica si el usuario está autenticado correctamente."""
    user = request.user
    print("Usuario autenticado en check_authentication:", user)
    return Response({
        "message": f"Usuario autenticado: {user.username}"
        })
def user_profile(request):
    """Devuelve los datos del usuario autenticado."""
    user = request.user
    return Response({
        "id": user.id,
        "email": user.email,
        "username": user.username,
    })


@api_view(["POST"])
def resend_activation_email(request):
    """Reenvía el correo de activación si el usuario aún no ha activado su cuenta."""
    from django.contrib.auth import get_user_model
    User = get_user_model()

    email = request.data.get("email")

    if not email:
        return Response({"error": "El email es obligatorio"}, status=400)

    try:
        user = User.objects.get(email=email)

        if user.is_active:
            return Response({"error": "Esta cuenta ya está activada. Intenta iniciar sesión."}, status=400)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        activation_link = f"http://localhost:5173/activate/{uid}/{quote(token)}"

        send_mail(
            "Reenvío de activación de cuenta",
            f"Hola {user.username}, aquí tienes un nuevo enlace para activar tu cuenta: {activation_link}",
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )

        return Response({"message": "Correo de activación reenviado. Revisa tu bandeja de entrada."})

    except User.DoesNotExist:
        return Response({"error": "No hay ninguna cuenta asociada a este email"}, status=400)


@api_view(["POST"])
def request_password_reset(request):
    email = request.data.get("email")

    if not email:
        return Response({"error": "Se requiere un correo electrónico."}, status=400)

    try:
        user = User.objects.get(email=email)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"http://localhost:3000/reset-password/{uid}/{token}/"

        send_mail(
            subject="Restablecer contraseña",
            message=f"Para restablecer tu contraseña, haz clic en el siguiente enlace: {reset_link}",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({"message": "Correo de restablecimiento enviado correctamente."})

    except User.DoesNotExist:
        return Response({"message": "Correo de restablecimiento enviado correctamente."})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": "Error interno al enviar el correo."}, status=500)


@api_view(["POST"])
def reset_password(request, uidb64, token):
    """Permite a un usuario restablecer su contraseña con un nuevo password."""
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Token inválido o expirado"}, status=400)

        new_password = request.data.get("password")
        if not new_password:
            return Response({"error": "Debes ingresar una nueva contraseña"}, status=400)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Tu contraseña ha sido restablecida correctamente"})
    
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({"error": "Token inválido"}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Devuelve los datos del usuario autenticado, incluido su rol."""
    try:
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "role": user.role  # Acceso directo al campo role
        })
    except Exception as e:
        print(f"Error al obtener el perfil del usuario: {e}")
        return Response({"error": "No se pudo obtener el perfil del usuario"}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_seller_role(request):
    """Permite que un usuario solicite convertirse en vendedor."""
    user = request.user

    if user.role == 'seller':
        return Response({"message": "Ya eres un vendedor."}, status=400)

    # Aquí podrías añadir lógica para la verificación, como documentos o pago de suscripción
    user.role = 'seller'
    user.save()

    return Response({"message": "Solicitud para convertirse en vendedor enviada correctamente."})

# backend/api/views.py
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_seller_role(request):
    """Convierte automáticamente al usuario en vendedor sin intervención manual."""
    user = request.user

    if user.role == 'seller':
        return Response({"message": "Ya eres un vendedor."}, status=400)

    # Asigna automáticamente el rol de "vendedor"
    user.role = 'seller'
    user.save()

    return Response({"message": "Ahora eres un vendedor. Puedes acceder a las herramientas de vendedor."})

# Gestión de Tiendas
class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated:
            raise serializers.ValidationError({"error": "Usuario no autenticado."})

        print(f"Creando tienda con owner: {user}")
        serializer.save(owner=user)

    def perform_update(self, serializer):
        user = self.request.user

        if not user.is_authenticated:
            raise serializers.ValidationError({"error": "Usuario no autenticado."})

        print("Actualizando tienda con owner:", user)

        # 🚀 IMPRIMIR TODO EL CONTENIDO DE LA SOLICITUD
        print("Contenido de request.FILES:", self.request.FILES)

        # Capturar imágenes
        images = self.request.FILES.getlist('images[]')

        if images:
            print("Imágenes recibidas en Django:", [img.name for img in images])
        else:
            print("⚠️ No se recibieron imágenes en la solicitud.")

        serializer.save(images=images)

    def get_object(self):
        obj = super().get_object()
        if obj.owner != self.request.user:
            raise PermissionDenied("No tienes permiso para acceder a esta tienda.")
        return obj

        
# Gestión de Productos
from rest_framework.response import Response
from rest_framework import status

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        print("🚀 Se ha llamado a create()")
        print("📩 Datos recibidos:", request.data)

        # 🧠 Asociar producto automáticamente a la tienda del usuario
        shop = Shop.objects.filter(owner=request.user).first()
        if not shop:
            return Response({"error": "Este usuario no tiene tienda asignada."}, status=status.HTTP_400_BAD_REQUEST)

        # Parsear filters
        filters = []
        if "filters" in request.data:
            try:
                filters = json.loads(request.data["filters"][0])
            except Exception as e:
                print("⚠️ Error al parsear filtros:", e)

        # Parsear fluctuation_rules
        fluctuation_rules = []
        if "fluctuation_rules" in request.data:
            try:
                fluctuation_rules = json.loads(request.data["fluctuation_rules"][0])
            except Exception as e:
                print("⚠️ Error al parsear reglas de fluctuación:", e)

        # Preparar datos limpios
        data = request.data.copy()
        data["filters"] = filters
        data["fluctuation_rules"] = fluctuation_rules
        data["shop"] = shop.id  # 💥 Aquí se asigna automáticamente la tienda
        data["auto_fluctuation"] = data.get("auto_fluctuation") in ["1", "true", "True", True]

        print("🔍 Datos antes de serializar:", data)

        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            print("❌ Error en serializer:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

logger = logging.getLogger(__name__)

class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Shop.objects.filter(owner=user)

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated:
            raise serializers.ValidationError({"error": "Usuario no autenticado."})

        print(f"Creando tienda con owner: {user}")  # Verificar autenticación
        serializer.save(owner=user)

        # Obtener el índice de la imagen principal desde la solicitud
        main_image_index = self.request.data.get("main_image_index")

        if main_image_index is not None:
            print(f"✅ Guardando índice de imagen principal: {main_image_index}")
            shop = serializer.save()
            shop.main_image_index = int(main_image_index) if main_image_index is not None else 0
            shop.save()
        else:
            serializer.save()



@login_required
def tienda_view(request):
    if request.user.role == 'comprador':
        # Si el usuario es comprador, redirigimos a la página de registro de vendedor
        return redirect('registro_vendedor')  # Asegúrate de tener esta ruta definida

    # Si el usuario es vendedor, puede acceder a la tienda
    return HttpResponse("Página de la tienda del vendedor.")

@login_required
def completar_registro_vendedor(request):
    if request.user.role == 'vendedor':
        return redirect('dashboard')  # Redirige si ya es vendedor.

    if request.method == 'POST':
        # Aquí agregarías la lógica para que el comprador complete el registro como vendedor
        # Cambiar el rol a vendedor
        request.user.role = 'vendedor'
        request.user.save()
        return redirect('dashboard')  # Redirige a la página principal del vendedor

    return render(request, 'registro_vendedor.html')  # Página de formulario de registro

def acceso_comprador_a_vendedor(request):
    if request.user.role == 'comprador':
        # Si el usuario es comprador, redirigimos a la página de registro de vendedor
        return redirect('registro_vendedor')
    return HttpResponse("Acceso permitido solo a vendedores.")

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # ✅ Permitir multipart/form-data para imágenes

    def get_queryset(self):
        user = self.request.user
        if user.role == 'seller':
            shop = Shop.objects.filter(owner=user).first()
            if shop:
                return Product.objects.filter(shop=shop)
            else:
                return Product.objects.none()
        return Product.objects.all()

    def create(self, request, *args, **kwargs):
        """Guarda un nuevo producto asociado a la tienda del usuario."""
        print("🚀 Se ha llamado a create()")
        print("📩 Datos recibidos en create():", request.data)

        user = request.user
        if not user.is_authenticated:
            return Response({"error": "No autenticado"}, status=401)

        shop = Shop.objects.filter(owner=user).first()
        if not shop:
            return Response({"error": "El usuario no tiene una tienda registrada"}, status=400)

        data = request.data.copy()

        data["auto_fluctuation"] = str(request.data.get("autoFluctuation")) in ["1", "true", "True"]

        data["shop_id"] = shop.id  # ✅ esto sí lo espera el serializer

        # ✅ Manejar filtros correctamente (igual que en `update()`)
        filters_raw = [value for key, value in request.data.items() if key.startswith("filters[")]
        print("📌 Filters en crudo antes del parseo:", filters_raw)

        # Si `filters_raw` es una lista con valores, la asignamos correctamente
        filters = filters_raw if isinstance(filters_raw, list) else []
        print("✅ Filters después de parseo:", filters)
        data["filters"] = json.dumps(filters)  # ✅ Convertir lista a JSON antes de enviarlo al serializer

        # ✅ Convertir `fluctuationRules` a JSON
        fluctuation_rules_raw = request.data.get("fluctuationRules", "[]")
        print("📌 Fluctuation Rules en crudo:", fluctuation_rules_raw)

        try:
            parsed = json.loads(fluctuation_rules_raw) if isinstance(fluctuation_rules_raw, str) else fluctuation_rules_raw
            if isinstance(parsed, list) and len(parsed) == 1 and isinstance(parsed[0], list):
                parsed = parsed[0]  # ✅ Elimina doble lista si existe
            data["fluctuation_rules"] = json.dumps(parsed)  # ✅ lo pasamos como string válido
            print("✅ Fluctuation Rules después de parseo:", parsed)
        except json.JSONDecodeError:
            print("❌ Error al parsear fluctuationRules")
            data["fluctuation_rules"] = []

        # ✅ Revisar si Django recibe correctamente los datos antes de guardar
        print("🔍 Datos finales antes de serializar:", data)

        serializer = self.get_serializer(data=data)

        # 🚨 **Verificamos si hay errores en el serializador**
        if not serializer.is_valid():
            print("❌ Error en serializer:", serializer.errors)
            return Response(serializer.errors, status=400)

        product = serializer.save()

        # 🚀 **Verificamos si los filtros realmente se guardaron**
        print("✅ Producto creado con filtros guardados en BD:", product.filters)

        # 📸 Guardar imagen si se envió
        if "image" in request.FILES:
            product.image = request.FILES["image"]
            product.save()

        return Response(serializer.data, status=201)

    def update(self, request, *args, **kwargs):
        """Edita un producto solo si pertenece al usuario autenticado."""
        print("🚀 Se ha llamado a update()")
        print("📩 Datos recibidos en update():", request.data)

        user = request.user
        product = self.get_object()

        if product.shop.owner != user:
            return Response({"error": "No tienes permiso para editar este producto."}, status=403)

        data = request.data.copy()

        data["auto_fluctuation"] = str(request.data.get("autoFluctuation")) in ["1", "true", "True"]

        filters_raw = [value for key, value in request.data.items() if key.startswith("filters[")]
        print("📌 Filters en crudo antes del parseo:", filters_raw)

        # Si `filters_raw` es una lista con valores, la asignamos correctamente
        filters = filters_raw if isinstance(filters_raw, list) else []
        print("✅ Filters después de parseo:", filters)
        data["filters"] = json.dumps(filters)  # ✅ Convertir lista a JSON antes de enviarlo al serializer


        # ✅ Convertir `fluctuationRules` a JSON
        fluctuation_rules_raw = request.data.get("fluctuationRules", "[]")
        print("📌 Fluctuation Rules en crudo:", fluctuation_rules_raw)

        try:
            parsed = json.loads(fluctuation_rules_raw) if isinstance(fluctuation_rules_raw, str) else fluctuation_rules_raw
            if isinstance(parsed, list) and len(parsed) == 1 and isinstance(parsed[0], list):
                parsed = parsed[0]  # ✅ Elimina doble lista si existe
            data["fluctuation_rules"] = json.dumps(parsed)  # ✅ lo pasamos como string válido
            print("✅ Fluctuation Rules después de parseo:", parsed)
        except json.JSONDecodeError:
            print("❌ Error al parsear fluctuationRules")
            data["fluctuation_rules"] = []

        # ✅ Revisar si Django recibe correctamente los datos antes de guardar
        print("🔍 Datos finales antes de serializar:", data)

        serializer = self.get_serializer(product, data=data, partial=True)

        # 🚨 **Verificamos si hay errores en el serializador**
        if not serializer.is_valid():
            print("❌ Error en serializer:", serializer.errors)
            return Response(serializer.errors, status=400)

        product = serializer.save()

        # 🚀 **Verificamos si los filtros realmente se guardaron**
        print("✅ Producto actualizado. Filtros guardados en BD:", product.filters)

        # 📸 Guardar imagen si se envió
        if "image" in request.FILES:
            product.image = request.FILES["image"]
            product.save()

        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_shops(request):
    """Devuelve todas las tiendas (sin filtrar por usuario)."""
    shops = Shop.objects.all()
    serializer = ShopSerializer(shops, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_products(request):
    shop_id = request.GET.get("shop")
    if shop_id:
        products = Product.objects.filter(shop_id=shop_id)
    else:
        products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_shop_detail(request, pk):
    try:
        shop = Shop.objects.get(pk=pk)
        serializer = ShopSerializer(shop)
        return Response(serializer.data)
    except Shop.DoesNotExist:
        return Response({"error": "Tienda no encontrada"}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({"error": "Producto no encontrado"}, status=404)

@api_view(['POST'])
def create_order(request):
    print("📥 Datos recibidos:", request.data)

    try:
        data = request.data.copy()  # Hacemos una copia para poder modificarla

        # ✅ Si el usuario está autenticado, añadimos el campo cliente
        if request.user.is_authenticated:
            data["cliente"] = request.user.id

        serializer = OrderCreateSerializerClass(data=data)

        if serializer.is_valid():
            order = serializer.save()
            data = OrderCreateSerializerClass(order).data
            print("✅ Pedido creado:", order)
            return Response(data, status=status.HTTP_201_CREATED)
        else:
            print("❌ Errores de validación:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print("💥 ERROR en el backend:", e)
        import traceback
        traceback.print_exc()
        return Response({"error": "Error interno del servidor"}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_orders(request):
    user = request.user

    try:
        shop = user.shop  # El vendedor tiene una tienda vinculada
    except Exception as e:
        print("❌ Error obteniendo la tienda del usuario:", e)
        return Response({"error": "Este usuario no tiene tienda asociada."}, status=400)

    pedidos = Order.objects.filter(shop=shop).order_by('-created_at')

    # 🛠️ Imprimir detalles de cada pedido con protección
    for pedido in pedidos:
        print(f"🧾 Pedido ID: {pedido.id}")
        try:
            if pedido.cliente:
                print(f"👤 Cliente: {pedido.cliente} — Username: {pedido.cliente.username} — Email: {pedido.cliente.email}")
            else:
                print("⚠️ Cliente es None")
        except Exception as ex:
            print(f"💥 Error al acceder a cliente: {ex}")

    from .serializers import OrderReadSerializer
    serializer = OrderReadSerializer(pedidos, many=True)

    # 🛠️ Imprimir respuesta serializada con protección
    try:
        import json
        print("📤 JSON serializado:")
        print(json.dumps(serializer.data, indent=2, ensure_ascii=False))
    except Exception as e:
        print("❌ Error serializando JSON:", e)

    return Response(serializer.data)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def pedido_view(request, order_id):
    try:
        order = Order.objects.get(id=order_id)

        # Permitir ver el pedido si eres el comprador o el dueño de la tienda
        if order.cliente != request.user and order.shop.owner != request.user:
            return Response({"error": "No autorizado"}, status=403)

        if request.method == 'GET':
            serializer = OrderReadSerializer(order)
            return Response(serializer.data)

        elif request.method == 'PATCH':
            nuevo_estado = request.data.get("status")
            if nuevo_estado not in ["pendiente", "finalizado", "cancelado"]:
                return Response({"error": "Estado no válido"}, status=400)

            order.status = nuevo_estado
            order.status_updated_at = timezone.now()
            order.save()

            serializer = OrderReadSerializer(order)
            return Response(serializer.data)

    except Order.DoesNotExist:
        return Response({"error": "Pedido no encontrado"}, status=404)

@api_view(['POST'])
def orders_by_codes(request):
    codes = request.data.get('verification_codes', [])
    orders = Order.objects.filter(verification_code__in=codes)
    serializer = OrderReadSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    """Vista para mostrar los pedidos del comprador autenticado."""
    user = request.user
    orders = Order.objects.filter(cliente=user).order_by('-created_at')
    serializer = OrderReadSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_order_by_code(request):
    """Permite a un usuario anónimo obtener los detalles del pedido usando el código de verificación."""
    verification_code = request.data.get('verification_code')

    if not verification_code:
        return Response({"error": "Código de verificación requerido."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        order = Order.objects.get(verification_code=verification_code)
        serializer = OrderReadSerializer(order)
        return Response(serializer.data)

    except Order.DoesNotExist:
        return Response({"error": "Pedido no encontrado o código incorrecto."}, status=status.HTTP_404_NOT_FOUND)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_seller_request_email(request):
    from .models import SellerRequestEmailRecipient
    from django.utils.html import escape
    import traceback

    print("🔵 Entró en send_seller_request_email")

    user = request.user
    data = request.data
    print("📥 Datos recibidos:", data)

    # Aseguramos que todos los datos estén como string y escapados
    def safe_get(value):
        return escape(str(value)) if value else "No especificado"

    full_name = safe_get(data.get('fullName', ''))
    email = safe_get(data.get('email', ''))
    phone = safe_get(data.get('phone', ''))
    store_name = safe_get(data.get('storeName', ''))
    address = safe_get(data.get('address', ''))
    city = safe_get(data.get('city', ''))
    province = safe_get(data.get('province', ''))
    country = safe_get(data.get('country', ''))

    print("👤 Datos preparados:", full_name, email, phone, store_name, address, city, province, country)

    recipients = list(SellerRequestEmailRecipient.objects.filter(active=True).values_list('email', flat=True))
    print("📩 Destinatarios encontrados:", recipients)

    if not recipients:
        print("⚠️ No hay destinatarios activos.")
        return Response(
            {"error": "No hay destinatarios activos configurados."},
            status=400
        )

    subject = "Nueva Solicitud para Ser Vendedor"

    text_content = f"""
Nueva solicitud para convertirse en vendedor:

Nombre completo: {full_name}
Email: {email}
Teléfono: {phone}

Nombre de la tienda: {store_name}
Dirección: {address}
Ciudad: {city}
Provincia: {province}
País: {country}

Usuario registrado como: {user.username} ({user.email})
"""

    html_content = f"""
<html>
  <body style="font-family: Arial, sans-serif; color: #333;">
    <h2>📩 Nueva Solicitud para Ser Vendedor</h2>
    <p><strong>👤 Nombre completo:</strong> {full_name}</p>
    <p><strong>✉️ Email:</strong> {email}</p>
    <p><strong>📱 Teléfono:</strong> {phone}</p>
    <br />
    <p><strong>🏪 Nombre de la tienda:</strong> {store_name}</p>
    <p><strong>📍 Dirección:</strong> {address}</p>
    <p><strong>🏙️ Ciudad:</strong> {city}</p>
    <p><strong>🌎 Provincia:</strong> {province}</p>
    <p><strong>🌐 País:</strong> {country}</p>
    <br />
    <p>🔑 <strong>Usuario registrado:</strong> {user.username} ({user.email})</p>
    <br />
    <p>✅ Por favor, revisa sus datos en el panel de administración de Django.</p>
  </body>
</html>
"""

    try:
        print("📤 Enviando correo...")
        msg = EmailMultiAlternatives(
            subject,
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            recipients,
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        print("✅ Correo enviado correctamente")

        return Response({"message": "Solicitud enviada correctamente."})

    except Exception as e:
        print("💥 ERROR al enviar email:")
        traceback.print_exc()
        return Response({"error": "Error interno al enviar correo."}, status=500)


class OrderDetailView(RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderReadSerializer
    permission_classes = [AllowAny]  # o IsAuthenticated si prefieres
