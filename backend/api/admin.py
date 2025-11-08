from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Product, Shop, Order, OrderItem, SellerRequestEmailRecipient

# 👤 Admin personalizado para CustomUser
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'is_staff')
    search_fields = ('username', 'email')
    list_filter = ('role', 'is_active', 'is_staff')
    ordering = ('username',)

    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Información Personal', {'fields': ('first_name', 'last_name')}),
        ('Permisos', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas Importantes', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'is_active', 'is_staff', 'is_superuser'),
        }),
    )

# 🛒 Admin para los productos
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "stock", "image")
    search_fields = ("name",)
    list_filter = ("price", "stock")

# 🏪 Admin para las tiendas
@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "city", "country")
    search_fields = ("name", "owner__email")
    list_filter = ("city", "country")

# 🧾 Admin para los pedidos
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "quantity", "unit_price")

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "shop", "cliente", "status", "verification_code", "created_at")
    list_filter = ("status", "shop")
    search_fields = ("id", "verification_code", "cliente__username", "shop__name")
    readonly_fields = ("created_at", "verification_code")
    inlines = [OrderItemInline]
    actions = ["delete_selected"]


# ✅ Registrar usuario personalizado
admin.site.register(CustomUser, CustomUserAdmin)


@admin.register(SellerRequestEmailRecipient)
class SellerRequestEmailRecipientAdmin(admin.ModelAdmin):
    list_display = ('email', 'active')
    list_filter = ('active',)
    search_fields = ('email',)