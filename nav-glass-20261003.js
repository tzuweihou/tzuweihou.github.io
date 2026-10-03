const header = document.querySelector('.site-header');
const filter = document.querySelector('#vibe-nav-glass');
// Update only on resize, never per scroll frame.
if (filter && 'ResizeObserver' in window) {
  new ResizeObserver(() => {
    const { width, height } = header.getBoundingClientRect();
    for (const node of [filter, filter.querySelector('feImage')]) {
      node.setAttribute('width', width + 40);
      node.setAttribute('height', height + 40);
    }
  }).observe(header);
}
document.querySelectorAll('.mobile-nav a').forEach(link => link.addEventListener('click', () => {
  document.querySelector('.mobile-nav').open = false;
}));
