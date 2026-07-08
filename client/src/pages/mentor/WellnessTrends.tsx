import React, { useState, useEffect } from 'react';
import { Card, Select } from '../../components/ui';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, Activity, Smile } from 'lucide-react';
import api from '../../lib/api';

export const WellnessTrends: React.FC = () => {
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/mentor/trends?period=${period}`);
        setTrends(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [period]);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  const moodData = (trends?.moodDistribution || []).map((m: any) => ({
    name: m._id,
    count: m.count,
  }));

  const riskData = (trends?.riskDistribution || []).map((r: any) => ({
    name: r._id,
    count: r.count,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Wellness Trends</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Aggregated statistics representing the collective mental health state of the campus.</p>
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

      <div className="grid md:grid-cols-2 gap-8">
        {/* Mood Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Smile className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Campus Mood Distribution</h3>
          </div>
          <div className="h-72">
            {moodData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">No mood data logged</div>
            )}
          </div>
        </Card>

        {/* Risk Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Student Risk Factor Classification</h3>
          </div>
          <div className="h-72">
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">No risk levels categorized</div>
            )}
          </div>
        </Card>
      </div>

      {/* Wellness Index info */}
      <Card className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">About Campus Aggregates</h4>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
          MindBridge AI computes campus aggregates dynamically. All personally identifiable information (PII) including email address, registration numbers, and names are stripped from the datasets before rendering to ensure students can report mental struggles without any anxiety or risk of identity exposure.
        </p>
      </Card>
    </div>
  );
};
