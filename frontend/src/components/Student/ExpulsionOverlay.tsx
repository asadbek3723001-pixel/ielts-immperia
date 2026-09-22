import React from 'react';

export default function ExpulsionOverlay() {
    return (
        <div className="fixed inset-0 z-[10001] bg-gray-950 flex shadow-2xl items-center justify-center p-6 text-center animate-in fade-in duration-700">
            <div className="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-[2.5rem] p-12 shadow-[0_0_100px_rgba(220,38,38,0.3)] border-4 border-red-600 space-y-10 relative overflow-hidden">

                {/* Warning Icon with red glow */}
                <div className="relative">
                    <div className="absolute inset-0 bg-red-600 blur-[40px] opacity-20 rounded-full scale-150 animate-pulse" />
                    <div className="w-28 h-28 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto relative z-10 shadow-2xl">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-red-600 uppercase tracking-tighter sm:text-5xl">
                        TESTDAN CHETLATILDINGIZ
                    </h1>
                    <div className="h-1.5 w-24 bg-red-600 mx-auto rounded-full" />
                    <p className="text-gray-900 dark:text-gray-100 text-xl font-bold leading-tight">
                        Havfsizlik qoidalarini buzganingiz sababli test jarayoni to'xtatildi va chetlatildingiz.
                    </p>
                </div>

                <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-lg mx-auto">
                        Sizning barcha javoblaringiz bekor qilindi. Ushbu harakat haqida tegishli organlarga va admin panelga xabar yuborildi. Qayta urinish imkoniyati mavjud emas.
                    </p>

                    <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-2xl inline-block">
                        <p className="text-red-600 dark:text-red-400 font-black text-sm uppercase tracking-widest">
                            ID: {(Math.random() * 1000000).toFixed(0)} · PROKTORING XABARI
                        </p>
                    </div>
                </div>

                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.2em] pt-8">
                    IELTS Imperia · Strict Security Protocol 1.0
                </p>
            </div>
        </div>
    );
}
