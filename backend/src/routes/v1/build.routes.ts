import { Router } from 'express';
import { handleBuildAndDeploy, handleBuildStream, handleApplyFix } from '../../controllers/build.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

// Endpoint to trigger the build pipeline
router.post('/deploy', requireAuth, handleBuildAndDeploy);

// SSE Endpoint for streaming logs
router.get('/stream', requireAuth, handleBuildStream);

// One-Click Fix remediation endpoint
router.post('/apply-fix', requireAuth, handleApplyFix);

export default router;
