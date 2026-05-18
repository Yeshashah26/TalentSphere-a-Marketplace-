import { useState, useEffect } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { generateJobDescriptionDraft, mergeDescriptionWithDraft } from '../lib/jobDescriptionAssist';

export default function AssistJobDescriptionModal({ form, onClose, onApply }) {
  const [analyzing, setAnalyzing] = useState(true);
  const [draft, setDraft] = useState({ description: '', responsibilities: '', requirements: '' });
  const [mode, setMode] = useState('description');

  useEffect(() => {
    setAnalyzing(true);
    const t = setTimeout(() => {
      const generated = generateJobDescriptionDraft(form);
      setDraft({
        description: mergeDescriptionWithDraft(form.description, generated, form),
        responsibilities: generated.responsibilities,
        requirements: generated.requirements,
      });
      setAnalyzing(false);
    }, 600);
    return () => clearTimeout(t);
  }, [form]);

  const needsTitle = !form.title?.trim();

  const applyDescription = () => {
    onApply({ description: draft.description });
    onClose();
  };

  const applyAll = () => {
    onApply({
      description: draft.description,
      responsibilities: draft.responsibilities,
      requirements: draft.requirements,
    });
    onClose();
  };

  const previewValue =
    mode === 'responsibilities' ? draft.responsibilities : mode === 'requirements' ? draft.requirements : draft.description;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="assist-jd-title">
      <div className="modal-card assist-jd-modal card">
        <div className="modal-header">
          <div className="enhance-resume-heading">
            <Sparkles size={20} className="enhance-resume-icon" />
            <div>
              <h2 id="assist-jd-title">AI job description</h2>
              <p>Draft generated from your job details — review and edit before applying</p>
            </div>
          </div>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {needsTitle && (
          <p className="assist-jd-warning" role="alert">
            Add a <strong>Job Title</strong> first for a more accurate draft.
          </p>
        )}

        {analyzing ? (
          <div className="enhance-resume-loading">
            <Loader2 size={28} className="enhance-resume-spinner" />
            <p>Writing your job description…</p>
          </div>
        ) : (
          <>
            <div className="assist-jd-tabs">
              <button
                type="button"
                className={mode === 'description' ? 'active' : ''}
                onClick={() => setMode('description')}
              >
                Description
              </button>
              <button
                type="button"
                className={mode === 'responsibilities' ? 'active' : ''}
                onClick={() => setMode('responsibilities')}
              >
                Responsibilities
              </button>
              <button
                type="button"
                className={mode === 'requirements' ? 'active' : ''}
                onClick={() => setMode('requirements')}
              >
                Requirements
              </button>
            </div>

            <textarea
              className="assist-jd-preview"
              rows={8}
              value={previewValue}
              onChange={(e) => setDraft((d) => ({ ...d, [mode]: e.target.value }))}
            />

            <div className="assist-jd-actions">
              <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={applyDescription}>
                Use description only
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={applyAll}>
                <Sparkles size={14} /> Apply all sections
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
