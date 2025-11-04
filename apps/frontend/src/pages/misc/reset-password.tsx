import { FormEvent, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ResetTokenMetadata {
  token: string;
  expiresAt: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
  tenant: {
    id: string;
    name: string;
    subdomain: string;
  };
}

export default function ResetPassword() {
  const [, params] = useRoute<{ token: string }>("/reset-password/:token");
  const [, navigate] = useLocation();
  const token = params?.token ?? "";
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: metadata,
    isLoading,
    isError,
    error,
  } = useQuery<ResetTokenMetadata>({
    queryKey: ["/api/auth/password-reset", token],
    enabled: token.length > 0,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/auth/password-reset/${token}`);
      return (await response.json()) as ResetTokenMetadata;
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Confirm your new password before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("POST", `/api/auth/password-reset/${token}`, { password });
      toast({
        title: "Password updated",
        description: "You can now sign in with your new credentials.",
      });
      navigate("/login");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unable to reset password";
      toast({
        title: "Reset failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const invalidState = !token || isError;

  return (
    <div className="landing-surface px-4 py-12 text-foreground">
      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="absolute inset-x-8 top-10 h-[360px] rounded-full blur-3xl hero-spotlight" aria-hidden="true" />
        <div className="absolute inset-0 grid-overlay opacity-60 dark:opacity-40" aria-hidden="true" />

        <div className="relative z-10 flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 rounded-full border border-primary/25 bg-primary/8 px-4 py-2 text-primary">
            <span className="text-xs font-semibold uppercase tracking-[0.3em]">Secure reset</span>
          </div>
          <h1 className="text-3xl font-semibold leading-snug sm:text-4xl lg:text-5xl">
            Choose a new password for your <span className="text-brand-gradient">AutolytiQ account</span>
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            We protect every workspace with store-aware (tenant) resets. Confirm your new password below to regain access.
          </p>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground/80 lg:flex-row lg:items-center">
            <span className="font-semibold text-primary">Security tip</span>
            <span>Use a unique password with at least 12 characters and include numbers and symbols.</span>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <Card className="glass-card rounded-3xl border-none shadow-card-xl">
            <CardHeader className="space-y-4 pb-4 text-center">
              <CardTitle className="text-2xl font-semibold">Reset password</CardTitle>
              {metadata && (
                <p className="text-sm text-muted-foreground">
                  Updating credentials for <span className="font-medium text-primary">{metadata.user.firstName} {metadata.user.lastName}</span> in store
                  <span className="font-medium text-primary"> {metadata.tenant.id}</span> ({metadata.tenant.name}).
                </p>
              )}
            </CardHeader>
            <CardContent>
              {invalidState ? (
                <div className="space-y-4 text-center text-sm text-muted-foreground">
                  <p>{error instanceof Error ? error.message : 'Reset link is invalid or has expired.'}</p>
                  <div className="flex justify-center gap-3">
                    <Link href="/forgot-password">
                      <Button variant="ghost" size="sm">Request a new link</Button>
                    </Link>
                    <Link href="/">
                      <Button variant="ghost" size="sm">Back to experience</Button>
                    </Link>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Validating reset link…</div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="password">New password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Choose a strong password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter your new password"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="btn-aiq-primary w-full rounded-xl py-3 text-base font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating password…" : "Update password"}
                  </Button>
                </form>
              )}

              <Separator className="my-6" />

              <div className="space-y-3 text-center text-sm text-muted-foreground">
                <p>Need to return to sign in?</p>
                <div className="flex justify-center gap-3">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Back to sign in</Button>
                  </Link>
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
