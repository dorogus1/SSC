import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios, { AxiosError } from "axios";

const VerifyEmail = () => {
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const email = new URLSearchParams(location.search).get("email");

    const handleVerify = async () => {
        if (!code) {
            setError("Te rugăm să introduci codul de verificare.");
            return;
        }

        try {
            await axios.post("http://localhost:5274/api/auth/verify-email", {
                email,
                VerificationCode: code
            });

            alert("Cont verificat! Acum te poți loga.");
            navigate("/");
        } catch (error: unknown) {
            const err = error as AxiosError;
            const errorMessage = err.response?.data
                ? typeof err.response?.data === "string"
                    ? err.response?.data
                    : JSON.stringify(err.response?.data)
                : "A apărut o eroare necunoscută";
            setError(errorMessage);
        }
    };

    return (
        <div className="auth-container">

            <h2>Verificare cont</h2>
            <p>Am trimis un cod pe email-ul tău {email}.</p>
            <p>Introdu-l mai jos:</p>
            <div className="input-group">
            <input
                type="text"
                placeholder="Cod de verificare"
                onChange={(e) => setCode(e.target.value)}
            />
            </div>
            <button onClick={handleVerify}>Verifică</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default VerifyEmail;
