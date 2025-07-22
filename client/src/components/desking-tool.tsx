import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  DollarSign, 
  Car, 
  User, 
  FileText,
  Plus,
  Trash2,
  Save,
  Printer
} from "lucide-react";

interface DeskingToolProps {
  dealId?: string;
  onSave?: (dealData: any) => void;
}

interface DealerAdd {
  id: string;
  code: string;
  description: string;
  cost: number;
  retail: number;
}

interface PaymentCalculation {
  term: number;
  rate: number;
  buyRate: number;
  payment: number;
  totalOfPayments: number;
  financeCharges: number;
}

export function DeskingTool({ dealId, onSave }: DeskingToolProps) {
  // Vehicle Information
  const [vehicleInfo, setVehicleInfo] = useState({
    year: "2024",
    make: "Kia",
    model: "Forte",
    trim: "LXS",
    stock: "KS240A",
    vin: "EXXGB4J2XMG043198",
    bodyStyle: "Sedan",
    mileage: "10",
    msrp: "21432.00",
    sellingPrice: "21432.00",
    freight: "0.00",
    rebate: "0.00",
    dealerAdds: "0.00",
    tradeAllowance: "0.00",
    tradeDifference: "21432.00",
    taxes: "1731.53",
    docFee: "251.05",
    dmvFees: "15.00",
    otherFees: "25.50",
    financeAmount: "24233.08"
  });

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    customerId: "#17362776",
    zip: "47130",
    state: "IN",
    county: "Clark",
    city: "Jeffersonville",
    creditScore: ""
  });

  // Trade Information
  const [tradeInfo, setTradeInfo] = useState({
    year: "2021",
    make: "KS",
    model: "",
    vin: "",
    mileage: "108503",
    bodyStyle: "",
    cost: "19100.00",
    holdBack: "0.00",
    regOutOfState: false,
    dealsPencils: 0,
    weight: 2
  });

  // Dealer Adds
  const [dealerAdds, setDealerAdds] = useState<DealerAdd[]>([
    { id: "1", code: "PROT", description: "Paint Protection", cost: 250, retail: 599 },
    { id: "2", code: "TINT", description: "Window Tinting", cost: 150, retail: 399 },
    { id: "3", code: "EXT", description: "Extended Warranty", cost: 800, retail: 1295 }
  ]);

  // Payment Calculations
  const [payments, setPayments] = useState<PaymentCalculation[]>([
    { term: 36, rate: 23.8, buyRate: 12.75, payment: 957.46, totalOfPayments: 34468.56, financeCharges: 10235.48 },
    { term: 48, rate: 12.75, buyRate: 12.75, payment: 650.50, totalOfPayments: 31224.00, financeCharges: 6990.92 },
    { term: 60, rate: 12.75, buyRate: 12.75, payment: 551.15, totalOfPayments: 33069.00, financeCharges: 8835.92 },
    { term: 66, rate: 12.75, buyRate: 12.75, payment: 515.39, totalOfPayments: 34015.74, financeCharges: 9782.66 }
  ]);

  const [downPayment, setDownPayment] = useState("2000.00");
  const [cashPrice, setCashPrice] = useState("26233.08");
  const [grossProfit, setGrossProfit] = useState({
    tradeACV: "0.00",
    dealerCash: "0.00",
    grossFront: "2332.00",
    grossBack: "7577.60",
    grossTotal: "9909.60"
  });

  const addDealerAdd = () => {
    const newAdd: DealerAdd = {
      id: Date.now().toString(),
      code: "",
      description: "",
      cost: 0,
      retail: 0
    };
    setDealerAdds([...dealerAdds, newAdd]);
  };

  const removeDealerAdd = (id: string) => {
    setDealerAdds(dealerAdds.filter(add => add.id !== id));
  };

  const updateDealerAdd = (id: string, field: keyof DealerAdd, value: string | number) => {
    setDealerAdds(dealerAdds.map(add => 
      add.id === id ? { ...add, [field]: value } : add
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Showroom Control Manager</span>
            <span className="text-sm">Dashboard</span>
            <span className="text-sm">Sales Process (Luis Pacheco, J)</span>
            <span className="text-sm">ILM</span>
            <span className="text-sm">Sales Process (Davis, S)</span>
            <span className="text-sm bg-green-600 px-2 py-1 rounded">Sales Process (Thompson, M)</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
            <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-x border-gray-300 px-4 py-2 flex items-center space-x-6 text-sm">
          <span className="text-blue-600 font-medium cursor-pointer border-b-2 border-blue-600 pb-1">1) Customer</span>
          <span className="cursor-pointer hover:text-blue-600">2) Co Buyer</span>
          <span className="cursor-pointer hover:text-blue-600">3) Sales Process</span>
          <span className="cursor-pointer hover:text-blue-600">4) Trades</span>
          <span className="cursor-pointer hover:text-blue-600">5) Print Forms</span>
          <span className="cursor-pointer bg-green-600 text-white px-3 py-1 rounded">Work-A-Deal</span>
        </div>

        <div className="bg-white border border-gray-300 rounded-b-lg">
          <div className="flex">
            {/* Left Panel - Customer & Vehicle Info */}
            <div className="w-64 border-r border-gray-300 p-4 bg-gray-50">
              {/* Customer Info */}
              <div className="mb-6">
                <div className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-medium mb-3">
                  Customer {customerInfo.customerId}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="w-16">Zip</span>
                    <Input value={customerInfo.zip} className="h-6 text-xs" readOnly />
                  </div>
                  <div className="flex items-center">
                    <span className="w-16">State/Province</span>
                    <Input value={customerInfo.state} className="h-6 text-xs" readOnly />
                  </div>
                  <div className="flex items-center">
                    <span className="w-16">County</span>
                    <Input value={customerInfo.county} className="h-6 text-xs" readOnly />
                  </div>
                  <div className="flex items-center">
                    <span className="w-16">City</span>
                    <Input value={customerInfo.city} className="h-6 text-xs" readOnly />
                  </div>
                  <div className="flex items-center">
                    <span className="w-16">Credit Score</span>
                    <Input value={customerInfo.creditScore} className="h-6 text-xs" />
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="mb-6">
                <div className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-medium mb-3">
                  Vehicle Info
                </div>
                <div className="space-y-2 text-sm">
                  <Badge variant="outline" className="text-xs">NEW</Badge>
                  <div className="flex items-center">
                    <span className="w-16">Stock #</span>
                    <Input value={vehicleInfo.stock} className="h-6 text-xs" readOnly />
                  </div>
                  <div className="flex items-center">
                    <span className="w-16">VIN</span>
                    <Input value={vehicleInfo.vin} className="h-6 text-xs" readOnly />
                  </div>
                  <div className="text-xs font-medium">Used 2021 KS</div>
                  <div className="flex items-center">
                    <span className="w-16">Body Style</span>
                    <Input value={tradeInfo.bodyStyle} className="h-6 text-xs" />
                  </div>
                  <div className="flex items-center">
                    <span className="w-16">Vehicle Cost</span>
                    <Input value={tradeInfo.cost} className="h-6 text-xs" />
                  </div>
                  <div className="flex items-center">
                    <span className="w-16">Hold Back</span>
                    <Input value={tradeInfo.holdBack} className="h-6 text-xs" />
                  </div>
                  <div className="flex items-center text-xs">
                    <span className="w-16">Mileage / Days</span>
                    <Input value={tradeInfo.mileage} className="h-6 text-xs w-16" />
                    <span className="ml-1">0</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Worksheet */}
              <div>
                <div className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-medium mb-3">
                  Dynamic Worksheet
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="text-xs">View</Button>
                  <Button size="sm" variant="outline" className="text-xs">Email</Button>
                  <Button size="sm" variant="outline" className="text-xs">Config</Button>
                </div>
              </div>
            </div>

            {/* Center Panel - Pricing Details */}
            <div className="flex-1 p-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Side - Pricing */}
                <div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="w-32">MSRP</span>
                      <div className="flex items-center">
                        <Input value={vehicleInfo.msrp} className="h-7 text-xs w-20 text-right" />
                        <input type="checkbox" className="ml-2" defaultChecked />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="w-32">Selling Price</span>
                      <div className="flex items-center">
                        <Input value={vehicleInfo.sellingPrice} className="h-7 text-xs w-20 text-right" />
                        <input type="checkbox" className="ml-2" defaultChecked />
                        <span className="ml-2 text-xs">🔒</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="w-32">Freight</span>
                      <div className="flex items-center">
                        <Input value={vehicleInfo.freight} className="h-7 text-xs w-20 text-right" />
                        <input type="checkbox" className="ml-2" defaultChecked />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="w-32 text-blue-600 underline cursor-pointer">Rebate</span>
                      <Input value={vehicleInfo.rebate} className="h-7 text-xs w-20 text-right" />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="w-32">Dealer Adds</span>
                      <Input value={vehicleInfo.dealerAdds} className="h-7 text-xs w-20 text-right" />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="w-32 text-blue-600 underline cursor-pointer">Tot Trade Allow</span>
                      <Input value={vehicleInfo.tradeAllowance} className="h-7 text-xs w-20 text-right" />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="w-32">Trade Difference</span>
                      <Input value={vehicleInfo.tradeDifference} className="h-7 text-xs w-20 text-right bg-yellow-100" readOnly />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="w-32">Taxes</span>
                      <Input value={vehicleInfo.taxes} className="h-7 text-xs w-20 text-right" />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="w-32">Doc Fee</span>
                      <Input value={vehicleInfo.docFee} className="h-7 text-xs w-20 text-right" />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="w-32">DMV Fees</span>
                      <Input value={vehicleInfo.dmvFees} className="h-7 text-xs w-20 text-right" />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="w-32">Other Fees</span>
                      <Input value={vehicleInfo.otherFees} className="h-7 text-xs w-20 text-right" />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="w-32 text-blue-600 underline cursor-pointer">F&I Adds</span>
                      <Input value="2796.00" className="h-7 text-xs w-20 text-right" />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="w-32 text-blue-600 underline cursor-pointer">Tot Trade Payoff</span>
                      <Input value="0.00" className="h-7 text-xs w-20 text-right" />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="w-32">Days</span>
                      <Input value="45" className="h-7 text-xs w-20 text-right" />
                    </div>

                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center font-medium">
                        <span className="w-32">Cash Price</span>
                        <Input value={cashPrice} className="h-7 text-xs w-20 text-right bg-blue-100" readOnly />
                      </div>
                      <div className="flex justify-between items-center font-medium">
                        <span className="w-32">Fin Amount</span>
                        <Input value={vehicleInfo.financeAmount} className="h-7 text-xs w-20 text-right bg-blue-100" readOnly />
                      </div>
                    </div>

                    {/* Gross Profit Section */}
                    <div className="border-t pt-2">
                      <div className="bg-gray-200 px-2 py-1 text-xs font-medium mb-2">Gross Profit</div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs">Tot Trade ACV</span>
                          <Input value={grossProfit.tradeACV} className="h-6 text-xs w-20 text-right" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Dealer Cash</span>
                          <Input value={grossProfit.dealerCash} className="h-6 text-xs w-20 text-right" />
                          <input type="checkbox" className="ml-1" defaultChecked />
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-xs">Gross- Front</span>
                          <Input value={grossProfit.grossFront} className="h-6 text-xs w-20 text-right bg-green-100" readOnly />
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-xs">Gross- Back</span>
                          <Input value={grossProfit.grossBack} className="h-6 text-xs w-20 text-right bg-green-100" readOnly />
                        </div>
                        <div className="flex justify-between font-bold">
                          <span className="text-xs">Gross- Total</span>
                          <Input value={grossProfit.grossTotal} className="h-6 text-xs w-20 text-right bg-green-200" readOnly />
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline" className="text-xs">Dealer Track</Button>
                      <Button size="sm" variant="outline" className="text-xs">Route One</Button>
                    </div>
                  </div>
                </div>

                {/* Right Side - Finance & Payments */}
                <div>
                  <div className="mb-4">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium mb-3">
                      Kia Motor Finance - Direct Desk
                    </div>
                    
                    {/* Payment Table */}
                    <div className="border border-gray-300 rounded">
                      <div className="bg-gray-100 grid grid-cols-6 gap-1 p-2 text-xs font-medium">
                        <span>Term</span>
                        <span>Rate</span>
                        <span>Buy Rate</span>
                        <span>Reb</span>
                        <span>Payments</span>
                        <span>Down Payment</span>
                      </div>
                      
                      {payments.map((payment, index) => (
                        <div key={index} className="grid grid-cols-6 gap-1 p-2 text-xs border-t hover:bg-blue-50">
                          <span>{payment.term}</span>
                          <span>{payment.rate}</span>
                          <span>{payment.buyRate}</span>
                          <input type="checkbox" className="w-3 h-3" defaultChecked />
                          <span className="font-medium">${payment.payment}</span>
                          <Input value={index === 0 ? "2,000.00" : index === 1 ? "3,000.00" : index === 2 ? "4,000.00" : "5,000.00"} 
                                className="h-5 text-xs" />
                          <div className="col-span-6 text-xs text-gray-600 mt-1">
                            <div className="grid grid-cols-3 gap-4">
                              <span>Tot Pmts: ${payment.totalOfPayments.toLocaleString()}</span>
                              <span>Fin Chgs: ${payment.financeCharges.toLocaleString()}</span>
                              <span>Recap DP: ${index === 0 ? "838.93" : index === 1 ? "569.99" : index === 2 ? "482.92" : "451.58"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 text-xs">
                      <div className="flex justify-between items-center mb-2">
                        <span>Days Annualized</span>
                        <select className="border rounded px-2 py-1 text-xs">
                          <option>365</option>
                        </select>
                        <input type="checkbox" />
                        <input type="checkbox" />
                        <input type="checkbox" />
                        <input type="checkbox" />
                        <Button size="sm" variant="outline" className="text-xs">Print All</Button>
                      </div>
                      <div className="flex justify-between">
                        <span>Payments Per Year</span>
                        <span>12</span>
                      </div>
                    </div>
                  </div>

                  {/* Dealer Adds Section */}
                  <div className="mt-6">
                    <div className="bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium mb-2 flex justify-between items-center">
                      <span>Dealer Adds</span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-xs text-white border-white hover:bg-white hover:text-gray-700">New</Button>
                        <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700">Active Deal</Button>
                        <Button size="sm" variant="outline" className="text-xs text-white border-white hover:bg-white hover:text-gray-700">Recap</Button>
                      </div>
                    </div>
                    
                    <div className="border border-gray-300 rounded">
                      <div className="bg-gray-100 grid grid-cols-4 gap-1 p-2 text-xs font-medium">
                        <span>Code</span>
                        <span>Description</span>
                        <span>Cost</span>
                        <span>Retail</span>
                      </div>
                      
                      {dealerAdds.map((add) => (
                        <div key={add.id} className="grid grid-cols-4 gap-1 p-2 text-xs border-t">
                          <Input value={add.code} onChange={(e) => updateDealerAdd(add.id, 'code', e.target.value)} 
                                className="h-6 text-xs" />
                          <Input value={add.description} onChange={(e) => updateDealerAdd(add.id, 'description', e.target.value)} 
                                className="h-6 text-xs" />
                          <Input value={add.cost} onChange={(e) => updateDealerAdd(add.id, 'cost', parseFloat(e.target.value) || 0)} 
                                className="h-6 text-xs" />
                          <Input value={add.retail} onChange={(e) => updateDealerAdd(add.id, 'retail', parseFloat(e.target.value) || 0)} 
                                className="h-6 text-xs" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Deal Summary */}
                  <div className="mt-4 bg-gray-50 p-3 rounded border">
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Term</span>
                        <span>36</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate</span>
                        <span>23.8</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-blue-600">Cash Price</span>
                        <span>26,233.08</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cash Down</span>
                        <span>2,000.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deposit</span>
                        <span>0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fin Amount</span>
                        <span>24,233.08</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Payment</span>
                        <span>957.46</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total of Pmts</span>
                        <span>34,468.56</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fin Charges</span>
                        <span>10,235.48</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t text-xs">
                      <div className="flex space-x-4">
                        <span>Cost: 0.00</span>
                        <span>Retail: 0.00</span>
                      </div>
                      <div className="flex space-x-2">
                        <span>Up All</span>
                        <input type="checkbox" />
                        <Button size="sm" variant="outline" className="text-xs">Push to DMS</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}