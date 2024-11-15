import {
  AnalysisRule,
  HourData,
  AnalysisContext,
  AnalysisResult,
} from "../../types";

// 计算连续相同类型的小时数
const getConsecutiveHours = (hours: HourData[], type: string): number[] => {
  const consecutiveHours: number[] = [];
  let currentCount = 0;

  hours.forEach((hour, index) => {
    if (hour.type === type) {
      currentCount++;
      if (index === hours.length - 1) {
        consecutiveHours.push(currentCount);
      }
    } else if (currentCount > 0) {
      consecutiveHours.push(currentCount);
      currentCount = 0;
    }
  });

  return consecutiveHours;
};

export const featureRules: AnalysisRule[] = [
  {
    id: "sleep_duration",
    type: "feature",
    priority: 90,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const sleepHours = ctx.day.hours.filter((h) => h.type === "sleep").length;

      if (sleepHours < 6) {
        return {
          status: "warning",
          title: "睡眠时间不足",
          advices: [`当前睡眠: ${sleepHours}小时，建议保持6-9小时`],
        };
      }

      if (sleepHours > 9) {
        return {
          status: "warning",
          title: "睡眠时间偏多",
          advices: [`当前睡眠: ${sleepHours}小时，建议控制在9小时以内`],
        };
      }

      return {
        status: "success",
        title: "睡眠时间适中",
        advices: [],
      };
    },
  },
  {
    id: "work_duration",
    type: "feature",
    priority: 85,
    condition: (ctx) => true,
    analyze: (ctx) => {
      const workHours = ctx.day.hours.filter((h) => h.type === "work").length;

      if (workHours > 12) {
        return {
          status: "warning",
          title: "工作时间过长",
          advices: [`当前工作: ${workHours}小时，建议不超过12小时`],
        };
      }

      return {
        status: "success",
        title: "工作时间合理",
        advices: [],
      };
    },
  },
  {
    id: "long_blocks",
    type: "feature",
    priority: 80,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const advices: string[] = [];

      // 检查每种类型的连续时间块
      ["work", "life", "relax"].forEach((type) => {
        const consecutiveHours = getConsecutiveHours(ctx.day.hours, type);
        const longBlocks = consecutiveHours.filter((hours) => hours > 5);

        if (longBlocks.length > 0) {
          advices.push(`存在连续${type}超过5小时的时间块，建议适当切换活动`);
        }
      });

      return {
        status: advices.length > 0 ? "warning" : "success",
        title: advices.length > 0 ? "存在较长时间块" : "时间块分配合理",
        advices,
      };
    },
  },
];
