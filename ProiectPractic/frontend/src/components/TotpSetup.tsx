import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import "./styles.css";

const TotpSetup = () => {
    const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
    const [secretKey, setSecretKey] = useState<string | null>(null);
    const [totpCode, setTotpCode] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const generateQrCode = async () => {
            try {
                setIsLoading(true);
                const response = await authService.enableTotp();
                setQrCodeBase64(response.qrCodeBase64);
                setSecretKey(response.secretKey);
                setIsLoading(false);
            } catch (error) {
                setError("Failed to generate QR code. Please make sure you are logged in.");
                setIsLoading(false);
            }
        };

        generateQrCode();
    }, []);

    const handleVerify = async () => {
        try {
            await authService.verifyTotp(totpCode);
            setIsVerified(true);
        } catch (error) {
            setError("Failed to verify TOTP code. Please try again.");
        }
    };

    const handleGoToHome = () => {
        navigate("/home");
    };

    if (isLoading) {
        return (
            <div className="auth-container">
                <h2>Setting up Two-Factor Authentication</h2>
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="auth-container">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={handleGoToHome}>Go to Home</button>
            </div>
        );
    }

    if (isVerified) {
        return (
            <div className="auth-container">
                <h2>Two-Factor Authentication Enabled</h2>
                <p>You have successfully set up two-factor authentication for your account.</p>
                <button onClick={handleGoToHome}>Go to Home</button>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <h2>Set Up Two-Factor Authentication</h2>
            <p>Scan the QR code below with your authenticator app (like Google Authenticator, Authy, etc.)</p>
            
            {qrCodeBase64 && (
                <div className="qr-code-container">
                    <img 
                        src={`data:image/png;base64,${qrCodeBase64}`} 
                        alt="QR Code for TOTP setup" 
                    />
                </div>
            )}
            
            {secretKey && (
                <div className="secret-key-container">
                    <p>If you can't scan the QR code, enter this secret key manually in your app:</p>
                    <code>{secretKey}</code>
                </div>
            )}
            
            <div className="input-group">
                <label>Enter the 6-digit code from your authenticator app</label>
                <input 
                    type="text" 
                    placeholder="Enter 6-digit code" 
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    maxLength={6}
                />
            </div>
            
            <button onClick={handleVerify}>Verify and Enable</button>
            <button onClick={handleGoToHome}>Cancel</button>
        </div>
    );
};

export default TotpSetup;