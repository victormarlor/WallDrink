import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const PrivateRouteWithShop = ({ children }) => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("unauthorized");
      return;
    }

    axios.get("http://localhost:8000/api/shops/", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      setStatus(res.data.length > 0 ? "authorized" : "no-shop");
    }).catch((err) => {
      console.error("Error validando tienda:", err);
      setStatus("unauthorized");
    });
  }, []);

  if (status === "checking") return <p>Cargando...</p>;
  if (status === "unauthorized") return <Navigate to="/become-seller" />;
  if (status === "no-shop") return <Navigate to="/store" />;

  return children;
};

export default PrivateRouteWithShop;
