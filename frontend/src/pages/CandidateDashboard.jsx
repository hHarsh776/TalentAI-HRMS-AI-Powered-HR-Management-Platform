import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Target, FileText, Video, UploadCloud, CheckCircle, Clock, Loader2 } from 'lucide-react';
import AIInterviewModal from '../components/AIInterviewModal';
import { API_BASE } from '../utils/api';

export default function CandidateDashboard() {
  const { user, token } = useAuth();
  
  // State for Interview Modal
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [interviewResult, setInterviewResult] = useState(null);
  
  // State for Resume Analysis
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [resumeData, setResumeData] = useState({
    ats_score: 88,
    skill_matches: ["Python", "FastAPI", "Docker"],
    feedback: ["Clear leadership experience formatting", "Suggestion: Add metrics to your recent achievements"]
  });

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch(`${API_BASE}/candidates/analyze_resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data && data.ats_score) {
        setResumeData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Candidate Portal</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.name || 'Jane Doe'}. Track your applications and interviews here.</p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-600 dark:text-slate-300">ATS Match Score</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{resumeData.ats_score}%</p>
          <p className="text-xs text-indigo-500 font-medium mt-1">Based on recent upload</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-600 dark:text-slate-300">Applications</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">3</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Active submissions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
              <Video className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-600 dark:text-slate-300">Interview Score</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">
            {interviewResult ? `${interviewResult.communication_score} / 100` : 'Pending'}
          </p>
          <p className="text-xs text-emerald-500 font-medium mt-1">
            {interviewResult ? 'Completed successfully' : 'Awaiting action'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Applications */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">My Applications</h3>
          <div className="space-y-4">
            {[
              { role: 'Senior Python Developer', status: 'Interviewing', date: 'Oct 12' },
              { role: 'Lead Data Analyst', status: 'Under Review', date: 'Oct 05' },
              { role: 'Frontend Engineer', status: 'Applied', date: 'Sep 28' },
            ].map((app, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-white">{app.role}</p>
                  <p className="text-xs text-slate-500 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" /> Applied {app.date}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                  app.status === 'Interviewing' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' :
                  app.status === 'Under Review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                  'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* AI Interview */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 shadow-lg text-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Video Interview</h3>
                <p className="text-indigo-100 text-sm">Action Required</p>
              </div>
            </div>
            <p className="text-sm text-indigo-50 mb-6">
              {interviewResult ? 'Your AI Interview has been completed. Check your score above.' : 'You have a pending AI Interview for the Senior Python Developer role. The interview will take approximately 15 minutes.'}
            </p>
            {!interviewResult && (
              <div className="flex space-x-3">
                <button onClick={() => setInterviewOpen(true)} className="px-5 py-2.5 bg-white text-indigo-600 font-bold rounded-xl text-sm shadow-sm hover:bg-slate-50 transition-colors">
                  Start Interview
                </button>
              </div>
            )}
          </div>

          {/* Resume Analysis */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Resume Analysis</h3>
            
            <input 
              type="file" 
              accept=".pdf,.docx" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleResumeUpload} 
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center text-center mb-4 bg-slate-50 dark:bg-slate-800/30 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer'}`}
            >
              {uploading ? <Loader2 className="h-8 w-8 text-indigo-500 mb-2 animate-spin" /> : <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />}
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {uploading ? 'Analyzing with AI...' : 'Upload new resume'}
              </p>
              <p className="text-xs text-slate-500 mt-1">PDF or DOCX (Max 5MB)</p>
            </div>
            
            <div className="space-y-3">
              {resumeData.skill_matches.map((skill, i) => (
                <div key={`skill-${i}`} className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">Strong match: {skill}</span>
                </div>
              ))}
              {resumeData.feedback.map((fb, i) => (
                <div key={`fb-${i}`} className="flex items-start text-sm">
                  <Target className="h-4 w-4 text-amber-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">{fb}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <AIInterviewModal 
        isOpen={interviewOpen} 
        onClose={() => setInterviewOpen(false)} 
        onComplete={(result) => setInterviewResult(result)} 
      />
    </div>
  );
}
