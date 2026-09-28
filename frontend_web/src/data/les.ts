export const LES_STORAGE_KEY = "scalyn.les.progress";

export const LES_INSTRUCTION = `下边是每一个人都有可能碰到的一些平时生活事件，终究是好事还是坏事，可根据个人情况自行判断。这些事件可能对个人有精神上的影响（体验为紧张、压力、喜悦或烦恼等），影响的轻重程度是各不相同的。影响持续的时间也不相同。请你根据自己的情况，实事求是地回答下列问题。填表不记姓名，完全保密，请在最合适的答案上打钩。`;

export type LesCategory = "family" | "work" | "social" | "custom";

export type LesOccurrence = "none" | "over_year" | "within_year" | "chronic";
export type LesNature = "good" | "bad";
export type LesImpact = 0 | 1 | 2 | 3 | 4;
export type LesDuration = 1 | 2 | 3 | 4;

export interface LesOption<T extends string | number> {
  value: T;
  label: string;
}

export const LES_OCCURRENCE_OPTIONS: LesOption<LesOccurrence>[] = [
  { value: "none", label: "未发生" },
  { value: "over_year", label: "一年前" },
  { value: "within_year", label: "一年内" },
  { value: "chronic", label: "长期性" },
];

export const LES_NATURE_OPTIONS: LesOption<LesNature>[] = [
  { value: "good", label: "好事" },
  { value: "bad", label: "坏事" },
];

export const LES_IMPACT_OPTIONS: LesOption<LesImpact>[] = [
  { value: 0, label: "无影响" },
  { value: 1, label: "轻度" },
  { value: 2, label: "中度" },
  { value: 3, label: "重度" },
  { value: 4, label: "极重" },
];

export const LES_DURATION_OPTIONS: LesOption<LesDuration>[] = [
  { value: 1, label: "三月内" },
  { value: 2, label: "半年内" },
  { value: 3, label: "一年内" },
  { value: 4, label: "一年以上" },
];

export interface LesQuestion {
  id: string;
  order: number;
  text: string;
  category: LesCategory;
  custom?: boolean;
}

const familyTexts = [
  "恋爱或订婚",
  "恋爱失败、破裂",
  "结婚",
  "自己（爱人）怀孕",
  "自己（爱人）流产",
  "家庭增添新成员",
  "与爱人父母不和",
  "夫妻感情不好",
  "夫妻分居（因不和）",
  "夫妻两地分居（工作需要）",
  "性生活不满意或独身",
  "配偶一方有外遇",
  "夫妻重归于好",
  "超指标生育",
  "本人（爱人）作绝育手术",
  "配偶死亡",
  "离婚",
  "子女升学（就业）失败",
  "子女管教困难",
  "子女长期离家",
  "家长与学校老师冲突",
  "家庭经济困难",
  "欠债500元以上",
  "经济情况显著改善",
  "家庭成员重病、重伤",
  "家庭成员死亡",
  "本人重病或重伤",
  "住房紧张",
];

const workTexts = [
  "待业、无业",
  "开始就业",
  "高考失败",
  "扣发奖金或罚款",
  "突出的个人成就",
  "晋升、提级",
  "对现职工作不满意",
  "工作学习中压力大（如成绩不好）",
  "与上级关系紧张",
  "与同事邻居不和",
  "第一次远走他乡异国",
  "生活规律重大变动（饮食睡眠规律改变）",
  "本人退休离休或未安排具体工作",
];

const socialTexts = [
  "好友重病或重伤",
  "好友死亡",
  "被人误会、错怪、诬告、议论",
  "介入民事法律纠纷",
  "被拘留、受审",
  "失窃、财产损失",
  "意外惊吓、发生事故、自然灾害",
];

function buildQuestions(
  texts: string[],
  category: LesCategory,
  startOrder: number,
): LesQuestion[] {
  return texts.map((text, index) => ({
    id: `les-${startOrder + index}`,
    order: startOrder + index,
    text,
    category,
  }));
}

