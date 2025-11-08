import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/AuthPages.css";
import logo from "../assets/IsologoWallDrink.png";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

const handleRegister = async (e) => {
  e.preventDefault();
  setMessage("");
  setError("");

  if (!username || !email || !password) {
    setError("Todos los campos son obligatorios.");
    return;
  }

    try {
      const response = await axios.post("http://localhost:8000/api/register/", {
        username,
        email,
        password,
      }, {
        validateStatus: () => true  // 👈 permite cualquier status como válido
      });

      if (response.status === 200) {
        setMessage(response.data.message);
        setTimeout(() => navigate("/login"), 3000);
      } else if (response.status === 400 && response.data?.error) {
        setError(response.data.error);
      } else {
        console.error("❌ Error inesperado:", response);
        setError("Error inesperado al registrar el usuario.");
      }
    } catch (error) {
      console.error("❌ Error real de red:", error);
      setError("Error al conectar con el servidor.");
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-box">
        <img src={logo} alt="Logo" className="auth-logo" />

        <p className="auth-title">Crea tu cuenta</p>
        <p className="auth-subtitle">Inicia sesión o regístrate para empezar a disfrutar de Walldrink y vender tus productos al mejor precio.</p>

        <div className="auth-tabs">
          <div className="auth-tab" onClick={() => navigate("/login")}>Iniciar sesión</div>
          <div className="auth-tab active">Registrarme</div>
        </div>

        {error && <p className="auth-message error">{error}</p>}
        {message && <p className="auth-message success">{message}</p>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="input-section">
          <label className="auth-label">Nombre de usuario *</label>
          <input
            type="text"
            placeholder="Nombre de Usuario"
            className="auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          </div>

          <div className="input-section">
          <label className="auth-label">Correo electrónico *</label>
          <input
            type="email"
            placeholder="Correo Electrónico"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          </div>

          <div className="input-section">
          <label className="auth-label">Contraseña *</label>
          <input
            type="password"
            placeholder="Contraseña"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          </div>

          <button type="submit" className="auth-button">
            Registrarme
          </button>
        </form>

        <p className="auth-bottom-text">
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
