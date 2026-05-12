// ========== Canvas Animated Background (Optimized) ==========
const canvas = document.getElementById('canvas-bg');
let ctx, width, height;
let particles = [];
let animationId = null;
let isLowEndDevice = false;

if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  isLowEndDevice = true;
  var PARTICLE_COUNT = 45; 
  var CONNECTION_DIST = 120;
} else {
  var PARTICLE_COUNT = 90;
  var CONNECTION_DIST = 160;
}

function initParticles() {
  if (!ctx) return;
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.2,
      radius: isLowEndDevice ? (Math.random() * 1.5 + 1) : (Math.random() * 2 + 1.2),
      alpha: Math.random() * 0.5 + 0.2
    });
  }
}

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  if (ctx) initParticles();
}

let lastFrameTime = 0;
const FRAME_INTERVAL = isLowEndDevice ? 33 : 16;

function drawConnections() {
  if (isLowEndDevice && particles.length > 60) return;
  
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < CONNECTION_DIST) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0, 255, 0, ${(1 - dist / CONNECTION_DIST) * (isLowEndDevice ? 0.15 : 0.25)})`;
        ctx.lineWidth = isLowEndDevice ? 0.5 : 0.7;
        ctx.stroke();
      }
    }
  }
}

function drawParticles() {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 255, 0, ${p.alpha + (isLowEndDevice ? 0.1 : 0.2)})`;
    ctx.fill();
  }
}

function updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;
  }
}

function animateBackground(timestamp) {
  if (!ctx) return;
  
  // Throttle frames for mobile devices
  if (timestamp && lastFrameTime && (timestamp - lastFrameTime) < FRAME_INTERVAL) {
    animationId = requestAnimationFrame(animateBackground);
    return;
  }
  lastFrameTime = timestamp;
  
  ctx.clearRect(0, 0, width, height);
  
  drawConnections();
  drawParticles();
  updateParticles();
  
  animationId = requestAnimationFrame(animateBackground);
}

// ========== Mouse Interaction with Throttle for mobile ==========
let mouseX = width / 2, mouseY = height / 2;
let lastMouseMove = 0;
const MOUSE_THROTTLE = isLowEndDevice ? 50 : 16;

window.addEventListener('mousemove', (e) => {
  const now = Date.now();
  if (now - lastMouseMove < MOUSE_THROTTLE) return;
  lastMouseMove = now;
  
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  if (particles.length && !isLowEndDevice) { 
    particles.forEach(p => {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.hypot(dx, dy);
      if (dist < 110) {
        const angle = Math.atan2(dy, dx);
        const force = (110 - dist) / 110 * 0.25;
        p.vx += Math.cos(angle) * force;
        p.vy += Math.sin(angle) * force;
        const maxSpeed = 1.0;
        if (Math.abs(p.vx) > maxSpeed) p.vx = p.vx > 0 ? maxSpeed : -maxSpeed;
        if (Math.abs(p.vy) > maxSpeed) p.vy = p.vy > 0 ? maxSpeed : -maxSpeed;
      }
    });
  }
});

// ========== Mobile Hamburger Menu ==========
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
  const toggleMenu = (e) => {
    e.stopPropagation();
    const isActive = navLinks.classList.toggle('active');
    hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isActive);
    
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  hamburger.addEventListener('click', toggleMenu);
  
  // Close menu when a link is clicked
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') && 
        !navLinks.contains(e.target) && 
        !hamburger.contains(e.target)) {
      navLinks.classList.remove('active');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

// ========== Smooth Scroll ==========
document.querySelectorAll('.nav-links a, .hero-content a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        history.pushState(null, null, href);
      }
    }
  });
});

// ========== Intersection Observer ==========
const fadeElements = document.querySelectorAll('.fade-up');
const observerOptions = {
  threshold: 0.1,
  rootMargin: '50px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

fadeElements.forEach(el => observer.observe(el));

// ========== Image Lazy Loading ==========
document.querySelectorAll('img:not([loading])').forEach(img => {
  if (!img.hasAttribute('loading')) {
    img.setAttribute('loading', 'lazy');
  }
});

// ========== Cleanup on Page Hide (for bfcache) ==========
window.addEventListener('pagehide', () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (ctx) {
    ctx.clearRect(0, 0, width, height);
  }
});
// restart animation on pageshow if coming from bfcache
window.addEventListener('pageshow', (event) => {
  if (event.persisted && !animationId) {
    if (ctx) {
      resizeCanvas(); 
      animateBackground();
    }
  }
});
// start animation after DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (canvas && canvas.getContext) {
      ctx = canvas.getContext('2d');
      resizeCanvas();
      animateBackground();
    }
  });
} else {
  if (canvas && canvas.getContext) {
    ctx = canvas.getContext('2d');
    resizeCanvas();
    animateBackground();
  }
}

window.addEventListener('resize', () => {
  resizeCanvas();
});

// ========== Hamburger Animation Styles ==========
const style = document.createElement('style');
style.textContent = `
  .hamburger.open span:nth-child(1) { 
    transform: rotate(45deg) translate(5px, 5px); 
  }
  .hamburger.open span:nth-child(2) { 
    opacity: 0; 
  }
  .hamburger.open span:nth-child(3) { 
    transform: rotate(-45deg) translate(5px, -5px); 
  }
  .hamburger span { 
    transition: transform 0.3s ease, opacity 0.3s ease; 
  }
  @media (prefers-reduced-motion: reduce) {
    .hamburger span {
      transition: none;
    }
    .fade-up {
      transition: none;
    }
  }
`;
document.head.appendChild(style);