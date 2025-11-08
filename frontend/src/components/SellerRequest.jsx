// frontend/src/components/SellerRequest.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SellerRequest = () => {
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleRequestSellerRole = async () => {
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/request-seller-role/",
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            setMessage(response.data.message);

            // Redirige automáticamente al dashboard de vendedor
            setTimeout(() => navigate("/dashboard/seller"), 2000);

        } catch (error) {
            setMessage("No se pudo completar la solicitud para convertirse en vendedor.");
        }
    };

    return (
        <div className="p-4 bg-white shadow-md rounded">
            <h2 className="text-2xl mb-4">¿Quieres convertirte en vendedor?</h2>
            {message && <p className="text-green-500">{message}</p>}
            <button
                onClick={handleRequestSellerRole}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Solicitar convertirse en vendedor
            </button>
        </div>
    );
};

export default SellerRequest;
