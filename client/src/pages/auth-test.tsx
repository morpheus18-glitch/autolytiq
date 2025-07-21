import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthTest() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testApiEndpoint = async (endpoint: string) => {
    try {
      const response = await fetch(endpoint);
      addResult(`${endpoint} - Status: ${response.status} - ${response.statusText}`);
      const text = await response.text();
      addResult(`Response: ${text.substring(0, 100)}...`);
    } catch (error) {
      addResult(`${endpoint} - Error: ${error}`);
    }
  };

  const testGoogleOAuth = () => {
    addResult("Testing Google OAuth redirect...");
    const clientId = '579226933513-3n3a1nd8c8ev3eafl1q9vr1f4aa7684v.apps.googleusercontent.com';
    const redirectUri = encodeURIComponent('https://autolytiq.com/api/auth/google/callback');
    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=${redirectUri}&scope=profile%20email&client_id=${clientId}`;
    addResult(`Redirecting to: ${googleOAuthUrl}`);
    window.location.href = googleOAuthUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Authentication System Test</CardTitle>
            <CardDescription>Test OAuth endpoints and authentication flow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => testApiEndpoint('/api/auth/user')}>
                Test /api/auth/user
              </Button>
              <Button onClick={() => testApiEndpoint('/api/auth/google')}>
                Test /api/auth/google
              </Button>
              <Button onClick={() => testApiEndpoint('/api/vehicles')}>
                Test /api/vehicles
              </Button>
              <Button onClick={testGoogleOAuth} variant="destructive">
                Test Google OAuth Flow
              </Button>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-96 overflow-y-auto font-mono text-sm">
                {testResults.map((result, index) => (
                  <div key={index}>{result}</div>
                ))}
                {testResults.length === 0 && (
                  <div className="text-gray-500">Click a test button to see results...</div>
                )}
              </div>
            </div>
            
            <Button 
              onClick={() => setTestResults([])} 
              variant="outline"
              className="mt-4"
            >
              Clear Results
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}