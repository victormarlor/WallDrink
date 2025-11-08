import { useState, useEffect } from "react";
import { Search, Download } from "lucide-react";
import ProductCardWithID from "../components/ProductCardWithID";
import FilterTag from "../components/FilterTag";
import "./ProductsPage.css"; // solo conserva estilos no duplicados
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProductsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const itemsPerPage = 11;
    const maxFilters = 5;
    const maxFilterLength = 20;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    alert("Debes iniciar sesión para ver tus productos.");
                    return;
                }

                const response = await axios.get("http://localhost:8000/api/products/", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.status === 200) {
                    setProducts(response.data);
                }
            } catch (error) {
                console.error("❌ Error al obtener productos:", error);
                alert("Hubo un error al cargar los productos.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleSearch = () => {
        if (searchTerm.length > maxFilterLength) {
            alert(`El filtro no puede tener más de ${maxFilterLength} caracteres.`);
            return;
        }

        if (filters.length >= maxFilters) {
            alert(`No se pueden aplicar más de ${maxFilters} filtros a la vez.`);
            return;
        }

        if (searchTerm && !filters.includes(searchTerm)) {
            setFilters([...filters, searchTerm]);
            setSearchTerm("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    const removeFilter = (filter) => {
        setFilters(filters.filter((f) => f !== filter));
    };

    const filteredProducts = products.filter((product) => {
        return filters.every((filter) =>
            product.name.toLowerCase().includes(filter.toLowerCase())
        );
    });

    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredProducts.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="main-container">
            <div className="content-wrapper">
                <h1>Mis Productos</h1>

                <div className="header">
                    <button className="shop-edit-button" onClick={() => navigate('/store')}>Editar tienda</button>
                    <div className="button-group">
                        <button className="export-button">
                            Exportar Excel
                        </button>
                        <button className="export-button" onClick={() => navigate('/present-products')}>
                            Presentar
                        </button>
                    </div>
                </div>

                <div className="filters-section">
                    <div className="search-bar-wrapper">
                        <svg className="search-button" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.9383 8.21762C15.9383 9.92069 15.3853 11.4939 14.4538 12.7703L19.1521 17.4713C19.616 17.9351 19.616 18.6884 19.1521 19.1522C18.6882 19.6159 17.9348 19.6159 17.4709 19.1522L12.7727 14.4511C11.496 15.3861 9.92253 15.9352 8.21913 15.9352C3.95505 15.9352 0.5 12.4809 0.5 8.21762C0.5 3.95438 3.95505 0.5 8.21913 0.5C12.4832 0.5 15.9383 3.95438 15.9383 8.21762ZM8.21913 13.5606C8.92091 13.5606 9.61583 13.4224 10.2642 13.1539C10.9126 12.8854 11.5017 12.4918 11.9979 11.9957C12.4941 11.4995 12.8878 10.9105 13.1563 10.2623C13.4249 9.61405 13.5631 8.91927 13.5631 8.21762C13.5631 7.51597 13.4249 6.82119 13.1563 6.17295C12.8878 5.52472 12.4941 4.93571 11.9979 4.43957C11.5017 3.94343 10.9126 3.54987 10.2642 3.28136C9.61583 3.01285 8.92091 2.87465 8.21913 2.87465C7.51734 2.87465 6.82243 3.01285 6.17406 3.28136C5.5257 3.54987 4.93658 3.94343 4.44034 4.43957C3.9441 4.93571 3.55047 5.52472 3.2819 6.17295C3.01334 6.82119 2.87512 7.51597 2.87512 8.21762C2.87512 8.91927 3.01334 9.61405 3.2819 10.2623C3.55047 10.9105 3.9441 11.4995 4.44034 11.9957C4.93658 12.4918 5.5257 12.8854 6.17406 13.1539C6.82243 13.4224 7.51734 13.5606 8.21913 13.5606Z" />
                        </svg>
                        <input
                            className="search-bar"
                            type="text"
                            placeholder="Buscar productos por nombre o ID"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            maxLength={maxFilterLength}
                        />
                    </div>

                    <div className="pagination-controls">
                        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                            ◄◄
                        </button>
                        <span>Página {currentPage} de {Math.ceil(filteredProducts.length / itemsPerPage)}</span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage >= Math.ceil(filteredProducts.length / itemsPerPage)}
                        >
                            ►►
                        </button>
                    </div>

                    <div className="filters-container">
                        {filters.map((filter) => (
                            <FilterTag key={filter} filter={filter} removeFilter={removeFilter} />
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <p>Cargando productos...</p>
                ) : (
                    <div className="product-grid">
                        <div className="add-product-card" onClick={() => navigate('/add-product')}>
                            + Añadir Producto
                        </div>
                        {paginatedProducts.length > 0 ? (
                            paginatedProducts.map((product) => (
                                <ProductCardWithID key={product.id} product={product} />
                            ))
                        ) : (
                            <p>No tienes productos registrados.</p>
                        )}
                    </div>
                )}

                <div className="pagination-controls">
                    <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                        ◄◄
                    </button>
                    <span>Página {currentPage} de {Math.ceil(filteredProducts.length / itemsPerPage)}</span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage >= Math.ceil(filteredProducts.length / itemsPerPage)}
                    >
                        ►►
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
