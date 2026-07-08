import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import api from '../../lib/api';

export const MentorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, trendRes] = await Promise.all([
          api.get('/mentor/dashboard'),
          api.get('/mentor/trends'),
        ]);
        setData(dashRes.data.data);
        setTrends(trendRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = data?.stats || { activeSessions: 0, pendingSessions: 0, totalSessions: 0, highRiskCount: 0 };
  const riskNotifications = data?.riskNotifications || [];
  const recentSessions = data?.recentSessions || [];

  // Parse chart data
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
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Mentor Dashboard</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Review active anonymous student mentoring and wellness statistics.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Active Anonymous Chats</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.activeSessions}</span>
        </Card>
        
        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Unassigned Requests</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.pendingSessions}</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Escalated Risk Alerts</span>
          <span className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.highRiskCount}</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Lifetime Sessions</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.totalSessions}</span>
        </Card>
      </div>

      {/* Main split grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Active chats & Notifications */}
        <div className="md:col-span-2 space-y-6">
          {/* Risk alerts widget */}
          {riskNotifications.length > 0 && (
            <Card className="p-6 border-red-100 dark:border-red-950 bg-red-50/20 dark:bg-red-950/10">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Immediate Risk Alerts</h3>
              </div>
              <div className="divide-y divide-red-100/50 dark:divide-red-900/20">
                {riskNotifications.map((noti: any) => (
                  <div key={noti._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Session ID: {noti.studentAnonId}</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">Requested on {new Date(noti.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Badge variant="critical">{noti.riskLevel} Risk</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent sessions list */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-4">Recent Mentoring Sessions</h3>
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {recentSessions.map((s: any) => (
                <div key={s._id} className="py-4 flex items-center justify-between text-xs hover:bg-gray-50/50 dark:hover:bg-slate-800/10 transition-colors">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Student: {s.studentAnonId}</span>
                    <span className="block text-[10px] text-gray-400 mt-0.5">Messages: {s.messages?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={s.status === 'active' ? 'success' : 'info'}>{s.status}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/mentor/sessions')}>
                      Open Workspace <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {recentSessions.length === 0 && (
                <div className="text-center text-xs text-gray-400 py-8 italic">
                  No active or historical mentoring sessions found.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Aggregate trends charts */}
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Wellness Aggregation</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">University wide wellness trends (non-identifying)</p>
          </div>
          
          <div className="space-y-4">
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide">University Mood Distribution</span>
            <div className="h-48">
              {moodData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moodData}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">No mood data logged</div>
              )}
            </div>

            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Wellness Risk Levels distribution</span>
            <div className="h-48">
              {riskData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskData}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">No risk levels categorized</div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
