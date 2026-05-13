import React from 'react';
import { Users, Gift, TrendingUp, Award, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';

export function BusinessDashboard() {
  const stats = [
    { icon: Users, label: 'Total Customers', value: '1,234', change: '+12%', trend: 'up', color: 'bg-blue-500' },
    { icon: Award, label: 'Active Programs', value: '3', change: '+1', trend: 'up', color: 'bg-purple-500' },
    { icon: Gift, label: 'Rewards Redeemed', value: '456', change: '+8%', trend: 'up', color: 'bg-green-500' },
    { icon: TrendingUp, label: 'Monthly Visits', value: '2,891', change: '-3%', trend: 'down', color: 'bg-orange-500' }
  ];

  const recentActivity = [
    { customer: 'Sarah Johnson', action: 'Redeemed Free Coffee', time: '5 min ago', status: 'completed' },
    { customer: 'Mike Chen', action: 'Earned stamp', time: '12 min ago', status: 'active' },
    { customer: 'Emma Davis', action: 'Joined Coffee Rewards', time: '23 min ago', status: 'active' },
    { customer: 'Alex Turner', action: 'Redeemed 20% Off', time: '1 hour ago', status: 'completed' }
  ];

  const topCustomers = [
    { name: 'Sarah Johnson', visits: 47, spent: '$423', lastVisit: '2 days ago' },
    { name: 'Mike Chen', visits: 38, spent: '$345', lastVisit: '1 day ago' },
    { name: 'Emma Davis', visits: 32, spent: '$289', lastVisit: 'Today' }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your loyalty program.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardBody className="py-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUp className="text-green-600" size={16} />
                    ) : (
                      <ArrowDown className="text-red-600" size={16} />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-gray-200">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.customer}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{activity.action}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{activity.time}</p>
                        <Badge
                          variant={activity.status === 'completed' ? 'success' : 'info'}
                          size="sm"
                          className="mt-1"
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Top Customers */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Top Customers</h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-gray-200">
                {topCustomers.map((customer, idx) => (
                  <div key={idx} className="px-6 py-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{customer.name}</p>
                        <p className="text-xs text-gray-500">Last: {customer.lastVisit}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{customer.visits} visits</span>
                      <span className="font-medium text-gray-900">{customer.spent}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
