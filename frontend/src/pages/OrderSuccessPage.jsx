import React from "react";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Lottie from "react-lottie";
// import animationData from "../Assests/animations/107043-success.json";

const OrderSuccessPage = () => {
    return (
        <div>
            <Header />
            <Success />
            <Footer />
        </div>
    );
};

const Success = () => {
    return (
        <div className="flex flex-col items-center mt-10">
            <div className="success-animation">
                <svg viewBox="0 0 130 130">
                    <circle className="circle" cx="65" cy="65" r="60" />
                    <polyline className="check" points="40,70 58,88 92,48" />
                </svg>
            </div>

            <h5 className="text-center mb-14 text-[25px] text-[#000000a1]">
                Your order is successful 😍
            </h5>
        </div>
    );
};


export default OrderSuccessPage;