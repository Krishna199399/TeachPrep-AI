import React, { ReactNode } from 'react';
import { Permission, Role } from '@/utils/permissions';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGateProps {
  children: ReactNode;
  permissions?: Permission | Permission[];
  anyPermission?: boolean;
  role?: Role | Role[];
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders content based on user permissions
 * 
 * @example
 * // Render content if user has 'create:lesson' permission
 * <PermissionGate permissions="create:lesson">
 *   <CreateLessonButton />
 * </PermissionGate>
 * 
 * @example
 * // Render content if user has any of the specified permissions
 * <PermissionGate permissions={['edit:lesson', 'delete:lesson']} anyPermission>
 *   <LessonActions />
 * </PermissionGate>
 * 
 * @example
 * // Render content if user is an Administrator or Department Head
 * <PermissionGate role={['Administrator', 'Department Head']}>
 *   <AdminPanel />
 * </PermissionGate>
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permissions,
  anyPermission = false,
  role,
  fallback = null,
}) => {
  const { can, canAny, canAll, role: userRole } = usePermissions();
  
  // Check if user has the required role
  const hasRole = role 
    ? Array.isArray(role)
      ? role.includes(userRole)
      : userRole === role
    : true;
  
  // No permissions specified, just check role
  if (!permissions && hasRole) {
    return <>{children}</>;
  }
  
  // Check permissions
  if (permissions && hasRole) {
    if (Array.isArray(permissions)) {
      // Check if user has any or all permissions
      const hasPermission = anyPermission 
        ? canAny(permissions)
        : canAll(permissions);
      
      return hasPermission ? <>{children}</> : <>{fallback}</>;
    } else {
      // Check if user has the single permission
      return can(permissions) ? <>{children}</> : <>{fallback}</>;
    }
  }
  
  // Default: no access
  return <>{fallback}</>;
};

export default PermissionGate; 