import { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { useStopwatchSessionQuery, useCreateStopwatchSession, useUpdateStopwatchSession, useDeleteStopwatchSession } from '@/hooks/useRecordsQuery';
import { StopWatchSession } from '@/lib/types';
import { useUser } from './UserContext';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

interface StopWatchContextType {
  activeSession: StopWatchSession | null;
  setActiveSession: (session: StopWatchSession | null) => void;
  loading: boolean;
  error: Error | null;
}

const StopWatchContext = createContext<StopWatchContextType | undefined>(undefined);

export function StopWatchProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { data: activeSession, isLoading: loading, error } = useStopwatchSessionQuery(user?.user_id || '');
  const createStopwatchSessionMutation = useCreateStopwatchSession();
  const updateStopwatchSessionMutation = useUpdateStopwatchSession();
  const deleteStopwatchSessionMutation = useDeleteStopwatchSession();
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<any>(null);

  const setActiveSession = (session: StopWatchSession | null) => {
    // This is handled by React Query mutations now
    // The session will be updated through the mutations
  };

  // Set up Supabase real-time listener for stopwatch sessions
  useEffect(() => {
    if (!user?.user_id) return;


    // Clean up existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // Create new subscription with broader event handling
    subscriptionRef.current = supabase
      .channel('stopwatch_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'stopwatch_sessions',
          // Remove user filter to catch all events, then filter in handler
        },
        async (payload) => {
          // For DELETE events, we can't get user_id from payload.old (only contains id)
          // So we'll process all DELETE events and let the query handle the filtering
          let shouldProcess = false;
          
          if (payload.eventType === 'DELETE') {
            // For DELETE events, process all and let the query determine if user has active session
            shouldProcess = true;
          } else {
            // For INSERT/UPDATE events, check user_id
            const eventUserId = payload.new?.user_id;
            
            if (eventUserId === user.user_id) {
              shouldProcess = true;
            }
          }
          
          if (shouldProcess) {
            await queryClient.invalidateQueries({ queryKey: ['stopwatchSessions', user?.user_id] });
            await queryClient.invalidateQueries({ queryKey: ['stopwatchSessions'] });
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [user?.user_id, queryClient]);

  const stopWatchState = {
    activeSession,
    setActiveSession,
    loading,
    error,
    createStopwatchSession: createStopwatchSessionMutation.mutateAsync,
    updateStopwatchSession: updateStopwatchSessionMutation.mutateAsync,
    deleteStopwatchSession: deleteStopwatchSessionMutation.mutateAsync,
  };

  return (
    <StopWatchContext.Provider value={stopWatchState}>
      {children}
    </StopWatchContext.Provider>
  );
}

export function useStopWatch() {
  const context = useContext(StopWatchContext);
  if (context === undefined) {
    throw new Error('useStopWatch must be used within a StopWatchProvider');
  }
  return context;
}
