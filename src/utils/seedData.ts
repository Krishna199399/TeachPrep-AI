import { hashPassword } from '@/utils/authUtils';
import connectDb from '@/utils/db';
import User from '@/models/User';
import Setting from '@/models/Setting';
import Lesson from '@/models/Lesson';
import Resource from '@/models/Resource';
import Assessment from '@/models/Assessment';

// Initial mock settings
const mockSettings = [
  // General settings
  {
    id: 'site_name',
    label: 'Site Name',
    description: 'Name of the TeachPrep AI platform',
    type: 'text',
    value: 'TeachPrep AI',
    category: 'general',
  },
  {
    id: 'max_upload_size',
    label: 'Maximum Upload Size',
    description: 'Maximum file size for uploads (in MB)',
    type: 'number',
    value: 50,
    category: 'general',
  },
  {
    id: 'default_language',
    label: 'Default Language',
    description: 'Default language for the platform',
    type: 'select',
    value: 'en',
    category: 'general',
    options: [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
    ],
  },
  // Security settings
  {
    id: 'password_expires',
    label: 'Password Expiration',
    description: 'Number of days before passwords expire',
    type: 'number',
    value: 90,
    category: 'security',
  },
  {
    id: 'session_timeout',
    label: 'Session Timeout',
    description: 'Minutes of inactivity before session expires',
    type: 'number',
    value: 60,
    category: 'security',
  },
  {
    id: 'enable_2fa',
    label: 'Enable Two-Factor Authentication',
    description: 'Require two-factor authentication for administrative accounts',
    type: 'switch',
    value: true,
    category: 'security',
  },
  // Content settings
  {
    id: 'default_approval_required',
    label: 'Require Content Approval',
    description: 'Require approval for new content by default',
    type: 'switch',
    value: true,
    category: 'content',
  },
  {
    id: 'student_content_visibility',
    label: 'Student Content Visibility',
    description: 'Allow students to view content created by student teachers',
    type: 'switch',
    value: false,
    category: 'content',
  },
  // Notification settings
  {
    id: 'email_notifications',
    label: 'Email Notifications',
    description: 'Send email notifications for important events',
    type: 'switch',
    value: true,
    category: 'notifications',
  },
  // Advanced settings
  {
    id: 'debug_mode',
    label: 'Debug Mode',
    description: 'Enable debug mode for development',
    type: 'switch',
    value: false,
    category: 'advanced',
  },
];

// Initial user data
const users = [
  {
    fullName: 'Admin User',
    email: 'admin@teachprep.ai',
    password: 'password123',
    role: 'Administrator',
    department: 'Administration',
    status: 'active',
    lastActive: new Date()
  },
  {
    fullName: 'Science Department Head',
    email: 'science.head@teachprep.ai',
    password: 'password123',
    role: 'Department Head',
    department: 'Science',
    status: 'active',
    lastActive: new Date()
  },
  {
    fullName: 'Math Department Head',
    email: 'math.head@teachprep.ai',
    password: 'password123',
    role: 'Department Head',
    department: 'Mathematics',
    status: 'active',
    lastActive: new Date()
  },
  {
    fullName: 'English Teacher',
    email: 'english.teacher@teachprep.ai',
    password: 'password123',
    role: 'Teacher',
    department: 'English',
    status: 'active',
    lastActive: new Date()
  },
  {
    fullName: 'Science Teacher',
    email: 'science.teacher@teachprep.ai',
    password: 'password123',
    role: 'Teacher',
    department: 'Science',
    status: 'active',
    lastActive: new Date()
  },
  {
    fullName: 'Student Teacher',
    email: 'student.teacher@teachprep.ai',
    password: 'password123',
    role: 'Student Teacher',
    department: 'History',
    status: 'active',
    lastActive: new Date()
  }
];

/**
 * Seed initial data into the database
 */
export async function seedDatabase() {
  console.log('Connecting to database...');
  await connectDb();
  
  // Seed users
  console.log('Seeding users...');
  const adminUser = await seedUsers();
  
  if (!adminUser) {
    console.error('Failed to create or find admin user');
    return {
      success: false,
      message: 'Failed to create admin user'
    };
  }
  
  // Seed settings
  console.log('Seeding settings...');
  await seedSettings(adminUser._id);
  
  // Seed content
  console.log('Seeding sample content...');
  await seedContent();
  
  console.log('Database seeding completed successfully!');
  
  return {
    success: true,
    message: 'Database seeded successfully'
  };
}

/**
 * Seed user data
 */
async function seedUsers() {
  // Check if admin user already exists
  const existingAdmin = await User.findOne({ email: 'admin@teachprep.ai' });
  if (existingAdmin) {
    console.log('Admin user already exists, skipping user seeding');
    return existingAdmin;
  }
  
  // Create users with hashed passwords
  const userDocs = [];
  for (const user of users) {
    const hashedPassword = await hashPassword(user.password);
    userDocs.push({
      ...user,
      password: hashedPassword
    });
  }
  
  // Insert users
  await User.insertMany(userDocs);
  
  // Return admin user
  return await User.findOne({ email: 'admin@teachprep.ai' });
}

/**
 * Seed settings data
 */
