import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { useFloatingTooltip } from "../../hooks/useFloatingTooltip";

import { HourTooltipData, ThemeConfig, DEFAULT_SHORTCUTS } from "../../types";
import { formatHourClip24 as formatHour } from "../../utils/qhAnalysis";

import {
  TooltipContainerDiv,
  TimeBlockDiv,
  PreviousDayBadgeDiv,
  CommentSection,
} from "./styles";

interface TooltipProps {
  data: HourTooltipData | null;
  position: { x: number; y: number };
  theme: ThemeConfig;
  enableEdit?: boolean;
  containerRef?: React.RefObject<HTMLDivElement>;
  boundaryRef?: React.RefObject<HTMLDivElement>;
  isLeaving?: boolean;
  isTransitioning?: boolean;
}

const SegmentTitle = styled.div`
  font-size: 14px;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 4px;
`;

const SegmentTitleContainer = styled.div<{ theme: ThemeConfig }>`
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

const SegmentContainer = styled.div<{ theme: ThemeConfig }>`
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const SegmentPartTitle = styled.div`
  font-size: 13px;
  color: rgba(0, 0, 0, 0.5);
`;

const DistributionBar = styled.div<{
  $ratio?: number;
  $type: string;
  $isActive: boolean;
  theme: ThemeConfig;
}>`
  flex: ${(props) => props.$ratio || 1};
  height: 6px;
  background-color: ${(props) => getSegmentColor(props.$type, props.theme)};
  border-radius: 2px;
  transition: all 0.3s ease;

  ${(props) =>
    props.$isActive &&
    css`
      transform: scale(1.05);
      border: 1px solid rgba(0, 0, 0, 0.9);
      z-index: 1;
    `}
`;

// 从 theme 获取颜色
const getSegmentColor = (type: string, theme: ThemeConfig) => {
  return theme.colors[type as keyof typeof theme.colors] || theme.colors.life;
};

// 使用常量替代硬编码
const SHORTCUT_KEYS = Object.keys(DEFAULT_SHORTCUTS).map((key) =>
  key.toUpperCase()
);

export const Tooltip: React.FC<TooltipProps> = ({
  data,
  position: initialPosition,
  theme,
  containerRef,
  boundaryRef,
  isLeaving,
  isTransitioning,
  enableEdit = true,
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

  if (!data) return null;

  const formatHourDisplay = (hour: number) => {
    const displayHour = formatHour(hour);
    const isPreviousDay = hour < 0;
    return { displayHour, isPreviousDay };
  };

  return (
    <TooltipContainerDiv
      ref={refs.setFloating}
      $isLeaving={isLeaving}
      $isTransitioning={isTransitioning}
      theme={theme}
      className={animationState}
      style={{
        position: strategy,
        top: y ?? initialPosition.y,
        left: x ?? initialPosition.x,
        transform: `translate3d(0, ${isLeaving ? "10px" : "0"}, 0)`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <TimeBlockDiv
            style={{ backgroundColor: getSegmentColor(data.type, theme) }}
          >
            {formatHourDisplay(data.hour).displayHour}
            {formatHourDisplay(data.hour).isPreviousDay && (
              <PreviousDayBadgeDiv theme={theme}>-1d</PreviousDayBadgeDiv>
            )}
          </TimeBlockDiv>

          <div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 600,
                marginBottom: "4px",
                color: "rgba(0,0,0,0.75)",
              }}
            >
              {`${data.hour}:00`}
            </div>
            <div
              style={{
                color: "rgba(0,0,0,0.6)",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: getSegmentColor(data.type, theme),
                }}
              />
              {data.type.charAt(0).toUpperCase() + data.type.slice(1)}
            </div>
          </div>
        </div>

        {data.comment && <CommentSection>{data.comment}</CommentSection>}

        {data.segment && (
          <SegmentContainer theme={theme}>
            <SegmentTitle>Current Segment</SegmentTitle>
            <SegmentTitleContainer theme={theme}>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: getSegmentColor(
                    data.segment.mainType,
                    theme
                  ),
                }}
              />
              {`${data.segment.startHour}:00 - ${data.segment.endHour}:00`}
            </SegmentTitleContainer>

            <div style={{ display: "grid", gap: "12px" }}>
              <div>
                <SegmentPartTitle>Pattern</SegmentPartTitle>
                <div style={{ fontSize: "15px" }}>
                  {`${data.segment.type} ${
                    data.segment.secondaryType
                      ? `(${data.segment.mainType}-${data.segment.secondaryType})`
                      : `(${data.segment.mainType})`
                  }`}
                </div>
              </div>

              <div>
                <SegmentPartTitle>Distribution</SegmentPartTitle>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                >
                  {Object.entries(data.segment.distribution || {}).map(
                    ([type, ratio]) => (
                      <DistributionBar
                        key={type}
                        $type={type}
                        $ratio={typeof ratio === "number" ? ratio : undefined}
                        $isActive={type === data.type}
                        theme={theme}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </SegmentContainer>
        )}

        {enableEdit && (
          <div
            style={{
              fontSize: "12px",
              color: "rgba(0,0,0,0.4)",
              display: "flex",
              gap: "8px",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <span>Press</span>
            {SHORTCUT_KEYS.map((key) => (
              <span
                key={key}
                style={{
                  padding: "2px 6px",
                  backgroundColor: "rgba(0,0,0,0.05)",
                  borderRadius: "4px",
                  fontSize: "11px",
                  pointerEvents: "none",
                }}
              >
                {key}
              </span>
            ))}
            <span>to change type</span>
          </div>
        )}
      </div>

      <div
        className="arrow"
        ref={arrowRef}
        style={{
          left: arrowX != null ? `${arrowX}px` : "",
          top: arrowY != null ? `${arrowY}px` : "",
        }}
      />
    </TooltipContainerDiv>
  );
};
