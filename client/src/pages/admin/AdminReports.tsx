import React from 'react';
import { Card, Button } from '../../components/ui';
import { FileSpreadsheet, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

export const AdminReports: React.FC = () => {
  const handleExport = async () => {
    const res = await api.get('/admin/export', { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mindbridge-mood-export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Export Analytics Data</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Download compliance reports and university metrics securely.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Download Complete Export</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Generates a CSV package containing overall campus mood indices, risk statistics, check-in activity metrics, and anonymized peer mentor feedback.
          </p>
          <Button onClick={handleExport} size="sm" className="mt-4">
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Download CSV Export
          </Button>
        </Card>

        <Card className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <AlertCircle className="h-5 w-5" />
            <h4 className="font-semibold text-xs uppercase tracking-wider">Privacy & Compliance Guarantee</h4>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            All reports conform strictly to the double-blind privacy standards. No student names, emails, registration numbers, or individual chat logs are exported. The generated files are intended strictly for administrative review, research, and campus-level wellness policy development.
          </p>
        </Card>
      </div>
    </div>
  );
};
