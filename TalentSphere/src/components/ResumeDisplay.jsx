import { FileText, Download, ExternalLink } from 'lucide-react';
import { downloadResume, hasResume } from '../lib/resume';

export default function ResumeDisplay({ candidate, compact = false }) {
  if (!hasResume(candidate)) return null;

  const fileName = candidate.resumeFileName || 'Resume';

  if (compact) {
    return (
      <div className="resume-display resume-display--compact">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => downloadResume(candidate)}
        >
          <Download size={14} /> Resume
        </button>
      </div>
    );
  }

  return (
    <div className="resume-display">
      <FileText size={18} />
      <span className="resume-display-name" title={fileName}>{fileName}</span>
      <div className="resume-display-actions">
        <a
          href={candidate.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm"
        >
          <ExternalLink size={14} /> View
        </a>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => downloadResume(candidate)}
        >
          <Download size={14} /> Download
        </button>
      </div>
    </div>
  );
}
