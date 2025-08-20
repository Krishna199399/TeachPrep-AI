import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { 
  FiSettings,
  FiCpu, 
  FiFile, 
  FiCheckCircle,
  FiX,
  FiEdit2,
  FiDownload,
  FiClock,
  FiPlus
} from 'react-icons/fi';
import { useAppContext } from '@/context/AppContext';
import PermissionGate from '@/components/PermissionGate';

// Status types
type StatusType = 'operational' | 'degraded' | 'outage';

// Status component
interface StatusItemProps {
  id: string;
  name: string;
  status: StatusType;
  description: string;
  icon: React.ReactNode;
  lastChecked: string;
  history: StatusHistoryItem[];
}

interface StatusHistoryItem {
  timestamp: string;
  status: StatusType;
}

// For serialization (localStorage can't store React elements)
interface SerializableStatusItem {
  id: string;
  name: string;
  status: StatusType;
  description: string;
  lastChecked: string;
  history: StatusHistoryItem[];
}

// Status history chart component
const StatusHistory = ({ history }: { history: StatusHistoryItem[] }) => {
  const statusToColor = (status: StatusType) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'outage': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <p className="text-xs text-gray-500 mb-1">Status History (Last 24h)</p>
      <div className="flex space-x-1">
        {history.map((item, index) => (
          <div 
            key={index} 
            className={`h-4 w-1 ${statusToColor(item.status)}`} 
            title={`${item.timestamp}: ${item.status}`}
          />
        ))}
        {history.length === 0 && (
          <div className="text-xs text-gray-400">No history data available</div>
        )}
      </div>
    </div>
  );
};

