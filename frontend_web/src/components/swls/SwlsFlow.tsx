import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import {
  SWLS_INSTRUCTION,
  SWLS_LIKERT_OPTIONS,
  SWLS_QUESTIONS,
  countAnswered,
  createEmptySwlsProgress,
  interpretSwlsScore,
  sumSwlsAnswers,
  type SwlsAnswer,
  type SwlsProgress,
} from "../../data/swls";
import {
  clearSwlsProgress,
  hasIncompleteSwlsProgress,
  loadSwlsProgress,
  saveSwlsProgress,
  startFreshSwlsProgress,
} from "../../lib/swlsProgress";
import { Atmosphere } from "../Atmosphere";

type SwlsStep = "intro" | "quiz" | "result";

interface SwlsFlowProps {
  onBackHome: () => void;
}

export function SwlsFlow({ onBackHome }: SwlsFlowProps) {
  const saved = useMemo(() => loadSwlsProgress(), []);
  const [step, setStep] = useState<SwlsStep>(
    saved?.completed ? "result" : "intro",
  );
  const [progress, setProgress] = useState<SwlsProgress>(
    () => saved ?? createEmptySwlsProgress(),
  );
  const [direction, setDirection] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const hasResume = hasIncompleteSwlsProgress();

  const totalScore = sumSwlsAnswers(progress.answers);
  const answeredCount = countAnswered(progress.answers);
  const currentQuestion = SWLS_QUESTIONS[progress.currentIndex];

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2000);
  };

  const persist = (next: SwlsProgress) => {
    setProgress(next);
    saveSwlsProgress(next);
  };

  const beginQuiz = (resume: boolean) => {
    if (resume) {
      const current = loadSwlsProgress();
      if (current && !current.completed) {
        setProgress(current);
        setStep("quiz");
        return;
      }
    }
    const fresh = startFreshSwlsProgress();
    setProgress(fresh);
    setDirection(1);
    setStep("quiz");
  };

  const handleAnswer = (value: number) => {
    const answers: SwlsAnswer[] = [...progress.answers];
    answers[progress.currentIndex] = value;
    const isLast = progress.currentIndex >= SWLS_QUESTIONS.length - 1;
    const allDone = answers.every((item) => item != null);

    if (isLast && allDone) {
      const next: SwlsProgress = {
        ...progress,
        answers,
        completed: true,
        currentIndex: progress.currentIndex,
      };
      persist(next);
      window.setTimeout(() => setStep("result"), 280);
      return;
    }

    const nextIndex = Math.min(progress.currentIndex + 1, SWLS_QUESTIONS.length - 1);
    const next: SwlsProgress = {
      ...progress,
      answers,
      currentIndex: nextIndex,
      completed: false,
    };
    setDirection(1);
    persist(next);
  };

  const goPrev = () => {
    if (progress.currentIndex <= 0) {
      return;
    }
    setDirection(-1);
    persist({
      ...progress,
      currentIndex: progress.currentIndex - 1,
      completed: false,
    });
  };

  const saveAndLeave = () => {
    persist({ ...progress, completed: false });
    showNotice("进度已保存，可稍后继续");
  };

  const restart = () => {
    clearSwlsProgress();
    const fresh = startFreshSwlsProgress();
    setProgress(fresh);
    setDirection(1);
    setStep("intro");
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
              <p className="flow-kicker">SWLS · 生活满意度量表</p>
              <h1 className="flow-title">作答前请先阅读指导语</h1>
              <p className="flow-copy">{SWLS_INSTRUCTION}</p>
              <ul className="flow-meta">
                <li>共 5 题，每页只呈现一道题</li>
                <li>7 点李克特量表（1 = 非常不同意，7 = 非常同意）</li>
                <li>总分范围 5–35 分，分数越高代表生活满意度越高</li>
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
                  disabled={answeredCount === 0}
                >
                  保存进度
                </button>
              </div>

              <div className="progress-row" aria-label="答题进度">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${((progress.currentIndex + 1) / SWLS_QUESTIONS.length) * 100}%`,
                    }}
                  />
                </div>
                <span className="progress-label">
                  {progress.currentIndex + 1} / {SWLS_QUESTIONS.length}
                </span>
              </div>

              <p className="flow-kicker">第 {currentQuestion.order} 题</p>
              <h2 className="question-text">{currentQuestion.text}</h2>

              <div className="likert" role="radiogroup" aria-label="同意程度">
                {SWLS_LIKERT_OPTIONS.map((option) => {
                  const selected = progress.answers[progress.currentIndex] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`likert-option${selected ? " is-selected" : ""}`}
                      onClick={() => handleAnswer(option.value)}
                    >
                      <span className="likert-option__value">{option.value}</span>
                      <span className="likert-option__label">{option.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="quiz-nav">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={goPrev}
                  disabled={progress.currentIndex === 0}
                >
                  上一题
                </button>
                <span className="quiz-hint">选择后将自动进入下一题</span>
              </div>
            </motion.section>
          ) : null}

          {step === "result" && totalScore != null ? (
            <motion.section
              key="result"
              className="flow-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <button type="button" className="text-btn" onClick={onBackHome}>
                ← 返回量表入口
              </button>
              <p className="flow-kicker">SWLS · 作答完成</p>
              <h1 className="flow-title">你的生活满意度得分</h1>
              <p className="score-number">{totalScore}</p>
              <p className="score-label">{interpretSwlsScore(totalScore)}</p>
              <p className="flow-copy">
                总分范围 5–35 分。分数越高，代表生活满意度越高。本结果仅供自我了解参考，不构成诊断。
              </p>
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
