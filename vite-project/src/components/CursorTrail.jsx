import { useEffect, useRef, useState } from 'react';
import './CursorTrail.css';

const MAX_PARTICLES = 24;
const SPAWN_INTERVAL_MS = 60;

export default function CursorTrail({ activeKind, color }) {
  if (!activeKind) return null;

  return <ActiveCursorTrail key={activeKind} activeKind={activeKind} color={color} />;
}

function ActiveCursorTrail({ activeKind, color }) {
  const [particles, setParticles] = useState([]);
  const lastSpawnRef = useRef(0);
  const nextIdRef = useRef(0);

  useEffect(() => {
    const handleMove = (e) => {
      const now = performance.now();
      if (now - lastSpawnRef.current < SPAWN_INTERVAL_MS) return;
      lastSpawnRef.current = now;

      const id = nextIdRef.current++;
      setParticles((prev) => {
        const next = [...prev, { id, x: e.clientX, y: e.clientY }];
        return next.length > MAX_PARTICLES ? next.slice(next.length - MAX_PARTICLES) : next;
      });
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const removeParticle = (id) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="cursor-trail" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`cursor-particle cursor-particle--${activeKind}`}
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            background: color || undefined,
            boxShadow: color ? `0 0 8px ${color}` : undefined,
          }}
          onAnimationEnd={() => removeParticle(p.id)}
        />
      ))}
    </div>
  );
}
