import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder, className = "", searchable = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  
  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } else {
      setSearchQuery(''); // Reset search when closed
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, searchable]);

  const filteredOptions = searchable && searchQuery.trim() !== ''
    ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs flex items-center justify-between transition-all duration-300 hover:bg-muted/50 active:scale-[0.98] ${isOpen ? 'ring-1 ring-primary/20 border-primary shadow-inner' : ''}`}
      >
        <span className={`transition-all duration-300 truncate ${selectedOption ? 'text-foreground font-bold translate-x-0' : 'text-muted-foreground translate-x-0'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex-shrink-0 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[1000] py-1.5 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] dark:bg-gray-900 dark:border-gray-800">
          
          {searchable && (
            <div className="px-2 pb-1.5 mb-1.5 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-7 pl-6 pr-2 bg-muted/30 border border-border rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70"
                />
              </div>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto hide-scrollbar px-1.5 space-y-0.5">
            {filteredOptions.length > 0 ? filteredOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200 group ${value === opt.id ? 'bg-primary/10 text-primary font-bold dark:bg-primary/20 dark:text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}`}
              >
                <span className="transition-transform duration-200 group-hover:translate-x-0.5 text-left truncate pr-2">{opt.label}</span>
                {value === opt.id && (
                  <Check className="w-3.5 h-3.5 text-primary animate-in zoom-in-50 duration-300 flex-shrink-0" />
                )}
              </button>
            )) : (
              <div className="px-3 py-4 text-[10px] text-muted-foreground italic text-center dark:text-gray-500 flex flex-col items-center gap-2">
                <Search className="w-4 h-4 opacity-30" />
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
