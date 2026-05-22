import React from "react";
import ForgotPassword from "../components/Auth/ForgotPassword.jsx";

const ForgotPasswordPage = () => {
  return (
    <ForgotPassword
      title="Forgot your password?"
      description="Enter your email address and we will send you a reset link."
      endpointPrefix="/user"
      loginPath="/login"
      buttonLabel="Send reset link"
    />
  );
};

export default ForgotPasswordPage;
