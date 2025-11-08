// src/components/Shop/CreateShop.jsx

import React, { useState } from 'react';
import axios from 'axios';
import './CreateShop.css';

const CreateShop = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token'); // Suponiendo que usas JWT en el localStorage
            const response = await axios.post('http://127.0.0.1:8000/api/shops/', 
            { name, description, is_active: isActive },
            { headers: { Authorization: `Bearer ${token}` } });
            
            setMessage('Tienda creada con éxito');
            setName('');
            setDescription('');
            setIsActive(true);
        } catch (error) {
            setMessage('Error al crear la tienda');
            console.error(error);
        }
    };

    return (
        <div className="create-shop-container">
            <h2>Crear Tienda</h2>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Nombre:
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                </label>
                <label>
                    Descripción:
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                    />
                </label>
                <label>
                    Activo:
                    <input 
                        type="checkbox" 
                        checked={isActive} 
                        onChange={(e) => setIsActive(e.target.checked)} 
                    />
                </label>
                <button type="submit">Crear Tienda</button>
            </form>
        </div>
    );
};

export default CreateShop;
