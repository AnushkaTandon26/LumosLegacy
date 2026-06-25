import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HOUSES, HOUSE_IDS } from '../theme/houses';
import { useHouseTheme } from '../theme/useHouseTheme';
import ParticleLayer from './ParticleLayer';
import './Section1.css';

gsap.registerPlugin(ScrollTrigger);

const DIALOGUE_LINES = ['Hmm...', 'Difficult.', 'Very difficult.'];

export default function Section1() {
  const { house, setHouse } = useHouseTheme();
  const sectionRef = useRef(null);
  const sceneRef = useRef(null);
  const hatRef = useRef(null);
  const candlesRef = useRef(null);
  const breatheTweenRef = useRef(null);
  const sortTimelineRef = useRef(null);

  const [phase, setPhase] = useState(house ? 'sorted' : 'idle');
  const [lineIndex, setLineIndex] = useState(-1);
  const [revealedHouse, setRevealedHouse] = useState(house);

  useEffect(() => {
    const section = sectionRef.current;
    const scene = sceneRef.current;
    const hat = hatRef.current;
    const candles = candlesRef.current.querySelectorAll('.candle');

    gsap.set(scene, { scale: 1 });
    gsap.set(candles, { opacity: 0, y: 16 });

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.timeline()
          .to(candles, { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: 'power2.out' })
          .to(scene, { scale: 1.04, duration: 1.5, ease: 'power1.inOut' }, '-=0.6');

        breatheTweenRef.current = gsap.to(hat, {
          scaleY: 1.015,
          repeat: -1,
          yoyo: true,
          duration: 2.4,
          ease: 'sine.inOut',
        });
      },
    });

    return () => {
      trigger.kill();
      breatheTweenRef.current && breatheTweenRef.current.kill();
      sortTimelineRef.current && sortTimelineRef.current.kill();
    };
  }, []);

  const handleHatEnter = () => {
    if (phase !== 'idle') return;
    const hat = hatRef.current;
    const glow = getComputedStyle(hat).getPropertyValue('--glow').trim();
    gsap.to(hat, { rotation: -6, duration: 0.4, ease: 'power2.out' });
    gsap.to(hat, { filter: `drop-shadow(0 0 24px ${glow})`, duration: 0.4 });
  };

  const handleHatLeave = () => {
    if (phase !== 'idle') return;
    const hat = hatRef.current;
    gsap.to(hat, { rotation: 0, duration: 0.4, ease: 'power2.out' });
    gsap.to(hat, { filter: 'drop-shadow(0 0 0px transparent)', duration: 0.4 });
  };

  const handleHatClick = () => {
    if (phase !== 'idle') return;
    setPhase('sorting');
    breatheTweenRef.current && breatheTweenRef.current.kill();

    const tl = gsap.timeline();
    sortTimelineRef.current = tl;
    DIALOGUE_LINES.forEach((_, i) => {
      tl.call(() => setLineIndex(i))
        .to({}, { duration: 0.05 })
        .to({}, { duration: 1.1 })
        .call(() => setLineIndex(-1))
        .to({}, { duration: 0.6 });
    });

    tl.call(() => {
      const id = HOUSE_IDS[Math.floor(Math.random() * HOUSE_IDS.length)];
      setHouse(id);
      setRevealedHouse(id);
      setPhase('revealing');
    });
  };

  useEffect(() => {
    if (phase !== 'revealing') return;
    const timeout = setTimeout(() => setPhase('sorted'), 2200);
    return () => clearTimeout(timeout);
  }, [phase]);

  const houseData = revealedHouse ? HOUSES[revealedHouse] : null;
  const particleKind = houseData ? houseData.particle : 'dust';
  const interactive = phase === 'idle';

  return (
    <section className="sorting" id="sorting" ref={sectionRef}>
      <div className="sorting-scene" ref={sceneRef}>
        <div className="sorting-fog" />
        <ParticleLayer kind={particleKind} count={26} />

        <div className="sorting-candles" ref={candlesRef}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div className="candle" key={i} style={{ left: `${8 + i * 13}%` }}>
              <div className="candle-flame" />
              <div className="candle-body" />
            </div>
          ))}
        </div>

        <div className="sorting-stage">
          <div className="stool" />
          <div
            className={`hat ${interactive ? 'hat--interactive' : ''}`}
            ref={hatRef}
            onMouseEnter={handleHatEnter}
            onMouseLeave={handleHatLeave}
            onClick={handleHatClick}
            onKeyDown={(e) => {
              if (interactive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleHatClick();
              }
            }}
            tabIndex={interactive ? 0 : -1}
            role={interactive ? 'button' : undefined}
            aria-label={interactive ? 'Click the Sorting Hat' : undefined}
          >
            <svg viewBox="0 0 200 200" className="hat-svg">
              <ellipse cx="100" cy="150" rx="80" ry="16" fill="#3a2c1d" />
              <path
                d="M60 150 C 65 120, 70 90, 85 60 C 92 45, 100 30, 108 18 C 112 30, 118 50, 122 70 C 130 100, 138 130, 140 150 Z"
                fill="#4a3a26"
                stroke="#2a1f12"
                strokeWidth="2"
              />
              <path d="M70 128 C 90 120, 120 124, 134 134" fill="none" stroke="#2a1f12" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {phase === 'sorting' && (
          <div className="sorting-overlay">
            {lineIndex >= 0 && (
              <p className="sorting-line">{DIALOGUE_LINES[lineIndex]}</p>
            )}
          </div>
        )}

        {(phase === 'revealing' || phase === 'sorted') && houseData && (
          <div className={`sorting-overlay sorting-overlay--reveal ${phase === 'sorted' ? 'sorting-overlay--settled' : ''}`}>
            <h2
              className="sorting-house-name"
              style={{ color: houseData.accent, textShadow: `0 0 40px ${houseData.glow}` }}
            >
              {houseData.name}
            </h2>
          </div>
        )}
      </div>
    </section>
  );
}
