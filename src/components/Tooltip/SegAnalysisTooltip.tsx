import React, { useState, useEffect } from "react";
import { useFloatingTooltip } from "../../hooks/useFloatingTooltip";
import { ThemeConfig, AnalysisStatus, SegmentTooltipProps } from "../../types";
import { getSegmentDescription, analyzeSegment } from "../../utils/qhAnalysis";
import styled from "styled-components";

const TooltipContainer = styled.div<{
  $isLeaving?: boolean;
  $isTransitioning?: boolean;
  theme: ThemeConfig;
}>`
  position: fixed;
  backdrop-filter: blur(5px) saturate(180%);
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.75) 30%,
    rgba(255, 255, 255, 0.95) 60%,
    rgba(255, 255, 255, 1) 100%
  );

  padding: 12px;
  border-radius: 12px;
  width: 300px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  opacity: ${(props) => (props.$isLeaving ? 0 : 1)};
  transform-origin: center center;
  transform: ${(props) =>
    props.$isLeaving ? "translateY(10px)" : "translateY(0)"};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.02),
    inset 0 0 0 1px rgba(255, 255, 255, 0.9);
  will-change: transform, opacity;
  perspective: 1000px;
  backface-visibility: hidden;

  &.entering {
    opacity: 0;
    transform: translate3d(0, -4px, 0);
  }

  &.animating {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &.entered {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  &:not(.entering):not(.leaving) {
    animation: gentleFloat 8s ease-in-out infinite;
  }

  @keyframes gentleFloat {
    0%,
    100% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(0, -2px, 0);
    }
  }
`;

const SegmentHeader = styled.div<{ status: AnalysisStatus }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: ${(props) =>
    props.status === "warning"
      ? "rgba(250, 173, 20, 0.08)"
      : "rgba(82, 196, 26, 0.08)"};
  border-radius: 8px;
  border: 1px solid
    ${(props) =>
      props.status === "warning"
        ? "rgba(250, 173, 20, 0.25)"
        : "rgba(82, 196, 26, 0.25)"};
`;

const SegmentBadge = styled.div<{ color: string }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.color};
  background: ${(props) => `${props.color}15`};
  border-radius: 8px;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 1);
`;

const SegmentInfo = styled.div`
  flex: 1;
  min-width: 0;

  .time {
    font-size: 13px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.88);
    margin-bottom: 2px;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .type {
    font-size: 11px;
    color: rgba(0, 0, 0, 0.55);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
  }
`;

const DistributionBar = styled.div`
  height: 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  overflow: hidden;
  margin: 8px 0;
`;

const DistributionSegment = styled.div<{ color: string; flex: string }>`
  flex: ${(props) => props.flex};
  background: ${(props) => props.color};
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.02);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 1.5px;
  }
`;

const AdviceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AdviceItem = styled.div<{ type: "warning" | "suggestion" | "tip" }>`
  position: relative;
  padding: 8px 10px;
  font-size: 11px;
  line-height: 1.5;
  letter-spacing: 0.2px;
  color: ${(props) => {
    switch (props.type) {
      case "warning":
        return "rgb(250, 173, 20)";
      case "suggestion":
        return "rgb(82, 196, 26)";
      case "tip":
        return "rgba(0, 0, 0, 0.65)";
    }
  }};
  background: ${(props) => {
    switch (props.type) {
      case "warning":
        return "rgba(250, 173, 20, 0.06)";
      case "suggestion":
        return "rgba(82, 196, 26, 0.06)";
      case "tip":
        return "rgba(0, 0, 0, 0.03)";
    }
  }};
  border-radius: 6px;
  border: 1px solid
    ${(props) => {
      switch (props.type) {
        case "warning":
          return "rgba(250, 173, 20, 0.1)";
        case "suggestion":
          return "rgba(82, 196, 26, 0.1)";
        case "tip":
          return "rgba(0, 0, 0, 0.04)";
      }
    }};
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
`;

