import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react";

export default function Analytics() {
  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
            <p className="text-gray-500">Analyze your dealership performance</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Revenue Growth</p>
                  <p className="text-2xl font-bold text-gray-900">12.5%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-green-600 text-sm font-medium">+2.1%</span>
                <span className="text-gray-500 text-sm ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">18.7%</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-green-600 text-sm font-medium">+1.2%</span>
                <span className="text-gray-500 text-sm ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Average Deal Size</p>
                  <p className="text-2xl font-bold text-gray-900">$32,450</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-green-600 text-sm font-medium">+5.3%</span>
                <span className="text-gray-500 text-sm ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Inventory Turnover</p>
                  <p className="text-2xl font-bold text-gray-900">45 days</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="text-red-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-red-600 text-sm font-medium">-3.2%</span>
                <span className="text-gray-500 text-sm ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Charts and analytics will be displayed here
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
