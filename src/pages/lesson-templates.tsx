import React, { useState } from 'react';
import { FiSearch, FiFilter, FiPlus, FiDownload, FiCopy } from 'react-icons/fi';
import { useAppContext } from '@/context/AppContext';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionGate from '@/components/PermissionGate';
import ProtectedRoute from '@/components/ProtectedRoute';

// Mock template data - would come from API in a real application
const MOCK_TEMPLATES = [
  {
    id: 1,
    title: "5E Inquiry Lesson Plan",
    description: "A template following the 5E model: Engage, Explore, Explain, Elaborate, and Evaluate.",
    subject: "Science",
    gradeLevel: "Middle School",
    duration: "60 minutes",
    popularity: 4.8,
    downloads: 1245
  },
  {
    id: 2,
    title: "Direct Instruction Template",
    description: "A structured approach with clear objectives, modeling, guided practice, and independent practice.",
    subject: "Mathematics",
    gradeLevel: "High School",
    duration: "45 minutes",
    popularity: 4.5,
    downloads: 987
  },
  {
    id: 3,
    title: "Project-Based Learning Template",
    description: "A template for designing comprehensive project-based learning experiences.",
    subject: "Cross-curricular",
    gradeLevel: "All",
    duration: "Multiple sessions",
    popularity: 4.9,
    downloads: 1678
  },
  {
    id: 4,
    title: "Socratic Seminar Template",
    description: "A format for conducting student-led discussions based on Socratic questioning.",
    subject: "English/Language Arts",
    gradeLevel: "High School",
    duration: "90 minutes",
    popularity: 4.6,
    downloads: 876
  },
  {
    id: 5,
    title: "Flipped Classroom Template",
    description: "A design for lessons where content is delivered outside class and practice happens in class.",
    subject: "Any",
    gradeLevel: "All",
    duration: "Various",
    popularity: 4.7,
    downloads: 1532
  },
  {
    id: 6,
    title: "Differentiated Instruction Template",
    description: "A template with options for differentiating content, process, and product.",
    subject: "Any",
    gradeLevel: "All",
    duration: "Varies",
    popularity: 4.9,
    downloads: 2103
  }
];

// Filter options
const SUBJECTS = ["All", "Mathematics", "Science", "English/Language Arts", "History", "Foreign Languages", "Cross-curricular"];
const GRADE_LEVELS = ["All", "Elementary", "Middle School", "High School"];

function LessonTemplates() {
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [gradeLevelFilter, setGradeLevelFilter] = useState('All');
  
  const { can } = usePermissions();

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === 'All' || template.subject === subjectFilter;
    const matchesGradeLevel = gradeLevelFilter === 'All' || template.gradeLevel === gradeLevelFilter;
    
    return matchesSearch && matchesSubject && matchesGradeLevel;
  });

  // Function to handle template use/download
  const handleUseTemplate = (templateId: number) => {
    console.log(`Using template with ID: ${templateId}`);
    // In a real application, this would navigate to planner with the template loaded
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lesson Templates</h1>
        <p className="text-gray-600">Browse and use our collection of professionally designed lesson templates</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search templates..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center">
              <FiFilter className="mr-2 text-gray-500" />
              <label htmlFor="subject" className="text-sm text-gray-700 mr-2">Subject:</label>
              <select
                id="subject"
                className="border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                {SUBJECTS.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <label htmlFor="gradeLevel" className="text-sm text-gray-700 mr-2">Grade Level:</label>
              <select
                id="gradeLevel"
                className="border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={gradeLevelFilter}
                onChange={(e) => setGradeLevelFilter(e.target.value)}
              >
                {GRADE_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map(template => (
            <div key={template.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{template.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{template.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Subject:</span> {template.subject}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Grade Level:</span> {template.gradeLevel}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Duration:</span> {template.duration}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Downloads:</span> {template.downloads}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <PermissionGate permissions="create:lesson">
                    <button 
                      onClick={() => handleUseTemplate(template.id)}
                      className="flex items-center text-sm font-medium text-primary hover:text-primary-dark"
                    >
                      <FiCopy className="mr-1" /> Use Template
                    </button>
                  </PermissionGate>
                  
                  <button 
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-800"
                  >
                    <FiDownload className="mr-1" /> Download
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-8 text-center">
            <p className="text-gray-500">No templates found matching your criteria.</p>
          </div>
        )}
      </div>
      
      {/* Create Template Button for Admins/Department Heads */}
      <PermissionGate role={["Administrator", "Department Head"]}>
        <div className="fixed bottom-8 right-8">
          <button className="bg-primary hover:bg-primary-dark text-white p-4 rounded-full shadow-lg">
            <FiPlus className="h-6 w-6" />
          </button>
        </div>
      </PermissionGate>
    </div>
  );
}

export default function LessonTemplatesPage() {
  return (
    <ProtectedRoute>
      <LessonTemplates />
    </ProtectedRoute>
  );
} 