import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import QRCode from "qrcode-generator";
import "./TicketPage.css";
import Footer from "../components/Footer"

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const backendUrl = "http://localhost:8000";

    useEffect(() => {
        const fetchPedido = async () => {
            const token = localStorage.getItem("token");

            if (token) {
                try {
                    const response = await axios.get(`${backendUrl}/api/orders/detail/${id}/`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setPedido(response.data);
                } catch (err) {
                    console.error("Error al obtener el pedido:", err);
                    setError("No pudimos cargar el pedido.");
                } finally {
                    setLoading(false);
                }
            } else {
                const verificationCodes = JSON.parse(localStorage.getItem('pedidosLocales') || '[]');

                if (verificationCodes.length === 0) {
                    setError("No tienes acceso a este pedido.");
                    setLoading(false);
                    return;
                }

                try {
                    const response = await axios.post(`${backendUrl}/api/orders/bycodes/`, {
                        verification_codes: verificationCodes,
                    });

                    const pedidos = response.data;
                    const pedidoEncontrado = pedidos.find(p => p.id === parseInt(id));

                    if (pedidoEncontrado) {
                        setPedido(pedidoEncontrado);
                    } else {
                        setError("No tienes acceso a este pedido.");
                    }
                } catch (err) {
                    console.error("Error verificando pedido anónimo:", err);
                    setError("No pudimos encontrar tu pedido.");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchPedido();
    }, [id]);

    if (loading) return <p className="main-container">Cargando pedido...</p>;

    if (error) return (
        <div className="main-container">
            <div className="content-wrapper">
                <p className="error-message">{error}</p>
                <button onClick={() => navigate("/")}>Volver al inicio</button>
            </div>
        </div>
    );

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
        (acc, item) => acc + Number(item.unit_price) * item.quantity,
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
                                const name = product.name || `Producto ${product.id || "?"}`;
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
                        <button onClick={() => navigate("/mis-pedidos")}>Volver al inicio</button>
                    </div>
                </div>
            </div>
            <Footer></Footer>
        </div>
    );
};

export default OrderDetailPage;
