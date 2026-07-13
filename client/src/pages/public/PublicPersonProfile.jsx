import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BadgeCheck, BookOpen, BriefcaseBusiness, Building2, CalendarDays,
  CircleDollarSign, GraduationCap, Mail, MapPin, Phone,
  ShieldCheck, UserRound, XCircle
} from 'lucide-react';
import api from '../../lib/api';

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('en-NP', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value))
  : '—';

const money = (value) => new Intl.NumberFormat('en-NP', {
  style: 'currency', currency: 'NPR', maximumFractionDigits: 2
}).format(Number(value || 0));

const Field = ({ label, value }) => value !== null && value !== undefined && value !== '' && (
  <div className="rounded-xl border border-border bg-muted/20 p-3">
    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
    <p className="mt-1 break-words text-sm font-semibold text-foreground">{value}</p>
  </div>
);

const Section = ({ icon: Icon, title, children }) => (
  <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
    <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
      <div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></div>
      <h2 className="text-sm font-black uppercase tracking-wider">{title}</h2>
    </div>
    {children}
  </section>
);

const PublicPersonProfile = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get(`/identities/${token}`)
      .then(response => active && setData(response.data.data))
      .catch(err => active && setError(
        err.response?.status === 401
          ? 'Please sign in with an authorized school account to view this complete record.'
          : (err.response?.data?.message || 'This QR code could not be verified.')
      ))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [token]);

  if (loading) return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /><p className="mt-4 text-sm font-semibold text-muted-foreground">Verifying QR identity…</p></div>
    </main>
  );

  if (error || !data) return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md rounded-3xl border border-destructive/20 bg-card p-8 text-center shadow-xl">
        <XCircle className="mx-auto h-14 w-14 text-destructive" />
        <h1 className="mt-4 text-xl font-black">QR verification failed</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    </main>
  );

  const { person, school, personType, fees, services } = data;
  const isStudent = personType === 'STUDENT';
  const fullName = [person.firstName, person.middleName, person.lastName].filter(Boolean).join(' ');

  return (
    <main className="min-h-screen bg-muted/30 px-3 py-5 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
          <div className="h-2 bg-gradient-to-r from-primary via-cyan-500 to-emerald-500" />
          <div className="p-5 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-muted shadow-md">
                {person.photo ? <img src={person.photo} alt={fullName} className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9 text-muted-foreground" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400"><BadgeCheck className="h-3.5 w-3.5" /> Verified identity</span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary">{isStudent ? 'Student' : person.role}</span>
                  {person.isDisabled && <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-black text-destructive">INACTIVE</span>}
                </div>
                <h1 className="truncate text-2xl font-black sm:text-3xl">{fullName}</h1>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">{isStudent ? `${person.Class?.name || 'Class'} · ${person.Section?.name || 'Section'}` : `${person.Designation?.name || person.role} · ${person.Department?.name || 'General'}`}</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3 sm:max-w-xs">
                {school.logo ? <img src={school.logo} alt="School logo" className="h-11 w-11 rounded-lg object-contain" /> : <Building2 className="h-8 w-8 text-primary" />}
                <div><p className="text-sm font-black">{school.name}</p><p className="text-[10px] text-muted-foreground">Live school record</p></div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Section icon={isStudent ? GraduationCap : BriefcaseBusiness} title={isStudent ? 'Student details' : 'Staff details'}>
              <div className="grid gap-3 sm:grid-cols-2">
                {isStudent ? <>
                  <Field label="Admission number" value={person.admissionNo} /><Field label="Enrollment number" value={person.enrollNumber} />
                  <Field label="Roll number" value={person.rollNumber} /><Field label="Class & section" value={`${person.Class?.name || '—'} · ${person.Section?.name || '—'}`} />
                  <Field label="Gender" value={person.gender} /><Field label="Date of birth" value={formatDate(person.dob)} />
                  <Field label="Admission date" value={formatDate(person.admissionDate)} /><Field label="House" value={person.House?.name || '—'} />
                  <Field label="Category" value={person.Category?.name || '—'} /><Field label="Mobile" value={person.mobileNumber || '—'} />
                  <Field label="Email" value={person.email || '—'} /><Field label="Guardian" value={`${person.guardianName} (${person.guardianRelation || person.guardianIs || 'Guardian'})`} />
                  <Field label="Guardian phone" value={person.guardianPhone} /><Field label="Guardian address" value={person.guardianAddress || '—'} />
                  <Field label="Father" value={person.fatherName || '—'} /><Field label="Mother" value={person.motherName || '—'} />
                </> : <>
                  <Field label="Staff ID" value={person.staffId} /><Field label="Role" value={person.role} />
                  <Field label="Department" value={person.Department?.name || 'General'} /><Field label="Designation" value={person.Designation?.name || 'Staff'} />
                  <Field label="Gender" value={person.gender} /><Field label="Date of birth" value={formatDate(person.dob)} />
                  <Field label="Joined on" value={formatDate(person.dateOfJoining)} /><Field label="Blood group" value={person.bloodGroup || '—'} />
                  <Field label="Qualification" value={person.qualification || '—'} /><Field label="Experience" value={person.experience || '—'} />
                  <Field label="Phone" value={person.phone || '—'} /><Field label="Email" value={person.email || '—'} />
                  <Field label="Address" value={person.address || '—'} /><Field label="Emergency contact" value={person.emergencyContact || '—'} />
                </>}
              </div>
            </Section>

            {isStudent && fees && (
              <Section icon={CircleDollarSign} title="Fee status">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Assigned" value={money(fees.summary.totalExpected)} />
                  <Field label="Paid" value={money(fees.summary.totalPaid)} />
                  <Field label="Discount" value={money(fees.summary.totalDiscount)} />
                  <Field label="Due" value={money(fees.summary.dueAmount)} />
                </div>
                <div className="mt-5 overflow-hidden rounded-xl border border-border">
                  <div className="border-b border-border bg-muted/30 px-4 py-2.5 text-xs font-black uppercase tracking-wider">Recent payments</div>
                  {fees.payments.length ? fees.payments.map(payment => (
                    <div key={payment.id} className="flex flex-col gap-2 border-b border-border px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                      <div><p className="text-sm font-bold">{payment.FeeType?.name || 'Fee payment'}</p><p className="text-[11px] text-muted-foreground">{payment.receiptNumber} · {formatDate(payment.paymentDate)} · {payment.paymentMethod}</p></div>
                      <p className="text-sm font-black text-emerald-600">{money(payment.amount)}</p>
                    </div>
                  )) : <p className="px-4 py-6 text-center text-sm text-muted-foreground">No fee payments recorded.</p>}
                </div>
              </Section>
            )}

            {!isStudent && person.ClassTeacher?.length > 0 && (
              <Section icon={GraduationCap} title="Class teacher assignments">
                <div className="grid gap-3 sm:grid-cols-2">{person.ClassTeacher.map((item, index) => <Field key={index} label="Assigned class" value={`${item.Class?.name || '—'} · ${item.Section?.name || '—'}`} />)}</div>
              </Section>
            )}

            {!isStudent && person.Timetable?.length > 0 && (
              <Section icon={CalendarDays} title="Teaching schedule">
                <div className="space-y-2">{person.Timetable.map((item, index) => <div key={index} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm"><span className="font-bold">{item.Subject?.name} · {item.Class?.name} {item.Section?.name}</span><span className="text-xs text-muted-foreground">{item.dayOfWeek}, {item.startTime}–{item.endTime}{item.roomNo ? ` · ${item.roomNo}` : ''}</span></div>)}</div>
              </Section>
            )}
          </div>

          <aside className="space-y-4">
            <Section icon={BookOpen} title="School services">
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between"><span className="text-sm font-bold">Library access</span><span className="rounded-full bg-amber-500/10 px-2 py-1 text-[9px] font-black text-amber-700 dark:text-amber-400">COMING SOON</span></div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{services.library.message}</p>
              </div>
            </Section>
            <Section icon={Building2} title="School information">
              <div className="space-y-3 text-sm">
                {school.address && <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{school.address}</p>}
                {school.phone && <p className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-primary" />{school.phone}</p>}
                {school.email && <p className="flex gap-2 break-all"><Mail className="h-4 w-4 shrink-0 text-primary" />{school.email}</p>}
              </div>
            </Section>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" /><div><p className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Verified live record</p><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">This information was fetched directly from the school system on {formatDate(data.verifiedAt)}.</p></div></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default PublicPersonProfile;
