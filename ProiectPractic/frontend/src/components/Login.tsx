import { useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import * as authService from "../services/authService";

const Login = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [totpCode, setTotpCode] = useState("");
    const [step, setStep] = useState(1);
    const [authMethod, setAuthMethod] = useState<"email" | "totp">("email");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await authService.login(usernameOrEmail, password);
            setStep(2);
        } catch (error) {
            alert("Authentication failed! Please check your credentials.");
        }
    };

    const handleVerification = async () => {
        try {
            await authService.verifyLoginCode(
                usernameOrEmail,
                usernameOrEmail,
                verificationCode
            );
            navigate("/home");
        } catch (error: unknown) {
            const err = error as AxiosError;
            alert(err.response?.data);
        }
    };

    const handleTotpLogin = async () => {
        try {
            await authService.loginWithTotp(usernameOrEmail, totpCode);
            navigate("/home");
        } catch (error: unknown) {
            const err = error as AxiosError;
            alert(err.response?.data);
        }
    };

    const goToRegister = () => {
        navigate("/register");
    };

    const selectAuthMethod = (method: "email" | "totp") => {
        setAuthMethod(method);
        setStep(3);
    };

    return (
        <div className="auth-container">
            {step === 1 ? (
                <>
                    <h2>Login</h2>
                    <div className="input-group">
                        <label>Username or Email</label>
                        <input type="text" placeholder="Username or Email" onChange={(e) => setUsernameOrEmail(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <button onClick={handleLogin}>Next</button>
                    <button onClick={goToRegister}>Register</button>
                </>
            ) : step === 2 ? (
                <>
                    <h2>Select Authentication Method</h2>
                    <div className="auth-methods">
                        <button onClick={() => selectAuthMethod("email")}>
                            Email Verification Code
                        </button>
                        <button onClick={() => selectAuthMethod("totp")}>
                            QR Code Authentication
                        </button>
                    </div>
                </>
            ) : authMethod === "email" ? (
                <>
                    <h2>Enter Email Verification Code</h2>
                    <div className="input-group">
                        <label>Verification Code</label>
                        <input type="text" placeholder="Enter Code" onChange={(e) => setVerificationCode(e.target.value)} />
                    </div>
                    <button onClick={handleVerification}>Verify</button>
                    <button onClick={() => setStep(2)}>Back</button>
                </>
            ) : (
                <>
                    <h2>Enter TOTP Code</h2>
                    <p>Open your authenticator app and enter the code shown for this account</p>
                    <div className="input-group">
                        <label>TOTP Code</label>
                        <input type="text" placeholder="Enter TOTP Code" onChange={(e) => setTotpCode(e.target.value)} />
                    </div>
                    <button onClick={handleTotpLogin}>Verify</button>
                    <button onClick={() => setStep(2)}>Back</button>
                </>
            )}
        </div>
    );
};

export default Login;
