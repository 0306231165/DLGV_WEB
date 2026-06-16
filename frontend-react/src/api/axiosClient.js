import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Link tới Laravel của bạn
  headers: {
    'Content-Type': 'application/json',
  },
  
});

// REQUEST INTERCEPTOR: Gắn Token vào mỗi request (nếu có)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE INTERCEPTOR: Bóc tách lớp vỏ data của axios
axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    console.error("Lỗi API ngầm:", error); 
    throw error;
  }
);

export default axiosClient;