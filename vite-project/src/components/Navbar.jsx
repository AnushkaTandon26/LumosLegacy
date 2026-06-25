import { useEffect, useState } from 'react';
import './Navbar.css';

const LINKS = [
  { label: 'Hogwarts', href: '#hero' },
  { label: 'Sorting', href: '#sorting' },
  { label: 'Houses', href: '#houses' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar-inner">
        <a className="navbar-brand" href="#hero">
          <svg className="navbar-crest" viewBox="0 0 48 48" aria-hidden="true">
            <path
              d="M24 4 L40 12 V24 C40 34 33 41 24 44 C15 41 8 34 8 24 V12 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M24 12 L24 36 M16 18 L32 30 M32 18 L16 30" stroke="currentColor" strokeWidth="1" />
          </svg>
          <span className="navbar-brand-text">Hogwarts</span>
        </a>

        <nav className="navbar-links">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="navbar-link">
              {link.label}
            </a>
          ))}
        </nav>

        <button
          className={`navbar-toggle ${open ? 'is-open' : ''}`}
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className={`navbar-mobile ${open ? 'is-open' : ''}`}>
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} className="navbar-link" onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
