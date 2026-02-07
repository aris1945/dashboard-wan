import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Server, Settings, Network, Search, 
  MapPin, Fuel, Router, Ticket, ChevronDown, ChevronRight, 
  ListChecks, PlusCircle, Database, Wrench, Calendar // <--- Import Database Icon
} from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
  
  // --- SUB-MENU: TICKET SYSTEM ---
  { 
    name: 'Ticket System', 
    icon: <Ticket size={20} />,
    submenu: [
      { name: 'Buat Tiket', path: '/tickets/create', icon: <PlusCircle size={18} /> },
      { name: 'List Tiket', path: '/tickets', icon: <ListChecks size={18} /> },
    ]
  },

  // --- SUB-MENU: DATA MASTER (Grup Baru) ---
  { 
    name: 'Data Master', 
    icon: <Database size={20} />,
    submenu: [
      { name: 'Data Site Node-B', path: '/sites', icon: <Server size={18} /> },
      { name: 'Data SPBU', path: '/spbu', icon: <Fuel size={18} /> },
      
    ]
  },

{
	name: 'Tools',
	icon: <Wrench size={20} />,
	submenu: [
		{ name: 'Cari ODC', path: '/odc', icon: <Search size={20} /> },
  { name: 'ODP Terdekat', path: '/odp-nearest', icon: <MapPin size={20} /> },
{ name: 'Cek Absensi', path: '/absensi', icon: <Calendar size={20} /> },
	
]


},

  // ----------------------------------------
  
  // Menu Single Lainnya
  
  { name: 'Topologi', path: '/topology', icon: <Network size={20} /> },
  { name: 'Pengaturan', path: '/settings', icon: <Settings size={20} /> },
];

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  // Efek: Auto-expand menu jika URL aktif ada di dalamnya
  useEffect(() => {
    MENU_ITEMS.forEach(item => {
      if (item.submenu) {
        const isChildActive = item.submenu.some(sub => location.pathname === sub.path);
        if (isChildActive) {
          // Hanya set jika belum ada yang terbuka (agar tidak konflik saat navigasi cepat)
          setOpenMenu(prev => prev === item.name ? prev : item.name);
        }
      }
    });
  }, [location.pathname]);

  const toggleSubmenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <div 
      className={`
        fixed inset-y-0 left-0 z-40 bg-slate-900 text-white 
        transform transition-all duration-300 ease-in-out
        border-r border-slate-700 shadow-xl overflow-y-auto custom-scrollbar
        
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 
        ${isOpen ? 'md:w-64' : 'md:w-0 md:overflow-hidden'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-center h-16 bg-slate-800 border-b border-slate-700 whitespace-nowrap sticky top-0 z-10">
        <span className="text-xl font-bold tracking-wider text-blue-400">WAN MONITOR</span>
      </div>

      <nav className="mt-5 px-3 pb-20 whitespace-nowrap">
        {MENU_ITEMS.map((item, index) => {
          
          // --- RENDER MENU DENGAN SUBMENU ---
          if (item.submenu) {
            const isExpanded = openMenu === item.name;
            const isParentActive = item.submenu.some(sub => location.pathname === sub.path);

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

                {/* Container Submenu dengan Animasi */}
                <div 
                  className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${isExpanded ? 'max-h-48 opacity-100 mt-1' : 'max-h-0 opacity-0'}
                  `}
                >
                  <div className="bg-slate-950 rounded-lg py-1 ml-4 border-l-2 border-slate-700">
                    {item.submenu.map((subItem, subIndex) => {
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