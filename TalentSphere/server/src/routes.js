import { Router } from 'express';
import * as db from './dataService.js';
import { sanitizeUser, ok, fail } from './utils.js';

const router = Router();

router.post('/auth/register', (req, res) => {
  try {
    const user = db.registerUser(req.body);
    ok(res, sanitizeUser(user), 201);
  } catch (e) {
    fail(res, e.message);
  }
});

router.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.loginUser(email, password);
    ok(res, sanitizeUser(user));
  } catch (e) {
    fail(res, e.message, 401);
  }
});

router.get('/users/by-email', (req, res) => {
  const user = db.findUserByEmail(req.query.email || '');
  if (!user) return fail(res, 'User not found', 404);
  ok(res, sanitizeUser(user));
});

router.get('/candidates', (_req, res) => ok(res, db.getAllCandidates()));

router.get('/candidates/:userId', (req, res) => {
  const c = db.getCandidate(req.params.userId);
  if (!c) return fail(res, 'Candidate not found', 404);
  ok(res, c);
});

router.patch('/candidates/:userId', (req, res) => {
  db.updateCandidate(req.params.userId, req.body);
  ok(res, db.getCandidate(req.params.userId));
});

router.get('/companies/:userId', (req, res) => {
  const c = db.getCompany(req.params.userId);
  if (!c) return fail(res, 'Company not found', 404);
  ok(res, c);
});

router.patch('/companies/:userId', (req, res) => {
  db.updateCompany(req.params.userId, req.body);
  ok(res, db.getCompany(req.params.userId));
});

router.get('/jobs', (req, res) => {
  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.companyUserId) filters.companyUserId = req.query.companyUserId;
  if (req.query.approvedOnly === 'true') filters.approvedOnly = true;
  ok(res, db.getJobs(filters));
});

router.get('/jobs/:jobId/with-company', (req, res) => {
  const info = db.getJobWithCompany(req.params.jobId);
  if (!info) return fail(res, 'Job not found', 404);
  ok(res, info);
});

router.post('/jobs', (req, res) => {
  try {
    const { companyUserId, ...jobData } = req.body;
    const job = db.createJob(companyUserId, jobData);
    ok(res, job, 201);
  } catch (e) {
    fail(res, e.message);
  }
});

router.patch('/jobs/:jobId/approval', (req, res) => {
  db.approveJob(req.params.jobId, Boolean(req.body.approved));
  ok(res, { success: true });
});

router.get('/applications', (req, res) => {
  const filters = {};
  if (req.query.candidateUserId) filters.candidateUserId = req.query.candidateUserId;
  if (req.query.companyUserId) filters.companyUserId = req.query.companyUserId;
  ok(res, db.getApplications(filters));
});

router.post('/applications', (req, res) => {
  try {
    const { candidateUserId, jobId } = req.body;
    const app = db.applyToJob(candidateUserId, jobId);
    ok(res, app, 201);
  } catch (e) {
    fail(res, e.message);
  }
});

router.patch('/applications/:appId/status', (req, res) => {
  db.updateApplicationStatus(req.params.appId, req.body.status);
  ok(res, { success: true });
});

router.post('/saved-jobs/toggle', (req, res) => {
  const { candidateUserId, jobId } = req.body;
  db.toggleSavedJob(candidateUserId, jobId);
  ok(res, { saved: db.isJobSaved(candidateUserId, jobId) });
});

router.get('/saved-jobs', (req, res) => {
  ok(res, db.getSavedJobIds(req.query.candidateUserId));
});

router.post('/saved-candidates/toggle', (req, res) => {
  const { companyUserId, candidateUserId } = req.body;
  db.toggleSavedCandidate(companyUserId, candidateUserId);
  ok(res, { success: true });
});

router.get('/saved-candidates', (req, res) => {
  ok(res, db.getSavedCandidateIds(req.query.companyUserId));
});

router.get('/messages', (req, res) => {
  ok(res, db.getMessages(req.query.userId));
});

router.get('/messages/threads', (req, res) => {
  ok(res, db.getMessageThreads(req.query.userId));
});

router.post('/messages', (req, res) => {
  try {
    const msg = db.sendMessage(req.body);
    ok(res, msg, 201);
  } catch (e) {
    fail(res, e.message);
  }
});

router.post('/messages/reply', (req, res) => {
  try {
    const msg = db.replyToThread(req.body);
    ok(res, msg, 201);
  } catch (e) {
    fail(res, e.message);
  }
});

router.get('/notifications', (req, res) => {
  ok(res, db.getNotifications(req.query.userId));
});

router.get('/notifications/unread-count', (req, res) => {
  ok(res, db.getUnreadNotificationCount(req.query.userId));
});

router.patch('/notifications/:id/read', (req, res) => {
  db.markNotificationRead(req.params.id);
  ok(res, { success: true });
});

router.patch('/notifications/read-all', (req, res) => {
  db.markAllNotificationsRead(req.body.userId);
  ok(res, { success: true });
});

router.get('/profile-completion/candidate', (req, res) => {
  const c = db.getCandidate(req.query.userId);
  ok(res, db.profileCompletion(c));
});

router.get('/profile-completion/company', (req, res) => {
  const c = db.getCompany(req.query.userId);
  ok(res, db.companyProfileCompletion(c));
});

router.get('/admin/overview', (_req, res) => {
  const data = db.loadDb();
  ok(res, {
    users: data.users.length,
    candidates: data.candidates.length,
    companies: data.companies.length,
    pendingJobs: data.jobs.filter((j) => j.status === 'pending').length,
  });
});

router.get('/admin/users', (_req, res) => {
  const data = db.loadDb();
  ok(res, data.users.map(sanitizeUser));
});

export default router;
