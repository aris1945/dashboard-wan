import { X, ExternalLink } from 'lucide-react';

const SiteDetailModal = ({ site, onClose }) => {
  if (!site) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
        {/* Header Modal */}
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-bold">{site.site_id}</h2>
            <p className="text-blue-100 text-sm">{site.site_name}</p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-blue-700 p-2 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body Modal (Grid Layout) */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Group 1: Informasi Dasar */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-400 uppercase text-xs tracking-wider border-b pb-1">
                Informasi Dasar
              </h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-gray-500">STO:</span>
                <span className="font-medium text-gray-800">
                  {site.sto || "-"}
                </span>

                <span className="text-gray-500">PIC WAN:</span>
                <span className="font-medium text-gray-800">
                  {site.pic_wan || "-"}
                </span>
              </div>
            </div>

            {/* Group 2: Perangkat OLT */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-400 uppercase text-xs tracking-wider border-b pb-1">
                Perangkat OLT
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="block text-gray-500 text-xs">Nama OLT</span>
                  <span className="font-medium text-gray-800">
                    {site.olt || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs">Port OLT</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-blue-600 inline-block">
                    {site.port_olt || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs">Metro</span>
                  <span className="font-medium text-gray-800">
                    {site.metro || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs">
                    Port Metro
                  </span>
                  <span className="font-mono text-gray-600">
                    {site.port_metro || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Group 3: Metro & Transport */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-400 uppercase text-xs tracking-wider border-b pb-1">
                Data Teknis
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="block text-gray-500 text-xs">
                    Nama ODP
                  </span>
                  <span className="font-medium text-gray-800">
                    {site.odp || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs">
                    Koordinat ODP
                  </span>

                  {/* Cek apakah ada data di latlong_odp */}
                  {site.latlong_odp ? (
                    <a
                      // Google Maps bisa langsung membaca format "lat,long" dalam satu string
                      href={`https://www.google.com/maps?q=${site.latlong_odp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-mono flex items-center gap-1"
                    >
                      {site.latlong_odp}
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </div>
            </div>

            {/* Group 4: Konfigurasi VLAN */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-400 uppercase text-xs tracking-wider border-b pb-1">
                Konfigurasi VLAN
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-blue-50 p-2 rounded">
                  <span className="block text-xs text-blue-500 font-bold">
                    VLAN 2G
                  </span>
                  <span>{site.vlan_2g || "-"}</span>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <span className="block text-xs text-blue-500 font-bold">
                    VLAN 3G
                  </span>
                  <span>{site.vlan_3g || "-"}</span>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <span className="block text-xs text-blue-500 font-bold">
                    VLAN 4G
                  </span>
                  <span>{site.vlan_4g || "-"}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="block text-xs text-gray-500 font-bold">
                    VLAN OAM
                  </span>
                  <span>{site.vlan_oam || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteDetailModal;