import { useRef } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { readResumeAsDataUrl } from '../lib/resume';

export default function ResumeUpload({
  resume = '',
  resumeFileName = '',
  onChange,
  label = 'Upload resume',
}) {
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl, fileName, mimeType } = await readResumeAsDataUrl(file);
      onChange({ resume: dataUrl, resumeFileName: fileName, resumeMimeType: mimeType });
    } catch (err) {
      alert(err.message);
    }
    e.target.value = '';
  };

  const clear = () => onChange({ resume: '', resumeFileName: '', resumeMimeType: '' });

  return (
    <div className="resume-upload">
      <label className="resume-upload-label">{label}</label>
      <div className="resume-upload-row">
        <div className="resume-preview">
          {resume ? (
            <>
              <FileText size={28} />
              <span className="resume-file-name" title={resumeFileName}>
                {resumeFileName || 'Resume uploaded'}
              </span>
            </>
          ) : (
            <span className="resume-placeholder">No resume</span>
          )}
        </div>
        <div className="resume-upload-actions">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="photo-input-hidden"
            onChange={handleFile}
          />
          <button type="button" className="btn btn-outline btn-sm" onClick={() => inputRef.current?.click()}>
            <Upload size={16} /> Upload resume
          </button>
          {resume && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
              <X size={16} /> Remove
            </button>
          )}
          <p className="photo-hint">PDF or Word (.doc, .docx). Max 5MB.</p>
        </div>
      </div>
    </div>
  );
}
