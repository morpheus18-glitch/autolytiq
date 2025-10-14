import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import {
  ArrowLeft,
  Apple,
  Chrome,
  Github,
  Lock,
  ShieldCheck,
  Sparkles,
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
    <div className="landing-surface min-h-screen px-4 py-10 text-foreground">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="absolute inset-x-10 top-10 h-[420px] rounded-full blur-3xl hero-spotlight" aria-hidden="true" />
        <div className="absolute inset-0 grid-overlay opacity-60 dark:opacity-40" aria-hidden="true" />

        <div className="relative z-10 max-w-xl space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em]">AutolytiQ Secure Access</span>
          </div>
          <h1 className="text-3xl font-semibold leading-snug sm:text-4xl lg:text-5xl">
            Step back into your <span className="text-brand-gradient">AutolytiQ command center</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Enterprise-grade authentication protects every workflow—from desking to analytics—so your teams can operate with
            confidence.
          </p>
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground/80 lg:justify-start">
            <ShieldCheck className="h-4 w-4 text-primary" />
            SOC 2 Type II, GDPR, and CCPA aligned security controls.
          </div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-4 flex items-center justify-end gap-2">
            <ThemeToggle />
          </div>
          <Card className="glass-card rounded-3xl border-none shadow-card-xl">
            <CardHeader className="space-y-4 pb-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <img src="/aiq-logo.png" alt="AutolytiQ" className="h-10 w-10" />
                <CardTitle className="text-2xl font-semibold">Welcome back to AutolytiQ</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose a secure OAuth partner to continue
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Button
                  onClick={() => handleProviderLogin('replit')}
                  className="btn-aiq-primary w-full rounded-xl py-3 text-base font-semibold"
                  size="lg"
                >
                  <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-md bg-white text-[#F26207]">
                    R
                  </span>
                  Continue with Replit
                </Button>

                <Button
                  onClick={() => handleProviderLogin('google')}
                  variant="outline"
                  className="w-full rounded-xl border-border/80 py-3 text-base font-semibold hover:border-primary/40 hover:text-primary"
                  size="lg"
                >
                  <Chrome className="mr-3 h-5 w-5 text-red-500" />
                  Continue with Google
                </Button>

                <Button
                  onClick={() => handleProviderLogin('github')}
                  variant="outline"
                  className="w-full rounded-xl border-border/80 py-3 text-base font-semibold hover:border-primary/40 hover:text-primary"
                  size="lg"
                >
                  <Github className="mr-3 h-5 w-5" />
                  Continue with GitHub
                </Button>

                <Button
                  onClick={() => handleProviderLogin('apple')}
                  variant="outline"
                  className="w-full rounded-xl border-border/80 py-3 text-base font-semibold hover:border-primary/40 hover:text-primary"
                  size="lg"
                >
                  <Apple className="mr-3 h-5 w-5" />
                  Continue with Apple
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <Badge className="rounded-full border border-border/70 bg-white/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80 dark:bg-white/10">
                  Legacy access
                </Badge>
                <Button
                  onClick={() => (window.location.href = '/api/login')}
                  variant="ghost"
                  className="w-full justify-center gap-2 rounded-xl py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <Lock className="h-4 w-4" />
                  Staff login (master credentials)
                </Button>
              </div>

              <div className="pt-4 text-center">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to experience
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-2 text-center text-xs text-muted-foreground">
            <p>Secure OAuth authentication with zero-trust posture enforcement.</p>
            <p>© 2025 AutolytiQ. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}