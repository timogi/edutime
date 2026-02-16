import { StyleSheet, View, TouchableOpacity, Platform } from "react-native";
import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { startOfWeek, addDays, format } from "date-fns";
import { de, fr, enUS } from "date-fns/locale";
import { Card } from "@gluestack-ui/themed";
import { VStack } from "@gluestack-ui/themed";
import PagerView from "react-native-pager-view";
import { useUser } from "@/contexts/UserContext";
import { useDailyDurationsQuery } from "@/hooks/useDailyDurationsQuery";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import { HapticFeedback } from "@/lib/haptics";

interface DayPickerProps {
  date: Date;
  setDate: (date: Date) => void;
}

export const WeekdayPicker = ({ date, setDate }: DayPickerProps) => {
  const { user } = useUser();
  const colorScheme = useColorScheme();
  const { i18n } = useTranslation();
  const pagerRef = useRef<PagerView>(null);
  const userInteractedRef = useRef(false);
  
  const startOfCurrentWeek = useMemo(
    () => startOfWeek(date, { weekStartsOn: 1 }),
    [date]
  );
  
  const endOfCurrentWeek = useMemo(
    () => addDays(startOfCurrentWeek, 6),
    [startOfCurrentWeek]
  );
  
  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) =>
      addDays(startOfCurrentWeek, i)
    );
  }, [startOfCurrentWeek]);

  const isWeekendDate = useMemo(() => {
    const weekendDays = days.slice(5);
    return weekendDays.some(
      (day) => day.toDateString() === date.toDateString()
    );
  }, [days, date]);

  const [currentPage, setCurrentPage] = useState(() => isWeekendDate ? 1 : 0);

  const { data: dailyDurations = {}, isLoading: loading } = useDailyDurationsQuery(
    format(startOfCurrentWeek, 'yyyy-MM-dd'),
    format(endOfCurrentWeek, 'yyyy-MM-dd'),
    user?.user_id || ""
  );

  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours >= 100) {
      return "99+h";
    }
    return `${hours.toString().padStart(2, "0")}:${remainingMinutes
      .toString()
      .padStart(2, "0")}`;
  }, []);

  const weekdays = days.slice(0, 5);
  const weekend = days.slice(5);

  const onPageSelected = useCallback((e: any) => {
    const newPage = e.nativeEvent.position;
    setCurrentPage(newPage);
    userInteractedRef.current = true;
  }, []);

  const handleDayPress = useCallback((day: Date) => {
    HapticFeedback.selection();
    setDate(day);
    userInteractedRef.current = false; // Reset interaction flag when date changes
  }, [setDate]);

  useEffect(() => {
    const weekendDays = days.slice(5);
    const isWeekendDate = weekendDays.some(
      (day) => day.toDateString() === date.toDateString()
    );
    const expectedPage = isWeekendDate ? 1 : 0;
    
    // Only auto-switch if user hasn't manually interacted with the pager
    if (!userInteractedRef.current && currentPage !== expectedPage) {
      pagerRef.current?.setPage(expectedPage);
      setCurrentPage(expectedPage);
    }
  }, [date, days, currentPage]);

  // Reusable DayCard component
  const DayCard = useCallback(({ day }: { day: Date }) => {
    const isSelected = date.toDateString() === day.toDateString();
    const formattedDate = format(day, "yyyy-MM-dd");
    const duration = !loading ? dailyDurations[formattedDate] || 0 : 0;
    const isDark = colorScheme === 'dark';

    return (
      <TouchableOpacity
        key={day.toString()}
        onPress={() => handleDayPress(day)}
        style={styles.dayButton}
      >
        <Card
          variant={isSelected ? "filled" : "outline"}
          size="sm"
          style={[
            styles.card,
            isSelected 
              ? (isDark ? styles.selectedDayDark : styles.selectedDay) 
              : (isDark ? styles.unselectedDayDark : styles.unselectedDay)
          ]}
        >
          <VStack style={styles.textContainer}>
            <ThemedText style={styles.weekday}>
              {format(day, "EE", { 
                locale: i18n.language === 'de' ? de : i18n.language === 'fr' ? fr : enUS 
              })}
            </ThemedText>
            <ThemedText style={styles.date}>
              {format(day, "d.M", { 
                locale: i18n.language === 'de' ? de : i18n.language === 'fr' ? fr : enUS 
              })}
            </ThemedText>
            <ThemedText style={styles.duration}>
              {formatDuration(duration)}
            </ThemedText>
          </VStack>
        </Card>
      </TouchableOpacity>
    );
  }, [date, loading, dailyDurations, colorScheme, i18n.language, handleDayPress, formatDuration]);

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={isWeekendDate ? 1 : 0}
        onPageSelected={onPageSelected}
      >
        <View key="1" style={styles.cardContainer}>
          {weekdays.map((day) => <DayCard key={day.toString()} day={day} />)}
        </View>

        <View key="2" style={styles.cardContainer}>
          {weekend.map((day) => <DayCard key={day.toString()} day={day} />)}
        </View>
      </PagerView>

      <View style={styles.dotsContainer}>
        <View style={[styles.dot, currentPage === 0 && styles.activeDot]} />
        <View style={[styles.dot, currentPage === 1 && styles.activeDot]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    gap: 0,
  },
  pagerView: {
    height: 100,
  },
  daysContainer: {
    flex: 1,
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  dayButton: {
    width: 60,
    height: 90,
  },
  card: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDay: {
    borderWidth: 1,
    borderColor: Colors.light.primary[6],
    backgroundColor: Colors.light.primary[0],
  },
  selectedDayDark: {
    borderWidth: 1,
    borderColor: Colors.dark.primary[3],
    backgroundColor: Colors.dark.primary[9],
  },
  unselectedDay: {
    borderWidth: 1,
    borderColor: Colors.light.gray[4],
    backgroundColor: "white"
  },
  unselectedDayDark: {
    borderWidth: 1,
    borderColor: Colors.dark.gray[4],
    backgroundColor: "#1A1B1E"
  },
  weekday: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: 'center',
  },
  date: {
    fontSize: 12,
    textAlign: 'center',
  },
  duration: {
    fontSize: 12,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  activeDot: {
    backgroundColor: "#333",
  },
});