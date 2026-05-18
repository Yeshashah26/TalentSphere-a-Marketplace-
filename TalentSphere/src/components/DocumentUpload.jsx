import { useRef } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { readResumeAsDataUrl } from '../lib/resume';

export default function DocumentUpload({
  file = '',
  fileName = '',
  onChange,
  label = 'Upload document',
  uploadLabel = 'Choose file',
  hint = 'PDF or Word (.doc, .docx). Max 5MB.',
}) {
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    try {
      const { dataUrl, fileName: name, mimeType } = await readResumeAsDataUrl(selected);
      onChange({ file: dataUrl, fileName: name, mimeType });
    } catch (err) {
      alert(err.message);
    }
    e.target.value = '';
  };

  const clear = () => onChange({ file: '', fileName: '', mimeType: '' });

  return (
    <div className="resume-upload">
      <label className="resume-upload-label">{label}</label>
      <div className="resume-upload-row">
        <div className="resume-preview">
          {file ? (
            <>
              <FileText size={28} />
              <span className="resume-file-name" title={fileName}>
                {fileName || 'Document uploaded'}
              </span>
            </>
          ) : (
            <span className="resume-placeholder">No file</span>
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
            <Upload size={16} /> {uploadLabel}
          </button>
          {file && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
              <X size={16} /> Remove
            </button>
          )}
          <p className="photo-hint">{hint}</p>
        </div>
      </div>
    </div>
  );
}
