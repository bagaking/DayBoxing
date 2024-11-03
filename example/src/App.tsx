import React, { useState } from "react";
import {
  DayBoxing,
  HourType,
  PartType,
  DayData,
  HourChangeEvent,
} from "@bagaking/dayboxing";
import { lightTheme, darkTheme } from "@bagaking/dayboxing";

// 创建不同的时间模式 [startHour, endHour)
const timePatterns = {
  normal: {
    sleep: [0, 8], // 0:00-8:00
    work: [9, 18], // 9:00-18:00
    base: [18, 21], // 18:00-21:00
    relax: [21, 24], // 21:00-24:00
  },
  nightOwl: {
    sleep: [4, 12], // 4:00-12:00 (从前一天4点开始)
    work: [13, 22], // 13:00-22:00
    base: [22, 1], // 22:00-25:00
    relax: [1, 2], // 25:00-26:00
  },
  earlyBird: {
    sleep: [21, 4], // -3:00-4:00 (从前一天21点开始)
    work: [5, 14], // 5:00-14:00
    base: [14, 17], // 14:00-17:00
    relax: [17, 21], // 17:00-21:00
  },
};

const createSampleData = (
  date: string,
  pattern: keyof typeof timePatterns
): DayData => {
  const hours: Array<HourData> = [];
  const segments: Array<DaySegment> = [];
  const p = timePatterns[pattern];

  // 获取模式的起始时间（前一天的入睡时间）
  const startHour =
    pattern === "nightOwl"
      ? 4 // 夜猫子从前一天4点开始
      : pattern === "earlyBird"
      ? 21 // 早起鸟从前一天21点开始
      : 0; // 普通模式从0点开始

  // 创建24小时的数据
  for (let i = 0; i < 24; i++) {
    const actualHour = (startHour + i) % 24;
    let displayHour: number;

    // 计算显示时间
    if (pattern === "earlyBird") {
      // 早起鸟模式：前3小时显示负数
      displayHour = i < 3 ? i - 3 : i;
    } else {
      // 其他模式：直接使用实际小时数
      displayHour = actualHour;
    }

    let type: HourType = "base";

    const isInRange = (hour: number, start: number, end: number) => {
      if (end > start) {
        return hour >= start && hour < end;
      } else {
        return hour >= start || hour < end;
      }
    };

    // 判断当前小时属于哪个类型
    if (isInRange(actualHour, p.sleep[0], p.sleep[1])) type = "sleep";
    else if (isInRange(actualHour, p.work[0], p.work[1])) type = "work";
    else if (isInRange(actualHour, p.base[0], p.base[1])) type = "base";
    else if (isInRange(actualHour, p.relax[0], p.relax[1])) type = "relax";

    hours.push({
      hour: displayHour,
      type,
    });
  }

  // 创建时间段，考虑跨日的情况
  Object.entries(p).forEach(([type, [start, end]]) => {
    if (end > start) {
      segments.push({
        type: "full" as PartType,
        mainType: type as HourType,
        startHour: start,
        endHour: end,
      });
    } else {
      // 跨日的情况需要分两段
      segments.push({
        type: "full" as PartType,
        mainType: type as HourType,
        startHour: start,
        endHour: 24,
      });
      segments.push({
        type: "full" as PartType,
        mainType: type as HourType,
        startHour: 0,
        endHour: end,
      });
    }
  });

  return { date, hours, segments };
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<"default" | "light" | "dark">("default");
  const [data] = useState([
    createSampleData("2024-01-10", "normal"),
    createSampleData("2024-01-11", "nightOwl"),
    createSampleData("2024-01-12", "earlyBird"),
  ]);

  const handleHourChange = (event: HourChangeEvent) => {
    console.log("Hour changed:", event);
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

  // 自定义类型示例
  const customTypes = {
    meeting: {
      color: "#F472B6", // 粉色
      label: "会议",
    },
    exercise: {
      color: "#818CF8", // 靛蓝色
      label: "运动",
    },
  };

  // 自定义类型顺序
  const typeOrder = ["sleep", "work", "meeting", "exercise", "base", "relax"];

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
        data={data}
        editable={true}
        onHourChange={handleHourChange}
        theme={getTheme()}
        customTypes={customTypes}
        typeOrder={typeOrder}
        shortcuts={{
          s: "sleep",
          w: "work",
          m: "meeting",
          e: "exercise",
          b: "base",
          r: "relax",
        }}
      />
    </div>
  );
};

export default App;
