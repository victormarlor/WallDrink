// Ruta: src/pages/ActivateAccount.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/AuthPages.css";
import logo from "../assets/IsologoWallDrink.png";

const ActivateAccount = () => {
  const { uidb64, token } = useParams();
  const [message, setMessage] = useState("Activando tu cuenta...");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const activateUser = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/activate/${uidb64}/${token}/`);
        setMessage(response.data.message);
        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        setError("Error al activar la cuenta. Intenta de nuevo.");
      }
    };
    activateUser();
  }, [uidb64, token, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <img src={logo} alt="Logo" className="auth-logo" />

        <p className="auth-title">Activación de cuenta</p>
        <p className="auth-subtitle">
          {error ? (
            <span className="auth-message error">{error}</span>
          ) : (
            <span className="auth-message success">{message}</span>
          )}
        </p>

        <p className="auth-bottom-text">
          Serás redirigido al inicio de sesión automáticamente.
        </p>
      </div>
    </div>
  );
};

export default ActivateAccount;
