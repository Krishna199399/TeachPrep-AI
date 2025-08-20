import { useState, ChangeEvent, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { 
  FiSearch, 
  FiFilter, 
  FiPlus, 
  FiGrid, 
  FiList, 
  FiX, 
  FiStar, 
  FiTag, 
  FiClock,
  FiUpload,
  FiInfo
} from 'react-icons/fi';
import ResourceCard from '@/components/ResourceCard';
import { useAppContext } from '@/context/AppContext';
import { Resource } from '@/context/AppContext';

export default function ResourceLibrary() {
  const { resources, addResource, isSidebarOpen, setSidebarOpen, showNotification } = useAppContext();
  const [viewMode, setViewMode] = useState(() => {
    // Get the view mode from localStorage or default to grid
    const savedViewMode = localStorage.getItem('resourceViewMode');
    return savedViewMode || 'grid';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => {
    // Get favorites from localStorage
    const savedFavorites = localStorage.getItem('favoriteResources');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [sortOption, setSortOption] = useState('dateAdded');
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>(() => {
    // Get recently viewed from localStorage
    const savedRecent = localStorage.getItem('recentlyViewedResources');
    return savedRecent ? JSON.parse(savedRecent) : [];
  });
  
  const [newResource, setNewResource] = useState({
    title: '',
    subject: '',
    type: 'Document',
    description: '',
    tags: '',
    url: ''
  });

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('resourceViewMode', viewMode);
  }, [viewMode]);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('favoriteResources', JSON.stringify(favorites));
  }, [favorites]);

  // Save recently viewed to localStorage when they change
  useEffect(() => {
    localStorage.setItem('recentlyViewedResources', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Toggle favorite status
  const toggleFavorite = (resourceId: number) => {
    if (favorites.includes(resourceId)) {
      setFavorites(favorites.filter(id => id !== resourceId));
      showNotification('Resource removed from favorites', 'info');
    } else {
      setFavorites([...favorites, resourceId]);
      showNotification('Resource added to favorites', 'success');
    }
  };

  // Mark resource as viewed
  const markAsViewed = (resourceId: number) => {
    // Remove the resource if it's already in the list
    const filteredRecent = recentlyViewed.filter(id => id !== resourceId);
    // Add it to the beginning of the array
    const newRecentlyViewed = [resourceId, ...filteredRecent].slice(0, 5); // Keep only the 5 most recent
    setRecentlyViewed(newRecentlyViewed);
  };
  
  // Filter resources based on search, filters, and favorites
  const filteredResources = resources.filter(resource => {
    // Search term filter
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (resource.tags?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    // Subject filter
    const matchesSubject = selectedSubject === '' || resource.subject === selectedSubject;
    
    // Type filter
    const matchesType = selectedType === '' || resource.type === selectedType;
    
    // Favorites filter
    const matchesFavorites = !showOnlyFavorites || favorites.includes(resource.id);
    
    return matchesSearch && matchesSubject && matchesType && matchesFavorites;
  });

  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortOption) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'nameDesc':
        return b.title.localeCompare(a.title);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'subject':
        return a.subject.localeCompare(b.subject);
      case 'dateAdded':
      default:
        // Assuming newer resources have higher IDs
        return b.id - a.id;
    }
  });

  // Get unique subjects and types for filters
  const subjects = Array.from(new Set(resources.map(r => r.subject)));
  const types = Array.from(new Set(resources.map(r => r.type)));

  // Get recently viewed resources
  const recentlyViewedResources = resources.filter(r => recentlyViewed.includes(r.id))
    .sort((a, b) => {
      // Sort by the order in recentlyViewed array
      return recentlyViewed.indexOf(a.id) - recentlyViewed.indexOf(b.id);
    });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewResource(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddResource = () => {
    // Validate required fields
    if (!newResource.title || !newResource.subject) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    // Create tags array from comma-separated string
    const tagsArray = newResource.tags 
      ? newResource.tags.split(',').map(tag => tag.trim())
      : [];
    
    // Add the resource using context
    const resourceToAdd = {
      ...newResource,
      tags: tagsArray,
      dateAdded: new Date().toISOString()
    };
    
    addResource(resourceToAdd);
    setIsAddModalOpen(false);
    setNewResource({
      title: '',
      subject: '',
      type: 'Document',
      description: '',
      tags: '',
      url: ''
    });
    
    showNotification('Resource added successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Resource Library | TeachPrep AI</title>
        <meta name="description" content="Access and manage your teaching resources and materials" />
      </Head>

      <Header setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <Sidebar open={isSidebarOpen} setOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              // Loading skeleton
              <div className="animate-pulse">
                <div className="flex justify-between items-center mb-6">
                  <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
                  <div className="h-10 w-40 bg-gray-200 rounded"></div>
                </div>
                <div className="h-16 bg-white rounded-lg shadow mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-40 bg-white rounded-lg shadow"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Resource Library</h1>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <button 
                      className={`inline-flex items-center px-4 py-2 border ${showOnlyFavorites ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-gray-300 bg-white text-gray-700'} rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none transition-colors duration-200`}
                      onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                    >
                      <FiStar className={`mr-2 -ml-1 h-5 w-5 ${showOnlyFavorites ? 'text-yellow-500' : 'text-gray-400'}`} />
                      {showOnlyFavorites ? 'All Resources' : 'Favorites'}
                    </button>
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none transition-all duration-200 transform hover:-translate-y-0.5"
                      onClick={() => setIsAddModalOpen(true)}
                    >
                      <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                      Add New Resource
                    </button>
                  </div>
                </div>

                {/* Search and filter panel */}
                <div className="bg-white shadow rounded-lg mb-6 overflow-hidden transition-all duration-200 hover:shadow-md">
                  <div className="p-4 flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out"
                          placeholder="Search by title, subject, or tags..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                        <select
                          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                          <option value="">All Subjects</option>
                          {subjects.map((subject, index) => (
                            <option key={index} value={subject}>{subject}</option>
                          ))}
                        </select>
                        
                        <select
                          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                        >
                          <option value="">All Types</option>
                          {types.map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                          ))}
                        </select>
                        
                        <select
                          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          value={sortOption}
                          onChange={(e) => setSortOption(e.target.value)}
                        >
                          <option value="dateAdded">Newest First</option>
                          <option value="name">Name (A-Z)</option>
                          <option value="nameDesc">Name (Z-A)</option>
                          <option value="type">Type</option>
                          <option value="subject">Subject</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'} found
                        </span>
                        {searchTerm || selectedSubject || selectedType || showOnlyFavorites ? (
                          <button
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedSubject('');
                              setSelectedType('');
                              setShowOnlyFavorites(false);
                            }}
                          >
                            <FiX className="mr-1 h-3 w-3" />
                            Clear all filters
                          </button>
                        ) : null}
                      </div>
                      
                      <div className="flex rounded-md shadow-sm">
                        <button
                          type="button"
                          className={`inline-flex items-center p-2 border border-r-0 rounded-l-md ${
                            viewMode === 'grid'
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'
                          } transition-colors duration-200`}
                          onClick={() => setViewMode('grid')}
                        >
                          <FiGrid className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          className={`inline-flex items-center p-2 border rounded-r-md ${
                            viewMode === 'list'
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'
                          } transition-colors duration-200`}
                          onClick={() => setViewMode('list')}
                        >
                          <FiList className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recently viewed section (only show if there are recently viewed resources) */}
                {recentlyViewedResources.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <FiClock className="mr-2 h-5 w-5 text-gray-500" />
                      Recently Viewed
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {recentlyViewedResources.map(resource => (
                        <ResourceCard 
                          key={`recent-${resource.id}`} 
                          resource={resource} 
                          isCompact={true}
                          isFavorite={favorites.includes(resource.id)}
                          onToggleFavorite={() => toggleFavorite(resource.id)}
                          onView={() => markAsViewed(resource.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources list */}
                {filteredResources.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <FiInfo className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No resources found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {showOnlyFavorites 
                        ? "You don't have any favorites yet. Try adding some resources to your favorites."
                        : "No resources match your search criteria. Try adjusting your filters or search term."}
                    </p>
                    <div className="mt-6">
                      <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedSubject('');
                          setSelectedType('');
                          setShowOnlyFavorites(false);
                        }}
                      >
                        Clear all filters
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                      : 'space-y-4'
                  }>
                    {sortedResources.map((resource) => (
                      <ResourceCard 
                        key={resource.id} 
                        resource={resource}
                        isCompact={false}
                        isFavorite={favorites.includes(resource.id)}
                        onToggleFavorite={() => toggleFavorite(resource.id)}
                        onView={() => markAsViewed(resource.id)}
                        isListView={viewMode === 'list'}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add New Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add New Resource</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={newResource.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={newResource.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={newResource.type}
                  onChange={handleInputChange}
                >
                  <option value="Interactive">Interactive</option>
                  <option value="Document">Document</option>
                  <option value="Images">Images</option>
                  <option value="Video">Video</option>
                  <option value="Audio">Audio</option>
                  <option value="Presentation">Presentation</option>
                  <option value="Worksheet">Worksheet</option>
                  <option value="Quiz">Quiz</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={newResource.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags (comma-separated)
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex items-stretch flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiTag className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="algebra, equations, math"
                      value={newResource.tags}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                  Resource URL (optional)
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="https://example.com/resource"
                  value={newResource.url}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500">
                  <FiUpload className="inline-block mr-1" /> 
                  File upload functionality will be available soon.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                onClick={handleAddResource}
              >
                Add Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 