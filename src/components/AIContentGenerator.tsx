import React, { useState } from 'react';
import { 
  FiFileText, 
  FiDownload, 
  FiCheckCircle, 
  FiX, 
  FiEdit2, 
  FiCpu,
  FiGrid,
  FiBook,
  FiClipboard,
  FiList
} from 'react-icons/fi';
import { aiOrchestrator } from '@/utils/ai/aiOrchestrator';

type ContentType = 'worksheet' | 'quiz' | 'lesson_plan' | 'homework' | 'presentation';

interface Template {
  id: string;
  type: ContentType;
  name: string;
  description: string;
  icon: React.ReactNode;
  params: {
    name: string;
    type: 'text' | 'select' | 'multiselect' | 'number';
    label: string;
    options?: string[];
    required: boolean;
  }[];
}

interface AIContentGeneratorProps {
  subject?: string;
  grade?: string;
  onGenerationComplete?: (content: any) => void;
}

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({ 
  subject = '', 
  grade = '',
  onGenerationComplete
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Template definitions
  const templates: Template[] = [
    {
      id: 'worksheet-basic',
      type: 'worksheet',
      name: 'Basic Worksheet',
      description: 'Generate practice problems with varied difficulty levels',
      icon: <FiGrid className="h-6 w-6 text-blue-500" />,
      params: [
        { name: 'subject', type: 'text', label: 'Subject', required: true },
        { name: 'grade', type: 'text', label: 'Grade Level', required: true },
        { name: 'topic', type: 'text', label: 'Specific Topic', required: true },
        { name: 'numQuestions', type: 'number', label: 'Number of Questions', required: true },
        { 
          name: 'questionTypes', 
          type: 'multiselect', 
          label: 'Question Types', 
          options: ['Multiple Choice', 'Short Answer', 'Fill in the Blank', 'Matching', 'True/False'], 
          required: true 
        },
        { 
          name: 'difficultyLevel', 
          type: 'select', 
          label: 'Difficulty Level', 
          options: ['Easy', 'Medium', 'Hard', 'Mixed'], 
          required: true 
        }
      ]
    },
    {
      id: 'quiz-standard',
      type: 'quiz',
      name: 'Standard Quiz',
      description: 'Create assessment quizzes with automatic grading',
      icon: <FiClipboard className="h-6 w-6 text-green-500" />,
      params: [
        { name: 'subject', type: 'text', label: 'Subject', required: true },
        { name: 'grade', type: 'text', label: 'Grade Level', required: true },
        { name: 'topic', type: 'text', label: 'Specific Topic', required: true },
        { name: 'numQuestions', type: 'number', label: 'Number of Questions', required: true },
        { 
          name: 'questionTypes', 
          type: 'multiselect', 
          label: 'Question Types', 
          options: ['Multiple Choice', 'True/False', 'Short Answer'], 
          required: true 
        },
        { name: 'timeLimit', type: 'number', label: 'Time Limit (minutes)', required: false }
      ]
    },
    {
      id: 'lesson-plan-detailed',
      type: 'lesson_plan',
      name: 'Detailed Lesson Plan',
      description: 'Comprehensive lesson plan with activities and resources',
      icon: <FiBook className="h-6 w-6 text-purple-500" />,
      params: [
        { name: 'subject', type: 'text', label: 'Subject', required: true },
        { name: 'grade', type: 'text', label: 'Grade Level', required: true },
        { name: 'topic', type: 'text', label: 'Lesson Topic', required: true },
        { name: 'duration', type: 'number', label: 'Lesson Duration (minutes)', required: true },
        { name: 'objectives', type: 'text', label: 'Learning Objectives (comma separated)', required: true },
        { 
          name: 'activityTypes', 
          type: 'multiselect', 
          label: 'Activity Types', 
          options: ['Group Work', 'Individual Work', 'Discussion', 'Hands-on', 'Interactive', 'Lecture'], 
          required: false 
        }
      ]
    },
    {
      id: 'homework-assignment',
      type: 'homework',
      name: 'Homework Assignment',
      description: 'Create take-home assignments with clear instructions',
      icon: <FiFileText className="h-6 w-6 text-orange-500" />,
      params: [
        { name: 'subject', type: 'text', label: 'Subject', required: true },
        { name: 'grade', type: 'text', label: 'Grade Level', required: true },
        { name: 'topic', type: 'text', label: 'Topic', required: true },
        { name: 'numQuestions', type: 'number', label: 'Number of Questions', required: true },
        { name: 'dueDate', type: 'text', label: 'Due Date', required: false },
        { 
          name: 'difficulty', 
          type: 'select', 
          label: 'Difficulty Level', 
          options: ['Easy', 'Medium', 'Hard', 'Mixed'], 
          required: true 
        }
      ]
    },
    {
      id: 'presentation-slides',
      type: 'presentation',
      name: 'Presentation Slides',
      description: 'Generate slide content for classroom presentations',
      icon: <FiList className="h-6 w-6 text-red-500" />,
      params: [
        { name: 'subject', type: 'text', label: 'Subject', required: true },
        { name: 'grade', type: 'text', label: 'Grade Level', required: true },
        { name: 'topic', type: 'text', label: 'Presentation Topic', required: true },
        { name: 'numSlides', type: 'number', label: 'Number of Slides', required: true },
        { 
          name: 'slideTypes', 
          type: 'multiselect', 
          label: 'Include Slide Types', 
          options: ['Title', 'Outline', 'Content', 'Images', 'Charts', 'Quiz Questions', 'Summary'], 
          required: true 
        }
      ]
    }
  ];

  // Initialize form values based on props
  React.useEffect(() => {
    if (subject || grade) {
      setFormValues(prev => ({
        ...prev,
        subject: subject || prev.subject,
        grade: grade || prev.grade
      }));
    }
  }, [subject, grade]);

  // Handle form input changes
  const handleInputChange = (paramName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  // Handle template selection
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setGenerationStatus('idle');
    setGeneratedContent(null);
    setError(null);
    
    // Initialize form values with defaults from props
    const initialValues: Record<string, any> = {};
    template.params.forEach(param => {
      if (param.name === 'subject' && subject) {
        initialValues.subject = subject;
      } else if (param.name === 'grade' && grade) {
        initialValues.grade = grade;
      } else if (param.type === 'multiselect') {
        initialValues[param.name] = [];
      } else {
        initialValues[param.name] = '';
      }
    });
    
    setFormValues(initialValues);
  };

  // Handle content generation
  const handleGenerateContent = async () => {
    // Validate required fields
    const missingFields = selectedTemplate?.params
      .filter(param => param.required && !formValues[param.name])
      .map(param => param.label);
    
    if (missingFields && missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    setGenerationStatus('generating');
    setError(null);
    
    try {
      let generatedContent;
      
      // Call the appropriate AI generator function based on content type
      switch (selectedTemplate?.type) {
        case 'lesson_plan':
          const objectives = formValues.objectives.split(',').map((obj: string) => obj.trim());
          generatedContent = await aiOrchestrator.generateLessonPlan(
            formValues.subject,
            formValues.grade,
            objectives,
            formValues.duration,
            JSON.stringify({
              activityTypes: formValues.activityTypes,
              topic: formValues.topic
            })
          );
          break;
          
        case 'quiz':
        case 'worksheet':
          generatedContent = await aiOrchestrator.generateAssessment(
            formValues.subject,
            formValues.grade,
            [formValues.topic],
            selectedTemplate.type === 'quiz' ? 'quiz' : 'rubric',
            formValues.numQuestions
          );
          break;
          
        default:
          // For other types, use the query function
          const response = await aiOrchestrator.query(
            `Generate a ${selectedTemplate?.name} for ${formValues.grade} grade ${formValues.subject} on the topic ${formValues.topic}. Include these parameters: ${Object.entries(formValues)
              .filter(([key]) => key !== 'subject' && key !== 'grade' && key !== 'topic')
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')}`,
            {
              subject: formValues.subject,
              grade: formValues.grade,
              responseFormat: 'json'
            }
          );
          generatedContent = response;
      }
      
      setGeneratedContent(generatedContent);
      setGenerationStatus('success');
      
      if (onGenerationComplete) {
        onGenerationComplete(generatedContent);
      }
      
    } catch (err: any) {
      console.error('Error generating content:', err);
      setError(err.message || 'Failed to generate content. Please try again.');
      setGenerationStatus('error');
    }
  };

  // Handle back to templates
  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setGeneratedContent(null);
    setGenerationStatus('idle');
    setError(null);
  };

  // Handle content download
  const handleDownloadContent = () => {
    if (!generatedContent) return;
    
    const contentString = JSON.stringify(generatedContent, null, 2);
    const contentType = selectedTemplate?.type || 'content';
    const fileName = `${formValues.subject}-${formValues.topic}-${contentType}.json`;
    
    const blob = new Blob([contentString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <FiCpu className="h-6 w-6 text-primary mr-2" />
        <h2 className="text-xl font-semibold">AI Content Generator</h2>
      </div>
      
      {!selectedTemplate ? (
        <>
          <p className="text-gray-600 mb-6">
            Select a template to generate educational content using AI.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="border rounded-lg p-4 hover:border-primary hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-center mb-2">
                  {template.icon}
                  <h3 className="text-lg font-medium ml-2">{template.name}</h3>
                </div>
                <p className="text-gray-600 text-sm">{template.description}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={handleBackToTemplates}
            className="text-primary hover:text-primary-dark mb-4 flex items-center text-sm"
          >
            ← Back to templates
          </button>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium flex items-center">
              {selectedTemplate.icon}
              <span className="ml-2">{selectedTemplate.name}</span>
            </h3>
            <p className="text-gray-600 mt-1">{selectedTemplate.description}</p>
          </div>
          
          {generationStatus !== 'success' ? (
            <>
              <div className="space-y-4 mb-6">
                {selectedTemplate.params.map(param => (
                  <div key={param.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {param.label} {param.required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {param.type === 'text' && (
                      <input
                        type="text"
                        value={formValues[param.name] || ''}
                        onChange={(e) => handleInputChange(param.name, e.target.value)}
                        className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
                        placeholder={`Enter ${param.label.toLowerCase()}`}
                      />
                    )}
                    
                    {param.type === 'number' && (
                      <input
                        type="number"
                        value={formValues[param.name] || ''}
                        onChange={(e) => handleInputChange(param.name, parseInt(e.target.value))}
                        className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
                        placeholder={`Enter ${param.label.toLowerCase()}`}
                        min={1}
                      />
                    )}
                    
                    {param.type === 'select' && (
                      <select
                        value={formValues[param.name] || ''}
                        onChange={(e) => handleInputChange(param.name, e.target.value)}
                        className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select {param.label.toLowerCase()}</option>
                        {param.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                    
                    {param.type === 'multiselect' && (
                      <div className="space-y-2">
                        {param.options?.map(option => (
                          <div key={option} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`${param.name}-${option}`}
                              checked={formValues[param.name]?.includes(option) || false}
                              onChange={(e) => {
                                const currentValues = formValues[param.name] || [];
                                if (e.target.checked) {
                                  handleInputChange(param.name, [...currentValues, option]);
                                } else {
                                  handleInputChange(
                                    param.name,
                                    currentValues.filter((val: string) => val !== option)
                                  );
                                }
                              }}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor={`${param.name}-${option}`} className="ml-2 text-sm text-gray-700">
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
                  <FiX className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              )}
              
              <button
                onClick={handleGenerateContent}
                disabled={generationStatus === 'generating'}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  generationStatus === 'generating'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-dark'
                }`}
              >
                {generationStatus === 'generating' ? (
                  <>
                    <FiEdit2 className="animate-spin h-5 w-5 mr-2" />
                    Generating Content...
                  </>
                ) : (
                  'Generate Content'
                )}
              </button>
            </>
          ) : (
            <div className="mt-4">
              <div className="p-4 bg-green-50 rounded-md flex items-start mb-6">
                <FiCheckCircle className="h-5 w-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Content generated successfully!</p>
                  <p className="text-sm text-green-600 mt-1">
                    Your {selectedTemplate.name.toLowerCase()} has been created. You can download it or edit if needed.
                  </p>
                </div>
              </div>
              
              <div className="border rounded-md p-4 mb-6 max-h-96 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(generatedContent, null, 2)}</pre>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleDownloadContent}
                  className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                >
                  <FiDownload className="h-5 w-5 mr-2" />
                  Download
                </button>
                
                <button
                  onClick={() => setGenerationStatus('idle')}
                  className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiEdit2 className="h-5 w-5 mr-2" />
                  Edit Parameters
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AIContentGenerator; 