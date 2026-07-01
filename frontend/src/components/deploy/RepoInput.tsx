import React from 'react';

interface RepoInputProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  loading: boolean;
  error: string;
  handleAnalyze: (e: React.FormEvent) => void;
}

export const RepoInput: React.FC<RepoInputProps> = ({
  repoUrl,
  setRepoUrl,
  loading,
  error,
  handleAnalyze,
}) => {
  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-gold/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-2">
        <h2 className="font-headline-md text-lg text-ivory font-semibold">
          Source Repository
        </h2>
        <span className="px-2.5 py-1 rounded bg-surface-elevated border border-gold/30 text-gold font-mono text-[11px]">
          Pre-Flight AI
        </span>
      </div>
      <p className="text-sm text-text-secondary mb-6">
        Enter a GitHub repository URL to analyze architecture and forecast cloud costs.
      </p>

      <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          placeholder="https://github.com/org/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          disabled={loading}
          className="flex-1 bg-obsidian border border-border-subtle focus:border-gold rounded-lg px-4 py-3 text-ivory text-sm font-mono placeholder:text-text-muted focus:outline-none transition-colors"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-gold hover:bg-gold-hover text-obsidian font-bold text-xs uppercase tracking-wider rounded-lg transition-all disabled:opacity-50 shrink-0 font-mono flex items-center justify-center gap-2"
          disabled={loading || !repoUrl}
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <span>Analyze</span>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error font-mono text-xs">
          {error}
        </div>
      )}
    </div>
  );
};
