import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Server, Settings, Network, Search, 
  MapPin, Fuel, Ticket, ChevronDown, ChevronRight, 
  ListChecks, PlusCircle, Database, Wrench, Calendar // Pastikan semua icon terimport
} from 'lucide-react';

// --- DATA MENU ---
const MENU_ITEMS = [
  { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, allowedRoles: ['admin', 'helpdesk', 'teknisi','hsa','korlap'] },
  
  // TICKET SYSTEM
  { 
    name: 'Ticket System', 
    icon: <Ticket size={20} />,
    // Parent boleh diakses semua, tapi anaknya nanti difilter
    allowedRoles: ['admin', 'helpdesk', 'teknisi','hsa','korlap'], 
    submenu: [
      // Teknisi TIDAK ADA di sini, jadi otomatis tersembunyi
      { name: 'Buat Tiket', path: '/tickets/create', icon: <PlusCircle size={18} />, allowedRoles: ['admin', 'helpdesk'] },
      { name: 'List Tiket', path: '/tickets', icon: <ListChecks size={18} />, allowedRoles: ['admin', 'helpdesk', 'teknisi','hsa','korlap'] },
    ]
  },

  // DATA MASTER
  { 
    name: 'Data Master', 
    icon: <Database size={20} />,
    allowedRoles: ['admin','helpdesk','teknisi'], // Hanya Admin yang bisa lihat grup ini
    submenu: [
      { name: 'Data Site Node-B', path: '/sites', icon: <Server size={18} /> },
      { name: 'Data SPBU', path: '/spbu', icon: <Fuel size={18} /> },
    ]
  },

  // TOOLS
  {
    name: 'Tools',
    icon: <Wrench size={20} />,
    allowedRoles: ['admin', 'helpdesk', 'teknisi'],
    submenu: [
        { name: 'Cari ODC', path: '/odc', icon: <Search size={20} /> },
        { name: 'ODP Terdekat', path: '/odp-nearest', icon: <MapPin size={20} /> },
        { name: 'Cek Absensi', path: '/absensi', icon: <Calendar size={20} /> },
    ]
  },

  // LAINNYA
  { name: 'Topologi', path: '/topology', icon: <Network size={20} />, allowedRoles: ['admin', 'helpdesk', 'teknisi'] },
  { name: 'Pengaturan', path: '/settings', icon: <Settings size={20} />, allowedRoles: ['admin', 'helpdesk', 'teknisi'] },
];

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  
  // 1. AMBIL ROLE DARI LOCALSTORAGE
  // Default ke string kosong jika tidak ada, agar tidak error
  const userRole = localStorage.getItem('role') || ''; 

  // --- LOGIKA FILTERING MENU ---
  // Fungsi untuk mengecek apakah user punya izin
  const checkAccess = (item) => {
    // Jika menu tidak punya properti allowedRoles, anggap boleh diakses semua orang
    if (!item.allowedRoles) return true;
    // Cek apakah role user ada di dalam daftar yang diizinkan
    return item.allowedRoles.includes(userRole);
  };

  const toggleSubmenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <div 
      className={`dark:bg-black
        fixed inset-y-0 left-0 z-40 bg-slate-900 text-white 
        transform transition-all duration-300 ease-in-out
        border-r border-slate-700 shadow-xl overflow-y-auto custom-scrollbar
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 
        ${isOpen ? 'md:w-64' : 'md:w-0 md:overflow-hidden'}
      `}
    >
      <div className="flex items-center justify-center h-16 bg-slate-800 border-b border-slate-700 whitespace-nowrap sticky top-0 z-10">
        <span className="text-xl font-bold tracking-wider text-blue-400">Dashboard</span>
      </div>

      <nav className="mt-5 px-3 pb-20 whitespace-nowrap">
        {MENU_ITEMS.map((item, index) => {
          
          // 2. CEK IZIN PARENT
          if (!checkAccess(item)) return null;

          // --- RENDER MENU DENGAN SUBMENU ---
          if (item.submenu) {
            
            // 3. FILTER ANAKNYA (SUBMENU)
            // Hanya tampilkan anak yang allowedRoles-nya sesuai dengan userRole
            const visibleSubmenu = item.submenu.filter(subItem => checkAccess(subItem));

            // PENTING: Jika setelah difilter anaknya kosong semua, 
            // sembunyikan induknya (Parent) sekalian.
            if (visibleSubmenu.length === 0) return null;

            const isExpanded = openMenu === item.name;
            const isParentActive = visibleSubmenu.some(sub => location.pathname === sub.path);

            return (
              <div key={index} className="mb-2">
                <button
                  onClick={() => toggleSubmenu(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isParentActive 
                      ? 'bg-slate-800 text-blue-400' 
                      : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3 min-w-[20px]">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {/* Render Anak yang Sudah Difilter (visibleSubmenu) */}
                <div 
                  className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${isExpanded ? 'max-h-64 opacity-100 mt-1' : 'max-h-0 opacity-0'}
                  `}
                >
                  <div className="bg-slate-950 rounded-lg py-1 ml-4 border-l-2 border-slate-700">
                    {visibleSubmenu.map((subItem, subIndex) => {
                      const isSubActive = location.pathname === subItem.path;
                      return (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            isSubActive 
                              ? 'text-blue-400 font-bold bg-slate-900' 
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          <span className="mr-2">{subItem.icon}</span>
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          // --- RENDER MENU TUNGGAL ---
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="mr-3 min-w-[20px]">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;