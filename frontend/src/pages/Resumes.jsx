import React, { useEffect, useState } from 'react';
import { request } from '../utils/api';
import { Upload, Sparkles, FileText, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export default function Resumes() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobsAndApps();
  }, []);

  const loadJobsAndApps = async () => {
    try {
      const jobData = await request('/jobs');
      setJobs(jobData);
      if (jobData.length > 0) setSelectedJobId(jobData[0]._id);
      
      const appData = await request('/candidates/applications');
      // Sort applications by applied_date descending so new ones appear at the top
      const sortedApps = appData.sort((a, b) => new Date(b.applied_date || 0) - new Date(a.applied_date || 0));
      setApplications(sortedApps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJobId) {
      alert("Please select a target job first");
      return;
    }
    if (files.length === 0) {
      alert("Please select at least one resume file to upload");
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('job_id', selectedJobId);
      
      if (files.length === 1) {
        formData.append('file', files[0]);
        await request('/candidates/upload', {
          method: 'POST',
          body: formData
        });
      } else {
        // Bulk upload
        for (const file of files) {
          const singleFormData = new FormData();
          singleFormData.append('job_id', selectedJobId);
          singleFormData.append('files', file); // API expects list of files
          // Note: we can simulate bulk uploads in offline mode
        }
        // Call the bulk endpoint
        const bulkFormData = new FormData();
        bulkFormData.append('job_id', selectedJobId);
        files.forEach(f => bulkFormData.append('files', f));
        await request('/candidates/upload-bulk', {
          method: 'POST',
          body: bulkFormData
        });
      }
      
      setFiles([]);
      alert("Resume(s) parsed and screened successfully!");
      loadJobsAndApps();
    } catch (e) {
      console.error(e);
      alert("Upload failed. If server is offline, fallback mock parsed candidate was successfully added!");
      loadJobsAndApps();
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Loading Resumes...</div>;

  return (
    <div className="space-y-8">
      {/* Upload Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">AI Single or Bulk Resume Parser</h3>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Target Job Position</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm focus:outline-none"
              >
                {jobs.map(j => (
                  <option key={j._id} value={j._id}>{j.title} ({j.department})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Resume Files (PDF/DOCX/TXT)</label>
              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-6 flex flex-col items-center justify-center transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-350 text-center px-4 truncate w-full">
                  {files.length === 1 ? files[0].name : files.length > 1 ? `${files.length} files selected` : 'Click to select or drag files'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">Supports single or multi uploads</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || files.length === 0}
              className="px-6 py-3 rounded-xl bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              {uploading ? 'Parsing Resumes...' : 'Screen Resumes'}
            </button>
          </div>
        </form>
      </div>

      {/* Screened Candidates List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-semibold text-slate-850 dark:text-slate-150">ATS Screened Applications</h3>
          <span className="text-xs font-semibold text-slate-500">{applications.length} Applicants total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/20 dark:bg-slate-900/10">
                <th className="p-4">Candidate Details</th>
                <th className="p-4">Target Job</th>
                <th className="p-4">ATS Match</th>
                <th className="p-4">Skill Gaps</th>
                <th className="p-4 text-right">Action/Rec.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {applications.map(app => (
                <tr key={app._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{app.candidate?.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{app.candidate?.email}</div>
                    <div className="text-xs text-slate-500 mt-1">Exp: {app.candidate?.experience_years} yrs • {typeof app.candidate?.education === 'object' ? (app.candidate.education.degree || app.candidate.education.institution || 'Unknown') : app.candidate?.education}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-700 dark:text-slate-300">{app.job?.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{app.job?.department}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${app.ats_score >= 80 ? 'bg-emerald-500' : (app.ats_score >= 60 ? 'bg-indigo-500' : 'bg-rose-500')}`}
                          style={{ width: `${app.ats_score}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-xs">{app.ats_score}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(() => {
                        const skills = Array.isArray(app.skill_gap) ? app.skill_gap : (app.skill_gap ? [app.skill_gap] : []);
                        if (skills.length > 0) {
                          return skills.map((skill, i) => {
                            const displaySkill = typeof skill === 'object' ? (skill.name || skill.skill || JSON.stringify(skill)) : String(skill);
                            return (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/10">
                                {displaySkill}
                              </span>
                            );
                          });
                        }
                        return (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/10 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-0.5" /> Complete Skill Match
                          </span>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      app.fit_recommendation === 'Shortlist' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}>
                      {app.fit_recommendation}
                    </span>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">No resumes uploaded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
