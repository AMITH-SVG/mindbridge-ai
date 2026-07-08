import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { Send, Shield, MessageSquare, CheckCircle } from 'lucide-react';
import api from '../../lib/api';

export const StudentMentoringPage: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pollIntervalRef = useRef<any>(null);

  const fetchSessions = async (selectFirst = false) => {
    try {
      const res = await api.get('/mentoring/student/sessions');
      const activeSessions = res.data.data.sessions || [];
      setSessions(activeSessions);
      if (selectFirst && activeSessions.length > 0) {
        setSelectedSession(activeSessions[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const res = await api.get(`/mentoring/${sessionId}/messages`);
      setMessages(res.data.data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSessions(true);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    if (selectedSession && selectedSession.status === 'active') {
      fetchMessages(selectedSession._id);
      
      // Poll every 3 seconds
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(selectedSession._id);
      }, 3000);
    } else if (selectedSession) {
      fetchMessages(selectedSession._id);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [selectedSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRequestSession = async () => {
    setRequesting(true);
    try {
      const res = await api.post('/mentoring/request', { riskLevel: 'medium' });
      await fetchSessions();
      // Select the new session
      const newSession = res.data.data;
      setSelectedSession({
        _id: newSession.sessionId,
        studentAnonId: newSession.yourAnonId,
        mentorAnonId: newSession.mentorAnonId,
        status: newSession.status,
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to request mentoring session.');
    } finally {
      setRequesting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedSession || loading) return;

    const text = inputText.trim();
    setInputText('');
    setLoading(true);

    try {
      await api.post(`/mentoring/${selectedSession._id}/message`, { message: text });
      await fetchMessages(selectedSession._id);
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!window.confirm('Are you sure you want to close this session? Your anonymous ID will be permanently destroyed.')) return;
    try {
      await api.patch(`/mentoring/${selectedSession._id}/close`);
      setSelectedSession(null);
      await fetchSessions();
    } catch (err) {
      console.error(err);
      alert('Failed to close session.');
    }
  };

  return (
    <div className="grid md:grid-cols-4 gap-6 h-[85vh]">
      {/* Session List panel */}
      <Card className="p-5 flex flex-col justify-between h-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
        <div className="space-y-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Mentoring Sessions</h3>
          </div>
          
          <Button
            size="sm"
            className="w-full"
            loading={requesting}
            onClick={handleRequestSession}
          >
            Request Peer Mentor
          </Button>

          <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-slate-800">
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Active Chats</span>
            
            {sessions.map((s) => (
              <button
                key={s._id}
                onClick={() => setSelectedSession(s)}
                className={`w-full text-left p-3 rounded-lg border text-xs transition-all duration-150 ${
                  selectedSession?._id === s._id
                    ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20'
                    : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex justify-between font-semibold text-gray-700 dark:text-gray-300">
                  <span>Chat Session</span>
                  <Badge variant={s.status === 'active' ? 'success' : 'info'}>{s.status}</Badge>
                </div>
                <div className="text-[10px] text-gray-400 mt-1">ID: {s.studentAnonId}</div>
              </button>
            ))}

            {sessions.length === 0 && (
              <div className="text-center text-[10px] text-gray-400 py-6 italic">
                No sessions requested yet.
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg text-[9px] text-gray-500 dark:text-gray-400 leading-relaxed">
          <strong>Privacy Policy:</strong> Double-blind routing in place. Mentors and students communicate via temporary identifiers only. All identifiers are destroyed upon closing the chat session.
        </div>
      </Card>

      {/* Chat Workspace */}
      <Card className="md:col-span-3 flex flex-col h-full overflow-hidden border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        {selectedSession ? (
          <>
            {/* Top Workspace Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50 dark:bg-slate-900/50">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Secure Chat Session
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Your ID: <span className="font-mono">{selectedSession.studentAnonId}</span> | Mentor ID: <span className="font-mono">{selectedSession.mentorAnonId}</span>
                </p>
              </div>
              {selectedSession.status === 'active' && (
                <Button variant="danger" size="sm" onClick={handleCloseSession}>
                  Close Session
                </Button>
              )}
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === selectedSession.studentAnonId;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input message bar */}
            {selectedSession.status === 'active' ? (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
                  placeholder="Type anonymous message to your mentor..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={loading}
                />
                <Button type="submit" disabled={loading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex items-center justify-center gap-2 text-xs text-gray-400">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>This session has been closed. Anonymous IDs have been destroyed.</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-4" />
            <h4 className="text-sm font-semibold mb-1">No Chat Session Selected</h4>
            <p className="text-xs max-w-sm">Select an active anonymous session from the sidebar or request a new peer mentor to begin.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
