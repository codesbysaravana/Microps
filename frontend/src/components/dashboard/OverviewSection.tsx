import React, { useState } from 'react';
import { Card, StatCard, StatusBadge, Toast } from '../ui/primitives';

export interface OverviewSectionProps {
  onNewDeploy?: () => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ onNewDeploy }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'failed' | 'healthy'>('all');

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {toastMessage && (
        <Toast message={toastMessage} type="info" onDismiss={() => setToastMessage(null)} />
      )}

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-headline-md font-semibold text-ivory tracking-tight">
            System Overview & Operations
          </h1>
          <p className="text-xs text-text-secondary font-mono mt-0.5">
            Real-time infrastructure health and active rollout telemetry across global clusters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onNewDeploy}
            className="px-4 py-2 bg-gold hover:bg-gold-hover text-obsidian font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
          >
            + Deploy Microservice
          </button>
        </div>
      </div>

      {/* Promoted Alert Banner for Failed / Critical Deployments */}
      <div className="bg-surface-elevated border-l-4 border-l-error border border-border-subtle rounded-r-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <span className="w-8 h-8 rounded-full bg-error/10 border border-error/40 flex items-center justify-center text-error font-bold text-sm shrink-0">
            !
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-ivory">Incident Detected: dev-data-pipeline</h3>
              <StatusBadge status="failed" label="DOMKilled" />
            </div>
            <p className="text-xs text-text-secondary font-mono mt-1">
              Container terminated unexpectedly during Build phase on worker-node:v2.1.0. Memory allocation limit exceeded.
            </p>
          </div>
        </div>
        <button
          onClick={() => setToastMessage('Autonomous diagnostic report scheduled for dev-data-pipeline.')}
          className="px-4 py-2 bg-obsidian border border-border-subtle hover:border-gold text-ivory text-xs font-mono rounded-lg transition-colors shrink-0"
        >
          Diagnose Root Cause →
        </button>
      </div>

      {/* 4 Metric Cards Grid using StatCard Primitives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Global Health Uptime"
          value="99.99%"
          status="healthy"
          statusText="SLA MET"
          footer={
            <div className="flex justify-between text-xs font-mono text-text-muted">
              <span>Last 30 Days</span>
              <span className="text-gold">0 Outages</span>
            </div>
          }
        />

        <StatCard
          label="Global CPU Load"
          value="42%"
          status="healthy"
          statusText="NOMINAL"
          footer={
            <div className="grid grid-cols-5 gap-1 pt-1">
              <div className="h-1.5 rounded-sm bg-surface-elevated" />
              <div className="h-1.5 rounded-sm bg-surface-elevated" />
              <div className="h-1.5 rounded-sm bg-gold" />
              <div className="h-1.5 rounded-sm bg-surface-elevated" />
              <div className="h-1.5 rounded-sm bg-surface-elevated" />
            </div>
          }
        />

        <StatCard
          label="Memory Allocation"
          value="78%"
          status="warning"
          statusText="ELEVATED"
          footer={
            <div className="grid grid-cols-5 gap-1 pt-1">
              <div className="h-1.5 rounded-sm bg-surface-elevated" />
              <div className="h-1.5 rounded-sm bg-surface-elevated" />
              <div className="h-1.5 rounded-sm bg-surface-elevated" />
              <div className="h-1.5 rounded-sm bg-warning" />
              <div className="h-1.5 rounded-sm bg-surface-elevated" />
            </div>
          }
        />

        <StatCard
          label="Average Network Latency"
          value="12ms"
          status="healthy"
          statusText="OPTIMAL"
          footer={
            <div className="flex justify-between text-xs font-mono text-text-muted">
              <span>Edge Routing</span>
              <span>P99: 28ms</span>
            </div>
          }
        />
      </div>

      {/* Active Deployments & AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Deployments List (2 Cols) */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-subtle">
              <div>
                <h3 className="font-headline-md text-base text-ivory font-semibold">Active Workloads & Rollouts</h3>
                <p className="text-xs text-text-secondary font-mono">Live cluster environments and pipeline stages</p>
              </div>
              <div className="flex items-center gap-1 bg-obsidian p-1 rounded-lg border border-border-subtle font-mono text-[11px]">
                {(['all', 'healthy', 'failed'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveTabFilter(filter)}
                    className={`px-2.5 py-1 rounded capitalize transition-colors ${
                      activeTabFilter === filter ? 'bg-gold text-obsidian font-bold' : 'text-text-secondary hover:text-ivory'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {/* Deployment 1 */}
              {(activeTabFilter === 'all' || activeTabFilter === 'healthy') && (
                <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm font-bold text-ivory">prod-eu-west-1</div>
                      <div className="font-mono text-xs text-text-muted">api-gateway:v3.2.1-rc</div>
                    </div>
                    <StatusBadge status="building" label="DEPLOYING" />
                  </div>
                  <div className="flex items-center justify-between px-2 pt-2 font-mono text-[11px] text-text-muted relative">
                    <div className="absolute top-3 left-6 right-6 h-[1.5px] bg-border-subtle -z-0" />
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div className="w-3 h-3 rounded-full bg-gold" />
                      <span className="text-text-secondary">Build</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div className="w-3 h-3 rounded-full bg-gold" />
                      <span className="text-text-secondary">Test</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div className="w-4 h-4 rounded-full border-2 border-gold bg-obsidian flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                      </div>
                      <span className="text-ivory font-bold">Deploy</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div className="w-3 h-3 rounded-full border border-border-subtle bg-obsidian" />
                      <span className="text-text-muted">Verify</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Deployment 2 */}
              {(activeTabFilter === 'all' || activeTabFilter === 'healthy') && (
                <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm font-bold text-ivory">staging-k8s-cluster</div>
                      <div className="font-mono text-xs text-text-muted">auth-service:v1.9.0-beta</div>
                    </div>
                    <StatusBadge status="testing" label="TESTING" />
                  </div>
                  <div className="flex items-center justify-between px-2 pt-2 font-mono text-[11px] text-text-muted relative">
                    <div className="absolute top-3 left-6 right-6 h-[1.5px] bg-border-subtle -z-0" />
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div className="w-3 h-3 rounded-full bg-info" />
                      <span className="text-text-secondary">Build</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div className="w-4 h-4 rounded-full border-2 border-info bg-obsidian flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-info" />
                      </div>
                      <span className="text-ivory font-bold">Test</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div className="w-3 h-3 rounded-full border border-border-subtle bg-obsidian" />
                      <span className="text-text-muted">Deploy</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div className="w-3 h-3 rounded-full border border-border-subtle bg-obsidian" />
                      <span className="text-text-muted">Verify</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* AI Insight Card (1 Col) */}
        <Card variant="accent" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-gold uppercase tracking-widest mb-3">
              <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>MICROPS AI INSIGHT</span>
            </div>

            <h3 className="font-headline-md text-lg font-semibold text-ivory mb-2 leading-snug">
              Cost Optimization Opportunity
            </h3>

            <p className="text-xs text-text-secondary leading-relaxed mb-6">
              Analysis indicates that <strong className="font-mono text-ivory">k8s-worker-pool-b</strong> is underutilized by 64% during off-peak hours (02:00 - 06:00 UTC).
            </p>
          </div>

          <div>
            <div className="bg-obsidian rounded-lg p-3.5 text-xs font-mono space-y-1.5 mb-4 border border-border-subtle">
              <div className="flex justify-between text-text-secondary">
                <span>Current monthly run rate:</span>
                <span className="font-bold text-ivory">$4,250</span>
              </div>
              <div className="flex justify-between text-gold">
                <span>Projected after scaling:</span>
                <span className="font-bold">$3,120</span>
              </div>
            </div>

            <button
              onClick={() => setToastMessage('Auto-scaling rules successfully applied to k8s-worker-pool-b.')}
              className="w-full py-3 px-4 bg-transparent hover:bg-gold/10 border border-gold/50 text-gold hover:text-gold-hover font-mono font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Apply Auto-Scaling Rules</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
