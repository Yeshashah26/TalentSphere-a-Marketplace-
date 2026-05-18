import { useState, useEffect } from 'react';
import DashboardLayout, { AdminNav } from '../../components/DashboardLayout';
import * as api from '../../lib/api';
import '../DashboardPages.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.getAdminUsers().then(setUsers);
  }, []);

  return (
    <DashboardLayout topNav={<AdminNav />}>
      <div className="dash-header"><div><h1>User Management</h1><p>Monitor registered users</p></div></div>
      <section className="card dash-section">
        <table className="jobs-table">
          <thead><tr><th>Email</th><th>Name</th><th>Role</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}><td>{u.email}</td><td>{u.name}</td><td><span className="badge badge-applied">{u.role}</span></td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </DashboardLayout>
  );
}
