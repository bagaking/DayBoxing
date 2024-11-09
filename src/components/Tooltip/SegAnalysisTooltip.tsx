import React, { useRef, useEffect, useMemo } from "react";
import styled from "styled-components";
import { QHAnalysis, ThemeConfig, DayData } from "../../types";
import { TooltipContainerDiv } from "./Tooltip";
import { getSegmentDescription, analyzeSegment } from "../../utils/qhAnalysis";

const TooltipContainer = styled(TooltipContainerDiv)`
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  pointer-events: auto;
  z-index: 1000;

  // 添加光晕效果
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(255, 255, 255, 0.06),
      transparent 40%
    );
    z-index: 0;
    pointer-events: none;
  }

  // 添加内容容器
  & > * {
    position: relative;
    z-index: 1;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.7);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1),
      inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  }
`;

const AnalysisHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const SegmentBadge = styled.div<{ color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: ${(props) => props.color};
  background: ${(props) => `${props.color}12`};
  box-shadow: inset 0 0 0 1px ${(props) => `${props.color}20`},
    0 2px 4px ${(props) => `${props.color}10`};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: inset 0 0 0 1px ${(props) => `${props.color}30`},
      0 4px 8px ${(props) => `${props.color}15`};
  }
`;

const HeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SegmentTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 1px;
`;

const SegmentType = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
`;

const Summary = styled.div<{ type: "success" | "warning" }>`
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => (props.type === "success" ? "#52c41a" : "#faad14")};
  margin-bottom: 6px;
  padding: 4px 8px;
  background: ${(props) =>
    props.type === "success"
      ? "rgba(82, 196, 26, 0.08)"
      : "rgba(250, 173, 20, 0.08)"};
  border-radius: 6px;
`;

const AdviceList = styled.div`
  margin: 6px 0;
  display: flex;
  flex-direction: column;
`;

const AdviceItem = styled.div<{ type: "warning" | "success" | "info" }>`
  font-size: 12px;
  line-height: 1.4;
  padding: 2px 0;
  color: rgba(0, 0, 0, ${(props) => (props.type === "info" ? "0.45" : "0.65")});
  display: flex;
  align-items: flex-start;
  gap: 4px;

  &::before {
    content: "";
    width: 3px;
    height: 3px;
    margin-top: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    background-color: ${(props) => {
      switch (props.type) {
        case "warning":
          return "rgba(250, 173, 20, 0.5)";
        case "success":
          return "rgba(82, 196, 26, 0.5)";
        default:
          return "rgba(0, 0, 0, 0.15)";
      }
    }};
  }
`;

const Distribution = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
`;

const DistributionBar = styled.div`
  display: flex;
  height: 2px;
  border-radius: 1px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.02);
  margin-bottom: 4px;
`;

const DistributionSegment = styled.div<{ color: string; flex: string }>`
  flex: ${(props) => props.flex};
  background-color: ${(props) => props.color};
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shine 2s infinite;
  }

  @keyframes shine {
    to {
      left: 200%;
    }
  }

  &:hover {
    transform: scaleY(2);
  }
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 10px;
  color: rgba(0, 0, 0, 0.45);
`;

const LegendItem = styled.span<{ color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 4px;
  background: ${(props) => `${props.color}08`};
  border-radius: 3px;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => `${props.color}15`};
    transform: translateY(-1px);
  }

  &::before {
    content: "";
    width: 4px;
    height: 4px;
    background: ${(props) => props.color};
    border-radius: 1px;
  }
`;

interface Props {
  segment: QHAnalysis;
  allSegments: QHAnalysis[];
  days?: DayData[];
  position: { x: number; y: number };
  theme: ThemeConfig;
  isLeaving: boolean;
  isTransitioning: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const SegAnalysisTooltip: React.FC<Props> = ({
  segment,
  allSegments,
  days,
  position,
  theme,
  isLeaving,
  isTransitioning,
  onMouseEnter,
  onMouseLeave,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const analysis = analyzeSegment(segment, allSegments, days);

  const getSegmentColor = (type: string) =>
    theme.colors[type as keyof typeof theme.colors] || theme.colors.life;

  // 去重并分类建议
  const categorizedAdvices = useMemo(() => {
    const seen = new Set<string>();
    const uniqueAdvices = analysis.advices.filter((advice) => {
      const isDuplicate = seen.has(advice);
      seen.add(advice);
      return !isDuplicate;
    });

    return {
      warnings: uniqueAdvices.filter(
        (advice) =>
          advice.includes("⚠") ||
          advice.includes("建议") ||
          advice.includes("注意")
      ),
      success: uniqueAdvices.filter(
        (advice) =>
          advice.includes("✓") ||
          advice.includes("良好") ||
          advice.includes("继续保持")
      ),
      info: uniqueAdvices.filter(
        (advice) =>
          !advice.includes("⚠") &&
          !advice.includes("建议") &&
          !advice.includes("注意") &&
          !advice.includes("✓") &&
          !advice.includes("良好") &&
          !advice.includes("继续保持")
      ),
    };
  }, [analysis.advices]);

  // 添加鼠标移动跟踪
  useEffect(() => {
    const tooltip = tooltipRef.current;
    if (!tooltip) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = tooltip.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      tooltip.style.setProperty("--mouse-x", `${x}px`);
      tooltip.style.setProperty("--mouse-y", `${y}px`);
    };

    tooltip.addEventListener("mousemove", handleMouseMove);
    return () => tooltip.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <TooltipContainer
      ref={tooltipRef}
      isLeaving={isLeaving}
      isTransitioning={isTransitioning}
      theme={theme}
      style={{
        left: position.x,
        top: position.y,
        width: "280px",
        position: "fixed",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <AnalysisHeader>
        <SegmentBadge color={getSegmentColor(segment.mainType)}>
          {segment.segment}
        </SegmentBadge>
        <HeaderInfo>
          <SegmentTitle>
            {`${segment.startHour}:00 - ${segment.endHour}:00`}
          </SegmentTitle>
          <SegmentType>{getSegmentDescription(segment)}</SegmentType>
        </HeaderInfo>
      </AnalysisHeader>

      <Summary type={analysis.type}>{analysis.title}</Summary>

      <AdviceList>
        {categorizedAdvices.warnings.map((advice, index) => (
          <AdviceItem key={`warning-${index}`} type="warning">
            {advice}
          </AdviceItem>
        ))}
        {categorizedAdvices.success.map((advice, index) => (
          <AdviceItem key={`success-${index}`} type="success">
            {advice}
          </AdviceItem>
        ))}
        {categorizedAdvices.info.map((advice, index) => (
          <AdviceItem key={`info-${index}`} type="info">
            {advice}
          </AdviceItem>
        ))}
      </AdviceList>

      <Distribution>
        <DistributionBar>
          {Object.entries(segment.distribution || {}).map(([type, ratio]) => (
            <DistributionSegment
              key={type}
              color={getSegmentColor(type)}
              flex={typeof ratio === "number" ? ratio.toString() : "1"}
            />
          ))}
        </DistributionBar>
        <Legend>
          {Object.entries(segment.distribution || {}).map(([type, ratio]) => (
            <LegendItem key={type} color={getSegmentColor(type)}>
              {type} ({Math.round(Number(ratio) * 100)}%)
            </LegendItem>
          ))}
        </Legend>
      </Distribution>
    </TooltipContainer>
  );
};
