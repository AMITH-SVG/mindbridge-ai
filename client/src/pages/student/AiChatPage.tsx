import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { Send, Sparkles, ShieldAlert, Phone } from 'lucide-react';
import api from '../../lib/api';

interface Message {
  role: 'ai' | 'student';
  content: string;
  emotion?: string | null;
  timestamp?: string;
}

export const AiChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const initChat = async () => {
    setLoading(true);
    try {
      const res = await api.post('/student/ai/chat', { message: '' });
      setConversationId(res.data.data.conversationId);
      setMessages([
        { role: 'ai', content: res.data.data.aiResponse, timestamp: new Date().toISOString() }
      ]);
      setActiveSession(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'student', content: userMsg, timestamp: new Date().toISOString() }]);
    setLoading(true);

    try {
      const res = await api.post('/student/ai/chat', {
        message: userMsg,
        conversationId
      });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.data.aiResponse, timestamp: new Date().toISOString() }]);
      setActiveSession(res.data.data);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection issue. Please retry.', timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setActiveSession(null);
    initChat();
  };

  return (
    <div className="grid md:grid-cols-4 gap-6 h-[85vh]">
      {/* Side Control panel */}
      <Card className="p-5 flex flex-col justify-between h-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500 fill-current" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Wellness Partner</h3>
          </div>
          
          <p className="text-xs text-gray-500 leading-relaxed">
            This AI companion is designed to listen, track emotional trends, and offer supportive resources.
          </p>

          <Button variant="outline" size="sm" className="w-full" onClick={startNewChat}>
            New Conversation
          </Button>

          {activeSession && (
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800 text-xs">
              <div>
                <span className="block font-semibold text-gray-500 uppercase tracking-wide mb-1">Detected Emotion</span>
                <span className="capitalize font-medium text-gray-900 dark:text-gray-100">{activeSession.emotion || 'Neutral'}</span>
              </div>
              
              <div>
                <span className="block font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Wellness Risk Level</span>
                <Badge variant={
                  activeSession.riskLevel === 'critical' ? 'critical' : 
                  activeSession.riskLevel === 'high' ? 'high' : 
                  activeSession.riskLevel === 'medium' ? 'medium' : 'low'
                }>
                  {activeSession.riskLevel || 'Low'}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Emergencies Info */}
        <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg text-[10px] space-y-2">
          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
            <ShieldAlert className="h-4 w-4" />
            <span>CRISIS SUPPORT</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            If you are experiencing immediate distress or self-harm thoughts, please call:
          </p>
          <div className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
            <Phone className="h-3 w-3" />
            <span>iCall: 9152987821 (India)</span>
          </div>
        </div>
      </Card>

      {/* Main Chat Workspace */}
      <Card className="md:col-span-3 flex flex-col h-full overflow-hidden border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Active wellness check-in</span>
          </div>
        </div>

        {/* Message Flow */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-xl px-4 py-2.5 text-sm ${
                  msg.role === 'student'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.emotion && (
                  <span className="block text-[10px] opacity-60 mt-1 capitalize">
                    Detected: {msg.emotion}
                  </span>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl px-4 py-2.5 rounded-bl-none">
                <div className="flex gap-1.5 items-center h-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Type your message here... (AI partner is listening)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" disabled={loading} className="px-4 py-2.5">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
};
