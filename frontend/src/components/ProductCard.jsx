// Ruta: src/components/ProductCard.jsx
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { useState } from "react";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const distance = product?.distance ? product.distance.toFixed(1) : "N/D";

  const backendUrl = "http://localhost:8000";
  const productImage =
    product.image && typeof product.image === "string"
      ? (product.image.startsWith("http")
          ? product.image
          : `${backendUrl}${product.image}`)
      : null;

  const handleViewShop = () => {
    navigate(`/shop/${product.shop?.id}`); // accede a la tienda
  };

  return (
    <div className="product-card">
      <button
        className="favorite-button"
        onClick={(e) => {
          e.stopPropagation();
          setIsFavorite(!isFavorite);
        }}
      >
        <FontAwesomeIcon
          icon={isFavorite ? solidHeart : regularHeart}
          className={isFavorite ? "favorite-icon active" : "favorite-icon"}
        />
      </button>

      <div
        className="product-image"
        style={{ backgroundImage: productImage ? `url(${productImage})` : "none" }}
      ></div>

      <h3 className="product-name">{product.name}</h3>

      {product.shop && (
        <>
          <p className="product-shop-name">{product.shop.name}</p>
          <p className="product-shop-address">C/{product.shop.address}, {product.shop.city}</p>
          <p className="product-shop-address">({product.shop.province})</p>
        </>
      )}

      <p className="product-price">{product.price} €</p>
      <button
        className="view-store-button"
        onClick={(e) => {
          e.stopPropagation();
          handleViewShop();
        }}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
}

export default ProductCard;
