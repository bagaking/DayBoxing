import { QHAnalysis, DayData } from "../types";
import { formatHourClip24 } from "./qhAnalysis";

interface Rule {
  id: string;
  condition: (context: AnalysisContext) => boolean;
  action: (context: AnalysisContext) => string;
  priority?: number;
}

interface AnalysisContext {
  segment: QHAnalysis;
  allSegments: QHAnalysis[];
  days?: DayData[];
  stats: {
    duration: number;
    mainTypePercent: number;
    secondaryTypePercent: number;
  };
}

export class RuleEngine {
  private rules: Rule[] = [];

  addRule(rule: Rule) {
    this.rules.push(rule);
    // 按优先级排序
    this.rules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  addRules(rules: Rule[]) {
    rules.forEach((rule) => this.addRule(rule));
  }

  evaluate(context: AnalysisContext): string[] {
    const results: string[] = [];

    // 执行所有匹配的规则
    this.rules.forEach((rule) => {
      if (rule.condition(context)) {
        results.push(rule.action(context));
      }
    });

    return results;
  }
}

// 预定义规则集
export const createDefaultRules = (): Rule[] => [
  {
    id: "A_SLEEP_FULL",
    priority: 100,
    condition: (ctx) =>
      ctx.segment.segment === "A" &&
      ctx.segment.mainType === "sleep" &&
      ctx.segment.type === "full",
    action: (ctx) =>
      `✓ 良好的睡眠时间 (${formatHourClip24(ctx.segment.startHour)}:00)`,
  },
  {
    id: "A_SLEEP_INSUFFICIENT",
    priority: 90,
    condition: (ctx) =>
      ctx.segment.segment === "A" &&
      ctx.segment.mainType === "sleep" &&
      ctx.segment.type !== "full",
    action: (ctx) =>
      `⚠ 睡眠质量不足：${ctx.stats.mainTypePercent}% 的时间用于睡眠`,
  },
  // ... 添加更多规则
];
