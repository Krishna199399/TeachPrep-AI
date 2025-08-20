import { useState, useEffect, ChangeEvent } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FiUser, FiBell, FiBookOpen, FiSettings, FiSave, FiFileText, FiShield, FiLock, FiLogOut } from 'react-icons/fi';
import { BsSun, BsMoonStarsFill, BsDisplayFill } from 'react-icons/bs';
import { useAppContext } from '@/context/AppContext';
import { UserPreferences, defaultPreferences, loadUserPreferences, saveAndApplyPreferences, previewTheme, previewFontSize } from '@/utils/themeUtils';
import { useAuth } from '@/context/AuthContext';

// Account settings interface
interface AccountSettings {
  twoFactorEnabled: boolean;
  passwordLastChanged: string;
  activeDevices: {
    id: string;
    name: string;
    lastActive: string;
  }[];
  loginNotifications: boolean;
  dataSharing: boolean;
}

export default function Settings() {
  const { user, updateUserProfile, notificationSettings, updateNotificationSettings, showNotification } = useAppContext();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form states
  const [profileForm, setProfileForm] = useState(user);
  const [localNotificationSettings, setLocalNotificationSettings] = useState(notificationSettings);
  
  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [hasPreferenceChanges, setHasPreferenceChanges] = useState(false);
  
  // Account settings state
  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    twoFactorEnabled: false,
    passwordLastChanged: '2 months ago',
    activeDevices: [
      { id: 'device1', name: 'Chrome on Windows', lastActive: 'Current session' },
      { id: 'device2', name: 'TeachPrep Mobile App', lastActive: 'Yesterday' },
    ],
    loginNotifications: true,
    dataSharing: true
  });
  
  // Update local state when context changes
  useEffect(() => {
    setProfileForm(user);
  }, [user]);
  
  useEffect(() => {
    setLocalNotificationSettings(notificationSettings);
  }, [notificationSettings]);
  
  // Load saved preferences from localStorage on component mount
  useEffect(() => {
    const savedPrefs = loadUserPreferences();
    setPreferences(savedPrefs);
    
    // Load saved account settings
    const savedAccountSettings = localStorage.getItem('accountSettings');
    if (savedAccountSettings) {
      try {
        const parsedSettings = JSON.parse(savedAccountSettings);
        setAccountSettings(parsedSettings);
      } catch (e) {
        console.error('Error parsing account settings from localStorage:', e);
      }
    }
  }, []);
  
  const handleProfileChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
  };
  
  const handleNotificationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setLocalNotificationSettings({
      ...localNotificationSettings,
      [name]: checked
    });
  };
  
  // Handle preference changes
  const handlePreferenceChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    // Live preview for theme changes
    if (name === 'theme') {
      previewTheme(value as UserPreferences['theme']);
    }
    
    // Live preview for font size changes
    if (name === 'fontSize') {
      previewFontSize(value as UserPreferences['fontSize']);
    }
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., lessonDefaults.showObjectives)
      const [parent, child] = name.split('.');
      if (parent === 'lessonDefaults') {
        setPreferences({
          ...preferences,
          lessonDefaults: {
            ...preferences.lessonDefaults,
            [child]: newValue
          }
        });
      }
    } else {
      setPreferences({
        ...preferences,
        [name]: newValue
      });
    }
    
    setHasPreferenceChanges(true);
  };
  
  // Handle account setting changes
  const handleAccountSettingChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setAccountSettings({
      ...accountSettings,
      [name]: checked
    });
  };
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(profileForm);
  };
  
  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationSettings(localNotificationSettings);
  };
  
  // Handle preferences save
  const handlePreferenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save preferences to localStorage and apply immediately
    saveAndApplyPreferences(preferences);
    
    setHasPreferenceChanges(false);
    showNotification('Preferences saved successfully!', 'success');
  };

  // Reset preferences to defaults
  const resetPreferences = () => {
    if (window.confirm('Are you sure you want to reset preferences to defaults?')) {
      setPreferences(defaultPreferences);
      setHasPreferenceChanges(true);
    }
  };
  
  // Handle account settings submit
  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save account settings to the server/localStorage
    localStorage.setItem('accountSettings', JSON.stringify(accountSettings));
    // Show success notification
    showNotification('Account settings updated successfully!', 'success');
  };
  
  // Remove a device
  const handleRemoveDevice = (deviceId: string) => {
    if (window.confirm('Are you sure you want to remove this device?')) {
      setAccountSettings({
        ...accountSettings,
        activeDevices: accountSettings.activeDevices.filter(device => device.id !== deviceId)
      });
      // Save updated devices to localStorage
      setTimeout(() => {
        localStorage.setItem('accountSettings', JSON.stringify({
          ...accountSettings,
          activeDevices: accountSettings.activeDevices.filter(device => device.id !== deviceId)
        }));
      }, 0);
      showNotification('Device removed successfully', 'success');
    }
  };

  // Change password functionality
  const handleChangePassword = () => {
    // In a real app, this would open a modal with password change form
    const currentPassword = prompt('Enter current password:');
    if (!currentPassword) return;
    
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;
    
    const confirmPassword = prompt('Confirm new password:');
    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }
    
    // Simulate API call to change password
    setTimeout(() => {
      // Update last changed date
      const newSettings = {
        ...accountSettings,
        passwordLastChanged: 'Just now'
      };
      setAccountSettings(newSettings);
      localStorage.setItem('accountSettings', JSON.stringify(newSettings));
      showNotification('Password changed successfully', 'success');
    }, 1000);
  };
  
  // Download user data
  const handleDownloadData = () => {
    // Prepare user data for export
    const userData = {
      profile: user,
      preferences: preferences,
      accountSettings: accountSettings,
      notificationSettings: notificationSettings,
      // Add more user data as needed
      exportDate: new Date().toISOString()
    };
    
    // Convert to JSON and create download link
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    // Create download link and trigger click
    const a = document.createElement('a');
    a.href = url;
    a.download = `teachprep-user-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    showNotification('Your data has been downloaded', 'success');
  };
  
  // Deactivate account
  const handleDeactivateAccount = () => {
    if (window.confirm('Are you sure you want to deactivate your account? This action may be irreversible.')) {
      // Simulate API call to deactivate account
      showNotification('Processing request...', 'info');
      
      setTimeout(() => {
        // In a real app, this would call an API endpoint
        localStorage.setItem('accountActive', 'false');
        showNotification('Your account has been deactivated', 'success');
        
        // Use the AuthContext logout function after a short delay
        setTimeout(() => {
          logout();
        }, 2000);
      }, 1500);
    }
  };
  
  // Log out of all sessions
  const handleLogoutAllSessions = () => {
    if (window.confirm('Are you sure you want to log out of all sessions? This will sign you out on all devices.')) {
      // Simulate API call to invalidate all sessions
      showNotification('Processing request...', 'info');
      
      setTimeout(() => {
        // In a real app, this would call an API endpoint to invalidate all tokens
        // Here we simply clear active devices except current one
        const currentDevice = accountSettings.activeDevices.find(d => d.lastActive === 'Current session');
        setAccountSettings({
          ...accountSettings,
          activeDevices: currentDevice ? [currentDevice] : []
        });
        
        localStorage.setItem('accountSettings', JSON.stringify({
          ...accountSettings,
          activeDevices: currentDevice ? [currentDevice] : []
        }));
        
        showNotification('Successfully logged out of all other sessions', 'success');
      }, 1000);
    }
  };

  // Update tab
  const setTab = (tab: string) => {
    setActiveTab(tab);
    
    // If we switch back to preferences tab, make sure current theme is applied
    if (tab === 'preferences') {
      setTimeout(() => {
        previewTheme(preferences.theme);
        previewFontSize(preferences.fontSize);
      }, 0);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>Settings | TeachPrep AI</title>
          <meta name="description" content="Manage your account settings and preferences" />
        </Head>
        
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px" aria-label="Tabs">
                  <button
                    onClick={() => setTab('profile')}
                    className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'profile'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiUser className="inline-block mr-2 h-5 w-5" />
                    Profile
                  </button>
                  <button
                    onClick={() => setTab('notifications')}
                    className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'notifications'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiBell className="inline-block mr-2 h-5 w-5" />
                    Notifications
                  </button>
                  <button
                    onClick={() => setTab('preferences')}
                    className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'preferences'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiBookOpen className="inline-block mr-2 h-5 w-5" />
                    Preferences
                  </button>
                  <button
                    onClick={() => setTab('account')}
                    className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'account'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiSettings className="inline-block mr-2 h-5 w-5" />
                    Account
                  </button>
                </nav>
              </div>
              
              <div className="p-6">
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileSubmit} className="animate-fadeIn">
                    <div className="space-y-8">
                      <div className="flex flex-col md:flex-row items-center gap-6 bg-gradient-to-r from-primary/5 to-purple-100/20 p-6 rounded-xl">
                        <div className="relative group">
                          <div className="h-32 w-32 rounded-full bg-gradient-to-r from-primary/20 to-purple-300/30 p-1 shadow-lg flex items-center justify-center overflow-hidden">
                          {profileForm.avatar ? (
                              <img src={profileForm.avatar} alt="Profile avatar" className="h-full w-full rounded-full object-cover" />
                          ) : (
                              <div className="bg-white h-full w-full rounded-full flex items-center justify-center">
                                <FiUser className="h-16 w-16 text-primary/60" />
                              </div>
                          )}
                        </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            type="button"
                              className="bg-white/90 py-2 px-3 rounded-md shadow-sm text-sm font-medium text-primary hover:bg-primary hover:text-white transition-colors duration-300"
                          >
                            Change
                          </button>
                          </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <h2 className="text-2xl font-bold text-gray-800">{profileForm.fullName || 'Your Name'}</h2>
                          <p className="text-primary font-medium">{profileForm.role || 'Your Role'}</p>
                          <p className="text-gray-500 text-sm mt-1">JPG, GIF or PNG. Max size 2MB.</p>
                          <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span> Active
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {profileForm.subject || 'Subject Area'}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <span className="mr-1">✓</span> Verified Teacher
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-y-6 gap-x-6 md:grid-cols-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="md:col-span-3">
                          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiUser className="h-4 w-4 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                              type="text"
                              name="fullName"
                              id="fullName"
                              value={profileForm.fullName}
                              onChange={handleProfileChange}
                              className="pl-10 focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={profileForm.email}
                              onChange={handleProfileChange}
                              className="pl-10 focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                              placeholder="your.email@example.com"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <select
                              id="role"
                              name="role"
                              value={profileForm.role}
                              onChange={handleProfileChange}
                              className="pl-10 focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                            >
                              <option>Teacher</option>
                              <option>Department Head</option>
                              <option>Administrator</option>
                              <option>Student Teacher</option>
                            </select>
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                            Primary Subject
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <select
                              id="subject"
                              name="subject"
                              value={profileForm.subject}
                              onChange={handleProfileChange}
                              className="pl-10 focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                            >
                              <option>Science</option>
                              <option>Mathematics</option>
                              <option>Language Arts</option>
                              <option>Social Studies</option>
                              <option>Art</option>
                              <option>Music</option>
                              <option>Physical Education</option>
                            </select>
                          </div>
                        </div>

                        <div className="md:col-span-6">
                          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                            Professional Bio
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <textarea
                              id="bio"
                              name="bio"
                              rows={4}
                              value={profileForm.bio}
                              onChange={handleProfileChange}
                              placeholder="Tell us about yourself, your teaching philosophy, and your experience..."
                              className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                              {profileForm.bio ? profileForm.bio.length : 0}/500
                          </div>
                        </div>
                      </div>
                    </div>

                      <div className="pt-5 flex justify-end space-x-3">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-300"
                        >
                          Cancel
                        </button>
                      <button
                        type="submit"
                          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <FiSave className="mr-2 -ml-1 h-5 w-5" />
                          Save Changes
                      </button>
                      </div>
                    </div>
                  </form>
                )}

                {activeTab === 'notifications' && (
                  <form onSubmit={handleNotificationSubmit} className="animate-fadeIn">
                    <div className="space-y-8">
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-6">
                          <FiBell className="h-5 w-5 text-primary mr-2" />
                          <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
                        </div>
                        
                        <div className="grid gap-6">
                          <div className="relative flex items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex items-center h-5 mt-1">
                            <input
                              id="emailNotifications"
                              name="emailNotifications"
                              type="checkbox"
                              checked={localNotificationSettings.emailNotifications}
                              onChange={handleNotificationChange}
                                className="focus:ring-primary h-5 w-5 text-primary border-gray-300 rounded"
                            />
                          </div>
                            <div className="ml-3">
                            <label htmlFor="emailNotifications" className="font-medium text-gray-700">Email notifications</label>
                              <p className="text-gray-500 text-sm mt-1">Receive email notifications about account activity and updates.</p>
                              
                              {localNotificationSettings.emailNotifications && (
                                <div className="mt-3 bg-white rounded-md p-3 border border-gray-200 shadow-sm animate-fadeIn">
                                  <div className="text-sm font-medium text-gray-700 mb-2">Email frequency</div>
                                  <div className="space-y-2">
                                    <label className="flex items-center">
                                      <input type="radio" name="emailFrequency" className="focus:ring-primary h-4 w-4 text-primary border-gray-300" defaultChecked />
                                      <span className="ml-2 text-sm text-gray-600">Send immediately</span>
                                    </label>
                                    <label className="flex items-center">
                                      <input type="radio" name="emailFrequency" className="focus:ring-primary h-4 w-4 text-primary border-gray-300" />
                                      <span className="ml-2 text-sm text-gray-600">Daily digest</span>
                                    </label>
                                    <label className="flex items-center">
                                      <input type="radio" name="emailFrequency" className="focus:ring-primary h-4 w-4 text-primary border-gray-300" />
                                      <span className="ml-2 text-sm text-gray-600">Weekly digest</span>
                                    </label>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                        
                          <div className="relative flex items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex items-center h-5 mt-1">
                            <input
                              id="resourceUpdates"
                              name="resourceUpdates"
                              type="checkbox"
                              checked={localNotificationSettings.resourceUpdates}
                              onChange={handleNotificationChange}
                                className="focus:ring-primary h-5 w-5 text-primary border-gray-300 rounded"
                            />
                          </div>
                            <div className="ml-3">
                            <label htmlFor="resourceUpdates" className="font-medium text-gray-700">Resource updates</label>
                              <p className="text-gray-500 text-sm mt-1">Get notified when resources you follow are updated.</p>
                              <div className="mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${localNotificationSettings.resourceUpdates ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {localNotificationSettings.resourceUpdates ? 'Enabled' : 'Disabled'}
                                </span>
                              </div>
                          </div>
                        </div>
                        
                          <div className="relative flex items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex items-center h-5 mt-1">
                            <input
                              id="collaborationRequests"
                              name="collaborationRequests"
                              type="checkbox"
                              checked={localNotificationSettings.collaborationRequests}
                              onChange={handleNotificationChange}
                                className="focus:ring-primary h-5 w-5 text-primary border-gray-300 rounded"
                            />
                          </div>
                            <div className="ml-3">
                            <label htmlFor="collaborationRequests" className="font-medium text-gray-700">Collaboration requests</label>
                              <p className="text-gray-500 text-sm mt-1">Receive notifications about new collaboration requests.</p>
                              <div className="mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${localNotificationSettings.collaborationRequests ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {localNotificationSettings.collaborationRequests ? 'Enabled' : 'Disabled'}
                                </span>
                              </div>
                          </div>
                        </div>
                        
                          <div className="relative flex items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex items-center h-5 mt-1">
                            <input
                              id="weeklyDigest"
                              name="weeklyDigest"
                              type="checkbox"
                              checked={localNotificationSettings.weeklyDigest}
                              onChange={handleNotificationChange}
                                className="focus:ring-primary h-5 w-5 text-primary border-gray-300 rounded"
                            />
                          </div>
                            <div className="ml-3">
                            <label htmlFor="weeklyDigest" className="font-medium text-gray-700">Weekly digest</label>
                              <p className="text-gray-500 text-sm mt-1">Get a weekly summary of platform activity and recommended resources.</p>
                              <div className="mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${localNotificationSettings.weeklyDigest ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {localNotificationSettings.weeklyDigest ? 'Enabled' : 'Disabled'}
                                </span>
                          </div>
                        </div>
                      </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
                        </div>
                        
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-yellow-700">
                                Push notifications require browser permission. Make sure to allow notifications in your browser settings.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 px-3 border border-gray-200 rounded-md mb-4">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">In-app notifications</span>
                          </div>
                          <div className="relative inline-block w-10 mr-2 align-middle select-none">
                            <input type="checkbox" name="inAppNotifications" id="inAppNotifications" defaultChecked className="checked:bg-primary outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                            <label htmlFor="inAppNotifications" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 px-3 border border-gray-200 rounded-md mb-4">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Browser notifications</span>
                          </div>
                          <div className="relative inline-block w-10 mr-2 align-middle select-none">
                            <input type="checkbox" name="browserNotifications" id="browserNotifications" className="checked:bg-primary outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                            <label htmlFor="browserNotifications" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-5 flex justify-end">
                      <button
                        type="submit"
                          className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <FiSave className="mr-2 -ml-1 h-5 w-5" />
                        Save Notification Preferences
                      </button>
                      </div>
                    </div>
                  </form>
                )}

                {activeTab === 'preferences' && (
                  <form onSubmit={handlePreferenceSubmit}>
                    <div className="space-y-8">
                      {/* Interface Preferences */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Interface Preferences</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Theme Selection */}
                          <div>
                            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-3">
                              Theme
                            </label>
                            <div className="mt-2 space-y-4">
                              <div className="flex items-center theme-option light-option p-3 rounded-md">
                                <input
                                  id="theme-light"
                                  name="theme"
                                  type="radio"
                                  value="light"
                                  checked={preferences.theme === 'light'}
                                  onChange={handlePreferenceChange}
                                  className="focus:ring-primary h-5 w-5 text-primary border-gray-300"
                                />
                                <label htmlFor="theme-light" className="ml-3 flex items-center text-base font-medium theme-label">
                                  <BsSun className="mr-3 h-6 w-6 text-yellow-500" />
                                  Light Mode
                                  <span className="ml-auto text-xs font-normal theme-description">Bright interface, ideal for daytime</span>
                                </label>
                              </div>
                              <div className="flex items-center theme-option dark-option p-3 rounded-md">
                                <input
                                  id="theme-dark"
                                  name="theme"
                                  type="radio"
                                  value="dark"
                                  checked={preferences.theme === 'dark'}
                                  onChange={handlePreferenceChange}
                                  className="focus:ring-primary h-5 w-5 text-primary border-gray-300"
                                />
                                <label htmlFor="theme-dark" className="ml-3 flex items-center text-base font-medium theme-label">
                                  <BsMoonStarsFill className="mr-3 h-6 w-6 text-indigo-400" />
                                  Dark Mode
                                  <span className="ml-auto text-xs font-normal theme-description">Reduced brightness, easier on the eyes</span>
                                </label>
                              </div>
                              <div className="flex items-center theme-option system-option p-3 rounded-md">
                                <input
                                  id="theme-system"
                                  name="theme"
                                  type="radio"
                                  value="system"
                                  checked={preferences.theme === 'system'}
                                  onChange={handlePreferenceChange}
                                  className="focus:ring-primary h-5 w-5 text-primary border-gray-300"
                                />
                                <label htmlFor="theme-system" className="ml-3 flex items-center text-base font-medium theme-label">
                                  <BsDisplayFill className="mr-3 h-6 w-6 text-blue-500" />
                                  System Default
                                  <span className="ml-auto text-xs font-normal theme-description">Follows your device settings</span>
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          {/* Font Size */}
                          <div>
                            <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 mb-3">
                              Font Size
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                              <div 
                                className={`font-size-option cursor-pointer ${preferences.fontSize === 'small' ? 'selected-option' : ''}`}
                                onClick={() => handlePreferenceChange({ target: { name: 'fontSize', value: 'small' } } as any)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">Small</span>
                                  <input
                                    type="radio"
                                    id="fontSize-small"
                                    name="fontSize"
                                    value="small"
                                    checked={preferences.fontSize === 'small'}
                                    onChange={handlePreferenceChange}
                                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                                  />
                                </div>
                                <div className="font-size-preview text-center small-text rounded">
                                  <span>Aa</span>
                                </div>
                              </div>
                              
                              <div 
                                className={`font-size-option cursor-pointer ${preferences.fontSize === 'medium' ? 'selected-option' : ''}`}
                                onClick={() => handlePreferenceChange({ target: { name: 'fontSize', value: 'medium' } } as any)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">Medium</span>
                                  <input
                                    type="radio"
                                    id="fontSize-medium"
                                    name="fontSize"
                                    value="medium"
                                    checked={preferences.fontSize === 'medium'}
                                    onChange={handlePreferenceChange}
                                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                                  />
                                </div>
                                <div className="font-size-preview text-center medium-text rounded">
                                  <span>Aa</span>
                                </div>
                              </div>
                              
                              <div 
                                className={`font-size-option cursor-pointer ${preferences.fontSize === 'large' ? 'selected-option' : ''}`}
                                onClick={() => handlePreferenceChange({ target: { name: 'fontSize', value: 'large' } } as any)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">Large</span>
                                  <input
                                    type="radio"
                                    id="fontSize-large"
                                    name="fontSize"
                                    value="large"
                                    checked={preferences.fontSize === 'large'}
                                    onChange={handlePreferenceChange}
                                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                                  />
                                </div>
                                <div className="font-size-preview text-center large-text rounded">
                                  <span>Aa</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Content Layout */}
                          <div>
                            <label htmlFor="contentLayout" className="block text-sm font-medium text-gray-700 mb-3">
                              Content Layout
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                              <div 
                                className={`layout-option cursor-pointer ${preferences.contentLayout === 'grid' ? 'selected-option' : ''}`}
                                onClick={() => handlePreferenceChange({ target: { name: 'contentLayout', value: 'grid' } } as any)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">Grid View</span>
                                  <input
                                    type="radio"
                                    id="contentLayout-grid"
                                    name="contentLayout"
                                    value="grid"
                                    checked={preferences.contentLayout === 'grid'}
                                    onChange={handlePreferenceChange}
                                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                                  />
                                </div>
                                <div className="layout-preview grid-preview">
                                  <div className="preview-item"></div>
                                  <div className="preview-item"></div>
                                  <div className="preview-item"></div>
                                  <div className="preview-item"></div>
                                </div>
                              </div>
                              
                              <div 
                                className={`layout-option cursor-pointer ${preferences.contentLayout === 'list' ? 'selected-option' : ''}`}
                                onClick={() => handlePreferenceChange({ target: { name: 'contentLayout', value: 'list' } } as any)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">List View</span>
                                  <input
                                    type="radio"
                                    id="contentLayout-list"
                                    name="contentLayout"
                                    value="list"
                                    checked={preferences.contentLayout === 'list'}
                                    onChange={handlePreferenceChange}
                                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                                  />
                                </div>
                                <div className="layout-preview list-preview">
                                  <div className="preview-item"></div>
                                  <div className="preview-item"></div>
                                  <div className="preview-item"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Auto Save */}
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="autoSave"
                                name="autoSave"
                                type="checkbox"
                                checked={preferences.autoSave}
                                onChange={handlePreferenceChange}
                                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="autoSave" className="font-medium text-gray-700">Auto-save</label>
                              <p className="text-gray-500">Automatically save your work while editing</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Lesson Defaults */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Lesson Plan Defaults</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="lessonDefaults.showObjectives"
                                name="lessonDefaults.showObjectives"
                                type="checkbox"
                                checked={preferences.lessonDefaults.showObjectives}
                                onChange={handlePreferenceChange}
                                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="lessonDefaults.showObjectives" className="font-medium text-gray-700">Show Objectives</label>
                              <p className="text-gray-500">Show objectives section by default in new lesson plans</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="lessonDefaults.includeAssessment"
                                name="lessonDefaults.includeAssessment"
                                type="checkbox"
                                checked={preferences.lessonDefaults.includeAssessment}
                                onChange={handlePreferenceChange}
                                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="lessonDefaults.includeAssessment" className="font-medium text-gray-700">Include Assessment</label>
                              <p className="text-gray-500">Include assessment section by default in new lesson plans</p>
                            </div>
                          </div>
                          
                          <div>
                            <label htmlFor="lessonDefaults.defaultDuration" className="block text-sm font-medium text-gray-700 mb-1">
                              Default Lesson Duration (minutes)
                            </label>
                            <input
                              type="number"
                              id="lessonDefaults.defaultDuration"
                              name="lessonDefaults.defaultDuration"
                              value={preferences.lessonDefaults.defaultDuration}
                              onChange={handlePreferenceChange}
                              min={5}
                              max={180}
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-6 flex justify-between">
                        <button
                          type="button"
                          onClick={resetPreferences}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          Reset to Defaults
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none"
                        >
                          <FiSave className="mr-2 -ml-1 h-5 w-5" />
                          Save Preferences
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {activeTab === 'account' && (
                  <form onSubmit={handleAccountSubmit} className="animate-fadeIn">
                    <div className="space-y-8">
                      {/* Security */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-4">
                          <FiShield className="h-5 w-5 text-primary mr-2" />
                          <h3 className="text-lg font-medium text-gray-900">Security</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gray-50 p-4 rounded-lg flex items-start hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex items-center h-5 mt-0.5">
                              <input
                                id="twoFactorEnabled"
                                name="twoFactorEnabled"
                                type="checkbox"
                                checked={accountSettings.twoFactorEnabled}
                                onChange={handleAccountSettingChange}
                                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3">
                              <label htmlFor="twoFactorEnabled" className="font-medium text-gray-700">Two-factor authentication</label>
                              <p className="text-gray-500 text-sm">Add an extra layer of security to your account</p>
                              {accountSettings.twoFactorEnabled && (
                                <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Enabled
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg flex items-start hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex items-center h-5 mt-0.5">
                              <input
                                id="loginNotifications"
                                name="loginNotifications"
                                type="checkbox"
                                checked={accountSettings.loginNotifications}
                                onChange={handleAccountSettingChange}
                                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3">
                              <label htmlFor="loginNotifications" className="font-medium text-gray-700">Login notifications</label>
                              <p className="text-gray-500 text-sm">Get notified of new logins to your account</p>
                              {accountSettings.loginNotifications && (
                                <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Enabled
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="md:col-span-2">
                            <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                              <div className="flex items-center">
                                <FiLock className="h-5 w-5 text-primary mr-2" />
                              <span className="text-sm font-medium text-gray-700">Password</span>
                            </div>
                              <div className="flex justify-between items-center mt-2">
                                <div>
                              <p className="text-xs text-gray-500">Last changed: {accountSettings.passwordLastChanged}</p>
                                  <div className="mt-1 h-1.5 w-32 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full" style={{ width: '80%' }}></div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">Password strength: Strong</p>
                                </div>
                              <button
                                type="button"
                                  className="inline-flex items-center px-3 py-1.5 border border-primary border-opacity-50 text-sm font-medium rounded-md text-primary hover:bg-primary hover:text-white transition-colors duration-200"
                                  onClick={handleChangePassword}
                              >
                                  <FiLock className="mr-1.5 h-4 w-4" />
                                Change
                              </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Active Devices */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900">Active Devices</h3>
                        </div>
                        <div className="bg-gray-50 rounded-md p-4">
                          {accountSettings.activeDevices.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                              {accountSettings.activeDevices.map((device) => (
                                <li key={device.id} className="py-4 flex justify-between items-center">
                                  <div className="flex items-center">
                                    {device.name.includes('Chrome') ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 mr-3" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.003h-.002l-5.344 9.257c.206.01.413.016.621.016 6.627 0 12-5.373 12-12 0-1.54-.29-3.011-.818-4.366zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728z" />
                                      </svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                      </svg>
                                    )}
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{device.name}</p>
                                      <div className="flex items-center">
                                        <span className={`inline-block h-2 w-2 rounded-full ${device.lastActive === 'Current session' ? 'bg-green-500' : 'bg-gray-400'} mr-1.5`}></span>
                                    <p className="text-xs text-gray-500">Last active: {device.lastActive}</p>
                                      </div>
                                    </div>
                                  </div>
                                  {device.lastActive !== 'Current session' && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveDevice(device.id)}
                                      className="inline-flex items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none transition-colors duration-200"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      Remove
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-center py-6">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm text-gray-500">No active devices</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Privacy */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900">Privacy</h3>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg flex items-start hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex items-center h-5 mt-0.5">
                            <input
                              id="dataSharing"
                              name="dataSharing"
                              type="checkbox"
                              checked={accountSettings.dataSharing}
                              onChange={handleAccountSettingChange}
                              className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3">
                            <label htmlFor="dataSharing" className="font-medium text-gray-700">Data sharing</label>
                            <p className="text-gray-500 text-sm">Allow TeachPrep to collect usage data to improve services</p>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex justify-center">
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 group"
                            onClick={handleDownloadData}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500 group-hover:text-primary transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V8a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download your data
                          </button>
                        </div>
                      </div>
                      
                      {/* Account Actions */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900">Account Actions</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all duration-200 hover:shadow"
                            onClick={handleDeactivateAccount}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Deactivate account
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none transition-all duration-200 hover:shadow"
                            onClick={handleLogoutAllSessions}
                          >
                            <FiLogOut className="mr-2 h-5 w-5" />
                            Log out of all sessions
                          </button>
                        </div>
                      </div>
                      
                      <div className="pt-5 flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none transition-all duration-300 hover:-translate-y-0.5"
                        >
                          <FiSave className="mr-2 -ml-1 h-5 w-5" />
                          Save Account Settings
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 