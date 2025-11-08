import "./Footer.css";
import logo from "../assets/ImagotipoWallDrink.png";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section left">
          <img src={logo} alt="Logo Walldrink" className="footer-logo" />
          <p className="footer-contact">contacto@walldrink.com</p>
          <p className="footer-contact">91 565 32 76 | 636 91 79 63</p>
        </div>

        <div className="footer-section center">
          <ul>
            <li onClick={() => navigate("/")}>Inicio</li>
            <li onClick={() => navigate("/buscar")}>Buscar</li>
            <li onClick={() => navigate("/favoritos")}>Favoritos</li>
            <li onClick={() => navigate("/mis-pedidos")}>Mis pedidos</li>
            <li onClick={() => navigate("/carrito")}>Cesta</li>
            <li onClick={() => navigate("/mi-cuenta")}>Mi cuenta</li>
          </ul>
        </div>

        <div className="footer-section right">
          <ul>
            <li onClick={() => navigate("/legal")}>Aviso legal</li>
            <li onClick={() => navigate("/privacidad")}>Política de Privacidad</li>
            <li onClick={() => navigate("/cookies")}>Política de Cookies</li>
          </ul>
        </div>
      </div>

      <hr className="footer-separator" />
      <p className="footer-bottom">Copyright Walldrink. Todos los derechos reservados</p>
    </footer>
  );
};

export default Footer;