export const LES_QUESTIONS: LesQuestion[] = [
  ...buildQuestions(familyTexts, "family", 1),
  ...buildQuestions(workTexts, "work", 29),
  ...buildQuestions(socialTexts, "social", 42),
  {
    id: "les-49",
    order: 49,
    text: "其他重要生活事件（一）",
    category: "custom",
    custom: true,
  },
  {
    id: "les-50",
    order: 50,
    text: "其他重要生活事件（二）",
    category: "custom",
    custom: true,
  },
];

export const LES_CATEGORY_LABEL: Record<LesCategory, string> = {
  family: "家庭有关问题",
  work: "工作学习中的问题",
  social: "社交与其他问题",
  custom: "补充事件",
};

export interface LesAnswer {
  occurrence: LesOccurrence | null;
  nature: LesNature | null;
  impact: LesImpact | null;
  duration: LesDuration | null;
  frequency: number;
  customName: string;
}

export interface LesProgress {
  answers: Array<LesAnswer | null>;
  currentIndex: number;
  updatedAt: string;
  completed: boolean;
}

export interface LesScoreSummary {
  total: number;
  positive: number;
  negative: number;
  family: number;
  work: number;
  social: number;
  custom: number;
  bandLabel: string;
  bandDetail: string;
}

export function createEmptyLesAnswer(): LesAnswer {
  return {
    occurrence: null,
    nature: null,
    impact: null,
    duration: null,
    frequency: 1,
    customName: "",
  };
}

export function createEmptyLesProgress(): LesProgress {
  return {
    answers: Array.from({ length: LES_QUESTIONS.length }, () => null),
    currentIndex: 0,
    updatedAt: new Date().toISOString(),
    completed: false,
  };
}

export function isLesAnswerComplete(
  answer: LesAnswer | null,
  question: LesQuestion,
): boolean {
  if (!answer) {
    return false;
  }
  if (question.custom && !answer.customName.trim()) {
    return false;
  }
  return (
    answer.occurrence != null &&
    answer.nature != null &&
    answer.impact != null &&
    answer.duration != null &&
    answer.frequency >= 1
  );
}

export function calcEventStimulus(answer: LesAnswer | null): number {
  if (!answer || answer.occurrence == null || answer.occurrence === "none") {
    return 0;
  }
  if (answer.impact == null || answer.duration == null) {
    return 0;
  }
  return answer.impact * answer.duration * Math.max(1, answer.frequency);
}

export function summarizeLesScores(answers: Array<LesAnswer | null>): LesScoreSummary {
  let positive = 0;
  let negative = 0;
  let family = 0;
  let work = 0;
  let social = 0;
  let custom = 0;

  answers.forEach((answer, index) => {
    const stimulus = calcEventStimulus(answer);
    if (!answer || answer.occurrence === "none" || stimulus === 0) {
      return;
    }
    if (answer.nature === "good") {
      positive += stimulus;
    } else if (answer.nature === "bad") {
      negative += stimulus;
    }
    const category = LES_QUESTIONS[index]?.category;
    if (category === "family") family += stimulus;
    if (category === "work") work += stimulus;
    if (category === "social") social += stimulus;
    if (category === "custom") custom += stimulus;
  });

  const total = positive + negative;
  const { bandLabel, bandDetail } = interpretLesTotal(total);

  return {
    total,
    positive,
    negative,
    family,
    work,
    social,
    custom,
    bandLabel,
    bandDetail,
  };
}

export function interpretLesTotal(total: number): { bandLabel: string; bandDetail: string } {
  if (total < 20) {
    return {
      bandLabel: "低应激",
      bandDetail: "生活相对平稳，心理压力处于正常且轻松的范围内。",
    };
  }
  if (total <= 32) {
    return {
      bandLabel: "中度应激",
      bandDetail: "近一年经历了不小的生活变故，存在一定的心理压力，但大多数人能够自行调节。",
    };
  }
  return {
    bandLabel: "高应激 / 疾病预警线",
    bandDetail:
      "承受了重大的生活事件冲击。当负性事件得分超过 32 分时，个体出现心理危机、情绪崩溃或患躯体疾病的概率显著上升，需要重点关注并进行压力疏导。",
  };
}

export function countAnsweredLes(answers: Array<LesAnswer | null>): number {
  return answers.reduce((count, answer, index) => {
    return count + (isLesAnswerComplete(answer, LES_QUESTIONS[index]) ? 1 : 0);
  }, 0);
}
