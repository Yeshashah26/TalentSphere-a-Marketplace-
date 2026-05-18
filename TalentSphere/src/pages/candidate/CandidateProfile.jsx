import { useState, useEffect } from 'react';
import DashboardLayout, { CandidateNav, Sidebar } from '../../components/DashboardLayout';
import ProfilePhotoUpload from '../../components/ProfilePhotoUpload';
import ResumeUpload from '../../components/ResumeUpload';
import ResumeDisplay from '../../components/ResumeDisplay';
import { useAuth } from '../../context/AuthContext';
import { getCandidateSidebarItems, getCandidateProfileProps } from '../../lib/candidateNav';
import * as api from '../../lib/api';
import '../Auth.css';

const PRESET_SKILLS = ['React', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Kubernetes'];

const emptyForm = {
  fullName: '',
  phone: '',
  jobTitle: '',
  yearsExp: '',
  monthsExp: '',
  skills: [],
  linkedin: '',
  portfolio: '',
  education: '',
  graduationYear: '',
  openToWork: true,
  profilePhoto: '',
  resume: '',
  resumeFileName: '',
  resumeMimeType: '',
  professionalSummary: '',
};

function profileToForm(profile) {
  if (!profile) return { ...emptyForm };
  return {
    fullName: profile.fullName || '',
    phone: profile.phone || '',
    jobTitle: profile.jobTitle || '',
    yearsExp: profile.yearsExp ?? '',
    monthsExp: profile.monthsExp ?? '',
    skills: Array.isArray(profile.skills) ? [...profile.skills] : [],
    linkedin: profile.linkedin || '',
    portfolio: profile.portfolio || '',
    education: profile.education || '',
    graduationYear: profile.graduationYear ?? '',
    openToWork: profile.openToWork ?? true,
    profilePhoto: profile.profilePhoto || '',
    resume: profile.resume || '',
    resumeFileName: profile.resumeFileName || '',
    resumeMimeType: profile.resumeMimeType || '',
    professionalSummary: profile.professionalSummary || '',
  };
}

export default function CandidateProfile() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState(() => profileToForm(profile));
  const [customSkill, setCustomSkill] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(profileToForm(profile));
  }, [profile]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleSkill = (s) =>
    set(
      'skills',
      form.skills.includes(s) ? form.skills.filter((x) => x !== s) : [...form.skills, s]
    );
  const addCustomSkill = () => {
    if (customSkill.trim() && !form.skills.includes(customSkill.trim())) {
      set('skills', [...form.skills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    api.profileCompletion({ ...profile, ...form }, user.id).then(setCompletion);
  }, [profile, form, user.id]);

  const save = async (e) => {
    e.preventDefault();
    await api.updateCandidate(user.id, {
      ...form,
      yearsExp: Number(form.yearsExp) || 0,
      monthsExp: Number(form.monthsExp) || 0,
    });
    setSaved(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <DashboardLayout
      topNav={<CandidateNav />}
      sidebar={
        <Sidebar
          items={getCandidateSidebarItems()}
          profile={getCandidateProfileProps(user, { ...profile, ...form })}
          completion={completion}
        />
      }
    >
      <div className="dash-header">
        <div>
          <h1>Edit Profile</h1>
          <p>View and update your professional details</p>
        </div>
        <span className="badge badge-applied">{completion}% complete</span>
      </div>

      <form className="card register-form-card profile-edit-form" onSubmit={save}>
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
        {form.resume && (
          <ResumeDisplay candidate={form} />
        )}

        <div className="form-group form-full">
          <label>Professional summary</label>
          <textarea
            rows={4}
            value={form.professionalSummary}
            onChange={(e) => set('professionalSummary', e.target.value)}
            placeholder="Short summary for your resume — use Enhance Profile on the dashboard for suggestions"
          />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Email ID</label>
            <input type="email" value={user?.email || profile?.email || ''} readOnly />
          </div>
          <div className="form-group">
            <label>Account</label>
            <input value="Candidate" readOnly />
          </div>
          <div className="form-group">
            <label>Full Name *</label>
            <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="form-group form-grid-span-2">
            <label>Job Title</label>
            <input value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} />
          </div>
        </div>

        <div className="form-grid-exp">
          <div className="form-group">
            <label>Years of Exp.</label>
            <input
              type="number"
              min="0"
              value={form.yearsExp}
              onChange={(e) => set('yearsExp', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Months of Exp.</label>
            <input
              type="number"
              min="0"
              max="11"
              value={form.monthsExp}
              onChange={(e) => set('monthsExp', e.target.value)}
            />
          </div>
        </div>

        <div className="skills-section">
          <label>Skills</label>
          <div className="skills-input-row">
            <input
              placeholder="Type a custom skill..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
            />
            <button type="button" className="btn btn-outline btn-sm" onClick={addCustomSkill}>
              Add Skill
            </button>
          </div>
          <div className="skills-chips">
            {PRESET_SKILLS.map((s) => (
              <span
                key={s}
                className={`chip ${form.skills.includes(s) ? 'selected' : ''}`}
                onClick={() => toggleSkill(s)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleSkill(s)}
              >
                {s}
              </span>
            ))}
          </div>
          {form.skills.filter((s) => !PRESET_SKILLS.includes(s)).length > 0 && (
            <div className="skills-chips" style={{ marginTop: '0.5rem' }}>
              {form.skills
                .filter((s) => !PRESET_SKILLS.includes(s))
                .map((s) => (
                  <span
                    key={s}
                    className="chip selected"
                    onClick={() => toggleSkill(s)}
                    role="button"
                    tabIndex={0}
                  >
                    {s}
                  </span>
                ))}
            </div>
          )}
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>LinkedIn</label>
            <input value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="Profile URL" />
          </div>
          <div className="form-group">
            <label>Portfolio Link</label>
            <input value={form.portfolio} onChange={(e) => set('portfolio', e.target.value)} placeholder="https://" />
          </div>
          <div className="form-group">
            <label>Education Degree</label>
            <input
              value={form.education}
              onChange={(e) => set('education', e.target.value)}
              placeholder="e.g. B.Tech IT"
            />
          </div>
          <div className="form-group">
            <label>Graduation Year</label>
            <input
              type="number"
              value={form.graduationYear}
              onChange={(e) => set('graduationYear', e.target.value)}
            />
          </div>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.openToWork}
            onChange={(e) => set('openToWork', e.target.checked)}
          />
          I&apos;m open to work
        </label>

        <div className="form-group">
          <label>Platform</label>
          <input value="TalentSphere" readOnly />
        </div>

        {saved && <p className="profile-saved-msg">Profile saved successfully!</p>}

        <button type="submit" className="btn btn-white auth-submit-full">Save Profile</button>
      </form>
    </DashboardLayout>
  );
}
