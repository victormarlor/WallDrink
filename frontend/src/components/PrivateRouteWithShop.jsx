import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const PrivateRouteWithShop = ({ children }) => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const checkAccess = async () => {
      const token = localStorage.getItem('token');
      if (!token) return setStatus("unauthorized");

      try {
        const userResponse = await axios.get('http://localhost:8000/api/user/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userResponse.data.role !== 'seller') {
          setStatus("unauthorized");
          return;
        }

        const shopResponse = await axios.get('http://localhost:8000/api/shops/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStatus(shopResponse.data.length > 0 ? "authorized" : "no-shop");
      } catch (err) {
        console.error("Error validando acceso con tienda:", err);
        setStatus("unauthorized");
      }
    };

    checkAccess();
  }, []);

  if (status === "checking") return <p>Cargando...</p>;
  if (status === "unauthorized") return <Navigate to="/become-seller" />;
  if (status === "no-shop") return <Navigate to="/store" />;

  return children;
};

export default PrivateRouteWithShop;
