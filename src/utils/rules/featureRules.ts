import {
  AnalysisRule,
  AnalysisContext,
  AnalysisResult,
  HourData,
  AdviceItem,
} from "../../types";
import { energyRules } from "./energyRules";

/**
 * Feature Analysis Rules for DayBoxing
 *
 * Design Principles:
 * 1. Specific Time Location - Always point out exact time periods
 * 2. Actionable Advice - Provide concrete improvement suggestions
 * 3. Friendly Tone - Use encouraging language
 * 4. Systematic Analysis - Consider relationships between suggestions
 *
 * Analysis Categories:
 * 1. Time Block Features
 *    - Continuous block analysis
 *    - Block distribution patterns
 *    - Activity switching patterns
 *
 * 2. Activity Sequence Features
 *    - Activity sequence analysis
 *    - Energy level matching (in energyRules)
 *    - Time slot optimization
 *
 * 3. Time Efficiency Features
 *    - Golden hour utilization
 *    - Fragment time management
 *    - Activity transition cost
 */

// 定义时间段常量
const TIME_SLOTS = {
  MORNING: { start: 6, end: 12 },
  GOLDEN_HOURS: { start: 9, end: 11 },
  LUNCH_TIME: { start: 12, end: 14 },
  POST_LUNCH: { start: 14, end: 16 },
  AFTERNOON: { start: 14, end: 18 },
  EVENING: { start: 18, end: 22 },
  NIGHT: { start: 22, end: 24 },
} as const;

// 获取时间段描述
const getTimeRangeText = (start: number, end: number) => {
  return `${String(start).padStart(2, "0")}:00-${String(end).padStart(
    2,
    "0"
  )}:00`;
};

