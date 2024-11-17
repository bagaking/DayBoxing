import React, { useEffect, useState } from "react";
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
  containerRef?: React.RefObject<HTMLDivElement>;
  boundaryRef?: React.RefObject<HTMLDivElement>;
  isLeaving?: boolean;
  isTransitioning?: boolean;
}

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
          <div
            style={{
              padding: "16px",
              backgroundColor: "rgba(0,0,0,0.02)",
              borderRadius: theme.borderRadius,
              border: "1px solid rgba(0,0,0,0.05)",
              color: theme.colors.text,
            }}
          >
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontSize: "14px",
                  color: "rgba(0,0,0,0.5)",
                  marginBottom: "4px",
                }}
              >
                Current Segment
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: theme.colors.text,
                }}
              >
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
              </div>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "13px", color: "rgba(0,0,0,0.5)" }}>
                  Pattern
                </div>
                <div style={{ fontSize: "15px" }}>
                  {`${data.segment.type} ${
                    data.segment.secondaryType
                      ? `(${data.segment.mainType}-${data.segment.secondaryType})`
                      : `(${data.segment.mainType})`
                  }`}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "13px", color: "rgba(0,0,0,0.5)" }}>
                  Distribution
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                >
                  {Object.entries(data.segment.distribution || {}).map(
                    ([type, ratio]) => (
                      <div
                        key={type}
                        style={{
                          flex:
                            typeof ratio === "number" ? ratio.toString() : "1",
                          height: "4px",
                          backgroundColor: getSegmentColor(type, theme),
                          borderRadius: "2px",
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
