import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Input, Button, Select } from '../../components/ui';
import { Heart } from 'lucide-react';
import api from '../../lib/api';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [unis, setUnis] = useState<{ value: string; label: string }[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'mentor' | 'counsellor',
    universityId: '',
    registrationNumber: '',
    staffId: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUnis = async () => {
      try {
        const res = await api.get('/universities?status=active');
        const uniOptions = res.data.data.universities.map((u: any) => ({
          value: u._id,
          label: u.name,
        }));
        setUnis(uniOptions);
        if (uniOptions.length > 0) {
          setFormData(prev => ({ ...prev, universityId: uniOptions[0].value }));
        }
      } catch (err) {
        console.error('Failed to load universities', err);
        // Fallback option in case of error (e.g. no DB connection or first load)
        setUnis([{ value: 'demo', label: 'Please Register University First' }]);
      }
    };
    fetchUnis();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const submitData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        universityId: formData.universityId,
      };

      if (formData.role === 'student') {
        submitData.registrationNumber = formData.registrationNumber;
      } else {
        submitData.staffId = formData.staffId;
        submitData.department = formData.department;
      }

      await register(submitData);
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex bg-indigo-600 p-2.5 rounded-xl text-white mb-4">
          <Heart className="h-6 w-6 fill-current" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Create your account</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Sign up to access your university wellness portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <Card className="px-10 py-8 border border-gray-100 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                required
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
              />
              <Input
                label="Last Name"
                type="text"
                required
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>

            <Select
              label="Select University"
              options={unis}
              value={formData.universityId}
              onChange={e => setFormData({ ...formData, universityId: e.target.value })}
            />

            <Select
              label="Account Role"
              options={[
                { value: 'student', label: 'Student' },
                { value: 'mentor', label: 'Faculty Mentor' },
                { value: 'counsellor', label: 'Psychologist/Counsellor' },
              ]}
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value as any })}
            />

            {formData.role === 'student' ? (
              <Input
                label="Student Registration Number"
                type="text"
                required
                placeholder="e.g. 2021105001"
                value={formData.registrationNumber}
                onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Staff ID"
                  type="text"
                  required
                  placeholder="e.g. FAC838"
                  value={formData.staffId}
                  onChange={e => setFormData({ ...formData, staffId: e.target.value })}
                />
                <Input
                  label="Department"
                  type="text"
                  required
                  placeholder="e.g. CSE"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            )}

            <Input
              label="University Official Email"
              type="email"
              required
              placeholder="e.g. name@annauniv.edu"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />

            <Button type="submit" loading={loading} className="w-full mt-2">
              Register Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
