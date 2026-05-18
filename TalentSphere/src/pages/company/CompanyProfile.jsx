import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Plus, Briefcase, Users, Bookmark, MessageSquare, Building2 } from 'lucide-react';
import DashboardLayout, { CompanyNav, Sidebar } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../lib/api';
import '../Auth.css';
import '../DashboardPages.css';

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Retail',
  'Manufacturing', 'Education', 'Energy', 'Telecommunications',
];

const emptyForm = {
  companyName: '',
  hqCountry: '',
  yearFounded: '',
  companyType: '',
  website: '',
  linkedinName: '',
  linkedinUrl: '',
  linkedinLogo: '',
  industry: [],
  recentJobTitle: '',
  recentJobCount: '',
  officeAddresses: '',
  subscriptionPlan: 'Free',
};

function profileToForm(profile) {
  if (!profile) return { ...emptyForm };
  return {
    companyName: profile.companyName || '',
    hqCountry: profile.hqCountry || '',
    yearFounded: profile.yearFounded ?? '',
    companyType: profile.companyType || '',
    website: profile.website || '',
    linkedinName: profile.linkedinName || '',
    linkedinUrl: profile.linkedinUrl || '',
    linkedinLogo: profile.linkedinLogo || '',
    industry: Array.isArray(profile.industry) ? [...profile.industry] : [],
    recentJobTitle: profile.recentJobTitle || '',
    recentJobCount: profile.recentJobCount ?? '',
    officeAddresses: profile.officeAddresses || '',
    subscriptionPlan: profile.subscriptionPlan || 'Free',
  };
}

const sidebarItems = [
  { to: '/company/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/company/post-job', label: 'Post Job', icon: <Plus size={18} /> },
  { to: '/company/jobs', label: 'Manage Jobs', icon: <Briefcase size={18} /> },
  { to: '/company/talent', label: 'Candidates', icon: <Users size={18} /> },
  { to: '/company/saved', label: 'Saved Candidates', icon: <Bookmark size={18} /> },
  { to: '/company/messages', label: 'Messages', icon: <MessageSquare size={18} /> },
  { to: '/company/profile', label: 'Company Profile', icon: <Building2 size={18} /> },
];

export default function CompanyProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState(() => profileToForm(profile));
  const [customIndustry, setCustomIndustry] = useState('');
  const [saved, setSaved] = useState(false);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    setForm(profileToForm(profile));
  }, [profile]);

  useEffect(() => {
    api.companyProfileCompletion({ ...profile, ...form }, user.id).then(setCompletion);
  }, [profile, form, user.id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleIndustry = (i) =>
    set(
      'industry',
      form.industry.includes(i) ? form.industry.filter((x) => x !== i) : [...form.industry, i]
    );

  const save = async (e) => {
    e.preventDefault();
    await api.updateCompany(user.id, {
      ...form,
      recentJobCount: Number(form.recentJobCount) || 0,
    });
    refreshProfile();
    window.dispatchEvent(new Event('talentsphere-update'));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout
      topNav={<CompanyNav />}
      sidebar={
        <Sidebar
          items={sidebarItems}
          profile={{
            name: form.companyName || profile?.companyName || 'Your Company',
            subtitle: form.industry?.[0] || profile?.industry?.[0] || 'No industry set',
            initial: (form.companyName || profile?.companyName || 'C')[0],
          }}
          completion={completion}
        />
      }
    >
      <div className="dash-header">
        <div>
          <h1>Edit Company Profile</h1>
          <p>Update your company information for candidates</p>
        </div>
        <Link to="/company/dashboard" className="btn btn-outline btn-sm">
          Back to Dashboard
        </Link>
      </div>

      <form className="post-job-form card" onSubmit={save}>
        <div className="form-grid-2">
          <div className="form-group">
            <label>Company Name *</label>
            <input
              value={form.companyName}
              onChange={(e) => set('companyName', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>HQ Country</label>
            <input value={form.hqCountry} onChange={(e) => set('hqCountry', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Year Founded</label>
            <input
              type="number"
              value={form.yearFounded}
              onChange={(e) => set('yearFounded', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Company Type</label>
            <select value={form.companyType} onChange={(e) => set('companyType', e.target.value)}>
              <option value="">Select...</option>
              <option>Startup</option>
              <option>SME</option>
              <option>Enterprise</option>
            </select>
          </div>
          <div className="form-group">
            <label>Website</label>
            <input value={form.website} onChange={(e) => set('website', e.target.value)} />
          </div>
          <div className="form-group">
            <label>LinkedIn Profile Name</label>
            <input value={form.linkedinName} onChange={(e) => set('linkedinName', e.target.value)} />
          </div>
          <div className="form-group">
            <label>LinkedIn Profile URL</label>
            <input value={form.linkedinUrl} onChange={(e) => set('linkedinUrl', e.target.value)} />
          </div>
          <div className="form-group">
            <label>LinkedIn Logo URL</label>
            <input value={form.linkedinLogo} onChange={(e) => set('linkedinLogo', e.target.value)} />
          </div>
        </div>

        <div className="skills-section">
          <label>Industries</label>
          <div className="skills-input-row">
            <input
              placeholder="Type a custom industry..."
              value={customIndustry}
              onChange={(e) => setCustomIndustry(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                if (customIndustry.trim()) {
                  toggleIndustry(customIndustry.trim());
                  setCustomIndustry('');
                }
              }}
            >
              Add Industry
            </button>
          </div>
          <div className="skills-chips">
            {INDUSTRIES.map((i) => (
              <span
                key={i}
                className={`chip ${form.industry.includes(i) ? 'selected' : ''}`}
                onClick={() => toggleIndustry(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleIndustry(i)}
              >
                {i}
              </span>
            ))}
          </div>
          {form.industry.filter((i) => !INDUSTRIES.includes(i)).length > 0 && (
            <div className="skills-chips" style={{ marginTop: '0.5rem' }}>
              {form.industry
                .filter((i) => !INDUSTRIES.includes(i))
                .map((i) => (
                  <span
                    key={i}
                    className="chip selected"
                    onClick={() => toggleIndustry(i)}
                    role="button"
                    tabIndex={0}
                  >
                    {i}
                  </span>
                ))}
            </div>
          )}
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Recent Job Opening Title</label>
            <input value={form.recentJobTitle} onChange={(e) => set('recentJobTitle', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Number of Recent Job Openings</label>
            <input
              type="number"
              value={form.recentJobCount}
              onChange={(e) => set('recentJobCount', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group form-full">
          <label>Office Addresses</label>
          <textarea
            rows={3}
            value={form.officeAddresses}
            onChange={(e) => set('officeAddresses', e.target.value)}
          />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Subscription Plan</label>
            <select
              value={form.subscriptionPlan}
              onChange={(e) => set('subscriptionPlan', e.target.value)}
            >
              <option>Free</option>
              <option>Pro</option>
              <option>Enterprise</option>
            </select>
          </div>
          {profile?.verificationStatus && (
            <div className="form-group">
              <label>Verification Status</label>
              <input value={profile.verificationStatus} readOnly />
            </div>
          )}
        </div>

        {saved && <p className="profile-saved-msg">Profile saved successfully!</p>}

        <button type="submit" className="btn btn-white" style={{ width: '100%', marginTop: '1rem' }}>
          Save Profile
        </button>
      </form>
    </DashboardLayout>
  );
}
