import { Button } from "@/components/ui/button";
import { Car, TrendingUp, Users, ShieldCheck } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header - Mobile Optimized */}
        <header className="flex justify-between items-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img 
              src="/aiq-logo.png" 
              alt="AiQ Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
            />
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">AutolytiQ</span>
          </div>
          <Button 
            onClick={handleLogin} 
            className="btn-aiq-primary text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-2"
            data-testid="button-login-header"
          >
            Log In
          </Button>
        </header>

        {/* Hero Section - Mobile First */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight px-2">
            Complete Dealership
            <span className="text-blue-600 dark:text-blue-400"> Management System</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Streamline your automotive dealership operations with our comprehensive platform featuring advanced CRM, ML analytics, competitive pricing intelligence, and professional deal desk capabilities.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="btn-aiq-primary text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 w-full sm:w-auto max-w-xs sm:max-w-none"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 lg:mb-20">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">ML-Powered Analytics</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Leverage machine learning for pricing insights, market trends analysis, and competitive intelligence to maximize your profitability.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Advanced CRM</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Manage customer relationships with pixel-based shopping history tracking, comprehensive lead management, and automated follow-ups.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
            <ShieldCheck className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Professional Deal Desk</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Complete deal management with VIN decoding, trade-in processing, insurance tracking, and automatic sales tax calculations.
            </p>
          </div>
        </div>

        {/* Call to Action - Mobile Optimized */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-8 sm:p-12 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Ready to Transform Your Dealership?
          </h2>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 px-4">
            Join leading automotive dealers who trust AutolytiQ for their operations
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 w-full sm:w-auto max-w-xs sm:max-w-none"
            data-testid="button-login-cta"
          >
            Log In to Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
