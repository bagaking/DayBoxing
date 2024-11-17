import {
  AnalysisResult,
  AnalysisRule,
  AnalysisContext,
  HourData,
  TIME_CONSTANTS,
  AdviceItem,
} from "../../types";

/**
 * Overall analysis rules for DayBoxing time management
 *
 * Categories:
 * 1. Time Distribution - Basic time allocation
 * 2. Pattern Analysis - Activity patterns and transitions
 * 3. Rhythm Analysis - Consistency and regularity
 * 4. Balance Analysis - Work-life balance metrics
 * 5. Pressure Indicators - Stress and workload signals
 */

export const overallRules: AnalysisRule[] = [
  // 1. Day Length Analysis
  {
    id: "day_length",
    type: "overall",
    priority: 100,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const totalHours = ctx.day.hours.length;
      const advices: AdviceItem[] = [];

      if (totalHours > TIME_CONSTANTS.MAX_DAY_HOURS) {
        advices.push({
          type: "warning",
          content: `当前时长超过${TIME_CONSTANTS.MAX_DAY_HOURS}小时，建议及时结束当天行程，避免过度疲劳`,
        });
      }

      if (totalHours > 24) {
        if (totalHours > 26) {
          advices.push({
            type: "warning",
            content: "已接近长日上限，建议尽快结束当天行程",
          });
        } else {
          advices.push({
            type: "suggestion",
            content: `当前为长日模式(${totalHours}h)，建议不超过28小时`,
          });
        }
      }

      if (totalHours < 24) {
        if (totalHours < 21) {
          advices.push({
            type: "warning",
            content: "当前时长不足21小时，可能错过重要活动时间",
          });
        } else {
          advices.push({
            type: "suggestion",
            content: `当前为短日模式(${totalHours}h)，建议不少于21小时`,
          });
        }
      }

      // Add general tips
      advices.push({
        type: "tip",
        content: "保持规律的作息时间有助于提高生活质量和工作效率",
      });

      return {
        status: advices.some((a) => a.type === "warning")
          ? "warning"
          : "success",
        title: advices.some((a) => a.type === "warning")
          ? "日程长度异常"
          : "日程长度正常",
        advices,
      };
    },
  },

  // 2. Sleep Distribution Analysis
  {
    id: "sleep_distribution",
    type: "overall",
    priority: 95,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const sleepHours = ctx.day.hours.filter((h) => h.type === "sleep");
      const totalSleep = sleepHours.length;
      const advices: AdviceItem[] = [];

      // Check total sleep duration
      if (totalSleep < 6) {
        advices.push({
          type: "warning",
          content: "睡眠时间不足，建议保持 6-9 小时以确保充分休息",
        });
      } else if (totalSleep > 9) {
        advices.push({
          type: "warning",
          content: "睡眠时间偏多，建议控制在 9 小时以内以提高时间利用效率",
        });
      }

      // Analyze sleep blocks
      const sleepBlocks = sleepHours.reduce((blocks, hour, index) => {
        if (index === 0 || sleepHours[index - 1].hour !== hour.hour - 1) {
          blocks.push([hour]);
        } else {
          blocks[blocks.length - 1].push(hour);
        }
        return blocks;
      }, [] as HourData[][]);

      // Check fragmentation
      if (sleepBlocks.length > 1) {
        const smallBlocks = sleepBlocks.filter((block) => block.length <= 2);
        if (smallBlocks.length > 0) {
          advices.push({
            type: "suggestion",
            content: "存在碎片化睡眠，建议调整作息保持连续充足的休息时间",
          });
        }
      }

      // Add sleep quality tips
      advices.push({
        type: "tip",
        content: "良好的睡眠质量需要规律的作息和合适的睡眠环境",
      });

      return {
        status: advices.some((a) => a.type === "warning")
          ? "warning"
          : "success",
        title: "睡眠分布分析",
        advices,
      };
    },
  },

  // 3. Work & Improve Balance Analysis
  {
    id: "work_improve_balance",
    type: "overall",
    priority: 90,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const workHours = ctx.day.hours.filter((h) => h.type === "work");
      const improveHours = ctx.day.hours.filter((h) => h.type === "improve");
      const totalWork = workHours.length;
      const totalImprove = improveHours.length;
      const advices: AdviceItem[] = [];

      // 检查工作时间
      if (totalWork < 4) {
        advices.push({
          type: "warning",
          content: `当前工作时间为${totalWork}小时，低于建议的最少工作时间(6小时)。建议增加${
            6 - totalWork
          }小时工作时间，以保证基本工作产出`,
        });
      } else if (totalWork > 10) {
        const excessHours = totalWork - 10;
        advices.push({
          type: "warning",
          content: `当前工作时间为${totalWork}小时，超出建议的最大工作时间(10小时)。建议减少${excessHours}小时工作时间，将多出的时间用于自我提升或休息`,
        });
      }

      // 分析自我提升时间
      if (totalImprove === 0) {
        advices.push({
          type: "suggestion",
          content: `今日无自我提升时间。建议每天至少安排2小时用于自我提升，可以从工作时间(${totalWork}小时)中调配`,
        });
      } else {
        // 检查自我提升时间的分布
        const improveBlocks = improveHours.reduce((blocks, hour, index) => {
          if (index === 0 || improveHours[index - 1].hour !== hour.hour - 1) {
            blocks.push([hour]);
          } else {
            blocks[blocks.length - 1].push(hour);
          }
          return blocks;
        }, [] as HourData[][]);

        if (improveBlocks.length > 3) {
          advices.push({
            type: "suggestion",
            content: `自我提升时间(${totalImprove}小时)分散在${improveBlocks.length}个时间段中。建议将短于1小时的时间段合并，形成2-3个较长的学习时段，以提高学习效率`,
          });
        }

        // 检查单个提升时间块的长度
        const longImproveBlocks = improveBlocks.filter(
          (block) => block.length > 4
        );
        if (longImproveBlocks.length > 0) {
          const blockTimes = longImproveBlocks
            .map(
              (block) =>
                `${block[0].hour}:00-${block[block.length - 1].hour + 1}:00`
            )
            .join("、");

          advices.push({
            type: "warning",
            content: `在${blockTimes}存在超过4小时的连续学习。建议每2小时休息15-20分钟，保持专注度`,
          });
        }
      }

      // 分析工作时间分布
      const workBlocks = workHours.reduce((blocks, hour, index) => {
        if (index === 0 || workHours[index - 1].hour !== hour.hour - 1) {
          blocks.push([hour]);
        } else {
          blocks[blocks.length - 1].push(hour);
        }
        return blocks;
      }, [] as HourData[][]);

      // 分析工作时间的质量
      if (workBlocks.length > 4) {
        const shortBlocks = workBlocks.filter((block) => block.length <= 2);
        if (shortBlocks.length > 0) {
          const blockTimes = shortBlocks
            .map(
              (block) =>
                `${block[0].hour}:00-${block[block.length - 1].hour + 1}:00`
            )
            .join("、");

          advices.push({
            type: "suggestion",
            content: `工作时间过于碎片化，在${blockTimes}存在${shortBlocks.length}个短工作时段。建议合并这些时段，形成较长的工作区块以提高专注度`,
          });
        }
      }

      // 检查工作时间块
      const longWorkBlocks = workBlocks.filter((block) => block.length > 4);
      if (longWorkBlocks.length > 0) {
        const blockTimes = longWorkBlocks
          .map(
            (block) =>
              `${block[0].hour}:00-${block[block.length - 1].hour + 1}:00`
          )
          .join("、");

        advices.push({
          type: "warning",
          content: `在${blockTimes}存在超过4小时的连续工作。建议每90-120分钟休息15分钟，既能保持效率，也符合人体自然能量周期`,
        });
      }

      // 分析时间分配策略
      if (totalWork > 8 && totalImprove === 0) {
        advices.push({
          type: "suggestion",
          content: `当前工作时间(${totalWork}小时)较长但无自我提升时间。建议从工作时间中调配2-3小时用于个人成长，既能缓解工作压力，也能促进长期发展`,
        });
      }

      // 计算提升时间占比
      const improveRatio = totalImprove / (totalWork + totalImprove);
      if (improveRatio < 0.2 && totalWork > 6) {
        const suggestedImprove = Math.ceil((totalWork + totalImprove) * 0.2);
        advices.push({
          type: "suggestion",
          content: `自我提升时间占比(${Math.round(
            improveRatio * 100
          )}%)较低。建议将自我提升时间从${totalImprove}小时增加到${suggestedImprove}小时，在完成必要工作的基础上，加强个人成长`,
        });
      }

      // 不再对总时间设限制，而是关注效率
      if (totalWork + totalImprove > 14) {
        const excessHours = totalWork + totalImprove - 14;
        advices.push({
          type: "warning",
          content: `高强度工作和学习时间共计${
            totalWork + totalImprove
          }小时，超出建议的每日总量(14小时)。建议减少${excessHours}小时，并增加休息时间，以维持长期可持续性`,
        });
      }

      if (totalImprove / totalWork < 0.2) {
        // 添加平衡建议
        advices.push({
          type: "tip",
          content: `自我提升与工作的最少配比是1:4。当前配比为${totalImprove}:${totalWork}，可以通过调整时间分配来优化`,
        });
      }

      return {
        status: advices.some((a) => a.type === "warning")
          ? "warning"
          : "success",
        title: "工作与自我提升分析",
        advices,
      };
    },
  },

  // 4. Life-Work Balance Analysis
  {
    id: "life_work_balance",
    type: "overall",
    priority: 85,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const workHours = ctx.day.hours.filter((h) => h.type === "work").length;
      const lifeHours = ctx.day.hours.filter((h) => h.type === "life").length;
      const relaxHours = ctx.day.hours.filter((h) => h.type === "relax").length;
      const totalHours = ctx.day.hours.length;
      const advices: AdviceItem[] = [];

      // 检查生活时间比例
      const lifeRatio = (lifeHours + relaxHours) / totalHours;
      if (lifeRatio < 0.2) {
        advices.push({
          type: "warning",
          content: `生活时间比例仅为${Math.round(lifeRatio * 100)}%(${
            lifeHours + relaxHours
          }小时)，低于建议的20%(${Math.ceil(totalHours * 0.2)}小时)。建议增加${
            Math.ceil(totalHours * 0.2) - (lifeHours + relaxHours)
          }小时生活和休闲活动`,
        });
      }

      // 检查工作和生活的分布
      if (workHours > 0 && lifeHours === 0) {
        advices.push({
          type: "warning",
          content: `当天${workHours}小时工作时间中未安排生活时间。建议每4小时工作插入至少30分钟生活时间，既能提高工作效率，也能保持生活质量`,
        });
      }

      // 检查休闲时间
      if (workHours > 8 && relaxHours === 0) {
        advices.push({
          type: "suggestion",
          content: `工作时间达到${workHours}小时，但未安排休闲时间。建议在工作结束后安排1-2小时的休闲活动，帮助身心恢复`,
        });
      }

      // 检查生活时间分布
      const lifeBlocks = ctx.day.hours.reduce((blocks, hour, index, hours) => {
        if (hour.type === "life") {
          if (index === 0 || hours[index - 1].type !== "life") {
            blocks.push([hour]);
          } else {
            blocks[blocks.length - 1].push(hour);
          }
        }
        return blocks;
      }, [] as HourData[][]);

      if (lifeBlocks.length > 0) {
        const shortBlocks = lifeBlocks.filter((block) => block.length < 1);
        if (shortBlocks.length > 2) {
          const times = shortBlocks
            .map(
              (block) =>
                `${block[0].hour}:00-${block[block.length - 1].hour + 1}:00`
            )
            .join("、");

          advices.push({
            type: "suggestion",
            content: `在${times}存在${shortBlocks.length}个短于1小时的生活时间段。建议合并相近的时间段，形成较完整的生活节奏`,
          });
        }
      }

      // 添加平衡建议
      const idealLifeHours = Math.round(totalHours * 0.25);
      if (lifeHours > 0 && Math.abs(lifeHours - idealLifeHours) <= 2) {
        advices.push({
          type: "tip",
          content: `当前生活时间分配合理(${lifeHours}小时)，接近理想值${idealLifeHours}小时。保持这种平衡有助于提高生活质量`,
        });
      } else {
        advices.push({
          type: "tip",
          content: `生活时间的理想分配是总时间的25%(约${idealLifeHours}小时)。可以通过调整工作强度和效率来达到这个目标`,
        });
      }

      return {
        status: advices.some((a) => a.type === "warning")
          ? "warning"
          : "success",
        title: "工作生活平衡分析",
        advices,
      };
    },
  },

  // 5. Pressure Indicator Analysis
  {
    id: "pressure_indicators",
    type: "overall",
    priority: 80,
    condition: (ctx: AnalysisContext) => true,
    analyze: (ctx: AnalysisContext): AnalysisResult => {
      const advices: AdviceItem[] = [];
      const hours = ctx.day.hours;

      // 检查深夜工作
      const lateNightWork = hours.filter(
        (h) => h.type === "work" && h.hour >= 22
      );
      if (lateNightWork.length > 0) {
        const timeRanges = lateNightWork.reduce((ranges, hour) => {
          const lastRange = ranges[ranges.length - 1];
          if (
            lastRange &&
            lastRange[lastRange.length - 1].hour === hour.hour - 1
          ) {
            lastRange.push(hour);
          } else {
            ranges.push([hour]);
          }
          return ranges;
        }, [] as HourData[][]);

        timeRanges.forEach((range) => {
          advices.push({
            type: "warning",
            content: `在${range[0].hour}:00-${
              range[range.length - 1].hour + 1
            }:00存在深夜工作。建议调整到9:00-18:00的高效工作时段，深夜时段建议用于休息或自我提升`,
          });
        });
      }

      // 检查连续工作时段
      let continuousWork = 0;
      let workStartHour = -1;
      hours.forEach((hour, index) => {
        if (hour.type === "work") {
          if (continuousWork === 0) workStartHour = hour.hour;
          continuousWork++;
          if (continuousWork > 4) {
            advices.push({
              type: "warning",
              content: `在${workStartHour}:00-${
                hour.hour + 1
              }:00存在${continuousWork}小时连续工作。建议在${
                workStartHour + 2
              }:00和${workStartHour + 4}:00各安排15-20分钟休息，保持工作效率`,
            });
          }
        } else {
          continuousWork = 0;
        }
      });

      // 检查工作密度
      const workHours = hours.filter((h) => h.type === "work").length;
      const dayLength = hours.length;
      const workDensity = workHours / dayLength;

      if (workDensity > 0.6) {
        advices.push({
          type: "warning",
          content: `工作时间占比${Math.round(
            workDensity * 100
          )}%(${workHours}/${dayLength}小时)过高。建议通过提高工作效率来减少工作时间，为生活和休息留出更多空间`,
        });
      }

      // 检查休息间隔
      const restGaps = hours.reduce((gaps, hour, index, arr) => {
        if (
          hour.type === "work" &&
          index > 0 &&
          arr[index - 1].type === "work"
        ) {
          gaps.push(index);
        }
        return gaps;
      }, [] as number[]);

      if (restGaps.length > 3) {
        const suggestedBreaks = restGaps
          .filter((_, i) => i % 3 === 1)
          .map((i) => `${hours[i].hour}:00`)
          .join("、");

        advices.push({
          type: "suggestion",
          content: `工作间隔较少，建议在${suggestedBreaks}等时间点增加15-20分钟的休息，既能恢复精力，也能提高后续工作效率`,
        });
      }

      // 添加压力管理建议
      if (advices.some((a) => a.type === "warning")) {
        advices.push({
          type: "tip",
          content:
            "高强度工作可能影响长期表现。建议：1)建立规律作息 2)保持适度运动 3)定期压力评估",
        });
      } else {
        advices.push({
          type: "tip",
          content:
            "当前工作压力在可控范围。建议继续保持规律作息，做好工作计划，让高效工作成为习惯",
        });
      }

      return {
        status: advices.some((a) => a.type === "warning")
          ? "warning"
          : "success",
        title: "压力指标分析",
        advices,
      };
    },
  },
];
