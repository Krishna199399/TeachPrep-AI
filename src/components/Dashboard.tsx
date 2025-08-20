import { useState } from 'react';
import { 
  FiPlus, 
  FiBook, 
  FiCalendar, 
  FiFileText, 
  FiTrendingUp, 
  FiUsers, 
  FiSettings,
  FiCheckCircle,
  FiClipboard
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ResourceCard from './ResourceCard';
import AIAssistant from './AIAssistant';
import PermissionGate from './PermissionGate';
import { usePermissions } from '@/hooks/usePermissions';
import { useAppContext } from '@/context/AppContext';
import { Permission } from '@/utils/permissions';

// Interactive Dashboard Card Component
interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  iconBgColor: string;
  iconColor: string;
  href: string;
}

const DashboardCard = ({ title, value, icon, bgColor, iconBgColor, iconColor, href }: DashboardCardProps) => {
  const router = useRouter();
  
  const handleCardClick = () => {
    router.push(href);
  };
  
  return (
    <div 
      onClick={handleCardClick}
      className={`${bgColor} rounded-lg p-4 flex items-center cursor-pointer hover:shadow-md transition-shadow duration-300`}
    >
      <div className={`rounded-full ${iconBgColor} p-3 mr-4`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-gray-500">{value}</p>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const { role, isAdmin, isDepartmentHead } = usePermissions();
  const { user } = useAppContext();

  const popularResources = [
    { id: 1, title: 'Interactive Periodic Table', type: 'Interactive', subject: 'Chemistry' },
    { id: 2, title: 'Historical Maps Collection', type: 'Images', subject: 'History' },
    { id: 3, title: 'Geometry Formulas Sheet', type: 'Document', subject: 'Mathematics' },
  ];

  // Role-specific greeting
  const getGreeting = () => {
    return `Welcome back, ${user.fullName || role}!`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6 md:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{getGreeting()}</h2>
            
            <PermissionGate permissions="create:lesson">
              <button 
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <FiPlus className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                New Lesson Plan
              </button>
            </PermissionGate>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Standard metrics for all roles - Now interactive */}
            <DashboardCard
              title="Upcoming Classes"
              value="3 classes today"
              icon={<FiCalendar className="h-6 w-6 text-green-600" />}
              bgColor="bg-green-100"
              iconBgColor="bg-green-200"
              iconColor="text-green-600"
              href="/upcoming-classes"
            />
            
            <PermissionGate 
              permissions={['edit:assessment', 'approve:content'] as Permission[]} 
              anyPermission
              fallback={
                <DashboardCard
                  title="My Assessments"
                  value="2 in progress"
                  icon={<FiFileText className="h-6 w-6 text-yellow-600" />}
                  bgColor="bg-yellow-100"
                  iconBgColor="bg-yellow-200"
                  iconColor="text-yellow-600"
                  href="/assessments"
                />
              }
            >
              <DashboardCard
                title="Assessment Tasks"
                value="5 pending reviews"
                icon={<FiFileText className="h-6 w-6 text-yellow-600" />}
                bgColor="bg-yellow-100"
                iconBgColor="bg-yellow-200"
                iconColor="text-yellow-600"
                href="/assessments"
              />
            </PermissionGate>
            
            <PermissionGate 
              permissions="view:analytics:own" 
              fallback={
                <DashboardCard
                  title="My Tasks"
                  value="3 pending submissions"
                  icon={<FiClipboard className="h-6 w-6 text-purple-600" />}
                  bgColor="bg-purple-100"
                  iconBgColor="bg-purple-200"
                  iconColor="text-purple-600"
                  href="/tasks"
                />
              }
            >
              <DashboardCard
                title="Student Progress"
                value="15% improvement"
                icon={<FiTrendingUp className="h-6 w-6 text-blue-600" />}
                bgColor="bg-blue-100"
                iconBgColor="bg-blue-200"
                iconColor="text-blue-600"
                href="/analytics/student-progress"
              />
            </PermissionGate>
          </div>

          {/* Administrator and Department Head specific metrics - Now interactive */}
          <PermissionGate role={['Administrator', 'Department Head']}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <DashboardCard
                title="Teacher Activity"
                value="12 active today"
                icon={<FiUsers className="h-6 w-6 text-green-600" />}
                bgColor="bg-green-100"
                iconBgColor="bg-green-200"
                iconColor="text-green-600"
                href="/analytics/teacher-activity"
              />
              
              <DashboardCard
                title="Pending Approvals"
                value="8 items to review"
                icon={<FiCheckCircle className="h-6 w-6 text-purple-600" />}
                bgColor="bg-purple-100"
                iconBgColor="bg-purple-200"
                iconColor="text-purple-600"
                href="/approval-queue"
              />
              
              <PermissionGate role="Administrator">
                <DashboardCard
                  title="System Status"
                  value="All systems operational"
                  icon={<FiSettings className="h-6 w-6 text-blue-600" />}
                  bgColor="bg-blue-100"
                  iconBgColor="bg-blue-200"
                  iconColor="text-blue-600"
                  href="/system-settings/status"
                />
              </PermissionGate>
            </div>
          </PermissionGate>

          {showAIAssistant && (
            <div className="mt-6">
              <AIAssistant onClose={() => setShowAIAssistant(false)} />
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Popular Resources</h2>
            <Link href="/resources" className="text-sm font-medium text-primary hover:text-primary-dark">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {popularResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 