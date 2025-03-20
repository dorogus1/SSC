import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post("http://localhost:5274/api/auth/login", {
                usernameOrEmail: username,
                password
            });
            localStorage.setItem("token", response.data.token);
            navigate("/home");
        } catch (error) {
            alert("Autentificare eșuată!");
        }
    };
    const goToRegister = () => {
        navigate("/register");
    };
    return (
        <div>
            <h2>Login</h2>
            <h2>Le vreau le vreau</h2>
            <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
            <button onClick={goToRegister}>Register</button>

        </div>
    );
};



export default Login;
