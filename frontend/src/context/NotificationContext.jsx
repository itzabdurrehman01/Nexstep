import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext(null);

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Admissions Open: FAST-NUCES & NUST',
    message: 'Spring admissions are now open. Merit cutoffs and eligibility criteria have been synced to your dashboard.',
    type: 'deadline',
    time: '10m ago',
    read: false,
    link: 'universities',
  },
  {
    id: 'notif-2',
    title: 'AI Career Assessment Ready',
    message: 'Your RIASEC Holland Profile matches 14 high-growth engineering & software careers in Pakistan.',
    type: 'ai',
    time: '1h ago',
    read: false,
    link: 'careerAi',
  },
  {
    id: 'notif-3',
    title: 'PEEF & Ehsaas Scholarships Active',
    message: 'New undergraduate merit & need-based scholarship quotas announced for Punjab, Sindh & KPK.',
    type: 'opportunity',
    time: '3h ago',
    read: false,
    link: 'scholarships',
  },
  {
    id: 'notif-4',
    title: 'System Security Verified',
    message: 'Two-factor OTP authentication and cryptographic timing protections are active on your account.',
    type: 'system',
    time: '1d ago',
    read: true,
    link: 'settings',
  },
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('nexstep_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem('nexstep_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Could not persist notifications:', e);
    }
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type, title, message, duration = 4000) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    const newToast = { id, type, title, message, duration };
    setToasts(prev => [newToast, ...prev].slice(0, 5));

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (title, message, duration) => showToast('success', title, message, duration),
    error:   (title, message, duration) => showToast('error', title, message, duration),
    warning: (title, message, duration) => showToast('warning', title, message, duration),
    info:    (title, message, duration) => showToast('info', title, message, duration),
  };

  const addNotification = useCallback((notif) => {
    const newNotif = {
      id: 'notif-' + Date.now(),
      time: 'Just now',
      read: false,
      ...notif,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        toast,
        showToast,
        removeToast,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

export default NotificationContext;
