import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { HOUSES, HOUSE_IDS } from '../theme/houses';
import ParticleLayer from './ParticleLayer';
import CursorTrail from './CursorTrail';
import './Section2.css';

function Silhouette({ kind }) {
  if (kind === 'snake') {
    return (
      <svg viewBox="0 0 200 120" className="card-silhouette-svg" preserveAspectRatio="xMidYMid meet">
        <path
          d="M10 100 C 40 60, 60 110, 90 70 C 120 30, 150 90, 190 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === 'books') {
    return (
      <svg viewBox="0 0 200 120" className="card-silhouette-svg" preserveAspectRatio="xMidYMid meet">
        <rect x="30" y="70" width="90" height="14" rx="2" fill="currentColor" transform="rotate(-4 75 77)" />
        <rect x="50" y="55" width="100" height="14" rx="2" fill="currentColor" transform="rotate(3 100 62)" />
        <rect x="40" y="40" width="80" height="14" rx="2" fill="currentColor" transform="rotate(-2 80 47)" />
      </svg>
    );
  }
  if (kind === 'lantern') {
    return (
      <svg viewBox="0 0 200 120" className="card-silhouette-svg" preserveAspectRatio="xMidYMid meet">
        <line x1="100" y1="10" x2="100" y2="30" stroke="currentColor" strokeWidth="4" />
        <polygon
          points="80,30 120,30 130,60 120,90 80,90 70,60"
          fill="currentColor"
        />
        <rect x="92" y="90" width="16" height="10" fill="currentColor" />
      </svg>
    );
  }
  return null;
}

function Constellation() {
  const points = [
    [30, 30], [70, 50], [110, 25], [150, 55], [180, 35], [120, 80],
  ];
  const lines = [
    [0, 1], [1, 2], [2, 3], [3, 4], [1, 5],
  ];
  return (
    <svg viewBox="0 0 200 120" className="card-constellation">
      {lines.map(([a, b], i) => (
        <line
          key={i}
          x1={points[a][0]}
          y1={points[a][1]}
          x2={points[b][0]}
          y2={points[b][1]}
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.4"
        />
      ))}
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="currentColor" className="constellation-star" />
      ))}
    </svg>
  );
}

export default function Section2({ openedHouse, onCloseHouse }) {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredHouse, setHoveredHouse] = useState(null);
  const [localSelectedHouse, setLocalSelectedHouse] = useState(null);

  useEffect(() => {
    const track = trackRef.current;
    let raf = null;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const trackRect = track.getBoundingClientRect();
        const trackCenter = trackRect.left + trackRect.width / 2;
        let closestIndex = 0;
        let closestDistance = Infinity;
        track.querySelectorAll('.house-card').forEach((card, i) => {
          const cardRect = card.getBoundingClientRect();
          const cardCenter = cardRect.left + cardRect.width / 2;
          const distance = Math.abs(cardCenter - trackCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
          }
        });
        setActiveIndex(closestIndex);
      });
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      track.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const silhouettes = trackRef.current.querySelectorAll('.card-silhouette');
    const tweens = Array.from(silhouettes).map((el) =>
      gsap.to(el, {
        y: -6,
        rotation: 1.5,
        repeat: -1,
        yoyo: true,
        duration: 3 + Math.random(),
        ease: 'sine.inOut',
      })
    );
    return () => tweens.forEach((t) => t.kill());
  }, []);

  const hoveredData = hoveredHouse ? HOUSES[hoveredHouse] : null;
  const selectedHouse = openedHouse || localSelectedHouse;
  const selectedData = selectedHouse ? HOUSES[selectedHouse] : null;

  if (selectedData) {
    return (
      <section
        className="houses houses--welcome"
        id="houses"
        style={{ '--card-accent': selectedData.accent, '--card-accent2': selectedData.accent2, '--card-glow': selectedData.glow }}
      >
        <div className="house-welcome-bg" />
        <ParticleLayer kind={selectedData.particle} count={34} />

        <button
          type="button"
          className="house-welcome-back"
          onClick={() => {
            setLocalSelectedHouse(null);
            onCloseHouse?.();
          }}
        >
          Back to houses
        </button>

        <div className="house-welcome-panel">
          <div className="house-welcome-crest">
            <img src={selectedData.logo} alt={`${selectedData.name} crest`} />
          </div>

          <div className="house-welcome-copy">
            <p className="house-welcome-kicker">Greetings, young wizard!</p>
            <h2>Welcome to {selectedData.name}!</h2>
            <p className="house-welcome-quote">"{selectedData.welcomeQuote}"</p>

            <div className="house-welcome-lines">
              {selectedData.welcomeLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <div className="house-welcome-blessing">
              {selectedData.blessingLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <p className="house-welcome-home">Welcome home, Young Wizard.</p>
          </div>
        </div>

        <CursorTrail activeKind={selectedData.cursor} color={selectedData.accent} />
      </section>
    );
  }

  return (
    <section className="houses" id="houses">
      <div className="houses-heading">
        <h2>Choose Your House</h2>
        <p>Every house tells a different story.</p>
      </div>

      <div className="houses-track" ref={trackRef}>
        {HOUSE_IDS.map((id, i) => {
          const houseData = HOUSES[id];

          return (
            <div
              key={id}
              className={`house-card house-card--${id} ${activeIndex === i ? 'is-active' : ''}`}
              onClick={() => setLocalSelectedHouse(id)}
              onMouseEnter={() => setHoveredHouse(id)}
              onMouseLeave={() => setHoveredHouse((current) => (current === id ? null : current))}
              style={{ '--card-accent': houseData.accent, '--card-accent2': houseData.accent2, '--card-glow': houseData.glow }}
            >
              <div className="house-card-bg" />
              <ParticleLayer kind={houseData.particle} count={18} />

              {houseData.silhouette === 'none' ? null : (
                <div className="card-silhouette">
                  <Silhouette kind={houseData.silhouette} />
                </div>
              )}

              {id === 'ravenclaw' && <Constellation />}

              <div className="house-card-content">
                <img className="house-card-logo" src={houseData.logo} alt={`${houseData.name} crest`} />
                <h1>{houseData.name}</h1>
                <p>{houseData.tagline}</p>
                <button
                  type="button"
                  className="house-card-cta"
                  onClick={(event) => {
                    event.stopPropagation();
                    setLocalSelectedHouse(id);
                  }}
                >
                  Discover {houseData.name}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <CursorTrail
        activeKind={hoveredData ? hoveredData.cursor : null}
        color={hoveredData ? hoveredData.accent : null}
      />
    </section>
  );
}
