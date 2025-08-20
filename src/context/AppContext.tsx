import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NotificationType } from '@/components/Notification';
import { useAuth } from '@/context/AuthContext';

// Define types for our data models
export interface Lesson {
  id: number;
  title: string;
  subject: string;
  grade: string;
  date: string;
}

export interface Resource {
  id: number;
  title: string;
  type: string;
  subject: string;
}

export interface Assessment {
  id: number;
  title: string;
  type: string;
  subject: string;
  grade: string;
  status: string;
  dueDate: string;
  description?: string;
  questions?: number;
  estimatedTime?: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: string;
  objectives: string[];
  materials: string[];
  activities: {
    title: string;
    duration: string;
    description: string;
  }[];
  assessment: string;
}

export interface Team {
  id: number;
  name: string;
  members: number;
  recentActivity: string;
  lastActive: string;
}

export interface SharedResource {
  id: number;
  title: string;
  type: string;
  sharedBy: string;
  sharedDate: string;
  collaborators: string[];
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  avatar?: string;
  subject: string;
  grade: string;
  bio: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  timestamp: Date;
}

interface NotificationSettings {
  emailNotifications: boolean;
  resourceUpdates: boolean;
  collaborationRequests: boolean;
  weeklyDigest: boolean;
}

// Define the context state
interface AppContextState {
  // Data
  lessons: Lesson[];
  resources: Resource[];
  assessments: Assessment[];
  lessonPlans: LessonPlan[];
  teams: Team[];
  sharedResources: SharedResource[];
  user: User;
  notificationSettings: NotificationSettings;
  
  // Notifications
  notifications: AppNotification[];
  activeNotification: AppNotification | null;
  showNotification: (message: string, type: NotificationType) => void;
  dismissNotification: () => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // UI State
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Resource actions
  addResource: (resource: Omit<Resource, 'id'>) => void;
  updateResource: (id: number, resource: Partial<Resource>) => void;
  deleteResource: (id: number) => void;
  
  // Assessment actions
  addAssessment: (assessment: Omit<Assessment, 'id'>) => void;
  updateAssessment: (id: number, assessment: Partial<Assessment>) => void;
  deleteAssessment: (id: number) => void;
  
  // Lesson plan actions
  addLessonPlan: (lessonPlan: Omit<LessonPlan, 'id'>) => void;
  updateLessonPlan: (id: string, lessonPlan: Partial<LessonPlan>) => void;
  deleteLessonPlan: (id: string) => void;
  
