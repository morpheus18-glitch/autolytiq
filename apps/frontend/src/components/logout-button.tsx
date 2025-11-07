import { Button } from '@repo/ui';
import { LogOut } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearAuthToken } from '@/lib/auth';

export default function LogoutButton() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout');
      return response.json();
    },
    onSuccess: () => {
      // Clear authentication token
      clearAuthToken();

      queryClient.invalidateQueries({ queryKey: ['/api/auth/session'] });
      queryClient.clear();

      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      navigate('/login');
    },
    onError: () => {
      toast({
        title: 'Logout Failed',
        description: 'There was an error logging out.',
        variant: 'destructive',
      });
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <LogOut className="h-4 w-4 mr-2" />
      {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
    </Button>
  );
}