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
  HourType,
  DayData,
  HoverEventHandler,
  SegmentHoverEventHandler,
  BaseSegmentTooltipState,
  DEFAULT_SHORTCUTS,
  DEFAULT_HOUR_TYPES,
} from "../types";
import { defaultTheme } from "../theme/default";
import { useDayBoxingData } from "../hooks/useDayBoxingData";
import { DayBoxingGrid } from "./DayBoxingGrid";
import { Tooltip, SegAnalysisTooltip, DayAnalysisTooltip } from "./Tooltip";

interface TooltipState {
  data: HourTooltipData;
  position: { x: number; y: number };
  boundaryRef?: React.RefObject<HTMLDivElement>;
}

interface SegmentTooltipState extends BaseSegmentTooltipState {
  boundaryRef?: React.RefObject<HTMLDivElement>;
}

interface DayTitleTooltip {
  day: DayData;
  position: { x: number; y: number };
  isLeaving: boolean;
  isTransitioning: boolean;
}

export const DayBoxing: React.FC<DayBoxingProps> = ({
  patterns,
  dates,
  style,
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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const theme = useMemo(
    () => ({ ...defaultTheme, ...customTheme }),
    [customTheme]
  );

  const [hourTooltip, setHourTooltip] = useState<TooltipState | null>(null);

  const [segmentTooltip, setSegmentTooltip] =
    useState<SegmentTooltipState | null>(null);

  const [dayTitleTooltip, setDayTitleTooltip] =
    useState<DayTitleTooltip | null>(null);

  const tooltipTimeoutRef = useRef<number>();

  const activeTooltipRef = useRef<"hour" | "segment" | null>(null);

  const { data: daysData, updateHour } = useDayBoxingData({
    patterns,
    dates,
    onChange: onHourChange,
  });

  const shortcutMap = {
    ...DEFAULT_SHORTCUTS,
    ...shortcuts,
  };

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
          segment: dayData?.qhSegments?.find(
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

  const handleDateTitleClick = useCallback(
    (day: DayData, event: React.MouseEvent) => {
      if (!day) return;

      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (!containerRect) return;

      setDayTitleTooltip({
        day,
        position: {
          x: rect.left - containerRect.left,
          y: rect.bottom - containerRect.top,
        },
        isLeaving: false,
        isTransitioning: false,
      });
    },
    []
  );

  const handleDayAnalysisClose = useCallback(() => {
    setDayTitleTooltip(null);
  }, []);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!editable || !hourTooltip) return;

      const key = event.key.toLowerCase();
      const newType = shortcutMap[key];

      if (newType) {
        updateHour(hourTooltip.data.date, hourTooltip.data.hour, newType);
      }
    },
    [editable, hourTooltip, shortcutMap, updateHour]
  );

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div
      ref={containerRef}
      className="day-boxing"
      style={{
        padding: theme.gap * 2,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
      tabIndex={0}
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
        typeOrder={(typeOrder || DEFAULT_HOUR_TYPES).map((t) => t as HourType)}
        onHover={handleHourHover}
        onSegmentHover={handleSegmentHover}
        onDateTitleClick={handleDateTitleClick}
      />

      {hourTooltip && (
        <Tooltip
          {...hourTooltip}
          theme={theme}
          containerRef={containerRef}
          enableEdit={editable}
        />
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

      {dayTitleTooltip && (
        <DayAnalysisTooltip
          {...dayTitleTooltip}
          theme={theme}
          onMouseLeave={handleDayAnalysisClose}
        />
      )}
    </div>
  );
};