  // User profile actions
  updateUserProfile: (profile: Partial<User>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

// Sample data
const sampleLessons: Lesson[] = [
  { id: 1, title: 'Introduction to Photosynthesis', subject: 'Biology', grade: '9th', date: '2023-09-15' },
  { id: 2, title: 'World War II: Causes and Effects', subject: 'History', grade: '10th', date: '2023-09-12' },
  { id: 3, title: 'Quadratic Equations', subject: 'Mathematics', grade: '8th', date: '2023-09-10' },
];

const sampleResources: Resource[] = [
  { id: 1, title: 'Interactive Periodic Table', type: 'Interactive', subject: 'Chemistry' },
  { id: 2, title: 'Historical Maps Collection', type: 'Images', subject: 'History' },
  { id: 3, title: 'Geometry Formulas Sheet', type: 'Document', subject: 'Mathematics' },
  { id: 4, title: 'Cell Structure Diagram', type: 'Document', subject: 'Biology' },
  { id: 5, title: 'Shakespeare Analysis Guide', type: 'Document', subject: 'Literature' },
  { id: 6, title: 'Volcano Formation Video', type: 'Video', subject: 'Earth Science' },
  { id: 7, title: 'French Vocabulary Flashcards', type: 'Interactive', subject: 'Languages' },
  { id: 8, title: 'Math Problem Solver', type: 'Interactive', subject: 'Mathematics' },
  { id: 9, title: 'Ecosystem Interactive Model', type: 'Interactive', subject: 'Biology' },
  { id: 10, title: 'Civil War Timeline', type: 'Document', subject: 'History' },
  { id: 11, title: 'Sound Waves Experiment', type: 'Video', subject: 'Physics' },
  { id: 12, title: 'Narrative Writing Templates', type: 'Document', subject: 'Language Arts' },
];

const sampleAssessments: Assessment[] = [
  {
    id: 1,
    title: 'Photosynthesis Quiz',
    type: 'Quiz',
    subject: 'Biology',
    grade: '9th',
    status: 'Published',
    dueDate: '2023-10-15',
  },
  {
    id: 2,
    title: 'World War II Essay',
    type: 'Essay',
    subject: 'History',
    grade: '10th',
    status: 'Draft',
    dueDate: '2023-10-20',
  },
  {
    id: 3,
    title: 'Quadratic Equations Test',
    type: 'Test',
    subject: 'Mathematics',
    grade: '8th',
    status: 'Published',
    dueDate: '2023-10-18',
  },
  {
    id: 4,
    title: 'Literary Analysis Project',
    type: 'Project',
    subject: 'English',
    grade: '11th',
    status: 'Published',
    dueDate: '2023-11-05',
  },
  {
    id: 5,
    title: 'Solar System Quiz',
    type: 'Quiz',
    subject: 'Science',
    grade: '6th',
    status: 'Draft',
    dueDate: '2023-10-25',
  }
];

const sampleTeams: Team[] = [
  {
    id: 1,
    name: 'Science Department',
    members: 8,
    recentActivity: 'New resource added',
    lastActive: '2 hours ago'
  },
  {
    id: 2,
    name: 'Grade 10 Team',
    members: 5,
    recentActivity: 'Meeting scheduled',
    lastActive: '1 day ago'
  },
  {
    id: 3,
    name: 'Curriculum Committee',
    members: 6,
    recentActivity: 'Document updated',
    lastActive: '3 days ago'
  }
];

const sampleSharedResources: SharedResource[] = [
  {
    id: 1,
    title: 'Unit Plan - Photosynthesis',
    type: 'Lesson Plan',
    sharedBy: 'John Smith',
    sharedDate: '2023-09-28',
    collaborators: ['Emily Chen', 'Michael Johnson']
  },
  {
    id: 2,
    title: 'World War II Primary Sources',
    type: 'Resource Pack',
    sharedBy: 'Emily Chen',
    sharedDate: '2023-09-20',
    collaborators: ['John Smith', 'Sarah Williams']
  },
  {
    id: 3,
    title: 'Math Assessment - Fractions',
    type: 'Assessment',
    sharedBy: 'Sarah Williams',
    sharedDate: '2023-09-15',
    collaborators: ['John Smith', 'Michael Johnson', 'David Lee']
  }
];

const sampleLessonPlan: LessonPlan = {
  id: "sample123",
  title: '',
  subject: '',
  grade: '',
  duration: '',
  objectives: [''],
  materials: [''],
  activities: [
    {
      title: 'Introduction',
      duration: '10 minutes',
      description: '',
    },
    {
      title: 'Main Activity',
      duration: '30 minutes',
      description: '',
    },
    {
      title: 'Conclusion',
      duration: '10 minutes',
      description: '',
    },
  ],
  assessment: '',
};

const sampleUser: User = {
  _id: '1',
  fullName: 'John Smith',
  email: 'john.smith@school.edu',
  role: 'Teacher',
  avatar: '/avatar-placeholder.jpg',
  subject: 'Science',
  grade: '9th',
  bio: 'Science teacher with 5 years of experience. Passionate about making learning interactive and engaging for students.',
};

const sampleNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  resourceUpdates: true,
  collaborationRequests: true,
  weeklyDigest: false,
};

// Create the context with default values
const AppContext = createContext<AppContextState>({
  lessons: [],
  resources: [],
  assessments: [],
  lessonPlans: [],
  teams: [],
  sharedResources: [],
  user: sampleUser,
  notificationSettings: sampleNotificationSettings,
  notifications: [],
  activeNotification: null,
  showNotification: () => {},
  dismissNotification: () => {},
  markNotificationAsRead: () => {},
  clearAllNotifications: () => {},
  isSidebarOpen: false,
  setSidebarOpen: () => {},
  addResource: () => {},
  updateResource: () => {},
  deleteResource: () => {},
  addAssessment: () => {},
  updateAssessment: () => {},
  deleteAssessment: () => {},
  addLessonPlan: () => {},
  updateLessonPlan: () => {},
  deleteLessonPlan: () => {},
  updateUserProfile: () => {},
  updateNotificationSettings: () => {},
});

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get authenticated user from AuthContext
  const { user: authUser, isAuthenticated } = useAuth();
  
