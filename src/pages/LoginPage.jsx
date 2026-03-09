import { useState } from "react";
//import { useNavigate } from "react-router-dom";
import { Lock, User, Wifi } from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const LoginPage = () => {
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Reset error lama

    try {
      console.log("1. Mengirim Login...", { nik, password });

      const response = await axios.post('http://35.209.168.114/api/login', {
        nik: nik,
        password: password
      });

      console.log("2. Respon Server Raw:", response);

      // --- PERBAIKAN DI SINI ---
      // Kita ambil langsung dari response.data
      const data = response.data;
      
      // Ambil token. Sesuai log Anda, namanya adalah 'access_token'
      const token = data.access_token; 
      
      // Ambil user.
      const user = data.user;

      console.log("3. Token yang diambil:", token);
      console.log("4. User yang diambil:", user);

      // Cek Validasi
      if (!token) {
        throw new Error("Gagal: Backend mengirim respon, tapi 'access_token' tidak terbaca!");
      }

      // SIMPAN DATA
      localStorage.setItem('token', token);
      
      // Pastikan user.role ada, jika tidak, default ke 'teknisi' agar tidak error
      localStorage.setItem('role', user.role || 'teknisi'); 
      localStorage.setItem('name', user.name);
      
      console.log("5. Penyimpanan Berhasil. Redirecting...");
      
      // REDIRECT MANUAL
      window.location.href = '/';

    } catch (err) {
      console.error("ERROR LOGIN:", err);
      
      // Tampilkan pesan error spesifik agar kita tahu salahnya dimana
      if (err.response) {
        // Error dari Server (Password salah, dll)
        setError(err.response.data.message || 'Login Gagal dari Server');
      } else {
        // Error dari Kodingan React (Salah variabel)
        setError('Error Aplikasi: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header Login */}
        <div className="bg-blue-600 p-8 text-center">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Wifi className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Dashboard
          </h2>
          <p className="text-blue-100 mt-2 text-sm">
            Silakan login untuk mengakses dashboard
          </p>
        </div>

        {/* Form Login */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIK
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="masukan nik anda."
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200 shadow-md flex justify-center items-center"
            >
              {loading ? "Memproses..." : "Sign In"}
            </button>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                >
                  Daftar disini
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-500">
          &copy; 2026 Divisi Access Network. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
