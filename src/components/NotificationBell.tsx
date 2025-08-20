import React, { useState } from 'react';
import { FiBell } from 'react-icons/fi';
import { useAppContext } from '@/context/AppContext';

export default function NotificationBell() {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useAppContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id);
  };
  
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const timeDiff = now.getTime() - new Date(date).getTime();
    
    // Less than a minute
    if (timeDiff < 60000) {
      return 'Just now';
    }
    
    // Less than an hour
    if (timeDiff < 3600000) {
      const minutes = Math.floor(timeDiff / 60000);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than a day
    if (timeDiff < 86400000) {
      const hours = Math.floor(timeDiff / 3600000);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // More than a day
    const days = Math.floor(timeDiff / 86400000);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  };
  
  return (
    <div className="relative">
      <button
        className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary relative"
        onClick={toggleDropdown}
      >
        <span className="sr-only">View notifications</span>
        <FiBell className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isDropdownOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10">
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  className="text-xs text-primary hover:text-primary-dark"
                  onClick={clearAllNotifications}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${notification.isRead ? 'opacity-70' : 'font-semibold'}`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-grow">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTimestamp(notification.timestamp)}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${notification.isRead ? 'bg-transparent' : 'bg-primary'}`}></div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 