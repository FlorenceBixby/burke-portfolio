import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

const NUM_BIRDS = 60;
const SPEED = 1.6;
const PERCEPTION = 90;
const SEPARATION_DIST = 28;
const EDGE_MARGIN = 80;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

class Boid {
  constructor(w, h) {
    this.x = randomBetween(0, w);
    this.y = randomBetween(0, h);
    const angle = randomBetween(0, Math.PI * 2);
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
  }

  edges(w, h) {
    const turn = 0.18;
    if (this.x < EDGE_MARGIN)      this.vx += turn;
    if (this.x > w - EDGE_MARGIN)  this.vx -= turn;
    if (this.y < EDGE_MARGIN)      this.vy += turn;
    if (this.y > h - EDGE_MARGIN)  this.vy -= turn;
  }

  flock(boids) {
    let sepX = 0, sepY = 0, sepCount = 0;
    let alignX = 0, alignY = 0;
    let cohX = 0, cohY = 0, count = 0;

    for (const other of boids) {
      if (other === this) continue;
      const dx = other.x - this.x;
      const dy = other.y - this.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > PERCEPTION) continue;

      count++;
      alignX += other.vx;
      alignY += other.vy;
      cohX += other.x;
      cohY += other.y;

      if (d < SEPARATION_DIST) {
        sepX -= dx / d;
        sepY -= dy / d;
        sepCount++;
      }
    }

    const maxForce = 0.04;

    if (count > 0) {
      alignX = alignX / count - this.vx;
      alignY = alignY / count - this.vy;
      this.vx += clamp(alignX, -maxForce, maxForce) * 1.0;
      this.vy += clamp(alignY, -maxForce, maxForce) * 1.0;

      cohX = (cohX / count - this.x) * 0.001;
      cohY = (cohY / count - this.y) * 0.001;
      this.vx += clamp(cohX, -maxForce, maxForce);
      this.vy += clamp(cohY, -maxForce, maxForce);
    }

    if (sepCount > 0) {
      sepX /= sepCount;
      sepY /= sepCount;
      this.vx += clamp(sepX * 0.05, -maxForce * 1.5, maxForce * 1.5);
      this.vy += clamp(sepY * 0.05, -maxForce * 1.5, maxForce * 1.5);
    }

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > SPEED) {
      this.vx = (this.vx / speed) * SPEED;
      this.vy = (this.vy / speed) * SPEED;
    }
    if (speed < SPEED * 0.4) {
      this.vx = (this.vx / speed) * SPEED * 0.4;
      this.vy = (this.vy / speed) * SPEED * 0.4;
    }
  }

  update(w, h, boids) {
    this.flock(boids);
    this.edges(w, h);
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    const angle = Math.atan2(this.vy, this.vx);
    const size = 7;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-size * 0.6, -size * 0.5, -size, 0);
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.6, -size * 0.5, size, 0);
    ctx.strokeStyle = 'rgba(246, 130, 31, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }
}

export default function Birds() {
  const canvasRef = useRef(null);

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

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      for (const b of boids) {
        b.update(w, h, boids);
        b.draw(ctx);
      }
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
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
