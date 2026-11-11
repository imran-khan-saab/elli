import React, { useState, useEffect } from 'react';
import { PageId, ToastMessage } from './types/index';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { ToastContainer } from './components/Toast';
import { HelpModal, ConfirmModal, GetStartedModal } from './components/Modals';
import { LoginPage } from './pages/LoginPage';
import { AgentPill, AgentState } from './components/AgentPill';
import { GatekeeperModal } from './components/GatekeeperModal';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { BackupPage } from './pages/BackupPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from './pages/SearchPage';
import { AboutPage } from './pages/AboutPage';
import { db, RLPolicyState } from './utils/database';
import { parseAgentPrompt, calculateRLReward, ActionType } from './utils/rlEngine';
import { VoiceHUD } from './components/VoiceHUD';
import { voiceService } from './utils/voiceService';
import { deviceBridge } from './utils/deviceBridge';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => db.isAuthenticated());
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<'mac' | 'windows' | 'ios' | 'linux'>('windows');

  // Voice Whisper Modal State
  const [isVoiceHUDOpen, setIsVoiceHUDOpen] = useState(false);

  // AI Agent Pill & State Machine
  const [isPillActive, setIsPillActive] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>('IDLE');
  const [currentTask, setCurrentTask] = useState<string>('');
  const [rlState, setRlState] = useState<RLPolicyState>(() => db.getRLState());

  // Gatekeeper Intercept State
  const [gatekeeperPending, setGatekeeperPending] = useState<{
    isOpen: boolean;
    actionType: ActionType;
    targetPath: string;
    previewContent: string;
    userPrompt: string;
    approvalCount: number;
    rawText: string;
  } | null>(null);

  // Last execution output log for Dashboard
  const [lastExecutionLog, setLastExecutionLog] = useState<{
    command: string;
    output: string;
    status: 'success' | 'running';
    time: string;
  } | null>({
    command: 'create a file config.production.json',
    output: '✓ Sandboxed file created at ./agent_workspace/config.production.json. RL Policy reinforced (+1).',
    status: 'success',
    time: 'Just now',
  });

  // Modals
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isGetStartedTourOpen, setIsGetStartedTourOpen] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    description?: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Synchronize Dark Mode class on html root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Handle logout
  const handleLogout = () => {
    db.setCurrentUser(null, null);
    setIsAuthenticated(false);
    setIsPillActive(false);
    addToast('Logged out', 'Session closed. Local state preserved.', 'info');
  };

  // Reinforcement learning feedback helper
  const handleRLFeedback = (actionType: keyof RLPolicyState['actionWeights'], delta: number) => {
    const updated = db.updateRLFeedback(actionType, delta);
    setRlState({ ...updated });
  };

  // Prompt Execution Pipeline (with Gatekeeper and RL engine)
  const handleExecutePrompt = (promptText: string) => {
    if (!promptText.trim()) return;

    setCurrentTask(promptText);
    setAgentState('PLANNING');
    addToast('Planning Action', promptText, 'info');

    const parsed = parseAgentPrompt(promptText);

    setTimeout(() => {
      // Check if action requires Gatekeeper confirmation
      if (parsed.hasSideEffects) {
        setAgentState('AWAITING_GATEKEEPER');

        let previewText = `// Action: ${parsed.actionType}\n// Sandbox target: ${parsed.targetPath}\n// Generated at: ${new Date().toISOString()}\n\nexport const config = {\n  environment: "production",\n  sandboxed: true,\n  rlScore: ${rlState.rewardScore},\n};`;
        if (parsed.actionType === 'DELETE_FILE') {
          previewText = `// Soft-delete action: Move file to ./.agent_trash/\n// File: ${parsed.targetPath}\n// Status: Ready to archive for 30-day restore guarantee.`;
        } else if (parsed.actionType === 'SYSTEM') {
          previewText = `// System Command: ${promptText}\n// Target: Terminate worker daemons and flush memory to disk.\n// State: Sandboxed PID checkpoint verified.`;
        }

        setGatekeeperPending({
          isOpen: true,
          actionType: parsed.actionType,
          targetPath: parsed.targetPath,
          previewContent: previewText,
          userPrompt: promptText,
          approvalCount: 2,
          rawText: promptText,
        });
      } else {
        // Read-only action (FETCH / SUMMARIZE) executes immediately
        completeExecution(parsed.actionType, parsed.targetPath, promptText, `✓ Successfully processed ${parsed.actionType} in sandbox. 0 cloud latency.`);
      }
    }, 500);
  };

  const completeExecution = (actionType: ActionType, targetPath: string, promptText: string, customOutput?: string) => {
    setAgentState('EXECUTING');

    setTimeout(() => {
      const outputText = customOutput || `✓ Action completed: ${actionType} at ${targetPath}. Written to local database.`;

      // 1. Sync file to local device workspace if file operation
      const filename = targetPath.replace(/^.*[\\\/]/, '') || 'workspace_artifact.txt';
      if (actionType === 'CREATE_FILE' || actionType === 'UPDATE_FILE') {
        const fileContent = gatekeeperPending?.previewContent || `// Generated by Ellie Assistant for command: "${promptText}"\n// Path: ${targetPath}\n// Timestamp: ${new Date().toISOString()}\n\nexport const moduleData = {\n  status: "verified",\n  command: "${promptText.replace(/"/g, '\\"')}",\n};\n`;
        deviceBridge.saveWorkspaceFile(filename, fileContent, promptText);
      } else if (actionType === 'DELETE_FILE') {
        deviceBridge.deleteWorkspaceFile(filename);
      }

      // 2. Log to database
      db.addAction({
        userId: db.getCurrentUser()?.id || 'user-1',
        actionType,
        targetPath,
        status: 'EXECUTED',
        previewContent: outputText,
        userPrompt: promptText,
        rlReward: 1,
        tags: [actionType, 'Sandboxed', 'RL-Trained'],
      });

      // 3. Update Reinforcement Learning State (+1 reward)
      const updatedRL = db.updateRLFeedback(actionType as any, 1);
      setRlState({ ...updatedRL });

      // 4. Update Dashboard log
      setLastExecutionLog({
        command: promptText,
        output: outputText,
        status: 'success',
        time: 'Just now',
      });

      // 5. Speak output using Ellie's voice
      const speechSummary = actionType === 'CREATE_FILE'
        ? `I have created the file ${filename} in your workspace.`
        : actionType === 'DELETE_FILE'
        ? `File ${filename} has been moved to trash.`
        : actionType === 'UPDATE_FILE'
        ? `I have updated ${filename}.`
        : `Command executed successfully.`;
      voiceService.speak(speechSummary);

      setAgentState('COMPLETED');
      addToast('Action Executed & Learned', outputText, 'success');

      setTimeout(() => {
        setAgentState('IDLE');
      }, 2500);
    }, 600);
  };

  // Gatekeeper confirm handler
  const handleGatekeeperConfirm = (editedPath?: string, editedContent?: string, rememberPattern?: boolean) => {
    if (!gatekeeperPending) return;

    const path = editedPath || gatekeeperPending.targetPath;
    const actionType = gatekeeperPending.actionType;

    if (rememberPattern) {
      db.recordPatternApproval(actionType, path);
      addToast('Progressive Trust Saved', 'Future matching actions will execute seamlessly.', 'success');
    }

    completeExecution(actionType, path, gatekeeperPending.userPrompt);
    setGatekeeperPending(null);
  };

  // Gatekeeper deny handler
  const handleGatekeeperDeny = () => {
    if (!gatekeeperPending) return;

    // Log denied action to database
    db.addAction({
      userId: db.getCurrentUser()?.id || 'user-1',
      actionType: gatekeeperPending.actionType,
      targetPath: gatekeeperPending.targetPath,
      status: 'DENIED',
      previewContent: 'Action denied by user at Gatekeeper intercept.',
      userPrompt: gatekeeperPending.userPrompt,
      rlReward: -1,
      tags: [gatekeeperPending.actionType, 'Denied'],
    });

    // Penalize RL policy (-1 penalty)
    const updatedRL = db.updateRLFeedback(gatekeeperPending.actionType as any, -1);
    setRlState({ ...updatedRL });

    setLastExecutionLog({
      command: gatekeeperPending.userPrompt,
      output: `✗ Action Denied: Gatekeeper blocked modification to ${gatekeeperPending.targetPath}. RL penalized (-1).`,
      status: 'success',
      time: 'Just now',
    });

    setAgentState('IDLE');
    setGatekeeperPending(null);
    addToast('Action Denied', 'Gatekeeper blocked execution. RL policy tuned (-1).', 'warning');
  };

  // Navigate with prompt to dashboard
  const handleNavigateToDashboardWithPrompt = (prompt: string) => {
    setActivePage('dashboard');
    handleExecutePrompt(prompt);
  };

  // If user is not authenticated, render the dedicated Login Page first
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage
          onLoginSuccess={() => setIsAuthenticated(true)}
          onShowToast={addToast}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className={`min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors`}>
      {/* Left Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => setActivePage(page)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenLogout={() => setIsLogoutOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <TopNav
          activePage={activePage}
          onNavigate={(page) => setActivePage(page)}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          currentPlatform={currentPlatform}
          onStartVoice={() => setIsVoiceHUDOpen(true)}
          onChangePlatform={(plat) => {
            setCurrentPlatform(plat);
            addToast('Workstation Mode Changed', `Switched active device profile to ${plat.toUpperCase()}`, 'info');
          }}
        />

        {/* Main Content Area - changes dynamically when clicking sidebar */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto w-full">
            {activePage === 'dashboard' && (
              <DashboardPage
                onStartAgentPill={() => {
                  setIsPillActive(true);
                  addToast('Ellie AI Agent Activated', 'Floating HUD pill active. Ready for desktop commands.', 'success');
                }}
                isPillActive={isPillActive}
                onExecutePrompt={handleExecutePrompt}
                onShowToast={addToast}
                platform={currentPlatform}
                rlState={rlState}
                onRLFeedback={handleRLFeedback}
                onStartVoice={() => setIsVoiceHUDOpen(true)}
                lastExecutionLog={lastExecutionLog}
              />
            )}

            {activePage === 'search' && (
              <SearchPage
                onShowToast={addToast}
                onNavigateToDashboardWithPrompt={handleNavigateToDashboardWithPrompt}
              />
            )}

            {activePage === 'history' && (
              <HistoryPage
                onShowToast={addToast}
                onNavigateToDashboardWithPrompt={handleNavigateToDashboardWithPrompt}
                onRLFeedback={handleRLFeedback}
              />
            )}

            {activePage === 'backup' && (
              <BackupPage onShowToast={addToast} />
            )}

            {activePage === 'about' && (
              <AboutPage
                onShowToast={addToast}
                platform={currentPlatform}
              />
            )}

            {activePage === 'settings' && (
              <SettingsPage
                isDark={isDark}
                onToggleTheme={() => setIsDark(!isDark)}
                onShowToast={addToast}
              />
            )}

            {activePage === 'profile' && (
              <ProfilePage
                onShowToast={addToast}
                platform={currentPlatform}
              />
            )}
          </div>
        </main>
      </div>

      {/* Floating AI Agent Pill (Activated via "Get Started") */}
      <AgentPill
        isActive={isPillActive}
        onClose={() => setIsPillActive(false)}
        agentState={agentState}
        currentTask={currentTask}
        rlState={rlState}
        onSubmitPrompt={handleExecutePrompt}
        onStartVoice={() => setIsVoiceHUDOpen(true)}
        onOpenGatekeeper={() => {
          if (gatekeeperPending) {
            setGatekeeperPending({ ...gatekeeperPending, isOpen: true });
          }
        }}
      />

      {/* Voice Whisper HUD Modal */}
      <VoiceHUD
        isOpen={isVoiceHUDOpen}
        onClose={() => setIsVoiceHUDOpen(false)}
        onExecuteCommand={handleExecutePrompt}
      />

      {/* Gatekeeper Confirmation Intercept */}
      {gatekeeperPending && (
        <GatekeeperModal
          isOpen={gatekeeperPending.isOpen}
          onClose={() => setGatekeeperPending(null)}
          actionType={gatekeeperPending.actionType}
          targetPath={gatekeeperPending.targetPath}
          previewContent={gatekeeperPending.previewContent}
          userPrompt={gatekeeperPending.userPrompt}
          approvalCount={gatekeeperPending.approvalCount}
          onConfirm={handleGatekeeperConfirm}
          onDeny={handleGatekeeperDeny}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Modals & Dialogs */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <ConfirmModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        title="Confirm Session Logout"
        description="Are you sure you want to log out of Ellie Desktop Assistant? Active local daemons and background watchers will be safely placed in hibernation."
        confirmLabel="Logout and Hibernate"
        variant="danger"
        onConfirm={handleLogout}
      />

      <GetStartedModal
        isOpen={isGetStartedTourOpen}
        onClose={() => setIsGetStartedTourOpen(false)}
      />
    </div>
  );
}
