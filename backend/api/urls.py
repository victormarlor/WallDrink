from django.urls import path, include
from rest_framework import routers
from .views import ShopViewSet, ProductViewSet
from .views import (
    user_profile, register, activate_account,
    resend_activation_email, request_password_reset, reset_password,
    request_seller_role, check_authentication, public_shops, public_products,
    public_shop_detail, public_product_detail, seller_orders, create_order, 
    pedido_view, orders_by_codes, my_orders, verify_order_by_code, 
    send_seller_request_email, OrderDetailView
)

router = routers.DefaultRouter()
router.register(r'shops', ShopViewSet)
router.register(r'products', ProductViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("user/", user_profile, name="user_profile"),
    path("register/", register, name="register"),
    path("activate/<uidb64>/<token>/", activate_account, name="activate"),
    path("resend-activation/", resend_activation_email, name="resend_activation"),
    path("password-reset/", request_password_reset, name="password_reset"),
    path("password-reset/<uidb64>/<token>/", reset_password, name="reset_password"),
    path("request-seller-role/", request_seller_role, name="request_seller_role"),
    path('check-auth/', check_authentication, name='check_authentication'),
    path('public-shops/', public_shops, name='public_shops'),
    path('public-products/', public_products, name='public_products'),
    path('public-shops/<int:pk>/', public_shop_detail, name='public_shop_detail'),
    path("public-products/<int:pk>/", public_product_detail, name="public_product_detail"),
    path('orders/seller/', seller_orders, name='seller_orders'),
    path('orders/create/', create_order, name='create_order'),
    path('orders/<int:order_id>/', pedido_view, name='pedido_view'),
    path('orders/bycodes/', orders_by_codes, name='orders_by_codes'),
    path('orders/myorders/', my_orders, name='my_orders'),
    path('orders/verify/', verify_order_by_code, name='verify_order_by_code'),
    path('send-seller-request/', send_seller_request_email, name='send_seller_request'),
    path("orders/detail/<int:pk>/", OrderDetailView.as_view(), name="order_detail"),

]
