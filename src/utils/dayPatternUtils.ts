import { DayPattern, TimeBlock, HourType, PatternEditEvent } from "../types";

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
      hours.push({
        hour: currentHour,
        type: block as HourType,
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
