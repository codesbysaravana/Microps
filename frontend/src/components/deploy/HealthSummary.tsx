import React from 'react';
import { Card } from '../ui/primitives';

export const HealthSummary: React.FC = () => {
  return (
    <Card className="space-y-6 flex flex-col justify-between animate-fadeIn">
      <div>
        <h3 className="font-headline-md text-lg text-ivory font-semibold mb-4">
          Post-Rollout Health Verification
        </h3>
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
    </Card>
  );
};
