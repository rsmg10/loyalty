import React from 'react';
import { ArrowLeft, Gift, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function LoyaltyCard({ onNavigate, onBack }: { onNavigate: (view: string) => void; onBack: () => void }) {
  const progress = 7;
  const total = 10;
  const stamps = Array.from({ length: total }, (_, i) => i < progress);

  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 via-violet-600 to-purple-700 text-white px-6 pt-12 pb-6 shadow-lg">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mb-5 hover:bg-white/30 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Costa Coffee</h1>
        <p className="text-indigo-200 text-sm mt-1">Coffee Rewards Program · Tripoli</p>
      </div>

      {/* Thin accent line */}
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600" />

      {/* Loyalty Card */}
      <div className="px-5 pt-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          {/* Progress Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-3xl mb-3 shadow-lg">
              ☕
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{progress} <span className="text-slate-400 text-xl">/ {total}</span></h2>
            <p className="text-gray-500 text-sm mt-1">{total - progress} more stamps for your free coffee!</p>
          </div>

          {/* Stamps Grid */}
          <div className="grid grid-cols-5 gap-2.5 mb-6">
            {stamps.map((filled, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all ${
                  filled
                    ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-300'
                }`}
              >
                {filled ? <CheckCircle size={22} strokeWidth={2.5} /> : <span className="text-lg">○</span>}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>Progress</span>
              <span>{Math.round((progress / total) * 100)}%</span>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500"
                style={{ width: `${(progress / total) * 100}%` }}
              />
            </div>
          </div>

          <Button
            variant="primary"
            fullWidth
            className="!bg-gradient-to-r !from-indigo-600 !to-violet-600"
            onClick={() => onNavigate('rewards')}
          >
            View Available Rewards
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mt-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: TrendingUp, label: 'Total Visits', value: '7', color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { icon: Gift, label: 'Rewards Earned', value: '3', color: 'text-violet-600', bg: 'bg-violet-50' },
            { icon: Calendar, label: 'Days Active', value: '14', color: 'text-teal-600', bg: 'bg-teal-50' },
          ].map((stat, idx) => (
            <Card key={idx} className="border border-slate-200 shadow-sm">
              <CardBody className="py-4 text-center">
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className={stat.color} size={20} />
                </div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-5 mt-4">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Recent Activity</h2>
        <div className="space-y-2">
          {[
            { date: 'Today, 9:30 AM', action: 'Stamp earned', points: '+1' },
            { date: 'Yesterday, 2:15 PM', action: 'Stamp earned', points: '+1' },
            { date: '2 days ago', action: 'Reward redeemed', points: '-10' }
          ].map((activity, idx) => (
            <Card key={idx} className="border border-slate-200 shadow-sm">
              <CardBody className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{activity.date}</p>
                  </div>
                  <Badge variant={activity.points.startsWith('+') ? 'success' : 'gray'} size="sm">
                    {activity.points}
                  </Badge>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
