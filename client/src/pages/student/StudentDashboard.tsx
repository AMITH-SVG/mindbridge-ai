import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Dialog } from '../../components/ui';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Sparkles, Smile, MessageSquare } from 'lucide-react';
import api from '../../lib/api';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkinData, setCheckinData] = useState({
    mood: 'neutral',
    stress: 50,
    anxiety: 50,
    burnout: 50,
    motivation: 50,
    confidence: 50,
    sleepQuality: 50,
    notes: '',
  });

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/student/dashboard');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/student/checkin', {
        mood: checkinData.mood,
        scores: {
          stress: Number(checkinData.stress),
          anxiety: Number(checkinData.anxiety),
          burnout: Number(checkinData.burnout),
          motivation: Number(checkinData.motivation),
          confidence: Number(checkinData.confidence),
          sleepQuality: Number(checkinData.sleepQuality),
        },
        notes: checkinData.notes,
      });
      setCheckinOpen(false);
      fetchDashboard();
    } catch (err) {
      console.error(err);
      alert('Failed to log check-in');
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  const scores = data?.wellnessScores || { stress: 50, confidence: 50, motivation: 50, sleepQuality: 50, burnout: 50 };
  const trendData = data?.moodTrend || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Welcome Back</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Here is a summary of your mental wellness trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/student/ai-chat')}>
            <Sparkles className="h-4 w-4 mr-2" /> Talk to AI Partner
          </Button>
          {!data?.hasCheckedInToday && (
            <Button size="sm" onClick={() => setCheckinOpen(true)}>
              <Smile className="h-4 w-4 mr-2" /> Log Daily Check-in
            </Button>
          )}
        </div>
      </div>

      {/* Daily Check-in Notification */}
      {!data?.hasCheckedInToday && (
        <Card className="p-6 bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 p-3 rounded-lg">
              <Smile className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">How are you feeling today?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Take 30 seconds to log your wellness scores and keep your history updated.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setCheckinOpen(true)}>Log Wellness Entry</Button>
        </Card>
      )}

      {/* Wellness Scores Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {[
          { name: 'Stress level', value: scores.stress, color: 'bg-orange-500' },
          { name: 'Motivation', value: scores.motivation, color: 'bg-emerald-500' },
          { name: 'Confidence', value: scores.confidence, color: 'bg-blue-500' },
          { name: 'Sleep quality', value: scores.sleepQuality, color: 'bg-indigo-500' },
          { name: 'Burnout rate', value: scores.burnout, color: 'bg-purple-500' },
        ].map((score) => (
          <Card key={score.name} className="p-5 flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{score.name}</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{score.value}</span>
              <span className="text-[10px] text-gray-400 font-medium">/ 100</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className={`h-full ${score.color}`} style={{ width: `${score.value}%` }} />
            </div>
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">Wellness scores trend</h3>
            <p className="text-[11px] text-gray-400">Rolling metrics based on your daily inputs over the last month</p>
          </div>
          <div className="h-64 mt-6">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="motivGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                  <Area type="monotone" dataKey="scores.stress" name="Stress" stroke="#ef4444" fillOpacity={1} fill="url(#stressGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="scores.motivation" name="Motivation" stroke="#10b981" fillOpacity={1} fill="url(#motivGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Log a few check-ins to render charts
              </div>
            )}
          </div>
        </Card>

        {/* Right side widgets */}
        <div className="space-y-6">
          {/* Mentoring widget */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Anonymous Mentoring</h3>
              <Badge variant="info">Active</Badge>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              If things feel heavy, you can start a double-blind anonymous chat session with a faculty mentor.
            </p>
            <Button className="w-full" size="sm" variant="secondary" onClick={() => navigate('/student/mentoring')}>
              <MessageSquare className="h-4 w-4 mr-2" /> Access Mentoring Chats
            </Button>
          </Card>

          {/* AI Partner summary */}
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Mental Wellness AI Partner</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Our AI is here 24/7 to listen, measure your burnout, and guide you with motivational supports.
            </p>
            <Button className="w-full" size="sm" onClick={() => navigate('/student/ai-chat')}>
              <Sparkles className="h-4 w-4 mr-2" /> Start New Chat
            </Button>
          </Card>
        </div>
      </div>

      {/* CHECK-IN DIALOG */}
      <Dialog isOpen={checkinOpen} onClose={() => setCheckinOpen(false)} title="Log Daily Wellness Entry">
        <form onSubmit={handleCheckin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Overall Mood</label>
            <select
              value={checkinData.mood}
              onChange={e => setCheckinData({ ...checkinData, mood: e.target.value })}
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="happy">Happy / Confident</option>
              <option value="hopeful">Hopeful / Motivated</option>
              <option value="neutral">Neutral / Normal</option>
              <option value="sad">Sad / Down</option>
              <option value="anxious">Anxious / Worried</option>
              <option value="burnout">Burnout / Drained</option>
              <option value="lonely">Lonely / Isolated</option>
              <option value="overwhelmed">Overwhelmed / Stressed</option>
            </select>
          </div>

          {[
            { key: 'stress', label: 'Stress level' },
            { key: 'anxiety', label: 'Anxiety level' },
            { key: 'burnout', label: 'Burnout level' },
            { key: 'motivation', label: 'Motivation level' },
            { key: 'confidence', label: 'Confidence level' },
            { key: 'sleepQuality', label: 'Sleep quality' },
          ].map((slider) => (
            <div key={slider.key}>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-700 dark:text-gray-300">{slider.label}</span>
                <span className="text-gray-500">{(checkinData as any)[slider.key]} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full accent-indigo-600 h-1 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                value={(checkinData as any)[slider.key]}
                onChange={e => setCheckinData({ ...checkinData, [slider.key]: Number(e.target.value) })}
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Private Notes (Optional)</label>
            <textarea
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
              rows={3}
              placeholder="Record any details about your day..."
              value={checkinData.notes}
              onChange={e => setCheckinData({ ...checkinData, notes: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full">
            Save Wellness Log
          </Button>
        </form>
      </Dialog>
    </div>
  );
};
