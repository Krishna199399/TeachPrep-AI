import { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StudentProgressAnalytics from '@/components/StudentProgressAnalytics';
import { useAppContext } from '@/context/AppContext';

export default function StudentProgress() {
  const { isSidebarOpen, setSidebarOpen } = useAppContext();
  const [selectedClass, setSelectedClass] = useState('all');

  // Mock class data
  const classes = [
    { id: 'all', name: 'All Classes' },
    { id: 'biology-9', name: 'Biology - 9th Grade' },
    { id: 'history-10', name: 'History - 10th Grade' },
    { id: 'math-8', name: 'Math - 8th Grade' },
    { id: 'physics-11', name: 'Physics - 11th Grade' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Student Progress Analytics | TeachPrep AI</title>
        <meta name="description" content="Track and analyze student performance and progress" />
      </Head>

      <Header setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <Sidebar open={isSidebarOpen} setOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Student Progress Analytics</h1>
              <div className="w-full md:w-64">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <StudentProgressAnalytics 
              classId={selectedClass} 
              className={classes.find(c => c.id === selectedClass)?.name || 'All Classes'} 
            />
          </div>
        </main>
      </div>
    </div>
  );
} 