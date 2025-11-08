import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StorePage.css';
import FilterTag from '../components/FilterTag';
import { ImagePlus } from 'lucide-react';

const StorePage = () => {
    const [shop, setShop] = useState(null);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [city, setCity] = useState('');
    const [province, setProvince] = useState('');
    const [country, setCountry] = useState('');
    const [reference, setReference] = useState('');
    const [label, setLabel] = useState('');
    const [filters, setFilters] = useState([]);
    const [images, setImages] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        
        const fetchShop = async () => {
            try {
                const token = localStorage.getItem('token');
        
                if (!token) {
                    console.error('No hay token de autenticación');
                    alert('Debes iniciar sesión para acceder a tu tienda.');
                    return;
                }
        
                const headers = {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                };
        
                console.log('Enviando solicitud GET con headers:', headers);
        
                const response = await axios.get('http://localhost:8000/api/shops/', { headers });
        
                if (response.status === 200 && response.data.length > 0) {
                    const shopData = response.data[0];
                    console.log('Tienda obtenida:', shopData);
                
                    setShop(shopData);
                    setName(shopData.name || '');
                    setAddress(shopData.address || '');
                    setPostalCode(shopData.postal_code || '');
                    setCity(shopData.city || '');
                    setProvince(shopData.province || '');
                    setCountry(shopData.country || '');
                    setReference(shopData.reference || '');
                
                    if (shopData.images && shopData.images.length > 0) {
                        const processedImages = shopData.images.map(img =>
                            typeof img === "string" ? img : img.image
                        );
                        setImages(processedImages);
                        setMainImage(shopData.main_image_index !== undefined ? shopData.main_image_index : 0);
                    } else {
                        setImages([]);
                    }
                
                    if (shopData.filters && Array.isArray(shopData.filters)) {
                        setFilters(shopData.filters);
                    } else {
                        setFilters([]);
                    }
                } else {
                    console.log("🆕 Usuario aún no tiene tienda. Mostrando formulario vacío.");
                    // No seteamos nada, los useState iniciales ya están vacíos
                }
                
            } catch (error) {
                console.error('Error al obtener la tienda:', error);
                if (error.response) {
                    console.error('Respuesta del servidor:', error.response.data);
                }
                alert('No se pudo cargar la tienda.');
            }
        };
        
        
    
        fetchShop();
    }, []);

    const handleAddFilter = () => {
        if (label && !filters.includes(label) && filters.length < 5) {
            setFilters([...filters, label]);
            setLabel('');
        }
    };

    const removeFilter = (filter) => {
        setFilters(filters.filter((f) => f !== filter));
    };


    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        if (images.length + files.length <= 3) {
            const updatedImages = [...images, ...files];
            setImages(updatedImages);
            if (mainImage === null || mainImage >= updatedImages.length) {
                setMainImage(0);
            }            
        } else {
            alert('Puedes subir un máximo de 3 imágenes.');
        }
    };

    const handleRemoveImage = (index) => {
        const updatedImages = [...images];
        updatedImages.splice(index, 1);
        setImages(updatedImages);

        if (mainImage === index) {
            setMainImage(updatedImages.length > 0 ? 0 : null);
        } else if (mainImage > index) {
            setMainImage(mainImage - 1);
        }
    };

    const handleSetMainImage = (index) => {
        console.log("🖼 Cambiando imagen principal a:", index);
        
        if (index >= 0 && index < images.length) {
            setMainImage(index);
        } else {
            console.warn("❌ Índice de imagen fuera de rango:", index);
        }
    };
    

    const handleSaveStore = async () => {
        if (!name || !address || !postalCode || !city || !province || !country) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }
    
        setIsLoading(true);
    
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('address', address);  // Asegurar que el campo se llama "address"
            formData.append('postal_code', postalCode);
            formData.append('city', city);
            formData.append('province', province);
            formData.append('country', country);

            // Si hay referencia, agregarla
            if (reference.trim() !== "") {
                formData.append('reference', reference);
            }

            // Agregar etiquetas (filters)
            if (filters.length > 0) {
                filters.forEach((filter, index) => {
                    formData.append(`filters[${index}]`, filter);
                });
            }
    
            // 🔄 Convierte URLs de imágenes en archivos File
            const convertImageUrlToFile = async (url, index) => {
                const response = await fetch(url);
                const blob = await response.blob();
                return new File([blob], `image_${index}.jpg`, { type: blob.type });
            };

            // 🧠 Convierte todas las imágenes (Files o URLs)
            const imageFiles = await Promise.all(
                images.map((img, index) => {
                    if (typeof img === 'string') {
                        return convertImageUrlToFile(img, index);
                    }
                    return Promise.resolve(img);
                })
            );

            // 📦 Agrega imágenes convertidas al formData
            imageFiles.forEach((file) => {
                formData.append('images[]', file);
            });
            formData.append('main_image_index', mainImage);

            // Obtener el token del usuario
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Debes iniciar sesión para modificar la tienda.');
                return;
            }

            // Verificar que el token contiene un ID de usuario válido
            try {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            } catch (error) {
                console.error('Token JWT inválido o malformado:', error);
                alert('Error con la autenticación, intenta iniciar sesión nuevamente.');
                return;
            }

    
            // Verificar exactamente qué datos se están enviando
            console.log('Datos enviados al backend:', Object.fromEntries(formData.entries()));
    
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            };
            console.log("Etiquetas enviadas al backend:", filters);
            console.log("Imágenes enviadas al backend:", images);

            // Verificar si los datos realmente están en formData antes de enviarlos
            console.log("Etiquetas en formData antes de enviar:", formData.getAll("filters[]"));
            console.log("Imágenes en formData antes de enviar:", formData.getAll("images[]"));

            console.log("Datos enviados al backend:", Object.fromEntries(formData.entries()));
                 
            console.log("Verificando formData antes de enviar:");
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }            

            let response;

            if (shop && shop.id) {
                response = await axios.patch(`http://localhost:8000/api/shops/${shop.id}/`, formData, { headers });
            } else {
                response = await axios.post('http://localhost:8000/api/shops/', formData, { headers });
            }
            
            if (response.status === 200 || response.status === 201) {
                setMessage('Tienda guardada correctamente.');
                console.log('Tienda guardada correctamente:', response.data);
            } else {
                console.error('Respuesta inesperada:', response);
                setMessage('No se pudo guardar la tienda.');
            }
            
    
        } catch (error) {
            if (error.response) {
                console.error('Error de respuesta del servidor:', error.response.data);
                alert(`Error del servidor: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                console.error('Sin respuesta del servidor:', error.request);
            } else {
                console.error('Error durante la solicitud:', error.message);
            }
            setMessage('No se pudo modificar la tienda.');
        } finally {
            setIsLoading(false);
        }
    };
    
       
    
    return (
        <div className="main-container">
            <div className="content-wrapper">
                <h1>Mi Local</h1>
                {message && <p className="message-success">{message}</p>}
                <div className="store-form-container">
                    <div className="image-upload-section">
                        <div className="image-preview">
                        <label className="image-placeholder">
                            {mainImage !== null && images.length > 0 && images[mainImage] && (
                                <img 
                                    src={
                                        images[mainImage] instanceof File 
                                            ? URL.createObjectURL(images[mainImage]) 
                                            : (typeof images[mainImage] === "string" ? images[mainImage] : "")
                                    } 
                                    alt="Imagen principal" 
                                />
                            )}

                            <ImagePlus size={100} className={`image-icon ${mainImage !== null ? 'has-image' : ''}`} />
                            <input 
                                className="file-input" 
                                type="file" 
                                onChange={handleImageUpload} 
                                accept="image/*" 
                                multiple 
                            />
                        </label>
                        </div>
                        <div className="image-thumbnails">
                            {images.length > 0 && images.map((image, index) => (
                                <div key={index} className={`thumbnail ${mainImage === index ? 'selected' : ''}`}>
                                    {image && (
                                        <img 
                                            src={typeof image === "string" ? image : URL.createObjectURL(image)} 
                                            alt="Imagen" 
                                            onClick={() => handleSetMainImage(index)} 
                                        />
                                    )}
                                    <button className="delete-button" onClick={() => handleRemoveImage(index)}>✕</button>
                                </div>
                            ))}

                        </div>
                    </div>
                    <div className="form-section">
                        <p>Detalles del Local</p>
                        <input 
                            type="text" 
                            placeholder="Nombre del Local" 
                            value={name || ""} 
                            onChange={(e) => setName(e.target.value)} 
                            maxLength="100" 
                            required 
                        />
                        <div className="filters-input">
                            <input 
                                type="text" 
                                placeholder="Etiqueta" 
                                value={label} 
                                onChange={(e) => {
                                    if (e.target.value.length <= 20) {  // ✅ Limita a 20 caracteres
                                        setLabel(e.target.value);
                                    }
                                }} 
                                onKeyDown={(e) => e.key === 'Enter' && handleAddFilter()} 
                                maxLength="20" // ✅ Máximo de 20 caracteres en HTML
                            />
                            <button onClick={handleAddFilter}>+</button>
                        </div>
                        <div className="filters-list">
                            {filters.map((filter, index) => (
                                <FilterTag key={filter} filter={filter} removeFilter={removeFilter} />
                            ))}
                        </div>

                        <p>Dirección del Local</p>
                        <input 
                            type="text" 
                            placeholder="Calle y Número" 
                            value={address || ""} 
                            onChange={(e) => setAddress(e.target.value)} 
                            maxLength="150" 
                            required 
                        />
                        <div className="address-row">
                            <input 
                                type="text" 
                                placeholder="Código Postal" 
                                value={postalCode || ""} 
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,5}$/.test(value)) {
                                        setPostalCode(value);
                                    }                                    
                                }} 
                                maxLength="5" 
                                required 
                            />
                            <input 
                                type="text" 
                                placeholder="Ciudad" 
                                value={city || ""} 
                                onChange={(e) => setCity(e.target.value)} 
                                maxLength="50" 
                                required 
                            />
                        </div>
                        <div className="address-row">
                            <input 
                                type="text" 
                                placeholder="Provincia/Estado" 
                                value={province || ""} 
                                onChange={(e) => setProvince(e.target.value)} 
                                maxLength="50" 
                                required 
                            />
                            <input 
                                type="text" 
                                placeholder="País" 
                                value={country || ""} 
                                onChange={(e) => setCountry(e.target.value)} 
                                maxLength="50" 
                                required 
                            />   
                        </div>
                        {isLoading ? (
                            <p>Cargando...</p>
                        ) : (
                            <button 
                                className="save-button" 
                                onClick={handleSaveStore} 
                                disabled={isLoading}
                            >
                                Guardar Cambios
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
    
};

export default StorePage;