// 添加段落特征指标展示
const FeatureIndicators = styled.div`
  display: flex;
  gap: 6px;
  margin: 4px 0;
`;

const Indicator = styled.div<{ status: AnalysisStatus }>`
  flex: 1;
  padding: 6px 8px;
  background: ${(props) => {
    switch (props.status) {
      case "success":
        return "rgba(82, 196, 26, 0.04)";
      case "warning":
        return "rgba(250, 173, 20, 0.04)";
      case "info":
        return "rgba(0, 0, 0, 0.02)";
    }
  }};
  border: 0.5px solid rgba(0, 0, 0, 0.04);
  border-radius: 6px;

  .label {
    color: rgba(0, 0, 0, 0.45);
    font-size: 10px;
    white-space: nowrap;
    margin-bottom: 2px;
  }

  .value {
    font-size: 13px;
    font-weight: 500;
    color: ${(props) => {
      switch (props.status) {
        case "success":
          return "rgb(82, 196, 26)";
        case "warning":
          return "rgb(250, 173, 20)";
        case "info":
          return "rgba(0, 0, 0, 0.78)";
      }
    }};
  }
`;

// 添加时间上下文展示
const TimeContext = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  margin: 4px 0;
  padding: 4px 6px;
  background: rgba(0, 0, 0, 0.015);
  border-radius: 4px;
  font-size: 10px;
  color: rgba(0, 0, 0, 0.4);

  .time-block {
    padding: 1px 4px;
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.02);

    &.current {
      background: ${(props) => props.color};
      color: white;
      font-weight: 500;
    }
  }
