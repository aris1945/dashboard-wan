import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// Pastikan import icon lengkap
import { Ticket, Send, AlertCircle, CheckCircle, Search, User, X, MapPin } from 'lucide-react';

const CreateTicketPage = () => {
  // --- STATE FORM ---
  const [formData, setFormData] = useState({
    nomor_internal: 'Loading...',
    nomor_sistem: '',
    unit: '',      
    jenis: '',
    site_name: '',
    site_id: '', 
    deskripsi: '',
  });

  // --- STATE DATA ---
  const [sitesList, setSitesList] = useState([]); 
  const [spbuList, setSpbuList] = useState([]);   
  
  // --- STATE UI ---
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  const [showTechDropdown, setShowTechDropdown] = useState(false);
  
  // --- STATE TEKNISI ---
  const [selectedTeknisi, setSelectedTeknisi] = useState([]);
  const [teknisiList, setTeknisiList] = useState([]);
  const [techSearchTerm, setTechSearchTerm] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  // --- REFS (PENTING: JANGAN SAMPAI HILANG) ---
  const techDropdownRef = useRef(null);
  const techInputRef = useRef(null);
  const siteDropdownRef = useRef(null); // <--- INI YANG SEBELUMNYA HILANG/ERROR

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Ambil Nomor Tiket
        try {
            const ticketRes = await axios.get('http://127.0.0.1:8000/api/tickets/next-number', { headers });
            setFormData(prev => ({ ...prev, nomor_internal: ticketRes.data.ticket_number }));
        } catch (e) { console.error(e); setFormData(prev => ({ ...prev, nomor_internal: 'Error' })); }

        // Ambil Sites
        const sitesRes = await axios.get('http://127.0.0.1:8000/api/sites?per_page=10000', { headers });
        setSitesList(sitesRes.data.data.data || sitesRes.data.data || []);

        // Ambil SPBU
        const spbuRes = await axios.get('http://127.0.0.1:8000/api/spbu?per_page=10000', { headers });
        setSpbuList(spbuRes.data.data.data || spbuRes.data.data || []);

        // Ambil Teknisi
        const teknisiRes = await axios.get('http://127.0.0.1:8000/api/users/teknisi', { headers });
        const dataTeknisi = teknisiRes.data.data || teknisiRes.data || [];
        if (Array.isArray(dataTeknisi)) setTeknisiList(dataTeknisi);

      } catch (error) {
        console.error("Gagal memuat data", error);
      }
    };
    fetchData();

    // Click Outside Listener
    const handleClickOutside = (event) => {
      // Cek Dropdown Teknisi
      if (techDropdownRef.current && !techDropdownRef.current.contains(event.target)) {
        setShowTechDropdown(false);
      }
      // Cek Dropdown Site (Pastikan siteDropdownRef sudah didefinisikan di atas)
      if (siteDropdownRef.current && !siteDropdownRef.current.contains(event.target)) {
        setShowSiteDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 2. HANDLE INPUT ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'unit') {
      setFormData({ ...formData, unit: value, site_name: '', site_id: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // --- 3. FILTER SITE & SPBU ---
  const getActiveList = () => {
    if (formData.unit === 'CNOP') return sitesList;
    if (formData.unit === 'SPBU') return spbuList;
    return [];
  };

  const filteredSites = getActiveList().filter(item => {
    const search = (formData.site_name || '').toLowerCase().trim();
    
    if (formData.unit === 'CNOP') {
      const name = (item.site_name || '').toLowerCase();
      const id = (item.site_id || '').toString().toLowerCase();
      return name.includes(search) || id.includes(search);
    } 
    
    if (formData.unit === 'SPBU') {
      const name = (item.nama_spbu || item.nama || '').toLowerCase(); 
      const code = (item.kode_spbu || '').toString().toLowerCase();
      return name.includes(search) || code.includes(search);
    }
    return false;
  });

  const selectSite = (item) => {
    let nameToSet = '';
    let idToSet = '';

    if (formData.unit === 'CNOP') {
        nameToSet = item.site_name || '';
        idToSet = item.site_id || '';
    } 
    else if (formData.unit === 'SPBU') {
        nameToSet = item.nama_spbu || item.nama || '';
        idToSet = item.kode_spbu || '';
    }
    
    setFormData({ ...formData, site_name: nameToSet, site_id: idToSet });
    setShowSiteDropdown(false);
  };

  // --- 4. FILTER TEKNISI ---
  const filteredTeknisi = teknisiList.filter(t => {
    const search = techSearchTerm.toLowerCase();
    const name = (t.name || '').toLowerCase();
    const nik = (t.nik || '').toString();
    const notSelected = !selectedTeknisi.some(selected => selected.id === t.id);
    return (name.includes(search) || nik.includes(search)) && notSelected;
  });

  const addTeknisi = (tech) => {
    setSelectedTeknisi([...selectedTeknisi, tech]);
    setTechSearchTerm('');
    setShowTechDropdown(false);
    techInputRef.current?.focus();
  };

  const removeTeknisi = (id) => setSelectedTeknisi(selectedTeknisi.filter(t => t.id !== id));

  // --- 5. SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTeknisi.length === 0) { alert("Pilih minimal satu petugas!"); return; }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const petugasString = selectedTeknisi.map(t => `${t.name} (${t.nik})`).join(', ');
      
      const payload = { ...formData, petugas: petugasString };
      
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:8000/api/tickets', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStatus({ type: 'success', message: 'Tiket berhasil dibuat!' });
      
      // Reset
      setFormData({ nomor_internal: 'Updating...', nomor_sistem: '', unit: '', jenis: '', site_name: '', site_id: '', deskripsi: '' });
      setSelectedTeknisi([]);
      
      // Refresh nomor tiket
      const ticketRes = await axios.get('http://127.0.0.1:8000/api/tickets/next-number', { headers: { Authorization: `Bearer ${token}` } });
      setFormData(prev => ({ ...prev, nomor_internal: ticketRes.data.ticket_number }));

    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Gagal membuat tiket.' });
    } finally {
      setLoading(false);
    }
  };

  // --- 6. RENDER UI ---
  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Ticket className="text-blue-600" /> Buat Tiket / Order Baru
      </h1>

      <div className="bg-white rounded-xl shadow-md border p-6 md:p-8">
        
        {status.message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">No. Tiket Internal (Otomatis)</label>
              <input type="text" value={formData.nomor_internal} readOnly className="w-full px-4 py-2 border border-blue-300 bg-gray-200 text-gray-600 rounded-lg font-mono font-bold cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">No. Tiket Sistem</label>
              <input type="text" name="nomor_sistem" value={formData.nomor_sistem} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
              <select name="unit" value={formData.unit} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500">
                <option value="">-- Pilih Unit --</option>
                <option value="CNOP">CNOP (Site Node-B)</option>
                <option value="SPBU">SPBU (Pertamina)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Tiket</label>
              <select name="jenis" value={formData.jenis} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg bg-white">
                <option value="">-- Pilih Jenis --</option>
                <option value="Incident">Incident</option>
                <option value="Request">Request</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SITE INPUT */}
            <div className="relative" ref={siteDropdownRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {formData.unit === 'SPBU' ? 'Lokasi SPBU' : 'Lokasi Site'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400"><MapPin size={18}/></span>
                <input
                  type="text"
                  name="site_name"
                  value={formData.site_name}
                  onChange={handleChange}
                  onFocus={() => setShowSiteDropdown(true)}
                  disabled={!formData.unit}
                  placeholder={!formData.unit ? "Pilih Unit Dulu..." : "Ketik nama site / ID..."}
                  autoComplete="off"
                  required
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                />
              </div>
              {showSiteDropdown && formData.unit && (
                <div className="absolute z-20 w-full bg-white border rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                  {filteredSites.length > 0 ? (
                    filteredSites.map((item, idx) => (
                      <div key={idx} onClick={() => selectSite(item)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 flex flex-col transition">
                        <span className="text-sm font-bold text-gray-800">{formData.unit === 'CNOP' ? item.site_name : (item.nama_spbu || item.nama)}</span>
                        <span className="text-xs text-gray-500">ID: {formData.unit === 'CNOP' ? item.site_id : item.kode_spbu}</span>
                      </div>
                    ))
                  ) : (<div className="p-4 text-center text-gray-500 text-sm">Tidak ditemukan.</div>)}
                </div>
              )}
            </div>

            {/* TEKNISI INPUT */}
            <div className="relative" ref={techDropdownRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Petugas / Teknisi</label>
              <div className="w-full min-h-[46px] px-2 py-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white flex flex-wrap gap-2 items-center cursor-text" onClick={() => techInputRef.current?.focus()}>
                {selectedTeknisi.map((tech) => (
                  <div key={tech.id} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    {tech.name}
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeTeknisi(tech.id); }} className="hover:bg-blue-200 rounded-full p-0.5"><X size={14} /></button>
                  </div>
                ))}
                <input ref={techInputRef} type="text" value={techSearchTerm} onChange={(e) => setTechSearchTerm(e.target.value)} onFocus={() => setShowTechDropdown(true)} placeholder={selectedTeknisi.length===0?"Cari petugas...":""} className="flex-1 min-w-[100px] outline-none bg-transparent text-sm h-8" />
              </div>
              {showTechDropdown && (
                <div className="absolute z-20 w-full bg-white border rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                  {filteredTeknisi.length > 0 ? (
                    filteredTeknisi.map((tech) => (
                      <div key={tech.id} onClick={() => addTeknisi(tech)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-full"><User size={16} /></div>
                        <div><p className="text-sm font-bold text-gray-800">{tech.name}</p><p className="text-xs text-gray-500">NIK: {tech.nik}</p></div>
                      </div>
                    ))
                  ) : (<div className="p-4 text-center text-gray-500 text-sm">Tidak ditemukan.</div>)}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
            <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows="4" required className="w-full px-4 py-2 border rounded-lg"></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition flex items-center gap-2 shadow-lg">
              {loading ? 'Mengirim...' : <><Send size={18}/> Buat Tiket</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateTicketPage;