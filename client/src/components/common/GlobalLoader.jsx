import React from 'react';
import { useLoading } from '../../context/LoadingContext';
import { Loader2 } from 'lucide-react';

const GlobalLoader = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">Processing request...</p>
      </div>
    </div>
  );
};

export default GlobalLoader;
