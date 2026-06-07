import React, { useState, useEffect } from 'react';
import { User, Clock, DollarSign, Activity, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { request } from '../utils/api';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [attendancePercent, setAttendancePercent] = useState(0);
  const [latestPayslip, setLatestPayslip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileData = await request('/employees/me');
        setProfile(profileData);
        
        const attendanceData = await request('/attendance');
        // Assuming ~22 working days in last 30 days
        const percent = Math.min(Math.round((attendanceData.length / 22) * 100), 100);
        setAttendancePercent(percent);

        const payrollData = await request('/payroll');
        if (payrollData.length > 0) {
          // Sort by period_end desc, get latest
          payrollData.sort((a, b) => new Date(b.period_end) - new Date(a.period_end));
          setLatestPayslip(payrollData[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading Employee Data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">My Employee Portal</h1>
          <p className="text-slate-500 mt-1">Welcome, {user?.name || 'Employee'}. View your profile, payroll, and performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
            <User className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user?.name || 'Employee Name'}</h2>
          <p className="text-sm text-slate-500 mb-6">{profile?.job_title || 'Software Engineer'} • {profile?.department || 'IT Department'}</p>
          
          <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-left border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">EMPLOYEE ID</span>
              <span className="text-xs text-slate-800 dark:text-white font-bold">{profile?._id?.substring(0, 8).toUpperCase() || 'EMP-2049'}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">JOIN DATE</span>
              <span className="text-xs text-slate-800 dark:text-white font-bold">{profile?.joining_date || 'Jan 15, 2024'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500 font-semibold">MANAGER ID</span>
              <span className="text-xs text-slate-800 dark:text-white font-bold">{profile?.manager_id || 'Sarah Jenkins'}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-600 dark:text-slate-300">Attendance</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{attendancePercent}%</p>
            <p className="text-xs text-emerald-500 font-medium mt-1">{attendancePercent >= 90 ? 'Excellent punctuality' : 'Needs improvement'}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-600 dark:text-slate-300">Leave Balance</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">12 <span className="text-lg font-normal text-slate-500">days</span></p>
            <p className="text-xs text-slate-500 font-medium mt-1">Available annual leave</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-600 dark:text-slate-300">Performance</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">A-</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Last review: Sep 2024</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-600 dark:text-slate-300">Last Payslip</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">${latestPayslip?.net_pay?.toLocaleString() || '4,850'}</p>
            <p className="text-xs text-slate-500 font-medium mt-1 cursor-pointer hover:text-indigo-500">Download PDF &rarr;</p>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 dark:text-white">Recent Leave Requests</h3>
          <button className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
            Request Leave
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dates</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-slate-100 dark:border-slate-800/50">
                <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">Annual Leave</td>
                <td className="py-3 px-4 text-slate-500">4 days</td>
                <td className="py-3 px-4 text-slate-500">Oct 12, 2024 - Oct 15, 2024</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-md text-xs font-bold">Pending</span>
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800/50">
                <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">Sick Leave</td>
                <td className="py-3 px-4 text-slate-500">2 days</td>
                <td className="py-3 px-4 text-slate-500">Sep 01, 2024 - Sep 02, 2024</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-md text-xs font-bold">Approved</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
