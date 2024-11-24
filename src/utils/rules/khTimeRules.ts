import {
  AnalysisRule,
  AnalysisContext,
  AnalysisResult,
  HourData,
  AdviceItem,
  BaseHourType,
} from "../../types";
import { KHTimeUnit } from "@bagaking/khtimeunit";

/**
 * KHTimeUnit Integration Rules
 *
 * Core concepts:
 * - cc: 80-100 minutes (optimal work cycle)
 * - pomo: 25-35 minutes (focused work)
 * - q: 10-20 minutes (transition/break)
 */

// Helper: Convert hours to minutes
const hoursToMinutes = (count: number): number => count * 60;

// Helper: Check if duration matches cc unit (80-100min)
const isCCUnit = (minutes: number): boolean => minutes >= 80 && minutes <= 100;

// Helper: Check if duration matches pomo unit (25-35min)
const isPomoUnit = (minutes: number): boolean => minutes >= 25 && minutes <= 35;

// Helper: Get time block description
const getTimeRangeText = (start: number, end: number): string => {
  return `${String(start).padStart(2, "0")}:00-${String(end).padStart(
    2,
    "0"
  )}:00`;
};

// Helper: Analyze continuous activity blocks
const analyzeActivityBlocks = (
  hours: HourData[],
  types: BaseHourType[]
): { start: number; end: number; type: BaseHourType; minutes: number }[] => {
  const blocks: {
    start: number;
    end: number;
    type: BaseHourType;
    minutes: number;
  }[] = [];

  let currentBlock: {
    start: number;
    end: number;
    type: BaseHourType;
  } | null = null;

  hours.forEach((hour, index) => {
    if (types.includes(hour.type as BaseHourType)) {
      if (!currentBlock) {
        currentBlock = {
          start: hour.hour,
          end: hour.hour,
          type: hour.type as BaseHourType,
        };
      } else {
        currentBlock.end = hour.hour;
      }
    } else if (currentBlock) {
      blocks.push({
        ...currentBlock,
        minutes: hoursToMinutes(currentBlock.end - currentBlock.start + 1),
      });
      currentBlock = null;
    }
  });

  return blocks;
};

export const khTimeRules: AnalysisRule[] = [
  // CC Cycle Analysis Rule
  {
    id: "cc_cycles",
    type: "feature",
    priority: 88,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const advices: AdviceItem[] = [];

      // 分析工作和学习时间块
      const workBlocks = analyzeActivityBlocks(ctx.day.hours, [
        "work",
        "improve",
      ]);

      workBlocks.forEach((block) => {
        const timeRange = getTimeRangeText(block.start, block.end + 1);
        const khTime = KHTimeUnit.estimateFromMinutes(block.minutes);

        if (block.minutes > 60) {
          if (!isCCUnit(block.minutes)) {
            advices.push({
              type: "suggestion",
              content: `${timeRange}的${block.type}时段长度为${block.minutes}分钟，不符合标准CC单位(80-100分钟)。建议调整为90分钟，更符合人体自然节律`,
            });
          } else {
            advices.push({
              type: "tip",
              content: `${timeRange}的${
                block.type
              }时段符合CC单位(${khTime.toString()})，是理想的工作周期`,
            });
          }
        }
      });

      // 分析总体工作模式
      const totalWorkMinutes = workBlocks.reduce(
        (sum, block) => sum + block.minutes,
        0
      );
      if (totalWorkMinutes > 0) {
        const totalKHTime = KHTimeUnit.estimateFromMinutes(totalWorkMinutes);
        advices.push({
          type: "tip",
          content: `今日高强度活动总时长约为${totalKHTime.toString()}，建议每个CC单位(90分钟)后安排15-20分钟休息`,
        });
      }

      return {
        status: advices.some((a) => a.type === "warning")
          ? "warning"
          : "success",
        title: "工作周期分析",
        advices,
      };
    },
  },

  // Pomo Focus Analysis Rule
  {
    id: "pomo_focus",
    type: "feature",
    priority: 86,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const advices: AdviceItem[] = [];

      // 分析短时间工作块
      const workBlocks = analyzeActivityBlocks(ctx.day.hours, [
        "work",
        "improve",
      ]);
      const pomoBlocks = workBlocks.filter((block) =>
        isPomoUnit(block.minutes)
      );

      if (pomoBlocks.length > 0) {
        pomoBlocks.forEach((block) => {
          advices.push({
            type: "tip",
            content: `${getTimeRangeText(block.start, block.end + 1)}的${
              block.type
            }时段符合番茄工作法(${block.minutes}分钟)，适合高强度专注任务`,
          });
        });
      }

      // 分析番茄工作法模式
      const totalPomos = pomoBlocks.length;
      if (totalPomos >= 4) {
        advices.push({
          type: "suggestion",
          content: `今日完成${totalPomos}个番茄工作周期，建议每4个番茄钟后安排较长休息(15-30分钟)`,
        });
      }

      return {
        status: "success",
        title: "专注时间分析",
        advices,
      };
    },
  },

  // Q Unit Transition Analysis Rule
  {
    id: "q_transitions",
    type: "feature",
    priority: 84,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const advices: AdviceItem[] = [];
      const hours = ctx.day.hours;

      // 分析活动切换
      for (let i = 1; i < hours.length; i++) {
        if (hours[i].type !== hours[i - 1].type) {
          // 检查前后是否有缓冲时间
          let hasBuffer = false;
          for (
            let j = Math.max(0, i - 1);
            j <= Math.min(hours.length - 1, i + 1);
            j++
          ) {
            if (hours[j].type === "life" || hours[j].type === "relax") {
              hasBuffer = true;
              break;
            }
          }

          if (!hasBuffer) {
            const fromType = hours[i - 1].type;
            const toType = hours[i].type;

            // 特别关注高强度活动的切换
            if (
              (fromType === "work" || fromType === "improve") &&
              (toType === "work" || toType === "improve")
            ) {
              advices.push({
                type: "warning",
                content: `在${hours[i].hour}:00从${fromType}直接切换到${toType}，建议安排一个Q单位(15分钟)作为过渡，避免疲劳累积`,
              });
            } else {
              advices.push({
                type: "suggestion",
                content: `在${hours[i].hour}:00的${fromType}到${toType}切换可以安排短暂缓冲(5-15分钟)，帮助调整状态`,
              });
            }
          }
        }
      }

      // 分析休息间隔
      const workBlocks = analyzeActivityBlocks(hours, ["work", "improve"]);
      workBlocks.forEach((block) => {
        if (block.minutes > 120) {
          advices.push({
            type: "warning",
            content: `${getTimeRangeText(block.start, block.end + 1)}连续${
              block.type
            }时间过长，建议每90-120分钟安排一个Q单位(15分钟)休息`,
          });
        }
      });

      return {
        status: advices.some((a) => a.type === "warning")
          ? "warning"
          : "success",
        title: "活动切换分析",
        advices,
      };
    },
  },
];
