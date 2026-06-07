import React, { useEffect, useState } from 'react';
import { request } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash, Sparkles, MapPin, Briefcase, Calendar, X, AlertCircle } from 'lucide-react';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await request('/jobs');
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!title) {
      alert("Please enter a job title first so AI knows what to generate.");
      return;
    }
    setGenerating(true);
    try {
      const res = await request(`/jobs/generate-description?job_title=${encodeURIComponent(title)}&department=${encodeURIComponent(department)}`, {
        method: 'POST'
      });
      setDescription(res.description);
      setRequirements(res.requirements.join('\n'));
    } catch (e) {
      console.error("AI Generation failed", e);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !location || !description || !requirements) {
      alert("Please fill in all fields");
      return;
    }
    setSaving(true);
    try {
      const reqList = requirements.split('\n').map(r => r.trim()).filter(r => r);
      await request('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title,
          department,
          location,
          type,
          description,
          requirements: reqList
        })
      });
      setModalOpen(false);
      // Reset form
      setTitle('');
      setLocation('');
      setDescription('');
      setRequirements('');
      loadJobs();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this job post?")) {
      try {
        await request(`/jobs/${id}`, { method: 'DELETE' });
        loadJobs();
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Loading jobs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Post new job openings or edit active descriptions.</p>
        {(user?.role === 'Management Admin' || user?.role === 'Senior Manager') && (
          <button 
            onClick={() => setModalOpen(true)}
            className="flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 mr-2" /> Add Job Opening
          </button>
        )}
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map(job => (
          <div key={job._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-850 dark:text-slate-150">{job.title}</h3>
                  <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {job.department}
                  </span>
                </div>
                {(user?.role === 'Management Admin' || user?.role === 'Senior Manager') && (
                  <button 
                    onClick={() => handleDelete(job._id)}
                    className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 shrink-0" /> {job.location}</span>
                <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1 shrink-0" /> {job.type}</span>
                <span className="flex items-center"><Calendar className="h-4 w-4 mr-1 shrink-0" /> {new Date(job.created_at).toLocaleDateString()}</span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed truncate-2-lines">
                {job.description}
              </p>

              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Core Requirements</h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.requirements.map((req, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="md:col-span-2 text-center py-12 text-slate-500">No job openings created yet.</div>
        )}
      </div>

      {/* Create Job Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-xl font-bold text-slate-850 dark:text-slate-150 mb-6">Create New Job Posting</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Job Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Python Developer"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Engineering</option>
                    <option>Data Science</option>
                    <option>Product Management</option>
                    <option>Design</option>
                    <option>Marketing</option>
                    <option>HR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA or Remote"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Job Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Remote</option>
                  </select>
                </div>
              </div>

              {/* AI generator block */}
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
                  <span className="text-xs font-semibold text-slate-650 dark:text-slate-350">Automate Description & Requirements</span>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={generating}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-400 text-xs font-semibold text-white transition-all cursor-pointer flex items-center"
                >
                  {generating ? 'Generating...' : 'AI Auto-Generate'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Job Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  placeholder="Summarize the core roles and responsibilities..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Core Requirements (One per line)</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows="4"
                  placeholder="Python&#10;FastAPI&#10;MongoDB"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex space-x-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/10"
                >
                  {saving ? 'Creating...' : 'Create Job Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
