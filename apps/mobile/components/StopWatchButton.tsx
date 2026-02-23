import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { IconSymbol } from "./ui/IconSymbol";
import { Button, ButtonText, ButtonIcon } from "@gluestack-ui/themed";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useStopWatch } from "@/contexts/StopWatchContext";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { showErrorToast } from "@/components/ui/Toast";
import { HapticFeedback } from "@/lib/haptics";

import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useCreateStopwatchSession } from "@/hooks/useRecordsQuery";

export const StopWatchButton = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [isPressed, setIsPressed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { activeSession, loading, error } = useStopWatch();
  const { user } = useUser();
  const { t } = useTranslation();
  
  const { navigateToRecordForm } = useNavigationGuard();
  const queryClient = useQueryClient();
  const createStopwatchSessionMutation = useCreateStopwatchSession();

  useEffect(() => {
    let interval: number;
    if (activeSession) {
      interval = setInterval(() => {
        const start = new Date(activeSession.start_time);
        const now = new Date();
        const diff = now.getTime() - start.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setElapsedTime(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }, 1000);
    } else {
      setElapsedTime("00:00:00");
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeSession]);

  const handlePress = async () => {
    if (activeSession && activeSession.id) {
      navigateToRecordForm({
        date: new Date().toISOString().split('T')[0], // Add required date field
        title: t("Index.timer"),
        stopwatchSessionId: activeSession.id.toString(),
        startTime: activeSession.start_time.toISOString(),
        description: activeSession.description,
        category: activeSession.category_id?.toString(),
      });
    } else {
      try {
        setIsCreating(true);
        
        // First, check if there's already an active session in the database
        const { data: existingSessions, error: fetchError } = await supabase
          .from('stopwatch_sessions')
          .select('*')
          .eq('user_id', user?.user_id)
          .order('start_time', { ascending: false })
          .limit(1);
        
        if (fetchError) {
          console.error('Error fetching existing sessions:', fetchError);
        }
        
        // If there's already a session for this user, refresh the cache and return
        if (existingSessions && existingSessions.length > 0) {
          console.log('Found existing session, refreshing cache...');
          // Refresh the cache to pick up the existing session
          await queryClient.invalidateQueries({ queryKey: ['stopwatchSessions'] });
          return;
        }
        
        // No existing session found, create a new one
        await createStopwatchSessionMutation.mutateAsync({
          user_id: user?.user_id || '',
          start_time: new Date(),
          description: '',
          category_id: undefined,
          is_user_category: false,
          user_category_id: undefined,
        });
      } catch (error) {
        console.error('Timer creation error:', error);
        
        // Check if it's a unique constraint violation (session already exists)
        if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
          console.log('Session already exists, refreshing cache...');
          // Refresh the cache to pick up the existing session
          await queryClient.invalidateQueries({ queryKey: ['stopwatchSessions'] });
          return; // Don't show error, just refresh and continue
        }
        
        // Only show error for other types of errors
        HapticFeedback.error();
        showErrorToast(t("Index.error"), t("Index.error-creating-timer"));
      } finally {
        setIsCreating(false);
      }
    }
  };

  return (
    <Button
      onPress={handlePress}
      style={styles.buttonContainer}
      size="md"
      variant="solid"
      onPressIn={() => {
        HapticFeedback.light();
        setIsPressed(true);
      }}
      onPressOut={() => setIsPressed(false)}
      isDisabled={isCreating}
    >
      <LinearGradient
        colors={[
          isPressed ? theme.red[7] : theme.red[6],
          isPressed ? theme.primary[7] : theme.primary[6],
        ]}
        start={{ x: -0.1, y: 0 }}
        end={{ x: 1.1, y: 0 }}
        style={[styles.gradient]}
        locations={[0, 1]}
      >
        <IconSymbol name="stopwatch" size={20} color="white" />
        <ButtonText
          style={[styles.buttonText, activeSession && styles.timerText]}
        >
          {activeSession ? elapsedTime : t("Index.timer")}
        </ButtonText>
      </LinearGradient>
    </Button>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    padding: 0,
    overflow: "hidden",
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center", 
    justifyContent: "center",
    width: "135%",
    height: "100%",
    gap: 8,
  },
  buttonText: {
    color: "white",
  },
  timerText: {
    width: 78, // Fixed width to accommodate "00:00:00"
  },
});
