import { useState } from 'react';
import axios from 'axios';
import { Search, MapPin, Server, AlertCircle } from 'lucide-react';

const OdcPage = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true);

    try {
      // Panggil API Laravel kita sendiri (bukan langsung ke Lensa)
      const response = await axios.get('http://192.168.100.126:8000/api/odc-search', {
        params: { name: search }
      });

      const data = response.data.data;

      if (Array.isArray(data)) {
        setResults(data);
      } else {
        setResults([]);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mencari data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pencarian ODC</h1>

      {/* Kolom Pencarian */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Masukkan nama ODC (contoh: ODC-CJR)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:bg-gray-400"
          >
            {loading ? 'Mencari...' : 'Cari'}
          </button>
        </form>
      </div>

      {/* Hasil Pencarian */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 mb-6">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.length > 0 ? (
          results.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow border hover:shadow-md transition p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Server className="text-blue-600" size={24} />
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                  ACTIVE
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-1">{item.odc_name}</h3>
              <p className="text-sm text-gray-500 mb-4">{item.odc_spec || 'No spec available'}</p>

              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="font-mono text-xs">{item.latitude}, {item.longitude}</span>
                </div>

                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-center mt-4 bg-gray-50 hover:bg-gray-100 text-blue-600 font-medium py-2 rounded-lg text-sm border transition"
                >
                  Buka di Google Maps
                </a>
              </div>
            </div>
          ))
        ) : (
          hasSearched && !loading && !error && (
            <div className="col-span-full text-center py-10 text-gray-500">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="text-gray-400" size={32} />
              </div>
              <p>Data ODC tidak ditemukan.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default OdcPage;