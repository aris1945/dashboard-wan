import { useState, useEffect, useRef } from "react";
import {
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Menu, UserCircle, LogOut, ChevronDown } from "lucide-react";

// --- IMPORT HALAMAN ANDA ---
import TicketListPage from "./pages/TicketListPage";
import CreateTicketPage from "./pages/CreateTicketPage";
import LoginPage from "./pages/LoginPage";
// Import Sidebar
import Sidebar from "./components/Sidebar";
import RegisterPage from "./pages/RegisterPage";
import SitesPage from "./pages/SitesPage";
import OdcPage from "./pages/OdcPage";
import NearestOdpPage from "./pages/NearestOdpPage";
import AbsensiPage from "./pages/AbsensiPage";
import SpbuPage from "./pages/SpbuPage";
import DashboardPage from "./pages/DashboardPage";
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// --- KOMPONEN DUMMY (Untuk Halaman yang Belum Jadi) ---
const PlaceholderPage = ({ title }) => (
  <div className="p-8 rounded-xl shadow border text-center">
    <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
    <p className="text-gray-500">Halaman ini sedang dalam pengembangan.</p>
  </div>
);

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false); // State untuk Dropdown Profile

  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null); // Ref untuk klik di luar dropdown

  // Cek Login
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("name") || "User";
  const userRole = localStorage.getItem("role") || "Guest";

  const isLoginPage = location.pathname === "/login";

  // --- 1. DETEKSI UKURAN LAYAR ---
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setSidebarOpen(false);
      } else {
        setIsMobile(false);
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Event listener untuk menutup dropdown profile jika klik di luar
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- 2. FUNGSI LOGOUT ---
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Redirect jika belum login
  if (!token && !isLoginPage) return <Navigate to="/login" />;

  // Halaman Login Fullscreen
  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* --- SIDEBAR SECTION --- */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} />

      {/* --- MAIN CONTENT SECTION --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        {/* A. GLOBAL HEADER (Navbar) */}
        <header className="shadow-sm border-b h-16 flex items-center px-4 justify-between shrink-0 z-20">
          {/* KIRI: Tombol Toggle Sidebar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 focus:outline-none transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-gray-800 hidden md:block">
              WAN Monitor
            </h1>
          </div>

          {/* KANAN: User Profile & Logout (Dropdown) */}
          <div className="relative" ref={profileRef}>
            
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-50 transition focus:outline-none"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-700">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
              <UserCircle size={32} className="text-gray-400" />
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* DROPDOWN MENU */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl border z-50 py-1 animation-fade-in">
                {/* Info User di Mobile (karena di header disembunyikan) */}
                <div className="px-4 py-2 border-b md:hidden">
                  <p className="text-sm font-bold text-gray-800">{userName}</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} /> Keluar / Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* B. CONTENT AREA (Routing) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 relative">
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute
                  allowedRoles={[
                    "admin",
                    "helpdesk",
                    "hsa",
                    "korlap",
                    "teknisi",
                  ]}
                >
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            {/* Ticket System */}
            <Route path="/tickets" element={<TicketListPage />} />
            <Route path="/tickets/create" element={<CreateTicketPage />} />

            {/* Data Master (Placeholder) */}
            <Route path="/sites" element={<SitesPage />} />
            <Route path="/spbu" element={<SpbuPage />} />

            {/* Tools (Placeholder) */}
            <Route path="/odc" element={<OdcPage />} />
            <Route path="/odp-nearest" element={<NearestOdpPage />} />
            <Route path="/absensi" element={<AbsensiPage />} />

            {/* Lainnya (Placeholder) */}
            <Route
              path="/topology"
              element={<PlaceholderPage title="Topologi Jaringan" />}
            />
            <Route
              path="/settings"
              element={<PlaceholderPage title="Pengaturan Aplikasi" />}
            />

            {/* Fallback 404 */}
            <Route
              path="*"
              element={
                <div className="p-10 text-center text-gray-500">
                  Halaman tidak ditemukan (404)
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
