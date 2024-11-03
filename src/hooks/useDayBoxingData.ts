import { useState, useCallback } from "react";
import { DayData, HourType, HourChangeEvent } from "../types";

export interface UseDayBoxingDataProps {
  initialData: DayData | DayData[];
  onChange?: (event: HourChangeEvent) => void;
}

export const useDayBoxingData = ({
  initialData,
  onChange,
}: UseDayBoxingDataProps) => {
  const [data, setData] = useState<DayData[]>(
    Array.isArray(initialData) ? initialData : [initialData]
  );

  const updateHour = useCallback(
    (date: string, hour: number, newType: HourType) => {
      setData((prevData) => {
        return prevData.map((day) => {
          if (day.date !== date) return day;

          const hourIndex = day.hours.findIndex((h) => h.hour === hour);
          if (hourIndex === -1) return day;

          const hourData = day.hours[hourIndex];
          const newHours = [...day.hours];
          newHours[hourIndex] = { ...hourData, type: newType };

          // 触发 onChange 回调
          onChange?.({
            hour,
            date,
            oldType: hourData.type,
            newType,
          });

          return {
            ...day,
            hours: newHours,
          };
        });
      });
    },
    [onChange]
  );

  return {
    data,
    updateHour,
  };
};
