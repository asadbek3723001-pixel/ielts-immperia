import { useState, useCallback, useEffect } from 'react';
import { ClientPracticeQuestion, SubmitAnswer } from '../../types';

interface Props {
  questions: ClientPracticeQuestion[];
  subject: string;
  answers: Record<string, SubmitAnswer>;
  onAnswer: (answer: SubmitAnswer) => void;
  onSubmit: () => void;
  submitting: boolean;
  isLast: boolean;
  onIndexChange?: (idx: number) => void;
}

export default function PracticeTestRenderer({ questions, subject, answers, onAnswer, onSubmit, submitting, isLast, onIndexChange }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);

  const total = questions.length;
  const current = questions[currentIdx];

  useEffect(() => {
    onIndexChange?.(currentIdx);
  }, [currentIdx, onIndexChange]);

  const goTo = useCallback((idx: number) => {
    setCurrentIdx(Math.max(0, Math.min(total - 1, idx)));
  }, [total]);

  const toggleFlag = useCallback(() => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(currentIdx)) next.delete(currentIdx);
      else next.add(currentIdx);
      return next;
    });
  }, [currentIdx]);

  const handleSelect = useCallback((optionText: string) => {
    if (!current) return;
    onAnswer({
      questionId: current.id,
      questionType: subject as 'VOCABULARY' | 'GRAMMAR',
      selectedAnswer: optionText,
      questionText: current.text,
    });
    // auto-advance to next unanswered question
    if (currentIdx < total - 1) {
      setTimeout(() => setCurrentIdx(i => i + 1), 280);
    }
  }, [current, subject, onAnswer, currentIdx, total]);

  if (!current) return null;

  const selectedAnswer = answers[current.id]?.selectedAnswer;
  const isFlagged = flagged.has(currentIdx);
  const answeredCount = questions.filter(q => answers[q.id]?.selectedAnswer).length;
  const flaggedList = Array.from(flagged).sort((a, b) => a - b);

  return (
    <div className="h-full flex flex-col">

      {/* Question area — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

          {/* Question header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 border-2 ${
                isFlagged
                  ? 'bg-amber-400 border-amber-400 text-white'
                  : selectedAnswer
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
              }`}>
                {currentIdx + 1}
              </span>
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                / {total} savol
              </span>
            </div>

            {/* Flag button */}
            <button
              type="button"
              onClick={toggleFlag}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isFlagged
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-amber-300 hover:text-amber-500'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill={isFlagged ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              {isFlagged ? 'Belgilangan' : 'Belgilash'}
            </button>
          </div>

          {/* Question text */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-5 py-5">
            <p className="text-base font-medium text-gray-900 dark:text-white leading-relaxed">
              {current.text}
            </p>
          </div>

          {/* Options — 2x2 grid */}
          <div className="grid grid-cols-2 gap-3">
            {current.options.map((option) => {
              const isSelected = selectedAnswer === option.text;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleSelect(option.text)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 border transition-all ${
                    isSelected
                      ? 'bg-white/20 border-white/30 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                  }`}>
                    {option.label}
                  </span>
                  <span className="text-sm font-semibold leading-snug">{option.text}</span>
                </button>
              );
            })}
          </div>

          {/* Flagged list */}
          {flaggedList.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl px-4 py-3">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
                🚩 Belgilangan savollar:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {flaggedList.map(i => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${
                      answers[questions[i].id]?.selectedAnswer
                        ? 'bg-amber-400 text-white'
                        : 'bg-white dark:bg-gray-800 border-2 border-amber-400 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom padding */}
          <div className="h-2" />
        </div>
      </div>

      {/* Bottom navigation — matches Grammar bar style */}
      <div className="flex-shrink-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200/80 dark:border-gray-800">

        {/* Question pills row */}
        <div className="px-3 pt-2.5 pb-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {questions.map((q, i) => {
              const isAnswered = !!answers[q.id]?.selectedAnswer;
              const isFlaggedQ = flagged.has(i);
              const isCurrent = i === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => goTo(i)}
                  className={`relative flex-shrink-0 h-8 min-w-[32px] px-2 rounded-xl text-[11px] font-black transition-all duration-150 flex items-center justify-center gap-1 ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.4)] scale-105'
                      : isFlaggedQ && isAnswered
                        ? 'bg-amber-400 text-white'
                        : isFlaggedQ
                          ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-400 text-amber-600 dark:text-amber-400'
                          : isAnswered
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {isFlaggedQ && !isCurrent && (
                    <svg className="w-2.5 h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" />
                    </svg>
                  )}
                  {i + 1}
                  {isAnswered && !isCurrent && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-gray-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prev / progress bar / Next or Submit */}
        <div className="px-3 pb-3 pt-1 flex items-center gap-2">

          {/* Prev */}
          <button
            onClick={() => goTo(currentIdx - 1)}
            disabled={currentIdx === 0}
            className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-25 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-bold text-xl"
            aria-label="Previous"
          >
            ‹
          </button>

          {/* Progress */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                {currentIdx + 1} / {total} savol
              </span>
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                {answeredCount} / {total} javob berildi
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / total) * 100}%` }}
              />
            </div>
          </div>

          {/* Next or Submit */}
          {currentIdx < total - 1 ? (
            <button
              onClick={() => goTo(currentIdx + 1)}
              className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-bold text-xl"
              aria-label="Next"
            >
              ›
            </button>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
              className="flex-shrink-0 h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black shadow-[0_2px_10px_rgba(5,150,105,0.4)] transition-all whitespace-nowrap flex items-center gap-1.5"
            >
              {submitting ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : isLast ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Yakunlash
                </>
              ) : (
                'Keyingisi →'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Submit / Finish Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 shadow-2xl backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden transform transition-all border border-gray-100 dark:border-gray-700 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isLast ? 'Testni yakunlash' : "Bo'limni yakunlash"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[15px]">
                {total - answeredCount > 0 ? (
                  <span>
                    Siz <strong className="text-amber-600 dark:text-amber-400 font-bold">{total - answeredCount} ta</strong> savolga javob bermadingiz. {isLast ? 'Testni haqiqatan ham yakunlamoqchimisiz?' : "Keyingi bo'limga o'tmoqchimisiz?"}
                  </span>
                ) : (
                  <span>
                    Barcha ({total} ta) savollarga javob berildi. {isLast ? "Testni yakunlab, natijalarni ko'rmoqchimisiz?" : "Ushbu bo'limni yakunlab, keyingisiga o'tmoqchimisiz?"}
                  </span>
                )}
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex gap-3 flex-row-reverse border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  onSubmit();
                }}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/30 disabled:opacity-50"
              >
                Ha, {isLast ? 'Yakunlash' : "Keyingi bo'lim"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
