import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, FileText, Store, Search } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/NavBar';
import './Dashboard.css';
import CreateShop from '../components/Shop/CreateShop';

const Dashboard = () => {
    const [role, setRole] = useState(null);
    const [hasShop, setHasShop] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.warn("No se encontró un token en localStorage");
                    navigate("/login");
                    return;
                }
    
                const response = await axios.get("http://127.0.0.1:8000/api/user/", {
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                if (response.status === 200) {
                    const userRole = response.data.role;
                    setRole(userRole);
    
                    // Solo redirigir si estás en la raíz del dashboard
                    if (window.location.pathname === "/dashboard") {
                        navigate(`/dashboard/${userRole}`);
                    }
                } else {
                    navigate("/login");
                }
            } catch (error) {
                console.error("Error al obtener el perfil del usuario:", error);
                navigate("/login");
            }
        };
    
        fetchUserProfile();
    }, [navigate]);
    
    

    if (!role) {
        return <p>Cargando el dashboard...</p>;
    }

    return (
        <div className="main-container">
            <div className="content-wrapper">
                <h1 className="dashboard-title">Panel de Control</h1>
                <div className="dashboard-grid">
                    <div className="dashboard-card" onClick={() => navigate('/dashboard/products')}>
                        <Image className="dashboard-icon" />
                        <p>Mis Productos</p>
                    </div>
                    <div className="dashboard-card" onClick={() => navigate('/dashboard/orders')}>
                        <FileText className="dashboard-icon" />
                        <p>Mis Pedidos</p>
                    </div>
                    <div className="dashboard-card" onClick={() => navigate('/dashboard/store')}>
                        <Store className="dashboard-icon" />
                        <p>Mi Local</p>
                    </div>
                    <div className="dashboard-card" onClick={() => navigate('/?scrollToSearch=true')}>
                        <Search className="dashboard-icon" />
                        <p>Buscar</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
