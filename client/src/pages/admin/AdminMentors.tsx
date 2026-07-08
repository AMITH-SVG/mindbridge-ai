import React, { useState, useEffect } from 'react';
import { Card, Badge } from '../../components/ui';
import api from '../../lib/api';

export const AdminMentors: React.FC = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await api.get('/admin/mentors');
        setMentors(res.data.data.mentors || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
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
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Faculty Mentors & Counsellors</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Directory of registered mentors and clinical counsellors.</p>
      </div>

      <Card className="overflow-hidden border border-gray-100 dark:border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-900 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 dark:border-slate-800">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Staff ID</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
            {mentors.length > 0 ? (
              mentors.map((m) => (
                <tr key={m._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {m.firstName} {m.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{m.email}</td>
                  <td className="px-6 py-4 font-mono text-xs">{m.staffId || 'N/A'}</td>
                  <td className="px-6 py-4">{m.department || 'N/A'}</td>
                  <td className="px-6 py-4 capitalize">
                    <Badge variant={m.role === 'counsellor' ? 'critical' : 'info'}>{m.role}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={m.isActive ? 'success' : 'critical'}>
                      {m.isActive ? 'Active' : 'Suspended'}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-xs text-gray-400 italic">
                  No mentors or counsellors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
