import { useState } from "react";
//import { useNavigate } from "react-router-dom";
import { Lock, User, Wifi } from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Request ke API Laravel
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        email: email,
        password: password,
      });

      // 2. Ambil token dari response JSON Laravel
      const token = response.data.access_token;

      // 3. Simpan token ke LocalStorage
      localStorage.setItem("token", token);

      // 4. Redirect ke Dashboard
      navigate("/");
    } catch (err) {
      // Tampilkan pesan error dari backend
      setError(err.response?.data?.message || "Login gagal.");
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
            WAN MONITOR
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
                Email Address
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="admin@wifi.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
