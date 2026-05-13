import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Building2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';

export function TenantManagement() {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const tenants = [
    { id: 1, name: 'Starbucks Coffee', industry: 'Coffee', plan: 'Enterprise', users: 1234, customers: 45678, status: 'Active', joined: '2023-01-15' },
    { id: 2, name: 'Blue Bottle Coffee', industry: 'Coffee', plan: 'Professional', users: 234, customers: 8901, status: 'Active', joined: '2023-02-20' },
    { id: 3, name: 'Sweetgreen', industry: 'Restaurant', plan: 'Professional', users: 567, customers: 12345, status: 'Active', joined: '2023-03-10' },
    { id: 4, name: 'Chipotle', industry: 'Restaurant', plan: 'Enterprise', users: 2341, customers: 89012, status: 'Active', joined: '2023-01-05' },
    { id: 5, name: 'The Cheesecake Factory', industry: 'Dessert', plan: 'Professional', users: 456, customers: 6789, status: 'Active', joined: '2023-04-12' },
    { id: 6, name: 'Corner Bakery', industry: 'Bakery', plan: 'Starter', users: 12, customers: 345, status: 'Suspended', joined: '2023-05-22' }
  ];

  const getPlanBadge = (plan: string) => {
    if (plan === 'Enterprise') return <Badge variant="purple">Enterprise</Badge>;
    if (plan === 'Professional') return <Badge variant="info">Professional</Badge>;
    return <Badge variant="gray">Starter</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Active') return <Badge variant="success">Active</Badge>;
    if (status === 'Suspended') return <Badge variant="danger">Suspended</Badge>;
    return <Badge variant="gray">{status}</Badge>;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
        <p className="text-gray-600 mt-1">Manage all businesses on the platform</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Total Tenants', value: '1,847', color: 'bg-blue-500' },
          { label: 'Active', value: '1,823', color: 'bg-green-500' },
          { label: 'Trial', value: '18', color: 'bg-yellow-500' },
          { label: 'Suspended', value: '6', color: 'bg-red-500' }
        ].map((stat, idx) => (
          <Card key={idx}>
            <CardBody className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tenants..."
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
                <TableHead>Business</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id} onClick={() => {}}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Building2 className="text-white" size={20} />
                      </div>
                      <span className="font-medium">{tenant.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{tenant.industry}</TableCell>
                  <TableCell>{getPlanBadge(tenant.plan)}</TableCell>
                  <TableCell className="text-gray-600">{tenant.users.toLocaleString()}</TableCell>
                  <TableCell className="text-gray-600">{tenant.customers.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                  <TableCell className="text-gray-600">{new Date(tenant.joined).toLocaleDateString()}</TableCell>
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
