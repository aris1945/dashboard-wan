import { useState } from 'react';
import axios from 'axios';
import { Calendar, User, Search, Clock, Smartphone, Coffee } from 'lucide-react';

const AbsensiPage = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!employeeId) return;

    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const response = await axios.get('http://192.168.100.126:8000/api/absensi', {
        params: { employee_id: employeeId }
      });
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data absensi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Calendar className="text-blue-600" /> Laporan Absensi
      </h1>

      {/* Form Input NIK */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8 max-w-xl">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Masukkan NIK / Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition disabled:bg-gray-400 flex items-center gap-2"
          >
            <Search size={18} />
            {loading ? 'Memuat...' : 'Cek'}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      {/* Hasil Laporan */}
      {reportData && (
        <div className="bg-white rounded-xl shadow border overflow-hidden animate-fade-in">
          {/* Header Laporan */}
          <div className="bg-blue-50 p-6 border-b flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Periode Laporan</h2>
              <p className="text-blue-600 font-medium">{reportData.periode}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border shadow-sm text-center">
              <span className="block text-xs text-gray-500 uppercase font-bold">Total Absen</span>
              <span className="text-2xl font-bold text-gray-800">{reportData.total_data}</span>
            </div>
          </div>

          {/* Tabel Data */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-4 border-b">No</th>
                  <th className="p-4 border-b">Tanggal</th>
                  <th className="p-4 border-b">Jam Masuk</th>
                  <th className="p-4 border-b">Platform / Keterangan</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {reportData.data.length > 0 ? (
                  reportData.data.map((item, index) => (
                    <tr key={index} className="hover:bg-blue-50 border-b last:border-0 transition">
                      <td className="p-4 text-gray-400 font-mono">{index + 1}</td>
                      <td className="p-4 font-medium">{item.present_date}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                          <Clock size={14} /> {item.in_dtm}
                        </span>
                      </td>
                      <td className="p-4">
                        {item.keterangan === 'Mobile' ? (
                          <span className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-bold w-fit">
                            <Smartphone size={14} /> Mobile
                          </span>
                        ) : item.keterangan === 'Cuti' ? (
                          <span className="flex items-center gap-2 text-orange-700 bg-orange-100 px-3 py-1 rounded-full text-xs font-bold w-fit">
                            <Coffee size={14} /> Cuti
                          </span>
                        ) : (
                          <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold">
                            {item.keterangan}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      Tidak ada data absensi pada periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsensiPage;