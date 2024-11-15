import React, { useState } from "react";
import { DayData, ThemeConfig, AnalysisStatus } from "../../types";
import { analyzeDayOverall } from "../../utils/qhAnalysis";
import styled from "styled-components";
import { CloseButton } from "./styles";

const OverlayContainer = styled.div<{
  theme: ThemeConfig;
  status: AnalysisStatus;
}>`
  position: absolute;
  top: 32px;
  left: 150px;
  right: 0;
  min-height: 120px;
  max-height: calc(100% - 40px);
  backdrop-filter: blur(24px) saturate(180%);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.85)
  );
  border-radius: ${(props) => props.theme.borderRadius * 1.5}px;
  border: 1px solid
    ${(props) => (props.status === "warning" ? "#faad2044" : "#52c41a44")};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1000;
  transform-origin: top;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:not([data-entering="true"]) {
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 24px;
    height: 24px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0, 0, 0, 0.45);
    background: rgba(0, 0, 0, 0.02);
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
      color: rgba(0, 0, 0, 0.85);
    }

    &::before,
    &::after {
      content: "";
      position: absolute;
      width: 12px;
      height: 1px;
      background: currentColor;
      transform: rotate(45deg);
    }

    &::after {
      transform: rotate(-45deg);
    }
  }
`;

const TitleRow = styled.div<{ status: AnalysisStatus }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding-right: 32px;

  .date {
    font-size: 16px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.88);
  }

  .title {
    color: ${(props) =>
      props.status === "warning" ? "rgb(250, 173, 20)" : "rgb(82, 196, 26)"};
    font-size: 14px;
    font-weight: 500;
    margin-right: auto;
  }

  .duration {
    background: ${(props) =>
      props.status === "warning"
        ? "rgba(250, 173, 20, 0.1)"
        : "rgba(82, 196, 26, 0.1)"};
    color: ${(props) =>
      props.status === "warning" ? "rgb(250, 173, 20)" : "rgb(82, 196, 26)"};
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
`;

const AnalysisContent = styled.div<{
  theme: ThemeConfig;
  status: AnalysisStatus;
}>`
  flex: 1;
  overflow-y: auto;
  padding-right: 12px;
  position: relative;

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  li {
    position: relative;
    padding: 16px;
    font-size: 13px;
    line-height: 1.6;
    color: rgba(0, 0, 0, 0.85);
    background: ${(props) =>
      props.status === "warning"
        ? "rgba(250, 173, 20, 0.08)"
        : "rgba(82, 196, 26, 0.08)"};
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
      background: ${(props) =>
        props.status === "warning"
          ? "rgba(250, 173, 20, 0.12)"
          : "rgba(82, 196, 26, 0.12)"};
    }
  }
`;

interface DayAnalysisTooltipProps {
  day: DayData;
  theme: ThemeConfig;
  isLeaving: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const DayAnalysisTooltip: React.FC<DayAnalysisTooltipProps> = ({
  day,
  theme,
  isLeaving,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const analysis = analyzeDayOverall(day);
  const today = new Date().toISOString().split("T")[0];

  const getDateStatus = () => {
    if (day.date === today) return "ongoing";
    if (day.date > today) return "planning";
    return "completed";
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave?.();
  };

  return (
    <OverlayContainer
      theme={theme}
      status={analysis.status}
      style={{ opacity: isLeaving ? 0 : 1 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CloseButton
        isVisible={isHovered}
        onClick={handleMouseLeave}
        aria-label="关闭分析面板"
        style={{ top: "12px", right: "12px" }}
      />
      <TitleRow status={analysis.status}>
        <span className="date">{day.date}</span>
        <span className="title">{analysis.title}</span>
        <span className="duration">{analysis.stats.duration}h</span>
      </TitleRow>
      <AnalysisContent status={analysis.status}>
        {analysis.advices.length > 0 && (
          <ul>
            {analysis.advices.map((advice, index) => (
              <li key={index}>{advice}</li>
            ))}
          </ul>
        )}
      </AnalysisContent>
    </OverlayContainer>
  );
};
