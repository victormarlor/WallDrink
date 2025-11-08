import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/AuthPages.css";
import logo from "../assets/IsologoWallDrink.png";

const ResetPassword = () => {
  const { uidb64, token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!password) {
      setError("La nueva contraseña es obligatoria.");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8000/api/reset-password/${uidb64}/${token}/`, {
        password,
      });
      setMessage(response.data.message || "Contraseña actualizada correctamente.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setError("El enlace de restablecimiento es inválido o ha expirado.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <img src={logo} alt="Logo" className="auth-logo" />

        <p className="auth-title">Crea una nueva contraseña</p>
        <p className="auth-subtitle">Elige una contraseña segura para proteger tu cuenta</p>

        {message && <p className="auth-message success">{message}</p>}
        {error && <p className="auth-message error">{error}</p>}

        <form onSubmit={handleReset} className="auth-form">
          <label className="auth-label">Nueva contraseña *</label>
          <input
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="auth-button">
            Cambiar contraseña
          </button>
        </form>

        <p className="auth-bottom-text">
          <a href="/login">Volver al inicio de sesión</a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
