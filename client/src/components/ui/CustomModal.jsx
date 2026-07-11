import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CustomModal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[99999] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <div className={cn("bg-card border border-border rounded-xl shadow-xl w-full text-left flex flex-col max-h-[90vh]", maxWidth)}>
          <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0 bg-card z-10 rounded-t-xl">
            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
              {title}
            </h3>
            <button type="button" onClick={onClose} className="p-1 hover:bg-muted rounded transition-colors" title="Close">
              <Plus className="w-4 h-4 rotate-45" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
