import React, { useState } from 'react';
import { 
  FiFileText, 
  FiPlus,
  FiCpu, 
  FiCopy, 
  FiCheckCircle,
  FiX 
} from 'react-icons/fi';
import { aiOrchestrator } from '@/utils/ai/aiOrchestrator';

interface ContentSummarizerProps {
  defaultText?: string;
}

const ContentSummarizer: React.FC<ContentSummarizerProps> = ({ defaultText = '' }) => {
  const [originalContent, setOriginalContent] = useState(defaultText);
  const [summarizedContent, setSummarizedContent] = useState('');
  const [summaryType, setSummaryType] = useState<'concise' | 'detailed' | 'bullet' | 'outline'>('concise');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [summaryLength, setSummaryLength] = useState<number>(25);
  const [targetAudience, setTargetAudience] = useState<'elementary' | 'middle' | 'high' | 'college'>('high');
  
  const handleSummarize = async () => {
    if (!originalContent.trim()) {
      setError('Please enter content to summarize');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCopied(false);
    
    try {
      // Create a prompt based on the selected options
      const prompt = `Please summarize the following educational content ${
        summaryType === 'concise' ? 'concisely' :
        summaryType === 'detailed' ? 'in detail' :
        summaryType === 'bullet' ? 'as bullet points' :
        'as an outline with headings and subpoints'
      }. The summary should be approximately ${summaryLength}% of the original length and should be appropriate for ${
        targetAudience === 'elementary' ? 'elementary school students' :
        targetAudience === 'middle' ? 'middle school students' :
        targetAudience === 'high' ? 'high school students' :
        'college students'
      }.
      
      Content to summarize:
      ${originalContent}`;
      
      // Use the AI orchestrator to generate the summary
      const response = await aiOrchestrator.query(prompt, {
        responseFormat: 'text'
      });
      
      setSummarizedContent(response.answer);
    } catch (err: any) {
      console.error('Error summarizing content:', err);
      setError(err.message || 'Failed to summarize content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(summarizedContent);
    setCopied(true);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const handleReset = () => {
    setOriginalContent('');
    setSummarizedContent('');
    setError(null);
    setCopied(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <FiCpu className="h-6 w-6 text-primary mr-2" />
        <h2 className="text-xl font-semibold">AI Content Summarizer</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Automatically summarize lengthy educational materials to save time and improve comprehension.
      </p>
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex-grow">
            Content to Summarize
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setAdvanced(!advanced)}
              className="text-sm text-primary flex items-center hover:text-primary-dark"
            >
              Advanced Options
              {advanced ? <FiX className="ml-1" /> : <FiPlus className="ml-1" />}
            </button>
          </div>
        </div>
        
        <textarea 
          value={originalContent}
          onChange={(e) => setOriginalContent(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-primary focus:border-primary h-64"
          placeholder="Paste your educational content here..."
        />
        
        <div className="text-sm text-gray-500 mt-1 flex justify-between">
          <span>{originalContent.length} characters</span>
          {originalContent && (
            <button 
              className="text-primary hover:text-primary-dark"
              onClick={handleReset}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      {advanced && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Advanced Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary Type
              </label>
              <select
                value={summaryType}
                onChange={(e) => setSummaryType(e.target.value as any)}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="concise">Concise Summary</option>
                <option value="detailed">Detailed Summary</option>
                <option value="bullet">Bullet Points</option>
                <option value="outline">Outline Format</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="elementary">Elementary School</option>
                <option value="middle">Middle School</option>
                <option value="high">High School</option>
                <option value="college">College/University</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary Length: {summaryLength}% of original
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={summaryLength}
                onChange={(e) => setSummaryLength(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>More concise</span>
                <span>More detailed</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={handleSummarize}
        disabled={isLoading || !originalContent.trim()}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          isLoading || !originalContent.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-primary hover:bg-primary-dark'
        } mb-6`}
      >
        {isLoading ? 'Summarizing...' : 'Summarize Content'}
      </button>
      
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
          <FiX className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {summarizedContent && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Summarized Content
            </label>
            
            <button
              onClick={handleCopy}
              className="text-sm text-primary flex items-center hover:text-primary-dark"
            >
              {copied ? (
                <>
                  <FiCheckCircle className="mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <FiCopy className="mr-1" />
                  Copy to clipboard
                </>
              )}
            </button>
          </div>
          
          <div className="p-4 border rounded-md bg-gray-50">
            <div className="whitespace-pre-wrap">{summarizedContent}</div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSummarize}
              className="flex items-center text-sm text-primary hover:text-primary-dark"
            >
              <FiCheckCircle className="mr-1" />
              Regenerate Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentSummarizer; 