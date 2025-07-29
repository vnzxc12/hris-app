import React, { useContext } from 'react';
import { Home, Users, FileText, Settings, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import logo from './assets/logo.png'; // adjust the path if needed

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

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
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <aside className="w-64 h-screen bg-[#6a8932] text-white fixed top-0 left-0 z-50 shadow-md flex flex-col justify-between">

      <div>
        {/* Logo at the top center */}
        <div className="p-6 flex justify-center items-center border-b border-white/20">
  <img
    src={logo}
    alt="Logo"
    className="h-50 w-auto object-contain"
  />
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
