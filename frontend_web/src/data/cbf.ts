export const CBF_STORAGE_KEY = "scalyn.cbf.progress";

export const CBF_INSTRUCTION =
  "以下是一些描述个体性格特点的句子，请根据每个句子与你的性格相符程度在相应的数字上画“○”。例如：“在集体活动中，我是个活跃分子”是对你非常恰当的描述，那么请你在“6—完全符合”上画“○”，依此类推。每个人的性格各不相同，所以答案没有对错之分，请根据你的实际情况作答。其中，1=完全不符合；2=大部分不符合；3=有点不符合；4=有点符合；5=大部分符合；6=完全符合。";

export type CbfDimension = "N" | "C" | "A" | "O" | "E";

export interface CbfLikertOption {
  value: number;
  label: string;
}

export const CBF_LIKERT_OPTIONS: CbfLikertOption[] = [
  { value: 1, label: "完全不符合" },
  { value: 2, label: "大部分不符合" },
  { value: 3, label: "有点不符合" },
  { value: 4, label: "有点符合" },
  { value: 5, label: "大部分符合" },
  { value: 6, label: "完全符合" },
];

export const CBF_DIMENSION_LABEL: Record<CbfDimension, string> = {
  N: "神经质（N）",
  C: "尽责性（C）",
  A: "宜人性（A）",
  O: "开放性（O）",
  E: "外向性（E）",
};

export interface CbfQuestion {
  id: string;
  order: number;
  text: string;
  dimension: CbfDimension;
  reverse: boolean;
}

const questionTexts: Array<{ text: string; reverse?: boolean }> = [
  { text: "我常常感到害怕" },
  { text: "一旦确定了目标，我会坚持努力地实现它" },
  { text: "我觉得大部分人基本上是心怀善意的" },
  { text: "我头脑中经常充满生动的画面" },
  { text: "我对人多的聚会感到乏味", reverse: true },
  { text: "有时我觉得自己一无是处" },
  { text: "我常常是仔细考虑之后才做出决定" },
  { text: "我不太关心别人是否受到不公正的待遇", reverse: true },
  { text: "我是个勇于冒险、突破常规的人" },
  { text: "在热闹的聚会上，我常常表现主动并尽情玩耍" },
  { text: "别人一句漫不经心的话，我常常会联系在自己身上" },
  { text: "别人认为我是个慎重的人" },
  { text: "我时常觉得别人的痛苦与我无关", reverse: true },
  { text: "我喜欢冒险" },
  { text: "我尽量避免参加人多的聚会和处于嘈杂的环境", reverse: true },
  { text: "在面对压力时，我有种快要崩溃的感觉" },
  { text: "我喜欢一开头就把事情计划好" },
  { text: "我是那种只照顾好自己，不替别人担忧的人", reverse: true },
  { text: "我对许多事情有着很强的好奇心" },
  { text: "有我在的场合一般不会冷场" },
  { text: "我常常担忧一些无关紧要的事情" },
  { text: "我对待工作或学习很勤奋" },
  { text: "虽然社会上有一些骗子，但我觉得大部分人还是可信的" },
  { text: "我身上拥有别人没有的冒险精神" },
  { text: "在一个团体中，我希望处于领导地位" },
  { text: "我常常感到内心不踏实" },
  { text: "我是一个倾尽全力做事的人" },
  { text: "当别人向我诉说不幸时，我常常感到难过" },
  { text: "我渴望学习一些新东西，即使它们与我的日常生活无关" },
  { text: "别人大多认为我是一个热情和友好的人" },
  { text: "我常常担心会有什么不好的事情发生" },
  { text: "在工作上，我时常只求能应付过去便可", reverse: true },
  {
    text: "尽管人类社会存在着一些阴暗面（如战争、罪恶、欺诈），但我仍然相信人性是善良的",
  },
  { text: "我的想象力相当丰富" },
  { text: "我喜欢参加社交与娱乐聚会" },
  { text: "我很少感到忧郁或沮丧", reverse: true },
  { text: "做事讲究逻辑和条理是我的一个特点" },
  { text: "我时常为那些遭遇不幸的人感到难过" },
  { text: "我很愿意也很容易接受那些新事物、新观点、新想法" },
  { text: "我希望成为领导者而不是被领导者" },
];

const dimensionByOrder: CbfDimension[] = [
  "N",
  "C",
  "A",
  "O",
  "E",
  "N",
  "C",
  "A",
  "O",
  "E",
  "N",
  "C",
  "A",
  "O",
  "E",
  "N",
  "C",
  "A",
  "O",
  "E",
  "N",
  "C",
  "A",
  "O",
  "E",
  "N",
  "C",
  "A",
  "O",
  "E",
  "N",
  "C",
  "A",
  "O",
  "E",
  "N",
  "C",
  "A",
  "O",
  "E",
];

export const CBF_QUESTIONS: CbfQuestion[] = questionTexts.map((item, index) => ({
  id: `cbf-${index + 1}`,
  order: index + 1,
  text: item.text,
  dimension: dimensionByOrder[index],
  reverse: Boolean(item.reverse),
}));

export type CbfAnswer = number | null;

export interface CbfProgress {
  answers: CbfAnswer[];
  currentIndex: number;
  updatedAt: string;
  completed: boolean;
}

export interface CbfDimensionScore {
  key: CbfDimension;
  label: string;
  score: number;
  itemCount: number;
}

export interface CbfScoreSummary {
  dimensions: CbfDimensionScore[];
  total: number;
}

export function createEmptyCbfProgress(): CbfProgress {
  return {
    answers: Array.from({ length: CBF_QUESTIONS.length }, () => null),
    currentIndex: 0,
    updatedAt: new Date().toISOString(),
    completed: false,
  };
}

export function reverseCbfScore(value: number): number {
  return 7 - value;
}

export function scoredCbfValue(question: CbfQuestion, raw: number): number {
  return question.reverse ? reverseCbfScore(raw) : raw;
}

export function summarizeCbfScores(answers: CbfAnswer[]): CbfScoreSummary | null {
  if (answers.some((value) => value == null)) {
    return null;
  }

  const totals: Record<CbfDimension, number> = {
    N: 0,
    C: 0,
    A: 0,
    O: 0,
    E: 0,
  };

  answers.forEach((raw, index) => {
    const question = CBF_QUESTIONS[index];
    totals[question.dimension] += scoredCbfValue(question, raw as number);
  });

  const dimensions: CbfDimensionScore[] = (Object.keys(totals) as CbfDimension[]).map(
    (key) => ({
      key,
      label: CBF_DIMENSION_LABEL[key],
      score: totals[key],
      itemCount: 8,
    }),
  );

  return {
    dimensions,
    total: dimensions.reduce((sum, item) => sum + item.score, 0),
  };
}

export function countAnsweredCbf(answers: CbfAnswer[]): number {
  return answers.filter((value) => value != null).length;
}
