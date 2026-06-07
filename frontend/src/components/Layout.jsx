import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { request } from '../utils/api';
import { 
  LayoutDashboard, Briefcase, Users, Video, ClipboardList, Bot, 
  Moon, Sun, LogOut, Send, Sparkles, X, ChevronRight, Menu, AlertCircle,
  Clock, DollarSign, Target
} from 'lucide-react';

export default function Layout({ children, activeTab, setActiveTab }) {
  const { user, logout, offlineMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copilotInput, setCopilotInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: 'Hello! I am your AI Recruitment Copilot. Ask me questions like:\n\n- "Who has the highest ATS score?"\n- "Show top 10 candidates for Data Analyst role."\n- "Predict which candidates are most likely to succeed."', type: 'general' }
  ]);
  const [sending, setSending] = useState(false);

  if (!user) return <div className="p-8">Please login.</div>;

  // Sidebar items based on role
  const allNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, roles: ['Management Admin', 'HR Recruiter'] },
    { id: 'jobs', label: 'Jobs Board', icon: Briefcase, roles: ['Management Admin', 'HR Recruiter'] },
    { id: 'resumes', label: 'Resume Parser', icon: Sparkles, roles: ['Management Admin', 'HR Recruiter'] },
    { id: 'candidates', label: 'Pipeline Board', icon: Users, roles: ['Management Admin', 'HR Recruiter'] },
    { id: 'interviews', label: 'Interviews', icon: Video, roles: ['Management Admin', 'HR Recruiter'] },
    { id: 'onboarding', label: 'Onboarding', icon: ClipboardList, roles: ['Management Admin', 'HR Recruiter'] },
    { id: 'employees', label: 'Employees', icon: Users, roles: ['Management Admin'] },
    
    // Employee
    { id: 'employee-dashboard', label: 'My Portal', icon: LayoutDashboard, roles: ['Employee'] },

    // Candidate
    { id: 'candidate-dashboard', label: 'Candidate Portal', icon: LayoutDashboard, roles: ['Candidate'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(user.role));

  const handleSendCopilot = async (e) => {
    e.preventDefault();
    if (!copilotInput.trim()) return;

    const userMsg = { role: 'user', text: copilotInput };
    setChatHistory(prev => [...prev, userMsg]);
    setCopilotInput('');
    setSending(true);

    try {
      const res = await request('/copilot', {
        method: 'POST',
        body: JSON.stringify({ prompt: userMsg.text })
      });
      setChatHistory(prev => [...prev, { role: 'assistant', text: res.response, type: res.query_type }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'assistant', text: 'Error executing query. Please try again.', type: 'error' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 animate-pulse" />
            <span className="font-bold text-lg tracking-wider">TalentAI HRMS</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/80 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout Footer */}
        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={logout} 
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden mr-3 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-semibold text-lg text-slate-800 dark:text-slate-100 capitalize">
              {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {offlineMode && (
              <span className="flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mr-2">
                <AlertCircle className="h-3.5 w-3.5 mr-1 animate-pulse" /> Sandbox Mode
              </span>
            )}
            
            {/* Copilot Drawer Toggle */}
            {user.role !== 'Candidate' && (
              <button 
                onClick={() => setCopilotOpen(true)}
                className="flex items-center px-4 py-2 text-sm font-semibold rounded-xl text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Bot className="h-4.5 w-4.5 mr-2" />
                Copilot
              </button>
            )}

            {/* Theme Toggle */}
            <button 
              type="button"
              onClick={toggleTheme} 
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer relative z-50"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-slate-600" />}
            </button>
          </div>
        </header>

        {/* Dashboard Inner Screen */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </div>

      {/* AI Recruitment Copilot Side Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-[420px] max-w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 transform ${copilotOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Recruitment Copilot</h2>
          </div>
          <button onClick={() => setCopilotOpen(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 h-[calc(100vh-140px)] overflow-y-auto p-6 space-y-4 no-scrollbar">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-table:border-collapse prose-th:bg-slate-200 dark:prose-th:bg-slate-700/50 prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-700 prose-td:p-2">
                    {/* Render formatted lists/tables */}
                    <div className="whitespace-pre-line font-sans">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-4 flex items-center space-x-2">
                <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"></span>
                <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <form onSubmit={handleSendCopilot} className="h-20 border-t border-slate-200 dark:border-slate-800 p-4 flex items-center space-x-2 bg-slate-55">
          <input
            type="text"
            value={copilotInput}
            onChange={(e) => setCopilotInput(e.target.value)}
            placeholder="Ask copilot about candidates/resumes..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            type="submit" 
            disabled={sending}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-300 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
