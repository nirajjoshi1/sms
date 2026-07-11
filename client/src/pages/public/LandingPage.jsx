import React, {
  useState, useEffect, useRef, useCallback
} from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { toast } from 'sonner';
import BlurText from '../../components/landing/BlurText';
import CinematicBackground from '../../components/landing/WebGLBackground';
import '../../styles/landing.css';

// ═══════════════════════════════════════════════════════════════════
// SVG Icons (inline, no external deps)
// ═══════════════════════════════════════════════════════════════════
const ArrowUpRight = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M7 17L17 7"/><path d="M7 7h10v10"/>
  </svg>
);
const PlayIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="6 4 20 12 6 20 6 4"/>
  </svg>
);
const ChevronDown = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path d="M6 9l6 6 6-6"/>
  </svg>
);
const GradCap = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path d="M22 9L12 4 2 9l10 5 10-5z"/>
    <path d="M6 11.5v5c2 2 8 2 12 0v-5"/>
    <path d="M22 9v5"/>
  </svg>
);
const ClockIcon = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
  </svg>
);
const GlobeIcon = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <circle cx="12" cy="12" r="9"/>
    <path d="M3.5 9h17m-17 6h17"/>
    <path d="M12 3c-2 3-3 5.5-3 9s1 6 3 9"/>
    <path d="M12 3c2 3 3 5.5 3 9s-1 6-3 9"/>
  </svg>
);
const SchoolIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <path d="M3 19V9l9-6 9 6v10"/><path d="M9 19v-6h6v6"/><rect x="11" y="2" width="2" height="3"/>
  </svg>
);
const CheckIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);
const ShieldIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const DatabaseIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
    <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
  </svg>
);
const ZapIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);
const BarIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <path d="M18 20V10m-6 10V4M6 20v-6"/>
  </svg>
);

// ═══════════════════════════════════════════════════════════════════
// Motion variants
// ═══════════════════════════════════════════════════════════════════
const fadeUp = (delay = 0) => ({
  initial:  { opacity: 0, y: 28, filter: 'blur(8px)' },
  animate:  { opacity: 1, y: 0,  filter: 'blur(0px)' },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay },
});

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};
const staggerChild = {
  initial:  { opacity: 0, y: 30, filter: 'blur(8px)' },
  animate:  { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.25,0.46,0.45,0.94] } },
};

// ═══════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════

