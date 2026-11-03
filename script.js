/**
 * Love Calculator
 * Plain HTML, CSS, and vanilla JavaScript implementation
 */

// ============================================================================
// CONFIGURATION CONSTANTS
// Easily change the special pair names here (stored in lowercase for matching)
// ============================================================================
const SPECIAL_NAME_1 = 'jake';
const SPECIAL_NAME_2 = 'jenah';

// ============================================================================
// DOM ELEMENTS
// ============================================================================
const name1Input = document.getElementById('name1');
const name2Input = document.getElementById('name2');
const calculateBtn = document.getElementById('calculate-btn');
const resultArea = document.getElementById('result-area');
const scoreDisplay = document.getElementById('score-display');
const scoreBadge = document.getElementById('score-badge');
const scoreBar = document.getElementById('score-bar');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const validationMessage = document.getElementById('validation-message');
const validationText = document.getElementById('validation-text');
const modalBackdrop = document.getElementById('modal-backdrop');
const monthsaryModal = document.getElementById('monthsary-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalActionBtn = document.getElementById('modal-action-btn');

// ============================================================================
// HEART FIREWORKS ENGINE
// Fullscreen canvas animation with requestAnimationFrame, physics, & cleanup
// ============================================================================
class HeartFireworksEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationFrameId = null;
    this.scheduledBursts = [];
    this.stopTimerId = null;
    this.isRunning = false;

    // Palette of romantic colors (reds, pinks, magentas, soft whites, and gold)
    this.colors = [
      '#ff0055', '#ff2e63', '#ff4d6d', '#ff758f',
      '#e91e63', '#ff007f', '#ff4081', '#f72585',
      '#c9184a', '#ff85a1', '#ffffff', '#ffd166'
    ];

    // Bind event handlers
    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.resize);
    this.resize();
  }

  /**
   * Resize canvas to full window dimensions with high-DPI support
   */
  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /**
   * Start a fresh heart fireworks show.
   * Cancels any running animation, resets state, and lasts about 4.5 seconds.
   */
  start() {
    this.stop(); // Clean reset of any active loop or timers
    this.isRunning = true;
    this.particles = [];

    const totalDuration = 4500; // ~4.5 seconds
    const burstCount = 7;

    // Launch two immediate bursts across upper screen
    this.spawnBurst(window.innerWidth * 0.35, window.innerHeight * 0.3);
    this.spawnBurst(window.innerWidth * 0.65, window.innerHeight * 0.32);

    // Schedule remaining staggered bursts across the animation duration
    for (let i = 1; i < burstCount; i++) {
      const delay = (i / burstCount) * (totalDuration - 1400) + (Math.random() * 250);
      const timer = setTimeout(() => {
        if (!this.isRunning) return;
        const x = window.innerWidth * (0.18 + Math.random() * 0.64);
        const y = window.innerHeight * (0.15 + Math.random() * 0.4);
        this.spawnBurst(x, y);
      }, delay);
      this.scheduledBursts.push(timer);
    }

    // Schedule automatic stop & canvas clear after the duration
    this.stopTimerId = setTimeout(() => {
      this.stop();
    }, totalDuration);

    // Begin render loop
    this.animate();
  }

  /**
   * Spawn a burst of heart particles at (x, y)
   */
  spawnBurst(x, y) {
    const particleCount = 28 + Math.floor(Math.random() * 16);

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 2.4 + Math.random() * 5.2;
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      const size = 12 + Math.random() * 14;

      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2, // slight upward boost
        size: size,
        color: color,
        alpha: 1,
        decay: 0.007 + Math.random() * 0.011,
        gravity: 0.06 + Math.random() * 0.025,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        drag: 0.985
      });
    }
  }

  /**
   * Draw a single heart vector path onto the canvas
   */
  drawHeart(x, y, size, angle, color, alpha) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = color;

    const s = size / 30;
    ctx.beginPath();
    // Offset slightly so it rotates around the visual center
    ctx.translate(0, -10 * s);
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-15 * s, -15 * s, -30 * s, 6 * s, 0, 30 * s);
    ctx.bezierCurveTo(30 * s, 6 * s, 15 * s, -15 * s, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * Main requestAnimationFrame loop
   */
  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Physics update
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;
      p.rotation += p.rotationSpeed;
      p.alpha -= p.decay;

      // Remove faded particles
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.drawHeart(p.x, p.y, p.size, p.rotation, p.color, p.alpha);
    }

    if (this.isRunning) {
      this.animationFrameId = requestAnimationFrame(this.animate);
    }
  }

  /**
   * Cleanly stop animation loop, cancel timers, and clear the canvas
   */
  stop() {
    this.isRunning = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.scheduledBursts.forEach(timer => clearTimeout(timer));
    this.scheduledBursts = [];

    if (this.stopTimerId) {
      clearTimeout(this.stopTimerId);
      this.stopTimerId = null;
    }

    this.particles = [];
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

// Instantiate the fireworks engine
const fireworks = new HeartFireworksEngine('fireworks-canvas');

// ============================================================================
// UI STATE HELPERS
// ============================================================================

/**
 * Show validation error message and shake the alert
 */
function showValidation(message) {
  validationText.textContent = message;
  validationMessage.classList.remove('hidden');

  // Trigger reflow to restart CSS shake animation
  validationMessage.style.animation = 'none';
  void validationMessage.offsetWidth;
  validationMessage.style.animation = '';
}

/**
 * Hide validation error message
 */
function clearValidation() {
  validationMessage.classList.add('hidden');
}

/**
 * Get a tailored affinity title and message based on random score (1-99)
 */
function getScoreDetails(score) {
  if (score <= 25) {
    return {
      title: 'Gentle Friendship 🌱',
      message: 'A cool breeze... Better off as sweet friends who share laughs and good memories!'
    };
  } else if (score <= 50) {
    return {
      title: 'Curious Spark ☕',
      message: 'A cozy beginning. With shared moments and deep chats, affection could slowly blossom.'
    };
  } else if (score <= 75) {
    return {
      title: 'Sweet Chemistry 💫',
      message: 'There is genuine warmth and magnetic energy here. Definitely worth exploring!'
    };
  } else if (score <= 90) {
    return {
      title: 'High Compatibility 🔥',
      message: 'Sparks are flying high! Your vibes match harmoniously and passions run deep.'
    };
  } else {
    return {
      title: 'Cosmic Soulmates 💖',
      message: 'An electric connection! You two share an extraordinary, heart-melting bond.'
    };
  }
}

/**
 * Display the calculated result with pop-in animation
 */
function displayResult(scoreDisplayVal, meterPercent, title, message, badgeClass = '', barClass = '') {
  // Reset badge and bar classes
  scoreBadge.className = 'score-badge';
  scoreBar.className = 'score-bar';

  if (badgeClass) {
    scoreBadge.classList.add(badgeClass);
  }
  if (barClass) {
    scoreBar.classList.add(barClass);
  }

  // Set text content
  scoreDisplay.textContent = scoreDisplayVal;
  resultTitle.textContent = title;
  resultMessage.textContent = message;

  // Animate progress bar width
  scoreBar.style.width = `${meterPercent}%`;

  // Show result area and trigger pop-in animation cleanly
  resultArea.classList.remove('hidden');
  resultArea.style.animation = 'none';
  void resultArea.offsetWidth;
  resultArea.style.animation = '';
}

// ============================================================================
// SPECIAL MONTHSARY CELEBRATION MODAL
// ============================================================================
let modalTimerId = null;

/**
 * Open the special 7th monthsary celebration popup with smooth animation
 */
function openMonthsaryModal() {
  if (modalTimerId) {
    clearTimeout(modalTimerId);
    modalTimerId = null;
  }

  // Small delay so the card's infinity result and initial fireworks burst start first,
  // creating a stunning, seamless layered reveal
  modalTimerId = setTimeout(() => {
    modalBackdrop.classList.remove('hidden');
    monthsaryModal.classList.remove('hidden');

    // Force layout reflow so animation starts cleanly
    void monthsaryModal.offsetWidth;

    modalBackdrop.classList.add('active');
    monthsaryModal.classList.add('active');
    monthsaryModal.classList.remove('closing');

    // Accessibility focus on action button
    if (modalActionBtn) {
      modalActionBtn.focus();
    }
  }, 260);
}

/**
 * Close the special monthsary modal cleanly with fade-out
 */
function closeMonthsaryModal() {
  if (modalTimerId) {
    clearTimeout(modalTimerId);
    modalTimerId = null;
  }

  if (monthsaryModal.classList.contains('hidden')) return;

  monthsaryModal.classList.add('closing');
  modalBackdrop.classList.remove('active');

  setTimeout(() => {
    monthsaryModal.classList.remove('active', 'closing');
    monthsaryModal.classList.add('hidden');
    modalBackdrop.classList.add('hidden');
  }, 230);
}

// ============================================================================
// CORE CALCULATION LOGIC
// Checked in the exact specified order
// ============================================================================
function calculateLove() {
  const raw1 = name1Input.value;
  const raw2 = name2Input.value;

  // 1. Validation: if either input is empty (after trimming), show "Please enter both names" and do nothing else
  if (!raw1.trim() || !raw2.trim()) {
    showValidation('Please enter both names');
    return;
  }

  // Clear any existing validation alert
  clearValidation();

  // 2. Normalize both names: trim whitespace and convert to lowercase
  const n1 = raw1.trim().toLowerCase();
  const n2 = raw2.trim().toLowerCase();

  // Check if each normalized name matches either special constant
  const isName1Special = (n1 === SPECIAL_NAME_1 || n1 === SPECIAL_NAME_2);
  const isName2Special = (n2 === SPECIAL_NAME_1 || n2 === SPECIAL_NAME_2);

  // 3. Special pair: if the two names are "jake" and "jenah" in either order (jake + jenah OR jenah + jake)
  const isSpecialPair =
    (n1 === SPECIAL_NAME_1 && n2 === SPECIAL_NAME_2) ||
    (n1 === SPECIAL_NAME_2 && n2 === SPECIAL_NAME_1);

  if (isSpecialPair) {
    displayResult(
      '∞',
      100,
      'Written in the Stars ✨',
      'Infinite love, written in the stars',
      'special-infinity',
      'special-full'
    );
    // Trigger heart fireworks effect
    fireworks.start();
    // Launch special monthsary celebration popup
    openMonthsaryModal();
    return;
  }

  // If fireworks are still running from a previous check, stop them cleanly
  fireworks.stop();
  closeMonthsaryModal();

  // 4. Cursed pair: if exactly one of the two names is "jake" or "jenah" and the other name is anything else
  const isCursedPair = (isName1Special && !isName2Special) || (!isName1Special && isName2Special);

  if (isCursedPair) {
    displayResult(
      '0%',
      0,
      'Cosmic Mismatch 💔',
      'Not in a billion eternities',
      'cursed-zero',
      'cursed-empty'
    );
    return;
  }

  // 5. Any other pair of names: display a new random score from 1 to 99 each time clicked
  // Must not be the same every time (no hashing)
  const randomScore = Math.floor(Math.random() * 99) + 1;
  const details = getScoreDetails(randomScore);

  displayResult(
    `${randomScore}%`,
    randomScore,
    details.title,
    details.message
  );
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Calculate button click
calculateBtn.addEventListener('click', calculateLove);

// Enter key triggers calculation in either input
name1Input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    calculateLove();
  }
});

name2Input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    calculateLove();
  }
});

// Clear validation message as soon as user types into an input
name1Input.addEventListener('input', () => {
  if (name1Input.value.trim() && name2Input.value.trim()) {
    clearValidation();
  }
});

name2Input.addEventListener('input', () => {
  if (name1Input.value.trim() && name2Input.value.trim()) {
    clearValidation();
  }
});

// ============================================================================
// MODAL CELEBRATION EVENT LISTENERS
// ============================================================================
if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', closeMonthsaryModal);
}

if (modalActionBtn) {
  modalActionBtn.addEventListener('click', () => {
    // If fireworks are active, spawn a joyful extra burst
    if (fireworks && fireworks.isRunning) {
      fireworks.spawnBurst(window.innerWidth * 0.5, window.innerHeight * 0.35);
    }
    closeMonthsaryModal();
  });
}

if (modalBackdrop) {
  modalBackdrop.addEventListener('click', closeMonthsaryModal);
}

if (monthsaryModal) {
  monthsaryModal.addEventListener('click', (e) => {
    if (e.target === monthsaryModal) {
      closeMonthsaryModal();
    }
  });
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && monthsaryModal && !monthsaryModal.classList.contains('hidden')) {
    closeMonthsaryModal();
  }
});
