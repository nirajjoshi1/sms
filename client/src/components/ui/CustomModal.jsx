import React, { useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CustomModal({ isOpen, onClose, title, children, maxWidth = 'max-w-md', overflow = 'overflow-y-auto' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop sits below navbar (z-20 vs nav z-30) */}
      <div className="fixed inset-0 bg-black/50 z-[20]" onClick={onClose} />
      
      {/* Modal dialog sits below navbar (z-25) and is pushed down 96px (top-24) to avoid collision */}
      <div className={cn("fixed top-24 left-1/2 -translate-x-1/2 z-[25] bg-card border border-border rounded-xl shadow-xl w-full text-left flex flex-col max-h-[calc(100vh-8rem)]", maxWidth)}>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0 bg-card z-10 rounded-t-xl">
          <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
            {title}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close modal" className="p-1 hover:bg-muted rounded transition-colors" title="Close">
            <Plus className="w-4 h-4 rotate-45" />
          </button>
        </div>
        <div className={`${overflow} flex-1`}>
          {children}
        </div>
      </div>
    </>
  );
}
