/**
 * Performance Optimization Module
 * Implements lazy loading, performance monitoring, and progressive enhancement
 * 
 * @module performance
 * @generated-from: task-id:TASK-007
 * @modifies: index.html
 */

(function() {
  'use strict';

  /**
   * Performance monitoring and metrics collection
   */
  const PerformanceMonitor = {
    metrics: {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      timeToInteractive: 0
    },

    /**
     * Initialize performance monitoring
     */
    init() {
      this.measurePageLoad();
      this.measureCoreWebVitals();
      this.logMetrics();
    },

    /**
     * Measure page load time
     */
    measurePageLoad() {
      if (!window.performance || !window.performance.timing) {
        console.warn('[Performance] Performance API not supported');
        return;
      }

      window.addEventListener('load', () => {
        const timing = performance.timing;
        this.metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        
        console.log('[Performance] Page load time:', this.metrics.pageLoadTime + 'ms');
      });
    },

    /**
     * Measure Core Web Vitals using PerformanceObserver
     */
    measureCoreWebVitals() {
      if (!window.PerformanceObserver) {
        console.warn('[Performance] PerformanceObserver not supported');
        return;
      }

      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime;
          console.log('[Performance] LCP:', this.metrics.largestContentfulPaint + 'ms');
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Contentful Paint (FCP)
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.firstContentfulPaint = entry.startTime;
              console.log('[Performance] FCP:', this.metrics.firstContentfulPaint + 'ms');
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

        // Cumulative Layout Shift (CLS)
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
              this.metrics.cumulativeLayoutShift = clsScore;
            }
          });
          console.log('[Performance] CLS:', this.metrics.cumulativeLayoutShift.toFixed(4));
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
            console.log('[Performance] FID:', this.metrics.firstInputDelay + 'ms');
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

      } catch (error) {
        console.error('[Performance] Error setting up observers:', error);
      }
    },

    /**
     * Log all collected metrics
     */
    logMetrics() {
      window.addEventListener('load', () => {
        setTimeout(() => {
          console.group('[Performance] Metrics Summary');
          console.table(this.metrics);
          console.groupEnd();

          // Check against performance budgets
          this.checkPerformanceBudgets();
        }, 3000);
      });
    },

    /**
     * Check metrics against performance budgets
     */
    checkPerformanceBudgets() {
      const budgets = {
        pageLoadTime: 3000,
        firstContentfulPaint: 1800,
        largestContentfulPaint: 2500,
        cumulativeLayoutShift: 0.1,
        firstInputDelay: 100
      };

      const violations = [];

      Object.keys(budgets).forEach((metric) => {
        if (this.metrics[metric] > budgets[metric]) {
          violations.push({
            metric,
            actual: this.metrics[metric],
            budget: budgets[metric]
          });
        }
      });

      if (violations.length > 0) {
        console.warn('[Performance] Budget violations detected:', violations);
      } else {
        console.log('[Performance] All metrics within budget ✓');
      }
    }
  };

  /**
   * Lazy loading implementation using Intersection Observer
   */
  const LazyLoader = {
    observer: null,
    config: {
      rootMargin: '50px 0px',
      threshold: 0.01
    },

    /**
     * Initialize lazy loading for images
     */
    init() {
      if (!('IntersectionObserver' in window)) {
        console.warn('[LazyLoader] IntersectionObserver not supported, loading all images');
        this.loadAllImages();
        return;
      }

      this.setupObserver();
      this.observeImages();
    },

    /**
     * Setup Intersection Observer
     */
    setupObserver() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      }, this.config);
    },

    /**
     * Observe all lazy-loadable images
     */
    observeImages() {
      const images = document.querySelectorAll('img[loading="lazy"]');
      
      if (images.length === 0) {
        console.log('[LazyLoader] No lazy-loadable images found');
        return;
      }

      console.log(`[LazyLoader] Observing ${images.length} images`);
      
      images.forEach((img) => {
        // Skip if already loaded
        if (img.complete && img.naturalHeight !== 0) {
          return;
        }

        // Add placeholder background
        if (!img.style.backgroundColor) {
          img.style.backgroundColor = '#f0f0f0';
        }

        this.observer.observe(img);
      });
    },

    /**
     * Load individual image
     * @param {HTMLImageElement} img - Image element to load
     */
    loadImage(img) {
      const src = img.getAttribute('src');
      const srcset = img.getAttribute('srcset');

      if (!src && !srcset) {
        console.warn('[LazyLoader] Image has no src or srcset:', img);
        return;
      }

      // Create a new image to preload
      const tempImg = new Image();
      
      tempImg.onload = () => {
        img.classList.add('loaded');
        console.log('[LazyLoader] Image loaded:', src || srcset);
      };

      tempImg.onerror = () => {
        console.error('[LazyLoader] Failed to load image:', src || srcset);
        img.classList.add('error');
      };

      // Start loading
      if (srcset) {
        tempImg.srcset = srcset;
      }
      if (src) {
        tempImg.src = src;
      }
    },

    /**
     * Fallback: Load all images immediately
     */
    loadAllImages() {
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach((img) => {
        img.removeAttribute('loading');
      });
    }
  };

  /**
   * Progressive enhancement features
   */
  const ProgressiveEnhancement = {
    /**
     * Initialize progressive enhancements
     */
    init() {
      this.enhanceNavigation();
      this.enhanceForms();
      this.addSmoothScrolling();
      this.optimizeAnimations();
    },

    /**
     * Enhance navigation with smooth transitions
     */
    enhanceNavigation() {
      const navLinks = document.querySelectorAll('a[href^="#"]');
      
      navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          
          // Skip if it's just "#"
          if (href === '#') {
            return;
          }

          const target = document.querySelector(href);
          
          if (target) {
            e.preventDefault();
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });

            // Update URL without triggering navigation
            if (history.pushState) {
              history.pushState(null, null, href);
            }
          }
        });
      });
    },

    /**
     * Enhance forms with validation and feedback
     */
    enhanceForms() {
      const forms = document.querySelectorAll('form');
      
      forms.forEach((form) => {
        form.addEventListener('submit', (e) => {
          const isValid = form.checkValidity();
          
          if (!isValid) {
            e.preventDefault();
            console.log('[ProgressiveEnhancement] Form validation failed');
            
            // Show validation messages
            const invalidFields = form.querySelectorAll(':invalid');
            invalidFields.forEach((field) => {
              field.classList.add('error');
            });
          }
        });
      });
    },

    /**
     * Add smooth scrolling behavior
     */
    addSmoothScrolling() {
      // Check if smooth scrolling is supported
      if ('scrollBehavior' in document.documentElement.style) {
        document.documentElement.style.scrollBehavior = 'smooth';
      }
    },

    /**
     * Optimize animations based on user preferences
     */
    optimizeAnimations() {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      if (prefersReducedMotion.matches) {
        console.log('[ProgressiveEnhancement] Reduced motion preferred, disabling animations');
        document.documentElement.classList.add('reduce-motion');
      }

      // Listen for changes
      prefersReducedMotion.addEventListener('change', (e) => {
        if (e.matches) {
          document.documentElement.classList.add('reduce-motion');
        } else {
          document.documentElement.classList.remove('reduce-motion');
        }
      });
    }
  };

  /**
   * Resource hints for critical assets
   */
  const ResourceHints = {
    /**
     * Add preconnect hints for external domains
     */
    addPreconnectHints() {
      const domains = [
        'https://images.unsplash.com'
      ];

      domains.forEach((domain) => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    },

    /**
     * Prefetch next page resources
     */
    prefetchResources() {
      // Only prefetch on fast connections
      if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection.effectiveType === '4g' && !connection.saveData) {
          console.log('[ResourceHints] Prefetching resources on fast connection');
          // Add prefetch logic here if needed
        }
      }
    }
  };

  /**
   * Initialize all performance optimizations
   */
  function initPerformanceOptimizations() {
    console.log('[Performance] Initializing optimizations...');

    try {
      // Initialize performance monitoring
      PerformanceMonitor.init();

      // Initialize lazy loading
      LazyLoader.init();

      // Initialize progressive enhancements
      ProgressiveEnhancement.init();

      // Add resource hints
      ResourceHints.addPreconnectHints();
      ResourceHints.prefetchResources();

      console.log('[Performance] All optimizations initialized ✓');
    } catch (error) {
      console.error('[Performance] Error during initialization:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPerformanceOptimizations);
  } else {
    initPerformanceOptimizations();
  }

  // Export for testing purposes
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      PerformanceMonitor,
      LazyLoader,
      ProgressiveEnhancement,
      ResourceHints
    };
  }
})();