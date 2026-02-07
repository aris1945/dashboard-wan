import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react'; // Hapus 'X' juga dari sini
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar */}
      {/* Kita tidak perlu pass toggleSidebar ke dalam Sidebar lagi */}
      <Sidebar isOpen={sidebarOpen} />

      {/* OVERLAY MOBILE: Ini yang menangani "klik bagian mana saja" */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden cursor-pointer" 
          onClick={() => setSidebarOpen(false)} // Klik overlay -> Tutup Sidebar
        ></div>
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm z-10 relative">
          <div className="flex items-center gap-3">
             {/* Tombol Hamburger: Bisa Buka/Tutup Sidebar di semua mode */}
             <button 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition focus:outline-none"
             >
                <Menu size={24} />
             </button>
             
             <span className="font-bold text-lg text-gray-800">WAN Dashboard</span>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;