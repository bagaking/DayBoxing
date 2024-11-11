import React, { useState, useEffect } from "react";
import { useFloatingTooltip } from "../../hooks/useFloatingTooltip";
import { QHAnalysis, ThemeConfig, DayData } from "../../types";
import { getSegmentDescription, analyzeSegment } from "../../utils/qhAnalysis";

import {
  TooltipContainer,
  AnalysisHeader,
  SegmentBadge,
  HeaderInfo,
  SegmentTitle,
  SegmentType,
  Distribution,
  DistributionBar,
  DistributionSegment,
  Legend,
  LegendItem,
} from "./styles";

interface SegAnalysisTooltipProps {
  segment: QHAnalysis;
  allSegments: QHAnalysis[];
  days?: DayData[];
  position: { x: number; y: number };
  theme: ThemeConfig;
  isLeaving: boolean;
  isTransitioning: boolean;
  containerRef?: React.RefObject<HTMLDivElement>;
  boundaryRef?: React.RefObject<HTMLDivElement>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const getSegmentColor = (type: string, theme: ThemeConfig) => {
  return theme.colors[type as keyof typeof theme.colors] || theme.colors.life;
};

export const SegAnalysisTooltip: React.FC<SegAnalysisTooltipProps> = ({
  segment,
  allSegments,
  days,
  position,
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
      initialPosition: position,
      boundaryRef,
      containerRef,
      mouseBuffer: 24,
      offsetDistance: 16,
      pinToContainer: true,
    }
  );

  const analysis = analyzeSegment(segment, allSegments, days);

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

  return (
    <TooltipContainer
      ref={refs.setFloating}
      $isLeaving={isLeaving}
      $isTransitioning={isTransitioning}
      theme={theme}
      className={animationState}
      style={{
        position: strategy,
        top: y ?? position.y,
        left: x ?? position.x,
        width: "280px",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <AnalysisHeader>
        <SegmentBadge color={getSegmentColor(segment.mainType, theme)}>
          {segment.segment}
        </SegmentBadge>
        <HeaderInfo>
          <SegmentTitle>
            {`${segment.startHour}:00 - ${segment.endHour}:00`}
          </SegmentTitle>
          <SegmentType>{getSegmentDescription(segment)}</SegmentType>
        </HeaderInfo>
      </AnalysisHeader>

      <div style={{ margin: "12px 0" }}>
        <div
          style={{
            color: analysis.type === "warning" ? "#faad14" : "#52c41a",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "8px",
          }}
        >
          {analysis.title}
        </div>
        {analysis.advices.map((advice, index) => (
          <div
            key={index}
            style={{
              fontSize: "12px",
              color: "rgba(0,0,0,0.65)",
              marginBottom: "4px",
              paddingLeft: "12px",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                top: "6px",
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: advice.includes("⚠")
                  ? "#faad14"
                  : advice.includes("✓")
                  ? "#52c41a"
                  : "rgba(0,0,0,0.25)",
              }}
            />
            {advice}
          </div>
        ))}
      </div>

      <Distribution>
        <DistributionBar>
          {Object.entries(segment.distribution || {}).map(([type, ratio]) => (
            <DistributionSegment
              key={type}
              color={getSegmentColor(type, theme)}
              flex={typeof ratio === "number" ? ratio.toString() : "1"}
            />
          ))}
        </DistributionBar>
        <Legend>
          {Object.entries(segment.distribution || {}).map(([type, ratio]) => (
            <LegendItem key={type} color={getSegmentColor(type, theme)}>
              {type} ({Math.round(Number(ratio) * 100)}%)
            </LegendItem>
          ))}
        </Legend>
      </Distribution>

      <div
        className="arrow"
        ref={arrowRef}
        style={{
          left: arrowX != null ? `${arrowX}px` : "",
          top: arrowY != null ? `${arrowY}px` : "",
        }}
      />
    </TooltipContainer>
  );
};
