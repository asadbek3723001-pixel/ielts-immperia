import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import Loading from '../Common/Loading';
import Modal from '../Common/Modal';
import CreateTest from './CreateTest';

interface TestSection {
    id: string;
    subject: string;        // GRAMMAR | VOCABULARY
    sectionType: string;    // EXERCISE | PRACTICE_TEST
    numberOfExercises: number;
    timeAllocated: number;
    sectionOrder: number;
}

interface AdminTest {
    id: string;
    title: string;
    pinCode: string;
    isActive: boolean;
    createdAt: string;
    sections: TestSection[];
    _count?: { results: number; activeSessions: number };
}

export default function Tests() {
    const [tests, setTests] = useState<AdminTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    const fetchTests = async () => {
        try {
            const res = await adminApi.getTests();
            setTests(res.data.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTests(); }, []);

    const handleToggle = async (id: string) => {
        try {
            await adminApi.toggleTest(id);
            setTests(prev =>
                prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t)
            );
        } catch {
            // xatolik — ignore
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await adminApi.deleteTest(deleteId);
            setTests(prev => prev.filter(t => t.id !== deleteId));
            setDeleteId(null);
        } catch {
            // xatolik
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Testlar</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{tests.length} ta test</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Yangi test
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {tests.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <svg className="w-7 h-7 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Hali testlar yo'q</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
                        >
                            Birinchi testni yarating
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nomi</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">PIN</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Bo'limlar</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Sana</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Holat</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {tests.map(test => (
                                    <tr key={test.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">
                                        {/* Nomi */}
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{test.title}</p>
                                            {test._count && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                    {test._count.results} ta natija
                                                </p>
                                            )}
                                        </td>

                                        {/* PIN */}
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg">
                                                {test.pinCode}
                                            </span>
                                        </td>

                                        {/* Bo'limlar */}
                                        <td className="px-5 py-4 hidden sm:table-cell">
                                            <div className="flex flex-wrap gap-1.5">
                                                {test.sections.map(s => {
                                                    const isVocab = s.subject === 'VOCABULARY';
                                                    const isPractice = s.sectionType === 'PRACTICE_TEST';
                                                    return (
                                                        <span
                                                            key={s.id}
                                                            className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                                                                isVocab
                                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                                    : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                                                            }`}
                                                        >
                                                            {isVocab ? 'Vocab' : 'Grammar'}{isPractice ? ' · PT' : ''} ({s.numberOfExercises})
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>

                                        {/* Sana */}
                                        <td className="px-5 py-4 hidden md:table-cell">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(test.createdAt).toLocaleDateString('uz-UZ')}
                                            </span>
                                        </td>

                                        {/* Holat toggle */}
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => handleToggle(test.id)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${test.isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                                    }`}
                                                title={test.isActive ? 'Faol — o\'chirish uchun bosing' : 'Nofaol — yoqish uchun bosing'}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${test.isActive ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </td>

                                        {/* Amallar */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Ko'rish — detail sahifasiga o'tadi */}
                                                <button
                                                    onClick={() => navigate(`/admin/tests/${test.id}`)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Ko'rish"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>

                                                {/* O'chirish */}
                                                <button
                                                    onClick={() => setDeleteId(test.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="O'chirish"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Yangi test modal */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Yangi test yaratish" size="lg">
                <CreateTest onSuccess={() => { setShowCreate(false); fetchTests(); }} />
            </Modal>

            {/* O'chirish tasdiqlash modal */}
            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Testni o'chirish" size="sm">
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-red-800 dark:text-red-300">Diqqat!</p>
                            <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">
                                Bu testni o'chirsangiz, unga tegishli barcha natijalar ham o'chib ketadi. Bu amalni qaytarib bo'lmaydi.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-1">
                        <button
                            onClick={() => setDeleteId(null)}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                            Bekor qilish
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-xl transition-colors flex items-center gap-2"
                        >
                            {deleting ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            )}
                            O'chirish
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
