import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout, { AdminNav } from '../../components/DashboardLayout';
import * as api from '../../lib/api';
import '../DashboardPages.css';

export default function AdminDashboard() {
  const [overview, setOverview] = useState({ users: 0, candidates: 0, companies: 0, pendingJobs: 0 });

  useEffect(() => {
    api.getAdminOverview().then(setOverview);
  }, []);

  return (
    <DashboardLayout topNav={<AdminNav />}>
      <div className="dash-header">
        <div><h1>Admin Dashboard</h1><p>System overview and monitoring</p></div>
      </div>
      <div className="stats-row">
        <div className="stat-card card"><span className="stat-label">Total Users</span><strong>{overview.users}</strong></div>
        <div className="stat-card card"><span className="stat-label">Candidates</span><strong>{overview.candidates}</strong></div>
        <div className="stat-card card"><span className="stat-label">Companies</span><strong>{overview.companies}</strong></div>
        <div className="stat-card card"><span className="stat-label">Pending Jobs</span><strong>{overview.pendingJobs}</strong></div>
      </div>
      <section className="card dash-section">
        <h2>Quick Actions</h2>
        <Link to="/admin/jobs" className="btn btn-primary btn-sm">
          Review Pending Jobs ({overview.pendingJobs})
        </Link>
      </section>
    </DashboardLayout>
  );
}
