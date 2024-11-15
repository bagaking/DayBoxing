import {
  AnalysisRule,
  HourData,
  AnalysisContext,
  AnalysisResult,
} from "../../types";

// 分析开始活动类型
const analyzeStartActivity = (hours: HourData[], startHour: number) => {
  const startHours = hours.filter(
    (h) => h.hour >= startHour && h.hour < startHour + 2
  );
  const types = [...new Set(startHours.map((h) => h.type))];
  return {
    type: types[0] || "undefined",
    duration: startHours.length,
  };
};

export const segmentRules: AnalysisRule[] = [
  {
    id: "a_segment",
    type: "segment",
    priority: 95,
    condition: (ctx: AnalysisContext) => ctx.segment?.segment === "A",
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const segment = ctx.segment!;

      if (segment.type !== "full" || segment.mainType !== "sleep") {
        return {
          status: "warning",
          title: "A段睡眠不足",
          advices: ["A段应该是完整的睡眠时间，建议调整作息"],
        };
      }

      return {
        status: "success",
        title: "A段睡眠充足",
        advices: [],
      };
    },
  },
  {
    id: "b_segment_type",
    type: "segment",
    priority: 90,
    condition: (ctx: AnalysisContext) => ctx.segment?.segment === "B",
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const segment = ctx.segment!;

      if (segment.type === "chaos") {
        return {
          status: "warning",
          title: "B段活动过于混乱",
          advices: ["B段出现chaos part，建议优化时间规划"],
        };
      }

      if (segment.type === "balance") {
        return {
          status: "warning",
          title: "B段活动不够聚焦",
          advices: ["B段出现balance part，建议提高执行力"],
        };
      }

      return {
        status: "success",
        title: "B段安排合理",
        advices: [],
      };
    },
  },
  {
    id: "c_segment",
    type: "segment",
    priority: 85,
    condition: (ctx: AnalysisContext) => ctx.segment?.segment === "C",
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const segment = ctx.segment!;

      if (segment.type === "chaos") {
        return {
          status: "warning",
          title: "C段活动混乱",
          advices: ["C段不应该是Chaos Part，建议优化时间规划"],
        };
      }

      return {
        status: "success",
        title: "C段安排合理",
        advices: [],
      };
    },
  },
  {
    id: "f_segment",
    type: "segment",
    priority: 80,
    condition: (ctx: AnalysisContext) => ctx.segment?.segment === "F",
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const segment = ctx.segment!;
      const advices: string[] = [];

      // 检查是否是工作压力大的情况
      const isHighWorkload =
        segment.type === "mix" &&
        segment.mainType === "work" &&
        segment.endHour - segment.startHour > 3;

      if (isHighWorkload) {
        advices.push("F段延长且以工作为主，说明这一天工作压力较大");
      }

      return {
        status: advices.length > 0 ? "warning" : "success",
        title: "F段分析",
        advices,
      };
    },
  },
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

      switch (startActivity.type) {
        case "sleep":
          return {
            status: "warning",
            title: "B段睡眠偏多",
            advices: ["B段开头是sleep hour，说明这一天睡眠时间偏多"],
          };
        case "life":
          return {
            status: "success",
            title: "B段开始方式理想",
            advices: ["B段以life hour开始，这是最好的开头方式"],
          };
        case "relax":
          return {
            status: "warning",
            title: "B段效率不高",
            advices: [
              "B段开头是relax hour，说明起床后效率不高，需要调整起床后的活动",
            ],
          };
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

          return {
            status: "warning",
            title: hasHighPressure ? "持续高压" : "工作压力大",
            advices: [
              hasHighPressure
                ? "连续多天B段开头只有work hour和relax hour，说明最近压力偏大"
                : "B段开头是work hour，说明以工作为主导，可能是有重要的事儿",
            ],
          };
        default:
          return {
            status: "warning",
            title: "B段开始方式异常",
            advices: ["B段开始方式不符合预期"],
          };
      }
    },
  },
];
