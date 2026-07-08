import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Users, 
  ShieldAlert, 
  TrendingUp, 
  FileSpreadsheet, 
  LogOut, 
  Sun, 
  Moon, 
  University,
  Heart
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    switch (user.role) {
      case 'student':
        return [
          { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { label: 'AI Wellness Partner', path: '/student/ai-chat', icon: Heart },
          { label: 'Mood Log', path: '/student/mood-tracker', icon: Calendar },
          { label: 'Anonymous Mentoring', path: '/student/mentoring', icon: MessageSquare },
        ];
      case 'mentor':
      case 'counsellor':
        return [
          { label: 'Dashboard', path: '/mentor/dashboard', icon: LayoutDashboard },
          { label: 'Anonymous Chats', path: '/mentor/sessions', icon: MessageSquare },
          { label: 'Wellness Trends', path: '/mentor/trends', icon: TrendingUp },
        ];
      case 'university_admin':
        return [
          { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Students', path: '/admin/students', icon: Users },
          { label: 'Faculty Mentors', path: '/admin/mentors', icon: Users },
          { label: 'Export Reports', path: '/admin/reports', icon: FileSpreadsheet },
          { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
        ];
      case 'super_admin':
        return [
          { label: 'Dashboard', path: '/super/dashboard', icon: LayoutDashboard },
          { label: 'University List', path: '/super/universities', icon: University },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 border-r border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between h-screen sticky top-0">
      <div>
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <span className="font-bold text-gray-900 dark:text-gray-100 tracking-tight">MindBridge AI</span>
        </div>
        
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-500' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div>
            <div className="font-semibold text-gray-700 dark:text-gray-300 truncate w-32">{user.firstName} {user.lastName}</div>
            <div className="capitalize text-[10px] bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 px-1 py-0.5 rounded inline-block mt-0.5">{user.role.replace('_', ' ')}</div>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg transition-colors"
        >
          {theme === 'light' ? (
            <>
              <Moon className="h-4 w-4" />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="h-4 w-4" />
              <span>Light Mode</span>
            </>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
