import axios from "axios";

const API_URL = "http://localhost:5274/api/auth";

export const login = async (usernameOrEmail: string, password: string) => {
    const response = await axios.post(`${API_URL}/login`, { usernameOrEmail, password });
    return response.data;
};

export const verifyLoginCode = async (email: string, username: string, verificationCode: string) => {
    const response = await axios.post(`${API_URL}/login_verification`, { 
        email, 
        username, 
        verificationCode 
    });
    localStorage.setItem("token", response.data.token);
    return response.data;
};

export const register = async (username: string, email: string, password: string) => {
    return await axios.post(`${API_URL}/register`, { username, email, password });
};

export const verifyEmail = async (email: string, verificationCode: string) => {
    return await axios.post(`${API_URL}/verify-email`, { email, verificationCode });
};

export const enableTotp = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");

    const response = await axios.post(
        `${API_URL}/enable-totp`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const verifyTotp = async (totpCode: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");

    const response = await axios.post(
        `${API_URL}/verify-totp`, 
        { totpCode }, 
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const loginWithTotp = async (usernameOrEmail: string, totpCode: string) => {
    const response = await axios.post(`${API_URL}/login-with-totp`, { 
        usernameOrEmail, 
        totpCode 
    });
    localStorage.setItem("token", response.data.token);
    return response.data;
};

export const logout = () => {
    localStorage.removeItem("token");
};
