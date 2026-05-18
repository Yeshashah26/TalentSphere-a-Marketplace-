import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Briefcase } from 'lucide-react';
import DashboardLayout, { CandidateNav } from '../../components/DashboardLayout';
import ApplicationTracker from '../../components/ApplicationTracker';
import JobFiltersPanel from '../../components/JobFiltersPanel';
import JobDescriptionDisplay from '../../components/JobDescriptionDisplay';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../lib/api';
import { EMPTY_FILTERS, applyJobFilters } from '../../lib/jobFilters';
import '../DashboardPages.css';

export default function CandidateJobs() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'jobs';
  const jobParam = searchParams.get('job');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [allJobs, setAllJobs] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobInfoMap, setJobInfoMap] = useState({});
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    if (jobParam) setSelectedId(jobParam);
  }, [jobParam]);

  const reload = () => setDataVersion((v) => v + 1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [jobs, saved, apps] = await Promise.all([
        api.getJobs({ approvedOnly: true }),
        api.getSavedJobIds(user.id),
        api.getApplications({ candidateUserId: user.id }),
      ]);
      if (cancelled) return;
      setAllJobs(jobs);
      setSavedIds(saved);
      setApplications(apps);
      const map = {};
      await Promise.all(
        jobs.map(async (j) => {
          map[j.id] = await api.getJobWithCompany(j.id);
        })
      );
      await Promise.all(
        apps.map(async (a) => {
          if (!map[a.jobId]) map[a.jobId] = await api.getJobWithCompany(a.jobId);
        })
      );
      if (!cancelled) setJobInfoMap(map);
    })();
    return () => { cancelled = true; };
  }, [user.id, dataVersion]);

  useEffect(() => {
    const onUpdate = () => reload();
    window.addEventListener('talentsphere-update', onUpdate);
    return () => window.removeEventListener('talentsphere-update', onUpdate);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSelectedDetail(null);
      return;
    }
    api.getJobWithCompany(selectedId).then(setSelectedDetail);
  }, [selectedId, dataVersion]);

  const appliedIds = useMemo(() => applications.map((a) => a.jobId), [applications]);

  const jobs = useMemo(() => {
    let list = allJobs;
    if (tab === 'saved') list = list.filter((j) => savedIds.includes(j.id));
    if (tab === 'applied') list = list.filter((j) => appliedIds.includes(j.id));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((j) =>
        j.title?.toLowerCase().includes(q) ||
        j.city?.toLowerCase().includes(q) ||
        j.department?.toLowerCase().includes(q)
      );
    }
    list = applyJobFilters(list, filters);
    return list;
  }, [allJobs, tab, savedIds, appliedIds, query, filters]);

  const trackedApplications = useMemo(() => {
    if (!query.trim()) return applications;
    const q = query.toLowerCase();
    return applications.filter((a) => {
      const info = jobInfoMap[a.jobId];
      return info?.job?.title?.toLowerCase().includes(q) || info?.companyName?.toLowerCase().includes(q);
    });
  }, [applications, query, jobInfoMap]);

  const selected = jobs.find((j) => j.id === selectedId) || jobs[0];

  const handleApply = async () => {
    if (!selected) return;
    try {
      await api.applyToJob(user.id, selected.id);
      alert('Application submitted successfully!');
      reload();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleToggleSave = async () => {
    if (!selected) return;
    await api.toggleSavedJob(user.id, selected.id);
    reload();
  };

  return (
    <DashboardLayout topNav={<CandidateNav />}>
      <nav className="job-tabs">
        <Link to="/candidate/jobs" className={tab === 'jobs' ? 'active' : ''}>Jobs</Link>
        <Link to="/candidate/jobs?tab=saved" className={tab === 'saved' ? 'active' : ''}>Saved Jobs</Link>
        <Link to="/candidate/jobs?tab=applied" className={tab === 'applied' ? 'active' : ''}>Applied Jobs</Link>
        <Link to="/candidate/jobs?tab=track" className={tab === 'track' ? 'active' : ''}>Track Application</Link>
      </nav>
      <div className="search-bar">
        <Search size={20} color="#a1a1aa" />
        <input
          placeholder={tab === 'track' ? 'Search your applications...' : 'Search Opportunities'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {tab === 'track' ? (
        <section className="track-applications">
          <h2 className="track-applications-title">Track Application</h2>
          {applications.length === 0 ? (
            <div className="empty-state card"><p>No applications to track yet</p></div>
          ) : trackedApplications.length === 0 ? (
            <div className="empty-state card"><p>No applications match your search</p></div>
          ) : (
            trackedApplications.map((a) => {
              const info = jobInfoMap[a.jobId];
              return (
                <article key={a.id} className="card track-application-card">
                  <div className="track-application-header">
                    <div>
                      <h3>{info?.job?.title || 'Job'}</h3>
                      <p>{info?.companyName}</p>
                    </div>
                    <span className="track-application-date">
                      Applied {new Date(a.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <ApplicationTracker status={a.status} />
                </article>
              );
            })
          )}
        </section>
      ) : (
        <div className="jobs-layout">
          <JobFiltersPanel
            userId={user.id}
            jobs={allJobs}
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters({ ...EMPTY_FILTERS })}
          />
          <section className="jobs-list card">
            <h3>All Jobs <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Showing {jobs.length} Results</span></h3>
            {jobs.length === 0 ? (
              <div className="empty-state">
                <Briefcase size={48} />
                <p>No jobs found. Try adjusting your filters.</p>
              </div>
            ) : (
              jobs.map((j) => {
                const info = jobInfoMap[j.id];
                return (
                  <article key={j.id} className={`job-item ${selected?.id === j.id ? 'selected' : ''}`} onClick={() => setSelectedId(j.id)}>
                    <h4>{j.title}</h4>
                    <p>{info?.companyName} · {j.city || j.country} · {j.employmentType}</p>
                  </article>
                );
              })
            )}
          </section>
          <aside className="jobs-detail card">
            {selected ? (
              <>
                <h3>{selected.title}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {selectedDetail?.companyName || jobInfoMap[selected.id]?.companyName}
                </p>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{selected.description}</p>
                <p><strong>Location:</strong> {selected.city}, {selected.country}</p>
                <p><strong>Work mode:</strong> {selected.workMode}</p>
                <p><strong>Salary:</strong> ${selected.salaryMin} - ${selected.salaryMax}</p>
                <JobDescriptionDisplay job={selected} />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  {tab === 'jobs' && !appliedIds.includes(selected.id) && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleApply}>Apply Now</button>
                  )}
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleToggleSave}>
                    {savedIds.includes(selected.id) ? 'Unsave' : 'Save Job'}
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <Briefcase size={48} />
                <p>Select a job to view details</p>
              </div>
            )}
          </aside>
        </div>
      )}
    </DashboardLayout>
  );
}
