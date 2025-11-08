import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./OrdersPage.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("activos");
  const navigate = useNavigate();

  const backendUrl = "http://localhost:8000";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(`${backendUrl}/api/orders/seller/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error al cargar los pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.patch(
        `${backendUrl}/api/orders/${orderId}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? response.data : o))
      );
    } catch (err) {
      alert("No se pudo actualizar el estado del pedido.");
      console.error(err);
    }
  };

  const handleVerification = async () => {
    const token = localStorage.getItem("token");
    setMessage("");

    const inputCode = verificationCode.trim().toUpperCase();

    const orderFound = orders.find(
      (order) => order.verification_code.toUpperCase() === inputCode
    );

    if (!orderFound) {
      setMessage("El pedido no existe.");
      return;
    }

    if (orderFound.status === "finalizado") {
      setMessage("Este pedido ya fue entregado.");
      return;
    }

    if (orderFound.status === "cancelado") {
      setMessage("Este pedido está cancelado y no puede entregarse.");
      return;
    }

    try {
      const response = await axios.patch(
        `${backendUrl}/api/orders/${orderFound.id}/`,
        { status: "finalizado" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === orderFound.id ? response.data : o))
      );
      setMessage("Pedido entregado correctamente.");
    } catch (error) {
      setMessage("Error al actualizar el estado del pedido.");
      console.error(error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleVerification();
    }
  };

  const filteredOrders = orders.filter((order) =>
    activeTab === "activos"
      ? order.status === "pendiente"
      : order.status !== "pendiente"
  );

  if (loading) {
    return (
      <div className="main-container">
        <div className="content-wrapper">
          <p>Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="content-wrapper">
        <h1 className="orders-title">Pedidos Recibidos</h1>

        <div className="orders-tabs">
          <button
            className={activeTab === "activos" ? "active" : ""}
            onClick={() => setActiveTab("activos")}
          >
            Activos
          </button>
          <button
            className={activeTab === "pasados" ? "active" : ""}
            onClick={() => setActiveTab("pasados")}
          >
            Pasados
          </button>
        </div>

        <div className="verification-section">
          <input
            type="text"
            placeholder="Código de verificación"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            onKeyPress={handleKeyPress}
            className="verification-input"
          />
          <button onClick={handleVerification} className="verification-button">
            Verificar Pedido
          </button>
        </div>

        {message && <p className="verification-message">{message}</p>}

        {filteredOrders.length === 0 ? (
          <p>No hay pedidos en esta sección.</p>
        ) : (
                <div className="orders-list">
                {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="order-card-compact"
                      onClick={() => navigate(`/pedido/${order.id}`)}
                      style={{ cursor: "pointer" }}
                    >

                    <div className="order-top">
                        <div className="order-name-products">
                        <p className="order-customer">{order.cliente?.username || "Usuario sin nombre"}</p>
                        <p className="order-items-list">
                            {order.items.map((item, idx) => (
                            <span key={idx}>
                                {item.quantity} x {item.product.name}
                                {idx < order.items.length - 1 ? ", " : ""}
                            </span>
                            ))}
                        </p>
                        </div>

                        <div className="order-code-date">
                        <p className="order-id">ID: {order.verification_code}</p>
                        <p className="order-date">
                            {new Date(order.created_at).toLocaleDateString("es-ES")}{" "}
                            {new Date(order.created_at).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                            })}h
                        </p>
                        </div>
                    </div>

                    <div className="order-bottom">
                        <p className="order-total">
                        {order.items.reduce((t, i) => t + i.quantity * i.unit_price, 0).toFixed(2)} €
                        </p>
                        <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`order-status-select ${order.status}`}
                        onClick={(e) => e.stopPropagation()}
                        >
                        <option value="pendiente">Pendiente</option>
                        <option value="finalizado">Finalizado</option>
                        <option value="cancelado">Cancelado</option>
                        </select>
                    </div>
                    </div>


                ))}
                </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
