import React, { useEffect, useState } from 'react';
import { request } from '../utils/api';
import { Clock, CheckCircle, AlertCircle, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [clockingIn, setClockingIn] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const data = await request('/attendance');
      setAttendance(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    setClockingIn(true);
    try {
      await request('/attendance/clock-in', { method: 'POST' });
      loadAttendance();
    } catch (e) {
      alert("Clock-in failed or already clocked in.");
    } finally {
      setClockingIn(false);
    }
  };

  const handleClockOut = async () => {
    setClockingIn(true);
    try {
      await request('/attendance/clock-out', { method: 'POST' });
      loadAttendance();
    } catch (e) {
      alert("Clock-out failed.");
    } finally {
      setClockingIn(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Loading attendance data...</div>;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find(a => a.date === todayStr && a.employee_id.includes(user._id.replace('user', 'emp'))); // basic matching heuristic

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Track daily clock-ins and clock-outs.</p>
        
        {user.role === 'Employee' && (
          <div className="flex space-x-3">
            <button 
              onClick={handleClockIn}
              disabled={clockingIn}
              className="flex items-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold shadow-md shadow-emerald-600/10 transition-colors"
            >
              <LogIn className="h-4.5 w-4.5 mr-2" /> Clock In
            </button>
            <button 
              onClick={handleClockOut}
              disabled={clockingIn}
              className="flex items-center px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold transition-colors"
            >
              <LogOut className="h-4.5 w-4.5 mr-2" /> Clock Out
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center"><Clock className="mr-2 text-indigo-500" /> Attendance History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase text-xs">Date</th>
                <th className="px-4 py-3 font-semibold uppercase text-xs">Clock In</th>
                <th className="px-4 py-3 font-semibold uppercase text-xs">Clock Out</th>
                <th className="px-4 py-3 font-semibold uppercase text-xs">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {attendance.map(att => (
                <tr key={att._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                  <td className="px-4 py-4 font-medium text-slate-850 dark:text-slate-150">{att.date}</td>
                  <td className="px-4 py-4 text-emerald-600 dark:text-emerald-400 font-medium">
                    {new Date(att.clock_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="px-4 py-4 text-rose-600 dark:text-rose-400 font-medium">
                    {att.clock_out ? new Date(att.clock_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                      {att.status}
                    </span>
                  </td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-slate-500">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
