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

        // 🔒 StrictMode-safe lock (Prevents double call execution)
        const activationKey = `seller-activated-${activation_token}`;
        if (sessionStorage.getItem(activationKey)) {
            return;
        }

        sessionStorage.setItem(activationKey, "true");

        const activateSeller = async () => {
            try {
                // ✅ Fixed: Removed the redundant "/shop" prefix to match our clean router path
                await axios.post(`${serverShop}/activation`, {
                    activation_token,
                });
                setSuccess(true);
            } catch (err) {
                console.error("Activation failed:", err?.response?.data?.message || err.message);
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
                backgroundColor: "#f9fafb",
                fontFamily: "sans-serif"
            }}
        >
            <div style={{ textAlign: "center", padding: "20px" }}>
                {error ? (
                    <p style={{ color: "#ef4444", fontSize: "1.25rem", fontWeight: "600" }}>
                        Your activation link is invalid or expired!
                    </p>
                ) : success ? (
                    <p style={{ color: "#22c55e", fontSize: "1.25rem", fontWeight: "600" }}>
                        Your shop account has been created successfully! 🎉
                    </p>
                ) : (
                    <p style={{ color: "#374151", fontSize: "1.25rem" }}>
                        Activating your shop account, please wait...
                    </p>
                )}
            </div>
        </div>
    );
};

export default SellerActivationPage;