`;

interface SegAnalysisTooltipProps extends SegmentTooltipProps {}

const getSegmentColor = (type: string, theme: ThemeConfig) => {
  return theme.colors[type as keyof typeof theme.colors] || theme.colors.life;
};

export const SegAnalysisTooltip: React.FC<SegAnalysisTooltipProps> = ({
  segment,
  allSegments,
  days,
  position: initialPosition,
  theme,
  isLeaving,
  isTransitioning,
  containerRef,
  boundaryRef,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [animationState, setAnimationState] = useState<
    "entering" | "animating" | "entered" | "leaving"
  >("entering");

  const { x, y, strategy, refs, arrowRef, arrowX, arrowY } = useFloatingTooltip(
    {
      initialPosition,
      boundaryRef,
      containerRef,
      placement: "bottom-start",
      mouseBuffer: 12,
      offsetDistance: 8,
    }
  );

  useEffect(() => {
    const floating = refs.floating.current;
    if (!floating) return;

    if (isLeaving) {
      setAnimationState("leaving");
      return;
    }

    floating.classList.add("entering");
    setAnimationState("entering");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        floating.classList.add("animating");
        setAnimationState("animating");

        setTimeout(() => {
          floating.classList.remove("entering");
          floating.classList.add("entered");
          setAnimationState("entered");
        }, 200);
      });
    });

    return () => {
      floating.classList.remove("entering", "animating", "entered");
    };
  }, [refs.floating, isLeaving]);

  const analysis = analyzeSegment(segment, allSegments, days);
  const stats = analysis.stats!;

  // 计算段落特征指标
  const getActivityDensity = (): {
    value: number;
    status: AnalysisStatus;
    transitions: number;
    hours: number;
  } => {
    // 获取当前段的小时数据
    const segmentHours =
      days?.[0]?.hours.filter(
        (h) => h.hour >= segment.startHour && h.hour < segment.endHour
      ) || [];

    // 计算活动切换次数
    let transitions = 0;
    for (let i = 1; i < segmentHours.length; i++) {
      if (segmentHours[i].type !== segmentHours[i - 1].type) {
        transitions++;
      }
    }

    const duration = segment.endHour - segment.startHour;
    const density = transitions / duration;

    return {
      value: density,
      status: density > 1 ? "warning" : density > 0.5 ? "info" : "success",
      transitions,
      hours: duration,
    };
  };

  const getMainActivityFocus = (): {
    value: number;
    status: AnalysisStatus;
  } => {
    const mainTypeRatio = stats.mainTypePercent / 100;
    return {
      value: mainTypeRatio,
      status:
        mainTypeRatio < 0.6
          ? "warning"
          : mainTypeRatio > 0.8
          ? "success"
          : "info",
    };
  };

  const activityDensity = getActivityDensity();
  const mainActivityFocus = getMainActivityFocus();

  // 获取相邻段落信息
  const getPrevSegment = () => {
    const index = allSegments.findIndex((s) => s === segment);
    return index > 0 ? allSegments[index - 1] : null;
  };

  const getNextSegment = () => {
    const index = allSegments.findIndex((s) => s === segment);
    return index < allSegments.length - 1 ? allSegments[index + 1] : null;
  };

  const prevSegment = getPrevSegment();
  const nextSegment = getNextSegment();

  return (
    <TooltipContainer
      ref={refs.setFloating}
      $isLeaving={isLeaving}
      $isTransitioning={isTransitioning}
      theme={theme}
      className={animationState}
      style={{
        position: strategy,
        top: y ?? initialPosition.y,
        left: x ?? initialPosition.x,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <SegmentHeader status={analysis.status as AnalysisStatus}>
        <SegmentBadge color={getSegmentColor(segment.mainType, theme)}>
          {segment.segment}
        </SegmentBadge>
        <SegmentInfo>
          <div className="time">{`${segment.startHour}:00 - ${segment.endHour}:00`}</div>
          <div className="type">{getSegmentDescription(segment)}</div>
        </SegmentInfo>
      </SegmentHeader>

      <TimeContext color={getSegmentColor(segment.mainType, theme)}>
        {prevSegment && (
          <>
            <span>{prevSegment.segment}</span>
            <span className="time-block">
              {`${prevSegment.startHour}:00-${prevSegment.endHour}:00`}
            </span>
            <span>→</span>
          </>
        )}
        <span className="time-block current">
          {`${segment.startHour}:00-${segment.endHour}:00`}
        </span>
        {nextSegment && (
          <>
            <span>→</span>
            <span className="time-block">
              {`${nextSegment.startHour}:00-${nextSegment.endHour}:00`}
            </span>
            <span>{nextSegment.segment}</span>
          </>
        )}
      </TimeContext>

      <FeatureIndicators>
        <Indicator status={mainActivityFocus.status}>
          <div className="label">主要活动占比</div>
          <div className="value">{`${Math.round(
            mainActivityFocus.value * 100
          )}%`}</div>
        </Indicator>
        <Indicator status={activityDensity.status}>
          <div className="label">切换密度</div>
          <div className="value">
            {`${activityDensity.transitions}次/${activityDensity.hours}h`}
          </div>
        </Indicator>
        <Indicator status="info">
          <div className="label">段长</div>
          <div className="value">{`${
            segment.endHour - segment.startHour
          }h`}</div>
        </Indicator>
      </FeatureIndicators>

      <DistributionBar>
        {Object.entries(segment.distribution || {}).map(([type, ratio]) => (
          <DistributionSegment
            key={type}
            color={getSegmentColor(type, theme)}
            flex={typeof ratio === "number" ? ratio.toString() : "1"}
          />
        ))}
      </DistributionBar>

      <ContentArea>
        <AdviceSection>
          {analysis.advices
            .filter((a) => a.type === "warning")
            .map((advice, i) => (
              <AdviceItem key={i} type="warning">
                {advice.content}
              </AdviceItem>
            ))}
          {analysis.advices
            .filter((a) => a.type === "suggestion")
            .map((advice, i) => (
              <AdviceItem key={i} type="suggestion">
                {advice.content}
              </AdviceItem>
            ))}
          {analysis.advices
            .filter((a) => a.type === "tip")
            .map((advice, i) => (
              <AdviceItem key={i} type="tip">
                {advice.content}
              </AdviceItem>
            ))}
        </AdviceSection>
      </ContentArea>
    </TooltipContainer>
  );
};
