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

        setHourTooltip({
          data: {
            ...data,
            comment: hourData?.comment,
            segment: dayData?.segments.find(
              (s) => data.hour >= s.startHour && data.hour < s.endHour
            ),
          },
          position: { x: event.pageX, y: event.pageY },
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
    [daysData, segmentTooltip]
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

        setSegmentTooltip({
          segment,
          allSegments: dayData?.qhSegments || [],
          days: daysData,
          position: { x: event.pageX + 12, y: event.pageY },
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
