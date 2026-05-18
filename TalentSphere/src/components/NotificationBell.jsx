import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import './NotificationBell.css';

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tick, setTick] = useState(0);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [list, count] = await Promise.all([
        api.getNotifications(user.id),
        api.getUnreadNotificationCount(user.id),
      ]);
      if (!cancelled) {
        setNotifications(list);
        setUnreadCount(count);
      }
    })();
    return () => { cancelled = true; };
  }, [user, tick]);

  useEffect(() => {
    const onUpdate = () => setTick((t) => t + 1);
    window.addEventListener('talentsphere-update', onUpdate);
    return () => window.removeEventListener('talentsphere-update', onUpdate);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  if (!user) return null;

  const refresh = () => setTick((t) => t + 1);

  const handleMarkRead = async (id) => {
    await api.markNotificationRead(id);
    refresh();
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead(user.id);
    refresh();
  };

  return (
    <div className="notif-bell-wrap" ref={panelRef}>
      <button
        type="button"
        className={`icon-btn notif-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel card">
          <div className="notif-panel-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button type="button" className="notif-mark-all" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div className="notif-panel-body">
            {notifications.length === 0 ? (
              <p className="notif-empty">No notifications yet</p>
            ) : (
              <ul className="notif-list">
                {notifications.map((n) => (
                  <li key={n.id} className={n.read ? 'read' : 'unread'}>
                    <button
                      type="button"
                      className="notif-item"
                      onClick={() => !n.read && handleMarkRead(n.id)}
                    >
                      <strong>{n.title}</strong>
                      <p>{n.message}</p>
                      <small>{new Date(n.createdAt).toLocaleString()}</small>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
