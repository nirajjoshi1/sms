import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BlurText — word-by-word staggered blur-in on scroll enter.
 * Props:
 *   text       — string of words
 *   className  — className for the outer container
 *   wordClass  — extra className per word span
 *   delay      — base delay before any word starts animating (seconds)
 *   stagger    — per-word stagger in ms (default 90)
 *   once       — replay every time it enters (default: true = play once)
 */
const BlurText = ({
  text = '',
  className = '',
  wordClass = '',
  delay = 0,
  stagger = 90,
  once = true,
}) => {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const words = text.split(' ');

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'inherit', rowGap: '0.08em' }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{
            duration: 0.72,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: delay + (i * stagger) / 1000,
          }}
          style={{ display: 'inline-block', marginRight: '0.3em' }}
          className={wordClass}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

export default BlurText;
