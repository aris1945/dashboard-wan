import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // 1. Cek Login: Jika tidak ada token, tendang ke Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Cek Role: Jika role user tidak ada dalam daftar yang diizinkan
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    alert("Anda tidak memiliki akses ke halaman ini!"); // Opsional: Beri peringatan
    return <Navigate to="/dashboard" replace />; // Kembalikan ke dashboard atau halaman aman lainnya
  }

  // 3. Jika Lolos, tampilkan halaman yang diminta
  return children;
};

export default PrivateRoute;