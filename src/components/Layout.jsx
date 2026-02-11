const Layout = ({ children }) => {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 py-6">
      {/* Container putih untuk konten - mirip dengan daftar tiket */}
      {children}
    </div>
  );
};

export default Layout;