import { DayData, HourData, QHAnalysis, PartType, HourType } from "../types";

const countTypes = (hours: HourData[]): Record<string, number> => {
  return hours.reduce((acc, hour) => {
    acc[hour.type] = (acc[hour.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

const determinePartType = (
  typeCounts: Record<string, number>
): {
  type: PartType;
  mainType: HourType;
  secondaryType?: HourType;
} => {
  const sortedTypes = Object.entries(typeCounts).sort(([, a], [, b]) => b - a);

  if (sortedTypes.length === 0) {
    return { type: "full", mainType: "undefined" };
  }

  if (sortedTypes.length === 1) {
    return { type: "full", mainType: sortedTypes[0][0] };
  }

  const [first, second] = sortedTypes;
  const total = Object.values(typeCounts).reduce((a, b) => a + b, 0);

  // 计算前两个主要类型的占比
  const mainTypeRatio = first[1] / total;
  const secondTypeRatio = second[1] / total;

  // 如果有两个类型都超过总时间的35%，认为是balance
  if (mainTypeRatio >= 0.35 && secondTypeRatio >= 0.35) {
    return {
      type: "balance",
      mainType: first[0],
      secondaryType: second[0],
    };
  }

  // 如果主导类型不超过60%，且有其他类型，认为是mix
  if (mainTypeRatio < 0.6 && sortedTypes.length >= 2) {
    return {
      type: "mix",
      mainType: first[0],
      secondaryType: second[0],
    };
  }

  // 如果有超过两种类型，且每种类型都占据显著比例（>20%），认为是chaos
  if (
    sortedTypes.length > 2 &&
    sortedTypes.every(([, count]) => count / total > 0.2)
  ) {
    return {
      type: "chaos",
      mainType: first[0],
      secondaryType: second[0],
    };
  }

  // 其他情况认为是full
  return {
    type: "full",
    mainType: first[0],
    ...(second[1] >= 2 ? { secondaryType: second[0] } : {}),
  };
};

export const analyzeQHSegments = (day: DayData): QHAnalysis[] => {
  const startHour = day.hours[0].hour;

  // 定义QH分段
  const segments: QHAnalysis[] = [
    { segment: "A" as const, startHour, endHour: startHour + 7 },
    {
      segment: "B" as const,
      startHour: startHour + 7,
      endHour: startHour + 14,
    },
    {
      segment: "C" as const,
      startHour: startHour + 14,
      endHour: startHour + 21,
    },
    {
      segment: "F" as const,
      startHour: startHour + 21,
      endHour: startHour + 24,
    },
  ].map((seg) => {
    const segmentHours = day.hours.filter(
      (h) => h.hour >= seg.startHour && h.hour < seg.endHour
    );
    const analysis = determinePartType(countTypes(segmentHours));

    return {
      ...seg,
      ...analysis,
    };
  });

  return segments;
};
