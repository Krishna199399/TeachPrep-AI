import { FiEdit2, FiCopy, FiTrash2 } from 'react-icons/fi';

interface Lesson {
  id: number;
  title: string;
  subject: string;
  grade: string;
  date: string;
}

interface LessonCardProps {
  lesson: Lesson;
}

export default function LessonCard({ lesson }: LessonCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{lesson.title}</h3>
          <div className="mt-1 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{lesson.subject}</span> • {lesson.grade} Grade
          </div>
          <div className="mt-2 text-sm text-gray-500">Last edited: {lesson.date}</div>
        </div>
        <div className="flex space-x-2">
          <button className="p-1.5 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100">
            <FiEdit2 className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </button>
          <button className="p-1.5 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100">
            <FiCopy className="h-4 w-4" />
            <span className="sr-only">Duplicate</span>
          </button>
          <button className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100">
            <FiTrash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </button>
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Lesson Plan
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Resources Ready
        </span>
      </div>
    </div>
  );
} 