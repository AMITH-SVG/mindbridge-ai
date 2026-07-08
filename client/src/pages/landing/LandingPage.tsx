import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Lock, ArrowRight } from 'lucide-react';
import api from '../../lib/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    allowedDomains: '',
    contactEmail: '',
    city: '',
    state: '',
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const domainsArray = formData.allowedDomains.split(',').map(d => d.trim());
      await api.post('/universities', {
        name: formData.name,
        allowedDomains: domainsArray,
        contactEmail: formData.contactEmail,
        address: { city: formData.city, state: formData.state }
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Failed to register. Please check your fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <span className="font-bold text-lg tracking-tight">MindBridge AI</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-medium hover:text-white text-slate-400 transition-colors">
              Sign In
            </button>
            <button onClick={() => navigate('/register')} className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-600/20">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/25 bg-indigo-950/20 text-indigo-400 text-xs font-semibold mb-6">
            <span>Now in open beta for all Indian Universities</span>
            <ArrowRight className="h-3 w-3" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight md:leading-none">
            Empathetic AI and secure anonymous mentoring for student mental wellbeing.
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            MindBridge AI bridges the gap between students, peer mentors, and university counsellors while preserving complete user privacy.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('/register')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/10">
              Create Student Account <ArrowRight className="h-4 w-4" />
            </button>
            <a href="#register-uni" className="border border-slate-800 hover:bg-slate-900 text-slate-200 font-medium px-6 py-3 rounded-lg transition-all">
              Register Your University
            </a>
          </div>
        </div>
        
        {/* Glow effect background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      </section>

      {/* Grid Features */}
      <section className="py-20 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-12">Built to meet the highest safety and privacy guidelines</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-slate-900 bg-slate-900/20 p-8 rounded-xl">
              <div className="bg-indigo-950/50 border border-indigo-900/50 p-2.5 rounded-lg text-indigo-400 w-fit mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Double-Blind Privacy</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Peer mentors and students converse using randomly cycled anonymous IDs. No profile photos, names, registration numbers, or emails are exposed.
              </p>
            </div>
            
            <div className="border border-slate-900 bg-slate-900/20 p-8 rounded-xl">
              <div className="bg-indigo-950/50 border border-indigo-900/50 p-2.5 rounded-lg text-indigo-400 w-fit mb-6">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Wellness Companion</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A rule-based natural language wellness engine detects emotional trends, burnout, financial pressure, and anxiety patterns without sharing raw chats.
              </p>
            </div>

            <div className="border border-slate-900 bg-slate-900/20 p-8 rounded-xl">
              <div className="bg-indigo-950/50 border border-indigo-900/50 p-2.5 rounded-lg text-indigo-400 w-fit mb-6">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Tenant Isolation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Data of each university is isolated logically. Verification requires official university email domains. No generic email domains are accepted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Register University Form */}
      <section id="register-uni" className="py-20 border-t border-slate-900 bg-slate-950/50 relative">
        <div className="max-w-xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-3">Onboard your university today</h2>
            <p className="text-slate-400 text-sm">After registration, you will receive a secure portal for student, faculty, and counsellor onboarding.</p>
          </div>

          {success ? (
            <div className="border border-green-500/35 bg-green-950/20 p-8 rounded-xl text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Registration Request Received</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our operations team will reach out to the contact email within 24 hours to verify email domains and activate your university dashboard.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/30 border border-slate-900 p-8 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">University Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Anna University"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Official Email Domain(s)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. annauniv.edu (comma separated)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  value={formData.allowedDomains}
                  onChange={e => setFormData({ ...formData, allowedDomains: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Contact Person Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. administrator@annauniv.edu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  value={formData.contactEmail}
                  onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Chennai"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">State</label>
                  <input
                    type="text"
                    required
                    placeholder="Tamil Nadu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition-all"
              >
                {loading ? 'Submitting request...' : 'Register University'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} MindBridge AI. All rights reserved.</p>
      </footer>
    </div>
  );
};
