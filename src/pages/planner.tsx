import Head from 'next/head';
import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import LessonPlanner from '@/components/LessonPlanner';
import AILessonPlanner from '@/components/AILessonPlanner';

export default function PlannerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'standard' | 'ai'>('standard');

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Lesson Planner | TeachPrep AI</title>
        <meta name="description" content="Create and manage effective lesson plans with AI assistance" />
      </Head>

      <Header setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        
        <main className="flex-1">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex justify-center -mb-px" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('standard')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'standard'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition duration-150 ease-in-out max-w-xs`}
              >
                Standard Planner
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'ai'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition duration-150 ease-in-out max-w-xs`}
              >
                AI-Assisted Planner
              </button>
            </nav>
          </div>

          {/* Content */}
          {activeTab === 'standard' ? <LessonPlanner /> : <AILessonPlanner />}
        </main>
      </div>
    </div>
  );
} 