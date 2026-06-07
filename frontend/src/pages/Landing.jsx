import React from 'react';
import { Sparkles, Bot, Video, Users, CheckCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function Landing({ onEnter }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-indigo-400" />
          <span className="font-bold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">TalentAI HRMS</span>
        </div>
        <button 
          onClick={onEnter} 
          className="flex items-center px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-all cursor-pointer shadow-lg shadow-white/5"
        >
          Launch Platform <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-sm font-semibold mb-6 animate-pulse">
          <Zap className="h-4 w-4" /> <span>Automating HR with Generative AI</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-violet-300">
          The Production-Ready AI Hiring & Recruiter Engine
        </h1>
        <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          Screen resumes, auto-generate structured technical interviews, track pipeline status, and predict candidate success using advanced LLM heuristics.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button 
            onClick={onEnter} 
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 font-bold hover:brightness-110 shadow-xl shadow-indigo-500/20 transition-all cursor-pointer flex items-center"
          >
            Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <a 
            href="#features" 
            className="px-8 py-4 rounded-xl bg-slate-800 border border-slate-700 font-semibold hover:bg-slate-700/80 transition-all"
          >
            Explore Features
          </a>
        </div>

        {/* Dashboard Mockup Grid */}
        <div className="mt-20 border border-white/10 rounded-2xl p-4 bg-slate-800/40 backdrop-blur-xl max-w-5xl mx-auto shadow-2xl relative">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-white/5">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-xs text-slate-500 pl-4 font-mono">https://platform.talentai-hrms.com</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 text-left">
            <div className="bg-slate-900/80 border border-indigo-500/10 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Resume Matcher</span>
                <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-xs">Active</span>
              </div>
              <p className="text-sm text-slate-300 font-bold mb-2">ATS Score: 92%</p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                <div className="bg-indigo-500 h-full w-[92%]"></div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">Top match for Lead Data Analyst. Key skills present: SQL, Python, Pandas, Statistics.</p>
            </div>
            <div className="bg-slate-900/80 border border-indigo-500/10 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">AI Recruiter Chat</span>
                <span className="h-2 w-2 bg-indigo-400 rounded-full animate-ping"></span>
              </div>
              <div className="space-y-3 font-mono text-xs">
                <div className="text-indigo-300">&gt; Show top candidates for role</div>
                <div className="text-slate-400">1. Bob Johnson (92% Match)<br/>2. Alice Smith (88% Match)</div>
              </div>
            </div>
            <div className="bg-slate-900/80 border border-indigo-500/10 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">AI Success Prediction</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs">Tier 1</span>
              </div>
              <p className="text-sm text-slate-300 font-bold mb-2">Success Probability: 89%</p>
              <p className="text-xs text-slate-400 leading-relaxed">High Potential Tier. Recommended based on experience and outstanding interview communication metrics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <h2 className="text-3xl font-extrabold text-center mb-16">Platform Core Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-slate-800/20 border border-white/5 hover:border-indigo-500/20 rounded-2xl p-6 transition-all">
            <Bot className="h-10 w-10 text-indigo-400 mb-6" />
            <h3 className="text-lg font-bold mb-3">AI Resume Screening</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Upload bulk resumes and extract key skills, education, experience, and assign instant ATS matching scores.</p>
          </div>
          <div className="bg-slate-800/20 border border-white/5 hover:border-indigo-500/20 rounded-2xl p-6 transition-all">
            <Video className="h-10 w-10 text-purple-400 mb-6" />
            <h3 className="text-lg font-bold mb-3">AI Interview System</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Generate role-tailored technical questions, record responses, and calculate sentiment, communication, and confidence.</p>
          </div>
          <div className="bg-slate-800/20 border border-white/5 hover:border-indigo-500/20 rounded-2xl p-6 transition-all">
            <Users className="h-10 w-10 text-pink-400 mb-6" />
            <h3 className="text-lg font-bold mb-3">Pipeline Management</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Move applicants smoothly through a drag-and-drop Kanban hiring funnel and review side-by-side matches.</p>
          </div>
          <div className="bg-slate-800/20 border border-white/5 hover:border-indigo-500/20 rounded-2xl p-6 transition-all">
            <CheckCircle className="h-10 w-10 text-emerald-400 mb-6" />
            <h3 className="text-lg font-bold mb-3 font-outfit">Digital Onboarding</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">Auto-generate customized PDF offer letters, complete pre-joining checklists, and verify candidate identity docs.</p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-slate-950 py-16 text-center border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center">
            <ShieldCheck className="h-8 w-8 text-indigo-400 mb-2" />
            <span className="text-sm text-slate-400">Role-Based RBAC Security</span>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle className="h-8 w-8 text-indigo-400 mb-2" />
            <span className="text-sm text-slate-400">SQLite / MongoDB Storage</span>
          </div>
          <div className="flex flex-col items-center">
            <Bot className="h-8 w-8 text-indigo-400 mb-2" />
            <span className="text-sm text-slate-400">OpenAI & Gemini API Integration</span>
          </div>
          <div className="flex flex-col items-center">
            <Zap className="h-8 w-8 text-indigo-400 mb-2" />
            <span className="text-sm text-slate-400">Hackathon Presentation Ready</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-xs text-slate-600">
        <p>&copy; {new Date().getFullYear()} TalentAI Systems Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
