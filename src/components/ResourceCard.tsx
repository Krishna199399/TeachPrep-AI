import { useState } from 'react';
import { 
  FiDownload, 
  FiExternalLink, 
  FiStar, 
  FiX, 
  FiTrash2, 
  FiEye, 
  FiTag, 
  FiLink,
  FiClock
} from 'react-icons/fi';
import { Resource, useAppContext } from '@/context/AppContext';

// Extend the Resource type to include new fields
interface ExtendedResource extends Resource {
  description?: string;
  tags?: string[] | string;
  url?: string;
  dateAdded?: string;
}

interface ResourceCardProps {
  resource: ExtendedResource;
  showActions?: boolean;
  isCompact?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onView?: () => void;
  isListView?: boolean;
}

export default function ResourceCard({ 
  resource, 
  showActions = true, 
  isCompact = false,
  isFavorite = false,
  onToggleFavorite,
  onView,
  isListView = false
}: ResourceCardProps) {
  const { updateResource, deleteResource, showNotification } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedResource, setEditedResource] = useState({ ...resource });
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Interactive':
        return 'bg-purple-100 text-purple-800';
      case 'Document':
        return 'bg-blue-100 text-blue-800';
      case 'Images':
        return 'bg-green-100 text-green-800';
      case 'Video':
        return 'bg-red-100 text-red-800';
      case 'Audio':
        return 'bg-yellow-100 text-yellow-800';
      case 'Presentation':
        return 'bg-indigo-100 text-indigo-800';
      case 'Worksheet':
        return 'bg-pink-100 text-pink-800';
      case 'Quiz':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenResource = () => {
    setIsModalOpen(true);
    setEditedResource({ ...resource });
    if (onView) onView();
  };

  const handleDownload = () => {
    // In a real application, this would download the resource
    if (resource.url) {
      window.open(resource.url, '_blank');
      showNotification(`Downloading ${resource.title}`, 'success');
    } else {
      showNotification(`Download functionality coming soon for "${resource.title}"`, 'info');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedResource({ ...editedResource, [name]: value });
  };

  const handleSubmit = () => {
    // Process tags if they are in string format
    let processedResource = { ...editedResource };
    
    if (typeof processedResource.tags === 'string') {
      processedResource.tags = (processedResource.tags as string)
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }
    
    updateResource(resource.id, processedResource);
    setIsModalOpen(false);
    showNotification(`Resource "${resource.title}" updated successfully`, 'success');
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${resource.title}"?`)) {
      deleteResource(resource.id);
      showNotification(`Resource "${resource.title}" has been deleted.`, 'warning');
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Prepare tags for display
  const renderTags = () => {
    if (!resource.tags) return null;
    
    const tagArray = typeof resource.tags === 'string' 
      ? resource.tags.split(',').map(t => t.trim()) 
      : resource.tags;
    
    if (tagArray.length === 0) return null;
    
    return (
      <div className="mt-2 flex flex-wrap gap-1">
        {tagArray.slice(0, isCompact ? 2 : 4).map((tag, index) => (
          <span 
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
          >
            <FiTag className="mr-1 h-3 w-3" />
            {tag}
          </span>
        ))}
        {tagArray.length > (isCompact ? 2 : 4) && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            +{tagArray.length - (isCompact ? 2 : 4)} more
          </span>
        )}
      </div>
    );
  };

  // Determine if we should render this card in the compact, list view, or standard grid view
  const cardContent = () => {
    if (isListView) {
      // List view
      return (
        <div className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div className="flex-shrink-0 mr-4">
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getTypeIcon(resource.type)}`}>
              {resource.type.charAt(0)}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-gray-900 truncate">{resource.title}</h3>
              {resource.dateAdded && (
                <div className="text-xs text-gray-500 flex items-center ml-2">
                  <FiClock className="mr-1 h-3 w-3" />
                  {formatDate(resource.dateAdded)}
                </div>
              )}
            </div>
            
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-500 mr-3">{resource.subject}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeIcon(resource.type)}`}>
                {resource.type}
              </span>
            </div>
            
            {resource.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-1">{resource.description}</p>
            )}
            
            {renderTags()}
          </div>
          
          <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
            {onToggleFavorite && (
              <button 
                className={`p-1.5 rounded-full ${isFavorite ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
              >
                <FiStar className="h-5 w-5" />
              </button>
            )}
            
            {showActions && (
              <>
                <button 
                  className="p-1.5 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenResource();
                  }}
                >
                  <FiExternalLink className="h-5 w-5" />
                </button>
                
                <button 
                  className="p-1.5 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                >
                  <FiDownload className="h-5 w-5" />
                </button>
                
                <button 
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  <FiTrash2 className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      );
    } else if (isCompact) {
      // Compact view for recently viewed section
      return (
        <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow p-3" onClick={handleOpenResource}>
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">{resource.title}</h3>
              <div className="mt-1 flex items-center">
                <span className="text-xs text-gray-500 truncate mr-2">{resource.subject}</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getTypeIcon(resource.type)}`}>
                  {resource.type}
                </span>
              </div>
            </div>
            
            {onToggleFavorite && (
              <button 
                className={`p-1 rounded-full ${isFavorite ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
              >
                <FiStar className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {renderTags()}
        </div>
      );
    } else {
      // Standard grid view
      return (
        <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 p-4 h-full flex flex-col" onClick={handleOpenResource}>
          <div className="flex justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-md font-medium text-gray-900">{resource.title}</h3>
              <div className="mt-1 text-sm text-gray-500">{resource.subject}</div>
            </div>
            
            {onToggleFavorite && (
              <button 
                className={`p-1.5 rounded-full ${isFavorite ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
              >
                <FiStar className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {resource.description && (
            <p className={`mt-2 text-sm text-gray-600 ${showFullDescription ? '' : 'line-clamp-2'}`}>
              {resource.description}
              {resource.description.length > 120 && !showFullDescription && (
                <button 
                  className="ml-1 text-primary hover:text-primary-dark focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullDescription(true);
                  }}
                >
                  ...more
                </button>
              )}
            </p>
          )}
          
          {renderTags()}
          
          <div className="mt-auto pt-3">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeIcon(resource.type)}`}>
                {resource.type}
              </span>
              
              {showActions && (
                <div className="flex space-x-2">
                  <button 
                    className="p-1.5 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenResource();
                    }}
                  >
                    <FiExternalLink className="h-4 w-4" />
                    <span className="sr-only">Open</span>
                  </button>
                  
                  <button 
                    className="p-1.5 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                  >
                    <FiDownload className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </button>
                  
                  <button 
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                  >
                    <FiTrash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      {cardContent()}

      {/* Resource Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{resource.title}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={editedResource.title}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={editedResource.subject}
                    onChange={handleInputChange}
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
                    value={editedResource.type}
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
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={editedResource.description || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={
                      Array.isArray(editedResource.tags) 
                        ? editedResource.tags.join(', ') 
                        : editedResource.tags || ''
                    }
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                    Resource URL
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={editedResource.url || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700">Resource Preview</h4>
                    <div className={`mt-2 p-6 flex items-center justify-center rounded-lg ${getTypeIcon(editedResource.type)} h-32`}>
                      <span className="text-xl font-semibold">{editedResource.type}</span>
                    </div>
                  </div>
                  
                  {editedResource.url && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700">External Link</h4>
                      <div className="mt-2">
                        <a 
                          href={editedResource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-primary hover:text-primary-dark"
                        >
                          <FiLink className="mr-1 h-4 w-4" />
                          Open resource
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {editedResource.dateAdded && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Added on</h4>
                      <div className="mt-1 text-sm text-gray-500">
                        {new Date(editedResource.dateAdded).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleDownload}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <FiDownload className="mr-2 -ml-1 h-5 w-5" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none"
                onClick={handleSubmit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 