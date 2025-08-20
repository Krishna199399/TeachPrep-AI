import React, { useState } from 'react';
import { 
  FiFileText, 
  FiCalendar, 
  FiTrendingUp, 
  FiDownload, 
  FiUsers, 
  FiClock,
  FiCheckCircle,
  FiX
} from 'react-icons/fi';

interface StudentData {
  id: number;
  name: string;
  averageScore: number;
  improvement: number;
  completionRate: number;
  lastActive: string;
  skillGaps: string[];
  strengths: string[];
}

interface StudentAnalyticsProps {
  classId?: string;
  className?: string;
}

const StudentProgressAnalytics: React.FC<StudentAnalyticsProps> = ({ 
  classId = 'all',
  className = 'All Classes'
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('semester');
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  
  // Mock student data
  const studentData: StudentData[] = [
    {
      id: 1,
      name: 'Emma Johnson',
      averageScore: 92,
      improvement: 15,
      completionRate: 98,
      lastActive: '2023-10-17T14:30:00',
      skillGaps: ['Critical Analysis', 'Data Interpretation'],
      strengths: ['Conceptual Understanding', 'Problem Solving', 'Written Communication']
    },
    {
      id: 2,
      name: 'Alex Chen',
      averageScore: 87,
      improvement: 8,
      completionRate: 95,
      lastActive: '2023-10-17T10:15:00',
      skillGaps: ['Verbal Explanation', 'Time Management'],
      strengths: ['Mathematical Reasoning', 'Creative Thinking', 'Research Skills']
    },
    {
      id: 3,
      name: 'Sophia Martinez',
      averageScore: 79,
      improvement: 22,
      completionRate: 89,
      lastActive: '2023-10-16T15:45:00',
      skillGaps: ['Formulaic Understanding', 'Test Taking Strategies'],
      strengths: ['Collaborative Learning', 'Visual Learning', 'Practical Application']
    },
    {
      id: 4,
      name: 'James Wilson',
      averageScore: 95,
      improvement: 5,
      completionRate: 100,
      lastActive: '2023-10-17T11:30:00',
      skillGaps: ['Group Work'],
      strengths: ['Analytical Thinking', 'Problem Solving', 'Knowledge Retention', 'Technical Skills']
    },
    {
      id: 5,
      name: 'Olivia Brown',
      averageScore: 85,
      improvement: 12,
      completionRate: 92,
      lastActive: '2023-10-17T13:20:00',
      skillGaps: ['Abstract Concepts', 'Organization'],
      strengths: ['Memorization', 'Factual Recall', 'Creative Writing']
    }
  ];
  
  // Calculate class averages
  const classAverage = studentData.reduce((sum, student) => sum + student.averageScore, 0) / studentData.length;
  const averageImprovement = studentData.reduce((sum, student) => sum + student.improvement, 0) / studentData.length;
  const averageCompletionRate = studentData.reduce((sum, student) => sum + student.completionRate, 0) / studentData.length;
  
  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleExport = () => {
    alert('Analytics data exported successfully!');
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getImprovementColor = (improvement: number) => {
    if (improvement >= 15) return 'text-green-600';
    if (improvement >= 5) return 'text-blue-600';
    if (improvement >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Student Progress Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">
            {className} • {selectedTimeRange === 'semester' ? 'Fall Semester 2023' : selectedTimeRange === 'month' ? 'October 2023' : 'Last 7 days'}
          </p>
        </div>
        
        <div className="flex mt-4 sm:mt-0">
          <div className="relative mr-2">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              <option value="semester">Semester</option>
              <option value="month">Month</option>
              <option value="week">Week</option>
            </select>
          </div>
          
          <button
            onClick={handleExport}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <FiDownload className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-4 py-2 text-sm font-medium ${
              selectedView === 'overview'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Class Overview
          </button>
          <button
            onClick={() => setSelectedView('individual')}
            className={`px-4 py-2 text-sm font-medium ${
              selectedView === 'individual'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Individual Students
          </button>
        </div>
      </div>
      
      {selectedView === 'overview' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Average Score</p>
                  <p className="text-2xl font-bold text-blue-600">{classAverage.toFixed(1)}%</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-md">
                  <FiFileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Average Improvement</p>
                  <p className="text-2xl font-bold text-green-600">+{averageImprovement.toFixed(1)}%</p>
                </div>
                <div className="p-2 bg-green-100 rounded-md">
                  <FiTrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{averageCompletionRate.toFixed(1)}%</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-md">
                  <FiCheckCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {selectedView === 'individual' && (
        <div>
          {selectedStudent ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedStudent.name}</h3>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  Back to List
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">Average Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(selectedStudent.averageScore)}`}>
                    {selectedStudent.averageScore}%
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">Improvement</p>
                  <p className={`text-2xl font-bold ${getImprovementColor(selectedStudent.improvement)}`}>
                    +{selectedStudent.improvement}%
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{selectedStudent.completionRate}%</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Improvement
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentData.map((student) => (
                    <tr 
                      key={student.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary">{student.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getScoreColor(student.averageScore)}`}>
                          {student.averageScore}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getImprovementColor(student.improvement)}`}>
                          +{student.improvement}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.completionRate}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(student.lastActive)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentProgressAnalytics; 