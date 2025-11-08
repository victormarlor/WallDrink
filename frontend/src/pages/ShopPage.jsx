import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ShopPage.css";
import FilterTag from "../components/FilterTag";
import { CartContext } from "../context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons"; // ✅ Importa el corazón relleno
import Footer from "../components/Footer"

const ShopPage = () => {
    const { shopId } = useParams();
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false); // ✅ Estado para el corazón

    const { addToCart, updateQuantity, cartItems } = useContext(CartContext);

    const backendUrl = "http://localhost:8000";

    const resolveImageUrl = (img) =>
        typeof img === "string"
            ? `${backendUrl}${img}`
            : `${backendUrl}${img?.image}`;

    useEffect(() => {
        const fetchShopAndProducts = async () => {
            try {
                const [shopRes, productsRes] = await Promise.all([
                    axios.get(`${backendUrl}/api/public-shops/${shopId}/`),
                    axios.get(`${backendUrl}/api/public-products/?shop=${shopId}`),
                ]);

                if (shopRes.status === 200) {
                    setShop(shopRes.data);
                    setMainImageIndex(shopRes.data.main_image_index || 0);
                }

                if (productsRes.status === 200) {
                    setProducts(productsRes.data);
                }
            } catch (error) {
                console.error("Error al cargar la tienda o productos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchShopAndProducts();
    }, [shopId]);

    if (loading) return <p className="main-container">Cargando tienda...</p>;
    if (!shop) return <p className="main-container">Tienda no encontrada</p>;

    const mainImage =
        shop.images &&
        shop.images.length > 0 &&
        typeof mainImageIndex === "number"
            ? resolveImageUrl(shop.images[mainImageIndex])
            : null;

    return (
        <div className="main-container">
            <div className="content-wrapper shop-grid">
                <div className="shop-left-column">
                    <div className="shop-main-image-wrapper">
                        <div
                            className="shop-page-image"
                            style={{
                                backgroundImage: `url(${mainImage})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        ></div>
                        <button
                            className="shop-favorite-button"
                            onClick={() => setIsFavorite(!isFavorite)}
                        >
                            <FontAwesomeIcon
                                icon={isFavorite ? solidHeart : regularHeart}
                                className={`shop-favorite-icon ${isFavorite ? "active" : ""}`}
                            />
                        </button>
                    </div>

                    {shop.images.length > 1 && (
                        <div className="shop-thumbnails">
                            {shop.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`thumbnail ${mainImageIndex === idx ? "selected" : ""}`}
                                    onClick={() => setMainImageIndex(idx)}
                                >
                                    <img src={resolveImageUrl(img)} alt={`Imagen ${idx + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="shop-right-column">
                    <div className="shop-info">
                        <h2>{shop.name}</h2>
                        <p>{shop.address}</p>
                        <p>{shop.city}, {shop.postal_code} ({shop.province}, {shop.country})</p>
                            <div className="shop-filters-container">
                            {shop.filters.map((tag, idx) => (
                                <span key={idx} className="shop-tag">{tag}</span>
                            ))}
                            </div>
                    </div>

                    <div className="shop-product-list-container">
                        <h2>Productos</h2>
                        <div className="shop-product-list">
                            {products.map((product) => {
                                const cartItem = cartItems.find((item) => item.id === product.id);
                                return (
                                    <div
                                        className="shop-product-item"
                                        key={product.id}
                                        onClick={() => navigate(`/product/${product.id}`)}
                                    >
                                        <div className="shop-product-details">
                                            <div className="shop-product-image">
                                                {product.image ? (
                                                    <img src={resolveImageUrl(product.image)} alt={product.name} />
                                                ) : (
                                                    <div className="placeholder">Sin imagen</div>
                                                )}
                                            </div>
                                            <div className="shop-product-info">
                                                <h3>{product.name}</h3>
                                                <p>{product.description}</p>
                                            </div>
                                        </div>
                                        <div className="shop-product-price">
                                            <span>{product.price} €</span>
                                            {cartItem ? (
                                                <div className="shop-quantity-control">
                                                    <button
                                                        className="shop-action-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateQuantity(product.id, cartItem.quantity - 1);
                                                        }}
                                                    >
                                                        -
                                                    </button>
                                                    <span>{cartItem.quantity}</span>
                                                    <button
                                                        className="shop-action-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateQuantity(product.id, cartItem.quantity + 1);
                                                        }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="shop-action-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(product);
                                                    }}
                                                >
                                                    +
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <Footer></Footer>
        </div>
    );
};

export default ShopPage;
