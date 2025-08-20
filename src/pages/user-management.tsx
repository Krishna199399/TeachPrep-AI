import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiUserPlus, 
  FiSearch,
  FiFilter,
  FiMail,
  FiCheckCircle,
  FiX,
  FiDownload
} from 'react-icons/fi';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionGate from '@/components/PermissionGate';
import { Role } from '@/utils/permissions';
import { useAppContext } from '@/context/AppContext';

interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  department: string;
  status: 'active' | 'inactive';
  lastActive: string;
}

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: 1,
    fullName: 'John Smith',
    email: 'john.smith@school.edu',
    role: 'Teacher',
    department: 'Science',
    status: 'active',
    lastActive: '2023-10-15'
  },
  {
    id: 2,
    fullName: 'Emily Chen',
    email: 'emily.chen@school.edu',
    role: 'Administrator',
    department: 'Administration',
    status: 'active',
    lastActive: '2023-10-15'
  },
  {
    id: 3,
    fullName: 'Michael Johnson',
    email: 'michael.j@school.edu',
    role: 'Department Head',
    department: 'Mathematics',
    status: 'active',
    lastActive: '2023-10-14'
  },
  {
    id: 4,
    fullName: 'Sarah Williams',
    email: 'sarah.w@school.edu',
    role: 'Student Teacher',
    department: 'English',
    status: 'active',
    lastActive: '2023-10-12'
  },
  {
    id: 5,
    fullName: 'David Lee',
    email: 'david.lee@school.edu',
    role: 'Teacher',
    department: 'History',
    status: 'inactive',
    lastActive: '2023-10-01'
  },
  {
    id: 6,
    fullName: 'Maria Garcia',
    email: 'maria.g@school.edu',
    role: 'Department Head',
    department: 'Science',
    status: 'active',
    lastActive: '2023-10-13'
  },
  {
    id: 7,
    fullName: 'Robert Wilson',
    email: 'robert.w@school.edu',
    role: 'Teacher',
    department: 'Physical Education',
    status: 'active',
    lastActive: '2023-10-10'
  },
  {
    id: 8,
    fullName: 'Jennifer Taylor',
    email: 'jennifer.t@school.edu',
    role: 'Teacher',
    department: 'Art',
    status: 'active',
    lastActive: '2023-10-11'
  }
];

