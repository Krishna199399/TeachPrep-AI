import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiCalendar, FiBookOpen, FiFileText, FiCheckCircle, FiUsers, FiPlus } from 'react-icons/fi';
import { useAppContext } from '@/context/AppContext';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionGate from '@/components/PermissionGate';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Permission } from '@/utils/permissions';

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ title, description, icon, href, color }) => {
  const IconComponent = icon;
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border-l-4" style={{ borderLeftColor: color }}>
        <div className="flex items-start">
          <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
            <IconComponent className="h-6 w-6" style={{ color }} />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

function QuickAccess() {
  const { user } = useAppContext();
  const { can, role } = usePermissions();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quick Access</h1>
        <p className="text-gray-600">Quickly access your most important tools and features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PermissionGate permissions="create:lesson">
          <QuickAccessCard
            title="Create New Lesson"
            description="Plan and develop new lesson content"
            icon={FiCalendar}
            href="/planner"
            color="#4F46E5"
          />
        </PermissionGate>

        <PermissionGate permissions="create:resource">
          <QuickAccessCard
            title="My Resource Library"
            description="Access and manage your teaching resources"
            icon={FiBookOpen}
            href="/resources"
            color="#059669"
          />
        </PermissionGate>

        <PermissionGate permissions="create:assessment">
          <QuickAccessCard
            title="Create New Assessment"
            description="Create tests, quizzes and evaluations"
            icon={FiFileText}
            href="/assessments"
            color="#D97706"
          />
        </PermissionGate>

        {(role === 'Administrator' || role === 'Department Head') && (
          <QuickAccessCard
            title="Approval Queue"
            description="Review and approve pending content"
            icon={FiCheckCircle}
            href="/approval-queue"
            color="#DC2626"
          />
        )}

        {role === 'Administrator' && (
          <QuickAccessCard
            title="User Management"
            description="Manage user accounts and permissions"
            icon={FiUsers}
            href="/user-management"
            color="#7C3AED"
          />
        )}
      </div>
    </div>
  );
}

export default function QuickAccessPage() {
  return (
    <ProtectedRoute>
      <QuickAccess />
    </ProtectedRoute>
  );
} 