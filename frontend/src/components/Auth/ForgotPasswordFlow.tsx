import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';

interface Props {
    onBack: () => void;
}

type Step = 'REQUEST' | 'PENDING_INFO' | 'ENTER_CODE' | 'NEW_PASSWORD' | 'SUCCESS';

export default function ForgotPasswordFlow({ onBack }: Props) {
    const [step, setStep] = useState<Step>('REQUEST');
    const [username, setUsername] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/request-reset', { username: username.trim() });
            setStep('PENDING_INFO');
        } catch (err: any) {
            setError(err.response?.data?.message || "Xatolik ro'y berdi");
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyCodeStep = (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            setError("Iltimos kodni to'liq kiriting");
            return;
        }
        setError('');
        setStep('NEW_PASSWORD');
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Parollar mos kelmadi");
            return;
        }
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                username: username.trim(),
                resetCode: code.join(''),
                newPassword
            });
            setStep('SUCCESS');
        } catch (err: any) {
            setError(err.response?.data?.message || "Xatolik ro'y berdi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl flex flex-col overflow-hidden rounded-[2rem] p-8 sm:p-10">

                {/* Back button */}
                {step !== 'SUCCESS' && (
                    <button
                        onClick={onBack}
                        className="absolute top-6 left-6 p-2 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                )}

                {error && (
                    <div className="absolute top-16 left-8 right-8 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm text-center animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                {/* STEP 1: Request username */}
                {step === 'REQUEST' && (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-inner">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Parolni tiklash</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Akkauntingizning username'ini kiriting</p>
                        </div>
                        <form onSubmit={handleRequestCode} className="space-y-6">
                            <div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 font-medium text-center text-lg"
                                    placeholder="Username..."
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-gray-800 to-black dark:from-gray-100 dark:to-white dark:text-gray-900 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-gray-500/25 disabled:opacity-50 transition-all"
                            >
                                {loading ? 'Yuborilmoqda...' : 'Davom etish'}
                            </button>
                        </form>
                    </div>
                )}

                {/* STEP 2: Pending Information */}
                {step === 'PENDING_INFO' && (
                    <div className="text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-orange-500/10 rotate-12 transition-transform hover:rotate-0">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">So'rov yuborildi!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            Sizning so'rovingiz administratorga yetib bordi. <br />
                            Iltimos, admin bilan bog'laning va <strong className="text-gray-900 dark:text-white">6 xonali tasdiqlash kodini</strong> oling.
                        </p>
                        <button
                            onClick={() => { setError(''); setStep('ENTER_CODE'); }}
                            className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/25 transition-all"
                        >
                            Kodni oldim, kiritish
                        </button>
                    </div>
                )}

                {/* STEP 3: Enter Target Code OTP */}
                {step === 'ENTER_CODE' && (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Kodni e'lon qiling</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Admindan olgan 6 xonali kodni kiriting</p>
                        </div>
                        <form onSubmit={handleVerifyCodeStep} className="space-y-8">
                            <div className="flex justify-between gap-2">
                                {code.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={el => inputRefs.current[i] = el}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleCodeChange(i, e.target.value)}
                                        onKeyDown={e => handleKeyDown(i, e)}
                                        className="w-[45px] h-14 sm:w-12 sm:h-14 text-center text-2xl font-black bg-gray-50/80 dark:bg-gray-800/80 border-2 border-transparent dark:border-gray-700/50 rounded-xl focus:ring-0 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-900 shadow-inner outline-none transition-all text-gray-900 dark:text-white"
                                    />
                                ))}
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                            >
                                Kodni tasdiqlash
                            </button>
                        </form>
                    </div>
                )}

                {/* STEP 4: Submit New Password */}
                {step === 'NEW_PASSWORD' && (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl mx-auto flex items-center justify-center mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Yangi parol</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">O'zingiz uchun yangi va xavfsiz parol o'rnating</p>
                        </div>
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 font-medium text-lg"
                                    placeholder="Yangi parol..."
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 font-medium text-lg"
                                    placeholder="Parolni qayta kiriting..."
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 mt-2 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition-all"
                            >
                                {loading ? 'Saqlanmoqda...' : 'Saqlash va Kirish'}
                            </button>
                        </form>
                    </div>
                )}

                {/* STEP 5: Success Output */}
                {step === 'SUCCESS' && (
                    <div className="text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-emerald-500 text-white rounded-full mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/40">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Muvaffaqiyatli!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">
                            Parolingiz xavfsiz tarzda yangilandi. Endi tizimga yangi parol bilan kirishingiz mumkin.
                        </p>
                        <button
                            onClick={onBack}
                            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:scale-[1.02] transition-transform"
                        >
                            Platformaga kirish
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
