import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { FiPlus, FiUsers, FiMessageSquare, FiShare2, FiCheckCircle, FiFile, FiFolder, FiX } from 'react-icons/fi';
import EnhancedCollaboration from '@/components/EnhancedCollaboration';

// Sample collaboration data
const sharedResources = [
  {
    id: 1,
    title: 'Unit Plan - Photosynthesis',
    type: 'Lesson Plan',
    sharedBy: 'John Smith',
    sharedDate: '2023-09-28',
    collaborators: ['Emily Chen', 'Michael Johnson']
  },
  {
    id: 2,
    title: 'World War II Primary Sources',
    type: 'Resource Pack',
    sharedBy: 'Emily Chen',
    sharedDate: '2023-09-20',
    collaborators: ['John Smith', 'Sarah Williams']
  },
  {
    id: 3,
    title: 'Math Assessment - Fractions',
    type: 'Assessment',
    sharedBy: 'Sarah Williams',
    sharedDate: '2023-09-15',
    collaborators: ['John Smith', 'Michael Johnson', 'David Lee']
  }
];

const teams = [
  {
    id: 1,
    name: 'Science Department',
    members: 8,
    recentActivity: 'New resource added',
    lastActive: '2 hours ago'
  },
  {
    id: 2,
    name: 'Grade 10 Team',
    members: 5,
    recentActivity: 'Meeting scheduled',
    lastActive: '1 day ago'
  },
  {
    id: 3,
    name: 'Curriculum Committee',
    members: 6,
    recentActivity: 'Document updated',
    lastActive: '3 days ago'
  }
];

export default function Collaboration() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEnhancedMode, setShowEnhancedMode] = useState(true);
  const [activeTab, setActiveTab] = useState('teams');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<{message: string, type: string}[]>([]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Show notification toast
  const addNotification = (message: string, type: string = 'info') => {
    const newNotification = { message, type };
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== newNotification));
    }, 3000);
  };

  // Handle toggle of enhanced mode
  const handleToggleEnhancedMode = () => {
    setShowEnhancedMode(!showEnhancedMode);
    addNotification(
      !showEnhancedMode ? 'Enhanced collaboration mode enabled' : 'Switched to basic collaboration mode',
      !showEnhancedMode ? 'success' : 'info'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Collaboration | TeachPrep AI</title>
        <meta name="description" content="Collaborate with other teachers on lesson plans and resources" />
      </Head>

      <Header setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        
        <main className="flex-1 p-4 md:p-6 transition-all duration-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FiUsers className="mr-3 h-8 w-8 text-primary" />
                Collaboration
              </h1>
              
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="mr-0 sm:mr-4 w-full sm:w-auto">
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={showEnhancedMode}
                      onChange={handleToggleEnhancedMode}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700 whitespace-nowrap">Enhanced Mode</span>
                  </label>
                </div>
                
                <div className="flex space-x-2 w-full sm:w-auto">
                  <button 
                    className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none transition-all duration-200 transform hover:-translate-y-0.5"
                    onClick={() => addNotification('Creating a new team', 'success')}
                  >
                    <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                    Create Team
                  </button>
                  <button 
                    className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all duration-200"
                    onClick={() => addNotification('Resource sharing dialog opened', 'info')}
                  >
                    <FiShare2 className="mr-2 -ml-1 h-5 w-5" />
                    Share Resource
                  </button>
                </div>
              </div>
            </div>

            {/* Loading skeleton */}
            {loading ? (
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 mb-4 rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                  <div className="h-64 bg-gray-200 rounded-lg col-span-2"></div>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
            {showEnhancedMode ? (
              <EnhancedCollaboration />
            ) : (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="border-b border-gray-200">
                    <nav className="flex -mb-px" aria-label="Tabs">
                      <button
                        onClick={() => setActiveTab('teams')}
                        className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                          activeTab === 'teams'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <FiUsers className="inline-block mr-2 h-5 w-5" />
                        My Teams
                      </button>
                      <button
                        onClick={() => setActiveTab('shared')}
                        className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                          activeTab === 'shared'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <FiFile className="inline-block mr-2 h-5 w-5" />
                        Shared Resources
                      </button>
                    </nav>
                  </div>
                  
                    <div className="p-4">
                      <p className="text-center text-gray-500 py-8">
                        Enable Enhanced Mode for a richer collaboration experience
                      </p>
                    </div>
                    </div>
                  )}
                </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Notification toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((notification, index) => (
          <div 
            key={index}
            className={`flex items-center p-4 rounded-lg shadow-lg max-w-xs sm:max-w-sm transition-all duration-300 animate-slideIn ${
              notification.type === 'success' ? 'bg-green-100 border-l-4 border-green-500 text-green-700' :
              notification.type === 'error' ? 'bg-red-100 border-l-4 border-red-500 text-red-700' :
              'bg-blue-100 border-l-4 border-blue-500 text-blue-700'
            }`}
          >
            <div className="flex-1">
              {notification.type === 'success' && <FiCheckCircle className="inline-block mr-2" />}
              {notification.message}
            </div>
            <button 
              onClick={() => setNotifications(prev => prev.filter((_, i) => i !== index))}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 