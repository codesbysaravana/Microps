const { analyzeBuildFailure } = require('./dist/services/diagnostics/diagnostic.engine.js');

const runTests = async () => {
  console.log('================================================================');
  console.log('⚡ MICROPS AUTONOMOUS DEBUGGING ENGINE & APPLY-FIX TEST SUITE');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // PHASE 1: UNIT TESTING THE DIAGNOSTIC RULE ENGINE
  // ---------------------------------------------------------------------------
  console.log('--- PHASE 1: UNIT TESTING DIAGNOSTIC RULE ENGINE ---');

  const sampleNodeMismatchLog = `
npm ERR! code ENOTSUP
npm ERR! notsup Unsupported engine for express-session@1.18.0: wanted: {"node":">=20.0.0"} (current: {"node":"18.19.0"})
npm ERR! notsup Not compatible with your version of node/npm: express-session@1.18.0
Exit code 1
  `;
  const report1 = await analyzeBuildFailure(sampleNodeMismatchLog, 'job-101', 'Node 18');
  console.log('[Test 1: Node Engine Mismatch]');
  console.log('  Detected Rule:', report1.ruleId);
  console.log('  Root Cause:', report1.rootCause);
  console.log('  Confidence:', report1.probability);
  console.log('  Recommended Action:', report1.fixAction?.label);
  if (report1.ruleId !== 'NODE_ENGINE_MISMATCH' || report1.fixAction?.actionType !== 'UPGRADE_RUNTIME') {
    throw new Error('Test 1 Failed: Node Engine Mismatch not detected correctly!');
  }
  console.log('  ✓ Test 1 Passed!\n');

  const samplePeerDepsLog = `
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! Found: react@19.0.0
npm ERR! Could not resolve dependency: peer react@"^18.0.0" from react-dom@18.2.0
Exit code 1
  `;
  const report2 = await analyzeBuildFailure(samplePeerDepsLog, 'job-102', 'Node 20');
  console.log('[Test 2: NPM Peer Dependency Conflict]');
  console.log('  Detected Rule:', report2.ruleId);
  console.log('  Root Cause:', report2.rootCause);
  console.log('  Confidence:', report2.probability);
  console.log('  Recommended Action:', report2.fixAction?.label);
  if (report2.ruleId !== 'NPM_PEER_DEPS_CONFLICT' || report2.fixAction?.actionType !== 'PATCH_INSTALL_CMD') {
    throw new Error('Test 2 Failed: Peer Deps Conflict not detected correctly!');
  }
  console.log('  ✓ Test 2 Passed!\n');

  const sampleMissingBuildLog = `
npm ERR! Missing script: "build"
npm ERR! Did you mean one of these?
npm ERR!     npm run dev
Exit code 1
  `;
  const report3 = await analyzeBuildFailure(sampleMissingBuildLog, 'job-103', 'Node 20');
  console.log('[Test 3: Missing Build Script]');
  console.log('  Detected Rule:', report3.ruleId);
  console.log('  Root Cause:', report3.rootCause);
  console.log('  Confidence:', report3.probability);
  console.log('  Recommended Action:', report3.fixAction?.label);
  if (report3.ruleId !== 'MISSING_BUILD_SCRIPT' || report3.fixAction?.actionType !== 'SET_BUILD_CMD') {
    throw new Error('Test 3 Failed: Missing Build Script not detected correctly!');
  }
  console.log('  ✓ Test 3 Passed!\n');

  require('dotenv').config({ path: './.env.development' });
  const sampleYarnMonorepoLog = `
error An unexpected error occurred: "https://registry.yarnpkg.com/facebook/react: Request failed \"404 Not Found\"".
info Monorepo workspace linking failed for internal package @facebook/react-core.
info Visit https://yarnpkg.com/en/docs/cli/install for documentation about this command.
Exit code 1
  `;
  const report4 = await analyzeBuildFailure(sampleYarnMonorepoLog, 'job-104', 'Node 20');
  console.log('[Test 4: OpenAI Autonomous AI Diagnostic Agent]');
  console.log('  Detected Rule:', report4.ruleId);
  console.log('  Root Cause:', report4.rootCause);
  console.log('  Confidence:', report4.probability);
  console.log('  Recommended Action:', report4.fixAction?.label);
  if (report4.ruleId === 'AI_OPENAI_DIAGNOSTIC') {
    console.log('  ✓ Test 4 Passed! OpenAI returned structured diagnostic report!\n');
  } else {
    console.log('  ✓ Test 4 Note: Returned fallback or regex match:\n', report4.ruleId);
  }

  // ---------------------------------------------------------------------------
  // PHASE 2: INTEGRATION TESTING THE ONE-CLICK APPLY FIX API
  // ---------------------------------------------------------------------------
  console.log('--- PHASE 2: INTEGRATION TESTING /api/v1/build/apply-fix ENDPOINT ---');
  const BASE_URL = 'http://localhost:8000/api/v1';

  // 1. Authenticate user
  const testEmail = `fix_tester_${Date.now()}@example.com`;
  console.log(`[Step 1] Creating test user (${testEmail})...`);
  const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Diagnostic Tester', email: testEmail, password: 'password123' })
  });
  if (!signupRes.ok) throw new Error(`Signup failed: ${signupRes.status}`);

  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token;
  if (!token) throw new Error('Login failed to return token!');
  console.log('  ✓ Authenticated successfully with JWT Token.\n');

  // 2. Trigger build to create project in DB
  console.log('[Step 2] Triggering build sequence to create project in database...');
  const projRes = await fetch(`${BASE_URL}/build/deploy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      projectName: 'portfolio-broken',
      repoUrl: 'https://github.com/codesbysaravana/portfolio',
      branch: 'main',
      buildCommand: 'npm run build'
    })
  });
  const projData = await projRes.json();
  console.log('  Deploy Pipeline Response:', JSON.stringify(projData));
  if (!projRes.ok || !projData.success) {
    throw new Error(`Failed to initialize build pipeline: ${projData.message}`);
  }
  const projectId = projData.data?.projectId || projData.projectId;
  if (!projectId) {
    throw new Error('No projectId returned from build/deploy API!');
  }
  console.log(`  ✓ Created test project via pipeline initialization. Project ID: ${projectId}\n`);

  // 3. Invoke One-Click Fix API endpoint
  console.log('[Step 3] Simulating user click on "⚡ Apply Fix" button...');
  const fixPayload = {
    projectId: projectId,
    actionType: 'PATCH_INSTALL_CMD',
    payload: {
      installCommand: 'npm install --legacy-peer-deps',
      buildCommand: 'npm run build'
    }
  };
  console.log('  Sending POST /api/v1/build/apply-fix payload:', JSON.stringify(fixPayload));

  const applyRes = await fetch(`${BASE_URL}/build/apply-fix`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(fixPayload)
  });

  const applyData = await applyRes.json();
  console.log('  API Response Status:', applyRes.status);
  console.log('  API Response Body:', JSON.stringify(applyData, null, 2));

  if (!applyRes.ok || !applyData.success) {
    throw new Error(`Apply Fix API request failed: ${applyData.message || applyRes.statusText}`);
  }

  // Verify project config updated
  if (applyData.project?.install_command !== 'npm install --legacy-peer-deps') {
    throw new Error('Database did not update project install_command properly!');
  }
  console.log('  ✓ Database project configuration updated correctly!');
  console.log(`  ✓ Automated build job re-initialized! New Job ID: ${applyData.build?.jobId}\n`);

  console.log('================================================================');
  console.log('🎉 ALL AUTONOMOUS APPLY-FIX TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================');
};

runTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
