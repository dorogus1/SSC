import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import VerifyEmail from "./components/VerifyEmail";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path={"/verify"} element={<VerifyEmail />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
