import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ImagePlus, ChevronRight } from "lucide-react";
import FilterTag from "../components/FilterTag";
import "./ProductForm.css";

const ProductForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1);
  const [autoFluctuation, setAutoFluctuation] = useState(false);
  const [fluctuationRules, setFluctuationRules] = useState([]);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [filters, setFilters] = useState([]);
  const [label, setLabel] = useState("");

  const [showEditSection, setShowEditSection] = useState(true);
  const [showFluctuationSection, setShowFluctuationSection] = useState(false);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`http://localhost:8000/api/products/${productId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const product = response.data;
          setName(product.name || "");
          setDescription(product.description || "");
          setPrice(product.price ?? 0);
          setStock(product.stock ?? 0);
          setMinPrice(product.min_price ?? 0);
          setMaxPrice(product.max_price > 0 ? product.max_price : product.price + 1);
          setAutoFluctuation(product.auto_fluctuation === true);
          setFluctuationRules(Array.isArray(product.fluctuation_rules) ? product.fluctuation_rules : []);
          setFilters(Array.isArray(product.filters) ? product.filters : []);
          setImagePreview(product.image || null);
        } catch (err) {
          alert("Error al cargar el producto");
          navigate("/productos");
        }
      };

      fetchProduct();
    }
  }, [productId, navigate]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddFilter = () => {
    if (label && !filters.includes(label) && filters.length < 3) {
      setFilters([...filters, label]);
      setLabel("");
    }
  };

  const removeFilter = (filter) => {
    setFilters(filters.filter((f) => f !== filter));
  };

  const toggleFluctuation = () => {
    setAutoFluctuation(!autoFluctuation);
    setShowFluctuationSection(!autoFluctuation);
    const numericPrice = parseFloat(price) || 0;
    if (!autoFluctuation) {
      setMinPrice(Number(Math.max(0, numericPrice - 1)).toFixed(2));
      setMaxPrice(Number(numericPrice + 1).toFixed(2));
    }
  };

  const addFluctuationRule = () => {
    if (fluctuationRules.length >= 10) return;
    setFluctuationRules([
      ...fluctuationRules,
      {
        type: "ventas",
        value: 1,
        period: "días",
        periodAmount: 1,
        priceChange: 0,
      },
    ]);
  };

  const updateFluctuationRule = (index, key, value) => {
    const updatedRules = [...fluctuationRules];
    updatedRules[index][key] = value;
    setFluctuationRules(updatedRules);
  };

  const removeFluctuationRule = (index) => {
    setFluctuationRules(fluctuationRules.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name || !description || !price || !imagePreview) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("min_price", minPrice);
    formData.append("max_price", maxPrice);
    formData.append("autoFluctuation", autoFluctuation ? 1 : 0);

    if (image) formData.append("image", image);
    filters.forEach((filter, i) => {
      formData.append(`filters[${i}]`, filter);
    });
    formData.append("fluctuationRules", JSON.stringify(fluctuationRules));

    try {
      const token = localStorage.getItem("token");
      let response;
      if (productId) {
        response = await axios.put(`http://localhost:8000/api/products/${productId}/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await axios.post("http://localhost:8000/api/products/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if ([200, 201].includes(response.status)) {
        navigate("/productos");
      }
    } catch (error) {
      console.error("❌ Error al guardar:", error.response?.data || error);
      alert("Error al guardar el producto.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`http://localhost:8000/api/products/${productId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 204) navigate("/productos");
      else alert("No se pudo eliminar el producto.");
    } catch (error) {
      console.error("❌ Error al eliminar:", error);
      alert("Error al intentar eliminar el producto.");
    }
  };

  return (
    <div className="main-container">
      <div className="content-wrapper">
        <h1 className="title">{productId ? "Editar Producto" : "Añadir Producto"}</h1>

        <div className="product-form-container">
          <label className="image-preview">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
            {imagePreview ? (
              <img src={imagePreview} alt="Vista previa" className="uploaded-image" />
            ) : (
              <ImagePlus size={64} color="#E6FA4D" />
            )}
          </label>

          <div className="form-fields">

            <button onClick={() => setShowEditSection(!showEditSection)} className="toggle-section-button">
              <span>Editar producto</span>
              <ChevronRight className={`chevron-icon ${showEditSection ? "open" : ""}`} />
            </button>
            <div className="section-divider"></div>

            {showEditSection && (
              <>
                <div className="field">
                  <label>Nombre del Producto</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="field">
                  <label>Descripción</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="field">
                  <label>Etiqueta</label>
                  <div className="filters-input">
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddFilter()}
                      maxLength={20}
                    />
                    <button onClick={handleAddFilter}>+</button>
                  </div>
                  <div className="filters-list">
                    {filters.map((filter) => (
                      <FilterTag key={filter} filter={filter} removeFilter={removeFilter} />
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>Precio (€)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} step="0.01" min="0" />
                </div>
                <div className="field">
                  <label>Stock</label>
                  <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} min="0" />
                </div>
              </>
            )}

                <div className="field checkbox-field">
                <label className="custom-checkbox-label">
                    <input type="checkbox" checked={autoFluctuation} onChange={toggleFluctuation} />
                    <span className="custom-checkbox"></span>
                    Activar Fluctuación
                </label>
                </div>

            {autoFluctuation && (
              <>
                <button onClick={() => setShowFluctuationSection(!showFluctuationSection)} className="toggle-section-button">
                  <span>Fluctuación automática</span>
                  <ChevronRight className={`chevron-icon ${showFluctuationSection ? "open" : ""}`} />
                </button>
                <div className="section-divider"></div>

                {showFluctuationSection && (
                  <>
                    <div className="field">
                      <label>Precio Mínimo (€)</label>
                      <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} step="0.01" />
                    </div>
                    <div className="field">
                      <label>Precio Máximo (€)</label>
                      <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} step="0.01" />
                    </div>
                    <div className="field">
                        <button type="button" onClick={addFluctuationRule} className="add-rule-button">
                            Añadir Variable
                        </button>

                    </div>
                    {fluctuationRules.map((rule, index) => (
                        <div key={index} className="fluctuation-card">
                        <button className="remove-rule" type="button" onClick={() => removeFluctuationRule(index)}>✕</button>

                        <div className="field">
                            <label>Tipo</label>
                            <select value={rule.type} onChange={(e) => updateFluctuationRule(index, "type", e.target.value)}>
                            <option value="ventas">Compras</option>
                            <option value="popularidad">Visitas</option>
                            </select>
                        </div>

                        <div className="field">
                            <label>{rule.type === "ventas" ? "Compras" : "Visitas"}</label>
                            <input type="number" value={rule.value} onChange={(e) => updateFluctuationRule(index, "value", e.target.value)} />
                        </div>

                        <div className="field">
                            <label>Tiempo</label>
                            <div style={{ display: "flex", gap: "10px" }}>
                            <input
                                type="number"
                                value={rule.periodAmount}
                                onChange={(e) => updateFluctuationRule(index, "periodAmount", e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <select
                                value={rule.period}
                                onChange={(e) => updateFluctuationRule(index, "period", e.target.value)}
                                style={{ flex: 2 }}
                            >
                                <option value="segundos">Segundos</option>
                                <option value="minutos">Minutos</option>
                                <option value="horas">Horas</option>
                                <option value="días">Días</option>
                                <option value="semanas">Semanas</option>
                                <option value="meses">Meses</option>
                            </select>
                            </div>
                        </div>

                        <div className="field">
                            <label>Ajuste de Precio (€)</label>
                            <input
                            type="number"
                            step="0.01"
                            value={rule.priceChange}
                            onChange={(e) => updateFluctuationRule(index, "priceChange", e.target.value)}
                            />
                        </div>
                        </div>

                    ))}
                  </>
                )}
              </>
            )}

            <button className="save-changes" onClick={handleSave}>
              Guardar Cambios
            </button>

            {productId && (
              <button className="delete-product" onClick={handleDelete}>
                Eliminar Producto
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
