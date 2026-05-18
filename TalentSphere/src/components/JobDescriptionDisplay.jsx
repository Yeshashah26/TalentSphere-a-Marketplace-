import { FileText, Download, ExternalLink } from 'lucide-react';
import { downloadResume } from '../lib/resume';

export function hasJobDescription(job) {
  return Boolean(job?.descriptionFile);
}

export default function JobDescriptionDisplay({ job, compact = false }) {
  if (!hasJobDescription(job)) return null;

  const fileName = job.descriptionFileName || 'Job description';

  const doc = {
    resume: job.descriptionFile,
    resumeFileName: job.descriptionFileName,
    resumeMimeType: job.descriptionMimeType,
  };

  if (compact) {
    return (
      <div className="resume-display resume-display--compact">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => downloadResume(doc)}
        >
          <Download size={14} /> Job description
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
          href={job.descriptionFile}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm"
        >
          <ExternalLink size={14} /> View
        </a>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => downloadResume(doc)}
        >
          <Download size={14} /> Download
        </button>
      </div>
    </div>
  );
}
