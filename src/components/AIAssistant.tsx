import { useState } from 'react';
import { FiSend, FiX, FiCpu } from 'react-icons/fi';

interface AIAssistantProps {
  onClose: () => void;
}

export default function AIAssistant({ onClose }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI teaching assistant. How can I help you with your lesson planning today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;
    
    // Add user message to the chat
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    
    // Simulate AI thinking
    setIsLoading(true);
    const userPrompt = prompt;
    setPrompt('');
    
    // Simulate API call delay
    setTimeout(() => {
      let response;
      
      if (userPrompt.toLowerCase().includes('photosynthesis')) {
        response = "For a lesson on photosynthesis, I recommend starting with an engaging demonstration using colored water and plants to show water uptake. Then introduce the chemical equation and explain how light energy converts CO2 and water into glucose and oxygen. Include a hands-on lab where students measure oxygen production using water plants exposed to different light intensities.";
      } else if (userPrompt.toLowerCase().includes('history') || userPrompt.toLowerCase().includes('world war')) {
        response = "For your World War II lesson, consider a document-based approach analyzing primary sources from multiple perspectives. Start with a timeline activity, then have students examine propaganda posters, letters from soldiers, and policy documents. End with a debate on the most significant causes and long-term effects of the war.";
      } else if (userPrompt.toLowerCase().includes('math') || userPrompt.toLowerCase().includes('equation')) {
        response = "For teaching quadratic equations, I suggest beginning with real-world problems involving parabolic motion. Guide students to discover the need for quadratic formulas. Use interactive graphing software to visualize how changing coefficients affects the parabola. Include a mix of algebraic and graphical solution methods in your practice exercises.";
      } else {
        response = "Based on your request, I recommend structuring your lesson with these components: 1) An engaging hook activity related to real-world applications, 2) Clear learning objectives that align with curriculum standards, 3) Direct instruction with visual aids, 4) Guided practice with immediate feedback, 5) Collaborative learning activity, and 6) Individual assessment. Would you like me to elaborate on any of these components?";
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <FiCpu className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-lg font-medium text-gray-900">AI Lesson Planner</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>
      
      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-3/4 rounded-lg px-4 py-2 ${
                message.role === 'user' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2 max-w-3/4">
              <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about lesson planning, activities, or assessment ideas..."
            className="input-field flex-1"
          />
          <button
            onClick={handleSendMessage}
            disabled={!prompt.trim() || isLoading}
            className={`ml-2 p-2 rounded-full ${
              !prompt.trim() || isLoading
                ? 'bg-gray-200 text-gray-400'
                : 'bg-primary text-white hover:bg-opacity-90'
            } focus:outline-none`}
          >
            <FiSend className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Pro tip: Try asking for specific subjects, grade levels, or learning objectives
        </p>
      </div>
    </div>
  );
} 