import React, { useState } from 'react';
import { Search, Filter, MoreVertical, User, Building2, Shield } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';

export function AdminUserManagement() {
  const [userType, setUserType] = useState('All');

  const users = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', type: 'Customer', business: '-', role: 'Customer', status: 'Active', joined: '2023-01-15' },
    { id: 2, name: 'John Smith', email: 'john@bluebottle.com', type: 'Business', business: 'Blue Bottle Coffee', role: 'Owner', status: 'Active', joined: '2023-02-20' },
    { id: 3, name: 'Lisa Anderson', email: 'lisa@bluebottle.com', type: 'Business', business: 'Blue Bottle Coffee', role: 'Manager', status: 'Active', joined: '2023-03-10' },
    { id: 4, name: 'Mike Chen', email: 'mike@email.com', type: 'Customer', business: '-', role: 'Customer', status: 'Active', joined: '2023-02-05' },
    { id: 5, name: 'Admin User', email: 'admin@platform.com', type: 'Admin', business: 'Platform', role: 'System Admin', status: 'Active', joined: '2022-12-01' },
    { id: 6, name: 'Tom Wilson', email: 'tom@sweetgreen.com', type: 'Business', business: 'Sweetgreen', role: 'Staff', status: 'Active', joined: '2023-04-12' }
  ];

  const filteredUsers = userType === 'All' ? users : users.filter(u => u.type === userType);

  const getUserTypeBadge = (type: string) => {
    if (type === 'Customer') return <Badge variant="default">Customer</Badge>;
    if (type === 'Business') return <Badge variant="info">Business</Badge>;
    return <Badge variant="purple">Admin</Badge>;
  };

  const getRoleBadge = (role: string) => {
    if (role === 'System Admin') return <Badge variant="purple">System Admin</Badge>;
    if (role === 'Owner') return <Badge variant="purple">Owner</Badge>;
    if (role === 'Manager') return <Badge variant="info">Manager</Badge>;
    if (role === 'Staff') return <Badge variant="gray">Staff</Badge>;
    return <Badge variant="default">Customer</Badge>;
  };

  const getUserIcon = (type: string) => {
    if (type === 'Customer') return <User className="text-blue-500" size={20} />;
    if (type === 'Business') return <Building2 className="text-green-500" size={20} />;
    return <Shield className="text-purple-500" size={20} />;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage all users across the platform</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Total Users', value: '89,432', icon: User, color: 'bg-blue-500' },
          { label: 'Customers', value: '85,234', icon: User, color: 'bg-green-500' },
          { label: 'Business Users', value: '4,189', icon: Building2, color: 'bg-orange-500' },
          { label: 'Admins', value: '9', icon: Shield, color: 'bg-purple-500' }
        ].map((stat, idx) => (
          <Card key={idx}>
            <CardBody className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="text-white" size={20} />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['All', 'Customers', 'Business', 'Admin'].map((type) => (
          <button
            key={type}
            onClick={() => setUserType(type)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              userType === type
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users by name or email..."
                icon={<Search size={20} />}
              />
            </div>
            <Button variant="outline">
              <Filter size={20} />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell>{getUserTypeBadge(user.type)}</TableCell>
                  <TableCell className="text-gray-600">{user.business}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <Badge variant="success">Active</Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{new Date(user.joined).toLocaleDateString()}</TableCell>
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
    </div>
  );
}
