import React, { useState } from 'react';
import { FiFile, FiCheckCircle, FiX, FiDownload, FiEdit2 } from 'react-icons/fi';

interface GradedSubmission {
  id: number;
  studentName: string;
  score: number;
  totalPoints: number;
  submittedDate: string;
  gradedDate: string;
  status: 'graded' | 'needs-review' | 'pending';
  feedback?: string;
}

interface AutomatedGradingToolProps {
  assessmentId?: number;
  assessmentTitle?: string;
}

const AutomatedGradingTool: React.FC<AutomatedGradingToolProps> = ({ 
  assessmentId = 0, 
  assessmentTitle = 'Untitled Assessment' 
}) => {
  const [gradingInProgress, setGradingInProgress] = useState(false);
  const [gradingComplete, setGradingComplete] = useState(false);
  const [submissions, setSubmissions] = useState<GradedSubmission[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration purposes
  const mockSubmissions: GradedSubmission[] = [
    {
      id: 1,
      studentName: 'Emma Johnson',
      score: 92,
      totalPoints: 100,
      submittedDate: '2023-10-15T14:30:22',
      gradedDate: '2023-10-15T14:35:46',
      status: 'graded'
    },
    {
      id: 2,
      studentName: 'Alex Chen',
      score: 88,
      totalPoints: 100,
      submittedDate: '2023-10-15T13:45:10',
      gradedDate: '2023-10-15T14:35:46',
      status: 'graded'
    },
    {
      id: 3,
      studentName: 'Sophia Martinez',
      score: 78,
      totalPoints: 100,
      submittedDate: '2023-10-15T15:20:33',
      gradedDate: '2023-10-15T14:35:46',
      status: 'needs-review',
      feedback: 'AI uncertain about grading of free response questions'
    },
    {
      id: 4,
      studentName: 'James Wilson',
      score: 95,
      totalPoints: 100,
      submittedDate: '2023-10-15T14:10:05',
      gradedDate: '2023-10-15T14:35:46',
      status: 'graded'
    },
    {
      id: 5,
      studentName: 'Olivia Brown',
      score: 85,
      totalPoints: 100,
      submittedDate: '2023-10-15T16:05:18',
      gradedDate: '2023-10-15T14:35:46',
      status: 'graded'
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError(null);
  };

  const handleGradeSubmissions = () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setGradingInProgress(true);
    setError(null);

    // Simulate API call with a delay
    setTimeout(() => {
      setGradingInProgress(false);
      setGradingComplete(true);
      setSubmissions(mockSubmissions);
    }, 2500);
  };

  const handleExportGrades = () => {
    // In a real implementation, this would generate a CSV or Excel file
    alert("Grades exported successfully!");
  };

  // Calculate summary statistics
  const averageScore = submissions.length
    ? submissions.reduce((sum, sub) => sum + sub.score, 0) / submissions.length
    : 0;
  
  const needsReviewCount = submissions.filter(sub => sub.status === 'needs-review').length;
  
  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Automated Grading Tool</h2>
      <p className="text-gray-600 mb-6">
        Upload student submissions to automatically grade them using AI. Review and adjust grades as needed.
      </p>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-1">Assessment: {assessmentTitle}</p>
        
        {!gradingComplete && (
          <div className="mt-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-7">
                  <FiFile className="w-8 h-8 text-gray-400" />
                  <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                    Upload submissions
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedFile ? selectedFile.name : 'Supports CSV or ZIP formats'}
                  </p>
                </div>
                <input 
                  type="file" 
                  className="opacity-0" 
                  accept=".csv,.zip"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {error && (
              <div className="mt-2 text-sm text-red-600">
                <FiX className="inline-block mr-1" /> {error}
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={handleGradeSubmissions}
                disabled={gradingInProgress || !selectedFile}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  gradingInProgress || !selectedFile 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary-dark'
                }`}
              >
                {gradingInProgress ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Grading Submissions...
                  </>
                ) : (
                  'Grade Submissions'
                )}
              </button>
            </div>
          </div>
        )}

        {gradingComplete && (
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Submissions Graded</p>
                <p className="text-2xl font-bold text-blue-600">{submissions.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-green-600">{averageScore.toFixed(1)}%</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Needs Review</p>
                <p className="text-2xl font-bold text-yellow-600">{needsReviewCount}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution</h3>
              <div className="h-24 flex items-end space-x-2">
                <div className="h-full flex flex-col justify-end">
                  <div className="w-12 bg-green-500" style={{height: '60%'}}></div>
                  <p className="text-xs text-center mt-1">90-100%</p>
                </div>
                <div className="h-full flex flex-col justify-end">
                  <div className="w-12 bg-blue-500" style={{height: '25%'}}></div>
                  <p className="text-xs text-center mt-1">80-89%</p>
                </div>
                <div className="h-full flex flex-col justify-end">
                  <div className="w-12 bg-yellow-500" style={{height: '10%'}}></div>
                  <p className="text-xs text-center mt-1">70-79%</p>
                </div>
                <div className="h-full flex flex-col justify-end">
                  <div className="w-12 bg-red-500" style={{height: '5%'}}></div>
                  <p className="text-xs text-center mt-1">Below 70%</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className={submission.status === 'needs-review' ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{submission.studentName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold ${getScoreColor(submission.score, submission.totalPoints)}`}>
                          {submission.score} / {submission.totalPoints}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          submission.status === 'graded' 
                            ? 'bg-green-100 text-green-800' 
                            : submission.status === 'needs-review'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {submission.status === 'graded' 
                            ? 'Graded' 
                            : submission.status === 'needs-review'
                              ? 'Needs Review'
                              : 'Pending'
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.submittedDate).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          className="text-primary hover:text-primary-dark mr-3"
                          title="Review and edit grade"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setGradingComplete(false);
                  setSelectedFile(null);
                }}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Grade New Submissions
              </button>
              
              <button
                onClick={handleExportGrades}
                className="flex items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
              >
                <FiDownload className="mr-2" />
                Export Grades
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomatedGradingTool; 