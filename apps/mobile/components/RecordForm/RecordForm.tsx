import React, { useState, useRef } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { useLocalSearchParams, useRouter } from "expo-router";
import { showSuccessToast, showErrorToast } from "@/components/ui/Toast";
import { HapticFeedback } from "@/lib/haptics";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { TextStyles, Spacing, BorderRadius, ShadowStyles, LayoutStyles } from "@/constants/Styles";

import { VStack } from "@gluestack-ui/themed";
import { useUser } from "@/contexts/UserContext";
import { CategoryResult, getCategories } from "@/lib/database/categories";
import { findCategory } from "@/lib/database/categories";
import {
  deleteStopwatchSession,
  fetchStopWatchSession,
  createStopwatchSession,
  updateStopwatchSession,
} from "@/lib/database/stopwatch";
import { Category, StopWatchSession } from "@/lib/types";
import {
  deleteTimeRecord,
  updateTimeRecord,
  insertTimeRecord,
} from "@/lib/database/records";
import { 
  useDeleteRecord, 
  useCreateRecord, 
  useUpdateRecord,
  useCreateStopwatchSession,
  useUpdateStopwatchSession,
  useDeleteStopwatchSession
} from "@/hooks/useRecordsQuery";
import { CreateTimerRecordButton } from "@/components/CreateTimerRecordButton";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { useTranslation } from "react-i18next";
import { useStopWatch } from "@/contexts/StopWatchContext";
import { config } from "@/gluestack-ui.config";

// Import sub-components
import { DateInput } from "./DateInput";
import { TimeInput } from "./TimeInput";
import { DurationInput } from "./DurationInput";
import { DescriptionInput } from "./DescriptionInput";
import { CategoryInput } from "./CategoryInput";
import { FooterButtons } from "./FooterButtons";

//-------------------------------
// Utility Functions
//-------------------------------
interface RecordFormData {
  date: Date;
  startTime: Date | null;
  endTime: Date | null;
  description?: string;
  category?: number;
  duration: Date; // A Date representing HH:mm (stored in hours/minutes)
  category_id?: number | null;
  is_user_category?: boolean;
  user_category_id?: number | null;
}

function timeToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function minutesToTime(minutes: number): Date {
  const date = new Date();
  date.setHours(Math.floor(minutes / 60));
  date.setMinutes(minutes % 60);
  return date;
}

function parseTimeFromDB(timeStr: string): Date | null {
  if (!timeStr || timeStr === "00:00:00") return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  return date;
}

function calculateDuration(startTime: Date, endTime: Date): number {
  let diff = endTime.getTime() - startTime.getTime();
  if (diff < 0) diff += 24 * 60 * 60 * 1000;
  return Math.round(diff / (1000 * 60));
}

