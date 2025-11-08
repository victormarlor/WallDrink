// Ruta: src/components/ShopCard.jsx
import { useNavigate } from "react-router-dom";
import "./ShopCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { useState } from "react";

const ShopCard = ({ shop }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const backendUrl = "http://localhost:8000";

  const mainImage =
    shop.images &&
    shop.images.length > 0 &&
    typeof shop.main_image_index === "number"
      ? `${backendUrl}${shop.images[shop.main_image_index]?.image}`
      : null; // O puedes usar una imagen por defecto si lo prefieres

  const handleViewShop = () => {
    navigate(`/shop/${shop.id}`);
  };

  return (
    <div className="shop-card">
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
        className="shop-image"
        style={{ backgroundImage: mainImage ? `url(${mainImage})` : "none" }}
      ></div>

      <h3 className="shop-name">{shop.name}</h3>
      <p className="shop-address">
        C/{shop.address}, {shop.city}
      </p>
      <p className="shop-address">({shop.province})</p>

      <button className="view-store-button" onClick={handleViewShop}>
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
};

export default ShopCard;
