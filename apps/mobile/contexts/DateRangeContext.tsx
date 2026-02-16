import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';

interface DateRangeContextType {
  startDate: Date;
  endDate: Date;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setDateRange: (startDate: Date, endDate: Date) => void;
  isLoading: boolean;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

interface DateRangeProviderProps {
  children: ReactNode;
}

export const DateRangeProvider: React.FC<DateRangeProviderProps> = ({ children }) => {
  const { user, refreshUserData } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize dates based on user's custom dates or fallback to default logic
  const getInitialDates = () => {
    if (user?.stat_start_date && user?.stat_end_date) {
      const start = new Date(user.stat_start_date);
      const end = new Date(user.stat_end_date);
      // Validate dates
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        return { startDate: start, endDate: end };
      }
    }
    
    // Fallback to current logic
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const startYear = currentMonth >= 7 ? currentYear : currentYear - 1;
    return {
      startDate: new Date(startYear, 7, 1),
      endDate: new Date(startYear + 1, 6, 31)
    };
  };

  const initialDates = getInitialDates();
  const [startDate, setStartDateState] = useState(initialDates.startDate);
  const [endDate, setEndDateState] = useState(initialDates.endDate);

  // Update dates when user data changes
  useEffect(() => {
    if (user?.stat_start_date && user?.stat_end_date) {
      const start = new Date(user.stat_start_date);
      const end = new Date(user.stat_end_date);
      // Validate dates before setting
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        setStartDateState(start);
        setEndDateState(end);
      }
    }
  }, [user?.stat_start_date, user?.stat_end_date]);

  const setStartDate = async (date: Date) => {
    setStartDateState(date);
    await updateUserStatisticsDates(date, endDate);
  };

  const setEndDate = async (date: Date) => {
    setEndDateState(date);
    await updateUserStatisticsDates(startDate, date);
  };

  const setDateRange = async (newStartDate: Date, newEndDate: Date) => {
    setStartDateState(newStartDate);
    setEndDateState(newEndDate);
    await updateUserStatisticsDates(newStartDate, newEndDate);
  };

  const updateUserStatisticsDates = async (newStartDate: Date, newEndDate: Date) => {
    if (!user?.user_id) return;
    
    setIsLoading(true);
    try {
      const startDateStr = newStartDate.toISOString().split('T')[0];
      const endDateStr = newEndDate.toISOString().split('T')[0];
      
      // Only update if dates have actually changed
      if (startDateStr !== user.stat_start_date || endDateStr !== user.stat_end_date) {
        const { updateUserStatisticsDates } = await import('@/lib/database/user');
        await updateUserStatisticsDates(user.user_id, startDateStr, endDateStr);
        // Refresh user data to reflect the changes
        await refreshUserData();
      }
    } catch (error) {
      console.error('Error updating date range:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: DateRangeContextType = {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setDateRange,
    isLoading,
  };

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = (): DateRangeContextType => {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
};
