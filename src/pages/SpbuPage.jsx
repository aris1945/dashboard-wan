import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Fuel, Search, Upload, FileSpreadsheet, MapPin } from 'lucide-react';

const SpbuPage = () => {
  const [spbus, setSpbus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploading, setUploading] = useState(false);
  
  // Ref untuk input file hidden
  const fileInputRef = useRef(null);

  const fetchSpbus = async (pageNumber = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/spbu', {
        params: { page: pageNumber, search: searchQuery }
      });
      setSpbus(response.data.data.data);
      setPage(response.data.data.current_page);
      setTotalPages(response.data.data.last_page);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchSpbus(1, search), 500);
    return () => clearTimeout(delay);
  }, [search]);

  // Handle Upload Excel
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/spbu/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Import Berhasil!');
      fetchSpbus(1, search); // Refresh data
    } catch (error) {
      alert('Gagal Import: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Fuel className="text-red-600" /> Data SPBU
        </h1>
        
        <div className="flex gap-3 w-full md:w-auto">
          {/* Input Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari SPBU..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Tombol Upload Excel */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".xlsx,.xls,.csv" 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:bg-gray-400"
          >
            {uploading ? 'Uploading...' : <><FileSpreadsheet size={18} /> Import Excel</>}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="p-4 border-b">Kode SPBU</th>
                <th className="p-4 border-b">Nama SPBU</th>
                <th className="p-4 border-b">IP Address</th>
                <th className="p-4 border-b">Area / SO</th>
                <th className="p-4 border-b">Alamat</th>
                <th className="p-4 border-b">Tipe</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center">Loading...</td></tr>
              ) : spbus.length > 0 ? (
                spbus.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50 border-b last:border-0 transition">
                    <td className="p-4 font-bold text-red-600">{item.kode_spbu}</td>
                    <td className="p-4 font-medium text-gray-800">{item.nama_spbu}</td>
                    <td className="p-4 font-mono text-xs">{item.ip_address || '-'}</td>
                    <td className="p-4">
                        <span className="block font-bold text-xs">{item.area}</span>
                        <span className="text-xs text-gray-500">{item.so}</span>
                    </td>
                    <td className="p-4 max-w-xs truncate" title={item.alamat}>
                        {item.alamat}
                        {item.latitude && (
                           <a 
                             href={`https://maps.google.com/?q=${item.latitude}`} 
                             target="_blank" 
                             className="block text-blue-500 text-xs mt-1 hover:underline flex items-center gap-1"
                           >
                             <MapPin size={10}/> Maps
                           </a>
                        )}
                    </td>
                    <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.tipe_spbu === 'COCO' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {item.tipe_spbu}
                        </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="p-8 text-center">Data tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 bg-gray-50 border-t flex justify-between">
            <button disabled={page===1} onClick={() => fetchSpbus(page-1, search)} className="px-3 py-1 bg-white border rounded disabled:opacity-50">Prev</button>
            <span className="text-sm">Halaman {page} dari {totalPages}</span>
            <button disabled={page===totalPages} onClick={() => fetchSpbus(page+1, search)} className="px-3 py-1 bg-white border rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default SpbuPage;