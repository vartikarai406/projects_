import React, { useEffect, useState } from 'react';
import { api } from './services/api';
import { User, ApprovalRequest } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ApprovalModal } from './components/ApprovalModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewWorkflowPage } from './pages/NewWorkflowPage';
import { ExecutionDetailPage } from './pages/ExecutionDetailPage';
import { ToolSettingsPage } from './pages/ToolSettingsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { HistoryAuditPage } from './pages/HistoryAuditPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [plannerGoal, setPlannerGoal] = useState<string>('');
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [activeApproval, setActiveApproval] = useState<ApprovalRequest | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Check existing session
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await api.getMe();
        setCurrentUser(user);
      } catch (_) {
        // Not authenticated
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkUser();
  }, []);

  // Poll for pending consequential approvals
  useEffect(() => {
    if (!currentUser) return;
    const checkApprovals = async () => {
      try {
        const list = await api.listApprovals('pending');
        setPendingApprovals(list);
      } catch (_) {}
    };

    checkApprovals();
    const interval = setInterval(checkApprovals, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLogout = () => {
    api.clearToken();
    setCurrentUser(null);
    setCurrentTab('login');
  };

  const handleSelectSampleGoal = (goal: string) => {
    setPlannerGoal(goal);
    setCurrentTab('planner');
  };

  const handleLaunchSuccess = (runId: string) => {
    setActiveRunId(runId);
    setCurrentTab('execution');
  };

  const handleDecideApproval = async (id: string, decision: 'approved' | 'rejected', comments: string) => {
    await api.decideApproval(id, decision, comments);
    setActiveApproval(null);
    const list = await api.listApprovals('pending');
    setPendingApprovals(list);
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center text-xs text-slate-400">
        Initializing AutoPilot AI Platform...
      </div>
    );
  }

  // If on landing page
  if (currentTab === 'landing') {
    return (
      <LandingPage
        onEnterApp={() => setCurrentTab(currentUser ? 'dashboard' : 'login')}
        onSelectSample={(goal) => {
          setPlannerGoal(goal);
          setCurrentTab(currentUser ? 'planner' : 'login');
        }}
      />
    );
  }

  // If unauthenticated or explicitly on login
  if (!currentUser || currentTab === 'login') {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentTab(plannerGoal ? 'planner' : 'dashboard');
        }}
        onBackToLanding={() => setCurrentTab('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        pendingApprovalsCount={pendingApprovals.length}
        onOpenApprovals={() => {
          if (pendingApprovals.length > 0) {
            setActiveApproval(pendingApprovals[0]);
          } else {
            alert("No consequential approvals pending.");
          }
        }}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            if (tab !== 'execution') setActiveRunId(null);
          }}
          onOpenLanding={() => setCurrentTab('landing')}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigate={(tab, runId) => {
                if (runId) setActiveRunId(runId);
                setCurrentTab(tab);
              }}
              onOpenApprovalModal={(taskId) => {
                const app = pendingApprovals.find(a => a.task_id === taskId);
                if (app) setActiveApproval(app);
              }}
            />
          )}

          {currentTab === 'planner' && (
            <NewWorkflowPage
              initialGoal={plannerGoal}
              onLaunchSuccess={handleLaunchSuccess}
            />
          )}

          {currentTab === 'execution' && activeRunId && (
            <ExecutionDetailPage
              runId={activeRunId}
              onBack={() => {
                setActiveRunId(null);
                setCurrentTab('dashboard');
              }}
            />
          )}

          {currentTab === 'templates' && (
            <TemplatesPage
              onSelectGoal={(goal) => {
                setPlannerGoal(goal);
                setCurrentTab('planner');
              }}
            />
          )}

          {currentTab === 'tools' && <ToolSettingsPage />}

          {currentTab === 'history' && <HistoryAuditPage />}

          {currentTab === 'settings' && <SettingsPage user={currentUser} />}
        </main>
      </div>

      {/* Global Consequential Approval Modal */}
      <ApprovalModal
        approval={activeApproval}
        isOpen={activeApproval !== null}
        onClose={() => setActiveApproval(null)}
        onDecide={handleDecideApproval}
      />
    </div>
  );
}

export default App;
