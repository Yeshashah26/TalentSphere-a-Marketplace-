import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNav from '../components/PublicNav';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Energy', 'Telecommunications'];

export default function CompanyRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [form, setForm] = useState({
    email: '', password: '', companyName: '', hqCountry: '', yearFounded: '',
    companyType: '', website: '', linkedinName: '', linkedinUrl: '', linkedinLogo: '',
    industry: [], recentJobTitle: '', recentJobCount: '', officeAddresses: '', subscriptionPlan: 'Free',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleIndustry = (i) => set('industry', form.industry.includes(i) ? form.industry.filter((x) => x !== i) : [...form.industry, i]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({
        email: form.email,
        password: form.password,
        role: 'company',
        profile: { name: form.companyName, ...form, recentJobCount: Number(form.recentJobCount) || 0 },
      });
      navigate('/company/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="starry-bg auth-page">
      <PublicNav />
      <form className="register-form-card card" onSubmit={handleSubmit}>
        <h2>Company Registration</h2>
        <p className="form-sub">Set up your company account to start hiring</p>
        <div className="form-grid-2">
          <div className="form-group"><label>Email ID *</label><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required /></div>
          <div className="form-group"><label>Create Password *</label><input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required /></div>
          <div className="form-group"><label>Company Name *</label><input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} required /></div>
          <div className="form-group"><label>HQ Country</label><input value={form.hqCountry} onChange={(e) => set('hqCountry', e.target.value)} /></div>
          <div className="form-group"><label>Year Founded</label><input type="number" value={form.yearFounded} onChange={(e) => set('yearFounded', e.target.value)} /></div>
          <div className="form-group"><label>Company Type</label><select value={form.companyType} onChange={(e) => set('companyType', e.target.value)}><option value="">Select...</option><option>Startup</option><option>SME</option><option>Enterprise</option></select></div>
          <div className="form-group"><label>Website</label><input value={form.website} onChange={(e) => set('website', e.target.value)} /></div>
          <div className="form-group"><label>LinkedIn Profile Name</label><input value={form.linkedinName} onChange={(e) => set('linkedinName', e.target.value)} /></div>
          <div className="form-group"><label>LinkedIn Profile URL</label><input value={form.linkedinUrl} onChange={(e) => set('linkedinUrl', e.target.value)} /></div>
          <div className="form-group"><label>LinkedIn Logo URL</label><input value={form.linkedinLogo} onChange={(e) => set('linkedinLogo', e.target.value)} /></div>
        </div>
        <div className="skills-section">
          <label>Industries</label>
          <div className="skills-input-row">
            <input placeholder="Type a custom industry..." value={customIndustry} onChange={(e) => setCustomIndustry(e.target.value)} />
            <button type="button" className="btn btn-outline btn-sm" onClick={() => { if (customIndustry.trim()) { toggleIndustry(customIndustry.trim()); setCustomIndustry(''); } }}>Add Industry</button>
          </div>
          <div className="skills-chips">{INDUSTRIES.map((i) => (<span key={i} className={`chip ${form.industry.includes(i) ? 'selected' : ''}`} onClick={() => toggleIndustry(i)} role="button" tabIndex={0}>{i}</span>))}</div>
        </div>
        <div className="form-grid-2">
          <div className="form-group"><label>Recent Job Opening Title</label><input value={form.recentJobTitle} onChange={(e) => set('recentJobTitle', e.target.value)} /></div>
          <div className="form-group"><label>Number of Recent Job Openings</label><input type="number" value={form.recentJobCount} onChange={(e) => set('recentJobCount', e.target.value)} /></div>
        </div>
        <div className="form-group form-full"><label>Office Addresses</label><textarea rows={3} value={form.officeAddresses} onChange={(e) => set('officeAddresses', e.target.value)} /></div>
        <div className="form-grid-2">
          <div className="form-group"><label>Subscription Plan</label><select value={form.subscriptionPlan} onChange={(e) => set('subscriptionPlan', e.target.value)}><option>Free</option><option>Pro</option><option>Enterprise</option></select></div>
          <div className="form-group"><label>Platform</label><input value="TalentSphere" readOnly /></div>
        </div>
        {error && <p className="error-msg">{error}</p>}
        <button type="submit" className="btn btn-white" style={{ width: '100%', marginTop: '1rem' }}>Create Account</button>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
