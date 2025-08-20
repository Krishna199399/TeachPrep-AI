import { useState } from 'react';
import { FiSave, FiShare2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/router';

interface LessonPlan {
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

export default function LessonPlanner() {
  const [lessonPlan, setLessonPlan] = useState<LessonPlan>({
    id: Math.random().toString(36).substr(2, 9),
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
  });

  const { addLessonPlan } = useAppContext();
  const router = useRouter();

  const addObjective = () => {
    setLessonPlan({
      ...lessonPlan,
      objectives: [...lessonPlan.objectives, ''],
    });
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...lessonPlan.objectives];
    newObjectives[index] = value;
    setLessonPlan({
      ...lessonPlan,
      objectives: newObjectives,
    });
  };

  const removeObjective = (index: number) => {
    const newObjectives = [...lessonPlan.objectives];
    newObjectives.splice(index, 1);
    setLessonPlan({
      ...lessonPlan,
      objectives: newObjectives,
    });
  };

  const addMaterial = () => {
    setLessonPlan({
      ...lessonPlan,
      materials: [...lessonPlan.materials, ''],
    });
  };

  const updateMaterial = (index: number, value: string) => {
    const newMaterials = [...lessonPlan.materials];
    newMaterials[index] = value;
    setLessonPlan({
      ...lessonPlan,
      materials: newMaterials,
    });
  };

  const removeMaterial = (index: number) => {
    const newMaterials = [...lessonPlan.materials];
    newMaterials.splice(index, 1);
    setLessonPlan({
      ...lessonPlan,
      materials: newMaterials,
    });
  };

  const addActivity = () => {
    setLessonPlan({
      ...lessonPlan,
      activities: [
        ...lessonPlan.activities,
        {
          title: `Activity ${lessonPlan.activities.length + 1}`,
          duration: '15 minutes',
          description: '',
        },
      ],
    });
  };

  const updateActivity = (index: number, field: string, value: string) => {
    const newActivities = [...lessonPlan.activities];
    newActivities[index] = {
      ...newActivities[index],
      [field]: value,
    };
    setLessonPlan({
      ...lessonPlan,
      activities: newActivities,
    });
  };

  const removeActivity = (index: number) => {
    const newActivities = [...lessonPlan.activities];
    newActivities.splice(index, 1);
    setLessonPlan({
      ...lessonPlan,
      activities: newActivities,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!lessonPlan.title) {
      alert('Please enter a lesson title');
      return;
    }
    
    if (!lessonPlan.subject) {
      alert('Please select a subject');
      return;
    }
    
    if (!lessonPlan.grade) {
      alert('Please select a grade level');
      return;
    }
    
    try {
      // Extract all properties except id to match the Omit<LessonPlan, 'id'> type
      const { id, ...lessonPlanWithoutId } = lessonPlan;
      
      // Save the lesson plan to context
      addLessonPlan(lessonPlanWithoutId);
      
      // Reset form or show success message
      alert('Lesson plan saved successfully!');
      
      // Optionally redirect to view all lesson plans
      router.push('/lesson-plans');
    } catch (error) {
      console.error('Error saving lesson plan:', error);
      alert('Failed to save lesson plan. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create Lesson Plan</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <FiSave className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
            Save
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <FiShare2 className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
            Share
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Lesson Details</h2>
            <p className="mt-1 text-sm text-gray-500">Basic information about your lesson</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Lesson Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={lessonPlan.title}
                    onChange={(e) => setLessonPlan({ ...lessonPlan, title: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Introduction to Photosynthesis"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <div className="mt-1">
                  <select
                    id="subject"
                    name="subject"
                    value={lessonPlan.subject}
                    onChange={(e) => setLessonPlan({ ...lessonPlan, subject: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select a subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Language Arts">Language Arts</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Art">Art</option>
                    <option value="Music">Music</option>
                    <option value="Physical Education">Physical Education</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                  Grade Level
                </label>
                <div className="mt-1">
                  <select
                    id="grade"
                    name="grade"
                    value={lessonPlan.grade}
                    onChange={(e) => setLessonPlan({ ...lessonPlan, grade: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select a grade</option>
                    <option value="K">Kindergarten</option>
                    <option value="1">1st Grade</option>
                    <option value="2">2nd Grade</option>
                    <option value="3">3rd Grade</option>
                    <option value="4">4th Grade</option>
                    <option value="5">5th Grade</option>
                    <option value="6">6th Grade</option>
                    <option value="7">7th Grade</option>
                    <option value="8">8th Grade</option>
                    <option value="9">9th Grade</option>
                    <option value="10">10th Grade</option>
                    <option value="11">11th Grade</option>
                    <option value="12">12th Grade</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="duration"
                    id="duration"
                    value={lessonPlan.duration}
                    onChange={(e) => setLessonPlan({ ...lessonPlan, duration: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 45 minutes, 1 hour, 2 class periods"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Learning Objectives</h2>
            <p className="mt-1 text-sm text-gray-500">What students will learn from this lesson</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {lessonPlan.objectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      className="input-field"
                      placeholder={`Objective ${index + 1}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="text-gray-400 hover:text-red-500"
                    disabled={lessonPlan.objectives.length === 1}
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addObjective}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary bg-primary-50 hover:bg-primary-100 focus:outline-none"
              >
                <FiPlus className="mr-1 h-4 w-4" /> Add Objective
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Materials Needed</h2>
            <p className="mt-1 text-sm text-gray-500">Resources required for this lesson</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {lessonPlan.materials.map((material, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => updateMaterial(index, e.target.value)}
                      className="input-field"
                      placeholder={`Material ${index + 1}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMaterial(index)}
                    className="text-gray-400 hover:text-red-500"
                    disabled={lessonPlan.materials.length === 1}
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addMaterial}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary bg-primary-50 hover:bg-primary-100 focus:outline-none"
              >
                <FiPlus className="mr-1 h-4 w-4" /> Add Material
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Lesson Activities</h2>
            <p className="mt-1 text-sm text-gray-500">Steps and procedures for your lesson</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {lessonPlan.activities.map((activity, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      <input
                        type="text"
                        value={activity.title}
                        onChange={(e) => updateActivity(index, 'title', e.target.value)}
                        className="border-0 border-b border-gray-300 focus:border-primary focus:ring-0 bg-transparent"
                        placeholder="Activity Title"
                      />
                    </h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={activity.duration}
                        onChange={(e) => updateActivity(index, 'duration', e.target.value)}
                        className="w-32 text-sm border-0 border-b border-gray-300 focus:border-primary focus:ring-0 bg-transparent text-right"
                        placeholder="Duration"
                      />
                      <button
                        type="button"
                        onClick={() => removeActivity(index)}
                        className="text-gray-400 hover:text-red-500"
                        disabled={lessonPlan.activities.length === 1}
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={activity.description}
                    onChange={(e) => updateActivity(index, 'description', e.target.value)}
                    className="input-field h-32"
                    placeholder="Describe the activity steps and procedures..."
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addActivity}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary bg-primary-50 hover:bg-primary-100 focus:outline-none"
              >
                <FiPlus className="mr-1 h-4 w-4" /> Add Activity
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Assessment</h2>
            <p className="mt-1 text-sm text-gray-500">How you will evaluate student learning</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <textarea
              value={lessonPlan.assessment}
              onChange={(e) => setLessonPlan({ ...lessonPlan, assessment: e.target.value })}
              className="input-field h-32"
              placeholder="Describe how you will assess student learning..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Save Lesson Plan
          </button>
        </div>
      </form>
    </div>
  );
} 