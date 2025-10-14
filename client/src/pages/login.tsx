import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import {
  Lock,
  ArrowLeft,
  Github,
  Chrome,
  Apple,
  Sparkles
} from "lucide-react";

export default function Login() {
  const handleProviderLogin = (provider: string) => {
    console.log(`Redirecting to: /api/auth/${provider}`);
    
    // For Google OAuth, use direct URL construction to bypass any routing issues
    if (provider === 'google') {
      const clientId = '579226933513-3n3a1nd8c8ev3eafl1q9vr1f4aa7684v.apps.googleusercontent.com';
      const redirectUri = encodeURIComponent('https://autolytiq.com/api/auth/google/callback');
      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=${redirectUri}&scope=profile%20email&client_id=${clientId}`;
      console.log('Direct Google OAuth redirect:', googleOAuthUrl);
      window.location.href = googleOAuthUrl;
      return;
    }
    
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-[-25%] top-[-15%] h-80 bg-gradient-to-br from-primary/25 to-transparent blur-3xl opacity-50" />
        <div className="absolute inset-x-[-30%] bottom-[-20%] h-96 bg-gradient-to-tl from-secondary/25 to-transparent blur-3xl opacity-40 dark:opacity-60" />
      </div>

      <div className="w-full max-w-md">
        <Card className="border border-border/70 bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl shadow-[0_28px_60px_-30px_rgba(15,23,42,0.55)]">
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                AutolytiQ
              </span>
              <CardTitle className="text-2xl font-semibold">Sign in to continue</CardTitle>
              <p className="text-sm text-muted-foreground max-w-sm">
                Authenticate securely with your preferred provider. SSO enforces least-privilege roles and audit-ready tracking across every deal touchpoint.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Button
                onClick={() => handleProviderLogin('replit')}
                size="lg"
                className="w-full rounded-2xl bg-primary py-3 text-base font-semibold shadow-[0_18px_40px_-28px_rgba(59,130,246,0.75)] hover:bg-primary/90"
              >
                <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs font-bold text-orange-500">R</span>
                Continue with Replit
              </Button>

              <Separator className="my-4" />

              <Button
                onClick={() => handleProviderLogin('google')}
                variant="ghost"
                size="lg"
                className="w-full justify-start gap-3 rounded-2xl border border-border/70 py-3 text-base font-medium hover:bg-primary/10"
              >
                <Chrome className="w-5 h-5 text-primary" />
                Continue with Google
              </Button>

              <Button
                onClick={() => handleProviderLogin('github')}
                variant="ghost"
                size="lg"
                className="w-full justify-start gap-3 rounded-2xl border border-border/70 py-3 text-base font-medium hover:bg-primary/10"
              >
                <Github className="w-5 h-5" />
                Continue with GitHub
              </Button>

              <Button
                onClick={() => handleProviderLogin('apple')}
                variant="ghost"
                size="lg"
                className="w-full justify-start gap-3 rounded-2xl border border-border/70 py-3 text-base font-medium hover:bg-primary/10"
              >
                <Apple className="w-5 h-5" />
                Continue with Apple
              </Button>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3 text-center">
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Legacy authentication
              </h3>

              <Button
                onClick={() => window.location.href = '/api/login'}
                variant="ghost"
                className="w-full justify-center gap-2 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/10"
              >
                <Lock className="w-4 h-4" />
                Staff Login (Master Credentials)
              </Button>
            </div>

            <div className="text-center pt-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground hover:bg-primary/10">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-1 text-sm text-muted-foreground">
          <p>SSO protected with device posture checks and real-time anomaly detection.</p>
          <p className="fine-print">© {new Date().getFullYear()} AutolytiQ. Compliance aligned with SOC 2 Type II and GDPR.</p>
        </div>
      </div>
    </div>
  );
}