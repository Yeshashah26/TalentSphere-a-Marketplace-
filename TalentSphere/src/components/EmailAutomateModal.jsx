import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2, Mail, Copy, Send, Check } from 'lucide-react';
import { generateOutreachEmail } from '../lib/emailAutomate';
import * as api from '../lib/api';

export default function EmailAutomateModal({
  candidate,
  company,
  companyUserId,
  jobs = [],
  onClose,
}) {
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(true);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [matchedJob, setMatchedJob] = useState(null);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setAnalyzing(true);
    const t = setTimeout(() => {
      const draft = generateOutreachEmail({ candidate, company, jobs });
      setSubject(draft.subject);
      setBody(draft.body);
      setMatchedJob(draft.matchedJobTitle);
      setAnalyzing(false);
    }, 550);
    return () => clearTimeout(t);
  }, [candidate, company, jobs]);

  const fullEmailText = `Subject: ${subject}\n\n${body}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullEmailText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  const handleMailto = () => {
    const to = candidate.email || '';
    const params = new URLSearchParams({
      subject,
      body,
    });
    window.location.href = `mailto:${encodeURIComponent(to)}?${params.toString()}`;
  };

  const handleSendInApp = async () => {
    setError('');
    setSending(true);
    try {
      await api.sendMessage({
        fromUserId: companyUserId,
        toUserId: candidate.userId,
        subject: subject.trim() || 'Opportunity at our company',
        body: body.trim(),
      });
      onClose();
      navigate(`/company/messages?to=${candidate.userId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="email-automate-title">
      <div className="modal-card assist-jd-modal card email-automate-modal">
        <div className="modal-header">
          <div className="enhance-resume-heading">
            <Mail size={20} className="enhance-resume-icon" />
            <div>
              <h2 id="email-automate-title">Email Automate</h2>
              <p>
                Draft for <strong>{candidate.fullName}</strong>
                {matchedJob ? ` · re: ${matchedJob}` : ''}
              </p>
            </div>
          </div>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {analyzing ? (
          <div className="enhance-resume-loading">
            <Loader2 size={28} className="enhance-resume-spinner" />
            <p>Writing your outreach email…</p>
          </div>
        ) : (
          <>
            {error && <p className="error-msg email-automate-error">{error}</p>}

            <div className="email-automate-form">
              <div className="form-group">
                <label>To</label>
                <input
                  value={candidate.email || 'No email on profile — use Send in app'}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
              </div>
            </div>

            <div className="assist-jd-actions email-automate-actions">
              <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              {candidate.email && (
                <button type="button" className="btn btn-outline btn-sm" onClick={handleMailto}>
                  <Mail size={14} /> Open in mail app
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={sending || !body.trim()}
                onClick={handleSendInApp}
              >
                <Send size={14} /> {sending ? 'Sending…' : 'Send in TalentSphere'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
