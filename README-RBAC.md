# Role-Based Access Control in TeachPrep AI

This document describes the role-based access control (RBAC) implementation in the TeachPrep AI application.

## User Roles

### Administrator
- **Permissions**: Full system access
- **Responsibilities**:
  - Manage all users and their permissions
  - Access and modify all content across the platform
  - View system analytics and settings
  - Create institution-wide templates and standards
  - Audit system activities

### Department Head
- **Permissions**: Department-level access
- **Responsibilities**:
  - Manage teachers within their department
  - Review and approve content from teachers
  - Access department analytics and reporting
  - Create department-level templates and standards
  - Create collaborative projects within the department

### Teacher
- **Permissions**: Standard teaching functionality access
- **Responsibilities**:
  - Create and manage their own lessons, resources, and assessments
  - Share and collaborate on content with other teachers
  - Access AI tools for generating teaching materials
  - Track student progress and performance in their classes

### Student Teacher
- **Permissions**: Limited access
- **Responsibilities**:
  - Create lesson plans (requiring approval before implementation)
  - Access a subset of resources and teaching materials
  - Collaborate with supervising teachers
  - Cannot access sensitive student data or administrative functions

## Permission System

The permission system uses a granular approach with specific permissions defined for different actions:

### Content Permissions
- `create:lesson`, `edit:lesson`, `delete:lesson`, `approve:lesson`
- `create:resource`, `edit:resource`, `delete:resource`, `approve:resource`
- `create:assessment`, `edit:assessment`, `delete:assessment`, `approve:assessment`

### User Management Permissions
- `view:users`, `create:user`, `edit:user`, `delete:user`

### Analytics Permissions
- `view:analytics:own`, `view:analytics:department`, `view:analytics:all`

### System Permissions
- `manage:settings`, `view:audit-logs`

## Implementation Components

### 1. Permissions Utilities (`/src/utils/permissions.ts`)
- Defines permission types and role types
- Maps roles to their assigned permissions
- Provides utility functions for permission checking:
  - `hasPermission`: Check if a role has a specific permission
  - `getPermissionsForRole`: Get all permissions for a role
  - `hasAnyPermission`: Check if a role has any of several permissions
  - `hasAllPermissions`: Check if a role has all specified permissions

### 2. Permission Hook (`/src/hooks/usePermissions.ts`)
- React hook that provides permission checking functions to components
- Gets the current user's role from the auth context
- Exposes helper functions like `can`, `canAny`, `canAll`
- Provides role-specific checks like `isAdmin`, `isDepartmentHead`, etc.

### 3. Permission Gate Component (`/src/components/PermissionGate.tsx`)
- Conditionally renders UI elements based on user permissions
- Can check single or multiple permissions
- Supports "any permission" or "all permissions" modes
- Can restrict access based on specific roles
- Accepts an optional fallback component to render when permission is denied

## Usage Examples

### Protecting UI Elements

```jsx
// Show a button only to users who can create lessons
<PermissionGate permissions="create:lesson">
  <button>Create New Lesson</button>
</PermissionGate>

// Show content to users with either edit or delete assessment permissions
<PermissionGate 
  permissions={['edit:assessment', 'delete:assessment']} 
  anyPermission
>
  <AssessmentActions />
</PermissionGate>

// Show admin panel only to administrators
<PermissionGate role="Administrator">
  <AdminPanel />
</PermissionGate>

// Show alternative content based on permissions
<PermissionGate 
  permissions="view:analytics:department"
  fallback={<LimitedAnalytics />}
>
  <DepartmentAnalytics />
</PermissionGate>
```

### Checking Permissions in Code

```jsx
const MyComponent = () => {
  const { can, isAdmin, role } = usePermissions();
  
  const handleDelete = () => {
    if (can('delete:resource')) {
      // Delete the resource
    } else {
      // Show permission denied message
    }
  };
  
  return (
    <div>
      <h1>Welcome, {role}</h1>
      
      {can('edit:resource') && <EditButton />}
      
      {isAdmin() && <AdminControls />}
    </div>
  );
};
```

### Dynamic Navigation

The sidebar navigation dynamically adjusts based on the user's role and permissions:

```jsx
// Common navigation items for all users
const commonNavigation = [
  { name: 'Dashboard', href: '/' },
];

// Get filtered navigation items based on user permissions
const getFilteredNavigation = () => {
  const filteredNav = [...commonNavigation];
  
  permissionBasedNavigation.forEach(item => {
    if (!item.permission || can(item.permission)) {
      filteredNav.push(item);
    }
  });
  
  // Add admin items if user has the right role
  if (isAdmin()) {
    filteredNav.push(...adminNavigation);
  }
  
  return filteredNav;
};
```

## Best Practices

1. **Check permissions at multiple levels**: UI layer, business logic layer, and API layer
2. **Use permission checking for all sensitive operations**: Don't rely solely on hiding UI elements
3. **Keep permission checks granular**: Use specific permissions for specific actions
4. **Default to deny**: When in doubt, deny access
5. **Audit permission checks**: Log important permission-based actions for security review 