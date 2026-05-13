import React from 'react';
import { Building2, Users, TrendingUp, Activity, ArrowUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';

export function PlatformDashboard() {
  const stats = [
    { icon: Building2, label: 'Total Businesses', value: '1,847', change: '+127', trend: 'up', color: 'bg-blue-500' },
    { icon: Users, label: 'Total Users', value: '89,432', change: '+3,241', trend: 'up', color: 'bg-green-500' },
    { icon: TrendingUp, label: 'Monthly Active', value: '67,891', change: '+12%', trend: 'up', color: 'bg-purple-500' },
    { icon: Activity, label: 'Redemptions Today', value: '12,456', change: '+8%', trend: 'up', color: 'bg-orange-500' }
  ];

  const platformHealth = [
    { service: 'API Gateway', status: 'operational', uptime: '99.99%', responseTime: '45ms' },
    { service: 'Database', status: 'operational', uptime: '99.98%', responseTime: '12ms' },
    { service: 'Authentication', status: 'operational', uptime: '100%', responseTime: '23ms' },
    { service: 'CDN', status: 'degraded', uptime: '98.5%', responseTime: '156ms' }
  ];

  const recentTenants = [
    { name: 'Starbucks Coffee', plan: 'Enterprise', users: 1234, status: 'Active', joined: '2 days ago' },
    { name: 'Sweetgreen', plan: 'Professional', users: 567, status: 'Active', joined: '5 days ago' },
    { name: 'Chipotle', plan: 'Enterprise', users: 2341, status: 'Active', joined: '1 week ago' }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="text-gray-600 mt-1">System-wide overview and health metrics</p>
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
                    <ArrowUp className="text-green-600" size={16} />
                    <span className="text-sm font-medium text-green-600">{stat.change}</span>
                    <span className="text-sm text-gray-500">this month</span>
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
        {/* Platform Health */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Platform Health</h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-gray-200">
                {platformHealth.map((service, idx) => (
                  <div key={idx} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {service.status === 'operational' ? (
                          <CheckCircle className="text-green-500" size={20} />
                        ) : (
                          <AlertCircle className="text-yellow-500" size={20} />
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">{service.service}</h3>
                          <Badge
                            variant={service.status === 'operational' ? 'success' : 'warning'}
                            size="sm"
                            className="mt-1"
                          >
                            {service.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{service.uptime}</p>
                        <p className="text-xs text-gray-500">uptime</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Response Time: <span className="font-medium text-gray-900">{service.responseTime}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recent Tenants */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Recent Tenants</h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-gray-200">
                {recentTenants.map((tenant, idx) => (
                  <div key={idx} className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <h4 className="font-medium text-gray-900">{tenant.name}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="purple" size="sm">{tenant.plan}</Badge>
                      <Badge variant="success" size="sm">{tenant.status}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>{tenant.users.toLocaleString()} users</p>
                      <p className="text-xs text-gray-500 mt-1">{tenant.joined}</p>
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
