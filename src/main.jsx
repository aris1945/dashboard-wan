import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios' // <--- 1. Pastikan import axios ada di sini

// --- 2. KONFIGURASI AXIOS (Interceptor) ---

// REQUEST INTERCEPTOR:
// Tugasnya: Mengecek saku (localStorage) sebelum mengirim surat (Request).
// Kalau ada token, tempelkan stiker "Authorization: Bearer ..." di amplopnya.
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
// Tugasnya: Menangani balasan dari Laravel.
// Kalau Laravel bilang "401 Unauthenticated" (Token basi/palsu),
// otomatis hapus token di browser dan tendang user ke halaman Login.
axios.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token'); // Hapus token yang sudah tidak berlaku
    window.location.href = '/login';  // Paksa pindah ke halaman login
  }
  return Promise.reject(error);
});

// ------------------------------------------

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)