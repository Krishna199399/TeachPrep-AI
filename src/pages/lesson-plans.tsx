import { useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiPlus, FiFilter, FiEdit2, FiCopy, FiTrash2 } from 'react-icons/fi';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/router';

// Define types for lesson plan and props
interface LessonPlanItem {
  id: string | number;
  title: string;
  subject: string;
  grade: string;
  date: string;
}

interface LessonCardProps {
  lesson: LessonPlanItem;
  onDelete: (id: string | number) => void;
  onClick?: () => void;
}

// Custom LessonCard component with delete functionality
function LessonCard({ lesson, onDelete, onClick }: LessonCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    // Stop event propagation to prevent opening the lesson when deleting
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${lesson.title}"?`)) {
      onDelete(lesson.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{lesson.title}</h3>
          <div className="mt-1 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{lesson.subject}</span> • {lesson.grade} Grade
          </div>
          <div className="mt-2 text-sm text-gray-500">Last edited: {lesson.date}</div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/planner?edit=${lesson.id}`}>
            <button 
              className="p-1.5 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100"
              onClick={(e) => e.stopPropagation()} // Prevent propagation
            >
              <FiEdit2 className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </button>
          </Link>
          <button 
            className="p-1.5 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100"
            onClick={(e) => e.stopPropagation()} // Prevent propagation
          >
            <FiCopy className="h-4 w-4" />
            <span className="sr-only">Duplicate</span>
          </button>
          <button 
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
            onClick={handleDelete}
          >
            <FiTrash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </button>
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Lesson Plan
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Resources Ready
        </span>
      </div>
    </div>
  );
}

export default function LessonPlansPage() {
  const { isSidebarOpen, setSidebarOpen, lessonPlans, deleteLessonPlan } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [refresh, setRefresh] = useState(0); // Add a refresh counter to force re-render
  const router = useRouter();

  // Get unique subjects and grades for filters
  const subjects = Array.from(new Set(lessonPlans.map(plan => plan.subject))).filter(Boolean);
  const grades = Array.from(new Set(lessonPlans.map(plan => plan.grade))).filter(Boolean);

  // Delete a lesson plan
  const handleDeleteLessonPlan = useCallback((id: string | number) => {
    try {
      // Convert number ID to string as expected by deleteLessonPlan
      deleteLessonPlan(String(id));
      
      // Force a re-render
      setRefresh(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting lesson plan:', error);
      alert('Failed to delete the lesson plan. Please try again.');
    }
  }, [deleteLessonPlan]);

  // Filter the lesson plans
  const filteredLessonPlans = lessonPlans.filter(plan => {
    const matchesSearch = searchTerm === '' || 
      plan.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === '' || plan.subject === filterSubject;
    const matchesGrade = filterGrade === '' || plan.grade === filterGrade;
    
    return matchesSearch && matchesSubject && matchesGrade;
  });

  // Convert lesson plans to the format expected by LessonCard
  const formattedLessonPlans = filteredLessonPlans.map(plan => ({
    id: plan.id, // Keep the original ID format
    title: plan.title,
    subject: plan.subject,
    grade: plan.grade,
    date: plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
  }));

  // Add a handler function to open lesson plans
  const openLessonPlan = (id: string | number) => {
    console.log(`Opening lesson plan with ID: ${id}`);
    router.push(`/lesson-plan/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>All Lesson Plans | TeachPrep AI</title>
        <meta name="description" content="View and manage your lesson plans" />
      </Head>

      <Header setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <Sidebar open={isSidebarOpen} setOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">All Lesson Plans</h1>
              
              <div className="flex space-x-2">
                <Link href="/planner">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none">
                    <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                    Create New
                  </button>
                </Link>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <label htmlFor="search" className="sr-only">Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiFilter className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="search"
                      name="search"
                      type="search"
                      placeholder="Search lesson plans..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="sm:flex-shrink-0 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                  <select
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  
                  <select
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value)}
                  >
                    <option value="">All Grades</option>
                    {grades.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {filteredLessonPlans.length > 0 ? (
              <div className="space-y-4">
                {formattedLessonPlans.map((lesson) => (
                  <div 
                    key={lesson.id} 
                    className="bg-white dark:bg-navy-700 shadow-md rounded-lg cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => openLessonPlan(lesson.id)}
                  >
                    <LessonCard 
                      lesson={lesson} 
                      onDelete={handleDeleteLessonPlan}
                      onClick={() => openLessonPlan(lesson.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No lesson plans found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || filterSubject || filterGrade 
                    ? 'Try changing your search or filter criteria.' 
                    : 'Get started by creating your first lesson plan.'}
                </p>
                <div className="mt-6">
                  <Link href="/planner">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none">
                      <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                      Create New Lesson Plan
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 