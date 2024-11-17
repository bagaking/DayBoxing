import {
  DayPattern,
  TimeBlock,
  HourType,
  PatternEditEvent,
  BaseHourType,
} from "../types";

export const editPattern = (
  pattern: DayPattern,
  type: PatternEditEvent["type"],
  payload: PatternEditEvent["payload"]
): DayPattern => {
  switch (type) {
    case "moveStart":
      return {
        ...pattern,
        startHour: payload.startHour ?? pattern.startHour,
      };
    case "addBlock":
      if (!payload.block || payload.blockIndex === undefined) return pattern;
      return {
        ...pattern,
        blocks: [
          ...pattern.blocks.slice(0, payload.blockIndex),
          payload.block,
          ...pattern.blocks.slice(payload.blockIndex),
        ],
      };
    case "removeBlock":
      if (payload.blockIndex === undefined) return pattern;
      return {
        ...pattern,
        blocks: pattern.blocks.filter((_, i) => i !== payload.blockIndex),
      };
    case "updateBlock":
      if (!payload.block || payload.blockIndex === undefined) return pattern;
      return {
        ...pattern,
        blocks: pattern.blocks.map((block, i) =>
          i === payload.blockIndex && payload.block ? payload.block : block
        ) as TimeBlock[],
      };
    default:
      return pattern;
  }
};

export const createHoursFromPattern = (pattern: DayPattern) => {
  const hours = [];
  let currentHour = pattern.startHour;

  for (const block of pattern.blocks) {
    if (typeof block === "string") {
      const hourType = block as HourType;
      hours.push({
        hour: currentHour,
        type: hourType,
      });
      currentHour++;
      continue;
    }

    const timeBlock = block as TimeBlock;
    for (let i = 0; i < timeBlock.duration; i++) {
      hours.push({
        hour: currentHour,
        type: timeBlock.type,
        comment: timeBlock.comment,
      });
      currentHour++;
    }
  }

  return hours;
};

export const createCommonPattern = (
  type: "work" | "improve" | "balanced"
): DayPattern => {
  const createBlock = (type: BaseHourType, duration: number) => ({
    type,
    duration,
  });

  switch (type) {
    case "work":
      return {
        startHour: 0,
        blocks: [
          createBlock("sleep", 9),
          createBlock("life", 1),
          createBlock("work", 2),
          createBlock("life", 2),
          createBlock("work", 4),
          createBlock("life", 1),
          createBlock("work", 2),
          createBlock("life", 1),
          createBlock("relax", 2),
        ],
      };
    case "improve":
      return {
        startHour: 0,
        blocks: [
          createBlock("sleep", 7),
          createBlock("life", 1),
          createBlock("improve", 2),
          createBlock("work", 2),
          createBlock("life", 2),
          createBlock("improve", 2),
          createBlock("work", 2),
          createBlock("life", 3),
          createBlock("relax", 3),
        ],
      };
    case "balanced":
      return {
        startHour: 1,
        blocks: [
          { type: "sleep", duration: 7 },
          { type: "life", duration: 1 },
          "improve",
          { type: "work", duration: 2 },
          { type: "life", duration: 2 },
          { type: "work", duration: 4 },
          { type: "life", duration: 2 },
          { type: "work", duration: 2 },
          "life",
          "improve",
          "relax",
        ],
      };
    default:
      return {
        startHour: 0,
        blocks: [],
      };
  }
};
