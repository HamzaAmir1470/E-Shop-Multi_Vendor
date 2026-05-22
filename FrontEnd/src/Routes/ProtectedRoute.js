import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
    const { loading, isAuthenticated } = useSelector((state) => state.user)

    if (loading) {
        return "Loading...";
    }

    if (!isAuthenticated) {
        window.location.href = '/login';
        return null;
    }

    return children
}
export default ProtectedRoute;