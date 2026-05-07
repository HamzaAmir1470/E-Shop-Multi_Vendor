import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "../components/Layout/Loader";

const SellerProtectedRoute = ({ children }) => {
    const { isLoading, isSeller } = useSelector((state) => state.seller);

    // Show loader while checking authentication
    if (isLoading) {
        return <Loader />;
    }

    // Redirect if not a seller
    if (!isSeller) {
        return <Navigate to="/" replace />;
    }

    // Return children if authenticated as seller
    return children;
};

export default SellerProtectedRoute;