// Ruta: src/pages/MyOrdersPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MyOrdersPage.css";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import Footer from "../components/Footer"

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("activos");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const backendUrl = "http://localhost:8000";
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Debes iniciar sesión para ver tus pedidos.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${backendUrl}/api/orders/myorders/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Error al cargar pedidos:", error);
            setError("No pudimos cargar tus pedidos. Intenta más tarde.");
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter((order) =>
        activeTab === "activos"
            ? order.status === "pendiente"
            : order.status !== "pendiente"
    );

    return (
        <div className="main-container">
            <div className="content-wrapper">
                <h1 className="orders-title">Mis pedidos</h1>

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

                {loading ? (
                    <p>Cargando pedidos...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : filteredOrders.length === 0 ? (
                    <p className="no-orders-message">
                        No hay pedidos {activeTab === "activos" ? "activos" : "pasados"}.
                    </p>
                ) : (
                    <div className="orders-list">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="order-card"
                                onClick={() => navigate(`/pedido/${order.id}`)}
                            >
                                <div
                                    className="order-image"
                                    style={{
                                        backgroundImage: `url(http://localhost:8000${order.shop.images[order.shop.main_image_index || 0]?.image})`,
                                    }}
                                />
                                <div className="order-info">
                                    <div className="order-details-container">
                                    <div className="order-details">
                                        <div className="order-header">
                                        <h3>{order.shop.name}</h3>
                                        <p className="order-id">ID: {order.verification_code}</p>
                                        </div>

                                        <div className="order-items no-bullets">
                                        {order.items.slice(0, 2).map((item, idx) => (
                                            <div key={idx}>
                                            {item.quantity} x {item.product.name}
                                            </div>
                                        ))}
                                        {order.items.length > 2 && (
                                            <div className="ver-mas-texto">...y {order.items.length - 2} más</div>
                                        )}
                                        </div>
                                            <div className="order-footer">
                                            <p className="order-total">
                                                Total: {Number(order.total_price).toFixed(2)} €
                                            </p>

                                            {order.status === "finalizado" ? (
                                                <button
                                                className="repeat-button"
                                                    onClick={(e) => {
                                                    e.stopPropagation();
                                                    order.items.forEach((item) => {
                                                        addToCart({
                                                        id: item.product.id,
                                                        name: item.product.name,
                                                        price: item.unit_price,
                                                        image: item.product.image || "",
                                                        shop: order.shop.id,
                                                        quantity: item.quantity,
                                                        });

                                                    });
                                                    navigate("/carrito");
                                                    }}
                                                >
                                                Repetir
                                                </button>
                                            ) : (
                                                <span className={`order-badge ${order.status}`}>
                                                {order.status.toUpperCase()}
                                                </span>
                                            )}
                                            </div>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer></Footer>
        </div>
    );
};

export default MyOrdersPage;