async function seedSettings(adminId: any) {
  // Check if settings already exist
  const settingCount = await Setting.countDocuments();
  if (settingCount > 0) {
    console.log('Settings already exist, skipping settings seeding');
    return;
  }
  
  // Transform mock settings into database format
  const settingDocs = mockSettings.map((setting: {
    id: string;
    value: any;
    description: string;
    category: string;
  }) => ({
    key: setting.id,
    value: setting.value,
    description: setting.description,
    category: setting.category,
    updatedBy: adminId
  }));
  
  // Insert settings
  await Setting.insertMany(settingDocs);
}

/**
 * Seed content data (lessons, resources, assessments)
 */
async function seedContent() {
  // Check if any content already exists
  const lessonCount = await Lesson.countDocuments();
  const resourceCount = await Resource.countDocuments();
  const assessmentCount = await Assessment.countDocuments();
  
  if (lessonCount > 0 || resourceCount > 0 || assessmentCount > 0) {
    console.log('Content already exists, skipping content seeding');
    return;
  }
  
  // Get user IDs
  const admin = await User.findOne({ email: 'admin@teachprep.ai' });
  const scienceTeacher = await User.findOne({ email: 'science.teacher@teachprep.ai' });
  const englishTeacher = await User.findOne({ email: 'english.teacher@teachprep.ai' });
  const studentTeacher = await User.findOne({ email: 'student.teacher@teachprep.ai' });
  
  if (!admin || !scienceTeacher || !englishTeacher || !studentTeacher) {
    console.error('Could not find required users for content seeding');
    return;
  }
  
  // Seed lessons
  const lessons = [
    {
      title: 'Introduction to Photosynthesis',
      content: 'This lesson plan covers the basic principles of photosynthesis...',
      subject: 'Biology',
      grade: '9th',
      createdBy: scienceTeacher._id,
      department: 'Science',
      status: 'approved',
      approvedBy: admin._id,
      approvalDate: new Date()
    },
    {
      title: 'Shakespeare\'s Romeo and Juliet',
      content: 'This lesson explores the themes and characters in Shakespeare\'s play...',
      subject: 'Literature',
      grade: '10th',
      createdBy: englishTeacher._id,
      department: 'English',
      status: 'approved',
      approvedBy: admin._id,
      approvalDate: new Date()
    },
    {
      title: 'Cell Structure and Function',
      content: 'This lesson introduces students to cell structure and function...',
      subject: 'Biology',
      grade: '9th',
      createdBy: studentTeacher._id,
      department: 'Science',
      status: 'pending'
    }
  ];
  
  await Lesson.insertMany(lessons);
  
  // Seed resources
  const resources = [
    {
      title: 'Periodic Table Interactive',
      description: 'An interactive periodic table of elements',
      resourceType: 'interactive',
      contentUrl: 'https://example.com/periodic-table',
      subject: 'Chemistry',
      createdBy: scienceTeacher._id,
      department: 'Science',
      status: 'approved',
      approvedBy: admin._id,
      approvalDate: new Date(),
      tags: ['chemistry', 'elements', 'periodic table']
    },
    {
      title: 'Shakespeare Sonnet Collection',
      description: 'A collection of Shakespeare\'s sonnets with analysis',
      resourceType: 'document',
      contentUrl: 'https://example.com/shakespeare-sonnets',
      subject: 'Literature',
      createdBy: englishTeacher._id,
      department: 'English',
      status: 'approved',
      approvedBy: admin._id,
      approvalDate: new Date(),
      tags: ['shakespeare', 'poetry', 'sonnets']
    },
    {
      title: 'History Timeline Builder',
      description: 'Tool for creating interactive historical timelines',
      resourceType: 'interactive',
      contentUrl: 'https://example.com/timeline-builder',
      subject: 'History',
      createdBy: studentTeacher._id,
      department: 'History',
      status: 'pending',
      tags: ['history', 'timeline', 'interactive']
    }
  ];
  
  await Resource.insertMany(resources);
  
  // Seed assessments
  const assessments = [
    {
      title: 'Photosynthesis Quiz',
      description: 'A quiz to test understanding of photosynthesis',
      subject: 'Biology',
      grade: '9th',
      questions: [
        {
          questionType: 'multiple-choice',
          questionText: 'What is the primary pigment in photosynthesis?',
          options: ['Chlorophyll', 'Hemoglobin', 'Melanin', 'Carotene'],
          correctAnswer: 'Chlorophyll',
          points: 1
        }
      ],
      createdBy: scienceTeacher._id,
      department: 'Science',
      status: 'approved',
      approvedBy: admin._id,
      approvalDate: new Date()
    },
    {
      title: 'Romeo and Juliet Analysis',
      description: 'Assessment of student understanding of Romeo and Juliet',
      subject: 'Literature',
      grade: '10th',
      questions: [
        {
          questionType: 'essay',
          questionText: 'Analyze the role of fate in Romeo and Juliet.',
          points: 10
        }
      ],
      createdBy: englishTeacher._id,
      department: 'English',
      status: 'approved',
      approvedBy: admin._id,
      approvalDate: new Date()
    },
    {
      title: 'World War II Quiz',
      description: 'A quiz covering the major events of World War II',
      subject: 'History',
      grade: '11th',
      questions: [
        {
          questionType: 'multiple-choice',
          questionText: 'In what year did World War II end?',
          options: ['1943', '1944', '1945', '1946'],
          correctAnswer: '1945',
          points: 1
        }
      ],
      createdBy: studentTeacher._id,
      department: 'History',
      status: 'pending'
    }
  ];
  
  await Assessment.insertMany(assessments);
} 