import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Ticket, AlertCircle, Clock, CheckCircle, 
  Activity, Calendar, ArrowRight, MapPin 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://192.168.100.126:8000'; 

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, closed: 0 });
  const [recentTickets, setRecentTickets] = useState([]); 
  const [loading, setLoading] = useState(true);
  const userRole = localStorage.getItem('role');

  // Deteksi mode gelap untuk penyesuaian chart
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Fungsi Hitung Durasi TTR
  const calculateDuration = (start, end) => {
    if (!start) return "-";
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const diffInMs = endTime - startTime;
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const statsRes = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, { headers });
        setStats(statsRes.data.data);
        const ticketsRes = await axios.get(`${API_BASE_URL}/api/tickets?per_page=5`, { headers });
        setRecentTickets(ticketsRes.data.data.data || ticketsRes.data.data || []);
      } catch (error) {
        console.error("Gagal memuat dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = [
    { name: 'Open', jumlah: stats.open, color: '#EF4444' },
    { name: 'Proses', jumlah: stats.in_progress, color: '#F59E0B' },
    { name: 'Selesai', jumlah: stats.closed, color: '#10B981' },
  ];

  const StatCard = ({ title, count, icon: Icon, gradient, onClick }) => (
    <div onClick={onClick} className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-all hover:scale-[1.02] cursor-pointer ${gradient}`}>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
          <h2 className="text-4xl font-extrabold tracking-tight">{loading ? "..." : count}</h2>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs opacity-80">Detail <ArrowRight size={12}/></div>
      </div>
      <div className="absolute -right-6 -bottom-6 opacity-20 rotate-12"><Icon size={120} /></div>
    </div>
  );

  return (
    <div className="p-6 space-y-8 transition-colors duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight transition-colors">Dashboard Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 text-sm font-medium">
            <Calendar size={16} className="text-blue-500"/> 
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase transition-colors">SYSTEM ONLINE • {userRole}</span>
        </div>
      </div>

      {/* CARDS (Tetap menggunakan Gradient karena cocok untuk mode terang/gelap) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tiket" count={stats.total} icon={Ticket} gradient="bg-gradient-to-br from-blue-600 to-blue-800" onClick={() => navigate('/tickets')} />
        <StatCard title="Open (Baru)" count={stats.open} icon={AlertCircle} gradient="bg-gradient-to-br from-red-500 to-red-700" onClick={() => navigate('/tickets?status=Open')} />
        <StatCard title="In Progress" count={stats.in_progress} icon={Clock} gradient="bg-gradient-to-br from-orange-400 to-orange-600" onClick={() => navigate('/tickets?status=InProgress')} />
        <StatCard title="Selesai" count={stats.closed} icon={CheckCircle} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" onClick={() => navigate('/tickets?status=Closed')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col transition-colors">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-8">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Activity size={20}/></div> Statistik Penanganan
          </h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#F3F4F6"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: isDarkMode ? "#1e293b" : "#F9FAFB"}} 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                    color: isDarkMode ? '#f1f5f9' : '#1e293b'
                  }} 
                />
                <Bar dataKey="jumlah" radius={[8, 8, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TIKET TERBARU & TTR */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col transition-colors">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 transition-colors">Tiket Terbaru & Durasi</h3>
          <div className="flex-1 space-y-4">
            {recentTickets.length === 0 ? (
              <p className="text-center text-gray-400 italic text-sm py-10">Belum ada tiket terbaru.</p>
            ) : (
              recentTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-700 transition bg-white dark:bg-slate-800/50 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{ticket.nomor_internal}</p>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded italic whitespace-nowrap">
                      {ticket.status === 'Closed' ? 'TTR: ' : 'Dur: '}
                      {calculateDuration(ticket.created_at, ticket.closed_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1 truncate"><MapPin size={12}/> {ticket.site_name}</p>
                  <div className="flex justify-between items-center mt-2">
                     <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                       ticket.status === 'Open' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 
                       ticket.status === 'Closed' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 
                       'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                     }`}>
                       {ticket.status}
                     </span>
                     <span className="text-[10px] text-gray-400 dark:text-gray-500 italic">Dibuat: {new Date(ticket.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;