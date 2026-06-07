import React, { useEffect, useState } from 'react';
import { request } from '../utils/api';
import { DollarSign, Download, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Payroll() {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadPayroll();
  }, []);

  const loadPayroll = async () => {
    try {
      const data = await request('/payroll');
      setPayroll(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Loading payroll data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">View and manage salary distributions and payslips.</p>
        {(user.role === 'Management Admin' || user.role === 'Senior Manager') && (
          <button className="flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/10 cursor-pointer">
            Run Payroll
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {payroll.map(pay => (
          <div key={pay._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-850 dark:text-slate-150 text-lg">Payslip: {pay.month} {pay.year}</h4>
                <p className="text-xs text-slate-500 flex items-center mt-1">
                  <Calendar className="w-3 h-3 mr-1" /> Generated on {new Date(pay.generated_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 items-center">
              <div className="text-right">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Base</div>
                <div className="font-medium text-slate-700 dark:text-slate-300">${pay.base_salary.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Bonuses</div>
                <div className="font-medium text-emerald-600 dark:text-emerald-400">+${pay.bonuses.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Deductions</div>
                <div className="font-medium text-rose-500 dark:text-rose-400">-${pay.deductions.toLocaleString()}</div>
              </div>
              <div className="text-right pl-4 border-l border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Net Pay</div>
                <div className="font-bold text-xl text-slate-850 dark:text-slate-150">${pay.net_salary.toLocaleString()}</div>
              </div>
              
              <button className="p-2 ml-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {payroll.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
            No payroll records found.
          </div>
        )}
      </div>
    </div>
  );
}
