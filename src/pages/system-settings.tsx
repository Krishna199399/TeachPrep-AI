import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { 
  FiSave, 
  FiShield, 
  FiSettings, 
  FiFileText,
  FiTrash2,
  FiCpu,
  FiCheckCircle,
  FiMail,
  FiBook,
  FiLock
} from 'react-icons/fi';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionGate from '@/components/PermissionGate';

// Setting types
type SettingType = 'text' | 'number' | 'email' | 'switch' | 'select' | 'colorPicker';

// Custom icon components for missing icons
const FiGlobe = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const FiPenTool = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
    <path d="M2 2l7.586 7.586"></path>
    <circle cx="11" cy="11" r="2"></circle>
  </svg>
);

const FiDatabase = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

const FiCode = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

const FiServer = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
    <line x1="6" y1="6" x2="6.01" y2="6"></line>
    <line x1="6" y1="18" x2="6.01" y2="18"></line>
  </svg>
);

const FiRefreshCw = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

const FiAlertCircle = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const FiCreditCard = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

const FiCloudSnow = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path>
    <line x1="8" y1="16" x2="8.01" y2="16"></line>
    <line x1="8" y1="20" x2="8.01" y2="20"></line>
    <line x1="12" y1="18" x2="12.01" y2="18"></line>
    <line x1="12" y1="22" x2="12.01" y2="22"></line>
    <line x1="16" y1="16" x2="16.01" y2="16"></line>
    <line x1="16" y1="20" x2="16.01" y2="20"></line>
  </svg>
);

const FiClock = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

interface SettingOption {
  value: string;
  label: string;
}

interface Setting {
  id: string;
  label: string;
  description: string;
  type: SettingType;
  value: string | boolean | number;
  category: 'general' | 'security' | 'content' | 'advanced';
  options?: SettingOption[];
  icon?: JSX.Element;
}

// Default settings data
const defaultSettings: Setting[] = [
  // General settings
  {
    id: 'system-name',
    label: 'System Name',
    description: 'The name of your TeachPrep AI instance',
    type: 'text',
    value: 'TeachPrep AI',
    category: 'general',
    icon: <FiSettings className="text-indigo-400" />
  },
  {
    id: 'school-name',
    label: 'School/Institution Name',
    description: 'The name of your school or institution',
    type: 'text',
    value: 'Springfield High School',
    category: 'general',
    icon: <FiBook className="text-green-400" />
  },
  {
    id: 'admin-email',
    label: 'Admin Email',
    description: 'Primary contact email for system notifications',
    type: 'email',
    value: 'admin@school.edu',
    category: 'general',
    icon: <FiMail className="text-blue-400" />
  },
  {
    id: 'system-language',
    label: 'Default Language',
    description: 'System-wide default language',
    type: 'select',
    value: 'en',
    category: 'general',
    icon: <FiGlobe className="text-purple-400" />,
    options: [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
      { value: 'de', label: 'German' },
      { value: 'zh', label: 'Chinese' },
      { value: 'ja', label: 'Japanese' },
      { value: 'hi', label: 'Hindi' }
    ]
  },
  {
    id: 'primary-color',
    label: 'Primary Color',
    description: 'Main color theme for the platform',
    type: 'colorPicker',
    value: '#6366f1',
    category: 'general',
    icon: <FiPenTool className="text-pink-400" />
  },

  // Security settings
  {
    id: 'session-timeout',
    label: 'Session Timeout (minutes)',
    description: 'How long until an inactive user is automatically logged out',
    type: 'number',
    value: 30,
    category: 'security',
    icon: <FiClock className="text-amber-400" />
  },
  {
    id: 'password-policy',
    label: 'Password Policy',
    description: 'Minimum requirements for user passwords',
    type: 'select',
    value: 'medium',
    category: 'security',
    icon: <FiLock className="text-red-400" />,
    options: [
      { value: 'basic', label: 'Basic (8+ characters)' },
      { value: 'medium', label: 'Medium (8+ chars, 1 number, 1 special)' },
      { value: 'strong', label: 'Strong (12+ chars, upper/lower, numbers, special)' }
    ]
  },
  {
    id: 'two-factor-auth',
    label: 'Two-Factor Authentication',
    description: 'Require two-factor authentication for all users',
    type: 'switch',
    value: false,
    category: 'security',
    icon: <FiShield className="text-emerald-400" />
  },
  {
    id: 'account-lockout',
    label: 'Account Lockout',
    description: 'Lock accounts after failed login attempts',
    type: 'switch',
    value: true,
    category: 'security',
    icon: <FiAlertCircle className="text-red-400" />
  },

  // Content settings
  {
    id: 'approval-required',
    label: 'Content Approval Required',
    description: 'Require approval for content created by Student Teachers',
    type: 'switch',
    value: true,
    category: 'content',
    icon: <FiCheckCircle className="text-green-400" />
  },
  {
    id: 'allow-ai-generation',
    label: 'Allow AI Content Generation',
    description: 'Enable AI-powered content generation tools',
    type: 'switch',
    value: true,
    category: 'content',
    icon: <FiCpu className="text-purple-400" />
  },
  {
    id: 'default-content-license',
    label: 'Default Content License',
    description: 'Default license applied to new content',
    type: 'select',
    value: 'cc-by',
    category: 'content',
    icon: <FiFileText className="text-blue-400" />,
    options: [
      { value: 'all-rights', label: 'All Rights Reserved' },
      { value: 'cc-by', label: 'Creative Commons (CC BY)' },
      { value: 'cc-by-sa', label: 'Creative Commons (CC BY-SA)' },
      { value: 'cc-0', label: 'Creative Commons Zero (CC0)' }
    ]
  },

  // Advanced settings
  {
    id: 'data-retention',
    label: 'Data Retention Period (days)',
    description: 'How long to keep user activity logs',
    type: 'number',
    value: 90,
    category: 'advanced',
    icon: <FiDatabase className="text-amber-400" />
  },
  {
    id: 'enable-api',
    label: 'Enable External API',
    description: 'Allow external applications to connect via API',
    type: 'switch',
    value: false,
    category: 'advanced',
    icon: <FiCode className="text-indigo-400" />
  },
  {
    id: 'debug-mode',
    label: 'Debug Mode',
    description: 'Enable detailed error logging',
    type: 'switch',
    value: false,
    category: 'advanced',
    icon: <FiServer className="text-red-400" />
  }
];