// Capability card (reference Section 2 style)
const CapabilityCard = ({ icon: Icon, tags, title, body, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    transition={{ duration: 0.8, ease: [0.25,0.46,0.45,0.94], delay }}
    viewport={{ once: true, margin: '-60px' }}
    className="liquid-glass rounded-[1.25rem] card-hover"
    style={{
      minHeight: 340,
      padding: '28px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
    data-cursor="view"
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'auto' }}>
      <div className="liquid-glass" style={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'flex-end', maxWidth: '65%' }}>
        {tags.map(t => (
          <span key={t} className="liquid-glass" style={{ borderRadius: '9999px', padding: '4px 12px', fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>
            {t}
          </span>
        ))}
      </div>
    </div>
    <div style={{ marginTop: '32px' }}>
      <h3 className="heading-display text-3xl md:text-4xl text-white" style={{ marginBottom: '12px' }}>{title}</h3>
      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', maxWidth: '34ch' }}>{body}</p>
    </div>
  </motion.div>
);

// ── HD Dashboard Image with subtle mouse-tilt parallax ──
const DashboardImage = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let lastT = 0;
    const onMove = (e) => {
      const now = Date.now();
      if (now - lastT < 30) return;
      lastT = now;
      const rx = ((e.clientY / innerHeight) - 0.5) * -6;
      const ry = ((e.clientX / innerWidth)  - 0.5) *  6;
      el.style.transform = `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    };
    const onLeave = () => {
      el.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg) scale(1)';
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);
  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: '100%',
        transition: 'transform 0.18s ease-out',
        transformStyle: 'preserve-3d',
      }}
    >
      <img
        src="/dashboard-preview.jpg"
        alt="Gradex School Management Dashboard"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        loading="eager"
        draggable={false}
      />
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════
const NAV_LINKS = ['Platform', 'Features', 'Security', 'Pricing', 'FAQ'];

const CAPABILITIES = [
  {
    icon: SchoolIcon,
    tags: ['Admissions', 'Rosters', 'ID Cards'],
    title: 'Student Intelligence',
    body: 'Full lifecycle management: admission, photo capture, house rosters, parent records, dynamic categories, and disable/enable controls with audit tags.',
  },
  {
    icon: BarIcon,
    tags: ['Fees', 'Payroll', 'Receipts'],
    title: 'Finance & Payroll Engine',
    body: 'Configurable fee masters, automatic discounts, offline bank reconciliation, dynamic payroll calculation, and PDF receipt/slip generation at scale.',
  },
  {
    icon: ZapIcon,
    tags: ['Timetable', 'Attendance', 'Marks'],
    title: 'Operations Automation',
    body: 'Drag-and-drop class scheduling, teacher allocation, bulk student promotion, daily attendance punches, multi-level leave approval, and exam marks entry.',
  },
];

const FEATURES = [
  { icon: DatabaseIcon, title: 'Isolated Tenant DB', desc: 'Each school gets its own scoped Postgres connection via AsyncLocalStorage. Zero cross-tenant leakage — architecturally guaranteed.' },
  { icon: ShieldIcon,   title: 'Layered Auth',       desc: 'JWT tokens, bcrypt hashing, role-based API guards, Helmet.js headers, and CORS enforcement on every route.' },
  { icon: BarIcon,      title: 'Full Audit Trail',   desc: 'Every create, update, and delete scoped by schoolId + session. Export to Excel or PDF at any point.' },
  { icon: ZapIcon,      title: 'Sub-second Queries', desc: 'Neon serverless Postgres with connection pooling. Dashboard loads in < 300ms globally across all active tenants.' },
  { icon: GlobeIcon,    title: 'Academic Sessions',  desc: 'Complete session scoping: fees, attendance, results, and timetables are fully isolated per academic year.' },
  { icon: ClockIcon,    title: '< 24h Provisioning', desc: 'Submit a request. Admin approves. Your isolated tenant, subdomain, and credentials are live the same day.' },
];

const FAQS = [
  { q: 'What makes Gradex different from generic school software?', a: "Gradex is purpose-built as multi-tenant infrastructure. Your data lives in a PostgreSQL database scoped exclusively to your schoolId — no shared tables, no noisy neighbours, no data leakage between institutions." },
  { q: 'How fast can we go live?', a: "Typical provisioning: under 24 hours from form submission to live credentials. Migration of existing spreadsheet data is supported and guided by our support team." },
  { q: 'Can teachers access other teachers\' classes?', a: "No. Role-based guards at the API layer ensure teachers see only their assigned classes, attendance sheets, homework, and marks — nothing outside their scope." },
  { q: 'Does offline bank payment reconciliation work?', a: "Yes. Accountants upload bank receipts, mark them as pending, and reconcile manually — creating a full audit trail for cash, cheque, and bank-transfer payments." },
  { q: 'Can I customise ID cards and certificates?', a: "Yes. Canvas-based template builder with custom logos, fields, and layout. Batch print queues for entire cohorts." },
];

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════
const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled]   = useState(false);
  const [openFaq, setOpenFaq]     = useState(null);
  const [students, setStudents]   = useState(500);
  const [billing, setBilling]     = useState('annual');
  const [loading, setLoading]     = useState(false);
  const [form, setForm]           = useState({
    schoolName:'', schoolCode:'', contactName:'', contactEmail:'', contactPhone:'', address:'', message:''
  });

  const progressRef = useRef(null);

  // ── Scroll progress bar + navbar ──
  useEffect(() => {
    const bar = document.getElementById('scroll-progress');
    const handler = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (bar) bar.style.transform = `scaleX(${pct})`;
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // ── Pricing ──
  const pricing = (() => {
    const rate = billing === 'annual' ? 0.8 : 1;
    const price = Math.round(students * rate);
    const plan = students > 2000 ? 'Enterprise' : students > 600 ? 'Professional' : 'Growth';
    const features = {
      Growth: ['Multi-tenant isolation','Student & staff directories','Class scheduling','Basic fees collection','Standard reports'],
      Professional: ['Everything in Growth','Timetable builder','Leave management','Offline bank reconciliation','Excel & PDF exports','Session scoping'],
      Enterprise: ['Dedicated scoped DB','Advanced payroll & HR','Full audit trail','Auto payment reminders','Custom school portal','Cloudinary storage','24/7 priority support'],
    }[plan];
    return { price, plan, features };
  })();

  const handleInput = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/school-requests', form);
      if (res.data?.success) {
        toast.success(res.data.message || 'Request submitted! We\'ll be in touch within 24 hours.');
        setForm({ schoolName:'',schoolCode:'',contactName:'',contactEmail:'',contactPhone:'',address:'',message:'' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally { setLoading(false); }
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="landing-page-root" style={{ background: '#000', color: '#fff', overflowX: 'hidden' }}>
      <div id="scroll-progress" />


      {/* ── NAVBAR (Global) ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: scrolled ? '12px 40px' : '24px 40px',
          background: scrolled ? 'rgba(0, 0, 0, 0.75)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Logo circle */}
        <motion.div
          {...fadeUp(0.1)}
          className="liquid-glass"
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <GradCap size={20} />
        </motion.div>

        {/* Nav pill (hidden on small) */}
        <motion.div
          {...fadeUp(0.2)}
          className="liquid-glass nav-pill"
          style={{ display: 'none', borderRadius: 9999 }}
          ref={el => { if (el) el.style.display = 'flex'; }}
        >
          {NAV_LINKS.map(link => (
            <button
              key={link}
              className="nav-link"
              onClick={() => scrollTo(link.toLowerCase())}
            >
              {link}
            </button>
          ))}
          <button
            className="nav-link-cta"
            onClick={() => scrollTo('register')}
          >
            Request Access&nbsp;<ArrowUpRight size={12} />
          </button>
        </motion.div>

        {/* Right spacer / sign in */}
        <motion.div {...fadeUp(0.3)}>
          <button
            onClick={() => navigate('/login')}
            style={{
              width: 84,
              height: 40,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              fontFamily: "'Barlow', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
            className="liquid-glass"
          >
            Log in
          </button>
        </motion.div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        style={{ position: 'relative', height: '100vh', overflow: 'hidden', background: '#000' }}
      >
        {/* WebGL cinematic background */}
        <CinematicBackground section="hero" />

        {/* Content layer */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* ── HERO MAIN CONTENT ── */}
          <div
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              paddingTop: 96, paddingBottom: 0,
              paddingLeft: 24, paddingRight: 24,
              textAlign: 'center',
            }}
          >
            {/* Badge */}
            <motion.div {...fadeUp(0.4)} style={{ marginBottom: 28 }}>
              <span
                className="liquid-glass"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '8px 18px', borderRadius: 9999,
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 13, fontWeight: 500,
                  color: 'rgba(255,255,255,0.75)',
                }}
              >
                <span
                  style={{
                    background: '#fff', color: '#000',
                    padding: '2px 8px', borderRadius: 9999,
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                  }}
                >New</span>
                Now managing 420+ institutions worldwide · limited onboarding capacity
              </span>
            </motion.div>

            {/* Headline — BlurText */}
            <div style={{ maxWidth: 900, marginBottom: 24 }}>
              <BlurText
                text="The School OS That Thinks Ahead"
                className="heading-display heading-xl text-white"
                style={{ justifyContent: 'center' }}
                delay={0.5}
                stagger={80}
              />
            </div>

            {/* Sub */}
            <motion.p
              {...fadeUp(0.8)}
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
                color: 'rgba(255,255,255,0.6)',
                maxWidth: 560,
                lineHeight: 1.6,
                marginBottom: 36,
              }}
            >
              Reconcile fees. Orchestrate timetables. Process payroll. Generate dynamic reports — all with complete data isolation per school, per session, per tenant.
            </motion.p>

            {/* CTAs */}
            <motion.div {...fadeUp(1.1)} style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
              <button
                className="liquid-glass-strong"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 26px', borderRadius: 9999,
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 600, fontSize: 14,
                  color: '#fff', cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onClick={() => scrollTo('register')}
              >
                Start Onboarding <ArrowUpRight size={16} />
              </button>
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'transparent',
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 500, fontSize: 14,
                  color: 'rgba(255,255,255,0.75)',
                  cursor: 'pointer',
                }}
                onClick={() => scrollTo('platform')}
              >
                <PlayIcon size={16} /> Explore Platform
              </button>
            </motion.div>

            {/* Stats cards */}
            <motion.div
              {...fadeUp(1.3)}
              style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}
            >
              {[
                { Icon: ClockIcon, number: '< 24h', label: 'Average provisioning time' },
                { Icon: GlobeIcon, number: '420+', label: 'Schools across 4 continents' },
              ].map(({ Icon, number, label }) => (
                <div
                  key={label}
                  className="liquid-glass"
                  style={{
                    padding: '20px 24px', borderRadius: 20,
                    width: 220, textAlign: 'left',
                  }}
                >
                  <Icon />
                  <div className="stat-number" style={{ marginTop: 16, marginBottom: 4 }}>
                    {number}
                  </div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>
                    {label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Trust bar */}
            <motion.div
              {...fadeUp(1.4)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
            >
              <span
                className="liquid-glass"
                style={{
                  display: 'inline-block',
                  padding: '8px 20px', borderRadius: 9999,
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 12, fontWeight: 400,
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                Trusted by principals, directors, and operations managers worldwide
              </span>
              <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Horizon', 'Apex', 'Pinnacle', 'Meridian', 'Nova'].map(name => (
                  <span
                    key={name}
                    className="heading-display"
                    style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'rgba(255,255,255,0.22)' }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          style={{
            position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            style={{
              width: 26, height: 42, borderRadius: 13,
              border: '1.5px solid rgba(255,255,255,0.2)',
              display: 'flex', justifyContent: 'center', paddingTop: 7,
            }}
          >
            <motion.div
              animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              style={{ width: 4, height: 8, background: 'rgba(255,255,255,0.5)', borderRadius: 2 }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3D DASHBOARD SHOWCASE
      ═══════════════════════════════════════════════════════════════ */}
      <section id="platform" style={{ background: '#000', padding: '80px 40px 0', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.25,0.46,0.45,0.94] }}
          viewport={{ once: true, margin: '-100px' }}
          className="liquid-glass-strong"
          style={{
            maxWidth: 1100, margin: '0 auto',
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow: '0 0 0 1px rgba(99,102,241,0.15), 0 60px 120px rgba(0,0,0,0.8)',
          }}
          data-cursor="drag"
        >
          {/* Window chrome */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
            background: 'rgba(0,0,0,0.6)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {['#ef4444','#f59e0b','#22c55e'].map(c => (
                <span key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c, opacity: 0.7, display: 'inline-block' }} />
              ))}
              <span style={{
                marginLeft: 16, fontFamily: "'Barlow', sans-serif",
                fontSize: 11, color: 'rgba(255,255,255,0.3)',
              }}>
                https://portal.gradexsms.edu/dashboard
              </span>
            </div>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#6366f1', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', display: 'inline-block', animation: 'none' }} />
              Live · 2026-27
            </span>
          </div>
          {/* HD Dashboard screenshot with mouse-tilt parallax */}
          <div style={{ height: 480, overflow: 'hidden' }}>
            <DashboardImage />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MARQUEE TRUST BAR
      ═══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '60px 0', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.005)', marginTop: 60 }}>
        <div className="marquee-wrap">
          <div className="marquee-track" style={{ alignItems: 'center' }}>
            {[...Array(2)].map((_,i) => (
              <React.Fragment key={i}>
                {['Horizon Academy','Apex Science Institute','Saint Jude High','Alpine International','Crystal Valley School','Pinnacle Learning','Nova Educational Trust','Meridian Scholars'].map(name => (
                  <div key={name} style={{ display:'flex', alignItems:'center', gap:12, margin: '0 48px', flexShrink:0 }}>
                    <span style={{ width:28, height:28, borderRadius:8, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <SchoolIcon size={15} />
                    </span>
                    <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:500, fontSize:13, color:'rgba(255,255,255,0.25)', whiteSpace:'nowrap' }}>{name}</span>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: CAPABILITIES (dark bg with shader)
      ═══════════════════════════════════════════════════════════════ */}
      <section
        id="features"
        style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: '#000' }}
      >
        {/* Lightweight CSS gradient — no extra WebGL canvas */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(6,182,212,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 60%, rgba(99,102,241,0.07) 0%, transparent 60%)',
        }} />

        <div style={{ position: 'relative', zIndex: 10, padding: '100px 40px 80px', maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 80 }}>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontFamily:"'Barlow', sans-serif", fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:24 }}
            >
              // Platform
            </motion.p>
            <BlurText
              text="Complete control, infinite scale."
              className="heading-display heading-lg text-white"
              delay={0.1}
              stagger={70}
            />
          </div>

          {/* Capability cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {CAPABILITIES.map((cap, i) => (
              <CapabilityCard key={cap.title} {...cap} delay={i * 0.12} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES GRID — deep dark
      ═══════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#000', padding: '100px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              style={{ fontFamily:"'Barlow', sans-serif", fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:20 }}
            >
              // Infrastructure
            </motion.p>
            <BlurText
              text="Hardened at every layer of the stack."
              className="heading-display heading-md text-white"
              delay={0.1} stagger={65}
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }} viewport={{ once: true }}
              style={{ fontFamily:"'Barlow', sans-serif", fontWeight:300, fontSize:15, color:'rgba(255,255,255,0.45)', maxWidth:520, margin:'20px auto 0', lineHeight:1.7 }}
            >
              Security, isolation, and observability are defaults, not afterthoughts.
            </motion.p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, ease: [0.25,0.46,0.45,0.94], delay: (i%3)*0.1 }}
                viewport={{ once: true, margin: '-40px' }}
                className="liquid-glass card-hover"
                style={{ borderRadius: 20, padding: '28px 28px 28px' }}
                data-cursor="view"
              >
                <div className="liquid-glass" style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:22, letterSpacing:'-0.02em', marginBottom:10, color:'#fff' }}>
                  {title}
                </h3>
                <p style={{ fontFamily:"'Barlow', sans-serif", fontWeight:300, fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.65 }}>
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PRICING — with shader bg
      ═══════════════════════════════════════════════════════════════ */}
      <section id="pricing" style={{ position:'relative', overflow:'hidden', background:'#000', padding:'100px 40px' }}>
        {/* Lightweight CSS gradient — no extra WebGL canvas */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse 70% 55% at 75% 30%, rgba(139,92,246,0.09) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 20% 70%, rgba(236,72,153,0.07) 0%, transparent 60%)',
        }} />
        <div style={{ position:'relative', zIndex:10, maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <motion.p
              initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
              style={{ fontFamily:"'Barlow', sans-serif", fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:20 }}
            >
              // Pricing
            </motion.p>
            <BlurText text="Scale with confidence. Pay for what you use." className="heading-display heading-md text-white" delay={0.1} stagger={60} />
            {/* Toggle */}
            <motion.div
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.5 }} viewport={{ once:true }}
              style={{ display:'inline-flex', marginTop:32, padding:6, borderRadius:9999, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', gap:4 }}
            >
              {['monthly','annual'].map(c => (
                <button key={c} onClick={() => setBilling(c)}
                  style={{
                    padding:'8px 22px', borderRadius:9999,
                    fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:12,
                    letterSpacing:'0.08em', textTransform:'uppercase',
                    background: billing===c ? '#fff' : 'transparent',
                    color: billing===c ? '#000' : 'rgba(255,255,255,0.5)',
                    transition:'all 0.25s',
                    display:'flex', alignItems:'center', gap:6,
                    cursor: 'pointer',
                  }}
                >
                  {c === 'annual' ? 'Annual' : 'Monthly'}
                  {c==='annual' && <span style={{ fontSize:9, padding:'2px 6px', borderRadius:9999, background:billing==='annual'?'#000':'rgba(34,197,94,0.2)', color:billing==='annual'?'#22c55e':'#22c55e', fontWeight:700 }}>−20%</span>}
                </button>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity:0, y:60 }} whileInView={{ opacity:1, y:0 }} transition={{ duration:0.9, ease:[0.25,0.46,0.45,0.94] }} viewport={{ once:true }}
            className="liquid-glass-strong"
            style={{ borderRadius:28, padding:'48px 48px', boxShadow:'0 60px 100px rgba(0,0,0,0.6)' }}
          >
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:48, alignItems:'center' }}>
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                  <span style={{ fontFamily:"'Barlow', sans-serif", fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)' }}>
                    Student Capacity
                  </span>
                  <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:32, color:'#fff', letterSpacing:'-0.03em' }}>
                    {students.toLocaleString()}
                  </span>
                </div>
                <input type="range" min="100" max="5000" step="50" value={students} onChange={e=>setStudents(+e.target.value)} />
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:10, fontFamily:"'Barlow', sans-serif", fontSize:11, color:'rgba(255,255,255,0.2)' }}>
                  <span>100</span><span>2,500</span><span>5,000</span>
                </div>
                <div style={{ marginTop:36 }}>
                  <p style={{ fontFamily:"'Barlow', sans-serif", fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:16 }}>
                    {pricing.plan} Includes:
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {pricing.features.map(f => (
                      <div key={f} style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ width:18, height:18, borderRadius:'50%', background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <CheckIcon size={10} />
                        </span>
                        <span style={{ fontFamily:"'Barlow', sans-serif", fontSize:13, color:'rgba(255,255,255,0.55)' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="liquid-glass-indigo"
                style={{ borderRadius:24, padding:'36px 32px', textAlign:'center', minWidth:220 }}
              >
                <p style={{ fontFamily:"'Barlow', sans-serif", fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(99,102,241,0.7)', marginBottom:20 }}>
                  {pricing.plan}
                </p>
                <div style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:'clamp(3.5rem,6vw,4.5rem)', lineHeight:1, letterSpacing:'-0.04em', color:'#fff' }}>
                  ${pricing.price}
                </div>
                <p style={{ fontFamily:"'Barlow', sans-serif", fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:8, marginBottom:32 }}>
                  per month, billed {billing}
                </p>
                <button
                  onClick={() => scrollTo('register')}
                  style={{
                    width:'100%', padding:'12px 0', borderRadius:9999,
                    background:'#fff', color:'#000',
                    fontFamily:"'Barlow', sans-serif", fontWeight:700, fontSize:13,
                    letterSpacing:'0.06em', textTransform:'uppercase',
                    cursor:'pointer', transition:'opacity 0.2s',
                  }}
                  data-cursor="view"
                >
                  Deploy Now
                </button>
                <p style={{ fontFamily:"'Barlow', sans-serif", fontSize:11, color:'rgba(255,255,255,0.2)', marginTop:14, lineHeight:1.6 }}>
                  No setup fees · 24h provisioning · Cancel anytime
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════════════ */}
      <section style={{ background:'#000', padding:'100px 40px' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ marginBottom:60 }}>
            <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ fontFamily:"'Barlow', sans-serif", fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:20 }}>
              // Testimonials
            </motion.p>
            <BlurText text="Trusted by those who demand precision." className="heading-display heading-md text-white" delay={0.1} stagger={65} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(400px, 1fr))', gap:24 }}>
            {[
              { name:'Dr. Arthur Pendelton', role:'Director, Apex Science Academy', initials:'AP', quote:"Gradex transformed our operations. Isolated sessions and separate fee calculators for our primary and secondary branches saved our accountants over 20 hours of reconciliation weekly." },
              { name:'Elena Rostova', role:'Chief Accountant, Saint Jude High', initials:'ER', quote:"The audit log scoping by session is extraordinary. Past ERPs gave us a mess. Gradex scopes every single query by academic year — audits now take minutes, not days." },
            ].map(({ name, role, initials, quote }) => (
              <motion.div
                key={name}
                initial={{ opacity:0, y:40, filter:'blur(8px)' }}
                whileInView={{ opacity:1, y:0, filter:'blur(0px)' }}
                transition={{ duration:0.8 }}
                viewport={{ once:true, margin:'-40px' }}
                className="liquid-glass card-hover"
                style={{ borderRadius:24, padding:32, position:'relative' }}
                data-cursor="view"
              >
                {/* Stars */}
                <div style={{ display:'flex', gap:3, marginBottom:24 }}>
                  {[...Array(5)].map((_,i) => <span key={i} style={{ color:'#f59e0b', fontSize:14 }}>★</span>)}
                </div>
                <p style={{ fontFamily:"'Barlow', sans-serif", fontWeight:300, fontSize:14, color:'rgba(255,255,255,0.65)', lineHeight:1.8, fontStyle:'italic', marginBottom:28 }}>
                  "{quote}"
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:16, color:'rgba(255,255,255,0.6)' }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Barlow', sans-serif", fontWeight:600, fontSize:14, color:'#fff' }}>{name}</div>
                    <div style={{ fontFamily:"'Barlow', sans-serif", fontWeight:300, fontSize:12, color:'rgba(255,255,255,0.35)' }}>{role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════════════ */}
      <section id="faq" style={{ background:'#000', padding:'80px 40px', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <div style={{ marginBottom:60 }}>
            <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ fontFamily:"'Barlow', sans-serif", fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:20 }}>
              // FAQ
            </motion.p>
            <BlurText text="Common questions, direct answers." className="heading-display heading-md text-white" delay={0.1} stagger={70} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }} viewport={{ once:true }}
                className="liquid-glass"
                style={{ borderRadius:16, overflow:'hidden' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq===i ? null : i)}
                  style={{
                    width:'100%', display:'flex', justifyContent:'space-between', alignItems:'flex-start',
                    padding:'22px 24px', gap:16, textAlign:'left', cursor:'pointer',
                    background:'transparent',
                  }}
                >
                  <span style={{ fontFamily:"'Barlow', sans-serif", fontWeight:500, fontSize:14, color:'rgba(255,255,255,0.85)', lineHeight:1.5 }}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={openFaq===i ? 'rotate-180' : ''}
                    style={{ flexShrink:0, marginTop:2, color:'rgba(255,255,255,0.3)', transition:'transform 0.3s' }}
                  />
                </button>
                <div
                  className="faq-content"
                  style={{ maxHeight: openFaq===i ? 300 : 0, opacity: openFaq===i ? 1 : 0 }}
                >
                  <p style={{ fontFamily:"'Barlow', sans-serif", fontWeight:300, fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.75, padding:'0 24px 22px', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:16 }}>
                    {faq.a}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          REGISTER / CTA FORM
      ═══════════════════════════════════════════════════════════════ */}
      <section id="register" style={{ background:'#000', padding:'100px 40px', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:80, alignItems:'start' }}>
          {/* Left info */}
          <div style={{ position:'sticky', top:100 }}>
            <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ fontFamily:"'Barlow', sans-serif", fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:24 }}>
              // Get Started
            </motion.p>
            <BlurText text="Deploy your dedicated school tenant." className="heading-display heading-md text-white" delay={0.1} stagger={60} />
            <motion.p
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.5 }} viewport={{ once:true }}
              style={{ fontFamily:"'Barlow', sans-serif", fontWeight:300, fontSize:14, color:'rgba(255,255,255,0.45)', lineHeight:1.75, marginTop:20, marginBottom:36 }}
            >
              Submit this form. Our Super Admin reviews and provisions your isolated database, admin credentials, and subdomain within 24 hours — guaranteed.
            </motion.p>
            {[
              { label:'support@gradexsms.edu' },
              { label:'+1 (555) 019-2834' },
              { label:'Gradex Global HQ, Suite 404' },
            ].map(({ label }) => (
              <motion.div key={label} initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
                style={{ display:'flex', alignItems:'center', gap:16, marginBottom:14,
                  fontFamily:"'Barlow', sans-serif", fontSize:13, color:'rgba(255,255,255,0.4)' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'rgba(99,102,241,0.5)', display:'inline-block' }} />
                {label}
              </motion.div>
            ))}
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity:0, y:60, filter:'blur(10px)' }}
            whileInView={{ opacity:1, y:0, filter:'blur(0px)' }}
            transition={{ duration:0.9 }}
            viewport={{ once:true }}
            className="liquid-glass-strong"
            style={{ borderRadius:28, padding:'44px 40px', boxShadow:'0 60px 100px rgba(0,0,0,0.7)' }}
          >
            <h3 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:26, color:'#fff', letterSpacing:'-0.02em', marginBottom:32, paddingBottom:24, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              Institution Details
            </h3>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {[
                  { name:'schoolName', label:'School Name *', ph:'e.g. Horizon International', req:true },
                  { name:'schoolCode', label:'School Code *', ph:'e.g. HORIZON', req:true },
                ].map(({ name, label, ph, req }) => (
                  <div key={name}>
                    <label style={{ fontFamily:"'Barlow', sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', display:'block', marginBottom:8 }}>{label}</label>
                    <input type="text" name={name} required={req} value={form[name]} onChange={handleInput} placeholder={ph}
                      className="glass-input" style={{ width:'100%', borderRadius:12, padding:'12px 16px' }} />
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
                {[
                  { name:'contactName',  label:'Contact *',   type:'text',  ph:'Jane Doe',           req:true },
                  { name:'contactEmail', label:'Email *',     type:'email', ph:'jane@school.edu',    req:true },
                  { name:'contactPhone', label:'Phone *',     type:'tel',   ph:'+1 555-0100',         req:true },
                ].map(({ name, label, type, ph, req }) => (
                  <div key={name}>
                    <label style={{ fontFamily:"'Barlow', sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', display:'block', marginBottom:8 }}>{label}</label>
                    <input type={type} name={name} required={req} value={form[name]} onChange={handleInput} placeholder={ph}
                      className="glass-input" style={{ width:'100%', borderRadius:12, padding:'12px 16px' }} />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontFamily:"'Barlow', sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', display:'block', marginBottom:8 }}>Address</label>
                <input type="text" name="address" value={form.address} onChange={handleInput} placeholder="123 Main St, New York, NY"
                  className="glass-input" style={{ width:'100%', borderRadius:12, padding:'12px 16px' }} />
              </div>
              <div>
                <label style={{ fontFamily:"'Barlow', sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', display:'block', marginBottom:8 }}>Notes</label>
                <textarea name="message" rows={4} value={form.message} onChange={handleInput}
                  placeholder="Custom module needs, migration requirements..."
                  className="glass-input" style={{ width:'100%', borderRadius:12, padding:'12px 16px', resize:'none' }} />
              </div>
              <button
                type="submit" disabled={loading}
                style={{
                  width:'100%', padding:'14px', borderRadius:9999,
                  background: loading ? 'rgba(255,255,255,0.15)' : '#fff',
                  color: '#000',
                  fontFamily:"'Barlow', sans-serif", fontWeight:700, fontSize:13,
                  letterSpacing:'0.08em', textTransform:'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition:'opacity 0.2s',
                  marginTop:8,
                  display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                }}
                data-cursor="view"
              >
                {loading ? 'Submitting…' : (<>Submit Request <ArrowUpRight size={16}/></>)}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════ */}
      <footer style={{ background:'#000', borderTop:'1px solid rgba(255,255,255,0.05)', padding:'80px 40px 40px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          
          {/* Top Multi-column Section */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:40, marginBottom:64 }}>
            
            {/* Column 1: Brand */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div className="liquid-glass" style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <GradCap size={18} />
                </div>
                <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize:19, color:'#fff' }}>
                  Gradex SMS
                </span>
              </div>
              <p style={{ fontFamily:"'Barlow', sans-serif", fontWeight:300, fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.6 }}>
                Next-generation multi-tenant school operating system built for absolute data isolation and fluid school operations.
              </p>
            </div>

            {/* Column 2: Platform Links */}
            <div>
              <h4 style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:11, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'#fff', marginBottom:20 }}>
                Platform
              </h4>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:10 }}>
                {['Platform', 'Features', 'Security', 'Pricing'].map(item => (
                  <li key={item}>
                    <button onClick={() => scrollTo(item.toLowerCase())} style={{ cursor: 'pointer', background:'transparent', border:'none', padding:0, fontFamily:"'Barlow', sans-serif", fontSize:13, color:'rgba(255,255,255,0.45)', textAlign:'left', transition:'color 0.2s' }} className="hover-white">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div>
              <h4 style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:11, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'#fff', marginBottom:20 }}>
                Resources
              </h4>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:10 }}>
                {['FAQ', 'Developer API', 'Status Monitor', 'Support Helpdesk'].map(item => (
                  <li key={item}>
                    <button onClick={() => scrollTo('faq')} style={{ cursor: 'pointer', background:'transparent', border:'none', padding:0, fontFamily:"'Barlow', sans-serif", fontSize:13, color:'rgba(255,255,255,0.45)', textAlign:'left', transition:'color 0.2s' }} className="hover-white">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Institutional Hardening */}
            <div>
              <h4 style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:11, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'#fff', marginBottom:20 }}>
                Hardened By
              </h4>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:10 }}>
                {['Neon serverless Postgres', 'Row-level tenant security', 'BCrypt + JWT Encryption', 'Daily offsite database backup'].map(item => (
                  <li key={item} style={{ fontFamily:"'Barlow', sans-serif", fontSize:13, color:'rgba(255,255,255,0.45)', display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:4, height:4, borderRadius:'50%', background:'#6366f1' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <hr style={{ border:'none', height:1, background:'rgba(255,255,255,0.06)', marginBottom:32 }} />

          {/* Bottom Bar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <p style={{ fontFamily:"'Barlow', sans-serif", fontWeight:300, fontSize:12, color:'rgba(255,255,255,0.3)' }}>
              © {new Date().getFullYear()} Gradex School Management System. All rights reserved.
            </p>
            <div style={{ display:'flex', gap:24 }}>
              {['Privacy Policy', 'Terms of Service', 'SLA Agreement'].map(policy => (
                <a key={policy} href="#" style={{ cursor: 'pointer', fontFamily:"'Barlow', sans-serif", fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'none', transition:'color 0.2s' }} className="hover-white">
                  {policy}
                </a>
              ))}
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
