import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, Sparkles } from 'lucide-react';
import DashboardLayout, { CompanyNav } from '../../components/DashboardLayout';
import DocumentUpload from '../../components/DocumentUpload';
import AssistJobDescriptionModal from '../../components/AssistJobDescriptionModal';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../lib/api';
import '../DashboardPages.css';

const empty = {
  title: '', department: '', employmentType: '', country: '', state: '', city: '',
  jobLevel: '', openings: '', remoteEligible: '', workMode: '',
  description: '', responsibilities: '', requirements: '', experienceYears: '', certifications: '',
  descriptionFile: '', descriptionFileName: '', descriptionMimeType: '',
  salaryMin: '', salaryMax: '', benefits: '', deadline: '',
};

export default function CompanyPostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [assistOpen, setAssistOpen] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return alert('Job title is required');
    await api.createJob(user.id, form);
    alert('Job submitted for admin approval!');
    navigate('/company/jobs');
  };

  return (
    <DashboardLayout topNav={<CompanyNav />}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Post a Job</h1>
      <form className="post-job-form card" onSubmit={handleSubmit}>
        <h3 className="form-section-title">Basic Info</h3>
        <div className="form-group form-full"><label>Job Title</label><input placeholder="e.g., Senior Frontend Engineer" value={form.title} onChange={(e) => set('title', e.target.value)} required /></div>
        <div className="form-grid-2">
          <div className="form-group"><label>Department</label><select value={form.department} onChange={(e) => set('department', e.target.value)}><option value="">Select...</option><option>Engineering</option><option>Design</option><option>Marketing</option><option>Sales</option></select></div>
          <div className="form-group"><label>Employment Type</label><select value={form.employmentType} onChange={(e) => set('employmentType', e.target.value)}><option value="">Select...</option><option>Full time</option><option>Part time</option><option>Contract</option><option>Internship</option></select></div>
          <div className="form-group"><label>Country</label><input placeholder="e.g., United States" value={form.country} onChange={(e) => set('country', e.target.value)} /></div>
          <div className="form-group"><label>State / Province</label><input placeholder="e.g., California" value={form.state} onChange={(e) => set('state', e.target.value)} /></div>
          <div className="form-group"><label>City</label><input placeholder="e.g., San Francisco" value={form.city} onChange={(e) => set('city', e.target.value)} /></div>
          <div className="form-group"><label>Job Level</label><select value={form.jobLevel} onChange={(e) => set('jobLevel', e.target.value)}><option value="">Select level...</option><option>Junior</option><option>Mid</option><option>Senior</option><option>Lead</option></select></div>
          <div className="form-group"><label>Number of Openings</label><input type="number" placeholder="e.g., 2" value={form.openings} onChange={(e) => set('openings', e.target.value)} /></div>
          <div className="form-group"><label>Remote Eligible</label><select value={form.remoteEligible} onChange={(e) => set('remoteEligible', e.target.value)}><option value="">Select...</option><option>Yes</option><option>No</option></select></div>
          <div className="form-group"><label>Work Mode</label><select value={form.workMode} onChange={(e) => set('workMode', e.target.value)}><option value="">Select...</option><option>Remote</option><option>Hybrid</option><option>Onsite</option></select></div>
        </div>
        <h3 className="form-section-title">Job Details</h3>
        <div className="form-group form-full">
          <DocumentUpload
            label="Upload job description (PDF / DOC)"
            uploadLabel="Upload file"
            file={form.descriptionFile}
            fileName={form.descriptionFileName}
            onChange={({ file, fileName, mimeType }) =>
              setForm((f) => ({
                ...f,
                descriptionFile: file,
                descriptionFileName: fileName,
                descriptionMimeType: mimeType,
              }))
            }
          />
        </div>
        <div className="form-group form-full">
          <div className="form-label-row">
            <label>Description</label>
            <button
              type="button"
              className="btn-ai-assist"
              title="Generate job description with AI assist"
              onClick={() => setAssistOpen(true)}
            >
              <Sparkles size={14} /> AI
            </button>
          </div>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Describe the role, team, and what success looks like..."
          />
        </div>
        <div className="form-group form-full"><label>Responsibilities</label><textarea rows={3} value={form.responsibilities} onChange={(e) => set('responsibilities', e.target.value)} /></div>
        <div className="form-group form-full"><label>Requirements</label><textarea rows={3} value={form.requirements} onChange={(e) => set('requirements', e.target.value)} /></div>
        <div className="form-group form-full"><label>Experience Required (years)</label><input type="number" value={form.experienceYears} onChange={(e) => set('experienceYears', e.target.value)} /></div>
        <div className="form-group form-full"><label>Certifications Required (if any)</label><input placeholder="e.g., AWS Certified, PMP" value={form.certifications} onChange={(e) => set('certifications', e.target.value)} /></div>
        <h3 className="form-section-title">Compensation</h3>
        <div className="form-grid-2">
          <div className="form-group"><label>Salary Min ($)</label><input type="number" value={form.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} /></div>
          <div className="form-group"><label>Salary Max ($)</label><input type="number" value={form.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} /></div>
        </div>
        <div className="form-group form-full"><label>Benefits</label><textarea rows={3} value={form.benefits} onChange={(e) => set('benefits', e.target.value)} /></div>
        <div className="form-group form-full"><label>Application Deadline</label><input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} /></div>
        <button type="submit" className="btn btn-white" style={{ width: '100%', marginTop: '1rem' }}><FilePlus size={18} /> Post Job</button>
      </form>

      {assistOpen && (
        <AssistJobDescriptionModal
          form={form}
          onClose={() => setAssistOpen(false)}
          onApply={(patch) => setForm((f) => ({ ...f, ...patch }))}
        />
      )}
    </DashboardLayout>
  );
}
