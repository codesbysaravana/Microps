import React from 'react';
import { StatusBadge } from '../ui/primitives';

interface DeployHeaderProps {
  repoUrl: string;
  viewMode: 'config' | 'execution';
  setViewMode: (mode: 'config' | 'execution') => void;
  isDeploying: boolean;
  diagnosticReport: any;
}

export const DeployHeader: React.FC<DeployHeaderProps> = ({
  repoUrl,
  viewMode,
  setViewMode,
  isDeploying,
  diagnosticReport,
}) => {
  const repoName = repoUrl ? repoUrl.split('/').pop() || 'Microservice' : 'New Deployment';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-border-subtle">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted uppercase tracking-widest mb-1">
          <span>Deployments</span>
          <span className="text-border-subtle">/</span>
          <span className="text-gold">{viewMode === 'config' ? 'Configure' : 'Execute'}</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-headline-md text-ivory font-bold tracking-tight">
            {repoName}
          </h1>
          {isDeploying && <StatusBadge status="deploying" />}
          {diagnosticReport && <StatusBadge status="failed" label="Build Failed" />}
          {!isDeploying && !diagnosticReport && repoUrl && <StatusBadge status="success" label="Ready" />}
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center bg-surface rounded-lg border border-border-subtle p-1 font-mono text-xs">
        <button
          onClick={() => setViewMode('config')}
          className={`px-4 py-2 rounded-md transition-all ${
            viewMode === 'config'
              ? 'bg-gold text-obsidian font-bold'
              : 'text-text-secondary hover:text-ivory'
          }`}
        >
          Configure
        </button>
        <button
          onClick={() => setViewMode('execution')}
          className={`px-4 py-2 rounded-md transition-all ${
            viewMode === 'execution'
              ? 'bg-gold text-obsidian font-bold'
              : 'text-text-secondary hover:text-ivory'
          }`}
        >
          Execution
        </button>
      </div>
    </div>
  );
};
