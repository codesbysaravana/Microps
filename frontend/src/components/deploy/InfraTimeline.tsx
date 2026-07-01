import React from 'react';
import { Card } from '../ui/primitives';

export const InfraTimeline: React.FC = () => {
  const events = [
    { time: '14:02:11', evt: 'Creating Container Spec & EKS Pod definitions', status: 'done' },
    { time: '14:02:13', evt: 'Pulling Image node:20-alpine from ECR registry', status: 'done' },
    { time: '14:02:16', evt: 'Scheduling Pod api-gateway-v2-abc1 on Fargate node-us-east-1a', status: 'done' },
    { time: '14:02:19', evt: 'Mounting Encrypted Secrets & ConfigMap volumes', status: 'done' },
    { time: '14:02:22', evt: 'Starting Container Process (npm start)', status: 'done' },
    { time: '14:02:25', evt: 'Executing HTTP Readiness Probes (/api/v1/health)', status: 'done' },
  ];

  return (
    <Card className="animate-fadeIn">
      <h3 className="font-headline-md text-lg text-ivory font-semibold mb-4">
        Infrastructure Lifecycle Events
      </h3>
      <div className="relative border-l border-border-subtle ml-2 pl-6 space-y-4 font-mono text-xs">
        {events.map((item, idx) => (
          <div key={idx} className="relative">
            <span className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-gold ring-4 ring-obsidian" />
            <div className="flex items-center justify-between">
              <span className="text-ivory font-semibold">{item.evt}</span>
              <span className="text-text-muted text-[10px]">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
