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
  LogOut
} from 'lucide-react';

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
  const profileRef = React.useRef(null);

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
  return (
    <header className="h-16 border-b border-border flex items-center px-6 justify-between flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-[100]">
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
        <HeaderAction icon={<Bell />} />
        
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

const HeaderAction = ({ icon }) => (
  <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition">
    {React.cloneElement(icon, { className: "w-5 h-5" })}
  </button>
);

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
