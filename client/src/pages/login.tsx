import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { 
  Car, 
  Lock, 
  UserPlus, 
  ArrowLeft,
  Github,
  Chrome,
  Apple
} from "lucide-react";

export default function Login() {
  const handleProviderLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-4 pb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Car className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">AutolytiQ</h1>
              </div>
              <p className="text-gray-600">Dealership Management System</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-center text-gray-800 mb-4">
                Choose Your Sign-In Method
              </h2>
              
              {/* Replit OAuth */}
              <Button
                onClick={() => handleProviderLogin('replit')}
                className="w-full bg-[#F26207] hover:bg-[#E55100] text-white py-3 text-base font-medium"
                size="lg"
              >
                <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-[#F26207] font-bold text-xs">R</span>
                </div>
                Continue with Replit
              </Button>

              <Separator className="my-4" />

              {/* Google OAuth */}
              <Button
                onClick={() => handleProviderLogin('google')}
                variant="outline"
                className="w-full py-3 text-base font-medium border-gray-300 hover:bg-gray-50"
                size="lg"
              >
                <Chrome className="w-5 h-5 mr-3 text-red-500" />
                Continue with Google
              </Button>

              {/* GitHub OAuth */}
              <Button
                onClick={() => handleProviderLogin('github')}
                variant="outline"
                className="w-full py-3 text-base font-medium border-gray-300 hover:bg-gray-50"
                size="lg"
              >
                <Github className="w-5 h-5 mr-3 text-gray-800" />
                Continue with GitHub
              </Button>

              {/* Apple OAuth */}
              <Button
                onClick={() => handleProviderLogin('apple')}
                variant="outline"
                className="w-full py-3 text-base font-medium border-gray-300 hover:bg-gray-50"
                size="lg"
              >
                <Apple className="w-5 h-5 mr-3 text-gray-800" />
                Continue with Apple
              </Button>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 text-center mb-3">
                Legacy Authentication
              </h3>
              
              <Button
                onClick={() => window.location.href = '/api/login'}
                variant="ghost"
                className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                <Lock className="w-4 h-4 mr-2" />
                Staff Login (Master Credentials)
              </Button>
            </div>

            <div className="text-center pt-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Secure OAuth authentication powered by industry-leading providers</p>
          <p className="mt-1">© 2025 AutolytiQ. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}