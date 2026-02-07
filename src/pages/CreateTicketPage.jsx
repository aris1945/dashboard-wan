import { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Send, Save, AlertCircle, CheckCircle } from 'lucide-react';

const CreateTicketPage = () => {
  // --- STATE FORM ---
  const [formData, setFormData] = useState({
nomor_internal: '', // Baru
    nomor_sistem: '',   // Baru
    unit: '',
    jenis: '',
    site_name: '',
    deskripsi: '',
    petugas: ''
  });

  // --- STATE PENDUKUNG ---
  const [sitesList, setSitesList] = useState([]); // Untuk dropdown site
  const [loading, setLoading] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // --- 1. AMBIL DATA SITES (Untuk Dropdown) ---
  useEffect(() => {
    const fetchSites = async () => {
      setLoadingSites(true);
      try {
        // Mengambil semua site (atau batasi pagination jika terlalu banyak)
        const response = await axios.get('http://127.0.0.1:8000/api/sites?per_page=100'); 
        // Sesuaikan path data tergantung respon controller sites Anda
        const data = response.data.data.data || response.data.data; 
        setSitesList(data);
      } catch (error) {
        console.error("Gagal mengambil data sites", error);
      } finally {
        setLoadingSites(false);
      }
    };
    fetchSites();
  }, []);

  // --- 2. HANDLE INPUT CHANGE ---
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // --- 3. SUBMIT FORM ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await axios.post('http://127.0.0.1:8000/api/tickets', formData);
      
      setStatus({ type: 'success', message: 'Tiket berhasil dibuat!' });
      // Reset form
      setFormData({
nomor_internal: '',
        nomor_sistem: '',
        unit: '',
        jenis: '',
        site_name: '',
        deskripsi: '',
        petugas: ''
      });

    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Terjadi kesalahan saat membuat tiket.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Ticket className="text-blue-600" /> Buat Tiket / Order Baru
      </h1>

      <div className="bg-white rounded-xl shadow-md border p-6 md:p-8">
        
        {/* Notifikasi Sukses/Gagal */}
        {status.message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {status.message}
          </div>
        )}

      
<form onSubmit={handleSubmit} className="space-y-6">
          
          {/* --- AREA NOMOR TIKET --- */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                No. Tiket Internal (NOC) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nomor_internal"
                value={formData.nomor_internal}
                onChange={handleChange}
                placeholder="Contoh: NOC-2024-001"
                required
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">Wajib diisi sebagai referensi internal.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                No. Tiket Sistem (Resmi)
              </label>
              <input
                type="text"
                name="nomor_sistem"
                value={formData.nomor_sistem}
                onChange={handleChange}
                placeholder="Contoh: IN-12345678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">Opsional. Isi nanti jika ada laporan pelanggan.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input UNIT */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
              <select 
                name="unit" 
                value={formData.unit} 
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">-- Pilih Unit --</option>
                <option value="Unit Teknis">Unit Teknis</option>
                <option value="Unit Network">Unit Network</option>
                <option value="Unit Support">Unit Support</option>
                <option value="Unit OSP">Unit OSP</option>
              </select>
            </div>

            {/* Input JENIS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Tiket</label>
              <select 
                name="jenis" 
                value={formData.jenis} 
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">-- Pilih Jenis --</option>
                <option value="Incident">Incident (Gangguan)</option>
                <option value="Request">Service Request (Permintaan)</option>
                <option value="Maintenance">Maintenance (Pemeliharaan)</option>
                <option value="Installation">Installation (Pasang Baru)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input SITE (Dropdown dari API) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Site / Lokasi</label>
              {loadingSites ? (
                <div className="text-sm text-gray-400">Memuat data site...</div>
              ) : (
                <select 
                  name="site_name" 
                  value={formData.site_name} 
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">-- Pilih Site --</option>
                  {sitesList.map((site) => (
                    <option key={site.id} value={site.site_name}>
                      {site.site_name} ({site.site_id})
                    </option>
                  ))}
                  <option value="Lainnya">Lainnya / Non-Site</option>
                </select>
              )}
            </div>

            {/* Input PETUGAS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Petugas</label>
              <input
                type="text"
                name="petugas"
                value={formData.petugas}
                onChange={handleChange}
                placeholder="Nama pelapor / teknisi"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Input DESKRIPSI */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Detail</label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              rows="4"
              placeholder="Jelaskan detail pekerjaan atau gangguan..."
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            ></textarea>
          </div>

          {/* Tombol Submit */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition disabled:bg-gray-400 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                'Mengirim...'
              ) : (
                <>
                  <Send size={18} /> Buat Tiket
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateTicketPage;