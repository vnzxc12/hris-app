import React, { useContext } from 'react';
import {
  Home as HomeIcon,
  User,
  Users,
  File,
  Clock,
  LogOut,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import logo from './assets/logo.png';


const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  const menuItems = [
    { name: 'Home', icon: <HomeIcon size={18} />, path: '/home' },
    { name: 'My Info', icon: <User size={18} />, path: '/my-info' },
    { name: 'People', icon: <Users size={18} />, path: '/employees' },
    { name: 'Files', icon: <File size={18} />, path: '/files' },
    
  ];

  // Role-based item
 if (user?.role === 'admin') {
  menuItems.push(
    {
      name: 'Time Logs',
      icon: <Clock size={18} />,
      path: '/time-logs',
    },
    {
      name: 'Payroll',
      icon: <File size={18} />, // You can change to another icon if you want
      path: '/payroll',
    }
    
  );
  
    
  } else {
    menuItems.push({
      name: 'Time Tracker',
      icon: <Clock size={18} />,
      path: '/time-tracker',
    });
  }

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
        {/* Logo */}
        <div className="p-6 flex justify-center items-center border-b border-white/20">
          <img src={logo} alt="Logo" className="h-50 w-auto object-contain" />
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
