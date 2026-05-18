import { useState, useEffect } from 'react';
import DashboardLayout, { AdminNav } from '../../components/DashboardLayout';
import * as api from '../../lib/api';
import '../DashboardPages.css';

export default function AdminJobs() {
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [jobInfo, setJobInfo] = useState({});

  const load = async () => {
    const [p, a] = await Promise.all([
      api.getJobs({ status: 'pending' }),
      api.getJobs(),
    ]);
    setPending(p);
    setAll(a);
    const map = {};
    await Promise.all(p.map(async (j) => { map[j.id] = await api.getJobWithCompany(j.id); }));
    setJobInfo(map);
  };

  useEffect(() => { load(); }, []);

  const handleApproval = async (jobId, approved) => {
    await api.approveJob(jobId, approved);
    await load();
  };

  return (
    <DashboardLayout topNav={<AdminNav />}>
      <div className="dash-header">
        <div><h1>Job Approvals</h1><p>Review and approve company job postings</p></div>
      </div>
      <section className="card dash-section">
        <h2>Pending Approval ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="empty-text">No jobs pending approval</p>
        ) : (
          <div className="table-wrap"><table className="jobs-table">
            <thead><tr><th>Title</th><th>Company</th><th>Location</th><th>Actions</th></tr></thead>
            <tbody>
              {pending.map((j) => {
                const info = jobInfo[j.id];
                return (
                  <tr key={j.id}>
                    <td>{j.title}</td>
                    <td>{info?.companyName}</td>
                    <td>{j.city}, {j.country}</td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => handleApproval(j.id, true)}>Approve</button>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => handleApproval(j.id, false)}>Reject</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </section>
      <section className="card dash-section">
        <h2>All Jobs ({all.length})</h2>
        <div className="table-wrap"><table className="jobs-table">
          <thead><tr><th>Title</th><th>Status</th><th>Posted</th></tr></thead>
          <tbody>
            {all.map((j) => (
              <tr key={j.id}><td>{j.title}</td><td><span className={`badge badge-${j.status}`}>{j.status}</span></td><td>{new Date(j.createdAt).toLocaleDateString()}</td></tr>
            ))}
          </tbody>
        </table></div>
      </section>
    </DashboardLayout>
  );
}
