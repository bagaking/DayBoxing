import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { DayBoxingProps, HourTooltipData, HourChangeEvent } from "../types";
import { defaultTheme } from "../theme/default";
import { useDayBoxingData } from "../hooks/useDayBoxingData";
import { DayBoxingGrid } from "./DayBoxingGrid";
import { Tooltip } from "./Tooltip";

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

  const [tooltip, setTooltip] = useState<{
    data: HourTooltipData;
    position: { x: number; y: number };
  } | null>(null);
  const tooltipTimeoutRef = useRef<number>();

  const { data: daysData, updateHour } = useDayBoxingData({
    patterns,
    dates,
    onChange: onHourChange,
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!editable || !tooltip) return;

      const key = e.key.toLowerCase();
      if (shortcuts[key]) {
        e.preventDefault();
        updateHour(tooltip.data.date, tooltip.data.hour, shortcuts[key]);
      }
    },
    [editable, shortcuts, updateHour, tooltip]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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

  const handleHover = useCallback(
    (data: HourTooltipData | null, event: React.MouseEvent) => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }

      if (data) {
        const dayData = daysData.find((d) => d.date === data.date);
        const hourData = dayData?.hours.find((h) => h.hour === data.hour);

        setTooltip({
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
          setTooltip(null);
        }, 100) as unknown as number;
      }
    },
    [daysData]
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
        onHover={handleHover}
      />
      {tooltip && (
        <Tooltip {...tooltip} theme={theme} containerRef={containerRef} />
      )}
    </div>
  );
};
