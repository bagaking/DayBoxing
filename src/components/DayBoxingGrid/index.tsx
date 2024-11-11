import React from "react";
import { DayRow } from "./DayRow";
import {
  DayBoxingGridProps,
  HoverEventHandler,
  SegmentHoverEventHandler,
  HourRenderer,
} from "../../types";

export interface ExtendedDayBoxingGridProps
  extends Omit<
    DayBoxingGridProps,
    "onHover" | "onSegmentHover" | "renderHour"
  > {
  onHover?: HoverEventHandler;
  onSegmentHover?: SegmentHoverEventHandler;
  pinClassName?: string;
  renderHour?: HourRenderer;
}

export const DayBoxingGrid: React.FC<ExtendedDayBoxingGridProps> = ({
  data,
  direction,
  theme,
  showDateLabel,
  renderDateLabel,
  renderHour,
  onHourChange,
  editable,
  customTypes,
  onHover,
  onSegmentHover,
  pinClassName,
}) => {
  return (
    <div
      className="day-boxing-grid"
      style={{
        display: "flex",
        flexDirection: direction === "horizontal" ? "column" : "row",
        gap: theme.gap * 4,
      }}
    >
      {data.map((day) => (
        <DayRow
          pinClassName={pinClassName}
          key={day.date}
          day={day}
          direction={direction}
          theme={theme}
          showDateLabel={showDateLabel}
          renderDateLabel={renderDateLabel}
          renderHour={renderHour}
          onHourChange={onHourChange}
          editable={editable}
          customTypes={customTypes}
          onHover={onHover}
          onSegmentHover={onSegmentHover}
        />
      ))}
    </div>
  );
};
