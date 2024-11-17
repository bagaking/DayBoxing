import React, { useState } from "react";
import {
  DayBoxing,
  DayPattern,
  PatternEditEvent,
  lightTheme,
  darkTheme,
  createCommonPattern,
} from "@bagaking/dayboxing";
import { editPattern } from "@bagaking/dayboxing";

// 预定义的时间模式
const predefinedPatterns = {
  balanced: createCommonPattern("balanced"),
  improveFirst: {
    startHour: -2,
    blocks: [
      { type: "sleep", duration: 7 },
      { type: "improve", duration: 2, comment: "早起读书，效率最高" },
      { type: "work", duration: 4 },
      { type: "life", duration: 1 },
      { type: "work", duration: 4 },
      { type: "improve", duration: 2, comment: "晚上复习和思考" },
      { type: "life", duration: 2 },
      { type: "relax", duration: 2 },
    ],
  },
  workHard: {
    startHour: 0,
    blocks: [
      { type: "sleep", duration: 6 },
      { type: "work", duration: 5 },
      { type: "life", duration: 1 },
      { type: "work", duration: 4 },
      { type: "improve", duration: 1 },
      { type: "work", duration: 4 },
      { type: "life", duration: 1 },
      { type: "relax", duration: 2 },
    ],
  },
  learningDay: {
    startHour: -1,
    blocks: [
      { type: "sleep", duration: 7 },
      { type: "improve", duration: 3, comment: "早上专注学习" },
      { type: "work", duration: 4 },
      { type: "life", duration: 2 },
      { type: "improve", duration: 2, comment: "午后继续学习" },
      { type: "work", duration: 2 },
      { type: "improve", duration: 2, comment: "晚上查漏补缺" },
      { type: "life", duration: 1 },
      { type: "relax", duration: 1 },
    ],
  },
};

// 模式说明
const patternDescriptions = {
  balanced: "平衡模式：工作、学习、生活均衡分配，适合长期坚持",
  improveFirst: "学习优先：将高效时段用于自我提升，同时保证工作产出",
  workHard: "工作优先：以工作为主，但仍保持少量提升时间",
  learningDay: "学习日：集中时间在自我提升，适合周末或假期使用",
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<"default" | "light" | "dark">("default");
  const [patterns, setPatterns] = useState<DayPattern[]>([
    { ...predefinedPatterns.balanced },
    { ...predefinedPatterns.improveFirst },
    { ...predefinedPatterns.workHard },
    { ...predefinedPatterns.learningDay },
  ]);

  const dates = ["2024-01-10", "2024-01-11", "2024-01-12", "2024-01-13"];

  const handlePatternEdit = (event: PatternEditEvent) => {
    const index = dates.indexOf(event.date);
    if (index === -1) return;

    setPatterns((currentPatterns) => {
      const newPatterns = [...currentPatterns];
      newPatterns[index] = editPattern(
        currentPatterns[index],
        event.type,
        event.payload
      );
      return newPatterns;
    });
  };

  const getTheme = () => {
    switch (theme) {
      case "light":
        return lightTheme;
      case "dark":
        return darkTheme;
      default:
        return {};
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        background: theme === "dark" ? "#111827" : "#ffffff",
        color: theme === "dark" ? "#F9FAFB" : "#1F2937",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "2em", marginBottom: "16px" }}>
            DayBoxing 时间管理演示
          </h1>
          <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
            <button
              onClick={() => setTheme("default")}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                background: theme === "default" ? "#e5e7eb" : "transparent",
              }}
            >
              默认主题
            </button>
            <button
              onClick={() => setTheme("light")}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                background: theme === "light" ? "#e5e7eb" : "transparent",
              }}
            >
              浅色主题
            </button>
            <button
              onClick={() => setTheme("dark")}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                background: theme === "dark" ? "#374151" : "transparent",
              }}
            >
              深色主题
            </button>
          </div>
        </header>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "1.5em", marginBottom: "16px" }}>
            不同的时间分配模式
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {Object.entries(patternDescriptions).map(([key, desc]) => (
              <div
                key={key}
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  background:
                    theme === "dark" ? "rgba(255,255,255,0.05)" : "#f9fafb",
                  border: "1px solid #e5e7eb",
                }}
              >
                <h3 style={{ marginBottom: "8px", color: "#4b5563" }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </h3>
                <p style={{ fontSize: "14px", color: "#6b7280" }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div style={{ marginBottom: "16px" }}>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
              提示：点击时间块或使用快捷键 (S/W/L/R/I) 修改时间类型
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                display: "flex",
                gap: "16px",
                marginTop: "8px",
                fontSize: "12px",
                color: "#9ca3af",
              }}
            >
              <li>S - Sleep (睡眠)</li>
              <li>W - Work (工作)</li>
              <li>L - Life (生活)</li>
              <li>R - Relax (休闲)</li>
              <li>I - Improve (提升)</li>
            </ul>
          </div>

          <DayBoxing
            patterns={patterns}
            dates={dates}
            editable={true}
            onPatternEdit={handlePatternEdit}
            theme={getTheme()}
          />
        </section>
      </div>
    </div>
  );
};

export default App;
