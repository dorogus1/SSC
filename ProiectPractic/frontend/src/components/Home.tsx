import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


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

    return (
        <div>
            <h2>Bine ai venit, {username}!</h2>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Home;
