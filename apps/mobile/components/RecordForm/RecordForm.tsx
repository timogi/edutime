import React, { useState, useRef } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useForm } from "react-hook-form";
import { useLocalSearchParams, useRouter } from "expo-router";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { showSuccessToast, showErrorToast } from "@/components/ui/Toast";
import { HapticFeedback } from "@/lib/haptics";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors, themeForScheme } from "@/constants/Colors";
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
import type { RecordFormData } from "./record-form-types";
import {
  timeToMinutes,
  minutesToTime,
  parseTimeFromDB,
  calculateDurationMinutes,
  formatTimeForDB,
  seedTimeForPicker,
} from "./record-form-time";

function showToastMessage(
  message: string,
  type: "success" | "error" | "info" | "warn",
  t: (key: string) => string
) {
  if (type === "error") {
    showErrorToast(t("Index.toastError"), message);
  } else if (type === "success") {
    showSuccessToast(t("Index.toastSuccess"), message);
  } else if (type === "info") {
    showSuccessToast(t("Index.toastInfo"), message);
  } else if (type === "warn") {
    showErrorToast(t("Index.toastWarning"), message);
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
  const theme = themeForScheme(colorScheme);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTimePicker, setActiveTimePicker] = useState<
    "start" | "end" | null
  >(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const headerHeight = useHeaderHeight();

  const { user, categories, isLoading, configMode } = useUser();
  const { setActiveSession } = useStopWatch();
  const deleteRecordMutation = useDeleteRecord();
  const createRecordMutation = useCreateRecord();
  const updateRecordMutation = useUpdateRecord();
  const createStopwatchSessionMutation = useCreateStopwatchSession();
  const updateStopwatchSessionMutation = useUpdateStopwatchSession();
  const deleteStopwatchSessionMutation = useDeleteStopwatchSession();

  const allCategories: CategoryResult[] = categories;

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
    shouldUnregister: false,
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
                showToastMessage(t("Index.error-discarding-timer"), "error", t);
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
                showToastMessage(t("Index.error-deleting-record"), "error", t);
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
      if (selectedCategory.is_profile_category && selectedCategory.profile_category_id) {
        setValue("category_id", null);
        setValue("is_user_category", false);
        setValue("user_category_id", null);
      } else if (selectedCategory.is_further_employment) {
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

  function handleStartTimeChange(
    _event: DateTimePickerEvent,
    selectedTime?: Date
  ) {
    if (!selectedTime) return;
    setValue("startTime", selectedTime);

    const end = watch("endTime");
    if (end) {
      setValue(
        "duration",
        minutesToTime(calculateDurationMinutes(selectedTime, end))
      );
    } else {
      const durMin = timeToMinutes(watch("duration"));
      let endMin = timeToMinutes(selectedTime) + durMin;
      if (endMin >= 24 * 60) endMin -= 24 * 60;
      setValue("endTime", minutesToTime(endMin));
    }
  }

  function handleEndTimeChange(
    _event: DateTimePickerEvent,
    selectedTime?: Date
  ) {
    if (!selectedTime) return;
    setValue("endTime", selectedTime);

    const start = watch("startTime");
    if (start) {
      setValue(
        "duration",
        minutesToTime(calculateDurationMinutes(start, selectedTime))
      );
    } else {
      const durMin = timeToMinutes(watch("duration"));
      let startMin = timeToMinutes(selectedTime) - durMin;
      if (startMin < 0) startMin += 24 * 60;
      setValue("startTime", minutesToTime(startMin));
    }
  }

  function handleToggleTimePicker(type: "start" | "end") {
    HapticFeedback.light();

    if (type === activeTimePicker) {
      setActiveTimePicker(null);
      return;
    }

    setShowDatePicker(false);
    setIsExpanded(false);

    const currentStart = watch("startTime");
    const currentEnd = watch("endTime");
    const currentDuration = watch("duration");

    const needsSeed =
      type === "start" ? !currentStart : !currentEnd;

    if (needsSeed) {
      const seed = seedTimeForPicker(
        type,
        currentStart,
        currentEnd,
        currentDuration
      );
      if (type === "start") {
        handleStartTimeChange({} as DateTimePickerEvent, seed);
      } else {
        handleEndTimeChange({} as DateTimePickerEvent, seed);
      }
    }

    setActiveTimePicker(type);
  }

  function handleDurationChange(
    _event: DateTimePickerEvent,
    selectedTime: Date | undefined
  ) {
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

  function handleDateChange(
    _event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) {
    HapticFeedback.light();
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setValue("date", selectedDate);
    }
  }

  function resetTimes() {
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
      showToastMessage(t("Index.error-deleting-timer"), "error", t);
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
      showToastMessage(t("Index.error-creating-timer"), "error", t);
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
      showToastMessage(t("Index.error-saving-timer"), "error", t);
    }
  };

  async function onSubmit(data: RecordFormData) {
    HapticFeedback.light();
    if (!user) {
      HapticFeedback.error();
      showToastMessage(t("Index.error"), "error", t);
      return;
    }
    setLoading(true);

    try {
      const profileCatId = selectedCategory?.is_profile_category
        ? selectedCategory.profile_category_id ?? null
        : null;

      const baseRecord = {
        date: data.date.toISOString().split("T")[0],
        duration: timeToMinutes(data.duration),
        description: data.description || "",
        category_id: profileCatId ? null : (data.category_id || null),
        is_user_category: profileCatId ? false : (data.is_user_category || false),
        user_category_id: profileCatId ? null : (data.user_category_id || null),
        profile_category_id: profileCatId,
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
      showToastMessage(
        isEditing
          ? t("Index.error-updating-record")
          : t("Index.error-creating-record"),
        "error",
        t
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
        <SafeAreaView
          edges={Platform.OS === "ios" ? ["bottom", "left", "right"] : undefined}
          style={[
            styles.container,
            {
              backgroundColor: colorScheme === "dark" ? theme.gray[9] : "white",
            },
          ]}
        >
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
                paddingTop:
                  Platform.OS === "ios"
                    ? headerHeight + Spacing.sm
                    : Spacing.lg,
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
                  onToggleTimePicker={handleToggleTimePicker}
                  onStartTimeChange={handleStartTimeChange}
                  onEndTimeChange={handleEndTimeChange}
                  onResetTime={resetTimes}
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
