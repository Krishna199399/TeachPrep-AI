import React, { useState, useEffect } from 'react';
import { FiBookOpen, FiFileText, FiUsers, FiSettings, FiBarChart2, FiCpu } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useAppContext } from '@/context/AppContext';
import SpeechRecognition from './SpeechRecognition';
import VectorSearch from './VectorSearch';
import { aiOrchestrator, query } from '@/utils/ai/aiOrchestrator';
import { AnyTask } from '@/types/schemas/taskSchema';

const AIDashboard: React.FC = () => {
  const { user } = useAuth();
  const { setActivePage } = useAppContext();
  const router = useRouter();

  const [isAILoading, setIsAILoading] = useState(false);
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  const [userMessage, setUserMessage] = useState('');
  const [recommendedTasks, setRecommendedTasks] = useState<AnyTask[]>([]);
  const [conversationHistory, setConversationHistory] = useState<{role: string; content: string}[]>([
    { role: 'assistant', content: 'Welcome to TeachPrep AI! How can I help you today?' }
  ]);

  // Get AI task recommendations on component mount
  useEffect(() => {
    if (user) {
      getRecommendations();
    }
  }, [user]);

  // Get personalized task recommendations from AI
  const getRecommendations = async () => {
    try {
      if (!user) return;

      setIsAILoading(true);
      
      // Create user profile from available data
      const userProfile = {
        role: user.role,
        subjects: ['Mathematics', 'Science'], // These would come from user preferences
        grades: ['6-8', '9-12'], // These would come from user preferences
        recentActivity: ['Created lesson plan', 'Viewed assessment materials']
      };

      // Get task recommendations
      const tasks = await aiOrchestrator.recommendTasks(userProfile, 3);
      setRecommendedTasks(tasks);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setIsAILoading(false);
    }
  };

  // Handle sending a message to the AI
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    try {
      // Add user message to conversation
      setConversationHistory(prev => [...prev, { role: 'user', content: userMessage }]);
      
      // Clear input and show loading
      const message = userMessage;
      setUserMessage('');
      setIsAILoading(true);

      // Process message with AI orchestrator
      const response = await query(message);
      
      // Add AI response to conversation
      setConversationHistory(prev => [...prev, { role: 'assistant', content: response.answer }]);
      
      // Process any action intents from the AI response
      processActionIntents(message, response.answer);
    } catch (error) {
      console.error('Error sending message:', error);
      setConversationHistory(prev => [
        ...prev, 
        { role: 'assistant', content: 'I apologize, but I encountered an error processing your request.' }
      ]);
    } finally {
      setIsAILoading(false);
    }
  };

  // Process any action intents from AI responses
  const processActionIntents = (userMessage: string, aiResponse: string) => {
    const lowercaseMessage = userMessage.toLowerCase();
    
    // Check for navigation intents
    if (lowercaseMessage.includes('create lesson') || lowercaseMessage.includes('new lesson')) {
      router.push('/lesson-plans');
    } else if (lowercaseMessage.includes('create assessment') || lowercaseMessage.includes('new assessment')) {
      router.push('/assessments');
    } else if (lowercaseMessage.includes('view resources') || lowercaseMessage.includes('show resources')) {
      router.push('/resources');
    }
  };

  // Handle speech recognition input
  const handleSpeechInput = (text: string) => {
    setUserMessage(text);
  };

  // Handle keypress (Enter to send message)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle task selection
  const handleTaskSelect = (task: AnyTask) => {
    // Navigate based on task type
    switch (task.taskType) {
      case 'lesson_plan':
        router.push('/lesson-plans');
        break;
      case 'assessment':
        router.push('/assessments');
        break;
      case 'resource':
        router.push('/resources');
        break;
      case 'approval':
        router.push('/approval-queue');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full gap-4">
      {/* Left panel - Main AI interface */}
      <div className="w-full md:w-2/3 flex flex-col bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-4">
          <FiCpu className="text-primary text-xl mr-2" />
          <h2 className="text-xl font-semibold">TeachPrep AI Assistant</h2>
        </div>
        
        {/* Chat conversation area */}
        <div className="flex-grow overflow-y-auto mb-4 p-4 border rounded-lg bg-gray-50 min-h-[300px] max-h-[600px]">
          {conversationHistory.map((message, index) => (
            <div 
              key={index}
              className={`mb-4 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div 
                className={`inline-block p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isAILoading && (
            <div className="text-left mb-4">
              <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800">
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input area with voice support */}
        <div className="flex flex-col">
          <div className="flex gap-2 mb-2">
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about teaching, lesson planning, or classroom management..."
              className="flex-grow p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary"
              rows={3}
            />
          </div>
          
          <div className="flex justify-between">
            <SpeechRecognition 
              onTextCapture={handleSpeechInput}
              placeholder="Speak to send a message..."
              className="w-full max-w-sm"
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!userMessage.trim() || isAILoading}
              className={`px-4 py-2 rounded-lg ${
                !userMessage.trim() || isAILoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
      
      {/* Right panel - Task recommendations and search */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        {/* AI Task Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-4">
            <FiBarChart2 className="text-primary text-xl mr-2" />
            <h2 className="text-xl font-semibold">AI Recommended Tasks</h2>
          </div>
          
          {recommendedTasks.length > 0 ? (
            <div className="space-y-3">
              {recommendedTasks.map((task, index) => (
                <div 
                  key={index}
                  onClick={() => handleTaskSelect(task)}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  <div className="flex items-center mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {task.taskType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              {isAILoading ? 
                "Generating recommendations..." : 
                "No task recommendations yet. Try asking the AI for suggestions."}
            </div>
          )}
        </div>
        
        {/* Vector Search Component */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-4">
            <FiFileText className="text-primary text-xl mr-2" />
            <h2 className="text-xl font-semibold">Search Resources</h2>
          </div>
          <VectorSearch 
            placeholder="Search for teaching resources..."
            showFilters={true}
          />
        </div>
      </div>
    </div>
  );
};

export default AIDashboard; 