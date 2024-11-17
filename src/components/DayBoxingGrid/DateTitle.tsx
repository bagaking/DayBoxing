import React from "react";
import styled from "styled-components";
import { ThemeConfig, DayData } from "../../types";

interface DateTitleProps {
  day: DayData;
  theme: ThemeConfig;
  onClick?: (day: DayData, event: React.MouseEvent) => void;
  renderDateLabel?: (date: string) => React.ReactNode;
}

// 计算颜色亮度
const getLuminance = (color: string): number => {
  // 将颜色转换为RGB
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // 计算亮度
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// 判断是否是暗色主题
const isDarkMode = (theme: ThemeConfig): boolean => {
  return getLuminance(theme.colors.text) > 0.5;
};

const DateTitleContainer = styled.div<{ theme: ThemeConfig }>`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.text};
  padding: 6px 12px;
  margin-bottom: ${(props) => props.theme.gap * 2}px;
  border-radius: ${(props) => props.theme.borderRadius}px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-block;
  position: relative;

  &:hover {
    background-color: ${(props) =>
      isDarkMode(props.theme) ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"};

    &::after {
      content: "查看当日分析";
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      color: ${(props) =>
        isDarkMode(props.theme)
          ? "rgba(255,255,255,0.45)"
          : "rgba(0,0,0,0.45)"};
      white-space: nowrap;
    }
  }
`;

export const DateTitle: React.FC<DateTitleProps> = ({
  day,
  theme,
  onClick,
  renderDateLabel,
}) => {
  return (
    <DateTitleContainer theme={theme} onClick={(e) => onClick?.(day, e)}>
      {renderDateLabel ? renderDateLabel(day.date) : day.date}
    </DateTitleContainer>
  );
};
