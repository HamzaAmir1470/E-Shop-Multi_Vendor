import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ShopLogin from "../components/Shop/ShopLogin.jsx";

const ShopLoginPage = () => {
  const navigate = useNavigate();
  const { isSeller, seller, isLoading } = useSelector((state) => state.seller);

  useEffect(() => {
    if (isSeller && seller?._id) {
      navigate('/dashboard');
    }
  }, [isSeller, seller, navigate, isLoading]);

  return <ShopLogin />;
};

export default ShopLoginPage;
