import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { Users, FileSpreadsheet, ShieldAlert, Activity } from 'lucide-react';
import api from '../../lib/api';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleExport = async () => {
    const res = await api.get('/admin/export', { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mindbridge-mood-export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = data?.stats || { totalStudents: 0, totalMentors: 0, activeSessions: 0, criticalRiskCount: 0 };
  const recentAuditLogs = data?.recentAuditLogs || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">University Administration</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage user onboarding, audit logs, and mental health reports.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 p-3 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Registered Students</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.totalStudents}</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Faculty Mentors Onboarded</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.totalMentors}</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 p-3 rounded-lg">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Active Anonymous Chats</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.activeSessions}</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-lg">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Critical Risk Students</span>
            <span className="text-xl font-bold text-red-600 dark:text-red-400">{stats.criticalRiskCount}</span>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Recent actions / Audit Logs */}
        <Card className="p-6 md:col-span-2">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-4">Security Audit Trails</h3>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {recentAuditLogs.map((log: any) => (
              <div key={log._id} className="py-3.5 flex items-center justify-between text-xs hover:bg-gray-50/50 dark:hover:bg-slate-800/10 transition-colors">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{log.action.replace('_', ' ')}</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">Performed by {log.userId?.email || 'System'}</p>
                </div>
                <div className="text-right">
                  <Badge variant="info">{log.category}</Badge>
                  <span className="block text-[9px] text-gray-400 mt-1">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}

            {recentAuditLogs.length === 0 && (
              <div className="text-center text-xs text-gray-400 py-8 italic">
                No audit trails logged yet.
              </div>
            )}
          </div>
        </Card>

        {/* Quick Admin Actions */}
        <Card className="p-6 space-y-4 h-fit">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Quick Operations</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Extract system data, view compliance reports, or audit credentials securely.
          </p>
          <div className="space-y-2 pt-2">
            <Button className="w-full justify-start text-xs" variant="outline" onClick={handleExport}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> Download Data Export (CSV)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
