import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ForgotPasswordResponse {
  message: string;
  debugToken?: string;
}

export default function ForgotPassword() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [storeId, setStoreId] = useState("");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugToken, setDebugToken] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setDebugToken(null);

    try {
      const response = await apiRequest("POST", "/api/auth/forgot-password", {
        tenantId: storeId.trim(),
        username: username.trim(),
      });

      const payload = (await response.json()) as ForgotPasswordResponse;
      setDebugToken(payload.debugToken ?? null);

      toast({
        title: "Reset link sent",
        description: payload.message,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to process reset request";
      toast({
        title: "Request failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-surface px-4 py-12 text-foreground">
      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="absolute inset-x-8 top-10 h-[360px] rounded-full blur-3xl hero-spotlight" aria-hidden="true" />
        <div className="absolute inset-0 grid-overlay opacity-60 dark:opacity-40" aria-hidden="true" />

        <div className="relative z-10 flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 rounded-full border border-primary/25 bg-primary/8 px-4 py-2 text-primary">
            <span className="text-xs font-semibold uppercase tracking-[0.3em]">Account recovery</span>
          </div>
          <h1 className="text-3xl font-semibold leading-snug sm:text-4xl lg:text-5xl">
            Reset access to your <span className="text-brand-gradient">AutolytiQ workspace</span>
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Enter your store ID (tenant ID) and username or email. We&apos;ll generate a secure password reset link for your workspace.
          </p>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground/80 lg:flex-row lg:items-center">
            <span className="font-semibold text-primary">Need assistance?</span>
            <span>Contact support@autolytiq.com for tenant onboarding or recovery help.</span>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <Card className="glass-card rounded-3xl border-none shadow-card-xl">
            <CardHeader className="space-y-4 pb-4 text-center">
              <CardTitle className="text-2xl font-semibold">Forgot password</CardTitle>
              <p className="text-sm text-muted-foreground">We&apos;ll send reset instructions to the account owner.</p>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="storeId">Store ID (Tenant ID)</Label>
                  <Input
                    id="storeId"
                    value={storeId}
                    onChange={(event) => setStoreId(event.target.value)}
                    placeholder="TENANT-123"
                    autoFocus
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username or email</Label>
                  <Input
                    id="username"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="sarah.johnson"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="btn-aiq-primary w-full rounded-xl py-3 text-base font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending reset link…" : "Send reset link"}
                </Button>
              </form>

              {debugToken && (
                <div className="mt-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-left text-xs text-muted-foreground">
                  <p className="font-semibold text-primary">Development token</p>
                  <p className="mt-1 break-all">{debugToken}</p>
                  <p className="mt-2 text-[11px]">Use this token at /reset-password/{"{token}"} in non-production environments.</p>
                </div>
              )}

              <Separator className="my-6" />

              <div className="space-y-3 text-center text-sm text-muted-foreground">
                <p>Remembered your password?</p>
                <div className="flex justify-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Return to sign in</Button>
                  <Link href="/">
                    <Button variant="ghost" size="sm">Back to experience</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
