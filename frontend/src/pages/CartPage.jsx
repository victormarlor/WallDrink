import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";
import { CartContext } from "../context/CartContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Footer from "../components/Footer"

const CartPage = () => {
    const { cartItems, updateQuantity, clearCart } = useContext(CartContext);
    const navigate = useNavigate();
    const backendUrl = "http://localhost:8000";

    const total = cartItems.reduce(
        (acc, item) => acc + Number(item.price) * item.quantity,
        0
    );

    const handleCheckout = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const items = cartItems.map((item) => ({
                product: item.id,
                quantity: item.quantity,
                unit_price: Number(item.price),
            }));

            const shopId = typeof cartItems[0].shop === "object" ? cartItems[0].shop.id : cartItems[0].shop;

            const response = await axios.post(
                `${backendUrl}/api/orders/create/`,
                { shop: shopId, items },
                { headers }
            );

            const orderId = response.data.id;

            const fullOrder = await axios.get(`${backendUrl}/api/orders/detail/${orderId}/`, {
                headers,
            });

            clearCart();
            navigate("/ticket", { state: fullOrder.data });
        } catch (error) {
            console.error("Error al procesar el pedido:", error);
            alert("Hubo un problema al procesar tu pedido.");
        }
    };

    return (
        <div className="main-container">
            <div className="content-wrapper">
                <h1>Carrito</h1>
                {cartItems.length === 0 ? (
                    <p>Tu carrito está vacío.</p>
                ) : (
                    <>
                        <div className="cart-items">
                            {cartItems.map((item) => (
                                <div key={item.id} className="cart-item">
                                    {item.image && (
                                        <img
                                            src={`http://localhost:8000${item.image}`}
                                            alt={item.name}
                                            className="cart-item-image"
                                        />
                                    )}
                                    <div className="cart-item-details">
                                        {/* Nombre + Papelera */}
                                        <div className="cart-item-header">
                                            <h3>{item.name}</h3>
                                            <button
                                                className="delete-button"
                                                onClick={() => updateQuantity(item.id, 0)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>

                                        {/* Precio + Controles */}
                                        <div className="item-row">
                                            <p className="unit-price">{Number(item.price).toFixed(2)} € c/u</p>
                                            <div className="quantity-controls">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <hr className="summary-divider" />
                            <h3>Total</h3>
                            <p>{total.toFixed(2)} €</p>
                            <button className="checkout-button" onClick={handleCheckout}>
                                Proceder al pago
                            </button>
                        </div>
                    </>
                )}
            </div>
            <Footer></Footer>
        </div>
    );
};

export default CartPage;
