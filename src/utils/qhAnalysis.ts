import { DayData, HourData, QHAnalysis, PartType } from "../types";

// 分析一段时间内的主导类型
const analyzeTimeRange = (hours: HourData[], start: number, end: number) => {
  const typeCounts: Record<string, number> = {};

  for (let i = start; i < end; i++) {
    const hour = hours.find((h) => h.hour === i);
    if (hour) {
      typeCounts[hour.type] = (typeCounts[hour.type] || 0) + 1;
    }
  }

  const sortedTypes = Object.entries(typeCounts).sort(([, a], [, b]) => b - a);

  const mainType = sortedTypes[0]?.[0];
  const secondaryType = sortedTypes[1]?.[0];

  let type: PartType = "full";
  if (sortedTypes.length > 2) {
    type = "chaos";
  } else if (sortedTypes.length === 2) {
    const [first, second] = sortedTypes;
    if (Math.abs(first[1] - second[1]) <= 1) {
      type = "balance";
    } else if (second[1] >= 2) {
      type = "mix";
    }
  }

  return {
    type,
    mainType,
    secondaryType: type !== "full" ? secondaryType : undefined,
  };
};

export const analyzeQHSegments = (day: DayData): QHAnalysis[] => {
  const sleepStart = day.hours[0].hour; // 第一个小时作为睡眠开始时间

  // 定义 QH 分段
  const segments: QHAnalysis[] = [
    { segment: "A", startHour: sleepStart, endHour: sleepStart + 7 },
    { segment: "B", startHour: sleepStart + 7, endHour: sleepStart + 14 },
    { segment: "C", startHour: sleepStart + 14, endHour: sleepStart + 21 },
    { segment: "F", startHour: sleepStart + 21, endHour: sleepStart + 24 }, // F段可能不满7小时
  ].map((seg) => {
    const analysis = analyzeTimeRange(day.hours, seg.startHour, seg.endHour);
    return {
      ...seg,
      ...analysis,
    };
  });

  return segments;
};
