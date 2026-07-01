import { buildBus } from '../../utils/eventBus';
import { analyzeBuildFailure } from '../diagnostics/diagnostic.engine';

const getOwner = () => process.env.GITHUB_OWNER || 'codesbysaravana';
const getRepo = () => process.env.GITHUB_REPO || 'microps-runner-vault';
const getWorkflowId = () => process.env.GITHUB_WORKFLOW_ID || 'builder.yml';

const getHeaders = () => ({
  'Accept': 'application/vnd.github+json',
  'Authorization': `Bearer ${process.env.GITHUB_PAT}`,
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json',
  'User-Agent': 'MicrOps-Orchestrator',
});

async function triggerGitHubWorkflow(tenantScript: string) {
  const url = `https://api.github.com/repos/${getOwner()}/${getRepo()}/actions/workflows/${getWorkflowId()}/dispatches`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      ref: 'main',
      inputs: {
        tenantScript: tenantScript,
      },
    }),
  });

  if (response.status !== 204) {
    const errText = await response.text();
    throw new Error(`GitHub Actions rejected Trigger with (${response.status}): ${errText}`);
  }

  console.log('[PROVIDER (shh secret)] Successfully dispatched GitHub Actions workflow!');
}

async function getLatestWorkflowRun() {
  await new Promise((r) => setTimeout(r, 3000));

  const url = `https://api.github.com/repos/${getOwner()}/${getRepo()}/actions/workflows/${getWorkflowId()}/runs?event=workflow_dispatch&per_page=1`;

  const response = await fetch(url, {
    headers: getHeaders(),
  });
  const data = await response.json();

  if (data.workflow_runs && data.workflow_runs.length > 0) {
    return data.workflow_runs[0];
  }
  return null;
}

async function pollWorkflowRun(runId: string, jobId: string, userId: number) {
  const runUrl = `https://api.github.com/repos/${getOwner()}/${getRepo()}/actions/runs/${runId}`;
  const jobsUrl = `https://api.github.com/repos/${getOwner()}/${getRepo()}/actions/runs/${runId}/jobs`;
  const seenSteps = new Set<string>();

  while (true) {
    const res = await fetch(runUrl, { headers: getHeaders() });
    const run = await res.json();

    try {
      const jobsRes = await fetch(jobsUrl, { headers: getHeaders() });
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (jobsData.jobs && jobsData.jobs.length > 0) {
          const job = jobsData.jobs[0];
          if (job.steps) {
            for (const step of job.steps) {
              if (step.status === 'completed' && !seenSteps.has(step.number.toString())) {
                seenSteps.add(step.number.toString());
                buildBus.emit('build-progress', {
                  userId,
                  jobId,
                  message: `[GitHub Runner] Step completed: ${step.name} (${step.conclusion})`,
                });
              } else if (step.status === 'in_progress' && !seenSteps.has('exec_' + step.number)) {
                seenSteps.add('exec_' + step.number);
                buildBus.emit('build-progress', {
                  userId,
                  jobId,
                  message: `[GitHub Runner] Step executing: ${step.name}...`,
                });
              }
            }
          }

          if (run.status === 'completed' && run.conclusion !== 'success') {
            let rawLogs = '';
            const logUrl = `https://api.github.com/repos/${getOwner()}/${getRepo()}/actions/jobs/${job.id}/logs`;
            const logRes = await fetch(logUrl, { headers: getHeaders() });
            if (logRes.ok) {
              rawLogs = await logRes.text();
              const tailLogs = rawLogs.split('\n').slice(-15).join('\n');
              buildBus.emit('build-progress', {
                userId,
                jobId,
                message: `\n[Runner Terminal Tail Logs]:\n${tailLogs}\n`,
              });
            }
            const diagnosticReport = await analyzeBuildFailure(rawLogs, jobId);
            buildBus.emit('build-progress', {
              userId,
              ...diagnosticReport,
            });
          }
        }
      }
    } catch (err: any) {
      console.error('[PROVIDER] Error fetching job logs:', err.message);
    }

    if (run.status === 'completed') {
      return {
        buildNumber: run.run_number,
        result: run.conclusion === 'success' ? 'SUCCESS' : 'FAILURE',
        duration: Math.round((new Date(run.updated_at).getTime() - new Date(run.created_at).getTime()) / 1000),
        url: run.html_url,
      };
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

export async function runBuildPipeline(tenantScript: string, jobId: string, userId: number) {
  buildBus.emit('build-progress', { userId, jobId, message: '[GitHub Runner] Dispatching ephemeral container build...' });
  await triggerGitHubWorkflow(tenantScript);

  const run = await getLatestWorkflowRun();

  if (!run) {
    throw new Error('Failed to locate triggered GitHub Actions workflow run.');
  }

  buildBus.emit('build-progress', { userId, jobId, message: `[GitHub Runner] Attached to VM Run #${run.run_number}. Streaming step progress...` });

  return await pollWorkflowRun(run.id, jobId, userId);
}
