import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../pages/AuthPages.css";
import logo from "../assets/IsologoWallDrink.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/token/", {
        username: email,
        password: password,
      });

      const token = response.data.access;
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (error) {
      setError("Credenciales incorrectas o cuenta no activada");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <img src={logo} alt="Logo" className="auth-logo" />

        <p className="auth-title">
          ¡Bienvenido a Walldrink!
        </p>
        <p className="auth-subtitle">
          Inicia sesión o regístrate para empezar a disfrutar de Walldrink y vender tus productos al mejor precio.
        </p>

        <div className="auth-tabs">
          <div className="auth-tab active">Iniciar sesión</div>
          <div className="auth-tab" onClick={() => navigate("/register")}>Registrarme</div>
        </div>

        {error && <p className="auth-message error">{error}</p>}

        <form onSubmit={handleLogin} className="auth-form">
          <label className="auth-label">Usuario *</label>
          <input
            type="text"
            placeholder="Nombre de Usuario"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="input-group">
          <label className="auth-label">Contraseña *</label>
          <input
            type="password"
            placeholder="Contraseña"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Link to="/reset-password-request" className="auth-link">
            ¿Olvidaste la contraseña?
          </Link>
          </div>


          <button type="submit" className="auth-button">
            Iniciar sesión
          </button>
        </form>

        <p className="auth-bottom-text">
          ¿No estás registrado? <Link to="/register">Regístrate aquí</Link>
        </p>
        <p className="auth-bottom-text">
          ¿No recibiste el correo de activación? <Link to="/resend-activation">Reenviarlo</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
