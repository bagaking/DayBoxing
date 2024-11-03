import React from "react";
import { HourCell } from "./HourCell";
import { QHSegments } from "./QHSegments";
import { DayRowProps } from "../../types";

export const DayRow: React.FC<DayRowProps> = ({
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
      }}
    >
      <div
        style={{ display: "flex", flexDirection: "column", gap: theme.gap * 2 }}
      >
        {showDateLabel && (
          <div
            className="date-label"
            style={{
              minWidth: 100,
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {renderDateLabel ? renderDateLabel(day.date) : day.date}
          </div>
        )}
        <div
          className="hours-rows"
          style={{ display: "flex", flexDirection: "column", gap: theme.gap }}
        >
          {hourRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="hours-row"
              style={{
                display: "flex",
                gap: theme.gap,
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
      {day.qhSegments && (
        <div
          style={{
            marginLeft: theme.gap * 2,
            paddingTop: "24px", // 与日期标签对齐
          }}
        >
          <QHSegments segments={day.qhSegments} theme={theme} />
        </div>
      )}
    </div>
  );
};
