import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { NAVIGATION_ITEMS } from '../../../constants/navigation';

const Spotlight = ({ isOpen, onClose, logout, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Flatten all navigation items for search
  const allItems = React.useMemo(() => {
    const items = [];

    NAVIGATION_ITEMS.forEach(navItem => {
      // Role-based filtering
      if (navItem.role && user?.role !== navItem.role) return;
      if (navItem.roles && !navItem.roles.includes(user?.role)) return;
      if (navItem.items) {
        // Add parent as category
        navItem.items.forEach(item => {
          items.push({
            label: item.label,
            to: item.to,
            icon: navItem.icon,
            category: navItem.label,
            soon: item.soon
          });
        });
      } else if (navItem.to) {
        items.push({
          label: navItem.label,
          to: navItem.to,
          icon: navItem.icon,
          category: 'Quick Access',
          soon: navItem.soon
        });
      }
    });

    // Add logout action
    items.push({
      label: 'Sign Out',
      action: 'logout',
      icon: <LogOut />,
      category: 'Actions'
    });

    return items;
  }, []);

  // Filter items based on search
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) return allItems;

    const query = searchQuery.toLowerCase();
    return allItems.filter(item =>
      item.label.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }, [searchQuery, allItems]);

  // Group items by category
  const groupedItems = React.useMemo(() => {
    const groups = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(filteredItems[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, onClose]);

  const handleSelect = (item) => {
    if (!item) return;

    if (item.soon) {
      return; // Don't navigate to "soon" items
    }

    if (item.action === 'logout') {
      logout();
      onClose();
    } else if (item.to) {
      navigate(item.to);
      onClose();
    }
  };

  if (!isOpen) return null;

  let currentIndexInList = 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
        {/* Search Input */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages, features, and actions..."
            className="flex-1 bg-transparent border-none outline-none text-foreground text-base placeholder:text-muted-foreground"
          />
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border">ESC</span>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2 hide-scrollbar">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            Object.entries(groupedItems).map(([category, items], groupIndex) => (
              <div key={category} className={groupIndex > 0 ? 'mt-4' : ''}>
                <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                  {category}
                </p>
                <div className="space-y-0.5">
                  {items.map((item, itemIndex) => {
                    const isActive = currentIndexInList === selectedIndex;
                    currentIndexInList++;
                    return (
                      <SpotlightItem
                        key={`${category}-${itemIndex}`}
                        icon={item.icon}
                        label={item.label}
                        active={isActive}
                        soon={item.soon}
                        onClick={() => handleSelect(item)}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-muted/30 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="bg-muted px-1 rounded border border-border text-[9px] font-bold">↑↓</span> navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="bg-muted px-1 rounded border border-border text-[9px] font-bold">ENTER</span> select
            </span>
            <span className="flex items-center gap-1">
              <span className="bg-muted px-1 rounded border border-border text-[9px] font-bold">ESC</span> close
            </span>
          </div>
          <span className="text-[10px]">
            <span className="bg-muted px-1 rounded border border-border font-bold">Ctrl+J</span> to open
          </span>
        </div>
      </div>
    </div>
  );
};

const SpotlightItem = ({ icon, label, active, soon, onClick }) => (
  <button
    onClick={onClick}
    disabled={soon}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
      active
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
    } ${soon ? 'opacity-40 cursor-not-allowed' : ''}`}
  >
    {React.cloneElement(icon, { className: "w-4 h-4 flex-shrink-0" })}
    <span className="flex-1 text-left">{label}</span>
    {soon && <span className="text-[10px] bg-background/50 px-1.5 py-0.5 rounded border border-border">Soon</span>}
  </button>
);

export default Spotlight;
