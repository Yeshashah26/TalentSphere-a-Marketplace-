import { getSessionUser } from './session';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function emitUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('talentsphere-update'));
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' };
  const user = getSessionUser();
  if (user?.id) headers['X-User-Id'] = user.id;

  const options = { method, headers };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, options);
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    throw new Error(payload?.error || `Request failed (${res.status})`);
  }

  return payload?.data;
}

export async function findUserByEmail(email) {
  return request(`/users/by-email?email=${encodeURIComponent(email)}`);
}

export async function registerUser(data) {
  const user = await request('/auth/register', { method: 'POST', body: data });
  emitUpdate();
  return user;
}

export async function loginUser(email, password) {
  return request('/auth/login', { method: 'POST', body: { email, password } });
}

export async function getCandidate(userId) {
  try {
    return await request(`/candidates/${userId}`);
  } catch {
    return null;
  }
}

export async function getCompany(userId) {
  try {
    return await request(`/companies/${userId}`);
  } catch {
    return null;
  }
}

export async function updateCandidate(userId, data) {
  const result = await request(`/candidates/${userId}`, { method: 'PATCH', body: data });
  emitUpdate();
  return result;
}

export async function updateCompany(userId, data) {
  const result = await request(`/companies/${userId}`, { method: 'PATCH', body: data });
  emitUpdate();
  return result;
}

export async function createJob(companyUserId, jobData) {
  const job = await request('/jobs', { method: 'POST', body: { companyUserId, ...jobData } });
  emitUpdate();
  return job;
}

export async function getJobs(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.companyUserId) params.set('companyUserId', filters.companyUserId);
  if (filters.approvedOnly) params.set('approvedOnly', 'true');
  const q = params.toString();
  return request(`/jobs${q ? `?${q}` : ''}`);
}

export async function approveJob(jobId, approved) {
  const result = await request(`/jobs/${jobId}/approval`, { method: 'PATCH', body: { approved } });
  emitUpdate();
  return result;
}

export async function applyToJob(candidateUserId, jobId) {
  const app = await request('/applications', { method: 'POST', body: { candidateUserId, jobId } });
  emitUpdate();
  return app;
}

export async function getApplications(filters = {}) {
  const params = new URLSearchParams();
  if (filters.candidateUserId) params.set('candidateUserId', filters.candidateUserId);
  if (filters.companyUserId) params.set('companyUserId', filters.companyUserId);
  const q = params.toString();
  return request(`/applications${q ? `?${q}` : ''}`);
}

export async function updateApplicationStatus(appId, status) {
  const result = await request(`/applications/${appId}/status`, { method: 'PATCH', body: { status } });
  emitUpdate();
  return result;
}

export async function toggleSavedJob(candidateUserId, jobId) {
  const result = await request('/saved-jobs/toggle', { method: 'POST', body: { candidateUserId, jobId } });
  emitUpdate();
  return result;
}

export async function isJobSaved(candidateUserId, jobId) {
  const ids = await getSavedJobIds(candidateUserId);
  return ids.includes(jobId);
}

export async function getSavedJobIds(candidateUserId) {
  return request(`/saved-jobs?candidateUserId=${encodeURIComponent(candidateUserId)}`);
}

export async function toggleSavedCandidate(companyUserId, candidateUserId) {
  const result = await request('/saved-candidates/toggle', {
    method: 'POST',
    body: { companyUserId, candidateUserId },
  });
  emitUpdate();
  return result;
}

export async function getSavedCandidateIds(companyUserId) {
  return request(`/saved-candidates?companyUserId=${encodeURIComponent(companyUserId)}`);
}

export async function sendMessage(payload) {
  const msg = await request('/messages', { method: 'POST', body: payload });
  emitUpdate();
  return msg;
}

export async function getMessages(userId) {
  return request(`/messages?userId=${encodeURIComponent(userId)}`);
}

export async function getNotifications(userId) {
  return request(`/notifications?userId=${encodeURIComponent(userId)}`);
}

export async function getUnreadNotificationCount(userId) {
  return request(`/notifications/unread-count?userId=${encodeURIComponent(userId)}`);
}

export async function markNotificationRead(notifId) {
  const result = await request(`/notifications/${notifId}/read`, { method: 'PATCH' });
  emitUpdate();
  return result;
}

export async function markAllNotificationsRead(userId) {
  const result = await request('/notifications/read-all', { method: 'PATCH', body: { userId } });
  emitUpdate();
  return result;
}

export async function getUserById(userId) {
  return findUserByEmail(''); // not exposed; threads include otherUser
}

export async function getUserDisplayName() {
  return 'Unknown';
}

export async function getMessageThreads(userId) {
  return request(`/messages/threads?userId=${encodeURIComponent(userId)}`);
}

export async function companyHasMessagedCandidate(companyUserId, candidateUserId) {
  const threads = await getMessageThreads(candidateUserId);
  return threads.some((t) => t.otherUserId === companyUserId);
}

export async function canSendMessage(fromUserId, toUserId) {
  const threads = await getMessageThreads(fromUserId);
  const thread = threads.find((t) => t.otherUserId === toUserId);
  if (thread) return { allowed: thread.canReply !== false, reason: thread.canReply === false ? 'You cannot reply in this conversation.' : '' };
  return { allowed: true };
}

export async function replyToThread(payload) {
  const msg = await request('/messages/reply', { method: 'POST', body: payload });
  emitUpdate();
  return msg;
}

export async function getJobWithCompany(jobId) {
  try {
    return await request(`/jobs/${jobId}/with-company`);
  } catch {
    return null;
  }
}

export async function getAllCandidates() {
  return request('/candidates');
}

export async function profileCompletion(candidate, userId) {
  const id = userId || candidate?.userId;
  if (!id) return 0;
  return request(`/profile-completion/candidate?userId=${encodeURIComponent(id)}`);
}

export async function companyProfileCompletion(company, userId) {
  const id = userId || company?.userId;
  if (!id) return 0;
  return request(`/profile-completion/company?userId=${encodeURIComponent(id)}`);
}

export async function getAdminOverview() {
  return request('/admin/overview');
}

export async function getAdminUsers() {
  return request('/admin/users');
}
