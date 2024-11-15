import { AnalysisRule, AnalysisContext, AnalysisResult } from "../../types";

export class QHRuleEngine {
  private rules: AnalysisRule[] = [];

  constructor(rules?: AnalysisRule[]) {
    if (rules) {
      this.addRules(rules);
    }
  }

  // 添加单个规则
  addRule(rule: AnalysisRule): void {
    this.rules.push(rule);
    this.sortRules();
  }

  // 批量添加规则
  addRules(rules: AnalysisRule[]): void {
    this.rules.push(...rules);
    this.sortRules();
  }

  // 按优先级排序规则
  private sortRules(): void {
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  // 执行分析
  analyze(context: AnalysisContext): AnalysisResult[] {
    return this.rules
      .filter((rule) => rule.condition(context))
      .map((rule) => rule.analyze(context));
  }

  // 按类型执行分析
  analyzeByType(
    context: AnalysisContext,
    type: AnalysisRule["type"]
  ): AnalysisResult[] {
    return this.rules
      .filter((rule) => rule.type === type && rule.condition(context))
      .map((rule) => rule.analyze(context));
  }
}
