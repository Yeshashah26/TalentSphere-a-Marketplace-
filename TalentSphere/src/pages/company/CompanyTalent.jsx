import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Users, MessageCircle, Mail } from 'lucide-react';
import DashboardLayout, { CompanyNav } from '../../components/DashboardLayout';
import TalentFiltersPanel from '../../components/TalentFiltersPanel';
import ResumeDisplay from '../../components/ResumeDisplay';
import EmailAutomateModal from '../../components/EmailAutomateModal';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../lib/api';
import { EMPTY_TALENT_FILTERS, applyTalentFilters } from '../../lib/talentFilters';
import '../DashboardPages.css';

function formatExp(c) {
  const y = Number(c.yearsExp) || 0;
  const m = Number(c.monthsExp) || 0;
  if (!y && !m) return 'No experience listed';
  return `${y}y ${m}m exp`;
}

export default function CompanyTalent() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'saved' ? 'saved' : 'talent';
  const highlightParam = searchParams.get('highlight');

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(highlightParam || null);
  const [filters, setFilters] = useState({ ...EMPTY_TALENT_FILTERS });
  const [allCandidates, setAllCandidates] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [emailAutomateOpen, setEmailAutomateOpen] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const reload = () => setDataVersion((v) => v + 1);

  useEffect(() => {
    if (highlightParam) setSelectedId(highlightParam);
  }, [highlightParam]);

  useEffect(() => {
    Promise.all([
      api.getAllCandidates(),
      api.getSavedCandidateIds(user.id),
      api.getJobs({ companyUserId: user.id }),
    ]).then(([c, s, j]) => {
      setAllCandidates(c);
      setSavedIds(s);
      setCompanyJobs(j);
    });
  }, [user.id, dataVersion]);

  const candidates = useMemo(() => {
    let list = allCandidates;
    if (tab === 'saved') list = list.filter((c) => savedIds.includes(c.userId));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.fullName?.toLowerCase().includes(q) ||
          c.jobTitle?.toLowerCase().includes(q) ||
          c.education?.toLowerCase().includes(q) ||
          c.skills?.some((s) => s.toLowerCase().includes(q)) ||
          c.professionalSummary?.toLowerCase().includes(q)
      );
    }
    return applyTalentFilters(list, filters);
  }, [allCandidates, tab, savedIds, query, filters]);

  const selected = candidates.find((c) => c.userId === selectedId) || candidates[0];

  useEffect(() => {
    if (candidates.length && !candidates.some((c) => c.userId === selectedId)) {
      setSelectedId(candidates[0]?.userId ?? null);
    }
    if (!candidates.length) setSelectedId(null);
  }, [candidates, selectedId]);

  const handleToggleSave = async () => {
    if (!selected) return;
    await api.toggleSavedCandidate(user.id, selected.userId);
    reload();
  };

  const listTitle = tab === 'saved' ? 'Saved Candidates' : 'All Candidates';

  return (
    <DashboardLayout topNav={<CompanyNav />}>
      <nav className="job-tabs">
        <Link to="/company/talent" className={tab === 'talent' ? 'active' : ''}>
          Find Talent
        </Link>
        <Link to="/company/talent?tab=saved" className={tab === 'saved' ? 'active' : ''}>
          Saved
        </Link>
      </nav>

      <div className="search-bar">
        <Search size={20} color="#a1a1aa" />
        <input
          placeholder="Search candidates"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="jobs-layout">
        <TalentFiltersPanel
          userId={user.id}
          candidates={allCandidates}
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters({ ...EMPTY_TALENT_FILTERS })}
        />

        <section className="jobs-list card">
          <h3>
            {listTitle}{' '}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
              Showing {candidates.length} Results
            </span>
          </h3>
          {candidates.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <p>
                {tab === 'saved'
                  ? 'No saved candidates yet. Save profiles from Find Talent.'
                  : 'No candidates found. Try adjusting your filters.'}
              </p>
              {tab === 'saved' && (
                <Link to="/company/talent" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                  Find Talent
                </Link>
              )}
            </div>
          ) : (
            candidates.map((c) => (
              <article
                key={c.userId}
                className={`job-item ${selected?.userId === c.userId ? 'selected' : ''}`}
                onClick={() => setSelectedId(c.userId)}
              >
                <h4>{c.fullName}</h4>
                <p>
                  {c.jobTitle || 'Open to work'} · {formatExp(c)}
                  {c.education ? ` · ${c.education}` : ''}
                </p>
              </article>
            ))
          )}
        </section>

        <aside className="jobs-detail card">
          {selected ? (
            <>
              <div className="talent-detail-header">
                {selected.profilePhoto ? (
                  <img src={selected.profilePhoto} alt="" className="talent-detail-photo" />
                ) : (
                  <div className="talent-detail-avatar">
                    {(selected.fullName || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{selected.fullName}</h3>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                    {selected.jobTitle || 'Open to work'}
                  </p>
                </div>
              </div>
              {selected.openToWork !== false && (
                <span className="talent-open-badge">Open to work</span>
              )}
              {selected.professionalSummary && (
                <p style={{ fontSize: '0.9rem', margin: '1rem 0' }}>{selected.professionalSummary}</p>
              )}
              <p><strong>Experience:</strong> {formatExp(selected)}</p>
              {selected.education && (
                <p><strong>Education:</strong> {selected.education}</p>
              )}
              {selected.graduationYear && (
                <p><strong>Graduation:</strong> {selected.graduationYear}</p>
              )}
              {selected.skills?.length > 0 && (
                <p><strong>Skills:</strong> {selected.skills.join(', ')}</p>
              )}
              {selected.phone && <p><strong>Phone:</strong> {selected.phone}</p>}
              {selected.linkedin && (
                <p>
                  <strong>LinkedIn:</strong>{' '}
                  <a href={selected.linkedin} target="_blank" rel="noopener noreferrer">
                    Profile
                  </a>
                </p>
              )}
              {selected.portfolio && (
                <p>
                  <strong>Portfolio:</strong>{' '}
                  <a href={selected.portfolio} target="_blank" rel="noopener noreferrer">
                    Link
                  </a>
                </p>
              )}
              <ResumeDisplay candidate={selected} />
              <div className="talent-detail-actions">
                {tab === 'saved' && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm btn-email-automate"
                    onClick={() => setEmailAutomateOpen(true)}
                  >
                    <Mail size={14} /> Email Automate
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/company/messages?to=${selected.userId}`)}
                >
                  <MessageCircle size={14} /> Reach out
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleToggleSave}>
                  {savedIds.includes(selected.userId) ? 'Unsave' : 'Save Candidate'}
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Users size={48} />
              <p>Select a candidate to view their profile</p>
            </div>
          )}
        </aside>
      </div>

      {emailAutomateOpen && selected && tab === 'saved' && (
        <EmailAutomateModal
          candidate={selected}
          company={profile}
          companyUserId={user.id}
          jobs={companyJobs}
          onClose={() => setEmailAutomateOpen(false)}
        />
      )}
    </DashboardLayout>
  );
}
