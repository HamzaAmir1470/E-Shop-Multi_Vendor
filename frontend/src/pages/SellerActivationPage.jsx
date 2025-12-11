import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { server } from "../server";

const SellerActivationPage = () => {
    const { activation_token } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (activation_token) {
            const sendRequest = async () => {
                try {
                    const res = await axios.post(`${server}/shop/activation`, { activation_token });

                    if (res.data.success) {
                        setMessage(res.data.message || "Your account has been created successfully!");
                        setTimeout(() => navigate("/"), 2000);
                    }
                } catch (err) {
                    console.error("Activation error:", err);
                    setError(true);
                    setMessage(err.response?.data?.message || "Your token is expired or invalid!");
                }
            };
            sendRequest();
        } else {
            setError(true);
            setMessage("No activation token provided!");
        }
    }, [activation_token, navigate]);

    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: "20px",
            }}
        >
            {error ? (
                <div style={{ textAlign: "center" }}>
                    <h1 style={{ color: "#d32f2f", fontSize: "24px", marginBottom: "10px" }}>Activation Failed</h1>
                    <p style={{ fontSize: "16px", color: "#666" }}>{message}</p>
                </div>
            ) : (
                <div style={{ textAlign: "center" }}>
                    <h1 style={{ color: "#4caf50", fontSize: "24px", marginBottom: "10px" }}>Success!</h1>
                    <p style={{ fontSize: "16px", color: "#666" }}>{message || "Your account has been created successfully!"}</p>
                    <p style={{ fontSize: "14px", color: "#999", marginTop: "20px" }}>Redirecting to shop login...</p>
                </div>
            )}
        </div>
    );
};

export default SellerActivationPage;