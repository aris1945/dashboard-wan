import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Eye, Server, Search, FileSpreadsheet } from 'lucide-react';
import SiteDetailModal from '../components/SiteDetailModal';

const SitesPage = () => {
  // --- STATE DATA ---
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // --- STATE UPLOAD & MODAL ---
  const [selectedSite, setSelectedSite] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Ref untuk input file hidden
  const fileInputRef = useRef(null);

  const API_URL = 'http://35.209.249.82/api/sites';

  // --- FUNGSI GET DATA ---
  const fetchSites = async (pageNumber = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        params: { page: pageNumber, search: searchQuery }
      });
      const result = response.data.data;
      setSites(result.data);
      setPage(result.current_page);
      setTotalPages(result.last_page);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce Search (Otomatis cari saat ketik)
  useEffect(() => {
    const delay = setTimeout(() => fetchSites(1, search), 500);
    return () => clearTimeout(delay);
  }, [search]);

  // --- FUNGSI UPLOAD EXCEL ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Persiapkan Data
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      // Kirim ke Backend Laravel
      await axios.post('http://127.0.0.1:8000/api/sites/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Jika pakai Auth, axios interceptor di main.jsx akan otomatis handle Token
        }
      });
      
      alert('Import Data Sites Berhasil!');
      fetchSites(1, search); // Refresh tabel otomatis
      
    } catch (error) {
      const pesan = error.response?.data?.message || error.message;
      alert('Gagal Import: ' + pesan);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input file
    }
  };

  return (
    <div>
      {/* --- HEADER & TOOLBAR --- */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
           <Server className="text-blue-600" /> Data Infrastruktur (Sites)
        </h1>
        
        <div className="flex gap-3 w-full md:w-auto">
          {/* Input Pencarian */}
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-3 text-gray-400" size={18} />
             <input
              type="text"
              placeholder="Cari Site ID / Nama..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          
        </div>
      </div>

      {/* --- TABEL DATA --- */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="p-4 border-b">Site ID</th>
                <th className="p-4 border-b">Site Name</th>
                <th className="p-4 border-b">STO</th>
                <th className="p-4 border-b">OLT</th>
                <th className="p-4 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center">Loading Data...</td></tr>
              ) : sites.length > 0 ? (
                sites.map((site) => (
                  <tr
                    key={site.id}
                    onClick={() => setSelectedSite(site)}
                    className="hover:bg-blue-50 border-b cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-bold text-blue-600">{site.site_id}</td>
                    <td className="p-4 font-medium">{site.site_name}</td>
                    <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">{site.sto}</span></td>
                    <td className="p-4">{site.olt}</td>
                    <td className="p-4 text-center">
                      <button className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded-full">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-8 text-center">Data tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* --- PAGINATION --- */}
        <div className="p-4 bg-gray-50 border-t flex justify-between">
          <button disabled={page === 1} onClick={() => fetchSites(page - 1, search)} className="px-3 py-1 bg-white border rounded disabled:opacity-50 text-sm">Prev</button>
          <span className="text-sm text-gray-600">Halaman {page} dari {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => fetchSites(page + 1, search)} className="px-3 py-1 bg-white border rounded disabled:opacity-50 text-sm">Next</button>
        </div>
      </div>

      {/* --- MODAL DETAIL --- */}
      {selectedSite && (
        <SiteDetailModal site={selectedSite} onClose={() => setSelectedSite(null)} />
      )}
    </div>
  );
};

export default SitesPage;