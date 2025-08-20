import React, { useState } from 'react';
import { 
  FiFileText, 
  FiCpu, 
  FiX, 
  FiCheckCircle, 
  FiCopy,
  FiPlus,
  FiDownload
} from 'react-icons/fi';
import { aiOrchestrator } from '@/utils/ai/aiOrchestrator';

type InteractiveElementType = 
  | 'quiz'
  | 'matching'
  | 'fillInBlank'
  | 'dragDrop'
  | 'flashcards'
  | 'timeline'
  | 'discussion';

interface InteractiveElementOption {
  type: InteractiveElementType;
  label: string;
  description: string;
  icon: JSX.Element;
}

interface InteractiveLessonBuilderProps {
  subject?: string;
  grade?: string;
  topic?: string;
}

const InteractiveLessonBuilder: React.FC<InteractiveLessonBuilderProps> = ({
  subject = '',
  grade = '',
  topic = ''
}) => {
  const [lessonContext, setLessonContext] = useState({
    subject: subject,
    grade: grade,
    topic: topic,
    objectives: ''
  });
  
  const [selectedElements, setSelectedElements] = useState<InteractiveElementType[]>([]);
  const [generatedElements, setGeneratedElements] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'config' | 'generated'>('config');
  
  // Available interactive elements
  const interactiveElements: InteractiveElementOption[] = [
    {
      type: 'quiz',
      label: 'Interactive Quiz',
      description: 'Multiple choice, true/false, and short answer questions with feedback',
      icon: <FiFileText className="h-6 w-6 text-blue-500" />
    },
    {
      type: 'matching',
      label: 'Matching Activity',
      description: 'Connect related terms and definitions',
      icon: <FiFileText className="h-6 w-6 text-green-500" />
    },
    {
      type: 'fillInBlank',
      label: 'Fill in the Blank',
      description: 'Complete sentences with missing words',
      icon: <FiFileText className="h-6 w-6 text-yellow-500" />
    },
    {
      type: 'dragDrop',
      label: 'Drag and Drop',
      description: 'Organize items into categories',
      icon: <FiFileText className="h-6 w-6 text-purple-500" />
    },
    {
      type: 'flashcards',
      label: 'Flashcards',
      description: 'Study key concepts with interactive cards',
      icon: <FiFileText className="h-6 w-6 text-red-500" />
    },
    {
      type: 'timeline',
      label: 'Interactive Timeline',
      description: 'Explore events in chronological order',
      icon: <FiFileText className="h-6 w-6 text-indigo-500" />
    },
    {
      type: 'discussion',
      label: 'Discussion Prompts',
      description: 'Thought-provoking questions for classroom dialogue',
      icon: <FiFileText className="h-6 w-6 text-orange-500" />
    }
  ];
  
  const handleElementToggle = (elementType: InteractiveElementType) => {
    if (selectedElements.includes(elementType)) {
      setSelectedElements(selectedElements.filter(type => type !== elementType));
    } else {
      setSelectedElements([...selectedElements, elementType]);
    }
  };
  
  const validateForm = (): boolean => {
    if (!lessonContext.subject.trim()) {
      setError('Please enter a subject');
      return false;
    }
    
    if (!lessonContext.grade.trim()) {
      setError('Please enter a grade level');
      return false;
    }
    
    if (!lessonContext.topic.trim()) {
      setError('Please enter a lesson topic');
      return false;
    }
    
    if (selectedElements.length === 0) {
      setError('Please select at least one interactive element');
      return false;
    }
    
    return true;
  };
  
  const handleGenerateElements = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const generatedData: Record<string, any> = {};
      
      // Generate each selected element
      for (const elementType of selectedElements) {
        const element = interactiveElements.find(e => e.type === elementType);
        
        if (element) {
          // Create a prompt for this element type
          const prompt = `Create an interactive ${element.label} for a ${lessonContext.grade} grade ${lessonContext.subject} lesson about "${lessonContext.topic}".
          
          ${lessonContext.objectives ? `The learning objectives are: ${lessonContext.objectives}` : ''}
          
          Please provide the content in JSON format that can be used to create this interactive element.
          
          For example, if it's a quiz, include questions, options, and correct answers.
          If it's matching, provide pairs of items to match.
          
          Make sure the content is:
          1. Age-appropriate for ${lessonContext.grade} grade
          2. Accurate and educational
          3. Engaging and interactive
          4. Well-structured for implementation
          
          Return ONLY the JSON data without any additional explanation.`;
          
          // Call the AI orchestrator
          const response = await aiOrchestrator.query(prompt, {
            responseFormat: 'json'
          });
          
          // Store the generated element
          generatedData[elementType] = response.answer;
        }
      }
      
      setGeneratedElements(generatedData);
      setCurrentView('generated');
    } catch (err: any) {
      console.error('Error generating interactive elements:', err);
      setError(err.message || 'Failed to generate interactive elements. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadElements = () => {
    const fileName = `${lessonContext.subject.replace(/\s+/g, '-')}-${lessonContext.topic.replace(/\s+/g, '-')}-interactive-elements.json`;
    const jsonContent = JSON.stringify(generatedElements, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };
  
  // Copy element to clipboard
  const handleCopyElement = (elementType: string) => {
    const jsonContent = JSON.stringify(generatedElements[elementType], null, 2);
    navigator.clipboard.writeText(jsonContent);
    
    // Show a temporary "Copied" message (in a real implementation)
    alert('Copied to clipboard!');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <FiCpu className="h-6 w-6 text-primary mr-2" />
        <h2 className="text-xl font-semibold">Interactive Lesson Builder</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Generate interactive elements for your lessons to increase student engagement and comprehension.
      </p>
      
      {currentView === 'config' ? (
        <>
          {/* Lesson Context */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Lesson Context</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lessonContext.subject}
                  onChange={e => setLessonContext({...lessonContext, subject: e.target.value})}
                  className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                  placeholder="E.g., Science, History"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Level <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lessonContext.grade}
                  onChange={e => setLessonContext({...lessonContext, grade: e.target.value})}
                  className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                  placeholder="E.g., 5th, High School"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lessonContext.topic}
                onChange={e => setLessonContext({...lessonContext, topic: e.target.value})}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                placeholder="E.g., Photosynthesis, World War II"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Learning Objectives (Optional)
              </label>
              <textarea
                value={lessonContext.objectives}
                onChange={e => setLessonContext({...lessonContext, objectives: e.target.value})}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter learning objectives, separated by line breaks"
                rows={3}
              />
            </div>
          </div>
          
          {/* Interactive Elements Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Select Interactive Elements</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {interactiveElements.map(element => (
                <div
                  key={element.type}
                  onClick={() => handleElementToggle(element.type)}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedElements.includes(element.type)
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    {element.icon}
                    <span className="ml-2 font-medium">{element.label}</span>
                  </div>
                  <p className="text-sm text-gray-500">{element.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
              <FiX className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}
          
          <button
            onClick={handleGenerateElements}
            disabled={isLoading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            {isLoading ? 'Generating Elements...' : 'Generate Interactive Elements'}
          </button>
        </>
      ) : (
        <>
          {/* Generated Elements View */}
          <button
            onClick={() => setCurrentView('config')}
            className="text-primary hover:text-primary-dark mb-4 flex items-center text-sm"
          >
            ← Back to configuration
          </button>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Generated Interactive Elements</h3>
              
              <button
                onClick={handleDownloadElements}
                className="flex items-center text-sm text-primary hover:text-primary-dark"
              >
                <FiDownload className="mr-1" />
                Download All
              </button>
            </div>
            
            <div className="space-y-6">
              {Object.entries(generatedElements).map(([elementType, elementData]) => {
                const element = interactiveElements.find(e => e.type === elementType);
                
                return (
                  <div key={elementType} className="border rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
                      <div className="flex items-center">
                        {element?.icon}
                        <h4 className="font-medium ml-2">{element?.label}</h4>
                      </div>
                      
                      <button
                        onClick={() => handleCopyElement(elementType)}
                        className="text-gray-500 hover:text-primary"
                        title="Copy to clipboard"
                      >
                        <FiCopy />
                      </button>
                    </div>
                    
                    <div className="p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(elementData, null, 2)}</pre>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <button
            onClick={() => handleGenerateElements()}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
          >
            Regenerate Elements
          </button>
        </>
      )}
    </div>
  );
};

export default InteractiveLessonBuilder; 