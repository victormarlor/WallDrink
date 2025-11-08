// frontend/src/pages/BecomeSeller.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./BecomeSeller.css";

const BecomeSeller = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        storeName: "",
        address: "",
        city: "",
        province: "",
        country: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:8000/api/user/", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.role === "seller") {
                    navigate("/store");
                }
            } catch (error) {
                console.error("Error obteniendo el perfil del usuario", error);
            }
        };
        checkUserRole();
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post("http://localhost:8000/api/send-seller-request/", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                setMessage("¡Solicitud enviada! Nuestro equipo revisará tus datos pronto.");
            } else {
                setMessage("No se pudo enviar la solicitud. Inténtalo más tarde.");
            }
        } catch (error) {
            console.error("Error al enviar la solicitud:", error);
            setMessage("Error al enviar la solicitud. Inténtalo más tarde.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-container">
            <div className="content-wrapper">
                <h1>Solicitud para Ser Vendedor</h1>
                <p>Por favor, completa el siguiente formulario para solicitar acceso como vendedor.</p>
                
                {message && <p className="message-success">{message}</p>}

                <form className="seller-form" onSubmit={handleSubmit}>
                    <input type="text" name="fullName" placeholder="Nombre completo" value={formData.fullName} onChange={handleChange} required />
                    <input type="email" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} required />
                    <input type="text" name="phone" placeholder="Teléfono" value={formData.phone} onChange={handleChange} required />
                    <input type="text" name="storeName" placeholder="Nombre de la tienda" value={formData.storeName} onChange={handleChange} required />
                    <input type="text" name="address" placeholder="Dirección" value={formData.address} onChange={handleChange} required />
                    <input type="text" name="city" placeholder="Ciudad" value={formData.city} onChange={handleChange} required />
                    <input type="text" name="province" placeholder="Provincia" value={formData.province} onChange={handleChange} required />
                    <input type="text" name="country" placeholder="País" value={formData.country} onChange={handleChange} required />

                    <button className="seller-button" type="submit" disabled={loading}>
                        {loading ? "Enviando..." : "Enviar Solicitud"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BecomeSeller;
