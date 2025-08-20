import React, { useState } from 'react';
import { 
  FiFileText, 
  FiCopy, 
  FiX, 
  FiCheckCircle 
} from 'react-icons/fi';
import { aiOrchestrator } from '@/utils/ai/aiOrchestrator';

interface Language {
  code: string;
  name: string;
}

interface MultilingualTranslatorProps {
  defaultText?: string;
  defaultSourceLanguage?: string;
  defaultTargetLanguage?: string;
}

const MultilingualTranslator: React.FC<MultilingualTranslatorProps> = ({
  defaultText = '',
  defaultSourceLanguage = 'en',
  defaultTargetLanguage = 'es'
}) => {
  const [originalContent, setOriginalContent] = useState(defaultText);
  const [translatedContent, setTranslatedContent] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState(defaultSourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState(defaultTargetLanguage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [adaptForEducation, setAdaptForEducation] = useState(true);
  
  // Supported languages
  const languages: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ru', name: 'Russian' }
  ];
  
  const handleTranslate = async () => {
    if (!originalContent.trim()) {
      setError('Please enter content to translate');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCopied(false);
    
    try {
      // Get language names for prompt
      const sourceLangName = languages.find(l => l.code === sourceLanguage)?.name || sourceLanguage;
      const targetLangName = languages.find(l => l.code === targetLanguage)?.name || targetLanguage;
      
      // Create translation prompt
      const prompt = `Please translate the following ${sourceLangName} educational content into ${targetLangName}. 
      
      ${preserveFormatting ? 'Preserve the original formatting including paragraphs, bullet points, and numbering.' : 'Focus on natural translation over preserving exact formatting.'}
      
      ${adaptForEducation ? 'Adapt the translation for educational use, ensuring concepts are clear and appropriate for students.' : 'Provide a direct translation without adaptation.'} 
      
      Original content (${sourceLangName}):
      ${originalContent}`;
      
      // Use the AI orchestrator to generate the translation
      const response = await aiOrchestrator.query(prompt, {
        responseFormat: 'text'
      });
      
      setTranslatedContent(response.answer);
    } catch (err: any) {
      console.error('Error translating content:', err);
      setError(err.message || 'Failed to translate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(translatedContent);
    setCopied(true);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    
    if (translatedContent) {
      setOriginalContent(translatedContent);
      setTranslatedContent('');
    }
  };
  
  const handleReset = () => {
    setOriginalContent('');
    setTranslatedContent('');
    setError(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <FiFileText className="h-6 w-6 text-primary mr-2" />
        <h2 className="text-xl font-semibold">Multilingual Content Translator</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Translate educational content into multiple languages to support diverse student populations.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Source Language
            </label>
          </div>
          
          <select
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary mb-2"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          
          <textarea 
            value={originalContent}
            onChange={(e) => setOriginalContent(e.target.value)}
            className="w-full p-3 border rounded-md focus:ring-primary focus:border-primary h-64"
            placeholder={`Enter content in ${languages.find(l => l.code === sourceLanguage)?.name || 'source language'}...`}
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Target Language
            </label>
            
            <button
              onClick={handleSwapLanguages}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Swap Languages
            </button>
          </div>
          
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary mb-2"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          
          {translatedContent ? (
            <div className="relative">
              <div className="p-3 border rounded-md bg-gray-50 h-64 overflow-y-auto whitespace-pre-wrap">
                {translatedContent}
              </div>
              
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-200"
                title="Copy translation"
              >
                {copied ? <FiCheckCircle className="text-green-500" /> : <FiCopy />}
              </button>
            </div>
          ) : (
            <div className="border rounded-md bg-gray-50 h-64 flex items-center justify-center text-gray-400">
              <div className="text-center p-6">
                <FiFileText className="h-8 w-8 mx-auto mb-2" />
                <p>
                  {isLoading ? 'Translating...' : 'Translation will appear here'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={preserveFormatting}
            onChange={(e) => setPreserveFormatting(e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Preserve formatting</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={adaptForEducation}
            onChange={(e) => setAdaptForEducation(e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Adapt for educational use</span>
        </label>
      </div>
      
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
          <FiX className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="flex space-x-4">
        <button
          onClick={handleTranslate}
          disabled={isLoading || !originalContent.trim()}
          className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading || !originalContent.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-dark'
          }`}
        >
          {isLoading ? 'Translating...' : 'Translate'}
        </button>
        
        {originalContent && (
          <button
            onClick={handleReset}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default MultilingualTranslator; 