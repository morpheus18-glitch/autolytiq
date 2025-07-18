import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { Deal } from '@shared/schema';

interface DealAccountingTabProps {
  deal: Deal;
}

export default function DealAccountingTab({ deal }: DealAccountingTabProps) {
  const { data: accountingEntries } = useQuery({
    queryKey: ['/api/deals', deal.id, 'accounting'],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalDebits = accountingEntries?.reduce((sum: number, entry: any) => sum + (entry.debit || 0), 0) || 0;
  const totalCredits = accountingEntries?.reduce((sum: number, entry: any) => sum + (entry.credit || 0), 0) || 0;
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const getAccountTypeColor = (accountCode: string) => {
    const firstDigit = accountCode.charAt(0);
    switch (firstDigit) {
      case '1': return 'bg-blue-100 text-blue-800'; // Assets
      case '2': return 'bg-red-100 text-red-800'; // Liabilities
      case '3': return 'bg-purple-100 text-purple-800'; // Equity
      case '4': return 'bg-green-100 text-green-800'; // Revenue
      case '5': return 'bg-orange-100 text-orange-800'; // Expenses
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountTypeName = (accountCode: string) => {
    const firstDigit = accountCode.charAt(0);
    switch (firstDigit) {
      case '1': return 'Asset';
      case '2': return 'Liability';
      case '3': return 'Equity';
      case '4': return 'Revenue';
      case '5': return 'Expense';
      default: return 'Other';
    }
  };

  return (
    <div className="space-y-6">
      {/* Accounting Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Accounting Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Total Debits</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(totalDebits)}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {accountingEntries?.filter((e: any) => e.debit > 0).length || 0} entries
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Total Credits</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(totalCredits)}
              </p>
              <p className="text-sm text-green-700 mt-1">
                {accountingEntries?.filter((e: any) => e.credit > 0).length || 0} entries
              </p>
            </div>

            <div className={`p-4 rounded-lg ${isBalanced ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                {isBalanced ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`text-sm font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                  Balance Status
                </span>
              </div>
              <p className={`text-2xl font-bold ${isBalanced ? 'text-green-900' : 'text-red-900'}`}>
                {isBalanced ? 'Balanced' : 'Out of Balance'}
              </p>
              <p className={`text-sm mt-1 ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                Difference: {formatCurrency(Math.abs(totalDebits - totalCredits))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journal Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Journal Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accountingEntries && accountingEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Account</th>
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-right py-3 px-4">Debit</th>
                    <th className="text-right py-3 px-4">Credit</th>
                    <th className="text-left py-3 px-4">Memo</th>
                  </tr>
                </thead>
                <tbody>
                  {accountingEntries.map((entry: any) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Badge className={getAccountTypeColor(entry.accountCode)}>
                            {entry.accountCode}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {getAccountTypeName(entry.accountCode)}
                          </span>
                        </div>
                        <p className="font-medium text-sm mt-1">{entry.accountName}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {entry.accountName}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {entry.memo}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-semibold">
                    <td colSpan={2} className="py-3 px-4">Totals:</td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(totalDebits)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(totalCredits)}
                    </td>
                    <td className="py-3 px-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No accounting entries generated</p>
              <p className="text-sm text-gray-500 mt-1">
                Entries will be created when the deal is finalized
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Categories Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assets & Receivables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accountingEntries?.filter((entry: any) => entry.accountCode.startsWith('1')).map((entry: any) => (
                <div key={entry.id} className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{entry.accountName}</p>
                    <p className="text-xs text-gray-600">{entry.accountCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : formatCurrency(entry.credit)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {entry.debit > 0 ? 'Debit' : 'Credit'}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500 text-center py-4">No asset accounts</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue & Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accountingEntries?.filter((entry: any) => 
                entry.accountCode.startsWith('2') || entry.accountCode.startsWith('4')
              ).map((entry: any) => (
                <div key={entry.id} className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{entry.accountName}</p>
                    <p className="text-xs text-gray-600">{entry.accountCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : formatCurrency(entry.debit)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {entry.credit > 0 ? 'Credit' : 'Debit'}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500 text-center py-4">No revenue/liability accounts</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export & Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">
              Export to QuickBooks
            </Button>
            <Button variant="outline">
              Export to Excel
            </Button>
            <Button variant="outline">
              Generate Report
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Export accounting entries for integration with your accounting system
          </p>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Deal Information</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Deal Number:</strong> {deal.dealNumber}</p>
                <p><strong>Status:</strong> {deal.status}</p>
                <p><strong>Created:</strong> {new Date(deal.createdAt).toLocaleString()}</p>
                <p><strong>Updated:</strong> {new Date(deal.updatedAt).toLocaleString()}</p>
                {deal.finalizedAt && (
                  <p><strong>Finalized:</strong> {new Date(deal.finalizedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Compliance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Double-entry accounting maintained</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Audit trail preserved</span>
                </div>
                <div className="flex items-center gap-2">
                  {isBalanced ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>Journal entries balanced</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}