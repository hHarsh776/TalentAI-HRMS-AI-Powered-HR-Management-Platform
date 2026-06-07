import React, { useEffect, useState } from 'react';
import { request } from '../utils/api';
import { Target, Award, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Performance() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await request('/performance');
      setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Loading performance data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Track KPIs, goals, and performance reviews.</p>
        {(user.role === 'Management Admin' || user.role === 'Senior Manager') && (
          <button className="flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/10 cursor-pointer">
            Create Review
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map(review => (
          <div key={review._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-lg text-slate-850 dark:text-slate-150">{review.review_period} Review</h3>
                <p className="text-xs text-slate-500 mt-1">Generated: {new Date(review.created_at).toLocaleDateString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-indigo-500 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20">
                {review.overall_score}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center"><Target className="w-4 h-4 mr-1.5" /> Key Performance Indicators (KPIs)</h4>
              <div className="space-y-3">
                {review.kpis.map((kpi, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{kpi.goal}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{kpi.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${kpi.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Manager Feedback</h4>
              <p className="text-sm text-slate-600 dark:text-slate-350 italic">"{review.manager_feedback}"</p>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="md:col-span-2 text-center py-12 text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
            No performance reviews found.
          </div>
        )}
      </div>
    </div>
  );
}
