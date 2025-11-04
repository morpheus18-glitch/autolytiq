import React, { useState } from 'react';
import { User, Phone, Mail, Calendar, DollarSign, MessageSquare, Clock, Activity, ChevronRight, Star, TrendingUp, FileText, Bell } from 'lucide-react';

const CRMCustomerDashboard = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const customers = [
    {
      id: 1,
      name: 'Sarah Martinez',
      email: 'sarah.m@email.com',
      phone: '(555) 234-5678',
      avatar: 'SM',
      status: 'Hot Lead',
      source: 'Website',
      lastContact: '2 hours ago',
      nextFollowUp: 'Today, 3:00 PM',
      lifetimeValue: 45000,
      score: 92,
      vehicles: [
        { year: 2019, make: 'Honda', model: 'Accord', status: 'Owned' }
      ],
      interests: ['2024 Toyota Camry XSE', '2024 Honda Accord Sport'],
      notes: 'Looking to upgrade. Prefers hybrid options. Budget: $30-35k',
      interactions: [
        { type: 'email', date: '2 hours ago', subject: 'Follow-up on test drive' },
        { type: 'call', date: 'Yesterday', subject: 'Discussed financing options' },
        { type: 'visit', date: '3 days ago', subject: 'Test drove Camry XSE' }
      ],
      deals: [
        { id: 'DL-2847', vehicle: '2024 Toyota Camry', status: 'In Progress', value: 32500 }
      ]
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'mchen@business.com',
      phone: '(555) 789-0123',
      avatar: 'MC',
      status: 'Warm Lead',
      source: 'Referral',
      lastContact: '1 day ago',
      nextFollowUp: 'Tomorrow, 10:00 AM',
      lifetimeValue: 78000,
      score: 78,
      vehicles: [
        { year: 2021, make: 'Tesla', model: 'Model 3', status: 'Owned' },
        { year: 2018, make: 'BMW', model: '3 Series', status: 'Traded' }
      ],
      interests: ['2024 Tesla Model Y', '2024 BMW X5'],
      notes: 'Business owner. Looking for fleet vehicles. Needs commercial financing.',
      interactions: [
        { type: 'email', date: '1 day ago', subject: 'Fleet pricing inquiry' },
        { type: 'call', date: '3 days ago', subject: 'Initial consultation' }
      ],
      deals: []
    },
    {
      id: 3,
      name: 'Jennifer Williams',
      email: 'jwilliams@email.com',
      phone: '(555) 456-7890',
      avatar: 'JW',
      status: 'Cold Lead',
      source: 'Walk-in',
      lastContact: '1 week ago',
      nextFollowUp: 'Next week',
      lifetimeValue: 32000,
      score: 45,
      vehicles: [],
      interests: ['2024 Ford F-150', '2024 Chevrolet Silverado'],
      notes: 'First-time truck buyer. Needs education on features and capabilities.',
      interactions: [
        { type: 'visit', date: '1 week ago', subject: 'Browsed truck inventory' }
      ],
      deals: []
    }
  ];

  const CustomerCard = ({ customer }) => (
    <div 
      onClick={() => setSelectedCustomer(customer)}
      className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
            {customer.avatar}
          </div>
          <div>
            <h3 className="font-bold">{customer.name}</h3>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          customer.status === 'Hot Lead' ? 'bg-red-100 text-red-700' :
          customer.status === 'Warm Lead' ? 'bg-orange-100 text-orange-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {customer.status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Last contact: {customer.lastContact}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Next follow-up: {customer.nextFollowUp}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-semibold">Score: {customer.score}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
          <DollarSign className="w-4 h-4" />
          {(customer.lifetimeValue / 1000).toFixed(0)}K LTV
        </div>
      </div>
    </div>
  );

  const InteractionTimeline = ({ interactions }) => (
    <div className="space-y-4">
      {interactions.map((interaction, index) => (
        <div key={index} className="flex gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            interaction.type === 'email' ? 'bg-blue-100' :
            interaction.type === 'call' ? 'bg-green-100' :
            'bg-purple-100'
          }`}>
            {interaction.type === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
            {interaction.type === 'call' && <Phone className="w-5 h-5 text-green-600" />}
            {interaction.type === 'visit' && <User className="w-5 h-5 text-purple-600" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold capitalize">{interaction.type}</span>
              <span className="text-sm text-gray-500">{interaction.date}</span>
            </div>
            <p className="text-sm text-gray-600">{interaction.subject}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Customer CRM</h1>
            <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">127</div>
              <div className="text-xs text-indigo-100">Total Leads</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">23</div>
              <div className="text-xs text-indigo-100">Hot Leads</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">8</div>
              <div className="text-xs text-indigo-100">Due Today</div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-medium whitespace-nowrap">
              All Customers
            </button>
            <button className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium whitespace-nowrap hover:bg-white/20">
              Hot Leads
            </button>
            <button className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium whitespace-nowrap hover:bg-white/20">
              Follow-up Today
            </button>
            <button className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium whitespace-nowrap hover:bg-white/20">
              Active Deals
            </button>
          </div>
        </div>
      </div>

      {/* Customer List */}
      {!selectedCustomer && (
        <div className="px-4 py-4">
          <div className="space-y-3">
            {customers.map(customer => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        </div>
      )}

      {/* Customer Detail View */}
      {selectedCustomer && (
        <div className="px-4 py-4">
          {/* Back Button */}
          <button 
            onClick={() => setSelectedCustomer(null)}
            className="flex items-center gap-2 text-indigo-600 font-medium mb-4"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to Customers
          </button>

          {/* Customer Header Card */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {selectedCustomer.avatar}
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">{selectedCustomer.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{selectedCustomer.email}</span>
                    <span>•</span>
                    <span>{selectedCustomer.phone}</span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                selectedCustomer.status === 'Hot Lead' ? 'bg-red-100 text-red-700' :
                selectedCustomer.status === 'Warm Lead' ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {selectedCustomer.status}
              </span>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${(selectedCustomer.lifetimeValue / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-gray-600">Lifetime Value</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{selectedCustomer.score}</div>
                <div className="text-xs text-gray-600">Lead Score</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedCustomer.vehicles.length}
                </div>
                <div className="text-xs text-gray-600">Vehicles Owned</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'activity'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setActiveTab('deals')}
                className={`flex-1 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'deals'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600'
                }`}
              >
                Deals
              </button>
            </div>

            <div className="p-5">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Current Interests */}
                  <div>
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-600" />
                      Current Interests
                    </h3>
                    <div className="space-y-2">
                      {selectedCustomer.interests.map((interest, index) => (
                        <div key={index} className="p-3 bg-indigo-50 rounded-lg">
                          <div className="font-medium">{interest}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vehicles Owned */}
                  <div>
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Vehicle History
                    </h3>
                    <div className="space-y-2">
                      {selectedCustomer.vehicles.map((vehicle, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">{vehicle.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-600" />
                      Notes
                    </h3>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-gray-700">{selectedCustomer.notes}</p>
                    </div>
                  </div>

                  {/* Source Info */}
                  <div>
                    <h3 className="font-bold mb-3">Lead Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Source</span>
                        <span className="font-medium">{selectedCustomer.source}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Last Contact</span>
                        <span className="font-medium">{selectedCustomer.lastContact}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Next Follow-up</span>
                        <span className="font-medium text-indigo-600">{selectedCustomer.nextFollowUp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div>
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    Interaction Timeline
                  </h3>
                  <InteractionTimeline interactions={selectedCustomer.interactions} />
                </div>
              )}

              {activeTab === 'deals' && (
                <div>
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                    Active Deals
                  </h3>
                  {selectedCustomer.deals.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCustomer.deals.map((deal, index) => (
                        <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-bold text-lg">{deal.vehicle}</div>
                              <div className="text-sm text-gray-600">Deal ID: {deal.id}</div>
                            </div>
                            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">
                              {deal.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-green-200">
                            <span className="text-gray-600">Deal Value</span>
                            <span className="text-xl font-bold text-green-600">
                              ${deal.value.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No active deals</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              Call
            </button>
            <button className="py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button className="py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
              Schedule Follow-up
            </button>
            <button className="py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
              Create Deal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMCustomerDashboard;
