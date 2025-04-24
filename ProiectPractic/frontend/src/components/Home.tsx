import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./styles.css";

const Home = () => {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        try {
            const decoded: any = jwtDecode(token);
            setUsername(decoded.unique_name);
        } catch (error) {
            navigate("/");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const handleSetupTotp = () => {
        navigate("/setup-totp");
    };

    return (
        <div className="home-container">
            <h2>Welcome, {username}!</h2>
            <div className="home-actions">
                <div className="action-card">
                    <h3>Security Settings</h3>
                    <p>Enhance your account security by setting up two-factor authentication</p>
                    <button onClick={handleSetupTotp} className="primary-button">
                        Set Up QR Code Authentication
                    </button>
                </div>
            </div>
            <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
    );
};

export default Home;
