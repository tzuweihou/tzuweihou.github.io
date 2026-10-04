(() => {
  // The static page stays visible if this enhancement cannot run.
  if (!('IntersectionObserver' in window) || !('animate' in Element.prototype)) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;

  const sections = document.querySelectorAll(
    '.features, .story-row, .faq > .section-heading, .release-log > .section-heading'
  );
  const pending = new Set(sections);
  const activeAnimations = new Set();
  let observer;

  const showImmediately = () => {
    observer?.disconnect();
    activeAnimations.forEach(animation => animation.cancel());
    activeAnimations.clear();
  };

  try {
    observer = new IntersectionObserver(entries => {
      try {
        entries.forEach(entry => {
          if (!entry.isIntersecting || !pending.has(entry.target)) return;

          const section = entry.target;
          // Each section plays once, then leaves the observer.
          observer.unobserve(section);
          pending.delete(section);
          if (reducedMotion.matches) return;

          const story = section.matches('.story-row');
          const features = section.matches('.features');
          const targets = story
            ? section.querySelectorAll('.story-art, .story-copy')
            : features ? section.querySelectorAll('.feature') : [section];
          const distance = story ? 24 : features ? 18 : 12;
          const duration = story ? 620 : features ? 540 : 500;

          targets.forEach((target, index) => {
            const animation = target.animate([
              { opacity: 0, transform: `translateY(${distance}px)` },
              { opacity: 1, transform: 'translateY(0)' }
            ], {
              duration,
              delay: index * 80,
              easing: 'cubic-bezier(.22, 1, .36, 1)',
              // Holds delayed text briefly, without retaining an end-state layer.
              fill: 'backwards'
            });
            activeAnimations.add(animation);
            animation.onfinish = animation.oncancel = () => activeAnimations.delete(animation);
          });
        });
        if (pending.size === 0) observer.disconnect();
      } catch {
        showImmediately();
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

    sections.forEach(section => observer.observe(section));
    const onPreferenceChange = event => {
      if (event.matches) showImmediately();
    };
    if (reducedMotion.addEventListener) {
      reducedMotion.addEventListener('change', onPreferenceChange);
    } else if (reducedMotion.addListener) {
      reducedMotion.addListener(onPreferenceChange);
    }
  } catch {
    showImmediately();
  }
})();
