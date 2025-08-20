import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { 
  FiPlus, FiCalendar, FiFileText, FiUsers, FiClock, FiFilter, 
  FiX, FiEdit2, FiTrash2, FiFile, FiDownload, FiGrid, FiList,
  FiSearch, FiStar, FiBarChart2, FiCopy, FiShare2, FiAlertCircle
} from 'react-icons/fi';
import { useAppContext, Assessment } from '@/context/AppContext';
import AutomatedGradingTool from '@/components/AutomatedGradingTool';

export default function AssessmentTools() {
  const { assessments, addAssessment, updateAssessment, deleteAssessment, isSidebarOpen, setSidebarOpen, showNotification } = useAppContext();
  
  // Filter and view states
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'dueDate' | 'type' | 'subject'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Assessment states
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [showGradingTool, setShowGradingTool] = useState(false);
  const [assessmentForGrading, setAssessmentForGrading] = useState<Assessment | null>(null);
  const [isAssessmentDetailsOpen, setIsAssessmentDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    type: 'Quiz',
    subject: '',
    grade: '',
    status: 'Draft',
    dueDate: new Date().toISOString().split('T')[0],
    description: '',
    questions: 0,
    estimatedTime: '',
    tags: []
  });

  // Load saved preferences
  useEffect(() => {
    // Simulated loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('assessment-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Load recently viewed from localStorage
    const savedRecentlyViewed = localStorage.getItem('assessment-recently-viewed');
    if (savedRecentlyViewed) {
      setRecentlyViewed(JSON.parse(savedRecentlyViewed));
    }

    // Load view preference from localStorage
    const savedViewMode = localStorage.getItem('assessment-view-mode');
    if (savedViewMode && (savedViewMode === 'grid' || savedViewMode === 'list')) {
      setViewMode(savedViewMode);
    }

    return () => clearTimeout(timer);
  }, []);
  
  // Save preferences whenever they change
  useEffect(() => {
    localStorage.setItem('assessment-favorites', JSON.stringify(favorites));
  }, [favorites]);
  
  useEffect(() => {
    localStorage.setItem('assessment-recently-viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);
  
  useEffect(() => {
    localStorage.setItem('assessment-view-mode', viewMode);
  }, [viewMode]);

  // Get unique assessment subjects
  const subjects = Array.from(new Set(assessments.map(a => a.subject)));

  // Filter and sort assessments
  const filteredAssessments = assessments.filter((assessment) => {
    const statusMatch = filterStatus === 'all' || assessment.status.toLowerCase() === filterStatus.toLowerCase();
    const typeMatch = filterType === 'all' || assessment.type.toLowerCase() === filterType.toLowerCase();
    const subjectMatch = filterSubject === 'all' || assessment.subject === filterSubject;
    const searchMatch = !searchTerm || 
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.grade.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && typeMatch && subjectMatch && searchMatch;
  }).sort((a, b) => {
    // First sort by the selected sort field
    if (sortBy === 'title') {
      const comparison = a.title.localeCompare(b.title);
      return sortDirection === 'asc' ? comparison : -comparison;
    } else if (sortBy === 'dueDate') {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'type') {
      const comparison = a.type.localeCompare(b.type);
      return sortDirection === 'asc' ? comparison : -comparison;
    } else if (sortBy === 'subject') {
      const comparison = a.subject.localeCompare(b.subject);
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    return 0;
  });

  // Get unique assessment types
  const assessmentTypes = Array.from(new Set(assessments.map(a => a.type)));

  // Get the status badge styling based on status
  const getStatusBadge = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type badge styling
  const getTypeBadge = (type: string): string => {
    switch (type) {
      case 'Quiz':
        return 'bg-purple-100 text-purple-800';
      case 'Test':
        return 'bg-blue-100 text-blue-800';
      case 'Essay':
        return 'bg-indigo-100 text-indigo-800';
      case 'Project':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate how many days until due date
  const getDaysRemaining = (dueDate: string): { text: string, color: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Overdue', color: 'text-red-600' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-600' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-yellow-600' };
    } else if (diffDays < 7) {
      return { text: `Due in ${diffDays} days`, color: 'text-blue-600' };
    } else {
      return { text: `Due in ${diffDays} days`, color: 'text-gray-600' };
    }
  };

  // Toggle favorite status
  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      if (prev.includes(id)) {
        showNotification('Assessment removed from favorites', 'info');
        return prev.filter(favId => favId !== id);
      } else {
        showNotification('Assessment added to favorites', 'success');
        return [...prev, id];
      }
    });
  };

  // Add to recently viewed
  const addToRecentlyViewed = (id: number) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(viewedId => viewedId !== id);
      return [id, ...filtered].slice(0, 5); // Keep only most recent 5
    });
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAssessment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (selectedAssessment) {
      setSelectedAssessment({
        ...selectedAssessment,
        [name]: value
      });
    }
  };

  // Handle add assessment form submission
  const handleAddAssessment = () => {
    // Validate required fields
    if (!newAssessment.title || !newAssessment.subject || !newAssessment.grade) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    // Add the assessment using context
    addAssessment(newAssessment);
    setIsAddModalOpen(false);
    
    // Reset form
    setNewAssessment({
      title: '',
      type: 'Quiz',
      subject: '',
      grade: '',
      status: 'Draft',
      dueDate: new Date().toISOString().split('T')[0],
      description: '',
      questions: 0,
      estimatedTime: '',
      tags: []
    });
  };

  // Handle edit assessment form submission
  const handleEditAssessment = () => {
    if (selectedAssessment) {
      updateAssessment(selectedAssessment.id, selectedAssessment);
      setIsEditModalOpen(false);
      setSelectedAssessment(null);
    }
  };

  // Handle assessment deletion with confirmation
  const handleDeleteAssessment = (id: number) => {
    const assessment = assessments.find(a => a.id === id);
    if (window.confirm(`Are you sure you want to delete "${assessment?.title}"? This action cannot be undone.`)) {
      deleteAssessment(id);
      
      // Also remove from favorites and recently viewed if present
      if (favorites.includes(id)) {
        setFavorites(prev => prev.filter(favId => favId !== id));
      }
      
      if (recentlyViewed.includes(id)) {
        setRecentlyViewed(prev => prev.filter(viewedId => viewedId !== id));
      }
    }
  };

  // Open assessment details
  const openAssessmentDetails = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsAssessmentDetailsOpen(true);
    addToRecentlyViewed(assessment.id);
  };

  // Open edit modal
  const openEditModal = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsEditModalOpen(true);
    addToRecentlyViewed(assessment.id);
  };

  // Handle assessment grading
  const handleGradeAssessment = (assessment: Assessment) => {
    setAssessmentForGrading(assessment);
    setShowGradingTool(true);
    addToRecentlyViewed(assessment.id);
  };

  // Handle sorting change
  const handleSortChange = (newSortBy: 'title' | 'dueDate' | 'type' | 'subject') => {
    if (sortBy === newSortBy) {
      // If already sorting by this field, toggle direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // If sorting by a new field, set it and default to ascending
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  // Duplicate assessment
  const duplicateAssessment = (assessment: Assessment) => {
    const { id, ...assessmentWithoutId } = assessment;
    const duplicatedAssessment = {
      ...assessmentWithoutId,
      title: `Copy of ${assessment.title}`,
      status: 'Draft'
    };
    addAssessment(duplicatedAssessment);
    showNotification(`Assessment "${assessment.title}" has been duplicated`, 'success');
  };

  // Loading skeleton for assessments
  const AssessmentSkeleton = () => (
    <div className="animate-pulse">
      <div className={`${viewMode === 'grid' ? 'p-4 border rounded-lg bg-white shadow-sm' : 'px-4 py-4 sm:px-6 border-b'}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="w-3/4">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="flex space-x-2">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Recently viewed assessments section
  const RecentlyViewedSection = () => {
    if (recentlyViewed.length === 0) return null;
    
    const recentAssessments = recentlyViewed
      .map(id => assessments.find(a => a.id === id))
      .filter(Boolean) as Assessment[];
      
    if (recentAssessments.length === 0) return null;
    
    return (
      <div className="bg-white shadow rounded-lg p-4 mb-6 overflow-hidden">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recently Viewed</h2>
        <div className="flex overflow-x-auto pb-2 space-x-4">
          {recentAssessments.map(assessment => (
            <div 
              key={`recent-${assessment.id}`} 
              className="flex-shrink-0 w-64 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openAssessmentDetails(assessment)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-gray-900 truncate" style={{ maxWidth: '80%' }}>
                  {assessment.title}
                </h3>
                <span className={`flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(assessment.status)}`}>
                  {assessment.status}
                </span>
              </div>
              <div className="mt-1 flex items-center text-xs text-gray-500">
                <span className={`inline-block px-2 py-0.5 rounded-full ${getTypeBadge(assessment.type)}`}>
                  {assessment.type}
                </span>
                <span className="ml-2">{assessment.subject}</span>
              </div>
              <div className="mt-2 text-xs flex justify-between">
                <span className={`${getDaysRemaining(assessment.dueDate).color}`}>
                  {getDaysRemaining(assessment.dueDate).text}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(assessment.id);
                  }}
                  className={`${favorites.includes(assessment.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                >
                  <FiStar />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Favorites section
  const FavoritesSection = () => {
    if (favorites.length === 0) return null;
    
    const favoriteAssessments = favorites
      .map(id => assessments.find(a => a.id === id))
      .filter(Boolean) as Assessment[];
      
    if (favoriteAssessments.length === 0) return null;
    
    return (
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Favorites</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteAssessments.map(assessment => (
            <div 
              key={`fav-${assessment.id}`} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openAssessmentDetails(assessment)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-md font-medium text-gray-900">{assessment.title}</h3>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(assessment.id);
                  }}
                  className="text-yellow-500"
                >
                  <FiStar />
                </button>
              </div>
              <div className="mt-1 text-sm text-gray-500">{assessment.subject} • {assessment.grade}</div>
              <div className="mt-2 flex justify-between items-center">
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getTypeBadge(assessment.type)}`}>
                  {assessment.type}
                </span>
                <span className={`text-xs ${getDaysRemaining(assessment.dueDate).color}`}>
                  {getDaysRemaining(assessment.dueDate).text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Assessment Tools | TeachPrep AI</title>
        <meta name="description" content="Create and manage student assessments" />
      </Head>

      <Header setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <Sidebar open={isSidebarOpen} setOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {showGradingTool && assessmentForGrading ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">Automated Grading</h1>
                  <button 
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition duration-150 ease-in-out"
                    onClick={() => {
                      setShowGradingTool(false);
                      setAssessmentForGrading(null);
                    }}
                  >
                    <FiX className="mr-2 -ml-1 h-5 w-5" />
                    Back to Assessments
                  </button>
                </div>
                <AutomatedGradingTool 
                  assessmentId={assessmentForGrading.id} 
                  assessmentTitle={assessmentForGrading.title} 
                />
              </>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Assessment Tools</h1>
                  <div className="flex space-x-2">
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none transition duration-150 ease-in-out"
                      onClick={() => setIsAddModalOpen(true)}
                    >
                      <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                      Create New Assessment
                    </button>
                  </div>
                </div>

                {/* Recently viewed section */}
                {!isLoading && <RecentlyViewedSection />}

                {/* Favorites section */}
                {!isLoading && <FavoritesSection />}

                <div className="bg-white shadow rounded-lg mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="flex -mb-px" aria-label="Tabs">
                      <button
                        onClick={() => setActiveTab('list')}
                        className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                          activeTab === 'list'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } transition duration-150 ease-in-out`}
                      >
                        <FiFileText className="inline-block mr-2 h-5 w-5" />
                        My Assessments
                      </button>
                      <button
                        onClick={() => setActiveTab('analytics')}
                        className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                          activeTab === 'analytics'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } transition duration-150 ease-in-out`}
                      >
                        <FiBarChart2 className="inline-block mr-2 h-5 w-5" />
                        Analytics & Grading
                      </button>
                    </nav>
                  </div>
                </div>

                {activeTab === 'list' && (
                  <>
                    <div className="bg-white shadow rounded-lg p-4 mb-6">
                      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center">
                        {/* Search bar */}
                        <div className="relative flex-grow max-w-md">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="Search assessments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        
                        {/* Filters */}
                        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                        <div className="flex items-center">
                          <FiFilter className="mr-2 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 hidden sm:inline">Filter:</span>
                        </div>
                        
                          <select
                            className="input-field text-sm"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                          >
                            <option value="all">All Statuses</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                          </select>
                          
                          <select
                            className="input-field text-sm"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                          >
                            <option value="all">All Types</option>
                            {assessmentTypes.map((type, index) => (
                              <option key={index} value={type}>{type}</option>
                            ))}
                          </select>
                          
                          <select
                            className="input-field text-sm"
                            value={filterSubject}
                            onChange={(e) => setFilterSubject(e.target.value)}
                          >
                            <option value="all">All Subjects</option>
                            {subjects.map((subject, index) => (
                              <option key={index} value={subject}>{subject}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* View toggle */}
                        <div className="flex justify-end">
                          <div className="flex border border-gray-300 rounded-md overflow-hidden">
                            <button
                              className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                              onClick={() => setViewMode('grid')}
                              title="Grid view"
                            >
                              <FiGrid className="h-5 w-5" />
                            </button>
                            <button
                              className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                              onClick={() => setViewMode('list')}
                              title="List view"
                            >
                              <FiList className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sort controls */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-500">
                        {filteredAssessments.length} assessment{filteredAssessments.length !== 1 ? 's' : ''} found
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Sort by:</span>
                        <div className="flex border border-gray-300 rounded-md overflow-hidden text-sm">
                          <button
                            onClick={() => handleSortChange('dueDate')}
                            className={`px-3 py-1 ${sortBy === 'dueDate' ? 'bg-primary text-white' : 'bg-white hover:bg-gray-50'}`}
                          >
                            Due Date {sortBy === 'dueDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </button>
                          <button
                            onClick={() => handleSortChange('title')}
                            className={`px-3 py-1 ${sortBy === 'title' ? 'bg-primary text-white' : 'bg-white hover:bg-gray-50'}`}
                          >
                            Title {sortBy === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </button>
                          <button
                            onClick={() => handleSortChange('type')}
                            className={`px-3 py-1 ${sortBy === 'type' ? 'bg-primary text-white' : 'bg-white hover:bg-gray-50'}`}
                          >
                            Type {sortBy === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Assessments display */}
                    {isLoading ? (
                      // Loading skeleton
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'divide-y divide-gray-200 bg-white shadow rounded-lg overflow-hidden'}>
                        {[...Array(6)].map((_, index) => (
                          <AssessmentSkeleton key={index} />
                        ))}
                      </div>
                    ) : filteredAssessments.length > 0 ? (
                      viewMode === 'grid' ? (
                        // Grid view
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredAssessments.map((assessment) => (
                            <div 
                              key={assessment.id} 
                              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
                              onClick={() => openAssessmentDetails(assessment)}
                            >
                              <div className="p-5">
                                <div className="flex justify-between items-start">
                                  <h3 className="text-lg font-medium text-gray-900">{assessment.title}</h3>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(assessment.id);
                                    }}
                                    className={`p-1 rounded-full ${favorites.includes(assessment.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                                  >
                                    <FiStar className="h-5 w-5" />
                                  </button>
                                </div>
                                
                                <div className="mt-1 flex items-center">
                                  <span className="text-sm text-gray-500">{assessment.subject} • {assessment.grade}</span>
                                  <span className={`ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(assessment.status)}`}>
                                    {assessment.status}
                                  </span>
                                </div>
                                
                                <div className="mt-4 flex justify-between items-center">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(assessment.type)}`}>
                                    {assessment.type}
                                  </span>
                                  <span className={`text-sm ${getDaysRemaining(assessment.dueDate).color}`}>
                                    {getDaysRemaining(assessment.dueDate).text}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex justify-between">
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditModal(assessment);
                                    }} 
                                    className="p-1 text-gray-400 hover:text-primary"
                                  >
                                    <FiEdit2 className="h-5 w-5" />
                                  </button>
                                  
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAssessment(assessment.id);
                                    }} 
                                    className="p-1 text-gray-400 hover:text-red-500"
                                  >
                                    <FiTrash2 className="h-5 w-5" />
                                  </button>
                                </div>
                                
                                <div className="flex space-x-2">
                                  {assessment.status === 'Published' && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleGradeAssessment(assessment);
                                      }} 
                                      className="p-1 text-gray-400 hover:text-primary"
                                      title="Grade submissions"
                                    >
                                      <FiFile className="h-5 w-5" />
                                    </button>
                                  )}
                                  
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      duplicateAssessment(assessment);
                                    }} 
                                    className="p-1 text-gray-400 hover:text-primary"
                                    title="Duplicate assessment"
                                  >
                                    <FiCopy className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // List view
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <ul className="divide-y divide-gray-200">
                        {filteredAssessments.map((assessment) => (
                              <li 
                                key={assessment.id} 
                                className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                onClick={() => openAssessmentDetails(assessment)}
                              >
                            <div className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <p className="text-lg font-medium text-primary truncate">{assessment.title}</p>
                                  <p className="ml-4 flex-shrink-0">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(assessment.status)}`}>
                                      {assessment.status}
                                    </span>
                                  </p>
                                </div>
                                    
                                    <div className="ml-2 flex-shrink-0 flex items-center">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleFavorite(assessment.id);
                                        }}
                                        className={`p-1 rounded-full ${favorites.includes(assessment.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                                      >
                                        <FiStar className="h-5 w-5" />
                                      </button>
                                      
                                  {assessment.status === 'Published' && (
                                    <button 
                                          className="ml-2 p-1 text-gray-400 hover:text-primary"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleGradeAssessment(assessment);
                                          }}
                                      title="Grade Submissions"
                                    >
                                      <FiFile className="h-5 w-5" />
                                    </button>
                                  )}
                                      
                                  <button 
                                        className="ml-2 p-1 text-gray-400 hover:text-primary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditModal(assessment);
                                        }}
                                        title="Edit"
                                  >
                                    <FiEdit2 className="h-5 w-5" />
                                  </button>
                                      
                                  <button 
                                        className="ml-2 p-1 text-gray-400 hover:text-red-500"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteAssessment(assessment.id);
                                        }}
                                        title="Delete"
                                  >
                                    <FiTrash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                                  
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(assessment.type)} mr-2`}>
                                          {assessment.type}
                                        </span>
                                        {assessment.subject} • {assessment.grade}
                                  </p>
                                </div>
                                    
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <FiCalendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                  <p>
                                        <time dateTime={assessment.dueDate}>{formatDate(assessment.dueDate)}</time>
                                        <span className={`ml-2 ${getDaysRemaining(assessment.dueDate).color}`}>
                                          ({getDaysRemaining(assessment.dueDate).text})
                                        </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                      )
                    ) : (
                      // No results
                      <div className="text-center py-12 bg-white rounded-lg shadow">
                        <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No assessments found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Try changing your search or filter criteria, or create a new assessment.
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none"
                          >
                            <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                            Create New Assessment
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'analytics' && (
                  <div>
                    {isLoading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[...Array(3)].map((_, index) => (
                            <div key={index} className="h-32 bg-gray-200 rounded"></div>
                          ))}
                        </div>
                        <div className="h-64 bg-gray-200 rounded mt-6"></div>
                      </div>
                    ) : filteredAssessments.length > 0 ? (
                      <>
                        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                          <h2 className="text-lg font-medium text-gray-900 mb-4">Assessment Statistics</h2>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-indigo-50 rounded-lg p-4">
                              <div className="text-sm font-medium text-gray-500">Total Assessments</div>
                              <div className="text-3xl font-bold text-indigo-600 mt-1">{assessments.length}</div>
                              <div className="text-xs text-gray-500 mt-2">
                                {assessments.filter(a => a.status === 'Published').length} published • 
                                {assessments.filter(a => a.status === 'Draft').length} drafts
                              </div>
                            </div>
                            
                            <div className="bg-green-50 rounded-lg p-4">
                              <div className="text-sm font-medium text-gray-500">Due This Week</div>
                              <div className="text-3xl font-bold text-green-600 mt-1">
                                {assessments.filter(a => {
                                  const today = new Date();
                                  const nextWeek = new Date(today);
                                  nextWeek.setDate(today.getDate() + 7);
                                  const dueDate = new Date(a.dueDate);
                                  return dueDate >= today && dueDate <= nextWeek;
                                }).length}
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                Next: {formatDate(assessments
                                  .filter(a => new Date(a.dueDate) >= new Date())
                                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate || '')}
                              </div>
                            </div>
                            
                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="text-sm font-medium text-gray-500">By Type</div>
                              <div className="text-3xl font-bold text-blue-600 mt-1">
                                {assessmentTypes.length} <span className="text-sm">types</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                {assessmentTypes.map((type, i) => (
                                  <span key={i}>
                                    {assessments.filter(a => a.type === type).length} {type}
                                    {i < assessmentTypes.length - 1 ? ' • ' : ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <h3 className="text-md font-medium text-gray-900 mb-2">Assessments by Month</h3>
                          <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-around p-4">
                            {/* Simple bar chart - in a real app would use a proper chart library */}
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
                              // Generate some mock data for the chart
                              const height = Math.floor(Math.random() * 80) + 20;
                              return (
                                <div key={month} className="flex flex-col items-center">
                                  <div 
                                    className={`w-8 ${index % 3 === 0 ? 'bg-primary' : index % 3 === 1 ? 'bg-blue-400' : 'bg-indigo-400'} rounded-t`} 
                                    style={{height: `${height}%`}}
                                  ></div>
                                  <div className="text-xs mt-2">{month}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                      <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Select an Assessment to Grade
                          </h3>
                          <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Choose one of your published assessments to upload and grade student submissions
                          </p>
                        </div>
                        <div className="border-t border-gray-200">
                          <ul className="divide-y divide-gray-200">
                            {filteredAssessments
                              .filter(assessment => assessment.status.toLowerCase() === 'published')
                              .map((assessment) => (
                                <li 
                                  key={assessment.id} 
                                    className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors duration-150"
                                  onClick={() => handleGradeAssessment(assessment)}
                                >
                                  <div>
                                    <p className="text-lg font-medium text-primary">{assessment.title}</p>
                                    <p className="text-sm text-gray-500">
                                      {assessment.type} • {assessment.subject} • Grade: {assessment.grade}
                                    </p>
                                  </div>
                                    <button className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition duration-150 ease-in-out">
                                    <FiFile className="mr-1 h-4 w-4" />
                                    Grade
                                  </button>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                      </>
                    ) : (
                      <div className="text-center py-12 bg-white rounded-lg shadow">
                        <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No assessments found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Create a published assessment to access analytics and grading tools.
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none"
                          >
                            <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                            Create New Assessment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Create Assessment Modal */}
                {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Create New Assessment</h3>
                        <button
                          onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition duration-150 ease-in-out"
                        >
                          <FiX className="h-6 w-6" />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="title"
                            name="title"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                            value={newAssessment.title}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  value={newAssessment.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Quiz">Quiz</option>
                  <option value="Test">Test</option>
                  <option value="Essay">Essay</option>
                  <option value="Project">Project</option>
                </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="subject"
                              name="subject"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                              value={newAssessment.subject}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                    Grade <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="grade"
                              name="grade"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                              value={newAssessment.grade}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  value={newAssessment.description}
                  onChange={handleInputChange}
                />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                    Due Date <span className="text-red-500">*</span>
                            </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    value={newAssessment.dueDate}
                              onChange={handleInputChange}
                    required
                  />
                          </div>
                          
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                              Status
                            </label>
                            <select
                              id="status"
                              name="status"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                              value={newAssessment.status}
                              onChange={handleInputChange}
                            >
                              <option value="Draft">Draft</option>
                              <option value="Published">Published</option>
                            </select>
                          </div>
                        </div>
                        
              <div className="grid grid-cols-2 gap-4">
                        <div>
                  <label htmlFor="questions" className="block text-sm font-medium text-gray-700">
                    Number of Questions
                          </label>
                          <input
                    type="number"
                    id="questions"
                    name="questions"
                    min="0"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    value={newAssessment.questions}
                            onChange={handleInputChange}
                          />
                </div>
                
                <div>
                  <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700">
                    Estimated Time
                  </label>
                  <input
                    type="text"
                    id="estimatedTime"
                    name="estimatedTime"
                    placeholder="e.g. 30 minutes"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    value={newAssessment.estimatedTime}
                    onChange={handleInputChange}
                  />
                </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition duration-150 ease-in-out"
                          onClick={() => setIsAddModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none transition duration-150 ease-in-out"
                          onClick={handleAddAssessment}
                        >
                          Create Assessment
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Assessment Modal */}
                {isEditModalOpen && selectedAssessment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Edit Assessment</h3>
                        <button
                          onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition duration-150 ease-in-out"
                        >
                          <FiX className="h-6 w-6" />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            id="editTitle"
                            name="title"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                            value={selectedAssessment.title}
                            onChange={handleEditInputChange}
                            required
                          />
                        </div>
              
              <div>
                <label htmlFor="editType" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  id="editType"
                  name="type"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  value={selectedAssessment.type}
                  onChange={handleEditInputChange}
                >
                  <option value="Quiz">Quiz</option>
                  <option value="Test">Test</option>
                  <option value="Essay">Essay</option>
                  <option value="Project">Project</option>
                </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="editSubject" className="block text-sm font-medium text-gray-700">
                              Subject
                            </label>
                            <input
                              type="text"
                              id="editSubject"
                              name="subject"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                              value={selectedAssessment.subject}
                              onChange={handleEditInputChange}
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="editGrade" className="block text-sm font-medium text-gray-700">
                              Grade
                            </label>
                            <input
                              type="text"
                              id="editGrade"
                              name="grade"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                              value={selectedAssessment.grade}
                              onChange={handleEditInputChange}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                  <label htmlFor="editDueDate" className="block text-sm font-medium text-gray-700">
                    Due Date
                            </label>
                  <input
                    type="date"
                    id="editDueDate"
                    name="dueDate"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    value={selectedAssessment.dueDate}
                              onChange={handleEditInputChange}
                  />
                          </div>
                          
                          <div>
                            <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700">
                              Status
                            </label>
                            <select
                              id="editStatus"
                              name="status"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                              value={selectedAssessment.status}
                              onChange={handleEditInputChange}
                            >
                              <option value="Draft">Draft</option>
                              <option value="Published">Published</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition duration-150 ease-in-out"
                          onClick={() => setIsEditModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none transition duration-150 ease-in-out"
                          onClick={handleEditAssessment}
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                )}

      {/* Assessment Details Modal */}
      {isAssessmentDetailsOpen && selectedAssessment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{selectedAssessment.title}</h3>
              <button
                onClick={() => setIsAssessmentDetailsOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition duration-150 ease-in-out"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                    <p className="text-gray-900">
                      {selectedAssessment.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Subject</h4>
                      <p className="text-gray-900">{selectedAssessment.subject}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Grade</h4>
                      <p className="text-gray-900">{selectedAssessment.grade}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Due Date</h4>
                      <p className="text-gray-900">{formatDate(selectedAssessment.dueDate)}</p>
                      <p className={`text-sm ${getDaysRemaining(selectedAssessment.dueDate).color}`}>
                        {getDaysRemaining(selectedAssessment.dueDate).text}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedAssessment.status)}`}>
                        {selectedAssessment.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border-l border-gray-200 pl-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Assessment Type</h4>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeBadge(selectedAssessment.type)}`}>
                        {selectedAssessment.type}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Questions</h4>
                      <p className="text-gray-900">{selectedAssessment.questions || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Estimated Time</h4>
                      <p className="text-gray-900">{selectedAssessment.estimatedTime || 'Not specified'}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setIsAssessmentDetailsOpen(false);
                          openEditModal(selectedAssessment);
                        }}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition duration-150 ease-in-out mb-3"
                      >
                        <FiEdit2 className="mr-2 -ml-1 h-5 w-5" />
                        Edit Assessment
                      </button>
                      
                      {selectedAssessment.status === 'Published' && (
                        <button
                          onClick={() => {
                            setIsAssessmentDetailsOpen(false);
                            handleGradeAssessment(selectedAssessment);
                          }}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none transition duration-150 ease-in-out"
                        >
                          <FiFile className="mr-2 -ml-1 h-5 w-5" />
                          Grade Submissions
                        </button>
            )}
          </div>
      </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleFavorite(selectedAssessment.id)}
                  className={`inline-flex items-center px-4 py-2 border ${favorites.includes(selectedAssessment.id) ? 'border-yellow-300 bg-yellow-50 text-yellow-700' : 'border-gray-300 bg-white text-gray-700'} rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none transition duration-150 ease-in-out`}
                >
                  <FiStar className={`mr-2 -ml-1 h-5 w-5 ${favorites.includes(selectedAssessment.id) ? 'text-yellow-500' : ''}`} />
                  {favorites.includes(selectedAssessment.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
                
                <button
                  onClick={() => {
                    duplicateAssessment(selectedAssessment);
                    setIsAssessmentDetailsOpen(false);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition duration-150 ease-in-out"
                >
                  <FiCopy className="mr-2 -ml-1 h-5 w-5" />
                  Duplicate
                </button>
              </div>
              
              <button
                onClick={() => {
                  setIsAssessmentDetailsOpen(false);
                  handleDeleteAssessment(selectedAssessment.id);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none transition duration-150 ease-in-out"
              >
                <FiTrash2 className="mr-2 -ml-1 h-5 w-5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 