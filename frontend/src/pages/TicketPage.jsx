import React, { useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QRCode from "qrcode-generator";
import "./TicketPage.css";
import { CartContext } from "../context/CartContext";
import Footer from "../components/Footer"

const TicketPage = () => {
    const { state: pedido } = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useContext(CartContext);

    useEffect(() => {
        if (!pedido) {
            console.warn("Pedido no encontrado, redirigiendo...");
            navigate("/carrito");
            return;
        }

        clearCart();
    }, []);

    if (!pedido) return null;

    const qrData = {
        code: pedido.verification_code,
        items: pedido.items.map((item) => ({
            id: item.product?.id || item.product,
            quantity: item.quantity,
            price: item.unit_price,
        })),
    };

    const qr = QRCode(0, "M");
    qr.addData(JSON.stringify(qrData));
    qr.make();
    const qrImage = qr.createDataURL(10, 0);

    const total = pedido.items.reduce(
        (acc, item) => acc + Number(item.unit_price) * Number(item.quantity),
        0
    );

    const handlePrint = () => window.print();

    return (
        <div className="main-container">
            <div className="content-wrapper">
                <div className="ticket-page">
                    <h1>Tu Ticket</h1>
                    <p>Presenta este código al camarero para verificar tu pedido.</p>

                    <div className="qr-section">
                        <img src={qrImage} alt="Código QR" />
                        <p className="verification-code">
                            ID del pedido: {pedido.verification_code}
                        </p>
                    </div>

                    <div className="ticket-items">
                        <h2>Resumen compra:</h2>
                        <ul>
                            {pedido.items.map((item, idx) => {
                                const product = item.product || {};
                                const name = product.name || "Producto desconocido";
                                const id = product.id || "?";

                                const quantity = Number(item.quantity);
                                const price = Number(item.unit_price);

                                return (
                                    <li key={idx} className="ticket-item-line">
                                    <span className="ticket-item-info">{quantity} x {name}</span>
                                    <span className="ticket-item-price">{price.toFixed(2)} €/u</span>
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="ticket-total">
                            Total: {total.toFixed(2)} €
                        </div>
                    </div>

                    <div className="ticket-actions">
                        <button onClick={handlePrint}>Imprimir ticket</button>
                        <button onClick={() => navigate("/")}>Volver al inicio</button>
                    </div>
                </div>
            </div>
            <Footer></Footer>
        </div>
    );
};

export default TicketPage;
