import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FiX, 
  FiHome, 
  FiCalendar, 
  FiBookOpen, 
  FiFileText, 
  FiUsers, 
  FiSettings,
  FiCheckCircle,
  FiShield,
  FiGrid,
  FiCpu
} from 'react-icons/fi';
import { useAppContext } from '@/context/AppContext';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionGate from './PermissionGate';
import { Permission } from '@/utils/permissions';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  current: boolean;
  permission?: Permission | null;
  roles?: string[];
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const router = useRouter();
  const { user } = useAppContext();
  const { can, role } = usePermissions();
  
  // Common navigation items for all users
  const commonNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: FiHome, current: router.pathname === '/' },
  ];
  
  // Navigation items based on permissions
  const permissionBasedNavigation: NavigationItem[] = [
    { 
      name: 'Lesson Planner', 
      href: '/planner', 
      icon: FiCalendar, 
      current: router.pathname === '/planner',
      permission: 'create:lesson' as Permission
    },
    { 
      name: 'Lesson Plans', 
      href: '/lesson-plans', 
      icon: FiFileText, 
      current: router.pathname === '/lesson-plans',
      permission: 'create:lesson' as Permission
    },
    { 
      name: 'Resource Library', 
      href: '/resources', 
      icon: FiBookOpen, 
      current: router.pathname === '/resources',
      permission: 'create:resource' as Permission
    },
    { 
      name: 'Assessment Tools', 
      href: '/assessments', 
      icon: FiFileText, 
      current: router.pathname === '/assessments',
      permission: 'create:assessment' as Permission
    },
    { 
      name: 'AI Tools', 
      href: '/ai-tools', 
      icon: FiCpu, 
      current: router.pathname === '/ai-tools',
      permission: null  // Available to all
    },
    { 
      name: 'Collaboration', 
      href: '/collaboration', 
      icon: FiUsers, 
      current: router.pathname === '/collaboration',
      permission: null  // Available to all
    },
  ];
  
  // Admin-only navigation items
  const adminNavigation: NavigationItem[] = [
    { 
      name: 'Approval Queue', 
      href: '/approval-queue', 
      icon: FiCheckCircle, 
      current: router.pathname === '/approval-queue',
      roles: ['Administrator', 'Department Head']
    },
    { 
      name: 'User Management', 
      href: '/user-management', 
      icon: FiUsers, 
      current: router.pathname === '/user-management',
      roles: ['Administrator']
    },
    { 
      name: 'System Settings', 
      href: '/system-settings', 
      icon: FiShield, 
      current: router.pathname === '/system-settings',
      roles: ['Administrator']
    },
  ];
  
  // Settings is available to all users
  const settingsNavigation: NavigationItem[] = [
    { name: 'Settings', href: '/settings', icon: FiSettings, current: router.pathname === '/settings' },
  ];
  
  // Filter navigation items based on user permissions
  const getFilteredNavigation = () => {
    // Add common navigation items
    const filteredNavigation = [...commonNavigation];
    
    // Add permission-based items based on user permissions
    permissionBasedNavigation.forEach(item => {
      if (!item.permission || can(item.permission)) {
        filteredNavigation.push(item);
      }
    });
    
    // Add admin-only items if user has the right role
    adminNavigation.forEach(item => {
      if (item.roles && item.roles.includes(role)) {
        filteredNavigation.push(item);
      }
    });
    
    // Add settings navigation
    filteredNavigation.push(...settingsNavigation);
    
    return filteredNavigation;
  };
  
  const navigation = getFilteredNavigation();

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col z-30 max-w-xs w-full transform transition-transform duration-300 ease-in-out md:relative md:h-screen sidebar-container ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:sticky md:top-0`}
      >
        <div className="absolute top-0 right-0 -mr-12 pt-2 md:hidden">
          <button
            type="button"
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <FiX className="h-6 w-6 text-white" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {user && (
            <div className="px-4 mb-6">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-semibold">
                  {user.fullName.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold sidebar-username">{user.fullName}</p>
                  <p className="text-xs sidebar-role">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="mt-5 flex-1 px-2 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-3 text-base font-medium rounded-md transition-all duration-150 ${
                  item.current
                    ? 'bg-primary text-white sidebar-active-item'
                    : 'sidebar-item hover:bg-opacity-10'
                }`}
                onClick={() => setOpen(false)}
              >
                <item.icon
                  className={`mr-4 h-5 w-5 ${
                    item.current ? 'text-white' : 'sidebar-icon'
                  }`}
                  aria-hidden="true"
                />
                <span className="sidebar-text">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
} 