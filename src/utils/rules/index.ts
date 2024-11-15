import { overallRules } from "./overallRules";
import { featureRules } from "./featureRules";
import { segmentRules } from "./segmentRules";
import { QHRuleEngine } from "./ruleEngine";
import { AnalysisContext, DayData, QHAnalysis } from "../../types";

// 创建并配置规则引擎实例
export const createQHRuleEngine = () => {
  const engine = new QHRuleEngine();

  // 按照优先级顺序添加规则
  engine.addRules([...overallRules, ...featureRules, ...segmentRules]);

  return engine;
};

// 导出预配置的规则引擎实例
export const defaultQHRuleEngine = createQHRuleEngine();

// 统一的分析函数
export const analyzeWithRules = (
  day: DayData,
  segment?: QHAnalysis,
  historicalDays?: DayData[],
  analysisType: "segment" | "overall" = "segment"
) => {
  const context: AnalysisContext = {
    day,
    segment,
    allSegments: day.qhSegments || [],
    historicalDays,
    stats: segment
      ? {
          duration: segment.endHour - segment.startHour,
          mainTypePercent:
            (segment.mainTypeHours / (segment.endHour - segment.startHour)) *
            100,
          secondaryTypePercent: segment.secondaryTypeHours
            ? (segment.secondaryTypeHours /
                (segment.endHour - segment.startHour)) *
              100
            : 0,
        }
      : undefined,
  };

  // 根据分析类型返回不同的结果
  if (analysisType === "segment") {
    return {
      segment: segment
        ? defaultQHRuleEngine.analyzeByType(context, "segment")
        : [],
      features: defaultQHRuleEngine.analyzeByType(context, "feature"),
    };
  }

  return {
    overall: defaultQHRuleEngine.analyzeByType(context, "overall"),
    features: defaultQHRuleEngine.analyzeByType(context, "feature"),
    segment: segment
      ? defaultQHRuleEngine.analyzeByType(context, "segment")
      : [],
  };
};
