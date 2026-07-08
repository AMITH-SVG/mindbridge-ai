import React, { useState, useEffect } from 'react';
import { Card, Badge } from '../../components/ui';
import api from '../../lib/api';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/audit-logs');
        setLogs(res.data.data.logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Security Audit Logs</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Real-time log of security events and administrative actions.</p>
      </div>

      <Card className="overflow-hidden border border-gray-100 dark:border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-900 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 dark:border-slate-800">
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">User/Email</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">IP Address</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                    {log.userId?.email || 'System Action'}
                  </td>
                  <td className="px-6 py-4 capitalize font-mono text-xs">{log.action.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <Badge variant="info">{log.resource || 'System'}</Badge>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{log.ipAddress || '127.0.0.1'}</td>
                  <td className="px-6 py-4">
                    <Badge variant={log.severity === 'error' || log.severity === 'critical' ? 'critical' : 'success'}>
                      {log.severity || 'info'}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-xs text-gray-400 italic">
                  No security events recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
