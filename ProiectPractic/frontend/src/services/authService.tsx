import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const login = async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    localStorage.setItem("token", response.data.token);
};

export const register = async (username: string, password: string) => {
    await axios.post(`${API_URL}/register`, { username, password });
};

export const logout = () => {
    localStorage.removeItem("token");
};
