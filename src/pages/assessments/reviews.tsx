import { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { FiCheckCircle, FiX, FiFileText } from 'react-icons/fi';
import { useAppContext } from '@/context/AppContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface AssessmentReview {
  id: number;
  title: string;
  subject: string;
  grade: string;
  submittedBy: string;
  submittedDate: string; 
  status: 'pending' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
}

export default function AssessmentReviewsPage() {
  const { isSidebarOpen, setSidebarOpen } = useAppContext();
  const [filter, setFilter] = useState('all');
  
  // Mock data - in a real app this would come from an API or context
  const mockReviews: AssessmentReview[] = [
    {
      id: 1,
      title: 'Biology Final Exam',
      subject: 'Biology',
      grade: '9th',
      submittedBy: 'John Smith',
      submittedDate: '2023-05-02',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 2,
      title: 'History Mid-Term',
      subject: 'History',
      grade: '10th',
      submittedBy: 'Emily Chen',
      submittedDate: '2023-05-01',
      status: 'pending',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Math Quiz - Algebra',
      subject: 'Mathematics',
      grade: '8th',
      submittedBy: 'Michael Johnson',
      submittedDate: '2023-04-30',
      status: 'pending',
      priority: 'low'
    },
    {
      id: 4,
      title: 'Literature Essay Questions',
      subject: 'English',
      grade: '11th',
      submittedBy: 'Sarah Williams',
      submittedDate: '2023-04-29',
      status: 'pending',
      priority: 'medium'
    },
    {
      id: 5,
      title: 'Chemistry Lab Assessment',
      subject: 'Chemistry',
      grade: '10th',
      submittedBy: 'David Lee',
      submittedDate: '2023-04-28',
      status: 'pending',
      priority: 'high'
    }
  ];
  
  // Filter reviews based on selected filter
  const filteredReviews = filter === 'all' 
    ? mockReviews 
    : mockReviews.filter(review => review.priority === filter);
  
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <FiFileText className="w-4 h-4 mr-1 text-red-500" />;
      case 'medium': return <FiFileText className="w-4 h-4 mr-1" />;
      case 'low': return <FiCheckCircle className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };
  
  const handleApprove = (id: number) => {
    alert(`Assessment #${id} approved!`);
  };
  
  const handleReject = (id: number) => {
    alert(`Assessment #${id} rejected!`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <Head>
          <title>Assessment Reviews | TeachPrep AI</title>
          <meta name="description" content="Review and approve assessment content" />
        </Head>

        <Header setSidebarOpen={setSidebarOpen} />
        
        <div className="flex">
          <Sidebar open={isSidebarOpen} setOpen={setSidebarOpen} />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Assessment Reviews</h1>
              
              <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h2 className="text-lg font-medium text-gray-900">Pending Reviews: {filteredReviews.length}</h2>
                    <p className="text-sm text-gray-500">Assessments waiting for your review and approval</p>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-gray-500">Filter by:</span>
                    <select
                      className="block border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <div key={review.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{review.title}</h3>
                          <div className="mt-1 text-sm text-gray-500">
                            <span className="font-medium text-gray-700">{review.subject}</span> • {review.grade} Grade • Submitted by {review.submittedBy}
                          </div>
                        </div>
                        
                        <div className="mt-2 sm:mt-0 flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(review.priority)}`}>
                            {getPriorityIcon(review.priority)}
                            {review.priority.charAt(0).toUpperCase() + review.priority.slice(1)} Priority
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="text-sm text-gray-500">
                          Submitted on: {new Date(review.submittedDate).toLocaleDateString()}
                        </div>
                        
                        <div className="mt-3 sm:mt-0 flex space-x-3">
                          <button
                            onClick={() => handleReject(review.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                          >
                            <FiX className="mr-2 -ml-1 h-4 w-4 text-red-500" />
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(review.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-opacity-90 focus:outline-none"
                          >
                            <FiCheckCircle className="mr-2 -ml-1 h-4 w-4" />
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredReviews.length === 0 && (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <FiCheckCircle className="mx-auto h-12 w-12 text-green-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending reviews</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {filter !== 'all' 
                        ? 'Try changing your filter criteria.'
                        : 'All assessments have been reviewed. Great job!'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 