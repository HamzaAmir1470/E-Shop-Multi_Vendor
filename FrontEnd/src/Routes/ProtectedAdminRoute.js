import { useSelector } from "react-redux";

const ProtectedAdminRoute = ({ children }) => {
    const { user, loading, isAuthenticated } = useSelector((state) => state.user)

    if (loading) {
        return "Loading...";
    }

    if (!isAuthenticated) {
        window.location.replace('/login');
        return null;
    } else if (user?.role !== "admin") {
        window.location.replace('/');
        return null;
    }

    return children
}
export default ProtectedAdminRoute;