export default function UserManagement() {
  const { role, isAdmin } = usePermissions();
  const { showNotification } = useAppContext();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<{
    role: string;
    department: string;
    status: string;
  }>({
    role: 'all',
    department: 'all',
    status: 'all'
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<{
    fullName: string;
    email: string;
    role: Role;
    department: string;
  }>({
    fullName: '',
    email: '',
    role: 'Teacher',
    department: ''
  });
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  
  // Load users from localStorage on initial load
  useEffect(() => {
    const storedUsers = localStorage.getItem('teachprep_users');
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (error) {
        console.error('Failed to parse stored users', error);
      }
    }
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);
  
  // Save users to localStorage when they change
  useEffect(() => {
    localStorage.setItem('teachprep_users', JSON.stringify(users));
  }, [users]);

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    // Search term filter
    if (
      searchTerm &&
      !user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Role filter
    if (filter.role !== 'all' && user.role !== filter.role) {
      return false;
    }

    // Department filter
    if (filter.department !== 'all' && user.department !== filter.department) {
      return false;
    }

    // Status filter
    if (filter.status !== 'all' && user.status !== filter.status) {
      return false;
    }

    return true;
  });

  // Get unique departments for filter
  const departments = Array.from(new Set(users.map(user => user.department)));

  // Handle bulk selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };
  
  // Handle individual selection
  const handleSelectUser = (userId: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };
  
  // Apply bulk action
  const handleBulkAction = () => {
    if (!bulkAction || selectedUsers.length === 0) {
      showNotification('Please select an action and at least one user', 'warning');
      return;
    }
    
    switch (bulkAction) {
      case 'activate':
        setUsers(users.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'active' as const } : user
        ));
        showNotification(`${selectedUsers.length} users activated`, 'success');
        break;
      case 'deactivate':
        setUsers(users.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'inactive' as const } : user
        ));
        showNotification(`${selectedUsers.length} users deactivated`, 'warning');
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This cannot be undone.`)) {
          setUsers(users.filter(user => !selectedUsers.includes(user.id)));
          showNotification(`${selectedUsers.length} users deleted`, 'warning');
        }
        break;
      default:
        break;
    }
    
    // Reset selections
    setSelectedUsers([]);
    setBulkAction('');
  };

  // Add new user
  const handleAddUser = () => {
    if (!newUser.fullName || !newUser.email || !newUser.department) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    const newId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
    
    const userToAdd: User = {
      id: newId,
      ...newUser,
      status: 'active',
      lastActive: new Date().toISOString().split('T')[0]
    };

    setUsers([...users, userToAdd]);
    setShowAddUserModal(false);
    setNewUser({
      fullName: '',
      email: '',
      role: 'Teacher',
      department: ''
    });
    
    showNotification(`User ${userToAdd.fullName} has been added successfully!`, 'success');
  };

  // Edit user
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setShowEditUserModal(true);
  };
  
  // Update user
  const handleUpdateUser = () => {
    if (!currentUser) return;
    
    setUsers(users.map(user => 
      user.id === currentUser.id ? currentUser : user
    ));
    
    setShowEditUserModal(false);
    setCurrentUser(null);
    showNotification(`User ${currentUser.fullName} has been updated successfully!`, 'success');
  };

  // Delete user
  const handleDeleteUser = (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const userToDelete = users.find(user => user.id === id);
      setUsers(users.filter(user => user.id !== id));
      showNotification(`User ${userToDelete?.fullName || 'User'} has been deleted.`, 'warning');
    }
  };

  // Toggle user status
  const handleToggleStatus = (id: number) => {
    const updatedUsers = users.map(user =>
      user.id === id
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    );
    
    const targetUser = updatedUsers.find(user => user.id === id);
    setUsers(updatedUsers);
    
    showNotification(
      `User ${targetUser?.fullName} has been ${targetUser?.status === 'active' ? 'activated' : 'deactivated'}.`,
      targetUser?.status === 'active' ? 'success' : 'warning'
    );
  };

  // Export users to CSV
  const handleExportUsers = () => {
    // Create CSV content
    const headers = ['Full Name', 'Email', 'Role', 'Department', 'Status', 'Last Active'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        user.fullName,
        user.email,
        user.role,
        user.department,
        user.status,
        user.lastActive
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Trigger download and cleanup
    link.click();
    document.body.removeChild(link);
    showNotification('Users exported successfully!', 'success');
  };

  return (
    <Layout>
      <Head>
        <title>User Management | TeachPrep AI</title>
        <meta name="description" content="Manage users in the TeachPrep AI platform" />
      </Head>
      
      <div className="p-6">
        <PermissionGate role="Administrator">
          {loading ? (
            // Loading skeleton
            <div className="space-y-6 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-10 w-64 bg-gray-200 rounded"></div>
                <div className="h-10 w-40 bg-gray-200 rounded-md"></div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-10 bg-gray-200 rounded-md"></div>
                  <div className="h-10 bg-gray-200 rounded-md"></div>
                  <div className="h-10 bg-gray-200 rounded-md"></div>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="h-14 bg-gray-100 w-full"></div>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 w-full border-b border-gray-200 flex items-center p-4 space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                      <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">User Management</h1>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                    onClick={() => setShowAddUserModal(true)}
                  >
                    <FiUserPlus className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                    Add User
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                    onClick={handleExportUsers}
                  >
                    <FiDownload className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                    Export Users
                  </button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-white shadow rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="search" className="sr-only">
                      Search users
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        name="search"
                        id="search"
                        className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Search by name or email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="roleFilter" className="sr-only">
                      Filter by role
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiFilter className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <select
                        id="roleFilter"
                        name="roleFilter"
                        className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        value={filter.role}
                        onChange={(e) => setFilter(prev => ({ ...prev, role: e.target.value }))}
                      >
                        <option value="all">All Roles</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Department Head">Department Head</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Student Teacher">Student Teacher</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="departmentFilter" className="sr-only">
                      Filter by department
                    </label>
                    <select
                      id="departmentFilter"
                      name="departmentFilter"
                      className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                      value={filter.department}
                      onChange={(e) => setFilter(prev => ({ ...prev, department: e.target.value }))}
                    >
                      <option value="all">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="statusFilter" className="sr-only">
                      Filter by status
                    </label>
                    <select
                      id="statusFilter"
                      name="statusFilter"
                      className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                      value={filter.status}
                      onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  
                  {selectedUsers.length > 0 && (
                    <div className="md:col-span-3 flex items-center justify-end space-x-2">
                      <span className="text-sm text-gray-700">
                        {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                      </span>
                      <select
                        className="focus:ring-primary focus:border-primary block w-40 sm:text-sm border-gray-300 rounded-md"
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value)}
                      >
                        <option value="">Bulk Actions</option>
                        <option value="activate">Activate</option>
                        <option value="deactivate">Deactivate</option>
                        <option value="delete">Delete</option>
                      </select>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                        onClick={handleBulkAction}
                        disabled={!bulkAction}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* User Table */}
              <div className="bg-white shadow rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                              onChange={handleSelectAll}
                              checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                              ref={el => {
                                if (el) {
                                  el.indeterminate = selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length;
                                }
                              }}
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Role
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Department
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Last Active
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className={`${user.status === 'inactive' ? 'bg-gray-50' : ''} hover:bg-gray-50 transition-colors duration-150`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                                checked={selectedUsers.includes(user.id)}
                                onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                                    {user.fullName.charAt(0)}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.role}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.department}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.lastActive}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex space-x-2 justify-end">
                                <button
                                  onClick={() => handleToggleStatus(user.id)}
                                  className={`text-sm px-2 py-1 rounded ${
                                    user.status === 'active' ? 'text-red-600 hover:text-red-900 hover:bg-red-50' : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                                  } transition-colors duration-150`}
                                >
                                  {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors duration-150"
                                  title="Edit user"
                                >
                                  <FiEdit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-150"
                                  title="Delete user"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </PermissionGate>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowAddUserModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-fadeIn">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary bg-opacity-10 sm:mx-0 sm:h-10 sm:w-10">
                    <FiUserPlus className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add New User</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          id="fullName"
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={newUser.fullName}
                          onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <select
                          id="role"
                          name="role"
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={newUser.role}
                          onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                        >
                          <option value="Teacher">Teacher</option>
                          <option value="Administrator">Administrator</option>
                          <option value="Department Head">Department Head</option>
                          <option value="Student Teacher">Student Teacher</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="department"
                          id="department"
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={newUser.department}
                          onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  onClick={handleAddUser}
                >
                  Add User
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && currentUser && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowEditUserModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-fadeIn">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary bg-opacity-10 sm:mx-0 sm:h-10 sm:w-10">
                    <FiEdit2 className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Edit User</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="edit-fullName" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="edit-fullName"
                          id="edit-fullName"
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={currentUser.fullName}
                          onChange={(e) => setCurrentUser({ ...currentUser, fullName: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="edit-email"
                          id="edit-email"
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={currentUser.email}
                          onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <select
                          id="edit-role"
                          name="edit-role"
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={currentUser.role}
                          onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value as Role })}
                        >
                          <option value="Teacher">Teacher</option>
                          <option value="Administrator">Administrator</option>
                          <option value="Department Head">Department Head</option>
                          <option value="Student Teacher">Student Teacher</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700">
                          Department
                        </label>
                        <input
                          type="text"
                          name="edit-department"
                          id="edit-department"
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={currentUser.department}
                          onChange={(e) => setCurrentUser({ ...currentUser, department: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          id="edit-status"
                          name="edit-status"
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={currentUser.status}
                          onChange={(e) => setCurrentUser({ ...currentUser, status: e.target.value as 'active' | 'inactive' })}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  onClick={handleUpdateUser}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  onClick={() => {
                    setShowEditUserModal(false);
                    setCurrentUser(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 