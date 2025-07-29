import React, { useContext } from 'react';
import { Home, Users, FileText, Settings, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // adjust if path is different

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext); // Add this line

  const menuItems = [
    { name: 'Dashboard', icon: <Home size={18} />, path: '/' },
    { name: 'Employees', icon: <Users size={18} />, path: '/employees' },
    { name: 'Documents', icon: <FileText size={18} />, path: '/documents' },
    { name: 'Settings', icon: <Settings size={18} />, path: '/settings' },
  ];

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      setUser(null); // <- this updates the App.js state
      navigate('/login');
    }
  };

  return (
    <aside className="w-64 h-screen bg-[#5DBB63] text-white fixed top-0 left-0 z-50 shadow-md flex flex-col justify-between">
      <div>
        <div className="p-6 text-center border-b border-white/20">
          <h1 className="text-xl font-bold">HRIS</h1>
          <p className="text-xs text-white/80">Human Resource System</p>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map(({ name, icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={name}
                to={path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-white text-[#5DBB63]'
                    : 'hover:bg-white/20 text-white'}`}
              >
                {icon}
                {name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-white/20">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 w-full text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
