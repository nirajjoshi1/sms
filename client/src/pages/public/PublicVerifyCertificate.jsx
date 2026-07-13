import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, FileSearch, Calendar, User, Award, ArrowLeft, RefreshCw } from 'lucide-react';
import api from '../../lib/api';

const PublicVerifyCertificate = () => {
  const { certificateNumber } = useParams();
  
  const [searchNumber, setSearchNumber] = useState(certificateNumber || '');
  const [loading, setLoading] = useState(false);
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (certificateNumber) {
      verifyCode(certificateNumber);
    }
  }, [certificateNumber]);

  const verifyCode = async (code) => {
    if (!code.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setCertData(null);
      
      // Use the unauthenticated public endpoint
      const response = await api.get(`/public/certificates/verify/${code.trim()}`);
      setCertData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Certificate not found or invalid certificate number.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    verifyCode(searchNumber);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <Award className="w-12 h-12 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Academic Verification Portal
          </h1>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">
            Verify Certificate Authenticity
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                Enter Certificate Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. CERT-2026-00001"
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value)}
                  className="flex-1 h-10 bg-muted/30 border border-border rounded-xl px-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileSearch className="w-3.5 h-3.5" />
                  )}
                  Verify
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Verification Result */}
        {loading && (
          <div className="py-12 flex justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center space-y-3 animate-in fade-in duration-300">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
            <h3 className="text-sm font-bold text-destructive uppercase tracking-widest">Verification Failed</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>
          </div>
        )}

        {certData && (
          <div className="bg-card border border-border rounded-2xl shadow-md overflow-hidden animate-in fade-in duration-500">
            {/* Status Banner */}
            <div className={`px-6 py-4 flex items-center justify-between border-b border-border ${
              certData.status === 'Cancelled' ? 'bg-destructive/10' :
              certData.status === 'Reissued' ? 'bg-amber-500/10' :
              'bg-emerald-500/10'
            }`}>
              <div className="flex items-center gap-2">
                {certData.status === 'Cancelled' ? (
                  <ShieldAlert className="w-5 h-5 text-destructive" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
                <div>
                  <h3 className={`text-xs font-black uppercase tracking-widest ${
                    certData.status === 'Cancelled' ? 'text-destructive' :
                    certData.status === 'Reissued' ? 'text-amber-600' :
                    'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {certData.status === 'Cancelled' ? 'Revoked / Cancelled' :
                     certData.status === 'Reissued' ? 'Verified Duplicate' :
                     'Verified Authentic'}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">Registered on official ledger</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-foreground bg-muted/40 px-2 py-0.5 rounded">
                {certData.certificateNumber}
              </span>
            </div>

            {/* Certificate Details */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Awardee Name</p>
                  <p className="text-sm font-bold text-foreground">
                    {certData.Student?.firstName} {certData.Student?.lastName || ''}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Academic Class</p>
                  <p className="text-sm font-bold text-foreground">
                    Class {certData.Student?.Class?.name || 'N/A'} - {certData.Student?.Section?.name || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Admission Number</p>
                  <p className="text-sm font-bold text-foreground">{certData.Student?.admissionNo || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Roll Number</p>
                  <p className="text-sm font-bold text-foreground">{certData.Student?.rollNumber || 'N/A'}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Certificate Type</p>
                  <p className="text-sm font-bold text-foreground">{certData.Template?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Issue Date (AD)</p>
                  <p className="text-sm font-bold text-foreground">
                    {new Date(certData.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                {certData.nepaliDate && (
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Issue Date (BS)</p>
                    <p className="text-sm font-bold text-foreground">{certData.nepaliDate}</p>
                  </div>
                )}
              </div>

              {/* Duplicate or Cancellation Warnings */}
              {certData.status === 'Cancelled' && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl space-y-1 text-xs">
                  <p className="font-bold text-destructive uppercase tracking-widest">Revocation Reason</p>
                  <p className="text-muted-foreground">"{certData.cancellationReason || 'No details provided.'}"</p>
                </div>
              )}

              {certData.status === 'Reissued' && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1 text-xs">
                  <p className="font-bold text-amber-600 uppercase tracking-widest">Reissue Audit Trail</p>
                  <p className="text-muted-foreground mb-2">"{certData.reissueReason || 'No details provided.'}"</p>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                    Notice: This document is a duplicate copy.
                  </p>
                </div>
              )}

              {/* Template Body Preview text */}
              <div className="border-t border-border pt-4">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-2">Award citation text</p>
                <div className="p-3 bg-muted/20 border border-border rounded-lg text-xs leading-relaxed text-muted-foreground italic">
                  "{certData.Template?.bodyText}"
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Portal Footer */}
      <div className="text-center pt-8 border-t border-border max-w-2xl mx-auto w-full text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex justify-between items-center">
        <span>© {new Date().getFullYear()} School Management Verification</span>
        <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to School
        </Link>
      </div>
    </div>
  );
};

export default PublicVerifyCertificate;
