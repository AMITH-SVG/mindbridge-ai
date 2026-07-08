import React, { useState, useEffect } from 'react';
import { Card, Badge, Select } from '../../components/ui';
import { Calendar, Smile, ShieldAlert } from 'lucide-react';
import api from '../../lib/api';

export const MoodTrackerPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/student/mood-history?period=${period}`);
      setLogs(res.data.data.entries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [period]);

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy': case 'hopeful': return 'success';
      case 'neutral': return 'info';
      case 'anxious': case 'confused': return 'medium';
      case 'burnout': case 'overwhelmed': case 'sad': return 'high';
      case 'depressed': case 'lonely': return 'critical';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  // Calculate statistics
  const totalEntries = logs.length;
  const moodCounts = logs.reduce((acc: any, log) => {
    acc[log.mood] = (acc[log.mood] || 0) + 1;
    return acc;
  }, {});
  let dominantMood = 'None';
  let maxCount = 0;
  for (const [m, count] of Object.entries(moodCounts)) {
    if ((count as number) > maxCount) {
      maxCount = count as number;
      dominantMood = m;
    }
  }

  const averageStress = totalEntries > 0 
    ? Math.round(logs.reduce((acc, log) => acc + (log.scores?.stress || 50), 0) / totalEntries) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Mood and Wellness History</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Review historical trends and self-logged journals.</p>
        </div>
        <div className="w-48">
          <Select
            options={[
              { value: '7', label: 'Last 7 Days' },
              { value: '30', label: 'Last 30 Days' },
              { value: '90', label: 'Last 90 Days' },
            ]}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 p-3 rounded-lg">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Logs</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalEntries} entries</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg">
            <Smile className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Dominant Mood</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">{dominantMood}</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 p-3 rounded-lg">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Average Stress Score</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{averageStress} / 100</span>
          </div>
        </Card>
      </div>

      {/* Logs Table / List */}
      <Card className="overflow-hidden border border-gray-100 dark:border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-900 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 dark:border-slate-800">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Mood</th>
              <th className="px-6 py-3">Stress Score</th>
              <th className="px-6 py-3">Sleep Quality</th>
              <th className="px-6 py-3">Notes</th>
              <th className="px-6 py-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {new Date(log.date).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getMoodColor(log.mood)}>{log.mood}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{log.scores?.stress || 50}</span>
                      <span className="text-xs text-gray-400">/ 100</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{log.scores?.sleepQuality || 50}</span>
                      <span className="text-xs text-gray-400">/ 100</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs max-w-xs truncate text-gray-500 dark:text-gray-400" title={log.notes}>
                    {log.notes || <span className="italic text-gray-300">No notes recorded</span>}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={log.source === 'ai_detected' ? 'medium' : 'info'}>
                      {log.source === 'ai_detected' ? 'AI Detected' : 'Daily Checkin'}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-xs text-gray-400 italic">
                  No mood entries found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
