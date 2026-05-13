import React from 'react';
import { ArrowLeft, MapPin, Clock, Phone, Star, Award, ChevronRight } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function BusinessProfile({ onNavigate, onBack }: { onNavigate: (view: string) => void; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 via-violet-600 to-purple-700 text-white px-6 pt-12 pb-6 shadow-lg">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mb-5 hover:bg-white/30 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl shadow-lg flex-shrink-0">
            ☕
          </div>
          <div>
            <h1 className="text-xl font-bold">Costa Coffee</h1>
            <div className="flex items-center gap-2 mt-1">
              <Star className="text-amber-300 fill-amber-300" size={14} />
              <span className="text-sm text-white/90 font-medium">4.8</span>
              <span className="text-indigo-300 text-sm">(234 reviews)</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={12} className="text-indigo-300" />
              <span className="text-xs text-indigo-200">0.3 km · Tripoli, Libya</span>
            </div>
          </div>
        </div>
      </div>

      {/* Thin accent line */}
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600" />

      {/* Business Info Card */}
      <div className="px-5 pt-5">
        <Card className="border border-slate-200 shadow-sm mb-4">
          <CardBody className="py-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              Specialty coffee roaster and retailer focusing on freshly roasted, single-origin beans.
              Join our loyalty program and earn rewards with every purchase!
            </p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-slate-50 rounded-xl px-3 py-2.5">
                <Clock size={16} className="text-indigo-500 flex-shrink-0" />
                <span>7:00 AM – 8:00 PM</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-slate-50 rounded-xl px-3 py-2.5">
                <Phone size={16} className="text-indigo-500 flex-shrink-0" />
                <span>+218 91 234 5678</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Loyalty Program */}
        <h2 className="text-base font-semibold text-gray-800 mb-3">Loyalty Program</h2>
        <Card className="border border-indigo-200 bg-indigo-50 shadow-sm mb-4">
          <CardBody className="py-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <Award className="text-white" size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Coffee Rewards</h3>
                <p className="text-sm text-gray-600 mt-0.5">Buy 10 coffees, get 1 free!</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="success">Active</Badge>
                  <span className="text-xs text-gray-500">234 members</span>
                </div>
              </div>
            </div>
            <Button
              variant="primary"
              fullWidth
              className="mt-4 !bg-gradient-to-r !from-indigo-600 !to-violet-600"
              onClick={() => onNavigate('loyalty-card')}
            >
              Join Program
            </Button>
          </CardBody>
        </Card>

        {/* Available Rewards */}
        <h2 className="text-base font-semibold text-gray-800 mb-3">Available Rewards</h2>
        <div className="space-y-2">
          {[
            { name: 'Free Coffee', visits: 10, description: 'Any size coffee drink' },
            { name: 'Free Pastry', visits: 6, description: 'Choose from our selection' },
            { name: '20% Off', visits: 15, description: 'Your entire order' }
          ].map((reward, idx) => (
            <Card key={idx} hoverable className="border border-slate-200 hover:border-indigo-200 shadow-sm transition-all">
              <CardBody className="py-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{reward.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{reward.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" size="sm">{reward.visits} visits</Badge>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
