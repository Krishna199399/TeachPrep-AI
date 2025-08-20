import React, { useState } from 'react';
import { FiCpu } from 'react-icons/fi';
import Layout from '@/components/Layout';
import AIContentGenerator from '@/components/AIContentGenerator';
import ContentSummarizer from '@/components/ContentSummarizer';
import MultilingualTranslator from '@/components/MultilingualTranslator';
import InteractiveLessonBuilder from '@/components/InteractiveLessonBuilder';
import ResourceRecommender from '@/components/ResourceRecommender';
import ProtectedRoute from '@/components/ProtectedRoute';

// Tab interface for navigation
type TabType = 'content-generator' | 'summarizer' | 'translator' | 'interactive' | 'resources';

const AIToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('content-generator');
  
  // Tool descriptions for info section
  const toolDescriptions: Record<TabType, { title: string; description: string }> = {
    'content-generator': {
      title: 'AI Content Generator',
      description: 'Create educational content like worksheets, quizzes, and lesson plans with AI assistance.'
    },
    'summarizer': {
      title: 'Content Summarizer',
      description: 'Automatically summarize lengthy educational materials to save time and improve comprehension.'
    },
    'translator': {
      title: 'Multilingual Translator',
      description: 'Translate your educational content into multiple languages to support diverse student populations.'
    },
    'interactive': {
      title: 'Interactive Lesson Builder',
      description: 'Generate interactive elements for your lessons to increase student engagement and comprehension.'
    },
    'resources': {
      title: 'Resource Recommender',
      description: 'Get personalized recommendations for educational resources based on your teaching needs.'
    }
  };
  
  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <FiCpu className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">AI Teaching Tools</h1>
          </div>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl">
            Enhance your teaching with our suite of AI-powered tools designed to save time and improve educational outcomes.
          </p>
          
          {/* Tool Navigation Tabs */}
          <div className="mb-8 border-b border-gray-200">
            <nav className="flex overflow-x-auto pb-1">
              {(Object.keys(toolDescriptions) as TabType[]).map((tabKey) => (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`whitespace-nowrap px-5 py-3 font-medium text-sm ${
                    activeTab === tabKey
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {toolDescriptions[tabKey].title}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Description of active tool */}
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {toolDescriptions[activeTab].title}
            </h2>
            <p className="text-gray-600">
              {toolDescriptions[activeTab].description}
            </p>
          </div>
          
          {/* Active Tool Component */}
          <div className="mb-10">
            {activeTab === 'content-generator' && <AIContentGenerator />}
            {activeTab === 'summarizer' && <ContentSummarizer />}
            {activeTab === 'translator' && <MultilingualTranslator />}
            {activeTab === 'interactive' && <InteractiveLessonBuilder />}
            {activeTab === 'resources' && <ResourceRecommender />}
          </div>
          
          {/* Footer Section */}
          <div className="border-t border-gray-200 pt-8 mt-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Transform Your Teaching with AI
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-2">Save Time</h3>
                <p className="text-gray-600">
                  Automate routine tasks and content creation to focus on what matters most: your students.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-2">Personalize Learning</h3>
                <p className="text-gray-600">
                  Create customized materials and activities that meet the diverse needs of your classroom.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-2">Enhance Engagement</h3>
                <p className="text-gray-600">
                  Generate interactive elements and multilingual content to reach all students more effectively.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AIToolsPage; 