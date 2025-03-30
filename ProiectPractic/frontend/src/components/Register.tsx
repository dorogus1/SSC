import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            await axios.post("http://localhost:5274/api/auth/register", {
                username,
                email,
                password
            });

            alert("Cont creat! Introdu codul de verificare primit pe email.");
            navigate(`/verify?email=${encodeURIComponent(email)}`);
        } catch (error: unknown) {
            const err = error as AxiosError;
            alert(err.response?.data);
        }
    };

    return (
        <div className="auth-container">
            <h2>Register</h2>
            <div className="input-group">
            <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleRegister}>Register</button>
            </div>
        </div>
    );
};

export default Register;
