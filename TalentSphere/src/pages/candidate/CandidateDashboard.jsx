import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, FileText, Sparkles } from 'lucide-react';
import EnhanceResumeModal from '../../components/EnhanceResumeModal';
import DashboardLayout, { CandidateNav, Sidebar } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { getCandidateSidebarItems, getCandidateProfileProps } from '../../lib/candidateNav';
import * as api from '../../lib/api';
import { hasResume } from '../../lib/resume';
import '../DashboardPages.css';

function truncate(text, max = 160) {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max).trim()}…`;
}

export default function CandidateDashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const [enhanceOpen, setEnhanceOpen] = useState(false);
  const [savedVersion, setSavedVersion] = useState(0);
  const [completion, setCompletion] = useState(0);
  const [apps, setApps] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [jobCache, setJobCache] = useState({});
  const [resumeHint, setResumeHint] = useState(false);

  const resumeUploaded = hasResume(profile);

  useEffect(() => {
    if (resumeUploaded) setResumeHint(false);
  }, [resumeUploaded]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [applications, savedIds, messages, pct] = await Promise.all([
        api.getApplications({ candidateUserId: user.id }),
        api.getSavedJobIds(user.id),
        api.getMessages(user.id),
        api.profileCompletion(profile, user.id),
      ]);
      if (cancelled) return;
      setApps(applications);
      setMessageCount(messages.length);
      setCompletion(pct);
      const jobs = await Promise.all(
        savedIds.map(async (id) => {
          if (jobCache[id]) return jobCache[id];
          const info = await api.getJobWithCompany(id);
          return info;
        })
      );
      if (!cancelled) {
        setSavedJobs(jobs.filter(Boolean));
        const cache = {};
        jobs.filter(Boolean).forEach((j) => { cache[j.job.id] = j; });
        apps.forEach((a) => { if (!cache[a.jobId]) cache[a.jobId] = null; });
        setJobCache((prev) => ({ ...prev, ...cache }));
      }
    })();
    return () => { cancelled = true; };
  }, [user, profile, savedVersion]);

  useEffect(() => {
    if (!apps.length) return;
    (async () => {
      const cache = { ...jobCache };
      await Promise.all(
        apps.slice(0, 5).map(async (a) => {
          if (!cache[a.jobId]) {
            cache[a.jobId] = await api.getJobWithCompany(a.jobId);
          }
        })
      );
      setJobCache(cache);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps]);

  const handleUnsave = async (jobId) => {
    await api.toggleSavedJob(user.id, jobId);
    setSavedVersion((v) => v + 1);
  };

  return (
    <DashboardLayout
      topNav={<CandidateNav />}
      sidebar={
        <Sidebar
          items={getCandidateSidebarItems()}
          profile={getCandidateProfileProps(user, profile)}
          completion={completion}
        />
      }
    >
      <div className="dash-header">
        <div>
          <h1>Welcome back, {profile?.fullName?.split(' ')[0] || user.name}!</h1>
          <p>Here&apos;s your job search overview</p>
        </div>
        <div className="dash-header-actions">
          <div className="enhance-resume-wrap">
            <button
              type="button"
              className="btn btn-outline btn-sm enhance-resume-btn"
              disabled={!resumeUploaded}
              title={resumeUploaded ? 'Get personalized resume suggestions' : 'Upload your resume first to use this feature'}
              onClick={() => {
                if (!resumeUploaded) {
                  setResumeHint(true);
                  return;
                }
                setResumeHint(false);
                setEnhanceOpen(true);
              }}
            >
              <Sparkles size={16} /> Enhance Profile
            </button>
            {!resumeUploaded && resumeHint && (
              <p className="enhance-resume-hint" role="alert">
                Please upload your resume on{' '}
                <Link to="/candidate/profile" onClick={() => setResumeHint(false)}>Edit Profile</Link>{' '}
                before using Enhance Resume.
              </p>
            )}
          </div>
          <Link to="/candidate/profile" className="btn btn-primary btn-sm">Edit Profile</Link>
        </div>
      </div>

      {completion < 100 && (
        <div className="alert-banner">
          <span>Complete your profile to stand out to employers</span>
          <Link to="/candidate/profile" className="btn btn-sm" style={{ background: 'var(--orange)', color: '#000' }}>Complete Now</Link>
        </div>
      )}

      <div className="stats-row">
        <div className="stat-card card"><span className="stat-label">Total Applications</span><strong>{apps.length}</strong></div>
        <div className="stat-card card"><span className="stat-label">Saved Jobs</span><strong>{savedJobs.length}</strong></div>
        <div className="stat-card card"><span className="stat-label">Messages</span><strong>{messageCount}</strong></div>
        <div className="stat-card card"><span className="stat-label">Profile Completion</span><strong>{completion}%</strong></div>
      </div>

      <section className="dash-section card">
        <h2>Recent Applications</h2>
        {apps.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <p>No applications yet</p>
            <Link to="/candidate/jobs" className="btn btn-primary btn-sm">Start Applying</Link>
          </div>
        ) : (
          <ul className="simple-list">
            {apps.slice(0, 5).map((a) => {
              const j = jobCache[a.jobId];
              return (
                <li key={a.id}>
                  <strong>{j?.job?.title || 'Job'}</strong>
                  {' — '}
                  <span className={`badge badge-${a.status}`}>{a.status}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="dash-section card">
        <div className="dash-section-header">
          <h2>Saved Jobs</h2>
          {savedJobs.length > 0 && (
            <Link to="/candidate/jobs?tab=saved" className="dash-section-link">View all</Link>
          )}
        </div>
        {savedJobs.length === 0 ? (
          <div className="empty-state">
            <Bookmark size={48} />
            <p>No saved jobs yet</p>
            <Link to="/candidate/jobs" className="btn btn-primary btn-sm">Browse Jobs</Link>
          </div>
        ) : (
          <ul className="saved-jobs-list">
            {savedJobs.map(({ job, companyName }) => (
              <li key={job.id}>
                <article className="saved-job-card">
                  <div className="saved-job-card-main">
                    <h3>{job.title}</h3>
                    <p className="saved-job-meta">
                      {companyName}
                      {(job.city || job.country) && (
                        <> · {[job.city, job.country].filter(Boolean).join(', ')}</>
                      )}
                      {job.employmentType && <> · {job.employmentType}</>}
                      {job.workMode && <> · {job.workMode}</>}
                    </p>
                    <p className="saved-job-desc">{truncate(job.description)}</p>
                    {job.salaryMin && job.salaryMax && (
                      <p className="saved-job-salary">
                        ${Number(job.salaryMin).toLocaleString()} – ${Number(job.salaryMax).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="saved-job-card-actions">
                    <Link to={`/candidate/jobs?tab=saved&job=${job.id}`} className="btn btn-primary btn-sm">
                      View Job
                    </Link>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => handleUnsave(job.id)}>
                      Unsave
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      {enhanceOpen && resumeUploaded && (
        <EnhanceResumeModal
          userId={user.id}
          profile={profile}
          onClose={() => setEnhanceOpen(false)}
          onApplied={refreshProfile}
        />
      )}
    </DashboardLayout>
  );
}
