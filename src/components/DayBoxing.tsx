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
  HoverEventHandler,
  SegmentHoverEventHandler,
} from "../types";
import { defaultTheme } from "../theme/default";
import { useDayBoxingData } from "../hooks/useDayBoxingData";
import { DayBoxingGrid } from "./DayBoxingGrid";
import { Tooltip, SegAnalysisTooltip } from "./Tooltip";

const TOOLTIP_CONTAINER_PIN_CLASS_NAME = "tooltip-container-pin";

interface TooltipState {
  data: HourTooltipData;
  position: { x: number; y: number };
  boundaryRef?: React.RefObject<HTMLDivElement>;
}

interface SegmentTooltipState {
  segment: QHAnalysis;
  allSegments: QHAnalysis[];
  days: DayData[];
  position: { x: number; y: number };
  boundaryRef?: React.RefObject<HTMLDivElement>;
  isLeaving: boolean;
  isTransitioning: boolean;
}

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

  const [hourTooltip, setHourTooltip] = useState<TooltipState | null>(null);

  const [segmentTooltip, setSegmentTooltip] =
    useState<SegmentTooltipState | null>(null);

  const tooltipTimeoutRef = useRef<number>();

  const activeTooltipRef = useRef<"hour" | "segment" | null>(null);

  const { data: daysData, updateHour } = useDayBoxingData({
    patterns,
    dates,
    onChange: onHourChange,
  });

  const handleHourHover: HoverEventHandler = (data, event, boundaryRef) => {
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
        position: {
          x: event.pageX,
          y: event.pageY,
        },
        boundaryRef,
      });
    } else {
      tooltipTimeoutRef.current = window.setTimeout(() => {
        if (activeTooltipRef.current === "hour") {
          setHourTooltip(null);
          activeTooltipRef.current = null;
        }
      }, 100) as unknown as number;
    }
  };

  const handleSegmentHover: SegmentHoverEventHandler = (
    segment,
    event,
    boundaryRef
  ) => {
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
        position: {
          x: event.pageX,
          y: event.pageY,
        },
        boundaryRef,
        isLeaving: false,
        isTransitioning: false,
      });
    } else {
      handleSegmentLeave();
    }
  };

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
          containerRef={containerRef}
          onMouseEnter={handleSegmentTooltipEnter}
          onMouseLeave={handleSegmentLeave}
        />
      )}
    </div>
  );
};
