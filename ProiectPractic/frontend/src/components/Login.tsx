import { useState } from "react";
import axios, {AxiosError} from "axios";
import { useNavigate } from "react-router-dom";
import "./styles.css";

const Login = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await axios.post("http://localhost:5274/api/auth/login", {
                usernameOrEmail,
                password
            });
            setStep(2);
        } catch (error) {
            alert("Autentificare eșuată! Verificați datele introduse.");
        }
    };

    const handleVerification = async () => {
        try {
            const response = await axios.post("http://localhost:5274/api/auth/login_verification", {
                email: usernameOrEmail,
                verificationCode,
                username: usernameOrEmail
            });
            localStorage.setItem("token", response.data.token);
            navigate("/home");
        } catch (error: unknown) {
            const err = error as AxiosError;
            alert(err.response?.data);
        }
    };

    const goToRegister = () => {
        navigate("/register");
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
            ) : (
                <>
                    <h2>Enter Verification Code</h2>
                    <div className="input-group">
                        <label>Verification Code</label>
                        <input type="text" placeholder="Enter Code" onChange={(e) => setVerificationCode(e.target.value)} />
                    </div>
                    <button onClick={handleVerification}>Verify</button>
                </>
            )}
        </div>
    );
};

export default Login;
