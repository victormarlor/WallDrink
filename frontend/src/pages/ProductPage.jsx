import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ProductPage.css";
import { CartContext } from "../context/CartContext";

const ProductPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const { addToCart, updateQuantity, cartItems } = useContext(CartContext);

    const backendUrl = "http://localhost:8000";

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/public-products/${productId}/`);
                if (response.status === 200) {
                    setProduct(response.data);
                }
            } catch (error) {
                console.error("Error al obtener el producto:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    if (loading) return <div className="main-container">Cargando producto...</div>;
    if (!product) return <div className="main-container">Producto no encontrado</div>;

    const cartItem = cartItems.find((item) => item.id === product.id);

    return (
        <div className="main-container">
            <div className="content-wrapper">
                <div className="product-page-container">
                    <div className="product-page-image">
                        {product.image ? (
                            <img src={`${backendUrl}${product.image}`} alt={product.name} />
                        ) : (
                            <div className="placeholder">Sin imagen</div>
                        )}
                    </div>

                    <div className="product-page-details">
                        <h1>{product.name}</h1>
                        <p className="product-description">{product.description}</p>
                        <p className="product-price">{product.price} €</p>
                        <p className="product-stock">Stock disponible: {product.stock}</p>

                        {cartItem ? (
                            <div className="product-quantity-control">
                                <button onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}>-</button>
                                <span>{cartItem.quantity}</span>
                                <button onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}>+</button>
                            </div>
                        ) : (
                            <button className="add-to-cart" onClick={() => addToCart(product)}>
                                Añadir al carrito
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