const StatusItem = ({ name, status, description, icon, lastChecked, history }: StatusItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'outage':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'operational':
        return <FiCheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <FiX className="h-5 w-5 text-yellow-500" />;
      case 'outage':
        return <FiX className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()} transition-all duration-200 hover:shadow-md`}>
      <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center">
          <div className="mr-3 flex-shrink-0">{icon}</div>
          <h3 className="text-lg font-medium">{name}</h3>
        </div>
        <div className="flex items-center">
          {getStatusIcon()}
          <span className="ml-2 text-sm font-medium">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          <button 
            className="ml-2 focus:outline-none"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? 
              <FiX className="h-4 w-4 text-gray-500" /> : 
              <FiPlus className="h-4 w-4 text-gray-500" />
            }
          </button>
        </div>
      </div>
      <p className="text-sm mb-2">{description}</p>
      <p className="text-xs text-gray-500">Last checked: {lastChecked}</p>
      
      {isExpanded && (
        <>
          <StatusHistory history={history} />
          <div className="mt-3 text-xs text-gray-500">
            <strong>Service ID:</strong> {name.toLowerCase().replace(/\s+/g, '-')}
          </div>
        </>
      )}
    </div>
  );
};

export default function SystemStatus() {
  const { isSidebarOpen, setSidebarOpen } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [systemStatus, setSystemStatus] = useState<StatusItemProps[]>([]);
  const [incident, setIncident] = useState<boolean>(false);
  const [incidentService, setIncidentService] = useState<string | null>(null);
  const [incidentStatus, setIncidentStatus] = useState<StatusType>('degraded');
  const [counter, setCounter] = useState(0);

  // Helper to validate status
  const validateStatus = (status: any): StatusType => {
    if (status === 'operational' || status === 'degraded' || status === 'outage') {
      return status;
    }
    return 'operational'; // Default to operational if invalid
  };

  // Helper to generate history
  const generateHistory = (): StatusHistoryItem[] => {
    const history: StatusHistoryItem[] = [];
    for (let i = 0; i < 24; i++) {
      // Most entries will be operational, with occasional issues
      const rand = Math.random();
      let status: StatusType = 'operational';
      if (rand > 0.9) status = 'degraded';
      if (rand > 0.97) status = 'outage';
      
      const historyTime = new Date();
      historyTime.setHours(historyTime.getHours() - (24 - i));
      
      history.push({
        timestamp: historyTime.toLocaleTimeString(),
        status
      });
    }
    return history;
  };

  // Get icon for service type (needed because React elements can't be serialized to localStorage)
  const getIconForServiceType = (serviceId: string): React.ReactNode => {
    switch(serviceId) {
      case 'web-application':
        return <FiSettings className="h-5 w-5 text-blue-500" />;
      case 'api-services':
        return <FiCpu className="h-5 w-5 text-purple-500" />;
      case 'database':
        return <FiFile className="h-5 w-5 text-indigo-500" />;
      case 'content-delivery':
        return <FiDownload className="h-5 w-5 text-green-500" />;
      default:
        return <FiFile className="h-5 w-5 text-gray-500" />;
    }
  };

  // Convert serializable data to StatusItemProps with proper React components
  const deserializeStatus = (serializedItems: SerializableStatusItem[]): StatusItemProps[] => {
    return serializedItems.map(item => ({
      ...item,
      status: validateStatus(item.status),
      // Re-create React elements that can't be serialized
      icon: getIconForServiceType(item.id),
      // Ensure history items have valid status
      history: Array.isArray(item.history) 
        ? item.history.map(h => ({
            timestamp: h.timestamp || new Date().toLocaleTimeString(),
            status: validateStatus(h.status)
          }))
        : generateHistory()
    }));
  };

  // Initialize system status data
  useEffect(() => {
    // Try to load from localStorage first
    const savedStatus = localStorage.getItem('teachprep_system_status');
    const savedLastUpdated = localStorage.getItem('teachprep_status_last_updated');
    
    if (savedStatus && savedLastUpdated) {
      try {
        const parsedStatus = JSON.parse(savedStatus) as SerializableStatusItem[];
        const validatedStatus = deserializeStatus(parsedStatus);
        setSystemStatus(validatedStatus);
        setLastUpdated(savedLastUpdated);
      } catch (error) {
        console.error('Failed to parse saved status', error);
        fetchSystemStatus();
      }
    } else {
      fetchSystemStatus();
    }

    // Set up auto-refresh interval (every 30 seconds)
    const interval = setInterval(() => {
      setCounter(prev => prev + 1);
      if (counter % 5 === 0) { // Every 2.5 minutes when auto-refresh is enabled
        fetchSystemStatus(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [counter]);

  // Function to simulate a random service incident
  const simulateIncident = () => {
    if (incident) {
      // Resolve the incident
      setIncident(false);
      
      // Update the affected service status
      if (incidentService) {
        const updatedStatus = systemStatus.map(item => {
          if (item.id === incidentService) {
            // Add to history
            const newHistory = [...item.history];
            if (newHistory.length >= 24) {
              newHistory.shift(); // Remove oldest history item if we have 24
            }
            
            newHistory.push({
              timestamp: new Date().toLocaleTimeString(),
              status: 'operational'
            });
            
            return {
              ...item,
              status: 'operational',
              description: 'The service is operating normally again after a recent issue.',
              history: newHistory
            };
          }
          return item;
        });
        
        setSystemStatus(updatedStatus);
        saveStatusToLocalStorage(updatedStatus);
        
        // Update last updated time
        updateLastUpdatedTime();
      }
      
      setIncidentService(null);
    } else {
      // Create a random incident
      setIncident(true);
      
      // Pick a random service
      const randomIndex = Math.floor(Math.random() * systemStatus.length);
      const randomService = systemStatus[randomIndex];
      
      // Set incident service ID
      setIncidentService(randomService.id);
      
      // Randomly select degraded or outage
      const newStatus: StatusType = Math.random() > 0.5 ? 'degraded' : 'outage';
      setIncidentStatus(newStatus);
      
      // Update system status
      const updatedStatus = systemStatus.map((item, index) => {
        if (index === randomIndex) {
          // Add to history
          const newHistory = [...item.history];
          if (newHistory.length >= 24) {
            newHistory.shift(); // Remove oldest history item if we have 24
          }
          
          newHistory.push({
            timestamp: new Date().toLocaleTimeString(),
            status: newStatus
          });
          
          const statusDescriptions = {
            degraded: 'The service is experiencing some performance issues or partial functionality problems.',
            outage: 'The service is currently unavailable. Engineers are working to resolve the issue.'
          };
          
          return {
            ...item,
            status: newStatus,
            description: statusDescriptions[newStatus],
            history: newHistory
          };
        }
        return item;
      });
      
      setSystemStatus(updatedStatus);
      saveStatusToLocalStorage(updatedStatus);
      
      // Update last updated time
      updateLastUpdatedTime();
    }
  };

  // Update the last updated timestamp
  const updateLastUpdatedTime = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString();
    const formattedDate = now.toLocaleDateString();
    const newLastUpdated = `${formattedDate} ${formattedTime}`;
    
    setLastUpdated(newLastUpdated);
    localStorage.setItem('teachprep_status_last_updated', newLastUpdated);
    
    return { formattedTime, formattedDate, newLastUpdated };
  };

  // Save status data to localStorage with serialization handling
  const saveStatusToLocalStorage = (status: StatusItemProps[]) => {
    // Create a serializable version of the status (removing React elements)
    const serializableStatus: SerializableStatusItem[] = status.map(item => ({
      id: item.id,
      name: item.name,
      status: item.status,
      description: item.description,
      lastChecked: item.lastChecked,
      history: item.history
    }));
    
    localStorage.setItem('teachprep_system_status', JSON.stringify(serializableStatus));
  };

  // Function to refresh system status
  const fetchSystemStatus = (autoRefresh = false) => {
    if (!autoRefresh) {
      setIsLoading(true);
    }
    
    // In a real application, this would be an API call
    // For demo purposes, we'll use a timeout to simulate loading
    setTimeout(() => {
      const { formattedTime, newLastUpdated } = updateLastUpdatedTime();
      
      // Only initialize if we don't have system status yet, otherwise preserve current state
      if (systemStatus.length === 0) {
        // Mock system status data
        const newSystemStatus: StatusItemProps[] = [
          {
            id: 'web-application',
            name: 'Web Application',
            status: 'operational' as StatusType,
            description: 'The web application is running normally.',
            icon: <FiSettings className="h-5 w-5 text-blue-500" />,
            lastChecked: formattedTime,
            history: generateHistory()
          },
          {
            id: 'api-services',
            name: 'API Services',
            status: 'operational' as StatusType,
            description: 'All API endpoints are responding normally.',
            icon: <FiCpu className="h-5 w-5 text-purple-500" />,
            lastChecked: formattedTime,
            history: generateHistory()
          },
          {
            id: 'database',
            name: 'Database',
            status: 'operational' as StatusType,
            description: 'Database queries are executing within expected time ranges.',
            icon: <FiFile className="h-5 w-5 text-indigo-500" />,
            lastChecked: formattedTime,
            history: generateHistory()
          },
          {
            id: 'content-delivery',
            name: 'Content Delivery',
            status: 'operational' as StatusType,
            description: 'Content delivery services are functioning normally.',
            icon: <FiDownload className="h-5 w-5 text-green-500" />,
            lastChecked: formattedTime,
            history: generateHistory()
          }
        ];
        
        setSystemStatus(newSystemStatus);
        
        // Save to localStorage
        saveStatusToLocalStorage(newSystemStatus);
        localStorage.setItem('teachprep_status_last_updated', newLastUpdated);
      } else if (!autoRefresh) {
        // Just update the last checked time for each service when manually refreshed
        const updatedStatus = systemStatus.map(item => ({
          ...item,
          lastChecked: formattedTime
        }));
        
        setSystemStatus(updatedStatus);
        saveStatusToLocalStorage(updatedStatus);
        localStorage.setItem('teachprep_status_last_updated', newLastUpdated);
      }
      
      if (!autoRefresh) {
        setIsLoading(false);
      }
    }, autoRefresh ? 0 : 1000); // No delay for auto-refresh
  };

  // Calculate overall system status
  const getOverallStatus = () => {
    if (systemStatus.some(item => item.status === 'outage')) {
      return 'outage';
    }
    if (systemStatus.some(item => item.status === 'degraded')) {
      return 'degraded';
    }
    return 'operational';
  };

  const overallStatus = getOverallStatus();

  // Get status display data
  const getStatusDisplayData = (status: StatusType) => {
    switch (status) {
      case 'operational':
        return {
          icon: <FiCheckCircle className="h-6 w-6 text-green-500" />,
          text: 'All systems operational',
          color: 'text-green-600'
        };
      case 'degraded':
        return {
          icon: <FiX className="h-6 w-6 text-yellow-500" />,
          text: 'Some systems experiencing issues',
          color: 'text-yellow-600'
        };
      case 'outage':
        return {
          icon: <FiX className="h-6 w-6 text-red-500" />,
          text: 'System outage detected',
          color: 'text-red-600'
        };
      default:
        return {
          icon: <FiCheckCircle className="h-6 w-6 text-gray-500" />,
          text: 'Status unknown',
          color: 'text-gray-600'
        };
    }
  };

  const statusDisplay = getStatusDisplayData(overallStatus);

  return (
    <Layout>
      <Head>
        <title>System Status | TeachPrep AI</title>
        <meta name="description" content="View system status and performance" />
      </Head>
      
      <div className="p-6">
        <PermissionGate role="Administrator">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={() => simulateIncident()}
                >
                  {incident ? (
                    <>
                      <FiCheckCircle className="mr-2 -ml-1 h-5 w-5 text-green-500" />
                      Resolve Incident
                    </>
                  ) : (
                    <>
                      <FiX className="mr-2 -ml-1 h-5 w-5 text-red-500" />
                      Simulate Incident
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={() => fetchSystemStatus()}
                  disabled={isLoading}
                >
                  <FiEdit2 className={`mr-2 -ml-1 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Status
                </button>
              </div>
            </div>

            {/* Auto-refresh indication */}
            <div className="flex items-center mb-4 text-sm text-gray-500">
              <FiClock className="h-4 w-4 mr-1" />
              <span>Auto-refreshes every 30 seconds</span>
            </div>

            {/* Status Overview Card */}
            <div className={`bg-white shadow rounded-lg p-6 mb-6 ${
              overallStatus === 'degraded' ? 'border-l-4 border-yellow-500' : 
              overallStatus === 'outage' ? 'border-l-4 border-red-500' : ''
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">System Overview</h2>
                <span className="text-sm text-gray-500 flex items-center">
                  <FiClock className="h-4 w-4 mr-1" />
                  Last updated: {lastUpdated || 'Never'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {statusDisplay.icon}
                <span className={`text-lg font-medium ${statusDisplay.color}`}>{statusDisplay.text}</span>
              </div>
              
              {overallStatus !== 'operational' && (
                <div className="mt-3 text-sm">
                  <p className="text-gray-700">
                    Our team has been notified and is working to resolve the issues.
                  </p>
                </div>
              )}
            </div>

            {/* Status Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {systemStatus.map((status, index) => (
                <StatusItem key={index} {...status} />
              ))}
            </div>

            {/* Performance Metrics */}
            <div className="mt-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">System Performance</h2>
              <div className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Average Response Time</h3>
                    <p className="text-2xl font-semibold text-gray-900">142ms</p>
                    <p className="text-sm text-green-600 mt-2 flex items-center">
                      <FiCheckCircle className="h-4 w-4 mr-1" />
                      5% better than last week
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">System Uptime</h3>
                    <p className="text-2xl font-semibold text-gray-900">
                      {overallStatus === 'operational' ? '99.98%' : '99.82%'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Users</h3>
                    <p className="text-2xl font-semibold text-gray-900">12,450</p>
                    <p className="text-sm text-green-600 mt-2 flex items-center">
                      <FiPlus className="h-4 w-4 mr-1" />
                      120 in the last 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Information */}
            <div className="mt-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Scheduled Maintenance</h2>
              <div className="bg-white shadow rounded-lg p-6">
                <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiX className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Scheduled Database Maintenance
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          Database maintenance is scheduled for June 15, 2023, from 2:00 AM to 4:00 AM UTC.
                          The system may experience brief periods of slowness during this time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PermissionGate>
      </div>
    </Layout>
  );
} 