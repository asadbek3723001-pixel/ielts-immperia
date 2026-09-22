import React, { useEffect, useState } from 'react';

interface FullscreenGuardProps {
    onEnterFullscreen: () => void;
    isEnabled: boolean;
}

export default function FullscreenGuard({ onEnterFullscreen, isEnabled }: FullscreenGuardProps) {
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

    useEffect(() => {
        if (!isEnabled) return;

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, [isEnabled]);

    if (!isEnabled || isFullscreen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-gray-900/90 backdrop-blur-md flex items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-red-100 dark:border-red-900/30 space-y-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        To'liq ekran rejimi talab qilinadi
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        Test havfsizligini ta'minlash maqsadida, testni faqat to'liq ekran rejimida davom ettirish mumkin. Boshqa ilova yoki sahifalarga o'tish test javoblaringiz bekor qilinishiga olib kelishi mumkin.
                    </p>
                </div>

                <button
                    onClick={onEnterFullscreen}
                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-red-500/30 active:scale-95 flex items-center justify-center gap-3"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    TO'LIQ EKRANGA O'TISH
                </button>

                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                    IELTS Imperia · Secure Testing Environment
                </p>
            </div>
        </div>
    );
}
