import {
  AnalysisRule,
  AnalysisContext,
  AnalysisResult,
  HourData,
  AdviceItem,
  QHSegment,
} from "../../types";

/**
 * Segment Analysis Rules for DayBoxing
 *
 * Rules are organized by segment type (A/B/C/F):
 *
 * A Segment (First 7h):
 * - Should be Sleep Full Part
 * - Other sleep periods should be ≤2h (power naps)
 * - Sleep quality assessment
 *
 * B Segment (Next 7h):
 * - Should be Mix Part
 * - Start activity type analysis
 * - Part type evaluation
 *
 * C Segment (Next 7h):
 * - Avoid Chaos Part
 * - Activity continuity
 * - Energy cycle alignment
 *
 * F Segment (0-7h):
 * - Flexible duration
 * - Total day length check
 * - Work pressure assessment
 * - Next day impact
 */

// 获取时间段描述
const getTimeRangeText = (start: number, end: number) => {
  return `${String(start).padStart(2, "0")}:00-${String(end).padStart(
    2,
    "0"
  )}:00`;
};

// 分析睡眠质量
const analyzeSleepQuality = (
  hours: HourData[],
  startHour: number,
  endHour: number
) => {
  const sleepHours = hours.filter(
    (h) => h.hour >= startHour && h.hour < endHour && h.type === "sleep"
  );

  const totalSleep = sleepHours.length;
  const sleepBlocks = sleepHours.reduce((blocks, hour, index) => {
    if (index === 0 || sleepHours[index - 1].hour !== hour.hour - 1) {
      blocks.push([hour]);
    } else {
      blocks[blocks.length - 1].push(hour);
    }
    return blocks;
  }, [] as HourData[][]);

  return {
    totalSleep,
    continuousBlocks: sleepBlocks,
    isFragmented: sleepBlocks.length > 1,
    longestBlock: Math.max(...sleepBlocks.map((block) => block.length)),
  };
};

// 分析开始活动
const analyzeStartActivity = (hours: HourData[], startHour: number) => {
  const startHours = hours.filter(
    (h) => h.hour >= startHour && h.hour < startHour + 2
  );
  const types = [...new Set(startHours.map((h) => h.type))];
  return {
    type: types[0] || "undefined",
    duration: startHours.length,
    isConsistent: types.length === 1,
  };
};

