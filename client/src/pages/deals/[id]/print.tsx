import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Printer, 
  Download, 
  FileText, 
  Eye,
  Mail
} from 'lucide-react';
import type { Deal } from '@shared/schema';

interface DealPrintTabProps {
  deal: Deal;
}

export default function DealPrintTab({ deal }: DealPrintTabProps) {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  const documents = [
    {
      id: 'buyers_order',
      name: "Buyer's Order",
      description: 'Vehicle purchase agreement and pricing breakdown',
      status: 'ready',
      required: true,
    },
    {
      id: 'retail_contract',
      name: 'Retail Installment Contract',
      description: 'Finance agreement and payment terms',
      status: deal.dealType === 'cash' ? 'not_applicable' : 'ready',
      required: deal.dealType !== 'cash',
    },
    {
      id: 'trade_agreement',
      name: 'Trade-In Agreement',
      description: 'Trade vehicle evaluation and terms',
      status: deal.tradeVin ? 'ready' : 'not_applicable',
      required: !!deal.tradeVin,
    },
    {
      id: 'warranty_forms',
      name: 'Warranty Documentation',
      description: 'Extended warranty and service contract forms',
      status: 'ready',
      required: false,
    },
    {
      id: 'insurance_forms',
      name: 'Insurance Forms',
      description: 'GAP coverage and insurance documentation',
      status: 'ready',
      required: false,
    },
    {
      id: 'title_paperwork',
      name: 'Title & Registration',
      description: 'DMV forms and title transfer documents',
      status: 'ready',
      required: true,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'not_applicable': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrint = (documentId: string) => {
    // In a real app, this would generate and print the specific document
    console.log(`Printing document: ${documentId}`);
    window.print();
  };

  const handleDownload = (documentId: string) => {
    // In a real app, this would generate and download a PDF
    console.log(`Downloading document: ${documentId}`);
  };

  const handleEmail = (documentId: string) => {
    // In a real app, this would email the document to the customer
    console.log(`Emailing document: ${documentId}`);
  };

  const handlePreview = (documentId: string) => {
    setSelectedDocument(documentId);
  };

  return (
    <div className="space-y-6">
      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Deal Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{doc.name}</h3>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status.replace('_', ' ')}
                    </Badge>
                    {doc.required && (
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(doc.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {doc.status === 'ready' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(doc.id)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEmail(doc.id)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Preview */}
      {selectedDocument && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Document Preview: {documents.find(d => d.id === selectedDocument)?.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDocument(null)}
              >
                Close Preview
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white border p-8 min-h-96">
              {selectedDocument === 'buyers_order' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">BUYER'S ORDER</h2>
                    <p className="text-sm text-gray-600 mt-2">Deal #{deal.dealNumber}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-3">Buyer Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {deal.buyerName}</p>
                        {deal.coBuyerName && (
                          <p><strong>Co-Buyer:</strong> {deal.coBuyerName}</p>
                        )}
                        <p><strong>Date:</strong> {formatDate(deal.createdAt)}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Vehicle Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>VIN:</strong> {deal.vin || 'Not specified'}</p>
                        <p><strong>Sale Price:</strong> {formatCurrency(deal.salePrice)}</p>
                        <p><strong>Deal Type:</strong> {deal.dealType?.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Financial Breakdown</h3>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Vehicle Sale Price</td>
                          <td className="py-2 text-right">{formatCurrency(deal.salePrice)}</td>
                        </tr>
                        {deal.tradeAllowance && deal.tradeAllowance > 0 && (
                          <tr className="border-b">
                            <td className="py-2">Trade Allowance</td>
                            <td className="py-2 text-right">-{formatCurrency(deal.tradeAllowance)}</td>
                          </tr>
                        )}
                        {deal.cashDown && deal.cashDown > 0 && (
                          <tr className="border-b">
                            <td className="py-2">Cash Down</td>
                            <td className="py-2 text-right">-{formatCurrency(deal.cashDown)}</td>
                          </tr>
                        )}
                        {deal.rebates && deal.rebates > 0 && (
                          <tr className="border-b">
                            <td className="py-2">Rebates</td>
                            <td className="py-2 text-right">-{formatCurrency(deal.rebates)}</td>
                          </tr>
                        )}
                        <tr className="border-b">
                          <td className="py-2">Sales Tax</td>
                          <td className="py-2 text-right">{formatCurrency(deal.salesTax)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Documentation Fee</td>
                          <td className="py-2 text-right">{formatCurrency(deal.docFee)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Title Fee</td>
                          <td className="py-2 text-right">{formatCurrency(deal.titleFee)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Registration Fee</td>
                          <td className="py-2 text-right">{formatCurrency(deal.registrationFee)}</td>
                        </tr>
                        <tr className="border-t-2 font-semibold">
                          <td className="py-2">Amount to Finance</td>
                          <td className="py-2 text-right">{formatCurrency(deal.financeBalance)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-8 pt-6 border-t">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-sm mb-4">Buyer Signature:</p>
                        <div className="border-b border-gray-400 h-8"></div>
                        <p className="text-xs text-gray-600 mt-1">Date: ___________</p>
                      </div>
                      <div>
                        <p className="text-sm mb-4">Sales Representative:</p>
                        <div className="border-b border-gray-400 h-8"></div>
                        <p className="text-xs text-gray-600 mt-1">Date: ___________</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedDocument === 'retail_contract' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">RETAIL INSTALLMENT CONTRACT</h2>
                    <p className="text-sm text-gray-600 mt-2">Finance Agreement</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Finance Terms</h3>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Amount Financed</p>
                        <p>{formatCurrency(deal.financeBalance)}</p>
                      </div>
                      <div>
                        <p className="font-medium">Annual Percentage Rate</p>
                        <p>{deal.rate || 'TBD'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Term</p>
                        <p>{deal.term || 0} months</p>
                      </div>
                      <div>
                        <p className="font-medium">Monthly Payment</p>
                        <p>TBD</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-xs text-gray-600">
                      This is a preview only. Complete contract will include all required 
                      federal and state disclosures, payment schedules, and legal terms.
                    </p>
                  </div>
                </div>
              )}

              {selectedDocument && !['buyers_order', 'retail_contract'].includes(selectedDocument) && (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Document preview not available</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This document will be generated when the deal is finalized
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print All Required Documents
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Complete Package
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email to Customer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}