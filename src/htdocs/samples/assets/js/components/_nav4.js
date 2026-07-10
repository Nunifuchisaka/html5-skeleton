const nav4 = document.querySelector(".nav_4");

if (nav4) {
  const toggleScrolled = () => {
    nav4.classList.toggle("is_scrolled", window.scrollY > 0);
  };

  toggleScrolled();
  window.addEventListener("scroll", toggleScrolled, { passive: true });
}
