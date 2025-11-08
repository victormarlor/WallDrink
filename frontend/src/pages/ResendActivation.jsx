import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/AuthPages.css";
import logo from "../assets/IsologoWallDrink.png";

const ResendActivation = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleResend = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("El correo electrónico es obligatorio.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/resend-activation/", { email });

      if (response.data.message) {
        setMessage(response.data.message);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error || "Error al reenviar el correo.");
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <img src={logo} alt="Logo" className="auth-logo" />

        <p className="auth-title">Reenviar correo de activación</p>
        <p className="auth-subtitle">
          Introduce tu correo y te enviaremos de nuevo el enlace para activar tu cuenta.
        </p>

        {message && <p className="auth-message success">{message}</p>}
        {error && <p className="auth-message error">{error}</p>}

        <form onSubmit={handleResend} className="auth-form">
          <label className="auth-label">Correo electrónico *</label>
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" className="auth-button">
            Reenviar correo
          </button>
        </form>

        <p className="auth-bottom-text">
          <a href="/login">Volver al inicio de sesión</a>
        </p>
      </div>
    </div>
  );
};

export default ResendActivation;
