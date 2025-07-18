import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Shield, Lock, User, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  twoFactorCode: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      twoFactorCode: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest('POST', '/api/auth/login', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.requiresTwoFactor && !form.watch('twoFactorCode')) {
        setRequiresTwoFactor(true);
        toast({
          title: 'Two-Factor Authentication Required',
          description: 'Please enter your 2FA code to continue.',
        });
      } else {
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${data.user.username}!`,
        });
        // Invalidate the auth session query to refresh authentication state
        queryClient.invalidateQueries({ queryKey: ['/api/auth/session'] });
        setLocation('/');
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AutolytiQ</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Secure Dealership Management</p>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    className="pl-10"
                    {...form.register('username')}
                  />
                </div>
                {form.formState.errors.username && (
                  <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    {...form.register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                )}
              </div>

              {requiresTwoFactor && (
                <div className="space-y-2">
                  <Label htmlFor="twoFactorCode">Two-Factor Authentication Code</Label>
                  <Input
                    id="twoFactorCode"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    {...form.register('twoFactorCode')}
                  />
                  <p className="text-xs text-gray-500">Enter the code from your authenticator app</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <Separator className="my-6" />

            {/* Hidden Master Account Access */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                For initial setup assistance, contact system administrator
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">Security Features</h3>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• SSL/TLS encryption for all data transmission</li>
              <li>• Two-factor authentication support</li>
              <li>• Session timeout protection</li>
              <li>• Secure password requirements</li>
              <li>• Login attempt monitoring</li>
            </ul>
          </CardContent>
        </Card>

        {/* Initial Setup Instructions */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Initial Login Steps</h3>
            <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li>1. Use the master account credentials above for first-time access</li>
              <li>2. Navigate to Settings → User Management after login</li>
              <li>3. Create your personal admin account with strong credentials</li>
              <li>4. Enable two-factor authentication for enhanced security</li>
              <li>5. Change or disable the master account after setup</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}