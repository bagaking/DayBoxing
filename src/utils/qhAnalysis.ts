import { DayData, HourData, QHAnalysis, PartType, HourType } from "../types";

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
  // 处理负数时间
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
 * 获取睡眠时间分析
 * @param segments - 时间段分析
 * @returns 睡眠时间分析
 */
const getSleepTimeAnalysis = (segments: QHAnalysis[]): string => {
  const aSegment = segments.find((s) => s.segment === "A");
  if (!aSegment) return "";

  const sleepHour = aSegment.startHour;
  const displayHour =
    sleepHour < 0
      ? `前一天 ${formatHourClip24(sleepHour)}`
      : formatHourClip24(sleepHour);

  if (sleepHour >= 23 || sleepHour <= 1) {
    return `✅ 良好的入睡时间 (${displayHour}:00)\n继续保持：这是很好的作息习惯`;
  }
  if (sleepHour > 1 && sleepHour < 4) {
    return `⚠️ 入睡时间偏晚 (${displayHour}:00)\n建议：尽量在23:00前入睡`;
  }
  return `⚠️ 不规律的入睡时间 (${displayHour}:00)\n建议：建立规律的作息习惯`;
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
  type: "success" | "warning";
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
  const stats = getSegmentStats(seg);
  const advices: string[] = []; // 收集所有建议

  switch (seg.segment) {
    case "A": {
      if (seg.mainType === "sleep") {
        if (seg.type === "full") {
          const sleepAnalysis = getSleepTimeAnalysis(segments);
          advices.push(sleepAnalysis);

          // 检查其他段是否有睡眠
          const hasOtherSleep = segments.some(
            (s) =>
              s.segment !== "A" &&
              (s.mainType === "sleep" || s.secondaryType === "sleep")
          );
          if (hasOtherSleep) {
            advices.push("建议：集中睡眠时间，避免在其他时段出现睡眠");
          }

          return {
            type: "success",
            title: "✓ 完整的睡眠时间",
            advices,
            stats,
          };
        }

        advices.push("建议：保持完整的睡眠时间，避免在睡眠时间处理其他事务");
        if (seg.secondaryType) {
          advices.push(
            `注意：当前有 ${seg.secondaryTypeHours}h 被用于 ${seg.secondaryType}`
          );
        }

        return {
          type: "warning",
          title: "⚠ 睡眠质量不足",
          advices,
          stats,
        };
      }

      advices.push("建议：调整作息，确保A段完全用于睡眠");
      advices.push(`当前主要用于 ${seg.mainType}，这可能影响睡眠质量`);

      return {
        type: "warning",
        title: "⚠ A段异常",
        advices,
        stats,
      };
    }

    case "B": {
      // 获取当天数据
      const currentDay = days?.find((d) =>
        d.qhSegments?.some((s) => s === seg)
      );

      let bAnalysis: AnalysisResult = {
        type: "success",
        title: "B段分析",
        advices: [],
        stats,
      };

      if (currentDay) {
        bAnalysis = analyzeBSegmentStart(seg, currentDay.hours, days);
        advices.push(bAnalysis.title);

        // 检查时间分配
        if (seg.type === "full") {
          advices.push("⚠ B段缺乏时间多样性，建议适当安排其他活动");
        }

        // 检查连续多天的模式
        if (days && days.length >= 3) {
          const continuousAdvice = analyzeContinuousBSegments(days);
          if (continuousAdvice) {
            advices.push(continuousAdvice);
          }
        }

        // 添加时间分配建议
        if (seg.type === "mix") {
          advices.push(
            `主要时间分配：${stats.mainTypePercent}% ${seg.mainType}`
          );
          if (seg.secondaryType) {
            advices.push(
              `次要活动：${stats.secondaryTypePercent}% ${seg.secondaryType}`
            );
          }
        } else if (seg.type === "chaos") {
          advices.push("建议：提前规划任务，避免临时安排过");
          advices.push("过于分散的时间分配会降低效率");
        } else if (seg.type === "balance") {
          advices.push("建议：B段应该有明确的主导任务，避免任务过于平均");
        }
      } else {
        advices.push("无法获取当天数据进行详细分析");
      }

      return {
        type: bAnalysis.type === "warning" ? "warning" : "success",
        title: bAnalysis.title,
        advices,
        stats,
      };
    }

    case "C": {
      const hasNapTime = hasGoodNap(segments);

      if (seg.type === "chaos") {
        advices.push("建议：即使是自由时间也要有基本规划");
        advices.push("过于分散的时间分配会降低效率");
      }

      return {
        type: "success",
        title: `✓ 时间分配正常 ${hasNapTime ? "（包含合理小憩）" : ""}`,
        advices,
        stats,
      };
    }

    case "F": {
      const totalHours = segments.reduce(
        (acc, s) => acc + (s.endHour - s.startHour),
        0
      );

      // F 段：浮动时间检查
      if (totalHours > 24) {
        const remainingHours = 28 - totalHours;
        if (remainingHours < 0) {
          advices.push(
            `建议：调整时间，当前超出${Math.abs(remainingHours)}小时`
          );
        }
        advices.push(`长日模式：最多还可浮动${remainingHours}小时`);
      }

      if (totalHours < 24) {
        const neededHours = 21 - totalHours;
        if (neededHours > 0) {
          advices.push(`建议：至少还需要${neededHours}小时`);
        }
        advices.push("短日模式：时间安排合理");
      }

      return {
        type: "success",
        title: `✓ ${stats.duration}h浮动时间`,
        advices,
        stats,
      };
    }
  }
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

/**
 * 分析段落开头的活动模式
 * @param hours - 小时数据
 * @param startHour - 开始时间
 * @param count - 检查的小时数
 * @returns 开头活动分析
 */
interface StartActivityAnalysis {
  type: HourType;
  duration: number;
  nextType?: HourType;
  nextDuration?: number;
}

const analyzeStartActivity = (
  hours: HourData[],
  startHour: number,
  count: number = 2
): StartActivityAnalysis => {
  const startHours = hours
    .filter((h) => h.hour >= startHour && h.hour < startHour + count)
    .sort((a, b) => a.hour - b.hour);

  if (!startHours.length) {
    return { type: "undefined", duration: 0 };
  }

  let currentType = startHours[0].type;
  let currentDuration = 1;
  let nextType: HourType | undefined;
  let nextDuration = 0;

  for (let i = 1; i < startHours.length; i++) {
    if (startHours[i].type === currentType) {
      currentDuration++;
    } else {
      if (!nextType) {
        nextType = startHours[i].type;
        nextDuration = 1;
      } else if (startHours[i].type === nextType) {
        nextDuration++;
      }
    }
  }

  return {
    type: currentType,
    duration: currentDuration,
    nextType,
    nextDuration,
  };
};

/**
 * 分析 B 段开头活动
 * @param segment - B segment data
 * @param hours - 当天的小时数据
 * @param days - 历史数据
 * @returns Analysis result
 */
const analyzeBSegmentStart = (
  segment: QHAnalysis,
  hours: HourData[],
  days?: DayData[]
): AnalysisResult => {
  const startActivity = analyzeStartActivity(hours, segment.startHour);
  const stats = getSegmentStats(segment);

  // 根据 .cursorrules 中的规则判断
  switch (startActivity.type) {
    case "sleep":
      return {
        type: "warning",
        title: "⚠ B段开头的 hour 是 sleep hour，说明这一天睡眠时间偏多",
        advices: [],
        stats,
      };

    case "life":
      return {
        type: "success",
        title: "✓ B段以 life hour 开始，这是最好的开头方式",
        advices: [],
        stats,
      };

    case "relax":
      return {
        type: "warning",
        title:
          "⚠ B段开头是 relax hour，说明起床后效率不高，需要调整起床后的活动",
        advices: [],
        stats,
      };

    case "work":
      // 检查连续多天的模式
      const hasHighPressure =
        days &&
        days.length >= 3 &&
        days.every((day) => {
          const bStartActivity = analyzeStartActivity(
            day.hours,
            day.qhSegments?.find((s) => s.segment === "B")?.startHour || 0
          );
          return (
            bStartActivity.type === "work" || bStartActivity.type === "relax"
          );
        });

      if (hasHighPressure) {
        return {
          type: "warning",
          title:
            "⚠ 连续多天 B 段开头只有 work hour 和 relax hour，说明最近压力偏大",
          advices: [],
          stats,
        };
      }

      return {
        type: "warning",
        title:
          "⚠ B段开头是 work hour，说明以工作为主导，可能是有重要的事儿，也可能是最近压力偏大",
        advices: [],
        stats,
      };

    default:
      return {
        type: "warning",
        title: "一般的开始方式",
        advices: [],
        stats,
      };
  }
};

/**
 * Check if there is good nap in other segments
 * @param segments - All segments
 * @returns Whether has good nap
 */
const hasGoodNap = (segments: QHAnalysis[]): boolean => {
  return segments.some(
    (seg) =>
      seg.segment !== "A" &&
      seg.secondaryType === "sleep" &&
      (seg.secondaryTypeHours || 0) <= 2
  );
};

/**
 * Analyze continuous days' B segments
 * @param days - Multiple days data
 * @returns Analysis result
 */
const analyzeContinuousBSegments = (days: DayData[]): string => {
  const bSegments = days
    .map((day) => day.qhSegments?.find((s) => s.segment === "B"))
    .filter(Boolean);

  const hasOnlyWorkAndRelax = bSegments.every(
    (seg) => seg?.mainType === "work" || seg?.mainType === "relax"
  );

  if (hasOnlyWorkAndRelax && bSegments.length >= 3) {
    return "最近压力偏大，建议调整作息";
  }

  return "";
};
