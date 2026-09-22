import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { connectSocket } from '../../services/socketClient';
import { LiveSession } from '../../types';
import Loading from '../Common/Loading';

interface Alert {
  id: string;
  type: 'tab_switch' | 'join' | 'submit' | 'disconnect' | 'expelled';
  message: string;
  timestamp: string;
}

export default function LiveMonitoring() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const addAlert = (alert: Omit<Alert, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setAlerts(prev => [{ ...alert, id }, ...prev].slice(0, 50));
  };

  useEffect(() => {
    adminApi.getLiveSessions()
      .then(res => setSessions(res.data.data))
      .finally(() => setLoading(false));

    const socket = connectSocket();

    socket.on('student_joined', (data: { username: string; testSessionId: string }) => {
      addAlert({ type: 'join', message: `${data.username} joined test`, timestamp: new Date().toISOString() });
      adminApi.getLiveSessions().then(res => setSessions(res.data.data));
    });

    socket.on('student_violation', (data: { username: string; violationType: string; strikeCount: number; isFatal?: boolean }) => {
      const typeMap: Record<string, string> = {
        'tab-switch': 'Tab almashdi',
        'focus-loss': 'Fokus yo\'qoldi',
        'fullscreen-exit': 'To\'liq ekrandan chiqdi',
      };
      const label = typeMap[data.violationType] || data.violationType;
      const isExpelled = !!data.isFatal; // Only fatal violations expel

      addAlert({
        type: isExpelled ? 'expelled' : 'tab_switch',
        message: isExpelled
          ? `🚨 CHETLATILDI: ${data.username} (${label})`
          : `⚠️ OGOHLANTIRISH: ${data.username} (${label})`,
        timestamp: new Date().toISOString(),
      });

      console.warn(`CRITICAL: Student ${data.username} was expelled!`);

      setSessions(prev =>
        prev.map(s => s.student.username === data.username
          ? { ...s, tabSwitchCount: data.strikeCount, isExpelled: isExpelled || (s as any).isExpelled }
          : s
        )
      );
    });

    socket.on('tab_switch_detected', (data: { username: string; tabSwitchCount: number }) => {
      addAlert({
        type: 'tab_switch',
        message: `⚠️ ${data.username} switched tabs (${data.tabSwitchCount}x)`,
        timestamp: new Date().toISOString(),
      });
      setSessions(prev =>
        prev.map(s => s.student.username === data.username
          ? { ...s, tabSwitchCount: data.tabSwitchCount }
          : s
        )
      );
    });

    socket.on('student_submitted', (data: { username: string; totalScore: number }) => {
      addAlert({
        type: 'submit',
        message: `✅ ${data.username} submitted (Score: ${data.totalScore.toFixed(1)}%)`,
        timestamp: new Date().toISOString(),
      });
      setSessions(prev => prev.filter(s => s.student.username !== data.username));
    });

    socket.on('student_disconnected', (data: { username: string }) => {
      addAlert({ type: 'disconnect', message: `${data.username} disconnected`, timestamp: new Date().toISOString() });
    });

    return () => {
      socket.off('student_joined');
      socket.off('student_violation');
      socket.off('tab_switch_detected');
      socket.off('student_submitted');
      socket.off('student_disconnected');
    };
  }, []);

  if (loading) return <Loading />;

  const alertColors: Record<Alert['type'], string> = {
    expelled: 'bg-red-600 dark:bg-red-600 border-red-700 text-white font-black animate-bounce',
    tab_switch: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300',
    join: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-300',
    submit: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-300',
    disconnect: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Monitoring</h1>
        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-sm font-semibold">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          {sessions.length} Live
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Sessions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-gray-800 dark:text-gray-200">Active Students</h2>
          </div>
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-400 border-none">No students are taking tests right now</div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {sessions.map(s => (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{s.student.fullName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{s.student.username} · {s.testSession.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Section: {s.currentSubject}</p>
                  </div>
                  <div className="text-right">
                    {(s as any).isExpelled ? (
                      <span className="px-2 py-1 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-tighter animate-pulse shadow-lg shadow-red-500/50">
                        Chetlatildi
                      </span>
                    ) : s.tabSwitchCount > 0 ? (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg text-xs font-bold">
                        ⚠️ {s.tabSwitchCount} switches
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-lg text-xs">Toza</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-gray-800 dark:text-gray-200">Activity Feed</h2>
          </div>
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Waiting for activity...</div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
              {alerts.map(a => (
                <div key={a.id} className={`p-3 text-sm border-l-4 ${alertColors[a.type]}`}>
                  <p>{a.message}</p>
                  <p className="text-xs opacity-60 mt-0.5">{new Date(a.timestamp).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
