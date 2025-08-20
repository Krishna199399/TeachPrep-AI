// Role types
export type Role = 'Administrator' | 'Department Head' | 'Teacher' | 'Student Teacher';

// Permission types
export type Permission = 
  | 'create:lesson'
  | 'edit:lesson'
  | 'delete:lesson'
  | 'create:resource'
  | 'edit:resource'
  | 'delete:resource'
  | 'create:assessment'
  | 'edit:assessment'
  | 'delete:assessment'
  | 'manage:users'
  | 'approve:content'
  | 'manage:settings'
  | 'view:audit-logs'
  | 'view:analytics:own'
  | 'view:analytics:department'
  | 'view:analytics:all';

// Role-based permissions
export const rolePermissions: Record<Role, Permission[]> = {
  'Administrator': [
    // Content creation and management
    'create:lesson', 'edit:lesson', 'delete:lesson',
    'create:resource', 'edit:resource', 'delete:resource',
    'create:assessment', 'edit:assessment', 'delete:assessment',
    
    // System permissions
    'manage:settings', 'view:audit-logs',
     
    // New permissions
    'manage:users', 'approve:content'
  ],
  
  'Department Head': [
    // Content creation and management
    'create:lesson', 'edit:lesson', 'delete:lesson',
    'create:resource', 'edit:resource', 'delete:resource',
    'create:assessment', 'edit:assessment', 'delete:assessment',
    
    // Analytics permissions
    'view:analytics:own', 'view:analytics:department',
     
    // New permissions
    'approve:content'
  ],
  
  'Teacher': [
    // Content creation and management
    'create:lesson', 'edit:lesson', 'delete:lesson',
    'create:resource', 'edit:resource', 'delete:resource',
    'create:assessment', 'edit:assessment', 'delete:assessment',
    
    // Analytics permissions
    'view:analytics:own'
  ],
  
  'Student Teacher': [
    // Limited content creation
    'create:lesson', 'create:resource', 'create:assessment'
  ]
};

// Function to check if a user has a specific permission
export const isAuthorized = (user: any, permission: Permission): boolean => {
  if (!user || !user.role) {
    return false;
  }

  const role = user.role as Role;
  const permissions = rolePermissions[role] || [];
  
  return permissions.includes(permission);
};

// Function to check if a user has multiple permissions (all of them)
export const hasAllPermissions = (user: any, permissions: Permission[]): boolean => {
  if (!user || !user.role) {
    return false;
  }

  const role = user.role as Role;
  const userPermissions = rolePermissions[role] || [];
  
  return permissions.every(permission => userPermissions.includes(permission));
};

// Function to check if a user has at least one of the specified permissions
export const hasAnyPermission = (user: any, permissions: Permission[]): boolean => {
  if (!user || !user.role) {
    return false;
  }

  const role = user.role as Role;
  const userPermissions = rolePermissions[role] || [];
  
  return permissions.some(permission => userPermissions.includes(permission));
}; 