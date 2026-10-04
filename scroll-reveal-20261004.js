(() => {
  // Without this enhancement, every section remains readable.
  if (!('IntersectionObserver' in window) || !('animate' in Element.prototype)) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const requested = new URLSearchParams(window.location.search).get('motion');
  const isChoice = value => value === 'on' || value === 'off';
  let preference = isChoice(requested) ? requested : null;
  try {
    if (preference) localStorage.setItem('vibe-motion-preference', preference);
    else {
      const saved = localStorage.getItem('vibe-motion-preference');
      if (isChoice(saved)) preference = saved;
    }
  } catch { /* Animation remains available when storage is blocked. */ }
  // Ordinary visits get a reveal too; reduced motion uses a fade without movement.
  const enabled = preference !== 'off';
  document.documentElement.dataset.motion = enabled ? 'on' : 'off';
  const control = document.getElementById('motion-toggle');
  if (control) {
    const destination = new URL(window.location.href);
    destination.searchParams.set('motion', enabled ? 'off' : 'on');
    destination.hash = '';
    control.href = destination.href;
    control.textContent = enabled ? '關閉動態效果' : '開啟動態效果';
    control.hidden = false;
  }
  if (!enabled) return;

  // Observe each image and text block separately, including stacked mobile layouts.
  const targets = document.querySelectorAll(
    '.feature, .story-art, .story-copy, .scenarios > .section-heading, .faq > .section-heading, .release-log > .section-heading'
  );
  const pending = new Set(targets);
  const activeAnimations = new Set();
  let observer;

  const showImmediately = () => {
    observer?.disconnect();
    activeAnimations.forEach(animation => animation.cancel());
    activeAnimations.clear();
    pending.clear();
    targets.forEach(target => {
      target.classList.remove('reveal-pending');
      if (target.dataset.revealState !== 'done') target.dataset.revealState = 'skipped';
    });
  };

  try {
    observer = new IntersectionObserver(entries => {
      try {
        entries.forEach(entry => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.2 || !pending.has(entry.target)) return;
          const target = entry.target;
          observer.unobserve(target);
          pending.delete(target);
          target.classList.remove('reveal-pending');
          target.dataset.revealState = 'running';
          const fadeOnly = reducedMotion.matches && preference !== 'on';
          const frames = fadeOnly
            ? [{ opacity: 0 }, { opacity: 1 }]
            : [
                { opacity: 0, transform: 'translateY(44px)' },
                { opacity: 1, transform: 'translateY(0)' }
              ];
          const animation = target.animate(frames,
            { duration: 850, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'backwards' });
          activeAnimations.add(animation);
          animation.onfinish = animation.oncancel = () => {
            activeAnimations.delete(animation);
            target.dataset.revealState = 'done';
          };
        });
        if (pending.size === 0) observer.disconnect();
      } catch {
        showImmediately();
      }
    }, { threshold: 0.2, rootMargin: '0px 0px -80px 0px' });

    targets.forEach(target => {
      target.classList.add('reveal-pending');
      target.dataset.revealState = 'pending';
      observer.observe(target);
    });
    // Read the live system preference for each reveal, including later changes.
  } catch {
    showImmediately();
  }
})();
