import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useScrollReveal - Hook for scroll-triggered animations using IntersectionObserver
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Intersection threshold (0-1)
 * @param {string} options.rootMargin - Root margin for intersection
 * @param {boolean} options.triggerOnce - Whether to trigger only once
 * @returns [ref, isVisible] - Ref to attach to element, and visibility state
 */
export function useScrollReveal(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  const setRef = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    elementRef.current = node;

    if (node) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            node.setAttribute('data-visible', 'true');
            if (triggerOnce && observerRef.current) {
              observerRef.current.unobserve(node);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
            node.removeAttribute('data-visible');
          }
        },
        { threshold, rootMargin }
      );

      observerRef.current.observe(node);
    }
  }, [threshold, rootMargin, triggerOnce]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [setRef, isVisible];
}

/**
 * useStaggeredReveal - Hook for staggered children animations
 * @param {Object} options - Configuration options
 * @param {number} options.itemCount - Number of child items
 * @param {number} options.staggerDelay - Delay between each item (ms)
 * @returns [containerRef, visibleIndices] - Ref for container, array of visible indices
 */
export function useStaggeredReveal(options = {}) {
  const {
    itemCount = 0,
    staggerDelay = 100,
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
  } = options;

  const [visibleIndices, setVisibleIndices] = useState(new Set());
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const timeoutRefs = useRef([]);

  const setRef = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    containerRef.current = node;

    if (node) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            node.setAttribute('data-visible', 'true');
            // Stagger the reveal of children
            for (let i = 0; i < itemCount; i++) {
              const timeout = setTimeout(() => {
                setVisibleIndices(prev => new Set([...prev, i]));
              }, i * staggerDelay);
              timeoutRefs.current.push(timeout);
            }

            if (triggerOnce && observerRef.current) {
              observerRef.current.unobserve(node);
            }
          } else if (!triggerOnce) {
            node.removeAttribute('data-visible');
            setVisibleIndices(new Set());
          }
        },
        { threshold, rootMargin }
      );

      observerRef.current.observe(node);
    }
  }, [itemCount, staggerDelay, threshold, rootMargin, triggerOnce]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  return [setRef, visibleIndices];
}

/**
 * useParallax - Hook for parallax scroll effects
 * @param {Object} options - Configuration options
 * @param {number} options.speed - Parallax speed (0-1, higher = faster)
 * @param {number} options.maxOffset - Maximum offset in pixels
 * @returns [ref, style] - Ref to attach, and transform style object
 */
export function useParallax(options = {}) {
  const { speed = 0.3, maxOffset = 100 } = options;
  const [offset, setOffset] = useState(0);
  const elementRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Element is in viewport
        if (rect.bottom > 0 && rect.top < viewportHeight) {
          const scrolled = (viewportHeight - rect.top) / (viewportHeight + rect.height);
          const clamped = Math.max(0, Math.min(1, scrolled));
          const calculatedOffset = Math.min(maxOffset, clamped * maxOffset * speed);
          setOffset(calculatedOffset);
        }

        rafRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [speed, maxOffset]);

  const style = {
    transform: `translateY(${offset}px)`,
    willChange: 'transform',
  };

  return [elementRef, style];
}

/**
 * useCounter - Hook for animated number counters
 * @param {number} end - Target number
 * @param {Object} options - Configuration options
 * @param {number} options.duration - Animation duration in ms
 * @param {Function} options.easing - Easing function
 * @param {boolean} options.enabled - Whether to animate
 * @returns {number} - Current animated value
 */
export function useCounter(end, options = {}) {
  const {
    duration = 1200,
    easing = (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
    enabled = true,
  } = options;

  const [value, setValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!enabled || hasAnimated) return;

    const start = performance.now();
    startTimeRef.current = start;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easing(progress);
      const current = Math.floor(eased * end);

      setValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(end);
        setHasAnimated(true);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [end, duration, easing, enabled, hasAnimated]);

  return value;
}

/**
 * useReducedMotion - Hook to detect prefers-reduced-motion preference
 * @returns {boolean} - Whether user prefers reduced motion
 */
export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handler = (event) => setPrefersReduced(event.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

export default useScrollReveal;