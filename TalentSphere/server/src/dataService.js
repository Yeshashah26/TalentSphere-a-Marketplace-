import { loadDb, saveDb, uid } from './storage.js';

function update(mutator) {
  const db = loadDb();
  mutator(db);
  saveDb(db);
  return db;
}

export { loadDb };

export function findUserByEmail(email) {
  return loadDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function registerUser({ email, password, role, profile }) {
  if (findUserByEmail(email)) {
    throw new Error('An account with this email already exists.');
  }
  const userId = uid('user');
  const user = { id: userId, email, password, role, name: profile.name || profile.companyName || email };

  update((db) => {
    db.users.push(user);
    if (role === 'candidate') {
      db.candidates.push({
        userId,
        email,
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        jobTitle: profile.jobTitle || '',
        yearsExp: profile.yearsExp || 0,
        monthsExp: profile.monthsExp || 0,
        skills: profile.skills || [],
        linkedin: profile.linkedin || '',
        portfolio: profile.portfolio || '',
        education: profile.education || '',
        graduationYear: profile.graduationYear || '',
        openToWork: profile.openToWork ?? true,
        profilePhoto: profile.profilePhoto || '',
        resume: profile.resume || '',
        resumeFileName: profile.resumeFileName || '',
        resumeMimeType: profile.resumeMimeType || '',
        professionalSummary: profile.professionalSummary || '',
        profileStatus: 'Active',
        createdAt: new Date().toISOString(),
      });
    } else if (role === 'company') {
      db.companies.push({
        userId,
        companyName: profile.companyName || '',
        industry: profile.industry || [],
        companyEmail: email,
        hqCountry: profile.hqCountry || '',
        yearFounded: profile.yearFounded || '',
        companyType: profile.companyType || '',
        website: profile.website || '',
        linkedinName: profile.linkedinName || '',
        linkedinUrl: profile.linkedinUrl || '',
        linkedinLogo: profile.linkedinLogo || '',
        recentJobTitle: profile.recentJobTitle || '',
        recentJobCount: profile.recentJobCount || 0,
        officeAddresses: profile.officeAddresses || '',
        subscriptionPlan: profile.subscriptionPlan || 'Free',
        verificationStatus: 'Pending',
        createdAt: new Date().toISOString(),
      });
    }
  });

  return user;
}

export function loginUser(email, password) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password.');
  }
  return user;
}

export function getCandidate(userId) {
  return loadDb().candidates.find((c) => c.userId === userId);
}

export function getCompany(userId) {
  return loadDb().companies.find((c) => c.userId === userId);
}

export function updateCandidate(userId, data) {
  update((db) => {
    const i = db.candidates.findIndex((c) => c.userId === userId);
    if (i >= 0) {
      db.candidates[i] = { ...db.candidates[i], ...data, updatedAt: new Date().toISOString() };
      const user = db.users.find((u) => u.id === userId);
      if (user && data.fullName) user.name = data.fullName;
    }
  });
}

export function updateCompany(userId, data) {
  update((db) => {
    const i = db.companies.findIndex((c) => c.userId === userId);
    if (i >= 0) db.companies[i] = { ...db.companies[i], ...data };
  });
}

export function createJob(companyUserId, jobData) {
  const job = {
    id: uid('job'),
    companyUserId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...jobData,
  };
  update((db) => {
    db.jobs.push(job);
    const company = db.companies.find((c) => c.userId === companyUserId);
    notify(db, companyUserId, 'Job submitted', `Your job "${job.title}" is pending admin approval.`);
    db.users.filter((u) => u.role === 'admin').forEach((admin) => {
      notify(db, admin.id, 'Job pending approval', `New job "${job.title}" needs review.`);
    });
  });
  return job;
}

export function getJobs(filters = {}) {
  let jobs = loadDb().jobs;
  if (filters.status) jobs = jobs.filter((j) => j.status === filters.status);
  if (filters.companyUserId) jobs = jobs.filter((j) => j.companyUserId === filters.companyUserId);
  if (filters.approvedOnly) jobs = jobs.filter((j) => j.status === 'approved');
  return jobs;
}

export function approveJob(jobId, approved) {
  update((db) => {
    const job = db.jobs.find((j) => j.id === jobId);
    if (!job) return;
    job.status = approved ? 'approved' : 'rejected';
    notify(db, job.companyUserId, approved ? 'Job approved' : 'Job rejected',
      `Your job "${job.title}" has been ${approved ? 'approved' : 'rejected'}.`);
  });
}

