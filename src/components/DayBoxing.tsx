import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {
  DayBoxingProps,
  HourTooltipData,
  HourChangeEvent,
  QHAnalysis,
  DayData,
} from "../types";
import { defaultTheme } from "../theme/default";
import { useDayBoxingData } from "../hooks/useDayBoxingData";
import { DayBoxingGrid } from "./DayBoxingGrid";
import { Tooltip, SegAnalysisTooltip } from "./Tooltip";

const TOOLTIP_CONTAINER_PIN_CLASS_NAME = "tooltip-container-pin";

export const DayBoxing: React.FC<DayBoxingProps> = ({
  patterns,
  dates,
  direction = "horizontal",
  theme: customTheme = {},
  showDateLabel = true,
  renderHour,
  renderDateLabel,
  onHourChange,
  editable = false,
  shortcuts = {},
  customTypes,
  typeOrder,
  onPatternEdit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const theme = useMemo(
    () => ({ ...defaultTheme, ...customTheme }),
    [customTheme]
  );

  const [hourTooltip, setHourTooltip] = useState<{
    data: HourTooltipData;
    position: { x: number; y: number };
  } | null>(null);

  const [segmentTooltip, setSegmentTooltip] = useState<{
    segment: QHAnalysis;
    allSegments: QHAnalysis[];
    days: DayData[];
    position: { x: number; y: number };
    isLeaving: boolean;
    isTransitioning: boolean;
  } | null>(null);

  const tooltipTimeoutRef = useRef<number>();

  const { data: daysData, updateHour } = useDayBoxingData({
    patterns,
    dates,
    onChange: onHourChange,
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!editable || !hourTooltip) return;

      const key = e.key.toLowerCase();
      if (shortcuts[key]) {
        e.preventDefault();
        updateHour(
          hourTooltip.data.date,
          hourTooltip.data.hour,
          shortcuts[key]
        );
      }
    },
    [editable, shortcuts, updateHour, hourTooltip]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const activeTooltipRef = useRef<"hour" | "segment" | null>(null);

  const calculateTooltipPosition = useCallback((e: React.MouseEvent) => {
    let mousePos = { x: e.pageX, y: e.pageY };
    let target = e.target as HTMLElement;
    if (!target) return mousePos;

    if (!containerRef.current) return mousePos;
    // Get container bounds
    const containerRect = target
      .closest(`.${TOOLTIP_CONTAINER_PIN_CLASS_NAME}`)
      ?.getBoundingClientRect();
    if (!containerRect) return mousePos;

    // 现在 containerRect 和 mouse 坐标都是相对于视口的了
    const containerCenterX = containerRect.left + containerRect.width / 2;
    const containerCenterY = containerRect.top + containerRect.height / 2;

    const targetRect = target.getBoundingClientRect();
    const targetCenter = {
      x: targetRect.left + targetRect.width / 2,
      y: targetRect.top + targetRect.height / 2,
    };

    // Determine tooltip position based on which quadrant the mouse is in
    if (targetCenter.x > containerCenterX) {
      // Mouse is on right side
      mousePos.x -= 320; // Move tooltip to left
    }

    if (targetCenter.y > containerCenterY) {
      // Mouse is below center
      mousePos.y -= 160; // Move tooltip up
    }

    console.log(
      "Tooltip is in the same container",
      containerRef,
      containerRect,
      { containerCenterX, containerCenterY },

      { x: e.pageX, y: e.pageY },
      mousePos
    );

    return mousePos;
  }, []);

  const handleHourHover = useCallback(
    (data: HourTooltipData | null, event: React.MouseEvent) => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }

      if (data) {
        activeTooltipRef.current = "hour";
        if (segmentTooltip) {
          setSegmentTooltip((prev) =>
            prev ? { ...prev, isLeaving: true } : null
          );
          setTimeout(() => setSegmentTooltip(null), 300);
        }

        const dayData = daysData.find((d) => d.date === data.date);
        const hourData = dayData?.hours.find((h) => h.hour === data.hour);

        // Calculate tooltip position
        const position = calculateTooltipPosition(event);

        setHourTooltip({
          data: {
            ...data,
            comment: hourData?.comment,
            segment: dayData?.segments.find(
              (s) => data.hour >= s.startHour && data.hour < s.endHour
            ),
          },
          position,
        });
      } else {
        tooltipTimeoutRef.current = window.setTimeout(() => {
          if (activeTooltipRef.current === "hour") {
            setHourTooltip(null);
            activeTooltipRef.current = null;
          }
        }, 100) as unknown as number;
      }
    },
    [daysData, segmentTooltip, calculateTooltipPosition]
  );

  const handleSegmentHover = useCallback(
    (segment: QHAnalysis | null, event: React.MouseEvent) => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }

      if (segment) {
        activeTooltipRef.current = "segment";
        if (hourTooltip) {
          setHourTooltip(null);
        }

        const dayData = daysData.find((d) =>
          d.qhSegments?.some((s) => s.segment === segment.segment)
        );

        // Calculate tooltip position
        const position = calculateTooltipPosition(event);

        setSegmentTooltip({
          segment,
          allSegments: dayData?.qhSegments || [],
          days: daysData,
          position: {
            x: position.x + 48,
            y: (position.y + event.pageY * 2) / 3,
          },
          isLeaving: false,
          isTransitioning: false,
        });
      } else {
        handleSegmentLeave();
      }
    },
    [daysData, hourTooltip]
  );

  const handleSegmentTooltipEnter = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    activeTooltipRef.current = "segment";
    console.log("Segment tooltip enter");
  }, []);

  const handleSegmentLeave = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    console.log("Segment tooltip leave");

    tooltipTimeoutRef.current = window.setTimeout(() => {
      if (activeTooltipRef.current === "segment") {
        setSegmentTooltip((prev) =>
          prev ? { ...prev, isLeaving: true } : null
        );
        setTimeout(() => {
          setSegmentTooltip(null);
          activeTooltipRef.current = null;
        }, 300);
      }
    }, 100) as unknown as number;
  }, []);

  const handleHourClick = useCallback(
    (event: HourChangeEvent) => {
      if (!editable) return;
      const types = typeOrder || ["sleep", "work", "life", "relax"];
      const currentIndex = types.indexOf(event.oldType);
      const nextType = types[(currentIndex + 1) % types.length];
      updateHour(event.date, event.hour, nextType);
    },
    [editable, typeOrder, updateHour]
  );

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="day-boxing"
      style={{
        padding: theme.gap * 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <DayBoxingGrid
        pinClassName={TOOLTIP_CONTAINER_PIN_CLASS_NAME}
        data={daysData}
        direction={direction}
        theme={theme}
        showDateLabel={showDateLabel}
        renderDateLabel={renderDateLabel}
        renderHour={renderHour}
        onHourChange={handleHourClick}
        editable={editable}
        customTypes={customTypes}
        onHover={handleHourHover}
        onSegmentHover={handleSegmentHover}
      />

      {hourTooltip && (
        <Tooltip {...hourTooltip} theme={theme} containerRef={containerRef} />
      )}

      {segmentTooltip && (
        <SegAnalysisTooltip
          {...segmentTooltip}
          theme={theme}
          onMouseEnter={handleSegmentTooltipEnter}
          onMouseLeave={handleSegmentLeave}
        />
      )}
    </div>
  );
};
