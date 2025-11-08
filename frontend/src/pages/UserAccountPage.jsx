import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./UserAccountPage.css";
import Footer from "../components/Footer";

const UserAccountPage = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const sellerPaths = ["/productos", "/pedidos", "/store", "/edit-product", "/pedido"];
  const isSellerPanel = sellerPaths.some((path) => location.pathname.startsWith(path));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUsername(data.username || "Usuario");
      } catch (err) {
        console.error("Error al obtener usuario:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    // Guardar el panel actual al entrar
    localStorage.setItem("lastPanel", isSellerPanel ? "seller" : "buyer");
  }, [isSellerPanel]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastPanel");
    window.location.href = "/";
  };

  return (
    <div className="main-container">
      <div className="content-wrapper">
        <div className="user-account-container">
          <p className="titulo-mi-cuenta">Mi cuenta</p>
          <div className="user-profile-section">
            <div className="user-avatar" />
            <p className="user-name">{username.toUpperCase()}</p>
          </div>

          <div className="user-options">
            <div className="user-option">Mi perfil</div>
            <div className="user-option">Configuración</div>
            <div className="user-option">Notificaciones</div>
            <div className="user-option">Métodos de pago</div>

            <div className="user-option" onClick={() => {
              localStorage.setItem("lastPanel", "seller");
              window.location.href = "/productos";
            }}>
              Ir al panel de vendedor
            </div>

            <div className="user-option" onClick={() => {
              localStorage.setItem("lastPanel", "buyer");
              window.location.href = "/";
            }}>
              Ir al panel de comprador
            </div>

            <div className="user-option logout" onClick={handleLogout}>
              Cerrar sesión
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserAccountPage;