export function applyToJob(candidateUserId, jobId) {
  const db = loadDb();
  const exists = db.applications.some((a) => a.candidateUserId === candidateUserId && a.jobId === jobId);
  if (exists) throw new Error('You have already applied to this job.');
  const app = {
    id: uid('app'),
    candidateUserId,
    jobId,
    status: 'applied',
    appliedAt: new Date().toISOString(),
  };
  update((d) => {
    d.applications.push(app);
    const job = d.jobs.find((j) => j.id === jobId);
    if (job) notify(d, job.companyUserId, 'New application', `A candidate applied to "${job.title}".`);
    notify(d, candidateUserId, 'Application submitted', 'Your application was submitted successfully.');
  });
  return app;
}

export function getApplications(filters = {}) {
  let apps = loadDb().applications;
  if (filters.candidateUserId) apps = apps.filter((a) => a.candidateUserId === filters.candidateUserId);
  if (filters.companyUserId) {
    const jobIds = loadDb().jobs.filter((j) => j.companyUserId === filters.companyUserId).map((j) => j.id);
    apps = apps.filter((a) => jobIds.includes(a.jobId));
  }
  return apps;
}

export function updateApplicationStatus(appId, status) {
  update((db) => {
    const app = db.applications.find((a) => a.id === appId);
    if (app) {
      app.status = status;
      const labels = {
        applied: 'Applied',
        shortlisted: 'Shortlisted',
        interview_scheduled: 'Interview Scheduled',
        selected: 'Selected',
        rejected: 'Rejected',
      };
      const label = labels[status] || status;
      notify(db, app.candidateUserId, 'Application update', `Your application status is now: ${label}.`);
    }
  });
}

export function toggleSavedJob(candidateUserId, jobId) {
  update((db) => {
    const i = db.savedJobs.findIndex((s) => s.candidateUserId === candidateUserId && s.jobId === jobId);
    if (i >= 0) db.savedJobs.splice(i, 1);
    else db.savedJobs.push({ candidateUserId, jobId });
  });
}

export function isJobSaved(candidateUserId, jobId) {
  return loadDb().savedJobs.some((s) => s.candidateUserId === candidateUserId && s.jobId === jobId);
}

export function getSavedJobIds(candidateUserId) {
  return loadDb().savedJobs.filter((s) => s.candidateUserId === candidateUserId).map((s) => s.jobId);
}

export function toggleSavedCandidate(companyUserId, candidateUserId) {
  update((db) => {
    const i = db.savedCandidates.findIndex(
      (s) => s.companyUserId === companyUserId && s.candidateUserId === candidateUserId
    );
    if (i >= 0) db.savedCandidates.splice(i, 1);
    else db.savedCandidates.push({ companyUserId, candidateUserId });
  });
}

export function getSavedCandidateIds(companyUserId) {
  return loadDb().savedCandidates
    .filter((s) => s.companyUserId === companyUserId)
    .map((s) => s.candidateUserId);
}

export function sendMessage({ fromUserId, toUserId, subject, body }) {
  const check = canSendMessage(fromUserId, toUserId);
  if (!check.allowed) throw new Error(check.reason);

  const msg = {
    id: uid('msg'),
    fromUserId,
    toUserId,
    subject,
    body,
    read: false,
    createdAt: new Date().toISOString(),
  };
  update((db) => {
    db.messages.push(msg);
    notify(db, toUserId, 'New message', subject);
  });
  return msg;
}

export function getMessages(userId) {
  const db = loadDb();
  return db.messages.filter((m) => m.fromUserId === userId || m.toUserId === userId);
}

