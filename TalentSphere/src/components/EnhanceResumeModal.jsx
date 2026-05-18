import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, Check, Loader2 } from 'lucide-react';
import * as api from '../lib/api';
import { analyzeResumeEnhancement, applySuggestion } from '../lib/resumeEnhancement';

export default function EnhanceResumeModal({ userId, profile, onClose, onApplied }) {
  const [analyzing, setAnalyzing] = useState(true);
  const [appliedIds, setAppliedIds] = useState([]);
  const [applyingId, setApplyingId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    setAnalyzing(true);
    const t = setTimeout(() => {
      setSuggestions(analyzeResumeEnhancement(profile));
      setAnalyzing(false);
    }, 700);
    return () => clearTimeout(t);
  }, [profile]);

  const handleApply = async (suggestion) => {
    if (!suggestion.field || suggestion.suggested === undefined) return;
    setApplyingId(suggestion.id);
    const patch = applySuggestion(profile, suggestion);
    if (patch) {
      await api.updateCandidate(userId, patch);
      setAppliedIds((ids) => [...ids, suggestion.id]);
      onApplied?.();
    }
    setApplyingId(null);
  };

  const handleApplyAll = async () => {
    const applicable = suggestions.filter(
      (s) => s.field && s.suggested !== undefined && !appliedIds.includes(s.id)
    );
    if (!applicable.length) return;

    const patch = applicable.reduce((acc, s) => ({ ...acc, ...applySuggestion(profile, s) }), {});
    await api.updateCandidate(userId, patch);
    setAppliedIds((ids) => [...ids, ...applicable.map((s) => s.id)]);
    onApplied?.();
  };

  const applicableCount = suggestions.filter(
    (s) => s.field && s.suggested !== undefined
  ).length;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="enhance-resume-title">
      <div className="modal-card enhance-resume-modal card">
        <div className="modal-header">
          <div className="enhance-resume-heading">
            <Sparkles size={22} className="enhance-resume-icon" />
            <div>
              <h2 id="enhance-resume-title">Enhance Profile</h2>
              <p>Personalized suggestions based on your resume to improve profile</p>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {analyzing ? (
          <div className="enhance-resume-loading">
            <Loader2 size={32} className="enhance-resume-spinner" />
            <p>Analyzing your profile and resume details…</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="enhance-resume-empty">
            <Check size={40} style={{ color: 'var(--green)' }} />
            <h3>Your profile looks strong</h3>
            <p>No major improvements detected right now. Check back after updating your experience or skills.</p>
          </div>
        ) : (
          <>
            <div className="enhance-resume-actions-bar">
              <span>{suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}</span>
              {applicableCount > 0 && (
                <button type="button" className="btn btn-primary btn-sm" onClick={handleApplyAll}>
                  Apply all updates
                </button>
              )}
            </div>
            <ul className="enhance-resume-list">
              {suggestions.map((s) => {
                const isApplied = appliedIds.includes(s.id);
                const canApply = s.field && s.suggested !== undefined;
                return (
                  <li key={s.id} className={`enhance-suggestion enhance-suggestion--${s.priority}`}>
                    <div className="enhance-suggestion-head">
                      <span className="enhance-suggestion-category">{s.category}</span>
                      <span className={`enhance-priority enhance-priority--${s.priority}`}>{s.priority}</span>
                    </div>
                    <h4>{s.title}</h4>
                    <p>{s.description}</p>
                    {s.field === 'professionalSummary' && typeof s.suggested === 'string' && (
                      <blockquote className="enhance-suggestion-preview">{s.suggested}</blockquote>
                    )}
                    {s.field === 'skills' && Array.isArray(s.suggested) && (
                      <p className="enhance-suggestion-preview enhance-suggestion-skills">
                        {s.suggested.join(' · ')}
                      </p>
                    )}
                    {s.field === 'jobTitle' && (
                      <p className="enhance-suggestion-preview">
                        <strong>Suggested:</strong> {s.suggested}
                      </p>
                    )}
                    <div className="enhance-suggestion-footer">
                      {s.action === 'upload-resume' && (
                        <Link to="/candidate/profile" className="btn btn-outline btn-sm" onClick={onClose}>
                          Go to Profile
                        </Link>
                      )}
                      {s.action === 'upload-photo' && (
                        <Link to="/candidate/profile" className="btn btn-outline btn-sm" onClick={onClose}>
                          Add Photo
                        </Link>
                      )}
                      {canApply && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={isApplied || applyingId === s.id}
                          onClick={() => handleApply(s)}
                        >
                          {isApplied ? (
                            <>
                              <Check size={14} /> Applied
                            </>
                          ) : applyingId === s.id ? (
                            'Applying…'
                          ) : (
                            'Apply suggestion'
                          )}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <div className="modal-footer">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
            Close
          </button>
          {!analyzing && (
            <Link to="/candidate/profile" className="btn btn-white btn-sm" onClick={onClose}>
              Edit Profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
