import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Plus, Briefcase, Users, Bookmark, MessageSquare, Building2, Sparkles } from 'lucide-react';
import { rankCandidatesForCompany, getScoreLabel } from '../../lib/candidateMatching';
import DashboardLayout, { CompanyNav, Sidebar } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../lib/api';
import { APPLICATION_STATUS_OPTIONS, normalizeStatus } from '../../lib/applicationStatus';
import ResumeDisplay from '../../components/ResumeDisplay';
import '../DashboardPages.css';

export default function CompanyDashboard() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [completion, setCompletion] = useState(0);
  const [appDetails, setAppDetails] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const load = async () => {
    const [j, a, saved, pct, allCandidates] = await Promise.all([
      api.getJobs({ companyUserId: user.id }),
      api.getApplications({ companyUserId: user.id }),
      api.getSavedCandidateIds(user.id),
      api.companyProfileCompletion(profile, user.id),
      api.getAllCandidates(),
    ]);
    setJobs(j);
    setApps(a);
    setSavedCount(saved.length);
    setCompletion(pct);
    setRecommendations(rankCandidatesForCompany(allCandidates, j, { minScore: 30 }).slice(0, 5));
    const details = await Promise.all(
      a.slice(0, 5).map(async (app) => ({
        app,
        job: await api.getJobWithCompany(app.jobId),
        candidate: await api.getCandidate(app.candidateUserId),
      }))
    );
    setAppDetails(details);
  };

  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener('talentsphere-update', onUpdate);
    return () => window.removeEventListener('talentsphere-update', onUpdate);
  }, [user.id, profile]);

  const activeJobs = jobs.filter((j) => j.status === 'approved');

  const sidebarItems = [
    { to: '/company/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/company/post-job', label: 'Post Job', icon: <Plus size={18} /> },
    { to: '/company/jobs', label: 'Manage Jobs', icon: <Briefcase size={18} /> },
    { to: '/company/recommendations', label: 'AI Matches', icon: <Sparkles size={18} /> },
    { to: '/company/talent', label: 'Candidates', icon: <Users size={18} /> },
    { to: '/company/saved', label: 'Saved Candidates', icon: <Bookmark size={18} /> },
    { to: '/company/messages', label: 'Messages', icon: <MessageSquare size={18} /> },
    { to: '/company/profile', label: 'Company Profile', icon: <Building2 size={18} /> },
  ];

  return (
    <DashboardLayout
      topNav={<CompanyNav />}
      sidebar={
        <Sidebar
          items={sidebarItems}
          profile={{ name: profile?.companyName || 'Your Company', subtitle: profile?.industry?.[0] || 'No industry set', initial: (profile?.companyName || 'C')[0] }}
          completion={completion}
        />
      }
    >
      <div className="dash-header">
        <div>
          <h1>Company Dashboard</h1>
          <p>Manage your jobs and candidates</p>
        </div>
        <div className="dash-header-actions">
          <Link to="/company/profile" className="btn btn-primary btn-sm">Edit Profile</Link>
        </div>
      </div>
      {completion < 100 && (
        <div className="alert-banner">
          <span>Set up your company profile — Help candidates learn about your company</span>
          <Link to="/company/profile" className="btn btn-sm" style={{ background: 'var(--orange)', color: '#000' }}>Complete Profile</Link>
        </div>
      )}
      <div className="stats-row">
        <div className="stat-card card"><span className="stat-label">Total Job Openings</span><strong>{jobs.length}</strong></div>
        <div className="stat-card card"><span className="stat-label">Applications Received</span><strong>{apps.length}</strong></div>
        <div className="stat-card card"><span className="stat-label">Saved Candidates</span><strong>{savedCount}</strong></div>
        <div className="stat-card card"><span className="stat-label">Active Jobs</span><strong>{activeJobs.length}</strong></div>
      </div>
      {recommendations.length > 0 && (
        <section className="dash-section card ai-rec-dashboard">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2><Sparkles size={20} style={{ color: 'var(--purple)', verticalAlign: 'middle' }} /> AI Recommended</h2>
            <Link to="/company/recommendations">View all →</Link>
          </div>
          <ul className="ai-rec-dashboard-list">
            {recommendations.map(({ candidate, score, matchedJobTitle }) => (
              <li key={candidate.userId} className="ai-rec-dashboard-item">
                <span className="ai-rec-dashboard-score">{score}%</span>
                <span>
                  <strong>{candidate.fullName}</strong>
                  <span className="ai-rec-dashboard-meta">
                    {candidate.jobTitle || 'Candidate'}
                    {matchedJobTitle ? ` · fits ${matchedJobTitle}` : ''}
                  </span>
                </span>
                <span className="ai-rec-dashboard-label">{getScoreLabel(score)}</span>
                <Link to="/company/recommendations" className="btn btn-outline btn-sm">View</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="dash-section card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2>Recent Applications</h2>
          <Link to="/company/jobs">Manage All →</Link>
        </div>
        {apps.length === 0 ? (
          <div className="empty-state">
            <p>No applications yet. Post a job to get started!</p>
            <Link to="/company/post-job" className="btn btn-primary btn-sm">Post a Job</Link>
          </div>
        ) : (
          <ul className="application-status-list">{appDetails.map(({ app: a, job: j, candidate: c }) => (
              <li key={a.id} className="application-status-item">
                <span className="application-status-info">
                  <span>{c?.fullName || 'Candidate'} — <strong>{j?.job?.title}</strong></span>
                  {c && <ResumeDisplay candidate={c} compact />}
                </span>
                <select
                  className="status-select"
                  value={normalizeStatus(a.status)}
                  onChange={async (e) => {
                    await api.updateApplicationStatus(a.id, e.target.value);
                    load();
                  }}
                >
                  {APPLICATION_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </li>
            ))}</ul>
        )}
      </section>
      <section className="dash-section card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2>Your Jobs</h2>
          <Link to="/company/post-job">Post New +</Link>
        </div>
        {jobs.length === 0 ? <div className="empty-state"><Briefcase size={48} /><p>No jobs posted yet</p></div> : (
          <ul className="simple-list">{jobs.slice(0, 5).map((j) => (
            <li key={j.id}>{j.title} <span className={`badge badge-${j.status}`}>{j.status}</span></li>
          ))}</ul>
        )}
      </section>
    </DashboardLayout>
  );
}
