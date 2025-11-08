import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ActivateAccount from "./pages/ActivateAccount";
import ResendActivation from "./pages/ResendActivation";
import ResetPasswordRequest from "./pages/ResetPasswordRequest";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ShopPage from "./pages/ShopPage";
import StorePage from "./pages/StorePage";
import BecomeSeller from "./pages/BecomeSeller";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/NavBar";
import { useEffect, useState } from "react";
import axios from "axios";
import ProductsPage from "./pages/ProductsPage";
import ProductForm from "./pages/ProductForm";
import ProductPage from "./pages/ProductPage";
import PrivateRouteWithShop from "./components/PrivateRouteWithShop";
import CartPage from "./pages/CartPage";
import TicketPage from "./pages/TicketPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import PresentProductsPage from "./pages/PresentProductsPage";
import UserAccountPage from "./pages/UserAccountPage";


function App() {
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadingUser(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:8000/api/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserRole(response.data.role);
      } catch (error) {
        console.error("Error obteniendo el rol del usuario", error);
        localStorage.removeItem("token");
        setUserRole(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserRole();
  }, []);

  const noNavbarRoutes = [
    "/login",
    "/register",
    "/activate",
    "/resend-activation",
    "/reset-password-request",
    "/reset-password",
    "/present-products"
  ];

  const showNavbar = !noNavbarRoutes.some((route) => location.pathname.startsWith(route));
  const isAuthenticated = !!localStorage.getItem("token");

  if (loadingUser) return <p>Cargando usuario...</p>;

  return (
    <div className="app-container">
      {showNavbar && <Navbar isAuthenticated={isAuthenticated} userRole={userRole} />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop/:shopId" element={<ShopPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate/:uidb64/:token" element={<ActivateAccount />} />
        <Route path="/resend-activation" element={<ResendActivation />} />
        <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
        <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/ticket" element={<TicketPage />} />


        {/* Rutas protegidas */}
        <Route path="/mi-cuenta" element={
          <ProtectedRoute><UserAccountPage /></ProtectedRoute>
        } />
        <Route path="/mis-pedidos" element={
          <ProtectedRoute><MyOrdersPage /></ProtectedRoute>
        } />
        <Route path="/pedido/:id" element={<OrderDetailPage />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/become-seller" element={
          <ProtectedRoute><BecomeSeller /></ProtectedRoute>
        } />
        <Route path="/store" element={
          <ProtectedRoute>
            <StorePage />
          </ProtectedRoute>
        } />
        <Route path="/productos" element={
          <ProtectedRoute>
            <PrivateRouteWithShop><ProductsPage /></PrivateRouteWithShop>
          </ProtectedRoute>
        } />
        <Route path="/pedidos" element={
          <ProtectedRoute>
            <PrivateRouteWithShop><OrdersPage /></PrivateRouteWithShop>
          </ProtectedRoute>
        } />
        <Route path="/edit-product/:productId" element={
          <ProtectedRoute>
            <PrivateRouteWithShop><ProductForm /></PrivateRouteWithShop>
          </ProtectedRoute>
        } />
        <Route path="/add-product" element={
          <ProtectedRoute>
            <PrivateRouteWithShop><ProductForm /></PrivateRouteWithShop>
          </ProtectedRoute>
        } />
        <Route path="/present-products" element={
          <ProtectedRoute>
            <PrivateRouteWithShop><PresentProductsPage /></PrivateRouteWithShop>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
