import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'free' | 'premium' | 'admin';

export function useUserRole() {
  const [role, setRole] = useState<UserRole>('free');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole('free');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        setRole((data?.role as UserRole) || 'free');
      } catch (error) {
        toast({
          title: 'Error fetching user role',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive'
        });
        setRole('free');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();

    // Subscribe to role changes
    const channel = supabase
      .channel('user_roles_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_roles'
        },
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && payload.new.user_id === user.id) {
            setRole(payload.new.role as UserRole);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return { role, loading, isPremium: role === 'premium' || role === 'admin', isAdmin: role === 'admin' };
}
