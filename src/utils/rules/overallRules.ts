import { AnalysisResult, AnalysisRule, AnalysisContext } from "../../types";

// 总体分析规则
export const overallRules: AnalysisRule[] = [
  {
    id: "day_length",
    type: "overall",
    priority: 100,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const totalHours = ctx.day.hours.length;

      if (totalHours > 24) {
        return {
          status: "warning",
          title: "长日模式",
          advices: [`当前时长: ${totalHours}小时，建议不超过28小时`],
        };
      }

      if (totalHours < 24) {
        return {
          status: "warning",
          title: "短日模式",
          advices: [`当前时长: ${totalHours}小时，建议不少于21小时`],
        };
      }

      return {
        status: "success",
        title: "标准时长",
        advices: [],
      };
    },
  },
  {
    id: "sleep_distribution",
    type: "overall",
    priority: 95,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const sleepHours = ctx.day.hours.filter((h) => h.type === "sleep").length;
      const advices: string[] = [];

      if (sleepHours < 6) {
        advices.push("睡眠时间不足，建议保持6-9小时");
      } else if (sleepHours > 9) {
        advices.push("睡眠时间偏多，建议控制在9小时以内");
      }

      return {
        status: advices.length > 0 ? "warning" : "success",
        title: "睡眠分布分析",
        advices,
      };
    },
  },
  {
    id: "work_distribution",
    type: "overall",
    priority: 90,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const workHours = ctx.day.hours.filter((h) => h.type === "work").length;
      const advices: string[] = [];

      if (workHours < 8) {
        advices.push("工作时间偏少，建议保持8-12小时");
      } else if (workHours > 12) {
        advices.push("工作时间过长，建议不超过12小时");
      }

      return {
        status: advices.length > 0 ? "warning" : "success",
        title: "工作分布分析",
        advices,
      };
    },
  },
];
