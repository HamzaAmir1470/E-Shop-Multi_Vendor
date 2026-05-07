import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { serverShop } from "../server";

const SellerActivationPage = () => {
    const { activation_token } = useParams();
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!activation_token) {
            setError(true);
            return;
        }

        // 🔒 StrictMode-safe lock
        const activationKey = `seller-activated-${activation_token}`;
        if (sessionStorage.getItem(activationKey)) {
            return;
        }

        sessionStorage.setItem(activationKey, "true");

        const activateSeller = async () => {
            try {
                await axios.post(`${serverShop}/shop/activation`, {
                    activation_token,
                });
                setSuccess(true);
            } catch (err) {
                setError(true);
            }
        };

        activateSeller();
    }, [activation_token]);

    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {error ? (
                <p>Your activation link is invalid or expired!</p>
            ) : success ? (
                <p>Your account has been created successfully!</p>
            ) : (
                <p>Activating your account...</p>
            )}
        </div>
    );
};

export default SellerActivationPage;
