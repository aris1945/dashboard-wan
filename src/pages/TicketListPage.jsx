import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Ticket, Search, Edit3, X, Save, 
  CheckCircle, Clock, AlertCircle 
} from 'lucide-react';

const TicketListPage = () => {
  // --- STATE ---
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- STATE MODAL UPDATE ---
  const [selectedTicket, setSelectedTicket] = useState(null); // Tiket yang sedang diedit
  const [editForm, setEditForm] = useState({ nomor_sistem: '', status: '' });
  const [updating, setUpdating] = useState(false);

  // --- FETCH DATA ---
  const fetchTickets = async (p = 1, s = '') => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/tickets', {
        params: { page: p, search: s }
      });
      const result = response.data.data;
      setTickets(result.data);
      setPage(result.current_page);
      setTotalPages(result.last_page);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchTickets(1, search), 500);
    return () => clearTimeout(delay);
  }, [search]);

  // --- HELPER STATUS COLOR ---
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle size={12}/> Open</span>;
      case 'Progress': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Progress</span>;
      case 'Closed': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Closed</span>;
      default: return status;
    }
  };

  // --- HANDLER MODAL ---
  const handleEditClick = (ticket) => {
    setSelectedTicket(ticket);
    setEditForm({
      nomor_sistem: ticket.nomor_sistem || '',
      status: ticket.status
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axios.put(`http://127.0.0.1:8000/api/tickets/${selectedTicket.id}`, editForm);
      alert('Tiket berhasil diupdate!');
      setSelectedTicket(null); // Tutup modal
      fetchTickets(page, search); // Refresh tabel
    } catch (error) {
      alert('Gagal update: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
           <Ticket className="text-blue-600" /> Monitoring Tiket
        </h1>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-3 text-gray-400" size={18} />
           <input
            type="text"
            placeholder="Cari No Tiket / Site..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="p-4 border-b">No. Internal</th>
                <th className="p-4 border-b">No. Sistem</th>
                <th className="p-4 border-b">Site / Unit</th>
                <th className="p-4 border-b">Deskripsi</th>
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b">Petugas</th>
                <th className="p-4 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center">Loading Data...</td></tr>
              ) : tickets.length > 0 ? (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-blue-50 border-b last:border-0 transition">
                    <td className="p-4 font-bold text-gray-800 font-mono">{t.nomor_internal}</td>
                    <td className="p-4 font-mono text-blue-600">
                      {t.nomor_sistem ? t.nomor_sistem : <span className="text-gray-300 italic">-</span>}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-700">{t.site_name}</div>
                      <div className="text-xs text-gray-400">{t.unit}</div>
                    </td>
                    <td className="p-4 max-w-xs truncate" title={t.deskripsi}>
                      {t.deskripsi}
                    </td>
                    <td className="p-4">{getStatusBadge(t.status)}</td>
                    <td className="p-4 text-xs">{t.petugas}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleEditClick(t)}
                        className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition text-xs font-bold flex items-center gap-1 mx-auto"
                      >
                        <Edit3 size={14}/> Update
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="p-8 text-center">Belum ada tiket.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 bg-gray-50 border-t flex justify-between">
            <button disabled={page===1} onClick={() => fetchTickets(page-1, search)} className="px-3 py-1 bg-white border rounded disabled:opacity-50 text-sm">Prev</button>
            <span className="text-sm text-gray-600">Halaman {page} dari {totalPages}</span>
            <button disabled={page===totalPages} onClick={() => fetchTickets(page+1, search)} className="px-3 py-1 bg-white border rounded disabled:opacity-50 text-sm">Next</button>
        </div>
      </div>

      {/* --- MODAL UPDATE (POPUP) --- */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold">Update Tiket: {selectedTicket.nomor_internal}</h3>
              <button onClick={() => setSelectedTicket(null)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              {/* Input Nomor Sistem */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">No. Tiket Sistem (Resmi)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  placeholder="Masukkan nomor tiket resmi..."
                  value={editForm.nomor_sistem}
                  onChange={(e) => setEditForm({...editForm, nomor_sistem: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">Update ini jika tiket resmi sudah keluar.</p>
              </div>

              {/* Input Status */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Update Status</label>
                <select 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                >
                  <option value="Open">Open (Baru)</option>
                  <option value="Progress">On Progress (Sedang Dikerjakan)</option>
                  <option value="Closed">Closed (Selesai)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  {updating ? 'Menyimpan...' : <><Save size={16}/> Simpan Perubahan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TicketListPage;