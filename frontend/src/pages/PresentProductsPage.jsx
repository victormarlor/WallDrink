import { useState, useEffect } from "react";
import "./PresentProductsPage.css";
import ProductCardCarousel from "../components/ProductCardCarousel";
import axios from "axios";

const PresentProductsPage = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:8000/api/products/", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.status === 200) {
                    setProducts(response.data);
                }
            } catch (error) {
                console.error("Error al cargar productos:", error);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="present-page">
            <div className="slider-wrapper">
                <div className="slider-content">
                    {products.concat(products).map((product, index) => (
                        <div className="slide" key={index}>
                            <ProductCardCarousel product={product} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="market-table">
                <table>
                    <tbody>
                        {products.reduce((rows, product, index) => {
                            if (index % 3 === 0) {
                                rows.push([product]);
                            } else {
                                rows[rows.length - 1].push(product);
                            }
                            return rows;
                        }, []).map((row, idx) => (
                            <tr key={idx}>
                                {row.map((product) => (
                                    <td key={product.id} className="product-cell">
                                        <div className="product-info">
                                            <div className="product-name">{product.name}</div>
                                            <div className="product-price">{Number(product.price).toFixed(2)} €</div>
                                        </div>
                                    </td>
                                ))}
                                {Array.from({ length: 3 - row.length }).map((_, emptyIdx) => (
                                    <td key={`empty-${emptyIdx}`}></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PresentProductsPage;
