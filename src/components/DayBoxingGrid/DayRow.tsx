import React from "react";
import { HourCell } from "./HourCell";
import { QHSegments } from "./QHSegments";
import { DayRowProps, HourData, QHAnalysis } from "../../types";

export interface ExtendedDayRowProps extends DayRowProps {
  onSegmentHover?: (
    segment: QHAnalysis | null,
    event: React.MouseEvent
  ) => void;
}

export const DayRow: React.FC<ExtendedDayRowProps> = ({
  day,
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
}) => {
  // 将小时分组为每行7个
  const hourRows = day.hours.reduce<HourData[][]>((acc, hour, index) => {
    const rowIndex = Math.floor(index / 7);
    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }
    acc[rowIndex].push(hour);
    return acc;
  }, []);

  return (
    <div
      className="day-row"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: theme.gap * 2,
        marginBottom: theme.gap * 4,
        position: "relative",
      }}
    >
      {day.qhSegments && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.gap,
            paddingTop: showDateLabel ? "24px" : 0,
          }}
        >
          <QHSegments
            segments={day.qhSegments}
            theme={theme}
            onSegmentHover={onSegmentHover}
          />
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: hourRows.length * (theme.cellSize + theme.gap) - theme.gap,
        }}
      >
        {showDateLabel && (
          <div
            className="date-label"
            style={{
              minWidth: 100,
              fontSize: "14px",
              fontWeight: 500,
              marginBottom: theme.gap * 2,
            }}
          >
            {renderDateLabel ? renderDateLabel(day.date) : day.date}
          </div>
        )}
        <div
          className="hours-rows"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.gap,
            flex: 1,
          }}
        >
          {hourRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="hours-row"
              style={{
                display: "flex",
                gap: theme.gap,
                height: theme.cellSize,
              }}
            >
              {row.map((hour) => (
                <HourCell
                  key={hour.hour}
                  hour={hour}
                  date={day.date}
                  theme={theme}
                  editable={editable}
                  customTypes={customTypes}
                  onChange={onHourChange}
                  render={renderHour}
                  onHover={onHover}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
