import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// --- 1. IMPORT BROWSER ROUTER (WAJIB) ---
import { BrowserRouter } from 'react-router-dom' 

// --- 2. KONFIGURASI AXIOS (Interceptor Tetap Sama) ---

// REQUEST INTERCEPTOR:
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// RESPONSE INTERCEPTOR:
axios.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token'); 
    window.location.href = '/login';  
  }
  return Promise.reject(error);
});

// ------------------------------------------

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 3. BUNGKUS APP DENGAN BROWSER ROUTER */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)