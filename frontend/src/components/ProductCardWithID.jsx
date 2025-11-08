import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

const ProductCardWithID = ({ product }) => {
    const navigate = useNavigate();

    const handleEditProduct = (event) => {
        event.stopPropagation();
        if (!product.id) {
            console.error("⚠️ El producto no tiene un ID válido:", product);
            return;
        }
        navigate(`/edit-product/${product.id}`);
    };
    

    return (
        <div className="product-card">
            <div
                className="product-image"
                style={{ backgroundImage: `url(${product.image})` }}
            ></div>
            <h3 className="product-name">{product.name}</h3>
            <p className="product-price">{product.price} €</p>
            <p className="product-id">ID: {product.id}</p>
            <button className="edit-button" onClick={handleEditProduct}>
                Editar Producto
            </button>
        </div>
    );
};

export default ProductCardWithID;
