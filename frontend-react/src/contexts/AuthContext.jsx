// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import authApi from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify token khi app khởi động
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .getMe()
      .then((data) => {
        setUser(data.user);
        setRole(data.role);
      })
      .catch((err) => {
        // Chỉ xóa token nếu KHÔNG phải lỗi network
        if (!err?.isNetworkError) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
        }
        // isNetworkError === true → server chưa bật → giữ token, không làm gì
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (token, role, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setUser(userData);
    setRole(role);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Kể cả server lỗi vẫn clear local
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setUser(null);
      setRole(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isLoggedIn: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
