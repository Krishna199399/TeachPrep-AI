import { useAuth } from '@/context/AuthContext';
import { useAppContext } from '@/context/AppContext';
import { 
  Permission, 
  Role, 
  isAuthorized,
  hasAnyPermission,
  hasAllPermissions
} from '@/utils/permissions';

/**
 * Custom hook for checking user permissions
 */
export function usePermissions() {
  const { user: authUser } = useAuth();
  const { user } = useAppContext();
  
  // Get the user's role, prioritizing auth context over app context
  const userRole = (authUser?.role || user?.role || 'Teacher') as Role;
  
  // Create a user object with role for permission checks
  const userObj = { role: userRole };

  return {
    /**
     * Check if the current user has a specific permission
     */
    can: (permission: Permission) => {
      return isAuthorized(userObj, permission);
    },
    
    /**
     * Check if the current user has any of the specified permissions
     */
    canAny: (permissions: Permission[]) => {
      return hasAnyPermission(userObj, permissions);
    },
    
    /**
     * Check if the current user has all of the specified permissions
     */
    canAll: (permissions: Permission[]) => {
      return hasAllPermissions(userObj, permissions);
    },
    
    /**
     * Get the current user's role
     */
    role: userRole,
    
    /**
     * Check if the current user has a specific role
     */
    isRole: (role: Role) => userRole === role,
    
    /**
     * Check if the current user is an administrator
     */
    isAdmin: () => userRole === 'Administrator',
    
    /**
     * Check if the current user is a department head
     */
    isDepartmentHead: () => userRole === 'Department Head',
    
    /**
     * Check if the current user is a teacher (not a student teacher)
     */
    isTeacher: () => userRole === 'Teacher',
    
    /**
     * Check if the current user is a student teacher
     */
    isStudentTeacher: () => userRole === 'Student Teacher',
  };
} 