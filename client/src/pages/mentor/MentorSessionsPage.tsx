import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { Send, Shield, MessageSquare, CheckCircle, Notebook } from 'lucide-react';
import api from '../../lib/api';

export const MentorSessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pollIntervalRef = useRef<any>(null);

  const fetchSessions = async (selectFirst = false) => {
    try {
      const res = await api.get('/mentoring/mentor/sessions');
      const mentorSessions = res.data.data.sessions || [];
      setSessions(mentorSessions);
      if (selectFirst && mentorSessions.length > 0) {
        setSelectedSession(mentorSessions[0]);
        setNotes(mentorSessions[0].mentorNotes || '');
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
      setNotes(selectedSession.mentorNotes || '');
      
      // Poll every 3 seconds
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(selectedSession._id);
      }, 3000);
    } else if (selectedSession) {
      fetchMessages(selectedSession._id);
      setNotes(selectedSession.mentorNotes || '');
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [selectedSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSaveNotes = async () => {
    if (!selectedSession) return;
    setSavingNotes(true);
    try {
      await api.post(`/mentoring/${selectedSession._id}/notes`, { notes });
      alert('Notes saved successfully.');
      // Update local sessions state
      setSessions(prev => prev.map(s => s._id === selectedSession._id ? { ...s, mentorNotes: notes } : s));
    } catch (err) {
      console.error(err);
      alert('Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCloseSession = async () => {
    if (!window.confirm('Are you sure you want to close this session? Double-blind anonymous IDs will be permanently destroyed.')) return;
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
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Assigned Student Chats</h3>
          </div>
          
          <div className="space-y-2">
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">My Sessions</span>
            
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
                  <span>Student Chat</span>
                  <Badge variant={s.status === 'active' ? 'success' : 'info'}>{s.status}</Badge>
                </div>
                <div className="text-[10px] text-gray-400 mt-1">ID: {s.studentAnonId}</div>
              </button>
            ))}

            {sessions.length === 0 && (
              <div className="text-center text-[10px] text-gray-400 py-6 italic">
                No students currently assigned to you.
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-lg text-[9px] text-gray-500 dark:text-gray-400 leading-relaxed">
          Double-blind encryption in place. You cannot see the student's real name, email, department, or photo.
        </div>
      </Card>

      {/* Chat Workspace */}
      <Card className="md:col-span-3 flex flex-col h-full overflow-hidden border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        {selectedSession ? (
          <div className="flex flex-1 h-full">
            {/* Messages Pane */}
            <div className="flex-1 flex flex-col border-r border-gray-100 dark:border-slate-800 overflow-hidden">
              {/* Workspace Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50 dark:bg-slate-900/50">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Double-Blind Anonymous Session
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Student ID: <span className="font-mono">{selectedSession.studentAnonId}</span> | Your ID: <span className="font-mono">{selectedSession.mentorAnonId}</span>
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
                  const isMe = msg.senderId === selectedSession.mentorAnonId;
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
                    placeholder="Type anonymous message to student..."
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
            </div>

            {/* Private Notes Panel */}
            <div className="w-80 p-5 flex flex-col justify-between bg-gray-50 dark:bg-slate-900/20">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Notebook className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Private Notes</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Save private clinical observation notes. Students can never see these notes.
                </p>
                <textarea
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
                  rows={14}
                  placeholder="Record session notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                loading={savingNotes}
                onClick={handleSaveNotes}
              >
                Save Session Notes
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-4" />
            <h4 className="text-sm font-semibold mb-1">No Chat Session Selected</h4>
            <p className="text-xs max-w-sm">Select an active anonymous peer chat from the sidebar to start communication.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
