import React, { useEffect, useState } from 'react';
import { request } from '../utils/api';
import { ChevronLeft, ChevronRight, Eye, Calendar, Sparkles, X, User, Check, AlertCircle } from 'lucide-react';

export default function Candidates() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [compareData, setCompareData] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [schedulingAppId, setSchedulingAppId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');

  const columns = ['Applied', 'Screening', 'Interviewing', 'Offered', 'Rejected'];

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await request('/candidates/applications');
      setApplications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const moveCandidate = async (appId, currentStatus, direction) => {
    const currentIndex = columns.indexOf(currentStatus);
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= columns.length) return;
    
    const nextStatus = columns[nextIndex];
    try {
      await request(`/candidates/applications/${appId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      loadApplications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectCompare = (candId) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candId)) {
        return prev.filter(id => id !== candId);
      } else {
        if (prev.length >= 3) {
          alert("You can compare up to 3 candidates side-by-side.");
          return prev;
        }
        return [...prev, candId];
      }
    });
  };

  const triggerCompare = async () => {
    if (selectedCandidates.length < 2) {
      alert("Please select at least 2 candidates to compare.");
      return;
    }
    try {
      const idsParam = selectedCandidates.join(',');
      const data = await request(`/candidates/compare?ids=${idsParam}`);
      setCompareData(data);
      setCompareOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleDate) return;
    try {
      await request('/interviews', {
        method: 'POST',
        body: JSON.stringify({
          application_id: schedulingAppId,
          scheduled_at: new Date(scheduleDate).toISOString()
        })
      });
      alert("Interview scheduled and AI questions generated successfully!");
      setSchedulingAppId(null);
      setScheduleDate('');
      loadApplications();
    } catch (e) {
      console.error(e);
      alert("Error scheduling interview.");
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Loading Pipeline...</div>;

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-semibold text-slate-650 dark:text-slate-350">
            Selected for comparison: {selectedCandidates.length}/3
          </span>
          {selectedCandidates.length >= 2 && (
            <button
              onClick={triggerCompare}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Compare Selected
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400">Click checkboxes on cards, then click Compare Selected.</p>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map((colName) => {
          const colApps = applications.filter(app => app.status === colName);
          return (
            <div key={colName} className="flex-1 min-w-[220px] bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{colName}</h4>
                <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
                  {colApps.length}
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] no-scrollbar">
                {colApps.map((app) => (
                  <div key={app._id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(app.candidate_id)}
                          onChange={() => handleSelectCompare(app.candidate_id)}
                          className="h-4 w-4 text-indigo-650 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-150 leading-none">{app.candidate?.name}</h5>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">
                      <div className="truncate font-medium">{app.job?.title}</div>
                      <div className="mt-1 flex items-center justify-between">
                        <span>ATS Score: <strong className="text-indigo-600 dark:text-indigo-400">{app.ats_score}%</strong></span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          app.fit_recommendation === 'Shortlist' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {app.fit_recommendation}
                        </span>
                      </div>
                    </div>

                    {/* Column controls */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        disabled={columns.indexOf(colName) === 0}
                        onClick={() => moveCandidate(app._id, colName, -1)}
                        className="p-1 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-500"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {colName === 'Screening' && (
                        <button
                          onClick={() => setSchedulingAppId(app._id)}
                          className="px-2 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-[10px] font-semibold flex items-center cursor-pointer"
                        >
                          <Calendar className="h-3.5 w-3.5 mr-1" /> Schedule
                        </button>
                      )}

                      <button
                        disabled={columns.indexOf(colName) === columns.length - 1}
                        onClick={() => moveCandidate(app._id, colName, 1)}
                        className="p-1 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-500"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Comparison Modal */}
      {compareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-3xl p-8 shadow-2xl relative">
            <button 
              onClick={() => setCompareOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-2 mb-6">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <h3 className="text-xl font-bold text-slate-850 dark:text-slate-150">Candidate Comparison Report</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Metric / Attribute</th>
                    {compareData.map((cand, i) => (
                      <th key={i} className="p-4 font-bold text-slate-800 dark:text-slate-200 border-l border-slate-200 dark:border-slate-800">
                        {cand.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="p-4 font-semibold text-slate-500">Target Role</td>
                    {compareData.map((cand, i) => (
                      <td key={i} className="p-4 border-l border-slate-200 dark:border-slate-800 font-medium">{cand.job_title}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-slate-500">Experience Years</td>
                    {compareData.map((cand, i) => (
                      <td key={i} className="p-4 border-l border-slate-200 dark:border-slate-800 font-bold">{cand.experience_years} Years</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-slate-500">Education</td>
                    {compareData.map((cand, i) => (
                      <td key={i} className="p-4 border-l border-slate-200 dark:border-slate-800 text-xs">
                        {typeof cand.education === 'object' ? (cand.education.degree || cand.education.institution || 'Unknown') : cand.education}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-slate-500">Key Skills</td>
                    {compareData.map((cand, i) => (
                      <td key={i} className="p-4 border-l border-slate-200 dark:border-slate-800">
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            const skills = Array.isArray(cand.skills) ? cand.skills : (cand.skills ? [cand.skills] : []);
                            return skills.map((s, idx) => {
                              const displaySkill = typeof s === 'object' ? (s.name || s.skill || JSON.stringify(s)) : String(s);
                              return (
                                <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">{displaySkill}</span>
                              );
                            });
                          })()}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-slate-500">Missing Skills (Gap)</td>
                    {compareData.map((cand, i) => (
                      <td key={i} className="p-4 border-l border-slate-200 dark:border-slate-800">
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            const skills = Array.isArray(cand.skill_gap) ? cand.skill_gap : (cand.skill_gap ? [cand.skill_gap] : []);
                            if (skills.length > 0) {
                              return skills.map((s, idx) => {
                                const displaySkill = typeof s === 'object' ? (s.name || s.skill || JSON.stringify(s)) : String(s);
                                return (
                                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-semibold">{displaySkill}</span>
                                );
                              });
                            }
                            return (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-455 font-semibold">None</span>
                            );
                          })()}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-slate-500">ATS Match Score</td>
                    {compareData.map((cand, i) => (
                      <td key={i} className="p-4 border-l border-slate-200 dark:border-slate-800 font-extrabold text-indigo-650 dark:text-indigo-400 text-lg">
                        {cand.ats_score}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-slate-500">AI Recommendation</td>
                    {compareData.map((cand, i) => (
                      <td key={i} className="p-4 border-l border-slate-200 dark:border-slate-800">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          cand.fit_recommendation === 'Shortlist' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {cand.fit_recommendation}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {schedulingAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setSchedulingAppId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-655"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-bold text-lg text-slate-850 dark:text-slate-150 mb-4">Schedule Candidate Interview</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Interview Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSchedulingAppId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
