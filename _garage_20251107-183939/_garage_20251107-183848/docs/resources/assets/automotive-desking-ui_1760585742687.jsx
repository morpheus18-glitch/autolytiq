import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Car, User, DollarSign, FileText, Calculator, CheckCircle, Edit2, Send } from 'lucide-react';

const MobileDeskingInterface = () => {
  const [activeTab, setActiveTab] = useState('deal');
  const [expandedSections, setExpandedSections] = useState({
    customer: true,
    vehicle: true,
    tradein: false,
    payment: true,
    fi: false
  });
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [dealData, setDealData] = useState({
    customerName: 'Sarah Martinez',
    vehicleYear: '2024',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry XSE',
    vehiclePrice: 32500,
    tradeYear: '2019',
    tradeMake: 'Honda',
    tradeModel: 'Accord',
    tradeValue: 15000,
    tradePayoff: 12500,
    downPayment: 5000,
    term: 72,
    apr: 5.99,
    monthlyPayment: 0
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const calculatePayment = () => {
    const principal = dealData.vehiclePrice - dealData.tradeValue + dealData.tradePayoff - dealData.downPayment;
    const monthlyRate = dealData.apr / 100 / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, dealData.term)) / 
                    (Math.pow(1 + monthlyRate, dealData.term) - 1);
    setDealData(prev => ({ ...prev, monthlyPayment: Math.round(payment) }));
  };

  React.useEffect(() => {
    calculatePayment();
  }, [dealData.vehiclePrice, dealData.tradeValue, dealData.tradePayoff, dealData.downPayment, dealData.term, dealData.apr]);

  const CollapsibleSection = ({ title, icon: Icon, isExpanded, onToggle, children, badge }) => (
    <div className="bg-white rounded-lg shadow-sm mb-3 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {badge && <span className="text-xs text-gray-500">{badge}</span>}
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {isExpanded && (
        <div className="p-4 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );

  const InputField = ({ label, value, onChange, type = "text", prefix, suffix }) => (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">Deal Worksheet</h1>
            <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 text-sm">
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="text-blue-100 text-xs">Deal ID</div>
              <div className="font-semibold">#DL-2847</div>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="text-blue-100 text-xs">Status</div>
              <div className="font-semibold">In Progress</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-white/20">
          <button
            onClick={() => setActiveTab('deal')}
            className={`flex-1 px-4 py-3 font-medium transition-all ${
              activeTab === 'deal' 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            Deal Structure
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 px-4 py-3 font-medium transition-all ${
              activeTab === 'summary' 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            Summary
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 py-4 pb-24">
        {activeTab === 'deal' && (
          <>
            {/* Customer Info */}
            <CollapsibleSection
              title="Customer Information"
              icon={User}
              isExpanded={expandedSections.customer}
              onToggle={() => toggleSection('customer')}
              badge="Sarah Martinez"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Name</span>
                  <span className="font-medium">{dealData.customerName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Phone</span>
                  <span className="font-medium">(555) 234-5678</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Email</span>
                  <span className="font-medium text-sm">sarah.m@email.com</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Credit Score</span>
                  <span className="font-semibold text-green-600">742 - Excellent</span>
                </div>
              </div>
            </CollapsibleSection>

            {/* Vehicle Selection */}
            <CollapsibleSection
              title="Vehicle Selection"
              icon={Car}
              isExpanded={expandedSections.vehicle}
              onToggle={() => toggleSection('vehicle')}
              badge={`${dealData.vehicleYear} ${dealData.vehicleMake} ${dealData.vehicleModel}`}
            >
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 mb-4 text-white">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-2xl font-bold">{dealData.vehicleYear} {dealData.vehicleMake}</div>
                    <div className="text-lg text-gray-300">{dealData.vehicleModel}</div>
                  </div>
                  <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                    <Car className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex gap-3 text-sm text-gray-300">
                  <span>Stock: #A7845</span>
                  <span>•</span>
                  <span>VIN: 4T1B***45</span>
                </div>
              </div>

              <InputField
                label="Selling Price"
                type="number"
                prefix="$"
                value={dealData.vehiclePrice}
                onChange={(e) => setDealData(prev => ({ ...prev, vehiclePrice: Number(e.target.value) }))}
              />
              
              <div className="grid grid-cols-3 gap-2 mt-3">
                <button className="py-2 px-3 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  MSRP
                </button>
                <button className="py-2 px-3 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Invoice
                </button>
                <button className="py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Market
                </button>
              </div>
            </CollapsibleSection>

            {/* Trade-In */}
            <CollapsibleSection
              title="Trade-In Vehicle"
              icon={Car}
              isExpanded={expandedSections.tradein}
              onToggle={() => toggleSection('tradein')}
              badge={dealData.tradeYear ? `${dealData.tradeYear} ${dealData.tradeMake} ${dealData.tradeModel}` : 'No trade'}
            >
              <div className="grid grid-cols-3 gap-2 mb-4">
                <InputField
                  label="Year"
                  value={dealData.tradeYear}
                  onChange={(e) => setDealData(prev => ({ ...prev, tradeYear: e.target.value }))}
                />
                <InputField
                  label="Make"
                  value={dealData.tradeMake}
                  onChange={(e) => setDealData(prev => ({ ...prev, tradeMake: e.target.value }))}
                />
                <InputField
                  label="Model"
                  value={dealData.tradeModel}
                  onChange={(e) => setDealData(prev => ({ ...prev, tradeModel: e.target.value }))}
                />
              </div>

              <InputField
                label="ACV (Actual Cash Value)"
                type="number"
                prefix="$"
                value={dealData.tradeValue}
                onChange={(e) => setDealData(prev => ({ ...prev, tradeValue: Number(e.target.value) }))}
              />

              <InputField
                label="Payoff Amount"
                type="number"
                prefix="$"
                value={dealData.tradePayoff}
                onChange={(e) => setDealData(prev => ({ ...prev, tradePayoff: Number(e.target.value) }))}
              />

              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Trade Equity</span>
                  <span className={`font-bold ${dealData.tradeValue - dealData.tradePayoff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(dealData.tradeValue - dealData.tradePayoff).toLocaleString()}
                  </span>
                </div>
              </div>
            </CollapsibleSection>

            {/* Payment Calculator */}
            <CollapsibleSection
              title="Payment Structure"
              icon={Calculator}
              isExpanded={expandedSections.payment}
              onToggle={() => toggleSection('payment')}
              badge={`$${dealData.monthlyPayment}/mo`}
            >
              <InputField
                label="Down Payment"
                type="number"
                prefix="$"
                value={dealData.downPayment}
                onChange={(e) => setDealData(prev => ({ ...prev, downPayment: Number(e.target.value) }))}
              />

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Term"
                  type="number"
                  suffix="months"
                  value={dealData.term}
                  onChange={(e) => setDealData(prev => ({ ...prev, term: Number(e.target.value) }))}
                />
                <InputField
                  label="APR"
                  type="number"
                  suffix="%"
                  value={dealData.apr}
                  onChange={(e) => setDealData(prev => ({ ...prev, apr: Number(e.target.value) }))}
                />
              </div>

              <div className="mt-4 p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl text-white">
                <div className="text-sm text-blue-100 mb-1">Estimated Monthly Payment</div>
                <div className="text-4xl font-bold">${dealData.monthlyPayment.toLocaleString()}</div>
                <div className="text-sm text-blue-100 mt-2">@ {dealData.apr}% APR for {dealData.term} months</div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Financed</span>
                  <span className="font-medium">
                    ${(dealData.vehiclePrice - dealData.tradeValue + dealData.tradePayoff - dealData.downPayment).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total of Payments</span>
                  <span className="font-medium">${(dealData.monthlyPayment * dealData.term).toLocaleString()}</span>
                </div>
              </div>
            </CollapsibleSection>

            {/* F&I Products */}
            <CollapsibleSection
              title="F&I Products"
              icon={FileText}
              isExpanded={expandedSections.fi}
              onToggle={() => toggleSection('fi')}
              badge="3 products available"
            >
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                    <div>
                      <div className="font-medium">Extended Warranty</div>
                      <div className="text-xs text-gray-500">7yr/100k miles coverage</div>
                    </div>
                  </div>
                  <span className="font-semibold text-blue-600">$2,495</span>
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                    <div>
                      <div className="font-medium">GAP Insurance</div>
                      <div className="text-xs text-gray-500">Loan/lease protection</div>
                    </div>
                  </div>
                  <span className="font-semibold text-blue-600">$895</span>
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                    <div>
                      <div className="font-medium">Maintenance Plan</div>
                      <div className="text-xs text-gray-500">5 years prepaid service</div>
                    </div>
                  </div>
                  <span className="font-semibold text-blue-600">$1,295</span>
                </label>
              </div>
            </CollapsibleSection>
          </>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* Deal Summary Card */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Deal Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-600">Vehicle Price</span>
                  <span className="font-semibold">${dealData.vehiclePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-600">Trade Allowance</span>
                  <span className="font-semibold text-green-600">-${dealData.tradeValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-600">Trade Payoff</span>
                  <span className="font-semibold text-red-600">+${dealData.tradePayoff.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-600">Down Payment</span>
                  <span className="font-semibold text-green-600">-${dealData.downPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-600">Doc Fees & Taxes</span>
                  <span className="font-semibold">$2,450</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-bold text-lg">Amount Financed</span>
                  <span className="font-bold text-lg text-blue-600">
                    ${(dealData.vehiclePrice - dealData.tradeValue + dealData.tradePayoff - dealData.downPayment + 2450).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Profit Analysis */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-bold mb-4 text-green-900">Gross Profit</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">Front-End Gross</span>
                  <span className="font-bold text-green-900">$3,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Back-End Gross (F&I)</span>
                  <span className="font-bold text-green-900">$1,850</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-200">
                  <span className="font-bold text-green-900">Total Gross</span>
                  <span className="font-bold text-xl text-green-600">$5,050</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="py-3 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                Save Draft
              </button>
              <button className="py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors">
                Print 4-Square
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowBottomSheet(true)}
          className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-3 gap-1 p-2">
          <button className="flex flex-col items-center py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Calculator className="w-5 h-5 text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Calculate</span>
          </button>
          <button 
            onClick={() => setShowBottomSheet(true)}
            className="flex flex-col items-center py-2 rounded-lg bg-blue-50 text-blue-600 transition-colors"
          >
            <CheckCircle className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Submit Deal</span>
          </button>
          <button className="flex flex-col items-center py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="w-5 h-5 text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Documents</span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet Modal */}
      {showBottomSheet && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowBottomSheet(false)}
          />
          <div className="relative w-full bg-white rounded-t-3xl shadow-2xl animate-slide-up">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-6" />
            <div className="px-6 pb-8">
              <h3 className="text-xl font-bold mb-4">Submit Deal</h3>
              <p className="text-gray-600 mb-6">Ready to submit this deal for manager approval?</p>
              
              <div className="space-y-3 mb-6">
                <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Submit for Approval
                </button>
                <button className="w-full py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors">
                  Send to Customer
                </button>
                <button 
                  onClick={() => setShowBottomSheet(false)}
                  className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MobileDeskingInterface;
