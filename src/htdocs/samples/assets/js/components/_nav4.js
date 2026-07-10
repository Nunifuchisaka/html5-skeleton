const nav4 = document.querySelector(".nav_4");

if (nav4) {
  const trigger = nav4.querySelector(".nav_4__trigger");
  const megaToggles = nav4.querySelectorAll(".nav_4__megatoggle");
  // Keep in sync with $breakpoint1 (767px) in assets/css/tool/_index.scss
  const spQuery = window.matchMedia("(max-width: 767px)");

  const toggleScrolled = () => {
    nav4.classList.toggle("is_scrolled", window.scrollY > 0 && !spQuery.matches);
  };

  const setDrawer = (open) => {
    nav4.classList.toggle("is_open", open);
    if (trigger) {
      trigger.setAttribute("aria-expanded", String(open));
    }
    document.documentElement.classList.toggle("is_nav4_open", open);
  };

  const closeAll = () => {
    setDrawer(false);
    megaToggles.forEach((toggle) => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.closest("li").classList.remove("is_open");
    });
  };

  toggleScrolled();
  window.addEventListener("scroll", toggleScrolled, { passive: true });

  if (trigger) {
    trigger.addEventListener("click", () => {
      setDrawer(!nav4.classList.contains("is_open"));
    });
  }

  megaToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const li = toggle.closest("li");
      const open = !li.classList.contains("is_open");
      li.classList.toggle("is_open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
  });

  nav4.querySelectorAll(".nav_4__body a").forEach((link) => {
    link.addEventListener("click", closeAll);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav4.classList.contains("is_open")) {
      closeAll();
      if (trigger) {
        trigger.focus();
      }
    }
  });

  spQuery.addEventListener("change", () => {
    closeAll();
    toggleScrolled();
  });
}
