import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, Check } from 'lucide-react';

const CustomDatePicker = ({ value, onChange, label, placeholder = "Select Date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Handle click outside and smart positioning
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowYearPicker(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Smart positioning logic
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const pickerHeight = 350; // Estimated height
        setOpenUpward(spaceBelow < pickerHeight);
      }
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(selectedDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 100; i <= currentYear + 10; i++) {
    years.push(i);
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate.getMonth(), viewDate.getFullYear());
    const firstDay = getFirstDayOfMonth(viewDate.getMonth(), viewDate.getFullYear());
    const days = [];

    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = value && new Date(value).getDate() === i && 
                         new Date(value).getMonth() === viewDate.getMonth() && 
                         new Date(value).getFullYear() === viewDate.getFullYear();
      const isToday = new Date().getDate() === i && 
                      new Date().getMonth() === viewDate.getMonth() && 
                      new Date().getFullYear() === viewDate.getFullYear();

      days.push(
        <button
          key={i}
          type="button"
          onClick={() => handleDateSelect(i)}
          className={`h-8 w-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
            isSelected 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110' 
              : isToday 
                ? 'border border-primary text-primary hover:bg-primary/10' 
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
        >
          {i}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs flex items-center justify-between transition-all hover:bg-muted/50 active:scale-[0.98] ${isOpen ? 'ring-1 ring-primary/20 border-primary' : ''}`}
        >
          <span className={value ? 'text-foreground font-bold' : 'text-muted-foreground'}>
            {value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : placeholder}
          </span>
          <CalendarIcon className={`w-3.5 h-3.5 text-muted-foreground transition-colors ${isOpen ? 'text-primary' : ''}`} />
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setIsOpen(false)}></div>
            <div className="relative w-64 bg-card border border-border rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.5)] p-5 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-5">
                <button 
                  type="button"
                  onClick={() => setShowYearPicker(!showYearPicker)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-all group"
                >
                  <span className="text-sm font-black text-foreground tracking-tight">
                    {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-300 ${showYearPicker ? 'rotate-180' : ''}`} />
                </button>
                <div className="flex items-center gap-1.5">
                  <button type="button" aria-label="Previous month" onClick={handlePrevMonth} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground transition-all"><ChevronLeft className="w-5 h-5" /></button>
                  <button type="button" aria-label="Next month" onClick={handleNextMonth} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground transition-all"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>

              {showYearPicker ? (
                <div className="grid grid-cols-3 gap-2 h-56 overflow-y-auto hide-scrollbar px-1">
                  {years.reverse().map(year => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        setViewDate(new Date(year, viewDate.getMonth(), 1));
                        setShowYearPicker(false);
                      }}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                        viewDate.getFullYear() === year 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  {/* Days of Week */}
                  <div className="grid grid-cols-7 mb-3">
                    {daysOfWeek.map(day => (
                      <div key={day} className="text-center text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {renderCalendar()}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-6 pt-5 border-t border-border/50">
                    <button 
                      type="button"
                      onClick={() => { onChange(''); setIsOpen(false); }}
                      className="text-[11px] font-black text-muted-foreground hover:text-destructive transition-colors uppercase tracking-widest"
                    >
                      Clear
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const today = new Date();
                        onChange(today.toISOString().split('T')[0]);
                        setViewDate(today);
                        setIsOpen(false);
                      }}
                      className="text-[11px] font-black text-primary hover:opacity-80 transition-opacity uppercase tracking-widest"
                    >
                      Today
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDatePicker;
