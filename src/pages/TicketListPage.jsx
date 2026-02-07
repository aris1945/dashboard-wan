import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Ticket, Edit, Trash2, Search, X, ChevronLeft, ChevronRight, Save, Lock 
} from 'lucide-react';

const TicketListPage = () => {
  // --- STATE UTAMA ---
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  
  // --- AMBIL ROLE USER ---
  const userRole = localStorage.getItem('role'); 

  // --- STATE MODAL EDIT ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    nomor_internal: '',
    nomor_sistem: '',
    unit: '',
    jenis: '',
    site_name: '',
    site_id: '',
    deskripsi: '',
    petugas: '',
    status: ''
  });

  // --- 1. FETCH DATA TIKET ---
  const fetchTickets = async (url = 'http://127.0.0.1:8000/api/tickets') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = search ? { search } : {};
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: params
      });
      
      setTickets(response.data.data.data);
      setPagination(response.data.data); 
    } catch (error) {
      console.error("Gagal ambil data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []); 

  // --- 2. HANDLE SEARCH ---
  const handleSearch = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  // --- 3. BUKA MODAL EDIT ---
  const handleEditClick = (ticket) => {
    setEditFormData({
      id: ticket.id,
      nomor_internal: ticket.nomor_internal,
      nomor_sistem: ticket.nomor_sistem || '',
      unit: ticket.unit || '',
      jenis: ticket.jenis || '',
      site_name: ticket.site_name || '',
      site_id: ticket.site_id || '',
      deskripsi: ticket.deskripsi || '',
      petugas: ticket.petugas || '',
      status: ticket.status || 'Open'
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // --- 4. UPDATE TIKET ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://127.0.0.1:8000/api/tickets/${editFormData.id}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Tiket berhasil diperbarui!");
      setIsEditModalOpen(false); 
      fetchTickets(); 

    } catch (error) {
      console.error("Gagal update", error);
      if (error.response && error.response.status === 422) {
        alert("Gagal Validasi: Cek inputan Anda.");
      } else if (error.response && error.response.status === 403) {
        alert(error.response.data.message); // Pesan dari backend jika akses ditolak
      } else {
        alert("Terjadi kesalahan sistem.");
      }
    }
  };

  // --- 5. HAPUS TIKET ---
  const handleDelete = async (id) => {
    if(!confirm("Yakin hapus tiket ini?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/api/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTickets(); 
    } catch (error) {
      alert("Gagal menghapus (Anda mungkin tidak memiliki izin)");
    }
  };

  return (
    <div className="p-6">
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
              <tr>
                <th className="p-4">No. Tiket</th>
                <th className="p-4">Unit</th>
                <th className="p-4">Site / Lokasi</th>
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
                    </td>
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
                      
                      {/* --- TOMBOL EDIT --- */}
                      {(() => {
                         // Logic: Disable jika Teknisi DAN Status Closed
                         const isLocked = ticket.status === 'Closed' && userRole === 'teknisi';
                         return (
                            <button 
                                onClick={() => !isLocked && handleEditClick(ticket)} 
                                disabled={isLocked}
                                className={`p-2 rounded transition ${
                                    isLocked 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                    : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                }`}
                                title={isLocked ? "Tiket Closed (Terkunci)" : "Edit"}
                            >
                                {isLocked ? <Lock size={16}/> : <Edit size={16} />}
                            </button>
                         );
                      })()}

                      {/* --- TOMBOL HAPUS (Hanya Admin/Helpdesk) --- */}
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

      {/* --- MODAL EDIT --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Edit Tiket {editFormData.nomor_internal}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Unit</label>
                  <select 
                    name="unit" 
                    value={editFormData.unit} 
                    onChange={handleEditChange} 
                    // DISABLE JIKA TEKNISI
                    disabled={userRole === 'teknisi'} 
                    className={`w-full border rounded p-2 ${
                        userRole === 'teknisi' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'
                    }`}
                    required
                  >
                    <option value="CNOP">CNOP</option>
                    <option value="SPBU">SPBU</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Status</label>
                  <select name="status" value={editFormData.status} onChange={handleEditChange} className="w-full border rounded p-2">
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-semibold mb-1">Nama Site / Lokasi</label>
                    <input 
                      type="text" 
                      name="site_name" 
                      value={editFormData.site_name} 
                      onChange={handleEditChange} 
                      // DISABLE JIKA TEKNISI
                      disabled={userRole === 'teknisi'} 
                      className={`w-full border rounded p-2 ${userRole === 'teknisi' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold mb-1">ID Site</label>
                    <input 
                      type="text" 
                      name="site_id" 
                      value={editFormData.site_id} 
                      // DISABLE JIKA TEKNISI
                      disabled={userRole === 'teknisi'} 
                      readOnly={userRole === 'teknisi'}
                      className={`w-full border rounded p-2 ${userRole === 'teknisi' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Deskripsi</label>
                <textarea name="deskripsi" rows="3" value={editFormData.deskripsi} onChange={handleEditChange} required className="w-full border rounded p-2"></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Petugas (Edit Manual)</label>
                {/* SELALU DISABLED (Sesuai kode snippet Anda) */}
                <input type="text" name="petugas" value={editFormData.petugas} onChange={handleEditChange} className="w-full border rounded p-2 bg-gray-100 text-gray-500 cursor-not-allowed" disabled/>
              </div>

              <div className="flex justify-end pt-4 gap-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"><Save size={18} /> Simpan Perubahan</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TicketListPage;