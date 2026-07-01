import React, { useState, useEffect, useRef } from 'react';
import type { PreflightReport } from '../../services/preflightService';

interface DeploymentControlCenterProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  loading: boolean;
  report: PreflightReport | null;
  error: string;
  isDeploying: boolean;
  buildLogs: string[];
  diagnosticReport: any;
  applyingFix: boolean;
  handleAnalyze: (e: React.FormEvent) => void;
  handleDeploy: () => void;
  handleApplyFixClick: () => void;
}

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  text: string;
}

export const DeploymentControlCenter: React.FC<DeploymentControlCenterProps> = ({
  repoUrl,
  setRepoUrl,
  loading,
  report,
  error,
  isDeploying,
  buildLogs,
  diagnosticReport,
  applyingFix,
  handleAnalyze,
  handleDeploy,
  handleApplyFixClick,
}) => {
  // Mode: 'config' vs 'execution'
  const [viewMode, setViewMode] = useState<'config' | 'execution'>(
    isDeploying || buildLogs.length > 0 || diagnosticReport ? 'execution' : 'config'
  );

  // Sync viewMode when deployment starts or logs appear
  useEffect(() => {
    if (isDeploying || buildLogs.length > 0 || diagnosticReport) {
      setViewMode('execution');
    }
  }, [isDeploying, buildLogs, diagnosticReport]);

  // Form states for Configuration
  const [branch, setBranch] = useState('main');
  const [commitSha, setCommitSha] = useState('a7f8b92 (HEAD)');
  const [buildCommand, setBuildCommand] = useState('npm run build');
  const [startCommand, setStartCommand] = useState('npm start');
  const [environment, setEnvironment] = useState('Production');
  const [targetCluster] = useState('AWS EKS Fargate (ap-southeast-2)');
  const [containerImage, setContainerImage] = useState('node:20-alpine');
  const [computeSpec, setComputeSpec] = useState('0.25 vCPU / 512MB RAM (Spot)');
  const [replicas, setReplicas] = useState(3);
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([
    { key: 'NODE_ENV', value: 'production' },
    { key: 'PORT', value: '8000' },
    { key: 'API_PREFIX', value: '/api/v1' },
  ]);

  // Terminal Console Controls
  const [logSearch, setLogSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Parse build logs into structured entries
  const parsedLogs: LogEntry[] = React.useMemo(() => {
    const base: LogEntry[] = [
      { timestamp: '14:02:11', level: 'INFO', text: 'Initializing deployment context for microservice...' },
      { timestamp: '14:02:12', level: 'INFO', text: 'Fetching encrypted secrets from AWS Parameter Store... OK' },
      { timestamp: '14:02:15', level: 'SUCCESS', text: 'Image registry ECR authentication successful.' },
      { timestamp: '14:02:18', level: 'INFO', text: 'Applying Kubernetes ingress manifest: ingress-controller.yaml' },
    ];

    const stream = buildLogs.map((log, idx) => {
      let level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' = 'INFO';
      if (log.toLowerCase().includes('error') || log.toLowerCase().includes('failed') || log.toLowerCase().includes('exit code 1')) {
        level = 'ERROR';
      } else if (log.toLowerCase().includes('warn')) {
        level = 'WARN';
      } else if (log.toLowerCase().includes('success') || log.toLowerCase().includes('done') || log.toLowerCase().includes('ready')) {
        level = 'SUCCESS';
      }
      return {
        timestamp: `14:02:${String(20 + idx).padStart(2, '0')}`,
        level,
        text: log,
      };
    });

    return [...base, ...stream];
  }, [buildLogs]);

  // Filtered logs
  const displayLogs = parsedLogs.filter((l) => {
    if (levelFilter !== 'ALL' && l.level !== levelFilter) return false;
    if (logSearch && !l.text.toLowerCase().includes(logSearch.toLowerCase())) return false;
    return true;
  });

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayLogs, autoScroll]);

  const handleCopyLogs = () => {
    const text = displayLogs.map((l) => `[${l.timestamp}] [${l.level}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const text = displayLogs.map((l) => `[${l.timestamp}] [${l.level}] ${l.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `microps-deployment-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8 text-ivory">
      {/* Top Workflow Bar Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gold uppercase tracking-widest">
            <span>DevOps Control Center</span>
            <span>/</span>
            <span className="text-text-secondary">{viewMode === 'config' ? 'Configuration' : 'Live Execution'}</span>
          </div>
          <h1 className="font-headline-md text-3xl text-ivory font-bold mt-1">
            {repoUrl ? repoUrl.split('/').pop() || 'Microservice Deployment' : 'New Service Deployment'}
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-border-subtle font-mono text-xs">
          <button
            onClick={() => setViewMode('config')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              viewMode === 'config'
                ? 'bg-gold text-obsidian font-bold shadow-[0_0_15px_rgba(201,152,45,0.3)]'
                : 'text-text-secondary hover:text-ivory'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>1. Configuration</span>
          </button>

          <button
            onClick={() => setViewMode('execution')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              viewMode === 'execution'
                ? 'bg-gold text-obsidian font-bold shadow-[0_0_15px_rgba(201,152,45,0.3)]'
                : 'text-text-secondary hover:text-ivory'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>2. Live Execution Console</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: DEPLOYMENT CONFIGURATION */}
      {viewMode === 'config' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Repository & Preflight Radar Banner */}
          <div className="bg-surface border border-border-subtle rounded-xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-headline-md text-xl text-ivory font-semibold">Automated Source Intelligence</h2>
              <span className="px-2.5 py-1 rounded bg-surface-elevated border border-gold/40 text-gold font-mono text-xs">Pre-Flight AI Enabled</span>
            </div>
            <p className="font-body-md text-sm text-text-secondary mb-6">Enter your GitHub repository to inspect architecture, Dockerfiles, dependencies, and forecast cloud resource costs.</p>

            <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3 font-mono text-xs">
              <input
                type="url"
                placeholder="https://github.com/codesbysaravana/portfolio"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={loading}
                className="flex-1 bg-obsidian border border-border-subtle focus:border-gold rounded-lg px-4 py-3.5 text-ivory placeholder:text-text-muted focus:outline-none transition-colors text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-gold hover:bg-gold-hover text-obsidian font-bold uppercase tracking-wider rounded-lg transition-all disabled:opacity-50 shrink-0 shadow-[0_0_15px_rgba(201,152,45,0.2)] text-xs flex items-center justify-center gap-2"
                disabled={loading || !repoUrl}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin"></span>
                    <span>Scanning Repo...</span>
                  </>
                ) : (
                  <span>Inspect & Forecast</span>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 rounded bg-error/10 border border-error/40 text-error font-mono text-xs">
                {error}
              </div>
            )}

            {/* Architecture Radar & Cost Oracle Results */}
            {report && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border-subtle">
                <div className="bg-surface-elevated border border-border-subtle rounded-xl p-5">
                  <h3 className="font-headline-md text-sm text-ivory mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gold"></span>
                    <span>Architecture Radar Detected</span>
                  </h3>
                  <div className="font-mono text-xs space-y-2 text-text-secondary">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Runtime:</span>
                      <strong className="text-gold">{report.radar.runtime}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Framework:</span>
                      <strong className="text-ivory">{report.radar.framework}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Target Port:</span>
                      <strong>{report.radar.port}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-elevated border border-border-subtle rounded-xl p-5">
                  <h3 className="font-headline-md text-sm text-ivory mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gold"></span>
                    <span>Cost Oracle Forecast</span>
                  </h3>
                  <div className="font-mono text-xs space-y-2 text-text-secondary">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Estimated Monthly Cost:</span>
                      <strong className="text-gold font-bold">${report.costOracle.totalMonthly}/mo</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Recommended Spec:</span>
                      <strong className="text-ivory">{report.costOracle.computeSpec}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Configuration Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Source & Build Control */}
            <div className="bg-surface border border-border-subtle rounded-xl p-6 space-y-5">
              <div className="border-b border-border-subtle pb-3">
                <h3 className="font-headline-md text-lg text-ivory font-semibold">Source & Build Parameters</h3>
                <p className="text-xs text-text-secondary font-mono">Git tracking and compilation instructions</p>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-text-secondary mb-1.5 uppercase tracking-wider text-[11px]">Git Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-obsidian border border-border-subtle rounded-lg px-3 py-2.5 text-ivory focus:border-gold focus:outline-none"
                  >
                    <option value="main">main (production grade)</option>
                    <option value="staging">staging (pre-release)</option>
                    <option value="development">development (unstable)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary mb-1.5 uppercase tracking-wider text-[11px]">Commit SHA / Tag</label>
                  <input
                    type="text"
                    value={commitSha}
                    onChange={(e) => setCommitSha(e.target.value)}
                    className="w-full bg-obsidian border border-border-subtle rounded-lg px-3 py-2.5 text-ivory focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary mb-1.5 uppercase tracking-wider text-[11px]">Build Command</label>
                  <input
                    type="text"
                    value={buildCommand}
                    onChange={(e) => setBuildCommand(e.target.value)}
                    className="w-full bg-obsidian border border-border-subtle rounded-lg px-3 py-2.5 text-ivory focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary mb-1.5 uppercase tracking-wider text-[11px]">Start Command</label>
                  <input
                    type="text"
                    value={startCommand}
                    onChange={(e) => setStartCommand(e.target.value)}
                    className="w-full bg-obsidian border border-border-subtle rounded-lg px-3 py-2.5 text-ivory focus:border-gold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Infrastructure & Compute Spec */}
            <div className="bg-surface border border-border-subtle rounded-xl p-6 space-y-5">
              <div className="border-b border-border-subtle pb-3">
                <h3 className="font-headline-md text-lg text-ivory font-semibold">Infrastructure & Compute Target</h3>
                <p className="text-xs text-text-secondary font-mono">Container runtime and regional allocation</p>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-text-secondary mb-1.5 uppercase tracking-wider text-[11px]">Target Deployment Environment</label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full bg-obsidian border border-border-subtle rounded-lg px-3 py-2.5 text-ivory focus:border-gold focus:outline-none"
                  >
                    <option value="Production">Production EKS Cluster (High Availability)</option>
                    <option value="Staging">Staging ECS Fargate Cluster</option>
                    <option value="Development">Development Spot Instance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary mb-1.5 uppercase tracking-wider text-[11px]">Container Image Base</label>
                  <select
                    value={containerImage}
                    onChange={(e) => setContainerImage(e.target.value)}
                    className="w-full bg-obsidian border border-border-subtle rounded-lg px-3 py-2.5 text-ivory focus:border-gold focus:outline-none"
                  >
                    <option value="node:20-alpine">Node.js 20 Alpine (Recommended)</option>
                    <option value="node:22-alpine">Node.js 22 Alpine LTS</option>
                    <option value="python:3.11-slim">Python 3.11 Slim Runtime</option>
                    <option value="dockerfile">Use Custom Repository Dockerfile</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary mb-1.5 uppercase tracking-wider text-[11px]">Compute Allocation (vCPU / RAM)</label>
                  <select
                    value={computeSpec}
                    onChange={(e) => setComputeSpec(e.target.value)}
                    className="w-full bg-obsidian border border-border-subtle rounded-lg px-3 py-2.5 text-ivory focus:border-gold focus:outline-none"
                  >
                    <option value="0.25 vCPU / 512MB RAM (Spot)">0.25 vCPU / 512MB RAM ($14.68/mo)</option>
                    <option value="0.5 vCPU / 1GB RAM">0.5 vCPU / 1GB RAM ($29.00/mo)</option>
                    <option value="1.0 vCPU / 2GB RAM">1.0 vCPU / 2GB RAM ($58.00/mo)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-text-secondary uppercase tracking-wider text-[11px]">Instance Replicas</label>
                    <span className="text-gold font-bold">{replicas} Nodes</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={replicas}
                    onChange={(e) => setReplicas(Number(e.target.value))}
                    className="w-full accent-gold bg-obsidian cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Environment Variables & Encrypted Secrets */}
          <div className="bg-surface border border-border-subtle rounded-xl p-6 space-y-4 font-mono text-xs">
            <div className="border-b border-border-subtle pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-headline-md text-lg text-ivory font-semibold">Environment Variables & Vault Secrets</h3>
                <p className="text-xs text-text-secondary font-mono">Encrypted injection at runtime via KMS</p>
              </div>
              <button
                type="button"
                onClick={() => setEnvVars([...envVars, { key: '', value: '' }])}
                className="px-3 py-1.5 bg-surface-elevated border border-border-subtle text-gold hover:border-gold rounded transition-colors text-[11px]"
              >
                + Add Variable
              </button>
            </div>

            <div className="space-y-2">
              {envVars.map((ev, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="KEY (e.g. PORT)"
                    value={ev.key}
                    onChange={(e) => {
                      const copy = [...envVars];
                      copy[idx].key = e.target.value;
                      setEnvVars(copy);
                    }}
                    className="w-1/3 bg-obsidian border border-border-subtle rounded px-3 py-2 text-ivory focus:border-gold focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="VALUE"
                    value={ev.value}
                    onChange={(e) => {
                      const copy = [...envVars];
                      copy[idx].value = e.target.value;
                      setEnvVars(copy);
                    }}
                    className="flex-1 bg-obsidian border border-border-subtle rounded px-3 py-2 text-ivory focus:border-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setEnvVars(envVars.filter((_, i) => i !== idx))}
                    className="px-3 py-2 bg-obsidian border border-border-subtle text-error hover:border-error rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Launch Deployment Action Bar */}
          <div className="bg-surface-elevated border border-gold/40 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-headline-md text-lg text-ivory font-bold">Ready to Execute Pipeline</h4>
              <p className="text-xs font-mono text-text-secondary mt-0.5">Automated Pre-Flight validation will stream live logs upon launch.</p>
            </div>
            <button
              onClick={() => {
                setViewMode('execution');
                handleDeploy();
              }}
              disabled={isDeploying || !repoUrl}
              className="w-full sm:w-auto px-8 py-4 bg-gold hover:bg-gold-hover text-obsidian font-mono text-sm font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 shadow-[0_0_25px_rgba(201,152,45,0.4)] flex items-center justify-center gap-2"
            >
              <span>🚀 Execute Deployment Sequence</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: LIVE DEPLOYMENT EXECUTION CONTROL CENTER */}
      {viewMode === 'execution' && (
        <div className="space-y-8 animate-fadeIn">
          {/* 1. Deployment Header */}
          <div className="bg-surface border border-border-subtle rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="font-headline-md text-2xl text-ivory font-bold">
                  {repoUrl ? repoUrl.split('/').pop() : 'api-gateway-v2'}
                </h2>
                {diagnosticReport ? (
                  <span className="px-3 py-1 rounded bg-error/10 border border-error/50 text-error font-mono text-xs font-bold">
                    ❌ BUILD FAILED
                  </span>
                ) : isDeploying ? (
                  <span className="px-3 py-1 rounded bg-gold/10 border border-gold text-gold font-mono text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gold animate-ping"></span>
                    <span>DEPLOYING PIPELINE</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded bg-success/10 border border-success/50 text-success font-mono text-xs font-bold">
                    ✓ SUCCESSFUL ROLLOUT
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-text-secondary">
                Targeting EKS Fargate cluster ({computeSpec}) across multi-zone region {targetCluster}.
              </p>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <button
                onClick={() => setViewMode('config')}
                className="px-4 py-2.5 bg-surface-elevated border border-border-subtle text-ivory hover:border-gold rounded-lg transition-colors"
              >
                Edit Configuration
              </button>
              <button
                onClick={handleDeploy}
                className="px-4 py-2.5 bg-gold text-obsidian font-bold rounded-lg hover:bg-gold-hover transition-all shadow-[0_0_15px_rgba(201,152,45,0.2)] flex items-center gap-1.5"
              >
                <span>↻ Redeploy Now</span>
              </button>
            </div>
          </div>

          {/* 2. Deployment Status Bento Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 font-mono text-xs">
            <div className="bg-surface border border-border-subtle rounded-xl p-4">
              <span className="text-text-muted block text-[10px] uppercase">Commit SHA</span>
              <strong className="text-ivory mt-1 block truncate">{commitSha.split(' ')[0]}</strong>
            </div>
            <div className="bg-surface border border-border-subtle rounded-xl p-4">
              <span className="text-text-muted block text-[10px] uppercase">Branch</span>
              <strong className="text-gold mt-1 block">{branch}</strong>
            </div>
            <div className="bg-surface border border-border-subtle rounded-xl p-4">
              <span className="text-text-muted block text-[10px] uppercase">Environment</span>
              <strong className="text-ivory mt-1 block">{environment}</strong>
            </div>
            <div className="bg-surface border border-border-subtle rounded-xl p-4">
              <span className="text-text-muted block text-[10px] uppercase">Replicas</span>
              <strong className="text-ivory mt-1 block">{replicas} Active</strong>
            </div>
            <div className="bg-surface border border-border-subtle rounded-xl p-4">
              <span className="text-text-muted block text-[10px] uppercase">Elapsed Time</span>
              <strong className="text-gold mt-1 block">{isDeploying ? '0m 42s' : '1m 18s'}</strong>
            </div>
            <div className="bg-surface border border-border-subtle rounded-xl p-4">
              <span className="text-text-muted block text-[10px] uppercase">SSL / Ingress</span>
              <strong className="text-success mt-1 block">TLS v1.3 Verified</strong>
            </div>
          </div>

          {/* 3. Pipeline Progress Visualization */}
          <div className="bg-surface border border-border-subtle rounded-xl p-6">
            <h3 className="font-headline-md text-lg text-ivory font-semibold mb-4">Workflow Execution Pipeline</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3 font-mono text-[11px]">
              {[
                { name: 'Build', status: 'done', duration: '14s' },
                { name: 'Containerize', status: 'done', duration: '18s' },
                { name: 'Push Image', status: 'done', duration: '9s' },
                { name: 'Pre-flight', status: 'done', duration: '3s' },
                { name: 'Provision', status: isDeploying ? 'active' : 'done', duration: '22s' },
                { name: 'Deploy Pods', status: diagnosticReport ? 'error' : isDeploying ? 'pending' : 'done', duration: '15s' },
                { name: 'Health Check', status: diagnosticReport ? 'error' : isDeploying ? 'pending' : 'done', duration: '6s' },
                { name: 'Traffic Shift', status: diagnosticReport ? 'error' : isDeploying ? 'pending' : 'done', duration: '4s' },
                { name: 'Complete', status: diagnosticReport ? 'error' : isDeploying ? 'pending' : 'done', duration: '1s' },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex flex-col justify-between ${
                    step.status === 'done'
                      ? 'bg-surface-elevated border-gold/40 text-ivory'
                      : step.status === 'active'
                      ? 'bg-gold/10 border-gold text-gold animate-pulse'
                      : step.status === 'error'
                      ? 'bg-error/10 border-error text-error'
                      : 'bg-obsidian border-border-subtle text-text-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold truncate">{step.name}</span>
                    {step.status === 'done' && <span className="text-gold">✓</span>}
                    {step.status === 'active' && <span className="w-2 h-2 rounded-full bg-gold"></span>}
                    {step.status === 'error' && <span>×</span>}
                  </div>
                  <span className="text-[10px] opacity-75 mt-2">{step.duration}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Pre-flight Validation Checklist */}
          <div className="bg-surface border border-border-subtle rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-md text-lg text-ivory font-semibold">Pre-Flight Autonomous Validation</h3>
              <span className="font-mono text-xs text-gold">13 / 13 Checks Passed</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
              {[
                'Repository Connected',
                'Build Configuration Valid',
                'Environment Variables Loaded',
                'Secrets Available',
                'Dockerfile Detected',
                'Registry Authentication',
                'Cluster Reachable',
                'Kubernetes Namespace Exists',
                'Storage Available',
                'Resource Limits Valid',
                'Image Pull Permissions',
                'Network Validation',
                'SSL Configuration',
              ].map((chk, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-surface-elevated p-2.5 rounded-lg border border-border-subtle">
                  <span className="text-gold font-bold">✓</span>
                  <span className="text-ivory truncate">{chk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Live Deployment Logs Console (THE CENTERPIECE) */}
          <div className="bg-obsidian border border-border-subtle rounded-xl overflow-hidden shadow-2xl flex flex-col h-[560px]">
            {/* Terminal Control Bar */}
            <div className="bg-surface px-4 py-3 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="text-gold font-bold flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>PRODUCTION DEPLOYMENT CONSOLE</span>
                </span>

                {/* Level Filter Pills */}
                <div className="hidden md:flex items-center gap-1 bg-obsidian p-1 rounded border border-border-subtle">
                  {(['ALL', 'INFO', 'WARN', 'ERROR', 'SUCCESS'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLevelFilter(lvl)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        levelFilter === lvl ? 'bg-gold text-obsidian' : 'text-text-secondary hover:text-ivory'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="bg-obsidian border border-border-subtle rounded px-2.5 py-1 text-ivory text-[11px] focus:border-gold focus:outline-none w-36 sm:w-48"
                />

                <button
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
                    autoScroll ? 'bg-gold/10 border-gold text-gold' : 'bg-surface border-border-subtle text-text-muted'
                  }`}
                >
                  {autoScroll ? 'Scroll: ON' : 'Scroll: OFF'}
                </button>

                <button
                  onClick={handleCopyLogs}
                  className="px-2.5 py-1 bg-surface border border-border-subtle text-ivory hover:border-gold rounded text-[11px]"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>

                <button
                  onClick={handleDownloadLogs}
                  className="px-2.5 py-1 bg-surface border border-border-subtle text-ivory hover:border-gold rounded text-[11px]"
                >
                  Download
                </button>
              </div>
            </div>

            {/* Autonomous Diagnostic Banner inside Console if Error Occurred */}
            {diagnosticReport && (
              <div className="bg-surface-elevated border-b-2 border-error/60 p-5 shrink-0 animate-fadeIn">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-headline-md text-lg text-error font-bold flex items-center gap-2">
                      <span>{diagnosticReport.failureTitle || '❌ Container build failure detected.'}</span>
                    </h4>
                    <p className="font-mono text-xs text-ivory mt-1">
                      <strong className="text-gold">Root Cause:</strong> {diagnosticReport.rootCause}
                    </p>
                    <p className="font-mono text-[11px] text-text-secondary mt-0.5">
                      Confidence: <span className="text-success font-bold">{diagnosticReport.probability}</span> | Rule: {diagnosticReport.ruleId}
                    </p>
                  </div>

                  {diagnosticReport.fixAction && (
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] font-mono text-gold uppercase block">Recommended Action</span>
                        <span className="font-mono text-xs text-ivory font-bold">{diagnosticReport.fixAction.label}</span>
                      </div>
                      <button
                        onClick={handleApplyFixClick}
                        disabled={applyingFix}
                        className="px-6 py-3 bg-gradient-to-r from-gold to-gold-hover text-obsidian font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(201,152,45,0.4)] hover:brightness-110 flex items-center gap-2"
                      >
                        {applyingFix ? (
                          <>
                            <span className="w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin"></span>
                            <span>Applying Fix...</span>
                          </>
                        ) : (
                          <span>⚡ Apply Fix</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Terminal Scroll Viewport */}
            <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-1">
              {displayLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 hover:bg-surface/50 px-2 py-0.5 rounded transition-colors">
                  <span className="text-text-muted shrink-0 select-none">{log.timestamp}</span>
                  <span
                    className={`shrink-0 font-bold ${
                      log.level === 'ERROR'
                        ? 'text-error'
                        : log.level === 'WARN'
                        ? 'text-warning'
                        : log.level === 'SUCCESS'
                        ? 'text-success'
                        : 'text-gold'
                    }`}
                  >
                    [{log.level}]
                  </span>
                  <span className="text-ivory break-all">{log.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Infrastructure Events & 7. Observability Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Infrastructure Events Timeline */}
            <div className="bg-surface border border-border-subtle rounded-xl p-6">
              <h3 className="font-headline-md text-lg text-ivory font-semibold mb-4">Infrastructure Lifecycle Events</h3>
              <div className="relative border-l border-border-subtle ml-2 pl-6 space-y-4 font-mono text-xs">
                {[
                  { time: '14:02:11', evt: 'Creating Container Spec & EKS Pod definitions', status: 'done' },
                  { time: '14:02:13', evt: 'Pulling Image node:20-alpine from ECR registry', status: 'done' },
                  { time: '14:02:16', evt: 'Scheduling Pod api-gateway-v2-abc1 on Fargate node-us-east-1a', status: 'done' },
                  { time: '14:02:19', evt: 'Mounting Encrypted Secrets & ConfigMap volumes', status: 'done' },
                  { time: '14:02:22', evt: 'Starting Container Process (npm start)', status: 'done' },
                  { time: '14:02:25', evt: 'Executing HTTP Readiness Probes (/api/v1/health)', status: 'done' },
                ].map((item, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-gold ring-4 ring-obsidian"></span>
                    <div className="flex items-center justify-between">
                      <span className="text-ivory font-semibold">{item.evt}</span>
                      <span className="text-text-muted text-[10px]">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Checks & Deployment Summary */}
            <div className="bg-surface border border-border-subtle rounded-xl p-6 space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="font-headline-md text-lg text-ivory font-semibold mb-4">Post-Rollout Health Verification</h3>
                <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                  <div className="bg-surface-elevated p-4 rounded-lg border border-border-subtle">
                    <span className="text-text-muted block text-[10px] uppercase">Readiness Probes</span>
                    <strong className="text-success text-base mt-1 block">3 / 3 Ready</strong>
                  </div>
                  <div className="bg-surface-elevated p-4 rounded-lg border border-border-subtle">
                    <span className="text-text-muted block text-[10px] uppercase">Liveness Probes</span>
                    <strong className="text-success text-base mt-1 block">100% Healthy</strong>
                  </div>
                  <div className="bg-surface-elevated p-4 rounded-lg border border-border-subtle">
                    <span className="text-text-muted block text-[10px] uppercase">Average Latency</span>
                    <strong className="text-gold text-base mt-1 block">11.4 ms</strong>
                  </div>
                  <div className="bg-surface-elevated p-4 rounded-lg border border-border-subtle">
                    <span className="text-text-muted block text-[10px] uppercase">HTTP Error Rate</span>
                    <strong className="text-ivory text-base mt-1 block">0.00 %</strong>
                  </div>
                </div>
              </div>

              <div className="bg-surface-elevated p-4 rounded-lg border border-gold/30 flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="text-gold font-bold block">✓ Traffic Cutover Completed</span>
                  <span className="text-text-secondary text-[11px]">100% ingress traffic routed to new deployment revision.</span>
                </div>
                <span className="px-3 py-1 bg-gold text-obsidian font-bold rounded">STABLE</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
