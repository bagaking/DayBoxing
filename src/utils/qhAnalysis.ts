import {
  DayData,
  HourData,
  QHAnalysis,
  PartType,
  HourType,
  AnalysisStatus,
} from "../types";
import { analyzeWithRules } from "./rules";

/**
 * Count occurrences of each hour type in a segment
 * @param hours - Array of hour data in a segment
 * @returns Record of type counts
 */
const countTypes = (hours: HourData[]): Record<string, number> => {
  if (!hours.length) return {};

  return hours.reduce((acc, hour) => {
    if (hour && hour.type) {
      acc[hour.type] = (acc[hour.type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
};

/**
 * Check if the day is long or short
 * Long day: > 24h (up to 28h)
 * Short day: < 24h (min 21h)
 */
const getDayType = (hours: HourData[]): "long" | "short" | "normal" => {
  if (!hours.length) return "normal";
  const totalHours = hours[hours.length - 1].hour - hours[0].hour + 1;

  if (totalHours > 24) return totalHours <= 28 ? "long" : "normal";
  if (totalHours < 24) return totalHours >= 21 ? "short" : "normal";
  return "normal";
};

/**
 * Determine the type characteristics of a segment
 *
 * Rules:
 * - Full Part: Single type dominates (>80%)
 * - Mix Part: Main type (60-80%) + Secondary type (>2h)
 * - Balance Part: Two types both >35%
 * - Chaos Part: Three or more types each >20%
 */
const determinePartType = (
  typeCounts: Record<string, number>
): {
  type: PartType;
  mainType: HourType;
  secondaryType?: HourType;
  mainTypeHours: number;
  secondaryTypeHours?: number;
  distribution?: Record<string, number>;
} => {
  const total = Object.values(typeCounts).reduce((a, b) => a + b, 0);

  // Handle empty or invalid segments
  if (!total) {
    return {
      type: "full",
      mainType: "undefined",
      mainTypeHours: 0,
      distribution: {},
    };
  }

  const sortedTypes = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({
      type,
      count,
      ratio: count / total,
    }));

  // Calculate distribution for visualization
  const distribution = sortedTypes.reduce((acc, { type, ratio }) => {
    acc[type] = ratio;
    return acc;
  }, {} as Record<string, number>);

  if (sortedTypes.length === 0) {
    return {
      type: "full",
      mainType: "undefined",
      mainTypeHours: 0,
      distribution,
    };
  }

  const [main, secondary] = sortedTypes;

  // Full Part: Single type dominates
  if (sortedTypes.length === 1 || main.ratio > 0.8) {
    return {
      type: "full",
      mainType: main.type as HourType,
      mainTypeHours: main.count,
      distribution,
    };
  }

  // Balance Part: Two major types with similar proportions
  if (main.ratio >= 0.35 && secondary.ratio >= 0.35) {
    return {
      type: "balance",
      mainType: main.type as HourType,
      secondaryType: secondary.type as HourType,
      mainTypeHours: main.count,
      secondaryTypeHours: secondary.count,
      distribution,
    };
  }

  // Mix Part: Main type dominates but secondary type is significant
  if (main.ratio >= 0.6 && secondary.count >= 2) {
    return {
      type: "mix",
      mainType: main.type as HourType,
      secondaryType: secondary.type as HourType,
      mainTypeHours: main.count,
      secondaryTypeHours: secondary.count,
      distribution,
    };
  }

  // Chaos Part: Multiple types with significant proportions
  if (
    sortedTypes.length >= 3 &&
    sortedTypes.slice(0, 3).every((t) => t.ratio >= 0.2)
  ) {
    return {
      type: "chaos",
      mainType: main.type as HourType,
      secondaryType: secondary.type as HourType,
      mainTypeHours: main.count,
      secondaryTypeHours: secondary.count,
      distribution,
    };
  }

  // Default to Mix Part
  return {
    type: "mix",
    mainType: main.type as HourType,
    ...(secondary?.count >= 2
      ? { secondaryType: secondary.type as HourType }
      : {}),
    mainTypeHours: main.count,
    ...(secondary?.count >= 2 ? { secondaryTypeHours: secondary.count } : {}),
    distribution,
  };
};

/**
 * Calculate F segment details
 *
 * Rules:
 * 1. F segment starts after C segment (startHour + 21)
 * 2. F segment length is flexible (0-7h)
 * 3. Handle overflow hours (>24) and negative hours
 * 4. Handle undefined cases properly
 *
 * @param hours - Array of hour data
 * @param startHour - Day start hour
 * @returns F segment analysis
 */
const calculateFSegment = (
  hours: HourData[],
  startHour: number,
  dayType: "long" | "short" | "normal"
): QHAnalysis => {
  const fSegmentStart = startHour + 21;
  const lastHour = hours[hours.length - 1]?.hour;

  // Validate F segment length based on day type
  const maxFSegmentLength = dayType === "long" ? 7 : 3; // 长日最多7h，普通日最多3h

  // Default F segment
  const defaultFSegment: QHAnalysis = {
    segment: "F",
    startHour: fSegmentStart,
    endHour: fSegmentStart,
    type: "full",
    mainType: "undefined",
    mainTypeHours: 0,
    distribution: {},
  };

  if (!hours.length || lastHour < fSegmentStart) {
    return defaultFSegment;
  }

  // Calculate F segment hours with length constraint
  const fSegmentHours = hours.filter(
    (h) => h.hour >= fSegmentStart && h.hour < fSegmentStart + maxFSegmentLength
  );

  if (fSegmentHours.length > 0) {
    const analysis = determinePartType(countTypes(fSegmentHours));
    const fSegmentEndHour = Math.min(
      fSegmentHours[fSegmentHours.length - 1].hour + 1,
      fSegmentStart + maxFSegmentLength
    );

    return {
      segment: "F",
      startHour: fSegmentStart,
      endHour: fSegmentEndHour,
      type: analysis.type,
      mainType: analysis.mainType,
      mainTypeHours: analysis.mainTypeHours,
      ...(analysis.secondaryType
        ? {
            secondaryType: analysis.secondaryType,
            secondaryTypeHours: analysis.secondaryTypeHours,
          }
        : {}),
      distribution: analysis.distribution,
    };
  }

  return defaultFSegment;
};

/**
 * Analyze day data into QH segments
 *
 * QH Rules:
 * - A segment: First 7h, should be Sleep Full Part
 * - B segment: Next 7h, should be Mix Part
 * - C segment: Next 7h, any type except Chaos
 * - F segment: Remaining 0-7h, flexible end time
 *
 * @param day - Day data to analyze
 * @returns Array of QH segments
 */
export const analyzeQHSegments = (day: DayData): QHAnalysis[] => {
  if (!day.hours.length) return [];

  const startHour = day.hours[0].hour;
  const dayType = getDayType(day.hours);

  // Calculate A, B, C segments
  const mainSegments = [
    { segment: "A", startHour, endHour: startHour + 7 },
    { segment: "B", startHour: startHour + 7, endHour: startHour + 14 },
    { segment: "C", startHour: startHour + 14, endHour: startHour + 21 },
  ] as const;

  // Calculate segments analysis
  const analyzedSegments = mainSegments.map((seg) => {
    const segmentHours = day.hours.filter(
      (h) => h.hour >= seg.startHour && h.hour < seg.endHour
    );
    const analysis = determinePartType(countTypes(segmentHours));

    return {
      ...seg,
      type: analysis.type,
      mainType: analysis.mainType,
      mainTypeHours: analysis.mainTypeHours,
      ...(analysis.secondaryType
        ? {
            secondaryType: analysis.secondaryType,
            secondaryTypeHours: analysis.secondaryTypeHours,
          }
        : {}),
      distribution: analysis.distribution,
    };
  });

  // Add F segment
  const fSegment = calculateFSegment(day.hours, startHour, dayType);

  return [...analyzedSegments, fSegment];
};

/**
 * 格式化小时数，处理负数和超过24小时的情况
 * @param hour - 小时数
 * @returns 格式化后的时间字符串
 */
export const formatHourClip24 = (hour: number): string => {
  // 处理负数时
  if (hour < 0) {
    return String(hour + 24).padStart(2, "0");
  }
  // 处理超过24小时的时间
  if (hour >= 24) {
    return String(hour - 24).padStart(2, "0");
  }
  // 正常时间补零
  return String(hour).padStart(2, "0");
};

/**
 * 获取段落统计信息
 * @param seg - 段落分析
 * @returns 段落统计信息
 */
export const getSegmentStats = (seg: QHAnalysis) => {
  const duration = seg.endHour - seg.startHour;
  const mainTypePercent =
    seg.mainTypeHours && duration > 0
      ? Math.round((seg.mainTypeHours / duration) * 100)
      : 0;
  const secondaryTypePercent =
    seg.secondaryTypeHours && duration > 0
      ? Math.round((seg.secondaryTypeHours / duration) * 100)
      : 0;

  return {
    duration,
    mainTypePercent,
    secondaryTypePercent,
    hasSecondary: !!seg.secondaryType,
  };
};

// 定义分析结果的新类型
interface AnalysisResult {
  status: AnalysisStatus;
  title: string;
  advices: string[]; // 改为数组以收集所有建议
  stats: {
    duration: number;
    mainTypePercent: number;
    secondaryTypePercent: number;
  };
}

/**
 * Analyze segment characteristics and status
 *
 * Rules based on DayBoxing theory:
 * - A segment should be Sleep Full Part
 * - B segment should be Mix Part with proper start type
 * - C segment can be any type except Chaos
 * - F segment handles flexible hours
 */
export const analyzeSegment = (
  seg: QHAnalysis,
  segments: QHAnalysis[],
  days?: DayData[]
): AnalysisResult => {
  const currentDay = days?.find((d) => d.qhSegments?.some((s) => s === seg));

  if (!currentDay) {
    return {
      status: "warning",
      title: "无法获取完整数据",
      advices: ["缺少当天数据，无法进行完整分析"],
      stats: {
        duration: seg.endHour - seg.startHour,
        mainTypePercent:
          (seg.mainTypeHours / (seg.endHour - seg.startHour)) * 100,
        secondaryTypePercent: seg.secondaryTypeHours
          ? (seg.secondaryTypeHours / (seg.endHour - seg.startHour)) * 100
          : 0,
      },
    };
  }

  const analysis = analyzeWithRules(currentDay, seg, days, "segment");

  return {
    status: analysis.segment.some((r) => r.status === "warning")
      ? "warning"
      : "success",
    title: analysis.segment[0]?.title || `${seg.segment}段分析`,
    advices: analysis.segment.flatMap((r) => r.advices),
    stats: {
      duration: seg.endHour - seg.startHour,
      mainTypePercent:
        (seg.mainTypeHours / (seg.endHour - seg.startHour)) * 100,
      secondaryTypePercent: seg.secondaryTypeHours
        ? (seg.secondaryTypeHours / (seg.endHour - seg.startHour)) * 100
        : 0,
    },
  };
};

// 导出工具函数供组件使用
export const getSegmentDescription = (seg: QHAnalysis): string => {
  if (!seg.secondaryType) return `${seg.mainType} Full Part`;
  if (seg.type === "balance")
    return `${seg.mainType}-${seg.secondaryType} Balance Part`;
  if (seg.type === "chaos") return "Chaos Part";
  return `${seg.mainType}-${seg.secondaryType} Mix Part`;
};

export const getSegmentTypeSymbol = (seg: QHAnalysis): string => {
  return !seg.secondaryType
    ? "Fu"
    : seg.type === "balance"
    ? "Ba"
    : seg.type === "chaos"
    ? "Ch"
    : "Mi";
};

export const analyzeDayOverall = (
  day: DayData,
  historicalDays?: DayData[]
): AnalysisResult => {
  const analysis = analyzeWithRules(day, undefined, historicalDays, "overall");

  return {
    status: analysis.overall
      ? analysis.overall.some((r) => r.status === "warning")
        ? "warning"
        : "success"
      : "info",
    title: "日程总体分析",
    advices: [
      ...(analysis.overall ? analysis.overall.flatMap((r) => r.advices) : []),
      ...(analysis.features ? analysis.features.flatMap((r) => r.advices) : []),
    ],
    stats: {
      duration: day.hours.length,
      mainTypePercent: 0, // 可以计算主要活动类型的占比
      secondaryTypePercent: 0,
    },
  };
};
