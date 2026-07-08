import React, { useState, useEffect } from 'react';
import { Card, Badge } from '../../components/ui';
import api from '../../lib/api';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/admin/students');
        setStudents(res.data.data.students || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
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
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Student Directory</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Directory of registered student profiles.</p>
      </div>

      <Card className="overflow-hidden border border-gray-100 dark:border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-900 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 dark:border-slate-800">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Reg. Number</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3">Verified</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
            {students.length > 0 ? (
              students.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{student.email}</td>
                  <td className="px-6 py-4 font-mono text-xs">{student.registrationNumber || 'N/A'}</td>
                  <td className="px-6 py-4">{student.department || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <Badge variant={student.isVerified ? 'success' : 'medium'}>
                      {student.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={student.isActive ? 'info' : 'critical'}>
                      {student.isActive ? 'Active' : 'Suspended'}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-xs text-gray-400 italic">
                  No students found in the directory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
