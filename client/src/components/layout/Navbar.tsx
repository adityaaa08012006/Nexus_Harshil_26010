import React from 'react';
import logo from '../../assets/public/logo1.png';
import { Link } from 'react-router-dom';

interface NavbarProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ userName, userRole, onLogout }) => {
  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
             <img src={logo} alt="Godam Solutions" className="h-10 w-auto" />
          </Link>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            {userName && (
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">{userName}</span>
                {userRole && <span className="text-xs text-gray-500">{userRole}</span>}
              </div>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors min-h-[44px]"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
