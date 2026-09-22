import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentApi } from '../../services/api';
import { Result, StudentAnswer } from '../../types';
import Loading from '../Common/Loading';

// Extract exerciseId from questionId
// Regular single: "grammar_1_5_001_3"  → "grammar_1_5_001"
// Multi-blank:    "grammar_1_5_001_3_b0" → "grammar_1_5_001"
// Practice:       "practice_vocabulary_1_5_001" → "practice_vocabulary_1_5_001"
function extractExerciseId(questionId: string): string {
  if (questionId.startsWith('practice_')) return questionId;
  // Strip multi-blank suffix (_b0, _b1, etc.) if present
  const withoutBlank = questionId.replace(/_b\d+$/, '');
  const parts = withoutBlank.split('_');
  // Last part is the question number — remove it to get the exercise ID
  return parts.slice(0, -1).join('_');
}

function groupByExercise(answers: StudentAnswer[]): { exerciseId: string; answers: StudentAnswer[] }[] {
  const map = new Map<string, StudentAnswer[]>();
  for (const a of answers) {
    const exId = extractExerciseId(a.questionId);
    if (!map.has(exId)) map.set(exId, []);
    map.get(exId)!.push(a);
  }
  return Array.from(map.entries()).map(([exerciseId, answers]) => ({ exerciseId, answers }));
}

export default function ResultDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'vocab' | 'grammar'>('all');

  useEffect(() => {
    if (!id) return;
    studentApi.getResultDetail(id)
      .then(res => setResult(res.data.data))
      .catch(() => navigate('/student/results'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <Loading />;
  if (!result) return null;

  const allAnswers = result.answers ?? [];
  const vocabAnswers = allAnswers.filter(a => a.questionType === 'VOCABULARY');
  const grammarAnswers = allAnswers.filter(a => a.questionType === 'GRAMMAR');
  const displayAnswers = activeTab === 'vocab' ? vocabAnswers : activeTab === 'grammar' ? grammarAnswers : allAnswers;
  const grouped = groupByExercise(displayAnswers);

  const sc = (s: number) => s >= 80 ? 'text-emerald-500' : s >= 60 ? 'text-amber-500' : 'text-red-500';
  const scBg = (s: number) => s >= 80 ? 'from-emerald-500 to-teal-500' : s >= 60 ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-500';

  const ScoreCard = ({ label, score, correct, total, color }: { label: string; score: number | null; correct: number | null; total: number | null; color: string }) => {
    if (score == null) return null;
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
          <span className="text-white font-black text-sm">{score.toFixed(0)}%</span>
        </div>
        <p className="font-bold text-gray-900 dark:text-white text-sm">{label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {correct}/{total} correct
        </p>
        <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${score}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto animate-fade-in">
      {/* Back header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/student/results')}
          className="w-9 h-9 rounded-2xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-black text-gray-900 dark:text-white leading-none">{result.testSession.title}</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {new Date(result.submittedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Total score hero */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${scBg(result.totalScore)} p-6 text-white shadow-xl`}>
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />
        <div className="relative z-10 text-center">
          <p className="text-white/70 text-sm font-medium">Total Score</p>
          <p className="text-6xl font-black mt-1">{result.totalScore.toFixed(1)}%</p>
          <p className="text-white/70 text-sm mt-2">
            {result.testSession.title}
          </p>
        </div>
      </div>

      {/* Section score cards */}
      {(result.vocabScore != null || result.grammarScore != null) && (
        <div className={`grid gap-3 ${result.vocabScore != null && result.grammarScore != null ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <ScoreCard label="Vocabulary" score={result.vocabScore} correct={result.vocabCorrect} total={result.vocabTotal} color="from-blue-500 to-indigo-500" />
          <ScoreCard label="Grammar" score={result.grammarScore} correct={result.grammarCorrect} total={result.grammarTotal} color="from-indigo-500 to-purple-500" />
        </div>
      )}

      {/* Answers section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
          {(['all', 'vocab', 'grammar'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all
                ${activeTab === tab
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {tab === 'all' ? `All (${result.answers?.length ?? 0})` :
               tab === 'vocab' ? `Vocab (${vocabAnswers.length})` :
               `Grammar (${grammarAnswers.length})`}
            </button>
          ))}
        </div>

        {grouped.map(({ exerciseId, answers: exAnswers }, groupIdx) => {
          const correct = exAnswers.filter(a => a.isCorrect).length;
          const total = exAnswers.length;
          const isPractice = exerciseId.startsWith('practice_');
          const partLabel = isPractice
            ? `Practice Q${groupIdx + 1}`
            : `Part ${groupIdx + 1}`;

          return (
            <div key={exerciseId} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Exercise header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {partLabel}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  correct === total
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : correct === 0
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                }`}>
                  {correct}/{total} to'g'ri
                </span>
              </div>

              {/* Questions in this exercise */}
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {exAnswers.map((a: StudentAnswer, i: number) => (
                  <div key={a.id} className="flex items-start gap-3 px-4 py-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-[10px] mt-0.5
                      ${a.isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-snug">{a.questionText}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                        <span className="flex items-center gap-1">
                          <span className="text-[11px] text-gray-400 dark:text-gray-500">Javob:</span>
                          <span className={`font-bold text-[11px] ${a.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {a.selectedAnswer || '—'}
                          </span>
                        </span>
                        {!a.isCorrect && (
                          <span className="flex items-center gap-1">
                            <span className="text-[11px] text-gray-400 dark:text-gray-500">To'g'ri:</span>
                            <span className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400">{a.correctAnswer}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
