import "./ProductCard.css";

function ProductCardCarousel({ product }) {
    const backendUrl = "http://localhost:8000";
    const productImage = product.image 
        (product.image.startsWith('http') ? product.image : `${backendUrl}${product.image}`)
    return (
        <div className="product-card" style={{ cursor: "default" }}>
            <img 
                src={productImage} 
                alt={product.name} 
                className="product-real-image" 
            />
            <h3 className="product-name">{product.name}</h3>
            <p className="product-price">Precio: {product.price} €</p>
        </div>
    );
}

export default ProductCardCarousel;
