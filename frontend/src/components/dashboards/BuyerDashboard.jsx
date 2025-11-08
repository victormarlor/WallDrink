// frontend/src/components/dashboards/BuyerDashboard.jsx
import SellerRequest from "../SellerRequest";

const BuyerDashboard = () => {
    return (
        <div>
            <h2>Dashboard de Comprador</h2>
            <p>Aquí puedes ver tus compras, tu historial y productos recomendados.</p>

            {/* Sección para solicitar convertirse en vendedor */}
            <SellerRequest />
        </div>
    );
};

export default BuyerDashboard;
