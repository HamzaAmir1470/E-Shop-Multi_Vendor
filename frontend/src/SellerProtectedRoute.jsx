import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const SellerProtectedRoute = ({ children }) => {
  const { loading, isSeller } = useSelector((state) => state.seller);

  if (loading) return null; // or loader UI

  if (!isSeller) return <Navigate to="/shop-login" replace />;

  return children;
};

export default SellerProtectedRoute;
