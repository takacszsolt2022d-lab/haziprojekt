import axios from "axios";

const baseURL = "http://localhost:5000/api";

export const axiosPublic = axios.create({
    baseURL,
    withCredentials: true,
});

export const axiosPrivate = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});
