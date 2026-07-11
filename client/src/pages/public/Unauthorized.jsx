import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 flex flex-col items-center max-w-lg text-center"
      >
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-red-500/20 rounded-3xl blur-2xl transition-all duration-500 group-hover:bg-red-500/30" />
          <img 
            src="/images/403.jpg" 
            alt="403 Unauthorized Access" 
            className="w-64 h-64 sm:w-80 sm:h-80 object-cover rounded-3xl border border-white/10 shadow-2xl relative z-10"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-sm mb-6">
          <ShieldAlert className="w-4 h-4" />
          <span>Error 403: Access Denied</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Vault Locked.
        </h1>
        
        <p className="text-gray-400 text-lg mb-10 max-w-md" style={{ fontFamily: "'Barlow', sans-serif" }}>
          You don't have the required security clearance to access this sector. If you believe this is a mistake, please contact your administrator.
        </p>

        <button 
          onClick={() => navigate('/')}
          className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-gray-200 translate-y-[100%] transition-transform duration-300 ease-out group-hover:translate-y-0" />
          <ArrowLeft className="w-5 h-5 relative z-10 transition-transform group-hover:-translate-x-1" />
          <span className="relative z-10">Return to Safety</span>
        </button>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
