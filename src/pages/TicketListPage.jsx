import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Ticket, Edit, Trash2, Search, X, ChevronLeft, ChevronRight, 
  Save, Clock, CheckCircle, Network // <--- Icon Network Ditambahkan
} from 'lucide-react';

// --- KONFIGURASI URL ---
const API_BASE_URL = 'http://35.209.249.82'; 

const TicketListPage = () => {
  // --- STATE UTAMA ---
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const userRole = localStorage.getItem('role'); 

  // --- STATE MODAL WORKLOG ---
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null); 
  const [logs, setLogs] = useState([]); 
  
  // Form Input Worklog Baru (UPDATE: Tambah field odp, odc, ftm)
  const [logForm, setLogForm] = useState({
    status: '',
    deskripsi: '',
    odp: '', 
    odc: '', 
    ftm: '', 
    image: null
  });
  const fileInputRef = useRef(null);

  // --- 1. FETCH DATA TIKET ---
  const fetchTickets = async (url) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = search ? { search } : {};
      const endpoint = url || `${API_BASE_URL}/api/tickets`; 

      const response = await axios.get(endpoint, { 
        headers: { Authorization: `Bearer ${token}` }, 
        params 
      });
      
      setTickets(response.data.data.data);
      setPagination(response.data.data); 
    } catch (error) { 
      console.error("Gagal ambil data:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  // --- 2. HANDLE SEARCH ---
  const handleSearch = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  // --- 3. BUKA MODAL WORKLOG (UPDATE: Load data segmentasi lama) ---
  const handleOpenLogModal = async (ticketId) => {
    setIsLogModalOpen(true);
    setLogs([]); 
    // Reset form termasuk field segmentasi
    setLogForm({ status: '', deskripsi: '', odp: '', odc: '', ftm: '', image: null }); 

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/tickets/${ticketId}`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const ticketData = res.data.data;
      setSelectedTicket(ticketData);
      setLogs(ticketData.logs || []);
      
      // Isi default form dengan data terakhir (agar teknisi tidak perlu ketik ulang jika sudah ada)
      setLogForm(prev => ({ 
        ...prev, 
        status: ticketData.status,
        odp: ticketData.odp || '',
        odc: ticketData.odc || '',
        ftm: ticketData.ftm || ''
      }));

    } catch (error) {
      console.error("Gagal load detail", error);
    }
  };

  // --- 4. HANDLE INPUT FORM LOG ---
  const handleLogChange = (e) => {
    setLogForm({ ...logForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setLogForm({ ...logForm, image: e.target.files[0] });
  };

  // --- 5. SUBMIT WORKLOG BARU (UPDATE: Append data segmentasi) ---
  const handleSubmitLog = async (e) => {
    e.preventDefault();
    if (!logForm.status || !logForm.deskripsi) return alert("Status dan Deskripsi wajib diisi!");

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('status', logForm.status);
      formData.append('deskripsi', logForm.deskripsi);
      
      // Kirim Data Segmentasi
      formData.append('odp', logForm.odp);
      formData.append('odc', logForm.odc);
      formData.append('ftm', logForm.ftm);

      if (logForm.image) {
        formData.append('image', logForm.image);
      }

      await axios.post(`${API_BASE_URL}/api/tickets/${selectedTicket.id}/log`, formData, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
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

  // --- 6. HAPUS TIKET ---
  const handleDelete = async (id) => {
    if(!confirm("Yakin hapus tiket ini?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/tickets/${id}`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTickets(); 
    } catch (error) {
      alert("Gagal menghapus (Anda mungkin tidak memiliki izin)");
    }
  };

  return (
    <div className="p-6">
      
      {/* HEADER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Ticket className="text-blue-600" /> Daftar Tiket
        </h1>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Cari No. Tiket / Site..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
            <Search size={20} />
          </button>
        </form>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        
        {/* WRAPPER SCROLL */}
        <div className="overflow-x-auto pb-2"> 
          
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
              <tr>
                <th className="p-4">No. Tiket</th>
                <th className="p-4">Unit</th>
                <th className="p-4">Site / Lokasi</th>
                <th className="p-4">SA</th>
                <th className="p-4">Status</th>
                <th className="p-4">Petugas</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Data tidak ditemukan.</td></tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-mono font-bold text-blue-600">{ticket.nomor_internal}</td>
                    <td className="p-4">{ticket.unit}</td>
                    <td className="p-4">
                      <div className="font-bold">{ticket.site_name}</div>
                      <div className="text-xs text-gray-500">{ticket.site_id}</div>
                      
                      {/* TAMPILAN DATA SEGMENTASI DI TABEL (Jika Ada) */}
                      {(ticket.odp || ticket.odc) && (
                        <div className="text-[10px] text-blue-500 mt-1 flex gap-1">
                           {ticket.odp && <span className="bg-blue-50 px-1 rounded border border-blue-100">ODP: {ticket.odp}</span>}
                           {ticket.odc && <span className="bg-blue-50 px-1 rounded border border-blue-100">ODC: {ticket.odc}</span>}
                        </div>
                      )}

                    </td>
                    <td className="p-4">{ticket.sa || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        ticket.status === 'Open' ? 'bg-green-100 text-green-700' : 
                        ticket.status === 'Closed' ? 'bg-gray-200 text-gray-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ticket.status || 'Open'}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs truncate text-gray-600" title={ticket.petugas}>
                      {ticket.petugas}
                    </td>

                    <td className="p-4 flex justify-center gap-2">
                      <button 
                        onClick={() => handleOpenLogModal(ticket.id)}
                        className="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200 flex items-center gap-1"
                        title="Update Progress"
                      >
                         <Edit size={16}/> 
                         <span className="hidden md:inline">{userRole === 'teknisi' ? 'Update' : 'Detail'}</span>
                      </button>

                      {(userRole === 'admin' || userRole === 'helpdesk') && (
                        <button 
                          onClick={() => handleDelete(ticket.id)} 
                          className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 flex justify-between items-center bg-gray-50 border-t">
            <button 
              disabled={!pagination.prev_page_url} 
              onClick={() => fetchTickets(pagination.prev_page_url)}
              className="flex items-center gap-1 px-3 py-1 rounded border bg-white disabled:opacity-50"
            >
              <ChevronLeft size={16}/> Prev
            </button>
            <span className="text-gray-500">Halaman {pagination.current_page} dari {pagination.last_page}</span>
            <button 
              disabled={!pagination.next_page_url} 
              onClick={() => fetchTickets(pagination.next_page_url)}
              className="flex items-center gap-1 px-3 py-1 rounded border bg-white disabled:opacity-50"
            >
              Next <ChevronRight size={16}/>
            </button>
        </div>
      </div>

      {/* --- MODAL WORKLOG --- */}
      {isLogModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
            
            {/* KIRI: FORM */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r bg-gray-50">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">{selectedTicket.nomor_internal}</h2>
                  <div className="text-sm text-gray-500">{selectedTicket.site_id} - {selectedTicket.site_name}</div>
               </div>

               <div className="bg-white p-4 rounded-lg border mb-6 text-sm space-y-2">
                  <p><span className="font-semibold">Deskripsi:</span> {selectedTicket.deskripsi}</p>
                  <p><span className="font-semibold">Petugas:</span> {selectedTicket.petugas}</p>
               </div>
               <div className='bg-white p-4 rounded-lg border mb-6 text-sm space-y-2'>
                  <p><span className="font-semibold">Segmentasi Saat Ini:</span></p>
                  <p>ODP: {selectedTicket.odp || '-'}</p>
                  <p>ODC: {selectedTicket.odc || '-'}</p>
                  <p>FTM: {selectedTicket.ftm || '-'}</p>
               </div>

               {(selectedTicket.status !== 'Closed' || userRole === 'admin') && (
                 <form onSubmit={handleSubmitLog} className="space-y-4 bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="font-bold text-blue-600 flex items-center gap-2"><Clock size={18}/> Update Progress</h3>
                    
                    <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">Status Terbaru</label>
                       <select name="status" value={logForm.status} onChange={handleLogChange} className="w-full border rounded p-2 text-sm" required>
                          <option value="Open">Open</option>
                          <option value="On The Way">On The Way</option>
                          <option value="On Site">On Site</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Pending">Pending</option>
                          <option value="Closed">Closed</option>
                       </select>
                    </div>

                    {/* --- INPUT SEGMENTASI (ODP - ODC - FTM) --- */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                        <Network size={14}/> Data Segmentasi (Opsional)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                         <div>
                            <input 
                              type="text" name="odp" placeholder="ODP" 
                              value={logForm.odp} onChange={handleLogChange} 
                              className="w-full border rounded p-2 text-xs uppercase focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                         </div>
                         <div>
                            <input 
                              type="text" name="odc" placeholder="ODC" 
                              value={logForm.odc} onChange={handleLogChange} 
                              className="w-full border rounded p-2 text-xs uppercase focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                         </div>
                         <div>
                            <input 
                              type="text" name="ftm" placeholder="FTM" 
                              value={logForm.ftm} onChange={handleLogChange} 
                              className="w-full border rounded p-2 text-xs uppercase focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                         </div>
                      </div>
                    </div>
                    {/* ----------------------------------------- */}

                    <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">Catatan</label>
                       <textarea name="deskripsi" value={logForm.deskripsi} onChange={handleLogChange} rows="3" className="w-full border rounded p-2 text-sm" placeholder="Catatan progress..." required></textarea>
                    </div>

                    <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">Evident (Opsional)</label>
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

            {/* KANAN: TIMELINE */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-white relative">
               <button onClick={() => setIsLogModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                  <X size={24} />
               </button>

               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="text-green-600"/> Riwayat
               </h3>

               <div className="space-y-6">
                  {logs.length === 0 ? (
                     <p className="text-gray-400 text-center italic text-sm">Belum ada riwayat update.</p>
                  ) : (
                     logs.map((log) => (
                        <div key={log.id} className="relative pl-8 border-l-2 border-gray-200 last:border-0">
                           <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${
                              log.status === 'Closed' ? 'bg-green-500' : 'bg-blue-500'
                           }`}></div>

                           <div className="mb-1 flex items-center gap-2">
                              <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-700">{log.status}</span>
                              <span className="text-xs text-gray-400">
                                 {new Date(log.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                              </span>
                           </div>
                           
                           <p className="text-sm text-gray-800 mb-2">{log.deskripsi}</p>
                           <p className="text-xs text-gray-400 italic mb-2">Oleh: {log.user?.name || 'Unknown'}</p>

                           {/* FOTO EVIDENT */}
                           {log.image_path && (
                              <div className="mt-2">
                                 <a href={`${API_BASE_URL}/${log.image_path}`} target="_blank" rel="noreferrer">
                                    <img 
                                       src={`${API_BASE_URL}/${log.image_path}`} 
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