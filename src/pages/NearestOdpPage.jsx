import { useState } from 'react';
import axios from 'axios';
import { MapPin, Navigation, Search, Home, Ruler } from 'lucide-react';

const NearestOdpPage = () => {
  const [lat, setLat] = useState('');
  const [long, setLong] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false); // Loading khusus tombol GPS
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [resultCount, setResultCount] = useState(0);

  // Fitur Ambil Lokasi Saat Ini (GPS)
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Browser Anda tidak mendukung Geolocation.");
      return;
    }

    setGpsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLong(position.coords.longitude);
        setGpsLoading(false);
      },
      (err) => {
        setError("Gagal mengambil lokasi: " + err.message);
        setGpsLoading(false);
      }
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!lat || !long) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true);

    try {
      const response = await axios.get('http://35.209.168.114/api/odp-nearest', {
        params: { lat: lat, long: long }
      });

      const data = response.data;
      setResults(data.data); // Array data
      setResultCount(data.count); // Jumlah data
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mencari ODP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MapPin className="text-blue-600" /> ODP Terdekat (Radius 250m)
      </h1>

      {/* Form Input Koordinat */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="text"
                required
                placeholder="-7.12345"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="text"
                required
                placeholder="112.12345"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={long}
                onChange={(e) => setLong(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gpsLoading || loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:bg-gray-400"
            >
              <Navigation size={18} />
              {gpsLoading ? 'Mencari Lokasi...' : 'Ambil Lokasi Saat Ini'}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition disabled:bg-gray-400"
            >
              <Search size={18} />
              {loading ? 'Memindai...' : 'Cari ODP'}
            </button>
          </div>
        </form>
      </div>

      {/* Pesan Error */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      {/* Hasil Pencarian */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.length > 0 ? (
          results.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow border hover:shadow-md transition p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-100 px-3 py-1 rounded-bl-lg">
                <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                  <Ruler size={12} /> {(item.distance * 1000).toFixed(1)} m
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3 mt-1">
                <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                  <Home size={20} />
                </div>
                <h3 className="font-bold text-gray-800">{item.odp_name}</h3>
              </div>

              <div className="text-sm text-gray-600 space-y-2 mb-4">
                <div className="flex items-start gap-2">
                   <MapPin size={16} className="text-gray-400 mt-0.5" />
                   <span className="font-mono text-xs">{item.lat}, {item.lng}</span>
                </div>
              </div>

              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center bg-gray-50 hover:bg-gray-100 text-blue-600 font-medium py-2 rounded-lg text-sm border transition"
              >
                Buka di Maps
              </a>
            </div>
          ))
        ) : (
          hasSearched && !loading && !error && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <MapPin className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 font-medium">⚠️ Tidak ada ODP dalam radius 250m.</p>
              <p className="text-xs text-gray-400 mt-1">Coba geser lokasi sedikit atau cek koordinat Anda.</p>
            </div>
          )
        )}
      </div>

       {/* Footer Summary */}
       {hasSearched && !loading && (
         <div className="mt-6 text-center text-sm text-gray-500">
            Total ditemukan: <strong>{resultCount}</strong> ODP (Max radius 250m)
         </div>
       )}

    </div>
  );
};

export default NearestOdpPage;