// 合并能量规则和特征规则
export const featureRules: AnalysisRule[] = [
  ...energyRules, // 添加能量规则

  // 1. Continuous Block Analysis
  {
    id: "continuous_blocks",
    type: "feature",
    priority: 90,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const advices: AdviceItem[] = [];

      // 分析连续时间块
      const hours = ctx.day.hours;
      let currentType = hours[0]?.type;
      let blockStart = hours[0]?.hour;
      let blockLength = 1;

      hours.slice(1).forEach((hour, index) => {
        if (hour.type === currentType) {
          blockLength++;
        } else {
          // 检查上一个块的长度
          if (
            blockLength > 4 &&
            (currentType === "work" || currentType === "improve")
          ) {
            advices.push({
              type: "warning",
              content: `在${getTimeRangeText(
                blockStart,
                blockStart + blockLength
              )}期间, 持续${blockLength}小时进行 ${currentType}活动。建议每2小时休息15分钟，既能恢复精力，也能提高效率`,
            });
          }
          currentType = hour.type;
          blockStart = hour.hour;
          blockLength = 1;
        }
      });

      return {
        status: advices.some((a) => a.type === "warning")
          ? "warning"
          : "success",
        title: "连续时间块分析",
        advices,
      };
    },
  },

  /* 2. Golden Hours Analysis

   *
   * 规则说明：
   * a) 上午黄金时段 (9:00-11:00)
   *    - 最适合：工作、学习等高专注度活动
   *    - 避免：休闲、生活琐事
   *    - 原因：此时段注意力和效率最高
   *
   * b) 午后时段 (13:00-14:00)
   *    - 建议：休息、低强度活动
   *    - 避免：重要工作、深度学习
   *    - 原因：人体生理节律在此时段易疲劳
   *
   * c) 晚间时段 (21:00后)
   *    - 避免：高强度脑力活动
   *    - 适合：总结、复盘、轻度学习
   *    - 原因：为保证睡眠质量，应逐步降低活动强度
   */
  {
    id: "golden_hours",
    type: "feature",
    priority: 85,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const advices: AdviceItem[] = [];

      // 分析黄金时间段
      const goldenHours = ctx.day.hours.filter(
        (h) =>
          h.hour >= TIME_SLOTS.GOLDEN_HOURS.start &&
          h.hour < TIME_SLOTS.GOLDEN_HOURS.end
      );

      const goldenHourTypes = new Set(goldenHours.map((h) => h.type));
      const hasHighValueActivity =
        goldenHourTypes.has("work") || goldenHourTypes.has("improve");

      if (!hasHighValueActivity && goldenHours.length > 0) {
        advices.push({
          type: "warning",
          content: `在${getTimeRangeText(
            TIME_SLOTS.GOLDEN_HOURS.start,
            TIME_SLOTS.GOLDEN_HOURS.end
          )}黄金时段，安排了${Array.from(goldenHourTypes).join(
            "、"
          )}等活动。建议将这个注意力最集中的时段用于工作或自我提升，其他活动可调整到下午或晚上`,
        });
      }

      // 分析午后状态
      const postLunchHours = ctx.day.hours.filter(
        (h) =>
          h.hour >= TIME_SLOTS.POST_LUNCH.start &&
          h.hour < TIME_SLOTS.POST_LUNCH.start + 2
      );

      const hasIntenseWork = postLunchHours.every(
        (h) => h.type === "work" || h.type === "improve"
      );
      if (hasIntenseWork && postLunchHours.length > 0) {
        advices.push({
          type: "suggestion",
          content: `在${getTimeRangeText(
            TIME_SLOTS.POST_LUNCH.start,
            TIME_SLOTS.POST_LUNCH.start + 2
          )}午后时段安排了高强度活动。建议在这个生理疲劳期转为低强度任务，或安排15-30分钟休息`,
        });
      }

      // 添加时间利用建议
      advices.push({
        type: "tip",
        content:
          "合理利用时间段特点：上午9-11点适合创造性工作，下午2-4点适合常规任务，晚上8点后避免高强度活动",
      });

      return {
        status: advices.some((a) => a.type === "warning")
          ? "warning"
          : "success",
        title: "时间效率分析",
        advices,
      };
    },
  },

  // 3. Activity Transition Analysis
  {
    id: "activity_transitions",
    type: "feature",
    priority: 75,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const advices: AdviceItem[] = [];
      const hours = ctx.day.hours;

      // 分析活动切换频率
      let transitions = 0;
      let lastTransitionHour = -1;
      let shortBlockCount = 0;

      for (let i = 1; i < hours.length; i++) {
        if (hours[i].type !== hours[i - 1].type) {
          transitions++;

          // 检查短时间块
          if (lastTransitionHour === hours[i - 1].hour) {
            shortBlockCount++;
            if (shortBlockCount >= 2) {
              advices.push({
                type: "warning",
                content: `在${getTimeRangeText(
                  hours[i - 2].hour,
                  hours[i].hour + 1
                )}期间，活动频繁切换(${hours[i - 2].type}→${
                  hours[i - 1].type
                }→${hours[i].type})。建议合并相似活动，减少切换成本`,
              });
            }
          }

          lastTransitionHour = hours[i].hour;
        }
      }

      // 检查特殊时段切换
      for (let i = 1; i < hours.length - 1; i++) {
        const prevType = hours[i - 1].type;
        const currentType = hours[i].type;

        if (prevType === "sleep" && currentType === "work") {
          advices.push({
            type: "suggestion",
            content: `在${hours[i].hour}:00从睡眠直接进入工作。建议先进行15-30分钟的生活整理或准备活动，帮助身心进入工作状态`,
          });
        }
      }

      // 添加活动切换的一般性建议
      if (transitions > 8) {
        advices.push({
          type: "tip",
          content: `当天活动切换次数较多(${transitions}次)。可以通过合并相似活动、设置固定工作时段等方式来减少不必要的切换`,
        });
      }

      return {
        status: advices.some((a) => a.type === "warning")
          ? "warning"
          : "success",
        title: "活动转换分析",
        advices,
      };
    },
  },
];
