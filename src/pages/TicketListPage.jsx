import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Ticket, Edit, Trash2, Search, X, ChevronLeft, ChevronRight, 
  Save, Lock, Camera, Clock, CheckCircle, MapPin
} from 'lucide-react';

const TicketListPage = () => {
  // ... (State utama tickets, pagination, search TETAP SAMA) ...
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const userRole = localStorage.getItem('role'); 

  // --- STATE MODAL WORKLOG ---
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null); // Tiket yang sedang dibuka
  const [logs, setLogs] = useState([]); // Riwayat log tiket tsb
  
  // Form Input Worklog Baru
  const [logForm, setLogForm] = useState({
    status: '',
    deskripsi: '',
    image: null
  });
  const fileInputRef = useRef(null);

  // ... (Fetch Tickets & Search TETAP SAMA) ...
  const fetchTickets = async (url = 'http://127.0.0.1:8000/api/tickets') => {
    // ... (kode fetch sama seperti sebelumnya) ...
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = search ? { search } : {};
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }, params });
      setTickets(response.data.data.data);
      setPagination(response.data.data); 
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, []);

  // --- BUKA MODAL WORKLOG ---
  const handleOpenLogModal = async (ticketId) => {
    setIsLogModalOpen(true);
    setLogs([]); // Reset log lama
    setLogForm({ status: '', deskripsi: '', image: null }); // Reset form

    try {
      const token = localStorage.getItem('token');
      // Ambil detail tiket + logs dari API show
      const res = await axios.get(`http://127.0.0.1:8000/api/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSelectedTicket(res.data.data);
      setLogs(res.data.data.logs || []);
      
      // Set default status form mengikuti status terakhir
      setLogForm(prev => ({ ...prev, status: res.data.data.status }));

    } catch (error) {
      console.error("Gagal load detail", error);
    }
  };

  // --- HANDLE INPUT FORM LOG ---
  const handleLogChange = (e) => {
    setLogForm({ ...logForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setLogForm({ ...logForm, image: e.target.files[0] });
  };

  // --- SUBMIT WORKLOG BARU ---
  const handleSubmitLog = async (e) => {
    e.preventDefault();
    if (!logForm.status || !logForm.deskripsi) return alert("Status dan Deskripsi wajib diisi!");

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('status', logForm.status);
      formData.append('deskripsi', logForm.deskripsi);
      if (logForm.image) {
        formData.append('image', logForm.image);
      }

      await axios.post(`http://127.0.0.1:8000/api/tickets/${selectedTicket.id}/log`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // Wajib untuk upload file
        }
      });

      alert("Update berhasil!");
      handleOpenLogModal(selectedTicket.id); // Refresh data modal
      fetchTickets(); // Refresh data tabel belakang

    } catch (error) {
      console.error(error);
      alert("Gagal update worklog.");
    }
  };

  // ... (Handle Delete TETAP SAMA) ...

  return (
    <div className="p-6">
      {/* ... (Header & Search Bar TETAP SAMA) ... */}
       <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Ticket className="text-blue-600" /> Daftar Tiket
        </h1>
        {/* Search Input Disini */}
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
             <tr>
                <th className="p-4">No. Tiket</th>
                <th className="p-4">Unit</th>
                <th className="p-4">Site</th>
                <th className="p-4">Status</th>
                <th className="p-4">Aksi</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
             {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                   <td className="p-4 font-mono font-bold text-blue-600">{ticket.nomor_internal}</td>
                   <td className="p-4">{ticket.unit}</td>
                   <td className="p-4">{ticket.site_name}</td>
                   <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        ticket.status === 'Open' ? 'bg-green-100 text-green-700' : 
                        ticket.status === 'Closed' ? 'bg-gray-200 text-gray-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ticket.status}
                      </span>
                   </td>
                   <td className="p-4">
                      {/* TOMBOL UPDATE / DETAIL */}
                      <button 
                        onClick={() => handleOpenLogModal(ticket.id)}
                        className="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200 flex items-center gap-1"
                      >
                         <Edit size={16}/> {userRole === 'teknisi' ? 'Update' : 'Detail'}
                      </button>
                   </td>
                </tr>
             ))}
          </tbody>
        </table>
        {/* Pagination Disini */}
      </div>

      {/* --- MODAL WORKLOG (NEW DESIGN) --- */}
      {isLogModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
            
            {/* KIRI: INFORMASI TIKET & FORM UPDATE */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r bg-gray-50">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">{selectedTicket.nomor_internal}</h2>
                  <div className="text-sm text-gray-500">{selectedTicket.site_name}</div>
               </div>

               {/* Detail Readonly */}
               <div className="bg-white p-4 rounded-lg border mb-6 text-sm space-y-2">
                  <p><span className="font-semibold">Deskripsi Awal:</span> {selectedTicket.deskripsi}</p>
                  <p><span className="font-semibold">Petugas:</span> {selectedTicket.petugas}</p>
               </div>

               {/* FORM UPDATE (Hanya muncul jika tiket belum closed atau Admin mau reopen) */}
               {(selectedTicket.status !== 'Closed' || userRole === 'admin') && (
                 <form onSubmit={handleSubmitLog} className="space-y-4 bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="font-bold text-blue-600 flex items-center gap-2"><Clock size={18}/> Update Progress</h3>
                    
                    <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">Status Terbaru</label>
                       <select name="status" value={logForm.status} onChange={handleLogChange} className="w-full border rounded p-2 text-sm" required>
                          <option value="Open">Open</option>
                          <option value="On The Way">On The Way (Perjalanan)</option>
                          <option value="On Site">On Site (Sampai Lokasi)</option>
                          <option value="In Progress">In Progress (Pengerjaan)</option>
                          <option value="Pending">Pending</option>
                          <option value="Closed">Closed (Selesai)</option>
                       </select>
                    </div>

                    <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">Catatan / Laporan</label>
                       <textarea name="deskripsi" value={logForm.deskripsi} onChange={handleLogChange} rows="3" className="w-full border rounded p-2 text-sm" placeholder="Contoh: Sudah sampai site, sedang pengecekan..." required></textarea>
                    </div>

                    <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">Upload Foto Evident (Opsional)</label>
                       <div className="flex items-center gap-2">
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                          {logForm.image && <CheckCircle size={16} className="text-green-500"/>}
                       </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2">
                       <Save size={16}/> Kirim Update
                    </button>
                 </form>
               )}
            </div>

            {/* KANAN: TIMELINE / RIWAYAT (WORKLOG) */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-white relative">
               <button onClick={() => setIsLogModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                  <X size={24} />
               </button>

               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="text-green-600"/> Riwayat Pengerjaan
               </h3>

               <div className="space-y-6">
                  {logs.length === 0 ? (
                     <p className="text-gray-400 text-center italic text-sm">Belum ada riwayat update.</p>
                  ) : (
                     logs.map((log) => (
                        <div key={log.id} className="relative pl-8 border-l-2 border-gray-200 last:border-0">
                           {/* Dot Timeline */}
                           <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${
                              log.status === 'Closed' ? 'bg-green-500' : 'bg-blue-500'
                           }`}></div>

                           <div className="mb-1 flex items-center gap-2">
                              <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                 {log.status}
                              </span>
                              <span className="text-xs text-gray-400">
                                 {new Date(log.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                              </span>
                           </div>
                           
                           <p className="text-sm text-gray-800 mb-2">{log.deskripsi}</p>
                           <p className="text-xs text-gray-400 italic mb-2">Oleh: {log.user?.name || 'Unknown'}</p>

                           {/* Tampilkan Foto Jika Ada */}
                           {log.image_path && (
                              <div className="mt-2">
                                 <a href={`http://127.0.0.1:8000/${log.image_path}`} target="_blank" rel="noreferrer">
                                    <img 
                                       src={`http://127.0.0.1:8000/${log.image_path}`} 
                                       alt="Evident" 
                                       className="w-32 h-24 object-cover rounded border hover:scale-105 transition cursor-pointer"
                                    />
                                 </a>
                              </div>
                           )}
                        </div>
                     ))
                  )}
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default TicketListPage;