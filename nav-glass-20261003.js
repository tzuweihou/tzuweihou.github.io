document.querySelectorAll('.mobile-nav a').forEach(link => link.addEventListener('click', () => {
  document.querySelector('.mobile-nav').open = false;
}));
