import React from "react";
import ResetPassword from "../components/Auth/ResetPassword.jsx";

const SellerResetPasswordPage = () => {
  return (
    <ResetPassword
      title="Set a new shop password"
      description="Choose a new password for your seller account."
      endpointPrefix="/shop"
      successPath="/dashboard"
    />
  );
};

export default SellerResetPasswordPage;
