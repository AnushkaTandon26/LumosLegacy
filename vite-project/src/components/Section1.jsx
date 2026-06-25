import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HOUSES, HOUSE_IDS } from '../theme/houses';
import { useHouseTheme } from '../theme/useHouseTheme';
import ParticleLayer from './ParticleLayer';
import './Section1.css';

gsap.registerPlugin(ScrollTrigger);

const SCAN_MESSAGES = [
  'Reading your magical aura...',
  'Searching your deepest qualities...',
  'Examining your courage...',
  'Measuring your wisdom...',
  'Sensing your loyalty...',
  'Detecting your ambition...',
  'The Sorting Hat is making its decision...',
];

const HAT_LINES = [
  'Hmm...',
  'Interesting...',
  'I sense great potential.',
  'You possess a brave heart.',
  'But there is wisdom too...',
  'Not an easy choice...',
  'Very difficult indeed...',
  'I know exactly where you belong...',
];

const PROPHECY_LINES = [
  'The castle has been waiting for you.',
  "Magic does not choose everyone... but today, it has chosen you.",
  'Every great witch and wizard once stood exactly where you stand now.',
  'The Sorting Hat sees what others cannot.',
  'Destiny is written by the choices hidden inside your heart.',
];

const CONFETTI = Array.from({ length: 22 }, (_, i) => i);
const RUNE_MARKS = ['Lumos', 'Alohomora', 'Expecto', 'Revelio', 'Fortuna', 'Nox'];
const SPELL_RIBBONS = Array.from({ length: 4 }, (_, i) => i);
const ARCANE_ORBS = Array.from({ length: 8 }, (_, i) => i);
const FLOOR_SIGILS = ['Courage', 'Wisdom', 'Loyalty', 'Ambition', 'Destiny', 'Magic'];
const REVEAL_BEAMS = Array.from({ length: 9 }, (_, i) => i);

function playCeremonySound(kind = 'start') {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const context = new AudioContext();
  const frequencies = kind === 'reveal' ? [392, 523.25, 659.25, 783.99] : [261.63, 329.63, 392];

  frequencies.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = context.currentTime + index * 0.11;

    oscillator.type = kind === 'reveal' ? 'triangle' : 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.08, startAt + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.34);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.38);
  });

  setTimeout(() => context.close(), 900);
}

