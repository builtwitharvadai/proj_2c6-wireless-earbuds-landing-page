/**
 * Testimonials Carousel Module
 * 
 * Provides optional carousel functionality for customer testimonials with:
 * - Keyboard navigation support (Arrow keys, Home, End)
 * - Touch/swipe gestures for mobile devices
 * - Auto-play with pause on hover/focus
 * - Accessibility features (ARIA live regions, focus management)
 * - Progressive enhancement (works without JavaScript)
 * - Responsive behavior across all device sizes
 * 
 * @module testimonials
 */

(function testimonialCarousel() {
  'use strict';

  // Configuration constants
  const CONFIG = Object.freeze({
    AUTO_PLAY_INTERVAL: 5000,
    TRANSITION_DURATION: 300,
    SWIPE_THRESHOLD: 50,
    TOUCH_ANGLE_THRESHOLD: 30,
    KEYBOARD_REPEAT_DELAY: 300,
  });

  // State management
  const state = {
    currentIndex: 0,
    totalCards: 0,
    isAutoPlaying: false,
    autoPlayTimer: null,
    lastKeyPressTime: 0,
    touchStartX: 0,
    touchStartY: 0,
    touchStartTime: 0,
    isTransitioning: false,
  };

  // DOM element references
  const elements = {
    container: null,
    grid: null,
    cards: [],
    prevButton: null,
    nextButton: null,
    indicators: null,
    liveRegion: null,
  };

  /**
   * Initialize the testimonials carousel
   * Progressive enhancement - only activates if JavaScript is available
   */
  function init() {
    try {
      // Find testimonials section
      elements.container = document.querySelector('.testimonials');
      if (!elements.container) {
        return; // No testimonials section, exit gracefully
      }

      elements.grid = elements.container.querySelector('.testimonials__grid');
      if (!elements.grid) {
        return; // No grid found, exit gracefully
      }

      elements.cards = Array.from(elements.grid.querySelectorAll('.testimonial-card'));
      state.totalCards = elements.cards.length;

      // Only initialize carousel if there are multiple testimonials
      if (state.totalCards <= 1) {
        return; // Single testimonial doesn't need carousel
      }

      // Create carousel controls
      createCarouselControls();
      createIndicators();
      createLiveRegion();

      // Set up event listeners
      attachEventListeners();

      // Initialize first card as active
      updateCarousel(0, false);

      // Start auto-play
      startAutoPlay();

      // Log successful initialization
      console.info('[Testimonials] Carousel initialized with', state.totalCards, 'testimonials');
    } catch (error) {
      console.error('[Testimonials] Initialization failed:', error);
      // Fail gracefully - testimonials will display in grid layout
    }
  }

  /**
   * Create navigation controls (Previous/Next buttons)
   */
  function createCarouselControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'testimonials__controls';
    controlsContainer.setAttribute('role', 'group');
    controlsContainer.setAttribute('aria-label', 'Testimonial navigation');

    // Previous button
    elements.prevButton = document.createElement('button');
    elements.prevButton.type = 'button';
    elements.prevButton.className = 'testimonials__control testimonials__control--prev';
    elements.prevButton.setAttribute('aria-label', 'Previous testimonial');
    elements.prevButton.innerHTML = '<span aria-hidden="true">‹</span>';

    // Next button
    elements.nextButton = document.createElement('button');
    elements.nextButton.type = 'button';
    elements.nextButton.className = 'testimonials__control testimonials__control--next';
    elements.nextButton.setAttribute('aria-label', 'Next testimonial');
    elements.nextButton.innerHTML = '<span aria-hidden="true">›</span>';

    controlsContainer.appendChild(elements.prevButton);
    controlsContainer.appendChild(elements.nextButton);

    elements.container.querySelector('.testimonials__container').appendChild(controlsContainer);

    // Add CSS for controls
    injectCarouselStyles();
  }

  /**
   * Create indicator dots for carousel position
   */
  function createIndicators() {
    elements.indicators = document.createElement('div');
    elements.indicators.className = 'testimonials__indicators';
    elements.indicators.setAttribute('role', 'tablist');
    elements.indicators.setAttribute('aria-label', 'Testimonial indicators');

    for (let i = 0; i < state.totalCards; i++) {
      const indicator = document.createElement('button');
      indicator.type = 'button';
      indicator.className = 'testimonials__indicator';
      indicator.setAttribute('role', 'tab');
      indicator.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      indicator.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      indicator.dataset.index = i;

      elements.indicators.appendChild(indicator);
    }

    elements.container.querySelector('.testimonials__container').appendChild(elements.indicators);
  }

  /**
   * Create ARIA live region for screen reader announcements
   */
  function createLiveRegion() {
    elements.liveRegion = document.createElement('div');
    elements.liveRegion.className = 'sr-only';
    elements.liveRegion.setAttribute('role', 'status');
    elements.liveRegion.setAttribute('aria-live', 'polite');
    elements.liveRegion.setAttribute('aria-atomic', 'true');

    elements.container.appendChild(elements.liveRegion);
  }

  /**
   * Attach all event listeners
   */
  function attachEventListeners() {
    // Navigation button clicks
    elements.prevButton.addEventListener('click', handlePrevClick);
    elements.nextButton.addEventListener('click', handleNextClick);

    // Indicator clicks
    elements.indicators.addEventListener('click', handleIndicatorClick);

    // Keyboard navigation
    elements.container.addEventListener('keydown', handleKeyDown);

    // Touch events for swipe gestures
    elements.grid.addEventListener('touchstart', handleTouchStart, { passive: true });
    elements.grid.addEventListener('touchmove', handleTouchMove, { passive: false });
    elements.grid.addEventListener('touchend', handleTouchEnd);

    // Pause auto-play on hover/focus
    elements.container.addEventListener('mouseenter', pauseAutoPlay);
    elements.container.addEventListener('mouseleave', resumeAutoPlay);
    elements.container.addEventListener('focusin', pauseAutoPlay);
    elements.container.addEventListener('focusout', resumeAutoPlay);

    // Handle visibility change (pause when tab is hidden)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle window resize for responsive behavior
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateCarousel(state.currentIndex, false);
      }, 150);
    });
  }

  /**
   * Handle previous button click
   */
  function handlePrevClick() {
    navigateTo(state.currentIndex - 1);
  }

  /**
   * Handle next button click
   */
  function handleNextClick() {
    navigateTo(state.currentIndex + 1);
  }

  /**
   * Handle indicator dot click
   * @param {Event} event - Click event
   */
  function handleIndicatorClick(event) {
    const indicator = event.target.closest('.testimonials__indicator');
    if (!indicator) return;

    const index = parseInt(indicator.dataset.index, 10);
    if (!isNaN(index)) {
      navigateTo(index);
    }
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleKeyDown(event) {
    // Prevent rapid key repeats
    const now = Date.now();
    if (now - state.lastKeyPressTime < CONFIG.KEYBOARD_REPEAT_DELAY) {
      return;
    }

    let handled = false;

    switch (event.key) {
      case 'ArrowLeft':
        navigateTo(state.currentIndex - 1);
        handled = true;
        break;
      case 'ArrowRight':
        navigateTo(state.currentIndex + 1);
        handled = true;
        break;
      case 'Home':
        navigateTo(0);
        handled = true;
        break;
      case 'End':
        navigateTo(state.totalCards - 1);
        handled = true;
        break;
    }

    if (handled) {
      event.preventDefault();
      state.lastKeyPressTime = now;
    }
  }

  /**
   * Handle touch start for swipe gestures
   * @param {TouchEvent} event - Touch event
   */
  function handleTouchStart(event) {
    if (event.touches.length !== 1) return;

    state.touchStartX = event.touches[0].clientX;
    state.touchStartY = event.touches[0].clientY;
    state.touchStartTime = Date.now();
  }

  /**
   * Handle touch move for swipe gestures
   * @param {TouchEvent} event - Touch event
   */
  function handleTouchMove(event) {
    if (event.touches.length !== 1) return;

    const deltaX = Math.abs(event.touches[0].clientX - state.touchStartX);
    const deltaY = Math.abs(event.touches[0].clientY - state.touchStartY);

    // Prevent vertical scroll if horizontal swipe is detected
    if (deltaX > deltaY && deltaX > 10) {
      event.preventDefault();
    }
  }

  /**
   * Handle touch end for swipe gestures
   * @param {TouchEvent} event - Touch event
   */
  function handleTouchEnd(event) {
    if (!state.touchStartX) return;

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const deltaX = touchEndX - state.touchStartX;
    const deltaY = touchEndY - state.touchStartY;
    const deltaTime = Date.now() - state.touchStartTime;

    // Calculate swipe angle
    const angle = Math.abs(Math.atan2(deltaY, deltaX) * 180 / Math.PI);

    // Check if it's a horizontal swipe
    const isHorizontalSwipe = angle < CONFIG.TOUCH_ANGLE_THRESHOLD || 
                              angle > (180 - CONFIG.TOUCH_ANGLE_THRESHOLD);

    // Check if swipe meets threshold and is fast enough
    if (isHorizontalSwipe && 
        Math.abs(deltaX) > CONFIG.SWIPE_THRESHOLD && 
        deltaTime < 500) {
      if (deltaX > 0) {
        navigateTo(state.currentIndex - 1);
      } else {
        navigateTo(state.currentIndex + 1);
      }
    }

    // Reset touch state
    state.touchStartX = 0;
    state.touchStartY = 0;
    state.touchStartTime = 0;
  }

  /**
   * Handle visibility change (pause when tab is hidden)
   */
  function handleVisibilityChange() {
    if (document.hidden) {
      pauseAutoPlay();
    } else {
      resumeAutoPlay();
    }
  }

  /**
   * Navigate to specific testimonial index
   * @param {number} index - Target index
   */
  function navigateTo(index) {
    if (state.isTransitioning) return;

    // Wrap around at boundaries
    let newIndex = index;
    if (newIndex < 0) {
      newIndex = state.totalCards - 1;
    } else if (newIndex >= state.totalCards) {
      newIndex = 0;
    }

    if (newIndex === state.currentIndex) return;

    updateCarousel(newIndex, true);
    resetAutoPlay();
  }

  /**
   * Update carousel to show specific index
   * @param {number} index - Target index
   * @param {boolean} animate - Whether to animate transition
   */
  function updateCarousel(index, animate) {
    state.isTransitioning = true;
    state.currentIndex = index;

    // Update cards visibility
    elements.cards.forEach((card, i) => {
      if (i === index) {
        card.classList.add('testimonial-card--active');
        card.removeAttribute('aria-hidden');
        card.setAttribute('tabindex', '0');
      } else {
        card.classList.remove('testimonial-card--active');
        card.setAttribute('aria-hidden', 'true');
        card.setAttribute('tabindex', '-1');
      }
    });

    // Update indicators
    const indicators = elements.indicators.querySelectorAll('.testimonials__indicator');
    indicators.forEach((indicator, i) => {
      if (i === index) {
        indicator.classList.add('testimonials__indicator--active');
        indicator.setAttribute('aria-selected', 'true');
      } else {
        indicator.classList.remove('testimonials__indicator--active');
        indicator.setAttribute('aria-selected', 'false');
      }
    });

    // Update button states
    elements.prevButton.disabled = false;
    elements.nextButton.disabled = false;

    // Announce to screen readers
    announceCurrentTestimonial();

    // Reset transition flag after animation
    setTimeout(() => {
      state.isTransitioning = false;
    }, animate ? CONFIG.TRANSITION_DURATION : 0);
  }

  /**
   * Announce current testimonial to screen readers
   */
  function announceCurrentTestimonial() {
    const currentCard = elements.cards[state.currentIndex];
    const customerName = currentCard.querySelector('.testimonial-card__name')?.textContent || 'Customer';
    
    elements.liveRegion.textContent = `Showing testimonial ${state.currentIndex + 1} of ${state.totalCards} from ${customerName}`;
  }

  /**
   * Start auto-play
   */
  function startAutoPlay() {
    if (state.isAutoPlaying) return;

    state.isAutoPlaying = true;
    state.autoPlayTimer = setInterval(() => {
      navigateTo(state.currentIndex + 1);
    }, CONFIG.AUTO_PLAY_INTERVAL);
  }

  /**
   * Pause auto-play
   */
  function pauseAutoPlay() {
    if (!state.isAutoPlaying) return;

    clearInterval(state.autoPlayTimer);
    state.autoPlayTimer = null;
  }

  /**
   * Resume auto-play
   */
  function resumeAutoPlay() {
    if (state.autoPlayTimer) return;

    state.autoPlayTimer = setInterval(() => {
      navigateTo(state.currentIndex + 1);
    }, CONFIG.AUTO_PLAY_INTERVAL);
  }

  /**
   * Reset auto-play timer
   */
  function resetAutoPlay() {
    pauseAutoPlay();
    resumeAutoPlay();
  }

  /**
   * Inject carousel-specific CSS
   */
  function injectCarouselStyles() {
    const styleId = 'testimonials-carousel-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .testimonials__controls {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-block-start: 2rem;
      }

      .testimonials__control {
        width: 3rem;
        height: 3rem;
        border: 2px solid var(--color-primary-600);
        background-color: var(--color-bg-primary);
        color: var(--color-primary-600);
        border-radius: 50%;
        font-size: 2rem;
        line-height: 1;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .testimonials__control:hover:not(:disabled) {
        background-color: var(--color-primary-600);
        color: var(--color-bg-primary);
        transform: scale(1.1);
      }

      .testimonials__control:focus-visible {
        outline: 2px solid var(--color-primary-600);
        outline-offset: 4px;
      }

      .testimonials__control:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .testimonials__indicators {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-block-start: 1.5rem;
      }

      .testimonials__indicator {
        width: 0.75rem;
        height: 0.75rem;
        border: none;
        background-color: var(--color-border-light);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
      }

      .testimonials__indicator:hover {
        background-color: var(--color-primary-400);
        transform: scale(1.2);
      }

      .testimonials__indicator--active {
        background-color: var(--color-primary-600);
        transform: scale(1.3);
      }

      .testimonials__indicator:focus-visible {
        outline: 2px solid var(--color-primary-600);
        outline-offset: 4px;
      }

      .testimonial-card {
        transition: opacity 0.3s ease, transform 0.3s ease;
      }

      .testimonial-card:not(.testimonial-card--active) {
        opacity: 0;
        transform: scale(0.95);
        position: absolute;
        pointer-events: none;
      }

      .testimonial-card--active {
        opacity: 1;
        transform: scale(1);
        position: relative;
      }

      .testimonials__grid {
        position: relative;
        min-height: 400px;
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }

      @media (prefers-reduced-motion: reduce) {
        .testimonial-card,
        .testimonials__control,
        .testimonials__indicator {
          transition: none;
        }
      }

      @media (width < 640px) {
        .testimonials__control {
          width: 2.5rem;
          height: 2.5rem;
          font-size: 1.5rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();