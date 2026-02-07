import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SitesPage from './pages/SitesPage';
import OdcPage from './pages/OdcPage';
import NearestOdpPage from './pages/NearestOdpPage';
import AbsensiPage from './pages/AbsensiPage';
import SpbuPage from './pages/SpbuPage';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketListPage from './pages/TicketListPage';

// Import Layout
import DashboardLayout from './components/DashboardLayout';

// Halaman Dummy
const DummyPage = ({ title }) => (
  <div className="p-10 text-center bg-white rounded shadow">
    <h2 className="text-2xl font-bold text-gray-400">Halaman {title}</h2>
    <p className="text-gray-500 mt-2">Sedang dalam pengembangan.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        
        {/* 1. Route Publik (Halaman Login) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 2. Route Terproteksi (Dashboard) */}
        {/* Semua route di dalam ini akan otomatis punya Sidebar & Header */}
        <Route element={<DashboardLayout />}>
           {/* Redirect root '/' ke sites atau dashboard */}
           <Route path="/" element={<DummyPage title="Dashboard Home" />} />
           <Route path="/odc" element={<OdcPage />} />
           <Route path="/odp-nearest" element={<NearestOdpPage />} />
            <Route path="/absensi" element={<AbsensiPage />} />
            <Route path="/spbu" element={<SpbuPage />} />
           <Route path="/sites" element={<SitesPage />} />
           <Route path="/topology" element={<DummyPage title="Topologi" />} />
           <Route path="/settings" element={<DummyPage title="Pengaturan" />} />
<Route path="/tickets/create" element={<CreateTicketPage />} />
<Route path="/tickets" element={<TicketListPage />} />
        </Route>

        {/* Redirect sembarang URL ke login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;