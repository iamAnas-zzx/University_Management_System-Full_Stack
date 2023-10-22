//Tempelate Main JavaScript File
const headEl = document.querySelector('#header .navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY >= 56) {
    headEl.classList.add('navbar-scrolled');
  } else if (window.scrollY < 56) {
    headEl.classList.remove('navbar-scrolled');
  }
})