export const segmentRules: AnalysisRule[] = [
  // A Segment Analysis
  {
    id: "a_segment",
    type: "segment",
    priority: 95,
    condition: (ctx: AnalysisContext) => ctx.segment?.segment === "A",
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const segment = ctx.segment!;
      const advices: AdviceItem[] = [];

      // 分析睡眠质量
      const sleepQuality = analyzeSleepQuality(
        ctx.day.hours,
        segment.startHour,
        segment.endHour
      );

      if (segment.type !== "full" || segment.mainType !== "sleep") {
        advices.push({
          type: "warning",
          content: `A段(${getTimeRangeText(
            segment.startHour,
            segment.endHour
          )})不是完整的睡眠时间，当前睡眠时长${
            sleepQuality.totalSleep
          }小时。建议调整作息，确保A段全部用于睡眠`,
        });
      }

      if (sleepQuality.isFragmented) {
        advices.push({
          type: "warning",
          content: `A段睡眠出现${sleepQuality.continuousBlocks.length}次中断，最长连续睡眠仅${sleepQuality.longestBlock}小时。建议保持睡眠环境稳定，避免睡眠碎片化`,
        });
      }

      // 检查其他段落的睡眠
      const otherSegments = ctx.allSegments.filter((s) => s.segment !== "A");
      const otherSleepSegments = otherSegments.filter(
        (s) => s.mainType === "sleep" || s.secondaryType === "sleep"
      );

      if (otherSleepSegments.length > 0) {
        const naps = otherSleepSegments.filter((s) => {
          const segSleep = analyzeSleepQuality(
            ctx.day.hours,
            s.startHour,
            s.endHour
          );
          return segSleep.totalSleep <= 2;
        });

        if (naps.length === otherSleepSegments.length) {
          advices.push({
            type: "tip",
            content:
              "其他时段的睡眠时长均不超过2小时，符合小憩的特点，有助于恢复精力",
          });
        } else {
          advices.push({
            type: "warning",
            content:
              "存在超过2小时的非A段睡眠，建议将主要睡眠时间集中在A段，保持作息规律",
          });
        }
      }

      return {
        status: advices.some((a) => a.type === "warning")
          ? "warning"
          : "success",
        title: "A段睡眠分析",
        advices,
      };
    },
  },

  // B Segment Analysis
  {
    id: "b_segment_type",
    type: "segment",
    priority: 90,
    condition: (ctx: AnalysisContext) => ctx.segment?.segment === "B",
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const segment = ctx.segment!;
      const advices: AdviceItem[] = [];

      // 分析段落类型
      if (segment.type === "chaos") {
        advices.push({
          type: "warning",
          content: `B段(${getTimeRangeText(
            segment.startHour,
            segment.endHour
          )})活动过于混乱。建议设定明确的主要活动类型，减少频繁切换`,
        });
      }

      if (segment.type === "balance") {
        advices.push({
          type: "suggestion",
          content: `B段活动出现${segment.mainType}和${segment.secondaryType}的均衡状态，可能影响主要任务的专注度。建议突出重点活动，其他活动作为辅助`,
        });
      }

      if (segment.type !== "mix") {
        advices.push({
          type: "warning",
          content: `B段不是Mix Part，当前为${segment.type} Part。建议保持一个主导活动类型，同时适当配合其他活动`,
        });
      }

      return {
        status: advices.some((a) => a.type === "warning")
          ? "warning"
          : "success",
        title: "B段类型分析",
        advices,
      };
    },
  },

  // B Segment Start Analysis
  {
    id: "b_segment_start",
    type: "segment",
    priority: 92,
    condition: (ctx: AnalysisContext) => ctx.segment?.segment === "B",
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const segment = ctx.segment!;
      const startActivity = analyzeStartActivity(
        ctx.day.hours,
        segment.startHour
      );
      const advices: AdviceItem[] = [];

      switch (startActivity.type) {
        case "sleep":
          advices.push({
            type: "warning",
            content: `B段开始时仍在睡眠(${getTimeRangeText(
              segment.startHour,
              segment.startHour + startActivity.duration
            )})，说明作息时间偏后。建议提前${
              startActivity.duration
            }小时入睡，保证A段完整睡眠`,
          });
          break;

        case "life":
          if (startActivity.isConsistent) {
            advices.push({
              type: "tip",
              content: `B段以生活活动开始，这是理想的晨间安排，有助于平稳过渡到工作状态`,
            });
          }
          break;

        case "relax":
          advices.push({
            type: "suggestion",
            content: `B段以休闲活动开始(${getTimeRangeText(
              segment.startHour,
              segment.startHour + startActivity.duration
            )})，建议改为生活或工作活动，提高早间效率`,
          });
          break;

        case "work":
          const hasHighPressure =
            ctx.historicalDays &&
            ctx.historicalDays.length >= 3 &&
            ctx.historicalDays.every((day) => {
              const bSeg = day.qhSegments?.find((s) => s.segment === "B");
              const bStart =
                bSeg && analyzeStartActivity(day.hours, bSeg.startHour);
              return bStart?.type === "work" || bStart?.type === "relax";
            });

          advices.push({
            type: "warning",
            content: hasHighPressure
              ? "连续多天B段直接开始工作，说明工作压力持续偏大，建议调整节奏，避免透支"
              : `B段直接开始工作(${getTimeRangeText(
                  segment.startHour,
                  segment.startHour + startActivity.duration
                )})，建议预留生活过渡时间，帮助调整状态`,
          });
          break;

        case "improve":
          advices.push({
            type: "tip",
            content:
              "以自我提升活动开始新的一天，体现了良好的学习意愿和自我管理能力",
          });
          break;

        default:
          advices.push({
            type: "warning",
            content: "B段开始活动类型异常，请检查数据记录是否准确",
          });
      }

      return {
        status: advices.some((a) => a.type === "warning")
          ? "warning"
          : "success",
        title: "B段开始方式分析",
        advices,
      };
    },
  },

  // C Segment Analysis
  {
    id: "c_segment",
    type: "segment",
    priority: 85,
    condition: (ctx: AnalysisContext) => ctx.segment?.segment === "C",
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const segment = ctx.segment!;
      const advices: AdviceItem[] = [];

      if (segment.type === "chaos") {
        advices.push({
          type: "warning",
          content: `C段(${getTimeRangeText(
            segment.startHour,
            segment.endHour
          )})活动混乱。建议保持相对固定的活动安排，避免频繁切换任务类型`,
        });
      }

      // 分析活动连贯性
      const hours = ctx.day.hours.filter(
        (h) => h.hour >= segment.startHour && h.hour < segment.endHour
      );

      let transitions = 0;
      for (let i = 1; i < hours.length; i++) {
        if (hours[i].type !== hours[i - 1].type) transitions++;
      }

      if (transitions > 3) {
        advices.push({
          type: "suggestion",
          content: `C段活动切换过于频繁(${transitions}次)，建议合并同类活动，保持工作或学习的连续性`,
        });
      }

      // 添加一般性建议
      advices.push({
        type: "tip",
        content: "C段是一天中精力开始下降的时段，适合安排常规性工作或放松活动",
      });

      return {
        status: advices.some((a) => a.type === "warning")
          ? "warning"
          : "success",
        title: "C段活动分析",
        advices,
      };
    },
  },

  // F Segment Analysis
  {
    id: "f_segment",
    type: "segment",
    priority: 80,
    condition: (ctx: AnalysisContext) => ctx.segment?.segment === "F",
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const segment = ctx.segment!;
      const advices: AdviceItem[] = [];

      // 检查时长
      const duration = segment.endHour - segment.startHour;
      if (duration > 7) {
        advices.push({
          type: "warning",
          content: `F段延长过多(${duration}小时)，超出建议的最大浮动范围(7小时)。建议及时结束当天行程，避免影响次日状态`,
        });
      }

      // 检查是否是工作压力大的情况
      const isHighWorkload =
        segment.type === "mix" && segment.mainType === "work" && duration > 3;

      if (isHighWorkload) {
        advices.push({
          type: "warning",
          content: `F段以工作为主(${getTimeRangeText(
            segment.startHour,
            segment.endHour
          )})，且延长${duration}小时，说明工作压力较大。建议优化工作计划，避免经常性加班`,
        });
      }

      // 检查对次日的影响
      if (segment.endHour > segment.startHour + 4) {
        const nextDayImpact = ctx.historicalDays?.[0]?.qhSegments?.find(
          (s) => s.segment === "A"
        );

        if (nextDayImpact && nextDayImpact.type !== "full") {
          advices.push({
            type: "warning",
            content:
              "F段延长影响了次日A段的睡眠质量，建议控制当天结束时间，保证充足休息",
          });
        }
      }

      // 添加一般性建议
      if (duration > 0) {
        advices.push({
          type: "tip",
          content: `F段作为浮动时间，建议用于：1)处理计划外事务 2)补充学习时间 3)适度放松。当前用于${
            segment.mainType
          }${segment.secondaryType ? "和" + segment.secondaryType : ""}`,
        });
      }

      return {
        status: advices.some((a) => a.type === "warning")
          ? "warning"
          : "success",
        title: "F段分析",
        advices,
      };
    },
  },
];