  // State for data
  const [lessons, setLessons] = useState<Lesson[]>(sampleLessons);
  const [resources, setResources] = useState<Resource[]>(sampleResources);
  const [assessments, setAssessments] = useState<Assessment[]>(sampleAssessments);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([sampleLessonPlan]);
  const [teams, setTeams] = useState<Team[]>(sampleTeams);
  const [sharedResources, setSharedResources] = useState<SharedResource[]>(sampleSharedResources);
  const [user, setUser] = useState<User>(sampleUser);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(sampleNotificationSettings);
  
  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);
  
  // UI state
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Update user profile from auth context
  useEffect(() => {
    if (authUser) {
      setUser(prevUser => ({
        ...prevUser,
        _id: authUser._id,
        fullName: authUser.fullName,
        email: authUser.email,
        role: authUser.role,
        avatar: authUser.avatar || prevUser.avatar || ''
      }));
    }
  }, [authUser]);
  
  // Notification actions
  const showNotification = (message: string, type: NotificationType = 'info') => {
    const newNotification: AppNotification = {
      id: Math.random().toString(36).substring(2, 11),
      type,
      message,
      isRead: false,
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setActiveNotification(newNotification);
  };
  
  const dismissNotification = () => {
    setActiveNotification(null);
  };
  
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
    
    // If the active notification is being marked as read, dismiss it
    if (activeNotification && activeNotification.id === id) {
      dismissNotification();
    }
  };
  
  const clearAllNotifications = () => {
    setNotifications([]);
    setActiveNotification(null);
  };
  
  // Resource actions
  const addResource = (resource: Omit<Resource, 'id'>) => {
    const newResource = {
      ...resource,
      id: Math.max(0, ...resources.map(r => r.id)) + 1
    };
    setResources([...resources, newResource]);
    
    // Show notification
    showNotification(`New resource "${newResource.title}" has been added!`, 'success');
  };
  
  const updateResource = (id: number, updatedResource: Partial<Resource>) => {
    setResources(resources.map(resource => 
      resource.id === id ? { ...resource, ...updatedResource } : resource
    ));
    
    // Show notification
    const resourceName = resources.find(r => r.id === id)?.title || 'Resource';
    showNotification(`${resourceName} has been updated successfully.`, 'success');
  };
  
  const deleteResource = (id: number) => {
    const resourceName = resources.find(r => r.id === id)?.title || 'Resource';
    setResources(resources.filter(resource => resource.id !== id));
    
    // Show notification
    showNotification(`${resourceName} has been deleted.`, 'warning');
  };
  
  // Assessment actions
  const addAssessment = (assessment: Omit<Assessment, 'id'>) => {
    const newAssessment = {
      ...assessment,
      id: Math.max(0, ...assessments.map(a => a.id)) + 1
    };
    setAssessments([...assessments, newAssessment]);
    
    // Show notification
    showNotification(`New assessment "${newAssessment.title}" has been created!`, 'success');
  };
  
  const updateAssessment = (id: number, updatedAssessment: Partial<Assessment>) => {
    setAssessments(assessments.map(assessment => 
      assessment.id === id ? { ...assessment, ...updatedAssessment } : assessment
    ));
    
    // Show notification
    const assessmentName = assessments.find(a => a.id === id)?.title || 'Assessment';
    showNotification(`${assessmentName} has been updated successfully.`, 'success');
  };
  
  const deleteAssessment = (id: number) => {
    const assessmentName = assessments.find(a => a.id === id)?.title || 'Assessment';
    setAssessments(assessments.filter(assessment => assessment.id !== id));
    
    // Show notification
    showNotification(`${assessmentName} has been deleted.`, 'warning');
  };
  
  // Lesson plan actions
  const addLessonPlan = (lessonPlan: Omit<LessonPlan, 'id'>) => {
    const newLessonPlan = {
      ...lessonPlan,
      id: Math.random().toString(36).substr(2, 9)
    };
    setLessonPlans([...lessonPlans, newLessonPlan]);
    
    // Show notification
    showNotification(`New lesson plan "${newLessonPlan.title}" has been created!`, 'success');
  };
  
  const updateLessonPlan = (id: string, updatedPlan: Partial<LessonPlan>) => {
    setLessonPlans(lessonPlans.map(plan => 
      plan.id === id ? { ...plan, ...updatedPlan } : plan
    ));
    
    // Show notification
    const planName = lessonPlans.find(p => p.id === id)?.title || 'Lesson plan';
    showNotification(`${planName} has been updated successfully.`, 'success');
  };
  
  const deleteLessonPlan = (id: string) => {
    const planName = lessonPlans.find(p => p.id === id)?.title || 'Lesson plan';
    setLessonPlans(lessonPlans.filter(plan => plan.id !== id));
    
    // Show notification
    showNotification(`${planName} has been deleted.`, 'warning');
  };
  
  // User profile actions
  const updateUserProfile = (profile: Partial<User>) => {
    setUser(prevUser => ({
      ...prevUser,
      ...profile,
      avatar: profile.avatar || prevUser.avatar || ''
    }));
    
    // Show notification
    showNotification('Profile updated successfully!', 'success');
  };
  
  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings({ ...notificationSettings, ...settings });
    
    // Show notification
    showNotification('Notification settings updated successfully!', 'success');
  };
  
  // Implement persistence using localStorage
  useEffect(() => {
    // Load data from localStorage on initial render
    const storedResources = localStorage.getItem('resources');
    const storedAssessments = localStorage.getItem('assessments');
    const storedLessonPlans = localStorage.getItem('lessonPlans');
    const storedUser = localStorage.getItem('user');
    const storedNotifications = localStorage.getItem('notifications');
    
    if (storedResources) setResources(JSON.parse(storedResources));
    if (storedAssessments) setAssessments(JSON.parse(storedAssessments));
    if (storedLessonPlans) setLessonPlans(JSON.parse(storedLessonPlans));
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('resources', JSON.stringify(resources));
  }, [resources]);
  
  useEffect(() => {
    localStorage.setItem('assessments', JSON.stringify(assessments));
  }, [assessments]);
  
  useEffect(() => {
    localStorage.setItem('lessonPlans', JSON.stringify(lessonPlans));
  }, [lessonPlans]);
  
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);
  
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);
  
  return (
    <AppContext.Provider value={{
      // Data
      lessons,
      resources,
      assessments,
      lessonPlans,
      teams,
      sharedResources,
      user,
      notificationSettings,
      
      // Notifications
      notifications,
      activeNotification,
      showNotification,
      dismissNotification,
      markNotificationAsRead,
      clearAllNotifications,
      
      // UI State
      isSidebarOpen,
      setSidebarOpen,
      
      // Resource actions
      addResource,
      updateResource,
      deleteResource,
      
      // Assessment actions
      addAssessment,
      updateAssessment,
      deleteAssessment,
      
      // Lesson plan actions
      addLessonPlan,
      updateLessonPlan,
      deleteLessonPlan,
      
      // User profile actions
      updateUserProfile,
      updateNotificationSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => useContext(AppContext); 