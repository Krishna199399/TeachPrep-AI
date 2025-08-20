import { useState } from 'react';
import { FiMenu, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import Link from 'next/link';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { useAppContext } from '@/context/AppContext';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const { logout } = useAuth();
  const { user } = useAppContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <header className="header-container sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              type="button"
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <FiMenu className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary header-logo">TeachPrep AI</span>
            </div>
          </div>
          <div className="flex items-center">
            <NotificationBell />

            <div className="ml-3 relative">
              <div>
                <button 
                  onClick={toggleProfileDropdown}
                  className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.fullName} className="h-10 w-10 rounded-full" />
                    ) : (
                      <span>{user.fullName.charAt(0)}</span>
                    )}
                  </div>
                </button>
              </div>
              
              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 dropdown-menu">
                  <div className="py-2 border-b border-gray-100">
                    <div className="px-4 py-2">
                      <p className="text-sm font-semibold dropdown-username">{user.fullName}</p>
                      <p className="text-xs dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <Link 
                      href="/settings" 
                      className="flex items-center px-4 py-2 text-sm dropdown-item" 
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FiSettings className="mr-3 h-4 w-4 dropdown-icon" />
                      Settings
                    </Link>
                    
                    <button 
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm dropdown-item"
                    >
                      <FiLogOut className="mr-3 h-4 w-4 dropdown-icon" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 