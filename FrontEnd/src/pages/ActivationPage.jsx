import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../server";

const ActivationPage = () => {
  const { activation_token } = useParams();
  const [error, setError] = useState(false);
  const hasActivated = useRef(false);

  useEffect(() => {
    if (!activation_token || hasActivated.current) return;

    hasActivated.current = true;

    const activationEmail = async () => {
      try {
        await axios.post(`${server}/user/activation`, {
          activation_token,
        });
      } catch {
        setError(true);
      }
    };

    activationEmail();
  }, []);

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
      ) : (
        <p>Your account has been created successfully!</p>
      )}
    </div>
  );
};

export default ActivationPage;
