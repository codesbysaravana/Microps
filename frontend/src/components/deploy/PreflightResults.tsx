import React from 'react';
import type { PreflightReport } from '../../services/preflightService';
import { Card } from '../ui/primitives';

interface PreflightResultsProps {
  report: PreflightReport;
}

export const PreflightResults: React.FC<PreflightResultsProps> = ({ report }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
      {/* Architecture Radar */}
      <Card>
        <h3 className="font-headline-md text-sm text-ivory mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold" />
          Architecture Radar
        </h3>
        <div className="font-mono text-xs space-y-3 text-text-secondary">
          <div className="flex justify-between">
            <span className="text-text-muted">Runtime</span>
            <strong className="text-gold">{report.radar.runtime}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Framework</span>
            <strong className="text-ivory">{report.radar.framework}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Port</span>
            <strong className="text-ivory">{report.radar.port}</strong>
          </div>
        </div>
      </Card>

      {/* Cost Oracle */}
      <Card>
        <h3 className="font-headline-md text-sm text-ivory mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold" />
          Cost Oracle
        </h3>
        <div className="font-mono text-xs space-y-3 text-text-secondary">
          <div className="flex justify-between">
            <span className="text-text-muted">Monthly Estimate</span>
            <strong className="text-gold font-bold">${report.costOracle.totalMonthly}/mo</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Compute Spec</span>
            <strong className="text-ivory">{report.costOracle.computeSpec}</strong>
          </div>
        </div>
      </Card>
    </div>
  );
};
