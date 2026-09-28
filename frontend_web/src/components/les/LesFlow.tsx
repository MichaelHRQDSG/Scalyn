import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  LES_CATEGORY_LABEL,
  LES_DURATION_OPTIONS,
  LES_IMPACT_OPTIONS,
  LES_INSTRUCTION,
  LES_NATURE_OPTIONS,
  LES_OCCURRENCE_OPTIONS,
  LES_QUESTIONS,
  countAnsweredLes,
  createEmptyLesAnswer,
  createEmptyLesProgress,
  isLesAnswerComplete,
  summarizeLesScores,
  type LesAnswer,
  type LesDuration,
  type LesImpact,
  type LesNature,
  type LesOccurrence,
  type LesProgress,
} from "../../data/les";
import {
  clearLesProgress,
  hasIncompleteLesProgress,
  loadLesProgress,
  saveLesProgress,
  startFreshLesProgress,
} from "../../lib/lesProgress";
import { saveLesResultFile } from "../../lib/saveLesResult";
import { Atmosphere } from "../Atmosphere";

type LesStep = "intro" | "quiz" | "result";

interface LesFlowProps {
  onBackHome: () => void;
}

export function LesFlow({ onBackHome }: LesFlowProps) {
  const saved = useMemo(() => loadLesProgress(), []);
  const [step, setStep] = useState<LesStep>(saved?.completed ? "result" : "intro");
  const [progress, setProgress] = useState<LesProgress>(
    () => saved ?? createEmptyLesProgress(),
  );
  const [draft, setDraft] = useState<LesAnswer>(() => {
    const current = saved?.answers[saved.currentIndex];
    return current ? { ...current } : createEmptyLesAnswer();
  });
  const [direction, setDirection] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const [resultFile, setResultFile] = useState<string | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const hasResume = hasIncompleteLesProgress();

  const currentQuestion = LES_QUESTIONS[progress.currentIndex];
  const answeredCount = countAnsweredLes(progress.answers);
  const scores = summarizeLesScores(progress.answers);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current != null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2200);
  };

  const clearAdvanceTimer = () => {
    if (advanceTimerRef.current != null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  };

  const persist = (next: LesProgress) => {
    setProgress(next);
    saveLesProgress(next);
  };

  const loadDraftAt = (index: number, source: LesProgress) => {
    const existing = source.answers[index];
    setDraft(existing ? { ...existing } : createEmptyLesAnswer());
  };

  const persistResultFile = async (answers: Array<LesAnswer | null>) => {
    try {
      const savedFile = await saveLesResultFile(answers);
      if (savedFile.ok && savedFile.file) {
        setResultFile(savedFile.file);
        showNotice(`结果已写入 ${savedFile.file}`);
        return;
      }
      setResultFile(null);
      showNotice(savedFile.error ?? "结果文件保存失败");
    } catch {
      setResultFile(null);
      showNotice("结果文件保存失败，请确认已通过 npm run dev 启动");
    }
  };

  const beginQuiz = (resume: boolean) => {
    clearAdvanceTimer();
    if (resume) {
      const current = loadLesProgress();
      if (current && !current.completed) {
        setProgress(current);
        loadDraftAt(current.currentIndex, current);
        setResultFile(null);
        setStep("quiz");
        return;
      }
    }
    const fresh = startFreshLesProgress();
    setProgress(fresh);
    setDraft(createEmptyLesAnswer());
    setResultFile(null);
    setDirection(1);
    setStep("quiz");
  };

  const commitWithAnswer = (answer: LesAnswer, offset: 1 | -1) => {
    clearAdvanceTimer();

    if (offset === 1 && !isLesAnswerComplete(answer, currentQuestion)) {
      return;
    }

    const answers = [...progress.answers];
    if (offset === 1 || answer.occurrence != null) {
      answers[progress.currentIndex] = { ...answer };
    }

    if (offset === 1 && progress.currentIndex >= LES_QUESTIONS.length - 1) {
      const next: LesProgress = {
        ...progress,
        answers,
        completed: true,
        currentIndex: progress.currentIndex,
      };
      persist(next);
      void persistResultFile(answers);
      window.setTimeout(() => setStep("result"), 280);
      return;
    }

    const nextIndex = progress.currentIndex + offset;
    if (nextIndex < 0 || nextIndex >= LES_QUESTIONS.length) {
      return;
    }

    const next: LesProgress = {
      ...progress,
      answers,
      currentIndex: nextIndex,
      completed: false,
    };
    setDirection(offset);
    persist(next);
    loadDraftAt(nextIndex, next);
  };

  const scheduleAdvance = (answer: LesAnswer) => {
    if (!isLesAnswerComplete(answer, currentQuestion)) {
      return;
    }
    clearAdvanceTimer();
    const delay = answer.occurrence === "none" ? 280 : 450;
    advanceTimerRef.current = window.setTimeout(() => {
      commitWithAnswer(answer, 1);
    }, delay);
  };

  const applyDraft = (next: LesAnswer) => {
    setDraft(next);
    scheduleAdvance(next);
  };

  const goPrev = () => {
    if (progress.currentIndex <= 0) {
      return;
    }
    commitWithAnswer(draft, -1);
  };

  const saveAndLeave = () => {
    clearAdvanceTimer();
    const answers = [...progress.answers];
    if (draft.occurrence != null) {
      answers[progress.currentIndex] = { ...draft };
    }
    persist({ ...progress, answers, completed: false });
    showNotice("进度已保存，可稍后继续");
  };

  const restart = () => {
    clearAdvanceTimer();
    clearLesProgress();
    const fresh = startFreshLesProgress();
    setProgress(fresh);
    setDraft(createEmptyLesAnswer());
    setResultFile(null);
    setDirection(1);
    setStep("intro");
  };

  const setOccurrence = (value: LesOccurrence) => {
    applyDraft(
      withAutoFrequency({
        ...draft,
        occurrence: value,
      }),
    );
  };

  const withAutoFrequency = (answer: LesAnswer): LesAnswer => {
    if (answer.occurrence === "chronic" && answer.duration != null) {
      return {
        ...answer,
        frequency: answer.duration <= 2 ? 1 : 2,
      };
    }
    return {
      ...answer,
      frequency: Math.max(1, answer.frequency || 1),
    };
  };

  return (
    <main className="page">
      <Atmosphere />
      <div className="shell shell--narrow">
        <AnimatePresence mode="wait" custom={direction}>
          {step === "intro" ? (
            <motion.section
              key="intro"
              className="flow-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <button type="button" className="text-btn" onClick={onBackHome}>
                ← 返回量表入口
              </button>
              <p className="flow-kicker">LES · 生活事件量表</p>
              <h1 className="flow-title">作答前请先阅读指导语</h1>
              <p className="flow-copy">{LES_INSTRUCTION}</p>
              <ul className="flow-meta">
                <li>共 48 项常见生活事件，另有 2 项可自行补充</li>
                <li>每题需回答：发生时间、性质、精神影响程度、影响持续时间</li>
                <li>每题四个维度都必须全部选完后才会进入下一题</li>
                <li>本题答完后自动进入下一题，可返回修改，也可随时保存进度</li>
              </ul>
              <div className="flow-actions">
                <button type="button" className="primary-btn" onClick={() => beginQuiz(false)}>
                  进入答题
                </button>
                {hasResume ? (
                  <button type="button" className="ghost-btn" onClick={() => beginQuiz(true)}>
                    继续未完成进度
                  </button>
                ) : null}
              </div>
            </motion.section>
          ) : null}

          {step === "quiz" && currentQuestion ? (
            <motion.section
              key={`quiz-${currentQuestion.id}`}
              className="flow-card flow-card--quiz"
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 36 : -36 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -28 : 28 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="quiz-top">
                <button type="button" className="text-btn" onClick={onBackHome}>
                  ← 返回入口
                </button>
                <button
                  type="button"
                  className="ghost-btn ghost-btn--compact"
                  onClick={saveAndLeave}
                  disabled={answeredCount === 0 && draft.occurrence == null}
                >
                  保存进度
                </button>
              </div>

              <div className="progress-row" aria-label="答题进度">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${((progress.currentIndex + 1) / LES_QUESTIONS.length) * 100}%`,
                    }}
                  />
                </div>
                <span className="progress-label">
                  {progress.currentIndex + 1} / {LES_QUESTIONS.length}
                </span>
              </div>

              <p className="flow-kicker">
                {LES_CATEGORY_LABEL[currentQuestion.category]} · 第 {currentQuestion.order} 题
              </p>
              <h2 className="question-text">{currentQuestion.text}</h2>

              {currentQuestion.custom ? (
                <label className="field-block">
                  <span className="field-label">请填写事件名称</span>
                  <input
                    className="text-input"
                    value={draft.customName}
                    placeholder="例如：房屋拆迁"
                    onChange={(event) =>
                      applyDraft({ ...draft, customName: event.target.value })
                    }
                  />
                </label>
              ) : null}

              <fieldset className="subq">
                <legend className="subq__legend">事件发生时间</legend>
                <div className="chip-row">
                  {LES_OCCURRENCE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`chip${draft.occurrence === option.value ? " is-selected" : ""}`}
                      onClick={() => setOccurrence(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="subq">
                <legend className="subq__legend">性质</legend>
                <div className="chip-row">
                  {LES_NATURE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`chip${draft.nature === option.value ? " is-selected" : ""}`}
                      onClick={() =>
                        applyDraft(
                          withAutoFrequency({
                            ...draft,
                            nature: option.value as LesNature,
                          }),
                        )
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="subq">
                <legend className="subq__legend">精神影响程度</legend>
                <div className="chip-row">
                  {LES_IMPACT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`chip${draft.impact === option.value ? " is-selected" : ""}`}
                      onClick={() =>
                        applyDraft(
                          withAutoFrequency({
                            ...draft,
                            impact: option.value as LesImpact,
                          }),
                        )
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="subq">
                <legend className="subq__legend">影响持续时间</legend>
                <div className="chip-row">
                  {LES_DURATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`chip${draft.duration === option.value ? " is-selected" : ""}`}
                      onClick={() =>
                        applyDraft(
                          withAutoFrequency({
                            ...draft,
                            duration: option.value as LesDuration,
                          }),
                        )
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <p className="field-hint">
                请分别选择：事件发生时间、性质、精神影响程度、影响持续时间。四个维度全部选完后才会自动跳转。
              </p>

              <div className="quiz-nav">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={goPrev}
                  disabled={progress.currentIndex === 0}
                >
                  上一题
                </button>
                <span className="quiz-hint">四个维度选完后将自动进入下一题</span>
              </div>
            </motion.section>
          ) : null}

          {step === "result" ? (
            <motion.section
              key="result"
              className="flow-card result-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <button type="button" className="text-btn" onClick={onBackHome}>
                ← 返回量表入口
              </button>
              <p className="flow-kicker">生活事件量表（LES）</p>
              <h1 className="flow-title">测评结果</h1>

              <section className="result-block">
                <h2 className="result-heading">得分结果：</h2>
                <p className="result-line">
                  生活事件总刺激量得分：
                  <strong>{scores.total}</strong>
                </p>
              </section>

              <section className="result-block">
                <h2 className="result-heading">结果说明：</h2>
                <p className="result-line">
                  正性事件刺激量得分：{scores.positive}，负性事件刺激量得分：{scores.negative}
                </p>
                <p className="flow-copy">
                  LES 总分越高，反映个体承受的精神压力越大。负性事件分值越高，对心身健康的影响通常越大；正性事件分值的意义仍待进一步研究。
                </p>
                <p className="score-label">
                  {scores.bandLabel}：{scores.bandDetail}
                </p>
                <ul className="flow-meta">
                  <li>家庭问题刺激量：{scores.family}</li>
                  <li>工作学习问题刺激量：{scores.work}</li>
                  <li>社交及其他问题刺激量：{scores.social}</li>
                  {scores.custom > 0 ? <li>补充事件刺激量：{scores.custom}</li> : null}
                </ul>
              </section>

              <section className="result-block">
                <h2 className="result-heading">参考说明：</h2>
                <p className="flow-copy">
                  计算方法：某事件刺激量 = 影响程度分 × 持续时间分 × 发生次数；正性 /
                  负性事件刺激量为对应事件之和；总刺激量 = 正性 + 负性。
                </p>
                <p className="flow-copy">
                  一般参考：95% 的正常人一年内 LES 总分不超过 20 分，99% 不超过 32 分。
                </p>
                <ul className="flow-meta">
                  <li>&lt; 20 分：低应激</li>
                  <li>20–32 分：中度应激</li>
                  <li>&gt; 32 分：高应激 / 疾病预警线</li>
                </ul>
              </section>

              {resultFile ? (
                <p className="flow-copy">结果文件已保存：frontend_web/{resultFile}</p>
              ) : (
                <p className="flow-copy">
                  若未看到保存提示，请使用 npm run
                  dev 启动后再完成作答，结果会写入 frontend_web/result/。
                </p>
              )}

              <div className="flow-actions">
                <button type="button" className="primary-btn" onClick={restart}>
                  重新作答
                </button>
                <button type="button" className="ghost-btn" onClick={onBackHome}>
                  回到入口
                </button>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {notice ? (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.28 }}
          >
            {notice}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
