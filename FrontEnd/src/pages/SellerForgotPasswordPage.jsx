import React from "react";
import ForgotPassword from "../components/Auth/ForgotPassword.jsx";

const SellerForgotPasswordPage = () => {
  return (
    <ForgotPassword
      title="Forgot your shop password?"
      description="Enter your seller email address and we will send a reset link."
      endpointPrefix="/shop"
      loginPath="/shop-login"
      buttonLabel="Send reset link"
    />
  );
};

export default SellerForgotPasswordPage;
