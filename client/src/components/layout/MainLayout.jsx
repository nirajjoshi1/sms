import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './sidebar/Sidebar';
import Navbar from './navbar/Navbar';
import Spotlight from './spotlight/Spotlight';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const themePreferences = useTheme();
  const { theme, setTheme } = themePreferences;
  
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = React.useState(false);

  // Keyboard Shortcuts (Ctrl+K or Ctrl+J)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'j')) {
        e.preventDefault();
        setIsSpotlightOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSpotlightOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close Preferences Popover when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (isSettingsOpen && !e.target.closest('.settings-popover') && !e.target.closest('.settings-trigger')) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsOpen]);

  // Dynamically set browser tab title
  React.useEffect(() => {
    const baseTitle = "Gradex SMS";
    if (user?.role === 'SUPER_ADMIN') {
      document.title = `Super Admin | ${baseTitle}`;
    } else if (user?.School?.name) {
      document.title = `${user.School.name} | ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [user]);

  return (
    <div className="flex h-screen bg-background text-muted-foreground font-sans transition-colors duration-500 overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar 
        user={user} 
        logout={logout} 
        isCollapsed={isSidebarCollapsed} 
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Navbar Component */}
        <Navbar 
          user={user}
          theme={theme}
          setTheme={setTheme}
          themePreferences={themePreferences}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          setIsSpotlightOpen={setIsSpotlightOpen}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          logout={logout}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-auto bg-background p-6 relative z-[1]">
          <Outlet />
        </main>

        {/* Global Spotlight Search Overlay */}
        <Spotlight 
          isOpen={isSpotlightOpen} 
          onClose={() => setIsSpotlightOpen(false)} 
          logout={logout}
          user={user}
        />
      </div>
    </div>
  );
};

export default MainLayout;
