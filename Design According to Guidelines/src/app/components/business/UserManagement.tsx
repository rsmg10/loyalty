import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Mail, Shield } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Modal } from '../ui/Modal';

export function UserManagement() {
  const [showAddModal, setShowAddModal] = useState(false);

  const users = [
    { id: 1, name: 'John Smith', email: 'john@bluebottle.com', role: 'Owner', status: 'Active', lastActive: '2 hours ago' },
    { id: 2, name: 'Lisa Anderson', email: 'lisa@bluebottle.com', role: 'Manager', status: 'Active', lastActive: '5 hours ago' },
    { id: 3, name: 'Tom Wilson', email: 'tom@bluebottle.com', role: 'Staff', status: 'Active', lastActive: '1 day ago' },
    { id: 4, name: 'Kate Brown', email: 'kate@bluebottle.com', role: 'Staff', status: 'Active', lastActive: '3 days ago' },
    { id: 5, name: 'Mike Davis', email: 'mike@bluebottle.com', role: 'Staff', status: 'Inactive', lastActive: '2 weeks ago' }
  ];

  const getRoleBadge = (role: string) => {
    if (role === 'Owner') return <Badge variant="purple">Owner</Badge>;
    if (role === 'Manager') return <Badge variant="info">Manager</Badge>;
    return <Badge variant="gray">Staff</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === 'Active'
      ? <Badge variant="success">Active</Badge>
      : <Badge variant="gray">Inactive</Badge>;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage team members and their permissions</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                icon={<Search size={20} />}
              />
            </div>
            <Button variant="outline">Filters</Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-gray-600">{user.lastActive}</TableCell>
                  <TableCell className="text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical size={20} className="text-gray-600" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary">Send Invitation</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Full Name" placeholder="Enter full name" />
          <Input label="Email Address" type="email" placeholder="user@example.com" icon={<Mail size={20} />} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="space-y-2">
              {['Owner', 'Manager', 'Staff'].map((role) => (
                <label key={role} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="role" value={role} className="text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{role}</p>
                    <p className="text-sm text-gray-500">
                      {role === 'Owner' && 'Full access to all features'}
                      {role === 'Manager' && 'Manage programs, offers, and customers'}
                      {role === 'Staff' && 'Validate rewards and view customer data'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