function formatTimeForDB(date: Date | null): string | null {
  if (!date) return null;
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function showToast(
  message: string,
  type: "success" | "error" | "info" | "warn"
) {
  const positionValue = 0;

  // Use our custom toast
  if (type === "error") {
    showErrorToast("Error", message);
  } else if (type === "success") {
    showSuccessToast("Success", message);
  } else if (type === "info") {
    showSuccessToast("Info", message);
  } else if (type === "warn") {
    showErrorToast("Warning", message);
  }
}

//-------------------------------
// Component
//-------------------------------
export default function RecordForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTimePicker, setActiveTimePicker] = useState<
    "start" | "end" | null
  >(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timePickerValue, setTimePickerValue] = useState<Date>(new Date());
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);

  const { user, categories, isLoading } = useUser();
  const { setActiveSession } = useStopWatch();
  const deleteRecordMutation = useDeleteRecord();
  const createRecordMutation = useCreateRecord();
  const updateRecordMutation = useUpdateRecord();
  const createStopwatchSessionMutation = useCreateStopwatchSession();
  const updateStopwatchSessionMutation = useUpdateStopwatchSession();
  const deleteStopwatchSessionMutation = useDeleteStopwatchSession();

  const allCategories: CategoryResult[] = categories;

  const startTimeRef = useRef<View>(null);
  const endTimeRef = useRef<View>(null);
  const durationRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Determine if we're editing an existing record or creating a new one
  const existingRecord = params.record
    ? JSON.parse(params.record as string)
    : undefined;
  const recordId = existingRecord?.id as string | undefined;
  const isEditing = !!recordId;

  // Get stopwatch session ID if in timer mode
  const stopwatchSessionId = params.stopwatchSessionId as string | undefined;
  const stopwatchStart = params.startTime as string | undefined;
  const stopwatchDescription = params.description as string | null;
  const stopwatchCategory = params.category as string | null;

  // If you're receiving a date param (params.date), we'll use it for creation
  const dateParam = params.date as string | undefined;

  const [loading, setLoading] = useState(false);

  // --------------------
  // React Hook Form
  // --------------------
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RecordFormData>({
    defaultValues: {
      date:
        stopwatchSessionId && dateParam
          ? new Date(dateParam)
          : existingRecord
          ? new Date(existingRecord.date)
          : dateParam
          ? new Date(dateParam)
          : new Date(),
      startTime:
        stopwatchSessionId && stopwatchStart
          ? new Date(stopwatchStart)
          : existingRecord?.start_time
          ? parseTimeFromDB(existingRecord.start_time)
          : null,
      endTime: stopwatchSessionId
        ? new Date()
        : existingRecord?.end_time
        ? parseTimeFromDB(existingRecord.end_time)
        : null,
      description: stopwatchSessionId
        ? params.description || ""
        : existingRecord?.description || "",
      category: stopwatchSessionId
        ? params.category
        : existingRecord?.category_id,
      category_id: stopwatchSessionId
        ? params.category
        : existingRecord?.category_id || null,
      is_user_category: existingRecord?.is_user_category || false,
      user_category_id: existingRecord?.user_category_id || null,
      duration:
        stopwatchSessionId && stopwatchStart
          ? minutesToTime(
              Math.floor(
                (new Date().getTime() - new Date(stopwatchStart).getTime()) /
                  (1000 * 60)
              )
            )
          : existingRecord
          ? minutesToTime(existingRecord.duration)
          : new Date(0, 0, 0, 1, 0), // default 1 hour
    },
  });

  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const duration = watch("duration");
  const date = watch("date");
  const [selectedCategory, setSelectedCategory] = useState<
    CategoryResult | null | undefined
  >(() => {
    if (existingRecord) {
      const category = findCategory(existingRecord, allCategories);
      return category || null;
    }
    if (stopwatchCategory) {
      return (
        allCategories.find((c) => c.id === Number(stopwatchCategory)) || null
      );
    }
    return null;
  });

  // --------------------
  // Handlers
  // --------------------
  async function handleDelete() {
    HapticFeedback.light();
    if (stopwatchSessionId) {
      Alert.alert(
        t("Index.discardTimer"),
        t("Index.discardTimerConfirmation"),
        [
          { text: t("Index.cancel"), style: "cancel" },
          {
            text: t("Index.discardTimer"),
            style: "destructive",
            onPress: async () => {
              try {
                await deleteStopwatchSessionMutation.mutateAsync(Number(stopwatchSessionId));
                setActiveSession(null);
                router.back();
              } catch (error) {
                HapticFeedback.error();
                showToast(t("Index.error-discarding-timer"), "error");
              }
            },
          },
        ]
      );
    } else if (recordId) {
      Alert.alert(
        t("Index.deleteRecord"),
        t("Index.deleteRecordConfirmation"),
        [
          { text: t("Index.cancel"), style: "cancel" },
          {
            text: t("Index.deleteRecord"),
            style: "destructive",
            onPress: async () => {
              try {
                await deleteRecordMutation.mutateAsync(Number(recordId));
                HapticFeedback.success();
                router.back();
              } catch (error) {
                HapticFeedback.error();
                showToast(t("Index.error-deleting-record"), "error");
              }
            },
          },
        ]
      );
    }
  }

  function handleCategorySelect(selectedCategory: CategoryResult | null) {
    HapticFeedback.light();
    setSelectedCategory(selectedCategory);
    if (selectedCategory) {
      if (selectedCategory.is_further_employment) {
        setValue("user_category_id", selectedCategory.id);
        setValue("is_user_category", true);
        setValue("category_id", null);
      } else {
        setValue("category_id", selectedCategory.id);
        setValue("is_user_category", false);
        setValue("user_category_id", null);
      }
    } else {
      setValue("category_id", null);
      setValue("is_user_category", false);
      setValue("user_category_id", null);
    }
  }

  function handleStartTimeChange(event: any, selectedTime?: Date) {
    if (selectedTime) {
      setValue("startTime", selectedTime);

      const end = watch("endTime");
      if (end) {
        // beide Zeiten gesetzt → Duration anpassen
        const diffMin = calculateDuration(selectedTime, end);
        setValue("duration", minutesToTime(diffMin));
      } else {
        // End noch null → End aus Duration setzen
        const durMin = timeToMinutes(watch("duration"));
        let endMin = timeToMinutes(selectedTime) + durMin;
        if (endMin >= 24 * 60) endMin -= 24 * 60;
        setValue("endTime", minutesToTime(endMin));
      }
    }
  }

  function handleEndTimeChange(event: any, selectedTime?: Date) {
    if (selectedTime) {
      setValue("endTime", selectedTime);

      const start = watch("startTime");
      if (start) {
        // beide Zeiten gesetzt → Duration anpassen
        const diffMin = calculateDuration(start, selectedTime);
        setValue("duration", minutesToTime(diffMin));
      } else {
        // Start noch null → Start aus Duration setzen
        const durMin = timeToMinutes(watch("duration"));
        let startMin = timeToMinutes(selectedTime) - durMin;
        if (startMin < 0) startMin += 24 * 60;
        setValue("startTime", minutesToTime(startMin));
      }
    }
  }

  function handleDurationChange(event: any, selectedTime: Date | undefined) {
    HapticFeedback.light();
    if (Platform.OS === "android") {
      setIsExpanded(false);
    }
    if (selectedTime) {
      setValue("duration", selectedTime);
      // If we have start time, recalc end time
      if (startTime) {
        const durationMinutes = timeToMinutes(selectedTime);
        const startMinutes = timeToMinutes(startTime);
        let totalMinutes = startMinutes + durationMinutes;
        if (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60;
        setValue("endTime", minutesToTime(totalMinutes));
      }
    }
  }

  function handleDateChange(event: any, selectedDate: Date | undefined) {
    HapticFeedback.light();
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setValue("date", selectedDate);
    }
  }

  function resetTime(type: "start" | "end") {
    HapticFeedback.light();
    setValue("startTime", null);
    setValue("endTime", null);
    setActiveTimePicker(null);
  }

  const handleCreateAndRestart = async () => {
    HapticFeedback.light();
    try {
      await handleSubmit(onSubmit)();
    } catch {
      return; // Form submission failed, don't continue
    }

    try {
      await deleteStopwatchSessionMutation.mutateAsync(Number(stopwatchSessionId));
    } catch {
      HapticFeedback.error();
      showToast(t("Index.error-deleting-timer"), "error");
      return;
    }

    try {
      await createStopwatchSessionMutation.mutateAsync({
        user_id: user?.user_id || '',
        start_time: new Date(),
        description: '',
      });
    } catch {
      HapticFeedback.error();
      showToast(t("Index.error-creating-timer"), "error");
    }
  };

  const handleSaveAndContinue = async () => {
    HapticFeedback.light();
    try {
      await updateStopwatchSessionMutation.mutateAsync({
        id: Number(stopwatchSessionId),
        category_id: watch("category_id") || undefined,
        description: watch("description") || undefined,
        is_user_category: watch("is_user_category"),
        user_category_id: watch("user_category_id") || undefined,
      });
      router.back();
    } catch {
      HapticFeedback.error();
      showToast(t("Index.error-saving-timer"), "error");
    }
  };

  async function onSubmit(data: RecordFormData) {
    HapticFeedback.light();
    if (!user) {
      HapticFeedback.error();
      showToast(t("Index.error"), "error");
      return;
    }
    setLoading(true);

    try {
      const baseRecord = {
        date: data.date.toISOString().split("T")[0],
        duration: timeToMinutes(data.duration),
        description: data.description || "",
        category_id: data.category_id || null,
        is_user_category: data.is_user_category || false,
        user_category_id: data.user_category_id || null,
        start_time: formatTimeForDB(data.startTime),
        end_time: formatTimeForDB(data.endTime),
      };

      if (isEditing && recordId) {
        // Update
        await updateRecordMutation.mutateAsync({
          id: Number(recordId),
          ...baseRecord,
        });
      } else {
        // Create
        await createRecordMutation.mutateAsync({
          ...baseRecord,
          user_id: user.user_id,
        });
        if (stopwatchSessionId) {
          await deleteStopwatchSessionMutation.mutateAsync(Number(stopwatchSessionId));
          setActiveSession(null);
        }
      }
      router.back();
    } catch (error) {
      HapticFeedback.error();
      showToast(
        isEditing
          ? t("Index.error-updating-record")
          : t("Index.error-creating-record"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------
  // Render
  // --------------------
  return (
    <GluestackUIProvider config={config}>
      {/* so menu pops up in front */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, {
          backgroundColor: colorScheme === "dark" ? theme.gray[9] : "white"
        }]}
      >
        <SafeAreaView style={[styles.container, {
          backgroundColor: colorScheme === "dark" ? theme.gray[9] : "white"
        }]}>
          {/* Scrollable Form */}
          <ScrollView
            ref={scrollViewRef}
            style={[styles.scrollArea, {
              backgroundColor: colorScheme === "dark" ? theme.gray[9] : "#f3f3f3"
            }]}
            contentContainerStyle={[
              styles.scrollContent,
              {
                backgroundColor:
                  colorScheme === "dark" ? theme.background : "#f3f3f3",
              },
            ]}
          >
            <View
              style={[
                styles.formCard,
                {
                  backgroundColor:
                    colorScheme === "dark" ? theme.gray[9] : "white",
                },
              ]}
            >
              <VStack space="md">
                {/* DATE */}
                <DateInput
                  control={control}
                  showDatePicker={showDatePicker}
                  onToggleDatePicker={() => {
                    HapticFeedback.light();
                    setShowDatePicker(!showDatePicker);
                    setActiveTimePicker(null);
                    setIsExpanded(false);
                  }}
                  onDateChange={handleDateChange}
                  colorScheme={colorScheme}
                  theme={theme}
                />

                {/* START/END Time */}
                <TimeInput
                  control={control}
                  activeTimePicker={activeTimePicker}
                  onToggleTimePicker={(type: "start" | "end") => {
                    if (type === activeTimePicker) {
                      setActiveTimePicker(null);
                    } else {
                      setActiveTimePicker(type);
                      setShowDatePicker(false);
                      setIsExpanded(false);

                      // Set picker value manually from the corresponding time
                      const selectedValue =
                        type === "start" ? watch("startTime") : watch("endTime");
                      setTimePickerValue(selectedValue || new Date());
                    }
                  }}
                  onStartTimeChange={handleStartTimeChange}
                  onEndTimeChange={handleEndTimeChange}
                  onResetTime={resetTime}
                  timePickerValue={timePickerValue}
                  setTimePickerValue={setTimePickerValue}
                  colorScheme={colorScheme}
                  theme={theme}
                />

                {/* DURATION */}
                <DurationInput
                  control={control}
                  isExpanded={isExpanded}
                  onToggleDurationPicker={() => {
                    HapticFeedback.light();
                    setIsExpanded(!isExpanded);
                    setActiveTimePicker(null);
                    setShowDatePicker(false);
                  }}
                  onDurationChange={handleDurationChange}
                  colorScheme={colorScheme}
                  theme={theme}
                />

                {/* CATEGORY */}
                <CategoryInput
                  selectedCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                  colorScheme={colorScheme}
                  theme={theme}
                />

                {/* DESCRIPTION */}
                <DescriptionInput
                  control={control}
                  isDescriptionFocused={isDescriptionFocused}
                  onFocus={() => {
                    setIsDescriptionFocused(true);
                    // Close all pickers when description field is focused
                    setShowDatePicker(false);
                    setActiveTimePicker(null);
                    setIsExpanded(false);
                    // Scroll to bottom when description is focused
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({
                        animated: true,
                      });
                    }, 100);
                  }}
                  onBlur={() => setIsDescriptionFocused(false)}
                  colorScheme={colorScheme}
                  theme={theme}
                />
              </VStack>
            </View>
          </ScrollView>

          {/* FOOTER BUTTONS */}
          <View style={[styles.footerContainer, {
            backgroundColor: colorScheme === "dark" ? theme.gray[9] : "white"
          }]}>
            <FooterButtons
              isEditing={isEditing}
              stopwatchSessionId={stopwatchSessionId}
              onDelete={handleDelete}
              onSubmit={handleSubmit(onSubmit)}
              onCreateAndRestart={handleCreateAndRestart}
              onSaveAndContinue={handleSaveAndContinue}
              loading={loading}
              colorScheme={colorScheme}
              theme={theme}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </GluestackUIProvider>
  );
}

//-------------------------------
// Styles
//-------------------------------
const styles = StyleSheet.create({
  container: {
    ...LayoutStyles.container,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: 100,
  },
  formCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...ShadowStyles,
  },
  footerContainer: {
    // This ensures the footer area is completely white and extends to the bottom
  },
});
