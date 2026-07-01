import React from 'react';

interface PipelineStep {
  name: string;
  status: 'done' | 'active' | 'error' | 'pending';
  duration: string;
}

interface PipelineViewProps {
  isDeploying: boolean;
  diagnosticReport: any;
}

export const PipelineView: React.FC<PipelineViewProps> = ({ isDeploying, diagnosticReport }) => {
  const steps: PipelineStep[] = [
    { name: 'Build', status: 'done', duration: '14s' },
    { name: 'Containerize', status: 'done', duration: '18s' },
    { name: 'Push', status: 'done', duration: '9s' },
    { name: 'Pre-flight', status: 'done', duration: '3s' },
    { name: 'Provision', status: isDeploying ? 'active' : 'done', duration: '22s' },
    { name: 'Deploy', status: diagnosticReport ? 'error' : isDeploying ? 'pending' : 'done', duration: '15s' },
    { name: 'Health', status: diagnosticReport ? 'error' : isDeploying ? 'pending' : 'done', duration: '6s' },
    { name: 'Traffic', status: diagnosticReport ? 'error' : isDeploying ? 'pending' : 'done', duration: '4s' },
    { name: 'Complete', status: diagnosticReport ? 'error' : isDeploying ? 'pending' : 'done', duration: '1s' },
  ];

  const statusStyles = {
    done: 'bg-surface-elevated border-gold/30 text-ivory',
    active: 'bg-gold/10 border-gold text-gold',
    error: 'bg-error/10 border-error/50 text-error',
    pending: 'bg-obsidian border-border-subtle text-text-muted',
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-6 animate-fadeIn">
      <h3 className="font-headline-md text-base text-ivory font-semibold mb-4">
        Execution Pipeline
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 font-mono text-[11px]">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border flex flex-col justify-between min-h-[72px] transition-all ${statusStyles[step.status]} ${step.status === 'active' ? 'animate-pulse' : ''}`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold truncate">{step.name}</span>
              {step.status === 'done' && <span className="text-gold text-xs">✓</span>}
              {step.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
              {step.status === 'error' && <span className="text-error">×</span>}
            </div>
            <span className="text-[10px] opacity-60 mt-2">{step.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
