import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronRight, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { NAVIGATION_ITEMS } from '../../../constants/navigation.jsx';

const Sidebar = ({ user, logout, isCollapsed }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside 
      className={`relative h-full bg-sidebar border-r border-sidebar-border flex-shrink-0 flex flex-col transition-[width] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-[width] z-40 ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Sidebar Header - Link to Dashboard */}
      <Link to="/" className={`p-4 h-16 flex items-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-sidebar-accent/50 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 bg-background border border-border rounded-lg flex-shrink-0 flex items-center justify-center text-foreground font-black shadow-sm transition-colors duration-500">
          {user?.school?.name?.charAt(0) || 'G'}
        </div> 
          <span className={`font-bold text-sidebar-foreground text-sm truncate tracking-tight transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isCollapsed ? 'opacity-0 w-0 invisible' : 'opacity-100 w-auto visible'}`}>
            {user?.role === 'SUPER_ADMIN' ? 'Studio Admin' : user?.school?.name || 'Studio Admin'}
          </span>
      </Link>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto overflow-x-visible px-3 space-y-1 py-4 hide-scrollbar">
      {NAVIGATION_ITEMS.map((item) => {
          // Role-based filtering — supports both `role` (string) and `roles` (array)
          if (item.role && user?.role !== item.role) return null;
          if (item.roles && !item.roles.includes(user?.role)) return null;

          if (item.items) {
            return (
              <NavGroup 
                key={item.label}
                label={item.label} 
                icon={item.icon} 
                collapsed={isCollapsed}
                items={item.items}
              />
            );
          }

          return (
            <SidebarLink 
              key={item.label}
              to={item.to} 
              icon={item.icon} 
              label={item.label} 
              active={isActive(item.to)} 
              collapsed={isCollapsed} 
            />
          );
        })}
      </div>

      {/* Sidebar Footer - Mini Profile */}
      <div className="p-2 border-t border-sidebar-border">
        <div className={`flex items-center p-1.5 rounded-lg hover:bg-sidebar-accent transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group cursor-pointer ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div className="w-7 h-7 bg-sidebar-accent rounded-full flex-shrink-0 flex items-center justify-center text-sidebar-foreground text-xs font-bold transition-colors duration-500 overflow-hidden">
            {user?.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : user?.name?.charAt(0)}
          </div>
          <div className={`flex-1 min-w-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden ${isCollapsed ? 'opacity-0 w-0 invisible' : 'opacity-100 w-auto visible'}`}>
            <p className="text-[11px] font-bold text-sidebar-foreground truncate leading-none mb-1">{user?.name}</p>
            <p className="text-[9px] text-muted-foreground/60 truncate leading-none">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

const SidebarLink = ({ to, icon, label, active, soon, collapsed }) => (
  <Link 
    to={soon ? '#' : to} 
    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] text-sm group relative ${
      active ? 'bg-sidebar-accent text-sidebar-accent-foreground font-bold shadow-sm' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
    } ${soon ? 'opacity-50 cursor-not-allowed' : ''} ${collapsed ? 'justify-center' : 'justify-between'}`}
  >
    <div className="flex items-center gap-3">
      {React.cloneElement(icon, { className: `w-4 h-4 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]` })}
      <span className={`transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] whitespace-nowrap overflow-hidden ${collapsed ? 'opacity-0 w-0 invisible' : 'opacity-100 w-auto visible'}`}>
        {label}
      </span>
    </div>
    {!collapsed && soon && (
      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-bold transition-opacity">Soon</span>
    )}
    
    {/* Tooltip for collapsed state */}
    {collapsed && (
      <div className="fixed left-16 ml-2 px-3 py-1.5 bg-white text-slate-900 text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-1 group-hover:translate-x-0 whitespace-nowrap z-[250] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/50 flex items-center gap-2">
        {/* Tooltip Arrow */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-l border-b border-slate-200/50 rotate-45"></div>
        {label}
      </div>
    )}
  </Link>
);

const NavGroup = ({ label, icon, items, collapsed }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [popoverTop, setPopoverTop] = React.useState(0);
  const location = useLocation();
  const hasActiveItem = items.some(item => location.pathname === item.to);
  const popoverRef = React.useRef(null);
  const triggerRef = React.useRef(null);

  // Handle click outside for popover
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        setIsPopoverOpen(false);
      }
    };
    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopoverOpen]);

  const handleTriggerClick = (e) => {
    if (collapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setPopoverTop(rect.top);
      setIsPopoverOpen(!isPopoverOpen);
    } else {
      setIsOpen(!isOpen);
    }
  };

  // If collapsed, show floating popover on click
  if (collapsed) {
    return (
      <div className="relative">
        <button 
          ref={triggerRef}
          onClick={handleTriggerClick}
          className={`w-full flex items-center justify-center py-2 rounded-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group ${
            isPopoverOpen || hasActiveItem ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
          }`}
        >
          {React.cloneElement(icon, { className: "w-4 h-4 transition-colors duration-500" })}
          
          {/* Tooltip for label (hidden when popover is open) */}
          {!isPopoverOpen && (
            <div className="fixed left-16 ml-2 px-3 py-1.5 bg-white text-slate-900 text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-1 group-hover:translate-x-0 whitespace-nowrap z-[250] shadow-lg border border-slate-200/50 flex items-center gap-2">
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-l border-b border-slate-200/50 rotate-45"></div>
              {label}
            </div>
          )}
        </button>

        {/* Floating Popover Menu */}
        {isPopoverOpen && (
          <div 
            ref={popoverRef}
            style={{ top: `${popoverTop}px` }}
            className="fixed left-16 ml-2 w-48 bg-card border border-border rounded-xl shadow-2xl py-2 z-[300] animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="px-3 py-1.5 mb-1 border-b border-border/50">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
            </div>
            {items.length > 0 ? items.map((item, i) => (
              <Link 
                key={i}
                to={item.to}
                onClick={() => setIsPopoverOpen(false)}
                className={`block px-3 py-2 text-xs transition-colors ${
                  location.pathname === item.to 
                    ? 'bg-accent text-foreground font-bold' 
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            )) : (
              <div className="px-3 py-2 text-[10px] text-muted-foreground italic">Coming Soon</div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] text-sm group ${
          isOpen || hasActiveItem ? 'bg-sidebar-accent/30 text-sidebar-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent'
        }`}
      >
        <div className="flex items-center gap-3">
          {React.cloneElement(icon, { className: "w-4 h-4 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" })}
          <span className={`transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] whitespace-nowrap overflow-hidden ${collapsed ? 'opacity-0 w-0 invisible' : 'opacity-100 w-auto visible'}`}>
            {label}
          </span>
        </div>
        <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
        <div className="ml-4 pl-6 border-l border-border space-y-1 py-1">
          {items.length > 0 ? items.map((item, i) => (
            <Link 
              key={i}
              to={item.to}
              className={`block px-3 py-1.5 rounded-lg text-[13px] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                location.pathname === item.to 
                  ? 'text-foreground font-bold bg-sidebar-accent/50 shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
              }`}
            >
              {item.label}
            </Link>
          )) : (
            <span className="block px-3 py-1.5 text-[11px] text-muted-foreground/50 italic">Coming Soon</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
