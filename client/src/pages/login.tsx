import { FormEvent, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth, type AuthUser } from "@/hooks/useAuth";

interface LoginResponse extends AuthUser {}

export default function Login() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [storeId, setStoreId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        tenantId: storeId.trim(),
        username: username.trim(),
        password,
      });

      const data = (await response.json()) as LoginResponse;

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      toast({ title: "Welcome back", description: `Signed in as ${data.firstName} ${data.lastName}` });

      const target = data.access?.homePath ?? "/dashboard";
      navigate(target, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in";
      toast({
        title: "Sign in failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center justify-end">
          <ThemeToggle />
        </div>
        <Card className="rounded-3xl border border-border/40 shadow-lg">
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-2xl font-semibold">Sign in to AutolytiQ</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your username, password, and store ID (tenant ID) to continue.
            </p>
            {user && (
              <div className="rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                Signed in as {user.firstName} {user.lastName}. Signing in again will switch tenants.
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="sarah.johnson"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeId">Store ID (Tenant ID)</Label>
                <Input
                  id="storeId"
                  value={storeId}
                  onChange={(event) => setStoreId(event.target.value)}
                  placeholder="TENANT-123"
                  autoComplete="organization"
                  required
                />
              </div>
              <Button
                type="submit"
                className="btn-aiq-primary w-full rounded-xl py-3 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <div className="mt-4 flex justify-end text-xs text-muted-foreground">
              <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          </CardContent>
        </Card>
        <div className="text-center text-xs text-muted-foreground">
          <p>Need help? Contact support@autolytiq.com.</p>
        </div>
      </div>
    </div>
  );
}
