import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiMessageSquare, 
  FiShare2, 
  FiCheckCircle, 
  FiFile, 
  FiFolder,
  FiPlus,
  FiEdit2,
  FiClock,
  FiCalendar,
  FiSend,
  FiSearch,
  FiDownload
} from 'react-icons/fi';

interface CollaborationUser {
  id: number;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

interface SharedDocument {
  id: number;
  title: string;
  type: string;
  lastModified: string;
  modifiedBy: string;
  collaborators: string[];
  starred?: boolean;
  description?: string;
  tags?: string[];
  fileSize?: string;
  version?: string;
}

interface TeamEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  participants: string[];
  description: string;
  location?: string;
  status?: 'upcoming' | 'inProgress' | 'completed';
}

interface Comment {
  id: number;
  user: string;
  text: string;
  timestamp: string;
  avatar: string;
  likes?: number;
  replies?: Reply[];
}

interface Reply {
  id: number;
  user: string;
  text: string;
  timestamp: string;
  avatar: string;
}

interface NotificationMessage {
  message: string;
  type: 'success' | 'error' | 'info';
  timeout?: number;
}

const EnhancedCollaboration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('team-space');
  const [selectedDocument, setSelectedDocument] = useState<SharedDocument | null>(null);
  const [commentText, setCommentText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<NotificationMessage | null>(null);
  const [activeDiscussion, setActiveDiscussion] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentComments, setCurrentComments] = useState<Comment[]>([]);
  
  // Mock data
  const teamMembers: CollaborationUser[] = [
    { id: 1, name: 'John Smith', role: 'Science Teacher', avatar: 'JS', status: 'online' },
    { id: 2, name: 'Emily Chen', role: 'Math Teacher', avatar: 'EC', status: 'online' },
    { id: 3, name: 'Michael Johnson', role: 'History Teacher', avatar: 'MJ', status: 'away' },
    { id: 4, name: 'Sarah Williams', role: 'English Teacher', avatar: 'SW', status: 'offline' },
    { id: 5, name: 'David Lee', role: 'Physics Teacher', avatar: 'DL', status: 'offline' }
  ];
  
  const documents: SharedDocument[] = [
    {
      id: 1,
      title: 'Unit Plan - Photosynthesis',
      type: 'Lesson Plan',
      lastModified: '2023-10-17T14:30:00',
      modifiedBy: 'John Smith',
      collaborators: ['Emily Chen', 'Michael Johnson'],
      starred: true,
      description: 'Comprehensive unit plan for teaching photosynthesis to high school students.',
      tags: ['Biology', 'Science', 'Curriculum'],
      fileSize: '2.4 MB',
      version: '3.2'
    },
    {
      id: 2,
      title: 'World War II Primary Sources',
      type: 'Resource Pack',
      lastModified: '2023-10-15T09:45:00',
      modifiedBy: 'Michael Johnson',
      collaborators: ['John Smith', 'Sarah Williams'],
      starred: false,
      description: 'Collection of primary source documents for teaching World War II.',
      tags: ['History', 'Social Studies', 'Resources'],
      fileSize: '8.7 MB',
      version: '1.5'
    },
    {
      id: 3,
      title: 'Algebra Quiz - Polynomials',
      type: 'Assessment',
      lastModified: '2023-10-16T11:20:00',
      modifiedBy: 'Emily Chen',
      collaborators: ['John Smith', 'David Lee'],
      starred: false,
      description: 'Quiz to assess student understanding of polynomial operations.',
      tags: ['Math', 'Assessment', 'Algebra'],
      fileSize: '1.1 MB',
      version: '2.0'
    },
    {
      id: 4,
      title: 'Literary Analysis - Shakespeare',
      type: 'Teaching Guide',
      lastModified: '2023-10-14T15:10:00',
      modifiedBy: 'Sarah Williams',
      collaborators: ['Michael Johnson'],
      starred: true,
      description: 'Guide for teaching literary analysis using Shakespeare plays.',
      tags: ['English', 'Literature', 'Teaching'],
      fileSize: '3.2 MB',
      version: '1.8'
    }
  ];
  
  const teamEvents: TeamEvent[] = [
    {
      id: 1,
      title: 'Department Meeting',
      date: '2023-10-25',
      time: '14:00 - 15:30',
      participants: ['John Smith', 'Emily Chen', 'Michael Johnson', 'Sarah Williams', 'David Lee'],
      description: 'Review quarterly curriculum plans and discuss interdisciplinary opportunities.',
      location: 'Conference Room A',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Collaborative Planning Session',
      date: '2023-10-19',
      time: '10:00 - 12:00',
      participants: ['John Smith', 'Emily Chen', 'David Lee'],
      description: 'Work on integrated STEM projects connecting biology, math and physics.',
      location: 'Science Lab',
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Assessment Review',
      date: '2023-10-23',
      time: '13:00 - 14:00',
      participants: ['Emily Chen', 'Sarah Williams'],
      description: 'Review and align assessment strategies across subjects.',
      location: 'Online Meeting',
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Curriculum Committee',
      date: '2023-10-18',
      time: '15:00 - 16:30',
      participants: ['Michael Johnson', 'Sarah Williams', 'John Smith'],
      description: 'Monthly curriculum committee meeting.',
      location: 'Conference Room B',
      status: 'completed'
    }
  ];
  
  const comments: Comment[] = [
    {
      id: 1,
      user: 'John Smith',
      text: 'I\'ve added a new experiment section to the photosynthesis unit plan. Please take a look and let me know your thoughts!',
      timestamp: '2023-10-17T10:30:00',
      avatar: 'JS',
      likes: 2,
      replies: []
    },
    {
      id: 2,
      user: 'Emily Chen',
      text: 'This looks great! I think we could integrate some mathematical modeling here to show the rate of oxygen production.',
      timestamp: '2023-10-17T11:15:00',
      avatar: 'EC',
      likes: 1,
      replies: [
        {
          id: 1,
          user: 'John Smith',
          text: 'Excellent idea, Emily! That would really enhance the interdisciplinary aspects.',
          timestamp: '2023-10-17T11:30:00',
          avatar: 'JS'
        }
      ]
    },
    {
      id: 3,
      user: 'Michael Johnson',
      text: 'Could we also add some historical context about when photosynthesis was discovered?',
      timestamp: '2023-10-17T13:45:00',
      avatar: 'MJ',
      likes: 3,
      replies: []
    }
  ];

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} years ago`;
    
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} months ago`;
    
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} days ago`;
    
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hours ago`;
    
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutes ago`;
    
    return `${Math.floor(seconds)} seconds ago`;
  };
  
  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info', timeout = 3000) => {
    setNotification({ message, type, timeout });
    setTimeout(() => {
      setNotification(null);
    }, timeout);
  };
  
  // Add a comment to the discussion
  const handleAddComment = () => {
    if (commentText.trim()) {
      // In a real app, this would make an API call to add the comment
      const newComment: Comment = {
        id: currentComments.length + 1,
        user: 'John Smith', // Current user
        text: commentText,
        timestamp: new Date().toISOString(),
        avatar: 'JS',
        likes: 0,
        replies: []
      };
      
      setCurrentComments([...currentComments, newComment]);
      setCommentText('');
      showNotification('Comment added successfully', 'success');
    }
  };
  
  // Like a comment
  const handleLikeComment = (commentId: number) => {
    const updatedComments = currentComments.map(comment => 
      comment.id === commentId ? { ...comment, likes: (comment.likes || 0) + 1 } : comment
    );
    setCurrentComments(updatedComments);
    showNotification('You liked this comment', 'success');
  };
  
  // Reply to a comment
  const handleReplyToComment = (commentId: number, replyText: string) => {
    if (replyText.trim()) {
      const updatedComments = currentComments.map(comment => {
        if (comment.id === commentId) {
          const newReply: Reply = {
            id: (comment.replies?.length || 0) + 1,
            user: 'John Smith', // Current user
            text: replyText,
            timestamp: new Date().toISOString(),
            avatar: 'JS'
          };
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      });
      
      setCurrentComments(updatedComments);
      showNotification('Reply added successfully', 'success');
    }
  };
  
  // Toggle document star status
  const toggleDocumentStar = (documentId: number) => {
    const updatedDocuments = documents.map(doc => 
      doc.id === documentId ? { ...doc, starred: !doc.starred } : doc
    );
    // In a real app, this would make an API call to update the document
    showNotification('Document star status updated', 'success');
  };
  
  // Filter documents based on search
  const filteredDocuments = documents.filter(doc => {
    if (!searchQuery) return true;
    return (
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });
  
  // Filter events based on status
  const upcomingEvents = teamEvents.filter(event => event.status === 'upcoming');
  const pastEvents = teamEvents.filter(event => event.status === 'completed');
  
  // Status styling helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };
  
  const getEventStatusColor = (status?: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'inProgress': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };
  
  // Load document details
  const handleSelectDocument = (document: SharedDocument) => {
    setLoadingDocuments(true);
    setSelectedDocument(document);
    // Simulate loading data
    setTimeout(() => {
      setCurrentComments(comments);
      setLoadingDocuments(false);
    }, 800);
  };
  
  // Start team discussion
  const handleStartDiscussion = () => {
    setActiveDiscussion(true);
    showNotification('Team discussion started', 'success');
  };
  
  // Initialize with default comments on component mount
  useEffect(() => {
    setCurrentComments(comments);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('team-space')}
            className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'team-space'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiUsers className="inline-block mr-2 h-5 w-5" />
            Team Space
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiFile className="inline-block mr-2 h-5 w-5" />
            Shared Documents
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'schedule'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiCalendar className="inline-block mr-2 h-5 w-5" />
            Team Schedule
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        {/* Team Space Tab */}
        {activeTab === 'team-space' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">Science Department Team</h2>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none">
                <FiMessageSquare className="mr-2 -ml-1 h-5 w-5" />
                Start Team Discussion
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Team Members List */}
              <div className="col-span-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Team Members</h3>
                  <ul className="space-y-3">
                    {teamMembers.map((member) => (
                      <li key={member.id} className="flex items-center">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                            {member.avatar}
                          </div>
                          <span 
                            className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${getStatusColor(member.status)}`}
                          ></span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                      <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                      Invite Team Member
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Team Activity Feed */}
              <div className="col-span-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Team Activity</h3>
                  
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex">
                        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                          {comment.avatar}
                        </div>
                        <div className="flex-1 bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{comment.user}</h4>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.timestamp)} at {formatTime(comment.timestamp)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex">
                      <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                        JS
                      </div>
                      <div className="flex-1">
                        <textarea
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                          rows={2}
                          placeholder="Add a comment to the team..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        ></textarea>
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={handleAddComment}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none"
                            disabled={!commentText.trim()}
                          >
                            <FiMessageSquare className="mr-2 -ml-1 h-5 w-5" />
                            Post Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Shared Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">Shared Documents</h2>
              <div className="flex space-x-2">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none">
                  <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                  Create New
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                  <FiShare2 className="mr-2 -ml-1 h-5 w-5" />
                  Share
                </button>
              </div>
            </div>
            
            {selectedDocument ? (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">{selectedDocument.title}</h3>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="text-sm text-primary hover:text-primary-dark"
                  >
                    Back to Documents
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {selectedDocument.type}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        Last edited by {selectedDocument.modifiedBy} on {formatDate(selectedDocument.lastModified)}
                      </span>
                    </div>
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                      <FiEdit2 className="mr-2 -ml-1 h-4 w-4" />
                      Edit
                    </button>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600">
                      {/* Document preview would go here */}
                      This is a collaborative document that can be edited in real-time by all team members.
                      Multiple users can work on this simultaneously, with changes synced instantly.
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Collaborators</h4>
                    <div className="flex -space-x-2">
                      {selectedDocument.collaborators.map((name, index) => (
                        <div 
                          key={index} 
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-white ring-2 ring-white"
                          title={name}
                        >
                          {name.substring(0, 2)}
                        </div>
                      ))}
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-500 ring-2 ring-white hover:bg-gray-300">
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Document Comments</h4>
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex">
                        <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                          {comment.avatar}
                        </div>
                        <div className="flex-1 bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{comment.user}</h4>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.timestamp)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex">
                      <div className="flex-1">
                        <textarea
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                          rows={2}
                          placeholder="Add a comment about this document..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        ></textarea>
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={handleAddComment}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none"
                            disabled={!commentText.trim()}
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Modified
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        By
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Collaborators
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <tr 
                        key={doc.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-primary">{doc.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {doc.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(doc.lastModified)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.modifiedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex -space-x-2">
                            {doc.collaborators.map((name, index) => (
                              <div 
                                key={index} 
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white ring-2 ring-white"
                                title={name}
                              >
                                {name.substring(0, 2)}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Team Schedule Tab */}
        {activeTab === 'schedule' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">Team Schedule</h2>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none">
                <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                Schedule Meeting
              </button>
            </div>
            
            <div className="space-y-4">
              {teamEvents.map((event) => (
                <div key={event.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                    <div className="flex items-center mt-2 sm:mt-0">
                      <FiCalendar className="text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">{event.date}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <FiClock className="text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">{event.time}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Participants</h4>
                    <div className="flex flex-wrap gap-2">
                      {event.participants.map((name, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                      <FiEdit2 className="mr-1 h-4 w-4" />
                      Edit
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none">
                      Join Meeting
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCollaboration; 