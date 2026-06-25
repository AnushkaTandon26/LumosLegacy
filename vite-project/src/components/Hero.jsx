import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

const SCENES = [
  { id: 'scene-1', start: 0, end: 0.18 },
  { id: 'scene-2', start: 0.18, end: 0.36 },
  { id: 'scene-3', start: 0.36, end: 0.56 },
  { id: 'scene-4', start: 0.56, end: 0.78 },
  { id: 'scene-5', start: 0.78, end: 1 },
];

export default function Hero() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const sceneRefs = useRef({});
  const activeIdRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    let st;
    const timelines = {};

    const setupScrub = () => {
      const existing = ScrollTrigger.getById('hero-scrub');
      existing && existing.kill();
      gsap.killTweensOf('.hero-scene, .hero-scene *');
      activeIdRef.current = null;
      const duration = video.duration || 0;

      SCENES.forEach((scene) => {
        const el = sceneRefs.current[scene.id];
        if (!el) return;
        const heading = el.querySelector('h1, h2');
        const para = el.querySelector('p');
        const cta = el.querySelector('.hero-cta');

        gsap.set(el, { autoAlpha: 0 });

        const tl = gsap.timeline({ paused: true });
        tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 });
        tl.fromTo(
          heading,
          { opacity: 0, y: 50, filter: 'blur(16px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out' }
        );
        if (para) {
          tl.fromTo(
            para,
            { opacity: 0, y: 30, filter: 'blur(10px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' },
            '-=0.6'
          );
        }
        if (cta) {
          tl.fromTo(
            cta,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
            '-=0.4'
          );
        }

        timelines[scene.id] = tl;
      });

      const applyProgress = (progress) => {
        if (duration) {
          video.currentTime = progress * duration;
        }

        const current = SCENES.find(
          (scene) => progress >= scene.start && progress < scene.end
        ) || SCENES[SCENES.length - 1];

        if (current.id !== activeIdRef.current) {
          if (activeIdRef.current && timelines[activeIdRef.current]) {
            timelines[activeIdRef.current].reverse();
          }
          timelines[current.id].play();
          activeIdRef.current = current.id;
        }
      };

      st = ScrollTrigger.create({
        id: 'hero-scrub',
        trigger: container,
        start: 'top top',
        end: '+=500%',
        pin: true,
        anticipatePin: 1,
        scrub: 0.5,
        onUpdate: (self) => applyProgress(self.progress),
      });

      applyProgress(st.progress);
    };

    if (video.readyState >= 1) {
      setupScrub();
    } else {
      video.addEventListener('loadedmetadata', setupScrub, { once: true });
    }

    return () => {
      st && st.kill();
      Object.values(timelines).forEach((tl) => tl.kill());
    };
  }, []);

  return (
    <section className="hero" id="hero" ref={containerRef}>
      <video
        ref={videoRef}
        className="hero-video"
        src="/video/one.mp4"
        muted
        playsInline
        preload="auto"
      />

      <div className="hero-vignette" />

      <div className="hero-overlay">
        <div className="hero-scene" ref={(el) => (sceneRefs.current['scene-1'] = el)}>
          <h1>Hogwarts Awaits</h1>
        </div>

        <div className="hero-scene" ref={(el) => (sceneRefs.current['scene-2'] = el)}>
          <h2>A Castle Wrapped in Mist</h2>
          <p>Beyond the dark lake, ancient stones hold a thousand years of magic.</p>
        </div>

        <div className="hero-scene" ref={(el) => (sceneRefs.current['scene-3'] = el)}>
          <h2>Through the Stained Glass</h2>
          <p>Candlelight flickers along corridors where portraits whisper of old tales.</p>
        </div>

        <div className="hero-scene" ref={(el) => (sceneRefs.current['scene-4'] = el)}>
          <h2>The Great Hall</h2>
          <p>A thousand candles drift beneath a ceiling alive with stars.</p>
        </div>

        <div className="hero-scene" ref={(el) => (sceneRefs.current['scene-5'] = el)}>
          <h2>Your Story Begins Here</h2>
          <p>Step before the ancient throne and look up into an infinite, magical sky.</p>
          <button className="hero-cta">Enter the Wizarding World</button>
        </div>
      </div>
    </section>
  );
}
