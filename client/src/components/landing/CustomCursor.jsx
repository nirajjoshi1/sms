import { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const labelRef = useRef(null);
  const posRef   = useRef({ x: 0, y: 0 });
  const ringPos  = useRef({ x: 0, y: 0 });
  const [label, setLabel]       = useState('');
  const [ringScale, setScale]   = useState(1);
  const [hidden, setHidden]     = useState(true);

  useEffect(() => {
    let raf;

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setHidden(false);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      // cursor type from nearest data-cursor ancestor
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cursorEl = el?.closest('[data-cursor]');
      const type = cursorEl?.getAttribute('data-cursor') || '';
      setLabel(type === 'view' ? 'View' : type === 'drag' ? 'Drag' : type === 'play' ? 'Play' : '');
      if (type === 'view' || type === 'drag' || type === 'play') setScale(3.2);
      else if (el?.tagName === 'A' || el?.tagName === 'BUTTON' || el?.closest('button,a')) setScale(1.8);
      else setScale(1);
    };

    const onLeave = () => setHidden(true);

    const lerp = () => {
      raf = requestAnimationFrame(lerp);
      if (!ringRef.current) return;
      ringPos.current.x += (posRef.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (posRef.current.y - ringPos.current.y) * 0.12;
      ringRef.current.style.transform = `translate(${ringPos.current.x}px,${ringPos.current.y}px)`;
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(lerp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999]"
        style={{
          width: 6, height: 6,
          marginLeft: -3, marginTop: -3,
          background: '#fff',
          borderRadius: '50%',
          opacity: hidden ? 0 : 1,
          transition: 'opacity 0.3s',
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] flex items-center justify-center"
        style={{
          width: 38, height: 38,
          marginLeft: -19, marginTop: -19,
          border: '1.5px solid rgba(255,255,255,0.7)',
          borderRadius: '50%',
          opacity: hidden ? 0 : 1,
          transition: 'opacity 0.3s, transform 0.06s, width 0.35s cubic-bezier(.4,0,.2,1), height 0.35s cubic-bezier(.4,0,.2,1), background 0.25s',
          transform: `translate(0,0) scale(${ringScale})`,
          background: label ? 'rgba(255,255,255,0.08)' : 'transparent',
          backdropFilter: label ? 'blur(4px)' : 'none',
          willChange: 'transform',
        }}
      >
        {label && (
          <span
            ref={labelRef}
            style={{
              color: '#fff',
              fontSize: 8,
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              opacity: ringScale > 2 ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
          >{label}</span>
        )}
      </div>
      <style>{`* { cursor: none !important; }`}</style>
    </>
  );
};

export default CustomCursor;