export function getNotifications(userId) {
  return loadDb().notifications.filter((n) => n.userId === userId).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function getUnreadNotificationCount(userId) {
  return loadDb().notifications.filter((n) => n.userId === userId && !n.read).length;
}

export function markNotificationRead(notifId) {
  update((db) => {
    const n = db.notifications.find((x) => x.id === notifId);
    if (n) n.read = true;
  });
}

export function markAllNotificationsRead(userId) {
  update((db) => {
    db.notifications.filter((n) => n.userId === userId).forEach((n) => { n.read = true; });
  });
}

export function getUserById(userId) {
  return loadDb().users.find((u) => u.id === userId);
}

export function getUserDisplayName(userId) {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return 'Unknown';
  if (user.role === 'candidate') {
    const c = db.candidates.find((x) => x.userId === userId);
    return c?.fullName || user.name || user.email;
  }
  if (user.role === 'company') {
    const c = db.companies.find((x) => x.userId === userId);
    return c?.companyName || user.name || user.email;
  }
  return user.name || user.email;
}

export function getMessageThreads(userId) {
  const db = loadDb();
  const msgs = db.messages.filter((m) => m.fromUserId === userId || m.toUserId === userId);
  const map = new Map();

  msgs.forEach((m) => {
    const otherId = m.fromUserId === userId ? m.toUserId : m.fromUserId;
    if (!map.has(otherId)) {
      map.set(otherId, { otherUserId: otherId, messages: [] });
    }
    map.get(otherId).messages.push(m);
  });

  return Array.from(map.values())
    .map((t) => {
      t.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const last = t.messages[t.messages.length - 1];
      const other = db.users.find((u) => u.id === t.otherUserId);
      return {
        ...t,
        lastMessage: last,
        otherUser: other,
        otherName: getUserDisplayName(t.otherUserId),
        canReply: canSendMessage(userId, t.otherUserId).allowed,
      };
    })
    .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
}

/** Company must have messaged the candidate first before candidate can reply */
export function companyHasMessagedCandidate(companyUserId, candidateUserId) {
  return loadDb().messages.some(
    (m) => m.fromUserId === companyUserId && m.toUserId === candidateUserId
  );
}

export function canSendMessage(fromUserId, toUserId) {
  const db = loadDb();
  const from = db.users.find((u) => u.id === fromUserId);
  const to = db.users.find((u) => u.id === toUserId);
  if (!from || !to) return { allowed: false, reason: 'User not found.' };

  if (from.role === 'candidate') {
    if (to.role !== 'company') {
      return { allowed: false, reason: 'You can only message companies.' };
    }
    if (!companyHasMessagedCandidate(toUserId, fromUserId)) {
      return {
        allowed: false,
        reason: 'You can only reply after a company has messaged you first.',
      };
    }
    return { allowed: true };
  }

  if (from.role === 'company' && to.role === 'candidate') {
    return { allowed: true };
  }

  if (from.role === 'admin') {
    return { allowed: true };
  }

  return { allowed: true };
}

export function replyToThread({ fromUserId, toUserId, body, subject }) {
  const check = canSendMessage(fromUserId, toUserId);
  if (!check.allowed) throw new Error(check.reason);

  const db = loadDb();
  const thread = db.messages.filter(
    (m) =>
      (m.fromUserId === fromUserId && m.toUserId === toUserId) ||
      (m.fromUserId === toUserId && m.toUserId === fromUserId)
  );
  const lastSubject = thread.length ? thread[thread.length - 1].subject : subject;
  const replySubject = subject || (lastSubject?.startsWith('Re:') ? lastSubject : `Re: ${lastSubject || 'Message'}`);

  return sendMessage({ fromUserId, toUserId, subject: replySubject, body });
}

function notify(db, userId, title, message) {
  db.notifications.push({
    id: uid('notif'),
    userId,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export function getJobWithCompany(jobId) {
  const db = loadDb();
  const job = db.jobs.find((j) => j.id === jobId);
  if (!job) return null;
  const company = db.companies.find((c) => c.userId === job.companyUserId);
  const user = db.users.find((u) => u.id === job.companyUserId);
  return { job, company, companyName: company?.companyName || user?.name || 'Company' };
}

export function getAllCandidates() {
  return loadDb().candidates;
}

export function profileCompletion(candidate) {
  if (!candidate) return 0;
  const fields = ['fullName', 'phone', 'jobTitle', 'skills', 'education', 'profilePhoto', 'resume'];
  const filled = fields.filter((f) => {
    const v = candidate[f];
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  }).length;
  return Math.round((filled / fields.length) * 100);
}

export function companyProfileCompletion(company) {
  if (!company) return 0;
  const fields = ['companyName', 'hqCountry', 'website', 'industry'];
  const filled = fields.filter((f) => {
    const v = company[f];
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  }).length;
  return Math.round((filled / fields.length) * 100);
}
