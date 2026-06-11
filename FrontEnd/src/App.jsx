import React, { useMemo, useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { LoginPage, SignupPage, ActivationPage, HomePage, ProductPage, BestSellingPage, EventsPage, FAQPage, OrderSuccessPage, ProductDetailsPage, ProfilePage, Checkoutpage, Paymentpage, ShopCreatePage, SellerActivationPage, ShopLoginPage, ForgotPasswordPage, SellerForgotPasswordPage, ResetPasswordPage, SellerResetPasswordPage, OrderDetailsPage, TrackOrderPage, UserInbox } from './Routes/Routes.js'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import Store from './redux/store.js';
import { loadSeller, loadUser } from './redux/actions/user.js';
import ProtectedRoute from './Routes/ProtectedRoute.js';
import { ShopHomePage, ShopDashboardPage, ShopCreateProductPage, ShopAllProducts, ShopCreateEvents, ShopAllEvents, ShopAllCoupouns, ShopPreviewPage, ShopAllOrders, ShopOrderDetails, ShopRefundsPage, ShopAllRefunds, ShopSettingsPage, ShopWithdrawMoneyPage, ShopInboxPage } from './Routes/ShopRoutes.js';
import { AdminDashboardPage , AdminDashboardUsers, AdminDashboardSellers} from './Routes/AdminRoutes.js'
import SellerProtectedRoute from './Routes/SellerProtectedRoute.jsx'
import { getAllProducts } from './redux/actions/product.js';
import { getAllEvents } from './redux/actions/event.js';
import { server } from './server.js';
import axios from 'axios';
import ProtectedAdminRoute from './Routes/ProtectedAdminRoute.js';
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

const App = () => {
  const [stripeApiKey, setStripeApiKey] = useState("");

  async function getStripeApiKey() {
    try {
      const { data } = await axios.get(`${server}/payment/stripeapikey`);
      setStripeApiKey(data?.stripeApikey || "");
    } catch (error) {
      console.error("Unable to load Stripe API key:", error);
      setStripeApiKey("");
    }
  }

  useEffect(() => {
    Store.dispatch(loadUser());
    Store.dispatch(loadSeller());
    Store.dispatch(getAllProducts());
    Store.dispatch(getAllEvents());
    getStripeApiKey();
  }, []);

  const stripePromise = useMemo(() => {
    return stripeApiKey ? loadStripe(stripeApiKey) : Promise.resolve(null);
  }, [stripeApiKey]);

  // Wrapper for routes that need Stripe context. Do not block route rendering.
  const StripeWrapper = ({ children }) => {
    return (
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    );
  };

  return (
    <>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          hideProgressBar={false}
          newestOnTop={false}
          style={{ zIndex: 99999 }}
        />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/sign-up" element={<SignupPage />} />
          <Route path="/activation/:activation_token" element={<ActivationPage />} />
          <Route path="/seller/activation/:activation_token" element={<SellerActivationPage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkoutpage />
            </ProtectedRoute>
          } />

          {/* Payment route with Stripe wrapper */}
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <StripeWrapper>
                  <Paymentpage />
                </StripeWrapper>
              </ProtectedRoute>
            }
          />

          <Route path="/shop/preview/:id" element={<ShopPreviewPage />} />
          <Route path="/best-selling" element={<BestSellingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/order/success/:id" element={<OrderSuccessPage />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inbox"
            element={
              <ProtectedRoute>
                <UserInbox />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/order/:id"
            element={
              <ProtectedRoute>
                <OrderDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/track/order/:id"
            element={
              <ProtectedRoute>
                <TrackOrderPage />
              </ProtectedRoute>
            }
          />

          {/* Shop routes */}
          <Route path="/shop-create" element={<ShopCreatePage />} />
          <Route path="/shop-login" element={<ShopLoginPage />} />
          <Route path="/seller/forgot-password" element={<SellerForgotPasswordPage />} />
          <Route path="/seller/reset-password/:token" element={<SellerResetPasswordPage />} />

          <Route
            path="/shop/:id"
            element={
              <SellerProtectedRoute>
                <ShopHomePage />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <SellerProtectedRoute>
                <ShopSettingsPage />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <SellerProtectedRoute>
                <ShopDashboardPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard-refunds"
            element={
              <SellerProtectedRoute>
                <ShopAllRefunds />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/dashboard-create-product"
            element={
              <SellerProtectedRoute>
                <ShopCreateProductPage />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/dashboard-products"
            element={
              <SellerProtectedRoute>
                <ShopAllProducts />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard-orders"
            element={
              <SellerProtectedRoute>
                <ShopAllOrders />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard-refunds"
            element={
              <SellerProtectedRoute>
                <ShopRefundsPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/order/:id"
            element={
              <SellerProtectedRoute>
                <ShopOrderDetails />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/dashboard-create-event"
            element={
              <SellerProtectedRoute>
                <ShopCreateEvents />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/dashboard-events"
            element={
              <SellerProtectedRoute>
                <ShopAllEvents />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/dashboard-coupons"
            element={
              <SellerProtectedRoute>
                <ShopAllCoupouns />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/dashboard-withdraw-money"
            element={
              <SellerProtectedRoute>
                <ShopWithdrawMoneyPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard-messages"
            element={
              <SellerProtectedRoute>
                <ShopInboxPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboardPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin-users"
            element={
              <ProtectedAdminRoute>
                <AdminDashboardUsers />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin-sellers"
            element={
              <ProtectedAdminRoute>
                <AdminDashboardSellers />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </Router>
    </>
  )
}

export default App