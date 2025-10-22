import { FormEvent, useMemo, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth, type AuthUser } from "@/hooks/useAuth";

const STORE_DIRECTORY = [
  { id: "MAIN", label: "AutolytiQ Flagship Store" },
];

interface LoginResponse extends AuthUser {}

export default function Login() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const defaultStoreId = useMemo(() => STORE_DIRECTORY[0]?.id ?? "", []);
  const [storeId, setStoreId] = useState(defaultStoreId);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        storeId: storeId.trim(),
        username: username.trim(),
        password,
      });

      const data = (await response.json()) as LoginResponse;

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      toast({
        title: "Welcome back",
        description: `Signed in as ${data.firstName} ${data.lastName}`,
      });

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
    <div className="landing-surface px-4 py-12 text-foreground">
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="absolute inset-x-8 top-10 h-[420px] rounded-full blur-3xl hero-spotlight" aria-hidden="true" />
        <div className="absolute inset-0 grid-overlay opacity-60 dark:opacity-40" aria-hidden="true" />

        <div className="relative z-10 flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 rounded-full border border-primary/25 bg-primary/8 px-4 py-2 text-primary">
            <span className="text-xs font-semibold uppercase tracking-[0.3em]">AutolytiQ Secure Access</span>
          </div>
          <h1 className="text-3xl font-semibold leading-snug sm:text-4xl lg:text-5xl">
            Log in to your <span className="text-brand-gradient">AutolytiQ workspace</span>
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Use your store identifier along with your AutolytiQ username and password. Access is tailored per tenant so only the pages you need are loaded.
          </p>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground/80 lg:flex-row lg:items-center">
            <span className="font-semibold text-primary">Need help?</span>
            <span>Contact support@autolytiq.com to reset credentials or add stores.</span>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-4 flex items-center justify-end gap-2">
            <ThemeToggle />
          </div>
          <Card className="glass-card rounded-3xl border-none shadow-card-xl">
            <CardHeader className="space-y-4 pb-4 text-center">
              <CardTitle className="text-2xl font-semibold">Tenant login</CardTitle>
              <p className="text-sm text-muted-foreground">
                Authenticate with your store ID, username, and password.
              </p>
              {user && (
                <div className="rounded-xl border border-border/50 bg-surface-base/80 px-3 py-2 text-xs text-muted-foreground">
                  Already signed in as {user.firstName} {user.lastName}. Signing in again will switch tenants.
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="storeId">Store identifier</Label>
                  <Input
                    id="storeId"
                    autoComplete="organization"
                    value={storeId}
                    onChange={(event) => setStoreId(event.target.value.toUpperCase())}
                    placeholder="MAIN"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {STORE_DIRECTORY.map((store) => store.id).join(", ")} accepted.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    autoComplete="username"
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
                <Button
                  type="submit"
                  className="btn-aiq-primary w-full rounded-xl py-3 text-base font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </Button>
              </form>

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

              <div className="space-y-2 text-center text-sm text-muted-foreground">
                <p>Looking for a different tenant or store?</p>
                <p>Provide the store ID assigned during onboarding (for example: MAIN).</p>
              </div>

              <div className="pt-4 text-center">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
                    Back to experience
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