export default function SystemSettings() {
  const { isAdmin } = usePermissions();
  const [settings, setSettings] = useState<Setting[]>(defaultSettings);
  const [activeCategory, setActiveCategory] = useState<Setting['category']>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Categories for the sidebar
  const categories = [
    { id: 'general', label: 'General', icon: <FiSettings /> },
    { id: 'security', label: 'Security', icon: <FiShield /> },
    { id: 'content', label: 'Content', icon: <FiFileText /> },
    { id: 'advanced', label: 'Advanced', icon: <FiCpu /> }
  ];

  // Load settings from localStorage on initial render
  useEffect(() => {
    const storedSettings = localStorage.getItem('systemSettings');
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.error('Error parsing stored settings', e);
      }
    }
    
    // Simulate loading to demonstrate animation
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  // Filter settings by category and search term
  const filteredSettings = settings.filter(setting => 
    setting.category === activeCategory && 
    (searchTerm === '' || 
      setting.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Update setting value
  const updateSetting = (id: string, value: string | boolean | number) => {
    const updatedSettings = settings.map(setting =>
      setting.id === id ? { ...setting, value } : setting
    );
    setSettings(updatedSettings);
    setHasChanges(true);
    
    // Show notification
    showNotification('Setting updated', 'success');
  };

  // Reset settings to defaults
  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      setSettings(defaultSettings);
      setHasChanges(true);
      showNotification('Settings reset to defaults', 'warning');
    }
  };

  // Save settings
  const saveSettings = () => {
    try {
      // Save to localStorage
      localStorage.setItem('systemSettings', JSON.stringify(settings));
    
    // Show success message
    setSaveSuccess(true);
    setHasChanges(false);
      showNotification('Settings saved successfully!', 'success');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      showNotification('Error saving settings. Please try again.', 'error');
    }
  };

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Render different input types based on setting type
  const renderSettingInput = (setting: Setting) => {
    switch (setting.type) {
      case 'text':
      case 'email':
        return (
          <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type={setting.type}
            id={setting.id}
              className="block w-full py-3 px-4 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm transition-all duration-200 hover:border-primary"
            value={setting.value as string}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
              placeholder={`Enter ${setting.label.toLowerCase()}`}
          />
          </div>
        );
      
      case 'number':
        return (
          <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="number"
            id={setting.id}
              className="block w-full py-3 px-4 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm transition-all duration-200 hover:border-primary"
            value={setting.value as number}
            onChange={(e) => updateSetting(setting.id, parseInt(e.target.value, 10) || 0)}
              min={0}
          />
          </div>
        );
      
      case 'switch':
        return (
          <div className="mt-1 flex items-center">
            <button
              type="button"
              onClick={() => updateSetting(setting.id, !setting.value)}
              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                setting.value ? 'bg-primary' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={setting.value as boolean}
            >
              <span
                className={`pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-300 ${
                  setting.value ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                <span
                  className={`absolute inset-0 h-full w-full flex items-center justify-center transition-opacity ${
                    setting.value ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'
                  }`}
                >
                  <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                    <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"></path>
                  </svg>
                </span>
                <span
                  className={`absolute inset-0 h-full w-full flex items-center justify-center transition-opacity ${
                    setting.value ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'
                  }`}
                >
                  <svg className="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                  </svg>
                </span>
              </span>
            </button>
            <span className="ml-3 text-sm">
              {setting.value ? (
                <span className="text-green-600 font-medium flex items-center">
                  <FiCheckCircle className="mr-1" /> Enabled
                </span>
              ) : (
                <span className="text-gray-500">Disabled</span>
              )}
            </span>
          </div>
        );
      
      case 'select':
        return (
          <div className="mt-1 relative rounded-md shadow-sm">
          <select
            id={setting.id}
              className="block w-full py-3 px-4 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm transition-all duration-200 hover:border-primary"
            value={setting.value as string}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
          >
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        );

      case 'colorPicker':
        return (
          <div className="mt-1 flex items-center">
            <input
              type="color"
              id={setting.id}
              className="w-10 h-10 rounded-md border-2 border-gray-300 cursor-pointer"
              value={setting.value as string}
              onChange={(e) => updateSetting(setting.id, e.target.value)}
            />
            <input
              type="text"
              className="ml-2 block w-36 py-2 px-3 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              value={setting.value as string}
              onChange={(e) => updateSetting(setting.id, e.target.value)}
              placeholder="#RRGGBB"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Layout>
        <Head>
          <title>System Settings | TeachPrep AI</title>
          <meta name="description" content="Manage system settings for TeachPrep AI" />
        </Head>
        
        <div className="p-6 animate-pulse">
          <PermissionGate role="Administrator">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="h-8 w-64 bg-gray-200 rounded"></div>
                <div className="flex space-x-2">
                  <div className="h-10 w-36 bg-gray-200 rounded-md"></div>
                  <div className="h-10 w-36 bg-gray-200 rounded-md"></div>
                </div>
              </div>
              
              <div className="flex space-x-6">
                <div className="w-64 space-y-2">
                  <div className="h-12 bg-gray-200 rounded-md"></div>
                  <div className="h-12 bg-gray-200 rounded-md"></div>
                  <div className="h-12 bg-gray-200 rounded-md"></div>
                  <div className="h-12 bg-gray-200 rounded-md"></div>
                </div>
                
                <div className="flex-1 bg-gray-100 rounded-lg p-6">
                  <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-5 w-36 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded-md"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </PermissionGate>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>System Settings | TeachPrep AI</title>
        <meta name="description" content="Manage system settings for TeachPrep AI" />
      </Head>
      
      <div className="p-6 animate-fadeIn">
        <PermissionGate role="Administrator">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FiSettings className="mr-3 h-8 w-8 text-primary" />
                System Settings
              </h1>
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                  onClick={resetToDefaults}
                >
                  <FiRefreshCw className="mr-2 -ml-1 h-5 w-5 text-gray-500" />
                  Reset to Defaults
                </button>
                <button
                  type="button"
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:-translate-y-0.5 ${
                    !hasChanges ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={saveSettings}
                  disabled={!hasChanges}
                >
                  <FiSave className="mr-2 -ml-1 h-5 w-5" />
                  Save Changes
                </button>
              </div>
            </div>
            
            {notification && (
              <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-md z-50 animate-slideIn transition-all duration-300 ${
                notification.type === 'success' ? 'bg-green-100 border-l-4 border-green-500 text-green-700' :
                notification.type === 'error' ? 'bg-red-100 border-l-4 border-red-500 text-red-700' :
                'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700'
              }`}>
                <div className="flex items-center">
                  {notification.type === 'success' && <FiCheckCircle className="h-5 w-5 mr-2" />}
                  {notification.type === 'error' && <FiAlertCircle className="h-5 w-5 mr-2" />}
                  {notification.type === 'warning' && <FiAlertCircle className="h-5 w-5 mr-2" />}
                  <p>{notification.message}</p>
                </div>
              </div>
            )}
            
            <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
              <div className="w-full md:w-64 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4">
                  <h2 className="text-lg font-medium text-gray-900 mb-3">Settings</h2>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Search settings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <nav className="mt-2 px-2 pb-4">
                  {categories.map((category) => (
                  <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id as Setting['category'])}
                      className={`w-full text-left px-3 py-3 flex items-center rounded-md text-sm font-medium transition-colors duration-150 ${
                        activeCategory === category.id
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    >
                      <span className={`mr-3 ${activeCategory === category.id ? 'text-white' : 'text-gray-500'}`}>
                        {category.icon}
                      </span>
                      {category.label}
                      <span className="ml-auto bg-white bg-opacity-20 rounded-full px-2 py-0.5 text-xs">
                        {settings.filter(s => s.category === category.id).length}
                      </span>
                  </button>
                  ))}
                </nav>
              </div>
              
              <div className="flex-1 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-medium text-gray-900 flex items-center mb-6">
                  <span className="capitalize">{activeCategory}</span> Settings
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({filteredSettings.length} {filteredSettings.length === 1 ? 'setting' : 'settings'})
                  </span>
                </h2>

                {filteredSettings.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <FiFileText className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No settings found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? `No settings match "${searchTerm}"` : 'No settings in this category'}
                    </p>
                  </div>
                )}
                
                <div className="space-y-8">
                  {filteredSettings.map((setting) => (
                    <div key={setting.id} className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">{setting.icon}</div>
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-2 md:mb-0">
                        <label htmlFor={setting.id} className="block text-sm font-medium text-gray-700">
                          {setting.label}
                        </label>
                              <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
                            </div>
                            <div className="md:w-1/2 lg:w-1/3">
                              {renderSettingInput(setting)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PermissionGate>
      </div>
    </Layout>
  );
} 