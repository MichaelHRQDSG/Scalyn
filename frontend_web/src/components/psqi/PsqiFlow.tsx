import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  PSQI_INSTRUCTION,
  PSQI_STEPS,
  countAnsweredPsqi,
  createEmptyPsqiProgress,
  isPsqiAnswerComplete,
  summarizePsqiScores,
  type PsqiAnswer,
  type PsqiProgress,
} from "../../data/psqi";
import {
  clearPsqiProgress,
  hasIncompletePsqiProgress,
  loadPsqiProgress,
  savePsqiProgress,
  startFreshPsqiProgress,
} from "../../lib/psqiProgress";
import { savePsqiResultFile } from "../../lib/savePsqiResult";
import { Atmosphere } from "../Atmosphere";

type PsqiStepView = "intro" | "quiz" | "result";

interface PsqiFlowProps {
  onBackHome: () => void;
}

function emptyAnswer(): PsqiAnswer {
  return { value: null, note: "" };
}

export function PsqiFlow({ onBackHome }: PsqiFlowProps) {
  const saved = useMemo(() => loadPsqiProgress(), []);
  const [view, setView] = useState<PsqiStepView>(saved?.completed ? "result" : "intro");
  const [progress, setProgress] = useState<PsqiProgress>(
    () => saved ?? createEmptyPsqiProgress(),
  );
  const [draft, setDraft] = useState<PsqiAnswer>(() => {
    const current = saved?.answers[saved.currentIndex];
    return current ? { ...current, note: current.note ?? "" } : emptyAnswer();
  });
  const [direction, setDirection] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const [resultFile, setResultFile] = useState<string | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const hasResume = hasIncompletePsqiProgress();

  const currentStep = PSQI_STEPS[progress.currentIndex];
  const answeredCount = countAnsweredPsqi(progress.answers);
  const scores = summarizePsqiScores(progress.answers);
  const draftReady = isPsqiAnswerComplete(currentStep, draft);
  const isChoice =
    currentStep.kind === "choice" ||
    (currentStep.kind === "choice_with_note" &&
      draft.value != null &&
      Number(draft.value) === 0);

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

  const persist = (next: PsqiProgress) => {
    setProgress(next);
    savePsqiProgress(next);
  };

  const loadDraftAt = (index: number, source: PsqiProgress) => {
    const existing = source.answers[index];
    setDraft(existing ? { value: existing.value, note: existing.note ?? "" } : emptyAnswer());
  };

  const persistResultFile = async (answers: Array<PsqiAnswer | null>) => {
    try {
      const savedFile = await savePsqiResultFile(answers);
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
      const current = loadPsqiProgress();
      if (current && !current.completed) {
        setProgress(current);
        loadDraftAt(current.currentIndex, current);
        setResultFile(null);
        setView("quiz");
        return;
      }
    }
    const fresh = startFreshPsqiProgress();
    setProgress(fresh);
    setDraft(emptyAnswer());
    setResultFile(null);
    setDirection(1);
    setView("quiz");
  };

  const commitWithAnswer = (answer: PsqiAnswer, offset: 1 | -1) => {
    clearAdvanceTimer();
    if (offset === 1 && !isPsqiAnswerComplete(currentStep, answer)) {
      return;
    }

    const answers = [...progress.answers];
    if (offset === 1 || answer.value != null) {
      answers[progress.currentIndex] = { ...answer };
    }

    if (offset === 1 && progress.currentIndex >= PSQI_STEPS.length - 1) {
      const next: PsqiProgress = {
        ...progress,
        answers,
        completed: true,
        currentIndex: progress.currentIndex,
      };
      persist(next);
      void persistResultFile(answers);
      window.setTimeout(() => setView("result"), 280);
      return;
    }

    const nextIndex = progress.currentIndex + offset;
    if (nextIndex < 0 || nextIndex >= PSQI_STEPS.length) {
      return;
    }

    const next: PsqiProgress = {
      ...progress,
      answers,
      currentIndex: nextIndex,
      completed: false,
    };
    setDirection(offset);
    persist(next);
    loadDraftAt(nextIndex, next);
  };

  const scheduleAdvance = (answer: PsqiAnswer) => {
    if (!isPsqiAnswerComplete(currentStep, answer)) {
      return;
    }
    // 填写类题目需手动确认；纯选择类自动跳转
    if (currentStep.kind === "time" || currentStep.kind === "number") {
      return;
    }
    if (currentStep.kind === "choice_with_note" && Number(answer.value) > 0) {
      return;
    }
    clearAdvanceTimer();
    advanceTimerRef.current = window.setTimeout(() => {
      commitWithAnswer(answer, 1);
    }, 320);
  };

  const applyDraft = (next: PsqiAnswer) => {
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
    if (draft.value != null && draft.value !== "") {
      answers[progress.currentIndex] = { ...draft };
    }
    persist({ ...progress, answers, completed: false });
    showNotice("进度已保存，可稍后继续");
  };

  const restart = () => {
    clearAdvanceTimer();
    clearPsqiProgress();
    const fresh = startFreshPsqiProgress();
    setProgress(fresh);
    setDraft(emptyAnswer());
    setResultFile(null);
    setDirection(1);
    setView("intro");
  };

  return (
    <main className="page">
      <Atmosphere />
      <div className="shell shell--narrow">
        <AnimatePresence mode="wait" custom={direction}>
          {view === "intro" ? (
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
              <p className="flow-kicker">PSQI · 匹兹堡睡眠质量指数</p>
              <h1 className="flow-title">作答前请先阅读指导语</h1>
              <p className="flow-copy">{PSQI_INSTRUCTION}</p>
              <ul className="flow-meta">
                <li>共 18 个作答页：上床/入睡/起床/实际睡眠 + 睡眠困扰分项 + 总体评价</li>
                <li>选择类题目选完后自动进入下一题；时间与数值题填写后点击确认</li>
                <li>可返回上一题修改，也可随时保存进度</li>
                <li>完成后按 PSQI 七个成分计分，总分范围 0–21</li>
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

          {view === "quiz" && currentStep ? (
            <motion.section
              key={`quiz-${currentStep.id}`}
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
                  disabled={answeredCount === 0 && (draft.value == null || draft.value === "")}
                >
                  保存进度
                </button>
              </div>

              <div className="progress-row" aria-label="答题进度">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${((progress.currentIndex + 1) / PSQI_STEPS.length) * 100}%`,
                    }}
                  />
                </div>
                <span className="progress-label">
                  {progress.currentIndex + 1} / {PSQI_STEPS.length}
                </span>
              </div>

              <p className="flow-kicker">
                {currentStep.code} · 第 {currentStep.order} 题
              </p>
              <h2 className="question-text">{currentStep.title}</h2>
              {currentStep.unitHint ? <p className="field-hint">{currentStep.unitHint}</p> : null}

              {currentStep.kind === "time" ? (
                <label className="field-block">
                  <span className="field-label">时间</span>
                  <input
                    className="text-input"
                    type="time"
                    value={typeof draft.value === "string" ? draft.value : ""}
                    onChange={(event) =>
                      setDraft({ ...draft, value: event.target.value || null })
                    }
                  />
                </label>
              ) : null}

              {currentStep.kind === "number" ? (
                <label className="field-block">
                  <span className="field-label">数值</span>
                  <input
                    className="text-input"
                    type="number"
                    inputMode="decimal"
                    min={currentStep.min}
                    max={currentStep.max}
                    step={currentStep.step}
                    placeholder={currentStep.placeholder}
                    value={draft.value ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        value: event.target.value === "" ? null : event.target.value,
                      })
                    }
                  />
                </label>
              ) : null}

              {currentStep.kind === "choice" || currentStep.kind === "choice_with_note" ? (
                <div className="likert" role="radiogroup" aria-label="选项">
                  {(currentStep.options ?? []).map((option) => {
                    const selected = Number(draft.value) === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`likert-option${selected ? " is-selected" : ""}`}
                        onClick={() =>
                          applyDraft({
                            ...draft,
                            value: option.value,
                            note: option.value === 0 ? "" : draft.note,
                          })
                        }
                      >
                        <span className="likert-option__value">{option.value + 1}</span>
                        <span className="likert-option__label">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {currentStep.kind === "choice_with_note" && Number(draft.value) > 0 ? (
                <label className="field-block">
                  <span className="field-label">如有，请说明</span>
                  <input
                    className="text-input"
                    value={draft.note ?? ""}
                    placeholder="请简要说明其他影响睡眠的事情"
                    onChange={(event) => setDraft({ ...draft, note: event.target.value })}
                  />
                </label>
              ) : null}

              <div className="quiz-nav">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={goPrev}
                  disabled={progress.currentIndex === 0}
                >
                  上一题
                </button>
                {isChoice ? (
                  <span className="quiz-hint">选择后将自动进入下一题</span>
                ) : (
                  <button
                    type="button"
                    className="primary-btn"
                    disabled={!draftReady}
                    onClick={() => commitWithAnswer(draft, 1)}
                  >
                    {progress.currentIndex >= PSQI_STEPS.length - 1
                      ? "完成并查看结果"
                      : "确认并下一题"}
                  </button>
                )}
              </div>
            </motion.section>
          ) : null}

          {view === "result" && scores ? (
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
              <p className="flow-kicker">PSQI · 作答完成</p>
              <h1 className="flow-title">你的睡眠质量指数</h1>

              <section className="result-block">
                <h2 className="result-heading">得分结果：</h2>
                <p className="result-line">
                  PSQI 总分：
                  <strong>{scores.total}</strong>
                </p>
                <p className="score-label">{scores.interpretation}</p>
                {scores.sleepEfficiencyPercent != null ? (
                  <p className="flow-copy">睡眠效率约 {scores.sleepEfficiencyPercent}%</p>
                ) : null}
              </section>

              <section className="result-block">
                <h2 className="result-heading">七个成分：</h2>
                <ul className="flow-meta">
                  {scores.components.map((item) => (
                    <li key={item.key}>
                      {item.label}：{item.score}
                    </li>
                  ))}
                </ul>
                <p className="flow-copy">
                  总分范围 0–21。通常以 5 分为分界，总分越高表示睡眠质量越差。本结果仅供自我了解参考。
                </p>
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
