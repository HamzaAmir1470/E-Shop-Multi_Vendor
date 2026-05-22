import React from "react";
import ResetPassword from "../components/Auth/ResetPassword.jsx";

const ResetPasswordPage = () => {
  return (
    <ResetPassword
      title="Set a new password"
      description="Choose a new password for your user account."
      endpointPrefix="/user"
      successPath="/"
    />
  );
};

export default ResetPasswordPage;
