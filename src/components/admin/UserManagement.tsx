/**
 * UserManagement Component
 * 
 * Admin panel for managing users - promote, demote, activate/deactivate
 */

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { adminLogger } from '../../services/adminLogger';

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'user' | 'host' | 'admin';
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email || '',
          displayName: data.displayName || data.name || '',
          role: data.role || 'user',
          isActive: data.isActive !== undefined ? data.isActive : true,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
          // Don't spread all data to avoid object rendering issues
        };
      }) as User[];

      // Sort by creation date, newest first, or by email if no date
      usersData.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        }
        // Fallback to email sorting if no dates
        return a.email.localeCompare(b.email);
      });


      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'host' | 'admin') => {
    setUpdating(userId);
    try {
      const targetUser = users.find(u => u.id === userId);

      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date()
      });

      // Log admin action
      if (currentUser && targetUser) {
        await adminLogger.logUserRoleUpdate(
          currentUser.uid,
          currentUser.email || 'admin@tickzy.com',
          userId,
          targetUser.email,
          targetUser.role,
          newRole,
          targetUser.displayName
        );
      }

      // Update local state
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));


    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setUpdating(null);
    }
  };

  const deleteUser = async (userId: string) => {
    const targetUser = users.find(user => user.id === userId);
    if (!targetUser) {
      alert('User not found');
      return;
    }

    // Confirmation dialog
    const confirmDelete = window.confirm(
      `⚠️ PERMANENT DELETION WARNING ⚠️\n\n` +
      `This will PERMANENTLY DELETE:\n` +
      `• User: ${targetUser.displayName || targetUser.email}\n` +
      `• All their data from Firebase\n` +
      `• All their events, bookings, and history\n` +
      `• This action CANNOT be undone!\n\n` +
      `Are you absolutely sure you want to delete this user?`
    );

    if (!confirmDelete) return;

    // Second confirmation for safety
    const doubleConfirm = window.confirm(
      `🚨 FINAL CONFIRMATION 🚨\n\n` +
      `You are about to PERMANENTLY DELETE ${targetUser.email}\n\n` +
      `Type "DELETE" in the next prompt to confirm.`
    );

    if (!doubleConfirm) return;

    const deleteConfirmation = prompt(
      `Type "DELETE" (in capital letters) to confirm permanent deletion of ${targetUser.email}:`
    );

    if (deleteConfirmation !== 'DELETE') {
      alert('Deletion cancelled - confirmation text did not match.');
      return;
    }

    setUpdating(userId);
    try {
      console.log('🗑️ Starting complete user deletion for:', targetUser.email);

      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', userId));
      console.log('✅ User document deleted from Firestore');

      // Log the deletion action
      if (currentUser) {
        await adminLogger.logAction({
          adminId: currentUser.uid,
          adminEmail: currentUser.email || 'admin@tickzy.com',
          action: 'deleted',
          targetType: 'user',
          targetId: userId,
          targetName: targetUser.displayName || targetUser.email,
          details: `User account permanently deleted: ${targetUser.email}. All user data removed from system.`,
          metadata: {
            userEmail: targetUser.email,
            userName: targetUser.displayName,
            userRole: targetUser.role,
            deletionReason: 'Admin deactivation - complete removal',
            deletedAt: new Date().toISOString()
          }
        });
      }

      // Remove from local state immediately (real-time UI update)
      setUsers(users.filter(user => user.id !== userId));

      alert(`✅ User ${targetUser.email} has been permanently deleted from the system.`);
      console.log('🎉 User deletion completed successfully');

    } catch (error: any) {
      console.error('❌ Error deleting user:', error);
      alert(`Failed to delete user: ${error.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-600 text-white';
      case 'host': return 'bg-green-600 text-white';
      default: return 'bg-purple-600 text-white';
    }
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <span className="ml-4 text-white">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="flex space-x-2">
          <span className="text-gray-400 text-sm">
            {users.length} users found
          </span>
          <button
            onClick={fetchUsers}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-neutral-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white font-medium">
                        {user.displayName || user.name || 'No Name'}
                      </div>
                      <div className="text-gray-400 text-sm">{user.email}</div>
                      <div className="text-gray-500 text-xs">ID: {user.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {/* Role Management */}
                      {user.role !== 'admin' && (
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as 'user' | 'host' | 'admin')}
                          disabled={updating === user.id}
                          className="bg-neutral-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
                        >
                          <option value="user">User</option>
                          <option value="host">Host</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                      
                      {/* Delete User */}
                      <button
                        onClick={() => deleteUser(user.id)}
                        disabled={updating === user.id}
                        className="px-3 py-1 rounded text-xs font-medium transition-colors duration-200 bg-red-600 hover:bg-red-700 text-white"
                      >
                        {updating === user.id ? 'Deleting...' : 'Delete User'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Users Found</h3>
          <p className="text-gray-400">No users are registered in the system.</p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
