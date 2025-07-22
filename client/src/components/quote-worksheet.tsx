import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Save,
  Printer,
  Calculator,
  FileText,
  DollarSign
} from "lucide-react";

interface QuoteWorksheetProps {
  quoteNumber?: string;
  onSave?: (quoteData: any) => void;
}

export function QuoteWorksheet({ quoteNumber = "56920", onSave }: QuoteWorksheetProps) {
  const [formData, setFormData] = useState({
    // Basic Information
    quoteNumber: quoteNumber,
    contractDate: "07/22/25",
    finInst: "KMFC",
    stockNumber: "",
    custName: "",
    term: "60",
    buyerCounty: "",
    msrp: "",
    balloonRtAmt: "",
    mileagePenalty: "",
    cashPrice: "",
    rebate: "",
    cashDown: "",
    totalTradeAllow: "",
    totTradeNetAllow: "",
    totalDown: "",
    aftermarketProducts: "2,796.00",
    totalFees: "292.80",

    // Service Contract Details
    serviceContract: "",
    totInsurance13: "",
    totalTaxAmount: "94.43",
    term2: "60",
    apr: "9.99%",
    daysTo1stPayment: "45",
    firstPaymentDate: "09/05/25",
    payment: "67.87",

    // Financial Summary
    saleSubtotal: "2,796.00",
    totalFinanced: "3,183.23",
    financeCharge: "888.97",
    totalOtherCharges: "",
    totalOfPayments: "4,072.20",
    deferredPrice: "4,072.20",
    unpaidBalance: "3,183.23"
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave?.(formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-300 rounded-t-lg">
          <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              <span className="font-medium">Quote Worksheet</span>
              <span>— UFI</span>
              <span className="bg-gray-700 px-3 py-1 rounded">eXit</span>
            </div>
            <div className="bg-gray-700 px-3 py-1 rounded text-sm">
              Quote Worksheet - Purchase
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-gray-200 px-4 py-2 flex items-center space-x-2 border-b">
            <Button size="sm" variant="outline" className="h-8">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" className="h-8">
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
            <Button size="sm" variant="outline" className="h-8">
              <Calculator className="w-4 h-4 mr-1" />
              Calculate
            </Button>
            <Button size="sm" variant="outline" className="h-8">
              <FileText className="w-4 h-4 mr-1" />
              Forms
            </Button>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded border">
                  <h3 className="font-bold text-lg mb-4">Quote Worksheet</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">1. Quote No.:</Label>
                      <Input 
                        value={formData.quoteNumber} 
                        onChange={(e) => updateField('quoteNumber', e.target.value)}
                        className="h-8 bg-blue-100"
                        readOnly
                      />
                    </div>

                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">2. Contract Date:</Label>
                      <Input 
                        value={formData.contractDate} 
                        onChange={(e) => updateField('contractDate', e.target.value)}
                        className="h-8"
                      />
                    </div>

                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">3. Fin Inst:</Label>
                      <Input 
                        value={formData.finInst} 
                        onChange={(e) => updateField('finInst', e.target.value)}
                        className="h-8 bg-blue-100"
                      />
                    </div>

                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">4. Stock Number:</Label>
                      <Input 
                        value={formData.stockNumber} 
                        onChange={(e) => updateField('stockNumber', e.target.value)}
                        className="h-8"
                      />
                    </div>

                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">5. Cust Name:</Label>
                      <Input 
                        value={formData.custName} 
                        onChange={(e) => updateField('custName', e.target.value)}
                        className="h-8"
                      />
                    </div>

                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">6. Buyer County:</Label>
                      <Input 
                        value={formData.buyerCounty} 
                        onChange={(e) => updateField('buyerCounty', e.target.value)}
                        className="h-8"
                      />
                    </div>

                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">7. M.S.R.P.:</Label>
                      <Input 
                        value={formData.msrp} 
                        onChange={(e) => updateField('msrp', e.target.value)}
                        className="h-8"
                      />
                    </div>

                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">8. Balloon Rt/Amt:</Label>
                      <Input 
                        value={formData.balloonRtAmt} 
                        onChange={(e) => updateField('balloonRtAmt', e.target.value)}
                        className="h-8"
                      />
                    </div>

                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">9. Mileage Penalty:</Label>
                      <Input 
                        value={formData.mileagePenalty} 
                        onChange={(e) => updateField('mileagePenalty', e.target.value)}
                        className="h-8"
                      />
                    </div>

                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">10. Cash Price:</Label>
                      <Input 
                        value={formData.cashPrice} 
                        onChange={(e) => updateField('cashPrice', e.target.value)}
                        className="h-8"
                      />
                    </div>

                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">11. Rebate:</Label>
                      <Input 
                        value={formData.rebate} 
                        onChange={(e) => updateField('rebate', e.target.value)}
                        className="h-8"
                      />
                    </div>

                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">12. Cash Down:</Label>
                      <Input 
                        value={formData.cashDown} 
                        onChange={(e) => updateField('cashDown', e.target.value)}
                        className="h-8"
                      />
                    </div>

                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">13. Total Trade Allow:</Label>
                      <Input 
                        value={formData.totalTradeAllow} 
                        onChange={(e) => updateField('totalTradeAllow', e.target.value)}
                        className="h-8"
                      />
                    </div>

                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">14. Tot Trade Net Allow:</Label>
                      <Input 
                        value={formData.totTradeNetAllow} 
                        onChange={(e) => updateField('totTradeNetAllow', e.target.value)}
                        className="h-8"
                      />
                    </div>

                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">15. Total Down:</Label>
                      <Input 
                        value={formData.totalDown} 
                        onChange={(e) => updateField('totalDown', e.target.value)}
                        className="h-8 bg-yellow-100"
                      />
                    </div>

                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">16. Aftermarket Products:</Label>
                      <div className="flex items-center">
                        <span className="mr-2">$</span>
                        <Input 
                          value={formData.aftermarketProducts} 
                          onChange={(e) => updateField('aftermarketProducts', e.target.value)}
                          className="h-8 w-24"
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Label className="w-32 text-sm font-medium text-blue-600">17. Total Fees:</Label>
                      <div className="flex items-center">
                        <span className="mr-2">$</span>
                        <Input 
                          value={formData.totalFees} 
                          onChange={(e) => updateField('totalFees', e.target.value)}
                          className="h-8 w-24"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Command Window */}
                <div className="border border-gray-300 rounded p-4 bg-gray-50">
                  <h4 className="font-bold mb-2">Command Window</h4>
                  <div className="bg-black text-green-400 p-3 rounded font-mono text-sm h-16">
                    <span className="text-yellow-400">Command ( ? ) :</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    Enter the stock number of a vehicle in your inventory.
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Label className="w-32 text-sm font-medium text-blue-600">16. Service Contract:</Label>
                    <Input 
                      value={formData.serviceContract} 
                      onChange={(e) => updateField('serviceContract', e.target.value)}
                      className="h-8"
                    />
                  </div>

                  <div className="flex items-center">
                    <Label className="w-32 text-sm font-medium text-blue-600">17. Tot Insurance 1-3:</Label>
                    <Input 
                      value={formData.totInsurance13} 
                      onChange={(e) => updateField('totInsurance13', e.target.value)}
                      className="h-8"
                    />
                  </div>

                  <div className="flex items-center">
                    <Label className="w-32 text-sm font-medium text-blue-600">18. Total Tax Amount:</Label>
                    <div className="flex items-center">
                      <span className="mr-2">$</span>
                      <Input 
                        value={formData.totalTaxAmount} 
                        onChange={(e) => updateField('totalTaxAmount', e.target.value)}
                        className="h-8 w-24"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Label className="w-32 text-sm font-medium text-blue-600">19. Term:</Label>
                    <Input 
                      value={formData.term2} 
                      onChange={(e) => updateField('term2', e.target.value)}
                      className="h-8 w-16"
                    />
                  </div>

                  <div className="flex items-center">
                    <Label className="w-32 text-sm font-medium text-blue-600">20. APR:</Label>
                    <Input 
                      value={formData.apr} 
                      onChange={(e) => updateField('apr', e.target.value)}
                      className="h-8 w-20"
                    />
                  </div>

                  <div className="flex items-center">
                    <Label className="w-32 text-sm font-medium text-blue-600">21. Days To 1st Payment:</Label>
                    <Input 
                      value={formData.daysTo1stPayment} 
                      onChange={(e) => updateField('daysTo1stPayment', e.target.value)}
                      className="h-8 w-16"
                    />
                  </div>

                  <div className="flex items-center">
                    <Label className="w-32 text-sm font-medium text-blue-600">22. 1st Payment Date:</Label>
                    <Input 
                      value={formData.firstPaymentDate} 
                      onChange={(e) => updateField('firstPaymentDate', e.target.value)}
                      className="h-8"
                    />
                  </div>

                  <div className="flex items-center">
                    <Label className="w-32 text-sm font-medium text-blue-600">23. Payment:</Label>
                    <div className="flex items-center">
                      <span className="mr-2">$</span>
                      <Input 
                        value={formData.payment} 
                        onChange={(e) => updateField('payment', e.target.value)}
                        className="h-8 w-24 bg-yellow-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-blue-50 p-4 rounded border mt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-blue-600">Sale Subtotal:</Label>
                      <div className="flex items-center">
                        <span className="mr-2">$</span>
                        <span className="font-bold">{formData.saleSubtotal}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-blue-600">Total Financed:</Label>
                      <div className="flex items-center">
                        <span className="mr-2">$</span>
                        <span className="font-bold">{formData.totalFinanced}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-blue-600">Finance Charge:</Label>
                      <div className="flex items-center">
                        <span className="mr-2">$</span>
                        <span className="font-bold">{formData.financeCharge}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-blue-600">Total Other Charges:</Label>
                      <div className="flex items-center">
                        <span className="mr-2">$</span>
                        <span className="font-bold">{formData.totalOtherCharges}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-blue-600">Total of Payments:</Label>
                      <div className="flex items-center">
                        <span className="mr-2">$</span>
                        <span className="font-bold">{formData.totalOfPayments}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-blue-600">Deferred Price:</Label>
                      <div className="flex items-center">
                        <span className="mr-2">$</span>
                        <span className="font-bold">{formData.deferredPrice}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t pt-2">
                      <Label className="text-sm font-medium text-blue-600">Unpaid Balance:</Label>
                      <div className="flex items-center">
                        <span className="mr-2">$</span>
                        <span className="font-bold text-lg">{formData.unpaidBalance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-8 pt-6 border-t">
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Quote
              </Button>
              <Button variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                Print Quote
              </Button>
              <Button variant="outline">
                <Calculator className="w-4 h-4 mr-2" />
                Recalculate
              </Button>
              <Button variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Generate Deal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}