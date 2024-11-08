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
 * Normalize hour to handle negative and overflow hours
 * @param hour - Raw hour number
 * @returns Normalized hour in 0-23 range
 */
const normalizeHour = (hour: number): number => {
  if (hour < 0) return hour + 24;
  if (hour >= 24) return hour - 24;
  return hour;
};

/**
 * Calculate segment length considering day boundaries
 * @param startHour - Segment start hour
 * @param endHour - Segment end hour
 * @returns Actual segment length
 */
const calculateSegmentLength = (startHour: number, endHour: number): number => {
  if (endHour < startHour) {
    endHour += 24;
  }
  return endHour - startHour;
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
  distribution?: Record<string, number>;
} => {
  const total = Object.values(typeCounts).reduce((a, b) => a + b, 0);

  // Handle empty or invalid segments
  if (!total) {
    return {
      type: "full",
      mainType: "undefined",
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
    return { type: "full", mainType: "undefined", distribution };
  }

  if (sortedTypes.length === 1 || sortedTypes[0].ratio > 0.8) {
    return {
      type: "full",
      mainType: sortedTypes[0].type,
      distribution,
    };
  }

  const [main, secondary] = sortedTypes;

  // Balance Part: Two major types with similar proportions
  if (main.ratio >= 0.35 && secondary.ratio >= 0.35) {
    return {
      type: "balance",
      mainType: main.type,
      secondaryType: secondary.type,
      distribution,
    };
  }

  // Mix Part: Main type dominates but secondary type is significant
  if (main.ratio >= 0.6 && secondary.count >= 2) {
    return {
      type: "mix",
      mainType: main.type,
      secondaryType: secondary.type,
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
      mainType: main.type,
      secondaryType: secondary.type,
      distribution,
    };
  }

  // Default to Mix Part
  return {
    type: "mix",
    mainType: main.type,
    ...(secondary?.count >= 2 ? { secondaryType: secondary.type } : {}),
    distribution,
  };
};

/**
 * Calculate F segment details based on day pattern
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
  startHour: number
): QHAnalysis => {
  const fSegmentStart = startHour + 21;
  const lastHour = hours[hours.length - 1]?.hour;

  // Default F segment for empty or invalid cases
  const defaultFSegment: QHAnalysis = {
    segment: "F",
    startHour: fSegmentStart,
    endHour: fSegmentStart,
    type: "full",
    mainType: "undefined",
  };

  // If no hours data or last hour is before F segment
  if (!hours.length || lastHour < fSegmentStart) {
    return defaultFSegment;
  }

  // Calculate F segment hours
  const fSegmentHours = hours.filter((h) => h.hour >= fSegmentStart);

  // If F segment has hours, analyze them
  if (fSegmentHours.length > 0) {
    const fSegmentEndHour = fSegmentHours[fSegmentHours.length - 1].hour;
    const analysis = determinePartType(countTypes(fSegmentHours));

    return {
      segment: "F",
      startHour: fSegmentStart,
      endHour: fSegmentEndHour + 1,
      type: analysis.type,
      mainType: analysis.mainType,
      ...(analysis.secondaryType
        ? { secondaryType: analysis.secondaryType }
        : {}),
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
      ...analysis,
    };
  });

  // Add F segment
  const fSegment = calculateFSegment(day.hours, startHour);

  return [...analyzedSegments, fSegment];
};
