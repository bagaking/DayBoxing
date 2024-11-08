import React, { useState, useRef } from "react";
import { QHAnalysis, ThemeConfig } from "../../types";
import styled from "styled-components";

interface QHSegmentsProps {
  segments: QHAnalysis[];
  theme: ThemeConfig;
}

// 获取段落类型标识
const getPartTypeSymbol = (seg: QHAnalysis) => {
  const theType = !seg.secondaryType
    ? "Fu"
    : seg.type === "balance"
    ? "Ba"
    : seg.type === "chaos"
    ? "Ch"
    : "Mi";
  return theType;
};

// 获取段落类型说明
const getPartTypeDescription = (seg: QHAnalysis) => {
  if (!seg.secondaryType) return `${seg.mainType} Full Part`;
  if (seg.type === "balance")
    return `${seg.mainType}-${seg.secondaryType} Balance Part`;
  if (seg.type === "chaos") return "Chaos Part";
  return `${seg.mainType}-${seg.secondaryType} Mix Part`;
};

// 工具函数
const formatHour = (hour: number): string => {
  // 处理负数时间
  if (hour < 0) {
    return String(hour + 24).padStart(2, "0");
  }
  // 处理超过24小时的时间
  if (hour >= 24) {
    return String(hour - 24).padStart(2, "0");
  }
  // 正常时间补零
  return String(hour).padStart(2, "0");
};

export const SegmentsContainer = styled.div<{ theme: ThemeConfig }>`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.gap}px;
  width: 150px;
`;

export const SegmentItem = styled.div<{ theme: ThemeConfig }>`
  height: ${(props) => props.theme.cellSize}px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  background-color: rgba(255, 255, 255, 0.98);
  border-radius: ${(props) => props.theme.borderRadius}px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
`;

export const TypeBlock = styled.div<{ color: string }>`
  width: 48px;
  height: 24px;
  border-radius: 4px;
  background-color: ${(props) => `${props.color}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  gap: 2px;
`;

export const SegmentLabel = styled.span<{ color: string }>`
  font-size: 11px;
  font-weight: 500;
  color: ${(props) => props.color};
  opacity: 0.8;
  padding: 0 2px;
  border-radius: 2px;
`;

export const TypeLabel = styled.span<{ color: string }>`
  font-size: 10px;
  font-weight: 600;
  color: ${(props) => props.color};
  opacity: 0.6;
  padding: 0 2px;
  border-radius: 2px;
`;

// 定义 TooltipPosition 类型
type TooltipPosition = {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  transform?: string;
  arrowPosition?: string;
};

// 修改工具函数的返回类型
const getTooltipPosition = (
  itemRef: React.RefObject<HTMLDivElement>
): TooltipPosition & { arrowPosition: string } => {
  if (!itemRef.current)
    return {
      left: "calc(100% + 12px)",
      top: "0",
      arrowPosition: "top: 16px",
    };

  const rect = itemRef.current.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const tooltipWidth = 200;
  const tooltipHeight = 180;

  const rightSpace = viewportWidth - rect.right;
  const bottomSpace = viewportHeight - rect.top;

  if (rightSpace < tooltipWidth + 12) {
    return {
      right: "calc(100% + 12px)",
      top: "0",
      transform: "translateX(0)",
      arrowPosition: "top: 16px",
    };
  }

  if (bottomSpace < tooltipHeight) {
    const arrowTop = Math.max(16, rect.height - tooltipHeight + 16);
    return {
      left: "calc(100% + 12px)",
      bottom: "0",
      top: "auto",
      transform: "translateY(0)",
      arrowPosition: `top: ${arrowTop}px`,
    };
  }

  return {
    left: "calc(100% + 12px)",
    top: "0",
    arrowPosition: "top: 16px",
  };
};

// 修改 SegmentTooltip 组件的类型定义
export const SegmentTooltip = styled.div<{
  color: string;
  position: ReturnType<typeof getTooltipPosition>;
}>`
  position: absolute;
  ${(props) => props.position}
  padding: 12px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 8px;
  font-size: 12px;
  white-space: pre-line;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-left: 3px solid ${(props) => props.color};
  max-width: 200px;
  width: max-content;

  &::before {
    content: "";
    position: absolute;
    ${(props) => (props.position.right ? "right: -8px" : "left: -8px")};
    ${(props) => props.position.arrowPosition};
    border: 4px solid transparent;
    border-${(props) =>
      props.position.right ? "left" : "right"}-color: rgba(255, 255, 255, 0.98);
  }
