import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import Header from "./Header";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = isDesktop ? setSidebarOpen : setMobileOpen;

  const sidebarWidth = sidebarOpen ? 257 : 81;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* SIDEBAR */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        isDesktop={isDesktop}
      />

      {/* MAIN AREA */}
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{
          marginLeft: isDesktop ? sidebarWidth : 0,
        }}
      >
        {/* HEADER */}
        <Header
          sidebarOpen={isDesktop ? sidebarOpen : mobileOpen}
          setSidebarOpen={toggleSidebar}
          isDesktop={isDesktop}
          sidebarWidth={sidebarWidth}
        />

        {/* PAGE CONTENT */}
        <main
          className={`
            flex-1 overflow-auto
            p-2 md:p-4
            mt-14
            text-gray-800 dark:text-gray-100
          `}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
