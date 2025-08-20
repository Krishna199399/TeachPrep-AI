import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { FiCheckCircle, FiClock, FiFileText, FiCalendar, FiPlus, FiX } from 'react-icons/fi';
import { useAppContext } from '@/context/AppContext';

interface Task {
  id: number;
  title: string;
  type: 'submission' | 'grading' | 'preparation';
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  subject?: string;
  description?: string;
}

export default function TasksPage() {
  const { isSidebarOpen, setSidebarOpen } = useAppContext();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '',
    type: 'submission',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    priority: 'medium',
    subject: '',
    description: ''
  });
  
  // Load tasks from localStorage on initial page load
  useEffect(() => {
    const storedTasks = localStorage.getItem('teachprep_tasks');
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (error) {
        console.error('Failed to parse stored tasks', error);
        // If parse fails, initialize with default tasks
        initializeDefaultTasks();
      }
    } else {
      // No stored tasks, initialize with defaults
      initializeDefaultTasks();
    }
  }, []);
  
  // Initialize with default tasks
  const initializeDefaultTasks = () => {
    const defaultTasks: Task[] = [
      {
        id: 1,
        title: 'Grade Biology Quizzes',
        type: 'grading',
        dueDate: '2023-05-15',
        status: 'pending',
        priority: 'high',
        subject: 'Biology',
        description: 'Grade the quizzes from Period 3 Biology class'
      },
      {
        id: 2,
        title: 'Submit Lesson Plan for Chemistry',
        type: 'submission',
        dueDate: '2023-05-20',
        status: 'in_progress',
        priority: 'medium',
        subject: 'Chemistry',
        description: 'Complete and submit the lesson plan for next week\'s Chemistry class'
      },
      {
        id: 3,
        title: 'Prepare Physics Lab Materials',
        type: 'preparation',
        dueDate: '2023-05-10',
        status: 'pending',
        priority: 'high',
        subject: 'Physics',
        description: 'Gather and prepare materials for the upcoming Physics lab on forces'
      }
    ];
    
    setTasks(defaultTasks);
    localStorage.setItem('teachprep_tasks', JSON.stringify(defaultTasks));
  };
  
  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('teachprep_tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesType = filterType === 'all' || task.type === filterType;
    return matchesStatus && matchesType;
  });
  
  // Count pending submissions
  const pendingSubmissionsCount = tasks.filter(task => 
    task.type === 'submission' && task.status === 'pending'
  ).length;
  
  // Get status badge style
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get task type badge and icon
  const getTaskTypeInfo = (type: string) => {
    switch (type) {
      case 'submission':
        return {
          badge: 'bg-purple-100 text-purple-800',
          icon: <FiFileText className="h-4 w-4 mr-1" />
        };
      case 'grading':
        return {
          badge: 'bg-blue-100 text-blue-800',
          icon: <FiCheckCircle className="h-4 w-4 mr-1" />
        };
      case 'preparation':
        return {
          badge: 'bg-green-100 text-green-800',
          icon: <FiClock className="h-4 w-4 mr-1" />
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800',
          icon: null
        };
    }
  };
  
  // Mark task as completed
  const handleCompleteTask = (id: number) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, status: 'completed' } : task
      )
    );
  };

  // Handle input change for new task form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };
  
  // Create a new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newTask.title) {
      alert('Please enter a task title');
      return;
    }
    
    if (!newTask.dueDate) {
      alert('Please select a due date');
      return;
    }
    
    // Generate a new unique ID
    const newId = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1;
    
    // Create the task object
    const taskToAdd: Task = {
      ...newTask,
      id: newId
    };
    
    // Add to tasks array
    setTasks(prevTasks => [...prevTasks, taskToAdd]);
    
    // Reset form and hide it
    setNewTask({
      title: '',
      type: 'submission',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      priority: 'medium',
      subject: '',
      description: ''
    });
    setShowNewTaskForm(false);
  };
  
  // Delete a task
  const handleDeleteTask = (id: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>My Tasks | TeachPrep AI</title>
        <meta name="description" content="Manage your tasks and assignments" />
      </Head>

      <Header setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <Sidebar open={isSidebarOpen} setOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your pending tasks and submissions
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button
                  type="button"
                  onClick={() => setShowNewTaskForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                  Create New Task
                </button>
              </div>
            </div>
            
            {showNewTaskForm && (
              <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Create New Task</h2>
                  <button 
                    onClick={() => setShowNewTaskForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateTask}>
                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={newTask.title}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        Task Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={newTask.type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      >
                        <option value="submission">Submission</option>
                        <option value="grading">Grading</option>
                        <option value="preparation">Preparation</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={newTask.priority}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        id="subject"
                        value={newTask.subject}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        id="dueDate"
                        value={newTask.dueDate}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={newTask.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>
                    
                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowNewTaskForm(false)}
                        className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-opacity-90 focus:outline-none"
                      >
                        Save Task
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="mb-4 sm:mb-0">
                  <h2 className="text-lg font-medium text-gray-900">Task Overview</h2>
                  <div className="flex items-center mt-1">
                    <span className="text-2xl font-semibold text-primary">{pendingSubmissionsCount}</span>
                    <span className="ml-2 text-sm text-gray-500">pending submissions</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div>
                    <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="filter-status"
                      name="filter-status"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      id="filter-type"
                      name="filter-type"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="submission">Submissions</option>
                      <option value="grading">Grading</option>
                      <option value="preparation">Preparation</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const typeInfo = getTaskTypeInfo(task.type);
                return (
                  <div key={task.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row justify-between">
                        <div className="mb-4 sm:mb-0">
                          <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                          {task.subject && (
                            <div className="mt-1 text-sm text-gray-500">
                              Subject: <span className="font-medium text-gray-700">{task.subject}</span>
                            </div>
                          )}
                          <div className="mt-2 text-sm text-gray-500">
                            {task.description}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-start sm:items-end">
                          <div className="flex items-center mb-2">
                            <FiCalendar className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                              {task.status === 'pending' ? 'Pending' : 
                               task.status === 'in_progress' ? 'In Progress' : 'Completed'}
                            </span>
                            
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.badge}`}>
                              {typeInfo.icon}
                              {task.type === 'submission' ? 'Submission' : 
                               task.type === 'grading' ? 'Grading' : 'Preparation'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 border-t border-gray-200 pt-4 flex justify-between">
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <FiX className="mr-2 -ml-1 h-4 w-4" />
                          Delete
                        </button>
                        
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={task.status === 'completed'}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                            task.status === 'completed'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'text-white bg-primary hover:bg-opacity-90 focus:outline-none'
                          }`}
                        >
                          <FiCheckCircle className="mr-2 -ml-1 h-4 w-4" />
                          {task.status === 'completed' ? 'Completed' : 'Mark as Completed'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredTasks.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <FiCheckCircle className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {filterStatus !== 'all' || filterType !== 'all'
                      ? 'Try changing your filter criteria.'
                      : 'You have no tasks currently. Create a new task to get started.'}
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