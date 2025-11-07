import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Activity, FileText, CheckCircle, AlertCircle, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AccountingDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDeal, setSelectedDeal] = useState(null);

  const financialSummary = {
    totalRevenue: 485750,
    cogs: 398200,
    grossProfit: 87550,
    frontEndGross: 52300,
    backEndGross: 35250,
    expenses: 28400,
    netIncome: 59150
  };

  const recentTransactions = [
    {
      id: 'DL-2847',
      date: '2024-10-15',
      customer: 'Sarah Martinez',
      type: 'Vehicle Sale',
      vehicle: '2024 Toyota Camry XSE',
      revenue: 32500,
      cogs: 28500,
      gross: 4000,
      fiGross: 2850,
      status: 'Posted'
    },
    {
      id: 'DL-2846',
      date: '2024-10-14',
      customer: 'Robert Johnson',
      type: 'Vehicle Sale',
      vehicle: '2024 Honda Accord Sport',
      revenue: 33500,
      cogs: 29200,
      gross: 4300,
      fiGross: 1950,
      status: 'Posted'
    },
    {
      id: 'DL-2845',
      date: '2024-10-13',
      customer: 'Emily Davis',
      type: 'Vehicle Sale',
      vehicle: '2023 Ford F-150 Lariat',
      revenue: 44500,
      cogs: 38900,
      gross: 5600,
      fiGross: 3200,
      status: 'Pending'
    }
  ];

  const glAccounts = [
    { code: '1100', name: 'Cash - Operating', balance: 285400, type: 'debit' },
    { code: '1200', name: 'Accounts Receivable', balance: 124300, type: 'debit' },
    { code: '1300', name: 'Vehicle Inventory', balance: 1850000, type: 'debit' },
    { code: '2100', name: 'Accounts Payable', balance: 98200, type: 'credit' },
    { code: '2200', name: 'Floor Plan Payable', balance: 1620000, type: 'credit' },
    { code: '4100', name: 'Vehicle Sales Revenue', balance: 485750, type: 'credit' },
    { code: '4200', name: 'F&I Revenue', balance: 35250, type: 'credit' },
    { code: '5100', name: 'Cost of Goods Sold', balance: 398200, type: 'debit' },
    { code: '6100', name: 'Sales Commission', balance: 18400, type: 'debit' },
    { code: '6200', name: 'Operating Expenses', balance: 10000, type: 'debit' }
  ];

  const dealPostingDetail = {
    dealId: 'DL-2847',
    customer: 'Sarah Martinez',
    vehicle: '2024 Toyota Camry XSE',
    saleDate: '2024-10-15',
    entries: [
      {
        section: 'Vehicle Sale',
        entries: [
          { account: '1100', name: 'Cash', debit: 5000, credit: 0 },
          { account: '1200', name: 'Financed Receivable', debit: 27500, credit: 0 },
          { account: '1300', name: 'Vehicle Inventory', debit: 0, credit: 28500 },
          { account: '4100', name: 'Sales Revenue', debit: 0, credit: 32500 },
          { account: '5100', name: 'COGS', debit: 28500, credit: 0 }
        ]
      },
      {
        section: 'Trade-In',
        entries: [
          { account: '1300', name: 'Used Inventory', debit: 15000, credit: 0 },
          { account: '2100', name: 'Trade Payoff', debit: 0, credit: 12500 },
          { account: '4100', name: 'Sales Revenue (Trade)', debit: 2500, credit: 0 }
        ]
      },
      {
        section: 'F&I Products',
        entries: [
          { account: '1200', name: 'Accounts Receivable', debit: 2850, credit: 0 },
          { account: '4200', name: 'F&I Revenue', debit: 0, credit: 2850 }
        ]
      },
      {
        section: 'Commission',
        entries: [
          { account: '6100', name: 'Sales Commission', debit: 1200, credit: 0 },
          { account: '2300', name: 'Commission Payable', debit: 0, credit: 1200 }
        ]
      }
    ]
  };

  const MetricCard = ({ title, value, change, icon: Icon, color, format = 'currency' }) => (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          color === 'green' ? 'bg-green-100' :
          color === 'blue' ? 'bg-blue-100' :
          color === 'orange' ? 'bg-orange-100' :
          'bg-purple-100'
        }`}>
          <Icon className={`w-6 h-6 ${
            color === 'green' ? 'text-green-600' :
            color === 'blue' ? 'text-blue-600' :
            color === 'orange' ? 'text-orange-600' :
            'text-purple-600'
          }`} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold">
        {format === 'currency' ? `$${(value / 1000).toFixed(1)}K` : value}
      </div>
    </div>
  );

  const TransactionRow = ({ transaction }) => (
    <div 
      onClick={() => setSelectedDeal(transaction)}
      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-blue-600">{transaction.id}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              transaction.status === 'Posted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {transaction.status}
            </span>
          </div>
          <div className="text-sm text-gray-600">{transaction.customer}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">{transaction.date}</div>
        </div>
      </div>

      <div className="text-sm font-medium mb-3">{transaction.vehicle}</div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-2 bg-blue-50 rounded">
          <div className="text-xs text-gray-600">Revenue</div>
          <div className="font-bold text-blue-600">${transaction.revenue.toLocaleString()}</div>
        </div>
        <div className="p-2 bg-orange-50 rounded">
          <div className="text-xs text-gray-600">COGS</div>
          <div className="font-bold text-orange-600">${transaction.cogs.toLocaleString()}</div>
        </div>
        <div className="p-2 bg-green-50 rounded">
          <div className="text-xs text-gray-600">Front Gross</div>
          <div className="font-bold text-green-600">${transaction.gross.toLocaleString()}</div>
        </div>
        <div className="p-2 bg-purple-50 rounded">
          <div className="text-xs text-gray-600">F&I Gross</div>
          <div className="font-bold text-purple-600">${transaction.fiGross.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Accounting Dashboard</h1>
            <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
              October 2024
            </button>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedPeriod('day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === 'day' ? 'bg-white text-emerald-600' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Today
            </button>
            <button 
              onClick={() => setSelectedPeriod('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === 'week' ? 'bg-white text-emerald-600' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Week
            </button>
            <button 
              onClick={() => setSelectedPeriod('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === 'month' ? 'bg-white text-emerald-600' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!selectedDeal ? (
        <div className="px-4 py-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <MetricCard
              title="Total Revenue"
              value={financialSummary.totalRevenue}
              change={12.5}
              icon={DollarSign}
              color="green"
            />
            <MetricCard
              title="Gross Profit"
              value={financialSummary.grossProfit}
              change={8.3}
              icon={TrendingUp}
              color="blue"
            />
            <MetricCard
              title="Front-End Gross"
              value={financialSummary.frontEndGross}
              change={5.2}
              icon={Activity}
              color="orange"
            />
            <MetricCard
              title="F&I Gross"
              value={financialSummary.backEndGross}
              change={15.8}
              icon={FileText}
              color="purple"
            />
          </div>

          {/* Profit Summary */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-600" />
              P&L Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Total Revenue</span>
                <span className="font-bold text-green-600">
                  ${financialSummary.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Cost of Goods Sold</span>
                <span className="font-bold text-red-600">
                  -${financialSummary.cogs.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="font-semibold">Gross Profit</span>
                <span className="font-bold text-blue-600">
                  ${financialSummary.grossProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 pl-4">• Front-End Gross</span>
                <span className="font-medium">
                  ${financialSummary.frontEndGross.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 pl-4">• F&I Gross</span>
                <span className="font-medium">
                  ${financialSummary.backEndGross.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Operating Expenses</span>
                <span className="font-bold text-red-600">
                  -${financialSummary.expenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-lg">Net Income</span>
                <span className="font-bold text-xl text-emerald-600">
                  ${financialSummary.netIncome.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="mb-4">
            <h2 className="font-bold text-lg mb-3">Recent Transactions</h2>
            <div className="space-y-3">
              {recentTransactions.map(transaction => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </div>
          </div>

          {/* GL Account Balances */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              General Ledger Accounts
            </h2>
            <div className="space-y-2">
              {glAccounts.map((account, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <div className="font-medium">{account.code}</div>
                    <div className="text-sm text-gray-600">{account.name}</div>
                  </div>
                  <div className={`font-bold ${
                    account.type === 'debit' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    ${account.balance.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Deal Posting Detail View */
        <div className="px-4 py-4">
          <button 
            onClick={() => setSelectedDeal(null)}
            className="flex items-center gap-2 text-emerald-600 font-medium mb-4"
          >
            ← Back to Dashboard
          </button>

          {/* Deal Header */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Deal #{selectedDeal.id}</h2>
                <p className="text-gray-600">{selectedDeal.customer}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                selectedDeal.status === 'Posted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {selectedDeal.status}
              </span>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <div className="font-medium">{selectedDeal.vehicle}</div>
              <div className="text-sm text-gray-600">Sale Date: {selectedDeal.date}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Total Gross</div>
                <div className="text-2xl font-bold text-green-600">
                  ${(selectedDeal.gross + selectedDeal.fiGross).toLocaleString()}
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Deal Value</div>
                <div className="text-2xl font-bold text-blue-600">
                  ${selectedDeal.revenue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Journal Entries */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Journal Entries
            </h3>

            {dealPostingDetail.entries.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6 last:mb-0">
                <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-emerald-200">
                  {section.section}
                </h4>
                <div className="space-y-2">
                  {section.entries.map((entry, entryIndex) => (
                    <div key={entryIndex} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{entry.account}</div>
                        <div className="text-xs text-gray-600">{entry.name}</div>
                      </div>
                      <div className="flex gap-6">
                        <div className="text-right w-24">
                          {entry.debit > 0 && (
                            <div className="flex items-center justify-end gap-1">
                              <ArrowUpRight className="w-3 h-3 text-blue-600" />
                              <span className="font-medium text-blue-600">
                                ${entry.debit.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right w-24">
                          {entry.credit > 0 && (
                            <div className="flex items-center justify-end gap-1">
                              <ArrowDownRight className="w-3 h-3 text-green-600" />
                              <span className="font-medium text-green-600">
                                ${entry.credit.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Section Totals */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 px-3">
                  <span className="font-semibold text-sm">Section Totals</span>
                  <div className="flex gap-6">
                    <div className="text-right w-24">
                      <span className="font-bold text-blue-600">
                        ${section.entries.reduce((sum, e) => sum + e.debit, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right w-24">
                      <span className="font-bold text-green-600">
                        ${section.entries.reduce((sum, e) => sum + e.credit, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Balance Check */}
            <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Entries Balanced</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-700">Total Debits = Total Credits</div>
                  <div className="font-bold text-green-900">
                    ${dealPostingDetail.entries
                      .flatMap(s => s.entries)
                      .reduce((sum, e) => sum + e.debit, 0)
                      .toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
              Export to PDF
            </button>
            <button className="py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
              Email to Accountant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingDashboard;