`;

export const TooltipTitle = styled.div<{ color: string }>`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.color};
  margin-bottom: 12px;
`;

export const TooltipStatus = styled.div<{ type: "success" | "warning" }>`
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => (props.type === "success" ? "#52c41a" : "#faad14")};
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const TooltipAdvice = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

export const TooltipStats = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 12px;
  font-size: 12px;
`;

export const StatLabel = styled.div`
  color: rgba(0, 0, 0, 0.45);
`;

export const StatValue = styled.div`
  color: rgba(0, 0, 0, 0.85);
`;

// 判断是否为长日或短日
const getDayType = (segments: QHAnalysis[]) => {
  const totalHours = segments.reduce((acc, seg) => {
    return acc + (seg.endHour - seg.startHour);
  }, 0);

  if (totalHours > 24) return "长日";
  if (totalHours < 24) return "短日";
  return "标准日";
};

// 分析入睡时间
const getSleepTimeAnalysis = (segments: QHAnalysis[]) => {
  const aSegment = segments.find((s) => s.segment === "A");
  if (!aSegment) return "";

  const sleepHour = aSegment.startHour;
  // 根据规则第10行：处理负值时间
  const displayHour =
    sleepHour < 0 ? `前一天 ${formatHour(sleepHour)}` : formatHour(sleepHour);

  if (sleepHour >= 23 || sleepHour <= 1) {
    return `✅ 良好的入睡时间 (${displayHour}:00)\n继续保持：这是很好的作息习惯`;
  }
  if (sleepHour > 1 && sleepHour < 4) {
    return `⚠️ 入睡时间偏晚 (${displayHour}:00)\n建议：尽量在23:00前入睡`;
  }
  return `⚠️ 不规律的入睡时间 (${displayHour}:00)\n建议：建立规律的作息习惯`;
};

// 获取段落特征分析
const getSegmentAnalysis = (seg: QHAnalysis, segments: QHAnalysis[]) => {
  const dayType = getDayType(segments);
  const stats = getSegmentStats(seg);
  const { duration, mainTypePercent } = stats;

  switch (seg.segment) {
    case "A":
      // 根据规则第31行：如果 A 段不是 S(fp)，说明这一天睡眠是偏少的
      if (seg.mainType === "sleep") {
        if (seg.type === "full") {
          return `✅ 完整的睡眠时间\n${getSleepTimeAnalysis([seg])}`;
        } else {
          return `⚠️ 睡眠质量不足\n建议：保持完整的睡眠时间，避免在睡眠时间处理其他事务`;
        }
      }
      return "⚠️ A段必须以睡眠为主\n建议：调整作息，确保A段完全用于睡眠";

    case "B":
      // 根据规则第34-37行的B段要求
      if (seg.type === "mix") {
        const sleepCheck = segments.find((s) => s.segment === "A");
        if (sleepCheck && seg.mainType === "sleep") {
          return "⚠️ B段开始仍在睡眠，说明睡眠时间偏多\n建议：适当调整作息时间";
        }
        return `✅ 时间分配合理 (${mainTypePercent}% ${seg.mainType})\n建议：保持这种专注的工作状态`;
      }
      if (seg.type === "chaos") {
        return "⚠️ B段出现混乱，可能存在规划问题\n建议：提前规划任务，避免临时安排过多";
      }
      if (seg.type === "balance") {
        return "⚠️ B段出现平衡，说明注意力不够聚焦\n建议：B段应该有明确的主导任务";
      }
      return "⚠️ B段应该是Mix Part\n建议：保持一个主要任务，适当安排其他活动";

    case "C":
      // 根据规则第38行：C段不是Chaos Part即可
      if (seg.type === "chaos") {
        return "⚠️ C段出现混乱\n建议：即使是自由时也要有基本规划";
      }
      // 检查是否有合理的小憩
      const hasNap =
        seg.secondaryType === "sleep" && (seg.secondaryTypeHours || 0) <= 2;
      return hasNap
        ? `✅ 合理安排了小憩时间\n继续保持：短时间的午休有助于提高下午的效率`
        : `✅ 时间分配正常 (${mainTypePercent}% ${seg.mainType})`;

    case "F":
      const duration = seg.endHour - seg.startHour;
      const totalHours = segments.reduce(
        (acc, s) => acc + (s.endHour - s.startHour),
        0
      );

      // 判断是长日还是短日
      if (totalHours > 24) {
        // 长日：总时长不能超过28小时
        const remainingHours = 28 - (totalHours - duration);
        if (duration > remainingHours) {
          return {
            type: "warning",
            message: `⚠ 超出长日范围 (最多还可浮动${remainingHours}h)`,
          };
        }
      } else if (totalHours < 24) {
        // 短日：总时长不能少于21小时
        const neededHours = 21 - (totalHours - duration);
        if (duration < neededHours) {
          return {
            type: "warning",
            message: `⚠ 短日时间不足 (至少需要${neededHours}h)`,
          };
        }
      }

      // 正常浮动范围
      return {
        type: "success",
        message: `✓ ${duration}h浮动时间 ${
          totalHours > 24 ? "(长日)" : totalHours < 24 ? "(短日)" : ""
        }`,
      };
  }
};

// 获取时间段统计
const getSegmentStats = (seg: QHAnalysis) => {
  const duration = seg.endHour - seg.startHour;

  // 防止除零和处理 undefined 的情况
  const mainTypePercent =
    seg.mainTypeHours && duration > 0
      ? Math.round((seg.mainTypeHours / duration) * 100)
      : 0;

  const secondaryTypePercent =
    seg.secondaryTypeHours && duration > 0
      ? Math.round((seg.secondaryTypeHours / duration) * 100)
      : 0;

  return {
    duration,
    mainTypePercent,
    secondaryTypePercent,
    hasSecondary: !!seg.secondaryType,
  };
};

// 新增：获取段落状态
const getSegmentStatus = (
  seg: QHAnalysis
): { type: "success" | "warning"; message: string } => {
  const stats = getSegmentStats(seg);

  switch (seg.segment) {
    case "A":
      if (seg.mainType === "sleep" && seg.type === "full") {
        return {
          type: "success",
          message: "✓ 完整的睡眠时间",
        };
      }
      return {
        type: "warning",
        message: "⚠ 睡眠质量不足",
      };

    case "B":
      // B段应该是 Mix Part
      if (seg.type === "mix" && seg.mainType !== "sleep") {
        // 如果主导类型占比超过80%，说明太过聚焦
        if (stats.mainTypePercent > 80) {
          return {
            type: "warning",
            message: `⚠ 注意力过度聚焦 (${stats.mainTypePercent}% ${seg.mainType})`,
          };
        }
        // 正常的Mix Part，主导类型占比合理
        return {
          type: "success",
          message: `✓ 时间分配合理 (${stats.mainTypePercent}% ${seg.mainType})`,
        };
      }
      if (seg.type === "chaos") {
        return {
          type: "warning",
          message: "⚠ 任务安排混乱，需要提前规划",
        };
      }
      if (seg.type === "balance") {
        return {
          type: "warning",
          message: "⚠ B段不适合平衡模式，应有主次",
        };
      }
      // Full Part 的情况
      return {
        type: "warning",
        message: "⚠ B段需要适当安排其他活动",
      };

    case "C":
      if (seg.type === "balance") {
        return {
          type: "success",
          message: `✓ ${seg.mainType}-${seg.secondaryType} 平衡 (${stats.mainTypePercent}%-${stats.secondaryTypePercent}%)`,
        };
      }
      if (seg.type !== "chaos") {
        const hasNap =
          seg.secondaryType === "sleep" && (seg.secondaryTypeHours || 0) <= 2;
        return {
          type: "success",
          message: hasNap
            ? "✓ 合理安排小憩"
            : `✓ 以${seg.mainType}为主 (${stats.mainTypePercent}%)`,
        };
      }
      return {
        type: "warning",
        message: "⚠ 时间安排混乱",
      };

    case "F":
      const duration = seg.endHour - seg.startHour;
      const totalHours = duration + 21;

      // 判断是长日还是短日
      if (totalHours > 24) {
        // 长日：总时长不能超过28小时
        const remainingHours = 28 - (totalHours - duration);
        if (duration > remainingHours) {
          return {
            type: "warning",
            message: `⚠ 超出长日范围 (最多还可浮动${remainingHours}h)`,
          };
        }
      } else if (totalHours < 24) {
        // 短日：总时长不能少于21小时
        const neededHours = 21 - (totalHours - duration);
        if (duration < neededHours) {
          return {
            type: "warning",
            message: `⚠ 短日时间不足 (至少需要${neededHours}h)`,
          };
        }
      }

      // 正常浮动范围
      return {
        type: "success",
        message: `✓ ${duration}h浮动时间 ${
          totalHours > 24 ? "(长日)" : totalHours < 24 ? "(短日)" : ""
        }`,
      };
  }
};

// 新增：获取段落建议
const getSegmentAdvice = (seg: QHAnalysis): string | null => {
  switch (seg.segment) {
    case "A":
      if (seg.startHour >= 2 && seg.startHour <= 4) {
        return "建议：建立规律的作息习惯";
      }
      return null;

    case "B":
      if (seg.type !== "mix") {
        return "建议：保持一个主要任务，适当安排其他活动";
      }
      return null;

    case "C":
      if (seg.type === "chaos") {
        return "建议：即使是自由时间也要有基本规划";
      }
      return null;

    case "F":
      const duration = seg.endHour - seg.startHour;
      if (duration > 7) {
        return "建议：控制在7小时以内，避免过度疲劳";
      }
      return null;
  }
  return null;
};

export const QHSegments: React.FC<QHSegmentsProps> = ({ segments, theme }) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  return (
    <SegmentsContainer theme={theme}>
      {segments.map((seg) => {
        const mainColor =
          theme.colors[seg.mainType as keyof typeof theme.colors];
        const typeSymbol = getPartTypeSymbol(seg);
        const stats = getSegmentStats(seg);
        const tooltipPosition = getTooltipPosition(itemRef);

        return (
          <SegmentItem
            key={seg.segment}
            ref={itemRef}
            theme={theme}
            onMouseEnter={() => setHoveredSegment(seg.segment)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <TypeBlock color={mainColor}>
              <SegmentLabel color={mainColor}>{seg.segment}</SegmentLabel>
              <TypeLabel color={mainColor}>{typeSymbol}</TypeLabel>
            </TypeBlock>

            {hoveredSegment === seg.segment && (
              <SegmentTooltip color={mainColor} position={tooltipPosition}>
                <TooltipTitle color={mainColor}>
                  {getPartTypeDescription(seg)}
                </TooltipTitle>

                {/* 状态和建议 */}
                <TooltipStatus type={getSegmentStatus(seg).type}>
                  {getSegmentStatus(seg).message}
                </TooltipStatus>

                {getSegmentAdvice(seg) && (
                  <TooltipAdvice>{getSegmentAdvice(seg)}</TooltipAdvice>
                )}

                {/* 统计信息 */}
                <TooltipStats>
                  <StatLabel>持续时长</StatLabel>
                  <StatValue>{stats.duration}h</StatValue>

                  {stats.mainTypePercent > 0 && (
                    <>
                      <StatLabel>主要类型</StatLabel>
                      <StatValue>
                        {stats.mainTypePercent}% {seg.mainType}
                      </StatValue>
                    </>
                  )}

                  {stats.hasSecondary && stats.secondaryTypePercent > 0 && (
                    <>
                      <StatLabel>次要类型</StatLabel>
                      <StatValue>
                        {stats.secondaryTypePercent}% {seg.secondaryType}
                      </StatValue>
                    </>
                  )}
                </TooltipStats>
              </SegmentTooltip>
            )}

            {/* 右侧信息分保持不变 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  marginBottom: "1px",
                  color:
                    theme.colors[seg.mainType as keyof typeof theme.colors],
                }}
              >
                {seg.mainType}
                {seg.secondaryType && (
                  <>
                    <span style={{ opacity: 0.3 }}>/</span>
                    <span
                      style={{
                        color:
                          theme.colors[
                            seg.secondaryType as keyof typeof theme.colors
                          ],
                      }}
                    >
                      {seg.secondaryType}
                    </span>
                  </>
                )}
              </div>

              <div
                style={{
                  fontSize: "9px",
                  color: "rgba(0,0,0,0.45)",
                  fontFamily: "monospace",
                }}
              >
                {`${formatHour(seg.startHour)}:00-${formatHour(
                  seg.endHour
                )}:00`}
              </div>
            </div>
          </SegmentItem>
        );
      })}
    </SegmentsContainer>
  );
};
