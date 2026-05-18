import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import './Messages.css';
import './DashboardPages.css';

export default function Messages({ layout: Layout, topNav }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const toParam = searchParams.get('to');

  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [firstSubject, setFirstSubject] = useState('Opportunity at our company');
  const [firstBody, setFirstBody] = useState('');
  const [pendingName, setPendingName] = useState('');
  const [error, setError] = useState('');
  const [threads, setThreads] = useState([]);

  const isCandidate = user?.role === 'candidate';
  const isCompany = user?.role === 'company';

  useEffect(() => {
    if (!user) return;
    api.getMessageThreads(user.id).then(setThreads);
  }, [user, refreshKey]);

  useEffect(() => {
    if (toParam) setSelectedThreadId(toParam);
  }, [toParam]);

  useEffect(() => {
    if (!toParam || !isCompany) return;
    if (threads.some((t) => t.otherUserId === toParam)) return;
    api.getCandidate(toParam).then((c) => setPendingName(c?.fullName || 'Candidate'));
  }, [toParam, threads, isCompany]);

  const existingThread = threads.find((t) => t.otherUserId === selectedThreadId);
  const isNewConversation = Boolean(isCompany && selectedThreadId && !existingThread);

  const selectedThread = useMemo(() => {
    if (existingThread) return existingThread;
    if (isNewConversation) {
      return {
        otherUserId: selectedThreadId,
        otherName: pendingName || 'Candidate',
        messages: [],
        canReply: true,
        otherUser: { role: 'candidate' },
      };
    }
    if (!isNewConversation && threads.length) {
      const pick = threads.find((t) => t.otherUserId === selectedThreadId) || threads[0];
      return pick;
    }
    return null;
  }, [existingThread, isNewConversation, selectedThreadId, pendingName, threads]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleReply = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedThread || !replyBody.trim()) return;
    try {
      await api.replyToThread({
        fromUserId: user.id,
        toUserId: selectedThread.otherUserId,
        body: replyBody.trim(),
      });
      setReplyBody('');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFirstMessage = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedThread || !firstBody.trim()) return;
    try {
      await api.sendMessage({
        fromUserId: user.id,
        toUserId: selectedThread.otherUserId,
        subject: firstSubject.trim() || 'Message from company',
        body: firstBody.trim(),
      });
      setFirstBody('');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const content = (
    <div className="messages-page">
      <div className="dash-header">
        <div>
          <h1>Messages</h1>
          <p>
            {isCandidate
              ? 'Reply to companies that have contacted you'
              : 'View conversations and follow up with candidates'}
          </p>
        </div>
      </div>

      {error && <p className="error-msg messages-error">{error}</p>}

      {isCandidate && threads.length === 0 && (
        <div className="card messages-hint">
          <p>You cannot start a new conversation. When a company messages you about a job, you will be able to reply here.</p>
        </div>
      )}

      {isCompany && threads.length === 0 && !toParam && (
        <div className="card messages-hint">
          <p>No messages yet. Use <strong>Reach out</strong> on Find Talent to message a candidate.</p>
        </div>
      )}

      <div className="messages-layout">
        <aside className="card messages-threads">
          <h3>Conversations</h3>
          {threads.length === 0 && !isNewConversation ? (
            <p className="empty-text">No messages yet</p>
          ) : (
            <ul className="thread-list">
              {isNewConversation && (
                <li>
                  <button type="button" className="thread-item active">
                    <strong>{pendingName || 'Candidate'}</strong>
                    <span className="thread-role">candidate</span>
                    <p>New conversation</p>
                  </button>
                </li>
              )}
              {threads.map((t) => (
                <li key={t.otherUserId}>
                  <button
                    type="button"
                    className={`thread-item ${selectedThread?.otherUserId === t.otherUserId && !isNewConversation ? 'active' : ''}`}
                    onClick={() => setSelectedThreadId(t.otherUserId)}
                  >
                    <strong>{t.otherName}</strong>
                    <span className="thread-role">{t.otherUser?.role}</span>
                    <p>{t.lastMessage.body.slice(0, 60)}{t.lastMessage.body.length > 60 ? '…' : ''}</p>
                    <small>{new Date(t.lastMessage.createdAt).toLocaleString()}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="card messages-thread-view">
          {!selectedThread ? (
            <div className="empty-state">
              <Mail size={48} />
              <p>{isCandidate ? 'Select a conversation to view and reply' : 'Select a conversation'}</p>
            </div>
          ) : isNewConversation ? (
            <>
              <div className="thread-view-header">
                <h3>{selectedThread.otherName}</h3>
                <span className="thread-role-badge">candidate</span>
              </div>
              <p className="messages-new-hint">Send your first message to start the conversation.</p>
              <form className="reply-form messages-first-form" onSubmit={handleFirstMessage}>
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    value={firstSubject}
                    onChange={(e) => setFirstSubject(e.target.value)}
                    placeholder="Regarding an opportunity"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    rows={4}
                    value={firstBody}
                    onChange={(e) => setFirstBody(e.target.value)}
                    placeholder="Introduce your company and role..."
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Send size={16} /> Send message
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="thread-view-header">
                <h3>{selectedThread.otherName}</h3>
                <span className="thread-role-badge">{selectedThread.otherUser?.role}</span>
              </div>
              <ul className="message-bubbles">
                {selectedThread.messages.map((m) => {
                  const isMine = m.fromUserId === user.id;
                  return (
                    <li key={m.id} className={`bubble ${isMine ? 'mine' : 'theirs'}`}>
                      <p>{m.body}</p>
                      <small>
                        {isMine ? 'You' : selectedThread.otherName}
                        {' · '}
                        {new Date(m.createdAt).toLocaleString()}
                      </small>
                    </li>
                  );
                })}
              </ul>

              {selectedThread.canReply ? (
                <form className="reply-form" onSubmit={handleReply}>
                  <textarea
                    rows={3}
                    placeholder="Type your message..."
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={16} /> Send message
                  </button>
                </form>
              ) : (
                <p className="messages-reply-blocked">
                  You can only reply after a company has messaged you first.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );

  if (Layout) return <Layout topNav={topNav}>{content}</Layout>;
  return content;
}
