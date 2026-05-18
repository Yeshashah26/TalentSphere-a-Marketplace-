import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, MessageCircle, Users, Briefcase } from 'lucide-react';
import DashboardLayout, { CompanyNav } from '../../components/DashboardLayout';
import ResumeDisplay from '../../components/ResumeDisplay';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../lib/api';
import { rankCandidatesForCompany, getScoreLabel } from '../../lib/candidateMatching';
import '../DashboardPages.css';

export default function CompanyRecommendations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getAllCandidates(),
      api.getJobs({ companyUserId: user.id }),
      api.getSavedCandidateIds(user.id),
    ])
      .then(([c, j, s]) => {
        setCandidates(c);
        setJobs(j);
        setSavedIds(s);
      })
      .finally(() => setLoading(false));
  }, [user.id]);

  const activeJobs = useMemo(() => jobs.filter((j) => j.status === 'approved'), [jobs]);

  const recommendations = useMemo(() => {
    if (loading) return [];
    return rankCandidatesForCompany(candidates, jobs, {
      jobId: selectedJobId || null,
      minScore: 20,
    });
  }, [candidates, jobs, selectedJobId, loading]);

  const handleToggleSave = async (candidateUserId) => {
    await api.toggleSavedCandidate(user.id, candidateUserId);
    const s = await api.getSavedCandidateIds(user.id);
    setSavedIds(s);
  };

  return (
    <DashboardLayout topNav={<CompanyNav />}>
      <div className="dash-header">
        <div>
          <h1>
            <Sparkles size={26} style={{ verticalAlign: 'middle', marginRight: '0.35rem', color: 'var(--purple)' }} />
            AI Recommended Candidates
          </h1>
          <p>Ranked by resume and profile fit against your job postings</p>
        </div>
        <Link to="/company/talent" className="btn btn-outline btn-sm">
          Browse all talent
        </Link>
      </div>

      <div className="ai-rec-toolbar card">
        <label className="ai-rec-job-select">
          <span>Match against</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            <option value="">All active jobs (best fit per candidate)</option>
            {activeJobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
            {!activeJobs.length &&
              jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.status})
                </option>
              ))}
          </select>
        </label>
        <p className="ai-rec-toolbar-hint">
          Scores combine resume on file, skills, experience, role title, and keywords from your job descriptions.
        </p>
      </div>

      {loading ? (
        <div className="card empty-state" style={{ padding: '3rem' }}>
          <p>Analyzing candidate resumes…</p>
        </div>
      ) : !jobs.length ? (
        <div className="card empty-state" style={{ padding: '3rem' }}>
          <Briefcase size={48} />
          <p>Post a job to get AI-powered candidate recommendations.</p>
          <Link to="/company/post-job" className="btn btn-primary btn-sm">Post a Job</Link>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="card empty-state" style={{ padding: '3rem' }}>
          <Users size={48} />
          <p>No strong matches yet. Try posting more detail in job requirements or check back when more candidates join.</p>
          <Link to="/company/talent" className="btn btn-outline btn-sm">Find Talent</Link>
        </div>
      ) : (
        <ul className="ai-rec-list">
          {recommendations.map(({ candidate, score, reasons, matchedJobTitle, tier }, index) => (
            <li key={candidate.userId} className={`card ai-rec-card ai-rec-card--${tier}`}>
              <div className="ai-rec-rank">#{index + 1}</div>
              <div
                className="ai-rec-score-ring"
                style={{ '--score': score }}
                title={getScoreLabel(score)}
              >
                <span className="ai-rec-score-value">{score}</span>
                <span className="ai-rec-score-label">match</span>
              </div>
              <div className="ai-rec-body">
                <div className="ai-rec-head">
                  {candidate.profilePhoto ? (
                    <img src={candidate.profilePhoto} alt="" className="ai-rec-photo" />
                  ) : (
                    <div className="ai-rec-photo ai-rec-photo--placeholder">
                      {(candidate.fullName || '?')[0]}
                    </div>
                  )}
                  <div>
                    <h3>{candidate.fullName}</h3>
                    <p>{candidate.jobTitle || 'Open to work'}</p>
                    {matchedJobTitle && (
                      <p className="ai-rec-matched-job">
                        <Briefcase size={12} /> Best fit: <strong>{matchedJobTitle}</strong>
                      </p>
                    )}
                  </div>
                </div>
                <p className="ai-rec-tier">{getScoreLabel(score)}</p>
                <ul className="ai-rec-reasons">
                  {reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <ResumeDisplay candidate={candidate} compact />
                <div className="ai-rec-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/company/messages?to=${candidate.userId}`)}
                  >
                    <MessageCircle size={14} /> Reach out
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => handleToggleSave(candidate.userId)}
                  >
                    {savedIds.includes(candidate.userId) ? 'Unsave' : 'Save'}
                  </button>
                  <Link
                    to={`/company/talent?highlight=${candidate.userId}`}
                    className="btn btn-ghost btn-sm"
                  >
                    View profile
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardLayout>
  );
}
