import { DayPattern, TimeBlock, PatternEditEvent } from "../types";

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
          i === payload.blockIndex ? payload.block : block
        ),
      };
    default:
      return pattern;
  }
};

export const createHoursFromPattern = (pattern: DayPattern) => {
  const hours = [];
  let currentHour = pattern.startHour;

  for (const block of pattern.blocks) {
    for (let i = 0; i < block.duration; i++) {
      hours.push({
        hour: currentHour,
        type: block.type,
      });
      currentHour++;
    }
  }

  return hours;
};
