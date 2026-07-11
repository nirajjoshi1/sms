import React from 'react';
import { 
  Search, 
  Command, 
  Bell, 
  Settings, 
  ChevronDown, 
  Sun, 
  Moon, 
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Check,
  User,
  LogOut,
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  DollarSign,
  FileText,
  Calendar
} from 'lucide-react';
import api from '../../../lib/api';

const Navbar = ({ 
  user, 
  theme, 
  setTheme, 
  isSidebarCollapsed, 
  setIsSidebarCollapsed, 
  setIsSpotlightOpen,
  isSettingsOpen,
  setIsSettingsOpen,
  logout
}) => {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  
  const profileRef = React.useRef(null);
  const notificationsRef = React.useRef(null);

  // Handle click outside for profile dropdown
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target) && !e.target.closest('.profile-trigger')) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  // Handle click outside for notifications dropdown
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target) && !e.target.closest('.notifications-trigger')) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data?.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.data.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      const deleted = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'admission':
        return <User className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />;
      case 'fee':
        return <DollarSign className="w-3.5 h-3.5 text-blue-500" />;
      case 'leave':
        return <FileText className="w-3.5 h-3.5 text-amber-500" />;
      case 'event':
        return <Calendar className="w-3.5 h-3.5 text-purple-500" />;
      case 'success':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      case 'error':
        return <XCircle className="w-3.5 h-3.5 text-red-500 animate-bounce" />;
      default:
        return <Info className="w-3.5 h-3.5 text-sky-500" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'admission':
        return 'bg-emerald-500/10 border border-emerald-500/20';
      case 'fee':
        return 'bg-blue-500/10 border border-blue-500/20';
      case 'leave':
        return 'bg-amber-500/10 border border-amber-500/20';
      case 'event':
        return 'bg-purple-500/10 border border-purple-500/20';
      case 'success':
        return 'bg-emerald-500/10 border border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 border border-amber-500/20';
      case 'error':
        return 'bg-red-500/10 border border-red-500/20';
      default:
        return 'bg-sky-500/10 border border-sky-500/20';
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <header className="h-16 border-b border-border flex items-center px-6 justify-between flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg cursor-pointer transition-colors"
        >
          {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          <button 
            onClick={() => setIsSpotlightOpen(true)}
            className="w-64 h-10 bg-accent/50 hover:bg-accent border border-border rounded-lg pl-10 pr-3 flex items-center justify-between text-muted-foreground text-sm transition-all"
          >
            <span>Search...</span>
            <span className="flex items-center gap-1 text-[10px] bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground font-mono">
              <Command className="w-2.5 h-2.5" /> K
            </span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 relative">
        {/* Live Notification Bell Trigger & Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`notifications-trigger w-9 h-9 flex items-center justify-center rounded-lg transition relative ${
              isNotificationsOpen ? 'bg-accent text-accent-foreground shadow-inner' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[8px] font-extrabold flex items-center justify-center rounded-full ring-2 ring-background animate-in zoom-in duration-200 shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-card/95 border border-border rounded-2xl shadow-2xl z-[9999] p-4 animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur supports-[backdrop-filter]:bg-card/75">
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
                <div>
                  <h3 className="text-sm font-black text-foreground tracking-tight">Notifications</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-85">
                    {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <>
                      <button 
                        onClick={handleMarkAllAsRead} 
                        className="text-[9px] font-bold text-primary hover:opacity-80 transition uppercase tracking-wider cursor-pointer"
                      >
                        Read All
                      </button>
                      <span className="text-[10px] text-border">|</span>
                      <button 
                        onClick={handleClearAll} 
                        className="text-[9px] font-bold text-muted-foreground hover:text-destructive transition uppercase tracking-wider cursor-pointer"
                      >
                        Clear All
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1 scrollbar-thin flex flex-col">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 rounded-xl bg-muted border border-border/40 flex items-center justify-center text-muted-foreground mb-2">
                      <Bell className="w-5 h-5 opacity-40" />
                    </div>
                    <p className="text-xs font-bold text-foreground">All caught up!</p>
                    <p className="text-[10px] text-muted-foreground font-medium">No new notifications at this time.</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`group flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                        notification.isRead 
                          ? 'bg-card/40 border-border/30 opacity-70 hover:opacity-100 hover:border-border/60' 
                          : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                      }`}
                    >
                      <div className={`p-2 rounded-lg flex-shrink-0 flex items-center justify-center ${getIconBg(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className={`text-xs font-bold truncate ${notification.isRead ? 'text-foreground/80' : 'text-foreground'}`}>
                            {notification.title}
                          </p>
                          <span className="text-[9px] text-muted-foreground flex-shrink-0 font-bold font-mono">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-muted-foreground break-words font-medium">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.isRead && (
                            <button 
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-[9px] font-bold text-primary hover:opacity-85 transition cursor-pointer"
                            >
                              Mark as read
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(notification.id)}
                            className="text-[9px] font-bold text-muted-foreground hover:text-destructive flex items-center gap-1 transition cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`settings-trigger w-9 h-9 flex items-center justify-center rounded-lg transition ${
              isSettingsOpen ? 'bg-accent text-accent-foreground shadow-inner' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Settings className={`w-5 h-5 ${isSettingsOpen ? 'rotate-90' : ''} transition-transform duration-300`} />
          </button>

          {/* Preferences Popover */}
          {isSettingsOpen && (
            <PreferencesPopover theme={theme} setTheme={setTheme} />
          )}
        </div>

        <div className="w-px h-6 bg-border mx-2"></div>
        
        <div className="relative">
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`profile-trigger flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-accent transition cursor-pointer border border-transparent ${isProfileOpen ? 'bg-accent border-border' : 'hover:border-border'}`}
          >
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold overflow-hidden shadow-sm">
              {user?.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : user?.name?.charAt(0)}
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div
              ref={profileRef}
              className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-300"
            >
              {/* Account Switcher Section */}
              <div className="p-2 space-y-1 border-b border-border/50">
                <div className="flex items-center gap-3 p-2 bg-accent/50 rounded-lg border border-border">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xs overflow-hidden">
                    {user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate capitalize">{user?.role?.toLowerCase()?.replace('_', ' ')}</p>
                  </div>
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>

              {/* Quick Links Section */}
              <div className="p-1.5 border-b border-border/50">
                <ProfileLink icon={<User />} label="Account" />
                <ProfileLink icon={<Bell />} label="Notifications" />
              </div>

              {/* Logout Section */}
              <div className="p-1.5">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const PreferencesPopover = ({ theme, setTheme }) => (
  <div className="settings-popover absolute right-0 mt-3 w-80 bg-card border border-border rounded-2xl shadow-2xl z-[9999] p-6 animate-in fade-in slide-in-from-top-2 duration-200">
    <div className="mb-6">
      <h3 className="text-lg font-bold text-foreground">Preferences</h3>
      <p className="text-xs text-muted-foreground">Customize your dashboard layout preferences.</p>
    </div>

    <div className="space-y-6 text-sm">
      {/* Theme Preset */}
      <div>
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Theme Preset</label>
        <button className="w-full bg-muted border border-input rounded-lg px-3 py-2 flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-foreground rounded-full"></div>
            <span className="font-medium text-foreground">Default</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition" />
        </button>
      </div>

      {/* Fonts */}
      <div>
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Fonts</label>
        <button className="w-full bg-muted border border-input rounded-lg px-3 py-2 flex items-center justify-between group">
          <span className="font-medium text-foreground">Geist</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition" />
        </button>
      </div>

      {/* Theme Mode */}
      <div>
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Theme Mode</label>
        <div className="flex bg-muted p-1 rounded-xl border border-input">
          <ThemeButton active={theme === 'light'} onClick={() => setTheme('light')} icon={<Sun />} label="Light" />
          <ThemeButton active={theme === 'dark'} onClick={() => setTheme('dark')} icon={<Moon />} label="Dark" />
          <ThemeButton active={theme === 'system'} onClick={() => setTheme('system')} icon={<Monitor />} label="System" />
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <button className="w-full py-2.5 rounded-xl border border-border text-foreground font-bold hover:bg-accent transition text-xs">
          Restore Defaults
        </button>
      </div>
    </div>
  </div>
);

const ThemeButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
      active 
        ? 'bg-card text-foreground shadow-sm ring-1 ring-border' 
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    {React.cloneElement(icon, { className: "w-3.5 h-3.5" })}
    {label}
  </button>
);

const ProfileLink = ({ icon, label }) => (
  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
    {React.cloneElement(icon, { className: "w-4 h-4" })}
    {label}
  </button>
);

export default Navbar;
