import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [shopId, setShopId] = useState(null); // ID de la tienda activa

    const addToCart = (product) => {
        const productShopId = typeof product.shop === "object" ? product.shop.id : product.shop;

        if (shopId && productShopId !== shopId) {
            alert("Solo puedes añadir productos de una misma tienda. Vacía el carrito para cambiar de tienda.");
            return;
        }

        if (!shopId) {
            setShopId(productShopId); // Establece la tienda activa al primer producto
        }

        const safeQuantity = typeof product.quantity === "number" ? product.quantity : 1;

        setCartItems((prevItems) => {
            const exists = prevItems.find((item) => item.id === product.id);
            if (exists) {
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + safeQuantity }
                        : item
                );
            } else {
                return [...prevItems, { ...product, quantity: safeQuantity, shopId: productShopId }];
            }
        });
    };

    const updateQuantity = (productId, newQuantity) => {
        setCartItems((prevItems) => {
            if (newQuantity <= 0) {
                const updated = prevItems.filter((item) => item.id !== productId);
                if (updated.length === 0) {
                    setShopId(null); // Vacía el carrito: resetea la tienda
                }
                return updated;
            }
            return prevItems.map((item) =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            );
        });
    };

    const clearCart = () => {
        setCartItems([]);
        setShopId(null);
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, clearCart, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};
