import { useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getUserLandingPath, isHomePath } from '@/lib/userHomePath';
import { Skeleton } from '@repo/ui';

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
    <div style={{
      display: 'flex',
      minHeight: 'calc(var(--vh,1vh)*100)',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <Loader2 style={{ width: '2rem', height: '2rem', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Routing you to your workspace…</p>
      </div>
    </div>
  );
}
