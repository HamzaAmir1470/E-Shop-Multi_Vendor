import { useEffect, useRef } from "react";
import "./App.css";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";

import {
  LoginPage,
  ActivationPage,
  SignupPage,
  HomePage,
  ProductsPage,
  BestSellingPage,
  EventsPage,
  FAQPage,
  ProductDetailsPage,
  ProfilePage,
  CheckoutPage,
  OrderSuccessPage,
  ShopCreatePage,
  SellerActivationPage,
  ShopLoginPage,
} from "./Routes.js";

import { ShopHomePage } from "./ShopRoutes.js";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useSelector, useDispatch } from "react-redux";
import { loadUser, loadSeller } from "./redux/actions/user";

import ProtectedRoute from "./ProtectedRoute.jsx";
import SellerProtectedRoute from "./SellerProtectedRoute.jsx";


// Scroll to top
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);
  return null;
};


// Main Routes
const AppRoutes = ({ seller }) => (
  <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sign-up" element={<SignupPage />} />
      <Route path="/activation/:activation_token" element={<ActivationPage />} />
      <Route path="/seller/activation/:activation_token" element={<SellerActivationPage />} />

      {/* Store pages */}
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/product/:name" element={<ProductDetailsPage />} />
      <Route path="/best-selling" element={<BestSellingPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/faq" element={<FAQPage />} />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />

      <Route path="/order/success" element={<OrderSuccessPage />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />


      {/* Seller Routes */}
      <Route path="/shop-create" element={<ShopCreatePage />} />
      <Route path="/shop-login" element={<ShopLoginPage />} />

      {/* Fix /shop → redirect to shop/:id */}
      <Route
        path="/shop"
        element={
          seller?._id
            ? <Navigate to={`/shop/${seller._id}`} replace />
            : <Navigate to="/shop-login" replace />
        }
      />

      <Route
        path="/shop/:id"
        element={
          <SellerProtectedRoute>
            <ShopHomePage />
          </SellerProtectedRoute>
        }
      />
    </Routes>
  </>
);


const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading: userLoading, isAuthenticated } = useSelector((state) => state.user);
  const { loading: sellerLoading, isSeller, seller } = useSelector((state) => state.seller);

  const hasRedirected = useRef(false);

  // Load user & seller on first render
  useEffect(() => {
    dispatch(loadUser());
    dispatch(loadSeller());
  }, [dispatch]);


  // Redirect seller after login (only once)
  useEffect(() => {
    if (!sellerLoading && isSeller && seller?._id && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate(`/shop/${seller._id}`);
    }
  }, [sellerLoading, isSeller, seller, navigate]);


  if (userLoading || sellerLoading) return null;

  return (
    <>
      <AppRoutes seller={seller} />
      <ToastContainer position="bottom-center" autoClose={5000} theme="dark" />
    </>
  );
};

export default App;
