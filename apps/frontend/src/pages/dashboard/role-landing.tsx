import { useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getUserLandingPath, isHomePath } from '@/lib/userHomePath';

export default function RoleLanding() {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  const targetPath = useMemo(() => getUserLandingPath(user), [user]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      if (!location.startsWith('/login')) {
        navigate('/login');
      }
      return;
    }

    if (!isHomePath(location) && location !== targetPath) {
      return;
    }

    if (location !== targetPath) {
      navigate(targetPath);
    }
  }, [isLoading, user, targetPath, location, navigate]);

  return (
    <div className="flex min-h-[calc(var(--vh,1vh)*100)] flex-col items-center justify-center bg-surface-base">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        <p className="text-sm font-medium">Routing you to your workspace…</p>
      </div>
    </div>
  );
}
