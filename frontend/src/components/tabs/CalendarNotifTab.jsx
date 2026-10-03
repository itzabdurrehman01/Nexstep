import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Filter, 
  Settings, 
  Sparkles, 
  Star, 
  Trash2, 
  Search, 
  Volume2, 
  VolumeX, 
  Radio, 
  Check, 
  Video, 
  Briefcase, 
  ShieldAlert, 
  ArrowUpRight, 
  Download, 
  RefreshCw, 
  ChevronRight, 
  Plus, 
  X,
  GraduationCap,
  Award,
  Sliders,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export function CalendarNotifTab({ lang }) {
  const { apiFetch, user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications', 'calendar', 'settings'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'career', 'interview', 'system'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unread', 'starred'
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [livePulse, setLivePulse] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Notification Preferences State
  const [preferences, setPreferences] = useState({
    careerAlerts: true,
    interviewReminders: true,
    systemUpdates: true,
    emailDigest: 'daily',
    smsAlerts: true,
    soundEffects: true
  });

  // Load real notifications from backend (merged with local mock data)
  useEffect(() => {
    if (!user) return;
    apiFetch('/api/notifications').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.data?.length > 0) {
        const dbNotifs = data.data.map(n => ({
          id:          n.id,
          category:    n.type === 'JOB_MATCH' ? 'career' : n.type === 'SCHOLARSHIP_DEADLINE' ? 'career' : n.type === 'ROADMAP_REMINDER' ? 'interview' : 'system',
          title:       n.title,
          description: n.body,
          timestamp:   new Date(n.created_at).toLocaleDateString('en-PK', { month:'short', day:'numeric' }),
          fullDate:    new Date(n.created_at).toLocaleString('en-PK'),
          priority:    n.type === 'SCHOLARSHIP_DEADLINE' ? 'urgent' : 'normal',
          read:        n.is_read,
          starred:     false,
          actionText:  n.link ? 'View' : null,
          actionLink:  n.link,
          _dbId:       n.id,
        }));
        setNotifications(prev => {
          const existingIds = new Set(dbNotifs.map(n => n.id));
          const localOnly = prev.filter(n => !existingIds.has(n.id));
          return [...dbNotifs, ...localOnly];
        });
      }
    }).catch(() => {});
  }, [user]);

  // Sample Centralized Notifications Data
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      category: 'interview', // 'career' | 'interview' | 'system'
      title: 'AI Mock Interview Schedule Reminder',
      description: 'Your scheduled 1-on-1 AI Technical Mock Interview for Software Engineering is starting in 45 minutes.',
      timestamp: '45 mins remaining',
      fullDate: '2026-08-07 03:15 PM',
      priority: 'urgent', // 'urgent' | 'high' | 'normal' | 'info'
      read: false,
      starred: true,
      actionText: 'Join Interview Room',
      actionType: 'video_join',
      metadata: {
        interviewer: 'NexStep AI Interviewer v3.6',
        duration: '30 Mins',
        topic: 'Data Structures & System Design'
      }
    },
    {
      id: 'notif-2',
      category: 'career',
      title: 'HEC Need-Based Scholarship 2026 Portal Closing Soon',
      description: 'Deadline alert: Final 48 hours remaining to complete your family income documentation and submit HEC scholarship form.',
      timestamp: '2 hours ago',
      fullDate: '2026-08-07 01:00 PM',
      priority: 'high',
      read: false,
      starred: false,
      actionText: 'Apply Scholarship',
      actionType: 'external_link',
      metadata: {
        funding: '100% Tuition + PKR 10,000/mo stipend',
        eligibleGrade: 'FSc / BS Students'
      }
    },
    {
      id: 'notif-3',
      category: 'career',
      title: 'New High Profile Match: Systems Ltd Junior React Developer',
      description: 'Your skill profile scored a 92% match for Systems Limited fresh graduate internship program in Lahore/Remote.',
      timestamp: '5 hours ago',
      fullDate: '2026-08-06 10:30 PM',
      priority: 'high',
      read: false,
      starred: true,
      actionText: 'View Job Details',
      actionType: 'view_job',
      metadata: {
        stipend: 'PKR 45,000 / month',
        location: 'Lahore / Hybrid'
      }
    },
    {
      id: 'notif-4',
      category: 'interview',
      title: 'Senior Career Counselor Video Call Confirmed',
      description: 'Dr. Farhan Ahmed (Ex-NUST Dean) accepted your 1-on-1 mentorship session request for university stream selection.',
      timestamp: '1 day ago',
      fullDate: '2026-08-06 11:00 AM',
      priority: 'normal',
      read: true,
      starred: false,
      actionText: 'View Session Brief',
      actionType: 'mentor_call',
      metadata: {
        counselor: 'Dr. Farhan Ahmed',
        scheduledFor: 'Tomorrow, 4:00 PM'
      }
    },
    {
      id: 'notif-5',
      category: 'system',
      title: 'Security Alert: New Sign-in from Chrome on Windows',
      description: 'Your NexStep account was accessed from IP 111.68.102.14 (Islamabad, PK). If this was not you, review your security settings.',
      timestamp: '1 day ago',
      fullDate: '2026-08-06 09:15 AM',
      priority: 'normal',
      read: true,
      starred: false,
      actionText: 'Review Security',
      actionType: 'security_settings',
      metadata: {
        ip: '111.68.102.14',
        device: 'Chrome v126 on Windows 11'
      }
    },
    {
      id: 'notif-6',
      category: 'system',
      title: 'Pro Plan Subscription Active',
      description: 'Your NexStep Pro Scholar Plan is active with unlimited AI Career Roadmaps and live interview simulations.',
      timestamp: '2 days ago',
      fullDate: '2026-08-05 02:00 PM',
      priority: 'info',
      read: true,
      starred: false,
      actionText: 'Manage Subscription',
      actionType: 'pricing',
      metadata: {
        validTill: '2026-09-05'
      }
    },
    {
      id: 'notif-7',
      category: 'career',
      title: 'NUST NET-3 Entry Test Merit Cutoff Update',
      description: 'Revised Merit Aggregates for Software Engineering & CS have been published based on recent entry test results.',
      timestamp: '3 days ago',
      fullDate: '2026-08-04 04:45 PM',
      priority: 'normal',
      read: true,
      starred: false,
      actionText: 'Calculate My Merit',
      actionType: 'merit_calc',
      metadata: {
        estimatedCutoff: '76.8% Aggregate'
      }
    }
  ]);

  // Calendar Scheduled Events
  const calendarEvents = [
    { id: 'ev-1', title: 'AI Technical Mock Interview', date: '2026-08-07', time: '03:15 PM', category: 'interview', status: 'Upcoming', badge: 'High Priority' },
    { id: 'ev-2', title: 'HEC Need-Based Scholarship Deadline', date: '2026-08-09', time: '11:59 PM', category: 'career', status: 'Closing Soon', badge: 'Deadline' },
    { id: 'ev-3', title: 'NUST NET-3 Second Merit List Release', date: '2026-08-14', time: '10:00 AM', category: 'career', status: 'Scheduled', badge: 'University' },
    { id: 'ev-4', title: '1-on-1 Mentorship with Dr. Farhan', date: '2026-08-08', time: '04:00 PM', category: 'interview', status: 'Confirmed', badge: 'Video Session' },
    { id: 'ev-5', title: 'FAST NU Entry Test Slot Booking', date: '2026-08-18', time: '09:00 AM', category: 'career', status: 'Upcoming', badge: 'Entry Test' }
  ];

  // Simulation of live incoming alerts
  const handleSimulateNewAlert = () => {
    const newAlerts = [
      {
        id: `notif-${Date.now()}`,
        category: 'interview',
        title: 'Recruiter Interview Invitation Received!',
        description: 'Techlogix HR has invited you for a preliminary video screening interview for Junior QA Engineer.',
        timestamp: 'Just now',
        fullDate: new Date().toLocaleString(),
        priority: 'urgent',
        read: false,
        starred: false,
        actionText: 'Accept & Schedule Slot',
        actionType: 'video_join',
        metadata: { company: 'Techlogix PK', position: 'Junior QA Engineer' }
      },
      {
        id: `notif-${Date.now()}`,
        category: 'career',
        title: 'New PEEF Special Scholarship Grant Matched',
        description: 'Matched based on your updated FSc marks (88%) and domicile status.',
        timestamp: 'Just now',
        fullDate: new Date().toLocaleString(),
        priority: 'high',
        read: false,
        starred: true,
        actionText: 'View Grant Form',
        actionType: 'external_link',
        metadata: { amount: 'PKR 120,000 / Year' }
      },
      {
        id: `notif-${Date.now()}`,
        category: 'system',
        title: 'AI Career Roadmap Processing Complete',
        description: 'Your personalized 4-year Computer Science skill roadmap is ready for download.',
        timestamp: 'Just now',
        fullDate: new Date().toLocaleString(),
        priority: 'normal',
        read: false,
        starred: false,
        actionText: 'View Roadmap',
        actionType: 'roadmap',
        metadata: { version: 'v3.6 Pro' }
      }
    ];

    const randomAlert = newAlerts[Math.floor(Math.random() * newAlerts.length)];
    setNotifications(prev => [randomAlert, ...prev]);

    setToastMessage(`⚡ Real-time Alert Received: ${randomAlert.title}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // State Helpers
  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;
  const careerCount = notifications.filter(n => n.category === 'career').length;
  const interviewCount = notifications.filter(n => n.category === 'interview').length;
  const systemCount = notifications.filter(n => n.category === 'system').length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setToastMessage('All notifications marked as read.');
    setTimeout(() => setToastMessage(null), 3000);
    if (user) apiFetch('/api/notifications/read-all', { method: 'POST' }).catch(() => {});
  };

  const handleClearRead = () => {
    setNotifications(prev => prev.filter(n => !n.read));
    setToastMessage('Cleared all read notifications.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
    if (user) apiFetch(`/api/notifications/${id}/read`, { method: 'POST' }).catch(() => {});
  };

  const toggleStar = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, starred: !n.starred } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Filter Logic
  const filteredNotifications = notifications.filter(n => {
    // Category filter
    if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;

    // Status filter
    if (statusFilter === 'unread' && n.read) return false;
    if (statusFilter === 'starred' && !n.starred) return false;
    if (statusFilter === 'urgent' && n.priority !== 'urgent') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q);
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Real-time Toast Notification Overlay */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white border border-emerald-500/80 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 max-w-md">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <p className="text-xs font-bold text-slate-100 flex-1">{toastMessage}</p>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Centralized Dashboard Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Live Alert Engine
              </span>
              <span className="text-slate-400 text-xs">| NexStep Real-time Sync</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Centralized Alert & Interview Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time intelligence for career opportunities, live mock interview reminders, and system updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSimulateNewAlert}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simulate Live Alert</span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              title="Notification Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time Status Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex justify-between items-center text-xs text-slate-400 font-bold mb-1">
              <span>Unread Alerts</span>
              <Bell className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-white flex items-center gap-2">
              <span>{unreadCount}</span>
              {unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex justify-between items-center text-xs text-slate-400 font-bold mb-1">
              <span>Urgent Priority</span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-xl font-black text-red-400">
              {urgentCount}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex justify-between items-center text-xs text-slate-400 font-bold mb-1">
              <span>Career Opportunities</span>
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-black text-blue-400">
              {careerCount}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex justify-between items-center text-xs text-slate-400 font-bold mb-1">
              <span>Interviews & Sessions</span>
              <Video className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-black text-purple-400">
              {interviewCount}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Tab Switcher: Alerts Feed vs Calendar Schedule */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alerts Feed</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Scheduled Calendar Events ({calendarEvents.length})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Real-time Status:</span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-black flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Connected
          </span>
        </div>
      </div>

      {/* TAB CONTENT 1: NOTIFICATIONS FEED */}
      {activeTab === 'notifications' && (
        <div className="space-y-5">
          {/* Controls & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            {/* Top Row: Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'all', label: 'All Categories', count: notifications.length, icon: Bell },
                  { id: 'career', label: 'Career Opportunities', count: careerCount, icon: Briefcase },
                  { id: 'interview', label: 'Interview Reminders', count: interviewCount, icon: Video },
                  { id: 'system', label: 'System Updates', count: systemCount, icon: ShieldAlert },
                ].map((cat) => {
                  const CatIcon = cat.icon;
                  const isAct = categoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                        isAct
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                        isAct ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllRead}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">Mark All Read</span>
                </button>

                <button
                  onClick={handleClearRead}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Clear Read</span>
                </button>
              </div>
            </div>

            {/* Bottom Row: Status Filter & Search */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search alerts by title, company, scholarship or topic..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                >
                  <option value="all">Status: All Alerts</option>
                  <option value="unread">Status: Unread Only</option>
                  <option value="starred">Status: Starred / Saved</option>
                  <option value="urgent">Priority: Urgent Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications Card List */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Notifications Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No alerts match your current filter selections. Try changing your filters or click "Simulate Live Alert" above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => {
                const isUnread = !notif.read;
                const isUrgent = notif.priority === 'urgent';
                const isHigh = notif.priority === 'high';

                return (
                  <div
                    key={notif.id}
                    className={`p-5 rounded-2xl border transition-all relative ${
                      isUnread
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        {/* Category Icon Badge */}
                        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold ${
                          notif.category === 'interview'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : notif.category === 'career'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {notif.category === 'interview' && <Video className="w-5 h-5" />}
                          {notif.category === 'career' && <Briefcase className="w-5 h-5" />}
                          {notif.category === 'system' && <ShieldAlert className="w-5 h-5" />}
                        </div>

                        {/* Title, Category & Description */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Priority Badge */}
                            {isUrgent && (
                              <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                                URGENT REMINDER
                              </span>
                            )}
                            {isHigh && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[10px] font-extrabold">
                                HIGH PRIORITY
                              </span>
                            )}

                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              {notif.category === 'interview' && 'Interview Alert'}
                              {notif.category === 'career' && 'Opportunity Match'}
                              {notif.category === 'system' && 'System Notice'}
                            </span>

                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-[11px] font-semibold text-slate-400">{notif.timestamp}</span>
                          </div>

                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{notif.title}</span>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Unread" />
                            )}
                          </h3>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {notif.description}
                          </p>

                          {/* Metadata Tags */}
                          {notif.metadata && (
                            <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              {Object.entries(notif.metadata).map(([key, val]) => (
                                <span key={key} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                  <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong> {val}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Action Icons: Star & Delete */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleStar(notif.id)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            notif.starred ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
                          }`}
                          title={notif.starred ? 'Unstar Alert' : 'Star Alert'}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>

                        <button
                          onClick={() => toggleRead(notif.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 transition-all cursor-pointer"
                          title={notif.read ? 'Mark Unread' : 'Mark Read'}
                        >
                          <CheckCircle2 className={`w-4 h-4 ${notif.read ? 'text-emerald-500' : ''}`} />
                        </button>

                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                          title="Delete Alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Footer Action Trigger Button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Log Date: {notif.fullDate}
                      </span>

                      {notif.actionText && (
                        <button
                          onClick={() => {
                            toggleRead(notif.id);
                            setToastMessage(`Action Triggered: "${notif.actionText}" for ${notif.title}`);
                            setTimeout(() => setToastMessage(null), 3500);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                            isUrgent
                              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                              : notif.category === 'interview'
                              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                          }`}
                        >
                          <span>{notif.actionText}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: SCHEDULED CALENDAR EVENTS */}
      {activeTab === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Academic & Interview Schedule</h2>
              <p className="text-xs text-slate-500">Upcoming test dates, scholarship deadlines, and 1-on-1 counselor calls</p>
            </div>

            <button
              onClick={() => {
                setToastMessage('📅 Event schedule exported as .ICS file.');
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export iCal (.ics)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calendarEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px]">
                    {ev.badge}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">{ev.status}</span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{ev.title}</h4>
                  <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      {ev.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      {ev.time}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setToastMessage(`Calendar Event Synced: ${ev.title}`);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Sync to Calendar</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NOTIFICATION PREFERENCES SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Alert Preferences</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-700 dark:text-slate-300">
              <div className="space-y-2">
                <label className="font-bold text-slate-900 dark:text-white block">Category Subscriptions</label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 cursor-pointer">
                  <span>Career Opportunities & Scholarships</span>
                  <input
                    type="checkbox"
                    checked={preferences.careerAlerts}
                    onChange={(e) => setPreferences({ ...preferences, careerAlerts: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 cursor-pointer">
                  <span>Interview & Mentor Reminders</span>
                  <input
                    type="checkbox"
                    checked={preferences.interviewReminders}
                    onChange={(e) => setPreferences({ ...preferences, interviewReminders: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 cursor-pointer">
                  <span>System Security & Merit Updates</span>
                  <input
                    type="checkbox"
                    checked={preferences.systemUpdates}
                    onChange={(e) => setPreferences({ ...preferences, systemUpdates: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="font-bold text-slate-900 dark:text-white block">Delivery Channels</label>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                  <span>Email Summary Frequency</span>
                  <select
                    value={preferences.emailDigest}
                    onChange={(e) => setPreferences({ ...preferences, emailDigest: e.target.value })}
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="instant">Instant Email</option>
                    <option value="daily">Daily Digest</option>
                    <option value="off">Off</option>
                  </select>
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 cursor-pointer">
                  <span>SMS Urgent Alerts</span>
                  <input
                    type="checkbox"
                    checked={preferences.smsAlerts}
                    onChange={(e) => setPreferences({ ...preferences, smsAlerts: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSettingsModal(false);
                setToastMessage('Notification preferences saved.');
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
