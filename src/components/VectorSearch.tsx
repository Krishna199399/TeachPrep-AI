import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX, FiLoader } from 'react-icons/fi';
import SpeechRecognition from './SpeechRecognition';
import axios from 'axios';

interface SearchResult {
  id: string;
  content: string;
  metadata: {
    title?: string;
    subject?: string;
    grade?: string;
    score: number;
    [key: string]: any;
  };
}

interface VectorSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
  subjectOptions?: string[];
  gradeOptions?: string[];
}

const VectorSearch: React.FC<VectorSearchProps> = ({
  onResultSelect,
  placeholder = 'Search for teaching resources...',
  showFilters = true,
  className = '',
  subjectOptions = ['Mathematics', 'Science', 'English', 'History', 'Art'],
  gradeOptions = ['K-2', '3-5', '6-8', '9-12', 'College'],
}) => {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  // Handle search submission
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setAnswer(null);
    
    try {
      const response = await axios.post('/api/rag/query', {
        query,
        subject: subject || undefined,
        grade: grade || undefined,
      });
      
      setResults(response.data.sources || []);
      setAnswer(response.data.answer);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to perform search');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle speech recognition result
  const handleSpeechResult = (text: string) => {
    setQuery(text);
  };

  // Clear search and results
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setAnswer(null);
    setError(null);
  };

  // Toggle filters panel
  const toggleFilters = () => {
    setShowFiltersPanel(!showFiltersPanel);
  };

  // Clear filters
  const clearFilters = () => {
    setSubject('');
    setGrade('');
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        {/* Search input */}
        <div className="flex items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-4 py-2 pl-10 pr-16 border rounded-lg shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            )}
          </div>
          
          {showFilters && (
            <button
              onClick={toggleFilters}
              className={`ml-2 p-2 rounded-lg ${
                showFiltersPanel || subject || grade
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="Toggle filters"
            >
              <FiFilter />
            </button>
          )}
          
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isLoading}
            className={`ml-2 px-4 py-2 rounded-lg ${
              !query.trim() || isLoading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
          >
            {isLoading ? <FiLoader className="animate-spin" /> : 'Search'}
          </button>
        </div>
        
        {/* Voice search */}
        <div className="mt-2">
          <SpeechRecognition
            onTextCapture={handleSpeechResult}
            placeholder="Speak to search..."
          />
        </div>
        
        {/* Filters panel */}
        {showFiltersPanel && (
          <div className="mt-2 p-4 border rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:text-primary-dark"
              >
                Clear all
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2 border rounded focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">All Subjects</option>
                  {subjectOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Level
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full p-2 border rounded focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">All Grades</option>
                  {gradeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* AI Answer */}
      {answer && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <h3 className="font-medium mb-2">AI Response:</h3>
          <div className="text-gray-800 whitespace-pre-line">{answer}</div>
        </div>
      )}
      
      {/* Search results */}
      {results.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Sources:</h3>
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => onResultSelect?.(result)}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {result.metadata.title && (
                  <h4 className="font-medium">{result.metadata.title}</h4>
                )}
                <p className="text-sm text-gray-600 mt-1">{result.content}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.metadata.subject && (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-xs font-medium text-blue-800 rounded-full">
                      {result.metadata.subject}
                    </span>
                  )}
                  {result.metadata.grade && (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-xs font-medium text-green-800 rounded-full">
                      Grade: {result.metadata.grade}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs font-medium text-gray-800 rounded-full">
                    Relevance: {Math.round(result.metadata.score * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {/* No results message */}
      {!isLoading && query && results.length === 0 && !error && !answer && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-100 text-gray-700 rounded-lg">
          No matching resources found. Try broadening your search or using different keywords.
        </div>
      )}
    </div>
  );
};

export default VectorSearch; 