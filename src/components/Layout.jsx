import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const Layout = ({ children }) => {
  // Ambil preferensi dari localStorage atau default ke light
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  // Efek untuk mengganti class di elemen root (html)
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    // bg-gray-50 untuk light mode, bg-slate-950 untuk dark mode
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full max-w-[1400px] mx-auto px-6 py-6">
        
        {/* Header Kecil untuk Toggle Dark Mode */}
        

        {/* Container untuk konten */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;