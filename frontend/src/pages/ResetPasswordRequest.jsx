import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/AuthPages.css";
import logo from "../assets/IsologoWallDrink.png";

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("El correo electrónico es obligatorio.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/password-reset/", { email });
      setMessage(response.data.message || "Correo de recuperación enviado.");
    } catch (error) {
      setError("No se pudo enviar el enlace de restablecimiento.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <img src={logo} alt="Logo" className="auth-logo" />

        <p className="auth-title">Restablecer contraseña</p>
        <p className="auth-subtitle">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {message && <p className="auth-message success">{message}</p>}
        {error && <p className="auth-message error">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">Correo electrónico *</label>
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" className="auth-button">
            Enviar enlace de recuperación
          </button>
        </form>

        <p className="auth-bottom-text">
          <a href="/login">Volver al inicio de sesión</a>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordRequest;
