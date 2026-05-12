// ========== Canvas Animated Background (Particle Network) ==========
const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
const PARTICLE_COUNT = 90;
const CONNECTION_DIST = 160;

function initParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.2,
      radius: Math.random() * 2 + 1.2,
      alpha: Math.random() * 0.5 + 0.2
    });
  }
}

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  initParticles();
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < CONNECTION_DIST) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0, 255, 0, ${(1 - dist / CONNECTION_DIST) * 0.25})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }
  }
}

function drawParticles() {
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 255, 0, ${p.alpha + 0.2})`;
    ctx.fill();
  });
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;
  });
}

function animateBackground() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(5, 5, 5, 0.08)';
  ctx.fillRect(0, 0, width, height);
  drawConnections();
  drawParticles();
  updateParticles();
  requestAnimationFrame(animateBackground);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animateBackground();

// ========== Mouse Interaction (Particles repel) ==========
let mouseX = width / 2, mouseY = height / 2;
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (particles.length) {
    particles.forEach(p => {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.hypot(dx, dy);
      if (dist < 110) {
        const angle = Math.atan2(dy, dx);
        const force = (110 - dist) / 110 * 0.25;
        p.vx += Math.cos(angle) * force;
        p.vy += Math.sin(angle) * force;
        let maxSpeed = 1.0;
        if (Math.abs(p.vx) > maxSpeed) p.vx = p.vx > 0 ? maxSpeed : -maxSpeed;
        if (Math.abs(p.vy) > maxSpeed) p.vy = p.vy > 0 ? maxSpeed : -maxSpeed;
      }
    });
  }
});

// ========== Mobile Hamburger Menu Toggle ==========
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Optional: animate hamburger icon
    hamburger.classList.toggle('open');
  });

  // Close menu when a link is clicked
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      if (hamburger.classList) hamburger.classList.remove('open');
    });
  });
}

// ========== Smooth Scroll for Anchor Links ==========
document.querySelectorAll('.nav-links a, .hero-content a, .footer-link').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// ========== Intersection Observer for Fade-Up Animations ==========
const fadeElements = document.querySelectorAll('.fade-up');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeElements.forEach(el => observer.observe(el));

// ========== Placeholder for Social Links (Demo) ==========
const socialIcons = document.querySelectorAll('.social-icons a');
socialIcons.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    alert('🔗 Full GitHub / LinkedIn profile available upon request. Contact via email.');
  });
});

// Optional: add open class style for hamburger animation
const style = document.createElement('style');
style.textContent = `
  .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
  .hamburger.open span:nth-child(2) { opacity: 0; }
  .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
  .hamburger span { transition: 0.3s; }
`;
document.head.appendChild(style);