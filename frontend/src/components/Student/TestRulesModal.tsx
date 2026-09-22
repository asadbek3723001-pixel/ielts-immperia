import React from 'react';

interface TestRulesModalProps {
    onAccept: () => void;
    title: string;
}

export default function TestRulesModal({ onAccept, title }: TestRulesModalProps) {
    return (
        <div className="fixed inset-0 z-[10000] bg-gray-950 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-500">

                {/* Header - Serious Look */}
                <div className="bg-red-600 px-8 py-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 0 L100 100 M100 0 L0 100" stroke="white" strokeWidth="0.5" />
                        </svg>
                    </div>
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                        IMTIHON QOIDALARI VA XAVFSIZLIK
                    </h1>
                    <p className="text-red-100 font-bold text-sm uppercase tracking-widest opacity-80">
                        {title} · Rasmiy Test Jarayoni
                    </p>
                </div>

                <div className="p-8 sm:p-10 space-y-8">
                    <div className="space-y-6">
                        <div className="flex gap-5">
                            <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-950/40 text-amber-600 rounded-xl flex items-center justify-center font-black text-lg">1</div>
                            <div className="space-y-1">
                                <h3 className="font-black text-gray-900 dark:text-gray-100 uppercase text-sm tracking-wide">To'liq ekran rejimi</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    Test davomida brauzer <b>to'liq ekran (fullscreen)</b> rejimida bo'lishi shart. Ushbu rejimdan chiqish qoidabuzarlik hisoblanadi.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-5">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-950/40 text-red-600 rounded-xl flex items-center justify-center font-black text-lg">2</div>
                            <div className="space-y-1">
                                <h3 className="font-black text-gray-900 dark:text-gray-100 uppercase text-sm tracking-wide">Taqiqlangan harakatlar</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-red-600 dark:text-red-400 font-bold">
                                    Boshqa oynaga o'tish (Alt+Tab), fokusni yo'qotish (blur), yoki boshqa ilovalarni ochishga urinish darhol chetlatishga sabab bo'ladi.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-5">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-950/40 text-blue-600 rounded-xl flex items-center justify-center font-black text-lg">3</div>
                            <div className="space-y-1">
                                <h3 className="font-black text-gray-900 dark:text-gray-100 uppercase text-sm tracking-wide">Real-vaqtda nazorat</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    Har bir harakatingiz va tizimdagi o'zgarishlar <b>Admin Panelda real-vaqtda</b> qayd etiladi va nazorat qilinadi.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                        <div className="flex items-start gap-4">
                            <svg className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h4 className="text-red-700 dark:text-red-400 font-black text-xs uppercase tracking-widest mb-1">Qat'iy Oqibatlar</h4>
                                <p className="text-red-600/80 dark:text-red-400/80 text-xs font-semibold leading-relaxed">
                                    Hech qanday ogohlantirish berilmaydi. Birinchi xatodanoq siz testdan chiqarib yuborilasiz va barcha javoblaringiz bekor qilinadi.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onAccept}
                        className="w-full py-5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-2xl font-black text-xl transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-gray-900/30 flex items-center justify-center gap-4 group"
                    >
                        ROZIMAN VA TESTNI BOSHLAYMAN
                        <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
