import React, { useEffect, useState } from 'react';
import { request } from '../utils/api';
import { Users, Briefcase, TrendingUp, Sparkles, UserCheck, Clock, Target, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Overview() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Admin/HR specific state
  const [successEval, setSuccessEval] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [apps, setApps] = useState([]);
  
  // Employee specific state
  const [myAttendance, setMyAttendance] = useState([]);
  const [myPerformance, setMyPerformance] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        if (user.role === 'Employee' || user.role === 'Candidate') {
          // Employee simply lands here or interviews
        } else {
          // Load Admin/HR data
          const stats = await request('/analytics/dashboard');
          setData(stats);
          const appList = await request('/candidates/applications');
          setApps(appList);
          if (appList.length > 0) {
            handlePredict(appList[0]._id);
          }
        }
      } catch (e) {
        console.error("Dashboard loading failed", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user.role]);

  const handlePredict = async (appId) => {
    setEvalLoading(true);
    try {
      const res = await request(`/analytics/predict-success/${appId}`);
      setSuccessEval(res);
    } catch (e) {
      console.error(e);
    } finally {
      setEvalLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Loading dashboard...</div>;

  // --- EMPLOYEE DASHBOARD ---
  if (user.role === 'Employee' || user.role === 'Candidate') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Welcome back, {user.name.split(' ')[0]}!</h2>
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm text-slate-600 dark:text-slate-400">
          <p>Please navigate to the Interviews tab to practice or take your scheduled AI assessments.</p>
        </div>
      </div>
    );
  }

  // --- ADMIN / HR DASHBOARD ---
  const funnel = data?.funnel || { Applied: 0, Screening: 0, Interviewing: 0, Offered: 0, Rejected: 0 };
  const maxFunnelVal = Math.max(...Object.values(funnel), 1);

  return (
    <div className="space-y-6">
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Candidates</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{data?.total_candidates}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Job Posts</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{data?.total_jobs}</h3>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Applications</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{data?.total_applications}</h3>
          </div>
          <div className="p-3 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hires Offered</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{funnel.Offered}</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hiring Funnel Stage list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-6">Recruitment Funnel</h3>
          <div className="space-y-4">
            {Object.entries(funnel).map(([stage, val]) => (
              <div key={stage}>
                <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-350 mb-1.5">
                  <span>{stage}</span>
                  <span>{val}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(val / maxFunnelVal) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic SVG Line Chart for Hiring Trends */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm md:col-span-2">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Hiring Trends (Monthly Applicants)</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { name: 'Jan', applicants: 5 },
                  { name: 'Feb', applicants: 10 },
                  { name: 'Mar', applicants: 15 },
                  { name: 'Apr', applicants: 20 },
                  { name: 'May', applicants: 18 },
                  { name: 'Jun', applicants: 25 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#334155' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="applicants" 
                  stroke="#6366f1" 
                  strokeWidth={3.5}
                  dot={{ r: 5.5, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 1.5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advanced AI Feature: Candidate Success Prediction Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">AI Candidate Success Prediction Engine</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Active Applicant</label>
            <div className="space-y-2">
              {apps.slice(0, 5).map(app => (
                <button
                  key={app._id}
                  onClick={() => handlePredict(app._id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    successEval?.candidate_id === app.candidate_id 
                      ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="font-semibold">{app.candidate?.name}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{app.job?.title}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between">
            {evalLoading ? (
              <div className="text-center py-10 text-slate-400">Running AI algorithms...</div>
            ) : successEval ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-bold text-slate-850 dark:text-slate-150">{successEval.name}</h4>
                    <p className="text-xs text-slate-500">Target Role: {successEval.job_title}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    successEval.predicted_success_score >= 80 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    {successEval.success_tier}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-medium mb-1.5">
                    <span className="text-slate-500">Success Probability Metric</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{successEval.predicted_success_score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        successEval.predicted_success_score >= 80 ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${successEval.predicted_success_score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm leading-relaxed text-slate-600 dark:text-slate-350">
                  <span className="font-semibold text-indigo-500 dark:text-indigo-400">AI Evaluation: </span>
                  {successEval.ai_summary}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">Select an applicant to display AI prediction analytics</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
