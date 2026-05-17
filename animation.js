const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let W, H, mouse = { x: -999, y: -999 }, tick = 0;

function resize() {
  W = canvas.width = window.innerWidth * devicePixelRatio;
  H = canvas.height = window.innerHeight * devicePixelRatio;
}
resize();
window.addEventListener('resize', resize);

const COLORS = [
  [120, 80, 255],
  [0, 200, 255],
  [255, 80, 180],
  [80, 255, 200],
  [255, 200, 50],
  [255, 100, 80]
];

class Particle {
  constructor(burst) {
    this.reset(burst);
  }

  reset(burst) {
    if (burst) {
      this.x = burst.x;
      this.y = burst.y;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 6;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.life = 0.8 + Math.random() * 0.5;
      this.decay = 0.015 + Math.random() * 0.025;
      this.size = 1.5 + Math.random() * 3;
    } else {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.5;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.life = 0.3 + Math.random() * 0.7;
      this.decay = 0.002 + Math.random() * 0.004;
      this.size = 0.5 + Math.random() * 2;
    }

    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.r = c[0];
    this.g = c[1];
    this.b = c[2];
    this.trail = [];
    this.isBurst = !!burst;
  }

  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 8) this.trail.shift();

    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120 && dist > 0) {
      const force = ((120 - dist) / 120) * 0.4;
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;
    }

    this.vx *= 0.98;
    this.vy *= 0.98;

    if (!this.isBurst) {
      this.vy += 0.003;
    } else {
      this.vy += 0.08;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;

    if (this.life <= 0 || this.x < -10 || this.x > W + 10 || this.y > H + 10) {
      if (!this.isBurst) this.reset(null);
      else return false;
    }
    return true;
  }

  draw() {
    const alpha = Math.max(0, this.life);

    for (let i = 1; i < this.trail.length; i++) {
      const t = i / this.trail.length;
      ctx.beginPath();
      ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
      ctx.lineTo(this.trail[i].x, this.trail[i].y);
      ctx.strokeStyle = `rgba(${this.r},${this.g},${this.b},${alpha * t * 0.4})`;
      ctx.lineWidth = this.size * t;
      ctx.stroke();
    }

    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
    grad.addColorStop(0, `rgba(${this.r},${this.g},${this.b},${alpha})`);
    grad.addColorStop(1, `rgba(${this.r},${this.g},${this.b},0)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

let particles = Array.from({ length: 220 }, () => new Particle(null));
let bursts = [];

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  mouse.x = (e.clientX - rect.left) * scaleX;
  mouse.y = (e.clientY - rect.top) * scaleY;
});

canvas.addEventListener('mouseleave', () => {
  mouse.x = -999;
  mouse.y = -999;
});

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const cx = (e.clientX - rect.left) * scaleX;
  const cy = (e.clientY - rect.top) * scaleY;
  for (let i = 0; i < 60; i++) bursts.push(new Particle({ x: cx, y: cy }));
});

function drawWave() {
  tick++;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 4) {
    const y = H * 0.5
      + Math.sin(x * 0.006 + tick * 0.02) * H * 0.06
      + Math.sin(x * 0.012 - tick * 0.015) * H * 0.03
      + Math.sin(x * 0.003 + tick * 0.01) * H * 0.08;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(100, 60, 255, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  for (let x = 0; x <= W; x += 4) {
    const y = H * 0.5
      + Math.sin(x * 0.008 - tick * 0.018 + 1) * H * 0.05
      + Math.sin(x * 0.004 + tick * 0.012 + 2) * H * 0.07;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(0, 180, 255, 0.07)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawPulse() {
  const cx = W / 2;
  const cy = H / 2;
  for (let i = 0; i < 3; i++) {
    const r = ((tick * 1.2 + i * 80) % 220) * (W / 500);
    const alpha = (1 - r / (220 * W / 500)) * 0.06;
    if (alpha <= 0) continue;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(120, 80, 255, ${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function loop() {
  ctx.fillStyle = 'rgba(5, 5, 16, 0.18)';
  ctx.fillRect(0, 0, W, H);

  drawWave();
  drawPulse();

  for (const p of particles) {
    p.update();
    p.draw();
  }

  bursts = bursts.filter(p => {
    const alive = p.update();
    if (alive) p.draw();
    return alive;
  });

  requestAnimationFrame(loop);
}

loop();
