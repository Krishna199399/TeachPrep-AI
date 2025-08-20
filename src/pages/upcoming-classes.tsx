import { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { FiCalendar, FiClock, FiHome, FiUsers } from 'react-icons/fi';
import { useAppContext } from '@/context/AppContext';

interface ClassSession {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  grade: string;
  students: number;
}

export default function UpcomingClasses() {
  const { isSidebarOpen, setSidebarOpen } = useAppContext();
  
  // Mock data for upcoming classes
  const upcomingClasses: ClassSession[] = [
    {
      id: 1,
      title: 'Biology - Cellular Respiration',
      date: '2023-10-20',
      time: '09:00 AM - 10:30 AM',
      location: 'Room 105',
      grade: '9th',
      students: 28
    },
    {
      id: 2,
      title: 'History - World War II',
      date: '2023-10-20',
      time: '11:00 AM - 12:30 PM',
      location: 'Room 203',
      grade: '10th',
      students: 25
    },
    {
      id: 3,
      title: 'Mathematics - Quadratic Equations',
      date: '2023-10-21',
      time: '09:00 AM - 10:30 AM',
      location: 'Room 118',
      grade: '8th',
      students: 30
    }
  ];
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Group classes by date
  const groupClassesByDate = () => {
    const grouped: { [key: string]: ClassSession[] } = {};
    
    upcomingClasses.forEach(cls => {
      if (!grouped[cls.date]) {
        grouped[cls.date] = [];
      }
      grouped[cls.date].push(cls);
    });
    
    return grouped;
  };
  
  const groupedClasses = groupClassesByDate();
  const dates = Object.keys(groupedClasses).sort();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Upcoming Classes | TeachPrep AI</title>
        <meta name="description" content="View your upcoming classes schedule" />
      </Head>

      <Header setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <Sidebar open={isSidebarOpen} setOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Upcoming Classes</h1>
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                  <FiCalendar className="mr-2 -ml-1 h-5 w-5" />
                  Week View
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none">
                  <FiClock className="mr-2 -ml-1 h-5 w-5" />
                  Today's Classes
                </button>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {dates.length > 0 ? (
                dates.map(date => (
                  <div key={date} className="border-b border-gray-200 last:border-b-0">
                    <div className="bg-gray-50 px-6 py-3">
                      <h2 className="text-lg font-medium text-gray-900">{formatDate(date)}</h2>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {groupedClasses[date].map(cls => (
                        <li key={cls.id} className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-primary">{cls.title}</h3>
                              <div className="mt-2 sm:flex sm:items-center text-sm text-gray-500">
                                <div className="flex items-center">
                                  <FiClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                  <p>{cls.time}</p>
                                </div>
                                <div className="mt-2 sm:mt-0 sm:ml-6 flex items-center">
                                  <FiHome className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                  <p>{cls.location}</p>
                                </div>
                                <div className="mt-2 sm:mt-0 sm:ml-6 flex items-center">
                                  <FiUsers className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                  <p>{cls.students} students • {cls.grade} Grade</p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 sm:mt-0">
                              <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                                View Details
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming classes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You don't have any classes scheduled in the near future.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 