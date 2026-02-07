import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react'; // Hapus 'X' juga dari sini
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* Sidebar (Kiri) */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Konten Utama (Kanan) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header (Atas) */}
        <Header /> 

        {/* Isi Halaman (Tengah) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
};

export default DashboardLayout;