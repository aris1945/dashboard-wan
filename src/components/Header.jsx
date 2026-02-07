import { useState, useEffect } from 'react';
import { User, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import axios from 'axios';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: 'User',
    role: 'Guest'
  });

  // Ambil data user saat komponen dimuat
  useEffect(() => {
    const name = localStorage.getItem('user_name');
    const role = localStorage.getItem('role');
    
    if (name || role) {
      setUserData({
        name: name || 'User',
        role: role || 'Guest'
      });
    }
  }, []);

  // Fungsi Logout
  const handleLogout = async () => {
    try {
      // Opsional: Request ke backend untuk hapus token di database
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post('http://127.0.0.1:8000/api/logout', {}, {
             headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      // WAJIB: Hapus data di LocalStorage browser
      localStorage.clear();
      // Redirect ke halaman login
      window.location.href = '/login';
    }
  };

  return (
    <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-6 z-30">
      
      {/* Kiri: Judul Halaman atau Breadcrumb (Bisa dikosongi dulu) */}
      <h2 className="text-xl font-semibold text-gray-800 hidden md:block">
        Dashboard Overview
      </h2>

      {/* Kanan: Profil User */}
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 focus:outline-none hover:bg-gray-50 p-2 rounded-lg transition"
        >
          {/* Info Text */}
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-700">{userData.name}</p>
            <p className="text-xs text-blue-600 font-medium uppercase">{userData.role}</p>
          </div>

          {/* Avatar Icon */}
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <UserCircle size={28} />
          </div>
          
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-1 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 border-b md:hidden">
              <p className="text-sm font-bold text-gray-900">{userData.name}</p>
              <p className="text-xs text-gray-500 capitalize">{userData.role}</p>
            </div>
            
            <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
              <User size={16} /> Profile Saya
            </a>
            
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}

        {/* Backdrop Transparan untuk menutup dropdown saat klik di luar */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-[-1]" 
            onClick={() => setIsOpen(false)}
          ></div>
        )}
      </div>
    </header>
  );
};

export default Header;