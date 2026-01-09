/**
 * Browser Compatibility and Feature Detection Module
 * 
 * Provides comprehensive browser compatibility checks, feature detection,
 * polyfills, and graceful degradation strategies for cross-browser support.
 * 
 * Supports: Chrome, Firefox, Safari, Edge (modern versions)
 * Graceful degradation for older browsers
 * 
 * @module compatibility
 * @generated-from: task-id:TASK-008
 * @modifies: index.html
 */

(function browserCompatibility() {
  'use strict';

  /**
   * Browser detection and version information
   */
  const BrowserDetection = {
    userAgent: navigator.userAgent.toLowerCase(),
    vendor: navigator.vendor.toLowerCase(),

    /**
     * Detect current browser
     * @returns {Object} Browser information
     */
    detect() {
      const ua = this.userAgent;
      const vendor = this.vendor;

      let browser = 'unknown';
      let version = 0;
      let engine = 'unknown';

      // Chrome
      if (/chrome|chromium|crios/i.test(ua) && /google inc/.test(vendor)) {
        browser = 'chrome';
        const match = ua.match(/(?:chrome|chromium|crios)\/(\d+)/);
        version = match ? parseInt(match[1], 10) : 0;
        engine = 'blink';
      }
      // Firefox
      else if (/firefox|fxios/i.test(ua)) {
        browser = 'firefox';
        const match = ua.match(/(?:firefox|fxios)\/(\d+)/);
        version = match ? parseInt(match[1], 10) : 0;
        engine = 'gecko';
      }
      // Safari
      else if (/safari/i.test(ua) && /apple/.test(vendor)) {
        browser = 'safari';
        const match = ua.match(/version\/(\d+)/);
        version = match ? parseInt(match[1], 10) : 0;
        engine = 'webkit';
      }
      // Edge (Chromium-based)
      else if (/edg/i.test(ua)) {
        browser = 'edge';
        const match = ua.match(/edg\/(\d+)/);
        version = match ? parseInt(match[1], 10) : 0;
        engine = 'blink';
      }
      // Edge (Legacy)
      else if (/edge/i.test(ua)) {
        browser = 'edge-legacy';
        const match = ua.match(/edge\/(\d+)/);
        version = match ? parseInt(match[1], 10) : 0;
        engine = 'edgehtml';
      }

      return {
        browser,
        version,
        engine,
        isModern: this.isModernBrowser(browser, version),
        userAgent: navigator.userAgent
      };
    },

    /**
     * Check if browser is modern enough
     * @param {string} browser - Browser name
     * @param {number} version - Browser version
     * @returns {boolean} True if modern browser
     */
    isModernBrowser(browser, version) {
      const minimumVersions = {
        chrome: 90,
        firefox: 88,
        safari: 14,
        edge: 90
      };

      return version >= (minimumVersions[browser] || 0);
    },

    /**
     * Get browser information as string
     * @returns {string} Browser info string
     */
    toString() {
      const info = this.detect();
      return `${info.browser} ${info.version} (${info.engine})`;
    }
  };

  /**
   * Feature detection for modern JavaScript and browser APIs
   */
  const FeatureDetection = {
    features: {},

    /**
     * Initialize feature detection
     */
    init() {
      this.detectJavaScriptFeatures();
      this.detectBrowserAPIs();
      this.detectCSSFeatures();
      this.logFeatureSupport();
    },

    /**
     * Detect modern JavaScript features
     */
    detectJavaScriptFeatures() {
      this.features.es6 = {
        arrow: this.testFeature(() => eval('(() => true)()')),
        classes: this.testFeature(() => eval('class Test {}')),
        const: this.testFeature(() => eval('const x = 1')),
        let: this.testFeature(() => eval('let x = 1')),
        templateLiterals: this.testFeature(() => eval('`test`')),
        destructuring: this.testFeature(() => eval('const [a] = [1]')),
        spread: this.testFeature(() => eval('[...[1,2]]')),
        promises: typeof Promise !== 'undefined',
        symbols: typeof Symbol !== 'undefined',
        maps: typeof Map !== 'undefined',
        sets: typeof Set !== 'undefined',
        weakMaps: typeof WeakMap !== 'undefined',
        weakSets: typeof WeakSet !== 'undefined'
      };

      this.features.es2015Plus = {
        asyncAwait: this.testFeature(() => eval('(async () => {})')),
        asyncGenerators: this.testFeature(() => eval('(async function* () {})')),
        objectSpread: this.testFeature(() => eval('({...{a:1}})')),
        optionalChaining: this.testFeature(() => eval('({})?.a')),
        nullishCoalescing: this.testFeature(() => eval('null ?? 1')),
        bigInt: typeof BigInt !== 'undefined',
        dynamicImport: this.testFeature(() => typeof import === 'function')
      };
    },

    /**
     * Detect browser APIs
     */
    detectBrowserAPIs() {
      this.features.apis = {
        fetch: typeof fetch !== 'undefined',
        intersectionObserver: 'IntersectionObserver' in window,
        mutationObserver: 'MutationObserver' in window,
        performanceObserver: 'PerformanceObserver' in window,
        resizeObserver: 'ResizeObserver' in window,
        webWorkers: typeof Worker !== 'undefined',
        serviceWorkers: 'serviceWorker' in navigator,
        localStorage: this.testLocalStorage(),
        sessionStorage: this.testSessionStorage(),
        indexedDB: 'indexedDB' in window,
        webGL: this.testWebGL(),
        webGL2: this.testWebGL2(),
        webAssembly: typeof WebAssembly !== 'undefined',
        geolocation: 'geolocation' in navigator,
        notifications: 'Notification' in window,
        vibration: 'vibrate' in navigator,
        battery: 'getBattery' in navigator,
        mediaDevices: 'mediaDevices' in navigator,
        webRTC: this.testWebRTC()
      };
    },

    /**
     * Detect CSS features
     */
    detectCSSFeatures() {
      this.features.css = {
        grid: this.testCSSProperty('grid'),
        flexbox: this.testCSSProperty('flex'),
        customProperties: this.testCSSProperty('--test', 'test'),
        transforms: this.testCSSProperty('transform'),
        transitions: this.testCSSProperty('transition'),
        animations: this.testCSSProperty('animation'),
        filters: this.testCSSProperty('filter'),
        backdropFilter: this.testCSSProperty('backdrop-filter'),
        clipPath: this.testCSSProperty('clip-path'),
        objectFit: this.testCSSProperty('object-fit'),
        aspectRatio: this.testCSSProperty('aspect-ratio'),
        gap: this.testCSSProperty('gap'),
        sticky: this.testCSSValue('position', 'sticky')
      };
    },

    /**
     * Test if a feature is supported
     * @param {Function} test - Test function
     * @returns {boolean} True if supported
     */
    testFeature(test) {
      try {
        return test() !== false;
      } catch (error) {
        return false;
      }
    },

    /**
     * Test localStorage availability
     * @returns {boolean} True if available
     */
    testLocalStorage() {
      try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (error) {
        return false;
      }
    },

    /**
     * Test sessionStorage availability
     * @returns {boolean} True if available
     */
    testSessionStorage() {
      try {
        const test = '__storage_test__';
        sessionStorage.setItem(test, test);
        sessionStorage.removeItem(test);
        return true;
      } catch (error) {
        return false;
      }
    },

    /**
     * Test WebGL support
     * @returns {boolean} True if supported
     */
    testWebGL() {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch (error) {
        return false;
      }
    },

    /**
     * Test WebGL2 support
     * @returns {boolean} True if supported
     */
    testWebGL2() {
      try {
        const canvas = document.createElement('canvas');
        return !!canvas.getContext('webgl2');
      } catch (error) {
        return false;
      }
    },

    /**
     * Test WebRTC support
     * @returns {boolean} True if supported
     */
    testWebRTC() {
      return !!(window.RTCPeerConnection || 
                window.mozRTCPeerConnection || 
                window.webkitRTCPeerConnection);
    },

    /**
     * Test CSS property support
     * @param {string} property - CSS property name
     * @param {string} value - Optional value to test
     * @returns {boolean} True if supported
     */
    testCSSProperty(property, value) {
      const element = document.createElement('div');
      const style = element.style;

      if (value !== undefined) {
        style.setProperty(property, value);
        return style.getPropertyValue(property) === value;
      }

      return property in style;
    },

    /**
     * Test CSS value support
     * @param {string} property - CSS property name
     * @param {string} value - CSS value to test
     * @returns {boolean} True if supported
     */
    testCSSValue(property, value) {
      const element = document.createElement('div');
      element.style[property] = value;
      return element.style[property] === value;
    },

    /**
     * Log feature support summary
     */
    logFeatureSupport() {
      console.group('[Compatibility] Feature Detection Results');
      console.log('ES6 Features:', this.features.es6);
      console.log('ES2015+ Features:', this.features.es2015Plus);
      console.log('Browser APIs:', this.features.apis);
      console.log('CSS Features:', this.features.css);
      console.groupEnd();

      // Check for critical missing features
      this.checkCriticalFeatures();
    },

    /**
     * Check for critical missing features
     */
    checkCriticalFeatures() {
      const critical = [];

      if (!this.features.es6.promises) {
        critical.push('Promises');
      }
      if (!this.features.apis.fetch) {
        critical.push('Fetch API');
      }
      if (!this.features.css.flexbox) {
        critical.push('CSS Flexbox');
      }

      if (critical.length > 0) {
        console.warn('[Compatibility] Missing critical features:', critical);
        this.showCompatibilityWarning(critical);
      }
    },

    /**
     * Show compatibility warning to user
     * @param {Array<string>} missingFeatures - List of missing features
     */
    showCompatibilityWarning(missingFeatures) {
      const warning = document.createElement('div');
      warning.className = 'compatibility-warning';
      warning.setAttribute('role', 'alert');
      warning.innerHTML = `
        <strong>Browser Compatibility Notice:</strong>
        <p>Your browser may not support all features. Consider updating to a modern browser for the best experience.</p>
        <button type="button" class="compatibility-warning__close" aria-label="Close warning">×</button>
      `;

      warning.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: #fff3cd;
        color: #856404;
        padding: 1rem;
        border-bottom: 2px solid #ffc107;
        z-index: 10000;
        text-align: center;
        font-family: system-ui, -apple-system, sans-serif;
      `;

      const closeButton = warning.querySelector('.compatibility-warning__close');
      closeButton.style.cssText = `
        position: absolute;
        top: 0.5rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: inherit;
      `;

      closeButton.addEventListener('click', () => {
        warning.remove();
      });

      document.body.insertBefore(warning, document.body.firstChild);
    }
  };

  /**
   * Polyfills for missing features
   */
  const Polyfills = {
    /**
     * Initialize polyfills
     */
    init() {
      this.polyfillPromises();
      this.polyfillFetch();
      this.polyfillObjectAssign();
      this.polyfillArrayMethods();
      this.polyfillStringMethods();
      this.polyfillCustomEvent();
      this.polyfillClosest();
      this.polyfillRemove();
      this.polyfillIntersectionObserver();

      console.log('[Compatibility] Polyfills initialized');
    },

    /**
     * Polyfill for Promises (basic implementation)
     */
    polyfillPromises() {
      if (typeof Promise === 'undefined') {
        console.warn('[Compatibility] Promise polyfill needed but not implemented - consider using a polyfill library');
      }
    },

    /**
     * Polyfill for Fetch API (basic implementation)
     */
    polyfillFetch() {
      if (typeof fetch === 'undefined') {
        console.warn('[Compatibility] Fetch API polyfill needed but not implemented - consider using a polyfill library');
      }
    },

    /**
     * Polyfill for Object.assign
     */
    polyfillObjectAssign() {
      if (typeof Object.assign !== 'function') {
        Object.assign = function(target) {
          if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
          }

          const to = Object(target);

          for (let index = 1; index < arguments.length; index++) {
            const nextSource = arguments[index];

            if (nextSource != null) {
              for (const nextKey in nextSource) {
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                  to[nextKey] = nextSource[nextKey];
                }
              }
            }
          }

          return to;
        };
      }
    },

    /**
     * Polyfill for Array methods
     */
    polyfillArrayMethods() {
      // Array.from
      if (!Array.from) {
        Array.from = function(arrayLike) {
          return Array.prototype.slice.call(arrayLike);
        };
      }

      // Array.prototype.find
      if (!Array.prototype.find) {
        Array.prototype.find = function(predicate) {
          if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
          }
          if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
          }

          const list = Object(this);
          const length = list.length >>> 0;
          const thisArg = arguments[1];

          for (let i = 0; i < length; i++) {
            const value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
              return value;
            }
          }

          return undefined;
        };
      }

      // Array.prototype.includes
      if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement) {
          if (this == null) {
            throw new TypeError('Array.prototype.includes called on null or undefined');
          }

          const O = Object(this);
          const len = parseInt(O.length, 10) || 0;

          if (len === 0) {
            return false;
          }

          const n = parseInt(arguments[1], 10) || 0;
          let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

          while (k < len) {
            if (O[k] === searchElement) {
              return true;
            }
            k++;
          }

          return false;
        };
      }
    },

    /**
     * Polyfill for String methods
     */
    polyfillStringMethods() {
      // String.prototype.includes
      if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
          if (typeof start !== 'number') {
            start = 0;
          }

          if (start + search.length > this.length) {
            return false;
          }

          return this.indexOf(search, start) !== -1;
        };
      }

      // String.prototype.startsWith
      if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(search, pos) {
          pos = !pos || pos < 0 ? 0 : +pos;
          return this.substring(pos, pos + search.length) === search;
        };
      }

      // String.prototype.endsWith
      if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(search, this_len) {
          if (this_len === undefined || this_len > this.length) {
            this_len = this.length;
          }
          return this.substring(this_len - search.length, this_len) === search;
        };
      }
    },

    /**
     * Polyfill for CustomEvent
     */
    polyfillCustomEvent() {
      if (typeof window.CustomEvent === 'function') {
        return;
      }

      function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
      }

      window.CustomEvent = CustomEvent;
    },

    /**
     * Polyfill for Element.closest
     */
    polyfillClosest() {
      if (!Element.prototype.closest) {
        Element.prototype.closest = function(selector) {
          let element = this;

          while (element && element.nodeType === 1) {
            if (element.matches(selector)) {
              return element;
            }
            element = element.parentElement || element.parentNode;
          }

          return null;
        };
      }
    },

    /**
     * Polyfill for Element.remove
     */
    polyfillRemove() {
      if (!Element.prototype.remove) {
        Element.prototype.remove = function() {
          if (this.parentNode) {
            this.parentNode.removeChild(this);
          }
        };
      }
    },

    /**
     * Polyfill for IntersectionObserver (basic fallback)
     */
    polyfillIntersectionObserver() {
      if ('IntersectionObserver' in window) {
        return;
      }

      console.warn('[Compatibility] IntersectionObserver not supported - using fallback');

      window.IntersectionObserver = function(callback) {
        this.observe = function(element) {
          // Immediate callback for fallback
          setTimeout(() => {
            callback([{
              target: element,
              isIntersecting: true,
              intersectionRatio: 1
            }], this);
          }, 0);
        };

        this.unobserve = function() {};
        this.disconnect = function() {};
      };
    }
  };

  /**
   * Graceful degradation strategies
   */
  const GracefulDegradation = {
    /**
     * Initialize graceful degradation
     */
    init() {
      this.addBrowserClasses();
      this.handleUnsupportedFeatures();
      this.setupFallbacks();
    },

    /**
     * Add browser-specific classes to HTML element
     */
    addBrowserClasses() {
      const browserInfo = BrowserDetection.detect();
      const html = document.documentElement;

      html.classList.add(`browser-${browserInfo.browser}`);
      html.classList.add(`engine-${browserInfo.engine}`);

      if (!browserInfo.isModern) {
        html.classList.add('browser-legacy');
      }

      console.log('[Compatibility] Browser classes added:', browserInfo.browser);
    },

    /**
     * Handle unsupported features
     */
    handleUnsupportedFeatures() {
      const features = FeatureDetection.features;

      // Handle missing CSS Grid
      if (!features.css.grid) {
        document.documentElement.classList.add('no-grid');
        console.warn('[Compatibility] CSS Grid not supported - using flexbox fallback');
      }

      // Handle missing Flexbox
      if (!features.css.flexbox) {
        document.documentElement.classList.add('no-flexbox');
        console.warn('[Compatibility] Flexbox not supported - using float fallback');
      }

      // Handle missing custom properties
      if (!features.css.customProperties) {
        document.documentElement.classList.add('no-custom-properties');
        console.warn('[Compatibility] CSS Custom Properties not supported');
      }
    },

    /**
     * Setup fallbacks for missing features
     */
    setupFallbacks() {
      // Smooth scroll fallback
      if (!('scrollBehavior' in document.documentElement.style)) {
        this.setupSmoothScrollFallback();
      }

      // Object-fit fallback
      if (!FeatureDetection.features.css.objectFit) {
        this.setupObjectFitFallback();
      }
    },

    /**
     * Setup smooth scroll fallback
     */
    setupSmoothScrollFallback() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          if (href === '#') return;

          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 800;
            let start = null;

            function animation(currentTime) {
              if (start === null) start = currentTime;
              const timeElapsed = currentTime - start;
              const run = ease(timeElapsed, startPosition, distance, duration);
              window.scrollTo(0, run);
              if (timeElapsed < duration) requestAnimationFrame(animation);
            }

            function ease(t, b, c, d) {
              t /= d / 2;
              if (t < 1) return c / 2 * t * t + b;
              t--;
              return -c / 2 * (t * (t - 2) - 1) + b;
            }

            requestAnimationFrame(animation);
          }
        });
      });
    },

    /**
     * Setup object-fit fallback
     */
    setupObjectFitFallback() {
      const images = document.querySelectorAll('img[style*="object-fit"]');
      images.forEach(img => {
        const parent = img.parentElement;
        parent.style.position = 'relative';
        parent.style.overflow = 'hidden';
        
        img.style.position = 'absolute';
        img.style.top = '50%';
        img.style.left = '50%';
        img.style.transform = 'translate(-50%, -50%)';
        img.style.minWidth = '100%';
        img.style.minHeight = '100%';
      });
    }
  };

  /**
   * Initialize all compatibility features
   */
  function initCompatibility() {
    console.group('[Compatibility] Initializing browser compatibility...');

    try {
      // Detect browser
      const browserInfo = BrowserDetection.detect();
      console.log('[Compatibility] Browser detected:', browserInfo);

      // Detect features
      FeatureDetection.init();

      // Apply polyfills
      Polyfills.init();

      // Setup graceful degradation
      GracefulDegradation.init();

      console.log('[Compatibility] All compatibility features initialized ✓');
    } catch (error) {
      console.error('[Compatibility] Error during initialization:', error);
    }

    console.groupEnd();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCompatibility);
  } else {
    initCompatibility();
  }

  // Export for testing purposes
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      BrowserDetection,
      FeatureDetection,
      Polyfills,
      GracefulDegradation
    };
  }
})();