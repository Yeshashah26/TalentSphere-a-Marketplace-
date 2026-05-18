import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Search, Briefcase } from 'lucide-react';
import DashboardLayout, { CompanyNav } from '../../components/DashboardLayout';
import CompanyJobFiltersPanel from '../../components/CompanyJobFiltersPanel';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../lib/api';
import {
  EMPTY_COMPANY_JOB_FILTERS,
  applyCompanyJobFilters,
} from '../../lib/companyJobFilters';
import '../DashboardPages.css';

export default function CompanyManageJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ ...EMPTY_COMPANY_JOB_FILTERS });

  useEffect(() => {
    api.getJobs({ companyUserId: user.id }).then(setJobs);
  }, [user.id]);

  const filteredJobs = useMemo(() => {
    let list = applyCompanyJobFilters(jobs, filters);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.city?.toLowerCase().includes(q) ||
          j.country?.toLowerCase().includes(q) ||
          j.department?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [jobs, filters, query]);

  return (
    <DashboardLayout topNav={<CompanyNav />}>
      <div className="dash-header">
        <div>
          <h1>My Jobs</h1>
          <p>View and manage your job postings</p>
        </div>
        <Link to="/company/post-job" className="btn btn-primary btn-sm">+ Post Job</Link>
      </div>

      <div className="search-bar">
        <Search size={20} color="#a1a1aa" />
        <input
          placeholder="Search your jobs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="jobs-layout jobs-layout--two-col">
        <CompanyJobFiltersPanel
          userId={user.id}
          jobs={jobs}
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters({ ...EMPTY_COMPANY_JOB_FILTERS })}
        />

        <section className="card jobs-manage-panel">
          <h3>
            All Jobs{' '}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
              Showing {filteredJobs.length} Results
            </span>
          </h3>

          {jobs.length === 0 ? (
            <div className="empty-state">
              <p>No jobs posted yet</p>
              <Link to="/company/post-job" className="btn btn-primary btn-sm">Post a Job</Link>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state">
              <Briefcase size={48} />
              <p>No jobs match your filters. Try adjusting them.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((j) => (
                    <tr key={j.id}>
                      <td><strong>{j.title}</strong></td>
                      <td>
                        {[j.city, j.country].filter(Boolean).join(', ') || '—'}
                        {j.workMode === 'Remote' && ' (Remote)'}
                      </td>
                      <td>{j.employmentType || '—'}</td>
                      <td>
                        <span className={`badge badge-${j.status}`}>{j.status}</span>
                      </td>
                      <td>{new Date(j.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
