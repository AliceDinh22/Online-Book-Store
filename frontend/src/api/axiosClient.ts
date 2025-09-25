import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:8080", // hoặc URL BE
    headers: { "Content-Type": "application/json" }
});

axiosClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("jwt");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            sessionStorage.clear();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
