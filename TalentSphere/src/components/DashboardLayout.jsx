import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

export function CandidateNav() {
  const links = [
    { to: '/candidate/dashboard', label: 'Dashboard' },
    { to: '/candidate/jobs', label: 'Find Jobs' },
    { to: '/candidate/messages', label: 'Messages' },
  ];
  return <DashboardTopNav links={links} />;
}

export function CompanyNav() {
  const links = [
    { to: '/company/dashboard', label: 'Dashboard' },
    { to: '/company/jobs', label: 'My Jobs' },
    { to: '/company/post-job', label: 'Post Job' },
    { to: '/company/recommendations', label: 'AI Matches' },
    { to: '/company/talent', label: 'Find Talent' },
    { to: '/company/saved', label: 'Saved' },
    { to: '/company/messages', label: 'Messages' },
  ];
  return <DashboardTopNav links={links} />;
}

export function AdminNav() {
  const links = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/jobs', label: 'Job Approvals' },
    { to: '/admin/users', label: 'Users' },
  ];
  return <DashboardTopNav links={links} />;
}

function DashboardTopNav({ links }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="dash-top-nav">
      <div className="container dash-top-inner">
        <Logo to={links[0]?.to || '/'} />
        <nav className="dash-top-links" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="dash-top-actions">
          <NotificationBell />
          <button
            type="button"
            className="icon-btn"
            aria-label="Logout"
            onClick={() => { logout(); navigate('/login'); }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function Sidebar({ items, profile, completion }) {
  return (
    <aside className="dash-sidebar card">
      <div className="sidebar-profile">
        <div className="avatar">
          {profile?.photo ? (
            <img src={profile.photo} alt="" className="avatar-img" />
          ) : (
            profile?.initial || '?'
          )}
        </div>
        <h3>{profile?.name || 'User'}</h3>
        <p>{profile?.subtitle || ''}</p>
        {completion !== undefined && (
          <div className="profile-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${completion}%` }} />
            </div>
            <span>{completion}% complete</span>
          </div>
        )}
      </div>
      {items?.length > 0 && (
        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </aside>
  );
}

export default function DashboardLayout({ topNav, sidebar, children }) {
  const bodyClass = sidebar ? 'dash-body' : 'dash-body dash-body--no-sidebar';

  return (
    <div className="starry-bg dash-layout">
      {topNav}
      <div className={`container ${bodyClass}`}>
        {sidebar}
        <main className="dash-main">{children}</main>
      </div>
    </div>
  );
}
