(() => {
  const section = document.getElementById('release-log');
  if (!section) return;
  const entries = [...section.querySelectorAll('.release-entry')];
  const controls = section.querySelector('.release-log-controls');
  if (!controls || entries.length <= 4) return;
  const more = controls.querySelector('.release-more');
  const less = controls.querySelector('.release-less');
  const status = controls.querySelector('.release-log-status');
  let visible = 4;
  function render(announce = false) {
    entries.forEach((entry, index) => {
      entry.hidden = index >= visible;
      if (entry.hidden) entry.open = false;
    });
    more.hidden = visible >= entries.length;
    less.hidden = visible <= 4;
    if (announce) status.textContent = `顯示 ${visible} / ${entries.length} 個版本`;
  }
  more.addEventListener('click', () => {
    visible = Math.min(visible + 4, entries.length);
    render(true);
    if (more.hidden) less.focus({ preventScroll: true });
  });
  less.addEventListener('click', () => {
    visible = 4;
    render(true);
    more.focus({ preventScroll: true });
    more.scrollIntoView({ block: 'nearest' });
  });
  render();
  controls.hidden = false;
})();
