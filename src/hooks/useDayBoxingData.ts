import { useState, useCallback } from "react";
import { DayData, HourType, HourChangeEvent, DayPattern } from "../types";
import { analyzeQHSegments } from "../utils/qhAnalysis";
import { createHoursFromPattern } from "../utils/dayPatternUtils";

export interface UseDayBoxingDataProps {
  patterns: DayPattern[];
  dates: string[];
  onChange?: (event: HourChangeEvent) => void;
}

const createDayData = (pattern: DayPattern, date: string): DayData => {
  const hours = createHoursFromPattern(pattern);
  const dayData: DayData = {
    date,
    hours,
    segments: [], // 暂时为空，后面会通过 QH 分析生成
  };

  return {
    ...dayData,
    qhSegments: analyzeQHSegments(dayData),
  };
};

export const useDayBoxingData = ({
  patterns,
  dates,
  onChange,
}: UseDayBoxingDataProps) => {
  const [data, setData] = useState<DayData[]>(
    patterns.map((pattern, index) => createDayData(pattern, dates[index]))
  );

  const updateHour = useCallback(
    (date: string, hour: number, newType: HourType, comment?: string) => {
      setData((prevData) => {
        return prevData.map((day) => {
          if (day.date !== date) return day;

          const hourIndex = day.hours.findIndex((h) => h.hour === hour);
          if (hourIndex === -1) return day;

          const hourData = day.hours[hourIndex];
          const newHours = [...day.hours];
          newHours[hourIndex] = {
            ...hourData,
            type: newType,
            comment: comment || hourData.comment,
          };

          // 触发 onChange 回调
          onChange?.({
            hour,
            date,
            oldType: hourData.type,
            newType,
            comment,
          });

          const updatedDay = {
            ...day,
            hours: newHours,
          };

          // 重新计算 QH 分段
          return {
            ...updatedDay,
            qhSegments: analyzeQHSegments(updatedDay),
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
