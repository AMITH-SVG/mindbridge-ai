import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { University, Shield, Users, CheckCircle } from 'lucide-react';
import api from '../../lib/api';

export const SuperDashboard: React.FC = () => {
  const [unis, setUnis] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [uniRes, statsRes] = await Promise.all([
        api.get('/universities'),
        api.get('/universities/stats'),
      ]);
      setUnis(uniRes.data.data.universities || []);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/universities/${id}/approve`);
      alert('University approved successfully.');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to approve university.');
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await api.patch(`/universities/${id}/deactivate`);
      alert('University status updated.');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update university.');
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  const generalStats = stats || { totalUniversities: 0, totalUsers: 0, activeSubscriptions: 0, pendingApprovals: 0 };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Super Administration Dashboard</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Platform monitoring, university approvals, and domain policies control panel.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 p-3 rounded-lg">
            <University className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Onboarded</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{generalStats.totalUniversities} universities</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 p-3 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Platform Users</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{generalStats.totalUsers} profiles</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Active Subscriptions</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{generalStats.activeSubscriptions} active</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 p-3 rounded-lg">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pending Approvals</span>
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{generalStats.pendingApprovals} requests</span>
          </div>
        </Card>
      </div>

      {/* University Table */}
      <Card className="overflow-hidden border border-gray-100 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Registered Universities</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-900 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 dark:border-slate-800">
              <th className="px-6 py-3">University Name</th>
              <th className="px-6 py-3">Domain Patterns</th>
              <th className="px-6 py-3">Contact Email</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
            {unis.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {u.name}
                </td>
                <td className="px-6 py-4 font-mono text-xs">{u.allowedDomains?.join(', ')}</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{u.contactEmail}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Badge variant={u.isApproved ? 'success' : 'medium'}>
                      {u.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                    <Badge variant={u.isActive ? 'info' : 'critical'}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {!u.isApproved && (
                    <Button size="sm" onClick={() => handleApprove(u._id)}>
                      Approve
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant={u.isActive ? 'danger' : 'secondary'}
                    onClick={() => handleDeactivate(u._id)}
                  >
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}

            {unis.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-xs text-gray-400 italic">
                  No university registrations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