export default function Section1({ onEnterHouse }) {
  const { setHouse } = useHouseTheme();
  const sectionRef = useRef(null);
  const sceneRef = useRef(null);
  const hatRef = useRef(null);
  const candlesRef = useRef(null);
  const breatheTweenRef = useRef(null);
  const sortTimelineRef = useRef(null);

  const [phase, setPhase] = useState('idle');
  const [scanIndex, setScanIndex] = useState(-1);
  const [hatLineIndex, setHatLineIndex] = useState(-1);
  const [revealedHouse, setRevealedHouse] = useState(null);

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
          .to(scene, { scale: 1.02, duration: 1.5, ease: 'power1.inOut' }, '-=0.6');

        breatheTweenRef.current = gsap.to(hat, {
          scaleY: 1.018,
          y: -4,
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
    gsap.to(hat, { filter: `drop-shadow(0 0 28px ${glow})`, duration: 0.4 });
  };

  const handleHatLeave = () => {
    if (phase !== 'idle') return;
    const hat = hatRef.current;
    gsap.to(hat, { rotation: 0, duration: 0.4, ease: 'power2.out' });
    gsap.to(hat, { filter: 'drop-shadow(0 0 0px transparent)', duration: 0.4 });
  };

  const startSorting = () => {
    if (phase !== 'idle' && phase !== 'welcomed') return;

    playCeremonySound('start');
    breatheTweenRef.current && breatheTweenRef.current.kill();
    sortTimelineRef.current && sortTimelineRef.current.kill();
    setRevealedHouse(null);
    setHatLineIndex(-1);
    setScanIndex(0);
    setPhase('scanning');

    const timeline = gsap.timeline();
    sortTimelineRef.current = timeline;

    SCAN_MESSAGES.forEach((_, index) => {
      timeline
        .call(() => setScanIndex(index))
        .to({}, { duration: 0.82 });
    });

    timeline.call(() => {
      setScanIndex(-1);
      setPhase('speaking');
    });

    HAT_LINES.forEach((_, index) => {
      timeline
        .call(() => setHatLineIndex(index))
        .to({}, { duration: 0.78 });
    });

    timeline
      .to({}, { duration: 0.9 })
      .call(() => {
        const id = HOUSE_IDS[Math.floor(Math.random() * HOUSE_IDS.length)];
        setHouse(id);
        setRevealedHouse(id);
        setHatLineIndex(-1);
        setPhase('revealing');
        playCeremonySound('reveal');
      })
      .to({}, { duration: 3.4 })
      .call(() => setPhase('welcomed'));
  };

  const houseData = revealedHouse ? HOUSES[revealedHouse] : null;
  const particleKind = houseData ? houseData.particle : phase === 'revealing' ? 'stars' : 'dust';
  const interactive = phase === 'idle' || phase === 'welcomed';
  const prophecyLine = PROPHECY_LINES[phase === 'idle' ? 0 : (revealedHouse ? HOUSE_IDS.indexOf(revealedHouse) + 1 : 2) % PROPHECY_LINES.length];

  return (
    <section
      className={`sorting sorting--${phase}`}
      id="sorting"
      ref={sectionRef}
      style={houseData ? { '--house-accent': houseData.accent, '--house-accent2': houseData.accent2, '--house-glow': houseData.glow } : undefined}
    >
      <div className="sorting-scene" ref={sceneRef}>
        <div className="enchanted-ceiling" />
        <div className="sorting-fog" />
        <div className="spell-ribbons" aria-hidden="true">
          {SPELL_RIBBONS.map((ribbon) => (
            <span key={ribbon} style={{ '--i': ribbon }} />
          ))}
        </div>
        <div className="floating-runes" aria-hidden="true">
          {RUNE_MARKS.map((mark, i) => (
            <span key={mark} style={{ '--i': i }}>
              {mark}
            </span>
          ))}
        </div>
        <div className="arcane-orbs" aria-hidden="true">
          {ARCANE_ORBS.map((orb) => (
            <span key={orb} style={{ '--i': orb }} />
          ))}
        </div>
        <ParticleLayer kind={particleKind} count={phase === 'idle' ? 26 : 42} />

        <div className="sorting-candles" ref={candlesRef}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div className="candle" key={i} style={{ left: `${8 + i * 13}%` }}>
              <div className="candle-flame" />
              <div className="candle-body" />
            </div>
          ))}
        </div>

        <div className="sorting-stage">
          <div className="sorting-copy">
            <p className="sorting-kicker">Welcome to the Sorting Ceremony</p>
            <h2>The Sorting Hat Awaits</h2>
            <p>Welcome, young witch or wizard.</p>
            <p>Before you step into the Great Hall, one important decision remains...</p>
            <p>The ancient Sorting Hat will look beyond appearances and into your heart.</p>
            <p>It will discover where your true strengths lie.</p>
            <p className="sorting-prophecy">{prophecyLine}</p>
            <p className="sorting-question">Are you ready to learn your destiny?</p>
          </div>

          <div
            className={`hat ${interactive ? 'hat--interactive' : ''}`}
            ref={hatRef}
            onMouseEnter={handleHatEnter}
            onMouseLeave={handleHatLeave}
            onClick={startSorting}
            onKeyDown={(e) => {
              if (interactive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                startSorting();
              }
            }}
            tabIndex={interactive ? 0 : -1}
            role={interactive ? 'button' : undefined}
            aria-label={interactive ? 'Place the Sorting Hat' : undefined}
          >
            <div className="hat-aura" />
            <div className="hat-rune-ring">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} style={{ '--i': i }} />
              ))}
            </div>
            <svg viewBox="0 0 200 200" className="hat-svg">
              <defs>
                <linearGradient id="hatLeather" x1="42" y1="18" x2="148" y2="168" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#9b5c2d" />
                  <stop offset="0.35" stopColor="#5f351e" />
                  <stop offset="0.72" stopColor="#3a2115" />
                  <stop offset="1" stopColor="#17100c" />
                </linearGradient>
                <linearGradient id="hatBrim" x1="22" y1="138" x2="184" y2="170" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#b8753c" />
                  <stop offset="0.5" stopColor="#5a321d" />
                  <stop offset="1" stopColor="#2b190f" />
                </linearGradient>
                <radialGradient id="hatHighlight" cx="40%" cy="24%" r="74%">
                  <stop offset="0" stopColor="#d28b4d" stopOpacity="0.72" />
                  <stop offset="0.42" stopColor="#8c4d28" stopOpacity="0.34" />
                  <stop offset="1" stopColor="#1c120c" stopOpacity="0" />
                </radialGradient>
              </defs>

              <path
                className="hat-brim"
                d="M8 154 C 35 133, 76 129, 116 137 C 150 144, 179 139, 195 151 C 170 165, 134 171, 91 168 C 53 166, 24 164, 8 154 Z"
                fill="url(#hatBrim)"
              />
              <path
                className="hat-brim-lip"
                d="M16 154 C 48 145, 87 145, 122 150 C 151 154, 174 151, 190 148"
                fill="none"
                stroke="#d19055"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.62"
              />
              <path
                className="hat-body"
                d="M55 149 C 58 130, 60 111, 66 93 C 71 77, 73 61, 84 45 C 94 30, 95 18, 96 7 C 107 18, 119 20, 133 11 C 131 24, 126 38, 118 47 C 125 66, 131 83, 134 101 C 138 123, 143 136, 150 150 C 126 159, 82 158, 55 149 Z"
                fill="url(#hatLeather)"
                stroke="#2a1f12"
                strokeWidth="2.4"
              />
              <path
                className="hat-highlight"
                d="M68 143 C 70 118, 75 88, 88 61 C 96 45, 101 31, 98 13 C 110 28, 112 50, 111 69 C 109 99, 120 124, 138 146 C 115 153, 88 153, 68 143 Z"
                fill="url(#hatHighlight)"
              />
              <path
                className="hat-fold"
                d="M78 53 C 93 47, 108 53, 118 64 C 102 61, 90 64, 75 76"
                fill="none"
                stroke="#1f140d"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                className="hat-fold hat-fold--warm"
                d="M70 82 C 88 72, 112 77, 130 93 C 109 88, 91 91, 66 106"
                fill="none"
                stroke="#b06b35"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.68"
              />
              <path
                className="hat-fold"
                d="M62 112 C 83 101, 113 105, 139 123 C 112 116, 88 119, 57 136"
                fill="none"
                stroke="#25160d"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                className="hat-brow"
                d="M70 106 C 83 94, 96 97, 105 109 C 116 95, 132 98, 142 111"
                fill="none"
                stroke="#17100b"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                className="hat-eye"
                d="M75 115 C 84 110, 92 111, 100 119 C 90 120, 82 120, 75 115 Z"
                fill="#0b0705"
              />
              <path
                className="hat-eye"
                d="M111 119 C 119 111, 129 111, 138 117 C 130 121, 120 122, 111 119 Z"
                fill="#0b0705"
              />
              <path
                className="hat-mouth"
                d="M62 136 C 82 127, 114 127, 143 138 C 127 150, 87 151, 62 136 Z"
                fill="#0a0503"
                stroke="#c88346"
                strokeWidth="2.5"
              />
              <path
                d="M71 139 C 92 145, 118 145, 136 140"
                fill="none"
                stroke="#6d3a20"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                className="hat-stitch"
                d="M86 63 L92 70 M98 59 L103 69 M111 61 L114 73"
                fill="none"
                stroke="#d2a06c"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="hat-magic-floor" aria-hidden="true">
            {FLOOR_SIGILS.map((sigil, i) => (
              <span key={sigil} style={{ '--i': i }}>
                {sigil}
              </span>
            ))}
          </div>

          <div className="stool" />

          <button type="button" className="sorting-start" onClick={startSorting} disabled={!interactive}>
            Place the Sorting Hat
          </button>
        </div>

        {(phase === 'scanning' || phase === 'speaking') && (
          <div className="sorting-overlay sorting-overlay--ritual" aria-live="polite">
            <div className="ritual-orbit" />
            <div className="ritual-sigils" aria-hidden="true">
              {RUNE_MARKS.map((mark, i) => (
                <span key={mark} style={{ '--i': i }}>
                  {mark}
                </span>
              ))}
            </div>
            <div className="ritual-panel">
              <p className="ritual-label">{phase === 'scanning' ? 'Magical reading' : 'The Sorting Hat speaks'}</p>
              <p className="sorting-line">
                {phase === 'scanning' ? SCAN_MESSAGES[scanIndex] : `"${HAT_LINES[hatLineIndex]}"`}
              </p>
              <div className="ritual-progress" aria-hidden="true">
                <span style={{ width: `${phase === 'scanning' ? ((scanIndex + 1) / SCAN_MESSAGES.length) * 100 : ((hatLineIndex + 1) / HAT_LINES.length) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {(phase === 'revealing' || phase === 'welcomed') && houseData && (
          <div className={`sorting-overlay sorting-overlay--reveal ${phase === 'welcomed' ? 'sorting-overlay--welcome' : ''}`}>
            <div className="lightning lightning--one" />
            <div className="lightning lightning--two" />
            <div className="golden-burst" />
            <div className="reveal-beams" aria-hidden="true">
              {REVEAL_BEAMS.map((beam) => (
                <span key={beam} style={{ '--i': beam }} />
              ))}
            </div>

            {CONFETTI.map((item) => (
              <span key={item} className="sorting-confetti" style={{ '--i': item }} />
            ))}

            <div className="sorting-reveal-card">
              <img className="sorting-reveal-crest" src={houseData.logo} alt={`${houseData.name} crest`} />
              <p className="sorting-reveal-kicker">The Sorting Hat has chosen...</p>
              <h2>{houseData.name}!</h2>
              <div className="sorting-divider" />

              {phase === 'welcomed' && (
                <div className="sorting-house-welcome">
                  <p className="sorting-congrats">Congratulations!</p>
                  <p>
                    From this day onward, you are a proud member of <strong>{houseData.name}</strong>.
                  </p>
                  <p>{houseData.tagline}</p>
                  <p>Welcome home, young wizard.</p>
                  <button type="button" className="sorting-enter" onClick={() => onEnterHouse?.(revealedHouse)}>
                    {houseData.entryLabel}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
