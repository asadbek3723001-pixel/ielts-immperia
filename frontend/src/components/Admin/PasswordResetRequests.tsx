import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { motion } from 'framer-motion';

interface ResetRequest {
    id: string;
    student: { fullName: string; username: string };
    resetCode: string;
    expiresAt: string;
    isUsed: boolean;
    createdAt: string;
}

export default function PasswordResetRequests() {
    const [requests, setRequests] = useState<ResetRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await adminApi.getResetRequests();
            setRequests(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        const iv = setInterval(fetchRequests, 10000);
        return () => clearInterval(iv);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    Parol So'rovlari
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                    O'quvchilar tomonidan kelib tushgan parol tiklash so'rovlarini boshqarish markazi
                </p>
            </div>

            <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-2xl overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="w-8 h-8 rounded-full border-[3px] border-blue-500/20 border-t-blue-500 animate-spin" />
                        <span className="text-gray-500 text-sm font-semibold tracking-wide">YUKLANMOQDA...</span>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-24 bg-gray-50/30 dark:bg-black/20">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 text-blue-500 rounded-full flex justify-center items-center mb-5 border border-blue-100 dark:border-blue-900/30">
                            <svg className="w-8 h-8 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Hozircha bironta ham parol tiklash so'rovi kelib tushgani yo'q.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                                    <th className="py-5 px-6 pb-4 text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">O'quvchi</th>
                                    <th className="py-5 px-6 pb-4 text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Username</th>
                                    <th className="py-5 px-6 pb-4 text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Tasdiqlash Kodi</th>
                                    <th className="py-5 px-6 pb-4 text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">Amal qilish vaqti</th>
                                </tr>
                            </thead>
                            <motion.tbody
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {requests.map(req => {
                                    const hrs = Math.round((new Date(req.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60));
                                    const isActive = hrs > 0;

                                    return (
                                        <motion.tr
                                            variants={itemVariants}
                                            key={req.id}
                                            className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors duration-200 group"
                                        >
                                            <td className="py-5 px-6">
                                                <div className="font-bold text-gray-900 dark:text-white transition-colors">{req.student.fullName}</div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className="text-gray-500 dark:text-gray-400 font-mono text-sm">
                                                    @{req.student.username}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className={`px-3.5 py-1.5 rounded-lg font-mono text-lg font-bold tracking-widest shadow-sm transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 text-gray-400 dark:text-gray-600'}`}>
                                                    {req.resetCode}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                <span className={`text-sm font-semibold tracking-wide ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-500/80 dark:text-red-500/60'}`}>
                                                    {isActive ? `${hrs} soat qoldi` : 'Muddati tugagan'}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    )
                                })}
                            </motion.tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
