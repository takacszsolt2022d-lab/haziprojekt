import { createContext, useState, useEffect, useContext } from "react";
import { axiosPublic, axiosPrivate } from "../api/axios";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyRefreshToken = async () => {
            try {
                const response = await axiosPublic.post("/auth/refresh-token");
                setAccessToken(response.data.accessToken);
                setUser(response.data.user);
            } catch (err) {
                setUser(null);
                setAccessToken(null);
            } finally {
                setLoading(false);
            }
        };

        verifyRefreshToken();
    }, []);

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            (config) => {
                if (!config.headers["Authorization"] && accessToken) {
                    config.headers["Authorization"] = `Bearer ${accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error),
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            (response) => response,
            async (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 401 && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    try {
                        const res = await axiosPublic.post("/auth/refresh-token");
                        const newAccessToken = res.data.accessToken;
                        setAccessToken(newAccessToken);
                        prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                        return axiosPrivate(prevRequest);
                    } catch (refreshError) {
                        setUser(null);
                        setAccessToken(null);
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            },
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        };
    }, [accessToken]);

    const login = (userData, token) => {
        setUser(userData);
        setAccessToken(token);
    };

    const logout = async () => {
        try {
            await axiosPublic.post("/auth/logout");
        } finally {
            setUser(null);
            setAccessToken(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
