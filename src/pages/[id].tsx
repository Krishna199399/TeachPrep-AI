import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAppContext } from '@/context/AppContext';
import { FiClock, FiCalendar, FiBook, FiUsers, FiEdit2, FiDownload, FiShare2 } from 'react-icons/fi';

export default function LessonPlanDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { isSidebarOpen, setSidebarOpen, lessonPlans } = useAppContext();
  const [lessonPlan, setLessonPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && lessonPlans.length > 0) {
      const plan = lessonPlans.find(plan => plan.id.toString() === id.toString());
      if (plan) {
        setLessonPlan(plan);
      } else {
        // Lesson plan not found
        console.error(`Lesson plan with ID ${id} not found`);
      }
      setLoading(false);
    }
  }, [id, lessonPlans]);

  const handleEdit = () => {
    router.push(`/planner?edit=${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{lessonPlan ? `${lessonPlan.title} | TeachPrep AI` : 'Lesson Plan | TeachPrep AI'}</title>
        <meta name="description" content="View your lesson plan details" />
      </Head>

      <Header setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <Sidebar open={isSidebarOpen} setOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 w-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : lessonPlan ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <button 
                    onClick={() => router.back()}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    ← Back
                  </button>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleEdit}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none"
                    >
                      <FiEdit2 className="mr-2 -ml-1 h-5 w-5" />
                      Edit Plan
                    </button>
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <FiDownload className="mr-2 -ml-1 h-5 w-5" />
                      Export
                    </button>
                  </div>
                </div>
                
                {/* Lesson Plan Title */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                  <div className="px-4 py-5 sm:px-6 bg-primary bg-opacity-10">
                    <h1 className="text-2xl font-bold text-gray-900">{lessonPlan.title}</h1>
                    <div className="mt-1 flex flex-wrap items-center text-sm text-gray-600">
                      <span className="mr-4 flex items-center">
                        <FiBook className="mr-1.5 h-4 w-4 text-gray-400" />
                        {lessonPlan.subject} • Grade {lessonPlan.grade}
                      </span>
                      <span className="mr-4 flex items-center">
                        <FiClock className="mr-1.5 h-4 w-4 text-gray-400" />
                        {lessonPlan.duration || '45 minutes'}
                      </span>
                      <span className="flex items-center">
                        <FiCalendar className="mr-1.5 h-4 w-4 text-gray-400" />
                        Last updated: {new Date(lessonPlan.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Objectives Section */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:px-6">
                        <h2 className="text-lg font-medium text-gray-900">Learning Objectives</h2>
                      </div>
                      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                        <ul className="divide-y divide-gray-200">
                          {lessonPlan.objectives?.map((objective: string, index: number) => (
                            <li key={index} className="px-4 py-3 sm:px-6">
                              {objective}
                            </li>
                          )) || (
                            <li className="px-4 py-3 sm:px-6">No objectives specified</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Materials Section */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:px-6">
                        <h2 className="text-lg font-medium text-gray-900">Materials Needed</h2>
                      </div>
                      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                        <ul className="divide-y divide-gray-200">
                          {lessonPlan.materials?.map((material: string, index: number) => (
                            <li key={index} className="px-4 py-3 sm:px-6">
                              {material}
                            </li>
                          )) || (
                            <li className="px-4 py-3 sm:px-6">No materials specified</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Activities Section */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:px-6">
                        <h2 className="text-lg font-medium text-gray-900">Lesson Activities</h2>
                      </div>
                      <div className="border-t border-gray-200">
                        <div className="px-4 py-5 sm:p-6 space-y-6">
                          {lessonPlan.activities?.map((activity: any, index: number) => (
                            <div key={index} className="border-l-4 border-primary pl-4 py-2">
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium text-gray-900">{activity.title}</h3>
                                <span className="text-sm text-gray-500">{activity.duration}</span>
                              </div>
                              <p className="text-gray-700">{activity.description}</p>
                            </div>
                          )) || (
                            <p className="text-gray-500">No activities specified</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Assessment Section */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:px-6">
                        <h2 className="text-lg font-medium text-gray-900">Assessment</h2>
                      </div>
                      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                        <p className="text-gray-700">{lessonPlan.assessment || 'No assessment specified'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Time Saved Card */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-medium text-green-800 flex items-center">
                        <FiClock className="mr-2 h-5 w-5" />
                        Teacher Time Saved
                      </h3>
                      <p className="text-green-700 mt-1">
                        You saved approximately <span className="font-bold">115 minutes</span> by using AI to generate this lesson plan.
                      </p>
                    </div>
                    
                    {/* Collaboration Card */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:px-6">
                        <h2 className="text-lg font-medium text-gray-900 flex items-center">
                          <FiUsers className="mr-2 h-5 w-5 text-primary" />
                          Collaboration
                        </h2>
                      </div>
                      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                        <button 
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none mb-3"
                        >
                          <FiShare2 className="mr-2 h-4 w-4" />
                          Share with Colleagues
                        </button>
                        <p className="text-sm text-gray-500 mt-2">
                          This lesson plan can be shared with your department or grade-level team for collaborative teaching.
                        </p>
                      </div>
                    </div>
                    
                    {/* Resources Card */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:px-6">
                        <h2 className="text-lg font-medium text-gray-900 flex items-center">
                          <FiBook className="mr-2 h-5 w-5 text-primary" />
                          Related Resources
                        </h2>
                      </div>
                      <div className="border-t border-gray-200">
                        <ul className="divide-y divide-gray-200">
                          <li className="px-4 py-3 hover:bg-gray-50">
                            <a href="#" className="flex items-center text-sm text-primary">
                              Khan Academy: {lessonPlan.subject} Resources
                            </a>
                          </li>
                          <li className="px-4 py-3 hover:bg-gray-50">
                            <a href="#" className="flex items-center text-sm text-primary">
                              PBS Learning Media: {lessonPlan.topic || lessonPlan.title}
                            </a>
                          </li>
                          <li className="px-4 py-3 hover:bg-gray-50">
                            <a href="#" className="flex items-center text-sm text-primary">
                              TeachersPayTeachers: Related Materials
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <div className="mx-auto h-12 w-12 text-gray-400">❓</div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Lesson plan not found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  The lesson plan you're looking for doesn't exist or has been deleted.
                </p>
                <div className="mt-6">
                  <button 
                    onClick={() => router.push('/lesson-plans')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none"
                  >
                    Back to All Lesson Plans
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 