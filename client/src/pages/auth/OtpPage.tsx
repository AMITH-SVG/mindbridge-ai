import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Input, Button } from '../../components/ui';
import { Heart } from 'lucide-react';

export const OtpPage: React.FC = () => {
  const { verifyOtp, resendOtp } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await verifyOtp(email, otp);
      setSuccessMessage('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setSuccessMessage('');
    try {
      await resendOtp(email);
      setSuccessMessage('A new verification code has been sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex bg-indigo-600 p-2.5 rounded-xl text-white mb-4">
          <Heart className="h-6 w-6 fill-current" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Verify your email</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Enter the 6-digit verification code sent to <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-10 py-8 border border-gray-100 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-lg text-xs font-semibold text-green-600 dark:text-green-400">
                {successMessage}
              </div>
            )}

            <Input
              label="Verification Code"
              type="text"
              required
              placeholder="e.g. 123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />

            <Button type="submit" loading={loading} className="w-full">
              Verify Code
            </Button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-gray-500 dark:text-gray-400">Didn't receive the code? </span>
            <button
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
