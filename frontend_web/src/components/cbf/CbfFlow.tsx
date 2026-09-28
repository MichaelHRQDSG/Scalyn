import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import {
  CBF_DIMENSION_LABEL,
  CBF_INSTRUCTION,
  CBF_LIKERT_OPTIONS,
  CBF_QUESTIONS,
  countAnsweredCbf,
  createEmptyCbfProgress,
  summarizeCbfScores,
  type CbfAnswer,
  type CbfProgress,
} from "../../data/cbf";
import {
  clearCbfProgress,
  hasIncompleteCbfProgress,
  loadCbfProgress,
  saveCbfProgress,
  startFreshCbfProgress,
} from "../../lib/cbfProgress";
import { saveCbfResultFile } from "../../lib/saveCbfResult";
import { Atmosphere } from "../Atmosphere";

type CbfStep = "intro" | "quiz" | "result";

interface CbfFlowProps {
  onBackHome: () => void;
}

export function CbfFlow({ onBackHome }: CbfFlowProps) {
  const saved = useMemo(() => loadCbfProgress(), []);
  const [step, setStep] = useState<CbfStep>(saved?.completed ? "result" : "intro");
  const [progress, setProgress] = useState<CbfProgress>(
    () => saved ?? createEmptyCbfProgress(),
  );
  const [direction, setDirection] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const [resultFile, setResultFile] = useState<string | null>(null);
  const hasResume = hasIncompleteCbfProgress();

  const answeredCount = countAnsweredCbf(progress.answers);
  const currentQuestion = CBF_QUESTIONS[progress.currentIndex];
  const scores = summarizeCbfScores(progress.answers);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2200);
  };

  const persist = (next: CbfProgress) => {
    setProgress(next);
    saveCbfProgress(next);
  };

  const persistResultFile = async (answers: CbfAnswer[]) => {
    try {
      const savedFile = await saveCbfResultFile(answers);
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
    if (resume) {
      const current = loadCbfProgress();
      if (current && !current.completed) {
        setProgress(current);
        setResultFile(null);
        setStep("quiz");
        return;
      }
    }
    const fresh = startFreshCbfProgress();
    setProgress(fresh);
    setResultFile(null);
    setDirection(1);
    setStep("quiz");
  };

  const handleAnswer = (value: number) => {
    const answers: CbfAnswer[] = [...progress.answers];
    answers[progress.currentIndex] = value;
    const isLast = progress.currentIndex >= CBF_QUESTIONS.length - 1;
    const allDone = answers.every((item) => item != null);

    if (isLast && allDone) {
      const next: CbfProgress = {
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

    const nextIndex = Math.min(progress.currentIndex + 1, CBF_QUESTIONS.length - 1);
    setDirection(1);
    persist({
      ...progress,
      answers,
      currentIndex: nextIndex,
      completed: false,
    });
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
    clearCbfProgress();
    const fresh = startFreshCbfProgress();
    setProgress(fresh);
    setResultFile(null);
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
              <p className="flow-kicker">CBF-PI-B · 中国大五人格问卷</p>
              <h1 className="flow-title">作答前请先阅读指导语</h1>
              <p className="flow-copy">{CBF_INSTRUCTION}</p>
              <ul className="flow-meta">
                <li>共 40 题，五个维度各 8 题：神经质、尽责性、宜人性、开放性、外向性</li>
                <li>6 级计分：1=完全不符合 … 6=完全符合</li>
                <li>每页一题，选完后自动进入下一题；可返回修改并保存进度</li>
                <li>带 * 的反向题会在结果中自动反向计分</li>
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
                      width: `${((progress.currentIndex + 1) / CBF_QUESTIONS.length) * 100}%`,
                    }}
                  />
                </div>
                <span className="progress-label">
                  {progress.currentIndex + 1} / {CBF_QUESTIONS.length}
                </span>
              </div>

              <p className="flow-kicker">
                {CBF_DIMENSION_LABEL[currentQuestion.dimension]} · 第 {currentQuestion.order} 题
                {currentQuestion.reverse ? "（反向题）" : ""}
              </p>
              <h2 className="question-text">{currentQuestion.text}</h2>

              <div className="likert" role="radiogroup" aria-label="符合程度">
                {CBF_LIKERT_OPTIONS.map((option) => {
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

          {step === "result" && scores ? (
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
              <p className="flow-kicker">CBF-PI-B · 作答完成</p>
              <h1 className="flow-title">大五人格维度得分</h1>
              <p className="flow-copy">
                每个维度由 8 个条目计分（含反向题已换算），单维分数范围一般为 8–48
                分。分数仅供自我了解参考。
              </p>

              <section className="result-block">
                <h2 className="result-heading">得分结果：</h2>
                <ul className="flow-meta">
                  {scores.dimensions.map((item) => (
                    <li key={item.key}>
                      {item.label}：{item.score}
                    </li>
                  ))}
                </ul>
                <p className="result-line">
                  五维合计：
                  <strong>{scores.total}</strong>
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
