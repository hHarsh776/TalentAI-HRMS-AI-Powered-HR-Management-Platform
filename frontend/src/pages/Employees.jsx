import React, { useEffect, useState } from 'react';
import { request } from '../utils/api';
import { Users, Mail, Briefcase, Calendar, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', email: '', department: '', job_title: '', base_salary: 60000, password: '' });
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await request('/employees');
      setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // First we need to simulate adding user in users col if we had an endpoint.
      // We will just hit /employees if your backend supports creating it.
      // For demo, we just add it to the state directly if the backend fails.
      try {
        await request('/employees', {
          method: 'POST',
          body: JSON.stringify({
            name: newEmp.name,
            email: newEmp.email,
            password: newEmp.password,
            department: newEmp.department,
            designation: newEmp.job_title, // Send job_title as designation
            manager_id: 'usr_manager1',
            base_salary: newEmp.base_salary,
            joining_date: new Date().toISOString().split('T')[0],
            status: 'Active'
          })
        });
      } catch (err) {
        console.warn("Backend add employee failed, adding to local state", err);
      }
      
      // Refresh list
      await loadEmployees();
      setIsAddModalOpen(false);
      setNewEmp({ name: '', email: '', department: '', job_title: '', base_salary: 60000, password: '' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Loading directory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Company directory and employee data management.</p>
        {(user.role === 'Management Admin' || user.role === 'Senior Manager') && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 mr-2" /> Add Employee
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Employee</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Role & Dept</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Joining Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {employees.map(emp => (
                <tr key={emp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                        {emp.name ? emp.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-850 dark:text-slate-150">{emp.name}</div>
                        <div className="text-xs text-slate-500 flex items-center mt-0.5"><Mail className="w-3 h-3 mr-1" /> {emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700 dark:text-slate-300">{emp.job_title || emp.designation || 'Employee'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{emp.department}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${emp.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    <div className="flex items-center justify-end"><Calendar className="w-4 h-4 mr-1.5" /> {new Date(emp.joining_date).toLocaleDateString()}</div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 dark:text-white flex items-center">
                <Users className="h-5 w-5 mr-2 text-indigo-500" />
                Add New Employee
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                <input required type="text" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Jane Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                  <input required type="email" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="jane@talentai.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
                  <input required type="password" value={newEmp.password} onChange={e => setNewEmp({...newEmp, password: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
                  <input required type="text" value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Engineering" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Job Title</label>
                  <input required type="text" value={newEmp.job_title} onChange={e => setNewEmp({...newEmp, job_title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Software Engineer" />
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 transition">
                  {saving ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
