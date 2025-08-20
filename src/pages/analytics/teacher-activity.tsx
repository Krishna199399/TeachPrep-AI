import { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { FiCalendar, FiUsers, FiBookOpen, FiFileText, FiClock } from 'react-icons/fi';
import { useAppContext } from '@/context/AppContext';

interface TeacherActivity {
  id: number;
  name: string;
  department: string;
  avatar?: string;
  lastActive: string; // ISO date string
  activitiesCount: number;
  resourcesCreated: number;
  lessonsPlanned: number;
  assessmentsCreated: number;
  hoursActive: number;
}

export default function TeacherActivityPage() {
  const { isSidebarOpen, setSidebarOpen } = useAppContext();
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [timeRange, setTimeRange] = useState('today');
  
  // Mock departments data
  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'science', name: 'Science' },
    { id: 'math', name: 'Mathematics' },
    { id: 'english', name: 'English' },
    { id: 'history', name: 'History' },
    { id: 'arts', name: 'Arts' }
  ];
  
  // Mock time ranges
  const timeRanges = [
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'quarter', name: 'This Quarter' },
    { id: 'year', name: 'This Year' }
  ];
  
  // Mock teacher activity data
  const teacherActivities: TeacherActivity[] = [
    {
      id: 1,
      name: 'John Smith',
      department: 'science',
      avatar: '/avatars/john.jpg',
      lastActive: new Date().toISOString(),
      activitiesCount: 23,
      resourcesCreated: 4,
      lessonsPlanned: 8,
      assessmentsCreated: 2,
      hoursActive: 5.2
    },
    {
      id: 2,
      name: 'Emily Chen',
      department: 'math',
      avatar: '/avatars/emily.jpg',
      lastActive: new Date().toISOString(),
      activitiesCount: 18,
      resourcesCreated: 2,
      lessonsPlanned: 5,
      assessmentsCreated: 3,
      hoursActive: 4.7
    },
    {
      id: 3,
      name: 'Michael Johnson',
      department: 'english',
      avatar: '/avatars/michael.jpg',
      lastActive: new Date().toISOString(),
      activitiesCount: 15,
      resourcesCreated: 1,
      lessonsPlanned: 4,
      assessmentsCreated: 1,
      hoursActive: 3.5
    },
    {
      id: 4,
      name: 'Sarah Williams',
      department: 'history',
      avatar: '/avatars/sarah.jpg',
      lastActive: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      activitiesCount: 12,
      resourcesCreated: 3,
      lessonsPlanned: 2,
      assessmentsCreated: 0,
      hoursActive: 2.8
    },
    {
      id: 5,
      name: 'David Lee',
      department: 'science',
      avatar: '/avatars/david.jpg',
      lastActive: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      activitiesCount: 20,
      resourcesCreated: 5,
      lessonsPlanned: 6,
      assessmentsCreated: 4,
      hoursActive: 4.5
    },
    {
      id: 6,
      name: 'Lisa Thompson',
      department: 'arts',
      avatar: '/avatars/lisa.jpg',
      lastActive: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
      activitiesCount: 8,
      resourcesCreated: 2,
      lessonsPlanned: 1,
      assessmentsCreated: 0,
      hoursActive: 1.8
    }
  ];
  
  // Filter teachers by department
  const filteredTeachers = teacherActivities.filter(teacher => 
    selectedDepartment === 'all' || teacher.department === selectedDepartment
  );
  
  // Calculate summary metrics
  const activeTeachersCount = filteredTeachers.length;
  const totalActivities = filteredTeachers.reduce((sum, teacher) => sum + teacher.activitiesCount, 0);
  const totalHours = filteredTeachers.reduce((sum, teacher) => sum + teacher.hoursActive, 0);
  const avgActivitiesPerTeacher = activeTeachersCount > 0 ? Math.round(totalActivities / activeTeachersCount) : 0;
  
  // Format time string
  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }
    
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Teacher Activity | TeachPrep AI</title>
        <meta name="description" content="Monitor teacher activity and engagement" />
      </Head>

      <Header setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <Sidebar open={isSidebarOpen} setOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900">Teacher Activity</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Monitor teacher engagement and activity across departments
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="rounded-md bg-indigo-100 p-3 mr-4">
                    <FiUsers className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Teachers</p>
                    <p className="text-xl font-semibold text-gray-900">{activeTeachersCount}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="rounded-md bg-green-100 p-3 mr-4">
                    <FiClock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Hours</p>
                    <p className="text-xl font-semibold text-gray-900">{totalHours.toFixed(1)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="rounded-md bg-blue-100 p-3 mr-4">
                    <FiFileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Activities</p>
                    <p className="text-xl font-semibold text-gray-900">{totalActivities}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="rounded-md bg-purple-100 p-3 mr-4">
                    <FiBookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avg. Activities</p>
                    <p className="text-xl font-semibold text-gray-900">{avgActivitiesPerTeacher}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6">
              <div className="sm:flex sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <h2 className="text-lg font-medium text-gray-900">Activity Overview</h2>
                  <p className="text-sm text-gray-500">
                    Showing teacher activity for {timeRanges.find(r => r.id === timeRange)?.name.toLowerCase() || 'today'}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div>
                    <label htmlFor="department-filter" className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <select
                      id="department-filter"
                      name="department-filter"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="time-range" className="block text-sm font-medium text-gray-700">
                      Time Range
                    </label>
                    <select
                      id="time-range"
                      name="time-range"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                    >
                      {timeRanges.map((range) => (
                        <option key={range.id} value={range.id}>{range.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activities
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lessons
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resources
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                {teacher.avatar ? (
                                  <img src={teacher.avatar} alt={teacher.name} className="h-10 w-10 rounded-full" />
                                ) : (
                                  <span>{teacher.name.charAt(0)}</span>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {departments.find(d => d.id === teacher.department)?.name || teacher.department}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatLastActive(teacher.lastActive)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {teacher.activitiesCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {teacher.lessonsPlanned}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {teacher.resourcesCreated}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {teacher.hoursActive.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredTeachers.length === 0 && (
                <div className="px-6 py-10 text-center">
                  <p className="text-gray-500">No teacher activity data found for the selected filters.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 