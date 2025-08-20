import React, { useState, useEffect } from 'react';
import { 
  FiBookOpen, 
  FiFileText, 
  FiExternalLink, 
  FiSearch,
  FiX, 
  FiCheckCircle 
} from 'react-icons/fi';
import { aiOrchestrator } from '@/utils/ai/aiOrchestrator';

type ResourceType = 'article' | 'video' | 'worksheet' | 'image' | 'website' | 'book' | 'activity';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url?: string;
  thumbnail?: string;
  tags: string[];
  relevanceScore: number;
  aiGenerated?: boolean;
}

interface ResourceRecommenderProps {
  subject?: string;
  grade?: string;
  topic?: string;
  includeAiGenerated?: boolean;
}

const ResourceRecommender: React.FC<ResourceRecommenderProps> = ({
  subject = '',
  grade = '',
  topic = '',
  includeAiGenerated = true
}) => {
  const [searchParams, setSearchParams] = useState({
    subject,
    grade,
    topic,
    resourceTypes: [] as ResourceType[],
    keywords: ''
  });
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  
  // Resource type options
  const resourceTypeOptions: { value: ResourceType; label: string; icon: JSX.Element }[] = [
    { value: 'article', label: 'Articles', icon: <FiFileText className="mr-2" /> },
    { value: 'video', label: 'Videos', icon: <FiFileText className="mr-2" /> },
    { value: 'worksheet', label: 'Worksheets', icon: <FiFileText className="mr-2" /> },
    { value: 'image', label: 'Images', icon: <FiFileText className="mr-2" /> },
    { value: 'website', label: 'Websites', icon: <FiExternalLink className="mr-2" /> },
    { value: 'book', label: 'Books', icon: <FiBookOpen className="mr-2" /> },
    { value: 'activity', label: 'Activities', icon: <FiFileText className="mr-2" /> }
  ];
  
  // Search for resources
  const handleSearch = async () => {
    if (!searchParams.subject.trim() && !searchParams.topic.trim() && !searchParams.keywords.trim()) {
      setError('Please enter a subject, topic, or keywords to search for resources');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCurrentPage(1);
    
    try {
      // Create search prompt
      const resourceTypesString = searchParams.resourceTypes.length > 0 
        ? `Limit results to these types: ${searchParams.resourceTypes.join(', ')}.` 
        : 'Include various resource types.';
      
      const prompt = `Find educational resources for ${searchParams.grade ? searchParams.grade + ' grade ' : ''}${searchParams.subject} 
      ${searchParams.topic ? 'on the topic of ' + searchParams.topic : ''}
      ${searchParams.keywords ? 'related to keywords: ' + searchParams.keywords : ''}.
      
      ${resourceTypesString}
      
      ${includeAiGenerated ? 'Include both existing resources and suggest AI-generated resources that could be created.' : 'Only include existing resources, not AI-generated ones.'}
      
      For each resource, provide:
      1. Title
      2. Brief description
      3. Resource type (article, video, worksheet, image, website, book, or activity)
      4. URL (if available)
      5. Relevant tags
      6. Whether it's an existing resource or AI-generated suggestion
      
      Return the results as structured JSON data.`;
      
      // Query the AI orchestrator
      const response = await aiOrchestrator.query(prompt, {
        responseFormat: 'json'
      });
      
      // Process and transform the response
      let recommendedResources: Resource[] = [];
      
      if (Array.isArray(response.answer)) {
        recommendedResources = response.answer.map((item: any, index: number) => ({
          id: `resource-${index}`,
          title: item.title || 'Untitled Resource',
          description: item.description || '',
          type: item.type || 'website',
          url: item.url,
          tags: item.tags || [],
          relevanceScore: item.relevanceScore || 1,
          aiGenerated: item.aiGenerated || false
        }));
      }
      
      setResources(recommendedResources);
    } catch (err: any) {
      console.error('Error fetching resource recommendations:', err);
      setError(err.message || 'Failed to fetch resource recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle resource type selection
  const toggleResourceType = (type: ResourceType) => {
    setSearchParams(prev => {
      if (prev.resourceTypes.includes(type)) {
        return {
          ...prev,
          resourceTypes: prev.resourceTypes.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          resourceTypes: [...prev.resourceTypes, type]
        };
      }
    });
  };
  
  // Reset search form
  const handleReset = () => {
    setSearchParams({
      subject: '',
      grade: '',
      topic: '',
      resourceTypes: [],
      keywords: ''
    });
    setResources([]);
    setError(null);
  };
  
  // Get resource icon based on type
  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'article':
        return <FiFileText className="h-5 w-5" />;
      case 'video':
        return <FiFileText className="h-5 w-5" />;
      case 'worksheet':
        return <FiFileText className="h-5 w-5" />;
      case 'image':
        return <FiFileText className="h-5 w-5" />;
      case 'website':
        return <FiExternalLink className="h-5 w-5" />;
      case 'book':
        return <FiBookOpen className="h-5 w-5" />;
      case 'activity':
        return <FiFileText className="h-5 w-5" />;
      default:
        return <FiFileText className="h-5 w-5" />;
    }
  };
  
  // Pagination
  const indexOfLastResource = currentPage * itemsPerPage;
  const indexOfFirstResource = indexOfLastResource - itemsPerPage;
  const currentResources = resources.slice(indexOfFirstResource, indexOfLastResource);
  const totalPages = Math.ceil(resources.length / itemsPerPage);
  
  // Initialize with props
  useEffect(() => {
    if (subject || grade || topic) {
      setSearchParams(prev => ({
        ...prev,
        subject: subject || prev.subject,
        grade: grade || prev.grade,
        topic: topic || prev.topic
      }));
      
      // Auto-search if we have initial parameters
      if ((subject && subject.trim()) || (topic && topic.trim())) {
        handleSearch();
      }
    }
  }, [subject, grade, topic]);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <FiBookOpen className="h-6 w-6 text-primary mr-2" />
        <h2 className="text-xl font-semibold">Resource Recommender</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Find the best educational resources for your lessons, personalized to your needs.
      </p>
      
      {/* Search Form */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={searchParams.subject}
              onChange={e => setSearchParams({...searchParams, subject: e.target.value})}
              className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              placeholder="E.g., Mathematics, History"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade Level
            </label>
            <input
              type="text"
              value={searchParams.grade}
              onChange={e => setSearchParams({...searchParams, grade: e.target.value})}
              className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              placeholder="E.g., 5th, High School"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topic
          </label>
          <input
            type="text"
            value={searchParams.topic}
            onChange={e => setSearchParams({...searchParams, topic: e.target.value})}
            className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
            placeholder="E.g., Fractions, American Revolution"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keywords
          </label>
          <input
            type="text"
            value={searchParams.keywords}
            onChange={e => setSearchParams({...searchParams, keywords: e.target.value})}
            className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
            placeholder="E.g., interactive, beginner, assessment"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resource Types
          </label>
          <div className="flex flex-wrap gap-2">
            {resourceTypeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => toggleResourceType(option.value)}
                className={`flex items-center px-3 py-1 rounded-full text-sm ${
                  searchParams.resourceTypes.includes(option.value)
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className={`flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white flex-grow ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            <FiSearch className="mr-2" />
            {isLoading ? 'Searching...' : 'Find Resources'}
          </button>
          
          <button
            onClick={handleReset}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
          <FiX className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Results */}
      {resources.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Recommended Resources</h3>
            <p className="text-sm text-gray-500">Found {resources.length} resources</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {currentResources.map(resource => (
              <div key={resource.id} className="border rounded-lg overflow-hidden h-full flex flex-col">
                <div className={`p-3 ${resource.aiGenerated ? 'bg-purple-50' : 'bg-blue-50'} flex items-center justify-between`}>
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${resource.aiGenerated ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      {getResourceIcon(resource.type)}
                    </div>
                    <span className="ml-2 font-medium text-sm capitalize">{resource.type}</span>
                  </div>
                  
                  {resource.aiGenerated && (
                    <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded">
                      AI-Generated
                    </span>
                  )}
                </div>
                
                <div className="p-4 flex-grow">
                  <h4 className="font-medium text-gray-900 mb-2">{resource.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {resource.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 border-t">
                  {resource.url ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-dark flex items-center text-sm font-medium"
                    >
                      <FiExternalLink className="mr-1" />
                      Visit Resource
                    </a>
                  ) : resource.aiGenerated ? (
                    <span className="text-gray-500 flex items-center text-sm">
                      <FiCheckCircle className="mr-1" />
                      Suggested AI resource
                    </span>
                  ) : (
                    <span className="text-gray-500 flex items-center text-sm">
                      <FiCheckCircle className="mr-1" />
                      Resource details available on request
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`mx-1 px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`mx-1 px-3 py-1 rounded-md ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`mx-1 px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceRecommender; 