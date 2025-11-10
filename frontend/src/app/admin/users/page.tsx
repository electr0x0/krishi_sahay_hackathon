'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MoreVertical, UserCheck, UserX, Mail, Shield, Crown, User as UserIcon, Eye } from 'lucide-react';
import Swal from 'sweetalert2';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  farm_size: number;
  location: string;
  created_at: string;
  last_login: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Import the API service
      const apiModule = await import('@/lib/api.js');
      const api = apiModule.default;
      const token = api.getToken();
      
      if (!token) {
        console.error('No token found - user not authenticated');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch users:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: number) => {
    const result = await Swal.fire({
      title: 'Suspend User?',
      text: 'This will temporarily disable the user account',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, suspend',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;
    
    try {
      const apiModule = await import('@/lib/api.js');
      const api = apiModule.default;
      const token = api.getToken();
      
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Suspended!',
          text: 'User has been suspended successfully',
          timer: 2000,
          showConfirmButton: false
        });
        fetchUsers();
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Could not suspend user. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred'
      });
    }
  };

  const handleActivateUser = async (userId: number) => {
    try {
      const apiModule = await import('@/lib/api.js');
      const api = apiModule.default;
      const token = api.getToken();
      
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/activate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Activated!',
          text: 'User has been activated successfully',
          timer: 2000,
          showConfirmButton: false
        });
        fetchUsers();
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Could not activate user. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error activating user:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred'
      });
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      const apiModule = await import('@/lib/api.js');
      const api = apiModule.default;
      const token = api.getToken();
      
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/role?role=${newRole}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        setShowRoleModal(false);
        await Swal.fire({
          icon: 'success',
          title: 'Role Updated!',
          text: `User role changed to ${newRole} successfully`,
          timer: 2000,
          showConfirmButton: false
        });
        fetchUsers();
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Could not change user role. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error changing role:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred'
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const result = await Swal.fire({
      title: 'Delete User?',
      text: 'This action cannot be undone! User data will be permanently deleted.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete permanently',
      cancelButtonText: 'Cancel',
      focusCancel: true
    });

    if (!result.isConfirmed) return;
    
    try {
      const apiModule = await import('@/lib/api.js');
      const api = apiModule.default;
      const token = api.getToken();
      
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'User has been permanently deleted',
          timer: 2000,
          showConfirmButton: false
        });
        fetchUsers();
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Could not delete user. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred'
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'moderator': return <UserCheck className="w-4 h-4" />;
      case 'premium': return <Crown className="w-4 h-4" />;
      default: return <UserIcon className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all registered farmers and users ({users.length} total)</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md">
          <UserCheck className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <Card className="p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            {searchTerm && (
              <span className="text-sm text-gray-600">
                {filteredUsers.length} results
              </span>
            )}
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </Card>

      {/* User Table */}
      <Card className="shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Farm Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-11 h-11 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-green-700 font-bold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{user.farm_size} acres</p>
                      <p className="text-xs text-gray-500">{user.location}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        className={`flex items-center gap-1 w-fit ${getRoleBadgeColor(user.role)}`}
                      >
                        {getRoleIcon(user.role)}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={user.status === 'active' ? 'default' : 'secondary'}
                        className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedUser(user);
                            setShowViewModal(true);
                          }}
                          className="px-3 py-2 text-sm border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-all hover:shadow-sm flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRoleModal(true);
                          }}
                          className="px-3 py-2 text-sm border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-all hover:shadow-sm flex items-center gap-1.5"
                          title="Change Role"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Role
                        </button>
                        {user.status === 'active' ? (
                          <button 
                            onClick={() => handleSuspendUser(user.id)}
                            className="p-2 text-orange-600 hover:bg-orange-50 border border-orange-300 rounded-lg transition-all hover:shadow-sm"
                            title="Suspend User"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleActivateUser(user.id)}
                            className="p-2 text-green-600 hover:bg-green-50 border border-green-300 rounded-lg transition-all hover:shadow-sm"
                            title="Activate User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition-all hover:shadow-sm"
                          title="Delete User"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Change User Role</h3>
            <p className="text-gray-600 mb-3">
              Change role for <strong className="text-gray-900">{selectedUser.name}</strong>
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-600">
                Current role: <span className="font-semibold text-gray-900">{selectedUser.role}</span>
              </p>
            </div>
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleChangeRole(selectedUser.id, 'user')}
                className={`w-full px-4 py-3 border-2 rounded-xl flex items-center gap-3 transition-all hover:scale-[1.02] ${
                  selectedUser.role === 'user' 
                    ? 'border-gray-400 bg-gray-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-400 hover:shadow-sm'
                }`}
              >
                <UserIcon className="w-5 h-5 text-gray-600" />
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">User</p>
                  <p className="text-xs text-gray-500">Standard user access</p>
                </div>
                {selectedUser.role === 'user' && (
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => handleChangeRole(selectedUser.id, 'premium')}
                className={`w-full px-4 py-3 border-2 rounded-xl flex items-center gap-3 transition-all hover:scale-[1.02] ${
                  selectedUser.role === 'premium' 
                    ? 'border-yellow-400 bg-yellow-50 shadow-md' 
                    : 'border-gray-200 hover:border-yellow-400 hover:shadow-sm'
                }`}
              >
                <Crown className="w-5 h-5 text-yellow-600" />
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">Premium</p>
                  <p className="text-xs text-gray-500">Premium features access</p>
                </div>
                {selectedUser.role === 'premium' && (
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => handleChangeRole(selectedUser.id, 'moderator')}
                className={`w-full px-4 py-3 border-2 rounded-xl flex items-center gap-3 transition-all hover:scale-[1.02] ${
                  selectedUser.role === 'moderator' 
                    ? 'border-blue-400 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-sm'
                }`}
              >
                <UserCheck className="w-5 h-5 text-blue-600" />
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">Moderator</p>
                  <p className="text-xs text-gray-500">Can moderate content</p>
                </div>
                {selectedUser.role === 'moderator' && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => handleChangeRole(selectedUser.id, 'admin')}
                className={`w-full px-4 py-3 border-2 rounded-xl flex items-center gap-3 transition-all hover:scale-[1.02] ${
                  selectedUser.role === 'admin' 
                    ? 'border-purple-400 bg-purple-50 shadow-md' 
                    : 'border-gray-200 hover:border-purple-400 hover:shadow-sm'
                }`}
              >
                <Shield className="w-5 h-5 text-purple-600" />
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">Full system access</p>
                </div>
                {selectedUser.role === 'admin' && (
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                )}
              </button>
            </div>
            <button
              onClick={() => setShowRoleModal(false)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">User Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b-2 border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-green-700 font-bold text-3xl">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedUser.name}</h4>
                  <p className="text-sm text-gray-500">User ID: #{selectedUser.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedUser.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedUser.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Location</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedUser.location}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Farm Size</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedUser.farm_size} acres</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Role</p>
                  <Badge className={`${getRoleBadgeColor(selectedUser.role)} flex items-center gap-1 w-fit`}>
                    {getRoleIcon(selectedUser.role)}
                    {selectedUser.role}
                  </Badge>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Status</p>
                  <Badge 
                    className={selectedUser.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  >
                    {selectedUser.status}
                  </Badge>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Joined</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(selectedUser.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Last Login</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedUser.last_login 
                      ? new Date(selectedUser.last_login).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setShowRoleModal(true);
                }}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 font-medium"
              >
                <Shield className="w-4 h-4" />
                Change Role
              </button>
              {selectedUser.status === 'active' ? (
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleSuspendUser(selectedUser.id);
                  }}
                  className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 font-medium"
                >
                  <UserX className="w-4 h-4" />
                  Suspend
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleActivateUser(selectedUser.id);
                  }}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 font-medium"
                >
                  <UserCheck className="w-4 h-4" />
                  Activate
                </button>
              )}
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
