import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

const NUM_BIRDS = 55;
const BASE_SPEED = 2.2;
const PERCEPTION = 110;
const SEPARATION_DIST = 36;
const EDGE_MARGIN = 90;
const MOUSE_RADIUS = 130;
const MOUSE_FORCE = 3.5;
const BIRD_SIZE = 13;

function randomBetween(a, b) { return a + Math.random() * (b - a); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

class Boid {
  constructor(w, h) {
    this.x = randomBetween(0, w);
    this.y = randomBetween(0, h);
    const angle = randomBetween(0, Math.PI * 2);
    this.vx = Math.cos(angle) * BASE_SPEED;
    this.vy = Math.sin(angle) * BASE_SPEED;
    this.speedMult = 1;
  }

  edges(w, h) {
    const turn = 0.22;
    if (this.x < EDGE_MARGIN)      this.vx += turn;
    if (this.x > w - EDGE_MARGIN)  this.vx -= turn;
    if (this.y < EDGE_MARGIN)      this.vy += turn;
    if (this.y > h - EDGE_MARGIN)  this.vy -= turn;
  }

  mouse(mx, my) {
    if (mx === null) return;
    const dx = this.x - mx;
    const dy = this.y - my;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < MOUSE_RADIUS && d > 0) {
      const force = (1 - d / MOUSE_RADIUS) * MOUSE_FORCE;
      this.vx += (dx / d) * force;
      this.vy += (dy / d) * force;
    }
  }

  flock(boids) {
    let sepX = 0, sepY = 0, sepCount = 0;
    let alignX = 0, alignY = 0;
    let cohX = 0, cohY = 0, count = 0;

    for (const o of boids) {
      if (o === this) continue;
      const dx = o.x - this.x;
      const dy = o.y - this.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > PERCEPTION) continue;
      count++;
      alignX += o.vx; alignY += o.vy;
      cohX += o.x;   cohY += o.y;
      if (d < SEPARATION_DIST) {
        sepX -= dx / d; sepY -= dy / d; sepCount++;
      }
    }

    const mf = 0.045;
    if (count > 0) {
      this.vx += clamp((alignX / count - this.vx), -mf, mf) * 1.1;
      this.vy += clamp((alignY / count - this.vy), -mf, mf) * 1.1;
      this.vx += clamp((cohX / count - this.x) * 0.001, -mf, mf);
      this.vy += clamp((cohY / count - this.y) * 0.001, -mf, mf);
    }
    if (sepCount > 0) {
      this.vx += clamp((sepX / sepCount) * 0.055, -mf * 1.6, mf * 1.6);
      this.vy += clamp((sepY / sepCount) * 0.055, -mf * 1.6, mf * 1.6);
    }

    const topSpeed = BASE_SPEED * this.speedMult;
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > topSpeed) {
      this.vx = (this.vx / speed) * topSpeed;
      this.vy = (this.vy / speed) * topSpeed;
    }
    if (speed < topSpeed * 0.4) {
      this.vx = (this.vx / speed) * topSpeed * 0.4;
      this.vy = (this.vy / speed) * topSpeed * 0.4;
    }
  }

  update(w, h, boids, mx, my) {
    this.mouse(mx, my);
    this.flock(boids);
    this.edges(w, h);
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    const angle = Math.atan2(this.vy, this.vx);
    const s = BIRD_SIZE;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);

    // Wing flap based on position (creates natural wave)
    const flap = Math.sin(this.x * 0.05 + this.y * 0.03) * 0.35;
    const wingY = -s * 0.55 - flap * s * 0.3;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-s * 0.55, wingY, -s, 0);
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo( s * 0.55, wingY,  s, 0);

    ctx.strokeStyle = 'rgba(246, 130, 31, 0.6)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }
}

export default function Birds() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    let boids = Array.from({ length: NUM_BIRDS }, () => new Boid(w, h));
    let animId;
    let scrollVel = 0;

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    let lastScroll = window.scrollY;
    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScroll);
      scrollVel = Math.min(delta * 0.08, 2.5);
      lastScroll = window.scrollY;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('scroll', onScroll);

    const render = () => {
      // Decay scroll boost
      scrollVel *= 0.92;
      const boost = 1 + scrollVel;
      boids.forEach(b => { b.speedMult = boost; });

      ctx.clearRect(0, 0, w, h);
      const { x: mx, y: my } = mouseRef.current;
      for (const b of boids) {
        b.update(w, h, boids, mx, my);
        b.draw(ctx);
      }
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className="birds-canvas"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay: 0.5 }}
    />
  );
}
