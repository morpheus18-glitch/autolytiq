import { Button } from "@/components/ui/button";
import { Car, TrendingUp, Users, ShieldCheck } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">AutolytiQ</span>
          </div>
          <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
            Log In
          </Button>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Complete Dealership
            <span className="text-blue-600"> Management System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your automotive dealership operations with our comprehensive platform featuring advanced CRM, ML analytics, competitive pricing intelligence, and professional deal desk capabilities.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <TrendingUp className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-4">ML-Powered Analytics</h3>
            <p className="text-gray-600">
              Leverage machine learning for pricing insights, market trends analysis, and competitive intelligence to maximize your profitability.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <Users className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-4">Advanced CRM</h3>
            <p className="text-gray-600">
              Manage customer relationships with pixel-based shopping history tracking, comprehensive lead management, and automated follow-ups.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <ShieldCheck className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-4">Professional Deal Desk</h3>
            <p className="text-gray-600">
              Complete deal management with VIN decoding, trade-in processing, insurance tracking, and automatic sales tax calculations.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Dealership?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join leading automotive dealers who trust AutolytiQ for their operations
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
          >
            Log In to Continue
          </Button>
        </div>
      </div>
    </div>
  );
}