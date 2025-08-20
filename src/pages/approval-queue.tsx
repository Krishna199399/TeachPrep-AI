import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { 
  FiCheckCircle, 
  FiX, 
  FiFilter, 
  FiMessageSquare,
  FiExternalLink,
  FiEdit2,
  FiFileText
} from 'react-icons/fi';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionGate from '@/components/PermissionGate';
import { useAppContext } from '@/context/AppContext';

// Approval item type definition
type ApprovalItemType = 'lesson' | 'resource' | 'assessment';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface ApprovalItem {
  id: number;
  title: string;
  type: ApprovalItemType;
  submittedBy: string;
  submittedDate: string;
  department: string;
  status: ApprovalStatus;
  content?: string;
  feedbackMessage?: string;
}

export default function ApprovalQueue() {
  const { isSidebarOpen, setSidebarOpen } = useAppContext();
  const { role, isDepartmentHead } = usePermissions();
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([]);
  const [filter, setFilter] = useState<{
    type: string;
    department: string;
  }>({
    type: 'all',
    department: 'all'
  });
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // Load approval items from localStorage or initialize with mock data
  useEffect(() => {
    const storedItems = localStorage.getItem('teachprep_approval_items');
    if (storedItems) {
      try {
        setApprovalItems(JSON.parse(storedItems));
      } catch (error) {
        console.error('Failed to parse stored approval items', error);
        initializeDefaultItems();
      }
    } else {
      initializeDefaultItems();
    }
  }, []);

  // Save approval items to localStorage when they change
  useEffect(() => {
    if (approvalItems.length > 0) {
      localStorage.setItem('teachprep_approval_items', JSON.stringify(approvalItems));
    }
  }, [approvalItems]);

  // Initialize with default mock data
  const initializeDefaultItems = () => {
    const mockApprovalItems: ApprovalItem[] = [
      {
        id: 1,
        title: 'Cell Structure and Function',
        type: 'lesson',
        submittedBy: 'Sarah Williams',
        submittedDate: '2023-10-12',
        department: 'Science',
        status: 'pending',
        content: 'This lesson plan includes objectives, activities, and assessment methods for teaching the subject matter.'
      },
      {
        id: 2,
        title: 'World War II Quiz',
        type: 'assessment',
        submittedBy: 'Alex Thompson',
        submittedDate: '2023-10-11',
        department: 'History',
        status: 'pending',
        content: 'A comprehensive quiz covering the major events, figures, and impacts of World War II.'
      },
      {
        id: 3,
        title: 'Calculus Formula Sheet',
        type: 'resource',
        submittedBy: 'James Wilson',
        submittedDate: '2023-10-10',
        department: 'Mathematics',
        status: 'pending',
        content: 'Reference sheet containing essential calculus formulas for derivatives, integrals, and series.'
      },
      {
        id: 4,
        title: 'Literary Devices in Shakespeare',
        type: 'lesson',
        submittedBy: 'Maria Garcia',
        submittedDate: '2023-10-09',
        department: 'English',
        status: 'pending',
        content: 'Lesson exploring literary devices used in Shakespeare\'s plays with examples and analysis activities.'
      },
      {
        id: 5,
        title: 'Physics Lab Experiment',
        type: 'assessment',
        submittedBy: 'David Chen',
        submittedDate: '2023-10-08',
        department: 'Science',
        status: 'pending',
        content: 'Lab experiment procedure and assessment rubric for measuring and analyzing forces.'
      }
    ];
    
    setApprovalItems(mockApprovalItems);
    localStorage.setItem('teachprep_approval_items', JSON.stringify(mockApprovalItems));
  };

  // Approve an item
  const handleApprove = (id: number) => {
    const updatedItems = approvalItems.map(item =>
      item.id === id ? { ...item, status: 'approved' as ApprovalStatus } : item
    );
    
    setApprovalItems(updatedItems);
    
    if (selectedItem?.id === id) {
      setSelectedItem(prev => prev ? { ...prev, status: 'approved' as ApprovalStatus } : null);
      
      // Display success message
      const item = approvalItems.find(item => item.id === id);
      if (item) {
        alert(`"${item.title}" has been approved successfully.`);
      }
      
      // Clear the selected item after a brief delay
      setTimeout(() => {
        setSelectedItem(null);
      }, 1500);
    }
  };

  // Reject an item with feedback
  const handleReject = (id: number) => {
    if (!feedbackMessage && showFeedbackForm) {
      alert('Please provide feedback for the rejection.');
      return;
    }
    
    const updatedItems = approvalItems.map(item =>
      item.id === id ? { 
        ...item, 
        status: 'rejected' as ApprovalStatus,
        feedbackMessage: feedbackMessage || 'No feedback provided.'
      } : item
    );
    
    setApprovalItems(updatedItems);
    
    if (selectedItem?.id === id) {
      setSelectedItem(prev => prev ? { 
        ...prev, 
        status: 'rejected' as ApprovalStatus,
        feedbackMessage: feedbackMessage || 'No feedback provided.'
      } : null);
      
      // Display success message
      const item = approvalItems.find(item => item.id === id);
      if (item) {
        alert(`"${item.title}" has been rejected.`);
      }
      
      // Reset feedback and form state
      setFeedbackMessage('');
      setShowFeedbackForm(false);
      
      // Clear the selected item after a brief delay
      setTimeout(() => {
        setSelectedItem(null);
      }, 1500);
    }
  };

  // Open the feedback form before rejecting
  const handleOpenFeedbackForm = () => {
    setShowFeedbackForm(true);
  };

  // Cancel feedback
  const handleCancelFeedback = () => {
    setFeedbackMessage('');
    setShowFeedbackForm(false);
  };

  // Filter items based on selected filters
  const filteredItems = approvalItems.filter(item => {
    // First check item status - only show pending items
    if (item.status !== 'pending') return false;
    
    // Filter by type if not set to 'all'
    if (filter.type !== 'all' && item.type !== filter.type) return false;
    
    // Filter by department if not set to 'all'
    if (filter.department !== 'all' && item.department !== filter.department) return false;
    
    // For Department Heads, only show items from their department
    if (isDepartmentHead && typeof isDepartmentHead === 'function' && item.department !== 'Science') { // Mock department for demo
      return false;
    }
    
    return true;
  });

  // Get unique departments for filter dropdown
  const departments = Array.from(new Set(approvalItems.map(item => item.department)));
  
  // Get type-specific icon
  const getTypeIcon = (type: ApprovalItemType) => {
    switch (type) {
      case 'lesson':
        return <FiEdit2 className="h-4 w-4 text-blue-500" />;
      case 'resource':
        return <FiExternalLink className="h-4 w-4 text-green-500" />;
      case 'assessment':
        return <FiMessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Approval Queue | TeachPrep AI</title>
        <meta name="description" content="Review and approve educational content" />
      </Head>

      <Header setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <Sidebar open={isSidebarOpen} setOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6">
          <PermissionGate role={['Administrator', 'Department Head']}>
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Approval Queue</h1>
                <div className="text-sm text-gray-500">
                  {filteredItems.length} pending items
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center">
                    <FiFilter className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                  </div>
                  
                  <div>
                    <label htmlFor="typeFilter" className="sr-only">
                      Filter by type
                    </label>
                    <select
                      id="typeFilter"
                      name="typeFilter"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={filter.type}
                      onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="all">All Types</option>
                      <option value="lesson">Lessons</option>
                      <option value="resource">Resources</option>
                      <option value="assessment">Assessments</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="departmentFilter" className="sr-only">
                      Filter by department
                    </label>
                    <select
                      id="departmentFilter"
                      name="departmentFilter"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={filter.department}
                      onChange={(e) => setFilter(prev => ({ ...prev, department: e.target.value }))}
                      disabled={!!isDepartmentHead}
                    >
                      <option value="all">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Approval Items List */}
                <div className="bg-white shadow rounded-lg p-6 lg:col-span-1">
                  <h2 className="text-xl font-medium text-gray-900 mb-4">Pending Items</h2>
                  
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-8">
                      <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-500">No pending items to approve</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredItems.map((item) => (
                        <div
                          key={item.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedItem?.id === item.id
                              ? 'border-primary bg-primary bg-opacity-5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">{item.title}</h3>
                              <div className="flex items-center mt-1">
                                {getTypeIcon(item.type)}
                                <p className="text-sm text-gray-500 ml-1">
                                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {item.department}
                                </p>
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Submitted by {item.submittedBy} on {item.submittedDate}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
                  {selectedItem ? (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-medium text-gray-900">{selectedItem.title}</h2>
                        <div className="flex space-x-2">
                          {selectedItem.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                onClick={() => handleApprove(selectedItem.id)}
                              >
                                <FiCheckCircle className="mr-2 -ml-1 h-4 w-4" aria-hidden="true" />
                                Approve
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                onClick={handleOpenFeedbackForm}
                              >
                                <FiX className="mr-2 -ml-1 h-4 w-4" aria-hidden="true" />
                                Reject
                              </button>
                            </>
                          )}
                          {selectedItem.status === 'approved' && (
                            <span className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100">
                              <FiCheckCircle className="mr-2 -ml-1 h-4 w-4" aria-hidden="true" />
                              Approved
                            </span>
                          )}
                          {selectedItem.status === 'rejected' && (
                            <span className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100">
                              <FiX className="mr-2 -ml-1 h-4 w-4" aria-hidden="true" />
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Type</h3>
                        <p className="text-sm text-gray-900">
                          {selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1)}
                        </p>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Department</h3>
                        <p className="text-sm text-gray-900">{selectedItem.department}</p>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Submitted By</h3>
                        <p className="text-sm text-gray-900">{selectedItem.submittedBy}</p>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Submitted Date</h3>
                        <p className="text-sm text-gray-900">{selectedItem.submittedDate}</p>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Content Preview</h3>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-900">{selectedItem.content}</p>
                        </div>
                      </div>
                      
                      {selectedItem.status === 'rejected' && selectedItem.feedbackMessage && (
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Rejection Feedback</h3>
                          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-sm text-gray-900">{selectedItem.feedbackMessage}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 mt-6">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <FiFileText className="mr-2 -ml-1 h-4 w-4" aria-hidden="true" />
                          View Full Content
                        </button>
                      </div>
                      
                      {/* Feedback form for rejection */}
                      {showFeedbackForm && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Provide Feedback</h3>
                          <textarea
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="Please provide feedback explaining why this item is being rejected..."
                            value={feedbackMessage}
                            onChange={(e) => setFeedbackMessage(e.target.value)}
                          />
                          <div className="mt-3 flex justify-end space-x-3">
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                              onClick={handleCancelFeedback}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              onClick={() => handleReject(selectedItem.id)}
                            >
                              Submit Rejection
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FiMessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No item selected</h3>
                      <p className="text-gray-500">Select an item from the list to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PermissionGate>
        </main>
      </div>
    </div>
  );
} 