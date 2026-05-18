import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNav from '../components/PublicNav';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import ResumeUpload from '../components/ResumeUpload';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const PRESET_SKILLS = ['React', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Kubernetes'];

export default function CandidateRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', phone: '', jobTitle: '',
    yearsExp: '', monthsExp: '', skills: [], linkedin: '', portfolio: '',
    education: '', graduationYear: '', openToWork: true, profilePhoto: '',
    resume: '', resumeFileName: '', resumeMimeType: '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleSkill = (s) => set('skills', form.skills.includes(s) ? form.skills.filter((x) => x !== s) : [...form.skills, s]);
  const addCustomSkill = () => {
    if (customSkill.trim() && !form.skills.includes(customSkill.trim())) {
      set('skills', [...form.skills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password || !form.fullName) {
      setError('Please fill all required fields.');
      return;
    }
    try {
      await register({
        email: form.email,
        password: form.password,
        role: 'candidate',
        profile: {
          name: form.fullName,
          fullName: form.fullName,
          phone: form.phone,
          jobTitle: form.jobTitle,
          yearsExp: Number(form.yearsExp) || 0,
          monthsExp: Number(form.monthsExp) || 0,
          skills: form.skills,
          linkedin: form.linkedin,
          portfolio: form.portfolio,
          education: form.education,
          graduationYear: form.graduationYear,
          openToWork: form.openToWork,
          profilePhoto: form.profilePhoto,
          resume: form.resume,
          resumeFileName: form.resumeFileName,
          resumeMimeType: form.resumeMimeType,
        },
      });
      navigate('/candidate/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="starry-bg auth-page">
      <PublicNav />
      <form className="register-form-card card" onSubmit={handleSubmit}>
        <h2>Candidate Registration</h2>
        <p className="form-sub">Create your profile to start finding opportunities</p>

        <ProfilePhotoUpload
          label="Upload image"
          value={form.profilePhoto}
          onChange={(v) => set('profilePhoto', v)}
        />

        <ResumeUpload
          label="Upload resume"
          resume={form.resume}
          resumeFileName={form.resumeFileName}
          onChange={({ resume, resumeFileName, resumeMimeType }) => {
            set('resume', resume);
            set('resumeFileName', resumeFileName);
            set('resumeMimeType', resumeMimeType);
          }}
        />

        <div className="form-grid-2">
          <div className="form-group"><label>Email ID *</label><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required /></div>
          <div className="form-group"><label>Create Password *</label><input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required /></div>
          <div className="form-group"><label>Full Name *</label><input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required /></div>
          <div className="form-group"><label>Phone *</label><input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
          <div className="form-group form-grid-span-2"><label>Job Title</label><input value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} /></div>
        </div>
        <div className="form-grid-exp">
          <div className="form-group"><label>Years of Exp.</label><input type="number" min="0" value={form.yearsExp} onChange={(e) => set('yearsExp', e.target.value)} /></div>
          <div className="form-group"><label>Months of Exp.</label><input type="number" min="0" max="11" value={form.monthsExp} onChange={(e) => set('monthsExp', e.target.value)} /></div>
        </div>
        <div className="skills-section">
          <label>Skills</label>
          <div className="skills-input-row">
            <input placeholder="Type a custom skill..." value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())} />
            <button type="button" className="btn btn-outline btn-sm" onClick={addCustomSkill}>Add Skill</button>
          </div>
          <div className="skills-chips">{PRESET_SKILLS.map((s) => (<span key={s} className={`chip ${form.skills.includes(s) ? 'selected' : ''}`} onClick={() => toggleSkill(s)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleSkill(s)}>{s}</span>))}</div>
        </div>
        <div className="form-grid-2">
          <div className="form-group"><label>LinkedIn</label><input value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} /></div>
          <div className="form-group"><label>Portfolio Link</label><input value={form.portfolio} onChange={(e) => set('portfolio', e.target.value)} /></div>
          <div className="form-group"><label>Education Degree</label><input value={form.education} onChange={(e) => set('education', e.target.value)} placeholder="e.g. B.Tech IT" /></div>
          <div className="form-group"><label>Graduation Year</label><input type="number" value={form.graduationYear} onChange={(e) => set('graduationYear', e.target.value)} /></div>
        </div>
        <label className="checkbox-row">
          <input type="checkbox" checked={form.openToWork} onChange={(e) => set('openToWork', e.target.checked)} /> I&apos;m open to work
        </label>
        <div className="form-group"><label>Platform</label><input value="TalentSphere" readOnly /></div>
        {error && <p className="error-msg">{error}</p>}
        <button type="submit" className="btn btn-white auth-submit-full">Create Account</button>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
