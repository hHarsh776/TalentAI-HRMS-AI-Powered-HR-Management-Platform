import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Jobs from './pages/Jobs';
import Resumes from './pages/Resumes';
import Candidates from './pages/Candidates';
import Interviews from './pages/Interviews';
import Onboarding from './pages/Onboarding';
import EmployeeDashboard from './pages/EmployeeDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import Employees from './pages/Employees';

function DashboardRouter() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Adjust default tab based on role on login
  useEffect(() => {
    if (user) {
      if (user.role === 'Employee') {
        setActiveTab('employee-dashboard');
      } else if (user.role === 'Candidate') {
        setActiveTab('candidate-dashboard');
      } else {
        setActiveTab('overview');
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase font-mono">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <Login />
    ) : (
      <Landing onEnter={() => setShowLogin(true)} />
    );
  }

  // Choose the tab component
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'jobs':
        return <Jobs />;
      case 'resumes':
        return <Resumes />;
      case 'candidates':
        return <Candidates />;
      case 'interviews':
        return <Interviews />;
      case 'onboarding':
        return <Onboarding />;
      case 'employees':
        return <Employees />;
      case 'employee-dashboard':
        return <EmployeeDashboard />;
      case 'candidate-dashboard':
        return <CandidateDashboard />;
      default:
        return <Overview />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DashboardRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}
