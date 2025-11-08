import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import ShopCard from "../components/ShopCard";
import ProductCard from "../components/ProductCard";
import FilterTag from "../components/FilterTag";
import PopularFilter from "../components/PopularFilter";
import axios from "axios";
import grafica from "../assets/grafica.png";
import Footer from "../components/Footer";
import "./HomePage.css";
import { 
    faSun, 
    faUtensils, 
    faBurger, 
    faDrumstickBite, 
    faLeaf, 
    faPizzaSlice, 
    faFish, 
    faBowlRice, 
    faBreadSlice, 
    faSeedling, 
    faStore,
    faMugSaucer,
    faBeerMugEmpty
} from "@fortawesome/free-solid-svg-icons";

const HomePage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState([]);
    const [searchMode, setSearchMode] = useState("stores");
    const [currentPage, setCurrentPage] = useState(1);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPopular, setSelectedPopular] = useState([]);

    const itemsPerPage = 12;
    const maxFilters = 5;
    const maxFilterLength = 20;

    const popularFilters = [
        { label: "Burguer", faIcon: faBurger },
        { label: "Pollo frito", faIcon: faDrumstickBite },
        { label: "Pizza", faIcon: faPizzaSlice },
        { label: "Vegano", faIcon: faLeaf },
        { label: "Asiático", faIcon: faBowlRice },
        { label: "Italiano", faIcon: faUtensils },
        { label: "Pescado", faIcon: faFish },
        { label: "Sin gluten", faIcon: faBreadSlice },
        { label: "Ecológico", faIcon: faSeedling },
        { label: "Desayunos", faIcon: faMugSaucer },
        { label: "Terraza", faIcon: faSun },
        { label: "Restaurante", faIcon: faUtensils },
        { label: "Bar", faIcon: faBeerMugEmpty},
        { label: "Chiringuito", faIcon: faStore},

    ];


    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const endpoint = searchMode === "stores"
                ? "http://localhost:8000/api/public-shops/"
                : "http://localhost:8000/api/public-products/";

            const response = await axios.get(endpoint, { headers });

            if (response.status === 200) {
                setItems(response.data);
            } else {
                console.error("Error al obtener datos:", response);
            }
        } catch (error) {
            console.error("Error al obtener datos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [searchMode]);

    useEffect(() => {
        const container = document.querySelector(".popular-filters-container");
        if (!container) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        const startDragging = (e) => {
            isDown = true;
            container.classList.add("dragging");
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        };

        const stopDragging = () => {
            isDown = false;
            container.classList.remove("dragging");
        };

        const drag = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 1.2;
            container.scrollLeft = scrollLeft - walk;
        };

        container.addEventListener("mousedown", startDragging);
        container.addEventListener("mouseleave", stopDragging);
        container.addEventListener("mouseup", stopDragging);
        container.addEventListener("mousemove", drag);

        return () => {
            container.removeEventListener("mousedown", startDragging);
            container.removeEventListener("mouseleave", stopDragging);
            container.removeEventListener("mouseup", stopDragging);
            container.removeEventListener("mousemove", drag);
        };
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

    const togglePopularFilter = (label) => {
        if (selectedPopular.includes(label)) {
            setSelectedPopular(selectedPopular.filter((f) => f !== label));
        } else {
            setSelectedPopular([...selectedPopular, label]);
        }
    };

    const filteredItems = items.filter((item) => {
        const allFilters = [...filters, ...selectedPopular];
        const filterMatch = allFilters.every((filter) => {
            if (searchMode === "stores") {
                return (
                    item.name.toLowerCase().includes(filter.toLowerCase()) ||
                    item.city?.toLowerCase().includes(filter.toLowerCase()) ||
                    item.filters?.some(tag =>
                        tag.toLowerCase().includes(filter.toLowerCase())
                    )
                );
            } else {
                return (
                    item.name.toLowerCase().includes(filter.toLowerCase()) ||
                    item.description?.toLowerCase().includes(filter.toLowerCase())
                );
            }
        });
        return filterMatch;
    });

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <div className="main-container homepage-gradient">
            <div className="light-overlay"></div>
            <img src={grafica} alt="decoración" className="light-overlay-bottom" />
            <div className="content-wrapper">
                <section className="hero-section">
                    <div className="hero-text">
                        <h1>Fluctuación de precios</h1>
                        <p className="description">Los precios de los productos se ajustan en tiempo real según la demanda, se adaptan automáticamente a las fluctuaciones del mercado.</p>
                        <button className="call-to-action">Empezar</button>
                    </div>
                </section>

                <section className="invitation-text-section">
                    <p className="invitation-text">¡Bienvenido a Walldrink!</p>
                    <p className="subscribe-text">Inicia sesión o regístrate para empezar a disfrutar de Walldrink y de tus bebidas en tus locales favoritos.</p>
                </section>

                <section className="filters-section">
                    <div className="search-mode">
                        <button className={`toggle-button ${searchMode === "stores" ? "active" : "inactive"}`} onClick={() => setSearchMode("stores")}>Local</button>
                        <button className={`toggle-button ${searchMode === "products" ? "active" : "inactive"}`} onClick={() => setSearchMode("products")}>Producto</button>
                    </div>

                    <div className="search-bar-wrapper">
                        <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.9383 8.21762C15.9383 9.92069 15.3853 11.4939 14.4538 12.7703L19.1521 17.4713C19.616 17.9351 19.616 18.6884 19.1521 19.1522C18.6882 19.6159 17.9348 19.6159 17.4709 19.1522L12.7727 14.4511C11.496 15.3861 9.92253 15.9352 8.21913 15.9352C3.95505 15.9352 0.5 12.4809 0.5 8.21762C0.5 3.95438 3.95505 0.5 8.21913 0.5C12.4832 0.5 15.9383 3.95438 15.9383 8.21762ZM8.21913 13.5606C8.92091 13.5606 9.61583 13.4224 10.2642 13.1539C10.9126 12.8854 11.5017 12.4918 11.9979 11.9957C12.4941 11.4995 12.8878 10.9105 13.1563 10.2623C13.4249 9.61405 13.5631 8.91927 13.5631 8.21762C13.5631 7.51597 13.4249 6.82119 13.1563 6.17295C12.8878 5.52472 12.4941 4.93571 11.9979 4.43957C11.5017 3.94343 10.9126 3.54987 10.2642 3.28136C9.61583 3.01285 8.92091 2.87465 8.21913 2.87465C7.51734 2.87465 6.82243 3.01285 6.17406 3.28136C5.5257 3.54987 4.93658 3.94343 4.44034 4.43957C3.9441 4.93571 3.55047 5.52472 3.2819 6.17295C3.01334 6.82119 2.87512 7.51597 2.87512 8.21762C2.87512 8.91927 3.01334 9.61405 3.2819 10.2623C3.55047 10.9105 3.9441 11.4995 4.44034 11.9957C4.93658 12.4918 5.5257 12.8854 6.17406 13.1539C6.82243 13.4224 7.51734 13.5606 8.21913 13.5606Z" />
                        </svg>
                        <input
                            className="search-bar"
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            maxLength={maxFilterLength}
                        />
                    </div>

                    <div className="filters-container">
                        {filters.map((filter) => (
                            <FilterTag key={filter} filter={filter} removeFilter={removeFilter} />
                        ))}
                    </div>
                    <p className="popular-filters-text">Filtros Populares</p>
                    <div className="popular-filters-container">
                        {popularFilters.map((filter) => (
                            <PopularFilter
                                key={filter.label}
                                label={filter.label}
                                faIcon={filter.faIcon}
                                active={selectedPopular.includes(filter.label)}
                                onClick={() => togglePopularFilter(filter.label)}
                            />
                        ))}
                    </div>
                </section>

                <div className="pagination-controls">
                    <button onClick={handlePreviousPage} disabled={currentPage === 1}>◄</button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button onClick={handleNextPage} disabled={currentPage >= totalPages}>►</button>
                </div>

                <section className="product-grid">
                    {loading ? (
                        <p>Cargando contenido...</p>
                    ) : paginatedItems.length > 0 ? (
                        paginatedItems.map((item) =>
                            searchMode === "stores" ? (
                                <ShopCard key={item.id} shop={item} onClick={() => navigate(`/shop/${item.id}`)} />
                            ) : (
                                <ProductCard key={item.id} product={item} onClick={() => navigate(`/product/${item.id}`)} />
                            )
                        )
                    ) : (
                        <p>No se encontraron resultados.</p>
                    )}
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default HomePage;