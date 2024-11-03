import React, { useState } from "react";
import {
  DayBoxing,
  DayPattern,
  PatternEditEvent,
  lightTheme,
  darkTheme,
} from "@bagaking/dayboxing";
import { editPattern } from "@bagaking/dayboxing/utils/dayPatternUtils";

const predefinedPatterns = {
  normal: {
    startHour: 0,
    blocks: [
      { type: "sleep", duration: 8 },
      { type: "work", duration: 9 },
      { type: "base", duration: 3 },
      { type: "relax", duration: 4 },
    ],
  },
  nightOwl: {
    startHour: 4,
    blocks: [
      { type: "sleep", duration: 8 },
      { type: "work", duration: 9 },
      { type: "base", duration: 3 },
      { type: "relax", duration: 2 },
    ],
  },
  earlyBird: {
    startHour: -3,
    blocks: [
      { type: "sleep", duration: 7 },
      { type: "work", duration: 9 },
      { type: "base", duration: 3 },
      { type: "relax", duration: 4 },
    ],
  },
} as const;

const App: React.FC = () => {
  const [theme, setTheme] = useState<"default" | "light" | "dark">("default");
  const [patterns, setPatterns] = useState<DayPattern[]>([
    predefinedPatterns.normal,
    predefinedPatterns.nightOwl,
    predefinedPatterns.earlyBird,
  ]);

  const dates = ["2024-01-10", "2024-01-11", "2024-01-12"];

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
      <h1>DayBoxing Demo</h1>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setTheme("default")}>默认主题</button>
        <button onClick={() => setTheme("light")}>浅色主题</button>
        <button onClick={() => setTheme("dark")}>深色主题</button>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <h2>不同作息模式</h2>
        <p>展示了普通、夜猫子和早起鸟三种不同的作息时间模式</p>
        <p>点击方块或使用快捷键 (s/w/b/r) 修改时间类型</p>
      </div>
      <DayBoxing
        patterns={patterns}
        dates={dates}
        editable={true}
        onPatternEdit={handlePatternEdit}
        theme={getTheme()}
        shortcuts={{
          s: "sleep",
          w: "work",
          b: "base",
          r: "relax",
        }}
      />
    </div>
  );
};

export default App;
