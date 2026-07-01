import React, { useState, useEffect, useRef, useMemo } from 'react';

interface LogConsoleProps {
  buildLogs: string[];
}

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  text: string;
}

export const LogConsole: React.FC<LogConsoleProps> = ({ buildLogs }) => {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const parsedLogs: LogEntry[] = useMemo(() => {
    return buildLogs.map((log, idx) => {
      let level: LogEntry['level'] = 'INFO';
      const lower = log.toLowerCase();
      if (lower.includes('error') || lower.includes('failed') || lower.includes('exit code')) level = 'ERROR';
      else if (lower.includes('warn')) level = 'WARN';
      else if (lower.includes('success') || lower.includes('done') || lower.includes('ready') || lower.includes('✓')) level = 'SUCCESS';

      const now = new Date();
      now.setSeconds(now.getSeconds() + idx);
      const ts = now.toLocaleTimeString('en-GB', { hour12: false });

      return { timestamp: ts, level, text: log };
    });
  }, [buildLogs]);

  const filtered = parsedLogs.filter((l) => {
    if (levelFilter !== 'ALL' && l.level !== levelFilter) return false;
    if (search && !l.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [filtered, autoScroll]);

  const handleCopy = () => {
    const text = filtered.map((l) => `[${l.timestamp}] [${l.level}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = filtered.map((l) => `[${l.timestamp}] [${l.level}] ${l.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `microps-deploy-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const levelColors = {
    INFO: 'text-gold',
    WARN: 'text-warning',
    ERROR: 'text-error',
    SUCCESS: 'text-success',
  };

  const levels = ['ALL', 'INFO', 'WARN', 'ERROR', 'SUCCESS'] as const;

  return (
    <div className="bg-obsidian border border-border-subtle rounded-xl overflow-hidden flex flex-col h-[480px] animate-fadeIn">
      {/* Toolbar */}
      <div className="bg-surface px-4 py-3 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="text-gold font-bold flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            DEPLOYMENT LOGS
          </span>

          {/* Level pills */}
          <div className="hidden md:flex items-center gap-0.5 bg-obsidian p-0.5 rounded border border-border-subtle">
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  levelFilter === lvl ? 'bg-gold text-obsidian' : 'text-text-muted hover:text-ivory'
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
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-obsidian border border-border-subtle rounded px-2.5 py-1 text-ivory text-[11px] focus:border-gold focus:outline-none w-32 sm:w-40"
          />
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 rounded text-[11px] border transition-colors ${
              autoScroll ? 'bg-gold/10 border-gold text-gold' : 'bg-surface border-border-subtle text-text-muted'
            }`}
          >
            {autoScroll ? 'Auto ↓' : 'Manual'}
          </button>
          <button onClick={handleCopy} className="px-2 py-1 bg-surface border border-border-subtle text-ivory hover:border-gold rounded text-[11px] transition-colors">
            {copied ? '✓' : 'Copy'}
          </button>
          <button onClick={handleDownload} className="px-2 py-1 bg-surface border border-border-subtle text-ivory hover:border-gold rounded text-[11px] transition-colors">
            ↓
          </button>
        </div>
      </div>

      {/* Log viewport */}
      <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-0.5">
        {filtered.length === 0 ? (
          <div className="text-text-muted text-center py-8">
            {buildLogs.length === 0 ? 'Waiting for deployment logs...' : 'No logs match your filter.'}
          </div>
        ) : (
          filtered.map((log, i) => (
            <div key={i} className="flex items-start gap-3 hover:bg-surface/30 px-2 py-0.5 rounded transition-colors">
              <span className="text-text-muted shrink-0 select-none w-16">{log.timestamp}</span>
              <span className={`shrink-0 font-bold w-16 ${levelColors[log.level]}`}>[{log.level}]</span>
              <span className="text-ivory break-all">{log.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
