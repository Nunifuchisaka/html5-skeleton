const nav_1 = document.querySelector(".nav_1");

if (nav_1) {
  const trigger = nav_1.querySelector(".nav_1__trigger");
  const megaToggles = nav_1.querySelectorAll(".nav_1__megatoggle");
  const megaCloses = nav_1.querySelectorAll(".megamenu_1__close");
  // assets/css/tool/_index.scss の $breakpoint1 (767px) と同期させてください。
  const spQuery = window.matchMedia("(max-width: 767px)");

  const toggleScrolled = () => {
    nav_1.classList.toggle("is_scrolled", window.scrollY > 0 && !spQuery.matches);
  };

  const setDrawer = (open) => {
    nav_1.classList.toggle("is_open", open);
    if (trigger) {
      trigger.setAttribute("aria-expanded", String(open));
    }
    document.documentElement.classList.toggle("is_nav_1_open", open);
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
      setDrawer(!nav_1.classList.contains("is_open"));
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

  megaCloses.forEach((closeButton) => {
    const li = closeButton.closest("li");

    closeButton.addEventListener("click", () => {
      const toggle = li.querySelector(".nav_1__megatoggle");
      li.classList.remove("is_open");
      if (!spQuery.matches) {
        closeButton.blur();
      }
      // PCはホバー/focus-withinで開閉するため、hoverが残っていても閉じたままにする
      li.classList.add("is_closed");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        if (spQuery.matches) {
          toggle.focus();
        }
      }
    });

    li.addEventListener("mouseleave", () => {
      li.classList.remove("is_closed");
    });
  });

  nav_1.querySelectorAll(".nav_1__body a").forEach((link) => {
    link.addEventListener("click", closeAll);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav_1.classList.contains("is_open")) {
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
