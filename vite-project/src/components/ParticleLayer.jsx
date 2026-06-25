import { useMemo } from 'react';
import './ParticleLayer.css';

function seededParticleValue(seed, offset) {
  const value = Math.sin(seed * 97.13 + offset * 37.71) * 10000;
  return value - Math.floor(value);
}

export default function ParticleLayer({ kind = 'dust', count = 24 }) {
  const particles = useMemo(() => {
    const kindSeed = Array.from(kind).reduce((sum, char) => sum + char.charCodeAt(0), 0);

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: seededParticleValue(kindSeed + i, 1) * 100,
      delay: seededParticleValue(kindSeed + i, 2) * 6,
      duration: 4 + seededParticleValue(kindSeed + i, 3) * 5,
      scale: 0.5 + seededParticleValue(kindSeed + i, 4) * 0.9,
    }));
  }, [count, kind]);

  return (
    <div className={`particle-layer particle-layer--${kind}`} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `scale(${p.scale})`,
          }}
        />
      ))}
    </div>
  );
}
