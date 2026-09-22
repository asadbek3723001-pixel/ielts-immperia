import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import Loading from '../Common/Loading';
import { exportToExcel, exportToPdf, exportToWord } from '../../utils/exportTestResults';

interface Section {
    id: string;
    subject: string;        // GRAMMAR | VOCABULARY
    sectionType: string;    // EXERCISE | PRACTICE_TEST
    numberOfExercises: number;
    timeAllocated: number;
    sectionOrder: number;
}

interface Result {
    id: string;
    totalScore: number;
    vocabScore: number | null;
    grammarScore: number | null;
    vocabCorrect: number | null;
    vocabTotal: number | null;
    grammarCorrect: number | null;
    grammarTotal: number | null;
    submittedAt: string;
    student: { fullName: string; username: string; phoneNumber: string };
}

interface TestDetail {
    id: string;
    title: string;
    pinCode: string;
    isActive: boolean;
    createdAt: string;
    sections: Section[];
    results: Result[];
    _count: { results: number; activeSessions: number };
}

function ScoreBadge({ score }: { score: number }) {
    const color =
        score >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30'
            : score >= 60 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/30'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800/30';
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-sm font-bold tabular-nums ${color}`}>
            {score.toFixed(1)}%
        </span>
    );
}

function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function TestDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [test, setTest] = useState<TestDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [exporting, setExporting] = useState<string | null>(null);

    const handleExport = async (format: 'excel' | 'pdf' | 'word') => {
        if (!test) return;
        setExporting(format);
        try {
            const exportData = {
                title: test.title,
                pinCode: test.pinCode,
                createdAt: test.createdAt,
                sections: test.sections,
                results: test.results,
            };
            if (format === 'excel') await exportToExcel(exportData);
            else if (format === 'pdf') exportToPdf(exportData);
            else await exportToWord(exportData);
        } catch (e) {
            console.error('Export error:', e);
        } finally {
            setExporting(null);
            setShowExport(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        adminApi.getTestDetail(id)
            .then(res => setTest(res.data.data))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Loading />;

    if (notFound || !test) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Test topilmadi</p>
                <button
                    onClick={() => navigate('/admin/tests')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                    Testlar ro'yxatiga qaytish
                </button>
            </div>
        );
    }

    const avgScore = test.results.length
        ? test.results.reduce((s, r) => s + r.totalScore, 0) / test.results.length
        : null;

    return (
        <div className="space-y-6">
            {/* Back button + Header */}
            <div className="flex items-start gap-4">
                <button
                    onClick={() => navigate('/admin/tests')}
                    className="mt-1 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex-shrink-0"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
                            {test.title}
                        </h1>
                        <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${test.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                            }`}>
                            {test.isActive ? 'Faol' : 'Nofaol'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Yaratilgan: {new Date(test.createdAt).toLocaleDateString('uz-UZ')}
                    </p>
                </div>
                {/* Export button */}
                {test.results.length > 0 && (
                    <button
                        onClick={() => setShowExport(true)}
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Yuklab olish
                    </button>
                )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* PIN */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">PIN kodi</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono tracking-widest">{test.pinCode}</p>
                </div>

                {/* Natijalar */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Natijalar</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{test._count.results}</p>
                </div>

                {/* O'rtacha ball */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">O'rtacha ball</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                        {avgScore != null ? `${avgScore.toFixed(1)}%` : '—'}
                    </p>
                </div>

                {/* Bo'limlar */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Bo'limlar</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{test.sections.length}</p>
                </div>
            </div>

            {/* Sections */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="font-bold text-gray-900 dark:text-white text-base">Test bo'limlari</h2>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {test.sections.map(s => (
                        <div key={s.id} className="px-5 py-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${s.subject === 'VOCABULARY'
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                    : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                                    }`}>
                                    {s.sectionOrder}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {s.subject === 'VOCABULARY' ? 'Vocabulary' : 'Grammar'}
                                        {s.sectionType === 'PRACTICE_TEST' && (
                                            <span className="ml-1.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                                Practice Test
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{s.numberOfExercises} ta savol</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{s.timeAllocated} daqiqa</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">vaqt</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Results */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900 dark:text-white text-base">O'quvchilar natijalari</h2>
                    <span className="text-sm text-gray-400">{test.results.length} ta</span>
                </div>
                {test.results.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">Hali hech kim test topshirmagan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
                                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">O'quvchi</th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Umumiy</th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Vocabulary</th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Grammar</th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Sana</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {test.results.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                    {initials(r.student.fullName)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{r.student.fullName}</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">@{r.student.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <ScoreBadge score={r.totalScore} />
                                        </td>
                                        <td className="px-5 py-4 hidden lg:table-cell">
                                            {r.vocabScore != null ? (
                                                <div>
                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{r.vocabScore.toFixed(1)}%</span>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-1.5">{r.vocabCorrect}/{r.vocabTotal}</span>
                                                </div>
                                            ) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                        </td>
                                        <td className="px-5 py-4 hidden lg:table-cell">
                                            {r.grammarScore != null ? (
                                                <div>
                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{r.grammarScore.toFixed(1)}%</span>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-1.5">{r.grammarCorrect}/{r.grammarTotal}</span>
                                                </div>
                                            ) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                        </td>
                                        <td className="px-5 py-4 hidden md:table-cell">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(r.submittedAt).toLocaleDateString('uz-UZ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Export Modal */}
            {showExport && test && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-base">Natijalarni yuklab olish</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{test.results.length} ta o'quvchi natijalari</p>
                            </div>
                            <button onClick={() => setShowExport(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg">&times;</button>
                        </div>
                        <div className="p-4 space-y-2">
                            {[
                                {
                                    key: 'excel' as const,
                                    label: 'Microsoft Excel',
                                    ext: '.xlsx',
                                    desc: "Jadval ko'rinishida, formulalar bilan",
                                    icon: (
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 17l2-3-2-3H10l1.5 2.25L13 11h1.5l-2 3 2 3H13l-1.5-2.25L10 17H8.5z" />
                                        </svg>
                                    ),
                                },
                                {
                                    key: 'pdf' as const,
                                    label: 'PDF Hujjat',
                                    ext: '.pdf',
                                    desc: "Chop etish uchun tayyor format",
                                    icon: (
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM9 13h1v3H9v-3zm2.5 0h1c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1H11.5v-3zm1 2v-1h-.5v1h.5zM14 13h2v.5h-1.5V14H16v.5h-1.5V16H14v-3z" />
                                        </svg>
                                    ),
                                },
                                {
                                    key: 'word' as const,
                                    label: 'Microsoft Word',
                                    ext: '.docx',
                                    desc: "Tahrirlash mумkin bo'lgan hujjat",
                                    icon: (
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17l1.5-6 1.5 4 1.5-4L14 17h-1.2l-.8-3-.8 3H8z" />
                                        </svg>
                                    ),
                                },
                            ].map(({ key, label, ext, desc, icon }) => (
                                <button
                                    key={key}
                                    onClick={() => handleExport(key)}
                                    disabled={exporting !== null}
                                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-wait transition-all text-left group"
                                >
                                    <span className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors flex-shrink-0 shadow-sm">
                                        {exporting === key ? (
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                        ) : icon}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-gray-300 dark:text-gray-600">{ext}</span>
                                </button>
                            ))}
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <p className="text-[11px] text-gray-400 dark:text-gray-600 text-center">Barcha ma'lumotlar maxfiy. Foydalanishda ehtiyot bo'ling.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
